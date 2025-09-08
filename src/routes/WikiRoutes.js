/**
 * Modern route handlers using manager-based architecture
 */

class WikiRoutes {
  constructor(engine) {
    this.engine = engine;
  }

  /**
   * Get common template data that all pages need
   * @param {object} userContext - User context for rendering variables
   */
  async getCommonTemplateData(userContext = null) {
    const pageManager = this.engine.getManager('PageManager');
    const pages = await pageManager.getPageNames();
    
    // Load footer content from Footer.md
    let footerContent = null;
    try {
      const footerPage = await pageManager.getPage('Footer');
      if (footerPage && footerPage.content) {
        const renderingManager = this.engine.getManager('RenderingManager');
        const aclManager = this.engine.getManager('ACLManager');
        
        // Remove ACL markup and render footer content with user context
        const cleanContent = aclManager.removeACLMarkup(footerPage.content);
        footerContent = renderingManager.renderMarkdown(cleanContent, 'Footer', userContext);
      }
    } catch (error) {
      console.warn('Could not load footer content:', error.message);
      // Fallback footer content
      footerContent = `<div class="text-center text-muted">
        <small>amdWiki v1.2.0 | Copyright © amdWiki ${new Date().getFullYear()}</small>
      </div>`;
    }
    
    // Load left menu content from LeftMenu.md
    let leftMenuContent = null;
    try {
      const leftMenuPage = await pageManager.getPage('LeftMenu');
      if (leftMenuPage && leftMenuPage.content) {
        const renderingManager = this.engine.getManager('RenderingManager');
        const aclManager = this.engine.getManager('ACLManager');
        
        // Remove ACL markup and render left menu content with user context
        const cleanContent = aclManager.removeACLMarkup(leftMenuPage.content);
        leftMenuContent = renderingManager.renderMarkdown(cleanContent, 'LeftMenu', userContext);
      }
    } catch (error) {
      console.warn('Could not load left menu content:', error.message);
    }
    
    return {
      pages: pages,
      appName: this.engine.getApplicationName(),
      footerContent: footerContent,
      leftMenuContent: leftMenuContent
    };
  }

  /**
   * Get common template data with current user
   */
    async getCommonTemplateDataWithUser(req) {
        const userManager = this.engine.getManager('UserManager');
        const currentUser = req.user ? req.user : await userManager.getCurrentUser(req);
        
        // Get base data with user context for rendering
        const baseData = await this.getCommonTemplateData(currentUser);
        
        return {
            ...baseData,
            currentUser,
            user: currentUser  // Add user alias for consistency
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
        return ['General', 'Documentation', 'Project', 'Reference'];
      }
      
      // Extract categories from the content (lines that start with *)
      const categories = [];
      const lines = categoriesPage.content.split('\n');
      
      for (const line of lines) {
        const match = line.match(/^\* (.+?) \(/);
        if (match) {
          const category = match[1];
          // Exclude admin-only categories from regular user dropdown
          if (category !== 'System/Admin') {
            categories.push(category);
          }
        }
      }
      
      return categories.length > 0 ? categories : ['General', 'Documentation', 'Project', 'Reference'];
    } catch (err) {
      console.error('Error loading categories:', err);
      return ['General', 'Documentation', 'Project', 'Reference'];
    }
  }

