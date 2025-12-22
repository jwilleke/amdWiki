[**amdWiki API v1.5.0**](../../../../README.md)

***

[amdWiki API](../../../../README.md) / [src/managers/CacheManager](../README.md) / export=

# Class: export=

Defined in: [src/managers/CacheManager.js:37](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/managers/CacheManager.js#L37)

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

[BaseManager](../../BaseManager/classes/export=.md) for base functionality

## Example

```ts
const cacheManager = engine.getManager('CacheManager');
const region = cacheManager.getRegion('pages');
region.set('Main', pageData, 3600);
```

## Extends

- [`export=`](../../BaseManager/classes/export=.md)

## Constructors

### Constructor

> **new export=**(`engine`): `CacheManager`

Defined in: [src/managers/CacheManager.js:44](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/managers/CacheManager.js#L44)

Creates a new CacheManager instance

#### Parameters

##### engine

`WikiEngine`

The wiki engine instance

#### Returns

`CacheManager`

#### Overrides

[`export=`](../../BaseManager/classes/export=.md).[`constructor`](../../BaseManager/classes/export=.md#constructor)

## Properties

### checkPeriod

> **checkPeriod**: `any`

Defined in: [src/managers/CacheManager.js:94](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/managers/CacheManager.js#L94)

***

### config

> **config**: `any`

Defined in: [src/managers/BaseManager.js:55](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/managers/BaseManager.js#L55)

Configuration object passed during initialization

#### Inherited from

[`export=`](../../BaseManager/classes/export=.md).[`config`](../../BaseManager/classes/export=.md#config)

***

### defaultTTL

> **defaultTTL**: `any`

Defined in: [src/managers/CacheManager.js:92](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/managers/CacheManager.js#L92)

***

### engine

> **engine**: `WikiEngine`

Defined in: [src/managers/BaseManager.js:33](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/managers/BaseManager.js#L33)

Reference to the wiki engine

#### Inherited from

[`export=`](../../BaseManager/classes/export=.md).[`engine`](../../BaseManager/classes/export=.md#engine)

***

### initialized

> **initialized**: `boolean`

Defined in: [src/managers/BaseManager.js:34](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/managers/BaseManager.js#L34)

Flag indicating initialization status

#### Inherited from

[`export=`](../../BaseManager/classes/export=.md).[`initialized`](../../BaseManager/classes/export=.md#initialized)

***

### maxKeys

> **maxKeys**: `any`

Defined in: [src/managers/CacheManager.js:93](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/managers/CacheManager.js#L93)

***

### provider

> **provider**: `any`

Defined in: [src/managers/CacheManager.js:46](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/managers/CacheManager.js#L46)

The active cache provider

***

### providerClass

> **providerClass**: `string`

Defined in: [src/managers/CacheManager.js:47](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/managers/CacheManager.js#L47)

The class name of the loaded provider

***

### regions

> **regions**: `Map`\<`any`, `any`\>

Defined in: [src/managers/CacheManager.js:48](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/managers/CacheManager.js#L48)

Cache regions by name

## Methods

### backup()

> **backup**(): `Promise`\<`any`\>

Defined in: [src/managers/BaseManager.js:130](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/managers/BaseManager.js#L130)

Backup manager data

MUST be overridden by all managers that manage persistent data.
Default implementation returns an empty backup object.

#### Returns

`Promise`\<`any`\>

Backup data object containing all manager state

#### Async

#### Throws

If backup operation fails

#### Example

```ts
async backup() {
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

[`export=`](../../BaseManager/classes/export=.md).[`backup`](../../BaseManager/classes/export=.md#backup)

***

### clear()

> **clear**(`region?`, `pattern?`): `Promise`\<`void`\>

Defined in: [src/managers/CacheManager.js:223](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/managers/CacheManager.js#L223)

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

Defined in: [src/managers/CacheManager.js:213](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/managers/CacheManager.js#L213)

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

Defined in: [src/managers/CacheManager.js:300](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/managers/CacheManager.js#L300)

Flush all caches (dangerous operation)

#### Returns

`Promise`\<`void`\>

***

### get()

> **get**(`key`): `Promise`\<`any`\>

Defined in: [src/managers/CacheManager.js:191](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/managers/CacheManager.js#L191)

Get a value from the cache (global scope)

#### Parameters

##### key

`string`

The cache key

#### Returns

`Promise`\<`any`\>

The cached value or undefined if not found

***

### getCacheForManager()

> `static` **getCacheForManager**(`engine`, `region?`): [`export=`](../../../cache/RegionCache/classes/export=.md)

Defined in: [src/managers/CacheManager.js:330](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/managers/CacheManager.js#L330)

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

[`export=`](../../../cache/RegionCache/classes/export=.md)

Cache instance scoped to the region

***

### getConfig()

> **getConfig**(): `any`

Defined in: [src/managers/CacheManager.js:279](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/managers/CacheManager.js#L279)

Get cache configuration

#### Returns

`any`

Cache configuration

***

### getEngine()

> **getEngine**(): `WikiEngine`

Defined in: [src/managers/BaseManager.js:81](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/managers/BaseManager.js#L81)

Get the wiki engine instance

#### Returns

`WikiEngine`

The wiki engine instance

#### Example

```ts
const config = this.getEngine().getConfig();
```

#### Inherited from

[`export=`](../../BaseManager/classes/export=.md).[`getEngine`](../../BaseManager/classes/export=.md#getengine)

***

### getRegions()

> **getRegions**(): `string`[]

Defined in: [src/managers/CacheManager.js:292](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/managers/CacheManager.js#L292)

Get all active regions

#### Returns

`string`[]

Array of region names

***

### initialize()

> **initialize**(`config?`): `Promise`\<`void`\>

Defined in: [src/managers/CacheManager.js:59](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/managers/CacheManager.js#L59)

Initialize the CacheManager and load the configured provider

#### Parameters

##### config?

`any` = `{}`

Configuration object (unused, reads from ConfigurationManager)

#### Returns

`Promise`\<`void`\>

#### Async

#### Throws

If ConfigurationManager is not available

#### Overrides

[`export=`](../../BaseManager/classes/export=.md).[`initialize`](../../BaseManager/classes/export=.md#initialize)

***

### isHealthy()

> **isHealthy**(): `Promise`\<`boolean`\>

Defined in: [src/managers/CacheManager.js:271](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/managers/CacheManager.js#L271)

Check if the cache is healthy

#### Returns

`Promise`\<`boolean`\>

True if cache is healthy

***

### isInitialized()

> **isInitialized**(): `boolean`

Defined in: [src/managers/BaseManager.js:69](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/managers/BaseManager.js#L69)

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

[`export=`](../../BaseManager/classes/export=.md).[`isInitialized`](../../BaseManager/classes/export=.md#isinitialized)

***

### keys()

> **keys**(`pattern?`): `Promise`\<`string`[]\>

Defined in: [src/managers/CacheManager.js:237](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/managers/CacheManager.js#L237)

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

> **region**(`region`): [`export=`](../../../cache/RegionCache/classes/export=.md)

Defined in: [src/managers/CacheManager.js:179](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/managers/CacheManager.js#L179)

Get a cache region for a specific namespace

#### Parameters

##### region

`string`

Region name (typically manager name)

#### Returns

[`export=`](../../../cache/RegionCache/classes/export=.md)

Cache instance scoped to the region

***

### restore()

> **restore**(`backupData`): `Promise`\<`void`\>

Defined in: [src/managers/BaseManager.js:163](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/managers/BaseManager.js#L163)

Restore manager data from backup

MUST be overridden by all managers that manage persistent data.
Default implementation only validates that backup data is provided.

#### Parameters

##### backupData

Backup data object from backup() method

###### data

`any`

Manager-specific backup data

###### managerName

`string`

Name of the manager

###### timestamp

`string`

ISO timestamp of backup

#### Returns

`Promise`\<`void`\>

#### Async

#### Throws

If restore operation fails or backup data is missing

#### Example

```ts
async restore(backupData) {
  if (!backupData || !backupData.data) {
    throw new Error('Invalid backup data');
  }
  this.users = new Map(backupData.data.users.map(u => [u.id, u]));
  this.settings = backupData.data.settings;
}
```

#### Inherited from

[`export=`](../../BaseManager/classes/export=.md).[`restore`](../../BaseManager/classes/export=.md#restore)

***

### set()

> **set**(`key`, `value`, `options?`): `Promise`\<`void`\>

Defined in: [src/managers/CacheManager.js:203](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/managers/CacheManager.js#L203)

Set a value in the cache (global scope)

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

### shutdown()

> **shutdown**(): `Promise`\<`void`\>

Defined in: [src/managers/CacheManager.js:310](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/managers/CacheManager.js#L310)

Close and cleanup cache resources

#### Returns

`Promise`\<`void`\>

#### Overrides

[`export=`](../../BaseManager/classes/export=.md).[`shutdown`](../../BaseManager/classes/export=.md#shutdown)

***

### stats()

> **stats**(`region?`): `Promise`\<`any`\>

Defined in: [src/managers/CacheManager.js:246](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/managers/CacheManager.js#L246)

Get cache statistics

#### Parameters

##### region?

`string`

Optional region to get stats for

#### Returns

`Promise`\<`any`\>

Cache statistics
