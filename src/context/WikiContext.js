// const { LinkParser } = require('../parsers/LinkParser');
const Showdown = require('showdown');

/**
 * WikiContext - Central context for wiki rendering operations
 *
 * Orchestrates the rendering pipeline using managers instead of inline regex.
 * Follows JSPWiki's architecture where WikiContext coordinates access to
 * managers like VariableManager, PluginManager, and RenderingManager.
 *
 * Related Issue: #66 - Implement WikiContext and Manager refactoring
 */
class WikiContext {
  // JSPWiki-like context constants
  static CONTEXT = {
    VIEW: 'view',
    EDIT: 'edit',
    PREVIEW: 'preview',
    DIFF: 'diff',
    ATTACH: 'attach',
    INFO: 'info',
    COMMENT: 'comment',
    UPLOAD: 'upload',
    LOGIN: 'login',
    LOGOUT: 'logout',
    PREFS: 'prefs',
    SEARCH: 'search'
  };

  constructor(
    engine,
    {
      context = WikiContext.CONTEXT.VIEW,
      pageName = 'Home',
      content = '',
      userContext = null,
      request = null,
      response = null,
      requestInfo = null,
      linkGraph = {},
      variables = {},
      command = null
    } = {}
  ) {
    this.engine = engine;
    this._context = context;
    this.pageName = pageName;
    this.content = content;
    this.userContext = userContext;
    this.request = request || null;
    this.response = response || null;
    this.requestInfo = requestInfo || (request ? WikiContext.fromExpressReq(request) : null);
    this.linkGraph = linkGraph || {};
    this.command = command || null;

    this._variables = new Map(Object.entries(variables || {}));
    this._fallbackConverter = new Showdown.Converter();

    // Performance tracking
    this.startTime = Date.now();
    this.phaseTimings = new Map();

    // LinkParser for fallback link processing
    this.fallbackLinkParser = new LinkParser();
    this.linkParserInitialized = false;
  }

  // Express request -> normalized requestInfo for VariableManager
  static fromExpressReq(req) {
    if (!req) return null;
    const xfwd = req.headers?.['x-forwarded-for'] || '';
    const clientIp =
      (typeof xfwd === 'string' && xfwd.split(',')[0].trim()) ||
      req.ip ||
      req.connection?.remoteAddress ||
      undefined;

    return {
      userAgent: req.headers?.['user-agent'],
      acceptLanguage: req.headers?.['accept-language'],
      referer: req.get?.('referer') || 'Direct',
      clientIp,
      // session hints (non-sensitive)
      sessionId: req.sessionID || null,
      userId: req.session?.userId ?? null,
      roles: Array.isArray(req.session?.roles) ? req.session.roles : (req.session?.roles ? [req.session.roles] : [])
    };
  }

  /**
   * Get manager instance from engine
   * @param {string} managerName - Name of manager to retrieve
   * @returns {Object|null} - Manager instance or null
   */
  getManager(managerName) {
    return this.engine.getManager(managerName);
  }

  /**
   * Main rendering method - orchestrates the full rendering pipeline
   * Follows JSPWiki's TranslatorReader pattern: variables → plugins → links → HTML
   * @param {string} content - Markdown content to render
   * @param {string} pageName - Current page name
   * @param {Object} userContext - User context for authentication variables
   * @param {Object} requestInfo - Request information for context variables
   * @returns {string} - Rendered HTML content
   */
  async renderMarkdown(content, pageName, userContext = null, requestInfo = null) {
    const startTime = Date.now();
    
    try {
      // Update context
      this.content = content;
      this.pageName = pageName;
      this.userContext = userContext;
      this.requestInfo = requestInfo;
      
      let processedContent = content;
      
      // Phase 1: Variable expansion using VariableManager
      const variableStart = Date.now();
      processedContent = await this.expandVariables(processedContent);
      this.phaseTimings.set('variables', Date.now() - variableStart);
      
      // Phase 2: Plugin execution using PluginManager
      const pluginStart = Date.now();
      processedContent = await this.expandPlugins(processedContent);
      this.phaseTimings.set('plugins', Date.now() - pluginStart);
      
      // Phase 3: Wiki link processing using RenderingManager
      const linkStart = Date.now();
      processedContent = await this.expandWikiLinks(processedContent);
      this.phaseTimings.set('links', Date.now() - linkStart);
      
      // Phase 4: Markdown to HTML conversion
      const markdownStart = Date.now();
      const finalHtml = await this.convertMarkdownToHtml(processedContent);
      this.phaseTimings.set('markdown', Date.now() - markdownStart);
      
      this.phaseTimings.set('total', Date.now() - startTime);
      
      return finalHtml;
      
    } catch (error) {
      console.error('WikiContext rendering error:', error);
      throw error;
    }
  }

