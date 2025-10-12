const { TokenType } = require('./Tokenizer');
const WikiDocument = require('./WikiDocument');

/**
 * DOMBuilder - Converts tokens into a WikiDocument DOM tree
 *
 * Takes an array of tokens from the Tokenizer and builds a structured
 * DOM tree in a WikiDocument. Handles nesting, formatting, and all
 * JSPWiki-compatible markup elements.
 *
 * Key Features:
 * - Converts tokens to DOM nodes
 * - Handles nested structures (lists, tables)
 * - Manages formatting contexts (bold, italic)
 * - Creates semantic HTML elements
 *
 * Part of Phase 2.4 of WikiDocument DOM Migration (GitHub Issue #93)
 */
class DOMBuilder {
  /**
   * Creates a new DOMBuilder
   *
   * @param {WikiDocument} wikiDocument - Target WikiDocument
   */
  constructor(wikiDocument) {
    this.wikiDocument = wikiDocument;
    this.currentParent = null;
    this.listStack = []; // Track nested lists
    this.tableContext = null; // Track current table structure
    this.paragraphContext = null; // Track current paragraph
  }

  /**
   * Builds a DOM tree from an array of tokens
   *
   * @param {Token[]} tokens - Array of tokens from Tokenizer
   * @returns {WikiDocument} The WikiDocument with built DOM
   */
  buildFromTokens(tokens) {
    // Start with document root
    this.currentParent = this.wikiDocument.getRootElement();

    for (let i = 0; i < tokens.length; i++) {
      const token = tokens[i];

      // Skip EOF token
      if (token.type === TokenType.EOF) {
        break;
      }

      // Create and append node for this token
      this.processToken(token);
    }

    // Clean up any open contexts
    this.closeCurrentParagraph();
    this.closeAllLists();
    this.closeCurrentTable();

    return this.wikiDocument;
  }

  /**
   * Processes a single token
   *
   * @param {Token} token - Token to process
   */
  processToken(token) {
    switch (token.type) {
      case TokenType.TEXT:
        this.handleText(token);
        break;
      case TokenType.ESCAPED:
        this.handleEscaped(token);
        break;
      case TokenType.VARIABLE:
        this.handleVariable(token);
        break;
      case TokenType.PLUGIN:
        this.handlePlugin(token);
        break;
      case TokenType.WIKI_TAG:
        this.handleWikiTag(token);
        break;
      case TokenType.LINK:
        this.handleLink(token);
        break;
      case TokenType.INTERWIKI:
        this.handleInterWiki(token);
        break;
      case TokenType.HEADING:
        this.handleHeading(token);
        break;
      case TokenType.LIST_ITEM:
        this.handleListItem(token);
        break;
      case TokenType.TABLE_CELL:
        this.handleTableCell(token);
        break;
      case TokenType.BOLD:
        this.handleBold(token);
        break;
      case TokenType.ITALIC:
        this.handleItalic(token);
        break;
      case TokenType.CODE_INLINE:
        this.handleCodeInline(token);
        break;
      case TokenType.CODE_BLOCK:
        this.handleCodeBlock(token);
        break;
      case TokenType.COMMENT:
        this.handleComment(token);
        break;
      case TokenType.NEWLINE:
        this.handleNewline(token);
        break;
      default:
        // Unknown token type - treat as text
        this.handleText(token);
    }
  }

  // ========================================================================
  // TOKEN HANDLERS
  // ========================================================================

  /**
   * Handles plain text tokens
   */
  handleText(token) {
    this.ensureParagraph();
    const textNode = this.wikiDocument.createTextNode(token.value);
    this.paragraphContext.appendChild(textNode);
  }

  /**
   * Handles escaped text [[...]]
   * This is literal text that should not be parsed
   */
  handleEscaped(token) {
    this.ensureParagraph();
    const textNode = this.wikiDocument.createTextNode(token.value);
    this.paragraphContext.appendChild(textNode);
  }

  /**
   * Handles variables {$varname}
   */
  handleVariable(token) {
    this.ensureParagraph();
    const span = this.wikiDocument.createElement('span', {
      class: 'wiki-variable',
      'data-variable': token.metadata.varName
    });
    span.textContent = `{$${token.metadata.varName}}`;
    this.paragraphContext.appendChild(span);
  }

