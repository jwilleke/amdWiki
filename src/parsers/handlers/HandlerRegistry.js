const { BaseSyntaxHandler } = require('./BaseSyntaxHandler');

/**
 * HandlerRegistry - Advanced handler registration and management system
 * 
 * Provides sophisticated handler registration with priority management,
 * conflict detection, dependency resolution, and dynamic loading capabilities.
 * 
 * Related Issue: #56 - Handler Registration and Priority System
 * Epic: #41 - Implement JSPWikiMarkupParser for Complete Enhancement Support
 */
class HandlerRegistry {
  constructor(engine = null) {
    this.engine = engine;
    this.handlers = new Map(); // handlerId -> handler instance
    this.handlersByPriority = []; // sorted array of handlers
    this.handlersByPattern = new Map(); // pattern -> handler
    this.dependencyGraph = new Map(); // handlerId -> [dependent handlerIds]
    
    // Registry configuration
    this.config = {
      maxHandlers: 100,
      allowDuplicatePriorities: true,
      enableDependencyResolution: true,
      enableConflictDetection: true,
      defaultTimeout: 5000
    };

    // Registry statistics
    this.stats = {
      registeredHandlers: 0,
      activeHandlers: 0,
      totalExecutions: 0,
      totalErrors: 0,
      lastRegistration: null,
      lastUnregistration: null
    };
  }

  /**
   * Register a syntax handler with full validation and conflict detection
   * @param {BaseSyntaxHandler} handler - Handler to register
   * @param {Object} options - Registration options
   * @returns {Promise<boolean>} - True if registration successful
   */
  async registerHandler(handler, options = {}) {
    // Validate handler
    this.validateHandler(handler);

    // Check for conflicts if enabled
    if (this.config.enableConflictDetection) {
      const conflicts = this.detectConflicts(handler);
      if (conflicts.length > 0 && !options.forceRegister) {
        throw new HandlerRegistrationError(
          `Handler ${handler.handlerId} conflicts with existing handlers: ${conflicts.map(h => h.handlerId).join(', ')}`,
          'CONFLICT_DETECTED',
          { handler, conflicts }
        );
      }
    }

    // Check handler limit
    if (this.handlers.size >= this.config.maxHandlers) {
      throw new HandlerRegistrationError(
        `Cannot register handler ${handler.handlerId}: maximum handler limit (${this.config.maxHandlers}) reached`,
        'LIMIT_EXCEEDED',
        { handler, limit: this.config.maxHandlers }
      );
    }

    try {
      // Initialize handler
      const initContext = {
        engine: this.engine,
        handlerRegistry: this,
        registrationOptions: options
      };
      await handler.initialize(initContext);

      // Register in maps
      this.handlers.set(handler.handlerId, handler);
      this.handlersByPattern.set(handler.pattern.source, handler);

      // Rebuild priority-sorted list
      this.rebuildPriorityList();

      // Update dependency graph
      if (this.config.enableDependencyResolution) {
        this.updateDependencyGraph(handler);
      }

      // Update statistics
      this.stats.registeredHandlers++;
      this.stats.activeHandlers++;
      this.stats.lastRegistration = new Date();

      console.log(`🔧 Registered syntax handler: ${handler.handlerId} (priority: ${handler.priority})`);
      return true;

    } catch (error) {
      // Clean up on initialization failure
      this.handlers.delete(handler.handlerId);
      this.handlersByPattern.delete(handler.pattern.source);
      
      throw new HandlerRegistrationError(
        `Failed to register handler ${handler.handlerId}: ${error.message}`,
        'INITIALIZATION_FAILED',
        { handler, originalError: error }
      );
    }
  }

