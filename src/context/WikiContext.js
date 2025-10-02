const Showdown = require('showdown');

/**
 * WikiContext (Node/Express adaptation of JSPWiki's WikiContext)
 * - Holds engine, request/response, page, user, variables, and context type.
 * - Provides parse options for MarkupParser.
 * - Central object for the rendering pipeline.
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
    SEARCH: 'search',
    NONE: 'none' // For operations outside a request context
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
    this.command = command || null;

    this.requestInfo = request ? WikiContext.fromExpressReq(request) : null;
    this._variables = new Map();
    this._fallbackConverter = new Showdown.Converter();
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
      sessionId: req.sessionID || null,
      userId: req.session?.userId ?? null,
      roles: Array.isArray(req.session?.roles) ? req.session.roles : []
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

  /**
   * Creates a clone of the current context.
   * @returns {WikiContext} A new WikiContext instance with copied properties.
   */
  clone() {
    const newContext = new WikiContext(this.engine, {
      context: this._context,
      pageName: this.pageName,
      content: this.content,
      userContext: this.userContext,
      request: this.request,
      response: this.response,
      command: this.command
    });
    for (const [key, value] of this._variables.entries()) {
      newContext.setVariable(key, value);
    }
    return newContext;
  }

  // Options fed to MarkupParser
  toParseOptions() {
    return {
      pageName: this.pageName,
      userName: this.userContext?.username || 'anonymous',
      pageContext: {
        userContext: this.userContext,
        pageName: this.pageName,
        requestInfo: this.requestInfo,
        variables: this.getVariables(),
        context: this._context,
        command: this.command
      }
    };
  }

  // Render content using the full pipeline
  async renderMarkdown(content = this.content) {
    const parser = this.engine?.getManager?.('MarkupParser');
    if (parser && typeof parser.parse === 'function') {
      return parser.parse(content, this.toParseOptions());
    }

    // Fallback path if MarkupParser is not available
    const renderingManager = this.engine?.getManager?.('RenderingManager');
    let expanded = content;
    if (renderingManager?.expandAllVariables) {
      expanded = renderingManager.expandAllVariables(content, this.toParseOptions().pageContext);
    }
    if (renderingManager?.converter?.makeHtml) {
      return renderingManager.converter.makeHtml(expanded);
    }
    return this._fallbackConverter.makeHtml(expanded);
  }
}

module.exports = WikiContext;