const BaseManager = require('../managers/BaseManager');
const ParseContext = require('./context/ParseContext');
const { HandlerRegistry } = require('./handlers/HandlerRegistry');
const FilterChain = require('./filters/FilterChain');
const { DOMParser: WikiDOMParser } = require('./dom/DOMParser');
const DOMVariableHandler = require('./dom/handlers/DOMVariableHandler');
const DOMPluginHandler = require('./dom/handlers/DOMPluginHandler');
const DOMLinkHandler = require('./dom/handlers/DOMLinkHandler');

/**
 * MarkupParser - Comprehensive markup parsing engine for JSPWiki compatibility
 * 
 * Implements a 7-phase processing pipeline:
 * 1. Preprocessing - Escape handling, code block protection
 * 2. Syntax Recognition - Pattern detection and tokenization
 * 3. Context Resolution - Variable expansion, parameter resolution
 * 4. Content Transformation - Handler execution
 * 5. Filter Pipeline - Content filtering and validation
 * 6. Markdown Conversion - Showdown processing
 * 7. Post-processing - Cleanup and validation
 * 
 * Related Issue: #55 - Core Infrastructure and Phase System
 * Epic: #41 - Implement JSPWikiMarkupParser for Complete Enhancement Support
 */
class MarkupParser extends BaseManager {
  constructor(engine) {
    super(engine);
    this.phases = [];
    this.handlerRegistry = new HandlerRegistry(engine);
    this.filterChain = new FilterChain(engine);
    this.cache = null;
    this.cacheStrategies = {};
    this.performanceMonitor = null;
    this.metrics = {
      parseCount: 0,
      totalParseTime: 0,
      phaseMetrics: new Map(),
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

  async initialize(config = {}) {
    await super.initialize(config);

    // Load configuration from ConfigurationManager
    await this.loadConfiguration();

    // Initialize processing phases
    this.initializePhases();
    
    // Initialize advanced cache integration
    await this.initializeAdvancedCaching();
    
    // Initialize metrics collection
    this.initializeMetrics();
    
    // Configure handler registry
    this.configureHandlerRegistry();
    
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
    
    console.log('✅ MarkupParser initialized with 7-phase processing pipeline');
    console.log(`🔧 Phases: ${this.phases.map(p => p.name).join(' → ')}`);
    console.log(`⚙️  Configuration loaded: ${this.config.enabled ? 'enabled' : 'disabled'}`);
    console.log(`🗄️  Cache strategies: ${Object.keys(this.cacheStrategies).join(', ')}`);
  }

  /**
   * Check if MarkupParser is initialized (required for RenderingManager integration)
   * @returns {boolean} - True if initialized
   */
  isInitialized() {
    return this.initialized && this.config && this.handlerRegistry && this.filterChain;
  }

  /**
   * Initialize filter chain with modular configuration
   */
  async initializeFilterChain() {
    if (!this.config.filters.enabled) {
      console.log('🔧 Filter pipeline disabled by configuration');
      return;
    }

    // Initialize the filter chain
    await this.filterChain.initialize({ engine: this.engine });

    // Register default filters based on configuration
    await this.registerDefaultFilters();
    
    const filterCount = this.filterChain.getFilters().length;
    console.log(`🔄 Filter pipeline initialized with ${filterCount} filters`);
  }

  /**
   * Register default filters based on modular configuration
   */
  async registerDefaultFilters() {
    // Register SecurityFilter if enabled
    if (this.config.filters.security.enabled) {
      const SecurityFilter = require('./filters/SecurityFilter');
      const securityFilter = new SecurityFilter();
      
      try {
        await securityFilter.initialize({ engine: this.engine });
        this.filterChain.addFilter(securityFilter);
        console.log('🔒 SecurityFilter registered successfully');
      } catch (error) {
        console.warn('⚠️  Failed to register SecurityFilter:', error.message);
      }
    }

    // Register SpamFilter if enabled
    if (this.config.filters.spam.enabled) {
      const SpamFilter = require('./filters/SpamFilter');
      const spamFilter = new SpamFilter();
      
      try {
        await spamFilter.initialize({ engine: this.engine });
        this.filterChain.addFilter(spamFilter);
        console.log('🛡️  SpamFilter registered successfully');
      } catch (error) {
        console.warn('⚠️  Failed to register SpamFilter:', error.message);
      }
    }

    // Register ValidationFilter if enabled
    if (this.config.filters.validation.enabled) {
      const ValidationFilter = require('./filters/ValidationFilter');
      const validationFilter = new ValidationFilter();
      
      try {
        await validationFilter.initialize({ engine: this.engine });
        this.filterChain.addFilter(validationFilter);
        console.log('✅ ValidationFilter registered successfully');
      } catch (error) {
        console.warn('⚠️  Failed to register ValidationFilter:', error.message);
      }
    }
  }

  /**
   * Register default syntax handlers based on configuration
   */
  async registerDefaultHandlers() {
    if (!this.config.enabled) {
      return;
    }

    // NOTE: EscapedSyntaxHandler and VariableSyntaxHandler removed in favor of DOM-based parsing
    // See Issue #110 - JSPWiki Variable Syntax
    // The DOM parser (Phase 0) handles escaping and variables without regex interference

    // Register JSPWikiPreprocessor (Phase 1) - processes %%.../%% blocks and tables BEFORE markdown
    const JSPWikiPreprocessor = require('./handlers/JSPWikiPreprocessor');
    const jspwikiPreprocessor = new JSPWikiPreprocessor(this.engine);

    try {
      await this.registerHandler(jspwikiPreprocessor);
      console.log('📋 JSPWikiPreprocessor registered successfully (Phase 1)');
    } catch (error) {
      console.warn('⚠️  Failed to register JSPWikiPreprocessor:', error.message);
    }

    // Register PluginSyntaxHandler if enabled
    if (this.config.handlers.plugin.enabled) {
      const PluginSyntaxHandler = require('./handlers/PluginSyntaxHandler');
      const pluginHandler = new PluginSyntaxHandler(this.engine);

      try {
        await this.registerHandler(pluginHandler);
        console.log('🔌 PluginSyntaxHandler registered successfully');
      } catch (error) {
        console.warn('⚠️  Failed to register PluginSyntaxHandler:', error.message);
      }
    }

    // Register WikiTagHandler if enabled
    if (this.config.handlers.wikitag.enabled) {
      const WikiTagHandler = require('./handlers/WikiTagHandler');
      const wikiTagHandler = new WikiTagHandler(this.engine);
      
      try {
        await this.registerHandler(wikiTagHandler);
        console.log('🏷️  WikiTagHandler registered successfully');
      } catch (error) {
        console.warn('⚠️  Failed to register WikiTagHandler:', error.message);
      }
    }

    // Register WikiFormHandler if enabled
    if (this.config.handlers.form.enabled) {
      const WikiFormHandler = require('./handlers/WikiFormHandler');
      const wikiFormHandler = new WikiFormHandler(this.engine);
      
      try {
        await this.registerHandler(wikiFormHandler);
        console.log('📝 WikiFormHandler registered successfully');
      } catch (error) {
        console.warn('⚠️  Failed to register WikiFormHandler:', error.message);
      }
    }

    // InterWikiLinkHandler is now replaced by unified LinkParserHandler
    // Registration moved to after WikiStyleHandler for optimal priority

    // Register AttachmentHandler if enabled (Phase 3)
    if (this.config.handlers.attachment.enabled) {
      const AttachmentHandler = require('./handlers/AttachmentHandler');
      const attachmentHandler = new AttachmentHandler(this.engine);
      
      try {
        await this.registerHandler(attachmentHandler);
        console.log('📎 AttachmentHandler registered successfully');
      } catch (error) {
        console.warn('⚠️  Failed to register AttachmentHandler:', error.message);
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
    const LinkParserHandler = require('./handlers/LinkParserHandler');
    const linkParserHandler = new LinkParserHandler(this.engine);

    try {
      await this.registerHandler(linkParserHandler);
      console.log('🔗 LinkParserHandler registered successfully (unified link processing for all link types)');
    } catch (error) {
      console.warn('⚠️  Failed to register LinkParserHandler - CRITICAL ISSUE:', error.message);
    }

    const handlerCount = this.getHandlers().length;
    console.log(`🎯 Registered ${handlerCount} syntax handlers total`);
    
    if (handlerCount > 0) {
      const handlerNames = this.getHandlers().map(h => h.handlerId).join(', ');
      console.log(`📋 Active handlers: ${handlerNames}`);
    }
  }

  /**
   * Load configuration from ConfigurationManager
   */
  async loadConfiguration() {
    const configManager = this.engine.getManager('ConfigurationManager');
    
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
          cacheHitRatio: 0.6, // 60%
          errorRate: 0.05 // 5%
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
        
      } catch (err) {
        console.warn('⚠️  Failed to load MarkupParser config from ConfigurationManager, using defaults:', err.message);
      }
    }
  }

  /**
   * Configure handler registry with loaded configuration
   */
  configureHandlerRegistry() {
    // Apply configuration to handler registry
    this.handlerRegistry.config = {
      ...this.handlerRegistry.config,
      ...this.config.handlerRegistry
    };
  }

  /**
   * Initialize the 8 processing phases (updated for DOM-based parsing)
   * Phase 0 (DOM Parsing) replaces string-based tokenization
   * Each phase has a specific responsibility in the parsing pipeline
   *
   * Related: GitHub Issue #93 - DOM-Based Parsing Architecture
   */
  initializePhases() {
    this.phases = [
      {
        // Phase 0: DOM Parsing (NEW - replaces fragile string parsing)
        name: 'DOM Parsing',
        priority: 50,
        process: this.phaseDOMParsing.bind(this)
      },
      {
        // Phase 1: Preprocessing
        name: 'Preprocessing',
        priority: 100,
        process: this.phasePreprocessing.bind(this)
      },
      {
        // Phase 2: Syntax Recognition
        name: 'Syntax Recognition',
        priority: 200,
        process: this.phaseSyntaxRecognition.bind(this)
      },
      {
        // Phase 3: Context Resolution
        name: 'Context Resolution',
        priority: 300,
        process: this.phaseContextResolution.bind(this)
      },
      {
        // Phase 4: Content Transformation
        name: 'Content Transformation',
        priority: 400,
        process: this.phaseContentTransformation.bind(this)
      },
      {
        // Phase 5: Filter Pipeline
        name: 'Filter Pipeline',
        priority: 500,
        process: this.phaseFilterPipeline.bind(this)
      },
      {
        // Phase 6: Markdown Conversion
        name: 'Markdown Conversion',
        priority: 600,
        process: this.phaseMarkdownConversion.bind(this)
      },
      {
        // Pahe 7: Post-processing
        name: 'Post-processing',
        priority: 700,
        process: this.phasePostProcessing.bind(this)
      }
    ];

    // Sort phases by priority (should already be ordered)
    this.phases.sort((a, b) => a.priority - b.priority);
  }

  /**
   * Initialize advanced caching integration with multiple cache strategies
   */
  async initializeAdvancedCaching() {
    if (!this.config.caching) {
      console.log('🗄️  MarkupParser caching disabled by configuration');
      return;
    }
    
    const cacheManager = this.engine.getManager('CacheManager');
    if (!cacheManager || !cacheManager.isInitialized()) {
      console.warn('⚠️  CacheManager not available, parsing will not be cached');
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
    console.log(`🗄️  MarkupParser advanced caching initialized with ${strategiesCount} strategies`);
    console.log(`📊 Cache TTLs: parse=${this.config.cache.parseResults.ttl}s, handlers=${this.config.cache.handlerResults.ttl}s, patterns=${this.config.cache.patterns.ttl}s`);

    // Perform cache warmup if enabled
    if (this.config.cache.enableWarmup) {
      await this.performCacheWarmup();
    }
  }

  /**
   * Initialize performance monitoring system
   */
  initializePerformanceMonitoring() {
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

    console.log('📊 Performance monitoring initialized with alert thresholds:', this.config.performance.alertThresholds);
  }

  /**
   * Perform cache warmup for frequently accessed content
   */
  async performCacheWarmup() {
    console.log('🔥 Starting MarkupParser cache warmup...');
    
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
        const variableManager = this.engine.getManager('VariableManager');
        if (variableManager) {
          for (const varName of commonVariables) {
            try {
              const cacheKey = `var:${varName}:default`;
              const value = await this.resolveSystemVariable(varName, {});
              await this.cacheStrategies.variables.set(cacheKey, value, { ttl: this.config.cache.variables.ttl });
            } catch (error) {
              // Skip variables that can't be resolved without context
            }
          }
        }
      }

      console.log('🔥 Cache warmup completed');
      
    } catch (error) {
      console.warn('⚠️  Cache warmup failed:', error.message);
    }
  }

  /**
   * Resolve system variable for cache warmup
   * @param {string} varName - Variable name
   * @param {Object} context - Context object
   * @returns {Promise<string>} - Variable value
   */
  async resolveSystemVariable(varName, context) {
    const variableManager = this.engine.getManager('VariableManager');
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
   * Initialize metrics collection
   */
  initializeMetrics() {
    // Initialize phase-specific metrics
    this.phases.forEach(phase => {
      this.metrics.phaseMetrics.set(phase.name, {
        executionCount: 0,
        totalTime: 0,
        errorCount: 0
      });
    });
  }

  /**
   * Main parsing method - processes content through all phases
   * @param {string} content - Raw content to parse
   * @param {Object} context - Parsing context (page, user, etc.)
   * @returns {Promise<string>} - Processed HTML content
   */
  async parse(content, context = {}) {
    if (!content) {
      return '';
    }

    // Check if MarkupParser is enabled
    if (!this.config.enabled) {
      console.debug('🔧 MarkupParser disabled, falling back to basic rendering');
      // Fall back to basic markdown conversion
      const renderingManager = this.engine.getManager('RenderingManager');
      if (renderingManager && renderingManager.converter) {
        return renderingManager.converter.makeHtml(content);
      }
      return content;
    }

    const startTime = Date.now();
    this.metrics.parseCount++;

    // Phase 6 (Issue #120): Check if WikiDocument DOM extraction pipeline should be used
    const configManager = this.engine.getManager('ConfigurationManager');
    const useExtractionPipeline = configManager?.getProperty?.(
      'jspwiki.parser.useExtractionPipeline',
      true // Default to new pipeline (Phase 6)
    ) ?? true;

    if (useExtractionPipeline) {
      // NEW: WikiDocument DOM extraction pipeline (Phases 1-5, Issues #115-#119)
      try {
        console.log('🔄 Using WikiDocument DOM extraction pipeline');

        // Check cache first
        const cacheKey = this.generateCacheKey(content, context);
        if (this.cacheStrategies.parseResults) {
          const cached = await this.getCachedParseResult(cacheKey);
          if (cached) {
            this.updateCacheMetrics('parseResults', 'hit');
            this.metrics.cacheHits++;
            this.updatePerformanceMetrics(Date.now() - startTime, true);
            console.log(`✅ Cache hit for extraction pipeline (${Date.now() - startTime}ms)`);
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

        console.log(`✅ Extraction pipeline completed (${processingTime}ms)`);

        // Warn if parse time is slow
        if (processingTime > 100) {
          console.warn(`⚠️  Slow parse: ${processingTime}ms for page ${context.pageName || 'unknown'}`);
        }

        return result;

      } catch (error) {
        console.error('❌ Extraction pipeline error:', error);
        console.warn('⚠️  Falling back to legacy 7-phase parser');

        // Fall through to legacy parser on error
        // (continue below with the old pipeline)
      }
    } else {
      console.log('🔄 Using legacy 7-phase parser (extraction pipeline disabled)');
    }

    // LEGACY: Original 7-phase parser (fallback)
    try {
      // Generate cache key
      const cacheKey = this.generateCacheKey(content, context);

      // Check parse results cache first
      if (this.cacheStrategies.parseResults) {
        const cached = await this.getCachedParseResult(cacheKey);
        if (cached) {
          this.updateCacheMetrics('parseResults', 'hit');
          this.metrics.cacheHits++;

          // Update performance monitoring
          this.updatePerformanceMetrics(Date.now() - startTime, true);

          return cached;
        }
        this.updateCacheMetrics('parseResults', 'miss');
        this.metrics.cacheMisses++;
      }

      // Create parse context
      const parseContext = new ParseContext(content, context, this.engine);

      // Execute all processing phases
      let processedContent = content;

      for (const phase of this.phases) {
        const phaseStartTime = Date.now();

        try {
          processedContent = await this.executePhase(phase, processedContent, parseContext);

          // Update phase metrics
          const phaseMetrics = this.metrics.phaseMetrics.get(phase.name);
          phaseMetrics.executionCount++;
          phaseMetrics.totalTime += Date.now() - phaseStartTime;

        } catch (error) {
          console.error(`❌ Error in ${phase.name} phase:`, error);

          // Update error metrics
          this.metrics.errorCount++;
          const phaseMetrics = this.metrics.phaseMetrics.get(phase.name);
          phaseMetrics.errorCount++;

          // Continue with next phase on error (graceful degradation)
          // In production, you might want to be more strict
        }
      }

      // Cache the result using appropriate strategy
      await this.cacheParseResult(cacheKey, processedContent);

      // Update performance metrics
      const processingTime = Date.now() - startTime;
      this.metrics.totalParseTime += processingTime;
      this.updatePerformanceMetrics(processingTime, false);

      return processedContent;

    } catch (error) {
      console.error('❌ Critical error in MarkupParser.parse():', error);
      this.metrics.errorCount++;

      // Return original content on critical failure
      return content;
    }
  }

  /**
   * Execute a specific processing phase
   * @param {Object} phase - Phase configuration
   * @param {string} content - Content to process
   * @param {ParseContext} context - Parse context
   * @returns {Promise<string>} - Processed content
   */
  async executePhase(phase, content, context) {
    return await phase.process(content, context);
  }

  /**
   * Process JSPWiki-specific syntax (variables, plugins, escaping)
   * This handles [{$var}], [{Plugin}], and [[escaped]] without breaking markdown
   *
   * Related: GitHub Issue #110 - JSPWiki Variable Syntax
   */
  async processJSPWikiSyntax(content, context) {
    let processed = content;

    // Step 1: Protect escaped syntax from further processing
    // Replace [[content] with placeholders, storing the unescaped content
    const escapedPlaceholders = new Map();
    let escapedIndex = 0;

    processed = processed.replace(/\[\[([^\]]+)\]/g, (match, innerContent) => {
      const placeholder = `__ESCAPED_${escapedIndex}__`;
      // Store with HTML-encoded brackets to prevent later handlers from processing
      // [{...}] becomes &#91;{...}&#93; which displays as [{...}] but won't match [...]  patterns
      escapedPlaceholders.set(placeholder, `&#91;${innerContent}&#93;`);
      escapedIndex++;
      return placeholder;
    });

    // Step 2: Handle variables [{$varname}]
    const variableManager = this.engine.getManager('VariableManager');
    if (variableManager && variableManager.variableHandlers) {
      // Match [{$word}] pattern only
      processed = processed.replace(/\[\{\$(\w+)\}\]/g, (match, varName) => {
        const handler = variableManager.variableHandlers.get(varName.toLowerCase());
        if (handler) {
          try {
            const value = handler(context);
            return value !== undefined && value !== null ? String(value) : match;
          } catch (error) {
            console.error(`Error resolving variable ${varName}:`, error);
            return match;
          }
        }
        return match; // Variable not found, keep original
      });
    }

    // Step 3: Handle plugins [{PluginName param=value}]
    const pluginManager = this.engine.getManager('PluginManager');
    if (pluginManager) {
      // Match [{word ...}] pattern (not starting with $)
      const pluginRegex = /\[\{([A-Z]\w+)(\s+[^\}]+)?\}\]/g;
      const matches = [];
      let match;

      // Collect all plugin matches
      while ((match = pluginRegex.exec(processed)) !== null) {
        matches.push({
          fullMatch: match[0],
          pluginName: match[1],
          paramsString: match[2] || '',
          index: match.index
        });
      }

      // Process plugins in reverse order to maintain string positions
      for (let i = matches.length - 1; i >= 0; i--) {
        const m = matches[i];
        try {
          // Parse parameters
          const params = {};
          if (m.paramsString) {
            const paramPairs = m.paramsString.trim().split(/\s+/);
            for (const pair of paramPairs) {
              const [key, value] = pair.split('=');
              if (key && value) {
                params[key] = value.replace(/^['"]|['"]$/g, '');
              }
            }
          }

          // Execute plugin
          const result = await pluginManager.execute(m.pluginName, context.pageName || 'Unknown', params, {
            engine: this.engine,
            context
          });

          // Replace in string
          processed = processed.substring(0, m.index) + result + processed.substring(m.index + m.fullMatch.length);
        } catch (error) {
          console.error(`Error executing plugin ${m.pluginName}:`, error);
          // Leave original syntax on error
        }
      }
    }

    // Step 4: Restore escaped content (now protected from processing)
    for (const [placeholder, escapedContent] of escapedPlaceholders) {
      processed = processed.replace(placeholder, escapedContent);
    }

    return processed;
  }

  /**
   * Phase 0: DOM Parsing (DISABLED - causes markdown heading issues)
   *
   * The DOM parser converts markdown headings to list items. Instead, we handle
   * JSPWiki syntax (variables, plugins, escaping) in later phases while preserving
   * markdown syntax for the markdown converter.
   *
   * Related: GitHub Issue #93 - DOM-Based Parsing Architecture
   * Related: GitHub Issue #110 - JSPWiki Variable Syntax
   */
  async phaseDOMParsing(content, context) {
    // DISABLED: DOM parser breaks markdown headings
    // JSPWiki syntax will be handled by string-based preprocessing in Phase 1
    return content;
  }

  /**
   * Phase 1: Preprocessing
   * Handle JSPWiki-specific escaping and normalize content
   * Protect code blocks from WikiStyleHandler and other Phase 3 handlers
   * Process variables and escaped syntax without interfering with markdown
   */
  async phasePreprocessing(content, context) {
    let processedContent = content;

    // Step 1: Process JSPWiki-specific syntax BEFORE any other handlers
    processedContent = await this.processJSPWikiSyntax(processedContent, context);

    // Step 2: Process ALL Phase 1 handlers in priority order
    const phase1Handlers = this.handlerRegistry.resolveExecutionOrder()
      .filter(handler => handler.phase === 1);

    console.log(`🔍 Phase 1: Processing ${phase1Handlers.length} Phase 1 handlers`);

    for (const handler of phase1Handlers) {
      try {
        console.log(`🔍 Phase 1: Processing ${handler.handlerId}...`);
        processedContent = await handler.execute(processedContent, context);
      } catch (error) {
        console.error(`❌ Error in Phase 1 handler ${handler.handlerId}:`, error.message);
      }
    }

    // Convert JSPWiki-style code blocks ({{{}}}) to markdown (```)
    processedContent = processedContent.replace(/\{\{\{(\w*)\s*\n([\s\S]*?)\n\}\}\}/g, (_match, language, code) => {
      // Preserve language identifier if present
      return '```' + (language || '') + '\n' + code + '\n```';
    });

    // Protect code blocks from WikiStyleHandler and other handlers
    // They will be restored in Phase 6 before markdown conversion
    context.codeBlocks = [];
    processedContent = processedContent.replace(/(```[\s\S]*?```)/g, (match) => {
      const placeholder = `CODEBLOCK${context.codeBlocks.length}CODEBLOCK`;
      context.codeBlocks.push(match);
      return placeholder;
    });

    // Protect inline code from handlers
    processedContent = processedContent.replace(/(`[^`]+`)/g, (match) => {
      const placeholder = `INLINECODE${context.codeBlocks.length}INLINECODE`;
      context.codeBlocks.push(match);
      return placeholder;
    });

    // Normalize line endings
    processedContent = processedContent.replace(/\r\n/g, '\n');

    // Remove excessive whitespace but preserve intentional formatting
    processedContent = processedContent.replace(/\n\s*\n\s*\n/g, '\n\n');

    return processedContent;
  }

  /**
   * Phase 2: Syntax Recognition
   * Identify and tokenize markup patterns
   */
  async phaseSyntaxRecognition(content, context) {
    // This phase will identify patterns and create tokens
    // For now, just pass through - handlers will do pattern matching
    context.syntaxTokens = [];
    return content;
  }

  /**
   * Phase 3: Context Resolution
   * Expand variables, resolve parameters
   *
   * Uses DOM-based variable resolution if WikiDocument is available (Phase 3 migration)
   * Falls back to string-based expansion for backward compatibility
   */
  async phaseContextResolution(content, context) {
    // Check if we have a WikiDocument from Phase 0 (DOM parsing)
    if (context.wikiDocument) {
      // Use DOM-based variable resolution (Phase 3 migration - GitHub Issue #93)
      try {
        await this.domVariableHandler.processVariables(context.wikiDocument, context);
        // Return updated HTML from WikiDocument
        content = context.wikiDocument.toHTML();
        console.log('✅ Phase 3: DOM-based variable resolution complete');
      } catch (error) {
        console.error('❌ Error in DOM variable resolution:', error);
        // Fall through to string-based expansion as fallback
      }
    } else {
      // Phase 1 now handles JSPWiki variable syntax, so Phase 3 is skipped
      // This prevents double-processing of variables and respects escaped syntax
      console.log('✅ Phase 3: Skipped (variables already processed in Phase 1)');
    }

    return content;
  }

  /**
   * Phase 4: Content Transformation
   * Execute syntax handlers in priority order
   *
   * Uses DOM-based handlers if WikiDocument is available (Phase 4 migration)
   * Falls back to string-based handlers for backward compatibility
   */
  async phaseContentTransformation(content, context) {
    // Check if we have a WikiDocument from Phase 0 (DOM parsing)
    if (context.wikiDocument) {
      // Use DOM-based processing (Phase 4 & 5 migration - GitHub Issues #107, #108)
      try {
        // Process plugins (Phase 4 - Issue #107)
        await this.domPluginHandler.processPlugins(context.wikiDocument, context);

        // Process links (Phase 5 - Issue #108)
        await this.domLinkHandler.processLinks(context.wikiDocument, context);

        // Return updated HTML from WikiDocument
        content = context.wikiDocument.toHTML();
        console.log('✅ Phase 4: DOM-based plugin and link processing complete');
      } catch (error) {
        console.error('❌ Error in DOM processing:', error);
        // Fall through to string-based handlers as fallback
      }
    } else {
      // Legacy: String-based handlers for backward compatibility
      // Get handlers in dependency-resolved priority order
      const sortedHandlers = this.handlerRegistry.resolveExecutionOrder();

      let transformedContent = content;

      // Execute each handler using the registry's execution method
      // Skip EscapedSyntaxHandler as it's already processed in Phase 1 (Preprocessing)
      for (const handler of sortedHandlers) {
        if (handler.handlerId === 'EscapedSyntaxHandler') {
          continue; // Already processed in Phase 1
        }

        try {
          transformedContent = await handler.execute(transformedContent, context);
        } catch (error) {
          console.error(`❌ Error in handler ${handler.handlerId}:`, error);
          // Continue with other handlers
        }
      }

      // Protect HTML links generated by handlers from markdown encoding
      transformedContent = this.protectGeneratedHtml(transformedContent, context);

      content = transformedContent;
      console.log('✅ Phase 4: String-based handler processing (legacy)');
    }

    return content;
  }

  /**
   * Phase 5: Filter Pipeline
   * Apply content filters for security, validation, etc. with modular configuration
   */
  async phaseFilterPipeline(content, context) {
    if (!this.filterChain || !this.config.filters.enabled) {
      return content;
    }

    try {
      return await this.filterChain.process(content, context);
    } catch (error) {
      console.error('❌ Filter pipeline error:', error.message);
      
      // Return original content on filter pipeline failure
      return content;
    }
  }

  /**
   * Phase 6: Markdown Conversion
   * Convert markdown to HTML using Showdown
   * All standard markdown (code blocks, links, lists, etc.) is handled by Showdown natively
   */
  async phaseMarkdownConversion(content, context) {
    // Restore code blocks BEFORE Showdown processes them
    if (context.codeBlocks) {
      context.codeBlocks.forEach((block, index) => {
        const codeBlockPlaceholder = `CODEBLOCK${index}CODEBLOCK`;
        const inlineCodePlaceholder = `INLINECODE${index}INLINECODE`;
        content = content.replace(new RegExp(codeBlockPlaceholder, 'g'), block);
        content = content.replace(new RegExp(inlineCodePlaceholder, 'g'), block);
      });
    }

    const renderingManager = this.engine.getManager('RenderingManager');
    if (renderingManager && renderingManager.converter) {
      // Pass content directly to Showdown - it handles all standard markdown
      content = renderingManager.converter.makeHtml(content);
    }
    return content;
  }

  /**
   * Phase 7: Post-processing
   * Final cleanup and validation
   */
  async phasePostProcessing(content, context) {
    // Restore protected HTML blocks (from Phase 4 protectHtml)
    if (context.protectedBlocks) {
      context.protectedBlocks.forEach((block, index) => {
        const htmlPlaceholder = `HTMLTOKEN${index}HTMLTOKEN`;
        content = content.replace(new RegExp(htmlPlaceholder, 'g'), block);
      });
    }

    // Apply table classes from WikiStyleHandler markers
    content = this.applyTableClasses(content);

    // Final HTML validation and cleanup
    content = this.cleanupHtml(content);

    return content;
  }

  /**
   * Apply table classes from WikiStyleHandler %%TABLE_CLASSES{...}%% markers
   * Handles multiple consecutive markers by merging all classes
   * @param {string} content - HTML content to process
   * @returns {string} Content with classes applied to table elements
   */
  applyTableClasses(content) {
    // First, merge consecutive %%TABLE_CLASSES{...}%% markers
    let mergedContent = content;
    let hasConsecutiveMarkers = true;

    while (hasConsecutiveMarkers) {
      // Pattern to find consecutive markers: %%TABLE_CLASSES{class1}%%%%TABLE_CLASSES{class2}%%
      const consecutivePattern = /%%TABLE_CLASSES\{([^}]+)\}%%%%TABLE_CLASSES\{([^}]+)\}%%/;
      const match = consecutivePattern.exec(mergedContent);

      if (match) {
        // Merge the two class sets
        const mergedClasses = `${match[1]} ${match[2]}`;
        mergedContent = mergedContent.replace(match[0], `%%TABLE_CLASSES{${mergedClasses}}%%`);
      } else {
        hasConsecutiveMarkers = false;
      }
    }

    // Now apply the merged classes to table elements
    // Pattern: %%TABLE_CLASSES{class1 class2}%%...table HTML...
    const tableClassPattern = /%%TABLE_CLASSES\{([^}]+)\}%%/g;

    let result = mergedContent;
    let match;

    // Reset regex state
    tableClassPattern.lastIndex = 0;

    // Collect all markers and their classes
    const markers = [];
    while ((match = tableClassPattern.exec(mergedContent)) !== null) {
      markers.push({
        fullMatch: match[0],
        classes: match[1],
        index: match.index
      });
    }

    // Apply classes to the next table after each marker
    for (const marker of markers) {
      // Find the next <table> tag after this marker
      const contentAfterMarker = result.substring(result.indexOf(marker.fullMatch));
      const tableMatch = contentAfterMarker.match(/<table([^>]*)>/);

      if (tableMatch) {
        const existingAttrs = tableMatch[1];
        const classMatch = existingAttrs.match(/class=["']([^"']*)["']/);

        let newTableTag;
        if (classMatch) {
          // Merge with existing classes
          const mergedClasses = `${classMatch[1]} ${marker.classes}`.trim();
          newTableTag = `<table${existingAttrs.replace(/class=["'][^"']*["']/, `class="${mergedClasses}"`)}>`;
        } else {
          // Add new class attribute
          newTableTag = `<table${existingAttrs} class="${marker.classes}">`;
        }

        // Replace the old table tag with the new one
        result = result.replace(tableMatch[0], newTableTag);
      }

      // Remove the marker
      result = result.replace(marker.fullMatch, '');
    }

    return result;
  }

  /**
   * Register a syntax handler
   * @param {BaseSyntaxHandler} handler - Handler instance
   * @param {Object} options - Registration options
   * @returns {Promise<boolean>} - True if registration successful
   */
  async registerHandler(handler, options = {}) {
    // Check if handler type is enabled in configuration
    const handlerType = this.getHandlerTypeFromId(handler.handlerId);
    if (handlerType && this.config.handlers[handlerType] && !this.config.handlers[handlerType].enabled) {
      console.log(`🔧 Handler ${handler.handlerId} disabled by configuration, skipping registration`);
      return false;
    }
    
    return await this.handlerRegistry.registerHandler(handler, options);
  }

  /**
   * Get handler type from handler ID for configuration lookup (modular mapping)
   * @param {string} handlerId - Handler ID
   * @returns {string|null} - Handler type or null
   */
  getHandlerTypeFromId(handlerId) {
    const typeMap = {
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
   * @param {string} handlerType - Handler type (plugin, wikitag, etc.)
   * @returns {Object} - Handler configuration
   */
  getHandlerConfig(handlerType) {
    return this.config.handlers[handlerType] || { enabled: true, priority: 100 };
  }

  /**
   * Unregister a syntax handler
   * @param {string} handlerId - Handler identifier
   * @returns {Promise<boolean>} - True if unregistration successful
   */
  async unregisterHandler(handlerId) {
    return await this.handlerRegistry.unregisterHandler(handlerId);
  }

  /**
   * Get handler by ID
   * @param {string} handlerId - Handler identifier
   * @returns {BaseSyntaxHandler|null} - Handler or null if not found
   */
  getHandler(handlerId) {
    return this.handlerRegistry.getHandler(handlerId);
  }

  /**
   * Get all handlers sorted by priority
   * @param {boolean} enabledOnly - Only return enabled handlers
   * @returns {Array<BaseSyntaxHandler>} - Handlers sorted by priority
   */
  getHandlers(enabledOnly = true) {
    return this.handlerRegistry.getHandlersByPriority(enabledOnly);
  }

  /**
   * Enable handler by ID
   * @param {string} handlerId - Handler identifier
   * @returns {boolean} - True if successful
   */
  enableHandler(handlerId) {
    return this.handlerRegistry.enableHandler(handlerId);
  }

  /**
   * Disable handler by ID
   * @param {string} handlerId - Handler identifier
   * @returns {boolean} - True if successful
   */
  disableHandler(handlerId) {
    return this.handlerRegistry.disableHandler(handlerId);
  }

  /**
   * Generate cache key for content and context
   * @param {string} content - Content to cache
   * @param {Object} context - Parse context
   * @returns {string} - Cache key
   */
  generateCacheKey(content, context) {
    const crypto = require('crypto');
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
   * // sanitized: "## Heading\n\nUser: __JSPWIKI_abc123_0__"
   * // jspwikiElements: [{ type: 'variable', varName: '$username', id: 0, ... }]
   * // uuid: "abc123"
   */
  extractJSPWikiSyntax(content, context = {}) {
    const crypto = require('crypto');
    const jspwikiElements = [];
    const uuid = crypto.randomUUID().substring(0, 8);
    let sanitized = content;
    let id = 0;

    // IMPORTANT: Extraction order matters!

    // Step 0: Protect code blocks from JSPWiki extraction
    // Code blocks should not have JSPWiki syntax processed
    const codeBlocks = [];
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

    // Step 1: Extract ESCAPED syntax FIRST (before anything else)
    // Matches: [[{$var}], [[{Plugin}]
    // Result: Literal [{$var}] or [{Plugin}] in output
    sanitized = sanitized.replace(/\[\[\{([^}]+)\}\]/g, (match, inner) => {
      jspwikiElements.push({
        type: 'escaped',
        syntax: match,
        literal: `[{${inner}}]`, // What should appear in output
        id: id++,
        position: match.index
      });
      return `<!--JSPWIKI-${uuid}-${id - 1}-->`;
    });

    // Step 2: Extract variables [{$varname}]
    // Matches: [{$username}], [{$pagename}], etc.
    // Does NOT match: [{Plugin}], [[{$escaped}] (already extracted)
    sanitized = sanitized.replace(/\[\{(\$\w+)\}\]/g, (match, varName) => {
      jspwikiElements.push({
        type: 'variable',
        syntax: match,
        varName: varName, // Includes the $
        id: id++,
        position: match.index
      });
      return `<!--JSPWIKI-${uuid}-${id - 1}-->`;
    });

    // Step 3: Extract plugins [{PluginName params}]
    // Matches: [{TableOfContents}], [{Search query='wiki'}]
    // Does NOT match: [{$variable}] (already extracted), [{] (malformed)
    // Requires: At least one word character after [{
    sanitized = sanitized.replace(/\[\{([A-Za-z]\w*[^}]*)\}\]/g, (match, inner) => {
      jspwikiElements.push({
        type: 'plugin',
        syntax: match,
        inner: inner.trim(),
        id: id++,
        position: match.index
      });
      return `<!--JSPWIKI-${uuid}-${id - 1}-->`;
    });

    // Step 4: Extract wiki links [PageName] or [Text|Target]
    // Matches: [HomePage], [Click Here|HomePage]
    // Does NOT match: [text](url) - markdown links (negative lookahead)
    // Does NOT match: [}] (malformed)
    // Note: This runs last to avoid conflicts with escaped/variable/plugin syntax
    sanitized = sanitized.replace(/\[([^\]\[\{][^\]]*)\](?!\()/g, (match, target) => {
      jspwikiElements.push({
        type: 'link',
        syntax: match,
        target: target.trim(),
        id: id++,
        position: match.index
      });
      return `<!--JSPWIKI-${uuid}-${id - 1}-->`;
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
   * @param {Object} element - Extracted escaped element
   * @param {WikiDocument} wikiDocument - WikiDocument to create node in
   * @returns {Element} DOM node containing the escaped literal text
   *
   * @example
   * const element = { type: 'escaped', literal: '[{$username}]', id: 0, ... };
   * const node = createTextNodeForEscaped(element, wikiDoc);
   * // Returns: <span class="wiki-escaped" data-jspwiki-id="0">[{$username}]</span>
   */
  createTextNodeForEscaped(element, wikiDocument) {
    // Create a span element to maintain consistency with other handlers
    // (all handlers return elements with data-jspwiki-id for merge phase)
    const node = wikiDocument.createElement('span', {
      'class': 'wiki-escaped',
      'data-jspwiki-id': element.id.toString()
    });

    // Set the literal text content (already extracted in element.literal)
    node.textContent = element.literal;

    return node;
  }

  /**
   * Creates a DOM node from an extracted element (Phase 2 dispatcher)
   *
   * This is the dispatcher method for Phase 2 that routes extracted elements
   * to the appropriate handler based on element type.
   *
   * @param {Object} element - Extracted element from extractJSPWikiSyntax()
   * @param {Object} context - Rendering context
   * @param {WikiDocument} wikiDocument - WikiDocument to create node in
   * @returns {Promise<Element>} DOM node for the element
   *
   * @example
   * const element = { type: 'variable', varName: '$username', id: 0 };
   * const node = await createDOMNode(element, context, wikiDoc);
   * // Returns: <span class="wiki-variable">JohnDoe</span>
   */
  async createDOMNode(element, context, wikiDocument) {
    switch (element.type) {
      case 'variable':
        // Variable: [{$username}]
        return await this.domVariableHandler.createNodeFromExtract(element, context, wikiDocument);

      case 'plugin':
        // Plugin: [{TableOfContents}]
        return await this.domPluginHandler.createNodeFromExtract(element, context, wikiDocument);

      case 'link':
        // Link: [HomePage] or [Display|Target]
        return await this.domLinkHandler.createNodeFromExtract(element, context, wikiDocument);

      case 'escaped':
        // Escaped: [[{$var}]] → [{$var}]
        return this.createTextNodeForEscaped(element, wikiDocument);

      default:
        console.error(`❌ Unknown element type: ${element.type}`);
        // Return error node
        const errorNode = wikiDocument.createElement('span', {
          'class': 'wiki-error',
          'data-jspwiki-id': element.id.toString()
        });
        errorNode.textContent = `[Error: Unknown type ${element.type}]`;
        return errorNode;
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
   * @param {string} html - HTML from Showdown with placeholders
   * @param {Array<Element>} nodes - Array of DOM nodes with data-jspwiki-id
   * @param {string} uuid - UUID from extraction phase
   * @returns {string} Final HTML with nodes merged in
   *
   * @example
   * // Input HTML: "<p>User: <!--JSPWIKI-abc123-0--></p>"
   * // Node 0: <span data-jspwiki-id="0">JohnDoe</span>
   * // Output: "<p>User: <span>JohnDoe</span></p>"
   */
  mergeDOMNodes(html, nodes, uuid) {
    if (!nodes || nodes.length === 0) {
      return html;
    }

    let result = html;

    // Sort nodes by ID (descending) to handle nested replacements correctly
    // Example: Plugin containing variable must be replaced after the plugin
    const sortedNodes = Array.from(nodes).sort((a, b) => {
      const idA = parseInt(a.getAttribute('data-jspwiki-id'));
      const idB = parseInt(b.getAttribute('data-jspwiki-id'));
      return idB - idA; // Descending order
    });

    for (const node of sortedNodes) {
      const id = node.getAttribute('data-jspwiki-id');
      const placeholder = `<!--JSPWIKI-${uuid}-${id}-->`;

      // Render node to HTML
      let rendered;
      if (node.outerHTML) {
        rendered = node.outerHTML;
      } else if (node.textContent !== undefined) {
        // Fallback for nodes without outerHTML
        rendered = node.textContent;
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
   * @param {string} content - Wiki markup content
   * @param {Object} context - Rendering context
   * @returns {Promise<string>} Rendered HTML
   *
   * @example
   * const html = await parser.parseWithDOMExtraction('## Hello\nUser: [{$username}]', context);
   * // Returns: "<h2>Hello</h2>\n<p>User: <span>JohnDoe</span></p>"
   */
  async parseWithDOMExtraction(content, context) {
    console.log('🔄 Starting DOM extraction parse...');

    // Phase 1: Extract JSPWiki syntax
    const { sanitized, jspwikiElements, uuid } = this.extractJSPWikiSyntax(content, context);
    console.log(`📦 Extracted ${jspwikiElements.length} JSPWiki elements`);

    // Phase 2: Create WikiDocument and build DOM nodes
    const WikiDocument = require('./dom/WikiDocument');
    const wikiDocument = new WikiDocument();

    const nodes = [];
    for (const element of jspwikiElements) {
      try {
        const node = await this.createDOMNode(element, context, wikiDocument);
        nodes.push(node);
      } catch (error) {
        console.error(`❌ Error creating DOM node for element ${element.id}:`, error.message);
        // Create error node
        const errorNode = wikiDocument.createElement('span', {
          'class': 'wiki-error',
          'data-jspwiki-id': element.id.toString()
        });
        errorNode.textContent = `[Error: ${error.message}]`;
        nodes.push(errorNode);
      }
    }
    console.log(`🔨 Created ${nodes.length} DOM nodes`);

    // Phase 3: Let Showdown parse the sanitized markdown
    const renderingManager = this.engine.getManager('RenderingManager');
    let showdownHtml;
    if (renderingManager && renderingManager.converter) {
      showdownHtml = renderingManager.converter.makeHtml(sanitized);
    } else {
      // Fallback if RenderingManager not available (testing)
      const showdown = require('showdown');
      const converter = new showdown.Converter({
        tables: true,
        strikethrough: true,
        tasklists: true,
        simpleLineBreaks: false,
        ghCodeBlocks: true
      });
      showdownHtml = converter.makeHtml(sanitized);
    }
    console.log('📝 Showdown processed markdown');

    // Phase 4: Merge DOM nodes back into the HTML
    const finalHtml = this.mergeDOMNodes(showdownHtml, nodes, uuid);
    console.log('✅ Merge complete');

    return finalHtml;
  }

  /**
   * Protect HTML links and other generated HTML from markdown encoding
   * @param {string} content - Content with generated HTML
   * @param {ParseContext} context - Parse context to store protected content
   * @returns {string} - Content with HTML protected using placeholders
   */
  protectGeneratedHtml(content, context) {
    if (!context.protectedBlocks) {
      context.protectedBlocks = [];
    }

    let protectedContent = content;

    // Protect complete HTML structures (protect larger structures first to avoid nesting issues)

    // First protect ul lists (including nested li and a elements)
    protectedContent = protectedContent.replace(/<ul[^>]*>[\s\S]*?<\/ul>/gi, (match) => {
      const placeholder = `HTMLTOKEN${context.protectedBlocks.length}HTMLTOKEN`;
      context.protectedBlocks.push(match);
      return placeholder;
    });

    // Then protect ol lists (including nested li and a elements)
    protectedContent = protectedContent.replace(/<ol[^>]*>[\s\S]*?<\/ol>/gi, (match) => {
      const placeholder = `HTMLTOKEN${context.protectedBlocks.length}HTMLTOKEN`;
      context.protectedBlocks.push(match);
      return placeholder;
    });

    // Then protect standalone anchor tags (not already inside lists)
    protectedContent = protectedContent.replace(/<a\s[^>]*>.*?<\/a>/gi, (match) => {
      const placeholder = `HTMLTOKEN${context.protectedBlocks.length}HTMLTOKEN`;
      context.protectedBlocks.push(match);
      return placeholder;
    });

    // Protect self-closing img tags (like from Image plugin)
    protectedContent = protectedContent.replace(/<img[^>]*\s*\/?>/gi, (match) => {
      const placeholder = `HTMLTOKEN${context.protectedBlocks.length}HTMLTOKEN`;
      context.protectedBlocks.push(match);
      return placeholder;
    });

    // Finally protect other HTML tags that handlers might generate
    protectedContent = protectedContent.replace(/<(span|div|strong|em|code)[^>]*>.*?<\/\1>/gi, (match) => {
      const placeholder = `HTMLTOKEN${context.protectedBlocks.length}HTMLTOKEN`;
      context.protectedBlocks.push(match);
      return placeholder;
    });

    return protectedContent;
  }

  /**
   * Clean up generated HTML
   * @param {string} html - HTML content to clean
   * @returns {string} - Cleaned HTML
   */
  cleanupHtml(html) {
    // Protect code blocks from whitespace normalization
    const codeBlocks = [];
    html = html.replace(/(<pre><code[^>]*>)([\s\S]*?)(<\/code><\/pre>)/g, (match) => {
      const placeholder = `CLEANUPCODE${codeBlocks.length}CLEANUPCODE`;
      codeBlocks.push(match);
      return placeholder;
    });

    // Remove excessive whitespace (but not in code blocks)
    html = html.replace(/\s+/g, ' ');

    // Fix common HTML issues
    html = html.replace(/>\s+</g, '><');

    // Ensure proper paragraph spacing
    html = html.replace(/(<\/p>)\s*(<p>)/g, '$1\n$2');

    // Restore code blocks
    codeBlocks.forEach((block, index) => {
      const placeholder = `CLEANUPCODE${index}CLEANUPCODE`;
      html = html.replace(placeholder, block);
    });

    return html.trim();
  }

  /**
   * Get performance metrics
   * @returns {Object} - Performance metrics
   */
  getMetrics() {
    const metrics = { ...this.metrics };
    
    // Calculate averages
    metrics.averageParseTime = this.metrics.parseCount > 0 
      ? this.metrics.totalParseTime / this.metrics.parseCount 
      : 0;
    
    metrics.cacheHitRatio = (this.metrics.cacheHits + this.metrics.cacheMisses) > 0
      ? this.metrics.cacheHits / (this.metrics.cacheHits + this.metrics.cacheMisses)
      : 0;

    // Convert phase metrics
    metrics.phaseStats = {};
    this.metrics.phaseMetrics.forEach((stats, phaseName) => {
      metrics.phaseStats[phaseName] = {
        ...stats,
        averageTime: stats.executionCount > 0 ? stats.totalTime / stats.executionCount : 0
      };
    });

    // Add handler registry metrics
    metrics.handlerRegistry = this.handlerRegistry.getStats();
    
    // Add filter chain metrics
    if (this.filterChain) {
      metrics.filterChain = this.filterChain.getStats();
    }

    // Add advanced cache metrics
    metrics.cacheStrategies = {};
    this.metrics.cacheMetrics.forEach((cacheStats, strategy) => {
      const total = cacheStats.hits + cacheStats.misses;
      metrics.cacheStrategies[strategy] = {
        ...cacheStats,
        hitRatio: total > 0 ? cacheStats.hits / total : 0,
        total: total
      };
    });

    // Add performance monitoring data
    if (this.performanceMonitor) {
      metrics.performance = {
        monitoring: this.config.performance.monitoring,
        alertCount: this.performanceMonitor.alerts.length,
        recentParseCount: this.performanceMonitor.recentParseTimes.length,
        alerts: this.performanceMonitor.alerts.slice(-10) // Last 10 alerts
      };

      // Calculate recent performance stats
      const recentTimes = this.performanceMonitor.recentParseTimes.slice(-20);
      if (recentTimes.length > 0) {
        const nonCachedTimes = recentTimes.filter(entry => !entry.cacheHit);
        metrics.performance.recentStats = {
          averageParseTime: nonCachedTimes.length > 0 
            ? nonCachedTimes.reduce((sum, entry) => sum + entry.time, 0) / nonCachedTimes.length 
            : 0,
          cachedParseCount: recentTimes.filter(entry => entry.cacheHit).length,
          nonCachedParseCount: nonCachedTimes.length
        };
      }
    }

    return metrics;
  }

  /**
   * Reset performance metrics
   */
  resetMetrics() {
    this.metrics = {
      parseCount: 0,
      totalParseTime: 0,
      phaseMetrics: new Map(),
      errorCount: 0,
      cacheHits: 0,
      cacheMisses: 0
    };
    
    this.initializeMetrics();
  }

  /**
   * Get cached parse result
   * @param {string} cacheKey - Cache key
   * @returns {Promise<string|null>} - Cached result or null
   */
  async getCachedParseResult(cacheKey) {
    if (!this.cacheStrategies.parseResults) {
      return null;
    }
    
    try {
      return await this.cacheStrategies.parseResults.get(cacheKey);
    } catch (error) {
      console.warn('⚠️  Cache get failed:', error.message);
      return null;
    }
  }

  /**
   * Cache parse result
   * @param {string} cacheKey - Cache key
   * @param {string} content - Content to cache
   */
  async cacheParseResult(cacheKey, content) {
    if (!this.cacheStrategies.parseResults) {
      return;
    }
    
    try {
      await this.cacheStrategies.parseResults.set(cacheKey, content, { 
        ttl: this.config.cache.parseResults.ttl 
      });
      this.updateCacheMetrics('parseResults', 'set');
    } catch (error) {
      console.warn('⚠️  Cache set failed:', error.message);
    }
  }

  /**
   * Get cached handler result
   * @param {string} handlerId - Handler ID
   * @param {string} contentHash - Content hash
   * @param {string} contextHash - Context hash
   * @returns {Promise<string|null>} - Cached result or null
   */
  async getCachedHandlerResult(handlerId, contentHash, contextHash) {
    if (!this.cacheStrategies.handlerResults) {
      return null;
    }
    
    try {
      const cacheKey = `handler:${handlerId}:${contentHash}:${contextHash}`;
      const result = await this.cacheStrategies.handlerResults.get(cacheKey);
      
      if (result) {
        this.updateCacheMetrics('handlerResults', 'hit');
      } else {
        this.updateCacheMetrics('handlerResults', 'miss');
      }
      
      return result;
    } catch (error) {
      console.warn('⚠️  Handler cache get failed:', error.message);
      return null;
    }
  }

  /**
   * Cache handler result
   * @param {string} handlerId - Handler ID
   * @param {string} contentHash - Content hash
   * @param {string} contextHash - Context hash
   * @param {string} result - Result to cache
   */
  async cacheHandlerResult(handlerId, contentHash, contextHash, result) {
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
      console.warn('⚠️  Handler cache set failed:', error.message);
    }
  }

  /**
   * Update cache metrics for specific strategy
   * @param {string} strategy - Cache strategy name
   * @param {string} operation - Operation type (hit, miss, set)
   */
  updateCacheMetrics(strategy, operation) {
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
   * @param {number} processingTime - Processing time in milliseconds
   * @param {boolean} cacheHit - Whether this was a cache hit
   */
  updatePerformanceMetrics(processingTime, cacheHit) {
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
  checkPerformanceThresholds() {
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

    // Check cache hit ratio
    const totalCacheOps = this.metrics.cacheHits + this.metrics.cacheMisses;
    if (totalCacheOps > 0) {
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
   * @param {string} type - Alert type
   * @param {string} message - Alert message
   */
  generatePerformanceAlert(type, message) {
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

    console.warn(`⚠️  MarkupParser Performance Alert [${type}]: ${message}`);
    
    // Optionally send to notification system
    const notificationManager = this.engine.getManager('NotificationManager');
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
   * @returns {Array} - Array of performance alerts
   */
  getPerformanceAlerts() {
    return this.performanceMonitor ? [...this.performanceMonitor.alerts] : [];
  }

  /**
   * Clear performance alerts
   */
  clearPerformanceAlerts() {
    if (this.performanceMonitor) {
      this.performanceMonitor.alerts = [];
    }
  }

  async shutdown() {
    console.log('🔧 MarkupParser shutting down...');
    
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
    this.phases = [];
    
    await super.shutdown();
  }
}

module.exports = MarkupParser;
