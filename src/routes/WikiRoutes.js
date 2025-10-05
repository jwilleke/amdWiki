/**
 * Modern route handlers using manager-based architecture
 *
 * @module WikiRoutes
 */

const path = require("path");
const multer = require("multer");
const fs = require("fs");
const SchemaGenerator = require("../utils/SchemaGenerator");
const logger = require("../utils/logger");
const WikiContext = require("../context/WikiContext");

// Configure multer for image uploads
const imageStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, "../../public/images");
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, "upload-" + uniqueSuffix + path.extname(file.originalname));
  },
});

const imageUpload = multer({
  storage: imageStorage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp|svg/;
    const extname = allowedTypes.test(
      path.extname(file.originalname).toLowerCase()
    );
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(
      new Error("Only image files (jpeg, jpg, png, gif, webp, svg) are allowed")
    );
  },
});

class WikiRoutes {
  constructor(engine) {
    this.engine = engine;
  }

  /**
   * Parse file size string (e.g., '5MB', '1GB') to bytes
   * @param {string} sizeStr - Size string
   * @returns {number} Size in bytes
   */
  parseFileSize(sizeStr) {
    const units = {
      B: 1,
      KB: 1024,
      MB: 1024 * 1024,
      GB: 1024 * 1024 * 1024,
    };

    const match = sizeStr
      .toUpperCase()
      .match(/^(\d+(?:\.\d+)?)\s*(B|KB|MB|GB)?$/);
    if (!match) return 10 * 1024 * 1024; // Default 10MB

    const size = parseFloat(match[1]);
    const unit = match[2] || "B";

    return Math.round(size * units[unit]);
  }

  /**
   * Extract request information for variable expansion
   * @param {object} req - Express request object
   * @returns {object} Request information object
   */
  getRequestInfo(req) {
    return {
      userAgent: req.headers["user-agent"] || "Unknown",
      clientIp:
        req.ip ||
        req.connection?.remoteAddress ||
        req.headers["x-forwarded-for"]?.split(",")[0]?.trim() ||
        "Unknown",
      referer: req.headers.referer || req.headers.referrer || "Direct",
      acceptLanguage: req.headers["accept-language"] || "Unknown",
      sessionId: req.session?.id || req.sessionID || "None",
    };
  }

  /**
   * Get common template data that all pages need.
   * This is now the single source of truth for common data.
   * @param {object} req - Express request object.
   */
  async getCommonTemplateData(req) {
    const userManager = this.engine.getManager("UserManager");
    const aclManager = this.engine.getManager("ACLManager");
    const renderingManager = this.engine.getManager("RenderingManager");
    const pageManager = this.engine.getManager("PageManager");
    const configManager = this.engine.getManager("ConfigurationManager");

    // Get the user context directly from the request.
    const userContext =
      req.userContext || (await userManager.getCurrentUser(req));
    const templateData = {
      currentUser: userContext,
      user: userContext, // Add alias for consistency
      appName: configManager?.getProperty(
        "amdwiki.application.name",
        "amdWiki"
      ),
      pages: await pageManager.getAllPages(),
    };

    // Load LeftMenu
    try {
      const leftMenuContent = await pageManager.getPageContent("LeftMenu");
      logger.info(
        `[TEMPLATE] Loading LeftMenu for user=${
          userContext?.username
        } roles=${userContext?.roles?.join("|")}`
      );

      const canViewLeftMenu = await aclManager.checkPagePermission(
        "LeftMenu",
        "view",
        userContext,
        leftMenuContent
      );
      logger.info(`[TEMPLATE] LeftMenu ACL decision: ${canViewLeftMenu}`);

      if (canViewLeftMenu) {
        const ctx = new WikiContext(this.engine, {
          pageName: "LeftMenu",
          content: leftMenuContent,
          userContext,
          request: req,
        });
        templateData.leftMenu = await renderingManager.textToHTML(
          ctx,
          leftMenuContent
        );
      } else {
        templateData.leftMenu = "";
      }
    } catch (error) {
      logger.warn("Could not load or render LeftMenu content.", {
        error: error.message,
      });
      templateData.leftMenu = "";
    }

    // Load Footer
    try {
      const footerContent = await pageManager.getPageContent("Footer");
      logger.info(
        `[TEMPLATE] Loading Footer for user=${
          userContext?.username
        } roles=${userContext?.roles?.join("|")}`
      );

      const canViewFooter = await aclManager.checkPagePermission(
        "Footer",
        "view",
        userContext,
        footerContent
      );
      logger.info(`[TEMPLATE] Footer ACL decision: ${canViewFooter}`);

      if (canViewFooter) {
        const ctx = new WikiContext(this.engine, {
          pageName: "Footer",
          content: footerContent,
          userContext,
          request: req,
        });
        templateData.footer = await renderingManager.textToHTML(
          ctx,
          footerContent
        );
      } else {
        templateData.footer = "";
      }
    } catch (error) {
      logger.warn("Could not load or render Footer content.", {
        error: error.message,
      });
      templateData.footer = "";
    }

    return templateData;
  }

