/**
 * HandlerRegistry - Advanced handler registration and management system
 *
 * Provides sophisticated handler registration with priority management,
 * conflict detection, dependency resolution, and dynamic loading capabilities.
 *
 * Related Issue: #56 - Handler Registration and Priority System
 * Epic: #41 - Implement JSPWikiMarkupParser for Complete Enhancement Support
 */

import BaseSyntaxHandler from './BaseSyntaxHandler';
import type { DependencySpec } from './BaseSyntaxHandler';

// Re-export for use in type assertions
export type { DependencySpec };

/**
 * Handler registry configuration
 */
export interface RegistryConfig {
  maxHandlers: number;
  allowDuplicatePriorities: boolean;
  enableDependencyResolution: boolean;
  enableConflictDetection: boolean;
  defaultTimeout: number;
}

/**
 * Handler registry statistics
 */
export interface RegistryStats {
  registeredHandlers: number;
  activeHandlers: number;
  totalExecutions: number;
  totalErrors: number;
  lastRegistration: Date | null;
  lastUnregistration: Date | null;
}

/**
 * Handler registration options
 */
export interface RegistrationOptions {
  forceRegister?: boolean;
  [key: string]: unknown;
}

/**
 * Initialization context for handlers
 */
export interface HandlerInitContext {
  engine: WikiEngine | undefined;
  handlerRegistry: HandlerRegistry;
  registrationOptions: RegistrationOptions;
}

/**
 * WikiEngine minimal interface (until fully typed)
 */
export interface WikiEngine {
  getManager(name: string): unknown;
}

/**
 * Dependency validation error
 */
export interface DependencyValidationError {
  handlerId: string;
  dependencyType: 'handler' | 'manager';
  dependencyName: string;
  error: string;
}

/**
 * Exported registry state
 */
export interface ExportedRegistryState {
  config: RegistryConfig;
  stats: RegistryStats;
  handlers: unknown[];
  dependencies: Record<string, string[]>;
}

/**
 * Registry information summary
 */
export interface RegistryInfo {
  handlerCount: number;
  activeHandlerCount: number;
  config: RegistryConfig;
  stats: RegistryStats;
}

/**
 * Extended registry statistics with handler details
 */
export interface ExtendedRegistryStats {
  registry: RegistryStats & {
    enabledHandlers: number;
    disabledHandlers: number;
    totalHandlers: number;
  };
  handlers: Record<string, unknown>;
  config: RegistryConfig;
}

/**
 * HandlerRegistry - Advanced handler registration and management system
 */
class HandlerRegistry {
  private engine: WikiEngine | null;
  private handlers: Map<string, BaseSyntaxHandler>;
  private handlersByPriority: BaseSyntaxHandler[];
  private handlersByPattern: Map<string, BaseSyntaxHandler>;
  private dependencyGraph: Map<string, string[]>;
  private config: RegistryConfig;
  private stats: RegistryStats;

  constructor(engine: WikiEngine | null = null) {
    this.engine = engine;
    this.handlers = new Map();
    this.handlersByPriority = [];
    this.handlersByPattern = new Map();
    this.dependencyGraph = new Map();

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
   * @param handler - Handler to register
   * @param options - Registration options
   * @returns True if registration successful
   */
  async registerHandler(handler: BaseSyntaxHandler, options: RegistrationOptions = {}): Promise<boolean> {
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
      const initContext: HandlerInitContext = {
        engine: this.engine ?? undefined,
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

      // eslint-disable-next-line no-console
      console.log(`🔧 Registered syntax handler: ${handler.handlerId} (priority: ${handler.priority})`);
      return true;

    } catch (error) {
      // Clean up on initialization failure
      this.handlers.delete(handler.handlerId);
      this.handlersByPattern.delete(handler.pattern.source);

      throw new HandlerRegistrationError(
        `Failed to register handler ${handler.handlerId}: ${(error as Error).message}`,
        'INITIALIZATION_FAILED',
        { handler, originalError: error }
      );
    }
  }

  /**
   * Unregister a syntax handler
   * @param handlerId - ID of handler to unregister
   * @returns True if unregistration successful
   */
  async unregisterHandler(handlerId: string): Promise<boolean> {
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

      // eslint-disable-next-line no-console
      console.log(`🗑️  Unregistered syntax handler: ${handlerId}`);
      return true;

    } catch (error) {
      throw new HandlerRegistrationError(
        `Failed to unregister handler ${handlerId}: ${(error as Error).message}`,
        'UNREGISTRATION_FAILED',
        { handler, originalError: error }
      );
    }
  }

