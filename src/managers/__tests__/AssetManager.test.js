/**
 * Unit tests for AssetManager — provider registry (#435) + health checking (#437)
 *
 * Covers:
 *   - registerProvider(): add, replace (duplicate id)
 *   - getProvider(): found / not found
 *   - getProviders(): registration order preserved
 *   - search(): fan-out across all providers, per-provider filter, graceful error
 *   - getById(): first-match across providers, per-provider lookup
 *   - getThumbnail(): capability guard, delegation, error handling
 *   - checkProviderHealth(): runs healthCheck(), updates health map
 *   - getProviderHealth(): returns ProviderHealthReport[] for admin UI
 *   - search() / getById(): skip degraded providers in fan-out
 *   - initialize(): auto-registers providers from AttachmentManager and MediaManager
 *   - Plugin registration pattern: provider registered after initialize() participates in fan-out
 */

const AssetManager = (() => {
  const mod = require('../AssetManager');
  return mod.default ?? mod;
})();

// ---------------------------------------------------------------------------
// Fixture provider factory
// ---------------------------------------------------------------------------

function makeProvider(overrides = {}) {
  return {
    id: 'test-fixture',
    displayName: 'Test Fixture Provider',
    capabilities: ['search'],
    search: jest.fn().mockResolvedValue({ results: [], total: 0, hasMore: false }),
    getById: jest.fn().mockResolvedValue(null),
    ...overrides,
  };
}

function makeAssetRecord(overrides = {}) {
  return {
    id: 'asset-1',
    providerId: 'test-fixture',
    filename: 'photo.jpg',
    encodingFormat: 'image/jpeg',
    url: '/test/photo.jpg',
    keywords: [],
    mentions: [],
    metadata: {},
    insertSnippet: "[{Image src='photo.jpg'}]",
    ...overrides,
  };
}

