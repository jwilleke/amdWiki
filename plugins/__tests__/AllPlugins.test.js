/**
 * Comprehensive test suite for all plugins using PluginManager
 * Tests plugin discovery, initialization, and basic execution for all plugins
 * 
 * Uses PluginManager - The test initializes the PluginManager with a proper mock engine and configuration to load all plugins from the plugins/ directory.
 * Tests Plugin Discovery - Verifies that all expected plugins are discovered and loaded correctly, including:
 * - TotalPagesPlugin
 * - UptimePlugin
 * - ImagePlugin
 * - ReferringPagesPlugin
 * - SessionsPlugin
 * Tests Plugin Execution - Validates that each plugin can be executed through the PluginManager and returns expected results.
 * Tests Error Handling - Ensures plugins handle error conditions gracefully (missing parameters, network failures, etc.).
 * Tests Plugin Integration - Verifies that plugins work correctly with the PluginManager's context passing and parameter handling.

  The test file demonstrates comprehensive testing patterns by:
  - Setting up mock engines, loggers, and configuration managers
  - Testing both object-based plugins (with execute methods) and function-based plugins
  - Validating plugin metadata (name, description, author, version)
  - Testing various parameter combinations and error scenarios
  - Ensuring proper context handling and fallback behavior
 */

const path = require('path');
const fs = require('fs-extra');
const PluginManager = require('../../src/managers/PluginManager');

