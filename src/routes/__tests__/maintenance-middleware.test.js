const { describe, test, expect, beforeEach, jest } = require('@jest/globals');

// Mock the WikiEngine and its managers
const mockWikiEngine = {
  config: {
    features: {
      maintenance: {
        enabled: false,
        message: 'System under maintenance',
        allowAdmins: true,
        estimatedDuration: '2 hours'
      }
    }
  }
};

// Mock the UserManager
const mockUserManager = {
  getCurrentUser: jest.fn()
};

// Mock the engine getter
jest.mock('../../WikiEngine', () => ({
  getInstance: jest.fn(() => mockWikiEngine)
}));

// Import the app after setting up mocks
const express = require('express');
const session = require('express-session');
const app = express();

// Setup basic middleware for testing
app.use(express.json());
app.use(session({
  secret: 'test-secret',
  resave: false,
  saveUninitialized: false
}));

// Add maintenance mode middleware (copied from app.js)
app.use(async (req, res, next) => {
  // Skip maintenance check for static files and API endpoints
  if (req.path.startsWith('/public/') ||
      req.path.startsWith('/js/') ||
      req.path.startsWith('/css/') ||
      req.path === '/favicon.ico') {
    return next();
  }

  try {
    const engine = mockWikiEngine;
    if (!engine) {
      return next(); // Engine not ready yet
    }

    const config = engine.config;
    const maintenanceEnabled = config?.features?.maintenance?.enabled;

    if (maintenanceEnabled) {
      // Check if user is admin and admin bypass is allowed
      const currentUser = await mockUserManager.getCurrentUser(req);
      const allowAdmins = config.features.maintenance.allowAdmins;

      if (!allowAdmins || !currentUser) {
        const maintenanceMessage = config.features.maintenance.message || 'System is currently under maintenance.';
        const estimatedDuration = config.features.maintenance.estimatedDuration;

        return res.status(503).json({
          success: false,
          error: 'maintenance_mode',
          message: maintenanceMessage,
          estimatedDuration: estimatedDuration
        });
      }
    }

    next();
  } catch (error) {
    console.error('Maintenance mode middleware error:', error);
    next();
  }
});

// Add a test route
app.get('/test', (req, res) => {
  res.json({ success: true, message: 'Test route works' });
});

describe('Maintenance Mode Middleware (PR #18)', () => {
  let server;
  let port = 3001;

  beforeEach(() => {
    jest.clearAllMocks();
    // Reset maintenance mode to disabled
    mockWikiEngine.config.features.maintenance.enabled = false;
  });

  afterEach((done) => {
    if (server) {
      server.close(done);
    } else {
      done();
    }
  });

  test('should allow requests when maintenance mode is disabled', async () => {
    mockWikiEngine.config.features.maintenance.enabled = false;

    server = app.listen(port);

    const response = await fetch(`http://localhost:${port}/test`);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toEqual({
      success: true,
      message: 'Test route works'
    });
  });

  test('should skip maintenance check for static files', async () => {
    mockWikiEngine.config.features.maintenance.enabled = true;

    server = app.listen(port);

    const response = await fetch(`http://localhost:${port}/public/style.css`);
    expect(response.status).toBe(404); // 404 because file doesn't exist, but middleware passed
  });

  test('should block requests when maintenance mode is enabled and no user', async () => {
    mockWikiEngine.config.features.maintenance.enabled = true;
    mockUserManager.getCurrentUser.mockResolvedValue(null);

    server = app.listen(port);

    const response = await fetch(`http://localhost:${port}/test`);
    const data = await response.json();

    expect(response.status).toBe(503);
    expect(data).toEqual({
      success: false,
      error: 'maintenance_mode',
      message: 'System under maintenance',
      estimatedDuration: '2 hours'
    });
  });

  test('should allow admin users when maintenance mode is enabled and admin bypass allowed', async () => {
    mockWikiEngine.config.features.maintenance.enabled = true;
    mockWikiEngine.config.features.maintenance.allowAdmins = true;
    mockUserManager.getCurrentUser.mockResolvedValue({
      username: 'admin',
      isAuthenticated: true
    });

    server = app.listen(port);

    const response = await fetch(`http://localhost:${port}/test`);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toEqual({
      success: true,
      message: 'Test route works'
    });
  });

  test('should block admin users when admin bypass is disabled', async () => {
    mockWikiEngine.config.features.maintenance.enabled = true;
    mockWikiEngine.config.features.maintenance.allowAdmins = false;
    mockUserManager.getCurrentUser.mockResolvedValue({
      username: 'admin',
      isAuthenticated: true
    });

    server = app.listen(port);

    const response = await fetch(`http://localhost:${port}/test`);
    const data = await response.json();

    expect(response.status).toBe(503);
    expect(data.success).toBe(false);
    expect(data.error).toBe('maintenance_mode');
  });

  test('should use default maintenance message when not configured', async () => {
    mockWikiEngine.config.features.maintenance.enabled = true;
    mockWikiEngine.config.features.maintenance.message = null;
    mockUserManager.getCurrentUser.mockResolvedValue(null);

    server = app.listen(port);

    const response = await fetch(`http://localhost:${port}/test`);
    const data = await response.json();

    expect(response.status).toBe(503);
    expect(data.message).toBe('System is currently under maintenance.');
  });

  test('should handle middleware errors gracefully', async () => {
    mockWikiEngine.config.features.maintenance.enabled = true;
    mockUserManager.getCurrentUser.mockRejectedValue(new Error('Database error'));

    server = app.listen(port);

    const response = await fetch(`http://localhost:${port}/test`);
    const data = await response.json();

    expect(response.status).toBe(200); // Should continue to next middleware on error
    expect(data).toEqual({
      success: true,
      message: 'Test route works'
    });
  });
});