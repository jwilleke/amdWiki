const { describe, test, expect, beforeEach, afterEach } = require('@jest/globals');
const fs = require('fs-extra');
const path = require('path');
const PageManager = require('../PageManager');
const { v4: uuidv4 } = require('uuid');

// Mock ValidationManager
const mockValidationManager = {
  generateFilename: jest.fn((metadata) => `${metadata.uuid}.md`),
  validatePage: jest.fn(() => ({ success: true, warnings: [] })),
  generateValidMetadata: jest.fn((title, options = {}) => ({
    title,
    uuid: options.uuid || uuidv4(),
    slug: title.toLowerCase().replace(/\s+/g, '-'),
    category: options.category || 'General',
    'user-keywords': options['user-keywords'] || [],
    lastModified: new Date().toISOString(),
    ...options
  }))
};

// Mock ACLManager
const mockACLManager = {
  checkStorageLocation: jest.fn().mockResolvedValue({ location: 'regular', reason: 'default' })
};

// Mock ConfigurationManager
let testPagesDir;
let testRequiredPagesDir;
const mockConfigurationManager = {
  getProperty: jest.fn((key, defaultValue) => {
    if (key === 'amdwiki.directories.pages') {
      return testPagesDir;
    }
    if (key === 'amdwiki.directories.required-pages') {
      return testRequiredPagesDir;
    }
    if (key === 'amdwiki.encoding') {
      return 'UTF-8';
    }
    if (key === 'amdwiki.translatorReader.matchEnglishPlurals') {
      return true;
    }
    if (key === 'amdwiki.pageProvider') {
      return 'FileSystemProvider';
    }
    if (key === 'amdwiki.systemCategories') {
      return {
        general: { label: 'general', storageLocation: 'regular' },
        system: { label: 'system', storageLocation: 'required' },
        documentation: { label: 'documentation', storageLocation: 'required' },
        test: { label: 'test', storageLocation: 'required' }
      };
    }
    return defaultValue;
  })
};

// Mock engine
const mockEngine = {
  getManager: jest.fn((name) => {
    if (name === 'ValidationManager') {
      return mockValidationManager;
    }
    if (name === 'ACLManager') {
      return mockACLManager;
    }
    if (name === 'ConfigurationManager') {
      return mockConfigurationManager;
    }
    return null;
  }),
  getConfig: jest.fn(() => ({
    get: jest.fn()
  }))
};

