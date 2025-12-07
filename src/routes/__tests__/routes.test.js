const express = require('express');
const request = require('supertest');
const path = require('path');
const WikiRoutes = require('../WikiRoutes');

// Mock LocaleUtils
jest.mock('../../utils/LocaleUtils', () => ({
  getDateFormatOptions: jest.fn().mockReturnValue(['MM/dd/yyyy', 'dd/MM/yyyy', 'yyyy-MM-dd']),
  getDateFormatFromLocale: jest.fn().mockReturnValue('MM/dd/yyyy')
}));

// Mock the WikiEngine and its managers
jest.mock('../../WikiEngine', () => {
  // Create mock managers once
  const mockUserManager = {
    getCurrentUser: jest.fn().mockResolvedValue({
      username: 'testuser',
      displayName: 'Test User',
      email: 'test@example.com',
      isExternal: false,
      isAuthenticated: true,
      createdAt: new Date('2023-01-01'),
      lastLogin: new Date('2024-01-01'),
      roles: ['authenticated']
    }),
    hasPermission: jest.fn().mockReturnValue(true),
    destroySession: jest.fn().mockResolvedValue(true),
    getUsers: jest.fn().mockResolvedValue([
      { 
        username: 'admin', 
        displayName: 'Admin User',
        email: 'admin@example.com',
        isExternal: false,
        createdAt: new Date('2023-01-01'),
        lastLogin: new Date('2024-01-01'),
        roles: ['admin'] 
      },
      { 
        username: 'testuser', 
        displayName: 'Test User',
        email: 'test@example.com',
        isExternal: false,
        createdAt: new Date('2023-01-01'),
        lastLogin: new Date('2024-01-01'),
        roles: ['authenticated'] 
      }
    ]),
    getRoles: jest.fn().mockResolvedValue([
      { name: 'admin', permissions: ['read', 'write', 'admin'] },
      { name: 'authenticated', permissions: ['read', 'write'] }
    ]),
    createUser: jest.fn().mockResolvedValue(true),
    updateUser: jest.fn().mockResolvedValue(true),
    deleteUser: jest.fn().mockResolvedValue(true),
    createRole: jest.fn().mockResolvedValue(true),
    updateRolePermissions: jest.fn().mockResolvedValue(true),
    deleteRole: jest.fn().mockResolvedValue(true),
    authenticateUser: jest.fn().mockResolvedValue({
      username: 'testuser',
      displayName: 'Test User',
      email: 'test@example.com',
      isExternal: false,
      isAuthenticated: true,
      createdAt: new Date('2023-01-01'),
      lastLogin: new Date('2024-01-01'),
      roles: ['authenticated']
    }),
    registerUser: jest.fn().mockResolvedValue(true),
    updateProfile: jest.fn().mockResolvedValue(true),
    updatePreferences: jest.fn().mockResolvedValue(true),
    getUser: jest.fn().mockResolvedValue({
      username: 'testuser',
      displayName: 'Test User',
      email: 'test@example.com',
      isExternal: false,
      createdAt: new Date('2023-01-01'),
      lastLogin: new Date('2024-01-01'),
      preferences: {}
    }),
    getPermissions: jest.fn().mockReturnValue(new Map([
      ['read', 'Read access to pages'],
      ['write', 'Write access to pages'],
      ['admin', 'Administrative access']
    ])),
    getUserPermissions: jest.fn().mockResolvedValue(['read', 'write']),
    createSession: jest.fn().mockResolvedValue('session-id-123'),
    isUserInRole: jest.fn().mockReturnValue(true)
  };

  const mockPageManager = {
    getPageNames: jest.fn().mockResolvedValue(['Welcome', 'TestPage']),
    getPage: jest.fn().mockImplementation((pageName) => {
      if (pageName === 'Footer' || pageName === 'LeftMenu') {
        return Promise.resolve(null); // These pages don't exist
      }
      return Promise.resolve({
        content: '# Test Page\nThis is a test page.',
        metadata: { title: 'TestPage' }
      });
    }),
    savePage: jest.fn().mockResolvedValue(true),
    deletePage: jest.fn().mockResolvedValue(true),
    getPageContent: jest.fn().mockResolvedValue('# Test Page\nThis is a test page.'),
    isRequiredPage: jest.fn().mockReturnValue(false)
  };

  const mockRenderingManager = {
    renderContent: jest.fn().mockReturnValue('<p>This is rendered content</p>'),
    renderMarkdown: jest.fn().mockReturnValue('<p>This is rendered markdown</p>'),
    getReferringPages: jest.fn().mockResolvedValue([]),
    rebuildLinkGraph: jest.fn().mockResolvedValue(true)
  };

  const mockSearchManager = {
    search: jest.fn().mockResolvedValue([]),
    advancedSearch: jest.fn().mockResolvedValue([]),
    rebuildIndex: jest.fn().mockResolvedValue(true)
  };

  const mockTemplateManager = {
    render: jest.fn().mockImplementation((template, data, callback) => {
      if (callback) callback(null, '<html>Test Template</html>');
      return '<html>Test Template</html>';
    }),
    getTemplates: jest.fn().mockResolvedValue(['basic', 'template1', 'template2']),
    getTemplate: jest.fn().mockResolvedValue({
      name: 'basic',
      content: '# {{title}}\nTemplate content here'
    })
  };

  const mockACLManager = {
    checkPagePermission: jest.fn().mockResolvedValue(true),
    removeACLMarkup: jest.fn().mockReturnValue('Content without ACL markup'),
    parseACL: jest.fn().mockReturnValue({ permissions: [] })
  };

  const mockNotificationManager = {
    dismissNotification: jest.fn().mockResolvedValue(true),
    clearAllNotifications: jest.fn().mockResolvedValue(true),
    getNotifications: jest.fn().mockReturnValue([]),
    createMaintenanceNotification: jest.fn().mockResolvedValue(true),
    getAllNotifications: jest.fn().mockReturnValue([]),
    getStats: jest.fn().mockReturnValue({ total: 0, active: 0, expired: 0, byType: {}, byLevel: {} })
  };

  const mockSchemaManager = {
    getPerson: jest.fn().mockResolvedValue(null),
    getOrganization: jest.fn().mockResolvedValue(null)
  };

  const mockConfigurationManager = {
    getProperty: jest.fn().mockReturnValue([]),
    get: jest.fn().mockReturnValue(null)
  };

  const mockVariableManager = {
    expandVariables: jest.fn().mockReturnValue('expanded content')
  };

  const mockExportManager = {
    getExports: jest.fn().mockResolvedValue([])
  };

  const mockValidationManager = {
    validateContent: jest.fn().mockResolvedValue({ isValid: true }),
    validateMetadata: jest.fn().mockResolvedValue({ isValid: true })
  };

  return jest.fn().mockImplementation(() => ({
    getManager: jest.fn((name) => {
      const mockManagers = {
        UserManager: mockUserManager,
        PageManager: mockPageManager,
        RenderingManager: mockRenderingManager,
        SearchManager: mockSearchManager,
        TemplateManager: mockTemplateManager,
        ACLManager: mockACLManager,
        NotificationManager: mockNotificationManager,
        SchemaManager: mockSchemaManager,
        ConfigurationManager: mockConfigurationManager,
        VariableManager: mockVariableManager,
        ExportManager: mockExportManager,
        ValidationManager: mockValidationManager
      };
      return mockManagers[name] || {};
    }),
    getApplicationName: jest.fn().mockReturnValue('amdWiki'),
    config: {
      features: {
        maintenance: { enabled: false, allowAdmins: true }
      }
    }
  }));
});

