[**amdWiki API v1.5.0**](../../../../README.md)

***

[amdWiki API](../../../../README.md) / [src/managers/TemplateManager](../README.md) / export=

# Class: export=

Defined in: [src/managers/TemplateManager.ts:107](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/managers/TemplateManager.ts#L107)

TemplateManager - Handles page templates and themes

Similar to JSPWiki's TemplateManager, this manager provides template
management for creating new pages from predefined templates and managing
wiki themes for UI customization.

Key features:
- Page template management
- Theme loading and switching
- Default template creation
- Template content retrieval

 TemplateManager

## See

[BaseManager](../../BaseManager/classes/default.md) for base functionality

## Example

```ts
const templateManager = engine.getManager('TemplateManager');
const template = templateManager.getTemplate('Meeting Notes');
```

## Extends

- [`default`](../../BaseManager/classes/default.md)

## Constructors

### Constructor

> **new export=**(`engine`): `TemplateManager`

Defined in: [src/managers/TemplateManager.ts:119](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/managers/TemplateManager.ts#L119)

Creates a new TemplateManager instance

#### Parameters

##### engine

[`WikiEngine`](../../../types/WikiEngine/interfaces/WikiEngine.md)

The wiki engine instance

#### Returns

`TemplateManager`

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

### applyTemplate()

> **applyTemplate**(`templateName`, `variables`): `string`

Defined in: [src/managers/TemplateManager.ts:464](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/managers/TemplateManager.ts#L464)

Apply template to create page content

#### Parameters

##### templateName

`string`

Template to use

##### variables

`TemplateVariables` = `{}`

Variables to substitute

#### Returns

`string`

Generated content

#### Throws

If template is not found

***

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

### createDefaultTemplates()

> **createDefaultTemplates**(): `Promise`\<`void`\>

Defined in: [src/managers/TemplateManager.ts:223](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/managers/TemplateManager.ts#L223)

Create default page templates

#### Returns

`Promise`\<`void`\>

***

### createDefaultTheme()

> **createDefaultTheme**(): `Promise`\<`void`\>

Defined in: [src/managers/TemplateManager.ts:327](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/managers/TemplateManager.ts#L327)

Create default theme

#### Returns

`Promise`\<`void`\>

***

### createTemplate()

> **createTemplate**(`templateName`, `content`): `Promise`\<`void`\>

Defined in: [src/managers/TemplateManager.ts:535](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/managers/TemplateManager.ts#L535)

Create a new template

#### Parameters

##### templateName

`string`

Template name

##### content

`string`

Template content

#### Returns

`Promise`\<`void`\>

***

### createTheme()

> **createTheme**(`themeName`, `content`): `Promise`\<`void`\>

Defined in: [src/managers/TemplateManager.ts:555](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/managers/TemplateManager.ts#L555)

Create a new theme

#### Parameters

##### themeName

`string`

Theme name

##### content

`string`

CSS content

#### Returns

`Promise`\<`void`\>

***

### generateUUID()

> **generateUUID**(): `string`

Defined in: [src/managers/TemplateManager.ts:501](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/managers/TemplateManager.ts#L501)

Generate UUID for pages

#### Returns

`string`

UUID

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

### getTemplate()

> **getTemplate**(`templateName`): `Template`

Defined in: [src/managers/TemplateManager.ts:452](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/managers/TemplateManager.ts#L452)

Get a specific template

#### Parameters

##### templateName

`string`

Template name

#### Returns

`Template`

Template object or null

***

### getTemplates()

> **getTemplates**(): `Template`[]

Defined in: [src/managers/TemplateManager.ts:442](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/managers/TemplateManager.ts#L442)

Get available templates

#### Returns

`Template`[]

Available templates

***

### getTheme()

> **getTheme**(`themeName`): `Theme`

Defined in: [src/managers/TemplateManager.ts:524](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/managers/TemplateManager.ts#L524)

Get a specific theme

#### Parameters

##### themeName

`string`

Theme name

#### Returns

`Theme`

Theme object or null

***

### getThemes()

> **getThemes**(): `Theme`[]

Defined in: [src/managers/TemplateManager.ts:514](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/managers/TemplateManager.ts#L514)

Get available themes

#### Returns

`Theme`[]

Available themes

***

### initialize()

> **initialize**(`config?`): `Promise`\<`void`\>

Defined in: [src/managers/TemplateManager.ts:134](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/managers/TemplateManager.ts#L134)

Initialize the TemplateManager and load templates/themes

#### Parameters

##### config?

`TemplateConfig` = `{}`

Configuration object

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

### loadTemplates()

> **loadTemplates**(): `Promise`\<`void`\>

Defined in: [src/managers/TemplateManager.ts:153](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/managers/TemplateManager.ts#L153)

Load all page templates

#### Returns

`Promise`\<`void`\>

***

### loadThemes()

> **loadThemes**(): `Promise`\<`void`\>

Defined in: [src/managers/TemplateManager.ts:188](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/managers/TemplateManager.ts#L188)

Load all themes

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

***

### suggestTemplates()

> **suggestTemplates**(`pageName`, `category`): `string`[]

Defined in: [src/managers/TemplateManager.ts:575](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/managers/TemplateManager.ts#L575)

Get template suggestions based on page name or category

#### Parameters

##### pageName

`string`

Page name

##### category

`string`

Page category

#### Returns

`string`[]

Suggested template names
