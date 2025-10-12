# SearchManager

## Overview

The `SearchManager` is responsible for full-text search indexing and querying in amdWiki. It provides a centralized system for searching wiki content, suggesting similar pages, autocomplete functionality, and filtering by categories and keywords. The SearchManager uses a **provider pattern** to support multiple search backends, making it flexible for different deployment scenarios from small wikis to large-scale enterprise deployments.

**Key Features:**
- **Pluggable Search Backends:** Lunr.js, Elasticsearch, Algolia, and more
- **Full-Text Search:** Search across page content, titles, categories, and metadata
- **Field Boosting:** Configurable relevance scoring for different content fields
- **Autocomplete Suggestions:** Real-time search suggestions as users type
- **Similar Pages:** Content-based page recommendations
- **Advanced Filtering:** Search by categories, keywords, tags, and custom criteria
- **Snippet Generation:** Context-aware excerpts with highlighted search terms
- **Health Monitoring:** Provider health checks with automatic fallback
- **Backup and Restore:** Full index backup and recovery support

## Architecture

```text
┌─────────────────────────────────────────────────────────────┐
│                       SearchManager                         │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Public API                                          │  │
│  │  - search()                                          │  │
│  │  - advancedSearch()                                  │  │
│  │  - getSuggestions()                                  │  │
│  │  - suggestSimilarPages()                            │  │
│  │  - searchByCategory()                               │  │
│  │  - searchByUserKeywords()                           │  │
│  │  - buildSearchIndex()                               │  │
│  └──────────────────────────────────────────────────────┘  │
│                           │                                 │
│                           ▼                                 │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Provider Management                                 │  │
│  │  - Provider Loading & Normalization                  │  │
│  │  - Health Check & Failover                          │  │
│  │  - Configuration Integration                         │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                             │
         ┌───────────────────┼───────────────────┐
         ▼                   ▼                   ▼
┌──────────────────┐ ┌──────────────────┐ ┌──────────────────┐
│ LunrSearchProvider│ │Elasticsearch     │ │AlgoliaSearch     │
│                  │ │Provider          │ │Provider          │
│ - In-Memory      │ │ - Distributed    │ │ - Cloud-Managed  │
│ - Stemming       │ │ - Scalable       │ │ - Instant Search │
│ - Field Boost    │ │ - Real-time      │ │ - Analytics      │
└──────────────────┘ └──────────────────┘ └──────────────────┘
         │                   │                   │
         ▼                   ▼                   ▼
┌──────────────────┐ ┌──────────────────┐ ┌──────────────────┐
│  Memory/Disk     │ │  Elasticsearch   │ │  Algolia Cloud   │
└──────────────────┘ └──────────────────┘ └──────────────────┘
```

### Provider Pattern

The SearchManager implements a provider pattern that separates the search management logic from the search engine implementation:

1. **BaseSearchProvider:** Abstract interface defining the contract for all search providers
2. **Concrete Providers:** Implementations for specific search engines (Lunr.js, Elasticsearch, etc.)
3. **Provider Discovery:** Dynamic loading based on configuration
4. **Health Monitoring:** Automatic health checks during initialization
5. **Consistent API:** All providers implement the same interface

## Configuration

### Core Search Settings

All configuration keys use **lowercase** format per Issue #102 refactoring.

```json
{
  "_comment_search_storage": "Search indexing configuration (ALL LOWERCASE)",
  "amdwiki.search.enabled": true,
  "amdwiki.search.provider.default": "lunrsearchprovider",
  "amdwiki.search.provider": "lunrsearchprovider",
  "amdwiki.search.maxresults": 50,
  "amdwiki.search.autocomplete.enabled": true,
  "amdwiki.search.autocomplete.minlength": 2,
  "amdwiki.search.suggestions.enabled": true,
  "amdwiki.search.suggestions.maxitems": 10
}
```

### Configuration Reference

