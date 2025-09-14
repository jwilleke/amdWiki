const { describe, test, expect, beforeEach, afterEach } = require('@jest/globals');
const fs = require('fs').promises;
const path = require('path');
const UserManager = require('../UserManager');

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

  describe('authentication', () => {
    beforeEach(async () => {
      await userManager.createUser({
        username: 'authtest',
        password: 'password123',
        email: 'auth@example.com'
      });
    });

    test('should authenticate user with correct credentials', async () => {
      const result = await userManager.authenticateUser('authtest', 'password123');
      expect(result).toBeDefined();
      expect(result.username).toBe('authtest');
      expect(result.isAuthenticated).toBe(true);
    });

    test('should reject authentication with wrong password', async () => {
      const result = await userManager.authenticateUser('authtest', 'wrongpassword');
      expect(result).toBeNull();
    });

    test('should reject authentication for non-existent user', async () => {
      const result = await userManager.authenticateUser('nonexistent', 'password');
      expect(result).toBeNull();
    });

    test('should reject authentication for inactive user', async () => {
      // Create inactive user
      const userData = {
        username: 'inactiveuser',
        password: 'password123',
        email: 'inactive@example.com',
        isActive: false
      };
      await userManager.createUser(userData);

      const result = await userManager.authenticateUser('inactiveuser', 'password123');
      expect(result).toBeNull();
    });

    test('should update login stats on successful authentication', async () => {
      const beforeAuth = userManager.users.get('authtest');
      const initialLoginCount = beforeAuth.loginCount || 0;

      await userManager.authenticateUser('authtest', 'password123');

      const afterAuth = userManager.users.get('authtest');
      expect(afterAuth.loginCount).toBe(initialLoginCount + 1);
      expect(afterAuth.lastLogin).toBeTruthy();
    });
  });

  describe('user management', () => {
    beforeEach(async () => {
      await userManager.createUser({
        username: 'testuser',
        password: 'password123',
        email: 'test@example.com'
      });
    });

    test('should get user by username', () => {
      const user = userManager.getUser('testuser');
      expect(user).toBeDefined();
      expect(user.username).toBe('testuser');
      expect(user.email).toBe('test@example.com');
    });

    test('should return null for non-existent user', () => {
      const user = userManager.getUser('nonexistent');
      expect(user).toBeNull();
    });

    test('should update user information', async () => {
      const updates = {
        email: 'updated@example.com',
        fullName: 'Test User Updated'
      };

      await userManager.updateUser('testuser', updates);

      const updatedUser = userManager.getUser('testuser');
      expect(updatedUser.email).toBe('updated@example.com');
      expect(updatedUser.fullName).toBe('Test User Updated');
    });

    test('should not allow password update for external users', async () => {
      // Create external OAuth user
      const externalUserData = {
        username: 'oauthuser',
        email: 'oauth@example.com',
        isExternal: true,
        oauthProvider: 'google'
      };
      await userManager.createUser(externalUserData);

      await expect(
        userManager.updateUser('oauthuser', { password: 'newpassword' })
      ).rejects.toThrow('Cannot change password for external OAuth users');
    });

    test('should throw error when updating non-existent user', async () => {
      await expect(
        userManager.updateUser('nonexistent', { email: 'new@example.com' })
      ).rejects.toThrow('User not found');
    });
  });

  describe('role management', () => {
    test('should check if user has role', () => {
      const admin = userManager.users.get('admin');
      expect(userManager.hasRole('admin', 'admin')).toBe(true);
      expect(userManager.hasRole('admin', 'editor')).toBe(false);
    });

    test('should assign roles to user', async () => {
      await userManager.assignRole('admin', 'editor');
      expect(userManager.hasRole('admin', 'editor')).toBe(true);
    });

    test('should remove roles from user', async () => {
      await userManager.assignRole('admin', 'editor');
      expect(userManager.hasRole('admin', 'editor')).toBe(true);

      await userManager.removeRole('admin', 'editor');
      expect(userManager.hasRole('admin', 'editor')).toBe(false);
    });

    test('should handle null user for role checking', () => {
      expect(userManager.hasRole(null, 'admin')).toBe(false);
    });
  });

  describe('permission management', () => {
    test('should check user permissions', () => {
      expect(userManager.hasPermission('admin', 'page:read')).toBe(true);
      expect(userManager.hasPermission('admin', 'page:edit')).toBe(true);
      expect(userManager.hasPermission('admin', 'nonexistent:permission')).toBe(false);
    });

    test('should handle null user for permission checking', () => {
      // Anonymous users should have page:read permission per the anonymous role
      expect(userManager.hasPermission(null, 'page:read')).toBe(true);
      // But they shouldn't have edit permission
      expect(userManager.hasPermission(null, 'page:edit')).toBe(false);
    });

    test('should handle user without roles', () => {
      const userData = {
        username: 'noroleuser',
        password: 'password123',
        email: 'norole@example.com',
        roles: []
      };
      userManager.users.set('noroleuser', userData);

      expect(userManager.hasPermission('noroleuser', 'page:read')).toBe(false);
    });
  });

  describe('session management', () => {
    test('should create session for user', () => {
      const sessionData = {
        username: 'admin',
        roles: ['admin'],
        loginTime: new Date().toISOString()
      };

      const sessionId = userManager.createSession(sessionData);
      expect(sessionId).toBeTruthy();
      expect(userManager.sessions.has(sessionId)).toBe(true);
    });

    test('should get session data', () => {
      const sessionData = {
        username: 'admin',
        roles: ['admin'],
        loginTime: new Date().toISOString()
      };

      const sessionId = userManager.createSession(sessionData);
      const retrievedSession = userManager.getSession(sessionId);
      
      expect(retrievedSession).toBeDefined();
      expect(retrievedSession.username).toBe('admin');
    });

    test('should destroy session', () => {
      const sessionData = {
        username: 'admin',
        roles: ['admin'],
        loginTime: new Date().toISOString()
      };

      const sessionId = userManager.createSession(sessionData);
      expect(userManager.sessions.has(sessionId)).toBe(true);

      userManager.destroySession(sessionId);
      expect(userManager.sessions.has(sessionId)).toBe(false);
    });

    test('should return null for invalid session', () => {
      const session = userManager.getSession('invalid-session-id');
      expect(session).toBeNull();
    });
  });
});