[**amdWiki API v1.5.0**](../../../../README.md)

***

[amdWiki API](../../../../README.md) / [src/managers/PluginManager](../README.md) / default

# Class: default

Defined in: [src/managers/PluginManager.ts:74](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/managers/PluginManager.ts#L74)

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

[BaseManager](../../BaseManager/classes/default.md) for base functionality

## Example

```ts
const pluginManager = engine.getManager('PluginManager');
const result = await pluginManager.execute('CurrentTimePlugin', params);
```

## Extends

- [`default`](../../BaseManager/classes/default.md)

## Constructors

### Constructor

> **new default**(`engine`): `PluginManager`

Defined in: [src/managers/PluginManager.ts:86](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/managers/PluginManager.ts#L86)

Creates a new PluginManager instance

#### Parameters

##### engine

[`WikiEngine`](../../../types/WikiEngine/interfaces/WikiEngine.md)

The wiki engine instance

#### Returns

`PluginManager`

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

### execute()

> **execute**(`pluginName`, `pageName`, `params`, `context`): `Promise`\<`string`\>

Defined in: [src/managers/PluginManager.ts:318](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/managers/PluginManager.ts#L318)

Execute a plugin

#### Parameters

##### pluginName

`string`

Name of the plugin

##### pageName

`string`

Current page name

##### params

[`PluginParams`](../interfaces/PluginParams.md)

Plugin parameters (parsed object)

##### context

`Record`\<`string`, `unknown`\> = `{}`

Additional context

#### Returns

`Promise`\<`string`\>

Plugin output

***

### findPlugin()

> **findPlugin**(`pluginName`): [`Plugin`](../interfaces/Plugin.md)

Defined in: [src/managers/PluginManager.ts:261](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/managers/PluginManager.ts#L261)

Find plugin by name (case-insensitive)
Supports JSPWiki-style plugin naming where you can use either:
- "Search" or "SearchPlugin"
- "Index" or "IndexPlugin"

#### Parameters

##### pluginName

`string`

Name of the plugin to find

#### Returns

[`Plugin`](../interfaces/Plugin.md)

Plugin object or null if not found

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

### getPluginInfo()

> **getPluginInfo**(`pluginName`): [`PluginInfo`](../interfaces/PluginInfo.md)

Defined in: [src/managers/PluginManager.ts:368](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/managers/PluginManager.ts#L368)

Get plugin info

#### Parameters

##### pluginName

`string`

Name of the plugin

#### Returns

[`PluginInfo`](../interfaces/PluginInfo.md)

Plugin information

***

### getPluginNames()

> **getPluginNames**(): `string`[]

Defined in: [src/managers/PluginManager.ts:359](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/managers/PluginManager.ts#L359)

Get list of all registered plugins

#### Returns

`string`[]

Array of plugin names

***

### hasPlugin()

> **hasPlugin**(`pluginName`): `boolean`

Defined in: [src/managers/PluginManager.ts:387](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/managers/PluginManager.ts#L387)

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

Defined in: [src/managers/PluginManager.ts:101](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/managers/PluginManager.ts#L101)

Initialize the PluginManager and discover plugins

#### Parameters

##### config?

`Record`\<`string`, `unknown`\> = `{}`

Configuration object (unused, reads from ConfigurationManager)

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

### loadPlugin()

> **loadPlugin**(`pluginPath`): `Promise`\<`void`\>

Defined in: [src/managers/PluginManager.ts:207](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/managers/PluginManager.ts#L207)

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

Defined in: [src/managers/PluginManager.ts:113](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/managers/PluginManager.ts#L113)

Register all plugins from search paths obtained ONLY from
ConfigurationManager at key: amdwiki.managers.pluginManager.searchPaths

#### Returns

`Promise`\<`void`\>

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
