[**amdWiki API v1.5.0**](../../../../README.md)

***

[amdWiki API](../../../../README.md) / [src/managers/PolicyManager](../README.md) / export=

# Class: export=

Defined in: [src/managers/PolicyManager.js:8](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/managers/PolicyManager.js#L8)

PolicyManager - Manages the lifecycle of access control policies.
It loads, stores, and provides access to all defined policies.

## Extends

- [`export=`](../../BaseManager/classes/export=.md)

## Constructors

### Constructor

> **new export=**(`engine`): `PolicyManager`

Defined in: [src/managers/PolicyManager.js:9](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/managers/PolicyManager.js#L9)

#### Parameters

##### engine

`any`

#### Returns

`PolicyManager`

#### Overrides

[`export=`](../../BaseManager/classes/export=.md).[`constructor`](../../BaseManager/classes/export=.md#constructor)

## Properties

### config

> **config**: `any`

Defined in: [src/managers/BaseManager.js:55](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/managers/BaseManager.js#L55)

Configuration object passed during initialization

#### Inherited from

[`export=`](../../BaseManager/classes/export=.md).[`config`](../../BaseManager/classes/export=.md#config)

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

### policies

> **policies**: `Map`\<`any`, `any`\>

Defined in: [src/managers/PolicyManager.js:11](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/managers/PolicyManager.js#L11)

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

### getAllPolicies()

> **getAllPolicies**(): `any`[]

Defined in: [src/managers/PolicyManager.js:58](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/managers/PolicyManager.js#L58)

Returns all loaded policies, sorted by priority (descending).

#### Returns

`any`[]

An array of all policy objects.

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

### getPolicy()

> **getPolicy**(`id`): `any`

Defined in: [src/managers/PolicyManager.js:50](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/managers/PolicyManager.js#L50)

Retrieves a policy by its unique ID.

#### Parameters

##### id

`string`

The ID of the policy.

#### Returns

`any`

The policy object, or undefined if not found.

***

### initialize()

> **initialize**(): `Promise`\<`void`\>

Defined in: [src/managers/PolicyManager.js:17](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/managers/PolicyManager.js#L17)

Initializes the PolicyManager by loading policies from the ConfigurationManager.

#### Returns

`Promise`\<`void`\>

#### Overrides

[`export=`](../../BaseManager/classes/export=.md).[`initialize`](../../BaseManager/classes/export=.md#initialize)

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

#### Inherited from

[`export=`](../../BaseManager/classes/export=.md).[`shutdown`](../../BaseManager/classes/export=.md#shutdown)