describe('WikiRoutes - Comprehensive Route Testing', () => {
  let app;
  let wikiRoutes;
  let mockEngine;
  let mockUserManager;
  let mockPageManager;
  let mockACLManager;

  // Helper function to create complete user objects
  const createMockUser = (username = 'testuser', roles = ['authenticated'], isAuthenticated = true) => ({
    username: username,
    displayName: username === 'testuser' ? 'Test User' : 'User',
    email: `${username}@example.com`,
    isAuthenticated: isAuthenticated,
    roles: roles
  });

  beforeEach(() => {
    // Create Express app
    app = express();
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));

    // Configure template engine
    app.set('view engine', 'ejs');
    app.set('views', path.join(__dirname, '../views'));

    // Mock template rendering to avoid file system dependencies
    app.use((req, res, next) => {
      const originalRender = res.render;
      res.render = (template, data, callback) => {
        // Return success response for template renders
        if (callback) {
          callback(null, '<html>Mock Template Content</html>');
        } else {
          res.send('<html>Mock Template Content</html>');
        }
      };
      next();
    });

    // Mock session middleware
    app.use((req, res, next) => {
      req.session = {
        csrfToken: 'test-csrf-token',
        user: { username: 'testuser' }
      };
      // Parse cookies from headers
      if (req.headers.cookie) {
        const cookie = require('cookie');
        req.cookies = cookie.parse(req.headers.cookie);
      } else {
        req.cookies = {};
      }
      next();
    });

    // Mock CSRF middleware
    app.use((req, res, next) => {
      req.csrfToken = () => 'test-csrf-token';

      // CSRF validation for POST requests
      if (req.method === 'POST') {
        const token = req.body._csrf || req.headers['x-csrf-token'] || req.headers['csrf-token'];
        if (!token || token !== 'test-csrf-token') {
          return res.status(403).json({ error: 'Invalid CSRF token' });
        }
      }

      next();
    });

    // Create WikiRoutes instance with the same mock engine
    const WikiEngine = require('../../WikiEngine');
    mockEngine = new WikiEngine();
    wikiRoutes = new WikiRoutes(mockEngine);

    // Get mock managers from the same engine instance
    mockUserManager = mockEngine.getManager('UserManager');
    mockPageManager = mockEngine.getManager('PageManager');
    mockACLManager = mockEngine.getManager('ACLManager');
    mockNotificationManager = mockEngine.getManager('NotificationManager');
    mockSchemaManager = mockEngine.getManager('SchemaManager');
    mockRenderingManager = mockEngine.getManager('RenderingManager');
    mockSearchManager = mockEngine.getManager('SearchManager');
    mockTemplateManager = mockEngine.getManager('TemplateManager');

    // Set up default mock implementations - using defaults from jest.mock()
    // No additional setup needed as jest.mock() provides the defaults

    // Register routes
    wikiRoutes.registerRoutes(app);
  });

  afterEach(() => {
    // Clear all mocks but preserve the WikiEngine mock setup
    jest.clearAllMocks();

    // Re-establish default mock implementations
    mockUserManager.getCurrentUser.mockResolvedValue({
      username: 'testuser',
      displayName: 'Test User',
      email: 'test@example.com',
      isAuthenticated: true,
      roles: ['authenticated']
    });
    mockUserManager.hasPermission.mockReturnValue(true);
    mockUserManager.getUserPermissions.mockResolvedValue(['read', 'write']);
    mockUserManager.getUser.mockResolvedValue({
      username: 'testuser',
      email: 'test@example.com',
      displayName: 'Test User',
      preferences: {}
    });
    mockUserManager.getUsers.mockResolvedValue([
      { username: 'admin', roles: ['admin'] },
      { username: 'testuser', roles: ['authenticated'] }
    ]);
    mockUserManager.getRoles.mockResolvedValue([
      { name: 'admin', permissions: ['read', 'write', 'admin'] },
      { name: 'authenticated', permissions: ['read', 'write'] }
    ]);
    mockUserManager.getPermissions.mockReturnValue(new Map([
      ['read', 'Read access to pages'],
      ['write', 'Write access to pages'],
      ['admin', 'Administrative access']
    ]));
    mockPageManager.getPageNames.mockResolvedValue(['Welcome', 'TestPage']);
    mockPageManager.getPage.mockImplementation((pageName) => {
      if (pageName === 'Footer' || pageName === 'LeftMenu') {
        return Promise.resolve(null); // These pages don't exist
      }
      return Promise.resolve({
        content: '# Test Page\nThis is a test page.',
        metadata: { title: 'TestPage' }
      });
    });
    mockPageManager.getPageContent.mockResolvedValue('# Test Page\nThis is a test page.');
    mockPageManager.isRequiredPage.mockReturnValue(false);
    mockRenderingManager.renderContent.mockReturnValue('<p>This is rendered content</p>');
    mockRenderingManager.renderMarkdown.mockReturnValue('<p>This is rendered markdown</p>');
    mockRenderingManager.getReferringPages.mockResolvedValue([]);
    mockRenderingManager.rebuildLinkGraph.mockResolvedValue(true);
    mockSearchManager.search.mockResolvedValue([]);
    mockSearchManager.advancedSearch.mockResolvedValue([]);
    mockSearchManager.rebuildIndex.mockResolvedValue(true);
    mockTemplateManager.render.mockImplementation((template, data, callback) => {
      if (callback) callback(null, '<html>Test Template</html>');
      return '<html>Test Template</html>';
    });
    mockTemplateManager.getTemplates.mockResolvedValue(['basic', 'template1', 'template2']);
    mockTemplateManager.getTemplate.mockResolvedValue({
      name: 'basic',  
      content: '# {{title}}\nTemplate content here'
    });
    mockACLManager.checkPagePermission.mockResolvedValue(true);
    mockACLManager.removeACLMarkup.mockReturnValue('Content without ACL markup');
    mockACLManager.parseACL.mockReturnValue({ permissions: [] });
    mockNotificationManager.getNotifications.mockResolvedValue([]);
    mockNotificationManager.getAllNotifications.mockReturnValue([]);
    mockNotificationManager.getStats.mockResolvedValue({ total: 0, active: 0, expired: 0, byType: {}, byLevel: {} });
    mockNotificationManager.dismissNotification.mockResolvedValue(true);
    mockSchemaManager.getPerson.mockResolvedValue(null);
    mockSchemaManager.getOrganization.mockResolvedValue(null);

    // Reset config to initial state
    mockEngine.config = {
      features: {
        maintenance: { enabled: false, allowAdmins: true }
      }
    };
  });

  describe('Public Routes', () => {
    describe('GET /', () => {
      test('should redirect to Welcome page', async () => {
        const response = await request(app).get('/');
        expect(response.status).toBe(302);
        expect(response.headers.location).toBe('/wiki/Welcome');
      });
    });

    describe('GET /wiki/:page', () => {
      test('should return 200 for existing page', async () => {
        mockPageManager.getPage.mockResolvedValue({
          content: '# Test Page\nThis is a test page.',
          metadata: { title: 'TestPage' }
        });
        mockACLManager.checkPagePermission.mockResolvedValue(true);

        const response = await request(app).get('/wiki/TestPage');
        expect(response.status).toBe(200);
      });

      test('should return 404 for non-existent page', async () => {
        mockPageManager.getPage.mockResolvedValue(null);

        const response = await request(app).get('/wiki/NonExistentPage');
        expect(response.status).toBe(404);
      });
    });

    describe('GET /edit/:page', () => {
      test('should return 200 for authenticated user', async () => {
        mockUserManager.getCurrentUser.mockResolvedValue({
          username: 'testuser',
          displayName: 'Test User',
          email: 'test@example.com',
          isAuthenticated: true,
          roles: ['authenticated']
        });
        mockUserManager.hasPermission.mockReturnValue(true);
        mockPageManager.getPage.mockResolvedValue({
          content: '# Test Page\nThis is a test page.',
          metadata: { title: 'TestPage' }
        });

        const response = await request(app).get('/edit/TestPage');
        expect(response.status).toBe(200);
      });

      test('should return 403 for unauthorized user', async () => {
        mockUserManager.getCurrentUser.mockResolvedValue({
          username: 'testuser',
          displayName: 'Test User',
          email: 'test@example.com',
          isAuthenticated: true,
          roles: ['authenticated']
        });
        mockUserManager.hasPermission.mockReturnValue(false);
        mockACLManager.checkPagePermission.mockResolvedValue(false);

        const response = await request(app).get('/edit/TestPage');
        expect(response.status).toBe(403);
      });
    });

    describe('POST /save/:page', () => {
      test('should save page successfully', async () => {
        mockUserManager.getCurrentUser.mockResolvedValue(createMockUser());
        mockUserManager.hasPermission.mockReturnValue(true);
        mockPageManager.savePage.mockResolvedValue(true);

        const response = await request(app)
          .post('/save/TestPage')
          .send({
            content: '# Updated Content',
            'system-category': 'general',
            _csrf: 'test-csrf-token'
          });

        expect(response.status).toBe(302); // Redirect after save
      });

      test('should return 403 for CSRF failure', async () => {
        const response = await request(app)
          .post('/save/TestPage')
          .send({ content: '# Updated Content' });

        expect(response.status).toBe(403);
      });
    });

    describe('GET /create', () => {
      test('should return 200 for authenticated user', async () => {
        mockUserManager.getCurrentUser.mockResolvedValue(createMockUser());
        mockUserManager.hasPermission.mockReturnValue(true);

        const response = await request(app).get('/create');
        expect(response.status).toBe(200);
      });
    });

    describe('POST /create', () => {
      test('should create page successfully', async () => {
        mockUserManager.getCurrentUser.mockResolvedValue(createMockUser());
        mockUserManager.hasPermission.mockReturnValue(true);
        mockPageManager.savePage.mockResolvedValue(true);
        // Make sure the new page doesn't exist
        mockPageManager.getPage.mockImplementation((pageName) => {
          if (pageName === 'NewPage') return Promise.resolve(null);
          if (pageName === 'Footer' || pageName === 'LeftMenu') return Promise.resolve(null);
          return Promise.resolve({
            content: '# Test Page\nThis is a test page.',
            metadata: { title: 'TestPage' }
          });
        });

        const response = await request(app)
          .post('/create')
          .send({
            pageName: 'NewPage',
            templateName: 'basic',
            categories: ['general'],
            _csrf: 'test-csrf-token'
          });

        expect(response.status).toBe(302);
      });
    });

    describe('POST /delete/:page', () => {
      test('should delete page successfully', async () => {
        mockUserManager.getCurrentUser.mockResolvedValue(createMockUser());
        mockUserManager.hasPermission.mockReturnValue(true);
        mockPageManager.deletePage.mockResolvedValue(true);
        mockPageManager.isRequiredPage.mockResolvedValue(false);

        const response = await request(app)
          .post('/delete/TestPage')
          .send({ _csrf: 'test-csrf-token' });

        expect(response.status).toBe(302);
      });

      test('should prevent deletion of required pages', async () => {
        mockUserManager.getCurrentUser.mockResolvedValue(createMockUser());
        // Allow general permissions but deny admin:system
        mockUserManager.hasPermission.mockImplementation((username, permission) => {
          if (permission === 'admin:system') return false;
          return true;
        });
        // Make TestPage a required page by setting it to Categories (hardcoded required)
        mockPageManager.getPage.mockImplementation((pageName) => {
          if (pageName === 'Categories' || pageName === 'TestPage') {
            return Promise.resolve({
              content: '# Test Page\nThis is a test page.',
              metadata: { title: 'TestPage', category: 'System/Admin' }
            });
          }
          if (pageName === 'Footer' || pageName === 'LeftMenu') return Promise.resolve(null);
          return Promise.resolve({
            content: '# Test Page\nThis is a test page.',
            metadata: { title: 'TestPage' }
          });
        });

        const response = await request(app)
          .post('/delete/TestPage')
          .send({ _csrf: 'test-csrf-token' });

        expect(response.status).toBe(403);
      });
    });

    describe('GET /search', () => {
      test('should return 200 for search page', async () => {
        const response = await request(app).get('/search?q=test');
        expect(response.status).toBe(200);
      });
    });

    describe('GET /login', () => {
      test('should return 200 for login page', async () => {
        // Mock unauthenticated user for login page
        mockUserManager.getCurrentUser.mockResolvedValue(null);

        const response = await request(app).get('/login');
        expect(response.status).toBe(200);
      });
    });

    describe('POST /login', () => {
      test('should process login successfully', async () => {
        mockUserManager.getCurrentUser.mockResolvedValue({ username: 'testuser' });

        const response = await request(app)
          .post('/login')
          .send({
            username: 'testuser',
            password: 'password',
            _csrf: 'test-csrf-token'
          });

        expect(response.status).toBe(302);
      });
    });

    describe('GET /logout', () => {
      test('should logout and redirect', async () => {
        // Set up the mock to return the expected user
        mockUserManager.getCurrentUser.mockResolvedValue({ username: 'testuser' });
        mockUserManager.destroySession.mockReturnValue(true);

        const response = await request(app)
          .get('/logout')
          .set('Cookie', 'sessionId=test-session-id');

        expect(response.status).toBe(302);
        expect(mockUserManager.destroySession).toHaveBeenCalledWith('test-session-id');
      });
    });

    describe('POST /logout', () => {
      test('should logout and redirect', async () => {
        mockUserManager.getCurrentUser.mockResolvedValue({ username: 'testuser' });
        mockUserManager.destroySession.mockReturnValue(true);

        const response = await request(app)
          .post('/logout')
          .set('Cookie', 'sessionId=test-session-id')
          .send({ _csrf: 'test-csrf-token' });

        expect(response.status).toBe(302);
        expect(mockUserManager.destroySession).toHaveBeenCalledWith('test-session-id');
      });
    });

    describe('GET /register', () => {
      test('should return 200 for register page', async () => {
        const response = await request(app).get('/register');
        expect(response.status).toBe(200);
      });
    });

    describe('POST /register', () => {
      test('should register user successfully', async () => {
        mockUserManager.createUser.mockResolvedValue(true);

        const response = await request(app)
          .post('/register')
          .send({
            username: 'newuser',
            email: 'newuser@example.com',
            password: 'password',
            _csrf: 'test-csrf-token'
          });

        expect(response.status).toBe(302);
      });
    });

    describe('GET /profile', () => {
      test('should return 200 for authenticated user', async () => {
        mockUserManager.getCurrentUser.mockResolvedValue({ username: 'testuser' });
        mockUserManager.getUser.mockResolvedValue({
          username: 'testuser',
          email: 'test@example.com',
          displayName: 'Test User',
          preferences: {}
        });

        const response = await request(app).get('/profile');
        expect(response.status).toBe(200);
      });
    });

    describe('POST /profile', () => {
      test('should update profile successfully', async () => {
        mockUserManager.getCurrentUser.mockResolvedValue({ username: 'testuser' });
        mockUserManager.updateUser.mockResolvedValue(true);

        const response = await request(app)
          .post('/profile')
          .send({
            displayName: 'Test User',
            email: 'test@example.com',
            _csrf: 'test-csrf-token'
          });

        expect(response.status).toBe(302);
      });
    });

    describe('POST /preferences', () => {
      test('should update preferences successfully', async () => {
        mockUserManager.getCurrentUser.mockResolvedValue({ username: 'testuser' });

        const response = await request(app)
          .post('/preferences')
          .send({
            theme: 'dark',
            _csrf: 'test-csrf-token'
          });

        expect(response.status).toBe(302);
      });
    });

    describe('GET /user-info', () => {
      test('should return user info', async () => {
        mockUserManager.getCurrentUser.mockResolvedValue({
          username: 'testuser',
          displayName: 'Test User'
        });

        const response = await request(app).get('/user-info');
        expect(response.status).toBe(200);
      });
    });
  });

  describe('Admin Routes', () => {
    beforeEach(() => {
      // Set up admin user for all admin tests
      mockUserManager.getCurrentUser.mockResolvedValue({
        username: 'admin',
        displayName: 'Admin User',
        email: 'admin@example.com',
        isExternal: false,
        createdAt: new Date('2023-01-01'),
        lastLogin: new Date('2024-01-01'),
        isAuthenticated: true,
        isAdmin: true,
        roles: ['admin']
      });
      mockUserManager.hasPermission.mockReturnValue(true);
    });

    describe('GET /admin', () => {
      test('should return 200 for admin user', async () => {
        mockUserManager.getCurrentUser.mockResolvedValue({
          username: 'admin',
          displayName: 'Admin User',
          email: 'admin@example.com',
          isExternal: false,
          createdAt: new Date('2023-01-01'),
          lastLogin: new Date('2024-01-01'),
          isAuthenticated: true,
          isAdmin: true,
          roles: ['admin']
        });
        mockUserManager.hasPermission.mockReturnValue(true);
        mockPageManager.getPageNames.mockResolvedValue(['Welcome']);
        mockPageManager.isRequiredPage.mockResolvedValue(true);

        const response = await request(app).get('/admin');
        expect(response.status).toBe(200);
      });

      test('should return 403 for non-admin user', async () => {
        mockUserManager.getCurrentUser.mockResolvedValue({
          username: 'user',
          displayName: 'Regular User',
          email: 'user@example.com',
          isExternal: false,
          createdAt: new Date('2023-01-01'),
          lastLogin: new Date('2024-01-01'),
          isAuthenticated: true,
          isAdmin: false
        });
        mockUserManager.hasPermission.mockReturnValue(false);

        const response = await request(app).get('/admin');
        expect(response.status).toBe(403);
      });
    });

    describe('POST /admin/maintenance/toggle', () => {
      test('should toggle maintenance mode for admin', async () => {
        const response = await request(app)
          .post('/admin/maintenance/toggle')
          .send({ _csrf: 'test-csrf-token' });

        expect(response.status).toBe(302);
      });
    });

    describe('GET /admin/users', () => {
      test('should return user list for admin', async () => {
        mockUserManager.getCurrentUser.mockResolvedValue({ 
          username: 'admin',
          displayName: 'Admin User',
          email: 'admin@example.com',
          roles: ['admin']
        });
        mockUserManager.hasPermission.mockReturnValue(true);
        mockUserManager.getUsers.mockReturnValue([]);

        const response = await request(app).get('/admin/users');
        expect(response.status).toBe(200);
      });
    });

    describe('POST /admin/users', () => {
      test('should create user for admin', async () => {
        mockUserManager.getCurrentUser.mockResolvedValue({ 
          username: 'admin',
          displayName: 'Admin User',
          email: 'admin@example.com',
          roles: ['admin']
        });
        mockUserManager.hasPermission.mockReturnValue(true);
        mockUserManager.createUser.mockResolvedValue(true);

        const response = await request(app)
          .post('/admin/users')
          .send({
            username: 'newuser',
            email: 'newuser@example.com',
            password: 'password',
            _csrf: 'test-csrf-token'
          });

        expect(response.status).toBe(302);
      });
    });

    describe('PUT /admin/users/:username', () => {
      test('should update user for admin', async () => {
        mockUserManager.getCurrentUser.mockResolvedValue({ 
          username: 'admin',
          displayName: 'Admin User',
          email: 'admin@example.com'
        });
        mockUserManager.hasPermission.mockReturnValue(true);
        mockUserManager.updateUser.mockResolvedValue(true);

        const response = await request(app)
          .put('/admin/users/testuser')
          .send({
            displayName: 'Updated Name',
            _csrf: 'test-csrf-token'
          });

        expect(response.status).toBe(200);
      });
    });

    describe('DELETE /admin/users/:username', () => {
      test('should delete user for admin', async () => {
        mockUserManager.getCurrentUser.mockResolvedValue({ 
          username: 'admin',
          displayName: 'Admin User',
          email: 'admin@example.com'
        });
        mockUserManager.hasPermission.mockReturnValue(true);
        mockUserManager.deleteUser.mockResolvedValue(true);

        const response = await request(app)
          .delete('/admin/users/testuser')
          .send({ _csrf: 'test-csrf-token' });

        expect(response.status).toBe(200);
      });
    });

    describe('GET /admin/roles', () => {
      test('should return role list for admin', async () => {
        mockUserManager.getCurrentUser.mockResolvedValue({
          username: 'admin',
          displayName: 'Admin User',
          email: 'admin@example.com',
          isExternal: false,
          createdAt: new Date('2023-01-01'),
          lastLogin: new Date('2024-01-01'),
          isAuthenticated: true,
          isAdmin: true,
          roles: ['admin']
        });
        mockUserManager.getRoles.mockReturnValue(new Map([
          ['admin', { name: 'admin', permissions: ['read', 'write', 'admin'] }],
          ['authenticated', { name: 'authenticated', permissions: ['read', 'write'] }]
        ]));

        const response = await request(app).get('/admin/roles');
        expect(response.status).toBe(200);
      });
    });

    describe('POST /admin/roles', () => {
      test('should create role for admin', async () => {
        mockUserManager.createRole.mockResolvedValue({ name: 'newrole' });

        const response = await request(app)
          .post('/admin/roles')
          .send({
            name: 'newrole',
            displayName: 'New Role',
            permissions: ['page:read'],
            _csrf: 'test-csrf-token'
          });

        expect(response.status).toBe(200);
      });
    });

    describe('PUT /admin/roles/:role', () => {
      test('should update role for admin', async () => {
        mockUserManager.getCurrentUser.mockResolvedValue({
          username: 'admin',
          displayName: 'Admin User',
          email: 'admin@example.com',
          isExternal: false,
          createdAt: new Date('2023-01-01'),
          lastLogin: new Date('2024-01-01'),
          isAuthenticated: true,
          isAdmin: true,
          roles: ['admin']
        });
        mockUserManager.hasPermission.mockReturnValue(true);
        mockUserManager.updateRolePermissions.mockResolvedValue(true);

        const response = await request(app)
          .put('/admin/roles/testrole')
          .send({
            roleName: 'testrole',
            permissions: ['page:read', 'page:edit'],
            _csrf: 'test-csrf-token'
          });

        expect(response.status).toBe(200);
      });
    });

    describe('DELETE /admin/roles/:role', () => {
      test('should delete role for admin', async () => {
        mockUserManager.deleteRole.mockResolvedValue(true);

        const response = await request(app)
          .delete('/admin/roles/testrole')
          .send({ _csrf: 'test-csrf-token' });

        expect(response.status).toBe(200);
      });
    });

    describe('GET /admin/notifications', () => {
      test('should return notifications for admin', async () => {
        // Ensure clean config state
        mockEngine.config = {
          features: {
            maintenance: { enabled: false, allowAdmins: true }
          }
        };
        
        // Reset notification manager mocks
        mockNotificationManager.getAllNotifications.mockReturnValue([]);
        mockNotificationManager.getStats.mockReturnValue({ total: 0, active: 0, expired: 0, byType: {}, byLevel: {} });
        
        mockUserManager.getCurrentUser.mockResolvedValue({
          username: 'admin',
          displayName: 'Admin User',
          email: 'admin@example.com',
          isExternal: false,
          createdAt: new Date('2023-01-01'),
          lastLogin: new Date('2024-01-01'),
          isAuthenticated: true,
          isAdmin: true,
          roles: ['admin']
        });
        mockUserManager.hasPermission.mockReturnValue(true);

        const response = await request(app).get('/admin/notifications');
        expect(response.status).toBe(200);
      });
    });

    describe('POST /admin/notifications/:id/dismiss', () => {
      test('should dismiss notification for admin', async () => {
        mockUserManager.getCurrentUser.mockResolvedValue({ 
          username: 'admin',
          displayName: 'Admin User',
          email: 'admin@example.com'
        });
        mockUserManager.hasPermission.mockReturnValue(true);

        const mockNotificationManager = mockEngine.getManager('NotificationManager');
        mockNotificationManager.dismissNotification.mockResolvedValue(true);

        const response = await request(app)
          .post('/admin/notifications/123/dismiss')
          .send({ _csrf: 'test-csrf-token' });

        expect(response.status).toBe(302);
      });
    });

    describe('POST /admin/notifications/clear-all', () => {
      test('should clear all notifications for admin', async () => {
        mockUserManager.getCurrentUser.mockResolvedValue({ 
          username: 'admin',
          displayName: 'Admin User',
          email: 'admin@example.com'
        });
        mockUserManager.hasPermission.mockReturnValue(true);

        const response = await request(app)
          .post('/admin/notifications/clear-all')
          .send({ _csrf: 'test-csrf-token' });

        expect(response.status).toBe(302);
      });
    });

    describe('GET /schema/person/:identifier', () => {
      test('should return person schema for admin', async () => {
        mockUserManager.getCurrentUser.mockResolvedValue({ 
          username: 'admin',
          displayName: 'Admin User',
          email: 'admin@example.com'
        });
        mockUserManager.hasPermission.mockReturnValue(true);

        const mockSchemaManager = mockEngine.getManager('SchemaManager');
        mockSchemaManager.getPerson.mockResolvedValue({
          name: 'John Doe',
          jobTitle: 'Developer'
        });

        const response = await request(app).get('/schema/person/johndoe');
        expect(response.status).toBe(200);
      });

      test('should return 404 for non-existent person', async () => {
        mockUserManager.getCurrentUser.mockResolvedValue({ 
          username: 'admin',
          displayName: 'Admin User',
          email: 'admin@example.com'
        });
        mockUserManager.hasPermission.mockReturnValue(true);

        const mockSchemaManager = mockEngine.getManager('SchemaManager');
        mockSchemaManager.getPerson.mockResolvedValue(null);

        const response = await request(app).get('/schema/person/nonexistent');
        expect(response.status).toBe(404);
      });
    });

    describe('GET /schema/organization/:identifier', () => {
      test('should return organization schema for admin', async () => {
        mockUserManager.getCurrentUser.mockResolvedValue({ 
          username: 'admin',
          displayName: 'Admin User',
          email: 'admin@example.com'
        });
        mockUserManager.hasPermission.mockReturnValue(true);

        const mockSchemaManager = mockEngine.getManager('SchemaManager');
        mockSchemaManager.getOrganization.mockResolvedValue({
          name: 'Test Company',
          url: 'https://example.com'
        });

        const response = await request(app).get('/schema/organization/testcompany');
        expect(response.status).toBe(200);
      });
    });
  });

  describe('Error Handling', () => {
    test('should return 404 for unknown routes', async () => {
      const response = await request(app).get('/unknown-route');
      expect(response.status).toBe(404);
    });

    test('should handle server errors gracefully', async () => {
      mockUserManager.getCurrentUser.mockImplementation(() => {
        throw new Error('Database connection failed');
      });

      const response = await request(app).get('/profile');
      expect(response.status).toBe(500);
    });
  });

  describe('CSRF Protection', () => {
    test('should reject POST requests without CSRF token', async () => {
      const response = await request(app)
        .post('/login')
        .send({ username: 'test', password: 'pass' });

      expect(response.status).toBe(403);
    });

    test('should reject POST requests with invalid CSRF token', async () => {
      const response = await request(app)
        .post('/login')
        .send({
          username: 'test',
          password: 'pass',
          _csrf: 'invalid-token'
        });

      expect(response.status).toBe(403);
    });
  });

  describe('Authentication Checks', () => {
    test('should redirect unauthenticated users to login for protected routes', async () => {
      mockUserManager.getCurrentUser.mockResolvedValue(null);

      const response = await request(app).get('/profile');
      expect(response.status).toBe(302); // Should redirect to login
    });

    test('should allow anonymous access to public routes', async () => {
      mockUserManager.getCurrentUser.mockResolvedValue(null);
      mockPageManager.getPage.mockResolvedValue({
        content: '# Public Page',
        metadata: { title: 'PublicPage' }
      });

      const response = await request(app).get('/wiki/PublicPage');
      expect(response.status).toBe(200);
    });
  });
});