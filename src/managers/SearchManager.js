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
        // Extract metadata fields
        const metadata = page.metadata || {};
        const category = metadata.category || '';
        const userKeywords = Array.isArray(metadata['user-keywords']) ? 
          metadata['user-keywords'].join(' ') : 
          (metadata['user-keywords'] || '');
        const tags = Array.isArray(metadata.tags) ? 
          metadata.tags.join(' ') : 
          (metadata.tags || '');

        documents[page.name] = {
          id: page.name,
          title: page.name,
          content: page.content,
          body: page.content,
          category: category,
          userKeywords: userKeywords,
          tags: tags,
          keywords: `${userKeywords} ${tags}`, // Combined keywords field
          lastModified: metadata.lastModified || '',
          uuid: metadata.uuid || ''
        };
      });

      this.documents = documents;

      // Build Lunr index
      this.searchIndex = lunr(function () {
        this.ref('id');
        this.field('title', { boost: 10 });
        this.field('content');
        this.field('category', { boost: 8 });
        this.field('userKeywords', { boost: 6 });
        this.field('tags', { boost: 5 });
        this.field('keywords', { boost: 4 });

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
   * Advanced search with filters
   * @param {Object} searchOptions - Advanced search options
   * @returns {Array<Object>} Search results
   */
  advancedSearch(searchOptions = {}) {
    const {
      query = '',
      category = '',
      userKeywords = '',
      searchIn = 'all', // 'title', 'content', 'category', 'keywords', 'all'
      maxResults = 20
    } = searchOptions;

    if (!this.searchIndex) {
      return [];
    }

    try {
      let searchQuery = '';
      let results = [];

      // Build search query based on filters
      if (searchIn === 'all' && query) {
        searchQuery = query;
      } else if (searchIn === 'title' && query) {
        searchQuery = `title:${query}`;
      } else if (searchIn === 'content' && query) {
        searchQuery = `content:${query}`;
      } else if (searchIn === 'category' && query) {
        searchQuery = `category:${query}`;
      } else if (searchIn === 'keywords' && query) {
        searchQuery = `keywords:${query}`;
      } else if (query) {
        searchQuery = query;
      }

      // Perform search
      if (searchQuery) {
        results = this.searchIndex.search(searchQuery);
      } else {
        // If no text query, return all documents for filtering
        results = Object.keys(this.documents).map(id => ({ ref: id, score: 1 }));
      }

      // Apply filters
      let filteredResults = results.map(result => {
        const doc = this.documents[result.ref];
        return {
          ...result,
          doc: doc
        };
      });

      // Filter by category
      if (category) {
        filteredResults = filteredResults.filter(result => 
          result.doc.category.toLowerCase().includes(category.toLowerCase()));
      }

      // Filter by user keywords
      if (userKeywords) {
        filteredResults = filteredResults.filter(result => 
          result.doc.userKeywords.toLowerCase().includes(userKeywords.toLowerCase()));
      }

      // Format results
      return filteredResults.slice(0, maxResults).map(result => {
        const doc = result.doc;
        const snippet = this.generateSnippet(doc.content, query || category || userKeywords);
        
        return {
          name: result.ref,
          title: doc.title,
          score: result.score,
          snippet: snippet,
          metadata: {
            wordCount: doc.content.split(/\s+/).length,
            category: doc.category,
            userKeywords: doc.userKeywords.split(' ').filter(k => k.trim()),
            tags: doc.tags.split(' ').filter(t => t.trim()),
            lastModified: doc.lastModified
          }
        };
      });

    } catch (err) {
      console.error('Advanced search failed:', err);
      return [];
    }
  }

  /**
   * Get all unique categories from indexed documents
   * @returns {Array<string>} List of categories
   */
  getAllCategories() {
    const categories = new Set();
    Object.values(this.documents).forEach(doc => {
      if (doc.category && doc.category.trim()) {
        categories.add(doc.category.trim());
      }
    });
    return Array.from(categories).sort();
  }

  /**
   * Get all unique user keywords from indexed documents
   * @returns {Array<string>} List of user keywords
   */
  getAllUserKeywords() {
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
   * @returns {Array<Object>} Pages in category
   */
  searchByCategory(category) {
    if (!category) return [];
    
    return Object.values(this.documents)
      .filter(doc => doc.category.toLowerCase().includes(category.toLowerCase()))
      .map(doc => ({
        name: doc.id,
        title: doc.title,
        score: 1,
        snippet: this.generateSnippet(doc.content, category),
        metadata: {
          wordCount: doc.content.split(/\s+/).length,
          category: doc.category,
          userKeywords: doc.userKeywords.split(' ').filter(k => k.trim()),
          tags: doc.tags.split(' ').filter(t => t.trim()),
          lastModified: doc.lastModified
        }
      }));
  }

  /**
   * Search by user keywords only
   * @param {string} keyword - Keyword to search for
   * @returns {Array<Object>} Pages with keyword
   */
  searchByUserKeywords(keyword) {
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
          category: doc.category,
          userKeywords: doc.userKeywords.split(' ').filter(k => k.trim()),
          tags: doc.tags.split(' ').filter(t => t.trim()),
          lastModified: doc.lastModified
        }
      }));
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
        sum + doc.content.length, 0) / Object.keys(this.documents).length,
      totalCategories: this.getAllCategories().length,
      totalUserKeywords: this.getAllUserKeywords().length
    };
  }

  /**
   * Get the total number of indexed documents
   * @returns {number} Number of documents
   */
  getDocumentCount() {
    return Object.keys(this.documents).length;
  }
}

module.exports = SearchManager;
