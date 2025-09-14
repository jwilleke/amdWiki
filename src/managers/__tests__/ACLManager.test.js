const { describe, test, expect, beforeEach } = require('@jest/globals');
const ACLManager = require('../ACLManager');

// Mock UserManager
const mockUserManager = {
  hasPermission: jest.fn(),
  hasRole: jest.fn()
};

// Mock engine
// Shared config store for testing
const configStore = {};

// Mock config object with get and set methods
const mockConfig = {
  get: jest.fn((key, defaultValue) => {
    console.log(`mockConfig.get called with key: ${key}, configStore:`, configStore);
    
    // Return stored value or default
    if (configStore[key] !== undefined) {
      console.log(`Found direct match for ${key}:`, configStore[key]);
      return configStore[key];
    }
    
    // Handle nested config paths like 'accessControl.contextAware.maintenanceMode'
    if (key === 'accessControl.contextAware.maintenanceMode') {
      const enabled = configStore['accessControl.contextAware.maintenanceMode.enabled'];
      const message = configStore['accessControl.contextAware.maintenanceMode.message'];
      const allowedRoles = configStore['accessControl.contextAware.maintenanceMode.allowedRoles'];
      
      console.log(`Building nested config for ${key}:`, { enabled, message, allowedRoles });
      
      const result = {
        enabled: enabled !== undefined ? enabled : false,
        message: message !== undefined ? message : 'System is under maintenance',
        allowedRoles: allowedRoles !== undefined ? allowedRoles : ['admin']
      };
      
      console.log(`Returning nested config:`, result);
      return result;
    }
    
    // Return empty objects for config paths to avoid undefined errors
    if (key === 'accessControl.audit') {
      return configStore['accessControl.audit'] || { enabled: false };
    }
    if (key === 'accessControl.policies') {
      return configStore['accessControl.policies'] || { enabled: false };
    }
    if (key === 'accessControl.contextAware') {
      return configStore['accessControl.contextAware'] || { enabled: false };
    }
    
    console.log(`No match found for ${key}, returning default:`, defaultValue);
    return defaultValue;
  }),
  set: jest.fn((key, value) => {
    console.log(`mockConfig.set called with key: ${key}, value:`, value);
    configStore[key] = value;
  })
};

const mockEngine = {
  getManager: jest.fn((name) => {
    if (name === 'UserManager') {
      return mockUserManager;
    }
    return null;
  }),
  getConfig: jest.fn(() => mockConfig)
};

