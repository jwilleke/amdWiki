const BaseCacheProvider = require('./BaseCacheProvider');

/**
 * NullCacheProvider - No-op cache provider
 *
 * Used when caching is disabled or for testing.
 * All cache operations are no-ops that return immediately.
 */
class NullCacheProvider extends BaseCacheProvider {
  constructor(engine) {
    super(engine);
  }

  /**
   * Initialize the null cache provider (no-op)
   * @returns {Promise<void>}
   */
  async initialize() {
    this.initialized = true;
  }

  /**
   * Get provider information
   * @returns {Object} Provider metadata
   */
  getProviderInfo() {
    return {
      name: 'NullCacheProvider',
      version: '1.0.0',
      description: 'No-op cache provider (caching disabled)',
      features: []
    };
  }

  /**
   * Get a value from the cache (always returns undefined)
   * @param {string} key - The cache key
   * @returns {Promise<undefined>} Always undefined
   */
  async get(key) {
    return undefined;
  }

  /**
   * Set a value in the cache (no-op)
   * @param {string} key - The cache key
   * @param {any} value - The value to cache
   * @param {number} [ttlSec] - Time to live in seconds
   * @returns {Promise<void>}
   */
  async set(key, value, ttlSec) {
    // No-op
  }

  /**
   * Delete one or more keys from the cache (no-op)
   * @param {string|string[]} keys - Single key or array of keys to delete
   * @returns {Promise<void>}
   */
  async del(keys) {
    // No-op
  }

  /**
   * Clear cache entries (no-op)
   * @param {string} [pattern] - Optional pattern to match keys
   * @returns {Promise<void>}
   */
  async clear(pattern) {
    // No-op
  }

  /**
   * Get keys matching a pattern (always returns empty array)
   * @param {string} [pattern='*'] - Pattern to match
   * @returns {Promise<string[]>} Empty array
   */
  async keys(pattern = '*') {
    return [];
  }

  /**
   * Get cache statistics (all zeros)
   * @returns {Promise<CacheStats>} Cache statistics with all zeros
   */
  async stats() {
    return {
      hits: 0,
      misses: 0,
      keys: 0,
      ksize: 0,
      vsize: 0,
      sets: 0,
      deletes: 0,
      hitRate: 0
    };
  }

  /**
   * Check if the cache provider is healthy (always true)
   * @returns {Promise<boolean>} Always true
   */
  async isHealthy() {
    return true;
  }

  /**
   * Close/cleanup the cache provider (no-op)
   * @returns {Promise<void>}
   */
  async close() {
    this.initialized = false;
  }
}

module.exports = NullCacheProvider;
