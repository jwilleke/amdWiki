[**amdWiki API v1.5.0**](../../../../README.md)

***

[amdWiki API](../../../../README.md) / [src/types/Provider](../README.md) / VersioningPageProvider

# Interface: VersioningPageProvider

Defined in: [src/types/Provider.ts:114](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/types/Provider.ts#L114)

Versioning page provider interface

Extended page provider with version history capabilities.

## Extends

- [`PageProvider`](PageProvider.md)

## Properties

### engine

> **engine**: `any`

Defined in: [src/types/Provider.ts:19](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/types/Provider.ts#L19)

Reference to WikiEngine

#### Inherited from

[`PageProvider`](PageProvider.md).[`engine`](PageProvider.md#engine)

***

### initialized

> **initialized**: `boolean`

Defined in: [src/types/Provider.ts:22](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/types/Provider.ts#L22)

Whether provider has been initialized

#### Inherited from

[`PageProvider`](PageProvider.md).[`initialized`](PageProvider.md#initialized)

## Methods

### cleanupVersions()

> **cleanupVersions**(`identifier`): `Promise`\<`number`\>

Defined in: [src/types/Provider.ts:152](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/types/Provider.ts#L152)

Delete old versions based on retention policy

#### Parameters

##### identifier

`string`

Page UUID or title

#### Returns

`Promise`\<`number`\>

Number of versions deleted

***

### compareVersions()

> **compareVersions**(`identifier`, `fromVersion`, `toVersion`): `Promise`\<[`VersionDiff`](../../Version/interfaces/VersionDiff.md)\>

Defined in: [src/types/Provider.ts:145](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/types/Provider.ts#L145)

Compare two versions

#### Parameters

##### identifier

`string`

Page UUID or title

##### fromVersion

`number`

Old version number

##### toVersion

`number`

New version number

#### Returns

`Promise`\<[`VersionDiff`](../../Version/interfaces/VersionDiff.md)\>

Version diff object

***

### compressVersions()

> **compressVersions**(`identifier`, `olderThanDays?`): `Promise`\<`number`\>

Defined in: [src/types/Provider.ts:160](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/types/Provider.ts#L160)

Compress old versions

#### Parameters

##### identifier

`string`

Page UUID or title

##### olderThanDays?

`number`

Compress versions older than N days

#### Returns

`Promise`\<`number`\>

Number of versions compressed

***

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

#### Inherited from

[`PageProvider`](PageProvider.md).[`deletePage`](PageProvider.md#deletepage)

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

#### Inherited from

[`PageProvider`](PageProvider.md).[`findPage`](PageProvider.md#findpage)

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

#### Inherited from

[`PageProvider`](PageProvider.md).[`getAllPageInfo`](PageProvider.md#getallpageinfo)

***

### getAllPages()

> **getAllPages**(): `Promise`\<`string`[]\>

Defined in: [src/types/Provider.ts:86](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/types/Provider.ts#L86)

Get all page titles

#### Returns

`Promise`\<`string`[]\>

Sorted array of page titles

#### Inherited from

[`PageProvider`](PageProvider.md).[`getAllPages`](PageProvider.md#getallpages)

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

#### Inherited from

[`PageProvider`](PageProvider.md).[`getPage`](PageProvider.md#getpage)

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

#### Inherited from

[`PageProvider`](PageProvider.md).[`getPageContent`](PageProvider.md#getpagecontent)

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

#### Inherited from

[`PageProvider`](PageProvider.md).[`getPageMetadata`](PageProvider.md#getpagemetadata)

***

### getVersion()

> **getVersion**(`identifier`, `version`): `Promise`\<[`VersionContent`](../../Version/interfaces/VersionContent.md)\>

Defined in: [src/types/Provider.ts:129](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/types/Provider.ts#L129)

Get specific version content

#### Parameters

##### identifier

`string`

Page UUID or title

##### version

`number`

Version number

#### Returns

`Promise`\<[`VersionContent`](../../Version/interfaces/VersionContent.md)\>

Version content object

***

### getVersionHistory()

> **getVersionHistory**(`identifier`, `limit?`): `Promise`\<[`VersionHistoryEntry`](../../Version/interfaces/VersionHistoryEntry.md)[]\>

Defined in: [src/types/Provider.ts:121](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/types/Provider.ts#L121)

Get version history for a page

#### Parameters

##### identifier

`string`

Page UUID or title

##### limit?

`number`

Maximum number of versions to return

#### Returns

`Promise`\<[`VersionHistoryEntry`](../../Version/interfaces/VersionHistoryEntry.md)[]\>

Array of version history entries

***

### getVersionManifest()

> **getVersionManifest**(`identifier`): `Promise`\<[`VersionManifest`](../../Version/interfaces/VersionManifest.md)\>

Defined in: [src/types/Provider.ts:136](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/types/Provider.ts#L136)

Get version manifest

#### Parameters

##### identifier

`string`

Page UUID or title

#### Returns

`Promise`\<[`VersionManifest`](../../Version/interfaces/VersionManifest.md)\>

Version manifest object

***

### initialize()

> **initialize**(): `Promise`\<`void`\>

Defined in: [src/types/Provider.ts:28](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/types/Provider.ts#L28)

Initialize the provider

#### Returns

`Promise`\<`void`\>

Promise that resolves when initialization is complete

#### Inherited from

[`PageProvider`](PageProvider.md).[`initialize`](PageProvider.md#initialize)

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

#### Inherited from

[`PageProvider`](PageProvider.md).[`pageExists`](PageProvider.md#pageexists)

***

### refreshPageList()

> **refreshPageList**(): `Promise`\<`void`\>

Defined in: [src/types/Provider.ts:106](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/types/Provider.ts#L106)

Refresh page cache

#### Returns

`Promise`\<`void`\>

Promise that resolves when refresh is complete

#### Inherited from

[`PageProvider`](PageProvider.md).[`refreshPageList`](PageProvider.md#refreshpagelist)

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

#### Inherited from

[`PageProvider`](PageProvider.md).[`savePage`](PageProvider.md#savepage)
