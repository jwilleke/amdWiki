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

const logger = require('./src/utils/logger');
const WikiEngine = require('./src/WikiEngine');
const WikiRoutes = require('./src/routes/WikiRoutes');
const InstallRoutes = require('./src/routes/InstallRoutes');

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
    process.on('SIGTERM', () => { cleanup(); process.exit(0); });
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

// Check for existing instance before starting
checkAndCreatePidLock();

// --- Main Application Bootstrap ---
(async () => {
  const app = express();
  let engine;

  try {
    // 1. Create and initialize the WikiEngine. This is the single source of truth.
    console.log('🚀 Initializing amdWiki Engine...');
    engine = new WikiEngine();
    await engine.initialize(); // Engine now handles its own configuration loading.
    console.log('✅ amdWiki Engine initialized successfully.');

  } catch (error) {
    // Catch any error during engine or manager initialization
    console.error('🔥🔥🔥 FATAL: Failed to initialize amdWiki Engine.');
    console.error(error);
    process.exit(1); // Exit with an error code
  }

  // 2. Setup View Engine and Middleware
  app.set('views', path.join(__dirname, 'views')); // Correct path for views
  app.set('view engine', 'ejs');
  app.set('view cache', false); // Disable template caching for development
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(express.static(path.join(__dirname, 'public')));
  app.use(cookieParser());

  // Install check middleware - must be BEFORE session to allow static assets
  const InstallService = require('./src/services/InstallService');
  const installService = new InstallService(engine);

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
        return res.redirect('/install');
      }
    } catch (error) {
      console.error('Error checking install status:', error);
    }

    next();
  });

  // Setup express-session with file store
  const configManager = engine.getManager('ConfigurationManager');
  const sessionPath = path.join(__dirname, 'data', 'sessions');
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
          isAuthenticated: true
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

  // 4. Register Custom Middleware and Routes

  // Install routes (must be first, before WikiRoutes)
  const installRoutes = new InstallRoutes(engine);
  app.use('/install', installRoutes.getRouter());

  const wikiRoutes = new WikiRoutes(engine);
  wikiRoutes.registerRoutes(app); // This single file handles ALL routes, including auth.

  // 5. Start the Server
  const port = configManager.getProperty('amdwiki.server.port', 3000);
  const hostname = configManager.getProperty('amdwiki.server.host', 'localhost');

  // In Docker, the external port may differ from the internal port
  // Check for EXTERNAL_PORT environment variable set by docker-compose
  const externalPort = process.env.EXTERNAL_PORT ? parseInt(process.env.EXTERNAL_PORT) : port;
  const displayPort = externalPort !== port ? externalPort : port;
  const baseURL = `http://${hostname}:${displayPort}`;

  app.listen(port, async () => {
    console.log('\n' + '='.repeat(60));
    if (externalPort !== port) {
      console.log(`🚀 Running amdWiki on port ${port} (container internal)`);
      console.log(`🌐 External port: ${externalPort}`);
    } else {
      console.log(`🚀 Running amdWiki on port ${port}`);
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
    logger.info(`Wiki app listening at ${baseURL}`);
  });

})();
