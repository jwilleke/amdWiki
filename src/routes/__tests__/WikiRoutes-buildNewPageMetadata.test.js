/**
 * WikiRoutes.buildNewPageMetadata() tests
 *
 * Tests the buildNewPageMetadata() helper that provides a single source
 * of truth for page creation metadata (Issue #234).
 *
 * The helper:
 * - Delegates to ValidationManager.generateValidMetadata() when available
 * - Falls back to ConfigurationManager for defaults
 * - Filters undefined/null options so defaults apply
 * - Ensures all required fields are populated
 *
 * @jest-environment node
 */

const { describe, test, expect, beforeEach } = require('@jest/globals');
const WikiRoutes = require('../WikiRoutes');

describe('WikiRoutes.buildNewPageMetadata()', () => {
  let wikiRoutes;
  let mockValidationManager;
  let mockConfigurationManager;
  let mockEngine;

  beforeEach(() => {
    // Create mock ValidationManager
    mockValidationManager = {
      generateValidMetadata: jest.fn((title, options) => ({
        title: title,
        'system-category': options['system-category'] || 'general',
        'user-keywords': options['user-keywords'] || [],
        uuid: options.uuid || 'mock-uuid-1234',
        slug: title.toLowerCase().replace(/\s+/g, '-'),
        lastModified: '2026-02-06T00:00:00.000Z',
        ...options
      }))
    };

    // Create mock ConfigurationManager with system-category config
    mockConfigurationManager = {
      getProperty: jest.fn((key, defaultVal) => {
        if (key === 'amdwiki.system-category') {
          return {
            general: { label: 'general', default: true, enabled: true },
            system: { label: 'system', default: false, enabled: true },
            documentation: { label: 'documentation', default: false, enabled: true }
          };
        }
        return defaultVal;
      })
    };

    // Create mock Engine
    mockEngine = {
      getManager: jest.fn((name) => {
        if (name === 'ValidationManager') return mockValidationManager;
        if (name === 'ConfigurationManager') return mockConfigurationManager;
        return null;
      })
    };

    // Create WikiRoutes instance
    wikiRoutes = new WikiRoutes(mockEngine);
  });

  describe('Delegation to ValidationManager', () => {
    test('should delegate to ValidationManager.generateValidMetadata() when available', () => {
      const result = wikiRoutes.buildNewPageMetadata('Test Page');

      expect(mockValidationManager.generateValidMetadata).toHaveBeenCalledWith(
        'Test Page',
        expect.any(Object)
      );
      expect(result.title).toBe('Test Page');
    });

    test('should pass filtered options to ValidationManager', () => {
      wikiRoutes.buildNewPageMetadata('Test Page', {
        'system-category': 'documentation',
        author: 'testuser'
      });

      expect(mockValidationManager.generateValidMetadata).toHaveBeenCalledWith(
        'Test Page',
        expect.objectContaining({
          'system-category': 'documentation',
          author: 'testuser'
        })
      );
    });

    test('should filter out undefined values from options', () => {
      wikiRoutes.buildNewPageMetadata('Test Page', {
        'system-category': 'general',
        uuid: undefined,
        author: 'testuser'
      });

      const callArgs = mockValidationManager.generateValidMetadata.mock.calls[0][1];
      expect(callArgs).not.toHaveProperty('uuid');
      expect(callArgs).toHaveProperty('system-category', 'general');
      expect(callArgs).toHaveProperty('author', 'testuser');
    });

    test('should filter out null values from options', () => {
      wikiRoutes.buildNewPageMetadata('Test Page', {
        'system-category': 'general',
        uuid: null,
        author: 'testuser'
      });

      const callArgs = mockValidationManager.generateValidMetadata.mock.calls[0][1];
      expect(callArgs).not.toHaveProperty('uuid');
    });
  });

  describe('Fallback when ValidationManager unavailable', () => {
    beforeEach(() => {
      // Remove ValidationManager
      mockEngine.getManager = jest.fn((name) => {
        if (name === 'ConfigurationManager') return mockConfigurationManager;
        return null;
      });
      wikiRoutes = new WikiRoutes(mockEngine);
    });

    test('should return metadata with all required fields', () => {
      const result = wikiRoutes.buildNewPageMetadata('Test Page');

      expect(result).toHaveProperty('title', 'Test Page');
      expect(result).toHaveProperty('system-category');
      expect(result).toHaveProperty('user-keywords');
      expect(result).toHaveProperty('uuid');
      expect(result).toHaveProperty('slug');
      expect(result).toHaveProperty('lastModified');
    });

    test('should get default category from ConfigurationManager', () => {
      const result = wikiRoutes.buildNewPageMetadata('Test Page');

      expect(mockConfigurationManager.getProperty).toHaveBeenCalledWith(
        'amdwiki.system-category',
        null
      );
      expect(result['system-category']).toBe('general');
    });

    test('should use provided system-category over default', () => {
      const result = wikiRoutes.buildNewPageMetadata('Test Page', {
        'system-category': 'documentation'
      });

      expect(result['system-category']).toBe('documentation');
    });

    test('should generate slug from title', () => {
      const result = wikiRoutes.buildNewPageMetadata('My Test Page');

      expect(result.slug).toBe('my-test-page');
    });

    test('should handle special characters in slug generation', () => {
      const result = wikiRoutes.buildNewPageMetadata('Test & Page! (Example)');

      expect(result.slug).toBe('test-page-example');
    });

    test('should set lastModified to current ISO timestamp', () => {
      const before = new Date().toISOString();
      const result = wikiRoutes.buildNewPageMetadata('Test Page');
      const after = new Date().toISOString();

      expect(result.lastModified >= before).toBe(true);
      expect(result.lastModified <= after).toBe(true);
    });

    test('should default user-keywords to empty array', () => {
      const result = wikiRoutes.buildNewPageMetadata('Test Page');

      expect(result['user-keywords']).toEqual([]);
    });

    test('should preserve provided user-keywords', () => {
      const result = wikiRoutes.buildNewPageMetadata('Test Page', {
        'user-keywords': ['medicine', 'geology']
      });

      expect(result['user-keywords']).toEqual(['medicine', 'geology']);
    });

    test('should preserve provided uuid', () => {
      const result = wikiRoutes.buildNewPageMetadata('Test Page', {
        uuid: 'existing-uuid-5678'
      });

      expect(result.uuid).toBe('existing-uuid-5678');
    });
  });

  describe('ConfigurationManager default category resolution', () => {
    beforeEach(() => {
      // Remove ValidationManager to test fallback path
      mockEngine.getManager = jest.fn((name) => {
        if (name === 'ConfigurationManager') return mockConfigurationManager;
        return null;
      });
      wikiRoutes = new WikiRoutes(mockEngine);
    });

    test('should use category marked as default: true', () => {
      mockConfigurationManager.getProperty.mockReturnValue({
        general: { label: 'general', default: false, enabled: true },
        custom: { label: 'custom', default: true, enabled: true }
      });

      const result = wikiRoutes.buildNewPageMetadata('Test Page');

      expect(result['system-category']).toBe('custom');
    });

    test('should skip disabled categories when finding default', () => {
      mockConfigurationManager.getProperty.mockReturnValue({
        disabled: { label: 'disabled', default: true, enabled: false },
        fallback: { label: 'fallback', default: false, enabled: true }
      });

      const result = wikiRoutes.buildNewPageMetadata('Test Page');

      expect(result['system-category']).toBe('fallback');
    });

    test('should fallback to first enabled category when no default set', () => {
      mockConfigurationManager.getProperty.mockReturnValue({
        first: { label: 'first', enabled: true },
        second: { label: 'second', enabled: true }
      });

      const result = wikiRoutes.buildNewPageMetadata('Test Page');

      expect(result['system-category']).toBe('first');
    });

    test('should fallback to "general" when ConfigurationManager unavailable', () => {
      mockEngine.getManager = jest.fn(() => null);
      wikiRoutes = new WikiRoutes(mockEngine);

      const result = wikiRoutes.buildNewPageMetadata('Test Page');

      expect(result['system-category']).toBe('general');
    });

    test('should fallback to "general" when config returns null', () => {
      mockConfigurationManager.getProperty.mockReturnValue(null);

      const result = wikiRoutes.buildNewPageMetadata('Test Page');

      expect(result['system-category']).toBe('general');
    });
  });

  describe('Edge Cases', () => {
    test('should trim whitespace from title', () => {
      mockEngine.getManager = jest.fn((name) => {
        if (name === 'ConfigurationManager') return mockConfigurationManager;
        return null;
      });
      wikiRoutes = new WikiRoutes(mockEngine);

      const result = wikiRoutes.buildNewPageMetadata('  Test Page  ');

      expect(result.title).toBe('Test Page');
    });

    test('should work with empty options object', () => {
      const result = wikiRoutes.buildNewPageMetadata('Test Page', {});

      expect(result).toHaveProperty('title', 'Test Page');
    });

    test('should work without options argument', () => {
      const result = wikiRoutes.buildNewPageMetadata('Test Page');

      expect(result).toHaveProperty('title', 'Test Page');
    });

    test('should include additional options in result', () => {
      const result = wikiRoutes.buildNewPageMetadata('Test Page', {
        author: 'testuser',
        customField: 'customValue'
      });

      expect(result.author).toBe('testuser');
      expect(result.customField).toBe('customValue');
    });
  });
});
