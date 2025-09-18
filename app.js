const referringPagesPlugin = require('./plugins/referringPagesPlugin');
const fs = require('fs-extra');
const bodyParser = require('body-parser');
const path = require('path');
const lunr = require('lunr');
const { v4: uuidv4 } = require('uuid');
const matter = require('gray-matter');
const express = require('express');
const session = require('express-session');
const cookieParser = require('cookie-parser');
app = express();
const showdown = require('showdown');

const { lint } = require('markdownlint/sync');
const logger = require('./src/utils/logger');

// Wiki Engine imports
const WikiEngine = require('./src/WikiEngine');
const WikiRoutes = require('./src/routes/WikiRoutes');

// Port will be set from configuration after WikiEngine is initialized
let port = 3000; // Default fallback

// Set up view engine and middleware
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use(cookieParser());

// Session middleware configuration will be set after WikiEngine initialization
// Placeholder for now - will be reconfigured with proper settings
app.use(session({
  secret: 'temporary-secret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false,
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000
  }
}));

// Simple CSRF protection middleware
app.use((req, res, next) => {
  // Skip CSRF check for certain paths
  if (req.path === '/login' && req.method === 'POST') {
    console.log('DEBUG CSRF: Skipping CSRF check for login');
    return next();
  }
  
  // Generate CSRF token for session if it doesn't exist
  if (!req.session.csrfToken) {
    req.session.csrfToken = require('crypto').randomBytes(32).toString('hex');
  }
  
  // Make CSRF token available to templates
  res.locals.csrfToken = req.session.csrfToken;
  
  // For POST requests, validate CSRF token
  if (req.method === 'POST') {
    const token = req.body._csrf || req.headers['x-csrf-token'];
    console.log('DEBUG CSRF: Token from request:', token);
    console.log('DEBUG CSRF: Token from session:', req.session.csrfToken);
    console.log('DEBUG CSRF: Tokens match:', token === req.session.csrfToken);
    
    if (!token || token !== req.session.csrfToken) {
      logger.warn(`CSRF token validation failed for ${req.path} from ${req.ip}`);
      console.log('DEBUG CSRF: Blocking request due to CSRF failure');
      res.status(403).send('CSRF token validation failed');
      return; // Explicit return
    }
    console.log('DEBUG CSRF: Token validation passed');
  }
  
  next();
});

// Maintenance mode middleware
app.use(async (req, res, next) => {
  // Skip maintenance check for static files and API endpoints
  if (req.path.startsWith('/public/') || req.path.startsWith('/js/') || req.path.startsWith('/css/') || req.path === '/favicon.ico') {
    return next();
  }

  try {
    const engine = wikiEngine;
    if (!engine) {
      return next(); // Engine not ready yet
    }

    const config = engine.config;
    const maintenanceEnabled = config?.features?.maintenance?.enabled;

    if (maintenanceEnabled) {
      const userManager = engine.getManager('UserManager');
      const isAdmin = await userManager.isUserInRole(req.session?.userId, 'admin');
      const userId = req.session?.userId || 'anonymous';
      const userIP = req.ip || req.connection.remoteAddress;

      // Allow admins to bypass maintenance mode if configured
      if (config.features.maintenance.allowAdmins && isAdmin) {
        logger.info(`Admin user ${userId} bypassed maintenance mode for ${req.path}`, {
          action: 'maintenance_bypass',
          userId: userId,
          userIP: userIP,
          path: req.path,
          method: req.method,
          timestamp: new Date().toISOString()
        });
        return next();
      }

      // Log blocked access attempt
      logger.warn(`Access blocked by maintenance mode for ${req.path}`, {
        action: 'maintenance_block',
        userId: userId,
        userIP: userIP,
        path: req.path,
        method: req.method,
        userAgent: req.get('User-Agent'),
        isAdmin: isAdmin,
        timestamp: new Date().toISOString()
      });

      // Show maintenance page
      const maintenanceMessage = config.features.maintenance.message || 'System is currently under maintenance.';
      const estimatedDuration = config.features.maintenance.estimatedDuration;
      const allowAdmins = config.features.maintenance.allowAdmins;

      // Get maintenance notifications
      let notifications = [];
      try {
        const notificationManager = engine.getManager('NotificationManager');
        notifications = notificationManager.getAllNotifications()
          .filter(n => n.type === 'maintenance')
          .slice(-3); // Show last 3 maintenance notifications
      } catch (error) {
        console.error('Error fetching maintenance notifications:', error);
      }

      return res.render('maintenance', {
        message: maintenanceMessage,
        estimatedDuration: estimatedDuration,
        allowAdmins: allowAdmins,
        isAdmin: isAdmin,
        notifications: notifications
      });
    }

    next();
  } catch (error) {
    console.error('Maintenance middleware error:', error);
    logger.error('Maintenance middleware error', {
      error: error.message,
      stack: error.stack,
      path: req?.path,
      method: req?.method,
      userIP: req?.ip,
      timestamp: new Date().toISOString()
    });
    next(); // Continue if there's an error
  }
});

