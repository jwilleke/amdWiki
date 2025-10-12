/**
 * Token recognition tests for Tokenizer
 * Tests the parsing of different wiki markup tokens
 */

const { Tokenizer, TokenType } = require('../Tokenizer');

describe('Token Recognition', () => {
  describe('Escaped text [[...]]', () => {
    test('parses simple escaped text', () => {
      const tokenizer = new Tokenizer('[[escaped text]]');
      const tokens = tokenizer.tokenize();

      expect(tokens).toHaveLength(2); // ESCAPED + EOF
      expect(tokens[0].type).toBe(TokenType.ESCAPED);
      expect(tokens[0].value).toBe('escaped text');
    });

    test('handles escaped brackets with special chars', () => {
      const tokenizer = new Tokenizer('[[{$variable} [link] __bold__]]');
      const tokens = tokenizer.tokenize();

      expect(tokens).toHaveLength(2);
      expect(tokens[0].type).toBe(TokenType.ESCAPED);
      expect(tokens[0].value).toBe('{$variable} [link] __bold__');
    });

    test('handles multiple escaped sections', () => {
      const tokenizer = new Tokenizer('text [[escaped1]] more [[escaped2]]');
      const tokens = tokenizer.tokenize();

      expect(tokens.filter(t => t.type === TokenType.ESCAPED)).toHaveLength(2);
      expect(tokens[1].value).toBe('escaped1');
      expect(tokens[3].value).toBe('escaped2');
    });
  });

  describe('Variables {$...}', () => {
    test('parses simple variable', () => {
      const tokenizer = new Tokenizer('{$username}');
      const tokens = tokenizer.tokenize();

      expect(tokens[0].type).toBe(TokenType.VARIABLE);
      expect(tokens[0].value).toBe('username');
      expect(tokens[0].metadata.varName).toBe('username');
    });

    test('parses multiple variables', () => {
      const tokenizer = new Tokenizer('Hello {$name}, your score is {$score}');
      const tokens = tokenizer.tokenize();

      const varTokens = tokens.filter(t => t.type === TokenType.VARIABLE);
      expect(varTokens).toHaveLength(2);
      expect(varTokens[0].value).toBe('name');
      expect(varTokens[1].value).toBe('score');
    });
  });

  describe('Plugins [{...}]', () => {
    test('parses simple plugin', () => {
      const tokenizer = new Tokenizer('[{INSERT com.example.Plugin}]');
      const tokens = tokenizer.tokenize();

      expect(tokens[0].type).toBe(TokenType.PLUGIN);
      expect(tokens[0].value).toBe('INSERT com.example.Plugin');
    });

    test('parses plugin with parameters', () => {
      const tokenizer = new Tokenizer('[{TableOfContents numbered=true}]');
      const tokens = tokenizer.tokenize();

      expect(tokens[0].type).toBe(TokenType.PLUGIN);
      expect(tokens[0].metadata.pluginContent).toContain('numbered=true');
    });
  });

  describe('Links [...]', () => {
    test('parses simple link', () => {
      const tokenizer = new Tokenizer('[WikiPage]');
      const tokens = tokenizer.tokenize();

      expect(tokens[0].type).toBe(TokenType.WIKI_TAG);
      expect(tokens[0].value).toBe('WikiPage');
    });

    test('parses link with text', () => {
      // JSPWiki syntax: [DisplayText|Target]
      const tokenizer = new Tokenizer('[Link Text|WikiPage]');
      const tokens = tokenizer.tokenize();

      expect(tokens[0].type).toBe(TokenType.LINK);
      expect(tokens[0].metadata.link).toBe('WikiPage'); // Target
      expect(tokens[0].metadata.text).toBe('Link Text'); // Display text
    });
  });

  describe('Headings', () => {
    test('parses level 1 heading', () => {
      const tokenizer = new Tokenizer('!!! Heading 1');
      const tokens = tokenizer.tokenize();

      expect(tokens[0].type).toBe(TokenType.HEADING);
      expect(tokens[0].value).toBe('Heading 1');
      expect(tokens[0].metadata.level).toBe(3);
    });

    test('parses level 2 heading', () => {
      const tokenizer = new Tokenizer('!! Heading 2');
      const tokens = tokenizer.tokenize();

      expect(tokens[0].type).toBe(TokenType.HEADING);
      expect(tokens[0].metadata.level).toBe(2);
    });

    test('parses level 3 heading', () => {
      const tokenizer = new Tokenizer('! Heading 3');
      const tokens = tokenizer.tokenize();

      expect(tokens[0].type).toBe(TokenType.HEADING);
      expect(tokens[0].metadata.level).toBe(1);
    });
  });

  describe('Lists', () => {
    test('parses unordered list item', () => {
      const tokenizer = new Tokenizer('* List item');
      const tokens = tokenizer.tokenize();

      expect(tokens[0].type).toBe(TokenType.LIST_ITEM);
      expect(tokens[0].value).toBe('List item');
      expect(tokens[0].metadata.marker).toBe('*');
      expect(tokens[0].metadata.level).toBe(1);
      expect(tokens[0].metadata.ordered).toBe(false);
    });

    test('parses ordered list item', () => {
      const tokenizer = new Tokenizer('# Numbered item');
      const tokens = tokenizer.tokenize();

      expect(tokens[0].type).toBe(TokenType.LIST_ITEM);
      expect(tokens[0].metadata.marker).toBe('#');
      expect(tokens[0].metadata.ordered).toBe(true);
    });

    test('parses nested list', () => {
      const tokenizer = new Tokenizer('** Nested item');
      const tokens = tokenizer.tokenize();

      expect(tokens[0].type).toBe(TokenType.LIST_ITEM);
      expect(tokens[0].metadata.level).toBe(2);
    });
  });

  describe('Tables', () => {
    test('parses table cells', () => {
      const tokenizer = new Tokenizer('| Cell 1 | Cell 2 |');
      const tokens = tokenizer.tokenize();

      const cells = tokens.filter(t => t.type === TokenType.TABLE_CELL);
      expect(cells).toHaveLength(3);
      expect(cells[0].value).toBe('Cell 1');
      expect(cells[1].value).toBe('Cell 2');
    });
  });

  describe('Formatting', () => {
    test('parses bold text', () => {
      const tokenizer = new Tokenizer('__bold text__');
      const tokens = tokenizer.tokenize();

      expect(tokens[0].type).toBe(TokenType.BOLD);
      expect(tokens[0].value).toBe('bold text');
    });

    test('parses italic text', () => {
      const tokenizer = new Tokenizer("''italic text''");
      const tokens = tokenizer.tokenize();

      expect(tokens[0].type).toBe(TokenType.ITALIC);
      expect(tokens[0].value).toBe('italic text');
    });

    test('parses inline code', () => {
      const tokenizer = new Tokenizer('{{code}}');
      const tokens = tokenizer.tokenize();

      expect(tokens[0].type).toBe(TokenType.CODE_INLINE);
      expect(tokens[0].value).toBe('code');
    });

    test('parses code block', () => {
      const tokenizer = new Tokenizer('{{{code block}}}');
      const tokens = tokenizer.tokenize();

      expect(tokens[0].type).toBe(TokenType.CODE_BLOCK);
      expect(tokens[0].value).toBe('code block');
    });
  });

  describe('Comments', () => {
    test('parses HTML comment', () => {
      const tokenizer = new Tokenizer('<!-- comment -->');
      const tokens = tokenizer.tokenize();

      expect(tokens[0].type).toBe(TokenType.COMMENT);
      expect(tokens[0].value).toBe(' comment ');
    });
  });

  describe('Plain text', () => {
    test('parses plain text', () => {
      const tokenizer = new Tokenizer('plain text');
      const tokens = tokenizer.tokenize();

      expect(tokens[0].type).toBe(TokenType.TEXT);
      expect(tokens[0].value).toBe('plain text');
    });

    test('splits text around special tokens', () => {
      const tokenizer = new Tokenizer('before __bold__ after');
      const tokens = tokenizer.tokenize();

      expect(tokens[0].type).toBe(TokenType.TEXT);
      expect(tokens[0].value).toBe('before ');
      expect(tokens[1].type).toBe(TokenType.BOLD);
      expect(tokens[2].type).toBe(TokenType.TEXT);
      expect(tokens[2].value).toBe(' after');
    });
  });

  describe('Newlines', () => {
    test('parses newlines', () => {
      const tokenizer = new Tokenizer('line1\nline2');
      const tokens = tokenizer.tokenize();

      const newlines = tokens.filter(t => t.type === TokenType.NEWLINE);
      expect(newlines).toHaveLength(1);
    });
  });

  describe('Complex wiki markup', () => {
    test('parses mixed content correctly', () => {
      const input = `!!! Title
This is [[escaped [link] text]] and {$variable}.
Some __bold__ text here
[HomePage|Click here]`;

      const tokenizer = new Tokenizer(input);
      const tokens = tokenizer.tokenize();

      // Verify key tokens are present
      const types = tokens.map(t => t.type);
      expect(types).toContain(TokenType.HEADING);
      expect(types).toContain(TokenType.ESCAPED);
      expect(types).toContain(TokenType.VARIABLE);
      expect(types).toContain(TokenType.BOLD);
      expect(types).toContain(TokenType.LINK);
    });

    test('parses list items', () => {
      const input = '* List item\n** Nested item';
      const tokenizer = new Tokenizer(input);
      const tokens = tokenizer.tokenize();

      const lists = tokens.filter(t => t.type === TokenType.LIST_ITEM);
      expect(lists).toHaveLength(2);
      expect(lists[0].metadata.level).toBe(1);
      expect(lists[1].metadata.level).toBe(2);
    });

    test('handles escaped text correctly (key feature)', () => {
      // This is the critical test - escaped text should NOT be parsed
      const input = 'Before [[no {$var} or [link] here]] after';
      const tokenizer = new Tokenizer(input);
      const tokens = tokenizer.tokenize();

      // Should be: TEXT, ESCAPED, TEXT, EOF
      expect(tokens).toHaveLength(4);
      expect(tokens[0].type).toBe(TokenType.TEXT);
      expect(tokens[1].type).toBe(TokenType.ESCAPED);
      expect(tokens[1].value).toBe('no {$var} or [link] here');
      expect(tokens[2].type).toBe(TokenType.TEXT);

      // Verify no VARIABLE or LINK tokens were created
      const types = tokens.map(t => t.type);
      expect(types).not.toContain(TokenType.VARIABLE);
      expect(types).not.toContain(TokenType.LINK);
    });
  });
});
