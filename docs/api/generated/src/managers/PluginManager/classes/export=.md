[**amdWiki API v1.5.0**](../../../../README.md)

***

[amdWiki API](../../../../README.md) / [src/managers/PluginManager](../README.md) / export=

# Class: export=

Defined in: [src/managers/PluginManager.js:29](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/managers/PluginManager.js#L29)

PluginManager - Handles plugin discovery, registration, and execution

Similar to JSPWiki's PluginManager, this manager provides a plugin system
for extending wiki functionality. Plugins are discovered from configured
search paths and executed during markup parsing.

Key features:
- Dynamic plugin discovery from search paths
- Plugin registration and metadata management
- Secure plugin execution with sandboxing
- Configurable plugin search paths

 PluginManager

## See

[BaseManager](../../BaseManager/classes/export=.md) for base functionality

## Example

```ts
const pluginManager = engine.getManager('PluginManager');
const result = await pluginManager.execute('CurrentTimePlugin', params);
```

## Extends

- [`export=`](../../BaseManager/classes/export=.md)

## Constructors

### Constructor

> **new export=**(`engine`): `PluginManager`

Defined in: [src/managers/PluginManager.js:36](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/managers/PluginManager.js#L36)

Creates a new PluginManager instance

#### Parameters

##### engine

`WikiEngine`

The wiki engine instance

#### Returns

`PluginManager`

#### Overrides

[`export=`](../../BaseManager/classes/export=.md).[`constructor`](../../BaseManager/classes/export=.md#constructor)

## Properties

### allowedRoots

> **allowedRoots**: `any`[]

Defined in: [src/managers/PluginManager.js:40](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/managers/PluginManager.js#L40)

Allowed root paths for security

***

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

### plugins

> **plugins**: `Map`\<`any`, `any`\>

Defined in: [src/managers/PluginManager.js:38](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/managers/PluginManager.js#L38)

Registered plugins

***

### searchPaths

> **searchPaths**: `any`[]

Defined in: [src/managers/PluginManager.js:39](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/managers/PluginManager.js#L39)

Directories to search for plugins

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

### execute()

> **execute**(`pluginName`, `pageName`, `params`, `context`): `string`

Defined in: [src/managers/PluginManager.js:237](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/managers/PluginManager.js#L237)

Execute a plugin

#### Parameters

##### pluginName

`string`

Name of the plugin

##### pageName

`string`

Current page name

##### params

`any`

Plugin parameters (parsed object)

##### context

`any` = `{}`

Additional context

#### Returns

`string`

Plugin output

***

### findPlugin()

> **findPlugin**(`pluginName`): `any`

Defined in: [src/managers/PluginManager.js:180](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/managers/PluginManager.js#L180)

Find plugin by name (case-insensitive)
Supports JSPWiki-style plugin naming where you can use either:
- "Search" or "SearchPlugin"
- "Index" or "IndexPlugin"

#### Parameters

##### pluginName

`string`

Name of the plugin to find

#### Returns

`any`

Plugin object or null if not found

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

### getPluginInfo()

> **getPluginInfo**(`pluginName`): `any`

Defined in: [src/managers/PluginManager.js:285](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/managers/PluginManager.js#L285)

Get plugin info

#### Parameters

##### pluginName

`string`

Name of the plugin

#### Returns

`any`

Plugin information

***

### getPluginNames()

> **getPluginNames**(): `string`[]

Defined in: [src/managers/PluginManager.js:276](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/managers/PluginManager.js#L276)

Get list of all registered plugins

#### Returns

`string`[]

Array of plugin names

***

### hasPlugin()

> **hasPlugin**(`pluginName`): `boolean`

Defined in: [src/managers/PluginManager.js:304](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/managers/PluginManager.js#L304)

Check if plugin exists

#### Parameters

##### pluginName

`string`

Name of the plugin

#### Returns

`boolean`

True if plugin exists

***

### initialize()

> **initialize**(`config?`): `Promise`\<`void`\>

Defined in: [src/managers/PluginManager.js:50](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/managers/PluginManager.js#L50)

Initialize the PluginManager and discover plugins

#### Parameters

##### config?

`any` = `{}`

Configuration object (unused, reads from ConfigurationManager)

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

### loadPlugin()

> **loadPlugin**(`pluginPath`): `Promise`\<`void`\>

Defined in: [src/managers/PluginManager.js:137](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/managers/PluginManager.js#L137)

Load a single plugin from a validated, allowed root

#### Parameters

##### pluginPath

`string`

Path to the plugin file

#### Returns

`Promise`\<`void`\>

***

### registerPlugins()

> **registerPlugins**(): `Promise`\<`void`\>

Defined in: [src/managers/PluginManager.js:61](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/managers/PluginManager.js#L61)

Register all plugins from search paths obtained ONLY from
ConfigurationManager at key: amdwiki.managers.pluginManager.searchPaths

#### Returns

`Promise`\<`void`\>

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
