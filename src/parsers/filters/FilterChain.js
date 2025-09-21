const BaseFilter = require('./BaseFilter');

/**
 * FilterChain - Modular content filtering pipeline with complete configuration support
 * 
 * Provides a sophisticated, configurable filter system that processes content through
 * multiple stages with priority-based execution, performance monitoring, and error handling.
 * 
 * Design Principles:
 * - Complete modularity through app-default-config.json and app-custom-config.json
 * - Zero hardcoded values - everything configurable
 * - Reusable architecture for any content filtering needs
 * - Performance monitoring and caching integration
 * 
 * Related Issue: Phase 4 - Filter Pipeline Core
 * Epic: #41 - Implement JSPWikiMarkupParser for Complete Enhancement Support
 */
class FilterChain {
  constructor(engine = null) {
    this.engine = engine;
    this.filters = [];
    this.filtersByPriority = [];
    this.filterMap = new Map(); // filterId -> filter instance
    this.config = null;
    
    // Performance and monitoring
    this.stats = {
      executionCount: 0,
      totalTime: 0,
      filterExecutions: new Map(),
      errorCount: 0,
      lastExecution: null
    };
  }

  /**
   * Initialize FilterChain with complete modular configuration
   * @param {Object} context - Initialization context
   */
  async initialize(context = {}) {
    this.engine = context.engine;
    
    // Load modular configuration from app-default-config.json and app-custom-config.json
    await this.loadModularConfiguration();
    
    // Initialize filter performance monitoring
    this.initializePerformanceMonitoring();
    
    console.log('🔧 FilterChain initialized with modular configuration:');
    console.log(`   🔄 Max filters: ${this.config.maxFilters}`);
    console.log(`   ⏱️  Timeout: ${this.config.timeout}ms`);
    console.log(`   📊 Profiling: ${this.config.enableProfiling ? 'enabled' : 'disabled'}`);
    console.log(`   🛡️  Fail on error: ${this.config.failOnError ? 'enabled' : 'disabled'}`);
  }

  /**
   * Load modular configuration from app-default-config.json and app-custom-config.json
   * Demonstrates complete configuration modularity and reusability
   */
  async loadModularConfiguration() {
    const configManager = this.engine?.getManager('ConfigurationManager');
    
    // Default configuration (equivalent to app-default-config.json values)
    this.config = {
      enabled: true,
      maxFilters: 50,
      timeout: 10000,
      enableProfiling: true,
      failOnError: false,
      cacheResults: true,
      cacheTTL: 600,
      
      // Security defaults
      preventXSS: true,
      sanitizeHTML: true,
      stripDangerousContent: true,
      
      // Performance defaults
      enableParallelExecution: false, // Sequential by default for safety
      maxConcurrentFilters: 3
    };

    // Load configuration from app-default-config.json and allow app-custom-config.json overrides
    if (configManager) {
      try {
        // Filter pipeline configuration (modular)
        this.config.enabled = configManager.getProperty('amdwiki.markup.filters.enabled', this.config.enabled);
        this.config.maxFilters = configManager.getProperty('amdwiki.markup.filters.pipeline.maxFilters', this.config.maxFilters);
        this.config.timeout = configManager.getProperty('amdwiki.markup.filters.pipeline.timeout', this.config.timeout);
        this.config.enableProfiling = configManager.getProperty('amdwiki.markup.filters.pipeline.enableProfiling', this.config.enableProfiling);
        this.config.failOnError = configManager.getProperty('amdwiki.markup.filters.pipeline.failOnError', this.config.failOnError);
        
        // Cache configuration (modular)
        this.config.cacheResults = configManager.getProperty('amdwiki.markup.filters.cacheResults', this.config.cacheResults);
        this.config.cacheTTL = configManager.getProperty('amdwiki.markup.filters.cacheTTL', this.config.cacheTTL);
        
        // Performance configuration (modular)
        this.config.enableParallelExecution = configManager.getProperty('amdwiki.markup.filters.enableParallelExecution', this.config.enableParallelExecution);
        this.config.maxConcurrentFilters = configManager.getProperty('amdwiki.markup.filters.maxConcurrentFilters', this.config.maxConcurrentFilters);
        
      } catch (error) {
        console.warn('⚠️  Failed to load FilterChain configuration, using defaults:', error.message);
      }
    }
  }

  /**
   * Initialize performance monitoring for filter execution
   */
  initializePerformanceMonitoring() {
    if (!this.config.enableProfiling) {
      return;
    }

    // Initialize filter-specific performance tracking
    this.performanceMonitor = {
      enabled: true,
      recentExecutions: [],
      maxRecentEntries: 100,
      alertThresholds: {
        executionTime: 1000, // 1 second
        errorRate: 0.1 // 10%
      }
    };
  }