  /**
   * Unregister a syntax handler
   * @param {string} handlerId - ID of handler to unregister
   * @returns {Promise<boolean>} - True if unregistration successful
   */
  async unregisterHandler(handlerId) {
    const handler = this.handlers.get(handlerId);
    if (!handler) {
      return false; // Handler not found
    }

    try {
      // Check for dependents
      const dependents = this.getDependentHandlers(handlerId);
      if (dependents.length > 0) {
        throw new HandlerRegistrationError(
          `Cannot unregister handler ${handlerId}: other handlers depend on it: ${dependents.map(h => h.handlerId).join(', ')}`,
          'HAS_DEPENDENTS',
          { handler, dependents }
        );
      }

      // Shutdown handler
      await handler.shutdown();

      // Remove from maps
      this.handlers.delete(handlerId);
      this.handlersByPattern.delete(handler.pattern.source);

      // Rebuild priority list
      this.rebuildPriorityList();

      // Update dependency graph
      this.dependencyGraph.delete(handlerId);

      // Update statistics
      this.stats.activeHandlers--;
      this.stats.lastUnregistration = new Date();

      console.log(`🗑️  Unregistered syntax handler: ${handlerId}`);
      return true;

    } catch (error) {
      throw new HandlerRegistrationError(
        `Failed to unregister handler ${handlerId}: ${error.message}`,
        'UNREGISTRATION_FAILED',
        { handler, originalError: error }
      );
    }
  }

  /**
   * Validate handler before registration
   * @param {BaseSyntaxHandler} handler - Handler to validate
   */
  validateHandler(handler) {
    if (!handler) {
      throw new HandlerRegistrationError('Handler cannot be null or undefined', 'INVALID_HANDLER');
    }

    if (!(handler instanceof BaseSyntaxHandler)) {
      throw new HandlerRegistrationError(
        'Handler must extend BaseSyntaxHandler',
        'INVALID_TYPE',
        { handler }
      );
    }

    if (!handler.handlerId || typeof handler.handlerId !== 'string') {
      throw new HandlerRegistrationError(
        'Handler must have a valid handlerId',
        'INVALID_ID',
        { handler }
      );
    }

    if (this.handlers.has(handler.handlerId)) {
      throw new HandlerRegistrationError(
        `Handler with ID ${handler.handlerId} is already registered`,
        'DUPLICATE_ID',
        { handler }
      );
    }

    if (typeof handler.priority !== 'number' || handler.priority < 0 || handler.priority > 1000) {
      throw new HandlerRegistrationError(
        'Handler priority must be a number between 0 and 1000',
        'INVALID_PRIORITY',
        { handler }
      );
    }

    if (!handler.pattern || !(handler.pattern instanceof RegExp)) {
      throw new HandlerRegistrationError(
        'Handler must have a valid RegExp pattern',
        'INVALID_PATTERN',
        { handler }
      );
    }

    // Validate that required methods are implemented
    const requiredMethods = ['process', 'handle'];
    for (const method of requiredMethods) {
      if (typeof handler[method] !== 'function') {
        throw new HandlerRegistrationError(
          `Handler must implement ${method}() method`,
          'MISSING_METHOD',
          { handler, method }
        );
      }
    }
  }

  /**
   * Detect conflicts with existing handlers
   * @param {BaseSyntaxHandler} newHandler - New handler to check
   * @returns {Array<BaseSyntaxHandler>} - Array of conflicting handlers
   */
  detectConflicts(newHandler) {
    const conflicts = [];

    for (const existingHandler of this.handlers.values()) {
      if (this.handlersConflict(newHandler, existingHandler)) {
        conflicts.push(existingHandler);
      }
    }

    return conflicts;
  }

  /**
   * Check if two handlers conflict
   * @param {BaseSyntaxHandler} handler1 - First handler
   * @param {BaseSyntaxHandler} handler2 - Second handler
   * @returns {boolean} - True if handlers conflict
   */
  handlersConflict(handler1, handler2) {
    // Same pattern source and flags indicates potential conflict
    if (handler1.pattern.source === handler2.pattern.source && 
        handler1.pattern.flags === handler2.pattern.flags) {
      return true;
    }

    return false;
  }