  /**
   * Extract request context for access control
   * @param {Object} req - Express request object
   * @returns {Object} Context information
   */
  getRequestContext(req) {
    return {
      ip: req.ip || req.connection.remoteAddress,
      userAgent: req.get("User-Agent"),
      referer: req.get("Referer"),
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Session count (uses app.js sessionStore)
   */
  getActiveSesssionCount(req, res) {
    try {
      const store = req.sessionStore;
      if (!store)
        return res.status(503).json({ error: "Session store not available" });

      if (typeof store.length === "function") {
        return store.length((err, count) => {
          if (err)
            return res
              .status(500)
              .json({ error: "Failed to obtain session count" });
          // Return both sessionCount and distinctUsers
          // For now, distinctUsers = sessionCount (until we implement user tracking)
          return res.json({
            sessionCount: count || 0,
            distinctUsers: count || 0  // TODO: Implement actual distinct user tracking
          });
        });
      }

      if (typeof store.all === "function") {
        return store.all((err, sessions) => {
          if (err)
            return res
              .status(500)
              .json({ error: "Failed to obtain session count" });

          // Convert to array if needed
          const sessionArray = Array.isArray(sessions)
            ? sessions
            : sessions
            ? Object.values(sessions)
            : [];

          const sessionCount = sessionArray.length;

          // Count distinct users (unique usernames, including anonymous)
          const usernames = new Set();
          for (const session of sessionArray) {
            if (session && session.username) {
              usernames.add(session.username);
            } else {
              // Session without username is also counted as 'anonymous'
              usernames.add('anonymous');
            }
          }
          const distinctUsers = usernames.size;

          return res.json({
            sessionCount: sessionCount,
            distinctUsers: distinctUsers
          });
        });
      }

      return res
        .status(501)
        .json({ error: "Session count not supported by store" });
    } catch (e) {
      return res.status(500).json({ error: "Failed to obtain session count" });
    }
  }

  /**
   * Extract categories from Categories page
   */
  async getCategories() {
    try {
      const pageManager = this.engine.getManager("PageManager");
      const categoriesPage = await pageManager.getPage("Categories");

      if (!categoriesPage) {
        return ["General", "Documentation", "Project", "Reference"];
      }

      // Extract categories from the content (lines that start with *)
      const categories = [];
      const lines = categoriesPage.content.split("\n");

      for (const line of lines) {
        const match = line.match(/^\* (.+?) \(/);
        if (match) {
          const category = match[1];
          // Exclude admin-only categories from regular user dropdown
          if (category !== "System/Admin") {
            categories.push(category);
          }
        }
      }

      return categories.length > 0
        ? categories
        : ["General", "Documentation", "Project", "Reference"];
    } catch (err) {
      console.error("Error loading categories:", err);
      return ["General", "Documentation", "Project", "Reference"];
    }
  }

  /**
   * Get all categories including admin-only categories
   */
  async getAllCategories() {
    try {
      const pageManager = this.engine.getManager("PageManager");
      const categoriesPage = await pageManager.getPage("Categories");

      if (!categoriesPage) {
        return ["General", "Documentation", "System/Admin"];
      }

      // Extract all categories from the content (lines that start with *)
      const categories = [];
      const lines = categoriesPage.content.split("\n");

      for (const line of lines) {
        const match = line.match(/^\* (.+?) \(/);
        if (match) {
          categories.push(match[1]);
        }
      }

      // Ensure System/Admin category is always available
      if (!categories.includes("System/Admin")) {
        categories.push("System/Admin");
      }

      return categories.length > 0
        ? categories
        : ["General", "Documentation", "System/Admin"];
    } catch (err) {
      console.error("Error loading all categories:", err);
      return ["General", "Documentation", "System/Admin"];
    }
  }

  /**
   * Get system categories from System Keywords page (admin-only)
   */
  async getSystemCategories() {
    try {
      const pageManager = this.engine.getManager("PageManager");
      const systemKeywordsPage = await pageManager.getPage("System Keywords");
      if (!systemKeywordsPage) {
        return ["System", "Documentation", "Test"];
      }
      const categories = [];
      const lines = systemKeywordsPage.content.split("\n");
      let inKeywordsSection = false;
      for (const line of lines) {
        if (line.trim().startsWith("## ")) {
          // Enter keywords section
          inKeywordsSection = line
            .trim()
            .toLowerCase()
            .includes("current system keywords");
          continue;
        }
        if (inKeywordsSection) {
          // Stop if we hit another heading
          if (line.trim().startsWith("## ")) break;
          const bulletMatch = line.match(/^\s*-\s*(.+)$/);
          if (bulletMatch) {
            const keyword = bulletMatch[1].trim();
            if (keyword && !categories.includes(keyword)) {
              categories.push(keyword);
            }
          }
        }
      }
      return categories.length > 0
        ? categories
        : ["System", "Documentation", "Test"];
    } catch (err) {
      console.error("Error loading system categories:", err);
      return ["System", "Documentation", "Test"];
    }
  }

  /**
   * Extract user keywords from User-Keywords page
   */
  async getUserKeywords() {
    try {
      const pageManager = this.engine.getManager("PageManager");
      const keywordsPage = await pageManager.getPage("User Keywords");

      if (!keywordsPage) {
        return ["medicine", "geology", "test"];
      }

      // Extract keywords only from the bullet list under '## Current User Keywords'
      const keywords = [];
      const lines = keywordsPage.content.split("\n");
      let inKeywordsSection = false;
      for (const line of lines) {
        if (line.trim().startsWith("## ")) {
          // Enter keywords section
          inKeywordsSection = line
            .trim()
            .toLowerCase()
            .includes("current user keywords");
          continue;
        }
        if (inKeywordsSection) {
          // Stop if we hit another heading
          if (line.trim().startsWith("## ")) break;
          const bulletMatch = line.match(/^\s*-\s*(.+)$/);
          if (bulletMatch) {
            const keyword = bulletMatch[1].trim();
            if (keyword && !keywords.includes(keyword)) {
              keywords.push(keyword);
            }
          }
        }
      }
      return keywords.length > 0 ? keywords : ["medicine", "geology", "test"];
    } catch (err) {
      console.error("Error loading user keywords:", err);
      return ["medicine", "geology", "test"];
    }
  }

  /**
   * Generate Schema.org JSON-LD markup for a page
   * @param {Object} pageData - Page metadata and content
   * @param {Object} req - Express request object for URL generation
   * @returns {string} HTML script tag with JSON-LD
   */
  async generatePageSchema(pageData, req) {
    try {
      const baseUrl = `${req.protocol}://${req.get("host")}`;
      const pageUrl = `${baseUrl}${req.originalUrl}`;

      // Get current user for permission context
      const userManager = this.engine.getManager("UserManager");
      const currentUser = req.userContext;

      const schema = SchemaGenerator.generatePageSchema(pageData, {
        baseUrl: baseUrl,
        pageUrl: pageUrl,
        engine: this.engine, // Pass engine for DigitalDocumentPermission generation
        user: currentUser, // Pass user context for permission generation
      });

      return SchemaGenerator.generateScriptTag(schema);
    } catch (err) {
      console.error("Error generating page schema:", err);
      return "";
    }
  }

  /**
   * Generate site-wide Schema.org markup (Organization, SoftwareApplication)
   * @param {Object} req - Express request object
   * @returns {string} HTML script tags with JSON-LD
   */
  async generateSiteSchema(req) {
    try {
      const baseUrl = `${req.protocol}://${req.get("host")}`;
      const config = this.engine.getConfig();

      // Check if SchemaManager is available, fallback to legacy method
      let siteData;
      try {
        const schemaManager = this.engine.getManager("SchemaManager");
        siteData = await schemaManager.getComprehensiveSiteData();
      } catch (err) {
        console.warn(
          "SchemaManager not available, using legacy data sources:",
          err.message
        );

        // Fallback to legacy data structure
        const configData = {
          applicationName: config.get("applicationName", "amdWiki"),
          version: config.get("version", "1.0.0"),
          server: {
            port: config.get("server.port", 3000),
            host: config.get("server.host", "localhost"),
          },
          features: {
            export: config.get("features.export", { html: true }),
            attachments: config.get("features.attachments", { enabled: true }),
            llm: config.get("features.llm", { enabled: false }),
          },
        };

        // Load user data (admins only for privacy)
        const userManager = this.engine.getManager("UserManager");
        const allUsersArray = userManager.getUsers(); // This returns array without passwords
        const publicUsers = {};

        allUsersArray.forEach((userData) => {
          if (userData.roles?.includes("admin") && !userData.isSystem) {
            publicUsers[userData.username] = userData;
          }
        });

        siteData = {
          config: configData,
          users: publicUsers,
        };
      }

      const schemas = SchemaGenerator.generateComprehensiveSchema(siteData, {
        baseUrl: baseUrl,
        organizationName:
          siteData.organizations?.[0]?.name || "amdWiki Platform",
        repository: "https://github.com/jwilleke/amdWiki",
      });

      // Generate script tags for all schemas
      return schemas
        .map((schema) => SchemaGenerator.generateScriptTag(schema))
        .join("\n    ");
    } catch (err) {
      console.error("Error generating site schema:", err);
      return "";
    }
  }

  /**
   * Render error page with consistent template data
   */
  async renderError(req, res, status, title, message) {
    try {
      // Pass the request object to get all common data
      const commonData = await this.getCommonTemplateData(req);

      return res.status(status).render("error", {
        ...commonData,
        title: title,
        message: message,
        error: { status: status },
      });
    } catch (err) {
      console.error("Error rendering error page:", err);
      return res.status(status).send(`${title}: ${message}`);
    }
  }

  /**
   * Check if a page is a required page (admin-only edit)
   * This checks both hardcoded required pages and pages with System/Admin category
   */
  async isRequiredPage(pageName) {
    // Hardcoded required pages (for backward compatibility)
    const hardcodedRequiredPages = ["Categories", "Wiki Documentation"];
    if (hardcodedRequiredPages.includes(pageName)) {
      return true;
    }

    // Check if page has System/Admin category
    try {
      const pageManager = this.engine.getManager("PageManager");
      const pageData = await pageManager.getPage(pageName);
      if (
        pageData &&
        pageData.metadata &&
        pageData.metadata.category === "System/Admin"
      ) {
        return true;
      }
    } catch (err) {
      console.error("Error checking page category:", err);
    }

    return false;
  }

  /**
   * Get and format left menu content from LeftMenu page
   */
  async getLeftMenu(userContext = null) {
    try {
      const pageManager = this.engine.getManager("PageManager");
      const renderingManager = this.engine.getManager("RenderingManager");

      // Try to get LeftMenu page
      const leftMenuPage = await pageManager.getPage("LeftMenu");
      if (!leftMenuPage) {
        return null; // Return null to use fallback
      }

      // Render markdown to HTML with user context (this will automatically expand system variables)
      const requestInfo = null; // getLeftMenu doesn't have access to req currently
      const renderedContent = await renderingManager.renderMarkdown(
        leftMenuPage.content,
        "LeftMenu",
        userContext,
        requestInfo
      );

      // Format for Bootstrap navigation
      return this.formatLeftMenuContent(renderedContent);
    } catch (err) {
      console.error("Error loading left menu:", err);
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
    content = content.replace(
      /<a href="([^"]*)">/g,
      '<a class="nav-link" href="$1">'
    );

    // Add icons to common menu items
    content = content.replace(
      /(<a class="nav-link"[^>]*>)Main page/g,
      '$1<i class="fas fa-home"></i> Main page'
    );
    content = content.replace(
      /(<a class="nav-link"[^>]*>)About/g,
      '$1<i class="fas fa-info-circle"></i> About'
    );
    content = content.replace(
      /(<a class="nav-link"[^>]*>)Find pages/g,
      '$1<i class="fas fa-search"></i> Find pages'
    );
    content = content.replace(
      /(<a class="nav-link"[^>]*>)Search/g,
      '$1<i class="fas fa-search"></i> Search'
    );
    content = content.replace(
      /(<a class="nav-link"[^>]*>)News/g,
      '$1<i class="fas fa-newspaper"></i> News'
    );
    content = content.replace(
      /(<a class="nav-link"[^>]*>)Recent Changes/g,
      '$1<i class="fas fa-history"></i> Recent Changes'
    );
    content = content.replace(
      /(<a class="nav-link"[^>]*>)Page Index/g,
      '$1<i class="fas fa-list"></i> Page Index'
    );
    content = content.replace(
      /(<a class="nav-link"[^>]*>)SystemInfo/g,
      '$1<i class="fas fa-server"></i> SystemInfo'
    );

    return content;
  }

  /**
   * Display a wiki page
   */
  async viewPage(req, res) {
    try {
      const configManager = this.engine.getManager("ConfigurationManager");
      const frontPage = configManager.getProperty(
        "amdwiki.frontPage",
        "Welcome"
      );
      const pageName = req.params.page || frontPage;

      // The userContext is now available on the request via the session middleware
      const userContext = req.userContext;
      const pageManager = this.engine.getManager("PageManager");
      const renderingManager = this.engine.getManager("RenderingManager");
      const aclManager = this.engine.getManager("ACLManager");

      logger.info(
        `[VIEW] pageName=${pageName} user=${userContext?.username} roles=${(
          userContext?.roles || []
        ).join("|")}`
      );

      // Gracefully handle page not found
      const markdown = await pageManager
        .getPageContent(pageName)
        .catch((err) => {
          if (err.message.includes("not found")) return null;
          throw err;
        });

      if (markdown === null) {
        return await this.renderError(
          req,
          res,
          404,
          "Not Found",
          `The page '${pageName}' does not exist.`
        );
      }

      const canView = await aclManager.checkPagePermission(
        pageName,
        "view",
        userContext,
        markdown
      );
      logger.info(`[VIEW] ACL decision for ${pageName}: ${canView}`);
      if (!canView) {
        return await this.renderError(
          req,
          res,
          403,
          "Access Denied",
          "You do not have permission to view this page."
        );
      }

      // Check if user can edit this page
      const canEdit = await aclManager.checkPagePermission(
        pageName,
        "edit",
        userContext,
        markdown
      );

      const ctx = new WikiContext(this.engine, {
        context: WikiContext.CONTEXT.VIEW,
        pageName,
        content: markdown,
        userContext,
        request: req,
        response: res,
      });
      const html = await renderingManager.textToHTML(ctx, markdown);

      // Get page metadata for display
      const metadata = await pageManager.getPageMetadata(pageName);

      // Pass the request object to get all common data
      const templateData = await this.getCommonTemplateData(req);
      res.render("view", {
        ...templateData,
        pageName,
        content: html,
        canEdit,
        metadata,
        lastModified: metadata?.lastModified,
        referringPages: [], // TODO: Implement backlink detection
      });
    } catch (error) {
      logger.error("[VIEW] Error viewing page", {
        error: error.message,
        stack: error.stack,
      });
      await this.renderError(
        req,
        res,
        500,
        "Error",
        "Could not render the page."
      );
    }
  }

  /**
   * Display create new page form with template selection
   */
  async createPage(req, res) {
    try {
      const userManager = this.engine.getManager("UserManager");
      const currentUser = req.userContext;

      console.log(
        "[CREATE-DEBUG] currentUser:",
        currentUser ? currentUser.username : "null",
        "isAuth:",
        currentUser?.isAuthenticated
      );
      console.log(
        "[CREATE-DEBUG] checking page:create permission for user:",
        currentUser?.username
      );

      // Check if user is authenticated
      if (!currentUser || !currentUser.isAuthenticated) {
        console.log(
          "[CREATE-DEBUG] User not authenticated, redirecting to login"
        );
        return res.redirect("/login?redirect=" + encodeURIComponent("/create"));
      }

      const hasPermission = await userManager.hasPermission(
        currentUser.username,
        "page:create"
      );
      console.log("[CREATE-DEBUG] hasPermission result:", hasPermission);

      // Check if user has permission to create pages
      if (!hasPermission) {
        console.log(
          "[CREATE-DEBUG] Permission denied for user:",
          currentUser.username
        );
        return await this.renderError(
          req,
          res,
          403,
          "Access Denied",
          "You do not have permission to create pages. Please contact an administrator."
        );
      }

      const pageName = req.query.name || "";
      const templateManager = this.engine.getManager("TemplateManager");

      // Get common template data with user context
      const commonData = await this.getCommonTemplateData(req);

      // Get available templates
      const templates = templateManager.getTemplates();

      // Get categories and keywords for the form
      const systemCategories = await this.getSystemCategories();
      const userKeywords = await this.getUserKeywords();

      const configManager = this.engine.getManager("ConfigurationManager");
      const maxUserKeywords = configManager
        ? configManager.getProperty("amdwiki.maximum.user-keywords", 5)
        : 5;

      res.render("create", {
        ...commonData,
        title: "Create New Page",
        pageName: pageName,
        templates: templates,
        systemCategories: systemCategories,
        userKeywords: userKeywords,
        maxUserKeywords: maxUserKeywords,
        csrfToken: req.session.csrfToken,
      });
    } catch (err) {
      console.error("Error loading create page:", err);
      res.status(500).send("Error loading create page form");
    }
  }

  /**
   * Handle /edit route without page parameter
   */
  async editPageIndex(req, res) {
    try {
      const userManager = this.engine.getManager("UserManager");
      const currentUser = req.userContext;

      // Check if user is authenticated
      if (!currentUser || !currentUser.isAuthenticated) {
        return res.redirect("/login?redirect=" + encodeURIComponent("/edit"));
      }

      // Check if user has permission to edit pages
      if (
        !(await userManager.hasPermission(currentUser.username, "page:edit"))
      ) {
        return await this.renderError(
          req,
          res,
          403,
          "Access Denied",
          "You do not have permission to edit pages. Please contact an administrator."
        );
      }

      // Get all pages for selection
      const pageManager = this.engine.getManager("PageManager");
      const allPages = await pageManager.getAllPages();

      // Sort pages alphabetically
      const sortedPages = allPages.sort((a, b) => a.localeCompare(b));

      // Get common template data with user context
      const commonData = await this.getCommonTemplateData(req);

      res.render("edit-index", {
        ...commonData,
        title: "Select Page to Edit",
        pages: sortedPages,
      });
    } catch (err) {
      console.error("Error loading edit page index:", err);
      res.status(500).send("Error loading edit page selector");
    }
  }

  /**
   * Create a new page from template
   */
  async createPageFromTemplate(req, res) {
    try {
      const userManager = this.engine.getManager("UserManager");
      const currentUser = req.userContext;

      // Check if user is authenticated
      if (!currentUser || !currentUser.isAuthenticated) {
        return res.redirect("/login?redirect=" + encodeURIComponent("/create"));
      }

      // Check if user has permission to create pages
      if (
        !(await userManager.hasPermission(currentUser.username, "page:create"))
      ) {
        return await this.renderError(
          req,
          res,
          403,
          "Access Denied",
          "You do not have permission to create pages. Please contact an administrator."
        );
      }

      const { pageName, templateName, categories, userKeywords } = req.body;

      if (!pageName || !templateName) {
        return res.status(400).send("Page name and template are required");
      }

      // Ensure categories is an array and always include 'default'
      let categoriesArray = Array.isArray(categories)
        ? categories
        : categories
        ? [categories]
        : [];
      if (!categoriesArray.includes("default")) {
        categoriesArray.unshift("default");
      }
      if (categoriesArray.length > 3) {
        return res.status(400).send("Maximum 3 categories allowed");
      }

      const templateManager = this.engine.getManager("TemplateManager");
      const pageManager = this.engine.getManager("PageManager");

      // Check if page already exists
      const existingPage = await pageManager.getPage(pageName);
      if (existingPage) {
        console.log(
          `DEBUG: createPageFromTemplate - Page ${pageName} already exists, rendering error template`
        );
        try {
          const commonData = await this.getCommonTemplateData(currentUser);

          return res.status(409).render("error", {
            ...commonData,
            currentUser,
            error: { status: 409 },
            title: "Page Already Exists",
            message: `A page named "${pageName}" already exists.`,
            details:
              "You can view the existing page or edit it if you have permission.",
            actions: [
              {
                label: "View Page",
                url: `/wiki/${encodeURIComponent(pageName)}`,
                class: "btn-primary",
              },
              {
                label: "Edit Page",
                url: `/edit/${encodeURIComponent(pageName)}`,
                class: "btn-secondary",
              },
              {
                label: "Back to Create",
                url: "/create",
                class: "btn-outline-secondary",
              },
            ],
          });
        } catch (templateError) {
          console.log(
            "DEBUG: Error rendering template, falling back to simple message",
            templateError
          );
          return res.status(409).send("Page already exists");
        }
      }

      // Apply template with variables
      const templateVars = {
        pageName: pageName,
        category: categoriesArray[0] || "", // Use first category for backward compatibility
        categories: categoriesArray.join(", "),
        userKeywords: Array.isArray(userKeywords)
          ? userKeywords.join(", ")
          : userKeywords || "",
        date: new Date().toISOString().split("T")[0],
      };

      const content = templateManager.applyTemplate(templateName, templateVars);

      // Save the new page
      const metadata = {
        title: pageName,
        categories: categoriesArray,
        "user-keywords": Array.isArray(userKeywords)
          ? userKeywords
          : userKeywords
          ? [userKeywords]
          : [],
      };

      await pageManager.savePage(pageName, content, metadata);

      // Rebuild search index and link graph
      const renderingManager = this.engine.getManager("RenderingManager");
      const searchManager = this.engine.getManager("SearchManager");
      await renderingManager.rebuildLinkGraph();
      await searchManager.rebuildIndex();

      // Redirect to edit the new page
      res.redirect(`/edit/${pageName}`);
    } catch (err) {
      console.error("Error creating page from template:", err);
      res.status(500).send("Error creating page");
    }
  }
  async editPage(req, res) {
    try {
      const pageName = req.params.page;
      const pageManager = this.engine.getManager("PageManager");
      const userManager = this.engine.getManager("UserManager");
      const aclManager = this.engine.getManager("ACLManager");

      // Get current user
      const currentUser = req.userContext;

      // Get page data to check ACL (if page exists)
      let pageData = await pageManager.getPage(pageName);

      // Check if this is a required page that needs admin access
      if (await this.isRequiredPage(pageName)) {
        if (
          !currentUser ||
          !(await userManager.hasPermission(
            currentUser.username,
            "admin:system"
          ))
        ) {
          return await this.renderError(
            req,
            res,
            403,
            "Access Denied",
            "Only administrators can edit this page"
          );
        }
      } else {
        // For existing pages, check ACL edit permission
        if (pageData) {
          const context = this.getRequestContext(req);
          const hasEditPermission = await aclManager.checkPagePermission(
            pageName,
            "edit",
            currentUser,
            pageData.content,
            context
          );

          if (!hasEditPermission) {
            return await this.renderError(
              req,
              res,
              403,
              "Access Denied",
              "You do not have permission to edit this page"
            );
          }
        } else {
          // For new pages, check general page creation permission
          if (
            !currentUser ||
            !(await userManager.hasPermission(
              currentUser.username,
              "page:create"
            ))
          ) {
            return await this.renderError(
              req,
              res,
              403,
              "Access Denied",
              "You do not have permission to create pages"
            );
          }
        }
      }

      // Get common template data with user context
      const commonData = await this.getCommonTemplateData(req);

      // Get categories and keywords - use system categories for admin editing
      const isAdmin =
        currentUser &&
        (await userManager.hasPermission(currentUser.username, "admin:system"));
      const systemCategories = await this.getSystemCategories();
      const userKeywords = await this.getUserKeywords();

      // If page doesn't exist, generate template data without saving
      if (!pageData) {
        pageData = await pageManager.generateTemplateData(pageName);
      }

      // Ensure content is a string for ACL processing
      if (!pageData.content || typeof pageData.content !== "string") {
        pageData.content = "";
      }

      // Remove ACL markup from content for editing
      const cleanContent = aclManager.removeACLMarkup(pageData.content);
      pageData.content = cleanContent;

      // Extract current categories and keywords from metadata - handle both old and new format
      const selectedCategories =
        pageData.metadata?.categories ||
        (pageData.metadata?.category ? [pageData.metadata.category] : []);
      const selectedUserKeywords = pageData.metadata?.["user-keywords"] || [];

      const configManager = this.engine.getManager("ConfigurationManager");
      const maxUserKeywords = configManager
        ? configManager.getProperty("amdwiki.maximum.user-keywords", 5)
        : 5;

      res.render("edit", {
        ...commonData,
        title: `Edit ${pageName}`,
        pageName: pageName,
        content: pageData.content,
        metadata: pageData.metadata,
        systemCategories: systemCategories,
        selectedCategories: selectedCategories,
        userKeywords: userKeywords,
        selectedUserKeywords: selectedUserKeywords,
        maxUserKeywords: maxUserKeywords,
        csrfToken: req.session.csrfToken,
      });
    } catch (err) {
      console.error("Error loading edit page:", err);
      res.status(500).send("Error loading edit page");
    }
  }

  /**
   * Create a new wiki page via POST /wiki/:page
   * @param {object} req - Express request object
   * @param {object} res - Express response object
   */
  async createWikiPage(req, res) {
    try {
      const userManager = this.engine.getManager("UserManager");
      const currentUser = req.userContext;

      // Check if user is authenticated
      if (!currentUser || !currentUser.isAuthenticated) {
        return res.redirect(
          "/login?redirect=" + encodeURIComponent(req.originalUrl)
        );
      }

      // Check if user has permission to create pages
      if (
        !(await userManager.hasPermission(currentUser.username, "page:create"))
      ) {
        return await this.renderError(
          req,
          res,
          403,
          "Access Denied",
          "You do not have permission to create pages."
        );
      }

      const pageName = decodeURIComponent(req.params.page);
      const { content, templateName, categories, userKeywords } = req.body;

      const pageManager = this.engine.getManager("PageManager");

      // Check if page already exists
      const existingPage = await pageManager.getPage(pageName);
      if (existingPage) {
        const commonData = await this.getCommonTemplateData(currentUser);

        return res.status(409).render("error", {
          ...commonData,
          currentUser,
          error: { status: 409 },
          title: "Page Already Exists",
          message: `A page named "${pageName}" already exists.`,
          details:
            "You can view the existing page or edit it if you have permission.",
          actions: [
            {
              label: "View Page",
              url: `/wiki/${encodeURIComponent(pageName)}`,
              class: "btn-primary",
            },
            {
              label: "Edit Page",
              url: `/edit/${encodeURIComponent(pageName)}`,
              class: "btn-secondary",
            },
            {
              label: "Back to Create",
              url: "/create",
              class: "btn-outline-secondary",
            },
          ],
        });
      }

      let finalContent = content;

      // If a template was selected, apply it
      if (templateName && templateName !== "none") {
        const templateManager = this.engine.getManager("TemplateManager");

        // Ensure categories is an array
        let categoriesArray = Array.isArray(categories)
          ? categories
          : categories
          ? [categories]
          : ["General"];

        // Apply template with variables
        const templateVars = {
          pageName: pageName,
          category: categoriesArray[0] || "General",
          categories: categoriesArray.join(", "),
          userKeywords: Array.isArray(userKeywords)
            ? userKeywords.join(", ")
            : userKeywords || "",
          date: new Date().toISOString().split("T")[0],
        };

        finalContent = templateManager.applyTemplate(
          templateName,
          templateVars
        );
      } else if (!content) {
        return res.status(400).send("Content or template is required");
      }

      // Create metadata for new page
      const metadata = {
        title: pageName,
        category: categories || "General",
        "user-keywords": Array.isArray(userKeywords)
          ? userKeywords
          : userKeywords
          ? [userKeywords]
          : [],
      };

      // Save the new page
      await pageManager.savePage(pageName, finalContent, metadata);

      // Rebuild search index and link graph
      const renderingManager = this.engine.getManager("RenderingManager");
      const searchManager = this.engine.getManager("SearchManager");
      await renderingManager.rebuildLinkGraph();
      await searchManager.rebuildIndex();

      // Redirect to edit the new page (so user can see template result)
      res.redirect(`/edit/${encodeURIComponent(pageName)}`);
    } catch (error) {
      console.error("Error creating wiki page:", error);
      return await this.renderError(
        req,
        res,
        500,
        "Internal Server Error",
        "Failed to create page"
      );
    }
  }

  /**
   * Save a page
   */
  async savePage(req, res) {
    try {
      const pageName = req.params.page;
      console.log(`💾 Save request received for page: ${pageName}`);
      console.log(`💾 Request body keys: ${Object.keys(req.body).join(', ')}`);
      const { content, title, categories, userKeywords } = req.body;

      const pageManager = this.engine.getManager("PageManager");
      const renderingManager = this.engine.getManager("RenderingManager");
      const searchManager = this.engine.getManager("SearchManager");
      const userManager = this.engine.getManager("UserManager");
      const aclManager = this.engine.getManager("ACLManager");
      const validationManager = this.engine.getManager("ValidationManager");

      // Get current user
      const currentUser = req.userContext;

      // Get existing page data for ACL checking
      const existingPage = await pageManager.getPage(pageName);

      // Accept system-category as required field (new metadata format)
      let systemCategory = req.body["system-category"] || "";
      if (
        !systemCategory ||
        typeof systemCategory !== "string" ||
        systemCategory.trim() === ""
      ) {
        return res.status(400).send("A system-category is required");
      }
      // Validate user keywords (preserve existing if none submitted)
      const submittedUserKeywords =
        typeof req.body.userKeywords !== "undefined"
          ? req.body.userKeywords
          : typeof req.body["user-keywords"] !== "undefined"
          ? req.body["user-keywords"]
          : undefined;

      let userKeywordsArray;
      if (typeof submittedUserKeywords === "undefined") {
        // No keywords submitted: keep existing ones
        userKeywordsArray = existingPage?.metadata?.["user-keywords"] || [];
      } else {
        userKeywordsArray = Array.isArray(submittedUserKeywords)
          ? submittedUserKeywords
          : submittedUserKeywords
          ? [submittedUserKeywords]
          : [];
      }

      // Prepare metadata ONCE, preserving UUID if editing
      let baseMetadata = {
        title: title || pageName,
        "system-category": systemCategory,
        "user-keywords": userKeywordsArray,
      };
      if (existingPage && existingPage.metadata && existingPage.metadata.uuid) {
        baseMetadata.uuid = existingPage.metadata.uuid;
      }
      const metadata = validationManager.generateValidMetadata(
        baseMetadata.title,
        baseMetadata
      );

      // Permission checks
      const isCurrentlyRequired = await this.isRequiredPage(pageName);
      // Check if the new metadata will make this a required page
      const hardcodedRequiredPages = ["Categories", "Wiki Documentation"];
      const willBeRequired = hardcodedRequiredPages.includes(pageName) ||
                            metadata['system-category'] === "System/Admin";
      if (isCurrentlyRequired || willBeRequired) {
        if (
          !currentUser ||
          !(await userManager.hasPermission(
            currentUser.username,
            "admin:system"
          ))
        ) {
          return await this.renderError(
            req,
            res,
            403,
            "Access Denied",
            "Only administrators can edit this page or assign System/Admin category"
          );
        }
      } else {
        // For existing pages, check ACL edit permission
        if (existingPage) {
          if (
            !currentUser ||
            !(await userManager.hasPermission(
              currentUser.username,
              "page:create"
            ))
          ) {
            return await this.renderError(
              req,
              res,
              403,
              "Access Denied",
              "You do not have permission to create pages"
            );
          }
        }
      }

      // Save the page
      await pageManager.savePage(pageName, content, metadata);

      // Rebuild link graph and search index
      await renderingManager.rebuildLinkGraph();
      await searchManager.rebuildIndex();

      // Redirect to the updated page title if it changed (fallback to original name)
      const redirectName = metadata.title || pageName;
      res.redirect(`/wiki/${encodeURIComponent(redirectName)}`);
    } catch (err) {
      console.error("Error saving page:", err);
      res.status(500).send("Error saving page");
    }
  }

  /**
   * Delete a page
   */
  async deletePage(req, res) {
    try {
      const pageName = req.params.page;
      console.log(`🗑️ Delete request received for page: ${pageName}`);

      const pageManager = this.engine.getManager("PageManager");
      const renderingManager = this.engine.getManager("RenderingManager");
      const searchManager = this.engine.getManager("SearchManager");
      const userManager = this.engine.getManager("UserManager");
      const aclManager = this.engine.getManager("ACLManager");

      // Get current user
      const currentUser = req.userContext;

      // Check if page exists
      const pageData = await pageManager.getPage(pageName);
      if (!pageData) {
        console.log(`❌ Page not found: ${pageName}`);
        return res.status(404).send("Page not found");
      }

      // Check if this is a required page that needs admin access
      if (await this.isRequiredPage(pageName)) {
        if (
          !currentUser ||
          !(await userManager.hasPermission(
            currentUser.username,
            "admin:system"
          ))
        ) {
          return await this.renderError(
            req,
            res,
            403,
            "Access Denied",
            "Only administrators can delete this page"
          );
        }
      } else {
        // Check ACL delete permission
        const context = this.getRequestContext(req);
        const hasDeletePermission = await aclManager.checkPagePermission(
          pageName,
          "delete",
          currentUser,
          pageData.content,
          context
        );

        if (!hasDeletePermission) {
          return await this.renderError(
            req,
            res,
            403,
            "Access Denied",
            "You do not have permission to delete this page"
          );
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
        res.redirect("/");
      } else {
        console.log(`❌ Failed to delete page: ${pageName}`);
        res.status(500).send("Failed to delete page");
      }
    } catch (err) {
      console.error("❌ Error deleting page:", err);
      res.status(500).send("Error deleting page");
    }
  }

  /**
   * Search pages with advanced options
   */
  async searchPages(req, res) {
    try {
      const query = req.query.q || "";

      // Handle multiple categories and keywords
      let categories = req.query.category || [];
      if (typeof categories === "string") categories = [categories];
      categories = categories.filter((cat) => cat.trim() !== "");

      let userKeywords = req.query.keywords || [];
      if (typeof userKeywords === "string") userKeywords = [userKeywords];
      userKeywords = userKeywords.filter((kw) => kw.trim() !== "");

      // Handle multiple searchIn values
      let searchIn = req.query.searchIn || ["all"];
      if (typeof searchIn === "string") searchIn = [searchIn];
      searchIn = searchIn.filter((si) => si.trim() !== "");
      if (searchIn.length === 0) searchIn = ["all"];

      const searchManager = this.engine.getManager("SearchManager");

      // Get common template data with user context
      const commonData = await this.getCommonTemplateData(req);

      let results = [];
      let searchType = "text";

      // Determine search type and perform search
      if (query.trim() || categories.length > 0 || userKeywords.length > 0) {
        if (categories.length > 0 && !query && userKeywords.length === 0) {
          // Category-only search
          results = searchManager.searchByCategories
            ? searchManager.searchByCategories(categories)
            : searchManager.searchByCategory(categories[0]);
          searchType = "category";
        } else if (
          userKeywords.length > 0 &&
          !query &&
          categories.length === 0
        ) {
          // Keywords-only search
          results = searchManager.searchByUserKeywordsList
            ? searchManager.searchByUserKeywordsList(userKeywords)
            : searchManager.searchByUserKeywords(userKeywords[0]);
          searchType = "keywords";
        } else {
          // Advanced search with multiple criteria
          results = searchManager.advancedSearch({
            query: query,
            categories: categories,
            userKeywords: userKeywords,
            searchIn: searchIn,
            maxResults: 50,
          });
          searchType = "advanced";
        }
      }

      // Get available categories and keywords for dropdowns
      const systemCategories = await this.getSystemCategories();
      const userKeywordsList = await this.getUserKeywords();

      // Get stats for search results (optional, fallback to empty if not available)
      let stats = {};
      if (searchManager.getStats) {
        stats = searchManager.getStats();
      }
      res.render("search-results", {
        ...commonData,
        title: "Search Results",
        results: results,
        count: results.length,
        query: query,
        categories: categories,
        userKeywords: userKeywords,
        searchIn: searchIn,
        searchType: searchType,
        systemCategories: systemCategories,
        userKeywordsList: userKeywordsList,
        availableCategories: systemCategories,
        availableKeywords: userKeywordsList,
        stats: stats,
      });
    } catch (err) {
      console.error("Error searching:", err);
      res.status(500).send("Error performing search");
    }
  }

  /**
   * API endpoint for search suggestions
   */
  async searchSuggestions(req, res) {
    try {
      const partial = req.query.q || "";
      const searchManager = this.engine.getManager("SearchManager");

      const suggestions = searchManager.getSuggestions(partial);

      res.json({ suggestions });
    } catch (err) {
      console.error("Error getting suggestions:", err);
      res.status(500).json({ error: "Error getting suggestions" });
    }
  }

  /**
   * API endpoint for getting all page names
   */
  async getPageNames(req, res) {
    try {
      const pageManager = this.engine.getManager("PageManager");
      const pageNames = await pageManager.getPageNames();

      res.json(pageNames);
    } catch (err) {
      console.error("Error getting page names:", err);
      res.status(500).json({ error: "Error getting page names" });
    }
  }

  /**
   * Home page - show main index
   */
  async homePage(req, res) {
    // Redirect to Welcome page instead of rendering a separate home page
    res.redirect("/wiki/Welcome");
  }

  /**
   * API endpoint to get page preview
   */
  async previewPage(req, res) {
    console.log("!!! PREVIEW PAGE METHOD CALLED !!!");
    try {
      const { content, pageName } = req.body;
      const renderingManager = this.engine.getManager("RenderingManager");

      // Get common template data with user (same as viewPage for consistency)
      const commonData = await this.getCommonTemplateData(req);

      // Get request info for consistency with actual page rendering
      const requestInfo = this.getRequestInfo(req);

      console.log(
        "DEBUG: previewPage calling renderMarkdown with content:",
        content,
        "pageName:",
        pageName
      );
      console.log("DEBUG: previewPage using user context:", commonData.user);
      const renderedContent = await renderingManager.renderMarkdown(
        content,
        pageName,
        commonData.user,
        requestInfo
      );
      console.log(
        "DEBUG: previewPage received renderedContent:",
        renderedContent
      );

      res.json({
        html: renderedContent,
        success: true,
      });
    } catch (err) {
      console.error("Error generating preview:", err);
      res.status(500).json({
        error: "Error generating preview",
        success: false,
      });
    }
  }

  /**
   * Upload attachment for a page
   */
  async uploadAttachment(req, res) {
    try {
      const { page: pageName } = req.params;
      const userManager = this.engine.getManager("UserManager");
      const aclManager = this.engine.getManager("ACLManager");
      const attachmentManager = this.engine.getManager("AttachmentManager");

      // 🔒 SECURITY: Check authentication
      const currentUser = req.userContext;
      if (!currentUser || !currentUser.isAuthenticated) {
        return res.status(401).json({
          success: false,
          error: "Authentication required to upload attachments",
        });
      }

      // 🔒 SECURITY: Check if user can edit the parent page
      const canEditPage = await aclManager.checkAttachmentPermission(
        currentUser,
        pageName,
        "upload"
      );
      if (!canEditPage) {
        return res.status(403).json({
          success: false,
          error: "No permission to upload attachments to this page",
        });
      }

      if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
      }

      const attachment = await attachmentManager.uploadAttachment(
        pageName,
        req.file
      );

      res.json({
        success: true,
        attachment: attachment,
        message: "File uploaded successfully",
      });
    } catch (err) {
      console.error("Error uploading attachment:", err);
      res.status(500).json({
        success: false,
        error: err.message || "Error uploading file",
      });
    }
  }

  /**
   * Upload image file
   */
  async uploadImage(req, res) {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No image file uploaded" });
      }

      // Return the image path that can be used in the Image plugin
      const imagePath = `/images/${req.file.filename}`;

      res.json({
        success: true,
        imagePath: imagePath,
        filename: req.file.filename,
        originalName: req.file.originalname,
        size: req.file.size,
        message: "Image uploaded successfully",
      });
    } catch (err) {
      console.error("Error uploading image:", err);
      res.status(500).json({
        success: false,
        error: err.message || "Error uploading image",
      });
    }
  }

  /**
   * Serve attachment file
   */
  async serveAttachment(req, res) {
    try {
      const { attachmentId } = req.params;
      const userManager = this.engine.getManager("UserManager");
      const aclManager = this.engine.getManager("ACLManager");
      const attachmentManager = this.engine.getManager("AttachmentManager");

      // 🔒 SECURITY: Check authentication
      const currentUser = req.userContext;
      if (!currentUser || !currentUser.isAuthenticated) {
        return res
          .status(401)
          .send("Authentication required to access attachments");
      }

      const attachment = attachmentManager.getAttachment(attachmentId);
      if (!attachment) {
        return res.status(404).send("Attachment not found");
      }

      // 🔒 SECURITY: Check if user can view the parent page
      const pageName = attachment.pageName;
      const canViewPage = await aclManager.checkAttachmentPermission(
        currentUser,
        attachmentId,
        "view"
      );
      if (!canViewPage) {
        return res.status(403).send("No permission to access this attachment");
      }

      res.setHeader("Content-Type", attachment.mimeType);
      res.setHeader(
        "Content-Disposition",
        `inline; filename="${attachment.originalName}"`
      );
      res.sendFile(path.resolve(attachment.path));
    } catch (err) {
      console.error("Error serving attachment:", err);
      res.status(500).send("Error serving attachment");
    }
  }

  /**
   * Delete attachment
   */
  async deleteAttachment(req, res) {
    try {
      const { attachmentId } = req.params;
      const userManager = this.engine.getManager("UserManager");
      const aclManager = this.engine.getManager("ACLManager");
      const attachmentManager = this.engine.getManager("AttachmentManager");

      // 🔒 SECURITY: Check authentication
      const currentUser = req.userContext;
      if (!currentUser || !currentUser.isAuthenticated) {
        return res.status(401).json({
          success: false,
          error: "Authentication required to delete attachments",
        });
      }

      // Get attachment to check parent page permissions
      const attachment = attachmentManager.getAttachment(attachmentId);
      if (!attachment) {
        return res.status(404).json({
          success: false,
          error: "Attachment not found",
        });
      }

      // 🔒 SECURITY: Check if user can edit/delete from the parent page
      const pageName = attachment.pageName;
      const canEditPage = await aclManager.checkAttachmentPermission(
        currentUser,
        attachmentId,
        "delete"
      );
      if (!canEditPage) {
        return res.status(403).json({
          success: false,
          error: "No permission to delete attachments from this page",
        });
      }

      await attachmentManager.deleteAttachment(attachmentId);

      res.json({
        success: true,
        message: "Attachment deleted successfully",
      });
    } catch (err) {
      console.error("Error deleting attachment:", err);
      res.status(500).json({
        success: false,
        error: err.message || "Error deleting attachment",
      });
    }
  }

  /**
   * Export page selection form
   */
  async exportPage(req, res) {
    try {
      const commonData = await this.getCommonTemplateData(req);
      const pageManager = this.engine.getManager("PageManager");
      const pageNames = await pageManager.getPageNames();

      res.render("export", {
        ...commonData,
        title: "Export Pages",
        pageNames: pageNames,
      });
    } catch (err) {
      console.error("Error loading export page:", err);
      res.status(500).send("Error loading export page");
    }
  }

  /**
   * Export page to HTML
   */
  async exportPageHtml(req, res) {
    try {
      const { page: pageName } = req.params;
      const exportManager = this.engine.getManager("ExportManager");

      const html = await exportManager.exportPageToHtml(pageName);

      res.setHeader("Content-Type", "text/html");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="${pageName}.html"`
      );
      res.send(html);
    } catch (err) {
      console.error("Error exporting to HTML:", err);
      res.status(500).send("Error exporting page");
    }
  }

  /**
   * Export page to Markdown
   */
  async exportPageMarkdown(req, res) {
    try {
      const { page: pageName } = req.params;
      const exportManager = this.engine.getManager("ExportManager");

      const markdown = await exportManager.exportToMarkdown(pageName);

      res.setHeader("Content-Type", "text/markdown");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="${pageName}.md"`
      );
      res.send(markdown);
    } catch (err) {
      console.error("Error exporting to Markdown:", err);
      res.status(500).send("Error exporting page");
    }
  }

