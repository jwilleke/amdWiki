/**
 * JSPWiki to Markdown Converter
 *
 * Converts JSPWiki syntax to Markdown format for import into amdWiki.
 * Implements IContentConverter interface for use with ImportManager.
 *
 * Reference: https://github.com/apache/jspwiki/blob/main/jspwiki-wikipages/en/src/main/resources/TextFormattingRules.txt
 *
 * @module JSPWikiConverter
 */

import { IContentConverter, ConversionResult } from './IContentConverter';

/**
 * JSPWiki syntax to Markdown converter
 */
class JSPWikiConverter implements IContentConverter {
  readonly formatId = 'jspwiki';
  readonly formatName = 'JSPWiki';
  readonly fileExtensions = ['.txt'];

  /**
   * Convert JSPWiki content to Markdown
   *
   * @param content - JSPWiki formatted content
   * @returns ConversionResult with Markdown content, metadata, and warnings
   */
  convert(content: string): ConversionResult {
    const warnings: string[] = [];
    const metadata: Record<string, unknown> = {};

    // Extract [{SET name=value}] attributes first
    let result = this.extractAttributes(content, metadata, warnings);

    // Process in order to avoid conflicts:
    // - Code blocks first (protect their content from other conversions)
    // - Lists BEFORE headings (so JSPWiki `#` lists are converted before JSPWiki `!` headings become Markdown `#`)
    // - Emphasis must avoid list markers
    result = this.convertCodeBlocks(result, warnings);
    result = this.convertLists(result);           // Convert JSPWiki # lists before headings create Markdown # headers
    result = this.convertHeadings(result);        // Now safe to convert ! headings to # headers
    result = this.convertEmphasis(result);
    result = this.convertMonospace(result);
    result = this.convertDefinitionLists(result);
    result = this.convertHorizontalRules(result);
    result = this.convertLineBreaks(result);
    result = this.convertLinks(result, warnings);
    result = this.convertFootnotes(result, warnings);

    // Tables are handled by JSPWikiPreprocessor at render time,
    // but we can convert simple tables during import too
    result = this.convertTables(result);

    return {
      content: result.trim(),
      metadata,
      warnings
    };
  }

