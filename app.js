/**
 * @file app.js
 * @description Main application file for the amdWiki Engine.
 */

const path = require('path');
const express = require('express');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const FileStore = require('session-file-store')(session);
const fs = require('fs-extra');

// Require from dist/src/ (pre-compiled TypeScript)
const logger = require('./dist/src/utils/logger').default;
const WikiEngine = require('./dist/src/WikiEngine');
const WikiRoutes = require('./dist/src/routes/WikiRoutes');
const InstallRoutes = require('./dist/src/routes/InstallRoutes');

// --- PID File Lock to Prevent Multiple Instances ---
const PID_FILE = path.join(__dirname, '.amdwiki.pid');

function checkAndCreatePidLock() {
  try {
    // Check if PID file exists
    if (fs.existsSync(PID_FILE)) {
      const existingPid = fs.readFileSync(PID_FILE, 'utf8').trim();

      // Check if the process is actually running
      try {
        process.kill(existingPid, 0); // Signal 0 checks if process exists
        console.error('❌ FATAL: Another instance of amdWiki is already running (PID: ' + existingPid + ')');
        console.error('   If you believe this is an error, delete: ' + PID_FILE);
        process.exit(1);
      } catch (e) {
        // Process doesn't exist, stale PID file - remove it
        console.log('⚠️  Removing stale PID file from previous instance');
        fs.unlinkSync(PID_FILE);
      }
    }

    // Create PID file with current process ID
    fs.writeFileSync(PID_FILE, process.pid.toString());
    console.log('🔒 PID lock created: ' + process.pid);

    // Clean up PID file on exit
    const cleanup = () => {
      try {
        if (fs.existsSync(PID_FILE)) {
          const pidInFile = fs.readFileSync(PID_FILE, 'utf8').trim();
          if (pidInFile === process.pid.toString()) {
            fs.unlinkSync(PID_FILE);
            console.log('🔓 PID lock removed');
          }
        }
      } catch (e) {
        // Ignore cleanup errors
      }
    };

    process.on('exit', cleanup);
    process.on('SIGINT', () => { cleanup(); process.exit(0); });
    process.on('SIGTERM', async () => {
      // Flush any pending page-index writes before exiting so we don't lose pages
      try {
        const pageManager = engineRef && engineRef.getManager ? engineRef.getManager('PageManager') : null;
        if (pageManager && pageManager.flushWriteQueue) {
          await pageManager.flushWriteQueue();
        }
      } catch (e) { /* ignore flush errors during shutdown */ }
      cleanup();
      process.exit(0);
    });
    process.on('uncaughtException', (err) => {
      console.error('Uncaught Exception:', err);
      cleanup();
      process.exit(1);
    });

  } catch (error) {
    console.error('❌ FATAL: Could not create PID lock:', error.message);
    process.exit(1);
  }
}

// Mutable reference populated once the engine is ready — used by the SIGTERM handler
let engineRef = null;

// Check for existing instance before starting
checkAndCreatePidLock();

