const MarkupParser = require('../MarkupParser');

// Enhanced Mock CacheManager with multiple regions
class MockAdvancedCacheManager {
  constructor() {
    this.regions = new Map();
    this.initialized = true;
  }
  
  isInitialized() {
    return this.initialized;
  }
  
  region(regionName) {
    if (!this.regions.has(regionName)) {
      this.regions.set(regionName, {
        cache: new Map(),
        get: jest.fn(async (key) => {
          const region = this.regions.get(regionName);
          return region.cache.get(key) || null;
        }),
        set: jest.fn(async (key, value, options) => {
          const region = this.regions.get(regionName);
          region.cache.set(key, value);
        })
      });
    }
    return this.regions.get(regionName);
  }
}

// Mock ConfigurationManager with advanced cache config
class MockAdvancedConfigurationManager {
  constructor(config = {}) {
    this.config = {
      'amdwiki.markup.enabled': true,
      'amdwiki.markup.caching': true,
      'amdwiki.markup.cacheTTL': 300,
      'amdwiki.markup.cache.parseResults.enabled': true,
      'amdwiki.markup.cache.parseResults.ttl': 300,
      'amdwiki.markup.cache.handlerResults.enabled': true,
      'amdwiki.markup.cache.handlerResults.ttl': 600,
      'amdwiki.markup.cache.patterns.enabled': true,
      'amdwiki.markup.cache.patterns.ttl': 3600,
      'amdwiki.markup.cache.variables.enabled': true,
      'amdwiki.markup.cache.variables.ttl': 900,
      'amdwiki.markup.cache.enableWarmup': true,
      'amdwiki.markup.cache.metricsEnabled': true,
      'amdwiki.markup.performance.monitoring': true,
      'amdwiki.markup.performance.alertThresholds.parseTime': 100,
      'amdwiki.markup.performance.alertThresholds.cacheHitRatio': 0.6,
      'amdwiki.markup.performance.alertThresholds.errorRate': 0.05,
      ...config
    };
  }
  
  getProperty(key, defaultValue) {
    return this.config[key] !== undefined ? this.config[key] : defaultValue;
  }
}

// Mock NotificationManager
class MockNotificationManager {
  constructor() {
    this.notifications = [];
  }
  
  addNotification(notification) {
    this.notifications.push(notification);
  }
  
  getNotifications() {
    return this.notifications;
  }
}

// Mock VariableManager
class MockVariableManager {
  expandVariables(content, context) {
    return content.replace(/\$\{(\w+)\}/g, (match, varName) => {
      if (varName === 'pagename') return context.pageName || 'TestPage';
      if (varName === 'username') return context.userName || 'TestUser';
      if (varName === 'applicationname') return 'amdWiki';
      return match;
    });
  }
}

// Mock Engine
class MockAdvancedWikiEngine {
  constructor(managers = {}) {
    this.managers = new Map();
    
    // Add managers
    this.managers.set('CacheManager', managers.CacheManager || new MockAdvancedCacheManager());
    this.managers.set('ConfigurationManager', managers.ConfigurationManager || new MockAdvancedConfigurationManager());
    this.managers.set('NotificationManager', managers.NotificationManager || new MockNotificationManager());
    this.managers.set('VariableManager', managers.VariableManager || new MockVariableManager());
  }
  
  getManager(name) {
    return this.managers.get(name) || null;
  }
}

