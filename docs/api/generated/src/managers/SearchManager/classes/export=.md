[**amdWiki API v1.5.0**](../../../../README.md)

***

[amdWiki API](../../../../README.md) / [src/managers/SearchManager](../README.md) / export=

# Class: export=

Defined in: [src/managers/SearchManager.js:43](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/managers/SearchManager.js#L43)

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

- [BaseManager](../../BaseManager/classes/export=.md) for base functionality
- LunrSearchProvider for default provider implementation

## Example

```ts
const searchManager = engine.getManager('SearchManager');
const results = await searchManager.search('hello world');
console.log(`Found ${results.length} pages`);

Related: GitHub Issue #102 - Configuration reorganization
```

## Extends

- [`export=`](../../BaseManager/classes/export=.md)

## Constructors

### Constructor

> **new export=**(`engine`): `SearchManager`

Defined in: [src/managers/SearchManager.js:50](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/managers/SearchManager.js#L50)

Creates a new SearchManager instance

#### Parameters

##### engine

`WikiEngine`

The wiki engine instance

#### Returns

`SearchManager`

#### Overrides

[`export=`](../../BaseManager/classes/export=.md).[`constructor`](../../BaseManager/classes/export=.md#constructor)

## Properties

### config

> **config**: `any`

Defined in: [src/managers/BaseManager.js:55](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/managers/BaseManager.js#L55)

Configuration object passed during initialization

#### Inherited from

[`export=`](../../BaseManager/classes/export=.md).[`config`](../../BaseManager/classes/export=.md#config)

***

### engine

> **engine**: `WikiEngine`

Defined in: [src/managers/BaseManager.js:33](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/managers/BaseManager.js#L33)

Reference to the wiki engine

#### Inherited from

[`export=`](../../BaseManager/classes/export=.md).[`engine`](../../BaseManager/classes/export=.md#engine)

***

### initialized

> **initialized**: `boolean`

Defined in: [src/managers/BaseManager.js:34](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/managers/BaseManager.js#L34)

Flag indicating initialization status

#### Inherited from

[`export=`](../../BaseManager/classes/export=.md).[`initialized`](../../BaseManager/classes/export=.md#initialized)

***

### provider

> **provider**: `any`

Defined in: [src/managers/SearchManager.js:52](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/managers/SearchManager.js#L52)

The active search provider

***

### providerClass

> **providerClass**: `string`

Defined in: [src/managers/SearchManager.js:53](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/managers/SearchManager.js#L53)

The class name of the loaded provider

## Methods

### addToIndex()

> **addToIndex**(`page`): `Promise`\<`void`\>

Defined in: [src/managers/SearchManager.js:601](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/managers/SearchManager.js#L601)

Add page to search index

#### Parameters

##### page

`any`

Page object to add

#### Returns

`Promise`\<`void`\>

***

### ~~advancedSearch()~~

> **advancedSearch**(`options`): `Promise`\<`any`[]\>

Defined in: [src/managers/SearchManager.js:324](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/managers/SearchManager.js#L324)

Advanced search with multiple criteria support

#### Parameters

##### options

`any` = `{}`

Search options

#### Returns

`Promise`\<`any`[]\>

Search results

#### Deprecated

Use advancedSearchWithContext() with WikiContext instead

***

### advancedSearchWithContext()

> **advancedSearchWithContext**(`wikiContext`, `options?`): `Promise`\<`any`[]\>

Defined in: [src/managers/SearchManager.js:267](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/managers/SearchManager.js#L267)

Advanced search with WikiContext

Performs advanced search with multiple criteria using WikiContext as the single source
of truth. Logs detailed search parameters with user context for analytics.

#### Parameters

##### wikiContext

`WikiContext`

The wiki context containing user info

##### options?

Search options

###### categories?

`string`[]

Categories to filter

###### maxResults?

`number`

Maximum results to return

###### query?

`string`

Text query

###### searchIn?

`string`[]

Fields to search in

###### userKeywords?

`string`[]

Keywords to filter

#### Returns

`Promise`\<`any`[]\>

Search results

#### Async

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

> **backup**(): `Promise`\<`any`\>

Defined in: [src/managers/SearchManager.js:646](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/managers/SearchManager.js#L646)

Backup search configuration and state

#### Returns

`Promise`\<`any`\>

Backup data

#### Overrides

[`export=`](../../BaseManager/classes/export=.md).[`backup`](../../BaseManager/classes/export=.md#backup)

***

### buildSearchIndex()

> **buildSearchIndex**(): `Promise`\<`void`\>

Defined in: [src/managers/SearchManager.js:188](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/managers/SearchManager.js#L188)

Build search index from all pages

#### Returns

`Promise`\<`void`\>

***

### getAllCategories()

> **getAllCategories**(): `Promise`\<`string`[]\>

Defined in: [src/managers/SearchManager.js:472](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/managers/SearchManager.js#L472)

Get all unique categories from indexed documents

#### Returns

`Promise`\<`string`[]\>

List of categories

***

### getAllUserKeywords()

> **getAllUserKeywords**(): `Promise`\<`string`[]\>

Defined in: [src/managers/SearchManager.js:489](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/managers/SearchManager.js#L489)

Get all unique user keywords from indexed documents

#### Returns

`Promise`\<`string`[]\>

List of user keywords

***

### getDocumentCount()

> **getDocumentCount**(): `Promise`\<`number`\>

Defined in: [src/managers/SearchManager.js:571](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/managers/SearchManager.js#L571)

Get the total number of indexed documents

#### Returns

`Promise`\<`number`\>

Number of documents

***

### getEngine()

> **getEngine**(): `WikiEngine`

Defined in: [src/managers/BaseManager.js:81](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/managers/BaseManager.js#L81)

Get the wiki engine instance

#### Returns

`WikiEngine`

The wiki engine instance

#### Example

```ts
const config = this.getEngine().getConfig();
```

#### Inherited from

[`export=`](../../BaseManager/classes/export=.md).[`getEngine`](../../BaseManager/classes/export=.md#getengine)

***

### getStatistics()

> **getStatistics**(): `Promise`\<`any`\>

Defined in: [src/managers/SearchManager.js:542](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/managers/SearchManager.js#L542)

Get search statistics

#### Returns

`Promise`\<`any`\>

Search statistics

***

### getSuggestions()

> **getSuggestions**(`partial`): `Promise`\<`string`[]\>

Defined in: [src/managers/SearchManager.js:362](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/managers/SearchManager.js#L362)

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

Defined in: [src/managers/SearchManager.js:71](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/managers/SearchManager.js#L71)

Initialize the SearchManager and load the configured provider

Loads the search provider, builds the initial search index, and prepares
the search system for queries.

#### Parameters

##### config?

`any` = `{}`

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

[`export=`](../../BaseManager/classes/export=.md).[`initialize`](../../BaseManager/classes/export=.md#initialize)

***

### isInitialized()

> **isInitialized**(): `boolean`

Defined in: [src/managers/BaseManager.js:69](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/managers/BaseManager.js#L69)

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

[`export=`](../../BaseManager/classes/export=.md).[`isInitialized`](../../BaseManager/classes/export=.md#isinitialized)

***

### multiSearch()

> **multiSearch**(`criteria`): `Promise`\<`any`[]\>

Defined in: [src/managers/SearchManager.js:631](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/managers/SearchManager.js#L631)

Perform multi-criteria search

#### Parameters

##### criteria

`any`

Search criteria object

#### Returns

`Promise`\<`any`[]\>

Search results

***

### rebuildIndex()

> **rebuildIndex**(): `Promise`\<`void`\>

Defined in: [src/managers/SearchManager.js:379](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/managers/SearchManager.js#L379)

Rebuild search index (called after page changes)

#### Returns

`Promise`\<`void`\>

***

### removeFromIndex()

> **removeFromIndex**(`pageName`): `Promise`\<`void`\>

Defined in: [src/managers/SearchManager.js:616](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/managers/SearchManager.js#L616)

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

Defined in: [src/managers/SearchManager.js:406](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/managers/SearchManager.js#L406)

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

Defined in: [src/managers/SearchManager.js:671](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/managers/SearchManager.js#L671)

Restore search from backup

#### Parameters

##### backupData

`any`

Backup data

#### Returns

`Promise`\<`void`\>

#### Overrides

[`export=`](../../BaseManager/classes/export=.md).[`restore`](../../BaseManager/classes/export=.md#restore)

***

### ~~search()~~

> **search**(`query`, `options`): `Promise`\<`any`[]\>

Defined in: [src/managers/SearchManager.js:304](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/managers/SearchManager.js#L304)

Search for pages matching the query

#### Parameters

##### query

`string`

Search query

##### options

`any` = `{}`

Search options

#### Returns

`Promise`\<`any`[]\>

Search results

#### Deprecated

Use searchWithContext() with WikiContext instead

***

### searchByCategories()

> **searchByCategories**(`categories`): `Promise`\<`any`[]\>

Defined in: [src/managers/SearchManager.js:423](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/managers/SearchManager.js#L423)

Search by multiple categories

#### Parameters

##### categories

`any`[]

Array of category names to search

#### Returns

`Promise`\<`any`[]\>

Search results

***

### searchByCategory()

> **searchByCategory**(`category`): `Promise`\<`any`[]\>

Defined in: [src/managers/SearchManager.js:507](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/managers/SearchManager.js#L507)

Search by category only

#### Parameters

##### category

`string`

Category to search for

#### Returns

`Promise`\<`any`[]\>

Pages in category

***

### searchByKeywords()

> **searchByKeywords**(`keywords`): `Promise`\<`any`[]\>

Defined in: [src/managers/SearchManager.js:589](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/managers/SearchManager.js#L589)

Search by keywords

#### Parameters

##### keywords

`any`[]

Keywords to search for

#### Returns

`Promise`\<`any`[]\>

Search results

***

### searchByUserKeywords()

> **searchByUserKeywords**(`keyword`): `Promise`\<`any`[]\>

Defined in: [src/managers/SearchManager.js:525](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/managers/SearchManager.js#L525)

Search by user keywords only

#### Parameters

##### keyword

`string`

Keyword to search for

#### Returns

`Promise`\<`any`[]\>

Pages with keyword

***

### searchByUserKeywordsList()

> **searchByUserKeywordsList**(`keywords`): `Promise`\<`any`[]\>

Defined in: [src/managers/SearchManager.js:448](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/managers/SearchManager.js#L448)

Search by multiple user keywords

#### Parameters

##### keywords

`any`[]

Array of user keywords to search

#### Returns

`Promise`\<`any`[]\>

Search results

***

### searchWithContext()

> **searchWithContext**(`wikiContext`, `query`, `options?`): `Promise`\<`any`[]\>

Defined in: [src/managers/SearchManager.js:220](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/managers/SearchManager.js#L220)

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

`any` = `{}`

Additional search options

#### Returns

`Promise`\<`any`[]\>

Search results

#### Async

#### Example

```ts
const results = await searchManager.searchWithContext(wikiContext, 'hello world');
console.log(`Found ${results.length} pages`);
```

***

### shutdown()

> **shutdown**(): `Promise`\<`void`\>

Defined in: [src/managers/SearchManager.js:689](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/managers/SearchManager.js#L689)

Shutdown search manager and close provider

#### Returns

`Promise`\<`void`\>

#### Overrides

[`export=`](../../BaseManager/classes/export=.md).[`shutdown`](../../BaseManager/classes/export=.md#shutdown)

***

### suggestSimilarPages()

> **suggestSimilarPages**(`pageName`, `limit`): `Promise`\<`any`[]\>

Defined in: [src/managers/SearchManager.js:344](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/managers/SearchManager.js#L344)

Suggest similar pages based on content

#### Parameters

##### pageName

`string`

Source page name

##### limit

`number` = `5`

Maximum suggestions

#### Returns

`Promise`\<`any`[]\>

Suggested pages

***

### updatePageInIndex()

> **updatePageInIndex**(`pageName`, `pageData`): `Promise`\<`void`\>

Defined in: [src/managers/SearchManager.js:389](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/managers/SearchManager.js#L389)

Add/update a page in the search index

#### Parameters

##### pageName

`string`

Page name

##### pageData

`any`

Page data

#### Returns

`Promise`\<`void`\>
