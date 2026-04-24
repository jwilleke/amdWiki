/**
 * EscapedSyntaxHandler tests
 *
 * Covers:
 * - process() with empty/null content
 * - process() with no matches → unchanged
 * - [[{Plugin}] → &#91;Plugin&#93;
 * - [[{$variable}] → escapes variable literal
 * - <!--[[PageName]--> → escapes wiki link
 * - Multiple matches in one string
 * - getSupportedPatterns()
 * - getInfo()
 *
 * @jest-environment node
 */

import EscapedSyntaxHandler from '../EscapedSyntaxHandler';

const ctx = { pageName: 'TestPage', engine: { getManager: vi.fn(() => null) } };

describe('EscapedSyntaxHandler', () => {
  let handler: EscapedSyntaxHandler;

  beforeEach(() => {
    handler = new EscapedSyntaxHandler();
  });

  describe('metadata', () => {
    test('has handlerId set', () => {
      expect(handler.handlerId).toBe('EscapedSyntaxHandler');
    });

    test('has priority 100', () => {
      expect(handler.priority).toBe(100);
    });
  });

  describe('process() — empty / no content', () => {
    test('returns empty string for empty content', async () => {
      const result = await handler.process('', ctx);
      expect(result).toBe('');
    });

    test('returns content unchanged when no double-bracket patterns', async () => {
      const content = 'Regular page content with [{PluginName}] syntax.';
      const result = await handler.process(content, ctx);
      expect(result).toBe(content);
    });
  });

  describe('process() — escaping', () => {
    test('converts [[{PluginName}] to HTML-encoded literal', async () => {
      const result = await handler.process('[[{PluginName}]', ctx);
      expect(result).toContain('&#91;');
      expect(result).toContain('&#93;');
      expect(result).toContain('PluginName');
      expect(result).not.toContain('[[');
    });

    test('converts [[{$variable}] to literal', async () => {
      const result = await handler.process('[[{$version}]', ctx);
      expect(result).toContain('&#91;');
      expect(result).toContain('$version');
    });

    test('leaves surrounding text unchanged', async () => {
      const result = await handler.process('Before [[{Plugin}] after', ctx);
      expect(result).toContain('Before ');
      expect(result).toContain(' after');
    });

    test('handles multiple escaped patterns in one string', async () => {
      const input = '[[{Plugin1}] text [[{Plugin2}]';
      const result = await handler.process(input, ctx);
      expect(result).toContain('Plugin1');
      expect(result).toContain('Plugin2');
      expect(result).not.toContain('[[');
    });

    test('handles wiki link escaping <!--[[PageName]-->', async () => {
      const result = await handler.process('<!--[[PageName]-->', ctx);
      expect(result).toContain('PageName');
      expect(result).not.toContain('[[');
    });

    test('handles escaped parameter syntax', async () => {
      const result = await handler.process('[[{PluginName param=value}]', ctx);
      expect(result).toContain('PluginName param=value');
      expect(result).toContain('&#91;');
    });
  });

  describe('getSupportedPatterns()', () => {
    test('returns array of pattern strings', () => {
      const patterns = handler.getSupportedPatterns();
      expect(Array.isArray(patterns)).toBe(true);
      expect(patterns.length).toBeGreaterThan(0);
    });

    test('includes plugin escape pattern', () => {
      const patterns = handler.getSupportedPatterns();
      expect(patterns.some(p => p.includes('[{PluginName}]'))).toBe(true);
    });
  });

  describe('getInfo()', () => {
    test('returns object with supportedPatterns', () => {
      const info = handler.getInfo();
      expect(typeof info).toBe('object');
      expect(Array.isArray(info.supportedPatterns)).toBe(true);
    });

    test('includes features array', () => {
      const info = handler.getInfo();
      expect(Array.isArray(info.features)).toBe(true);
    });
  });
});