// Initialize WikiEngine and Routes
async function initializeWikiEngine() {
  const engine = new WikiEngine();

  // Get configuration values early for initialization
  // Note: ConfigurationManager is initialized during engine.initialize()
  // So we need to use defaults here and reconfigure after
  await engine.initialize({
    applicationName: 'amdWiki',
    baseUrl: 'http://localhost:3000', // Will be updated from config below
    pagesDirectory: path.join(__dirname, 'pages'),
    attachmentsDirectory: path.join(__dirname, 'attachments'),
    exportsDirectory: path.join(__dirname, 'exports'),
    usersDirectory: path.join(__dirname, 'users'),
    templatesDirectory: path.join(__dirname, 'templates')
  });

  // Update runtime configuration from ConfigurationManager
  const configManager = engine.getManager('ConfigurationManager');
  port = configManager.getServerPort();

  // Log the configured values
  console.log(`🔧 Using configured port: ${port}`);
  console.log(`🔧 Using configured baseURL: ${configManager.getBaseURL()}`);

  // Reconfigure logger with config settings
  const config = engine.config;
  console.log('🔧 Checking logger config:', config?.logging);
  if (config?.logging) {
    const { reconfigureLogger } = require('./src/utils/logger');
    const newLogger = reconfigureLogger({
      level: config.logging.level || 'info',
      dir: path.resolve(__dirname, config.logging.dir || './logs'),
      maxSize: config.logging.maxSize || '1MB',
      maxFiles: config.logging.maxFiles || 5
    });

    // Replace the global logger reference
    logger = newLogger;
    console.log('✅ Logger reconfigured with config settings');
    logger.info('Logger successfully reconfigured with config settings');
  } else {
    console.log('⚠️ No logging config found, using defaults');
  }

  const wikiRoutes = new WikiRoutes(engine);
  wikiRoutes.registerRoutes(app);

  console.log('✅ WikiEngine and routes initialized');
  return engine;
}

// Initialize the WikiEngine
let wikiEngine;
initializeWikiEngine().then(engine => {
  wikiEngine = engine;
}).catch(err => {
  console.error('Failed to initialize WikiEngine:', err);
  process.exit(1);
});

// Essential utility functions only (needed for old compatibility)
const pagesDir = path.join(__dirname, 'pages');
const converter = new showdown.Converter();
let linkGraph = {};
let searchIndex;
let documents = [];

async function buildLinkGraph() {
  const newLinkGraph = {};
  const files = await fs.readdir(pagesDir);

  for (const file of files) {
    const pageName = path.parse(file).name;
    if (!newLinkGraph[pageName]) {
      newLinkGraph[pageName] = [];
    }

    const content = await fs.readFile(path.join(pagesDir, file), 'utf-8');

    const linkRegex = / \[([^]]+)\]\((.+?)\)/g;
    let match;
    while ((match = linkRegex.exec(content)) !== null) {
      const linkedPage = match[2] || match[3];
      if (!newLinkGraph[linkedPage]) {
        newLinkGraph[linkedPage] = [];
      }
      if (!newLinkGraph[linkedPage].includes(pageName)) {
        newLinkGraph[linkedPage].push(pageName);
      }
    }

    const simpleLinkRegex = /\[([a-zA-Z0-9\s_-]+)]/g;
    while ((match = simpleLinkRegex.exec(content)) !== null) {
      const linkedPage = match[1];
      if (!newLinkGraph[linkedPage]) {
        newLinkGraph[linkedPage] = [];
      }
      if (!newLinkGraph[linkedPage].includes(pageName)) {
        newLinkGraph[linkedPage].push(pageName);
      }
    }
  }

  linkGraph = newLinkGraph;
  logger.info(`📊 Link graph built with ${Object.keys(linkGraph).length} entries`);
}

