[**amdWiki API v1.5.0**](../../../../README.md)

***

[amdWiki API](../../../../README.md) / [src/types/Page](../README.md) / PageSearchResult

# Interface: PageSearchResult

Defined in: [src/types/Page.ts:151](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/types/Page.ts#L151)

Page search result

Extended page info with search relevance scoring and highlighting.

## Extends

- [`PageInfo`](PageInfo.md)

## Properties

### author?

> `optional` **author**: `string`

Defined in: [src/types/Page.ts:111](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/types/Page.ts#L111)

Page author (from metadata)

#### Inherited from

[`PageInfo`](PageInfo.md).[`author`](PageInfo.md#author)

***

### category?

> `optional` **category**: `string`

Defined in: [src/types/Page.ts:117](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/types/Page.ts#L117)

Category (from metadata)

#### Inherited from

[`PageInfo`](PageInfo.md).[`category`](PageInfo.md#category)

***

### editor?

> `optional` **editor**: `string`

Defined in: [src/types/Page.ts:114](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/types/Page.ts#L114)

Last editor (from metadata)

#### Inherited from

[`PageInfo`](PageInfo.md).[`editor`](PageInfo.md#editor)

***

### filePath

> **filePath**: `string`

Defined in: [src/types/Page.ts:99](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/types/Page.ts#L99)

Absolute file path to the page file

#### Inherited from

[`PageInfo`](PageInfo.md).[`filePath`](PageInfo.md#filepath)

***

### highlights?

> `optional` **highlights**: `string`[]

Defined in: [src/types/Page.ts:156](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/types/Page.ts#L156)

Highlighted snippets from content

***

### lastModified?

> `optional` **lastModified**: `string`

Defined in: [src/types/Page.ts:108](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/types/Page.ts#L108)

Last modification timestamp (from metadata)

#### Inherited from

[`PageInfo`](PageInfo.md).[`lastModified`](PageInfo.md#lastmodified)

***

### location?

> `optional` **location**: `"pages"` \| `"required-pages"`

Defined in: [src/types/Page.ts:105](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/types/Page.ts#L105)

Location type

#### Inherited from

[`PageInfo`](PageInfo.md).[`location`](PageInfo.md#location)

***

### matchedKeywords?

> `optional` **matchedKeywords**: `string`[]

Defined in: [src/types/Page.ts:159](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/types/Page.ts#L159)

Matched keywords

***

### metadata

> **metadata**: [`PageFrontmatter`](PageFrontmatter.md)

Defined in: [src/types/Page.ts:102](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/types/Page.ts#L102)

Frontmatter metadata

#### Inherited from

[`PageInfo`](PageInfo.md).[`metadata`](PageInfo.md#metadata)

***

### score

> **score**: `number`

Defined in: [src/types/Page.ts:153](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/types/Page.ts#L153)

Search relevance score (0-1)

***

### slug?

> `optional` **slug**: `string`

Defined in: [src/types/Page.ts:120](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/types/Page.ts#L120)

URL slug (from metadata)

#### Inherited from

[`PageInfo`](PageInfo.md).[`slug`](PageInfo.md#slug)

***

### title

> **title**: `string`

Defined in: [src/types/Page.ts:93](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/types/Page.ts#L93)

Page title

#### Inherited from

[`PageInfo`](PageInfo.md).[`title`](PageInfo.md#title)

***

### uuid

> **uuid**: `string`

Defined in: [src/types/Page.ts:96](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/types/Page.ts#L96)

Unique identifier (UUID v4)

#### Inherited from

[`PageInfo`](PageInfo.md).[`uuid`](PageInfo.md#uuid)
