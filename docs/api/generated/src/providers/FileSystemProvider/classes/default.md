[**amdWiki API v1.5.0**](../../../../README.md)

***

[amdWiki API](../../../../README.md) / [src/providers/FileSystemProvider](../README.md) / default

# Class: default

Defined in: [src/providers/FileSystemProvider.ts:73](https://github.com/jwilleke/amdWiki/blob/b6a859c7c9297966de89735ea5e8f953df289ac1/src/providers/FileSystemProvider.ts#L73)

FileSystemProvider - Markdown file-based page storage provider

Implements page storage using filesystem with YAML frontmatter metadata.
Pages are stored as .md files in configurable directories with UUID-based
filenames for reliable identification.

Key features:
- UUID-based file naming for reliable page identity
- Title-based lookup with case-insensitive matching
- Plural name matching support (e.g., "Page" matches "Pages")
- Dual storage locations (regular pages and required/system pages)
- In-memory caching with multiple lookup indexes
- Gray-matter for frontmatter parsing
- Configurable encoding support

Configuration keys (all lowercase):
- amdwiki.page.provider.filesystem.storagedir - Main pages directory
- amdwiki.page.provider.filesystem.requiredpagesdir - Required pages directory
- amdwiki.page.provider.filesystem.encoding - File encoding (default: utf-8)
- amdwiki.translator-reader.match-english-plurals - Enable plural matching

 FileSystemProvider

## See

 - [BasePageProvider](../../BasePageProvider/classes/default.md) for base interface
 - PageManager for usage

## Extends

- [`default`](../../BasePageProvider/classes/default.md)

## Extended by

- [`default`](../../VersioningFileProvider/classes/default.md)

## Constructors

### Constructor

> **new default**(`engine`): `FileSystemProvider`

Defined in: [src/providers/FileSystemProvider.ts:107](https://github.com/jwilleke/amdWiki/blob/b6a859c7c9297966de89735ea5e8f953df289ac1/src/providers/FileSystemProvider.ts#L107)

Creates a new FileSystemProvider instance

#### Parameters

##### engine

[`WikiEngine`](../../BasePageProvider/interfaces/WikiEngine.md)

The wiki engine instance

#### Returns

`FileSystemProvider`

#### Overrides

[`default`](../../BasePageProvider/classes/default.md).[`constructor`](../../BasePageProvider/classes/default.md#constructor)

## Properties

### encoding

> `protected` **encoding**: `BufferEncoding`

Defined in: [src/providers/FileSystemProvider.ts:81](https://github.com/jwilleke/amdWiki/blob/b6a859c7c9297966de89735ea5e8f953df289ac1/src/providers/FileSystemProvider.ts#L81)

File encoding

***

### engine

> `protected` **engine**: [`WikiEngine`](../../BasePageProvider/interfaces/WikiEngine.md)

Defined in: [src/providers/BasePageProvider.ts:54](https://github.com/jwilleke/amdWiki/blob/b6a859c7c9297966de89735ea5e8f953df289ac1/src/providers/BasePageProvider.ts#L54)

Reference to the wiki engine

#### Inherited from

[`default`](../../BasePageProvider/classes/default.md).[`engine`](../../BasePageProvider/classes/default.md#engine)

***

### initialized

> **initialized**: `boolean`

Defined in: [src/providers/BasePageProvider.ts:57](https://github.com/jwilleke/amdWiki/blob/b6a859c7c9297966de89735ea5e8f953df289ac1/src/providers/BasePageProvider.ts#L57)

Whether provider has been initialized

#### Inherited from

[`default`](../../BasePageProvider/classes/default.md).[`initialized`](../../BasePageProvider/classes/default.md#initialized)

***

### installationComplete

> **installationComplete**: `boolean`

Defined in: [src/providers/FileSystemProvider.ts:99](https://github.com/jwilleke/amdWiki/blob/b6a859c7c9297966de89735ea5e8f953df289ac1/src/providers/FileSystemProvider.ts#L99)

Whether installation is complete (required-pages should not be used after install)

***

### pageCache

> `protected` **pageCache**: `Map`\<`string`, `PageCacheInfo`\>

Defined in: [src/providers/FileSystemProvider.ts:84](https://github.com/jwilleke/amdWiki/blob/b6a859c7c9297966de89735ea5e8f953df289ac1/src/providers/FileSystemProvider.ts#L84)

Main page cache (keyed by title)

***

### pageNameMatcher

> `protected` **pageNameMatcher**: [`default`](../../../utils/PageNameMatcher/classes/default.md) \| `null`

Defined in: [src/providers/FileSystemProvider.ts:96](https://github.com/jwilleke/amdWiki/blob/b6a859c7c9297966de89735ea5e8f953df289ac1/src/providers/FileSystemProvider.ts#L96)

Page name matcher for fuzzy/plural matching

***

### pagesDirectory

> `protected` **pagesDirectory**: `string` \| `null`

Defined in: [src/providers/FileSystemProvider.ts:75](https://github.com/jwilleke/amdWiki/blob/b6a859c7c9297966de89735ea5e8f953df289ac1/src/providers/FileSystemProvider.ts#L75)

Path to regular pages directory

***

### requiredPagesDirectory

> `protected` **requiredPagesDirectory**: `string` \| `null`

Defined in: [src/providers/FileSystemProvider.ts:78](https://github.com/jwilleke/amdWiki/blob/b6a859c7c9297966de89735ea5e8f953df289ac1/src/providers/FileSystemProvider.ts#L78)

Path to required pages directory

***

### slugIndex

> `protected` **slugIndex**: `Map`\<`string`, `string`\>

Defined in: [src/providers/FileSystemProvider.ts:93](https://github.com/jwilleke/amdWiki/blob/b6a859c7c9297966de89735ea5e8f953df289ac1/src/providers/FileSystemProvider.ts#L93)

Slug index (slug -> canonical title)

***

### titleIndex

> `protected` **titleIndex**: `Map`\<`string`, `string`\>

Defined in: [src/providers/FileSystemProvider.ts:87](https://github.com/jwilleke/amdWiki/blob/b6a859c7c9297966de89735ea5e8f953df289ac1/src/providers/FileSystemProvider.ts#L87)

Title index (lowercase title -> canonical title)

***

### uuidIndex

> `protected` **uuidIndex**: `Map`\<`string`, `string`\>

Defined in: [src/providers/FileSystemProvider.ts:90](https://github.com/jwilleke/amdWiki/blob/b6a859c7c9297966de89735ea5e8f953df289ac1/src/providers/FileSystemProvider.ts#L90)

UUID index (UUID -> canonical title)

## Methods

### backup()

> **backup**(): `Promise`\<`BackupData`\>

Defined in: [src/providers/FileSystemProvider.ts:577](https://github.com/jwilleke/amdWiki/blob/b6a859c7c9297966de89735ea5e8f953df289ac1/src/providers/FileSystemProvider.ts#L577)

Backup all pages to a serializable format

Returns all page files with their content and relative paths.
This allows the backup to be restored to different directory locations.

#### Returns

`Promise`\<`BackupData`\>

Backup data containing all pages

***

### compareVersions()

> **compareVersions**(`_identifier`, `_v1`, `_v2`): `Promise`\<[`VersionDiff`](../../../types/Version/interfaces/VersionDiff.md)\>

Defined in: [src/providers/BasePageProvider.ts:264](https://github.com/jwilleke/amdWiki/blob/b6a859c7c9297966de89735ea5e8f953df289ac1/src/providers/BasePageProvider.ts#L264)

Compare two versions of a page

Generates a diff between two versions showing what changed.
Returns structured diff data suitable for rendering.

#### Parameters

##### \_identifier

`string`

##### \_v1

`number`

##### \_v2

`number`

#### Returns

`Promise`\<[`VersionDiff`](../../../types/Version/interfaces/VersionDiff.md)\>

Diff data structure

#### Inherited from

[`default`](../../BasePageProvider/classes/default.md).[`compareVersions`](../../BasePageProvider/classes/default.md#compareversions)

***

### deletePage()

> **deletePage**(`identifier`): `Promise`\<`boolean`\>

Defined in: [src/providers/FileSystemProvider.ts:479](https://github.com/jwilleke/amdWiki/blob/b6a859c7c9297966de89735ea5e8f953df289ac1/src/providers/FileSystemProvider.ts#L479)

Delete a page

#### Parameters

##### identifier

`string`

Page UUID or title

#### Returns

`Promise`\<`boolean`\>

True if deleted, false if not found

#### Overrides

[`default`](../../BasePageProvider/classes/default.md).[`deletePage`](../../BasePageProvider/classes/default.md#deletepage)

***

### findPage()

> **findPage**(`identifier`): `string` \| `null`

Defined in: [src/providers/FileSystemProvider.ts:545](https://github.com/jwilleke/amdWiki/blob/b6a859c7c9297966de89735ea5e8f953df289ac1/src/providers/FileSystemProvider.ts#L545)

Find page by various identifiers

#### Parameters

##### identifier

`string`

UUID, title, or slug

#### Returns

`string` \| `null`

Canonical page title or null

#### Overrides

[`default`](../../BasePageProvider/classes/default.md).[`findPage`](../../BasePageProvider/classes/default.md#findpage)

***

### getAllPageInfo()

> **getAllPageInfo**(`_options?`): `Promise`\<[`PageInfo`](../../../types/Page/interfaces/PageInfo.md)[]\>

Defined in: [src/providers/FileSystemProvider.ts:528](https://github.com/jwilleke/amdWiki/blob/b6a859c7c9297966de89735ea5e8f953df289ac1/src/providers/FileSystemProvider.ts#L528)

Get all page info objects

#### Parameters

##### \_options?

[`PageListOptions`](../../../types/Page/interfaces/PageListOptions.md)

List options (unused, for future filtering)

#### Returns

`Promise`\<[`PageInfo`](../../../types/Page/interfaces/PageInfo.md)[]\>

Array of page info objects

#### Overrides

[`default`](../../BasePageProvider/classes/default.md).[`getAllPageInfo`](../../BasePageProvider/classes/default.md#getallpageinfo)

***

### getAllPages()

> **getAllPages**(): `Promise`\<`string`[]\>

Defined in: [src/providers/FileSystemProvider.ts:519](https://github.com/jwilleke/amdWiki/blob/b6a859c7c9297966de89735ea5e8f953df289ac1/src/providers/FileSystemProvider.ts#L519)

Returns a list of all available page titles (sorted)

#### Returns

`Promise`\<`string`[]\>

An array of page titles

#### Overrides

[`default`](../../BasePageProvider/classes/default.md).[`getAllPages`](../../BasePageProvider/classes/default.md#getallpages)

***

### getPage()

> **getPage**(`identifier`): `Promise`\<[`WikiPage`](../../../types/Page/interfaces/WikiPage.md) \| `null`\>

Defined in: [src/providers/FileSystemProvider.ts:333](https://github.com/jwilleke/amdWiki/blob/b6a859c7c9297966de89735ea5e8f953df289ac1/src/providers/FileSystemProvider.ts#L333)

Get page content and metadata together

#### Parameters

##### identifier

`string`

Page UUID or title

#### Returns

`Promise`\<[`WikiPage`](../../../types/Page/interfaces/WikiPage.md) \| `null`\>

#### Overrides

[`default`](../../BasePageProvider/classes/default.md).[`getPage`](../../BasePageProvider/classes/default.md#getpage)

***

### getPageContent()

> **getPageContent**(`identifier`): `Promise`\<`string`\>

Defined in: [src/providers/FileSystemProvider.ts:362](https://github.com/jwilleke/amdWiki/blob/b6a859c7c9297966de89735ea5e8f953df289ac1/src/providers/FileSystemProvider.ts#L362)

Retrieves the raw markdown content of a page (without frontmatter).

#### Parameters

##### identifier

`string`

Page UUID or title

#### Returns

`Promise`\<`string`\>

The raw markdown content without frontmatter

#### Overrides

[`default`](../../BasePageProvider/classes/default.md).[`getPageContent`](../../BasePageProvider/classes/default.md#getpagecontent)

***

### getPageMetadata()

> **getPageMetadata**(`identifier`): `Promise`\<[`PageFrontmatter`](../../../types/Page/interfaces/PageFrontmatter.md) \| `null`\>

Defined in: [src/providers/FileSystemProvider.ts:379](https://github.com/jwilleke/amdWiki/blob/b6a859c7c9297966de89735ea5e8f953df289ac1/src/providers/FileSystemProvider.ts#L379)

Retrieves the metadata (frontmatter) for a given page.

#### Parameters

##### identifier

`string`

Page UUID or title

#### Returns

`Promise`\<[`PageFrontmatter`](../../../types/Page/interfaces/PageFrontmatter.md) \| `null`\>

The page metadata, or null if not found

#### Overrides

[`default`](../../BasePageProvider/classes/default.md).[`getPageMetadata`](../../BasePageProvider/classes/default.md#getpagemetadata)

***

### getPageVersion()

> **getPageVersion**(`_identifier`, `_version`): `Promise`\<[`VersionContent`](../../../types/Version/interfaces/VersionContent.md)\>

Defined in: [src/providers/BasePageProvider.ts:234](https://github.com/jwilleke/amdWiki/blob/b6a859c7c9297966de89735ea5e8f953df289ac1/src/providers/BasePageProvider.ts#L234)

Get a specific version of a page

Retrieves the content and metadata for a specific version number.
For delta-based storage, this reconstructs the content by applying diffs.

#### Parameters

##### \_identifier

`string`

##### \_version

`number`

#### Returns

`Promise`\<[`VersionContent`](../../../types/Version/interfaces/VersionContent.md)\>

Version content and metadata

#### Throws

If version does not exist

#### Inherited from

[`default`](../../BasePageProvider/classes/default.md).[`getPageVersion`](../../BasePageProvider/classes/default.md#getpageversion)

***

### getProviderInfo()

> **getProviderInfo**(): [`ProviderInfo`](../../BasePageProvider/interfaces/ProviderInfo.md)

Defined in: [src/providers/FileSystemProvider.ts:554](https://github.com/jwilleke/amdWiki/blob/b6a859c7c9297966de89735ea5e8f953df289ac1/src/providers/FileSystemProvider.ts#L554)

Get provider information

#### Returns

[`ProviderInfo`](../../BasePageProvider/interfaces/ProviderInfo.md)

#### Overrides

[`default`](../../BasePageProvider/classes/default.md).[`getProviderInfo`](../../BasePageProvider/classes/default.md#getproviderinfo)

***

### getVersionHistory()

> **getVersionHistory**(`_identifier`, `_limit?`): `Promise`\<[`VersionHistoryEntry`](../../../types/Version/interfaces/VersionHistoryEntry.md)[]\>

Defined in: [src/providers/BasePageProvider.ts:219](https://github.com/jwilleke/amdWiki/blob/b6a859c7c9297966de89735ea5e8f953df289ac1/src/providers/BasePageProvider.ts#L219)

Get version history for a page

Returns an array of version metadata entries for the specified page.
Providers that don't support versioning should not implement this method.

#### Parameters

##### \_identifier

`string`

##### \_limit?

`number`

#### Returns

`Promise`\<[`VersionHistoryEntry`](../../../types/Version/interfaces/VersionHistoryEntry.md)[]\>

Array of version history entries

#### Example

```ts
// Returns:
[
  {
    version: 1,
    timestamp: "2025-01-01T00:00:00.000Z",
    author: "user@example.com",
    changeType: "create",
    message: "Initial version",
    contentSize: 1234,
    compressed: false
  },
  {
    version: 2,
    timestamp: "2025-01-02T10:30:00.000Z",
    author: "editor@example.com",
    changeType: "update",
    message: "Added section",
    contentSize: 567,
    compressed: false
  }
]
```

#### Inherited from

[`default`](../../BasePageProvider/classes/default.md).[`getVersionHistory`](../../BasePageProvider/classes/default.md#getversionhistory)

***

### initialize()

> **initialize**(): `Promise`\<`void`\>

Defined in: [src/providers/FileSystemProvider.ts:130](https://github.com/jwilleke/amdWiki/blob/b6a859c7c9297966de89735ea5e8f953df289ac1/src/providers/FileSystemProvider.ts#L130)

Initialize the provider by reading configuration and caching pages

Loads all pages from both directories into memory for fast lookup.
All configuration access goes through ConfigurationManager (ALL LOWERCASE).

#### Returns

`Promise`\<`void`\>

#### Async

#### Throws

If ConfigurationManager is not available

#### Overrides

[`default`](../../BasePageProvider/classes/default.md).[`initialize`](../../BasePageProvider/classes/default.md#initialize)

***

### pageExists()

> **pageExists**(`identifier`): `boolean`

Defined in: [src/providers/FileSystemProvider.ts:511](https://github.com/jwilleke/amdWiki/blob/b6a859c7c9297966de89735ea5e8f953df289ac1/src/providers/FileSystemProvider.ts#L511)

Check if a page exists

#### Parameters

##### identifier

`string`

Page UUID or title

#### Returns

`boolean`

#### Overrides

[`default`](../../BasePageProvider/classes/default.md).[`pageExists`](../../BasePageProvider/classes/default.md#pageexists)

***

### purgeOldVersions()

> **purgeOldVersions**(`_identifier`, `_keepLatest`): `Promise`\<`number`\>

Defined in: [src/providers/BasePageProvider.ts:278](https://github.com/jwilleke/amdWiki/blob/b6a859c7c9297966de89735ea5e8f953df289ac1/src/providers/BasePageProvider.ts#L278)

Purge old versions based on retention policy

Removes old versions according to configuration settings (maxVersions, retentionDays).
Always preserves v1 (needed for delta reconstruction) and recent versions.

#### Parameters

##### \_identifier

`string`

##### \_keepLatest

`number`

#### Returns

`Promise`\<`number`\>

Number of versions purged

#### Inherited from

[`default`](../../BasePageProvider/classes/default.md).[`purgeOldVersions`](../../BasePageProvider/classes/default.md#purgeoldversions)

***

### refreshPageList()

> **refreshPageList**(): `Promise`\<`void`\>

Defined in: [src/providers/FileSystemProvider.ts:188](https://github.com/jwilleke/amdWiki/blob/b6a859c7c9297966de89735ea5e8f953df289ac1/src/providers/FileSystemProvider.ts#L188)

Reads all .md files from the pages directory (and required-pages during installation)
and populates the page cache with multiple indexes.

After installation is complete, only pages from the main pages directory are loaded.
The required-pages directory is only used during installation to seed the wiki.

#### Returns

`Promise`\<`void`\>

#### Overrides

[`default`](../../BasePageProvider/classes/default.md).[`refreshPageList`](../../BasePageProvider/classes/default.md#refreshpagelist)

***

### restore()

> **restore**(`backupData`): `Promise`\<`void`\>

Defined in: [src/providers/FileSystemProvider.ts:660](https://github.com/jwilleke/amdWiki/blob/b6a859c7c9297966de89735ea5e8f953df289ac1/src/providers/FileSystemProvider.ts#L660)

Restore pages from backup data

Recreates all page files from the backup data.
Preserves directory structure and file content.

#### Parameters

##### backupData

`BackupData`

Backup data from backup() method

#### Returns

`Promise`\<`void`\>

***

### restoreVersion()

> **restoreVersion**(`_identifier`, `_version`): `Promise`\<`void`\>

Defined in: [src/providers/BasePageProvider.ts:249](https://github.com/jwilleke/amdWiki/blob/b6a859c7c9297966de89735ea5e8f953df289ac1/src/providers/BasePageProvider.ts#L249)

Restore a page to a specific version

Creates a new version by restoring content from an older version.
The restoration itself becomes a new version in the history.

#### Parameters

##### \_identifier

`string`

##### \_version

`number`

#### Returns

`Promise`\<`void`\>

#### Throws

If version does not exist or restoration fails

#### Inherited from

[`default`](../../BasePageProvider/classes/default.md).[`restoreVersion`](../../BasePageProvider/classes/default.md#restoreversion)

***

### savePage()

> **savePage**(`pageName`, `content`, `metadata`, `_options?`): `Promise`\<`void`\>

Defined in: [src/providers/FileSystemProvider.ts:394](https://github.com/jwilleke/amdWiki/blob/b6a859c7c9297966de89735ea5e8f953df289ac1/src/providers/FileSystemProvider.ts#L394)

Saves content to a wiki page, creating it if it doesn't exist.
Determines storage location based on system-category metadata.

#### Parameters

##### pageName

`string`

The name of the page

##### content

`string`

The new markdown content

##### metadata

`Partial`\<[`PageFrontmatter`](../../../types/Page/interfaces/PageFrontmatter.md)\> = `{}`

The metadata to save in the frontmatter

##### \_options?

[`PageSaveOptions`](../../../types/Page/interfaces/PageSaveOptions.md)

#### Returns

`Promise`\<`void`\>

#### Overrides

[`default`](../../BasePageProvider/classes/default.md).[`savePage`](../../BasePageProvider/classes/default.md#savepage)

***

### shutdown()

> **shutdown**(): `void`

Defined in: [src/providers/BasePageProvider.ts:299](https://github.com/jwilleke/amdWiki/blob/b6a859c7c9297966de89735ea5e8f953df289ac1/src/providers/BasePageProvider.ts#L299)

Shutdown the provider (cleanup resources)

#### Returns

`void`

#### Inherited from

[`default`](../../BasePageProvider/classes/default.md).[`shutdown`](../../BasePageProvider/classes/default.md#shutdown)
