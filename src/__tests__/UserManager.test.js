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
  });
});
