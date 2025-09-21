const MarkupParser = require('../MarkupParser');
const ParseContext = require('../context/ParseContext');

// Mock WikiEngine for testing
class MockWikiEngine {
  constructor() {
    this.managers = new Map();
  }
  
  getManager(name) {
    return this.managers.get(name) || null;
  }
  
  registerManager(name, manager) {
    this.managers.set(name, manager);
  }
}

// Mock CacheManager
class MockCacheManager {
  constructor() {
    this.cache = new Map();
    this.initialized = true;
  }
  
  isInitialized() {
    return this.initialized;
  }
  
  region(regionName) {
    return {
      get: async (key) => this.cache.get(key),
      set: async (key, value, options) => {
        this.cache.set(key, value);
      }
    };
  }
}

// Mock VariableManager
class MockVariableManager {
  expandVariables(content, context) {
    return content.replace(/\$\{(\w+)\}/g, (match, varName) => {
      if (varName === 'pagename') return context.pageName || 'TestPage';
      if (varName === 'username') return context.userName || 'TestUser';
      return match;
    });
  }
}

// Mock RenderingManager with Showdown converter
class MockRenderingManager {
  constructor() {
    // Mock Showdown converter
    this.converter = {
      makeHtml: (content) => {
        // Simple markdown conversion for testing
        return content
          .replace(/^# (.+)$/gm, '<h1>$1</h1>')
          .replace(/^## (.+)$/gm, '<h2>$1</h2>')
          .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
          .replace(/\*(.+?)\*/g, '<em>$1</em>');
      }
    };
  }
}

describe('MarkupParser', () => {
  let markupParser;
  let mockEngine;
  let mockCacheManager;
  let mockVariableManager;
  let mockRenderingManager;

  beforeEach(async () => {
    // Create mock engine and managers
    mockEngine = new MockWikiEngine();
    mockCacheManager = new MockCacheManager();
    mockVariableManager = new MockVariableManager();
    mockRenderingManager = new MockRenderingManager();
    
    // Register mock managers
    mockEngine.registerManager('CacheManager', mockCacheManager);
    mockEngine.registerManager('VariableManager', mockVariableManager);
    mockEngine.registerManager('RenderingManager', mockRenderingManager);
    
    // Create and initialize MarkupParser
    markupParser = new MarkupParser(mockEngine);
    await markupParser.initialize();
  });

  afterEach(async () => {
    await markupParser.shutdown();
  });

  describe('Initialization', () => {
    test('should initialize with all 7 phases', () => {
      expect(markupParser.phases).toHaveLength(7);
      
      const expectedPhases = [
        'Preprocessing',
        'Syntax Recognition', 
        'Context Resolution',
        'Content Transformation',
        'Filter Pipeline',
        'Markdown Conversion',
        'Post-processing'
      ];
      
      const phaseNames = markupParser.phases.map(phase => phase.name);
      expect(phaseNames).toEqual(expectedPhases);
    });

    test('should initialize cache integration', () => {
      expect(markupParser.cache).toBeTruthy();
    });

    test('should initialize metrics collection', () => {
      expect(markupParser.metrics).toBeDefined();
      expect(markupParser.metrics.parseCount).toBe(0);
      expect(markupParser.metrics.phaseMetrics.size).toBe(7);
    });

    test('should sort phases by priority', () => {
      const priorities = markupParser.phases.map(phase => phase.priority);
      expect(priorities).toEqual([100, 200, 300, 400, 500, 600, 700]);
    });
  });

  describe('Basic Parsing', () => {
    test('should parse empty content', async () => {
      const result = await markupParser.parse('');
      expect(result).toBe('');
    });

    test('should parse simple text', async () => {
      const content = 'Hello World';
      const result = await markupParser.parse(content);
      expect(result).toBe('Hello World');
    });

    test('should parse markdown content', async () => {
      const content = '# Title\n\nThis is **bold** text.';
      const result = await markupParser.parse(content);
      expect(result).toContain('<h1>Title</h1>');
      expect(result).toContain('<strong>bold</strong>');
    });

    test('should handle parse context', async () => {
      const content = 'Hello World';
      const context = {
        pageName: 'TestPage',
        userName: 'TestUser'
      };
      
      const result = await markupParser.parse(content, context);
      expect(result).toBe('Hello World');
    });
  });

  describe('Phase Processing', () => {
    test('should execute all phases in correct order', async () => {
      const content = '# Test\n\n```\ncode block\n```\n\nRegular text.';
      
      const result = await markupParser.parse(content);
      
      // Should contain processed markdown
      expect(result).toContain('<h1>Test</h1>');
      
      // Code blocks should be preserved
      expect(result).toContain('```\ncode block\n```');
    });

    test('should protect code blocks during preprocessing', async () => {
      const content = 'Text before\n\n```javascript\nconst x = 1;\n```\n\nText after';
      
      const parseContext = new ParseContext(content, {}, mockEngine);
      
      // Test preprocessing phase directly
      const result = await markupParser.phasePreprocessing(content, parseContext);
      
      expect(parseContext.protectedBlocks).toHaveLength(1);
      expect(parseContext.protectedBlocks[0]).toContain('const x = 1;');
      expect(result).toContain('__CODE_BLOCK_0__');
    });

    test('should restore protected blocks during post-processing', async () => {
      const content = 'Text\n\n```\ncode\n```\n\nMore text';
      const result = await markupParser.parse(content);
      
      // Code block should be restored
      expect(result).toContain('```\ncode\n```');
    });

    test('should expand variables during context resolution', async () => {
      const content = 'Page: ${pagename}, User: ${username}';
      const context = {
        pageName: 'MyPage',
        userName: 'MyUser'
      };
      
      const result = await markupParser.parse(content, context);
      
      expect(result).toContain('Page: MyPage');
      expect(result).toContain('User: MyUser');
    });
  });

  describe('Caching', () => {
    test('should cache parse results', async () => {
      const content = '# Cached Content';
      const context = { pageName: 'TestPage' };
      
      // First parse - should miss cache
      const result1 = await markupParser.parse(content, context);
      expect(markupParser.metrics.cacheMisses).toBe(1);
      expect(markupParser.metrics.cacheHits).toBe(0);
      
      // Second parse - should hit cache
      const result2 = await markupParser.parse(content, context);
      expect(markupParser.metrics.cacheHits).toBe(1);
      expect(result1).toBe(result2);
    });

    test('should generate consistent cache keys', () => {
      const content = 'test content';
      const context = { pageName: 'Test' };
      
      const key1 = markupParser.generateCacheKey(content, context);
      const key2 = markupParser.generateCacheKey(content, context);
      
      expect(key1).toBe(key2);
    });

    test('should generate different cache keys for different content', () => {
      const context = { pageName: 'Test' };
      
      const key1 = markupParser.generateCacheKey('content 1', context);
      const key2 = markupParser.generateCacheKey('content 2', context);
      
      expect(key1).not.toBe(key2);
    });
  });

  describe('Handler Registration', () => {
    test('should register syntax handlers', () => {
      const mockHandler = {
        constructor: { name: 'TestHandler' },
        priority: 100,
        process: jest.fn()
      };
      
      markupParser.registerHandler(mockHandler);
      
      expect(markupParser.syntaxHandlers.has('TestHandler')).toBe(true);
      expect(markupParser.syntaxHandlers.get('TestHandler')).toBe(mockHandler);
    });

    test('should unregister syntax handlers', () => {
      const mockHandler = {
        constructor: { name: 'TestHandler' },
        priority: 100
      };
      
      markupParser.registerHandler(mockHandler);
      expect(markupParser.syntaxHandlers.has('TestHandler')).toBe(true);
      
      markupParser.unregisterHandler('TestHandler');
      expect(markupParser.syntaxHandlers.has('TestHandler')).toBe(false);
    });

    test('should execute registered handlers during content transformation', async () => {
      const mockHandler = {
        constructor: { name: 'TestHandler' },
        priority: 100,
        process: jest.fn().mockResolvedValue('transformed content')
      };
      
      markupParser.registerHandler(mockHandler);
      
      const content = 'original content';
      const result = await markupParser.parse(content);
      
      expect(mockHandler.process).toHaveBeenCalled();
      expect(result).toContain('transformed content');
    });
  });

  describe('Error Handling', () => {
    test('should handle phase errors gracefully', async () => {
      // Mock a phase to throw an error
      const originalPhase = markupParser.phases[0].process;
      markupParser.phases[0].process = jest.fn().mockRejectedValue(new Error('Phase error'));
      
      const content = 'test content';
      const result = await markupParser.parse(content);
      
      // Should not throw and should continue processing
      expect(result).toBeDefined();
      expect(markupParser.metrics.errorCount).toBe(1);
      
      // Restore original phase
      markupParser.phases[0].process = originalPhase;
    });

    test('should handle handler errors gracefully', async () => {
      const errorHandler = {
        constructor: { name: 'ErrorHandler' },
        priority: 100,
        process: jest.fn().mockRejectedValue(new Error('Handler error'))
      };
      
      markupParser.registerHandler(errorHandler);
      
      const content = 'test content';
      const result = await markupParser.parse(content);
      
      // Should continue processing despite handler error
      expect(result).toBeDefined();
    });

    test('should return original content on critical failure', async () => {
      // Mock all phases to fail
      markupParser.phases.forEach(phase => {
        phase.process = jest.fn().mockRejectedValue(new Error('Critical error'));
      });
      
      const content = 'original content';
      const result = await markupParser.parse(content);
      
      expect(result).toBe(content);
      expect(markupParser.metrics.errorCount).toBeGreaterThan(0);
    });
  });

  describe('Performance Metrics', () => {
    test('should track parse count and timing', async () => {
      const content = 'test content';
      
      await markupParser.parse(content);
      await markupParser.parse(content);
      
      const metrics = markupParser.getMetrics();
      
      expect(metrics.parseCount).toBe(2);
      expect(metrics.averageParseTime).toBeGreaterThan(0);
      expect(metrics.totalParseTime).toBeGreaterThan(0);
    });

    test('should track phase-specific metrics', async () => {
      const content = 'test content';
      
      await markupParser.parse(content);
      
      const metrics = markupParser.getMetrics();
      
      expect(metrics.phaseStats).toBeDefined();
      expect(Object.keys(metrics.phaseStats)).toHaveLength(7);
      
      Object.values(metrics.phaseStats).forEach(phaseStats => {
        expect(phaseStats.executionCount).toBe(1);
        expect(phaseStats.totalTime).toBeGreaterThanOrEqual(0);
      });
    });

    test('should calculate cache hit ratio', async () => {
      const content = 'test content';
      
      // First parse (cache miss)
      await markupParser.parse(content);
      
      // Second parse (cache hit)
      await markupParser.parse(content);
      
      const metrics = markupParser.getMetrics();
      
      expect(metrics.cacheHitRatio).toBe(0.5); // 1 hit out of 2 total
    });

    test('should reset metrics', () => {
      // Generate some metrics
      markupParser.metrics.parseCount = 5;
      markupParser.metrics.totalParseTime = 100;
      
      markupParser.resetMetrics();
      
      expect(markupParser.metrics.parseCount).toBe(0);
      expect(markupParser.metrics.totalParseTime).toBe(0);
    });
  });

  describe('HTML Cleanup', () => {
    test('should clean up generated HTML', () => {
      const messyHtml = '  <p>  Test  </p>   <p>Another</p>  ';
      const cleanedHtml = markupParser.cleanupHtml(messyHtml);
      
      expect(cleanedHtml).toBe('<p> Test </p>\n<p>Another</p>');
    });

    test('should remove excessive whitespace', () => {
      const messyHtml = '<div>   Multiple    spaces   </div>';
      const cleanedHtml = markupParser.cleanupHtml(messyHtml);
      
      expect(cleanedHtml).toBe('<div> Multiple spaces </div>');
    });
  });

  describe('Integration', () => {
    test('should work without CacheManager', async () => {
      // Create parser without cache manager
      const engineWithoutCache = new MockWikiEngine();
      engineWithoutCache.registerManager('VariableManager', mockVariableManager);
      engineWithoutCache.registerManager('RenderingManager', mockRenderingManager);
      
      const parserWithoutCache = new MarkupParser(engineWithoutCache);
      await parserWithoutCache.initialize();
      
      const result = await parserWithoutCache.parse('# Test');
      
      expect(result).toContain('<h1>Test</h1>');
      expect(parserWithoutCache.cache).toBeNull();
      
      await parserWithoutCache.shutdown();
    });

    test('should work without VariableManager', async () => {
      const engineWithoutVars = new MockWikiEngine();
      engineWithoutVars.registerManager('CacheManager', mockCacheManager);
      engineWithoutVars.registerManager('RenderingManager', mockRenderingManager);
      
      const parserWithoutVars = new MarkupParser(engineWithoutVars);
      await parserWithoutVars.initialize();
      
      const content = 'Text with ${variable}';
      const result = await parserWithoutVars.parse(content);
      
      // Variable should remain unexpanded
      expect(result).toContain('${variable}');
      
      await parserWithoutVars.shutdown();
    });
  });
});