// --- Main Application Bootstrap ---
(async () => {
  const app = express();
  let engine;
  let engineReady = false;

  // 1. Setup View Engine and static files first so we can serve the maintenance page
  app.set('views', path.join(__dirname, 'views'));
  app.set('view engine', 'ejs');
  app.set('view cache', false);
  app.use(express.static(path.join(__dirname, 'public')));

  // 2. Initialization gate middleware - serves maintenance page while engine starts
  app.use((req, res, next) => {
    if (engineReady) return next();

    // Allow static assets through
    if (req.path.startsWith('/css') || req.path.startsWith('/js') ||
        req.path.startsWith('/images') || req.path === '/favicon.ico' ||
        req.path === '/favicon.svg') {
      return next();
    }

    // Serve maintenance page with 503 status
    return res.status(503).render('maintenance', {
      message: 'The wiki engine is starting up. This may take a moment while pages are indexed.',
      estimatedDuration: null,
      notifications: [],
      allowAdmins: false,
      isAdmin: false
    });
  });

  // 3. Start listening immediately so the server accepts connections during initialization
  // PORT env var takes precedence (for CI, Docker, PaaS platforms like Heroku/Railway)
  const defaultPort = parseInt(process.env.PORT || '3000', 10);
  const defaultHostname = 'localhost';

  app.listen(defaultPort, () => {
    console.log(`🚀 Server listening on port ${defaultPort} (initializing engine...)`);
  });

  // 4. Initialize the WikiEngine in the background
  try {
    console.log('🚀 Initializing amdWiki Engine...');
    engine = new WikiEngine();
    await engine.initialize();
    engineRef = engine; // expose to graceful-shutdown SIGTERM handler
    console.log('✅ amdWiki Engine initialized successfully.');
  } catch (error) {
    console.error('🔥🔥🔥 FATAL: Failed to initialize amdWiki Engine.');
    console.error(error);
    process.exit(1);
  }

  // 5. Now that the engine is ready, set up the remaining middleware and routes
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(cookieParser());

  // Install check middleware - must be BEFORE session to allow static assets
  const InstallService = require('./dist/src/services/InstallService');
  const installService = new InstallService(engine);

  // Check for headless installation mode (Docker/K8s automated deployments)
  const headlessInstall = process.env.HEADLESS_INSTALL === 'true';

  app.use(async (req, res, next) => {
    // Skip check for install routes, static assets, and favicon
    if (req.path.startsWith('/install') ||
        req.path.startsWith('/css') ||
        req.path.startsWith('/js') ||
        req.path.startsWith('/images') ||
        req.path === '/favicon.ico' ||
        req.path === '/favicon.svg') {
      return next();
    }

    // Check if installation is required
    try {
      const installRequired = await installService.isInstallRequired();
      if (installRequired) {
        // Handle headless installation for automated deployments
        if (headlessInstall) {
          console.log('🤖 HEADLESS_INSTALL=true detected, performing automated installation...');
          const result = await installService.processHeadlessInstallation();

          if (result.success) {
            console.log('✅ Headless installation completed successfully');
            console.log(`   - Configs copied: ${result.steps.configsCopied}`);
            console.log(`   - Pages copied: ${result.steps.pagesCopied}`);
            // Continue to normal request handling
            return next();
          } else {
            console.error('❌ Headless installation failed:', result.error);
            return res.status(500).send(`Headless installation failed: ${result.error}`);
          }
        }

        // Standard interactive wizard redirect
        return res.redirect('/install');
      }
    } catch (error) {
      // If we can't determine install status, redirect to /install as safe default
      // Note: /install paths are skipped above, so no loop risk
      console.error('Error checking install status, redirecting to /install:', error.message);
      return res.redirect('/install');
    }

    next();
  });

  // Setup express-session with file store
  const configManager = engine.getManager('ConfigurationManager');
  const sessionPath = configManager.getResolvedDataPath('amdwiki.session.storagedir', './data/sessions');
  await fs.ensureDir(sessionPath);

  app.use(session({
    store: new FileStore({
      path: sessionPath,
      ttl: configManager.getProperty('amdwiki.session.maxAge', 24 * 60 * 60 * 1000) / 1000, // Convert to seconds
      retries: 0,
      reapInterval: 3600 // Clean up expired sessions every hour
    }),
    secret: configManager.getProperty('amdwiki.session.secret', 'amdwiki-session-secret-change-in-production'),
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false, // Set to true in production with HTTPS
      httpOnly: true,
      maxAge: configManager.getProperty('amdwiki.session.maxAge', 24 * 60 * 60 * 1000) // 24 hours
    }
  }));

  // Middleware to attach user context from session
  const debugSession = configManager.getProperty('amdwiki.logging.debug.session', false);

  app.use(async (req, res, next) => {
    // Log all incoming requests for debugging
    console.log(`📨 ${req.method} ${req.url}`);

    const userManager = engine.getManager('UserManager');

    if (debugSession) {
      console.log('[SESSION-DEBUG] Session ID:', req.sessionID);
      console.log('[SESSION-DEBUG] Session data:', JSON.stringify(req.session));
      console.log('[SESSION-DEBUG] Session username:', req.session?.username);
    }

    if (req.session && req.session.username && req.session.isAuthenticated) {
      // Fetch the user from UserManager
      const user = await userManager.getUser(req.session.username);
      if (user && user.isActive) {
        // Build user context
        const roles = new Set(user.roles || []);
        roles.add('Authenticated');
        roles.add('All');

        req.userContext = {
          ...user,
          roles: Array.from(roles),
          isAuthenticated: true,
          authenticated: true  // WikiContext expects this property name
        };
        logger.info(`[SESSION] Restored session for user: ${req.userContext.username}`);
      } else {
        req.userContext = userManager.getAnonymousUser();
        logger.info(`[SESSION] User not found or inactive, treating as Anonymous`);
      }
    } else {
      req.userContext = userManager.getAnonymousUser();
      logger.info(`[SESSION] Restored session for user: Anonymous`);
    }
    next();
  });

  // 5b. HTTP request duration metrics middleware
  const metricsManager = engine.getManager('MetricsManager');
  if (metricsManager && metricsManager.isEnabled()) {
    app.use((req, res, next) => {
      const start = Date.now();
      res.on('finish', () => {
        const route = req.route?.path || req.path
          .replace(/\/wiki\/[^/]+/, '/wiki/:page')
          .replace(/\/edit\/[^/]+/, '/edit/:page');
        metricsManager.recordHttpRequest(Date.now() - start, {
          method: req.method,
          route,
          status: String(res.statusCode)
        });
      });
      next();
    });
  }

  // 6. Admin-triggered maintenance mode middleware
  // Serves maintenance page to non-admin users when maintenance is enabled via admin dashboard
  app.use((req, res, next) => {
    const maintenanceEnabled = engine.config?.features?.maintenance?.enabled;
    if (!maintenanceEnabled) return next();

    // Allow static assets, admin routes, and login through
    if (req.path.startsWith('/css') || req.path.startsWith('/js') ||
        req.path.startsWith('/images') || req.path === '/favicon.ico' ||
        req.path === '/favicon.svg' || req.path.startsWith('/admin') ||
        req.path.startsWith('/login') || req.path.startsWith('/logout')) {
      return next();
    }

    // Allow admins through if configured
    const allowAdmins = engine.config.features.maintenance.allowAdmins !== false;
    if (allowAdmins && req.userContext && req.userContext.roles &&
        req.userContext.roles.includes('admin')) {
      return next();
    }

    const maintenanceConfig = engine.config.features.maintenance;
    return res.status(503).render('maintenance', {
      message: maintenanceConfig.message || 'The system is currently under maintenance.',
      estimatedDuration: maintenanceConfig.estimatedDuration || null,
      notifications: [],
      allowAdmins: allowAdmins,
      isAdmin: req.userContext && req.userContext.roles && req.userContext.roles.includes('admin')
    });
  });

  // 7. Register Routes

  // Install routes (must be first, before WikiRoutes)
  const installRoutes = new InstallRoutes(engine);
  app.use('/install', installRoutes.getRouter());

  const wikiRoutes = new WikiRoutes(engine);
  wikiRoutes.registerRoutes(app);

  // 7b. Admin-protected /metrics endpoint on main app
  if (metricsManager && metricsManager.isEnabled()) {
    const metricsHandler = metricsManager.getMetricsHandler();
    if (metricsHandler) {
      app.get('/metrics', (req, res) => {
        if (!req.userContext || !req.userContext.roles || !req.userContext.roles.includes('admin')) {
          return res.status(403).send('Admin access required');
        }
        return metricsHandler(req, res);
      });
    }
  }

  // 7. Mark engine as ready - requests will now pass through to normal routes
  engineReady = true;

  // Read configured port/hostname now that config is available
  const port = process.env.PORT
    ? parseInt(process.env.PORT, 10)
    : configManager.getProperty('amdwiki.server.port', 3000);
  const hostname = configManager.getProperty('amdwiki.server.host', 'localhost');

  const externalPort = process.env.EXTERNAL_PORT ? parseInt(process.env.EXTERNAL_PORT) : port;
  const displayPort = externalPort !== port ? externalPort : port;
  const baseURL = `http://${hostname}:${displayPort}`;

  console.log('\n' + '='.repeat(60));
  if (externalPort !== port) {
    console.log(`🚀 Running amdWiki on port ${port} (container internal)`);
    console.log(`🌐 External port: ${externalPort}`);
  } else {
    console.log(`🚀 amdWiki Engine ready on port ${port}`);
  }
  console.log(`🌐 Visit: ${baseURL}`);

  // Check if admin is using default password
  const userManager = engine.getManager('UserManager');
  const isDefaultPassword = await userManager.isAdminUsingDefaultPassword();
  if (isDefaultPassword) {
    const defaultPassword = configManager.getProperty('amdwiki.user.security.defaultpassword', 'admin123');
    console.log(`⚠️  Use user 'admin' and password '${defaultPassword}' to login.`);
    console.log(`⚠️  SECURITY WARNING: Change the admin password immediately!`);
  }

  console.log('='.repeat(60) + '\n');
  logger.info(`Wiki engine ready, accepting requests at ${baseURL}`);

})();
