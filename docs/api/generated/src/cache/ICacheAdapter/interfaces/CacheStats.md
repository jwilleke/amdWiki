[**amdWiki API v1.5.0**](../../../../README.md)

***

[amdWiki API](../../../../README.md) / [src/cache/ICacheAdapter](../README.md) / CacheStats

# Interface: CacheStats

Defined in: [src/cache/ICacheAdapter.ts:12](https://github.com/jwilleke/amdWiki/blob/b6a859c7c9297966de89735ea5e8f953df289ac1/src/cache/ICacheAdapter.ts#L12)

Cache statistics structure

## Extended by

- [`ExtendedCacheStats`](../../NodeCacheAdapter/interfaces/ExtendedCacheStats.md)

## Properties

### hits

> **hits**: `number`

Defined in: [src/cache/ICacheAdapter.ts:14](https://github.com/jwilleke/amdWiki/blob/b6a859c7c9297966de89735ea5e8f953df289ac1/src/cache/ICacheAdapter.ts#L14)

Number of cache hits

***

### keys

> **keys**: `number`

Defined in: [src/cache/ICacheAdapter.ts:18](https://github.com/jwilleke/amdWiki/blob/b6a859c7c9297966de89735ea5e8f953df289ac1/src/cache/ICacheAdapter.ts#L18)

Number of keys in cache

***

### ksize

> **ksize**: `number`

Defined in: [src/cache/ICacheAdapter.ts:20](https://github.com/jwilleke/amdWiki/blob/b6a859c7c9297966de89735ea5e8f953df289ac1/src/cache/ICacheAdapter.ts#L20)

Approximate memory usage of keys in bytes

***

### misses

> **misses**: `number`

Defined in: [src/cache/ICacheAdapter.ts:16](https://github.com/jwilleke/amdWiki/blob/b6a859c7c9297966de89735ea5e8f953df289ac1/src/cache/ICacheAdapter.ts#L16)

Number of cache misses

***

### vsize

> **vsize**: `number`

Defined in: [src/cache/ICacheAdapter.ts:22](https://github.com/jwilleke/amdWiki/blob/b6a859c7c9297966de89735ea5e8f953df289ac1/src/cache/ICacheAdapter.ts#L22)

Approximate memory usage of values in bytes
