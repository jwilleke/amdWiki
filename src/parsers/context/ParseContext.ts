/**
 * ParseContext - Context object for markup parsing operations
 *
 * Provides access to page context, user information, engine managers,
 * and parsing state throughout the processing pipeline.
 *
 * Related Issue: #55 - Core Infrastructure and Phase System
 */

/**
 * User context interface
 */
export interface UserContext {
  username?: string;
  userName?: string;
  isAuthenticated?: boolean;
  roles?: string[];
  permissions?: string[];
  [key: string]: unknown;
}

/**
 * Request information
 */
export interface RequestInfo {
  method?: string;
  path?: string;
  ip?: string;
  userAgent?: string;
  [key: string]: unknown;
}

/**
 * Page context interface
 */
export interface PageContext {
  pageName?: string;
  userName?: string;
  userContext?: UserContext | null;
  requestInfo?: RequestInfo | null;
  [key: string]: unknown;
}

/**
 * WikiEngine minimal interface (until WikiEngine.ts is fully typed)
 * TODO: Replace with proper WikiEngine import once converted
 */
export interface WikiEngine {
  getManager(name: string): unknown;
}

/**
 * PolicyManager minimal interface
 */
interface PolicyManager {
  checkPermission(userContext: UserContext, permission: string, resource: string | null): boolean;
}

/**
 * Nested context structure (from WikiContext.toParseOptions())
 */
export interface NestedContextOptions {
  pageContext: PageContext;
  engine?: WikiEngine;
}

/**
 * Direct context structure (legacy or alternative calling pattern)
 */
export type DirectContextOptions = PageContext;

/**
 * Combined context options
 */
export type ParseContextOptions = NestedContextOptions | DirectContextOptions;

/**
 * Context summary for logging
 */
export interface ContextSummary {
  pageName: string;
  userName: string;
  authenticated: boolean;
  roles: string[];
  contentLength: number;
  variableCount: number;
  handlerResultCount: number;
  processingTime: number;
  phaseCount: number;
}

/**
 * Error context for debugging
 */
export interface ParseErrorContext {
  error: string;
  phase: string;
  pageName: string;
  userName: string;
  processingTime: number;
  contentLength: number;
  timestamp: string;
}

/**
 * Exported user context for caching
 */
export interface ExportedUserContext {
  isAuthenticated: boolean;
  roles: string[];
  permissions: string[];
}

/**
 * Cached context data
 */
export interface CachedContextData {
  pageName: string;
  userName: string;
  userContext: ExportedUserContext | null;
  variables: Record<string, unknown>;
  metadata: Record<string, unknown>;
  timestamp: number;
}

/**
 * ParseContext - Context object for markup parsing operations
 */
class ParseContext {
  readonly originalContent: string;
  readonly pageContext: PageContext;
  readonly engine: WikiEngine;
  readonly pageName: string;
  readonly userName: string;
  readonly userContext: UserContext | null;
  readonly requestInfo: RequestInfo | null;

  // Mutable processing state
  protectedBlocks: unknown[];
  syntaxTokens: unknown[];
  variables: Map<string, unknown>;
  handlerResults: Map<string, unknown>;
  metadata: Record<string, unknown>;

  // Performance tracking
  private startTime: number;
  private phaseTimings: Map<string, number>;

