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

// ...existing code...
// Place this after app is initialized and all imports
// (Moved below app initialization)
// ...existing code...
// ...existing code...
// Express app initialization
// ...existing code...

// ...existing code...

// Markdown rendering function
function renderMarkdown(content, pageName) {
  // Expand [{$pagename}] to the current page title
  let expandedContent = content.replace(/\[\{\$pagename\}\]/g, pageName);
  // ReferringPagesPlugin macro expansion
  expandedContent = expandedContent.replace(/\[\{ReferringPagesPlugin([^}]*)\}\]/g, (match, params) => {
    return referringPagesPlugin(pageName, params, linkGraph);
  });
  // ...existing code...

  // Wiki-style link rendering: [PageName] => <a href="/wiki/PageName">PageName</a> if page exists
  // Get all page names from pagesDir
  try {
    const fs = require('fs-extra');
    const path = require('path');
    const pagesDir = path.join(__dirname, 'pages');
    const files = fs.readdirSync(pagesDir);
    const pageNames = files.map(f => f.replace(/\.md$/, ''));
    expandedContent = expandedContent.replace(/\[([a-zA-Z0-9_\- ]+)\]/g, (match, p1) => {
      if (pageNames.includes(p1)) {
        return `<a href="/wiki/${p1}">${p1}</a>`;
      }
      return match;
    });
  } catch (err) {
    // If error, fallback to normal content
  }

  // Convert Markdown to HTML
  let html = converter.makeHtml(expandedContent);
  return html;
}

// Utility to get user keywords from User-Keywords.md
async function getUserKeywords() {
  const userKeywordsFilePath = path.join(pagesDir, 'User-Keywords.md');
  try {
    const content = await fs.readFile(userKeywordsFilePath, 'utf-8');
    const keywordRegex = /^\*\s*(.+)$/gm; // Matches lines starting with * followed by content
    let match;
    const keywords = [];
    while ((match = keywordRegex.exec(content)) !== null) {
      keywords.push(match[1].trim());
    }
    return keywords;
  } catch (err) {
    logger.error('Error reading User-Keywords.md:', err);
    return [];
  }
}


// POST route for saving a page
app.post('/wiki/:page', async (req, res) => {
  const pageName = req.params.page;
  logger.info(`Save page: ${pageName}`);
  logger.info(`Received category: ${req.body.category}`);
  logger.info(`Received userKeywords: ${req.body['userKeywords[]']}, ${req.body.userKeywords}`);
  let content = req.body.content;
  const category = req.body.category;
  let userKeywords = req.body['userKeywords[]'] || req.body.userKeywords || [];
  if (typeof userKeywords === 'string') userKeywords = [userKeywords];
  userKeywords = userKeywords.slice(0, 3); // Limit to 3
  const filePath = path.join(pagesDir, `${pageName}.md`);
  try {
    let data = {};
    const fileExists = await fs.pathExists(filePath);
    if (!fileExists) {
      // Use template for new page
      const templatePath = path.join(__dirname, 'wiki.conf', 'default-page-template.md');
      if (await fs.pathExists(templatePath)) {
        content = await fs.readFile(templatePath, 'utf-8');
      }
    } else {
      const currentContent = await fs.readFile(filePath, 'utf-8');
      const parsed = matter(currentContent);
      data = { ...parsed.data };
    }
    if (!data.uuid) {
      data.uuid = uuidv4();
    }
    if (category) {
      data.category = category;
    } else if (data.category) {
      // Retain existing category if present
    } else {
      data.category = 'Uncategorized';
    }
    data['user-keywords'] = userKeywords;
    // Add new keywords to User-Keywords.md if needed
    const userKeywordsFilePath = path.join(pagesDir, 'User-Keywords.md');
    try {
      const existingKeywords = await getUserKeywords();
      const newKeywords = userKeywords.filter(kw => !existingKeywords.map(k => k.toLowerCase()).includes(kw.toLowerCase()));
      if (newKeywords.length > 0) {
        let fileContent = await fs.readFile(userKeywordsFilePath, 'utf-8');
        newKeywords.forEach(kw => {
          fileContent += `\n* ${kw}`;
        });
        await fs.writeFile(userKeywordsFilePath, fileContent);
      }
    } catch (err) {
      logger.error('Error updating User-Keywords.md:', err);
    }
    const newContent = matter.stringify(content, data);
    // Lint the markdown content
    const lintResults = lint({
      strings: { 'current-page': newContent },
      config: { default: true }
    });
    if (lintResults['current-page'].length > 0) {
      logger.warn(`Markdown linting warnings for ${pageName}.md:`);
      lintResults['current-page'].forEach(result => {
        logger.warn(`  Line ${result.lineNumber}: ${result.ruleDescription} (${result.ruleNames.join('/')})`);
      });
    }
    await fs.writeFile(filePath, newContent);
    await buildLinkGraph(); // Rebuild the link graph
    await buildSearchIndex(); // Rebuild the search index
    res.redirect(`/wiki/${pageName}`);
  } catch (err) {
    logger.error(err);
    res.status(500).send('Error saving page');
  }
});


