/**
 * Tests for extractJSPWikiSyntax() method
 * Part of Issue #114 - WikiDocument DOM Solution
 * Phase 1: Core JSPWiki Syntax Extraction
 */

const MarkupParser = require('../MarkupParser');

describe('MarkupParser.extractJSPWikiSyntax()', () => {
  let parser;
  let mockEngine;

  beforeEach(() => {
    // Create minimal mock engine
    mockEngine = {
      getManager: jest.fn((name) => {
        if (name === 'ConfigurationManager') {
          return {
            getProperty: jest.fn((key, defaultValue) => defaultValue)
          };
        }
        return null;
      })
    };

    parser = new MarkupParser(mockEngine);
  });

  describe('Variable Extraction', () => {
    test('extracts single variable', () => {
      const content = 'User: [{$username}]';
      const { sanitized, jspwikiElements, uuid } = parser.extractJSPWikiSyntax(content);

      expect(sanitized).toMatch(/User: <!--JSPWIKI-[a-f0-9]{8}-0-->/);
      expect(jspwikiElements).toHaveLength(1);
      expect(jspwikiElements[0]).toMatchObject({
        type: 'variable',
        varName: '$username',
        syntax: '[{$username}]',
        id: 0
      });
      expect(uuid).toMatch(/^[a-f0-9]{8}$/);
    });

    test('extracts multiple variables', () => {
      const content = '[{$username}] at [{$timestamp}]';
      const { sanitized, jspwikiElements } = parser.extractJSPWikiSyntax(content);

      expect(jspwikiElements).toHaveLength(2);
      expect(jspwikiElements[0].varName).toBe('$username');
      expect(jspwikiElements[1].varName).toBe('$timestamp');
    });

    test('extracts all system variables', () => {
      const content = `
[{$username}]
[{$pagename}]
[{$applicationname}]
[{$totalpages}]
[{$uptime}]
[{$baseurl}]
[{$timestamp}]
[{$date}]
[{$time}]
`;
      const { jspwikiElements } = parser.extractJSPWikiSyntax(content);

      expect(jspwikiElements).toHaveLength(9);
      expect(jspwikiElements.every(el => el.type === 'variable')).toBe(true);
    });
  });

  describe('Plugin Extraction', () => {
    test('extracts simple plugin', () => {
      const content = '[{TableOfContents}]';
      const { sanitized, jspwikiElements } = parser.extractJSPWikiSyntax(content);

      expect(sanitized).toMatch(/<!--JSPWIKI-[a-f0-9]{8}-0-->/);
      expect(jspwikiElements).toHaveLength(1);
      expect(jspwikiElements[0]).toMatchObject({
        type: 'plugin',
        inner: 'TableOfContents',
        syntax: '[{TableOfContents}]',
        id: 0
      });
    });

    test('extracts plugin with parameters', () => {
      const content = "[{Search query='wiki' max='10'}]";
      const { jspwikiElements } = parser.extractJSPWikiSyntax(content);

      expect(jspwikiElements).toHaveLength(1);
      expect(jspwikiElements[0].type).toBe('plugin');
      expect(jspwikiElements[0].inner).toBe("Search query='wiki' max='10'");
    });

    test('extracts multiple plugins', () => {
      const content = '[{TableOfContents}]\n\n[{Search}]\n\n[{PageIndex}]';
      const { jspwikiElements } = parser.extractJSPWikiSyntax(content);

      expect(jspwikiElements).toHaveLength(3);
      expect(jspwikiElements.every(el => el.type === 'plugin')).toBe(true);
    });

    test('does NOT extract variables as plugins', () => {
      const content = '[{$username}]';
      const { jspwikiElements } = parser.extractJSPWikiSyntax(content);

      expect(jspwikiElements).toHaveLength(1);
      expect(jspwikiElements[0].type).toBe('variable'); // Not plugin!
    });
  });

  describe('Escaped Syntax Extraction', () => {
    test('extracts escaped variable', () => {
      const content = 'Example: [[{$username}]';
      const { sanitized, jspwikiElements } = parser.extractJSPWikiSyntax(content);

      expect(sanitized).toMatch(/Example: <!--JSPWIKI-[a-f0-9]{8}-0-->/);
      expect(jspwikiElements).toHaveLength(1);
      expect(jspwikiElements[0]).toMatchObject({
        type: 'escaped',
        literal: '[{$username}]',
        syntax: '[[{$username}]',
        id: 0
      });
    });

    test('extracts escaped plugin', () => {
      const content = '[[{TableOfContents}]';
      const { jspwikiElements } = parser.extractJSPWikiSyntax(content);

      expect(jspwikiElements).toHaveLength(1);
      expect(jspwikiElements[0].type).toBe('escaped');
      expect(jspwikiElements[0].literal).toBe('[{TableOfContents}]');
    });

    test('escaping prevents processing', () => {
      const content = '[[{$username}] and [{$username}]';
      const { jspwikiElements } = parser.extractJSPWikiSyntax(content);

      expect(jspwikiElements).toHaveLength(2);
      expect(jspwikiElements[0].type).toBe('escaped'); // First is escaped
      expect(jspwikiElements[1].type).toBe('variable'); // Second is processed
    });
  });

  describe('Wiki Link Extraction', () => {
    test('extracts simple wiki link', () => {
      const content = '[HomePage]';
      const { sanitized, jspwikiElements } = parser.extractJSPWikiSyntax(content);

      expect(sanitized).toMatch(/<!--JSPWIKI-[a-f0-9]{8}-0-->/);
      expect(jspwikiElements).toHaveLength(1);
      expect(jspwikiElements[0]).toMatchObject({
        type: 'link',
        target: 'HomePage',
        syntax: '[HomePage]',
        id: 0
      });
    });

    test('extracts wiki link with pipe syntax', () => {
      const content = '[Click Here|HomePage]';
      const { jspwikiElements } = parser.extractJSPWikiSyntax(content);

      expect(jspwikiElements).toHaveLength(1);
      expect(jspwikiElements[0].target).toBe('Click Here|HomePage');
    });

    test('does NOT extract markdown links', () => {
      const content = '[Google](https://google.com)';
      const { sanitized, jspwikiElements } = parser.extractJSPWikiSyntax(content);

      expect(jspwikiElements).toHaveLength(0); // No extraction
      expect(sanitized).toBe('[Google](https://google.com)'); // Preserved
    });

    test('distinguishes wiki links from markdown links', () => {
      const content = '[HomePage] and [Google](https://google.com)';
      const { sanitized, jspwikiElements } = parser.extractJSPWikiSyntax(content);

      expect(jspwikiElements).toHaveLength(1); // Only wiki link
      expect(jspwikiElements[0].target).toBe('HomePage');
      expect(sanitized).toContain('[Google](https://google.com)'); // MD preserved
    });

    test('extracts multiple wiki links', () => {
      const content = '[HomePage] [About] [Contact]';
      const { jspwikiElements } = parser.extractJSPWikiSyntax(content);

      expect(jspwikiElements).toHaveLength(3);
      expect(jspwikiElements.every(el => el.type === 'link')).toBe(true);
    });
  });

  describe('Markdown Preservation', () => {
    test('preserves markdown headings', () => {
      const content = '## Features\n### Subheading';
      const { sanitized } = parser.extractJSPWikiSyntax(content);

      expect(sanitized).toContain('## Features');
      expect(sanitized).toContain('### Subheading');
    });

    test('preserves markdown lists', () => {
      const content = '- Item 1\n- Item 2\n* Item 3';
      const { sanitized } = parser.extractJSPWikiSyntax(content);

      expect(sanitized).toContain('- Item 1');
      expect(sanitized).toContain('- Item 2');
      expect(sanitized).toContain('* Item 3');
    });

    test('preserves markdown code blocks', () => {
      const content = '```javascript\nconst x = 1;\n```';
      const { sanitized } = parser.extractJSPWikiSyntax(content);

      expect(sanitized).toContain('```javascript');
      expect(sanitized).toContain('const x = 1;');
      expect(sanitized).toContain('```');
    });

    test('preserves markdown inline code', () => {
      const content = 'Use `const` for constants';
      const { sanitized } = parser.extractJSPWikiSyntax(content);

      expect(sanitized).toContain('Use `const` for constants');
    });

    test('preserves markdown tables', () => {
      const content = '| A | B |\n|---|---|\n| 1 | 2 |';
      const { sanitized } = parser.extractJSPWikiSyntax(content);

      expect(sanitized).toContain('| A | B |');
      expect(sanitized).toContain('|---|---|');
    });

    test('preserves markdown emphasis', () => {
      const content = '**bold** and *italic*';
      const { sanitized } = parser.extractJSPWikiSyntax(content);

      expect(sanitized).toBe('**bold** and *italic*');
    });
  });

  describe('Mixed Content', () => {
    test('extracts JSPWiki from markdown + JSPWiki mix', () => {
      const content = '## Welcome\n\nHello, [{$username}]!';
      const { sanitized, jspwikiElements } = parser.extractJSPWikiSyntax(content);

      expect(sanitized).toContain('## Welcome'); // MD preserved
      expect(sanitized).toMatch(/<!--JSPWIKI-[a-f0-9]{8}-0-->/); // Variable extracted
      expect(jspwikiElements).toHaveLength(1);
      expect(jspwikiElements[0].type).toBe('variable');
    });

    test('handles complex mixed content', () => {
      const content = `
# Welcome

Current user: [{$username}]

## Table of Contents

[{TableOfContents}]

## Links

- [HomePage]
- [Google](https://google.com)

Example: [[{$var}]
`;

      const { sanitized, jspwikiElements } = parser.extractJSPWikiSyntax(content);

      // Markdown preserved
      expect(sanitized).toContain('# Welcome');
      expect(sanitized).toContain('## Table of Contents');
      expect(sanitized).toContain('[Google](https://google.com)');

      // JSPWiki extracted
      expect(jspwikiElements).toHaveLength(4);
      expect(jspwikiElements.find(el => el.varName === '$username')).toBeDefined();
      expect(jspwikiElements.find(el => el.inner === 'TableOfContents')).toBeDefined();
      expect(jspwikiElements.find(el => el.target === 'HomePage')).toBeDefined();
      expect(jspwikiElements.find(el => el.type === 'escaped')).toBeDefined();
    });

    test('handles all syntax types together', () => {
      const content = '[{$username}] [{TOC}] [HomePage] [[{$escaped}]';
      const { jspwikiElements } = parser.extractJSPWikiSyntax(content);

      expect(jspwikiElements).toHaveLength(4);
      // Extraction order: escaped first, then variable, plugin, link
      expect(jspwikiElements[0].type).toBe('escaped');  // [[{$escaped}] extracted first
      expect(jspwikiElements[1].type).toBe('variable'); // [{$username}]
      expect(jspwikiElements[2].type).toBe('plugin');   // [{TOC}]
      expect(jspwikiElements[3].type).toBe('link');     // [HomePage]
    });
  });

  describe('UUID Placeholder Safety', () => {
    test('generates unique UUID per extraction', () => {
      const content = '[{$username}]';
      const result1 = parser.extractJSPWikiSyntax(content);
      const result2 = parser.extractJSPWikiSyntax(content);

      expect(result1.uuid).not.toBe(result2.uuid);
    });

    test('UUID prevents placeholder conflicts', () => {
      // User writes text that looks like a placeholder
      const content = 'Debug: <!--JSPWIKI-0__ and [{$username}]';
      const { sanitized, jspwikiElements, uuid } = parser.extractJSPWikiSyntax(content);

      // User's text preserved (no UUID, so different from our placeholders)
      expect(sanitized).toContain('<!--JSPWIKI-0__');

      // Variable gets UUID-based placeholder (different from user's text)
      expect(sanitized).toContain(`<!--JSPWIKI-${uuid}-0-->`);

      // Both strings present (user's <!--JSPWIKI-0__ and our <!--JSPWIKI-uuid-0-->)
      const userPlaceholderCount = (sanitized.match(/<!--JSPWIKI-0__/g) || []).length;
      const ourPlaceholderCount = (sanitized.match(new RegExp(`<!--JSPWIKI-${uuid}-0-->`, 'g')) || []).length;
      expect(userPlaceholderCount).toBe(1); // User's text
      expect(ourPlaceholderCount).toBe(1); // Our placeholder
    });

    test('placeholders use correct ID sequence', () => {
      const content = '[{$user}] [{TOC}] [{$page}]';
      const { sanitized, uuid } = parser.extractJSPWikiSyntax(content);

      expect(sanitized).toContain(`<!--JSPWIKI-${uuid}-0-->`);
      expect(sanitized).toContain(`<!--JSPWIKI-${uuid}-1-->`);
      expect(sanitized).toContain(`<!--JSPWIKI-${uuid}-2-->`);
    });
  });

  describe('Edge Cases', () => {
    test('handles empty content', () => {
      const { sanitized, jspwikiElements } = parser.extractJSPWikiSyntax('');

      expect(sanitized).toBe('');
      expect(jspwikiElements).toHaveLength(0);
    });

    test('handles content with only markdown', () => {
      const content = '## Heading\n- Item';
      const { sanitized, jspwikiElements } = parser.extractJSPWikiSyntax(content);

      expect(sanitized).toBe(content); // Unchanged
      expect(jspwikiElements).toHaveLength(0);
    });

    test('handles content with only JSPWiki syntax', () => {
      const content = '[{$username}] [{TOC}] [HomePage]';
      const { sanitized, jspwikiElements } = parser.extractJSPWikiSyntax(content);

      expect(jspwikiElements).toHaveLength(3);
      expect(sanitized).not.toContain('[{$username}]');
      expect(sanitized).not.toContain('[{TOC}]');
      expect(sanitized).not.toContain('[HomePage]');
    });

    test('handles malformed JSPWiki syntax', () => {
      const content = '[{$} [{] [}]';
      const { jspwikiElements } = parser.extractJSPWikiSyntax(content);

      // Malformed syntax ignored or treated as text
      // Should not crash
      expect(jspwikiElements.length).toBeLessThan(3);
    });

    test('handles very long content', () => {
      const content = '## Section\n\n[{$username}]\n\n'.repeat(100);
      const { jspwikiElements } = parser.extractJSPWikiSyntax(content);

      expect(jspwikiElements).toHaveLength(100);
      expect(jspwikiElements.every(el => el.type === 'variable')).toBe(true);
    });

    test('handles nested brackets in links', () => {
      const content = '[[Nested [link]]]';
      const { sanitized } = parser.extractJSPWikiSyntax(content);

      // Should handle gracefully (may extract or preserve)
      expect(sanitized).toBeDefined();
    });

    test('handles special characters', () => {
      const content = '[{$username}] with émojis 🎉';
      const { sanitized, jspwikiElements } = parser.extractJSPWikiSyntax(content);

      expect(jspwikiElements).toHaveLength(1);
      expect(sanitized).toContain('émojis 🎉');
    });
  });

  describe('Element Metadata', () => {
    test('each element has required properties', () => {
      const content = '[{$username}] [{TOC}] [HomePage] [[{$esc}]';
      const { jspwikiElements } = parser.extractJSPWikiSyntax(content);

      jspwikiElements.forEach(element => {
        expect(element).toHaveProperty('type');
        expect(element).toHaveProperty('syntax');
        expect(element).toHaveProperty('id');
        expect(typeof element.id).toBe('number');
      });
    });

    test('IDs are sequential', () => {
      const content = '[{$user}] [{TOC}] [HomePage]';
      const { jspwikiElements } = parser.extractJSPWikiSyntax(content);

      expect(jspwikiElements[0].id).toBe(0);
      expect(jspwikiElements[1].id).toBe(1);
      expect(jspwikiElements[2].id).toBe(2);
    });

    test('original syntax preserved in metadata', () => {
      const content = '[{$username}]';
      const { jspwikiElements } = parser.extractJSPWikiSyntax(content);

      expect(jspwikiElements[0].syntax).toBe('[{$username}]');
    });
  });

  describe('Return Value Structure', () => {
    test('returns object with required properties', () => {
      const content = '[{$username}]';
      const result = parser.extractJSPWikiSyntax(content);

      expect(result).toHaveProperty('sanitized');
      expect(result).toHaveProperty('jspwikiElements');
      expect(result).toHaveProperty('uuid');
    });

    test('sanitized is a string', () => {
      const { sanitized } = parser.extractJSPWikiSyntax('[{$username}]');
      expect(typeof sanitized).toBe('string');
    });

    test('jspwikiElements is an array', () => {
      const { jspwikiElements } = parser.extractJSPWikiSyntax('[{$username}]');
      expect(Array.isArray(jspwikiElements)).toBe(true);
    });

    test('uuid is an 8-character hex string', () => {
      const { uuid } = parser.extractJSPWikiSyntax('[{$username}]');
      expect(uuid).toMatch(/^[a-f0-9]{8}$/);
    });
  });
});
