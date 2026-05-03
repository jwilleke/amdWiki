import ParseContext from '../ParseContext';
import type { WikiEngine } from '../ParseContext';

const mockEngine: WikiEngine = {
  getManager: vi.fn(() => null)
};

const make = (overrides: Record<string, unknown> = {}) =>
  new ParseContext(
    'test content',
    {
      pageName: 'TestPage',
      userContext: { isAuthenticated: true, roles: ['user'] },
      ...overrides
    },
    mockEngine
  );

describe('ParseContext.hasRole', () => {
  test('single-arg form (backward-compatible) returns true when user has role', () => {
    const ctx = make({ userContext: { roles: ['admin'] } });
    expect(ctx.hasRole('admin')).toBe(true);
  });

  test('multi-arg form returns true when user has any of the given roles', () => {
    const ctx = make({ userContext: { roles: ['editor'] } });
    expect(ctx.hasRole('admin', 'editor', 'reader')).toBe(true);
  });

  test('returns false when user has none of the given roles', () => {
    const ctx = make({ userContext: { roles: ['reader'] } });
    expect(ctx.hasRole('admin', 'editor')).toBe(false);
  });

  test('returns false when userContext is null', () => {
    const ctx = make({ userContext: null });
    expect(ctx.hasRole('admin')).toBe(false);
  });

  test('returns false when roles is missing or empty', () => {
    const noRoles = make({ userContext: { username: 'alice' } });
    const emptyRoles = make({ userContext: { roles: [] } });
    expect(noRoles.hasRole('admin')).toBe(false);
    expect(emptyRoles.hasRole('admin')).toBe(false);
  });

  test('returns false when called with no role names', () => {
    const ctx = make({ userContext: { roles: ['admin'] } });
    expect(ctx.hasRole()).toBe(false);
  });
});

describe('ParseContext.getPrincipals', () => {
  test('returns roles plus username for authenticated user', () => {
    const ctx = make({ userContext: { username: 'alice', roles: ['editor', 'reader'] } });
    expect(ctx.getPrincipals()).toEqual(['editor', 'reader', 'alice']);
  });

  test('returns roles only when no username present', () => {
    const ctx = make({ userContext: { roles: ['anonymous'] } });
    expect(ctx.getPrincipals()).toEqual(['anonymous']);
  });

  test('returns empty array when userContext is null', () => {
    const ctx = make({ userContext: null });
    expect(ctx.getPrincipals()).toEqual([]);
  });

  test('uses userName if username is absent (legacy field)', () => {
    const ctx = make({ userContext: { userName: 'alice', roles: ['editor'] } });
    expect(ctx.getPrincipals()).toEqual(['editor', 'alice']);
  });

  test('omits username when it equals "anonymous" (avoid leaking pseudo-user)', () => {
    const ctx = make({ userContext: { username: 'anonymous', roles: ['anonymous'] } });
    expect(ctx.getPrincipals()).toEqual(['anonymous']);
  });

  test('returned array does not alias userContext.roles', () => {
    const roles = ['editor'];
    const ctx = make({ userContext: { username: 'alice', roles } });
    const principals = ctx.getPrincipals();
    principals.push('mutated');
    expect(roles).toEqual(['editor']);
  });
});

// ─── #629: WikiContext delegation (Pass 1) ─────────────────────────────────

