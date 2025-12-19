[**amdWiki API v1.5.0**](../../../../README.md)

***

[amdWiki API](../../../../README.md) / [src/providers/BaseSearchProvider](../README.md) / SearchCriteria

# Interface: SearchCriteria

Defined in: [src/providers/BaseSearchProvider.ts:82](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/providers/BaseSearchProvider.ts#L82)

Advanced search criteria

## Indexable

\[`key`: `string`\]: `any`

Additional criteria

## Properties

### author?

> `optional` **author**: `string`

Defined in: [src/providers/BaseSearchProvider.ts:93](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/providers/BaseSearchProvider.ts#L93)

Author to filter by

***

### categories?

> `optional` **categories**: `string`[]

Defined in: [src/providers/BaseSearchProvider.ts:87](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/providers/BaseSearchProvider.ts#L87)

Categories to filter by

***

### dateRange?

> `optional` **dateRange**: `object`

Defined in: [src/providers/BaseSearchProvider.ts:96](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/providers/BaseSearchProvider.ts#L96)

Date range

#### from?

> `optional` **from**: `string`

#### to?

> `optional` **to**: `string`

***

### query?

> `optional` **query**: `string`

Defined in: [src/providers/BaseSearchProvider.ts:84](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/providers/BaseSearchProvider.ts#L84)

Search query

***

### userKeywords?

> `optional` **userKeywords**: `string`[]

Defined in: [src/providers/BaseSearchProvider.ts:90](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/providers/BaseSearchProvider.ts#L90)

User keywords to filter by
