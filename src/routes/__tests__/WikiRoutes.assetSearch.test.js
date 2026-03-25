/**
 * Unit tests for WikiRoutes.assetSearch() — GET /api/assets/search
 *
 * Covers:
 *   - Auth: 403 for unauthenticated / insufficient role
 *   - 503 when AssetService is not registered
 *   - Query param forwarding (q, types, year, max)
 *   - max cap at 200
 *   - Success response shape
 *   - 500 on unexpected error
 */

const WikiRoutes = require('../WikiRoutes');

function makeAssetService(results = []) {
  return { search: jest.fn().mockResolvedValue(results) };
}

function makeEngine(assetService) {
  return {
    getManager: jest.fn((name) => {
      if (name === 'AssetService') return assetService;
      return null;
    }),
  };
}

function makeReq(overrides = {}) {
  return {
    userContext: { roles: ['editor'] },
    query: {},
    ...overrides,
  };
}

function makeRes() {
  const res = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
  };
  return res;
}

// WikiRoutes.createWikiContext is called in assetSearch — stub it
function makeRoutes(assetService) {
  const engine = makeEngine(assetService);
  const routes = new WikiRoutes(engine);
  routes.createWikiContext = jest.fn().mockReturnValue({ userContext: {} });
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
        const service = makeAssetService([]);
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
      const engine = { getManager: jest.fn().mockReturnValue(null) };
      const routes = new WikiRoutes(engine);
      routes.createWikiContext = jest.fn().mockReturnValue({});
      const req = makeReq({ query: {} });
      const res = makeRes();

      await routes.assetSearch(req, res);

      expect(res.status).toHaveBeenCalledWith(503);
    });
  });

  describe('query param forwarding', () => {
    it('passes q, types array, year, and max to AssetService.search()', async () => {
      const service = makeAssetService([]);
      const routes = makeRoutes(service);
      const req = makeReq({ query: { q: 'beach', types: 'attachment,media', year: '2023', max: '20' } });
      const res = makeRes();

      await routes.assetSearch(req, res);

      expect(service.search).toHaveBeenCalledWith(expect.objectContaining({
        query: 'beach',
        types: ['attachment', 'media'],
        year: 2023,
        max: 20,
      }));
    });

    it('omits types when not provided (pass undefined)', async () => {
      const service = makeAssetService([]);
      const routes = makeRoutes(service);
      const req = makeReq({ query: { q: 'test' } });
      const res = makeRes();

      await routes.assetSearch(req, res);

      const call = service.search.mock.calls[0][0];
      expect(call.types).toBeUndefined();
    });

    it('ignores unknown type values in types param', async () => {
      const service = makeAssetService([]);
      const routes = makeRoutes(service);
      const req = makeReq({ query: { types: 'media,garbage,attachment' } });
      const res = makeRes();

      await routes.assetSearch(req, res);

      const call = service.search.mock.calls[0][0];
      expect(call.types).toEqual(['media', 'attachment']);
    });

    it('caps max at 200', async () => {
      const service = makeAssetService([]);
      const routes = makeRoutes(service);
      const req = makeReq({ query: { max: '9999' } });
      const res = makeRes();

      await routes.assetSearch(req, res);

      const call = service.search.mock.calls[0][0];
      expect(call.max).toBe(200);
    });

    it('defaults max to 50 when not provided', async () => {
      const service = makeAssetService([]);
      const routes = makeRoutes(service);
      const req = makeReq({ query: {} });
      const res = makeRes();

      await routes.assetSearch(req, res);

      const call = service.search.mock.calls[0][0];
      expect(call.max).toBe(50);
    });
  });

  describe('success response', () => {
    it('returns { success: true, results, total } on success', async () => {
      const fakeResults = [
        { assetType: 'attachment', id: 'a1', filename: 'photo.jpg', insertSnippet: "[{Image src='photo.jpg'}]" },
      ];
      const service = makeAssetService(fakeResults);
      const routes = makeRoutes(service);
      const req = makeReq({ query: {} });
      const res = makeRes();

      await routes.assetSearch(req, res);

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        results: fakeResults,
        total: 1,
      });
    });
  });

  describe('error handling', () => {
    it('returns 500 when AssetService.search() throws', async () => {
      const service = { search: jest.fn().mockRejectedValue(new Error('unexpected')) };
      const routes = makeRoutes(service);
      const req = makeReq({ query: {} });
      const res = makeRes();

      await routes.assetSearch(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: false }));
    });
  });
});
