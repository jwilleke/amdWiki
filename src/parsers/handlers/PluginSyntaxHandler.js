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
  constructor(engine = null) {
    super(
      /\[\{(\w+)\s*([^}]*)\}\]/g, // Pattern: [{PluginName params}]
      90, // High priority - process before most other handlers
      {
        description: 'Enhanced JSPWiki-style plugin syntax handler with advanced parameter parsing',
        version: '2.0.0',
        dependencies: ['PluginManager'],
        timeout: 10000, // 10 second timeout for plugin execution
        cacheEnabled: true
      }
    );
    this.handlerId = 'PluginSyntaxHandler';
    this.engine = engine;
    this.config = null;
  }

  /**
   * Initialize handler with configuration
   * @param {Object} context - Initialization context
   */
  async onInitialize(context) {
    this.engine = context.engine;
    
    // Load handler-specific configuration
    const markupParser = context.engine?.getManager('MarkupParser');
    if (markupParser) {
      this.config = markupParser.getHandlerConfig('plugin');
      
      // Override priority if configured
      if (this.config.priority && this.config.priority !== this.priority) {
        this.priority = this.config.priority;
        console.log(`🔧 PluginSyntaxHandler priority set to ${this.priority} from configuration`);
      }
    }
  }

  /**
   * Process content by finding and executing all plugin instances
   * Supports both simple [{Plugin}] and body syntax [{Plugin}]content[/{Plugin}]
   * @param {string} content - Content to process
   * @param {ParseContext} context - Parse context
   * @returns {Promise<string>} - Content with plugins executed
   */
  async process(content, context) {
    if (!content) {
      return content;
    }

    // First pass: Handle body-style plugins [{Plugin}]content[/{Plugin}]
    content = await this.processBodyPlugins(content, context);

    // Second pass: Handle simple plugins [{Plugin params}]
    const matches = [];
    let match;

    // Reset regex state
    this.pattern.lastIndex = 0;

    while ((match = this.pattern.exec(content)) !== null) {
      matches.push({
        fullMatch: match[0],
        pluginName: match[1],
        paramString: match[2] || '',
        bodyContent: null, // No body for simple plugins
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
        console.error(`❌ Stack:`, error.stack);

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
   * Process body-style plugins: [{Plugin}]content[/{Plugin}]
   * @param {string} content - Content to process
   * @param {ParseContext} context - Parse context
   * @returns {Promise<string>} - Content with body plugins processed
   */
  async processBodyPlugins(content, context) {
    // Pattern for body plugins: [{PluginName params}]body content[/{PluginName}]
    const bodyPluginRegex = /\[\{(\w+)\s*([^}]*)\}\](.*?)\[\{\/\1\}\]/gs;
    
    const bodyMatches = [];
    let match;
    
    while ((match = bodyPluginRegex.exec(content)) !== null) {
      bodyMatches.push({
        fullMatch: match[0],
        pluginName: match[1],
        paramString: match[2] || '',
        bodyContent: match[3] || '',
        index: match.index,
        length: match[0].length
      });
    }

    // Process body matches in reverse order
    let processedContent = content;
    
    for (let i = bodyMatches.length - 1; i >= 0; i--) {
      const matchInfo = bodyMatches[i];
      
      try {
        const replacement = await this.handle(matchInfo, context);
        
        processedContent = 
          processedContent.slice(0, matchInfo.index) +
          replacement +
          processedContent.slice(matchInfo.index + matchInfo.length);
          
      } catch (error) {
        console.error(`❌ Body plugin execution error for ${matchInfo.pluginName}:`, error.message);
        
        const errorPlaceholder = `<!-- Body Plugin Error: ${matchInfo.pluginName} - ${error.message} -->`;
        processedContent = 
          processedContent.slice(0, matchInfo.index) +
          errorPlaceholder +
          processedContent.slice(matchInfo.index + matchInfo.length);
      }
    }

    return processedContent;
  }

  /**
   * Handle a specific plugin match with caching support
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

    // Check cache for plugin result if caching enabled
    let cachedResult = null;
    const contentHash = this.generateContentHash(matchInfo.fullMatch);
    const contextHash = this.generateContextHash(context);
    
    if (this.options.cacheEnabled) {
      const markupParser = this.engine?.getManager('MarkupParser');
      if (markupParser) {
        cachedResult = await markupParser.getCachedHandlerResult(this.handlerId, contentHash, contextHash);
        if (cachedResult) {
          return cachedResult;
        }
      }
    }

    // Get PluginManager
    const pluginManager = context.getManager('PluginManager');
    if (!pluginManager) {
      throw new Error('PluginManager not available');
    }

    // Create enhanced plugin execution context
    const pluginContext = {
      pageName: context.pageName,
      userName: context.userName,
      userContext: context.userContext,
      requestInfo: context.requestInfo,
      engine: context.engine,

      // Enhanced context for JSPWiki compatibility
      wikiContext: context,
      parameters: validation.params,
      bodyContent: matchInfo.bodyContent || null, // Support for body plugins
      handlerId: this.handlerId,
      markupParser: this.engine?.getManager('MarkupParser'),

      // Link graph for plugins like ReferringPagesPlugin
      linkGraph: this.getLinkGraph(),

      // Additional JSPWiki-compatible context
      hasBody: matchInfo.bodyContent !== null,
      pluginName: pluginName,
      originalMatch: matchInfo.fullMatch
    };

    // Execute plugin with timeout
    const executionPromise = pluginManager.execute(pluginName, context.pageName, validation.params, pluginContext);
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error(`Plugin ${pluginName} execution timeout`)), this.options.timeout);
    });

    const result = await Promise.race([executionPromise, timeoutPromise]) || '';
    
    // Cache the result if caching enabled
    if (this.options.cacheEnabled && result) {
      const markupParser = this.engine?.getManager('MarkupParser');
      if (markupParser) {
        await markupParser.cacheHandlerResult(this.handlerId, contentHash, contextHash, result);
      }
    }
    
    return result;
  }

  /**
   * Generate content hash for caching
   * @param {string} content - Content to hash
   * @returns {string} - Content hash
   */
  generateContentHash(content) {
    const crypto = require('crypto');
    return crypto.createHash('md5').update(content).digest('hex');
  }

  /**
   * Generate context hash for caching
   * @param {ParseContext} context - Parse context
   * @returns {string} - Context hash
   */
  generateContextHash(context) {
    const crypto = require('crypto');
    const contextData = {
      pageName: context.pageName,
      userName: context.userName,
      authenticated: context.isAuthenticated(),
      roles: context.getUserRoles(),
      // Round timestamp to 5-minute buckets for cache efficiency
      timeBucket: Math.floor(Date.now() / 300000)
    };
    
    return crypto.createHash('md5').update(JSON.stringify(contextData)).digest('hex');
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
    // Enhanced regex to handle quoted values with spaces, special characters, and escaped quotes
    // Matches: key='value with \'escaped\' quotes' or key="value" or key=unquoted
    const paramRegex = /(\w+)=(?:'((?:[^'\\]|\\.)*)'|"((?:[^"\\]|\\.)*)"|([^\s]+))/g;
    let match;

    while ((match = paramRegex.exec(paramString)) !== null) {
      const key = match[1];
      let value = match[2] || match[3] || match[4] || '';

      // Unescape escaped quotes in the value
      if (match[2] || match[3]) {
        value = value.replace(/\\'/g, "'").replace(/\\"/g, '"').replace(/\\\\/g, '\\');
      }

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
      '[{PluginName param="double quoted"}]',
      '[{PluginName}]body content[/{PluginName}]',
      '[{PluginName param=value}]body content with params[/{PluginName}]'
    ];
  }

  /**
   * Get link graph from RenderingManager
   * @returns {Object} - Link graph object
   */
  getLinkGraph() {
    try {
      const renderingManager = this.engine?.getManager('RenderingManager');
      return renderingManager?.getLinkGraph() || {};
    } catch (error) {
      console.warn('Failed to get link graph for plugin execution:', error.message);
      return {};
    }
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
        'Performance tracking',
        'Link graph integration'
      ]
    };
  }
}

module.exports = PluginSyntaxHandler;
