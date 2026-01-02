[**amdWiki API v1.5.0**](../../../../README.md)

***

[amdWiki API](../../../../README.md) / [src/utils/VersioningMaintenance](../README.md) / default

# Class: default

Defined in: [src/utils/VersioningMaintenance.ts:221](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/utils/VersioningMaintenance.ts#L221)

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

> **new default**(`options`): `VersioningMaintenance`

Defined in: [src/utils/VersioningMaintenance.ts:232](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/utils/VersioningMaintenance.ts#L232)

Create a new VersioningMaintenance instance

#### Parameters

##### options

`MaintenanceOptions`

Maintenance options

#### Returns

`VersioningMaintenance`

## Methods

### cleanupAllPages()

> **cleanupAllPages**(`options`): `Promise`\<`CleanupReport`\>

Defined in: [src/utils/VersioningMaintenance.ts:261](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/utils/VersioningMaintenance.ts#L261)

Clean up old versions for all pages

Performs batch purge operation across all pages with version history.

#### Parameters

##### options

`CleanupOptions` = `{}`

Cleanup options

#### Returns

`Promise`\<`CleanupReport`\>

Cleanup report

***

### compressAllVersions()

> **compressAllVersions**(`options`): `Promise`\<`CompressionReport`\>

Defined in: [src/utils/VersioningMaintenance.ts:333](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/utils/VersioningMaintenance.ts#L333)

Compress old versions for all pages

Applies gzip compression to versions older than specified threshold.
Significantly reduces storage usage for old versions.

#### Parameters

##### options

`CompressionOptions` = `{}`

Compression options

#### Returns

`Promise`\<`CompressionReport`\>

Compression report

***

### runFullMaintenance()

> **runFullMaintenance**(`options`): `Promise`\<`FullMaintenanceReport`\>

Defined in: [src/utils/VersioningMaintenance.ts:505](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/utils/VersioningMaintenance.ts#L505)

Run full maintenance (cleanup + compression)

Performs both cleanup and compression in a single operation.

#### Parameters

##### options

`FullMaintenanceOptions` = `{}`

Maintenance options

#### Returns

`Promise`\<`FullMaintenanceReport`\>

Combined maintenance report
