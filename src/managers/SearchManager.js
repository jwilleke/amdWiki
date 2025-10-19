const BaseManager = require('./BaseManager');
const logger = require('../utils/logger');

/**
 * SearchManager - Handles search indexing and querying
 *
 * Similar to JSPWiki's SearchManager, this manager provides full-text search
 * capabilities through a pluggable provider system. Supports different search
 * backends (Lunr.js, Elasticsearch, etc.) via provider abstraction.
 *
 * Key features:
 * - Pluggable search provider system
 * - Full-text indexing of page content and metadata
 * - Configurable search ranking and filtering
 * - Automatic index rebuilding
 * - Provider abstraction for different search engines
 *
 * Follows the provider pattern established in AttachmentManager, PageManager,
 * CacheManager, and AuditManager for pluggable search backends.
 *
 * Configuration (all lowercase):
 * - amdwiki.search.enabled - Enable/disable search
 * - amdwiki.search.provider.default - Default provider name
 * - amdwiki.search.provider - Active provider name
 * - amdwiki.search.provider.lunr.* - LunrSearchProvider settings
 *
 * @class SearchManager
 * @extends BaseManager
 *
 * @property {BaseSearchProvider|null} provider - The active search provider
 * @property {string|null} providerClass - The class name of the loaded provider
 *
 * @see {@link BaseManager} for base functionality
 * @see {@link LunrSearchProvider} for default provider implementation
 *
 * @example
 * const searchManager = engine.getManager('SearchManager');
 * const results = await searchManager.search('hello world');
 * console.log(`Found ${results.length} pages`);
 *
 * Related: GitHub Issue #102 - Configuration reorganization
 */
class SearchManager extends BaseManager {
  /**
   * Creates a new SearchManager instance
   *
   * @constructor
   * @param {WikiEngine} engine - The wiki engine instance
   */
  constructor(engine) {
    super(engine);
    this.provider = null;
    this.providerClass = null;
  }

  /**
   * Initialize the SearchManager and load the configured provider
   *
   * Loads the search provider, builds the initial search index, and prepares
   * the search system for queries.
   *
   * @async
   * @param {Object} [config={}] - Configuration object (unused, reads from ConfigurationManager)
   * @returns {Promise<void>}
   * @throws {Error} If ConfigurationManager is not available or provider fails to load
   *
   * @example
   * await searchManager.initialize();
   * console.log('Search system ready');
   */
  async initialize(config = {}) {
    await super.initialize(config);

    const configManager = this.engine.getManager('ConfigurationManager');
    if (!configManager) {
      throw new Error('SearchManager requires ConfigurationManager');
    }

    // Check if search is enabled (ALL LOWERCASE)
    const searchEnabled = configManager.getProperty('amdwiki.search.enabled', true);
    if (!searchEnabled) {
      logger.info('🔍 SearchManager: Search disabled by configuration');
      // Could load a NullSearchProvider when disabled
      return;
    }

    // Load provider with fallback (ALL LOWERCASE)
    const defaultProvider = configManager.getProperty(
      'amdwiki.search.provider.default',
      'lunrsearchprovider'
    );
    const providerName = configManager.getProperty(
      'amdwiki.search.provider',
      defaultProvider
    );

    // Normalize provider name to PascalCase for class loading
    // lunrsearchprovider -> LunrSearchProvider
    this.providerClass = this.#normalizeProviderName(providerName);

    logger.info(`🔍 Loading search provider: ${providerName} (${this.providerClass})`);

    // Load and initialize provider
    await this.#loadProvider();

    // Build initial search index
    await this.buildSearchIndex();

    logger.info(`🔍 SearchManager initialized with ${this.providerClass}`);

    const providerInfo = this.provider.getProviderInfo();
    if (providerInfo.features && providerInfo.features.length > 0) {
      logger.info(`🔍 Provider features: ${providerInfo.features.join(', ')}`);
    }
  }

  /**
   * Normalize provider name to PascalCase class name
   * @param {string} providerName - Provider name from config (e.g., 'lunrsearchprovider')
   * @returns {string} PascalCase class name (e.g., 'LunrSearchProvider')
   * @private
   */
  #normalizeProviderName(providerName) {
    // Handle already PascalCase names
    if (/^[A-Z]/.test(providerName)) {
      return providerName;
    }

    // Convert lowercase to PascalCase
    // lunrsearchprovider -> LunrSearchProvider
    return providerName
      .split(/[-_]/)
      .map(part => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
      .join('');
  }

