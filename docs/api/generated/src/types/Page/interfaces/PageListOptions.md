[**amdWiki API v1.5.0**](../../../../README.md)

***

[amdWiki API](../../../../README.md) / [src/types/Page](../README.md) / PageListOptions

# Interface: PageListOptions

Defined in: [src/types/Page.ts:167](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/types/Page.ts#L167)

Page list options

Options for filtering and sorting page lists.

## Properties

### author?

> `optional` **author**: `string`

Defined in: [src/types/Page.ts:172](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/types/Page.ts#L172)

Filter by author

***

### category?

> `optional` **category**: `string`

Defined in: [src/types/Page.ts:169](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/types/Page.ts#L169)

Filter by category

***

### includeRequired?

> `optional` **includeRequired**: `boolean`

Defined in: [src/types/Page.ts:190](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/types/Page.ts#L190)

Include required-pages in results

***

### keywords?

> `optional` **keywords**: `string`[]

Defined in: [src/types/Page.ts:175](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/types/Page.ts#L175)

Filter by keywords (AND logic)

***

### limit?

> `optional` **limit**: `number`

Defined in: [src/types/Page.ts:184](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/types/Page.ts#L184)

Pagination: number of results per page

***

### offset?

> `optional` **offset**: `number`

Defined in: [src/types/Page.ts:187](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/types/Page.ts#L187)

Pagination: page offset (0-based)

***

### sortBy?

> `optional` **sortBy**: `"title"` \| `"lastModified"` \| `"category"` \| `"author"`

Defined in: [src/types/Page.ts:178](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/types/Page.ts#L178)

Sort field

***

### sortOrder?

> `optional` **sortOrder**: `"asc"` \| `"desc"`

Defined in: [src/types/Page.ts:181](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/types/Page.ts#L181)

Sort order
