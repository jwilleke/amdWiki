/**\
 * PluginManager.registerPlugins.test.js
 * Tests for the PluginManager.registerPlugins method.
 * Reads searchPaths only from ConfigurationManager.
 * Accepts array or comma-separated string.
 * Loads only .js files, skipping *.test.js and non-files.
 * Validates/sets allowedRoots using realpath.
 * Skips when config is missing/empty or manager missing.
 * 
 */


const os = require('os');
const path = require('path');
const fs = require('fs-extra');

const makeLogger = () => ({
  info: jest.fn(),
  warn: jest.fn(),
  debug: jest.fn(),
  error: jest.fn()
});

const makeEngine = (cfgMgr, logger = makeLogger()) => ({
  getManager: (name) => (name === 'ConfigurationManager' ? cfgMgr : null),
  logger
});

describe('PluginManager.registerPlugins', () => {
  let tmpA, tmpB;

  beforeEach(async () => {
    jest.resetModules();
    jest.clearAllMocks();
    tmpA = await fs.mkdtemp(path.join(os.tmpdir(), 'pm-a-'));
    tmpB = await fs.mkdtemp(path.join(os.tmpdir(), 'pm-b-'));

    // Create plugins and noise in tmpA
    await fs.writeFile(
      path.join(tmpA, 'GoodA.js'),
      `module.exports = { name: 'GoodA', execute: () => 'okA' };`,
      'utf8'
    );
    await fs.writeFile(
      path.join(tmpA, 'SkipA.test.js'),
      `module.exports = { name: 'ShouldSkip', execute: () => 'nope' };`,
      'utf8'
    );
    await fs.writeFile(path.join(tmpA, 'README.md'), '# not a plugin', 'utf8');

    // Create plugins in tmpB
    await fs.writeFile(
      path.join(tmpB, 'GoodB.js'),
      `module.exports = { execute: () => 'okB' }; // no name, use filename`,
      'utf8'
    );
  });

  afterEach(async () => {
    await fs.remove(tmpA).catch(() => {});
    await fs.remove(tmpB).catch(() => {});
  });

  test('loads plugins only from configured searchPaths (array)', async () => {
    const cfgMgr = { getProperty: jest.fn().mockReturnValue([tmpA, tmpB]) };
    const engine = makeEngine(cfgMgr);
    const PluginManager = require('../PluginManager');
    const pm = new PluginManager(engine);

    await pm.registerPlugins();

    const names = Array.from(pm.plugins.keys());
    // From tmpA
    expect(names).toContain('GoodA');
    // From tmpB (no explicit name, should fall back to filename)
    expect(names).toContain('GoodB');
    // Skipped
    expect(names).not.toContain('ShouldSkip');

    // allowedRoots should be realpaths
    const realA = await fs.realpath(tmpA);
    const realB = await fs.realpath(tmpB);
    expect(pm.allowedRoots).toEqual(expect.arrayContaining([realA, realB]));
  });

  test('accepts comma-separated string searchPaths', async () => {
    const cfgMgr = { getProperty: jest.fn().mockReturnValue(`${tmpA},${tmpB}`) };
    const engine = makeEngine(cfgMgr);
    const PluginManager = require('../PluginManager');
    const pm = new PluginManager(engine);

    await pm.registerPlugins();

    const names = Array.from(pm.plugins.keys());
    expect(names).toEqual(expect.arrayContaining(['GoodA', 'GoodB']));
    // Ensure it did not attempt to load *.test.js or non-js files
    expect(names).not.toContain('ShouldSkip');
  });

  test('skips when ConfigurationManager is missing', async () => {
    const engine = { getManager: () => null, logger: makeLogger() };
    const PluginManager = require('../PluginManager');
    const pm = new PluginManager(engine);

    await pm.registerPlugins();

    expect(pm.plugins.size).toBe(0);
    expect(engine.logger.warn).toHaveBeenCalled();
  });

  test('skips when searchPaths config is empty', async () => {
    const cfgMgr = { getProperty: jest.fn().mockReturnValue([]) };
    const engine = makeEngine(cfgMgr);
    const PluginManager = require('../PluginManager');
    const pm = new PluginManager(engine);

    await pm.registerPlugins();

    expect(pm.plugins.size).toBe(0);
    expect(engine.logger.info).toHaveBeenCalled();
  });

  test('ignores non-existent and non-directory paths, loads from valid ones', async () => {
    const missingDir = path.join(os.tmpdir(), `pm-missing-${Date.now()}`);
    const notADir = path.join(os.tmpdir(), `pm-file-${Date.now()}.js`);
    await fs.writeFile(notADir, 'not a dir', 'utf8');

    const cfgMgr = { getProperty: jest.fn().mockReturnValue([missingDir, notADir, tmpA]) };
    const engine = makeEngine(cfgMgr);
    const PluginManager = require('../PluginManager');
    const pm = new PluginManager(engine);

    await pm.registerPlugins();

    const names = Array.from(pm.plugins.keys());
    expect(names).toContain('GoodA');
    expect(engine.logger.debug).toHaveBeenCalledWith(
      expect.stringContaining('configured path does not exist:')
    );
    expect(engine.logger.warn).toHaveBeenCalledWith(
      expect.stringContaining('configured path is not a directory:')
    );
  });

  test('registerPlugins sets allowedRoots and loadPlugin blocks outside roots', async () => {
    const cfgMgr = { getProperty: jest.fn().mockReturnValue([tmpA]) };
    const engine = makeEngine(cfgMgr);
    const PluginManager = require('../PluginManager');
    const pm = new PluginManager(engine);

    await pm.registerPlugins();

    const outside = path.join(tmpB, 'Outside.js');
    await fs.writeFile(
      outside,
      `module.exports = { name: 'Outside', execute: () => 'no' };`,
      'utf8'
    );

    // Attempt to load a plugin that is not under allowedRoots
    await pm.loadPlugin(outside);

    // Should not be loaded
    expect(pm.plugins.has('Outside')).toBe(false);
    expect(engine.logger.warn).toHaveBeenCalledWith(
      expect.stringContaining('blocked plugin outside allowed roots')
    );
  });
});