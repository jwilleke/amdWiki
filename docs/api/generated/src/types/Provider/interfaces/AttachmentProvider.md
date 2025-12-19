[**amdWiki API v1.5.0**](../../../../README.md)

***

[amdWiki API](../../../../README.md) / [src/types/Provider](../README.md) / AttachmentProvider

# Interface: AttachmentProvider

Defined in: [src/types/Provider.ts:288](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/types/Provider.ts#L288)

Attachment provider interface

Defines the contract for attachment storage backends.

## Extends

- [`BaseProvider`](BaseProvider.md)

## Properties

### engine

> **engine**: `any`

Defined in: [src/types/Provider.ts:19](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/types/Provider.ts#L19)

Reference to WikiEngine

#### Inherited from

[`BaseProvider`](BaseProvider.md).[`engine`](BaseProvider.md#engine)

***

### initialized

> **initialized**: `boolean`

Defined in: [src/types/Provider.ts:22](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/types/Provider.ts#L22)

Whether provider has been initialized

#### Inherited from

[`BaseProvider`](BaseProvider.md).[`initialized`](BaseProvider.md#initialized)

## Methods

### deleteAttachment()

> **deleteAttachment**(`attachmentId`): `Promise`\<`boolean`\>

Defined in: [src/types/Provider.ts:325](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/types/Provider.ts#L325)

Delete attachment

#### Parameters

##### attachmentId

`string`

Attachment ID

#### Returns

`Promise`\<`boolean`\>

True if deleted, false if not found

***

### deletePageAttachments()

> **deletePageAttachments**(`pageUuid`): `Promise`\<`number`\>

Defined in: [src/types/Provider.ts:332](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/types/Provider.ts#L332)

Delete all attachments for a page

#### Parameters

##### pageUuid

`string`

Page UUID

#### Returns

`Promise`\<`number`\>

Number of attachments deleted

***

### getAttachment()

> **getAttachment**(`attachmentId`): `Promise`\<\{ `buffer`: `Buffer`; `metadata`: [`AttachmentMetadata`](AttachmentMetadata.md); \}\>

Defined in: [src/types/Provider.ts:304](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/types/Provider.ts#L304)

Get attachment

#### Parameters

##### attachmentId

`string`

Attachment ID

#### Returns

`Promise`\<\{ `buffer`: `Buffer`; `metadata`: [`AttachmentMetadata`](AttachmentMetadata.md); \}\>

File buffer and metadata

***

### getAttachmentMetadata()

> **getAttachmentMetadata**(`attachmentId`): `Promise`\<[`AttachmentMetadata`](AttachmentMetadata.md)\>

Defined in: [src/types/Provider.ts:311](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/types/Provider.ts#L311)

Get attachment metadata

#### Parameters

##### attachmentId

`string`

Attachment ID

#### Returns

`Promise`\<[`AttachmentMetadata`](AttachmentMetadata.md)\>

Attachment metadata or null

***

### initialize()

> **initialize**(): `Promise`\<`void`\>

Defined in: [src/types/Provider.ts:28](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/types/Provider.ts#L28)

Initialize the provider

#### Returns

`Promise`\<`void`\>

Promise that resolves when initialization is complete

#### Inherited from

[`BaseProvider`](BaseProvider.md).[`initialize`](BaseProvider.md#initialize)

***

### listAttachments()

> **listAttachments**(`pageUuid`): `Promise`\<[`AttachmentMetadata`](AttachmentMetadata.md)[]\>

Defined in: [src/types/Provider.ts:318](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/types/Provider.ts#L318)

List attachments for a page

#### Parameters

##### pageUuid

`string`

Page UUID

#### Returns

`Promise`\<[`AttachmentMetadata`](AttachmentMetadata.md)[]\>

Array of attachment metadata

***

### saveAttachment()

> **saveAttachment**(`pageUuid`, `filename`, `buffer`, `metadata?`): `Promise`\<[`AttachmentMetadata`](AttachmentMetadata.md)\>

Defined in: [src/types/Provider.ts:297](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/types/Provider.ts#L297)

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

`Promise`\<[`AttachmentMetadata`](AttachmentMetadata.md)\>

Attachment metadata