  /**
   * Expand variables using VariableManager
   * @param {string} content - Content with variables
   * @returns {string} - Content with expanded variables
   */
  async expandVariables(content) {
    const variableManager = this.getManager('VariableManager');
    if (!variableManager) {
      console.warn('VariableManager not available, skipping variable expansion');
      return content;
    }

    const context = {
      userContext: this.userContext,
      pageName: this.pageName,
      requestInfo: this.requestInfo
    };

    return variableManager.expandVariables(content, context);
  }

  /**
   * Expand plugins using PluginManager
   * @param {string} content - Content with plugin syntax
   * @returns {string} - Content with rendered plugins
   */
  async expandPlugins(content) {
    const pluginManager = this.getManager('PluginManager');
    if (!pluginManager) {
      console.warn('PluginManager not available, skipping plugin expansion');
      return content;
    }

    // Process JSPWiki-style plugins [{PluginName param1='value'}]
    const pluginRegex = /\[\{([^}]+)\}\]/g;
    const matches = [];
    let match;

    // Collect all matches first
    while ((match = pluginRegex.exec(content)) !== null) {
      matches.push({
        fullMatch: match[0],
        pluginContent: match[1],
        index: match.index
      });
    }

    // Process matches in reverse order to maintain string positions
    let processedContent = content;
    for (let i = matches.length - 1; i >= 0; i--) {
      const matchInfo = matches[i];
      try {
        // Parse plugin name and parameters
        const parts = matchInfo.pluginContent.trim().split(/\s+/);
        const pluginName = parts[0];

        // Parse parameters (simplified - could be enhanced)
        const params = {};
        for (let j = 1; j < parts.length; j++) {
          const param = parts[j];
          const eqIndex = param.indexOf('=');
          if (eqIndex > 0) {
            const key = param.substring(0, eqIndex);
            let value = param.substring(eqIndex + 1);
            // Remove quotes if present
            if ((value.startsWith('"') && value.endsWith('"')) ||
                (value.startsWith("'") && value.endsWith("'"))) {
              value = value.slice(1, -1);
            }
            params[key] = value;
          }
        }

        // Execute plugin with context
        const context = {
          engine: this.engine,
          pageName: this.pageName,
          userContext: this.userContext,
          requestInfo: this.requestInfo,
          linkGraph: this.linkGraph
        };

        const result = await pluginManager.execute(pluginName, this.pageName, params, context);

        // Replace the match in the content
        processedContent = processedContent.substring(0, matchInfo.index) +
                          result +
                          processedContent.substring(matchInfo.index + matchInfo.fullMatch.length);
      } catch (error) {
        console.error(`Error executing plugin from ${matchInfo.fullMatch}:`, error);
        const errorReplacement = `<span class="error">Plugin Error: ${error.message}</span>`;
        processedContent = processedContent.substring(0, matchInfo.index) +
                          errorReplacement +
                          processedContent.substring(matchInfo.index + matchInfo.fullMatch.length);
      }
    }

