const BaseSearchProvider = require('./BaseSearchProvider');
const lunr = require('lunr');
const logger = require('../utils/logger');

/**
 * LunrSearchProvider - Full-text search provider using Lunr.js
 *
 * Provides client-side full-text search with stemming, stopwords, and field boosting.
 * Suitable for small to medium-sized wikis (<10,000 pages).
 *
 * Configuration keys (all lowercase):
 * - amdwiki.search.provider.lunr.indexdir - Directory for persisted index
 * - amdwiki.search.provider.lunr.stemming - Enable/disable stemming
 * - amdwiki.search.provider.lunr.boost.title - Title field boost factor
 * - amdwiki.search.provider.lunr.boost.systemcategory - System category boost
 * - amdwiki.search.provider.lunr.boost.userkeywords - User keywords boost
 * - amdwiki.search.provider.lunr.boost.tags - Tags boost
 * - amdwiki.search.provider.lunr.maxresults - Maximum results to return
 * - amdwiki.search.provider.lunr.snippetlength - Snippet length in characters
 *
 * Related: GitHub Issue #102 - Configuration reorganization
 */
class LunrSearchProvider extends BaseSearchProvider {
  constructor(engine) {
    super(engine);
    this.searchIndex = null;
    this.documents = {};
    this.config = null;
  }

  /**
   * Initialize the Lunr search provider
   * Loads configuration from ConfigurationManager
   * @returns {Promise<void>}
   */
  async initialize() {
    const configManager = this.engine.getManager('ConfigurationManager');
    if (!configManager) {
      throw new Error('LunrSearchProvider requires ConfigurationManager');
    }

    // Load provider-specific settings (ALL LOWERCASE)
    this.config = {
      indexDir: configManager.getProperty(
        'amdwiki.search.provider.lunr.indexdir',
        './search-index'
      ),
      stemming: configManager.getProperty(
        'amdwiki.search.provider.lunr.stemming',
        true
      ),
      boost: {
        title: configManager.getProperty(
          'amdwiki.search.provider.lunr.boost.title',
          10
        ),
        systemCategory: configManager.getProperty(
          'amdwiki.search.provider.lunr.boost.systemcategory',
          8
        ),
        userKeywords: configManager.getProperty(
          'amdwiki.search.provider.lunr.boost.userkeywords',
          6
        ),
        tags: configManager.getProperty(
          'amdwiki.search.provider.lunr.boost.tags',
          5
        ),
        keywords: configManager.getProperty(
          'amdwiki.search.provider.lunr.boost.keywords',
          4
        )
      },
      maxResults: configManager.getProperty(
        'amdwiki.search.provider.lunr.maxresults',
        50
      ),
      snippetLength: configManager.getProperty(
        'amdwiki.search.provider.lunr.snippetlength',
        200
      )
    };

    this.initialized = true;

    logger.info('[LunrSearchProvider] Initialized with stemming=' +
      this.config.stemming + ', maxResults=' + this.config.maxResults);
  }

  /**
   * Get provider information
   * @returns {Object} Provider metadata
   */
  getProviderInfo() {
    return {
      name: 'LunrSearchProvider',
      version: '1.0.0',
      description: 'Full-text search using Lunr.js',
      features: ['full-text', 'stemming', 'field-boosting', 'snippets', 'suggestions']
    };
  }

