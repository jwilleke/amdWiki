const { describe, test, expect, beforeEach } = require('@jest/globals');

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

/**
 * Helper to start server and get dynamic port
 * @param {Express} app - Express application
 * @returns {Promise<{server: Server, port: number}>}
 */
function startServer(expressApp) {
  return new Promise((resolve, reject) => {
    const srv = expressApp.listen(0, () => {
      const addr = srv.address();
      resolve({ server: srv, port: addr.port });
    });
    srv.on('error', reject);
  });
}

/**
 * Helper to close server gracefully
 * @param {Server} server - HTTP server instance
 * @returns {Promise<void>}
 */
function closeServer(server) {
  return new Promise((resolve) => {
    if (server) {
      server.close(() => resolve());
    } else {
      resolve();
    }
  });
}

describe('Maintenance Mode Middleware (PR #18)', () => {
  let server;
  let port;

  beforeEach(() => {
    jest.clearAllMocks();
    // Reset maintenance mode to disabled
    mockWikiEngine.config.features.maintenance.enabled = false;
  });

  afterEach(async () => {
    await closeServer(server);
    server = null;
  });

  test('should allow requests when maintenance mode is disabled', async () => {
    mockWikiEngine.config.features.maintenance.enabled = false;

    const result = await startServer(app);
    server = result.server;
    port = result.port;

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

    const result = await startServer(app);
    server = result.server;
    port = result.port;

    const response = await fetch(`http://localhost:${port}/public/style.css`);
    expect(response.status).toBe(404); // 404 because file doesn't exist, but middleware passed
  });

  test('should block requests when maintenance mode is enabled and no user', async () => {
    mockWikiEngine.config.features.maintenance.enabled = true;
    mockUserManager.getCurrentUser.mockResolvedValue(null);

    const result = await startServer(app);
    server = result.server;
    port = result.port;

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

    const result = await startServer(app);
    server = result.server;
    port = result.port;

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

    const result = await startServer(app);
    server = result.server;
    port = result.port;

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

    const result = await startServer(app);
    server = result.server;
    port = result.port;

    const response = await fetch(`http://localhost:${port}/test`);
    const data = await response.json();

    expect(response.status).toBe(503);
    expect(data.message).toBe('System is currently under maintenance.');
  });

  test('should handle middleware errors gracefully', async () => {
    mockWikiEngine.config.features.maintenance.enabled = true;
    mockUserManager.getCurrentUser.mockRejectedValue(new Error('Database error'));

    const result = await startServer(app);
    server = result.server;
    port = result.port;

    const response = await fetch(`http://localhost:${port}/test`);
    const data = await response.json();

    expect(response.status).toBe(200); // Should continue to next middleware on error
    expect(data).toEqual({
      success: true,
      message: 'Test route works'
    });
  });
});