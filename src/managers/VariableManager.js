const BaseManager = require('./BaseManager');
const logger = require('../utils/logger');

/**
 * VariableManager - Handles the expansion of JSPWiki-style variables.
 * Example: [{$username}], [{$pageName}]
 */
class VariableManager extends BaseManager {
  constructor(engine) {
    super(engine);
    this.variableHandlers = new Map();
  }

  async initialize() {
    this.registerCoreVariables();
    logger.info('🔧 VariableManager initialized with core variables.');
  }

  /**
   * Registers the default set of JSPWiki-compatible variables.
   */
  registerCoreVariables() {
    const configManager = this.engine.getManager('ConfigurationManager');

    // Application info
    this.registerVariable('appName', (context) => {
      return configManager.getProperty('amdwiki.applicationName', 'amdWiki');
    });
    this.registerVariable('applicationname', (context) => {
      return configManager.getProperty('amdwiki.applicationName', 'amdWiki');
    });
    this.registerVariable('version', (context) => {
      return configManager.getProperty('amdwiki.version', '1.0.0');
    });
    this.registerVariable('baseurl', (context) => {
      return configManager.getProperty('amdwiki.baseURL', 'http://localhost:3000');
    });

    // Page context - ParseContext has pageName directly
    this.registerVariable('pagename', (context) => {
      return context?.pageName || 'unknown';
    });

    // User context - ParseContext has userName and userContext
    this.registerVariable('username', (context) => context?.userName || context?.userContext?.username || 'Anonymous');
    this.registerVariable('loginstatus', (context) => context?.userContext?.isAuthenticated ? 'Logged in' : 'Not logged in');
    this.registerVariable('userroles', (context) => (context?.userContext?.roles || []).join(', '));

    // Date/Time variables
    this.registerVariable('date', (context) => new Date().toLocaleDateString());
    this.registerVariable('time', (context) => new Date().toLocaleTimeString());
    this.registerVariable('timestamp', (context) => new Date().toISOString());
    this.registerVariable('year', (context) => new Date().getFullYear().toString());
    this.registerVariable('month', (context) => (new Date().getMonth() + 1).toString());
    this.registerVariable('day', (context) => new Date().getDate().toString());

    // System info
    this.registerVariable('uptime', (context) => {
      if (this.engine.startTime) {
        const uptimeMs = Date.now() - this.engine.startTime;
        const uptimeSec = Math.floor(uptimeMs / 1000);
        const hours = Math.floor(uptimeSec / 3600);
        const minutes = Math.floor((uptimeSec % 3600) / 60);
        const seconds = uptimeSec % 60;
        return `${hours}h ${minutes}m ${seconds}s`;
      }
      return 'unknown';
    });

    this.registerVariable('totalpages', (context) => {
      const pageManager = this.engine.getManager('PageManager');
      if (pageManager && pageManager.pageCache) {
        return pageManager.pageCache.size.toString();
      }
      return '0';
    });
  }

  /**
   * Registers a new variable handler.
   * @param {string} name The name of the variable (without brackets/dollar sign).
   * @param {Function} handler A function that takes the WikiContext and returns the variable's value.
   */
  registerVariable(name, handler) {
    if (this.variableHandlers.has(name)) {
      logger.warn(`[VAR] Overwriting existing variable handler for: ${name}`);
    }
    this.variableHandlers.set(name.toLowerCase(), handler);
  }

  /**
   * Expands all variables in a given string of content.
   * @param {string} content The content to process.
   * @param {object} context The WikiContext for the current rendering operation.
   * @returns {string} The content with variables expanded.
   */
  expandVariables(content, context) {
    if (!content || typeof content !== 'string') {
      return content;
    }
    // Regex to find variables like [{$varname}]
    return content.replace(/\[\{\$([^}]+)\}\]/g, (match, varName) => {
      const handler = this.variableHandlers.get(varName.toLowerCase().trim());
      if (handler) {
        try {
          const result = handler(context);
          // Handle async handlers (like totalpages)
          if (result instanceof Promise) {
            logger.warn(`[VAR] Variable '${varName}' returned a Promise - synchronous expansion failed`);
            return match;
          }
          return result;
        } catch (error) {
          logger.error(`[VAR] Error expanding variable '${varName}'`, { error });
          return `[Error: ${varName}]`;
        }
      }
      logger.debug(`[VAR] No handler found for variable: ${varName}`);
      return match; // Return original string if no handler is found
    });
  }
}

module.exports = VariableManager;