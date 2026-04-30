import * as fs from 'fs';

export interface PathPreflightResult {
  ok: boolean;
  reason?: 'missing-mount';
  missingMount?: string;
  message?: string;
}

export function checkConfiguredPath(p: string | undefined | null): PathPreflightResult {
  if (!p) return { ok: true };

  if (process.platform === 'darwin' && p.startsWith('/Volumes/')) {
    const segments = p.split('/').filter(Boolean);
    if (segments.length >= 2) {
      const mountRoot = `/${segments[0]}/${segments[1]}`;
      let mountPresent = false;
      try {
        mountPresent = fs.statSync(mountRoot).isDirectory();
      } catch {
        mountPresent = false;
      }
      if (!mountPresent) {
        return {
          ok: false,
          reason: 'missing-mount',
          missingMount: mountRoot,
          message:
            `Configured path "${p}" expects ${mountRoot} to be a mounted volume, but it is not currently mounted. ` +
            'Mount the volume, or update the configuration to point at an existing path.'
        };
      }
    }
  }

  return { ok: true };
}
