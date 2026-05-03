# CacheManager Complete Guide

**Module:** `src/managers/CacheManager.ts`
**Quick Reference:** [CacheManager.md](CacheManager.md)
**Version:** 2.0.0
**Last Updated:** 2026-05-03 (post-v3.6.0)
**Based on:** JSPWiki caching patterns with provider architecture

---

## Table of Contents

1. [Overview](#overview)
2. [Two cache layers in ngdpbase](#two-cache-layers-in-ngdpbase)
3. [Architecture](#architecture)
4. [Configuration](#configuration)
5. [Provider System](#provider-system)
6. [Usage Examples](#usage-examples)
7. [Cache Regions](#cache-regions)
8. [API Reference](#api-reference)
9. [Statistics and Monitoring](#statistics-and-monitoring)
10. [Admin API](#admin-api)
11. [Provider-level structural caches](#provider-level-structural-caches)
12. [Future Providers](#future-providers)
13. [Best Practices](#best-practices)
14. [Troubleshooting](#troubleshooting)

## Overview

The CacheManager provides centralized cache management for ngdpbase with support for multiple cache backends through a pluggable provider system. It enables caching across all managers with configurable TTL, cache regions (namespaces), and comprehensive statistics.

### Key Features

- **Pluggable Cache Providers**: Support for multiple backends (node-cache, Redis, Memcached)
- **Cache Regions**: Namespace isolation for different managers
- **Provider Fallback**: Configurable default provider with automatic failover
- **Health Monitoring**: Automatic health checks with fallback to NullCacheProvider
- **Statistics**: Comprehensive cache statistics and hit rate tracking
- **Pattern Matching**: Support for glob-style key patterns
- **All Lowercase Config**: Follows ngdpbase configuration standards (issue #102)

### Design Principles

Following the provider pattern established in AttachmentManager, PageManager, and UserManager:

1. Delegates storage to pluggable providers
2. Uses provider fallback pattern (`.provider.default` → `.provider`)
3. All configuration keys are lowercase
4. Provider name normalization (lowercase config → PascalCase class)
5. Health check with automatic failover to NullCacheProvider

---

## Two cache layers in ngdpbase

ngdpbase has **two distinct caching layers** that serve different purposes. CacheManager (this document) is one of them. Understanding the split prevents confusion when "where is X cached?" comes up.

### Layer 1 — CacheManager-managed regions (this doc)

**Opportunistic memoization**, TTL-based, pluggable backends.

- **What it caches**: result-of-computation values that benefit from temporary memoization — rendered HTML, policy decisions, ACL parses, search results, etc.
- **Lifetime**: TTL-bounded (default 300s). Auto-evicted on expiry; explicitly invalidated on data changes.
- **Backend**: pluggable — `NodeCacheProvider` (in-memory, current default), `NullCacheProvider` (no-op for tests/disabled), planned `RedisCacheProvider` for multi-instance deployments.
- **Topology**: in-process or remote.
- **API**: `engine.getManager('CacheManager').region('foo').get/set/del/...`.
- **Behavior on miss**: caller re-computes and caches.

This layer is what the rest of this document covers in detail.

### Layer 2 — Provider-level structural caches

**Authoritative in-memory copies** of source-of-truth data, built at init time, kept current via write-through invalidation. **Not managed by CacheManager.**

- **What it caches**: the data itself (page metadata, content, search index, theme paths). These structures *are* the lookup tables; cache misses are usually impossible (everything was loaded at init).
- **Lifetime**: process lifetime. Updated on every relevant write (savePage / deletePage / rename → cache update).
- **Backend**: plain JavaScript `Map` / `Object`, sometimes persisted to disk for fast restart (`data/page-index.json`, `data/search-index/documents.json`).
- **Topology**: always in-process (with the exception of ES, which lives in its own cluster).
- **API**: provider-specific — not exposed through CacheManager.

The full inventory is in [Provider-level structural caches](#provider-level-structural-caches) below.

### Side-by-side

| | CacheManager region | Provider-level cache |
|---|---|---|
| Purpose | Opportunistic memoization | Source-of-truth in-memory copy |
| Lifetime | TTL (default 300s) | Process lifetime |
| Invalidation | TTL expiry + manual `clear()` | Explicit on every write (savePage / deletePage / rename) |
| Backend | Pluggable (`NodeCacheProvider` / `NullCacheProvider` / future `RedisCacheProvider`) | Plain JS `Map` / `Object`; sometimes disk-persisted |
| Behavior on miss | Recompute and cache | Either impossible or fall through to a one-off disk read |
| Topology | In-process or remote | Always in-process (ES being the exception by design) |
| Documented here | ✅ Layer 1 sections | Inventory in [Provider-level structural caches](#provider-level-structural-caches) |

> **Quick rule of thumb**: if the value would be expensive to recompute and is fine to be slightly stale (rendered HTML, policy decisions), it goes in a CacheManager region. If the value *is* the lookup table you need to serve a request synchronously (which page exists, what's its frontmatter, what tokens does it contain for search), it lives in a provider-level structural cache.

---

## Architecture

```text
┌─────────────────────────────────────────────────────────┐
│                    CacheManager                          │
│  (High-level API, regions, statistics)                  │
└────────────────┬────────────────────────────────────────┘
                 │
                 │ delegates caching to
                 ▼
┌─────────────────────────────────────────────────────────┐
│              BaseCacheProvider                           │
│           (Abstract provider interface)                  │
└─────────────────┬───────────────────────────────────────┘
                  │
          ┌───────┴───────┬──────────────┬───────────────┐
          ▼               ▼              ▼               ▼
  ┌───────────────┐ ┌──────────┐ ┌──────────┐ ┌─────────────┐
  │   NodeCache   │ │  Redis   │ │ Memcached│ │    Null     │
  │   Provider    │ │  Cache   │ │  Cache   │ │   Cache     │
  │  (In-Memory)  │ │ Provider │ │ Provider │ │  Provider   │
  │               │ │ (Distrib)│ │ (Distrib)│ │  (No-op)    │
  └───────────────┘ └──────────┘ └──────────┘ └─────────────┘
        ✅              🔮           🔮             ✅
    Implemented      Future       Future      Implemented
```

### Component Responsibilities

**CacheManager:**

- Provider initialization and management
- Cache region management (namespaces)
- Provider name normalization (lowercase → PascalCase)
- Health check and automatic failover
- Statistics aggregation

**BaseCacheProvider:**

- Abstract interface all providers must implement
- Defines standard methods (get, set, del, clear, keys, stats)
- Enforces ConfigurationManager usage

**Concrete Providers:**

- Implement actual cache storage (in-memory, Redis, etc.)
- Handle TTL and expiration
- Provide statistics and health checks
- Support pattern matching for keys

**RegionCache:**

- Provides namespace isolation for different managers
- Wraps provider with region prefix
- Enables cache segmentation

### Cache Regions (Namespaces)

CacheManager supports cache regions that provide namespace isolation:

```javascript
// Each manager gets its own region
const pageCache = cacheManager.region('PageManager');
const userCache = cacheManager.region('UserManager');

// Keys are automatically prefixed
await pageCache.set('page:Welcome', pageData);  // Stored as 'PageManager:page:Welcome'
await userCache.set('user:admin', userData);    // Stored as 'UserManager:user:admin'
```

## Configuration

### Configuration Structure (ALL LOWERCASE)

All configuration keys follow the lowercase standard from issue #102:

```json
{
  "_comment_cache_storage": "Cache storage configuration (ALL LOWERCASE)",
  "ngdpbase.cache.enabled": true,

  "_comment_cache_provider": "Cache provider with fallback",
  "ngdpbase.cache.provider.default": "nodecacheprovider",
  "ngdpbase.cache.provider": "nodecacheprovider",

  "_comment_cache_shared": "Shared cache settings (all providers)",
  "ngdpbase.cache.defaultttl": 300,
  "ngdpbase.cache.maxkeys": 1000,
  "ngdpbase.cache.checkperiod": 120,

  "_comment_cache_provider_nodecache": "NodeCacheProvider settings",
  "ngdpbase.cache.provider.nodecache.stdttl": 300,
  "ngdpbase.cache.provider.nodecache.checkperiod": 120,
  "ngdpbase.cache.provider.nodecache.maxkeys": 1000,
  "ngdpbase.cache.provider.nodecache.useclones": true,

  "_comment_cache_provider_redis": "RedisCacheProvider settings (future)",
  "ngdpbase.cache.provider.redis.url": "redis://localhost:6379",
  "ngdpbase.cache.provider.redis.keyprefix": "ngdpbase:",
  "ngdpbase.cache.provider.redis.enablecluster": false,
  "ngdpbase.cache.provider.redis.connecttimeout": 5000
}
```

### Configuration Keys Reference

#### Core Settings

| Key | Type | Default | Description |
| ----- | ------ | --------- | ------------- |
| `ngdpbase.cache.enabled` | boolean | `true` | Enable/disable caching globally |
| `ngdpbase.cache.provider.default` | string | `nodecacheprovider` | Default provider name (fallback) |
| `ngdpbase.cache.provider` | string | `nodecacheprovider` | Active provider name |
| `ngdpbase.cache.defaultttl` | number | `300` | Default TTL in seconds (5 minutes) |
| `ngdpbase.cache.maxkeys` | number | `1000` | Maximum number of cache keys |
| `ngdpbase.cache.checkperiod` | number | `120` | Expiration check interval (seconds) |

#### NodeCacheProvider Settings

| Key | Type | Default | Description |
| ----- | ------ | --------- | ------------- |
| `ngdpbase.cache.provider.nodecache.stdttl` | number | `300` | Standard TTL for cache entries |
| `ngdpbase.cache.provider.nodecache.checkperiod` | number | `120` | Check expired keys interval |
| `ngdpbase.cache.provider.nodecache.maxkeys` | number | `1000` | Maximum keys in cache |
| `ngdpbase.cache.provider.nodecache.useclones` | boolean | `true` | Clone objects on get/set |

#### RedisCacheProvider Settings (Future)

| Key | Type | Default | Description |
| ----- | ------ | --------- | ------------- |
| `ngdpbase.cache.provider.redis.url` | string | `redis://localhost:6379` | Redis connection URL |
| `ngdpbase.cache.provider.redis.keyprefix` | string | `ngdpbase:` | Prefix for all cache keys |
| `ngdpbase.cache.provider.redis.enablecluster` | boolean | `false` | Enable Redis Cluster mode |
| `ngdpbase.cache.provider.redis.connecttimeout` | number | `5000` | Connection timeout (ms) |

### Provider Fallback Pattern

CacheManager uses a two-tier fallback system:

1. **Configuration Fallback**: `.provider.default` → `.provider`
2. **Health Check Fallback**: Failed provider → `NullCacheProvider`

```javascript
// 1. Load default provider
const defaultProvider = getProperty('ngdpbase.cache.provider.default', 'nodecacheprovider');

// 2. Try to load active provider (falls back to default if not set)
const providerName = getProperty('ngdpbase.cache.provider', defaultProvider);

// 3. Health check after initialization
const isHealthy = await provider.isHealthy();
if (!isHealthy) {
  // Automatically fall back to NullCacheProvider
  provider = new NullCacheProvider(engine);
}
```

---

## Provider System

### Available Providers

#### 1. NodeCacheProvider (Implemented)

**File:** `src/providers/NodeCacheProvider.js`

In-memory cache using the `node-cache` library. Best for single-instance deployments.

**Features:**

- TTL support
- Pattern matching
- Statistics tracking
- Memory-efficient

**Use Cases:**

- Development environments
- Single-instance production
- Low-traffic wikis

**Configuration Example:**

```json
{
  "ngdpbase.cache.provider": "nodecacheprovider",
  "ngdpbase.cache.provider.nodecache.stdttl": 300,
  "ngdpbase.cache.provider.nodecache.maxkeys": 1000
}
```

#### 2. NullCacheProvider (Implemented)

**File:** `src/providers/NullCacheProvider.js`

No-op cache provider. All operations are no-ops.

**Use Cases:**

- Caching disabled (`ngdpbase.cache.enabled: false`)
- Testing environments
- Automatic fallback when other providers fail

**Configuration Example:**

```json
{
  "ngdpbase.cache.enabled": false
}
```

#### 3. RedisCacheProvider (Future)

**File:** `src/providers/RedisCacheProvider.js` (stub)

Distributed cache using Redis. Best for multi-instance production deployments.

**Planned Features:**

- Distributed caching
- Persistence
- Pub/sub for cache invalidation
- Cluster support

**Use Cases:**

- Multi-instance production
- High-traffic wikis
- Shared caching across servers

---

## Usage Examples

### Basic Usage

```javascript
// Get CacheManager instance
const cacheManager = engine.getManager('CacheManager');

// Simple get/set
await cacheManager.set('key', 'value');
const value = await cacheManager.get('key');

// Set with custom TTL (10 seconds)
await cacheManager.set('key', 'value', { ttl: 10 });

// Delete keys
await cacheManager.del('key');
await cacheManager.del(['key1', 'key2', 'key3']);

// Clear all cache
await cacheManager.clear();

// Get keys matching pattern
const keys = await cacheManager.keys('user:*');
```

### Using Cache Regions

```javascript
// Get a region for your manager
const myCache = cacheManager.region('MyManager');

// All operations are scoped to this region
await myCache.set('data', value);
const data = await myCache.get('data');

// Clear only this region
await myCache.clear();

// Get region statistics
const stats = await myCache.stats();
```

### In Manager Classes

```javascript
class MyManager extends BaseManager {
  constructor(engine) {
    super(engine);
    this.cache = null;
  }

  async initialize() {
    await super.initialize();

    // Get cache region for this manager
    const cacheManager = this.engine.getManager('CacheManager');
    if (cacheManager) {
      this.cache = cacheManager.region('MyManager');
    }
  }

  async getData(key) {
    // Try cache first
    if (this.cache) {
      const cached = await this.cache.get(key);
      if (cached) return cached;
    }

    // Load from storage
    const data = await this.loadFromStorage(key);

    // Cache for 5 minutes
    if (this.cache) {
      await this.cache.set(key, data, { ttl: 300 });
    }

    return data;
  }
}
```

### Pattern Matching

```javascript
// Get all user keys
const userKeys = await cacheManager.keys('user:*');

// Get all page keys for a specific namespace
const docKeys = await cacheManager.keys('page:documentation:*');

// Clear all temporary keys
const tempKeys = await cacheManager.keys('temp:*');
await cacheManager.del(tempKeys);
```

### Health Checks

```javascript
// Check if cache is healthy
const isHealthy = await cacheManager.isHealthy();

if (!isHealthy) {
  logger.warn('Cache provider is unhealthy, may have fallen back to NullCacheProvider');
}
```

---

## Cache Regions

Cache regions provide namespace isolation for different managers. Each region operates independently with its own key space.

### Creating Regions

```javascript
const cacheManager = engine.getManager('CacheManager');

// Create region for PageManager
const pageCache = cacheManager.region('PageManager');

// Create region for UserManager
const userCache = cacheManager.region('UserManager');
```

### Region API

Regions implement the same interface as CacheManager but scoped to the region:

```javascript
// All operations are automatically prefixed
await pageCache.set('welcome', pageData);      // Key: 'PageManager:welcome'
await userCache.set('admin', userData);        // Key: 'UserManager:admin'

// No key collision between regions
const page = await pageCache.get('welcome');   // Gets PageManager data
const user = await userCache.get('welcome');   // Gets UserManager data (different key)

// Clear only one region
await pageCache.clear();  // Only clears PageManager keys

// Region statistics
const pageStats = await pageCache.stats();
```

### Region Best Practices

1. **One Region Per Manager**: Each manager should use its own region
2. **Consistent Naming**: Use manager class name as region name
3. **Structured Keys**: Use hierarchical key patterns (e.g., `page:uuid`, `user:session:token`)
4. **Namespace Isolation**: Don't access other regions directly

---

## API Reference

### CacheManager Methods

#### `async initialize(config)`

Initialize the cache manager and load provider.

**Parameters:**

- `config` (Object): Configuration object (optional)

**Returns:** `Promise<void>`

**Example:**

```javascript
await cacheManager.initialize();
```

---

#### `region(regionName)`

Get or create a cache region.

**Parameters:**

- `regionName` (string): Region name (typically manager name)

**Returns:** `RegionCache`

**Example:**

```javascript
const cache = cacheManager.region('PageManager');
```

---

#### `async get(key)`

Get a value from the cache (global scope).

**Parameters:**

- `key` (string): Cache key

**Returns:** `Promise<any|undefined>` - Cached value or undefined

**Example:**

```javascript
const value = await cacheManager.get('mykey');
```

---

#### `async set(key, value, options)`

Set a value in the cache (global scope).

**Parameters:**

- `key` (string): Cache key
- `value` (any): Value to cache
- `options` (Object): Options
  - `ttl` (number): Time to live in seconds

**Returns:** `Promise<void>`

**Example:**

```javascript
await cacheManager.set('mykey', 'myvalue', { ttl: 300 });
```

---

#### `async del(keys)`

Delete one or more keys from the cache.

**Parameters:**

- `keys` (string|string[]): Single key or array of keys

**Returns:** `Promise<void>`

**Example:**

```javascript
await cacheManager.del('key1');
await cacheManager.del(['key1', 'key2', 'key3']);
```

---

#### `async clear(region, pattern)`

Clear cache entries.

**Parameters:**

- `region` (string): Optional region to clear
- `pattern` (string): Optional pattern to match keys

**Returns:** `Promise<void>`

**Example:**

```javascript
await cacheManager.clear();                    // Clear all
await cacheManager.clear('PageManager');       // Clear region
await cacheManager.clear(null, 'temp:*');      // Clear pattern
```

---

#### `async keys(pattern)`

Get keys matching a pattern.

**Parameters:**

- `pattern` (string): Pattern to match (default: '*')

**Returns:** `Promise<string[]>`

**Example:**

```javascript
const keys = await cacheManager.keys('user:*');
```

---

#### `async stats(region)`

Get cache statistics.

**Parameters:**

- `region` (string): Optional region name

**Returns:** `Promise<Object>` - Statistics object

**Example:**

```javascript
const stats = await cacheManager.stats();
console.log(`Hit rate: ${stats.global.hitRate}%`);
```

---

#### `async isHealthy()`

Check if cache provider is healthy.

**Returns:** `Promise<boolean>`

**Example:**

```javascript
if (await cacheManager.isHealthy()) {
  console.log('Cache is healthy');
}
```

---

#### `getConfig()`

Get cache configuration.

**Returns:** `Object` - Configuration object

**Example:**

```javascript
const config = cacheManager.getConfig();
console.log(`Provider: ${config.provider}`);
```

---

#### `getRegions()`

Get all active region names.

**Returns:** `string[]`

**Example:**

```javascript
const regions = cacheManager.getRegions();
console.log(`Active regions: ${regions.join(', ')}`);
```

---

#### `async flushAll()`

Flush all caches (dangerous operation).

**Returns:** `Promise<void>`

**Warning:** This clears ALL cache data across all regions.

---

#### `async shutdown()`

Close and cleanup cache resources.

**Returns:** `Promise<void>`

---

### Static Methods

#### `CacheManager.getCacheForManager(engine, region)`

Helper method to get a cache region from any manager.

**Parameters:**

- `engine` (WikiEngine): Engine instance
- `region` (string): Region name

**Returns:** `RegionCache`

**Example:**

```javascript
const cache = CacheManager.getCacheForManager(this.engine, 'MyManager');
```

---

## Statistics and Monitoring

### Global Statistics

```javascript
const stats = await cacheManager.stats();

console.log('Global Statistics:', {
  hits: stats.global.hits,
  misses: stats.global.misses,
  hitRate: stats.global.hitRate,
  keys: stats.global.keys,
  maxKeys: stats.global.maxKeys
});

console.log('Active Regions:', stats.regions);
console.log('Provider:', stats.provider);
```

### Region Statistics

```javascript
const pageCache = cacheManager.region('PageManager');
const stats = await pageCache.stats();

console.log('PageManager Cache:', {
  hits: stats.hits,
  misses: stats.misses,
  hitRate: stats.hitRate,
  keys: stats.keys
});
```

### Health Monitoring

```javascript
// Periodic health check
setInterval(async () => {
  const isHealthy = await cacheManager.isHealthy();
  if (!isHealthy) {
    logger.error('Cache provider health check failed!');
    // Alert monitoring system
  }
}, 60000); // Every minute
```

---

## Admin API

The cache statistics and clear operations are exposed via REST endpoints, useful for ops dashboards and post-incident clearing.

### `GET /api/admin/cache/stats`

Returns global and per-region cache statistics including hit/miss ratios, key counts, and configuration.

```bash
curl -H "Cookie: ngdpbase.sid=<session>" http://localhost:3000/api/admin/cache/stats
```

Response shape:

```json
{
  "global": { "hits": 12345, "misses": 678, "hitRate": 0.948, "keys": 412 },
  "regions": {
    "PageManager":   { "hits": 8000, "misses": 200, "hitRate": 0.976, "keys": 104 },
    "RenderingManager": { "hits": 3200, "misses": 350, "hitRate": 0.901, "keys": 87 },
    "ACLManager":    { "hits": 800,  "misses": 80,  "hitRate": 0.909, "keys": 24 }
  },
  "config": { "provider": "NodeCacheProvider", "defaultTTL": 300, "maxKeys": 1000 }
}
```

### `POST /api/admin/cache/clear`

Clear all caches across all regions.

```bash
curl -X POST -H "Cookie: ngdpbase.sid=<session>" -H "x-csrf-token: <token>" \
  http://localhost:3000/api/admin/cache/clear
```

### `POST /api/admin/cache/clear/:region`

Clear a specific region.

```bash
curl -X POST -H "Cookie: ngdpbase.sid=<session>" -H "x-csrf-token: <token>" \
  http://localhost:3000/api/admin/cache/clear/RenderingManager
```

Both clear endpoints require `admin-system` permission and a valid CSRF token. Both affect only **CacheManager-managed regions** — provider-level structural caches (page metadata, search index) are not cleared.

---

## Provider-level structural caches

These are the Layer 2 caches mentioned in [Two cache layers in ngdpbase](#two-cache-layers-in-ngdpbase). They are not managed by CacheManager and not exposed through its API. Each lives in the provider that owns it. Listed here as a reference for "where does X live?" questions.

### `FileSystemProvider` — page data

**File**: `src/providers/FileSystemProvider.ts`

| Cache | Type | Populated | Invalidated |
|---|---|---|---|
| `pageCache` | `Map<title, PageInfo>` (metadata + filepath + uuid + title) | Provider init, walks pages dir, parses every file's YAML frontmatter | `savePage` / `deletePage` / `renamePage` write-through |
| `contentCache` | `Map<title, content>` (raw markdown without frontmatter) | Same as above for fast-init pages | Same write-through |
| `uuidIndex` | `Map<uuid, title>` | Same | Same |
| `titleIndex` | `Map<lowercased-title, title>` (case-insensitive lookup) | Same | Same |

Hit rate is essentially 100% after init — `getPageMetadata` never falls through to disk; `getPage` / `getPageContent` may fall through once for a page added after init, then caches the result.

### `VersioningFileProvider` — versioned page metadata index

**File**: `src/providers/VersioningFileProvider.ts`

| Cache | Type | Persisted? |
|---|---|---|
| `pageIndex: PageIndex` | `{ pageCount, pages: Record<uuid, PageIndexEntry> }` — uuid keyed entries with `title`, `location`, `creator`, `lastModified`, `filename`, version count | Yes — `data/page-index.json` (configurable via `ngdpbase.page.provider.versioning.indexfile`) |

Loaded once at init via `loadOrCreatePageIndex()`, mutated in memory, queued writes back to disk. Used by `MediaManager.checkPrivatePageAccess` and `RecentChangesPlugin` for cross-page metadata lookups without per-page disk reads. Internal to the provider — consumers should go through `pageManager.getPage*` rather than reaching into `pageIndex` directly. See [Access-Control.md](../architecture/Access-Control.md) for the architectural boundary.

### `LunrSearchProvider` — full-text index + denormalized documents

**File**: `src/providers/LunrSearchProvider.ts`

| Cache | Type | Persisted? |
|---|---|---|
| `documents: Record<pageName, LunrDocument>` | Denormalized per-page docs (title, content, userKeywords, tags, isPrivate, creator, ...) | Yes — `data/search-index/documents.json` |
| `searchIndex: lunr.Index` | BM25 reverse index built from `documents` via `lunr()` | Rebuilt from `documents` on warm start; serialized only as part of the lunr.js library's own format (rebuild is fast) |

Cold path: walks `pageManager.getAllPages()` and `getPage(name)` (which hit FileSystemProvider's `pageCache`/`contentCache` — no NAS reads beyond init). Warm path: load persisted `documents.json`, rebuild lunr index, skip the PageManager round-trip entirely.

Search-time visibility filters operate on fields denormalized into `LunrDocument`. Fields not denormalized cannot be filtered — see open issues [#626](https://github.com/jwilleke/ngdpbase/issues/626) (audience), [#627](https://github.com/jwilleke/ngdpbase/issues/627) (AuthorLocked).

### `ElasticsearchSearchProvider` — distributed full-text index

**File**: `src/providers/ElasticsearchSearchProvider.ts`

| Cache | Type | Persisted? |
|---|---|---|
| ES cluster index | Sharded inverted segments managed by Elasticsearch itself | Yes — by ES |

Topology: out-of-process. ngdpbase indexes documents into ES at indexing time and queries via the ES HTTP API at search time. ES handles its own caching, persistence, and clustering. Indexed document shape: `{ title, content, systemCategory, systemKeywords, userKeywords, lastModified, isPrivate, audience }`. Same denormalization rule as Lunr — fields not in the indexed shape can't be filtered. See open issue [#628](https://github.com/jwilleke/ngdpbase/issues/628) (AuthorLocked not indexed).

### `MarkupParser` — parse-result cache

**File**: `src/parsers/MarkupParser.ts`

| Cache | Type | Persisted? |
|---|---|---|
| Parse result cache | TTL-based, keyed by `hash(content + context)` | No — in-process, lost on restart |

This one straddles the two layers: it's TTL-based like a CacheManager region but lives inside MarkupParser with its own implementation. See [Current-Rendering-Pipeline.md](../architecture/Current-Rendering-Pipeline.md#caching). Configured via `ngdpbase.markup.cache-ttl` (default 300s). Invalidated on save through the rendering pipeline. Could be migrated to a `CacheManager.region('MarkupParser')` if cross-instance invalidation becomes important.

### Engine-wide ThemeManager cache (#625)

**File**: `src/managers/ThemeManager.ts`

| Cache | Type | Persisted? |
|---|---|---|
| `cachedThemeManager` (single-entry) | `ThemeManager` instance keyed by `${themesDir}::${activeTheme}` | No — in-process |

Built lazily on first `getThemeManager(activeTheme, themesDir)` call. Ensures `WikiContext.activeTheme` / `themeInfo` getters don't trigger fresh fs I/O on every request. See [WikiContext-Complete-Guide.md](../WikiContext-Complete-Guide.md#lazy-theme-resolution-v360).

### `UserManager` / `RoleManager` — user records and role definitions

**Files**: `src/managers/UserManager.ts`, `src/providers/FileUserProvider.ts`, `src/managers/RoleManager.ts`

These have their own in-memory user / role records loaded at init from JSON files. Used by `userManager.hasPermission(...)` (PolicyEvaluator path) and role-resolution helpers without disk hits. See [Access-Control.md](../architecture/Access-Control.md) for the access-path performance characteristics.

### Other in-process caches

- **Configuration**: `ConfigurationManager` holds the merged config in memory; `getProperty` is a Map lookup.
- **Policies**: `PolicyManager` keeps the loaded policy file in memory; `PolicyEvaluator.evaluateAccess` iterates them in-process.
- **Plugin output cache**: `MarkupParser`'s handler-result cache (separate from parse-result cache).

None of these are CacheManager regions; all are in-process structural caches.

### Visualizing the layers

```text
                                     ┌─────────────────────────────────────────┐
                                     │  Layer 1 — CacheManager regions (TTL)   │
                                     │                                         │
                                     │  PageManager:rendered-html              │
                                     │  RenderingManager:parsed-content        │
                                     │  ACLManager:permission-decisions        │
                                     │  PolicyManager:evaluation-results       │
                                     │  ...                                    │
                                     │                                         │
                                     │  Backend: NodeCacheProvider (default)   │
                                     │           NullCacheProvider (disabled)  │
                                     │           RedisCacheProvider (planned)  │
                                     └─────────────────────────────────────────┘

   ┌──────────────────────────────┐  ┌──────────────────────────────┐  ┌──────────────────────┐
   │  Layer 2 — page provider     │  │  Layer 2 — search provider   │  │  Layer 2 — managers  │
   │                              │  │                              │  │                      │
   │  FileSystemProvider          │  │  LunrSearchProvider          │  │  ThemeManager cache  │
   │   .pageCache (Map)           │  │   .documents (Record)        │  │  UserManager / Role  │
   │   .contentCache (Map)        │  │   .searchIndex (lunr.Index)  │  │  ConfigurationMgr    │
   │   .uuidIndex (Map)           │  │  → data/search-index/        │  │  PolicyManager       │
   │   .titleIndex (Map)          │  │       documents.json         │  │                      │
   │                              │  │                              │  │  All in-process      │
   │  VersioningFileProvider      │  │  ElasticsearchSearchProvider │  │  Map / Object        │
   │   .pageIndex (Record)        │  │   ES cluster (out-of-process)│  │                      │
   │  → data/page-index.json      │  │                              │  │                      │
   └──────────────────────────────┘  └──────────────────────────────┘  └──────────────────────┘
```

---

## Future Providers

### RedisCacheProvider (Planned)

**Status:** Stub implementation in `src/providers/RedisCacheProvider.js`

**Planned Features:**

- Distributed caching across multiple instances
- Persistence for cache durability
- Pub/sub for cache invalidation
- Redis Cluster support
- Connection pooling
- Sentinel support for high availability

**Configuration Example:**

```json
{
  "ngdpbase.cache.provider": "rediscacheprovider",
  "ngdpbase.cache.provider.redis.url": "redis://localhost:6379",
  "ngdpbase.cache.provider.redis.keyprefix": "ngdpbase:",
  "ngdpbase.cache.provider.redis.enablecluster": false,
  "ngdpbase.cache.provider.redis.connecttimeout": 5000
}
```

**Implementation TODO:**

- [ ] Install Redis client (`redis` or `ioredis`)
- [ ] Implement connection management
- [ ] Add cluster support
- [ ] Implement pub/sub for invalidation
- [ ] Add connection pooling
- [ ] Implement pattern matching with SCAN
- [ ] Add statistics from Redis INFO

### MemcachedProvider (Planned)

**Status:** Not yet started

**Use Cases:**

- High-performance distributed caching
- Simple key-value caching
- Multi-instance deployments

### CloudCacheProvider (Planned)

**Status:** Not yet started

**Options:**

- AWS ElastiCache
- Azure Cache for Redis
- Google Cloud Memorystore

---

## Best Practices

### 1. Use Cache Regions

Always use cache regions to avoid key collisions:

```javascript
// ✅ Good - Use region
const cache = cacheManager.region('MyManager');
await cache.set('data', value);

// ❌ Bad - Global scope
await cacheManager.set('data', value);
```

### 2. Structure Your Keys

Use hierarchical key patterns:

```javascript
// ✅ Good - Structured keys
await cache.set('page:uuid:123', pageData);
await cache.set('user:session:abc', sessionData);

// ❌ Bad - Flat keys
await cache.set('page123', pageData);
await cache.set('sessionabc', sessionData);
```

### 3. Set Appropriate TTLs

Choose TTL based on data volatility:

```javascript
// Frequently changing data - short TTL
await cache.set('activeUsers', users, { ttl: 60 });

// Static data - long TTL
await cache.set('siteConfig', config, { ttl: 3600 });

// Session data - medium TTL
await cache.set('userSession', session, { ttl: 300 });
```

### 4. Handle Cache Misses

Always handle undefined returns:

```javascript
// ✅ Good
const data = await cache.get('key');
if (data === undefined) {
  data = await loadFromDatabase();
  await cache.set('key', data);
}

// ❌ Bad - No fallback
const data = await cache.get('key');
return data; // May be undefined
```

### 5. Cache Invalidation

Clear cache when data changes:

```javascript
async updatePage(pageId, newContent) {
  // Update database
  await database.update(pageId, newContent);

  // Invalidate cache
  await this.cache.del(`page:${pageId}`);

  // Optional: Pre-populate with new data
  await this.cache.set(`page:${pageId}`, newContent);
}
```

### 6. Monitor Cache Performance

Track cache statistics:

```javascript
// Log cache performance periodically
setInterval(async () => {
  const stats = await cache.stats();
  logger.info('Cache stats:', {
    hitRate: stats.hitRate,
    keys: stats.keys,
    maxKeys: stats.maxKeys
  });

  if (stats.hitRate < 70) {
    logger.warn('Low cache hit rate, consider adjusting TTL');
  }
}, 300000); // Every 5 minutes
```

### 7. Don't Cache Everything

Cache strategically:

```javascript
// ✅ Good - Cache expensive operations
const parsedMarkup = await cache.get(`parsed:${pageId}`);
if (!parsedMarkup) {
  parsedMarkup = await expensiveMarkupParsing(content);
  await cache.set(`parsed:${pageId}`, parsedMarkup, { ttl: 300 });
}

// ❌ Bad - Caching cheap operations
const upperCase = await cache.get(`upper:${text}`);
if (!upperCase) {
  upperCase = text.toUpperCase(); // Too cheap to cache
  await cache.set(`upper:${text}`, upperCase);
}
```

---

## Troubleshooting

### Cache Not Working

**Symptom:** Cache always returns undefined

**Possible Causes:**

1. CacheManager not initialized
2. Caching disabled in configuration
3. Provider failed health check and fell back to NullCacheProvider

**Solutions:**

```javascript
// Check if CacheManager is available
const cacheManager = engine.getManager('CacheManager');
if (!cacheManager) {
  console.log('CacheManager not registered in WikiEngine');
}

// Check if caching is enabled
const config = cacheManager.getConfig();
console.log('Provider:', config.provider);

// Check health
const isHealthy = await cacheManager.isHealthy();
console.log('Healthy:', isHealthy);
```

### High Memory Usage

**Symptom:** Node process memory growing over time

**Possible Causes:**

1. maxKeys set too high
2. TTL too long
3. Storing large objects in cache

**Solutions:**

```json
{
  "ngdpbase.cache.provider.nodecache.maxkeys": 500,
  "ngdpbase.cache.provider.nodecache.stdttl": 180
}
```

### Low Hit Rate

**Symptom:** Cache hit rate below 50%

**Possible Causes:**

1. TTL too short
2. Keys not consistent
3. High cache invalidation rate

**Solutions:**

- Increase TTL for stable data
- Review key generation logic
- Reduce cache invalidation frequency

### Provider Load Failed

**Symptom:** Logs show "Failed to load cache provider"

**Possible Causes:**

1. Provider file not found
2. Syntax error in provider
3. Missing dependencies

**Solutions:**

```bash
# Check provider exists
ls src/providers/NodeCacheProvider.js

# Check for syntax errors
node -c src/providers/NodeCacheProvider.js

# Install dependencies
npm install node-cache
```

### Keys Not Found After Restart

**Symptom:** Cache empty after server restart

**Explanation:** This is expected behavior for NodeCacheProvider (in-memory cache).

**Solutions:**

- Use RedisCacheProvider for persistence
- Pre-populate cache on startup
- Accept cache warm-up period

---

## Migration Guide

### From Old Configuration to New (Issue #102)

**Old Configuration (Mixed Case):**

```json
{
  "ngdpbase.cache.enabled": true,
  "ngdpbase.cache.provider": "node-cache",
  "ngdpbase.cache.defaultTTL": 300,
  "ngdpbase.cache.node.stdTTL": 300
}
```

**New Configuration (All Lowercase):**

```json
{
  "ngdpbase.cache.enabled": true,
  "ngdpbase.cache.provider.default": "nodecacheprovider",
  "ngdpbase.cache.provider": "nodecacheprovider",
  "ngdpbase.cache.defaultttl": 300,
  "ngdpbase.cache.provider.nodecache.stdttl": 300
}
```

**Key Changes:**

1. All keys now lowercase
2. Provider value changed: `"node-cache"` → `"nodecacheprovider"`
3. Added `.provider.default` for fallback
4. Provider settings moved to `.provider.nodecache.*`

---

## Related Documentation

- [AttachmentManager Documentation](./AttachmentManager.md) - Similar provider pattern
- [PageManager Documentation](./PageManager.md) - Provider architecture reference
- [UserManager Documentation](./UserManager-Documentation.md) - Provider fallback pattern
- [Configuration Refactoring Plan](../architecture/Configuration-Refactoring-Plan.md) - Issue #102 details

---

## Implementation Status

✅ **Completed (v1.0.0):**

- BaseCacheProvider interface
- NodeCacheProvider (in-memory)
- NullCacheProvider (no-op)
- Provider fallback pattern
- Health check with automatic failover
- Cache regions support
- Statistics and monitoring
- All lowercase configuration

🔮 **Future Enhancements:**

- RedisCacheProvider implementation
- MemcachedProvider implementation
- Cache warming strategies
- Advanced invalidation patterns
- Distributed cache coordination

---

**Last Updated:** October 12, 2025
**Related Issues:** #102 (Configuration Reorganization)
**Version:** 1.0.0
