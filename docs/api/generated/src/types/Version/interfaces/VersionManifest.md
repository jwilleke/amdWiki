[**amdWiki API v1.5.0**](../../../../README.md)

***

[amdWiki API](../../../../README.md) / [src/types/Version](../README.md) / VersionManifest

# Interface: VersionManifest

Defined in: [src/types/Version.ts:57](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/types/Version.ts#L57)

Version manifest

Single source of truth for all versions of a page. Stored as manifest.json
in the page's version directory.

## Properties

### config?

> `optional` **config**: `object`

Defined in: [src/types/Version.ts:80](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/types/Version.ts#L80)

Versioning configuration at time of creation

#### checkpointInterval

> **checkpointInterval**: `number`

#### compressionEnabled

> **compressionEnabled**: `boolean`

#### deltaStorageEnabled

> **deltaStorageEnabled**: `boolean`

***

### createdAt

> **createdAt**: `string`

Defined in: [src/types/Version.ts:74](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/types/Version.ts#L74)

Manifest creation timestamp

***

### currentVersion

> **currentVersion**: `number`

Defined in: [src/types/Version.ts:68](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/types/Version.ts#L68)

Current version number

***

### pageTitle

> **pageTitle**: `string`

Defined in: [src/types/Version.ts:62](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/types/Version.ts#L62)

Page title (for reference)

***

### pageUuid

> **pageUuid**: `string`

Defined in: [src/types/Version.ts:59](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/types/Version.ts#L59)

Page UUID

***

### totalVersions

> **totalVersions**: `number`

Defined in: [src/types/Version.ts:65](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/types/Version.ts#L65)

Total number of versions

***

### updatedAt

> **updatedAt**: `string`

Defined in: [src/types/Version.ts:77](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/types/Version.ts#L77)

Last manifest update timestamp

***

### versions

> **versions**: [`VersionMetadata`](VersionMetadata.md)[]

Defined in: [src/types/Version.ts:71](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/types/Version.ts#L71)

Array of version metadata (sorted by version number)
