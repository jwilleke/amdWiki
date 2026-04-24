/**
 * PageManager Tests
 *
 * PageManager is a thin proxy that delegates all operations to a provider.
 * These tests verify the proxy behavior, not the provider logic itself.
 * Provider logic is tested in provider-specific test files.
 */

import PageManager from '../PageManager';
import type { WikiEngine } from '../../types/WikiEngine';

// Mock ConfigurationManager
const mockConfigurationManager = {
  getProperty: vi.fn((key, defaultValue) => {
    const config = {
      'ngdpbase.page.enabled': true,
      'ngdpbase.page.provider.default': 'filesystemprovider',
      'ngdpbase.page.provider': 'filesystemprovider',
      'ngdpbase.directories.pages': './pages',
      'ngdpbase.directories.required-pages': './required-pages'
    };
    return config[key] !== undefined ? config[key] : defaultValue;
  })
};

// Mock engine
const mockEngine = {
  getManager: vi.fn((name) => {
    if (name === 'ConfigurationManager') return mockConfigurationManager;
    return null;
  }),
  getConfig: vi.fn(() => ({ get: vi.fn() }))
};

describe('PageManager', () => {
  let pageManager;

  beforeEach(async () => {
    vi.clearAllMocks();

    // Reset mock implementation to default behavior
    mockConfigurationManager.getProperty.mockImplementation((key, defaultValue) => {
      const config = {
        'ngdpbase.page.enabled': true,
        'ngdpbase.page.provider.default': 'filesystemprovider',
        'ngdpbase.page.provider': 'filesystemprovider',
        'ngdpbase.directories.pages': './pages',
        'ngdpbase.directories.required-pages': './required-pages'
      };
      return config[key] !== undefined ? config[key] : defaultValue;
    });

    pageManager = new PageManager(mockEngine as unknown as WikiEngine);
    await pageManager.initialize();
  });

  afterEach(async () => {
    if (pageManager.provider) {
      await pageManager.shutdown();
    }
  });

  describe('Initialization', () => {
    test('should require ConfigurationManager', async () => {
      const engineWithoutConfig = { getManager: vi.fn(() => null) };
      const manager = new PageManager(engineWithoutConfig);

      await expect(manager.initialize()).rejects.toThrow('PageManager requires ConfigurationManager');
    });

    test('should initialize provider', async () => {
      expect(pageManager.provider).toBeTruthy();
      expect(pageManager.provider.initialized).toBe(true);
    });

    test('should get configuration from ConfigurationManager', async () => {
      expect(mockConfigurationManager.getProperty).toHaveBeenCalledWith('ngdpbase.page.enabled', true);
      expect(mockConfigurationManager.getProperty).toHaveBeenCalledWith('ngdpbase.page.provider', expect.any(String));
    });

    test('should handle disabled page storage', async () => {
      mockConfigurationManager.getProperty.mockImplementation((key, defaultValue) => {
        if (key === 'ngdpbase.page.enabled') return false;
        return defaultValue;
      });

      const disabledManager = new PageManager(mockEngine as unknown as WikiEngine);
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
      pageManager.provider.getPage = vi.fn().mockResolvedValue(mockPage);

      const result = await pageManager.getPage('Test');

      expect(pageManager.provider.getPage).toHaveBeenCalledWith('Test');
      expect(result).toBe(mockPage);
    });

    test('getPageContent() should delegate to provider', async () => {
      pageManager.provider.getPageContent = vi.fn().mockResolvedValue('# Content');

      const result = await pageManager.getPageContent('Test');

      expect(pageManager.provider.getPageContent).toHaveBeenCalledWith('Test');
      expect(result).toBe('# Content');
    });

    test('getPageMetadata() should delegate to provider', async () => {
      const mockMetadata = { title: 'Test', uuid: '123' };
      pageManager.provider.getPageMetadata = vi.fn().mockResolvedValue(mockMetadata);

      const result = await pageManager.getPageMetadata('Test');

      expect(pageManager.provider.getPageMetadata).toHaveBeenCalledWith('Test');
      expect(result).toBe(mockMetadata);
    });

    test('savePage() should delegate to provider', async () => {
      pageManager.provider.savePage = vi.fn().mockResolvedValue(undefined);

      await pageManager.savePage('Test', '# Content', { category: 'General' });

      expect(pageManager.provider.savePage).toHaveBeenCalledWith('Test', '# Content', { category: 'General' });
    });

    test('deletePage() should delegate to provider', async () => {
      pageManager.provider.deletePage = vi.fn().mockResolvedValue(undefined);

      await pageManager.deletePage('Test');

      expect(pageManager.provider.deletePage).toHaveBeenCalledWith('Test');
    });

    test('pageExists() should delegate to provider', () => {
      pageManager.provider.pageExists = vi.fn().mockReturnValue(true);

      const result = pageManager.pageExists('Test');

      expect(pageManager.provider.pageExists).toHaveBeenCalledWith('Test');
      expect(result).toBe(true);
    });

    test('getAllPages() should delegate to provider', async () => {
      const mockPages = [{ title: 'Page1' }, { title: 'Page2' }];
      pageManager.provider.getAllPages = vi.fn().mockResolvedValue(mockPages);

      const result = await pageManager.getAllPages();

      expect(pageManager.provider.getAllPages).toHaveBeenCalled();
      expect(result).toBe(mockPages);
    });

    test('refreshPageList() should delegate to provider', async () => {
      pageManager.provider.refreshPageList = vi.fn().mockResolvedValue(undefined);

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
      pageManager.provider.savePage = vi.fn().mockResolvedValue(undefined);

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
      pageManager.provider.savePage = vi.fn().mockResolvedValue(undefined);

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
      pageManager.provider.deletePage = vi.fn().mockResolvedValue(undefined);

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
      pageManager.provider.backup = vi.fn().mockResolvedValue(providerBackup);

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

      pageManager.provider.restore = vi.fn().mockResolvedValue(undefined);

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
      pageManager.provider.shutdown = vi.fn().mockResolvedValue(undefined);

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

  describe('getPageUUID()', () => {
    test('should delegate to provider', () => {
      pageManager.provider.getPageUUID = vi.fn().mockReturnValue('test-uuid-001');

      const result = pageManager.getPageUUID('My Page');

      expect(pageManager.provider.getPageUUID).toHaveBeenCalledWith('My Page');
      expect(result).toBe('test-uuid-001');
    });

    test('should return null when provider returns null', () => {
      pageManager.provider.getPageUUID = vi.fn().mockReturnValue(null);

      expect(pageManager.getPageUUID('unknown')).toBeNull();
    });
  });

  describe('invalidatePageCache() — UUID-based clear (#588)', () => {
    test('should clear rendered-pages using UUID not title', () => {
      const mockClear = vi.fn().mockResolvedValue(undefined);
      const mockCacheManager = { clear: mockClear, isInitialized: () => true };

      mockEngine.getManager.mockImplementation((name) => {
        if (name === 'ConfigurationManager') return mockConfigurationManager;
        if (name === 'CacheManager') return mockCacheManager;
        return null;
      });

      pageManager.provider.invalidatePageCache = vi.fn().mockReturnValue('My Page');
      pageManager.provider.getPageUUID = vi.fn().mockReturnValue('page-uuid-xyz');

      pageManager.invalidatePageCache('My Page');

      expect(pageManager.provider.getPageUUID).toHaveBeenCalledWith('My Page');
      expect(mockClear).toHaveBeenCalledWith(undefined, 'rendered-pages:page-uuid-xyz:*');
    });

    test('should fall back to title when provider has no UUID', () => {
      const mockClear = vi.fn().mockResolvedValue(undefined);
      const mockCacheManager = { clear: mockClear, isInitialized: () => true };

      mockEngine.getManager.mockImplementation((name) => {
        if (name === 'ConfigurationManager') return mockConfigurationManager;
        if (name === 'CacheManager') return mockCacheManager;
        return null;
      });

      pageManager.provider.invalidatePageCache = vi.fn().mockReturnValue('My Page');
      pageManager.provider.getPageUUID = vi.fn().mockReturnValue(null);

      pageManager.invalidatePageCache('My Page');

      expect(mockClear).toHaveBeenCalledWith(undefined, 'rendered-pages:My Page:*');
    });
  });

  describe('savePage() duplicate guard (#587)', () => {
    test('should call validationManager.checkConflicts() and throw on conflict', async () => {
      const mockCheckConflicts = vi.fn().mockResolvedValue({
        hasConflict: true,
        conflictType: 'title-duplicate',
        message: 'A page with title \'Speed\' already exists under UUID other-uuid'
      });
      mockEngine.getManager.mockImplementation((name) => {
        if (name === 'ConfigurationManager') return mockConfigurationManager;
        if (name === 'ValidationManager') return { checkConflicts: mockCheckConflicts };
        return null;
      });

      await expect(
        pageManager.savePage('Speed', '# Speed', { uuid: 'new-uuid' })
      ).rejects.toThrow("A page with title 'Speed' already exists");

      expect(mockCheckConflicts).toHaveBeenCalledWith('new-uuid', 'Speed', '');
    });

    test('should proceed normally when no conflict', async () => {
      const mockCheckConflicts = vi.fn().mockResolvedValue({ hasConflict: false, conflictType: null });
      pageManager.provider.savePage = vi.fn().mockResolvedValue(undefined);
      mockEngine.getManager.mockImplementation((name) => {
        if (name === 'ConfigurationManager') return mockConfigurationManager;
        if (name === 'ValidationManager') return { checkConflicts: mockCheckConflicts };
        return null;
      });

      await pageManager.savePage('New Page', '# Hello', { uuid: 'new-uuid' });

      expect(mockCheckConflicts).toHaveBeenCalled();
      expect(pageManager.provider.savePage).toHaveBeenCalledWith('New Page', '# Hello', { uuid: 'new-uuid' });
    });
  });

  describe('Provider Normalization', () => {
    test('should normalize filesystemprovider to FileSystemProvider', async () => {
      // This is tested implicitly in initialization
      expect(pageManager.providerClass).toBe('FileSystemProvider');
    });

    test('should normalize versioningfileprovider to VersioningFileProvider', async () => {
      mockConfigurationManager.getProperty.mockImplementation((key, defaultValue) => {
        if (key === 'ngdpbase.page.provider') return 'versioningfileprovider';
        if (key === 'ngdpbase.page.provider.default') return 'filesystemprovider';
        if (key === 'ngdpbase.page.enabled') return true;
        return defaultValue;
      });

      const manager = new PageManager(mockEngine as unknown as WikiEngine);
      await manager.initialize();

      expect(manager.providerClass).toBe('VersioningFileProvider');
      await manager.shutdown();
    });
  });
});
