/**
 * Tests for CounterPlugin
 */

const CounterPlugin = require('../CounterPlugin');

describe('CounterPlugin', () => {
  let mockContext;

  beforeEach(() => {
    // Fresh context for each test
    mockContext = {
      counters: {}
    };
  });

  describe('Basic functionality', () => {
    test('should have correct metadata', () => {
      expect(CounterPlugin.name).toBe('CounterPlugin');
      expect(CounterPlugin.version).toBe('1.0.0');
      expect(CounterPlugin.description).toBeDefined();
      expect(CounterPlugin.execute).toBeDefined();
      expect(typeof CounterPlugin.execute).toBe('function');
    });

    test('should increment default counter starting from 0', () => {
      const result1 = CounterPlugin.execute(mockContext, {});
      expect(result1).toBe('1');
      expect(mockContext.counters.counter).toBe(1);

      const result2 = CounterPlugin.execute(mockContext, {});
      expect(result2).toBe('2');
      expect(mockContext.counters.counter).toBe(2);

      const result3 = CounterPlugin.execute(mockContext, {});
      expect(result3).toBe('3');
      expect(mockContext.counters.counter).toBe(3);
    });

    test('should initialize counters object if not present', () => {
      const context = {};
      const result = CounterPlugin.execute(context, {});
      expect(result).toBe('1');
      expect(context.counters).toBeDefined();
      expect(context.counters.counter).toBe(1);
    });

    test('should return string representation of counter', () => {
      const result = CounterPlugin.execute(mockContext, {});
      expect(typeof result).toBe('string');
      expect(result).toBe('1');
    });
  });

  describe('Named counters', () => {
    test('should handle named counter', () => {
      const result1 = CounterPlugin.execute(mockContext, { name: 'chapter' });
      expect(result1).toBe('1');
      expect(mockContext.counters['counter-chapter']).toBe(1);

      const result2 = CounterPlugin.execute(mockContext, { name: 'chapter' });
      expect(result2).toBe('2');
      expect(mockContext.counters['counter-chapter']).toBe(2);
    });

    test('should maintain separate counters for different names', () => {
      CounterPlugin.execute(mockContext, { name: 'chapter' });
      CounterPlugin.execute(mockContext, { name: 'chapter' });
      expect(mockContext.counters['counter-chapter']).toBe(2);

      CounterPlugin.execute(mockContext, { name: 'section' });
      expect(mockContext.counters['counter-section']).toBe(1);

      CounterPlugin.execute(mockContext, {});
      expect(mockContext.counters.counter).toBe(1);

      // Verify all counters maintain their own state
      expect(mockContext.counters['counter-chapter']).toBe(2);
      expect(mockContext.counters['counter-section']).toBe(1);
      expect(mockContext.counters.counter).toBe(1);
    });

    test('should use "counter" as default counter name', () => {
      CounterPlugin.execute(mockContext, {});
      expect(mockContext.counters.counter).toBe(1);
      expect(mockContext.counters['counter-counter']).toBeUndefined();
    });
  });

  describe('Increment parameter', () => {
    test('should increment by custom value', () => {
      const result1 = CounterPlugin.execute(mockContext, { increment: '5' });
      expect(result1).toBe('5');

      const result2 = CounterPlugin.execute(mockContext, { increment: '5' });
      expect(result2).toBe('10');
    });

    test('should handle negative increment (decrement)', () => {
      CounterPlugin.execute(mockContext, { start: '10' });
      expect(mockContext.counters.counter).toBe(10);

      const result = CounterPlugin.execute(mockContext, { increment: '-1' });
      expect(result).toBe('9');

      const result2 = CounterPlugin.execute(mockContext, { increment: '-2' });
      expect(result2).toBe('7');
    });

    test('should handle increment value of 0', () => {
      CounterPlugin.execute(mockContext, { start: '5' });
      const result = CounterPlugin.execute(mockContext, { increment: '0' });
      expect(result).toBe('5');
    });

    test('should handle numeric increment value (not string)', () => {
      const result = CounterPlugin.execute(mockContext, { increment: 10 });
      expect(result).toBe('10');
    });

    test('should use default increment (1) for invalid values', () => {
      const result = CounterPlugin.execute(mockContext, { increment: 'invalid' });
      expect(result).toBe('1');
    });

    test('should handle decimal increment values', () => {
      const result1 = CounterPlugin.execute(mockContext, { increment: '2.5' });
      expect(result1).toBe('2.5');

      const result2 = CounterPlugin.execute(mockContext, { increment: '1.5' });
      expect(result2).toBe('4');
    });
  });

  describe('Start parameter', () => {
    test('should reset counter to start value', () => {
      const result = CounterPlugin.execute(mockContext, { start: '100' });
      expect(result).toBe('100');
      expect(mockContext.counters.counter).toBe(100);
    });

    test('should reset counter mid-sequence', () => {
      CounterPlugin.execute(mockContext, {});
      CounterPlugin.execute(mockContext, {});
      expect(mockContext.counters.counter).toBe(2);

      const result = CounterPlugin.execute(mockContext, { start: '1' });
      expect(result).toBe('1');
      expect(mockContext.counters.counter).toBe(1);

      const nextResult = CounterPlugin.execute(mockContext, {});
      expect(nextResult).toBe('2');
    });

    test('should use start value even with increment parameter', () => {
      const result = CounterPlugin.execute(mockContext, { start: '50', increment: '10' });
      expect(result).toBe('50');
      expect(mockContext.counters.counter).toBe(50);
    });

    test('should handle start value of 0', () => {
      const result = CounterPlugin.execute(mockContext, { start: '0' });
      expect(result).toBe('0');

      const nextResult = CounterPlugin.execute(mockContext, {});
      expect(nextResult).toBe('1');
    });

    test('should handle negative start values', () => {
      const result = CounterPlugin.execute(mockContext, { start: '-5' });
      expect(result).toBe('-5');

      const nextResult = CounterPlugin.execute(mockContext, {});
      expect(nextResult).toBe('-4');
    });

    test('should handle numeric start value (not string)', () => {
      const result = CounterPlugin.execute(mockContext, { start: 42 });
      expect(result).toBe('42');
    });

    test('should use 0 as default for invalid start values', () => {
      const result = CounterPlugin.execute(mockContext, { start: 'invalid' });
      expect(result).toBe('0');
    });
  });

  describe('ShowResult parameter', () => {
    test('should hide counter output when showResult is false', () => {
      const result = CounterPlugin.execute(mockContext, { showResult: 'false' });
      expect(result).toBe('');
      expect(mockContext.counters.counter).toBe(1);
    });

    test('should show counter output when showResult is true (default)', () => {
      const result = CounterPlugin.execute(mockContext, { showResult: 'true' });
      expect(result).toBe('1');
    });

    test('should show counter when showResult is omitted', () => {
      const result = CounterPlugin.execute(mockContext, {});
      expect(result).toBe('1');
    });

    test('should handle boolean showResult value', () => {
      const result1 = CounterPlugin.execute(mockContext, { showResult: false });
      expect(result1).toBe('');

      const result2 = CounterPlugin.execute(mockContext, { showResult: true });
      expect(result2).toBe('2');
    });

    test('should increment counter even when hidden', () => {
      CounterPlugin.execute(mockContext, { showResult: false });
      CounterPlugin.execute(mockContext, { showResult: false });
      expect(mockContext.counters.counter).toBe(2);

      const result = CounterPlugin.execute(mockContext, { showResult: true });
      expect(result).toBe('3');
    });

    test('should handle various boolean string representations', () => {
      // Test 'yes' and 'no'
      let ctx1 = {};
      let result1 = CounterPlugin.execute(ctx1, { showResult: 'yes' });
      expect(result1).toBe('1');

      let ctx2 = {};
      let result2 = CounterPlugin.execute(ctx2, { showResult: 'no' });
      expect(result2).toBe('');

      // Test '1' and '0'
      let ctx3 = {};
      let result3 = CounterPlugin.execute(ctx3, { showResult: '1' });
      expect(result3).toBe('1');

      let ctx4 = {};
      let result4 = CounterPlugin.execute(ctx4, { showResult: '0' });
      expect(result4).toBe('');
    });
  });

  describe('Combined parameters', () => {
    test('should handle name and increment together', () => {
      const result = CounterPlugin.execute(mockContext, {
        name: 'chapter',
        increment: '10'
      });
      expect(result).toBe('10');
      expect(mockContext.counters['counter-chapter']).toBe(10);
    });

    test('should handle name and start together', () => {
      const result = CounterPlugin.execute(mockContext, {
        name: 'section',
        start: '5'
      });
      expect(result).toBe('5');
      expect(mockContext.counters['counter-section']).toBe(5);
    });

    test('should handle start and showResult together', () => {
      const result = CounterPlugin.execute(mockContext, {
        start: '100',
        showResult: false
      });
      expect(result).toBe('');
      expect(mockContext.counters.counter).toBe(100);
    });

    test('should handle all parameters together', () => {
      const result = CounterPlugin.execute(mockContext, {
        name: 'item',
        start: '50',
        increment: '5',
        showResult: true
      });
      expect(result).toBe('50');
      expect(mockContext.counters['counter-item']).toBe(50);
    });
  });

  describe('JSPWiki compatibility', () => {
    test('should match JSPWiki counter behavior', () => {
      // [{Counter}], [{Counter}] should produce 1, 2
      const r1 = CounterPlugin.execute(mockContext, {});
      const r2 = CounterPlugin.execute(mockContext, {});
      expect(r1).toBe('1');
      expect(r2).toBe('2');
    });

    test('should support JSPWiki start parameter', () => {
      // [{Counter start=15}] should start at 15
      const result = CounterPlugin.execute(mockContext, { start: '15' });
      expect(result).toBe('15');
    });

    test('should support JSPWiki increment parameter', () => {
      // [{Counter increment=10}] should increment by 10
      const result = CounterPlugin.execute(mockContext, { increment: '10' });
      expect(result).toBe('10');
    });

    test('should support JSPWiki showResult=false', () => {
      // [{Counter showResult=false}] should increment silently
      const result = CounterPlugin.execute(mockContext, { showResult: 'false' });
      expect(result).toBe('');
      expect(mockContext.counters.counter).toBe(1);
    });

    test('should support named counters with counter- prefix', () => {
      // Named counter should be stored as counter-name
      CounterPlugin.execute(mockContext, { name: 'myCounter' });
      expect(mockContext.counters['counter-myCounter']).toBe(1);
    });
  });

  describe('Edge cases', () => {
    test('should handle empty params', () => {
      const result = CounterPlugin.execute(mockContext, {});
      expect(result).toBe('1');
    });

    test('should handle null params', () => {
      const result = CounterPlugin.execute(mockContext, null);
      expect(result).toBe('1');
    });

    test('should handle undefined params', () => {
      const result = CounterPlugin.execute(mockContext, undefined);
      expect(result).toBe('1');
    });

    test('should handle empty string parameters', () => {
      const result = CounterPlugin.execute(mockContext, {
        name: '',
        increment: '',
        showResult: ''
      });
      expect(result).toBe('1');
    });

    test('should handle context without counters property', () => {
      const context = { someOtherProperty: 'value' };
      const result = CounterPlugin.execute(context, {});
      expect(result).toBe('1');
      expect(context.counters).toBeDefined();
    });

    test('should handle very large numbers', () => {
      const result = CounterPlugin.execute(mockContext, {
        start: '999999999'
      });
      expect(result).toBe('999999999');
    });

    test('should handle scientific notation', () => {
      const result = CounterPlugin.execute(mockContext, {
        increment: '1e2'
      });
      expect(result).toBe('100');
    });
  });

  describe('Error handling', () => {
    test('should return error message on exception', () => {
      // Force an error by making counters throw
      const badContext = {
        get counters() {
          throw new Error('Test error');
        },
        set counters(val) {
          throw new Error('Test error');
        }
      };

      const result = CounterPlugin.execute(badContext, {});
      expect(result).toContain('Counter Error');
    });

    test('should log errors to console', () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});

      // Invalid increment should trigger warning
      CounterPlugin.execute(mockContext, { increment: 'not-a-number' });

      consoleErrorSpy.mockRestore();
      consoleWarnSpy.mockRestore();
    });
  });

  describe('Initialize method', () => {
    test('should have initialize method', () => {
      expect(CounterPlugin.initialize).toBeDefined();
      expect(typeof CounterPlugin.initialize).toBe('function');
    });

    test('should not throw on initialization', () => {
      const mockEngine = {
        getManager: jest.fn()
      };
      expect(() => CounterPlugin.initialize(mockEngine)).not.toThrow();
    });

    test('should register counter variable with VariableManager', () => {
      const mockRegisterVariable = jest.fn();
      const mockVariableManager = {
        registerVariable: mockRegisterVariable
      };
      const mockEngine = {
        getManager: jest.fn((name) => {
          if (name === 'VariableManager') return mockVariableManager;
          return null;
        })
      };

      CounterPlugin.initialize(mockEngine);

      expect(mockEngine.getManager).toHaveBeenCalledWith('VariableManager');
      expect(mockRegisterVariable).toHaveBeenCalledWith('counter', expect.any(Function));
    });

    test('should handle missing VariableManager gracefully', () => {
      const mockEngine = {
        getManager: jest.fn(() => null)
      };

      // Should not throw when VariableManager is missing (silently skips registration)
      expect(() => CounterPlugin.initialize(mockEngine)).not.toThrow();
    });

    test('should register functional counter variable handler', () => {
      let registeredHandler;
      const mockVariableManager = {
        registerVariable: (name, handler) => {
          registeredHandler = handler;
        }
      };
      const mockEngine = {
        getManager: () => mockVariableManager
      };

      CounterPlugin.initialize(mockEngine);

      // Test the registered handler
      const testContext = { counters: { counter: 42 } };
      const result = registeredHandler(testContext);
      expect(result).toBe('42');

      // Test with missing counter
      const emptyContext = {};
      const emptyResult = registeredHandler(emptyContext);
      expect(emptyResult).toBe('0');
    });
  });

  describe('Helper methods', () => {
    describe('parseNumber', () => {
      test('should parse valid numbers', () => {
        expect(CounterPlugin.parseNumber('42', 0)).toBe(42);
        expect(CounterPlugin.parseNumber('3.14', 0)).toBe(3.14);
        expect(CounterPlugin.parseNumber('-10', 0)).toBe(-10);
      });

      test('should return default for invalid input', () => {
        expect(CounterPlugin.parseNumber('invalid', 99)).toBe(99);
        expect(CounterPlugin.parseNumber(undefined, 5)).toBe(5);
        expect(CounterPlugin.parseNumber(null, 10)).toBe(10);
        expect(CounterPlugin.parseNumber('', 7)).toBe(7);
      });

      test('should handle numeric input', () => {
        expect(CounterPlugin.parseNumber(42, 0)).toBe(42);
        expect(CounterPlugin.parseNumber(-5, 0)).toBe(-5);
      });
    });

    describe('parseBoolean', () => {
      test('should parse true values', () => {
        expect(CounterPlugin.parseBoolean('true', false)).toBe(true);
        expect(CounterPlugin.parseBoolean('TRUE', false)).toBe(true);
        expect(CounterPlugin.parseBoolean('yes', false)).toBe(true);
        expect(CounterPlugin.parseBoolean('YES', false)).toBe(true);
        expect(CounterPlugin.parseBoolean('1', false)).toBe(true);
        expect(CounterPlugin.parseBoolean(true, false)).toBe(true);
      });

      test('should parse false values', () => {
        expect(CounterPlugin.parseBoolean('false', true)).toBe(false);
        expect(CounterPlugin.parseBoolean('FALSE', true)).toBe(false);
        expect(CounterPlugin.parseBoolean('no', true)).toBe(false);
        expect(CounterPlugin.parseBoolean('NO', true)).toBe(false);
        expect(CounterPlugin.parseBoolean('0', true)).toBe(false);
        expect(CounterPlugin.parseBoolean(false, true)).toBe(false);
      });

      test('should return default for invalid input', () => {
        expect(CounterPlugin.parseBoolean('invalid', true)).toBe(true);
        expect(CounterPlugin.parseBoolean('invalid', false)).toBe(false);
        expect(CounterPlugin.parseBoolean(undefined, true)).toBe(true);
        expect(CounterPlugin.parseBoolean(null, false)).toBe(false);
        expect(CounterPlugin.parseBoolean('', true)).toBe(true);
      });
    });
  });
});
