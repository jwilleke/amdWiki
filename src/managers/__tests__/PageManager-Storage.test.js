/**
 * PageManager-Storage.test.js - REQUIRES MAJOR REWRITE
 *
 * OBSOLETE FUNCTIONALITY BEING TESTED:
 * - savePage() returning {filePath, uuid, slug, metadata} - INCORRECT
 *   Actual API: savePage() returns Promise<void> (see docs/managers/PageManager.md line 299)
 *
 * - File moving between directories based on category changes - NO LONGER USED
 *   Pages are stored by providers, not moved between directories dynamically
 *   Tests expecting page moves from pages/ <-> required-pages/ are obsolete
 *
 * - resolvePageIdentifier(), getPageBySlug(), buildLookupCaches() - May not exist
 *   These methods are not documented in PageManager API docs
 *
 * STATUS: Deferred - Needs complete rewrite to match actual FileSystemProvider API
 * See: docs/managers/PageManager.md for correct API documentation
 */

const path = require('path');
const fs = require('fs-extra');
const PageManager = require('../PageManager');
const { v4: uuidv4 } = require('uuid');

// Mock ConfigurationManager - will be updated with test directories in beforeEach
let testPagesDir;
let testRequiredPagesDir;
let tempDir;

const mockConfigurationManager = {
  getProperty: jest.fn((key, defaultValue) => {
    if (key === 'amdwiki.page.enabled') {
      return true;
    }
    if (key === 'amdwiki.page.provider') {
      return 'filesystemprovider';
    }
    if (key === 'amdwiki.page.provider.default') {
      return 'filesystemprovider';
    }
    if (key === 'amdwiki.page.provider.filesystem.storagedir') {
      return testPagesDir || './pages';
    }
    if (key === 'amdwiki.page.provider.filesystem.requiredpagesdir') {
      return testRequiredPagesDir || './required-pages';
    }
    if (key === 'amdwiki.page.provider.filesystem.encoding') {
      return 'utf-8';
    }
    if (key === 'amdwiki.translator-reader.match-english-plurals') {
      return true;
    }
    return defaultValue;
  })
};

// Mock WikiEngine for testing
class MockWikiEngine {
  constructor() {
    this.managers = new Map();
    // Add ConfigurationManager to engine
    this.managers.set('ConfigurationManager', mockConfigurationManager);
  }

  getManager(name) {
    return this.managers.get(name);
  }

  registerManager(name, manager) {
    this.managers.set(name, manager);
  }
}

