/**
 * Unit tests for WikiRoutes — author-lock enforcement in editPage()
 *
 * The author-lock flag (metadata['author-lock'] = true) on a page means:
 * - Only the page author and admins may open the edit form
 * - Everyone else gets a 403, even if their ACL role permits "edit" in general
 *
 * Strategy:
 *   Spy on infrastructure methods (createWikiContext, checkPrivatePageAccess,
 *   isRequiredPage, renderError) so tests focus purely on the author-lock
 *   branch rather than re-testing the surrounding pipeline.
 *
 * Covers:
 * - Non-author, non-admin receives 403 when author-lock is set
 * - Page author can pass the author-lock gate
 * - Admin can pass the author-lock gate
 * - No lock set → author-lock gate is skipped entirely
 */

import WikiRoutes from '../WikiRoutes';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const PAGE_NAME   = 'TestLockedPage';
const PAGE_AUTHOR = 'alice';
const PAGE_UUID   = 'uuid-locked-abc123';

// ---------------------------------------------------------------------------
// Mock factories
// ---------------------------------------------------------------------------

function makePageData({ authorLock = true, author = PAGE_AUTHOR } = {}) {
  return {
    content: '# Locked Page\n\nSome content.',
    metadata: {
      uuid:   PAGE_UUID,
      title:  PAGE_NAME,
      author,
      ...(authorLock ? { 'author-lock': true } : {})
    }
  };
}

function makePageManager(pageData) {
  return {
    getPage:         jest.fn().mockResolvedValue(pageData),
    getPageMetadata: jest.fn().mockResolvedValue(pageData?.metadata ?? null),
    pageExists:      jest.fn().mockReturnValue(true),
    getCurrentPageProvider: jest.fn().mockReturnValue({
      pageIndex: { pages: { [PAGE_UUID]: { location: 'public', creator: PAGE_AUTHOR } } }
    })
  };
}

function makeACLManager(permitted = true) {
  return {
    checkPagePermissionWithContext: jest.fn().mockResolvedValue(permitted)
  };
}

function makeConfigManager() {
  return {
    getProperty: jest.fn((key, defaultValue) => {
      if (key === 'ngdpbase.system-category') {
        return {
          general:    { label: 'general',    storageLocation: 'regular',  enabled: true },
          'user pages': { label: 'user pages', storageLocation: 'regular',  enabled: true }
        };
      }
      if (key === 'ngdpbase.theme.active') return 'default';
      return defaultValue;
    })
  };
}

function makeEngine({ pageManager = undefined, aclManager = undefined, configManager = undefined }: {
  pageManager?: ReturnType<typeof makePageManager>;
  aclManager?: ReturnType<typeof makeACLManager>;
  configManager?: ReturnType<typeof makeConfigManager>;
} = {}) {
  const pm  = pageManager  ?? makePageManager(makePageData());
  const acl = aclManager   ?? makeACLManager(true);
  const cm  = configManager ?? makeConfigManager();

  return {
    getManager: jest.fn((name) => {
      switch (name) {
      case 'PageManager':          return pm;
      case 'ACLManager':           return acl;
      case 'ConfigurationManager': return cm;
      default:                     return null;
      }
    })
  };
}

function createReq(userContext, params = {}) {
  return {
    params:      { page: PAGE_NAME, ...params },
    session:     {},
    path:        `/edit/${PAGE_NAME}`,
    originalUrl: `/edit/${PAGE_NAME}`,
    userContext,
    headers:     { accept: 'text/html' },
    query:       {}
  };
}

function createRes() {
  return {
    status:   jest.fn().mockReturnThis(),
    json:     jest.fn().mockReturnThis(),
    send:     jest.fn().mockReturnThis(),
    render:   jest.fn().mockReturnThis(),
    redirect: jest.fn().mockReturnThis()
  };
}

/**
 * Install spies that bypass infrastructure not under test:
 * - createWikiContext → returns a plain object with the given userContext
 * - checkPrivatePageAccess → always allow
 * - isRequiredPage → always false (normal user page)
 * - renderError → calls res.status(code).render('error', { code }) directly
 */
function installSpies(wikiRoutes, userContext) {
  jest.spyOn(wikiRoutes, 'createWikiContext').mockReturnValue({ userContext });
  jest.spyOn(wikiRoutes, 'checkPrivatePageAccess').mockResolvedValue(true);
  jest.spyOn(wikiRoutes, 'isRequiredPage').mockResolvedValue(false);
  jest.spyOn(wikiRoutes, 'renderError').mockImplementation(
    async (_req, res, code, _title, _message) => {
      res.status(code).render('error', { code });
    }
  );
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('WikiRoutes — author-lock enforcement in editPage()', () => {
  let wikiRoutes;

  afterEach(() => {
    jest.restoreAllMocks();
  });

  // ── Denied access ───────────────────────────────────────────────────────

  describe('when page is author-locked', () => {
    beforeEach(() => {
      wikiRoutes = new WikiRoutes(makeEngine());
    });

    test('non-author, non-admin receives 403', async () => {
      const user = { username: 'bob', roles: ['editor'], isAuthenticated: true };
      installSpies(wikiRoutes, user);

      const req = createReq(user);
      const res = createRes();

      await wikiRoutes.editPage(req, res);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.render).toHaveBeenCalledWith('error', expect.objectContaining({ code: 403 }));
    });

    test('reader who is not the author receives 403', async () => {
      const user = { username: 'carol', roles: ['reader'], isAuthenticated: true };
      installSpies(wikiRoutes, user);

      const req = createReq(user);
      const res = createRes();

      await wikiRoutes.editPage(req, res);

      expect(res.status).toHaveBeenCalledWith(403);
    });
  });

  // ── Permitted access ────────────────────────────────────────────────────

  describe('when page is author-locked but user is the author', () => {
    test('page author passes the author-lock gate (no 403 from lock)', async () => {
      wikiRoutes = new WikiRoutes(makeEngine());
      const user = { username: PAGE_AUTHOR, roles: ['reader'], isAuthenticated: true };
      installSpies(wikiRoutes, user);

      const req = createReq(user);
      const res = createRes();

      await wikiRoutes.editPage(req, res);

      // renderError must NOT have been called with 403
      expect(res.status).not.toHaveBeenCalledWith(403);
    });
  });

  describe('when page is author-locked but user is an admin', () => {
    test('admin passes the author-lock gate regardless of authorship', async () => {
      wikiRoutes = new WikiRoutes(makeEngine());
      const user = { username: 'superadmin', roles: ['admin'], isAuthenticated: true };
      installSpies(wikiRoutes, user);

      const req = createReq(user);
      const res = createRes();

      await wikiRoutes.editPage(req, res);

      expect(res.status).not.toHaveBeenCalledWith(403);
    });
  });

  // ── No lock ─────────────────────────────────────────────────────────────

  describe('when page has no author-lock', () => {
    test('any ACL-permitted user is not blocked by the author-lock gate', async () => {
      const pageData    = makePageData({ authorLock: false });
      const pageManager = makePageManager(pageData);
      const engine      = makeEngine({ pageManager });
      wikiRoutes        = new WikiRoutes(engine);

      const user = { username: 'carol', roles: ['editor'], isAuthenticated: true };
      installSpies(wikiRoutes, user);

      const req = createReq(user);
      const res = createRes();

      await wikiRoutes.editPage(req, res);

      // No 403 from the author-lock branch
      expect(res.status).not.toHaveBeenCalledWith(403);
    });
  });
});