async function buildSearchIndex() {
  documents = [];
  const files = await fs.readdir(pagesDir);

  for (const file of files) {
    const pageName = path.parse(file).name;
    const content = await fs.readFile(path.join(pagesDir, file), 'utf-8');
    const { data, content: markdownContent } = matter(content);
    
    documents.push({
      id: pageName,
      title: data.title || pageName,
      content: markdownContent,
      category: data.category || 'Uncategorized'
    });
  }

  searchIndex = lunr(function () {
    this.ref('id');
    this.field('title');
    this.field('content');
    this.field('category');

    documents.forEach(function (doc) {
      this.add(doc);
    }, this);
  });

  logger.info(`🔍 Search index built with ${documents.length} documents`);
}

function renderMarkdown(content, pageName) {
  // Expand [{$pagename}] to the current page title
  let expandedContent = content.replace(/\[\{\$pagename\}\]/g, pageName);
  // ReferringPagesPlugin macro expansion
  expandedContent = expandedContent.replace(/\[\{ReferringPagesPlugin([^}]*)\}\]/g, (match, params) => {
    return referringPagesPlugin(pageName, params, linkGraph);
  });

  // Wiki-style link rendering: [PageName] => <a href="/wiki/PageName">PageName</a> if page exists
  try {
    const files = fs.readdirSync(pagesDir);
    const pageNames = files.map(f => f.replace(/\.md$/, ''));
    
    // Wiki-style link rendering with extended pipe syntax: [DisplayText|Target|Parameters] and simple links [PageName]
    expandedContent = expandedContent.replace(/\[([a-zA-Z0-9\s_-]+)(?:\|([a-zA-Z0-9\s_\-\/ .:?=&]+))?(?:\|([^|\]]+))?\]/g, (match, displayText, target, params) => {
      // Parse parameters if provided
      let linkAttributes = '';
      if (params) {
        // Parse target='_blank' and other attributes
        const targetMatch = params.match(/target=['"]([^'"]+)['"]/);
        if (targetMatch) {
          linkAttributes += ` target="${targetMatch[1]}"`;
          // Add rel="noopener noreferrer" for security when opening in new tab
          if (targetMatch[1] === '_blank') {
            linkAttributes += ' rel="noopener noreferrer"';
          }
        }
        
        // Parse other potential attributes
        const classMatch = params.match(/class=['"]([^'"]+)['"]/);
        if (classMatch) {
          linkAttributes += ` class="${classMatch[1]}"`;
        }
        
        const titleMatch = params.match(/title=['"]([^'"]+)['"]/);
        if (titleMatch) {
          linkAttributes += ` title="${titleMatch[1]}"`;
        }
      }
      
      // If no target specified, it's a simple wiki link
      if (!target) {
        const pageName = displayText;
        if (pageNames.includes(pageName)) {
          return `<a href="/wiki/${encodeURIComponent(pageName)}"${linkAttributes}>${pageName}</a>`;
        } else {
          return `<a href="/edit/${encodeURIComponent(pageName)}" style="color: red;"${linkAttributes}>${pageName}</a>`;
        }
      }
      
      // Handle pipe syntax [DisplayText|Target|Parameters]
      // Check if target is a URL (contains :// or starts with /)
      if (target.includes('://') || target.startsWith('/')) {
        // External URL or absolute path
        return `<a href="${target}"${linkAttributes}>${displayText}</a>`;
      } else if (target.toLowerCase() === 'search') {
        // Special case for Search functionality
        return `<a href="/search"${linkAttributes}>${displayText}</a>`;
      } else {
        // Wiki page target
        if (pageNames.includes(target)) {
          return `<a href="/wiki/${encodeURIComponent(target)}"${linkAttributes}>${displayText}</a>`;
        } else {
          return `<a href="/edit/${encodeURIComponent(target)}" style="color: red;"${linkAttributes}>${displayText}</a>`;
        }
      }
    });
  } catch (err) {
    logger.error('Error checking page existence for wiki links:', err);
  }

  return converter.makeHtml(expandedContent);
}

// Start the server and store the server instance
const server = app.listen(port, () => {
  logger.info(`Wiki app listening at http://localhost:${port}`);
});

// Graceful shutdown endpoint
app.get('/STOPP', (req, res) => {
  res.send('Shutting down server...');
  server.close(() => {
    logger.info('Server stopped');
    process.exit(0);
  });
});