  /**
   * Add filter to the chain with modular configuration
   * @param {BaseFilter} filter - Filter to add
   * @param {Object} options - Registration options
   * @returns {boolean} - True if added successfully
   */
  addFilter(filter, options = {}) {
    // Validate filter
    if (!(filter instanceof BaseFilter)) {
      throw new Error('Filter must extend BaseFilter');
    }

    // Check filter limit (modular configuration)
    if (this.filters.length >= this.config.maxFilters) {
      throw new Error(`Cannot add filter: maximum limit (${this.config.maxFilters}) reached`);
    }

    // Check for duplicate filter IDs
    if (this.filterMap.has(filter.filterId)) {
      throw new Error(`Filter with ID ${filter.filterId} already exists`);
    }

    // Add to collections
    this.filters.push(filter);
    this.filterMap.set(filter.filterId, filter);
    
    // Initialize filter-specific stats
    this.stats.filterExecutions.set(filter.filterId, {
      executionCount: 0,
      totalTime: 0,
      errorCount: 0,
      lastExecuted: null
    });

    // Rebuild priority-sorted list
    this.rebuildPriorityList();
    
    console.log(`🔧 Filter added to chain: ${filter.filterId} (priority: ${filter.priority})`);
    return true;
  }

  /**
   * Remove filter from the chain
   * @param {string} filterId - Filter ID to remove
   * @returns {boolean} - True if removed successfully
   */
  removeFilter(filterId) {
    const filter = this.filterMap.get(filterId);
    if (!filter) {
      return false;
    }

    // Remove from collections
    this.filters = this.filters.filter(f => f.filterId !== filterId);
    this.filterMap.delete(filterId);
    this.stats.filterExecutions.delete(filterId);

    // Rebuild priority list
    this.rebuildPriorityList();
    
    console.log(`🗑️  Filter removed from chain: ${filterId}`);
    return true;
  }

  /**
   * Rebuild priority-sorted filter list (modular ordering)
   */
  rebuildPriorityList() {
    this.filtersByPriority = this.filters
      .filter(filter => filter.enabled)
      .sort((a, b) => {
        // Sort by priority (higher first), then by filterId for consistency
        if (b.priority !== a.priority) {
          return b.priority - a.priority;
        }
        return a.filterId.localeCompare(b.filterId);
      });
  }

  /**
   * Process content through the filter chain with modular execution
   * @param {string} content - Content to filter
   * @param {ParseContext} context - Parse context
   * @returns {Promise<string>} - Filtered content
   */
  async process(content, context) {
    if (!this.config.enabled || !content) {
      return content;
    }

    const startTime = Date.now();
    this.stats.executionCount++;

    try {
      let processedContent = content;
      
      // Execute filters based on configuration
      if (this.config.enableParallelExecution) {
        processedContent = await this.executeFiltersParallel(processedContent, context);
      } else {
        processedContent = await this.executeFiltersSequential(processedContent, context);
      }

      // Update performance stats
      const executionTime = Date.now() - startTime;
      this.stats.totalTime += executionTime;
      this.stats.lastExecution = new Date();

      // Track performance for monitoring
      if (this.performanceMonitor) {
        this.trackFilterExecution(executionTime, true);
      }

      return processedContent;

    } catch (error) {
      this.stats.errorCount++;
      
      if (this.performanceMonitor) {
        this.trackFilterExecution(Date.now() - startTime, false);
      }

      if (this.config.failOnError) {
        throw new Error(`FilterChain execution failed: ${error.message}`);
      }

      console.error('❌ FilterChain execution error (continuing with original content):', error.message);
      return content; // Return original content on error
    }
  }

  /**
   * Execute filters sequentially (default, safe mode)
   * @param {string} content - Content to process
   * @param {ParseContext} context - Parse context
   * @returns {Promise<string>} - Processed content
   */
  async executeFiltersSequential(content, context) {
    let processedContent = content;

    for (const filter of this.filtersByPriority) {
      const filterStartTime = Date.now();
      
      try {
        // Execute filter with timeout
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => reject(new Error(`Filter ${filter.filterId} timeout`)), this.config.timeout);
        });
        
        const filterPromise = filter.process(processedContent, context);
        processedContent = await Promise.race([filterPromise, timeoutPromise]);
        
