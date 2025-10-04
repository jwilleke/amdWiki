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
        const title = metadata.title || pageName; // Use frontmatter title, fallback to name

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
      this.searchIndex = lunr(function () {
        this.ref('id');
        this.field('title', { boost: 10 });
        this.field('content');
        this.field('systemCategory', { boost: 8 });
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
   * Search by multiple categories
   * @param {Array} categories - Array of category names to search
   * @returns {Array} Search results
   */
  searchByCategories(categories) {
    if (!categories || categories.length === 0) return [];
    
    const results = [];
    const seenPages = new Set();
    
    categories.forEach(category => {
      const categoryResults = this.searchByCategory(category);
      categoryResults.forEach(result => {
        if (!seenPages.has(result.name)) {
          seenPages.add(result.name);
          results.push(result);
        }
      });
    });
    
    // Sort by score descending
    return results.sort((a, b) => b.score - a.score);
  }

  /**
   * Search by multiple user keywords
   * @param {Array} keywords - Array of user keywords to search
   * @returns {Array} Search results
   */
  searchByUserKeywordsList(keywords) {
    if (!keywords || keywords.length === 0) return [];
    
    const results = [];
    const seenPages = new Set();
    
    keywords.forEach(keyword => {
      const keywordResults = this.searchByUserKeywords(keyword);
      keywordResults.forEach(result => {
        if (!seenPages.has(result.name)) {
          seenPages.add(result.name);
          results.push(result);
        }
      });
    });
    
    // Sort by score descending
    return results.sort((a, b) => b.score - a.score);
  }

  /**
   * Advanced search with multiple criteria support
   * @param {Object} options - Search options
   * @param {string} options.query - Text query
   * @param {Array|string} options.categories - Categories to search (supports arrays)
   * @param {Array|string} options.userKeywords - User keywords to search (supports arrays)
   * @param {Array|string} options.searchIn - Fields to search in (supports arrays)
   * @param {number} options.maxResults - Maximum number of results
   * @returns {Array} Search results
   */
  advancedSearch(options = {}) {
    const { 
      query = '', 
      categories = [], 
      userKeywords = [], 
      searchIn = ['all'], 
      maxResults = 50 
    } = options;
    
    // Normalize arrays
    const categoryList = Array.isArray(categories) ? categories : (categories ? [categories] : []);
    const keywordList = Array.isArray(userKeywords) ? userKeywords : (userKeywords ? [userKeywords] : []);
    const searchFields = Array.isArray(searchIn) ? searchIn : [searchIn];
    
    let results = [];
    
    if (query.trim()) {
      // Start with text search
      const searchOptions = { searchIn: searchFields.includes('all') ? 'all' : searchFields[0] };
      results = this.search(query, searchOptions);
    } else {
      // No text query, get all documents
      results = Object.keys(this.documents).map(name => ({
        name,
        title: this.documents[name].title || name,
        score: 1.0,
        snippet: this.documents[name].content.substring(0, 150),
        metadata: this.documents[name]
      }));
    }
    
    // Filter by categories if specified
    if (categoryList.length > 0) {
      results = results.filter(result => {
        const docCategory = result.metadata.category;
        return docCategory && categoryList.includes(docCategory);
      });
    }
    
    // Filter by user keywords if specified
    if (keywordList.length > 0) {
      results = results.filter(result => {
        const docKeywords = result.metadata.userKeywords || [];
        return keywordList.some(keyword => docKeywords.includes(keyword));
      });
    }
    
    // Limit results
    return results.slice(0, maxResults);
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
      .filter(doc => doc.category && doc.category.toLowerCase().includes(category.toLowerCase()))
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

  /**
   * Search by keywords
   * @param {Array} keywords - Keywords to search for
   * @returns {Array} Search results
   */
  searchByKeywords(keywords) {
    if (!keywords || !Array.isArray(keywords)) return [];

    const query = keywords.join(' ');
    return this.search(query);
  }

  /**
   * Add page to search index
   * @param {Object} page - Page object to add
   */
  addToIndex(page) {
    if (!page || !page.name) return;

    // Add to documents
    const metadata = page.metadata || {};
    this.documents[page.name] = {
      id: page.name,
      name: page.name,
      title: metadata.title || page.name,
      content: page.content || '',
      category: metadata.category || '',
      systemCategory: metadata['system-category'] || '',
      userKeywords: Array.isArray(metadata['user-keywords']) ?
        metadata['user-keywords'].join(' ') :
        (metadata['user-keywords'] || ''),
      tags: Array.isArray(metadata.tags) ?
        metadata.tags.join(' ') :
        (metadata.tags || ''),
      lastModified: metadata.lastModified || new Date().toISOString()
    };

    // Rebuild index to include new document
    this.buildSearchIndex();
  }

  /**
   * Remove page from search index
   * @param {string} pageName - Name of page to remove
   */
  removeFromIndex(pageName) {
    if (!pageName || !this.documents[pageName]) return;

    delete this.documents[pageName];

    // Rebuild index without the removed document
    this.buildSearchIndex();
  }

  /**
   * Perform multi-criteria search
   * @param {Object} criteria - Search criteria object
   * @returns {Array} Search results
   */
  multiSearch(criteria) {
    if (!criteria) return [];

    let results = [];

    // Text search
    if (criteria.query) {
      results = this.search(criteria.query);
    }

    // Category filter
    if (criteria.category) {
      const categoryResults = this.searchByCategory(criteria.category);
      if (results.length === 0) {
        results = categoryResults;
      } else {
        // Intersect results
        results = results.filter(r1 =>
          categoryResults.some(r2 => r1.name === r2.name)
        );
      }
    }

    // Keywords filter
    if (criteria.keywords) {
      const keywordResults = this.searchByKeywords(criteria.keywords);
      if (results.length === 0) {
        results = keywordResults;
      } else {
        // Intersect results
        results = results.filter(r1 =>
          keywordResults.some(r2 => r1.name === r2.name)
        );
      }
    }

    return results;
  }
}

module.exports = SearchManager;
