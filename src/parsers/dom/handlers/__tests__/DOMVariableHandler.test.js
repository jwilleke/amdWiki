/**
 * Unit tests for DOMVariableHandler
 * Tests DOM-based variable resolution
 *
 * Part of Phase 3 of WikiDocument DOM Migration (GitHub Issue #93)
 */

const DOMVariableHandler = require('../DOMVariableHandler');
const WikiDocument = require('../../WikiDocument');
const { DOMParser } = require('../../DOMParser');

// Mock engine and VariableManager
const createMockEngine = () => {
  const variableHandlers = new Map();

  // Register test variables
  variableHandlers.set('username', (context) => context?.userName || 'TestUser');
  variableHandlers.set('pagename', (context) => context?.pageName || 'TestPage');
  variableHandlers.set('date', () => '2025-10-12');
  variableHandlers.set('appname', () => 'amdWiki');
  variableHandlers.set('version', () => '1.0.0');
  variableHandlers.set('error', () => {
    throw new Error('Test error');
  });

  return {
    getManager: jest.fn((name) => {
      if (name === 'VariableManager') {
        return {
          variableHandlers
        };
      }
      return null;
    })
  };
};

describe('DOMVariableHandler', () => {
  let handler;
  let mockEngine;
  let parser;

  beforeEach(async () => {
    mockEngine = createMockEngine();
    handler = new DOMVariableHandler(mockEngine);
    await handler.initialize();

    // Create parser for integration tests
    parser = new DOMParser();
  });

  describe('Constructor and Initialization', () => {
    test('creates handler with engine', () => {
      expect(handler.engine).toBe(mockEngine);
      // Note: variableManager is set lazily during processing, not at initialization
      expect(handler.variableManager).toBeNull();
    });

    test('gets VariableManager on first processVariables call', async () => {
      // Create a new handler to test lazy initialization
      const newHandler = new DOMVariableHandler(mockEngine);
      expect(newHandler.variableManager).toBeNull();

      const wikiDoc = parser.parse('[{$username}]', {});
      await newHandler.processVariables(wikiDoc, { userName: 'Test' });

      // After first call, variableManager should be set
      expect(newHandler.variableManager).not.toBeNull();
    });

    test('warns if VariableManager not available during processing', async () => {
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();

      const badEngine = {
        getManager: jest.fn(() => null)
      };

      const badHandler = new DOMVariableHandler(badEngine);
      const wikiDoc = parser.parse('[{$username}]', {});

      await badHandler.processVariables(wikiDoc, {});

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('VariableManager')
      );

      consoleSpy.mockRestore();
    });
  });

  describe('resolveVariable()', () => {
    // Manually set variableManager for these direct tests
    beforeEach(() => {
      handler.variableManager = mockEngine.getManager('VariableManager');
    });

    test('resolves registered variable', () => {
      const context = { userName: 'Alice' };
      const value = handler.resolveVariable('username', context);
      expect(value).toBe('Alice');
    });

    test('uses default value when context missing', () => {
      const value = handler.resolveVariable('username', {});
      expect(value).toBe('TestUser');
    });

    test('returns null for unknown variable', () => {
      const value = handler.resolveVariable('unknown', {});
      expect(value).toBeNull();
    });

    test('handles case-insensitive variable names', () => {
      const value = handler.resolveVariable('USERNAME', {});
      expect(value).toBe('TestUser');
    });

    test('trims whitespace from variable names', () => {
      const value = handler.resolveVariable('  username  ', {});
      expect(value).toBe('TestUser');
    });

    test('throws on handler error', () => {
      expect(() => {
        handler.resolveVariable('error', {});
      }).toThrow('Test error');
    });

    test('returns null if VariableManager missing', () => {
      handler.variableManager = null;
      const value = handler.resolveVariable('username', {});
      expect(value).toBeNull();
    });
  });

  describe('processVariables()', () => {
    test('processes single variable', async () => {
      // Parse markup with variable
      const wikiDoc = parser.parse('Hello [{$username}]!', { userName: 'Bob' });

      // Process variables
      await handler.processVariables(wikiDoc, { userName: 'Bob' });

      const html = wikiDoc.toHTML();
      expect(html).toContain('Bob');
      expect(html).not.toContain('[{$username}]');
    });

    test('processes multiple variables', async () => {
      const wikiDoc = parser.parse(
        'User: [{$username}], Page: [{$pagename}], Date: [{$date}]',
        { userName: 'Charlie', pageName: 'HomePage' }
      );

      await handler.processVariables(wikiDoc, {
        userName: 'Charlie',
        pageName: 'HomePage'
      });

      const html = wikiDoc.toHTML();
      expect(html).toContain('Charlie');
      expect(html).toContain('HomePage');
      expect(html).toContain('2025-10-12');
    });

    test('handles unknown variables gracefully', async () => {
      const wikiDoc = parser.parse('Value: [{$unknown}]', {});

      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();

      await handler.processVariables(wikiDoc, {});

      const html = wikiDoc.toHTML();
      expect(html).toContain('{$unknown}'); // Original variable name preserved

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Variable not found: unknown')
      );

      consoleSpy.mockRestore();
    });

    test('handles variable resolution errors', async () => {
      const wikiDoc = parser.parse('Error: [{$error}]', {});

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      await handler.processVariables(wikiDoc, {});

      const html = wikiDoc.toHTML();
      expect(html).toContain('[Error:');

      expect(consoleSpy).toHaveBeenCalled();

      consoleSpy.mockRestore();
    });

    test('returns unchanged document if no variables', async () => {
      const wikiDoc = parser.parse('No variables here', {});
      const originalHTML = wikiDoc.toHTML();

      await handler.processVariables(wikiDoc, {});

      const newHTML = wikiDoc.toHTML();
      expect(newHTML).toBe(originalHTML);
    });

    test('warns if VariableManager not available', async () => {
      // Create a new handler with an engine that doesn't provide VariableManager
      const badEngine = {
        getManager: jest.fn(() => null)
      };
      const badHandler = new DOMVariableHandler(badEngine);

      const wikiDoc = parser.parse('[{$username}]', {});
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();

      await badHandler.processVariables(wikiDoc, {});

      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });

    test('processes variables in different contexts', async () => {
      const wikiDoc = parser.parse(
        'App: [{$appname}] v[{$version}]',
        {}
      );

      await handler.processVariables(wikiDoc, {});

      const html = wikiDoc.toHTML();
      expect(html).toContain('amdWiki');
      expect(html).toContain('1.0.0');
    });
  });

  describe('getStatistics()', () => {
    test('returns statistics for document with variables', async () => {
      const wikiDoc = parser.parse(
        '[{$username}] logged in on [{$date}]. Page: [{$username}]',
        {}
      );

      const stats = handler.getStatistics(wikiDoc);

      expect(stats.totalVariables).toBe(3);
      expect(stats.uniqueCount).toBe(2);
      expect(stats.uniqueVariables).toContain('username');
      expect(stats.uniqueVariables).toContain('date');
    });

    test('returns empty statistics for document without variables', () => {
      const wikiDoc = parser.parse('No variables', {});

      const stats = handler.getStatistics(wikiDoc);

      expect(stats.totalVariables).toBe(0);
      expect(stats.uniqueCount).toBe(0);
    });

    test('tracks resolved vs unresolved variables', async () => {
      const wikiDoc = parser.parse('[{$username}] and [{$unknown}]', {});

      await handler.processVariables(wikiDoc, { userName: 'Dave' });

      const stats = handler.getStatistics(wikiDoc);

      expect(stats.variables).toHaveLength(2);
      expect(stats.variables[0].resolved).toBe(true);  // username resolved
      expect(stats.variables[1].resolved).toBe(false); // unknown not resolved
    });
  });

  describe('Integration with DOMParser', () => {
    test('variables adjacent to headings', async () => {
      // Note: Variables inside heading text are not yet tokenized separately
      // This is a Phase 3.1 enhancement - nested inline element tokenization
      const wikiDoc = parser.parse('!!! Welcome\n[{$username}] on this page', { userName: 'Eve' });

      await handler.processVariables(wikiDoc, { userName: 'Eve' });

      const html = wikiDoc.toHTML();
      expect(html).toContain('<h1');
      expect(html).toContain('Eve');
    });

    test('variables adjacent to lists', async () => {
      // Note: Variables inside list item text are not yet tokenized separately
      // Phase 3.1 will add support for nested inline tokenization
      const wikiDoc = parser.parse('* Item one\n\n[{$username}] and [{$date}]', {});

      await handler.processVariables(wikiDoc, { userName: 'Frank' });

      const html = wikiDoc.toHTML();
      expect(html).toContain('Frank');
      expect(html).toContain('2025-10-12');
    });

    test('variables adjacent to tables', async () => {
      // Note: Variables inside table cells are currently not tokenized separately
      // This is a limitation of the current tokenizer - table cells are atomic tokens
      // TODO: Phase 3.1 - Enhance tokenizer for nested inline elements
      const wikiDoc = parser.parse('[{$username}] on\n\n| Cell 1 | Cell 2 |\n\nand [{$pagename}]', {});

      await handler.processVariables(wikiDoc, {
        userName: 'Grace',
        pageName: 'MainPage'
      });

      const html = wikiDoc.toHTML();
      expect(html).toContain('Grace');
      expect(html).toContain('MainPage');
    });

    test('variables with adjacent formatting', async () => {
      // Variables work when adjacent to formatting, not nested inside
      // Nested variables in formatting is a Phase 3.1 enhancement
      const wikiDoc = parser.parse("[{$username}] __is bold__ and [{$pagename}] ''is italic''", {});

      await handler.processVariables(wikiDoc, {
        userName: 'Henry',
        pageName: 'TestPage'
      });

      const html = wikiDoc.toHTML();
      expect(html).toContain('Henry');
      expect(html).toContain('TestPage');
      expect(html).toContain('<strong');
      expect(html).toContain('<em');
    });
  });

  describe('Escaped Content', () => {
    test('does NOT process variables in escaped content', async () => {
      const wikiDoc = parser.parse('[[[{$username}] should not be processed]]', {});

      await handler.processVariables(wikiDoc, { userName: 'Iris' });

      const html = wikiDoc.toHTML();
      // Should contain the literal variable syntax
      expect(html).toContain('[{$username}]');
      // Should NOT contain the resolved value
      expect(html).not.toContain('Iris');
    });

    test('processes variables outside escaped content but not inside', async () => {
      const wikiDoc = parser.parse(
        '[{$username}] says [[[{$pagename}] is escaped]]',
        {}
      );

      await handler.processVariables(wikiDoc, {
        userName: 'Jack',
        pageName: 'SecretPage'
      });

      const html = wikiDoc.toHTML();
      // Outside escaped: resolved
      expect(html).toContain('Jack');
      // Inside escaped: NOT resolved
      expect(html).toContain('[{$pagename}]');
      expect(html).not.toContain('SecretPage');
    });
  });

  describe('Performance', () => {
    test('handles many variables efficiently', async () => {
      const vars = Array(100).fill(0).map(() => `[{$username}]`).join(' ');
      const wikiDoc = parser.parse(vars, {});

      const start = Date.now();
      await handler.processVariables(wikiDoc, { userName: 'Test' });
      const elapsed = Date.now() - start;

      expect(elapsed).toBeLessThan(100); // Should be fast
    });
  });
});
