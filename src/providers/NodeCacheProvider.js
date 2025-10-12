const BaseCacheProvider = require('./BaseCacheProvider');
const NodeCache = require('node-cache');
const logger = require('../utils/logger');

/**
 * NodeCacheProvider - In-memory cache provider using node-cache
 *
 * Provides high-performance in-memory caching with TTL support.
 * Suitable for single-instance deployments and development.
 *
 * Configuration keys (all lowercase):
 * - amdwiki.cache.provider.nodecache.stdttl - Default TTL in seconds
 * - amdwiki.cache.provider.nodecache.checkperiod - Check for expired keys interval
 * - amdwiki.cache.provider.nodecache.maxkeys - Maximum number of keys
 * - amdwiki.cache.provider.nodecache.useclones - Whether to clone objects
 */
class NodeCacheProvider extends BaseCacheProvider {
  constructor(engine) {
    super(engine);
    this.cache = null;
    this.config = null;
    this.statistics = {
      hits: 0,
      misses: 0,
      sets: 0,
      deletes: 0
    };
  }

  /**
   * Initialize the NodeCache provider
   * Loads configuration from ConfigurationManager
   * @returns {Promise<void>}
   */
  async initialize() {
    const configManager = this.engine.getManager('ConfigurationManager');
    if (!configManager) {
      throw new Error('NodeCacheProvider requires ConfigurationManager');
    }

    // Load provider-specific settings (ALL LOWERCASE)
    const stdTTL = configManager.getProperty(
      'amdwiki.cache.provider.nodecache.stdttl',
      300
    );
    const checkperiod = configManager.getProperty(
      'amdwiki.cache.provider.nodecache.checkperiod',
      120
    );
    const maxKeys = configManager.getProperty(
      'amdwiki.cache.provider.nodecache.maxkeys',
      1000
    );
    const useClones = configManager.getProperty(
      'amdwiki.cache.provider.nodecache.useclones',
      true
    );

    this.config = {
      stdTTL: stdTTL,
      checkperiod: checkperiod,
      useClones: useClones,
      deleteOnExpire: true,
      maxKeys: maxKeys
    };

    // Create NodeCache instance
    this.cache = new NodeCache(this.config);

    // Set up event listeners for statistics
    this.cache.on('hit', () => {
      this.statistics.hits++;
    });

    this.cache.on('miss', () => {
      this.statistics.misses++;
    });

    this.cache.on('set', () => {
      this.statistics.sets++;
    });

    this.cache.on('del', () => {
      this.statistics.deletes++;
    });

    this.initialized = true;

    logger.info(`[NodeCacheProvider] Initialized with maxKeys=${maxKeys}, stdTTL=${stdTTL}s`);
  }

  /**
   * Get provider information
   * @returns {Object} Provider metadata
   */
  getProviderInfo() {
    return {
      name: 'NodeCacheProvider',
      version: '1.0.0',
      description: 'In-memory cache provider using node-cache',
      features: ['ttl', 'patterns', 'statistics', 'local-memory']
    };
  }

  /**
   * Get a value from the cache
   * @param {string} key - The cache key
   * @returns {Promise<any|undefined>} The cached value or undefined if not found
   */
  async get(key) {
    try {
      const value = this.cache.get(key);
      return value;
    } catch (error) {
      logger.error('[NodeCacheProvider] Get error:', error);
      return undefined;
    }
  }

  /**
   * Set a value in the cache
   * @param {string} key - The cache key
   * @param {any} value - The value to cache
   * @param {number} [ttlSec] - Time to live in seconds
   * @returns {Promise<void>}
   */
  async set(key, value, ttlSec) {
    try {
      if (ttlSec !== undefined) {
        this.cache.set(key, value, ttlSec);
      } else {
        this.cache.set(key, value);
      }
    } catch (error) {
      logger.error('[NodeCacheProvider] Set error:', error);
      throw error;
    }
  }

