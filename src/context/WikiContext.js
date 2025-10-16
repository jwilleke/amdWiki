const Showdown = require('showdown');
const logger = require('../utils/logger');

/**
 * WikiContext - Encapsulates the context of a single request or rendering operation
 *
 * Inspired by JSPWiki's WikiContext, this class provides a request-scoped container
 * for all contextual information needed during page rendering, including the engine,
 * current page, user, request/response objects, and manager references.
 *
 * @class WikiContext
 *
 * @property {WikiEngine} engine - The wiki engine instance
 * @property {string} context - The rendering context (VIEW, EDIT, PREVIEW, etc.)
 * @property {string|null} pageName - Name of the current page
 * @property {string|null} content - Page content (markdown)
 * @property {Object|null} userContext - Current user context/session
 * @property {Object|null} request - Express request object
 * @property {Object|null} response - Express response object
 * @property {PageManager} pageManager - Reference to PageManager
 * @property {RenderingManager} renderingManager - Reference to RenderingManager
 * @property {PluginManager} pluginManager - Reference to PluginManager
 * @property {VariableManager} variableManager - Reference to VariableManager
 * @property {ACLManager} aclManager - Reference to ACLManager
 * @property {Showdown.Converter} _fallbackConverter - Fallback markdown converter
 *
 * @see {@link WikiEngine} for the main engine
 * @see {@link RenderingManager} for rendering operations
 */
class WikiContext {
  /**
   * Context type constants for different rendering modes
   *
   * @static
   * @readonly
   * @enum {string}
   */
  static CONTEXT = {
    /** Viewing a page */
    VIEW: 'view',
    /** Editing a page */
    EDIT: 'edit',
    /** Previewing page changes */
    PREVIEW: 'preview',
    /** Viewing page diff */
    DIFF: 'diff',
    /** Viewing page information/metadata */
    INFO: 'info',
    /** No specific page context */
    NONE: 'none',
  };

  /**
   * Creates a new WikiContext instance
   *
   * @constructor
   * @param {WikiEngine} engine - The wiki engine instance
   * @param {Object} [options={}] - Context options
   * @param {string} [options.context] - Context type (VIEW, EDIT, etc.)
   * @param {string} [options.pageName] - Name of the page
   * @param {string} [options.content] - Page content
   * @param {Object} [options.userContext] - User context/session
   * @param {Object} [options.request] - Express request object
   * @param {Object} [options.response] - Express response object
   * @throws {Error} If engine is not provided
   *
   * @example
   * const context = new WikiContext(engine, {
   *   context: WikiContext.CONTEXT.VIEW,
   *   pageName: 'Main',
   *   userContext: req.session.user,
   *   request: req,
   *   response: res
   * });
   */
  constructor(engine, options = {}) {
    if (!engine) {
      throw new Error('WikiContext requires a valid WikiEngine instance.');
    }

    this.engine = engine;
    this.context = options.context || WikiContext.CONTEXT.NONE;
    this.pageName = options.pageName || null;
    this.content = options.content || null;
    this.userContext = options.userContext || null;
    this.request = options.request || null;
    this.response = options.response || null;

    // Ensure essential managers are available on the context
    this.pageManager = engine.getManager('PageManager');
    this.renderingManager = engine.getManager('RenderingManager');
    this.pluginManager = engine.getManager('PluginManager');
    this.variableManager = engine.getManager('VariableManager'); // This was missing
    this.aclManager = engine.getManager('ACLManager');

    this._fallbackConverter = new Showdown.Converter();
  }

  /**
   * Returns the current rendering context type
   *
   * @returns {string} The context type (VIEW, EDIT, PREVIEW, etc.)
   *
   * @example
   * if (context.getContext() === WikiContext.CONTEXT.EDIT) {
   *   // Show edit-specific UI
   * }
   */
  getContext() {
    return this.context;
  }

  /**
   * Renders the provided markdown content through the full rendering pipeline
   *
   * This method uses the MarkupParser for advanced parsing with plugin support,
   * variable expansion, and multi-phase processing. Falls back to simple Showdown
   * conversion if the parser is unavailable.
   *
   * @async
   * @param {string} [content=this.content] - The markdown content to render
   * @returns {Promise<string>} The rendered HTML
   *
   * @example
   * const html = await context.renderMarkdown('# Hello World');
   * // Returns: '<h1>Hello World</h1>'
   *
   * @example
   * // With plugins and variables
   * const html = await context.renderMarkdown('[{CurrentTimePlugin}]');
   * // Returns expanded plugin output
   */
  async renderMarkdown(content = this.content) {
    // The advanced parser should be the primary method
    const parser = this.renderingManager?.getParser?.();
    logger.info(`[CTX] renderMarkdown page=${this.pageName} parser=${!!parser} contentLen=${content?.length ?? 0}`);

    if (parser && typeof parser.parse === 'function') {
      const html = await parser.parse(content, this.toParseOptions());
      logger.info(`[CTX] parsed via MarkupParser resultLen=${html?.length ?? 0}`);
      return html;
    }

    // Fallback for when the advanced parser is not available
    logger.warn(`[CTX] Using fallback renderer for page ${this.pageName}.`);
    let expanded = content;
    if (this.variableManager && typeof this.variableManager.expandVariables === 'function') {
      expanded = this.variableManager.expandVariables(expanded, this.toParseOptions().pageContext);
      logger.info(`[CTX] variables expanded len=${expanded?.length ?? 0}`);
    }

    const html = this._fallbackConverter.makeHtml(expanded);
    logger.info(`[CTX] fallback converter resultLen=${html?.length ?? 0}`);
    return html;
  }

  /**
   * Creates the options object needed for the MarkupParser
   *
   * Builds a comprehensive options object containing page context, user context,
   * request information, and engine reference for use during parsing.
   *
   * @returns {Object} Parse options object
   * @returns {Object} options.pageContext - Page-specific context
   * @returns {string} options.pageContext.pageName - Current page name
   * @returns {Object} options.pageContext.userContext - User session context
   * @returns {Object} options.pageContext.requestInfo - HTTP request information
   * @returns {WikiEngine} options.engine - Engine instance
   *
   * @example
   * const options = context.toParseOptions();
   * const html = await parser.parse(content, options);
   */
  toParseOptions() {
    return {
      pageContext: {
        pageName: this.pageName,
        userContext: this.userContext,
        requestInfo: {
          acceptLanguage: this.request?.headers?.['accept-language'],
          userAgent: this.request?.headers?.['user-agent'],
          clientIp: this.request?.ip,
          referer: this.request?.headers?.referer,
          sessionId: this.request?.sessionID,
        },
      },
      engine: this.engine,
    };
  }
}

module.exports = WikiContext;