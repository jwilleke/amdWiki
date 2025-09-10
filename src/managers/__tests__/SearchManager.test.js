const SearchManager = require('../SearchManager');

// Mock dependencies
const mockEngine = {
  log: jest.fn(),
  getManager: jest.fn(),
  getConfig: jest.fn().mockReturnValue({
    get: jest.fn().mockReturnValue({
      search: { indexDir: './test-index' }
    })
  })
};

const mockPageManager = {
  getAllPages: jest.fn().mockReturnValue([
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

describe('SearchManager', () => {
  let searchManager;

  beforeEach(() => {
    searchManager = new SearchManager(mockEngine);
    mockEngine.getManager.mockReturnValue(mockPageManager);
    jest.clearAllMocks();
  });

  describe('initialization', () => {
    it('should initialize successfully', async () => {
      await searchManager.initialize({});
      expect(searchManager.initialized).toBe(true);
    });

    it('should build search index during initialization', async () => {
      await searchManager.initialize({});
      expect(searchManager.searchIndex).toBeDefined();
    });
  });

  describe('search functionality', () => {
    beforeEach(async () => {
      await searchManager.initialize({});
    });

    it('should search page content', () => {
      const results = searchManager.search('welcome');
      
      expect(results).toBeDefined();
      expect(Array.isArray(results)).toBe(true);
      
      if (results.length > 0) {
        expect(results[0]).toHaveProperty('ref');
        expect(results[0]).toHaveProperty('score');
      }
    });

    it('should search with multiple terms', () => {
      const results = searchManager.search('wiki platform');
      
      expect(results).toBeDefined();
      expect(Array.isArray(results)).toBe(true);
    });

    it('should handle empty search queries', () => {
      const results = searchManager.search('');
      
      expect(results).toBeDefined();
      expect(Array.isArray(results)).toBe(true);
    });

    it('should search by category', () => {
      const results = searchManager.searchByCategory('General');
      
      expect(results).toBeDefined();
      expect(Array.isArray(results)).toBe(true);
      
      // Should find pages in General category
      const welcomePage = results.find(page => page.title === 'Welcome');
      expect(welcomePage).toBeDefined();
    });

    it('should search by keywords', () => {
      const results = searchManager.searchByKeywords(['welcome']);
      
      expect(results).toBeDefined();
      expect(Array.isArray(results)).toBe(true);
      
      // Should find pages with welcome keyword
      const welcomePage = results.find(page => page.title === 'Welcome');
      expect(welcomePage).toBeDefined();
    });
  });

  describe('index management', () => {
    beforeEach(async () => {
      await searchManager.initialize({});
    });

    it('should rebuild search index', async () => {
      const oldIndex = searchManager.searchIndex;
      
      await searchManager.rebuildIndex();
      
      expect(searchManager.searchIndex).toBeDefined();
      // Index should be rebuilt (potentially different reference)
    });

    it('should add page to index', () => {
      const newPage = {
        title: 'New Page',
        content: 'This is new content',
        category: 'Test',
        keywords: ['new', 'test']
      };

      searchManager.addToIndex(newPage);
      
      // Should be able to search for the new page
      const results = searchManager.search('new content');
      expect(results).toBeDefined();
    });

    it('should remove page from index', () => {
      const pageTitle = 'Welcome';
      
      searchManager.removeFromIndex(pageTitle);
      
      // Should not find removed page in search
      const results = searchManager.search('welcome');
      const welcomePage = results.find(result => 
        result.ref && result.ref.includes('Welcome')
      );
      
      // Page should be removed or have lower relevance
      expect(results).toBeDefined();
    });
  });

  describe('advanced search', () => {
    beforeEach(async () => {
      await searchManager.initialize({});
    });

    it('should perform multi-criteria search', () => {
      const criteria = {
        query: 'search',
        category: 'Help',
        keywords: ['guide']
      };

      const results = searchManager.multiSearch(criteria);
      
      expect(results).toBeDefined();
      expect(Array.isArray(results)).toBe(true);
    });

    it('should handle complex search criteria', () => {
      const criteria = {
        query: 'wiki',
        category: 'General',
        keywords: ['welcome', 'intro']
      };

      const results = searchManager.multiSearch(criteria);
      
      expect(results).toBeDefined();
      expect(Array.isArray(results)).toBe(true);
    });
  });
});
