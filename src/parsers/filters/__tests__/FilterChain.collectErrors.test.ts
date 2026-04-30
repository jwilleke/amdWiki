/**
 * Unit tests for FilterChain.collectErrors() — the save-time validation entry
 * point added in #596. Covers the contract:
 *   - Returns empty when content is empty / chain is disabled.
 *   - Returns empty when no registered filter exposes collectErrors.
 *   - Aggregates errors across multiple filters that opt in.
 *   - Skips disabled filters.
 *   - Swallows individual filter errors and logs (never throws).
 */

import { describe, test, expect, beforeEach } from 'vitest';
import FilterChain from '../FilterChain';
import BaseFilter from '../BaseFilter';
import type { FilterValidationError } from '../FilterChain';

class FakeErrorFilter extends BaseFilter {
  declare filterId: string;
  constructor(id: string, private errors: FilterValidationError[]) {
    super(50, { description: `fake-${id}`, version: '1.0.0', category: 'validation' });
    this.filterId = id;
  }
  async process(content: string): Promise<string> { return content; }
  async collectErrors(): Promise<FilterValidationError[]> {
    return this.errors;
  }
}

class FakeNoCollectErrorsFilter extends BaseFilter {
  declare filterId: string;
  constructor() {
    super(50, { description: 'no-collect', version: '1.0.0', category: 'validation' });
    this.filterId = 'no-collect';
  }
  async process(content: string): Promise<string> { return content; }
  // Intentionally no collectErrors — should be skipped silently.
}

class FakeThrowingFilter extends BaseFilter {
  declare filterId: string;
  constructor() {
    super(50, { description: 'throw-collect', version: '1.0.0', category: 'validation' });
    this.filterId = 'throw-collect';
  }
  async process(content: string): Promise<string> { return content; }
  async collectErrors(): Promise<FilterValidationError[]> {
    throw new Error('intentional failure');
  }
}

describe('FilterChain.collectErrors (#596)', () => {
  let chain: FilterChain;

  beforeEach(async () => {
    chain = new FilterChain(null);
    await chain.initialize({ engine: null });
  });

  test('returns empty array for empty content', async () => {
    const errors = await chain.collectErrors('', { pageName: 'X' });
    expect(errors).toEqual([]);
  });

  test('returns empty array when no filters registered', async () => {
    const errors = await chain.collectErrors('some content', { pageName: 'X' });
    expect(errors).toEqual([]);
  });

  test('returns empty array when registered filters do not implement collectErrors', async () => {
    chain.addFilter(new FakeNoCollectErrorsFilter());
    const errors = await chain.collectErrors('some content', { pageName: 'X' });
    expect(errors).toEqual([]);
  });

  test('aggregates errors from a single opt-in filter', async () => {
    chain.addFilter(new FakeErrorFilter('A', [
      { filterId: 'A', rule: 'r1', severity: 'error', message: 'first' }
    ]));
    const errors = await chain.collectErrors('content', { pageName: 'X' });
    expect(errors).toHaveLength(1);
    expect(errors[0].rule).toBe('r1');
    expect(errors[0].filterId).toBe('A');
  });

  test('aggregates errors across multiple filters', async () => {
    chain.addFilter(new FakeErrorFilter('A', [
      { filterId: 'A', rule: 'r1', severity: 'error', message: 'first' }
    ]));
    chain.addFilter(new FakeErrorFilter('B', [
      { filterId: 'B', rule: 'r2', severity: 'error', message: 'second' },
      { filterId: 'B', rule: 'r3', severity: 'error', message: 'third' }
    ]));
    const errors = await chain.collectErrors('content', { pageName: 'X' });
    expect(errors).toHaveLength(3);
    expect(errors.map(e => e.rule).sort()).toEqual(['r1', 'r2', 'r3']);
  });

  test('skips disabled filters even if they have collectErrors', async () => {
    const f = new FakeErrorFilter('disabled-one', [
      { filterId: 'disabled-one', rule: 'rX', severity: 'error', message: 'should not appear' }
    ]);
    chain.addFilter(f);
    f.disable();
    const errors = await chain.collectErrors('content', { pageName: 'X' });
    expect(errors).toEqual([]);
  });

  test('swallows individual filter throw and continues with other filters', async () => {
    chain.addFilter(new FakeThrowingFilter());
    chain.addFilter(new FakeErrorFilter('B', [
      { filterId: 'B', rule: 'r-after', severity: 'error', message: 'survived' }
    ]));
    const errors = await chain.collectErrors('content', { pageName: 'X' });
    expect(errors).toHaveLength(1);
    expect(errors[0].rule).toBe('r-after');
  });
});
