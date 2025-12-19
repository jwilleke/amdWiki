[**amdWiki API v1.5.0**](../../../../README.md)

***

[amdWiki API](../../../../README.md) / [src/providers/LunrSearchProvider](../README.md) / default

# Class: default

Defined in: [src/providers/LunrSearchProvider.ts:90](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/providers/LunrSearchProvider.ts#L90)

LunrSearchProvider - Full-text search using Lunr.js

## Extends

- [`default`](../../BaseSearchProvider/classes/default.md)

## Constructors

### Constructor

> **new default**(`engine`): `LunrSearchProvider`

Defined in: [src/providers/LunrSearchProvider.ts:95](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/providers/LunrSearchProvider.ts#L95)

#### Parameters

##### engine

[`WikiEngine`](../../BaseSearchProvider/interfaces/WikiEngine.md)

#### Returns

`LunrSearchProvider`

#### Overrides

[`default`](../../BaseSearchProvider/classes/default.md).[`constructor`](../../BaseSearchProvider/classes/default.md#constructor)

## Properties

### engine

> `protected` **engine**: [`WikiEngine`](../../BaseSearchProvider/interfaces/WikiEngine.md)

Defined in: [src/providers/BaseSearchProvider.ts:149](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/providers/BaseSearchProvider.ts#L149)

Reference to the wiki engine

#### Inherited from

[`default`](../../BaseSearchProvider/classes/default.md).[`engine`](../../BaseSearchProvider/classes/default.md#engine)

***

### initialized

> `protected` **initialized**: `boolean`

Defined in: [src/providers/BaseSearchProvider.ts:152](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/providers/BaseSearchProvider.ts#L152)

Whether provider has been initialized

#### Inherited from

[`default`](../../BaseSearchProvider/classes/default.md).[`initialized`](../../BaseSearchProvider/classes/default.md#initialized)

## Methods

### advancedSearch()

> **advancedSearch**(`options`): `Promise`\<[`SearchResult`](../../BaseSearchProvider/interfaces/SearchResult.md)[]\>

Defined in: [src/providers/LunrSearchProvider.ts:294](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/providers/LunrSearchProvider.ts#L294)

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

Defined in: [src/providers/LunrSearchProvider.ts:661](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/providers/LunrSearchProvider.ts#L661)

Backup search index and configuration

#### Returns

`Promise`\<[`BackupData`](../../BaseSearchProvider/interfaces/BackupData.md)\>

Backup data

#### Overrides

[`default`](../../BaseSearchProvider/classes/default.md).[`backup`](../../BaseSearchProvider/classes/default.md#backup)

***

### buildIndex()

> **buildIndex**(): `Promise`\<`void`\>

Defined in: [src/providers/LunrSearchProvider.ts:178](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/providers/LunrSearchProvider.ts#L178)

Build search index from all pages

#### Returns

`Promise`\<`void`\>

#### Overrides

[`default`](../../BaseSearchProvider/classes/default.md).[`buildIndex`](../../BaseSearchProvider/classes/default.md#buildindex)

***

### close()

> **close**(): `Promise`\<`void`\>

Defined in: [src/providers/LunrSearchProvider.ts:646](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/providers/LunrSearchProvider.ts#L646)

Close/cleanup the search provider

#### Returns

`Promise`\<`void`\>

#### Overrides

[`default`](../../BaseSearchProvider/classes/default.md).[`close`](../../BaseSearchProvider/classes/default.md#close)

***

### getAllCategories()

> **getAllCategories**(): `Promise`\<`string`[]\>

Defined in: [src/providers/LunrSearchProvider.ts:521](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/providers/LunrSearchProvider.ts#L521)

Get all unique categories from indexed documents

#### Returns

`Promise`\<`string`[]\>

List of categories

#### Overrides

[`default`](../../BaseSearchProvider/classes/default.md).[`getAllCategories`](../../BaseSearchProvider/classes/default.md#getallcategories)

***

### getAllUserKeywords()

> **getAllUserKeywords**(): `Promise`\<`string`[]\>

Defined in: [src/providers/LunrSearchProvider.ts:535](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/providers/LunrSearchProvider.ts#L535)

Get all unique user keywords from indexed documents

#### Returns

`Promise`\<`string`[]\>

List of user keywords

#### Overrides

[`default`](../../BaseSearchProvider/classes/default.md).[`getAllUserKeywords`](../../BaseSearchProvider/classes/default.md#getalluserkeywords)

***

### getDocumentCount()

> **getDocumentCount**(): `Promise`\<`number`\>

Defined in: [src/providers/LunrSearchProvider.ts:623](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/providers/LunrSearchProvider.ts#L623)

Get the total number of indexed documents

#### Returns

`Promise`\<`number`\>

Number of documents

#### Overrides

[`default`](../../BaseSearchProvider/classes/default.md).[`getDocumentCount`](../../BaseSearchProvider/classes/default.md#getdocumentcount)

***

### getProviderInfo()

> **getProviderInfo**(): `object`

Defined in: [src/providers/LunrSearchProvider.ts:165](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/providers/LunrSearchProvider.ts#L165)

Get provider information

#### Returns

`object`

Provider metadata

##### description

> **description**: `string` = `'Full-text search using Lunr.js'`

##### features

> **features**: `string`[]

##### name

> **name**: `string` = `'LunrSearchProvider'`

##### version

> **version**: `string` = `'1.0.0'`

#### Overrides

[`default`](../../BaseSearchProvider/classes/default.md).[`getProviderInfo`](../../BaseSearchProvider/classes/default.md#getproviderinfo)

***

### getStatistics()

> **getStatistics**(): `Promise`\<[`SearchStatistics`](../../BaseSearchProvider/interfaces/SearchStatistics.md)\>

Defined in: [src/providers/LunrSearchProvider.ts:605](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/providers/LunrSearchProvider.ts#L605)

Get search statistics

#### Returns

`Promise`\<[`SearchStatistics`](../../BaseSearchProvider/interfaces/SearchStatistics.md)\>

Search statistics

#### Overrides

[`default`](../../BaseSearchProvider/classes/default.md).[`getStatistics`](../../BaseSearchProvider/classes/default.md#getstatistics)

***

### getSuggestions()

> **getSuggestions**(`partial`): `Promise`\<`string`[]\>

Defined in: [src/providers/LunrSearchProvider.ts:418](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/providers/LunrSearchProvider.ts#L418)

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

Defined in: [src/providers/LunrSearchProvider.ts:107](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/providers/LunrSearchProvider.ts#L107)

Initialize the Lunr search provider
Loads configuration from ConfigurationManager

#### Returns

`Promise`\<`void`\>

#### Overrides

[`default`](../../BaseSearchProvider/classes/default.md).[`initialize`](../../BaseSearchProvider/classes/default.md#initialize)

***

### isHealthy()

> **isHealthy**(): `Promise`\<`boolean`\>

Defined in: [src/providers/LunrSearchProvider.ts:631](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/providers/LunrSearchProvider.ts#L631)

Check if the search provider is healthy/functional

#### Returns

`Promise`\<`boolean`\>

True if healthy

#### Overrides

[`default`](../../BaseSearchProvider/classes/default.md).[`isHealthy`](../../BaseSearchProvider/classes/default.md#ishealthy)

***

### removePageFromIndex()

> **removePageFromIndex**(`pageName`): `Promise`\<`void`\>

Defined in: [src/providers/LunrSearchProvider.ts:506](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/providers/LunrSearchProvider.ts#L506)

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

Defined in: [src/providers/LunrSearchProvider.ts:677](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/providers/LunrSearchProvider.ts#L677)

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

Defined in: [src/providers/LunrSearchProvider.ts:254](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/providers/LunrSearchProvider.ts#L254)

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

Defined in: [src/providers/LunrSearchProvider.ts:555](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/providers/LunrSearchProvider.ts#L555)

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

Defined in: [src/providers/LunrSearchProvider.ts:581](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/providers/LunrSearchProvider.ts#L581)

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

Defined in: [src/providers/LunrSearchProvider.ts:452](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/providers/LunrSearchProvider.ts#L452)

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

> **updatePageInIndex**(`pageName`, `pageData`): `Promise`\<`void`\>

Defined in: [src/providers/LunrSearchProvider.ts:495](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/providers/LunrSearchProvider.ts#L495)

Add or update a page in the search index

#### Parameters

##### pageName

`string`

Page name

##### pageData

`Record`\<`string`, `any`\>

Page data

#### Returns

`Promise`\<`void`\>

#### Overrides

[`default`](../../BaseSearchProvider/classes/default.md).[`updatePageInIndex`](../../BaseSearchProvider/classes/default.md#updatepageinindex)
