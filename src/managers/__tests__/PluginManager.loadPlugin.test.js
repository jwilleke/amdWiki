/**
 * Tests for the PluginManager.loadPlugin method. 
 * PluginManager.loadPlugin.test.js
 * Loads a valid execute-style plugin and calls initialize().
 * Blocks a plugin outside allowedRoots.
 * Loads a function-style plugin.
 * Skips non-executable modules.
 * @jest-environment node
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

describe('PluginManager.loadPlugin', () => {
  let tmpRoot;
  let logger;
  let engine;
  let PluginManager;
  let pm;

  beforeAll(() => {
    jest.setTimeout(20000);
  });

  beforeEach(async () => {
    jest.resetModules();
    jest.clearAllMocks();

    tmpRoot = await fs.mkdtemp(path.join(os.tmpdir(), 'pm-load-'));
    logger = makeLogger();
    engine = {
      getManager: () => null,
      logger
    };

    PluginManager = require('../PluginManager');
    pm = new PluginManager(engine);

    // Allow only tmpRoot
    const realRoot = await fs.realpath(tmpRoot);
    pm.allowedRoots = [realRoot];
  });

  afterEach(async () => {
    await fs.remove(tmpRoot).catch(() => {});
  });

  test('loads execute-style plugin inside allowedRoots and calls initialize', async () => {
    const pluginPath = path.join(tmpRoot, 'GoodExec.js');
    await fs.writeFile(
      pluginPath,
      `
      module.exports = {
        name: 'GoodExec',
        initialize: async (engine) => { engine.logger.info('initialize called'); },
        execute: () => 'ok'
      };
      `,
      'utf8'
    );

    await pm.loadPlugin(pluginPath);

    expect(pm.plugins.has('GoodExec')).toBe(true);
    // initialize() msg
    expect(logger.info).toHaveBeenCalledWith(expect.stringContaining('initialize called'));
    // loaded msg
    expect(
      logger.info.mock.calls.some(([msg]) =>
        String(msg).includes('PluginManager: Loaded plugin "GoodExec"')
      )
    ).toBe(true);
  });

  test('blocks plugin outside allowedRoots', async () => {
    const outsideDir = await fs.mkdtemp(path.join(os.tmpdir(), 'pm-outside-'));
    const outsidePlugin = path.join(outsideDir, 'Outside.js');
    await fs.writeFile(
      outsidePlugin,
      `module.exports = { name: 'Outside', execute: () => 'no' };`,
      'utf8'
    );

    await pm.loadPlugin(outsidePlugin);

    expect(pm.plugins.has('Outside')).toBe(false);
    expect(
      logger.warn.mock.calls.some(([msg]) =>
        String(msg).includes('blocked plugin outside allowed roots')
      )
    ).toBe(true);

    await fs.remove(outsideDir).catch(() => {});
  });

  test('loads function-style plugin and registers by explicit function name or filename', async () => {
    const fnPlugin = path.join(tmpRoot, 'FunctionOnly.js');
    await fs.writeFile(
      fnPlugin,
      `
      // Name provided by function OR fallback to filename
      module.exports = function FunctionOnly(pageName, params) { return 'ok'; };
      `,
      'utf8'
    );

    await pm.loadPlugin(fnPlugin);

    const keys = Array.from(pm.plugins.keys());
    // Accept either explicit function name or filename fallback
    expect(keys).toEqual(expect.arrayContaining(['FunctionOnly']));
  });

  test('skips non-executable plugin objects', async () => {
    const badPlugin = path.join(tmpRoot, 'Bad.js');
    await fs.writeFile(
      badPlugin,
      `
      module.exports = { description: 'not executable' };
      `,
      'utf8'
    );

    await pm.loadPlugin(badPlugin);

    expect(pm.plugins.has('Bad')).toBe(false);
    expect(
      logger.warn.mock.calls.some(([msg]) =>
        String(msg).includes('is not an executable plugin; skipping')
      )
    ).toBe(true);
  });
});