# Cache System

The amdWiki cache system provides centralized, configurable caching across all managers and components to improve performance and reduce redundant operations.

## Architecture

### Core Components

- **CacheManager**: Central cache orchestrator
- **Cache Adapters**: Backend implementations (node-cache, Redis, null)
- **RegionCache**: Namespaced cache regions for isolation
- **ICacheAdapter**: Interface defining cache contract

### Cache Regions

Each manager gets its own isolated cache region to prevent key collisions:

- `PageManager`: Page data and metadata
- `PolicyManager`: Policy evaluation results
- `ACLManager`: Access control lists
- `RenderingManager`: Rendered content and page names

## Configuration

### Default Settings

```javascript
{
  enabled: true,
  provider: 'node-cache',
  defaultTTL: 300,
  maxKeys: 1000,
  checkPeriod: 120
}
```

### Configuration Properties

| Property | Default | Description |
| ---------- | --------- | ------------- |
| `amdwiki.cache.enabled` | `true` | Enable/disable caching |
| `amdwiki.cache.provider` | `'node-cache'` | Cache backend (`node-cache`, `redis`, `null`) |
| `amdwiki.cache.defaultTTL` | `300` | Default TTL in seconds |
| `amdwiki.cache.maxKeys` | `1000` | Maximum cached keys |
| `amdwiki.cache.checkPeriod` | `120` | Cleanup interval in seconds |

### Node-Cache Specific

```javascript
amdwiki.cache.node.stdTTL = 300
amdwiki.cache.node.checkperiod = 120
amdwiki.cache.node.maxKeys = 1000
```

### Redis Configuration (Future)

```javascript
amdwiki.cache.redis.url = 'redis://localhost:6379'
amdwiki.cache.redis.keyPrefix = 'amdwiki:'
amdwiki.cache.redis.enableCluster = false
```

## Usage

### Getting Cache Region

```javascript
// From a manager
const cache = this.engine.getManager('CacheManager').region('myRegion');

// Static helper method
const cache = CacheManager.getCacheForManager(engine, 'myRegion');
```

### Basic Operations

```javascript
// Set with default TTL
await cache.set('key', 'value');

// Set with custom TTL
await cache.set('key', 'value', { ttl: 600 });

// Get value
const value = await cache.get('key');

// Delete keys
await cache.del('key');
await cache.del(['key1', 'key2']);

// Clear region
await cache.clear();
```

### Pattern Operations

```javascript
// Get keys by pattern
const keys = await cache.keys('user:*');

// Clear by pattern
await cache.clear('session:*');
```

## Admin API

### Cache Statistics

```bash
GET /api/admin/cache/stats
```

Returns global and per-region cache statistics including hit/miss ratios, key counts, and configuration.

### Clear Cache

```bash
# Clear all caches
POST /api/admin/cache/clear

# Clear specific region
POST /api/admin/cache/clear/PageManager
```

## Performance Considerations

### What Gets Cached

- **Page Data**: Full page objects with metadata
- **Policy Evaluations**: Access control decisions
- **Rendered Content**: Processed markdown
- **ACL Parsing**: Access control list results
- **Lookup Maps**: Title/slug to UUID mappings

### Cache Invalidation

- **Automatic**: TTL-based expiration
- **Manual**: Explicit cache clearing on data changes
- **Pattern-based**: Bulk operations using key patterns

### Memory Usage

- Default: 1000 keys maximum per cache
- Configurable limits prevent memory exhaustion
- LRU eviction when limits exceeded

## Monitoring

### Statistics Available

- Hit/miss ratios
- Key counts per region
- Cache configuration
- Health status

### Health Checks

The system automatically falls back to null cache if the primary adapter fails health checks.

## Troubleshooting

### Common Issues

1. **High Memory Usage**: Reduce `maxKeys` or `defaultTTL`
2. **Poor Hit Ratios**: Increase TTL or review cache keys
3. **Stale Data**: Clear specific regions after updates

### Disabling Cache

```javascript
// Via configuration
amdwiki.cache.enabled = false

// Via provider setting
amdwiki.cache.provider = 'null'
```

### Debug Mode

Enable cache logging to track operations:

```javascript
// Cache operations are logged when debug mode is active
console.log('Cache operation:', { key, operation, region });
```