  /**
   * Check if this converter can handle the given content
   * Uses filename extension and content pattern detection
   */
  canHandle(content: string, filename: string): boolean {
    // Check file extension
    if (this.fileExtensions.some(ext => filename.toLowerCase().endsWith(ext))) {
      return true;
    }

    // Content-based detection: check for JSPWiki-specific patterns
    const jspwikiPatterns = [
      /^\s*!{1,3}\s+\S/m,         // JSPWiki headings (!, !!, !!!)
      /\[\{SET\s+/,               // JSPWiki SET directive
      /\[\{INSERT\s+/,            // JSPWiki INSERT plugin
      /__[^_]+__/,                // JSPWiki bold (not markdown)
      /''[^']+''(?!')/,           // JSPWiki italic
      /^\s*\|\|[^|]+\|\|/m,       // JSPWiki table headers
      /%%[a-zA-Z0-9_-]+\s*$/m     // JSPWiki style blocks
    ];

    return jspwikiPatterns.some(pattern => pattern.test(content));
  }

  /**
   * Extract [{SET name=value}] attributes and convert to metadata
   */
  private extractAttributes(
    content: string,
    metadata: Record<string, unknown>,
    warnings: string[]
  ): string {
    // Pattern: [{SET name='value'}] or [{SET name=value}]
    // eslint-disable-next-line no-useless-escape
    const setPattern = /\[\{SET\s+([a-zA-Z0-9_-]+)\s*=\s*(?:'([^']*)'|"([^"]*)"|([^\s\}]+))\s*\}\]/gi;

    const result = content.replace(setPattern, (_match: string, name: string, singleQuoted: string | undefined, doubleQuoted: string | undefined, unquoted: string | undefined) => {
      const value: string = singleQuoted ?? doubleQuoted ?? unquoted ?? '';

      // Map common JSPWiki attributes to amdWiki metadata
      const normalizedName = name.toLowerCase();
      if (normalizedName === 'title' || normalizedName === 'pagetitle') {
        metadata['title'] = value;
      } else if (normalizedName === 'author') {
        metadata['author'] = value;
      } else if (normalizedName === 'alias') {
        // JSPWiki page aliases
        if (!metadata['aliases']) {
          metadata['aliases'] = [];
        }
        (metadata['aliases'] as string[]).push(value);
      } else {
        // Store other attributes in a jspwiki namespace
        if (!metadata['jspwiki']) {
          metadata['jspwiki'] = {};
        }
        (metadata['jspwiki'] as Record<string, string>)[name] = value;
      }

      return ''; // Remove the SET directive from content
    });

    // Detect unhandled plugin directives, excluding known-safe ones
    // Known safe: Image, ATTACH, SET (already extracted), $ (variables), TableOfContents
    // eslint-disable-next-line no-useless-escape
    const pluginPattern = /\[\{(?!Image\s|ATTACH\s|SET\s|\$|TableOfContents[\s\}])([A-Za-z]\w*)\s[^\}]*\}\]/gi;
    const plugins = content.match(pluginPattern);
    if (plugins && plugins.length > 0) {
      const pluginNames = [...new Set(
        plugins.map(p => p.match(/\[\{(\w+)/)?.[1]).filter(Boolean)
      )];
      warnings.push(`Found ${plugins.length} unhandled JSPWiki plugin(s): ${pluginNames.join(', ')}`);
    }

    return result;
  }

  /**
   * Convert JSPWiki headings to Markdown
   * !!! -> # (h1), !! -> ## (h2), ! -> ### (h3)
   */
  private convertHeadings(content: string): string {
    // Process in order from most exclamation marks to least
    // to avoid partial matches

    // !!! heading -> # heading (h1 - large)
    let result = content.replace(/^!!![ \t]*(.+)$/gm, '# $1');

    // !! heading -> ## heading (h2 - medium)
    result = result.replace(/^!![ \t]*(.+)$/gm, '## $1');

    // ! heading -> ### heading (h3 - small)
    result = result.replace(/^![ \t]*(.+)$/gm, '### $1');

    return result;
  }

  /**
   * Convert JSPWiki emphasis to Markdown
   * __bold__ -> **bold**
   * ''italic'' -> *italic*
   */
  private convertEmphasis(content: string): string {
    // Bold: __text__ -> **text**
    // Use non-greedy match and avoid matching across lines
    let result = content.replace(/__([^_\n]+)__/g, '**$1**');

    // Italic: ''text'' -> *text*
    // Avoid matching empty or multi-line content
    result = result.replace(/''([^'\n]+)''/g, '*$1*');

    return result;
  }

  /**
   * Convert JSPWiki monospace to Markdown inline code
   * {{text}} -> `text`
   */
  private convertMonospace(content: string): string {
    // Inline monospace: {{text}} -> `text`
    // Don't match {{{ which is code block
    return content.replace(/\{\{([^{}\n]+)\}\}/g, '`$1`');
  }

  /**
   * Convert JSPWiki code blocks to Markdown
   * {{{ code }}} -> ``` code ```
   */
  private convertCodeBlocks(content: string, warnings: string[]): string {
    // Multi-line code blocks
    // JSPWiki: {{{
    //   code here
    // }}}
    // Markdown: ```
    //   code here
    // ```

    // Pattern matches opening {{{ on its own line, content, and closing }}} on its own line
    let result = content.replace(
      /^\{\{\{\s*$/gm,
      '```'
    );

    result = result.replace(
      /^\}\}\}\s*$/gm,
      '```'
    );

    // Inline code blocks: {{{ code }}} on same line
    // This is less common but valid
    result = result.replace(/\{\{\{([^}]+)\}\}\}/g, (match: string, code: string) => {
      // If code contains newlines, it's a block - already handled
      if (code.includes('\n')) {
        return match;
      }
      // Single line code
      return '`' + code.trim() + '`';
    });

    // Check for unclosed code blocks
    const openings = (result.match(/```/g) || []).length;
    if (openings % 2 !== 0) {
      warnings.push('Unbalanced code blocks detected - manual review may be needed');
    }

    return result;
  }

  /**
   * Convert JSPWiki lists to Markdown
   * * item -> - item (unordered)
   * ** nested -> - - nested (indented unordered)
   * # item -> 1. item (ordered)
   * ## nested -> 1. 1. nested (indented ordered)
   */
  private convertLists(content: string): string {
    const lines = content.split('\n');
    const result: string[] = [];

    for (const line of lines) {
      // Check for unordered list: * or ** or ***
      const unorderedMatch = line.match(/^(\*+)\s*(.*)$/);
      if (unorderedMatch) {
        const depth = unorderedMatch[1].length;
        const text = unorderedMatch[2];
        const indent = '  '.repeat(depth - 1);
        result.push(`${indent}- ${text}`);
        continue;
      }

      // Check for ordered list: # or ## or ###
      const orderedMatch = line.match(/^(#+)\s*(.*)$/);
      if (orderedMatch) {
        const depth = orderedMatch[1].length;
        const text = orderedMatch[2];
        const indent = '  '.repeat(depth - 1);
        result.push(`${indent}1. ${text}`);
        continue;
      }

      result.push(line);
    }

    return result.join('\n');
  }

  /**
   * Convert JSPWiki definition lists to Markdown
   * ;term:definition -> **term**: definition
   */
  private convertDefinitionLists(content: string): string {
    // ;term:definition -> **term**: definition
    return content.replace(/^;([^:\n]+):(.*)$/gm, '**$1**: $2');
  }

  /**
   * Convert JSPWiki horizontal rules to Markdown
   * ---- (or more dashes) -> ---
   */
  private convertHorizontalRules(content: string): string {
    return content.replace(/^-{4,}\s*$/gm, '---');
  }

  /**
   * Convert JSPWiki line breaks to Markdown
   * \\ -> <br> or two spaces + newline
   */
  private convertLineBreaks(content: string): string {
    // \\ at end of line (or before newline) -> <br>
    return content.replace(/\\\\\s*$/gm, '<br>');
  }

  /**
   * Convert JSPWiki links to Markdown/WikiLink format
   * [link] -> [[link]]
   * [display text|link] -> [[link|display text]]
   */
  private convertLinks(content: string, warnings: string[]): string {
    let result = content;

    // External links with display text: [text|http://url]
    // Convert to Markdown: [text](url)
    result = result.replace(
      /\[([^|\]]+)\|(https?:\/\/[^\]]+)\]/g,
      '[$1]($2)'
    );

    // Bare external links: [http://url] -> plain URL
    result = result.replace(
      /\[(https?:\/\/[^\]]+)\]/g,
      '$1'
    );

    // amdWiki natively supports JSPWiki wiki link syntax:
    //   [PageName], [DisplayText|PageName], [{$variable}], [{Plugin ...}]
    // These are left as-is — no conversion needed.

    // Detect CamelCase link disable syntax: ~NoLink
    const camelCaseDisable = result.match(/~([A-Z][a-z]+(?:[A-Z][a-z]+)+)/g);
    if (camelCaseDisable && camelCaseDisable.length > 0) {
      // Remove the ~ prefix
      result = result.replace(/~([A-Z][a-z]+(?:[A-Z][a-z]+)+)/g, '$1');
      warnings.push('CamelCase link prevention (~Word) converted - verify no unintended links');
    }

    return result;
  }

  /**
   * Convert JSPWiki footnotes to Markdown footnotes
   * [1] -> [^1]
   * [#1] footnote text -> [^1]: footnote text
   */
  private convertFootnotes(content: string, warnings: string[]): string {
    let result = content;

    // Footnote references: [1], [2], etc. -> [^1], [^2]
    result = result.replace(/\[(\d+)\]/g, '[^$1]');

    // Footnote definitions: [#1] text -> [^1]: text
    result = result.replace(/^\[#(\d+)\]\s*(.*)$/gm, '[^$1]: $2');

    // Check if there are unmatched footnotes
    const refs = new Set((result.match(/\[\^(\d+)\]/g) || []).map(m => m.slice(2, -1)));
    const defs = new Set((result.match(/\[\^(\d+)\]:/g) || []).map(m => m.slice(2, -2)));

    const missingDefs = [...refs].filter(r => !defs.has(r));
    if (missingDefs.length > 0) {
      warnings.push(`Footnote references without definitions: ${missingDefs.join(', ')}`);
    }

    return result;
  }

  /**
   * Convert JSPWiki tables to Markdown tables
   * This provides a simpler conversion than JSPWikiPreprocessor (which generates HTML)
   *
   * || Header || Header || -> | Header | Header |
   * | Cell | Cell | -> | Cell | Cell |
   */
  private convertTables(content: string): string {
    const lines = content.split('\n');
    const result: string[] = [];
    let inTable = false;
    let hasHeader = false;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const trimmed = line.trim();

      // Check for header row (||)
      if (trimmed.startsWith('||')) {
        // Convert header: || cell || cell || -> | cell | cell |
        const cells = trimmed
          .split('||')
          .filter(c => c.trim())
          .map(c => c.trim());

        result.push('| ' + cells.join(' | ') + ' |');

        if (!inTable) {
          inTable = true;
          hasHeader = true;
          // Add separator row
          const separator = '| ' + cells.map(() => '---').join(' | ') + ' |';
          result.push(separator);
        }
        continue;
      }

      // Check for data row (|)
      if (trimmed.startsWith('|') && !trimmed.startsWith('||')) {
        const cells = trimmed
          .split('|')
          .filter(c => c !== '')
          .map(c => c.trim());

        // If this is the first row and it's not a header, add a blank header
        if (!inTable && !hasHeader) {
          inTable = true;
          // Create empty header with correct column count
          const emptyHeader = '| ' + cells.map(() => ' ').join(' | ') + ' |';
          const separator = '| ' + cells.map(() => '---').join(' | ') + ' |';
          result.push(emptyHeader);
          result.push(separator);
        }

        result.push('| ' + cells.join(' | ') + ' |');
        continue;
      }

      // Not a table line
      if (inTable) {
        inTable = false;
        hasHeader = false;
      }
      result.push(line);
    }

    return result.join('\n');
  }
}

export default JSPWikiConverter;

// CommonJS compatibility
module.exports = JSPWikiConverter;
