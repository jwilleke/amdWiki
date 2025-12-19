[**amdWiki API v1.5.0**](../../../../README.md)

***

[amdWiki API](../../../../README.md) / [src/providers/BaseCacheProvider](../README.md) / default

# Abstract Class: default

Defined in: [src/providers/BaseCacheProvider.ts:72](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/providers/BaseCacheProvider.ts#L72)

BaseCacheProvider - Base class for all cache providers

Provides the interface that all cache providers must implement.
Follows the provider pattern established in AttachmentManager and PageManager.

Cache providers implement different storage backends (node-cache, Redis, etc.)

 BaseCacheProvider

## See

 - NodeCacheProvider for in-memory implementation
 - RedisCacheProvider for Redis implementation
 - CacheManager for usage

## Extended by

- [`default`](../../NodeCacheProvider/classes/default.md)
- [`default`](../../NullCacheProvider/classes/default.md)
- [`default`](../../RedisCacheProvider/classes/default.md)

## Constructors

### Constructor

> **new default**(`engine`): `BaseCacheProvider`

Defined in: [src/providers/BaseCacheProvider.ts:89](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/providers/BaseCacheProvider.ts#L89)

Creates a new cache provider

#### Parameters

##### engine

`WikiEngine`

The wiki engine instance

#### Returns

`BaseCacheProvider`

## Properties

### engine

> `protected` **engine**: `WikiEngine`

Defined in: [src/providers/BaseCacheProvider.ts:76](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/providers/BaseCacheProvider.ts#L76)

Reference to the wiki engine

***

### initialized

> `protected` **initialized**: `boolean`

Defined in: [src/providers/BaseCacheProvider.ts:81](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/providers/BaseCacheProvider.ts#L81)

Whether provider has been initialized

## Methods

### backup()

> **backup**(): `Promise`\<[`BackupData`](../interfaces/BackupData.md)\>

Defined in: [src/providers/BaseCacheProvider.ts:175](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/providers/BaseCacheProvider.ts#L175)

Backup cache configuration and state (optional)

#### Returns

`Promise`\<[`BackupData`](../interfaces/BackupData.md)\>

Backup data

***

### clear()

> `abstract` **clear**(`pattern?`): `Promise`\<`void`\>

Defined in: [src/providers/BaseCacheProvider.ts:144](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/providers/BaseCacheProvider.ts#L144)

Clear cache entries

#### Parameters

##### pattern?

`string`

Optional pattern to match keys (e.g., 'user:*')

#### Returns

`Promise`\<`void`\>

***

### close()

> `abstract` **close**(): `Promise`\<`void`\>

Defined in: [src/providers/BaseCacheProvider.ts:169](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/providers/BaseCacheProvider.ts#L169)

Close/cleanup the cache provider

#### Returns

`Promise`\<`void`\>

***

### del()

> `abstract` **del**(`keys`): `Promise`\<`void`\>

Defined in: [src/providers/BaseCacheProvider.ts:137](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/providers/BaseCacheProvider.ts#L137)

Delete one or more keys from the cache

#### Parameters

##### keys

Single key or array of keys to delete

`string` | `string`[]

#### Returns

`Promise`\<`void`\>

***

### get()

> `abstract` **get**\<`T`\>(`key`): `Promise`\<`T`\>

Defined in: [src/providers/BaseCacheProvider.ts:120](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/providers/BaseCacheProvider.ts#L120)

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

***

### getProviderInfo()

> **getProviderInfo**(): [`ProviderInfo`](../interfaces/ProviderInfo.md)

Defined in: [src/providers/BaseCacheProvider.ts:105](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/providers/BaseCacheProvider.ts#L105)

Get provider information

#### Returns

[`ProviderInfo`](../interfaces/ProviderInfo.md)

Provider metadata

***

### initialize()

> `abstract` **initialize**(): `Promise`\<`void`\>

Defined in: [src/providers/BaseCacheProvider.ts:99](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/providers/BaseCacheProvider.ts#L99)

Initialize the cache provider
Implementations should load configuration from ConfigurationManager

#### Returns

`Promise`\<`void`\>

***

### isHealthy()

> `abstract` **isHealthy**(): `Promise`\<`boolean`\>

Defined in: [src/providers/BaseCacheProvider.ts:163](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/providers/BaseCacheProvider.ts#L163)

Check if the cache provider is healthy/connected

#### Returns

`Promise`\<`boolean`\>

True if healthy

***

### keys()

> `abstract` **keys**(`pattern?`): `Promise`\<`string`[]\>

Defined in: [src/providers/BaseCacheProvider.ts:151](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/providers/BaseCacheProvider.ts#L151)

Get keys matching a pattern

#### Parameters

##### pattern?

`string`

Pattern to match (e.g., 'user:*' or '*' for all)

#### Returns

`Promise`\<`string`[]\>

Array of matching keys

***

### restore()

> **restore**(`backupData`): `Promise`\<`void`\>

Defined in: [src/providers/BaseCacheProvider.ts:188](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/providers/BaseCacheProvider.ts#L188)

Restore cache from backup (optional)

#### Parameters

##### backupData

[`BackupData`](../interfaces/BackupData.md)

Backup data

#### Returns

`Promise`\<`void`\>

***

### set()

> `abstract` **set**\<`T`\>(`key`, `value`, `ttlSec?`): `Promise`\<`void`\>

Defined in: [src/providers/BaseCacheProvider.ts:130](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/providers/BaseCacheProvider.ts#L130)

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

***

### stats()

> `abstract` **stats**(): `Promise`\<[`CacheStats`](../interfaces/CacheStats.md)\>

Defined in: [src/providers/BaseCacheProvider.ts:157](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/providers/BaseCacheProvider.ts#L157)

Get cache statistics

#### Returns

`Promise`\<[`CacheStats`](../interfaces/CacheStats.md)\>

Cache statistics
