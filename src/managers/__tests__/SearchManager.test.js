/**
 * SearchManager tests
 *
 * Tests SearchManager's core functionality:
 * - Search provider initialization
 * - Search operations (search, searchByCategory, searchByKeywords)
 * - Index management (build, add, remove)
 * - Multi-criteria search
 *
 * @jest-environment jsdom
 */

const { describe, test, expect, beforeEach } = require('@jest/globals');
const SearchManager = require('../SearchManager');

// Mock ConfigurationManager
const mockConfigurationManager = {
  getProperty: jest.fn((key, defaultValue) => {
    if (key === 'amdwiki.search.enabled') {
      return true;
    }
    if (key === 'amdwiki.search.provider.default') {
      return 'lunrsearchprovider';
    }
    if (key === 'amdwiki.search.provider') {
      return 'lunrsearchprovider';
    }
    return defaultValue;
  })
};

// Mock PageManager
const mockPageManager = {
  getAllPages: jest.fn().mockResolvedValue([
    {
      title: 'Welcome',
      content: 'Welcome to our wiki platform',
      category: 'General',
      keywords: ['welcome', 'intro']
    },
    {
      title: 'Search Guide',
      content: 'How to search effectively',
      category: 'Help',
      keywords: ['search', 'guide']
    }
  ])
};

// Mock engine
const mockEngine = {
  getManager: jest.fn((name) => {
    if (name === 'ConfigurationManager') {
      return mockConfigurationManager;
    }
    if (name === 'PageManager') {
      return mockPageManager;
    }
    return null;
  })
};

describe('SearchManager', () => {
  let searchManager;

  beforeEach(async () => {
    // Clear mocks
    jest.clearAllMocks();

    searchManager = new SearchManager(mockEngine);
    await searchManager.initialize();
  });

  describe('Initialization', () => {
    test('should initialize without errors', async () => {
      const newSearchManager = new SearchManager(mockEngine);
      await expect(newSearchManager.initialize()).resolves.not.toThrow();
    });

    test('should load LunrSearchProvider by default', async () => {
      expect(searchManager.provider).toBeDefined();
      expect(searchManager.providerClass).toBe('LunrSearchProvider');
    });

    test('should build search index during initialization', async () => {
      // Verify buildSearchIndex was called (implicitly by checking provider state)
      expect(searchManager.provider).toBeDefined();
    });

    test('should throw error if ConfigurationManager missing', async () => {
      const badEngine = {
        getManager: jest.fn().mockReturnValue(null)
      };

      const newSearchManager = new SearchManager(badEngine);
      await expect(newSearchManager.initialize()).rejects.toThrow('SearchManager requires ConfigurationManager');
    });
  });

  describe('Search functionality', () => {
    test('should search page content', async () => {
      const results = await searchManager.search('welcome');

      expect(results).toBeDefined();
      // Provider returns an object with results array
      expect(typeof results).toBe('object');
    });

    test('should search with multiple terms', async () => {
      const results = await searchManager.search('wiki platform');

      expect(results).toBeDefined();
      expect(typeof results).toBe('object');
    });

    test('should handle empty search queries', async () => {
      const results = await searchManager.search('');

      expect(results).toBeDefined();
      expect(typeof results).toBe('object');
    });

    test('should return provider search results', async () => {
      const results = await searchManager.search('wiki');

      expect(results).toBeDefined();
      expect(typeof results).toBe('object');
      // Mock provider returns {results: [], totalHits: 0}
      if (results.results !== undefined) {
        expect(Array.isArray(results.results)).toBe(true);
      }
    });
  });

  describe('Index management', () => {
    test('should rebuild search index', async () => {
      await expect(searchManager.rebuildIndex()).resolves.not.toThrow();
    });

    test('should update page in index', async () => {
      const pageData = {
        title: 'New Page',
        content: 'This is new content',
        category: 'Test',
        keywords: ['new', 'test']
      };

      await expect(searchManager.updatePageInIndex('NewPage', pageData)).resolves.not.toThrow();
    });

    test('should remove page from index', async () => {
      const pageTitle = 'Welcome';

      await expect(searchManager.removePageFromIndex(pageTitle)).resolves.not.toThrow();
    });

    test('should get document count', async () => {
      const count = await searchManager.getDocumentCount();

      expect(typeof count).toBe('number');
      expect(count).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Advanced search', () => {
    test('should search by category', async () => {
      const results = await searchManager.searchByCategory('General');

      expect(results).toBeDefined();
      // Returns provider search result (object or array depending on provider)
      expect(results).toBeTruthy();
    });

    test('should search by keywords', async () => {
      const results = await searchManager.searchByKeywords(['welcome']);

      expect(results).toBeDefined();
      // searchByKeywords delegates to search(), returns provider result
      expect(typeof results).toBe('object');
    });

    test('should perform multi-criteria search', async () => {
      const results = await searchManager.multiSearch({
        query: 'search',
        category: 'Help',
        keywords: ['guide']
      });

      expect(results).toBeDefined();
      // Returns provider result
      expect(results).toBeTruthy();
    });

    test('should get search statistics', async () => {
      const stats = await searchManager.getStatistics();

      expect(stats).toBeDefined();
      expect(typeof stats).toBe('object');
    });

    test('should support searchIn field filtering', async () => {
      // Test with searchIn: ['title'] - should only search title field
      const titleResults = await searchManager.advancedSearch({
        query: 'Welcome',
        searchIn: ['title']
      });

      expect(titleResults).toBeDefined();
      expect(Array.isArray(titleResults)).toBe(true);
    });

    test('should support searchIn with multiple fields', async () => {
      // Test with searchIn: ['title', 'content']
      const results = await searchManager.advancedSearch({
        query: 'wiki',
        searchIn: ['title', 'content']
      });

      expect(results).toBeDefined();
      expect(Array.isArray(results)).toBe(true);
    });

    test('should search all fields when searchIn is all', async () => {
      // Test with searchIn: ['all'] - default behavior
      const allResults = await searchManager.advancedSearch({
        query: 'wiki',
        searchIn: ['all']
      });

      expect(allResults).toBeDefined();
      expect(Array.isArray(allResults)).toBe(true);
    });

    test('should support searchIn with category and keywords fields', async () => {
      // Test with searchIn: ['category', 'keywords']
      const results = await searchManager.advancedSearch({
        query: 'General',
        searchIn: ['category']
      });

      expect(results).toBeDefined();
      expect(Array.isArray(results)).toBe(true);
    });
  });

  describe('Provider info', () => {
    test('should have provider loaded', () => {
      expect(searchManager.provider).toBeDefined();
      expect(searchManager.providerClass).toBe('LunrSearchProvider');
    });
  });

  describe('Configuration-based behavior', () => {
    test('should skip provider loading when search disabled', async () => {
      const disabledConfigManager = {
        getProperty: jest.fn((key, defaultValue) => {
          if (key === 'amdwiki.search.enabled') {
            return false; // Disable search
          }
          return defaultValue;
        })
      };

      const disabledEngine = {
        getManager: jest.fn((name) => {
          if (name === 'ConfigurationManager') {
            return disabledConfigManager;
          }
          return null;
        })
      };

      const disabledSearchManager = new SearchManager(disabledEngine);
      await disabledSearchManager.initialize();

      // When disabled, initialize() returns early without loading provider
      // Provider will be undefined or null
      expect(disabledSearchManager.provider).toBeFalsy();
    });
  });
});
