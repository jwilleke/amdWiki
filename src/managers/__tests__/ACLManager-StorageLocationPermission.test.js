const { describe, test, expect, beforeEach, afterEach } = require('@jest/globals');
const ACLManager = require('../ACLManager');
const StorageLocationPermissionConfig = require('../../../config/StorageLocationPermissionConfig');

// Mock the engine and managers
const mockUserManager = {
  hasPermission: jest.fn(),
  hasRole: jest.fn()
};

const mockPageManager = {
  isRequiredPage: jest.fn()
};

const mockEngine = {
  getManager: jest.fn((managerName) => {
    if (managerName === 'UserManager') return mockUserManager;
    if (managerName === 'PageManager') return mockPageManager;
    return null;
  })
};

describe('ACLManager Storage Location Permission Integration', () => {
  let aclManager;

  beforeEach(() => {
    aclManager = new ACLManager(mockEngine);
    
    // Clear all mocks
    jest.clearAllMocks();
    
    // Clear permission cache
    if (aclManager.permissionCache) {
      aclManager.permissionCache.clear();
    }
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Storage Location Detection', () => {
    test('should determine storage location from page metadata', async () => {
      const metadata = { 'system-category': 'System' };
      const location = await aclManager.getPageStorageLocation('TestPage', metadata);
      expect(location).toBe('required-pages');
    });

    test('should determine storage location from page metadata - General category', async () => {
      const metadata = { 'system-category': 'General' };
      const location = await aclManager.getPageStorageLocation('TestPage', metadata);
      expect(location).toBe('pages');
    });

    test('should determine storage location from page metadata - Developer category', async () => {
      const metadata = { 'system-category': 'Developer' };
      const location = await aclManager.getPageStorageLocation('TestPage', metadata);
      expect(location).toBe('docs');
    });

    test('should fall back to PageManager when no metadata provided', async () => {
      mockPageManager.isRequiredPage.mockResolvedValue(true);
      
      const location = await aclManager.getPageStorageLocation('SystemPage');
      expect(location).toBe('required-pages');
      expect(mockPageManager.isRequiredPage).toHaveBeenCalledWith('SystemPage', null);
    });

    test('should default to pages directory when all else fails', async () => {
      mockPageManager.isRequiredPage.mockRejectedValue(new Error('PageManager error'));
      
      const location = await aclManager.getPageStorageLocation('UnknownPage');
      expect(location).toBe('pages');
    });
  });

  describe('Storage Location Permission Checking', () => {
    test('should allow public read access to pages in pages directory', async () => {
      const user = null; // anonymous user
      mockUserManager.hasPermission.mockReturnValue(false);
      
      const result = aclManager.checkStorageLocationPermission('pages', 'view', user, 'TestPage');
      expect(result).toBe(true); // 'all' includes anonymous users
    });

    test('should require authentication for editing pages in pages directory', async () => {
      const user = { username: 'testuser', isAuthenticated: true };
      mockUserManager.hasRole.mockReturnValue(false);
      
      const result = aclManager.checkStorageLocationPermission('pages', 'edit', user, 'TestPage');
      expect(result).toBe(true); // authenticated users can edit
    });

    test('should restrict editing of system pages to admins', async () => {
      const user = { username: 'testuser', isAuthenticated: true };
      mockUserManager.hasRole.mockReturnValue(false);
      
      const result = aclManager.checkStorageLocationPermission('required-pages', 'edit', user, 'SystemPage');
      expect(result).toBe(false); // only admins can edit system pages
    });

    test('should allow admin to edit system pages', async () => {
      const user = { username: 'admin', isAuthenticated: true, roles: ['admin'] };
      mockUserManager.hasRole.mockImplementation((username, role) => 
        username === 'admin' && role === 'admin'
      );
      
      const result = aclManager.checkStorageLocationPermission('required-pages', 'edit', user, 'SystemPage');
      expect(result).toBe(true);
    });

    test('should allow developers to edit developer pages', async () => {
      const user = { username: 'dev', isAuthenticated: true, roles: ['developer'] };
      mockUserManager.hasRole.mockImplementation((username, role) => 
        username === 'dev' && role === 'developer'
      );
      
      const result = aclManager.checkStorageLocationPermission('docs', 'edit', user, 'DevPage');
      expect(result).toBe(true);
    });
  });

  describe('Restricted Pattern Matching', () => {
    test('should match wildcard patterns', () => {
      const result = aclManager.matchesRestrictedPattern('admin-panel', ['admin*']);
      expect(result).toBe(true);
    });

    test('should match exact patterns', () => {
      const result = aclManager.matchesRestrictedPattern('user-manager', ['user-manager']);
      expect(result).toBe(true);
    });

    test('should not match non-matching patterns', () => {
      const result = aclManager.matchesRestrictedPattern('regular-page', ['admin*', 'system*']);
      expect(result).toBe(false);
    });
  });

  describe('Always Restricted Pages', () => {
    test('should identify always restricted pages', () => {
      const result = aclManager.isAlwaysRestrictedPage('user-manager');
      expect(result).toBe(true);
    });

    test('should not restrict regular pages', () => {
      const result = aclManager.isAlwaysRestrictedPage('regular-page');
      expect(result).toBe(false);
    });
  });

  describe('Role Hierarchy', () => {
    test('should respect role hierarchy - admin inherits developer permissions', () => {
      const user = { username: 'admin', isAuthenticated: true, roles: ['admin'] };
      
      const result = aclManager.userHasRoleViaHierarchy(user, 'developer');
      expect(result).toBe(true);
    });

    test('should respect role hierarchy - developer inherits authenticated permissions', () => {
      const user = { username: 'dev', isAuthenticated: true, roles: ['developer'] };
      
      const result = aclManager.userHasRoleViaHierarchy(user, 'authenticated');
      expect(result).toBe(true);
    });

    test('should not grant higher permissions to lower roles', () => {
      const user = { username: 'user', isAuthenticated: true, roles: ['authenticated'] };
      
      const result = aclManager.userHasRoleViaHierarchy(user, 'admin');
      expect(result).toBe(false);
    });
  });

  describe('Comprehensive Permission Checking', () => {
    test('should grant admin access to any page regardless of storage location', async () => {
      const user = { username: 'admin', isAuthenticated: true };
      mockUserManager.hasPermission.mockImplementation((username, permission) => 
        username === 'admin' && permission === 'admin:system'
      );
      
      const result = await aclManager.checkPagePermission(
        'system-page', 'edit', user, '', { 'system-category': 'System' }
      );
      expect(result).toBe(true);
    });

    test('should check ACL override for pages directory when ACL exists', async () => {
      const user = { username: 'testuser', isAuthenticated: true };
      const pageContent = '[{ALLOW edit testuser}]';
      mockUserManager.hasPermission.mockReturnValue(false);
      mockUserManager.hasRole.mockReturnValue(false);
      
      const result = await aclManager.checkPagePermission(
        'test-page', 'edit', user, pageContent, { 'system-category': 'General' }
      );
      expect(result).toBe(true); // ACL allows the specific user
    });

    test('should ignore ACL for system pages when ACL override is disabled', async () => {
      const user = { username: 'testuser', isAuthenticated: true };
      const pageContent = '[{ALLOW edit testuser}]'; // This should be ignored
      mockUserManager.hasRole.mockReturnValue(false);
      
      // System pages don't allow ACL override
      const result = await aclManager.checkPagePermission(
        'system-page', 'edit', user, pageContent, { 'system-category': 'System' }
      );
      expect(result).toBe(false); // ACL is ignored, only admin can edit
    });

    test('should use storage location default when no ACL exists', async () => {
      const user = { username: 'testuser', isAuthenticated: true };
      const pageContent = '# Regular page content'; // No ACL
      
      const result = await aclManager.checkPagePermission(
        'test-page', 'edit', user, pageContent, { 'system-category': 'General' }
      );
      expect(result).toBe(true); // Authenticated user can edit pages in pages directory
    });
  });

  describe('Permission Caching', () => {
    test('should cache permission decisions when caching is enabled', async () => {
      // Enable caching for this test
      aclManager.storageConfig.performance.enablePermissionCache = true;
      aclManager.permissionCache = new Map();
      
      const user = { username: 'testuser', isAuthenticated: true };
      mockUserManager.hasPermission.mockReturnValue(false);
      
      // First call
      const result1 = await aclManager.checkPagePermission(
        'test-page', 'view', user, '', { 'system-category': 'General' }
      );
      
      // Second call should use cache
      const result2 = await aclManager.checkPagePermission(
        'test-page', 'view', user, '', { 'system-category': 'General' }
      );
      
      expect(result1).toBe(result2);
      expect(aclManager.permissionCache.size).toBe(1);
    });

    test('should generate consistent cache keys', () => {
      const user = { username: 'testuser', roles: ['authenticated'] };
      
      const key1 = aclManager.generatePermissionCacheKey('test-page', 'view', user);
      const key2 = aclManager.generatePermissionCacheKey('test-page', 'view', user);
      
      expect(key1).toBe(key2);
      expect(key1).toContain('test-page');
      expect(key1).toContain('view');
      expect(key1).toContain('testuser');
    });
  });

  describe('Configuration Access', () => {
    test('should provide access to storage location configurations', () => {
      const pagesConfig = aclManager.getStorageLocationConfig('pages');
      expect(pagesConfig).toBeDefined();
      expect(pagesConfig.description).toBe('User-generated content directory');
    });

    test('should return all storage location configurations', () => {
      const allConfigs = aclManager.getAllStorageLocationConfigs();
      expect(allConfigs).toHaveProperty('pages');
      expect(allConfigs).toHaveProperty('required-pages');
      expect(allConfigs).toHaveProperty('docs');
    });
  });

  describe('Backward Compatibility', () => {
    test('should maintain backward compatibility with checkDefaultPermission', () => {
      const user = { username: 'testuser', isAuthenticated: true };
      mockUserManager.hasPermission.mockReturnValue(true);
      
      const result = aclManager.checkDefaultPermission('view', user);
      expect(result).toBe(true);
      expect(mockUserManager.hasPermission).toHaveBeenCalledWith('testuser', 'page:read');
    });

    test('should maintain backward compatibility with isSystemOrAdminPage', () => {
      const result = aclManager.isSystemOrAdminPage('admin-panel');
      expect(result).toBe(true);
    });
  });
});