  /**
   * Validate handler before registration
   * @param handler - Handler to validate
   */
  private validateHandler(handler: BaseSyntaxHandler): void {
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
    const requiredMethods: Array<keyof BaseSyntaxHandler> = ['process', 'handle'];
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
   * @param newHandler - New handler to check
   * @returns Array of conflicting handlers
   */
  private detectConflicts(newHandler: BaseSyntaxHandler): BaseSyntaxHandler[] {
    const conflicts: BaseSyntaxHandler[] = [];

    for (const existingHandler of this.handlers.values()) {
      if (this.handlersConflict(newHandler, existingHandler)) {
        conflicts.push(existingHandler);
      }
    }

    return conflicts;
  }

  /**
   * Check if two handlers conflict
   * @param handler1 - First handler
   * @param handler2 - Second handler
   * @returns True if handlers conflict
   */
  private handlersConflict(handler1: BaseSyntaxHandler, handler2: BaseSyntaxHandler): boolean {
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
  private rebuildPriorityList(): void {
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
   * @param handler - Handler being registered
   */
  private updateDependencyGraph(handler: BaseSyntaxHandler): void {
    // Add handler to graph
    if (!this.dependencyGraph.has(handler.handlerId)) {
      this.dependencyGraph.set(handler.handlerId, []);
    }

    // Process handler dependencies
    for (const dependency of handler.dependencies) {
      if (typeof dependency === 'string') {
        // Simple manager dependency
        continue;
      } else if ((dependency).type === 'handler') {
        // Handler dependency
        const depHandlerId = (dependency).name;
        if (!this.dependencyGraph.has(depHandlerId)) {
          this.dependencyGraph.set(depHandlerId, []);
        }
        const dependents = this.dependencyGraph.get(depHandlerId);
        if (dependents && !dependents.includes(handler.handlerId)) {
          dependents.push(handler.handlerId);
        }
      }
    }
  }

  /**
   * Get handlers that depend on the specified handler
   * @param handlerId - Handler ID
   * @returns Dependent handlers
   */
  private getDependentHandlers(handlerId: string): BaseSyntaxHandler[] {
    const dependentIds = this.dependencyGraph.get(handlerId) || [];
    return dependentIds
      .map(id => this.handlers.get(id))
      .filter((handler): handler is BaseSyntaxHandler => handler !== undefined);
  }

  /**
   * Get handler by ID
   * @param handlerId - Handler ID
   * @returns Handler or null if not found
   */
  getHandler(handlerId: string): BaseSyntaxHandler | null {
    return this.handlers.get(handlerId) ?? null;
  }

  /**
   * Get all handlers sorted by priority
   * @param enabledOnly - Only return enabled handlers
   * @returns Handlers sorted by priority
   */
  getHandlersByPriority(enabledOnly: boolean = true): BaseSyntaxHandler[] {
    if (enabledOnly) {
      return this.handlersByPriority;
    }

    return Array.from(this.handlers.values())
      .sort((a, b) => b.priority - a.priority);
  }

  /**
   * Get handlers by pattern
   * @param pattern - Pattern to match
   * @returns Matching handlers
   */
  getHandlersByPattern(pattern: string | RegExp): BaseSyntaxHandler[] {
    const patternStr = pattern instanceof RegExp ? pattern.source : pattern.toString();
    const handlers: BaseSyntaxHandler[] = [];

    for (const handler of this.handlers.values()) {
      if (handler.pattern.source === patternStr) {
        handlers.push(handler);
      }
    }

    return handlers;
  }

  /**
   * Enable handler by ID
   * @param handlerId - Handler ID
   * @returns True if successful
   */
  enableHandler(handlerId: string): boolean {
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
   * @param handlerId - Handler ID
   * @returns True if successful
   */
  disableHandler(handlerId: string): boolean {
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
   * @returns Registry statistics
   */
  getStats(): ExtendedRegistryStats {
    const handlerStats: Record<string, unknown> = {};
    for (const [id, handler] of this.handlers) {
      const stats = handler.getStats();
      handlerStats[id] = stats;
      this.stats.totalExecutions += stats.executionCount;
      this.stats.totalErrors += stats.errorCount;
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
  resetStats(): void {
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
   * @returns Handlers in dependency-resolved order
   */
  resolveExecutionOrder(): BaseSyntaxHandler[] {
    if (!this.config.enableDependencyResolution) {
      return this.getHandlersByPriority();
    }

    const resolved: BaseSyntaxHandler[] = [];
    const visited = new Set<string>();
    const visiting = new Set<string>();

    const visit = (handlerId: string): void => {
      if (visiting.has(handlerId)) {
        throw new Error(`Circular dependency detected involving handler: ${handlerId}`);
      }

      if (visited.has(handlerId)) {
        return;
      }

      visiting.add(handlerId);

      const handler = this.handlers.get(handlerId);
      if (handler?.isEnabled()) {
        // Visit dependencies first
        for (const dependency of handler.dependencies) {
          if (typeof dependency !== 'string' && (dependency).type === 'handler') {
            visit((dependency).name);
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
          // eslint-disable-next-line no-console
          console.error(`❌ Dependency resolution error for handler ${handlerId}:`, (error as Error).message);
        }
      }
    }

    // Sort resolved handlers by priority within dependency constraints
    return resolved.sort((a, b) => b.priority - a.priority);
  }

  /**
   * Validate all handler dependencies
   * @returns Array of dependency validation errors
   */
  validateDependencies(): DependencyValidationError[] {
    const errors: DependencyValidationError[] = [];

    for (const handler of this.handlers.values()) {
      for (const dependency of handler.dependencies) {
        if (typeof dependency !== 'string' && (dependency).type === 'handler') {
          const depSpec = dependency;
          const depHandler = this.handlers.get(depSpec.name);
          if (!depHandler && !depSpec.optional) {
            errors.push({
              handlerId: handler.handlerId,
              dependencyType: 'handler',
              dependencyName: depSpec.name,
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
   */
  async clearAll(): Promise<void> {
    const handlerIds = Array.from(this.handlers.keys());

    for (const handlerId of handlerIds) {
      try {
        await this.unregisterHandler(handlerId);
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error(`❌ Failed to unregister handler ${handlerId}:`, (error as Error).message);
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
   * @returns Serializable registry state
   */
  exportState(): ExportedRegistryState {
    return {
      config: { ...this.config },
      stats: { ...this.stats },
      handlers: Array.from(this.handlers.values()).map(handler => handler.getMetadata()),
      dependencies: Object.fromEntries(this.dependencyGraph)
    };
  }

  /**
   * Get registry information
   * @returns Registry information
   */
  getInfo(): RegistryInfo {
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
export class HandlerRegistrationError extends Error {
  readonly code: string;
  readonly context: Record<string, unknown>;

  constructor(message: string, code: string, context: Record<string, unknown> = {}) {
    super(message);
    this.name = 'HandlerRegistrationError';
    this.code = code;
    this.context = context;
  }
}

// Export class as named export for import { HandlerRegistry } syntax
export { HandlerRegistry };

// Export for ES modules - HandlerRegistrationError already exported inline above
export default HandlerRegistry;

// Export for CommonJS (Jest compatibility)
// Must export class directly for instanceof checks to work
module.exports = HandlerRegistry;
Object.assign(module.exports, { HandlerRegistry, HandlerRegistrationError, default: HandlerRegistry });
