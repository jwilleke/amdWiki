import crypto from 'crypto';
import showdown from 'showdown';
import BaseManager from '../managers/BaseManager';
import { HandlerRegistry } from './handlers/HandlerRegistry';
import BaseSyntaxHandler from './handlers/BaseSyntaxHandler';
import FilterChain from './filters/FilterChain';
import { DOMParser as WikiDOMParser } from './dom/DOMParser';
import DOMVariableHandler from './dom/handlers/DOMVariableHandler';
import DOMPluginHandler from './dom/handlers/DOMPluginHandler';
import DOMLinkHandler from './dom/handlers/DOMLinkHandler';
import logger from '../utils/logger';
import SecurityFilter from './filters/SecurityFilter';
import SpamFilter from './filters/SpamFilter';
import ValidationFilter from './filters/ValidationFilter';
import JSPWikiPreprocessor from './handlers/JSPWikiPreprocessor';
import PluginSyntaxHandler from './handlers/PluginSyntaxHandler';
import WikiTagHandler from './handlers/WikiTagHandler';
import WikiFormHandler from './handlers/WikiFormHandler';
import AttachmentHandler from './handlers/AttachmentHandler';
import LinkParserHandler from './handlers/LinkParserHandler';
import ParseContext from './context/ParseContext';
import WikiDocument from './dom/WikiDocument';
import type RegionCache from '../cache/RegionCache';
import type { WikiEngine } from '../types/WikiEngine';

// ============================================================================
// Type Definitions
// ============================================================================

/** Configuration for MarkupParser */
export interface MarkupParserConfig extends Record<string, unknown> {
  /** Whether MarkupParser is enabled */
  enabled: boolean;
  /** Whether caching is enabled */
  caching: boolean;
  /** Cache TTL in seconds */
  cacheTTL: number;
  /** Handler registry configuration */
  handlerRegistry: HandlerRegistryConfig;
  /** Handler configurations */
  handlers: Record<string, HandlerConfig>;
  /** Filter configuration */
  filters: FilterConfig;
  /** Cache configuration */
  cache: CacheConfig;
  /** Performance configuration */
  performance: PerformanceConfig;
}

/** Handler registry configuration */
export interface HandlerRegistryConfig {
  /** Whether to enable dependency resolution */
  enableDependencyResolution?: boolean;
  /** Maximum handler priority */
  maxPriority?: number;
  /** Maximum number of handlers */
  maxHandlers?: number;
  /** Whether to allow duplicate priorities */
  allowDuplicatePriorities?: boolean;
  /** Whether to enable conflict detection */
  enableConflictDetection?: boolean;
  /** Default handler timeout in ms */
  defaultTimeout?: number;
}

/** Individual handler configuration */
export interface HandlerConfig {
  /** Whether handler is enabled */
  enabled: boolean;
  /** Handler priority */
  priority: number;
  /** Whether enhanced mode is enabled */
  enhanced?: boolean;
  /** Whether thumbnails are enabled */
  thumbnails?: boolean;
  /** Whether metadata collection is enabled */
  metadata?: boolean;
}

/** Individual filter type configuration */
export interface FilterTypeConfig {
  /** Whether this filter type is enabled */
  enabled: boolean;
}

/** Filter configuration */
export interface FilterConfig {
  /** Whether filters are enabled */
  enabled: boolean;
  /** Filter mode (sequential or parallel) */
  mode?: 'sequential' | 'parallel';
  /** Security filter configuration */
  security: FilterTypeConfig;
  /** Spam filter configuration */
  spam: FilterTypeConfig;
  /** Validation filter configuration */
  validation: FilterTypeConfig;
}

/** Cache configuration */
export interface CacheConfig {
  /** Parse results cache strategy */
  parseResults: CacheStrategyConfig;
  /** Handler results cache strategy */
  handlerResults: CacheStrategyConfig;
  /** Patterns cache strategy */
  patterns: CacheStrategyConfig;
  /** Variables cache strategy */
  variables: CacheStrategyConfig;
  /** Whether to enable cache warmup */
  enableWarmup: boolean;
  /** Whether to enable metrics */
  metricsEnabled: boolean;
}

/** Cache strategy configuration */
export interface CacheStrategyConfig {
  /** Whether this strategy is enabled */
  enabled: boolean;
  /** Time to live in seconds */
  ttl: number;
  /** Maximum cache size */
  maxSize: number;
}

/** Performance configuration */
export interface PerformanceConfig {
  /** Whether performance monitoring is enabled */
  monitoring: boolean;
  /** Alert thresholds */
  alertThresholds: AlertThresholds;
}

/** Performance alert thresholds */
export interface AlertThresholds {
  /** Parse time threshold in milliseconds */
  parseTime: number;
  /** Cache hit ratio threshold (0-1) */
  cacheHitRatio: number;
  /** Error rate threshold (0-1) */
  errorRate: number;
  /** Minimum cache samples for metrics */
  minCacheSamples: number;
}

/** Parse context */
export interface ParseContextData {
  /** Page name */
  pageName?: string;
  /** User name */
  userName?: string;
  /** User context object */
  userContext?: unknown;
  /** Request information */
  requestInfo?: unknown;
  /** Code blocks extracted during parsing */
  codeBlocks?: string[];
  /** Protected HTML blocks */
  protectedBlocks?: string[];
  /** Syntax tokens */
  syntaxTokens?: unknown[];
  /** Additional context properties */
  [key: string]: unknown;
}

/** Extracted JSPWiki element */
export interface ExtractedElement {
  /** Element type */
  type: 'variable' | 'plugin' | 'link' | 'escaped' | 'style';
  /** Original syntax */
  syntax: string;
  /** Unique ID */
  id: number;
  /** Position in content */
  position?: number;
  /** Variable name (for variables) */
  varName?: string;
  /** Plugin/tag inner content (for plugins) */
  inner?: string;
  /** Link target (for links) */
  target?: string;
  /** Escaped literal content (for escaped) */
  literal?: string;
  /** CSS class name (for style blocks) */
  className?: string;
  /** Style block content (for style blocks) */
  styleContent?: string;
}

/** Configuration manager interface for type safety */
interface ConfigurationManagerInterface {
  getProperty<T>(key: string, defaultValue: T): T;
  isInitialized(): boolean;
}

/** Cache manager interface for type safety */
interface CacheManagerInterface {
  isInitialized(): boolean;
  region(name: string): RegionCache;
}

/** Variable manager interface for type safety */
interface VariableManagerInterface {
  expandVariables(content: string, context: Record<string, unknown>): Promise<string>;
}

/** Rendering manager interface for type safety */
interface RenderingManagerInterface {
  converter?: {
    makeHtml(content: string): string;
  };
}

/** Notification manager interface for type safety */
interface NotificationManagerInterface {
  addNotification(notification: Record<string, unknown>): void;
}

/** Result of extraction */
export interface ExtractionResult {
  /** Sanitized content with placeholders */
  sanitized: string;
  /** Extracted JSPWiki elements */
  jspwikiElements: ExtractedElement[];
  /** Unique UUID for this extraction */
  uuid: string;
}

/** Parser metrics */
export interface ParserMetrics {
  /** Number of parses performed */
  parseCount: number;
  /** Total parse time in milliseconds */
  totalParseTime: number;
  /** Number of errors */
  errorCount: number;
  /** Number of cache hits */
  cacheHits: number;
  /** Number of cache misses */
  cacheMisses: number;
  /** Cache metrics by strategy */
  cacheMetrics: Map<string, CacheMetrics>;
}

/** Cache metrics for a strategy */
export interface CacheMetrics {
  /** Number of cache hits */
  hits: number;
  /** Number of cache misses */
  misses: number;
  /** Number of cache sets */
  sets: number;
}

/** Performance monitor state */
export interface PerformanceMonitor {
  /** Performance alerts */
  alerts: PerformanceAlert[];
  /** Last check timestamp */
  lastCheck: number;
  /** Check interval in milliseconds */
  checkInterval: number;
  /** Recent parse times */
  recentParseTimes: ParseTimeEntry[];
  /** Recent error rates */
  recentErrorRates: number[];
  /** Maximum recent entries to keep */
  maxRecentEntries: number;
}

/** Performance alert */
export interface PerformanceAlert {
  /** Alert type */
  type: string;
  /** Alert message */
  message: string;
  /** Timestamp */
  timestamp: string;
  /** Related metrics */
  metrics: unknown;
}

/** Parse time entry */
export interface ParseTimeEntry {
  /** Parse time in milliseconds */
  time: number;
  /** Whether this was a cache hit */
  cacheHit: boolean;
  /** Timestamp */
  timestamp: number;
}