describe('MarkupParser Advanced Caching and Performance', () => {
  let markupParser;
  let mockEngine;
  let mockCacheManager;
  let mockNotificationManager;

  beforeEach(async () => {
    mockCacheManager = new MockAdvancedCacheManager();
    mockNotificationManager = new MockNotificationManager();
    mockEngine = new MockAdvancedWikiEngine({
      CacheManager: mockCacheManager,
      NotificationManager: mockNotificationManager
    });
    
    markupParser = new MarkupParser(mockEngine);
    await markupParser.initialize();
  });

  afterEach(async () => {
    await markupParser.shutdown();
  });

  describe('Advanced Cache Initialization', () => {
    test('should initialize multiple cache strategies', () => {
      expect(markupParser.cacheStrategies).toHaveProperty('parseResults');
      expect(markupParser.cacheStrategies).toHaveProperty('handlerResults');
      expect(markupParser.cacheStrategies).toHaveProperty('patterns');
      expect(markupParser.cacheStrategies).toHaveProperty('variables');
    });

    test('should initialize cache metrics for each strategy', () => {
      expect(markupParser.metrics.cacheMetrics.size).toBe(4);
      expect(markupParser.metrics.cacheMetrics.has('parseResults')).toBe(true);
      expect(markupParser.metrics.cacheMetrics.has('handlerResults')).toBe(true);
      expect(markupParser.metrics.cacheMetrics.has('patterns')).toBe(true);
      expect(markupParser.metrics.cacheMetrics.has('variables')).toBe(true);
    });

    test('should respect individual cache strategy configuration', async () => {
      const configWithDisabledHandlers = new MockAdvancedConfigurationManager({
        'amdwiki.markup.cache.handlerResults.enabled': false,
        'amdwiki.markup.cache.patterns.enabled': false
      });
      
      const customEngine = new MockAdvancedWikiEngine({
        ConfigurationManager: configWithDisabledHandlers,
        CacheManager: mockCacheManager
      });
      
      const customParser = new MarkupParser(customEngine);
      await customParser.initialize();
      
      expect(customParser.cacheStrategies).toHaveProperty('parseResults');
      expect(customParser.cacheStrategies).toHaveProperty('variables');
      expect(customParser.cacheStrategies).not.toHaveProperty('handlerResults');
      expect(customParser.cacheStrategies).not.toHaveProperty('patterns');
      
      await customParser.shutdown();
    });
  });

  describe('Performance Monitoring', () => {
    test('should initialize performance monitoring', () => {
      expect(markupParser.performanceMonitor).toBeTruthy();
      expect(markupParser.performanceMonitor.alerts).toEqual([]);
      expect(markupParser.performanceMonitor.recentParseTimes).toEqual([]);
    });

    test('should track performance metrics during parsing', async () => {
      const content = '# Test Content';
      
      await markupParser.parse(content);
      await markupParser.parse(content); // Second call should hit cache
      
      expect(markupParser.performanceMonitor.recentParseTimes.length).toBe(2);
      expect(markupParser.performanceMonitor.recentParseTimes[0].cacheHit).toBe(false);
      expect(markupParser.performanceMonitor.recentParseTimes[1].cacheHit).toBe(true);
    });

    test('should disable performance monitoring when configured', async () => {
      const configWithoutMonitoring = new MockAdvancedConfigurationManager({
        'amdwiki.markup.performance.monitoring': false
      });
      
      const customEngine = new MockAdvancedWikiEngine({
        ConfigurationManager: configWithoutMonitoring,
        CacheManager: mockCacheManager
      });
      
      const customParser = new MarkupParser(customEngine);
      await customParser.initialize();
      
      expect(customParser.performanceMonitor).toBeNull();
      
      await customParser.shutdown();
    });
  });

  describe('Cache Strategies', () => {
    test('should cache parse results with correct TTL', async () => {
      const content = 'Test content for caching';
      
      await markupParser.parse(content);
      
      const parseResultsCache = markupParser.cacheStrategies.parseResults;
      expect(parseResultsCache.set).toHaveBeenCalledWith(
        expect.any(String),
        expect.any(String),
        { ttl: 300 }
      );
    });

    test('should update cache metrics correctly', async () => {
      const content = 'Test content';
      
      // First parse - cache miss and set
      await markupParser.parse(content);
      
      let metrics = markupParser.getMetrics();
      expect(metrics.cacheStrategies.parseResults.misses).toBe(1);
      expect(metrics.cacheStrategies.parseResults.sets).toBe(1);
      
      // Mock cache to return result for second parse
      const parseResultsCache = markupParser.cacheStrategies.parseResults;
      parseResultsCache.get.mockResolvedValueOnce('cached result');
      
      // Second parse - cache hit
      await markupParser.parse(content);
      
      metrics = markupParser.getMetrics();
      expect(metrics.cacheStrategies.parseResults.hits).toBe(1);
    });

    test('should handle cache errors gracefully', async () => {
      const content = 'Test content';
      
      // Mock cache to throw error
      const parseResultsCache = markupParser.cacheStrategies.parseResults;
      parseResultsCache.get.mockRejectedValueOnce(new Error('Cache error'));
      parseResultsCache.set.mockRejectedValueOnce(new Error('Cache error'));
      
      // Should not throw despite cache errors
      const result = await markupParser.parse(content);
      
      expect(result).toBeDefined();
    });
  });

  describe('Cache Warmup', () => {
    test('should perform cache warmup when enabled', async () => {
      // Cache warmup happens during initialization
      const patternsCache = markupParser.cacheStrategies.patterns;
      const variablesCache = markupParser.cacheStrategies.variables;
      
      // Check that patterns were cached
      expect(patternsCache.set).toHaveBeenCalled();
      
      // Check that variables were attempted to be cached
      // Should succeed with our mock VariableManager
      expect(variablesCache.set).toHaveBeenCalledTimes(5); // 5 common variables cached
    });

    test('should skip warmup when disabled', async () => {
      const configWithoutWarmup = new MockAdvancedConfigurationManager({
        'amdwiki.markup.cache.enableWarmup': false
      });
      
      const customEngine = new MockAdvancedWikiEngine({
        ConfigurationManager: configWithoutWarmup,
        CacheManager: new MockAdvancedCacheManager()
      });
      
      const customParser = new MarkupParser(customEngine);
      await customParser.initialize();
      
      // Cache should be initialized but no warmup calls
      const patternsCache = customParser.cacheStrategies.patterns;
      expect(patternsCache.set).not.toHaveBeenCalled();
      
      await customParser.shutdown();
    });
  });

  describe('Performance Alerts', () => {
    beforeEach(() => {
      // Lower thresholds for testing
      markupParser.config.performance.alertThresholds.parseTime = 5; // 5ms
      markupParser.config.performance.alertThresholds.cacheHitRatio = 0.8; // 80%
      markupParser.config.performance.alertThresholds.errorRate = 0.1; // 10%
    });

    test('should generate slow parsing alert', async () => {
      // Mock slow parsing by adding artificial delay
      const originalPhase = markupParser.phases[0].process;
      markupParser.phases[0].process = async (content, context) => {
        await new Promise(resolve => setTimeout(resolve, 10)); // 10ms delay
        return await originalPhase.call(markupParser, content, context);
      };
      
      const content = 'Test content';
      
      // Force threshold check by simulating multiple recent parses
      for (let i = 0; i < 25; i++) {
        await markupParser.parse(content);
      }
      
      // Force threshold check
      markupParser.performanceMonitor.lastCheck = 0;
      markupParser.checkPerformanceThresholds();
      
      const alerts = markupParser.getPerformanceAlerts();
      const slowParsingAlert = alerts.find(alert => alert.type === 'SLOW_PARSING');
      
      expect(slowParsingAlert).toBeTruthy();
      expect(slowParsingAlert.message).toContain('exceeds threshold');
    });

    test('should generate low cache hit ratio alert', async () => {
      // Simulate low cache hit ratio
      markupParser.metrics.cacheHits = 2;
      markupParser.metrics.cacheMisses = 8; // 20% hit ratio
      
      // Force threshold check
      markupParser.performanceMonitor.lastCheck = 0;
      markupParser.checkPerformanceThresholds();
      
      const alerts = markupParser.getPerformanceAlerts();
      const cacheAlert = alerts.find(alert => alert.type === 'LOW_CACHE_HIT_RATIO');
      
      expect(cacheAlert).toBeTruthy();
      expect(cacheAlert.message).toContain('below threshold');
    });

    test('should generate high error rate alert', async () => {
      // Simulate high error rate
      markupParser.metrics.parseCount = 10;
      markupParser.metrics.errorCount = 2; // 20% error rate
      
      // Force threshold check
      markupParser.performanceMonitor.lastCheck = 0;
      markupParser.checkPerformanceThresholds();
      
      const alerts = markupParser.getPerformanceAlerts();
      const errorAlert = alerts.find(alert => alert.type === 'HIGH_ERROR_RATE');
      
      expect(errorAlert).toBeTruthy();
      expect(errorAlert.message).toContain('exceeds threshold');
    });

    test('should send alerts to notification system', async () => {
      // Generate an alert
      markupParser.generatePerformanceAlert('TEST_ALERT', 'Test alert message');
      
      const notifications = mockNotificationManager.getNotifications();
      expect(notifications).toHaveLength(1);
      expect(notifications[0]).toHaveProperty('type', 'performance');
      expect(notifications[0]).toHaveProperty('title', 'MarkupParser Performance Alert: TEST_ALERT');
      expect(notifications[0]).toHaveProperty('message', 'Test alert message');
    });

    test('should limit alert storage', () => {
      // Generate many alerts
      for (let i = 0; i < 150; i++) {
        markupParser.generatePerformanceAlert('TEST_ALERT', `Alert ${i}`);
      }
      
      const alerts = markupParser.getPerformanceAlerts();
      expect(alerts.length).toBe(100); // Should be limited to 100
    });

    test('should clear performance alerts', () => {
      markupParser.generatePerformanceAlert('TEST_ALERT', 'Test message');
      expect(markupParser.getPerformanceAlerts()).toHaveLength(1);
      
      markupParser.clearPerformanceAlerts();
      expect(markupParser.getPerformanceAlerts()).toHaveLength(0);
    });
  });

  describe('Cache Operations', () => {
    test('should use different TTLs for different cache strategies', async () => {
      const content = 'Test content';
      await markupParser.parse(content);
      
      // Check parse results cache TTL
      const parseResultsCache = markupParser.cacheStrategies.parseResults;
      expect(parseResultsCache.set).toHaveBeenCalledWith(
        expect.any(String),
        expect.any(String),
        { ttl: 300 }
      );
    });

    test('should provide cache methods for handler results', async () => {
      const handlerId = 'TestHandler';
      const contentHash = 'abc123';
      const contextHash = 'def456';
      const result = 'cached result';
      
      // Test caching handler result
      await markupParser.cacheHandlerResult(handlerId, contentHash, contextHash, result);
      
      const handlerCache = markupParser.cacheStrategies.handlerResults;
      expect(handlerCache.set).toHaveBeenCalledWith(
        `handler:${handlerId}:${contentHash}:${contextHash}`,
        result,
        { ttl: 600 }
      );
    });

    test('should retrieve cached handler results', async () => {
      const handlerId = 'TestHandler';
      const contentHash = 'abc123';
      const contextHash = 'def456';
      
      // Mock cache to return result
      const handlerCache = markupParser.cacheStrategies.handlerResults;
      handlerCache.get.mockResolvedValueOnce('cached handler result');
      
      const result = await markupParser.getCachedHandlerResult(handlerId, contentHash, contextHash);
      
      expect(result).toBe('cached handler result');
      expect(handlerCache.get).toHaveBeenCalledWith(`handler:${handlerId}:${contentHash}:${contextHash}`);
    });
  });

  describe('Metrics Collection', () => {
    test('should collect comprehensive metrics', async () => {
      const content = 'Test content';
      
      await markupParser.parse(content);
      
      const metrics = markupParser.getMetrics();
      
      expect(metrics).toHaveProperty('cacheStrategies');
      expect(metrics).toHaveProperty('performance');
      expect(metrics).toHaveProperty('handlerRegistry');
      
      expect(metrics.cacheStrategies).toHaveProperty('parseResults');
      expect(metrics.cacheStrategies.parseResults).toHaveProperty('hits');
      expect(metrics.cacheStrategies.parseResults).toHaveProperty('misses');
      expect(metrics.cacheStrategies.parseResults).toHaveProperty('hitRatio');
    });

    test('should calculate hit ratios correctly', async () => {
      const content = 'Test content';
      
      // Simulate cache hits and misses
      markupParser.updateCacheMetrics('parseResults', 'hit');
      markupParser.updateCacheMetrics('parseResults', 'hit');
      markupParser.updateCacheMetrics('parseResults', 'miss');
      
      const metrics = markupParser.getMetrics();
      
      expect(metrics.cacheStrategies.parseResults.hits).toBe(2);
      expect(metrics.cacheStrategies.parseResults.misses).toBe(1);
      expect(metrics.cacheStrategies.parseResults.hitRatio).toBeCloseTo(0.67, 2);
    });

    test('should include performance monitoring data in metrics', async () => {
      const content = 'Test content';
      
      await markupParser.parse(content);
      
      const metrics = markupParser.getMetrics();
      
      expect(metrics.performance).toHaveProperty('monitoring', true);
      expect(metrics.performance).toHaveProperty('alertCount');
      expect(metrics.performance).toHaveProperty('recentParseCount');
      expect(metrics.performance).toHaveProperty('recentStats');
    });
  });

  describe('Configuration Flexibility', () => {
    test('should work with minimal cache configuration', async () => {
      const minimalConfig = new MockAdvancedConfigurationManager({
        'amdwiki.markup.cache.parseResults.enabled': true,
        'amdwiki.markup.cache.handlerResults.enabled': false,
        'amdwiki.markup.cache.patterns.enabled': false,
        'amdwiki.markup.cache.variables.enabled': false
      });
      
      const customEngine = new MockAdvancedWikiEngine({
        ConfigurationManager: minimalConfig,
        CacheManager: mockCacheManager
      });
      
      const customParser = new MarkupParser(customEngine);
      await customParser.initialize();
      
      expect(Object.keys(customParser.cacheStrategies)).toEqual(['parseResults']);
      
      const content = 'Test content';
      const result = await customParser.parse(content);
      
      expect(result).toBeDefined();
      
      await customParser.shutdown();
    });

    test('should work without any caching', async () => {
      const noCacheConfig = new MockAdvancedConfigurationManager({
        'amdwiki.markup.caching': false
      });
      
      const customEngine = new MockAdvancedWikiEngine({
        ConfigurationManager: noCacheConfig,
        CacheManager: mockCacheManager
      });
      
      const customParser = new MarkupParser(customEngine);
      await customParser.initialize();
      
      expect(Object.keys(customParser.cacheStrategies)).toHaveLength(0);
      
      const content = 'Test content';
      const result = await customParser.parse(content);
      
      expect(result).toBeDefined();
      
      await customParser.shutdown();
    });
  });

  describe('Modular Design', () => {
    test('should allow custom cache TTL configuration', async () => {
      const customTTLConfig = new MockAdvancedConfigurationManager({
        'amdwiki.markup.cache.parseResults.ttl': 1800,
        'amdwiki.markup.cache.handlerResults.ttl': 3600
      });
      
      const customEngine = new MockAdvancedWikiEngine({
        ConfigurationManager: customTTLConfig,
        CacheManager: mockCacheManager
      });
      
      const customParser = new MarkupParser(customEngine);
      await customParser.initialize();
      
      expect(customParser.config.cache.parseResults.ttl).toBe(1800);
      expect(customParser.config.cache.handlerResults.ttl).toBe(3600);
      
      await customParser.shutdown();
    });

    test('should support custom performance thresholds', async () => {
      const customThresholds = new MockAdvancedConfigurationManager({
        'amdwiki.markup.performance.alertThresholds.parseTime': 50,
        'amdwiki.markup.performance.alertThresholds.cacheHitRatio': 0.9,
        'amdwiki.markup.performance.alertThresholds.errorRate': 0.01
      });
      
      const customEngine = new MockAdvancedWikiEngine({
        ConfigurationManager: customThresholds,
        CacheManager: mockCacheManager
      });
      
      const customParser = new MarkupParser(customEngine);
      await customParser.initialize();
      
      expect(customParser.config.performance.alertThresholds.parseTime).toBe(50);
      expect(customParser.config.performance.alertThresholds.cacheHitRatio).toBe(0.9);
      expect(customParser.config.performance.alertThresholds.errorRate).toBe(0.01);
      
      await customParser.shutdown();
    });
  });

  describe('Integration with app-custom-config.json', () => {
    test('should override defaults with custom configuration', async () => {
      // Simulate custom configuration overrides
      const customConfig = new MockAdvancedConfigurationManager({
        'amdwiki.markup.enabled': true,
        'amdwiki.markup.cache.parseResults.ttl': 900, // Override default 300
        'amdwiki.markup.handlerRegistry.maxHandlers': 50, // Override default 100
        'amdwiki.markup.performance.monitoring': false // Override default true
      });
      
      const customEngine = new MockAdvancedWikiEngine({
        ConfigurationManager: customConfig,
        CacheManager: mockCacheManager
      });
      
      const customParser = new MarkupParser(customEngine);
      await customParser.initialize();
      
      // Verify custom configuration was loaded
      expect(customParser.config.cache.parseResults.ttl).toBe(900);
      expect(customParser.handlerRegistry.config.maxHandlers).toBe(50);
      expect(customParser.performanceMonitor).toBeNull();
      
      await customParser.shutdown();
    });
  });
});