  /**
   * Build search index from all pages
   * @returns {Promise<void>}
   */
  async buildIndex() {
    const pageManager = this.engine.getManager('PageManager');
    if (!pageManager) {
      logger.warn('[LunrSearchProvider] PageManager not available for indexing');
      return;
    }

    try {
      const pageNames = await pageManager.getAllPages();
      const documents = {};

      // Load each page and prepare documents for indexing
      for (const pageName of pageNames) {
        const pageData = await pageManager.getPage(pageName);
        if (!pageData) {
          continue; // Skip if page can't be loaded
        }

        // Extract metadata fields
        const metadata = pageData.metadata || {};
        const systemCategory = metadata['system-category'] || '';
        const userKeywords = Array.isArray(metadata['user-keywords']) ?
          metadata['user-keywords'].join(' ') :
          (metadata['user-keywords'] || '');
        const tags = Array.isArray(metadata.tags) ?
          metadata.tags.join(' ') :
          (metadata.tags || '');
        const title = metadata.title || pageName;

        documents[pageName] = {
          id: pageName,
          title: title,
          content: pageData.content || '',
          body: pageData.content || '',
          systemCategory: systemCategory,
          userKeywords: userKeywords,
          tags: tags,
          keywords: `${userKeywords} ${tags}`,
          lastModified: metadata.lastModified || '',
          uuid: metadata.uuid || ''
        };
      }

      this.documents = documents;

      // Build Lunr index
      const boostConfig = this.config.boost;
      this.searchIndex = lunr(function () {
        this.ref('id');
        this.field('title', { boost: boostConfig.title });
        this.field('content');
        this.field('systemCategory', { boost: boostConfig.systemCategory });
        this.field('userKeywords', { boost: boostConfig.userKeywords });
        this.field('tags', { boost: boostConfig.tags });
        this.field('keywords', { boost: boostConfig.keywords });

        Object.values(documents).forEach(doc => {
          this.add(doc);
        });
      });

      logger.info(`[LunrSearchProvider] Index built with ${Object.keys(documents).length} documents`);
    } catch (err) {
      logger.error('[LunrSearchProvider] Failed to build search index:', err);
      throw err;
    }
  }

  /**
   * Search for pages matching the query
   * @param {string} query - Search query
   * @param {Object} options - Search options
   * @returns {Promise<Array<Object>>} Search results
   */
  async search(query, options = {}) {
    if (!this.searchIndex || !query) {
      return [];
    }

    try {
      const maxResults = options.maxResults || this.config.maxResults;
      const results = this.searchIndex.search(query);

      return results.slice(0, maxResults).map(result => {
        const doc = this.documents[result.ref];

        // Generate snippet
        const snippet = this.generateSnippet(doc.content, query);

        return {
          name: result.ref,
          title: doc.title,
          score: result.score,
          snippet: snippet,
          metadata: {
            wordCount: doc.content.split(/\s+/).length,
            tags: doc.tags,
            systemCategory: doc.systemCategory,
            userKeywords: doc.userKeywords,
            lastModified: doc.lastModified
          }
        };
      });
    } catch (err) {
      logger.error('[LunrSearchProvider] Search failed:', err);
      return [];
    }
  }

  /**
   * Advanced search with multiple criteria
   * @param {Object} options - Search criteria
   * @returns {Promise<Array<Object>>} Search results
   */
  async advancedSearch(options = {}) {
    const {
      query = '',
      categories = [],
      userKeywords = [],
      searchIn = ['all'],
      maxResults = this.config.maxResults
    } = options;

    // Normalize arrays
    const categoryList = Array.isArray(categories) ? categories : (categories ? [categories] : []);
    const keywordList = Array.isArray(userKeywords) ? userKeywords : (userKeywords ? [userKeywords] : []);
    const searchFields = Array.isArray(searchIn) ? searchIn : [searchIn];

    let results = [];

    if (query.trim()) {
      // Start with text search
      results = await this.search(query, { maxResults: maxResults * 2 });
    } else {
      // No text query, get all documents
      results = Object.keys(this.documents).map(name => ({
        name,
        title: this.documents[name].title || name,
        score: 1.0,
        snippet: this.documents[name].content.substring(0, this.config.snippetLength),
        metadata: {
          systemCategory: this.documents[name].systemCategory,
          userKeywords: this.documents[name].userKeywords,
          tags: this.documents[name].tags,
          lastModified: this.documents[name].lastModified
        }
      }));
    }

    // Filter by categories if specified
    if (categoryList.length > 0) {
      results = results.filter(result => {
        const docCategory = result.metadata.systemCategory;
        return docCategory && categoryList.includes(docCategory);
      });
    }

    // Filter by user keywords if specified
    if (keywordList.length > 0) {
      results = results.filter(result => {
        const docKeywords = result.metadata.userKeywords || '';
        return keywordList.some(keyword =>
          docKeywords.toLowerCase().includes(keyword.toLowerCase())
        );
      });
    }

    // Limit results
    return results.slice(0, maxResults);
  }

