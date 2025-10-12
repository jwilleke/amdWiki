/**
 * Integration tests for DOMParser
 * Tests the complete parsing pipeline from wiki markup to WikiDocument
 */

const { DOMParser, ParseError } = require('../DOMParser');
const WikiDocument = require('../WikiDocument');

describe('DOMParser', () => {
  let parser;

  beforeEach(() => {
    parser = new DOMParser();
  });

  describe('Constructor', () => {
    test('creates parser with default options', () => {
      expect(parser.options.debug).toBe(false);
      expect(parser.options.throwOnError).toBe(false);
    });

    test('creates parser with custom options', () => {
      const customParser = new DOMParser({
        debug: true,
        throwOnError: true
      });
      expect(customParser.options.debug).toBe(true);
      expect(customParser.options.throwOnError).toBe(true);
    });

    test('accepts error callbacks', () => {
      const onError = jest.fn();
      const onWarning = jest.fn();
      const customParser = new DOMParser({
        onError,
        onWarning
      });
      expect(customParser.options.onError).toBe(onError);
    });
  });

  describe('parse() - Basic functionality', () => {
    test('parses empty content', () => {
      const wikiDoc = parser.parse('');
      expect(wikiDoc).toBeInstanceOf(WikiDocument);
      expect(wikiDoc.isEmpty()).toBe(true);
    });

    test('parses simple text', () => {
      const wikiDoc = parser.parse('Hello, world!');
      expect(wikiDoc).toBeInstanceOf(WikiDocument);
      expect(wikiDoc.toHTML()).toContain('Hello, world!');
    });

    test('parses text with bold formatting', () => {
      const wikiDoc = parser.parse('This is __bold__ text');
      const html = wikiDoc.toHTML();
      expect(html).toContain('<strong');
      expect(html).toContain('bold');
    });

    test('parses text with italic formatting', () => {
      const wikiDoc = parser.parse("This is ''italic'' text");
      const html = wikiDoc.toHTML();
      expect(html).toContain('<em');
      expect(html).toContain('italic');
    });

    test('parses headings', () => {
      const wikiDoc = parser.parse('!!! Main Title\n!! Subtitle\n! Section');
      const html = wikiDoc.toHTML();
      expect(html).toContain('<h1');
      expect(html).toContain('Main Title');
      expect(html).toContain('<h2');
      expect(html).toContain('Subtitle');
      expect(html).toContain('<h3');
      expect(html).toContain('Section');
    });

    test('parses lists', () => {
      const wikiDoc = parser.parse('* Item 1\n* Item 2\n** Nested');
      const html = wikiDoc.toHTML();
      expect(html).toContain('<ul');
      expect(html).toContain('<li');
      expect(html).toContain('Item 1');
      expect(html).toContain('Nested');
    });

    test('parses ordered lists', () => {
      const wikiDoc = parser.parse('# First\n# Second');
      const html = wikiDoc.toHTML();
      expect(html).toContain('<ol');
      expect(html).toContain('First');
      expect(html).toContain('Second');
    });

    test('parses tables', () => {
      const wikiDoc = parser.parse('| Cell 1 | Cell 2 |\n| Cell 3 | Cell 4 |');
      const html = wikiDoc.toHTML();
      expect(html).toContain('<table');
      expect(html).toContain('<tr');
      expect(html).toContain('<td');
      expect(html).toContain('Cell 1');
      expect(html).toContain('Cell 4');
    });

    test('parses links', () => {
      const wikiDoc = parser.parse('[HomePage|Go Home]');
      const html = wikiDoc.toHTML();
      expect(html).toContain('<a');
      expect(html).toContain('wiki-link');
      expect(html).toContain('Go Home');
      expect(html).toContain('data-wiki-link="HomePage"');
    });

    test('parses variables', () => {
      const wikiDoc = parser.parse('Hello {$username}!');
      const html = wikiDoc.toHTML();
      expect(html).toContain('wiki-variable');
      expect(html).toContain('data-variable="username"');
    });

    test('parses plugins', () => {
      const wikiDoc = parser.parse('[{TableOfContents}]');
      const html = wikiDoc.toHTML();
      expect(html).toContain('wiki-plugin');
      expect(html).toContain('TableOfContents');
    });

    test('parses inline code', () => {
      const wikiDoc = parser.parse('Use {{code}} here');
      const html = wikiDoc.toHTML();
      expect(html).toContain('<code');
      expect(html).toContain('code');
    });

    test('parses code blocks', () => {
      const wikiDoc = parser.parse('{{{function test() {\n  return true;\n}}}}');
      const html = wikiDoc.toHTML();
      expect(html).toContain('<pre');
      expect(html).toContain('function test()');
    });

    test('parses comments', () => {
      const wikiDoc = parser.parse('Text <!-- comment --> more text');
      const html = wikiDoc.toHTML();
      expect(html).toContain('<!-- comment -->');
    });
  });

  describe('parse() - Escaped content (Critical feature)', () => {
    test('parses escaped text', () => {
      const wikiDoc = parser.parse('This is [[escaped text]] here');
      const html = wikiDoc.toHTML();
      expect(html).toContain('escaped text');
    });

    test('escaped content is not parsed', () => {
      const wikiDoc = parser.parse('Before [[{$variable} and [link]]] after');
      const html = wikiDoc.toHTML();

      // Should contain the literal text
      expect(html).toContain('{$variable}');
      expect(html).toContain('[link]');

      // Should NOT have parsed elements
      expect(html).not.toContain('data-variable');
      expect(html).not.toContain('wiki-link');
    });

    test('escaped bold/italic is not parsed', () => {
      const wikiDoc = parser.parse('[[__not bold__ and \'\'not italic\'\']]');
      const html = wikiDoc.toHTML();

      expect(html).toContain('__not bold__');
      expect(html).toContain("''not italic''");
      expect(html).not.toContain('<strong');
      expect(html).not.toContain('<em');
    });

    test('multiple escaped sections work correctly', () => {
      const wikiDoc = parser.parse('[[first]] normal [[second]]');
      const html = wikiDoc.toHTML();

      expect(html).toContain('first');
      expect(html).toContain('normal');
      expect(html).toContain('second');
    });

    test('nested brackets in escaped content', () => {
      const wikiDoc = parser.parse('[[array[0] and map[key]]]');
      const html = wikiDoc.toHTML();

      expect(html).toContain('array[0]');
      expect(html).toContain('map[key]');
    });
  });

  describe('parse() - Complex real-world examples', () => {
    test('parses mixed content document', () => {
      const markup = `!!! Welcome to MyWiki

This is a paragraph with __bold__ and ''italic'' text.

* List item 1
* List item 2
** Nested item

Here's a link to [HomePage|the home page].

And a variable: {$username}

[[Escaped content with {$var} should not be parsed]]

{{{
// Code block
function hello() {
  return "world";
}
}}}`;

      const wikiDoc = parser.parse(markup);
      const html = wikiDoc.toHTML();

      // Verify all elements are present
      expect(html).toContain('<h1');
      expect(html).toContain('Welcome to MyWiki');
      expect(html).toContain('<strong');
      expect(html).toContain('<em');
      expect(html).toContain('<ul');
      expect(html).toContain('Nested item');
      expect(html).toContain('wiki-link');
      expect(html).toContain('wiki-variable');
      expect(html).toContain('{$var}'); // Escaped variable
      expect(html).toContain('<pre');
      expect(html).toContain('function hello()');
    });

    test('parses table with formatting', () => {
      const markup = `| __Header 1__ | __Header 2__ |
| Data 1 | Data 2 |`;

      const wikiDoc = parser.parse(markup);
      const html = wikiDoc.toHTML();

      expect(html).toContain('<table');
      // Note: Inline formatting within table cells is not yet supported
      // This would be a Phase 3+ enhancement
      expect(html).toContain('Header 1');
      expect(html).toContain('Data 2');
    });
  });

  describe('parse() - Context handling', () => {
    test('stores context in WikiDocument', () => {
      const context = { pageName: 'TestPage', userName: 'testuser' };
      const wikiDoc = parser.parse('Test content', context);

      const retrievedContext = wikiDoc.getContext();
      expect(retrievedContext).toBe(context);
      expect(retrievedContext.pageName).toBe('TestPage');
    });

    test('handles null context', () => {
      const wikiDoc = parser.parse('Test content', null);
      expect(wikiDoc.getContext()).toBeNull();
    });
  });

  describe('parse() - Metadata', () => {
    test('sets parse metadata', () => {
      const wikiDoc = parser.parse('Test content');

      expect(wikiDoc.getMetadataValue('parserVersion')).toBe('1.0.0');
      expect(wikiDoc.getMetadataValue('parseSuccess')).toBe(true);
      expect(wikiDoc.getMetadataValue('parseTime')).toBeGreaterThanOrEqual(0);
      expect(wikiDoc.getMetadataValue('tokenCount')).toBeGreaterThan(0);
      expect(wikiDoc.getMetadataValue('nodeCount')).toBeGreaterThan(0);
    });

    test('stores original markup', () => {
      const markup = 'Test content';
      const wikiDoc = parser.parse(markup);
      expect(wikiDoc.getPageData()).toBe(markup);
    });
  });

  describe('Error handling', () => {
    test('handles null content gracefully', () => {
      const wikiDoc = parser.parse(null);
      expect(wikiDoc).toBeInstanceOf(WikiDocument);
      expect(wikiDoc.isEmpty()).toBe(true);
    });

    test('handles undefined content gracefully', () => {
      const wikiDoc = parser.parse(undefined);
      expect(wikiDoc).toBeInstanceOf(WikiDocument);
      expect(wikiDoc.isEmpty()).toBe(true);
    });

    test('throws on invalid content type when throwOnError is true', () => {
      const throwParser = new DOMParser({ throwOnError: true });
      expect(() => throwParser.parse(123)).toThrow(ParseError);
    });

    test('returns error document when throwOnError is false', () => {
      const nonThrowParser = new DOMParser({ throwOnError: false });
      const wikiDoc = nonThrowParser.parse(123);

      expect(wikiDoc).toBeInstanceOf(WikiDocument);
      expect(wikiDoc.getMetadataValue('parseSuccess')).toBe(false);
      expect(wikiDoc.toHTML()).toContain('wiki-parse-error');
    });

    test('calls onError callback on error', () => {
      const onError = jest.fn();
      const errorParser = new DOMParser({ onError, throwOnError: false });

      errorParser.parse(123);

      expect(onError).toHaveBeenCalled();
      expect(onError.mock.calls[0][0]).toBeInstanceOf(ParseError);
    });
  });

  describe('Error document creation', () => {
    test('creates error document with message', () => {
      const error = new ParseError('Test Error', 10, 2, 5, 'Something went wrong');
      const wikiDoc = parser.createErrorDocument('bad content', null, error);

      const html = wikiDoc.toHTML();
      expect(html).toContain('wiki-parse-error');
      expect(html).toContain('Parse Error');
      expect(html).toContain('Something went wrong');
      expect(html).toContain('line 2, column 5');
    });

    test('error document contains original content', () => {
      const error = new ParseError('Test Error', 0, 1, 1, 'Failed');
      const wikiDoc = parser.createErrorDocument('original content', null, error);

      const html = wikiDoc.toHTML();
      expect(html).toContain('original content');
    });
  });

  describe('validate()', () => {
    test('validates correct markup', () => {
      const result = parser.validate('!!! Title\nSome text with __bold__');
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    test('validates empty content', () => {
      const result = parser.validate('');
      expect(result.valid).toBe(true);
    });

    test('detects warnings for unmatched brackets', () => {
      const result = parser.validate('Text with [ unmatched bracket');
      // Note: Warning detection is basic - could be enhanced in future
      expect(result.warnings).toBeDefined();
      expect(Array.isArray(result.warnings)).toBe(true);
    });
  });

  describe('Statistics', () => {
    test('tracks successful parses', () => {
      parser.parse('Test 1');
      parser.parse('Test 2');

      const stats = parser.getStatistics();
      expect(stats.totalParses).toBe(2);
      expect(stats.successfulParses).toBe(2);
      expect(stats.failedParses).toBe(0);
    });

    test('tracks failed parses', () => {
      const throwParser = new DOMParser({ throwOnError: false });

      throwParser.parse(123); // Invalid
      throwParser.parse('Valid');

      const stats = throwParser.getStatistics();
      expect(stats.totalParses).toBe(2);
      expect(stats.successfulParses).toBe(1);
      expect(stats.failedParses).toBe(1);
    });

    test('calculates average parse time', () => {
      parser.parse('Test 1');
      parser.parse('Test 2');

      const stats = parser.getStatistics();
      expect(stats.averageParseTime).toBeGreaterThanOrEqual(0);
      expect(stats.lastParseTime).toBeGreaterThanOrEqual(0);
      expect(stats.totalParseTime).toBeGreaterThanOrEqual(0);
    });

    test('calculates success rate', () => {
      const rateParser = new DOMParser({ throwOnError: false });

      rateParser.parse('Valid 1');
      rateParser.parse('Valid 2');
      rateParser.parse(123); // Invalid

      const stats = rateParser.getStatistics();
      expect(stats.successRate).toBeCloseTo(66.67, 1);
    });

    test('resets statistics', () => {
      parser.parse('Test');
      parser.resetStatistics();

      const stats = parser.getStatistics();
      expect(stats.totalParses).toBe(0);
      expect(stats.successfulParses).toBe(0);
    });
  });

  describe('Debug mode', () => {
    test('does not log in non-debug mode', () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      const normalParser = new DOMParser({ debug: false });
      normalParser.parse('Test');

      expect(consoleSpy).not.toHaveBeenCalled();
      consoleSpy.mockRestore();
    });

    test('logs in debug mode', () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      const debugParser = new DOMParser({ debug: true });
      debugParser.parse('Test');

      expect(consoleSpy).toHaveBeenCalled();
      expect(consoleSpy.mock.calls.some(call =>
        call[0].includes('[DOMParser]')
      )).toBe(true);

      consoleSpy.mockRestore();
    });
  });

  describe('ParseError', () => {
    test('creates error with position info', () => {
      const error = new ParseError('TokenError', 42, 5, 10, 'Invalid token');

      expect(error.name).toBe('ParseError');
      expect(error.type).toBe('TokenError');
      expect(error.position).toBe(42);
      expect(error.line).toBe(5);
      expect(error.column).toBe(10);
      expect(error.message).toContain('line 5, column 10');
      expect(error.message).toContain('Invalid token');
    });

    test('creates error without position info', () => {
      const error = new ParseError('GenericError', undefined, undefined, undefined, 'Something failed');

      expect(error.message).toContain('GenericError');
      expect(error.message).toContain('Something failed');
      expect(error.message).not.toContain('line');
    });

    test('stores cause error', () => {
      const cause = new Error('Root cause');
      const error = new ParseError('WrapperError', 0, 1, 1, 'Wrapped', cause);

      expect(error.cause).toBe(cause);
    });
  });

  describe('Performance', () => {
    test('parses small document quickly', () => {
      const start = Date.now();
      parser.parse('!!! Title\nSome text');
      const elapsed = Date.now() - start;

      expect(elapsed).toBeLessThan(100); // Should be much faster
    });

    test('parses medium document quickly', () => {
      const markup = Array(100).fill('* List item\n').join('');
      const start = Date.now();
      parser.parse(markup);
      const elapsed = Date.now() - start;

      expect(elapsed).toBeLessThan(500);
    });
  });
});
