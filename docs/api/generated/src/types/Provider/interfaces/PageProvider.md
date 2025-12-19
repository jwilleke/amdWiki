[**amdWiki API v1.5.0**](../../../../README.md)

***

[amdWiki API](../../../../README.md) / [src/types/Provider](../README.md) / PageProvider

# Interface: PageProvider

Defined in: [src/types/Provider.ts:36](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/types/Provider.ts#L36)

Page provider interface

Defines the contract for page storage backends (filesystem, database, etc.).

## Extends

- [`BaseProvider`](BaseProvider.md)

## Extended by

- [`VersioningPageProvider`](VersioningPageProvider.md)

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

### deletePage()

> **deletePage**(`identifier`): `Promise`\<`boolean`\>

Defined in: [src/types/Provider.ts:73](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/types/Provider.ts#L73)

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

Defined in: [src/types/Provider.ts:100](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/types/Provider.ts#L100)

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

Defined in: [src/types/Provider.ts:93](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/types/Provider.ts#L93)

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

Defined in: [src/types/Provider.ts:86](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/types/Provider.ts#L86)

Get all page titles

#### Returns

`Promise`\<`string`[]\>

Sorted array of page titles

***

### getPage()

> **getPage**(`identifier`): `Promise`\<[`WikiPage`](../../Page/interfaces/WikiPage.md)\>

Defined in: [src/types/Provider.ts:42](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/types/Provider.ts#L42)

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

Defined in: [src/types/Provider.ts:49](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/types/Provider.ts#L49)

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

Defined in: [src/types/Provider.ts:56](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/types/Provider.ts#L56)

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

Defined in: [src/types/Provider.ts:28](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/types/Provider.ts#L28)

Initialize the provider

#### Returns

`Promise`\<`void`\>

Promise that resolves when initialization is complete

#### Inherited from

[`BaseProvider`](BaseProvider.md).[`initialize`](BaseProvider.md#initialize)

***

### pageExists()

> **pageExists**(`identifier`): `boolean`

Defined in: [src/types/Provider.ts:80](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/types/Provider.ts#L80)

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

Defined in: [src/types/Provider.ts:106](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/types/Provider.ts#L106)

Refresh page cache

#### Returns

`Promise`\<`void`\>

Promise that resolves when refresh is complete

***

### savePage()

> **savePage**(`pageName`, `content`, `metadata?`, `options?`): `Promise`\<`void`\>

Defined in: [src/types/Provider.ts:66](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/types/Provider.ts#L66)

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
