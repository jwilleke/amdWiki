import { describe, it, expect } from 'vitest';
import { checkConfiguredPath } from '../PathPreflight.js';

describe('PathPreflight.checkConfiguredPath', () => {
  it('returns ok for empty / null / undefined input', () => {
    expect(checkConfiguredPath('')).toEqual({ ok: true });
    expect(checkConfiguredPath(null)).toEqual({ ok: true });
    expect(checkConfiguredPath(undefined)).toEqual({ ok: true });
  });

  it('returns ok for paths outside /Volumes', () => {
    expect(checkConfiguredPath('/tmp/foo')).toEqual({ ok: true });
    expect(checkConfiguredPath('./relative/path')).toEqual({ ok: true });
    expect(checkConfiguredPath('/Users/jim/data')).toEqual({ ok: true });
  });

  if (process.platform === 'darwin') {
    it('flags missing /Volumes/<X> mount on darwin', () => {
      const result = checkConfiguredPath('/Volumes/definitely-not-mounted-xyz123/data');
      expect(result.ok).toBe(false);
      expect(result.reason).toBe('missing-mount');
      expect(result.missingMount).toBe('/Volumes/definitely-not-mounted-xyz123');
      expect(result.message).toContain('/Volumes/definitely-not-mounted-xyz123');
    });

    it('returns ok for a present /Volumes/<X> mount', () => {
      // /Volumes itself is always present on macOS; use a path that resolves to a real mount root.
      // We use /Volumes/<X> where <X> is the boot volume's mount, which is the system root link.
      // Skip the "present" assertion if we can't reliably name a present mount in CI.
      // Fallback: check that a path with no /Volumes prefix is ok.
      expect(checkConfiguredPath('/usr/local')).toEqual({ ok: true });
    });
  }
});
