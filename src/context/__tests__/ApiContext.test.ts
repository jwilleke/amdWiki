'use strict';

import { ApiContext, ApiError } from '../ApiContext';

// ── helpers ──────────────────────────────────────────────────────────────────

const mockEngine = { getManager: jest.fn() };

function makeReq({ userContext = {}, session = {} } = {}) {
  return { userContext, session };
}

// ── ApiError ─────────────────────────────────────────────────────────────────

describe('ApiError', () => {
  test('carries status and message', () => {
    const err = new ApiError(403, 'Forbidden');
    expect(err.status).toBe(403);
    expect(err.message).toBe('Forbidden');
    expect(err.name).toBe('ApiError');
    expect(err).toBeInstanceOf(Error);
  });

  test('is distinguishable from generic Error', () => {
    expect(new ApiError(401, 'x')).toBeInstanceOf(ApiError);
    expect(new Error('x')).not.toBeInstanceOf(ApiError);
  });
});

// ── ApiContext.from() ─────────────────────────────────────────────────────────

describe('ApiContext.from()', () => {
  describe('authenticated user', () => {
    let ctx;
    beforeEach(() => {
      ctx = ApiContext.from(
        makeReq({
          userContext: {
            username: 'jane',
            displayName: 'Jane Smith',
            email: 'jane@example.com',
            roles: ['reader', 'clubhouse-manager', 'Authenticated', 'All'],
            isAuthenticated: true
          },
          session: { isAuthenticated: true }
        }),
        mockEngine
      );
    });

    test('isAuthenticated is true', () => expect(ctx.isAuthenticated).toBe(true));
    test('username populated', () => expect(ctx.username).toBe('jane'));
    test('displayName populated', () => expect(ctx.displayName).toBe('Jane Smith'));
    test('email populated', () => expect(ctx.email).toBe('jane@example.com'));
    test('roles populated', () => expect(ctx.roles).toEqual(['reader', 'clubhouse-manager', 'Authenticated', 'All']));
    test('engine reference passed through', () => expect(ctx.engine).toBe(mockEngine));
  });

  describe('anonymous / unauthenticated user', () => {
    let ctx;
    beforeEach(() => {
      ctx = ApiContext.from(
        makeReq({
          userContext: {
            username: 'Anonymous',
            roles: ['Anonymous', 'All'],
            isAuthenticated: false
          },
          session: { isAuthenticated: false }
        }),
        mockEngine
      );
    });

    test('isAuthenticated is false', () => expect(ctx.isAuthenticated).toBe(false));
    test('username is Anonymous', () => expect(ctx.username).toBe('Anonymous'));
    test('roles contain Anonymous and All', () => {
      expect(ctx.roles).toContain('Anonymous');
      expect(ctx.roles).toContain('All');
    });
  });

  describe('missing / empty userContext', () => {
    test('handles undefined userContext gracefully', () => {
      const ctx = ApiContext.from(makeReq({ userContext: undefined }), mockEngine);
      expect(ctx.isAuthenticated).toBe(false);
      expect(ctx.username).toBeNull();
      expect(ctx.roles).toEqual([]);
    });

    test('handles empty userContext gracefully', () => {
      const ctx = ApiContext.from(makeReq({ userContext: {} }), mockEngine);
      expect(ctx.isAuthenticated).toBe(false);
      expect(ctx.username).toBeNull();
      expect(ctx.email).toBeNull();
      expect(ctx.displayName).toBeNull();
      expect(ctx.roles).toEqual([]);
    });

    test('falls back to session.isAuthenticated when userContext lacks it', () => {
      const ctx = ApiContext.from(
        makeReq({
          userContext: { username: 'bob', roles: ['reader'] },
          session: { isAuthenticated: true }
        }),
        mockEngine
      );
      expect(ctx.isAuthenticated).toBe(true);
    });
  });
});

// ── hasRole() ─────────────────────────────────────────────────────────────────

describe('ApiContext#hasRole()', () => {
  function ctxWithRoles(...roles) {
    return ApiContext.from(
      makeReq({ userContext: { roles, isAuthenticated: true } }),
      mockEngine
    );
  }

  test('returns true when caller has the role', () => {
    expect(ctxWithRoles('admin').hasRole('admin')).toBe(true);
  });

  test('returns true when caller has any of the listed roles', () => {
    expect(ctxWithRoles('editor').hasRole('admin', 'editor')).toBe(true);
  });

  test('returns false when caller has none of the listed roles', () => {
    expect(ctxWithRoles('reader').hasRole('admin', 'editor')).toBe(false);
  });

  test('returns false for empty roles array', () => {
    expect(ctxWithRoles().hasRole('admin')).toBe(false);
  });
});

// ── requireAuthenticated() ────────────────────────────────────────────────────

describe('ApiContext#requireAuthenticated()', () => {
  test('does not throw when authenticated', () => {
    const ctx = ApiContext.from(
      makeReq({ userContext: { isAuthenticated: true, roles: [] } }),
      mockEngine
    );
    expect(() => ctx.requireAuthenticated()).not.toThrow();
  });

  test('throws ApiError(401) when not authenticated', () => {
    const ctx = ApiContext.from(
      makeReq({ userContext: { isAuthenticated: false, roles: [] } }),
      mockEngine
    );
    expect(() => ctx.requireAuthenticated()).toThrow(ApiError);
    try {
      ctx.requireAuthenticated();
    } catch (err) {
      expect(err.status).toBe(401);
    }
  });
});