/** Extended metrics returned by getMetrics() */
export interface ExtendedMetrics extends ParserMetrics {
  /** Average parse time */
  averageParseTime: number;
  /** Cache hit ratio */
  cacheHitRatio: number;
  /** Handler registry stats */
  handlerRegistry?: unknown;
  /** Filter chain stats */
  filterChain?: unknown;
  /** Cache strategies stats */
  cacheStrategies?: Record<string, unknown>;
  /** Performance monitoring stats */
  performance?: unknown;
}

/**
 * MarkupParser - Comprehensive markup parsing engine for JSPWiki compatibility
 *
 * ============================================================================
 * RENDERING PIPELINE (Issue #120, Issue #185):
 * ============================================================================
 *
 * **WikiDocument DOM Extraction Pipeline** (Issues #115-#120):
 * 1. Extract JSPWiki syntax before markdown parsing (extractJSPWikiSyntax())
 * 2. Create WikiDocument DOM nodes (createDOMNode())
 * 3. Parse markdown with Showdown (makeHtml())
 * 4. Merge DOM nodes into HTML (mergeDOMNodes())
 *
 * This pipeline fixes the markdown heading bug (#110, #93) and provides
 * robust JSPWiki syntax processing without order dependencies.
 *
 * The legacy 7-phase string-based pipeline was removed in Issue #185.
 *
 * ============================================================================
 *
 * Related Issues:
 * - #185 - Remove deprecated 7-phase legacy parser pipeline
 * - #114 - WikiDocument DOM Solution (Epic)
 * - #115-#120 - Implementation Phases
 * - #110, #93 - Markdown heading bug fixes
 */

/**
 * Safely extract error message from unknown error type
 */
function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === 'string') {
    return error;
  }
  if (error && typeof error === 'object' && 'message' in error) {
    const msg = (error as { message: unknown }).message;
    if (typeof msg === 'string') {
      return msg;
    }
  }
  return 'Unknown error';
}

class MarkupParser extends BaseManager {
  /** Handler registry for syntax handlers */
  handlerRegistry: HandlerRegistry;

  /** Content filter chain */
  filterChain: FilterChain | null;

  /** Parse result cache */
  cache: RegionCache | null;

  /** Caching strategies by content type */
  cacheStrategies: Record<string, RegionCache>;

  /** Performance monitoring state */
  performanceMonitor: PerformanceMonitor | null;

  /** Parser performance metrics */
  metrics: ParserMetrics;

  /** DOM-based parser for JSPWiki syntax */
  domParser: WikiDOMParser;

  /** Variable expansion handler */
  domVariableHandler: DOMVariableHandler;

  /** Plugin execution handler */
  domPluginHandler: DOMPluginHandler;

  /** Link resolution handler */
  domLinkHandler: DOMLinkHandler;

  /** Parser configuration - overrides BaseManager's generic config */
  protected declare config: MarkupParserConfig;

  /**
   * Creates a new MarkupParser instance
   */
  constructor(engine: WikiEngine) {
    super(engine);
    this.handlerRegistry = new HandlerRegistry(engine);
    this.filterChain = new FilterChain(engine);
    this.cache = null;
    this.cacheStrategies = {};
    this.performanceMonitor = null;
    this.metrics = {
      parseCount: 0,
      totalParseTime: 0,
      errorCount: 0,
      cacheHits: 0,
      cacheMisses: 0,
      cacheMetrics: new Map()
    };

    // Initialize DOM-based parser (Phase 2 migration - GitHub Issue #93)
    this.domParser = new WikiDOMParser({
      debug: false,
      throwOnError: false
    });

    // Initialize DOM-based variable handler (Phase 3 migration - GitHub Issue #93)
     
    this.domVariableHandler = new DOMVariableHandler(engine);

    // Initialize DOM-based plugin handler (Phase 4 migration - GitHub Issue #107)
     
    this.domPluginHandler = new DOMPluginHandler(engine);

    // Initialize DOM-based link handler (Phase 5 migration - GitHub Issue #108)
     
    this.domLinkHandler = new DOMLinkHandler(engine);
  }

  /**
   * Initialize the MarkupParser
   */
  async initialize(config: Partial<MarkupParserConfig> = {}): Promise<void> {
    await super.initialize(config);

    // Load configuration from ConfigurationManager
    this.loadConfiguration();

    // Initialize advanced cache integration
    await this.initializeAdvancedCaching();

    // HandlerRegistry uses default configuration
    // (config property is private, no public setter available)

    // Initialize performance monitoring
    this.initializePerformanceMonitoring();
    
    // Initialize filter chain
    await this.initializeFilterChain();

    // Initialize DOM handlers
    await this.domVariableHandler.initialize();
    await this.domPluginHandler.initialize();
    await this.domLinkHandler.initialize();

    // Register default handlers
    await this.registerDefaultHandlers();

    logger.debug('✅ MarkupParser initialized with DOM extraction pipeline');
    logger.debug(`⚙️  Configuration loaded: ${this.config.enabled ? 'enabled' : 'disabled'}`);
    logger.debug(`🗄️  Cache strategies: ${Object.keys(this.cacheStrategies).join(', ')}`);
  }

  /**
   * Check if MarkupParser is initialized (required for RenderingManager integration)
   * @returns {boolean} - True if initialized
   */
  isInitialized(): boolean {
    return !!(this.initialized && this.config && this.handlerRegistry && this.filterChain);
  }

  /**
   * Initialize filter chain with modular configuration
   */
  async initializeFilterChain(): Promise<void> {
    if (!this.config.filters.enabled) {
      logger.debug('🔧 Filter pipeline disabled by configuration');
      return;
    }

    if (!this.filterChain) {
      logger.warn('🔧 Filter chain not available');
      return;
    }

    // Initialize the filter chain
    await this.filterChain.initialize({ engine: this.engine });

    // Register default filters based on configuration
    await this.registerDefaultFilters();

    const filterCount = this.filterChain.getFilters().length;
    logger.debug(`🔄 Filter pipeline initialized with ${filterCount} filters`);
  }

  /**
   * Register default filters based on modular configuration
   */
  async registerDefaultFilters(): Promise<void> {
    if (!this.filterChain) {
      return;
    }

    // Register SecurityFilter if enabled
    if (this.config.filters.security.enabled) {
      const securityFilter = new SecurityFilter();

      try {
        await securityFilter.initialize({ engine: this.engine });
        this.filterChain.addFilter(securityFilter);
        logger.debug('🔒 SecurityFilter registered successfully');
      } catch (error) {
        logger.warn('⚠️  Failed to register SecurityFilter:', getErrorMessage(error));
      }
    }

    // Register SpamFilter if enabled
    if (this.config.filters.spam.enabled) {
      const spamFilter = new SpamFilter();
      
      try {
        await spamFilter.initialize({ engine: this.engine });
        this.filterChain.addFilter(spamFilter);
        logger.debug('🛡️  SpamFilter registered successfully');
      } catch (error) {
        logger.warn('⚠️  Failed to register SpamFilter:', getErrorMessage(error));
      }
    }

    // Register ValidationFilter if enabled
    if (this.config.filters.validation.enabled) {
      const validationFilter = new ValidationFilter();
      
      try {
        await validationFilter.initialize({ engine: this.engine });
        this.filterChain.addFilter(validationFilter);
        logger.debug('✅ ValidationFilter registered successfully');
      } catch (error) {
        logger.warn('⚠️  Failed to register ValidationFilter:', getErrorMessage(error));
      }
    }
  }

