/**
 * Cache Adapter Interface
 * 
 * Defines the contract that all cache adapters must implement.
 * This allows switching between different cache backends (node-cache, Redis, etc.)
 * without changing application code.
 */

/**
 * Cache statistics structure
 * @typedef {Object} CacheStats
 * @property {number} hits - Number of cache hits
 * @property {number} misses - Number of cache misses
 * @property {number} keys - Number of keys in cache
 * @property {number} ksize - Approximate memory usage of keys
 * @property {number} vsize - Approximate memory usage of values
 */

/**
 * Cache adapter interface
 * All cache adapters must implement these methods
 */
class ICacheAdapter {
  /**
   * Get a value from the cache
   * @param {string} key - The cache key
   * @returns {Promise<any|undefined>} The cached value or undefined if not found
   */
  async get(key) {
    throw new Error('ICacheAdapter.get() must be implemented');
  }

  /**
   * Set a value in the cache
   * @param {string} key - The cache key
   * @param {any} value - The value to cache
   * @param {number} [ttlSec] - Time to live in seconds
   * @returns {Promise<void>}
   */
  async set(key, value, ttlSec) {
    throw new Error('ICacheAdapter.set() must be implemented');
  }

  /**
   * Delete one or more keys from the cache
   * @param {string|string[]} keys - Single key or array of keys to delete
   * @returns {Promise<void>}
   */
  async del(keys) {
    throw new Error('ICacheAdapter.del() must be implemented');
  }

  /**
   * Clear cache entries
   * @param {string} [pattern] - Optional pattern to match keys (e.g., 'user:*')
   * @returns {Promise<void>}
   */
  async clear(pattern) {
    throw new Error('ICacheAdapter.clear() must be implemented');
  }

  /**
   * Get keys matching a pattern
   * @param {string} pattern - Pattern to match (e.g., 'user:*' or '*' for all)
   * @returns {Promise<string[]>} Array of matching keys
   */
  async keys(pattern = '*') {
    throw new Error('ICacheAdapter.keys() must be implemented');
  }

  /**
   * Get cache statistics
   * @returns {Promise<CacheStats>} Cache statistics
   */
  async stats() {
    throw new Error('ICacheAdapter.stats() must be implemented');
  }

  /**
   * Check if the cache adapter is healthy/connected
   * @returns {Promise<boolean>} True if healthy
   */
  async isHealthy() {
    throw new Error('ICacheAdapter.isHealthy() must be implemented');
  }

  /**
   * Close/cleanup the cache adapter
   * @returns {Promise<void>}
   */
  async close() {
    throw new Error('ICacheAdapter.close() must be implemented');
  }
}

module.exports = ICacheAdapter;
