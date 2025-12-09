const { BaseSyntaxHandler, HandlerExecutionError } = require('../BaseSyntaxHandler');

// Mock context for testing
const createMockContext = (overrides = {}) => ({
  pageName: 'TestPage',
  userName: 'TestUser',
  getTotalTime: () => 100,
  engine: {
    getManager: jest.fn(() => null)
  },
  ...overrides
});

// Test handler implementations
class TestHandler extends BaseSyntaxHandler {
  constructor(priority = 100, options = {}) {
    super(/test-pattern/g, priority, options);
  }

  async process(content, context) {
    return content.replace(this.pattern, 'PROCESSED');
  }

  async handle(match, context) {
    return 'HANDLED';
  }
}

class AsyncTestHandler extends BaseSyntaxHandler {
  constructor() {
    super(/async-test/g, 200);
  }

  async process(content, context) {
    await new Promise(resolve => setTimeout(resolve, 10));
    return content.replace(this.pattern, 'ASYNC_PROCESSED');
  }

  async handle(match, context) {
    return 'ASYNC_HANDLED';
  }
}

class ErrorTestHandler extends BaseSyntaxHandler {
  constructor() {
    super(/error-test/g, 150);
  }

  async process(content, context) {
    throw new Error('Test error');
  }

  async handle(match, context) {
    throw new Error('Test handle error');
  }
}

class TimeoutTestHandler extends BaseSyntaxHandler {
  constructor() {
    super(/timeout-test/g, 100, { timeout: 50 });
  }

  async process(content, context) {
    await new Promise(resolve => setTimeout(resolve, 100));
    return content;
  }

  async handle(match, context) {
    return 'TIMEOUT_HANDLED';
  }
}

class DependentHandler extends BaseSyntaxHandler {
  constructor() {
    super(/dependent-test/g, 100, {
      dependencies: ['TestManager', { type: 'handler', name: 'TestHandler' }]
    });
  }

  async process(content, context) {
    return content.replace(this.pattern, 'DEPENDENT_PROCESSED');
  }

  async handle(match, context) {
    return 'DEPENDENT_HANDLED';
  }
}

