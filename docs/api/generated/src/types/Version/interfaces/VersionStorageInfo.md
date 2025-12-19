[**amdWiki API v1.5.0**](../../../../README.md)

***

[amdWiki API](../../../../README.md) / [src/types/Version](../README.md) / VersionStorageInfo

# Interface: VersionStorageInfo

Defined in: [src/types/Version.ts:165](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/types/Version.ts#L165)

Version storage info

Information about version storage and disk usage.

## Properties

### avgVersionSize

> **avgVersionSize**: `number`

Defined in: [src/types/Version.ts:182](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/types/Version.ts#L182)

Average version size

***

### compressedVersions

> **compressedVersions**: `number`

Defined in: [src/types/Version.ts:185](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/types/Version.ts#L185)

Number of compressed versions

***

### deltaVersions

> **deltaVersions**: `number`

Defined in: [src/types/Version.ts:188](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/types/Version.ts#L188)

Number of delta versions

***

### newestVersion

> **newestVersion**: `string`

Defined in: [src/types/Version.ts:194](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/types/Version.ts#L194)

Newest version timestamp

***

### oldestVersion

> **oldestVersion**: `string`

Defined in: [src/types/Version.ts:191](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/types/Version.ts#L191)

Oldest version timestamp

***

### pageUuid

> **pageUuid**: `string`

Defined in: [src/types/Version.ts:167](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/types/Version.ts#L167)

Page UUID

***

### spaceSavings

> **spaceSavings**: `number`

Defined in: [src/types/Version.ts:179](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/types/Version.ts#L179)

Space saved (0-100)

***

### storageSize

> **storageSize**: `number`

Defined in: [src/types/Version.ts:176](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/types/Version.ts#L176)

Storage size with compression/deltas in bytes

***

### totalSize

> **totalSize**: `number`

Defined in: [src/types/Version.ts:173](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/types/Version.ts#L173)

Total storage size in bytes (all versions)

***

### totalVersions

> **totalVersions**: `number`

Defined in: [src/types/Version.ts:170](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/types/Version.ts#L170)

Total number of versions
