/**
 * BaseFilter - Abstract base class for all content filters with modular configuration
 * 
 * Provides the foundation for content filtering with complete modularity through
 * app-default-config.json and app-custom-config.json configuration support.
 * 
 * Design Principles:
 * - Complete configuration modularity and reusability
 * - Zero hardcoded values - everything configurable
 * - Consistent interface across all filter types
 * - Performance monitoring and error handling
 * - Security-first design with configurable validation
 * 
 * Related Issue: Phase 4 - Filter Pipeline Core
 * Epic: #41 - Implement JSPWikiMarkupParser for Complete Enhancement Support
 */
class BaseFilter {
  /**
   * Create a content filter
   * @param {number} priority - Filter priority (0-1000, higher = executed first)
   * @param {Object} options - Filter configuration options
   */
  constructor(priority = 100, options = {}) {
    if (new.target === BaseFilter) {
      throw new Error('BaseFilter is abstract and cannot be instantiated directly');
    }

    // Validate priority
    if (typeof priority !== 'number' || priority < 0 || priority > 1000) {
      throw new Error('Priority must be a number between 0 and 1000');
    }

    // Core filter properties
    this.priority = priority;
    this.options = {
      enabled: true,
      timeout: 5000,
      cacheResults: true,
      cacheTTL: 600,
      ...options
    };

    // Filter metadata
    this.filterId = this.constructor.name;
    this.version = this.options.version || '1.0.0';
    this.description = this.options.description || '';
    this.category = this.options.category || 'general';

    // Performance tracking
    this.stats = {
      executionCount: 0,
      totalTime: 0,
      errorCount: 0,
      lastExecuted: null,
      averageTime: 0
    };

    // Filter state
    this.enabled = this.options.enabled;
    this.initialized = false;
    this.config = null;
  }

  /**
   * Initialize filter with modular configuration
   * @param {Object} context - Initialization context
   * @returns {Promise<void>}
   */
  async initialize(context = {}) {
    if (this.initialized) {
      return;
    }

    // Load modular configuration
    await this.loadModularConfiguration(context);

    // Perform custom initialization
    await this.onInitialize(context);

    this.initialized = true;
  }

  /**
   * Load configuration from app-default-config.json and app-custom-config.json
   * @param {Object} context - Initialization context
   */
  async loadModularConfiguration(context) {
    const configManager = context.engine?.getManager('ConfigurationManager');
    
    // Default configuration
    this.config = {
      enabled: true,
      priority: this.priority,
      timeout: 5000,
      cacheResults: true,
      cacheTTL: 600,
      reportErrors: true,
      logLevel: 'warn'
    };

    // Load from configuration files if available
    if (configManager) {
      try {
        const filterType = this.getFilterType();
        if (filterType) {
          // Load filter-specific configuration
          this.config.enabled = configManager.getProperty(`amdwiki.markup.filters.${filterType}.enabled`, this.config.enabled);
          this.config.priority = configManager.getProperty(`amdwiki.markup.filters.${filterType}.priority`, this.config.priority);
          
          // Update priority if configured
          if (this.config.priority !== this.priority) {
            this.priority = this.config.priority;
          }
        }
      } catch (error) {
        console.warn(`⚠️  Failed to load configuration for filter ${this.filterId}, using defaults:`, error.message);
      }
    }
  }

  /**
   * Get filter type for configuration lookup (override in subclasses)
   * @returns {string|null} - Filter type for configuration
   */
  getFilterType() {
    // Map common filter names to configuration keys
    const typeMap = {
      'SpamFilter': 'spam',
      'SecurityFilter': 'security',
      'ValidationFilter': 'validation',
      'XSSFilter': 'security',
      'CSRFFilter': 'security'
    };
    
    return typeMap[this.filterId] || null;
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
   * Main filter processing method - MUST be implemented by subclasses
   * @param {string} content - Content to filter
   * @param {ParseContext} context - Parse context
   * @returns {Promise<string>} - Filtered content
   */
  async process(content, context) {
    throw new Error(`Filter ${this.filterId} must implement process() method`);
  }

  /**
   * Execute filter with performance tracking and error handling
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
      const result = await this.process(content, context);
      
      // Update performance stats
      const executionTime = Date.now() - startTime;
      this.stats.totalTime += executionTime;
      this.stats.averageTime = this.stats.totalTime / this.stats.executionCount;
      this.stats.lastExecuted = new Date();

      return result;

    } catch (error) {
      this.stats.errorCount++;
      
      const errorContext = this.createErrorContext(error, content, context);
      
      if (this.config.reportErrors) {
        console.error(`❌ Filter ${this.filterId} execution failed:`, errorContext);
      }

      // Return original content for graceful degradation
      return content;
    }
  }

  /**
   * Create error context for debugging (modular error handling)
   * @param {Error} error - The error that occurred
   * @param {string} content - Content being processed
   * @param {ParseContext} context - Parse context
   * @returns {Object} - Error context
   */
  createErrorContext(error, content, context) {
    return {
      filterId: this.filterId,
      error: error.message,
      stack: error.stack,
      contentLength: content.length,
      contentPreview: content.substring(0, 100) + '...',
      context: {
        pageName: context.pageName,
        userName: context.userName
      },
      stats: { ...this.stats },
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Enable the filter
   */
  enable() {
    this.enabled = true;
  }

  /**
   * Disable the filter
   */
  disable() {
    this.enabled = false;
  }

  /**
   * Check if filter is enabled
   * @returns {boolean} - True if enabled
   */
  isEnabled() {
    return this.enabled;
  }

  /**
   * Get filter statistics
   * @returns {Object} - Filter statistics
   */
  getStats() {
    return {
      ...this.stats,
      filterId: this.filterId,
      priority: this.priority,
      enabled: this.enabled,
      initialized: this.initialized,
      category: this.category
    };
  }

  /**
   * Reset filter statistics
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
   * Get filter metadata
   * @returns {Object} - Filter metadata
   */
  getMetadata() {
    return {
      id: this.filterId,
      version: this.version,
      description: this.description,
      category: this.category,
      priority: this.priority,
      enabled: this.enabled,
      options: { ...this.options },
      stats: this.getStats(),
      configuration: this.config
    };
  }

  /**
   * Get configuration summary for debugging (modular introspection)
   * @returns {Object} - Configuration summary
   */
  getConfigurationSummary() {
    return {
      filterId: this.filterId,
      enabled: this.enabled,
      priority: this.priority,
      configuration: this.config,
      configurationSource: this.config ? 'loaded' : 'defaults',
      options: this.options
    };
  }

  /**
   * Clean up filter resources (optional override)
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
   * String representation of filter
   * @returns {string} - String representation
   */
  toString() {
    return `${this.filterId}(priority=${this.priority}, category=${this.category}, enabled=${this.enabled})`;
  }
}

module.exports = BaseFilter;
