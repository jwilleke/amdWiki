/**
 * Tokenizer - Character-by-character parser for wiki markup
 *
 * This tokenizer reads wiki content character-by-character and produces tokens
 * that can be used to build a DOM tree. It handles lookahead and pushback
 * for complex parsing scenarios.
 *
 * Key features:
 * - Character-by-character reading with position tracking
 * - Lookahead support via peekChar()
 * - Pushback support for complex token recognition
 * - Line and column tracking for error reporting
 * - Handles Unicode characters correctly
 *
 * Part of Phase 2 of WikiDocument DOM Migration (GitHub Issue #93)
 */

/**
 * Token types enum
 * @enum {string}
 */
const TokenType = {
  TEXT: 'TEXT',
  ESCAPED: 'ESCAPED',
  VARIABLE: 'VARIABLE',
  PLUGIN: 'PLUGIN',
  WIKI_TAG: 'WIKI_TAG',
  LINK: 'LINK',
  INTERWIKI: 'INTERWIKI',
  HEADING: 'HEADING',
  LIST_ITEM: 'LIST_ITEM',
  TABLE_CELL: 'TABLE_CELL',
  BOLD: 'BOLD',
  ITALIC: 'ITALIC',
  CODE_INLINE: 'CODE_INLINE',
  CODE_BLOCK: 'CODE_BLOCK',
  COMMENT: 'COMMENT',
  NEWLINE: 'NEWLINE',
  EOF: 'EOF'
};

/**
 * Token structure
 * @typedef {Object} Token
 * @property {string} type - Token type from TokenType enum
 * @property {string} value - Token value/content
 * @property {number} line - Line number where token starts
 * @property {number} column - Column number where token starts
 * @property {number} position - Character position in input
 * @property {Object} [metadata] - Additional token-specific data
 */

class Tokenizer {
  /**
   * Create a new Tokenizer
   * @param {string} input - The wiki markup to tokenize
   */
  constructor(input) {
    this.input = input || '';
    this.length = this.input.length;
    this.position = 0;
    this.line = 1;
    this.column = 1;
    this.pushbackBuffer = [];
    this.tokens = [];
  }

  /**
   * Get the current character without advancing
   * @returns {string|null} Current character or null if at EOF
   */
  peekChar() {
    if (this.pushbackBuffer.length > 0) {
      return this.pushbackBuffer[this.pushbackBuffer.length - 1].char;
    }

    if (this.position >= this.length) {
      return null;
    }

    return this.input[this.position];
  }

  /**
   * Get the next character and advance position
   * @returns {string|null} Next character or null if at EOF
   */
  nextChar() {
    // Check pushback buffer first
    if (this.pushbackBuffer.length > 0) {
      const pushed = this.pushbackBuffer.pop();
      // Restore position to AFTER the character (pushed.position is where the char is)
      this.position = pushed.position + 1;
      this.line = pushed.afterLine;
      this.column = pushed.afterColumn;
      return pushed.char;
    }

    if (this.position >= this.length) {
      return null;
    }

    const char = this.input[this.position];
    this.position++;

    // Track line and column
    if (char === '\n') {
      this.line++;
      this.column = 1;
    } else {
      this.column++;
    }

    return char;
  }

  /**
   * Push a character back onto the input stream
   * Allows the tokenizer to "undo" reading a character
   * @param {string} char - Character to push back
   */
  pushBack(char) {
    if (char === null) {
      return;
    }

    // Save current "after" position state (where we are now)
    const afterPos = this.position;
    const afterLine = this.line;
    const afterColumn = this.column;

    // Calculate "before" position (where character was read from)
    const beforePos = this.position - 1;

    // Adjust current position backwards
    this.position = beforePos;

    // Adjust line and column backwards
    if (char === '\n') {
      this.line--;
      // We don't know the exact column of the previous line,
      // Will be recalculated when needed
      this.column = 1;
    } else {
      this.column--;
    }

    // Store in pushback buffer with both before and after states
    this.pushbackBuffer.push({
      char: char,
      position: beforePos,        // where the char is in input
      afterLine: afterLine,       // line after reading
      afterColumn: afterColumn    // column after reading
    });
  }