  constructor(content: string, context: ParseContextOptions, engine: WikiEngine) {
    // Original content and processing context
    this.originalContent = content;

    // Handle nested structure from WikiContext.toParseOptions()
    // Context structure: { pageContext: { pageName, userContext, requestInfo }, engine }
    if ('pageContext' in context && context.pageContext) {
      // Nested structure from WikiContext
      const nestedContext = context as NestedContextOptions;
      this.pageContext = nestedContext.pageContext;
      this.engine = nestedContext.engine || engine;

      // Extract from nested pageContext
      this.pageName = nestedContext.pageContext.pageName || 'unknown';
      this.userContext = nestedContext.pageContext.userContext || null;
      this.requestInfo = nestedContext.pageContext.requestInfo || null;

      // Extract userName from userContext if not directly provided
      this.userName = nestedContext.pageContext.userName ||
                      this.userContext?.username ||
                      this.userContext?.userName ||
                      'anonymous';
    } else {
      // Direct structure (legacy or alternative calling pattern)
      const directContext = context as DirectContextOptions;
      this.pageContext = directContext;
      this.engine = engine;

      this.pageName = directContext.pageName || 'unknown';
      this.userContext = directContext.userContext || null;
      this.requestInfo = directContext.requestInfo || null;

      // Extract userName from userContext if not directly provided
      this.userName = directContext.userName ||
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
   * @param managerName - Name of manager to retrieve
   * @returns Manager instance or null
   */
  getManager(managerName: string): unknown {
    return this.engine.getManager(managerName);
  }

  /**
   * Check if user is authenticated
   * @returns True if user is authenticated
   */
  isAuthenticated(): boolean {
    return Boolean(this.userContext?.isAuthenticated);
  }

  /**
   * Check if user has specific permission
   * @param permission - Permission to check
   * @param resource - Resource context (optional)
   * @returns True if user has permission
   */
  hasPermission(permission: string, resource: string | null = null): boolean {
    if (!this.userContext) {
      return false;
    }

    const policyManager = this.getManager('PolicyManager') as PolicyManager | undefined;
    if (policyManager) {
      // Use PolicyManager for permission checks
      return policyManager.checkPermission(this.userContext, permission, resource);
    }

    // Fallback to basic permission check
    return Boolean(this.userContext.permissions?.includes(permission));
  }

  /**
   * Get user roles
   * @returns Array of user roles
   */
  getUserRoles(): string[] {
    if (!this.userContext) {
      return [];
    }
    return this.userContext.roles || [];
  }

  /**
   * Check if user has specific role
   * @param role - Role to check
   * @returns True if user has role
   */
  hasRole(role: string): boolean {
    return this.getUserRoles().includes(role);
  }

  /**
   * Set variable value
   * @param name - Variable name
   * @param value - Variable value
   */
  setVariable(name: string, value: unknown): void {
    this.variables.set(name, value);
  }

  /**
   * Get variable value
   * @param name - Variable name
   * @param defaultValue - Default value if not found
   * @returns Variable value
   */
  getVariable(name: string, defaultValue: unknown = null): unknown {
     
    const value = this.variables.get(name);
    return value ?? defaultValue;
  }

  /**
   * Store handler result
   * @param handlerId - Handler identifier
   * @param result - Handler result
   */
  setHandlerResult(handlerId: string, result: unknown): void {
    this.handlerResults.set(handlerId, result);
  }

  /**
   * Get handler result
   * @param handlerId - Handler identifier
   * @returns Handler result or null
   */
  getHandlerResult(handlerId: string): unknown {
     
    const result = this.handlerResults.get(handlerId);
    return result ?? null;
  }

  /**
   * Set metadata value
   * @param key - Metadata key
   * @param value - Metadata value
   */
  setMetadata(key: string, value: unknown): void {
     
    this.metadata[key] = value;
  }

  /**
   * Get metadata value
   * @param key - Metadata key
   * @param defaultValue - Default value if not found
   * @returns Metadata value
   */
  getMetadata(key: string, defaultValue: unknown = null): unknown {
     
    const value = this.metadata[key];
    return value ?? defaultValue;
  }

  /**
   * Record phase timing
   * @param phaseName - Name of phase
   * @param duration - Duration in milliseconds
   */
  recordPhaseTiming(phaseName: string, duration: number): void {
    this.phaseTimings.set(phaseName, duration);
  }

  /**
   * Get phase timing
   * @param phaseName - Name of phase
   * @returns Duration in milliseconds or 0
   */
  getPhaseTiming(phaseName: string): number {
    return this.phaseTimings.get(phaseName) ?? 0;
  }

  /**
   * Get total processing time
   * @returns Total time in milliseconds
   */
  getTotalTime(): number {
    return Date.now() - this.startTime;
  }

  /**
   * Clone context for sub-processing
   * @param overrides - Properties to override
   * @returns New context instance
   */
  clone(overrides: Partial<PageContext> = {}): ParseContext {
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
   * @param error - Error that occurred
   * @param phase - Phase where error occurred
   * @returns Error context
   */
  createErrorContext(error: Error, phase: string): ParseErrorContext {
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
   * @returns Context summary
   */
  getSummary(): ContextSummary {
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
   * @returns Serializable context data
   */
  exportForCache(): CachedContextData {
    return {
      pageName: this.pageName,
      userName: this.userName,
      userContext: this.userContext ? {
        isAuthenticated: this.userContext.isAuthenticated || false,
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
   * @param data - Cached context data
   */
  importFromCache(data: CachedContextData): void {
    if (data.variables) {
      this.variables = new Map(Object.entries(data.variables));
    }
    if (data.metadata) {
      this.metadata = { ...data.metadata };
    }
  }
}

// Export class as named export for type imports
export { ParseContext };

// Export for ES modules
export default ParseContext;

// Export for CommonJS (Jest compatibility)
module.exports = ParseContext;
// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
module.exports.default = ParseContext;
