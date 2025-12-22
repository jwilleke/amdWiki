[**amdWiki API v1.5.0**](../../../../README.md)

***

[amdWiki API](../../../../README.md) / [src/managers/TemplateManager](../README.md) / export=

# Class: export=

Defined in: [src/managers/TemplateManager.js:32](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/managers/TemplateManager.js#L32)

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

[BaseManager](../../BaseManager/classes/export=.md) for base functionality

## Example

```ts
const templateManager = engine.getManager('TemplateManager');
const template = templateManager.getTemplate('Meeting Notes');
```

## Extends

- [`export=`](../../BaseManager/classes/export=.md)

## Constructors

### Constructor

> **new export=**(`engine`): `TemplateManager`

Defined in: [src/managers/TemplateManager.js:39](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/managers/TemplateManager.js#L39)

Creates a new TemplateManager instance

#### Parameters

##### engine

`WikiEngine`

The wiki engine instance

#### Returns

`TemplateManager`

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

### templates

> **templates**: `object`

Defined in: [src/managers/TemplateManager.js:41](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/managers/TemplateManager.js#L41)

Loaded page templates

***

### templatesDirectory

> **templatesDirectory**: `string`

Defined in: [src/managers/TemplateManager.js:43](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/managers/TemplateManager.js#L43)

Path to templates directory

***

### themes

> **themes**: `object`

Defined in: [src/managers/TemplateManager.js:42](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/managers/TemplateManager.js#L42)

Loaded themes

***

### themesDirectory

> **themesDirectory**: `string`

Defined in: [src/managers/TemplateManager.js:44](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/managers/TemplateManager.js#L44)

Path to themes directory

## Methods

### applyTemplate()

> **applyTemplate**(`templateName`, `variables`): `string`

Defined in: [src/managers/TemplateManager.js:374](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/managers/TemplateManager.js#L374)

Apply template to create page content

#### Parameters

##### templateName

`string`

Template to use

##### variables

`any` = `{}`

Variables to substitute

#### Returns

`string`

Generated content

***

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

### createDefaultTemplates()

> **createDefaultTemplates**(): `Promise`\<`void`\>

Defined in: [src/managers/TemplateManager.js:139](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/managers/TemplateManager.js#L139)

Create default page templates

#### Returns

`Promise`\<`void`\>

***

### createDefaultTheme()

> **createDefaultTheme**(): `Promise`\<`void`\>

Defined in: [src/managers/TemplateManager.js:241](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/managers/TemplateManager.js#L241)

Create default theme

#### Returns

`Promise`\<`void`\>

***

### createTemplate()

> **createTemplate**(`templateName`, `content`): `Promise`\<`void`\>

Defined in: [src/managers/TemplateManager.js:440](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/managers/TemplateManager.js#L440)

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

Defined in: [src/managers/TemplateManager.js:458](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/managers/TemplateManager.js#L458)

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

Defined in: [src/managers/TemplateManager.js:410](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/managers/TemplateManager.js#L410)

Generate UUID for pages

#### Returns

`string`

UUID

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

### getTemplate()

> **getTemplate**(`templateName`): `any`

Defined in: [src/managers/TemplateManager.js:364](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/managers/TemplateManager.js#L364)

Get a specific template

#### Parameters

##### templateName

`string`

Template name

#### Returns

`any`

Template object or null

***

### getTemplates()

> **getTemplates**(): `any`[]

Defined in: [src/managers/TemplateManager.js:355](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/managers/TemplateManager.js#L355)

Get available templates

#### Returns

`any`[]

Available templates

***

### getTheme()

> **getTheme**(`themeName`): `any`

Defined in: [src/managers/TemplateManager.js:431](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/managers/TemplateManager.js#L431)

Get a specific theme

#### Parameters

##### themeName

`string`

Theme name

#### Returns

`any`

Theme object or null

***

### getThemes()

> **getThemes**(): `any`[]

Defined in: [src/managers/TemplateManager.js:422](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/managers/TemplateManager.js#L422)

Get available themes

#### Returns

`any`[]

Available themes

***

### initialize()

> **initialize**(`config?`): `Promise`\<`void`\>

Defined in: [src/managers/TemplateManager.js:56](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/managers/TemplateManager.js#L56)

Initialize the TemplateManager and load templates/themes

#### Parameters

##### config?

Configuration object

###### templatesDirectory?

`string`

Templates directory path

###### themesDirectory?

`string`

Themes directory path

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

### loadTemplates()

> **loadTemplates**(): `Promise`\<`void`\>

Defined in: [src/managers/TemplateManager.js:73](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/managers/TemplateManager.js#L73)

Load all page templates

#### Returns

`Promise`\<`void`\>

***

### loadThemes()

> **loadThemes**(): `Promise`\<`void`\>

Defined in: [src/managers/TemplateManager.js:106](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/managers/TemplateManager.js#L106)

Load all themes

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

***

### suggestTemplates()

> **suggestTemplates**(`pageName`, `category`): `string`[]

Defined in: [src/managers/TemplateManager.js:477](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/managers/TemplateManager.js#L477)

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