        // Update filter-specific stats
        const filterTime = Date.now() - filterStartTime;
        const filterStats = this.stats.filterExecutions.get(filter.filterId);
        if (filterStats) {
          filterStats.executionCount++;
          filterStats.totalTime += filterTime;
          filterStats.lastExecuted = new Date();
        }

      } catch (error) {
        const filterStats = this.stats.filterExecutions.get(filter.filterId);
        if (filterStats) {
          filterStats.errorCount++;
        }

        console.error(`❌ Filter ${filter.filterId} failed:`, error.message);
        
        if (this.config.failOnError) {
          throw error;
        }
        // Continue with next filter on error
      }
    }

    return processedContent;
  }

  /**
   * Execute filters in parallel (advanced mode - configurable)
   * @param {string} content - Content to process
   * @param {ParseContext} context - Parse context
   * @returns {Promise<string>} - Processed content
   */
  async executeFiltersParallel(content, context) {
    // Group filters by priority for parallel execution within groups
    const priorityGroups = new Map();
    
    for (const filter of this.filtersByPriority) {
      if (!priorityGroups.has(filter.priority)) {
        priorityGroups.set(filter.priority, []);
      }
      priorityGroups.get(filter.priority).push(filter);
    }

    let processedContent = content;

    // Execute each priority group
    for (const [priority, filtersInGroup] of Array.from(priorityGroups.entries()).sort((a, b) => b[0] - a[0])) {
      if (filtersInGroup.length === 1) {
        // Single filter, execute normally
        processedContent = await this.executeFilter(filtersInGroup[0], processedContent, context);
      } else {
        // Multiple filters at same priority, execute in parallel
        const filterResults = await Promise.allSettled(
          filtersInGroup.map(filter => this.executeFilter(filter, processedContent, context))
        );

        // Use result from first successful filter, or original content if all fail
        const successResult = filterResults.find(result => result.status === 'fulfilled');
        if (successResult) {
          processedContent = successResult.value;
        }
      }
    }

    return processedContent;
  }

  /**
   * Execute a single filter with error handling
   * @param {BaseFilter} filter - Filter to execute
   * @param {string} content - Content to process
   * @param {ParseContext} context - Parse context
   * @returns {Promise<string>} - Processed content
   */
  async executeFilter(filter, content, context) {
    const startTime = Date.now();

    try {
      const result = await filter.process(content, context);
      
      // Update stats
      const filterTime = Date.now() - startTime;
      const filterStats = this.stats.filterExecutions.get(filter.filterId);
      if (filterStats) {
        filterStats.executionCount++;
        filterStats.totalTime += filterTime;
        filterStats.lastExecuted = new Date();
      }

      return result;

    } catch (error) {
      const filterStats = this.stats.filterExecutions.get(filter.filterId);
      if (filterStats) {
        filterStats.errorCount++;
      }

      throw error;
    }
  }

  /**
   * Track filter execution for performance monitoring (modular monitoring)
   * @param {number} executionTime - Execution time in milliseconds
   * @param {boolean} success - Whether execution was successful
   */
  trackFilterExecution(executionTime, success) {
    if (!this.performanceMonitor) {
      return;
    }

    this.performanceMonitor.recentExecutions.push({
      executionTime,
      success,
      timestamp: Date.now()
    });

    // Limit recent entries
    if (this.performanceMonitor.recentExecutions.length > this.performanceMonitor.maxRecentEntries) {
      this.performanceMonitor.recentExecutions.shift();
    }

    // Check performance thresholds
    this.checkPerformanceThresholds();
  }

  /**
   * Check performance thresholds and generate alerts (modular alerting)
   */
  checkPerformanceThresholds() {
    if (!this.performanceMonitor || this.performanceMonitor.recentExecutions.length < 10) {
      return;
    }

    const recent = this.performanceMonitor.recentExecutions.slice(-20);
    
    // Check average execution time
    const avgTime = recent.reduce((sum, exec) => sum + exec.executionTime, 0) / recent.length;
    if (avgTime > this.performanceMonitor.alertThresholds.executionTime) {
      this.generateAlert('SLOW_FILTER_EXECUTION', `Average filter execution time ${avgTime.toFixed(2)}ms exceeds threshold`);
    }

    // Check error rate
    const errorCount = recent.filter(exec => !exec.success).length;
    const errorRate = errorCount / recent.length;
    if (errorRate > this.performanceMonitor.alertThresholds.errorRate) {
      this.generateAlert('HIGH_FILTER_ERROR_RATE', `Filter error rate ${(errorRate * 100).toFixed(1)}% exceeds threshold`);
    }
  }

  /**
   * Generate performance alert (modular alerting)
   * @param {string} type - Alert type
   * @param {string} message - Alert message
   */
  generateAlert(type, message) {
    console.warn(`⚠️  FilterChain Performance Alert [${type}]: ${message}`);
    
    // Send to notification system if available
    const notificationManager = this.engine?.getManager('NotificationManager');
    if (notificationManager) {
      notificationManager.addNotification({
        type: 'performance',
        title: `FilterChain Alert: ${type}`,
        message,
        priority: 'medium',
        source: 'FilterChain'
      });
    }
  }

  /**
   * Get filter by ID
   * @param {string} filterId - Filter ID
   * @returns {BaseFilter|null} - Filter or null if not found
   */
  getFilter(filterId) {
    return this.filterMap.get(filterId) || null;
  }

  /**
   * Get all filters sorted by priority
   * @param {boolean} enabledOnly - Only return enabled filters
   * @returns {Array<BaseFilter>} - Filters sorted by priority
   */
  getFilters(enabledOnly = true) {
    if (enabledOnly) {
      return [...this.filtersByPriority];
    }
    return [...this.filters];
  }

  /**
   * Enable filter by ID
   * @param {string} filterId - Filter ID
   * @returns {boolean} - True if successful
   */
  enableFilter(filterId) {
    const filter = this.filterMap.get(filterId);
    if (filter) {
      filter.enable();
      this.rebuildPriorityList();
      console.log(`✅ Enabled filter: ${filterId}`);
      return true;
    }
    return false;
  }

  /**
   * Disable filter by ID
   * @param {string} filterId - Filter ID
   * @returns {boolean} - True if successful
   */
  disableFilter(filterId) {
    const filter = this.filterMap.get(filterId);
    if (filter) {
      filter.disable();
      this.rebuildPriorityList();
      console.log(`❌ Disabled filter: ${filterId}`);
      return true;
    }
    return false;
  }

  /**
   * Get comprehensive filter chain statistics (modular monitoring)
   * @returns {Object} - Filter chain statistics
   */
  getStats() {
    const filterStats = {};
    for (const [filterId, stats] of this.stats.filterExecutions) {
      filterStats[filterId] = {
        ...stats,
        averageTime: stats.executionCount > 0 ? stats.totalTime / stats.executionCount : 0
      };
    }

    return {
      chain: {
        executionCount: this.stats.executionCount,
        totalTime: this.stats.totalTime,
        averageTime: this.stats.executionCount > 0 ? this.stats.totalTime / this.stats.executionCount : 0,
        errorCount: this.stats.errorCount,
        lastExecution: this.stats.lastExecution,
        filterCount: this.filters.length,
        enabledFilterCount: this.filtersByPriority.length
      },
      filters: filterStats,
      configuration: {
        enabled: this.config.enabled,
        maxFilters: this.config.maxFilters,
        timeout: this.config.timeout,
        enableProfiling: this.config.enableProfiling,
        failOnError: this.config.failOnError
      },
      performance: this.performanceMonitor ? {
        recentExecutionCount: this.performanceMonitor.recentExecutions.length,
        alertThresholds: this.performanceMonitor.alertThresholds
      } : null
    };
  }

  /**
   * Reset all filter statistics
   */
  resetStats() {
    this.stats = {
      executionCount: 0,
      totalTime: 0,
      filterExecutions: new Map(),
      errorCount: 0,
      lastExecution: null
    };

    // Re-initialize filter stats
    for (const filterId of this.filterMap.keys()) {
      this.stats.filterExecutions.set(filterId, {
        executionCount: 0,
        totalTime: 0,
        errorCount: 0,
        lastExecuted: null
      });
    }

    if (this.performanceMonitor) {
      this.performanceMonitor.recentExecutions = [];
    }
  }

  /**
   * Get configuration summary for debugging (modular introspection)
   * @returns {Object} - Configuration summary
   */
  getConfiguration() {
    return {
      ...this.config,
      filterCount: this.filters.length,
      enabledFilterCount: this.filtersByPriority.length,
      configurationSource: this.engine?.getManager('ConfigurationManager') ? 'ConfigurationManager' : 'defaults'
    };
  }

  /**
   * Export filter chain state for persistence or debugging
   * @returns {Object} - Serializable state
   */
  exportState() {
    return {
      config: this.config,
      stats: {
        ...this.stats,
        filterExecutions: Object.fromEntries(this.stats.filterExecutions)
      },
      filters: this.filters.map(filter => ({
        filterId: filter.filterId,
        priority: filter.priority,
        enabled: filter.enabled,
        description: filter.description
      }))
    };
  }

  /**
   * Clear all filters and reset state
   * @returns {Promise<void>}
   */
  async clearAll() {
    for (const filter of this.filters) {
      try {
        await filter.shutdown();
      } catch (error) {
        console.error(`❌ Error shutting down filter ${filter.filterId}:`, error.message);
      }
    }

    this.filters = [];
    this.filtersByPriority = [];
    this.filterMap.clear();
    this.resetStats();
    
    console.log('🔧 FilterChain cleared');
  }

  /**
   * Shutdown filter chain
   * @returns {Promise<void>}
   */
  async shutdown() {
    console.log('🔧 FilterChain shutting down...');
    await this.clearAll();
    this.performanceMonitor = null;
  }
}

module.exports = FilterChain;
