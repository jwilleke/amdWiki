const express = require('express');
const request = require('supertest');
const path = require('path');
const WikiRoutes = require('../src/routes/WikiRoutes');

// Mock the WikiEngine and its managers
jest.mock('../src/WikiEngine', () => {
  // Create mock managers once
  const mockUserManager = {
    getCurrentUser: jest.fn(),
    hasPermission: jest.fn(),
    destroySession: jest.fn(),
    getUsers: jest.fn(),
    getRoles: jest.fn(),
    createUser: jest.fn(),
    updateUser: jest.fn(),
    deleteUser: jest.fn(),
    createRole: jest.fn(),
    updateRolePermissions: jest.fn(),
    deleteRole: jest.fn(),
    authenticateUser: jest.fn(),
    registerUser: jest.fn(),
    updateProfile: jest.fn(),
    updatePreferences: jest.fn(),
    getUser: jest.fn(),
    getPermissions: jest.fn(),
    getUserPermissions: jest.fn()
  };

  const mockPageManager = {
    getPageNames: jest.fn(),
    getPage: jest.fn(),
    savePage: jest.fn(),
    deletePage: jest.fn(),
    getPageContent: jest.fn(),
    isRequiredPage: jest.fn()
  };

  const mockRenderingManager = {
    renderContent: jest.fn(),
    renderMarkdown: jest.fn(),
    getReferringPages: jest.fn()
  };

  const mockSearchManager = {
    search: jest.fn(),
    advancedSearch: jest.fn()
  };

  const mockTemplateManager = {
    render: jest.fn(),
    getTemplates: jest.fn()
  };

  const mockACLManager = {
    checkPagePermission: jest.fn(),
    removeACLMarkup: jest.fn(),
    parseACL: jest.fn()
  };

  const mockNotificationManager = {
    dismissNotification: jest.fn(),
    clearAllNotifications: jest.fn(),
    getNotifications: jest.fn(),
    createMaintenanceNotification: jest.fn(),
    getAllNotifications: jest.fn()
  };

  const mockSchemaManager = {
    getPerson: jest.fn(),
    getOrganization: jest.fn()
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
        SchemaManager: mockSchemaManager
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

  beforeEach(() => {
    // Create Express app
    app = express();
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));

    // Configure template engine
    app.set('view engine', 'ejs');
    app.set('views', path.join(__dirname, '../views'));

    // Mock session middleware
    app.use((req, res, next) => {
      req.session = {};
      // Parse cookies from headers
      if (req.headers.cookie) {
        const cookie = require('cookie');
        req.cookies = cookie.parse(req.headers.cookie);
      } else {
        req.cookies = {};
      }
      next();
    });

    // Create WikiRoutes instance with the same mock engine
    const WikiEngine = require('../src/WikiEngine');
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

    // Register routes
    wikiRoutes.registerRoutes(app);
  });

  afterEach(() => {
    // Don't clear all mocks as it breaks the WikiEngine mock setup
    // jest.clearAllMocks();
  });

  describe('Public Routes', () => {
    describe('GET /', () => {
      test('should return 200 for home page', async () => {
        mockPageManager.getPageNames.mockResolvedValue(['Welcome', 'TestPage']);
        mockPageManager.getPage.mockResolvedValue({
          content: '# Welcome\nWelcome to the wiki!',
          metadata: { title: 'Welcome' }
        });

        const response = await request(app).get('/');
        expect(response.status).toBe(200);
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
          isAuthenticated: true
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
          isAuthenticated: true
        });
        mockUserManager.hasPermission.mockReturnValue(false);

        const response = await request(app).get('/edit/TestPage');
        expect(response.status).toBe(403);
      });
    });

    describe('POST /save/:page', () => {
      test('should save page successfully', async () => {
        mockUserManager.getCurrentUser.mockResolvedValue({ username: 'testuser' });
        mockUserManager.hasPermission.mockReturnValue(true);
        mockPageManager.savePage.mockResolvedValue(true);

        const response = await request(app)
          .post('/save/TestPage')
          .send({
            content: '# Updated Content',
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
        mockUserManager.getCurrentUser.mockResolvedValue({ username: 'testuser' });
        mockUserManager.hasPermission.mockReturnValue(true);

        const response = await request(app).get('/create');
        expect(response.status).toBe(200);
      });
    });

    describe('POST /create', () => {
      test('should create page successfully', async () => {
        mockUserManager.getCurrentUser.mockResolvedValue({ username: 'testuser' });
        mockUserManager.hasPermission.mockReturnValue(true);
        mockPageManager.savePage.mockResolvedValue(true);

        const response = await request(app)
          .post('/create')
          .send({
            title: 'New Page',
            content: '# New Page\nContent here',
            _csrf: 'test-csrf-token'
          });

        expect(response.status).toBe(302);
      });
    });

    describe('POST /delete/:page', () => {
      test('should delete page successfully', async () => {
        mockUserManager.getCurrentUser.mockResolvedValue({ username: 'testuser' });
        mockUserManager.hasPermission.mockReturnValue(true);
        mockPageManager.deletePage.mockResolvedValue(true);
        mockPageManager.isRequiredPage.mockResolvedValue(false);

        const response = await request(app)
          .post('/delete/TestPage')
          .send({ _csrf: 'test-csrf-token' });

        expect(response.status).toBe(302);
      });

      test('should prevent deletion of required pages', async () => {
        mockUserManager.getCurrentUser.mockResolvedValue({ username: 'testuser' });
        mockUserManager.hasPermission.mockReturnValue(true);
        mockPageManager.isRequiredPage.mockResolvedValue(true);

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
    describe('GET /admin', () => {
      test('should return 200 for admin user', async () => {
        mockUserManager.getCurrentUser.mockResolvedValue({
          username: 'admin',
          isAuthenticated: true,
          isAdmin: true
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
        mockUserManager.getCurrentUser.mockResolvedValue({ username: 'admin' });
        mockUserManager.hasPermission.mockReturnValue(true);

        const response = await request(app)
          .post('/admin/maintenance/toggle')
          .send({ _csrf: 'test-csrf-token' });

        expect(response.status).toBe(200);
      });
    });

    describe('GET /admin/users', () => {
      test('should return user list for admin', async () => {
        mockUserManager.getCurrentUser.mockResolvedValue({ username: 'admin' });
        mockUserManager.hasPermission.mockReturnValue(true);
        mockUserManager.getUsers.mockReturnValue([]);

        const response = await request(app).get('/admin/users');
        expect(response.status).toBe(200);
      });
    });

    describe('POST /admin/users', () => {
      test('should create user for admin', async () => {
        mockUserManager.getCurrentUser.mockResolvedValue({ username: 'admin' });
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
        mockUserManager.getCurrentUser.mockResolvedValue({ username: 'admin' });
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
        mockUserManager.getCurrentUser.mockResolvedValue({ username: 'admin' });
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
        mockUserManager.getCurrentUser.mockResolvedValue({ username: 'admin' });
        mockUserManager.hasPermission.mockReturnValue(true);
        mockUserManager.getRoles.mockReturnValue(new Map());

        const response = await request(app).get('/admin/roles');
        expect(response.status).toBe(200);
      });
    });

    describe('POST /admin/roles', () => {
      test('should create role for admin', async () => {
        mockUserManager.getCurrentUser.mockResolvedValue({ username: 'admin' });
        mockUserManager.hasPermission.mockReturnValue(true);
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
        mockUserManager.getCurrentUser.mockResolvedValue({ username: 'admin' });
        mockUserManager.hasPermission.mockReturnValue(true);
        mockUserManager.updateRolePermissions.mockResolvedValue(true);

        const response = await request(app)
          .put('/admin/roles/testrole')
          .send({
            permissions: ['page:read', 'page:edit'],
            _csrf: 'test-csrf-token'
          });

        expect(response.status).toBe(200);
      });
    });

    describe('DELETE /admin/roles/:role', () => {
      test('should delete role for admin', async () => {
        mockUserManager.getCurrentUser.mockResolvedValue({ username: 'admin' });
        mockUserManager.hasPermission.mockReturnValue(true);
        mockUserManager.deleteRole.mockResolvedValue(true);

        const response = await request(app)
          .delete('/admin/roles/testrole')
          .send({ _csrf: 'test-csrf-token' });

        expect(response.status).toBe(200);
      });
    });

    describe('GET /admin/notifications', () => {
      test('should return notifications for admin', async () => {
        mockUserManager.getCurrentUser.mockResolvedValue({ username: 'admin' });
        mockUserManager.hasPermission.mockReturnValue(true);

        const response = await request(app).get('/admin/notifications');
        expect(response.status).toBe(200);
      });
    });

    describe('POST /admin/notifications/:id/dismiss', () => {
      test('should dismiss notification for admin', async () => {
        mockUserManager.getCurrentUser.mockResolvedValue({ username: 'admin' });
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
        mockUserManager.getCurrentUser.mockResolvedValue({ username: 'admin' });
        mockUserManager.hasPermission.mockReturnValue(true);

        const response = await request(app)
          .post('/admin/notifications/clear-all')
          .send({ _csrf: 'test-csrf-token' });

        expect(response.status).toBe(302);
      });
    });

    describe('GET /schema/person/:identifier', () => {
      test('should return person schema for admin', async () => {
        mockUserManager.getCurrentUser.mockResolvedValue({ username: 'admin' });
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
        mockUserManager.getCurrentUser.mockResolvedValue({ username: 'admin' });
        mockUserManager.hasPermission.mockReturnValue(true);

        const mockSchemaManager = mockEngine.getManager('SchemaManager');
        mockSchemaManager.getPerson.mockResolvedValue(null);

        const response = await request(app).get('/schema/person/nonexistent');
        expect(response.status).toBe(404);
      });
    });

    describe('GET /schema/organization/:identifier', () => {
      test('should return organization schema for admin', async () => {
        mockUserManager.getCurrentUser.mockResolvedValue({ username: 'admin' });
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