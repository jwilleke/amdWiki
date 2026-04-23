/**
 * Unit tests for SessionsPlugin (#330)
 *
 * @jest-environment node
 */

import SessionsPluginModule from '../SessionsPlugin' ;
import type { SimplePlugin } from '../types';
const SessionsPlugin = SessionsPluginModule as unknown as SimplePlugin;
function makeContext() {
  return {
    engine: {
      getManager: vi.fn((name) => {
        if (name === 'ConfigurationManager' || name === 'ConfigManager') {
          return { getProperty: (key, defaultVal) => defaultVal };
        }
        return null;
      }),
      logger: { error: vi.fn() }
    }
  };
}

describe('SessionsPlugin', () => {
  let mockContext;

  beforeEach(() => {
    mockContext = makeContext();
    global.fetch = vi.fn();
  });

  afterEach(() => {
    delete global.fetch;
    vi.clearAllMocks();
  });

  // --- property=count (default) ---

  test('returns session count as string (default property)', async () => {
    global.fetch.mockResolvedValue({ ok: true, json: async () => ({ sessionCount: 5 }) });
    const out = await SessionsPlugin.execute(mockContext, {});
    expect(out).toBe('5');
  });

  test('property=count returns sessionCount', async () => {
    global.fetch.mockResolvedValue({ ok: true, json: async () => ({ sessionCount: 3 }) });
    const out = await SessionsPlugin.execute(mockContext, { property: 'count' });
    expect(out).toBe('3');
  });

  test('returns "0" when fetch fails (network error)', async () => {
    global.fetch.mockRejectedValue(new Error('network down'));
    expect(await SessionsPlugin.execute(mockContext, {})).toBe('0');
  });

  test('returns "0" when JSON parsing fails', async () => {
    global.fetch.mockResolvedValue({ ok: true, json: async () => { throw new Error('bad json'); } });
    expect(await SessionsPlugin.execute(mockContext, {})).toBe('0');
  });

  test('returns "0" when response is not ok', async () => {
    global.fetch.mockResolvedValue({ ok: false, json: async () => ({}) });
    expect(await SessionsPlugin.execute(mockContext, {})).toBe('0');
  });

  // --- property=distinctusers ---

  test('property=distinctusers returns distinctUsers count', async () => {
    global.fetch.mockResolvedValue({ ok: true, json: async () => ({ sessionCount: 5, distinctUsers: 3 }) });
    const out = await SessionsPlugin.execute(mockContext, { property: 'distinctUsers' });
    expect(out).toBe('3');
  });

  test('property=distinctusers falls back to sessionCount when distinctUsers absent', async () => {
    global.fetch.mockResolvedValue({ ok: true, json: async () => ({ sessionCount: 4 }) });
    const out = await SessionsPlugin.execute(mockContext, { property: 'distinctUsers' });
    expect(out).toBe('4');
  });

  // --- property=users ---

  test('property=users fetches /api/session-users endpoint', async () => {
    global.fetch.mockResolvedValue({
      ok: true,
      json: async () => ({ users: ['alice'], anonymous: 0, total: 1 })
    });
    await SessionsPlugin.execute(mockContext, { property: 'users' });
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/session-users'),
      expect.objectContaining({ method: 'GET' })
    );
  });

  test('property=users renders authenticated user links', async () => {
    global.fetch.mockResolvedValue({
      ok: true,
      json: async () => ({ users: ['alice', 'bob'], anonymous: 0, total: 2 })
    });
    const out = await SessionsPlugin.execute(mockContext, { property: 'users' });
    expect(out).toContain('alice');
    expect(out).toContain('bob');
    expect(out).toContain('href');
  });

  test('property=users shows anonymous count when present', async () => {
    global.fetch.mockResolvedValue({
      ok: true,
      json: async () => ({ users: [], anonymous: 3, total: 3 })
    });
    const out = await SessionsPlugin.execute(mockContext, { property: 'users' });
    expect(out).toContain('Anonymous');
    expect(out).toContain('3');
  });

  test('property=users shows both authenticated users and anonymous count', async () => {
    global.fetch.mockResolvedValue({
      ok: true,
      json: async () => ({ users: ['alice'], anonymous: 2, total: 3 })
    });
    const out = await SessionsPlugin.execute(mockContext, { property: 'users' });
    expect(out).toContain('alice');
    expect(out).toContain('Anonymous');
    expect(out).toContain('2');
  });

  test('property=users with no sessions shows "No active sessions"', async () => {
    global.fetch.mockResolvedValue({
      ok: true,
      json: async () => ({ users: [], anonymous: 0, total: 0 })
    });
    const out = await SessionsPlugin.execute(mockContext, { property: 'users' });
    expect(out).toContain('No active sessions');
  });

  test('property=users returns "0" when response is not ok', async () => {
    global.fetch.mockResolvedValue({ ok: false, json: async () => ({}) });
    const out = await SessionsPlugin.execute(mockContext, { property: 'users' });
    expect(out).toContain('0');
  });

  test('property=users XSS: user names are escaped', async () => {
    global.fetch.mockResolvedValue({
      ok: true,
      json: async () => ({ users: ['<script>alert(1)</script>'], anonymous: 0, total: 1 })
    });
    const out = await SessionsPlugin.execute(mockContext, { property: 'users' });
    expect(out).not.toContain('<script>');
    expect(out).toContain('&lt;script&gt;');
  });

  // --- config / defaults ---

  test('uses defaults when ConfigurationManager unavailable', async () => {
    const ctx = { engine: { getManager: () => null, logger: { error: vi.fn() } } };
    global.fetch.mockResolvedValue({ ok: true, json: async () => ({ sessionCount: 2 }) });
    const out = await SessionsPlugin.execute(ctx, {});
    expect(out).toBe('2');
  });

  // --- metadata ---

  test('plugin metadata', () => {
    expect(SessionsPlugin.name).toBe('SessionsPlugin');
    expect(typeof SessionsPlugin.execute).toBe('function');
  });
});
