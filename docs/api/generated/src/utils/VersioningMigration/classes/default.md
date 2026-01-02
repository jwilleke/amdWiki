[**amdWiki API v1.5.0**](../../../../README.md)

***

[amdWiki API](../../../../README.md) / [src/utils/VersioningMigration](../README.md) / default

# Class: default

Defined in: [src/utils/VersioningMigration.ts:86](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/utils/VersioningMigration.ts#L86)

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

> **new default**(`options`): `VersioningMigration`

Defined in: [src/utils/VersioningMigration.ts:107](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/utils/VersioningMigration.ts#L107)

Create a new VersioningMigration instance

#### Parameters

##### options

`MigrationOptions`

Migration options

#### Returns

`VersioningMigration`

## Methods

### migrateFromFileSystemProvider()

> **migrateFromFileSystemProvider**(): `Promise`\<\{ `dryRun`: `boolean`; `duration`: `number`; `durationSeconds`: `string`; `errors`: `string`[]; `migrationLog`: `MigrationLogEntry`[]; `pagesDiscovered`: `number`; `pagesFailed`: `number`; `pagesProcessed`: `number`; `success`: `boolean`; `timestamp`: `string`; `warnings`: `string`[]; \}\>

Defined in: [src/utils/VersioningMigration.ts:138](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/utils/VersioningMigration.ts#L138)

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

`Promise`\<\{ `dryRun`: `boolean`; `duration`: `number`; `durationSeconds`: `string`; `errors`: `string`[]; `migrationLog`: `MigrationLogEntry`[]; `pagesDiscovered`: `number`; `pagesFailed`: `number`; `pagesProcessed`: `number`; `success`: `boolean`; `timestamp`: `string`; `warnings`: `string`[]; \}\>

Migration report with statistics

#### Throws

If migration fails critically

***

### rollbackMigration()

> **rollbackMigration**(): `Promise`\<\{ `pageIndex`: `boolean`; `versionDirectories`: `number`; \}\>

Defined in: [src/utils/VersioningMigration.ts:542](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/utils/VersioningMigration.ts#L542)

Rollback migration (remove all versioning artifacts)

WARNING: This removes version directories and page-index.json.
Original page files are NOT affected.

#### Returns

`Promise`\<\{ `pageIndex`: `boolean`; `versionDirectories`: `number`; \}\>

Rollback report

***

### validateMigration()

> **validateMigration**(): `Promise`\<\{ `errors`: `any`[]; `valid`: `boolean`; `warnings`: `any`[]; \}\>

Defined in: [src/utils/VersioningMigration.ts:438](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/utils/VersioningMigration.ts#L438)

Validate migration integrity

Checks:
- All pages have version directories
- manifest.json files are valid
- Content hashes match
- page-index.json is accurate

#### Returns

`Promise`\<\{ `errors`: `any`[]; `valid`: `boolean`; `warnings`: `any`[]; \}\>

Validation result
