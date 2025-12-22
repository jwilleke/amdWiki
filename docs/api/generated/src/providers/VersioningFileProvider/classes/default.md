[**amdWiki API v1.5.0**](../../../../README.md)

***

[amdWiki API](../../../../README.md) / [src/providers/VersioningFileProvider](../README.md) / default

# Class: default

Defined in: [src/providers/VersioningFileProvider.ts:127](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/providers/VersioningFileProvider.ts#L127)

VersioningFileProvider - File-based storage with version history

Extends FileSystemProvider to add git-style page versioning with delta storage.
Maintains backward compatibility - can be swapped with FileSystemProvider.

Features:

- Per-page version history with delta storage (v1 = full, v2+ = diffs)
- Compression of old versions (gzip)
- Centralized page index for fast lookups (./data/page-index.json)
- Version metadata tracking (author, date, change type, content hash)
- Retention policies (maxVersions, retentionDays)

Directory Structure:

```
./data/page-index.json              # Centralized index for fast lookups
./pages/{uuid}.md                    # Current version of page
./pages/versions/{uuid}/
  ├── manifest.json                  # Single source of truth for all version metadata
  ├── v1/content.md                  # Full content (baseline)
  ├── v2/content.diff                # Delta from v1
  └── v3/content.diff                # Delta from v2
./required-pages/{uuid}.md
./required-pages/versions/{uuid}/... # Same structure for system pages
```

Note: Version metadata (author, date, hash, etc.) is stored ONLY in manifest.json
      to avoid data inconsistency. Individual v{N}/meta.json files are no longer used.

## Extends

- [`default`](../../FileSystemProvider/classes/default.md)

## Constructors

### Constructor

> **new default**(`engine`): `VersioningFileProvider`

Defined in: [src/providers/VersioningFileProvider.ts:161](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/providers/VersioningFileProvider.ts#L161)

Create a new VersioningFileProvider

#### Parameters

##### engine

[`WikiEngine`](../../BasePageProvider/interfaces/WikiEngine.md)

The WikiEngine instance

#### Returns

`VersioningFileProvider`

#### Overrides

[`default`](../../FileSystemProvider/classes/default.md).[`constructor`](../../FileSystemProvider/classes/default.md#constructor)

## Properties

### encoding

> `protected` **encoding**: `BufferEncoding`

Defined in: [src/providers/FileSystemProvider.ts:80](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/providers/FileSystemProvider.ts#L80)

File encoding

#### Inherited from

[`default`](../../FileSystemProvider/classes/default.md).[`encoding`](../../FileSystemProvider/classes/default.md#encoding)

***

### engine

> `protected` **engine**: [`WikiEngine`](../../BasePageProvider/interfaces/WikiEngine.md)

Defined in: [src/providers/BasePageProvider.ts:54](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/providers/BasePageProvider.ts#L54)

Reference to the wiki engine

#### Inherited from

[`default`](../../FileSystemProvider/classes/default.md).[`engine`](../../FileSystemProvider/classes/default.md#engine)

***

### initialized

> **initialized**: `boolean`

Defined in: [src/providers/BasePageProvider.ts:57](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/providers/BasePageProvider.ts#L57)

Whether provider has been initialized

#### Inherited from

[`default`](../../FileSystemProvider/classes/default.md).[`initialized`](../../FileSystemProvider/classes/default.md#initialized)

***

### pageCache

> `protected` **pageCache**: `Map`\<`string`, `PageCacheInfo`\>

Defined in: [src/providers/FileSystemProvider.ts:83](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/providers/FileSystemProvider.ts#L83)

Main page cache (keyed by title)

#### Inherited from

[`default`](../../FileSystemProvider/classes/default.md).[`pageCache`](../../FileSystemProvider/classes/default.md#pagecache)

***

### pageNameMatcher

> `protected` **pageNameMatcher**: [`default`](../../../utils/PageNameMatcher/classes/default.md)

Defined in: [src/providers/FileSystemProvider.ts:95](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/providers/FileSystemProvider.ts#L95)

Page name matcher for fuzzy/plural matching

#### Inherited from

[`default`](../../FileSystemProvider/classes/default.md).[`pageNameMatcher`](../../FileSystemProvider/classes/default.md#pagenamematcher)

***

### pagesDirectory

> `protected` **pagesDirectory**: `string`

Defined in: [src/providers/FileSystemProvider.ts:74](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/providers/FileSystemProvider.ts#L74)

Path to regular pages directory

#### Inherited from

[`default`](../../FileSystemProvider/classes/default.md).[`pagesDirectory`](../../FileSystemProvider/classes/default.md#pagesdirectory)

***

### requiredPagesDirectory

> `protected` **requiredPagesDirectory**: `string`

Defined in: [src/providers/FileSystemProvider.ts:77](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/providers/FileSystemProvider.ts#L77)

Path to required pages directory

#### Inherited from

[`default`](../../FileSystemProvider/classes/default.md).[`requiredPagesDirectory`](../../FileSystemProvider/classes/default.md#requiredpagesdirectory)

***

### slugIndex

> `protected` **slugIndex**: `Map`\<`string`, `string`\>

Defined in: [src/providers/FileSystemProvider.ts:92](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/providers/FileSystemProvider.ts#L92)

Slug index (slug -> canonical title)

#### Inherited from

[`default`](../../FileSystemProvider/classes/default.md).[`slugIndex`](../../FileSystemProvider/classes/default.md#slugindex)

***

### titleIndex

> `protected` **titleIndex**: `Map`\<`string`, `string`\>

Defined in: [src/providers/FileSystemProvider.ts:86](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/providers/FileSystemProvider.ts#L86)

Title index (lowercase title -> canonical title)

#### Inherited from

[`default`](../../FileSystemProvider/classes/default.md).[`titleIndex`](../../FileSystemProvider/classes/default.md#titleindex)

***

### uuidIndex

> `protected` **uuidIndex**: `Map`\<`string`, `string`\>

Defined in: [src/providers/FileSystemProvider.ts:89](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/providers/FileSystemProvider.ts#L89)

UUID index (UUID -> canonical title)

#### Inherited from

[`default`](../../FileSystemProvider/classes/default.md).[`uuidIndex`](../../FileSystemProvider/classes/default.md#uuidindex)

## Methods

### backup()

> **backup**(): `Promise`\<`BackupData`\>

Defined in: [src/providers/FileSystemProvider.ts:552](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/providers/FileSystemProvider.ts#L552)

Backup all pages to a serializable format

Returns all page files with their content and relative paths.
This allows the backup to be restored to different directory locations.

#### Returns

`Promise`\<`BackupData`\>

Backup data containing all pages

#### Inherited from

[`default`](../../FileSystemProvider/classes/default.md).[`backup`](../../FileSystemProvider/classes/default.md#backup)

***

### compareVersions()

> **compareVersions**(`identifier`, `v1`, `v2`): `Promise`\<[`VersionDiff`](../../../types/Version/interfaces/VersionDiff.md)\>

Defined in: [src/providers/VersioningFileProvider.ts:1247](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/providers/VersioningFileProvider.ts#L1247)

Compare two versions of a page

Returns a diff showing changes between two versions.
Uses DeltaStorage to compute the diff.

#### Parameters

##### identifier

`string`

Page UUID or title

##### v1

`number`

First version number (older)

##### v2

`number`

Second version number (newer)

#### Returns

`Promise`\<[`VersionDiff`](../../../types/Version/interfaces/VersionDiff.md)\>

Comparison result with diff and stats

#### Throws

If page/versions not found

#### Example

```ts
const comparison = await provider.compareVersions('Main', 2, 5);
console.log(comparison.stats); // { additions: 10, deletions: 3, unchanged: 100 }
console.log(comparison.diff); // Array of diff operations
```

#### Overrides

[`default`](../../FileSystemProvider/classes/default.md).[`compareVersions`](../../FileSystemProvider/classes/default.md#compareversions)

***

### deletePage()

> **deletePage**(`identifier`): `Promise`\<`boolean`\>

Defined in: [src/providers/VersioningFileProvider.ts:720](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/providers/VersioningFileProvider.ts#L720)

Delete a page and its version history

#### Parameters

##### identifier

`string`

Page UUID or title

#### Returns

`Promise`\<`boolean`\>

True if deleted, false if not found

#### Overrides

[`default`](../../FileSystemProvider/classes/default.md).[`deletePage`](../../FileSystemProvider/classes/default.md#deletepage)

***

### findPage()

> **findPage**(`identifier`): `string`

Defined in: [src/providers/FileSystemProvider.ts:520](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/providers/FileSystemProvider.ts#L520)

Find page by various identifiers

#### Parameters

##### identifier

`string`

UUID, title, or slug

#### Returns

`string`

Canonical page title or null

#### Inherited from

[`default`](../../FileSystemProvider/classes/default.md).[`findPage`](../../FileSystemProvider/classes/default.md#findpage)

***

### getAllPageInfo()

> **getAllPageInfo**(`options?`): `Promise`\<[`PageInfo`](../../../types/Page/interfaces/PageInfo.md)[]\>

Defined in: [src/providers/FileSystemProvider.ts:503](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/providers/FileSystemProvider.ts#L503)

Get all page info objects

#### Parameters

##### options?

[`PageListOptions`](../../../types/Page/interfaces/PageListOptions.md)

List options

#### Returns

`Promise`\<[`PageInfo`](../../../types/Page/interfaces/PageInfo.md)[]\>

Array of page info objects

#### Inherited from

[`default`](../../FileSystemProvider/classes/default.md).[`getAllPageInfo`](../../FileSystemProvider/classes/default.md#getallpageinfo)

***

### getAllPages()

> **getAllPages**(): `Promise`\<`string`[]\>

Defined in: [src/providers/FileSystemProvider.ts:494](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/providers/FileSystemProvider.ts#L494)

Returns a list of all available page titles (sorted)

#### Returns

`Promise`\<`string`[]\>

An array of page titles

#### Inherited from

[`default`](../../FileSystemProvider/classes/default.md).[`getAllPages`](../../FileSystemProvider/classes/default.md#getallpages)

***

### getPage()

> **getPage**(`identifier`): `Promise`\<[`WikiPage`](../../../types/Page/interfaces/WikiPage.md)\>

Defined in: [src/providers/FileSystemProvider.ts:308](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/providers/FileSystemProvider.ts#L308)

Get page content and metadata together

#### Parameters

##### identifier

`string`

Page UUID or title

#### Returns

`Promise`\<[`WikiPage`](../../../types/Page/interfaces/WikiPage.md)\>

#### Inherited from

[`default`](../../FileSystemProvider/classes/default.md).[`getPage`](../../FileSystemProvider/classes/default.md#getpage)

***

### getPageContent()

> **getPageContent**(`identifier`): `Promise`\<`string`\>

Defined in: [src/providers/FileSystemProvider.ts:337](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/providers/FileSystemProvider.ts#L337)

Retrieves the raw markdown content of a page (without frontmatter).

#### Parameters

##### identifier

`string`

Page UUID or title

#### Returns

`Promise`\<`string`\>

The raw markdown content without frontmatter

#### Inherited from

[`default`](../../FileSystemProvider/classes/default.md).[`getPageContent`](../../FileSystemProvider/classes/default.md#getpagecontent)

***

### getPageMetadata()

> **getPageMetadata**(`identifier`): `Promise`\<[`PageFrontmatter`](../../../types/Page/interfaces/PageFrontmatter.md)\>

Defined in: [src/providers/FileSystemProvider.ts:354](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/providers/FileSystemProvider.ts#L354)

Retrieves the metadata (frontmatter) for a given page.

#### Parameters

##### identifier

`string`

Page UUID or title

#### Returns

`Promise`\<[`PageFrontmatter`](../../../types/Page/interfaces/PageFrontmatter.md)\>

The page metadata, or null if not found

#### Inherited from

[`default`](../../FileSystemProvider/classes/default.md).[`getPageMetadata`](../../FileSystemProvider/classes/default.md#getpagemetadata)

***

### getPageVersion()

> **getPageVersion**(`identifier`, `version`): `Promise`\<[`VersionContent`](../../../types/Version/interfaces/VersionContent.md)\>

Defined in: [src/providers/VersioningFileProvider.ts:1116](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/providers/VersioningFileProvider.ts#L1116)

Get specific version content for a page

Reconstructs the content for a specific version by:

1. Reading v1 (full content)
2. If version > 1 and delta storage enabled: apply diffs sequentially
3. If version > 1 and delta storage disabled: read full content directly

#### Parameters

##### identifier

`string`

Page UUID or title

##### version

`number`

Version number to retrieve

#### Returns

`Promise`\<[`VersionContent`](../../../types/Version/interfaces/VersionContent.md)\>

Version content and metadata

#### Throws

If page/version not found or reconstruction fails

#### Example

```ts
const { content, metadata } = await provider.getPageVersion('Main', 2);
console.log(content); // Content at version 2
console.log(metadata.author); // Editor of version 2
```

#### Overrides

[`default`](../../FileSystemProvider/classes/default.md).[`getPageVersion`](../../FileSystemProvider/classes/default.md#getpageversion)

***

### getProviderInfo()

> **getProviderInfo**(): [`ProviderInfo`](../../BasePageProvider/interfaces/ProviderInfo.md)

Defined in: [src/providers/VersioningFileProvider.ts:1400](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/providers/VersioningFileProvider.ts#L1400)

Get provider information

#### Returns

[`ProviderInfo`](../../BasePageProvider/interfaces/ProviderInfo.md)

Provider metadata

#### Overrides

[`default`](../../FileSystemProvider/classes/default.md).[`getProviderInfo`](../../FileSystemProvider/classes/default.md#getproviderinfo)

***

### getVersionHistory()

> **getVersionHistory**(`identifier`, `limit?`): `Promise`\<[`VersionHistoryEntry`](../../../types/Version/interfaces/VersionHistoryEntry.md)[]\>

Defined in: [src/providers/VersioningFileProvider.ts:1065](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/providers/VersioningFileProvider.ts#L1065)

Get version history for a page

Returns an array of version metadata sorted by version number (newest first).
Each entry includes: version, dateCreated, editor, changeType, comment, contentHash, contentSize.

#### Parameters

##### identifier

`string`

Page UUID or title

##### limit?

`number`

Maximum number of versions to return (optional)

#### Returns

`Promise`\<[`VersionHistoryEntry`](../../../types/Version/interfaces/VersionHistoryEntry.md)[]\>

Array of version metadata (empty array if no versions)

#### Throws

If page not found

#### Example

```ts
const history = await provider.getVersionHistory('Main');
// [
//   { version: 3, timestamp: '2024-01-03T...', author: 'john', ... },
//   { version: 2, timestamp: '2024-01-02T...', author: 'jane', ... },
//   { version: 1, timestamp: '2024-01-01T...', author: 'admin', ... }
// ]
```

#### Overrides

[`default`](../../FileSystemProvider/classes/default.md).[`getVersionHistory`](../../FileSystemProvider/classes/default.md#getversionhistory)

***

### initialize()

> **initialize**(): `Promise`\<`void`\>

Defined in: [src/providers/VersioningFileProvider.ts:194](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/providers/VersioningFileProvider.ts#L194)

Initialize the versioning provider

1. Calls parent FileSystemProvider.initialize()
2. Loads versioning configuration
3. Creates version directories
4. Loads or creates page-index.json

#### Returns

`Promise`\<`void`\>

Promise<void>

#### Overrides

[`default`](../../FileSystemProvider/classes/default.md).[`initialize`](../../FileSystemProvider/classes/default.md#initialize)

***

### pageExists()

> **pageExists**(`identifier`): `boolean`

Defined in: [src/providers/FileSystemProvider.ts:486](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/providers/FileSystemProvider.ts#L486)

Check if a page exists

#### Parameters

##### identifier

`string`

Page UUID or title

#### Returns

`boolean`

#### Inherited from

[`default`](../../FileSystemProvider/classes/default.md).[`pageExists`](../../FileSystemProvider/classes/default.md#pageexists)

***

### purgeOldVersions()

> **purgeOldVersions**(`identifier`, `keepLatest`): `Promise`\<`number`\>

Defined in: [src/providers/VersioningFileProvider.ts:1294](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/providers/VersioningFileProvider.ts#L1294)

Purge old versions of a page

Removes old versions based on retention policies:

- Keep versions newer than retentionDays
- Keep last keepLatest versions (minimum)
- Optionally keep milestone versions (v1, every 10th version)

#### Parameters

##### identifier

`string`

Page UUID or title

##### keepLatest

`number`

Minimum number of recent versions to keep

#### Returns

`Promise`\<`number`\>

Number of versions purged

#### Throws

If page not found or purge fails

#### Example

```ts
const count = await provider.purgeOldVersions('Main', 20);
console.log(`Removed ${count} versions`);
```

#### Overrides

[`default`](../../FileSystemProvider/classes/default.md).[`purgeOldVersions`](../../FileSystemProvider/classes/default.md#purgeoldversions)

***

### refreshPageList()

> **refreshPageList**(): `Promise`\<`void`\>

Defined in: [src/providers/FileSystemProvider.ts:172](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/providers/FileSystemProvider.ts#L172)

Reads all .md files from both pages and required-pages directories
and populates the page cache with multiple indexes.

#### Returns

`Promise`\<`void`\>

#### Inherited from

[`default`](../../FileSystemProvider/classes/default.md).[`refreshPageList`](../../FileSystemProvider/classes/default.md#refreshpagelist)

***

### restore()

> **restore**(`backupData`): `Promise`\<`void`\>

Defined in: [src/providers/FileSystemProvider.ts:635](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/providers/FileSystemProvider.ts#L635)

Restore pages from backup data

Recreates all page files from the backup data.
Preserves directory structure and file content.

#### Parameters

##### backupData

`BackupData`

Backup data from backup() method

#### Returns

`Promise`\<`void`\>

#### Inherited from

[`default`](../../FileSystemProvider/classes/default.md).[`restore`](../../FileSystemProvider/classes/default.md#restore)

***

### restoreVersion()

> **restoreVersion**(`identifier`, `version`): `Promise`\<`void`\>

Defined in: [src/providers/VersioningFileProvider.ts:1194](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/providers/VersioningFileProvider.ts#L1194)

Restore page to a specific version

Creates a new version with the content from the specified version.
This does NOT delete newer versions - it creates a new version with old content.

#### Parameters

##### identifier

`string`

Page UUID or title

##### version

`number`

Version number to restore to

#### Returns

`Promise`\<`void`\>

#### Throws

If page/version not found or restore fails

#### Example

```ts
await provider.restoreVersion('Main', 5);
console.log(`Restored to v5`);
```

#### Overrides

[`default`](../../FileSystemProvider/classes/default.md).[`restoreVersion`](../../FileSystemProvider/classes/default.md#restoreversion)

***

### savePage()

> **savePage**(`pageName`, `content`, `metadata`): `Promise`\<`void`\>

Defined in: [src/providers/VersioningFileProvider.ts:651](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/providers/VersioningFileProvider.ts#L651)

Override savePage to create versions

Algorithm:

1. Check if page exists (new vs update)
2. If update: create diff and new version
3. If new: create initial version (v1 with full content)
4. Update manifest.json
5. Call parent savePage() for current content
6. Update page-index.json

#### Parameters

##### pageName

`string`

Page title

##### content

`string`

New content

##### metadata

`Partial`\<[`PageFrontmatter`](../../../types/Page/interfaces/PageFrontmatter.md)\> = `{}`

Page metadata

#### Returns

`Promise`\<`void`\>

Promise<void>

#### Overrides

[`default`](../../FileSystemProvider/classes/default.md).[`savePage`](../../FileSystemProvider/classes/default.md#savepage)

***

### shutdown()

> **shutdown**(): `Promise`\<`void`\>

Defined in: [src/providers/BasePageProvider.ts:299](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/providers/BasePageProvider.ts#L299)

Shutdown the provider (cleanup resources)

#### Returns

`Promise`\<`void`\>

#### Inherited from

[`default`](../../FileSystemProvider/classes/default.md).[`shutdown`](../../FileSystemProvider/classes/default.md#shutdown)
