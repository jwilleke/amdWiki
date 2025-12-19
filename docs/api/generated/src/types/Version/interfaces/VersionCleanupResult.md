[**amdWiki API v1.5.0**](../../../../README.md)

***

[amdWiki API](../../../../README.md) / [src/types/Version](../README.md) / VersionCleanupResult

# Interface: VersionCleanupResult

Defined in: [src/types/Version.ts:227](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/types/Version.ts#L227)

Version cleanup result

Result of running version cleanup/maintenance.

## Properties

### deletedVersions

> **deletedVersions**: `number`[]

Defined in: [src/types/Version.ts:244](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/types/Version.ts#L244)

Deleted version numbers

***

### errors?

> `optional` **errors**: `string`[]

Defined in: [src/types/Version.ts:247](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/types/Version.ts#L247)

Errors encountered

***

### pageUuid

> **pageUuid**: `string`

Defined in: [src/types/Version.ts:229](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/types/Version.ts#L229)

Page UUID

***

### spaceFreed

> **spaceFreed**: `number`

Defined in: [src/types/Version.ts:241](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/types/Version.ts#L241)

Space freed in bytes

***

### versionsAfter

> **versionsAfter**: `number`

Defined in: [src/types/Version.ts:235](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/types/Version.ts#L235)

Number of versions after cleanup

***

### versionsBefore

> **versionsBefore**: `number`

Defined in: [src/types/Version.ts:232](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/types/Version.ts#L232)

Number of versions before cleanup

***

### versionsDeleted

> **versionsDeleted**: `number`

Defined in: [src/types/Version.ts:238](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/types/Version.ts#L238)

Number of versions deleted
