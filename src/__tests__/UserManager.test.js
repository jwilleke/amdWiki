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

    test('should handle expired sessions', () => {
      const session = userManager.createSession(testUser);
      
      // Manually expire the session
      session.expiresAt = new Date(Date.now() - 1000).toISOString(); // 1 second ago
      
      const result = userManager.getSession(session.id);
      expect(result).toBeUndefined();
      
      // Session should be automatically removed
      expect(userManager.sessions.has(session.id)).toBe(false);
    });

    test('should handle non-existent session', () => {
      const result = userManager.getSession('nonexistent-session-id');
      expect(result).toBeUndefined();
    });

    test('should update session last access time', async () => {
      const session = userManager.createSession(testUser);
      const originalLastAccess = session.lastAccess;
      
      // Wait a bit and get session again
      await new Promise(resolve => setTimeout(resolve, 10));
      const retrievedSession = userManager.getSession(session.id);
      expect(retrievedSession.lastAccess).not.toBe(originalLastAccess);
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

  describe('file I/O operations', () => {
    test('should save and load users from disk', async () => {
      // Create a test user
      const userData = {
        username: 'persistuser',
        password: 'password123',
        email: 'persist@example.com'
      };
      
      await userManager.createUser(userData);
      
      // Create a new UserManager instance to test loading
      const newUserManager = new UserManager(null);
      await newUserManager.initialize({ usersDirectory: tempDir });
      
      // Check that the user was loaded
      const loadedUser = newUserManager.getUser('persistuser');
      expect(loadedUser).toBeDefined();
      expect(loadedUser.username).toBe('persistuser');
      expect(loadedUser.email).toBe('persist@example.com');
    });

    test('should save and load roles from disk', async () => {
      // Create a custom role
      const roleData = {
        name: 'customrole',
        displayName: 'Custom Role',
        description: 'A custom role for testing',
        permissions: ['page:read', 'page:edit']
      };
      
      await userManager.createRole(roleData);
      
      // Create a new UserManager instance to test loading
      const newUserManager = new UserManager(null);
      await newUserManager.initialize({ usersDirectory: tempDir });
      
      // Check that the role was loaded
      const loadedRole = newUserManager.getRole('customrole');
      expect(loadedRole).toBeDefined();
      expect(loadedRole.name).toBe('customrole');
      expect(loadedRole.permissions).toEqual(['page:read', 'page:edit']);
    });

    test('should handle missing users file gracefully', async () => {
      // Remove users file if it exists
      const usersFile = path.join(tempDir, 'users.json');
      try {
        await fs.unlink(usersFile);
      } catch (err) {
        // File doesn't exist, which is fine
      }
      
      // Create a new UserManager instance
      const newUserManager = new UserManager(null);
      await newUserManager.initialize({ usersDirectory: tempDir });
      
      // Should have default admin user
      const adminUser = newUserManager.getUser('admin');
      expect(adminUser).toBeDefined();
      expect(adminUser.username).toBe('admin');
    });

    test('should handle missing roles file gracefully', async () => {
      // Remove roles file if it exists
      const rolesFile = path.join(tempDir, 'roles.json');
      try {
        await fs.unlink(rolesFile);
      } catch (err) {
        // File doesn't exist, which is fine
      }
      
      // Create a new UserManager instance
      const newUserManager = new UserManager(null);
      await newUserManager.initialize({ usersDirectory: tempDir });
      
      // Should have default roles
      const adminRole = newUserManager.getRole('admin');
      expect(adminRole).toBeDefined();
      expect(adminRole.permissions).toContain('admin:system');
    });
  });

  describe('external user management', () => {
    test('should create new external user', async () => {
      const externalUserData = {
        username: 'externaluser',
        email: 'external@example.com',
        displayName: 'External User',
        roles: ['reader'],
        provider: 'google'
      };
      
      const result = await userManager.createOrUpdateExternalUser(externalUserData);
      
      expect(result.username).toBe('externaluser');
      expect(result.email).toBe('external@example.com');
      expect(result.displayName).toBe('External User');
      expect(result.isExternal).toBe(true);
      expect(result.provider).toBe('google');
      expect(result.password).toBeUndefined(); // External users have no password
      
      // Verify user was saved
      const savedUser = userManager.getUser('externaluser');
      expect(savedUser).toBeDefined();
      expect(savedUser.isExternal).toBe(true);
    });

    test('should update existing external user', async () => {
      // Create initial external user
      const initialData = {
        username: 'updateuser',
        email: 'old@example.com',
        displayName: 'Old Name',
        roles: ['reader'],
        provider: 'google'
      };
      
      await userManager.createOrUpdateExternalUser(initialData);
      
      // Update the user
      const updateData = {
        username: 'updateuser',
        email: 'new@example.com',
        displayName: 'New Name',
        roles: ['reader', 'editor'],
        provider: 'google'
      };
      
      const result = await userManager.createOrUpdateExternalUser(updateData);
      
      expect(result.email).toBe('new@example.com');
      expect(result.displayName).toBe('New Name');
      expect(result.roles).toEqual(['reader', 'editor']);
      expect(result.loginCount).toBe(2); // Should increment login count
    });

    test('should handle external user without displayName', async () => {
      const externalUserData = {
        username: 'nodisplayname',
        email: 'no-display@example.com',
        roles: ['reader'],
        provider: 'github'
      };
      
      const result = await userManager.createOrUpdateExternalUser(externalUserData);
      
      expect(result.displayName).toBe('nodisplayname'); // Should default to username
    });
  });

  describe('authentication', () => {
    test('should authenticate user with correct password', async () => {
      const userData = {
        username: 'authuser',
        password: 'correctpassword',
        email: 'auth@example.com'
      };
      
      await userManager.createUser(userData);
      
      const result = await userManager.authenticateUser('authuser', 'correctpassword');
      
      expect(result).toBeDefined();
      expect(result.username).toBe('authuser');
      expect(result.isAuthenticated).toBe(true);
      expect(result.password).toBeUndefined(); // Password should not be returned
    });

    test('should reject authentication with wrong password', async () => {
      const userData = {
        username: 'wrongpass',
        password: 'correctpassword',
        email: 'wrong@example.com'
      };
      
      await userManager.createUser(userData);
      
      const result = await userManager.authenticateUser('wrongpass', 'wrongpassword');
      
      expect(result).toBeNull();
    });

    test('should reject authentication for inactive user', async () => {
      const userData = {
        username: 'inactiveuser',
        password: 'password123',
        email: 'inactive@example.com'
      };
      
      await userManager.createUser(userData);
      
      // Manually set user as inactive
      const user = userManager.users.get('inactiveuser');
      user.isActive = false;
      
      const result = await userManager.authenticateUser('inactiveuser', 'password123');
      
      expect(result).toBeNull();
    });

    test('should reject authentication for non-existent user', async () => {
      const result = await userManager.authenticateUser('nonexistent', 'password123');
      
      expect(result).toBeNull();
    });

    test('should update login statistics on successful authentication', async () => {
      const userData = {
        username: 'statsuser',
        password: 'password123',
        email: 'stats@example.com'
      };
      
      await userManager.createUser(userData);
      
      const result = await userManager.authenticateUser('statsuser', 'password123');
      
      expect(result.loginCount).toBe(1);
      expect(result.lastLogin).toBeDefined();
      
      // Authenticate again to check login count increment
      const result2 = await userManager.authenticateUser('statsuser', 'password123');
      expect(result2.loginCount).toBe(2);
    });
  });

  describe('anonymous and asserted users', () => {
    test('should handle anonymous user permissions', () => {
      const permissions = userManager.getUserPermissions('anonymous');
      expect(permissions).toEqual(['page:read']); // Anonymous users should have read permission
      
      expect(userManager.hasPermission('anonymous', 'page:read')).toBe(true);
      expect(userManager.hasPermission('anonymous', 'page:edit')).toBe(false);
    });

    test('should handle null username as anonymous', () => {
      const permissions = userManager.getUserPermissions(null);
      expect(permissions).toEqual(['page:read']);
      
      expect(userManager.hasPermission(null, 'page:read')).toBe(true);
      expect(userManager.hasPermission(null, 'page:edit')).toBe(false);
    });

    test('should handle asserted user permissions', () => {
      const permissions = userManager.getUserPermissions('asserted');
      expect(permissions).toEqual(['page:read', 'search:all', 'export:pages']);
      
      expect(userManager.hasPermission('asserted', 'page:read')).toBe(true);
      expect(userManager.hasPermission('asserted', 'search:all')).toBe(true);
      expect(userManager.hasPermission('asserted', 'admin:system')).toBe(false);
    });

    test('should return anonymous user object', () => {
      const anonymousUser = userManager.getAnonymousUser();
      expect(anonymousUser).toBeDefined();
      expect(anonymousUser.username).toBe('anonymous');
      expect(anonymousUser.roles).toEqual(['anonymous']);
      expect(anonymousUser.isAuthenticated).toBe(false);
    });

    test('should return asserted user object', () => {
      const assertedUser = userManager.getAssertedUser();
      expect(assertedUser).toBeDefined();
      expect(assertedUser.username).toBe('asserted');
      expect(assertedUser.roles).toEqual(['reader']);
      expect(assertedUser.isAuthenticated).toBe(false);
      expect(assertedUser.hasSessionCookie).toBe(true);
    });
  });

  describe('error handling', () => {
    test('should handle password update for external users', async () => {
      // Create an external user
      const externalUserData = {
        username: 'externaluser2',
        email: 'external2@example.com',
        roles: ['reader'],
        provider: 'google'
      };
      
      await userManager.createOrUpdateExternalUser(externalUserData);
      
      // Try to update password for external user
      await expect(userManager.updateUser('externaluser2', { password: 'newpassword' }))
        .rejects.toThrow('Cannot change password for external OAuth users');
    });

    test('should handle update of non-existent user', async () => {
      await expect(userManager.updateUser('nonexistent', { email: 'test@example.com' }))
        .rejects.toThrow('User not found');
    });

    test('should handle deletion of non-existent user', async () => {
      await expect(userManager.deleteUser('nonexistent'))
        .rejects.toThrow('User not found');
    });

    test('should handle deletion of system user', async () => {
      await expect(userManager.deleteUser('admin'))
        .rejects.toThrow('Cannot delete system user');
    });

    test('should handle creation of duplicate role', async () => {
      const roleData = {
        name: 'duplicaterole',
        displayName: 'Duplicate Role',
        description: 'Test role',
        permissions: ['page:read']
      };
      
      await userManager.createRole(roleData);
      
      await expect(userManager.createRole(roleData))
        .rejects.toThrow('Role already exists');
    });

    test('should handle update of non-existent role', async () => {
      const result = await userManager.updateRolePermissions('nonexistent', { permissions: ['page:read'] });
      expect(result).toBe(false);
    });

    test('should prevent password update for external users', async () => {
      const externalUser = await userManager.createOrUpdateExternalUser({
        username: 'externaluser',
        email: 'external@example.com',
        displayName: 'External User',
        provider: 'google'
      });

      await expect(userManager.updateUser('externaluser', { password: 'newpassword' }))
        .rejects.toThrow('Cannot change password for external OAuth users');
    });

    test('should handle saveUsers error gracefully', async () => {
      const fs = require('fs').promises;
      const originalWriteFile = fs.writeFile;
      
      // Mock fs.writeFile to throw an error
      fs.writeFile = jest.fn().mockRejectedValue(new Error('Disk write error'));
      
      // Create a user to trigger save
      await userManager.createUser({
        username: 'testuser',
        password: 'password123',
        displayName: 'Test User'
      });
      
      // Restore original function
      fs.writeFile = originalWriteFile;
    });

    test('should check if user has specific role', () => {
      const user = userManager.createUser({
        username: 'roleuser',
        password: 'password123',
        displayName: 'Role User',
        roles: ['contributor']
      });

      expect(userManager.hasRole('roleuser', 'contributor')).toBe(true);
      expect(userManager.hasRole('roleuser', 'admin')).toBe(false);
      expect(userManager.hasRole('nonexistent', 'contributor')).toBe(false);
    });
  });
});