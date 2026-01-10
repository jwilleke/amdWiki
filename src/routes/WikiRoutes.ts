/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-explicit-any */
 
 
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/require-await */
/* eslint-disable @typescript-eslint/no-require-imports */

/**
 * Modern route handlers using manager-based architecture
 *
 * @module WikiRoutes
 */

import path from 'path';
import multer, { StorageEngine, Multer } from 'multer';
import fs from 'fs';
import { Request, Response } from 'express';
import SchemaGenerator from '../utils/SchemaGenerator';
import logger from '../utils/logger';
import WikiContext from '../context/WikiContext';

/** Helper to extract error message from unknown error */
function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return getErrorMessage(error);
  return String(error);
}

// TypeScript interfaces for WikiRoutes
interface WikiEngine {
  getManager(name: string): any;
  config?: any;
}

interface UserContext {
  username?: string;
  email?: string;
  roles?: string[];
  isSystem?: boolean;
  [key: string]: any;
}

interface WikiContextOptions {
  context?: any;
  pageName?: string | null;
  content?: string | null;
  userContext?: UserContext | null;
  request?: Request;
  response?: Response | null;
}

interface TemplateData {
  currentUser?: UserContext | null;
  userContext?: UserContext | null;
  user?: UserContext | null;
  pageName?: string | null;
  wikiContext?: any;
  engine?: WikiEngine;
  [key: string]: any;
}

interface RequestInfo {
  userAgent: string;
  clientIp: string;
  referer: string;
  acceptLanguage: string;
  sessionId: string;
}

interface PageData {
  name: string;
  content: string;
  metadata?: any;
  [key: string]: any;
}

interface ExtendedRequest extends Request {
  userContext?: UserContext;
  file?: Express.Multer.File;
  files?: Express.Multer.File[];
}

// Configure multer for image uploads
const imageStorage: StorageEngine = multer.diskStorage({
  destination: (req: Request, file: Express.Multer.File, cb: (error: Error | null, destination: string) => void) => {
    const uploadDir = path.join(__dirname, '../../public/images');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req: Request, file: Express.Multer.File, cb: (error: Error | null, filename: string) => void) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, 'upload-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// Configure multer for general attachments (memory storage)
const attachmentUpload: Multer = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit (can be overridden by config)
});

const imageUpload: Multer = multer({
  storage: imageStorage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp|svg/;
    const extname = allowedTypes.test(
      path.extname(file.originalname).toLowerCase()
    );
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(
      new Error('Only image files (jpeg, jpg, png|gif|webp|svg) are allowed')
    );
  }
});

class WikiRoutes {
  private engine: WikiEngine;

  constructor(engine: WikiEngine) {
    this.engine = engine;
  }

  /**
   * Create a WikiContext for the given request and page
   * This should be the single source of truth for all context information
   * @param {object} req - Express request object
   * @param {object} options - Additional context options (pageName, content, context type)
   * @returns {WikiContext} WikiContext instance
   */
  createWikiContext(req: Request, options: WikiContextOptions = {}): WikiContext {
    return new WikiContext(this.engine as unknown as import('../types/WikiEngine').WikiEngine, {
      context: options.context || WikiContext.CONTEXT.NONE,
      pageName: options.pageName ?? undefined,
      content: options.content ?? undefined,
      userContext: req.userContext,
      request: req,
      response: options.response ?? undefined
    });
  }

  /**
   * Extract template data from WikiContext
   * This ensures all templates get consistent data structure
   * @param {WikiContext} wikiContext - The wiki context
   * @returns {object} Template data object
   */
  getTemplateDataFromContext(wikiContext: WikiContext): TemplateData {
    return {
      // User context (both names for compatibility)
      currentUser: wikiContext.userContext,
      userContext: wikiContext.userContext,
      user: wikiContext.userContext,

      // Page context
      pageName: wikiContext.pageName,

      // WikiContext itself for advanced usage
      wikiContext: wikiContext,

      // Engine reference
      engine: wikiContext.engine
    };
  }

  /**
   * Parse file size string (e.g., '5MB', '1GB') to bytes
   * @param {string} sizeStr - Size string
   * @returns {number} Size in bytes
   */
  parseFileSize(sizeStr: string): number {
    const units: Record<string, number> = {
      B: 1,
      KB: 1024,
      MB: 1024 * 1024,
      GB: 1024 * 1024 * 1024
    };

    const match = sizeStr
      .toUpperCase()
      .match(/^(\d+(?:\.\d+)?)\s*(B|KB|MB|GB)?$/);
    if (!match) return 10 * 1024 * 1024; // Default 10MB

    const size = parseFloat(match[1]);
    const unit = match[2] || 'B';

    return Math.round(size * units[unit]);
  }

