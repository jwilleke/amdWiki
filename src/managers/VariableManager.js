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
    this.registerVariable('appName', (context) => {
      const configManager = this.engine.getManager('ConfigurationManager');
      return configManager.getProperty('amdwiki.applicationName', 'amdWiki');
    });
    this.registerVariable('pageName', (context) => context.pageName);
    this.registerVariable('username', (context) => context.userContext?.username || 'Anonymous');
    this.registerVariable('loginstatus', (context) => context.userContext?.isAuthenticated ? 'Logged in' : 'Not logged in');
    this.registerVariable('userroles', (context) => (context.userContext?.roles || []).join(', '));
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
          return handler(context);
        } catch (error) {
          logger.error(`[VAR] Error expanding variable '${varName}'`, { error });
          return `[Error: ${varName}]`;
        }
      }
      return match; // Return original string if no handler is found
    });
  }
}

module.exports = VariableManager;