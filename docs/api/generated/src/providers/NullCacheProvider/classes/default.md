[**amdWiki API v1.5.0**](../../../../README.md)

***

[amdWiki API](../../../../README.md) / [src/providers/NullCacheProvider](../README.md) / default

# Class: default

Defined in: [src/providers/NullCacheProvider.ts:18](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/providers/NullCacheProvider.ts#L18)

NullCacheProvider - No-op cache provider

Used when caching is disabled or for testing.
All cache operations are no-ops that return immediately.

## Extends

- [`default`](../../BaseCacheProvider/classes/default.md)

## Constructors

### Constructor

> **new default**(`engine`): `NullCacheProvider`

Defined in: [src/providers/NullCacheProvider.ts:19](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/providers/NullCacheProvider.ts#L19)

#### Parameters

##### engine

`WikiEngine`

#### Returns

`NullCacheProvider`

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

Defined in: [src/providers/NullCacheProvider.ts:80](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/providers/NullCacheProvider.ts#L80)

Clear cache entries (no-op)

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

Defined in: [src/providers/NullCacheProvider.ts:122](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/providers/NullCacheProvider.ts#L122)

Close/cleanup the cache provider (no-op)

#### Returns

`Promise`\<`void`\>

#### Overrides

[`default`](../../BaseCacheProvider/classes/default.md).[`close`](../../BaseCacheProvider/classes/default.md#close)

***

### del()

> **del**(`keys`): `Promise`\<`void`\>

Defined in: [src/providers/NullCacheProvider.ts:71](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/providers/NullCacheProvider.ts#L71)

Delete one or more keys from the cache (no-op)

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

Defined in: [src/providers/NullCacheProvider.ts:50](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/providers/NullCacheProvider.ts#L50)

Get a value from the cache (always returns undefined)

#### Type Parameters

##### T

`T` = `any`

#### Parameters

##### key

`string`

The cache key

#### Returns

`Promise`\<`T`\>

Always undefined

#### Overrides

[`default`](../../BaseCacheProvider/classes/default.md).[`get`](../../BaseCacheProvider/classes/default.md#get)

***

### getProviderInfo()

> **getProviderInfo**(): [`ProviderInfo`](../../BaseCacheProvider/interfaces/ProviderInfo.md)

Defined in: [src/providers/NullCacheProvider.ts:35](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/providers/NullCacheProvider.ts#L35)

Get provider information

#### Returns

[`ProviderInfo`](../../BaseCacheProvider/interfaces/ProviderInfo.md)

Provider metadata

#### Overrides

[`default`](../../BaseCacheProvider/classes/default.md).[`getProviderInfo`](../../BaseCacheProvider/classes/default.md#getproviderinfo)

***

### initialize()

> **initialize**(): `Promise`\<`void`\>

Defined in: [src/providers/NullCacheProvider.ts:27](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/providers/NullCacheProvider.ts#L27)

Initialize the null cache provider (no-op)

#### Returns

`Promise`\<`void`\>

#### Overrides

[`default`](../../BaseCacheProvider/classes/default.md).[`initialize`](../../BaseCacheProvider/classes/default.md#initialize)

***

### isHealthy()

> **isHealthy**(): `Promise`\<`boolean`\>

Defined in: [src/providers/NullCacheProvider.ts:114](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/providers/NullCacheProvider.ts#L114)

Check if the cache provider is healthy (always true)

#### Returns

`Promise`\<`boolean`\>

Always true

#### Overrides

[`default`](../../BaseCacheProvider/classes/default.md).[`isHealthy`](../../BaseCacheProvider/classes/default.md#ishealthy)

***

### keys()

> **keys**(`pattern?`): `Promise`\<`string`[]\>

Defined in: [src/providers/NullCacheProvider.ts:89](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/providers/NullCacheProvider.ts#L89)

Get keys matching a pattern (always returns empty array)

#### Parameters

##### pattern?

`string` = `'*'`

Pattern to match

#### Returns

`Promise`\<`string`[]\>

Empty array

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

Defined in: [src/providers/NullCacheProvider.ts:62](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/providers/NullCacheProvider.ts#L62)

Set a value in the cache (no-op)

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

Defined in: [src/providers/NullCacheProvider.ts:97](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/providers/NullCacheProvider.ts#L97)

Get cache statistics (all zeros)

#### Returns

`Promise`\<[`CacheStats`](../../BaseCacheProvider/interfaces/CacheStats.md)\>

Cache statistics with all zeros

#### Overrides

[`default`](../../BaseCacheProvider/classes/default.md).[`stats`](../../BaseCacheProvider/classes/default.md#stats)
