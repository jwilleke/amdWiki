import { ThemeManager, getThemeManager, clearThemeManagerCache } from '../ThemeManager';

const FAKE_DIR = '/tmp/__ngdpbase_theme_cache_test_dir__';

describe('ThemeManager cache', () => {
  beforeEach(() => {
    clearThemeManagerCache();
  });

  test('returns the same instance for the same activeTheme + themesDir', () => {
    const a = getThemeManager('default', FAKE_DIR);
    const b = getThemeManager('default', FAKE_DIR);
    expect(b).toBe(a);
    expect(a).toBeInstanceOf(ThemeManager);
  });

  test('returns a new instance when activeTheme changes', () => {
    const a = getThemeManager('default', FAKE_DIR);
    const b = getThemeManager('flatly', FAKE_DIR);
    expect(b).not.toBe(a);
  });

  test('returns a new instance when themesDir changes', () => {
    const a = getThemeManager('default', FAKE_DIR);
    const b = getThemeManager('default', FAKE_DIR + '_other');
    expect(b).not.toBe(a);
  });

  test('clearThemeManagerCache forces a rebuild on next call', () => {
    const a = getThemeManager('default', FAKE_DIR);
    clearThemeManagerCache();
    const b = getThemeManager('default', FAKE_DIR);
    expect(b).not.toBe(a);
  });

  test('cacheKey is set on the instance and matches the cache lookup', () => {
    const tm = getThemeManager('default', FAKE_DIR);
    expect(tm.cacheKey).toBe(`${FAKE_DIR}::default`);
  });

  test('falsy activeTheme normalises to "default" — no separate cache entry from explicit "default"', () => {
    const a = getThemeManager('', FAKE_DIR);
    const b = getThemeManager('default', FAKE_DIR);
    expect(a.cacheKey).toBe(`${FAKE_DIR}::default`);
    expect(b).toBe(a);
  });
});
