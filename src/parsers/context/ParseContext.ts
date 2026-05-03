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
 * Minimal page frontmatter for parse context (uuid is the key consumer)
 */
export interface PageFrontmatter {
  uuid?: string;
  title?: string;
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
  pageMetadata?: PageFrontmatter | null;
  [key: string]: unknown;
}

/**
 * WikiEngine minimal interface (until WikiEngine.ts is fully typed)
 * TODO: Replace with proper WikiEngine import once converted
 */
export interface WikiEngine {
  getManager<T = unknown>(name: string): T | undefined;
}

/**
 * Minimal WikiContext interface for the parser side (#629).
 *
 * ParseContext holds a reference to its parent WikiContext so user/page-data
 * fields don't have to be copied. We define a structural interface here rather
 * than importing the full WikiContext class to avoid coupling the parser
 * package to context internals (and to side-step circular imports).
 *
 * Only the fields/methods ParseContext needs to delegate are listed.
 */
export interface WikiContextLike {
  readonly engine: WikiEngine;
  readonly pageName: string | null;
  readonly userContext: UserContext | null;
  readonly pageMetadata: PageFrontmatter | null;
  hasRole(...names: string[]): boolean;
  hasPermission(action: string): Promise<boolean>;
  canAccess(action: string): Promise<boolean>;
}

/**
 * Nested context structure (from WikiContext.toParseOptions())
 */
export interface NestedContextOptions {
  pageContext: PageContext;
  engine?: WikiEngine;
  /**
   * #629: optional reference to the parent WikiContext. When provided,
   * ParseContext getters delegate user/page-data lookups to it instead of
   * the constructor-time snapshot in `pageContext`. Lets the WikiContext
   * stay the single source of truth across the parse run.
   */
  wikiContext?: WikiContextLike;
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
 *
 * #629: holds a reference to the parent WikiContext. When present, the
 * user/page-data getters delegate to it; when absent (legacy callers passing
 * raw PageContext objects), the getters fall back to the constructor-time
 * snapshot. Either way the public surface is identical, so consumers don't
 * need to change.
 */
class ParseContext {
  readonly originalContent: string;
  readonly pageContext: PageContext;
  readonly engine: WikiEngine;

  /**
   * Reference to the parent WikiContext (#629). Null when constructed from a
   * raw context object (tests / direct construction). When non-null, the
   * pageName / userContext / pageMetadata getters delegate to it so the
   * WikiContext stays the single source of truth across the parse run.
   */
  readonly wikiContext: WikiContextLike | null;

