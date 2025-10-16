const BaseManager = require('./BaseManager');
const RegionCache = require('../cache/RegionCache');
const logger = require('../utils/logger');

/**
 * CacheManager - Centralized cache management for amdWiki
 *
 * Provides a unified interface for caching across all managers with support for:
 * - Multiple cache backends via provider pattern (NodeCache, Redis, Null)
 * - Cache regions (namespaces) for different managers
 * - Configurable TTL and cache policies
 * - Statistics and monitoring
 * - Provider fallback pattern following #102, #104, #105, #106
 *
 * Configuration (all lowercase):
 * - amdwiki.cache.enabled - Enable/disable caching
 * - amdwiki.cache.provider.default - Default provider name
 * - amdwiki.cache.provider - Active provider name
 * - amdwiki.cache.defaultttl - Default TTL in seconds
 * - amdwiki.cache.maxkeys - Maximum cache keys
 *
 * @class CacheManager
 * @extends BaseManager
 *
 * @property {BaseCacheProvider|null} provider - The active cache provider
 * @property {string|null} providerClass - The class name of the loaded provider
 * @property {Map<string, RegionCache>} regions - Cache regions by name
 *
 * @see {@link BaseManager} for base functionality
 *
 * @example
 * const cacheManager = engine.getManager('CacheManager');
 * const region = cacheManager.getRegion('pages');
 * region.set('Main', pageData, 3600);
 */
class CacheManager extends BaseManager {
  /**
   * Creates a new CacheManager instance
   *
   * @constructor
   * @param {WikiEngine} engine - The wiki engine instance
   */
  constructor(engine) {
    super(engine);
    this.provider = null;
    this.providerClass = null;
    this.regions = new Map();
  }

  /**
   * Initialize the CacheManager and load the configured provider
   *
   * @async
   * @param {Object} [config={}] - Configuration object (unused, reads from ConfigurationManager)
   * @returns {Promise<void>}
   * @throws {Error} If ConfigurationManager is not available
   */
  async initialize(config = {}) {
    await super.initialize(config);

    const configManager = this.engine.getManager('ConfigurationManager');
    if (!configManager) {
      throw new Error('CacheManager requires ConfigurationManager');
    }

    // Check if cache is enabled (ALL LOWERCASE)
    const cacheEnabled = configManager.getProperty('amdwiki.cache.enabled', true);
    if (!cacheEnabled) {
      logger.info('🗄️  CacheManager: Caching disabled by configuration');
      // Load NullCacheProvider when disabled
      this.providerClass = 'NullCacheProvider';
      await this.#loadProvider();
      return;
    }

    // Load provider with fallback (ALL LOWERCASE)
    const defaultProvider = configManager.getProperty(
      'amdwiki.cache.provider.default',
      'nodecacheprovider'
    );
    const providerName = configManager.getProperty(
      'amdwiki.cache.provider',
      defaultProvider
    );

    // Normalize provider name to PascalCase for class loading
    // nodecacheprovider -> NodeCacheProvider
    this.providerClass = this.#normalizeProviderName(providerName);

    // Load shared cache settings (ALL LOWERCASE)
    this.defaultTTL = configManager.getProperty('amdwiki.cache.defaultttl', 300);
    this.maxKeys = configManager.getProperty('amdwiki.cache.maxkeys', 1000);
    this.checkPeriod = configManager.getProperty('amdwiki.cache.checkperiod', 120);

    logger.info(`🗄️  Loading cache provider: ${providerName} (${this.providerClass})`);

    // Load and initialize provider
    await this.#loadProvider();

    logger.info(`🗄️  CacheManager initialized with ${this.providerClass}`);
    logger.info(`🗄️  Cache settings - TTL: ${this.defaultTTL}s, MaxKeys: ${this.maxKeys}`);

    const providerInfo = this.provider.getProviderInfo();
    if (providerInfo.features && providerInfo.features.length > 0) {
      logger.info(`🗄️  Provider features: ${providerInfo.features.join(', ')}`);
    }
  }

