/**
 * Fixed version of showdown-footnotes with global flag and hyphen support
 *
 * Original: https://github.com/Kriegslustig/showdown-footnotes
 * Issues Fixed:
 * 1. Missing 'g' flag in footnote reference regex causes only first reference to be replaced
 * 2. Pattern [\d\w]+ doesn't match hyphens, preventing identifiers like [^my-note]
 *
 * Fixes:
 * 1. Changed /m to /mg in the third filter function
 * 2. Changed [\d\w]+ to [\d\w-]+ to support hyphens in identifiers
 */

/**
 * Showdown converter interface
 */
interface ShowdownConverter {
  makeHtml(text: string): string;
}

/**
 * Showdown module interface
 */
interface ShowdownModule {
  Converter: new () => ShowdownConverter;
}

/**
 * Showdown extension filter object
 */
interface ShowdownFilter {
  type: 'lang' | 'output';
  filter: (text: string) => string;
}

// eslint-disable-next-line @typescript-eslint/no-require-imports -- Dynamic import
const showdown = require('showdown') as ShowdownModule;
const converter: ShowdownConverter = new showdown.Converter();

/**
 * Showdown footnotes extension factory
 * @returns Array of showdown filter objects
 */
function showdownFootnotesFixed(): ShowdownFilter[] {
  return [{
    // Multi-paragraph footnotes with indentation
    type: 'lang',
    filter: function filter(text: string): string {
      return text.replace(
        /^\[\^([\d\w-]+)\]:\s*((\n+(\s{2,4}|\t).+)+)$/mg,
        function (_str: string, name: string, rawContent: string, _: string, padding: string): string {
          const content = converter.makeHtml(rawContent.replace(new RegExp('^' + padding, 'gm'), ''));
          return '<div class="footnote" id="footnote-' + name + '"><a href="#footnote-' + name + '"><sup>[' + name + ']</sup></a>:' + content + '</div>';
        }
      );
    }
  }, {
    // Single-line footnote definitions
    type: 'lang',
    filter: function filter(text: string): string {
      return text.replace(
        /^\[\^([\d\w-]+)\]:( |\n)((.+\n)*.+)$/mg,
        function (_str: string, name: string, _: string, content: string): string {
          return '<small class="footnote" id="footnote-' + name + '"><a href="#footnote-' + name + '"><sup>[' + name + ']</sup></a>: ' + content + '</small>';
        }
      );
    }
  }, {
    // Footnote references in text
    // FIXED: Added 'g' flag to replace ALL occurrences, not just the first one
    // FIXED: Added hyphen support to match identifiers like [^my-note]
    type: 'lang',
    filter: function filter(text: string): string {
      return text.replace(
        /\[\^([\d\w-]+)\]/mg,
        function (_str: string, name: string): string {
          return '<a href="#footnote-' + name + '"><sup>[' + name + ']</sup></a>';
        }
      );
    }
  }];
}

export default showdownFootnotesFixed;

// CommonJS compatibility
module.exports = showdownFootnotesFixed;
