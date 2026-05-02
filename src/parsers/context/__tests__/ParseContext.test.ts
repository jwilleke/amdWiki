import ParseContext from '../ParseContext';
import type { WikiEngine } from '../ParseContext';

const mockEngine: WikiEngine = {
  getManager: vi.fn(() => null)
};

const make = (overrides: Record<string, unknown> = {}) =>
  new ParseContext(
    'test content',
    {
      pageName: 'TestPage',
      userContext: { isAuthenticated: true, roles: ['user'] },
      ...overrides
    },
    mockEngine
  );

describe('ParseContext.hasRole', () => {
  test('single-arg form (backward-compatible) returns true when user has role', () => {
    const ctx = make({ userContext: { roles: ['admin'] } });
    expect(ctx.hasRole('admin')).toBe(true);
  });

  test('multi-arg form returns true when user has any of the given roles', () => {
    const ctx = make({ userContext: { roles: ['editor'] } });
    expect(ctx.hasRole('admin', 'editor', 'reader')).toBe(true);
  });

  test('returns false when user has none of the given roles', () => {
    const ctx = make({ userContext: { roles: ['reader'] } });
    expect(ctx.hasRole('admin', 'editor')).toBe(false);
  });

  test('returns false when userContext is null', () => {
    const ctx = make({ userContext: null });
    expect(ctx.hasRole('admin')).toBe(false);
  });

  test('returns false when roles is missing or empty', () => {
    const noRoles = make({ userContext: { username: 'alice' } });
    const emptyRoles = make({ userContext: { roles: [] } });
    expect(noRoles.hasRole('admin')).toBe(false);
    expect(emptyRoles.hasRole('admin')).toBe(false);
  });

  test('returns false when called with no role names', () => {
    const ctx = make({ userContext: { roles: ['admin'] } });
    expect(ctx.hasRole()).toBe(false);
  });
});

describe('ParseContext.getPrincipals', () => {
  test('returns roles plus username for authenticated user', () => {
    const ctx = make({ userContext: { username: 'alice', roles: ['editor', 'reader'] } });
    expect(ctx.getPrincipals()).toEqual(['editor', 'reader', 'alice']);
  });

  test('returns roles only when no username present', () => {
    const ctx = make({ userContext: { roles: ['anonymous'] } });
    expect(ctx.getPrincipals()).toEqual(['anonymous']);
  });

  test('returns empty array when userContext is null', () => {
    const ctx = make({ userContext: null });
    expect(ctx.getPrincipals()).toEqual([]);
  });

  test('uses userName if username is absent (legacy field)', () => {
    const ctx = make({ userContext: { userName: 'alice', roles: ['editor'] } });
    expect(ctx.getPrincipals()).toEqual(['editor', 'alice']);
  });

  test('omits username when it equals "anonymous" (avoid leaking pseudo-user)', () => {
    const ctx = make({ userContext: { username: 'anonymous', roles: ['anonymous'] } });
    expect(ctx.getPrincipals()).toEqual(['anonymous']);
  });

  test('returned array does not alias userContext.roles', () => {
    const roles = ['editor'];
    const ctx = make({ userContext: { username: 'alice', roles } });
    const principals = ctx.getPrincipals();
    principals.push('mutated');
    expect(roles).toEqual(['editor']);
  });
});