// ── hasPermission() ───────────────────────────────────────────────────────────

describe('ApiContext#hasPermission()', () => {
  const roleDefs = {
    admin:      { permissions: ['search-user', 'user-read', 'admin-system'] },
    'user-admin': { permissions: ['search-user', 'user-read'] },
    editor:     { permissions: ['page-edit', 'search-page'] },
    reader:     { permissions: ['page-read'] }
  };

  function makeEngineWithDefs() {
    return {
      getManager: jest.fn().mockReturnValue({
        getProperty: jest.fn((key, def) =>
          key === 'ngdpbase.roles.definitions' ? roleDefs : def
        )
      })
    };
  }

  function ctxWithRoles(engine, ...roles) {
    return ApiContext.from(
      makeReq({ userContext: { roles, isAuthenticated: true } }),
      engine
    );
  }

  test('returns true when a role grants the permission', () => {
    const engine = makeEngineWithDefs();
    const ctx = ctxWithRoles(engine, 'editor');
    expect(ctx.hasPermission('page-edit')).toBe(true);
  });

  test('returns true when any of caller\'s roles grants the permission', () => {
    const engine = makeEngineWithDefs();
    const ctx = ctxWithRoles(engine, 'reader', 'user-admin');
    expect(ctx.hasPermission('search-user')).toBe(true);
  });

  test('returns false when no role grants the permission', () => {
    const engine = makeEngineWithDefs();
    const ctx = ctxWithRoles(engine, 'reader');
    expect(ctx.hasPermission('search-user')).toBe(false);
  });

  test('returns false when caller has no roles', () => {
    const engine = makeEngineWithDefs();
    const ctx = ctxWithRoles(engine);
    expect(ctx.hasPermission('page-read')).toBe(false);
  });

  test('returns false when ConfigurationManager is unavailable', () => {
    const engine = { getManager: jest.fn().mockReturnValue(null) };
    const ctx = ctxWithRoles(engine, 'admin');
    expect(ctx.hasPermission('admin-system')).toBe(false);
  });

  test('returns false when role not found in definitions', () => {
    const engine = makeEngineWithDefs();
    const ctx = ctxWithRoles(engine, 'unknown-role');
    expect(ctx.hasPermission('page-read')).toBe(false);
  });
});

// ── requirePermission() ───────────────────────────────────────────────────────

describe('ApiContext#requirePermission()', () => {
  const roleDefs = {
    admin: { permissions: ['search-user', 'user-read'] },
    reader: { permissions: ['page-read'] }
  };

  function makeEngineWithDefs() {
    return {
      getManager: jest.fn().mockReturnValue({
        getProperty: jest.fn((key, def) =>
          key === 'ngdpbase.roles.definitions' ? roleDefs : def
        )
      })
    };
  }

  test('does not throw when caller has the permission', () => {
    const engine = makeEngineWithDefs();
    const ctx = ApiContext.from(
      makeReq({ userContext: { roles: ['admin'], isAuthenticated: true } }),
      engine
    );
    expect(() => ctx.requirePermission('search-user')).not.toThrow();
  });

  test('throws ApiError(403) when caller lacks the permission', () => {
    const engine = makeEngineWithDefs();
    const ctx = ApiContext.from(
      makeReq({ userContext: { roles: ['reader'], isAuthenticated: true } }),
      engine
    );
    expect(() => ctx.requirePermission('search-user')).toThrow(ApiError);
    try { ctx.requirePermission('search-user'); } catch (err) {
      expect(err.status).toBe(403);
    }
  });
});

// ── requireRole() ─────────────────────────────────────────────────────────────

describe('ApiContext#requireRole()', () => {
  test('does not throw when caller has the role', () => {
    const ctx = ApiContext.from(
      makeReq({ userContext: { roles: ['admin'], isAuthenticated: true } }),
      mockEngine
    );
    expect(() => ctx.requireRole('admin')).not.toThrow();
  });

  test('does not throw when caller has any of the listed roles', () => {
    const ctx = ApiContext.from(
      makeReq({ userContext: { roles: ['clubhouse-manager'], isAuthenticated: true } }),
      mockEngine
    );
    expect(() => ctx.requireRole('admin', 'clubhouse-manager')).not.toThrow();
  });

  test('throws ApiError(403) when caller has none of the listed roles', () => {
    const ctx = ApiContext.from(
      makeReq({ userContext: { roles: ['reader'], isAuthenticated: true } }),
      mockEngine
    );
    expect(() => ctx.requireRole('admin', 'editor')).toThrow(ApiError);
    try {
      ctx.requireRole('admin', 'editor');
    } catch (err) {
      expect(err.status).toBe(403);
    }
  });

  test('throws ApiError(403) for anonymous caller with no roles', () => {
    const ctx = ApiContext.from(makeReq(), mockEngine);
    expect(() => ctx.requireRole('admin')).toThrow(ApiError);
  });
});
