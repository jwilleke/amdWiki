const ValidationManager = require('../ValidationManager');
const { v4: uuidv4 } = require('uuid');

describe('ValidationManager', () => {
  let validationManager;
  let mockEngine;

  beforeEach(() => {
    mockEngine = {
      getManager: jest.fn()
    };
    validationManager = new ValidationManager(mockEngine);
  });

  describe('validateFilename', () => {
    test('should validate UUID-based filenames', () => {
      const validUuid = uuidv4();
      const result = validationManager.validateFilename(`${validUuid}.md`);
      
      expect(result.success).toBe(true);
      expect(result.error).toBeNull();
    });

    test('should reject non-UUID filenames', () => {
      const result = validationManager.validateFilename('regular-filename.md');
      
      expect(result.success).toBe(false);
      expect(result.error).toContain('does not follow UUID naming convention');
    });

    test('should reject files without .md extension', () => {
      const validUuid = uuidv4();
      const result = validationManager.validateFilename(`${validUuid}.txt`);
      
      expect(result.success).toBe(false);
      expect(result.error).toContain('must have .md extension');
    });

    test('should reject invalid UUID format', () => {
      const result = validationManager.validateFilename('invalid-uuid-format.md');
      
      expect(result.success).toBe(false);
      expect(result.error).toContain('does not follow UUID naming convention');
    });
  });

  describe('validateMetadata', () => {
    test('should validate complete metadata', () => {
      const validMetadata = {
        title: 'Test Page',
        uuid: uuidv4(),
        slug: 'test-page',
        category: 'General',
        'user-keywords': ['test', 'example'],
        lastModified: new Date().toISOString()
      };

      const result = validationManager.validateMetadata(validMetadata);
      
      expect(result.success).toBe(true);
      expect(result.error).toBeNull();
    });

    test('should reject metadata missing required fields', () => {
      const incompleteMetadata = {
        title: 'Test Page'
        // Missing uuid, slug, category, user-keywords, lastModified
      };

      const result = validationManager.validateMetadata(incompleteMetadata);
      
      expect(result.success).toBe(false);
      expect(result.error).toContain('Required metadata field');
    });

    test('should reject invalid UUID', () => {
      const metadata = {
        title: 'Test Page',
        uuid: 'invalid-uuid',
        slug: 'test-page',
        category: 'General',
        'user-keywords': [],
        lastModified: new Date().toISOString()
      };

      const result = validationManager.validateMetadata(metadata);
      
      expect(result.success).toBe(false);
      expect(result.error).toContain('uuid must be a valid RFC 4122 UUID v4');
    });

    test('should reject invalid slug format', () => {
      const metadata = {
        title: 'Test Page',
        uuid: uuidv4(),
        slug: 'Invalid Slug With Spaces',
        category: 'General',
        'user-keywords': [],
        lastModified: new Date().toISOString()
      };

      const result = validationManager.validateMetadata(metadata);
      
      expect(result.success).toBe(false);
      expect(result.error).toContain('slug must be a URL-safe string');
    });

    test('should validate user keywords array', () => {
      const metadata = {
        title: 'Test Page',
        uuid: uuidv4(),
        slug: 'test-page',
        category: 'General',
        'user-keywords': ['valid', 'keywords'],
        lastModified: new Date().toISOString()
      };

      const result = validationManager.validateMetadata(metadata);
      
      expect(result.success).toBe(true);
    });

    test('should reject too many user keywords', () => {
      validationManager.maxUserKeywords = 3;
      
      const metadata = {
        title: 'Test Page',
        uuid: uuidv4(),
        slug: 'test-page',
        category: 'General',
        'user-keywords': ['one', 'two', 'three', 'four'], // Too many
        lastModified: new Date().toISOString()
      };

      const result = validationManager.validateMetadata(metadata);
      
      expect(result.success).toBe(false);
      expect(result.error).toContain('Maximum 3 user keywords allowed');
    });

    test('should warn about non-standard categories', () => {
      const metadata = {
        title: 'Test Page',
        uuid: uuidv4(),
        slug: 'test-page',
        category: 'NonStandardCategory',
        'user-keywords': [],
        lastModified: new Date().toISOString()
      };

      const result = validationManager.validateMetadata(metadata);
      
      expect(result.success).toBe(true);
      expect(result.warnings).toContainEqual(expect.stringContaining('is not in the standard list'));
    });
  });

  describe('validatePage', () => {
    test('should validate complete page with matching UUID', () => {
      const uuid = uuidv4();
      const filename = `${uuid}.md`;
      const metadata = {
        title: 'Test Page',
        uuid: uuid,
        slug: 'test-page',
        category: 'General',
        'user-keywords': [],
        lastModified: new Date().toISOString()
      };
      const content = '# Test Page\n\nThis is test content.';

      const result = validationManager.validatePage(filename, metadata, content);
      
      expect(result.success).toBe(true);
      expect(result.filenameValid).toBe(true);
      expect(result.metadataValid).toBe(true);
    });

    test('should reject page with UUID mismatch', () => {
      const filenameUuid = uuidv4();
      const metadataUuid = uuidv4();
      const filename = `${filenameUuid}.md`;
      const metadata = {
        title: 'Test Page',
        uuid: metadataUuid,
        slug: 'test-page',
        category: 'General',
        'user-keywords': [],
        lastModified: new Date().toISOString()
      };

      const result = validationManager.validatePage(filename, metadata);
      
      expect(result.success).toBe(false);
      expect(result.error).toContain('UUID mismatch');
    });
  });

  describe('generateValidMetadata', () => {
    test('should generate complete metadata with UUID', () => {
      const title = 'Test Page';
      const result = validationManager.generateValidMetadata(title);
      
      expect(result.title).toBe(title);
      expect(result.uuid).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i);
      expect(result.slug).toBe('test-page');
      expect(result.category).toBe('General');
      expect(Array.isArray(result['user-keywords'])).toBe(true);
      expect(result.lastModified).toBeDefined();
    });

    test('should use provided options', () => {
      const title = 'Test Page';
      const options = {
        category: 'Documentation',
        'user-keywords': ['test'],
        uuid: uuidv4()
      };
      
      const result = validationManager.generateValidMetadata(title, options);
      
      expect(result.category).toBe('Documentation');
      expect(result['user-keywords']).toEqual(['test']);
      expect(result.uuid).toBe(options.uuid);
    });
  });

  describe('generateSlug', () => {
    test('should create URL-safe slugs', () => {
      expect(validationManager.generateSlug('Test Page')).toBe('test-page');
      expect(validationManager.generateSlug('Multiple   Spaces')).toBe('multiple-spaces');
      expect(validationManager.generateSlug('Special@#$Characters')).toBe('special-characters');
      expect(validationManager.generateSlug('  Leading and Trailing  ')).toBe('leading-and-trailing');
    });
  });

  describe('generateFilename', () => {
    test('should generate UUID-based filename', () => {
      const uuid = uuidv4();
      const metadata = { uuid };
      
      const result = validationManager.generateFilename(metadata);
      
      expect(result).toBe(`${uuid}.md`);
    });

    test('should throw error for missing UUID', () => {
      const metadata = { title: 'Test' };
      
      expect(() => {
        validationManager.generateFilename(metadata);
      }).toThrow('UUID is required to generate filename');
    });
  });

  describe('generateFixSuggestions', () => {
    test('should suggest fixes for incomplete metadata', () => {
      const filename = 'old-filename.md';
      const metadata = {
        title: 'Test Page'
        // Missing other required fields
      };

      const fixes = validationManager.generateFixSuggestions(filename, metadata);
      
      expect(fixes.metadata.uuid).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i);
      expect(fixes.metadata.slug).toBe('test-page');
      expect(fixes.metadata.category).toBe('General');
      expect(Array.isArray(fixes.metadata['user-keywords'])).toBe(true);
      expect(fixes.metadata.lastModified).toBeDefined();
      expect(fixes.filename).toBe(`${fixes.metadata.uuid}.md`);
    });

    test('should preserve existing valid metadata', () => {
      const uuid = uuidv4();
      const filename = `${uuid}.md`;
      const metadata = {
        title: 'Test Page',
        uuid: uuid,
        slug: 'test-page',
        category: 'General',
        'user-keywords': ['test'],
        lastModified: '2025-01-01T00:00:00.000Z'
      };

      const fixes = validationManager.generateFixSuggestions(filename, metadata);
      
      expect(fixes.metadata).toEqual(metadata);
      expect(fixes.filename).toBeNull(); // No filename change needed
    });
  });
});
