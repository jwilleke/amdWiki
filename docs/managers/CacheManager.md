# CacheManager

**Module:** `src/managers/CacheManager.js`
**Extends:** [BaseManager](BaseManager.md)
**Complete Guide:** [CacheManager-Complete-Guide.md](CacheManager-Complete-Guide.md)

---

## Overview

CacheManager provides centralized cache management for amdWiki with pluggable cache providers, cache regions (namespaces), configurable TTL, and comprehensive statistics tracking.

## Key Features

- **Pluggable Providers** - Support for multiple backends (NodeCache, Redis, Memcached)
- **Cache Regions** - Namespace isolation for different managers
- **Provider Fallback** - Automatic failover to NullCacheProvider on failure
- **Health Monitoring** - Automatic health checks with recovery
- **Statistics** - Hit rates, miss rates, memory usage per region
- **Pattern Matching** - Glob-style key patterns for bulk operations
- **TTL Support** - Per-key time-to-live configuration

## Quick Example

```javascript
const cacheManager = engine.getManager('CacheManager');

// Get a cache region (namespace)
const pageCache = cacheManager.region('pages');

// Set with TTL (in seconds)
await pageCache.set('HomePage', pageData, 3600);

// Get from cache
const page = await pageCache.get('HomePage');
if (page) {
  console.log('Cache hit!');
}

// Delete specific key
await pageCache.del('HomePage');

// Clear entire region
await pageCache.clear();

// Get statistics
const stats = await pageCache.stats();
console.log('Hit rate:', stats.hitRate);
```

## Core Methods

| Method | Returns | Description |
| -------- | --------- | ------------- |
| `region(name)` | `RegionCache` | Get or create cache region |
| `get(key)` | `Promise<any>` | Get value from default region |
| `set(key, value, options)` | `Promise<void>` | Set value in default region |
| `del(keys)` | `Promise<void>` | Delete one or more keys |
| `clear(region, pattern)` | `Promise<void>` | Clear region or pattern |
| `keys(pattern)` | `Promise<string[]>` | Get keys matching pattern |
| `stats(region)` | `Promise<Object>` | Get cache statistics |
| `isHealthy()` | `Promise<boolean>` | Check provider health |
| `flushAll()` | `Promise<void>` | Clear all cache regions |

## Region Methods

```javascript
const region = cacheManager.region('pages');

// Set with TTL
await region.set('key', value, 3600);

// Get value
const value = await region.get('key');

// Delete keys
await region.del('key');
await region.del(['key1', 'key2']);

// Clear region
await region.clear();

// Get statistics
const stats = await region.stats();
```

## Set Options

```javascript
await cacheManager.set('key', value, {
  ttl: 3600,              // Time-to-live in seconds
  region: 'pages',        // Target region (optional)
  tags: ['user', 'edit']  // Tags for bulk invalidation (future)
});
```

## Statistics Object

```javascript
{
  hits: 150,          // Cache hits
  misses: 50,         // Cache misses
  hitRate: 0.75,      // Hit rate (hits / total)
  keys: 100,          // Number of keys
  size: 1024000,      // Memory usage in bytes (provider-dependent)
  ttl: 300            // Default TTL for region
}
```

## Configuration

```json
{
  "amdwiki.cache.enabled": true,
  "amdwiki.cache.provider.default": "nodecacheprovider",
  "amdwiki.cache.provider": "nodecacheprovider",
  "amdwiki.cache.defaultttl": 300,
  "amdwiki.cache.maxkeys": 1000,
  "amdwiki.cache.checkperiod": 120
}
```

## Available Providers

| Provider | Status | Description |
| ---------- | -------- | ------------- |
| `NodeCacheProvider` | ✅ Production | In-memory cache (single server) |
| `NullCacheProvider` | ✅ Production | No-op cache (for testing/disabled) |
| `RedisCacheProvider` | 🔮 Planned | Distributed cache via Redis |
| `MemcachedProvider` | 🔮 Planned | Distributed cache via Memcached |

## Common Cache Regions

| Region | Used By | TTL | Description |
| -------- | --------- | ----- | ------------- |
| `pages` | PageManager | 3600 | Rendered page content |
| `users` | UserManager | 1800 | User session data |
| `search` | SearchManager | 600 | Search results |
| `metadata` | PageManager | 7200 | Page metadata |
| `permissions` | ACLManager | 900 | Permission checks |
| `plugins` | PluginManager | 3600 | Plugin output |

## Pattern Matching

```javascript
// Get all page keys
const pageKeys = await cacheManager.keys('pages:*');

// Clear all user session caches
await cacheManager.clear('users', 'session:*');

// Delete specific pattern
await cacheManager.del('temp:*');
```

## Health Monitoring

```javascript
// Check provider health
const healthy = await cacheManager.isHealthy();
if (!healthy) {
  console.warn('Cache provider unhealthy, using fallback');
}

// Get provider info
const config = cacheManager.getConfig();
console.log('Provider:', config.provider);
console.log('Features:', config.features);
```

## Best Practices

1. **Use Regions**: Isolate caches by manager/purpose
2. **Set Appropriate TTL**: Balance freshness vs performance
3. **Monitor Hit Rates**: Track cache effectiveness
4. **Clear on Updates**: Invalidate cache when data changes
5. **Test Without Cache**: Use NullCacheProvider for testing

## Example: PageManager Integration

```javascript
class PageManager extends BaseManager {
  async getPage(identifier) {
    const cacheManager = this.engine.getManager('CacheManager');
    const cache = cacheManager.region('pages');

    // Try cache first
    const cached = await cache.get(identifier);
    if (cached) return cached;

    // Cache miss, load from storage
    const page = await this.provider.getPage(identifier);

    // Store in cache for 1 hour
    await cache.set(identifier, page, 3600);

    return page;
  }

  async savePage(name, content, metadata) {
    // Save to storage
    await this.provider.savePage(name, content, metadata);

    // Invalidate cache
    const cache = this.engine.getManager('CacheManager').region('pages');
    await cache.del(name);
  }
}
```

## Disabling Cache

```json
{
  "amdwiki.cache.enabled": false
}
```

When disabled, CacheManager automatically loads NullCacheProvider (no-op).

## Related Managers

- [ConfigurationManager](ConfigurationManager.md) - Cache configuration
- [PageManager](PageManager.md) - Page caching
- [UserManager](UserManager.md) - User session caching
- [SearchManager](SearchManager.md) - Search result caching

## Developer Documentation

For complete provider architecture, custom provider implementation, statistics details, and troubleshooting:

- [CacheManager-Complete-Guide.md](CacheManager-Complete-Guide.md)