  /**
   * Peek ahead N characters without consuming them
   * @param {number} count - Number of characters to peek ahead
   * @returns {string} String of next N characters
   */
  peekAhead(count) {
    const chars = [];

    // If pushback buffer has content, use it first
    const bufferChars = this.pushbackBuffer.slice().reverse();
    for (let i = 0; i < Math.min(count, bufferChars.length); i++) {
      chars.push(bufferChars[i].char);
    }

    // Then read from input if needed
    const remaining = count - chars.length;
    if (remaining > 0) {
      const startPos = this.position;
      for (let i = 0; i < remaining && startPos + i < this.length; i++) {
        chars.push(this.input[startPos + i]);
      }
    }

    return chars.join('');
  }

  /**
   * Skip whitespace characters (space, tab)
   * Does NOT skip newlines
   * @returns {number} Number of whitespace characters skipped
   */
  skipWhitespace() {
    let count = 0;
    while (true) {
      const char = this.peekChar();
      if (char === ' ' || char === '\t') {
        this.nextChar();
        count++;
      } else {
        break;
      }
    }
    return count;
  }

  /**
   * Skip all whitespace including newlines
   * @returns {number} Number of whitespace characters skipped
   */
  skipAllWhitespace() {
    let count = 0;
    while (true) {
      const char = this.peekChar();
      if (char === ' ' || char === '\t' || char === '\n' || char === '\r') {
        this.nextChar();
        count++;
      } else {
        break;
      }
    }
    return count;
  }

  /**
   * Check if we're at the end of the input
   * @returns {boolean} True if at EOF
   */
  isEOF() {
    return this.pushbackBuffer.length === 0 && this.position >= this.length;
  }

  /**
   * Check if we're at the start of a line
   * @returns {boolean} True if at line start
   */
  isLineStart() {
    return this.column === 1;
  }

  /**
   * Get current position information
   * @returns {Object} Position information
   */
  getPosition() {
    return {
      position: this.position,
      line: this.line,
      column: this.column
    };
  }

  /**
   * Create a token with current position information
   * @param {string} type - Token type from TokenType enum
   * @param {string} value - Token value
   * @param {Object} [metadata] - Additional token metadata
   * @returns {Token} The created token
   */
  createToken(type, value, metadata = {}) {
    return {
      type,
      value,
      line: this.line,
      column: this.column,
      position: this.position,
      metadata
    };
  }

  /**
   * Read until a specific character or string is found
   * @param {string|string[]} delimiters - Character(s) to stop at
   * @param {boolean} consume - Whether to consume the delimiter
   * @returns {string} Text read until delimiter
   */
  readUntil(delimiters, consume = false) {
    const delimiterArray = Array.isArray(delimiters) ? delimiters : [delimiters];
    const result = [];

    while (!this.isEOF()) {
      const char = this.peekChar();

      // Check if we've hit a delimiter
      let foundDelimiter = false;
      for (const delim of delimiterArray) {
        if (this.peekAhead(delim.length) === delim) {
          foundDelimiter = true;
          if (consume) {
            // Consume the delimiter
            for (let i = 0; i < delim.length; i++) {
              this.nextChar();
            }
          }
          break;
        }
      }

      if (foundDelimiter) {
        break;
      }

      result.push(this.nextChar());
    }

    return result.join('');
  }

  /**
   * Match a specific string at current position
   * @param {string} str - String to match
   * @param {boolean} consume - Whether to consume if matched
   * @returns {boolean} True if matched
   */
  match(str, consume = false) {
    if (this.peekAhead(str.length) === str) {
      if (consume) {
        for (let i = 0; i < str.length; i++) {
          this.nextChar();
        }
      }
      return true;
    }
    return false;
  }

  /**
   * Expect a specific string at current position, throw if not found
   * @param {string} str - String to expect
   * @throws {Error} If string not found
   */
  expect(str) {
    if (!this.match(str, true)) {
      throw new Error(
        `Expected "${str}" at line ${this.line}, column ${this.column}, ` +
        `but found "${this.peekAhead(str.length)}"`
      );
    }
  }

  /**
   * Get a substring of the input
   * @param {number} start - Start position
   * @param {number} end - End position
   * @returns {string} Substring
   */
  substring(start, end) {
    return this.input.substring(start, end);
  }

  /**
   * Reset tokenizer to beginning
   */
  reset() {
    this.position = 0;
    this.line = 1;
    this.column = 1;
    this.pushbackBuffer = [];
    this.tokens = [];
  }

