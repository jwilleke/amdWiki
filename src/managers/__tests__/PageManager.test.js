/**
 * PageManager Tests
 *
 * PageManager is a thin proxy that delegates all operations to a provider.
 * These tests verify the proxy behavior, not the provider logic itself.
 * Provider logic is tested in provider-specific test files.
 */

const PageManager = require('../PageManager');

// Mock ConfigurationManager
const mockConfigurationManager = {
  getProperty: jest.fn((key, defaultValue) => {
    const config = {
      'amdwiki.page.enabled': true,
      'amdwiki.page.provider.default': 'filesystemprovider',
      'amdwiki.page.provider': 'filesystemprovider',
      'amdwiki.directories.pages': './pages',
      'amdwiki.directories.required-pages': './required-pages'
    };
    return config[key] !== undefined ? config[key] : defaultValue;
  })
};

// Mock engine
const mockEngine = {
  getManager: jest.fn((name) => {
    if (name === 'ConfigurationManager') return mockConfigurationManager;
    return null;
  }),
  getConfig: jest.fn(() => ({ get: jest.fn() }))
};

describe('PageManager', () => {
  let pageManager;

  beforeEach(async () => {
    jest.clearAllMocks();

    // Reset mock implementation to default behavior
    mockConfigurationManager.getProperty.mockImplementation((key, defaultValue) => {
      const config = {
        'amdwiki.page.enabled': true,
        'amdwiki.page.provider.default': 'filesystemprovider',
        'amdwiki.page.provider': 'filesystemprovider',
        'amdwiki.directories.pages': './pages',
        'amdwiki.directories.required-pages': './required-pages'
      };
      return config[key] !== undefined ? config[key] : defaultValue;
    });

    pageManager = new PageManager(mockEngine);
    await pageManager.initialize();
  });

  afterEach(async () => {
    if (pageManager.provider) {
      await pageManager.shutdown();
    }
  });

  describe('Initialization', () => {
    test('should require ConfigurationManager', async () => {
      const engineWithoutConfig = { getManager: jest.fn(() => null) };
      const manager = new PageManager(engineWithoutConfig);

      await expect(manager.initialize()).rejects.toThrow('PageManager requires ConfigurationManager');
    });

    test('should initialize provider', async () => {
      expect(pageManager.provider).toBeTruthy();
      expect(pageManager.provider.initialized).toBe(true);
    });

    test('should get configuration from ConfigurationManager', async () => {
      expect(mockConfigurationManager.getProperty).toHaveBeenCalledWith('amdwiki.page.enabled', true);
      expect(mockConfigurationManager.getProperty).toHaveBeenCalledWith('amdwiki.page.provider', expect.any(String));
    });

    test('should handle disabled page storage', async () => {
      mockConfigurationManager.getProperty.mockImplementation((key, defaultValue) => {
        if (key === 'amdwiki.page.enabled') return false;
        return defaultValue;
      });

      const disabledManager = new PageManager(mockEngine);
      await disabledManager.initialize();

      expect(disabledManager.provider).toBeNull();
    });
  });

  describe('getCurrentPageProvider()', () => {
    test('should return the provider instance', () => {
      const provider = pageManager.getCurrentPageProvider();
      expect(provider).toBe(pageManager.provider);
      expect(provider).toBeTruthy();
    });

    test('should return provider with correct interface', () => {
      const provider = pageManager.getCurrentPageProvider();
      expect(provider.getProviderInfo).toBeDefined();
      expect(typeof provider.getProviderInfo).toBe('function');
    });
  });

  describe('Proxy Methods', () => {
    test('getPage() should delegate to provider', async () => {
      const mockPage = { title: 'Test', content: '# Test' };
      pageManager.provider.getPage = jest.fn().mockResolvedValue(mockPage);

      const result = await pageManager.getPage('Test');

      expect(pageManager.provider.getPage).toHaveBeenCalledWith('Test');
      expect(result).toBe(mockPage);
    });

    test('getPageContent() should delegate to provider', async () => {
      pageManager.provider.getPageContent = jest.fn().mockResolvedValue('# Content');

      const result = await pageManager.getPageContent('Test');

      expect(pageManager.provider.getPageContent).toHaveBeenCalledWith('Test');
      expect(result).toBe('# Content');
    });

    test('getPageMetadata() should delegate to provider', async () => {
      const mockMetadata = { title: 'Test', uuid: '123' };
      pageManager.provider.getPageMetadata = jest.fn().mockResolvedValue(mockMetadata);

      const result = await pageManager.getPageMetadata('Test');

      expect(pageManager.provider.getPageMetadata).toHaveBeenCalledWith('Test');
      expect(result).toBe(mockMetadata);
    });

    test('savePage() should delegate to provider', async () => {
      pageManager.provider.savePage = jest.fn().mockResolvedValue(undefined);

      await pageManager.savePage('Test', '# Content', { category: 'General' });

      expect(pageManager.provider.savePage).toHaveBeenCalledWith('Test', '# Content', { category: 'General' });
    });

    test('deletePage() should delegate to provider', async () => {
      pageManager.provider.deletePage = jest.fn().mockResolvedValue(undefined);

      await pageManager.deletePage('Test');

      expect(pageManager.provider.deletePage).toHaveBeenCalledWith('Test');
    });

    test('pageExists() should delegate to provider', () => {
      pageManager.provider.pageExists = jest.fn().mockReturnValue(true);

      const result = pageManager.pageExists('Test');

      expect(pageManager.provider.pageExists).toHaveBeenCalledWith('Test');
      expect(result).toBe(true);
    });

    test('getAllPages() should delegate to provider', async () => {
      const mockPages = [{ title: 'Page1' }, { title: 'Page2' }];
      pageManager.provider.getAllPages = jest.fn().mockResolvedValue(mockPages);

      const result = await pageManager.getAllPages();

      expect(pageManager.provider.getAllPages).toHaveBeenCalled();
      expect(result).toBe(mockPages);
    });

    test('refreshPageList() should delegate to provider', async () => {
      pageManager.provider.refreshPageList = jest.fn().mockResolvedValue(undefined);

      await pageManager.refreshPageList();

      expect(pageManager.provider.refreshPageList).toHaveBeenCalled();
    });
  });

  describe('WikiContext Methods', () => {
    test('savePageWithContext() should require WikiContext', async () => {
      await expect(pageManager.savePageWithContext(null)).rejects.toThrow(
        'PageManager.savePageWithContext requires a WikiContext'
      );
    });

    test('savePageWithContext() should extract data from WikiContext', async () => {
      pageManager.provider.savePage = jest.fn().mockResolvedValue(undefined);

      const wikiContext = {
        pageName: 'Test Page',
        content: '# Test Content',
        userContext: { username: 'testuser' }
      };

      await pageManager.savePageWithContext(wikiContext, { category: 'General' });

      expect(pageManager.provider.savePage).toHaveBeenCalledWith(
        'Test Page',
        '# Test Content',
        {
          category: 'General',
          author: 'testuser'
        }
      );
    });

    test('savePageWithContext() should use anonymous if no user', async () => {
      pageManager.provider.savePage = jest.fn().mockResolvedValue(undefined);

      const wikiContext = {
        pageName: 'Test Page',
        content: '# Test Content'
      };

      await pageManager.savePageWithContext(wikiContext, {});

      expect(pageManager.provider.savePage).toHaveBeenCalledWith(
        'Test Page',
        '# Test Content',
        { author: 'anonymous' }
      );
    });

    test('deletePageWithContext() should require WikiContext', async () => {
      await expect(pageManager.deletePageWithContext(null)).rejects.toThrow(
        'PageManager.deletePageWithContext requires a WikiContext'
      );
    });

    test('deletePageWithContext() should extract pageName from WikiContext', async () => {
      pageManager.provider.deletePage = jest.fn().mockResolvedValue(undefined);

      const wikiContext = {
        pageName: 'Test Page',
        userContext: { username: 'testuser' }
      };

      await pageManager.deletePageWithContext(wikiContext);

      expect(pageManager.provider.deletePage).toHaveBeenCalledWith('Test Page');
    });
  });

  describe('Backup and Restore', () => {
    test('backup() should delegate to provider and wrap result', async () => {
      const providerBackup = { pages: [{ title: 'Test' }] };
      pageManager.provider.backup = jest.fn().mockResolvedValue(providerBackup);

      const result = await pageManager.backup();

      expect(pageManager.provider.backup).toHaveBeenCalled();
      expect(result.managerName).toBe('PageManager');
      expect(result.timestamp).toBeTruthy();
      expect(result.providerBackup).toBe(providerBackup);
    });

    test('restore() should extract provider backup and delegate', async () => {
      const providerBackup = { pages: [{ title: 'Test' }] };
      const managerBackup = {
        managerName: 'PageManager',
        timestamp: new Date().toISOString(),
        providerBackup: providerBackup
      };

      pageManager.provider.restore = jest.fn().mockResolvedValue(undefined);

      await pageManager.restore(managerBackup);

      expect(pageManager.provider.restore).toHaveBeenCalledWith(providerBackup);
    });

    test('backup() should return null providerBackup if provider lacks backup method', async () => {
      // Remove backup method from provider
      delete pageManager.provider.backup;

      // Should return result with null providerBackup when provider lacks backup method
      const result = await pageManager.backup();
      expect(result.managerName).toBe('PageManager');
      expect(result.providerBackup).toBeNull();
    });
  });

  describe('shutdown()', () => {
    test('should call provider shutdown', async () => {
      // Mock shutdown method
      pageManager.provider.shutdown = jest.fn().mockResolvedValue(undefined);

      await pageManager.shutdown();

      expect(pageManager.provider.shutdown).toHaveBeenCalled();
    });

    test('should handle provider without shutdown method', async () => {
      // Remove shutdown method
      delete pageManager.provider.shutdown;

      // Should still work (provider.shutdown() will be undefined)
      await expect(pageManager.shutdown()).resolves.not.toThrow();
    });
  });

  describe('Provider Normalization', () => {
    test('should normalize filesystemprovider to FileSystemProvider', async () => {
      // This is tested implicitly in initialization
      expect(pageManager.providerClass).toBe('FileSystemProvider');
    });

    test('should normalize versioningfileprovider to VersioningFileProvider', async () => {
      mockConfigurationManager.getProperty.mockImplementation((key, defaultValue) => {
        if (key === 'amdwiki.page.provider') return 'versioningfileprovider';
        if (key === 'amdwiki.page.provider.default') return 'filesystemprovider';
        if (key === 'amdwiki.page.enabled') return true;
        return defaultValue;
      });

      const manager = new PageManager(mockEngine);
      await manager.initialize();

      expect(manager.providerClass).toBe('VersioningFileProvider');
      await manager.shutdown();
    });
  });
});
