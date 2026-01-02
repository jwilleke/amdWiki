[**amdWiki API v1.5.0**](../../../../README.md)

***

[amdWiki API](../../../../README.md) / [src/types/Provider](../README.md) / SearchProvider

# Interface: SearchProvider

Defined in: [src/types/Provider.ts:367](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/types/Provider.ts#L367)

Search provider interface

Defines the contract for search backends (Lunr, Elasticsearch, etc.).

## Extends

- [`BaseProvider`](BaseProvider.md)

## Properties

### engine

> **engine**: [`WikiEngine`](../../WikiEngine/interfaces/WikiEngine.md)

Defined in: [src/types/Provider.ts:21](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/types/Provider.ts#L21)

Reference to WikiEngine

#### Inherited from

[`BaseProvider`](BaseProvider.md).[`engine`](BaseProvider.md#engine)

***

### initialized

> **initialized**: `boolean`

Defined in: [src/types/Provider.ts:24](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/types/Provider.ts#L24)

Whether provider has been initialized

#### Inherited from

[`BaseProvider`](BaseProvider.md).[`initialized`](BaseProvider.md#initialized)

## Methods

### getSuggestions()

> **getSuggestions**(`query`, `limit?`): `Promise`\<`string`[]\>

Defined in: [src/types/Provider.ts:396](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/types/Provider.ts#L396)

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

Defined in: [src/types/Provider.ts:373](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/types/Provider.ts#L373)

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

Defined in: [src/types/Provider.ts:30](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/types/Provider.ts#L30)

Initialize the provider

#### Returns

`Promise`\<`void`\>

Promise that resolves when initialization is complete

#### Inherited from

[`BaseProvider`](BaseProvider.md).[`initialize`](BaseProvider.md#initialize)

***

### rebuildIndex()

> **rebuildIndex**(): `Promise`\<`void`\>

Defined in: [src/types/Provider.ts:402](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/types/Provider.ts#L402)

Rebuild entire search index

#### Returns

`Promise`\<`void`\>

Promise that resolves when rebuild is complete

***

### removePage()

> **removePage**(`identifier`): `Promise`\<`void`\>

Defined in: [src/types/Provider.ts:380](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/types/Provider.ts#L380)

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

Defined in: [src/types/Provider.ts:388](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/types/Provider.ts#L388)

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

***

### shutdown()?

> `optional` **shutdown**(): `Promise`\<`void`\>

Defined in: [src/types/Provider.ts:36](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/types/Provider.ts#L36)

Shutdown the provider (optional)

#### Returns

`Promise`\<`void`\>

Promise that resolves when shutdown is complete

#### Inherited from

[`BaseProvider`](BaseProvider.md).[`shutdown`](BaseProvider.md#shutdown)
