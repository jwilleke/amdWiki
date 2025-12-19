[**amdWiki API v1.5.0**](../../../../README.md)

***

[amdWiki API](../../../../README.md) / [src/utils/VersioningMaintenance](../README.md) / export=

# Class: export=

Defined in: [src/utils/VersioningMaintenance.js:26](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/utils/VersioningMaintenance.js#L26)

VersioningMaintenance - Automated maintenance utilities for VersioningFileProvider

Provides batch operations for:
- Version cleanup (purging old versions)
- Version compression (gzip old versions)
- Storage analytics (usage statistics)
- Automated maintenance scheduling

## Example

```ts
const maintenance = new VersioningMaintenance({
  provider: versioningProvider,
  dryRun: false
});

const report = await maintenance.cleanupAllPages({
  keepLatest: 20,
  retentionDays: 90
});
```

## Constructors

### Constructor

> **new export=**(`options`): `VersioningMaintenance`

Defined in: [src/utils/VersioningMaintenance.js:35](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/utils/VersioningMaintenance.js#L35)

Create a new VersioningMaintenance instance

#### Parameters

##### options

Maintenance options

###### dryRun

`boolean`

Preview mode without making changes (default: false)

###### progressCallback

`Function`

Optional progress callback

###### provider

`any`

VersioningFileProvider instance

###### verbose

`boolean`

Enable verbose logging (default: false)

#### Returns

`VersioningMaintenance`

## Properties

### dryRun

> **dryRun**: `boolean`

Defined in: [src/utils/VersioningMaintenance.js:41](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/utils/VersioningMaintenance.js#L41)

***

### progressCallback

> **progressCallback**: `Function`

Defined in: [src/utils/VersioningMaintenance.js:43](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/utils/VersioningMaintenance.js#L43)

***

### provider

> **provider**: `any`

Defined in: [src/utils/VersioningMaintenance.js:40](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/utils/VersioningMaintenance.js#L40)

***

### stats

> **stats**: `object`

Defined in: [src/utils/VersioningMaintenance.js:46](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/utils/VersioningMaintenance.js#L46)

#### compressionSaved

> **compressionSaved**: `number` = `0`

#### errors

> **errors**: `any`[] = `[]`

#### pagesProcessed

> **pagesProcessed**: `number` = `0`

#### spaceFreed

> **spaceFreed**: `number` = `0`

#### versionsCompressed

> **versionsCompressed**: `number` = `0`

#### versionsRemoved

> **versionsRemoved**: `number` = `0`

***

### verbose

> **verbose**: `boolean`

Defined in: [src/utils/VersioningMaintenance.js:42](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/utils/VersioningMaintenance.js#L42)

## Methods

### cleanupAllPages()

> **cleanupAllPages**(`options`): `Promise`\<`any`\>

Defined in: [src/utils/VersioningMaintenance.js:67](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/utils/VersioningMaintenance.js#L67)

Clean up old versions for all pages

Performs batch purge operation across all pages with version history.

#### Parameters

##### options

Cleanup options

###### keepLatest

`number`

Minimum versions to keep (default: 10)

###### keepMilestones

`boolean`

Keep milestone versions (default: true)

###### retentionDays

`number`

Keep versions newer than this (default: 365)

#### Returns

`Promise`\<`any`\>

Cleanup report

***

### compressAllVersions()

> **compressAllVersions**(`options`): `Promise`\<`any`\>

Defined in: [src/utils/VersioningMaintenance.js:141](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/utils/VersioningMaintenance.js#L141)

Compress old versions for all pages

Applies gzip compression to versions older than specified threshold.
Significantly reduces storage usage for old versions.

#### Parameters

##### options

Compression options

###### ageThresholdDays

`number`

Compress versions older than this (default: 30)

###### compressionLevel

`number`

Gzip compression level 1-9 (default: 6)

###### skipAlreadyCompressed

`boolean`

Skip already compressed files (default: true)

#### Returns

`Promise`\<`any`\>

Compression report

***

### runFullMaintenance()

> **runFullMaintenance**(`options`): `Promise`\<`any`\>

Defined in: [src/utils/VersioningMaintenance.js:315](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/utils/VersioningMaintenance.js#L315)

Run full maintenance (cleanup + compression)

Performs both cleanup and compression in a single operation.

#### Parameters

##### options

Maintenance options

###### cleanup

`any`

Cleanup options (passed to cleanupAllPages)

###### compression

`any`

Compression options (passed to compressAllVersions)

#### Returns

`Promise`\<`any`\>

Combined maintenance report