  /**
   * List available exports
   */
  async listExports(req, res) {
    try {
      const commonData = await this.getCommonTemplateData(req);
      const exportManager = this.engine.getManager("ExportManager");
      const exports = await exportManager.getExports();

      res.render("exports", {
        ...commonData,
        title: "Exports",
        exports: exports,
      });
    } catch (err) {
      console.error("Error listing exports:", err);
      res.status(500).send("Error listing exports");
    }
  }

  /**
   * Download export file
   */
  async downloadExport(req, res) {
    try {
      const { filename } = req.params;
      const exportManager = this.engine.getManager("ExportManager");
      const exports = await exportManager.getExports();

      const exportFile = exports.find((e) => e.filename === filename);
      if (!exportFile) {
        return res.status(404).send("Export not found");
      }

      res.download(exportFile.path, filename);
    } catch (err) {
      console.error("Error downloading export:", err);
      res.status(500).send("Error downloading export");
    }
  }

  /**
   * Login page
   */
  async loginPage(req, res) {
    try {
      const userManager = this.engine.getManager("UserManager");
      const currentUser = req.userContext;

      // Redirect if already logged in
      if (currentUser && currentUser.isAuthenticated) {
        const redirect = req.query.redirect || "/";
        return res.redirect(redirect);
      }

      const commonData = await this.getCommonTemplateData(req);

      res.render("login", {
        ...commonData,
        title: "Login",
        error: req.query.error,
        redirect: req.query.redirect,
        csrfToken: req.session?.csrfToken || "",
      });
    } catch (err) {
      console.error("Error loading login page:", err);
      res.status(500).send("Error loading login page");
    }
  }

