[**amdWiki API v1.5.0**](../../../../README.md)

***

[amdWiki API](../../../../README.md) / [src/providers/BasicAttachmentProvider](../README.md) / default

# Class: default

Defined in: [src/providers/BasicAttachmentProvider.ts:97](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/providers/BasicAttachmentProvider.ts#L97)

BasicAttachmentProvider - Filesystem-based attachment storage

Implements attachment storage using filesystem with Schema.org CreativeWork metadata.
Attachments are stored in a shared directory structure, not tied to individual pages.
Page references are tracked via the "mentions" array in metadata.

Based on JSPWiki's BasicAttachmentProvider:
<https://github.com/apache/jspwiki/blob/master/jspwiki-main/src/main/java/org/apache/wiki/providers/BasicAttachmentProvider.java>

Features:

- Filesystem storage with SHA-256 content hashing
- Schema.org CreativeWork metadata format
- Shared storage model with page mentions tracking
- Automatic metadata persistence
- Backup/restore support

## Extends

- [`default`](../../BaseAttachmentProvider/classes/default.md)

## Constructors

### Constructor

> **new default**(`engine`): `BasicAttachmentProvider`

Defined in: [src/providers/BasicAttachmentProvider.ts:106](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/providers/BasicAttachmentProvider.ts#L106)

#### Parameters

##### engine

`any`

#### Returns

`BasicAttachmentProvider`

#### Overrides

[`default`](../../BaseAttachmentProvider/classes/default.md).[`constructor`](../../BaseAttachmentProvider/classes/default.md#constructor)

## Properties

### engine

> **engine**: `any`

Defined in: [src/providers/BaseAttachmentProvider.ts:60](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/providers/BaseAttachmentProvider.ts#L60)

Reference to the wiki engine

#### Inherited from

[`default`](../../BaseAttachmentProvider/classes/default.md).[`engine`](../../BaseAttachmentProvider/classes/default.md#engine)

***

### initialized

> **initialized**: `boolean`

Defined in: [src/providers/BaseAttachmentProvider.ts:63](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/providers/BaseAttachmentProvider.ts#L63)

Whether provider has been initialized

#### Inherited from

[`default`](../../BaseAttachmentProvider/classes/default.md).[`initialized`](../../BaseAttachmentProvider/classes/default.md#initialized)

## Methods

### attachmentExists()

> **attachmentExists**(`attachmentId`): `Promise`\<`boolean`\>

Defined in: [src/providers/BasicAttachmentProvider.ts:628](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/providers/BasicAttachmentProvider.ts#L628)

Check if attachment exists

#### Parameters

##### attachmentId

`string`

Attachment identifier

#### Returns

`Promise`\<`boolean`\>

True if exists

#### Overrides

[`default`](../../BaseAttachmentProvider/classes/default.md).[`attachmentExists`](../../BaseAttachmentProvider/classes/default.md#attachmentexists)

***

### backup()

> **backup**(): `Promise`\<`BackupData`\>

Defined in: [src/providers/BasicAttachmentProvider.ts:750](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/providers/BasicAttachmentProvider.ts#L750)

Backup provider data

#### Returns

`Promise`\<`BackupData`\>

Backup data

#### Overrides

[`default`](../../BaseAttachmentProvider/classes/default.md).[`backup`](../../BaseAttachmentProvider/classes/default.md#backup)

***

### deleteAttachment()

> **deleteAttachment**(`attachmentId`): `Promise`\<`boolean`\>

Defined in: [src/providers/BasicAttachmentProvider.ts:600](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/providers/BasicAttachmentProvider.ts#L600)

Delete an attachment

#### Parameters

##### attachmentId

`string`

Attachment identifier

#### Returns

`Promise`\<`boolean`\>

True if deleted, false if not found

#### Overrides

[`default`](../../BaseAttachmentProvider/classes/default.md).[`deleteAttachment`](../../BaseAttachmentProvider/classes/default.md#deleteattachment)

***

### deletePageAttachments()

> **deletePageAttachments**(`pageUuid`): `Promise`\<`number`\>

Defined in: [src/providers/BasicAttachmentProvider.ts:703](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/providers/BasicAttachmentProvider.ts#L703)

Delete all attachments for a page

#### Parameters

##### pageUuid

`string`

Page UUID

#### Returns

`Promise`\<`number`\>

Number of attachments deleted

#### Overrides

[`default`](../../BaseAttachmentProvider/classes/default.md).[`deletePageAttachments`](../../BaseAttachmentProvider/classes/default.md#deletepageattachments)

***

### getAllAttachments()

> **getAllAttachments**(): `Promise`\<[`AttachmentMetadata`](../../../types/Provider/interfaces/AttachmentMetadata.md)[]\>

Defined in: [src/providers/BasicAttachmentProvider.ts:636](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/providers/BasicAttachmentProvider.ts#L636)

Get all attachments metadata

#### Returns

`Promise`\<[`AttachmentMetadata`](../../../types/Provider/interfaces/AttachmentMetadata.md)[]\>

Array of attachment metadata

#### Overrides

[`default`](../../BaseAttachmentProvider/classes/default.md).[`getAllAttachments`](../../BaseAttachmentProvider/classes/default.md#getallattachments)

***

### getAttachment()

> **getAttachment**(`attachmentId`): `Promise`\<[`AttachmentResult`](../../BaseAttachmentProvider/interfaces/AttachmentResult.md)\>

Defined in: [src/providers/BasicAttachmentProvider.ts:509](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/providers/BasicAttachmentProvider.ts#L509)

Get attachment file and metadata

#### Parameters

##### attachmentId

`string`

Attachment identifier

#### Returns

`Promise`\<[`AttachmentResult`](../../BaseAttachmentProvider/interfaces/AttachmentResult.md)\>

File buffer and metadata or null

#### Overrides

[`default`](../../BaseAttachmentProvider/classes/default.md).[`getAttachment`](../../BaseAttachmentProvider/classes/default.md#getattachment)

***

### getAttachmentMetadata()

> **getAttachmentMetadata**(`attachmentId`): `Promise`\<[`AttachmentMetadata`](../../../types/Provider/interfaces/AttachmentMetadata.md)\>

Defined in: [src/providers/BasicAttachmentProvider.ts:544](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/providers/BasicAttachmentProvider.ts#L544)

Get attachment metadata only

#### Parameters

##### attachmentId

`string`

Attachment identifier

#### Returns

`Promise`\<[`AttachmentMetadata`](../../../types/Provider/interfaces/AttachmentMetadata.md)\>

Attachment metadata or null

#### Overrides

[`default`](../../BaseAttachmentProvider/classes/default.md).[`getAttachmentMetadata`](../../BaseAttachmentProvider/classes/default.md#getattachmentmetadata)

***

### getAttachmentsForPage()

> **getAttachmentsForPage**(`pageName`): `Promise`\<[`AttachmentMetadata`](../../../types/Provider/interfaces/AttachmentMetadata.md)[]\>

Defined in: [src/providers/BasicAttachmentProvider.ts:658](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/providers/BasicAttachmentProvider.ts#L658)

Get attachments used by a specific page

#### Parameters

##### pageName

`string`

Page name/title

#### Returns

`Promise`\<[`AttachmentMetadata`](../../../types/Provider/interfaces/AttachmentMetadata.md)[]\>

Array of attachment metadata

#### Overrides

[`default`](../../BaseAttachmentProvider/classes/default.md).[`getAttachmentsForPage`](../../BaseAttachmentProvider/classes/default.md#getattachmentsforpage)

***

### getProviderInfo()

> **getProviderInfo**(): `ProviderInfo`

Defined in: [src/providers/BasicAttachmentProvider.ts:730](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/providers/BasicAttachmentProvider.ts#L730)

Get provider information

#### Returns

`ProviderInfo`

Provider metadata

#### Overrides

[`default`](../../BaseAttachmentProvider/classes/default.md).[`getProviderInfo`](../../BaseAttachmentProvider/classes/default.md#getproviderinfo)

***

### initialize()

> **initialize**(): `Promise`\<`void`\>

Defined in: [src/providers/BasicAttachmentProvider.ts:121](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/providers/BasicAttachmentProvider.ts#L121)

Initialize the provider
All configuration access via ConfigurationManager

#### Returns

`Promise`\<`void`\>

#### Overrides

[`default`](../../BaseAttachmentProvider/classes/default.md).[`initialize`](../../BaseAttachmentProvider/classes/default.md#initialize)

***

### listAttachments()

> **listAttachments**(`pageUuid`): `Promise`\<[`AttachmentMetadata`](../../../types/Provider/interfaces/AttachmentMetadata.md)[]\>

Defined in: [src/providers/BasicAttachmentProvider.ts:694](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/providers/BasicAttachmentProvider.ts#L694)

List attachments for a page (AttachmentProvider interface method)

#### Parameters

##### pageUuid

`string`

Page UUID

#### Returns

`Promise`\<[`AttachmentMetadata`](../../../types/Provider/interfaces/AttachmentMetadata.md)[]\>

Array of attachment metadata

#### Overrides

[`default`](../../BaseAttachmentProvider/classes/default.md).[`listAttachments`](../../BaseAttachmentProvider/classes/default.md#listattachments)

***

### refreshAttachmentList()

> **refreshAttachmentList**(): `Promise`\<`void`\>

Defined in: [src/providers/BasicAttachmentProvider.ts:721](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/providers/BasicAttachmentProvider.ts#L721)

Refresh attachment list (rescan storage)

#### Returns

`Promise`\<`void`\>

Promise that resolves when complete

#### Overrides

[`default`](../../BaseAttachmentProvider/classes/default.md).[`refreshAttachmentList`](../../BaseAttachmentProvider/classes/default.md#refreshattachmentlist)

***

### restore()

> **restore**(`backupData`): `Promise`\<`void`\>

Defined in: [src/providers/BasicAttachmentProvider.ts:769](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/providers/BasicAttachmentProvider.ts#L769)

Restore provider data from backup

#### Parameters

##### backupData

`Record`\<`string`, `any`\>

Backup data

#### Returns

`Promise`\<`void`\>

Promise that resolves when complete

#### Overrides

[`default`](../../BaseAttachmentProvider/classes/default.md).[`restore`](../../BaseAttachmentProvider/classes/default.md#restore)

***

### saveAttachment()

> **saveAttachment**(`pageUuid`, `filename`, `buffer`, `metadata`): `Promise`\<[`AttachmentMetadata`](../../../types/Provider/interfaces/AttachmentMetadata.md)\>

Defined in: [src/providers/BasicAttachmentProvider.ts:456](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/providers/BasicAttachmentProvider.ts#L456)

Save attachment (AttachmentProvider interface method - alternative signature)

#### Parameters

##### pageUuid

`string`

Page UUID

##### filename

`string`

Filename

##### buffer

`Buffer`

File buffer

##### metadata

`Record`\<`string`, `any`\> = `{}`

Additional metadata

#### Returns

`Promise`\<[`AttachmentMetadata`](../../../types/Provider/interfaces/AttachmentMetadata.md)\>

Attachment metadata

#### Overrides

[`default`](../../BaseAttachmentProvider/classes/default.md).[`saveAttachment`](../../BaseAttachmentProvider/classes/default.md#saveattachment)

***

### shutdown()

> **shutdown**(): `Promise`\<`void`\>

Defined in: [src/providers/BaseAttachmentProvider.ts:229](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/providers/BaseAttachmentProvider.ts#L229)

Shutdown the provider (cleanup resources)

#### Returns

`Promise`\<`void`\>

#### Inherited from

[`default`](../../BaseAttachmentProvider/classes/default.md).[`shutdown`](../../BaseAttachmentProvider/classes/default.md#shutdown)

***

### storeAttachment()

> **storeAttachment**(`fileBuffer`, `fileInfo`, `metadata`, `user`): `Promise`\<[`AttachmentMetadata`](../../../types/Provider/interfaces/AttachmentMetadata.md)\>

Defined in: [src/providers/BasicAttachmentProvider.ts:410](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/providers/BasicAttachmentProvider.ts#L410)

Store an attachment with metadata (BaseAttachmentProvider interface method)

#### Parameters

##### fileBuffer

`Buffer`

File data

##### fileInfo

[`FileInfo`](../../BaseAttachmentProvider/interfaces/FileInfo.md)

{ originalName, mimeType, size }

##### metadata

`Partial`\<[`AttachmentMetadata`](../../../types/Provider/interfaces/AttachmentMetadata.md)\> = `{}`

Attachment metadata

##### user

[`User`](../../BaseAttachmentProvider/interfaces/User.md) = `null`

User object

#### Returns

`Promise`\<[`AttachmentMetadata`](../../../types/Provider/interfaces/AttachmentMetadata.md)\>

Attachment metadata

#### Overrides

[`default`](../../BaseAttachmentProvider/classes/default.md).[`storeAttachment`](../../BaseAttachmentProvider/classes/default.md#storeattachment)

***

### updateAttachmentMetadata()

> **updateAttachmentMetadata**(`attachmentId`, `updates`): `Promise`\<`boolean`\>

Defined in: [src/providers/BasicAttachmentProvider.ts:572](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/providers/BasicAttachmentProvider.ts#L572)

Update attachment metadata

#### Parameters

##### attachmentId

`string`

Attachment identifier

##### updates

`Partial`\<[`AttachmentMetadata`](../../../types/Provider/interfaces/AttachmentMetadata.md)\>

Metadata updates

#### Returns

`Promise`\<`boolean`\>

Success status

#### Overrides

[`default`](../../BaseAttachmentProvider/classes/default.md).[`updateAttachmentMetadata`](../../BaseAttachmentProvider/classes/default.md#updateattachmentmetadata)
