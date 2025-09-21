const { describe, it, expect, beforeEach, afterEach } = require('@jest/globals');
const NodeCacheAdapter = require('../NodeCacheAdapter');

describe('NodeCacheAdapter', () => {
  let adapter;

  beforeEach(() => {
    adapter = new NodeCacheAdapter({
      stdTTL: 60,
      checkperiod: 10,
      maxKeys: 100
    });
  });

  afterEach(async () => {
    if (adapter) {
      await adapter.close();
    }
  });

  describe('basic operations', () => {
    it('should set and get values', async () => {
      await adapter.set('test-key', 'test-value');
      const value = await adapter.get('test-key');
      expect(value).toBe('test-value');
    });

    it('should return undefined for non-existent keys', async () => {
      const value = await adapter.get('non-existent');
      expect(value).toBeUndefined();
    });

    it('should delete keys', async () => {
      await adapter.set('test-key', 'test-value');
      await adapter.del('test-key');
      const value = await adapter.get('test-key');
      expect(value).toBeUndefined();
    });

    it('should delete multiple keys', async () => {
      await adapter.set('key1', 'value1');
      await adapter.set('key2', 'value2');
      await adapter.del(['key1', 'key2']);
      
      const value1 = await adapter.get('key1');
      const value2 = await adapter.get('key2');
      
      expect(value1).toBeUndefined();
      expect(value2).toBeUndefined();
    });
  });

  describe('TTL operations', () => {
    it('should respect TTL', async () => {
      await adapter.set('ttl-key', 'ttl-value', 1); // 1 second TTL
      
      // Should be available immediately
      let value = await adapter.get('ttl-key');
      expect(value).toBe('ttl-value');
      
      // Wait for expiration
      await new Promise(resolve => setTimeout(resolve, 1100));
      
      // Should be expired
      value = await adapter.get('ttl-key');
      expect(value).toBeUndefined();
    });
  });

  describe('pattern operations', () => {
    beforeEach(async () => {
      await adapter.set('user:123', 'user-data-123');
      await adapter.set('user:456', 'user-data-456');
      await adapter.set('session:abc', 'session-data-abc');
      await adapter.set('config:def', 'config-data-def');
    });

    it('should get all keys with wildcard pattern', async () => {
      const keys = await adapter.keys('*');
      expect(keys.length).toBeGreaterThanOrEqual(4);
      expect(keys).toContain('user:123');
      expect(keys).toContain('user:456');
      expect(keys).toContain('session:abc');
      expect(keys).toContain('config:def');
    });

    it('should get keys matching specific pattern', async () => {
      const userKeys = await adapter.keys('user:*');
      expect(userKeys).toEqual(expect.arrayContaining(['user:123', 'user:456']));
      expect(userKeys).not.toContain('session:abc');
      expect(userKeys).not.toContain('config:def');
    });

    it('should clear all keys', async () => {
      await adapter.clear();
      const keys = await adapter.keys('*');
      expect(keys.length).toBe(0);
    });

    it('should clear keys matching pattern', async () => {
      await adapter.clear('user:*');
      
      const userKeys = await adapter.keys('user:*');
      expect(userKeys.length).toBe(0);
      
      // Other keys should still exist
      const sessionValue = await adapter.get('session:abc');
      const configValue = await adapter.get('config:def');
      expect(sessionValue).toBe('session-data-abc');
      expect(configValue).toBe('config-data-def');
    });
  });

  describe('statistics', () => {
    it('should return cache statistics', async () => {
      await adapter.set('stats-key', 'stats-value');
      const stats = await adapter.stats();
      
      expect(stats).toHaveProperty('hits');
      expect(stats).toHaveProperty('misses');
      expect(stats).toHaveProperty('keys');
      expect(stats).toHaveProperty('sets');
      expect(stats).toHaveProperty('deletes');
      expect(stats).toHaveProperty('hitRate');
      expect(stats).toHaveProperty('maxKeys');
      expect(stats).toHaveProperty('stdTTL');
      
      expect(typeof stats.keys).toBe('number');
      expect(stats.keys).toBeGreaterThan(0);
    });
  });

  describe('health check', () => {
    it('should be healthy', async () => {
      const isHealthy = await adapter.isHealthy();
      expect(isHealthy).toBe(true);
    });
  });

  describe('object caching', () => {
    it('should cache and retrieve objects', async () => {
      const testObject = {
        name: 'Test User',
        age: 30,
        roles: ['user', 'admin'],
        metadata: {
          created: '2025-01-01',
          active: true
        }
      };

      await adapter.set('user-object', testObject);
      const retrieved = await adapter.get('user-object');
      
      expect(retrieved).toEqual(testObject);
      expect(retrieved.name).toBe('Test User');
      expect(retrieved.roles).toEqual(['user', 'admin']);
      expect(retrieved.metadata.active).toBe(true);
    });

    it('should cache arrays', async () => {
      const testArray = ['item1', 'item2', { key: 'value' }];
      
      await adapter.set('test-array', testArray);
      const retrieved = await adapter.get('test-array');
      
      expect(retrieved).toEqual(testArray);
      expect(Array.isArray(retrieved)).toBe(true);
      expect(retrieved.length).toBe(3);
    });
  });
});
