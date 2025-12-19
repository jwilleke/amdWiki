[**amdWiki API v1.5.0**](../../../../README.md)

***

[amdWiki API](../../../../README.md) / [src/types/Version](../README.md) / VersionMetadata

# Interface: VersionMetadata

Defined in: [src/types/Version.ts:16](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/types/Version.ts#L16)

Version metadata

Metadata for a single page version. Stored in manifest.json as the single
source of truth for all version information.

## Properties

### author

> **author**: `string`

Defined in: [src/types/Version.ts:21](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/types/Version.ts#L21)

Author user ID or 'system'

***

### baseVersion?

> `optional` **baseVersion**: `number`

Defined in: [src/types/Version.ts:45](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/types/Version.ts#L45)

If delta, the base version number

***

### changeType

> **changeType**: `"create"` \| `"update"` \| `"minor"` \| `"major"`

Defined in: [src/types/Version.ts:27](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/types/Version.ts#L27)

Change type

***

### compressed

> **compressed**: `boolean`

Defined in: [src/types/Version.ts:39](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/types/Version.ts#L39)

Whether content is compressed (.gz)

***

### compressionRatio?

> `optional` **compressionRatio**: `number`

Defined in: [src/types/Version.ts:48](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/types/Version.ts#L48)

Compression ratio (0-100) if compressed

***

### contentHash

> **contentHash**: `string`

Defined in: [src/types/Version.ts:33](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/types/Version.ts#L33)

SHA-256 hash of content for integrity verification

***

### contentSize

> **contentSize**: `number`

Defined in: [src/types/Version.ts:36](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/types/Version.ts#L36)

Content size in bytes

***

### isDelta

> **isDelta**: `boolean`

Defined in: [src/types/Version.ts:42](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/types/Version.ts#L42)

Whether stored as diff (true) or full content (false)

***

### message?

> `optional` **message**: `string`

Defined in: [src/types/Version.ts:30](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/types/Version.ts#L30)

Change description/commit message

***

### timestamp

> **timestamp**: `string`

Defined in: [src/types/Version.ts:24](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/types/Version.ts#L24)

Timestamp (ISO 8601 format)

***

### version

> **version**: `number`

Defined in: [src/types/Version.ts:18](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/types/Version.ts#L18)

Version number (1-based)
