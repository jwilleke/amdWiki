[**amdWiki API v1.5.0**](../../../../README.md)

***

[amdWiki API](../../../../README.md) / [src/cache/ICacheAdapter](../README.md) / export=

# Class: export=

Defined in: [src/cache/ICacheAdapter.js:23](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/cache/ICacheAdapter.js#L23)

Cache adapter interface
All cache adapters must implement these methods

## Constructors

### Constructor

> **new export=**(): `ICacheAdapter`

#### Returns

`ICacheAdapter`

## Methods

### clear()

> **clear**(`pattern?`): `Promise`\<`void`\>

Defined in: [src/cache/ICacheAdapter.js:58](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/cache/ICacheAdapter.js#L58)

Clear cache entries

#### Parameters

##### pattern?

`string`

Optional pattern to match keys (e.g., 'user:*')

#### Returns

`Promise`\<`void`\>

***

### close()

> **close**(): `Promise`\<`void`\>

Defined in: [src/cache/ICacheAdapter.js:91](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/cache/ICacheAdapter.js#L91)

Close/cleanup the cache adapter

#### Returns

`Promise`\<`void`\>

***

### del()

> **del**(`keys`): `Promise`\<`void`\>

Defined in: [src/cache/ICacheAdapter.js:49](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/cache/ICacheAdapter.js#L49)

Delete one or more keys from the cache

#### Parameters

##### keys

Single key or array of keys to delete

`string` | `string`[]

#### Returns

`Promise`\<`void`\>

***

### get()

> **get**(`key`): `Promise`\<`any`\>

Defined in: [src/cache/ICacheAdapter.js:29](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/cache/ICacheAdapter.js#L29)

Get a value from the cache

#### Parameters

##### key

`string`

The cache key

#### Returns

`Promise`\<`any`\>

The cached value or undefined if not found

***

### isHealthy()

> **isHealthy**(): `Promise`\<`boolean`\>

Defined in: [src/cache/ICacheAdapter.js:83](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/cache/ICacheAdapter.js#L83)

Check if the cache adapter is healthy/connected

#### Returns

`Promise`\<`boolean`\>

True if healthy

***

### keys()

> **keys**(`pattern`): `Promise`\<`string`[]\>

Defined in: [src/cache/ICacheAdapter.js:67](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/cache/ICacheAdapter.js#L67)

Get keys matching a pattern

#### Parameters

##### pattern

`string` = `'*'`

Pattern to match (e.g., 'user:*' or '*' for all)

#### Returns

`Promise`\<`string`[]\>

Array of matching keys

***

### set()

> **set**(`key`, `value`, `ttlSec?`): `Promise`\<`void`\>

Defined in: [src/cache/ICacheAdapter.js:40](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/cache/ICacheAdapter.js#L40)

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

***

### stats()

> **stats**(): `Promise`\<[`CacheStats`](../interfaces/CacheStats.md)\>

Defined in: [src/cache/ICacheAdapter.js:75](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/cache/ICacheAdapter.js#L75)

Get cache statistics

#### Returns

`Promise`\<[`CacheStats`](../interfaces/CacheStats.md)\>

Cache statistics
