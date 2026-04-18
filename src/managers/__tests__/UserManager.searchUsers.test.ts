'use strict';

/**
 * Tests for UserManager.searchUsers() — issue #466
 */

const makeUser = (overrides = {}) => ({
  username: 'testuser',
  displayName: 'Test User',
  email: 'test@example.com',
  roles: ['reader'],
  isActive: true,
  password: 'hashed',
  isSystem: false,
  isExternal: false,
  createdAt: new Date().toISOString(),
  loginCount: 0,
  preferences: {},
  ...overrides
});

describe('UserManager#searchUsers()', () => {
  let UserManager;
  let manager;
  let mockProvider;

  const users = [
    makeUser({ username: 'alice',   displayName: 'Alice Smith',   email: 'alice@example.com',   roles: ['admin'],       isActive: true  }),
    makeUser({ username: 'bob',     displayName: 'Bob Jones',     email: 'bob@example.com',     roles: ['editor'],      isActive: true  }),
    makeUser({ username: 'carol',   displayName: 'Carol White',   email: 'carol@corp.com',      roles: ['reader'],      isActive: true  }),
    makeUser({ username: 'dave',    displayName: 'Dave Brown',    email: 'dave@corp.com',       roles: ['user-admin'],  isActive: false }),
    makeUser({ username: 'erin',    displayName: 'Erin Alice',    email: 'erin@example.com',    roles: ['reader'],      isActive: true  })
  ];

  const makeEngine = () => ({
    getManager: jest.fn().mockReturnValue(null),
    logger: { info: jest.fn(), warn: jest.fn(), error: jest.fn(), debug: jest.fn() }
  });

  beforeEach(() => {
    jest.resetModules();
    UserManager = require('../UserManager');
    if (UserManager.default) UserManager = UserManager.default;

    mockProvider = {
      getAllUsers: jest.fn().mockResolvedValue(new Map(users.map(u => [u.username, u]))),
      getUser: jest.fn(),
      saveUser: jest.fn(),
      deleteUser: jest.fn()
    };

    manager = new UserManager(makeEngine());
    manager.provider = mockProvider;
  });

  test('returns all active users when query is empty', async () => {
    const results = await manager.searchUsers('');
    expect(results.length).toBe(4); // dave is inactive
    expect(results.find(u => u.username === 'dave')).toBeUndefined();
  });

  test('matches username (case-insensitive)', async () => {
    const results = await manager.searchUsers('ALICE');
    const usernames = results.map(u => u.username);
    expect(usernames).toContain('alice');
    expect(usernames).toContain('erin'); // displayName: 'Erin Alice'
  });

  test('matches displayName (case-insensitive)', async () => {
    const results = await manager.searchUsers('jones');
    expect(results.map(u => u.username)).toContain('bob');
  });

  test('matches email (case-insensitive)', async () => {
    const results = await manager.searchUsers('corp.com');
    const usernames = results.map(u => u.username);
    expect(usernames).toContain('carol');
    expect(usernames).not.toContain('alice');
  });

  test('filters by role', async () => {
    const results = await manager.searchUsers('', { role: 'editor' });
    expect(results.length).toBe(1);
    expect(results[0].username).toBe('bob');
  });

  test('respects limit', async () => {
    const results = await manager.searchUsers('', { limit: 2 });
    expect(results.length).toBe(2);
  });

  test('includes inactive users when activeOnly is false', async () => {
    const results = await manager.searchUsers('', { activeOnly: false });
    const usernames = results.map(u => u.username);
    expect(usernames).toContain('dave');
  });

  test('never returns password field', async () => {
    const results = await manager.searchUsers('');
    results.forEach(u => expect(u).not.toHaveProperty('password'));
  });

  test('returns empty array when no users match', async () => {
    const results = await manager.searchUsers('zzznomatch');
    expect(results).toEqual([]);
  });

  test('returns empty array when role filter matches nothing', async () => {
    const results = await manager.searchUsers('', { role: 'nonexistent-role' });
    expect(results).toEqual([]);
  });

  test('combined query + role filter', async () => {
    const results = await manager.searchUsers('example.com', { role: 'admin' });
    expect(results.map(u => u.username)).toContain('alice');
    expect(results.map(u => u.username)).not.toContain('bob');
  });
});
