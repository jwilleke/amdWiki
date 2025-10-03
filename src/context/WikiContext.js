const Showdown = require('showdown');
const logger = require('../utils/logger');

/**
 * WikiContext - Encapsulates the context of a single request or rendering operation.
 * Inspired by JSPWiki's WikiContext, it provides access to the engine, page,
 * user, and other contextual information.
 */
class WikiContext {
  static CONTEXT = {
    VIEW: 'view',
    EDIT: 'edit',
    PREVIEW: 'preview',
    DIFF: 'diff',
    INFO: 'info',
    NONE: 'none', // For operations without a specific page context
  };

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
   * Returns the current rendering context (e.g., 'view', 'edit').
   * @returns {string} The context string.
   */
  getContext() {
    return this.context;
  }

  /**
   * Renders the provided markdown content through the full pipeline.
   * @param {string} content The markdown content to render.
   * @returns {Promise<string>} The rendered HTML.
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
   * Creates the options object needed for the MarkupParser.
   * @returns {object}
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