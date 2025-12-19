[**amdWiki API v1.5.0**](../../../../README.md)

***

[amdWiki API](../../../../README.md) / [src/types/Provider](../README.md) / SearchProvider

# Interface: SearchProvider

Defined in: [src/types/Provider.ts:340](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/types/Provider.ts#L340)

Search provider interface

Defines the contract for search backends (Lunr, Elasticsearch, etc.).

## Extends

- [`BaseProvider`](BaseProvider.md)

## Properties

### engine

> **engine**: `any`

Defined in: [src/types/Provider.ts:19](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/types/Provider.ts#L19)

Reference to WikiEngine

#### Inherited from

[`BaseProvider`](BaseProvider.md).[`engine`](BaseProvider.md#engine)

***

### initialized

> **initialized**: `boolean`

Defined in: [src/types/Provider.ts:22](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/types/Provider.ts#L22)

Whether provider has been initialized

#### Inherited from

[`BaseProvider`](BaseProvider.md).[`initialized`](BaseProvider.md#initialized)

## Methods

### getSuggestions()

> **getSuggestions**(`query`, `limit?`): `Promise`\<`string`[]\>

Defined in: [src/types/Provider.ts:369](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/types/Provider.ts#L369)

Get search suggestions

#### Parameters

##### query

`string`

Partial search query

##### limit?

`number`

Maximum suggestions to return

#### Returns

`Promise`\<`string`[]\>

Array of suggestions

***

### indexPage()

> **indexPage**(`page`): `Promise`\<`void`\>

Defined in: [src/types/Provider.ts:346](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/types/Provider.ts#L346)

Index a page

#### Parameters

##### page

[`WikiPage`](../../Page/interfaces/WikiPage.md)

Page to index

#### Returns

`Promise`\<`void`\>

Promise that resolves when indexing is complete

***

### initialize()

> **initialize**(): `Promise`\<`void`\>

Defined in: [src/types/Provider.ts:28](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/types/Provider.ts#L28)

Initialize the provider

#### Returns

`Promise`\<`void`\>

Promise that resolves when initialization is complete

#### Inherited from

[`BaseProvider`](BaseProvider.md).[`initialize`](BaseProvider.md#initialize)

***

### rebuildIndex()

> **rebuildIndex**(): `Promise`\<`void`\>

Defined in: [src/types/Provider.ts:375](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/types/Provider.ts#L375)

Rebuild entire search index

#### Returns

`Promise`\<`void`\>

Promise that resolves when rebuild is complete

***

### removePage()

> **removePage**(`identifier`): `Promise`\<`void`\>

Defined in: [src/types/Provider.ts:353](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/types/Provider.ts#L353)

Remove page from index

#### Parameters

##### identifier

`string`

Page UUID or title

#### Returns

`Promise`\<`void`\>

Promise that resolves when removal is complete

***

### search()

> **search**(`query`, `options?`): `Promise`\<[`PageSearchResult`](../../Page/interfaces/PageSearchResult.md)[]\>

Defined in: [src/types/Provider.ts:361](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/types/Provider.ts#L361)

Search pages

#### Parameters

##### query

`string`

Search query

##### options?

Search options

###### limit?

`number`

###### offset?

`number`

#### Returns

`Promise`\<[`PageSearchResult`](../../Page/interfaces/PageSearchResult.md)[]\>

Array of search results
