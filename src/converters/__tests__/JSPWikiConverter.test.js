/**
 * Tests for JSPWikiConverter
 */

const JSPWikiConverter = require('../JSPWikiConverter');

describe('JSPWikiConverter', () => {
  let converter;

  beforeEach(() => {
    converter = new JSPWikiConverter();
  });

  describe('interface properties', () => {
    it('should have correct formatId', () => {
      expect(converter.formatId).toBe('jspwiki');
    });

    it('should have correct formatName', () => {
      expect(converter.formatName).toBe('JSPWiki');
    });

    it('should have correct fileExtensions', () => {
      expect(converter.fileExtensions).toEqual(['.txt']);
    });
  });

  describe('canHandle', () => {
    it('should detect .txt files', () => {
      expect(converter.canHandle('any content', 'page.txt')).toBe(true);
      expect(converter.canHandle('any content', 'PAGE.TXT')).toBe(true);
    });

    it('should detect JSPWiki heading syntax', () => {
      expect(converter.canHandle('!!! Large Heading', 'page.wiki')).toBe(true);
      expect(converter.canHandle('!! Medium Heading', 'page.wiki')).toBe(true);
      expect(converter.canHandle('! Small Heading', 'page.wiki')).toBe(true);
    });

    it('should detect JSPWiki SET directive', () => {
      expect(converter.canHandle("[{SET title='My Page'}]", 'page.wiki')).toBe(true);
    });

    it('should detect JSPWiki bold syntax', () => {
      expect(converter.canHandle('This is __bold__ text', 'page.wiki')).toBe(true);
    });

    it('should detect JSPWiki table headers', () => {
      expect(converter.canHandle('|| Header 1 || Header 2 ||', 'page.wiki')).toBe(true);
    });

    it('should not detect plain markdown', () => {
      expect(converter.canHandle('# Markdown Heading', 'page.wiki')).toBe(false);
      expect(converter.canHandle('**bold** text', 'page.wiki')).toBe(false);
    });
  });

  describe('headings conversion', () => {
    it('should convert !!! to # (h1)', () => {
      const result = converter.convert('!!! Large Heading');
      expect(result.content).toBe('# Large Heading');
    });

    it('should convert !! to ## (h2)', () => {
      const result = converter.convert('!! Medium Heading');
      expect(result.content).toBe('## Medium Heading');
    });

    it('should convert ! to ### (h3)', () => {
      const result = converter.convert('! Small Heading');
      expect(result.content).toBe('### Small Heading');
    });

    it('should handle multiple headings', () => {
      const input = `!!! Title
!! Section
! Subsection`;
      const result = converter.convert(input);
      expect(result.content).toBe(`# Title
## Section
### Subsection`);
    });
  });

  describe('emphasis conversion', () => {
    it('should convert __text__ to **text** (bold)', () => {
      const result = converter.convert('This is __bold__ text');
      expect(result.content).toBe('This is **bold** text');
    });

    it("should convert ''text'' to *text* (italic)", () => {
      const result = converter.convert("This is ''italic'' text");
      expect(result.content).toBe('This is *italic* text');
    });

    it('should handle combined bold and italic', () => {
      const result = converter.convert("__bold__ and ''italic''");
      expect(result.content).toBe('**bold** and *italic*');
    });
  });

  describe('monospace conversion', () => {
    it('should convert {{text}} to `text`', () => {
      const result = converter.convert('Use {{code}} here');
      expect(result.content).toBe('Use `code` here');
    });
  });

  describe('code blocks conversion', () => {
    it('should convert {{{ }}} to ``` ```', () => {
      const input = `{{{
function hello() {
  return "world";
}
}}}`;
      const result = converter.convert(input);
      expect(result.content).toBe(`\`\`\`
function hello() {
  return "world";
}
\`\`\``);
    });
  });

  describe('lists conversion', () => {
    it('should convert * to - (unordered list)', () => {
      const input = `* Item 1
* Item 2
* Item 3`;
      const result = converter.convert(input);
      expect(result.content).toBe(`- Item 1
- Item 2
- Item 3`);
    });

    it('should handle nested unordered lists', () => {
      const input = `* Item 1
** Nested 1
** Nested 2
* Item 2`;
      const result = converter.convert(input);
      expect(result.content).toBe(`- Item 1
  - Nested 1
  - Nested 2
- Item 2`);
    });

    it('should convert # to 1. (ordered list)', () => {
      const input = `# First
# Second
# Third`;
      const result = converter.convert(input);
      expect(result.content).toBe(`1. First
1. Second
1. Third`);
    });

    it('should handle nested ordered lists', () => {
      const input = `# First
## Nested 1
## Nested 2
# Second`;
      const result = converter.convert(input);
      expect(result.content).toBe(`1. First
  1. Nested 1
  1. Nested 2
1. Second`);
    });
  });

  describe('horizontal rules conversion', () => {
    it('should convert ---- to ---', () => {
      const result = converter.convert('Before\n----\nAfter');
      expect(result.content).toBe('Before\n---\nAfter');
    });

    it('should handle longer dash sequences', () => {
      const result = converter.convert('--------');
      expect(result.content).toBe('---');
    });
  });

  describe('line breaks conversion', () => {
    it('should convert \\\\ to <br>', () => {
      const result = converter.convert('Line 1\\\\');
      expect(result.content).toBe('Line 1<br>');
    });
  });

  describe('links conversion', () => {
    it('should convert [PageName] to [[PageName]]', () => {
      const result = converter.convert('See [MyPage] for details');
      expect(result.content).toBe('See [[MyPage]] for details');
    });

    it('should convert [text|PageName] to [[PageName|text]]', () => {
      const result = converter.convert('[click here|MyPage]');
      expect(result.content).toBe('[[MyPage|click here]]');
    });

    it('should convert external links to markdown format', () => {
      const result = converter.convert('[Google|https://google.com]');
      expect(result.content).toBe('[Google](https://google.com)');
    });

    it('should handle bare external URLs', () => {
      const result = converter.convert('[https://example.com]');
      expect(result.content).toBe('https://example.com');
    });
  });

  describe('definition lists conversion', () => {
    it('should convert ;term:definition to **term**: definition', () => {
      const result = converter.convert(';Wiki:A collaborative website');
      expect(result.content).toBe('**Wiki**: A collaborative website');
    });
  });

  describe('footnotes conversion', () => {
    it('should convert [1] to [^1]', () => {
      const result = converter.convert('See note[1]');
      expect(result.content).toBe('See note[^1]');
    });

    it('should convert [#1] to [^1]:', () => {
      const result = converter.convert('[#1] This is a footnote');
      expect(result.content).toBe('[^1]: This is a footnote');
    });
  });

  describe('SET attributes extraction', () => {
    it('should extract title attribute', () => {
      const result = converter.convert("[{SET title='My Page Title'}]\nContent here");
      expect(result.metadata['title']).toBe('My Page Title');
      expect(result.content).toBe('Content here');
    });

    it('should extract author attribute', () => {
      const result = converter.convert('[{SET author=JohnDoe}]');
      expect(result.metadata['author']).toBe('JohnDoe');
    });

    it('should store custom attributes in jspwiki namespace', () => {
      const result = converter.convert("[{SET customField='value123'}]");
      expect(result.metadata['jspwiki']['customField']).toBe('value123');
    });
  });

  describe('tables conversion', () => {
    it('should convert JSPWiki table headers', () => {
      const input = '|| Header 1 || Header 2 ||';
      const result = converter.convert(input);
      expect(result.content).toContain('| Header 1 | Header 2 |');
      expect(result.content).toContain('| --- | --- |');
    });

    it('should convert full JSPWiki table', () => {
      const input = `|| Name || Age ||
| Alice | 30 |
| Bob | 25 |`;
      const result = converter.convert(input);
      expect(result.content).toContain('| Name | Age |');
      expect(result.content).toContain('| --- | --- |');
      expect(result.content).toContain('| Alice | 30 |');
      expect(result.content).toContain('| Bob | 25 |');
    });
  });

  describe('complex document conversion', () => {
    it('should handle a complete JSPWiki document', () => {
      const input = `[{SET title='Sample Page'}]

!!! Welcome to JSPWiki

This is a __sample__ page with ''various'' formatting.

!! Features

* Easy to use
* Collaborative
** Multiple users
** Real-time

See [Documentation] for more.

----

[#1] This is a footnote reference[1].`;

      const result = converter.convert(input);

      // Check metadata
      expect(result.metadata['title']).toBe('Sample Page');

      // Check content conversions
      expect(result.content).toContain('# Welcome to JSPWiki');
      expect(result.content).toContain('**sample**');
      expect(result.content).toContain('*various*');
      expect(result.content).toContain('## Features');
      expect(result.content).toContain('- Easy to use');
      expect(result.content).toContain('  - Multiple users');
      expect(result.content).toContain('[[Documentation]]');
      expect(result.content).toContain('---');
      expect(result.content).toContain('[^1]:');
    });
  });

  describe('warnings', () => {
    it('should warn about JSPWiki plugins', () => {
      const result = converter.convert('[{INSERT TableOfContents}]');
      expect(result.warnings).toContain('Found 1 JSPWiki plugin(s) that may need manual conversion');
    });
  });
});