  /**
   * Register default syntax handlers based on configuration
   */
  async registerDefaultHandlers(): Promise<void> {
    if (!this.config.enabled) {
      return;
    }

    // NOTE: EscapedSyntaxHandler and VariableSyntaxHandler removed in favor of DOM-based parsing
    // See Issue #110 - JSPWiki Variable Syntax
    // The DOM parser (Phase 0) handles escaping and variables without regex interference

    // Register JSPWikiPreprocessor (Phase 1) - processes %%.../%% blocks and tables BEFORE markdown
    const jspwikiPreprocessor = new JSPWikiPreprocessor(this.engine);

    try {
      await this.registerHandler(jspwikiPreprocessor);
      logger.debug('📋 JSPWikiPreprocessor registered successfully (Phase 1)');
    } catch (error) {
      logger.warn('⚠️  Failed to register JSPWikiPreprocessor:', getErrorMessage(error));
    }

    // Register PluginSyntaxHandler if enabled
    if (this.config.handlers.plugin.enabled) {
      const pluginHandler = new PluginSyntaxHandler(this.engine);

      try {
        await this.registerHandler(pluginHandler);
        logger.debug('🔌 PluginSyntaxHandler registered successfully');
      } catch (error) {
        logger.warn('⚠️  Failed to register PluginSyntaxHandler:', getErrorMessage(error));
      }
    }

    // Register WikiTagHandler if enabled
    if (this.config.handlers.wikitag.enabled) {
      const wikiTagHandler = new WikiTagHandler(this.engine);
      
      try {
        await this.registerHandler(wikiTagHandler);
        logger.debug('🏷️  WikiTagHandler registered successfully');
      } catch (error) {
        logger.warn('⚠️  Failed to register WikiTagHandler:', getErrorMessage(error));
      }
    }

    // Register WikiFormHandler if enabled
    if (this.config.handlers.form.enabled) {
      const wikiFormHandler = new WikiFormHandler(this.engine);
      
      try {
        await this.registerHandler(wikiFormHandler);
        logger.debug('📝 WikiFormHandler registered successfully');
      } catch (error) {
        logger.warn('⚠️  Failed to register WikiFormHandler:', getErrorMessage(error));
      }
    }

    // InterWikiLinkHandler is now replaced by unified LinkParserHandler
    // Registration moved to after WikiStyleHandler for optimal priority

    // Register AttachmentHandler if enabled (Phase 3)
    if (this.config.handlers.attachment.enabled) {
      const attachmentHandler = new AttachmentHandler(this.engine);
      
      try {
        await this.registerHandler(attachmentHandler);
        logger.debug('📎 AttachmentHandler registered successfully');
      } catch (error) {
        logger.warn('⚠️  Failed to register AttachmentHandler:', getErrorMessage(error));
      }
    }

    // WikiStyleHandler and WikiTableHandler are DEPRECATED
    // Replaced by JSPWikiPreprocessor which runs in Phase 1 (before markdown)
    // This ensures table headers stay together and aren't wrapped in <p> tags
    //
    // Old registration code kept for reference (disabled):
    // if (this.config.handlers.style.enabled) {
    //   const WikiStyleHandler = require('./handlers/WikiStyleHandler');
    //   const styleHandler = new WikiStyleHandler(this.engine);
    //   await this.registerHandler(styleHandler);
    // }
    // const WikiTableHandler = require('./handlers/WikiTableHandler');
    // const tableHandler = new WikiTableHandler(this.engine);
    // await this.registerHandler(tableHandler);

    // Register LinkParserHandler (unified link processing replacing WikiLinkHandler + InterWikiLinkHandler)
    const linkParserHandler = new LinkParserHandler(this.engine);

    try {
      await this.registerHandler(linkParserHandler);
      logger.debug('🔗 LinkParserHandler registered successfully (unified link processing for all link types)');
    } catch (error) {
      logger.warn('⚠️  Failed to register LinkParserHandler - CRITICAL ISSUE:', getErrorMessage(error));
    }

    const handlerCount = this.getHandlers().length;
    logger.debug(`🎯 Registered ${handlerCount} syntax handlers total`);
    
    if (handlerCount > 0) {
      const handlerNames = this.getHandlers().map(h => (h as { handlerId: string }).handlerId).join(', ');
      logger.debug(`📋 Active handlers: ${handlerNames}`);
    }
  }

  /**
   * Load configuration from ConfigurationManager
   */
  loadConfiguration(): void {
    const configManager = this.engine.getManager<ConfigurationManagerInterface>('ConfigurationManager');
    
    // Default configuration
    this.config = {
      enabled: true,
      caching: true,
      cacheTTL: 300,
      handlerRegistry: {
        maxHandlers: 100,
        allowDuplicatePriorities: true,
        enableDependencyResolution: true,
        enableConflictDetection: true,
        defaultTimeout: 5000
      },
      handlers: {
        plugin: { enabled: true, priority: 90 },
        wikitag: { enabled: true, priority: 95 },
        form: { enabled: true, priority: 85 },
        interwiki: { enabled: true, priority: 80 },
        attachment: { enabled: true, priority: 75, enhanced: true, thumbnails: true, metadata: true },
        style: { enabled: true, priority: 70 },
        wikilink: { enabled: true, priority: 50 }, // ESSENTIAL for basic functionality
        search: { enabled: true, priority: 65 },
        rss: { enabled: true, priority: 60 }
      },
      filters: {
        enabled: true,
        spam: { enabled: true },
        security: { enabled: true },
        validation: { enabled: true }
      },
      cache: {
        parseResults: { enabled: true, ttl: 300, maxSize: 1000 },
        handlerResults: { enabled: true, ttl: 600, maxSize: 2000 },
        patterns: { enabled: true, ttl: 3600, maxSize: 100 },
        variables: { enabled: true, ttl: 900, maxSize: 500 },
        enableWarmup: true,
        metricsEnabled: true
      },
      performance: {
        monitoring: true,
        alertThresholds: {
          parseTime: 100, // ms
          cacheHitRatio: 0.2, // 20%
          errorRate: 0.05, // 5%
          minCacheSamples: 50 // Minimum cache operations before alerting
        }
      }
    };

    // Load from configuration manager if available
    if (configManager) {
      try {
        this.config.enabled = configManager.getProperty('amdwiki.markup.enabled', this.config.enabled);
        this.config.caching = configManager.getProperty('amdwiki.markup.caching', this.config.caching);
        this.config.cacheTTL = configManager.getProperty('amdwiki.markup.cacheTTL', this.config.cacheTTL);
        
        // Handler registry configuration
        this.config.handlerRegistry.maxHandlers = configManager.getProperty('amdwiki.markup.handlerRegistry.maxHandlers', this.config.handlerRegistry.maxHandlers);
        this.config.handlerRegistry.allowDuplicatePriorities = configManager.getProperty('amdwiki.markup.handlerRegistry.allowDuplicatePriorities', this.config.handlerRegistry.allowDuplicatePriorities);
        this.config.handlerRegistry.enableDependencyResolution = configManager.getProperty('amdwiki.markup.handlerRegistry.enableDependencyResolution', this.config.handlerRegistry.enableDependencyResolution);
        this.config.handlerRegistry.enableConflictDetection = configManager.getProperty('amdwiki.markup.handlerRegistry.enableConflictDetection', this.config.handlerRegistry.enableConflictDetection);
        this.config.handlerRegistry.defaultTimeout = configManager.getProperty('amdwiki.markup.handlerRegistry.defaultTimeout', this.config.handlerRegistry.defaultTimeout);
        
        // Individual handler configuration
        for (const handlerName of Object.keys(this.config.handlers)) {
          const handler = this.config.handlers[handlerName];
          handler.enabled = configManager.getProperty(`amdwiki.markup.handlers.${handlerName}.enabled`, handler.enabled);
          handler.priority = configManager.getProperty(`amdwiki.markup.handlers.${handlerName}.priority`, handler.priority);
          
          // Advanced attachment handler configuration
          if (handlerName === 'attachment') {
            handler.enhanced = configManager.getProperty('amdwiki.markup.handlers.attachment.enhanced', handler.enhanced);
            handler.thumbnails = configManager.getProperty('amdwiki.markup.handlers.attachment.thumbnails', handler.thumbnails);
            handler.metadata = configManager.getProperty('amdwiki.markup.handlers.attachment.metadata', handler.metadata);
          }
        }
        
        // Filter configuration
        this.config.filters.enabled = configManager.getProperty('amdwiki.markup.filters.enabled', this.config.filters.enabled);
        this.config.filters.spam.enabled = configManager.getProperty('amdwiki.markup.filters.spam.enabled', this.config.filters.spam.enabled);
        this.config.filters.security.enabled = configManager.getProperty('amdwiki.markup.filters.security.enabled', this.config.filters.security.enabled);
        this.config.filters.validation.enabled = configManager.getProperty('amdwiki.markup.filters.validation.enabled', this.config.filters.validation.enabled);
        
        // Advanced cache configuration
        this.config.cache.parseResults.enabled = configManager.getProperty('amdwiki.markup.cache.parseResults.enabled', this.config.cache.parseResults.enabled);
        this.config.cache.parseResults.ttl = configManager.getProperty('amdwiki.markup.cache.parseResults.ttl', this.config.cache.parseResults.ttl);
        this.config.cache.parseResults.maxSize = configManager.getProperty('amdwiki.markup.cache.parseResults.maxSize', this.config.cache.parseResults.maxSize);
        this.config.cache.handlerResults.enabled = configManager.getProperty('amdwiki.markup.cache.handlerResults.enabled', this.config.cache.handlerResults.enabled);
        this.config.cache.handlerResults.ttl = configManager.getProperty('amdwiki.markup.cache.handlerResults.ttl', this.config.cache.handlerResults.ttl);
        this.config.cache.handlerResults.maxSize = configManager.getProperty('amdwiki.markup.cache.handlerResults.maxSize', this.config.cache.handlerResults.maxSize);
        this.config.cache.patterns.enabled = configManager.getProperty('amdwiki.markup.cache.patterns.enabled', this.config.cache.patterns.enabled);
        this.config.cache.patterns.ttl = configManager.getProperty('amdwiki.markup.cache.patterns.ttl', this.config.cache.patterns.ttl);
        this.config.cache.variables.enabled = configManager.getProperty('amdwiki.markup.cache.variables.enabled', this.config.cache.variables.enabled);
        this.config.cache.variables.ttl = configManager.getProperty('amdwiki.markup.cache.variables.ttl', this.config.cache.variables.ttl);
        this.config.cache.enableWarmup = configManager.getProperty('amdwiki.markup.cache.enableWarmup', this.config.cache.enableWarmup);
        this.config.cache.metricsEnabled = configManager.getProperty('amdwiki.markup.cache.metricsEnabled', this.config.cache.metricsEnabled);
        
        // Performance monitoring configuration
        this.config.performance.monitoring = configManager.getProperty('amdwiki.markup.performance.monitoring', this.config.performance.monitoring);
        this.config.performance.alertThresholds.parseTime = configManager.getProperty('amdwiki.markup.performance.alertThresholds.parseTime', this.config.performance.alertThresholds.parseTime);
        this.config.performance.alertThresholds.cacheHitRatio = configManager.getProperty('amdwiki.markup.performance.alertThresholds.cacheHitRatio', this.config.performance.alertThresholds.cacheHitRatio);
        this.config.performance.alertThresholds.errorRate = configManager.getProperty('amdwiki.markup.performance.alertThresholds.errorRate', this.config.performance.alertThresholds.errorRate);
        this.config.performance.alertThresholds.minCacheSamples = configManager.getProperty('amdwiki.markup.performance.alertThresholds.minCacheSamples', this.config.performance.alertThresholds.minCacheSamples);
        
      } catch (err) {
        logger.warn('⚠️  Failed to load MarkupParser config from ConfigurationManager, using defaults:', getErrorMessage(err));
      }
    }
  }