  // Snapshot — populated at construction. Used as the fallback for the
  // public getters when `wikiContext` is null. Keeping these private under-
  // scores so no consumer is tempted to read them directly.
  private readonly _snapPageName: string;
  private readonly _snapUserContext: UserContext | null;
  private readonly _snapRequestInfo: RequestInfo | null;
  private readonly _snapPageMetadata: PageFrontmatter | null;
  private readonly _snapUserName: string;

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
    // Context structure: { pageContext: { pageName, userContext, requestInfo }, engine, wikiContext? }
    if ('pageContext' in context && context.pageContext) {
      // Nested structure from WikiContext
      const nestedContext = context as NestedContextOptions;
      this.pageContext = nestedContext.pageContext;
      this.engine = nestedContext.engine || engine;
      this.wikiContext = nestedContext.wikiContext ?? null;

      // Snapshot from nested pageContext
      this._snapPageName = nestedContext.pageContext.pageName || 'unknown';
      this._snapUserContext = nestedContext.pageContext.userContext || null;
      this._snapRequestInfo = nestedContext.pageContext.requestInfo || null;
      this._snapPageMetadata = nestedContext.pageContext.pageMetadata ?? null;

      // Extract userName from userContext if not directly provided
      this._snapUserName = nestedContext.pageContext.userName ||
                      this._snapUserContext?.username ||
                      this._snapUserContext?.userName ||
                      'anonymous';
    } else {
      // Direct structure (legacy or alternative calling pattern)
      const directContext = context as DirectContextOptions;
      this.pageContext = directContext;
      this.engine = engine;
      this.wikiContext = null;

      this._snapPageName = directContext.pageName || 'unknown';
      this._snapUserContext = directContext.userContext || null;
      this._snapRequestInfo = directContext.requestInfo || null;
      this._snapPageMetadata = directContext.pageMetadata ?? null;

      // Extract userName from userContext if not directly provided
      this._snapUserName = directContext.userName ||
                      this._snapUserContext?.username ||
                      this._snapUserContext?.userName ||
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
   * Page name. Delegates to wikiContext when present, else returns the
   * constructor-time snapshot. (#629)
   */
  get pageName(): string {
    return this.wikiContext?.pageName ?? this._snapPageName;
  }

  /**
   * Caller userContext. Delegates to wikiContext when present, else returns
   * the snapshot. The WikiContext-side type is structurally compatible with
   * the parser-side UserContext interface (both expose username / roles /
   * isAuthenticated). (#629)
   */
  get userContext(): UserContext | null {
    return (this.wikiContext?.userContext) ?? this._snapUserContext;
  }

  /**
   * Page metadata. Delegates to wikiContext when present, else snapshot. (#629)
   */
  get pageMetadata(): PageFrontmatter | null {
    return (this.wikiContext?.pageMetadata) ?? this._snapPageMetadata;
  }

  /**
   * Request info. WikiContextLike doesn't expose this directly (it's derived
   * from request headers in toParseOptions), so we always return the snapshot.
   * If we ever need live request info on the context, add it to WikiContextLike
   * and delegate. (#629)
   */
  get requestInfo(): RequestInfo | null {
    return this._snapRequestInfo;
  }

  /**
   * Caller's username. Recomputed from the live userContext when wikiContext
   * is present so a session change mid-parse is reflected. (#629)
   */
  get userName(): string {
    if (this.wikiContext) {
      const uc = this.wikiContext.userContext;
      return uc?.username ?? uc?.userName ?? 'anonymous';
    }
    return this._snapUserName;
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
   * Check if user has specific permission.
   *
   * Delegates to `UserManager.hasPermission` — same canonical
   * `PolicyEvaluator`-backed path that `WikiContext.hasPermission` uses.
   * Honors anonymous/authenticated role expansion, deny policies, resource
   * patterns, and the `'All'`/`'Authenticated'` role semantics. (#633)
   *
   * For page-resource-aware checks, use {@link canAccess} instead.
   *
   * @param action - Permission action (e.g., 'admin-system', 'user-edit')
   * @returns Promise resolving to true if user has the permission
   */
  async hasPermission(action: string): Promise<boolean> {
    const userManager = this.engine.getManager<{
      hasPermission(
        u: string | { username: string; roles: string[]; isAuthenticated: boolean },
        a: string
      ): Promise<boolean>;
        }>('UserManager');
    if (!userManager) return false;
    // #637: pass the resolved userContext directly when we have one so
    // UserManager can skip provider.getUser + resolveUserRoles.
    const uc = this.userContext;
    const username = uc?.username ?? uc?.userName ?? '';
    if (uc && Array.isArray(uc.roles) && typeof username === 'string' && username) {
      return userManager.hasPermission(
        { username, roles: uc.roles, isAuthenticated: Boolean(uc.isAuthenticated ?? uc.authenticated) },
        action
      );
    }
    return userManager.hasPermission(typeof username === 'string' ? username : '', action);
  }

  /**
   * Returns true if the user is allowed to perform the given action on the
   * current page.
   *
   * Delegates to {@link ACLManager.checkPagePermissionWithContext}, which runs
   * the three-tier evaluator (private user-keyword → frontmatter audience →
   * global policies). Synthesizes a minimal WikiContext-shaped object from
   * ParseContext fields. (#633)
   *
   * @param action - Page action (e.g., 'view', 'edit', 'delete')
   * @returns Promise resolving to true if access is allowed
   */
  async canAccess(action: string): Promise<boolean> {
    const aclManager = this.engine.getManager<{
      checkPagePermissionWithContext(ctx: unknown, action: string): Promise<boolean>;
        }>('ACLManager');
    if (!aclManager || !this.pageName || this.pageName === 'unknown') return false;
    return aclManager.checkPagePermissionWithContext({
      pageName: this.pageName,
      content: this.originalContent,
      userContext: this.userContext ?? undefined,
      pageMetadata: this.pageMetadata
    }, action);
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
   * Check if user carries any of the given roles.
   *
   * Pure roles-array check. Backward-compatible with the single-arg form
   * (`hasRole('admin')`) and supports rest-args for multi-role checks
   * (`hasRole('admin', 'editor')`) — matches the shape of `WikiContext.hasRole`.
   *
   * @param names - Role names (matches if user has at least one)
   * @returns True if user has any of the given roles
   */
  hasRole(...names: string[]): boolean {
    if (names.length === 0) return false;
    const have = new Set(this.getUserRoles());
    return names.some((n) => have.has(n));
  }

  /**
   * Returns the user's principals — the set of identifiers that match
   * audience-style filters. Mirrors `WikiContext.getPrincipals()`.
   *
   * @returns Principals: [...roles, username] (username appended only if set)
   */
  getPrincipals(): string[] {
    const roles = [...this.getUserRoles()];
    const username = this.userContext?.username ?? this.userContext?.userName;
    if (typeof username === 'string' && username.length > 0 && username !== 'anonymous') {
      roles.push(username);
    }
    return roles;
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
    // #629: preserve the wikiContext reference on clone. Use the nested form
    // so the constructor picks up the wikiContext. If the source ParseContext
    // didn't have one, this falls back to the direct path.
    const newContext = this.wikiContext
      ? new ParseContext(
        this.originalContent,
        {
          pageContext: { ...this.pageContext, ...overrides },
          engine: this.engine,
          wikiContext: this.wikiContext
        },
        this.engine
      )
      : new ParseContext(
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
