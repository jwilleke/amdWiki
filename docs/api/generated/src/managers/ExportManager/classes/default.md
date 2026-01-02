[**amdWiki API v1.5.0**](../../../../README.md)

***

[amdWiki API](../../../../README.md) / [src/managers/ExportManager](../README.md) / default

# Class: default

Defined in: [src/managers/ExportManager.ts:68](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/managers/ExportManager.ts#L68)

ExportManager - Handles page exports to multiple formats

Similar to JSPWiki's export functionality, provides page export capabilities
to HTML, PDF, markdown, and other formats.

 ExportManager

## See

[BaseManager](../../BaseManager/classes/default.md) for base functionality

## Example

```ts
const exportManager = engine.getManager('ExportManager');
const html = await exportManager.exportPageToHtml('Main');
```

## Extends

- [`default`](../../BaseManager/classes/default.md)

## Constructors

### Constructor

> **new default**(`engine`): `ExportManager`

Defined in: [src/managers/ExportManager.ts:79](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/managers/ExportManager.ts#L79)

Creates a new ExportManager instance

#### Parameters

##### engine

[`WikiEngine`](../../../types/WikiEngine/interfaces/WikiEngine.md)

The wiki engine instance

#### Returns

`ExportManager`

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

### deleteExport()

> **deleteExport**(`filename`): `Promise`\<`void`\>

Defined in: [src/managers/ExportManager.ts:440](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/managers/ExportManager.ts#L440)

Delete an export file

#### Parameters

##### filename

`string`

Export filename

#### Returns

`Promise`\<`void`\>

***

### exportPagesToHtml()

> **exportPagesToHtml**(`pageNames`, `user`): `Promise`\<`string`\>

Defined in: [src/managers/ExportManager.ts:211](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/managers/ExportManager.ts#L211)

Export multiple pages to a single HTML file

#### Parameters

##### pageNames

`string`[]

Array of page names

##### user

[`ExportUser`](../interfaces/ExportUser.md) = `null`

User object for locale-aware formatting

#### Returns

`Promise`\<`string`\>

Combined HTML content

***

### exportPageToHtml()

> **exportPageToHtml**(`pageName`, `user`): `Promise`\<`string`\>

Defined in: [src/managers/ExportManager.ts:112](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/managers/ExportManager.ts#L112)

Export a single page to HTML

#### Parameters

##### pageName

`string`

Page name to export

##### user

[`ExportUser`](../interfaces/ExportUser.md) = `null`

User object for locale-aware formatting

#### Returns

`Promise`\<`string`\>

HTML content

***

### exportToMarkdown()

> **exportToMarkdown**(`pageNames`, `user`): `Promise`\<`string`\>

Defined in: [src/managers/ExportManager.ts:350](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/managers/ExportManager.ts#L350)

Export page(s) to markdown

#### Parameters

##### pageNames

Single page name or array of page names

`string` | `string`[]

##### user

[`ExportUser`](../interfaces/ExportUser.md) = `null`

User object for locale-aware formatting

#### Returns

`Promise`\<`string`\>

Markdown content

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

### getExports()

> **getExports**(): `Promise`\<[`ExportFileInfo`](../interfaces/ExportFileInfo.md)[]\>

Defined in: [src/managers/ExportManager.ts:409](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/managers/ExportManager.ts#L409)

Get list of available exports

#### Returns

`Promise`\<[`ExportFileInfo`](../interfaces/ExportFileInfo.md)[]\>

List of export files

***

### getFormattedTimestamp()

> **getFormattedTimestamp**(`user`): `string`

Defined in: [src/managers/ExportManager.ts:452](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/managers/ExportManager.ts#L452)

Get formatted timestamp using user's locale

#### Parameters

##### user

[`ExportUser`](../interfaces/ExportUser.md) = `null`

User object (optional)

#### Returns

`string`

Formatted timestamp

***

### initialize()

> **initialize**(`config?`): `Promise`\<`void`\>

Defined in: [src/managers/ExportManager.ts:94](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/managers/ExportManager.ts#L94)

Initialize the ExportManager

#### Parameters

##### config?

[`ExportConfig`](../interfaces/ExportConfig.md) = `{}`

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

### saveExport()

> **saveExport**(`content`, `filename`, `format`): `Promise`\<`string`\>

Defined in: [src/managers/ExportManager.ts:392](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/managers/ExportManager.ts#L392)

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

`Promise`\<`string`\>

File path

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