  /**
   * Configure handler registry with loaded configuration
   * NOTE: Removed - HandlerRegistry.config is private, no public setter available.
   * HandlerRegistry uses default configuration which is sufficient.
   */
  // configureHandlerRegistry() {
  //   // Apply configuration to handler registry
  //   this.handlerRegistry.config = {
  //     ...this.handlerRegistry.config,
  //     ...this.config.handlerRegistry
  //   };
  // }

  /**
   * Initialize advanced caching integration with multiple cache strategies
   */
  async initializeAdvancedCaching(): Promise<void> {
    if (!this.config.caching) {
      logger.debug('🗄️  MarkupParser caching disabled by configuration');
      return;
    }
    
    const cacheManager = this.engine.getManager<CacheManagerInterface>('CacheManager');
    if (!cacheManager || !cacheManager.isInitialized()) {
      logger.warn('⚠️  CacheManager not available, parsing will not be cached');
      return;
    }

    // Initialize multiple cache strategies
    this.cacheStrategies = {};

    // Parse Results Cache - Full content parsing results
    if (this.config.cache.parseResults.enabled) {
      this.cacheStrategies.parseResults = cacheManager.region('MarkupParser-ParseResults');
      this.metrics.cacheMetrics.set('parseResults', { hits: 0, misses: 0, sets: 0 });
    }

    // Handler Results Cache - Individual handler outputs
    if (this.config.cache.handlerResults.enabled) {
      this.cacheStrategies.handlerResults = cacheManager.region('MarkupParser-HandlerResults');
      this.metrics.cacheMetrics.set('handlerResults', { hits: 0, misses: 0, sets: 0 });
    }

    // Pattern Compilation Cache - Pre-compiled regex patterns
    if (this.config.cache.patterns.enabled) {
      this.cacheStrategies.patterns = cacheManager.region('MarkupParser-Patterns');
      this.metrics.cacheMetrics.set('patterns', { hits: 0, misses: 0, sets: 0 });
    }

    // Variable Resolution Cache - System variable lookups
    if (this.config.cache.variables.enabled) {
      this.cacheStrategies.variables = cacheManager.region('MarkupParser-Variables');
      this.metrics.cacheMetrics.set('variables', { hits: 0, misses: 0, sets: 0 });
    }

    // Set legacy cache reference for backward compatibility
    this.cache = this.cacheStrategies.parseResults || null;

    const strategiesCount = Object.keys(this.cacheStrategies).length;
    logger.debug(`🗄️  MarkupParser advanced caching initialized with ${strategiesCount} strategies`);
    logger.debug(`📊 Cache TTLs: parse=${this.config.cache.parseResults.ttl}s, handlers=${this.config.cache.handlerResults.ttl}s, patterns=${this.config.cache.patterns.ttl}s`);

    // Perform cache warmup if enabled
    if (this.config.cache.enableWarmup) {
      await this.performCacheWarmup();
    }
  }

  /**
   * Initialize performance monitoring system
   */
  initializePerformanceMonitoring(): void {
    if (!this.config.performance.monitoring) {
      return;
    }

    this.performanceMonitor = {
      alerts: [],
      lastCheck: Date.now(),
      checkInterval: 60000, // 1 minute
      
      // Performance tracking
      recentParseTimes: [],
      recentErrorRates: [],
      maxRecentEntries: 100
    };

    logger.debug('📊 Performance monitoring initialized with alert thresholds:', this.config.performance.alertThresholds);
  }

