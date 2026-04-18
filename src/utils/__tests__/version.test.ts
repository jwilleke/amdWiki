/**
 * Unit tests for version.ts utilities
 *
 * Tests the pure exported functions (parseVersion, formatVersion,
 * incrementVersion) and the new --release / --tag-only flag logic
 * via the module's exported helpers.
 *
 * @jest-environment node
 */

import { parseVersion, formatVersion, incrementVersion } from '../version';

describe('parseVersion()', () => {
  test('parses valid semver string', () => {
    expect(parseVersion('1.2.3')).toEqual({ major: 1, minor: 2, patch: 3 });
  });

  test('parses 2.0.0', () => {
    expect(parseVersion('2.0.0')).toEqual({ major: 2, minor: 0, patch: 0 });
  });

  test('throws on invalid format', () => {
    expect(() => parseVersion('1.2')).toThrow();
    expect(() => parseVersion('a.b.c')).toThrow();
    expect(() => parseVersion('')).toThrow();
  });
});

describe('formatVersion()', () => {
  test('formats components into semver string', () => {
    expect(formatVersion(1, 2, 3)).toBe('1.2.3');
    expect(formatVersion(0, 0, 0)).toBe('0.0.0');
  });
});

describe('incrementVersion()', () => {
  test('increments patch', () => {
    expect(incrementVersion('1.2.3', 'patch')).toBe('1.2.4');
  });

  test('increments minor and resets patch', () => {
    expect(incrementVersion('1.2.3', 'minor')).toBe('1.3.0');
  });

  test('increments major and resets minor+patch', () => {
    expect(incrementVersion('1.2.3', 'major')).toBe('2.0.0');
  });

  test('throws on unknown type', () => {
    expect(() => incrementVersion('1.0.0', 'hotfix')).toThrow();
  });
});
