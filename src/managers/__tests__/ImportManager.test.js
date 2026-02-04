/**
 * Tests for ImportManager
 */

const path = require('path');
const fs = require('fs-extra');
const ImportManager = require('../ImportManager');

// Mock AttachmentManager
const mockUploadAttachment = jest.fn().mockResolvedValue({ identifier: 'abc123' });

// Mock WikiEngine
const mockEngine = {
  getManager: jest.fn((name) => {
    if (name === 'AttachmentManager') {
      return { uploadAttachment: mockUploadAttachment };
    }
    return { getProperty: jest.fn().mockReturnValue('./data/pages') };
  })
};

// Mock converter for testing
class MockConverter {
  constructor() {
    this.formatId = 'mock';
    this.formatName = 'Mock Format';
    this.fileExtensions = ['.mock'];
  }

  convert(content) {
    return {
      content: `CONVERTED: ${content}`,
      metadata: { title: 'Mock Title' },
      warnings: []
    };
  }

  canHandle(content, filename) {
    return filename.endsWith('.mock') || content.includes('MOCK_MARKER');
  }
}

describe('ImportManager', () => {
  let importManager;
  let testDir;

  beforeEach(async () => {
    importManager = new ImportManager(mockEngine);
    await importManager.initialize();
    mockUploadAttachment.mockClear();

    // Create temp test directory
    testDir = path.join('/tmp', `import-test-${Date.now()}`);
    await fs.ensureDir(testDir);
  });

  afterEach(async () => {
    await importManager.shutdown();

    // Cleanup test directory
    if (await fs.pathExists(testDir)) {
      await fs.remove(testDir);
    }
  });

  describe('initialization', () => {
    it('should register JSPWikiConverter by default', () => {
      const formats = importManager.getAvailableFormats();
      expect(formats).toContain('jspwiki');
    });

    it('should be initialized after initialize()', () => {
      expect(importManager.isInitialized()).toBe(true);
    });
  });

  describe('converter registry', () => {
    it('should register custom converters', () => {
      importManager.registerConverter(new MockConverter());
      expect(importManager.getAvailableFormats()).toContain('mock');
    });

    it('should get converter by format ID', () => {
      importManager.registerConverter(new MockConverter());
      const converter = importManager.getConverter('mock');
      expect(converter).toBeDefined();
      expect(converter.formatId).toBe('mock');
    });

    it('should return undefined for unknown format', () => {
      const converter = importManager.getConverter('unknown');
      expect(converter).toBeUndefined();
    });

    it('should get converter info for all registered converters', () => {
      importManager.registerConverter(new MockConverter());
      const info = importManager.getConverterInfo();

      expect(info.length).toBeGreaterThanOrEqual(2); // jspwiki + mock
      expect(info.some(i => i.formatId === 'jspwiki')).toBe(true);
      expect(info.some(i => i.formatId === 'mock')).toBe(true);
    });
  });

  describe('format detection', () => {
    beforeEach(() => {
      importManager.registerConverter(new MockConverter());
    });

    it('should detect format from filename extension', () => {
      const format = importManager.detectFormat('any content', 'file.mock');
      expect(format).toBe('mock');
    });

    it('should detect format from content', () => {
      const format = importManager.detectFormat('MOCK_MARKER here', 'file.unknown');
      expect(format).toBe('mock');
    });

    it('should detect JSPWiki format', () => {
      const format = importManager.detectFormat('!!! Heading', 'page.txt');
      expect(format).toBe('jspwiki');
    });

    it('should return null for unknown format', () => {
      const format = importManager.detectFormat('plain text', 'file.xyz');
      expect(format).toBeNull();
    });
  });

  describe('importSinglePage', () => {
    beforeEach(() => {
      importManager.registerConverter(new MockConverter());
    });

    it('should convert a single file', async () => {
      // Create test file
      const sourceFile = path.join(testDir, 'test.mock');
      await fs.writeFile(sourceFile, 'Original content');

      const targetDir = path.join(testDir, 'output');

      const result = await importManager.importSinglePage(sourceFile, {
        sourceDir: testDir,
        targetDir,
        format: 'mock',
        dryRun: true
      });

      expect(result).not.toBeNull();
      expect(result.format).toBe('mock');
      expect(result.written).toBe(false); // dry run
    });

    it('should skip files with no matching converter', async () => {
      const sourceFile = path.join(testDir, 'unknown.xyz');
      await fs.writeFile(sourceFile, 'Unknown content');

      const result = await importManager.importSinglePage(sourceFile, {
        sourceDir: testDir,
        format: 'auto'
      });

      expect(result).toBeNull();
    });

    it('should auto-detect format when format is "auto"', async () => {
      const sourceFile = path.join(testDir, 'test.mock');
      await fs.writeFile(sourceFile, 'Content');

      const result = await importManager.importSinglePage(sourceFile, {
        sourceDir: testDir,
        format: 'auto',
        dryRun: true
      });

      expect(result.format).toBe('mock');
    });
  });

  describe('importPages', () => {
    beforeEach(async () => {
      importManager.registerConverter(new MockConverter());

      // Create test files
      await fs.writeFile(path.join(testDir, 'page1.mock'), 'Content 1');
      await fs.writeFile(path.join(testDir, 'page2.mock'), 'Content 2');
      await fs.writeFile(path.join(testDir, 'ignored.xyz'), 'Ignored');
    });

    it('should import multiple files', async () => {
      const targetDir = path.join(testDir, 'output');

      const result = await importManager.importPages({
        sourceDir: testDir,
        targetDir,
        format: 'mock',
        dryRun: true
      });

      expect(result.success).toBe(true);
      expect(result.converted).toBe(2);
      expect(result.files.length).toBe(2);
    });

    it('should respect limit option', async () => {
      const result = await importManager.importPages({
        sourceDir: testDir,
        format: 'mock',
        limit: 1,
        dryRun: true
      });

      expect(result.converted).toBe(1);
    });

    it('should respect offset option', async () => {
      const result = await importManager.importPages({
        sourceDir: testDir,
        format: 'mock',
        offset: 1,
        dryRun: true
      });

      expect(result.converted).toBe(1);
    });

    it('should return error for non-existent directory', async () => {
      const result = await importManager.importPages({
        sourceDir: '/non/existent/path',
        dryRun: true
      });

      expect(result.success).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('should process subdirectories recursively', async () => {
      // Create subdirectory with files
      const subDir = path.join(testDir, 'subdir');
      await fs.ensureDir(subDir);
      await fs.writeFile(path.join(subDir, 'nested.mock'), 'Nested content');

      const result = await importManager.importPages({
        sourceDir: testDir,
        format: 'mock',
        dryRun: true
      });

      expect(result.converted).toBe(3); // 2 in root + 1 in subdir
    });
  });

  describe('previewImport', () => {
    it('should always be a dry run', async () => {
      await fs.writeFile(path.join(testDir, 'test.mock'), 'Content');
      importManager.registerConverter(new MockConverter());

      const result = await importManager.previewImport({
        sourceDir: testDir,
        format: 'mock',
        dryRun: false // Should be overridden
      });

      expect(result.files.every(f => f.written === false)).toBe(true);
    });
  });

  describe('backup and restore', () => {
    it('should backup registered formats', async () => {
      importManager.registerConverter(new MockConverter());
      const backup = await importManager.backup();

      expect(backup.managerName).toBe('ImportManager');
      expect(backup.data.registeredFormats).toContain('jspwiki');
      expect(backup.data.registeredFormats).toContain('mock');
    });
  });

  describe('JSPWiki attachment import', () => {
    it('should import attachments from -att/ directory', async () => {
      // Create JSPWiki page with attachment structure
      const sourceFile = path.join(testDir, 'Test+Page.txt');
      await fs.writeFile(sourceFile, '!!! Test Page\nSome content');

      // Create -att/ directory structure
      const attDir = path.join(testDir, 'Test+Page-att');
      const fileDir = path.join(attDir, 'photo.jpg-dir');
      await fs.ensureDir(fileDir);
      await fs.writeFile(path.join(fileDir, '1.jpg'), Buffer.from('fake-jpg-data'));
      await fs.writeFile(
        path.join(fileDir, 'attachment.properties'),
        'author=JimUser\ndate=2024-01-01'
      );

      const targetDir = path.join(testDir, 'output');

      const result = await importManager.importSinglePage(sourceFile, {
        sourceDir: testDir,
        targetDir,
        format: 'jspwiki',
        dryRun: false
      });

      expect(result).not.toBeNull();
      expect(result.attachments).toBeDefined();
      expect(result.attachments.imported).toBe(1);
      expect(result.attachments.errors.length).toBe(0);
      expect(mockUploadAttachment).toHaveBeenCalledWith(
        expect.any(Buffer),
        expect.objectContaining({
          originalName: 'photo.jpg',
          mimeType: 'image/jpeg'
        }),
        expect.objectContaining({
          pageName: 'Test Page',
          description: 'photo.jpg'
        })
      );
    });

    it('should pick the latest version file', async () => {
      const sourceFile = path.join(testDir, 'VersionTest.txt');
      await fs.writeFile(sourceFile, '!!! Version Test');

      const attDir = path.join(testDir, 'VersionTest-att');
      const fileDir = path.join(attDir, 'doc.pdf-dir');
      await fs.ensureDir(fileDir);
      await fs.writeFile(path.join(fileDir, '1.pdf'), Buffer.from('version1'));
      await fs.writeFile(path.join(fileDir, '3.pdf'), Buffer.from('version3-latest'));
      await fs.writeFile(path.join(fileDir, '2.pdf'), Buffer.from('version2'));

      const targetDir = path.join(testDir, 'output');

      await importManager.importSinglePage(sourceFile, {
        sourceDir: testDir,
        targetDir,
        format: 'jspwiki',
        dryRun: false
      });

      // The uploaded buffer should be the version 3 content
      const uploadedBuffer = mockUploadAttachment.mock.calls[
        mockUploadAttachment.mock.calls.length - 1
      ][0];
      expect(uploadedBuffer.toString()).toBe('version3-latest');
    });

    it('should count attachments in dry-run without uploading', async () => {
      const sourceFile = path.join(testDir, 'DryRun.txt');
      await fs.writeFile(sourceFile, '!!! Dry Run');

      const attDir = path.join(testDir, 'DryRun-att');
      const fileDir = path.join(attDir, 'image.png-dir');
      await fs.ensureDir(fileDir);
      await fs.writeFile(path.join(fileDir, '1.png'), Buffer.from('fake-png'));

      mockUploadAttachment.mockClear();

      const result = await importManager.importSinglePage(sourceFile, {
        sourceDir: testDir,
        format: 'jspwiki',
        dryRun: true
      });

      expect(result.attachments).toBeDefined();
      expect(result.attachments.imported).toBe(1);
      expect(mockUploadAttachment).not.toHaveBeenCalled();
    });

    it('should handle pages without attachments gracefully', async () => {
      const sourceFile = path.join(testDir, 'NoAttach.txt');
      await fs.writeFile(sourceFile, '!!! No Attachments');

      const result = await importManager.importSinglePage(sourceFile, {
        sourceDir: testDir,
        format: 'jspwiki',
        dryRun: true
      });

      expect(result.attachments).toBeDefined();
      expect(result.attachments.imported).toBe(0);
      expect(result.attachments.errors.length).toBe(0);
    });
  });

  describe('JSPWiki page name decoding', () => {
    it('should decode + as space in page names', async () => {
      const sourceFile = path.join(testDir, 'Action+potential.txt');
      await fs.writeFile(sourceFile, 'Content about action potentials');

      const result = await importManager.importSinglePage(sourceFile, {
        sourceDir: testDir,
        format: 'jspwiki',
        dryRun: true
      });

      expect(result.metadata['title']).toBe('Action potential');
    });

    it('should decode percent-encoded characters in page names', async () => {
      const sourceFile = path.join(testDir, '%CE%92-Hydroxybutyric+acid.txt');
      await fs.writeFile(sourceFile, 'Content about beta-hydroxybutyric acid');

      const result = await importManager.importSinglePage(sourceFile, {
        sourceDir: testDir,
        format: 'jspwiki',
        dryRun: true
      });

      expect(result.metadata['title']).toBe('\u0392-Hydroxybutyric acid');
    });
  });

  describe('JSPWiki conversion integration', () => {
    it('should convert JSPWiki files correctly', async () => {
      const jspwikiContent = `!!! My Page Title

This is __bold__ and ''italic'' text.

* Item 1
* Item 2

See [OtherPage] for more.`;

      const sourceFile = path.join(testDir, 'wiki.txt');
      await fs.writeFile(sourceFile, jspwikiContent);

      const result = await importManager.importSinglePage(sourceFile, {
        sourceDir: testDir,
        format: 'jspwiki',
        dryRun: true
      });

      expect(result).not.toBeNull();
      expect(result.format).toBe('jspwiki');
      expect(result.warnings).toBeDefined();
    });
  });

  describe('frontmatter defaults', () => {
    it('should include slug, system-category, user-keywords, lastModified in frontmatter', async () => {
      const content = `!!! Year\nSome content`;
      const sourceFile = path.join(testDir, 'Year.txt');
      await fs.writeFile(sourceFile, content);

      // Write to a real file to inspect frontmatter
      const targetDir = path.join(testDir, 'output');
      await fs.ensureDir(targetDir);

      const result = await importManager.importSinglePage(sourceFile, {
        sourceDir: testDir,
        targetDir,
        format: 'jspwiki',
        dryRun: false
      });

      expect(result).not.toBeNull();
      expect(result.written).toBe(true);

      // Read the written file and verify frontmatter
      const written = await fs.readFile(result.targetPath, 'utf-8');
      expect(written).toContain('slug:');
      expect(written).toContain('system-category:');
      expect(written).toContain('user-keywords:');
      expect(written).toContain('lastModified:');
      expect(written).toContain('importedFrom: jspwiki');
    });

    it('should use ValidationManager defaults when available', async () => {
      // Create a manager with a mock ValidationManager
      const mockValidationEngine = {
        getManager: jest.fn((name) => {
          if (name === 'ValidationManager') {
            return {
              generateValidMetadata: jest.fn((title, opts) => ({
                title,
                uuid: opts.uuid || 'test-uuid',
                slug: title.toLowerCase().replace(/\s+/g, '-'),
                'system-category': 'general',
                'user-keywords': [],
                lastModified: '2026-02-04T00:00:00.000Z'
              }))
            };
          }
          if (name === 'AttachmentManager') {
            return { uploadAttachment: jest.fn().mockResolvedValue({ identifier: 'abc' }) };
          }
          return { getProperty: jest.fn().mockReturnValue('./data/pages') };
        })
      };

      const mgr = new ImportManager(mockValidationEngine);
      await mgr.initialize();

      const content = `!!! Test Page\nBody text`;
      const sourceFile = path.join(testDir, 'TestPage.txt');
      await fs.writeFile(sourceFile, content);

      const targetDir = path.join(testDir, 'output2');
      await fs.ensureDir(targetDir);

      const result = await mgr.importSinglePage(sourceFile, {
        sourceDir: testDir,
        targetDir,
        format: 'jspwiki',
        dryRun: false
      });

      expect(result).not.toBeNull();
      const written = await fs.readFile(result.targetPath, 'utf-8');
      expect(written).toContain('system-category: general');
      expect(written).toContain('slug: testpage');

      await mgr.shutdown();
    });
  });
});
