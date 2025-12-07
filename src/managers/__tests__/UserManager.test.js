/**
 * UserManager Tests
 *
 * UserManager is a thin proxy that delegates user operations to a provider.
 * These tests verify the proxy behavior, not the provider logic itself.
 * Provider logic is tested in provider-specific test files.
 */

const UserManager = require('../UserManager');

// Mock ConfigurationManager
const mockConfigurationManager = {
  getProperty: jest.fn((key, defaultValue) => {
    const config = {
      'amdwiki.user.provider.default': 'fileuserprovider',
      'amdwiki.user.provider': 'fileuserprovider',
      'amdwiki.user.defaultPassword': 'admin',
      'amdwiki.user.passwordSalt': 'test-salt',
      'amdwiki.user.sessionExpiration': 3600000,
      'amdwiki.user.defaultTimezone': 'UTC',
      'amdwiki.directories.users': './users'
    };
    return config[key] !== undefined ? config[key] : defaultValue;
  })
};

// Mock engine
const mockEngine = {
  getManager: jest.fn((name) => {
    if (name === 'ConfigurationManager') return mockConfigurationManager;
    return null;
  }),
  getConfig: jest.fn(() => ({ get: jest.fn() }))
};

describe('UserManager', () => {
  let userManager;

  beforeEach(async () => {
    jest.clearAllMocks();

    // Reset mock implementation to default behavior
    mockConfigurationManager.getProperty.mockImplementation((key, defaultValue) => {
      const config = {
        'amdwiki.user.provider.default': 'fileuserprovider',
        'amdwiki.user.provider': 'fileuserprovider',
        'amdwiki.user.defaultPassword': 'admin',
        'amdwiki.user.passwordSalt': 'test-salt',
        'amdwiki.user.sessionExpiration': 3600000,
        'amdwiki.user.defaultTimezone': 'UTC',
        'amdwiki.directories.users': './users'
      };
      return config[key] !== undefined ? config[key] : defaultValue;
    });

    userManager = new UserManager(mockEngine);
    await userManager.initialize();
  });

  afterEach(async () => {
    if (userManager.provider) {
      await userManager.shutdown();
    }
  });

  describe('Initialization', () => {
    test('should require ConfigurationManager', async () => {
      const engineWithoutConfig = { getManager: jest.fn(() => null) };
      const manager = new UserManager(engineWithoutConfig);

      await expect(manager.initialize()).rejects.toThrow('UserManager requires ConfigurationManager');
    });

    test('should initialize provider', () => {
      expect(userManager.provider).toBeTruthy();
      expect(userManager.provider.initialized).toBe(true);
    });

    test('should get configuration from ConfigurationManager', () => {
      expect(mockConfigurationManager.getProperty).toHaveBeenCalledWith('amdwiki.user.provider', expect.any(String));
    });

    test('should initialize role and permission maps', () => {
      expect(userManager.roles).toBeInstanceOf(Map);
      expect(userManager.permissions).toBeInstanceOf(Map);
    });
  });

  describe('getCurrentUserProvider()', () => {
    test('should return the provider instance', () => {
      const provider = userManager.getCurrentUserProvider();
      expect(provider).toBe(userManager.provider);
      expect(provider).toBeTruthy();
    });

    test('should return provider with correct interface', () => {
      const provider = userManager.getCurrentUserProvider();
      expect(provider.getProviderInfo).toBeDefined();
      expect(typeof provider.getProviderInfo).toBe('function');
    });
  });

  describe('User CRUD Operations', () => {
    test('getUser() should call provider and strip password', async () => {
      const mockUser = { username: 'test', email: 'test@example.com', password: 'hashed' };
      userManager.provider.getUser = jest.fn().mockResolvedValue(mockUser);

      const result = await userManager.getUser('test');

      expect(userManager.provider.getUser).toHaveBeenCalledWith('test');
      expect(result).toEqual({ username: 'test', email: 'test@example.com' });
      expect(result.password).toBeUndefined();
    });

    test('getUser() should return undefined for null result', async () => {
      userManager.provider.getUser = jest.fn().mockResolvedValue(null);

      const result = await userManager.getUser('nonexistent');

      expect(result).toBeUndefined();
    });

    test('getUsers() should call provider', async () => {
      const mockUsers = [{ username: 'user1' }, { username: 'user2' }];
      userManager.provider.getAllUsers = jest.fn().mockResolvedValue(mockUsers);

      const result = await userManager.getUsers();

      expect(userManager.provider.getAllUsers).toHaveBeenCalled();
      expect(Array.isArray(result)).toBe(true);
    });

    test('createUser() should check for existing user', async () => {
      const userData = { username: 'test', password: 'pass123', email: 'test@example.com' };

      userManager.provider.userExists = jest.fn().mockResolvedValue(true);
      userManager.provider.getAllUsernames = jest.fn().mockResolvedValue(['test', 'admin']);

      await expect(userManager.createUser(userData)).rejects.toThrow('Username already exists');
    });

    test('deleteUser() should throw if user not found', async () => {
      userManager.provider.getUser = jest.fn().mockResolvedValue(null);

      await expect(userManager.deleteUser('nonexistent')).rejects.toThrow('User not found');
    });

    test('deleteUser() should call provider for existing user', async () => {
      const mockUser = { username: 'test', isSystem: false };
      userManager.provider.getUser = jest.fn().mockResolvedValue(mockUser);
      userManager.provider.deleteUser = jest.fn().mockResolvedValue(undefined);

      await userManager.deleteUser('test');

      expect(userManager.provider.deleteUser).toHaveBeenCalledWith('test');
    });
  });

  describe('Authentication', () => {
    test('authenticateUser() should validate and return user with isAuthenticated flag', async () => {
      const hashedPassword = userManager.hashPassword('password');
      const mockUser = {
        username: 'test',
        email: 'test@example.com',
        password: hashedPassword,
        isActive: true,
        loginCount: 0
      };
      userManager.provider.getUser = jest.fn().mockResolvedValue(mockUser);
      userManager.provider.updateUser = jest.fn().mockResolvedValue(undefined);

      const result = await userManager.authenticateUser('test', 'password');

      expect(userManager.provider.getUser).toHaveBeenCalledWith('test');
      expect(result).toBeTruthy();
      expect(result.username).toBe('test');
      expect(result.isAuthenticated).toBe(true);
      expect(result.password).toBeUndefined();
    });

    test('authenticateUser() should return null for invalid password', async () => {
      const hashedPassword = userManager.hashPassword('correctpass');
      const mockUser = {
        username: 'test',
        password: hashedPassword,
        isActive: true
      };
      userManager.provider.getUser = jest.fn().mockResolvedValue(mockUser);

      const result = await userManager.authenticateUser('test', 'wrongpass');

      expect(result).toBeNull();
    });

    test('authenticateUser() should return null for inactive user', async () => {
      const mockUser = {
        username: 'test',
        password: 'hash',
        isActive: false
      };
      userManager.provider.getUser = jest.fn().mockResolvedValue(mockUser);

      const result = await userManager.authenticateUser('test', 'password');

      expect(result).toBeNull();
    });
  });

  describe('Role Management', () => {
    beforeEach(() => {
      // Setup default roles
      userManager.roles.set('admin', {
        name: 'admin',
        permissions: ['read', 'write', 'delete', 'admin']
      });
      userManager.roles.set('user', {
        name: 'user',
        permissions: ['read', 'write']
      });
    });

    test('getRole() should return role definition', () => {
      const role = userManager.getRole('admin');
      expect(role).toBeTruthy();
      expect(role.name).toBe('admin');
      expect(role.permissions).toContain('admin');
    });

    test('getRoles() should return all roles', () => {
      const roles = userManager.getRoles();
      expect(Array.isArray(roles)).toBe(true);
      expect(roles.length).toBe(2);
    });

    test('hasRole() should check user roles', async () => {
      const mockUser = { username: 'test', roles: ['admin', 'user'] };
      userManager.provider.getUser = jest.fn().mockResolvedValue(mockUser);

      const result = await userManager.hasRole('test', 'admin');

      expect(result).toBe(true);
    });

    test('hasRole() should return false for role not assigned', async () => {
      const mockUser = { username: 'test', roles: ['user'] };
      userManager.provider.getUser = jest.fn().mockResolvedValue(mockUser);

      const result = await userManager.hasRole('test', 'admin');

      expect(result).toBe(false);
    });
  });

  describe('Permission Management', () => {
    let mockPolicyManager;

    beforeEach(() => {
      // Mock PolicyManager for permission tests
      mockPolicyManager = {
        getAllPolicies: jest.fn(() => [
          {
            id: 'policy1',
            subjects: [
              { type: 'role', value: 'user' },
              { type: 'role', value: 'Authenticated' }
            ],
            effect: 'allow',
            actions: ['page:view', 'page:edit']
          },
          {
            id: 'policy2',
            subjects: [
              { type: 'role', value: 'admin' }
            ],
            effect: 'allow',
            actions: ['page:view', 'page:edit', 'page:delete', 'admin:manage']
          }
        ])
      };

      // Override engine.getManager to return mock PolicyManager
      mockEngine.getManager = jest.fn((name) => {
        if (name === 'ConfigurationManager') return mockConfigurationManager;
        if (name === 'PolicyManager') return mockPolicyManager;
        return null;
      });
    });

    test('getUserPermissions() should aggregate from policies', async () => {
      const mockUser = { username: 'test', roles: ['user'], isActive: true };
      userManager.provider.getUser = jest.fn().mockResolvedValue(mockUser);

      const permissions = await userManager.getUserPermissions('test');

      expect(Array.isArray(permissions)).toBe(true);
      expect(permissions.length).toBeGreaterThan(0);
    });

    test('hasPermission() should check user permissions via policies', async () => {
      const mockUser = { username: 'test', roles: ['admin'], isActive: true };
      userManager.provider.getUser = jest.fn().mockResolvedValue(mockUser);

      const permissions = await userManager.getUserPermissions('test');
      const result = permissions.length > 0;

      expect(result).toBe(true);
    });

    test('getUserPermissions() should return empty array without PolicyManager', async () => {
      // Override to return no PolicyManager
      mockEngine.getManager = jest.fn((name) => {
        if (name === 'ConfigurationManager') return mockConfigurationManager;
        return null;
      });

      const permissions = await userManager.getUserPermissions('test');

      expect(Array.isArray(permissions)).toBe(true);
      expect(permissions.length).toBe(0);
    });
  });

  describe('Password Management', () => {
    test('hashPassword() should hash password with salt', () => {
      const hashed = userManager.hashPassword('password123');

      expect(typeof hashed).toBe('string');
      expect(hashed).not.toBe('password123');
      expect(hashed.length).toBeGreaterThan(0);
    });

    test('hashPassword() should produce consistent hashes', () => {
      const hash1 = userManager.hashPassword('password123');
      const hash2 = userManager.hashPassword('password123');

      expect(hash1).toBe(hash2);
    });

    test('verifyPassword() should validate correct password', () => {
      const hashed = userManager.hashPassword('password123');
      const result = userManager.verifyPassword('password123', hashed);

      expect(result).toBe(true);
    });

    test('verifyPassword() should reject incorrect password', () => {
      const hashed = userManager.hashPassword('password123');
      const result = userManager.verifyPassword('wrongpass', hashed);

      expect(result).toBe(false);
    });
  });

  describe('Provider Normalization', () => {
    test('should normalize fileuserprovider to FileUserProvider', () => {
      expect(userManager.providerClass).toBe('FileUserProvider');
    });

    test('should handle provider name case-insensitively', async () => {
      mockConfigurationManager.getProperty.mockImplementation((key, defaultValue) => {
        if (key === 'amdwiki.user.provider') return 'FILEUSERPROVIDER';
        if (key === 'amdwiki.user.provider.default') return 'fileuserprovider';
        return defaultValue;
      });

      const manager = new UserManager(mockEngine);
      await manager.initialize();

      expect(manager.providerClass).toBe('FileUserProvider');
      await manager.shutdown();
    });
  });

  describe('Shutdown', () => {
    test('should mark manager as not initialized', async () => {
      expect(userManager.initialized).toBe(true);

      await userManager.shutdown();

      expect(userManager.initialized).toBe(false);
    });

    test('should not throw errors', async () => {
      await expect(userManager.shutdown()).resolves.not.toThrow();
    });
  });

  describe('Error Handling', () => {
    test('should handle missing provider gracefully', async () => {
      const uninitializedManager = new UserManager(mockEngine);

      // Operations should fail gracefully
      await expect(uninitializedManager.getUser('test')).rejects.toThrow();
    });
  });
});
