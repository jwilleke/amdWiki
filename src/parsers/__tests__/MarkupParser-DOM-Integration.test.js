/**
 * Integration tests for MarkupParser with DOM-based parsing
 * Tests Phase 0 (DOM Parsing) integration
 *
 * Related: GitHub Issue #93 - DOM-Based Parsing Architecture
 */

const MarkupParser = require('../MarkupParser');

// Mock engine for testing
const createMockEngine = () => {
  return {
    getManager: jest.fn((name) => {
      if (name === 'ConfigurationManager') {
        return {
          getProperty: jest.fn((key, defaultValue) => defaultValue)
        };
      }
      if (name === 'VariableManager') {
        return {
          expandVariables: jest.fn((content) => content)
        };
      }
      return null;
    })
  };
};

describe('MarkupParser - DOM Integration', () => {
  let parser;
  let mockEngine;

  beforeEach(async () => {
    mockEngine = createMockEngine();
    parser = new MarkupParser(mockEngine);

    // Initialize with minimal config
    await parser.initialize({
      enabled: true,
      handlers: { enabled: false },  // Disable complex handlers for these tests
      filters: {
        enabled: false,
        security: { enabled: false },
        spam: { enabled: false },
        validation: { enabled: false }
      },
      cache: { enabled: false }       // Disable cache for predictable tests
    });

    // Keep only Phase 0 (DOM Parsing) - remove all other phases
    // This is needed because the DOM parser already produces final HTML
    const domParsingPhase = parser.phases.find(p => p.name === 'DOM Parsing');
    parser.phases = [domParsingPhase];
  });

  describe('Phase 0: DOM Parsing', () => {
    test('parses simple text', async () => {
      const result = await parser.parse('Hello, world!');
      expect(result).toContain('Hello, world!');
    });

    test('parses bold text', async () => {
      const result = await parser.parse('This is __bold__ text');
      expect(result).toContain('<strong');
      expect(result).toContain('bold');
    });

    test('parses italic text', async () => {
      const result = await parser.parse("This is ''italic'' text");
      expect(result).toContain('<em');
      expect(result).toContain('italic');
    });

    test('parses headings', async () => {
      const result = await parser.parse('!!! Main Title');
      expect(result).toContain('<h1');
      expect(result).toContain('Main Title');
    });

    test('parses lists', async () => {
      const result = await parser.parse('* Item 1\n* Item 2');
      expect(result).toContain('<ul');
      expect(result).toContain('<li');
      expect(result).toContain('Item 1');
      expect(result).toContain('Item 2');
    });

    test('parses links', async () => {
      const result = await parser.parse('[HomePage|Go Home]');
      expect(result).toContain('<a');
      expect(result).toContain('wiki-link');
      expect(result).toContain('Go Home');
    });

    test('parses variables', async () => {
      const result = await parser.parse('Hello {$username}!');
      expect(result).toContain('wiki-variable');
      expect(result).toContain('data-variable="username"');
    });

    test('parses code blocks', async () => {
      const result = await parser.parse('{{{function test() {\\n  return true;\\n}}}}');
      expect(result).toContain('<pre');
      expect(result).toContain('function test()');
    });
  });

  describe('Escaped Content (Critical Feature)', () => {
    test('handles escaped text', async () => {
      const result = await parser.parse('This is [[escaped text]] here');
      expect(result).toContain('escaped text');
    });

    test('escaped content is NOT parsed', async () => {
      const result = await parser.parse('Before [[{$variable} and [link]]] after');

      // Should contain literal text
      expect(result).toContain('{$variable}');
      expect(result).toContain('[link]');

      // Should NOT have multiple parsed elements for the escaped content
      // (The DOMParser creates ONE text node for escaped content)
    });

    test('escaped bold/italic is NOT parsed', async () => {
      const result = await parser.parse("[[__not bold__ and ''not italic'']]");

      expect(result).toContain('__not bold__');
      expect(result).toContain("''not italic''");
    });

    test('multiple escaped sections work', async () => {
      const result = await parser.parse('[[first]] normal [[second]]');

      expect(result).toContain('first');
      expect(result).toContain('normal');
      expect(result).toContain('second');
    });
  });

  describe('Complex Scenarios', () => {
    test('parses mixed content document', async () => {
      const markup = `!!! Welcome

This is __bold__ and ''italic'' text.

* List item 1
* List item 2

[HomePage|home page]`;

      const result = await parser.parse(markup);

      expect(result).toContain('<h1');
      expect(result).toContain('Welcome');
      expect(result).toContain('<strong');
      expect(result).toContain('<em');
      expect(result).toContain('<ul');
      expect(result).toContain('wiki-link');
    });

    test('handles empty content', async () => {
      const result = await parser.parse('');
      expect(result).toBe('');
    });

    test('handles null content', async () => {
      const result = await parser.parse(null);
      expect(result).toBe('');
    });
  });

  describe('Context Integration', () => {
    test('stores WikiDocument in context', async () => {
      let capturedContext;

      // Mock the DOM parsing phase to capture the context
      const originalPhase = parser.phases[0].process;
      parser.phases[0].process = async function(content, context) {
        const result = await originalPhase.call(this, content, context);
        capturedContext = context;
        return result;
      };

      await parser.parse('Test content');

      expect(capturedContext).toBeDefined();
      expect(capturedContext.wikiDocument).toBeDefined();
      expect(capturedContext.wikiDocument.getPageData).toBeDefined();
    });
  });

  describe('Performance', () => {
    test('parses document quickly', async () => {
      const markup = '!!! Title\n\nSome text with __bold__ content.';

      const start = Date.now();
      await parser.parse(markup);
      const elapsed = Date.now() - start;

      expect(elapsed).toBeLessThan(1000); // Should be much faster
    });
  });

  describe('Metrics', () => {
    test('tracks DOM parsing metrics', async () => {
      await parser.parse('Test content');

      expect(parser.metrics.parseCount).toBeGreaterThan(0);
      expect(parser.metrics.phaseMetrics.has('DOM Parsing')).toBe(true);

      const domMetrics = parser.metrics.phaseMetrics.get('DOM Parsing');
      expect(domMetrics.executionCount).toBeGreaterThan(0);
    });
  });
});
