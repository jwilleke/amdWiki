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

import BaseSearchProvider, { SearchResult, SearchOptions, SearchCriteria, SearchStatistics, BackupData, WikiEngine } from './BaseSearchProvider';
import { WikiPage } from '../types';
import lunr from 'lunr';
import logger from '../utils/logger';

/**
 * Lunr search index type (using any as lunr types are not available)
 */
type LunrIndex = any;

/**
 * Lunr search result
 */
interface LunrSearchResult {
  ref: string;
  score: number;
  matchData?: any;
}

/**
 * Document structure for indexing
 */
interface LunrDocument {
  id: string;
  title: string;
  content: string;
  body: string;
  systemCategory: string;
  userKeywords: string;
  tags: string;
  keywords: string;
  lastModified: string;
  uuid: string;
}

/**
 * Provider configuration
 */
interface LunrConfig {
  indexDir: string;
  stemming: boolean;
  boost: {
    title: number;
    systemCategory: number;
    userKeywords: number;
    tags: number;
    keywords: number;
  };
  maxResults: number;
  snippetLength: number;
}

/**
 * Configuration Manager interface
 */
interface ConfigurationManager {
  getProperty<T>(key: string, defaultValue: T): T;
}

/**
 * Page Manager interface
 */
interface PageManager {
  getAllPages(): Promise<string[]>;
  getPage(pageName: string): Promise<WikiPage | null>;
}

/**
 * LunrSearchProvider - Full-text search using Lunr.js
 */
class LunrSearchProvider extends BaseSearchProvider {
  private searchIndex: LunrIndex | null;
  private documents: Record<string, LunrDocument>;
  private config: LunrConfig | null;

