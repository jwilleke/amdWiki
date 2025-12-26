/* eslint-disable no-console */

import NodeCache from 'node-cache';
import ICacheAdapter, { type CacheStats } from './ICacheAdapter';

/**
 * NodeCacheAdapter configuration options
 */
export interface NodeCacheAdapterOptions {
  /** Standard TTL in seconds (default: 300) */
  stdTTL?: number;
  /** Check period for expired keys in seconds (default: 120) */
  checkperiod?: number;
  /** Whether to clone objects (default: true) */
  useClones?: boolean;
  /** Delete keys on expiration (default: true) */
  deleteOnExpire?: boolean;
  /** Maximum number of keys (default: 1000) */
  maxKeys?: number;
  /** Additional node-cache options */
  [key: string]: unknown;
}

/**
 * Internal statistics tracking
 */
interface Statistics {
  hits: number;
  misses: number;
  sets: number;
  deletes: number;
}

/**
 * Extended cache statistics with additional metrics
 */
export interface ExtendedCacheStats extends CacheStats {
  /** Number of set operations */
  sets: number;
  /** Number of delete operations */
  deletes: number;
  /** Hit rate percentage */
  hitRate: number;
  /** Maximum number of keys allowed */
  maxKeys: number;
  /** Standard TTL in seconds */
  stdTTL: number;
}

/**
 * Node-cache based cache adapter
 * Provides in-memory caching with TTL support using the node-cache library
 */
class NodeCacheAdapter extends ICacheAdapter {
  private cache: NodeCache | null;
  private readonly config: NodeCacheAdapterOptions;
  private readonly statistics: Statistics;

  constructor(options: NodeCacheAdapterOptions = {}) {
    super();

    // Default configuration
    this.config = {
      stdTTL: options.stdTTL || 300, // Default 5 minutes TTL
      checkperiod: options.checkperiod || 120, // Check for expired keys every 2 minutes
      useClones: options.useClones !== false, // Clone objects by default
      deleteOnExpire: true, // Delete expired keys
      maxKeys: options.maxKeys || 1000, // Maximum number of keys
      ...options
    };

    this.cache = new NodeCache(this.config);

    // Track statistics manually since node-cache stats can be reset
    this.statistics = {
      hits: 0,
      misses: 0,
      sets: 0,
      deletes: 0
    };

    // Listen to cache events for statistics
    this.cache.on('set', () => {
      this.statistics.sets++;
    });

    this.cache.on('del', () => {
      this.statistics.deletes++;
    });
  }

  /**
   * Get a value from the cache
   *
   * @param {string} key - The cache key
   * @returns {Promise<T|undefined>} The cached value or undefined if not found
   */
  get<T = unknown>(key: string): Promise<T | undefined> {
    try {
      if (!this.cache) {
        return Promise.resolve(undefined);
      }

      const value = this.cache.get<T>(key);

      if (value !== undefined) {
        this.statistics.hits++;
      } else {
        this.statistics.misses++;
      }

      return Promise.resolve(value);
    } catch (error) {
      console.error('NodeCacheAdapter.get error:', error);
      return Promise.resolve(undefined);
    }
  }

  /**
   * Set a value in the cache
   *
   * @param {string} key - The cache key
   * @param {unknown} value - The value to cache
   * @param {number} [ttlSec] - Time to live in seconds
   * @returns {Promise<void>}
   */
  set(key: string, value: unknown, ttlSec?: number): Promise<void> {
    try {
      if (!this.cache) {
        return Promise.reject(new Error('Cache is not initialized'));
      }

      if (ttlSec !== undefined) {
        this.cache.set(key, value, ttlSec);
      } else {
        this.cache.set(key, value);
      }
      return Promise.resolve();
    } catch (error) {
      console.error('NodeCacheAdapter.set error:', error);
      return Promise.reject(error instanceof Error ? error : new Error(String(error)));
    }
  }

  /**
   * Delete one or more keys from the cache
   *
   * @param {string|string[]} keys - Single key or array of keys to delete
   * @returns {Promise<void>}
   */
  del(keys: string | string[]): Promise<void> {
    try {
      if (!this.cache) {
        return Promise.resolve();
      }

      if (Array.isArray(keys)) {
        this.cache.del(keys);
      } else {
        this.cache.del(keys);
      }
      return Promise.resolve();
    } catch (error) {
      console.error('NodeCacheAdapter.del error:', error);
      return Promise.reject(error instanceof Error ? error : new Error(String(error)));
    }
  }

