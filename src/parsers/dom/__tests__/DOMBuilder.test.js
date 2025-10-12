/**
 * Unit tests for DOMBuilder
 * Tests conversion of tokens to DOM nodes
 */

const DOMBuilder = require('../DOMBuilder');
const WikiDocument = require('../WikiDocument');
const { Tokenizer, TokenType } = require('../Tokenizer');

describe('DOMBuilder', () => {
  let wikiDoc;
  let builder;

  beforeEach(() => {
    wikiDoc = new WikiDocument('', null);
    builder = new DOMBuilder(wikiDoc);
  });

  describe('Constructor', () => {
    test('creates builder with WikiDocument', () => {
      expect(builder.wikiDocument).toBe(wikiDoc);
      expect(builder.currentParent).toBeNull();
    });
  });

  describe('buildFromTokens()', () => {
    test('builds empty document from empty token array', () => {
      const tokens = [
        { type: TokenType.EOF, value: '', position: 0, line: 1, column: 1 }
      ];
      builder.buildFromTokens(tokens);
      expect(wikiDoc.isEmpty()).toBe(true);
    });

    test('builds document from simple text token', () => {
      const tokens = [
        { type: TokenType.TEXT, value: 'Hello', position: 0, line: 1, column: 1 },
        { type: TokenType.EOF, value: '', position: 5, line: 1, column: 6 }
      ];
      builder.buildFromTokens(tokens);

      const html = wikiDoc.toHTML();
      expect(html).toContain('Hello');
      expect(html).toContain('<p');
    });
  });

  describe('Text and Escaped Content', () => {
    test('handles plain text', () => {
      const tokens = [
        { type: TokenType.TEXT, value: 'Plain text', position: 0, line: 1, column: 1 },
        { type: TokenType.EOF, value: '', position: 10, line: 1, column: 11 }
      ];
      builder.buildFromTokens(tokens);

      const html = wikiDoc.toHTML();
      expect(html).toContain('Plain text');
    });

    test('handles escaped text', () => {
      const tokens = [
        { type: TokenType.ESCAPED, value: 'escaped content', position: 0, line: 1, column: 1 },
        { type: TokenType.EOF, value: '', position: 15, line: 1, column: 16 }
      ];
      builder.buildFromTokens(tokens);

      const html = wikiDoc.toHTML();
      expect(html).toContain('escaped content');
    });

    test('combines text and escaped content', () => {
      const tokens = [
        { type: TokenType.TEXT, value: 'Before ', position: 0, line: 1, column: 1 },
        { type: TokenType.ESCAPED, value: 'escaped', position: 7, line: 1, column: 8 },
        { type: TokenType.TEXT, value: ' after', position: 14, line: 1, column: 15 },
        { type: TokenType.EOF, value: '', position: 20, line: 1, column: 21 }
      ];
      builder.buildFromTokens(tokens);

      const html = wikiDoc.toHTML();
      expect(html).toContain('Before');
      expect(html).toContain('escaped');
      expect(html).toContain('after');
    });
  });

  describe('Variables', () => {
    test('creates variable span element', () => {
      const tokens = [
        {
          type: TokenType.VARIABLE,
          value: 'username',
          position: 0,
          line: 1,
          column: 1,
          metadata: { varName: 'username' }
        },
        { type: TokenType.EOF, value: '', position: 10, line: 1, column: 11 }
      ];
      builder.buildFromTokens(tokens);

      const html = wikiDoc.toHTML();
      expect(html).toContain('wiki-variable');
      expect(html).toContain('data-variable="username"');
    });
  });

  describe('Plugins', () => {
    test('creates plugin div element', () => {
      const tokens = [
        {
          type: TokenType.PLUGIN,
          value: 'INSERT com.example.Plugin',
          position: 0,
          line: 1,
          column: 1,
          metadata: { pluginContent: 'INSERT com.example.Plugin' }
        },
        { type: TokenType.EOF, value: '', position: 27, line: 1, column: 28 }
      ];
      builder.buildFromTokens(tokens);

      const html = wikiDoc.toHTML();
      expect(html).toContain('wiki-plugin');
      expect(html).toContain('data-plugin-content');
    });
  });

  describe('Links', () => {
    test('creates link element with text', () => {
      const tokens = [
        {
          type: TokenType.LINK,
          value: 'WikiPage|Link Text',
          position: 0,
          line: 1,
          column: 1,
          metadata: { link: 'WikiPage', text: 'Link Text' }
        },
        { type: TokenType.EOF, value: '', position: 18, line: 1, column: 19 }
      ];
      builder.buildFromTokens(tokens);

      const html = wikiDoc.toHTML();
      expect(html).toContain('<a');
      expect(html).toContain('wiki-link');
      expect(html).toContain('Link Text');
      expect(html).toContain('data-wiki-link="WikiPage"');
    });

    test('creates link element without text', () => {
      const tokens = [
        {
          type: TokenType.LINK,
          value: 'WikiPage',
          position: 0,
          line: 1,
          column: 1,
          metadata: { link: 'WikiPage', text: null }
        },
        { type: TokenType.EOF, value: '', position: 8, line: 1, column: 9 }
      ];
      builder.buildFromTokens(tokens);

      const html = wikiDoc.toHTML();
      expect(html).toContain('WikiPage');
    });
  });

  describe('Headings', () => {
    test('creates h1 for level 3 (!!!)', () => {
      const tokens = [
        {
          type: TokenType.HEADING,
          value: 'Main Title',
          position: 0,
          line: 1,
          column: 1,
          metadata: { level: 3 }
        },
        { type: TokenType.EOF, value: '', position: 14, line: 1, column: 15 }
      ];
      builder.buildFromTokens(tokens);

      const html = wikiDoc.toHTML();
      expect(html).toContain('<h1');
      expect(html).toContain('Main Title');
    });

    test('creates h2 for level 2 (!!)', () => {
      const tokens = [
        {
          type: TokenType.HEADING,
          value: 'Subtitle',
          position: 0,
          line: 1,
          column: 1,
          metadata: { level: 2 }
        },
        { type: TokenType.EOF, value: '', position: 11, line: 1, column: 12 }
      ];
      builder.buildFromTokens(tokens);

      const html = wikiDoc.toHTML();
      expect(html).toContain('<h2');
      expect(html).toContain('Subtitle');
    });

    test('creates h3 for level 1 (!)', () => {
      const tokens = [
        {
          type: TokenType.HEADING,
          value: 'Section',
          position: 0,
          line: 1,
          column: 1,
          metadata: { level: 1 }
        },
        { type: TokenType.EOF, value: '', position: 9, line: 1, column: 10 }
      ];
      builder.buildFromTokens(tokens);

      const html = wikiDoc.toHTML();
      expect(html).toContain('<h3');
      expect(html).toContain('Section');
    });
  });

  describe('Lists', () => {
    test('creates simple unordered list', () => {
      const tokens = [
        {
          type: TokenType.LIST_ITEM,
          value: 'Item 1',
          position: 0,
          line: 1,
          column: 1,
          metadata: { marker: '*', level: 1, ordered: false }
        },
        {
          type: TokenType.LIST_ITEM,
          value: 'Item 2',
          position: 9,
          line: 2,
          column: 1,
          metadata: { marker: '*', level: 1, ordered: false }
        },
        { type: TokenType.EOF, value: '', position: 18, line: 3, column: 1 }
      ];
      builder.buildFromTokens(tokens);

      const html = wikiDoc.toHTML();
      expect(html).toContain('<ul');
      expect(html).toContain('<li');
      expect(html).toContain('Item 1');
      expect(html).toContain('Item 2');
    });

    test('creates ordered list', () => {
      const tokens = [
        {
          type: TokenType.LIST_ITEM,
          value: 'First',
          position: 0,
          line: 1,
          column: 1,
          metadata: { marker: '#', level: 1, ordered: true }
        },
        {
          type: TokenType.LIST_ITEM,
          value: 'Second',
          position: 8,
          line: 2,
          column: 1,
          metadata: { marker: '#', level: 1, ordered: true }
        },
        { type: TokenType.EOF, value: '', position: 16, line: 3, column: 1 }
      ];
      builder.buildFromTokens(tokens);

      const html = wikiDoc.toHTML();
      expect(html).toContain('<ol');
      expect(html).toContain('First');
      expect(html).toContain('Second');
    });

    test('creates nested lists', () => {
      const tokens = [
        {
          type: TokenType.LIST_ITEM,
          value: 'Level 1',
          position: 0,
          line: 1,
          column: 1,
          metadata: { marker: '*', level: 1, ordered: false }
        },
        {
          type: TokenType.LIST_ITEM,
          value: 'Level 2',
          position: 10,
          line: 2,
          column: 1,
          metadata: { marker: '*', level: 2, ordered: false }
        },
        {
          type: TokenType.LIST_ITEM,
          value: 'Level 1 again',
          position: 20,
          line: 3,
          column: 1,
          metadata: { marker: '*', level: 1, ordered: false }
        },
        { type: TokenType.EOF, value: '', position: 35, line: 4, column: 1 }
      ];
      builder.buildFromTokens(tokens);

      const html = wikiDoc.toHTML();
      expect(html).toContain('Level 1');
      expect(html).toContain('Level 2');
      expect(html).toContain('Level 1 again');

      // Count number of ul elements (should have nested ul)
      const ulMatches = html.match(/<ul/g);
      expect(ulMatches.length).toBeGreaterThan(1);
    });
  });

  describe('Tables', () => {
    test('creates simple table', () => {
      const tokens = [
        {
          type: TokenType.TABLE_CELL,
          value: 'Cell 1',
          position: 0,
          line: 1,
          column: 1
        },
        {
          type: TokenType.TABLE_CELL,
          value: 'Cell 2',
          position: 9,
          line: 1,
          column: 10
        },
        { type: TokenType.EOF, value: '', position: 18, line: 1, column: 19 }
      ];
      builder.buildFromTokens(tokens);

      const html = wikiDoc.toHTML();
      expect(html).toContain('<table');
      expect(html).toContain('<tr');
      expect(html).toContain('<td');
      expect(html).toContain('Cell 1');
      expect(html).toContain('Cell 2');
    });

    test('creates table with multiple rows', () => {
      const tokens = [
        {
          type: TokenType.TABLE_CELL,
          value: 'Row 1 Cell 1',
          position: 0,
          line: 1,
          column: 1
        },
        {
          type: TokenType.TABLE_CELL,
          value: 'Row 1 Cell 2',
          position: 15,
          line: 1,
          column: 16
        },
        {
          type: TokenType.NEWLINE,
          value: '\n',
          position: 30,
          line: 1,
          column: 31
        },
        {
          type: TokenType.TABLE_CELL,
          value: 'Row 2 Cell 1',
          position: 31,
          line: 2,
          column: 1
        },
        {
          type: TokenType.TABLE_CELL,
          value: 'Row 2 Cell 2',
          position: 46,
          line: 2,
          column: 16
        },
        { type: TokenType.EOF, value: '', position: 61, line: 2, column: 31 }
      ];
      builder.buildFromTokens(tokens);

      const html = wikiDoc.toHTML();
      expect(html).toContain('Row 1 Cell 1');
      expect(html).toContain('Row 2 Cell 2');

      // Count table rows
      const trMatches = html.match(/<tr/g);
      expect(trMatches.length).toBe(2);
    });
  });

  describe('Formatting', () => {
    test('creates bold text', () => {
      const tokens = [
        {
          type: TokenType.BOLD,
          value: 'bold text',
          position: 0,
          line: 1,
          column: 1
        },
        { type: TokenType.EOF, value: '', position: 13, line: 1, column: 14 }
      ];
      builder.buildFromTokens(tokens);

      const html = wikiDoc.toHTML();
      expect(html).toContain('<strong');
      expect(html).toContain('bold text');
    });

    test('creates italic text', () => {
      const tokens = [
        {
          type: TokenType.ITALIC,
          value: 'italic text',
          position: 0,
          line: 1,
          column: 1
        },
        { type: TokenType.EOF, value: '', position: 15, line: 1, column: 16 }
      ];
      builder.buildFromTokens(tokens);

      const html = wikiDoc.toHTML();
      expect(html).toContain('<em');
      expect(html).toContain('italic text');
    });

    test('creates inline code', () => {
      const tokens = [
        {
          type: TokenType.CODE_INLINE,
          value: 'code',
          position: 0,
          line: 1,
          column: 1
        },
        { type: TokenType.EOF, value: '', position: 8, line: 1, column: 9 }
      ];
      builder.buildFromTokens(tokens);

      const html = wikiDoc.toHTML();
      expect(html).toContain('<code');
      expect(html).toContain('code');
    });

    test('creates code block', () => {
      const tokens = [
        {
          type: TokenType.CODE_BLOCK,
          value: 'function test() {\n  return true;\n}',
          position: 0,
          line: 1,
          column: 1
        },
        { type: TokenType.EOF, value: '', position: 40, line: 3, column: 6 }
      ];
      builder.buildFromTokens(tokens);

      const html = wikiDoc.toHTML();
      expect(html).toContain('<pre');
      expect(html).toContain('<code');
      expect(html).toContain('function test()');
    });
  });

  describe('Comments', () => {
    test('creates comment node', () => {
      const tokens = [
        {
          type: TokenType.COMMENT,
          value: ' This is a comment ',
          position: 0,
          line: 1,
          column: 1
        },
        { type: TokenType.EOF, value: '', position: 24, line: 1, column: 25 }
      ];
      builder.buildFromTokens(tokens);

      const html = wikiDoc.toHTML();
      expect(html).toContain('<!-- This is a comment -->');
    });
  });

  describe('Complex scenarios', () => {
    test('handles mixed content correctly', () => {
      const tokens = [
        {
          type: TokenType.HEADING,
          value: 'Title',
          position: 0,
          line: 1,
          column: 1,
          metadata: { level: 2 }
        },
        {
          type: TokenType.TEXT,
          value: 'Some text with ',
          position: 10,
          line: 2,
          column: 1
        },
        {
          type: TokenType.BOLD,
          value: 'bold',
          position: 25,
          line: 2,
          column: 16
        },
        {
          type: TokenType.TEXT,
          value: ' and ',
          position: 33,
          line: 2,
          column: 24
        },
        {
          type: TokenType.ITALIC,
          value: 'italic',
          position: 38,
          line: 2,
          column: 29
        },
        { type: TokenType.EOF, value: '', position: 48, line: 2, column: 39 }
      ];
      builder.buildFromTokens(tokens);

      const html = wikiDoc.toHTML();
      expect(html).toContain('<h2');
      expect(html).toContain('Title');
      expect(html).toContain('Some text with');
      expect(html).toContain('<strong');
      expect(html).toContain('bold');
      expect(html).toContain('<em');
      expect(html).toContain('italic');
    });

    test('properly closes contexts when switching', () => {
      const tokens = [
        {
          type: TokenType.TEXT,
          value: 'Paragraph',
          position: 0,
          line: 1,
          column: 1
        },
        {
          type: TokenType.LIST_ITEM,
          value: 'List item',
          position: 11,
          line: 2,
          column: 1,
          metadata: { marker: '*', level: 1, ordered: false }
        },
        {
          type: TokenType.TABLE_CELL,
          value: 'Cell',
          position: 23,
          line: 3,
          column: 1
        },
        { type: TokenType.EOF, value: '', position: 29, line: 3, column: 7 }
      ];
      builder.buildFromTokens(tokens);

      const html = wikiDoc.toHTML();
      expect(html).toContain('<p');
      expect(html).toContain('<ul');
      expect(html).toContain('<table');
    });
  });

  describe('Integration with Tokenizer', () => {
    test('builds DOM from tokenized wiki markup', () => {
      const markup = '!!! Heading\nSome text with __bold__ and [[escaped]] content.';
      const tokenizer = new Tokenizer(markup);
      const tokens = tokenizer.tokenize();

      const wikiDoc = new WikiDocument(markup, null);
      const builder = new DOMBuilder(wikiDoc);
      builder.buildFromTokens(tokens);

      const html = wikiDoc.toHTML();
      expect(html).toContain('<h1');
      expect(html).toContain('Heading');
      expect(html).toContain('Some text');
      expect(html).toContain('<strong');
      expect(html).toContain('bold');
      expect(html).toContain('escaped');
    });

    test('preserves escaped content without parsing', () => {
      const markup = 'Text [[with {$variable} and [link] inside]] more text';
      const tokenizer = new Tokenizer(markup);
      const tokens = tokenizer.tokenize();

      const wikiDoc = new WikiDocument(markup, null);
      const builder = new DOMBuilder(wikiDoc);
      builder.buildFromTokens(tokens);

      const html = wikiDoc.toHTML();

      // Escaped content should appear as plain text
      expect(html).toContain('with {$variable} and [link] inside');

      // Should NOT have variable or link elements
      expect(html).not.toContain('data-variable');
      expect(html).not.toContain('data-wiki-link');
    });
  });
});
