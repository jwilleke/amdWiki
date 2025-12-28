/**
 * Cache Adapter Interface
 *
 * Defines the contract that all cache adapters must implement.
 * This allows switching between different cache backends (node-cache, Redis, etc.)
 * without changing application code.
 */

/**
 * Cache statistics structure
 */
export interface CacheStats {
  /** Number of cache hits */
  hits: number;
  /** Number of cache misses */
  misses: number;
  /** Number of keys in cache */
  keys: number;
  /** Approximate memory usage of keys in bytes */
  ksize: number;
  /** Approximate memory usage of values in bytes */
  vsize: number;
}

/**
 * Cache adapter interface
 * All cache adapters must implement these methods
 *
 * @abstract
 */
abstract class ICacheAdapter {
  /**
   * Get a value from the cache
   *
   * @param {string} key - The cache key
   * @returns {Promise<T|undefined>} The cached value or undefined if not found
   */
  abstract get<T = unknown>(key: string): Promise<T | undefined>;

  /**
   * Set a value in the cache
   *
   * @param {string} key - The cache key
   * @param {unknown} value - The value to cache
   * @param {number} [ttlSec] - Time to live in seconds
   * @returns {Promise<void>}
   */
  abstract set(key: string, value: unknown, ttlSec?: number): Promise<void>;

  /**
   * Delete one or more keys from the cache
   *
   * @param {string|string[]} keys - Single key or array of keys to delete
   * @returns {Promise<void>}
   */
  abstract del(keys: string | string[]): Promise<void>;

  /**
   * Clear cache entries
   *
   * @param {string} [pattern] - Optional pattern to match keys (e.g., 'user:*')
   * @returns {Promise<void>}
   */
  abstract clear(pattern?: string): Promise<void>;

  /**
   * Get keys matching a pattern
   *
   * @param {string} pattern - Pattern to match (e.g., 'user:*' or '*' for all)
   * @returns {Promise<string[]>} Array of matching keys
   */
  abstract keys(pattern?: string): Promise<string[]>;

  /**
   * Get cache statistics
   *
   * @returns {Promise<CacheStats>} Cache statistics
   */
  abstract stats(): Promise<CacheStats>;

  /**
   * Check if the cache adapter is healthy/connected
   *
   * @returns {Promise<boolean>} True if healthy
   */
  abstract isHealthy(): Promise<boolean>;

  /**
   * Close/cleanup the cache adapter
   *
   * @returns {Promise<void>}
   */
  abstract close(): Promise<void>;
}

export default ICacheAdapter;

// CommonJS compatibility
module.exports = ICacheAdapter;
