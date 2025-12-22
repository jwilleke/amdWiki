[**amdWiki API v1.5.0**](../../../../README.md)

***

[amdWiki API](../../../../README.md) / [src/utils/VersioningAnalytics](../README.md) / export=

# Class: export=

Defined in: [src/utils/VersioningAnalytics.js:23](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/utils/VersioningAnalytics.js#L23)

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

> **new export=**(`options`): `VersioningAnalytics`

Defined in: [src/utils/VersioningAnalytics.js:30](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/utils/VersioningAnalytics.js#L30)

Create a new VersioningAnalytics instance

#### Parameters

##### options

Analytics options

###### provider

`any`

VersioningFileProvider instance

###### verbose

`boolean`

Enable verbose logging (default: false)

#### Returns

`VersioningAnalytics`

## Properties

### provider

> **provider**: `any`

Defined in: [src/utils/VersioningAnalytics.js:35](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/utils/VersioningAnalytics.js#L35)

***

### verbose

> **verbose**: `boolean`

Defined in: [src/utils/VersioningAnalytics.js:36](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/utils/VersioningAnalytics.js#L36)

## Methods

### generateStorageReport()

> **generateStorageReport**(): `Promise`\<`any`\>

Defined in: [src/utils/VersioningAnalytics.js:46](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/utils/VersioningAnalytics.js#L46)

Generate comprehensive storage report

Analyzes all pages and versions to provide detailed storage statistics.

#### Returns

`Promise`\<`any`\>

Storage report

***

### getPageStorageDetails()

> **getPageStorageDetails**(`identifier`): `Promise`\<`any`\>

Defined in: [src/utils/VersioningAnalytics.js:322](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/utils/VersioningAnalytics.js#L322)

Get storage usage for a specific page

#### Parameters

##### identifier

`string`

Page UUID or title

#### Returns

`Promise`\<`any`\>

Page storage details