  /**
   * Process login
   */
  async processLogin(req, res) {
    try {
      const { username, password, redirect = "/" } = req.body;
      const userManager = this.engine.getManager("UserManager");
      const configManager = this.engine.getManager("ConfigurationManager");
      const debugLogin = configManager.getProperty(
        "amdwiki.logging.debug.login",
        false
      );

      if (debugLogin) console.log("DEBUG: Login attempt for:", username);

      const user = await userManager.authenticateUser(username, password);
      if (!user) {
        if (debugLogin)
          console.log("DEBUG: Authentication failed for:", username);
        return res.redirect(
          "/login?error=Invalid username or password&redirect=" +
            encodeURIComponent(redirect)
        );
      }

      // Store username in express-session
      req.session.username = user.username;
      req.session.isAuthenticated = true;

      logger.info(`👤 User logged in: ${username}`);

      if (debugLogin) {
        console.log("DEBUG: Session ID:", req.sessionID);
        console.log(
          "DEBUG: Session data before save:",
          JSON.stringify(req.session)
        );
        console.log("DEBUG: Session set, redirecting to:", redirect);
      }

      // Save session before redirect
      req.session.save((err) => {
        if (err) {
          console.error("Error saving session:", err);
          return res.redirect("/login?error=Session save failed");
        }
        if (debugLogin)
          console.log("DEBUG: Session saved successfully, now redirecting");
        res.redirect(redirect);
      });
    } catch (err) {
      console.error("Error processing login:", err);
      res.redirect("/login?error=Login failed");
    }
  }

  /**
   * Process logout
   */
  async processLogout(req, res) {
    try {
      // Destroy express-session
      req.session.destroy((err) => {
        if (err) {
          console.error("Error destroying session:", err);
        }
        res.redirect("/");
      });
    } catch (err) {
      console.error("Error processing logout:", err);
      res.redirect("/");
    }
  }

  /**
   * User info debug page (shows current user state)
   */
  async userInfo(req, res) {
    try {
      const userManager = this.engine.getManager("UserManager");
      const currentUser = req.userContext;
      const sessionId = req.cookies?.sessionId;
      const session = sessionId ? userManager.getSession(sessionId) : null;

      const info = {
        currentUser: currentUser,
        sessionId: sessionId,
        sessionExists: !!session,
        sessionExpired: sessionId && !session,
        userType: !currentUser
          ? "No User/Anonymous"
          : currentUser.username === "anonymous"
          ? "Anonymous"
          : currentUser.username === "asserted"
          ? "Asserted (has cookie)"
          : currentUser.isAuthenticated
          ? "Authenticated"
          : "Unknown",
        hasSessionCookie: !!sessionId,
        permissions: currentUser
          ? userManager.getUserPermissions(currentUser.username)
          : (await userManager.hasPermission(null, "page:read"))
          ? ["anonymous permissions"]
          : [],
      };

      res.json(info);
    } catch (err) {
      console.error("Error getting user info:", err);
      res.status(500).json({ error: err.message });
    }
  }

  /**
   * Registration page
   */
  async registerPage(req, res) {
    try {
      const commonData = await this.getCommonTemplateData(req);

      res.render("register", {
        ...commonData,
        title: "Register",
        error: req.query.error,
        csrfToken: req.session.csrfToken,
      });
    } catch (err) {
      console.error("Error loading register page:", err);
      res.status(500).send("Error loading register page");
    }
  }

  /**
   * Process registration
   */
  async processRegister(req, res) {
    try {
      const { username, email, displayName, password, confirmPassword } =
        req.body;
      const userManager = this.engine.getManager("UserManager");

      // Validation
      if (!username || !email || !password) {
        return res.redirect("/register?error=All fields are required");
      }

      if (password !== confirmPassword) {
        return res.redirect("/register?error=Passwords do not match");
      }

      if (password.length < 6) {
        return res.redirect(
          "/register?error=Password must be at least 6 characters"
        );
      }

      const user = await userManager.createUser({
        username,
        email,
        displayName: displayName || username,
        password,
        roles: ["reader"], // Default role
        isExternal: false, // Local user
        acceptLanguage: req.headers["accept-language"], // Pass browser locale
      });

      console.log(`👤 User registered: ${username}`);
      res.redirect("/login?success=Registration successful");
    } catch (err) {
      console.error("Error processing registration:", err);
      const errorMessage = err.message || "Registration failed";
      res.redirect("/register?error=" + encodeURIComponent(errorMessage));
    }
  }

  /**
   * User profile page
   */
  async profilePage(req, res) {
    console.log("DEBUG: profilePage accessed");
    try {
      const userManager = this.engine.getManager("UserManager");
      const currentUser = req.userContext;

      console.log(
        "DEBUG: currentUser from req.userContext:",
        currentUser ? currentUser.username : "null"
      );

      if (!currentUser || !currentUser.isAuthenticated) {
        console.log("DEBUG: No authenticated user, redirecting to login");
        return res.redirect("/login?redirect=/profile");
      }

      // Get fresh user data from database to ensure we have latest preferences
      const freshUser = userManager.getUser(currentUser.username);
      console.log(
        "DEBUG: profilePage - fresh user preferences:",
        freshUser ? freshUser.preferences : "no fresh user"
      );

      const commonData = await this.getCommonTemplateData(req);
      const userPermissions = await userManager.getUserPermissions(
        currentUser.username
      );

      // Get timezone and date format configuration
      const configManager = this.engine.getManager("ConfigurationManager");
      const availableTimezones = configManager
        ? configManager.getProperty("amdwiki.timezones", [])
        : [];

      const LocaleUtils = require("../utils/LocaleUtils");
      const availableDateFormats = LocaleUtils.getDateFormatOptions();

      res.render("profile", {
        ...commonData,
        title: "Profile",
        user: freshUser || currentUser, // Use fresh user data if available
        permissions: userPermissions,
        availableTimezones: availableTimezones,
        availableDateFormats: availableDateFormats,
        error: req.query.error,
        success: req.query.success,
        csrfToken: req.session.csrfToken,
      });
    } catch (err) {
      console.error("Error loading profile page:", err);
      res.status(500).send("Error loading profile page");
    }
  }

