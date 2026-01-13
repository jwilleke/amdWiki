[**amdWiki API v1.5.0**](../../../../README.md)

***

[amdWiki API](../../../../README.md) / [src/types/Version](../README.md) / VersionHistoryEntry

# Interface: VersionHistoryEntry

Defined in: [src/types/Version.ts:137](https://github.com/jwilleke/amdWiki/blob/b6a859c7c9297966de89735ea5e8f953df289ac1/src/types/Version.ts#L137)

Version history entry

Simplified version info for history listings.

## Properties

### author

> **author**: `string`

Defined in: [src/types/Version.ts:142](https://github.com/jwilleke/amdWiki/blob/b6a859c7c9297966de89735ea5e8f953df289ac1/src/types/Version.ts#L142)

Author user ID or 'system'

***

### changeType

> **changeType**: `"create"` \| `"update"` \| `"minor"` \| `"major"`

Defined in: [src/types/Version.ts:148](https://github.com/jwilleke/amdWiki/blob/b6a859c7c9297966de89735ea5e8f953df289ac1/src/types/Version.ts#L148)

Change type

***

### compressed

> **compressed**: `boolean`

Defined in: [src/types/Version.ts:157](https://github.com/jwilleke/amdWiki/blob/b6a859c7c9297966de89735ea5e8f953df289ac1/src/types/Version.ts#L157)

Whether compressed

***

### contentSize

> **contentSize**: `number`

Defined in: [src/types/Version.ts:154](https://github.com/jwilleke/amdWiki/blob/b6a859c7c9297966de89735ea5e8f953df289ac1/src/types/Version.ts#L154)

Content size in bytes

***

### message?

> `optional` **message**: `string`

Defined in: [src/types/Version.ts:151](https://github.com/jwilleke/amdWiki/blob/b6a859c7c9297966de89735ea5e8f953df289ac1/src/types/Version.ts#L151)

Change description

***

### timestamp

> **timestamp**: `string`

Defined in: [src/types/Version.ts:145](https://github.com/jwilleke/amdWiki/blob/b6a859c7c9297966de89735ea5e8f953df289ac1/src/types/Version.ts#L145)

Timestamp (ISO 8601 format)

***

### version

> **version**: `number`

Defined in: [src/types/Version.ts:139](https://github.com/jwilleke/amdWiki/blob/b6a859c7c9297966de89735ea5e8f953df289ac1/src/types/Version.ts#L139)

Version number
