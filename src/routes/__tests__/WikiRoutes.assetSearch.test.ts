/**
 * Unit tests for WikiRoutes.assetSearch() — GET /api/assets/search
 *
 * Covers:
 *   - Auth: 403 for unauthenticated / insufficient role
 *   - 503 when AssetService is not registered
 *   - Query param forwarding (q, types, year, pageSize, offset)
 *   - pageSize cap at 200
 *   - Success response shape (spreads AssetSearchPage fields)
 *   - 500 on unexpected error
 */

import WikiRoutes from '../WikiRoutes';
import type { Request } from 'express';

function makeAssetPage(results = [], total = null, hasMore = false) {
  return {
    results,
    total: total !== null ? total : results.length,
    hasMore
  };
}

function makeAssetService(page = makeAssetPage()) {
  return { search: vi.fn().mockResolvedValue(page) };
}

function makeEngine(assetService) {
  return {
    getManager: vi.fn((name) => {
      if (name === 'AssetService') return assetService;
      return null;
    })
  };
}

function makeReq(overrides = {}) {
  return {
    userContext: { roles: ['editor'] },
    query: {},
    ...overrides
  } as unknown as Request;
}

function makeRes() {
  const res = {
    status: vi.fn().mockReturnThis(),
    json: vi.fn().mockReturnThis()
  };
  return res;
}

// WikiRoutes.createWikiContext is called in assetSearch — stub it
// #625: stub forwards userContext from the request so role checks see it
function makeRoutes(assetService) {
  const engine = makeEngine(assetService);
  const routes = new WikiRoutes(engine);
  routes.createWikiContext = vi.fn((req: Request) => {
    const userContext = (req as { userContext?: { roles?: string[]; username?: string } }).userContext;
    const roles = userContext?.roles ?? [];
    return {
      userContext,
      hasRole: (...names: string[]) => names.some(n => roles.includes(n)),
      hasPermission: async () => true,
      canAccess: async () => true,
      getPrincipals: () => userContext?.username ? [...roles, userContext.username] : [...roles]
    };
  });
  return routes;
}

describe('WikiRoutes.assetSearch — GET /api/assets/search', () => {
  describe('authentication / authorisation', () => {
    it('returns 403 when userContext is missing', async () => {
      const routes = makeRoutes(makeAssetService());
      const req = makeReq({ userContext: null });
      const res = makeRes();

      await routes.assetSearch(req, res);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: false }));
    });

    it('returns 403 when user has no relevant role', async () => {
      const routes = makeRoutes(makeAssetService());
      const req = makeReq({ userContext: { roles: ['viewer'] } });
      const res = makeRes();

      await routes.assetSearch(req, res);

      expect(res.status).toHaveBeenCalledWith(403);
    });

    it.each(['admin', 'editor', 'contributor'])(
      'allows role: %s',
      async (role) => {
        const service = makeAssetService();
        const routes = makeRoutes(service);
        const req = makeReq({ userContext: { roles: [role] }, query: {} });
        const res = makeRes();

        await routes.assetSearch(req, res);

        expect(res.status).not.toHaveBeenCalledWith(403);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true }));
      }
    );
  });

  describe('service unavailable', () => {
    it('returns 503 when AssetService is not registered', async () => {
      const engine = { getManager: vi.fn().mockReturnValue(null) };
      const routes = new WikiRoutes(engine);
      routes.createWikiContext = vi.fn((req: Request) => {
        const userContext = (req as { userContext?: { roles?: string[] } }).userContext;
        const roles = userContext?.roles ?? [];
        return {
          userContext,
          hasRole: (...names: string[]) => names.some(n => roles.includes(n)),
          hasPermission: async () => true,
          canAccess: async () => true,
          getPrincipals: () => [...roles]
        };
      });
      const req = makeReq({ query: {} });
      const res = makeRes();

      await routes.assetSearch(req, res);

      expect(res.status).toHaveBeenCalledWith(503);
    });
  });

  describe('query param forwarding', () => {
    it('passes q, types array, year, pageSize, and offset to AssetService.search()', async () => {
      const service = makeAssetService();
      const routes = makeRoutes(service);
      const req = makeReq({
        query: { q: 'beach', types: 'attachment,media', year: '2023', pageSize: '20', offset: '40' }
      });
      const res = makeRes();

      await routes.assetSearch(req, res);

      expect(service.search).toHaveBeenCalledWith(expect.objectContaining({
        query: 'beach',
        types: ['attachment', 'media'],
        year: 2023,
        pageSize: 20,
        offset: 40
      }));
    });

    it('omits types when not provided (pass undefined)', async () => {
      const service = makeAssetService();
      const routes = makeRoutes(service);
      const req = makeReq({ query: { q: 'test' } });
      const res = makeRes();

      await routes.assetSearch(req, res);

      const call = service.search.mock.calls[0][0];
      expect(call.types).toBeUndefined();
    });

    it('ignores unknown type values in types param', async () => {
      const service = makeAssetService();
      const routes = makeRoutes(service);
      const req = makeReq({ query: { types: 'media,garbage,attachment' } });
      const res = makeRes();

      await routes.assetSearch(req, res);

      const call = service.search.mock.calls[0][0];
      expect(call.types).toEqual(['media', 'attachment']);
    });

    it('caps pageSize at 200', async () => {
      const service = makeAssetService();
      const routes = makeRoutes(service);
      const req = makeReq({ query: { pageSize: '9999' } });
      const res = makeRes();

      await routes.assetSearch(req, res);

      const call = service.search.mock.calls[0][0];
      expect(call.pageSize).toBe(200);
    });

    it('defaults pageSize to 48 when not provided', async () => {
      const service = makeAssetService();
      const routes = makeRoutes(service);
      const req = makeReq({ query: {} });
      const res = makeRes();

      await routes.assetSearch(req, res);

      const call = service.search.mock.calls[0][0];
      expect(call.pageSize).toBe(48);
    });

    it('defaults offset to 0 when not provided', async () => {
      const service = makeAssetService();
      const routes = makeRoutes(service);
      const req = makeReq({ query: {} });
      const res = makeRes();

      await routes.assetSearch(req, res);

      const call = service.search.mock.calls[0][0];
      expect(call.offset).toBe(0);
    });
  });

  describe('success response', () => {
    it('spreads AssetSearchPage fields into { success: true, results, total, hasMore }', async () => {
      const fakeResults = [
        { assetType: 'attachment', id: 'a1', filename: 'photo.jpg', insertSnippet: "[{Image src='photo.jpg'}]" }
      ];
      const service = makeAssetService(makeAssetPage(fakeResults, 42, true));
      const routes = makeRoutes(service);
      const req = makeReq({ query: {} });
      const res = makeRes();

      await routes.assetSearch(req, res);

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        results: fakeResults,
        total: 42,
        hasMore: true
      });
    });
  });

  describe('error handling', () => {
    it('returns 500 when AssetService.search() throws', async () => {
      const service = { search: vi.fn().mockRejectedValue(new Error('unexpected')) };
      const routes = makeRoutes(service);
      const req = makeReq({ query: {} });
      const res = makeRes();

      await routes.assetSearch(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: false }));
    });
  });
});