  /**
   * Update user profile
   */
  async updateProfile(req, res) {
    try {
      const userManager = this.engine.getManager("UserManager");
      const currentUser = req.userContext;

      if (!currentUser || !currentUser.isAuthenticated) {
        return res.redirect("/login");
      }

      const {
        displayName,
        email,
        currentPassword,
        newPassword,
        confirmPassword,
      } = req.body;
      const updates = {};

      if (displayName) updates.displayName = displayName;
      if (email) updates.email = email;

      // Handle password change for local users only
      if (newPassword && !currentUser.isExternal) {
        if (!currentPassword) {
          return res.redirect(
            "/profile?error=Current password required to change password"
          );
        }

        if (newPassword !== confirmPassword) {
          return res.redirect("/profile?error=New passwords do not match");
        }

        if (newPassword.length < 6) {
          return res.redirect(
            "/profile?error=Password must be at least 6 characters"
          );
        }

        // Verify current password
        const isValidPassword = await userManager.authenticateUser(
          currentUser.username,
          currentPassword
        );
        if (!isValidPassword) {
          return res.redirect("/profile?error=Current password is incorrect");
        }

        updates.password = newPassword;
      } else if (newPassword && currentUser.isExternal) {
        return res.redirect(
          "/profile?error=Cannot change password for OAuth accounts"
        );
      }

      await userManager.updateUser(currentUser.username, updates);

      res.redirect("/profile?success=Profile updated successfully");
    } catch (err) {
      console.error("Error updating profile:", err);
      res.redirect("/profile?error=Failed to update profile");
    }
  }

  /**
   * Update user preferences
   */
  async updatePreferences(req, res) {
    console.log("=== updatePreferences method called ===");
    try {
      console.log("DEBUG: Request body:", req.body);
      const userManager = this.engine.getManager("UserManager");
      const currentUser = req.userContext;

      console.log(
        "DEBUG: Current user:",
        currentUser ? currentUser.username : "null"
      );

      if (!currentUser || !currentUser.isAuthenticated) {
        console.log("DEBUG: No current user, redirecting to login");
        return res.redirect("/login");
      }

      console.log("DEBUG: updatePreferences - req.body:", req.body);
      console.log(
        "DEBUG: updatePreferences - currentUser:",
        currentUser.username
      );

      // Get current user's existing preferences
      const currentPreferences = currentUser.preferences || {};
      console.log(
        "DEBUG: updatePreferences - current preferences:",
        currentPreferences
      );

      // Extract preference values from form and merge with existing
      const preferences = { ...currentPreferences };

      // Editor preferences
      preferences["editor.plain.smartpairs"] =
        req.body["editor.plain.smartpairs"] === "on";
      preferences["editor.autoindent"] = req.body["editor.autoindent"] === "on";
      preferences["editor.linenumbers"] =
        req.body["editor.linenumbers"] === "on";
      preferences["editor.theme"] = req.body["editor.theme"] || "default";

      // Display preferences
      preferences["display.pagesize"] = req.body["display.pagesize"] || "25";
      preferences["display.tooltips"] = req.body["display.tooltips"] === "on";
      preferences["display.readermode"] =
        req.body["display.readermode"] === "on";
      preferences["display.theme"] = req.body["display.theme"] || "system";

      // Locale preferences (new system)
      if (req.body["preferences.locale"]) {
        preferences["locale"] = req.body["preferences.locale"];
      }
      if (req.body["preferences.timeFormat"]) {
        preferences["timeFormat"] = req.body["preferences.timeFormat"];
      }
      if (req.body["preferences.timezone"]) {
        preferences["timezone"] = req.body["preferences.timezone"];
      }

      // Handle date format preference
      if (req.body["preferences.dateFormat"]) {
        const selectedDateFormat = req.body["preferences.dateFormat"];
        if (selectedDateFormat === "auto") {
          // Use locale-based format
          const LocaleUtils = require("../utils/LocaleUtils");
          preferences["dateFormat"] = LocaleUtils.getDateFormatFromLocale(
            req.body["preferences.locale"] || "en-US"
          );
        } else {
          // Use manually selected format
          preferences["dateFormat"] = selectedDateFormat;
        }
      } else if (req.body["preferences.locale"]) {
        // Fallback: Update dateFormat based on locale if locale is provided but no explicit dateFormat
        const LocaleUtils = require("../utils/LocaleUtils");
        preferences["dateFormat"] = LocaleUtils.getDateFormatFromLocale(
          req.body["preferences.locale"]
        );
      }

      console.log(
        "DEBUG: updatePreferences - preferences to save:",
        preferences
      );

      // Update user with new preferences
      await userManager.updateUser(currentUser.username, { preferences });

      console.log("DEBUG: updatePreferences - preferences saved successfully");
      res.redirect("/profile?success=Preferences saved successfully");
    } catch (err) {
      console.error("Error updating preferences:", err);
      res.redirect("/profile?error=Failed to save preferences");
    }
  }

  /**
   * Admin dashboard
   */
  async adminDashboard(req, res) {
    try {
      const currentUser = req.userContext;
      const aclManager = this.engine.getManager("ACLManager");

      // Check admin access using PolicyEvaluator
      const hasAccess = await aclManager.checkPagePermission(
        "AdminDashboard",
        "view",
        currentUser
      );

      if (!currentUser || !currentUser.isAuthenticated || !hasAccess) {
        return await this.renderError(
          req,
          res,
          403,
          "Access Denied",
          "You do not have permission to access the admin dashboard"
        );
      }

      const userManager = this.engine.getManager("UserManager");

      const commonData = await this.getCommonTemplateData(req);
      const users = userManager.getUsers();
      const roles = userManager.getRoles();

      // Get all required pages for the admin dashboard
      const pageManager = this.engine.getManager("PageManager");
      const allPageNames = await pageManager.getAllPages();
      const requiredPages = [];

      for (const pageName of allPageNames) {
        if (await this.isRequiredPage(pageName)) {
          requiredPages.push(pageName);
        }
      }

      // Gather system statistics
      const stats = {
        totalUsers: users.length,
        uptime: Math.floor(process.uptime()) + " seconds",
        version: "1.0.0",
      };

      // Mock recent activity (in a real implementation, this would come from logs)
      const recentActivity = [
        {
          timestamp: new Date().toLocaleString(),
          description: "User logged in: " + currentUser.username,
        },
        {
          timestamp: new Date(Date.now() - 60000).toLocaleString(),
          description: "System started",
        },
      ];

      // Get system notifications
      let notifications = [];
      try {
        const notificationManager = this.engine.getManager(
          "NotificationManager"
        );
        notifications = notificationManager.getAllNotifications().slice(-10); // Get last 10 notifications
      } catch (error) {
        console.error(
          "Error fetching notifications for admin dashboard:",
          error
        );
      }

      const templateData = {
        ...commonData,
        title: "Admin Dashboard",
        users: users,
        roles: roles,
        userCount: users.length,
        roleCount: roles.length,
        stats: stats,
        recentActivity: recentActivity,
        requiredPages: requiredPages,
        notifications: notifications,
        maintenanceMode:
          this.engine.config?.features?.maintenance?.enabled || false,
        csrfToken: req.session.csrfToken,
        successMessage: req.query.success || null,
        errorMessage: req.query.error || null,
      };

      res.render("admin-dashboard", templateData);
    } catch (err) {
      console.error("Error loading admin dashboard:", err);
      res.status(500).send("Error loading admin dashboard");
    }
  }

  /**
   * Toggle maintenance mode (admin only)
   */
  async adminToggleMaintenance(req, res) {
    try {
      const userManager = this.engine.getManager("UserManager");
      const currentUser = req.userContext;

      if (
        !currentUser ||
        !(await userManager.hasPermission(currentUser.username, "admin:system"))
      ) {
        return res.status(403).send("Access denied");
      }

      // Toggle maintenance mode in config
      const config = this.engine.config;
      const currentMode = config.features?.maintenance?.enabled || false;
      config.features.maintenance.enabled = !currentMode;

      // Log the maintenance mode change
      logger.info(
        `Maintenance mode ${
          config.features.maintenance.enabled ? "ENABLED" : "DISABLED"
        } by ${currentUser.username}`,
        {
          action: "maintenance_mode_toggle",
          newState: config.features.maintenance.enabled,
          user: currentUser.username,
          userIP: req.ip || req.connection.remoteAddress,
          userAgent: req.get("User-Agent"),
          timestamp: new Date().toISOString(),
        }
      );

      // Create notification for all users about maintenance mode change
      try {
        const notificationManager = this.engine.getManager(
          "NotificationManager"
        );
        await notificationManager.createMaintenanceNotification(
          config.features.maintenance.enabled,
          currentUser.username,
          config.features.maintenance
        );

        logger.info(`Maintenance notification created for mode change`, {
          action: "maintenance_notification_created",
          mode: config.features.maintenance.enabled ? "enabled" : "disabled",
          triggeredBy: currentUser.username,
          timestamp: new Date().toISOString(),
        });
      } catch (notificationError) {
        logger.error(`Failed to create maintenance notification`, {
          action: "maintenance_notification_failed",
          error: notificationError.message,
          mode: config.features.maintenance.enabled ? "enabled" : "disabled",
          triggeredBy: currentUser.username,
          timestamp: new Date().toISOString(),
        });
      }

      // Create detailed success message
      const action = config.features.maintenance.enabled
        ? "ENABLED"
        : "DISABLED";
      const message =
        `Maintenance mode has been ${action.toLowerCase()}. ` +
        (config.features.maintenance.enabled
          ? "Regular users will see a maintenance page until it is disabled."
          : "The system is now fully accessible to all users.");

      // Redirect back to admin dashboard with detailed success message
      res.redirect(`/admin?success=${encodeURIComponent(message)}`);
    } catch (err) {
      logger.error("Error toggling maintenance mode", {
        error: err.message,
        stack: err.stack,
        user: req.session?.user?.username || "unknown",
      });
      res.redirect("/admin?error=Failed to toggle maintenance mode");
    }
  }

  /**
   * Admin policy management dashboard
   */
  async adminPolicies(req, res) {
    try {
      const userManager = this.engine.getManager("UserManager");
      const currentUser = req.userContext;

      if (
        !currentUser ||
        !(await userManager.hasPermission(currentUser.username, "admin:system"))
      ) {
        return await this.renderError(
          req,
          res,
          403,
          "Access Denied",
          "You do not have permission to access policy management"
        );
      }

      const commonData = await this.getCommonTemplateData(req);
      const policyManager = this.engine.getManager("PolicyManager");

      if (!policyManager) {
        return await this.renderError(
          req,
          res,
          500,
          "Configuration Error",
          "PolicyManager is not available"
        );
      }

      const policies = policyManager.getPolicies();

      res.render("admin-policies", {
        ...commonData,
        title: "Policy Management",
        policies: policies,
        user: currentUser,
        csrfToken: req.session.csrfToken || "",
        successMessage: req.query.success || null,
        errorMessage: req.query.error || null,
      });
    } catch (err) {
      console.error("Error loading policy management:", err);
      res.status(500).send("Error loading policy management");
    }
  }

  /**
   * Create a new policy
   */
  async adminCreatePolicy(req, res) {
    try {
      const userManager = this.engine.getManager("UserManager");
      const currentUser = req.userContext;

      if (
        !currentUser ||
        !(await userManager.hasPermission(currentUser.username, "admin:system"))
      ) {
        return res.status(403).json({ error: "Access denied" });
      }

      const policyManager = this.engine.getManager("PolicyManager");
      const policyValidator = this.engine.getManager("PolicyValidator");

      if (!policyManager || !policyValidator) {
        return res.status(500).json({ error: "Policy system not available" });
      }

      const policyData = req.body;

      // Validate and save the policy
      const result = await policyValidator.validateAndSavePolicy(policyData);

      res.json({
        success: true,
        policy: result.policy,
        message: "Policy created successfully",
      });
    } catch (err) {
      console.error("Error creating policy:", err);
      res.status(500).json({
        error: "Failed to create policy",
        details: err.message,
      });
    }
  }

  /**
   * Get a specific policy
   */
  async adminGetPolicy(req, res) {
    try {
      const userManager = this.engine.getManager("UserManager");
      const currentUser = req.userContext;

      if (
        !currentUser ||
        !(await userManager.hasPermission(currentUser.username, "admin:system"))
      ) {
        return res.status(403).json({ error: "Access denied" });
      }

      const policyManager = this.engine.getManager("PolicyManager");
      const policyId = req.params.id;

      if (!policyManager) {
        return res.status(500).json({ error: "Policy system not available" });
      }

      const policy = policyManager.getPolicy(policyId);

      if (!policy) {
        return res.status(404).json({ error: "Policy not found" });
      }

      res.json(policy);
    } catch (err) {
      console.error("Error retrieving policy:", err);
      res.status(500).json({
        error: "Failed to retrieve policy",
        details: err.message,
      });
    }
  }

  /**
   * Update an existing policy
   */
  async adminUpdatePolicy(req, res) {
    try {
      const userManager = this.engine.getManager("UserManager");
      const currentUser = req.userContext;

      if (
        !currentUser ||
        !(await userManager.hasPermission(currentUser.username, "admin:system"))
      ) {
        return res.status(403).json({ error: "Access denied" });
      }

      const policyManager = this.engine.getManager("PolicyManager");
      const policyValidator = this.engine.getManager("PolicyValidator");
      const policyId = req.params.id;
      const policyData = { ...req.body, id: policyId };

      if (!policyManager || !policyValidator) {
        return res.status(500).json({ error: "Policy system not available" });
      }

      // Validate and save the updated policy
      const result = await policyValidator.validateAndSavePolicy(policyData);

      res.json({
        success: true,
        policy: result.policy,
        message: "Policy updated successfully",
      });
    } catch (err) {
      console.error("Error updating policy:", err);
      res.status(500).json({
        error: "Failed to update policy",
        details: err.message,
      });
    }
  }

  /**
   * Delete a policy
   */
  async adminDeletePolicy(req, res) {
    try {
      const userManager = this.engine.getManager("UserManager");
      const currentUser = req.userContext;

      if (
        !currentUser ||
        !(await userManager.hasPermission(currentUser.username, "admin:system"))
      ) {
        return res.status(403).json({ error: "Access denied" });
      }

      const policyManager = this.engine.getManager("PolicyManager");
      const policyId = req.params.id;

      if (!policyManager) {
        return res.status(500).json({ error: "Policy system not available" });
      }

      const success = await policyManager.deletePolicy(policyId);

      if (!success) {
        return res.status(404).json({ error: "Policy not found" });
      }

      res.json({
        success: true,
        message: "Policy deleted successfully",
      });
    } catch (err) {
      console.error("Error deleting policy:", err);
      res.status(500).json({
        error: "Failed to delete policy",
        details: err.message,
      });
    }
  }

