const { Tokenizer } = require('./Tokenizer');
const DOMBuilder = require('./DOMBuilder');
const WikiDocument = require('./WikiDocument');

/**
 * DOMParser - Complete DOM-based parsing pipeline for wiki markup
 *
 * ============================================================================
 * ARCHITECTURE NOTE (Phase 4, Issue #118):
 * ============================================================================
 *
 * **This DOMParser is a REFERENCE IMPLEMENTATION and is NOT actively used
 * in the current rendering pipeline.**
 *
 * This parser uses the Tokenizer → DOMBuilder pipeline, which was the Phase 0
 * approach to WikiDocument DOM parsing. However, it has been superseded by
 * the extraction-based approach in Phases 1-3.
 *
 * CURRENT ACTIVE PIPELINE:
 * ------------------------
 * Use `MarkupParser.parseWithDOMExtraction()` instead of this DOMParser.
 *
 * The new pipeline:
 * 1. MarkupParser.extractJSPWikiSyntax() - Extract JSPWiki syntax
 * 2. MarkupParser.createDOMNode() - Create DOM nodes
 * 3. Showdown.makeHtml() - Process markdown
 * 4. MarkupParser.mergeDOMNodes() - Merge nodes into HTML
 *
 * WHY THIS DOMPARSER IS KEPT:
 * ---------------------------
 * - Reference implementation for token-based parsing
 * - Useful for understanding the tokenization approach
 * - May be enhanced for specific use cases in the future
 * - Educational value for understanding different parsing strategies
 *
 * SEE ALSO:
 * - Tokenizer.js - For detailed architecture notes
 * - MarkupParser.parseWithDOMExtraction() - Current active pipeline
 * - Issue #114 - WikiDocument DOM Solution
 * - Issue #118 - Architecture documentation (this change)
 *
 * ============================================================================
 *
 * ORIGINAL DESCRIPTION:
 * Integrates Tokenizer and DOMBuilder to convert wiki markup into
 * a structured WikiDocument DOM tree. Provides error handling, recovery,
 * and detailed error messages with position information.
 *
 * This follows JSPWiki's MarkupParser architecture.
 *
 * Key Features:
 * - Complete parsing pipeline (Tokenizer → DOMBuilder)
 * - Error handling with position tracking
 * - Helpful error messages
 * - Parse statistics and metadata
 * - Graceful degradation on errors
 *
 * Part of Phase 2.5 of WikiDocument DOM Migration (GitHub Issue #93)
 *
 * JSPWiki Reference:
 * https://github.com/apache/jspwiki/blob/master/jspwiki-main/src/main/java/org/apache/wiki/parser/MarkupParser.java
 */
class DOMParser {
  /**
   * Creates a new DOMParser
   *
   * @param {Object} options - Parser options
   * @param {boolean} options.debug - Enable debug mode
   * @param {boolean} options.throwOnError - Throw on parse errors (vs. recovery)
   * @param {Function} options.onError - Error callback
   * @param {Function} options.onWarning - Warning callback
   */
  constructor(options = {}) {
    this.options = {
      debug: options.debug || false,
      throwOnError: options.throwOnError || false,
      onError: options.onError || null,
      onWarning: options.onWarning || null
    };

    this.parseStats = {
      totalParses: 0,
      successfulParses: 0,
      failedParses: 0,
      totalParseTime: 0,
      lastParseTime: 0
    };
  }

  /**
   * Parses wiki markup content into a WikiDocument
   *
   * Main entry point for DOM-based parsing. This is equivalent to
   * JSPWiki's MarkupParser.parse() method.
   *
   * @param {string} content - Wiki markup content to parse
   * @param {Object} context - Rendering context (page info, user, etc.)
   * @returns {WikiDocument} Parsed WikiDocument with DOM tree
   * @throws {ParseError} If throwOnError is true and parsing fails
   */
  parse(content, context = null) {
    const startTime = Date.now();
    this.parseStats.totalParses++;

    try {
      // Validate input
      if (content === null || content === undefined) {
        content = '';
      }

      if (typeof content !== 'string') {
        throw new ParseError(
          'Invalid content type',
          0, 0, 0,
          `Expected string, got ${typeof content}`
        );
      }

      // Step 1: Create WikiDocument
      const wikiDocument = new WikiDocument(content, context);
      wikiDocument.setMetadata('parserVersion', '1.0.0');
      wikiDocument.setMetadata('parseStartTime', startTime);

      // Step 2: Tokenize
      this.log('Tokenizing content...');
      const tokenizer = new Tokenizer(content);
      let tokens;

      try {
        tokens = tokenizer.tokenize();
        this.log(`Tokenized into ${tokens.length} tokens`);
        wikiDocument.setMetadata('tokenCount', tokens.length);
      } catch (err) {
        throw new ParseError(
          'Tokenization failed',
          tokenizer.position,
          tokenizer.line,
          tokenizer.column,
          err.message,
          err
        );
      }

      // Step 3: Build DOM
      this.log('Building DOM tree...');
      const builder = new DOMBuilder(wikiDocument);

      try {
        builder.buildFromTokens(tokens);
        this.log(`Built DOM with ${wikiDocument.getChildCount()} root nodes`);
        wikiDocument.setMetadata('nodeCount', wikiDocument.getChildCount());
      } catch (err) {
        throw new ParseError(
          'DOM building failed',
          0, 0, 0,
          err.message,
          err
        );
      }

      // Step 4: Finalize
      const parseTime = Date.now() - startTime;
      this.parseStats.successfulParses++;
      this.parseStats.totalParseTime += parseTime;
      this.parseStats.lastParseTime = parseTime;

      wikiDocument.setMetadata('parseTime', parseTime);
      wikiDocument.setMetadata('parseSuccess', true);

      this.log(`Parse completed in ${parseTime}ms`);

      return wikiDocument;

    } catch (err) {
      this.parseStats.failedParses++;

      // Call error handler if provided
      if (this.options.onError) {
        this.options.onError(err);
      }

      // Either throw or return error document
      if (this.options.throwOnError) {
        throw err;
      } else {
        return this.createErrorDocument(content, context, err);
      }
    }
  }

