/**
 * BaseSearchProvider - Base class for all search providers
 *
 * Provides the interface that all search providers must implement.
 * Follows the provider pattern established in AttachmentManager, PageManager, CacheManager, and AuditManager.
 *
 * Search providers implement different search engines (Lunr.js, Elasticsearch, etc.)
 *
 * Related: GitHub Issue #102 - Configuration reorganization
 */

/**
 * Search result structure
 * @typedef {Object} SearchResult
 * @property {string} name - Page name/identifier
 * @property {string} title - Page title
 * @property {number} score - Relevance score
 * @property {string} snippet - Content snippet with highlights
 * @property {Object} metadata - Additional metadata
 */

/**
 * Search options structure
 * @typedef {Object} SearchOptions
 * @property {number} maxResults - Maximum number of results to return
 * @property {Array<string>} searchIn - Fields to search in
 * @property {Array<string>} categories - Filter by categories
 * @property {Array<string>} userKeywords - Filter by user keywords
 */

class BaseSearchProvider {
  constructor(engine) {
    this.engine = engine;
    this.initialized = false;
  }

  /**
   * Initialize the search provider
   * Implementations should load configuration from ConfigurationManager
   * @returns {Promise<void>}
   */
  async initialize() {
    throw new Error('BaseSearchProvider.initialize() must be implemented by subclass');
  }

  /**
   * Get provider information
   * @returns {Object} Provider metadata
   */
  getProviderInfo() {
    return {
      name: 'BaseSearchProvider',
      version: '1.0.0',
      description: 'Base search provider interface',
      features: []
    };
  }

  /**
   * Build or rebuild the search index from all pages
   * @returns {Promise<void>}
   */
  async buildIndex() {
    throw new Error('BaseSearchProvider.buildIndex() must be implemented by subclass');
  }

  /**
   * Search for pages matching the query
   * @param {string} query - Search query
   * @param {SearchOptions} options - Search options
   * @returns {Promise<Array<SearchResult>>} Search results
   */
  async search(query, options = {}) {
    throw new Error('BaseSearchProvider.search() must be implemented by subclass');
  }

  /**
   * Advanced search with multiple criteria
   * @param {Object} criteria - Search criteria
   * @returns {Promise<Array<SearchResult>>} Search results
   */
  async advancedSearch(criteria = {}) {
    throw new Error('BaseSearchProvider.advancedSearch() must be implemented by subclass');
  }

  /**
   * Get search suggestions for autocomplete
   * @param {string} partial - Partial search term
   * @returns {Promise<Array<string>>} Suggested completions
   */
  async getSuggestions(partial) {
    throw new Error('BaseSearchProvider.getSuggestions() must be implemented by subclass');
  }

  /**
   * Suggest similar pages based on content
   * @param {string} pageName - Source page name
   * @param {number} limit - Maximum suggestions
   * @returns {Promise<Array<SearchResult>>} Suggested pages
   */
  async suggestSimilarPages(pageName, limit = 5) {
    throw new Error('BaseSearchProvider.suggestSimilarPages() must be implemented by subclass');
  }

  /**
   * Add or update a page in the search index
   * @param {string} pageName - Page name
   * @param {Object} pageData - Page data including content and metadata
   * @returns {Promise<void>}
   */
  async updatePageInIndex(pageName, pageData) {
    throw new Error('BaseSearchProvider.updatePageInIndex() must be implemented by subclass');
  }

  /**
   * Remove a page from the search index
   * @param {string} pageName - Page name to remove
   * @returns {Promise<void>}
   */
  async removePageFromIndex(pageName) {
    throw new Error('BaseSearchProvider.removePageFromIndex() must be implemented by subclass');
  }

  /**
   * Get all unique categories from indexed documents
   * @returns {Promise<Array<string>>} List of categories
   */
  async getAllCategories() {
    throw new Error('BaseSearchProvider.getAllCategories() must be implemented by subclass');
  }

  /**
   * Get all unique user keywords from indexed documents
   * @returns {Promise<Array<string>>} List of user keywords
   */
  async getAllUserKeywords() {
    throw new Error('BaseSearchProvider.getAllUserKeywords() must be implemented by subclass');
  }

  /**
   * Search by category only
   * @param {string} category - Category to search for
   * @returns {Promise<Array<SearchResult>>} Pages in category
   */
  async searchByCategory(category) {
    throw new Error('BaseSearchProvider.searchByCategory() must be implemented by subclass');
  }

  /**
   * Search by user keywords only
   * @param {string} keyword - Keyword to search for
   * @returns {Promise<Array<SearchResult>>} Pages with keyword
   */
  async searchByUserKeywords(keyword) {
    throw new Error('BaseSearchProvider.searchByUserKeywords() must be implemented by subclass');
  }

  /**
   * Get search statistics
   * @returns {Promise<Object>} Search statistics
   */
  async getStatistics() {
    throw new Error('BaseSearchProvider.getStatistics() must be implemented by subclass');
  }

  /**
   * Get the total number of indexed documents
   * @returns {Promise<number>} Number of documents
   */
  async getDocumentCount() {
    throw new Error('BaseSearchProvider.getDocumentCount() must be implemented by subclass');
  }

  /**
   * Check if the search provider is healthy/functional
   * @returns {Promise<boolean>} True if healthy
   */
  async isHealthy() {
    throw new Error('BaseSearchProvider.isHealthy() must be implemented by subclass');
  }

  /**
   * Close/cleanup the search provider
   * @returns {Promise<void>}
   */
  async close() {
    throw new Error('BaseSearchProvider.close() must be implemented by subclass');
  }

  /**
   * Backup search index and configuration (optional)
   * @returns {Promise<Object>} Backup data
   */
  async backup() {
    return {
      provider: this.constructor.name,
      initialized: this.initialized,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Restore search index from backup (optional)
   * @param {Object} backupData - Backup data
   * @returns {Promise<void>}
   */
  async restore(backupData) {
    // Default implementation does nothing
    // Subclasses can override if they support restore
  }
}

module.exports = BaseSearchProvider;
