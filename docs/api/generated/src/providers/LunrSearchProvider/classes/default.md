[**amdWiki API v1.5.0**](../../../../README.md)

***

[amdWiki API](../../../../README.md) / [src/providers/LunrSearchProvider](../README.md) / default

# Class: default

Defined in: [src/providers/LunrSearchProvider.ts:91](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/providers/LunrSearchProvider.ts#L91)

LunrSearchProvider - Full-text search using Lunr.js

## Extends

- [`default`](../../BaseSearchProvider/classes/default.md)

## Constructors

### Constructor

> **new default**(`engine`): `LunrSearchProvider`

Defined in: [src/providers/LunrSearchProvider.ts:97](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/providers/LunrSearchProvider.ts#L97)

#### Parameters

##### engine

[`WikiEngine`](../../../types/WikiEngine/interfaces/WikiEngine.md)

#### Returns

`LunrSearchProvider`

#### Overrides

[`default`](../../BaseSearchProvider/classes/default.md).[`constructor`](../../BaseSearchProvider/classes/default.md#constructor)

## Properties

### engine

> `protected` **engine**: [`WikiEngine`](../../../types/WikiEngine/interfaces/WikiEngine.md)

Defined in: [src/providers/BaseSearchProvider.ts:140](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/providers/BaseSearchProvider.ts#L140)

Reference to the wiki engine

#### Inherited from

[`default`](../../BaseSearchProvider/classes/default.md).[`engine`](../../BaseSearchProvider/classes/default.md#engine)

***

### initialized

> `protected` **initialized**: `boolean`

Defined in: [src/providers/BaseSearchProvider.ts:143](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/providers/BaseSearchProvider.ts#L143)

Whether provider has been initialized

#### Inherited from

[`default`](../../BaseSearchProvider/classes/default.md).[`initialized`](../../BaseSearchProvider/classes/default.md#initialized)

## Methods

### advancedSearch()

> **advancedSearch**(`options`): `Promise`\<[`SearchResult`](../../BaseSearchProvider/interfaces/SearchResult.md)[]\>

Defined in: [src/providers/LunrSearchProvider.ts:306](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/providers/LunrSearchProvider.ts#L306)

Advanced search with multiple criteria

#### Parameters

##### options

[`SearchCriteria`](../../BaseSearchProvider/interfaces/SearchCriteria.md) = `{}`

Search criteria

#### Returns

`Promise`\<[`SearchResult`](../../BaseSearchProvider/interfaces/SearchResult.md)[]\>

Search results

#### Overrides

[`default`](../../BaseSearchProvider/classes/default.md).[`advancedSearch`](../../BaseSearchProvider/classes/default.md#advancedsearch)

***

### backup()

> **backup**(): `Promise`\<[`BackupData`](../../BaseSearchProvider/interfaces/BackupData.md)\>

Defined in: [src/providers/LunrSearchProvider.ts:682](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/providers/LunrSearchProvider.ts#L682)

Backup search index and configuration

#### Returns

`Promise`\<[`BackupData`](../../BaseSearchProvider/interfaces/BackupData.md)\>

Backup data

#### Overrides

[`default`](../../BaseSearchProvider/classes/default.md).[`backup`](../../BaseSearchProvider/classes/default.md#backup)

***

### buildIndex()

> **buildIndex**(): `Promise`\<`void`\>

Defined in: [src/providers/LunrSearchProvider.ts:182](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/providers/LunrSearchProvider.ts#L182)

Build search index from all pages

#### Returns

`Promise`\<`void`\>

#### Overrides

[`default`](../../BaseSearchProvider/classes/default.md).[`buildIndex`](../../BaseSearchProvider/classes/default.md#buildindex)

***

### close()

> **close**(): `Promise`\<`void`\>

Defined in: [src/providers/LunrSearchProvider.ts:665](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/providers/LunrSearchProvider.ts#L665)

Close/cleanup the search provider

#### Returns

`Promise`\<`void`\>

#### Overrides

[`default`](../../BaseSearchProvider/classes/default.md).[`close`](../../BaseSearchProvider/classes/default.md#close)

***

### getAllCategories()

> **getAllCategories**(): `Promise`\<`string`[]\>

Defined in: [src/providers/LunrSearchProvider.ts:535](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/providers/LunrSearchProvider.ts#L535)

Get all unique categories from indexed documents

#### Returns

`Promise`\<`string`[]\>

List of categories

#### Overrides

[`default`](../../BaseSearchProvider/classes/default.md).[`getAllCategories`](../../BaseSearchProvider/classes/default.md#getallcategories)

***

### getAllUserKeywords()

> **getAllUserKeywords**(): `Promise`\<`string`[]\>

Defined in: [src/providers/LunrSearchProvider.ts:549](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/providers/LunrSearchProvider.ts#L549)

Get all unique user keywords from indexed documents

#### Returns

`Promise`\<`string`[]\>

List of user keywords

#### Overrides

[`default`](../../BaseSearchProvider/classes/default.md).[`getAllUserKeywords`](../../BaseSearchProvider/classes/default.md#getalluserkeywords)

***

### getDocumentCount()

> **getDocumentCount**(): `Promise`\<`number`\>

Defined in: [src/providers/LunrSearchProvider.ts:641](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/providers/LunrSearchProvider.ts#L641)

Get the total number of indexed documents

#### Returns

`Promise`\<`number`\>

Number of documents

#### Overrides

[`default`](../../BaseSearchProvider/classes/default.md).[`getDocumentCount`](../../BaseSearchProvider/classes/default.md#getdocumentcount)

***

### getProviderInfo()

> **getProviderInfo**(): `object`

Defined in: [src/providers/LunrSearchProvider.ts:169](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/providers/LunrSearchProvider.ts#L169)

Get provider information

#### Returns

`object`

Provider metadata

##### description

> **description**: `string`

##### features

> **features**: `string`[]

##### name

> **name**: `string`

##### version

> **version**: `string`

#### Overrides

[`default`](../../BaseSearchProvider/classes/default.md).[`getProviderInfo`](../../BaseSearchProvider/classes/default.md#getproviderinfo)

***

### getStatistics()

> **getStatistics**(): `Promise`\<[`SearchStatistics`](../../BaseSearchProvider/interfaces/SearchStatistics.md)\>

Defined in: [src/providers/LunrSearchProvider.ts:621](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/providers/LunrSearchProvider.ts#L621)

Get search statistics

#### Returns

`Promise`\<[`SearchStatistics`](../../BaseSearchProvider/interfaces/SearchStatistics.md)\>

Search statistics

#### Overrides

[`default`](../../BaseSearchProvider/classes/default.md).[`getStatistics`](../../BaseSearchProvider/classes/default.md#getstatistics)

***

### getSuggestions()

> **getSuggestions**(`partial`): `Promise`\<`string`[]\>

Defined in: [src/providers/LunrSearchProvider.ts:432](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/providers/LunrSearchProvider.ts#L432)

Get search suggestions for autocomplete

#### Parameters

##### partial

`string`

Partial search term

#### Returns

`Promise`\<`string`[]\>

Suggested completions

#### Overrides

[`default`](../../BaseSearchProvider/classes/default.md).[`getSuggestions`](../../BaseSearchProvider/classes/default.md#getsuggestions)

***

### initialize()

> **initialize**(): `Promise`\<`void`\>

Defined in: [src/providers/LunrSearchProvider.ts:109](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/providers/LunrSearchProvider.ts#L109)

Initialize the Lunr search provider
Loads configuration from ConfigurationManager

#### Returns

`Promise`\<`void`\>

#### Overrides

[`default`](../../BaseSearchProvider/classes/default.md).[`initialize`](../../BaseSearchProvider/classes/default.md#initialize)

***

### isHealthy()

> **isHealthy**(): `Promise`\<`boolean`\>

Defined in: [src/providers/LunrSearchProvider.ts:649](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/providers/LunrSearchProvider.ts#L649)

Check if the search provider is healthy/functional

#### Returns

`Promise`\<`boolean`\>

True if healthy

#### Overrides

[`default`](../../BaseSearchProvider/classes/default.md).[`isHealthy`](../../BaseSearchProvider/classes/default.md#ishealthy)

***

### removePageFromIndex()

> **removePageFromIndex**(`pageName`): `Promise`\<`void`\>

Defined in: [src/providers/LunrSearchProvider.ts:520](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/providers/LunrSearchProvider.ts#L520)

Remove a page from the search index

#### Parameters

##### pageName

`string`

Page name to remove

#### Returns

`Promise`\<`void`\>

#### Overrides

[`default`](../../BaseSearchProvider/classes/default.md).[`removePageFromIndex`](../../BaseSearchProvider/classes/default.md#removepagefromindex)

***

### restore()

> **restore**(`backupData`): `Promise`\<`void`\>

Defined in: [src/providers/LunrSearchProvider.ts:698](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/providers/LunrSearchProvider.ts#L698)

Restore search index from backup

#### Parameters

##### backupData

[`BackupData`](../../BaseSearchProvider/interfaces/BackupData.md)

Backup data

#### Returns

`Promise`\<`void`\>

#### Overrides

[`default`](../../BaseSearchProvider/classes/default.md).[`restore`](../../BaseSearchProvider/classes/default.md#restore)

***

### search()

> **search**(`query`, `options`): `Promise`\<[`SearchResult`](../../BaseSearchProvider/interfaces/SearchResult.md)[]\>

Defined in: [src/providers/LunrSearchProvider.ts:264](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/providers/LunrSearchProvider.ts#L264)

Search for pages matching the query

#### Parameters

##### query

`string`

Search query

##### options

[`SearchOptions`](../../BaseSearchProvider/interfaces/SearchOptions.md) = `{}`

Search options

#### Returns

`Promise`\<[`SearchResult`](../../BaseSearchProvider/interfaces/SearchResult.md)[]\>

Search results

#### Overrides

[`default`](../../BaseSearchProvider/classes/default.md).[`search`](../../BaseSearchProvider/classes/default.md#search)

***

### searchByCategory()

> **searchByCategory**(`category`): `Promise`\<[`SearchResult`](../../BaseSearchProvider/interfaces/SearchResult.md)[]\>

Defined in: [src/providers/LunrSearchProvider.ts:569](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/providers/LunrSearchProvider.ts#L569)

Search by category only

#### Parameters

##### category

`string`

Category to search for

#### Returns

`Promise`\<[`SearchResult`](../../BaseSearchProvider/interfaces/SearchResult.md)[]\>

Pages in category

#### Overrides

[`default`](../../BaseSearchProvider/classes/default.md).[`searchByCategory`](../../BaseSearchProvider/classes/default.md#searchbycategory)

***

### searchByUserKeywords()

> **searchByUserKeywords**(`keyword`): `Promise`\<[`SearchResult`](../../BaseSearchProvider/interfaces/SearchResult.md)[]\>

Defined in: [src/providers/LunrSearchProvider.ts:596](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/providers/LunrSearchProvider.ts#L596)

Search by user keywords only

#### Parameters

##### keyword

`string`

Keyword to search for

#### Returns

`Promise`\<[`SearchResult`](../../BaseSearchProvider/interfaces/SearchResult.md)[]\>

Pages with keyword

#### Overrides

[`default`](../../BaseSearchProvider/classes/default.md).[`searchByUserKeywords`](../../BaseSearchProvider/classes/default.md#searchbyuserkeywords)

***

### suggestSimilarPages()

> **suggestSimilarPages**(`pageName`, `limit`): `Promise`\<[`SearchResult`](../../BaseSearchProvider/interfaces/SearchResult.md)[]\>

Defined in: [src/providers/LunrSearchProvider.ts:466](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/providers/LunrSearchProvider.ts#L466)

Suggest similar pages based on content

#### Parameters

##### pageName

`string`

Source page name

##### limit

`number` = `5`

Maximum suggestions

#### Returns

`Promise`\<[`SearchResult`](../../BaseSearchProvider/interfaces/SearchResult.md)[]\>

Suggested pages

#### Overrides

[`default`](../../BaseSearchProvider/classes/default.md).[`suggestSimilarPages`](../../BaseSearchProvider/classes/default.md#suggestsimilarpages)

***

### updatePageInIndex()

> **updatePageInIndex**(`_pageName`, `_pageData`): `Promise`\<`void`\>

Defined in: [src/providers/LunrSearchProvider.ts:509](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/providers/LunrSearchProvider.ts#L509)

Add or update a page in the search index

#### Parameters

##### \_pageName

`string`

Page name

##### \_pageData

`Record`\<`string`, `any`\>

Page data

#### Returns

`Promise`\<`void`\>

#### Overrides

[`default`](../../BaseSearchProvider/classes/default.md).[`updatePageInIndex`](../../BaseSearchProvider/classes/default.md#updatepageinindex)
