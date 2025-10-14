const VersioningFileProvider = require('../VersioningFileProvider');
const fs = require('fs-extra');
const path = require('path');
const os = require('os');
const DeltaStorage = require('../../utils/DeltaStorage');

describe('VersioningFileProvider', () => {
  let testDir;
  let engine;
  let configManager;
  let provider;

  beforeEach(async () => {
    // Create temporary directory for tests
    testDir = path.join(os.tmpdir(), `versioning-provider-test-${Date.now()}`);
    await fs.ensureDir(testDir);

    // Create mock engine and ConfigurationManager
    configManager = {
      getProperty: jest.fn((key, defaultValue) => {
        const config = {
          'amdwiki.page.enabled': true,
          'amdwiki.page.provider.filesystem.storagedir': path.join(testDir, 'pages'),
          'amdwiki.page.provider.filesystem.requiredpagesdir': path.join(testDir, 'required-pages'),
          'amdwiki.page.provider.filesystem.encoding': 'utf-8',
          'amdwiki.page.provider.filesystem.autosave': true,
          'amdwiki.page.provider.versioning.indexfile': path.join(testDir, 'data', 'page-index.json'),
          'amdwiki.page.provider.versioning.maxversions': 50,
          'amdwiki.page.provider.versioning.retentiondays': 365,
          'amdwiki.page.provider.versioning.compression': 'gzip',
          'amdwiki.page.provider.versioning.deltastorage': true
        };
        return config[key] !== undefined ? config[key] : defaultValue;
      })
    };

    engine = {
      getManager: jest.fn((managerName) => {
        if (managerName === 'ConfigurationManager') {
          return configManager;
        }
        return null;
      })
    };

    // Create provider instance
    provider = new VersioningFileProvider(engine);
  });

  afterEach(async () => {
    // Clean up test directory
    if (await fs.pathExists(testDir)) {
      await fs.remove(testDir);
    }
  });

  describe('Initialization', () => {
    test('should initialize successfully', async () => {
      await provider.initialize();

      expect(provider.initialized).toBe(true);
      expect(provider.pageIndexPath).toContain('page-index.json');
      expect(provider.maxVersions).toBe(50);
      expect(provider.retentionDays).toBe(365);
      expect(provider.compressionEnabled).toBe(true);
      expect(provider.deltaStorageEnabled).toBe(true);
    });

    test('should create version directories', async () => {
      await provider.initialize();

      expect(await fs.pathExists(provider.pagesVersionsDir)).toBe(true);
      expect(await fs.pathExists(provider.requiredPagesVersionsDir)).toBe(true);
      expect(provider.pagesVersionsDir).toContain('pages/versions');
      expect(provider.requiredPagesVersionsDir).toContain('required-pages/versions');
    });

    test('should create page-index.json on first run', async () => {
      await provider.initialize();

      expect(await fs.pathExists(provider.pageIndexPath)).toBe(true);

      const indexData = await fs.readFile(provider.pageIndexPath, 'utf8');
      const index = JSON.parse(indexData);

      expect(index.version).toBe('1.0.0');
      expect(index.pageCount).toBe(0);
      expect(index.pages).toEqual({});
    });

    test('should load existing page-index.json', async () => {
      // Create existing index
      const existingIndex = {
        version: '1.0.0',
        lastUpdated: '2025-01-01T00:00:00.000Z',
        pageCount: 2,
        pages: {
          'uuid-1': { title: 'Test Page', uuid: 'uuid-1' }
        }
      };

      const indexPath = path.join(testDir, 'data', 'page-index.json');
      await fs.ensureDir(path.dirname(indexPath));
      await fs.writeFile(indexPath, JSON.stringify(existingIndex), 'utf8');

      await provider.initialize();

      expect(provider.pageIndex.pageCount).toBe(2);
      expect(provider.pageIndex.pages['uuid-1'].title).toBe('Test Page');
    });

    test('should handle corrupted page-index.json', async () => {
      // Initialize provider first to set paths
      await provider.initialize();

      // Create corrupted index
      await fs.writeFile(provider.pageIndexPath, 'invalid json{', 'utf8');

      // Reinitialize - should handle corrupted file
      const provider2 = new VersioningFileProvider(engine);
      await provider2.initialize();

      // Should create new empty index
      expect(provider2.pageIndex.pageCount).toBe(0);
      expect(provider2.pageIndex.pages).toEqual({});
    });

    test('should validate configuration values', async () => {
      configManager.getProperty = jest.fn((key, defaultValue) => {
        if (key === 'amdwiki.page.provider.versioning.maxversions') return -5;
        if (key === 'amdwiki.page.provider.versioning.retentiondays') return 0;
        return defaultValue;
      });

      await provider.initialize();

      // Should use defaults for invalid values
      expect(provider.maxVersions).toBe(50);
      expect(provider.retentionDays).toBe(365);
    });
  });

  describe('Configuration Loading', () => {
    test('should load all versioning configuration', async () => {
      await provider.initialize();

      expect(provider.pageIndexPath).toBeTruthy();
      expect(provider.maxVersions).toBe(50);
      expect(provider.retentionDays).toBe(365);
      expect(provider.compressionEnabled).toBe(true);
      expect(provider.deltaStorageEnabled).toBe(true);
    });

    test('should handle compression setting', async () => {
      configManager.getProperty = jest.fn((key, defaultValue) => {
        if (key === 'amdwiki.page.provider.versioning.compression') return 'none';
        return defaultValue;
      });

      await provider.initialize();

      expect(provider.compressionEnabled).toBe(false);
    });

    test('should handle delta storage disabled', async () => {
      configManager.getProperty = jest.fn((key, defaultValue) => {
        if (key === 'amdwiki.page.provider.versioning.deltastorage') return false;
        return defaultValue;
      });

      await provider.initialize();

      expect(provider.deltaStorageEnabled).toBe(false);
    });
  });

  describe('Provider Information', () => {
    test('should return correct provider info', () => {
      const info = provider.getProviderInfo();

      expect(info.name).toBe('VersioningFileProvider');
      expect(info.version).toBe('1.0.0');
      expect(info.description).toContain('version history');
      expect(info.features).toContain('version-history');
      expect(info.features).toContain('delta-storage');
      expect(info.features).toContain('compression');
      expect(info.features).toContain('page-index');
    });
  });

  describe('Version Creation - New Page', () => {
    test('should create v1 for new page with full content', async () => {
      await provider.initialize();

      const pageName = 'Test Page';
      const content = 'This is the initial content';
      const metadata = { author: 'test-user', uuid: 'test-uuid-1' };

      await provider.savePage(pageName, content, metadata);

      // Check v1 directory exists
      const v1Dir = path.join(provider.pagesVersionsDir, 'test-uuid-1', 'v1');
      expect(await fs.pathExists(v1Dir)).toBe(true);

      // Check content.md exists with full content
      const contentPath = path.join(v1Dir, 'content.md');
      expect(await fs.pathExists(contentPath)).toBe(true);
      const savedContent = await fs.readFile(contentPath, 'utf8');
      expect(savedContent).toBe(content);

      // Check meta.json
      const metaPath = path.join(v1Dir, 'meta.json');
      const metaData = JSON.parse(await fs.readFile(metaPath, 'utf8'));
      expect(metaData.author).toBe('test-user');
      expect(metaData.changeType).toBe('created');
      expect(metaData.isDelta).toBe(false);
      expect(metaData.contentHash).toBe(DeltaStorage.calculateHash(content));
      expect(metaData.contentSize).toBe(Buffer.byteLength(content, 'utf8'));
    });

    test('should create manifest.json for new page', async () => {
      await provider.initialize();

      const pageName = 'Test Page';
      const content = 'Initial content';
      const metadata = { author: 'test-user', uuid: 'test-uuid-2' };

      await provider.savePage(pageName, content, metadata);

      // Check manifest
      const manifestPath = path.join(provider.pagesVersionsDir, 'test-uuid-2', 'manifest.json');
      expect(await fs.pathExists(manifestPath)).toBe(true);

      const manifest = JSON.parse(await fs.readFile(manifestPath, 'utf8'));
      expect(manifest.pageId).toBe('test-uuid-2');
      expect(manifest.pageName).toBe(pageName);
      expect(manifest.currentVersion).toBe(1);
      expect(manifest.versions).toHaveLength(1);
      expect(manifest.versions[0].version).toBe(1);
      expect(manifest.versions[0].changeType).toBe('created');
    });

    test('should update page-index.json for new page', async () => {
      await provider.initialize();

      const pageName = 'Test Page';
      const content = 'Initial content';
      const metadata = { author: 'test-user', uuid: 'test-uuid-3' };

      await provider.savePage(pageName, content, metadata);

      // Check page index
      const indexData = await fs.readFile(provider.pageIndexPath, 'utf8');
      const index = JSON.parse(indexData);

      expect(index.pageCount).toBe(1);
      expect(index.pages['test-uuid-3']).toBeDefined();
      expect(index.pages['test-uuid-3'].title).toBe(pageName);
      expect(index.pages['test-uuid-3'].uuid).toBe('test-uuid-3');
      expect(index.pages['test-uuid-3'].currentVersion).toBe(1);
      expect(index.pages['test-uuid-3'].author).toBe('test-user');
      expect(index.pages['test-uuid-3'].hasVersions).toBe(true);
    });

    test('should call parent savePage', async () => {
      await provider.initialize();

      const pageName = 'Test Page';
      const content = 'Initial content';
      const metadata = { author: 'test-user', uuid: 'test-uuid-4' };

      await provider.savePage(pageName, content, metadata);

      // Parent should have created the actual page file
      const titleSlug = pageName.toLowerCase().replace(/\s+/g, '-');
      const possiblePaths = [
        path.join(provider.pagesDirectory, `${metadata.uuid}.md`),
        path.join(provider.pagesDirectory, `${titleSlug}.md`)
      ];

      const pageExists = (await Promise.all(
        possiblePaths.map(p => fs.pathExists(p))
      )).some(exists => exists);

      expect(pageExists).toBe(true);
    });
  });

  describe('Version Creation - Existing Page', () => {
    test('should create v2 with delta storage', async () => {
      await provider.initialize();

      const pageName = 'Test Page';
      const v1Content = 'This is version 1 content';
      const v2Content = 'This is version 2 content with changes';
      const metadata = { author: 'test-user', uuid: 'test-uuid-5' };

      // Create v1
      await provider.savePage(pageName, v1Content, metadata);

      // Create v2
      await provider.savePage(pageName, v2Content, metadata);

      // Check v2 directory
      const v2Dir = path.join(provider.pagesVersionsDir, 'test-uuid-5', 'v2');
      expect(await fs.pathExists(v2Dir)).toBe(true);

      // Should have content.diff (not content.md) because deltaStorage is enabled
      const diffPath = path.join(v2Dir, 'content.diff');
      expect(await fs.pathExists(diffPath)).toBe(true);

      const contentMdPath = path.join(v2Dir, 'content.md');
      expect(await fs.pathExists(contentMdPath)).toBe(false);

      // Verify diff exists and is valid JSON
      const diffData = JSON.parse(await fs.readFile(diffPath, 'utf8'));
      expect(Array.isArray(diffData)).toBe(true);

      // Note: We can't easily verify reconstruction here because the diff was created
      // from the actual file content which includes frontmatter, not just v1Content
    });

    test('should create multiple versions sequentially', async () => {
      await provider.initialize();

      const pageName = 'Test Page';
      const metadata = { author: 'test-user', uuid: 'test-uuid-6' };

      await provider.savePage(pageName, 'Version 1', metadata);
      await provider.savePage(pageName, 'Version 2', metadata);
      await provider.savePage(pageName, 'Version 3', metadata);

      // Check all version directories exist
      const baseDir = path.join(provider.pagesVersionsDir, 'test-uuid-6');
      expect(await fs.pathExists(path.join(baseDir, 'v1'))).toBe(true);
      expect(await fs.pathExists(path.join(baseDir, 'v2'))).toBe(true);
      expect(await fs.pathExists(path.join(baseDir, 'v3'))).toBe(true);

      // Check manifest
      const manifest = JSON.parse(
        await fs.readFile(path.join(baseDir, 'manifest.json'), 'utf8')
      );
      expect(manifest.currentVersion).toBe(3);
      expect(manifest.versions).toHaveLength(3);
    });

    test('should store full content when deltaStorage disabled', async () => {
      // Disable delta storage
      configManager.getProperty = jest.fn((key, defaultValue) => {
        if (key === 'amdwiki.page.provider.versioning.deltastorage') return false;
        if (key === 'amdwiki.page.provider.filesystem.storagedir') return path.join(testDir, 'pages');
        if (key === 'amdwiki.page.provider.filesystem.requiredpagesdir') return path.join(testDir, 'required-pages');
        if (key === 'amdwiki.page.provider.versioning.indexfile') return path.join(testDir, 'data', 'page-index.json');
        return defaultValue;
      });

      const providerNoDelta = new VersioningFileProvider(engine);
      await providerNoDelta.initialize();

      const pageName = 'Test Page';
      const v1Content = 'Version 1';
      const v2Content = 'Version 2';
      const metadata = { author: 'test-user', uuid: 'test-uuid-7' };

      await providerNoDelta.savePage(pageName, v1Content, metadata);
      await providerNoDelta.savePage(pageName, v2Content, metadata);

      // v2 should have content.md (not content.diff)
      const v2ContentPath = path.join(providerNoDelta.pagesVersionsDir, 'test-uuid-7', 'v2', 'content.md');
      expect(await fs.pathExists(v2ContentPath)).toBe(true);

      const savedContent = await fs.readFile(v2ContentPath, 'utf8');
      expect(savedContent).toBe(v2Content);
    });

    test('should update manifest correctly on each save', async () => {
      await provider.initialize();

      const pageName = 'Test Page';
      const metadata = { author: 'test-user', uuid: 'test-uuid-8' };

      await provider.savePage(pageName, 'V1', metadata);
      await provider.savePage(pageName, 'V2', { ...metadata, comment: 'Second version' });
      await provider.savePage(pageName, 'V3', { ...metadata, comment: 'Third version' });

      const manifestPath = path.join(provider.pagesVersionsDir, 'test-uuid-8', 'manifest.json');
      const manifest = JSON.parse(await fs.readFile(manifestPath, 'utf8'));

      expect(manifest.currentVersion).toBe(3);
      expect(manifest.versions[0].version).toBe(1);
      expect(manifest.versions[0].changeType).toBe('created');
      expect(manifest.versions[1].version).toBe(2);
      expect(manifest.versions[1].comment).toBe('Second version');
      expect(manifest.versions[2].version).toBe(3);
      expect(manifest.versions[2].comment).toBe('Third version');
    });

    test('should update page-index on each save', async () => {
      await provider.initialize();

      const pageName = 'Test Page';
      const metadata = { author: 'user1', uuid: 'test-uuid-9' };

      await provider.savePage(pageName, 'V1', metadata);
      let index = JSON.parse(await fs.readFile(provider.pageIndexPath, 'utf8'));
      expect(index.pages['test-uuid-9'].currentVersion).toBe(1);

      await provider.savePage(pageName, 'V2', { ...metadata, author: 'user2' });
      index = JSON.parse(await fs.readFile(provider.pageIndexPath, 'utf8'));
      expect(index.pages['test-uuid-9'].currentVersion).toBe(2);
      expect(index.pages['test-uuid-9'].author).toBe('user2');

      await provider.savePage(pageName, 'V3', metadata);
      index = JSON.parse(await fs.readFile(provider.pageIndexPath, 'utf8'));
      expect(index.pages['test-uuid-9'].currentVersion).toBe(3);
    });
  });

  describe('Metadata Tracking', () => {
    test('should track author information', async () => {
      await provider.initialize();

      const metadata = {
        author: 'john.doe@example.com',
        uuid: 'test-uuid-10'
      };

      await provider.savePage('Test Page', 'Content', metadata);

      const metaPath = path.join(provider.pagesVersionsDir, 'test-uuid-10', 'v1', 'meta.json');
      const meta = JSON.parse(await fs.readFile(metaPath, 'utf8'));

      expect(meta.author).toBe('john.doe@example.com');
    });

    test('should track timestamps', async () => {
      await provider.initialize();

      const beforeTime = Date.now();
      await provider.savePage('Test Page', 'Content', { uuid: 'test-uuid-11' });
      const afterTime = Date.now();

      const metaPath = path.join(provider.pagesVersionsDir, 'test-uuid-11', 'v1', 'meta.json');
      const meta = JSON.parse(await fs.readFile(metaPath, 'utf8'));

      const createdTime = new Date(meta.dateCreated).getTime();
      expect(createdTime).toBeGreaterThanOrEqual(beforeTime);
      expect(createdTime).toBeLessThanOrEqual(afterTime);
    });

    test('should track content hash', async () => {
      await provider.initialize();

      const content = 'Test content for hashing';
      await provider.savePage('Test Page', content, { uuid: 'test-uuid-12' });

      const metaPath = path.join(provider.pagesVersionsDir, 'test-uuid-12', 'v1', 'meta.json');
      const meta = JSON.parse(await fs.readFile(metaPath, 'utf8'));

      const expectedHash = DeltaStorage.calculateHash(content);
      expect(meta.contentHash).toBe(expectedHash);
    });

    test('should track content size', async () => {
      await provider.initialize();

      const content = 'Test content';
      await provider.savePage('Test Page', content, { uuid: 'test-uuid-13' });

      const metaPath = path.join(provider.pagesVersionsDir, 'test-uuid-13', 'v1', 'meta.json');
      const meta = JSON.parse(await fs.readFile(metaPath, 'utf8'));

      expect(meta.contentSize).toBe(Buffer.byteLength(content, 'utf8'));
    });

    test('should track change type', async () => {
      await provider.initialize();

      const metadata = { uuid: 'test-uuid-14' };

      await provider.savePage('Test', 'V1', metadata);
      let meta = JSON.parse(await fs.readFile(
        path.join(provider.pagesVersionsDir, 'test-uuid-14', 'v1', 'meta.json'),
        'utf8'
      ));
      expect(meta.changeType).toBe('created');

      await provider.savePage('Test', 'V2', metadata);
      meta = JSON.parse(await fs.readFile(
        path.join(provider.pagesVersionsDir, 'test-uuid-14', 'v2', 'meta.json'),
        'utf8'
      ));
      expect(meta.changeType).toBe('updated');
    });

    test('should track custom comments', async () => {
      await provider.initialize();

      const metadata = {
        uuid: 'test-uuid-15',
        comment: 'Fixed typo in introduction'
      };

      await provider.savePage('Test', 'Content', metadata);

      const metaPath = path.join(provider.pagesVersionsDir, 'test-uuid-15', 'v1', 'meta.json');
      const meta = JSON.parse(await fs.readFile(metaPath, 'utf8'));

      expect(meta.comment).toBe('Fixed typo in introduction');
    });
  });

  describe('Error Handling', () => {
    test('should continue with save even if versioning fails', async () => {
      await provider.initialize();

      // Mock fs.writeFile to fail for version files
      const originalWriteFile = fs.writeFile;
      fs.writeFile = jest.fn((filePath, content, encoding) => {
        if (filePath.includes('/versions/')) {
          return Promise.reject(new Error('Disk full'));
        }
        return originalWriteFile(filePath, content, encoding);
      });

      const pageName = 'Test Page';
      const content = 'Content';
      const metadata = { uuid: 'test-uuid-16' };

      // Should not throw
      await expect(provider.savePage(pageName, content, metadata)).resolves.not.toThrow();

      // Restore
      fs.writeFile = originalWriteFile;
    });

    test('should handle missing manifest gracefully', async () => {
      await provider.initialize();

      const pageName = 'Test Page';
      const metadata = { uuid: 'test-uuid-17' };

      // Create v1
      await provider.savePage(pageName, 'V1', metadata);

      // Delete manifest
      const manifestPath = path.join(provider.pagesVersionsDir, 'test-uuid-17', 'manifest.json');
      await fs.remove(manifestPath);

      // Create v2 - should recreate manifest
      await provider.savePage(pageName, 'V2', metadata);

      // Manifest should exist again
      expect(await fs.pathExists(manifestPath)).toBe(true);
    });
  });

  describe('Required Pages', () => {
    test('should store required pages in correct location', async () => {
      // Mock system categories config
      configManager.getProperty = jest.fn((key, defaultValue) => {
        if (key === 'amdwiki.systemCategories') {
          return {
            Navigation: {
              label: 'Navigation',
              storageLocation: 'required'
            }
          };
        }
        if (key === 'amdwiki.page.provider.filesystem.storagedir') return path.join(testDir, 'pages');
        if (key === 'amdwiki.page.provider.filesystem.requiredpagesdir') return path.join(testDir, 'required-pages');
        if (key === 'amdwiki.page.provider.versioning.indexfile') return path.join(testDir, 'data', 'page-index.json');
        return defaultValue;
      });

      const providerWithCategories = new VersioningFileProvider(engine);
      await providerWithCategories.initialize();

      const metadata = {
        uuid: 'test-uuid-18',
        'system-category': 'Navigation'
      };

      await providerWithCategories.savePage('LeftMenu', 'Menu content', metadata);

      // Should be in required-pages versions
      const versionDir = path.join(providerWithCategories.requiredPagesVersionsDir, 'test-uuid-18', 'v1');
      expect(await fs.pathExists(versionDir)).toBe(true);

      // Check page index location
      const index = JSON.parse(await fs.readFile(providerWithCategories.pageIndexPath, 'utf8'));
      expect(index.pages['test-uuid-18'].location).toBe('required-pages');
    });
  });

  describe('Atomic Operations', () => {
    test('should use atomic writes for manifest', async () => {
      await provider.initialize();

      await provider.savePage('Test', 'Content', { uuid: 'test-uuid-19' });

      // Temporary file should not exist after save
      const tempPath = path.join(provider.pagesVersionsDir, 'test-uuid-19', 'manifest.json.tmp');
      expect(await fs.pathExists(tempPath)).toBe(false);

      // Actual file should exist
      const manifestPath = path.join(provider.pagesVersionsDir, 'test-uuid-19', 'manifest.json');
      expect(await fs.pathExists(manifestPath)).toBe(true);
    });

    test('should use atomic writes for page-index', async () => {
      await provider.initialize();

      await provider.savePage('Test', 'Content', { uuid: 'test-uuid-20' });

      // Temporary file should not exist
      const tempPath = `${provider.pageIndexPath}.tmp`;
      expect(await fs.pathExists(tempPath)).toBe(false);

      // Actual file should exist
      expect(await fs.pathExists(provider.pageIndexPath)).toBe(true);
    });
  });

  describe('Integration Scenarios', () => {
    test('should handle realistic wiki editing scenario', async () => {
      await provider.initialize();

      const pageName = 'Product Documentation';
      const metadata = { author: 'tech-writer', uuid: 'doc-uuid-1' };

      // Initial creation
      const v1 = '# Product\n\nInitial documentation';
      await provider.savePage(pageName, v1, metadata);

      // Add features section
      const v2 = '# Product\n\nInitial documentation\n\n## Features\n- Feature 1';
      await provider.savePage(pageName, v2, { ...metadata, author: 'developer1' });

      // Fix typo
      const v3 = '# Product\n\nInitial documentation\n\n## Features\n- Feature One';
      await provider.savePage(pageName, v3, { ...metadata, author: 'developer2', comment: 'Fixed typo' });

      // Verify all versions exist
      const baseDir = path.join(provider.pagesVersionsDir, 'doc-uuid-1');
      expect(await fs.pathExists(path.join(baseDir, 'v1'))).toBe(true);
      expect(await fs.pathExists(path.join(baseDir, 'v2'))).toBe(true);
      expect(await fs.pathExists(path.join(baseDir, 'v3'))).toBe(true);

      // Verify manifest tracking
      const manifest = JSON.parse(await fs.readFile(path.join(baseDir, 'manifest.json'), 'utf8'));
      expect(manifest.currentVersion).toBe(3);
      expect(manifest.versions[0].author).toBe('tech-writer');
      expect(manifest.versions[1].author).toBe('developer1');
      expect(manifest.versions[2].author).toBe('developer2');
      expect(manifest.versions[2].comment).toBe('Fixed typo');

      // Verify v1 is full content
      const v1Content = await fs.readFile(path.join(baseDir, 'v1', 'content.md'), 'utf8');
      expect(v1Content).toBe(v1);

      // Verify v2 and v3 are diffs
      expect(await fs.pathExists(path.join(baseDir, 'v2', 'content.diff'))).toBe(true);
      expect(await fs.pathExists(path.join(baseDir, 'v3', 'content.diff'))).toBe(true);

      // Verify page index
      const index = JSON.parse(await fs.readFile(provider.pageIndexPath, 'utf8'));
      expect(index.pages['doc-uuid-1'].currentVersion).toBe(3);
      expect(index.pages['doc-uuid-1'].author).toBe('developer2');
    });
  });
});
