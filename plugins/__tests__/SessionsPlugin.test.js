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
  let consoleErrSpy;

  beforeAll(async () => {
    // Create a temp plugins dir and copy SessionsPlugin.ts and types.ts into it
    tmpPluginsDir = await fs.mkdtemp(path.join(os.tmpdir(), 'pm-sessions-only-'));
    const repoPluginsDir = path.resolve(__dirname, '..');
    const src = path.join(repoPluginsDir, 'SessionsPlugin.ts');
    const dst = path.join(tmpPluginsDir, 'SessionsPlugin.ts');
    const exists = await fs.pathExists(src);
    if (!exists) throw new Error(`SessionsPlugin.ts not found at ${src}`);
    await fs.copy(src, dst);

    // Also copy types.ts since SessionsPlugin imports from it
    const typesSrc = path.join(repoPluginsDir, 'types.ts');
    const typesDst = path.join(tmpPluginsDir, 'types.ts');
    await fs.copy(typesSrc, typesDst);

    // Wire PluginManager to the temp dir via ConfigurationManager
    const logger = { info: jest.fn(), warn: jest.fn(), debug: jest.fn(), error: jest.fn() };
    const cfgMgr = { getProperty: jest.fn().mockReturnValue([tmpPluginsDir]) };
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

    consoleErrSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterAll(async () => {
    consoleErrSpy?.mockRestore();
    if (tmpPluginsDir) await fs.remove(tmpPluginsDir).catch(() => {});
  });

  beforeEach(() => {
    global.fetch = jest.fn(); // success by default for non-error tests
    // Initialize mockContext with a proper engine
    mockContext = {
      engine: {
        getManager: jest.fn((name) => {
          if (name === 'ConfigurationManager') {
            return {
              getProperty: jest.fn((key, defaultVal) => defaultVal)
            };
          }
          return null;
        }),
        logger: { error: jest.fn() }
      }
    };
  });

  afterEach(() => {
    delete global.fetch;
    jest.clearAllMocks();
  });

  test('returns session count as string from endpoint', async () => {
    global.fetch.mockResolvedValue({ ok: true, json: async () => ({ sessionCount: 5 }) });
    const out = await SessionsPlugin.execute(mockContext, {});
    expect(out).toBe('5');
  });

  test('uses defaults when ConfigurationManager lacks values', async () => {
    mockContext.engine.getManager = (n) => (n === 'ConfigurationManager' ? { getProperty: (k, d) => d } : null);
    global.fetch.mockResolvedValue({ ok: true, json: async () => ({ sessionCount: 2 }) });
    const out = await SessionsPlugin.execute(mockContext, {});
    expect(out).toBe('2');
  });

  test('returns "0" when fetch throws or JSON parsing fails', async () => {
    global.fetch.mockRejectedValue(new Error('network down'));
    expect(await SessionsPlugin.execute(mockContext, {})).toBe('0');

    global.fetch.mockResolvedValue({ ok: true, json: async () => { throw new Error('bad json'); } });
    expect(await SessionsPlugin.execute(mockContext, {})).toBe('0');
  });

  test('plugin metadata', () => {
    expect(SessionsPlugin.name).toBe('SessionsPlugin');
    expect(typeof SessionsPlugin.execute).toBe('function');
  });
});