describe('BaseSyntaxHandler', () => {
  describe('Constructor', () => {
    test('should not allow direct instantiation', () => {
      expect(() => {
        new BaseSyntaxHandler(/test/, 100);
      }).toThrow('BaseSyntaxHandler is abstract');
    });

    test('should require pattern parameter', () => {
      class NoPatternHandler extends BaseSyntaxHandler {
        constructor() {
          super(null, 100);
        }
        async process() { return ''; }
        async handle() { return ''; }
      }
      
      expect(() => {
        new NoPatternHandler();
      }).toThrow('Pattern is required');
    });

    test('should validate priority range', () => {
      expect(() => {
        new TestHandler(-1);
      }).toThrow('Priority must be a number between 0 and 1000');

      expect(() => {
        new TestHandler(1001);
      }).toThrow('Priority must be a number between 0 and 1000');
    });

    test('should create handler with valid parameters', () => {
      const handler = new TestHandler(200, { description: 'Test handler' });
      
      expect(handler.handlerId).toBe('TestHandler');
      expect(handler.priority).toBe(200);
      expect(handler.description).toBe('Test handler');
      expect(handler.pattern.source).toBe('test-pattern');
      expect(handler.enabled).toBe(true);
      expect(handler.initialized).toBe(false);
    });

    test('should compile string patterns to RegExp', () => {
      class StringPatternHandler extends BaseSyntaxHandler {
        constructor() {
          super('test-string', 100);
        }
        async process(content) { return content; }
        async handle() { return ''; }
      }

      const handler = new StringPatternHandler();
      expect(handler.pattern).toBeInstanceOf(RegExp);
      expect(handler.pattern.source).toContain('test-string');
    });
  });

  describe('Initialization', () => {
    test('should initialize handler successfully', async () => {
      const handler = new TestHandler();
      const context = createMockContext();
      
      await handler.initialize(context);
      
      expect(handler.initialized).toBe(true);
    });

    test('should not initialize twice', async () => {
      const handler = new TestHandler();
      const context = createMockContext();
      
      const initSpy = jest.spyOn(handler, 'onInitialize');
      
      await handler.initialize(context);
      await handler.initialize(context); // Second call
      
      expect(initSpy).toHaveBeenCalledTimes(1);
      expect(handler.initialized).toBe(true);
    });

    test('should validate dependencies during initialization', async () => {
      const handler = new DependentHandler();
      const context = createMockContext();

      // Implementation stores dependency errors rather than throwing
      await handler.initialize(context);

      // Check that dependency errors were recorded
      expect(handler.dependencyErrors).toBeDefined();
      expect(handler.dependencyErrors.length).toBeGreaterThan(0);
      expect(handler.dependencyErrors[0].message).toContain('requires TestManager manager');
    });

    test('should initialize with valid dependencies', async () => {
      const handler = new DependentHandler();
      const mockEngine = {
        getManager: jest.fn((name) => name === 'TestManager' ? {} : null)
      };
      const mockHandlerRegistry = {
        getHandler: jest.fn((name) => name === 'TestHandler' ? new TestHandler() : null)
      };
      const context = createMockContext({ 
        engine: mockEngine,
        handlerRegistry: mockHandlerRegistry
      });
      
      await handler.initialize(context);
      expect(handler.initialized).toBe(true);
    });
  });

  describe('Execution', () => {
    test('should execute handler successfully', async () => {
      const handler = new TestHandler();
      const context = createMockContext();
      await handler.initialize(context);
      
      const result = await handler.execute('test-pattern content', context);
      
      expect(result).toBe('PROCESSED content');
      expect(handler.stats.executionCount).toBe(1);
      expect(handler.stats.totalTime).toBeGreaterThanOrEqual(0);
    });

    test('should not execute disabled handler', async () => {
      const handler = new TestHandler();
      const context = createMockContext();
      await handler.initialize(context);
      
      handler.disable();
      
      const result = await handler.execute('test-pattern content', context);
      
      expect(result).toBe('test-pattern content'); // Unchanged
      expect(handler.stats.executionCount).toBe(0);
    });

    test('should handle async processing', async () => {
      const handler = new AsyncTestHandler();
      const context = createMockContext();
      await handler.initialize(context);
      
      const result = await handler.execute('async-test content', context);
      
      expect(result).toBe('ASYNC_PROCESSED content');
      expect(handler.stats.executionCount).toBe(1);
    });

    test('should handle execution errors gracefully', async () => {
      const handler = new ErrorTestHandler();
      const context = createMockContext();
      await handler.initialize(context);
      
      await expect(handler.execute('error-test content', context)).rejects.toThrow(HandlerExecutionError);
      expect(handler.stats.errorCount).toBe(1);
    });

    test('should handle timeout errors', async () => {
      const handler = new TimeoutTestHandler();
      const context = createMockContext();
      await handler.initialize(context);
      
      await expect(handler.execute('timeout-test content', context)).rejects.toThrow('timed out');
      expect(handler.stats.errorCount).toBe(1);
    });

    test('should update performance statistics', async () => {
      const handler = new TestHandler();
      const context = createMockContext();
      await handler.initialize(context);
      
      await handler.execute('test-pattern content', context);
      await handler.execute('test-pattern more', context);
      
      expect(handler.stats.executionCount).toBe(2);
      expect(handler.stats.averageTime).toBeGreaterThanOrEqual(0);
      expect(handler.stats.lastExecuted).toBeInstanceOf(Date);
    });
  });

  describe('Parameter Parsing', () => {
    test('should parse simple parameters', () => {
      const handler = new TestHandler();
      
      const params = handler.parseParameters('key1=value1 key2=value2');
      
      expect(params).toEqual({
        key1: 'value1',
        key2: 'value2'
      });
    });

    test('should parse quoted parameters', () => {
      const handler = new TestHandler();
      
      const params = handler.parseParameters("key1='quoted value' key2=\"double quoted\"");
      
      expect(params).toEqual({
        key1: 'quoted value',
        key2: 'double quoted'
      });
    });

    test('should parse JSON parameters', () => {
      const handler = new TestHandler();
      
      const params = handler.parseParameters('number=123 boolean=true object={"key":"value"}');
      
      expect(params).toEqual({
        number: 123,
        boolean: true,
        object: { key: 'value' }
      });
    });

    test('should handle empty parameter string', () => {
      const handler = new TestHandler();
      
      const params = handler.parseParameters('');
      
      expect(params).toEqual({});
    });
  });

  describe('Parameter Validation', () => {
    test('should validate parameters against schema', () => {
      const handler = new TestHandler();
      const schema = {
        name: { type: 'string', required: true },
        count: { type: 'number', min: 1, max: 100 },
        enabled: { type: 'boolean', default: true }
      };
      
      const result = handler.validateParameters(
        { name: 'test', count: 50 },
        schema
      );
      
      expect(result.isValid).toBe(true);
      expect(result.params).toEqual({
        name: 'test',
        count: 50,
        enabled: true // default value
      });
    });

    test('should return validation errors', () => {
      const handler = new TestHandler();
      const schema = {
        name: { type: 'string', required: true },
        count: { type: 'number', min: 1, max: 100 }
      };
      
      const result = handler.validateParameters(
        { count: 150 }, // missing name, count too high
        schema
      );
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveLength(2);
      expect(result.errors[0]).toContain('required');
      expect(result.errors[1]).toContain('<= 100');
    });

    test('should validate pattern matching', () => {
      const handler = new TestHandler();
      const schema = {
        email: { type: 'string', pattern: '^[^@]+@[^@]+\\.[^@]+$' }
      };
      
      const validResult = handler.validateParameters(
        { email: 'test@example.com' },
        schema
      );
      expect(validResult.isValid).toBe(true);
      
      const invalidResult = handler.validateParameters(
        { email: 'invalid-email' },
        schema
      );
      expect(invalidResult.isValid).toBe(false);
    });
  });

  describe('Handler Management', () => {
    test('should enable and disable handler', () => {
      const handler = new TestHandler();
      
      expect(handler.isEnabled()).toBe(true);
      
      handler.disable();
      expect(handler.isEnabled()).toBe(false);
      
      handler.enable();
      expect(handler.isEnabled()).toBe(true);
    });

    test('should get handler statistics', () => {
      const handler = new TestHandler();
      
      const stats = handler.getStats();
      
      expect(stats).toHaveProperty('handlerId', 'TestHandler');
      expect(stats).toHaveProperty('priority', 100);
      expect(stats).toHaveProperty('executionCount', 0);
      expect(stats).toHaveProperty('enabled', true);
    });

    test('should reset statistics', () => {
      const handler = new TestHandler();
      handler.stats.executionCount = 5;
      handler.stats.totalTime = 100;
      
      handler.resetStats();
      
      expect(handler.stats.executionCount).toBe(0);
      expect(handler.stats.totalTime).toBe(0);
    });

    test('should get handler metadata', () => {
      const handler = new TestHandler(200, { 
        version: '2.0.0',
        description: 'Test handler'
      });
      
      const metadata = handler.getMetadata();
      
      expect(metadata).toHaveProperty('id', 'TestHandler');
      expect(metadata).toHaveProperty('version', '2.0.0');
      expect(metadata).toHaveProperty('description', 'Test handler');
      expect(metadata).toHaveProperty('priority', 200);
      expect(metadata).toHaveProperty('pattern', 'test-pattern');
    });
  });

  describe('Lifecycle Management', () => {
    test('should shutdown handler successfully', async () => {
      const handler = new TestHandler();
      const context = createMockContext();
      
      await handler.initialize(context);
      expect(handler.initialized).toBe(true);
      
      await handler.shutdown();
      expect(handler.initialized).toBe(false);
    });

    test('should clone handler with overrides', () => {
      // TestHandler constructor: (priority = 100, options = {})
      const handler = new TestHandler(200, { description: 'Original' });

      const cloneConfig = handler.clone({ priority: 300, description: 'Cloned' });

      expect(cloneConfig).toHaveProperty('handlerId', 'TestHandler');
      expect(cloneConfig).toHaveProperty('priority', 300);
      expect(cloneConfig).toHaveProperty('description', 'Cloned');
      expect(cloneConfig.pattern).toBe(handler.pattern);
    });

    test('should have string representation', () => {
      const handler = new TestHandler(150);
      
      const str = handler.toString();
      
      expect(str).toBe('TestHandler(priority=150, pattern=test-pattern)');
    });
  });

  describe('Error Handling', () => {
    test('should create detailed error context', () => {
      const handler = new TestHandler();
      const error = new Error('Test error');
      const content = 'test content';
      const context = createMockContext();
      
      const errorContext = handler.createErrorContext(error, content, context);
      
      expect(errorContext).toHaveProperty('handlerId', 'TestHandler');
      expect(errorContext).toHaveProperty('error', 'Test error');
      expect(errorContext).toHaveProperty('contentLength', content.length);
      expect(errorContext).toHaveProperty('context');
      expect(errorContext).toHaveProperty('timestamp');
    });

    test('should handle graceful degradation option', async () => {
      class GracefulHandler extends BaseSyntaxHandler {
        constructor() {
          super(/graceful-test/g, 100, { throwOnError: false });
        }
        
        async process(content, context) {
          throw new Error('Graceful error');
        }
        
        async handle() { return ''; }
      }

      const handler = new GracefulHandler();
      const context = createMockContext();
      await handler.initialize(context);
      
      const result = await handler.execute('graceful-test content', context);
      
      // Should return original content on error
      expect(result).toBe('graceful-test content');
      expect(handler.stats.errorCount).toBe(1);
    });
  });
});

describe('HandlerExecutionError', () => {
  test('should create error with context', () => {
    const context = { test: 'data' };
    const error = new HandlerExecutionError('Test message', 'TestHandler', context);
    
    expect(error.name).toBe('HandlerExecutionError');
    expect(error.message).toBe('Test message');
    expect(error.handlerId).toBe('TestHandler');
    expect(error.context).toBe(context);
  });
});
