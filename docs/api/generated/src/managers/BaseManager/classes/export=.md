[**amdWiki API v1.5.0**](../../../../README.md)

***

[amdWiki API](../../../../README.md) / [src/managers/BaseManager](../README.md) / export=

# Abstract Class: export=

Defined in: [src/managers/BaseManager.js:17](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/managers/BaseManager.js#L17)

Base Manager class - All managers should extend this

Following JSPWiki's modular manager pattern, this abstract base class
provides common functionality for all managers including initialization,
lifecycle management, and backup/restore operations.

 BaseManager

## See

WikiEngine for the main engine

## Extended by

- [`export=`](../../ACLManager/classes/export=.md)
- [`export=`](../../AttachmentManager/classes/export=.md)
- [`export=`](../../AuditManager/classes/export=.md)
- [`export=`](../../BackupManager/classes/export=.md)
- [`export=`](../../CacheManager/classes/export=.md)
- [`export=`](../../ExportManager/classes/export=.md)
- [`export=`](../../NotificationManager/classes/export=.md)
- [`export=`](../../PageManager/classes/export=.md)
- [`export=`](../../PageManager.legacy/classes/export=.md)
- [`export=`](../../PageManagerUuid/classes/export=.md)
- [`export=`](../../PluginManager/classes/export=.md)
- [`export=`](../../PolicyEvaluator/classes/export=.md)
- [`export=`](../../PolicyManager/classes/export=.md)
- [`export=`](../../PolicyValidator/classes/export=.md)
- [`export=`](../../RenderingManager/classes/export=.md)
- [`export=`](../../SchemaManager/classes/export=.md)
- [`export=`](../../SearchManager/classes/export=.md)
- [`export=`](../../TemplateManager/classes/export=.md)
- [`export=`](../../UserManager/classes/export=.md)
- [`export=`](../../ValidationManager/classes/export=.md)
- [`export=`](../../VariableManager/classes/export=.md)
- [`export=`](../../../parsers/MarkupParser/classes/export=.md)

## Constructors

### Constructor

> **new export=**(`engine`): `BaseManager`

Defined in: [src/managers/BaseManager.js:32](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/managers/BaseManager.js#L32)

Creates a new BaseManager instance

#### Parameters

##### engine

`WikiEngine`

The wiki engine instance

#### Returns

`BaseManager`

#### Example

```ts
class MyManager extends BaseManager {
  constructor(engine) {
    super(engine);
    this.myData = new Map();
  }
}
```

## Properties

### config

> **config**: `any`

Defined in: [src/managers/BaseManager.js:55](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/managers/BaseManager.js#L55)

Configuration object passed during initialization

***

### engine

> **engine**: `WikiEngine`

Defined in: [src/managers/BaseManager.js:33](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/managers/BaseManager.js#L33)

Reference to the wiki engine

***

### initialized

> **initialized**: `boolean`

Defined in: [src/managers/BaseManager.js:34](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/managers/BaseManager.js#L34)

Flag indicating initialization status

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

***

### initialize()

> **initialize**(`config?`): `Promise`\<`void`\>

Defined in: [src/managers/BaseManager.js:54](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/managers/BaseManager.js#L54)

Initialize the manager with configuration

Override this method in subclasses to perform initialization logic.
Always call super.initialize() first in overridden implementations.

#### Parameters

##### config?

`any` = `{}`

Configuration object

#### Returns

`Promise`\<`void`\>

#### Async

#### Example

```ts
async initialize(config = {}) {
  await super.initialize(config);
  // Your initialization logic here
  console.log('MyManager initialized');
}
```

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

***

### shutdown()

> **shutdown**(): `Promise`\<`void`\>

Defined in: [src/managers/BaseManager.js:101](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/managers/BaseManager.js#L101)

Shutdown the manager and cleanup resources

Override this method in subclasses to perform cleanup logic.
Always call super.shutdown() at the end of overridden implementations.

#### Returns

`Promise`\<`void`\>

#### Async

#### Example

```ts
async shutdown() {
  // Your cleanup logic here
  await this.closeConnections();
  await super.shutdown();
}
```
