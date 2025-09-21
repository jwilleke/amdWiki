/**
 * BaseSyntaxHandler - Abstract base class for all markup syntax handlers
 * 
 * Defines the contract that all syntax handlers must implement and provides
 * common utilities for pattern matching, parameter parsing, and error handling.
 * 
 * Related Issue: #56 - Handler Registration and Priority System
 * Epic: #41 - Implement JSPWikiMarkupParser for Complete Enhancement Support
 */
class BaseSyntaxHandler {
  /**
   * Create a syntax handler
   * @param {RegExp|string} pattern - Pattern to match (regex or string)
   * @param {number} priority - Handler priority (0-1000, higher = executed first)
   * @param {Object} options - Handler configuration options
   */
  constructor(pattern, priority = 100, options = {}) {
    if (new.target === BaseSyntaxHandler) {
      throw new Error('BaseSyntaxHandler is abstract and cannot be instantiated directly');
    }

    // Validate required parameters
    if (!pattern) {
      throw new Error('Pattern is required for syntax handler');
    }

    if (typeof priority !== 'number' || priority < 0 || priority > 1000) {
      throw new Error('Priority must be a number between 0 and 1000');
    }

    // Core handler properties
    this.priority = priority;
    this.options = {
      enabled: true,
      timeout: 5000, // 5 second timeout for handler execution
      caseSensitive: true,
      multiline: false,
      global: true,
      ...options
    };
    this.pattern = this.compilePattern(pattern);

    // Handler metadata
    this.handlerId = this.constructor.name;
    this.version = this.options.version || '1.0.0';
    this.description = this.options.description || '';
    this.dependencies = this.options.dependencies || [];

    // Performance tracking
    this.stats = {
      executionCount: 0,
      totalTime: 0,
      errorCount: 0,
      lastExecuted: null,
      averageTime: 0
    };

    // Handler state
    this.initialized = false;
    this.enabled = this.options.enabled;
  }

  /**
   * Compile pattern into RegExp if it's a string
   * @param {RegExp|string} pattern - Pattern to compile
   * @returns {RegExp} - Compiled regular expression
   */
  compilePattern(pattern) {
    if (pattern instanceof RegExp) {
      return pattern;
    }

    if (typeof pattern === 'string') {
      // Escape special regex characters if it's a plain string
      const escaped = pattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const flags = this.buildRegexFlags();
      return new RegExp(escaped, flags);
    }

    throw new Error('Pattern must be a RegExp or string');
  }

  /**
   * Build regex flags based on options
   * @returns {string} - Regex flags string
   */
  buildRegexFlags() {
    let flags = '';
    if (this.options.global) flags += 'g';
    if (!this.options.caseSensitive) flags += 'i';
    if (this.options.multiline) flags += 'm';
    return flags;
  }

  /**
   * Initialize the handler (optional override)
   * Called when handler is registered
   * @param {Object} context - Initialization context
   * @returns {Promise<void>}
   */
  async initialize(context = {}) {
    if (this.initialized) {
      return;
    }

    // Validate dependencies
    await this.validateDependencies(context);

    // Perform custom initialization
    await this.onInitialize(context);

    this.initialized = true;
  }

  /**
   * Custom initialization logic (override in subclasses)
   * @param {Object} context - Initialization context
   * @returns {Promise<void>}
   */
  async onInitialize(context) {
    // Override in subclasses for custom initialization
  }

  /**
   * Validate handler dependencies
   * @param {Object} context - Initialization context
   * @returns {Promise<void>}
   */
  async validateDependencies(context) {
    for (const dependency of this.dependencies) {
      if (typeof dependency === 'string') {
        // Check if manager is available
        if (context.engine && !context.engine.getManager(dependency)) {
          throw new Error(`Handler ${this.handlerId} requires ${dependency} manager`);
        }
      } else if (typeof dependency === 'object') {
        // Check specific dependency requirements
        await this.validateSpecificDependency(dependency, context);
      }
    }
  }

  /**
   * Validate specific dependency requirement
   * @param {Object} dependency - Dependency specification
   * @param {Object} context - Initialization context
   * @returns {Promise<void>}
   */
  async validateSpecificDependency(dependency, context) {
    const { type, name, version, optional = false } = dependency;

    if (type === 'manager') {
      const manager = context.engine?.getManager(name);
      if (!manager && !optional) {
        throw new Error(`Handler ${this.handlerId} requires ${name} manager`);
      }
    } else if (type === 'handler') {
      // Check if another handler is available
      const handler = context.handlerRegistry?.getHandler(name);
      if (!handler && !optional) {
        throw new Error(`Handler ${this.handlerId} requires ${name} handler`);
      }
    }
  }

