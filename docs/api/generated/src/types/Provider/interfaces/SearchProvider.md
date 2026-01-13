[**amdWiki API v1.5.0**](../../../../README.md)

***

[amdWiki API](../../../../README.md) / [src/types/Provider](../README.md) / SearchProvider

# Interface: SearchProvider

Defined in: [src/types/Provider.ts:402](https://github.com/jwilleke/amdWiki/blob/b6a859c7c9297966de89735ea5e8f953df289ac1/src/types/Provider.ts#L402)

Search provider interface

Defines the contract for search backends (Lunr, Elasticsearch, etc.).

## Extends

- [`BaseProvider`](BaseProvider.md)

## Properties

### engine

> **engine**: [`WikiEngine`](../../WikiEngine/interfaces/WikiEngine.md)

Defined in: [src/types/Provider.ts:37](https://github.com/jwilleke/amdWiki/blob/b6a859c7c9297966de89735ea5e8f953df289ac1/src/types/Provider.ts#L37)

Reference to WikiEngine

#### Inherited from

[`BaseProvider`](BaseProvider.md).[`engine`](BaseProvider.md#engine)

***

### initialized

> **initialized**: `boolean`

Defined in: [src/types/Provider.ts:40](https://github.com/jwilleke/amdWiki/blob/b6a859c7c9297966de89735ea5e8f953df289ac1/src/types/Provider.ts#L40)

Whether provider has been initialized

#### Inherited from

[`BaseProvider`](BaseProvider.md).[`initialized`](BaseProvider.md#initialized)

## Methods

### backup()?

> `optional` **backup**(): `Promise`\<`Record`\<`string`, `unknown`\>\>

Defined in: [src/types/Provider.ts:64](https://github.com/jwilleke/amdWiki/blob/b6a859c7c9297966de89735ea5e8f953df289ac1/src/types/Provider.ts#L64)

Backup provider data

#### Returns

`Promise`\<`Record`\<`string`, `unknown`\>\>

Promise resolving to backup data

#### Inherited from

[`BaseProvider`](BaseProvider.md).[`backup`](BaseProvider.md#backup)

***

### getProviderInfo()?

> `optional` **getProviderInfo**(): [`ProviderInfo`](ProviderInfo.md)

Defined in: [src/types/Provider.ts:58](https://github.com/jwilleke/amdWiki/blob/b6a859c7c9297966de89735ea5e8f953df289ac1/src/types/Provider.ts#L58)

Get provider information

#### Returns

[`ProviderInfo`](ProviderInfo.md)

Provider metadata

#### Inherited from

[`BaseProvider`](BaseProvider.md).[`getProviderInfo`](BaseProvider.md#getproviderinfo)

***

### getSuggestions()

> **getSuggestions**(`query`, `limit?`): `Promise`\<`string`[]\>

Defined in: [src/types/Provider.ts:431](https://github.com/jwilleke/amdWiki/blob/b6a859c7c9297966de89735ea5e8f953df289ac1/src/types/Provider.ts#L431)

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

Defined in: [src/types/Provider.ts:408](https://github.com/jwilleke/amdWiki/blob/b6a859c7c9297966de89735ea5e8f953df289ac1/src/types/Provider.ts#L408)

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

Defined in: [src/types/Provider.ts:46](https://github.com/jwilleke/amdWiki/blob/b6a859c7c9297966de89735ea5e8f953df289ac1/src/types/Provider.ts#L46)

Initialize the provider

#### Returns

`Promise`\<`void`\>

Promise that resolves when initialization is complete

#### Inherited from

[`BaseProvider`](BaseProvider.md).[`initialize`](BaseProvider.md#initialize)

***

### rebuildIndex()

> **rebuildIndex**(): `Promise`\<`void`\>

Defined in: [src/types/Provider.ts:437](https://github.com/jwilleke/amdWiki/blob/b6a859c7c9297966de89735ea5e8f953df289ac1/src/types/Provider.ts#L437)

Rebuild entire search index

#### Returns

`Promise`\<`void`\>

Promise that resolves when rebuild is complete

***

### removePage()

> **removePage**(`identifier`): `Promise`\<`void`\>

Defined in: [src/types/Provider.ts:415](https://github.com/jwilleke/amdWiki/blob/b6a859c7c9297966de89735ea5e8f953df289ac1/src/types/Provider.ts#L415)

Remove page from index

#### Parameters

##### identifier

`string`

Page UUID or title

#### Returns

`Promise`\<`void`\>

Promise that resolves when removal is complete

***

### restore()?

> `optional` **restore**(`backupData`): `Promise`\<`void`\>

Defined in: [src/types/Provider.ts:71](https://github.com/jwilleke/amdWiki/blob/b6a859c7c9297966de89735ea5e8f953df289ac1/src/types/Provider.ts#L71)

Restore provider data from backup

#### Parameters

##### backupData

`Record`\<`string`, `unknown`\>

Backup data from backup() method

#### Returns

`Promise`\<`void`\>

Promise that resolves when restore is complete

#### Inherited from

[`BaseProvider`](BaseProvider.md).[`restore`](BaseProvider.md#restore)

***

### search()

> **search**(`query`, `options?`): `Promise`\<[`PageSearchResult`](../../Page/interfaces/PageSearchResult.md)[]\>

Defined in: [src/types/Provider.ts:423](https://github.com/jwilleke/amdWiki/blob/b6a859c7c9297966de89735ea5e8f953df289ac1/src/types/Provider.ts#L423)

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

Defined in: [src/types/Provider.ts:52](https://github.com/jwilleke/amdWiki/blob/b6a859c7c9297966de89735ea5e8f953df289ac1/src/types/Provider.ts#L52)

Shutdown the provider (optional)

#### Returns

`Promise`\<`void`\>

Promise that resolves when shutdown is complete

#### Inherited from

[`BaseProvider`](BaseProvider.md).[`shutdown`](BaseProvider.md#shutdown)
