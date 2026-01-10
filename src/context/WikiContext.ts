/**
 * WikiContext - Request-scoped context for wiki operations
 *
 * Provides a request-scoped container for all contextual information needed
 * during page rendering, including the engine, current page, user, and
 * request/response objects.
 */

import type { Request, Response } from 'express';
import * as Showdown from 'showdown';
import logger from '../utils/logger';
import type { WikiEngine } from '../types/WikiEngine';
import type PageManager from '../managers/PageManager';
import type RenderingManager from '../managers/RenderingManager';
import type PluginManager from '../managers/PluginManager';
import type VariableManager from '../managers/VariableManager';
import type ACLManager from '../managers/ACLManager';
import type MarkupParser from '../parsers/MarkupParser';
import type { VariableContext } from '../managers/VariableManager';

/**
 * Request information extracted from Express request
 */
export interface RequestInfo {
  /** Accept-Language header */
  acceptLanguage?: string;
  /** User-Agent header */
  userAgent?: string;
  /** Client IP address */
  clientIp?: string;
  /** Referer header */
  referer?: string;
  /** Session ID */
  sessionId?: string;
}

/**
 * User context - session or authentication context
 */
export interface UserContext {
  /** Username */
  username?: string;
  /** User display name */
  displayName?: string;
  /** User roles */
  roles?: string[];
  /** Whether user is authenticated */
  authenticated?: boolean;
  /** Additional user context data */
  [key: string]: unknown;
}

/**
 * Page context for rendering
 */
export interface PageContext {
  /** Name of the current page */
  pageName: string | null;
  /** User context/session */
  userContext: UserContext | null;
  /** Request information */
  requestInfo: RequestInfo;
}

/**
 * Options for MarkupParser.parse()
 */
export interface ParseOptions {
  /** Page-specific context */
  pageContext: PageContext;
  /** Wiki engine instance */
  engine: WikiEngine;
}

/**
 * Options for WikiContext constructor
 */
export interface WikiContextOptions {
  /** Context type (VIEW, EDIT, PREVIEW, etc.) */
  context?: string;
  /** Name of the page */
  pageName?: string;
  /** Page content (markdown) */
  content?: string;
  /** User context/session */
  userContext?: UserContext;
  /** Express request object */
  request?: Request;
  /** Express response object */
  response?: Response;
}

/**
 * Context type constants
 */
export interface ContextTypes {
  /** Viewing a page */
  VIEW: 'view';
  /** Editing a page */
  EDIT: 'edit';
  /** Previewing page changes */
  PREVIEW: 'preview';
  /** Viewing page diff */
  DIFF: 'diff';
  /** Viewing page information/metadata */
  INFO: 'info';
  /** No specific page context */
  NONE: 'none';
}

/**
 * WikiContext - Encapsulates the context of a single request or rendering operation
 *
 * Inspired by JSPWiki's WikiContext, this class provides a request-scoped container
 * for all contextual information needed during page rendering, including the engine,
 * current page, user, request/response objects, and manager references.
 *
 * @class WikiContext
 *
 * @property {WikiEngine} engine - The wiki engine instance
 * @property {string} context - The rendering context (VIEW, EDIT, PREVIEW, etc.)
 * @property {string|null} pageName - Name of the current page
 * @property {string|null} content - Page content (markdown)
 * @property {UserContext|null} userContext - Current user context/session
 * @property {Request|null} request - Express request object
 * @property {Response|null} response - Express response object
 * @property {PageManager} pageManager - Reference to PageManager
 * @property {RenderingManager} renderingManager - Reference to RenderingManager
 * @property {PluginManager} pluginManager - Reference to PluginManager
 * @property {VariableManager} variableManager - Reference to VariableManager
 * @property {ACLManager} aclManager - Reference to ACLManager
 * @property {Showdown.Converter} _fallbackConverter - Fallback markdown converter
 *
 * @see {@link WikiEngine} for the main engine
 * @see {@link RenderingManager} for rendering operations
 */
class WikiContext {
  /**
   * Context type constants for different rendering modes
   *
   * @static
   * @readonly
   */
  static readonly CONTEXT: ContextTypes = {
    /** Viewing a page */
    VIEW: 'view',
    /** Editing a page */
    EDIT: 'edit',
    /** Previewing page changes */
    PREVIEW: 'preview',
    /** Viewing page diff */
    DIFF: 'diff',
    /** Viewing page information/metadata */
    INFO: 'info',
    /** No specific page context */
    NONE: 'none'
  };

  /** The wiki engine instance */
  public readonly engine: WikiEngine;

  /** The rendering context type */
  public readonly context: string;

  /** Name of the current page */
  public readonly pageName: string | null;

  /** Page content (markdown) */
  public readonly content: string | null;

  /** Current user context/session */
  public readonly userContext: UserContext | null;

  /** Express request object */
  public readonly request: Request | null;

  /** Express response object */
  public readonly response: Response | null;

  /** Reference to PageManager */
  public readonly pageManager: PageManager;

  /** Reference to RenderingManager */
  public readonly renderingManager: RenderingManager;

  /** Reference to PluginManager */
  public readonly pluginManager: PluginManager;

  /** Reference to VariableManager */
  public readonly variableManager: VariableManager;

  /** Reference to ACLManager */
  public readonly aclManager: ACLManager;

  /** Fallback markdown converter */
  private readonly _fallbackConverter: Showdown.Converter;