function makeEngine({ attachmentProvider, mediaProvider } = {}) {
  return {
    getManager: jest.fn((name) => {
      if (name === 'AttachmentManager') {
        return attachmentProvider ? { provider: attachmentProvider } : undefined;
      }
      if (name === 'MediaManager') {
        return mediaProvider ? { provider: mediaProvider } : undefined;
      }
      return undefined;
    }),
  };
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeManager(engineOpts = {}) {
  const engine = makeEngine(engineOpts);
  const manager = new AssetManager(engine);
  return { manager, engine };
}

// ---------------------------------------------------------------------------
// registerProvider
// ---------------------------------------------------------------------------

describe('AssetManager.registerProvider()', () => {
  it('adds a provider to the registry', () => {
    const { manager } = makeManager();
    const provider = makeProvider();

    manager.registerProvider(provider);

    expect(manager.getProvider('test-fixture')).toBe(provider);
  });

  it('replaces an existing provider with the same id', () => {
    const { manager } = makeManager();
    const original = makeProvider({ displayName: 'Original' });
    const replacement = makeProvider({ displayName: 'Replacement' });

    manager.registerProvider(original);
    manager.registerProvider(replacement);

    expect(manager.getProvider('test-fixture')).toBe(replacement);
  });

  it('registering multiple providers with different ids keeps both', () => {
    const { manager } = makeManager();
    const p1 = makeProvider({ id: 'p1' });
    const p2 = makeProvider({ id: 'p2' });

    manager.registerProvider(p1);
    manager.registerProvider(p2);

    expect(manager.getProvider('p1')).toBe(p1);
    expect(manager.getProvider('p2')).toBe(p2);
  });
});

// ---------------------------------------------------------------------------
// getProvider / getProviders
// ---------------------------------------------------------------------------

describe('AssetManager.getProvider()', () => {
  it('returns null for an unknown id', () => {
    const { manager } = makeManager();
    expect(manager.getProvider('nonexistent')).toBeNull();
  });

  it('returns the provider after registration', () => {
    const { manager } = makeManager();
    const provider = makeProvider();
    manager.registerProvider(provider);
    expect(manager.getProvider('test-fixture')).toBe(provider);
  });
});

describe('AssetManager.getProviders()', () => {
  it('returns empty array when no providers registered', () => {
    const { manager } = makeManager();
    expect(manager.getProviders()).toEqual([]);
  });

  it('returns providers in registration order', () => {
    const { manager } = makeManager();
    const p1 = makeProvider({ id: 'alpha' });
    const p2 = makeProvider({ id: 'beta' });
    const p3 = makeProvider({ id: 'gamma' });

    manager.registerProvider(p1);
    manager.registerProvider(p2);
    manager.registerProvider(p3);

    const ids = manager.getProviders().map(p => p.id);
    expect(ids).toEqual(['alpha', 'beta', 'gamma']);
  });
});

// ---------------------------------------------------------------------------
// search — fan-out
// ---------------------------------------------------------------------------

describe('AssetManager.search()', () => {
  it('returns AssetPage shape { results, total, hasMore }', async () => {
    const { manager } = makeManager();
    manager.registerProvider(makeProvider());

    const page = await manager.search();

    expect(page).toHaveProperty('results');
    expect(page).toHaveProperty('total');
    expect(page).toHaveProperty('hasMore');
    expect(Array.isArray(page.results)).toBe(true);
  });

  it('returns empty page when no providers registered', async () => {
    const { manager } = makeManager();

    const page = await manager.search();

    expect(page.results).toEqual([]);
    expect(page.total).toBe(0);
    expect(page.hasMore).toBe(false);
  });

  it('fans out to all registered providers', async () => {
    const { manager } = makeManager();
    const p1 = makeProvider({ id: 'p1', search: jest.fn().mockResolvedValue({ results: [makeAssetRecord({ id: 'a1', providerId: 'p1' })], total: 1, hasMore: false }) });
    const p2 = makeProvider({ id: 'p2', search: jest.fn().mockResolvedValue({ results: [makeAssetRecord({ id: 'a2', providerId: 'p2' })], total: 1, hasMore: false }) });

    manager.registerProvider(p1);
    manager.registerProvider(p2);

    const page = await manager.search();

    expect(p1.search).toHaveBeenCalled();
    expect(p2.search).toHaveBeenCalled();
    const ids = page.results.map(r => r.id);
    expect(ids).toContain('a1');
    expect(ids).toContain('a2');
    expect(page.total).toBe(2);
  });

  it('scopes search to a single provider when providerId is given', async () => {
    const { manager } = makeManager();
    const p1 = makeProvider({ id: 'p1' });
    const p2 = makeProvider({ id: 'p2', search: jest.fn().mockResolvedValue({ results: [makeAssetRecord({ id: 'a2', providerId: 'p2' })], total: 1, hasMore: false }) });

    manager.registerProvider(p1);
    manager.registerProvider(p2);

    const page = await manager.search({ providerId: 'p2' });

    expect(p1.search).not.toHaveBeenCalled();
    expect(p2.search).toHaveBeenCalled();
    expect(page.results.every(r => r.providerId === 'p2')).toBe(true);
  });

  it('returns empty page for unknown providerId', async () => {
    const { manager } = makeManager();
    manager.registerProvider(makeProvider({ id: 'p1' }));

    const page = await manager.search({ providerId: 'unknown' });

    expect(page.results).toEqual([]);
    expect(page.total).toBe(0);
  });

  it('skips a failing provider and returns results from others', async () => {
    const { manager } = makeManager();
    const failing = makeProvider({ id: 'bad', search: jest.fn().mockRejectedValue(new Error('network error')) });
    const healthy = makeProvider({ id: 'good', search: jest.fn().mockResolvedValue({ results: [makeAssetRecord({ id: 'a1', providerId: 'good' })], total: 1, hasMore: false }) });

    manager.registerProvider(failing);
    manager.registerProvider(healthy);

    const page = await manager.search();

    expect(page.results).toHaveLength(1);
    expect(page.results[0].providerId).toBe('good');
  });

  it('respects pageSize and sets hasMore', async () => {
    const { manager } = makeManager();
    const records = Array.from({ length: 10 }, (_, i) =>
      makeAssetRecord({ id: `a${i}`, dateCreated: `2024-01-0${(i % 9) + 1}T00:00:00Z` })
    );
    const provider = makeProvider({ search: jest.fn().mockResolvedValue({ results: records, total: 10, hasMore: false }) });
    manager.registerProvider(provider);

    const page = await manager.search({ pageSize: 3 });

    expect(page.results).toHaveLength(3);
    expect(page.total).toBe(10);
    expect(page.hasMore).toBe(true);
  });

  it('hasMore is false when all results fit on one page', async () => {
    const { manager } = makeManager();
    const provider = makeProvider({ search: jest.fn().mockResolvedValue({ results: [makeAssetRecord()], total: 1, hasMore: false }) });
    manager.registerProvider(provider);

    const page = await manager.search({ pageSize: 10 });

    expect(page.hasMore).toBe(false);
  });

  it('a provider registered after initialize() participates in fan-out (plugin pattern)', async () => {
    const attachmentProvider = makeProvider({ id: 'local', search: jest.fn().mockResolvedValue({ results: [makeAssetRecord({ id: 'att-1', providerId: 'local' })], total: 1, hasMore: false }) });
    const { manager } = makeManager({ attachmentProvider });

    await manager.initialize();

    // Simulate an addon registering its provider after engine startup
    const pluginProvider = makeProvider({
      id: 'plugin-store',
      displayName: 'Plugin Asset Store',
      search: jest.fn().mockResolvedValue({ results: [makeAssetRecord({ id: 'plugin-1', providerId: 'plugin-store' })], total: 1, hasMore: false }),
    });
    manager.registerProvider(pluginProvider);

    const page = await manager.search();

    const ids = page.results.map(r => r.id);
    expect(ids).toContain('att-1');
    expect(ids).toContain('plugin-1');
    expect(pluginProvider.search).toHaveBeenCalled();
  });
});

// ---------------------------------------------------------------------------
// getById
// ---------------------------------------------------------------------------

describe('AssetManager.getById()', () => {
  it('returns null when no providers registered', async () => {
    const { manager } = makeManager();
    expect(await manager.getById('nonexistent')).toBeNull();
  });

  it('returns the first matching record across providers', async () => {
    const { manager } = makeManager();
    const record = makeAssetRecord({ id: 'found-1' });
    const p1 = makeProvider({ id: 'p1', getById: jest.fn().mockResolvedValue(null) });
    const p2 = makeProvider({ id: 'p2', getById: jest.fn().mockResolvedValue(record) });
    const p3 = makeProvider({ id: 'p3', getById: jest.fn().mockResolvedValue(makeAssetRecord({ id: 'other' })) });

    manager.registerProvider(p1);
    manager.registerProvider(p2);
    manager.registerProvider(p3);

    const result = await manager.getById('found-1');

    expect(result).toBe(record);
    // Short-circuits — p3 should not be called once p2 returned a match
    expect(p3.getById).not.toHaveBeenCalled();
  });

  it('scopes lookup to a specific provider when providerId given', async () => {
    const { manager } = makeManager();
    const record = makeAssetRecord({ id: 'a1', providerId: 'p2' });
    const p1 = makeProvider({ id: 'p1', getById: jest.fn().mockResolvedValue(makeAssetRecord({ id: 'a1', providerId: 'p1' })) });
    const p2 = makeProvider({ id: 'p2', getById: jest.fn().mockResolvedValue(record) });

    manager.registerProvider(p1);
    manager.registerProvider(p2);

    const result = await manager.getById('a1', 'p2');

    expect(result).toBe(record);
    expect(p1.getById).not.toHaveBeenCalled();
  });

  it('returns null when provider throws', async () => {
    const { manager } = makeManager();
    manager.registerProvider(makeProvider({ getById: jest.fn().mockRejectedValue(new Error('fail')) }));

    expect(await manager.getById('any')).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// getThumbnail
// ---------------------------------------------------------------------------

describe('AssetManager.getThumbnail()', () => {
  it('returns null for an unknown providerId', async () => {
    const { manager } = makeManager();
    expect(await manager.getThumbnail('id', 'nonexistent')).toBeNull();
  });

  it('returns null when provider does not declare thumbnail capability', async () => {
    const { manager } = makeManager();
    const provider = makeProvider({ id: 'p1', capabilities: ['search'] }); // no 'thumbnail'
    manager.registerProvider(provider);

    expect(await manager.getThumbnail('id', 'p1')).toBeNull();
  });

  it('delegates to provider.getThumbnail() when capability is declared', async () => {
    const { manager } = makeManager();
    const buf = Buffer.from('fake-image');
    const provider = makeProvider({
      id: 'p1',
      capabilities: ['search', 'thumbnail'],
      getThumbnail: jest.fn().mockResolvedValue(buf),
    });
    manager.registerProvider(provider);

    const result = await manager.getThumbnail('asset-1', 'p1', '200x200');

    expect(result).toBe(buf);
    expect(provider.getThumbnail).toHaveBeenCalledWith('asset-1', '200x200');
  });

  it('returns null when provider.getThumbnail() throws', async () => {
    const { manager } = makeManager();
    const provider = makeProvider({
      id: 'p1',
      capabilities: ['thumbnail'],
      getThumbnail: jest.fn().mockRejectedValue(new Error('sharp error')),
    });
    manager.registerProvider(provider);

    expect(await manager.getThumbnail('id', 'p1')).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// initialize — auto-registration from engine managers
// ---------------------------------------------------------------------------

describe('AssetManager.initialize()', () => {
  it('registers AttachmentManager provider when present', async () => {
    const attachmentProvider = makeProvider({ id: 'local', displayName: 'Local Attachments' });
    const { manager } = makeManager({ attachmentProvider });

    await manager.initialize();

    expect(manager.getProvider('local')).toBe(attachmentProvider);
  });

  it('registers MediaManager provider when present', async () => {
    const mediaProvider = makeProvider({ id: 'media-library', displayName: 'Media Library' });
    const { manager } = makeManager({ mediaProvider });

    await manager.initialize();

    expect(manager.getProvider('media-library')).toBe(mediaProvider);
  });

  it('registers both built-in providers when both managers are present', async () => {
    const attachmentProvider = makeProvider({ id: 'local' });
    const mediaProvider = makeProvider({ id: 'media-library' });
    const { manager } = makeManager({ attachmentProvider, mediaProvider });

    await manager.initialize();

    expect(manager.getProviders()).toHaveLength(2);
    expect(manager.getProvider('local')).toBe(attachmentProvider);
    expect(manager.getProvider('media-library')).toBe(mediaProvider);
  });

  it('initializes cleanly when AttachmentManager has no provider', async () => {
    const engine = makeEngine(); // neither manager has a provider
    const manager = new AssetManager(engine);

    await expect(manager.initialize()).resolves.not.toThrow();
    expect(manager.getProviders()).toHaveLength(0);
  });

  it('initializes cleanly when MediaManager is absent', async () => {
    const attachmentProvider = makeProvider({ id: 'local' });
    // mediaProvider not set → MediaManager returns undefined
    const { manager } = makeManager({ attachmentProvider });

    await manager.initialize();

    expect(manager.getProviders()).toHaveLength(1);
  });

  it('runs health check during initialize() — healthy provider is marked healthy', async () => {
    const attachmentProvider = makeProvider({
      id: 'local',
      healthCheck: jest.fn().mockResolvedValue(true),
    });
    const { manager } = makeManager({ attachmentProvider });

    await manager.initialize();

    const report = manager.getProviderHealth().find(r => r.providerId === 'local');
    expect(report.status).toBe('healthy');
    expect(attachmentProvider.healthCheck).toHaveBeenCalled();
  });

  it('runs health check during initialize() — degraded provider is marked degraded', async () => {
    const attachmentProvider = makeProvider({
      id: 'local',
      healthCheck: jest.fn().mockResolvedValue(false),
    });
    const { manager } = makeManager({ attachmentProvider });

    await manager.initialize();

    const report = manager.getProviderHealth().find(r => r.providerId === 'local');
    expect(report.status).toBe('degraded');
  });
});

// ---------------------------------------------------------------------------
// checkProviderHealth
// ---------------------------------------------------------------------------

describe('AssetManager.checkProviderHealth()', () => {
  it('marks provider healthy when healthCheck() returns true', async () => {
    const { manager } = makeManager();
    const provider = makeProvider({ healthCheck: jest.fn().mockResolvedValue(true) });
    manager.registerProvider(provider);

    await manager.checkProviderHealth();

    const [report] = manager.getProviderHealth();
    expect(report.status).toBe('healthy');
    expect(report.checkedAt).toBeDefined();
  });

  it('marks provider degraded when healthCheck() returns false', async () => {
    const { manager } = makeManager();
    const provider = makeProvider({ healthCheck: jest.fn().mockResolvedValue(false) });
    manager.registerProvider(provider);

    await manager.checkProviderHealth();

    const [report] = manager.getProviderHealth();
    expect(report.status).toBe('degraded');
    expect(report.error).toBeDefined();
  });

  it('marks provider degraded when healthCheck() throws (e.g. NAS/SMB unmounted)', async () => {
    const { manager } = makeManager();
    const provider = makeProvider({ healthCheck: jest.fn().mockRejectedValue(new Error('ENOENT: volume not mounted')) });
    manager.registerProvider(provider);

    await manager.checkProviderHealth();

    const [report] = manager.getProviderHealth();
    expect(report.status).toBe('degraded');
    expect(report.error).toMatch('ENOENT');
  });

  it('marks provider healthy when it has no healthCheck method', async () => {
    const { manager } = makeManager();
    const provider = makeProvider(); // no healthCheck property
    delete provider.healthCheck;
    manager.registerProvider(provider);

    await manager.checkProviderHealth();

    const [report] = manager.getProviderHealth();
    expect(report.status).toBe('healthy');
  });

  it('updates status from degraded to healthy after recovery', async () => {
    const { manager } = makeManager();
    const healthCheck = jest.fn().mockResolvedValueOnce(false).mockResolvedValueOnce(true);
    const provider = makeProvider({ healthCheck });
    manager.registerProvider(provider);

    await manager.checkProviderHealth();
    expect(manager.getProviderHealth()[0].status).toBe('degraded');

    await manager.checkProviderHealth();
    expect(manager.getProviderHealth()[0].status).toBe('healthy');
  });

  it('checks all registered providers independently', async () => {
    const { manager } = makeManager();
    const healthy = makeProvider({ id: 'p-healthy', healthCheck: jest.fn().mockResolvedValue(true) });
    const degraded = makeProvider({ id: 'p-degraded', healthCheck: jest.fn().mockResolvedValue(false) });
    manager.registerProvider(healthy);
    manager.registerProvider(degraded);

    await manager.checkProviderHealth();

    const reports = manager.getProviderHealth();
    expect(reports.find(r => r.providerId === 'p-healthy').status).toBe('healthy');
    expect(reports.find(r => r.providerId === 'p-degraded').status).toBe('degraded');
  });
});

// ---------------------------------------------------------------------------
// getProviderHealth — ProviderHealthReport shape
// ---------------------------------------------------------------------------

describe('AssetManager.getProviderHealth()', () => {
  it('returns unknown status before any health check has run', () => {
    const { manager } = makeManager();
    manager.registerProvider(makeProvider({ id: 'p1' }));

    const reports = manager.getProviderHealth();

    expect(reports).toHaveLength(1);
    expect(reports[0].status).toBe('unknown');
    expect(reports[0].providerId).toBe('p1');
    expect(reports[0].displayName).toBe('Test Fixture Provider');
    expect(reports[0].checkedAt).toBeUndefined();
  });

  it('returns one report per registered provider', async () => {
    const { manager } = makeManager();
    manager.registerProvider(makeProvider({ id: 'p1', healthCheck: jest.fn().mockResolvedValue(true) }));
    manager.registerProvider(makeProvider({ id: 'p2', healthCheck: jest.fn().mockResolvedValue(true) }));
    manager.registerProvider(makeProvider({ id: 'p3', healthCheck: jest.fn().mockResolvedValue(false) }));

    await manager.checkProviderHealth();

    expect(manager.getProviderHealth()).toHaveLength(3);
  });

  it('report includes checkedAt ISO timestamp after health check', async () => {
    const { manager } = makeManager();
    manager.registerProvider(makeProvider({ healthCheck: jest.fn().mockResolvedValue(true) }));

    await manager.checkProviderHealth();

    const [report] = manager.getProviderHealth();
    expect(report.checkedAt).toMatch(/^\d{4}-\d{2}-\d{2}T/);
  });

  it('report includes error message for degraded provider', async () => {
    const { manager } = makeManager();
    manager.registerProvider(makeProvider({ healthCheck: jest.fn().mockRejectedValue(new Error('volume offline')) }));

    await manager.checkProviderHealth();

    const [report] = manager.getProviderHealth();
    expect(report.error).toBe('volume offline');
  });

  it('error is undefined for healthy provider', async () => {
    const { manager } = makeManager();
    manager.registerProvider(makeProvider({ healthCheck: jest.fn().mockResolvedValue(true) }));

    await manager.checkProviderHealth();

    const [report] = manager.getProviderHealth();
    expect(report.error).toBeUndefined();
  });
});

// ---------------------------------------------------------------------------
// Degraded provider skipping in fan-out
// ---------------------------------------------------------------------------

describe('degraded provider skipping', () => {
  it('search() skips degraded provider and returns results from healthy ones', async () => {
    const { manager } = makeManager();
    const degraded = makeProvider({
      id: 'p-nas',
      healthCheck: jest.fn().mockResolvedValue(false),
      search: jest.fn().mockResolvedValue({ results: [makeAssetRecord({ id: 'nas-1', providerId: 'p-nas' })], total: 1, hasMore: false }),
    });
    const healthy = makeProvider({
      id: 'p-local',
      healthCheck: jest.fn().mockResolvedValue(true),
      search: jest.fn().mockResolvedValue({ results: [makeAssetRecord({ id: 'local-1', providerId: 'p-local' })], total: 1, hasMore: false }),
    });

    manager.registerProvider(degraded);
    manager.registerProvider(healthy);
    await manager.checkProviderHealth();

    const page = await manager.search();

    expect(degraded.search).not.toHaveBeenCalled();
    expect(healthy.search).toHaveBeenCalled();
    expect(page.results.map(r => r.id)).toEqual(['local-1']);
  });

  it('getById() skips degraded provider', async () => {
    const { manager } = makeManager();
    const record = makeAssetRecord({ id: 'a1', providerId: 'p-local' });
    const degraded = makeProvider({
      id: 'p-nas',
      healthCheck: jest.fn().mockResolvedValue(false),
      getById: jest.fn().mockResolvedValue(makeAssetRecord({ id: 'a1', providerId: 'p-nas' })),
    });
    const healthy = makeProvider({
      id: 'p-local',
      healthCheck: jest.fn().mockResolvedValue(true),
      getById: jest.fn().mockResolvedValue(record),
    });

    manager.registerProvider(degraded);
    manager.registerProvider(healthy);
    await manager.checkProviderHealth();

    const result = await manager.getById('a1');

    expect(degraded.getById).not.toHaveBeenCalled();
    expect(result).toBe(record);
  });

  it('provider with unknown health status is allowed through (not yet checked)', async () => {
    const { manager } = makeManager();
    // Register but do NOT call checkProviderHealth → status stays 'unknown'
    const provider = makeProvider({
      id: 'p1',
      search: jest.fn().mockResolvedValue({ results: [makeAssetRecord()], total: 1, hasMore: false }),
    });
    manager.registerProvider(provider);

    const page = await manager.search();

    expect(provider.search).toHaveBeenCalled();
    expect(page.total).toBe(1);
  });

  it('recovered provider is included in fan-out after re-check', async () => {
    const { manager } = makeManager();
    const healthCheck = jest.fn().mockResolvedValueOnce(false).mockResolvedValueOnce(true);
    const provider = makeProvider({
      id: 'p1',
      healthCheck,
      search: jest.fn().mockResolvedValue({ results: [makeAssetRecord()], total: 1, hasMore: false }),
    });
    manager.registerProvider(provider);

    // First check — degraded, search is skipped
    await manager.checkProviderHealth();
    const page1 = await manager.search();
    expect(page1.total).toBe(0);

    // Simulated recovery — re-check, search is included
    await manager.checkProviderHealth();
    const page2 = await manager.search();
    expect(page2.total).toBe(1);
  });
});
