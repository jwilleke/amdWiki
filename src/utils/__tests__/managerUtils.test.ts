/**
 * managerUtils tests
 *
 * @jest-environment node
 */
import { parseManagerFetchOptions } from '../managerUtils';

describe('parseManagerFetchOptions', () => {
  test('returns empty object for empty input', () => {
    expect(parseManagerFetchOptions({})).toEqual({});
  });

  test('returns empty object for undefined input', () => {
    expect(parseManagerFetchOptions()).toEqual({});
  });

  test('parses limit as integer', () => {
    expect(parseManagerFetchOptions({ limit: '5' })).toMatchObject({ limit: 5 });
  });

  test('ignores non-numeric limit', () => {
    const result = parseManagerFetchOptions({ limit: 'abc' });
    expect(result.limit).toBeUndefined();
  });

  test('ignores negative limit', () => {
    const result = parseManagerFetchOptions({ limit: '-1' });
    expect(result.limit).toBeUndefined();
  });

  test('accepts limit=0 (unlimited)', () => {
    expect(parseManagerFetchOptions({ limit: '0' })).toMatchObject({ limit: 0 });
  });

  test('parses sortBy', () => {
    expect(parseManagerFetchOptions({ sortBy: 'title' })).toMatchObject({ sortBy: 'title' });
  });

  test('parses sortOrder desc', () => {
    expect(parseManagerFetchOptions({ sortOrder: 'desc' })).toMatchObject({ sortOrder: 'desc' });
  });

  test('parses sortOrder asc', () => {
    expect(parseManagerFetchOptions({ sortOrder: 'asc' })).toMatchObject({ sortOrder: 'asc' });
  });

  test('defaults sortOrder to asc for unknown value', () => {
    expect(parseManagerFetchOptions({ sortOrder: 'random' })).toMatchObject({ sortOrder: 'asc' });
  });

  test('parses convenience sort field-desc', () => {
    const result = parseManagerFetchOptions({ sort: 'date-desc' });
    expect(result.sortBy).toBe('date');
    expect(result.sortOrder).toBe('desc');
  });

  test('parses convenience sort field-asc', () => {
    const result = parseManagerFetchOptions({ sort: 'title-asc' });
    expect(result.sortBy).toBe('title');
    expect(result.sortOrder).toBe('asc');
  });

  test('parses convenience sort field only (no direction)', () => {
    const result = parseManagerFetchOptions({ sort: 'name' });
    expect(result.sortBy).toBe('name');
    expect(result.sortOrder).toBe('asc');
  });

  test('parses since', () => {
    expect(parseManagerFetchOptions({ since: '2025-01-01' })).toMatchObject({ since: '2025-01-01' });
  });

  test('parses before', () => {
    expect(parseManagerFetchOptions({ before: '2025-12-31' })).toMatchObject({ before: '2025-12-31' });
  });

  test('parses multiple fields together', () => {
    const result = parseManagerFetchOptions({ limit: '10', sort: 'date-desc', since: '2025-01-01' });
    expect(result.limit).toBe(10);
    expect(result.sortBy).toBe('date');
    expect(result.sortOrder).toBe('desc');
    expect(result.since).toBe('2025-01-01');
  });

  test('sort overrides sortBy/sortOrder when both provided', () => {
    const result = parseManagerFetchOptions({ sortBy: 'title', sortOrder: 'asc', sort: 'date-desc' });
    // sort is parsed last, overrides
    expect(result.sortBy).toBe('date');
    expect(result.sortOrder).toBe('desc');
  });
});