describe('All Plugins (via PluginManager)', () => {
  let pluginManager;
  let mockEngine;
  let mockLogger;
  let mockConfigManager;
  let mockContext;
  let consoleErrorSpy;

  beforeAll(async () => {
    // Point to the real plugins directory
    const pluginsDir = path.resolve(__dirname, '..');
    const exists = await fs.pathExists(pluginsDir);
    if (!exists) {
      throw new Error(`Plugins directory not found at ${pluginsDir}`);
    }

    // Setup mock logger
    mockLogger = {
      info: jest.fn(),
      warn: jest.fn(),
      debug: jest.fn(),
      error: jest.fn()
    };

    // Setup mock configuration manager
    mockConfigManager = {
      get: jest.fn().mockImplementation((key, defaultValue) => {
        if (key === 'amdwiki.managers.pluginManager.searchPaths') {
          return [pluginsDir];
        }
        // Default configuration values for various plugins
        const configMap = {
          'features.images.defaultAlt': 'Default image',
          'features.images.defaultClass': 'wiki-image',
          'sessions.endpoint': 'http://localhost:3000/api/sessions',
          'sessions.timeout': 5000
        };
        return key in configMap ? configMap[key] : defaultValue;
      })
    };

    // Setup mock engine with required managers
    mockEngine = {
      logger: mockLogger,
      startTime: Date.now() - 60000, // 1 minute ago for uptime tests
      getManager: jest.fn().mockImplementation((name) => {
        switch (name) {
          case 'ConfigurationManager':
          case 'ConfigManager':
            return mockConfigManager;
          case 'PageManager':
            return {
              getAllPages: jest.fn().mockReturnValue(['TestPage1', 'TestPage2', 'TestPage3'])
            };
          default:
            return null;
        }
      }),
      getConfig: jest.fn().mockReturnValue(mockConfigManager)
    };

    // Initialize PluginManager
    pluginManager = new PluginManager(mockEngine);
    await pluginManager.initialize();

    // Setup console.error spy to suppress error output during tests
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    // Setup mock context for plugin execution
    mockContext = {
      engine: mockEngine,
      pageName: 'TestPage',
      linkGraph: {
        'TestPage': ['ReferringPage1', 'ReferringPage2']
      }
    };
  });

  beforeEach(() => {
    jest.clearAllMocks();
    // Setup global fetch for SessionsPlugin tests
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ sessionCount: 3 })
    });
  });

  afterEach(() => {
    delete global.fetch;
  });

  afterAll(() => {
    // Restore console.error
    consoleErrorSpy?.mockRestore();
  });

  describe('Plugin Discovery and Loading', () => {
    test('should discover and load all expected plugins', () => {
      const loadedPlugins = pluginManager.getPluginNames();

      // Check that we have loaded plugins
      expect(loadedPlugins.length).toBeGreaterThan(0);

      // Log loaded plugins for debugging
      console.log('Loaded plugins:', loadedPlugins);

      // Verify specific plugins are loaded (adjust based on your actual plugins)
      const expectedPlugins = [
        'TotalPagesPlugin',
        'UptimePlugin',
        'Image',
        'ReferringPagesPlugin',
        'SessionsPlugin'
      ];

      expectedPlugins.forEach(pluginName => {
        expect(loadedPlugins).toContain(pluginName);
      });
    });

    test('should load plugins with correct metadata', () => {
      const pluginNames = pluginManager.getPluginNames();

      pluginNames.forEach(pluginName => {
        const pluginInfo = pluginManager.getPluginInfo(pluginName);

        expect(pluginInfo).toBeDefined();
        expect(pluginInfo.name).toBe(pluginName);
        expect(typeof pluginInfo.description).toBe('string');
        expect(typeof pluginInfo.author).toBe('string');
        expect(typeof pluginInfo.version).toBe('string');
      });
    });

    test('should confirm plugins exist via hasPlugin method', () => {
      const pluginNames = pluginManager.getPluginNames();

      pluginNames.forEach(pluginName => {
        expect(pluginManager.hasPlugin(pluginName)).toBe(true);
      });

      // Test non-existent plugin
      expect(pluginManager.hasPlugin('NonExistentPlugin')).toBe(false);
    });
  });

  describe('Plugin Execution', () => {
    test('TotalPagesPlugin should return page count', async () => {
      const result = await pluginManager.execute('TotalPagesPlugin', 'TestPage', {}, mockContext);

      expect(result).toBe('3'); // Based on mock PageManager returning 3 pages
    });

    test('UptimePlugin should return formatted uptime', async () => {
      const result = await pluginManager.execute('UptimePlugin', 'TestPage', {}, mockContext);

      // Should return uptime in format like "1m" since we set startTime 1 minute ago
      expect(result).toMatch(/^\d+m$/);
    });

    test('ReferringPagesPlugin should return referring pages list', async () => {
      const result = await pluginManager.execute('ReferringPagesPlugin', 'TestPage', {}, mockContext);

      // Should contain HTML list with referring pages
      expect(result).toContain('<ul>');
      expect(result).toContain('ReferringPage1');
      expect(result).toContain('ReferringPage2');
    });

    test('ReferringPagesPlugin should return count when show=count', async () => {
      const result = await pluginManager.execute('ReferringPagesPlugin', 'TestPage', { show: 'count' }, mockContext);

      expect(result).toBe('2'); // Two referring pages in mock data
    });

    test('SessionsPlugin should return session count', async () => {
      const result = await pluginManager.execute('SessionsPlugin', 'TestPage', {}, mockContext);

      expect(result).toBe('3'); // Based on mock fetch response
    });

    test('ImagePlugin should generate img tag', async () => {
      const params = { src: '/test/image.jpg' };
      const result = await pluginManager.execute('Image', 'TestPage', params, mockContext);

      expect(result).toContain('<img');
      expect(result).toContain('src="/test/image.jpg"');
    });

    test('ImagePlugin should return error for missing src', async () => {
      const result = await pluginManager.execute('Image', 'TestPage', {}, mockContext);

      expect(result).toMatch(/src attribute is required/i);
    });
  });

  describe('Error Handling', () => {
    test('should handle execution of non-existent plugin', async () => {
      const result = await pluginManager.execute('NonExistentPlugin', 'TestPage', {}, mockContext);

      expect(result).toContain("Plugin 'NonExistentPlugin' not found");
    });

    test('should handle plugin execution errors gracefully', async () => {
      // Create a mock context that will cause PageManager to throw
      const badContext = {
        ...mockContext,
        engine: {
          ...mockEngine,
          getManager: jest.fn().mockImplementation((name) => {
            if (name === 'PageManager') {
              return {
                getAllPages: jest.fn().mockImplementation(() => {
                  throw new Error('PageManager error');
                })
              };
            }
            return mockEngine.getManager(name);
          })
        }
      };

      const result = await pluginManager.execute('TotalPagesPlugin', 'TestPage', {}, badContext);

      // Should return fallback value instead of throwing
      expect(result).toBe('0');
    });

    test('should handle SessionsPlugin network errors', async () => {
      global.fetch = jest.fn().mockRejectedValue(new Error('Network error'));

      const result = await pluginManager.execute('SessionsPlugin', 'TestPage', {}, mockContext);

      expect(result).toBe('0'); // Should return 0 on network error
    });
  });

  describe('Plugin Parameter Handling', () => {
    test('should handle ReferringPagesPlugin max parameter', async () => {
      const result = await pluginManager.execute('ReferringPagesPlugin', 'TestPage', { max: '1' }, mockContext);

      // Should only show 1 referring page
      expect(result).toContain('ReferringPage1');
      expect(result).not.toContain('ReferringPage2');
    });

    test('should handle ImagePlugin with multiple parameters', async () => {
      const params = {
        src: '/test/image.jpg',
        alt: 'Test image',
        width: '200',
        height: '150',
        class: 'custom-class'
      };

      const result = await pluginManager.execute('Image', 'TestPage', params, mockContext);

      expect(result).toContain('src="/test/image.jpg"');
      expect(result).toContain('alt="Test image"');
      expect(result).toContain('width="200"');
      expect(result).toContain('height="150"');
      expect(result).toContain('class="custom-class"');
    });
  });

  describe('Plugin Context and Integration', () => {
    test('plugins should receive correct context', async () => {
      // Test that plugins get the right context by checking what they do with it
      const result = await pluginManager.execute('TotalPagesPlugin', 'TestPage', {}, mockContext);

      // Verify the plugin used the engine from context
      expect(mockEngine.getManager).toHaveBeenCalledWith('PageManager');
      expect(result).toBe('3');
    });

    test('plugins should handle missing context gracefully', async () => {
      // Test with completely empty context - PluginManager will use its own engine as fallback
      const emptyContext = {};
      const result = await pluginManager.execute('TotalPagesPlugin', 'TestPage', {}, emptyContext);

      // Since PluginManager falls back to its own engine, this should still work
      expect(result).toBe('3');
    });
  });
});