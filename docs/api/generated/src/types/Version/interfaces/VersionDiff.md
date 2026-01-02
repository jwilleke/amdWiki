[**amdWiki API v1.5.0**](../../../../README.md)

***

[amdWiki API](../../../../README.md) / [src/types/Version](../README.md) / VersionDiff

# Interface: VersionDiff

Defined in: [src/types/Version.ts:108](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/types/Version.ts#L108)

Version diff result

Result of comparing two versions.

## Properties

### diff

> **diff**: [`DiffTuple`](../../../utils/DeltaStorage/type-aliases/DiffTuple.md)[]

Defined in: [src/types/Version.ts:116](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/types/Version.ts#L116)

Diff operations (from fast-diff)

***

### fromMetadata

> **fromMetadata**: [`VersionMetadata`](VersionMetadata.md)

Defined in: [src/types/Version.ts:126](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/types/Version.ts#L126)

Old version metadata

***

### fromVersion

> **fromVersion**: `number`

Defined in: [src/types/Version.ts:110](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/types/Version.ts#L110)

Old version number

***

### stats

> **stats**: `object`

Defined in: [src/types/Version.ts:119](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/types/Version.ts#L119)

Diff statistics

#### additions

> **additions**: `number`

#### deletions

> **deletions**: `number`

#### unchanged

> **unchanged**: `number`

***

### toMetadata

> **toMetadata**: [`VersionMetadata`](VersionMetadata.md)

Defined in: [src/types/Version.ts:129](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/types/Version.ts#L129)

New version metadata

***

### toVersion

> **toVersion**: `number`

Defined in: [src/types/Version.ts:113](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/types/Version.ts#L113)

New version number
