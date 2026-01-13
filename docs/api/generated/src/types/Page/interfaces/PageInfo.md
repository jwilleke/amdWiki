[**amdWiki API v1.5.0**](../../../../README.md)

***

[amdWiki API](../../../../README.md) / [src/types/Page](../README.md) / PageInfo

# Interface: PageInfo

Defined in: [src/types/Page.ts:91](https://github.com/jwilleke/amdWiki/blob/b6a859c7c9297966de89735ea5e8f953df289ac1/src/types/Page.ts#L91)

Minimal page information for listings

Used in page indexes, search results, and navigation where full content
is not needed. This is stored in page-index.json.

## Extended by

- [`PageSearchResult`](PageSearchResult.md)

## Properties

### author?

> `optional` **author**: `string`

Defined in: [src/types/Page.ts:111](https://github.com/jwilleke/amdWiki/blob/b6a859c7c9297966de89735ea5e8f953df289ac1/src/types/Page.ts#L111)

Page author (from metadata)

***

### category?

> `optional` **category**: `string`

Defined in: [src/types/Page.ts:117](https://github.com/jwilleke/amdWiki/blob/b6a859c7c9297966de89735ea5e8f953df289ac1/src/types/Page.ts#L117)

Category (from metadata)

***

### editor?

> `optional` **editor**: `string`

Defined in: [src/types/Page.ts:114](https://github.com/jwilleke/amdWiki/blob/b6a859c7c9297966de89735ea5e8f953df289ac1/src/types/Page.ts#L114)

Last editor (from metadata)

***

### filePath

> **filePath**: `string`

Defined in: [src/types/Page.ts:99](https://github.com/jwilleke/amdWiki/blob/b6a859c7c9297966de89735ea5e8f953df289ac1/src/types/Page.ts#L99)

Absolute file path to the page file

***

### lastModified?

> `optional` **lastModified**: `string`

Defined in: [src/types/Page.ts:108](https://github.com/jwilleke/amdWiki/blob/b6a859c7c9297966de89735ea5e8f953df289ac1/src/types/Page.ts#L108)

Last modification timestamp (from metadata)

***

### location?

> `optional` **location**: `"pages"` \| `"required-pages"`

Defined in: [src/types/Page.ts:105](https://github.com/jwilleke/amdWiki/blob/b6a859c7c9297966de89735ea5e8f953df289ac1/src/types/Page.ts#L105)

Location type

***

### metadata

> **metadata**: [`PageFrontmatter`](PageFrontmatter.md)

Defined in: [src/types/Page.ts:102](https://github.com/jwilleke/amdWiki/blob/b6a859c7c9297966de89735ea5e8f953df289ac1/src/types/Page.ts#L102)

Frontmatter metadata

***

### slug?

> `optional` **slug**: `string`

Defined in: [src/types/Page.ts:120](https://github.com/jwilleke/amdWiki/blob/b6a859c7c9297966de89735ea5e8f953df289ac1/src/types/Page.ts#L120)

URL slug (from metadata)

***

### title

> **title**: `string`

Defined in: [src/types/Page.ts:93](https://github.com/jwilleke/amdWiki/blob/b6a859c7c9297966de89735ea5e8f953df289ac1/src/types/Page.ts#L93)

Page title

***

### uuid

> **uuid**: `string`

Defined in: [src/types/Page.ts:96](https://github.com/jwilleke/amdWiki/blob/b6a859c7c9297966de89735ea5e8f953df289ac1/src/types/Page.ts#L96)

Unique identifier (UUID v4)