  /**
   * Generate a snippet with highlighted search terms
   * @param {string} content - Full content
   * @param {string} query - Search query
   * @returns {string} Content snippet
   */
  generateSnippet(content, query) {
    const maxLength = this.config.snippetLength;
    const searchTerms = query.toLowerCase().split(/\s+/);

    // Find best position for snippet
    let bestPosition = 0;
    let bestScore = 0;

    const words = content.split(/\s+/);
    for (let i = 0; i < words.length - 20; i++) {
      const window = words.slice(i, i + 20).join(' ').toLowerCase();
      let score = 0;

      searchTerms.forEach(term => {
        const matches = (window.match(new RegExp(term, 'gi')) || []).length;
        score += matches;
      });

      if (score > bestScore) {
        bestScore = score;
        bestPosition = i;
      }
    }

    // Extract snippet
    const snippetWords = words.slice(bestPosition, bestPosition + 30);
    let snippet = snippetWords.join(' ');

    if (snippet.length > maxLength) {
      snippet = snippet.substring(0, maxLength) + '...';
    }

    // Highlight search terms
    searchTerms.forEach(term => {
      const regex = new RegExp(`(${term})`, 'gi');
      snippet = snippet.replace(regex, '<mark>$1</mark>');
    });

    return snippet;
  }

  /**
   * Get search suggestions for autocomplete
   * @param {string} partial - Partial search term
   * @returns {Promise<Array<string>>} Suggested completions
   */
  async getSuggestions(partial) {
    if (!partial || partial.length < 2) {
      return [];
    }

    const suggestions = new Set();
    const partialLower = partial.toLowerCase();

    // Get page name suggestions
    Object.keys(this.documents).forEach(pageName => {
      if (pageName.toLowerCase().includes(partialLower)) {
        suggestions.add(pageName);
      }
    });

    // Get content-based suggestions (extract common words)
    Object.values(this.documents).forEach(doc => {
      const words = doc.content.toLowerCase().match(/\b\w{3,}\b/g) || [];
      words.forEach(word => {
        if (word.startsWith(partialLower) && suggestions.size < 10) {
          suggestions.add(word);
        }
      });
    });

    return Array.from(suggestions).slice(0, 10);
  }

