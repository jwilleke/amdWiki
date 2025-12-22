[**amdWiki API v1.5.0**](../../../../README.md)

***

[amdWiki API](../../../../README.md) / [src/providers/RedisCacheProvider](../README.md) / default

# Class: default

Defined in: [src/providers/RedisCacheProvider.ts:38](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/providers/RedisCacheProvider.ts#L38)

RedisCacheProvider - Redis-based cache provider (FUTURE IMPLEMENTATION)

Provides distributed caching using Redis.
Suitable for multi-instance deployments and production environments.

Configuration keys (all lowercase):

- amdwiki.cache.provider.redis.url - Redis connection URL
- amdwiki.cache.provider.redis.keyprefix - Key prefix for all cache keys
- amdwiki.cache.provider.redis.enablecluster - Enable Redis Cluster support
- amdwiki.cache.provider.redis.connecttimeout - Connection timeout in ms

TODO: Implement Redis integration using 'redis' or 'ioredis' npm package
TODO: Add connection pooling support
TODO: Add cluster mode support
TODO: Add pub/sub for cache invalidation across instances

## Extends

- [`default`](../../BaseCacheProvider/classes/default.md)

## Constructors

### Constructor

> **new default**(`engine`): `RedisCacheProvider`

Defined in: [src/providers/RedisCacheProvider.ts:42](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/providers/RedisCacheProvider.ts#L42)

#### Parameters

##### engine

`WikiEngine`

#### Returns

`RedisCacheProvider`

#### Overrides

[`default`](../../BaseCacheProvider/classes/default.md).[`constructor`](../../BaseCacheProvider/classes/default.md#constructor)

## Properties

### engine

> `protected` **engine**: `WikiEngine`

Defined in: [src/providers/BaseCacheProvider.ts:76](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/providers/BaseCacheProvider.ts#L76)

Reference to the wiki engine instance

#### Inherited from

[`default`](../../BaseCacheProvider/classes/default.md).[`engine`](../../BaseCacheProvider/classes/default.md#engine)

***

### initialized

> `protected` **initialized**: `boolean`

Defined in: [src/providers/BaseCacheProvider.ts:81](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/providers/BaseCacheProvider.ts#L81)

Whether the provider has been initialized

#### Inherited from

[`default`](../../BaseCacheProvider/classes/default.md).[`initialized`](../../BaseCacheProvider/classes/default.md#initialized)

## Methods

### backup()

> **backup**(): `Promise`\<[`BackupData`](../../BaseCacheProvider/interfaces/BackupData.md)\>

Defined in: [src/providers/BaseCacheProvider.ts:175](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/providers/BaseCacheProvider.ts#L175)

Backup cache configuration and state (optional)

#### Returns

`Promise`\<[`BackupData`](../../BaseCacheProvider/interfaces/BackupData.md)\>

Backup data

#### Inherited from

[`default`](../../BaseCacheProvider/classes/default.md).[`backup`](../../BaseCacheProvider/classes/default.md#backup)

***

### clear()

> **clear**(`pattern?`): `Promise`\<`void`\>

Defined in: [src/providers/RedisCacheProvider.ts:155](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/providers/RedisCacheProvider.ts#L155)

Clear cache entries

#### Parameters

##### pattern?

`string`

Optional pattern to match keys

#### Returns

`Promise`\<`void`\>

#### Overrides

[`default`](../../BaseCacheProvider/classes/default.md).[`clear`](../../BaseCacheProvider/classes/default.md#clear)

***

### close()

> **close**(): `Promise`\<`void`\>

Defined in: [src/providers/RedisCacheProvider.ts:199](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/providers/RedisCacheProvider.ts#L199)

Close/cleanup the cache provider

#### Returns

`Promise`\<`void`\>

#### Overrides

[`default`](../../BaseCacheProvider/classes/default.md).[`close`](../../BaseCacheProvider/classes/default.md#close)

***

### del()

> **del**(`keys`): `Promise`\<`void`\>

Defined in: [src/providers/RedisCacheProvider.ts:142](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/providers/RedisCacheProvider.ts#L142)

Delete one or more keys from the cache

#### Parameters

##### keys

Single key or array of keys to delete

`string` | `string`[]

#### Returns

`Promise`\<`void`\>

#### Overrides

[`default`](../../BaseCacheProvider/classes/default.md).[`del`](../../BaseCacheProvider/classes/default.md#del)

***

### get()

> **get**\<`T`\>(`key`): `Promise`\<`T`\>

Defined in: [src/providers/RedisCacheProvider.ts:107](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/providers/RedisCacheProvider.ts#L107)

Get a value from the cache

#### Type Parameters

##### T

`T` = `any`

#### Parameters

##### key

`string`

The cache key

#### Returns

`Promise`\<`T`\>

The cached value or undefined if not found

#### Overrides

[`default`](../../BaseCacheProvider/classes/default.md).[`get`](../../BaseCacheProvider/classes/default.md#get)

***

### getProviderInfo()

> **getProviderInfo**(): [`ProviderInfo`](../../BaseCacheProvider/interfaces/ProviderInfo.md)

Defined in: [src/providers/RedisCacheProvider.ts:92](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/providers/RedisCacheProvider.ts#L92)

Get provider information

#### Returns

[`ProviderInfo`](../../BaseCacheProvider/interfaces/ProviderInfo.md)

Provider metadata

#### Overrides

[`default`](../../BaseCacheProvider/classes/default.md).[`getProviderInfo`](../../BaseCacheProvider/classes/default.md#getproviderinfo)

***

### initialize()

> **initialize**(): `Promise`\<`void`\>

Defined in: [src/providers/RedisCacheProvider.ts:52](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/providers/RedisCacheProvider.ts#L52)

Initialize the Redis provider

#### Returns

`Promise`\<`void`\>

#### Overrides

[`default`](../../BaseCacheProvider/classes/default.md).[`initialize`](../../BaseCacheProvider/classes/default.md#initialize)

***

### isHealthy()

> **isHealthy**(): `Promise`\<`boolean`\>

Defined in: [src/providers/RedisCacheProvider.ts:183](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/providers/RedisCacheProvider.ts#L183)

Check if the cache provider is healthy/connected

#### Returns

`Promise`\<`boolean`\>

True if healthy

#### Overrides

[`default`](../../BaseCacheProvider/classes/default.md).[`isHealthy`](../../BaseCacheProvider/classes/default.md#ishealthy)

***

### keys()

> **keys**(`pattern?`): `Promise`\<`string`[]\>

Defined in: [src/providers/RedisCacheProvider.ts:165](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/providers/RedisCacheProvider.ts#L165)

Get keys matching a pattern

#### Parameters

##### pattern?

`string` = `'*'`

Pattern to match

#### Returns

`Promise`\<`string`[]\>

Array of matching keys

#### Overrides

[`default`](../../BaseCacheProvider/classes/default.md).[`keys`](../../BaseCacheProvider/classes/default.md#keys)

***

### restore()

> **restore**(`backupData`): `Promise`\<`void`\>

Defined in: [src/providers/BaseCacheProvider.ts:188](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/providers/BaseCacheProvider.ts#L188)

Restore cache from backup (optional)

#### Parameters

##### backupData

[`BackupData`](../../BaseCacheProvider/interfaces/BackupData.md)

Backup data

#### Returns

`Promise`\<`void`\>

#### Inherited from

[`default`](../../BaseCacheProvider/classes/default.md).[`restore`](../../BaseCacheProvider/classes/default.md#restore)

***

### set()

> **set**\<`T`\>(`key`, `value`, `ttlSec?`): `Promise`\<`void`\>

Defined in: [src/providers/RedisCacheProvider.ts:125](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/providers/RedisCacheProvider.ts#L125)

Set a value in the cache

#### Type Parameters

##### T

`T` = `any`

#### Parameters

##### key

`string`

The cache key

##### value

`T`

The value to cache

##### ttlSec?

`number`

Time to live in seconds

#### Returns

`Promise`\<`void`\>

#### Overrides

[`default`](../../BaseCacheProvider/classes/default.md).[`set`](../../BaseCacheProvider/classes/default.md#set)

***

### stats()

> **stats**(): `Promise`\<[`CacheStats`](../../BaseCacheProvider/interfaces/CacheStats.md)\>

Defined in: [src/providers/RedisCacheProvider.ts:174](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/providers/RedisCacheProvider.ts#L174)

Get cache statistics

#### Returns

`Promise`\<[`CacheStats`](../../BaseCacheProvider/interfaces/CacheStats.md)\>

Cache statistics

#### Overrides

[`default`](../../BaseCacheProvider/classes/default.md).[`stats`](../../BaseCacheProvider/classes/default.md#stats)