| Configuration Key | Type | Default | Description |
|------------------|------|---------|-------------|
| `amdwiki.search.enabled` | boolean | `true` | Enable/disable search functionality |
| `amdwiki.search.provider.default` | string | `"lunrsearchprovider"` | Fallback provider if primary fails |
| `amdwiki.search.provider` | string | `"lunrsearchprovider"` | Active search provider |
| `amdwiki.search.maxresults` | number | `50` | Maximum search results to return |
| `amdwiki.search.autocomplete.enabled` | boolean | `true` | Enable autocomplete suggestions |
| `amdwiki.search.autocomplete.minlength` | number | `2` | Minimum characters for autocomplete |
| `amdwiki.search.suggestions.enabled` | boolean | `true` | Enable search suggestions |
| `amdwiki.search.suggestions.maxitems` | number | `10` | Maximum suggestion items |

### Provider-Specific Configuration

#### LunrSearchProvider

```json
{
  "_comment_search_provider_lunr": "LunrSearchProvider settings",
  "amdwiki.search.provider.lunr.indexdir": "./search-index",
  "amdwiki.search.provider.lunr.stemming": true,
  "amdwiki.search.provider.lunr.boost.title": 10,
  "amdwiki.search.provider.lunr.boost.systemcategory": 8,
  "amdwiki.search.provider.lunr.boost.userkeywords": 6,
  "amdwiki.search.provider.lunr.boost.tags": 5,
  "amdwiki.search.provider.lunr.boost.keywords": 4,
  "amdwiki.search.provider.lunr.maxresults": 50,
  "amdwiki.search.provider.lunr.snippetlength": 200
}
```

**LunrSearchProvider Configuration:**

| Key | Type | Default | Description |
|-----|------|---------|-------------|
| `indexdir` | string | `"./search-index"` | Directory for persisted index files |
| `stemming` | boolean | `true` | Enable word stemming (running → run) |
| `boost.title` | number | `10` | Relevance boost for title matches |
| `boost.systemcategory` | number | `8` | Relevance boost for category matches |
| `boost.userkeywords` | number | `6` | Relevance boost for user keyword matches |
| `boost.tags` | number | `5` | Relevance boost for tag matches |
| `boost.keywords` | number | `4` | Relevance boost for keyword field |
| `maxresults` | number | `50` | Maximum results per search |
| `snippetlength` | number | `200` | Maximum snippet length in characters |

**Best For:**
- Small to medium wikis (<10,000 pages)
- Single-instance deployments
- Development and testing
- No external dependencies required

#### ElasticsearchProvider (Future)

```json
{
  "_comment_search_provider_elasticsearch": "ElasticsearchProvider settings (future)",
  "amdwiki.search.provider.elasticsearch.url": "http://localhost:9200",
  "amdwiki.search.provider.elasticsearch.indexname": "amdwiki",
  "amdwiki.search.provider.elasticsearch.connecttimeout": 5000,
  "amdwiki.search.provider.elasticsearch.requesttimeout": 30000
}
```

**Best For:**
- Large-scale wikis (10,000+ pages)
- Distributed deployments
- Real-time indexing requirements
- Advanced analytics and aggregations

#### AlgoliaSearchProvider (Future)

**Best For:**
- Cloud-native deployments
- Instant search-as-you-type
- Managed service with analytics
- Global CDN distribution

## Usage

### Basic Search

```javascript
const searchManager = engine.getManager('SearchManager');

// Simple text search
const results = await searchManager.search('project documentation');

results.forEach(result => {
  console.log(`${result.title} (score: ${result.score})`);
  console.log(`Snippet: ${result.snippet}`);
  console.log(`Metadata:`, result.metadata);
});
```

**Output:**
```javascript
[
  {
    name: 'ProjectDocs',
    title: 'Project Documentation',
    score: 2.345,
    snippet: 'This is the main <mark>project</mark> <mark>documentation</mark>...',
    metadata: {
      wordCount: 1234,
      tags: 'documentation development',
      systemCategory: 'documentation',
      userKeywords: 'project guide',
      lastModified: '2025-10-12T10:00:00.000Z'
    }
  }
]
```

### Advanced Search

```javascript
// Multi-criteria search
const results = await searchManager.advancedSearch({
  query: 'authentication',
  categories: ['system', 'security'],
  userKeywords: ['user-management'],
  maxResults: 20
});
```

### Search with Options

```javascript
// Search with custom options
const results = await searchManager.search('wiki', {
  maxResults: 10,
  searchIn: ['title', 'content']
});
```

