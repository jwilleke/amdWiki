const BaseManager = require('../managers/BaseManager');
const ParseContext = require('./context/ParseContext');
const { HandlerRegistry } = require('./handlers/HandlerRegistry');

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
    this.filterChain = null;
    this.cache = null;
    this.metrics = {
      parseCount: 0,
      totalParseTime: 0,
      phaseMetrics: new Map(),
      errorCount: 0,
      cacheHits: 0,
      cacheMisses: 0
    };
  }

  async initialize(config = {}) {
    await super.initialize(config);

    // Load configuration from ConfigurationManager
    await this.loadConfiguration();

    // Initialize processing phases
    this.initializePhases();
    
    // Initialize cache integration
    await this.initializeCaching();
    
    // Initialize metrics collection
    this.initializeMetrics();
    
    // Configure handler registry
    this.configureHandlerRegistry();
    
    console.log('✅ MarkupParser initialized with 7-phase processing pipeline');
    console.log(`🔧 Phases: ${this.phases.map(p => p.name).join(' → ')}`);
    console.log(`⚙️  Configuration loaded: ${this.config.enabled ? 'enabled' : 'disabled'}`);
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
        attachment: { enabled: true, priority: 75 },
        style: { enabled: true, priority: 70 }
      },
      filters: {
        enabled: true,
        spam: { enabled: true },
        security: { enabled: true },
        validation: { enabled: true }
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
          this.config.handlers[handlerName].enabled = configManager.getProperty(`amdwiki.markup.handlers.${handlerName}.enabled`, this.config.handlers[handlerName].enabled);
          this.config.handlers[handlerName].priority = configManager.getProperty(`amdwiki.markup.handlers.${handlerName}.priority`, this.config.handlers[handlerName].priority);
        }
        
        // Filter configuration
        this.config.filters.enabled = configManager.getProperty('amdwiki.markup.filters.enabled', this.config.filters.enabled);
        this.config.filters.spam.enabled = configManager.getProperty('amdwiki.markup.filters.spam.enabled', this.config.filters.spam.enabled);
        this.config.filters.security.enabled = configManager.getProperty('amdwiki.markup.filters.security.enabled', this.config.filters.security.enabled);
        this.config.filters.validation.enabled = configManager.getProperty('amdwiki.markup.filters.validation.enabled', this.config.filters.validation.enabled);
        
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
   * Initialize the 7 processing phases
   * Each phase has a specific responsibility in the parsing pipeline
   */
  initializePhases() {
    this.phases = [
      {
        name: 'Preprocessing',
        priority: 100,
        process: this.phasePreprocessing.bind(this)
      },
      {
        name: 'Syntax Recognition',
        priority: 200,
        process: this.phaseSyntaxRecognition.bind(this)
      },
      {
        name: 'Context Resolution',
        priority: 300,
        process: this.phaseContextResolution.bind(this)
      },
      {
        name: 'Content Transformation',
        priority: 400,
        process: this.phaseContentTransformation.bind(this)
      },
      {
        name: 'Filter Pipeline',
        priority: 500,
        process: this.phaseFilterPipeline.bind(this)
      },
      {
        name: 'Markdown Conversion',
        priority: 600,
        process: this.phaseMarkdownConversion.bind(this)
      },
      {
        name: 'Post-processing',
        priority: 700,
        process: this.phasePostProcessing.bind(this)
      }
    ];

    // Sort phases by priority (should already be ordered)
    this.phases.sort((a, b) => a.priority - b.priority);
  }

  /**
   * Initialize caching integration with CacheManager
   */
  async initializeCaching() {
    if (!this.config.caching) {
      console.log('🗄️  MarkupParser caching disabled by configuration');
      return;
    }
    
    const cacheManager = this.engine.getManager('CacheManager');
    if (cacheManager && cacheManager.isInitialized()) {
      this.cache = cacheManager.region('MarkupParser');
      console.log(`🗄️  MarkupParser cache region initialized (TTL: ${this.config.cacheTTL}s)`);
    } else {
      console.warn('⚠️  CacheManager not available, parsing will not be cached');
    }
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

    try {
      // Generate cache key
      const cacheKey = this.generateCacheKey(content, context);
      
      // Check cache first
      if (this.cache) {
        const cached = await this.cache.get(cacheKey);
        if (cached) {
          this.metrics.cacheHits++;
          return cached;
        }
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

      // Cache the result
      if (this.cache) {
        await this.cache.set(cacheKey, processedContent, { ttl: this.config.cacheTTL });
      }

      // Update performance metrics
      this.metrics.totalParseTime += Date.now() - startTime;

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
   * Phase 1: Preprocessing
   * Handle escaping, protect code blocks, normalize content
   */
  async phasePreprocessing(content, context) {
    // Protect code blocks from processing
    const codeBlocks = [];
    let processedContent = content;

    // Extract and protect code blocks
    processedContent = processedContent.replace(/```[\s\S]*?```/g, (match) => {
      const placeholder = `__CODE_BLOCK_${codeBlocks.length}__`;
      codeBlocks.push(match);
      return placeholder;
    });

    // Protect inline code
    processedContent = processedContent.replace(/`[^`]+`/g, (match) => {
      const placeholder = `__INLINE_CODE_${codeBlocks.length}__`;
      codeBlocks.push(match);
      return placeholder;
    });

    // Store protected blocks in context
    context.protectedBlocks = codeBlocks;

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
   */
  async phaseContextResolution(content, context) {
    const variableManager = this.engine.getManager('VariableManager');
    if (variableManager) {
      // Expand system variables
      content = variableManager.expandVariables(content, context.pageContext);
    }
    
    return content;
  }

  /**
   * Phase 4: Content Transformation  
   * Execute syntax handlers in priority order
   */
  async phaseContentTransformation(content, context) {
    // Get handlers in dependency-resolved priority order
    const sortedHandlers = this.handlerRegistry.resolveExecutionOrder();

    let transformedContent = content;

    // Execute each handler using the registry's execution method
    for (const handler of sortedHandlers) {
      try {
        transformedContent = await handler.execute(transformedContent, context);
      } catch (error) {
        console.error(`❌ Error in handler ${handler.handlerId}:`, error);
        // Continue with other handlers
      }
    }

    return transformedContent;
  }

  /**
   * Phase 5: Filter Pipeline
   * Apply content filters for security, validation, etc.
   */
  async phaseFilterPipeline(content, context) {
    if (this.filterChain) {
      return await this.filterChain.process(content, context);
    }
    return content;
  }

  /**
   * Phase 6: Markdown Conversion
   * Convert markdown to HTML using Showdown
   */
  async phaseMarkdownConversion(content, context) {
    const renderingManager = this.engine.getManager('RenderingManager');
    if (renderingManager && renderingManager.converter) {
      // Use existing Showdown converter
      content = renderingManager.converter.makeHtml(content);
    }
    return content;
  }

  /**
   * Phase 7: Post-processing
   * Final cleanup, restore protected blocks, validation
   */
  async phasePostProcessing(content, context) {
    // Restore protected code blocks
    if (context.protectedBlocks) {
      context.protectedBlocks.forEach((block, index) => {
        const codeBlockPlaceholder = `__CODE_BLOCK_${index}__`;
        const inlineCodePlaceholder = `__INLINE_CODE_${index}__`;
        content = content.replace(new RegExp(codeBlockPlaceholder, 'g'), block);
        content = content.replace(new RegExp(inlineCodePlaceholder, 'g'), block);
      });
    }

    // Final HTML validation and cleanup
    content = this.cleanupHtml(content);

    return content;
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
   * Get handler type from handler ID for configuration lookup
   * @param {string} handlerId - Handler ID
   * @returns {string|null} - Handler type or null
   */
  getHandlerTypeFromId(handlerId) {
    const typeMap = {
      'PluginSyntaxHandler': 'plugin',
      'WikiTagHandler': 'wikitag',
      'WikiFormHandler': 'form',
      'InterWikiLinkHandler': 'interwiki',
      'AttachmentHandler': 'attachment',
      'WikiStyleHandler': 'style'
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
   * Clean up generated HTML
   * @param {string} html - HTML content to clean
   * @returns {string} - Cleaned HTML
   */
  cleanupHtml(html) {
    // Remove excessive whitespace
    html = html.replace(/\s+/g, ' ');
    
    // Fix common HTML issues
    html = html.replace(/>\s+</g, '><');
    
    // Ensure proper paragraph spacing
    html = html.replace(/(<\/p>)\s*(<p>)/g, '$1\n$2');
    
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

  async shutdown() {
    console.log('🔧 MarkupParser shutting down...');
    
    // Clear handler registry
    await this.handlerRegistry.clearAll();
    
    // Clear cache reference
    this.cache = null;
    
    // Clear phases
    this.phases = [];
    
    await super.shutdown();
  }
}

module.exports = MarkupParser;
