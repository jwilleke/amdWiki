[**amdWiki API v1.5.0**](../../../../README.md)

***

[amdWiki API](../../../../README.md) / [src/managers/VariableManager](../README.md) / default

# Class: default

Defined in: [src/managers/VariableManager.ts:68](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/managers/VariableManager.ts#L68)

VariableManager - Handles the expansion of JSPWiki-style variables

Provides dynamic variable expansion in wiki content. Variables are
placeholders like [{$username}], [{$pageName}] that are replaced with
actual values during rendering based on the current context.

Supported variable categories:
- Application info: appName, version, baseURL
- Page context: pageName
- User context: username, loginStatus, userRoles
- Date/Time: date, time, timestamp, year, month, day
- System info: uptime

 VariableManager

## See

[BaseManager](../../BaseManager/classes/default.md) for base functionality

## Example

```ts
const variableManager = engine.getManager('VariableManager');
const expanded = variableManager.expandVariables('Hello [{$username}]!', context);
// Returns: 'Hello admin!'
```

## Extends

- [`default`](../../BaseManager/classes/default.md)

## Constructors

### Constructor

> **new default**(`engine`): `VariableManager`

Defined in: [src/managers/VariableManager.ts:78](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/managers/VariableManager.ts#L78)

Creates a new VariableManager instance

#### Parameters

##### engine

[`WikiEngine`](../../../types/WikiEngine/interfaces/WikiEngine.md)

The wiki engine instance

#### Returns

`VariableManager`

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

### expandVariables()

> **expandVariables**(`content`, `context?`): `string`

Defined in: [src/managers/VariableManager.ts:272](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/managers/VariableManager.ts#L272)

Expands all variables in a given string of content.

#### Parameters

##### content

`string`

The content to process.

##### context?

[`VariableContext`](../interfaces/VariableContext.md)

The WikiContext for the current rendering operation.

#### Returns

`string`

The content with variables expanded.

***

### getDebugInfo()

> **getDebugInfo**(): [`VariableDebugInfo`](../interfaces/VariableDebugInfo.md)

Defined in: [src/managers/VariableManager.ts:331](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/managers/VariableManager.ts#L331)

Get debug information about registered variables

#### Returns

[`VariableDebugInfo`](../interfaces/VariableDebugInfo.md)

Debug information including system and contextual variables

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

### getVariable()

> **getVariable**(`varName`, `context`): `string`

Defined in: [src/managers/VariableManager.ts:307](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/managers/VariableManager.ts#L307)

Get the value of a specific variable

#### Parameters

##### varName

`string`

The variable name (without brackets/dollar sign)

##### context

[`VariableContext`](../interfaces/VariableContext.md) = `{}`

Optional context for contextual variables

#### Returns

`string`

The variable value

***

### initialize()

> **initialize**(): `Promise`\<`void`\>

Defined in: [src/managers/VariableManager.ts:91](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/managers/VariableManager.ts#L91)

Initialize the VariableManager and register core variables

#### Returns

`Promise`\<`void`\>

#### Async

#### Overrides

[`default`](../../BaseManager/classes/default.md).[`initialize`](../../BaseManager/classes/default.md#initialize)

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

### registerVariable()

> **registerVariable**(`name`, `handler`): `void`

Defined in: [src/managers/VariableManager.ts:259](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/managers/VariableManager.ts#L259)

Registers a new variable handler.

#### Parameters

##### name

`string`

The name of the variable (without brackets/dollar sign).

##### handler

[`VariableHandler`](../type-aliases/VariableHandler.md)

A function that takes the WikiContext and returns the variable's value.

#### Returns

`void`

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

### shutdown()

> **shutdown**(): `Promise`\<`void`\>

Defined in: [src/managers/BaseManager.ts:143](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/managers/BaseManager.ts#L143)

Shutdown the manager and cleanup resources

Override this method in subclasses to perform cleanup logic.
Always call super.shutdown() at the end of overridden implementations.

#### Returns

`Promise`\<`void`\>

#### Example

```ts
async shutdown(): Promise<void> {
  // Your cleanup logic here
  await this.closeConnections();
  await super.shutdown();
}
```

#### Inherited from

[`default`](../../BaseManager/classes/default.md).[`shutdown`](../../BaseManager/classes/default.md#shutdown)
