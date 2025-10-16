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

'use strict';

var showdown = require('showdown');
var converter = new showdown.Converter();

module.exports = function () {
  return [{
    // Multi-paragraph footnotes with indentation
    type: 'lang',
    filter: function filter(text) {
      return text.replace(/^\[\^([\d\w-]+)\]:\s*((\n+(\s{2,4}|\t).+)+)$/mg, function (str, name, rawContent, _, padding) {
        var content = converter.makeHtml(rawContent.replace(new RegExp('^' + padding, 'gm'), ''));
        return '<div class="footnote" id="footnote-' + name + '"><a href="#footnote-' + name + '"><sup>[' + name + ']</sup></a>:' + content + '</div>';
      });
    }
  }, {
    // Single-line footnote definitions
    type: 'lang',
    filter: function filter(text) {
      return text.replace(/^\[\^([\d\w-]+)\]:( |\n)((.+\n)*.+)$/mg, function (str, name, _, content) {
        return '<small class="footnote" id="footnote-' + name + '"><a href="#footnote-' + name + '"><sup>[' + name + ']</sup></a>: ' + content + '</small>';
      });
    }
  }, {
    // Footnote references in text
    // FIXED: Added 'g' flag to replace ALL occurrences, not just the first one
    // FIXED: Added hyphen support to match identifiers like [^my-note]
    type: 'lang',
    filter: function filter(text) {
      return text.replace(/\[\^([\d\w-]+)\]/mg, function (str, name) {
        return '<a href="#footnote-' + name + '"><sup>[' + name + ']</sup></a>';
      });
    }
  }];
};