### Autocomplete Suggestions

```javascript
// Get autocomplete suggestions
const suggestions = await searchManager.getSuggestions('doc');
// Returns: ['documentation', 'docker', 'document', ...]
```

### Similar Pages

```javascript
// Find similar pages based on content
const similarPages = await searchManager.suggestSimilarPages('HomePage', 5);

similarPages.forEach(page => {
  console.log(`${page.title} (relevance: ${page.score})`);
});
```

### Search by Category

```javascript
// Find all pages in a category
const systemPages = await searchManager.searchByCategory('system');

// Search multiple categories
const pages = await searchManager.searchByCategories([
  'documentation',
  'developer'
]);
```

### Search by Keywords

```javascript
// Find pages with specific user keywords
const medicalPages = await searchManager.searchByUserKeywords('medicine');

// Search multiple keywords
const pages = await searchManager.searchByUserKeywordsList([
  'medicine',
  'healthcare'
]);
```

### Get Statistics

```javascript
// Get search index statistics
const stats = await searchManager.getStatistics();

console.log(`Total Documents: ${stats.totalDocuments}`);
console.log(`Index Size: ${stats.indexSize} bytes`);
console.log(`Avg Document Length: ${stats.averageDocumentLength} chars`);
console.log(`Categories: ${stats.totalCategories}`);
console.log(`User Keywords: ${stats.totalUserKeywords}`);
```

### Index Management

```javascript
// Rebuild entire search index
await searchManager.rebuildIndex();

// Add/update a page in the index
await searchManager.updatePageInIndex('NewPage', {
  content: 'Page content...',
  metadata: {
    title: 'New Page',
    'system-category': 'general',
    'user-keywords': ['example'],
    tags: ['new', 'test']
  }
});

// Remove a page from the index
await searchManager.removePageFromIndex('OldPage');

// Get document count
const count = await searchManager.getDocumentCount();
console.log(`Indexed pages: ${count}`);
```

### Backup and Restore

```javascript
// Backup search index
const backupData = await searchManager.backup();
// Save backupData to file or database

// Restore from backup
await searchManager.restore(backupData);
```

## API Reference

### Core Methods

#### `initialize(config)`

Initializes the SearchManager with the configured search provider.

**Parameters:**
- `config` (Object) - Configuration options (usually empty, uses ConfigurationManager)

**Returns:** `Promise<void>`

**Example:**
```javascript
await searchManager.initialize();
```

#### `buildSearchIndex()`

Builds or rebuilds the entire search index from all pages.

**Returns:** `Promise<void>`

**Example:**
```javascript
await searchManager.buildSearchIndex();
// Logs: 🔍 Search index built with 83 documents
```

#### `search(query, options)`

Searches for pages matching the query.

**Parameters:**
- `query` (string) - Search query string
- `options` (Object) - Optional search options
  - `maxResults` (number) - Maximum results to return
  - `searchIn` (Array<string>) - Fields to search in

**Returns:** `Promise<Array<SearchResult>>`

**SearchResult Structure:**
```javascript
{
  name: string,              // Page name/ID
  title: string,             // Page title
  score: number,             // Relevance score (higher = more relevant)
  snippet: string,           // Content excerpt with <mark> tags
  metadata: {
    wordCount: number,       // Total word count
    tags: string,            // Space-separated tags
    systemCategory: string,  // System category
    userKeywords: string,    // User-defined keywords
    lastModified: string     // ISO 8601 timestamp
  }
}
```

**Example:**
```javascript
const results = await searchManager.search('authentication security', {
  maxResults: 10
});
```

#### `advancedSearch(options)`

Performs advanced multi-criteria search.

**Parameters:**
- `options` (Object)
  - `query` (string) - Text query (optional)
  - `categories` (Array<string>) - Filter by categories
  - `userKeywords` (Array<string>) - Filter by user keywords
  - `searchIn` (Array<string>) - Fields to search in
  - `maxResults` (number) - Maximum results

**Returns:** `Promise<Array<SearchResult>>`

**Example:**
```javascript
const results = await searchManager.advancedSearch({
  query: 'configuration',
  categories: ['system', 'documentation'],
  userKeywords: ['setup', 'installation'],
  maxResults: 20
});
```

