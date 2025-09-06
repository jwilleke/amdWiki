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
   * Get common template data with current user
   */
    async getCommonTemplateDataWithUser(req) {
        const baseData = await this.getCommonTemplateData();
        const userManager = this.engine.getManager('UserManager');
        const currentUser = req.user ? req.user : await userManager.getCurrentUser(req);
        
        return {
            ...baseData,
            currentUser
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
      const userManager = this.engine.getManager('UserManager');
      
      const currentUser = userManager.getCurrentUser(req) || userManager.getAnonymousUser();
      
      // Check read permission
      if (!userManager.hasPermission(currentUser.username, 'page:read')) {
        return res.status(403).render('error', {
          title: 'Access Denied',
          message: 'You do not have permission to view pages',
          error: { status: 403 }
        });
      }
      
      // Get common template data with user
      const commonData = await this.getCommonTemplateDataWithUser(req);
      
      // Get page data
      const pageData = await pageManager.getPage(pageName);
      if (!pageData) {
        const canCreate = userManager.hasPermission(currentUser.username, 'page:create');
        return res.status(404).render('view', {
          ...commonData,
          title: 'Page Not Found',
          content: `<h1>Page Not Found</h1><p>The page "${pageName}" does not exist.</p>${canCreate ? `<p><a href="/create?name=${encodeURIComponent(pageName)}" class="btn btn-primary">Create Page</a></p>` : ''}`,
          pageName: pageName,
          exists: false,
          canCreate: canCreate
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
        exists: true,
        canEdit: userManager.hasPermission(currentUser.username, 'page:edit'),
        canDelete: userManager.hasPermission(currentUser.username, 'page:delete')
      });
      
    } catch (err) {
      console.error('Error viewing page:', err);
      const commonData = await this.getCommonTemplateDataWithUser(req);
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
   * Display create new page form with template selection
   */
  async createPage(req, res) {
    try {
      const pageName = req.query.name || '';
      const templateManager = this.engine.getManager('TemplateManager');
      
      // Get common template data with user context
      const commonData = await this.getCommonTemplateDataWithUser(req);
      
      // Get available templates
      const templates = templateManager.getTemplates();
      
      // Get categories and keywords for the form
      const categories = await this.getCategories();
      const userKeywords = await this.getUserKeywords();
      
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
   * Create a new page from template
   */
  async createPageFromTemplate(req, res) {
    try {
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
      
      // Get common template data with user context
      const commonData = await this.getCommonTemplateDataWithUser(req);
      
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
   * Delete a page
   */
  async deletePage(req, res) {
    try {
      const pageName = req.params.page;
      console.log(`🗑️ Delete request received for page: ${pageName}`);
      
      const pageManager = this.engine.getManager('PageManager');
      const renderingManager = this.engine.getManager('RenderingManager');
      const searchManager = this.engine.getManager('SearchManager');
      
      // Check if page exists
      const pageData = await pageManager.getPage(pageName);
      if (!pageData) {
        console.log(`❌ Page not found: ${pageName}`);
        return res.status(404).send('Page not found');
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
   * Search pages
   */
  async searchPages(req, res) {
    try {
      const query = req.query.q || '';
      const searchManager = this.engine.getManager('SearchManager');
      
      // Get common template data with user context
      const commonData = await this.getCommonTemplateDataWithUser(req);
      
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
    try {
      const pageManager = this.engine.getManager('PageManager');
      const renderingManager = this.engine.getManager('RenderingManager');
      
      // Get common template data with user context
      const commonData = await this.getCommonTemplateDataWithUser(req);
      
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
      
      const user = await userManager.authenticateUser(username, password);
      if (!user) {
        return res.redirect('/login?error=Invalid username or password&redirect=' + encodeURIComponent(redirect));
      }
      
      const sessionId = userManager.createSession(user);
      
      // Set session cookie
      res.cookie('sessionId', sessionId, {
        httpOnly: true,
        secure: false, // Set to true in production with HTTPS
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
      });
      
      console.log(`👤 User logged in: ${username}`);
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
    try {
      const userManager = this.engine.getManager('UserManager');
      const currentUser = userManager.getCurrentUser(req);
      
      if (!currentUser) {
        return res.redirect('/login?redirect=/profile');
      }
      
      const commonData = await this.getCommonTemplateData();
      const userPermissions = userManager.getUserPermissions(currentUser.username);
      
      res.render('profile', {
        ...commonData,
        title: 'Profile',
        user: currentUser,
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
   * Admin dashboard
   */
  async adminDashboard(req, res) {
    try {
      const userManager = this.engine.getManager('UserManager');
      const currentUser = await userManager.getCurrentUser(req);
      
      if (!currentUser || !userManager.hasPermission(currentUser.username, 'admin:system')) {
        const commonData = await this.getCommonTemplateDataWithUser(req);
        return res.status(403).render('error', {
          ...commonData,
          title: 'Access Denied',
          message: 'You do not have permission to access the admin dashboard',
          error: { status: 403 }
        });
      }
      
      const commonData = await this.getCommonTemplateDataWithUser(req);
      const users = userManager.getUsers();
      const roles = userManager.getRoles();
      
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
        recentActivity: recentActivity
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
        const commonData = await this.getCommonTemplateDataWithUser(req);
        return res.status(403).render('error', {
          ...commonData,
          title: 'Access Denied',
          message: 'You do not have permission to access user management',
          error: { status: 403 }
        });
      }
      
      const commonData = await this.getCommonTemplateDataWithUser(req);
      const users = userManager.getUsers();
      const roles = userManager.getRoles();
      
      res.render('admin-users', {
        ...commonData,
        title: 'User Management',
        users: users,
        roles: roles
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
      const currentUser = userManager.getCurrentUser(req);
      
      if (!userManager.hasPermission(currentUser, 'admin:users')) {
        return res.status(403).send('Access denied');
      }
      
      const { username, email, displayName, password, roles } = req.body;
      const success = await userManager.createUser(username, {
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
      const currentUser = userManager.getCurrentUser(req);
      
      if (!userManager.hasPermission(currentUser, 'admin:users')) {
        return res.status(403).send('Access denied');
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
      const currentUser = userManager.getCurrentUser(req);
      
      if (!userManager.hasPermission(currentUser, 'admin:roles')) {
        return res.status(403).send('Access denied');
      }
      
      const commonData = await this.getCommonTemplateDataWithUser(req);
      const roles = userManager.getRoles();
      const permissions = userManager.getPermissions();
      
      res.render('admin-roles', {
        ...commonData,
        title: 'Role Management',
        roles: roles,
        permissions: permissions
      });
      
    } catch (err) {
      console.error('Error loading admin roles:', err);
      res.status(500).send('Error loading role management');
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
    app.post('/delete/:page', this.deletePage.bind(this)); // Delete page
    app.get('/create', this.createPage.bind(this)); // New page creation form
    app.post('/create', this.createPageFromTemplate.bind(this)); // Create from template
    app.get('/search', this.searchPages.bind(this));
    
    // API routes
    app.get('/api/suggestions', this.searchSuggestions.bind(this));
    app.post('/api/preview', this.previewPage.bind(this));
    app.get('/api/page-names', this.getPageNames.bind(this));
    
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
    app.get('/register', this.registerPage.bind(this));
    app.post('/register', this.processRegister.bind(this));
    app.get('/profile', this.profilePage.bind(this));
    app.post('/profile', this.updateProfile.bind(this));
    
    // Admin routes
    app.get('/admin', this.adminDashboard.bind(this));
    app.get('/admin/users', this.adminUsers.bind(this));
    app.post('/admin/users', this.adminCreateUser.bind(this));
    app.put('/admin/users/:username', this.adminUpdateUser.bind(this));
    app.delete('/admin/users/:username', this.adminDeleteUser.bind(this));
    app.get('/admin/roles', this.adminRoles.bind(this));
    
    console.log('✅ Wiki routes registered');
  }
}

module.exports = WikiRoutes;
