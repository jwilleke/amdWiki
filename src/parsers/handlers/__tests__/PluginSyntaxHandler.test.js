const PluginSyntaxHandler = require('../PluginSyntaxHandler');
const ParseContext = require('../../context/ParseContext');

// Mock PluginManager
class MockPluginManager {
  // Method called by PluginSyntaxHandler
  async execute(pluginName, pageName, params, context) {
    return `<div class="plugin-${pluginName.toLowerCase()}">${JSON.stringify(params)}</div>`;
  }

  // Legacy alias
  async executePlugin(pluginName, params, context) {
    return this.execute(pluginName, '', params, context);
  }
}

// Mock engine
const createMockEngine = () => ({
  getManager: jest.fn((name) => {
    if (name === 'PluginManager') return new MockPluginManager();
    return null;
  })
});

describe('PluginSyntaxHandler', () => {
  let handler;
  let mockEngine;
  let context;

  beforeEach(async () => {
    mockEngine = createMockEngine();
    handler = new PluginSyntaxHandler();
    context = new ParseContext('test content', { pageName: 'TestPage' }, mockEngine);
    
    await handler.initialize({ engine: mockEngine });
  });

  afterEach(async () => {
    await handler.shutdown();
  });

  describe('Initialization', () => {
    test('should initialize with correct properties', () => {
      expect(handler.handlerId).toBe('PluginSyntaxHandler');
      expect(handler.priority).toBe(90);
      expect(handler.pattern.source).toContain('\\[\\{(\\w+)');
      expect(handler.dependencies).toContain('PluginManager');
    });

    test('should get handler info', () => {
      const info = handler.getInfo();
      
      expect(info).toHaveProperty('id', 'PluginSyntaxHandler');
      expect(info).toHaveProperty('supportedPatterns');
      expect(info).toHaveProperty('features');
      expect(info.features).toContain('Complex parameter parsing');
    });
  });

  describe('Parameter Parsing', () => {
    test('should parse simple parameters', () => {
      const params = handler.parseParameters('max=10 type=recent');
      
      expect(params).toEqual({
        max: 10,
        type: 'recent'
      });
    });

    test('should parse quoted parameters', () => {
      const params = handler.parseParameters("title='Recent Changes' description=\"Show recent page changes\"");
      
      expect(params).toEqual({
        title: 'Recent Changes',
        description: 'Show recent page changes'
      });
    });

    test('should parse JSON parameters', () => {
      const params = handler.parseParameters('config={"enabled":true,"count":5} tags=["wiki","docs"]');
      
      expect(params).toEqual({
        config: { enabled: true, count: 5 },
        tags: ['wiki', 'docs']
      });
    });

    test('should parse boolean and numeric parameters', () => {
      const params = handler.parseParameters('enabled=true count=25 ratio=3.14');
      
      expect(params).toEqual({
        enabled: true,
        count: 25,
        ratio: 3.14
      });
    });

    test('should handle empty parameter string', () => {
      const params = handler.parseParameters('');
      expect(params).toEqual({});
      
      const params2 = handler.parseParameters(null);
      expect(params2).toEqual({});
    });
  });

  describe('Parameter Validation', () => {
    test('should validate safe parameters', () => {
      const params = { title: 'Safe Title', count: 10 };
      const result = handler.validatePluginParameters('TestPlugin', params);
      
      expect(result.isValid).toBe(true);
      expect(result.params).toEqual(params);
    });

    test('should reject unsafe script content', () => {
      const params = { 
        title: '<script>alert("xss")</script>',
        content: 'javascript:void(0)'
      };
      const result = handler.validatePluginParameters('TestPlugin', params);
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveLength(2);
      expect(result.errors[0]).toContain('unsafe content');
    });

    test('should allow safe HTML content', () => {
      const params = { 
        title: '<strong>Bold Title</strong>',
        description: 'Safe content with <em>emphasis</em>'
      };
      const result = handler.validatePluginParameters('TestPlugin', params);
      
      expect(result.isValid).toBe(true);
      expect(result.params).toEqual(params);
    });
  });

  describe('Plugin Execution', () => {
    test('should execute simple plugin', async () => {
      const content = '[{TestPlugin}]';
      const result = await handler.process(content, context);
      
      expect(result).toContain('<div class="plugin-testplugin">');
      expect(result).toContain('{}'); // Empty parameters
    });

    test('should execute plugin with parameters', async () => {
      const content = '[{RecentChanges max=5 type=recent}]';
      const result = await handler.process(content, context);
      
      expect(result).toContain('<div class="plugin-recentchanges">');
      expect(result).toContain('"max":5');
      expect(result).toContain('"type":"recent"');
    });

    test('should execute multiple plugins', async () => {
      const content = 'Before [{Plugin1 param=value1}] middle [{Plugin2 param=value2}] after';
      const result = await handler.process(content, context);
      
      expect(result).toContain('Before <div class="plugin-plugin1">');
      expect(result).toContain('middle <div class="plugin-plugin2">');
      expect(result).toContain('after');
    });

    test('should handle plugin execution errors', async () => {
      // Mock plugin manager to throw error
      const errorEngine = {
        getManager: jest.fn(() => ({
          execute: jest.fn().mockRejectedValue(new Error('Plugin execution failed'))
        }))
      };

      const errorContext = new ParseContext('test', { pageName: 'Test' }, errorEngine);
      const content = '[{FailingPlugin}]';

      const result = await handler.process(content, errorContext);

      expect(result).toContain('<!-- Plugin Error: FailingPlugin');
      expect(result).toContain('Plugin execution failed');
    });

    test('should handle missing PluginManager', async () => {
      const noPluginEngine = {
        getManager: jest.fn(() => null)
      };
      
      const noPluginContext = new ParseContext('test', { pageName: 'Test' }, noPluginEngine);
      const content = '[{TestPlugin}]';
      
      const result = await handler.process(content, noPluginContext);
      
      expect(result).toContain('<!-- Plugin Error: TestPlugin');
      expect(result).toContain('PluginManager not available');
    });
  });

  describe('Complex Parameter Scenarios', () => {
    test('should handle parameters with spaces in quotes', async () => {
      const content = '[{TestPlugin title=\'Plugin with spaces\' description="Long description here"}]';
      const result = await handler.process(content, context);
      
      expect(result).toContain('"title":"Plugin with spaces"');
      expect(result).toContain('"description":"Long description here"');
    });

    test('should handle mixed parameter types', async () => {
      const content = '[{ComplexPlugin count=10 enabled=true name=test}]';
      const result = await handler.process(content, context);
      
      expect(result).toContain('"count":10');
      expect(result).toContain('"enabled":true');
      expect(result).toContain('"name":"test"');
    });

    test('should preserve plugin order in content', async () => {
      const content = 'Start [{Plugin1}] middle [{Plugin2}] end';
      const result = await handler.process(content, context);
      
      const plugin1Index = result.indexOf('plugin-plugin1');
      const plugin2Index = result.indexOf('plugin-plugin2');
      
      expect(plugin1Index).toBeLessThan(plugin2Index);
    });
  });

  describe('Error Handling and Security', () => {
    test('should prevent XSS in plugin parameters', async () => {
      const content = '[{TestPlugin script=\'<script>alert("xss")</script>\' js=\'javascript:void(0)\'}]';
      const result = await handler.process(content, context);
      
      expect(result).toContain('<!-- Plugin Error: TestPlugin');
      expect(result).toContain('unsafe content');
    });

    test('should handle malformed plugin syntax', async () => {
      const content = '[{MalformedPlugin param=unclosed quote param2=value}]';
      const result = await handler.process(content, context);
      
      // Should execute with whatever parameters it could parse
      expect(result).toContain('<div class="plugin-malformedplugin">');
    });

    test('should handle arrays as parameters', async () => {
      // Note: JSON with curly braces inside plugin syntax is problematic
      // because the plugin pattern [^}]* consumes up to the first }
      // Arrays work because they don't contain curly braces
      const content = "[{TestPlugin tags='[\"wiki\",\"docs\"]'}]";
      const result = await handler.process(content, context);

      expect(result).toContain('"tags":["wiki","docs"]');
    });
  });

  describe('Performance', () => {
    test('should handle large content efficiently', async () => {
      // Generate content with many plugins
      const plugins = Array.from({length: 50}, (_, i) => `[{Plugin${i} id=${i}}]`);
      const content = plugins.join('\n\n');
      
      const startTime = Date.now();
      const result = await handler.process(content, context);
      const processingTime = Date.now() - startTime;
      
      expect(processingTime).toBeLessThan(1000); // Should complete in under 1 second
      expect(result).toContain('plugin-plugin0');
      expect(result).toContain('plugin-plugin49');
    });

    test('should track execution statistics', async () => {
      const content = '[{TestPlugin param=value}]';
      
      await handler.execute(content, context);
      await handler.execute(content, context);
      
      const stats = handler.getStats();
      expect(stats.executionCount).toBe(2);
      expect(stats.totalTime).toBeGreaterThanOrEqual(0);
      expect(stats.lastExecuted).toBeInstanceOf(Date);
    });
  });

  describe('Integration', () => {
    test('should integrate with MarkupParser', async () => {
      const MarkupParser = require('../../MarkupParser');
      const parser = new MarkupParser(mockEngine);

      // Initialize parser - this auto-registers PluginSyntaxHandler
      await parser.initialize();

      // No need to register handler - it's auto-registered during initialize()
      const content = 'Text with [{TestPlugin param=test}] embedded.';
      const result = await parser.parse(content);

      // The plugin output includes data attributes and class name
      expect(result).toContain('class="plugin-testplugin"');
      expect(result).toContain('data-plugin="TestPlugin"');
      expect(result).toContain('"param":"test"');

      await parser.shutdown();
    });
  });
});