  /**
   * Rebuild the priority-sorted handler list
   */
  rebuildPriorityList() {
    this.handlersByPriority = Array.from(this.handlers.values())
      .filter(handler => handler.isEnabled())
      .sort((a, b) => {
        // Sort by priority (higher first), then by registration order
        if (b.priority !== a.priority) {
          return b.priority - a.priority;
        }
        // Use handlerId as tiebreaker for consistent ordering
        return a.handlerId.localeCompare(b.handlerId);
      });
  }

  /**
   * Update dependency graph when handler is registered
   * @param {BaseSyntaxHandler} handler - Handler being registered
   */
  updateDependencyGraph(handler) {
    // Add handler to graph
    if (!this.dependencyGraph.has(handler.handlerId)) {
      this.dependencyGraph.set(handler.handlerId, []);
    }

    // Process handler dependencies
    for (const dependency of handler.dependencies) {
      if (typeof dependency === 'string') {
        // Simple manager dependency
        continue;
      } else if (dependency.type === 'handler') {
        // Handler dependency
        const depHandlerId = dependency.name;
        if (!this.dependencyGraph.has(depHandlerId)) {
          this.dependencyGraph.set(depHandlerId, []);
        }
        this.dependencyGraph.get(depHandlerId).push(handler.handlerId);
      }
    }
  }

  /**
   * Get handlers that depend on the specified handler
   * @param {string} handlerId - Handler ID
   * @returns {Array<BaseSyntaxHandler>} - Dependent handlers
   */
  getDependentHandlers(handlerId) {
    const dependentIds = this.dependencyGraph.get(handlerId) || [];
    return dependentIds
      .map(id => this.handlers.get(id))
      .filter(handler => handler); // Filter out undefined handlers
  }

  /**
   * Get handler by ID
   * @param {string} handlerId - Handler ID
   * @returns {BaseSyntaxHandler|null} - Handler or null if not found
   */
  getHandler(handlerId) {
    return this.handlers.get(handlerId) || null;
  }

  /**
   * Get all handlers sorted by priority
   * @param {boolean} enabledOnly - Only return enabled handlers
   * @returns {Array<BaseSyntaxHandler>} - Handlers sorted by priority
   */
  getHandlersByPriority(enabledOnly = true) {
    if (enabledOnly) {
      return this.handlersByPriority;
    }
    
    return Array.from(this.handlers.values())
      .sort((a, b) => b.priority - a.priority);
  }

  /**
   * Get handlers by pattern
   * @param {string|RegExp} pattern - Pattern to match
   * @returns {Array<BaseSyntaxHandler>} - Matching handlers
   */
  getHandlersByPattern(pattern) {
    const patternStr = pattern instanceof RegExp ? pattern.source : pattern.toString();
    const handlers = [];

    for (const handler of this.handlers.values()) {
      if (handler.pattern.source === patternStr) {
        handlers.push(handler);
      }
    }

    return handlers;
  }

  /**
   * Enable handler by ID
   * @param {string} handlerId - Handler ID
   * @returns {boolean} - True if successful
   */
  enableHandler(handlerId) {
    const handler = this.handlers.get(handlerId);
    if (handler) {
      handler.enable();
      this.rebuildPriorityList();
      return true;
    }
    return false;
  }

  /**
   * Disable handler by ID
   * @param {string} handlerId - Handler ID
   * @returns {boolean} - True if successful
   */
  disableHandler(handlerId) {
    const handler = this.handlers.get(handlerId);
    if (handler) {
      handler.disable();
      this.rebuildPriorityList();
      return true;
    }
    return false;
  }

  /**
   * Get registry statistics
   * @returns {Object} - Registry statistics
   */
  getStats() {
    const handlerStats = {};
    for (const [id, handler] of this.handlers) {
      handlerStats[id] = handler.getStats();
      this.stats.totalExecutions += handler.stats.executionCount;
      this.stats.totalErrors += handler.stats.errorCount;
    }

    return {
      registry: {
        ...this.stats,
        enabledHandlers: this.handlersByPriority.length,
        disabledHandlers: this.handlers.size - this.handlersByPriority.length,
        totalHandlers: this.handlers.size
      },
      handlers: handlerStats,
      config: { ...this.config }
    };
  }

