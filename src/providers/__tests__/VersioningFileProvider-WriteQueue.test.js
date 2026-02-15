/**
 * @file VersioningFileProvider-WriteQueue.test.js
 * @description Tests for the page-index.json write queue that prevents
 * concurrent write race conditions in savePageIndex().
 *
 * Background: When multiple pages are saved simultaneously (e.g., during
 * parallel E2E tests), the atomic write pattern (write .tmp, rename) can
 * fail with ENOENT if two writes share the same temp file. The write queue
 * serializes saves and uses unique temp file names.
 */

const fs = require('fs-extra');
const path = require('path');
const os = require('os');

// Require from dist/ to get compiled JS where private methods are accessible
const VersioningFileProvider = require('../../../dist/src/providers/VersioningFileProvider');

describe('VersioningFileProvider - Write Queue', () => {
  let testDir;
  let indexPath;
  let provider;

  beforeEach(async () => {
    testDir = path.join(os.tmpdir(), `write-queue-test-${Date.now()}`);
    await fs.ensureDir(path.join(testDir, 'pages'));
    await fs.ensureDir(path.join(testDir, 'required-pages'));
    await fs.ensureDir(path.join(testDir, 'data'));

    indexPath = path.join(testDir, 'data', 'page-index.json');

    const configManager = {
      getProperty: jest.fn((key, defaultValue) => {
        const config = {
          'amdwiki.page.enabled': true,
          'amdwiki.page.provider.filesystem.storagedir': path.join(testDir, 'pages'),
          'amdwiki.page.provider.filesystem.requiredpagesdir': path.join(testDir, 'required-pages'),
          'amdwiki.page.provider.filesystem.encoding': 'utf-8',
          'amdwiki.page.provider.filesystem.autosave': true,
          'amdwiki.page.provider.filesystem.pluralmatching': false,
          'amdwiki.page.provider.versioning.indexfile': indexPath,
          'amdwiki.page.provider.versioning.maxversions': 50,
          'amdwiki.page.provider.versioning.retentiondays': 365,
          'amdwiki.page.provider.versioning.compression': 'gzip',
          'amdwiki.page.provider.versioning.deltastorage': true,
          'amdwiki.page.provider.versioning.checkpointinterval': 10
        };
        return config[key] !== undefined ? config[key] : defaultValue;
      }),
      getResolvedDataPath: jest.fn((key, defaultValue) => {
        if (key === 'amdwiki.page.provider.versioning.indexfile') {
          return indexPath;
        }
        return defaultValue;
      })
    };

    const engine = {
      getManager: jest.fn((name) => {
        if (name === 'ConfigurationManager') return configManager;
        if (name === 'CacheManager') return { get: jest.fn(), set: jest.fn(), delete: jest.fn() };
        return null;
      }),
      config: {}
    };

    provider = new VersioningFileProvider(engine);

    // Manually set up the internal state needed for savePageIndex
    // Access private fields via bracket notation for testing
    provider['pageIndexPath'] = indexPath;
    provider['pageIndex'] = {
      version: '1.0.0',
      lastUpdated: new Date().toISOString(),
      pageCount: 0,
      pages: {}
    };
    provider['pageIndexWriteQueue'] = Promise.resolve();
  });

  afterEach(async () => {
    await fs.remove(testDir);
  });

  test('savePageIndex writes index to disk', async () => {
    // Call the private method
    await provider['savePageIndex']();

    const written = await fs.readJson(indexPath);
    expect(written.version).toBe('1.0.0');
    expect(written.pageCount).toBe(0);
    expect(written.pages).toEqual({});
    expect(written.lastUpdated).toBeDefined();
  });

  test('savePageIndex serializes concurrent writes without errors', async () => {
    // Simulate 10 concurrent saves (like parallel E2E tests creating pages)
    const promises = [];
    for (let i = 0; i < 10; i++) {
      provider['pageIndex'].pages[`uuid-${i}`] = {
        title: `Page ${i}`,
        uuid: `uuid-${i}`,
        currentVersion: 1,
        location: 'pages',
        lastModified: new Date().toISOString(),
        editor: 'test',
        hasVersions: true
      };
      provider['pageIndex'].pageCount = i + 1;
      promises.push(provider['savePageIndex']());
    }

    // All should resolve without ENOENT or other errors
    await expect(Promise.all(promises)).resolves.toBeDefined();

    // Final state on disk should have all 10 pages
    const written = await fs.readJson(indexPath);
    expect(written.pageCount).toBe(10);
    expect(Object.keys(written.pages)).toHaveLength(10);
  });

  test('concurrent saves do not leave stale temp files', async () => {
    const promises = [];
    for (let i = 0; i < 5; i++) {
      provider['pageIndex'].pages[`uuid-${i}`] = {
        title: `Page ${i}`,
        uuid: `uuid-${i}`,
        currentVersion: 1,
        location: 'pages',
        lastModified: new Date().toISOString(),
        editor: 'test',
        hasVersions: true
      };
      promises.push(provider['savePageIndex']());
    }

    await Promise.all(promises);

    // Check that no .tmp files are left behind
    const dataDir = path.dirname(indexPath);
    const files = await fs.readdir(dataDir);
    const tmpFiles = files.filter(f => f.includes('.tmp'));
    expect(tmpFiles).toHaveLength(0);
  });

  test('concurrent saves produce correct final state', async () => {
    // Fire 3 saves concurrently with different data
    provider['pageIndex'].pages['a'] = { title: 'A', uuid: 'a', currentVersion: 1, location: 'pages', lastModified: new Date().toISOString(), editor: 'test', hasVersions: true };
    provider['pageIndex'].pageCount = 1;
    const p1 = provider['savePageIndex']();

    provider['pageIndex'].pages['b'] = { title: 'B', uuid: 'b', currentVersion: 1, location: 'pages', lastModified: new Date().toISOString(), editor: 'test', hasVersions: true };
    provider['pageIndex'].pageCount = 2;
    const p2 = provider['savePageIndex']();

    provider['pageIndex'].pages['c'] = { title: 'C', uuid: 'c', currentVersion: 1, location: 'pages', lastModified: new Date().toISOString(), editor: 'test', hasVersions: true };
    provider['pageIndex'].pageCount = 3;
    const p3 = provider['savePageIndex']();

    // All should resolve without errors
    await Promise.all([p1, p2, p3]);

    // The final file should be valid JSON with the last-written state
    const written = await fs.readJson(indexPath);
    expect(written.pageCount).toBe(3);
    expect(Object.keys(written.pages)).toHaveLength(3);
  });

  test('updatePageInIndex triggers serialized save', async () => {
    await provider['updatePageInIndex']('test-uuid', {
      title: 'Test Page',
      uuid: 'test-uuid',
      currentVersion: 1,
      location: 'pages',
      lastModified: new Date().toISOString(),
      editor: 'test',
      hasVersions: true
    });

    const written = await fs.readJson(indexPath);
    expect(written.pages['test-uuid']).toBeDefined();
    expect(written.pages['test-uuid'].title).toBe('Test Page');
    expect(written.pageCount).toBe(1);
  });

  test('removePageFromIndex triggers serialized save', async () => {
    // First add a page
    provider['pageIndex'].pages['to-remove'] = {
      title: 'Remove Me',
      uuid: 'to-remove',
      currentVersion: 1,
      location: 'pages',
      lastModified: new Date().toISOString(),
      editor: 'test',
      hasVersions: true
    };
    provider['pageIndex'].pageCount = 1;
    await provider['savePageIndex']();

    // Now remove it
    await provider['removePageFromIndex']('to-remove');

    const written = await fs.readJson(indexPath);
    expect(written.pages['to-remove']).toBeUndefined();
    expect(written.pageCount).toBe(0);
  });

  test('savePageIndex throws if page index not initialized', async () => {
    provider['pageIndex'] = null;
    await expect(async () => provider['savePageIndex']()).rejects.toThrow('Page index not initialized');
  });

  test('savePageIndex throws if pageIndexPath not set', async () => {
    provider['pageIndexPath'] = null;
    await expect(async () => provider['savePageIndex']()).rejects.toThrow('Page index not initialized');
  });
});
