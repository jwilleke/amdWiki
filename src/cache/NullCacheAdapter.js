const ICacheAdapter = require('./ICacheAdapter');

/**
 * Null cache adapter - no-op implementation
 * Used when caching is disabled or for testing
 */
class NullCacheAdapter extends ICacheAdapter {
  constructor() {
    super();
  }

  async get(key) {
    return undefined;
  }

  async set(key, value, ttlSec) {
    // No-op
  }

  async del(keys) {
    // No-op
  }

  async clear(pattern) {
    // No-op
  }

  async keys(pattern = '*') {
    return [];
  }

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

  async isHealthy() {
    return true;
  }

  async close() {
    // No-op
  }
}

module.exports = NullCacheAdapter;
