[**amdWiki API v1.5.0**](../../../../README.md)

***

[amdWiki API](../../../../README.md) / [src/providers/NodeCacheProvider](../README.md) / default

# Class: default

Defined in: [src/providers/NodeCacheProvider.ts:60](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/providers/NodeCacheProvider.ts#L60)

NodeCacheProvider - In-memory cache provider using node-cache

Provides high-performance in-memory caching with TTL support.
Suitable for single-instance deployments and development.

Configuration keys (all lowercase):
- amdwiki.cache.provider.nodecache.stdttl - Default TTL in seconds
- amdwiki.cache.provider.nodecache.checkperiod - Check for expired keys interval
- amdwiki.cache.provider.nodecache.maxkeys - Maximum number of keys
- amdwiki.cache.provider.nodecache.useclones - Whether to clone objects

## Extends

- [`default`](../../BaseCacheProvider/classes/default.md)

## Constructors

### Constructor

> **new default**(`engine`): `NodeCacheProvider`

Defined in: [src/providers/NodeCacheProvider.ts:65](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/providers/NodeCacheProvider.ts#L65)

#### Parameters

##### engine

[`WikiEngine`](../../../types/WikiEngine/interfaces/WikiEngine.md)

#### Returns

`NodeCacheProvider`

#### Overrides

[`default`](../../BaseCacheProvider/classes/default.md).[`constructor`](../../BaseCacheProvider/classes/default.md#constructor)

## Properties

### engine

> `protected` **engine**: [`WikiEngine`](../../../types/WikiEngine/interfaces/WikiEngine.md)

Defined in: [src/providers/BaseCacheProvider.ts:67](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/providers/BaseCacheProvider.ts#L67)

Reference to the wiki engine instance

#### Inherited from

[`default`](../../BaseCacheProvider/classes/default.md).[`engine`](../../BaseCacheProvider/classes/default.md#engine)

***

### initialized

> `protected` **initialized**: `boolean`

Defined in: [src/providers/BaseCacheProvider.ts:72](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/providers/BaseCacheProvider.ts#L72)

Whether the provider has been initialized

#### Inherited from

[`default`](../../BaseCacheProvider/classes/default.md).[`initialized`](../../BaseCacheProvider/classes/default.md#initialized)

## Methods

### backup()

> **backup**(): `Promise`\<`NodeCacheBackupData`\>

Defined in: [src/providers/NodeCacheProvider.ts:337](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/providers/NodeCacheProvider.ts#L337)

Backup cache configuration and statistics

#### Returns

`Promise`\<`NodeCacheBackupData`\>

Backup data

#### Overrides

[`default`](../../BaseCacheProvider/classes/default.md).[`backup`](../../BaseCacheProvider/classes/default.md#backup)

***

### clear()

> **clear**(`pattern?`): `Promise`\<`void`\>

Defined in: [src/providers/NodeCacheProvider.ts:217](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/providers/NodeCacheProvider.ts#L217)

Clear cache entries

#### Parameters

##### pattern?

`string`

Optional pattern to match keys (e.g., 'user:*')

#### Returns

`Promise`\<`void`\>

#### Overrides

[`default`](../../BaseCacheProvider/classes/default.md).[`clear`](../../BaseCacheProvider/classes/default.md#clear)

***

### close()

> **close**(): `Promise`\<`void`\>

Defined in: [src/providers/NodeCacheProvider.ts:318](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/providers/NodeCacheProvider.ts#L318)

Close/cleanup the cache provider

#### Returns

`Promise`\<`void`\>

#### Overrides

[`default`](../../BaseCacheProvider/classes/default.md).[`close`](../../BaseCacheProvider/classes/default.md#close)

***

### del()

> **del**(`keys`): `Promise`\<`void`\>

Defined in: [src/providers/NodeCacheProvider.ts:198](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/providers/NodeCacheProvider.ts#L198)

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

Defined in: [src/providers/NodeCacheProvider.ts:160](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/providers/NodeCacheProvider.ts#L160)

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

### getNodeCache()

> **getNodeCache**(): `NodeCache`

Defined in: [src/providers/NodeCacheProvider.ts:351](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/providers/NodeCacheProvider.ts#L351)

Get the underlying node-cache instance (for advanced usage)

#### Returns

`NodeCache`

The node-cache instance

***

### getProviderInfo()

> **getProviderInfo**(): [`ProviderInfo`](../../BaseCacheProvider/interfaces/ProviderInfo.md)

Defined in: [src/providers/NodeCacheProvider.ts:144](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/providers/NodeCacheProvider.ts#L144)

Get provider information

#### Returns

[`ProviderInfo`](../../BaseCacheProvider/interfaces/ProviderInfo.md)

Provider metadata

#### Overrides

[`default`](../../BaseCacheProvider/classes/default.md).[`getProviderInfo`](../../BaseCacheProvider/classes/default.md#getproviderinfo)

***

### initialize()

> **initialize**(): `Promise`\<`void`\>

Defined in: [src/providers/NodeCacheProvider.ts:82](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/providers/NodeCacheProvider.ts#L82)

Initialize the NodeCache provider
Loads configuration from ConfigurationManager

#### Returns

`Promise`\<`void`\>

#### Overrides

[`default`](../../BaseCacheProvider/classes/default.md).[`initialize`](../../BaseCacheProvider/classes/default.md#initialize)

***

### isHealthy()

> **isHealthy**(): `Promise`\<`boolean`\>

Defined in: [src/providers/NodeCacheProvider.ts:300](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/providers/NodeCacheProvider.ts#L300)

Check if the cache provider is healthy/connected

#### Returns

`Promise`\<`boolean`\>

True if healthy

#### Overrides

[`default`](../../BaseCacheProvider/classes/default.md).[`isHealthy`](../../BaseCacheProvider/classes/default.md#ishealthy)

***

### keys()

> **keys**(`pattern?`): `Promise`\<`string`[]\>

Defined in: [src/providers/NodeCacheProvider.ts:240](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/providers/NodeCacheProvider.ts#L240)

Get keys matching a pattern

#### Parameters

##### pattern?

`string` = `'*'`

Pattern to match (e.g., 'user:*' or '*' for all)

#### Returns

`Promise`\<`string`[]\>

Array of matching keys

#### Overrides

[`default`](../../BaseCacheProvider/classes/default.md).[`keys`](../../BaseCacheProvider/classes/default.md#keys)

***

### restore()

> **restore**(`_backupData`): `Promise`\<`void`\>

Defined in: [src/providers/BaseCacheProvider.ts:179](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/providers/BaseCacheProvider.ts#L179)

Restore cache from backup (optional)

#### Parameters

##### \_backupData

[`BackupData`](../../BaseCacheProvider/interfaces/BackupData.md)

Backup data

#### Returns

`Promise`\<`void`\>

#### Inherited from

[`default`](../../BaseCacheProvider/classes/default.md).[`restore`](../../BaseCacheProvider/classes/default.md#restore)

***

### set()

> **set**\<`T`\>(`key`, `value`, `ttlSec?`): `Promise`\<`void`\>

Defined in: [src/providers/NodeCacheProvider.ts:179](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/providers/NodeCacheProvider.ts#L179)

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

Defined in: [src/providers/NodeCacheProvider.ts:265](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/providers/NodeCacheProvider.ts#L265)

Get cache statistics

#### Returns

`Promise`\<[`CacheStats`](../../BaseCacheProvider/interfaces/CacheStats.md)\>

Cache statistics

#### Overrides

[`default`](../../BaseCacheProvider/classes/default.md).[`stats`](../../BaseCacheProvider/classes/default.md#stats)