  constructor(engine: WikiEngine) {
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
  async initialize(): Promise<void> {
    const configManager = this.engine.getManager('ConfigurationManager') as ConfigurationManager | null;
    if (!configManager) {
      throw new Error('LunrSearchProvider requires ConfigurationManager');
    }

    // Load provider-specific settings (ALL LOWERCASE)
    this.config = {
      indexDir: configManager.getProperty<string>(
        'amdwiki.search.provider.lunr.indexdir',
        './search-index'
      ),
      stemming: configManager.getProperty<boolean>(
        'amdwiki.search.provider.lunr.stemming',
        true
      ),
      boost: {
        title: configManager.getProperty<number>(
          'amdwiki.search.provider.lunr.boost.title',
          10
        ),
        systemCategory: configManager.getProperty<number>(
          'amdwiki.search.provider.lunr.boost.systemcategory',
          8
        ),
        userKeywords: configManager.getProperty<number>(
          'amdwiki.search.provider.lunr.boost.userkeywords',
          6
        ),
        tags: configManager.getProperty<number>(
          'amdwiki.search.provider.lunr.boost.tags',
          5
        ),
        keywords: configManager.getProperty<number>(
          'amdwiki.search.provider.lunr.boost.keywords',
          4
        )
      },
      maxResults: configManager.getProperty<number>(
        'amdwiki.search.provider.lunr.maxresults',
        50
      ),
      snippetLength: configManager.getProperty<number>(
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
  async buildIndex(): Promise<void> {
    const pageManager = this.engine.getManager('PageManager') as PageManager | null;
    if (!pageManager) {
      logger.warn('[LunrSearchProvider] PageManager not available for indexing');
      return;
    }

    try {
      const pageNames = await pageManager.getAllPages();
      const documents: Record<string, LunrDocument> = {};

      // Load each page and prepare documents for indexing
      for (const pageName of pageNames) {
        const pageData = await pageManager.getPage(pageName);
        if (!pageData) {
          continue; // Skip if page can't be loaded
        }

        // Extract metadata fields
        const metadata = pageData.metadata;
        const systemCategory = metadata['system-category'] || '';
        const userKeywordsArray = metadata['user-keywords'];
        const userKeywords = Array.isArray(userKeywordsArray) ?
          userKeywordsArray.join(' ') :
          (userKeywordsArray || '');
        const tagsValue = (metadata as any).tags;
        const tags = Array.isArray(tagsValue) ?
          tagsValue.join(' ') :
          (tagsValue || '');
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
      this.searchIndex = lunr(function (this: any) {
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
   * @param {SearchOptions} options - Search options
   * @returns {Promise<SearchResult[]>} Search results
   */
  async search(query: string, options: SearchOptions = {}): Promise<SearchResult[]> {
    if (!this.searchIndex || !query) {
      return [];
    }

    try {
      const maxResults = options.maxResults || this.config.maxResults;
      const results: LunrSearchResult[] = this.searchIndex.search(query);

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
   * @param {SearchCriteria} options - Search criteria
   * @returns {Promise<SearchResult[]>} Search results
   */
  async advancedSearch(options: SearchCriteria = {}): Promise<SearchResult[]> {
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

    let results: SearchResult[] = [];

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

    // Filter by categories if specified (case-insensitive)
    if (categoryList.length > 0) {
      const beforeCount = results.length;
      results = results.filter(result => {
        const docCategory = result.metadata.systemCategory;
        if (!docCategory) {
          logger.debug(`[LunrSearchProvider] No category for: ${result.name}`);
          return false;
        }

        // Case-insensitive comparison
        const docCategoryLower = docCategory.toLowerCase();
        const matches = categoryList.some(cat => cat.toLowerCase() === docCategoryLower);

        if (!matches) {
          logger.debug(`[LunrSearchProvider] Filtered out ${result.name}: category "${docCategory}" not in [${categoryList.join(', ')}]`);
        }

        return matches;
      });
      logger.info(`[LunrSearchProvider] Category filter: ${beforeCount} -> ${results.length} results (filter: [${categoryList.join(', ')}])`);
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
  private generateSnippet(content: string, query: string): string {
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
   * @returns {Promise<string[]>} Suggested completions
   */
  async getSuggestions(partial: string): Promise<string[]> {
    if (!partial || partial.length < 2) {
      return [];
    }

    const suggestions = new Set<string>();
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
   * @returns {Promise<SearchResult[]>} Suggested pages
   */
  async suggestSimilarPages(pageName: string, limit: number = 5): Promise<SearchResult[]> {
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
      const wordCounts: Record<string, number> = {};
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
   * @param {string} _pageName - Page name
   * @param {Record<string, any>} _pageData - Page data
   * @returns {Promise<void>}
   */
  async updatePageInIndex(_pageName: string, _pageData: Record<string, any>): Promise<void> {
    // For now, rebuild the entire index
    // In a production system, you'd want incremental updates
    await this.buildIndex();
  }

  /**
   * Remove a page from the search index
   * @param {string} pageName - Page name to remove
   * @returns {Promise<void>}
   */
  async removePageFromIndex(pageName: string): Promise<void> {
    if (!this.documents[pageName]) {
      return;
    }

    delete this.documents[pageName];

    // Rebuild index without the removed document
    await this.buildIndex();
  }

  /**
   * Get all unique categories from indexed documents
   * @returns {Promise<string[]>} List of categories
   */
  async getAllCategories(): Promise<string[]> {
    const categories = new Set<string>();
    Object.values(this.documents).forEach(doc => {
      if (doc.systemCategory && doc.systemCategory.trim()) {
        categories.add(doc.systemCategory.trim());
      }
    });
    return Array.from(categories).sort();
  }

  /**
   * Get all unique user keywords from indexed documents
   * @returns {Promise<string[]>} List of user keywords
   */
  async getAllUserKeywords(): Promise<string[]> {
    const keywords = new Set<string>();
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
   * @returns {Promise<SearchResult[]>} Pages in category
   */
  async searchByCategory(category: string): Promise<SearchResult[]> {
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
   * @returns {Promise<SearchResult[]>} Pages with keyword
   */
  async searchByUserKeywords(keyword: string): Promise<SearchResult[]> {
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
   * @returns {Promise<SearchStatistics>} Search statistics
   */
  async getStatistics(): Promise<SearchStatistics> {
    return {
      totalDocuments: Object.keys(this.documents).length,
      indexSize: this.searchIndex ? JSON.stringify(this.searchIndex).length : 0,
      averageDocumentLength: Object.values(this.documents).reduce((sum, doc) =>
        sum + doc.content.length, 0) / Object.keys(this.documents).length || 0,
      totalCategories: (await this.getAllCategories()).length,
      totalUserKeywords: (await this.getAllUserKeywords()).length,
      providerName: 'LunrSearchProvider',
      providerVersion: this.getProviderInfo().version,
      documentCount: Object.keys(this.documents).length
    };
  }

  /**
   * Get the total number of indexed documents
   * @returns {Promise<number>} Number of documents
   */
  async getDocumentCount(): Promise<number> {
    return Object.keys(this.documents).length;
  }

  /**
   * Check if the search provider is healthy/functional
   * @returns {Promise<boolean>} True if healthy
   */
  async isHealthy(): Promise<boolean> {
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
  async close(): Promise<void> {
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
   * @returns {Promise<BackupData>} Backup data
   */
  async backup(): Promise<BackupData> {
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
   * @param {BackupData} backupData - Backup data
   * @returns {Promise<void>}
   */
  async restore(backupData: BackupData): Promise<void> {
    if (backupData.documents) {
      this.documents = backupData.documents;
      await this.buildIndex();
      logger.info(`[LunrSearchProvider] Restored ${Object.keys(this.documents).length} documents from backup`);
    }
  }
}

export default LunrSearchProvider;
