import BaseManager from './BaseManager';
import RegionCache from '../cache/RegionCache';
import logger from '../utils/logger';
import NullCacheProvider from '../providers/NullCacheProvider';

/**
 * Cache options for set operations
 */
export interface CacheOptions {
  ttl?: number;
}

/**
 * Cache configuration
 */
export interface CacheConfig {
  provider: string | null;
  defaultTTL: number;
  maxKeys: number;
  checkPeriod: number;
}

/**
 * Cache statistics
 */
export interface CacheStats {
  global?: unknown;
  regions?: string[];
  provider?: string | null;
  config?: CacheConfig;
  [key: string]: unknown;
}

/**
 * Base cache provider interface
 */
interface BaseCacheProvider {
  initialize(): Promise<void>;
  get(key: string): Promise<unknown>;
  set(key: string, value: unknown, ttl?: number): Promise<void>;
  del(keys: string | string[]): Promise<void>;
  clear(pattern?: string): Promise<void>;
  keys(pattern?: string): Promise<string[]>;
  stats(): Promise<unknown>;
  isHealthy(): Promise<boolean>;
  close(): Promise<void>;
  getProviderInfo(): { features?: string[] };
}

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
  private provider: BaseCacheProvider | null;
  private providerClass: string | null;
  private regions: Map<string, RegionCache>;
  private defaultTTL!: number;
  private maxKeys!: number;
  private checkPeriod!: number;

  /**
   * Creates a new CacheManager instance
   *
   * @constructor
   * @param {any} engine - The wiki engine instance
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  constructor(engine: any) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    super(engine);
    this.provider = null;
    this.providerClass = null;
    this.regions = new Map();
  }

  /**
   * Initialize the CacheManager and load the configured provider
   *
   * @async
   * @param {Record<string, unknown>} [config={}] - Configuration object (unused, reads from ConfigurationManager)
   * @returns {Promise<void>}
   * @throws {Error} If ConfigurationManager is not available
   */
  async initialize(config: Record<string, unknown> = {}): Promise<void> {
    await super.initialize(config);

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const configManager = this.engine.getManager('ConfigurationManager');
    if (!configManager) {
      throw new Error('CacheManager requires ConfigurationManager');
    }

    // Check if cache is enabled (ALL LOWERCASE)
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    const cacheEnabled = configManager.getProperty('amdwiki.cache.enabled', true) as boolean;
    if (!cacheEnabled) {
      logger.info('🗄️  CacheManager: Caching disabled by configuration');
      // Load NullCacheProvider when disabled
      this.providerClass = 'NullCacheProvider';
      await this.loadProvider();
      return;
    }

    // Load provider with fallback (ALL LOWERCASE)
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    const defaultProvider = configManager.getProperty(
      'amdwiki.cache.provider.default',
      'nodecacheprovider'
    ) as string;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    const providerName = configManager.getProperty(
      'amdwiki.cache.provider',
      defaultProvider
    ) as string;

    // Normalize provider name to PascalCase for class loading
    // nodecacheprovider -> NodeCacheProvider
    this.providerClass = this.normalizeProviderName(providerName);

    // Load shared cache settings (ALL LOWERCASE)
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    this.defaultTTL = configManager.getProperty('amdwiki.cache.defaultttl', 300) as number;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    this.maxKeys = configManager.getProperty('amdwiki.cache.maxkeys', 1000) as number;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    this.checkPeriod = configManager.getProperty('amdwiki.cache.checkperiod', 120) as number;

    logger.info(`🗄️  Loading cache provider: ${providerName} (${this.providerClass})`);

    // Load and initialize provider
    await this.loadProvider();

    logger.info(`🗄️  CacheManager initialized with ${this.providerClass}`);
    logger.info(`🗄️  Cache settings - TTL: ${this.defaultTTL}s, MaxKeys: ${this.maxKeys}`);

    if (this.provider) {
      const providerInfo = this.provider.getProviderInfo();
      if (providerInfo.features && providerInfo.features.length > 0) {
        logger.info(`🗄️  Provider features: ${providerInfo.features.join(', ')}`);
      }
    }
  }

  /**
   * Load the cache provider dynamically
   * @private
   * @returns {Promise<void>}
   */
  private async loadProvider(): Promise<void> {
    try {
      // Try to load provider class
      // eslint-disable-next-line @typescript-eslint/no-require-imports, @typescript-eslint/no-unsafe-assignment
      const ProviderClass = require(`../providers/${this.providerClass}`);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call
      this.provider = new ProviderClass(this.engine) as BaseCacheProvider;
      await this.provider.initialize();

      // Test provider health
      const isHealthy = await this.provider.isHealthy();
      if (!isHealthy) {
        logger.warn(`Cache provider ${this.providerClass} health check failed, switching to NullCacheProvider`);
        this.provider = new NullCacheProvider(this.engine);
        await this.provider.initialize();
      }
    } catch (error) {
      logger.error(`Failed to load cache provider: ${this.providerClass}`, error);
      // Fall back to NullCacheProvider on any error
      logger.warn('Falling back to NullCacheProvider due to provider load error');
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
  private normalizeProviderName(providerName: string): string {
    if (!providerName) {
      throw new Error('Provider name cannot be empty');
    }

    // Convert to lowercase first to ensure consistency
    const lower = providerName.toLowerCase();

    // Handle special cases for known provider names
    const knownProviders: Record<string, string> = {
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
  region(region: string): RegionCache {
    if (!this.regions.has(region)) {
      this.regions.set(region, new RegionCache(this.provider, region));
    }
    return this.regions.get(region);
  }

  /**
   * Get a value from the cache (global scope)
   * @param {string} key - The cache key
   * @returns {Promise<unknown>} The cached value or undefined if not found
   */
  async get(key: string): Promise<unknown> {
    return await this.provider.get(key);
  }

  /**
   * Set a value in the cache (global scope)
   * @param {string} key - The cache key
   * @param {unknown} value - The value to cache
   * @param {CacheOptions} [options] - Cache options
   * @param {number} [options.ttl] - Time to live in seconds
   * @returns {Promise<void>}
   */
  async set(key: string, value: unknown, options: CacheOptions = {}): Promise<void> {
    const ttl = options.ttl || this.defaultTTL;
    return await this.provider.set(key, value, ttl);
  }

  /**
   * Delete one or more keys from the cache
   * @param {string|string[]} keys - Single key or array of keys to delete
   * @returns {Promise<void>}
   */
  async del(keys: string | string[]): Promise<void> {
    return await this.provider.del(keys);
  }

  /**
   * Clear cache entries
   * @param {string} [region] - Optional region to clear (if not specified, clears all)
   * @param {string} [pattern] - Optional pattern to match keys
   * @returns {Promise<void>}
   */
  async clear(region?: string, pattern?: string): Promise<void> {
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
  async keys(pattern: string = '*'): Promise<string[]> {
    return await this.provider.keys(pattern);
  }

  /**
   * Get cache statistics
   * @param {string} [region] - Optional region to get stats for
   * @returns {Promise<CacheStats>} Cache statistics
   */
  async stats(region?: string): Promise<CacheStats> {
    if (region) {
      const regionCache = this.region(region);
      return await regionCache.stats() as CacheStats;
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
  async isHealthy(): Promise<boolean> {
    return await this.provider.isHealthy();
  }

  /**
   * Get cache configuration
   * @returns {CacheConfig} Cache configuration
   */
  getConfig(): CacheConfig {
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
  getRegions(): string[] {
    return Array.from(this.regions.keys());
  }

  /**
   * Flush all caches (dangerous operation)
   * @returns {Promise<void>}
   */
  async flushAll(): Promise<void> {
    logger.warn('CacheManager.flushAll() - clearing ALL cache data');
    await this.provider.clear('*');
    this.regions.clear();
  }

  /**
   * Close and cleanup cache resources
   * @returns {Promise<void>}
   */
  async shutdown(): Promise<void> {
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
   * @param {any} engine - WikiEngine instance
   * @param {string} [region] - Region name (defaults to calling class name)
   * @returns {RegionCache} Cache instance scoped to the region
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  static getCacheForManager(engine: any, region?: string): RegionCache {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    const cacheManager = engine.getManager('CacheManager');
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    if (!cacheManager || !cacheManager.isInitialized()) {
      // Return a null cache if CacheManager not available
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      const nullProvider = new NullCacheProvider(engine);
      return new RegionCache(nullProvider, region || 'default');
    }
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-return
    return cacheManager.region(region || 'default');
  }
}

export default CacheManager;
