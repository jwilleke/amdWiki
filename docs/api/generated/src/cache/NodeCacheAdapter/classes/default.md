[**amdWiki API v1.5.0**](../../../../README.md)

***

[amdWiki API](../../../../README.md) / [src/cache/NodeCacheAdapter](../README.md) / default

# Class: default

Defined in: [src/cache/NodeCacheAdapter.ts:54](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/cache/NodeCacheAdapter.ts#L54)

Node-cache based cache adapter
Provides in-memory caching with TTL support using the node-cache library

## Extends

- [`default`](../../ICacheAdapter/classes/default.md)

## Constructors

### Constructor

> **new default**(`options`): `NodeCacheAdapter`

Defined in: [src/cache/NodeCacheAdapter.ts:59](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/cache/NodeCacheAdapter.ts#L59)

#### Parameters

##### options

[`NodeCacheAdapterOptions`](../interfaces/NodeCacheAdapterOptions.md) = `{}`

#### Returns

`NodeCacheAdapter`

#### Overrides

[`default`](../../ICacheAdapter/classes/default.md).[`constructor`](../../ICacheAdapter/classes/default.md#constructor)

## Methods

### clear()

> **clear**(`pattern?`): `Promise`\<`void`\>

Defined in: [src/cache/NodeCacheAdapter.ts:175](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/cache/NodeCacheAdapter.ts#L175)

Clear cache entries

#### Parameters

##### pattern?

`string`

Optional pattern to match keys (e.g., 'user:*')

#### Returns

`Promise`\<`void`\>

#### Overrides

[`default`](../../ICacheAdapter/classes/default.md).[`clear`](../../ICacheAdapter/classes/default.md#clear)

***

### close()

> **close**(): `Promise`\<`void`\>

Defined in: [src/cache/NodeCacheAdapter.ts:309](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/cache/NodeCacheAdapter.ts#L309)

Close/cleanup the cache adapter

#### Returns

`Promise`\<`void`\>

#### Overrides

[`default`](../../ICacheAdapter/classes/default.md).[`close`](../../ICacheAdapter/classes/default.md#close)

***

### del()

> **del**(`keys`): `Promise`\<`void`\>

Defined in: [src/cache/NodeCacheAdapter.ts:151](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/cache/NodeCacheAdapter.ts#L151)

Delete one or more keys from the cache

#### Parameters

##### keys

Single key or array of keys to delete

`string` | `string`[]

#### Returns

`Promise`\<`void`\>

#### Overrides

[`default`](../../ICacheAdapter/classes/default.md).[`del`](../../ICacheAdapter/classes/default.md#del)

***

### get()

> **get**\<`T`\>(`key`): `Promise`\<`T`\>

Defined in: [src/cache/NodeCacheAdapter.ts:98](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/cache/NodeCacheAdapter.ts#L98)

Get a value from the cache

#### Type Parameters

##### T

`T` = `unknown`

#### Parameters

##### key

`string`

The cache key

#### Returns

`Promise`\<`T`\>

The cached value or undefined if not found

#### Overrides

[`default`](../../ICacheAdapter/classes/default.md).[`get`](../../ICacheAdapter/classes/default.md#get)

***

### getNodeCache()

> **getNodeCache**(): `NodeCache`

Defined in: [src/cache/NodeCacheAdapter.ts:327](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/cache/NodeCacheAdapter.ts#L327)

Get the underlying node-cache instance (for advanced usage)

#### Returns

`NodeCache`

The node-cache instance

***

### isHealthy()

> **isHealthy**(): `Promise`\<`boolean`\>

Defined in: [src/cache/NodeCacheAdapter.ts:290](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/cache/NodeCacheAdapter.ts#L290)

Check if the cache adapter is healthy/connected

#### Returns

`Promise`\<`boolean`\>

True if healthy

#### Overrides

[`default`](../../ICacheAdapter/classes/default.md).[`isHealthy`](../../ICacheAdapter/classes/default.md#ishealthy)

***

### keys()

> **keys**(`pattern`): `Promise`\<`string`[]\>

Defined in: [src/cache/NodeCacheAdapter.ts:203](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/cache/NodeCacheAdapter.ts#L203)

Get keys matching a pattern

#### Parameters

##### pattern

`string` = `'*'`

Pattern to match (e.g., 'user:*' or '*' for all)

#### Returns

`Promise`\<`string`[]\>

Array of matching keys

#### Overrides

[`default`](../../ICacheAdapter/classes/default.md).[`keys`](../../ICacheAdapter/classes/default.md#keys)

***

### set()

> **set**(`key`, `value`, `ttlSec?`): `Promise`\<`void`\>

Defined in: [src/cache/NodeCacheAdapter.ts:127](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/cache/NodeCacheAdapter.ts#L127)

Set a value in the cache

#### Parameters

##### key

`string`

The cache key

##### value

`unknown`

The value to cache

##### ttlSec?

`number`

Time to live in seconds

#### Returns

`Promise`\<`void`\>

#### Overrides

[`default`](../../ICacheAdapter/classes/default.md).[`set`](../../ICacheAdapter/classes/default.md#set)

***

### stats()

> **stats**(): `Promise`\<[`ExtendedCacheStats`](../interfaces/ExtendedCacheStats.md)\>

Defined in: [src/cache/NodeCacheAdapter.ts:234](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/cache/NodeCacheAdapter.ts#L234)

Get cache statistics

#### Returns

`Promise`\<[`ExtendedCacheStats`](../interfaces/ExtendedCacheStats.md)\>

Cache statistics

#### Overrides

[`default`](../../ICacheAdapter/classes/default.md).[`stats`](../../ICacheAdapter/classes/default.md#stats)