#### `getSuggestions(partial)`

Gets autocomplete suggestions for a partial search term.

**Parameters:**
- `partial` (string) - Partial search term (minimum 2 characters)

**Returns:** `Promise<Array<string>>`

**Example:**
```javascript
const suggestions = await searchManager.getSuggestions('doc');
// Returns: ['documentation', 'docker', 'document', 'docs']
```

#### `suggestSimilarPages(pageName, limit)`

Finds similar pages based on content analysis.

**Parameters:**
- `pageName` (string) - Source page name
- `limit` (number) - Maximum suggestions (default: 5)

**Returns:** `Promise<Array<SearchResult>>`

**Example:**
```javascript
const similar = await searchManager.suggestSimilarPages('APIDocumentation', 5);
```

#### `searchByCategory(category)`

Searches for pages in a specific category.

**Parameters:**
- `category` (string) - Category name to search

**Returns:** `Promise<Array<SearchResult>>`

**Example:**
```javascript
const systemPages = await searchManager.searchByCategory('system');
```

#### `searchByCategories(categories)`

Searches for pages in multiple categories.

**Parameters:**
- `categories` (Array<string>) - Array of category names

**Returns:** `Promise<Array<SearchResult>>`

**Example:**
```javascript
const pages = await searchManager.searchByCategories([
  'documentation',
  'developer',
  'user'
]);
```

#### `searchByUserKeywords(keyword)`

Searches for pages with a specific user keyword.

**Parameters:**
- `keyword` (string) - User keyword to search

**Returns:** `Promise<Array<SearchResult>>`

**Example:**
```javascript
const medicalPages = await searchManager.searchByUserKeywords('medicine');
```

#### `searchByUserKeywordsList(keywords)`

Searches for pages with multiple user keywords.

**Parameters:**
- `keywords` (Array<string>) - Array of user keywords

**Returns:** `Promise<Array<SearchResult>>`

**Example:**
```javascript
const pages = await searchManager.searchByUserKeywordsList([
  'medicine',
  'healthcare',
  'treatment'
]);
```

#### `getAllCategories()`

Gets all unique categories from indexed documents.

**Returns:** `Promise<Array<string>>`

**Example:**
```javascript
const categories = await searchManager.getAllCategories();
// Returns: ['documentation', 'general', 'system', 'developer', ...]
```

#### `getAllUserKeywords()`

Gets all unique user keywords from indexed documents.

**Returns:** `Promise<Array<string>>`

**Example:**
```javascript
const keywords = await searchManager.getAllUserKeywords();
// Returns: ['medicine', 'geology', 'draft', 'published', ...]
```

#### `getStatistics()`

Gets comprehensive search index statistics.

**Returns:** `Promise<Object>`

**Statistics Structure:**
```javascript
{
  totalDocuments: number,          // Total indexed pages
  indexSize: number,               // Index size in bytes
  averageDocumentLength: number,   // Average page length
  totalCategories: number,         // Number of unique categories
  totalUserKeywords: number,       // Number of unique keywords
  providerName: string,            // Active provider name
  providerVersion: string          // Provider version
}
```

**Example:**
```javascript
const stats = await searchManager.getStatistics();
console.log(`Indexed ${stats.totalDocuments} pages`);
```

#### `getDocumentCount()`

Gets the total number of indexed documents.

**Returns:** `Promise<number>`

**Example:**
```javascript
const count = await searchManager.getDocumentCount();
console.log(`${count} pages indexed`);
```

### Index Management Methods

#### `rebuildIndex()`

Alias for `buildSearchIndex()`. Rebuilds the entire search index.

**Returns:** `Promise<void>`

**Example:**
```javascript
await searchManager.rebuildIndex();
```

#### `updatePageInIndex(pageName, pageData)`

Adds or updates a single page in the search index.

**Parameters:**
- `pageName` (string) - Page name/ID
- `pageData` (Object) - Page data
  - `content` (string) - Page content
  - `metadata` (Object) - Page metadata

**Returns:** `Promise<void>`