  /**
   * Get all categories including admin-only categories
   */
  async getAllCategories() {
    try {
      const pageManager = this.engine.getManager('PageManager');
      const categoriesPage = await pageManager.getPage('Categories');
      
      if (!categoriesPage) {
        return ['General', 'Documentation', 'System/Admin'];
      }
      
      // Extract all categories from the content (lines that start with *)
      const categories = [];
      const lines = categoriesPage.content.split('\n');
      
      for (const line of lines) {
        const match = line.match(/^\* (.+?) \(/);
        if (match) {
          categories.push(match[1]);
        }
      }
      
      // Ensure System/Admin category is always available
      if (!categories.includes('System/Admin')) {
        categories.push('System/Admin');
      }
      
      return categories.length > 0 ? categories : ['General', 'Documentation', 'System/Admin'];
    } catch (err) {
      console.error('Error loading all categories:', err);
      return ['General', 'Documentation', 'System/Admin'];
    }
  }

  /**
   * Extract user keywords from User-Keywords page
   */
  async getUserKeywords() {
    console.log('=== getUserKeywords method called ===');
    try {
      const pageManager = this.engine.getManager('PageManager');
      const keywordsPage = await pageManager.getPage('User Keywords');
      
      console.log('User Keywords page loaded:', !!keywordsPage);
      
      if (!keywordsPage) {
        console.log('No User Keywords page found, returning defaults');
        return ['medicine', 'geology', 'test'];
      }
      
      // Extract keywords from the content (lines that start with *)
      const keywords = [];
      const lines = keywordsPage.content.split('\n');
      
      console.log('Processing', lines.length, 'lines from User Keywords page');
      
      for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed.startsWith('* ') && !trimmed.includes('(') && trimmed.length > 2) {
          // Convert to lowercase and clean up the keyword
          const keyword = trimmed.substring(2).toLowerCase().trim();
          if (keyword && !keywords.includes(keyword)) {
            keywords.push(keyword);
            console.log('Added keyword:', keyword);
          }
        }
      }
      
      console.log('Final getUserKeywords result:', keywords);
      return keywords.length > 0 ? keywords : ['medicine', 'geology', 'test'];
    } catch (err) {
      console.error('Error loading user keywords:', err);
      return ['medicine', 'geology', 'test'];
    }
  }

  /**
   * Render error page with consistent template data
   */
  async renderError(req, res, status, title, message) {
    try {
      const commonData = await this.getCommonTemplateDataWithUser(req);
      return res.status(status).render('error', {
        ...commonData,
        title: title,
        message: message,
        error: { status: status }
      });
    } catch (err) {
      console.error('Error rendering error page:', err);
      return res.status(status).send(`${title}: ${message}`);
    }
  }

  /**
   * Check if a page is a required page (admin-only edit)
   * This checks both hardcoded required pages and pages with System/Admin category
   */
  async isRequiredPage(pageName) {
    // Hardcoded required pages (for backward compatibility)
    const hardcodedRequiredPages = ['Categories', 'Wiki Documentation'];
    if (hardcodedRequiredPages.includes(pageName)) {
      return true;
    }
    
    // Check if page has System/Admin category
    try {
      const pageManager = this.engine.getManager('PageManager');
      const pageData = await pageManager.getPage(pageName);
      if (pageData && pageData.metadata && pageData.metadata.category === 'System/Admin') {
        return true;
      }
    } catch (err) {
      console.error('Error checking page category:', err);
    }
    
    return false;
  }

  /**
   * Get and format left menu content from LeftMenu page
   */
  async getLeftMenu(userContext = null) {
    try {
      const pageManager = this.engine.getManager('PageManager');
      const renderingManager = this.engine.getManager('RenderingManager');
      
      // Try to get LeftMenu page
      const leftMenuPage = await pageManager.getPage('LeftMenu');
      if (!leftMenuPage) {
        return null; // Return null to use fallback
      }
      
      // Render markdown to HTML with user context (this will automatically expand system variables)
      const renderedContent = renderingManager.renderMarkdown(leftMenuPage.content, 'LeftMenu', userContext);
      
      // Format for Bootstrap navigation
      return this.formatLeftMenuContent(renderedContent);
      
    } catch (err) {
      console.error('Error loading left menu:', err);
      return null; // Return null to use fallback
    }
  }

  /**
   * Format left menu content for Bootstrap navigation
   */
  formatLeftMenuContent(content) {
    // Convert basic markdown list to Bootstrap nav structure
    content = content.replace(/<ul>/g, '<ul class="nav flex-column">');
    content = content.replace(/<li>/g, '<li class="nav-item">');
    content = content.replace(/<a href="([^"]*)">/g, '<a class="nav-link" href="$1">');
    
    // Add icons to common menu items
    content = content.replace(/(<a class="nav-link"[^>]*>)Main page/g, '$1<i class="fas fa-home"></i> Main page');
    content = content.replace(/(<a class="nav-link"[^>]*>)About/g, '$1<i class="fas fa-info-circle"></i> About');
    content = content.replace(/(<a class="nav-link"[^>]*>)Find pages/g, '$1<i class="fas fa-search"></i> Find pages');
    content = content.replace(/(<a class="nav-link"[^>]*>)Search/g, '$1<i class="fas fa-search"></i> Search');
    content = content.replace(/(<a class="nav-link"[^>]*>)News/g, '$1<i class="fas fa-newspaper"></i> News');
    content = content.replace(/(<a class="nav-link"[^>]*>)Recent Changes/g, '$1<i class="fas fa-history"></i> Recent Changes');
    content = content.replace(/(<a class="nav-link"[^>]*>)Page Index/g, '$1<i class="fas fa-list"></i> Page Index');
    content = content.replace(/(<a class="nav-link"[^>]*>)SystemInfo/g, '$1<i class="fas fa-server"></i> SystemInfo');
    
    return content;
  }

  /**
   * Display a wiki page
   */
  async viewPage(req, res) {
    try {
      const pageName = req.params.page;
      const pageManager = this.engine.getManager('PageManager');
      const renderingManager = this.engine.getManager('RenderingManager');
      const userManager = this.engine.getManager('UserManager');
      const aclManager = this.engine.getManager('ACLManager');
      
      const currentUser = await userManager.getCurrentUser(req);
      
      // Get page data first (needed for ACL checking)
      const pageData = await pageManager.getPage(pageName);
      if (!pageData) {
        // Check if user can create pages
        const canCreate = currentUser ? 
          userManager.hasPermission(currentUser.username, 'page:create') : 
          userManager.hasPermission(null, 'page:create');
        
        const commonData = await this.getCommonTemplateDataWithUser(req);
        const leftMenuContent = await this.getLeftMenu();
        return res.status(404).render('view', {
          ...commonData,
          title: 'Page Not Found',
          content: `<h1>Page Not Found</h1><p>The page "${pageName}" does not exist.</p>${canCreate ? `<p><a href="/create?name=${encodeURIComponent(pageName)}" class="btn btn-primary">Create Page</a></p>` : ''}`,
          pageName: pageName,
          leftMenuContent: leftMenuContent,
          referringPages: [], // Add missing referringPages
          exists: false,
          canCreate: canCreate
        });
      }

      // Check ACL permission for viewing this page
      const hasViewPermission = await aclManager.checkPagePermission(
        pageName, 'view', currentUser, pageData.content
      );
      
      if (!hasViewPermission) {
        return await this.renderError(req, res, 403, 'Access Denied', 
          'You do not have permission to view this page');
      }
      
      // Get common template data with user
      const commonData = await this.getCommonTemplateDataWithUser(req);

      // Remove ACL markup from content before rendering
      const cleanContent = aclManager.removeACLMarkup(pageData.content);
      
      // Render the markdown content with user context
      const renderedContent = renderingManager.renderMarkdown(cleanContent, pageName, commonData.user);
      
      // Get referring pages for context
      const referringPages = renderingManager.getReferringPages(pageName);
      
      // Get left menu content with user context
      const leftMenuContent = await this.getLeftMenu(commonData.user);
      
      // Check if reader view is requested
      const isReaderView = req.query.view === 'reader';
      const viewTemplate = isReaderView ? 'reader' : 'view';
      
      res.render(viewTemplate, {
        ...commonData,
        title: pageData.metadata.title || pageName,
        content: renderedContent,
        pageName: pageName,
        metadata: pageData.metadata,
        referringPages: referringPages,
        leftMenuContent: leftMenuContent,
        exists: true,
        canEdit: currentUser ? userManager.hasPermission(currentUser.username, 'page:edit') : false,
        canDelete: currentUser ? userManager.hasPermission(currentUser.username, 'page:delete') : false,
        isReaderView: isReaderView
      });
      
    } catch (err) {
      console.error('Error viewing page:', err);
      const commonData = await this.getCommonTemplateDataWithUser(req);
      const leftMenuContent = await this.getLeftMenu();
      res.status(500).render('view', {
        ...commonData,
        title: 'Error',
        content: '<h1>Error</h1><p>An error occurred while loading the page.</p>',
        pageName: req.params.page,
        leftMenuContent: leftMenuContent,
        referringPages: [], // Add missing referringPages
        exists: false
      });
    }
  }

  /**
   * Display create new page form with template selection
   */
  async createPage(req, res) {
    console.log('=== createPage method called ===');
    try {
      const userManager = this.engine.getManager('UserManager');
      const currentUser = req.user ? req.user : await userManager.getCurrentUser(req);
      
      console.log('DEBUG: Session cookie:', req.cookies?.sessionId);
      console.log('DEBUG: Current user:', currentUser);
      
      // Check if user is authenticated
      if (!currentUser) {
        console.log('DEBUG: No current user, redirecting to login');
        return res.redirect('/login?redirect=' + encodeURIComponent('/create'));
      }
      
      // Check if user has permission to create pages
      if (!userManager.hasPermission(currentUser.username, 'page:create')) {
        console.log('DEBUG: User lacks page:create permission');
        return await this.renderError(req, res, 403, 'Access Denied', 'You do not have permission to create pages. Please contact an administrator.');
      }
      
      console.log('DEBUG: User authenticated and authorized, proceeding...');
      
      const pageName = req.query.name || '';
      const templateManager = this.engine.getManager('TemplateManager');
      
      // Get common template data with user context
      const commonData = await this.getCommonTemplateDataWithUser(req);
      
      // Get available templates
      const templates = templateManager.getTemplates();
      
      // Get categories and keywords for the form
      const categories = await this.getCategories();
      const userKeywords = await this.getUserKeywords();
      
      console.log('DEBUG: Categories returned:', categories);
      console.log('DEBUG: User keywords returned:', userKeywords);
      
      res.render('create', {
        ...commonData,
        title: 'Create New Page',
        pageName: pageName,
        templates: templates,
        categories: categories,
        userKeywords: userKeywords
      });
      
    } catch (err) {
      console.error('Error loading create page:', err);
      res.status(500).send('Error loading create page form');
    }
  }

  /**
   * Handle /edit route without page parameter
   */
  async editPageIndex(req, res) {
    try {
      const userManager = this.engine.getManager('UserManager');
      const currentUser = req.user ? req.user : await userManager.getCurrentUser(req);
      
      // Check if user is authenticated
      if (!currentUser) {
        return res.redirect('/login?redirect=' + encodeURIComponent('/edit'));
      }
      
      // Check if user has permission to edit pages
      if (!userManager.hasPermission(currentUser.username, 'page:edit')) {
        return await this.renderError(req, res, 403, 'Access Denied', 'You do not have permission to edit pages. Please contact an administrator.');
      }
      
      // Get all pages for selection
      const pageManager = this.engine.getManager('PageManager');
      const allPages = await pageManager.getAllPages();
      
      // Sort pages alphabetically
      const sortedPages = allPages.sort((a, b) => a.localeCompare(b));
      
      // Get common template data with user context
      const commonData = await this.getCommonTemplateDataWithUser(req);
      
      res.render('edit-index', {
        ...commonData,
        title: 'Select Page to Edit',
        pages: sortedPages
      });
      
    } catch (err) {
      console.error('Error loading edit page index:', err);
      res.status(500).send('Error loading edit page selector');
    }
  }

  /**
   * Create a new page from template
   */
  async createPageFromTemplate(req, res) {
    try {
      const userManager = this.engine.getManager('UserManager');
      const currentUser = req.user ? req.user : await userManager.getCurrentUser(req);
      
      // Check if user is authenticated
      if (!currentUser) {
        return res.redirect('/login?redirect=' + encodeURIComponent('/create'));
      }
      
      // Check if user has permission to create pages
      if (!userManager.hasPermission(currentUser.username, 'page:create')) {
        return await this.renderError(req, res, 403, 'Access Denied', 'You do not have permission to create pages. Please contact an administrator.');
      }
      
      const { pageName, templateName, category, userKeywords } = req.body;
      
      if (!pageName || !templateName) {
        return res.status(400).send('Page name and template are required');
      }
      
      const templateManager = this.engine.getManager('TemplateManager');
      const pageManager = this.engine.getManager('PageManager');
      
      // Check if page already exists
      const existingPage = await pageManager.getPage(pageName);
      if (existingPage) {
        return res.status(409).send('Page already exists');
      }
      
      // Apply template with variables
      const templateVars = {
        pageName: pageName,
        category: category || '',
        userKeywords: Array.isArray(userKeywords) ? userKeywords.join(', ') : (userKeywords || ''),
        date: new Date().toISOString().split('T')[0]
      };
      
      const content = templateManager.applyTemplate(templateName, templateVars);
      
      // Save the new page
      const metadata = {
        title: pageName,
        category: category || '',
        'user-keywords': Array.isArray(userKeywords) ? userKeywords : (userKeywords ? [userKeywords] : [])
      };
      
      await pageManager.savePage(pageName, content, metadata);
      
      // Rebuild search index and link graph
      const renderingManager = this.engine.getManager('RenderingManager');
      const searchManager = this.engine.getManager('SearchManager');
      await renderingManager.rebuildLinkGraph();
      await searchManager.rebuildIndex();
      
      // Redirect to edit the new page
      res.redirect(`/edit/${pageName}`);
      
    } catch (err) {
      console.error('Error creating page from template:', err);
      res.status(500).send('Error creating page');
    }
  }
  async editPage(req, res) {
    try {
      const pageName = req.params.page;
      const pageManager = this.engine.getManager('PageManager');
      const userManager = this.engine.getManager('UserManager');
      const aclManager = this.engine.getManager('ACLManager');
      
      // Get current user
      const currentUser = await userManager.getCurrentUser(req);
      
      // Get page data to check ACL (if page exists)
      let pageData = await pageManager.getPage(pageName);
      
      // Check if this is a required page that needs admin access
      if (await this.isRequiredPage(pageName)) {
        if (!currentUser || !userManager.hasPermission(currentUser.username, 'admin:system')) {
          return await this.renderError(req, res, 403, 'Access Denied', 'Only administrators can edit this page');
        }
      } else {
        // For existing pages, check ACL edit permission
        if (pageData) {
          const hasEditPermission = await aclManager.checkPagePermission(
            pageName, 'edit', currentUser, pageData.content
          );
          
          if (!hasEditPermission) {
            return await this.renderError(req, res, 403, 'Access Denied', 
              'You do not have permission to edit this page');
          }
        } else {
          // For new pages, check general page creation permission
          if (!currentUser || !userManager.hasPermission(currentUser.username, 'page:create')) {
            return await this.renderError(req, res, 403, 'Access Denied', 'You do not have permission to create pages');
          }
        }
      }
      
      // Get common template data with user context
      const commonData = await this.getCommonTemplateDataWithUser(req);
      
      // Get categories and keywords - use all categories for admin editing required pages
      const isAdmin = currentUser && userManager.hasPermission(currentUser.username, 'admin:system');
      const isRequired = await this.isRequiredPage(pageName);
      const categories = (isRequired && isAdmin) ? 
        await this.getAllCategories() : 
        await this.getCategories();
      const userKeywords = await this.getUserKeywords();
      
      // If page doesn't exist, generate template data without saving
      if (!pageData) {
        pageData = await pageManager.generateTemplateData(pageName);
      }

      // Ensure content is a string for ACL processing
      if (!pageData.content || typeof pageData.content !== 'string') {
        pageData.content = '';
      }

      // Remove ACL markup from content for editing
      const cleanContent = aclManager.removeACLMarkup(pageData.content);
      pageData.content = cleanContent;

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
      const userManager = this.engine.getManager('UserManager');
      const aclManager = this.engine.getManager('ACLManager');
      
      // Get current user
      const currentUser = await userManager.getCurrentUser(req);
      
      // Get existing page data for ACL checking
      const existingPage = await pageManager.getPage(pageName);
      
      // Prepare metadata first to check the category
      const metadata = {
        title: title || pageName,
        category: category || '',
        'user-keywords': Array.isArray(userKeywords) ? userKeywords : (userKeywords ? [userKeywords] : [])
      };
      
      // Check if this is or will become a required page that needs admin access
      const isCurrentlyRequired = await this.isRequiredPage(pageName);
      const willBeRequired = await pageManager.isRequiredPage(pageName, metadata);
      
      if (isCurrentlyRequired || willBeRequired) {
        if (!currentUser || !userManager.hasPermission(currentUser.username, 'admin:system')) {
          return await this.renderError(req, res, 403, 'Access Denied', 'Only administrators can edit this page or assign System/Admin category');
        }
      } else {
        // For existing pages, check ACL edit permission
        if (existingPage) {
          const hasEditPermission = await aclManager.checkPagePermission(
            pageName, 'edit', currentUser, existingPage.content
          );
          
          if (!hasEditPermission) {
            return await this.renderError(req, res, 403, 'Access Denied', 
              'You do not have permission to edit this page');
          }
        } else {
          // For new pages, check general page creation permission
          if (!currentUser || !userManager.hasPermission(currentUser.username, 'page:create')) {
            return await this.renderError(req, res, 403, 'Access Denied', 'You do not have permission to create pages');
          }
        }
      }
      
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
   * Delete a page
   */
  async deletePage(req, res) {
    try {
      const pageName = req.params.page;
      console.log(`🗑️ Delete request received for page: ${pageName}`);
      
      const pageManager = this.engine.getManager('PageManager');
      const renderingManager = this.engine.getManager('RenderingManager');
      const searchManager = this.engine.getManager('SearchManager');
      const userManager = this.engine.getManager('UserManager');
      const aclManager = this.engine.getManager('ACLManager');
      
      // Get current user
      const currentUser = await userManager.getCurrentUser(req);
      
      // Check if page exists
      const pageData = await pageManager.getPage(pageName);
      if (!pageData) {
        console.log(`❌ Page not found: ${pageName}`);
        return res.status(404).send('Page not found');
      }
      
      // Check if this is a required page that needs admin access
      if (await this.isRequiredPage(pageName)) {
        if (!currentUser || !userManager.hasPermission(currentUser.username, 'admin:system')) {
          return await this.renderError(req, res, 403, 'Access Denied', 'Only administrators can delete this page');
        }
      } else {
        // Check ACL delete permission
        const hasDeletePermission = await aclManager.checkPagePermission(
          pageName, 'delete', currentUser, pageData.content
        );
        
        if (!hasDeletePermission) {
          return await this.renderError(req, res, 403, 'Access Denied', 
            'You do not have permission to delete this page');
        }
      }
      
      console.log(`✅ Page found, proceeding to delete: ${pageName}`);
      
      // Delete the page
      const deleteResult = await pageManager.deletePage(pageName);
      console.log(`🗑️ Delete result: ${deleteResult}`);
      
      if (deleteResult) {
        // Rebuild link graph and search index after deletion
        console.log(`🔄 Rebuilding indexes after deletion...`);
        await renderingManager.rebuildLinkGraph();
        await searchManager.rebuildIndex();
        
        console.log(`✅ Page deleted successfully: ${pageName}`);
        
        // Redirect to home page
        res.redirect('/');
      } else {
        console.log(`❌ Failed to delete page: ${pageName}`);
        res.status(500).send('Failed to delete page');
      }
      
    } catch (err) {
      console.error('❌ Error deleting page:', err);
      res.status(500).send('Error deleting page');
    }
  }

  /**
   * Search pages with advanced options
   */
  async searchPages(req, res) {
    try {
      const query = req.query.q || '';
      
      // Handle multiple categories and keywords
      let categories = req.query.category || [];
      if (typeof categories === 'string') categories = [categories];
      categories = categories.filter(cat => cat.trim() !== '');
      
      let userKeywords = req.query.keywords || [];
      if (typeof userKeywords === 'string') userKeywords = [userKeywords];
      userKeywords = userKeywords.filter(kw => kw.trim() !== '');
      
      // Handle multiple searchIn values
      let searchIn = req.query.searchIn || ['all'];
      if (typeof searchIn === 'string') searchIn = [searchIn];
      searchIn = searchIn.filter(si => si.trim() !== '');
      if (searchIn.length === 0) searchIn = ['all'];
      
      const searchManager = this.engine.getManager('SearchManager');
      
      // Get common template data with user context
      const commonData = await this.getCommonTemplateDataWithUser(req);
      
      let results = [];
      let searchType = 'text';

      // Determine search type and perform search
      if (query.trim() || categories.length > 0 || userKeywords.length > 0) {
        if (categories.length > 0 && !query && userKeywords.length === 0) {
          // Category-only search
          results = searchManager.searchByCategories ? 
                   searchManager.searchByCategories(categories) : 
                   searchManager.searchByCategory(categories[0]);
          searchType = 'category';
        } else if (userKeywords.length > 0 && !query && categories.length === 0) {
          // Keywords-only search
          results = searchManager.searchByUserKeywordsList ? 
                   searchManager.searchByUserKeywordsList(userKeywords) : 
                   searchManager.searchByUserKeywords(userKeywords[0]);
          searchType = 'keywords';
        } else {
          // Advanced search with multiple criteria
          results = searchManager.advancedSearch({
            query: query,
            categories: categories,
            userKeywords: userKeywords,
            searchIn: searchIn,
            maxResults: 50
          });
          searchType = 'advanced';
        }
      }

      // Get available categories and keywords for dropdowns
      const availableCategories = searchManager.getAllCategories();
      const availableKeywords = searchManager.getAllUserKeywords();
      
      // Get search statistics
      const stats = searchManager.getStatistics();

      res.render('search-results', {
        ...commonData,
        title: 'Search Results',
        query: query,
        category: categories.length === 1 ? categories[0] : '', // For backward compatibility
        categories: categories,
        userKeywords: userKeywords.length === 1 ? userKeywords[0] : '', // For backward compatibility
        userKeywordsList: userKeywords,
        searchIn: searchIn.length === 1 ? searchIn[0] : searchIn,
        results: results,
        count: results.length,
        searchType: searchType,
        availableCategories: availableCategories,
        availableKeywords: availableKeywords,
        stats: stats
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
   * API endpoint for getting all page names
   */
  async getPageNames(req, res) {
    try {
      const pageManager = this.engine.getManager('PageManager');
      const pageNames = await pageManager.getPageNames();
      
      res.json(pageNames);
      
    } catch (err) {
      console.error('Error getting page names:', err);
      res.status(500).json({ error: 'Error getting page names' });
    }
  }

  /**
   * Home page - show main index
   */
  async homePage(req, res) {
    // Redirect to Welcome page instead of rendering a separate home page
    res.redirect('/wiki/Welcome');
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
   * Upload attachment for a page
   */
  async uploadAttachment(req, res) {
    try {
      const { page: pageName } = req.params;
      const attachmentManager = this.engine.getManager('AttachmentManager');
      
      if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
      }
      
      const attachment = await attachmentManager.uploadAttachment(pageName, req.file);
      
      res.json({
        success: true,
        attachment: attachment,
        message: 'File uploaded successfully'
      });
      
    } catch (err) {
      console.error('Error uploading attachment:', err);
      res.status(500).json({
        success: false,
        error: err.message || 'Error uploading file'
      });
    }
  }

  /**
   * Serve attachment file
   */
  async serveAttachment(req, res) {
    try {
      const { attachmentId } = req.params;
      const attachmentManager = this.engine.getManager('AttachmentManager');
      
      const attachment = attachmentManager.getAttachment(attachmentId);
      if (!attachment) {
        return res.status(404).send('Attachment not found');
      }
      
      res.setHeader('Content-Type', attachment.mimeType);
      res.setHeader('Content-Disposition', `inline; filename="${attachment.originalName}"`);
      res.sendFile(path.resolve(attachment.path));
      
    } catch (err) {
      console.error('Error serving attachment:', err);
      res.status(500).send('Error serving attachment');
    }
  }

  /**
   * Delete attachment
   */
  async deleteAttachment(req, res) {
    try {
      const { attachmentId } = req.params;
      const attachmentManager = this.engine.getManager('AttachmentManager');
      
      await attachmentManager.deleteAttachment(attachmentId);
      
      res.json({
        success: true,
        message: 'Attachment deleted successfully'
      });
      
    } catch (err) {
      console.error('Error deleting attachment:', err);
      res.status(500).json({
        success: false,
        error: err.message || 'Error deleting attachment'
      });
    }
  }

  /**
   * Export page selection form
   */
  async exportPage(req, res) {
    try {
      const commonData = await this.getCommonTemplateData();
      const pageManager = this.engine.getManager('PageManager');
      const pageNames = await pageManager.getPageNames();
      
      res.render('export', {
        ...commonData,
        title: 'Export Pages',
        pageNames: pageNames
      });
      
    } catch (err) {
      console.error('Error loading export page:', err);
      res.status(500).send('Error loading export page');
    }
  }

  /**
   * Export page to HTML
   */
  async exportPageHtml(req, res) {
    try {
      const { page: pageName } = req.params;
      const exportManager = this.engine.getManager('ExportManager');
      
      const html = await exportManager.exportPageToHtml(pageName);
      
      res.setHeader('Content-Type', 'text/html');
      res.setHeader('Content-Disposition', `attachment; filename="${pageName}.html"`);
      res.send(html);
      
    } catch (err) {
      console.error('Error exporting to HTML:', err);
      res.status(500).send('Error exporting page');
    }
  }

  /**
   * Export page to Markdown
   */
  async exportPageMarkdown(req, res) {
    try {
      const { page: pageName } = req.params;
      const exportManager = this.engine.getManager('ExportManager');
      
      const markdown = await exportManager.exportToMarkdown(pageName);
      
      res.setHeader('Content-Type', 'text/markdown');
      res.setHeader('Content-Disposition', `attachment; filename="${pageName}.md"`);
      res.send(markdown);
      
    } catch (err) {
      console.error('Error exporting to Markdown:', err);
      res.status(500).send('Error exporting page');
    }
  }

  /**
   * List available exports
   */
  async listExports(req, res) {
    try {
      const commonData = await this.getCommonTemplateData();
      const exportManager = this.engine.getManager('ExportManager');
      const exports = await exportManager.getExports();
      
      res.render('exports', {
        ...commonData,
        title: 'Exports',
        exports: exports
      });
      
    } catch (err) {
      console.error('Error listing exports:', err);
      res.status(500).send('Error listing exports');
    }
  }

  /**
   * Download export file
   */
  async downloadExport(req, res) {
    try {
      const { filename } = req.params;
      const exportManager = this.engine.getManager('ExportManager');
      const exports = await exportManager.getExports();
      
      const exportFile = exports.find(e => e.filename === filename);
      if (!exportFile) {
        return res.status(404).send('Export not found');
      }
      
      res.download(exportFile.path, filename);
      
    } catch (err) {
      console.error('Error downloading export:', err);
      res.status(500).send('Error downloading export');
    }
  }

  /**
   * Login page
   */
  async loginPage(req, res) {
    try {
      const userManager = this.engine.getManager('UserManager');
      const currentUser = userManager.getCurrentUser(req);
      
      // Redirect if already logged in
      if (currentUser && currentUser.isAuthenticated) {
        const redirect = req.query.redirect || '/';
        return res.redirect(redirect);
      }
      
      const commonData = await this.getCommonTemplateData();
      
      res.render('login', {
        ...commonData,
        title: 'Login',
        error: req.query.error,
        redirect: req.query.redirect
      });
      
    } catch (err) {
      console.error('Error loading login page:', err);
      res.status(500).send('Error loading login page');
    }
  }

  /**
   * Process login
   */
  async processLogin(req, res) {
    try {
      const { username, password, redirect = '/' } = req.body;
      const userManager = this.engine.getManager('UserManager');
      
      console.log('DEBUG: Login attempt for:', username);
      console.log('DEBUG: Redirect parameter:', redirect);
      
      const user = await userManager.authenticateUser(username, password);
      if (!user) {
        console.log('DEBUG: Authentication failed for:', username);
        return res.redirect('/login?error=Invalid username or password&redirect=' + encodeURIComponent(redirect));
      }
      
      const sessionId = userManager.createSession(user);
      console.log('DEBUG: Created session:', sessionId);
      
      // Set session cookie
      res.cookie('sessionId', sessionId, {
        httpOnly: true,
        secure: false, // Set to true in production with HTTPS
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
        path: '/',
        sameSite: 'lax'
      });
      
      console.log(`👤 User logged in: ${username}`);
      console.log('DEBUG: Redirecting to:', redirect);
      res.redirect(redirect);
      
    } catch (err) {
      console.error('Error processing login:', err);
      res.redirect('/login?error=Login failed');
    }
  }

  /**
   * Process logout
   */
  async processLogout(req, res) {
    try {
      const userManager = this.engine.getManager('UserManager');
      const sessionId = req.cookies?.sessionId;
      
      if (sessionId) {
        userManager.destroySession(sessionId);
        res.clearCookie('sessionId');
      }
      
      res.redirect('/');
      
    } catch (err) {
      console.error('Error processing logout:', err);
      res.redirect('/');
    }
  }

  /**
   * User info debug page (shows current user state)
   */
  async userInfo(req, res) {
    try {
      const userManager = this.engine.getManager('UserManager');
      const currentUser = await userManager.getCurrentUser(req);
      const sessionId = req.cookies?.sessionId;
      const session = sessionId ? userManager.getSession(sessionId) : null;
      
      const info = {
        currentUser: currentUser,
        sessionId: sessionId,
        sessionExists: !!session,
        sessionExpired: sessionId && !session,
        userType: !currentUser ? 'No User/Anonymous' : 
                 currentUser.username === 'anonymous' ? 'Anonymous' :
                 currentUser.username === 'asserted' ? 'Asserted (has cookie)' :
                 currentUser.isAuthenticated ? 'Authenticated' : 'Unknown',
        hasSessionCookie: !!sessionId,
        permissions: currentUser ? userManager.getUserPermissions(currentUser.username) : 
                    userManager.hasPermission(null, 'page:read') ? ['anonymous permissions'] : []
      };
      
      res.json(info);
      
    } catch (err) {
      console.error('Error getting user info:', err);
      res.status(500).json({ error: err.message });
    }
  }

  /**
   * Registration page
   */
  async registerPage(req, res) {
    try {
      const commonData = await this.getCommonTemplateData();
      
      res.render('register', {
        ...commonData,
        title: 'Register',
        error: req.query.error
      });
      
    } catch (err) {
      console.error('Error loading register page:', err);
      res.status(500).send('Error loading register page');
    }
  }

  /**
   * Process registration
   */
  async processRegister(req, res) {
    try {
      const { username, email, displayName, password, confirmPassword } = req.body;
      const userManager = this.engine.getManager('UserManager');
      
      // Validation
      if (!username || !email || !password) {
        return res.redirect('/register?error=All fields are required');
      }
      
      if (password !== confirmPassword) {
        return res.redirect('/register?error=Passwords do not match');
      }
      
      if (password.length < 6) {
        return res.redirect('/register?error=Password must be at least 6 characters');
      }
      
      const user = await userManager.createUser({
        username,
        email,
        displayName: displayName || username,
        password,
        roles: ['reader'], // Default role
        isExternal: false // Local user
      });
      
      console.log(`👤 User registered: ${username}`);
      res.redirect('/login?success=Registration successful');
      
    } catch (err) {
      console.error('Error processing registration:', err);
      const errorMessage = err.message || 'Registration failed';
      res.redirect('/register?error=' + encodeURIComponent(errorMessage));
    }
  }

  /**
   * User profile page
   */
  async profilePage(req, res) {
    console.log('DEBUG: profilePage accessed');
    try {
      const userManager = this.engine.getManager('UserManager');
      const currentUser = userManager.getCurrentUser(req);
      
      console.log('DEBUG: currentUser from userManager:', currentUser ? currentUser.username : 'null');
      
      if (!currentUser) {
        console.log('DEBUG: No current user, redirecting to login');
        return res.redirect('/login?redirect=/profile');
      }
      
      // Get fresh user data from database to ensure we have latest preferences
      const freshUser = userManager.getUser(currentUser.username);
      console.log('DEBUG: profilePage - fresh user preferences:', freshUser ? freshUser.preferences : 'no fresh user');
      
      const commonData = await this.getCommonTemplateData();
      const userPermissions = userManager.getUserPermissions(currentUser.username);
      
      res.render('profile', {
        ...commonData,
        title: 'Profile',
        user: freshUser || currentUser, // Use fresh user data if available
        permissions: userPermissions,
        error: req.query.error,
        success: req.query.success
      });
      
    } catch (err) {
      console.error('Error loading profile page:', err);
      res.status(500).send('Error loading profile page');
    }
  }

  /**
   * Update user profile
   */
  async updateProfile(req, res) {
    try {
      const userManager = this.engine.getManager('UserManager');
      const currentUser = userManager.getCurrentUser(req);
      
      if (!currentUser) {
        return res.redirect('/login');
      }
      
      const { displayName, email, currentPassword, newPassword, confirmPassword } = req.body;
      const updates = {};
      
      if (displayName) updates.displayName = displayName;
      if (email) updates.email = email;
      
      // Handle password change for local users only
      if (newPassword && !currentUser.isExternal) {
        if (!currentPassword) {
          return res.redirect('/profile?error=Current password required to change password');
        }
        
        if (newPassword !== confirmPassword) {
          return res.redirect('/profile?error=New passwords do not match');
        }
        
        if (newPassword.length < 6) {
          return res.redirect('/profile?error=Password must be at least 6 characters');
        }
        
        // Verify current password
        const isValidPassword = await userManager.authenticateUser(currentUser.username, currentPassword);
        if (!isValidPassword) {
          return res.redirect('/profile?error=Current password is incorrect');
        }
        
        updates.password = newPassword;
      } else if (newPassword && currentUser.isExternal) {
        return res.redirect('/profile?error=Cannot change password for OAuth accounts');
      }
      
      await userManager.updateUser(currentUser.username, updates);
      
      res.redirect('/profile?success=Profile updated successfully');
      
    } catch (err) {
      console.error('Error updating profile:', err);
      res.redirect('/profile?error=Failed to update profile');
    }
  }

  /**
   * Update user preferences
   */
  async updatePreferences(req, res) {
    console.log('=== updatePreferences method called ===');
    try {
      console.log('DEBUG: Request body:', req.body);
      const userManager = this.engine.getManager('UserManager');
      const currentUser = userManager.getCurrentUser(req);
      
      console.log('DEBUG: Current user:', currentUser ? currentUser.username : 'null');
      
      if (!currentUser) {
        console.log('DEBUG: No current user, redirecting to login');
        return res.redirect('/login');
      }
      
      console.log('DEBUG: updatePreferences - req.body:', req.body);
      console.log('DEBUG: updatePreferences - currentUser:', currentUser.username);
      
      // Get current user's existing preferences
      const currentPreferences = currentUser.preferences || {};
      console.log('DEBUG: updatePreferences - current preferences:', currentPreferences);
      
      // Extract preference values from form and merge with existing
      const preferences = { ...currentPreferences };
      
      // Editor preferences
      preferences['editor.plain.smartpairs'] = req.body['editor.plain.smartpairs'] === 'on';
      preferences['editor.autoindent'] = req.body['editor.autoindent'] === 'on';
      preferences['editor.linenumbers'] = req.body['editor.linenumbers'] === 'on';
      preferences['editor.theme'] = req.body['editor.theme'] || 'default';
      
      // Display preferences
      preferences['display.pagesize'] = req.body['display.pagesize'] || '25';
      preferences['display.tooltips'] = req.body['display.tooltips'] === 'on';
      preferences['display.readermode'] = req.body['display.readermode'] === 'on';
      preferences['display.dateformat'] = req.body['display.dateformat'] || 'default';
      preferences['display.theme'] = req.body['display.theme'] || 'system';
      
      console.log('DEBUG: updatePreferences - preferences to save:', preferences);
      
      // Update user with new preferences
      await userManager.updateUser(currentUser.username, { preferences });
      
      console.log('DEBUG: updatePreferences - preferences saved successfully');
      res.redirect('/profile?success=Preferences saved successfully');
      
    } catch (err) {
      console.error('Error updating preferences:', err);
      res.redirect('/profile?error=Failed to save preferences');
    }
  }

  /**
   * Admin dashboard
   */
  async adminDashboard(req, res) {
    try {
      const userManager = this.engine.getManager('UserManager');
      const currentUser = await userManager.getCurrentUser(req);
      
      if (!currentUser || !userManager.hasPermission(currentUser.username, 'admin:system')) {
        return await this.renderError(req, res, 403, 'Access Denied', 'You do not have permission to access the admin dashboard');
      }
      
      const commonData = await this.getCommonTemplateDataWithUser(req);
      const users = userManager.getUsers();
      const roles = userManager.getRoles();
      
      // Get all required pages for the admin dashboard
      const pageManager = this.engine.getManager('PageManager');
      const allPageNames = await pageManager.getPageNames();
      const requiredPages = [];
      
      for (const pageName of allPageNames) {
        if (await this.isRequiredPage(pageName)) {
          requiredPages.push(pageName);
        }
      }
      
      // Gather system statistics
      const stats = {
        totalUsers: users.length,
        uptime: Math.floor(process.uptime()) + ' seconds',
        version: '1.0.0'
      };
      
      // Mock recent activity (in a real implementation, this would come from logs)
      const recentActivity = [
        { timestamp: new Date().toLocaleString(), description: 'User logged in: ' + currentUser.username },
        { timestamp: new Date(Date.now() - 60000).toLocaleString(), description: 'System started' }
      ];
      
      const templateData = {
        ...commonData,
        title: 'Admin Dashboard',
        users: users,
        roles: roles,
        userCount: users.length,
        roleCount: roles.length,
        stats: stats,
        recentActivity: recentActivity,
        requiredPages: requiredPages
      };
      
      res.render('admin-dashboard', templateData);
      
    } catch (err) {
      console.error('Error loading admin dashboard:', err);
      res.status(500).send('Error loading admin dashboard');
    }
  }

  /**
   * Admin users management
   */
  async adminUsers(req, res) {
    try {
      const userManager = this.engine.getManager('UserManager');
      const currentUser = await userManager.getCurrentUser(req);
      
      if (!currentUser || !userManager.hasPermission(currentUser.username, 'admin:users')) {
        return await this.renderError(req, res, 403, 'Access Denied', 'You do not have permission to access user management');
      }
      
      const commonData = await this.getCommonTemplateDataWithUser(req);
      const users = userManager.getUsers();
      const roles = userManager.getRoles();
      
      res.render('admin-users', {
        ...commonData,
        title: 'User Management',
        users: users,
        roles: roles,
        successMessage: req.query.success || null,
        errorMessage: req.query.error || null
      });
      
    } catch (err) {
      console.error('Error loading admin users:', err);
      res.status(500).send('Error loading user management');
    }
  }

  /**
   * Create new user (admin)
   */
  async adminCreateUser(req, res) {
    try {
      const userManager = this.engine.getManager('UserManager');
      const currentUser = await userManager.getCurrentUser(req);
      
      if (!currentUser || !userManager.hasPermission(currentUser.username, 'admin:users')) {
        return res.status(403).send('Access denied');
      }
      
      const { username, email, displayName, password, roles } = req.body;
      
      const success = await userManager.createUser({
        username,
        email,
        displayName,
        password,
        roles: Array.isArray(roles) ? roles : [roles]
      });
      
      if (success) {
        res.redirect('/admin/users?success=User created successfully');
      } else {
        res.redirect('/admin/users?error=Failed to create user');
      }
    } catch (err) {
      console.error('Error creating user:', err);
      res.redirect('/admin/users?error=Error creating user');
    }
  }

  /**
   * Update user (admin)
   */
  async adminUpdateUser(req, res) {
    try {
      const userManager = this.engine.getManager('UserManager');
      const currentUser = await userManager.getCurrentUser(req);
      
      if (!currentUser || !userManager.hasPermission(currentUser.username, 'admin:users')) {
        return res.status(403).json({ success: false, message: 'Access denied' });
      }
      
      const username = req.params.username;
      const updates = req.body;
      
      const success = await userManager.updateUser(username, updates);
      
      if (success) {
        res.json({ success: true, message: 'User updated successfully' });
      } else {
        res.status(400).json({ success: false, message: 'Failed to update user' });
      }
    } catch (err) {
      console.error('Error updating user:', err);
      res.status(500).json({ success: false, message: 'Error updating user' });
    }
  }

  /**
   * Delete user (admin)
   */
  async adminDeleteUser(req, res) {
    try {
      const userManager = this.engine.getManager('UserManager');
      const currentUser = userManager.getCurrentUser(req);
      
      if (!userManager.hasPermission(currentUser, 'admin:users')) {
        return res.status(403).send('Access denied');
      }
      
      const username = req.params.username;
      const success = await userManager.deleteUser(username);
      
      if (success) {
        res.json({ success: true, message: 'User deleted successfully' });
      } else {
        res.status(400).json({ success: false, message: 'Failed to delete user' });
      }
    } catch (err) {
      console.error('Error deleting user:', err);
      res.status(500).json({ success: false, message: 'Error deleting user' });
    }
  }

  /**
   * Admin roles management
   */
  async adminRoles(req, res) {
    try {
      const userManager = this.engine.getManager('UserManager');
      const currentUser = await userManager.getCurrentUser(req);
      
      if (!currentUser || !userManager.hasPermission(currentUser.username, 'admin:roles')) {
        return await this.renderError(req, res, 403, 'Access Denied', 'You do not have permission to manage roles');
      }
      
      const commonData = await this.getCommonTemplateDataWithUser(req);
      const leftMenuContent = await this.getLeftMenu();
      const roles = userManager.getRoles();
      const permissions = userManager.getPermissions();
      
      res.render('admin-roles', {
        ...commonData,
        title: 'Security Policy Management',
        leftMenuContent: leftMenuContent,
        roles: Array.from(roles.values()),
        permissions: Array.from(permissions.entries()).map(([key, desc]) => ({ key, description: desc }))
      });
      
    } catch (err) {
      console.error('Error loading admin roles:', err);
      res.status(500).send('Error loading role management');
    }
  }

  /**
   * Update role permissions (admin only)
   */
  async adminUpdateRole(req, res) {
    try {
      const userManager = this.engine.getManager('UserManager');
      const currentUser = await userManager.getCurrentUser(req);
      
      if (!currentUser || !userManager.hasPermission(currentUser.username, 'admin:roles')) {
        return res.status(403).json({ success: false, message: 'Access denied' });
      }
      
      const { roleName, permissions, displayName, description } = req.body;
      
      if (!roleName) {
        return res.status(400).json({ success: false, message: 'Role name required' });
      }
      
      const success = await userManager.updateRolePermissions(roleName, {
        permissions: permissions || [],
        displayName: displayName || roleName,
        description: description || ''
      });
      
      if (success) {
        res.json({ success: true, message: 'Role updated successfully' });
      } else {
        res.status(400).json({ success: false, message: 'Failed to update role' });
      }
    } catch (err) {
      console.error('Error updating role:', err);
      res.status(500).json({ success: false, message: 'Error updating role' });
    }
  }

  /**
   * Admin settings page
   */
  async adminSettings(req, res) {
    try {
      const userManager = this.engine.getManager('UserManager');
      const currentUser = await userManager.getCurrentUser(req);
      
      if (!currentUser || !userManager.hasPermission(currentUser.username, 'admin:system')) {
        return await this.renderError(req, res, 403, 'Access Denied', 'You do not have permission to access system settings');
      }
      
      const commonData = await this.getCommonTemplateDataWithUser(req);
      const leftMenuContent = await this.getLeftMenu();
      
      // System configuration settings (you can expand this)
      const settings = {
        systemName: 'amdWiki',
        version: '1.0.0',
        theme: 'default',
        maxFileSize: '10MB',
        allowRegistration: true,
        sessionTimeout: '24 hours'
      };
      
      res.render('admin-settings', {
        ...commonData,
        title: 'System Settings',
        leftMenuContent: leftMenuContent,
        settings: settings
      });
      
    } catch (err) {
      console.error('Error loading admin settings:', err);
      res.status(500).send('Error loading system settings');
    }
  }

  /**
   * Register all routes with Express app
   */
  registerRoutes(app) {
    // Main routes
    app.get('/', this.homePage.bind(this));
    
    // Specific routes that must come BEFORE wildcard routes
    app.get('/create', this.createPage.bind(this)); // New page creation form
    app.post('/create', this.createPageFromTemplate.bind(this)); // Create from template
    app.get('/search', this.searchPages.bind(this));
    app.get('/Search', this.searchPages.bind(this)); // JSPWiki-style uppercase Search page
    app.get('/edit', this.editPageIndex.bind(this)); // Edit page selector
    app.get('/edit/:page', this.editPage.bind(this));
    app.post('/edit/:page', this.savePage.bind(this)); // Alternative save route
    app.post('/delete/:page', this.deletePage.bind(this)); // Delete page
    
    // Wildcard routes (must come AFTER specific routes)
    app.get('/wiki/:page', this.viewPage.bind(this));
    app.post('/wiki/:page', this.savePage.bind(this)); // Handle form submissions
    
    // API routes
    app.get('/api/suggestions', this.searchSuggestions.bind(this));
    app.post('/api/preview', this.previewPage.bind(this));
    app.get('/api/page-names', this.getPageNames.bind(this));
    app.get('/api/page-source/:page', this.getPageSource.bind(this));
    
    // Attachment routes
    app.post('/attachments/upload/:page', this.uploadAttachment.bind(this));
    app.get('/attachments/:attachmentId', this.serveAttachment.bind(this));
    app.delete('/attachments/:attachmentId', this.deleteAttachment.bind(this));
    
    // Export routes
    app.get('/export', this.exportPage.bind(this));
    app.post('/export/html/:page', this.exportPageHtml.bind(this));
    app.post('/export/markdown/:page', this.exportPageMarkdown.bind(this));
    app.get('/exports', this.listExports.bind(this));
    app.get('/exports/:filename', this.downloadExport.bind(this));
    
    // Authentication routes
    app.get('/login', this.loginPage.bind(this));
    app.post('/login', this.processLogin.bind(this));
    app.get('/logout', this.processLogout.bind(this));
    app.get('/user-info', this.userInfo.bind(this)); // Debug route to show current user state
    app.get('/register', this.registerPage.bind(this));
    app.post('/register', this.processRegister.bind(this));
    app.get('/profile', this.profilePage.bind(this));
    app.post('/profile', this.updateProfile.bind(this));
    app.post('/profile/preferences', this.updatePreferences.bind(this));
    
    // Admin routes
    app.get('/admin', this.adminDashboard.bind(this));
    app.get('/admin/users', this.adminUsers.bind(this));
    app.post('/admin/users', this.adminCreateUser.bind(this));
    app.put('/admin/users/:username', this.adminUpdateUser.bind(this));
    app.delete('/admin/users/:username', this.adminDeleteUser.bind(this));
    app.get('/admin/roles', this.adminRoles.bind(this));
    app.post('/admin/roles/:roleName', this.adminUpdateRole.bind(this));
    app.get('/admin/settings', this.adminSettings.bind(this)); // Add missing settings route
    
    console.log('✅ Wiki routes registered');
  }

  /**
   * Get raw page source (markdown content) for viewing/copying
   */
  async getPageSource(req, res) {
    try {
      const pageName = decodeURIComponent(req.params.page);
      const pageManager = this.engine.getManager('PageManager');
      
      const page = await pageManager.getPage(pageName);
      if (!page) {
        return res.status(404).send('Page not found');
      }
      
      // Return the raw markdown content
      res.setHeader('Content-Type', 'text/plain; charset=utf-8');
      res.send(page.content || '');
      
    } catch (error) {
      console.error('Error retrieving page source:', error);
      res.status(500).send('Error retrieving page source');
    }
  }
}

module.exports = WikiRoutes;
