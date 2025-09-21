const NodeCache = require('node-cache');
const ICacheAdapter = require('./ICacheAdapter');

/**
 * Node-cache based cache adapter
 * Provides in-memory caching with TTL support using the node-cache library
 */
class NodeCacheAdapter extends ICacheAdapter {
  constructor(options = {}) {
    super();
    
    // Default configuration
    const config = {
      stdTTL: options.stdTTL || 300,           // Default 5 minutes TTL
      checkperiod: options.checkperiod || 120, // Check for expired keys every 2 minutes
      useClones: options.useClones !== false,  // Clone objects by default
      deleteOnExpire: true,                    // Delete expired keys
      maxKeys: options.maxKeys || 1000,        // Maximum number of keys
      ...options
    };

    this.cache = new NodeCache(config);
    this.config = config;
    
    // Track statistics manually since node-cache stats can be reset
    this.statistics = {
      hits: 0,
      misses: 0,
      sets: 0,
      deletes: 0
    };

    // Listen to cache events for statistics
    this.cache.on('hit', (key, value) => {
      this.statistics.hits++;
    });

    this.cache.on('miss', (key) => {
      this.statistics.misses++;
    });

    this.cache.on('set', (key, value) => {
      this.statistics.sets++;
    });

    this.cache.on('del', (key, value) => {
      this.statistics.deletes++;
    });
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
      console.error('NodeCacheAdapter.get error:', error);
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
      console.error('NodeCacheAdapter.set error:', error);
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
      console.error('NodeCacheAdapter.del error:', error);
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
      console.error('NodeCacheAdapter.clear error:', error);
      throw error;
    }
  }

  /**
   * Get keys matching a pattern
   * @param {string} pattern - Pattern to match (e.g., 'user:*' or '*' for all)
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
      console.error('NodeCacheAdapter.keys error:', error);
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
      console.error('NodeCacheAdapter.stats error:', error);
      return {
        hits: 0,
        misses: 0,
        keys: 0,
        ksize: 0,
        vsize: 0,
        sets: 0,
        deletes: 0,
        hitRate: 0,
        maxKeys: this.config.maxKeys,
        stdTTL: this.config.stdTTL
      };
    }
  }

  /**
   * Check if the cache adapter is healthy/connected
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
      console.error('NodeCacheAdapter health check failed:', error);
      return false;
    }
  }

  /**
   * Close/cleanup the cache adapter
   * @returns {Promise<void>}
   */
  async close() {
    try {
      if (this.cache) {
        this.cache.close();
        this.cache = null;
      }
    } catch (error) {
      console.error('NodeCacheAdapter.close error:', error);
    }
  }

  /**
   * Get the underlying node-cache instance (for advanced usage)
   * @returns {NodeCache} The node-cache instance
   */
  getNodeCache() {
    return this.cache;
  }
}

module.exports = NodeCacheAdapter;
