const os = require('os');
const path = require('path');
const fs = require('fs-extra');

describe('AddonsManager', () => {
  let tmpDir;
  let AddonsManager;

  const makeConfigManager = (overrides = {}) => ({
    getProperty: jest.fn((key, defaultValue) => {
      if (key === 'amdwiki.managers.addonsManager.enabled') {
        return overrides.enabled ?? true;
      }
      if (key === 'amdwiki.managers.addonsManager.addonsPath') {
        return overrides.addonsPath ?? tmpDir;
      }
      if (key.startsWith('amdwiki.addons.')) {
        const parts = key.split('.');
        const addonName = parts[2];
        const prop = parts[3];
        if (prop === 'enabled') {
          const enabledAddons = overrides.enabledAddons || [];
          return enabledAddons.includes(addonName);
        }
        return defaultValue;
      }
      if (key === 'amdwiki.addons') {
        return overrides.addonsConfig ?? {};
      }
      return defaultValue;
    })
  });

  const makeEngine = (configManager) => ({
    getManager: jest.fn((name) =>
      name === 'ConfigurationManager' ? configManager : null
    )
  });

  beforeAll(() => {
    jest.setTimeout(20000);
  });

  beforeEach(async () => {
    tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'addons-test-'));
    jest.resetModules();
    jest.clearAllMocks();
    // Fresh import each test
    AddonsManager = require('../AddonsManager');
    if (AddonsManager.default) {
      AddonsManager = AddonsManager.default;
    }
  });

  afterEach(async () => {
    await fs.remove(tmpDir).catch(() => {});
  });

  describe('initialization', () => {
    test('initializes with empty addons directory', async () => {
      const configManager = makeConfigManager();
      const engine = makeEngine(configManager);

      const manager = new AddonsManager(engine);
      await manager.initialize();

      expect(manager.isInitialized()).toBe(true);
      expect(manager.getAddonNames()).toEqual([]);
    });

    test('handles missing addons directory gracefully', async () => {
      const nonExistentPath = path.join(tmpDir, 'nonexistent');
      const configManager = makeConfigManager({ addonsPath: nonExistentPath });
      const engine = makeEngine(configManager);

      const manager = new AddonsManager(engine);
      await manager.initialize();

      expect(manager.isInitialized()).toBe(true);
      expect(manager.getAddonNames()).toEqual([]);
    });

    test('skips initialization when disabled in config', async () => {
      const configManager = makeConfigManager({ enabled: false });
      const engine = makeEngine(configManager);

      const manager = new AddonsManager(engine);
      await manager.initialize();

      expect(manager.isInitialized()).toBe(true);
      expect(manager.getAddonNames()).toEqual([]);
    });
  });

  describe('addon discovery', () => {
    test('discovers addon with valid index.js', async () => {
      // Create addon directory structure
      const addonDir = path.join(tmpDir, 'test-addon');
      await fs.mkdir(addonDir);
      await fs.writeFile(
        path.join(addonDir, 'index.js'),
        `
        module.exports = {
          name: 'test-addon',
          version: '1.0.0',
          description: 'A test addon',
          register: async function(engine, config) {
            // Do nothing
          }
        };
        `,
        'utf8'
      );

      const configManager = makeConfigManager();
      const engine = makeEngine(configManager);

      const manager = new AddonsManager(engine);
      await manager.initialize();

      expect(manager.hasAddon('test-addon')).toBe(true);
      expect(manager.getAddonNames()).toContain('test-addon');
    });

    test('skips hidden directories', async () => {
      const hiddenDir = path.join(tmpDir, '.hidden-addon');
      await fs.mkdir(hiddenDir);
      await fs.writeFile(
        path.join(hiddenDir, 'index.js'),
        `module.exports = { name: 'hidden', version: '1.0.0', register: () => {} };`,
        'utf8'
      );

      const configManager = makeConfigManager();
      const engine = makeEngine(configManager);

      const manager = new AddonsManager(engine);
      await manager.initialize();

      expect(manager.hasAddon('hidden')).toBe(false);
    });

    test('skips shared directory', async () => {
      const sharedDir = path.join(tmpDir, 'shared');
      await fs.mkdir(sharedDir);
      await fs.writeFile(
        path.join(sharedDir, 'index.js'),
        `module.exports = { name: 'shared', version: '1.0.0', register: () => {} };`,
        'utf8'
      );

      const configManager = makeConfigManager();
      const engine = makeEngine(configManager);

      const manager = new AddonsManager(engine);
      await manager.initialize();

      expect(manager.hasAddon('shared')).toBe(false);
    });

    test('skips addon without index.js', async () => {
      const addonDir = path.join(tmpDir, 'no-index');
      await fs.mkdir(addonDir);
      await fs.writeFile(path.join(addonDir, 'README.md'), '# No index', 'utf8');

      const configManager = makeConfigManager();
      const engine = makeEngine(configManager);

      const manager = new AddonsManager(engine);
      await manager.initialize();

      expect(manager.hasAddon('no-index')).toBe(false);
    });

    test('skips addon without register function', async () => {
      const addonDir = path.join(tmpDir, 'no-register');
      await fs.mkdir(addonDir);
      await fs.writeFile(
        path.join(addonDir, 'index.js'),
        `module.exports = { name: 'no-register', version: '1.0.0' };`,
        'utf8'
      );

      const configManager = makeConfigManager();
      const engine = makeEngine(configManager);

      const manager = new AddonsManager(engine);
      await manager.initialize();

      expect(manager.hasAddon('no-register')).toBe(false);
    });
  });

  describe('addon loading', () => {
    test('loads enabled addon', async () => {
      const addonDir = path.join(tmpDir, 'enabled-addon');
      await fs.mkdir(addonDir);
      await fs.writeFile(
        path.join(addonDir, 'index.js'),
        `
        module.exports = {
          name: 'enabled-addon',
          version: '1.0.0',
          register: async function(engine, config) {
            // Successfully registered
          }
        };
        `,
        'utf8'
      );

      const configManager = makeConfigManager({
        enabledAddons: ['enabled-addon']
      });
      const engine = makeEngine(configManager);

      const manager = new AddonsManager(engine);
      await manager.initialize();

      expect(manager.isLoaded('enabled-addon')).toBe(true);
    });

    test('does not load disabled addon', async () => {
      const addonDir = path.join(tmpDir, 'disabled-addon');
      await fs.mkdir(addonDir);
      await fs.writeFile(
        path.join(addonDir, 'index.js'),
        `
        module.exports = {
          name: 'disabled-addon',
          version: '1.0.0',
          register: async function() {}
        };
        `,
        'utf8'
      );

      const configManager = makeConfigManager({
        enabledAddons: [] // Not enabled
      });
      const engine = makeEngine(configManager);

      const manager = new AddonsManager(engine);
      await manager.initialize();

      expect(manager.hasAddon('disabled-addon')).toBe(true);
      expect(manager.isLoaded('disabled-addon')).toBe(false);
    });

    test('handles addon registration errors gracefully', async () => {
      const addonDir = path.join(tmpDir, 'error-addon');
      await fs.mkdir(addonDir);
      await fs.writeFile(
        path.join(addonDir, 'index.js'),
        `
        module.exports = {
          name: 'error-addon',
          version: '1.0.0',
          register: async function() {
            throw new Error('Registration failed!');
          }
        };
        `,
        'utf8'
      );

      const configManager = makeConfigManager({
        enabledAddons: ['error-addon']
      });
      const engine = makeEngine(configManager);

      const manager = new AddonsManager(engine);
      // Should not throw
      await manager.initialize();

      expect(manager.hasAddon('error-addon')).toBe(true);
      expect(manager.isLoaded('error-addon')).toBe(false);

      const status = await manager.getStatus();
      const errorAddon = status.find((s) => s.name === 'error-addon');
      expect(errorAddon.error).toContain('Registration failed!');
    });
  });

  describe('dependency resolution', () => {
    test('resolves simple dependency order', async () => {
      // Create addon A (no deps)
      const addonDirA = path.join(tmpDir, 'addon-a');
      await fs.mkdir(addonDirA);
      await fs.writeFile(
        path.join(addonDirA, 'index.js'),
        `module.exports = { name: 'addon-a', version: '1.0.0', register: () => {} };`,
        'utf8'
      );

      // Create addon B (depends on A)
      const addonDirB = path.join(tmpDir, 'addon-b');
      await fs.mkdir(addonDirB);
      await fs.writeFile(
        path.join(addonDirB, 'index.js'),
        `module.exports = { name: 'addon-b', version: '1.0.0', dependencies: ['addon-a'], register: () => {} };`,
        'utf8'
      );

      const configManager = makeConfigManager({
        enabledAddons: ['addon-a', 'addon-b']
      });
      const engine = makeEngine(configManager);

      const manager = new AddonsManager(engine);
      await manager.initialize();

      // Both should be loaded
      expect(manager.isLoaded('addon-a')).toBe(true);
      expect(manager.isLoaded('addon-b')).toBe(true);
    });

    test('detects circular dependencies', async () => {
      // Create addon A (depends on B)
      const addonDirA = path.join(tmpDir, 'circular-a');
      await fs.mkdir(addonDirA);
      await fs.writeFile(
        path.join(addonDirA, 'index.js'),
        `module.exports = { name: 'circular-a', version: '1.0.0', dependencies: ['circular-b'], register: () => {} };`,
        'utf8'
      );

      // Create addon B (depends on A)
      const addonDirB = path.join(tmpDir, 'circular-b');
      await fs.mkdir(addonDirB);
      await fs.writeFile(
        path.join(addonDirB, 'index.js'),
        `module.exports = { name: 'circular-b', version: '1.0.0', dependencies: ['circular-a'], register: () => {} };`,
        'utf8'
      );

      const configManager = makeConfigManager({
        enabledAddons: ['circular-a', 'circular-b']
      });
      const engine = makeEngine(configManager);

      const manager = new AddonsManager(engine);
      // Should not throw, but addons won't be loaded
      await manager.initialize();

      // Neither should be loaded due to circular dependency
      expect(manager.isLoaded('circular-a')).toBe(false);
      expect(manager.isLoaded('circular-b')).toBe(false);
    });

    test('errors when dependency not installed', async () => {
      const addonDir = path.join(tmpDir, 'needs-missing');
      await fs.mkdir(addonDir);
      await fs.writeFile(
        path.join(addonDir, 'index.js'),
        `module.exports = { name: 'needs-missing', version: '1.0.0', dependencies: ['not-installed'], register: () => {} };`,
        'utf8'
      );

      const configManager = makeConfigManager({
        enabledAddons: ['needs-missing']
      });
      const engine = makeEngine(configManager);

      const manager = new AddonsManager(engine);
      await manager.initialize();

      expect(manager.isLoaded('needs-missing')).toBe(false);
    });
  });

  describe('status reporting', () => {
    test('returns status for all discovered addons', async () => {
      const addonDir = path.join(tmpDir, 'status-addon');
      await fs.mkdir(addonDir);
      await fs.writeFile(
        path.join(addonDir, 'index.js'),
        `
        module.exports = {
          name: 'status-addon',
          version: '2.0.0',
          description: 'Test description',
          author: 'Test Author',
          register: () => {},
          status: () => ({ healthy: true, records: 42 })
        };
        `,
        'utf8'
      );

      const configManager = makeConfigManager({
        enabledAddons: ['status-addon']
      });
      const engine = makeEngine(configManager);

      const manager = new AddonsManager(engine);
      await manager.initialize();

      const status = await manager.getStatus();
      expect(status).toHaveLength(1);
      expect(status[0]).toMatchObject({
        name: 'status-addon',
        version: '2.0.0',
        description: 'Test description',
        author: 'Test Author',
        enabled: true,
        loaded: true,
        error: null
      });
      expect(status[0].details).toMatchObject({
        healthy: true,
        records: 42
      });
    });
  });

  describe('shutdown', () => {
    test('calls shutdown on loaded addons', async () => {
      const addonDir = path.join(tmpDir, 'shutdown-addon');
      await fs.mkdir(addonDir);

      // Create a tracker module
      await fs.writeFile(
        path.join(tmpDir, 'tracker.js'),
        `module.exports = { shutdownCalled: false };`,
        'utf8'
      );

      const trackerPath = path.join(tmpDir, 'tracker.js').replace(/\\/g, '\\\\');
      await fs.writeFile(
        path.join(addonDir, 'index.js'),
        `
        const tracker = require('${trackerPath}');
        module.exports = {
          name: 'shutdown-addon',
          version: '1.0.0',
          register: () => {},
          shutdown: () => { tracker.shutdownCalled = true; }
        };
        `,
        'utf8'
      );

      const configManager = makeConfigManager({
        enabledAddons: ['shutdown-addon']
      });
      const engine = makeEngine(configManager);

      const manager = new AddonsManager(engine);
      await manager.initialize();
      expect(manager.isLoaded('shutdown-addon')).toBe(true);

      await manager.shutdown();

      // Check tracker
      const tracker = require(path.join(tmpDir, 'tracker.js'));
      expect(tracker.shutdownCalled).toBe(true);
    });
  });

  describe('backup and restore', () => {
    test('backup returns addon state', async () => {
      const addonDir = path.join(tmpDir, 'backup-addon');
      await fs.mkdir(addonDir);
      await fs.writeFile(
        path.join(addonDir, 'index.js'),
        `module.exports = { name: 'backup-addon', version: '1.0.0', register: () => {} };`,
        'utf8'
      );

      const configManager = makeConfigManager({
        enabledAddons: ['backup-addon']
      });
      const engine = makeEngine(configManager);

      const manager = new AddonsManager(engine);
      await manager.initialize();

      const backup = await manager.backup();
      expect(backup.managerName).toBe('AddonsManager');
      expect(backup.timestamp).toBeDefined();
      expect(backup.data).toHaveProperty('addonStates');
    });

    test('restore is a no-op (state determined by config)', async () => {
      const configManager = makeConfigManager();
      const engine = makeEngine(configManager);

      const manager = new AddonsManager(engine);
      await manager.initialize();

      // Should not throw
      await expect(
        manager.restore({
          managerName: 'AddonsManager',
          timestamp: new Date().toISOString(),
          data: {}
        })
      ).resolves.not.toThrow();
    });
  });
});
