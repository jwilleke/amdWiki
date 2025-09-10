/**
 * Unit tests for SchemaGenerator DigitalDocumentPermission functionality
 */

const SchemaGenerator = require('../SchemaGenerator');

describe('SchemaGenerator DigitalDocumentPermission', () => {
  let mockEngine;
  let mockUserManager;
  let mockACLManager;
  
  beforeEach(() => {
    mockUserManager = {
      getRole: jest.fn(),
      hasPermission: jest.fn(),
      getUserPermissions: jest.fn()
    };
    
    mockACLManager = {
      parseACL: jest.fn(),
      checkPagePermission: jest.fn()
    };
    
    mockEngine = {
      getManager: jest.fn((name) => {
        if (name === 'UserManager') return mockUserManager;
        if (name === 'ACLManager') return mockACLManager;
        return null;
      })
    };
  });
  
  describe('generateDigitalDocumentPermissions', () => {
    test('returns empty array when engine not provided', () => {
      const pageData = {
        title: 'Test Page',
        category: 'General',
        content: 'Regular page content'
      };
      
      const options = {}; // No engine
      const permissions = SchemaGenerator.generateDigitalDocumentPermissions(pageData, null, options);
      
      expect(permissions).toEqual([]);
    });
    
    test('returns empty array when managers not available', () => {
      const pageData = {
        title: 'Test Page',
        category: 'General',
        content: 'Regular page content'
      };
      
      const mockEngineNoManagers = {
        getManager: jest.fn(() => null)
      };
      
      const options = { engine: mockEngineNoManagers };
      const permissions = SchemaGenerator.generateDigitalDocumentPermissions(pageData, null, options);
      
      expect(permissions).toEqual([]);
    });
    
    test('generates basic permissions for General category pages', () => {
      const pageData = {
        title: 'Test Page',
        category: 'General',
        content: 'Regular page content'
      };
      
      const options = { engine: mockEngine };
      mockACLManager.parseACL.mockReturnValue(null);
      
      const permissions = SchemaGenerator.generateDigitalDocumentPermissions(pageData, null, options);
      
      expect(permissions).toHaveLength(6);
      
      // Verify ReadPermission for public
      expect(permissions[0]).toEqual({
        "@type": "DigitalDocumentPermission",
        "permissionType": "ReadPermission",
        "grantee": {
          "@type": "Audience",
          "audienceType": "public"
        }
      });
      
      // Verify WritePermission for editors
      expect(permissions[1]).toEqual({
        "@type": "DigitalDocumentPermission",
        "permissionType": "WritePermission",
        "grantee": {
          "@type": "Audience",
          "audienceType": "editor"
        }
      });
      
      // Verify DeletePermission for admin
      expect(permissions[3]).toEqual({
        "@type": "DigitalDocumentPermission",
        "permissionType": "DeletePermission",
        "grantee": {
          "@type": "Person",
          "name": "admin"
        }
      });
    });
    
    test('generates admin-only permissions for System category pages', () => {
      const pageData = {
        title: 'System Configuration',
        category: 'System',
        isProtected: true,
        content: 'System content'
      };
      
      const options = { engine: mockEngine };
      mockACLManager.parseACL.mockReturnValue(null);
      
      const permissions = SchemaGenerator.generateDigitalDocumentPermissions(pageData, null, options);
      
      expect(permissions).toHaveLength(2);
      
      // Verify ReadPermission for public
      expect(permissions[0]).toEqual({
        "@type": "DigitalDocumentPermission",
        "permissionType": "ReadPermission",
        "grantee": {
          "@type": "Audience",
          "audienceType": "public"
        }
      });
      
      // Verify AdministerPermission for admin
      expect(permissions[1]).toEqual({
        "@type": "DigitalDocumentPermission",
        "permissionType": "AdministerPermission",
        "grantee": {
          "@type": "Person",
          "name": "admin"
        }
      });
    });
    
    test('generates appropriate permissions for Documentation category', () => {
      const pageData = {
        title: 'User Guide',
        category: 'Documentation',
        content: 'Documentation content'
      };
      
      const options = { engine: mockEngine };
      mockACLManager.parseACL.mockReturnValue(null);
      
      const permissions = SchemaGenerator.generateDigitalDocumentPermissions(pageData, null, options);
      
      expect(permissions).toHaveLength(3);
      expect(permissions[0].permissionType).toBe('ReadPermission');
      expect(permissions[1].permissionType).toBe('WritePermission');
      expect(permissions[2].permissionType).toBe('CommentPermission');
    });
    
    test('generates developer-specific permissions for Developer category', () => {
      const pageData = {
        title: 'API Documentation',
        category: 'Developer',
        content: 'Developer documentation'
      };
      
      const options = { engine: mockEngine };
      mockACLManager.parseACL.mockReturnValue(null);
      
      const permissions = SchemaGenerator.generateDigitalDocumentPermissions(pageData, null, options);
      
      expect(permissions).toHaveLength(3);
      expect(permissions[0].permissionType).toBe('ReadPermission');
      expect(permissions[1].permissionType).toBe('WritePermission');
      expect(permissions[1].grantee.audienceType).toBe('developer');
      expect(permissions[2].permissionType).toBe('CreatePermission');
      expect(permissions[2].grantee.audienceType).toBe('developer');
    });
    
    test('generates ACL-based permissions when page has ACL', () => {
      const pageData = {
        title: 'Protected Page',
        category: 'General',
        content: '[{ALLOW edit admin,editor}] Page content'
      };
      
      const mockACL = {
        edit: ['admin', 'editor']
      };
      
      const options = { engine: mockEngine };
      mockACLManager.parseACL.mockReturnValue(mockACL);
      mockUserManager.getRole.mockImplementation((roleName) => {
        if (roleName === 'admin' || roleName === 'editor') {
          return { name: roleName, permissions: ['page:edit'] };
        }
        return null;
      });
      
      const permissions = SchemaGenerator.generateDigitalDocumentPermissions(pageData, null, options);
      
      expect(permissions).toHaveLength(2);
      expect(permissions[0].permissionType).toBe('WritePermission');
      expect(permissions[0].grantee.audienceType).toBe('admin');
      expect(permissions[1].permissionType).toBe('WritePermission');
      expect(permissions[1].grantee.audienceType).toBe('editor');
    });
  });
  
  describe('mapPrincipalToGrantee', () => {
    test('maps special principals correctly', () => {
      expect(SchemaGenerator.mapPrincipalToGrantee('all', mockUserManager)).toEqual({
        "@type": "Audience",
        "audienceType": "public"
      });
      
      expect(SchemaGenerator.mapPrincipalToGrantee('anonymous', mockUserManager)).toEqual({
        "@type": "Audience", 
        "audienceType": "anonymous"
      });
      
      expect(SchemaGenerator.mapPrincipalToGrantee('authenticated', mockUserManager)).toEqual({
        "@type": "Audience",
        "audienceType": "authenticated"
      });
      
      expect(SchemaGenerator.mapPrincipalToGrantee('asserted', mockUserManager)).toEqual({
        "@type": "Audience",
        "audienceType": "asserted"
      });
    });
    
    test('maps roles to audience types', () => {
      mockUserManager.getRole.mockReturnValue({ name: 'editor', permissions: ['page:edit'] });
      
      expect(SchemaGenerator.mapPrincipalToGrantee('editor', mockUserManager)).toEqual({
        "@type": "Audience",
        "audienceType": "editor"
      });
    });
    
    test('maps usernames to person objects', () => {
      mockUserManager.getRole.mockReturnValue(null);
      
      expect(SchemaGenerator.mapPrincipalToGrantee('john.doe', mockUserManager)).toEqual({
        "@type": "Person",
        "name": "john.doe"
      });
    });
    
    test('handles case insensitive principals', () => {
      expect(SchemaGenerator.mapPrincipalToGrantee('ALL', mockUserManager)).toEqual({
        "@type": "Audience",
        "audienceType": "public"
      });
      
      expect(SchemaGenerator.mapPrincipalToGrantee('Anonymous', mockUserManager)).toEqual({
        "@type": "Audience", 
        "audienceType": "anonymous"
      });
    });
  });
  
  describe('generateACLBasedPermissions', () => {
    beforeEach(() => {
      mockUserManager.getRole.mockImplementation((roleName) => {
        const roles = {
          'admin': { name: 'admin', permissions: ['admin:system'] },
          'editor': { name: 'editor', permissions: ['page:edit'] },
          'reader': { name: 'reader', permissions: ['page:read'] }
        };
        return roles[roleName] || null;
      });
    });
    
    test('generates permissions for multiple ACL actions', () => {
      const pageACL = {
        view: ['all'],
        edit: ['editor', 'admin'],
        delete: ['admin'],
        upload: ['editor']
      };
      
      const permissions = SchemaGenerator.generateACLBasedPermissions(pageACL, mockUserManager, {});
      
      expect(permissions).toHaveLength(5);
      
      // Check ReadPermission
      const readPerm = permissions.find(p => p.permissionType === 'ReadPermission');
      expect(readPerm.grantee.audienceType).toBe('public');
      
      // Check WritePermission
      const writePerms = permissions.filter(p => p.permissionType === 'WritePermission');
      expect(writePerms).toHaveLength(2);
      
      // Check DeletePermission
      const deletePerm = permissions.find(p => p.permissionType === 'DeletePermission');
      expect(deletePerm.grantee.audienceType).toBe('admin');
    });
    
    test('skips invalid or empty ACL entries', () => {
      const pageACL = {
        view: ['all'],
        edit: [], // Empty principals
        invalid: ['admin'], // Invalid action
        delete: ['admin']
      };
      
      const permissions = SchemaGenerator.generateACLBasedPermissions(pageACL, mockUserManager, {});
      
      expect(permissions).toHaveLength(2); // Only view and delete
      expect(permissions[0].permissionType).toBe('ReadPermission');
      expect(permissions[1].permissionType).toBe('DeletePermission');
    });
  });
  
  describe('generatePageSchema integration', () => {
    test('includes DigitalDocumentPermission when engine provided', () => {
      const pageData = {
        title: 'Test Page',
        category: 'General',
        content: 'Page content',
        lastModified: '2025-09-10T10:00:00.000Z'
      };
      
      const options = {
        baseUrl: 'http://localhost:3000',
        engine: mockEngine,
        user: null
      };
      
      mockACLManager.parseACL.mockReturnValue(null);
      
      const schema = SchemaGenerator.generatePageSchema(pageData, options);
      
      expect(schema.hasDigitalDocumentPermission).toBeDefined();
      expect(schema.hasDigitalDocumentPermission).toHaveLength(6);
      expect(schema['@type']).toBe('WebPage');
      expect(schema['@context']).toBe('https://schema.org');
    });
    
    test('excludes DigitalDocumentPermission when engine not provided', () => {
      const pageData = {
        title: 'Test Page',
        category: 'General',
        content: 'Page content',
        lastModified: '2025-09-10T10:00:00.000Z'
      };
      
      const options = {
        baseUrl: 'http://localhost:3000'
        // No engine provided
      };
      
      const schema = SchemaGenerator.generatePageSchema(pageData, options);
      
      expect(schema.hasDigitalDocumentPermission).toBeUndefined();
      expect(schema['@type']).toBe('WebPage');
      expect(schema['@context']).toBe('https://schema.org');
    });
    
    test('validates Schema.org structure for permissions', () => {
      const pageData = {
        title: 'Sample Page', // Changed from "API Documentation" to avoid TechArticle type
        category: 'Developer',
        content: 'Developer content',
        lastModified: '2025-09-10T10:00:00.000Z'
      };
      
      const options = {
        baseUrl: 'http://localhost:3000',
        engine: mockEngine,
        user: null
      };
      
      mockACLManager.parseACL.mockReturnValue(null);
      
      const schema = SchemaGenerator.generatePageSchema(pageData, options);
      
      // Validate required Schema.org WebPage properties
      expect(schema['@context']).toBe('https://schema.org');
      expect(schema['@type']).toBe('WebPage'); // Should be WebPage for non-documentation titles
      expect(schema.name).toBe('Sample Page');
      expect(schema.hasDigitalDocumentPermission).toBeDefined();
      
      // Validate DigitalDocumentPermission structure
      schema.hasDigitalDocumentPermission.forEach(permission => {
        expect(permission['@type']).toBe('DigitalDocumentPermission');
        expect(permission.permissionType).toMatch(/Permission$/);
        expect(permission.grantee).toBeDefined();
        expect(permission.grantee['@type']).toMatch(/^(Person|Audience)$/);
        
        if (permission.grantee['@type'] === 'Audience') {
          expect(permission.grantee.audienceType).toBeDefined();
        } else if (permission.grantee['@type'] === 'Person') {
          expect(permission.grantee.name).toBeDefined();
        }
      });
    });
  });
});