  /**
   * Load the search provider dynamically
   * @private
   * @returns {Promise<void>}
   */
  async #loadProvider() {
    try {
      // Try to load provider class
      const ProviderClass = require(`../providers/${this.providerClass}`);
      this.provider = new ProviderClass(this.engine);
      await this.provider.initialize();

      // Test provider health
      const isHealthy = await this.provider.isHealthy();
      if (!isHealthy) {
        logger.warn(`Search provider ${this.providerClass} health check failed after initialization`);
        // Note: Unlike CacheManager, we don't fall back to NullSearchProvider
        // We'll let the provider try to recover when buildIndex is called
      }
    } catch (err) {
      logger.error(`Failed to load search provider ${this.providerClass}:`, err);

      // Try fallback to LunrSearchProvider
      if (this.providerClass !== 'LunrSearchProvider') {
        logger.info('Falling back to LunrSearchProvider');
        const ProviderClass = require('../providers/LunrSearchProvider');
        this.provider = new ProviderClass(this.engine);
        await this.provider.initialize();
      } else {
        throw new Error(`Failed to load search provider: ${err.message}`);
      }
    }
  }

  /**
   * Build search index from all pages
   * @returns {Promise<void>}
   */
  async buildSearchIndex() {
    if (!this.provider) {
      logger.warn('[SearchManager] No provider available for building index');
      return;
    }

    try {
      await this.provider.buildIndex();
      const docCount = await this.provider.getDocumentCount();
      logger.info(`🔍 Search index built with ${docCount} documents`);
    } catch (err) {
      logger.error('[SearchManager] Failed to build search index:', err);
      throw err;
    }
  }

  /**
   * Search for pages using WikiContext
   *
   * Performs a search using WikiContext as the single source of truth for user information.
   * Logs search queries with user context for analytics and audit purposes.
   *
   * @async
   * @param {WikiContext} wikiContext - The wiki context containing user info
   * @param {string} query - Search query
   * @param {Object} [options={}] - Additional search options
   * @returns {Promise<Array<Object>>} Search results
   *
   * @example
   * const results = await searchManager.searchWithContext(wikiContext, 'hello world');
   * console.log(`Found ${results.length} pages`);
   */
  async searchWithContext(wikiContext, query, options = {}) {
    if (!wikiContext) {
      throw new Error('SearchManager.searchWithContext requires a WikiContext');
    }

    if (!this.provider) {
      logger.warn('[SearchManager] No provider available for search');
      return [];
    }

    // Log search query with user context for analytics
    const username = wikiContext.userContext?.username || 'anonymous';
    logger.info(`[SearchManager] Search query="${query}" user=${username} options=${JSON.stringify(options)}`);

    try {
      const results = await this.provider.search(query, options);
      logger.info(`[SearchManager] Search completed query="${query}" user=${username} results=${results.length}`);
      return results;
    } catch (err) {
      logger.error(`[SearchManager] Search failed query="${query}" user=${username}:`, err);
      return [];
    }
  }

  /**
   * Advanced search with WikiContext
   *
   * Performs advanced search with multiple criteria using WikiContext as the single source
   * of truth. Logs detailed search parameters with user context for analytics.
   *
   * @async
   * @param {WikiContext} wikiContext - The wiki context containing user info
   * @param {Object} [options={}] - Search options
   * @param {string} [options.query] - Text query
   * @param {Array<string>} [options.categories] - Categories to filter
   * @param {Array<string>} [options.userKeywords] - Keywords to filter
   * @param {Array<string>} [options.searchIn] - Fields to search in
   * @param {number} [options.maxResults] - Maximum results to return
   * @returns {Promise<Array>} Search results
   *
   * @example
   * const results = await searchManager.advancedSearchWithContext(wikiContext, {
   *   query: 'tutorial',
   *   categories: ['Documentation'],
   *   maxResults: 20
   * });
   */
  async advancedSearchWithContext(wikiContext, options = {}) {
    if (!wikiContext) {
      throw new Error('SearchManager.advancedSearchWithContext requires a WikiContext');
    }

    if (!this.provider) {
      logger.warn('[SearchManager] No provider available for advanced search');
      return [];
    }

    // Log advanced search with user context for analytics
    const username = wikiContext.userContext?.username || 'anonymous';
    const searchDetails = {
      query: options.query || '',
      categories: options.categories?.length || 0,
      keywords: options.userKeywords?.length || 0,
      searchIn: options.searchIn?.join(',') || 'all'
    };
    logger.info(`[SearchManager] Advanced search user=${username} details=${JSON.stringify(searchDetails)}`);

    try {
      const results = await this.provider.advancedSearch(options);
      logger.info(`[SearchManager] Advanced search completed user=${username} results=${results.length}`);
      return results;
    } catch (err) {
      logger.error(`[SearchManager] Advanced search failed user=${username}:`, err);
      return [];
    }
  }

  /**
   * Search for pages matching the query
   * @param {string} query - Search query
   * @param {Object} options - Search options
   * @returns {Promise<Array<Object>>} Search results
   * @deprecated Use searchWithContext() with WikiContext instead
   */
  async search(query, options = {}) {
    if (!this.provider) {
      logger.warn('[SearchManager] No provider available for search');
      return [];
    }

    try {
      return await this.provider.search(query, options);
    } catch (err) {
      logger.error('[SearchManager] Search failed:', err);
      return [];
    }
  }

  /**
   * Advanced search with multiple criteria support
   * @param {Object} options - Search options
   * @returns {Promise<Array>} Search results
   * @deprecated Use advancedSearchWithContext() with WikiContext instead
   */
  async advancedSearch(options = {}) {
    if (!this.provider) {
      logger.warn('[SearchManager] No provider available for advanced search');
      return [];
    }

    try {
      return await this.provider.advancedSearch(options);
    } catch (err) {
      logger.error('[SearchManager] Advanced search failed:', err);
      return [];
    }
  }

  /**
   * Suggest similar pages based on content
   * @param {string} pageName - Source page name
   * @param {number} limit - Maximum suggestions
   * @returns {Promise<Array<Object>>} Suggested pages
   */
  async suggestSimilarPages(pageName, limit = 5) {
    if (!this.provider) {
      return [];
    }

    try {
      return await this.provider.suggestSimilarPages(pageName, limit);
    } catch (err) {
      logger.error('[SearchManager] Similar page suggestion failed:', err);
      return [];
    }
  }

  /**
   * Get search suggestions for autocomplete
   * @param {string} partial - Partial search term
   * @returns {Promise<Array<string>>} Suggested completions
   */
  async getSuggestions(partial) {
    if (!this.provider) {
      return [];
    }

    try {
      return await this.provider.getSuggestions(partial);
    } catch (err) {
      logger.error('[SearchManager] Get suggestions failed:', err);
      return [];
    }
  }

  /**
   * Rebuild search index (called after page changes)
   * @returns {Promise<void>}
   */
  async rebuildIndex() {
    await this.buildSearchIndex();
  }

  /**
   * Add/update a page in the search index
   * @param {string} pageName - Page name
   * @param {Object} pageData - Page data
   * @returns {Promise<void>}
   */
  async updatePageInIndex(pageName, pageData) {
    if (!this.provider) {
      return;
    }

    try {
      await this.provider.updatePageInIndex(pageName, pageData);
    } catch (err) {
      logger.error('[SearchManager] Update page in index failed:', err);
    }
  }

  /**
   * Remove a page from the search index
   * @param {string} pageName - Page name to remove
   * @returns {Promise<void>}
   */
  async removePageFromIndex(pageName) {
    if (!this.provider) {
      return;
    }

    try {
      await this.provider.removePageFromIndex(pageName);
    } catch (err) {
      logger.error('[SearchManager] Remove page from index failed:', err);
    }
  }

  /**
   * Search by multiple categories
   * @param {Array} categories - Array of category names to search
   * @returns {Promise<Array>} Search results
   */
  async searchByCategories(categories) {
    if (!categories || categories.length === 0) return [];

    const results = [];
    const seenPages = new Set();

    for (const category of categories) {
      const categoryResults = await this.searchByCategory(category);
      categoryResults.forEach(result => {
        if (!seenPages.has(result.name)) {
          seenPages.add(result.name);
          results.push(result);
        }
      });
    }

    // Sort by score descending
    return results.sort((a, b) => b.score - a.score);
  }

  /**
   * Search by multiple user keywords
   * @param {Array} keywords - Array of user keywords to search
   * @returns {Promise<Array>} Search results
   */
  async searchByUserKeywordsList(keywords) {
    if (!keywords || keywords.length === 0) return [];

    const results = [];
    const seenPages = new Set();

    for (const keyword of keywords) {
      const keywordResults = await this.searchByUserKeywords(keyword);
      keywordResults.forEach(result => {
        if (!seenPages.has(result.name)) {
          seenPages.add(result.name);
          results.push(result);
        }
      });
    }

    // Sort by score descending
    return results.sort((a, b) => b.score - a.score);
  }

  /**
   * Get all unique categories from indexed documents
   * @returns {Promise<Array<string>>} List of categories
   */
  async getAllCategories() {
    if (!this.provider) {
      return [];
    }

    try {
      return await this.provider.getAllCategories();
    } catch (err) {
      logger.error('[SearchManager] Get all categories failed:', err);
      return [];
    }
  }

  /**
   * Get all unique user keywords from indexed documents
   * @returns {Promise<Array<string>>} List of user keywords
   */
  async getAllUserKeywords() {
    if (!this.provider) {
      return [];
    }

    try {
      return await this.provider.getAllUserKeywords();
    } catch (err) {
      logger.error('[SearchManager] Get all user keywords failed:', err);
      return [];
    }
  }

  /**
   * Search by category only
   * @param {string} category - Category to search for
   * @returns {Promise<Array<Object>>} Pages in category
   */
  async searchByCategory(category) {
    if (!this.provider) {
      return [];
    }

    try {
      return await this.provider.searchByCategory(category);
    } catch (err) {
      logger.error('[SearchManager] Search by category failed:', err);
      return [];
    }
  }

  /**
   * Search by user keywords only
   * @param {string} keyword - Keyword to search for
   * @returns {Promise<Array<Object>>} Pages with keyword
   */
  async searchByUserKeywords(keyword) {
    if (!this.provider) {
      return [];
    }

    try {
      return await this.provider.searchByUserKeywords(keyword);
    } catch (err) {
      logger.error('[SearchManager] Search by user keywords failed:', err);
      return [];
    }
  }

  /**
   * Get search statistics
   * @returns {Promise<Object>} Search statistics
   */
  async getStatistics() {
    if (!this.provider) {
      return {
        totalDocuments: 0,
        indexSize: 0,
        averageDocumentLength: 0,
        totalCategories: 0,
        totalUserKeywords: 0
      };
    }

    try {
      return await this.provider.getStatistics();
    } catch (err) {
      logger.error('[SearchManager] Get statistics failed:', err);
      return {
        totalDocuments: 0,
        indexSize: 0,
        averageDocumentLength: 0,
        totalCategories: 0,
        totalUserKeywords: 0
      };
    }
  }

  /**
   * Get the total number of indexed documents
   * @returns {Promise<number>} Number of documents
   */
  async getDocumentCount() {
    if (!this.provider) {
      return 0;
    }

    try {
      return await this.provider.getDocumentCount();
    } catch (err) {
      logger.error('[SearchManager] Get document count failed:', err);
      return 0;
    }
  }

  /**
   * Search by keywords
   * @param {Array} keywords - Keywords to search for
   * @returns {Promise<Array>} Search results
   */
  async searchByKeywords(keywords) {
    if (!keywords || !Array.isArray(keywords)) return [];

    const query = keywords.join(' ');
    return await this.search(query);
  }

  /**
   * Add page to search index
   * @param {Object} page - Page object to add
   * @returns {Promise<void>}
   */
  async addToIndex(page) {
    if (!page || !page.name) return;

    try {
      await this.updatePageInIndex(page.name, page);
    } catch (err) {
      logger.error('[SearchManager] Add to index failed:', err);
    }
  }

  /**
   * Remove page from search index
   * @param {string} pageName - Name of page to remove
   * @returns {Promise<void>}
   */
  async removeFromIndex(pageName) {
    if (!pageName) return;

    try {
      await this.removePageFromIndex(pageName);
    } catch (err) {
      logger.error('[SearchManager] Remove from index failed:', err);
    }
  }

  /**
   * Perform multi-criteria search
   * @param {Object} criteria - Search criteria object
   * @returns {Promise<Array>} Search results
   */
  async multiSearch(criteria) {
    if (!criteria) return [];

    try {
      return await this.advancedSearch(criteria);
    } catch (err) {
      logger.error('[SearchManager] Multi-search failed:', err);
      return [];
    }
  }

  /**
   * Backup search configuration and state
   * @returns {Promise<Object>} Backup data
   */
  async backup() {
    if (!this.provider) {
      return {
        providerClass: this.providerClass,
        timestamp: new Date().toISOString()
      };
    }

    try {
      return await this.provider.backup();
    } catch (err) {
      logger.error('[SearchManager] Backup failed:', err);
      return {
        providerClass: this.providerClass,
        timestamp: new Date().toISOString(),
        error: err.message
      };
    }
  }

  /**
   * Restore search from backup
   * @param {Object} backupData - Backup data
   * @returns {Promise<void>}
   */
  async restore(backupData) {
    if (!this.provider) {
      logger.warn('[SearchManager] No provider available for restore');
      return;
    }

    try {
      await this.provider.restore(backupData);
      logger.info('[SearchManager] Restored from backup');
    } catch (err) {
      logger.error('[SearchManager] Restore failed:', err);
    }
  }

  /**
   * Shutdown search manager and close provider
   * @returns {Promise<void>}
   */
  async shutdown() {
    if (this.provider) {
      try {
        await this.provider.close();
        logger.info('[SearchManager] Shut down successfully');
      } catch (err) {
        logger.error('[SearchManager] Shutdown error:', err);
      }
    }
  }
}

module.exports = SearchManager;
