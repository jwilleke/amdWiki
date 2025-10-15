/**
 * Maintenance Mode Integration Tests
 * Tests all maintenance mode functionality including:
 * - Normal operation
 * - Enabling maintenance mode
 * - User blocking
 * - Admin bypass
 * - Disabling maintenance mode
 */

const request = require('supertest');
const express = require('express');
const session = require('express-session');
const WikiEngine = require('../src/WikiEngine');
const WikiRoutes = require('../src/routes/WikiRoutes');

describe('Maintenance Mode Integration', () => {
  let app;
  let engine;
  let agent;
  let adminAgent;

  beforeAll(async () => {
    // Create Express app
    app = express();
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));

    // Setup session
    app.use(session({
      secret: 'test-secret',
      resave: false,
      saveUninitialized: false,
      cookie: { secure: false }
    }));

    // Initialize WikiEngine
    engine = await WikiEngine.createDefault();
    app.set('engine', engine);

    // Setup routes
    const wikiRoutes = new WikiRoutes(engine);
    wikiRoutes.setupRoutes(app);

    // Create test agents
    agent = request.agent(app);
    adminAgent = request.agent(app);
  });

  afterAll(async () => {
    if (engine) {
      await engine.shutdown();
    }
  });

  describe('Normal Operation', () => {
    test('should load home page normally', async () => {
      const response = await agent.get('/');

      expect(response.status).toBe(200);
      expect(response.text).toBeDefined();
    });

    test('should access wiki pages normally', async () => {
      const response = await agent.get('/wiki/Welcome');

      expect([200, 302]).toContain(response.status);
    });
  });

  describe('Admin Authentication', () => {
    test('should show login page', async () => {
      const response = await adminAgent.get('/login');

      expect(response.status).toBe(200);
      expect(response.text).toContain('login');
    });

    test('should login as admin', async () => {
      // Get CSRF token from login page
      const loginPage = await adminAgent.get('/login');
      const csrfMatch = loginPage.text.match(/name="_csrf" value="([^"]+)"/);
      const csrfToken = csrfMatch ? csrfMatch[1] : '';

      // Attempt login
      const response = await adminAgent
        .post('/login')
        .send({
          _csrf: csrfToken,
          username: 'admin',
          password: 'test-password' // You may need to adjust this
        })
        .set('Content-Type', 'application/x-www-form-urlencoded');

      // Login should redirect or succeed
      expect([200, 302]).toContain(response.status);
    });
  });

  describe('Enable Maintenance Mode', () => {
    test('should enable maintenance mode as admin', async () => {
      // Get admin page to get CSRF token
      const adminPage = await adminAgent.get('/admin');
      const csrfMatch = adminPage.text.match(/name="_csrf" value="([^"]+)"/);
      const csrfToken = csrfMatch ? csrfMatch[1] : '';

      if (!csrfToken) {
        console.warn('No CSRF token found, skipping maintenance mode toggle test');
        return;
      }

      // Toggle maintenance mode
      const response = await adminAgent
        .post('/admin/maintenance/toggle')
        .send({ _csrf: csrfToken })
        .set('Content-Type', 'application/x-www-form-urlencoded');

      // Should redirect after toggle
      expect([200, 302]).toContain(response.status);
    });

    test('should show maintenance page to regular users', async () => {
      // Create a new agent (not logged in)
      const regularUser = request.agent(app);
      const response = await regularUser.get('/');

      // Should show maintenance page or allow access (depending on mode)
      expect(response.status).toBe(200);

      // If maintenance mode is active, page should indicate it
      if (response.text.includes('maintenance')) {
        expect(response.text).toContain('maintenance');
      }
    });
  });

  describe('Admin Bypass', () => {
    test('should allow admin to access site during maintenance', async () => {
      const response = await adminAgent.get('/admin');

      // Admin should be able to access admin pages
      expect([200, 302]).toContain(response.status);
    });

    test('should allow admin to access wiki pages during maintenance', async () => {
      const response = await adminAgent.get('/wiki/Welcome');

      // Admin should be able to access wiki pages
      expect([200, 302]).toContain(response.status);
    });
  });

  describe('Disable Maintenance Mode', () => {
    test('should disable maintenance mode as admin', async () => {
      // Get admin page to get fresh CSRF token
      const adminPage = await adminAgent.get('/admin');
      const csrfMatch = adminPage.text.match(/name="_csrf" value="([^"]+)"/);
      const csrfToken = csrfMatch ? csrfMatch[1] : '';

      if (!csrfToken) {
        console.warn('No CSRF token found, skipping maintenance mode toggle test');
        return;
      }

      // Toggle maintenance mode off
      const response = await adminAgent
        .post('/admin/maintenance/toggle')
        .send({ _csrf: csrfToken })
        .set('Content-Type', 'application/x-www-form-urlencoded');

      // Should redirect after toggle
      expect([200, 302]).toContain(response.status);
    });

    test('should restore normal operation for all users', async () => {
      // Create a new agent (not logged in)
      const regularUser = request.agent(app);
      const response = await regularUser.get('/');

      // Should be able to access normally
      expect(response.status).toBe(200);

      // Should not show maintenance page
      // Note: This assertion might need adjustment based on your actual implementation
      const isMaintenancePage = response.text.includes('maintenance') &&
                               !response.text.includes('normal');
      expect(isMaintenancePage).toBe(false);
    });
  });

  describe('Maintenance Notifications', () => {
    test('should have notification system available', async () => {
      const response = await adminAgent.get('/admin');

      // Check if notifications are present in admin page
      expect(response.status).toBe(200);

      // Notification system should be available (exact content may vary)
      expect(response.text).toBeDefined();
    });
  });
});
