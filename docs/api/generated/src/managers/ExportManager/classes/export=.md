[**amdWiki API v1.5.0**](../../../../README.md)

***

[amdWiki API](../../../../README.md) / [src/managers/ExportManager](../README.md) / export=

# Class: export=

Defined in: [src/managers/ExportManager.js:24](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/managers/ExportManager.js#L24)

ExportManager - Handles page exports to multiple formats

Similar to JSPWiki's export functionality, provides page export capabilities
to HTML, PDF, markdown, and other formats.

 ExportManager

## See

[BaseManager](../../BaseManager/classes/export=.md) for base functionality

## Example

```ts
const exportManager = engine.getManager('ExportManager');
const html = await exportManager.exportPageToHtml('Main');
```

## Extends

- [`export=`](../../BaseManager/classes/export=.md)

## Constructors

### Constructor

> **new export=**(`engine`): `ExportManager`

Defined in: [src/managers/ExportManager.js:31](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/managers/ExportManager.js#L31)

Creates a new ExportManager instance

#### Parameters

##### engine

`WikiEngine`

The wiki engine instance

#### Returns

`ExportManager`

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

### exportDirectory

> **exportDirectory**: `string`

Defined in: [src/managers/ExportManager.js:33](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/managers/ExportManager.js#L33)

Directory for exported files

***

### initialized

> **initialized**: `boolean`

Defined in: [src/managers/BaseManager.js:34](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/managers/BaseManager.js#L34)

Flag indicating initialization status

#### Inherited from

[`export=`](../../BaseManager/classes/export=.md).[`initialized`](../../BaseManager/classes/export=.md#initialized)

***

### supportedFormats

> **supportedFormats**: `string`[]

Defined in: [src/managers/ExportManager.js:34](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/managers/ExportManager.js#L34)

Supported export formats

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

### deleteExport()

> **deleteExport**(`filename`): `Promise`\<`void`\>

Defined in: [src/managers/ExportManager.js:374](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/managers/ExportManager.js#L374)

Delete an export file

#### Parameters

##### filename

`string`

Export filename

#### Returns

`Promise`\<`void`\>

***

### exportPagesToHtml()

> **exportPagesToHtml**(`pageNames`, `user`): `string`

Defined in: [src/managers/ExportManager.js:155](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/managers/ExportManager.js#L155)

Export multiple pages to a single HTML file

#### Parameters

##### pageNames

`any`[]

Array of page names

##### user

`any` = `null`

#### Returns

`string`

Combined HTML content

***

### exportPageToHtml()

> **exportPageToHtml**(`pageName`, `user`): `string`

Defined in: [src/managers/ExportManager.js:61](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/managers/ExportManager.js#L61)

Export a single page to HTML

#### Parameters

##### pageName

`string`

Page name to export

##### user

`any` = `null`

#### Returns

`string`

HTML content

***

### exportToMarkdown()

> **exportToMarkdown**(`pageNames`, `user`): `string`

Defined in: [src/managers/ExportManager.js:289](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/managers/ExportManager.js#L289)

Export page(s) to markdown

#### Parameters

##### pageNames

Single page name or array of page names

`string` | `any`[]

##### user

`any` = `null`

#### Returns

`string`

Markdown content

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

### getExports()

> **getExports**(): `any`[]

Defined in: [src/managers/ExportManager.js:345](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/managers/ExportManager.js#L345)

Get list of available exports

#### Returns

`any`[]

List of export files

***

### getFormattedTimestamp()

> **getFormattedTimestamp**(`user`): `string`

Defined in: [src/managers/ExportManager.js:385](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/managers/ExportManager.js#L385)

Get formatted timestamp using user's locale

#### Parameters

##### user

`any` = `null`

User object (optional)

#### Returns

`string`

Formatted timestamp

***

### initialize()

> **initialize**(`config?`): `Promise`\<`void`\>

Defined in: [src/managers/ExportManager.js:45](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/managers/ExportManager.js#L45)

Initialize the ExportManager

#### Parameters

##### config?

Configuration object

###### exportDirectory?

`string`

Export directory path

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

### saveExport()

> **saveExport**(`content`, `filename`, `format`): `string`

Defined in: [src/managers/ExportManager.js:329](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/managers/ExportManager.js#L329)

Save export to file

#### Parameters

##### content

`string`

Content to save

##### filename

`string`

Filename

##### format

`string`

File format

#### Returns

`string`

File path

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