    return processedContent;
  }

  /**
   * Expand wiki links using RenderingManager or LinkParser fallback
   * @param {string} content - Content with wiki links
   * @returns {string} - Content with rendered links
   */
  async expandWikiLinks(content) {
    const renderingManager = this.getManager('RenderingManager');
    if (!renderingManager) {
      console.warn('RenderingManager not available, using LinkParser fallback');
      return await this.fallbackLinkProcessing(content);
    }

    return renderingManager.renderWikiLinks(content);
  }

  /**
   * Initialize fallback LinkParser with page names and configuration
   */
  async initializeFallbackLinkParser() {
    if (this.linkParserInitialized) {
      return;
    }

    try {
      const pageManager = this.getManager('PageManager');
      if (pageManager) {
        // Get page names for link validation
        const pages = pageManager.getAllPages ? await pageManager.getAllPages() : [];
        const pageNames = Array.isArray(pages) ? pages.map(page => page.name || page) : [];
        this.fallbackLinkParser.setPageNames(pageNames);
      }

      // Set up basic InterWiki sites for fallback
      this.fallbackLinkParser.setInterWikiSites({
        'Wikipedia': {
          url: 'https://en.wikipedia.org/wiki/%s',
          description: 'Wikipedia English',
          openInNewWindow: true
        },
        'JSPWiki': {
          url: 'https://jspwiki-wiki.apache.org/Wiki.jsp?page=%s',
          description: 'JSPWiki Documentation',
          openInNewWindow: true
        }
      });

      this.linkParserInitialized = true;
    } catch (error) {
      console.warn('Failed to initialize fallback LinkParser:', error);
    }
  }

  /**
   * Fallback link processing using LinkParser (replaces brittle regex approach)
   * @param {string} content - Content with wiki links
   * @returns {string} - Content with processed links
   */
  async fallbackLinkProcessing(content) {
    if (!content) {
      return content;
    }

    try {
      // Initialize LinkParser if not already done
      await this.initializeFallbackLinkParser();

      // Use comprehensive LinkParser for fallback processing
      return this.fallbackLinkParser.parseLinks(content, {
        pageName: this.pageName,
        engine: this.engine,
        userContext: this.userContext
      });

    } catch (error) {
      console.error('Error in fallback link processing:', error);
      return content;
    }
  }

  /**
   * Convert processed markdown to HTML
   * @param {string} content - Processed markdown content
   * @returns {string} - HTML content
   */
  async convertMarkdownToHtml(content) {
    // Use the same showdown converter as the original
    const showdown = require('showdown');
    const converter = new showdown.Converter();
    return converter.makeHtml(content);
  }

  /**
   * Get processing performance summary
   * @returns {Object} - Performance metrics
   */
  getPerformanceSummary() {
    return {
      totalTime: this.phaseTimings.get('total') || 0,
      variableTime: this.phaseTimings.get('variables') || 0,
      pluginTime: this.phaseTimings.get('plugins') || 0,
      linkTime: this.phaseTimings.get('links') || 0,
      markdownTime: this.phaseTimings.get('markdown') || 0,
      pageName: this.pageName,
      contentLength: this.content.length
    };
  }

  // --- JSPWiki-style accessors ---
  getEngine() { return this.engine; }
  getRequest() { return this.request; }
  getResponse() { return this.response; }
  getUser() { return this.userContext; }
  setUser(userContext) { this.userContext = userContext; return this; }

  getPageName() { return this.pageName; }
  setPageName(name) { this.pageName = name; return this; }

  getContext() { return this._context; }
  setContext(ctx) { this._context = ctx; return this; }

  getCommand() { return this.command; }
  setCommand(cmd) { this.command = cmd; return this; }

  // Context variables (WikiContext variable map)
  getVariable(name) { return this._variables.get(name); }
  setVariable(name, value) { this._variables.set(name, value); return this; }
  hasVariable(name) { return this._variables.has(name); }
  getVariables() { return Object.fromEntries(this._variables.entries()); }

  // Options fed to MarkupParser; VariableManager reads from pageContext
  toParseOptions() {
    return {
      pageName: this.pageName,
      userName: this.userContext?.username || 'anonymous',
      pageContext: {
        userContext: this.userContext,
        pageName: this.pageName,
        requestInfo: this.requestInfo,
        variables: this.getVariables(),
        linkGraph: this.linkGraph,
        context: this._context,
        command: this.command
      }
    };
  }

  /**
   * Clone context for sub-processing
   * @param {Object} overrides - Properties to override
   * @returns {WikiContext} - New context instance
   */
  clone(overrides = {}) {
    const newContext = new WikiContext(this.engine, {
      pageName: this.pageName,
      content: this.content,
      userContext: this.userContext,
      requestInfo: this.requestInfo,
      linkGraph: this.linkGraph,
      ...overrides
    });

    // Copy current state
    newContext.variables = new Map(this.variables);
    newContext.metadata = { ...this.metadata };

    return newContext;
  }

  /**
   * Get context summary for logging
   * @returns {Object} - Context summary
   */
  getSummary() {
    return {
      pageName: this.pageName,
      userContext: this.userContext ? {
        isAuthenticated: this.userContext.isAuthenticated,
        roles: this.userContext.roles || []
      } : null,
      contentLength: this.content.length,
      variableCount: this.variables.size,
      performance: this.getPerformanceSummary()
    };
  }
}

module.exports = WikiContext;