  /**
   * Creates an error document when parsing fails
   *
   * This allows graceful degradation - the page will still render
   * but show the error to the user.
   *
   * @param {string} content - Original content
   * @param {Object} context - Rendering context
   * @param {Error} error - The error that occurred
   * @returns {WikiDocument} Error document
   */
  createErrorDocument(content, context, error) {
    const wikiDocument = new WikiDocument(content, context);
    wikiDocument.setMetadata('parseSuccess', false);
    wikiDocument.setMetadata('parseError', error.message);

    // Create error display
    const errorDiv = wikiDocument.createElement('div', {
      class: 'wiki-parse-error',
      'data-error-type': error.type || 'ParseError'
    });

    const errorTitle = wikiDocument.createElement('h3', {
      class: 'wiki-parse-error-title'
    });
    errorTitle.textContent = 'Parse Error';
    errorDiv.appendChild(errorTitle);

    const errorMessage = wikiDocument.createElement('p', {
      class: 'wiki-parse-error-message'
    });
    errorMessage.textContent = error.message || 'Unknown parse error';
    errorDiv.appendChild(errorMessage);

    // Add position info if available
    if (error.line !== undefined && error.column !== undefined) {
      const errorPosition = wikiDocument.createElement('p', {
        class: 'wiki-parse-error-position'
      });
      errorPosition.textContent = `At line ${error.line}, column ${error.column}`;
      errorDiv.appendChild(errorPosition);
    }

    // Add original content as preformatted text
    const contentPre = wikiDocument.createElement('pre', {
      class: 'wiki-parse-error-content'
    });
    const contentCode = wikiDocument.createElement('code');
    contentCode.textContent = content;
    contentPre.appendChild(contentCode);
    errorDiv.appendChild(contentPre);

    wikiDocument.appendChild(errorDiv);

    return wikiDocument;
  }

  /**
   * Validates wiki markup without building full DOM
   *
   * Useful for syntax checking before saving.
   *
   * @param {string} content - Wiki markup to validate
   * @returns {Object} Validation result { valid: boolean, errors: [], warnings: [] }
   */
  validate(content) {
    const result = {
      valid: true,
      errors: [],
      warnings: []
    };

    try {
      // Try tokenizing
      const tokenizer = new Tokenizer(content);
      const tokens = tokenizer.tokenize();

      // Check for common issues
      this.checkForWarnings(tokens, result);

    } catch (err) {
      result.valid = false;
      result.errors.push({
        message: err.message,
        position: err.position,
        line: err.line,
        column: err.column
      });
    }

    return result;
  }

  /**
   * Checks tokens for common warnings
   *
   * @param {Token[]} tokens - Tokens to check
   * @param {Object} result - Result object to add warnings to
   */
  checkForWarnings(tokens, result) {
    // Look for unclosed brackets, unmatched delimiters, etc.
    // This is a placeholder for more sophisticated checks

    const bracketStack = [];

    for (const token of tokens) {
      // Count opening/closing brackets in text
      if (token.value) {
        const openBrackets = (token.value.match(/\[/g) || []).length;
        const closeBrackets = (token.value.match(/]/g) || []).length;

        if (openBrackets !== closeBrackets) {
          result.warnings.push({
            message: 'Possibly unmatched brackets',
            line: token.line,
            column: token.column
          });
        }
      }
    }
  }

  /**
   * Gets parser statistics
   *
   * @returns {Object} Parser statistics
   */
  getStatistics() {
    return {
      ...this.parseStats,
      averageParseTime: this.parseStats.totalParses > 0
        ? this.parseStats.totalParseTime / this.parseStats.totalParses
        : 0,
      successRate: this.parseStats.totalParses > 0
        ? (this.parseStats.successfulParses / this.parseStats.totalParses) * 100
        : 0
    };
  }

  /**
   * Resets parser statistics
   */
  resetStatistics() {
    this.parseStats = {
      totalParses: 0,
      successfulParses: 0,
      failedParses: 0,
      totalParseTime: 0,
      lastParseTime: 0
    };
  }

  /**
   * Logs debug message if debug mode enabled
   *
   * @param {string} message - Message to log
   */
  log(message) {
    if (this.options.debug) {
      console.log(`[DOMParser] ${message}`);
    }
  }
}

/**
 * Custom error class for parse errors
 */
class ParseError extends Error {
  /**
   * Creates a parse error with position information
   *
   * @param {string} type - Error type
   * @param {number} position - Character position
   * @param {number} line - Line number
   * @param {number} column - Column number
   * @param {string} message - Error message
   * @param {Error} cause - Underlying error
   */
  constructor(type, position, line, column, message, cause = null) {
    super(message);
    this.name = 'ParseError';
    this.type = type;
    this.position = position;
    this.line = line;
    this.column = column;
    this.cause = cause;

    // Create detailed message
    if (line !== undefined && column !== undefined) {
      this.message = `${type} at line ${line}, column ${column}: ${message}`;
    } else {
      this.message = `${type}: ${message}`;
    }
  }
}

module.exports = { DOMParser, ParseError };