  // ========================================================================
  // TOKEN RECOGNITION METHODS (Phase 2.3)
  // ========================================================================

  /**
   * Tokenize the entire input into tokens
   * @returns {Token[]} Array of tokens
   */
  tokenize() {
    const tokens = [];

    while (!this.isEOF()) {
      const token = this.nextToken();
      if (token) {
        tokens.push(token);
      }
    }

    // Add EOF token
    tokens.push(this.createToken(TokenType.EOF, ''));

    return tokens;
  }

  /**
   * Get the next token from the input
   * @returns {Token|null} Next token or null if EOF
   */
  nextToken() {
    if (this.isEOF()) {
      return null;
    }

    const char = this.peekChar();
    const pos = this.getPosition();

    // Newlines
    if (char === '\n') {
      return this.parseNewlineToken();
    }

    // Escaped sequences: [[text]]
    if (this.match('[[')) {
      return this.parseEscapedToken();
    }

    // Variables: {$variable}
    if (this.match('{$')) {
      return this.parseVariableToken();
    }

    // Plugins: [{INSERT ...}]
    if (this.match('[{')) {
      return this.parsePluginToken();
    }

    // Wiki tags: [tag ...]
    if (char === '[' && !this.match('[[')) {
      return this.parseWikiTagToken();
    }

    // Links: [link|text]
    // Note: Handled by parseWikiTagToken for now

    // Headings: !!! Heading (at line start)
    if (this.isLineStart() && char === '!') {
      return this.parseHeadingToken();
    }

    // Lists: * item, # item (at line start)
    if (this.isLineStart() && (char === '*' || char === '#')) {
      return this.parseListItemToken();
    }

    // Tables: | cell (at line start or after |)
    if (char === '|') {
      return this.parseTableCellToken();
    }

    // Bold: __text__
    if (this.match('__')) {
      return this.parseBoldToken();
    }

    // Italic: ''text''
    if (this.match("''")) {
      return this.parseItalicToken();
    }

    // Code inline: {{text}}
    if (this.match('{{') && !this.match('{{{')) {
      return this.parseCodeInlineToken();
    }

    // Code block: {{{code}}}
    if (this.match('{{{')) {
      return this.parseCodeBlockToken();
    }

    // Comments: <!-- comment -->
    if (this.match('<!--')) {
      return this.parseCommentToken();
    }

    // Default: plain text
    return this.parseTextToken();
  }

  /**
   * Parse newline token
   * @returns {Token} Newline token
   */
  parseNewlineToken() {
    const pos = this.getPosition();
    this.nextChar(); // consume \n
    return {
      type: TokenType.NEWLINE,
      value: '\n',
      ...pos
    };
  }

  /**
   * Parse escaped text: [[text]]
   * This is the key feature - escaped brackets for literal text
   * @returns {Token} Escaped token
   */
  parseEscapedToken() {
    const pos = this.getPosition();
    this.expect('[['); // consume [[

    const content = this.readUntil(']]');
    this.expect(']]'); // consume ]]

    return {
      type: TokenType.ESCAPED,
      value: content,
      ...pos
    };
  }

  /**
   * Parse variable: {$varname}
   * @returns {Token} Variable token
   */
  parseVariableToken() {
    const pos = this.getPosition();
    this.expect('{$');

    const varName = this.readUntil('}');
    this.expect('}');

    return {
      type: TokenType.VARIABLE,
      value: varName,
      ...pos,
      metadata: { varName }
    };
  }

  /**
   * Parse plugin: [{PLUGIN param1=value1}]
   * @returns {Token} Plugin token
   */
  parsePluginToken() {
    const pos = this.getPosition();
    this.expect('[{');

    const content = this.readUntil('}]');
    this.expect('}]');

    return {
      type: TokenType.PLUGIN,
      value: content,
      ...pos,
      metadata: { pluginContent: content }
    };
  }

  /**
   * Parse wiki tag or link: [link], [link|text]
   * @returns {Token} Wiki tag or link token
   */
  parseWikiTagToken() {
    const pos = this.getPosition();
    this.expect('[');

    const content = this.readUntil(']');
    this.expect(']');

    // Check if it's a link (contains |)
    if (content.includes('|')) {
      const [link, text] = content.split('|', 2);
      return {
        type: TokenType.LINK,
        value: content,
        ...pos,
        metadata: { link: link.trim(), text: text.trim() }
      };
    }

    return {
      type: TokenType.WIKI_TAG,
      value: content,
      ...pos
    };
  }

