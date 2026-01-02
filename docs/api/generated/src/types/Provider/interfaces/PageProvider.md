[**amdWiki API v1.5.0**](../../../../README.md)

***

[amdWiki API](../../../../README.md) / [src/types/Provider](../README.md) / PageProvider

# Interface: PageProvider

Defined in: [src/types/Provider.ts:44](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/types/Provider.ts#L44)

Page provider interface

Defines the contract for page storage backends (filesystem, database, etc.).

## Extends

- [`BaseProvider`](BaseProvider.md)

## Extended by

- [`VersioningPageProvider`](VersioningPageProvider.md)

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

### deletePage()

> **deletePage**(`identifier`): `Promise`\<`boolean`\>

Defined in: [src/types/Provider.ts:81](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/types/Provider.ts#L81)

Delete a page

#### Parameters

##### identifier

`string`

Page UUID or title

#### Returns

`Promise`\<`boolean`\>

True if deleted, false if not found

***

### findPage()

> **findPage**(`identifier`): `string`

Defined in: [src/types/Provider.ts:108](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/types/Provider.ts#L108)

Find page by various identifiers

#### Parameters

##### identifier

`string`

UUID, title, or slug

#### Returns

`string`

Canonical page title or null

***

### getAllPageInfo()

> **getAllPageInfo**(`options?`): `Promise`\<[`PageInfo`](../../Page/interfaces/PageInfo.md)[]\>

Defined in: [src/types/Provider.ts:101](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/types/Provider.ts#L101)

Get all page info objects

#### Parameters

##### options?

[`PageListOptions`](../../Page/interfaces/PageListOptions.md)

List options

#### Returns

`Promise`\<[`PageInfo`](../../Page/interfaces/PageInfo.md)[]\>

Array of page info objects

***

### getAllPages()

> **getAllPages**(): `Promise`\<`string`[]\>

Defined in: [src/types/Provider.ts:94](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/types/Provider.ts#L94)

Get all page titles

#### Returns

`Promise`\<`string`[]\>

Sorted array of page titles

***

### getPage()

> **getPage**(`identifier`): `Promise`\<[`WikiPage`](../../Page/interfaces/WikiPage.md)\>

Defined in: [src/types/Provider.ts:50](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/types/Provider.ts#L50)

Get complete page with content and metadata

#### Parameters

##### identifier

`string`

Page UUID, title, or slug

#### Returns

`Promise`\<[`WikiPage`](../../Page/interfaces/WikiPage.md)\>

Page object or null if not found

***

### getPageContent()

> **getPageContent**(`identifier`): `Promise`\<`string`\>

Defined in: [src/types/Provider.ts:57](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/types/Provider.ts#L57)

Get only page content (without metadata)

#### Parameters

##### identifier

`string`

Page UUID, title, or slug

#### Returns

`Promise`\<`string`\>

Markdown content

***

### getPageMetadata()

> **getPageMetadata**(`identifier`): `Promise`\<[`PageFrontmatter`](../../Page/interfaces/PageFrontmatter.md)\>

Defined in: [src/types/Provider.ts:64](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/types/Provider.ts#L64)

Get only page metadata (without content)

#### Parameters

##### identifier

`string`

Page UUID, title, or slug

#### Returns

`Promise`\<[`PageFrontmatter`](../../Page/interfaces/PageFrontmatter.md)\>

Metadata object or null if not found

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

### pageExists()

> **pageExists**(`identifier`): `boolean`

Defined in: [src/types/Provider.ts:88](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/types/Provider.ts#L88)

Check if page exists

#### Parameters

##### identifier

`string`

Page UUID or title

#### Returns

`boolean`

True if page exists

***

### refreshPageList()

> **refreshPageList**(): `Promise`\<`void`\>

Defined in: [src/types/Provider.ts:114](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/types/Provider.ts#L114)

Refresh page cache

#### Returns

`Promise`\<`void`\>

Promise that resolves when refresh is complete

***

### savePage()

> **savePage**(`pageName`, `content`, `metadata?`, `options?`): `Promise`\<`void`\>

Defined in: [src/types/Provider.ts:74](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/types/Provider.ts#L74)

Save page content and metadata

#### Parameters

##### pageName

`string`

Page title

##### content

`string`

Markdown content

##### metadata?

`Partial`\<[`PageFrontmatter`](../../Page/interfaces/PageFrontmatter.md)\>

Frontmatter metadata

##### options?

[`PageSaveOptions`](../../Page/interfaces/PageSaveOptions.md)

Save options

#### Returns

`Promise`\<`void`\>

Promise that resolves when save is complete

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
