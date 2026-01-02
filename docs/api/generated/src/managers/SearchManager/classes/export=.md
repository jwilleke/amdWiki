[**amdWiki API v1.5.0**](../../../../README.md)

***

[amdWiki API](../../../../README.md) / [src/managers/SearchManager](../README.md) / export=

# Class: export=

Defined in: [src/managers/SearchManager.ts:161](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/managers/SearchManager.ts#L161)

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

Defined in: [src/managers/SearchManager.ts:171](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/managers/SearchManager.ts#L171)

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

> `protected` `optional` **config**: `Record`\<`string`, `any`\>

Defined in: [src/managers/BaseManager.ts:63](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/managers/BaseManager.ts#L63)

Configuration passed during initialization

#### Inherited from

[`default`](../../BaseManager/classes/default.md).[`config`](../../BaseManager/classes/default.md#config)

***

### engine

> `protected` **engine**: [`WikiEngine`](../../../types/WikiEngine/interfaces/WikiEngine.md)

Defined in: [src/managers/BaseManager.ts:56](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/managers/BaseManager.ts#L56)

Reference to the wiki engine

#### Inherited from

[`default`](../../BaseManager/classes/default.md).[`engine`](../../BaseManager/classes/default.md#engine)

***

### initialized

> `protected` **initialized**: `boolean`

Defined in: [src/managers/BaseManager.ts:59](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/managers/BaseManager.ts#L59)

Initialization status flag

#### Inherited from

[`default`](../../BaseManager/classes/default.md).[`initialized`](../../BaseManager/classes/default.md#initialized)

## Methods

### addToIndex()

> **addToIndex**(`page`): `Promise`\<`void`\>

Defined in: [src/managers/SearchManager.ts:756](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/managers/SearchManager.ts#L756)

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

Defined in: [src/managers/SearchManager.ts:464](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/managers/SearchManager.ts#L464)

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

Defined in: [src/managers/SearchManager.ts:402](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/managers/SearchManager.ts#L402)

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

Defined in: [src/managers/SearchManager.ts:804](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/managers/SearchManager.ts#L804)

Backup search configuration and state

#### Returns

`Promise`\<[`BackupData`](../../BaseManager/interfaces/BackupData.md)\>

Backup data

#### Overrides

[`default`](../../BaseManager/classes/default.md).[`backup`](../../BaseManager/classes/default.md#backup)

***

### buildSearchIndex()

> **buildSearchIndex**(): `Promise`\<`void`\>

Defined in: [src/managers/SearchManager.ts:322](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/managers/SearchManager.ts#L322)

Build search index from all pages

#### Returns

`Promise`\<`void`\>

#### Throws

If index building fails

***

### getAllCategories()

> **getAllCategories**(): `Promise`\<`string`[]\>

Defined in: [src/managers/SearchManager.ts:620](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/managers/SearchManager.ts#L620)

Get all unique categories from indexed documents

#### Returns

`Promise`\<`string`[]\>

List of categories

***

### getAllUserKeywords()

> **getAllUserKeywords**(): `Promise`\<`string`[]\>

Defined in: [src/managers/SearchManager.ts:638](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/managers/SearchManager.ts#L638)

Get all unique user keywords from indexed documents

#### Returns

`Promise`\<`string`[]\>

List of user keywords

***

### getDocumentCount()

> **getDocumentCount**(): `Promise`\<`number`\>

Defined in: [src/managers/SearchManager.ts:724](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/managers/SearchManager.ts#L724)

Get the total number of indexed documents

#### Returns

`Promise`\<`number`\>

Number of documents

***

### getEngine()

> **getEngine**(): [`WikiEngine`](../../../types/WikiEngine/interfaces/WikiEngine.md)

Defined in: [src/managers/BaseManager.ts:126](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/managers/BaseManager.ts#L126)

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

Defined in: [src/managers/SearchManager.ts:694](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/managers/SearchManager.ts#L694)

Get search statistics

#### Returns

`Promise`\<`SearchStatistics`\>

Search statistics

***

### getSuggestions()

> **getSuggestions**(`partial`): `Promise`\<`string`[]\>

Defined in: [src/managers/SearchManager.ts:504](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/managers/SearchManager.ts#L504)

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

Defined in: [src/managers/SearchManager.ts:192](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/managers/SearchManager.ts#L192)

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

Defined in: [src/managers/BaseManager.ts:114](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/managers/BaseManager.ts#L114)

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

Defined in: [src/managers/SearchManager.ts:788](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/managers/SearchManager.ts#L788)

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

Defined in: [src/managers/SearchManager.ts:522](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/managers/SearchManager.ts#L522)

Rebuild search index (called after page changes)

#### Returns

`Promise`\<`void`\>

***

### removeFromIndex()

> **removeFromIndex**(`pageName`): `Promise`\<`void`\>

Defined in: [src/managers/SearchManager.ts:772](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/managers/SearchManager.ts#L772)

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

Defined in: [src/managers/SearchManager.ts:551](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/managers/SearchManager.ts#L551)

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

Defined in: [src/managers/SearchManager.ts:838](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/managers/SearchManager.ts#L838)

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

Defined in: [src/managers/SearchManager.ts:443](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/managers/SearchManager.ts#L443)

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

Defined in: [src/managers/SearchManager.ts:569](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/managers/SearchManager.ts#L569)

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

Defined in: [src/managers/SearchManager.ts:657](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/managers/SearchManager.ts#L657)

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

Defined in: [src/managers/SearchManager.ts:743](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/managers/SearchManager.ts#L743)

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

Defined in: [src/managers/SearchManager.ts:676](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/managers/SearchManager.ts#L676)

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

Defined in: [src/managers/SearchManager.ts:595](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/managers/SearchManager.ts#L595)

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

Defined in: [src/managers/SearchManager.ts:355](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/managers/SearchManager.ts#L355)

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

Defined in: [src/managers/SearchManager.ts:857](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/managers/SearchManager.ts#L857)

Shutdown search manager and close provider

#### Returns

`Promise`\<`void`\>

#### Overrides

[`default`](../../BaseManager/classes/default.md).[`shutdown`](../../BaseManager/classes/default.md#shutdown)

***

### suggestSimilarPages()

> **suggestSimilarPages**(`pageName`, `limit`): `Promise`\<`SearchResult`[]\>

Defined in: [src/managers/SearchManager.ts:485](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/managers/SearchManager.ts#L485)

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

Defined in: [src/managers/SearchManager.ts:533](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/managers/SearchManager.ts#L533)

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