  /**
   * Parse heading: !!!, !!, !
   * @returns {Token} Heading token
   */
  parseHeadingToken() {
    const pos = this.getPosition();
    let level = 0;

    // Count ! characters
    while (this.peekChar() === '!' && level < 3) {
      this.nextChar();
      level++;
    }

    // Read heading text until newline
    this.skipWhitespace();
    const text = this.readUntil('\n');

    return {
      type: TokenType.HEADING,
      value: text,
      ...pos,
      metadata: { level }
    };
  }

  /**
   * Parse list item: *, #, **, ##, etc.
   * @returns {Token} List item token
   */
  parseListItemToken() {
    const pos = this.getPosition();
    const marker = this.peekChar();
    let level = 0;

    // Count markers
    while (this.peekChar() === marker) {
      this.nextChar();
      level++;
    }

    this.skipWhitespace();
    const text = this.readUntil('\n');

    return {
      type: TokenType.LIST_ITEM,
      value: text,
      ...pos,
      metadata: {
        marker: marker, // * or #
        level: level,
        ordered: marker === '#'
      }
    };
  }

  /**
   * Parse table cell: | cell
   * @returns {Token} Table cell token
   */
  parseTableCellToken() {
    const pos = this.getPosition();
    this.expect('|');

    this.skipWhitespace();
    const content = this.readUntil(['|', '\n']);

    return {
      type: TokenType.TABLE_CELL,
      value: content.trim(),
      ...pos
    };
  }

  /**
   * Parse bold: __text__
   * @returns {Token} Bold token
   */
  parseBoldToken() {
    const pos = this.getPosition();
    this.expect('__');

    const text = this.readUntil('__');
    this.expect('__');

    return {
      type: TokenType.BOLD,
      value: text,
      ...pos
    };
  }

  /**
   * Parse italic: ''text''
   * @returns {Token} Italic token
   */
  parseItalicToken() {
    const pos = this.getPosition();
    this.expect("''");

    const text = this.readUntil("''");
    this.expect("''");

    return {
      type: TokenType.ITALIC,
      value: text,
      ...pos
    };
  }

  /**
   * Parse inline code: {{text}}
   * @returns {Token} Code inline token
   */
  parseCodeInlineToken() {
    const pos = this.getPosition();
    this.expect('{{');

    const code = this.readUntil('}}');
    this.expect('}}');

    return {
      type: TokenType.CODE_INLINE,
      value: code,
      ...pos
    };
  }

  /**
   * Parse code block: {{{code}}}
   * @returns {Token} Code block token
   */
  parseCodeBlockToken() {
    const pos = this.getPosition();
    this.expect('{{{');

    const code = this.readUntil('}}}');
    this.expect('}}}');

    return {
      type: TokenType.CODE_BLOCK,
      value: code,
      ...pos
    };
  }

  /**
   * Parse HTML comment: <!-- comment -->
   * @returns {Token} Comment token
   */
  parseCommentToken() {
    const pos = this.getPosition();
    this.expect('<!--');

    const comment = this.readUntil('-->');
    this.expect('-->');

    return {
      type: TokenType.COMMENT,
      value: comment,
      ...pos
    };
  }

  /**
   * Parse plain text until next special character
   * @returns {Token} Text token
   */
  parseTextToken() {
    const pos = this.getPosition();
    const chars = [];

    // Read until we hit a special character or newline
    while (!this.isEOF()) {
      const char = this.peekChar();

      // Check for special character sequences
      if (char === '\n' ||
          this.match('[[') ||
          this.match('{$') ||
          this.match('[{') ||
          this.match('<!--') ||
          (this.isLineStart() && (char === '!' || char === '*' || char === '#')) ||
          char === '|' ||
          this.match('__') ||
          this.match("''") ||
          this.match('{{') ||
          char === '[') {
        break;
      }

      chars.push(this.nextChar());
    }

    return {
      type: TokenType.TEXT,
      value: chars.join(''),
      ...pos
    };
  }
}

// Export TokenType and Tokenizer
module.exports = {
  Tokenizer,
  TokenType
};