  /**
   * Delete one or more keys from the cache
   * @param {string|string[]} keys - Single key or array of keys to delete
   * @returns {Promise<void>}
   */
  async del(keys) {
    try {
      if (Array.isArray(keys)) {
        this.cache.del(keys);
      } else {
        this.cache.del(keys);
      }
    } catch (error) {
      logger.error('[NodeCacheProvider] Delete error:', error);
      throw error;
    }
  }

  /**
   * Clear cache entries
   * @param {string} [pattern] - Optional pattern to match keys (e.g., 'user:*')
   * @returns {Promise<void>}
   */
  async clear(pattern) {
    try {
      if (!pattern || pattern === '*') {
        // Clear all keys
        this.cache.flushAll();
      } else {
        // Clear keys matching pattern
        const keys = await this.keys(pattern);
        if (keys.length > 0) {
          this.cache.del(keys);
        }
      }
    } catch (error) {
      logger.error('[NodeCacheProvider] Clear error:', error);
      throw error;
    }
  }

  /**
   * Get keys matching a pattern
   * @param {string} [pattern='*'] - Pattern to match (e.g., 'user:*' or '*' for all)
   * @returns {Promise<string[]>} Array of matching keys
   */
  async keys(pattern = '*') {
    try {
      const allKeys = this.cache.keys();

      if (pattern === '*') {
        return allKeys;
      }

      // Simple pattern matching - convert glob-style pattern to regex
      const regexPattern = pattern
        .replace(/\*/g, '.*')
        .replace(/\?/g, '.');
      const regex = new RegExp(`^${regexPattern}$`);

      return allKeys.filter(key => regex.test(key));
    } catch (error) {
      logger.error('[NodeCacheProvider] Keys error:', error);
      return [];
    }
  }

  /**
   * Get cache statistics
   * @returns {Promise<CacheStats>} Cache statistics
   */
  async stats() {
    try {
      const nodeStats = this.cache.getStats();

      return {
        hits: this.statistics.hits,
        misses: this.statistics.misses,
        keys: nodeStats.keys,
        ksize: nodeStats.ksize,
        vsize: nodeStats.vsize,
        sets: this.statistics.sets,
        deletes: this.statistics.deletes,
        hitRate: this.statistics.hits + this.statistics.misses > 0
          ? (this.statistics.hits / (this.statistics.hits + this.statistics.misses)) * 100
          : 0,
        maxKeys: this.config.maxKeys,
        stdTTL: this.config.stdTTL
      };
    } catch (error) {
      logger.error('[NodeCacheProvider] Stats error:', error);
      return {
        hits: 0,
        misses: 0,
        keys: 0,
        ksize: 0,
        vsize: 0,
        sets: 0,
        deletes: 0,
        hitRate: 0,
        maxKeys: this.config?.maxKeys || 0,
        stdTTL: this.config?.stdTTL || 0
      };
    }
  }

  /**
   * Check if the cache provider is healthy/connected
   * @returns {Promise<boolean>} True if healthy
   */
  async isHealthy() {
    try {
      // Test basic functionality
      const testKey = '__health_check__';
      await this.set(testKey, 'test', 1);
      const value = await this.get(testKey);
      await this.del(testKey);
      return value === 'test';
    } catch (error) {
      logger.error('[NodeCacheProvider] Health check failed:', error);
      return false;
    }
  }

  /**
   * Close/cleanup the cache provider
   * @returns {Promise<void>}
   */
  async close() {
    try {
      if (this.cache) {
        this.cache.close();
        this.cache = null;
      }
      this.initialized = false;
      logger.info('[NodeCacheProvider] Closed successfully');
    } catch (error) {
      logger.error('[NodeCacheProvider] Close error:', error);
    }
  }

  /**
   * Backup cache configuration and statistics
   * @returns {Promise<Object>} Backup data
   */
  async backup() {
    const baseBackup = await super.backup();
    return {
      ...baseBackup,
      config: { ...this.config },
      statistics: { ...this.statistics },
      keyCount: this.cache ? this.cache.keys().length : 0
    };
  }

  /**
   * Get the underlying node-cache instance (for advanced usage)
   * @returns {NodeCache} The node-cache instance
   */
  getNodeCache() {
    return this.cache;
  }
}

module.exports = NodeCacheProvider;