  /**
   * Creates a new WikiContext instance
   *
   * @constructor
   * @param {WikiEngine} engine - The wiki engine instance
   * @param {WikiContextOptions} [options={}] - Context options
   * @throws {Error} If engine is not provided
   *
   * @example
   * const context = new WikiContext(engine, {
   *   context: WikiContext.CONTEXT.VIEW,
   *   pageName: 'Main',
   *   userContext: req.session.user,
   *   request: req,
   *   response: res
   * });
   */
  constructor(engine: WikiEngine, options: WikiContextOptions = {}) {
    if (!engine) {
      throw new Error('WikiContext requires a valid WikiEngine instance.');
    }

    this.engine = engine;
    this.context = options.context || WikiContext.CONTEXT.NONE;
    this.pageName = options.pageName || null;
    this.content = options.content || null;
    this.userContext = options.userContext || null;
    this.request = options.request || null;
    this.response = options.response || null;

    // Ensure essential managers are available on the context
    this.pageManager = engine.getManager<PageManager>('PageManager')!;
    this.renderingManager = engine.getManager<RenderingManager>('RenderingManager')!;
    this.pluginManager = engine.getManager<PluginManager>('PluginManager')!;
    this.variableManager = engine.getManager<VariableManager>('VariableManager')!;
    this.aclManager = engine.getManager<ACLManager>('ACLManager')!;

    this._fallbackConverter = new Showdown.Converter();
  }

  /**
   * Returns the current rendering context type
   *
   * @returns {string} The context type (VIEW, EDIT, PREVIEW, etc.)
   *
   * @example
   * if (context.getContext() === WikiContext.CONTEXT.EDIT) {
   *   // Show edit-specific UI
   * }
   */
  getContext(): string {
    return this.context;
  }

  /**
   * Renders the provided markdown content through the full rendering pipeline
   *
   * This method uses the MarkupParser for advanced parsing with plugin support,
   * variable expansion, and multi-phase processing. Falls back to simple Showdown
   * conversion if the parser is unavailable.
   *
   * @async
   * @param {string} [content=this.content] - The markdown content to render
   * @returns {Promise<string>} The rendered HTML
   *
   * @example
   * const html = await context.renderMarkdown('# Hello World');
   * // Returns: '<h1>Hello World</h1>'
   *
   * @example
   * // With plugins and variables
   * const html = await context.renderMarkdown('[{CurrentTimePlugin}]');
   * // Returns expanded plugin output
   */
  async renderMarkdown(content: string | null = this.content): Promise<string> {
    if (!content) {
      return '';
    }

    // The advanced parser should be the primary method
    const parser: MarkupParser | null = this.renderingManager.getParser();
    logger.info(`[CTX] renderMarkdown page=${this.pageName ?? 'unknown'} parser=${!!parser} contentLen=${content.length}`);

    if (parser) {
      // Cast to Record<string, unknown> for MarkupParser.parse() compatibility
      const parseContext = this.toParseOptions() as unknown as Record<string, unknown>;
      const html: string = await parser.parse(content, parseContext);
      logger.info(`[CTX] parsed via MarkupParser resultLen=${html.length}`);
      return html;
    }

    // Fallback for when the advanced parser is not available
    logger.warn(`[CTX] Using fallback renderer for page ${this.pageName ?? 'unknown'}.`);
    let expanded: string = content;
    if (this.variableManager) {
      const variableContext: VariableContext = this.toVariableContext();
      expanded = this.variableManager.expandVariables(expanded, variableContext);
      logger.info(`[CTX] variables expanded len=${expanded.length}`);
    }

    const html: string = this._fallbackConverter.makeHtml(expanded);
    logger.info(`[CTX] fallback converter resultLen=${html.length}`);
    return html;
  }

  /**
   * Creates the options object needed for the MarkupParser
   *
   * Builds a comprehensive options object containing page context, user context,
   * request information, and engine reference for use during parsing.
   *
   * @returns {ParseOptions} Parse options object
   *
   * @example
   * const options = context.toParseOptions();
   * const html = await parser.parse(content, options);
   */
  toParseOptions(): ParseOptions {
    return {
      pageContext: {
        pageName: this.pageName,
        userContext: this.userContext,
        requestInfo: {
          acceptLanguage: this.request?.headers?.['accept-language'],
          userAgent: this.request?.headers?.['user-agent'],
          clientIp: this.request?.ip,
          referer: this.request?.headers?.referer,
          sessionId: this.request?.sessionID
        }
      },
      engine: this.engine
    };
  }

  /**
   * Converts the current context to a VariableContext for variable expansion
   *
   * @returns {VariableContext} Variable context for use with VariableManager
   * @private
   */
  private toVariableContext(): VariableContext {
    return {
      pageName: this.pageName ?? undefined,
      userContext: this.userContext ? {
        username: this.userContext.username,
        isAuthenticated: this.userContext.authenticated,
        roles: this.userContext.roles,
        displayName: this.userContext.displayName
      } : undefined,
      requestInfo: {
        acceptLanguage: this.request?.headers?.['accept-language'],
        userAgent: this.request?.headers?.['user-agent'],
        clientIp: this.request?.ip,
        referer: this.request?.headers?.referer,
        sessionId: this.request?.sessionID
      }
    };
  }
}

export default WikiContext;

// CommonJS compatibility
module.exports = WikiContext;
