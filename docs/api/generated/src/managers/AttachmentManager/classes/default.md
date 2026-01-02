[**amdWiki API v1.5.0**](../../../../README.md)

***

[amdWiki API](../../../../README.md) / [src/managers/AttachmentManager](../README.md) / default

# Class: default

Defined in: [src/managers/AttachmentManager.ts:133](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/managers/AttachmentManager.ts#L133)

AttachmentManager - Manages file attachments for wiki pages

Following JSPWiki's AttachmentManager pattern, this manager:
- Delegates storage to pluggable attachment providers
- Enforces permissions via PolicyManager
- Tracks attachment-page relationships
- Provides high-level attachment operations

 AttachmentManager

## See

 - [BaseManager](../../BaseManager/classes/default.md) for base functionality
 - BasicAttachmentProvider for default provider implementation

## Example

```ts
const attachmentManager = engine.getManager('AttachmentManager');
await attachmentManager.attachFile('Main', fileBuffer, 'document.pdf');

Based on:
https://github.com/apache/jspwiki/blob/master/jspwiki-main/src/main/java/org/apache/wiki/attachment/AttachmentManager.java
```

## Extends

- [`default`](../../BaseManager/classes/default.md)

## Constructors

### Constructor

> **new default**(`engine`): `AttachmentManager`

Defined in: [src/managers/AttachmentManager.ts:146](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/managers/AttachmentManager.ts#L146)

Creates a new AttachmentManager instance

#### Parameters

##### engine

[`WikiEngine`](../../../types/WikiEngine/interfaces/WikiEngine.md)

The wiki engine instance

#### Returns

`AttachmentManager`

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

### attachmentExists()

> **attachmentExists**(`attachmentId`): `Promise`\<`boolean`\>

Defined in: [src/managers/AttachmentManager.ts:479](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/managers/AttachmentManager.ts#L479)

Check if an attachment exists

#### Parameters

##### attachmentId

`string`

Attachment identifier

#### Returns

`Promise`\<`boolean`\>

***

### attachToPage()

> **attachToPage**(`attachmentId`, `pageName`): `Promise`\<`boolean`\>

Defined in: [src/managers/AttachmentManager.ts:310](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/managers/AttachmentManager.ts#L310)

Attach an existing attachment to a page

#### Parameters

##### attachmentId

`string`

Attachment identifier

##### pageName

`string`

Page name to attach to

#### Returns

`Promise`\<`boolean`\>

Success status

***

### backup()

> **backup**(): `Promise`\<[`AttachmentBackupData`](../interfaces/AttachmentBackupData.md)\>

Defined in: [src/managers/AttachmentManager.ts:517](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/managers/AttachmentManager.ts#L517)

Backup manager data
Delegates to provider's backup method

#### Returns

`Promise`\<[`AttachmentBackupData`](../interfaces/AttachmentBackupData.md)\>

#### Overrides

[`default`](../../BaseManager/classes/default.md).[`backup`](../../BaseManager/classes/default.md#backup)

***

### deleteAttachment()

> **deleteAttachment**(`attachmentId`, `context?`): `Promise`\<`boolean`\>

Defined in: [src/managers/AttachmentManager.ts:428](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/managers/AttachmentManager.ts#L428)

Delete an attachment

#### Parameters

##### attachmentId

`string`

Attachment identifier

##### context?

[`UserContext`](../interfaces/UserContext.md)

WikiContext with user information

#### Returns

`Promise`\<`boolean`\>

Success status

***

### detachFromPage()

> **detachFromPage**(`attachmentId`, `pageName`): `Promise`\<`boolean`\>

Defined in: [src/managers/AttachmentManager.ts:348](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/managers/AttachmentManager.ts#L348)

Detach an attachment from a page

#### Parameters

##### attachmentId

`string`

Attachment identifier

##### pageName

`string`

Page name to detach from

#### Returns

`Promise`\<`boolean`\>

Success status

***

### getAllAttachments()

> **getAllAttachments**(): `Promise`\<[`AttachmentMetadata`](../interfaces/AttachmentMetadata.md)[]\>

Defined in: [src/managers/AttachmentManager.ts:413](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/managers/AttachmentManager.ts#L413)

Get all attachments

#### Returns

`Promise`\<[`AttachmentMetadata`](../interfaces/AttachmentMetadata.md)[]\>

***

### getAttachment()

> **getAttachment**(`attachmentId`): `Promise`\<\{ `buffer`: `Buffer`; `metadata`: [`AttachmentMetadata`](../interfaces/AttachmentMetadata.md); \}\>

Defined in: [src/managers/AttachmentManager.ts:372](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/managers/AttachmentManager.ts#L372)

Get an attachment by ID

#### Parameters

##### attachmentId

`string`

Attachment identifier

#### Returns

`Promise`\<\{ `buffer`: `Buffer`; `metadata`: [`AttachmentMetadata`](../interfaces/AttachmentMetadata.md); \}\>

***

### getAttachmentMetadata()

> **getAttachmentMetadata**(`attachmentId`): `Promise`\<[`AttachmentMetadata`](../interfaces/AttachmentMetadata.md)\>

Defined in: [src/managers/AttachmentManager.ts:386](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/managers/AttachmentManager.ts#L386)

Get attachment metadata only

#### Parameters

##### attachmentId

`string`

Attachment identifier

#### Returns

`Promise`\<[`AttachmentMetadata`](../interfaces/AttachmentMetadata.md)\>

***

### getAttachmentsForPage()

> **getAttachmentsForPage**(`pageName`): `Promise`\<[`AttachmentMetadata`](../interfaces/AttachmentMetadata.md)[]\>

Defined in: [src/managers/AttachmentManager.ts:400](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/managers/AttachmentManager.ts#L400)

Get all attachments for a page

#### Parameters

##### pageName

`string`

Page name

#### Returns

`Promise`\<[`AttachmentMetadata`](../interfaces/AttachmentMetadata.md)[]\>

***

### getAttachmentUrl()

> **getAttachmentUrl**(`attachmentId`): `string`

Defined in: [src/managers/AttachmentManager.ts:493](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/managers/AttachmentManager.ts#L493)

Get attachment URL

#### Parameters

##### attachmentId

`string`

Attachment identifier

#### Returns

`string`

URL path

***

### getCurrentAttachmentProvider()

> **getCurrentAttachmentProvider**(): `BaseAttachmentProvider`

Defined in: [src/managers/AttachmentManager.ts:227](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/managers/AttachmentManager.ts#L227)

Get current attachment provider

#### Returns

`BaseAttachmentProvider`

Current provider instance

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

### initialize()

> **initialize**(`config?`): `Promise`\<`void`\>

Defined in: [src/managers/AttachmentManager.ts:160](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/managers/AttachmentManager.ts#L160)

Initialize AttachmentManager and load the configured provider

#### Parameters

##### config?

`Record`\<`string`, `unknown`\> = `{}`

Configuration object (unused, reads from ConfigurationManager)

#### Returns

`Promise`\<`void`\>

#### Async

#### Throws

If ConfigurationManager is not available or provider fails to load

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

### refreshAttachmentList()

> **refreshAttachmentList**(): `Promise`\<`void`\>

Defined in: [src/managers/AttachmentManager.ts:502](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/managers/AttachmentManager.ts#L502)

Refresh attachment list (rescan storage)

#### Returns

`Promise`\<`void`\>

***

### restore()

> **restore**(`backupData`): `Promise`\<`void`\>

Defined in: [src/managers/AttachmentManager.ts:545](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/managers/AttachmentManager.ts#L545)

Restore manager data from backup
Delegates to provider's restore method

#### Parameters

##### backupData

[`AttachmentBackupData`](../interfaces/AttachmentBackupData.md)

Backup data from backup() method

#### Returns

`Promise`\<`void`\>

#### Overrides

[`default`](../../BaseManager/classes/default.md).[`restore`](../../BaseManager/classes/default.md#restore)

***

### shutdown()

> **shutdown**(): `Promise`\<`void`\>

Defined in: [src/managers/AttachmentManager.ts:568](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/managers/AttachmentManager.ts#L568)

Shutdown the manager

#### Returns

`Promise`\<`void`\>

#### Overrides

[`default`](../../BaseManager/classes/default.md).[`shutdown`](../../BaseManager/classes/default.md#shutdown)

***

### updateAttachmentMetadata()

> **updateAttachmentMetadata**(`attachmentId`, `updates`, `context?`): `Promise`\<`boolean`\>

Defined in: [src/managers/AttachmentManager.ts:450](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/managers/AttachmentManager.ts#L450)

Update attachment metadata

#### Parameters

##### attachmentId

`string`

Attachment identifier

##### updates

`Partial`\<[`AttachmentMetadata`](../interfaces/AttachmentMetadata.md)\>

Metadata updates

##### context?

[`UserContext`](../interfaces/UserContext.md)

WikiContext with user information

#### Returns

`Promise`\<`boolean`\>

Success status

***

### uploadAttachment()

> **uploadAttachment**(`fileBuffer`, `fileInfo`, `options`): `Promise`\<[`AttachmentMetadata`](../interfaces/AttachmentMetadata.md)\>

Defined in: [src/managers/AttachmentManager.ts:263](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/managers/AttachmentManager.ts#L263)

Upload an attachment

#### Parameters

##### fileBuffer

`Buffer`

File data

##### fileInfo

[`FileInfo`](../interfaces/FileInfo.md)

{ originalName, mimeType, size }

##### options

[`UploadOptions`](../interfaces/UploadOptions.md) = `{}`

Upload options

#### Returns

`Promise`\<[`AttachmentMetadata`](../interfaces/AttachmentMetadata.md)\>

Attachment metadata
