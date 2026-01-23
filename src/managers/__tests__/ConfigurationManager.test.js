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
});
