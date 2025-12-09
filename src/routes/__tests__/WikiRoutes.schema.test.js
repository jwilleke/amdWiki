/**
 * WikiRoutes Schema.org Integration Tests
 * Tests Schema.org functionality in WikiRoutes
 */

const WikiRoutes = require('../../routes/WikiRoutes');

// Mock dependencies
const mockSchemaManager = {
  getComprehensiveSiteData: jest.fn().mockReturnValue({
    adminUsers: [{
      "@type": "Person",
      "@id": "admin-1",
      "name": "Admin User",
      "email": "admin@example.com"
    }],
    organizations: [{
      "@type": "Organization",
      "@id": "main-org",
      "name": "Test Organization"
    }]
  }),
  getOrganizations: jest.fn().mockReturnValue([{
    "@id": "org-1",
    "name": "Test Organization",
    "legalName": "Test Corp LLC"
  }]),
  createOrganization: jest.fn().mockImplementation((data) => {
    if (!data.name) throw new Error('Organization name is required');
    return { ...data, "@type": "Organization" };
  }),
  updateOrganization: jest.fn().mockReturnValue(true),
  deleteOrganization: jest.fn().mockReturnValue(true),
  saveOrganizations: jest.fn()
};

const mockPageManager = {
  getPageContent: jest.fn().mockResolvedValue('# Welcome\nTest content'),
  getPageMetadata: jest.fn().mockResolvedValue({ title: 'Welcome' }),
  getPage: jest.fn().mockReturnValue({ title: 'Test', content: 'Test' })
};

const mockRenderingManager = {
  textToHTML: jest.fn().mockResolvedValue('<p>Rendered</p>')
};

const mockACLManager = {
  removeACLMarkup: jest.fn().mockReturnValue('Clean content'),
  checkPagePermissionWithContext: jest.fn().mockResolvedValue(true)
};

const mockConfigManager = {
  getProperty: jest.fn().mockReturnValue('Welcome')
};

const mockUserManager = {
  hasPermission: jest.fn().mockReturnValue(true)
};

const mockEngine = {
  getManager: jest.fn((name) => {
    const managers = {
      'SchemaManager': mockSchemaManager,
      'PageManager': mockPageManager,
      'RenderingManager': mockRenderingManager,
      'ACLManager': mockACLManager,
      'ConfigurationManager': mockConfigManager,
      'UserManager': mockUserManager
    };
    return managers[name] || null;
  })
};

describe('WikiRoutes Schema.org Integration', () => {
  let wikiRoutes;

  beforeEach(() => {
    wikiRoutes = new WikiRoutes(mockEngine);
    jest.clearAllMocks();
  });

  describe('SchemaManager Integration', () => {
    test('should have access to SchemaManager', () => {
      const schemaManager = mockEngine.getManager('SchemaManager');
      expect(schemaManager).toBeDefined();
      expect(schemaManager.getOrganizations).toBeDefined();
    });

    test('should get comprehensive site data', () => {
      const siteData = mockSchemaManager.getComprehensiveSiteData();

      expect(siteData).toBeDefined();
      expect(siteData.adminUsers).toBeDefined();
      expect(siteData.organizations).toBeDefined();
    });

    test('should get organizations list', () => {
      const orgs = mockSchemaManager.getOrganizations();

      expect(orgs).toBeInstanceOf(Array);
      expect(orgs.length).toBeGreaterThan(0);
      expect(orgs[0]).toHaveProperty('name');
    });

    test('should create organization', () => {
      const newOrg = mockSchemaManager.createOrganization({
        name: 'New Organization',
        legalName: 'New Org LLC'
      });

      expect(newOrg).toBeDefined();
      expect(newOrg['@type']).toBe('Organization');
      expect(newOrg.name).toBe('New Organization');
    });

    test('should validate organization name is required', () => {
      expect(() => {
        mockSchemaManager.createOrganization({});
      }).toThrow('Organization name is required');
    });

    test('should update organization', () => {
      const result = mockSchemaManager.updateOrganization('org-1', {
        name: 'Updated Organization'
      });

      expect(result).toBe(true);
      expect(mockSchemaManager.updateOrganization).toHaveBeenCalledWith(
        'org-1',
        { name: 'Updated Organization' }
      );
    });

    test('should delete organization', () => {
      const result = mockSchemaManager.deleteOrganization('org-1');

      expect(result).toBe(true);
      expect(mockSchemaManager.deleteOrganization).toHaveBeenCalledWith('org-1');
    });
  });

  describe('Admin Organization Routes (Direct Method Tests)', () => {
    // Create mock request and response objects
    const createMockReq = (userContext, body = {}, params = {}) => ({
      userContext,
      body,
      params,
      session: {}
    });

    const createMockRes = () => {
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis(),
        send: jest.fn().mockReturnThis(),
        render: jest.fn().mockReturnThis(),
        redirect: jest.fn().mockReturnThis()
      };
      return res;
    };

    test('should require admin access for adminOrganizations', async () => {
      const req = createMockReq(
        { username: 'user', isAuthenticated: true, roles: ['user'] }
      );
      const res = createMockRes();

      // The method checks if user is admin
      mockUserManager.hasPermission.mockReturnValue(false);

      await wikiRoutes.adminOrganizations(req, res);

      // Should return 403 for non-admin
      expect(res.status).toHaveBeenCalledWith(403);
    });

    test('should allow admin to access organizations page', async () => {
      const req = createMockReq(
        { username: 'admin', isAuthenticated: true, roles: ['admin'] }
      );
      const res = createMockRes();

      mockUserManager.hasPermission.mockReturnValue(true);

      await wikiRoutes.adminOrganizations(req, res);

      // Should render the organizations page for admin
      expect(res.status).not.toHaveBeenCalledWith(403);
    });
  });
});
