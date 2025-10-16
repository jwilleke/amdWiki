/**
 * ParseContext - Context object for markup parsing operations
 * 
 * Provides access to page context, user information, engine managers,
 * and parsing state throughout the processing pipeline.
 * 
 * Related Issue: #55 - Core Infrastructure and Phase System
 */
class ParseContext {
  constructor(content, context, engine) {
    // Original content and processing context
    this.originalContent = content;

    // Handle nested structure from WikiContext.toParseOptions()
    // Context structure: { pageContext: { pageName, userContext, requestInfo }, engine }
    if (context.pageContext) {
      // Nested structure from WikiContext
      this.pageContext = context.pageContext;
      this.engine = context.engine || engine;

      // Extract from nested pageContext
      this.pageName = context.pageContext.pageName || 'unknown';
      this.userContext = context.pageContext.userContext || null;
      this.requestInfo = context.pageContext.requestInfo || null;

      // Extract userName from userContext if not directly provided
      this.userName = context.pageContext.userName ||
                      this.userContext?.username ||
                      this.userContext?.userName ||
                      'anonymous';
    } else {
      // Direct structure (legacy or alternative calling pattern)
      this.pageContext = context;
      this.engine = engine;

      this.pageName = context.pageName || 'unknown';
      this.userContext = context.userContext || null;
      this.requestInfo = context.requestInfo || null;

      // Extract userName from userContext if not directly provided
      this.userName = context.userName ||
                      this.userContext?.username ||
                      this.userContext?.userName ||
                      'anonymous';
    }

    // Processing state
    this.protectedBlocks = [];
    this.syntaxTokens = [];
    this.variables = new Map();
    this.handlerResults = new Map();
    this.metadata = {};

    // Performance tracking
    this.startTime = Date.now();
    this.phaseTimings = new Map();
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
   * Check if user is authenticated
   * @returns {boolean} - True if user is authenticated
   */
  isAuthenticated() {
    return this.userContext && this.userContext.isAuthenticated;
  }

  /**
   * Check if user has specific permission
   * @param {string} permission - Permission to check
   * @param {string} resource - Resource context (optional)
   * @returns {boolean} - True if user has permission
   */
  hasPermission(permission, resource = null) {
    if (!this.userContext) {
      return false;
    }

    const policyManager = this.getManager('PolicyManager');
    if (policyManager) {
      // Use PolicyManager for permission checks
      return policyManager.checkPermission(this.userContext, permission, resource);
    }

    // Fallback to basic permission check
    return this.userContext.permissions && this.userContext.permissions.includes(permission);
  }

  /**
   * Get user roles
   * @returns {Array<string>} - Array of user roles
   */
  getUserRoles() {
    if (!this.userContext) {
      return [];
    }
    return this.userContext.roles || [];
  }

  /**
   * Check if user has specific role
   * @param {string} role - Role to check
   * @returns {boolean} - True if user has role
   */
  hasRole(role) {
    return this.getUserRoles().includes(role);
  }

  /**
   * Set variable value
   * @param {string} name - Variable name
   * @param {any} value - Variable value
   */
  setVariable(name, value) {
    this.variables.set(name, value);
  }

  /**
   * Get variable value
   * @param {string} name - Variable name
   * @param {any} defaultValue - Default value if not found
   * @returns {any} - Variable value
   */
  getVariable(name, defaultValue = null) {
    return this.variables.get(name) || defaultValue;
  }

  /**
   * Store handler result
   * @param {string} handlerId - Handler identifier
   * @param {any} result - Handler result
   */
  setHandlerResult(handlerId, result) {
    this.handlerResults.set(handlerId, result);
  }

  /**
   * Get handler result
   * @param {string} handlerId - Handler identifier
   * @returns {any} - Handler result or null
   */
  getHandlerResult(handlerId) {
    return this.handlerResults.get(handlerId) || null;
  }

  /**
   * Set metadata value
   * @param {string} key - Metadata key
   * @param {any} value - Metadata value
   */
  setMetadata(key, value) {
    this.metadata[key] = value;
  }

  /**
   * Get metadata value
   * @param {string} key - Metadata key
   * @param {any} defaultValue - Default value if not found
   * @returns {any} - Metadata value
   */
  getMetadata(key, defaultValue = null) {
    return this.metadata[key] || defaultValue;
  }

  /**
   * Record phase timing
   * @param {string} phaseName - Name of phase
   * @param {number} duration - Duration in milliseconds
   */
  recordPhaseTiming(phaseName, duration) {
    this.phaseTimings.set(phaseName, duration);
  }

  /**
   * Get phase timing
   * @param {string} phaseName - Name of phase
   * @returns {number} - Duration in milliseconds or 0
   */
  getPhaseTiming(phaseName) {
    return this.phaseTimings.get(phaseName) || 0;
  }

  /**
   * Get total processing time
   * @returns {number} - Total time in milliseconds
   */
  getTotalTime() {
    return Date.now() - this.startTime;
  }

  /**
   * Clone context for sub-processing
   * @param {Object} overrides - Properties to override
   * @returns {ParseContext} - New context instance
   */
  clone(overrides = {}) {
    const newContext = new ParseContext(
      this.originalContent,
      { ...this.pageContext, ...overrides },
      this.engine
    );

    // Copy current state
    newContext.protectedBlocks = [...this.protectedBlocks];
    newContext.syntaxTokens = [...this.syntaxTokens];
    newContext.variables = new Map(this.variables);
    newContext.metadata = { ...this.metadata };

    return newContext;
  }

  /**
   * Create error context for debugging
   * @param {Error} error - Error that occurred
   * @param {string} phase - Phase where error occurred
   * @returns {Object} - Error context
   */
  createErrorContext(error, phase) {
    return {
      error: error.message,
      phase: phase,
      pageName: this.pageName,
      userName: this.userName,
      processingTime: this.getTotalTime(),
      contentLength: this.originalContent.length,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Get context summary for logging
   * @returns {Object} - Context summary
   */
  getSummary() {
    return {
      pageName: this.pageName,
      userName: this.userName,
      authenticated: this.isAuthenticated(),
      roles: this.getUserRoles(),
      contentLength: this.originalContent.length,
      variableCount: this.variables.size,
      handlerResultCount: this.handlerResults.size,
      processingTime: this.getTotalTime(),
      phaseCount: this.phaseTimings.size
    };
  }

  /**
   * Export context data for caching
   * @returns {Object} - Serializable context data
   */
  exportForCache() {
    return {
      pageName: this.pageName,
      userName: this.userName,
      userContext: this.userContext ? {
        isAuthenticated: this.userContext.isAuthenticated,
        roles: this.userContext.roles || [],
        permissions: this.userContext.permissions || []
      } : null,
      variables: Object.fromEntries(this.variables),
      metadata: this.metadata,
      timestamp: Date.now()
    };
  }

  /**
   * Import context data from cache
   * @param {Object} data - Cached context data
   */
  importFromCache(data) {
    if (data.variables) {
      this.variables = new Map(Object.entries(data.variables));
    }
    if (data.metadata) {
      this.metadata = { ...data.metadata };
    }
  }
}

module.exports = ParseContext;
