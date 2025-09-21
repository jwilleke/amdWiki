const BaseManager = require('./BaseManager');
const NodeCacheAdapter = require('../cache/NodeCacheAdapter');
const NullCacheAdapter = require('../cache/NullCacheAdapter');
const RegionCache = require('../cache/RegionCache');

/**
 * CacheManager - Centralized cache management for amdWiki
 * 
 * Provides a unified interface for caching across all managers with support for:
 * - Multiple cache backends (node-cache, Redis, etc.)
 * - Cache regions (namespaces) for different managers
 * - Configurable TTL and cache policies
 * - Statistics and monitoring
 */
class CacheManager extends BaseManager {
  constructor(engine) {
    super(engine);
    this.adapter = null;
    this.regions = new Map();
    this.config = {
      enabled: true,
      provider: 'node-cache',
      defaultTTL: 300,
      maxKeys: 1000,
      checkPeriod: 120,
      node: {
        stdTTL: 300,
        checkperiod: 120,
        maxKeys: 1000
      },
      redis: {
        url: 'redis://localhost:6379',
        keyPrefix: 'amdwiki:',
        enableCluster: false
      }
    };
  }

  async initialize(config = {}) {
    await super.initialize(config);

    // Load cache configuration from ConfigurationManager if available
    const configManager = this.engine.getManager('ConfigurationManager');
    if (configManager) {
      try {
        const enabled = configManager.getProperty('amdwiki.cache.enabled', this.config.enabled);
        const provider = configManager.getProperty('amdwiki.cache.provider', this.config.provider);
        const defaultTTL = configManager.getProperty('amdwiki.cache.defaultTTL', this.config.defaultTTL);
        const maxKeys = configManager.getProperty('amdwiki.cache.maxKeys', this.config.maxKeys);
        const checkPeriod = configManager.getProperty('amdwiki.cache.checkPeriod', this.config.checkPeriod);

        this.config = {
          ...this.config,
          enabled,
          provider,
          defaultTTL,
          maxKeys,
          checkPeriod,
          node: {
            stdTTL: configManager.getProperty('amdwiki.cache.node.stdTTL', this.config.node.stdTTL),
            checkperiod: configManager.getProperty('amdwiki.cache.node.checkperiod', this.config.node.checkperiod),
            maxKeys: configManager.getProperty('amdwiki.cache.node.maxKeys', this.config.node.maxKeys)
          },
          redis: {
            url: configManager.getProperty('amdwiki.cache.redis.url', this.config.redis.url),
            keyPrefix: configManager.getProperty('amdwiki.cache.redis.keyPrefix', this.config.redis.keyPrefix),
            enableCluster: configManager.getProperty('amdwiki.cache.redis.enableCluster', this.config.redis.enableCluster)
          }
        };
      } catch (err) {
        console.warn('Failed to load cache config from ConfigurationManager, using defaults:', err.message);
      }
    }

    // Override with any config passed to initialize
    this.config = { ...this.config, ...config };

    // Create cache adapter based on configuration
    await this.createAdapter();

    console.log(`🗄️  CacheManager initialized with ${this.config.provider} provider (enabled: ${this.config.enabled})`);
  }

  /**
   * Create the appropriate cache adapter based on configuration
   */
  async createAdapter() {
    if (!this.config.enabled) {
      this.adapter = new NullCacheAdapter();
      return;
    }

    switch (this.config.provider) {
      case 'node-cache':
        this.adapter = new NodeCacheAdapter(this.config.node);
        break;
      
      case 'redis':
        // Future implementation - for now fall back to node-cache
        console.warn('Redis cache adapter not yet implemented, falling back to node-cache');
        this.adapter = new NodeCacheAdapter(this.config.node);
        break;
      
      case 'disabled':
      case 'null':
        this.adapter = new NullCacheAdapter();
        break;
      
      default:
        console.warn(`Unknown cache provider '${this.config.provider}', falling back to node-cache`);
        this.adapter = new NodeCacheAdapter(this.config.node);
    }

    // Test adapter health
    const isHealthy = await this.adapter.isHealthy();
    if (!isHealthy) {
      console.warn('Cache adapter health check failed, switching to null adapter');
      this.adapter = new NullCacheAdapter();
    }
  }

