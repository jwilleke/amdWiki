const { BaseSyntaxHandler } = require('./BaseSyntaxHandler');

/**
 * PluginSyntaxHandler - Enhanced plugin syntax processing
 * 
 * Handles JSPWiki-style plugin syntax: [{PluginName param=value}]
 * with advanced parameter parsing and validation.
 * 
 * Related Issue: #58 - Enhanced Plugin Syntax Handler
 * Depends On: #56 - Handler Registration and Priority System
 */
class PluginSyntaxHandler extends BaseSyntaxHandler {
  constructor() {
    super(
      /\[\{(\w+)\s*([^}]*)\}\]/g, // Pattern: [{PluginName params}]
      90, // High priority - process before most other handlers
      {
        description: 'JSPWiki-style plugin syntax handler',
        version: '1.0.0',
        dependencies: ['PluginManager']
      }
    );
    this.handlerId = 'PluginSyntaxHandler';
  }

  /**
   * Process content by finding and executing all plugin instances
   * @param {string} content - Content to process
   * @param {ParseContext} context - Parse context
   * @returns {Promise<string>} - Content with plugins executed
   */
  async process(content, context) {
    if (!content) {
      return content;
    }

    // Find all plugin matches
    const matches = [];
    let match;
    
    // Reset regex state
    this.pattern.lastIndex = 0;
    
    while ((match = this.pattern.exec(content)) !== null) {
      matches.push({
        fullMatch: match[0],
        pluginName: match[1],
        paramString: match[2] || '',
        index: match.index,
        length: match[0].length
      });
    }

    // Process matches in reverse order to maintain string positions
    let processedContent = content;
    
    for (let i = matches.length - 1; i >= 0; i--) {
      const matchInfo = matches[i];
      
      try {
        const replacement = await this.handle(matchInfo, context);
        
        // Replace the match with the plugin output
        processedContent = 
          processedContent.slice(0, matchInfo.index) +
          replacement +
          processedContent.slice(matchInfo.index + matchInfo.length);
          
      } catch (error) {
        console.error(`❌ Plugin execution error for ${matchInfo.pluginName}:`, error.message);
        
        // Leave original plugin syntax on error for debugging
        const errorPlaceholder = `<!-- Plugin Error: ${matchInfo.pluginName} - ${error.message} -->`;
        processedContent = 
          processedContent.slice(0, matchInfo.index) +
          errorPlaceholder +
          processedContent.slice(matchInfo.index + matchInfo.length);
      }
    }

    return processedContent;
  }

  /**
   * Handle a specific plugin match
   * @param {Object} matchInfo - Plugin match information
   * @param {ParseContext} context - Parse context
   * @returns {Promise<string>} - Plugin output HTML
   */
  async handle(matchInfo, context) {
    const { pluginName, paramString } = matchInfo;
    
    // Parse plugin parameters
    const parameters = this.parseParameters(paramString);
    
    // Validate parameters
    const validation = this.validatePluginParameters(pluginName, parameters);
    if (!validation.isValid) {
      throw new Error(`Invalid parameters for ${pluginName}: ${validation.errors.join(', ')}`);
    }

    // Get PluginManager
    const pluginManager = context.getManager('PluginManager');
    if (!pluginManager) {
      throw new Error('PluginManager not available');
    }

    // Create plugin execution context
    const pluginContext = {
      pageName: context.pageName,
      userName: context.userName,
      userContext: context.userContext,
      requestInfo: context.requestInfo,
      engine: context.engine
    };

    // Execute plugin
    const result = await pluginManager.executePlugin(pluginName, validation.params, pluginContext);
    
    return result || '';
  }

  /**
   * Validate plugin parameters
   * @param {string} pluginName - Plugin name
   * @param {Object} parameters - Plugin parameters
   * @returns {Object} - Validation result
   */
  validatePluginParameters(pluginName, parameters) {
    // Basic validation - can be extended with plugin-specific schemas
    const errors = [];
    const validatedParams = {};

    // Common parameter validation
    for (const [key, value] of Object.entries(parameters)) {
      // Sanitize parameter values for security
      if (typeof value === 'string') {
        // Prevent script injection
        if (value.includes('<script') || value.includes('javascript:')) {
          errors.push(`Parameter ${key} contains potentially unsafe content`);
          continue;
        }
      }
      
      validatedParams[key] = value;
    }

    return {
      isValid: errors.length === 0,
      errors,
      params: validatedParams
    };
  }

  /**
   * Enhanced parameter parsing with support for complex formats
   * @param {string} paramString - Parameter string to parse
   * @returns {Object} - Parsed parameters
   */
  parseParameters(paramString) {
    if (!paramString || !paramString.trim()) {
      return {};
    }

    const params = {};
    // Enhanced regex to handle quoted values with spaces and special characters
    const paramRegex = /(\w+)=(?:'([^']*)'|"([^"]*)"|([^\s]+))/g;
    let match;

    while ((match = paramRegex.exec(paramString)) !== null) {
      const key = match[1];
      const value = match[2] || match[3] || match[4] || '';
      
      // Try to parse as JSON for objects/arrays/primitives
      try {
        if (value.startsWith('{') || value.startsWith('[') || 
            value === 'true' || value === 'false' || 
            /^\d+(\.\d+)?$/.test(value)) { // Support decimal numbers
          params[key] = JSON.parse(value);
        } else {
          params[key] = value;
        }
      } catch {
        // If JSON parsing fails, use as string
        params[key] = value;
      }
    }

    return params;
  }

  /**
   * Get supported plugin patterns for this handler
   * @returns {Array<string>} - Array of supported patterns
   */
  getSupportedPatterns() {
    return [
      '[{PluginName}]',
      '[{PluginName param=value}]',
      '[{PluginName param1=value1 param2=value2}]',
      '[{PluginName param=\'quoted value\'}]',
      '[{PluginName param="double quoted"}]'
    ];
  }

  /**
   * Get handler information for debugging
   * @returns {Object} - Handler information
   */
  getInfo() {
    return {
      ...super.getMetadata(),
      supportedPatterns: this.getSupportedPatterns(),
      features: [
        'Complex parameter parsing',
        'Quoted value support',
        'JSON parameter parsing',
        'Security validation',
        'Error recovery',
        'Performance tracking'
      ]
    };
  }
}

module.exports = PluginSyntaxHandler;
