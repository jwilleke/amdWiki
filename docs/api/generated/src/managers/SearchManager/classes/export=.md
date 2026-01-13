[**amdWiki API v1.5.0**](../../../../README.md)

***

[amdWiki API](../../../../README.md) / [src/managers/SearchManager](../README.md) / export=

# Class: export=

Defined in: [src/managers/SearchManager.ts:155](https://github.com/jwilleke/amdWiki/blob/b6a859c7c9297966de89735ea5e8f953df289ac1/src/managers/SearchManager.ts#L155)

SearchManager - Handles search indexing and querying

Similar to JSPWiki's SearchManager, this manager provides full-text search
capabilities through a pluggable provider system. Supports different search
backends (Lunr.js, Elasticsearch, etc.) via provider abstraction.

Key features:
- Pluggable search provider system
- Full-text indexing of page content and metadata
- Configurable search ranking and filtering
- Automatic index rebuilding
- Provider abstraction for different search engines

Follows the provider pattern established in AttachmentManager, PageManager,
CacheManager, and AuditManager for pluggable search backends.

Configuration (all lowercase):
- amdwiki.search.enabled - Enable/disable search
- amdwiki.search.provider.default - Default provider name
- amdwiki.search.provider - Active provider name
- amdwiki.search.provider.lunr.* - LunrSearchProvider settings

 SearchManager

## See

 - [BaseManager](../../BaseManager/classes/default.md) for base functionality
 - LunrSearchProvider for default provider implementation

## Example

```ts
const searchManager = engine.getManager('SearchManager');
const results = await searchManager.search('hello world');
console.log(`Found ${results.length} pages`);

Related: GitHub Issue #102 - Configuration reorganization
```

## Extends

- [`default`](../../BaseManager/classes/default.md)

## Constructors

### Constructor

> **new export=**(`engine`): `SearchManager`

Defined in: [src/managers/SearchManager.ts:165](https://github.com/jwilleke/amdWiki/blob/b6a859c7c9297966de89735ea5e8f953df289ac1/src/managers/SearchManager.ts#L165)

Creates a new SearchManager instance

#### Parameters

##### engine

[`WikiEngine`](../../../types/WikiEngine/interfaces/WikiEngine.md)

The wiki engine instance

#### Returns

`SearchManager`

#### Overrides

[`default`](../../BaseManager/classes/default.md).[`constructor`](../../BaseManager/classes/default.md#constructor)

## Properties

### config?

> `protected` `optional` **config**: `Record`\<`string`, `unknown`\>

Defined in: [src/managers/BaseManager.ts:61](https://github.com/jwilleke/amdWiki/blob/b6a859c7c9297966de89735ea5e8f953df289ac1/src/managers/BaseManager.ts#L61)

Configuration passed during initialization

#### Inherited from

[`default`](../../BaseManager/classes/default.md).[`config`](../../BaseManager/classes/default.md#config)

***

### engine

> `protected` **engine**: [`WikiEngine`](../../../types/WikiEngine/interfaces/WikiEngine.md)

Defined in: [src/managers/BaseManager.ts:54](https://github.com/jwilleke/amdWiki/blob/b6a859c7c9297966de89735ea5e8f953df289ac1/src/managers/BaseManager.ts#L54)

Reference to the wiki engine

#### Inherited from

[`default`](../../BaseManager/classes/default.md).[`engine`](../../BaseManager/classes/default.md#engine)

***

### initialized

> `protected` **initialized**: `boolean`

Defined in: [src/managers/BaseManager.ts:57](https://github.com/jwilleke/amdWiki/blob/b6a859c7c9297966de89735ea5e8f953df289ac1/src/managers/BaseManager.ts#L57)

Initialization status flag

#### Inherited from

[`default`](../../BaseManager/classes/default.md).[`initialized`](../../BaseManager/classes/default.md#initialized)

## Methods

### addToIndex()

> **addToIndex**(`page`): `Promise`\<`void`\>

Defined in: [src/managers/SearchManager.ts:760](https://github.com/jwilleke/amdWiki/blob/b6a859c7c9297966de89735ea5e8f953df289ac1/src/managers/SearchManager.ts#L760)

Add page to search index

#### Parameters

##### page

`PageData`

Page object to add

#### Returns

`Promise`\<`void`\>

***

### ~~advancedSearch()~~

> **advancedSearch**(`options`): `Promise`\<`SearchResult`[]\>

Defined in: [src/managers/SearchManager.ts:468](https://github.com/jwilleke/amdWiki/blob/b6a859c7c9297966de89735ea5e8f953df289ac1/src/managers/SearchManager.ts#L468)

Advanced search with multiple criteria support

#### Parameters

##### options

`AdvancedSearchOptions` = `{}`

Search options

#### Returns

`Promise`\<`SearchResult`[]\>

Search results

#### Deprecated

Use advancedSearchWithContext() with WikiContext instead

***

### advancedSearchWithContext()

> **advancedSearchWithContext**(`wikiContext`, `options?`): `Promise`\<`SearchResult`[]\>

Defined in: [src/managers/SearchManager.ts:409](https://github.com/jwilleke/amdWiki/blob/b6a859c7c9297966de89735ea5e8f953df289ac1/src/managers/SearchManager.ts#L409)

Advanced search with WikiContext

Performs advanced search with multiple criteria using WikiContext as the single source
of truth. Logs detailed search parameters with user context for analytics.

#### Parameters

##### wikiContext

`WikiContext`

The wiki context containing user info

##### options?

`AdvancedSearchOptions` = `{}`

Search options

#### Returns

`Promise`\<`SearchResult`[]\>

Search results

#### Async

#### Throws

If wikiContext is not provided

#### Example

```ts
const results = await searchManager.advancedSearchWithContext(wikiContext, {
  query: 'tutorial',
  categories: ['Documentation'],
  maxResults: 20
});
```

***

### backup()

> **backup**(): `Promise`\<[`BackupData`](../../BaseManager/interfaces/BackupData.md)\>

Defined in: [src/managers/SearchManager.ts:808](https://github.com/jwilleke/amdWiki/blob/b6a859c7c9297966de89735ea5e8f953df289ac1/src/managers/SearchManager.ts#L808)

Backup search configuration and state

#### Returns

`Promise`\<[`BackupData`](../../BaseManager/interfaces/BackupData.md)\>

Backup data

#### Overrides

[`default`](../../BaseManager/classes/default.md).[`backup`](../../BaseManager/classes/default.md#backup)

***

### buildSearchIndex()

> **buildSearchIndex**(): `Promise`\<`void`\>

Defined in: [src/managers/SearchManager.ts:333](https://github.com/jwilleke/amdWiki/blob/b6a859c7c9297966de89735ea5e8f953df289ac1/src/managers/SearchManager.ts#L333)

Build search index from all pages

#### Returns

`Promise`\<`void`\>

#### Throws

If index building fails

***

### getAllCategories()

> **getAllCategories**(): `Promise`\<`string`[]\>

Defined in: [src/managers/SearchManager.ts:624](https://github.com/jwilleke/amdWiki/blob/b6a859c7c9297966de89735ea5e8f953df289ac1/src/managers/SearchManager.ts#L624)

Get all unique categories from indexed documents

#### Returns

`Promise`\<`string`[]\>

List of categories

***

### getAllUserKeywords()

> **getAllUserKeywords**(): `Promise`\<`string`[]\>

Defined in: [src/managers/SearchManager.ts:642](https://github.com/jwilleke/amdWiki/blob/b6a859c7c9297966de89735ea5e8f953df289ac1/src/managers/SearchManager.ts#L642)

Get all unique user keywords from indexed documents

#### Returns

`Promise`\<`string`[]\>

List of user keywords

***

### getDocumentCount()

> **getDocumentCount**(): `Promise`\<`number`\>

Defined in: [src/managers/SearchManager.ts:728](https://github.com/jwilleke/amdWiki/blob/b6a859c7c9297966de89735ea5e8f953df289ac1/src/managers/SearchManager.ts#L728)

Get the total number of indexed documents

#### Returns

`Promise`\<`number`\>

Number of documents

***

### getEngine()

> **getEngine**(): [`WikiEngine`](../../../types/WikiEngine/interfaces/WikiEngine.md)

Defined in: [src/managers/BaseManager.ts:125](https://github.com/jwilleke/amdWiki/blob/b6a859c7c9297966de89735ea5e8f953df289ac1/src/managers/BaseManager.ts#L125)

Get the wiki engine instance

#### Returns

[`WikiEngine`](../../../types/WikiEngine/interfaces/WikiEngine.md)

The wiki engine instance

#### Example

```ts
const config = this.getEngine().getConfig();
```

#### Inherited from

[`default`](../../BaseManager/classes/default.md).[`getEngine`](../../BaseManager/classes/default.md#getengine)

***

### getStatistics()

> **getStatistics**(): `Promise`\<`SearchStatistics`\>

Defined in: [src/managers/SearchManager.ts:698](https://github.com/jwilleke/amdWiki/blob/b6a859c7c9297966de89735ea5e8f953df289ac1/src/managers/SearchManager.ts#L698)

Get search statistics

#### Returns

`Promise`\<`SearchStatistics`\>

Search statistics

***

### getSuggestions()

> **getSuggestions**(`partial`): `Promise`\<`string`[]\>

Defined in: [src/managers/SearchManager.ts:508](https://github.com/jwilleke/amdWiki/blob/b6a859c7c9297966de89735ea5e8f953df289ac1/src/managers/SearchManager.ts#L508)

Get search suggestions for autocomplete

#### Parameters

##### partial

`string`

Partial search term

#### Returns

`Promise`\<`string`[]\>

Suggested completions

***

### initialize()

> **initialize**(`config?`): `Promise`\<`void`\>

Defined in: [src/managers/SearchManager.ts:186](https://github.com/jwilleke/amdWiki/blob/b6a859c7c9297966de89735ea5e8f953df289ac1/src/managers/SearchManager.ts#L186)

Initialize the SearchManager and load the configured provider

Loads the search provider, builds the initial search index, and prepares
the search system for queries.

#### Parameters

##### config?

`Record`\<`string`, `unknown`\> = `{}`

Configuration object (unused, reads from ConfigurationManager)

#### Returns

`Promise`\<`void`\>

#### Async

#### Throws

If ConfigurationManager is not available or provider fails to load

#### Example

```ts
await searchManager.initialize();
console.log('Search system ready');
```

#### Overrides

[`default`](../../BaseManager/classes/default.md).[`initialize`](../../BaseManager/classes/default.md#initialize)

***

### isInitialized()

> **isInitialized**(): `boolean`

Defined in: [src/managers/BaseManager.ts:113](https://github.com/jwilleke/amdWiki/blob/b6a859c7c9297966de89735ea5e8f953df289ac1/src/managers/BaseManager.ts#L113)

Check if manager has been initialized

#### Returns

`boolean`

True if manager is initialized

#### Example

```ts
if (manager.isInitialized()) {
  // Safe to use manager
}
```

#### Inherited from

[`default`](../../BaseManager/classes/default.md).[`isInitialized`](../../BaseManager/classes/default.md#isinitialized)

***

### multiSearch()

> **multiSearch**(`criteria`): `Promise`\<`SearchResult`[]\>

Defined in: [src/managers/SearchManager.ts:792](https://github.com/jwilleke/amdWiki/blob/b6a859c7c9297966de89735ea5e8f953df289ac1/src/managers/SearchManager.ts#L792)

Perform multi-criteria search

#### Parameters

##### criteria

`AdvancedSearchOptions`

Search criteria object

#### Returns

`Promise`\<`SearchResult`[]\>

Search results

***

### rebuildIndex()

> **rebuildIndex**(): `Promise`\<`void`\>

Defined in: [src/managers/SearchManager.ts:526](https://github.com/jwilleke/amdWiki/blob/b6a859c7c9297966de89735ea5e8f953df289ac1/src/managers/SearchManager.ts#L526)

Rebuild search index (called after page changes)

#### Returns

`Promise`\<`void`\>

***

### removeFromIndex()

> **removeFromIndex**(`pageName`): `Promise`\<`void`\>

Defined in: [src/managers/SearchManager.ts:776](https://github.com/jwilleke/amdWiki/blob/b6a859c7c9297966de89735ea5e8f953df289ac1/src/managers/SearchManager.ts#L776)

Remove page from search index

#### Parameters

##### pageName

`string`

Name of page to remove

#### Returns

`Promise`\<`void`\>

***

### removePageFromIndex()

> **removePageFromIndex**(`pageName`): `Promise`\<`void`\>

Defined in: [src/managers/SearchManager.ts:555](https://github.com/jwilleke/amdWiki/blob/b6a859c7c9297966de89735ea5e8f953df289ac1/src/managers/SearchManager.ts#L555)

Remove a page from the search index

#### Parameters

##### pageName

`string`

Page name to remove

#### Returns

`Promise`\<`void`\>

***

### restore()

> **restore**(`backupData`): `Promise`\<`void`\>

Defined in: [src/managers/SearchManager.ts:842](https://github.com/jwilleke/amdWiki/blob/b6a859c7c9297966de89735ea5e8f953df289ac1/src/managers/SearchManager.ts#L842)

Restore search from backup

#### Parameters

##### backupData

[`BackupData`](../../BaseManager/interfaces/BackupData.md)

Backup data

#### Returns

`Promise`\<`void`\>

#### Overrides

[`default`](../../BaseManager/classes/default.md).[`restore`](../../BaseManager/classes/default.md#restore)

***

### ~~search()~~

> **search**(`query`, `options`): `Promise`\<`SearchResult`[]\>

Defined in: [src/managers/SearchManager.ts:447](https://github.com/jwilleke/amdWiki/blob/b6a859c7c9297966de89735ea5e8f953df289ac1/src/managers/SearchManager.ts#L447)

Search for pages matching the query

#### Parameters

##### query

`string`

Search query

##### options

`SearchOptions` = `{}`

Search options

#### Returns

`Promise`\<`SearchResult`[]\>

Search results

#### Deprecated

Use searchWithContext() with WikiContext instead

***

### searchByCategories()

> **searchByCategories**(`categories`): `Promise`\<`SearchResult`[]\>

Defined in: [src/managers/SearchManager.ts:573](https://github.com/jwilleke/amdWiki/blob/b6a859c7c9297966de89735ea5e8f953df289ac1/src/managers/SearchManager.ts#L573)

Search by multiple categories

#### Parameters

##### categories

`string`[]

Array of category names to search

#### Returns

`Promise`\<`SearchResult`[]\>

Search results

***

### searchByCategory()

> **searchByCategory**(`category`): `Promise`\<`SearchResult`[]\>

Defined in: [src/managers/SearchManager.ts:661](https://github.com/jwilleke/amdWiki/blob/b6a859c7c9297966de89735ea5e8f953df289ac1/src/managers/SearchManager.ts#L661)

Search by category only

#### Parameters

##### category

`string`

Category to search for

#### Returns

`Promise`\<`SearchResult`[]\>

Pages in category

***

### searchByKeywords()

> **searchByKeywords**(`keywords`): `Promise`\<`SearchResult`[]\>

Defined in: [src/managers/SearchManager.ts:747](https://github.com/jwilleke/amdWiki/blob/b6a859c7c9297966de89735ea5e8f953df289ac1/src/managers/SearchManager.ts#L747)

Search by keywords

#### Parameters

##### keywords

`string`[]

Keywords to search for

#### Returns

`Promise`\<`SearchResult`[]\>

Search results

***

### searchByUserKeywords()

> **searchByUserKeywords**(`keyword`): `Promise`\<`SearchResult`[]\>

Defined in: [src/managers/SearchManager.ts:680](https://github.com/jwilleke/amdWiki/blob/b6a859c7c9297966de89735ea5e8f953df289ac1/src/managers/SearchManager.ts#L680)

Search by user keywords only

#### Parameters

##### keyword

`string`

Keyword to search for

#### Returns

`Promise`\<`SearchResult`[]\>

Pages with keyword

***

### searchByUserKeywordsList()

> **searchByUserKeywordsList**(`keywords`): `Promise`\<`SearchResult`[]\>

Defined in: [src/managers/SearchManager.ts:599](https://github.com/jwilleke/amdWiki/blob/b6a859c7c9297966de89735ea5e8f953df289ac1/src/managers/SearchManager.ts#L599)

Search by multiple user keywords

#### Parameters

##### keywords

`string`[]

Array of user keywords to search

#### Returns

`Promise`\<`SearchResult`[]\>

Search results

***

### searchWithContext()

> **searchWithContext**(`wikiContext`, `query`, `options?`): `Promise`\<`SearchResult`[]\>

Defined in: [src/managers/SearchManager.ts:366](https://github.com/jwilleke/amdWiki/blob/b6a859c7c9297966de89735ea5e8f953df289ac1/src/managers/SearchManager.ts#L366)

Search for pages using WikiContext

Performs a search using WikiContext as the single source of truth for user information.
Logs search queries with user context for analytics and audit purposes.

#### Parameters

##### wikiContext

`WikiContext`

The wiki context containing user info

##### query

`string`

Search query

##### options?

`SearchOptions` = `{}`

Additional search options

#### Returns

`Promise`\<`SearchResult`[]\>

Search results

#### Async

#### Throws

If wikiContext is not provided

#### Example

```ts
const results = await searchManager.searchWithContext(wikiContext, 'hello world');
console.log(`Found ${results.length} pages`);
```

***

### shutdown()

> **shutdown**(): `Promise`\<`void`\>

Defined in: [src/managers/SearchManager.ts:861](https://github.com/jwilleke/amdWiki/blob/b6a859c7c9297966de89735ea5e8f953df289ac1/src/managers/SearchManager.ts#L861)

Shutdown search manager and close provider

#### Returns

`Promise`\<`void`\>

#### Overrides

[`default`](../../BaseManager/classes/default.md).[`shutdown`](../../BaseManager/classes/default.md#shutdown)

***

### suggestSimilarPages()

> **suggestSimilarPages**(`pageName`, `limit`): `Promise`\<`SearchResult`[]\>

Defined in: [src/managers/SearchManager.ts:489](https://github.com/jwilleke/amdWiki/blob/b6a859c7c9297966de89735ea5e8f953df289ac1/src/managers/SearchManager.ts#L489)

Suggest similar pages based on content

#### Parameters

##### pageName

`string`

Source page name

##### limit

`number` = `5`

Maximum suggestions

#### Returns

`Promise`\<`SearchResult`[]\>

Suggested pages

***

### updatePageInIndex()

> **updatePageInIndex**(`pageName`, `pageData`): `Promise`\<`void`\>

Defined in: [src/managers/SearchManager.ts:537](https://github.com/jwilleke/amdWiki/blob/b6a859c7c9297966de89735ea5e8f953df289ac1/src/managers/SearchManager.ts#L537)

Add/update a page in the search index

#### Parameters

##### pageName

`string`

Page name

##### pageData

`PageData`

Page data

#### Returns

`Promise`\<`void`\>
