const { describe, test, expect, beforeEach, afterEach, beforeAll, afterAll } = require('@jest/globals');
const fs = require('fs-extra');
const path = require('path');

// Mock logger before requiring ConfigurationManager
jest.mock('../../utils/logger', () => ({
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
  debug: jest.fn(),
  child: () => ({
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    debug: jest.fn()
  })
}));

const ConfigurationManager = require('../ConfigurationManager');

describe('ConfigurationManager', () => {
  let configManager;
  let mockEngine;
  let tempDir;
  let originalCwd;
  let originalEnv;

  beforeAll(() => {
    // Save original environment
    originalEnv = { ...process.env };
  });

  afterAll(() => {
    // Restore original environment
    process.env = originalEnv;
  });

  beforeEach(async () => {
    // Create temp directory for test configs
    tempDir = path.join(__dirname, 'temp', `config-test-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`);
    await fs.ensureDir(path.join(tempDir, 'config'));
    await fs.ensureDir(path.join(tempDir, 'data'));

    // Create minimal default config
    const defaultConfig = {
      'amdwiki.applicationName': 'TestWiki',
      'amdwiki.page.provider.filesystem.storagedir': './data/pages',
      'amdwiki.directories.data': './data'
    };
    await fs.writeJson(path.join(tempDir, 'config', 'app-default-config.json'), defaultConfig, { spaces: 2 });

    // Save original cwd and change to temp directory
    originalCwd = process.cwd();
    process.chdir(tempDir);

    // Reset INSTANCE_DATA_FOLDER env var
    delete process.env.INSTANCE_DATA_FOLDER;

    // Create mock engine
    mockEngine = {
      getManager: jest.fn()
    };

    // Create ConfigurationManager
    configManager = new ConfigurationManager(mockEngine);
  });

  afterEach(async () => {
    // Restore original cwd
    if (originalCwd) {
      process.chdir(originalCwd);
    }

    // Clean up temp directory
    if (tempDir) {
      try {
        await fs.rm(tempDir, { recursive: true, force: true });
      } catch (err) {
        console.warn('Failed to clean up temp directory:', err.message);
      }
    }
  });

  describe('getInstanceDataFolder', () => {
    test('should return default ./data path when INSTANCE_DATA_FOLDER not set', async () => {
      await configManager.initialize();

      const result = configManager.getInstanceDataFolder();

      expect(result).toBe(path.resolve(tempDir, './data'));
    });

    test('should respect INSTANCE_DATA_FOLDER environment variable', async () => {
      process.env.INSTANCE_DATA_FOLDER = '/var/lib/amdwiki/data';

      // Create new manager to pick up new env var
      const newConfigManager = new ConfigurationManager(mockEngine);
      await newConfigManager.initialize();

      const result = newConfigManager.getInstanceDataFolder();

      expect(result).toBe('/var/lib/amdwiki/data');
    });

    test('should resolve relative INSTANCE_DATA_FOLDER from cwd', async () => {
      process.env.INSTANCE_DATA_FOLDER = './custom-data';

      const newConfigManager = new ConfigurationManager(mockEngine);
      await newConfigManager.initialize();

      const result = newConfigManager.getInstanceDataFolder();

      expect(result).toBe(path.resolve(tempDir, './custom-data'));
    });
  });

  describe('resolveDataPath', () => {
    beforeEach(async () => {
      await configManager.initialize();
    });

    test('should resolve ./data/pages to instance data folder/pages', () => {
      const result = configManager.resolveDataPath('./data/pages');

      expect(result).toBe(path.join(configManager.getInstanceDataFolder(), 'pages'));
    });

    test('should resolve data/users to instance data folder/users', () => {
      const result = configManager.resolveDataPath('data/users');

      expect(result).toBe(path.join(configManager.getInstanceDataFolder(), 'users'));
    });

    test('should resolve ./data to just instance data folder', () => {
      const result = configManager.resolveDataPath('./data');

      expect(result).toBe(configManager.getInstanceDataFolder());
    });

    test('should resolve data to just instance data folder', () => {
      const result = configManager.resolveDataPath('data');

      expect(result).toBe(configManager.getInstanceDataFolder());
    });

    test('should resolve ./data/logs/audit.log correctly', () => {
      const result = configManager.resolveDataPath('./data/logs/audit.log');

      expect(result).toBe(path.join(configManager.getInstanceDataFolder(), 'logs', 'audit.log'));
    });

    test('should handle path without ./data prefix by adding to instance folder', () => {
      const result = configManager.resolveDataPath('pages');

      expect(result).toBe(path.join(configManager.getInstanceDataFolder(), 'pages'));
    });

    test('should resolve correctly with custom INSTANCE_DATA_FOLDER', async () => {
      process.env.INSTANCE_DATA_FOLDER = '/var/lib/wiki';
      const newConfigManager = new ConfigurationManager(mockEngine);
      await newConfigManager.initialize();

      const result = newConfigManager.resolveDataPath('./data/pages');

      expect(result).toBe('/var/lib/wiki/pages');
    });
  });

  describe('getResolvedDataPath', () => {
    beforeEach(async () => {
      await configManager.initialize();
    });

    test('should resolve data path from config', () => {
      const result = configManager.getResolvedDataPath(
        'amdwiki.page.provider.filesystem.storagedir',
        './data/pages'
      );

      expect(result).toBe(path.join(configManager.getInstanceDataFolder(), 'pages'));
    });

    test('should use default value when config key not found', () => {
      const result = configManager.getResolvedDataPath(
        'nonexistent.key',
        './data/fallback'
      );

      expect(result).toBe(path.join(configManager.getInstanceDataFolder(), 'fallback'));
    });

    test('should not modify non-data paths', () => {
      const result = configManager.getResolvedDataPath(
        'nonexistent.key',
        './required-pages'
      );

      // Non-data paths should be returned as-is
      expect(result).toBe('./required-pages');
    });

    test('should not modify absolute paths', () => {
      const result = configManager.getResolvedDataPath(
        'nonexistent.key',
        '/absolute/path/to/data'
      );

      expect(result).toBe('/absolute/path/to/data');
    });
  });

  describe('custom config loading from instance data folder', () => {
    test('should load custom config from instance data folder when not in config dir', async () => {
      // Create custom config in instance data folder/config/ subdirectory
      const instanceDataFolder = path.join(tempDir, 'data');
      const instanceConfigDir = path.join(instanceDataFolder, 'config');
      await fs.ensureDir(instanceConfigDir);
      const customConfig = {
        'amdwiki.applicationName': 'CustomFromData'
      };
      await fs.writeJson(path.join(instanceConfigDir, 'app-custom-config.json'), customConfig, { spaces: 2 });

      // Initialize fresh manager
      const newConfigManager = new ConfigurationManager(mockEngine);
      await newConfigManager.initialize();

      const appName = newConfigManager.getProperty('amdwiki.applicationName');

      expect(appName).toBe('CustomFromData');
    });

    test('should only read custom config from instance data folder (not code config dir)', async () => {
      // Custom config in code config dir should be ignored
      // Only INSTANCE_DATA_FOLDER/config/ is used for custom and environment configs
      const configDir = path.join(tempDir, 'config');
      const instanceDataFolder = path.join(tempDir, 'data');
      const instanceConfigDir = path.join(instanceDataFolder, 'config');
      await fs.ensureDir(instanceConfigDir);

      // This should be ignored - custom config in code dir
      await fs.writeJson(
        path.join(configDir, 'app-custom-config.json'),
        { 'amdwiki.applicationName': 'FromConfigDir' },
        { spaces: 2 }
      );

      // This should be used - custom config in instance data dir
      await fs.writeJson(
        path.join(instanceConfigDir, 'app-custom-config.json'),
        { 'amdwiki.applicationName': 'FromDataDir' },
        { spaces: 2 }
      );

      // Initialize fresh manager
      const newConfigManager = new ConfigurationManager(mockEngine);
      await newConfigManager.initialize();

      const appName = newConfigManager.getProperty('amdwiki.applicationName');

      // Should use instance data folder config, NOT code config dir
      expect(appName).toBe('FromDataDir');
    });
  });

  describe('deep-merge configurations', () => {
    test('should deep-merge object-type properties', async () => {
      // Default config with user-keywords
      const defaultConfig = {
        'amdwiki.applicationName': 'TestWiki',
        'amdwiki.user-keywords': {
          'default': {
            'label': 'default',
            'description': 'Default keyword',
            'enabled': true
          },
          'draft': {
            'label': 'draft',
            'description': 'Work in progress',
            'enabled': true
          }
        }
      };
      await fs.writeJson(
        path.join(tempDir, 'config', 'app-default-config.json'),
        defaultConfig,
        { spaces: 2 }
      );

      // Custom config adds new keyword
      const instanceConfigDir = path.join(tempDir, 'data', 'config');
      await fs.ensureDir(instanceConfigDir);
      const customConfig = {
        'amdwiki.user-keywords': {
          'immigration': {
            'label': 'immigration',
            'description': 'Immigration content',
            'enabled': true
          }
        }
      };
      await fs.writeJson(
        path.join(instanceConfigDir, 'app-custom-config.json'),
        customConfig,
        { spaces: 2 }
      );

      const newConfigManager = new ConfigurationManager(mockEngine);
      await newConfigManager.initialize();

      const keywords = newConfigManager.getProperty('amdwiki.user-keywords');

      // Should have all three keywords: default, draft, and immigration
      expect(keywords).toHaveProperty('default');
      expect(keywords).toHaveProperty('draft');
      expect(keywords).toHaveProperty('immigration');
      expect(keywords.default.label).toBe('default');
      expect(keywords.draft.label).toBe('draft');
      expect(keywords.immigration.label).toBe('immigration');
    });

    test('should allow custom to override default object properties', async () => {
      const defaultConfig = {
        'amdwiki.applicationName': 'TestWiki',
        'amdwiki.user-keywords': {
          'draft': {
            'label': 'draft',
            'description': 'Default description',
            'enabled': true
          }
        }
      };
      await fs.writeJson(
        path.join(tempDir, 'config', 'app-default-config.json'),
        defaultConfig,
        { spaces: 2 }
      );

      const instanceConfigDir = path.join(tempDir, 'data', 'config');
      await fs.ensureDir(instanceConfigDir);
      const customConfig = {
        'amdwiki.user-keywords': {
          'draft': {
            'label': 'draft',
            'description': 'Custom description override',
            'enabled': false
          }
        }
      };
      await fs.writeJson(
        path.join(instanceConfigDir, 'app-custom-config.json'),
        customConfig,
        { spaces: 2 }
      );

      const newConfigManager = new ConfigurationManager(mockEngine);
      await newConfigManager.initialize();

      const keywords = newConfigManager.getProperty('amdwiki.user-keywords');

      // Custom should override default with same key
      expect(keywords.draft.description).toBe('Custom description override');
      expect(keywords.draft.enabled).toBe(false);
    });

    test('should deep-merge nested objects', async () => {
      const defaultConfig = {
        'amdwiki.applicationName': 'TestWiki',
        'amdwiki.interwiki.sites': {
          'Wikipedia': {
            'url': 'https://en.wikipedia.org/wiki/%s',
            'enabled': true
          }
        }
      };
      await fs.writeJson(
        path.join(tempDir, 'config', 'app-default-config.json'),
        defaultConfig,
        { spaces: 2 }
      );

      const instanceConfigDir = path.join(tempDir, 'data', 'config');
      await fs.ensureDir(instanceConfigDir);
      const customConfig = {
        'amdwiki.interwiki.sites': {
          'GitHub': {
            'url': 'https://github.com/%s',
            'enabled': true
          }
        }
      };
      await fs.writeJson(
        path.join(instanceConfigDir, 'app-custom-config.json'),
        customConfig,
        { spaces: 2 }
      );

      const newConfigManager = new ConfigurationManager(mockEngine);
      await newConfigManager.initialize();

      const sites = newConfigManager.getProperty('amdwiki.interwiki.sites');

      // Should have both Wikipedia and GitHub
      expect(sites).toHaveProperty('Wikipedia');
      expect(sites).toHaveProperty('GitHub');
    });

    test('should merge arrays with id-based objects', async () => {
      const defaultConfig = {
        'amdwiki.applicationName': 'TestWiki',
        'amdwiki.access.policies': [
          { 'id': 'admin-full-access', 'name': 'Admin Access', 'priority': 100 },
          { 'id': 'reader-permissions', 'name': 'Reader', 'priority': 60 }
        ]
      };
      await fs.writeJson(
        path.join(tempDir, 'config', 'app-default-config.json'),
        defaultConfig,
        { spaces: 2 }
      );

      const instanceConfigDir = path.join(tempDir, 'data', 'config');
      await fs.ensureDir(instanceConfigDir);
      const customConfig = {
        'amdwiki.access.policies': [
          { 'id': 'custom-policy', 'name': 'Custom Policy', 'priority': 50 },
          { 'id': 'reader-permissions', 'name': 'Custom Reader', 'priority': 65 }
        ]
      };
      await fs.writeJson(
        path.join(instanceConfigDir, 'app-custom-config.json'),
        customConfig,
        { spaces: 2 }
      );

      const newConfigManager = new ConfigurationManager(mockEngine);
      await newConfigManager.initialize();

      const policies = newConfigManager.getProperty('amdwiki.access.policies');

      // Should have admin-full-access from default, custom-policy from custom,
      // and reader-permissions overridden by custom
      expect(policies).toHaveLength(3);
      const adminPolicy = policies.find(p => p.id === 'admin-full-access');
      const customPolicy = policies.find(p => p.id === 'custom-policy');
      const readerPolicy = policies.find(p => p.id === 'reader-permissions');

      expect(adminPolicy.name).toBe('Admin Access');
      expect(customPolicy.name).toBe('Custom Policy');
      expect(readerPolicy.name).toBe('Custom Reader');
      expect(readerPolicy.priority).toBe(65);
    });

    test('should replace arrays without id fields', async () => {
      const defaultConfig = {
        'amdwiki.applicationName': 'TestWiki',
        'amdwiki.managers.pluginManager.searchPaths': ['./dist/plugins']
      };
      await fs.writeJson(
        path.join(tempDir, 'config', 'app-default-config.json'),
        defaultConfig,
        { spaces: 2 }
      );

      const instanceConfigDir = path.join(tempDir, 'data', 'config');
      await fs.ensureDir(instanceConfigDir);
      const customConfig = {
        'amdwiki.managers.pluginManager.searchPaths': ['./custom-plugins', './more-plugins']
      };
      await fs.writeJson(
        path.join(instanceConfigDir, 'app-custom-config.json'),
        customConfig,
        { spaces: 2 }
      );

      const newConfigManager = new ConfigurationManager(mockEngine);
      await newConfigManager.initialize();

      const searchPaths = newConfigManager.getProperty('amdwiki.managers.pluginManager.searchPaths');

      // Arrays without id should be replaced entirely
      expect(searchPaths).toEqual(['./custom-plugins', './more-plugins']);
    });

    test('should handle primitives being overridden by custom', async () => {
      const defaultConfig = {
        'amdwiki.applicationName': 'DefaultWiki',
        'amdwiki.server.port': 3000
      };
      await fs.writeJson(
        path.join(tempDir, 'config', 'app-default-config.json'),
        defaultConfig,
        { spaces: 2 }
      );

      const instanceConfigDir = path.join(tempDir, 'data', 'config');
      await fs.ensureDir(instanceConfigDir);
      const customConfig = {
        'amdwiki.applicationName': 'CustomWiki',
        'amdwiki.server.port': 8080
      };
      await fs.writeJson(
        path.join(instanceConfigDir, 'app-custom-config.json'),
        customConfig,
        { spaces: 2 }
      );

      const newConfigManager = new ConfigurationManager(mockEngine);
      await newConfigManager.initialize();

      expect(newConfigManager.getProperty('amdwiki.applicationName')).toBe('CustomWiki');
      expect(newConfigManager.getProperty('amdwiki.server.port')).toBe(8080);
    });

    test('should preserve defaults when custom config is empty', async () => {
      const defaultConfig = {
        'amdwiki.applicationName': 'TestWiki',
        'amdwiki.user-keywords': {
          'default': { 'label': 'default', 'enabled': true },
          'draft': { 'label': 'draft', 'enabled': true }
        }
      };
      await fs.writeJson(
        path.join(tempDir, 'config', 'app-default-config.json'),
        defaultConfig,
        { spaces: 2 }
      );

      // No custom config file

      const newConfigManager = new ConfigurationManager(mockEngine);
      await newConfigManager.initialize();

      const keywords = newConfigManager.getProperty('amdwiki.user-keywords');

      expect(keywords).toHaveProperty('default');
      expect(keywords).toHaveProperty('draft');
    });
  });
});
