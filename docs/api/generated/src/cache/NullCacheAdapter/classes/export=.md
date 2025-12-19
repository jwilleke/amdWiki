[**amdWiki API v1.5.0**](../../../../README.md)

***

[amdWiki API](../../../../README.md) / [src/cache/NullCacheAdapter](../README.md) / export=

# Class: export=

Defined in: [src/cache/NullCacheAdapter.js:7](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/cache/NullCacheAdapter.js#L7)

Null cache adapter - no-op implementation
Used when caching is disabled or for testing

## Extends

- `ICacheAdapter`

## Constructors

### Constructor

> **new export=**(): `NullCacheAdapter`

Defined in: [src/cache/NullCacheAdapter.js:8](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/cache/NullCacheAdapter.js#L8)

#### Returns

`NullCacheAdapter`

#### Overrides

`ICacheAdapter.constructor`

## Methods

### clear()

> **clear**(`pattern`): `Promise`\<`void`\>

Defined in: [src/cache/NullCacheAdapter.js:24](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/cache/NullCacheAdapter.js#L24)

Clear cache entries

#### Parameters

##### pattern

`any`

Optional pattern to match keys (e.g., 'user:*')

#### Returns

`Promise`\<`void`\>

#### Overrides

`ICacheAdapter.clear`

***

### close()

> **close**(): `Promise`\<`void`\>

Defined in: [src/cache/NullCacheAdapter.js:49](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/cache/NullCacheAdapter.js#L49)

Close/cleanup the cache adapter

#### Returns

`Promise`\<`void`\>

#### Overrides

`ICacheAdapter.close`

***

### del()

> **del**(`keys`): `Promise`\<`void`\>

Defined in: [src/cache/NullCacheAdapter.js:20](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/cache/NullCacheAdapter.js#L20)

Delete one or more keys from the cache

#### Parameters

##### keys

`any`

Single key or array of keys to delete

#### Returns

`Promise`\<`void`\>

#### Overrides

`ICacheAdapter.del`

***

### get()

> **get**(`key`): `Promise`\<`any`\>

Defined in: [src/cache/NullCacheAdapter.js:12](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/cache/NullCacheAdapter.js#L12)

Get a value from the cache

#### Parameters

##### key

`any`

The cache key

#### Returns

`Promise`\<`any`\>

The cached value or undefined if not found

#### Overrides

`ICacheAdapter.get`

***

### isHealthy()

> **isHealthy**(): `Promise`\<`boolean`\>

Defined in: [src/cache/NullCacheAdapter.js:45](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/cache/NullCacheAdapter.js#L45)

Check if the cache adapter is healthy/connected

#### Returns

`Promise`\<`boolean`\>

True if healthy

#### Overrides

`ICacheAdapter.isHealthy`

***

### keys()

> **keys**(`pattern`): `Promise`\<`any`[]\>

Defined in: [src/cache/NullCacheAdapter.js:28](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/cache/NullCacheAdapter.js#L28)

Get keys matching a pattern

#### Parameters

##### pattern

`string` = `'*'`

Pattern to match (e.g., 'user:*' or '*' for all)

#### Returns

`Promise`\<`any`[]\>

Array of matching keys

#### Overrides

`ICacheAdapter.keys`

***

### set()

> **set**(`key`, `value`, `ttlSec`): `Promise`\<`void`\>

Defined in: [src/cache/NullCacheAdapter.js:16](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/cache/NullCacheAdapter.js#L16)

Set a value in the cache

#### Parameters

##### key

`any`

The cache key

##### value

`any`

The value to cache

##### ttlSec

`any`

Time to live in seconds

#### Returns

`Promise`\<`void`\>

#### Overrides

`ICacheAdapter.set`

***

### stats()

> **stats**(): `Promise`\<\{ `deletes`: `number`; `hitRate`: `number`; `hits`: `number`; `keys`: `number`; `ksize`: `number`; `misses`: `number`; `sets`: `number`; `vsize`: `number`; \}\>

Defined in: [src/cache/NullCacheAdapter.js:32](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/cache/NullCacheAdapter.js#L32)

Get cache statistics

#### Returns

`Promise`\<\{ `deletes`: `number`; `hitRate`: `number`; `hits`: `number`; `keys`: `number`; `ksize`: `number`; `misses`: `number`; `sets`: `number`; `vsize`: `number`; \}\>

Cache statistics

#### Overrides

`ICacheAdapter.stats`