  /**
   * Handles plugins [{PLUGIN ...}]
   */
  handlePlugin(token) {
    this.closeCurrentParagraph();
    const div = this.wikiDocument.createElement('div', {
      class: 'wiki-plugin',
      'data-plugin-content': token.value
    });
    div.textContent = `[{${token.value}}]`;
    this.currentParent.appendChild(div);
  }

  /**
   * Handles wiki tags [tag]
   */
  handleWikiTag(token) {
    this.ensureParagraph();
    const span = this.wikiDocument.createElement('span', {
      class: 'wiki-tag',
      'data-tag': token.value
    });
    span.textContent = `[${token.value}]`;
    this.paragraphContext.appendChild(span);
  }

  /**
   * Handles links [link|text]
   */
  handleLink(token) {
    this.ensureParagraph();
    const link = this.wikiDocument.createElement('a', {
      class: 'wiki-link',
      'data-wiki-link': token.metadata.link,
      href: `#${token.metadata.link}`
    });
    link.textContent = token.metadata.text || token.metadata.link;
    this.paragraphContext.appendChild(link);
  }

  /**
   * Handles interwiki links [Wiki:Page]
   */
  handleInterWiki(token) {
    this.ensureParagraph();
    const link = this.wikiDocument.createElement('a', {
      class: 'wiki-interwiki',
      'data-interwiki': token.value,
      href: `#${token.value}`
    });
    link.textContent = token.value;
    this.paragraphContext.appendChild(link);
  }

  /**
   * Handles headings !, !!, !!!
   */
  handleHeading(token) {
    this.closeCurrentParagraph();
    this.closeAllLists();
    this.closeCurrentTable();

    // JSPWiki uses ! for h3, !! for h2, !!! for h1
    // Level in metadata is count of !, so reverse for h-tags
    const level = Math.min(Math.max(1, token.metadata.level), 6);
    const headingLevel = 4 - level; // !!! = 3 → h1, !! = 2 → h2, ! = 1 → h3
    const hTag = `h${headingLevel}`;

    const heading = this.wikiDocument.createElement(hTag, {
      class: 'wiki-heading'
    });
    heading.textContent = token.value.trim();
    this.currentParent.appendChild(heading);
  }

  /**
   * Handles list items *, #
   */
  handleListItem(token) {
    this.closeCurrentParagraph();
    this.closeCurrentTable();

    const level = token.metadata.level;
    const isOrdered = token.metadata.ordered;

    // Manage list nesting
    this.adjustListStack(level, isOrdered);

    // Create list item
    const li = this.wikiDocument.createElement('li', {
      class: 'wiki-list-item'
    });
    li.textContent = token.value.trim();

    // Append to current list
    const currentList = this.listStack[this.listStack.length - 1].element;
    currentList.appendChild(li);
  }

  /**
   * Handles table cells | cell |
   */
  handleTableCell(token) {
    this.closeCurrentParagraph();
    this.closeAllLists();

    // Ensure table structure exists
    if (!this.tableContext) {
      this.tableContext = {
        table: this.wikiDocument.createElement('table', { class: 'wiki-table' }),
        currentRow: null
      };
      this.currentParent.appendChild(this.tableContext.table);
    }

    // Create new row if needed
    if (!this.tableContext.currentRow) {
      this.tableContext.currentRow = this.wikiDocument.createElement('tr');
      this.tableContext.table.appendChild(this.tableContext.currentRow);
    }

    // Create cell
    const td = this.wikiDocument.createElement('td', { class: 'wiki-table-cell' });
    td.textContent = token.value;
    this.tableContext.currentRow.appendChild(td);
  }

  /**
   * Handles bold text __text__
   */
  handleBold(token) {
    this.ensureParagraph();
    const strong = this.wikiDocument.createElement('strong', { class: 'wiki-bold' });
    strong.textContent = token.value;
    this.paragraphContext.appendChild(strong);
  }

  /**
   * Handles italic text ''text''
   */
  handleItalic(token) {
    this.ensureParagraph();
    const em = this.wikiDocument.createElement('em', { class: 'wiki-italic' });
    em.textContent = token.value;
    this.paragraphContext.appendChild(em);
  }