  /**
   * Clear cache entries
   *
   * @param {string} [pattern] - Optional pattern to match keys (e.g., 'user:*')
   * @returns {Promise<void>}
   */
  async clear(pattern?: string): Promise<void> {
    try {
      if (!this.cache) {
        return;
      }

      if (!pattern || pattern === '*') {
        // Clear all keys
        this.cache.flushAll();
      } else {
        // Clear keys matching pattern
        const matchingKeys = await this.keys(pattern);
        if (matchingKeys.length > 0) {
          this.cache.del(matchingKeys);
        }
      }
    } catch (error) {
      console.error('NodeCacheAdapter.clear error:', error);
      throw error;
    }
  }

  /**
   * Get keys matching a pattern
   *
   * @param {string} pattern - Pattern to match (e.g., 'user:*' or '*' for all)
   * @returns {Promise<string[]>} Array of matching keys
   */
  keys(pattern: string = '*'): Promise<string[]> {
    try {
      if (!this.cache) {
        const emptyArray: string[] = [];
        return Promise.resolve(emptyArray);
      }

      const allKeys: string[] = this.cache.keys();

      if (pattern === '*') {
        return Promise.resolve(allKeys);
      }

      // Simple pattern matching - convert glob-style pattern to regex
      const regexPattern = pattern.replace(/\*/g, '.*').replace(/\?/g, '.');
      const regex = new RegExp(`^${regexPattern}$`);

      const filtered: string[] = allKeys.filter((key) => regex.test(key));
      return Promise.resolve(filtered);
    } catch (error) {
      console.error('NodeCacheAdapter.keys error:', error);
      const emptyArray: string[] = [];
      return Promise.resolve(emptyArray);
    }
  }

  /**
   * Get cache statistics
   *
   * @returns {Promise<ExtendedCacheStats>} Cache statistics
   */
  stats(): Promise<ExtendedCacheStats> {
    try {
      if (!this.cache) {
        return Promise.resolve({
          hits: 0,
          misses: 0,
          keys: 0,
          ksize: 0,
          vsize: 0,
          sets: 0,
          deletes: 0,
          hitRate: 0,
          maxKeys: this.config.maxKeys || 1000,
          stdTTL: this.config.stdTTL || 300
        });
      }

      const nodeStats = this.cache.getStats();

      return Promise.resolve({
        hits: this.statistics.hits,
        misses: this.statistics.misses,
        keys: nodeStats.keys,
        ksize: nodeStats.ksize,
        vsize: nodeStats.vsize,
        sets: this.statistics.sets,
        deletes: this.statistics.deletes,
        hitRate:
          this.statistics.hits + this.statistics.misses > 0
            ? (this.statistics.hits / (this.statistics.hits + this.statistics.misses)) * 100
            : 0,
        maxKeys: this.config.maxKeys || 1000,
        stdTTL: this.config.stdTTL || 300
      });
    } catch (error) {
      console.error('NodeCacheAdapter.stats error:', error);
      return Promise.resolve({
        hits: 0,
        misses: 0,
        keys: 0,
        ksize: 0,
        vsize: 0,
        sets: 0,
        deletes: 0,
        hitRate: 0,
        maxKeys: this.config.maxKeys || 1000,
        stdTTL: this.config.stdTTL || 300
      });
    }
  }

  /**
   * Check if the cache adapter is healthy/connected
   *
   * @returns {Promise<boolean>} True if healthy
   */
  async isHealthy(): Promise<boolean> {
    try {
      // Test basic functionality
      const testKey = '__health_check__';
      await this.set(testKey, 'test', 1);
      const value = await this.get<string>(testKey);
      await this.del(testKey);
      return value === 'test';
    } catch (error) {
      console.error('NodeCacheAdapter health check failed:', error);
      return false;
    }
  }

  /**
   * Close/cleanup the cache adapter
   *
   * @returns {Promise<void>}
   */
  close(): Promise<void> {
    try {
      if (this.cache) {
        this.cache.close();
        this.cache = null;
      }
      return Promise.resolve();
    } catch (error) {
      console.error('NodeCacheAdapter.close error:', error);
      return Promise.reject(error instanceof Error ? error : new Error(String(error)));
    }
  }

  /**
   * Get the underlying node-cache instance (for advanced usage)
   *
   * @returns {NodeCache|null} The node-cache instance
   */
  getNodeCache(): NodeCache | null {
    return this.cache;
  }
}

export default NodeCacheAdapter;
