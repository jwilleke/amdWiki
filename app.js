/**
 * @file app.js
 * @description Main application file for the amdWiki Engine.
 */

const path = require('path');
const express = require('express');
const cookieParser = require('cookie-parser');
const session = require('express-session');

const logger = require('./src/utils/logger');
const WikiEngine = require('./src/WikiEngine');
const WikiRoutes = require('./src/routes/WikiRoutes');

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
