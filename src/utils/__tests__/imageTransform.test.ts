/**
 * imageTransform — parseSize tests
 *
 * @jest-environment node
 */
import { parseSize } from '../imageTransform';

describe('parseSize', () => {
  test('parses "300x300"', () => {
    expect(parseSize('300x300')).toEqual({ width: 300, height: 300 });
  });

  test('parses "150x100"', () => {
    expect(parseSize('150x100')).toEqual({ width: 150, height: 100 });
  });

  test('parses "1920x1080"', () => {
    expect(parseSize('1920x1080')).toEqual({ width: 1920, height: 1080 });
  });

  test('returns null for missing separator', () => {
    expect(parseSize('300300')).toBeNull();
  });

  test('returns null for x at start (sep < 1)', () => {
    expect(parseSize('x300')).toBeNull();
  });

  test('returns null for non-numeric width', () => {
    expect(parseSize('abcx300')).toBeNull();
  });

  test('returns null for non-numeric height', () => {
    expect(parseSize('300xabc')).toBeNull();
  });

  test('returns null for zero width', () => {
    expect(parseSize('0x300')).toBeNull();
  });

  test('returns null for zero height', () => {
    expect(parseSize('300x0')).toBeNull();
  });

  test('returns null for negative width', () => {
    expect(parseSize('-100x300')).toBeNull();
  });

  test('returns null for empty string', () => {
    expect(parseSize('')).toBeNull();
  });
});
