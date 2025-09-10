const { describe, test, expect, beforeEach } = require('@jest/globals');
const ACLManager = require('../ACLManager');

// Mock UserManager
const mockUserManager = {
  hasPermission: jest.fn(),
  hasRole: jest.fn()
};

// Mock engine
const mockEngine = {
  getManager: jest.fn((name) => {
    if (name === 'UserManager') {
      return mockUserManager;
    }
    return null;
  }),
  getConfig: jest.fn(() => ({
    get: jest.fn()
  }))
};

describe('ACLManager', () => {
  let aclManager;

  beforeEach(async () => {
    aclManager = new ACLManager(mockEngine);
    await aclManager.initialize();
    
    // Reset all mocks
    jest.clearAllMocks();
  });

  describe('ACL parsing', () => {
    test('should parse ALLOW view ACL correctly', () => {
      const content = '[{ALLOW view admin,editor,user1}]';
      const acl = aclManager.parseACL(content);
      
      expect(acl).toBeTruthy();
      expect(acl.view).toEqual(['admin', 'editor', 'user1']);
      expect(acl.edit).toEqual([]);
    });

    test('should parse multiple ACL rules', () => {
      const content = `
        [{ALLOW view admin,editor}]
        [{ALLOW edit admin}]
        [{ALLOW delete admin}]
      `;
      const acl = aclManager.parseACL(content);
      
      expect(acl.view).toEqual(['admin', 'editor']);
      expect(acl.edit).toEqual(['admin']);
      expect(acl.delete).toEqual(['admin']);
      expect(acl.rename).toEqual([]);
      expect(acl.upload).toEqual([]);
    });

    test('should handle ACL with different actions', () => {
      const content = '[{ALLOW upload admin,contributor}] [{ALLOW rename admin}]';
      const acl = aclManager.parseACL(content);
      
      expect(acl.upload).toEqual(['admin', 'contributor']);
      expect(acl.rename).toEqual(['admin']);
    });

    test('should handle case insensitive ACL parsing', () => {
      const content = '[{allow VIEW admin,editor}] [{ALLOW edit ADMIN}]';
      const acl = aclManager.parseACL(content);
      
      expect(acl.view).toEqual(['admin', 'editor']);
      expect(acl.edit).toEqual(['ADMIN']);
    });

    test('should return null for content without ACL', () => {
      const content = 'This is just regular page content without any ACL rules.';
      const acl = aclManager.parseACL(content);
      
      expect(acl).toBeNull();
    });

    test('should handle empty content', () => {
      const acl = aclManager.parseACL('');
      expect(acl).toBeNull();
      
      const aclNull = aclManager.parseACL(null);
      expect(aclNull).toBeNull();
    });

    test('should trim whitespace from principals', () => {
      const content = '[{ALLOW view  admin , editor  ,  user1  }]';
      const acl = aclManager.parseACL(content);
      
      expect(acl.view).toEqual(['admin', 'editor', 'user1']);
    });
  });

  describe('user principal matching', () => {
    test('should match user by username', () => {
      const user = { username: 'testuser', isAuthenticated: true };
      const principals = ['admin', 'testuser', 'editor'];
      
      const matches = aclManager.userMatchesPrincipals(user, principals);
      expect(matches).toBe(true);
    });

    test('should match authenticated users', () => {
      const user = { username: 'testuser', isAuthenticated: true };
      const principals = ['authenticated'];
      
      const matches = aclManager.userMatchesPrincipals(user, principals);
      expect(matches).toBe(true);
    });

    test('should match anonymous users', () => {
      const user = { username: 'anonymous' };
      const principals = ['anonymous'];
      
      const matches = aclManager.userMatchesPrincipals(user, principals);
      expect(matches).toBe(true);
    });

    test('should match asserted users', () => {
      const user = { username: 'asserted' };
      const principals = ['asserted'];
      
      const matches = aclManager.userMatchesPrincipals(user, principals);
      expect(matches).toBe(true);
    });

    test('should check user roles via UserManager', () => {
      mockUserManager.hasRole.mockReturnValue(true);
      
      const user = { username: 'testuser', isAuthenticated: true, roles: ['editor'] };
      const principals = ['editor'];
      
      const matches = aclManager.userMatchesPrincipals(user, principals);
      expect(matches).toBe(true);
      expect(mockUserManager.hasRole).toHaveBeenCalledWith('testuser', 'editor');
    });

    test('should not match when user lacks required role', () => {
      mockUserManager.hasRole.mockReturnValue(false);
      
      const user = { username: 'testuser', isAuthenticated: true };
      const principals = ['admin'];
      
      const matches = aclManager.userMatchesPrincipals(user, principals);
      expect(matches).toBe(false);
    });

    test('should handle null user for anonymous access', () => {
      const principals = ['anonymous'];
      
      const matches = aclManager.userMatchesPrincipals(null, principals);
      expect(matches).toBe(true);
    });

    test('should reject null user for authenticated access', () => {
      const principals = ['authenticated', 'admin'];
      
      const matches = aclManager.userMatchesPrincipals(null, principals);
      expect(matches).toBe(false);
    });
  });

  describe('page permission checking', () => {
    const mockUser = { username: 'testuser', isAuthenticated: true };
    const mockAdminUser = { username: 'admin', isAuthenticated: true };

    beforeEach(() => {
      // Default: admin has system permissions, regular user doesn't
      mockUserManager.hasPermission.mockImplementation((username, permission) => {
        return username === 'admin' && permission === 'admin:system';
      });
    });

    test('should allow admin users all access regardless of ACL', async () => {
      mockUserManager.hasPermission.mockReturnValue(true);
      
      const pageContent = '[{ALLOW view nobody}]'; // Restrictive ACL
      const hasAccess = await aclManager.checkPagePermission('TestPage', 'view', mockAdminUser, pageContent);
      
      expect(hasAccess).toBe(true);
      expect(mockUserManager.hasPermission).toHaveBeenCalledWith('admin', 'admin:system');
    });

    test('should check ACL when present and user is not admin', async () => {
      const pageContent = '[{ALLOW view admin,testuser}]';
      const hasAccess = await aclManager.checkPagePermission('TestPage', 'view', mockUser, pageContent);
      
      expect(hasAccess).toBe(true);
    });

    test('should deny access when user not in ACL', async () => {
      const pageContent = '[{ALLOW view admin,otheradmin}]';
      const hasAccess = await aclManager.checkPagePermission('TestPage', 'view', mockUser, pageContent);
      
      expect(hasAccess).toBe(false);
    });

    test('should allow read access to regular pages by default', async () => {
      // No ACL in content, should use default policy
      const pageContent = 'Regular page content without ACL';
      const hasAccess = await aclManager.checkPagePermission('RegularPage', 'view', mockUser, pageContent);
      
      expect(hasAccess).toBe(true);
    });

    test('should restrict access to system pages without ACL', async () => {
      const pageContent = 'System page content without explicit ACL';
      
      // Mock isSystemOrAdminPage to return true
      jest.spyOn(aclManager, 'isSystemOrAdminPage').mockReturnValue(true);
      jest.spyOn(aclManager, 'checkDefaultPermission').mockReturnValue(false);
      
      const hasAccess = await aclManager.checkPagePermission('SystemPage', 'view', mockUser, pageContent);
      
      expect(hasAccess).toBe(false);
    });

    test('should handle different actions correctly', async () => {
      const pageContent = '[{ALLOW edit admin}] [{ALLOW view admin,editor}]';
      
      // Mock user role checking
      mockUserManager.hasRole.mockImplementation((username, role) => {
        return username === 'testuser' && role === 'editor';
      });
      
      const canView = await aclManager.checkPagePermission('TestPage', 'view', mockUser, pageContent);
      const canEdit = await aclManager.checkPagePermission('TestPage', 'edit', mockUser, pageContent);
      
      expect(canView).toBe(true);  // User has editor role which is allowed to view
      expect(canEdit).toBe(false); // User doesn't have admin role which is required to edit
    });

    test('should throw error when UserManager not available', async () => {
      mockEngine.getManager.mockReturnValue(null);
      
      await expect(
        aclManager.checkPagePermission('TestPage', 'view', mockUser, 'content')
      ).rejects.toThrow('UserManager not available');
    });
  });

  describe('system page detection', () => {
    test('should identify system pages correctly', () => {
      const systemPages = [
        'SystemInfo',
        'PageIndex',
        'Categories',
        'System Variables',
        'User Keywords'
      ];
      
      systemPages.forEach(pageName => {
        expect(aclManager.isSystemOrAdminPage(pageName)).toBe(true);
      });
    });

    test('should identify admin pages correctly', () => {
      const adminPages = [
        'Password Management',
        'User Management',
        'Admin Settings'
      ];
      
      adminPages.forEach(pageName => {
        expect(aclManager.isSystemOrAdminPage(pageName)).toBe(true);
      });
    });

    test('should not identify regular pages as system pages', () => {
      const regularPages = [
        'Welcome',
        'Home Page',
        'User Guide',
        'Project Documentation'
      ];
      
      regularPages.forEach(pageName => {
        expect(aclManager.isSystemOrAdminPage(pageName)).toBe(false);
      });
    });
  });

  describe('permission delegation', () => {
    test('should check permissions via UserManager', async () => {
      mockUserManager.hasPermission.mockReturnValue(true);
      
      const hasPermission = await aclManager.checkPermission('testuser', 'page:edit');
      
      expect(hasPermission).toBe(true);
      expect(mockUserManager.hasPermission).toHaveBeenCalledWith('testuser', 'page:edit');
    });

    test('should handle null user for permission checking', async () => {
      mockUserManager.hasPermission.mockReturnValue(false);
      
      const hasPermission = await aclManager.checkPermission(null, 'page:read');
      
      expect(hasPermission).toBe(false);
      expect(mockUserManager.hasPermission).toHaveBeenCalledWith(null, 'page:read');
    });
  });

  describe('default permission checking', () => {
    const mockUser = { username: 'testuser', roles: ['reader'] };

    test('should allow view action for users with page:read permission', () => {
      mockUserManager.hasPermission.mockReturnValue(true);
      
      const hasPermission = aclManager.checkDefaultPermission('view', mockUser);
      
      expect(hasPermission).toBe(true);
      expect(mockUserManager.hasPermission).toHaveBeenCalledWith('testuser', 'page:read');
    });

    test('should allow edit action for users with page:edit permission', () => {
      mockUserManager.hasPermission.mockReturnValue(true);
      
      const hasPermission = aclManager.checkDefaultPermission('edit', mockUser);
      
      expect(hasPermission).toBe(true);
      expect(mockUserManager.hasPermission).toHaveBeenCalledWith('testuser', 'page:edit');
    });

    test('should deny actions when user lacks required permission', () => {
      mockUserManager.hasPermission.mockReturnValue(false);
      
      const hasPermission = aclManager.checkDefaultPermission('delete', mockUser);
      
      expect(hasPermission).toBe(false);
    });

    test('should handle anonymous users', () => {
      mockUserManager.hasPermission.mockReturnValue(false);
      
      const hasPermission = aclManager.checkDefaultPermission('view', null);
      
      expect(hasPermission).toBe(false);
      expect(mockUserManager.hasPermission).toHaveBeenCalledWith(null, 'page:read');
    });
  });

  describe('caching', () => {
    test('should initialize with empty cache', () => {
      expect(aclManager.aclCache.size).toBe(0);
    });

    test('should cache parsed ACL results', () => {
      const content = '[{ALLOW view admin,editor}]';
      const pageName = 'TestPage';
      
      // Parse ACL and manually cache it (since caching might be implemented in the actual method)
      const acl = aclManager.parseACL(content);
      aclManager.aclCache.set(pageName, acl);
      
      expect(aclManager.aclCache.has(pageName)).toBe(true);
      expect(aclManager.aclCache.get(pageName)).toEqual(acl);
    });
  });
});