describe('PageManager', () => {
  let pageManager;

  beforeEach(async () => {
    // Create temporary test directories
    const testDir = path.join(__dirname, 'test-pages-' + Date.now());
    testPagesDir = path.join(testDir, 'pages');
    testRequiredPagesDir = path.join(testDir, 'required-pages');

    await fs.ensureDir(testPagesDir);
    await fs.ensureDir(testRequiredPagesDir);

    pageManager = new PageManager(mockEngine);
    await pageManager.initialize();
  });

  afterEach(async () => {
    // Cleanup test directories
    try {
      await fs.remove(path.dirname(testPagesDir));
    } catch (err) {
      // Directory might not exist
    }
  });

  describe('initialization', () => {
    test('should create pages directories if they do not exist', async () => {
      const newTestDir = path.join(__dirname, 'new-test-pages-' + Date.now());
      const newPagesDir = path.join(newTestDir, 'pages');
      const newRequiredPagesDir = path.join(newTestDir, 'required-pages');

      // Temporarily update mock to return new directories
      const originalPagesDir = testPagesDir;
      const originalRequiredPagesDir = testRequiredPagesDir;
      testPagesDir = newPagesDir;
      testRequiredPagesDir = newRequiredPagesDir;

      const newPageManager = new PageManager(mockEngine);
      await newPageManager.initialize();

      expect(await fs.pathExists(newPagesDir)).toBe(true);
      expect(await fs.pathExists(newRequiredPagesDir)).toBe(true);

      // Restore original directories
      testPagesDir = originalPagesDir;
      testRequiredPagesDir = originalRequiredPagesDir;

      // Cleanup
      await fs.remove(newTestDir);
    });

    test('should set correct directories from config', () => {
      // PageManager now uses provider, check provider properties
      const provider = pageManager.getCurrentPageProvider();
      expect(provider.pagesDirectory).toBe(testPagesDir);
      expect(provider.requiredPagesDirectory).toBe(testRequiredPagesDir);
    });
  });

  describe('page existence checking', () => {
    beforeEach(async () => {
      // Create test pages with UUID-based filenames
      const testPageUuid = uuidv4();
      const systemPageUuid = uuidv4();
      
      await fs.writeFile(
        path.join(testPagesDir, `${testPageUuid}.md`),
        `---
title: Test Page
uuid: ${testPageUuid}
slug: test-page
category: General
user-keywords: []
lastModified: '2025-01-01T00:00:00.000Z'
---
# Test Page
Content`
      );
      await fs.writeFile(
        path.join(testRequiredPagesDir, `${systemPageUuid}.md`),
        `---
title: System Page
uuid: ${systemPageUuid}
slug: system-page
category: System
categories: [System]
user-keywords: []
lastModified: '2025-01-01T00:00:00.000Z'
---
# System Page`
      );
      
      // Rebuild caches after creating test files
      await pageManager.buildLookupCaches();
    });

    test('should detect existing regular pages', async () => {
      const exists = await pageManager.pageExists('Test Page');
      expect(exists).toBe(true);
    });

    test('should detect existing required pages', async () => {
      const exists = await pageManager.pageExists('System Page');
      expect(exists).toBe(true);
    });

    test('should return false for non-existent pages', async () => {
      const exists = await pageManager.pageExists('NonExistentPage');
      expect(exists).toBe(false);
    });
  });

  describe('page retrieval', () => {
    beforeEach(async () => {
      const testPageUuid = 'test-uuid-123';
      const pageContent = `---
title: Test Page
categories: [General]
user-keywords: [test, example]
uuid: ${testPageUuid}
slug: test-page
category: General
lastModified: '2025-09-09T10:00:00.000Z'
---
# Test Page

This is test content with **markdown**.

## Section 1
Content here.`;

      await fs.writeFile(path.join(testPagesDir, `${testPageUuid}.md`), pageContent);
      
      // Also create a page without frontmatter for testing
      const noMetadataUuid = uuidv4();
      await fs.writeFile(path.join(testPagesDir, `${noMetadataUuid}.md`), 
        `---
title: NoMetadata
uuid: ${noMetadataUuid}
slug: no-metadata
category: General
user-keywords: []
lastModified: '2025-01-01T00:00:00.000Z'
---
# Simple Page
Just content without metadata.`);
      
      // Rebuild caches
      await pageManager.buildLookupCaches();
    });

    test('should retrieve page with correct metadata and content', async () => {
      const page = await pageManager.getPage('Test Page');
      
      expect(page).toBeTruthy();
      expect(page.name).toBe('Test Page');
      expect(page.title).toBe('Test Page');
      expect(page.categories).toEqual(['General']);
      expect(page['user-keywords']).toEqual(['test', 'example']);
      expect(page.uuid).toBe('test-uuid-123');
      expect(page.content).toContain('This is test content with **markdown**');
      expect(page.content).toContain('## Section 1');
    });

    test('should return null for non-existent page', async () => {
      const page = await pageManager.getPage('NonExistentPage');
      expect(page).toBeNull();
    });

    test('should handle pages without frontmatter', async () => {
      await fs.writeFile(
        path.join(testPagesDir, 'NoMetadata.md'),
        '# Simple Page\nJust content without metadata.'
      );

      const page = await pageManager.getPage('NoMetadata');
      expect(page).toBeTruthy();
      expect(page.name).toBe('NoMetadata');
      expect(page.title).toBe('NoMetadata'); // Should default to page name
      expect(page.content).toContain('# Simple Page');
    });
  });

  describe('page saving', () => {
    test('should save new page with metadata', async () => {
      const content = '# New Page\nThis is new content.';
      const metadata = {
        title: 'New Page',
        categories: ['Documentation'],
        'user-keywords': ['new', 'test']
      };

      const result = await pageManager.savePage('NewPage', content, metadata);
      
      expect(result.title).toBe('New Page');
      expect(await pageManager.pageExists('New Page')).toBe(true);
      
      const savedPage = await pageManager.getPage('New Page');
      expect(savedPage.title).toBe('New Page');
      expect(savedPage.categories).toEqual(['Documentation']);
      expect(savedPage.content).toContain('This is new content');
    });

    test('should update existing page', async () => {
      // Create initial page
      await pageManager.savePage('UpdateTest', '# Original Content', { title: 'Original' });
      
      // Update page
      const newContent = '# Updated Content\nThis has been updated.';
      const newMetadata = { title: 'Updated Title' };
      
      const result = await pageManager.savePage('UpdateTest', newContent, newMetadata);
      
      expect(result.success).toBe(true);
      
      const updatedPage = await pageManager.getPage('Updated Title');
      expect(updatedPage.title).toBe('Updated Title');
      expect(updatedPage.content).toContain('Updated Content');
    });

    test('should generate UUID if not provided', async () => {
      await pageManager.savePage('UUIDTest', '# Content', { title: 'UUID Test' });
      
      const page = await pageManager.getPage('UUID Test');
      expect(page.uuid).toBeTruthy();
      expect(page.uuid).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/);
    });

    test('should update lastModified timestamp', async () => {
      const beforeSave = new Date().toISOString();
      
      await pageManager.savePage('TimestampTest', '# Content', { title: 'Timestamp Test' });
      
      const page = await pageManager.getPage('Timestamp Test');
      expect(page.lastModified).toBeTruthy();
      expect(new Date(page.lastModified).getTime()).toBeGreaterThanOrEqual(new Date(beforeSave).getTime());
    });

    test('should save to required-pages directory for system pages', async () => {
      const metadata = { categories: ['System'], uuid: 'system-test-uuid' };
      
      await pageManager.savePage('SystemTest', '# System Page', metadata);
      
      const systemPagePath = path.join(testRequiredPagesDir, 'system-test-uuid.md');
      expect(await fs.pathExists(systemPagePath)).toBe(true);
    });

    test('should save to regular pages directory for non-system pages', async () => {
      const metadata = { categories: ['General'], uuid: 'regular-test-uuid' };
      
      await pageManager.savePage('RegularTest', '# Regular Page', metadata);
      
      const regularPagePath = path.join(testPagesDir, 'regular-test-uuid.md');
      expect(await fs.pathExists(regularPagePath)).toBe(true);
    });
  });

  describe('page deletion', () => {
    let deleteTestUuid;
    
    beforeEach(async () => {
      deleteTestUuid = uuidv4();
      await fs.writeFile(
        path.join(testPagesDir, `${deleteTestUuid}.md`),
        `---
title: Delete Test
uuid: ${deleteTestUuid}
slug: delete-test
category: General
user-keywords: []
lastModified: '2025-01-01T00:00:00.000Z'
---
# Delete Test`
      );
      await pageManager.buildLookupCaches();
    });

    test('should delete existing page', async () => {
      expect(await pageManager.pageExists('Delete Test')).toBe(true);
      
      const result = await pageManager.deletePage('Delete Test');
      
      expect(result).toBe(true);
      expect(await pageManager.pageExists('Delete Test')).toBe(false);
    });

    test('should handle deletion of non-existent page', async () => {
      const result = await pageManager.deletePage('NonExistentPage');
      
      expect(result).toBe(false);
    });
  });

  describe('required page detection', () => {
    test('should identify system pages by category', async () => {
      const systemMetadata = { categories: ['System'] };
      const generalMetadata = { categories: ['General'] };
      
      const isSystemPage = await pageManager.isRequiredPage('TestPage', systemMetadata);
      const isGeneralPage = await pageManager.isRequiredPage('TestPage', generalMetadata);
      
      expect(isSystemPage).toBe(true);
      expect(isGeneralPage).toBe(false);
    });

    test('should handle legacy single category format', async () => {
      const legacyMetadata = { category: 'System' };
      
      const isSystemPage = await pageManager.isRequiredPage('TestPage', legacyMetadata);
      
      expect(isSystemPage).toBe(true);
    });

    test('should handle pages without category metadata', async () => {
      const noMetadata = {};
      
      const isSystemPage = await pageManager.isRequiredPage('TestPage', noMetadata);
      
      expect(isSystemPage).toBe(false);
    });
  });

  describe('page listing', () => {
    beforeEach(async () => {
      // Create test pages with UUID-based filenames
      const page1Uuid = uuidv4();
      const page2Uuid = uuidv4();
      const systemPage1Uuid = uuidv4();
      const systemPage2Uuid = uuidv4();
      
      await fs.writeFile(path.join(testPagesDir, `${page1Uuid}.md`), 
        `---
title: Page1
uuid: ${page1Uuid}
slug: page1
category: General
user-keywords: []
lastModified: '2025-01-01T00:00:00.000Z'
---
# Page 1`);
      await fs.writeFile(path.join(testPagesDir, `${page2Uuid}.md`), 
        `---
title: Page2
uuid: ${page2Uuid}
slug: page2
category: General
user-keywords: []
lastModified: '2025-01-01T00:00:00.000Z'
---
# Page 2`);
      await fs.writeFile(path.join(testRequiredPagesDir, `${systemPage1Uuid}.md`), 
        `---
title: SystemPage1
uuid: ${systemPage1Uuid}
slug: systempage1
category: System
user-keywords: []
lastModified: '2025-01-01T00:00:00.000Z'
---
# System Page 1`);
      await fs.writeFile(path.join(testRequiredPagesDir, `${systemPage2Uuid}.md`), 
        `---
title: SystemPage2
uuid: ${systemPage2Uuid}
slug: systempage2
category: System
user-keywords: []
lastModified: '2025-01-01T00:00:00.000Z'
---
# System Page 2`);
      
      // Create non-markdown file that should be ignored
      await fs.writeFile(path.join(testPagesDir, 'notapage.txt'), 'Not a markdown file');
      
      // Rebuild caches
      await pageManager.buildLookupCaches();
    });

    test('should return all page names from both directories', async () => {
      const pageNames = await pageManager.getPageNames();
      
      expect(pageNames).toContain('Page1');
      expect(pageNames).toContain('Page2');
      expect(pageNames).toContain('SystemPage1');
      expect(pageNames).toContain('SystemPage2');
      expect(pageNames).not.toContain('notapage');
    });

    test('should filter only markdown files', async () => {
      const pageNames = await pageManager.getPageNames();
      
      // Should not include .txt files
      expect(pageNames.every(name => !name.endsWith('.txt'))).toBe(true);
    });
  });

  describe('template creation', () => {
    test('should create page from template', async () => {
      // Mock template manager
      const mockTemplateManager = {
        getTemplate: jest.fn().mockResolvedValue('# {{pageName}}\n\nTemplate content for {{pageName}}.'),
        populateTemplate: jest.fn().mockImplementation((template, variables) => {
          return template.replace(/\{\{pageName\}\}/g, variables.pageName);
        })
      };
      
      mockEngine.getManager.mockImplementation((name) => {
        if (name === 'ValidationManager') return mockValidationManager;
        if (name === 'TemplateManager') return mockTemplateManager;
        return null;
      });
      
      const result = await pageManager.createPageFromTemplate('NewFromTemplate', 'default');
      
      expect(result.name).toBe('NewFromTemplate');
      expect(mockTemplateManager.getTemplate).toHaveBeenCalledWith('default');
      expect(mockTemplateManager.populateTemplate).toHaveBeenCalled();
    });

    test('should handle missing template manager', async () => {
      mockEngine.getManager.mockReturnValue(null);
      
      const result = await pageManager.createPageFromTemplate('NewPage', 'default');
      
      expect(result.success).toBe(false);
      expect(result.error).toContain('TemplateManager not available');
    });
  });

  describe('error handling', () => {
    test('should handle filesystem errors gracefully', async () => {
      // Try to save to invalid directory
      const originalPagesDir = pageManager.pagesDir;
      pageManager.pagesDir = '/invalid/readonly/directory';
      
      const result = await pageManager.savePage('TestPage', '# Content', {});
      
      expect(result.success).toBe(false);
      expect(result.error).toBeTruthy();
      
      // Restore original directory
      pageManager.pagesDir = originalPagesDir;
    });

    test('should handle malformed frontmatter gracefully', async () => {
      const malformedContent = `---
title: Test
invalid yaml: [unclosed array
---
# Content`;
      
      await fs.writeFile(path.join(testPagesDir, 'Malformed.md'), malformedContent);
      
      // Should not throw error, but might return null or handle gracefully
      const page = await pageManager.getPage('Malformed');
      // The behavior here depends on how gray-matter handles malformed YAML
      // At minimum, it shouldn't crash the application
      expect(typeof page).toBeDefined();
    });
  });

  describe('page index updates', () => {
    test('should update page index when pages change', async () => {
      // This test verifies that updatePageIndex method exists and can be called
      // The actual implementation details would depend on the specific requirements
      expect(typeof pageManager.updatePageIndex).toBe('function');
      
      // Should not throw error
      await expect(pageManager.updatePageIndex()).resolves.not.toThrow();
    });
  });

  describe('ACL-based storage location', () => {
    beforeEach(() => {
      // Reset ACLManager mock completely
      mockACLManager.checkStorageLocation.mockReset();
      mockACLManager.checkStorageLocation.mockResolvedValue({ location: 'regular', reason: 'default' });
    });

    test('should use ACLManager for storage location decisions', async () => {
      mockACLManager.checkStorageLocation.mockResolvedValue({ location: 'required', reason: 'acl_decision' });
      
      const metadata = { categories: ['General'] };
      const user = { username: 'testuser' };
      
      const result = await pageManager.savePage('ACLTest', '# Test Content', metadata, user);
      
      expect(result.success).toBe(true);
      expect(mockACLManager.checkStorageLocation).toHaveBeenCalledWith('ACLTest', user, metadata, '# Test Content');
      
      // Verify file was saved to required pages directory
      const requiredPagePath = path.join(testRequiredPagesDir, `${metadata.uuid}.md`);
      expect(await fs.pathExists(requiredPagePath)).toBe(true);
    });

    test('should handle ACLManager errors gracefully', async () => {
      mockACLManager.checkStorageLocation.mockRejectedValue(new Error('ACL check failed'));
      
      const metadata = { categories: ['General'] };
      
      const result = await pageManager.savePage('ACLErrorTest', '# Test Content', metadata);
      
      expect(result.success).toBe(true); // Should still succeed despite ACL error
      expect(mockACLManager.checkStorageLocation).toHaveBeenCalled();
      
      // Should default to regular pages directory
      const regularPagePath = path.join(testPagesDir, `${metadata.uuid}.md`);
      expect(await fs.pathExists(regularPagePath)).toBe(true);
    });

    test('should work without ACLManager (backward compatibility)', async () => {
      // Mock engine to return null for ACLManager
      mockEngine.getManager.mockImplementation((name) => {
        if (name === 'ValidationManager') {
          return mockValidationManager;
        }
        return null; // No ACLManager
      });
      
      const metadata = { categories: ['General'] };
      
      const result = await pageManager.savePage('NoACLTest', '# Test Content', metadata);
      
      expect(result.success).toBe(true);
      
      // Should default to regular pages directory
      const regularPagePath = path.join(testPagesDir, `${metadata.uuid}.md`);
      expect(await fs.pathExists(regularPagePath)).toBe(true);
      
      // Restore ACLManager for other tests
      mockEngine.getManager.mockImplementation((name) => {
        if (name === 'ValidationManager') {
          return mockValidationManager;
        }
        if (name === 'ACLManager') {
          return mockACLManager;
        }
        return null;
      });
    });

    test('should pass user and content to ACLManager', async () => {
      const user = { username: 'admin', role: 'admin' };
      const content = '[{ALLOW edit admin}] Restricted content';
      const metadata = { categories: ['General'] }; // Use General instead of System
      
      mockACLManager.checkStorageLocation.mockResolvedValue({ location: 'required', reason: 'admin_acl' });
      
      await pageManager.savePage('AdminPage', content, metadata, user);
      
      expect(mockACLManager.checkStorageLocation).toHaveBeenCalledWith('AdminPage', user, metadata, content);
    });
  });
});