**Example:**
```javascript
await searchManager.updatePageInIndex('NewPage', {
  content: 'This is the page content...',
  metadata: {
    title: 'New Page',
    'system-category': 'documentation',
    'user-keywords': ['example', 'demo'],
    tags: ['new', 'test']
  }
});
```

#### `removePageFromIndex(pageName)`

Removes a page from the search index.

**Parameters:**
- `pageName` (string) - Page name to remove

**Returns:** `Promise<void>`

**Example:**
```javascript
await searchManager.removePageFromIndex('DeletedPage');
```

#### `addToIndex(page)`

Adds a page object to the index.

**Parameters:**
- `page` (Object) - Page object with `name`, `content`, and `metadata`

**Returns:** `Promise<void>`

**Example:**
```javascript
await searchManager.addToIndex({
  name: 'TestPage',
  content: 'Test content...',
  metadata: {
    title: 'Test Page',
    'system-category': 'test'
  }
});
```

#### `removeFromIndex(pageName)`

Alias for `removePageFromIndex()`.

**Parameters:**
- `pageName` (string) - Page name to remove

**Returns:** `Promise<void>`

### Backup and Recovery Methods

#### `backup()`

Creates a backup of the search index and configuration.

**Returns:** `Promise<Object>` - Backup data object

**Example:**
```javascript
const backup = await searchManager.backup();
// Save to file
const fs = require('fs').promises;
await fs.writeFile(
  './backups/search-index-backup.json',
  JSON.stringify(backup, null, 2)
);
```

#### `restore(backupData)`

Restores the search index from backup data.

**Parameters:**
- `backupData` (Object) - Backup data from `backup()`

**Returns:** `Promise<void>`

**Example:**
```javascript
const fs = require('fs').promises;
const backup = JSON.parse(
  await fs.readFile('./backups/search-index-backup.json', 'utf8')
);
await searchManager.restore(backup);
```

#### `shutdown()`

Gracefully shuts down the SearchManager and closes the provider.

**Returns:** `Promise<void>`

**Example:**
```javascript
await searchManager.shutdown();
// Logs: [LunrSearchProvider] Closed successfully
// Logs: [SearchManager] Shut down successfully
```

## Search Relevance and Boosting

### Field Boost Configuration

The LunrSearchProvider uses field boosting to improve search relevance:

| Field | Default Boost | Description |
|-------|--------------|-------------|
| `title` | 10 | Page title (highest priority) |
| `systemCategory` | 8 | System category field |
| `userKeywords` | 6 | User-defined keywords |
| `tags` | 5 | Page tags |
| `keywords` | 4 | Combined keywords field |
| `content` | 1 | Page content (baseline) |

### Boost Tuning Example

```json
{
  "amdwiki.search.provider.lunr.boost.title": 15,
  "amdwiki.search.provider.lunr.boost.systemcategory": 10,
  "amdwiki.search.provider.lunr.boost.userkeywords": 8,
  "amdwiki.search.provider.lunr.boost.tags": 6,
  "amdwiki.search.provider.lunr.boost.keywords": 5
}
```

### Relevance Calculation

The relevance score is calculated using:
1. **Term Frequency (TF):** How often the search term appears
2. **Inverse Document Frequency (IDF):** How unique the term is across all documents
3. **Field Boosting:** Multiplier based on which field contains the match
4. **Length Normalization:** Adjusts for document length

**Example:**
```javascript
// Searching for "authentication"
// Document A: "authentication" in title → score: 10.0 × TF-IDF
// Document B: "authentication" in content → score: 1.0 × TF-IDF
// Result: Document A ranks higher
```

## Snippet Generation

The SearchManager generates context-aware snippets with highlighted search terms:

### Snippet Features

1. **Best Position Selection:** Finds the text window with the most search term matches
2. **Configurable Length:** Default 200 characters (configurable)
3. **Term Highlighting:** Wraps matches in `<mark>` tags
4. **Ellipsis Truncation:** Adds `...` for long content

### Example

**Query:** `"wiki documentation"`

**Snippet Output:**
```html
This is the main <mark>wiki</mark> <mark>documentation</mark> page.
It contains information about how to use the <mark>wiki</mark> system
including creating pages, editing content...
```

### Configuration

