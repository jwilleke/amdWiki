[**amdWiki API v1.5.0**](../../../../README.md)

***

[amdWiki API](../../../../README.md) / [src/utils/VersioningMigration](../README.md) / export=

# Class: export=

Defined in: [src/utils/VersioningMigration.js:27](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/utils/VersioningMigration.js#L27)

VersioningMigration - Utility for migrating FileSystemProvider to VersioningFileProvider

Provides safe migration of existing amdWiki pages to versioned format with:

- Full data preservation and validation
- Rollback capability
- Progress tracking
- Detailed reporting

## Example

```ts
const migration = new VersioningMigration({
  pagesDir: './pages',
  requiredPagesDir: './required-pages',
  dataDir: './data',
  dryRun: false
});

const report = await migration.migrateFromFileSystemProvider();
console.log(`Migrated ${report.pagesProcessed} pages`);
```

## Constructors

### Constructor

> **new export=**(`options`): `VersioningMigration`

Defined in: [src/utils/VersioningMigration.js:38](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/utils/VersioningMigration.js#L38)

Create a new VersioningMigration instance

#### Parameters

##### options

Migration options

###### dataDir

`string`

Path to data directory

###### dryRun

`boolean`

If true, don't write any files (default: false)

###### pagesDir

`string`

Path to pages directory

###### progressCallback

`Function`

Optional callback for progress updates

###### requiredPagesDir

`string`

Path to required-pages directory

###### verbose

`boolean`

Enable verbose logging (default: false)

#### Returns

`VersioningMigration`

## Properties

### dataDir

> **dataDir**: `string`

Defined in: [src/utils/VersioningMigration.js:41](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/utils/VersioningMigration.js#L41)

***

### dryRun

> **dryRun**: `boolean`

Defined in: [src/utils/VersioningMigration.js:42](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/utils/VersioningMigration.js#L42)

***

### errors

> **errors**: `any`[]

Defined in: [src/utils/VersioningMigration.js:48](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/utils/VersioningMigration.js#L48)

***

### migrationLog

> **migrationLog**: `any`[]

Defined in: [src/utils/VersioningMigration.js:47](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/utils/VersioningMigration.js#L47)

***

### pagesDir

> **pagesDir**: `string`

Defined in: [src/utils/VersioningMigration.js:39](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/utils/VersioningMigration.js#L39)

***

### progressCallback

> **progressCallback**: `Function`

Defined in: [src/utils/VersioningMigration.js:44](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/utils/VersioningMigration.js#L44)

***

### requiredPagesDir

> **requiredPagesDir**: `string`

Defined in: [src/utils/VersioningMigration.js:40](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/utils/VersioningMigration.js#L40)

***

### verbose

> **verbose**: `boolean`

Defined in: [src/utils/VersioningMigration.js:43](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/utils/VersioningMigration.js#L43)

***

### warnings

> **warnings**: `any`[]

Defined in: [src/utils/VersioningMigration.js:49](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/utils/VersioningMigration.js#L49)

## Methods

### migrateFromFileSystemProvider()

> **migrateFromFileSystemProvider**(): `Promise`\<`any`\>

Defined in: [src/utils/VersioningMigration.js:69](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/utils/VersioningMigration.js#L69)

Migrate existing pages from FileSystemProvider to VersioningFileProvider

Algorithm:

1. Scan all existing .md files in pages/ and required-pages/
2. For each page:
   a. Read and parse content + frontmatter
   b. Create version directory structure
   c. Create v1 with full content
   d. Create manifest.json
   e. Add entry to page-index.json
3. Validate migration integrity
4. Generate detailed report

#### Returns

`Promise`\<`any`\>

Migration report with statistics

#### Throws

If migration fails critically

***

### rollbackMigration()

> **rollbackMigration**(): `Promise`\<`any`\>

Defined in: [src/utils/VersioningMigration.js:473](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/utils/VersioningMigration.js#L473)

Rollback migration (remove all versioning artifacts)

WARNING: This removes version directories and page-index.json.
Original page files are NOT affected.

#### Returns

`Promise`\<`any`\>

Rollback report

***

### validateMigration()

> **validateMigration**(): `Promise`\<`any`\>

Defined in: [src/utils/VersioningMigration.js:369](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/utils/VersioningMigration.js#L369)

Validate migration integrity

Checks:

- All pages have version directories
- manifest.json files are valid
- Content hashes match
- page-index.json is accurate

#### Returns

`Promise`\<`any`\>

Validation result
