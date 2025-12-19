[**amdWiki API v1.5.0**](../../../../README.md)

***

[amdWiki API](../../../../README.md) / [src/types/Page](../README.md) / PageSaveOptions

# Interface: PageSaveOptions

Defined in: [src/types/Page.ts:129](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/types/Page.ts#L129)

Page save options

Options passed when saving a page to control versioning, author tracking,
and other save behaviors.

## Properties

### additionalMetadata?

> `optional` **additionalMetadata**: `Partial`\<[`PageFrontmatter`](PageFrontmatter.md)\>

Defined in: [src/types/Page.ts:143](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/types/Page.ts#L143)

Additional metadata to merge

***

### author?

> `optional` **author**: `string`

Defined in: [src/types/Page.ts:131](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/types/Page.ts#L131)

User ID performing the save

***

### changeType?

> `optional` **changeType**: `"create"` \| `"update"` \| `"minor"` \| `"major"`

Defined in: [src/types/Page.ts:134](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/types/Page.ts#L134)

Change type (create, update, minor, major)

***

### createVersion?

> `optional` **createVersion**: `boolean`

Defined in: [src/types/Page.ts:140](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/types/Page.ts#L140)

Whether to create a version entry

***

### message?

> `optional` **message**: `string`

Defined in: [src/types/Page.ts:137](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/types/Page.ts#L137)

Commit message/change description