  /**
   * Extract request information for variable expansion
   * @param {object} req - Express request object
   * @returns {object} Request information object
   */
  getRequestInfo(req: Request): RequestInfo {
    return {
      userAgent: req.headers['user-agent'] || 'Unknown',
      clientIp:
        req.ip ||
        (req as any).connection?.remoteAddress ||
        (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ||
        'Unknown',
      referer: (req.headers.referer || req.headers.referrer || 'Direct') as string,
      acceptLanguage: req.headers['accept-language'] || 'Unknown',
      sessionId: (req as any).session?.id || (req as any).sessionID || 'None'
    };
  }

  /**
   * Get common template data that all pages need.
   * This is now the single source of truth for common data.
   * @param {object} req - Express request object.
   */
  async getCommonTemplateData(req: Request): Promise<any> {
    const userManager = this.engine.getManager('UserManager');
    const aclManager = this.engine.getManager('ACLManager');
    const renderingManager = this.engine.getManager('RenderingManager');
    const pageManager = this.engine.getManager('PageManager');
    const configManager = this.engine.getManager('ConfigurationManager');

    // Get the user context directly from the request.
    const userContext =
      req.userContext || (await userManager.getCurrentUser(req));
    const templateData: {
      currentUser: UserContext | null;
      user: UserContext | null;
      appName: unknown;
      applicationName: unknown;
      faviconPath: unknown;
      pages: unknown;
      leftMenu?: string;
      footer?: string;
    } = {
      currentUser: userContext,
      user: userContext, // Add alias for consistency
      appName: configManager?.getProperty(
        'amdwiki.applicationName',
        'amdWiki'
      ),
      applicationName: configManager?.getProperty(
        'amdwiki.applicationName',
        'amdWiki'
      ),
      faviconPath: configManager?.getProperty(
        'amdwiki.faviconPath',
        '/favicon.ico'
      ),
      pages: await pageManager.getAllPages()
    };

    // Load LeftMenu
    try {
      const leftMenuContent = await pageManager.getPageContent('LeftMenu');
      logger.info(
        `[TEMPLATE] Loading LeftMenu for user=${
          userContext?.username
        } roles=${userContext?.roles?.join('|')}`
      );

      const canViewLeftMenu = await aclManager.checkPagePermission(
        'LeftMenu',
        'view',
        userContext,
        leftMenuContent
      );
      logger.info(`[TEMPLATE] LeftMenu ACL decision: ${canViewLeftMenu}`);

      if (canViewLeftMenu) {
        const ctx = new WikiContext(this.engine as unknown as import('../types/WikiEngine').WikiEngine, {
          pageName: 'LeftMenu',
          content: leftMenuContent,
          userContext,
          request: req
        });
        templateData.leftMenu = await renderingManager.textToHTML(
          ctx,
          leftMenuContent
        );
      } else {
        templateData.leftMenu = '';
      }
    } catch (error: unknown) {
      logger.warn('Could not load or render LeftMenu content.', {
        error: error instanceof Error ? getErrorMessage(error) : String(error)
      });
      templateData.leftMenu = '';
    }

    // Load Footer
    try {
      const footerContent = await pageManager.getPageContent('Footer');
      logger.info(
        `[TEMPLATE] Loading Footer for user=${
          userContext?.username
        } roles=${userContext?.roles?.join('|')}`
      );

      const canViewFooter = await aclManager.checkPagePermission(
        'Footer',
        'view',
        userContext,
        footerContent
      );
      logger.info(`[TEMPLATE] Footer ACL decision: ${canViewFooter}`);

      if (canViewFooter) {
        const ctx = new WikiContext(this.engine as unknown as import('../types/WikiEngine').WikiEngine, {
          pageName: 'Footer',
          content: footerContent,
          userContext,
          request: req
        });
        templateData.footer = await renderingManager.textToHTML(
          ctx,
          footerContent
        );
      } else {
        templateData.footer = '';
      }
    } catch (error: unknown) {
      logger.warn('Could not load or render Footer content.', {
        error: error instanceof Error ? getErrorMessage(error) : String(error)
      });
      templateData.footer = '';
    }

    return templateData;
  }

  /**
   * Extract request context for access control
   * @param {Object} req - Express request object
   * @returns {Object} Context information
   */
  getRequestContext(req: Request): { ip: string; userAgent: string | undefined; referer: string | undefined; timestamp: string } {
    return {
      ip: req.ip || (req as any).connection?.remoteAddress || 'unknown',
      userAgent: req.get('User-Agent'),
      referer: req.get('Referer'),
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Session count (uses app.js sessionStore)
   */
  getActiveSesssionCount(req: Request, res: Response): void {
    try {
      const store = (req as any).sessionStore;
      if (!store) {
        res.status(503).json({ error: 'Session store not available' });
        return;
      }

      if (typeof store.length === 'function') {
        store.length((err: Error | null, count: number) => {
          if (err) {
            res.status(500).json({ error: 'Failed to obtain session count' });
            return;
          }
          // Return both sessionCount and distinctUsers
          // For now, distinctUsers = sessionCount (until we implement user tracking)
          res.json({
            sessionCount: count || 0,
            distinctUsers: count || 0  // TODO: Implement actual distinct user tracking
          });
        });
        return;
      }

      if (typeof store.all === 'function') {
        store.all((err: Error | null, sessions: Record<string, any>) => {
          if (err)
            return res
              .status(500)
              .json({ error: 'Failed to obtain session count' });

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
        .json({ error: 'Session count not supported by store' });
    } catch (e) {
      return res.status(500).json({ error: 'Failed to obtain session count' });
    }
  }

  /**
   * Extract categories from System Categories page
   */
  async getCategories() {
    try {
      const pageManager = this.engine.getManager('PageManager');
      const categoriesPage = await pageManager.getPage('System Categories');

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

      return categories.length > 0
        ? categories
        : ['General', 'Documentation', 'Project', 'Reference'];
    } catch (err: unknown) {
      logger.error('Error loading categories:', err);
      return ['General', 'Documentation', 'Project', 'Reference'];
    }
  }

  /**
   * Get all categories including admin-only categories
   */
  async getAllCategories() {
    try {
      const pageManager = this.engine.getManager('PageManager');
      const categoriesPage = await pageManager.getPage('System Categories');

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

      return categories.length > 0
        ? categories
        : ['General', 'Documentation', 'System/Admin'];
    } catch (err: unknown) {
      logger.error('Error loading all categories:', err);
      return ['General', 'Documentation', 'System/Admin'];
    }
  }

  /**
   * Get system categories from configuration (admin-only)
   */
  async getSystemCategories() {
    try {
      const configManager = this.engine.getManager('ConfigurationManager');
      if (!configManager) {
        return ['general', 'system', 'documentation', 'test'];
      }

      // Load system categories from configuration
      const systemCategories = configManager.getProperty('amdwiki.system-category', {});

      // Filter enabled categories and extract labels (case-insensitive)
      const categories = [];
      for (const [key, config] of Object.entries(systemCategories)) {
        if (config.enabled !== false) { // Include if not explicitly disabled
          // Use label if available, otherwise use key (both lowercase)
          const label = (config.label || key).toLowerCase();
          categories.push(label);
        }
      }

      // Sort alphabetically for consistent ordering
      categories.sort();

      return categories.length > 0
        ? categories
        : ['general', 'system', 'documentation', 'test'];
    } catch (err: unknown) {
      logger.error('Error loading system categories:', err);
      return ['general', 'system', 'documentation', 'test'];
    }
  }

  /**
   * Extract user keywords from User-Keywords page
   */
  async getUserKeywords() {
    try {
      const configManager = this.engine.getManager('ConfigurationManager');

      // Try to get user keywords from configuration first
      if (configManager) {
        const userKeywordsConfig = configManager.getProperty('amdwiki.user-keywords', null);

        if (userKeywordsConfig && typeof userKeywordsConfig === 'object') {
          const keywords = [];

          // Extract all enabled keyword labels from configuration
          for (const [key, config] of Object.entries(userKeywordsConfig)) {
            if (config.enabled !== false && config.label) {
              keywords.push(config.label);
            }
          }

          if (keywords.length > 0) {
            logger.info(`Loaded ${keywords.length} user keywords from configuration`);
            return keywords;
          }
        }
      }

      // Fallback: read from User Keywords page (legacy method)
      logger.info('Falling back to reading user keywords from page');
      const pageManager = this.engine.getManager('PageManager');
      const keywordsPage = await pageManager.getPage('User Keywords');

      if (!keywordsPage) {
        return ['medicine', 'geology', 'test'];
      }

      // Extract keywords only from the bullet list under '## Current User Keywords'
      const keywords = [];
      const lines = keywordsPage.content.split('\n');
      let inKeywordsSection = false;
      for (const line of lines) {
        if (line.trim().startsWith('## ')) {
          // Enter keywords section
          inKeywordsSection = line
            .trim()
            .toLowerCase()
            .includes('current user keywords');
          continue;
        }
        if (inKeywordsSection) {
          // Stop if we hit another heading
          if (line.trim().startsWith('## ')) break;
          const bulletMatch = line.match(/^\s*-\s*(.+)$/);
          if (bulletMatch) {
            const keyword = bulletMatch[1].trim();
            if (keyword && !keywords.includes(keyword)) {
              keywords.push(keyword);
            }
          }
        }
      }
      return keywords.length > 0 ? keywords : ['medicine', 'geology', 'test'];
    } catch (err: unknown) {
      logger.error('Error loading user keywords:', err);
      return ['medicine', 'geology', 'test'];
    }
  }

  /**
   * Generate Schema.org JSON-LD markup for a page
   * @param {Object} pageData - Page metadata and content
   * @param {Object} req - Express request object for URL generation
   * @returns {string} HTML script tag with JSON-LD
   */
  async generatePageSchema(pageData: Record<string, unknown>, req: Request) {
    try {
      const baseUrl = `${req.protocol}://${req.get('host')}`;
      const pageUrl = `${baseUrl}${req.originalUrl}`;

      // Get current user for permission context
      const userManager = this.engine.getManager('UserManager');
      const currentUser = req.userContext;

      const schema = SchemaGenerator.generatePageSchema(pageData, {
        baseUrl: baseUrl,
        pageUrl: pageUrl,
        engine: this.engine, // Pass engine for DigitalDocumentPermission generation
        user: currentUser // Pass user context for permission generation
      });

      return SchemaGenerator.generateScriptTag(schema);
    } catch (err: unknown) {
      logger.error('Error generating page schema:', err);
      return '';
    }
  }

  /**
   * Generate site-wide Schema.org markup (Organization, SoftwareApplication)
   * @param {Object} req - Express request object
   * @returns {string} HTML script tags with JSON-LD
   */
  async generateSiteSchema(req: Request) {
    try {
      const baseUrl = `${req.protocol}://${req.get('host')}`;
      const configManager = this.engine.getManager('ConfigurationManager');

      // Check if SchemaManager is available, fallback to legacy method
      let siteData;
      try {
        const schemaManager = this.engine.getManager('SchemaManager');
        siteData = await schemaManager.getComprehensiveSiteData();
      } catch (err: unknown) {
        logger.warn(
          'SchemaManager not available, using legacy data sources:',
          getErrorMessage(err)
        );

        // Fallback to legacy data structure using ConfigurationManager
        const configData = {
          applicationName: configManager.getProperty('amdwiki.applicationName', 'amdWiki'),
          version: configManager.getProperty('amdwiki.version', '1.0.0'),
          server: {
            port: configManager.getProperty('amdwiki.server.port', 3000),
            host: configManager.getProperty('amdwiki.server.host', 'localhost')
          },
          features: {
            export: { html: configManager.getProperty('amdwiki.features.export.html', true) },
            attachments: { enabled: configManager.getProperty('amdwiki.attachment.enabled', true) },
            llm: { enabled: configManager.getProperty('amdwiki.features.llm.enabled', false) }
          }
        };

        // Load user data (admins only for privacy)
        const userManager = this.engine.getManager('UserManager');
        const allUsersArray = await userManager.getUsers(); // This returns array without passwords
        const publicUsers = {};

        allUsersArray.forEach((userData) => {
          if (userData.roles?.includes('admin') && !userData.isSystem) {
            publicUsers[userData.username] = userData;
          }
        });

        siteData = {
          config: configData,
          users: publicUsers
        };
      }

      const schemas = SchemaGenerator.generateComprehensiveSchema(siteData, {
        baseUrl: baseUrl,
        organizationName:
          siteData.organizations?.[0]?.name || 'amdWiki Platform',
        repository: 'https://github.com/jwilleke/amdWiki'
      });

      // Generate script tags for all schemas
      return schemas
        .map((schema) => SchemaGenerator.generateScriptTag(schema))
        .join('\n    ');
    } catch (err: unknown) {
      logger.error('Error generating site schema:', err);
      return '';
    }
  }

  /**
   * Render error page with consistent template data
   */
  async renderError(req: Request, res: Response, status: number, title: string, message: string) {
    try {
      // Pass the request object to get all common data
      const commonData = await this.getCommonTemplateData(req);

      return res.status(status).render('error', {
        ...commonData,
        title: title,
        message: message,
        error: { status: status },
        originalUrl: req.originalUrl || '/'
      });
    } catch (err: unknown) {
      logger.error('Error rendering error page:', err);
      return res.status(status).send(`${title}: ${message}`);
    }
  }

  /**
   * Check if a page is a protected page (admin-only edit)
   *
   * Protected pages include:
   * - Hardcoded required pages (backward compatibility)
   * - Pages with system-category: system or documentation
   *
   * These pages are considered core system pages that may be overwritten
   * by future updates to the application.
   *
   * @param {string} pageName - The page name to check
   * @returns {Promise<boolean>} True if page requires admin permission to edit
   */
  async isRequiredPage(pageName) {
    // Hardcoded required pages (for backward compatibility)
    const hardcodedRequiredPages = ['System Categories', 'Wiki Documentation'];
    if (hardcodedRequiredPages.includes(pageName)) {
      return true;
    }

    // Check if page has a protected system-category
    try {
      const pageManager = this.engine.getManager('PageManager');
      const pageData = await pageManager.getPage(pageName);
      if (pageData && pageData.metadata) {
        const systemCategory = (pageData.metadata['system-category'] || '').toLowerCase();
        const category = (pageData.metadata.category || '').toLowerCase();

        // Protected categories that require admin permission to edit
        const protectedCategories = ['system', 'system/admin', 'documentation'];

        if (protectedCategories.includes(systemCategory) ||
            protectedCategories.includes(category)) {
          return true;
        }
      }
    } catch (err: unknown) {
      logger.error('Error checking page category:', err);
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
      const requestInfo = null; // getLeftMenu doesn't have access to req currently
      const renderedContent = await renderingManager.renderMarkdown(
        leftMenuPage.content,
        'LeftMenu',
        userContext,
        requestInfo
      );

      // Format for Bootstrap navigation
      return this.formatLeftMenuContent(renderedContent);
    } catch (err: unknown) {
      logger.error('Error loading left menu:', err);
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
  async viewPage(req: Request, res: Response) {
    try {
      const configManager = this.engine.getManager('ConfigurationManager');
      const frontPage = configManager.getProperty(
        'amdwiki.frontPage',
        'Welcome'
      );
      const pageName = req.params.page || frontPage;

      // Create WikiContext as single source of truth for this operation
      const wikiContext = this.createWikiContext(req, {
        context: WikiContext.CONTEXT.VIEW,
        pageName: pageName,
        response: res
      });

      // Extract user from WikiContext (single source of truth)
      const userContext = wikiContext.userContext;
      const pageManager = this.engine.getManager('PageManager');
      const renderingManager = this.engine.getManager('RenderingManager');
      const aclManager = this.engine.getManager('ACLManager');

      logger.info(
        `[VIEW] pageName=${pageName} user=${userContext?.username} roles=${(
          userContext?.roles || []
        ).join('|')}`
      );

      // Gracefully handle page not found
      const markdown = await pageManager
        .getPageContent(pageName)
        .catch((err) => {
          if (getErrorMessage(err).includes('not found')) return null;
          throw err;
        });

      if (markdown === null) {
        return await this.renderError(
          req,
          res,
          404,
          'Not Found',
          `The page '${pageName}' does not exist.`
        );
      }

      // Update WikiContext with page content for ACL checking
      wikiContext.content = markdown;

      const canView = await aclManager.checkPagePermissionWithContext(wikiContext, 'view');
      logger.info(`[VIEW] ACL decision for ${pageName}: ${canView}`);
      if (!canView) {
        return await this.renderError(
          req,
          res,
          403,
          'Access Denied',
          'You do not have permission to view this page.'
        );
      }

      // Check if user can edit this page
      const canEdit = await aclManager.checkPagePermissionWithContext(wikiContext, 'edit');
      const html = await renderingManager.textToHTML(wikiContext, markdown);

      // Get page metadata for display
      const metadata = await pageManager.getPageMetadata(pageName);

      // Get version information if versioning is enabled
      let versionInfo = null;
      const provider = pageManager.provider;
      if (typeof provider.getVersionHistory === 'function') {
        try {
          const versions = await provider.getVersionHistory(pageName);
          if (versions && versions.length > 0) {
            const latestVersion = versions[0]; // Versions are returned newest first
            versionInfo = {
              currentVersion: latestVersion.version,
              totalVersions: versions.length,
              lastModified: latestVersion.dateCreated,
              lastAuthor: latestVersion.author
            };
          }
        } catch (error: unknown) {
          // Silently fail if versioning not available for this page
          logger.debug(`[VIEW] Could not get version info for ${pageName}: ${getErrorMessage(error)}`);
        }
      }

      // Pass the request object to get all common data
      const templateData = await this.getCommonTemplateData(req);

      // Check if reader view is requested
      const viewMode = req.query.view;
      const template = viewMode === 'reader' ? 'reader' : 'view';

      res.render(template, {
        ...templateData,
        pageName,
        title: pageName, // For reader view template
        content: html,
        canEdit,
        metadata,
        versionInfo,
        lastModified: metadata?.lastModified,
        referringPages: [] // TODO: Implement backlink detection
      });
    } catch (error: unknown) {
      logger.error('[VIEW] Error viewing page', {
        error: getErrorMessage(error),
        stack: error.stack
      });
      await this.renderError(
        req,
        res,
        500,
        'Error',
        'Could not render the page.'
      );
    }
  }

  /**
   * Display create new page form with template selection
   */
  async createPage(req: Request, res: Response) {
    try {
      const pageName = req.query.name || '';

      // Create WikiContext as single source of truth for this operation
      const wikiContext = this.createWikiContext(req, {
        context: WikiContext.CONTEXT.EDIT,
        pageName: pageName,
        response: res
      });

      // Extract user from WikiContext (single source of truth)
      const currentUser = wikiContext.userContext;
      const userManager = this.engine.getManager('UserManager');

      logger.debug(
        '[CREATE-DEBUG] currentUser:',
        currentUser ? currentUser.username : 'null',
        'isAuth:',
        currentUser?.isAuthenticated
      );
      logger.debug(
        '[CREATE-DEBUG] checking page:create permission for user:',
        currentUser?.username
      );

      // Check if user is authenticated
      if (!currentUser || !currentUser.isAuthenticated) {
        logger.debug(
          '[CREATE-DEBUG] User not authenticated, redirecting to login'
        );
        return res.redirect('/login?redirect=' + encodeURIComponent('/create'));
      }

      const hasPermission = await userManager.hasPermission(
        currentUser.username,
        'page:create'
      );
      logger.debug('[CREATE-DEBUG] hasPermission result:', hasPermission);

      // Check if user has permission to create pages
      if (!hasPermission) {
        logger.debug(
          '[CREATE-DEBUG] Permission denied for user:',
          currentUser.username
        );
        return await this.renderError(
          req,
          res,
          403,
          'Access Denied',
          'You do not have permission to create pages. Please contact an administrator.'
        );
      }

      const templateManager = this.engine.getManager('TemplateManager');

      // Get template data from WikiContext
      const templateData = this.getTemplateDataFromContext(wikiContext);
      const commonData = { ...templateData };

      // Get available templates
      const templates = templateManager.getTemplates();

      // Get categories and keywords for the form
      const systemCategories = await this.getSystemCategories();
      const userKeywords = await this.getUserKeywords();

      const configManager = this.engine.getManager('ConfigurationManager');
      const maxUserKeywords = configManager
        ? configManager.getProperty('amdwiki.maximum.user-keywords', 5)
        : 5;

      res.render('create', {
        ...commonData,
        title: 'Create New Page',
        pageName: pageName,
        templates: templates,
        systemCategories: systemCategories,
        userKeywords: userKeywords,
        maxUserKeywords: maxUserKeywords,
        csrfToken: req.session.csrfToken
      });
    } catch (err: unknown) {
      logger.error('Error loading create page:', err);
      res.status(500).send('Error loading create page form');
    }
  }

  /**
   * Handle /edit route without page parameter
   */
  async editPageIndex(req: Request, res: Response) {
    try {
      const userManager = this.engine.getManager('UserManager');
      const currentUser = req.userContext;

      // Check if user is authenticated
      if (!currentUser || !currentUser.isAuthenticated) {
        return res.redirect('/login?redirect=' + encodeURIComponent('/edit'));
      }

      // Check if user has permission to edit pages
      if (
        !(await userManager.hasPermission(currentUser.username, 'page:edit'))
      ) {
        return await this.renderError(
          req,
          res,
          403,
          'Access Denied',
          'You do not have permission to edit pages. Please contact an administrator.'
        );
      }

      // Get all pages for selection
      const pageManager = this.engine.getManager('PageManager');
      const allPages = await pageManager.getAllPages();

      // Sort pages alphabetically
      const sortedPages = allPages.sort((a, b) => a.localeCompare(b));

      // Get common template data with user context
      const commonData = await this.getCommonTemplateData(req);

      res.render('edit-index', {
        ...commonData,
        title: 'Select Page to Edit',
        pages: sortedPages
      });
    } catch (err: unknown) {
      logger.error('Error loading edit page index:', err);
      res.status(500).send('Error loading edit page selector');
    }
  }

  /**
   * Create a new page from template
   */
  async createPageFromTemplate(req: Request, res: Response) {
    try {
      const { pageName, templateName, categories, userKeywords } = req.body;

      if (!pageName || !templateName) {
        return res.status(400).send('Page name and template are required');
      }

      // Ensure categories is an array and always include 'default'
      const categoriesArray = Array.isArray(categories)
        ? categories
        : categories
          ? [categories]
          : [];
      if (!categoriesArray.includes('default')) {
        categoriesArray.unshift('default');
      }
      if (categoriesArray.length > 3) {
        return res.status(400).send('Maximum 3 categories allowed');
      }

      const templateManager = this.engine.getManager('TemplateManager');

      // Apply template with variables
      const templateVars = {
        pageName: pageName,
        category: categoriesArray[0] || '', // Use first category for backward compatibility
        categories: categoriesArray.join(', '),
        userKeywords: Array.isArray(userKeywords)
          ? userKeywords.join(', ')
          : userKeywords || '',
        date: new Date().toISOString().split('T')[0]
      };

      const content = templateManager.applyTemplate(templateName, templateVars);

      // Create WikiContext as single source of truth for this operation
      const wikiContext = this.createWikiContext(req, {
        context: WikiContext.CONTEXT.EDIT,
        pageName: pageName,
        content: content,
        response: res
      });

      // Extract user from WikiContext (single source of truth)
      const currentUser = wikiContext.userContext;
      const userManager = this.engine.getManager('UserManager');
      const pageManager = this.engine.getManager('PageManager');

      // Check if user is authenticated
      if (!currentUser || !currentUser.isAuthenticated) {
        return res.redirect('/login?redirect=' + encodeURIComponent('/create'));
      }

      // Check if user has permission to create pages
      if (
        !(await userManager.hasPermission(currentUser.username, 'page:create'))
      ) {
        return await this.renderError(
          req,
          res,
          403,
          'Access Denied',
          'You do not have permission to create pages. Please contact an administrator.'
        );
      }

      // Check if page already exists
      const existingPage = await pageManager.getPage(pageName);
      if (existingPage) {
        logger.debug(
          `DEBUG: createPageFromTemplate - Page ${pageName} already exists, rendering error template`
        );
        try {
          const commonData = await this.getCommonTemplateData(req);

          return res.status(409).render('error', {
            ...commonData,
            currentUser,
            error: { status: 409 },
            title: 'Page Already Exists',
            message: `A page named "${pageName}" already exists.`,
            details:
              'You can view the existing page or edit it if you have permission.',
            actions: [
              {
                label: 'View Page',
                url: `/wiki/${encodeURIComponent(pageName)}`,
                class: 'btn-primary'
              },
              {
                label: 'Edit Page',
                url: `/edit/${encodeURIComponent(pageName)}`,
                class: 'btn-secondary'
              },
              {
                label: 'Back to Create',
                url: '/create',
                class: 'btn-outline-secondary'
              }
            ]
          });
        } catch (templateError) {
          logger.debug(
            'DEBUG: Error rendering template, falling back to simple message',
            templateError
          );
          return res.status(409).send('Page already exists');
        }
      }

      // Save the new page using WikiContext
      const metadata = {
        title: pageName,
        categories: categoriesArray,
        'user-keywords': Array.isArray(userKeywords)
          ? userKeywords
          : userKeywords
            ? [userKeywords]
            : []
      };

      await pageManager.savePageWithContext(wikiContext, metadata);

      // Rebuild search index and link graph
      const renderingManager = this.engine.getManager('RenderingManager');
      const searchManager = this.engine.getManager('SearchManager');
      await renderingManager.rebuildLinkGraph();
      await searchManager.rebuildIndex();

      // Clear rendered page cache to ensure pages with red links are re-rendered
      const cacheManager = this.engine.getManager('CacheManager');
      if (cacheManager && cacheManager.isInitialized()) {
        await cacheManager.clear();
        logger.debug('🗑️  Cleared cache after page creation to update red links');
      }

      // Redirect to edit the new page
      res.redirect(`/edit/${pageName}`);
    } catch (err: unknown) {
      logger.error('Error creating page from template:', err);
      res.status(500).send('Error creating page');
    }
  }
  async editPage(req: Request, res: Response) {
    try {
      const pageName = req.params.page;

      // Create WikiContext as single source of truth for this operation
      const wikiContext = this.createWikiContext(req, {
        context: WikiContext.CONTEXT.EDIT,
        pageName: pageName,
        response: res
      });

      // Extract user from WikiContext (single source of truth)
      const currentUser = wikiContext.userContext;
      const pageManager = this.engine.getManager('PageManager');
      const userManager = this.engine.getManager('UserManager');
      const aclManager = this.engine.getManager('ACLManager');

      // Check if user is authenticated - redirect to login if not
      if (!currentUser || !currentUser.isAuthenticated) {
        return res.redirect(
          '/login?redirect=' + encodeURIComponent(req.originalUrl)
        );
      }

      // Get page data to check ACL (if page exists)
      let pageData = await pageManager.getPage(pageName);

      // Check if this is a required page that needs admin access
      if (await this.isRequiredPage(pageName)) {
        if (
          !currentUser ||
          !(await userManager.hasPermission(
            currentUser.username,
            'admin:system'
          ))
        ) {
          return await this.renderError(
            req,
            res,
            403,
            'Access Denied',
            'Only administrators can edit this page'
          );
        }
      } else {
        // For existing pages, check ACL edit permission
        if (pageData) {
          // Update WikiContext with page content for ACL checking
          wikiContext.content = pageData.content;

          const hasEditPermission = await aclManager.checkPagePermissionWithContext(
            wikiContext,
            'edit'
          );

          if (!hasEditPermission) {
            return await this.renderError(
              req,
              res,
              403,
              'Access Denied',
              'You do not have permission to edit this page'
            );
          }
        } else {
          // For new pages, check general page creation permission
          if (
            !currentUser ||
            !(await userManager.hasPermission(
              currentUser.username,
              'page:create'
            ))
          ) {
            return await this.renderError(
              req,
              res,
              403,
              'Access Denied',
              'You do not have permission to create pages'
            );
          }
        }
      }

      // Get template data from WikiContext
      const templateData = this.getTemplateDataFromContext(wikiContext);
      const commonData = { ...templateData };

      // Get categories and keywords - use system categories for admin editing
      const isAdmin =
        currentUser &&
        (await userManager.hasPermission(currentUser.username, 'admin:system'));
      const systemCategories = await this.getSystemCategories();
      const userKeywords = await this.getUserKeywords();

      // If page doesn't exist, create empty page data for new page
      if (!pageData) {
        pageData = {
          content: '',
          metadata: {
            title: pageName,
            created: new Date().toISOString(),
            author: currentUser.username || 'Anonymous'
          }
        };
      }

      // Ensure content is a string for ACL processing
      if (!pageData.content || typeof pageData.content !== 'string') {
        pageData.content = '';
      }

      // Remove ACL markup from content for editing
      const cleanContent = aclManager.removeACLMarkup(pageData.content);
      pageData.content = cleanContent;

      // Extract current categories and keywords from metadata - handle both old and new format
      const selectedCategories =
        pageData.metadata?.categories ||
        (pageData.metadata?.category ? [pageData.metadata.category] : []);
      const selectedUserKeywords = pageData.metadata?.['user-keywords'] || [];

      const configManager = this.engine.getManager('ConfigurationManager');
      const maxUserKeywords = configManager
        ? configManager.getProperty('amdwiki.maximum.user-keywords', 5)
        : 5;

      res.render('edit', {
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
        csrfToken: req.session.csrfToken
      });
    } catch (err: unknown) {
      logger.error('Error loading edit page:', err);
      res.status(500).send('Error loading edit page');
    }
  }

  /**
   * Create a new wiki page via POST /wiki/:page
   * @param {object} req - Express request object
   * @param {object} res - Express response object
   */
  async createWikiPage(req: Request, res: Response) {
    try {
      const pageName = decodeURIComponent(req.params.page);
      const { content, templateName, categories, userKeywords } = req.body;

      let finalContent = content;

      // If a template was selected, apply it
      if (templateName && templateName !== 'none') {
        const templateManager = this.engine.getManager('TemplateManager');

        // Ensure categories is an array
        const categoriesArray = Array.isArray(categories)
          ? categories
          : categories
            ? [categories]
            : ['General'];

        // Apply template with variables
        const templateVars = {
          pageName: pageName,
          category: categoriesArray[0] || 'General',
          categories: categoriesArray.join(', '),
          userKeywords: Array.isArray(userKeywords)
            ? userKeywords.join(', ')
            : userKeywords || '',
          date: new Date().toISOString().split('T')[0]
        };

        finalContent = templateManager.applyTemplate(
          templateName,
          templateVars
        );
      } else if (!content) {
        return res.status(400).send('Content or template is required');
      }

      // Create WikiContext as single source of truth for this operation
      const wikiContext = this.createWikiContext(req, {
        context: WikiContext.CONTEXT.EDIT,
        pageName: pageName,
        content: finalContent,
        response: res
      });

      // Extract user from WikiContext (single source of truth)
      const currentUser = wikiContext.userContext;
      const userManager = this.engine.getManager('UserManager');
      const pageManager = this.engine.getManager('PageManager');

      // Check if user is authenticated
      if (!currentUser || !currentUser.isAuthenticated) {
        return res.redirect(
          '/login?redirect=' + encodeURIComponent(req.originalUrl)
        );
      }

      // Check if user has permission to create pages
      if (
        !(await userManager.hasPermission(currentUser.username, 'page:create'))
      ) {
        return await this.renderError(
          req,
          res,
          403,
          'Access Denied',
          'You do not have permission to create pages.'
        );
      }

      // Check if page already exists
      const existingPage = await pageManager.getPage(pageName);
      if (existingPage) {
        const commonData = await this.getCommonTemplateData(req);

        return res.status(409).render('error', {
          ...commonData,
          currentUser,
          error: { status: 409 },
          title: 'Page Already Exists',
          message: `A page named "${pageName}" already exists.`,
          details:
            'You can view the existing page or edit it if you have permission.',
          actions: [
            {
              label: 'View Page',
              url: `/wiki/${encodeURIComponent(pageName)}`,
              class: 'btn-primary'
            },
            {
              label: 'Edit Page',
              url: `/edit/${encodeURIComponent(pageName)}`,
              class: 'btn-secondary'
            },
            {
              label: 'Back to Create',
              url: '/create',
              class: 'btn-outline-secondary'
            }
          ]
        });
      }

      // Create metadata for new page
      const metadata = {
        title: pageName,
        category: categories || 'General',
        'user-keywords': Array.isArray(userKeywords)
          ? userKeywords
          : userKeywords
            ? [userKeywords]
            : []
      };

      // Save the new page using WikiContext
      await pageManager.savePageWithContext(wikiContext, metadata);

      // Rebuild search index and link graph
      const renderingManager = this.engine.getManager('RenderingManager');
      const searchManager = this.engine.getManager('SearchManager');
      await renderingManager.rebuildLinkGraph();
      await searchManager.rebuildIndex();

      // Clear rendered page cache to ensure pages with red links are re-rendered
      const cacheManager = this.engine.getManager('CacheManager');
      if (cacheManager && cacheManager.isInitialized()) {
        await cacheManager.clear();
        logger.debug('🗑️  Cleared cache after page creation to update red links');
      }

      // Redirect to edit the new page (so user can see template result)
      res.redirect(`/edit/${encodeURIComponent(pageName)}`);
    } catch (error: unknown) {
      logger.error('Error creating wiki page:', error);
      return await this.renderError(
        req,
        res,
        500,
        'Internal Server Error',
        'Failed to create page'
      );
    }
  }

  /**
   * Save a page
   */
  async savePage(req: Request, res: Response) {
    try {
      const pageName = req.params.page;
      logger.debug(`💾 Save request received for page: ${pageName}`);
      logger.debug(`💾 Request body keys: ${Object.keys(req.body).join(', ')}`);
      const { content, title, categories, userKeywords } = req.body;

      // Create WikiContext as single source of truth for this operation
      const wikiContext = this.createWikiContext(req, {
        context: WikiContext.CONTEXT.EDIT,
        pageName: pageName,
        content: content,
        response: res
      });

      const pageManager = this.engine.getManager('PageManager');
      const renderingManager = this.engine.getManager('RenderingManager');
      const searchManager = this.engine.getManager('SearchManager');
      const userManager = this.engine.getManager('UserManager');
      const aclManager = this.engine.getManager('ACLManager');
      const validationManager = this.engine.getManager('ValidationManager');

      // Get user context from WikiContext (single source of truth)
      const currentUser = wikiContext.userContext;

      // Get existing page data for ACL checking
      const existingPage = await pageManager.getPage(pageName);

      // Accept system-category as required field (new metadata format)
      const systemCategory = req.body['system-category'] || '';
      if (
        !systemCategory ||
        typeof systemCategory !== 'string' ||
        systemCategory.trim() === ''
      ) {
        return res.status(400).send('A system-category is required');
      }
      // Validate user keywords (preserve existing if none submitted)
      const submittedUserKeywords =
        typeof req.body.userKeywords !== 'undefined'
          ? req.body.userKeywords
          : typeof req.body['user-keywords'] !== 'undefined'
            ? req.body['user-keywords']
            : undefined;

      let userKeywordsArray;
      if (typeof submittedUserKeywords === 'undefined') {
        // No keywords submitted: keep existing ones
        userKeywordsArray = existingPage?.metadata?.['user-keywords'] || [];
      } else {
        userKeywordsArray = Array.isArray(submittedUserKeywords)
          ? submittedUserKeywords
          : submittedUserKeywords
            ? [submittedUserKeywords]
            : [];
      }

      // Prepare metadata ONCE, preserving UUID if editing
      const baseMetadata = {
        title: title || pageName,
        'system-category': systemCategory,
        'user-keywords': userKeywordsArray,
        author: currentUser?.username || 'anonymous'  // Add author for versioning
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
      const hardcodedRequiredPages = ['System Categories', 'Wiki Documentation'];
      const willBeRequired = hardcodedRequiredPages.includes(pageName) ||
                            hardcodedRequiredPages.includes(metadata.title) ||
                            metadata['system-category'] === 'System' ||
                            metadata['system-category'] === 'System/Admin';
      if (isCurrentlyRequired || willBeRequired) {
        if (
          !currentUser ||
          !(await userManager.hasPermission(
            currentUser.username,
            'admin:system'
          ))
        ) {
          return await this.renderError(
            req,
            res,
            403,
            'Access Denied',
            'Only administrators can edit this page or assign System/Admin category'
          );
        }
      } else {
        // For existing pages, check ACL edit permission
        if (existingPage) {
          if (
            !currentUser ||
            !(await userManager.hasPermission(
              currentUser.username,
              'page:create'
            ))
          ) {
            return await this.renderError(
              req,
              res,
              403,
              'Access Denied',
              'You do not have permission to create pages'
            );
          }
        }
      }

      // Save the page using WikiContext (author is automatically extracted from context)
      await pageManager.savePageWithContext(wikiContext, metadata);

      // Rebuild link graph and search index
      await renderingManager.rebuildLinkGraph();
      await searchManager.rebuildIndex();

      // Clear rendered page cache to ensure pages with red links are re-rendered
      const cacheManager = this.engine.getManager('CacheManager');
      if (cacheManager && cacheManager.isInitialized()) {
        await cacheManager.clear();
        logger.debug('🗑️  Cleared cache after page save to update red links');
      }

      // Redirect to the updated page title if it changed (fallback to original name)
      const redirectName = metadata.title || pageName;
      res.redirect(`/wiki/${encodeURIComponent(redirectName)}`);
    } catch (err: unknown) {
      logger.error('Error saving page:', err);
      res.status(500).send('Error saving page');
    }
  }

  /**
   * Delete a page
   */
  async deletePage(req: Request, res: Response) {
    try {
      const pageName = req.params.page;
      logger.debug(`🗑️ Delete request received for page: ${pageName}`);

      // Create WikiContext as single source of truth for this operation
      const wikiContext = this.createWikiContext(req, {
        context: WikiContext.CONTEXT.NONE,
        pageName: pageName,
        response: res
      });

      // Extract user from WikiContext (single source of truth)
      const currentUser = wikiContext.userContext;
      const pageManager = this.engine.getManager('PageManager');
      const renderingManager = this.engine.getManager('RenderingManager');
      const searchManager = this.engine.getManager('SearchManager');
      const userManager = this.engine.getManager('UserManager');
      const aclManager = this.engine.getManager('ACLManager');

      // Check if page exists
      const pageData = await pageManager.getPage(pageName);
      if (!pageData) {
        logger.debug(`❌ Page not found: ${pageName}`);
        return res.status(404).send('Page not found');
      }

      // Check if this is a required page that needs admin access
      if (await this.isRequiredPage(pageName)) {
        if (
          !currentUser ||
          !(await userManager.hasPermission(
            currentUser.username,
            'admin:system'
          ))
        ) {
          return await this.renderError(
            req,
            res,
            403,
            'Access Denied',
            'Only administrators can delete this page'
          );
        }
      } else {
        // Check ACL delete permission using WikiContext
        // Update WikiContext with page content for ACL checking
        wikiContext.content = pageData.content;

        const hasDeletePermission = await aclManager.checkPagePermissionWithContext(
          wikiContext,
          'delete'
        );

        if (!hasDeletePermission) {
          return await this.renderError(
            req,
            res,
            403,
            'Access Denied',
            'You do not have permission to delete this page'
          );
        }
      }

      logger.debug(`✅ Page found, proceeding to delete: ${pageName}`);

      // Delete the page using WikiContext (includes audit logging with user info)
      const deleteResult = await pageManager.deletePageWithContext(wikiContext);
      logger.debug(`🗑️ Delete result: ${deleteResult}`);

      if (deleteResult) {
        // Rebuild link graph and search index after deletion
        logger.debug('🔄 Rebuilding indexes after deletion...');
        await renderingManager.rebuildLinkGraph();
        await searchManager.rebuildIndex();

        logger.debug(`✅ Page deleted successfully: ${pageName}`);

        // Redirect to home page
        res.redirect('/');
      } else {
        logger.debug(`❌ Failed to delete page: ${pageName}`);
        res.status(500).send('Failed to delete page');
      }
    } catch (err: unknown) {
      logger.error('❌ Error deleting page:', err);
      res.status(500).send('Error deleting page');
    }
  }

  /**
   * Search pages with advanced options
   */
  async searchPages(req: Request, res: Response) {
    try {
      const query = req.query.q || '';

      // Create WikiContext as single source of truth for this operation
      const wikiContext = this.createWikiContext(req, {
        context: WikiContext.CONTEXT.NONE,
        response: res
      });

      // Handle multiple categories and keywords
      let categories = req.query.category || [];
      if (typeof categories === 'string') categories = [categories];
      categories = categories.filter((cat) => cat.trim() !== '');

      let userKeywords = req.query.keywords || [];
      if (typeof userKeywords === 'string') userKeywords = [userKeywords];
      userKeywords = userKeywords.filter((kw) => kw.trim() !== '');

      // Handle multiple searchIn values
      let searchIn = req.query.searchIn || ['all'];
      if (typeof searchIn === 'string') searchIn = [searchIn];
      searchIn = searchIn.filter((si) => si.trim() !== '');
      if (searchIn.length === 0) searchIn = ['all'];

      const searchManager = this.engine.getManager('SearchManager');

      // Get template data from WikiContext
      const templateData = this.getTemplateDataFromContext(wikiContext);
      const commonData = { ...templateData };

      let results = [];
      let searchType = 'text';

      // Determine search type and perform search
      if (query.trim() || categories.length > 0 || userKeywords.length > 0) {
        if (categories.length > 0 && !query && userKeywords.length === 0) {
          // Category-only search
          results = searchManager.searchByCategories
            ? searchManager.searchByCategories(categories)
            : searchManager.searchByCategory(categories[0]);
          searchType = 'category';
        } else if (
          userKeywords.length > 0 &&
          !query &&
          categories.length === 0
        ) {
          // Keywords-only search
          results = searchManager.searchByUserKeywordsList
            ? searchManager.searchByUserKeywordsList(userKeywords)
            : searchManager.searchByUserKeywords(userKeywords[0]);
          searchType = 'keywords';
        } else {
          // Advanced search with multiple criteria using WikiContext
          results = await searchManager.advancedSearchWithContext(wikiContext, {
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
      const systemCategories = await this.getSystemCategories();
      const userKeywordsList = await this.getUserKeywords();

      // Get stats for search results (optional, fallback to empty if not available)
      let stats = {};
      if (searchManager.getStats) {
        stats = searchManager.getStats();
      }
      res.render('search-results', {
        ...commonData,
        title: 'Search Results',
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
        stats: stats
      });
    } catch (err: unknown) {
      logger.error('Error searching:', err);
      res.status(500).send('Error performing search');
    }
  }

  /**
   * API endpoint for search suggestions
   */
  async searchSuggestions(req: Request, res: Response) {
    try {
      const partial = req.query.q || '';
      const searchManager = this.engine.getManager('SearchManager');

      const suggestions = searchManager.getSuggestions(partial);

      res.json({ suggestions });
    } catch (err: unknown) {
      logger.error('Error getting suggestions:', err);
      res.status(500).json({ error: 'Error getting suggestions' });
    }
  }

  /**
   * API endpoint for getting all page names
   */
  async getPageNames(req: Request, res: Response) {
    try {
      const pageManager = this.engine.getManager('PageManager');
      const pageNames = await pageManager.getPageNames();

      res.json(pageNames);
    } catch (err: unknown) {
      logger.error('Error getting page names:', err);
      res.status(500).json({ error: 'Error getting page names' });
    }
  }

  /**
   * Home page - show main index
   */
  async homePage(req: Request, res: Response) {
    // Redirect to Welcome page instead of rendering a separate home page
    res.redirect('/wiki/Welcome');
  }

  /**
   * API endpoint to get page preview
   */
  async previewPage(req: Request, res: Response) {
    logger.debug('!!! PREVIEW PAGE METHOD CALLED !!!');
    try {
      const { content, pageName } = req.body;
      const renderingManager = this.engine.getManager('RenderingManager');

      // Get common template data with user (same as viewPage for consistency)
      const commonData = await this.getCommonTemplateData(req);

      // Get request info for consistency with actual page rendering
      const requestInfo = this.getRequestInfo(req);

      logger.debug(
        'DEBUG: previewPage calling renderMarkdown with content:',
        content,
        'pageName:',
        pageName
      );
      logger.debug('DEBUG: previewPage using user context:', commonData.user);
      const renderedContent = await renderingManager.renderMarkdown(
        content,
        pageName,
        commonData.user,
        requestInfo
      );
      logger.debug(
        'DEBUG: previewPage received renderedContent:',
        renderedContent
      );

      res.json({
        html: renderedContent,
        success: true
      });
    } catch (err: unknown) {
      logger.error('Error generating preview:', err);
      res.status(500).json({
        error: 'Error generating preview',
        success: false
      });
    }
  }

  /**
   * Upload attachment for a page
   */
  async uploadAttachment(req: Request, res: Response) {
    try {
      const { page: pageName } = req.params;
      const attachmentManager = this.engine.getManager('AttachmentManager');

      // 🔒 SECURITY: Check authentication
      const currentUser = req.userContext;
      if (!currentUser || !currentUser.isAuthenticated) {
        return res.status(401).json({
          success: false,
          error: 'Authentication required to upload attachments'
        });
      }

      if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
      }

      // Prepare file info
      const fileBuffer = req.file.buffer;
      const fileInfo = {
        originalName: req.file.originalname,
        mimeType: req.file.mimetype,
        size: req.file.size
      };

      // Prepare options with full user context for permission checks
      const options = {
        pageName: pageName,
        description: req.body.description || '',
        context: currentUser // Pass full userContext for PolicyManager
      };

      // Upload via AttachmentManager (handles permission checks)
      const attachment = await attachmentManager.uploadAttachment(
        fileBuffer,
        fileInfo,
        options
      );

      res.json({
        success: true,
        attachment: attachment,
        attachmentId: attachment.identifier,
        url: attachment.url,
        message: 'File uploaded successfully'
      });
    } catch (err: unknown) {
      logger.error('Error uploading attachment:', err);
      res.status(500).json({
        success: false,
        error: getErrorMessage(err) || 'Error uploading file'
      });
    }
  }

  /**
   * Upload image file
   */
  async uploadImage(req: Request, res: Response) {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No image file uploaded' });
      }

      // Return the image path that can be used in the Image plugin
      const imagePath = `/images/${req.file.filename}`;

      res.json({
        success: true,
        imagePath: imagePath,
        filename: req.file.filename,
        originalName: req.file.originalname,
        size: req.file.size,
        message: 'Image uploaded successfully'
      });
    } catch (err: unknown) {
      logger.error('Error uploading image:', err);
      res.status(500).json({
        success: false,
        error: getErrorMessage(err) || 'Error uploading image'
      });
    }
  }

  /**
   * Serve attachment file
   */
  async serveAttachment(req: Request, res: Response) {
    try {
      const { attachmentId } = req.params;
      const attachmentManager = this.engine.getManager('AttachmentManager');

      // Get attachment with buffer and metadata
      const result = await attachmentManager.getAttachment(attachmentId);
      if (!result) {
        return res.status(404).send('Attachment not found');
      }

      const { buffer, metadata } = result;

      // Set headers
      res.setHeader('Content-Type', metadata.encodingFormat);
      res.setHeader(
        'Content-Disposition',
        `inline; filename="${metadata.name}"`
      );
      res.setHeader('Content-Length', metadata.contentSize);

      // Send buffer
      res.send(buffer);
    } catch (err: unknown) {
      logger.error('Error serving attachment:', err);
      res.status(500).send('Error serving attachment');
    }
  }

  /**
   * Delete attachment
   */
  async deleteAttachment(req: Request, res: Response) {
    try {
      const { attachmentId } = req.params;
      const attachmentManager = this.engine.getManager('AttachmentManager');

      // 🔒 SECURITY: Check authentication
      const currentUser = req.userContext;
      if (!currentUser || !currentUser.isAuthenticated) {
        return res.status(401).json({
          success: false,
          error: 'Authentication required to delete attachments'
        });
      }

      // Delete via AttachmentManager (handles permission checks)
      // Pass full userContext for PolicyManager
      const deleted = await attachmentManager.deleteAttachment(
        attachmentId,
        currentUser
      );

      if (!deleted) {
        return res.status(404).json({
          success: false,
          error: 'Attachment not found'
        });
      }

      res.json({
        success: true,
        message: 'Attachment deleted successfully'
      });
    } catch (err: unknown) {
      logger.error('Error deleting attachment:', err);
      res.status(500).json({
        success: false,
        error: getErrorMessage(err) || 'Error deleting attachment'
      });
    }
  }

  /**
   * Export page selection form
   */
  async exportPage(req: Request, res: Response) {
    try {
      const commonData = await this.getCommonTemplateData(req);
      const pageManager = this.engine.getManager('PageManager');
      const pageNames = await pageManager.getAllPages();

      res.render('export', {
        ...commonData,
        title: 'Export Pages',
        pageNames: pageNames
      });
    } catch (err: unknown) {
      logger.error('Error loading export page:', err);
      res.status(500).send('Error loading export page');
    }
  }

  /**
   * Export page to HTML
   */
  async exportPageHtml(req: Request, res: Response) {
    try {
      const { page: pageName } = req.params;
      const exportManager = this.engine.getManager('ExportManager');

      const html = await exportManager.exportPageToHtml(pageName);
      await exportManager.saveExport(html, pageName, 'html');
      res.status(200).send('Export succesfull');

    } catch (err: unknown) {
      logger.error('Error exporting to HTML:', err);
      res.status(500).send('Error exporting page');
    }
  }

  /**
   * Export page to Markdown
   */
  async exportPageMarkdown(req: Request, res: Response) {
    try {
      const { page: pageName } = req.params;
      const exportManager = this.engine.getManager('ExportManager');

      const markdown = await exportManager.exportToMarkdown(pageName);
      await exportManager.saveExport(markdown, pageName, 'markdown');

      res.status(200).send('Export succesfull');

    } catch (err: unknown) {
      logger.error('Error exporting to Markdown:', err);
      res.status(500).send('Error exporting page');
    }
  }

  /**
   * List available exports
   */
  async listExports(req: Request, res: Response) {
    try {
      const commonData = await this.getCommonTemplateData(req);
      const exportManager = this.engine.getManager('ExportManager');
      const exports = await exportManager.getExports();

      res.render('exports', {
        ...commonData,
        title: 'Exports',
        exports: exports
      });
    } catch (err: unknown) {
      logger.error('Error listing exports:', err);
      res.status(500).send('Error listing exports');
    }
  }

  /**
   * Download export file
   */
  async downloadExport(req: Request, res: Response) {
    try {
      const { filename } = req.params;
      const exportManager = this.engine.getManager('ExportManager');
      const exports = await exportManager.getExports();

      const exportFile = exports.find((e) => e.filename === filename);
      if (!exportFile) {
        return res.status(404).send('Export not found');
      }

      res.download(exportFile.path, filename);
    } catch (err: unknown) {
      logger.error('Error downloading export:', err);
      res.status(500).send('Error downloading export');
    }
  }

  /**
   * Delete export file
   */
  async deleteExport(req: Request, res: Response) {
    try {
      const { filename } = req.params;
      const exportManager = this.engine.getManager('ExportManager');
      
      await exportManager.deleteExport(filename);
      res.sendStatus(204);
    }
    catch (err) {
      logger.error('Error deleting export:', err);
      res.status(500).json({ message:'Error deleting export' });
    }
  }

  /**
   * Login page
   */
  async loginPage(req: Request, res: Response) {
    try {
      const userManager = this.engine.getManager('UserManager');
      const currentUser = req.userContext;

      // Redirect if already logged in
      if (currentUser && currentUser.isAuthenticated) {
        const redirect = req.query.redirect || '/';
        return res.redirect(redirect);
      }

      const commonData = await this.getCommonTemplateData(req);

      res.render('login', {
        ...commonData,
        title: 'Login',
        error: req.query.error,
        redirect: req.query.redirect,
        csrfToken: req.session?.csrfToken || ''
      });
    } catch (err: unknown) {
      logger.error('Error loading login page:', err);
      res.status(500).send('Error loading login page');
    }
  }

  /**
   * Process login
   */
  async processLogin(req: Request, res: Response) {
    try {
      const { username, password, redirect = '/' } = req.body;
      const userManager = this.engine.getManager('UserManager');
      const configManager = this.engine.getManager('ConfigurationManager');
      const debugLogin = configManager.getProperty(
        'amdwiki.logging.debug.login',
        false
      );

      if (debugLogin) logger.debug('DEBUG: Login attempt for:', username);

      const user = await userManager.authenticateUser(username, password);
      if (!user) {
        if (debugLogin)
          logger.debug('DEBUG: Authentication failed for:', username);
        return res.redirect(
          '/login?error=Invalid username or password&redirect=' +
            encodeURIComponent(redirect)
        );
      }

      // Store username in express-session
      req.session.username = user.username;
      req.session.isAuthenticated = true;

      logger.info(`👤 User logged in: ${username}`);

      if (debugLogin) {
        logger.debug('DEBUG: Session ID:', req.sessionID);
        logger.debug(
          'DEBUG: Session data before save:',
          JSON.stringify(req.session)
        );
        logger.debug('DEBUG: Session set, redirecting to:', redirect);
      }

      // Save session before redirect
      req.session.save((err) => {
        if (err) {
          logger.error('Error saving session:', err);
          return res.redirect('/login?error=Session save failed');
        }
        if (debugLogin)
          logger.debug('DEBUG: Session saved successfully, now redirecting');
        res.redirect(redirect);
      });
    } catch (err: unknown) {
      logger.error('Error processing login:', err);
      res.redirect('/login?error=Login failed');
    }
  }

  /**
   * Process logout
   */
  async processLogout(req: Request, res: Response) {
    try {
      // Destroy express-session
      req.session.destroy((err) => {
        if (err) {
          logger.error('Error destroying session:', err);
        }
        res.redirect('/');
      });
    } catch (err: unknown) {
      logger.error('Error processing logout:', err);
      res.redirect('/');
    }
  }

  /**
   * User info debug page (shows current user state)
   */
  async userInfo(req: Request, res: Response) {
    try {
      const userManager = this.engine.getManager('UserManager');
      const currentUser = req.userContext;
      const sessionId = req.cookies?.sessionId;
      const session = sessionId ? await userManager.getSession(sessionId) : null;

      const info = {
        currentUser: currentUser,
        sessionId: sessionId,
        sessionExists: !!session,
        sessionExpired: sessionId && !session,
        userType: !currentUser
          ? 'No User/Anonymous'
          : currentUser.username === 'anonymous'
            ? 'Anonymous'
            : currentUser.username === 'asserted'
              ? 'Asserted (has cookie)'
              : currentUser.isAuthenticated
                ? 'Authenticated'
                : 'Unknown',
        hasSessionCookie: !!sessionId,
        permissions: currentUser
          ? userManager.getUserPermissions(currentUser.username)
          : (await userManager.hasPermission(null, 'page:read'))
            ? ['anonymous permissions']
            : []
      };

      res.json(info);
    } catch (err: unknown) {
      logger.error('Error getting user info:', err);
      res.status(500).json({ error: getErrorMessage(err) });
    }
  }

  /**
   * Registration page
   */
  async registerPage(req: Request, res: Response) {
    try {
      const commonData = await this.getCommonTemplateData(req);

      res.render('register', {
        ...commonData,
        title: 'Register',
        error: req.query.error,
        csrfToken: req.session.csrfToken
      });
    } catch (err: unknown) {
      logger.error('Error loading register page:', err);
      res.status(500).send('Error loading register page');
    }
  }

  /**
   * Process registration
   */
  async processRegister(req: Request, res: Response) {
    try {
      const { username, email, displayName, password, confirmPassword } =
        req.body;
      const userManager = this.engine.getManager('UserManager');

      // Validation
      if (!username || !email || !password) {
        return res.redirect('/register?error=All fields are required');
      }

      if (password !== confirmPassword) {
        return res.redirect('/register?error=Passwords do not match');
      }

      if (password.length < 6) {
        return res.redirect(
          '/register?error=Password must be at least 6 characters'
        );
      }

      const user = await userManager.createUser({
        username,
        email,
        displayName: displayName || username,
        password,
        roles: ['reader'], // Default role
        isExternal: false, // Local user
        acceptLanguage: req.headers['accept-language'] // Pass browser locale
      });

      logger.debug(`👤 User registered: ${username}`);
      res.redirect('/login?success=Registration successful');
    } catch (err: unknown) {
      logger.error('Error processing registration:', err);
      const errorMessage = getErrorMessage(err) || 'Registration failed';
      res.redirect('/register?error=' + encodeURIComponent(errorMessage));
    }
  }

  /**
   * User profile page
   */
  async profilePage(req: Request, res: Response) {
    logger.debug('DEBUG: profilePage accessed');
    try {
      const userManager = this.engine.getManager('UserManager');
      const currentUser = req.userContext;

      logger.debug(
        'DEBUG: currentUser from req.userContext:',
        currentUser ? currentUser.username : 'null'
      );

      if (!currentUser || !currentUser.isAuthenticated) {
        logger.debug('DEBUG: No authenticated user, redirecting to login');
        return res.redirect('/login?redirect=/profile');
      }

      // Get fresh user data from database to ensure we have latest preferences
      const freshUser = await userManager.getUser(currentUser.username);
      logger.debug(
        'DEBUG: profilePage - fresh user preferences:',
        freshUser ? freshUser.preferences : 'no fresh user'
      );

      const commonData = await this.getCommonTemplateData(req);
      const userPermissions = await userManager.getUserPermissions(
        currentUser.username
      );

      // Get timezone and date format configuration
      const configManager = this.engine.getManager('ConfigurationManager');
      const availableTimezones = configManager
        ? configManager.getProperty('amdwiki.timezones', [])
        : [];

      const LocaleUtils = require('../utils/LocaleUtils');
      const availableDateFormats = LocaleUtils.getDateFormatOptions();

      res.render('profile', {
        ...commonData,
        title: 'Profile',
        user: freshUser || currentUser, // Use fresh user data if available
        permissions: userPermissions,
        availableTimezones: availableTimezones,
        availableDateFormats: availableDateFormats,
        error: req.query.error,
        success: req.query.success,
        csrfToken: req.session.csrfToken
      });
    } catch (err: unknown) {
      logger.error('Error loading profile page:', err);
      res.status(500).send('Error loading profile page');
    }
  }

  /**
   * Update user profile
   */
  async updateProfile(req: Request, res: Response) {
    try {
      const userManager = this.engine.getManager('UserManager');
      const currentUser = req.userContext;

      if (!currentUser || !currentUser.isAuthenticated) {
        return res.redirect('/login');
      }

      const {
        displayName,
        email,
        currentPassword,
        newPassword,
        confirmPassword
      } = req.body;
      const updates = {};

      if (displayName) updates.displayName = displayName;
      if (email) updates.email = email;

      // Handle password change for local users only
      if (newPassword && !currentUser.isExternal) {
        if (!currentPassword) {
          return res.redirect(
            '/profile?error=Current password required to change password'
          );
        }

        if (newPassword !== confirmPassword) {
          return res.redirect('/profile?error=New passwords do not match');
        }

        if (newPassword.length < 6) {
          return res.redirect(
            '/profile?error=Password must be at least 6 characters'
          );
        }

        // Verify current password
        const isValidPassword = await userManager.authenticateUser(
          currentUser.username,
          currentPassword
        );
        if (!isValidPassword) {
          return res.redirect('/profile?error=Current password is incorrect');
        }

        updates.password = newPassword;
      } else if (newPassword && currentUser.isExternal) {
        return res.redirect(
          '/profile?error=Cannot change password for OAuth accounts'
        );
      }

      await userManager.updateUser(currentUser.username, updates);

      res.redirect('/profile?success=Profile updated successfully');
    } catch (err: unknown) {
      logger.error('Error updating profile:', err);
      res.redirect('/profile?error=Failed to update profile');
    }
  }

  /**
   * Update user preferences
   */
  async updatePreferences(req: Request, res: Response) {
    logger.debug('=== updatePreferences method called ===');
    try {
      logger.debug('DEBUG: Request body:', req.body);
      const userManager = this.engine.getManager('UserManager');
      const currentUser = req.userContext;

      logger.debug(
        'DEBUG: Current user:',
        currentUser ? currentUser.username : 'null'
      );

      if (!currentUser || !currentUser.isAuthenticated) {
        logger.debug('DEBUG: No current user, redirecting to login');
        return res.redirect('/login');
      }

      logger.debug('DEBUG: updatePreferences - req.body:', req.body);
      logger.debug(
        'DEBUG: updatePreferences - currentUser:',
        currentUser.username
      );

      // Get current user's existing preferences
      const currentPreferences = currentUser.preferences || {};
      logger.debug(
        'DEBUG: updatePreferences - current preferences:',
        currentPreferences
      );

      // Extract preference values from form and merge with existing
      const preferences = { ...currentPreferences };

      // Editor preferences
      preferences['editor.plain.smartpairs'] =
        req.body['editor.plain.smartpairs'] === 'on';
      preferences['editor.autoindent'] = req.body['editor.autoindent'] === 'on';
      preferences['editor.linenumbers'] =
        req.body['editor.linenumbers'] === 'on';
      preferences['editor.theme'] = req.body['editor.theme'] || 'default';

      // Display preferences
      preferences['display.pagesize'] = req.body['display.pagesize'] || '25';
      preferences['display.tooltips'] = req.body['display.tooltips'] === 'on';
      preferences['display.readermode'] =
        req.body['display.readermode'] === 'on';
      preferences['display.theme'] = req.body['display.theme'] || 'system';

      // Locale preferences (new system)
      if (req.body['preferences.locale']) {
        preferences['locale'] = req.body['preferences.locale'];
      }
      if (req.body['preferences.timeFormat']) {
        preferences['timeFormat'] = req.body['preferences.timeFormat'];
      }
      if (req.body['preferences.timezone']) {
        preferences['timezone'] = req.body['preferences.timezone'];
      }

      // Handle date format preference
      if (req.body['preferences.dateFormat']) {
        const selectedDateFormat = req.body['preferences.dateFormat'];
        if (selectedDateFormat === 'auto') {
          // Use locale-based format
          const LocaleUtils = require('../utils/LocaleUtils');
          preferences['dateFormat'] = LocaleUtils.getDateFormatFromLocale(
            req.body['preferences.locale'] || 'en-US'
          );
        } else {
          // Use manually selected format
          preferences['dateFormat'] = selectedDateFormat;
        }
      } else if (req.body['preferences.locale']) {
        // Fallback: Update dateFormat based on locale if locale is provided but no explicit dateFormat
        const LocaleUtils = require('../utils/LocaleUtils');
        preferences['dateFormat'] = LocaleUtils.getDateFormatFromLocale(
          req.body['preferences.locale']
        );
      }

      logger.debug(
        'DEBUG: updatePreferences - preferences to save:',
        preferences
      );

      // Update user with new preferences
      await userManager.updateUser(currentUser.username, { preferences });

      logger.debug('DEBUG: updatePreferences - preferences saved successfully');
      res.redirect('/profile?success=Preferences saved successfully');
    } catch (err: unknown) {
      logger.error('Error updating preferences:', err);
      res.redirect('/profile?error=Failed to save preferences');
    }
  }

  /**
   * Admin dashboard
   */
  async adminDashboard(req: Request, res: Response) {
    try {
      const currentUser = req.userContext;
      const aclManager = this.engine.getManager('ACLManager');

      // Check admin access using PolicyEvaluator
      const hasAccess = await aclManager.checkPagePermission(
        'AdminDashboard',
        'view',
        currentUser
      );

      if (!currentUser || !currentUser.isAuthenticated || !hasAccess) {
        return await this.renderError(
          req,
          res,
          403,
          'Access Denied',
          'You do not have permission to access the admin dashboard'
        );
      }

      const userManager = this.engine.getManager('UserManager');

      const commonData = await this.getCommonTemplateData(req);
      const users = await userManager.getUsers();
      const roles = userManager.getRoles();

      // Get all required pages for the admin dashboard
      const pageManager = this.engine.getManager('PageManager');
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
        uptime: Math.floor(process.uptime()) + ' seconds',
        version: '1.0.0'
      };

      // Mock recent activity (in a real implementation, this would come from logs)
      const recentActivity = [
        {
          timestamp: new Date().toLocaleString(),
          description: 'User logged in: ' + currentUser.username
        },
        {
          timestamp: new Date(Date.now() - 60000).toLocaleString(),
          description: 'System started'
        }
      ];

      // Get system notifications
      let notifications = [];
      try {
        const notificationManager = this.engine.getManager(
          'NotificationManager'
        );
        notifications = notificationManager.getAllNotifications().slice(-10); // Get last 10 notifications
      } catch (error: unknown) {
        logger.error(
          'Error fetching notifications for admin dashboard:',
          error
        );
      }

      const templateData = {
        ...commonData,
        title: 'Admin Dashboard',
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
        errorMessage: req.query.error || null
      };

      res.render('admin-dashboard', templateData);
    } catch (err: unknown) {
      logger.error('Error loading admin dashboard:', err);
      res.status(500).send('Error loading admin dashboard');
    }
  }

  /**
   * Toggle maintenance mode (admin only)
   */
  async adminToggleMaintenance(req: Request, res: Response) {
    try {
      const userManager = this.engine.getManager('UserManager');
      const currentUser = req.userContext;

      if (
        !currentUser ||
        !(await userManager.hasPermission(currentUser.username, 'admin:system'))
      ) {
        return res.status(403).send('Access denied');
      }

      // Toggle maintenance mode in config
      const config = this.engine.config;
      const currentMode = config.features?.maintenance?.enabled || false;
      config.features.maintenance.enabled = !currentMode;

      // Log the maintenance mode change
      logger.info(
        `Maintenance mode ${
          config.features.maintenance.enabled ? 'ENABLED' : 'DISABLED'
        } by ${currentUser.username}`,
        {
          action: 'maintenance_mode_toggle',
          newState: config.features.maintenance.enabled,
          user: currentUser.username,
          userIP: req.ip || req.connection.remoteAddress,
          userAgent: req.get('User-Agent'),
          timestamp: new Date().toISOString()
        }
      );

      // Create notification for all users about maintenance mode change
      try {
        const notificationManager = this.engine.getManager(
          'NotificationManager'
        );
        await notificationManager.createMaintenanceNotification(
          config.features.maintenance.enabled,
          currentUser.username,
          config.features.maintenance
        );

        logger.info('Maintenance notification created for mode change', {
          action: 'maintenance_notification_created',
          mode: config.features.maintenance.enabled ? 'enabled' : 'disabled',
          triggeredBy: currentUser.username,
          timestamp: new Date().toISOString()
        });
      } catch (notificationError) {
        logger.error('Failed to create maintenance notification', {
          action: 'maintenance_notification_failed',
          error: notificationError.message,
          mode: config.features.maintenance.enabled ? 'enabled' : 'disabled',
          triggeredBy: currentUser.username,
          timestamp: new Date().toISOString()
        });
      }

      // Create detailed success message
      const action = config.features.maintenance.enabled
        ? 'ENABLED'
        : 'DISABLED';
      const message =
        `Maintenance mode has been ${action.toLowerCase()}. ` +
        (config.features.maintenance.enabled
          ? 'Regular users will see a maintenance page until it is disabled.'
          : 'The system is now fully accessible to all users.');

      // Redirect back to admin dashboard with detailed success message
      res.redirect(`/admin?success=${encodeURIComponent(message)}`);
    } catch (err: unknown) {
      logger.error('Error toggling maintenance mode', {
        error: getErrorMessage(err),
        stack: err.stack,
        user: req.session?.user?.username || 'unknown'
      });
      res.redirect('/admin?error=Failed to toggle maintenance mode');
    }
  }

  /**
   * Admin policy management dashboard
   */
  async adminPolicies(req: Request, res: Response) {
    try {
      const userManager = this.engine.getManager('UserManager');
      const currentUser = req.userContext;

      if (
        !currentUser ||
        !(await userManager.hasPermission(currentUser.username, 'admin:system'))
      ) {
        return await this.renderError(
          req,
          res,
          403,
          'Access Denied',
          'You do not have permission to access policy management'
        );
      }

      const commonData = await this.getCommonTemplateData(req);
      const policyManager = this.engine.getManager('PolicyManager');

      if (!policyManager) {
        return await this.renderError(
          req,
          res,
          500,
          'Configuration Error',
          'PolicyManager is not available'
        );
      }

      const policies = policyManager.getPolicies();

      res.render('admin-policies', {
        ...commonData,
        title: 'Policy Management',
        policies: policies,
        user: currentUser,
        csrfToken: req.session.csrfToken || '',
        successMessage: req.query.success || null,
        errorMessage: req.query.error || null
      });
    } catch (err: unknown) {
      logger.error('Error loading policy management:', err);
      res.status(500).send('Error loading policy management');
    }
  }

  /**
   * Create a new policy
   */
  async adminCreatePolicy(req: Request, res: Response) {
    try {
      const userManager = this.engine.getManager('UserManager');
      const currentUser = req.userContext;

      if (
        !currentUser ||
        !(await userManager.hasPermission(currentUser.username, 'admin:system'))
      ) {
        return res.status(403).json({ error: 'Access denied' });
      }

      const policyManager = this.engine.getManager('PolicyManager');
      const policyValidator = this.engine.getManager('PolicyValidator');

      if (!policyManager || !policyValidator) {
        return res.status(500).json({ error: 'Policy system not available' });
      }

      const policyData = req.body;

      // Validate and save the policy
      const result = await policyValidator.validateAndSavePolicy(policyData);

      res.json({
        success: true,
        policy: result.policy,
        message: 'Policy created successfully'
      });
    } catch (err: unknown) {
      logger.error('Error creating policy:', err);
      res.status(500).json({
        error: 'Failed to create policy',
        details: getErrorMessage(err)
      });
    }
  }

  /**
   * Get a specific policy
   */
  async adminGetPolicy(req: Request, res: Response) {
    try {
      const userManager = this.engine.getManager('UserManager');
      const currentUser = req.userContext;

      if (
        !currentUser ||
        !(await userManager.hasPermission(currentUser.username, 'admin:system'))
      ) {
        return res.status(403).json({ error: 'Access denied' });
      }

      const policyManager = this.engine.getManager('PolicyManager');
      const policyId = req.params.id;

      if (!policyManager) {
        return res.status(500).json({ error: 'Policy system not available' });
      }

      const policy = policyManager.getPolicy(policyId);

      if (!policy) {
        return res.status(404).json({ error: 'Policy not found' });
      }

      res.json(policy);
    } catch (err: unknown) {
      logger.error('Error retrieving policy:', err);
      res.status(500).json({
        error: 'Failed to retrieve policy',
        details: getErrorMessage(err)
      });
    }
  }

  /**
   * Update an existing policy
   */
  async adminUpdatePolicy(req: Request, res: Response) {
    try {
      const userManager = this.engine.getManager('UserManager');
      const currentUser = req.userContext;

      if (
        !currentUser ||
        !(await userManager.hasPermission(currentUser.username, 'admin:system'))
      ) {
        return res.status(403).json({ error: 'Access denied' });
      }

      const policyManager = this.engine.getManager('PolicyManager');
      const policyValidator = this.engine.getManager('PolicyValidator');
      const policyId = req.params.id;
      const policyData = { ...req.body, id: policyId };

      if (!policyManager || !policyValidator) {
        return res.status(500).json({ error: 'Policy system not available' });
      }

      // Validate and save the updated policy
      const result = await policyValidator.validateAndSavePolicy(policyData);

      res.json({
        success: true,
        policy: result.policy,
        message: 'Policy updated successfully'
      });
    } catch (err: unknown) {
      logger.error('Error updating policy:', err);
      res.status(500).json({
        error: 'Failed to update policy',
        details: getErrorMessage(err)
      });
    }
  }

  /**
   * Delete a policy
   */
  async adminDeletePolicy(req: Request, res: Response) {
    try {
      const userManager = this.engine.getManager('UserManager');
      const currentUser = req.userContext;

      if (
        !currentUser ||
        !(await userManager.hasPermission(currentUser.username, 'admin:system'))
      ) {
        return res.status(403).json({ error: 'Access denied' });
      }

      const policyManager = this.engine.getManager('PolicyManager');
      const policyId = req.params.id;

      if (!policyManager) {
        return res.status(500).json({ error: 'Policy system not available' });
      }

      const success = await policyManager.deletePolicy(policyId);

      if (!success) {
        return res.status(404).json({ error: 'Policy not found' });
      }

      res.json({
        success: true,
        message: 'Policy deleted successfully'
      });
    } catch (err: unknown) {
      logger.error('Error deleting policy:', err);
      res.status(500).json({
        error: 'Failed to delete policy',
        details: getErrorMessage(err)
      });
    }
  }

  /**
   * Admin users management
   */
  async adminUsers(req: Request, res: Response) {
    try {
      const userManager = this.engine.getManager('UserManager');
      const currentUser = req.userContext;

      if (
        !currentUser ||
        !(await userManager.hasPermission(currentUser.username, 'admin:users'))
      ) {
        return await this.renderError(
          req,
          res,
          403,
          'Access Denied',
          'You do not have permission to access user management'
        );
      }

      const commonData = await this.getCommonTemplateData(req);
      const users = await userManager.getUsers();
      const roles = userManager.getRoles();

      res.render('admin-users', {
        ...commonData,
        title: 'User Management',
        users: users,
        roles: roles,
        successMessage: req.query.success || null,
        errorMessage: req.query.error || null,
        csrfToken: req.session.csrfToken
      });
    } catch (err: unknown) {
      logger.error('Error loading admin users:', err);
      res.status(500).send('Error loading user management');
    }
  }

  /**
   * Create new user (admin)
   */
  async adminCreateUser(req: Request, res: Response) {
    try {
      const userManager = this.engine.getManager('UserManager');
      const currentUser = req.userContext;

      if (
        !currentUser ||
        !(await userManager.hasPermission(currentUser.username, 'admin:users'))
      ) {
        return res.status(403).send('Access denied');
      }

      const { username, email, displayName, password, roles } = req.body;

      logger.debug(`[admin/users] Attempting to create user: "${username}" with display name: "${displayName}"`);

      const success = await userManager.createUser({
        username,
        email,
        displayName,
        password,
        roles: Array.isArray(roles) ? roles : [roles],
        acceptLanguage: req.headers['accept-language'] // Pass browser locale
      });

      if (success) {
        res.redirect('/admin/users?success=User created successfully');
      } else {
        res.redirect('/admin/users?error=Failed to create user');
      }
    } catch (err: unknown) {
      logger.error('Error creating user:', err);
      const errorMessage = encodeURIComponent(getErrorMessage(err) || 'Error creating user');
      res.redirect(`/admin/users?error=${errorMessage}`);
    }
  }

  /**
   * Update user (admin)
   */
  async adminUpdateUser(req: Request, res: Response) {
    try {
      const userManager = this.engine.getManager('UserManager');
      const currentUser = req.userContext;

      if (
        !currentUser ||
        !(await userManager.hasPermission(currentUser.username, 'admin:users'))
      ) {
        return res
          .status(403)
          .json({ success: false, message: 'Access denied' });
      }

      const username = req.params.username;
      const updates = req.body;

      const success = await userManager.updateUser(username, updates);

      if (success) {
        res.json({ success: true, message: 'User updated successfully' });
      } else {
        res
          .status(400)
          .json({ success: false, message: 'Failed to update user' });
      }
    } catch (err: unknown) {
      logger.error('Error updating user:', err);
      res.status(500).json({ success: false, message: 'Error updating user' });
    }
  }

  /**
   * Delete user (admin)
   */
  async adminDeleteUser(req: Request, res: Response) {
    try {
      const userManager = this.engine.getManager('UserManager');
      const currentUser = req.userContext;

      if (
        !currentUser ||
        !(await userManager.hasPermission(currentUser.username, 'admin:users'))
      ) {
        return res.status(403).send('Access denied');
      }

      const username = req.params.username;
      const success = await userManager.deleteUser(username);

      if (success) {
        res.json({ success: true, message: 'User deleted successfully' });
      } else {
        res
          .status(400)
          .json({ success: false, message: 'Failed to delete user' });
      }
    } catch (err: unknown) {
      logger.error('Error deleting user:', err);
      res.status(500).json({ success: false, message: 'Error deleting user' });
    }
  }

  /**
   * Admin roles management
   */
  async adminRoles(req: Request, res: Response) {
    try {
      const userManager = this.engine.getManager('UserManager');
      const currentUser = req.userContext;

      if (
        !currentUser ||
        !(await userManager.hasPermission(currentUser.username, 'admin:roles'))
      ) {
        return await this.renderError(
          req,
          res,
          403,
          'Access Denied',
          'You do not have permission to manage roles'
        );
      }

      const commonData = await this.getCommonTemplateData(req);
      const roles = userManager.getRoles();
      const permissions = userManager.getPermissions();

      res.render('admin-roles', {
        ...commonData,
        title: 'Security Policy Management',
        roles: Array.from(roles.values()),
        permissions: Array.from(permissions.entries()).map(([key, desc]) => ({
          key,
          description: desc
        }))
      });
    } catch (err: unknown) {
      logger.error('Error loading admin roles:', err);
      res.status(500).send('Error loading role management');
    }
  }

  /**
   * Update role permissions (admin only)
   */
  async adminUpdateRole(req: Request, res: Response) {
    try {
      const userManager = this.engine.getManager('UserManager');
      const currentUser = req.userContext;

      if (
        !currentUser ||
        !(await userManager.hasPermission(currentUser.username, 'admin:roles'))
      ) {
        return res
          .status(403)
          .json({ success: false, message: 'Access denied' });
      }

      const { roleName, permissions, displayName, description } = req.body;

      if (!roleName) {
        return res
          .status(400)
          .json({ success: false, message: 'Role name required' });
      }

      const success = await userManager.updateRolePermissions(roleName, {
        permissions: permissions || [],
        displayName: displayName || roleName,
        description: description || ''
      });

      if (success) {
        res.json({ success: true, message: 'Role updated successfully' });
      } else {
        res
          .status(400)
          .json({ success: false, message: 'Failed to update role' });
      }
    } catch (err: unknown) {
      logger.error('Error updating role:', err);
      res.status(500).json({ success: false, message: 'Error updating role' });
    }
  }

  /**
   * Create new role (admin only)
   */
  async adminCreateRole(req: Request, res: Response) {
    try {
      const userManager = this.engine.getManager('UserManager');
      const currentUser = req.userContext;

      if (
        !currentUser ||
        !(await userManager.hasPermission(currentUser.username, 'admin:roles'))
      ) {
        return res
          .status(403)
          .json({ success: false, message: 'Access denied' });
      }

      const { name, displayName, description, permissions } = req.body;

      if (!name) {
        return res
          .status(400)
          .json({ success: false, message: 'Role name required' });
      }

      const roleData = {
        name,
        displayName: displayName || name,
        description: description || '',
        permissions: Array.isArray(permissions) ? permissions : []
      };

      const role = await userManager.createRole(roleData);

      if (role) {
        res.json({ success: true, message: 'Role created successfully', role });
      } else {
        res
          .status(400)
          .json({ success: false, message: 'Failed to create role' });
      }
    } catch (err: unknown) {
      logger.error('Error creating role:', err);
      if (getErrorMessage(err) === 'Role already exists') {
        res
          .status(409)
          .json({ success: false, message: 'Role already exists' });
      } else {
        res
          .status(500)
          .json({ success: false, message: 'Error creating role' });
      }
    }
  }

  /**
   * Delete role (admin only)
   */
  async adminDeleteRole(req: Request, res: Response) {
    try {
      const userManager = this.engine.getManager('UserManager');
      const currentUser = req.userContext;

      if (
        !currentUser ||
        !(await userManager.hasPermission(currentUser.username, 'admin:roles'))
      ) {
        return res
          .status(403)
          .json({ success: false, message: 'Access denied' });
      }

      const { role } = req.params;

      if (!role) {
        return res
          .status(400)
          .json({ success: false, message: 'Role name required' });
      }

      await userManager.deleteRole(role);

      res.json({ success: true, message: 'Role deleted successfully' });
    } catch (err: unknown) {
      logger.error('Error deleting role:', err);
      if (getErrorMessage(err) === 'Role not found') {
        res.status(404).json({ success: false, message: 'Role not found' });
      } else if (getErrorMessage(err) === 'Cannot delete system role') {
        res
          .status(403)
          .json({ success: false, message: 'Cannot delete system role' });
      } else {
        res
          .status(500)
          .json({ success: false, message: 'Error deleting role' });
      }
    }
  }

  /**
   * Admin backup - Create and download full system backup
   */
  async adminBackup(req: Request, res: Response) {
    try {
      const userManager = this.engine.getManager('UserManager');
      const currentUser = req.userContext;

      // Check admin permission for system operations
      if (
        !currentUser ||
        !(await userManager.hasPermission(currentUser.username, 'admin:system'))
      ) {
        return await this.renderError(
          req,
          res,
          403,
          'Access Denied',
          'You do not have permission to create system backups'
        );
      }

      const backupManager = this.engine.getManager('BackupManager');
      if (!backupManager) {
        return await this.renderError(
          req,
          res,
          500,
          'Backup Unavailable',
          'BackupManager is not available'
        );
      }

      logger.debug(`📦 Admin backup requested by: ${currentUser.username}`);

      // Create backup
      const backupPath = await backupManager.backup();
      logger.debug(`✅ Backup created: ${backupPath}`);

      // Get backup file stats
      const fs = require('fs-extra');
      const stats = await fs.stat(backupPath);
      const filename = require('path').basename(backupPath);

      // Send backup file as download
      res.download(backupPath, filename, (err) => {
        if (err) {
          logger.error('Error downloading backup:', err);
          // Don't send response here as headers may already be sent
        } else {
          logger.debug(`✅ Backup downloaded by: ${currentUser.username}`);
        }
      });

    } catch (err: unknown) {
      logger.error('Error creating backup:', err);
      res.status(500).send('Error creating backup: ' + getErrorMessage(err));
    }
  }

  /**
   * Admin configuration management page
   */
  async adminConfiguration(req: Request, res: Response) {
    try {
      const userManager = this.engine.getManager('UserManager');
      const currentUser = req.userContext;

      if (
        !currentUser ||
        !(await userManager.hasPermission(currentUser.username, 'admin:system'))
      ) {
        return await this.renderError(
          req,
          res,
          403,
          'Access Denied',
          'You do not have permission to access configuration management'
        );
      }

      const configManager = this.engine.getManager('ConfigurationManager');
      const defaultProperties = configManager.getDefaultProperties();
      const customProperties = configManager.getCustomProperties();
      const mergedProperties = configManager.getAllProperties();

      const templateData = {
        title: 'Configuration Management',
        user: currentUser,
        message: req.query.success,
        error: req.query.error,
        defaultProperties,
        customProperties,
        mergedProperties,
        csrfToken: req.session.csrfToken
      };

      res.render('admin-configuration', templateData);
    } catch (err: unknown) {
      logger.error('Error loading admin configuration:', err);
      res.status(500).send('Error loading configuration management');
    }
  }

  /**
   * Update configuration property
   */
  async adminUpdateConfiguration(req: Request, res: Response) {
    try {
      const userManager = this.engine.getManager('UserManager');
      const currentUser = req.userContext;

      if (
        !currentUser ||
        !(await userManager.hasPermission(currentUser.username, 'admin:system'))
      ) {
        return res.status(403).json({ error: 'Admin access required' });
      }

      const configManager = this.engine.getManager('ConfigurationManager');
      const { property, value } = req.body;

      if (!property) {
        return res.status(400).json({ error: 'Property name is required' });
      }

      // Validate property name (must start with amdwiki.)
      if (!property.startsWith('amdwiki.') && !property.startsWith('log4j.')) {
        return res
          .status(400)
          .json({ error: 'Property must start with amdwiki. or log4j.' });
      }

      await configManager.setProperty(property, value);
      res.redirect(
        '/admin/configuration?success=Configuration updated successfully'
      );
    } catch (err: unknown) {
      logger.error('Error updating configuration:', err);
      res.redirect('/admin/configuration?error=Failed to update configuration');
    }
  }

  /**
   * Reset configuration to defaults
   */
  async adminResetConfiguration(req: Request, res: Response) {
    try {
      const userManager = this.engine.getManager('UserManager');
      const currentUser = req.userContext;

      if (
        !currentUser ||
        !(await userManager.hasPermission(currentUser.username, 'admin:system'))
      ) {
        return res.status(403).json({ error: 'Admin access required' });
      }

      const configManager = this.engine.getManager('ConfigurationManager');
      await configManager.resetToDefaults();
      res.redirect(
        '/admin/configuration?success=Configuration reset to defaults'
      );
    } catch (err: unknown) {
      logger.error('Error resetting configuration:', err);
      res.redirect('/admin/configuration?error=Failed to reset configuration');
    }
  }

  /**
   * Admin variable management page
   */
  async adminVariables(req: Request, res: Response) {
    try {
      const userManager = this.engine.getManager('UserManager');
      const currentUser = req.userContext;

      if (
        !currentUser ||
        !(await userManager.hasPermission(currentUser.username, 'admin:system'))
      ) {
        return await this.renderError(
          req,
          res,
          403,
          'Access Denied',
          'You do not have permission to access variable management'
        );
      }

      const variableManager = this.engine.getManager('VariableManager');
      if (!variableManager) {
        return await this.renderError(
          req,
          res,
          500,
          'Service Unavailable',
          'VariableManager not available'
        );
      }

      const debugInfo = variableManager.getDebugInfo();
      const commonData = await this.getCommonTemplateData(req);
      const leftMenuContent = await this.getLeftMenu();

      const templateData = {
        ...commonData,
        title: 'Variable Management',
        message: req.query.success,
        error: req.query.error,
        variableManager: variableManager,
        systemVariables: debugInfo.systemVariables,
        contextualVariables: debugInfo.contextualVariables,
        debugInfo: {
          systemVariables: debugInfo.systemVariables.length,
          contextualVariables: debugInfo.contextualVariables.length,
          totalVariables: debugInfo.totalVariables
        },
        leftMenu: leftMenuContent,
        csrfToken: req.session.csrfToken
      };

      res.render('admin-variables', templateData);
    } catch (err: unknown) {
      logger.error('Error loading admin variables:', err);
      res.status(500).send('Error loading variable management');
    }
  }

  /**
   * Test variable expansion
   */
  async adminTestVariables(req: Request, res: Response) {
    try {
      const userManager = this.engine.getManager('UserManager');
      const currentUser = req.userContext;

      if (
        !currentUser ||
        !(await userManager.hasPermission(currentUser.username, 'admin:system'))
      ) {
        return res.status(403).json({ error: 'Admin access required' });
      }

      const variableManager = this.engine.getManager('VariableManager');
      if (!variableManager) {
        return res.status(500).json({ error: 'VariableManager not available' });
      }

      const { content, pageName } = req.body;

      const context = {
        userContext: currentUser,
        pageName: pageName || 'Test Page'
      };

      const result = variableManager.expandVariables(content || '', context);

      // Redirect back with the result
      const debugInfo = variableManager.getDebugInfo();
      const templateData = {
        title: 'Variable Management',
        user: currentUser,
        message: 'Variable expansion test completed',
        testResult: result,
        variableManager: variableManager,
        systemVariables: debugInfo.systemVariables,
        contextualVariables: debugInfo.contextualVariables,
        debugInfo: {
          systemVariables: debugInfo.systemVariables.length,
          contextualVariables: debugInfo.contextualVariables.length,
          totalVariables: debugInfo.totalVariables
        },
        csrfToken: req.session.csrfToken
      };

      res.render('admin-variables', templateData);
    } catch (err: unknown) {
      logger.error('Error testing variables:', err);
      res.redirect('/admin/variables?error=Failed to test variables');
    }
  }

  /**
   * Admin settings page
   */
  async adminSettings(req: Request, res: Response) {
    try {
      const userManager = this.engine.getManager('UserManager');
      const currentUser = req.userContext;

      if (
        !currentUser ||
        !(await userManager.hasPermission(currentUser.username, 'admin:system'))
      ) {
        return await this.renderError(
          req,
          res,
          403,
          'Access Denied',
          'You do not have permission to access system settings'
        );
      }

      const commonData = await this.getCommonTemplateData(req);
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
    } catch (err: unknown) {
      logger.error('Error loading admin settings:', err);
      res.status(500).send('Error loading system settings');
    }
  }

  /**
   * Restart the system (PM2)
   */
  async adminRestart(req: Request, res: Response) {
    try {
      const userManager = this.engine.getManager('UserManager');
      const currentUser = req.userContext;

      if (
        !currentUser ||
        !(await userManager.hasPermission(currentUser.username, 'admin:system'))
      ) {
        return res.status(403).json({
          success: false,
          error: 'You do not have permission to restart the system'
        });
      }

      const { exec } = require('child_process');
      const logger = require('../utils/logger');

      logger.info(`System restart requested by: ${currentUser.username}`);

      // Execute pm2 restart command
      exec('pm2 restart amdWiki', (error, stdout, stderr) => {
        if (error) {
          logger.error(`Restart error: ${getErrorMessage(error)}`);
          return;
        }
        if (stderr) {
          logger.error(`Restart stderr: ${stderr}`);
        }
        logger.info(`Restart output: ${stdout}`);
      });

      // Send response immediately before restart
      res.json({
        success: true,
        message: 'System is restarting...'
      });
    } catch (err: unknown) {
      logger.error('Error restarting system:', err);
      res.status(500).json({
        success: false,
        error: 'Error restarting system'
      });
    }
  }

  /**
   * Admin reindex - Refresh page cache and rebuild search index
   */
  async adminReindex(req: Request, res: Response) {
    try {
      const userManager = this.engine.getManager('UserManager');
      const currentUser = req.userContext;

      if (
        !currentUser ||
        !(await userManager.hasPermission(currentUser.username, 'admin:system'))
      ) {
        return res.status(403).json({
          success: false,
          error: 'You do not have permission to reindex pages'
        });
      }

      const logger = require('../utils/logger');
      logger.info(`Page reindex requested by: ${currentUser.username}`);

      const pageManager = this.engine.getManager('PageManager');
      const searchManager = this.engine.getManager('SearchManager');
      const renderingManager = this.engine.getManager('RenderingManager');
      const cacheManager = this.engine.getManager('CacheManager');

      // Refresh page list (reload from disk)
      await pageManager.refreshPageList();
      const pageCount = (await pageManager.getAllPages()).length;

      // Rebuild search index
      await searchManager.rebuildIndex();
      const searchStats = await searchManager.getStatistics();

      // Rebuild link graph
      await renderingManager.rebuildLinkGraph();

      // Clear rendered page cache
      await cacheManager.clear('rendered-pages');

      logger.info(`Reindex complete: ${pageCount} pages, ${searchStats.totalDocuments || 0} search documents`);

      res.json({
        success: true,
        message: 'Pages reindexed successfully',
        stats: {
          pageCount: pageCount,
          searchDocuments: searchStats.totalDocuments || 0,
          timestamp: new Date().toISOString()
        }
      });
    } catch (err: unknown) {
      logger.error('Error reindexing pages:', err);
      res.status(500).json({
        success: false,
        error: getErrorMessage(err) || 'Error reindexing pages'
      });
    }
  }

  /**
   * Admin logs page
   */
  async adminLogs(req: Request, res: Response) {
    try {
      const userManager = this.engine.getManager('UserManager');
      const currentUser = req.userContext;

      if (
        !currentUser ||
        !(await userManager.hasPermission(currentUser.username, 'admin:system'))
      ) {
        return await this.renderError(
          req,
          res,
          403,
          'Access Denied',
          'You do not have permission to access system logs'
        );
      }

      const commonData = await this.getCommonTemplateData(req);
      const fs = require('fs-extra');
      const path = require('path');

      // Read recent logs from configured directory
      const configManager = this.engine.getManager('ConfigurationManager');
      const logDir = configManager.getProperty('amdwiki.logging.dir');
      let logContent = '';
      let logFiles = [];

      try {
        if (await fs.pathExists(logDir)) {
          logFiles = await fs.readdir(logDir);
          logFiles = logFiles.filter(f => f.endsWith('.log')).sort().reverse();

          if (logFiles.length > 0) {
            const latestLog = path.join(logDir, logFiles[0]);
            const content = await fs.readFile(latestLog, 'utf8');
            // Get last 100 lines
            const lines = content.split('\n');
            logContent = lines.slice(-100).join('\n');
          }
        }
      } catch (err: unknown) {
        logger.error('Error reading logs:', err);
        logContent = 'Error reading log files';
      }

      res.render('admin-logs', {
        ...commonData,
        title: 'System Logs',
        logFiles,
        logContent,
        csrfToken: req.session.csrfToken
      });
    } catch (err: unknown) {
      logger.error('Error loading admin logs:', err);
      res.status(500).send('Error loading system logs');
    }
  }

  /**
   * Get raw page source (markdown content) for viewing/copying
   */
  async getPageSource(req: Request, res: Response) {
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
    } catch (error: unknown) {
      logger.error('Error retrieving page source:', error);
      res.status(500).send('Error retrieving page source');
    }
  }

  // ============================================================================
  // Admin Organization Management Route Handlers
  // ============================================================================

  /**
   * Admin Organizations Management Page
   */
  async adminOrganizations(req: Request, res: Response) {
    try {
      const userManager = this.engine.getManager('UserManager');
      const currentUser = req.userContext;

      if (
        !currentUser ||
        !(await userManager.hasPermission(currentUser.username, 'admin:system'))
      ) {
        return await this.renderError(
          req,
          res,
          403,
          'Access Denied',
          'Admin access required'
        );
      }

      const templateData = await this.getCommonTemplateData(req);

      // Try to get SchemaManager, fallback gracefully
      let organizations = [];
      try {
        const schemaManager = this.engine.getManager('SchemaManager');
        organizations = schemaManager.getOrganizations();
      } catch (err: unknown) {
        logger.warn('SchemaManager not available:', getErrorMessage(err));
        // Create default organization from ConfigurationManager
        const configManager = this.engine.getManager('ConfigurationManager');
        organizations = [
          {
            '@context': 'https://schema.org',
            '@type': 'Organization',
            identifier: 'amdwiki-platform',
            name: configManager.getProperty('amdwiki.applicationName', 'amdWiki Platform'),
            description:
              'Digital platform for wiki, document management, and modular content systems'
          }
        ];
      }

      templateData.organizations = organizations;
      templateData.pageTitle = 'Organization Management';
      templateData.success = req.query.success;
      templateData.error = req.query.error;

      res.render('admin-organizations', templateData);
    } catch (error: unknown) {
      logger.error('Error loading admin organizations page:', error);
      await this.renderError(
        req,
        res,
        500,
        'Server Error',
        'Failed to load organizations management'
      );
    }
  }

  /**
   * Create New Organization
   */
  async adminCreateOrganization(req: Request, res: Response) {
    try {
      const userManager = this.engine.getManager('UserManager');
      const userContext = req.userContext;
      if (!userContext?.isAuthenticated || !userContext?.isAdmin) {
        return res.status(403).json({ error: 'Admin access required' });
      }

      const schemaManager = this.engine.getManager('SchemaManager');
      const organizationData = req.body;

      // Validate and create organization
      const newOrganization = await schemaManager.createOrganization(
        organizationData
      );

      if (req.headers.accept?.includes('application/json')) {
        res.json({ success: true, organization: newOrganization });
      } else {
        res.redirect(
          '/admin/organizations?success=Organization created successfully'
        );
      }
    } catch (error: unknown) {
      logger.error('Error creating organization:', error);
      if (req.headers.accept?.includes('application/json')) {
        res.status(500).json({ error: getErrorMessage(error) });
      } else {
        res.redirect(
          '/admin/organizations?error=' + encodeURIComponent(getErrorMessage(error))
        );
      }
    }
  }

  /**
   * Update Existing Organization
   */
  async adminUpdateOrganization(req: Request, res: Response) {
    try {
      const userManager = this.engine.getManager('UserManager');
      const userContext = req.userContext;
      if (!userContext?.isAuthenticated || !userContext?.isAdmin) {
        return res.status(403).json({ error: 'Admin access required' });
      }

      const schemaManager = this.engine.getManager('SchemaManager');
      const identifier = req.params.identifier;
      const organizationData = req.body;

      // Update organization
      const updatedOrganization = await schemaManager.updateOrganization(
        identifier,
        organizationData
      );

      if (req.headers.accept?.includes('application/json')) {
        res.json({ success: true, organization: updatedOrganization });
      } else {
        res.redirect(
          '/admin/organizations?success=Organization updated successfully'
        );
      }
    } catch (error: unknown) {
      logger.error('Error updating organization:', error);
      if (req.headers.accept?.includes('application/json')) {
        res.status(500).json({ error: getErrorMessage(error) });
      } else {
        res.redirect(
          '/admin/organizations?error=' + encodeURIComponent(getErrorMessage(error))
        );
      }
    }
  }

  /**
   * Delete Organization
   */
  async adminDeleteOrganization(req: Request, res: Response) {
    try {
      const userManager = this.engine.getManager('UserManager');
      const userContext = req.userContext;
      if (!userContext?.isAuthenticated || !userContext?.isAdmin) {
        return res.status(403).json({ error: 'Admin access required' });
      }

      const schemaManager = this.engine.getManager('SchemaManager');
      const identifier = req.params.identifier;

      // Delete organization
      await schemaManager.deleteOrganization(identifier);

      if (req.headers.accept?.includes('application/json')) {
        res.json({ success: true });
      } else {
        res.redirect(
          '/admin/organizations?success=Organization deleted successfully'
        );
      }
    } catch (error: unknown) {
      logger.error('Error deleting organization:', error);
      if (req.headers.accept?.includes('application/json')) {
        res.status(500).json({ error: getErrorMessage(error) });
      } else {
        res.redirect(
          '/admin/organizations?error=' + encodeURIComponent(getErrorMessage(error))
        );
      }
    }
  }

  /**
   * Get Single Organization (API endpoint)
   */
  async adminGetOrganization(req: Request, res: Response) {
    try {
      const userManager = this.engine.getManager('UserManager');
      const userContext = req.userContext;
      if (!userContext?.isAuthenticated || !userContext?.isAdmin) {
        return res.status(403).json({ error: 'Admin access required' });
      }

      const schemaManager = this.engine.getManager('SchemaManager');
      const identifier = req.params.identifier;
      const organization = await schemaManager.getOrganization(identifier);

      if (!organization) {
        return res.status(404).json({ error: 'Organization not found' });
      }

      res.json(organization);
    } catch (error: unknown) {
      logger.error('Error getting organization:', error);
      res.status(500).json({ error: getErrorMessage(error) });
    }
  }

  /**
   * Admin route to validate all files and check for naming convention compliance
   */
  async adminValidateFiles(req: Request, res: Response) {
    try {
      const userManager = this.engine.getManager('UserManager');
      const userContext = await userManager.getCurrentUser(req);

      if (!userContext?.isAuthenticated || !userContext?.isAdmin) {
        return await this.renderError(
          req,
          res,
          403,
          'Access Denied',
          'Admin access required'
        );
      }

      const pageManager = this.engine.getManager('PageManager');
      const dryRun = req.query.dryRun === 'true';

      // Run validation
      const report = await pageManager.validateAndFixAllFiles({ dryRun });

      // Render validation report
      const templateData = await this.getCommonTemplateData(userContext);
      templateData.title = 'File Validation Report';
      templateData.report = report;
      templateData.dryRun = dryRun;

      res.render('admin-validation-report', templateData);
    } catch (err: unknown) {
      logger.error('Error validating files:', err);
      await this.renderError(req, res, 500, 'Validation Error', getErrorMessage(err));
    }
  }

  /**
   * Admin API route to fix all non-compliant files
   */
  async adminFixFiles(req: Request, res: Response) {
    try {
      const userManager = this.engine.getManager('UserManager');
      const userContext = await userManager.getCurrentUser(req);

      if (!userContext?.isAuthenticated || !userContext?.isAdmin) {
        return res.status(403).json({ error: 'Admin access required' });
      }

      const pageManager = this.engine.getManager('PageManager');

      // Run fixes (not dry run)
      const report = await pageManager.validateAndFixAllFiles({
        dryRun: false
      });

      res.json({
        success: true,
        message: `Fixed ${report.fixedFiles} files out of ${report.invalidFiles} invalid files`,
        report
      });
    } catch (err: unknown) {
      logger.error('Error fixing files:', err);
      res.status(500).json({
        success: false,
        error: getErrorMessage(err)
      });
    }
  }

  /**
   * Get Organization Schema.org JSON-LD (API endpoint)
   */
  async adminGetOrganizationSchema(req: Request, res: Response) {
    try {
      const userManager = this.engine.getManager('UserManager');
      const currentUser = req.userContext;
      if (
        !currentUser ||
        !(await userManager.hasPermission(currentUser.username, 'admin:system'))
      ) {
        return res.status(403).json({ error: 'Admin access required' });
      }

      const schemaManager = this.engine.getManager('SchemaManager');
      const identifier = req.params.identifier;
      const organization = await schemaManager.getOrganization(identifier);

      if (!organization) {
        return res.status(404).json({ error: 'Organization not found' });
      }

      // Generate Schema.org JSON-LD using SchemaGenerator
      const schema = SchemaGenerator.generateOrganizationSchema(organization, {
        baseUrl: `${req.protocol}://${req.get('host')}`
      });

      res.json(schema);
    } catch (error: unknown) {
      logger.error('Error getting organization schema:', error);
      res.status(500).json({ error: getErrorMessage(error) });
    }
  }

  /**
   * Get Schema.org Person schema for a user
   */
  async adminGetPersonSchema(req: Request, res: Response) {
    try {
      const userManager = this.engine.getManager('UserManager');
      const currentUser = req.userContext;
      if (
        !currentUser ||
        !(await userManager.hasPermission(currentUser.username, 'admin:system'))
      ) {
        return res.status(403).json({ error: 'Admin access required' });
      }

      const schemaManager = this.engine.getManager('SchemaManager');
      const identifier = req.params.identifier;
      const person = await schemaManager.getPerson(identifier);

      if (!person) {
        return res.status(404).json({ error: 'Person not found' });
      }

      // Generate Schema.org JSON-LD using SchemaGenerator
      const schema = SchemaGenerator.generatePersonSchema(person, {
        baseUrl: `${req.protocol}://${req.get('host')}`
      });

      res.json(schema);
    } catch (error: unknown) {
      logger.error('Error getting person schema:', error);
      res.status(500).json({ error: getErrorMessage(error) });
    }
  }

  /**
   * Register all routes with the Express app
   * @param {Express} app - Express application instance
   */
  registerRoutes(app) {
    // API routes first to prevent conflicts
    logger.debug('ROUTES DEBUG: Registering /api/preview route');
    app.post('/api/preview', (req: Request, res: Response) => this.previewPage(req, res));
    logger.debug('ROUTES DEBUG: Registering /api/test route');
    app.get('/api/test', (req: Request, res: Response) => res.json({ message: 'API working!' }));
    logger.debug('ROUTES DEBUG: Registering /api/page-metadata/:page route');
    app.get('/api/page-metadata/:page', (req: Request, res: Response) =>
      this.getPageMetadata(req, res)
    );
    logger.debug('ROUTES DEBUG: Registering /api/page-source/:page route');
    app.get('/api/page-source/:page', (req: Request, res: Response) =>
      this.getPageSource(req, res)
    );
    logger.debug('ROUTES DEBUG: Registering /api/page-suggestions route');
    app.get('/api/page-suggestions', (req: Request, res: Response) =>
      this.getPageSuggestions(req, res)
    );

    // Version management API routes (Phase 6)
    logger.debug('ROUTES DEBUG: Registering version management API routes');
    app.get('/api/page/:identifier/versions', (req: Request, res: Response) =>
      this.getPageVersions(req, res)
    );
    app.get('/api/page/:identifier/version/:version', (req: Request, res: Response) =>
      this.getPageVersion(req, res)
    );
    app.get('/api/page/:identifier/compare/:v1/:v2', (req: Request, res: Response) =>
      this.comparePageVersions(req, res)
    );
    app.post('/api/page/:identifier/restore/:version', (req: Request, res: Response) =>
      this.restorePageVersion(req, res)
    );

    // Public routes
    app.get('/', (req: Request, res: Response) => this.homePage(req, res));
    app.get('/wiki/:page', (req: Request, res: Response) => this.viewPage(req, res));
    app.post('/wiki/:page', (req: Request, res: Response) => this.createWikiPage(req, res));
    app.get('/edit/:page', (req: Request, res: Response) => this.editPage(req, res));
    app.post('/save/:page', (req: Request, res: Response) => this.savePage(req, res));
    app.get('/create', (req: Request, res: Response) => this.createPage(req, res));
    app.post('/create', (req: Request, res: Response) => this.createPageFromTemplate(req, res));
    app.post('/delete/:page', (req: Request, res: Response) => this.deletePage(req, res));
    app.get('/search', (req: Request, res: Response) => this.searchPages(req, res));
    app.get('/login', (req: Request, res: Response) => this.loginPage(req, res));
    app.post('/login', (req: Request, res: Response) => this.processLogin(req, res));
    app.get('/logout', (req: Request, res: Response) => this.processLogout(req, res));
    app.post('/logout', (req: Request, res: Response) => this.processLogout(req, res));
    app.get('/register', (req: Request, res: Response) => this.registerPage(req, res));
    app.post('/register', (req: Request, res: Response) => this.processRegister(req, res));
    app.get('/profile', (req: Request, res: Response) => this.profilePage(req, res));
    app.post('/profile', (req: Request, res: Response) => this.updateProfile(req, res));
    app.post('/preferences', (req: Request, res: Response) => this.updatePreferences(req, res));
    app.get('/user-info', (req: Request, res: Response) => this.userInfo(req, res));
    app.get('/export', (req: Request, res: Response) => this.exportPage(req, res));
    app.post('/export/html/:page', (req: Request, res: Response) => this.exportPageHtml(req, res));
    app.post('/export/markdown/:page', (req: Request, res: Response) => this.exportPageMarkdown(req, res));
    app.get('/exports', (req: Request, res: Response) => this.listExports(req, res));
    app.get('/download/:filename', (req: Request, res: Response) => this.downloadExport(req, res));
    app.delete('/deleteExport/:filename', (req: Request, res: Response) => this.deleteExport(req, res));

    // Version management view routes (Phase 6)
    app.get('/history/:page', (req: Request, res: Response) => this.pageHistory(req, res));
    app.get('/diff/:page', (req: Request, res: Response) => this.pageDiff(req, res));

    // Admin routes
    app.get('/admin', (req: Request, res: Response) => this.adminDashboard(req, res));
    app.get('/admin/backup', (req: Request, res: Response) => this.adminBackup(req, res));
    app.get('/admin/configuration', (req: Request, res: Response) =>
      this.adminConfiguration(req, res)
    );
    app.post('/admin/configuration', (req: Request, res: Response) =>
      this.adminUpdateConfiguration(req, res)
    );
    app.post('/admin/configuration/reset', (req: Request, res: Response) =>
      this.adminResetConfiguration(req, res)
    );
    app.get('/admin/variables', (req: Request, res: Response) => this.adminVariables(req, res));
    app.post('/admin/variables/test', (req: Request, res: Response) =>
      this.adminTestVariables(req, res)
    );
    app.post('/admin/maintenance/toggle', (req: Request, res: Response) =>
      this.adminToggleMaintenance(req, res)
    );
    app.get('/admin/users', (req: Request, res: Response) => this.adminUsers(req, res));
    app.post('/admin/users', (req: Request, res: Response) => this.adminCreateUser(req, res));
    app.put('/admin/users/:username', (req: Request, res: Response) =>
      this.adminUpdateUser(req, res)
    );
    app.delete('/admin/users/:username', (req: Request, res: Response) =>
      this.adminDeleteUser(req, res)
    );
    app.get('/admin/roles', (req: Request, res: Response) => this.adminRoles(req, res));
    app.post('/admin/roles', (req: Request, res: Response) => this.adminCreateRole(req, res));
    app.put('/admin/roles/:role', (req: Request, res: Response) => this.adminUpdateRole(req, res));
    app.delete('/admin/roles/:role', (req: Request, res: Response) =>
      this.adminDeleteRole(req, res)
    );
    app.get('/admin/settings', (req: Request, res: Response) => this.adminSettings(req, res));
    app.get('/admin/logs', (req: Request, res: Response) => this.adminLogs(req, res));
    app.post('/admin/restart', (req: Request, res: Response) => this.adminRestart(req, res));
    app.post('/admin/reindex', (req: Request, res: Response) => this.adminReindex(req, res));

    // Image upload route with error handling
    app.post('/images/upload', (req, res) => {
      imageUpload.single('image')(req, res, (err) => {
        if (err) {
          // Multer error handling
          if (err instanceof multer.MulterError) {
            if (err.code === 'LIMIT_FILE_SIZE') {
              return res.status(400).json({
                success: false,
                error: 'File size exceeds 10MB limit'
              });
            }
            return res.status(400).json({
              success: false,
              error: getErrorMessage(err)
            });
          }
          // Other errors (e.g., file type validation)
          return res.status(400).json({
            success: false,
            error: getErrorMessage(err)
          });
        }
        // No error, proceed to handler
        void this.uploadImage(req, res);
      });
    });

    // Attachment routes
    app.post('/attachments/upload/:page', (req, res) => {
      attachmentUpload.single('file')(req, res, (err) => {
        if (err) {
          if (err instanceof multer.MulterError) {
            if (err.code === 'LIMIT_FILE_SIZE') {
              return res.status(400).json({
                success: false,
                error: 'File size exceeds limit'
              });
            }
            return res.status(400).json({
              success: false,
              error: getErrorMessage(err)
            });
          }
          return res.status(400).json({
            success: false,
            error: getErrorMessage(err)
          });
        }
        void this.uploadAttachment(req, res);
      });
    });

    app.get('/attachments/:attachmentId', (req: Request, res: Response) =>
      this.serveAttachment(req, res)
    );

    app.delete('/attachments/:attachmentId', (req: Request, res: Response) =>
      this.deleteAttachment(req, res)
    );

    // Notification management routes
    app.post('/admin/notifications/:id/dismiss', (req: Request, res: Response) =>
      this.adminDismissNotification(req, res)
    );
    app.post('/admin/notifications/clear-all', (req: Request, res: Response) =>
      this.adminClearAllNotifications(req, res)
    );
    app.get('/admin/notifications', (req: Request, res: Response) =>
      this.adminNotifications(req, res)
    );

    // Cache management routes
    app.get('/api/admin/cache/stats', (req: Request, res: Response) =>
      this.adminCacheStats(req, res)
    );
    app.post('/api/admin/cache/clear', (req: Request, res: Response) =>
      this.adminClearCache(req, res)
    );
    app.post('/api/admin/cache/clear/:region', (req: Request, res: Response) =>
      this.adminClearCacheRegion(req, res)
    );

    // Admin Schema.org Organization Management Routes
    app.get('/admin/organizations', this.adminOrganizations.bind(this));
    app.post('/admin/organizations', this.adminCreateOrganization.bind(this));
    app.put(
      '/admin/organizations/:identifier',
      this.adminUpdateOrganization.bind(this)
    );
    app.delete(
      '/admin/organizations/:identifier',
      this.adminDeleteOrganization.bind(this)
    );
    app.get(
      '/admin/organizations/:identifier',
      this.adminGetOrganization.bind(this)
    );
    app.get(
      '/admin/organizations/:identifier/schema',
      this.adminGetOrganizationSchema.bind(this)
    );

    app.get('/api/session-count', (req, res) => {
      this.getActiveSesssionCount(req, res);
    });
    // Schema.org routes
    app.get('/schema/person/:identifier', (req: Request, res: Response) =>
      this.adminGetPersonSchema(req, res)
    );
    app.get('/schema/organization/:identifier', (req: Request, res: Response) =>
      this.adminGetOrganizationSchema(req, res)
    );
  }

  /**
   * Dismiss a notification (admin only)
   */
  async adminDismissNotification(req: Request, res: Response) {
    try {
      const userManager = this.engine.getManager('UserManager');
      const currentUser = req.userContext;

      if (
        !currentUser ||
        !(await userManager.hasPermission(currentUser.username, 'admin:system'))
      ) {
        return res.status(403).send('Access denied');
      }

      const notificationId = req.params.id;
      const notificationManager = this.engine.getManager('NotificationManager');

      const success = await notificationManager.dismissNotification(
        notificationId,
        currentUser.username
      );

      if (success) {
        res.redirect('/admin?success=Notification dismissed successfully');
      } else {
        res.redirect(
          '/admin?error=Notification not found or already dismissed'
        );
      }
    } catch (err: unknown) {
      logger.error('Error dismissing notification:', err);
      res.redirect('/admin?error=Failed to dismiss notification');
    }
  }

  /**
   * Clear all notifications (admin only)
   */
  async adminClearAllNotifications(req: Request, res: Response) {
    try {
      const userManager = this.engine.getManager('UserManager');
      const currentUser = req.userContext;

      if (
        !currentUser ||
        !(await userManager.hasPermission(currentUser.username, 'admin:system'))
      ) {
        return res.status(403).send('Access denied');
      }

      const notificationManager = this.engine.getManager('NotificationManager');

      // Delete all active notifications from the system
      const clearedCount = await notificationManager.clearAllActive();

      res.redirect(
        `/admin?success=Cleared ${clearedCount} notifications successfully`
      );
    } catch (err: unknown) {
      logger.error('Error clearing notifications:', err);
      res.redirect('/admin?error=Failed to clear notifications');
    }
  }

  /**
   * Notification management page (admin only)
   */
  async adminNotifications(req: Request, res: Response) {
    try {
      const userManager = this.engine.getManager('UserManager');
      const currentUser = req.userContext;

      if (
        !currentUser ||
        !(await userManager.hasPermission(currentUser.username, 'admin:system'))
      ) {
        return await this.renderError(
          req,
          res,
          403,
          'Access Denied',
          'You do not have permission to manage notifications'
        );
      }

      const commonData = await this.getCommonTemplateData(req);
      const notificationManager = this.engine.getManager('NotificationManager');

      // Get all notifications with expired ones for management
      const allNotifications = notificationManager.getAllNotifications(true);
      const activeNotifications =
        notificationManager.getAllNotifications(false);
      const expiredNotifications = allNotifications.filter(
        (n) => n.expiresAt && n.expiresAt < new Date()
      );

      // Get notification statistics
      const stats = notificationManager.getStats();

      res.render('admin-notifications', {
        ...commonData,
        title: 'Notification Management',
        allNotifications: allNotifications,
        activeNotifications: activeNotifications,
        expiredNotifications: expiredNotifications,
        stats: stats,
        csrfToken: req.session.csrfToken,
        successMessage: req.query.success || null,
        errorMessage: req.query.error || null
      });
    } catch (err: unknown) {
      logger.error('Error loading notification management:', err);
      res.status(500).send('Error loading notification management');
    }
  }

  // ============================================================================
  // Admin Cache Route Handlers
  // ============================================================================

  /**
   * Admin cache statistics API endpoint
   */
  async adminCacheStats(req: Request, res: Response) {
    try {
      const userManager = this.engine.getManager('UserManager');
      const currentUser = req.userContext;

      if (
        !currentUser ||
        !(await userManager.hasPermission(currentUser.username, 'admin:system'))
      ) {
        return res.status(403).json({ error: 'Access denied' });
      }

      const cacheManager = this.engine.getManager('CacheManager');
      if (!cacheManager || !cacheManager.isInitialized()) {
        return res.status(503).json({ error: 'CacheManager not available' });
      }

      const stats = await cacheManager.stats();
      res.json(stats);
    } catch (err: unknown) {
      logger.error('Error getting cache stats:', err);
      res.status(500).json({ error: 'Failed to get cache statistics' });
    }
  }

  /**
   * Admin clear all cache API endpoint
   */
  async adminClearCache(req: Request, res: Response) {
    try {
      const userManager = this.engine.getManager('UserManager');
      const currentUser = req.userContext;

      if (
        !currentUser ||
        !(await userManager.hasPermission(currentUser.username, 'admin:system'))
      ) {
        return res.status(403).json({ error: 'Access denied' });
      }

      const cacheManager = this.engine.getManager('CacheManager');
      if (!cacheManager || !cacheManager.isInitialized()) {
        return res.status(503).json({ error: 'CacheManager not available' });
      }

      await cacheManager.clear();
      logger.debug(`Cache cleared by admin user: ${currentUser.username}`);

      res.json({
        success: true,
        message: 'All caches cleared successfully',
        timestamp: new Date().toISOString(),
        user: currentUser.username
      });
    } catch (err: unknown) {
      logger.error('Error clearing cache:', err);
      res.status(500).json({ error: 'Failed to clear cache' });
    }
  }

  /**
   * Admin clear cache region API endpoint
   */
  async adminClearCacheRegion(req: Request, res: Response) {
    try {
      const userManager = this.engine.getManager('UserManager');
      const currentUser = req.userContext;

      if (
        !currentUser ||
        !(await userManager.hasPermission(currentUser.username, 'admin:system'))
      ) {
        return res.status(403).json({ error: 'Access denied' });
      }

      const cacheManager = this.engine.getManager('CacheManager');
      if (!cacheManager || !cacheManager.isInitialized()) {
        return res.status(503).json({ error: 'CacheManager not available' });
      }

      const region = req.params.region;
      if (!region) {
        return res.status(400).json({ error: 'Region parameter required' });
      }

      await cacheManager.clear(region);
      logger.debug(
        `Cache region '${region}' cleared by admin user: ${currentUser.username}`
      );

      res.json({
        success: true,
        message: `Cache region '${region}' cleared successfully`,
        region: region,
        timestamp: new Date().toISOString(),
        user: currentUser.username
      });
    } catch (err: unknown) {
      logger.error(`Error clearing cache region '${req.params.region}':`, err);
      res.status(500).json({ error: 'Failed to clear cache region' });
    }
  }

  // ============================================================================
  // Admin Audit Route Handlers
  // ============================================================================

  /**
   * Admin audit logs page
   */
  async adminAuditLogs(req: Request, res: Response) {
    try {
      const userManager = this.engine.getManager('UserManager');
      const currentUser = await userManager.getCurrentUser(req);

      if (
        !currentUser ||
        !(await userManager.hasPermission(currentUser.username, 'admin:system'))
      ) {
        return await this.renderError(
          req,
          res,
          403,
          'Access Denied',
          'You do not have permission to view audit logs.'
        );
      }

      const aclManager = this.engine.getManager('ACLManager');
      const auditStats = aclManager.getAccessControlStats();

      const templateData = await this.getCommonTemplateData(currentUser);
      res.render('admin-audit', {
        ...templateData,
        auditStats,
        title: 'Audit Logs - Admin',
        currentUser
      });
    } catch (err: unknown) {
      logger.error('Error loading audit logs:', err);
      res.status(500).send('Error loading audit logs');
    }
  }

  /**
   * API endpoint for audit logs data
   */
  async adminAuditLogsApi(req: Request, res: Response) {
    try {
      const userManager = this.engine.getManager('UserManager');
      const currentUser = await userManager.getCurrentUser(req);

      if (
        !currentUser ||
        !(await userManager.hasPermission(currentUser.username, 'admin:system'))
      ) {
        return res.status(403).json({ error: 'Access denied' });
      }

      const aclManager = this.engine.getManager('ACLManager');

      // Parse query parameters
      const filters = {
        user: req.query.user || null,
        action: req.query.action || null,
        decision:
          req.query.decision !== undefined
            ? req.query.decision === 'true'
            : null,
        pageName: req.query.pageName || null
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
        offset: offset
      });
    } catch (err: unknown) {
      logger.error('Error retrieving audit logs:', err);
      res.status(500).json({ error: 'Error retrieving audit logs' });
    }
  }

  /**
   * API endpoint for individual audit log details
   */
  async adminAuditLogDetails(req: Request, res: Response) {
    try {
      const userManager = this.engine.getManager('UserManager');
      const currentUser = await userManager.getCurrentUser(req);

      if (
        !currentUser ||
        !(await userManager.hasPermission(currentUser.username, 'admin:system'))
      ) {
        return res.status(403).json({ error: 'Access denied' });
      }

      const aclManager = this.engine.getManager('ACLManager');
      const logId = req.params.id;

      // Get all audit logs and find the specific one
      const allLogs = aclManager.getAccessLog(10000); // Get a large number to find the specific log
      const logDetails = allLogs.find((log) => log.timestamp === logId);

      if (!logDetails) {
        return res.status(404).json({ error: 'Audit log not found' });
      }

      res.json(logDetails);
    } catch (err: unknown) {
      logger.error('Error retrieving audit log details:', err);
      res.status(500).json({ error: 'Error retrieving audit log details' });
    }
  }

  /**
   * Export audit logs
   */
  async adminAuditExport(req: Request, res: Response) {
    try {
      const userManager = this.engine.getManager('UserManager');
      const currentUser = await userManager.getCurrentUser(req);

      if (
        !currentUser ||
        !(await userManager.hasPermission(currentUser.username, 'admin:system'))
      ) {
        return res.status(403).send('Access denied');
      }

      const aclManager = this.engine.getManager('ACLManager');

      // Parse query parameters
      const filters = {
        user: req.query.user || null,
        action: req.query.action || null,
        decision:
          req.query.decision !== undefined
            ? req.query.decision === 'true'
            : null,
        pageName: req.query.pageName || null
      };

      const format = req.query.format || 'json';

      // Get filtered logs for export
      const exportData = aclManager.getAccessLog(10000, filters); // Get all matching logs

      if (format === 'json') {
        res.setHeader('Content-Type', 'application/json');
        res.setHeader(
          'Content-Disposition',
          'attachment; filename="audit-logs.json"'
        );
        res.send(JSON.stringify(exportData, null, 2));
      } else if (format === 'csv') {
        // Convert to CSV format
        const csvHeaders = [
          'timestamp',
          'user',
          'pageName',
          'action',
          'decision',
          'reason',
          'ip',
          'userAgent'
        ];
        const csvRows = exportData.map((log) => [
          log.timestamp,
          log.user,
          log.pageName,
          log.action,
          log.decision,
          log.reason,
          log.context?.ip || '',
          log.context?.userAgent || ''
        ]);

        const csvContent = [csvHeaders, ...csvRows]
          .map((row) => row.map((field) => `"${field}"`).join(','))
          .join('\n');

        res.setHeader('Content-Type', 'text/csv');
        res.setHeader(
          'Content-Disposition',
          'attachment; filename="audit-logs.csv"'
        );
        res.send(csvContent);
      } else {
        res.status(400).send('Invalid format. Supported formats: json, csv');
      }
    } catch (err: unknown) {
      logger.error('Error exporting audit logs:', err);
      res.status(500).send('Error exporting audit logs');
    }
  }

  /**
   * Get page metadata in a user-friendly format
   */
  async getPageMetadata(req: Request, res: Response) {
    logger.debug('🔍 getPageMetadata called for page:', req.params.page);
    try {
      const pageName = decodeURIComponent(req.params.page);
      const pageManager = this.engine.getManager('PageManager');

      const page = await pageManager.getPage(pageName);
      if (!page) {
        return res.status(404).json({ error: 'Page not found' });
      }

      // Extract metadata from the page (getPage returns 'metadata', not 'frontMatter')
      const metadata = page.metadata || {};
      const content = page.content || '';

      // Calculate content statistics
      const wordCount = content
        .replace(/[^\w\s]/g, '')
        .split(/\s+/)
        .filter((word) => word.length > 0).length;
      const characterCount = content.length;
      const lineCount = content.split('\n').length;

      // Get file stats if available
      const fs = require('fs-extra');
      const path = require('path');
      let fileStats = null;

      try {
        const filePath = path.join(process.cwd(), 'pages', `${page.uuid}.md`);
        const stats = await fs.stat(filePath);
        fileStats = {
          size: stats.size,
          created: stats.birthtime,
          modified: stats.mtime,
          accessed: stats.atime
        };
      } catch (error: unknown) {
        // File stats not available
      }

      // Get filesystem filename from page.filePath (path is already imported at top of file)
      const filesystemName = page.filePath ? path.basename(page.filePath) : null;

      // Get version information if versioning is enabled
      let versionInfo = null;
      try {
        const provider = pageManager.provider;
        if (typeof provider.getVersionHistory === 'function') {
          const versions = await provider.getVersionHistory(pageName);
          if (versions && versions.length > 0) {
            const currentVersion = versions[0]; // Most recent version is first
            versionInfo = {
              currentVersion: currentVersion.version,
              totalVersions: versions.length,
              lastAuthor: currentVersion.author,
              lastModified: currentVersion.dateCreated,
              changeType: currentVersion.changeType,
              comment: currentVersion.comment
            };
          }
        }
      } catch (error: unknown) {
        // Versioning not available or failed - continue without it
        logger.debug('Version info not available:', getErrorMessage(error));
      }

      // Format the metadata for user-friendly display
      const formattedMetadata = {
        // Basic page info
        title: metadata.title || pageName,
        slug: metadata.slug || pageName,
        uuid: metadata.uuid || page.uuid,
        filesystemName: filesystemName,

        // Categorization and tags
        category: metadata['system-category'] || metadata.category || 'general',
        keywords: Array.isArray(metadata['user-keywords'])
          ? metadata['user-keywords']
          : metadata.keywords
            ? metadata.keywords.split(',').map((k) => k.trim())
            : [],
        tags: metadata.tags || [],

        // Timestamps
        created: fileStats?.created || null,
        lastModified: versionInfo?.lastModified || metadata.lastModified || fileStats?.modified || null,
        lastAccessed: fileStats?.accessed || null,

        // Content statistics
        stats: {
          wordCount: wordCount,
          characterCount: characterCount,
          lineCount: lineCount,
          fileSize: fileStats?.size || null
        },

        // Additional metadata - enhanced with version info
        author: versionInfo?.lastAuthor || metadata.author || null,
        description: metadata.description || null,
        version: versionInfo ? `v${versionInfo.currentVersion} of ${versionInfo.totalVersions}` : metadata.version || null,
        versionInfo: versionInfo, // Include full version info for advanced use
        status: metadata.status || 'published',

        // Schema.org data if present
        schemaType: metadata.schemaType || null,
        schemaData: metadata.schemaData || null,

        // Custom metadata
        custom: {}
      };

      // Add any custom metadata fields not already handled
      for (const [key, value] of Object.entries(metadata)) {
        if (
          ![
            'title',
            'slug',
            'uuid',
            'system-category',
            'category',
            'user-keywords',
            'keywords',
            'tags',
            'lastModified',
            'author',
            'description',
            'version',
            'status',
            'schemaType',
            'schemaData'
          ].includes(key)
        ) {
          formattedMetadata.custom[key] = value;
        }
      }

      res.json(formattedMetadata);
    } catch (error: unknown) {
      logger.error('Error retrieving page metadata:', error);
      res
        .status(500)
        .json({ error: 'Internal server error', details: getErrorMessage(error) });
    }
  }

  /**
   * API endpoint for page name autocomplete suggestions
   * GET /api/page-suggestions?q=partial
   *
   * Used for:
   * - Autocomplete when typing [page name] in editor
   * - Autocomplete in search dialogs
   *
   * Related: GitHub Issue #90 - TypeDown for Internal Page Links
   */
  async getPageSuggestions(req: Request, res: Response) {
    try {
      const query = req.query.q || '';
      const limit = parseInt(req.query.limit) || 10;

      if (!query || query.length < 2) {
        return res.json({ suggestions: [] });
      }

      const searchManager = this.engine.getManager('SearchManager');
      const pageManager = this.engine.getManager('PageManager');

      if (!searchManager || !pageManager) {
        return res.status(500).json({ error: 'Search not available' });
      }

      // Get all page names (getAllPages returns an array of page name strings)
      const allPageNames = await pageManager.getAllPages();

      // Filter page names that match the query (case-insensitive)
      const queryLower = query.toLowerCase();
      const matchingNames = allPageNames
        .filter(pageName => {
          if (!pageName || typeof pageName !== 'string') return false;
          return pageName.toLowerCase().includes(queryLower);
        })
        // Sort: exact matches first, then prefix matches, then alphabetical
        .sort((a, b) => {
          const aLower = a.toLowerCase();
          const bLower = b.toLowerCase();

          // Exact match
          if (aLower === queryLower) return -1;
          if (bLower === queryLower) return 1;

          // Prefix match
          const aPrefix = aLower.startsWith(queryLower);
          const bPrefix = bLower.startsWith(queryLower);
          if (aPrefix && !bPrefix) return -1;
          if (!aPrefix && bPrefix) return 1;

          // Alphabetical
          return aLower.localeCompare(bLower);
        })
        .slice(0, limit);

      // Load full details for matching pages
      const matchingPages = await Promise.all(
        matchingNames.map(async (pageName) => {
          try {
            const page = await pageManager.getPage(pageName);
            return {
              name: pageName,
              slug: page?.metadata?.slug || pageName,
              title: page?.metadata?.title || pageName,
              category: page?.metadata?.['system-category'] || page?.metadata?.category || 'general'
            };
          } catch (err: unknown) {
            // If page load fails, return basic info
            return {
              name: pageName,
              slug: pageName,
              title: pageName,
              category: 'general'
            };
          }
        })
      );

      res.json({
        query,
        suggestions: matchingPages,
        count: matchingPages.length
      });
    } catch (error: unknown) {
      logger.error('Error getting page suggestions:', error);
      res.status(500).json({ error: 'Internal server error', details: getErrorMessage(error) });
    }
  }

  // ============================================================================
  // Version Management API Handlers (Phase 6)
  // ============================================================================

  /**
   * GET /api/page/:identifier/versions
   * Get version history for a page
   */
  async getPageVersions(req: Request, res: Response) {
    try {
      const { identifier } = req.params;
      const pageManager = this.engine.getManager('PageManager');

      if (!pageManager) {
        return res.status(500).json({ error: 'PageManager not available' });
      }

      const provider = pageManager.provider;

      // Check if provider supports versioning
      if (typeof provider.getVersionHistory !== 'function') {
        return res.status(501).json({
          error: 'Versioning not supported',
          message: 'Current page provider does not support version history'
        });
      }

      // Get version history
      const versions = await provider.getVersionHistory(identifier);

      res.json({
        success: true,
        identifier: identifier,
        versionCount: versions.length,
        versions: versions
      });

    } catch (error: unknown) {
      logger.error(`Error getting page versions: ${getErrorMessage(error)}`);

      if (getErrorMessage(error).includes('not found')) {
        return res.status(404).json({
          error: 'Page not found',
          message: getErrorMessage(error)
        });
      }

      res.status(500).json({
        error: 'Internal server error',
        details: getErrorMessage(error)
      });
    }
  }

  /**
   * GET /api/page/:identifier/version/:version
   * Get specific version content
   */
  async getPageVersion(req: Request, res: Response) {
    try {
      const { identifier, version } = req.params;
      const versionNum = parseInt(version);

      if (isNaN(versionNum) || versionNum < 1) {
        return res.status(400).json({
          error: 'Invalid version number',
          message: 'Version must be a positive integer'
        });
      }

      const pageManager = this.engine.getManager('PageManager');

      if (!pageManager) {
        return res.status(500).json({ error: 'PageManager not available' });
      }

      const provider = pageManager.provider;

      // Check if provider supports versioning
      if (typeof provider.getPageVersion !== 'function') {
        return res.status(501).json({
          error: 'Versioning not supported',
          message: 'Current page provider does not support version history'
        });
      }

      // Get version content
      const versionData = await provider.getPageVersion(identifier, versionNum);

      res.json({
        success: true,
        identifier: identifier,
        version: versionNum,
        content: versionData.content,
        metadata: versionData.metadata
      });

    } catch (error: unknown) {
      logger.error(`Error getting page version: ${getErrorMessage(error)}`);

      if (getErrorMessage(error).includes('not found')) {
        return res.status(404).json({
          error: 'Page or version not found',
          message: getErrorMessage(error)
        });
      }

      if (getErrorMessage(error).includes('does not exist')) {
        return res.status(404).json({
          error: 'Version not found',
          message: getErrorMessage(error)
        });
      }

      res.status(500).json({
        error: 'Internal server error',
        details: getErrorMessage(error)
      });
    }
  }

  /**
   * GET /api/page/:identifier/compare/:v1/:v2
   * Compare two versions of a page
   */
  async comparePageVersions(req: Request, res: Response) {
    try {
      const { identifier, v1, v2 } = req.params;
      const version1 = parseInt(v1);
      const version2 = parseInt(v2);

      if (isNaN(version1) || isNaN(version2) || version1 < 1 || version2 < 1) {
        return res.status(400).json({
          error: 'Invalid version numbers',
          message: 'Versions must be positive integers'
        });
      }

      const pageManager = this.engine.getManager('PageManager');

      if (!pageManager) {
        return res.status(500).json({ error: 'PageManager not available' });
      }

      const provider = pageManager.provider;

      // Check if provider supports versioning
      if (typeof provider.compareVersions !== 'function') {
        return res.status(501).json({
          error: 'Versioning not supported',
          message: 'Current page provider does not support version comparison'
        });
      }

      // Compare versions
      const comparison = await provider.compareVersions(identifier, version1, version2);

      res.json({
        success: true,
        identifier: identifier,
        comparison: comparison
      });

    } catch (error: unknown) {
      logger.error(`Error comparing page versions: ${getErrorMessage(error)}`);

      if (getErrorMessage(error).includes('not found')) {
        return res.status(404).json({
          error: 'Page or version not found',
          message: getErrorMessage(error)
        });
      }

      res.status(500).json({
        error: 'Internal server error',
        details: getErrorMessage(error)
      });
    }
  }

  /**
   * POST /api/page/:identifier/restore/:version
   * Restore page to a specific version
   */
  async restorePageVersion(req: Request, res: Response) {
    try {
      const { identifier, version } = req.params;
      const versionNum = parseInt(version);

      if (isNaN(versionNum) || versionNum < 1) {
        return res.status(400).json({
          error: 'Invalid version number',
          message: 'Version must be a positive integer'
        });
      }

      // Check authentication
      if (!req.userContext || !req.userContext.isAuthenticated) {
        return res.status(401).json({
          error: 'Authentication required',
          message: 'You must be logged in to restore versions'
        });
      }

      const pageManager = this.engine.getManager('PageManager');

      if (!pageManager) {
        return res.status(500).json({ error: 'PageManager not available' });
      }

      const provider = pageManager.provider;

      // Check if provider supports versioning
      if (typeof provider.restoreVersion !== 'function') {
        return res.status(501).json({
          error: 'Versioning not supported',
          message: 'Current page provider does not support version restoration'
        });
      }

      // Get restore options from request body
      const { comment } = req.body || {};

      // Restore version
      const newVersion = await provider.restoreVersion(identifier, versionNum, {
        author: req.userContext.username || 'unknown',
        comment: comment || `Restored from v${versionNum}`
      });

      logger.info(`[WikiRoutes] User ${req.userContext.username} restored page ${identifier} to v${versionNum}, created v${newVersion}`);

      res.json({
        success: true,
        identifier: identifier,
        restoredFromVersion: versionNum,
        newVersion: newVersion,
        message: `Successfully restored to version ${versionNum}, created version ${newVersion}`
      });

    } catch (error: unknown) {
      logger.error(`Error restoring page version: ${getErrorMessage(error)}`);

      if (getErrorMessage(error).includes('not found')) {
        return res.status(404).json({
          error: 'Page or version not found',
          message: getErrorMessage(error)
        });
      }

      res.status(500).json({
        error: 'Internal server error',
        details: getErrorMessage(error)
      });
    }
  }

  /**
   * GET /history/:page
   * Show page history view
   */
  async pageHistory(req: Request, res: Response) {
    try {
      const pageName = decodeURIComponent(req.params.page);
      logger.info(`[pageHistory] Request for page: "${pageName}"`);

      const pageManager = this.engine.getManager('PageManager');

      // Create WikiContext for this request
      const wikiContext = this.createWikiContext(req, {
        context: WikiContext.CONTEXT.INFO,
        pageName: pageName,
        response: res
      });

      if (!pageManager) {
        const templateData = this.getTemplateDataFromContext(wikiContext);
        return res.status(500).render('error', {
          ...templateData,
          message: 'PageManager not available'
        });
      }

      const provider = pageManager.provider;

      // Check if provider supports versioning
      if (typeof provider.getVersionHistory !== 'function') {
        const templateData = this.getTemplateDataFromContext(wikiContext);
        return res.status(501).render('error', {
          ...templateData,
          message: 'Page versioning is not enabled. Please configure VersioningFileProvider.'
        });
      }

      // Check if page exists
      if (!pageManager.pageExists(pageName)) {
        const templateData = this.getTemplateDataFromContext(wikiContext);
        return res.status(404).render('error', {
          ...templateData,
          message: `Page "${pageName}" not found`
        });
      }

      // Get page info
      const pageInfo = await pageManager.getPage(pageName);
      logger.info(`[pageHistory] Page info - UUID: ${pageInfo.uuid}, Title: ${pageInfo.title}`);

      // Get version history
      logger.info(`[pageHistory] Fetching version history for: "${pageName}"`);
      const versions = await provider.getVersionHistory(pageName);
      logger.info(`[pageHistory] Found ${versions.length} versions`);

      // Get template data from WikiContext
      const templateData = this.getTemplateDataFromContext(wikiContext);

      res.render('page-history', {
        ...templateData,
        pageUuid: pageInfo.uuid,
        versions: versions,
        versionCount: versions.length
      });

    } catch (error: unknown) {
      logger.error(`Error rendering page history: ${getErrorMessage(error)}`);
      const wikiContext = this.createWikiContext(req, { response: res });
      const templateData = this.getTemplateDataFromContext(wikiContext);
      res.status(500).render('error', {
        ...templateData,
        message: 'Error loading page history',
        error: getErrorMessage(error)
      });
    }
  }

  /**
   * GET /diff/:page?v1=X&v2=Y
   * Show version comparison view
   */
  async pageDiff(req: Request, res: Response) {
    try {
      const pageName = decodeURIComponent(req.params.page);
      const v1 = parseInt(req.query.v1);
      const v2 = parseInt(req.query.v2);

      // Create WikiContext for this request
      const wikiContext = this.createWikiContext(req, {
        context: WikiContext.CONTEXT.DIFF,
        pageName: pageName,
        response: res
      });

      if (isNaN(v1) || isNaN(v2) || v1 < 1 || v2 < 1) {
        const templateData = this.getTemplateDataFromContext(wikiContext);
        return res.status(400).render('error', {
          ...templateData,
          message: 'Invalid version numbers. Please provide valid v1 and v2 parameters.'
        });
      }

      const pageManager = this.engine.getManager('PageManager');

      if (!pageManager) {
        const templateData = this.getTemplateDataFromContext(wikiContext);
        return res.status(500).render('error', {
          ...templateData,
          message: 'PageManager not available'
        });
      }

      const provider = pageManager.provider;

      // Check if provider supports versioning
      if (typeof provider.compareVersions !== 'function') {
        const templateData = this.getTemplateDataFromContext(wikiContext);
        return res.status(501).render('error', {
          ...templateData,
          message: 'Page versioning is not enabled. Please configure VersioningFileProvider.'
        });
      }

      // Check if page exists
      if (!pageManager.pageExists(pageName)) {
        const templateData = this.getTemplateDataFromContext(wikiContext);
        return res.status(404).render('error', {
          ...templateData,
          message: `Page "${pageName}" not found`
        });
      }

      // Get page info
      const pageInfo = await pageManager.getPage(pageName);

      // Compare versions
      const comparison = await provider.compareVersions(pageName, v1, v2);

      // Get template data from WikiContext
      const templateData = this.getTemplateDataFromContext(wikiContext);

      // Get left menu content
      const leftMenu = await this.getLeftMenu(wikiContext.userContext);

      res.render('page-diff', {
        ...templateData,
        leftMenu,
        pageUuid: pageInfo.uuid,
        version1: comparison.version1,
        version2: comparison.version2,
        diff: comparison.diff,
        stats: comparison.stats
      });

    } catch (error: unknown) {
      logger.error(`Error rendering page diff: ${getErrorMessage(error)}`);
      const wikiContext = this.createWikiContext(req, { response: res });
      const templateData = this.getTemplateDataFromContext(wikiContext);
      res.status(500).render('error', {
        ...templateData,
        message: 'Error comparing versions',
        error: getErrorMessage(error)
      });
    }
  }
}

export default WikiRoutes;
module.exports = WikiRoutes;