  /**
   * Get a cache region for a specific namespace
   * @param {string} region - Region name (typically manager name)
   * @returns {RegionCache} Cache instance scoped to the region
   */
  region(region) {
    if (!this.regions.has(region)) {
      this.regions.set(region, new RegionCache(this.adapter, region));
    }
    return this.regions.get(region);
  }

  /**
   * Get a value from the cache (global scope)
   * @param {string} key - The cache key
   * @returns {Promise<any|undefined>} The cached value or undefined if not found
   */
  async get(key) {
    return await this.adapter.get(key);
  }

  /**
   * Set a value in the cache (global scope)
   * @param {string} key - The cache key
   * @param {any} value - The value to cache
   * @param {Object} [options] - Cache options
   * @param {number} [options.ttl] - Time to live in seconds
   * @returns {Promise<void>}
   */
  async set(key, value, options = {}) {
    const ttl = options.ttl || this.config.defaultTTL;
    return await this.adapter.set(key, value, ttl);
  }

  /**
   * Delete one or more keys from the cache
   * @param {string|string[]} keys - Single key or array of keys to delete
   * @returns {Promise<void>}
   */
  async del(keys) {
    return await this.adapter.del(keys);
  }

  /**
   * Clear cache entries
   * @param {string} [region] - Optional region to clear (if not specified, clears all)
   * @param {string} [pattern] - Optional pattern to match keys
   * @returns {Promise<void>}
   */
  async clear(region, pattern) {
    if (region) {
      const regionCache = this.region(region);
      return await regionCache.clear(pattern);
    } else {
      return await this.adapter.clear(pattern);
    }
  }

  /**
   * Get keys matching a pattern
   * @param {string} [pattern='*'] - Pattern to match
   * @returns {Promise<string[]>} Array of matching keys
   */
  async keys(pattern = '*') {
    return await this.adapter.keys(pattern);
  }

  /**
   * Get cache statistics
   * @param {string} [region] - Optional region to get stats for
   * @returns {Promise<Object>} Cache statistics
   */
  async stats(region) {
    if (region) {
      const regionCache = this.region(region);
      return await regionCache.stats();
    } else {
      const globalStats = await this.adapter.stats();
      const regions = Array.from(this.regions.keys());
      
      return {
        global: globalStats,
        regions: regions,
        config: {
          enabled: this.config.enabled,
          provider: this.config.provider,
          defaultTTL: this.config.defaultTTL,
          maxKeys: this.config.maxKeys
        }
      };
    }
  }

  /**
   * Check if the cache is healthy
   * @returns {Promise<boolean>} True if cache is healthy
   */
  async isHealthy() {
    return await this.adapter.isHealthy();
  }

  /**
   * Get cache configuration
   * @returns {Object} Cache configuration
   */
  getConfig() {
    return { ...this.config };
  }

  /**
   * Get all active regions
   * @returns {string[]} Array of region names
   */
  getRegions() {
    return Array.from(this.regions.keys());
  }

  /**
   * Flush all caches (dangerous operation)
   * @returns {Promise<void>}
   */
  async flushAll() {
    console.warn('CacheManager.flushAll() - clearing ALL cache data');
    await this.adapter.clear('*');
    this.regions.clear();
  }

  /**
   * Close and cleanup cache resources
   * @returns {Promise<void>}
   */
  async shutdown() {
    console.log('🗄️  CacheManager shutting down...');
    
    if (this.adapter) {
      await this.adapter.close();
      this.adapter = null;
    }
    
    this.regions.clear();
    
    await super.shutdown();
  }

  /**
   * Helper method to add cache support to BaseManager
   * Can be called from any manager to get a cache region
   * @param {string} [region] - Region name (defaults to calling class name)
   * @returns {RegionCache} Cache instance scoped to the region
   */
  static getCacheForManager(engine, region) {
    const cacheManager = engine.getManager('CacheManager');
    if (!cacheManager || !cacheManager.isInitialized()) {
      // Return a null cache if CacheManager not available
      const nullAdapter = new NullCacheAdapter();
      return new RegionCache(nullAdapter, region || 'default');
    }
    return cacheManager.region(region || 'default');
  }
}

module.exports = CacheManager;
