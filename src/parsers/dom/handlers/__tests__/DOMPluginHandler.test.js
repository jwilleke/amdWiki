/**
 * Unit tests for DOMPluginHandler
 * Tests DOM-based plugin execution
 *
 * Part of Phase 4 of WikiDocument DOM Migration (GitHub Issue #107)
 */

const DOMPluginHandler = require('../DOMPluginHandler');
const WikiDocument = require('../../WikiDocument');
const { DOMParser } = require('../../DOMParser');

// Mock engine and PluginManager
const createMockEngine = () => {
  const mockPlugins = {
    'TableOfContents': async (pageName, params, context) => {
      return '<div class="toc"><h3>Table of Contents</h3><ul><li>Section 1</li></ul></div>';
    },
    'CurrentTimePlugin': async (pageName, params, context) => {
      return '<span class="time">2025-10-12 12:00</span>';
    },
    'HelloPlugin': async (pageName, params, context) => {
      const name = params.name || 'World';
      return `<p>Hello, ${name}!</p>`;
    },
    'ErrorPlugin': async (pageName, params, context) => {
      throw new Error('Plugin execution failed');
    },
    'EmptyPlugin': async (pageName, params, context) => {
      return '';
    }
  };

  return {
    getManager: jest.fn((name) => {
      if (name === 'PluginManager') {
        return {
          execute: jest.fn(async (pluginName, pageName, params, context) => {
            const plugin = mockPlugins[pluginName];
            if (!plugin) {
              throw new Error(`Plugin not found: ${pluginName}`);
            }
            return await plugin(pageName, params, context);
          })
        };
      }
      return null;
    })
  };
};