  /**
   * Suggest similar pages based on content
   * @param {string} pageName - Source page name
   * @param {number} limit - Maximum suggestions
   * @returns {Promise<Array<Object>>} Suggested pages
   */
  async suggestSimilarPages(pageName, limit = 5) {
    if (!this.searchIndex || !this.documents[pageName]) {
      return [];
    }

    try {
      const sourceDoc = this.documents[pageName];

      // Extract key terms from source page
      const words = sourceDoc.content.toLowerCase()
        .replace(/[^\w\s]/g, ' ')
        .split(/\s+/)
        .filter(word => word.length > 3);

      // Get most frequent words as search terms
      const wordCounts = {};
      words.forEach(word => {
        wordCounts[word] = (wordCounts[word] || 0) + 1;
      });

      const keyTerms = Object.entries(wordCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(entry => entry[0]);

      // Search for similar pages
      const query = keyTerms.join(' ');
      const results = await this.search(query, { maxResults: limit + 1 });

      // Filter out the source page
      return results.filter(result => result.name !== pageName).slice(0, limit);
    } catch (err) {
      logger.error('[LunrSearchProvider] Similar page suggestion failed:', err);
      return [];
    }
  }

  /**
   * Add or update a page in the search index
   * @param {string} pageName - Page name
   * @param {Object} pageData - Page data
   * @returns {Promise<void>}
   */
  async updatePageInIndex(pageName, pageData) {
    // For now, rebuild the entire index
    // In a production system, you'd want incremental updates
    await this.buildIndex();
  }

  /**
   * Remove a page from the search index
   * @param {string} pageName - Page name to remove
   * @returns {Promise<void>}
   */
  async removePageFromIndex(pageName) {
    if (!this.documents[pageName]) {
      return;
    }

    delete this.documents[pageName];

    // Rebuild index without the removed document
    await this.buildIndex();
  }

  /**
   * Get all unique categories from indexed documents
   * @returns {Promise<Array<string>>} List of categories
   */
  async getAllCategories() {
    const categories = new Set();
    Object.values(this.documents).forEach(doc => {
      if (doc.systemCategory && doc.systemCategory.trim()) {
        categories.add(doc.systemCategory.trim());
      }
    });
    return Array.from(categories).sort();
  }

  /**
   * Get all unique user keywords from indexed documents
   * @returns {Promise<Array<string>>} List of user keywords
   */
  async getAllUserKeywords() {
    const keywords = new Set();
    Object.values(this.documents).forEach(doc => {
      if (doc.userKeywords && doc.userKeywords.trim()) {
        doc.userKeywords.split(/[,\s]+/).forEach(keyword => {
          const clean = keyword.trim();
          if (clean) {
            keywords.add(clean);
          }
        });
      }
    });
    return Array.from(keywords).sort();
  }

  /**
   * Search by category only
   * @param {string} category - Category to search for
   * @returns {Promise<Array<Object>>} Pages in category
   */
  async searchByCategory(category) {
    if (!category) return [];

    return Object.values(this.documents)
      .filter(doc => doc.systemCategory &&
        doc.systemCategory.toLowerCase().includes(category.toLowerCase()))
      .map(doc => ({
        name: doc.id,
        title: doc.title,
        score: 1,
        snippet: this.generateSnippet(doc.content, category),
        metadata: {
          wordCount: doc.content.split(/\s+/).length,
          systemCategory: doc.systemCategory,
          userKeywords: doc.userKeywords.split(' ').filter(k => k.trim()),
          tags: doc.tags.split(' ').filter(t => t.trim()),
          lastModified: doc.lastModified
        }
      }));
  }

  /**
   * Search by user keywords only
   * @param {string} keyword - Keyword to search for
   * @returns {Promise<Array<Object>>} Pages with keyword
   */
  async searchByUserKeywords(keyword) {
    if (!keyword) return [];

    return Object.values(this.documents)
      .filter(doc => doc.userKeywords.toLowerCase().includes(keyword.toLowerCase()))
      .map(doc => ({
        name: doc.id,
        title: doc.title,
        score: 1,
        snippet: this.generateSnippet(doc.content, keyword),
        metadata: {
          wordCount: doc.content.split(/\s+/).length,
          systemCategory: doc.systemCategory,
          userKeywords: doc.userKeywords.split(' ').filter(k => k.trim()),
          tags: doc.tags.split(' ').filter(t => t.trim()),
          lastModified: doc.lastModified
        }
      }));
  }

  /**
   * Get search statistics
   * @returns {Promise<Object>} Search statistics
   */
  async getStatistics() {
    return {
      totalDocuments: Object.keys(this.documents).length,
      indexSize: this.searchIndex ? JSON.stringify(this.searchIndex).length : 0,
      averageDocumentLength: Object.values(this.documents).reduce((sum, doc) =>
        sum + doc.content.length, 0) / Object.keys(this.documents).length || 0,
      totalCategories: (await this.getAllCategories()).length,
      totalUserKeywords: (await this.getAllUserKeywords()).length,
      providerName: 'LunrSearchProvider',
      providerVersion: this.getProviderInfo().version
    };
  }

  /**
   * Get the total number of indexed documents
   * @returns {Promise<number>} Number of documents
   */
  async getDocumentCount() {
    return Object.keys(this.documents).length;
  }

  /**
   * Check if the search provider is healthy/functional
   * @returns {Promise<boolean>} True if healthy
   */
  async isHealthy() {
    try {
      // Check if index exists and has documents
      return this.initialized && this.searchIndex !== null &&
        Object.keys(this.documents).length > 0;
    } catch (error) {
      logger.error('[LunrSearchProvider] Health check failed:', error);
      return false;
    }
  }

  /**
   * Close/cleanup the search provider
   * @returns {Promise<void>}
   */
  async close() {
    try {
      this.searchIndex = null;
      this.documents = {};
      this.initialized = false;
      logger.info('[LunrSearchProvider] Closed successfully');
    } catch (error) {
      logger.error('[LunrSearchProvider] Close error:', error);
    }
  }

  /**
   * Backup search index and configuration
   * @returns {Promise<Object>} Backup data
   */
  async backup() {
    const baseBackup = await super.backup();
    return {
      ...baseBackup,
      config: { ...this.config },
      documentCount: Object.keys(this.documents).length,
      documents: { ...this.documents },
      statistics: await this.getStatistics()
    };
  }

  /**
   * Restore search index from backup
   * @param {Object} backupData - Backup data
   * @returns {Promise<void>}
   */
  async restore(backupData) {
    if (backupData.documents) {
      this.documents = backupData.documents;
      await this.buildIndex();
      logger.info(`[LunrSearchProvider] Restored ${Object.keys(this.documents).length} documents from backup`);
    }
  }
}

module.exports = LunrSearchProvider;