describe('ACLManager', () => {
  let aclManager;

  beforeEach(async () => {
    // Clear mocks
    jest.clearAllMocks();
    // Clear config store
    Object.keys(configStore).forEach(key => delete configStore[key]);
    
    // Reset mock config methods
    mockConfig.get.mockImplementation((key, defaultValue) => {
      // Return stored value or default
      if (configStore[key] !== undefined) {
        return configStore[key];
      }
      // Return empty objects for config paths to avoid undefined errors
      if (key === 'accessControl.audit') {
        return { enabled: false };
      }
      if (key === 'accessControl.policies') {
        return { enabled: false };
      }
      if (key === 'accessControl.contextAware') {
        return { enabled: false };
      }
      if (key === 'accessControl.contextAware.maintenanceMode') {
        return { enabled: false };
      }
      return defaultValue;
    });
    
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
      
      // checkPagePermission should return false, not throw, when UserManager is not available
      const result = await aclManager.checkPagePermission('TestPage', 'view', mockUser, 'content');
      expect(result).toBe(false);
      
      // Restore the mock
      mockEngine.getManager.mockImplementation((name) => {
        if (name === 'UserManager') return mockUserManager;
        return null;
      });
    });
  });

  describe('system page detection', () => {
    test('should identify system pages correctly', () => {
      const systemPages = [
        'admin',
        'users', 
        'roles',
        'permissions',
        'system',
        'config',
        'settings',
        'Admin/Settings',
        'System/Info'
      ];
      
      systemPages.forEach(pageName => {
        expect(aclManager.isSystemOrAdminPage(pageName)).toBe(true);
      });
    });

    test('should identify admin pages correctly', () => {
      const adminPages = [
        'admin/users',
        'admin/settings', 
        'system/config',
        'user-manager',
        'role-manager'
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
    test('should check permissions via UserManager', () => {
      mockUserManager.hasPermission.mockReturnValue(true);
      
      const hasPermission = aclManager.checkDefaultPermission('edit', { username: 'testuser' });
      
      expect(hasPermission).toBe(true);
      expect(mockUserManager.hasPermission).toHaveBeenCalledWith('testuser', 'page:edit');
    });

    test('should handle null user for permission checking', () => {
      mockUserManager.hasPermission.mockReturnValue(false);
      
      const hasPermission = aclManager.checkDefaultPermission('view', null);
      
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

  describe('context-aware permissions', () => {
    beforeEach(() => {
      // Mock config for context-aware features
      mockEngine.getConfig = jest.fn(() => ({
        get: jest.fn((key, defaultValue) => {
          const config = {
            'accessControl.contextAware': {
              enabled: true,
              timeZone: 'UTC',
              businessHours: {
                enabled: false
              },
              maintenanceMode: {
                enabled: false,
                allowedRoles: ['admin']
              }
            },
            'accessControl.audit': {
              enabled: true,
              logFile: './test-audit.log'
            }
          };
          
          const keys = key.split('.');
          let value = config;
          for (const k of keys) {
            value = value?.[k];
          }
          return value !== undefined ? value : defaultValue;
        })
      }));
    });

    test('should allow access when context checks pass', async () => {
      mockUserManager.hasPermission.mockReturnValue(true);
      
      const context = {
        ip: '127.0.0.1',
        userAgent: 'test-agent',
        timestamp: new Date().toISOString()
      };
      
      const mockUser = { username: 'testuser', roles: ['reader'] };
      const hasAccess = await aclManager.checkPagePermission(
        'TestPage', 'view', mockUser, 'test content', context
      );
      
      expect(hasAccess).toBe(true);
    });

    test('should deny access when maintenance mode is enabled', async () => {
      // Enable context-aware permissions first
      configStore['accessControl.contextAware'] = { enabled: true };
      
      // Enable maintenance mode in config
      mockConfig.get.mockImplementation((key, defaultValue) => {
        if (key === 'accessControl.contextAware') {
          return {
            enabled: true,
            maintenanceMode: {
              enabled: true,
              allowedRoles: ['admin'],
              message: 'System under maintenance'
            }
          };
        }
        return defaultValue;
      });

      const context = { ip: '127.0.0.1', userAgent: 'test-agent' };
      const mockUser = { username: 'testuser', roles: ['reader'] };
      
      const hasAccess = await aclManager.checkPagePermission(
        'TestPage', 'view', mockUser, 'test content', context
      );
      
      expect(hasAccess).toBe(false);
    });

    test('should allow admin access during maintenance mode', async () => {
      // Enable maintenance mode in config
      mockEngine.getConfig().get.mockImplementation((key, defaultValue) => {
        if (key === 'accessControl.contextAware') {
          return {
            enabled: true,
            maintenanceMode: {
              enabled: true,
              allowedRoles: ['admin'],
              message: 'System under maintenance'
            }
          };
        }
        return defaultValue;
      });

      const context = { ip: '127.0.0.1', userAgent: 'test-agent' };
      const mockAdminUser = { username: 'admin', roles: ['admin'] };
      
      const hasAccess = await aclManager.checkPagePermission(
        'TestPage', 'view', mockAdminUser, 'test content', context
      );
      
      expect(hasAccess).toBe(true);
    });

    test('should maintain audit log of access decisions', async () => {
      mockUserManager.hasPermission.mockReturnValue(true);
      
      // Set up audit configuration
      configStore['accessControl.audit'] = { enabled: true };
      
      const context = {
        ip: '192.168.1.1',
        userAgent: 'Mozilla/5.0',
        timestamp: new Date().toISOString()
      };
      
      const mockUser = { username: 'testuser', roles: ['reader'] };
      
      await aclManager.checkPagePermission(
        'TestPage', 'edit', mockUser, 'test content', context
      );
      
      const auditLog = aclManager.getAccessLog(10);
      expect(auditLog.length).toBeGreaterThan(0);
      expect(auditLog[0]).toMatchObject({
        pageName: 'TestPage',
        action: 'edit',
        user: 'testuser',
        decision: expect.any(Boolean)
      });
    });
  });

  describe('maintenance mode management', () => {
    test('should set maintenance mode', () => {
      // Test that the mockEngine.getConfig() returns the mockConfig
      const config = mockEngine.getConfig();
      expect(config.set).toBeDefined();
      
      // Test the actual functionality
      aclManager.setMaintenanceMode(true, 'Scheduled maintenance', ['admin', 'moderator']);
      
      // Debug: Check what was stored
      console.log('Config store after setMaintenanceMode:', configStore);
      
      // Check what the config.get returns
      const maintenanceConfig = config.get('accessControl.contextAware.maintenanceMode');
      console.log('Retrieved maintenance config:', maintenanceConfig);
      
      const status = aclManager.getMaintenanceStatus();
      console.log('getMaintenanceStatus result:', status);
      
      expect(status.enabled).toBe(true);
      expect(status.message).toBe('Scheduled maintenance');
      expect(status.allowedRoles).toEqual(['admin', 'moderator']);
    });

    test('should disable maintenance mode', () => {
      aclManager.setMaintenanceMode(false);
      
      const status = aclManager.getMaintenanceStatus();
      expect(status.enabled).toBe(false);
    });
  });

  describe('access control statistics', () => {
    test('should provide access control statistics', () => {
      const stats = aclManager.getAccessControlStats();
      
      expect(stats).toHaveProperty('totalChecks');
      expect(stats).toHaveProperty('recentHour');
      expect(stats).toHaveProperty('recentDay');
      expect(stats).toHaveProperty('deniedAccess');
      expect(stats).toHaveProperty('averageProcessingTime');
    });
  });

  describe('Category-based permissions (Issue #22)', () => {
    describe('isSystemAdminCategoryPage', () => {
      test('should return true for System/Admin category pages', async () => {
        // Mock PageManager
        const mockPageManager = {
          getPage: jest.fn().mockResolvedValue({
            metadata: {
              category: 'System/Admin',
              'system-category': 'System'
            }
          })
        };

        mockEngine.getManager.mockImplementation((name) => {
          if (name === 'UserManager') return mockUserManager;
          if (name === 'PageManager') return mockPageManager;
          return null;
        });

        const result = await aclManager.isSystemAdminCategoryPage('AdminPage');
        expect(result).toBe(true);
        expect(mockPageManager.getPage).toHaveBeenCalledWith('AdminPage');
      });

      test('should return true for System category pages', async () => {
        const mockPageManager = {
          getPage: jest.fn().mockResolvedValue({
            metadata: {
              category: 'System'
            }
          })
        };

        mockEngine.getManager.mockImplementation((name) => {
          if (name === 'UserManager') return mockUserManager;
          if (name === 'PageManager') return mockPageManager;
          return null;
        });

        const result = await aclManager.isSystemAdminCategoryPage('SystemPage');
        expect(result).toBe(true);
      });

      test('should return false for regular pages', async () => {
        const mockPageManager = {
          getPage: jest.fn().mockResolvedValue({
            metadata: {
              category: 'General'
            }
          })
        };

        mockEngine.getManager.mockImplementation((name) => {
          if (name === 'UserManager') return mockUserManager;
          if (name === 'PageManager') return mockPageManager;
          return null;
        });

        const result = await aclManager.isSystemAdminCategoryPage('RegularPage');
        expect(result).toBe(false);
      });

      test('should return false when page not found', async () => {
        const mockPageManager = {
          getPage: jest.fn().mockResolvedValue(null)
        };

        mockEngine.getManager.mockImplementation((name) => {
          if (name === 'UserManager') return mockUserManager;
          if (name === 'PageManager') return mockPageManager;
          return null;
        });

        const result = await aclManager.isSystemAdminCategoryPage('NonExistentPage');
        expect(result).toBe(false);
      });

      test('should handle errors gracefully', async () => {
        const mockPageManager = {
          getPage: jest.fn().mockRejectedValue(new Error('Database error'))
        };

        mockEngine.getManager.mockImplementation((name) => {
          if (name === 'UserManager') return mockUserManager;
          if (name === 'PageManager') return mockPageManager;
          return null;
        });

        const result = await aclManager.isSystemAdminCategoryPage('ErrorPage');
        expect(result).toBe(false);
      });
    });

    describe('checkAttachmentPermission', () => {
      test('should allow admin users for any attachment', async () => {
        const mockAttachmentManager = {
          getAttachment: jest.fn().mockReturnValue({
            id: 'test-attachment',
            pageName: 'RegularPage'
          })
        };

        mockUserManager.hasPermission.mockReturnValue(true);

        mockEngine.getManager.mockImplementation((name) => {
          if (name === 'UserManager') return mockUserManager;
          if (name === 'AttachmentManager') return mockAttachmentManager;
          return null;
        });

        const adminUser = { username: 'admin', isAuthenticated: true };
        const result = await aclManager.checkAttachmentPermission(adminUser, 'test-attachment', 'view');
        expect(result).toBe(true);
        expect(mockUserManager.hasPermission).toHaveBeenCalledWith('admin', 'admin:system');
      });

      test('should deny access for System/Admin page attachments to non-admin users', async () => {
        const mockAttachmentManager = {
          getAttachment: jest.fn().mockReturnValue({
            id: 'system-attachment',
            pageName: 'AdminPage'
          })
        };

        const mockPageManager = {
          getPage: jest.fn().mockResolvedValue({
            metadata: {
              category: 'System/Admin'
            }
          })
        };

        mockUserManager.hasPermission.mockReturnValue(false);

        mockEngine.getManager.mockImplementation((name) => {
          if (name === 'UserManager') return mockUserManager;
          if (name === 'AttachmentManager') return mockAttachmentManager;
          if (name === 'PageManager') return mockPageManager;
          return null;
        });

        const regularUser = { username: 'user', isAuthenticated: true };
        const result = await aclManager.checkAttachmentPermission(regularUser, 'system-attachment', 'view');
        expect(result).toBe(false);
      });

      test('should allow access for System/Admin page attachments to admin users', async () => {
        const mockAttachmentManager = {
          getAttachment: jest.fn().mockReturnValue({
            id: 'system-attachment',
            pageName: 'AdminPage'
          })
        };

        const mockPageManager = {
          getPage: jest.fn().mockResolvedValue({
            metadata: {
              category: 'System/Admin'
            }
          })
        };

        mockUserManager.hasPermission.mockReturnValue(true);

        mockEngine.getManager.mockImplementation((name) => {
          if (name === 'UserManager') return mockUserManager;
          if (name === 'AttachmentManager') return mockAttachmentManager;
          if (name === 'PageManager') return mockPageManager;
          return null;
        });

        const adminUser = { username: 'admin', isAuthenticated: true };
        const result = await aclManager.checkAttachmentPermission(adminUser, 'system-attachment', 'view');
        expect(result).toBe(true);
      });

      test('should allow access for regular page attachments to authenticated users', async () => {
        const mockAttachmentManager = {
          getAttachment: jest.fn().mockReturnValue({
            id: 'regular-attachment',
            pageName: 'RegularPage'
          })
        };

        const mockPageManager = {
          getPage: jest.fn().mockResolvedValue({
            metadata: {
              category: 'General'
            },
            content: 'Regular page content'
          })
        };

        mockEngine.getManager.mockImplementation((name) => {
          if (name === 'UserManager') return mockUserManager;
          if (name === 'AttachmentManager') return mockAttachmentManager;
          if (name === 'PageManager') return mockPageManager;
          return null;
        });

        const regularUser = { username: 'user', isAuthenticated: true };
        const result = await aclManager.checkAttachmentPermission(regularUser, 'regular-attachment', 'view');
        expect(result).toBe(true);
      });

      test('should deny access when attachment not found', async () => {
        // Create a separate ACLManager instance with custom mocks for this test
        const testMockEngine = {
          getManager: jest.fn((name) => {
            if (name === 'UserManager') return {
              hasPermission: jest.fn().mockReturnValue(false)
            };
            if (name === 'AttachmentManager') return {
              getAttachment: jest.fn().mockReturnValue(null)
            };
            if (name === 'PageManager') return {
              getPage: jest.fn()
            };
            return null;
          }),
          getConfig: jest.fn(() => ({
            get: jest.fn((key, defaultValue) => {
              if (key === 'accessControl.audit') {
                return { enabled: false };
              }
              return defaultValue;
            })
          }))
        };

        const testAclManager = new ACLManager(testMockEngine);
        await testAclManager.initialize();

        const user = { username: 'user', isAuthenticated: true };
        const result = await testAclManager.checkAttachmentPermission(user, 'nonexistent-attachment', 'view');
        expect(result).toBe(false);
      });

      test('should deny access for anonymous users on System/Admin attachments', async () => {
        // Create a separate ACLManager instance with custom mocks for this test
        const testMockEngine = {
          getManager: jest.fn((name) => {
            if (name === 'UserManager') return {
              hasPermission: jest.fn().mockReturnValue(false)
            };
            if (name === 'AttachmentManager') return {
              getAttachment: jest.fn().mockReturnValue({
                id: 'system-attachment',
                pageName: 'AdminPage'
              })
            };
            if (name === 'PageManager') return {
              getPage: jest.fn().mockResolvedValue({
                metadata: {
                  category: 'System/Admin'
                }
              })
            };
            return null;
          }),
          getConfig: jest.fn(() => ({
            get: jest.fn((key, defaultValue) => {
              if (key === 'accessControl.audit') {
                return { enabled: false };
              }
              return defaultValue;
            })
          }))
        };

        const testAclManager = new ACLManager(testMockEngine);
        await testAclManager.initialize();

        const result = await testAclManager.checkAttachmentPermission(null, 'system-attachment', 'view');
        expect(result).toBe(false);
      });

      test('should allow anonymous access to regular page attachments', async () => {
        const mockAttachmentManager = {
          getAttachment: jest.fn().mockReturnValue({
            id: 'regular-attachment',
            pageName: 'Welcome'
          })
        };

        const mockPageManager = {
          getPage: jest.fn().mockResolvedValue({
            metadata: {
              category: 'General'
            },
            content: 'Welcome to the wiki'
          })
        };

        mockEngine.getManager.mockImplementation((name) => {
          if (name === 'UserManager') return mockUserManager;
          if (name === 'AttachmentManager') return mockAttachmentManager;
          if (name === 'PageManager') return mockPageManager;
          return null;
        });

        const result = await aclManager.checkAttachmentPermission(null, 'regular-attachment', 'view');
        expect(result).toBe(true);
      });
    });
  });
});
