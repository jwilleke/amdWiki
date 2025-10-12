const { BaseSyntaxHandler } = require('./BaseSyntaxHandler');

/**
 * VariableSyntaxHandler - WikiVariable syntax processing
 *
 * Handles JSPWiki-style variable syntax: [{$variablename}]
 * Variables are resolved through the VariableManager.
 *
 * Part of Issue #110 - Variable Syntax Fix
 */
class VariableSyntaxHandler extends BaseSyntaxHandler {
  constructor(engine = null) {
    super(
      /\[\{\$(\w+)\}\]/g, // Pattern: [{$variablename}]
      95, // Higher priority than plugins (90) - process variables first
      {
        description: 'JSPWiki-style variable syntax handler',
        version: '1.0.0',
        dependencies: [], // No hard dependencies - gracefully handles missing VariableManager
        cacheEnabled: false // Variables are dynamic
      }
    );
    this.handlerId = 'VariableSyntaxHandler';
    this.engine = engine;
    this.variableManager = null;
  }

  /**
   * Initialize handler with configuration
   * @param {Object} context - Initialization context
   */
  async onInitialize(context) {
    this.engine = context.engine;
    this.variableManager = this.engine?.getManager('VariableManager');

    if (!this.variableManager) {
      console.warn('⚠️  VariableSyntaxHandler: VariableManager not available');
    }
  }

  /**
   * Process content by finding and resolving all variables
   * @param {string} content - Content to process
   * @param {ParseContext} context - Parse context
   * @returns {Promise<string>} - Content with variables resolved
   */
  async process(content, context) {
    if (!content || !this.variableManager) {
      return content;
    }

    const matches = [];
    let match;

    // Reset regex state
    this.pattern.lastIndex = 0;

    // Find all variable matches
    while ((match = this.pattern.exec(content)) !== null) {
      matches.push({
        fullMatch: match[0],      // [{$variablename}]
        varName: match[1],         // variablename
        index: match.index,
        length: match[0].length
      });
    }

    // Process matches in reverse order to maintain correct positions
    let result = content;
    for (let i = matches.length - 1; i >= 0; i--) {
      const m = matches[i];

      try {
        // Resolve variable value
        const value = this.resolveVariable(m.varName, context);

        if (value !== null && value !== undefined) {
          // Replace with resolved value
          result = result.substring(0, m.index) +
                   value +
                   result.substring(m.index + m.length);
        } else {
          // Variable not found - keep original syntax
          console.warn(`⚠️  Variable not found: ${m.varName}`);
          // Keep [{$variablename}] as-is
        }
      } catch (error) {
        console.error(`❌ Error resolving variable '${m.varName}':`, error.message);
        // On error, replace with error message
        const errorMsg = `[Error: ${error.message}]`;
        result = result.substring(0, m.index) +
                 errorMsg +
                 result.substring(m.index + m.length);
      }
    }

    return result;
  }

  /**
   * Resolves a variable name to its value
   *
   * @param {string} varName - Variable name (without [{$ }])
   * @param {Object} context - Rendering context
   * @returns {string|null} Variable value or null if not found
   */
  resolveVariable(varName, context) {
    if (!this.variableManager || !this.variableManager.variableHandlers) {
      return null;
    }

    // Get handler for this variable (case-insensitive)
    const handler = this.variableManager.variableHandlers.get(varName.toLowerCase().trim());

    if (!handler) {
      return null;
    }

    try {
      const result = handler(context);

      // Handle async handlers
      if (result instanceof Promise) {
        console.warn(`⚠️  Variable '${varName}' returned Promise - cannot resolve synchronously`);
        return null;
      }

      return result !== null && result !== undefined ? String(result) : null;

    } catch (error) {
      console.error(`❌ Error resolving variable '${varName}':`, error);
      throw error;
    }
  }

  /**
   * Validates handler configuration
   * @returns {boolean} True if valid
   */
  async onValidate() {
    if (!this.engine) {
      console.warn('⚠️  VariableSyntaxHandler: No engine provided');
      return false;
    }

    return true;
  }
}

module.exports = VariableSyntaxHandler;
