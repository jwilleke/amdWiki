/**
 * @file app.js
 * @description Main application file for the amdWiki Engine.
 */

const path = require('path');
const express = require('express');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const fs = require('fs-extra');

const logger = require('./src/utils/logger');
const WikiEngine = require('./src/WikiEngine');
const WikiRoutes = require('./src/routes/WikiRoutes');

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

  // Setup express-session
  const configManager = engine.getManager('ConfigurationManager');
  app.use(session({
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
      const user = userManager.getUser(req.session.username);
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
  const wikiRoutes = new WikiRoutes(engine);
  wikiRoutes.registerRoutes(app); // This single file handles ALL routes, including auth.

  // 5. Start the Server
  const port = configManager.getProperty('amdwiki.port', 3000);
  app.listen(port, () => {
    logger.info(`Wiki app listening at http://localhost:${port}`);
  });

})();
