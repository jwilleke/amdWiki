import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import BaseManager from '../BaseManager.js';
import logger from '../../utils/logger.js';

class TestManager extends BaseManager {
  callPreflight(key: string, path: string | null | undefined) {
    return this.preflightConfiguredPath(key, path);
  }
}

describe('BaseManager.preflightConfiguredPath', () => {
  let warnSpy: ReturnType<typeof vi.spyOn>;
  let mgr: TestManager;

  beforeEach(() => {
    warnSpy = vi.spyOn(logger, 'warn').mockImplementation(() => logger);
    // Engine reference is unused by preflightConfiguredPath — pass a stub.
    mgr = new TestManager({} as never);
  });

  afterEach(() => {
    warnSpy.mockRestore();
  });

  it('returns ok and logs nothing for a path outside /Volumes', () => {
    const result = mgr.callPreflight('ngdpbase.test.path', '/tmp/foo');
    expect(result.ok).toBe(true);
    expect(warnSpy).not.toHaveBeenCalled();
  });

  it('returns ok and logs nothing for empty / null / undefined paths', () => {
    expect(mgr.callPreflight('ngdpbase.test.path', '').ok).toBe(true);
    expect(mgr.callPreflight('ngdpbase.test.path', null).ok).toBe(true);
    expect(mgr.callPreflight('ngdpbase.test.path', undefined).ok).toBe(true);
    expect(warnSpy).not.toHaveBeenCalled();
  });

  if (process.platform === 'darwin') {
    it('returns failure and logs a warning naming the manager and config key when /Volumes/<X> is missing', () => {
      const badPath = '/Volumes/definitely-not-mounted-zzz/data';
      const result = mgr.callPreflight('ngdpbase.test.path', badPath);

      expect(result.ok).toBe(false);
      expect(result.reason).toBe('missing-mount');
      expect(result.missingMount).toBe('/Volumes/definitely-not-mounted-zzz');

      expect(warnSpy).toHaveBeenCalledTimes(1);
      const msg = warnSpy.mock.calls[0][0] as string;
      expect(msg).toContain('TestManager');
      expect(msg).toContain('ngdpbase.test.path');
      expect(msg).toContain('/Volumes/definitely-not-mounted-zzz');
    });
  }
});
