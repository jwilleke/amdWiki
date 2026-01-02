const os = require('os');
const path = require('path');
const fs = require('fs-extra');

describe('PluginManager.registerPlugins', () => {
  const makeLogger = () => ({
    info: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
    error: jest.fn()
  });

  let tmpDirA;
  let tmpDirB;

  beforeAll(async () => {
    jest.setTimeout(20000);
  });

  beforeEach(async () => {
    tmpDirA = await fs.mkdtemp(path.join(os.tmpdir(), 'pm-a-'));
    tmpDirB = await fs.mkdtemp(path.join(os.tmpdir(), 'pm-b-'));
  });

  afterEach(async () => {
    await fs.remove(tmpDirA).catch(() => { });
    await fs.remove(tmpDirB).catch(() => { });
    jest.resetModules();
    jest.clearAllMocks();
  });

  test('loads plugins only from configured search paths and only .js/.ts (excluding test files)', async () => {
    // Use longer timeout since this test can be slow when run with other tests
    // Arrange: create files in configured dir
    const goodJsPlugin = path.join(tmpDirA, 'Alpha.js');
    const goodTsPlugin = path.join(tmpDirA, 'Beta.ts');
    const testJsFile = path.join(tmpDirA, 'Gamma.test.js');
    const testTsFile = path.join(tmpDirA, 'Delta.test.ts');
    const dtsFile = path.join(tmpDirA, 'types.d.ts');
    const nonJs = path.join(tmpDirA, 'README.md');

    await fs.writeFile(
      goodJsPlugin,
      `
      module.exports = {
        name: 'Alpha',
        execute: () => 'ok'
      };
      `,
      'utf8'
    );
    await fs.writeFile(
      goodTsPlugin,
      `
      module.exports = {
        name: 'Beta',
        execute: () => 'ok'
      };
      `,
      'utf8'
    );
    await fs.writeFile(testJsFile, 'module.exports = {};', 'utf8');
    await fs.writeFile(testTsFile, 'module.exports = {};', 'utf8');
    await fs.writeFile(dtsFile, 'export {};', 'utf8');
    await fs.writeFile(nonJs, '# readme', 'utf8');

    const logger = makeLogger();
    const cfgMgr = {
      getProperty: jest.fn().mockReturnValue([tmpDirA]) // ONLY tmpDirA is allowed
    };
    const engine = {
      getManager: (name) => (name === 'ConfigurationManager' ? cfgMgr : null),
      logger
    };

    // Load PluginManager fresh
    const PluginManager = require('../PluginManager');

    // Create instance and intercept loadPlugin to observe what it would load
    const pm = typeof PluginManager === 'function' ? new PluginManager(engine) : new PluginManager();
    if (!pm.engine) pm.engine = engine;

    const loadCalls = [];
    pm.loadPlugin = jest.fn(async (candidate) => {
      loadCalls.push(candidate);
    });

    // Act
    await pm.registerPlugins();

    // Assert
    expect(cfgMgr.getProperty).toHaveBeenCalledWith('amdwiki.managers.pluginManager.searchPaths');
    expect(loadCalls).toHaveLength(2); // Both .js and .ts plugins should be loaded
    const loadedNames = loadCalls.map(c => path.basename(c)).sort();
    expect(loadedNames).toContain('Alpha.js');
    expect(loadedNames).toContain('Beta.ts');

    // Ensure it did not try to load non-js or *.test.js
    expect(loadCalls.find((p) => p.endsWith('Beta.test.js'))).toBeUndefined();
    expect(loadCalls.find((p) => p.endsWith('README.md'))).toBeUndefined();

    // No warnings/errors expected for valid flow
    expect(logger.warn).not.toHaveBeenCalled();
    expect(logger.error).not.toHaveBeenCalled();
  }, 20000);

  test('skips loading when ConfigurationManager is missing', async () => {
    const logger = makeLogger();
    const engine = {
      getManager: () => null,
      logger
    };

    const PluginManager = require('../PluginManager');
    const pm = typeof PluginManager === 'function' ? new PluginManager(engine) : new PluginManager();
    if (!pm.engine) pm.engine = engine;

    pm.loadPlugin = jest.fn();

    await pm.registerPlugins();

    expect(pm.loadPlugin).not.toHaveBeenCalled();
    expect(logger.warn).toHaveBeenCalled();
    expect(
      logger.warn.mock.calls.some(([msg]) =>
        String(msg).includes('ConfigurationManager not available')
      )
    ).toBe(true);
  });

  test('does not load anything when searchPaths config is missing/empty', async () => {
    const logger = makeLogger();
    const cfgMgr = { getProperty: jest.fn().mockReturnValue([]) };
    const engine = {
      getManager: () => cfgMgr,
      logger
    };

    const PluginManager = require('../PluginManager');
    const pm = typeof PluginManager === 'function' ? new PluginManager(engine) : new PluginManager();
    if (!pm.engine) pm.engine = engine;

    pm.loadPlugin = jest.fn();

    await pm.registerPlugins();

    expect(cfgMgr.getProperty).toHaveBeenCalledWith('amdwiki.managers.pluginManager.searchPaths');
    expect(pm.loadPlugin).not.toHaveBeenCalled();
    expect(logger.info).toHaveBeenCalled();
    expect(
      logger.info.mock.calls.some(([msg]) =>
        String(msg).includes('No plugin search paths configured')
      )
    ).toBe(true);
  });

  test('ignores non-existent configured directories', async () => {
    const logger = makeLogger();
    const missingDir = path.join(os.tmpdir(), 'pm-missing-' + Date.now());

    const cfgMgr = { getProperty: jest.fn().mockReturnValue([missingDir, tmpDirB]) };
    const engine = {
      getManager: () => cfgMgr,
      logger
    };

    // Put a valid plugin only in tmpDirB
    const goodPlugin = path.join(tmpDirB, 'Gamma.js');
    await fs.writeFile(
      goodPlugin,
      `
      module.exports = { name: 'Gamma', execute: () => 'ok' };
      `,
      'utf8'
    );

    const PluginManager = require('../PluginManager');
    const pm = typeof PluginManager === 'function' ? new PluginManager(engine) : new PluginManager();
    if (!pm.engine) pm.engine = engine;

    pm.loadPlugin = jest.fn();

    await pm.registerPlugins();

    // Should have attempted only the valid directory
    expect(pm.loadPlugin).toHaveBeenCalledTimes(1);
    expect(path.basename(pm.loadPlugin.mock.calls[0][0])).toBe('Gamma.js');

    // Should debug-log the missing directory
    expect(
      logger.debug.mock.calls.some(([msg]) =>
        String(msg).includes('configured path does not exist')
      )
    ).toBe(true);
  });

  /**
   * Tests that the plugin manager prints the names of loaded plugins.
   */
  test('prints project plugin names from ./plugins', async () => {
    const path = require('path');
    const fs = require('fs-extra');

    const logger = { info: jest.fn(), warn: jest.fn(), debug: jest.fn(), error: jest.fn() };
    const pluginsDir = path.resolve(process.cwd(), 'plugins');
    const exists = await fs.pathExists(pluginsDir);
    expect(exists).toBe(true);

    const cfgMgr = { getProperty: jest.fn().mockReturnValue([pluginsDir]) };
    const engine = {
      getManager: (name) => (name === 'ConfigurationManager' ? cfgMgr : null),
      logger
    };

    const PluginManager = require('../PluginManager');
    const pm = new PluginManager(engine);
    await pm.registerPlugins();

    const names = Array.from(pm.plugins?.keys?.() || []);
    process.stdout.write(`Plugins found in ./plugins: ${names.join(', ')}\n`);
    expect(names.length).toBeGreaterThan(0);
  });

});