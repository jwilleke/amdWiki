/**
 * BaseFilter tests — abstract class via concrete subclass
 *
 * Covers:
 * - execute() disabled → returns content unchanged
 * - execute() success path → calls process() and updates stats
 * - execute() error path → increments errorCount, returns original content
 * - resetStats() clears stats
 * - toString() returns formatted string
 *
 * @jest-environment node
 */

import BaseFilter from '../BaseFilter';
import type { ParseContext } from '../BaseFilter';

class ConcreteFilter extends BaseFilter {
  processImpl: (content: string) => string | Promise<string> = (c) => c;

  constructor(priority = 100) {
    super(priority);
  }

  async process(content: string, _context: ParseContext): Promise<string> {
    const result = this.processImpl(content);
    if (result instanceof Promise) return result;
    return result;
  }

  getInfo() { return { id: this.filterId, features: [], stats: this.getStats() }; }
  onInitialize() { return Promise.resolve(); }
  loadModularSecurityConfiguration() {}
}

const ctx: ParseContext = { pageName: 'TestPage' };

describe('BaseFilter', () => {
  describe('constructor', () => {
    test('creates filter with default priority', () => {
      const f = new ConcreteFilter();
      expect(f.priority).toBe(100);
    });

    test('throws when instantiated directly', () => {
      expect(() => new (BaseFilter as unknown as new () => BaseFilter)()).toThrow('abstract');
    });

    test('throws for invalid priority', () => {
      expect(() => new ConcreteFilter(-1)).toThrow('Priority');
      expect(() => new ConcreteFilter(1001)).toThrow('Priority');
    });
  });

  describe('execute() — disabled filter', () => {
    test('returns content unchanged when disabled', async () => {
      const f = new ConcreteFilter();
      f['enabled'] = false;
      const result = await f.execute('hello world', ctx);
      expect(result).toBe('hello world');
    });
  });

  describe('execute() — success path', () => {
    test('calls process() and returns its result', async () => {
      const f = new ConcreteFilter();
      f.processImpl = (c) => c.toUpperCase();
      const result = await f.execute('hello', ctx);
      expect(result).toBe('HELLO');
    });

    test('increments executionCount', async () => {
      const f = new ConcreteFilter();
      await f.execute('test', ctx);
      await f.execute('test', ctx);
      expect(f.getStats().executionCount).toBe(2);
    });
  });

  describe('execute() — error path', () => {
    test('returns original content when process() throws', async () => {
      const f = new ConcreteFilter();
      f.processImpl = () => { throw new Error('process crashed'); };
      const result = await f.execute('original', ctx);
      expect(result).toBe('original');
    });

    test('increments errorCount when process() throws', async () => {
      const f = new ConcreteFilter();
      f.processImpl = () => { throw new Error('oops'); };
      await f.execute('x', ctx);
      expect(f.getStats().errorCount).toBe(1);
    });

    test('with reportErrors=true logs the error', async () => {
      const f = new ConcreteFilter();
      f['config'] = { enabled: true, priority: 100, timeout: 5000, cacheResults: false, cacheTTL: 0, reportErrors: true, logLevel: 'error' };
      f.processImpl = () => { throw new Error('reported error'); };
      await expect(f.execute('content', ctx)).resolves.toBe('content');
    });
  });

  describe('resetStats()', () => {
    test('resets all stats fields to zero', async () => {
      const f = new ConcreteFilter();
      await f.execute('test', ctx);
      f.resetStats();
      const stats = f.getStats();
      expect(stats.executionCount).toBe(0);
      expect(stats.totalTime).toBe(0);
      expect(stats.errorCount).toBe(0);
      expect(stats.lastExecuted).toBeNull();
    });
  });

  describe('toString()', () => {
    test('returns formatted string with filterId, priority, category, enabled', () => {
      const f = new ConcreteFilter();
      const str = f.toString();
      expect(str).toContain('ConcreteFilter');
      expect(str).toContain('priority=100');
      expect(str).toContain('enabled=true');
    });
  });
});
