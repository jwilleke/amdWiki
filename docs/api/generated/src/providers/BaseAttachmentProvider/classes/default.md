[**amdWiki API v1.5.0**](../../../../README.md)

***

[amdWiki API](../../../../README.md) / [src/providers/BaseAttachmentProvider](../README.md) / default

# Abstract Class: default

Defined in: [src/providers/BaseAttachmentProvider.ts:58](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/providers/BaseAttachmentProvider.ts#L58)

BaseAttachmentProvider - Abstract interface for attachment storage providers

All attachment storage providers must extend this class and implement its methods.
Providers handle the actual storage and retrieval of wiki attachments (files, images, etc.),
whether from filesystem, database, cloud storage, or other backends.

Following JSPWiki's attachment provider pattern.

 BaseAttachmentProvider

## See

 - BasicAttachmentProvider for filesystem implementation
 - AttachmentManager for usage

## Extended by

- [`default`](../../BasicAttachmentProvider/classes/default.md)

## Implements

- [`AttachmentProvider`](../../../types/Provider/interfaces/AttachmentProvider.md)

## Constructors

### Constructor

> **new default**(`engine`): `BaseAttachmentProvider`

Defined in: [src/providers/BaseAttachmentProvider.ts:72](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/providers/BaseAttachmentProvider.ts#L72)

Create a new attachment provider

#### Parameters

##### engine

[`WikiEngine`](../../BasePageProvider/interfaces/WikiEngine.md)

The WikiEngine instance

#### Returns

`BaseAttachmentProvider`

#### Throws

If engine is not provided

## Properties

### engine

> **engine**: `any`

Defined in: [src/providers/BaseAttachmentProvider.ts:60](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/providers/BaseAttachmentProvider.ts#L60)

Reference to the wiki engine

#### Implementation of

[`AttachmentProvider`](../../../types/Provider/interfaces/AttachmentProvider.md).[`engine`](../../../types/Provider/interfaces/AttachmentProvider.md#engine)

***

### initialized

> **initialized**: `boolean`

Defined in: [src/providers/BaseAttachmentProvider.ts:63](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/providers/BaseAttachmentProvider.ts#L63)

Whether provider has been initialized

#### Implementation of

[`AttachmentProvider`](../../../types/Provider/interfaces/AttachmentProvider.md).[`initialized`](../../../types/Provider/interfaces/AttachmentProvider.md#initialized)

## Methods

### attachmentExists()

> `abstract` **attachmentExists**(`attachmentId`): `Promise`\<`boolean`\>

Defined in: [src/providers/BaseAttachmentProvider.ts:162](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/providers/BaseAttachmentProvider.ts#L162)

Check if attachment exists

#### Parameters

##### attachmentId

`string`

Attachment identifier

#### Returns

`Promise`\<`boolean`\>

***

### backup()

> `abstract` **backup**(): `Promise`\<`Record`\<`string`, `any`\>\>

Defined in: [src/providers/BaseAttachmentProvider.ts:216](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/providers/BaseAttachmentProvider.ts#L216)

Backup provider data
Returns all metadata needed to restore attachments

#### Returns

`Promise`\<`Record`\<`string`, `any`\>\>

Backup data

***

### deleteAttachment()

> `abstract` **deleteAttachment**(`attachmentId`): `Promise`\<`boolean`\>

Defined in: [src/providers/BaseAttachmentProvider.ts:155](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/providers/BaseAttachmentProvider.ts#L155)

Delete an attachment

#### Parameters

##### attachmentId

`string`

Attachment identifier

#### Returns

`Promise`\<`boolean`\>

True if deleted, false if not found

#### Implementation of

[`AttachmentProvider`](../../../types/Provider/interfaces/AttachmentProvider.md).[`deleteAttachment`](../../../types/Provider/interfaces/AttachmentProvider.md#deleteattachment)

***

### deletePageAttachments()

> `abstract` **deletePageAttachments**(`pageUuid`): `Promise`\<`number`\>

Defined in: [src/providers/BaseAttachmentProvider.ts:189](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/providers/BaseAttachmentProvider.ts#L189)

Delete all attachments for a page

#### Parameters

##### pageUuid

`string`

Page UUID

#### Returns

`Promise`\<`number`\>

Number of attachments deleted

#### Implementation of

[`AttachmentProvider`](../../../types/Provider/interfaces/AttachmentProvider.md).[`deletePageAttachments`](../../../types/Provider/interfaces/AttachmentProvider.md#deletepageattachments)

***

### getAllAttachments()

> `abstract` **getAllAttachments**(): `Promise`\<[`AttachmentMetadata`](../../../types/Provider/interfaces/AttachmentMetadata.md)[]\>

Defined in: [src/providers/BaseAttachmentProvider.ts:168](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/providers/BaseAttachmentProvider.ts#L168)

Get all attachments metadata (without file data)

#### Returns

`Promise`\<[`AttachmentMetadata`](../../../types/Provider/interfaces/AttachmentMetadata.md)[]\>

Array of attachment metadata

***

### getAttachment()

> `abstract` **getAttachment**(`attachmentId`): `Promise`\<[`AttachmentResult`](../interfaces/AttachmentResult.md)\>

Defined in: [src/providers/BaseAttachmentProvider.ts:130](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/providers/BaseAttachmentProvider.ts#L130)

Get attachment file data

#### Parameters

##### attachmentId

`string`

Attachment identifier

#### Returns

`Promise`\<[`AttachmentResult`](../interfaces/AttachmentResult.md)\>

File buffer and metadata

#### Implementation of

[`AttachmentProvider`](../../../types/Provider/interfaces/AttachmentProvider.md).[`getAttachment`](../../../types/Provider/interfaces/AttachmentProvider.md#getattachment)

***

### getAttachmentMetadata()

> `abstract` **getAttachmentMetadata**(`attachmentId`): `Promise`\<[`AttachmentMetadata`](../../../types/Provider/interfaces/AttachmentMetadata.md)\>

Defined in: [src/providers/BaseAttachmentProvider.ts:137](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/providers/BaseAttachmentProvider.ts#L137)

Get attachment metadata only (no file data)

#### Parameters

##### attachmentId

`string`

Attachment identifier

#### Returns

`Promise`\<[`AttachmentMetadata`](../../../types/Provider/interfaces/AttachmentMetadata.md)\>

Attachment metadata

#### Implementation of

[`AttachmentProvider`](../../../types/Provider/interfaces/AttachmentProvider.md).[`getAttachmentMetadata`](../../../types/Provider/interfaces/AttachmentProvider.md#getattachmentmetadata)

***

### getAttachmentsForPage()

> `abstract` **getAttachmentsForPage**(`pageName`): `Promise`\<[`AttachmentMetadata`](../../../types/Provider/interfaces/AttachmentMetadata.md)[]\>

Defined in: [src/providers/BaseAttachmentProvider.ts:175](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/providers/BaseAttachmentProvider.ts#L175)

Get attachments used by a specific page

#### Parameters

##### pageName

`string`

Page name/title

#### Returns

`Promise`\<[`AttachmentMetadata`](../../../types/Provider/interfaces/AttachmentMetadata.md)[]\>

Array of attachment metadata

***

### getProviderInfo()

> **getProviderInfo**(): [`ProviderInfo`](../../BasePageProvider/interfaces/ProviderInfo.md)

Defined in: [src/providers/BaseAttachmentProvider.ts:202](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/providers/BaseAttachmentProvider.ts#L202)

Get provider information

#### Returns

[`ProviderInfo`](../../BasePageProvider/interfaces/ProviderInfo.md)

Provider metadata

***

### initialize()

> `abstract` **initialize**(): `Promise`\<`void`\>

Defined in: [src/providers/BaseAttachmentProvider.ts:91](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/providers/BaseAttachmentProvider.ts#L91)

Initialize the provider

IMPORTANT: Providers MUST access configuration via ConfigurationManager:
  const configManager = this.engine.getManager('ConfigurationManager');
  const value = configManager.getProperty('key', 'default');

Do NOT read configuration files directly.

#### Returns

`Promise`\<`void`\>

#### Implementation of

[`AttachmentProvider`](../../../types/Provider/interfaces/AttachmentProvider.md).[`initialize`](../../../types/Provider/interfaces/AttachmentProvider.md#initialize)

***

### listAttachments()

> `abstract` **listAttachments**(`pageUuid`): `Promise`\<[`AttachmentMetadata`](../../../types/Provider/interfaces/AttachmentMetadata.md)[]\>

Defined in: [src/providers/BaseAttachmentProvider.ts:182](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/providers/BaseAttachmentProvider.ts#L182)

List attachments for a page (AttachmentProvider interface method)

#### Parameters

##### pageUuid

`string`

Page UUID

#### Returns

`Promise`\<[`AttachmentMetadata`](../../../types/Provider/interfaces/AttachmentMetadata.md)[]\>

Array of attachment metadata

#### Implementation of

[`AttachmentProvider`](../../../types/Provider/interfaces/AttachmentProvider.md).[`listAttachments`](../../../types/Provider/interfaces/AttachmentProvider.md#listattachments)

***

### refreshAttachmentList()

> `abstract` **refreshAttachmentList**(): `Promise`\<`void`\>

Defined in: [src/providers/BaseAttachmentProvider.ts:196](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/providers/BaseAttachmentProvider.ts#L196)

Refresh internal cache/index
Re-scans storage and rebuilds indexes

#### Returns

`Promise`\<`void`\>

***

### restore()

> `abstract` **restore**(`backupData`): `Promise`\<`void`\>

Defined in: [src/providers/BaseAttachmentProvider.ts:223](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/providers/BaseAttachmentProvider.ts#L223)

Restore provider data from backup

#### Parameters

##### backupData

`Record`\<`string`, `any`\>

Backup data from backup()

#### Returns

`Promise`\<`void`\>

***

### saveAttachment()

> `abstract` **saveAttachment**(`pageUuid`, `filename`, `buffer`, `metadata?`): `Promise`\<[`AttachmentMetadata`](../../../types/Provider/interfaces/AttachmentMetadata.md)\>

Defined in: [src/providers/BaseAttachmentProvider.ts:101](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/providers/BaseAttachmentProvider.ts#L101)

Save attachment

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

##### metadata?

`Record`\<`string`, `any`\>

Additional metadata

#### Returns

`Promise`\<[`AttachmentMetadata`](../../../types/Provider/interfaces/AttachmentMetadata.md)\>

Attachment metadata

#### Implementation of

[`AttachmentProvider`](../../../types/Provider/interfaces/AttachmentProvider.md).[`saveAttachment`](../../../types/Provider/interfaces/AttachmentProvider.md#saveattachment)

***

### shutdown()

> **shutdown**(): `Promise`\<`void`\>

Defined in: [src/providers/BaseAttachmentProvider.ts:229](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/providers/BaseAttachmentProvider.ts#L229)

Shutdown the provider (cleanup resources)

#### Returns

`Promise`\<`void`\>

***

### storeAttachment()

> **storeAttachment**(`fileBuffer`, `fileInfo`, `metadata`, `user`): `Promise`\<[`AttachmentMetadata`](../../../types/Provider/interfaces/AttachmentMetadata.md)\>

Defined in: [src/providers/BaseAttachmentProvider.ts:116](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/providers/BaseAttachmentProvider.ts#L116)

Upload/store an attachment with metadata (legacy method for backward compatibility)

#### Parameters

##### fileBuffer

`Buffer`

File data

##### fileInfo

[`FileInfo`](../interfaces/FileInfo.md)

File information (originalName, mimeType, size)

##### metadata

`Partial`\<[`AttachmentMetadata`](../../../types/Provider/interfaces/AttachmentMetadata.md)\> = `{}`

Attachment metadata

##### user

[`User`](../interfaces/User.md) = `null`

User uploading the attachment

#### Returns

`Promise`\<[`AttachmentMetadata`](../../../types/Provider/interfaces/AttachmentMetadata.md)\>

Attachment metadata with ID

***

### updateAttachmentMetadata()

> `abstract` **updateAttachmentMetadata**(`attachmentId`, `metadata`): `Promise`\<`boolean`\>

Defined in: [src/providers/BaseAttachmentProvider.ts:145](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/providers/BaseAttachmentProvider.ts#L145)

Update attachment metadata (e.g., add page reference)

#### Parameters

##### attachmentId

`string`

Attachment identifier

##### metadata

`Partial`\<[`AttachmentMetadata`](../../../types/Provider/interfaces/AttachmentMetadata.md)\>

Updated metadata

#### Returns

`Promise`\<`boolean`\>

Success status
