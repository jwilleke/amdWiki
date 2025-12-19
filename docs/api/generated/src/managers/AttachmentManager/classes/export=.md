[**amdWiki API v1.5.0**](../../../../README.md)

***

[amdWiki API](../../../../README.md) / [src/managers/AttachmentManager](../README.md) / export=

# Class: export=

Defined in: [src/managers/AttachmentManager.js:29](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/managers/AttachmentManager.js#L29)

AttachmentManager - Manages file attachments for wiki pages

Following JSPWiki's AttachmentManager pattern, this manager:
- Delegates storage to pluggable attachment providers
- Enforces permissions via PolicyManager
- Tracks attachment-page relationships
- Provides high-level attachment operations

 AttachmentManager

## See

 - [BaseManager](../../BaseManager/classes/export=.md) for base functionality
 - BasicAttachmentProvider for default provider implementation

## Example

```ts
const attachmentManager = engine.getManager('AttachmentManager');
await attachmentManager.attachFile('Main', fileBuffer, 'document.pdf');

Based on:
https://github.com/apache/jspwiki/blob/master/jspwiki-main/src/main/java/org/apache/wiki/attachment/AttachmentManager.java
```

## Extends

- [`export=`](../../BaseManager/classes/export=.md)

## Constructors

### Constructor

> **new export=**(`engine`): `AttachmentManager`

Defined in: [src/managers/AttachmentManager.js:36](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/managers/AttachmentManager.js#L36)

Creates a new AttachmentManager instance

#### Parameters

##### engine

`WikiEngine`

The wiki engine instance

#### Returns

`AttachmentManager`

#### Overrides

[`export=`](../../BaseManager/classes/export=.md).[`constructor`](../../BaseManager/classes/export=.md#constructor)

## Properties

### allowedTypes

> **allowedTypes**: `any`

Defined in: [src/managers/AttachmentManager.js:81](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/managers/AttachmentManager.js#L81)

***

### attachmentProvider

> **attachmentProvider**: `any`

Defined in: [src/managers/AttachmentManager.js:38](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/managers/AttachmentManager.js#L38)

The active attachment provider

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

### forceDownload

> **forceDownload**: `any`

Defined in: [src/managers/AttachmentManager.js:82](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/managers/AttachmentManager.js#L82)

***

### initialized

> **initialized**: `boolean`

Defined in: [src/managers/BaseManager.js:34](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/managers/BaseManager.js#L34)

Flag indicating initialization status

#### Inherited from

[`export=`](../../BaseManager/classes/export=.md).[`initialized`](../../BaseManager/classes/export=.md#initialized)

***

### maxSize

> **maxSize**: `any`

Defined in: [src/managers/AttachmentManager.js:80](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/managers/AttachmentManager.js#L80)

***

### providerClass

> **providerClass**: `string`

Defined in: [src/managers/AttachmentManager.js:39](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/managers/AttachmentManager.js#L39)

The class name of the loaded provider

## Methods

### attachmentExists()

> **attachmentExists**(`attachmentId`): `Promise`\<`boolean`\>

Defined in: [src/managers/AttachmentManager.js:359](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/managers/AttachmentManager.js#L359)

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

Defined in: [src/managers/AttachmentManager.js:190](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/managers/AttachmentManager.js#L190)

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

> **backup**(): `Promise`\<`any`\>

Defined in: [src/managers/AttachmentManager.js:397](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/managers/AttachmentManager.js#L397)

Backup manager data
Delegates to provider's backup method

#### Returns

`Promise`\<`any`\>

#### Overrides

[`export=`](../../BaseManager/classes/export=.md).[`backup`](../../BaseManager/classes/export=.md#backup)

***

### deleteAttachment()

> **deleteAttachment**(`attachmentId`, `context`): `Promise`\<`boolean`\>

Defined in: [src/managers/AttachmentManager.js:308](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/managers/AttachmentManager.js#L308)

Delete an attachment

#### Parameters

##### attachmentId

`string`

Attachment identifier

##### context

`any`

WikiContext with user information

#### Returns

`Promise`\<`boolean`\>

Success status

***

### detachFromPage()

> **detachFromPage**(`attachmentId`, `pageName`): `Promise`\<`boolean`\>

Defined in: [src/managers/AttachmentManager.js:228](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/managers/AttachmentManager.js#L228)

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

> **getAllAttachments**(): `Promise`\<`any`[]\>

Defined in: [src/managers/AttachmentManager.js:293](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/managers/AttachmentManager.js#L293)

Get all attachments

#### Returns

`Promise`\<`any`[]\>

***

### getAttachment()

> **getAttachment**(`attachmentId`): `Promise`\<\{ `buffer`: `Buffer`; `metadata`: `any`; \}\>

Defined in: [src/managers/AttachmentManager.js:252](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/managers/AttachmentManager.js#L252)

Get an attachment by ID

#### Parameters

##### attachmentId

`string`

Attachment identifier

#### Returns

`Promise`\<\{ `buffer`: `Buffer`; `metadata`: `any`; \}\>

***

### getAttachmentMetadata()

> **getAttachmentMetadata**(`attachmentId`): `Promise`\<`any`\>

Defined in: [src/managers/AttachmentManager.js:266](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/managers/AttachmentManager.js#L266)

Get attachment metadata only

#### Parameters

##### attachmentId

`string`

Attachment identifier

#### Returns

`Promise`\<`any`\>

***

### getAttachmentsForPage()

> **getAttachmentsForPage**(`pageName`): `Promise`\<`any`[]\>

Defined in: [src/managers/AttachmentManager.js:280](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/managers/AttachmentManager.js#L280)

Get all attachments for a page

#### Parameters

##### pageName

`string`

Page name

#### Returns

`Promise`\<`any`[]\>

***

### getAttachmentUrl()

> **getAttachmentUrl**(`attachmentId`): `string`

Defined in: [src/managers/AttachmentManager.js:373](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/managers/AttachmentManager.js#L373)

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

Defined in: [src/managers/AttachmentManager.js:108](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/managers/AttachmentManager.js#L108)

Get current attachment provider

#### Returns

`BaseAttachmentProvider`

Current provider instance

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

### initialize()

> **initialize**(`config?`): `Promise`\<`void`\>

Defined in: [src/managers/AttachmentManager.js:50](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/managers/AttachmentManager.js#L50)

Initialize AttachmentManager and load the configured provider

#### Parameters

##### config?

`any` = `{}`

Configuration object (unused, reads from ConfigurationManager)

#### Returns

`Promise`\<`void`\>

#### Async

#### Throws

If ConfigurationManager is not available or provider fails to load

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

### refreshAttachmentList()

> **refreshAttachmentList**(): `Promise`\<`void`\>

Defined in: [src/managers/AttachmentManager.js:382](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/managers/AttachmentManager.js#L382)

Refresh attachment list (rescan storage)

#### Returns

`Promise`\<`void`\>

***

### restore()

> **restore**(`backupData`): `Promise`\<`void`\>

Defined in: [src/managers/AttachmentManager.js:424](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/managers/AttachmentManager.js#L424)

Restore manager data from backup
Delegates to provider's restore method

#### Parameters

##### backupData

`any`

Backup data from backup() method

#### Returns

`Promise`\<`void`\>

#### Overrides

[`export=`](../../BaseManager/classes/export=.md).[`restore`](../../BaseManager/classes/export=.md#restore)

***

### shutdown()

> **shutdown**(): `Promise`\<`void`\>

Defined in: [src/managers/AttachmentManager.js:446](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/managers/AttachmentManager.js#L446)

Shutdown the manager

#### Returns

`Promise`\<`void`\>

#### Overrides

[`export=`](../../BaseManager/classes/export=.md).[`shutdown`](../../BaseManager/classes/export=.md#shutdown)

***

### updateAttachmentMetadata()

> **updateAttachmentMetadata**(`attachmentId`, `updates`, `context`): `Promise`\<`boolean`\>

Defined in: [src/managers/AttachmentManager.js:330](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/managers/AttachmentManager.js#L330)

Update attachment metadata

#### Parameters

##### attachmentId

`string`

Attachment identifier

##### updates

`any`

Metadata updates

##### context

`any`

WikiContext with user information

#### Returns

`Promise`\<`boolean`\>

Success status

***

### uploadAttachment()

> **uploadAttachment**(`fileBuffer`, `fileInfo`, `options`): `Promise`\<`any`\>

Defined in: [src/managers/AttachmentManager.js:143](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/managers/AttachmentManager.js#L143)

Upload an attachment

#### Parameters

##### fileBuffer

`Buffer`\<`ArrayBufferLike`\>

File data

##### fileInfo

`any`

{ originalName, mimeType, size }

##### options

Upload options

###### context

`any`

WikiContext with user information

###### description

`string`

File description

###### pageName

`string`

Page to attach to (optional)

#### Returns

`Promise`\<`any`\>

Attachment metadata
