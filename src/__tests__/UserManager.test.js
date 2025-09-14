const { describe, test, expect, beforeEach, afterEach } = require('@jest/globals');
const fs = require('fs').promises;
const path = require('path');
const UserManager = require('../managers/UserManager');

describe('UserManager', () => {
  let userManager;
  let tempDir;

  beforeEach(async () => {
    // Create a temporary directory for test data
    tempDir = path.join(__dirname, 'temp', Date.now().toString());
    await fs.mkdir(tempDir, { recursive: true });
    
    // Initialize UserManager with temporary directory
    userManager = new UserManager(null); // No engine for testing
    await userManager.initialize({ usersDirectory: tempDir });
  });

  afterEach(async () => {
    // Clean up temporary directory
    if (tempDir) {
      try {
        await fs.rm(tempDir, { recursive: true, force: true });
      } catch (err) {
        console.warn('Failed to clean up temp directory:', err.message);
      }
    }
  });

  describe('initialization', () => {
    test('should initialize with default permissions and roles', () => {
      expect(userManager.permissions).toBeDefined();
      expect(userManager.roles).toBeDefined();
      expect(userManager.permissions.size).toBeGreaterThan(0);
      expect(userManager.roles.size).toBeGreaterThan(0);
    });

    test('should create default admin user when no users exist', () => {
      const adminUser = userManager.users.get('admin');
      expect(adminUser).toBeDefined();
      expect(adminUser.username).toBe('admin');
      expect(adminUser.roles).toContain('admin');
    });

    test('should create users directory', async () => {
      const stats = await fs.stat(tempDir);
      expect(stats.isDirectory()).toBe(true);
    });
  });

  describe('user creation', () => {
    test('should create a new user successfully', async () => {
      const userData = {
        username: 'testuser',
        password: 'password123',
        email: 'test@example.com'
      };

      const result = await userManager.createUser(userData);
      expect(result).toBeDefined();
      expect(result.username).toBe('testuser');
      expect(result.email).toBe('test@example.com');

      const user = userManager.getUser('testuser');
      expect(user).toBeDefined();
      expect(user.username).toBe('testuser');
      expect(user.email).toBe('test@example.com');
    });

    test('should not create user with duplicate username', async () => {
      const userData = {
        username: 'testuser',
        password: 'password123',
        email: 'test@example.com'
      };

      await userManager.createUser(userData);
      
      // Try to create another user with the same username
      await expect(userManager.createUser(userData)).rejects.toThrow('Username already exists');
    });

    test('should hash passwords properly', async () => {
      const userData = {
        username: 'testpassword',
        password: 'password123',
        email: 'test@example.com'
      };

      await userManager.createUser(userData);
      const user = userManager.users.get('testpassword');
      
      // Password should be hashed, not stored in plain text
      expect(user.password).not.toBe('password123');
      expect(user.password).toBeDefined();
      expect(user.password.length).toBeGreaterThan(0);
    });
  });

  describe('user management', () => {
    test('should update user information', async () => {
      const userData = {
        username: 'testuser',
        password: 'password123',
        email: 'test@example.com'
      };

      await userManager.createUser(userData);
      
      const updates = {
        email: 'updated@example.com',
        displayName: 'Updated User'
      };
      
      const result = await userManager.updateUser('testuser', updates);
      expect(result.email).toBe('updated@example.com');
      expect(result.displayName).toBe('Updated User');
      
      const user = userManager.getUser('testuser');
      expect(user.email).toBe('updated@example.com');
      expect(user.displayName).toBe('Updated User');
    });

    test('should delete user successfully', async () => {
      const userData = {
        username: 'testuser',
        password: 'password123',
        email: 'test@example.com'
      };

      await userManager.createUser(userData);
      expect(userManager.getUser('testuser')).toBeDefined();
      
      await userManager.deleteUser('testuser');
      expect(userManager.getUser('testuser')).toBeUndefined();
    });

    test('should get all users', async () => {
      const user1 = { username: 'user1', password: 'pass1', email: 'user1@example.com' };
      const user2 = { username: 'user2', password: 'pass2', email: 'user2@example.com' };
      
      await userManager.createUser(user1);
      await userManager.createUser(user2);
      
      const users = userManager.getUsers();
      expect(users.length).toBeGreaterThanOrEqual(3); // admin + 2 test users
      expect(users.find(u => u.username === 'user1')).toBeDefined();
      expect(users.find(u => u.username === 'user2')).toBeDefined();
    });
  });

  describe('authorization', () => {
    beforeEach(async () => {
      await userManager.createUser({
        username: 'testuser',
        password: 'password123',
        email: 'test@example.com'
      });
    });

    test('should check user permissions correctly', () => {
      // Admin should have all permissions
      expect(userManager.hasPermission('admin', 'admin:system')).toBe(true);
      expect(userManager.hasPermission('admin', 'page:read')).toBe(true);
      
      // Regular user should have limited permissions
      expect(userManager.hasPermission('testuser', 'admin:system')).toBe(false);
      expect(userManager.hasPermission('testuser', 'page:read')).toBe(true);
    });

    test('should get user permissions', () => {
      const adminPermissions = userManager.getUserPermissions('admin');
      expect(adminPermissions).toContain('admin:system');
      expect(adminPermissions).toContain('page:read');
      
      const userPermissions = userManager.getUserPermissions('testuser');
      expect(userPermissions).toContain('page:read');
      expect(userPermissions).not.toContain('admin:system');
    });

    test('should check user roles', () => {
      expect(userManager.hasRole('admin', 'admin')).toBe(true);
      expect(userManager.hasRole('testuser', 'reader')).toBe(true);
      expect(userManager.hasRole('testuser', 'admin')).toBe(false);
    });
  });

  describe('session management', () => {
    let testUser;

    beforeEach(async () => {
      testUser = await userManager.createUser({
        username: 'sessionuser',
        password: 'password123',
        email: 'session@example.com'
      });
    });

    test('should create and retrieve sessions', () => {
      const session = userManager.createSession(testUser);
      expect(session).toBeDefined();
      expect(session.id).toBeDefined();
      expect(session.user.username).toBe('sessionuser');
      
      const retrievedSession = userManager.getSession(session.id);
      expect(retrievedSession).toBeDefined();
      expect(retrievedSession.user.username).toBe('sessionuser');
    });

    test('should destroy sessions', () => {
      const session = userManager.createSession(testUser);
      expect(userManager.getSession(session.id)).toBeDefined();
      
      userManager.destroySession(session.id);
      expect(userManager.getSession(session.id)).toBeUndefined();
    });
  });

  describe('role management', () => {
    test('should create custom role', async () => {
      const roleData = {
        name: 'moderator',
        displayName: 'Moderator',
        description: 'Content moderator',
        permissions: ['page:read', 'page:edit', 'attachment:upload']
      };
      
      const result = await userManager.createRole(roleData);
      expect(result.name).toBe('moderator');
      expect(result.permissions).toEqual(['page:read', 'page:edit', 'attachment:upload']);
      
      const role = userManager.getRole('moderator');
      expect(role).toBeDefined();
      expect(role.displayName).toBe('Moderator');
    });

    test('should update role permissions', async () => {
      const roleData = {
        name: 'testrole',
        displayName: 'Test Role',
        description: 'Test role',
        permissions: ['page:read']
      };
      
      await userManager.createRole(roleData);
      
      const updates = {
        permissions: ['page:read', 'page:edit', 'page:create']
      };
      
      const result = await userManager.updateRolePermissions('testrole', updates);
      expect(result.permissions).toEqual(['page:read', 'page:edit', 'page:create']);
      
      const role = userManager.getRole('testrole');
      expect(role.permissions).toEqual(['page:read', 'page:edit', 'page:create']);
    });

    test('should get all roles', () => {
      const roles = userManager.getRoles();
      expect(roles.length).toBeGreaterThanOrEqual(5); // Default system roles
      expect(roles.find(r => r.name === 'admin')).toBeDefined();
      expect(roles.find(r => r.name === 'reader')).toBeDefined();
    });
  });

  describe('password handling', () => {
    test('should hash and verify passwords correctly', () => {
      const password = 'testpassword123';
      const hash = userManager.hashPassword(password);
      
      expect(hash).not.toBe(password);
      expect(hash.length).toBeGreaterThan(0);
      
      expect(userManager.verifyPassword(password, hash)).toBe(true);
      expect(userManager.verifyPassword('wrongpassword', hash)).toBe(false);
    });
  });

  describe('permissions', () => {
    test('should get all permissions', () => {
      const permissions = userManager.getPermissions();
      expect(permissions.size).toBeGreaterThan(0);
      expect(permissions.has('page:read')).toBe(true);
      expect(permissions.has('admin:system')).toBe(true);
    });
  });
});