  /**
   * Admin users management
   */
  async adminUsers(req, res) {
    try {
      const userManager = this.engine.getManager("UserManager");
      const currentUser = req.userContext;

      if (
        !currentUser ||
        !(await userManager.hasPermission(currentUser.username, "admin:users"))
      ) {
        return await this.renderError(
          req,
          res,
          403,
          "Access Denied",
          "You do not have permission to access user management"
        );
      }

      const commonData = await this.getCommonTemplateData(req);
      const users = userManager.getUsers();
      const roles = userManager.getRoles();

      res.render("admin-users", {
        ...commonData,
        title: "User Management",
        users: users,
        roles: roles,
        successMessage: req.query.success || null,
        errorMessage: req.query.error || null,
        csrfToken: req.session.csrfToken,
      });
    } catch (err) {
      console.error("Error loading admin users:", err);
      res.status(500).send("Error loading user management");
    }
  }

  /**
   * Create new user (admin)
   */
  async adminCreateUser(req, res) {
    try {
      const userManager = this.engine.getManager("UserManager");
      const currentUser = req.userContext;

      if (
        !currentUser ||
        !(await userManager.hasPermission(currentUser.username, "admin:users"))
      ) {
        return res.status(403).send("Access denied");
      }

      const { username, email, displayName, password, roles } = req.body;

      const success = await userManager.createUser({
        username,
        email,
        displayName,
        password,
        roles: Array.isArray(roles) ? roles : [roles],
        acceptLanguage: req.headers["accept-language"], // Pass browser locale
      });

      if (success) {
        res.redirect("/admin/users?success=User created successfully");
      } else {
        res.redirect("/admin/users?error=Failed to create user");
      }
    } catch (err) {
      console.error("Error creating user:", err);
      res.redirect("/admin/users?error=Error creating user");
    }
  }

  /**
   * Update user (admin)
   */
  async adminUpdateUser(req, res) {
    try {
      const userManager = this.engine.getManager("UserManager");
      const currentUser = req.userContext;

      if (
        !currentUser ||
        !(await userManager.hasPermission(currentUser.username, "admin:users"))
      ) {
        return res
          .status(403)
          .json({ success: false, message: "Access denied" });
      }

      const username = req.params.username;
      const updates = req.body;

      const success = await userManager.updateUser(username, updates);

      if (success) {
        res.json({ success: true, message: "User updated successfully" });
      } else {
        res
          .status(400)
          .json({ success: false, message: "Failed to update user" });
      }
    } catch (err) {
      console.error("Error updating user:", err);
      res.status(500).json({ success: false, message: "Error updating user" });
    }
  }

  /**
   * Delete user (admin)
   */
  async adminDeleteUser(req, res) {
    try {
      const userManager = this.engine.getManager("UserManager");
      const currentUser = req.userContext;

      if (
        !currentUser ||
        !(await userManager.hasPermission(currentUser.username, "admin:users"))
      ) {
        return res.status(403).send("Access denied");
      }

      const username = req.params.username;
      const success = await userManager.deleteUser(username);

      if (success) {
        res.json({ success: true, message: "User deleted successfully" });
      } else {
        res
          .status(400)
          .json({ success: false, message: "Failed to delete user" });
      }
    } catch (err) {
      console.error("Error deleting user:", err);
      res.status(500).json({ success: false, message: "Error deleting user" });
    }
  }

  /**
   * Admin roles management
   */
  async adminRoles(req, res) {
    try {
      const userManager = this.engine.getManager("UserManager");
      const currentUser = req.userContext;

      if (
        !currentUser ||
        !(await userManager.hasPermission(currentUser.username, "admin:roles"))
      ) {
        return await this.renderError(
          req,
          res,
          403,
          "Access Denied",
          "You do not have permission to manage roles"
        );
      }

      const commonData = await this.getCommonTemplateData(req);
      const roles = userManager.getRoles();
      const permissions = userManager.getPermissions();

      res.render("admin-roles", {
        ...commonData,
        title: "Security Policy Management",
        roles: Array.from(roles.values()),
        permissions: Array.from(permissions.entries()).map(([key, desc]) => ({
          key,
          description: desc,
        })),
      });
    } catch (err) {
      console.error("Error loading admin roles:", err);
      res.status(500).send("Error loading role management");
    }
  }

  /**
   * Update role permissions (admin only)
   */
  async adminUpdateRole(req, res) {
    try {
      const userManager = this.engine.getManager("UserManager");
      const currentUser = req.userContext;

      if (
        !currentUser ||
        !(await userManager.hasPermission(currentUser.username, "admin:roles"))
      ) {
        return res
          .status(403)
          .json({ success: false, message: "Access denied" });
      }

      const { roleName, permissions, displayName, description } = req.body;

      if (!roleName) {
        return res
          .status(400)
          .json({ success: false, message: "Role name required" });
      }

      const success = await userManager.updateRolePermissions(roleName, {
        permissions: permissions || [],
        displayName: displayName || roleName,
        description: description || "",
      });

      if (success) {
        res.json({ success: true, message: "Role updated successfully" });
      } else {
        res
          .status(400)
          .json({ success: false, message: "Failed to update role" });
      }
    } catch (err) {
      console.error("Error updating role:", err);
      res.status(500).json({ success: false, message: "Error updating role" });
    }
  }

  /**
   * Create new role (admin only)
   */
  async adminCreateRole(req, res) {
    try {
      const userManager = this.engine.getManager("UserManager");
      const currentUser = req.userContext;

      if (
        !currentUser ||
        !(await userManager.hasPermission(currentUser.username, "admin:roles"))
      ) {
        return res
          .status(403)
          .json({ success: false, message: "Access denied" });
      }

      const { name, displayName, description, permissions } = req.body;

      if (!name) {
        return res
          .status(400)
          .json({ success: false, message: "Role name required" });
      }

      const roleData = {
        name,
        displayName: displayName || name,
        description: description || "",
        permissions: Array.isArray(permissions) ? permissions : [],
      };

      const role = await userManager.createRole(roleData);

      if (role) {
        res.json({ success: true, message: "Role created successfully", role });
      } else {
        res
          .status(400)
          .json({ success: false, message: "Failed to create role" });
      }
    } catch (err) {
      console.error("Error creating role:", err);
      if (err.message === "Role already exists") {
        res
          .status(409)
          .json({ success: false, message: "Role already exists" });
      } else {
        res
          .status(500)
          .json({ success: false, message: "Error creating role" });
      }
    }
  }

  /**
   * Delete role (admin only)
   */
  async adminDeleteRole(req, res) {
    try {
      const userManager = this.engine.getManager("UserManager");
      const currentUser = req.userContext;

      if (
        !currentUser ||
        !(await userManager.hasPermission(currentUser.username, "admin:roles"))
      ) {
        return res
          .status(403)
          .json({ success: false, message: "Access denied" });
      }

      const { role } = req.params;

      if (!role) {
        return res
          .status(400)
          .json({ success: false, message: "Role name required" });
      }

      await userManager.deleteRole(role);

      res.json({ success: true, message: "Role deleted successfully" });
    } catch (err) {
      console.error("Error deleting role:", err);
      if (err.message === "Role not found") {
        res.status(404).json({ success: false, message: "Role not found" });
      } else if (err.message === "Cannot delete system role") {
        res
          .status(403)
          .json({ success: false, message: "Cannot delete system role" });
      } else {
        res
          .status(500)
          .json({ success: false, message: "Error deleting role" });
      }
    }
  }

  /**
   * Admin configuration management page
   */
  async adminConfiguration(req, res) {
    try {
      const userManager = this.engine.getManager("UserManager");
      const currentUser = req.userContext;

      if (
        !currentUser ||
        !(await userManager.hasPermission(currentUser.username, "admin:system"))
      ) {
        return await this.renderError(
          req,
          res,
          403,
          "Access Denied",
          "You do not have permission to access configuration management"
        );
      }

      const configManager = this.engine.getManager("ConfigurationManager");
      const defaultProperties = configManager.getDefaultProperties();
      const customProperties = configManager.getCustomProperties();
      const mergedProperties = configManager.getAllProperties();

      const templateData = {
        title: "Configuration Management",
        user: currentUser,
        message: req.query.success,
        error: req.query.error,
        defaultProperties,
        customProperties,
        mergedProperties,
        csrfToken: req.session.csrfToken,
      };

      res.render("admin-configuration", templateData);
    } catch (err) {
      console.error("Error loading admin configuration:", err);
      res.status(500).send("Error loading configuration management");
    }
  }

  /**
   * Update configuration property
   */
  async adminUpdateConfiguration(req, res) {
    try {
      const userManager = this.engine.getManager("UserManager");
      const currentUser = req.userContext;

      if (
        !currentUser ||
        !(await userManager.hasPermission(currentUser.username, "admin:system"))
      ) {
        return res.status(403).json({ error: "Admin access required" });
      }

      const configManager = this.engine.getManager("ConfigurationManager");
      const { property, value } = req.body;

      if (!property) {
        return res.status(400).json({ error: "Property name is required" });
      }

      // Validate property name (must start with amdwiki.)
      if (!property.startsWith("amdwiki.") && !property.startsWith("log4j.")) {
        return res
          .status(400)
          .json({ error: "Property must start with amdwiki. or log4j." });
      }

      await configManager.setProperty(property, value);
      res.redirect(
        "/admin/configuration?success=Configuration updated successfully"
      );
    } catch (err) {
      console.error("Error updating configuration:", err);
      res.redirect("/admin/configuration?error=Failed to update configuration");
    }
  }

  /**
   * Reset configuration to defaults
   */
  async adminResetConfiguration(req, res) {
    try {
      const userManager = this.engine.getManager("UserManager");
      const currentUser = req.userContext;

      if (
        !currentUser ||
        !(await userManager.hasPermission(currentUser.username, "admin:system"))
      ) {
        return res.status(403).json({ error: "Admin access required" });
      }

      const configManager = this.engine.getManager("ConfigurationManager");
      await configManager.resetToDefaults();
      res.redirect(
        "/admin/configuration?success=Configuration reset to defaults"
      );
    } catch (err) {
      console.error("Error resetting configuration:", err);
      res.redirect("/admin/configuration?error=Failed to reset configuration");
    }
  }

  /**
   * Admin variable management page
   */
  async adminVariables(req, res) {
    try {
      const userManager = this.engine.getManager("UserManager");
      const currentUser = req.userContext;

      if (
        !currentUser ||
        !(await userManager.hasPermission(currentUser.username, "admin:system"))
      ) {
        return await this.renderError(
          req,
          res,
          403,
          "Access Denied",
          "You do not have permission to access variable management"
        );
      }

      const variableManager = this.engine.getManager("VariableManager");
      if (!variableManager) {
        return await this.renderError(
          req,
          res,
          500,
          "Service Unavailable",
          "VariableManager not available"
        );
      }

      const debugInfo = variableManager.getDebugInfo();

      const templateData = {
        title: "Variable Management",
        user: currentUser,
        message: req.query.success,
        error: req.query.error,
        variableManager: variableManager,
        systemVariables: debugInfo.systemVariables,
        contextualVariables: debugInfo.contextualVariables,
        debugInfo: {
          systemVariables: debugInfo.systemVariables.length,
          contextualVariables: debugInfo.contextualVariables.length,
          totalVariables: debugInfo.totalVariables,
        },
        csrfToken: req.session.csrfToken,
      };

      res.render("admin-variables", templateData);
    } catch (err) {
      console.error("Error loading admin variables:", err);
      res.status(500).send("Error loading variable management");
    }
  }

  /**
   * Test variable expansion
   */
  async adminTestVariables(req, res) {
    try {
      const userManager = this.engine.getManager("UserManager");
      const currentUser = req.userContext;

      if (
        !currentUser ||
        !(await userManager.hasPermission(currentUser.username, "admin:system"))
      ) {
        return res.status(403).json({ error: "Admin access required" });
      }

      const variableManager = this.engine.getManager("VariableManager");
      if (!variableManager) {
        return res.status(500).json({ error: "VariableManager not available" });
      }

      const { content, pageName } = req.body;

      const context = {
        userContext: currentUser,
        pageName: pageName || "Test Page",
      };

      const result = variableManager.expandVariables(content || "", context);

      // Redirect back with the result
      const debugInfo = variableManager.getDebugInfo();
      const templateData = {
        title: "Variable Management",
        user: currentUser,
        message: "Variable expansion test completed",
        testResult: result,
        variableManager: variableManager,
        systemVariables: debugInfo.systemVariables,
        contextualVariables: debugInfo.contextualVariables,
        debugInfo: {
          systemVariables: debugInfo.systemVariables.length,
          contextualVariables: debugInfo.contextualVariables.length,
          totalVariables: debugInfo.totalVariables,
        },
        csrfToken: req.session.csrfToken,
      };

      res.render("admin-variables", templateData);
    } catch (err) {
      console.error("Error testing variables:", err);
      res.redirect("/admin/variables?error=Failed to test variables");
    }
  }

  /**
   * Admin settings page
   */
  async adminSettings(req, res) {
    try {
      const userManager = this.engine.getManager("UserManager");
      const currentUser = req.userContext;

      if (
        !currentUser ||
        !(await userManager.hasPermission(currentUser.username, "admin:system"))
      ) {
        return await this.renderError(
          req,
          res,
          403,
          "Access Denied",
          "You do not have permission to access system settings"
        );
      }

      const commonData = await this.getCommonTemplateData(req);
      const leftMenuContent = await this.getLeftMenu();

      // System configuration settings (you can expand this)
      const settings = {
        systemName: "amdWiki",
        version: "1.0.0",
        theme: "default",
        maxFileSize: "10MB",
        allowRegistration: true,
        sessionTimeout: "24 hours",
      };

      res.render("admin-settings", {
        ...commonData,
        title: "System Settings",
        leftMenuContent: leftMenuContent,
        settings: settings,
      });
    } catch (err) {
      console.error("Error loading admin settings:", err);
      res.status(500).send("Error loading system settings");
    }
  }

  /**
   * Get raw page source (markdown content) for viewing/copying
   */
  async getPageSource(req, res) {
    try {
      const pageName = decodeURIComponent(req.params.page);
      const pageManager = this.engine.getManager("PageManager");

      const page = await pageManager.getPage(pageName);
      if (!page) {
        return res.status(404).send("Page not found");
      }

      // Return the raw markdown content
      res.setHeader("Content-Type", "text/plain; charset=utf-8");
      res.send(page.content || "");
    } catch (error) {
      console.error("Error retrieving page source:", error);
      res.status(500).send("Error retrieving page source");
    }
  }

  // ============================================================================
  // Admin Organization Management Route Handlers
  // ============================================================================

