[**amdWiki API v1.5.0**](../../../../README.md)

***

[amdWiki API](../../../../README.md) / [src/types/Provider](../README.md) / VersioningPageProvider

# Interface: VersioningPageProvider

Defined in: [src/types/Provider.ts:122](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/types/Provider.ts#L122)

Versioning page provider interface

Extended page provider with version history capabilities.

## Extends

- [`PageProvider`](PageProvider.md)

## Properties

### engine

> **engine**: [`WikiEngine`](../../WikiEngine/interfaces/WikiEngine.md)

Defined in: [src/types/Provider.ts:21](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/types/Provider.ts#L21)

Reference to WikiEngine

#### Inherited from

[`PageProvider`](PageProvider.md).[`engine`](PageProvider.md#engine)

***

### initialized

> **initialized**: `boolean`

Defined in: [src/types/Provider.ts:24](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/types/Provider.ts#L24)

Whether provider has been initialized

#### Inherited from

[`PageProvider`](PageProvider.md).[`initialized`](PageProvider.md#initialized)

## Methods

### cleanupVersions()

> **cleanupVersions**(`identifier`): `Promise`\<`number`\>

Defined in: [src/types/Provider.ts:160](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/types/Provider.ts#L160)

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

Defined in: [src/types/Provider.ts:153](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/types/Provider.ts#L153)

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

Defined in: [src/types/Provider.ts:168](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/types/Provider.ts#L168)

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

Defined in: [src/types/Provider.ts:81](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/types/Provider.ts#L81)

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

Defined in: [src/types/Provider.ts:108](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/types/Provider.ts#L108)

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

Defined in: [src/types/Provider.ts:101](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/types/Provider.ts#L101)

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

Defined in: [src/types/Provider.ts:94](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/types/Provider.ts#L94)

Get all page titles

#### Returns

`Promise`\<`string`[]\>

Sorted array of page titles

#### Inherited from

[`PageProvider`](PageProvider.md).[`getAllPages`](PageProvider.md#getallpages)

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

#### Inherited from

[`PageProvider`](PageProvider.md).[`getPage`](PageProvider.md#getpage)

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

#### Inherited from

[`PageProvider`](PageProvider.md).[`getPageContent`](PageProvider.md#getpagecontent)

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

#### Inherited from

[`PageProvider`](PageProvider.md).[`getPageMetadata`](PageProvider.md#getpagemetadata)

***

### getVersion()

> **getVersion**(`identifier`, `version`): `Promise`\<[`VersionContent`](../../Version/interfaces/VersionContent.md)\>

Defined in: [src/types/Provider.ts:137](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/types/Provider.ts#L137)

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

Defined in: [src/types/Provider.ts:129](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/types/Provider.ts#L129)

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

Defined in: [src/types/Provider.ts:144](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/types/Provider.ts#L144)

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

Defined in: [src/types/Provider.ts:30](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/types/Provider.ts#L30)

Initialize the provider

#### Returns

`Promise`\<`void`\>

Promise that resolves when initialization is complete

#### Inherited from

[`PageProvider`](PageProvider.md).[`initialize`](PageProvider.md#initialize)

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

#### Inherited from

[`PageProvider`](PageProvider.md).[`pageExists`](PageProvider.md#pageexists)

***

### refreshPageList()

> **refreshPageList**(): `Promise`\<`void`\>

Defined in: [src/types/Provider.ts:114](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/types/Provider.ts#L114)

Refresh page cache

#### Returns

`Promise`\<`void`\>

Promise that resolves when refresh is complete

#### Inherited from

[`PageProvider`](PageProvider.md).[`refreshPageList`](PageProvider.md#refreshpagelist)

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

#### Inherited from

[`PageProvider`](PageProvider.md).[`savePage`](PageProvider.md#savepage)

***

### shutdown()?

> `optional` **shutdown**(): `Promise`\<`void`\>

Defined in: [src/types/Provider.ts:36](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/types/Provider.ts#L36)

Shutdown the provider (optional)

#### Returns

`Promise`\<`void`\>

Promise that resolves when shutdown is complete

#### Inherited from

[`PageProvider`](PageProvider.md).[`shutdown`](PageProvider.md#shutdown)