```json
{
  "amdwiki.search.provider.lunr.snippetlength": 200
}
```

## Provider Information

### LunrSearchProvider

**Current Implementation:** ✅ **Available**

```javascript
const info = searchManager.provider.getProviderInfo();
console.log(info);
```

**Output:**
```javascript
{
  name: 'LunrSearchProvider',
  version: '1.0.0',
  description: 'Full-text search using Lunr.js',
  features: [
    'full-text',
    'stemming',
    'field-boosting',
    'snippets',
    'suggestions'
  ]
}
```

**Capabilities:**
- ✅ Full-text search with stemming
- ✅ Field-based relevance boosting
- ✅ Snippet generation with highlighting
- ✅ Autocomplete suggestions
- ✅ Similar page recommendations
- ✅ Category and keyword filtering
- ✅ Multi-criteria advanced search
- ✅ Backup and restore
- ✅ In-memory indexing
- ⚠️ Limited to ~10,000 pages

**Use Cases:**
- Small to medium wikis
- Single-instance deployments
- Development and testing
- Embedded documentation systems

### ElasticsearchProvider (Future)

**Status:** 🔮 **Planned**

**Capabilities:**
- Distributed full-text search
- Real-time indexing
- Fuzzy matching and typo tolerance
- Aggregations and faceting
- Scalable to millions of pages
- Advanced analytics
- Multi-language support
- Geographic search

**Use Cases:**
- Large-scale enterprise wikis
- Multi-tenant deployments
- Knowledge bases with >10,000 pages
- Real-time search requirements

### AlgoliaSearchProvider (Future)

**Status:** 🔮 **Planned**

**Capabilities:**
- Instant search-as-you-type
- Managed cloud service
- Global CDN distribution
- Built-in analytics
- Personalization
- A/B testing
- Typo tolerance
- Query suggestions

**Use Cases:**
- Cloud-native deployments
- Public-facing wikis
- SaaS applications
- Global distributed teams

## Events and Integration

### PageManager Integration

SearchManager automatically integrates with PageManager to keep the index up-to-date:

```javascript
// In PageManager
await pageManager.savePage(pageName, content, metadata);
// SearchManager automatically updates the index

await pageManager.deletePage(pageName);
// SearchManager automatically removes from index
```

### Manual Integration

For custom integrations:

```javascript
// After creating/updating a page
await searchManager.updatePageInIndex(pageName, pageData);

// After deleting a page
await searchManager.removePageFromIndex(pageName);

// For bulk changes
await searchManager.rebuildIndex();
```

## Performance Considerations

### LunrSearchProvider Performance

**Index Building:**
- Time: ~0.1-0.5 seconds per 100 pages
- Memory: ~5-10 MB per 1,000 pages
- Recommended: <10,000 pages

**Search Performance:**
- Time: <10ms for most queries
- Memory: Constant (index in memory)
- Scales linearly with index size

### Optimization Tips

1. **Index Building:**
   ```javascript
   // Build index during startup or off-peak hours
   await searchManager.buildSearchIndex();
   ```

2. **Incremental Updates:**
   ```javascript
   // Update individual pages instead of full rebuild
   await searchManager.updatePageInIndex(pageName, pageData);
   ```

3. **Result Limiting:**
   ```javascript
   // Limit results for faster response
   const results = await searchManager.search(query, { maxResults: 10 });
   ```

4. **Field Boosting:**
   ```json
   // Fine-tune boost values for your content
   {
     "amdwiki.search.provider.lunr.boost.title": 15,
     "amdwiki.search.provider.lunr.boost.content": 1
   }
   ```

## Troubleshooting

### Common Issues

#### 1. Search Returns No Results

**Symptoms:**
```javascript
const results = await searchManager.search('test');
console.log(results); // []
```

**Solutions:**
1. Check if index is built:
   ```javascript
   const count = await searchManager.getDocumentCount();
   console.log(`Indexed pages: ${count}`);
   ```

2. Rebuild index:
   ```javascript
   await searchManager.rebuildIndex();
   ```

3. Verify pages exist:
   ```javascript
   const pageManager = engine.getManager('PageManager');
   const pages = await pageManager.getAllPages();
   console.log(`Total pages: ${pages.length}`);
   ```

