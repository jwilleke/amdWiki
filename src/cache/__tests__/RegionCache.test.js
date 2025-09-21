const { describe, it, expect, beforeEach, afterEach } = require('@jest/globals');
const NodeCacheAdapter = require('../NodeCacheAdapter');
const RegionCache = require('../RegionCache');

describe('RegionCache', () => {
  let adapter;
  let regionCache;
  let anotherRegionCache;

  beforeEach(() => {
    adapter = new NodeCacheAdapter({
      stdTTL: 60,
      checkperiod: 10,
      maxKeys: 100
    });
    regionCache = new RegionCache(adapter, 'test-region');
    anotherRegionCache = new RegionCache(adapter, 'another-region');
  });

  afterEach(async () => {
    if (adapter) {
      await adapter.close();
    }
  });

  describe('region isolation', () => {
    it('should isolate keys between regions', async () => {
      await regionCache.set('key1', 'value1');
      await anotherRegionCache.set('key1', 'value2');

      const value1 = await regionCache.get('key1');
      const value2 = await anotherRegionCache.get('key1');

      expect(value1).toBe('value1');
      expect(value2).toBe('value2');
    });

    it('should prefix keys with region name', async () => {
      await regionCache.set('test-key', 'test-value');
      
      // Check that the key is prefixed in the underlying adapter
      const allKeys = await adapter.keys('*');
      expect(allKeys).toContain('test-region:test-key');
      expect(allKeys).not.toContain('test-key');
    });

    it('should return region-specific keys without prefix', async () => {
      await regionCache.set('key1', 'value1');
      await regionCache.set('key2', 'value2');
      await anotherRegionCache.set('key3', 'value3');

      const keys = await regionCache.keys();
      expect(keys).toEqual(expect.arrayContaining(['key1', 'key2']));
      expect(keys).not.toContain('key3');
      expect(keys).not.toContain('test-region:key1');
    });
  });

  describe('basic operations', () => {
    it('should set and get values', async () => {
      await regionCache.set('test-key', 'test-value');
      const value = await regionCache.get('test-key');
      expect(value).toBe('test-value');
    });

    it('should set values with TTL', async () => {
      await regionCache.set('ttl-key', 'ttl-value', { ttl: 1 });
      
      let value = await regionCache.get('ttl-key');
      expect(value).toBe('ttl-value');
      
      // Wait for expiration
      await new Promise(resolve => setTimeout(resolve, 1100));
      
      value = await regionCache.get('ttl-key');
      expect(value).toBeUndefined();
    });

    it('should delete keys', async () => {
      await regionCache.set('delete-key', 'delete-value');
      await regionCache.del('delete-key');
      
      const value = await regionCache.get('delete-key');
      expect(value).toBeUndefined();
    });

    it('should delete multiple keys', async () => {
      await regionCache.set('key1', 'value1');
      await regionCache.set('key2', 'value2');
      await regionCache.del(['key1', 'key2']);
      
      const value1 = await regionCache.get('key1');
      const value2 = await regionCache.get('key2');
      
      expect(value1).toBeUndefined();
      expect(value2).toBeUndefined();
    });
  });

  describe('region-specific clearing', () => {
    beforeEach(async () => {
      await regionCache.set('key1', 'value1');
      await regionCache.set('key2', 'value2');
      await anotherRegionCache.set('key3', 'value3');
      await anotherRegionCache.set('key4', 'value4');
    });

    it('should clear only region-specific keys', async () => {
      await regionCache.clear();
      
      // Check that this region's keys are gone
      const value1 = await regionCache.get('key1');
      const value2 = await regionCache.get('key2');
      expect(value1).toBeUndefined();
      expect(value2).toBeUndefined();
      
      // Check that other region's keys are still there
      const value3 = await anotherRegionCache.get('key3');
      const value4 = await anotherRegionCache.get('key4');
      expect(value3).toBe('value3');
      expect(value4).toBe('value4');
    });

    it('should clear keys matching pattern within region', async () => {
      await regionCache.set('user:123', 'user-data');
      await regionCache.set('session:abc', 'session-data');
      
      await regionCache.clear('user:*');
      
      const userData = await regionCache.get('user:123');
      const sessionData = await regionCache.get('session:abc');
      const key1Data = await regionCache.get('key1');
      
      expect(userData).toBeUndefined();
      expect(sessionData).toBe('session-data');
      expect(key1Data).toBe('value1');
    });
  });

  describe('pattern matching', () => {
    beforeEach(async () => {
      await regionCache.set('user:123', 'user-data-123');
      await regionCache.set('user:456', 'user-data-456');
      await regionCache.set('session:abc', 'session-data-abc');
      await anotherRegionCache.set('user:789', 'user-data-789');
    });

    it('should return keys matching pattern within region', async () => {
      const userKeys = await regionCache.keys('user:*');
      expect(userKeys).toEqual(expect.arrayContaining(['user:123', 'user:456']));
      expect(userKeys).not.toContain('user:789'); // From another region
      expect(userKeys).not.toContain('session:abc');
    });

    it('should return all keys in region', async () => {
      const allKeys = await regionCache.keys();
      expect(allKeys).toEqual(expect.arrayContaining(['user:123', 'user:456', 'session:abc']));
      expect(allKeys).not.toContain('user:789'); // From another region
    });
  });

  describe('utility methods', () => {
    it('should check if key exists', async () => {
      await regionCache.set('exists-key', 'exists-value');
      
      const exists = await regionCache.has('exists-key');
      const notExists = await regionCache.has('not-exists');
      
      expect(exists).toBe(true);
      expect(notExists).toBe(false);
    });

    it('should get or set value (cache-aside pattern)', async () => {
      let factoryCalled = false;
      const factory = async () => {
        factoryCalled = true;
        return 'generated-value';
      };

      // First call should call factory
      const value1 = await regionCache.getOrSet('cache-aside-key', factory);
      expect(value1).toBe('generated-value');
      expect(factoryCalled).toBe(true);

      // Second call should use cached value
      factoryCalled = false;
      const value2 = await regionCache.getOrSet('cache-aside-key', factory);
      expect(value2).toBe('generated-value');
      expect(factoryCalled).toBe(false);
    });

    it('should handle multiple get operations', async () => {
      await regionCache.set('mget1', 'value1');
      await regionCache.set('mget2', 'value2');
      await regionCache.set('mget3', 'value3');

      const results = await regionCache.mget(['mget1', 'mget2', 'mget3', 'notfound']);
      
      expect(results).toEqual({
        mget1: 'value1',
        mget2: 'value2',
        mget3: 'value3',
        notfound: undefined
      });
    });

    it('should handle multiple set operations', async () => {
      await regionCache.mset({
        mset1: 'value1',
        mset2: 'value2',
        mset3: 'value3'
      });

      const value1 = await regionCache.get('mset1');
      const value2 = await regionCache.get('mset2');
      const value3 = await regionCache.get('mset3');

      expect(value1).toBe('value1');
      expect(value2).toBe('value2');
      expect(value3).toBe('value3');
    });
  });

  describe('metadata', () => {
    it('should return correct region name', () => {
      expect(regionCache.getRegion()).toBe('test-region');
      expect(anotherRegionCache.getRegion()).toBe('another-region');
    });

    it('should return underlying adapter', () => {
      expect(regionCache.getAdapter()).toBe(adapter);
    });

    it('should return region stats', async () => {
      await regionCache.set('stats-key', 'stats-value');
      const stats = await regionCache.stats();
      
      expect(stats).toHaveProperty('region', 'test-region');
      expect(stats).toHaveProperty('keys');
      expect(stats).toHaveProperty('globalStats');
      expect(typeof stats.keys).toBe('number');
      expect(stats.keys).toBeGreaterThan(0);
    });
  });
});
