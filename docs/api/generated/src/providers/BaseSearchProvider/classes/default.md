[**amdWiki API v1.5.0**](../../../../README.md)

***

[amdWiki API](../../../../README.md) / [src/providers/BaseSearchProvider](../README.md) / default

# Abstract Class: default

Defined in: [src/providers/BaseSearchProvider.ts:147](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/providers/BaseSearchProvider.ts#L147)

BaseSearchProvider - Abstract base class for search providers

All search providers must extend this class and implement its abstract methods.
Provides a consistent interface for different search backend implementations.

## Extended by

- [`default`](../../LunrSearchProvider/classes/default.md)

## Constructors

### Constructor

> **new default**(`engine`): `BaseSearchProvider`

Defined in: [src/providers/BaseSearchProvider.ts:159](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/providers/BaseSearchProvider.ts#L159)

Creates a new BaseSearchProvider instance

#### Parameters

##### engine

[`WikiEngine`](../interfaces/WikiEngine.md)

Reference to the WikiEngine instance

#### Returns

`BaseSearchProvider`

## Properties

### engine

> `protected` **engine**: [`WikiEngine`](../interfaces/WikiEngine.md)

Defined in: [src/providers/BaseSearchProvider.ts:149](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/providers/BaseSearchProvider.ts#L149)

Reference to the wiki engine

***

### initialized

> `protected` **initialized**: `boolean`

Defined in: [src/providers/BaseSearchProvider.ts:152](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/providers/BaseSearchProvider.ts#L152)

Whether provider has been initialized

## Methods

### advancedSearch()

> `abstract` **advancedSearch**(`criteria?`): `Promise`\<[`SearchResult`](../interfaces/SearchResult.md)[]\>

Defined in: [src/providers/BaseSearchProvider.ts:226](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/providers/BaseSearchProvider.ts#L226)

Advanced search with multiple criteria

Performs a more complex search using multiple criteria including
query, categories, keywords, author, date range, etc.

#### Parameters

##### criteria?

[`SearchCriteria`](../interfaces/SearchCriteria.md)

Search criteria object

#### Returns

`Promise`\<[`SearchResult`](../interfaces/SearchResult.md)[]\>

Promise resolving to array of search results

***

### backup()

> **backup**(): `Promise`\<[`BackupData`](../interfaces/BackupData.md)\>

Defined in: [src/providers/BaseSearchProvider.ts:373](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/providers/BaseSearchProvider.ts#L373)

Backup search index and configuration (optional)

Creates a backup of the search index and configuration data.
Default implementation provides basic metadata.
Subclasses should override to include actual index data.

#### Returns

`Promise`\<[`BackupData`](../interfaces/BackupData.md)\>

Promise resolving to backup data object

***

### buildIndex()

> `abstract` **buildIndex**(): `Promise`\<`void`\>

Defined in: [src/providers/BaseSearchProvider.ts:201](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/providers/BaseSearchProvider.ts#L201)

Build or rebuild the search index from all pages

Implementations should iterate through all pages and create
a complete search index from scratch.

#### Returns

`Promise`\<`void`\>

Promise that resolves when index building is complete

***

### close()

> `abstract` **close**(): `Promise`\<`void`\>

Defined in: [src/providers/BaseSearchProvider.ts:362](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/providers/BaseSearchProvider.ts#L362)

Close/cleanup the search provider

Performs cleanup operations such as closing connections,
flushing buffers, and releasing resources.

#### Returns

`Promise`\<`void`\>

Promise that resolves when cleanup is complete

***

### getAllCategories()

> `abstract` **getAllCategories**(): `Promise`\<`string`[]\>

Defined in: [src/providers/BaseSearchProvider.ts:286](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/providers/BaseSearchProvider.ts#L286)

Get all unique categories from indexed documents

Extracts and returns a list of all unique categories
found in the indexed pages.

#### Returns

`Promise`\<`string`[]\>

Promise resolving to array of unique category names

***

### getAllUserKeywords()

> `abstract` **getAllUserKeywords**(): `Promise`\<`string`[]\>

Defined in: [src/providers/BaseSearchProvider.ts:297](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/providers/BaseSearchProvider.ts#L297)

Get all unique user keywords from indexed documents

Extracts and returns a list of all unique user-defined keywords
found in the indexed pages.

#### Returns

`Promise`\<`string`[]\>

Promise resolving to array of unique keywords

***

### getDocumentCount()

> `abstract` **getDocumentCount**(): `Promise`\<`number`\>

Defined in: [src/providers/BaseSearchProvider.ts:340](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/providers/BaseSearchProvider.ts#L340)

Get the total number of indexed documents

Returns a count of how many documents are currently in the index.

#### Returns

`Promise`\<`number`\>

Promise resolving to document count

***

### getProviderInfo()

> **getProviderInfo**(): [`ProviderInfo`](../interfaces/ProviderInfo.md)

Defined in: [src/providers/BaseSearchProvider.ts:183](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/providers/BaseSearchProvider.ts#L183)

Get provider information

Returns metadata about this provider implementation including
name, version, description, and supported features.

#### Returns

[`ProviderInfo`](../interfaces/ProviderInfo.md)

Provider metadata

***

### getStatistics()

> `abstract` **getStatistics**(): `Promise`\<[`SearchStatistics`](../interfaces/SearchStatistics.md)\>

Defined in: [src/providers/BaseSearchProvider.ts:330](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/providers/BaseSearchProvider.ts#L330)

Get search statistics

Returns statistics about the search index including document count,
index size, last update time, and other metrics.

#### Returns

`Promise`\<[`SearchStatistics`](../interfaces/SearchStatistics.md)\>

Promise resolving to search statistics object

***

### getSuggestions()

> `abstract` **getSuggestions**(`partial`): `Promise`\<`string`[]\>

Defined in: [src/providers/BaseSearchProvider.ts:238](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/providers/BaseSearchProvider.ts#L238)

Get search suggestions for autocomplete

Provides search term suggestions based on a partial input,
useful for implementing autocomplete functionality.

#### Parameters

##### partial

`string`

Partial search term

#### Returns

`Promise`\<`string`[]\>

Promise resolving to array of suggested completions

***

### initialize()

> `abstract` **initialize**(): `Promise`\<`void`\>

Defined in: [src/providers/BaseSearchProvider.ts:173](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/providers/BaseSearchProvider.ts#L173)

Initialize the search provider

Implementations should load configuration from ConfigurationManager
and prepare the search backend for use.

#### Returns

`Promise`\<`void`\>

Promise that resolves when initialization is complete

***

### isHealthy()

> `abstract` **isHealthy**(): `Promise`\<`boolean`\>

Defined in: [src/providers/BaseSearchProvider.ts:351](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/providers/BaseSearchProvider.ts#L351)

Check if the search provider is healthy/functional

Performs health checks on the search backend to verify it's
operational and responding correctly.

#### Returns

`Promise`\<`boolean`\>

Promise resolving to true if healthy, false otherwise

***

### removePageFromIndex()

> `abstract` **removePageFromIndex**(`pageName`): `Promise`\<`void`\>

Defined in: [src/providers/BaseSearchProvider.ts:275](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/providers/BaseSearchProvider.ts#L275)

Remove a page from the search index

Removes all entries for the specified page from the search index.

#### Parameters

##### pageName

`string`

Page name to remove

#### Returns

`Promise`\<`void`\>

Promise that resolves when removal is complete

***

### restore()

> **restore**(`backupData`): `Promise`\<`void`\>

Defined in: [src/providers/BaseSearchProvider.ts:391](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/providers/BaseSearchProvider.ts#L391)

Restore search index from backup (optional)

Restores the search index from previously created backup data.
Default implementation does nothing.
Subclasses can override if they support restore functionality.

#### Parameters

##### backupData

[`BackupData`](../interfaces/BackupData.md)

Backup data to restore from

#### Returns

`Promise`\<`void`\>

Promise that resolves when restore is complete

***

### search()

> `abstract` **search**(`query`, `options?`): `Promise`\<[`SearchResult`](../interfaces/SearchResult.md)[]\>

Defined in: [src/providers/BaseSearchProvider.ts:214](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/providers/BaseSearchProvider.ts#L214)

Search for pages matching the query

Performs a search against the index using the provided query
and optional search options.

#### Parameters

##### query

`string`

Search query string

##### options?

[`SearchOptions`](../interfaces/SearchOptions.md)

Search options for filtering and limiting results

#### Returns

`Promise`\<[`SearchResult`](../interfaces/SearchResult.md)[]\>

Promise resolving to array of search results

***

### searchByCategory()

> `abstract` **searchByCategory**(`category`): `Promise`\<[`SearchResult`](../interfaces/SearchResult.md)[]\>

Defined in: [src/providers/BaseSearchProvider.ts:308](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/providers/BaseSearchProvider.ts#L308)

Search by category only

Finds all pages that belong to the specified category.

#### Parameters

##### category

`string`

Category name to search for

#### Returns

`Promise`\<[`SearchResult`](../interfaces/SearchResult.md)[]\>

Promise resolving to array of pages in the category

***

### searchByUserKeywords()

> `abstract` **searchByUserKeywords**(`keyword`): `Promise`\<[`SearchResult`](../interfaces/SearchResult.md)[]\>

Defined in: [src/providers/BaseSearchProvider.ts:319](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/providers/BaseSearchProvider.ts#L319)

Search by user keywords only

Finds all pages that have the specified user keyword.

#### Parameters

##### keyword

`string`

Keyword to search for

#### Returns

`Promise`\<[`SearchResult`](../interfaces/SearchResult.md)[]\>

Promise resolving to array of pages with the keyword

***

### suggestSimilarPages()

> `abstract` **suggestSimilarPages**(`pageName`, `limit?`): `Promise`\<[`SearchResult`](../interfaces/SearchResult.md)[]\>

Defined in: [src/providers/BaseSearchProvider.ts:251](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/providers/BaseSearchProvider.ts#L251)

Suggest similar pages based on content

Finds pages similar to the specified page based on content
analysis and relevance scoring.

#### Parameters

##### pageName

`string`

Source page name to find similar pages for

##### limit?

`number`

Maximum number of suggestions to return (default: 5)

#### Returns

`Promise`\<[`SearchResult`](../interfaces/SearchResult.md)[]\>

Promise resolving to array of suggested similar pages

***

### updatePageInIndex()

> `abstract` **updatePageInIndex**(`pageName`, `pageData`): `Promise`\<`void`\>

Defined in: [src/providers/BaseSearchProvider.ts:264](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/providers/BaseSearchProvider.ts#L264)

Add or update a page in the search index

Updates the search index with the latest content and metadata
for the specified page.

#### Parameters

##### pageName

`string`

Page name to update

##### pageData

`Record`\<`string`, `any`\>

Page data including content and metadata

#### Returns

`Promise`\<`void`\>

Promise that resolves when update is complete
