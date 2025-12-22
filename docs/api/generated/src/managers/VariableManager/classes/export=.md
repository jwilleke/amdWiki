[**amdWiki API v1.5.0**](../../../../README.md)

***

[amdWiki API](../../../../README.md) / [src/managers/VariableManager](../README.md) / export=

# Class: export=

Defined in: [src/managers/VariableManager.js:30](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/managers/VariableManager.js#L30)

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

[BaseManager](../../BaseManager/classes/export=.md) for base functionality

## Example

```ts
const variableManager = engine.getManager('VariableManager');
const expanded = variableManager.expandVariables('Hello [{$username}]!', context);
// Returns: 'Hello admin!'
```

## Extends

- [`export=`](../../BaseManager/classes/export=.md)

## Constructors

### Constructor

> **new export=**(`engine`): `VariableManager`

Defined in: [src/managers/VariableManager.js:37](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/managers/VariableManager.js#L37)

Creates a new VariableManager instance

#### Parameters

##### engine

`WikiEngine`

The wiki engine instance

#### Returns

`VariableManager`

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

### variableHandlers

> **variableHandlers**: `Map`\<`any`, `any`\>

Defined in: [src/managers/VariableManager.js:39](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/managers/VariableManager.js#L39)

Variable name to handler function map

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

### expandVariables()

> **expandVariables**(`content`, `context`): `string`

Defined in: [src/managers/VariableManager.js:218](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/managers/VariableManager.js#L218)

Expands all variables in a given string of content.

#### Parameters

##### content

`string`

The content to process.

##### context

`any`

The WikiContext for the current rendering operation.

#### Returns

`string`

The content with variables expanded.

***

### getBrowserInfo()

> **getBrowserInfo**(`userAgent`): `string`

Defined in: [src/managers/VariableManager.js:175](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/managers/VariableManager.js#L175)

Get browser information from user agent string

#### Parameters

##### userAgent

`string`

User agent string

#### Returns

`string`

Browser name and version

***

### getDebugInfo()

> **getDebugInfo**(): `any`

Defined in: [src/managers/VariableManager.js:273](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/managers/VariableManager.js#L273)

Get debug information about registered variables

#### Returns

`any`

Debug information including system and contextual variables

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

### getVariable()

> **getVariable**(`varName`, `context`): `string`

Defined in: [src/managers/VariableManager.js:250](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/managers/VariableManager.js#L250)

Get the value of a specific variable

#### Parameters

##### varName

`string`

The variable name (without brackets/dollar sign)

##### context

`any` = `{}`

Optional context for contextual variables

#### Returns

`string`

The variable value

***

### initialize()

> **initialize**(): `Promise`\<`void`\>

Defined in: [src/managers/VariableManager.js:48](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/managers/VariableManager.js#L48)

Initialize the VariableManager and register core variables

#### Returns

`Promise`\<`void`\>

#### Async

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

### registerCoreVariables()

> **registerCoreVariables**(): `void`

Defined in: [src/managers/VariableManager.js:56](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/managers/VariableManager.js#L56)

Registers the default set of JSPWiki-compatible variables.

#### Returns

`void`

***

### registerVariable()

> **registerVariable**(`name`, `handler`): `void`

Defined in: [src/managers/VariableManager.js:205](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/managers/VariableManager.js#L205)

Registers a new variable handler.

#### Parameters

##### name

`string`

The name of the variable (without brackets/dollar sign).

##### handler

`Function`

A function that takes the WikiContext and returns the variable's value.

#### Returns

`void`

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