  /**
   * Admin Organizations Management Page
   */
  async adminOrganizations(req, res) {
    try {
      const userManager = this.engine.getManager("UserManager");
      const currentUser = req.userContext;

      if (
        !currentUser ||
        !(await userManager.hasPermission(currentUser.username, "admin:system"))
      ) {
        return await this.renderError(
          req,
          res,
          403,
          "Access Denied",
          "Admin access required"
        );
      }

      const templateData = await this.getCommonTemplateData(req);

      // Try to get SchemaManager, fallback gracefully
      let organizations = [];
      try {
        const schemaManager = this.engine.getManager("SchemaManager");
        organizations = schemaManager.getOrganizations();
      } catch (err) {
        console.warn("SchemaManager not available:", err.message);
        // Create default organization from config
        const config = this.engine.getConfig();
        organizations = [
          {
            "@context": "https://schema.org",
            "@type": "Organization",
            identifier: "amdwiki-platform",
            name: config.get("applicationName", "amdWiki Platform"),
            description:
              "Digital platform for wiki, document management, and modular content systems",
          },
        ];
      }

      templateData.organizations = organizations;
      templateData.pageTitle = "Organization Management";
      templateData.success = req.query.success;
      templateData.error = req.query.error;

      res.render("admin-organizations", templateData);
    } catch (error) {
      console.error("Error loading admin organizations page:", error);
      await this.renderError(
        req,
        res,
        500,
        "Server Error",
        "Failed to load organizations management"
      );
    }
  }

  /**
   * Create New Organization
   */
  async adminCreateOrganization(req, res) {
    try {
      const userManager = this.engine.getManager("UserManager");
      const userContext = req.userContext;
      if (!userContext.isAuthenticated || !userContext.isAdmin) {
        return res.status(403).json({ error: "Admin access required" });
      }

      const schemaManager = this.engine.getManager("SchemaManager");
      const organizationData = req.body;

      // Validate and create organization
      const newOrganization = await schemaManager.createOrganization(
        organizationData
      );

      if (req.headers.accept?.includes("application/json")) {
        res.json({ success: true, organization: newOrganization });
      } else {
        res.redirect(
          "/admin/organizations?success=Organization created successfully"
        );
      }
    } catch (error) {
      console.error("Error creating organization:", error);
      if (req.headers.accept?.includes("application/json")) {
        res.status(500).json({ error: error.message });
      } else {
        res.redirect(
          "/admin/organizations?error=" + encodeURIComponent(error.message)
        );
      }
    }
  }

  /**
   * Update Existing Organization
   */
  async adminUpdateOrganization(req, res) {
    try {
      const userManager = this.engine.getManager("UserManager");
      const userContext = req.userContext;
      if (!userContext.isAuthenticated || !userContext.isAdmin) {
        return res.status(403).json({ error: "Admin access required" });
      }

      const schemaManager = this.engine.getManager("SchemaManager");
      const identifier = req.params.identifier;
      const organizationData = req.body;

      // Update organization
      const updatedOrganization = await schemaManager.updateOrganization(
        identifier,
        organizationData
      );

      if (req.headers.accept?.includes("application/json")) {
        res.json({ success: true, organization: updatedOrganization });
      } else {
        res.redirect(
          "/admin/organizations?success=Organization updated successfully"
        );
      }
    } catch (error) {
      console.error("Error updating organization:", error);
      if (req.headers.accept?.includes("application/json")) {
        res.status(500).json({ error: error.message });
      } else {
        res.redirect(
          "/admin/organizations?error=" + encodeURIComponent(error.message)
        );
      }
    }
  }

  /**
   * Delete Organization
   */
  async adminDeleteOrganization(req, res) {
    try {
      const userManager = this.engine.getManager("UserManager");
      const userContext = req.userContext;
      if (!userContext.isAuthenticated || !userContext.isAdmin) {
        return res.status(403).json({ error: "Admin access required" });
      }

      const schemaManager = this.engine.getManager("SchemaManager");
      const identifier = req.params.identifier;

      // Delete organization
      await schemaManager.deleteOrganization(identifier);

      if (req.headers.accept?.includes("application/json")) {
        res.json({ success: true });
      } else {
        res.redirect(
          "/admin/organizations?success=Organization deleted successfully"
        );
      }
    } catch (error) {
      console.error("Error deleting organization:", error);
      if (req.headers.accept?.includes("application/json")) {
        res.status(500).json({ error: error.message });
      } else {
        res.redirect(
          "/admin/organizations?error=" + encodeURIComponent(error.message)
        );
      }
    }
  }

