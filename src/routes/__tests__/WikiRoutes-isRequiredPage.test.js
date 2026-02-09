/**
 * WikiRoutes.isRequiredPage() tests
 *
 * Tests the isRequiredPage() method that determines if a page
 * requires admin permission to edit (Issue #174).
 *
 * Protected pages include:
 * - Hardcoded required pages (backward compatibility)
 * - Pages with system-category: system or documentation
 *
 * @jest-environment node
 */

const { describe, test, expect, beforeEach } = require('@jest/globals');
const WikiRoutes = require('../WikiRoutes');

describe('WikiRoutes.isRequiredPage()', () => {
  let wikiRoutes;
  let mockPageManager;
  let mockEngine;

  beforeEach(() => {
    // Create mock PageManager
    mockPageManager = {
      getPageMetadata: jest.fn()
    };

    // Create mock Engine
    mockEngine = {
      getManager: jest.fn((name) => {
        if (name === 'PageManager') return mockPageManager;
        if (name === 'ConfigurationManager') {
          return {
            getProperty: jest.fn().mockReturnValue(null)
          };
        }
        return null;
      })
    };

    // Create WikiRoutes instance
    wikiRoutes = new WikiRoutes(mockEngine);
  });

  describe('Hardcoded Required Pages', () => {
    test('should return true for "System Categories" (hardcoded)', async () => {
      const result = await wikiRoutes.isRequiredPage('System Categories');
      expect(result).toBe(true);
    });

    test('should return true for "Wiki Documentation" (hardcoded)', async () => {
      const result = await wikiRoutes.isRequiredPage('Wiki Documentation');
      expect(result).toBe(true);
    });
  });

  describe('System Category Protection (Issue #174)', () => {
    test('should return true for system-category: system (lowercase)', async () => {
      mockPageManager.getPageMetadata.mockResolvedValue({
        title: 'Test Page',
        'system-category': 'system'
      });

      const result = await wikiRoutes.isRequiredPage('Test Page');
      expect(result).toBe(true);
    });

    test('should return true for system-category: System (uppercase)', async () => {
      mockPageManager.getPageMetadata.mockResolvedValue({
        title: 'Test Page',
        'system-category': 'System'
      });

      const result = await wikiRoutes.isRequiredPage('Test Page');
      expect(result).toBe(true);
    });

    test('should return true for system-category: documentation', async () => {
      mockPageManager.getPageMetadata.mockResolvedValue({
        title: 'Test Page',
        'system-category': 'documentation'
      });

      const result = await wikiRoutes.isRequiredPage('Test Page');
      expect(result).toBe(true);
    });

    test('should return true for system-category: Documentation (uppercase)', async () => {
      mockPageManager.getPageMetadata.mockResolvedValue({
        title: 'Test Page',
        'system-category': 'Documentation'
      });

      const result = await wikiRoutes.isRequiredPage('Test Page');
      expect(result).toBe(true);
    });

    test('should return true for system-category: System/Admin', async () => {
      mockPageManager.getPageMetadata.mockResolvedValue({
        title: 'Test Page',
        'system-category': 'System/Admin'
      });

      const result = await wikiRoutes.isRequiredPage('Test Page');
      expect(result).toBe(true);
    });

    test('should return true for category: System/Admin (legacy)', async () => {
      mockPageManager.getPageMetadata.mockResolvedValue({
        title: 'Test Page',
        category: 'System/Admin'
      });

      const result = await wikiRoutes.isRequiredPage('Test Page');
      expect(result).toBe(true);
    });
  });

  describe('Non-Protected Pages', () => {
    test('should return false for system-category: General', async () => {
      mockPageManager.getPageMetadata.mockResolvedValue({
        title: 'Test Page',
        'system-category': 'General'
      });

      const result = await wikiRoutes.isRequiredPage('Test Page');
      expect(result).toBe(false);
    });

    test('should return false for system-category: Developer', async () => {
      mockPageManager.getPageMetadata.mockResolvedValue({
        title: 'Test Page',
        'system-category': 'Developer'
      });

      const result = await wikiRoutes.isRequiredPage('Test Page');
      expect(result).toBe(false);
    });

    test('should return false when no system-category is set', async () => {
      mockPageManager.getPageMetadata.mockResolvedValue({
        title: 'Test Page'
      });

      const result = await wikiRoutes.isRequiredPage('Test Page');
      expect(result).toBe(false);
    });

    test('should return false when page does not exist', async () => {
      mockPageManager.getPageMetadata.mockResolvedValue(null);

      const result = await wikiRoutes.isRequiredPage('NonExistent Page');
      expect(result).toBe(false);
    });
  });

  describe('Error Handling', () => {
    test('should return false when PageManager throws error', async () => {
      mockPageManager.getPageMetadata.mockRejectedValue(new Error('Database error'));

      const result = await wikiRoutes.isRequiredPage('Error Page');
      expect(result).toBe(false);
    });

    test('should return false when metadata is null', async () => {
      mockPageManager.getPageMetadata.mockResolvedValue(null);

      const result = await wikiRoutes.isRequiredPage('Test Page');
      expect(result).toBe(false);
    });
  });
});
