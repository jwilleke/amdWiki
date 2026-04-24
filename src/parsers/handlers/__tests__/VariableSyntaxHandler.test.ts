/**
 * VariableSyntaxHandler tests
 *
 * Covers:
 * - process() with no variableManager → returns content unchanged
 * - process() with empty content → returns empty
 * - process() resolves known variable
 * - process() keeps unknown variable as-is (logs warn)
 * - process() with async handler → keeps as-is
 * - process() handler throws → replaces with [Error: ...]
 * - onInitialize() wires up variableManager
 * - onInitialize() graceful when VariableManager absent
 *
 * @jest-environment node
 */

import VariableSyntaxHandler from '../VariableSyntaxHandler';

const makeVariableManager = (vars: Record<string, () => string | null> = {}) => ({
  variableHandlers: new Map(Object.entries(vars))
});

const ctx = { pageName: 'TestPage', engine: { getManager: vi.fn(() => null) } };

describe('VariableSyntaxHandler', () => {
  describe('metadata', () => {
    test('has correct handlerId', () => {
      const handler = new VariableSyntaxHandler();
      expect(handler.handlerId).toBe('VariableSyntaxHandler');
    });

    test('has priority 95', () => {
      const handler = new VariableSyntaxHandler();
      expect(handler.priority).toBe(95);
    });
  });

  describe('process() — no variableManager', () => {
    test('returns content unchanged when no variableManager', async () => {
      const handler = new VariableSyntaxHandler();
      const content = '[{$version}] some text';
      const result = await handler.process(content, ctx);
      expect(result).toBe(content);
    });

    test('returns empty string for empty content', async () => {
      const handler = new VariableSyntaxHandler();
      const result = await handler.process('', ctx);
      expect(result).toBe('');
    });
  });

  describe('process() — with variableManager', () => {
    let handler: VariableSyntaxHandler;

    beforeEach(() => {
      handler = new VariableSyntaxHandler();
      // Inject variableManager directly
      (handler as unknown as { variableManager: unknown }).variableManager = makeVariableManager({
        version: () => '3.0.0',
        date: () => '2026-04-24',
        nullvar: () => null
      });
    });

    test('resolves known variable to its value', async () => {
      const result = await handler.process('[{$version}]', ctx);
      expect(result).toBe('3.0.0');
    });

    test('resolves variable in surrounding text', async () => {
      const result = await handler.process('Current version: [{$version}] released', ctx);
      expect(result).toBe('Current version: 3.0.0 released');
    });

    test('resolves multiple variables', async () => {
      const result = await handler.process('[{$version}] on [{$date}]', ctx);
      expect(result).toBe('3.0.0 on 2026-04-24');
    });

    test('keeps unknown variable syntax unchanged', async () => {
      const result = await handler.process('[{$unknownvar}]', ctx);
      expect(result).toBe('[{$unknownvar}]');
    });

    test('keeps variable with null handler result unchanged', async () => {
      const result = await handler.process('[{$nullvar}]', ctx);
      expect(result).toBe('[{$nullvar}]');
    });

    test('returns content unchanged when no variable patterns', async () => {
      const content = 'Regular content with no variables.';
      const result = await handler.process(content, ctx);
      expect(result).toBe(content);
    });

    test('handles empty content with variableManager', async () => {
      const result = await handler.process('', ctx);
      expect(result).toBe('');
    });
  });

  describe('process() — async variable handler', () => {
    test('keeps variable as-is when handler returns Promise', async () => {
      const handler = new VariableSyntaxHandler();
      (handler as unknown as { variableManager: unknown }).variableManager = {
        variableHandlers: new Map([
          ['asyncvar', () => Promise.resolve('async-value')]
        ])
      };
      const result = await handler.process('[{$asyncvar}]', ctx);
      // async handlers cannot be resolved synchronously → kept as-is
      expect(result).toBe('[{$asyncvar}]');
    });
  });

  describe('process() — handler throws', () => {
    test('replaces with [Error: message] when handler throws', async () => {
      const handler = new VariableSyntaxHandler();
      (handler as unknown as { variableManager: unknown }).variableManager = {
        variableHandlers: new Map([
          ['badvar', () => { throw new Error('handler exploded'); }]
        ])
      };
      const result = await handler.process('[{$badvar}]', ctx);
      expect(result).toContain('[Error:');
    });
  });

  describe('onInitialize()', () => {
    test('wires up variableManager from engine', async () => {
      const mockVm = makeVariableManager({ appname: () => 'TestApp' });
      const mockEngine = { getManager: vi.fn((n: string) => n === 'VariableManager' ? mockVm : null) };
      const handler = new VariableSyntaxHandler();
      // Call onInitialize via the protected path (cast to any)
      await (handler as unknown as { onInitialize: (ctx: unknown) => Promise<void> }).onInitialize({ engine: mockEngine });
      const result = await handler.process('[{$appname}]', ctx);
      expect(result).toBe('TestApp');
    });

    test('does not throw when VariableManager absent', async () => {
      const mockEngine = { getManager: vi.fn(() => null) };
      const handler = new VariableSyntaxHandler();
      await expect(
        (handler as unknown as { onInitialize: (ctx: unknown) => Promise<void> }).onInitialize({ engine: mockEngine })
      ).resolves.not.toThrow();
    });
  });
});