#### 2. Provider Load Failure

**Symptoms:**
```
Error: Failed to load search provider: Cannot find module '../providers/LunrSearchProvider'
```

**Solutions:**
1. Verify provider file exists:
   ```bash
   ls -la src/providers/LunrSearchProvider.js
   ```

2. Check configuration:
   ```json
   {
     "amdwiki.search.provider": "lunrsearchprovider"
   }
   ```

3. Check provider normalization:
   ```javascript
   // Should convert: lunrsearchprovider → LunrSearchProvider
   ```

#### 3. Poor Search Relevance

**Solutions:**
1. Adjust field boost values
2. Use more specific search terms
3. Enable stemming
4. Check document content quality

#### 4. Slow Index Building

**Solutions:**
1. Reduce page count
2. Build index asynchronously
3. Consider Elasticsearch for large wikis
4. Optimize page content size

### Debug Mode

Enable debug logging:

```javascript
const logger = require('./utils/logger');
logger.level = 'debug';

await searchManager.buildSearchIndex();
// Shows detailed indexing progress
```

### Health Check

```javascript
const isHealthy = await searchManager.provider.isHealthy();
console.log(`Provider healthy: ${isHealthy}`);
```

## Best Practices

### 1. Index Management

✅ **Do:**
- Build index during application startup
- Use incremental updates for single page changes
- Schedule periodic full rebuilds (e.g., daily)
- Monitor index size and performance

❌ **Don't:**
- Rebuild index on every page update
- Build index synchronously in request handlers
- Ignore index health status

### 2. Search Queries

✅ **Do:**
- Use specific search terms
- Limit results with `maxResults`
- Use advanced search for complex queries
- Cache frequently searched queries

❌ **Don't:**
- Search with single-character terms
- Return unlimited results
- Use wildcards excessively

### 3. Configuration

✅ **Do:**
- Tune boost values for your content
- Configure appropriate snippet length
- Set reasonable result limits
- Use provider-specific optimizations

❌ **Don't:**
- Use default values without testing
- Set extremely high boost values
- Return entire page content

### 4. Performance

✅ **Do:**
- Monitor search performance metrics
- Use appropriate provider for scale
- Implement result caching
- Paginate large result sets

❌ **Don't:**
- Block on index building
- Load entire index for every search
- Ignore memory usage

## Migration Guide

### From Direct Lunr.js to SearchManager

**Before:**
```javascript
const lunr = require('lunr');
const idx = lunr(function () {
  this.ref('id');
  this.field('title');
  this.field('content');
  // ...
});
const results = idx.search('query');
```

**After:**
```javascript
const searchManager = engine.getManager('SearchManager');
await searchManager.initialize();
const results = await searchManager.search('query');
```

### Configuration Migration

**Before:**
```json
{
  "amdwiki.searchProvider": "LunrSearchProvider"
}
```

**After:**
```json
{
  "amdwiki.search.enabled": true,
  "amdwiki.search.provider": "lunrsearchprovider",
  "amdwiki.search.provider.lunr.stemming": true
}
```

## Related Documentation

- [BaseSearchProvider](../../src/providers/BaseSearchProvider.js) - Provider interface
- [LunrSearchProvider](../../src/providers/LunrSearchProvider.js) - Lunr.js implementation
- [PageManager](./PageManager.md) - Page content management
- [CacheManager](./CacheManager.md) - Similar provider pattern
- [AuditManager](./AuditManager.md) - Similar provider pattern
- [GitHub Issue #102](https://github.com/jwilleke/amdWiki/issues/102) - Configuration reorganization

## Version History

### v1.0.0 (2025-10-12)
- ✅ Initial implementation with provider pattern
- ✅ LunrSearchProvider with full-text search
- ✅ Field boosting and relevance tuning
- ✅ Snippet generation with highlighting
- ✅ Autocomplete suggestions
- ✅ Similar page recommendations
- ✅ Category and keyword filtering
- ✅ Advanced multi-criteria search
- ✅ Backup and restore support
- ✅ Health monitoring
- ✅ Configuration following Issue #102 pattern

---

**Maintained By:** Development Team
**Status:** Active Development
**Related Issue:** #102
