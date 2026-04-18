/**
 * Unit tests for PluginManager.registerPlugin() (#358)
 *
 * Verifies programmatic plugin registration by add-ons,
 * bypassing the file-path security check used by loadPlugin().
 *
 * @jest-environment node
 */


describe('PluginManager.registerPlugin()', () => {
  let PluginManager;
  let mockEngine;

  beforeEach(() => {
    jest.resetModules();
    PluginManager = require('../PluginManager');

    mockEngine = {
      getManager: jest.fn(),
      logger: {
        info: jest.fn(),
        warn: jest.fn(),
        debug: jest.fn(),
        error: jest.fn()
      }
    };
  });

  function makeManager(searchPaths = []) {
    const pm = new PluginManager(mockEngine);
    pm.searchPaths = searchPaths;
    pm.allowedRoots = searchPaths;
    return pm;
  }

  test('registers a PluginObject and hasPlugin() returns true', async () => {
    const pm = makeManager();
    const plugin = {
      name: 'HelloPlugin',
      execute: jest.fn().mockResolvedValue('<b>hello</b>')
    };

    await pm.registerPlugin('HelloPlugin', plugin);

    expect(pm.hasPlugin('HelloPlugin')).toBe(true);
  });

  test('execute() returns output from registered plugin', async () => {
    const pm = makeManager();
    const plugin = {
      name: 'EchoPlugin',
      execute: jest.fn().mockResolvedValue('echo output')
    };

    await pm.registerPlugin('EchoPlugin', plugin);
    const result = await pm.execute('EchoPlugin', 'TestPage', {});

    expect(result).toBe('echo output');
  });

  test('calls initialize(engine) on registration if present', async () => {
    const pm = makeManager();
    const initFn = jest.fn().mockResolvedValue(undefined);
    const plugin = {
      name: 'InitPlugin',
      initialize: initFn,
      execute: jest.fn().mockResolvedValue('')
    };

    await pm.registerPlugin('InitPlugin', plugin);

    expect(initFn).toHaveBeenCalledWith(mockEngine);
  });

  test('registers a function plugin', async () => {
    const pm = makeManager();
    const pluginFn = jest.fn().mockResolvedValue('fn result');

    await pm.registerPlugin('FnPlugin', pluginFn);

    expect(pm.hasPlugin('FnPlugin')).toBe(true);
    const result = await pm.execute('FnPlugin', 'TestPage', {});
    expect(result).toBe('fn result');
  });

  test('logs a warning and skips invalid plugin', async () => {
    const pm = makeManager();

    await pm.registerPlugin('BadPlugin', { notAPlugin: true });

    expect(pm.hasPlugin('BadPlugin')).toBe(false);
  });

  test('overwrites an existing plugin with the same name', async () => {
    const pm = makeManager();
    const v1 = { name: 'P', execute: jest.fn().mockResolvedValue('v1') };
    const v2 = { name: 'P', execute: jest.fn().mockResolvedValue('v2') };

    await pm.registerPlugin('P', v1);
    await pm.registerPlugin('P', v2);

    const result = await pm.execute('P', 'TestPage', {});
    expect(result).toBe('v2');
  });

  test('calls fetch(engine) before execute() when fetch is present', async () => {
    const pm = makeManager();
    const callOrder = [];
    const fetchFn = jest.fn().mockImplementation(() => { callOrder.push('fetch'); });
    const executeFn = jest.fn().mockImplementation(() => { callOrder.push('execute'); return 'done'; });
    const plugin = { name: 'FetchPlugin', fetch: fetchFn, execute: executeFn };

    await pm.registerPlugin('FetchPlugin', plugin);
    await pm.execute('FetchPlugin', 'TestPage', {});

    expect(fetchFn).toHaveBeenCalledWith(mockEngine);
    expect(executeFn).toHaveBeenCalled();
    expect(callOrder).toEqual(['fetch', 'execute']);
  });

  test('fetch(engine) receives the engine instance', async () => {
    const pm = makeManager();
    let receivedEngine;
    const plugin = {
      name: 'EngineCheckPlugin',
      fetch: jest.fn().mockImplementation((eng) => { receivedEngine = eng; }),
      execute: jest.fn().mockResolvedValue('')
    };

    await pm.registerPlugin('EngineCheckPlugin', plugin);
    await pm.execute('EngineCheckPlugin', 'TestPage', {});

    expect(receivedEngine).toBe(mockEngine);
  });

  test('execute() works normally when fetch is absent', async () => {
    const pm = makeManager();
    const plugin = { name: 'NoFetchPlugin', execute: jest.fn().mockResolvedValue('result') };

    await pm.registerPlugin('NoFetchPlugin', plugin);
    const result = await pm.execute('NoFetchPlugin', 'TestPage', {});

    expect(result).toBe('result');
  });
});
