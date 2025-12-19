[**amdWiki API v1.5.0**](../../../../README.md)

***

[amdWiki API](../../../../README.md) / [src/cache/RegionCache](../README.md) / export=

# Class: export=

Defined in: [src/cache/RegionCache.js:7](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/cache/RegionCache.js#L7)

RegionCache - Cache wrapper that provides namespaced access to a cache adapter

This class wraps a cache adapter and automatically prefixes all keys with a region name,
providing isolation between different cache users (managers, components, etc.)

## Constructors

### Constructor

> **new export=**(`adapter`, `region`): `RegionCache`

Defined in: [src/cache/RegionCache.js:8](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/cache/RegionCache.js#L8)

#### Parameters

##### adapter

`any`

##### region

`any`

#### Returns

`RegionCache`

## Properties

### adapter

> **adapter**: `any`

Defined in: [src/cache/RegionCache.js:9](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/cache/RegionCache.js#L9)

***

### prefix

> **prefix**: `string`

Defined in: [src/cache/RegionCache.js:11](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/cache/RegionCache.js#L11)

***

### region

> **region**: `any`

Defined in: [src/cache/RegionCache.js:10](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/cache/RegionCache.js#L10)

## Methods

### \_getFullKey()

> **\_getFullKey**(`key`): `string`

Defined in: [src/cache/RegionCache.js:19](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/cache/RegionCache.js#L19)

Create a full key by prefixing with the region

#### Parameters

##### key

`string`

The cache key

#### Returns

`string`

The prefixed key

***

### \_stripPrefix()

> **\_stripPrefix**(`fullKey`): `string`

Defined in: [src/cache/RegionCache.js:28](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/cache/RegionCache.js#L28)

Remove region prefix from a key

#### Parameters

##### fullKey

`string`

The prefixed key

#### Returns

`string`

The key without region prefix

***

### clear()

> **clear**(`pattern?`): `Promise`\<`void`\>

Defined in: [src/cache/RegionCache.js:76](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/cache/RegionCache.js#L76)

Clear all cache entries for this region

#### Parameters

##### pattern?

`string`

Optional pattern to match keys within the region

#### Returns

`Promise`\<`void`\>

***

### del()

> **del**(`keys`): `Promise`\<`void`\>

Defined in: [src/cache/RegionCache.js:62](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/cache/RegionCache.js#L62)

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

Defined in: [src/cache/RegionCache.js:40](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/cache/RegionCache.js#L40)

Get a value from the cache

#### Parameters

##### key

`string`

The cache key

#### Returns

`Promise`\<`any`\>

The cached value or undefined if not found

***

### getAdapter()

> **getAdapter**(): `ICacheAdapter`

Defined in: [src/cache/RegionCache.js:187](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/cache/RegionCache.js#L187)

Get the underlying adapter

#### Returns

`ICacheAdapter`

The cache adapter

***

### getOrSet()

> **getOrSet**(`key`, `factory`, `options?`): `Promise`\<`any`\>

Defined in: [src/cache/RegionCache.js:133](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/cache/RegionCache.js#L133)

Get or set a value (cache-aside pattern)

#### Parameters

##### key

`string`

The cache key

##### factory

`Function`

Function to generate the value if not cached

##### options?

Cache options

###### ttl?

`number`

Time to live in seconds

#### Returns

`Promise`\<`any`\>

The cached or generated value

***

### getRegion()

> **getRegion**(): `string`

Defined in: [src/cache/RegionCache.js:179](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/cache/RegionCache.js#L179)

Get the region name

#### Returns

`string`

The region name

***

### has()

> **has**(`key`): `Promise`\<`boolean`\>

Defined in: [src/cache/RegionCache.js:120](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/cache/RegionCache.js#L120)

Check if a key exists in this region

#### Parameters

##### key

`string`

The cache key

#### Returns

`Promise`\<`boolean`\>

True if key exists

***

### keys()

> **keys**(`pattern?`): `Promise`\<`string`[]\>

Defined in: [src/cache/RegionCache.js:93](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/cache/RegionCache.js#L93)

Get keys matching a pattern within this region

#### Parameters

##### pattern?

`string` = `'*'`

Pattern to match

#### Returns

`Promise`\<`string`[]\>

Array of matching keys (without region prefix)

***

### mget()

> **mget**(`keys`): `Promise`\<`any`\>

Defined in: [src/cache/RegionCache.js:151](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/cache/RegionCache.js#L151)

Get multiple keys at once

#### Parameters

##### keys

`string`[]

Array of cache keys

#### Returns

`Promise`\<`any`\>

Object with keys as properties and cached values

***

### mset()

> **mset**(`keyValuePairs`, `options?`): `Promise`\<`void`\>

Defined in: [src/cache/RegionCache.js:167](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/cache/RegionCache.js#L167)

Set multiple keys at once

#### Parameters

##### keyValuePairs

`any`

Object with keys and values to set

##### options?

`any` = `{}`

Cache options

#### Returns

`Promise`\<`void`\>

***

### set()

> **set**(`key`, `value`, `options?`): `Promise`\<`void`\>

Defined in: [src/cache/RegionCache.js:52](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/cache/RegionCache.js#L52)

Set a value in the cache

#### Parameters

##### key

`string`

The cache key

##### value

`any`

The value to cache

##### options?

Cache options

###### ttl?

`number`

Time to live in seconds

#### Returns

`Promise`\<`void`\>

***

### stats()

> **stats**(): `Promise`\<`any`\>

Defined in: [src/cache/RegionCache.js:103](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/cache/RegionCache.js#L103)

Get cache statistics for this region

#### Returns

`Promise`\<`any`\>

Cache statistics for this region
