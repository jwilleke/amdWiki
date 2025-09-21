/**
 * RegionCache - Cache wrapper that provides namespaced access to a cache adapter
 * 
 * This class wraps a cache adapter and automatically prefixes all keys with a region name,
 * providing isolation between different cache users (managers, components, etc.)
 */
class RegionCache {
  constructor(adapter, region) {
    this.adapter = adapter;
    this.region = region;
    this.prefix = `${region}:`;
  }

  /**
   * Create a full key by prefixing with the region
   * @param {string} key - The cache key
   * @returns {string} The prefixed key
   */
  _getFullKey(key) {
    return `${this.prefix}${key}`;
  }

  /**
   * Remove region prefix from a key
   * @param {string} fullKey - The prefixed key
   * @returns {string} The key without region prefix
   */
  _stripPrefix(fullKey) {
    if (fullKey.startsWith(this.prefix)) {
      return fullKey.substring(this.prefix.length);
    }
    return fullKey;
  }

  /**
   * Get a value from the cache
   * @param {string} key - The cache key
   * @returns {Promise<any|undefined>} The cached value or undefined if not found
   */
  async get(key) {
    return await this.adapter.get(this._getFullKey(key));
  }

  /**
   * Set a value in the cache
   * @param {string} key - The cache key
   * @param {any} value - The value to cache
   * @param {Object} [options] - Cache options
   * @param {number} [options.ttl] - Time to live in seconds
   * @returns {Promise<void>}
   */
  async set(key, value, options = {}) {
    const ttl = options.ttl;
    return await this.adapter.set(this._getFullKey(key), value, ttl);
  }

  /**
   * Delete one or more keys from the cache
   * @param {string|string[]} keys - Single key or array of keys to delete
   * @returns {Promise<void>}
   */
  async del(keys) {
    if (Array.isArray(keys)) {
      const fullKeys = keys.map(key => this._getFullKey(key));
      return await this.adapter.del(fullKeys);
    } else {
      return await this.adapter.del(this._getFullKey(keys));
    }
  }

  /**
   * Clear all cache entries for this region
   * @param {string} [pattern] - Optional pattern to match keys within the region
   * @returns {Promise<void>}
   */
  async clear(pattern) {
    if (pattern) {
      // Clear keys matching pattern within this region
      const regionPattern = `${this.prefix}${pattern}`;
      return await this.adapter.clear(regionPattern);
    } else {
      // Clear all keys in this region
      const regionPattern = `${this.prefix}*`;
      return await this.adapter.clear(regionPattern);
    }
  }

  /**
   * Get keys matching a pattern within this region
   * @param {string} [pattern='*'] - Pattern to match
   * @returns {Promise<string[]>} Array of matching keys (without region prefix)
   */
  async keys(pattern = '*') {
    const regionPattern = `${this.prefix}${pattern}`;
    const fullKeys = await this.adapter.keys(regionPattern);
    return fullKeys.map(key => this._stripPrefix(key));
  }

  /**
   * Get cache statistics for this region
   * @returns {Promise<Object>} Cache statistics for this region
   */
  async stats() {
    // Get all keys in this region
    const regionKeys = await this.adapter.keys(`${this.prefix}*`);
    const globalStats = await this.adapter.stats();
    
    return {
      region: this.region,
      keys: regionKeys.length,
      globalStats: globalStats
    };
  }

  /**
   * Check if a key exists in this region
   * @param {string} key - The cache key
   * @returns {Promise<boolean>} True if key exists
   */
  async has(key) {
    const value = await this.get(key);
    return value !== undefined;
  }

  /**
   * Get or set a value (cache-aside pattern)
   * @param {string} key - The cache key
   * @param {Function} factory - Function to generate the value if not cached
   * @param {Object} [options] - Cache options
   * @param {number} [options.ttl] - Time to live in seconds
   * @returns {Promise<any>} The cached or generated value
   */
  async getOrSet(key, factory, options = {}) {
    let value = await this.get(key);
    
    if (value === undefined) {
      value = await factory();
      if (value !== undefined) {
        await this.set(key, value, options);
      }
    }
    
    return value;
  }

  /**
   * Get multiple keys at once
   * @param {string[]} keys - Array of cache keys
   * @returns {Promise<Object>} Object with keys as properties and cached values
   */
  async mget(keys) {
    const results = {};
    
    for (const key of keys) {
      results[key] = await this.get(key);
    }
    
    return results;
  }

  /**
   * Set multiple keys at once
   * @param {Object} keyValuePairs - Object with keys and values to set
   * @param {Object} [options] - Cache options
   * @returns {Promise<void>}
   */
  async mset(keyValuePairs, options = {}) {
    const promises = Object.entries(keyValuePairs).map(([key, value]) =>
      this.set(key, value, options)
    );
    
    await Promise.all(promises);
  }

  /**
   * Get the region name
   * @returns {string} The region name
   */
  getRegion() {
    return this.region;
  }

  /**
   * Get the underlying adapter
   * @returns {ICacheAdapter} The cache adapter
   */
  getAdapter() {
    return this.adapter;
  }
}

module.exports = RegionCache;
