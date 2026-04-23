/**
 * Unit tests for LunrSearchProvider — private page filtering (#122)
 *
 * Tests that search() filters out private pages for users who are not the
 * creator or an admin, while allowing creators and admins to see their own
 * private pages in results.
 *
 * Covers:
 * - Anonymous search: private pages excluded
 * - Non-creator authenticated user: private pages excluded
 * - Page creator: private pages included
 * - Admin user: all private pages included regardless of creator
 * - Public pages: always included
 * - Mixed results: correct filtering applied per document
 */

// Opt out of the global LunrSearchProvider mock so we test the real implementation
vi.unmock('../LunrSearchProvider');

import LunrSearchProvider from '../LunrSearchProvider';

// ---------------------------------------------------------------------------
// Minimal mock engine
// ---------------------------------------------------------------------------

function makeEngine() {
  return {
    getManager: (name) => {
      if (name === 'ConfigurationManager') {
        return {
          getProperty: (key, def) => {
            if (key === 'ngdpbase.search.provider.lunr.stemming') return false;
            if (key === 'ngdpbase.search.provider.lunr.snippetlength') return 200;
            if (key.startsWith('ngdpbase.search.provider.lunr.boost')) return 1;
            if (key === 'ngdpbase.search.provider.lunr.maxresults') return 100;
            return def;
          },
          getResolvedDataPath: (_key, def) => def
        };
      }
      return null;
    }
  };
}

// ---------------------------------------------------------------------------
// Helper to build a minimal LunrDocument
// ---------------------------------------------------------------------------

function makeDoc(id, opts: {
  title?: string;
  content?: string;
  systemCategory?: string;
  userKeywords?: string;
  author?: string;
  editor?: string;
  isPrivate?: boolean;
  creator?: string;
} = {}) {
  return {
    id,
    title: opts.title ?? id,
    content: opts.content ?? `Content for ${id}`,
    body: opts.content ?? `Content for ${id}`,
    systemCategory: opts.systemCategory ?? 'general',
    userKeywords: opts.userKeywords ?? '',
    tags: '',
    keywords: opts.userKeywords ?? '',
    lastModified: '2026-01-01T00:00:00.000Z',
    uuid: `uuid-${id}`,
    author: opts.author ?? undefined,
    editor: opts.editor ?? undefined,
    isPrivate: opts.isPrivate ?? undefined,
    creator: opts.creator ?? undefined
  };
}

// ---------------------------------------------------------------------------
// Setup
// ---------------------------------------------------------------------------

let provider;

beforeEach(() => {
  provider = new LunrSearchProvider(makeEngine());

  // Inject documents including private pages
  provider['documents'] = {
    'AlicePrivatePage': makeDoc('AlicePrivatePage', { isPrivate: true, creator: 'alice', content: 'secret private content' }),
    'BobPrivatePage':   makeDoc('BobPrivatePage',   { isPrivate: true, creator: 'bob',   content: 'bob private stuff' }),
    'PublicPage':       makeDoc('PublicPage',        { content: 'public content for everyone' })
  };

  provider['config'] = {
    indexDir: '/tmp',
    stemming: false,
    boost: { title: 1, systemCategory: 1, userKeywords: 1, tags: 1, keywords: 1 },
    maxResults: 100,
    snippetLength: 200
  };

  // Mock the Lunr index to return all three documents as hits
  provider['searchIndex'] = {
    search: vi.fn().mockReturnValue([
      { ref: 'AlicePrivatePage', score: 1.0, matchData: {} },
      { ref: 'BobPrivatePage',   score: 0.9, matchData: {} },
      { ref: 'PublicPage',       score: 0.8, matchData: {} }
    ])
  };
});

// ---------------------------------------------------------------------------
// No wikiContext — treat as anonymous
// ---------------------------------------------------------------------------

describe('LunrSearchProvider.search — private filtering — no wikiContext', () => {
  test('excludes all private pages when no wikiContext provided', async () => {
    const results = await provider.search('content');
    const names = results.map(r => r.name);
    expect(names).not.toContain('AlicePrivatePage');
    expect(names).not.toContain('BobPrivatePage');
    expect(names).toContain('PublicPage');
  });

  test('returns empty array when query is empty', async () => {
    const results = await provider.search('');
    expect(results).toHaveLength(0);
  });
});

// ---------------------------------------------------------------------------
// Non-creator, non-admin user
// ---------------------------------------------------------------------------

describe('LunrSearchProvider.search — private filtering — non-creator user', () => {
  function makeWikiContext(username, roles = ['user']) {
    return { userContext: { username, roles } };
  }

  test('excludes private pages not owned by the current user', async () => {
    const wikiContext = makeWikiContext('carol');
    const results = await provider.search('content', { wikiContext });
    const names = results.map(r => r.name);
    expect(names).not.toContain('AlicePrivatePage');
    expect(names).not.toContain('BobPrivatePage');
    expect(names).toContain('PublicPage');
  });

  test('includes only the creator\'s own private page, excludes others', async () => {
    const wikiContext = makeWikiContext('alice');
    const results = await provider.search('content', { wikiContext });
    const names = results.map(r => r.name);
    expect(names).toContain('AlicePrivatePage');
    expect(names).not.toContain('BobPrivatePage');
    expect(names).toContain('PublicPage');
  });

  test('bob sees only his own private page', async () => {
    const wikiContext = makeWikiContext('bob');
    const results = await provider.search('content', { wikiContext });
    const names = results.map(r => r.name);
    expect(names).not.toContain('AlicePrivatePage');
    expect(names).toContain('BobPrivatePage');
    expect(names).toContain('PublicPage');
  });
});

// ---------------------------------------------------------------------------
// Admin user
// ---------------------------------------------------------------------------

describe('LunrSearchProvider.search — private filtering — admin user', () => {
  test('admin sees all private pages from all creators', async () => {
    const wikiContext = { userContext: { username: 'admin', roles: ['admin'] } };
    const results = await provider.search('content', { wikiContext });
    const names = results.map(r => r.name);
    expect(names).toContain('AlicePrivatePage');
    expect(names).toContain('BobPrivatePage');
    expect(names).toContain('PublicPage');
  });

  test('user with both user and admin roles is treated as admin', async () => {
    const wikiContext = { userContext: { username: 'jim', roles: ['user', 'admin'] } };
    const results = await provider.search('content', { wikiContext });
    const names = results.map(r => r.name);
    expect(names).toContain('AlicePrivatePage');
    expect(names).toContain('BobPrivatePage');
  });
});

// ---------------------------------------------------------------------------
// Public pages always visible
// ---------------------------------------------------------------------------

describe('LunrSearchProvider.search — private filtering — public pages', () => {
  test('public pages are visible to anonymous users', async () => {
    const results = await provider.search('content');
    expect(results.map(r => r.name)).toContain('PublicPage');
  });

  test('public pages are visible to authenticated non-admin users', async () => {
    const wikiContext = { userContext: { username: 'carol', roles: ['user'] } };
    const results = await provider.search('content', { wikiContext });
    expect(results.map(r => r.name)).toContain('PublicPage');
  });
});

// ---------------------------------------------------------------------------
// searchIndex null — returns empty
// ---------------------------------------------------------------------------

describe('LunrSearchProvider.search — no index', () => {
  test('returns empty array when searchIndex is null', async () => {
    provider['searchIndex'] = null;
    const results = await provider.search('content');
    expect(results).toHaveLength(0);
  });
});