  /**
   * Perform cache warmup for frequently accessed content
   */
  async performCacheWarmup(): Promise<void> {
    logger.debug('🔥 Starting MarkupParser cache warmup...');
    
    try {
      // Warm up common patterns
      const commonPatterns = [
        /\[\{(\w+)\s*([^}]*)\}\]/g, // Plugin syntax
        /\$\{(\w+)\}/g, // Variable syntax
        /\[\w+:\w+\]/g, // InterWiki syntax
        /<wiki:(\w+)/g // WikiTag syntax
      ];

      for (const pattern of commonPatterns) {
        if (this.cacheStrategies.patterns) {
          const cacheKey = `pattern:${pattern.source}`;
          await this.cacheStrategies.patterns.set(cacheKey, pattern, { ttl: this.config.cache.patterns.ttl });
        }
      }

      // Warm up common variables
      const commonVariables = ['pagename', 'username', 'applicationname', 'version', 'totalpages'];
      if (this.cacheStrategies.variables) {
        const variableManager = this.engine.getManager<VariableManagerInterface>('VariableManager');
        if (variableManager) {
          for (const varName of commonVariables) {
            try {
              const cacheKey = `var:${varName}:default`;
              const value = await this.resolveSystemVariable(varName, {});
              await this.cacheStrategies.variables.set(cacheKey, value, { ttl: this.config.cache.variables.ttl });
            } catch {
              // Skip variables that can't be resolved without context
            }
          }
        }
      }

      logger.debug('🔥 Cache warmup completed');
      
    } catch (error) {
      logger.warn('⚠️  Cache warmup failed:', getErrorMessage(error));
    }
  }

  /**
   * Resolve system variable for cache warmup
   * @param varName - Variable name
   * @param context - Context object
   * @returns Variable value
   */
  async resolveSystemVariable(varName: string, context: Record<string, unknown>): Promise<string> {
    const variableManager = this.engine.getManager<VariableManagerInterface>('VariableManager');
    if (!variableManager) {
      throw new Error('VariableManager not available');
    }

    // Create minimal context for system variables
    const minimalContext = {
      pageName: 'warmup',
      userName: 'system',
      ...context
    };

    return variableManager.expandVariables(`\${${varName}}`, minimalContext);
  }

  /**
   * Main parsing method - uses WikiDocument DOM extraction pipeline
   * @param content - Raw content to parse
   * @param context - Parsing context (page, user, etc.)
   * @returns Processed HTML content
   */
  async parse(content: string, context: Record<string, unknown> = {}): Promise<string> {
    if (!content) {
      return '';
    }

    // Check if MarkupParser is enabled
    if (!this.config.enabled) {
      logger.debug('🔧 MarkupParser disabled, falling back to basic rendering');
      // Fall back to basic markdown conversion
      const renderingManager = this.engine.getManager<RenderingManagerInterface>('RenderingManager');
      if (renderingManager && renderingManager.converter) {
        return renderingManager.converter.makeHtml(content);
      }
      return content;
    }

    const startTime = Date.now();
    this.metrics.parseCount++;

    try {
      logger.debug('🔄 Using WikiDocument DOM extraction pipeline');

      // Check cache first
      const cacheKey = this.generateCacheKey(content, context);
      if (this.cacheStrategies.parseResults) {
        const cached = await this.getCachedParseResult(cacheKey);
        if (cached) {
          this.updateCacheMetrics('parseResults', 'hit');
          this.metrics.cacheHits++;
          this.updatePerformanceMetrics(Date.now() - startTime, true);
          logger.debug(`✅ Cache hit for extraction pipeline (${Date.now() - startTime}ms)`);
          return cached;
        }
        this.updateCacheMetrics('parseResults', 'miss');
        this.metrics.cacheMisses++;
      }

      // Parse using extraction pipeline
      const result = await this.parseWithDOMExtraction(content, context);

      // Cache the result
      await this.cacheParseResult(cacheKey, result);

      // Update metrics
      const processingTime = Date.now() - startTime;
      this.metrics.totalParseTime += processingTime;
      this.updatePerformanceMetrics(processingTime, false);

      logger.debug(`✅ Extraction pipeline completed (${processingTime}ms)`);

      // Warn if parse time is slow
      if (processingTime > 100) {
        const contextData = context as ParseContextData;
        logger.warn(`⚠️  Slow parse: ${processingTime}ms for page ${contextData.pageName || 'unknown'}`);
      }

      return result;

    } catch (error) {
      logger.error('❌ Extraction pipeline error:', error);
      this.metrics.errorCount++;

      // Return original content on critical failure
      return content;
    }
  }

  /**
   * Register a syntax handler
   * @param handler - Handler instance
   * @param options - Registration options
   * @returns True if registration successful
   */
  async registerHandler(handler: BaseSyntaxHandler, options: Record<string, unknown> = {}): Promise<boolean> {
    // Check if handler type is enabled in configuration
    const handlerType = this.getHandlerTypeFromId(handler.handlerId);
    if (handlerType && this.config.handlers[handlerType] && !this.config.handlers[handlerType].enabled) {
      logger.debug(`🔧 Handler ${handler.handlerId} disabled by configuration, skipping registration`);
      return false;
    }
    
    return await this.handlerRegistry.registerHandler(handler, options);
  }

  /**
   * Get handler type from handler ID for configuration lookup (modular mapping)
   * @param handlerId - Handler ID
   * @returns Handler type or null
   */
  getHandlerTypeFromId(handlerId: string): string | null {
    const typeMap: Record<string, string> = {
      // Phase 2 handlers
      'PluginSyntaxHandler': 'plugin',
      'WikiTagHandler': 'wikitag',
      'WikiFormHandler': 'form',

      // Phase 3 handlers (advanced)
      'AttachmentHandler': 'attachment',
      'WikiStyleHandler': 'style',
      'LinkParserHandler': 'linkparser', // Unified handler replacing both WikiLinkHandler and InterWikiLinkHandler
      'SearchPluginHandler': 'search',
      'RSSHandler': 'rss',
      
      // Future Phase 4 handlers (filters)
      'SpamFilterHandler': 'filter-spam',
      'SecurityFilterHandler': 'filter-security',
      'ValidationFilterHandler': 'filter-validation'
    };
    
    return typeMap[handlerId] || null;
  }

  /**
   * Get configuration for a specific handler type
   * @param handlerType - Handler type (plugin, wikitag, etc.)
   * @returns Handler configuration
   */
  getHandlerConfig(handlerType: string): HandlerConfig {
    return this.config.handlers[handlerType] || { enabled: true, priority: 100 };
  }

  /**
   * Unregister a syntax handler
   * @param handlerId - Handler identifier
   * @returns True if unregistration successful
   */
  async unregisterHandler(handlerId: string): Promise<boolean> {
    return await this.handlerRegistry.unregisterHandler(handlerId);
  }

  /**
   * Get handler by ID
   * @param handlerId - Handler identifier
   * @returns Handler or null if not found
   */
  getHandler(handlerId: string): unknown {
    return this.handlerRegistry.getHandler(handlerId);
  }

  /**
   * Get all handlers sorted by priority
   * @param enabledOnly - Only return enabled handlers
   * @returns Handlers sorted by priority
   */
  getHandlers(enabledOnly = true): unknown[] {
    return this.handlerRegistry.getHandlersByPriority(enabledOnly);
  }

  /**
   * Enable handler by ID
   * @param handlerId - Handler identifier
   * @returns True if successful
   */
  enableHandler(handlerId: string): boolean {
    return this.handlerRegistry.enableHandler(handlerId);
  }

  /**
   * Disable handler by ID
   * @param handlerId - Handler identifier
   * @returns True if successful
   */
  disableHandler(handlerId: string): boolean {
    return this.handlerRegistry.disableHandler(handlerId);
  }

  /**
   * Generate cache key for content and context
   * @param content - Content to cache
   * @param context - Parse context
   * @returns Cache key
   */
  generateCacheKey(content: string, context: ParseContextData): string {
    const contentHash = crypto.createHash('md5').update(content).digest('hex');
    const contextHash = crypto.createHash('md5')
      .update(JSON.stringify({
        pageName: context.pageName,
        userName: context.userName,
        timestamp: Math.floor(Date.now() / 300000) // 5-minute buckets
      }))
      .digest('hex');
    
    return `parse:${contentHash}:${contextHash}`;
  }

  /**
   * Extract JSPWiki-specific syntax from content for DOM-based processing
   *
   * This method implements the pre-extraction strategy from Issue #114.
   * Instead of tokenizing both markdown and JSPWiki syntax (which causes conflicts),
   * we extract ONLY JSPWiki syntax and let Showdown handle all markdown.
   *
   * Extraction order:
   * 1. Variables: [{$username}] → __JSPWIKI_uuid_0__
   * 2. Plugins: [{TableOfContents}] → __JSPWIKI_uuid_1__
   * 3. Escaped: [[{$var}] → __JSPWIKI_uuid_2__ (stores literal [{$var}])
   * 4. Wiki links: [PageName] → __JSPWIKI_uuid_3__ (but not markdown [text](url))
   *
   * Code blocks are already protected by Phase 1 preprocessing, so JSPWiki syntax
   * inside code blocks won't be extracted.
   *
   * @param {string} content - Raw wiki content
   * @param {ParseContext} context - Parse context (for code block protection)
   * @returns {Object} - { sanitized, jspwikiElements, uuid }
   *
   * Related: #114 (WikiDocument DOM Solution), #115 (Phase 1 Implementation)
   *
   * @example
   * const input = "## Heading\n\nUser: [{$username}]";
   * const { sanitized, jspwikiElements, uuid } = parser.extractJSPWikiSyntax(input);
   * // sanitized: "## Heading\n\nUser: <span data-jspwiki-placeholder="abc123-0"></span>"
   * // jspwikiElements: [{ type: 'variable', varName: '$username', id: 0, ... }]
   * // uuid: "abc123"
   */
  extractJSPWikiSyntax(content: string, _context: Record<string, unknown> = {}): { sanitized: string; jspwikiElements: ExtractedElement[]; uuid: string } {
    const jspwikiElements: ExtractedElement[] = [];
    const uuid = crypto.randomUUID().substring(0, 8);
    let sanitized = content;
    let id = 0;

    // IMPORTANT: Extraction order matters!

    // Step 0: Protect code blocks from JSPWiki extraction
    // Code blocks should not have JSPWiki syntax processed
    const codeBlocks: Array<{ placeholder: string; content: string }> = [];
    let codeBlockId = 0;

    // Protect fenced code blocks (```...```)
    sanitized = sanitized.replace(/```[\s\S]*?```/g, (match) => {
      const placeholder = `__CODEBLOCK_${codeBlockId++}__`;
      codeBlocks.push({ placeholder, content: match });
      return placeholder;
    });

    // Protect inline code (`...`)
    sanitized = sanitized.replace(/`[^`]+`/g, (match) => {
      const placeholder = `__CODEBLOCK_${codeBlockId++}__`;
      codeBlocks.push({ placeholder, content: match });
      return placeholder;
    });

    // Step 0.5: Extract JSPWiki style blocks %%class-name ... /%
    // This MUST happen before other extractions because style blocks may contain
    // JSPWiki syntax (tables, links, etc.) that needs special processing
    // Matches: %%table-striped\n|| Header ||\n| Data |\n/%
    // Pattern: %%class-name (on its own line) ... /% (on its own line)
    const styleBlockPattern = /^%%([a-zA-Z0-9_-]+)\s*$([\s\S]*?)^\/%(?: *)?$/gm;
    sanitized = sanitized.replace(styleBlockPattern, (match: string, className: string, blockContent: string, offset: number) => {
      jspwikiElements.push({
        type: 'style',
        syntax: match,
        className: className.trim(),
        styleContent: blockContent.trim(),
        id: id++,
        position: offset
      });
      return `<span data-jspwiki-placeholder="${uuid}-${id - 1}"></span>`;
    });

    // Step 1: Extract ESCAPED syntax FIRST (before anything else)
    // Matches: [[{$var}], [[{Plugin}]
    // Result: Literal [{$var}] or [{Plugin}] in output
    sanitized = sanitized.replace(/\[\[\{([^}]+)\}\]/g, (match: string, inner: string, offset: number) => {
      jspwikiElements.push({
        type: 'escaped',
        syntax: match,
        literal: `[{${inner}}]`, // What should appear in output
        id: id++,
        position: offset
      });
      return `<span data-jspwiki-placeholder="${uuid}-${id - 1}"></span>`;
    });

    // Step 2: Extract variables [{$varname}]
    // Matches: [{$username}], [{$pagename}], etc.
    // Does NOT match: [{Plugin}], [[{$escaped}] (already extracted)
    sanitized = sanitized.replace(/\[\{(\$\w+)\}\]/g, (match: string, varName: string, offset: number) => {
      jspwikiElements.push({
        type: 'variable',
        syntax: match,
        varName: varName, // Includes the $
        id: id++,
        position: offset
      });
      return `<span data-jspwiki-placeholder="${uuid}-${id - 1}"></span>`;
    });

    // Step 3: Extract plugins [{PluginName params}]
    // Matches: [{TableOfContents}], [{Search query='wiki'}]
    // Does NOT match: [{$variable}] (already extracted), [{] (malformed)
    // Requires: At least one word character after [{
    sanitized = sanitized.replace(/\[\{([A-Za-z]\w*[^}]*)\}\]/g, (match: string, inner: string, offset: number) => {
      jspwikiElements.push({
        type: 'plugin',
        syntax: match,
        inner: inner.trim(),
        id: id++,
        position: offset
      });
      return `<span data-jspwiki-placeholder="${uuid}-${id - 1}"></span>`;
    });

    // Step 4: Extract wiki links [PageName] or [Text|Target]
    // Matches: [HomePage], [Click Here|HomePage]
    // Does NOT match: [text](url) - markdown links (negative lookahead)
    // Does NOT match: [}] (malformed)
    // Does NOT match: [^id] - markdown footnote references
    // Note: This runs last to avoid conflicts with escaped/variable/plugin syntax
    sanitized = sanitized.replace(/\[([^\][{^][^\]]*)\](?!\()/g, (match: string, target: string, offset: number) => {
      jspwikiElements.push({
        type: 'link',
        syntax: match,
        target: target.trim(),
        id: id++,
        position: offset
      });
      return `<span data-jspwiki-placeholder="${uuid}-${id - 1}"></span>`;
    });

    // Step 5: Restore code blocks
    for (const { placeholder, content } of codeBlocks) {
      sanitized = sanitized.replace(placeholder, content);
    }

    return {
      sanitized,      // Content with JSPWiki syntax replaced by placeholders
      jspwikiElements, // Array of extracted elements with metadata
      uuid            // Unique identifier for this extraction (prevents collisions)
    };
  }

  /**
   * Creates a text node for escaped JSPWiki syntax
   *
   * This is a helper method for Phase 2 DOM node creation (Issue #116).
   * Escaped syntax like [[{$var}]] should render as literal text [{$var}].
   *
   * @param element - Extracted escaped element
   * @param wikiDocument - WikiDocument to create node in
   * @returns DOM node containing the escaped literal text
   *
   * @example
   * const element = { type: 'escaped', literal: '[{$username}]', id: 0, ... };
   * const node = createTextNodeForEscaped(element, wikiDoc);
   * // Returns: <span class="wiki-escaped" data-jspwiki-id="0">[{$username}]</span>
   */
  createTextNodeForEscaped(element: ExtractedElement, wikiDocument: WikiDocument): unknown {
    // Create a span element to maintain consistency with other handlers
    // (all handlers return elements with data-jspwiki-id for merge phase)
    const node = wikiDocument.createElement('span', {
      'class': 'wiki-escaped',
      'data-jspwiki-id': element.id.toString()
    });

    // Set the literal text content (already extracted in element.literal)
    node.textContent = element.literal ?? '';

    return node;
  }

  /**
   * Creates a DOM node from a JSPWiki style block (%%class-name ... /%)
   *
   * This handles table-related style classes (table-striped, sortable, etc.)
   * by parsing JSPWiki table syntax and creating HTML tables with proper styling.
   * For non-table styles, wraps content in a styled div/span.
   *
   * @param element - Extracted style element
   * @param context - Rendering context
   * @param wikiDocument - WikiDocument to create node in
   * @returns DOM node for the styled content
   *
   * @example
   * // For table styles:
   * const element = { type: 'style', className: 'table-striped', styleContent: '|| H1 ||\n| D1 |' };
   * const node = createNodeFromStyleBlock(element, context, wikiDoc);
   * // Returns: <table class="table table-striped">...</table>
   */
  createNodeFromStyleBlock(element: ExtractedElement, _context: ParseContext, wikiDocument: WikiDocument): unknown {
    const className = element.className ?? '';
    const content = element.styleContent ?? '';

    // Table-related classes that need special handling
    const tableClasses = [
      'sortable', 'table-sort', 'table-filter',
      'zebra-table', 'table-striped', 'table-hover',
      'table-fit', 'table-bordered', 'table-sm', 'table-responsive',
      'table-condensed'
    ];

    const isTableClass = tableClasses.includes(className) || /^zebra-[0-9a-fA-F]{6}$/.test(className);

    // Check if content contains JSPWiki table syntax
    const hasTableSyntax = /^\s*\|/m.test(content);

    if (isTableClass && hasTableSyntax) {
      // Parse JSPWiki table and create HTML table with style class
      return this.createTableNode(content, className, element.id, wikiDocument);
    }

    // For non-table styles or content without table syntax, wrap in div
    const divNode = wikiDocument.createElement('div', {
      'class': className,
      'data-jspwiki-id': element.id.toString()
    });
    divNode.textContent = content;
    return divNode;
  }

  /**
   * Creates an HTML table node from JSPWiki table syntax
   *
   * @param content - JSPWiki table content (|| header || and | cell | syntax)
   * @param className - CSS class to apply (e.g., 'table-striped')
   * @param elementId - Element ID for tracking
   * @param wikiDocument - WikiDocument to create node in
   * @returns HTML table element
   */
  private createTableNode(content: string, className: string, elementId: number, wikiDocument: WikiDocument): unknown {
    const lines = content.split('\n').filter(line => /^\s*\|/.test(line));

    // Parse rows
    const rows: Array<{ isHeader: boolean; cells: string[] }> = [];
    for (const line of lines) {
      const trimmed = line.trim();
      const isHeader = trimmed.startsWith('||') && trimmed.endsWith('||');

      let cells: string[];
      if (isHeader) {
        const inner = trimmed.slice(2, -2);
        cells = inner.split('||').map(c => c.trim());
      } else {
        const inner = trimmed.slice(1, -1);
        cells = inner.split('|').map(c => c.trim());
      }

      rows.push({ isHeader, cells });
    }

    // Build CSS classes - always include 'table' base class
    const classes = ['table'];
    if (className) {
      classes.push(className);
    }

    // Create table element
    const table = wikiDocument.createElement('table', {
      'class': classes.join(' '),
      'data-jspwiki-id': elementId.toString()
    });

    // Separate header and body rows
    const headerRows = rows.filter(r => r.isHeader);
    const bodyRows = rows.filter(r => !r.isHeader);

    // Create thead if there are header rows
    if (headerRows.length > 0) {
      const thead = wikiDocument.createElement('thead', {});
      for (const row of headerRows) {
        const tr = wikiDocument.createElement('tr', {});
        for (const cell of row.cells) {
          const th = wikiDocument.createElement('th', {});
          th.textContent = cell;
          tr.appendChild(th);
        }
        thead.appendChild(tr);
      }
      table.appendChild(thead);
    }

    // Create tbody if there are body rows
    if (bodyRows.length > 0) {
      const tbody = wikiDocument.createElement('tbody', {});
      for (const row of bodyRows) {
        const tr = wikiDocument.createElement('tr', {});
        for (const cell of row.cells) {
          const td = wikiDocument.createElement('td', {});
          td.textContent = cell;
          tr.appendChild(td);
        }
        tbody.appendChild(tr);
      }
      table.appendChild(tbody);
    }

    return table;
  }

  /**
   * Creates a DOM node from an extracted element (Phase 2 dispatcher)
   *
   * This is the dispatcher method for Phase 2 that routes extracted elements
   * to the appropriate handler based on element type.
   *
   * @param element - Extracted element from extractJSPWikiSyntax()
   * @param context - Rendering context
   * @param wikiDocument - WikiDocument to create node in
   * @returns DOM node for the element
   *
   * @example
   * const element = { type: 'variable', varName: '$username', id: 0 };
   * const node = await createDOMNode(element, context, wikiDoc);
   * // Returns: <span class="wiki-variable">JohnDoe</span>
   */
  async createDOMNode(element: ExtractedElement, context: ParseContext, wikiDocument: WikiDocument): Promise<unknown> {
    // Cast context to Record for handler compatibility (handlers extract what they need)
    const handlerContext = context as unknown as Record<string, unknown>;

    switch (element.type) {
    case 'variable':
      // Variable: [{$username}]
      return await this.domVariableHandler.createNodeFromExtract(
        element as unknown as Parameters<typeof this.domVariableHandler.createNodeFromExtract>[0],
        handlerContext as Parameters<typeof this.domVariableHandler.createNodeFromExtract>[1],
        wikiDocument
      );

    case 'plugin':
      // Plugin: [{TableOfContents}]
      return await this.domPluginHandler.createNodeFromExtract(
        element as unknown as Parameters<typeof this.domPluginHandler.createNodeFromExtract>[0],
        handlerContext as Parameters<typeof this.domPluginHandler.createNodeFromExtract>[1],
        wikiDocument
      );

    case 'link':
      // Link: [HomePage] or [Display|Target]
      return await this.domLinkHandler.createNodeFromExtract(
        element as unknown as Parameters<typeof this.domLinkHandler.createNodeFromExtract>[0],
        handlerContext as Parameters<typeof this.domLinkHandler.createNodeFromExtract>[1],
        wikiDocument
      );

    case 'escaped':
      // Escaped: [[{$var}]] → [{$var}]
      return this.createTextNodeForEscaped(element, wikiDocument);

    case 'style':
      // Style block: %%class-name ... /%
      return this.createNodeFromStyleBlock(element, context, wikiDocument);

    default: {
      logger.error(`❌ Unknown element type: ${String(element.type)}`);
      // Return error node
      const errorNode = wikiDocument.createElement('span', {
        'class': 'wiki-error',
        'data-jspwiki-id': element.id.toString()
      });
      errorNode.textContent = `[Error: Unknown type ${String(element.type)}]`;
      return errorNode;
    }
    }
  }

  /**
   * Merges DOM nodes back into Showdown-generated HTML (Phase 3)
   *
   * Replaces HTML comment placeholders (<!--JSPWIKI-uuid-id-->) in the HTML with
   * the rendered DOM nodes. Processes nodes in reverse ID order to
   * handle nested JSPWiki syntax correctly.
   *
   * Uses HTML comments as placeholders to avoid Showdown interpreting them as markdown.
   *
   * @param html - HTML from Showdown with placeholders
   * @param nodes - Array of DOM nodes with data-jspwiki-id
   * @param uuid - UUID from extraction phase
   * @returns Final HTML with nodes merged in
   *
   * @example
   * // Input HTML: "<p>User: <!--JSPWIKI-abc123-0--></p>"
   * // Node 0: <span data-jspwiki-id="0">JohnDoe</span>
   * // Output: "<p>User: <span>JohnDoe</span></p>"
   */
  mergeDOMNodes(html: string, nodes: unknown[], uuid: string): string {
    if (!nodes || nodes.length === 0) {
      return html;
    }

    let result = html;

    // Sort nodes by ID (descending) to handle nested replacements correctly
    // Example: Plugin containing variable must be replaced after the plugin
    const sortedNodes = Array.from(nodes).sort((a, b) => {
      const elemA = a as Element;
      const elemB = b as Element;
      const idA = parseInt(elemA.getAttribute('data-jspwiki-id') || '0');
      const idB = parseInt(elemB.getAttribute('data-jspwiki-id') || '0');
      return idB - idA; // Descending order
    });

    for (const node of sortedNodes) {
      const element = node as Element;
      const id = element.getAttribute('data-jspwiki-id');
      const placeholder = `<span data-jspwiki-placeholder="${uuid}-${id}"></span>`;

      // Render node to HTML
      let rendered: string;
      if (element.outerHTML) {
        rendered = element.outerHTML;
      } else if (element.textContent !== undefined) {
        // Fallback for nodes without outerHTML
        rendered = element.textContent;
      } else {
        // Empty node
        rendered = '';
      }

      // Replace placeholder with rendered HTML
      // Use regex with 'g' flag to replace all occurrences
      const placeholderRegex = new RegExp(placeholder.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
      result = result.replace(placeholderRegex, rendered);
    }

    return result;
  }

  /**
   * Parses wiki markup using DOM extraction strategy (Phase 1-3)
   *
   * This is the new parsing method that implements the WikiDocument DOM solution:
   * 1. Extract JSPWiki syntax (variables, plugins, links, escaped)
   * 2. Create DOM nodes from extracted elements
   * 3. Let Showdown parse the sanitized markdown
   * 4. Merge DOM nodes back into the HTML
   *
   * This approach fixes the markdown heading bug by letting Showdown handle
   * ALL markdown parsing while WikiDocument handles ONLY JSPWiki syntax.
   *
   * @param content - Wiki markup content
   * @param context - Rendering context
   * @returns Rendered HTML
   *
   * @example
   * const html = await parser.parseWithDOMExtraction('## Hello\nUser: [{$username}]', context);
   * // Returns: "<h2>Hello</h2>\n<p>User: <span>JohnDoe</span></p>"
   */
  async parseWithDOMExtraction(content: string, context: Record<string, unknown>): Promise<string> {
    logger.debug('🔄 Starting DOM extraction parse...');

    // Create ParseContext to properly extract nested userContext/requestInfo
    const parseContext = new ParseContext(content, context, this.engine);

    // Phase 1: Extract JSPWiki syntax
    const { sanitized, jspwikiElements, uuid } = this.extractJSPWikiSyntax(content, parseContext as unknown as Record<string, unknown>);
    logger.debug(`📦 Extracted ${jspwikiElements.length} JSPWiki elements`);

    // Phase 2: Create WikiDocument and build DOM nodes
    const wikiDocument = new WikiDocument(content);

    const nodes = [];
    for (const element of jspwikiElements) {
      try {
        const node = await this.createDOMNode(element, parseContext, wikiDocument);
        nodes.push(node);
      } catch (error) {
        logger.error(`❌ Error creating DOM node for element ${element.id}:`, getErrorMessage(error));
        // Create error node
        const errorNode = wikiDocument.createElement('span', {
          'class': 'wiki-error',
          'data-jspwiki-id': element.id.toString()
        });
        errorNode.textContent = `[Error: ${getErrorMessage(error)}]`;
        nodes.push(errorNode);
      }
    }
    logger.debug(`🔨 Created ${nodes.length} DOM nodes`);

    // Phase 3: Let Showdown parse the sanitized markdown
    const renderingManager = this.engine.getManager<RenderingManagerInterface>('RenderingManager');
    let showdownHtml: string;
    if (renderingManager && renderingManager.converter) {
      showdownHtml = renderingManager.converter.makeHtml(sanitized);
    } else {
      // Fallback if RenderingManager not available (testing)
      const converter = new showdown.Converter({
        tables: true,
        strikethrough: true,
        tasklists: true,
        simpleLineBreaks: false,
        ghCodeBlocks: true
      });
      showdownHtml = converter.makeHtml(sanitized);
    }
    logger.debug('📝 Showdown processed markdown');

    // Phase 4: Merge DOM nodes back into the HTML
    const finalHtml = this.mergeDOMNodes(showdownHtml, nodes, uuid);
    logger.debug('✅ Merge complete');

    return finalHtml;
  }

  /**
   * Get performance metrics
   */
  getMetrics(): ExtendedMetrics {
    const metrics: ExtendedMetrics = { ...this.metrics, averageParseTime: 0, cacheHitRatio: 0 };
    
    // Calculate averages
    metrics.averageParseTime = this.metrics.parseCount > 0 
      ? this.metrics.totalParseTime / this.metrics.parseCount 
      : 0;
    
    metrics.cacheHitRatio = (this.metrics.cacheHits + this.metrics.cacheMisses) > 0
      ? this.metrics.cacheHits / (this.metrics.cacheHits + this.metrics.cacheMisses)
      : 0;

    // Add handler registry metrics
    metrics.handlerRegistry = this.handlerRegistry.getStats();
    
    // Add filter chain metrics
    if (this.filterChain) {
      metrics.filterChain = this.filterChain.getStats();
    }

    // Add advanced cache metrics
    const cacheStrategies: Record<string, unknown> = {};
    this.metrics.cacheMetrics.forEach((cacheStats, strategy) => {
      const total = cacheStats.hits + cacheStats.misses;
      cacheStrategies[strategy] = {
        ...cacheStats,
        hitRatio: total > 0 ? cacheStats.hits / total : 0,
        total: total
      };
    });
    metrics.cacheStrategies = cacheStrategies;

    // Add performance monitoring data
    if (this.performanceMonitor) {
      // Calculate recent performance stats first
      const recentTimes = this.performanceMonitor.recentParseTimes.slice(-20);
      const nonCachedTimes = recentTimes.filter(entry => !entry.cacheHit);

      const recentStats = recentTimes.length > 0 ? {
        averageParseTime: nonCachedTimes.length > 0
          ? nonCachedTimes.reduce((sum, entry) => sum + entry.time, 0) / nonCachedTimes.length
          : 0,
        cachedParseCount: recentTimes.filter(entry => entry.cacheHit).length,
        nonCachedParseCount: nonCachedTimes.length
      } : null;

      metrics.performance = {
        monitoring: this.config.performance.monitoring,
        alertCount: this.performanceMonitor.alerts.length,
        recentParseCount: this.performanceMonitor.recentParseTimes.length,
        alerts: this.performanceMonitor.alerts.slice(-10), // Last 10 alerts
        recentStats
      };
    }

    return metrics;
  }

  /**
   * Reset performance metrics
   */
  resetMetrics(): void {
    this.metrics = {
      parseCount: 0,
      totalParseTime: 0,
      errorCount: 0,
      cacheHits: 0,
      cacheMisses: 0,
      cacheMetrics: new Map()
    };
  }

  /**
   * Get cached parse result
   * @param cacheKey - Cache key
   * @returns Cached result or null
   */
  async getCachedParseResult(cacheKey: string): Promise<string | null> {
    if (!this.cacheStrategies.parseResults) {
      return null;
    }
    
    try {
      return await this.cacheStrategies.parseResults.get(cacheKey) ?? null;
    } catch (error) {
      logger.warn('⚠️  Cache get failed:', getErrorMessage(error));
      return null;
    }
  }

  /**
   * Cache parse result
   * @param cacheKey - Cache key
   * @param content - Content to cache
   */
  async cacheParseResult(cacheKey: string, content: string): Promise<void> {
    if (!this.cacheStrategies.parseResults) {
      return;
    }
    
    try {
      await this.cacheStrategies.parseResults.set(cacheKey, content, { 
        ttl: this.config.cache.parseResults.ttl 
      });
      this.updateCacheMetrics('parseResults', 'set');
    } catch (error) {
      logger.warn('⚠️  Cache set failed:', getErrorMessage(error));
    }
  }

  /**
   * Get cached handler result
   * @param handlerId - Handler ID
   * @param contentHash - Content hash
   * @param contextHash - Context hash
   * @returns Cached result or null
   */
  async getCachedHandlerResult(handlerId: string, contentHash: string, contextHash: string): Promise<string | null> {
    if (!this.cacheStrategies.handlerResults) {
      return null;
    }
    
    try {
      const cacheKey = `handler:${handlerId}:${contentHash}:${contextHash}`;
      const result = await this.cacheStrategies.handlerResults.get(cacheKey);

      if (result) {
        this.updateCacheMetrics('handlerResults', 'hit');
        return result as string;
      } else {
        this.updateCacheMetrics('handlerResults', 'miss');
        return null;
      }
    } catch (error) {
      logger.warn('⚠️  Handler cache get failed:', getErrorMessage(error));
      return null;
    }
  }

  /**
   * Cache handler result
   * @param handlerId - Handler ID
   * @param contentHash - Content hash
   * @param contextHash - Context hash
   * @param result - Result to cache
   */
  async cacheHandlerResult(handlerId: string, contentHash: string, contextHash: string, result: string): Promise<void> {
    if (!this.cacheStrategies.handlerResults) {
      return;
    }
    
    try {
      const cacheKey = `handler:${handlerId}:${contentHash}:${contextHash}`;
      await this.cacheStrategies.handlerResults.set(cacheKey, result, { 
        ttl: this.config.cache.handlerResults.ttl 
      });
      this.updateCacheMetrics('handlerResults', 'set');
    } catch (error) {
      logger.warn('⚠️  Handler cache set failed:', getErrorMessage(error));
    }
  }

  /**
   * Update cache metrics for specific strategy
   * @param strategy - Cache strategy name
   * @param operation - Operation type (hit, miss, set)
   */
  updateCacheMetrics(strategy: string, operation: 'hit' | 'miss' | 'set'): void {
    if (!this.config.cache.metricsEnabled) {
      return;
    }
    
    const metrics = this.metrics.cacheMetrics.get(strategy);
    if (metrics) {
      metrics[operation === 'hit' ? 'hits' : operation === 'miss' ? 'misses' : 'sets']++;
    }
  }

  /**
   * Update performance metrics and check thresholds
   * @param processingTime - Processing time in milliseconds
   * @param cacheHit - Whether this was a cache hit
   */
  updatePerformanceMetrics(processingTime: number, cacheHit: boolean): void {
    if (!this.performanceMonitor) {
      return;
    }

    // Track recent parse times
    this.performanceMonitor.recentParseTimes.push({
      time: processingTime,
      cacheHit: cacheHit,
      timestamp: Date.now()
    });

    // Limit recent entries
    if (this.performanceMonitor.recentParseTimes.length > this.performanceMonitor.maxRecentEntries) {
      this.performanceMonitor.recentParseTimes.shift();
    }

    // Check performance thresholds
    this.checkPerformanceThresholds();
  }

  /**
   * Check performance thresholds and generate alerts
   */
  checkPerformanceThresholds(): void {
    if (!this.performanceMonitor) {
      return;
    }

    const now = Date.now();
    
    // Only check every minute
    if (now - this.performanceMonitor.lastCheck < this.performanceMonitor.checkInterval) {
      return;
    }

    this.performanceMonitor.lastCheck = now;

    // Check average parse time threshold
    const recentTimes = this.performanceMonitor.recentParseTimes
      .filter(entry => !entry.cacheHit) // Only non-cached times
      .slice(-20); // Last 20 entries

    if (recentTimes.length > 0) {
      const avgTime = recentTimes.reduce((sum, entry) => sum + entry.time, 0) / recentTimes.length;
      
      if (avgTime > this.config.performance.alertThresholds.parseTime) {
        this.generatePerformanceAlert('SLOW_PARSING', `Average parse time ${avgTime.toFixed(2)}ms exceeds threshold ${this.config.performance.alertThresholds.parseTime}ms`);
      }
    }

    // Check cache hit ratio (only if we have enough samples)
    const totalCacheOps = this.metrics.cacheHits + this.metrics.cacheMisses;
    const minSamples = this.config.performance.alertThresholds.minCacheSamples || 50;

    if (totalCacheOps >= minSamples) {
      const hitRatio = this.metrics.cacheHits / totalCacheOps;

      if (hitRatio < this.config.performance.alertThresholds.cacheHitRatio) {
        this.generatePerformanceAlert('LOW_CACHE_HIT_RATIO', `Cache hit ratio ${(hitRatio * 100).toFixed(1)}% below threshold ${(this.config.performance.alertThresholds.cacheHitRatio * 100).toFixed(1)}%`);
      }
    }

    // Check error rate
    if (this.metrics.parseCount > 0) {
      const errorRate = this.metrics.errorCount / this.metrics.parseCount;
      
      if (errorRate > this.config.performance.alertThresholds.errorRate) {
        this.generatePerformanceAlert('HIGH_ERROR_RATE', `Error rate ${(errorRate * 100).toFixed(1)}% exceeds threshold ${(this.config.performance.alertThresholds.errorRate * 100).toFixed(1)}%`);
      }
    }
  }

  /**
   * Generate performance alert
   * @param type - Alert type
   * @param message - Alert message
   */
  generatePerformanceAlert(type: string, message: string): void {
    if (!this.performanceMonitor) {
      return;
    }

    const alert = {
      type,
      message,
      timestamp: new Date().toISOString(),
      metrics: this.getMetrics()
    };

    this.performanceMonitor.alerts.push(alert);

    // Limit alerts to prevent memory issues
    if (this.performanceMonitor.alerts.length > 100) {
      this.performanceMonitor.alerts.shift();
    }

    logger.warn(`⚠️  MarkupParser Performance Alert [${type}]: ${message}`);
    
    // Optionally send to notification system
    const notificationManager = this.engine.getManager<NotificationManagerInterface>('NotificationManager');
    if (notificationManager) {
      notificationManager.addNotification({
        type: 'performance',
        title: `MarkupParser Performance Alert: ${type}`,
        message,
        priority: 'medium',
        source: 'MarkupParser'
      });
    }
  }

  /**
   * Get performance alerts
   * @returns Array of performance alerts
   */
  getPerformanceAlerts(): unknown[] {
    return this.performanceMonitor ? [...this.performanceMonitor.alerts] : [];
  }

  /**
   * Clear performance alerts
   */
  clearPerformanceAlerts(): void {
    if (this.performanceMonitor) {
      this.performanceMonitor.alerts = [];
    }
  }

  async shutdown(): Promise<void> {
    logger.debug('🔧 MarkupParser shutting down...');
    
    // Clear handler registry
    await this.handlerRegistry.clearAll();
    
    // Clear filter chain
    if (this.filterChain) {
      await this.filterChain.shutdown();
      this.filterChain = null;
    }
    
    // Clear cache references
    this.cache = null;
    this.cacheStrategies = {};
    
    // Clear performance monitor
    this.performanceMonitor = null;
    
    // Clear phases
    // Phases removed in Issue #185
    
    await super.shutdown();
  }
}

export default MarkupParser;

// Export for CommonJS (Jest compatibility)
module.exports = MarkupParser;
(module.exports as { default?: typeof MarkupParser }).default = MarkupParser;