// Set up view engine
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

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
}

async function buildSearchIndex() {
  const files = await fs.readdir(pagesDir);
  documents = await Promise.all(files.map(async file => {
    const pageName = path.parse(file).name;
    const fileContent = await fs.readFile(path.join(pagesDir, file), 'utf-8');
    const { data, content } = matter(fileContent);
    return {
      name: pageName,
      content: content,
      category: data.category || 'Uncategorized',
      keywords: data.keywords || [],
      'user-keywords': data['user-keywords'] || []
    };
  }));

    searchIndex = lunr(function () {
      this.ref('name');
      this.field('name');
      this.field('content');
      this.field('category');
      this.field('keywords');
      this.field('user-keywords');
  
      documents.forEach(function (doc) {
        this.add(doc);
      }, this);
    });
  }


async function getCategories() {
      const categoriesFilePath = path.join(pagesDir, 'Categories.md');
      try {
        const content = await fs.readFile(categoriesFilePath, 'utf-8');
        const categoryRegex = /^\*\s*(.+)$/gm; // Matches lines starting with * followed by content
        let match;
        const categories = [];
        while ((match = categoryRegex.exec(content)) !== null) {
          categories.push(match[1].trim());
        }
        logger.info('Fetched categories:', categories); // Add this line for debugging
        return categories;
      } catch (err) {
        logger.error('Error reading Categories.md:', err);
        return [];
      }
    }

// Home page - list all pages
// Edit page - show edit form for a wiki page
app.get('/edit/:page', async (req, res) => {
  try {
    const pageName = req.params.page;
    const filePath = path.join(pagesDir, `${pageName}.md`);
    let fileContent = '';
    let data = {};
    let content = '';
    if (await fs.pathExists(filePath)) {
      fileContent = await fs.readFile(filePath, 'utf-8');
      const parsed = matter(fileContent);
      data = parsed.data;
      content = parsed.content;
    }
    // Get all categories and user keywords for dropdowns
    const categories = await getCategories();
    const userKeywords = await getUserKeywords();
    // Get all page names for sidebar navigation
    const files = await fs.readdir(pagesDir);
    const pages = files.map(file => path.parse(file).name);
    // Determine selected category and user keywords for dropdowns
    const selectedCategory = data.category || '';
    const selectedUserKeywords = Array.isArray(data['user-keywords']) ? data['user-keywords'] : [];
    // Prepare metadata for display (all frontmatter except content)
    const metadata = { ...data };
    res.render('edit', {
      pageName,
      content,
      ...data,
      categories,
      userKeywords,
      pages,
      selectedCategory,
      selectedUserKeywords,
      metadata,
      maxUserKeywords: 5
    });
  } catch (err) {
    logger.error(err);
    res.status(500).send('Error loading edit page');
  }
});

app.get('/', async (req, res) => {
      try {
        const files = await fs.readdir(pagesDir);
        const pages = files.map(file => path.parse(file).name);
        res.render('index', { pages });
      } catch (err) {
        logger.error(err);
        res.status(500).send('Error reading pages directory');
      }
    });

  // View a page
  app.get('/wiki/:page', async (req, res) => {
    try {
      const pageName = req.params.page;
      const filePath = path.join(pagesDir, `${pageName}.md`);
      const fileContent = await fs.readFile(filePath, 'utf-8');
      const { data, content } = matter(fileContent);
  const html = renderMarkdown(content, pageName);
  const files = await fs.readdir(pagesDir);
  const pages = files.map(file => path.parse(file).name);
  logger.info(`Rendered HTML for page ${pageName}\n${html}`);
  res.render('view', { pageName, content: html, pages, ...data });
    } catch (err) {
      logger.error(err);
      res.status(500).send('Error rendering page');
    }
  });