  /**
   * Load the cache provider dynamically
   * @private
   * @returns {Promise<void>}
   */
  async #loadProvider() {
    try {
      // Try to load provider class
      const ProviderClass = require(`../providers/${this.providerClass}`);
      this.provider = new ProviderClass(this.engine);
      await this.provider.initialize();

      // Test provider health
      const isHealthy = await this.provider.isHealthy();
      if (!isHealthy) {
        logger.warn(`Cache provider ${this.providerClass} health check failed, switching to NullCacheProvider`);
        const NullCacheProvider = require('../providers/NullCacheProvider');
        this.provider = new NullCacheProvider(this.engine);
        await this.provider.initialize();
      }
    } catch (error) {
      logger.error(`Failed to load cache provider: ${this.providerClass}`, error);
      // Fall back to NullCacheProvider on any error
      logger.warn('Falling back to NullCacheProvider due to provider load error');
      const NullCacheProvider = require('../providers/NullCacheProvider');
      this.provider = new NullCacheProvider(this.engine);
      await this.provider.initialize();
    }
  }

  /**
   * Normalize provider name to PascalCase class name
   * @param {string} providerName - Lowercase provider name (e.g., 'nodecacheprovider')
   * @returns {string} PascalCase class name (e.g., 'NodeCacheProvider')
   * @private
   */
  #normalizeProviderName(providerName) {
    if (!providerName) {
      throw new Error('Provider name cannot be empty');
    }

    // Convert to lowercase first to ensure consistency
    const lower = providerName.toLowerCase();

    // Handle special cases for known provider names
    const knownProviders = {
      'nodecacheprovider': 'NodeCacheProvider',
      'rediscacheprovider': 'RedisCacheProvider',
      'nullcacheprovider': 'NullCacheProvider',
      'null': 'NullCacheProvider',
      'disabled': 'NullCacheProvider'
    };

    if (knownProviders[lower]) {
      return knownProviders[lower];
    }

    // Fallback: Split on common separators and capitalize each word
    const words = lower.split(/[-_]/);
    const pascalCase = words
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join('');

    return pascalCase;
  }

  /**
   * Get a cache region for a specific namespace
   * @param {string} region - Region name (typically manager name)
   * @returns {RegionCache} Cache instance scoped to the region
   */
  region(region) {
    if (!this.regions.has(region)) {
      this.regions.set(region, new RegionCache(this.provider, region));
    }
    return this.regions.get(region);
  }

  /**
   * Get a value from the cache (global scope)
   * @param {string} key - The cache key
   * @returns {Promise<any|undefined>} The cached value or undefined if not found
   */
  async get(key) {
    return await this.provider.get(key);
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
    const ttl = options.ttl || this.defaultTTL;
    return await this.provider.set(key, value, ttl);
  }

  /**
   * Delete one or more keys from the cache
   * @param {string|string[]} keys - Single key or array of keys to delete
   * @returns {Promise<void>}
   */
  async del(keys) {
    return await this.provider.del(keys);
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
      return await this.provider.clear(pattern);
    }
  }

  /**
   * Get keys matching a pattern
   * @param {string} [pattern='*'] - Pattern to match
   * @returns {Promise<string[]>} Array of matching keys
   */
  async keys(pattern = '*') {
    return await this.provider.keys(pattern);
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
      const globalStats = await this.provider.stats();
      const regions = Array.from(this.regions.keys());

      return {
        global: globalStats,
        regions: regions,
        provider: this.providerClass,
        config: {
          defaultTTL: this.defaultTTL,
          maxKeys: this.maxKeys,
          checkPeriod: this.checkPeriod
        }
      };
    }
  }

  /**
   * Check if the cache is healthy
   * @returns {Promise<boolean>} True if cache is healthy
   */
  async isHealthy() {
    return await this.provider.isHealthy();
  }

  /**
   * Get cache configuration
   * @returns {Object} Cache configuration
   */
  getConfig() {
    return {
      provider: this.providerClass,
      defaultTTL: this.defaultTTL,
      maxKeys: this.maxKeys,
      checkPeriod: this.checkPeriod
    };
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
    logger.warn('CacheManager.flushAll() - clearing ALL cache data');
    await this.provider.clear('*');
    this.regions.clear();
  }

  /**
   * Close and cleanup cache resources
   * @returns {Promise<void>}
   */
  async shutdown() {
    logger.info('🗄️  CacheManager shutting down...');

    if (this.provider) {
      await this.provider.close();
      this.provider = null;
    }

    this.regions.clear();

    await super.shutdown();
  }

  /**
   * Helper method to add cache support to BaseManager
   * Can be called from any manager to get a cache region
   * @param {Object} engine - WikiEngine instance
   * @param {string} [region] - Region name (defaults to calling class name)
   * @returns {RegionCache} Cache instance scoped to the region
   */
  static getCacheForManager(engine, region) {
    const cacheManager = engine.getManager('CacheManager');
    if (!cacheManager || !cacheManager.isInitialized()) {
      // Return a null cache if CacheManager not available
      const NullCacheProvider = require('../providers/NullCacheProvider');
      const nullProvider = new NullCacheProvider(engine);
      return new RegionCache(nullProvider, region || 'default');
    }
    return cacheManager.region(region || 'default');
  }
}

module.exports = CacheManager;