describe('ParseContext — wikiContext delegation (#629)', () => {
  // A minimal WikiContextLike fixture we can mutate during tests.
  function makeWikiContextLike(initial: {
    pageName?: string | null;
    userContext?: { username?: string; roles?: string[]; isAuthenticated?: boolean } | null;
    pageMetadata?: { title?: string; uuid?: string } | null;
  } = {}) {
    return {
      engine: mockEngine,
      pageName: initial.pageName ?? null,
      userContext: initial.userContext ?? null,
      pageMetadata: initial.pageMetadata ?? null,
      hasRole: () => false,
      hasPermission: async () => false,
      canAccess: async () => false
    };
  }

  test('wikiContext is null when constructor is called with raw context (back-compat)', () => {
    const ctx = new ParseContext(
      'content',
      { pageName: 'Direct', userContext: { username: 'alice', roles: ['editor'] } },
      mockEngine
    );
    expect(ctx.wikiContext).toBeNull();
    // Snapshot path still works
    expect(ctx.pageName).toBe('Direct');
    expect(ctx.userContext?.username).toBe('alice');
    expect(ctx.userName).toBe('alice');
  });

  test('wikiContext is wired when nested context includes it; getters delegate to it', () => {
    const wc = makeWikiContextLike({
      pageName: 'FromWiki',
      userContext: { username: 'bob', roles: ['admin'], isAuthenticated: true },
      pageMetadata: { title: 'FromWiki', uuid: 'u-1' }
    });
    const ctx = new ParseContext(
      'content',
      {
        pageContext: { pageName: 'StaleSnap', userContext: { username: 'old' } },
        engine: mockEngine,
        wikiContext: wc
      },
      mockEngine
    );
    expect(ctx.wikiContext).toBe(wc);
    // Getters return live wikiContext values, not the snapshot
    expect(ctx.pageName).toBe('FromWiki');
    expect(ctx.userContext?.username).toBe('bob');
    expect(ctx.userName).toBe('bob');
    expect(ctx.pageMetadata?.uuid).toBe('u-1');
  });

  test('mutating wikiContext after construction is visible through ParseContext getters (live binding)', () => {
    const wc = makeWikiContextLike({
      pageName: 'Initial',
      userContext: { username: 'alice', roles: ['user'] }
    });
    const ctx = new ParseContext(
      'content',
      {
        pageContext: { pageName: 'StaleSnap' },
        engine: mockEngine,
        wikiContext: wc
      },
      mockEngine
    );
    expect(ctx.pageName).toBe('Initial');

    // Mutate the wikiContext (in real usage WikiContext fields are readonly,
    // but the live-binding contract is what we're testing).
    (wc as { pageName: string }).pageName = 'MutatedLive';
    (wc as { userContext: { username: string; roles: string[] } }).userContext = {
      username: 'mallory',
      roles: ['admin']
    };

    expect(ctx.pageName).toBe('MutatedLive');
    expect(ctx.userContext?.username).toBe('mallory');
    expect(ctx.userName).toBe('mallory');
  });

  test('snapshot acts as fallback when wikiContext fields are null', () => {
    // Null pageName / userContext / pageMetadata on the wikiContext should
    // surface the constructor-time snapshot via the `??` fallback.
    const wc = makeWikiContextLike({ pageName: null, userContext: null, pageMetadata: null });
    const ctx = new ParseContext(
      'content',
      {
        pageContext: {
          pageName: 'SnapPage',
          userContext: { username: 'snapuser', roles: ['reader'] },
          pageMetadata: { title: 'SnapPage', uuid: 'u-snap' }
        },
        engine: mockEngine,
        wikiContext: wc
      },
      mockEngine
    );
    expect(ctx.pageName).toBe('SnapPage');
    expect(ctx.userContext?.username).toBe('snapuser');
    expect(ctx.pageMetadata?.uuid).toBe('u-snap');
  });

  test('clone() preserves the wikiContext reference', () => {
    const wc = makeWikiContextLike({
      pageName: 'Parent',
      userContext: { username: 'alice', roles: ['admin'] }
    });
    const parent = new ParseContext(
      'parent content',
      {
        pageContext: { pageName: 'ParentSnap' },
        engine: mockEngine,
        wikiContext: wc
      },
      mockEngine
    );
    const child = parent.clone();
    expect(child.wikiContext).toBe(wc);
    expect(child.pageName).toBe('Parent');
    expect(child.userName).toBe('alice');
  });
});