  /**
   * Main processing method - MUST be implemented by subclasses
   * @param {string} content - Content to process
   * @param {ParseContext} context - Parse context
   * @returns {Promise<string>} - Processed content
   */
  async process(content, context) {
    throw new Error(`Handler ${this.handlerId} must implement process() method`);
  }

  /**
   * Handle a specific match - called for each pattern match
   * @param {Array} match - Regex match result
   * @param {ParseContext} context - Parse context
   * @returns {Promise<string>} - Replacement content
   */
  async handle(match, context) {
    throw new Error(`Handler ${this.handlerId} must implement handle() method`);
  }

  /**
   * Execute the handler with performance tracking and error handling
   * @param {string} content - Content to process
   * @param {ParseContext} context - Parse context
   * @returns {Promise<string>} - Processed content
   */
  async execute(content, context) {
    if (!this.enabled) {
      return content;
    }

    const startTime = Date.now();
    this.stats.executionCount++;

    try {
      // Set up timeout if specified
      const timeoutPromise = this.createTimeoutPromise();
      const processPromise = this.process(content, context);

      const result = await Promise.race([processPromise, timeoutPromise]);
      
      // Update performance stats
      const executionTime = Date.now() - startTime;
      this.stats.totalTime += executionTime;
      this.stats.averageTime = this.stats.totalTime / this.stats.executionCount;
      this.stats.lastExecuted = new Date();

      return result;

    } catch (error) {
      this.stats.errorCount++;
      
      // Create detailed error context
      const errorContext = this.createErrorContext(error, content, context);
      
      if (this.options.throwOnError !== false) {
        throw new HandlerExecutionError(
          `Handler ${this.handlerId} execution failed: ${error.message}`,
          this.handlerId,
          errorContext
        );
      }

      // Log error and return original content for graceful degradation
      console.error(`❌ Handler ${this.handlerId} failed:`, errorContext);
      return content;
    }
  }

  /**
   * Create timeout promise for handler execution
   * @returns {Promise} - Promise that rejects after timeout
   */
  createTimeoutPromise() {
    if (!this.options.timeout) {
      return new Promise(() => {}); // Never resolves
    }

    return new Promise((_, reject) => {
      setTimeout(() => {
        reject(new Error(`Handler ${this.handlerId} timed out after ${this.options.timeout}ms`));
      }, this.options.timeout);
    });
  }

