/**
 * LocaleUtils tests — focusing on date/time formatting (#37)
 */
const LocaleUtils = require('../LocaleUtils');

describe('LocaleUtils', () => {
  describe('formatDateWithPattern', () => {
    // 2025-09-20 in UTC
    const date = new Date('2025-09-20T13:09:36.929Z');

    test('formats yyyy-MM-dd', () => {
      const result = LocaleUtils.formatDateWithPattern(date, 'yyyy-MM-dd', 'UTC');
      expect(result).toBe('2025-09-20');
    });

    test('formats MM/dd/yyyy', () => {
      const result = LocaleUtils.formatDateWithPattern(date, 'MM/dd/yyyy', 'UTC');
      expect(result).toBe('09/20/2025');
    });

    test('formats dd/MM/yyyy', () => {
      const result = LocaleUtils.formatDateWithPattern(date, 'dd/MM/yyyy', 'UTC');
      expect(result).toBe('20/09/2025');
    });

    test('formats dd.MM.yyyy', () => {
      const result = LocaleUtils.formatDateWithPattern(date, 'dd.MM.yyyy', 'UTC');
      expect(result).toBe('20.09.2025');
    });

    test('formats yyyy/MM/dd', () => {
      const result = LocaleUtils.formatDateWithPattern(date, 'yyyy/MM/dd', 'UTC');
      expect(result).toBe('2025/09/20');
    });

    test('returns empty string for invalid date', () => {
      expect(LocaleUtils.formatDateWithPattern(null, 'yyyy-MM-dd')).toBe('');
    });
  });

  describe('formatTimeWithPrefs', () => {
    // 13:09:36 UTC
    const date = new Date('2025-09-20T13:09:36.929Z');

    test('24h format shows no AM/PM', () => {
      const result = LocaleUtils.formatTimeWithPrefs(date, '24h', 'en-US', 'UTC');
      expect(result).not.toMatch(/AM|PM/i);
      expect(result).toContain('13');
    });

    test('12h format shows AM/PM', () => {
      const result = LocaleUtils.formatTimeWithPrefs(date, '12h', 'en-US', 'UTC');
      expect(result).toMatch(/AM|PM/i);
      // 1:09 PM in 12h
      expect(result).toMatch(/1:09/);
    });

    test('returns empty string for invalid date', () => {
      expect(LocaleUtils.formatTimeWithPrefs(null, '24h')).toBe('');
    });
  });
});