  /**
   * Reset all handler statistics
   */
  resetStats() {
    this.stats = {
      registeredHandlers: this.handlers.size,
      activeHandlers: this.handlersByPriority.length,
      totalExecutions: 0,
      totalErrors: 0,
      lastRegistration: null,
      lastUnregistration: null
    };

    // Reset individual handler stats
    for (const handler of this.handlers.values()) {
      handler.resetStats();
    }
  }

  /**
   * Resolve handler execution order considering dependencies
   * @returns {Array<BaseSyntaxHandler>} - Handlers in dependency-resolved order
   */
  resolveExecutionOrder() {
    if (!this.config.enableDependencyResolution) {
      return this.getHandlersByPriority();
    }

    const resolved = [];
    const visited = new Set();
    const visiting = new Set();

    const visit = (handlerId) => {
      if (visiting.has(handlerId)) {
        throw new Error(`Circular dependency detected involving handler: ${handlerId}`);
      }
      
      if (visited.has(handlerId)) {
        return;
      }

      visiting.add(handlerId);

      const handler = this.handlers.get(handlerId);
      if (handler && handler.isEnabled()) {
        // Visit dependencies first
        for (const dependency of handler.dependencies) {
          if (dependency.type === 'handler') {
            visit(dependency.name);
          }
        }

        resolved.push(handler);
        visited.add(handlerId);
      }

      visiting.delete(handlerId);
    };

    // Visit all handlers
    for (const handlerId of this.handlers.keys()) {
      if (!visited.has(handlerId)) {
        try {
          visit(handlerId);
        } catch (error) {
          console.error(`❌ Dependency resolution error for handler ${handlerId}:`, error.message);
        }
      }
    }

    // Sort resolved handlers by priority within dependency constraints
    return resolved.sort((a, b) => b.priority - a.priority);
  }

  /**
   * Validate all handler dependencies
   * @returns {Array<Object>} - Array of dependency validation errors
   */
  validateDependencies() {
    const errors = [];

    for (const handler of this.handlers.values()) {
      for (const dependency of handler.dependencies) {
        if (dependency.type === 'handler') {
          const depHandler = this.handlers.get(dependency.name);
          if (!depHandler && !dependency.optional) {
            errors.push({
              handlerId: handler.handlerId,
              dependencyType: 'handler',
              dependencyName: dependency.name,
              error: 'Required handler dependency not found'
            });
          }
        }
      }
    }

    return errors;
  }

  /**
   * Clear all handlers
   * @returns {Promise<void>}
   */
  async clearAll() {
    const handlerIds = Array.from(this.handlers.keys());
    
    for (const handlerId of handlerIds) {
      try {
        await this.unregisterHandler(handlerId);
      } catch (error) {
        console.error(`❌ Failed to unregister handler ${handlerId}:`, error.message);
      }
    }

    // Clear all data structures
    this.handlers.clear();
    this.handlersByPriority = [];
    this.handlersByPattern.clear();
    this.dependencyGraph.clear();
    
    this.resetStats();
  }

  /**
   * Export registry state for persistence
   * @returns {Object} - Serializable registry state
   */
  exportState() {
    return {
      config: { ...this.config },
      stats: { ...this.stats },
      handlers: Array.from(this.handlers.values()).map(handler => handler.getMetadata()),
      dependencies: Object.fromEntries(this.dependencyGraph)
    };
  }

  /**
   * Get registry information
   * @returns {Object} - Registry information
   */
  getInfo() {
    return {
      handlerCount: this.handlers.size,
      activeHandlerCount: this.handlersByPriority.length,
      config: { ...this.config },
      stats: { ...this.stats }
    };
  }
}

/**
 * Custom error class for handler registration errors
 */
class HandlerRegistrationError extends Error {
  constructor(message, code, context = {}) {
    super(message);
    this.name = 'HandlerRegistrationError';
    this.code = code;
    this.context = context;
  }
}

module.exports = { HandlerRegistry, HandlerRegistrationError };
