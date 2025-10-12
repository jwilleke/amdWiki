/**
 * BaseCacheProvider - Base class for all cache providers
 *
 * Provides the interface that all cache providers must implement.
 * Follows the provider pattern established in AttachmentManager and PageManager.
 *
 * Cache providers implement different storage backends (node-cache, Redis, etc.)
 */

/**
 * Cache statistics structure
 * @typedef {Object} CacheStats
 * @property {number} hits - Number of cache hits
 * @property {number} misses - Number of cache misses
 * @property {number} keys - Number of keys in cache
 * @property {number} ksize - Approximate memory usage of keys
 * @property {number} vsize - Approximate memory usage of values
 * @property {number} sets - Number of set operations
 * @property {number} deletes - Number of delete operations
 * @property {number} hitRate - Cache hit rate percentage
 */

class BaseCacheProvider {
  constructor(engine) {
    this.engine = engine;
    this.initialized = false;
  }

  /**
   * Initialize the cache provider
   * Implementations should load configuration from ConfigurationManager
   * @returns {Promise<void>}
   */
  async initialize() {
    throw new Error('BaseCacheProvider.initialize() must be implemented by subclass');
  }

  /**
   * Get provider information
   * @returns {Object} Provider metadata
   */
  getProviderInfo() {
    return {
      name: 'BaseCacheProvider',
      version: '1.0.0',
      description: 'Base cache provider interface',
      features: []
    };
  }

  /**
   * Get a value from the cache
   * @param {string} key - The cache key
   * @returns {Promise<any|undefined>} The cached value or undefined if not found
   */
  async get(key) {
    throw new Error('BaseCacheProvider.get() must be implemented by subclass');
  }

  /**
   * Set a value in the cache
   * @param {string} key - The cache key
   * @param {any} value - The value to cache
   * @param {number} [ttlSec] - Time to live in seconds
   * @returns {Promise<void>}
   */
  async set(key, value, ttlSec) {
    throw new Error('BaseCacheProvider.set() must be implemented by subclass');
  }

  /**
   * Delete one or more keys from the cache
   * @param {string|string[]} keys - Single key or array of keys to delete
   * @returns {Promise<void>}
   */
  async del(keys) {
    throw new Error('BaseCacheProvider.del() must be implemented by subclass');
  }

  /**
   * Clear cache entries
   * @param {string} [pattern] - Optional pattern to match keys (e.g., 'user:*')
   * @returns {Promise<void>}
   */
  async clear(pattern) {
    throw new Error('BaseCacheProvider.clear() must be implemented by subclass');
  }

  /**
   * Get keys matching a pattern
   * @param {string} [pattern='*'] - Pattern to match (e.g., 'user:*' or '*' for all)
   * @returns {Promise<string[]>} Array of matching keys
   */
  async keys(pattern = '*') {
    throw new Error('BaseCacheProvider.keys() must be implemented by subclass');
  }

  /**
   * Get cache statistics
   * @returns {Promise<CacheStats>} Cache statistics
   */
  async stats() {
    throw new Error('BaseCacheProvider.stats() must be implemented by subclass');
  }

  /**
   * Check if the cache provider is healthy/connected
   * @returns {Promise<boolean>} True if healthy
   */
  async isHealthy() {
    throw new Error('BaseCacheProvider.isHealthy() must be implemented by subclass');
  }

  /**
   * Close/cleanup the cache provider
   * @returns {Promise<void>}
   */
  async close() {
    throw new Error('BaseCacheProvider.close() must be implemented by subclass');
  }

  /**
   * Backup cache configuration and state (optional)
   * @returns {Promise<Object>} Backup data
   */
  async backup() {
    return {
      provider: this.constructor.name,
      initialized: this.initialized,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Restore cache from backup (optional)
   * @param {Object} backupData - Backup data
   * @returns {Promise<void>}
   */
  async restore(backupData) {
    // Default implementation does nothing
    // Subclasses can override if they support restore
  }
}

module.exports = BaseCacheProvider;