// ...existing code...
// The POST route for saving a page should be here, but the code was misplaced. Restore it as:
app.post('/wiki/:page', async (req, res) => {
  const pageName = req.params.page;
  logger.info(`Save page: ${pageName}`);
  logger.info(`Received category: ${req.body.category}`);
  logger.info(`Received userKeywords: ${req.body['userKeywords[]']}, ${req.body.userKeywords}`);
  const content = req.body.content;
  const category = req.body.category;
  let userKeywords = req.body['userKeywords[]'] || req.body.userKeywords || [];
  if (typeof userKeywords === 'string') userKeywords = [userKeywords];
  userKeywords = userKeywords.slice(0, 3); // Limit to 3
  const filePath = path.join(pagesDir, `${pageName}.md`);
  try {
    let data = {};
    const fileExists = await fs.pathExists(filePath);
    if (fileExists) {
      const currentContent = await fs.readFile(filePath, 'utf-8');
      const parsed = matter(currentContent);
      data = { ...parsed.data };
    }
    if (!data.uuid) {
      data.uuid = uuidv4();
    }
    if (category) {
      data.category = category;
    } else if (data.category) {
      // Retain existing category if present
    } else {
      data.category = 'Uncategorized';
    }
    data['user-keywords'] = userKeywords;
    // Add new keywords to User-Keywords.md if needed
    const userKeywordsFilePath = path.join(pagesDir, 'User-Keywords.md');
    try {
      const existingKeywords = await getUserKeywords();
      const newKeywords = userKeywords.filter(kw => !existingKeywords.map(k => k.toLowerCase()).includes(kw.toLowerCase()));
      if (newKeywords.length > 0) {
        let fileContent = await fs.readFile(userKeywordsFilePath, 'utf-8');
        newKeywords.forEach(kw => {
          fileContent += `\n* ${kw}`;
        });
        await fs.writeFile(userKeywordsFilePath, fileContent);
      }
    } catch (err) {
      logger.error('Error updating User-Keywords.md:', err);
    }
    const newContent = matter.stringify(content, data);
    // Lint the markdown content
    const lintResults = lint({
      strings: { 'current-page': newContent },
      config: { default: true }
    });
    if (lintResults['current-page'].length > 0) {
      logger.warn(`Markdown linting warnings for ${pageName}.md:`);
      lintResults['current-page'].forEach(result => {
        logger.warn(`  Line ${result.lineNumber}: ${result.ruleDescription} (${result.ruleNames.join('/')})`);
      });
    }
    await fs.writeFile(filePath, newContent);
    await buildLinkGraph(); // Rebuild the link graph
    await buildSearchIndex(); // Rebuild the search index
    res.redirect(`/wiki/${pageName}`);
  } catch (err) {
    logger.error(err);
    res.status(500).send('Error saving page');
  }
});

  // Search for a page
  app.get('/search', async (req, res) => {
    const query = req.query.q || '';
    const category = req.query.category || '';
    const keyword = req.query.keyword || '';
    let results = [];

    try {
      let searchQuery = query;
      if (category) {
        searchQuery = `${searchQuery} +category:${category}`;
      }
      if (keyword) {
        searchQuery = `${searchQuery} +keywords:${keyword} +user-keywords:${keyword}`;
      }

      // Sanitize query for lunr by removing leading/trailing special chars
      const sanitizedQuery = searchQuery.replace(/[^a-zA-Z0-9\s\-:]+/g, "").trim();
      if (sanitizedQuery) {
        results = searchIndex.search(sanitizedQuery).map(result => {
          const doc = documents.find(d => d.name === result.ref);
          return {
            name: doc.name,
            score: result.score
          };
        });
      }
    } catch (err) {
      // if lunr throws an error, just return no results
      logger.error('Lunr search error:', err);
    }

    try {
      const files = await fs.readdir(pagesDir);
      const pages = files.map(file => path.parse(file).name);
      const categories = [...new Set(documents.map(doc => doc.category))];
      const keywords = [...new Set(documents.flatMap(doc => [...doc.keywords, ...doc['user-keywords']]))];
      res.render('search-results', { results, query, pages, categories, selectedCategory: category, keywords, selectedKeyword: keyword });
    } catch (err) {
      logger.error(err);
      res.status(500).send('Error during search');
    }
  });

  // API endpoint for Markdown preview
  app.post('/api/preview', (req, res) => {
  const markdown = req.body.content || '';
  const pageName = req.body.pageName || '';
  const { content } = matter(markdown);
  const html = renderMarkdown(content, pageName);
  res.json({ html });
  });

  // API endpoint to get all page names
  app.get('/api/pages', async (req, res) => {
    try {
      const files = await fs.readdir(pagesDir);
      const pages = files.map(file => path.parse(file).name);
      res.json(pages);
    } catch (err) {
      console.error(err);
      res.status(500).send('Error reading pages directory');
    }
  });

  // Route to stop server and exit process
  app.get('/STOPP', (req, res) => {
    res.send('Shutting down server...');
    server.close(() => {
      logger.info('Server stopped');
      process.exit(0);
    });
  });

  // Start the server and store the server instance
  const server = app.listen(port, () => {
    logger.info(`Wiki app listening at http://localhost:${port}`);
    buildLinkGraph();
    buildSearchIndex();
  });

  // API endpoint to get all page names for typedown
app.get('/api/page-names', async (req, res) => {
  try {
    const files = await fs.readdir(pagesDir);
    const pages = files.map(file => path.parse(file).name);
    res.json(pages);
  } catch (err) {
    res.status(500).send('Error reading pages directory');
  }
});