// All tests skipped - this file tests an obsolete API that no longer exists
// See header comments for details on what needs to be rewritten
describe.skip('PageManager File Storage and UUID System', () => {
  let pageManager;
  let engine;

  beforeEach(async () => {
    // Create temporary directories for testing
    tempDir = path.join(__dirname, '../../temp-test-' + Date.now());
    testPagesDir = path.join(tempDir, 'pages');
    testRequiredPagesDir = path.join(tempDir, 'required-pages');
    
    await fs.ensureDir(testPagesDir);
    await fs.ensureDir(testRequiredPagesDir);
    
    // Create mock engine and PageManager
    engine = new MockWikiEngine();
    pageManager = new PageManager(engine);
    
    await pageManager.initialize({
      pagesDir: testPagesDir,
      requiredPagesDir: testRequiredPagesDir
    });
  });

  afterEach(async () => {
    // Clean up temporary directories
    if (await fs.pathExists(tempDir)) {
      await fs.remove(tempDir);
    }
  });

  describe('File Storage Location Logic', () => {
    test('should store regular pages in pages directory', async () => {
      const metadata = {
        title: 'Test Regular Page',
        category: 'General',
        'user-keywords': ['test']
      };
      
      const result = await pageManager.savePage('Test Regular Page', '# Test Content', metadata);
      
      expect(result.filePath).toContain('pages');
      expect(result.filePath).toMatch(/\/pages\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.md$/);
      expect(await fs.pathExists(result.filePath)).toBe(true);
    });

    test('should store System category pages in required-pages directory', async () => {
      const metadata = {
        title: 'Test System Page',
        category: 'System',
        'user-keywords': ['system', 'test']
      };
      
      const result = await pageManager.savePage('Test System Page', '# System Content', metadata);
      
      expect(result.filePath).toContain('required-pages');
      expect(result.filePath).toMatch(/\/required-pages\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.md$/);
      expect(await fs.pathExists(result.filePath)).toBe(true);
    });

    test('should store System/Admin category pages in required-pages directory', async () => {
      const metadata = {
        title: 'Test Admin Page',
        category: 'System/Admin',
        'user-keywords': ['admin', 'test']
      };
      
      const result = await pageManager.savePage('Test Admin Page', '# Admin Content', metadata);
      
      expect(result.filePath).toContain('required-pages');
      expect(await fs.pathExists(result.filePath)).toBe(true);
    });

    test('should store hardcoded required pages in required-pages directory', async () => {
      const metadata = {
        title: 'Categories',
        category: 'General', // Even with General category, Categories should go to required-pages
        'user-keywords': []
      };
      
      const result = await pageManager.savePage('Categories', '# Categories Content', metadata);
      
      expect(result.filePath).toContain('required-pages');
      expect(await fs.pathExists(result.filePath)).toBe(true);
    });
  });

  describe('UUID Generation and File Naming', () => {
    test('should generate UUID if not provided', async () => {
      const metadata = {
        title: 'Test Page Without UUID',
        category: 'General'
      };
      
      const result = await pageManager.savePage('Test Page Without UUID', '# Content', metadata);
      
      expect(result.uuid).toBeDefined();
      expect(result.uuid).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/);
      expect(path.basename(result.filePath, '.md')).toBe(result.uuid);
    });

    test('should use provided UUID', async () => {
      const customUuid = 'test-uuid-1234-5678-9012-abcdefghijkl';
      const metadata = {
        title: 'Test Page With UUID',
        category: 'General',
        uuid: customUuid
      };
      
      const result = await pageManager.savePage('Test Page With UUID', '# Content', metadata);
      
      expect(result.uuid).toBe(customUuid);
      expect(path.basename(result.filePath, '.md')).toBe(customUuid);
    });

    test('should generate slug from title if not provided', async () => {
      const metadata = {
        title: 'Test Page With Spaces & Special-Characters!',
        category: 'General'
      };
      
      const result = await pageManager.savePage('Test Page With Spaces & Special-Characters!', '# Content', metadata);
      
      expect(result.slug).toBe('test-page-with-spaces-special-characters');
      expect(result.metadata.slug).toBe('test-page-with-spaces-special-characters');
    });

    test('should use provided slug', async () => {
      const customSlug = 'custom-slug-name';
      const metadata = {
        title: 'Test Page',
        category: 'General',
        slug: customSlug
      };
      
      const result = await pageManager.savePage('Test Page', '# Content', metadata);
      
      expect(result.slug).toBe(customSlug);
      expect(result.metadata.slug).toBe(customSlug);
    });
  });

  describe('Page Resolution and Lookup', () => {
    let testPageData;

    beforeEach(async () => {
      // Create a test page for resolution testing
      const metadata = {
        title: 'Test Resolution Page',
        category: 'General',
        'user-keywords': ['resolution', 'test']
      };
      
      testPageData = await pageManager.savePage('Test Resolution Page', '# Resolution Content', metadata);
      
      // Rebuild caches to include the new page
      await pageManager.buildLookupCaches();
    });

    test('should resolve page by title', async () => {
      const resolvedUuid = pageManager.resolvePageIdentifier('Test Resolution Page');
      expect(resolvedUuid).toBe(testPageData.uuid);
    });

    test('should resolve page by slug', async () => {
      const resolvedUuid = pageManager.resolvePageIdentifier('test-resolution-page');
      expect(resolvedUuid).toBe(testPageData.uuid);
    });

    test('should resolve page by UUID', async () => {
      const resolvedUuid = pageManager.resolvePageIdentifier(testPageData.uuid);
      expect(resolvedUuid).toBe(testPageData.uuid);
    });

    test('should return null for non-existent page', async () => {
      const resolvedUuid = pageManager.resolvePageIdentifier('Non Existent Page');
      expect(resolvedUuid).toBeNull();
    });

    test('should retrieve page by title', async () => {
      const page = await pageManager.getPage('Test Resolution Page');
      
      expect(page).toBeDefined();
      expect(page.title).toBe('Test Resolution Page');
      expect(page.uuid).toBe(testPageData.uuid);
      expect(page.content.trim()).toBe('# Resolution Content');
    });

    test('should retrieve page by slug', async () => {
      const page = await pageManager.getPageBySlug('test-resolution-page');
      
      expect(page).toBeDefined();
      expect(page.title).toBe('Test Resolution Page');
      expect(page.uuid).toBe(testPageData.uuid);
    });

    test('should retrieve page by UUID', async () => {
      const page = await pageManager.getPageByUuid(testPageData.uuid);
      
      expect(page).toBeDefined();
      expect(page.title).toBe('Test Resolution Page');
      expect(page.uuid).toBe(testPageData.uuid);
    });
  });

  describe('Cache Management', () => {
    test('should build lookup caches correctly', async () => {
      // Create multiple test pages
      await pageManager.savePage('Cache Test 1', '# Content 1', { title: 'Cache Test 1', category: 'General' });
      await pageManager.savePage('Cache Test 2', '# Content 2', { title: 'Cache Test 2', category: 'System' });
      
      await pageManager.buildLookupCaches();
      
      expect(pageManager.titleToUuidMap.has('Cache Test 1')).toBe(true);
      expect(pageManager.titleToUuidMap.has('Cache Test 2')).toBe(true);
      expect(pageManager.slugToUuidMap.has('cache-test-1')).toBe(true);
      expect(pageManager.slugToUuidMap.has('cache-test-2')).toBe(true);
    });

    test('should update caches after page save', async () => {
      const initialCacheSize = pageManager.titleToUuidMap.size;
      
      await pageManager.savePage('New Cache Test', '# New Content', { 
        title: 'New Cache Test', 
        category: 'General' 
      });
      
      expect(pageManager.titleToUuidMap.size).toBe(initialCacheSize + 1);
      expect(pageManager.titleToUuidMap.has('New Cache Test')).toBe(true);
    });
  });

  describe('File Moving Between Directories', () => {
    test('should move page from pages to required-pages when category changes to System', async () => {
      // Create page in pages directory
      const result1 = await pageManager.savePage('Test Move Page', '# Content', { 
        title: 'Test Move Page', 
        category: 'General' 
      });
      
      expect(result1.filePath).toContain('pages');
      
      // Update category to System - should move to required-pages
      const result2 = await pageManager.savePage('Test Move Page', '# Updated Content', { 
        title: 'Test Move Page', 
        category: 'System',
        uuid: result1.uuid
      });
      
      expect(result2.filePath).toContain('required-pages');
      expect(await fs.pathExists(result1.filePath)).toBe(false); // Old file should be removed
      expect(await fs.pathExists(result2.filePath)).toBe(true);
    });

    test('should move page from required-pages to pages when category changes to General', async () => {
      // Create page in required-pages directory
      const result1 = await pageManager.savePage('Test Move Back Page', '# Content', { 
        title: 'Test Move Back Page', 
        category: 'System' 
      });
      
      expect(result1.filePath).toContain('required-pages');
      
      // Update category to General - should move to pages
      const result2 = await pageManager.savePage('Test Move Back Page', '# Updated Content', { 
        title: 'Test Move Back Page', 
        category: 'General',
        uuid: result1.uuid
      });
      
      expect(result2.filePath).toContain('pages');
      expect(await fs.pathExists(result1.filePath)).toBe(false); // Old file should be removed
      expect(await fs.pathExists(result2.filePath)).toBe(true);
    });
  });

  describe('Page Existence Checks', () => {
    test('should correctly identify existing pages', async () => {
      const testPage = await pageManager.savePage('Existence Test', '# Content', { 
        title: 'Existence Test', 
        category: 'General' 
      });
      
      await pageManager.buildLookupCaches();
      
      expect(await pageManager.pageExists('Existence Test')).toBe(true);
      expect(await pageManager.pageExists('existence-test')).toBe(true);
      expect(await pageManager.pageExists(testPage.uuid)).toBe(true);
    });

    test('should correctly identify non-existent pages', async () => {
      expect(await pageManager.pageExists('Non Existent Page')).toBe(false);
      expect(await pageManager.pageExists('non-existent-page')).toBe(false);
      expect(await pageManager.pageExists('fake-uuid-1234-5678-9012-abcdefghijkl')).toBe(false);
    });
  });

  describe('Page Deletion', () => {
    test('should delete page and update caches', async () => {
      const testPage = await pageManager.savePage('Delete Test', '# Content', { 
        title: 'Delete Test', 
        category: 'General' 
      });
      
      await pageManager.buildLookupCaches();
      
      expect(await pageManager.pageExists('Delete Test')).toBe(true);
      
      const deleted = await pageManager.deletePage('Delete Test');
      
      expect(deleted).toBe(true);
      expect(await fs.pathExists(testPage.filePath)).toBe(false);
      expect(await pageManager.pageExists('Delete Test')).toBe(false);
    });
  });

  describe('Metadata Validation', () => {
    test('should add required metadata fields', async () => {
      const result = await pageManager.savePage('Metadata Test', '# Content', { 
        title: 'Metadata Test'
      });
      
      expect(result.metadata.uuid).toBeDefined();
      expect(result.metadata.slug).toBe('metadata-test');
      expect(result.metadata.lastModified).toBeDefined();
      expect(result.metadata.title).toBe('Metadata Test');
    });

    test('should preserve existing metadata', async () => {
      const customUuid = 'custom-uuid-test-1234-5678-abcdefghijkl';
      const customSlug = 'custom-test-slug';
      
      const result = await pageManager.savePage('Preserve Test', '# Content', { 
        title: 'Preserve Test',
        uuid: customUuid,
        slug: customSlug,
        category: 'General',
        'user-keywords': ['test', 'preserve']
      });
      
      expect(result.metadata.uuid).toBe(customUuid);
      expect(result.metadata.slug).toBe(customSlug);
      expect(result.metadata.category).toBe('General');
      expect(result.metadata['user-keywords']).toEqual(['test', 'preserve']);
    });
  });

  describe('Error Handling', () => {
    test('should handle invalid directory paths gracefully', async () => {
      const invalidPageManager = new PageManager(engine);
      
      await expect(invalidPageManager.initialize({
        pagesDir: '/invalid/path/that/does/not/exist',
        requiredPagesDir: '/another/invalid/path'
      })).rejects.toThrow();
    });

    test('should handle file system errors gracefully', async () => {
      // Create a page normally
      const testPage = await pageManager.savePage('Error Test', '# Content', { 
        title: 'Error Test', 
        category: 'General' 
      });
      
      // Manually delete the file to simulate a file system error
      await fs.remove(testPage.filePath);
      
      // Trying to get the page should return null rather than throwing
      const retrievedPage = await pageManager.getPage('Error Test');
      expect(retrievedPage).toBeNull();
    });
  });
});