describe('DOMPluginHandler', () => {
  let handler;
  let mockEngine;
  let parser;

  beforeEach(async () => {
    mockEngine = createMockEngine();
    handler = new DOMPluginHandler(mockEngine);
    await handler.initialize();

    // Create parser for integration tests
    parser = new DOMParser();
  });

  describe('Constructor and Initialization', () => {
    test('creates handler with engine', () => {
      expect(handler.engine).toBe(mockEngine);
      expect(handler.pluginManager).not.toBeNull();
    });

    test('warns if PluginManager not available', async () => {
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();

      const badEngine = {
        getManager: jest.fn(() => null)
      };

      const badHandler = new DOMPluginHandler(badEngine);
      await badHandler.initialize();

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('PluginManager not available')
      );

      consoleSpy.mockRestore();
    });
  });

  describe('parsePluginContent()', () => {
    test('parses plugin name only', () => {
      const result = handler.parsePluginContent('TableOfContents');
      expect(result).toEqual({
        pluginName: 'TableOfContents',
        parameters: {}
      });
    });

    test('parses plugin with parameters', () => {
      const result = handler.parsePluginContent('HelloPlugin name=Alice');
      expect(result).toEqual({
        pluginName: 'HelloPlugin',
        parameters: { name: 'Alice' }
      });
    });

    test('parses multiple parameters', () => {
      const result = handler.parsePluginContent('Plugin max=5 show=true');
      expect(result).toEqual({
        pluginName: 'Plugin',
        parameters: { max: '5', show: 'true' }
      });
    });

    test('handles quoted parameter values', () => {
      const result = handler.parsePluginContent('Plugin title="Hello World"');
      expect(result.parameters.title).toBe('Hello World');
    });

    test('returns null for empty content', () => {
      expect(handler.parsePluginContent('')).toBeNull();
      expect(handler.parsePluginContent(null)).toBeNull();
      expect(handler.parsePluginContent(undefined)).toBeNull();
    });

    test('trims whitespace', () => {
      const result = handler.parsePluginContent('  TableOfContents  ');
      expect(result.pluginName).toBe('TableOfContents');
    });
  });

  describe('parseParameters()', () => {
    test('parses empty parameters', () => {
      expect(handler.parseParameters('')).toEqual({});
      expect(handler.parseParameters('   ')).toEqual({});
    });

    test('parses single parameter', () => {
      const result = handler.parseParameters('name=value');
      expect(result).toEqual({ name: 'value' });
    });

    test('parses multiple parameters', () => {
      const result = handler.parseParameters('a=1 b=2 c=3');
      expect(result).toEqual({ a: '1', b: '2', c: '3' });
    });

    test('handles parameters with single quotes', () => {
      const result = handler.parseParameters("name='John Doe'");
      expect(result.name).toBe('John Doe');
    });

    test('handles parameters with double quotes', () => {
      const result = handler.parseParameters('title="My Title"');
      expect(result.title).toBe('My Title');
    });

    test('handles spaces before equals sign', () => {
      const result = handler.parseParameters('align ="left"');
      expect(result.align).toBe('left');
    });

    test('handles spaces after equals sign', () => {
      const result = handler.parseParameters('align= "right"');
      expect(result.align).toBe('right');
    });

    test('handles spaces around equals sign', () => {
      const result = handler.parseParameters('align = "center"');
      expect(result.align).toBe('center');
    });

    test('handles complex parameters with special characters and spaces', () => {
      const result = handler.parseParameters(
        'src="/path/to/file" caption ="Test Caption" align= \'left\' style= "font-size: 120%;background-color: white;"'
      );
      expect(result.src).toBe('/path/to/file');
      expect(result.caption).toBe('Test Caption');
      expect(result.align).toBe('left');
      expect(result.style).toBe('font-size: 120%;background-color: white;');
    });

    test('handles user reported Image plugin syntax', () => {
      const result = handler.parseParameters(
        "src='/attachments/621c9274e39fc77d5e6cce7028c7805a37e5d977f116c20cc8be728d8de90c26' caption='Nerve Action Potentials' align ='left' style='font-size: 120%;background-color: white;'"
      );
      expect(result.src).toBe('/attachments/621c9274e39fc77d5e6cce7028c7805a37e5d977f116c20cc8be728d8de90c26');
      expect(result.caption).toBe('Nerve Action Potentials');
      expect(result.align).toBe('left');
      expect(result.style).toBe('font-size: 120%;background-color: white;');
    });
  });

  describe('executePlugin()', () => {
    test('executes plugin through PluginManager', async () => {
      const context = { pageName: 'TestPage' };
      const pluginElement = { getAttribute: () => 'TableOfContents' };

      const result = await handler.executePlugin(
        'TableOfContents',
        {},
        context,
        pluginElement
      );

      expect(result).toContain('Table of Contents');
    });

    test('passes parameters to plugin', async () => {
      const context = { pageName: 'TestPage' };
      const pluginElement = { getAttribute: () => 'HelloPlugin' };

      const result = await handler.executePlugin(
        'HelloPlugin',
        { name: 'Bob' },
        context,
        pluginElement
      );

      expect(result).toContain('Bob');
    });

    test('throws on plugin execution error', async () => {
      const context = { pageName: 'TestPage' };
      const pluginElement = { getAttribute: () => 'ErrorPlugin' };

      await expect(
        handler.executePlugin('ErrorPlugin', {}, context, pluginElement)
      ).rejects.toThrow();
    });

    test('throws if PluginManager not available', async () => {
      handler.pluginManager = null;

      await expect(
        handler.executePlugin('TableOfContents', {}, {}, {})
      ).rejects.toThrow('PluginManager not available');
    });
  });

  describe('processPlugins()', () => {
    test('processes single plugin', async () => {
      const wikiDoc = parser.parse('[{TableOfContents}]', {});

      await handler.processPlugins(wikiDoc, { pageName: 'TestPage' });

      const html = wikiDoc.toHTML();
      expect(html).toContain('Table of Contents');
      expect(html).not.toContain('[{TableOfContents}]');
    });

    test('processes multiple plugins', async () => {
      const wikiDoc = parser.parse(
        '[{TableOfContents}] and [{CurrentTimePlugin}]',
        {}
      );

      await handler.processPlugins(wikiDoc, { pageName: 'TestPage' });

      const html = wikiDoc.toHTML();
      expect(html).toContain('Table of Contents');
      expect(html).toContain('2025-10-12');
    });

    test('processes plugin with parameters', async () => {
      const wikiDoc = parser.parse('[{HelloPlugin name=Charlie}]', {});

      await handler.processPlugins(wikiDoc, { pageName: 'TestPage' });

      const html = wikiDoc.toHTML();
      expect(html).toContain('Charlie');
    });

    test('handles plugin execution errors gracefully', async () => {
      const wikiDoc = parser.parse('[{ErrorPlugin}]', {});

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      await handler.processPlugins(wikiDoc, { pageName: 'TestPage' });

      const html = wikiDoc.toHTML();
      expect(html).toContain('Plugin Error');

      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });

    test('handles empty plugin output', async () => {
      const wikiDoc = parser.parse('[{EmptyPlugin}]', {});

      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();

      await handler.processPlugins(wikiDoc, { pageName: 'TestPage' });

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('returned no output')
      );

      consoleSpy.mockRestore();
    });

    test('returns unchanged document if no plugins', async () => {
      const wikiDoc = parser.parse('No plugins here', {});
      const originalHTML = wikiDoc.toHTML();

      await handler.processPlugins(wikiDoc, {});

      const newHTML = wikiDoc.toHTML();
      expect(newHTML).toBe(originalHTML);
    });

    test('warns if PluginManager not available', async () => {
      handler.pluginManager = null;

      const wikiDoc = parser.parse('[{TableOfContents}]', {});
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();

      await handler.processPlugins(wikiDoc, {});

      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });
  });

  describe('getStatistics()', () => {
    test('returns statistics for document with plugins', () => {
      const wikiDoc = parser.parse(
        '[{TableOfContents}] and [{HelloPlugin}] and [{TableOfContents}]',
        {}
      );

      const stats = handler.getStatistics(wikiDoc);

      expect(stats.totalPlugins).toBe(3);
      expect(stats.uniqueCount).toBe(2);
      expect(stats.uniquePlugins).toContain('TableOfContents');
      expect(stats.uniquePlugins).toContain('HelloPlugin');
    });

    test('returns empty statistics for document without plugins', () => {
      const wikiDoc = parser.parse('No plugins', {});

      const stats = handler.getStatistics(wikiDoc);

      expect(stats.totalPlugins).toBe(0);
      expect(stats.uniqueCount).toBe(0);
    });

    test('tracks plugin parameters', () => {
      const wikiDoc = parser.parse('[{HelloPlugin name=Alice}]', {});

      const stats = handler.getStatistics(wikiDoc);

      expect(stats.plugins).toHaveLength(1);
      expect(stats.plugins[0].name).toBe('HelloPlugin');
      expect(stats.plugins[0].parameters).toEqual({ name: 'Alice' });
    });
  });

  describe('Integration with DOMParser', () => {
    test('plugins in paragraphs', async () => {
      const wikiDoc = parser.parse('Some text [{TableOfContents}] more text', {});

      await handler.processPlugins(wikiDoc, { pageName: 'TestPage' });

      const html = wikiDoc.toHTML();
      expect(html).toContain('Table of Contents');
      expect(html).toContain('Some text');
      expect(html).toContain('more text');
    });

    test('plugins with other markup', async () => {
      const wikiDoc = parser.parse('__Bold__ text [{CurrentTimePlugin}]', {});

      await handler.processPlugins(wikiDoc, { pageName: 'TestPage' });

      const html = wikiDoc.toHTML();
      expect(html).toContain('<strong');
      expect(html).toContain('2025-10-12');
    });
  });

  describe('Escaped Content', () => {
    test('does NOT process plugins in escaped content', async () => {
      const wikiDoc = parser.parse('[[{TableOfContents} should not execute]]', {});

      await handler.processPlugins(wikiDoc, { pageName: 'TestPage' });

      const html = wikiDoc.toHTML();
      // Should contain the literal plugin syntax
      expect(html).toContain('{TableOfContents}');
      // Should NOT contain the executed result
      expect(html).not.toContain('Table of Contents');
    });

    test('processes plugins outside escaped content but not inside', async () => {
      const wikiDoc = parser.parse(
        '[{TableOfContents}] and [[{HelloPlugin} is escaped]]',
        {}
      );

      await handler.processPlugins(wikiDoc, { pageName: 'TestPage' });

      const html = wikiDoc.toHTML();
      // Outside escaped: executed
      expect(html).toContain('Table of Contents');
      // Inside escaped: NOT executed
      expect(html).toContain('{HelloPlugin}');
      expect(html).not.toContain('Hello, World!');
    });
  });

  describe('Performance', () => {
    test('handles many plugins efficiently', async () => {
      const plugins = Array(50).fill('[{CurrentTimePlugin}]').join(' ');
      const wikiDoc = parser.parse(plugins, {});

      const start = Date.now();
      await handler.processPlugins(wikiDoc, { pageName: 'TestPage' });
      const elapsed = Date.now() - start;

      expect(elapsed).toBeLessThan(1000); // Should be fast
    });
  });
});
