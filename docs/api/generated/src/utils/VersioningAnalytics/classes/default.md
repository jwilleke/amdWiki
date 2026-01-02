[**amdWiki API v1.5.0**](../../../../README.md)

***

[amdWiki API](../../../../README.md) / [src/utils/VersioningAnalytics](../README.md) / default

# Class: default

Defined in: [src/utils/VersioningAnalytics.ts:132](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/utils/VersioningAnalytics.ts#L132)

VersioningAnalytics - Storage analytics and reporting for VersioningFileProvider

Provides detailed insights into:
- Storage usage (total, per-page, by location)
- Version distribution (counts, ages)
- Compression effectiveness
- Growth trends
- Optimization recommendations

## Example

```ts
const analytics = new VersioningAnalytics({
  provider: versioningProvider
});

const report = await analytics.generateStorageReport();
console.log(`Total storage: ${report.totalStorageMB} MB`);
```

## Constructors

### Constructor

> **new default**(`options`): `VersioningAnalytics`

Defined in: [src/utils/VersioningAnalytics.ts:139](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/utils/VersioningAnalytics.ts#L139)

Create a new VersioningAnalytics instance

#### Parameters

##### options

`AnalyticsOptions`

Analytics options

#### Returns

`VersioningAnalytics`

## Methods

### generateStorageReport()

> **generateStorageReport**(): `Promise`\<`StorageReport`\>

Defined in: [src/utils/VersioningAnalytics.ts:155](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/utils/VersioningAnalytics.ts#L155)

Generate comprehensive storage report

Analyzes all pages and versions to provide detailed storage statistics.

#### Returns

`Promise`\<`StorageReport`\>

Storage report

***

### getPageStorageDetails()

> **getPageStorageDetails**(`identifier`): `Promise`\<\{ `page`: \{ `location`: `string`; `title`: `string`; `uuid`: `string`; \}; `storageByType`: \{ `deltas`: `any`; `fullContent`: `any`; `metadata`: `number`; \}; `summary`: \{ `averageVersionSize`: `string`; `compressedVersions`: `number`; `totalSize`: `number`; `totalSizeMB`: `string`; `uncompressedVersions`: `number`; `versionCount`: `number`; \}; `versions`: `any`[]; \}\>

Defined in: [src/utils/VersioningAnalytics.ts:431](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/utils/VersioningAnalytics.ts#L431)

Get storage usage for a specific page

#### Parameters

##### identifier

`string`

Page UUID or title

#### Returns

`Promise`\<\{ `page`: \{ `location`: `string`; `title`: `string`; `uuid`: `string`; \}; `storageByType`: \{ `deltas`: `any`; `fullContent`: `any`; `metadata`: `number`; \}; `summary`: \{ `averageVersionSize`: `string`; `compressedVersions`: `number`; `totalSize`: `number`; `totalSizeMB`: `string`; `uncompressedVersions`: `number`; `versionCount`: `number`; \}; `versions`: `any`[]; \}\>

Page storage details