  /**
   * Create error context for debugging
   * @param {Error} error - The error that occurred
   * @param {string} content - Content being processed
   * @param {ParseContext} context - Parse context
   * @returns {Object} - Error context
   */
  createErrorContext(error, content, context) {
    return {
      handlerId: this.handlerId,
      error: error.message,
      stack: error.stack,
      contentLength: content.length,
      contentPreview: content.substring(0, 100) + '...',
      context: {
        pageName: context.pageName,
        userName: context.userName,
        processingTime: context.getTotalTime()
      },
      stats: { ...this.stats },
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Parse parameters from parameter string
   * Handles various formats: key=value, key='value', key="value"
   * @param {string} paramString - Parameter string to parse
   * @returns {Object} - Parsed parameters
   */
  parseParameters(paramString) {
    if (!paramString || typeof paramString !== 'string') {
      return {};
    }

    const params = {};
    const paramRegex = /(\w+)=(?:'([^']*)'|"([^"]*)"|([^\s]+))/g;
    let match;

    while ((match = paramRegex.exec(paramString)) !== null) {
      const key = match[1];
      const value = match[2] || match[3] || match[4] || '';
      
      // Try to parse as JSON for complex values
      try {
        params[key] = JSON.parse(value);
      } catch {
        // If JSON parsing fails, use as string
        params[key] = value;
      }
    }

    return params;
  }

  /**
   * Validate parameters against schema
   * @param {Object} params - Parameters to validate
   * @param {Object} schema - Validation schema
   * @returns {Object} - Validation result
   */
  validateParameters(params, schema = {}) {
    const errors = [];
    const validated = {};

    for (const [key, rule] of Object.entries(schema)) {
      const value = params[key];
      const result = this.validateParameter(key, value, rule);
      
      if (result.error) {
        errors.push(result.error);
      } else {
        validated[key] = result.value;
      }
    }

    // Add any parameters not in schema
    for (const [key, value] of Object.entries(params)) {
      if (!(key in schema)) {
        validated[key] = value;
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      params: validated
    };
  }

  /**
   * Validate a single parameter
   * @param {string} key - Parameter key
   * @param {any} value - Parameter value
   * @param {Object} rule - Validation rule
   * @returns {Object} - Validation result
   */
  validateParameter(key, value, rule) {
    const { type, required = false, default: defaultValue, min, max, pattern } = rule;

    // Check if required parameter is missing
    if (required && (value === undefined || value === null || value === '')) {
      return { error: `Parameter '${key}' is required` };
    }

    // Use default value if not provided
    if (value === undefined && defaultValue !== undefined) {
      return { value: defaultValue };
    }

    // Skip validation if value is undefined/null and not required
    if (value === undefined || value === null) {
      return { value: value };
    }

    // Type validation
    if (type && typeof value !== type) {
      return { error: `Parameter '${key}' must be of type ${type}` };
    }

    // Range validation for numbers
    if (type === 'number') {
      if (min !== undefined && value < min) {
        return { error: `Parameter '${key}' must be >= ${min}` };
      }
      if (max !== undefined && value > max) {
        return { error: `Parameter '${key}' must be <= ${max}` };
      }
    }

    // Pattern validation for strings
    if (type === 'string' && pattern) {
      const regex = new RegExp(pattern);
      if (!regex.test(value)) {
        return { error: `Parameter '${key}' does not match required pattern` };
      }
    }

    return { value: value };
  }

  /**
   * Enable the handler
   */
  enable() {
    this.enabled = true;
  }

  /**
   * Disable the handler
   */
  disable() {
    this.enabled = false;
  }

  /**
   * Check if handler is enabled
   * @returns {boolean} - True if enabled
   */
  isEnabled() {
    return this.enabled;
  }

  /**
   * Get handler statistics
   * @returns {Object} - Handler statistics
   */
  getStats() {
    return {
      ...this.stats,
      handlerId: this.handlerId,
      priority: this.priority,
      enabled: this.enabled,
      initialized: this.initialized
    };
  }

  /**
   * Reset handler statistics
   */
  resetStats() {
    this.stats = {
      executionCount: 0,
      totalTime: 0,
      errorCount: 0,
      lastExecuted: null,
      averageTime: 0
    };
  }

  /**
   * Get handler metadata
   * @returns {Object} - Handler metadata
   */
  getMetadata() {
    return {
      id: this.handlerId,
      version: this.version,
      description: this.description,
      priority: this.priority,
      pattern: this.pattern.source,
      dependencies: this.dependencies,
      options: { ...this.options },
      stats: this.getStats()
    };
  }

  /**
   * Clean up handler resources (optional override)
   * Called when handler is unregistered
   * @returns {Promise<void>}
   */
  async shutdown() {
    await this.onShutdown();
    this.initialized = false;
  }

  /**
   * Custom shutdown logic (override in subclasses)
   * @returns {Promise<void>}
   */
  async onShutdown() {
    // Override in subclasses for custom cleanup
  }

  /**
   * Create a clone of this handler with different options
   * @param {Object} overrides - Option overrides
   * @returns {Object} - Handler configuration for creating new instance
   */
  clone(overrides = {}) {
    // Return a configuration object instead of trying to instantiate
    return {
      handlerId: overrides.handlerId || this.handlerId,
      pattern: this.pattern,
      priority: overrides.priority !== undefined ? overrides.priority : this.priority,
      options: { ...this.options, ...overrides },
      version: overrides.version || this.version,
      description: overrides.description || this.description,
      dependencies: [...this.dependencies]
    };
  }

  /**
   * String representation of handler
   * @returns {string} - String representation
   */
  toString() {
    return `${this.handlerId}(priority=${this.priority}, pattern=${this.pattern.source})`;
  }
}

/**
 * Custom error class for handler execution errors
 */
class HandlerExecutionError extends Error {
  constructor(message, handlerId, context) {
    super(message);
    this.name = 'HandlerExecutionError';
    this.handlerId = handlerId;
    this.context = context;
  }
}

module.exports = { BaseSyntaxHandler, HandlerExecutionError };
