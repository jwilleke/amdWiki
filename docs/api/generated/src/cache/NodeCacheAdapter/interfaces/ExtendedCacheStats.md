[**amdWiki API v1.5.0**](../../../../README.md)

***

[amdWiki API](../../../../README.md) / [src/cache/NodeCacheAdapter](../README.md) / ExtendedCacheStats

# Interface: ExtendedCacheStats

Defined in: [src/cache/NodeCacheAdapter.ts:36](https://github.com/jwilleke/amdWiki/blob/b6a859c7c9297966de89735ea5e8f953df289ac1/src/cache/NodeCacheAdapter.ts#L36)

Extended cache statistics with additional metrics

## Extends

- [`CacheStats`](../../ICacheAdapter/interfaces/CacheStats.md)

## Properties

### deletes

> **deletes**: `number`

Defined in: [src/cache/NodeCacheAdapter.ts:40](https://github.com/jwilleke/amdWiki/blob/b6a859c7c9297966de89735ea5e8f953df289ac1/src/cache/NodeCacheAdapter.ts#L40)

Number of delete operations

***

### hitRate

> **hitRate**: `number`

Defined in: [src/cache/NodeCacheAdapter.ts:42](https://github.com/jwilleke/amdWiki/blob/b6a859c7c9297966de89735ea5e8f953df289ac1/src/cache/NodeCacheAdapter.ts#L42)

Hit rate percentage

***

### hits

> **hits**: `number`

Defined in: [src/cache/ICacheAdapter.ts:14](https://github.com/jwilleke/amdWiki/blob/b6a859c7c9297966de89735ea5e8f953df289ac1/src/cache/ICacheAdapter.ts#L14)

Number of cache hits

#### Inherited from

[`CacheStats`](../../ICacheAdapter/interfaces/CacheStats.md).[`hits`](../../ICacheAdapter/interfaces/CacheStats.md#hits)

***

### keys

> **keys**: `number`

Defined in: [src/cache/ICacheAdapter.ts:18](https://github.com/jwilleke/amdWiki/blob/b6a859c7c9297966de89735ea5e8f953df289ac1/src/cache/ICacheAdapter.ts#L18)

Number of keys in cache

#### Inherited from

[`CacheStats`](../../ICacheAdapter/interfaces/CacheStats.md).[`keys`](../../ICacheAdapter/interfaces/CacheStats.md#keys)

***

### ksize

> **ksize**: `number`

Defined in: [src/cache/ICacheAdapter.ts:20](https://github.com/jwilleke/amdWiki/blob/b6a859c7c9297966de89735ea5e8f953df289ac1/src/cache/ICacheAdapter.ts#L20)

Approximate memory usage of keys in bytes

#### Inherited from

[`CacheStats`](../../ICacheAdapter/interfaces/CacheStats.md).[`ksize`](../../ICacheAdapter/interfaces/CacheStats.md#ksize)

***

### maxKeys

> **maxKeys**: `number`

Defined in: [src/cache/NodeCacheAdapter.ts:44](https://github.com/jwilleke/amdWiki/blob/b6a859c7c9297966de89735ea5e8f953df289ac1/src/cache/NodeCacheAdapter.ts#L44)

Maximum number of keys allowed

***

### misses

> **misses**: `number`

Defined in: [src/cache/ICacheAdapter.ts:16](https://github.com/jwilleke/amdWiki/blob/b6a859c7c9297966de89735ea5e8f953df289ac1/src/cache/ICacheAdapter.ts#L16)

Number of cache misses

#### Inherited from

[`CacheStats`](../../ICacheAdapter/interfaces/CacheStats.md).[`misses`](../../ICacheAdapter/interfaces/CacheStats.md#misses)

***

### sets

> **sets**: `number`

Defined in: [src/cache/NodeCacheAdapter.ts:38](https://github.com/jwilleke/amdWiki/blob/b6a859c7c9297966de89735ea5e8f953df289ac1/src/cache/NodeCacheAdapter.ts#L38)

Number of set operations

***

### stdTTL

> **stdTTL**: `number`

Defined in: [src/cache/NodeCacheAdapter.ts:46](https://github.com/jwilleke/amdWiki/blob/b6a859c7c9297966de89735ea5e8f953df289ac1/src/cache/NodeCacheAdapter.ts#L46)

Standard TTL in seconds

***

### vsize

> **vsize**: `number`

Defined in: [src/cache/ICacheAdapter.ts:22](https://github.com/jwilleke/amdWiki/blob/b6a859c7c9297966de89735ea5e8f953df289ac1/src/cache/ICacheAdapter.ts#L22)

Approximate memory usage of values in bytes

#### Inherited from

[`CacheStats`](../../ICacheAdapter/interfaces/CacheStats.md).[`vsize`](../../ICacheAdapter/interfaces/CacheStats.md#vsize)
