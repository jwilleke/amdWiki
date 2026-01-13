[**amdWiki API v1.5.0**](../../../../README.md)

***

[amdWiki API](../../../../README.md) / [src/providers/BaseSearchProvider](../README.md) / SearchCriteria

# Interface: SearchCriteria

Defined in: [src/providers/BaseSearchProvider.ts:73](https://github.com/jwilleke/amdWiki/blob/b6a859c7c9297966de89735ea5e8f953df289ac1/src/providers/BaseSearchProvider.ts#L73)

Advanced search criteria

## Indexable

\[`key`: `string`\]: `unknown`

Additional criteria

## Properties

### author?

> `optional` **author**: `string`

Defined in: [src/providers/BaseSearchProvider.ts:84](https://github.com/jwilleke/amdWiki/blob/b6a859c7c9297966de89735ea5e8f953df289ac1/src/providers/BaseSearchProvider.ts#L84)

Author to filter by

***

### categories?

> `optional` **categories**: `string`[]

Defined in: [src/providers/BaseSearchProvider.ts:78](https://github.com/jwilleke/amdWiki/blob/b6a859c7c9297966de89735ea5e8f953df289ac1/src/providers/BaseSearchProvider.ts#L78)

Categories to filter by

***

### dateRange?

> `optional` **dateRange**: `object`

Defined in: [src/providers/BaseSearchProvider.ts:87](https://github.com/jwilleke/amdWiki/blob/b6a859c7c9297966de89735ea5e8f953df289ac1/src/providers/BaseSearchProvider.ts#L87)

Date range

#### from?

> `optional` **from**: `string`

#### to?

> `optional` **to**: `string`

***

### query?

> `optional` **query**: `string`

Defined in: [src/providers/BaseSearchProvider.ts:75](https://github.com/jwilleke/amdWiki/blob/b6a859c7c9297966de89735ea5e8f953df289ac1/src/providers/BaseSearchProvider.ts#L75)

Search query

***

### userKeywords?

> `optional` **userKeywords**: `string`[]

Defined in: [src/providers/BaseSearchProvider.ts:81](https://github.com/jwilleke/amdWiki/blob/b6a859c7c9297966de89735ea5e8f953df289ac1/src/providers/BaseSearchProvider.ts#L81)

User keywords to filter by
