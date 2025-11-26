import BaseCacheProvider, { CacheStats, ProviderInfo } from './BaseCacheProvider';
import logger from '../utils/logger';

/**
 * WikiEngine interface (simplified)
 * TODO: Create full WikiEngine type definition in Phase 4
 */
interface WikiEngine {
  getManager(name: string): any;
}

/**
 * NullCacheProvider - No-op cache provider
 *
 * Used when caching is disabled or for testing.
 * All cache operations are no-ops that return immediately.
 */
class NullCacheProvider extends BaseCacheProvider {
  constructor(engine: WikiEngine) {
    super(engine);
  }

  /**
   * Initialize the null cache provider (no-op)
   * @returns {Promise<void>}
   */
  async initialize(): Promise<void> {
    this.initialized = true;
  }

  /**
   * Get provider information
   * @returns {ProviderInfo} Provider metadata
   */
  getProviderInfo(): ProviderInfo {
    return {
      name: 'NullCacheProvider',
      version: '1.0.0',
      description: 'No-op cache provider (caching disabled)',
      features: []
    };
  }

  /**
   * Get a value from the cache (always returns undefined)
   * @template T
   * @param {string} key - The cache key
   * @returns {Promise<T | undefined>} Always undefined
   */
  async get<T = any>(key: string): Promise<T | undefined> {
    return undefined;
  }

  /**
   * Set a value in the cache (no-op)
   * @template T
   * @param {string} key - The cache key
   * @param {T} value - The value to cache
   * @param {number} [ttlSec] - Time to live in seconds
   * @returns {Promise<void>}
   */
  async set<T = any>(key: string, value: T, ttlSec?: number): Promise<void> {
    // No-op
  }

  /**
   * Delete one or more keys from the cache (no-op)
   * @param {string | string[]} keys - Single key or array of keys to delete
   * @returns {Promise<void>}
   */
  async del(keys: string | string[]): Promise<void> {
    // No-op
  }

  /**
   * Clear cache entries (no-op)
   * @param {string} [pattern] - Optional pattern to match keys
   * @returns {Promise<void>}
   */
  async clear(pattern?: string): Promise<void> {
    // No-op
  }

  /**
   * Get keys matching a pattern (always returns empty array)
   * @param {string} [pattern='*'] - Pattern to match
   * @returns {Promise<string[]>} Empty array
   */
  async keys(pattern: string = '*'): Promise<string[]> {
    return [];
  }

  /**
   * Get cache statistics (all zeros)
   * @returns {Promise<CacheStats>} Cache statistics with all zeros
   */
  async stats(): Promise<CacheStats> {
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
  async isHealthy(): Promise<boolean> {
    return true;
  }

  /**
   * Close/cleanup the cache provider (no-op)
   * @returns {Promise<void>}
   */
  async close(): Promise<void> {
    this.initialized = false;
  }
}

export default NullCacheProvider;
