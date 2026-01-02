[**amdWiki API v1.5.0**](../../../../README.md)

***

[amdWiki API](../../../../README.md) / [src/types/Provider](../README.md) / AttachmentProvider

# Interface: AttachmentProvider

Defined in: [src/types/Provider.ts:315](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/types/Provider.ts#L315)

Attachment provider interface

Defines the contract for attachment storage backends.

## Extends

- [`BaseProvider`](BaseProvider.md)

## Properties

### engine

> **engine**: [`WikiEngine`](../../WikiEngine/interfaces/WikiEngine.md)

Defined in: [src/types/Provider.ts:21](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/types/Provider.ts#L21)

Reference to WikiEngine

#### Inherited from

[`BaseProvider`](BaseProvider.md).[`engine`](BaseProvider.md#engine)

***

### initialized

> **initialized**: `boolean`

Defined in: [src/types/Provider.ts:24](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/types/Provider.ts#L24)

Whether provider has been initialized

#### Inherited from

[`BaseProvider`](BaseProvider.md).[`initialized`](BaseProvider.md#initialized)

## Methods

### deleteAttachment()

> **deleteAttachment**(`attachmentId`): `Promise`\<`boolean`\>

Defined in: [src/types/Provider.ts:352](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/types/Provider.ts#L352)

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

Defined in: [src/types/Provider.ts:359](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/types/Provider.ts#L359)

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

Defined in: [src/types/Provider.ts:331](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/types/Provider.ts#L331)

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

Defined in: [src/types/Provider.ts:338](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/types/Provider.ts#L338)

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

Defined in: [src/types/Provider.ts:30](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/types/Provider.ts#L30)

Initialize the provider

#### Returns

`Promise`\<`void`\>

Promise that resolves when initialization is complete

#### Inherited from

[`BaseProvider`](BaseProvider.md).[`initialize`](BaseProvider.md#initialize)

***

### listAttachments()

> **listAttachments**(`pageUuid`): `Promise`\<[`AttachmentMetadata`](AttachmentMetadata.md)[]\>

Defined in: [src/types/Provider.ts:345](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/types/Provider.ts#L345)

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

Defined in: [src/types/Provider.ts:324](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/types/Provider.ts#L324)

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

***

### shutdown()?

> `optional` **shutdown**(): `Promise`\<`void`\>

Defined in: [src/types/Provider.ts:36](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/types/Provider.ts#L36)

Shutdown the provider (optional)

#### Returns

`Promise`\<`void`\>

Promise that resolves when shutdown is complete

#### Inherited from

[`BaseProvider`](BaseProvider.md).[`shutdown`](BaseProvider.md#shutdown)
