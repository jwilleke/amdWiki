/**
 * Modern route handlers using manager-based architecture
 */

class WikiRoutes {
  constructor(engine) {
    this.engine = engine;
  }

  /**
   * Get common template data that all pages need
   */
  async getCommonTemplateData() {
    const pageManager = this.engine.getManager('PageManager');
    const pages = await pageManager.getPageNames();
    
    return {
      pages: pages,
      appName: this.engine.getApplicationName()
    };
  }

  /**
   * Extract categories from Categories page
   */
  async getCategories() {
    try {
      const pageManager = this.engine.getManager('PageManager');
      const categoriesPage = await pageManager.getPage('Categories');
      
      if (!categoriesPage) {
        return ['General', 'Documentation'];
      }
      
      // Extract categories from the content (lines that start with *)
      const categories = [];
      const lines = categoriesPage.content.split('\n');
      
      for (const line of lines) {
        const match = line.match(/^\* (.+?) \(/);
        if (match) {
          categories.push(match[1]);
        }
      }
      
      return categories.length > 0 ? categories : ['General', 'Documentation'];
    } catch (err) {
      console.error('Error loading categories:', err);
      return ['General', 'Documentation'];
    }
  }

  /**
   * Extract user keywords from User-Keywords page
   */
  async getUserKeywords() {
    try {
      const pageManager = this.engine.getManager('PageManager');
      const keywordsPage = await pageManager.getPage('User-Keywords');
      
      if (!keywordsPage) {
        return ['General', 'Important', 'Reference'];
      }
      
      // Extract keywords from the content (lines that start with *)
      const keywords = [];
      const lines = keywordsPage.content.split('\n');
      
      for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed.startsWith('* ') && !trimmed.includes('(') && trimmed.length > 2) {
          keywords.push(trimmed.substring(2));
        }
      }
      
      return keywords.length > 0 ? keywords : ['General', 'Important', 'Reference'];
    } catch (err) {
      console.error('Error loading user keywords:', err);
      return ['General', 'Important', 'Reference'];
    }
  }

  /**
   * Display a wiki page
   */
  async viewPage(req, res) {
    try {
      const pageName = req.params.page;
      const pageManager = this.engine.getManager('PageManager');
      const renderingManager = this.engine.getManager('RenderingManager');
      
      // Get common template data
      const commonData = await this.getCommonTemplateData();
      
      // Get page data
      const pageData = await pageManager.getPage(pageName);
      if (!pageData) {
        return res.status(404).render('view', {
          ...commonData,
          title: 'Page Not Found',
          content: `<h1>Page Not Found</h1><p>The page "${pageName}" does not exist.</p>`,
          pageName: pageName,
          exists: false
        });
      }

      // Render the markdown content
      const renderedContent = renderingManager.renderMarkdown(pageData.content, pageName);
      
      // Get referring pages for context
      const referringPages = renderingManager.getReferringPages(pageName);
      
      res.render('view', {
        ...commonData,
        title: pageData.metadata.title || pageName,
        content: renderedContent,
        pageName: pageName,
        metadata: pageData.metadata,
        referringPages: referringPages,
        exists: true
      });
      
    } catch (err) {
      console.error('Error viewing page:', err);
      const commonData = await this.getCommonTemplateData();
      res.status(500).render('view', {
        ...commonData,
        title: 'Error',
        content: '<h1>Error</h1><p>An error occurred while loading the page.</p>',
        pageName: req.params.page,
        exists: false
      });
    }
  }

  /**
   * Display edit form for a page
   */
  async editPage(req, res) {
    try {
      const pageName = req.params.page;
      const pageManager = this.engine.getManager('PageManager');
      
      // Get common template data
      const commonData = await this.getCommonTemplateData();
      
      // Get categories and keywords
      const categories = await this.getCategories();
      const userKeywords = await this.getUserKeywords();
      
      let pageData = await pageManager.getPage(pageName);
      
      // If page doesn't exist, create from template
      if (!pageData) {
        pageData = await pageManager.createPageFromTemplate(pageName);
      }

      // Extract current category and keywords from metadata
      const selectedCategory = pageData.metadata?.category || '';
      const selectedUserKeywords = pageData.metadata?.['user-keywords'] || [];

      res.render('edit', {
        ...commonData,
        title: `Edit ${pageName}`,
        pageName: pageName,
        content: pageData.content,
        metadata: pageData.metadata,
        categories: categories,
        selectedCategory: selectedCategory,
        userKeywords: userKeywords,
        selectedUserKeywords: selectedUserKeywords
      });
      
    } catch (err) {
      console.error('Error loading edit page:', err);
      res.status(500).send('Error loading edit page');
    }
  }

  /**
   * Save a page
   */
  async savePage(req, res) {
    try {
      const pageName = req.params.page;
      const { content, title, category, userKeywords } = req.body;
      
      const pageManager = this.engine.getManager('PageManager');
      const renderingManager = this.engine.getManager('RenderingManager');
      const searchManager = this.engine.getManager('SearchManager');
      
      // Prepare metadata
      const metadata = {
        title: title || pageName,
        category: category || '',
        'user-keywords': Array.isArray(userKeywords) ? userKeywords : (userKeywords ? [userKeywords] : [])
      };
      
      // Save the page
      await pageManager.savePage(pageName, content, metadata);
      
      // Rebuild link graph and search index
      await renderingManager.rebuildLinkGraph();
      await searchManager.rebuildIndex();
      
      res.redirect(`/wiki/${pageName}`);
      
    } catch (err) {
      console.error('Error saving page:', err);
      res.status(500).send('Error saving page');
    }
  }

  /**
   * Search pages
   */
  async searchPages(req, res) {
    try {
      const query = req.query.q || '';
      const searchManager = this.engine.getManager('SearchManager');
      
      // Get common template data
      const commonData = await this.getCommonTemplateData();
      
      let results = [];
      if (query.trim()) {
        results = searchManager.search(query, { maxResults: 20 });
      }
      
      res.render('search-results', {
        ...commonData,
        title: `Search Results for "${query}"`,
        query: query,
        results: results,
        count: results.length
      });
      
    } catch (err) {
      console.error('Error searching:', err);
      res.status(500).send('Error performing search');
    }
  }

  /**
   * API endpoint for search suggestions
   */
  async searchSuggestions(req, res) {
    try {
      const partial = req.query.q || '';
      const searchManager = this.engine.getManager('SearchManager');
      
      const suggestions = searchManager.getSuggestions(partial);
      
      res.json({ suggestions });
      
    } catch (err) {
      console.error('Error getting suggestions:', err);
      res.status(500).json({ error: 'Error getting suggestions' });
    }
  }

  /**
   * Home page - show main index
   */
  async homePage(req, res) {
    try {
      const pageManager = this.engine.getManager('PageManager');
      const renderingManager = this.engine.getManager('RenderingManager');
      
      // Get common template data
      const commonData = await this.getCommonTemplateData();
      
      // Try to load Welcome page, or show page list
      let welcomePage = await pageManager.getPage('Welcome');
      
      if (welcomePage) {
        const renderedContent = renderingManager.renderMarkdown(welcomePage.content, 'Welcome');
        res.render('index', {
          ...commonData,
          title: 'Welcome',
          content: renderedContent,
          showWelcome: true
        });
      } else {
        // Show page list
        const pageNames = await pageManager.getPageNames();
        res.render('index', {
          ...commonData,
          title: 'amdWiki',
          pageNames: pageNames,
          showWelcome: false
        });
      }
      
    } catch (err) {
      console.error('Error loading home page:', err);
      res.status(500).send('Error loading home page');
    }
  }

  /**
   * API endpoint to get page preview
   */
  async previewPage(req, res) {
    try {
      const { content, pageName } = req.body;
      const renderingManager = this.engine.getManager('RenderingManager');
      
      const renderedContent = renderingManager.renderPreview(content, pageName);
      
      res.json({ 
        html: renderedContent,
        success: true 
      });
      
    } catch (err) {
      console.error('Error generating preview:', err);
      res.status(500).json({ 
        error: 'Error generating preview',
        success: false 
      });
    }
  }

  /**
   * Register all routes with Express app
   */
  registerRoutes(app) {
    // Main routes
    app.get('/', this.homePage.bind(this));
    app.get('/wiki/:page', this.viewPage.bind(this));
    app.post('/wiki/:page', this.savePage.bind(this)); // Handle form submissions
    app.get('/edit/:page', this.editPage.bind(this));
    app.post('/edit/:page', this.savePage.bind(this)); // Alternative save route
    app.get('/search', this.searchPages.bind(this));
    
    // API routes
    app.get('/api/suggestions', this.searchSuggestions.bind(this));
    app.post('/api/preview', this.previewPage.bind(this));
    
    console.log('✅ Wiki routes registered');
  }
}

module.exports = WikiRoutes;