  /**
   * Handles inline code {{text}}
   */
  handleCodeInline(token) {
    this.ensureParagraph();
    const code = this.wikiDocument.createElement('code', { class: 'wiki-code-inline' });
    code.textContent = token.value;
    this.paragraphContext.appendChild(code);
  }

  /**
   * Handles code blocks {{{code}}}
   */
  handleCodeBlock(token) {
    this.closeCurrentParagraph();
    const pre = this.wikiDocument.createElement('pre', { class: 'wiki-code-block' });
    const code = this.wikiDocument.createElement('code');
    code.textContent = token.value;
    pre.appendChild(code);
    this.currentParent.appendChild(pre);
  }

  /**
   * Handles HTML comments <!-- comment -->
   */
  handleComment(token) {
    // Comments can go anywhere
    const comment = this.wikiDocument.createCommentNode(token.value);
    if (this.paragraphContext) {
      this.paragraphContext.appendChild(comment);
    } else {
      this.currentParent.appendChild(comment);
    }
  }

  /**
   * Handles newlines
   */
  handleNewline(token) {
    // Close current table row on newline
    if (this.tableContext && this.tableContext.currentRow) {
      this.tableContext.currentRow = null;
    }

    // For paragraphs, newline can mean paragraph break
    // (Implementation detail: could check for double newlines)
    // For now, just note the newline occurred
  }

  // ========================================================================
  // CONTEXT MANAGEMENT
  // ========================================================================

  /**
   * Ensures a paragraph context exists for inline content
   */
  ensureParagraph() {
    if (!this.paragraphContext) {
      this.closeAllLists();
      this.closeCurrentTable();

      this.paragraphContext = this.wikiDocument.createElement('p', {
        class: 'wiki-paragraph'
      });
      this.currentParent.appendChild(this.paragraphContext);
    }
  }

  /**
   * Closes the current paragraph context
   */
  closeCurrentParagraph() {
    this.paragraphContext = null;
  }

  /**
   * Adjusts the list stack to match the desired level
   */
  adjustListStack(targetLevel, isOrdered) {
    // Close lists deeper than target level
    while (this.listStack.length > targetLevel) {
      this.listStack.pop();
    }

    // Open lists to reach target level
    while (this.listStack.length < targetLevel) {
      const newLevel = this.listStack.length + 1;
      const listType = isOrdered ? 'ol' : 'ul';
      const list = this.wikiDocument.createElement(listType, {
        class: `wiki-list wiki-list-level-${newLevel}`
      });

      // Append to parent (either root or last list item)
      if (this.listStack.length === 0) {
        this.currentParent.appendChild(list);
      } else {
        // Append to last item in parent list
        const parentList = this.listStack[this.listStack.length - 1].element;
        const lastItem = parentList.lastChild;
        if (lastItem) {
          lastItem.appendChild(list);
        } else {
          parentList.appendChild(list);
        }
      }

      this.listStack.push({ level: newLevel, element: list, ordered: isOrdered });
    }

    // Check if we need to change list type at current level
    if (this.listStack.length > 0) {
      const currentList = this.listStack[this.listStack.length - 1];
      if (currentList.ordered !== isOrdered) {
        // Close and reopen with correct type
        this.listStack.pop();
        const listType = isOrdered ? 'ol' : 'ul';
        const list = this.wikiDocument.createElement(listType, {
          class: `wiki-list wiki-list-level-${targetLevel}`
        });

        if (this.listStack.length === 0) {
          this.currentParent.appendChild(list);
        } else {
          const parentList = this.listStack[this.listStack.length - 1].element;
          const lastItem = parentList.lastChild;
          if (lastItem) {
            lastItem.appendChild(list);
          }
        }

        this.listStack.push({ level: targetLevel, element: list, ordered: isOrdered });
      }
    }
  }

  /**
   * Closes all open lists
   */
  closeAllLists() {
    this.listStack = [];
  }

  /**
   * Closes the current table context
   */
  closeCurrentTable() {
    this.tableContext = null;
  }
}

module.exports = DOMBuilder;
