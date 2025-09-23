const path = require('path');
const os = require('os');
const fs = require('fs-extra');

const PluginManager = require('../../src/managers/PluginManager');

describe('SessionsPlugin (via PluginManager)', () => {
  let SessionsPlugin;
  let mockConfig;
  let mockContext;
  let pm;
  let tmpPluginsDir;

  beforeAll(async () => {
    // Create a temp plugins dir and copy only SessionsPlugin.js into it
    tmpPluginsDir = await fs.mkdtemp(path.join(os.tmpdir(), 'pm-sessions-only-'));
    const repoPluginsDir = path.resolve(__dirname, '..');
    const src = path.join(repoPluginsDir, 'SessionsPlugin.js');
    const dst = path.join(tmpPluginsDir, 'SessionsPlugin.js');
    const exists = await fs.pathExists(src);
    if (!exists) throw new Error(`SessionsPlugin.js not found at ${src}`);
    await fs.copy(src, dst);

    // Wire PluginManager to the temp dir via ConfigurationManager
    const logger = { info: jest.fn(), warn: jest.fn(), debug: jest.fn(), error: jest.fn() };
    const cfgMgr = { get: jest.fn().mockReturnValue([tmpPluginsDir]) };
    const engine = {
      getManager: (name) => (name === 'ConfigurationManager' ? cfgMgr : null),
      logger
    };

    pm = new PluginManager(engine);
    await pm.registerPlugins();

    SessionsPlugin = pm.plugins.get('SessionsPlugin');
    if (!SessionsPlugin) {
      const names = Array.from(pm.plugins.keys());
      throw new Error(`SessionsPlugin not loaded. Loaded plugins: ${names.join(', ')}`);
    }
  });

  afterAll(async () => {
    if (tmpPluginsDir) await fs.remove(tmpPluginsDir).catch(() => {});
  });

  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch = jest.fn();

    // Mock ConfigurationManager with amdwiki.server.* keys
    const cfgValues = { 'amdwiki.server.host': '127.0.0.1', 'amdwiki.server.port': 4000 };
    const mockCfgMgr = {
      get: jest.fn((key, def) =>
        Object.prototype.hasOwnProperty.call(cfgValues, key) ? cfgValues[key] : def
      )
    };

    mockContext = {
      engine: {
        // SessionsPlugin now reads ConfigurationManager
        getManager: jest.fn((name) => (name === 'ConfigurationManager' ? mockCfgMgr : null)),
        // getConfig is not required anymore, keep for safety if plugin falls back
        getConfig: jest.fn(() => ({ get: jest.fn((k, d) => d) }))
      }
    };
  });

  afterEach(() => {
    delete global.fetch;
  });

  test('returns session count as string from endpoint', async () => {
    global.fetch.mockResolvedValue({ ok: true, json: async () => ({ sessionCount: 5 }) });

    const out = await SessionsPlugin.execute(mockContext, {});
    expect(out).toBe('5');
    expect(global.fetch).toHaveBeenCalledWith(
      'http://127.0.0.1:4000/api/session-count',
      { method: 'GET' }
    );
  });

  test('uses defaults when ConfigurationManager lacks values', async () => {
    // Override get to always return default
    const mockCfgMgr = { get: jest.fn((k, d) => d) };
    mockContext.engine.getManager.mockImplementation((name) =>
      name === 'ConfigurationManager' ? mockCfgMgr : null
    );

    global.fetch.mockResolvedValue({ ok: true, json: async () => ({ sessionCount: 2 }) });

    const out = await SessionsPlugin.execute(mockContext, {});
    expect(out).toBe('2');
    expect(global.fetch).toHaveBeenCalledWith(
      'http://localhost:3000/api/session-count',
      { method: 'GET' }
    );
  });

  test('returns "0" on non-ok HTTP response', async () => {
    global.fetch.mockResolvedValue({ ok: false });
    const out = await SessionsPlugin.execute(mockContext, {});
    expect(out).toBe('0');
  });

  test('returns "0" when fetch throws or JSON parsing fails', async () => {
    global.fetch.mockRejectedValue(new Error('network down'));
    const out1 = await SessionsPlugin.execute(mockContext, {});
    expect(out1).toBe('0');

    global.fetch.mockResolvedValue({
      ok: true,
      json: async () => {
        throw new Error('bad json');
      }
    });
    const out2 = await SessionsPlugin.execute(mockContext, {});
    expect(out2).toBe('0');
  });

  test('plugin metadata', () => {
    expect(SessionsPlugin.name).toBe('SessionsPlugin');
    expect(typeof SessionsPlugin.execute).toBe('function');
  });
});