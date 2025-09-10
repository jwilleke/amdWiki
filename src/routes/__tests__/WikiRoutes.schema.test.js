const request = require('supertest');
const express = require('express');
const WikiRoutes = require('../../routes/WikiRoutes');

// Mock the WikiEngine and managers
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
  organizations: [{
    "@id": "org-1",
    "name": "Test Organization",
    "legalName": "Test Corp LLC"
  }],
  createOrganization: jest.fn(),
  updateOrganization: jest.fn(),
  deleteOrganization: jest.fn(),
  saveOrganizations: jest.fn()
};

const mockUserManager = {
  getCurrentUser: jest.fn().mockReturnValue({
    username: 'testuser',
    roles: ['admin'],
    hasRole: jest.fn().mockReturnValue(true)
  })
};

const mockRenderingManager = {
  renderPage: jest.fn().mockResolvedValue('<p>Rendered content</p>')
};

const mockPageManager = {
  getPage: jest.fn().mockReturnValue({
    title: 'Test Page',
    content: 'Test content',
    category: 'General'
  })
};

const mockEngine = {
  getManager: jest.fn((name) => {
    switch (name) {
      case 'SchemaManager': return mockSchemaManager;
      case 'UserManager': return mockUserManager;
      case 'RenderingManager': return mockRenderingManager;
      case 'PageManager': return mockPageManager;
      default: return null;
    }
  })
};

describe('WikiRoutes Schema.org Integration', () => {
  let app;
  let wikiRoutes;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));
    
    // Mock session middleware
    app.use((req, res, next) => {
      req.session = { userId: 'test-user' };
      next();
    });

    wikiRoutes = new WikiRoutes(mockEngine);
    
    // Setup routes
    app.get('/view/:pageName', wikiRoutes.viewPage.bind(wikiRoutes));
    app.get('/admin/organizations', wikiRoutes.adminOrganizations.bind(wikiRoutes));
    app.post('/admin/organizations', wikiRoutes.adminCreateOrganization.bind(wikiRoutes));
    app.put('/admin/organizations/:id', wikiRoutes.adminUpdateOrganization.bind(wikiRoutes));
    app.delete('/admin/organizations/:id', wikiRoutes.adminDeleteOrganization.bind(wikiRoutes));

    // Mock template rendering
    app.set('view engine', 'ejs');
    app.set('views', './views');
    
    jest.clearAllMocks();
  });

  describe('Schema.org JSON-LD generation', () => {
    it('should include Schema.org markup in page views', async () => {
      // Mock the view rendering to capture template data
      const mockRender = jest.fn((template, data, callback) => {
        // Verify Schema.org data is passed to template
        expect(data.schemaData).toBeDefined();
        expect(data.schemaData.page).toBeDefined();
        
        callback(null, '<html><head></head><body>Test</body></html>');
      });

      app.set('view engine', 'ejs');
      app.engine('ejs', mockRender);

      const response = await request(app)
        .get('/view/Welcome')
        .expect(200);

      expect(mockPageManager.getPage).toHaveBeenCalledWith('Welcome');
      expect(mockRenderingManager.renderPage).toHaveBeenCalled();
    });

    it('should include comprehensive site schema on Welcome page', async () => {
      const mockRender = jest.fn((template, data, callback) => {
        // On Welcome page, should include comprehensive site data
        if (data.page && data.page.title === 'Welcome') {
          expect(data.schemaData.site).toBeDefined();
          expect(data.schemaData.site.adminUsers).toBeDefined();
          expect(data.schemaData.site.organizations).toBeDefined();
        }
        
        callback(null, '<html>Welcome Page</html>');
      });

      app.engine('ejs', mockRender);

      // Mock page manager to return Welcome page
      mockPageManager.getPage.mockReturnValue({
        title: 'Welcome',
        content: 'Welcome to the wiki',
        category: 'General'
      });

      const response = await request(app)
        .get('/view/Welcome')
        .expect(200);

      expect(mockSchemaManager.getComprehensiveSiteData).toHaveBeenCalled();
    });
  });

  describe('Admin organization management', () => {
    it('should display organizations admin page', async () => {
      const mockRender = jest.fn((template, data, callback) => {
        expect(data.organizations).toBeDefined();
        expect(data.organizations).toHaveLength(1);
        expect(data.organizations[0].name).toBe('Test Organization');
        
        callback(null, '<html>Admin Organizations</html>');
      });

      app.engine('ejs', mockRender);

      const response = await request(app)
        .get('/admin/organizations')
        .expect(200);

      expect(mockUserManager.getCurrentUser).toHaveBeenCalled();
    });

    it('should create new organization', async () => {
      mockSchemaManager.createOrganization.mockReturnValue({
        "@id": "new-org",
        "name": "New Organization"
      });

      const response = await request(app)
        .post('/admin/organizations')
        .send({
          name: 'New Organization',
          legalName: 'New Organization LLC'
        })
        .expect(302); // Redirect after creation

      expect(mockSchemaManager.createOrganization).toHaveBeenCalledWith({
        name: 'New Organization',
        legalName: 'New Organization LLC'
      });
      expect(mockSchemaManager.saveOrganizations).toHaveBeenCalled();
    });

    it('should update existing organization', async () => {
      mockSchemaManager.updateOrganization.mockReturnValue(true);

      const response = await request(app)
        .put('/admin/organizations/org-1')
        .send({
          name: 'Updated Organization',
          legalName: 'Updated Corp LLC'
        })
        .expect(200);

      expect(mockSchemaManager.updateOrganization).toHaveBeenCalledWith('org-1', {
        name: 'Updated Organization',
        legalName: 'Updated Corp LLC'
      });
    });

    it('should delete organization', async () => {
      mockSchemaManager.deleteOrganization.mockReturnValue(true);

      const response = await request(app)
        .delete('/admin/organizations/org-1')
        .expect(200);

      expect(mockSchemaManager.deleteOrganization).toHaveBeenCalledWith('org-1');
      expect(mockSchemaManager.saveOrganizations).toHaveBeenCalled();
    });

    it('should require admin access for organization management', async () => {
      // Mock non-admin user
      mockUserManager.getCurrentUser.mockReturnValue({
        username: 'regularuser',
        roles: ['user'],
        hasRole: jest.fn().mockReturnValue(false)
      });

      const response = await request(app)
        .get('/admin/organizations')
        .expect(403);

      expect(response.text).toContain('Forbidden');
    });
  });

  describe('Schema.org data validation', () => {
    it('should validate organization data before creation', async () => {
      // Test with invalid data
      const response = await request(app)
        .post('/admin/organizations')
        .send({
          // Missing required name field
          legalName: 'Test Corp'
        })
        .expect(400);

      expect(response.body.error).toContain('required');
    });

    it('should handle Schema.org validation errors gracefully', async () => {
      mockSchemaManager.createOrganization.mockImplementation(() => {
        throw new Error('Organization name is required');
      });

      const response = await request(app)
        .post('/admin/organizations')
        .send({
          legalName: 'Test Corp'
        })
        .expect(400);

      expect(response.body.error).toBe('Organization name is required');
    });
  });
});

// Add supertest dependency check
beforeAll(async () => {
  try {
    require('supertest');
  } catch (error) {
    console.warn('supertest not installed - install with: npm install --save-dev supertest');
  }
});
