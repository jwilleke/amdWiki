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
const logger = require('./logger');

// Wiki Engine imports
const WikiEngine = require('./src/WikiEngine');
const WikiRoutes = require('./src/routes/WikiRoutes');

const port = 3000;

// Set up view engine and middleware
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use(cookieParser());

// Session middleware for authentication
app.use(session({
  secret: 'amdwiki-session-secret-change-in-production',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false, // Set to true in production with HTTPS
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// Initialize WikiEngine and Routes
async function initializeWikiEngine() {
  const engine = new WikiEngine();
  await engine.initialize({
    applicationName: 'amdWiki',
    baseUrl: 'http://localhost:3000',
    pagesDirectory: path.join(__dirname, 'pages'),
    attachmentsDirectory: path.join(__dirname, 'attachments'),
    exportsDirectory: path.join(__dirname, 'exports'),
    usersDirectory: path.join(__dirname, 'users'),
    templatesDirectory: path.join(__dirname, 'templates')
  });
  
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
  buildLinkGraph();
  buildSearchIndex();
});

// Graceful shutdown endpoint
app.get('/STOPP', (req, res) => {
  res.send('Shutting down server...');
  server.close(() => {
    logger.info('Server stopped');
    process.exit(0);
  });
});
