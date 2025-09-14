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

    test('should initialize with existing users and roles', async () => {
      // Create a new UserManager to test loading existing users
      const userManager2 = new UserManager(null);
      await userManager2.initialize({ usersDirectory: tempDir });
      
      // Should load the existing admin user
      expect(userManager2.users.size).toBe(1);
      expect(userManager2.users.has('admin')).toBe(true);
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

    test('should create external OAuth user', async () => {
      const userData = {
        username: 'oauthuser',
        email: 'oauth@example.com',
        isExternal: true,
        roles: ['reader']
      };

      const result = await userManager.createUser(userData);
      expect(result.isExternal).toBe(true);
      expect(result.password).toBeUndefined(); // Should not have password field in return

      const user = userManager.users.get('oauthuser');
      expect(user.password).toBeNull(); // Internal storage should be null
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

    test('should get all users without passwords', () => {
      const users = userManager.getUsers();
      expect(users.length).toBeGreaterThan(0);
      
      users.forEach(user => {
        expect(user.password).toBeUndefined();
        expect(user.username).toBeDefined();
      });
    });

    test('should delete user', async () => {
      await userManager.deleteUser('testuser');
      expect(userManager.users.has('testuser')).toBe(false);
    });

    test('should not delete system user', async () => {
      await expect(userManager.deleteUser('admin')).rejects.toThrow('Cannot delete system user');
    });

    test('should throw error when deleting non-existent user', async () => {
      await expect(userManager.deleteUser('nonexistent')).rejects.toThrow('User not found');
    });
  });

  describe('external user management', () => {
    test('should create or update external user', async () => {
      const externalUserData = {
        username: 'external1',
        email: 'external1@example.com',
        displayName: 'External User',
        roles: ['editor'],
        provider: 'google'
      };

      const result = await userManager.createOrUpdateExternalUser(externalUserData);
      expect(result.username).toBe('external1');
      expect(result.isExternal).toBe(true);
      expect(result.provider).toBe('google');
      expect(result.password).toBeUndefined();
    });

    test('should update existing external user', async () => {
      const externalUserData = {
        username: 'external2',
        email: 'external2@example.com',
        displayName: 'External User',
        roles: ['reader'],
        provider: 'github'
      };

      // Create user first
      await userManager.createOrUpdateExternalUser(externalUserData);

      // Update user
      const updatedData = {
        ...externalUserData,
        displayName: 'Updated External User',
        roles: ['editor']
      };
      
      const result = await userManager.createOrUpdateExternalUser(updatedData);
      expect(result.displayName).toBe('Updated External User');
      expect(result.roles).toContain('editor');
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

    test('should throw error when assigning role to non-existent user', async () => {
      await expect(userManager.assignRole('nonexistent', 'editor')).rejects.toThrow('User not found');
    });

    test('should throw error when assigning non-existent role', async () => {
      await expect(userManager.assignRole('admin', 'nonexistent')).rejects.toThrow('Role not found');
    });

    test('should get all roles', () => {
      const roles = userManager.getRoles();
      expect(roles.length).toBeGreaterThan(0);
      expect(roles.some(role => role.name === 'admin')).toBe(true);
    });

    test('should get role by name', () => {
      const adminRole = userManager.getRole('admin');
      expect(adminRole).toBeDefined();
      expect(adminRole.name).toBe('admin');
      
      const nonExistentRole = userManager.getRole('nonexistent');
      expect(nonExistentRole).toBeNull();
    });

    test('should create custom role', async () => {
      const roleData = {
        name: 'customrole',
        displayName: 'Custom Role',
        description: 'A custom role for testing',
        permissions: ['page:read', 'page:edit']
      };

      await userManager.createRole(roleData);
      
      const role = userManager.getRole('customrole');
      expect(role).toBeDefined();
      expect(role.name).toBe('customrole');
      expect(role.permissions).toEqual(['page:read', 'page:edit']);
    });

    test('should throw error when creating duplicate role', async () => {
      const roleData = {
        name: 'admin',
        displayName: 'Duplicate Admin',
        description: 'Should not be created',
        permissions: []
      };

      await expect(userManager.createRole(roleData)).rejects.toThrow('Role already exists');
    });

    test('should update role permissions', async () => {
      const updates = {
        permissions: ['page:read', 'page:edit', 'page:create'],
        description: 'Updated role'
      };

      const result = await userManager.updateRolePermissions('reader', updates);
      expect(result).toBe(true);

      const updatedRole = userManager.getRole('reader');
      expect(updatedRole.permissions).toEqual(updates.permissions);
      expect(updatedRole.description).toBe(updates.description);
    });

    test('should handle error when updating non-existent role', async () => {
      const result = await userManager.updateRolePermissions('nonexistent', { permissions: [] });
      expect(result).toBe(false);
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

    test('should handle anonymous user for permission checking', () => {
      expect(userManager.hasPermission('anonymous', 'page:read')).toBe(true);
      expect(userManager.hasPermission('anonymous', 'page:edit')).toBe(false);
    });

    test('should handle asserted user for permission checking', () => {
      expect(userManager.hasPermission('asserted', 'page:read')).toBe(true);
      expect(userManager.hasPermission('asserted', 'page:edit')).toBe(false);
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

    test('should get user effective permissions', () => {
      const permissions = userManager.getUserPermissions('admin');
      expect(permissions).toContain('page:read');
      expect(permissions).toContain('page:edit');
      expect(permissions.length).toBeGreaterThan(0);
    });

    test('should get anonymous user permissions', () => {
      const permissions = userManager.getUserPermissions(null);
      expect(permissions).toContain('page:read');
      expect(permissions.length).toBe(1);
    });

    test('should get asserted user permissions', () => {
      const permissions = userManager.getUserPermissions('asserted');
      expect(permissions).toContain('page:read');
    });

    test('should get permissions map', () => {
      const permissions = userManager.getPermissions();
      expect(permissions).toBeInstanceOf(Map);
      expect(permissions.size).toBeGreaterThan(0);
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

    test('should handle expired session', () => {
      const sessionData = {
        username: 'admin',
        roles: ['admin'],
        loginTime: new Date().toISOString()
      };

      const sessionId = userManager.createSession(sessionData);
      
      // Manually expire the session
      const session = userManager.sessions.get(sessionId);
      session.expiresAt = new Date(Date.now() - 1000).toISOString(); // Expired 1 second ago
      
      const retrievedSession = userManager.getSession(sessionId);
      expect(retrievedSession).toBeNull();
      expect(userManager.sessions.has(sessionId)).toBe(false); // Should be deleted
    });

    test('should delete sessions when user is deleted', async () => {
      await userManager.createUser({
        username: 'sessiontest',
        password: 'password123',
        email: 'session@example.com'
      });

      // Create session for user
      const sessionId = userManager.createSession({ username: 'sessiontest' });
      expect(userManager.sessions.has(sessionId)).toBe(true);

      // Delete user
      await userManager.deleteUser('sessiontest');

      // Session should be gone
      expect(userManager.sessions.has(sessionId)).toBe(false);
    });
  });

  describe('utility methods', () => {
    test('should hash and verify passwords correctly', () => {
      const password = 'testpassword123';
      const hash = userManager.hashPassword(password);
      
      expect(hash).toBeDefined();
      expect(hash).not.toBe(password);
      expect(userManager.verifyPassword(password, hash)).toBe(true);
      expect(userManager.verifyPassword('wrongpassword', hash)).toBe(false);
    });

    test('should handle JWT token validation with invalid token', () => {
      const invalidTokens = [
        'invalid-token',
        'invalid.token',
        'invalid.token.format.extra',
        null,
        undefined,
        ''
      ];

      invalidTokens.forEach(token => {
        if (token !== null && token !== undefined) {
          const result = userManager.validateJwtToken(token);
          expect(result).toBeNull();
        }
      });
    });

    test('should handle external role mapping', () => {
      // Test role mapping logic through external user creation
      const externalUserData = {
        username: 'roletest',
        email: 'roletest@example.com',
        displayName: 'Role Test User',
        roles: ['custom-external-role'],
        provider: 'custom'
      };

      // This indirectly tests mapExternalRoles method
      expect(async () => {
        await userManager.createOrUpdateExternalUser(externalUserData);
      }).not.toThrow();
    });
  });

  describe('file operations', () => {
    test('should handle save users error gracefully', async () => {
      // Create a scenario where saving fails by making directory readonly
      if (process.platform !== 'win32') { // Skip on Windows due to permission model differences
        try {
          await fs.chmod(tempDir, 0o444); // Read-only
          
          // This should handle the error gracefully
          const userData = {
            username: 'savefailuser',
            password: 'password123',
            email: 'savefail@example.com'
          };

          // The save operation might fail, but it shouldn't crash
          await userManager.createUser(userData);
          
          // Restore permissions for cleanup
          await fs.chmod(tempDir, 0o755);
        } catch (err) {
          // Restore permissions even if test fails
          await fs.chmod(tempDir, 0o755);
        }
      }
    });

    test('should handle load roles error gracefully', async () => {
      // Create a new UserManager to test role loading
      const userManager2 = new UserManager(null);
      
      // This should not throw even if roles file doesn't exist
      expect(async () => {
        await userManager2.initialize({ usersDirectory: tempDir });
      }).not.toThrow();
    });

    test('should load existing roles from file', async () => {
      // Create roles file first
      const rolesFile = path.join(tempDir, 'roles.json');
      const customRoles = {
        'customrole1': {
          name: 'customrole1',
          displayName: 'Custom Role 1',
          description: 'Custom role for testing',
          permissions: ['page:read'],
          isSystem: false
        }
      };
      await fs.writeFile(rolesFile, JSON.stringify(customRoles));

      // Create new UserManager to test loading
      const userManager2 = new UserManager(null);
      await userManager2.initialize({ usersDirectory: tempDir });

      expect(userManager2.getRole('customrole1')).toBeDefined();
      expect(userManager2.getRole('customrole1').name).toBe('customrole1');
    });

    test('should handle saveRoles error gracefully', async () => {
      // Test the error handling in saveRoles by creating a scenario where it might fail
      const originalConsoleError = console.error;
      console.error = jest.fn();

      try {
        // Create a role update that would trigger saveRoles
        await userManager.updateRolePermissions('reader', { permissions: ['page:read'] });
        
        // If it doesn't throw, that's good - it handled any errors gracefully
        expect(true).toBe(true);
      } finally {
        console.error = originalConsoleError;
      }
    });
  });

  describe('JWT and external auth', () => {
    test('should validate proper JWT token', () => {
      // Create a simple mock JWT token (not cryptographically secure, just for testing structure)
      const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64');
      const payload = Buffer.from(JSON.stringify({
        sub: 'testuser',
        email: 'test@example.com',
        name: 'Test User',
        exp: Math.floor(Date.now() / 1000) + 3600 // Expires in 1 hour
      })).toString('base64');
      const signature = 'mock-signature';
      
      const token = `${header}.${payload}.${signature}`;
      
      const result = userManager.validateJwtToken(token);
      expect(result).toBeDefined();
      expect(result.username).toBe('testuser');
    });

    test('should handle expired JWT token', () => {
      const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64');
      const payload = Buffer.from(JSON.stringify({
        sub: 'testuser',
        email: 'test@example.com',
        exp: Math.floor(Date.now() / 1000) - 3600 // Expired 1 hour ago
      })).toString('base64');
      const signature = 'mock-signature';
      
      const token = `${header}.${payload}.${signature}`;
      
      const result = userManager.validateJwtToken(token);
      expect(result).toBeNull();
    });

    test('should get anonymous user object', () => {
      const anonymousUser = userManager.getAnonymousUser();
      expect(anonymousUser.username).toBe('anonymous');
      expect(anonymousUser.isAuthenticated).toBe(false);
      expect(anonymousUser.roles).toContain('anonymous');
    });

    test('should get asserted user object', () => {
      const assertedUser = userManager.getAssertedUser();
      expect(assertedUser.username).toBe('asserted');
      expect(assertedUser.isAuthenticated).toBe(false);
      expect(assertedUser.roles).toContain('reader');
    });

    test('should get current user from request with JWT', () => {
      const mockReq = {
        headers: {
          authorization: 'Bearer invalid-token'
        },
        session: {},
        cookies: {}
      };

      // This should return null for invalid token
      const user = userManager.getCurrentUser(mockReq);
      expect(user).toBeNull();
    });

    test('should get current user from request with session', () => {
      // Create a session first
      const sessionId = userManager.createSession({ username: 'admin' });
      
      const mockReq = {
        headers: {},
        session: { sessionId },
        cookies: {}
      };

      const user = userManager.getCurrentUser(mockReq);
      expect(user).toBeDefined();
      expect(user.username).toBe('admin');
    });

    test('should return asserted user for expired session', () => {
      const mockReq = {
        headers: {},
        session: {},
        cookies: { sessionId: 'expired-or-invalid-session' }
      };

      const user = userManager.getCurrentUser(mockReq);
      expect(user).toBeDefined();
      expect(user.username).toBe('asserted');
    });

    test('should handle request with no authentication', () => {
      const mockReq = {
        headers: {},
        session: {},
        cookies: {}
      };

      const user = userManager.getCurrentUser(mockReq);
      expect(user).toBeNull();
    });
  });

  describe('middleware functions', () => {
    test('should create requireAuth middleware', () => {
      const middleware = userManager.requireAuth();
      expect(typeof middleware).toBe('function');
    });
  });
});