  /**
   * Get Single Organization (API endpoint)
   */
  async adminGetOrganization(req, res) {
    try {
      const userManager = this.engine.getManager("UserManager");
      const userContext = req.userContext;
      if (!userContext.isAuthenticated || !userContext.isAdmin) {
        return res.status(403).json({ error: "Admin access required" });
      }

      const schemaManager = this.engine.getManager("SchemaManager");
      const identifier = req.params.identifier;
      const organization = await schemaManager.getOrganization(identifier);

      if (!organization) {
        return res.status(404).json({ error: "Organization not found" });
      }

      res.json(organization);
    } catch (error) {
      console.error("Error getting organization:", error);
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * Admin route to validate all files and check for naming convention compliance
   */
  async adminValidateFiles(req, res) {
    try {
      const userManager = this.engine.getManager("UserManager");
      const userContext = await userManager.getCurrentUser(req);

      if (!userContext.isAuthenticated || !userContext.isAdmin) {
        return await this.renderError(
          req,
          res,
          403,
          "Access Denied",
          "Admin access required"
        );
      }

      const pageManager = this.engine.getManager("PageManager");
      const dryRun = req.query.dryRun === "true";

      // Run validation
      const report = await pageManager.validateAndFixAllFiles({ dryRun });

      // Render validation report
      const templateData = await this.getCommonTemplateData(userContext);
      templateData.title = "File Validation Report";
      templateData.report = report;
      templateData.dryRun = dryRun;

      res.render("admin-validation-report", templateData);
    } catch (err) {
      console.error("Error validating files:", err);
      await this.renderError(req, res, 500, "Validation Error", err.message);
    }
  }

  /**
   * Admin API route to fix all non-compliant files
   */
  async adminFixFiles(req, res) {
    try {
      const userManager = this.engine.getManager("UserManager");
      const userContext = await userManager.getCurrentUser(req);

      if (!userContext.isAuthenticated || !userContext.isAdmin) {
        return res.status(403).json({ error: "Admin access required" });
      }

      const pageManager = this.engine.getManager("PageManager");

      // Run fixes (not dry run)
      const report = await pageManager.validateAndFixAllFiles({
        dryRun: false,
      });

      res.json({
        success: true,
        message: `Fixed ${report.fixedFiles} files out of ${report.invalidFiles} invalid files`,
        report,
      });
    } catch (err) {
      console.error("Error fixing files:", err);
      res.status(500).json({
        success: false,
        error: err.message,
      });
    }
  }

  /**
   * Get Organization Schema.org JSON-LD (API endpoint)
   */
  async adminGetOrganizationSchema(req, res) {
    try {
      const userManager = this.engine.getManager("UserManager");
      const currentUser = req.userContext;
      if (
        !currentUser ||
        !(await userManager.hasPermission(currentUser.username, "admin:system"))
      ) {
        return res.status(403).json({ error: "Admin access required" });
      }

      const schemaManager = this.engine.getManager("SchemaManager");
      const identifier = req.params.identifier;
      const organization = await schemaManager.getOrganization(identifier);

      if (!organization) {
        return res.status(404).json({ error: "Organization not found" });
      }

      // Generate Schema.org JSON-LD using SchemaGenerator
      const schema = SchemaGenerator.generateOrganizationSchema(organization, {
        baseUrl: `${req.protocol}://${req.get("host")}`,
      });

      res.json(schema);
    } catch (error) {
      console.error("Error getting organization schema:", error);
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * Get Schema.org Person schema for a user
   */
  async adminGetPersonSchema(req, res) {
    try {
      const userManager = this.engine.getManager("UserManager");
      const currentUser = req.userContext;
      if (
        !currentUser ||
        !(await userManager.hasPermission(currentUser.username, "admin:system"))
      ) {
        return res.status(403).json({ error: "Admin access required" });
      }

      const schemaManager = this.engine.getManager("SchemaManager");
      const identifier = req.params.identifier;
      const person = await schemaManager.getPerson(identifier);

      if (!person) {
        return res.status(404).json({ error: "Person not found" });
      }

      // Generate Schema.org JSON-LD using SchemaGenerator
      const schema = SchemaGenerator.generatePersonSchema(person, {
        baseUrl: `${req.protocol}://${req.get("host")}`,
      });

      res.json(schema);
    } catch (error) {
      console.error("Error getting person schema:", error);
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * Register all routes with the Express app
   * @param {Express} app - Express application instance
   */
  registerRoutes(app) {
    // API routes first to prevent conflicts
    console.log("ROUTES DEBUG: Registering /api/preview route");
    app.post("/api/preview", (req, res) => this.previewPage(req, res));
    console.log("ROUTES DEBUG: Registering /api/test route");
    app.get("/api/test", (req, res) => res.json({ message: "API working!" }));
    console.log("ROUTES DEBUG: Registering /api/page-metadata/:page route");
    app.get("/api/page-metadata/:page", (req, res) =>
      this.getPageMetadata(req, res)
    );
    console.log("ROUTES DEBUG: Registering /api/page-source/:page route");
    app.get("/api/page-source/:page", (req, res) =>
      this.getPageSource(req, res)
    );

    // Public routes
    app.get("/", (req, res) => this.homePage(req, res));
    app.get("/wiki/:page", (req, res) => this.viewPage(req, res));
    app.post("/wiki/:page", (req, res) => this.createWikiPage(req, res));
    app.get("/edit/:page", (req, res) => this.editPage(req, res));
    app.post("/save/:page", (req, res) => this.savePage(req, res));
    app.get("/create", (req, res) => this.createPage(req, res));
    app.post("/create", (req, res) => this.createPageFromTemplate(req, res));
    app.post("/delete/:page", (req, res) => this.deletePage(req, res));
    app.get("/search", (req, res) => this.searchPages(req, res));
    app.get("/login", (req, res) => this.loginPage(req, res));
    app.post("/login", (req, res) => this.processLogin(req, res));
    app.get("/logout", (req, res) => this.processLogout(req, res));
    app.post("/logout", (req, res) => this.processLogout(req, res));
    app.get("/register", (req, res) => this.registerPage(req, res));
    app.post("/register", (req, res) => this.processRegister(req, res));
    app.get("/profile", (req, res) => this.profilePage(req, res));
    app.post("/profile", (req, res) => this.updateProfile(req, res));
    app.post("/preferences", (req, res) => this.updatePreferences(req, res));
    app.get("/user-info", (req, res) => this.userInfo(req, res));

    // Admin routes
    app.get("/admin", (req, res) => this.adminDashboard(req, res));
    app.get("/admin/configuration", (req, res) =>
      this.adminConfiguration(req, res)
    );
    app.post("/admin/configuration", (req, res) =>
      this.adminUpdateConfiguration(req, res)
    );
    app.post("/admin/configuration/reset", (req, res) =>
      this.adminResetConfiguration(req, res)
    );
    app.get("/admin/variables", (req, res) => this.adminVariables(req, res));
    app.post("/admin/variables/test", (req, res) =>
      this.adminTestVariables(req, res)
    );
    app.post("/admin/maintenance/toggle", (req, res) =>
      this.adminToggleMaintenance(req, res)
    );
    app.get("/admin/users", (req, res) => this.adminUsers(req, res));
    app.post("/admin/users", (req, res) => this.adminCreateUser(req, res));
    app.put("/admin/users/:username", (req, res) =>
      this.adminUpdateUser(req, res)
    );
    app.delete("/admin/users/:username", (req, res) =>
      this.adminDeleteUser(req, res)
    );
    app.get("/admin/roles", (req, res) => this.adminRoles(req, res));
    app.post("/admin/roles", (req, res) => this.adminCreateRole(req, res));
    app.put("/admin/roles/:role", (req, res) => this.adminUpdateRole(req, res));
    app.delete("/admin/roles/:role", (req, res) =>
      this.adminDeleteRole(req, res)
    );

    // Image upload route with error handling
    app.post("/images/upload", (req, res) => {
      imageUpload.single("image")(req, res, (err) => {
        if (err) {
          // Multer error handling
          if (err instanceof multer.MulterError) {
            if (err.code === "LIMIT_FILE_SIZE") {
              return res.status(400).json({
                success: false,
                error: "File size exceeds 10MB limit",
              });
            }
            return res.status(400).json({
              success: false,
              error: err.message,
            });
          }
          // Other errors (e.g., file type validation)
          return res.status(400).json({
            success: false,
            error: err.message,
          });
        }
        // No error, proceed to handler
        this.uploadImage(req, res);
      });
    });

    // Notification management routes
    app.post("/admin/notifications/:id/dismiss", (req, res) =>
      this.adminDismissNotification(req, res)
    );
    app.post("/admin/notifications/clear-all", (req, res) =>
      this.adminClearAllNotifications(req, res)
    );
    app.get("/admin/notifications", (req, res) =>
      this.adminNotifications(req, res)
    );

    // Cache management routes
    app.get("/api/admin/cache/stats", (req, res) =>
      this.adminCacheStats(req, res)
    );
    app.post("/api/admin/cache/clear", (req, res) =>
      this.adminClearCache(req, res)
    );
    app.post("/api/admin/cache/clear/:region", (req, res) =>
      this.adminClearCacheRegion(req, res)
    );

    // Admin Schema.org Organization Management Routes
    app.get("/admin/organizations", this.adminOrganizations.bind(this));
    app.post("/admin/organizations", this.adminCreateOrganization.bind(this));
    app.put(
      "/admin/organizations/:identifier",
      this.adminUpdateOrganization.bind(this)
    );
    app.delete(
      "/admin/organizations/:identifier",
      this.adminDeleteOrganization.bind(this)
    );
    app.get(
      "/admin/organizations/:identifier",
      this.adminGetOrganization.bind(this)
    );
    app.get(
      "/admin/organizations/:identifier/schema",
      this.adminGetOrganizationSchema.bind(this)
    );

    app.get("/api/session-count", (req, res) => {
      this.getActiveSesssionCount(req, res);
    });
    // Schema.org routes
    app.get("/schema/person/:identifier", (req, res) =>
      this.adminGetPersonSchema(req, res)
    );
    app.get("/schema/organization/:identifier", (req, res) =>
      this.adminGetOrganizationSchema(req, res)
    );
  }

  /**
   * Dismiss a notification (admin only)
   */
  async adminDismissNotification(req, res) {
    try {
      const userManager = this.engine.getManager("UserManager");
      const currentUser = req.userContext;

      if (
        !currentUser ||
        !(await userManager.hasPermission(currentUser.username, "admin:system"))
      ) {
        return res.status(403).send("Access denied");
      }

      const notificationId = req.params.id;
      const notificationManager = this.engine.getManager("NotificationManager");

      const success = await notificationManager.dismissNotification(
        notificationId,
        currentUser.username
      );

      if (success) {
        res.redirect("/admin?success=Notification dismissed successfully");
      } else {
        res.redirect(
          "/admin?error=Notification not found or already dismissed"
        );
      }
    } catch (err) {
      console.error("Error dismissing notification:", err);
      res.redirect("/admin?error=Failed to dismiss notification");
    }
  }

  /**
   * Clear all notifications (admin only)
   */
  async adminClearAllNotifications(req, res) {
    try {
      const userManager = this.engine.getManager("UserManager");
      const currentUser = req.userContext;

      if (
        !currentUser ||
        !(await userManager.hasPermission(currentUser.username, "admin:system"))
      ) {
        return res.status(403).send("Access denied");
      }

      const notificationManager = this.engine.getManager("NotificationManager");
      const allNotifications = notificationManager.getAllNotifications();

      // Dismiss all notifications for the current admin user
      let dismissedCount = 0;
      for (const notification of allNotifications) {
        if (
          await notificationManager.dismissNotification(
            notification.id,
            currentUser.username
          )
        ) {
          dismissedCount++;
        }
      }

      res.redirect(
        `/admin?success=Cleared ${dismissedCount} notifications successfully`
      );
    } catch (err) {
      console.error("Error clearing notifications:", err);
      res.redirect("/admin?error=Failed to clear notifications");
    }
  }

  /**
   * Notification management page (admin only)
   */
  async adminNotifications(req, res) {
    try {
      const userManager = this.engine.getManager("UserManager");
      const currentUser = req.userContext;

      if (
        !currentUser ||
        !(await userManager.hasPermission(currentUser.username, "admin:system"))
      ) {
        return await this.renderError(
          req,
          res,
          403,
          "Access Denied",
          "You do not have permission to manage notifications"
        );
      }

      const commonData = await this.getCommonTemplateData(req);
      const notificationManager = this.engine.getManager("NotificationManager");

      // Get all notifications with expired ones for management
      const allNotifications = notificationManager.getAllNotifications(true);
      const activeNotifications =
        notificationManager.getAllNotifications(false);
      const expiredNotifications = allNotifications.filter(
        (n) => n.expiresAt && n.expiresAt < new Date()
      );

      // Get notification statistics
      const stats = notificationManager.getStats();

      res.render("admin-notifications", {
        ...commonData,
        title: "Notification Management",
        allNotifications: allNotifications,
        activeNotifications: activeNotifications,
        expiredNotifications: expiredNotifications,
        stats: stats,
        csrfToken: req.session.csrfToken,
        successMessage: req.query.success || null,
        errorMessage: req.query.error || null,
      });
    } catch (err) {
      console.error("Error loading notification management:", err);
      res.status(500).send("Error loading notification management");
    }
  }

  // ============================================================================
  // Admin Cache Route Handlers
  // ============================================================================

  /**
   * Admin cache statistics API endpoint
   */
  async adminCacheStats(req, res) {
    try {
      const userManager = this.engine.getManager("UserManager");
      const currentUser = req.userContext;

      if (
        !currentUser ||
        !(await userManager.hasPermission(currentUser.username, "admin:system"))
      ) {
        return res.status(403).json({ error: "Access denied" });
      }

      const cacheManager = this.engine.getManager("CacheManager");
      if (!cacheManager || !cacheManager.isInitialized()) {
        return res.status(503).json({ error: "CacheManager not available" });
      }

      const stats = await cacheManager.stats();
      res.json(stats);
    } catch (err) {
      console.error("Error getting cache stats:", err);
      res.status(500).json({ error: "Failed to get cache statistics" });
    }
  }

  /**
   * Admin clear all cache API endpoint
   */
  async adminClearCache(req, res) {
    try {
      const userManager = this.engine.getManager("UserManager");
      const currentUser = req.userContext;

      if (
        !currentUser ||
        !(await userManager.hasPermission(currentUser.username, "admin:system"))
      ) {
        return res.status(403).json({ error: "Access denied" });
      }

      const cacheManager = this.engine.getManager("CacheManager");
      if (!cacheManager || !cacheManager.isInitialized()) {
        return res.status(503).json({ error: "CacheManager not available" });
      }

      await cacheManager.clear();
      console.log(`Cache cleared by admin user: ${currentUser.username}`);

      res.json({
        success: true,
        message: "All caches cleared successfully",
        timestamp: new Date().toISOString(),
        user: currentUser.username,
      });
    } catch (err) {
      console.error("Error clearing cache:", err);
      res.status(500).json({ error: "Failed to clear cache" });
    }
  }

  /**
   * Admin clear cache region API endpoint
   */
  async adminClearCacheRegion(req, res) {
    try {
      const userManager = this.engine.getManager("UserManager");
      const currentUser = req.userContext;

      if (
        !currentUser ||
        !(await userManager.hasPermission(currentUser.username, "admin:system"))
      ) {
        return res.status(403).json({ error: "Access denied" });
      }

      const cacheManager = this.engine.getManager("CacheManager");
      if (!cacheManager || !cacheManager.isInitialized()) {
        return res.status(503).json({ error: "CacheManager not available" });
      }

      const region = req.params.region;
      if (!region) {
        return res.status(400).json({ error: "Region parameter required" });
      }

      await cacheManager.clear(region);
      console.log(
        `Cache region '${region}' cleared by admin user: ${currentUser.username}`
      );

      res.json({
        success: true,
        message: `Cache region '${region}' cleared successfully`,
        region: region,
        timestamp: new Date().toISOString(),
        user: currentUser.username,
      });
    } catch (err) {
      console.error(`Error clearing cache region '${req.params.region}':`, err);
      res.status(500).json({ error: "Failed to clear cache region" });
    }
  }

  // ============================================================================
  // Admin Audit Route Handlers
  // ============================================================================

  /**
   * Admin audit logs page
   */
  async adminAuditLogs(req, res) {
    try {
      const userManager = this.engine.getManager("UserManager");
      const currentUser = await this.getCurrentUser(req);

      if (
        !currentUser ||
        !(await userManager.hasPermission(currentUser.username, "admin:system"))
      ) {
        return await this.renderError(
          req,
          res,
          403,
          "Access Denied",
          "You do not have permission to view audit logs."
        );
      }

      const aclManager = this.engine.getManager("ACLManager");
      const auditStats = aclManager.getAccessControlStats();

      const templateData = await this.getCommonTemplateData(currentUser);
      res.render("admin-audit", {
        ...templateData,
        auditStats,
        title: "Audit Logs - Admin",
        currentUser,
      });
    } catch (err) {
      console.error("Error loading audit logs:", err);
      res.status(500).send("Error loading audit logs");
    }
  }

  /**
   * API endpoint for audit logs data
   */
  async adminAuditLogsApi(req, res) {
    try {
      const userManager = this.engine.getManager("UserManager");
      const currentUser = await this.getCurrentUser(req);

      if (
        !currentUser ||
        !(await userManager.hasPermission(currentUser.username, "admin:system"))
      ) {
        return res.status(403).json({ error: "Access denied" });
      }

      const aclManager = this.engine.getManager("ACLManager");

      // Parse query parameters
      const filters = {
        user: req.query.user || null,
        action: req.query.action || null,
        decision:
          req.query.decision !== undefined
            ? req.query.decision === "true"
            : null,
        pageName: req.query.pageName || null,
      };

      const limit = parseInt(req.query.limit) || 50;
      const offset = parseInt(req.query.offset) || 0;

      // Get filtered logs
      const allFilteredLogs = aclManager.getAccessLog(1000, filters); // Get more than needed for pagination
      const total = allFilteredLogs.length;
      const auditLogs = allFilteredLogs.slice(offset, offset + limit);

      res.json({
        results: auditLogs,
        total: total,
        limit: limit,
        offset: offset,
      });
    } catch (err) {
      console.error("Error retrieving audit logs:", err);
      res.status(500).json({ error: "Error retrieving audit logs" });
    }
  }

  /**
   * API endpoint for individual audit log details
   */
  async adminAuditLogDetails(req, res) {
    try {
      const userManager = this.engine.getManager("UserManager");
      const currentUser = await this.getCurrentUser(req);

      if (
        !currentUser ||
        !(await userManager.hasPermission(currentUser.username, "admin:system"))
      ) {
        return res.status(403).json({ error: "Access denied" });
      }

      const aclManager = this.engine.getManager("ACLManager");
      const logId = req.params.id;

      // Get all audit logs and find the specific one
      const allLogs = aclManager.getAccessLog(10000); // Get a large number to find the specific log
      const logDetails = allLogs.find((log) => log.timestamp === logId);

      if (!logDetails) {
        return res.status(404).json({ error: "Audit log not found" });
      }

      res.json(logDetails);
    } catch (err) {
      console.error("Error retrieving audit log details:", err);
      res.status(500).json({ error: "Error retrieving audit log details" });
    }
  }

  /**
   * Export audit logs
   */
  async adminAuditExport(req, res) {
    try {
      const userManager = this.engine.getManager("UserManager");
      const currentUser = await this.getCurrentUser(req);

      if (
        !currentUser ||
        !(await userManager.hasPermission(currentUser.username, "admin:system"))
      ) {
        return res.status(403).send("Access denied");
      }

      const aclManager = this.engine.getManager("ACLManager");

      // Parse query parameters
      const filters = {
        user: req.query.user || null,
        action: req.query.action || null,
        decision:
          req.query.decision !== undefined
            ? req.query.decision === "true"
            : null,
        pageName: req.query.pageName || null,
      };

      const format = req.query.format || "json";

      // Get filtered logs for export
      const exportData = aclManager.getAccessLog(10000, filters); // Get all matching logs

      if (format === "json") {
        res.setHeader("Content-Type", "application/json");
        res.setHeader(
          "Content-Disposition",
          'attachment; filename="audit-logs.json"'
        );
        res.send(JSON.stringify(exportData, null, 2));
      } else if (format === "csv") {
        // Convert to CSV format
        const csvHeaders = [
          "timestamp",
          "user",
          "pageName",
          "action",
          "decision",
          "reason",
          "ip",
          "userAgent",
        ];
        const csvRows = exportData.map((log) => [
          log.timestamp,
          log.user,
          log.pageName,
          log.action,
          log.decision,
          log.reason,
          log.context?.ip || "",
          log.context?.userAgent || "",
        ]);

        const csvContent = [csvHeaders, ...csvRows]
          .map((row) => row.map((field) => `"${field}"`).join(","))
          .join("\n");

        res.setHeader("Content-Type", "text/csv");
        res.setHeader(
          "Content-Disposition",
          'attachment; filename="audit-logs.csv"'
        );
        res.send(csvContent);
      } else {
        res.status(400).send("Invalid format. Supported formats: json, csv");
      }
    } catch (err) {
      console.error("Error exporting audit logs:", err);
      res.status(500).send("Error exporting audit logs");
    }
  }

  /**
   * Get page metadata in a user-friendly format
   */
  async getPageMetadata(req, res) {
    console.log("🔍 getPageMetadata called for page:", req.params.page);
    try {
      const pageName = decodeURIComponent(req.params.page);
      const pageManager = this.engine.getManager("PageManager");

      const page = await pageManager.getPage(pageName);
      if (!page) {
        return res.status(404).json({ error: "Page not found" });
      }

      // Extract metadata from the page
      const metadata = page.frontMatter || {};
      const content = page.content || "";

      // Calculate content statistics
      const wordCount = content
        .replace(/[^\w\s]/g, "")
        .split(/\s+/)
        .filter((word) => word.length > 0).length;
      const characterCount = content.length;
      const lineCount = content.split("\n").length;

      // Get file stats if available
      const fs = require("fs-extra");
      const path = require("path");
      let fileStats = null;

      try {
        const filePath = path.join(process.cwd(), "pages", `${page.uuid}.md`);
        const stats = await fs.stat(filePath);
        fileStats = {
          size: stats.size,
          created: stats.birthtime,
          modified: stats.mtime,
          accessed: stats.atime,
        };
      } catch (error) {
        // File stats not available
      }

      // Format the metadata for user-friendly display
      const formattedMetadata = {
        // Basic page info
        title: metadata.title || pageName,
        slug: metadata.slug || pageName,
        uuid: metadata.uuid || page.uuid,

        // Categorization and tags
        category: metadata["system-category"] || metadata.category || "general",
        keywords: Array.isArray(metadata["user-keywords"])
          ? metadata["user-keywords"]
          : metadata.keywords
          ? metadata.keywords.split(",").map((k) => k.trim())
          : [],
        tags: metadata.tags || [],

        // Timestamps
        created: fileStats?.created || null,
        lastModified: metadata.lastModified || fileStats?.modified || null,
        lastAccessed: fileStats?.accessed || null,

        // Content statistics
        stats: {
          wordCount: wordCount,
          characterCount: characterCount,
          lineCount: lineCount,
          fileSize: fileStats?.size || null,
        },

        // Additional metadata
        author: metadata.author || null,
        description: metadata.description || null,
        version: metadata.version || null,
        status: metadata.status || "published",

        // Schema.org data if present
        schemaType: metadata.schemaType || null,
        schemaData: metadata.schemaData || null,

        // Custom metadata
        custom: {},
      };

      // Add any custom metadata fields not already handled
      for (const [key, value] of Object.entries(metadata)) {
        if (
          ![
            "title",
            "slug",
            "uuid",
            "system-category",
            "category",
            "user-keywords",
            "keywords",
            "tags",
            "lastModified",
            "author",
            "description",
            "version",
            "status",
            "schemaType",
            "schemaData",
          ].includes(key)
        ) {
          formattedMetadata.custom[key] = value;
        }
      }

      res.json(formattedMetadata);
    } catch (error) {
      console.error("Error retrieving page metadata:", error);
      res
        .status(500)
        .json({ error: "Internal server error", details: error.message });
    }
  }
}

module.exports = WikiRoutes;
