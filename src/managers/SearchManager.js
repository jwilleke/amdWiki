const BaseManager = require('./BaseManager');
const lunr = require('lunr');

/**
 * SearchManager - Handles search indexing and querying
 * Similar to JSPWiki's SearchManager
 */
class SearchManager extends BaseManager {
  constructor(engine) {
    super(engine);
    this.searchIndex = null;
    this.documents = {};
  }

  async initialize(config = {}) {
    await super.initialize(config);
    
    // Build initial search index
    await this.buildSearchIndex();
    
    console.log('✅ SearchManager initialized');
  }

  /**
   * Build search index from all pages
   */
  async buildSearchIndex() {
    const pageManager = this.engine.getManager('PageManager');
    if (!pageManager) {
      console.warn('PageManager not available for search indexing');
      return;
    }

    try {
      const pages = await pageManager.getAllPages();
      const documents = {};
      
      // Prepare documents for indexing
      pages.forEach(page => {
        documents[page.name] = {
          id: page.name,
          title: page.name,
          content: page.content,
          body: page.content,
          tags: page.metadata?.tags || []
        };
      });

      this.documents = documents;

      // Build Lunr index
      this.searchIndex = lunr(function () {
        this.ref('id');
        this.field('title', { boost: 10 });
        this.field('content');
        this.field('tags', { boost: 5 });

        Object.values(documents).forEach(doc => {
          this.add(doc);
        });
      });

      console.log(`🔍 Search index built with ${Object.keys(documents).length} documents`);
    } catch (err) {
      console.error('Failed to build search index:', err);
    }
  }

  /**
   * Search for pages matching the query
   * @param {string} query - Search query
   * @param {Object} options - Search options
   * @returns {Array<Object>} Search results
   */
  search(query, options = {}) {
    if (!this.searchIndex || !query) {
      return [];
    }

    try {
      const maxResults = options.maxResults || 20;
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
            tags: doc.tags
          }
        };
      });
    } catch (err) {
      console.error('Search failed:', err);
      return [];
    }
  }

  /**
   * Generate a snippet with highlighted search terms
   * @param {string} content - Full content
   * @param {string} query - Search query
   * @returns {string} Content snippet
   */
  generateSnippet(content, query) {
    const maxLength = 200;
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
   * Suggest similar pages based on content
   * @param {string} pageName - Source page name
   * @param {number} limit - Maximum suggestions
   * @returns {Array<Object>} Suggested pages
   */
  suggestSimilarPages(pageName, limit = 5) {
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
      const results = this.search(query, { maxResults: limit + 1 });
      
      // Filter out the source page
      return results.filter(result => result.name !== pageName).slice(0, limit);
    } catch (err) {
      console.error('Similar page suggestion failed:', err);
      return [];
    }
  }

  /**
   * Get search suggestions for autocomplete
   * @param {string} partial - Partial search term
   * @returns {Array<string>} Suggested completions
   */
  getSuggestions(partial) {
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
   * Rebuild search index (called after page changes)
   */
  async rebuildIndex() {
    await this.buildSearchIndex();
  }

  /**
   * Add/update a page in the search index
   * @param {string} pageName - Page name
   * @param {Object} pageData - Page data
   */
  updatePageInIndex(pageName, pageData) {
    // For now, just rebuild the entire index
    // In a production system, you'd want incremental updates
    this.rebuildIndex();
  }

  /**
   * Remove a page from the search index
   * @param {string} pageName - Page name to remove
   */
  removePageFromIndex(pageName) {
    // For now, just rebuild the entire index
    // In a production system, you'd want incremental updates
    this.rebuildIndex();
  }

  /**
   * Get search statistics
   * @returns {Object} Search statistics
   */
  getStatistics() {
    return {
      totalDocuments: Object.keys(this.documents).length,
      indexSize: this.searchIndex ? JSON.stringify(this.searchIndex).length : 0,
      averageDocumentLength: Object.values(this.documents).reduce((sum, doc) => 
        sum + doc.content.length, 0) / Object.keys(this.documents).length
    };
  }
}

module.exports = SearchManager;
