[**amdWiki API v1.5.0**](../../../../README.md)

***

[amdWiki API](../../../../README.md) / [src/cache/NodeCacheAdapter](../README.md) / export=

# Class: export=

Defined in: [src/cache/NodeCacheAdapter.js:8](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/cache/NodeCacheAdapter.js#L8)

Node-cache based cache adapter
Provides in-memory caching with TTL support using the node-cache library

## Extends

- `ICacheAdapter`

## Constructors

### Constructor

> **new export=**(`options`): `NodeCacheAdapter`

Defined in: [src/cache/NodeCacheAdapter.js:9](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/cache/NodeCacheAdapter.js#L9)

#### Parameters

##### options

#### Returns

`NodeCacheAdapter`

#### Overrides

`ICacheAdapter.constructor`

## Properties

### cache

> **cache**: `NodeCache`

Defined in: [src/cache/NodeCacheAdapter.js:22](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/cache/NodeCacheAdapter.js#L22)

***

### config

> **config**: `object`

Defined in: [src/cache/NodeCacheAdapter.js:23](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/cache/NodeCacheAdapter.js#L23)

#### checkperiod

> **checkperiod**: `any`

#### deleteOnExpire

> **deleteOnExpire**: `boolean` = `true`

#### maxKeys

> **maxKeys**: `any`

#### stdTTL

> **stdTTL**: `any`

#### useClones

> **useClones**: `boolean`

***

### statistics

> **statistics**: `object`

Defined in: [src/cache/NodeCacheAdapter.js:26](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/cache/NodeCacheAdapter.js#L26)

#### deletes

> **deletes**: `number` = `0`

#### hits

> **hits**: `number` = `0`

#### misses

> **misses**: `number` = `0`

#### sets

> **sets**: `number` = `0`

## Methods

### clear()

> **clear**(`pattern?`): `Promise`\<`void`\>

Defined in: [src/cache/NodeCacheAdapter.js:109](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/cache/NodeCacheAdapter.js#L109)

Clear cache entries

#### Parameters

##### pattern?

`string`

Optional pattern to match keys (e.g., 'user:*')

#### Returns

`Promise`\<`void`\>

#### Overrides

`ICacheAdapter.clear`

***

### close()

> **close**(): `Promise`\<`void`\>

Defined in: [src/cache/NodeCacheAdapter.js:214](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/cache/NodeCacheAdapter.js#L214)

Close/cleanup the cache adapter

#### Returns

`Promise`\<`void`\>

#### Overrides

`ICacheAdapter.close`

***

### del()

> **del**(`keys`): `Promise`\<`void`\>

Defined in: [src/cache/NodeCacheAdapter.js:91](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/cache/NodeCacheAdapter.js#L91)

Delete one or more keys from the cache

#### Parameters

##### keys

Single key or array of keys to delete

`string` | `string`[]

#### Returns

`Promise`\<`void`\>

#### Overrides

`ICacheAdapter.del`

***

### get()

> **get**(`key`): `Promise`\<`any`\>

Defined in: [src/cache/NodeCacheAdapter.js:56](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/cache/NodeCacheAdapter.js#L56)

Get a value from the cache

#### Parameters

##### key

`string`

The cache key

#### Returns

`Promise`\<`any`\>

The cached value or undefined if not found

#### Overrides

`ICacheAdapter.get`

***

### getNodeCache()

> **getNodeCache**(): `NodeCache`

Defined in: [src/cache/NodeCacheAdapter.js:229](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/cache/NodeCacheAdapter.js#L229)

Get the underlying node-cache instance (for advanced usage)

#### Returns

`NodeCache`

The node-cache instance

***

### isHealthy()

> **isHealthy**(): `Promise`\<`boolean`\>

Defined in: [src/cache/NodeCacheAdapter.js:196](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/cache/NodeCacheAdapter.js#L196)

Check if the cache adapter is healthy/connected

#### Returns

`Promise`\<`boolean`\>

True if healthy

#### Overrides

`ICacheAdapter.isHealthy`

***

### keys()

> **keys**(`pattern`): `Promise`\<`string`[]\>

Defined in: [src/cache/NodeCacheAdapter.js:132](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/cache/NodeCacheAdapter.js#L132)

Get keys matching a pattern

#### Parameters

##### pattern

`string` = `'*'`

Pattern to match (e.g., 'user:*' or '*' for all)

#### Returns

`Promise`\<`string`[]\>

Array of matching keys

#### Overrides

`ICacheAdapter.keys`

***

### set()

> **set**(`key`, `value`, `ttlSec?`): `Promise`\<`void`\>

Defined in: [src/cache/NodeCacheAdapter.js:73](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/cache/NodeCacheAdapter.js#L73)

Set a value in the cache

#### Parameters

##### key

`string`

The cache key

##### value

`any`

The value to cache

##### ttlSec?

`number`

Time to live in seconds

#### Returns

`Promise`\<`void`\>

#### Overrides

`ICacheAdapter.set`

***

### stats()

> **stats**(): `Promise`\<`CacheStats`\>

Defined in: [src/cache/NodeCacheAdapter.js:157](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/cache/NodeCacheAdapter.js#L157)

Get cache statistics

#### Returns

`Promise`\<`CacheStats`\>

Cache statistics

#### Overrides

`ICacheAdapter.stats`
