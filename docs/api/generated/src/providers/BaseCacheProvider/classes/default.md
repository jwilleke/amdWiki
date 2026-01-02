[**amdWiki API v1.5.0**](../../../../README.md)

***

[amdWiki API](../../../../README.md) / [src/providers/BaseCacheProvider](../README.md) / default

# Abstract Class: default

Defined in: [src/providers/BaseCacheProvider.ts:63](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/providers/BaseCacheProvider.ts#L63)

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

Defined in: [src/providers/BaseCacheProvider.ts:80](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/providers/BaseCacheProvider.ts#L80)

Creates a new cache provider

#### Parameters

##### engine

[`WikiEngine`](../../../types/WikiEngine/interfaces/WikiEngine.md)

The wiki engine instance

#### Returns

`BaseCacheProvider`

## Properties

### engine

> `protected` **engine**: [`WikiEngine`](../../../types/WikiEngine/interfaces/WikiEngine.md)

Defined in: [src/providers/BaseCacheProvider.ts:67](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/providers/BaseCacheProvider.ts#L67)

Reference to the wiki engine

***

### initialized

> `protected` **initialized**: `boolean`

Defined in: [src/providers/BaseCacheProvider.ts:72](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/providers/BaseCacheProvider.ts#L72)

Whether provider has been initialized

## Methods

### backup()

> **backup**(): `Promise`\<[`BackupData`](../interfaces/BackupData.md)\>

Defined in: [src/providers/BaseCacheProvider.ts:166](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/providers/BaseCacheProvider.ts#L166)

Backup cache configuration and state (optional)

#### Returns

`Promise`\<[`BackupData`](../interfaces/BackupData.md)\>

Backup data

***

### clear()

> `abstract` **clear**(`pattern?`): `Promise`\<`void`\>

Defined in: [src/providers/BaseCacheProvider.ts:135](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/providers/BaseCacheProvider.ts#L135)

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

Defined in: [src/providers/BaseCacheProvider.ts:160](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/providers/BaseCacheProvider.ts#L160)

Close/cleanup the cache provider

#### Returns

`Promise`\<`void`\>

***

### del()

> `abstract` **del**(`keys`): `Promise`\<`void`\>

Defined in: [src/providers/BaseCacheProvider.ts:128](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/providers/BaseCacheProvider.ts#L128)

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

Defined in: [src/providers/BaseCacheProvider.ts:111](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/providers/BaseCacheProvider.ts#L111)

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

Defined in: [src/providers/BaseCacheProvider.ts:96](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/providers/BaseCacheProvider.ts#L96)

Get provider information

#### Returns

[`ProviderInfo`](../interfaces/ProviderInfo.md)

Provider metadata

***

### initialize()

> `abstract` **initialize**(): `Promise`\<`void`\>

Defined in: [src/providers/BaseCacheProvider.ts:90](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/providers/BaseCacheProvider.ts#L90)

Initialize the cache provider
Implementations should load configuration from ConfigurationManager

#### Returns

`Promise`\<`void`\>

***

### isHealthy()

> `abstract` **isHealthy**(): `Promise`\<`boolean`\>

Defined in: [src/providers/BaseCacheProvider.ts:154](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/providers/BaseCacheProvider.ts#L154)

Check if the cache provider is healthy/connected

#### Returns

`Promise`\<`boolean`\>

True if healthy

***

### keys()

> `abstract` **keys**(`pattern?`): `Promise`\<`string`[]\>

Defined in: [src/providers/BaseCacheProvider.ts:142](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/providers/BaseCacheProvider.ts#L142)

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

> **restore**(`_backupData`): `Promise`\<`void`\>

Defined in: [src/providers/BaseCacheProvider.ts:179](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/providers/BaseCacheProvider.ts#L179)

Restore cache from backup (optional)

#### Parameters

##### \_backupData

[`BackupData`](../interfaces/BackupData.md)

Backup data

#### Returns

`Promise`\<`void`\>

***

### set()

> `abstract` **set**\<`T`\>(`key`, `value`, `ttlSec?`): `Promise`\<`void`\>

Defined in: [src/providers/BaseCacheProvider.ts:121](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/providers/BaseCacheProvider.ts#L121)

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

Defined in: [src/providers/BaseCacheProvider.ts:148](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/providers/BaseCacheProvider.ts#L148)

Get cache statistics

#### Returns

`Promise`\<[`CacheStats`](../interfaces/CacheStats.md)\>

Cache statistics
