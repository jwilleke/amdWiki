[**amdWiki API v1.5.0**](../../../../README.md)

***

[amdWiki API](../../../../README.md) / [src/managers/CacheManager](../README.md) / default

# Class: default

Defined in: [src/managers/CacheManager.ts:83](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/managers/CacheManager.ts#L83)

CacheManager - Centralized cache management for amdWiki

Provides a unified interface for caching across all managers with support for:
- Multiple cache backends via provider pattern (NodeCache, Redis, Null)
- Cache regions (namespaces) for different managers
- Configurable TTL and cache policies
- Statistics and monitoring
- Provider fallback pattern following #102, #104, #105, #106

Configuration (all lowercase):
- amdwiki.cache.enabled - Enable/disable caching
- amdwiki.cache.provider.default - Default provider name
- amdwiki.cache.provider - Active provider name
- amdwiki.cache.defaultttl - Default TTL in seconds
- amdwiki.cache.maxkeys - Maximum cache keys

 CacheManager

## See

[BaseManager](../../BaseManager/classes/default.md) for base functionality

## Example

```ts
const cacheManager = engine.getManager('CacheManager');
const region = cacheManager.getRegion('pages');
region.set('Main', pageData, 3600);
```

## Extends

- [`default`](../../BaseManager/classes/default.md)

## Constructors

### Constructor

> **new default**(`engine`): `CacheManager`

Defined in: [src/managers/CacheManager.ts:98](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/managers/CacheManager.ts#L98)

Creates a new CacheManager instance

#### Parameters

##### engine

[`WikiEngine`](../../../types/WikiEngine/interfaces/WikiEngine.md)

The wiki engine instance

#### Returns

`CacheManager`

#### Overrides

[`default`](../../BaseManager/classes/default.md).[`constructor`](../../BaseManager/classes/default.md#constructor)

## Properties

### config?

> `protected` `optional` **config**: `Record`\<`string`, `any`\>

Defined in: [src/managers/BaseManager.ts:63](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/managers/BaseManager.ts#L63)

Configuration passed during initialization

#### Inherited from

[`default`](../../BaseManager/classes/default.md).[`config`](../../BaseManager/classes/default.md#config)

***

### engine

> `protected` **engine**: [`WikiEngine`](../../../types/WikiEngine/interfaces/WikiEngine.md)

Defined in: [src/managers/BaseManager.ts:56](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/managers/BaseManager.ts#L56)

Reference to the wiki engine

#### Inherited from

[`default`](../../BaseManager/classes/default.md).[`engine`](../../BaseManager/classes/default.md#engine)

***

### initialized

> `protected` **initialized**: `boolean`

Defined in: [src/managers/BaseManager.ts:59](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/managers/BaseManager.ts#L59)

Initialization status flag

#### Inherited from

[`default`](../../BaseManager/classes/default.md).[`initialized`](../../BaseManager/classes/default.md#initialized)

## Methods

### backup()

> **backup**(): `Promise`\<[`BackupData`](../../BaseManager/interfaces/BackupData.md)\>

Defined in: [src/managers/BaseManager.ts:168](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/managers/BaseManager.ts#L168)

Backup manager data

MUST be overridden by all managers that manage persistent data.
Default implementation returns an empty backup object.

#### Returns

`Promise`\<[`BackupData`](../../BaseManager/interfaces/BackupData.md)\>

Backup data object containing all manager state

#### Throws

If backup operation fails

#### Example

```ts
async backup(): Promise<BackupData> {
  return {
    managerName: this.constructor.name,
    timestamp: new Date().toISOString(),
    data: {
      users: Array.from(this.users.values()),
      settings: this.settings
    }
  };
}
```

#### Inherited from

[`default`](../../BaseManager/classes/default.md).[`backup`](../../BaseManager/classes/default.md#backup)

***

### clear()

> **clear**(`region?`, `pattern?`): `Promise`\<`void`\>

Defined in: [src/managers/CacheManager.ts:291](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/managers/CacheManager.ts#L291)

Clear cache entries

#### Parameters

##### region?

`string`

Optional region to clear (if not specified, clears all)

##### pattern?

`string`

Optional pattern to match keys

#### Returns

`Promise`\<`void`\>

***

### del()

> **del**(`keys`): `Promise`\<`void`\>

Defined in: [src/managers/CacheManager.ts:281](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/managers/CacheManager.ts#L281)

Delete one or more keys from the cache

#### Parameters

##### keys

Single key or array of keys to delete

`string` | `string`[]

#### Returns

`Promise`\<`void`\>

***

### flushAll()

> **flushAll**(): `Promise`\<`void`\>

Defined in: [src/managers/CacheManager.ts:369](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/managers/CacheManager.ts#L369)

Flush all caches (dangerous operation)

#### Returns

`Promise`\<`void`\>

***

### get()

> **get**(`key`): `Promise`\<`unknown`\>

Defined in: [src/managers/CacheManager.ts:259](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/managers/CacheManager.ts#L259)

Get a value from the cache (global scope)

#### Parameters

##### key

`string`

The cache key

#### Returns

`Promise`\<`unknown`\>

The cached value or undefined if not found

***

### getCacheForManager()

> `static` **getCacheForManager**(`engine`, `region?`): [`default`](../../../cache/RegionCache/classes/default.md)

Defined in: [src/managers/CacheManager.ts:400](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/managers/CacheManager.ts#L400)

Helper method to add cache support to BaseManager
Can be called from any manager to get a cache region

#### Parameters

##### engine

`any`

WikiEngine instance

##### region?

`string`

Region name (defaults to calling class name)

#### Returns

[`default`](../../../cache/RegionCache/classes/default.md)

Cache instance scoped to the region

***

### getConfig()

> **getConfig**(): [`CacheConfig`](../interfaces/CacheConfig.md)

Defined in: [src/managers/CacheManager.ts:348](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/managers/CacheManager.ts#L348)

Get cache configuration

#### Returns

[`CacheConfig`](../interfaces/CacheConfig.md)

Cache configuration

***

### getEngine()

> **getEngine**(): [`WikiEngine`](../../../types/WikiEngine/interfaces/WikiEngine.md)

Defined in: [src/managers/BaseManager.ts:126](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/managers/BaseManager.ts#L126)

Get the wiki engine instance

#### Returns

[`WikiEngine`](../../../types/WikiEngine/interfaces/WikiEngine.md)

The wiki engine instance

#### Example

```ts
const config = this.getEngine().getConfig();
```

#### Inherited from

[`default`](../../BaseManager/classes/default.md).[`getEngine`](../../BaseManager/classes/default.md#getengine)

***

### getRegions()

> **getRegions**(): `string`[]

Defined in: [src/managers/CacheManager.ts:361](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/managers/CacheManager.ts#L361)

Get all active regions

#### Returns

`string`[]

Array of region names

***

### initialize()

> **initialize**(`config?`): `Promise`\<`void`\>

Defined in: [src/managers/CacheManager.ts:114](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/managers/CacheManager.ts#L114)

Initialize the CacheManager and load the configured provider

#### Parameters

##### config?

`Record`\<`string`, `unknown`\> = `{}`

Configuration object (unused, reads from ConfigurationManager)

#### Returns

`Promise`\<`void`\>

#### Async

#### Throws

If ConfigurationManager is not available

#### Overrides

[`default`](../../BaseManager/classes/default.md).[`initialize`](../../BaseManager/classes/default.md#initialize)

***

### isHealthy()

> **isHealthy**(): `Promise`\<`boolean`\>

Defined in: [src/managers/CacheManager.ts:340](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/managers/CacheManager.ts#L340)

Check if the cache is healthy

#### Returns

`Promise`\<`boolean`\>

True if cache is healthy

***

### isInitialized()

> **isInitialized**(): `boolean`

Defined in: [src/managers/BaseManager.ts:114](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/managers/BaseManager.ts#L114)

Check if manager has been initialized

#### Returns

`boolean`

True if manager is initialized

#### Example

```ts
if (manager.isInitialized()) {
  // Safe to use manager
}
```

#### Inherited from

[`default`](../../BaseManager/classes/default.md).[`isInitialized`](../../BaseManager/classes/default.md#isinitialized)

***

### keys()

> **keys**(`pattern?`): `Promise`\<`string`[]\>

Defined in: [src/managers/CacheManager.ts:305](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/managers/CacheManager.ts#L305)

Get keys matching a pattern

#### Parameters

##### pattern?

`string` = `'*'`

Pattern to match

#### Returns

`Promise`\<`string`[]\>

Array of matching keys

***

### region()

> **region**(`region`): [`default`](../../../cache/RegionCache/classes/default.md)

Defined in: [src/managers/CacheManager.ts:247](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/managers/CacheManager.ts#L247)

Get a cache region for a specific namespace

#### Parameters

##### region

`string`

Region name (typically manager name)

#### Returns

[`default`](../../../cache/RegionCache/classes/default.md)

Cache instance scoped to the region

***

### restore()

> **restore**(`backupData`): `Promise`\<`void`\>

Defined in: [src/managers/BaseManager.ts:196](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/managers/BaseManager.ts#L196)

Restore manager data from backup

MUST be overridden by all managers that manage persistent data.
Default implementation only validates that backup data is provided.

#### Parameters

##### backupData

[`BackupData`](../../BaseManager/interfaces/BackupData.md)

Backup data object from backup() method

#### Returns

`Promise`\<`void`\>

#### Throws

If restore operation fails or backup data is missing

#### Example

```ts
async restore(backupData: BackupData): Promise<void> {
  if (!backupData || !backupData.data) {
    throw new Error('Invalid backup data');
  }
  this.users = new Map(backupData.data.users.map(u => [u.id, u]));
  this.settings = backupData.data.settings;
}
```

#### Inherited from

[`default`](../../BaseManager/classes/default.md).[`restore`](../../BaseManager/classes/default.md#restore)

***

### set()

> **set**(`key`, `value`, `options?`): `Promise`\<`void`\>

Defined in: [src/managers/CacheManager.ts:271](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/managers/CacheManager.ts#L271)

Set a value in the cache (global scope)

#### Parameters

##### key

`string`

The cache key

##### value

`unknown`

The value to cache

##### options?

[`CacheOptions`](../interfaces/CacheOptions.md) = `{}`

Cache options

#### Returns

`Promise`\<`void`\>

***

### shutdown()

> **shutdown**(): `Promise`\<`void`\>

Defined in: [src/managers/CacheManager.ts:379](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/managers/CacheManager.ts#L379)

Close and cleanup cache resources

#### Returns

`Promise`\<`void`\>

#### Overrides

[`default`](../../BaseManager/classes/default.md).[`shutdown`](../../BaseManager/classes/default.md#shutdown)

***

### stats()

> **stats**(`region?`): `Promise`\<[`CacheStats`](../interfaces/CacheStats.md)\>

Defined in: [src/managers/CacheManager.ts:314](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/managers/CacheManager.ts#L314)

Get cache statistics

#### Parameters

##### region?

`string`

Optional region to get stats for

#### Returns

`Promise`\<[`CacheStats`](../interfaces/CacheStats.md)\>

Cache statistics
