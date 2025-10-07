const { BaseSyntaxHandler } = require('./BaseSyntaxHandler');

/**
 * JSPWikiPreprocessor - Processes JSPWiki syntax BEFORE markdown
 *
 * This handler runs in Phase 1 (Preprocessing) to:
 * 1. Parse nested %%.../%% style blocks
 * 2. Convert JSPWiki table syntax (|| header ||, | cell |) to HTML
 * 3. Apply style classes to tables
 *
 * This matches JSPWiki's architecture where pre-blocking happens in the parser
 * before any other transformations (like markdown).
 *
 * Related to: #41 - JSPWiki Table Styles Implementation
 */
class JSPWikiPreprocessor extends BaseSyntaxHandler {
  constructor(engine) {
    // Pass a pattern (we'll override process() anyway), priority, and options
    super(
      /%%[\s\S]*?\/%/g, // Pattern to match %%.../%% blocks
      95, // Priority: Run early in Phase 1, but after EscapedSyntaxHandler (100)
      {
        description: 'JSPWiki preprocessor for %%.../%% blocks and table syntax',
        version: '1.0.0',
        dependencies: [],
        cacheEnabled: false // Content is too dynamic to cache
      }
    );
    this.handlerId = 'JSPWikiPreprocessor';
    this.phase = 1; // Preprocessing phase
    this.engine = engine;

    // JSPWiki table style classes
    this.tableClasses = [
      'sortable', 'table-sort', 'table-filter',
      'zebra-table', 'table-striped', 'table-hover',
      'table-fit', 'table-bordered', 'table-sm', 'table-responsive',
      'table-condensed' // Alias for table-sm
    ];
  }

  /**
   * Process content: find and parse all %%.../%% blocks with nested support
   */
  async process(content, context) {
    // Parse all %%.../%% blocks (including nested ones)
    const processedContent = this.parseStyleBlocks(content);
    return processedContent;
  }

  /**
   * Parse nested %%.../%% blocks
   * JSPWiki syntax allows nesting like:
   * %%zebra-table
   * %%sortable
   * || Header ||
   * | Cell |
   * /%
   * /%
   */
  parseStyleBlocks(content, accumulatedClasses = []) {
    const lines = content.split('\n');
    const result = [];
    let i = 0;

    while (i < lines.length) {
      const line = lines[i];

      // Check if line starts a style block: %%class-name
      if (/^\s*%%([a-zA-Z0-9_-]+)\s*$/.test(line)) {
        const match = line.match(/^\s*%%([a-zA-Z0-9_-]+)\s*$/);
        const className = match[1];

        // Find the matching /% and extract block content
        const blockResult = this.extractBlock(lines, i);
        if (blockResult) {
          const { content: blockContent, endIndex } = blockResult;

          // Check if this is a table-related style
          if (this.isTableClass(className)) {
            // Add this class to accumulated classes and process recursively
            const newAccumulatedClasses = [...accumulatedClasses, className];
            const processedBlock = this.parseStyleBlocks(blockContent, newAccumulatedClasses);

            // If the processed block is already a table, return it directly
            // Otherwise, it might contain nested blocks that need to be collected
            if (processedBlock.trim().startsWith('<table')) {
              result.push(processedBlock);
            } else {
              // Process the block to find tables
              result.push(processedBlock);
            }
          } else {
            // Generic div wrapper for non-table styles
            result.push(`<div class="${className}">`);
            result.push(this.parseStyleBlocks(blockContent, accumulatedClasses));
            result.push('</div>');
          }

          i = endIndex + 1; // Skip to after the closing /%
          continue;
        }
      }

      // Check if this line contains table syntax
      if (/^\s*\|/.test(line)) {
        // Collect all consecutive table lines
        const tableLines = [];
        while (i < lines.length && /^\s*\|/.test(lines[i])) {
          tableLines.push(lines[i]);
          i++;
        }

        // Parse the table with accumulated classes
        const classesStr = accumulatedClasses.join(' ');
        const tableHtml = this.parseTable(tableLines.join('\n'), classesStr);
        result.push(tableHtml);
        continue;
      }

      // Regular line - pass through
      result.push(line);
      i++;
    }

    return result.join('\n');
  }

  /**
   * Extract a %%.../%% block starting at startIndex
   * Returns { content, endIndex } or null if no matching /% found
   */
  extractBlock(lines, startIndex) {
    let depth = 1; // We're already at a %% line
    let contentLines = [];

    for (let i = startIndex + 1; i < lines.length; i++) {
      const line = lines[i];

      // Check for nested %% opening
      if (/^\s*%%([a-zA-Z0-9_-]+)\s*$/.test(line)) {
        depth++;
        contentLines.push(line);
        continue;
      }

      // Check for /% closing
      if (/^\s*\/%\s*$/.test(line)) {
        depth--;
        if (depth === 0) {
          // Found the matching closing tag
          return {
            content: contentLines.join('\n'),
            endIndex: i
          };
        }
        contentLines.push(line);
        continue;
      }

      // Regular content line
      contentLines.push(line);
    }

    // No matching /% found - treat as regular content
    return null;
  }

  /**
   * Check if a class name is table-related
   * Also handles custom color syntax: zebra-HEXCOLOR (e.g., zebra-ffe0e0)
   */
  isTableClass(className) {
    // Check standard table classes
    if (this.tableClasses.includes(className)) {
      return true;
    }

    // Check for custom zebra color: zebra-HEXCOLOR (e.g., zebra-ffe0e0)
    if (/^zebra-[0-9a-fA-F]{6}$/.test(className)) {
      return true;
    }

    return false;
  }

  /**
   * Calculate contrast color (black or white) for a given background color
   * Uses WCAG relative luminance formula
   * @param {string} hexColor - 6-digit hex color (without #)
   * @returns {string} - '#000000' or '#ffffff'
   */
  getContrastColor(hexColor) {
    // Convert hex to RGB
    const r = parseInt(hexColor.substring(0, 2), 16);
    const g = parseInt(hexColor.substring(2, 4), 16);
    const b = parseInt(hexColor.substring(4, 6), 16);

    // Calculate relative luminance (WCAG formula)
    // Weights are based on human eye sensitivity to different colors
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

    // Return black for light backgrounds, white for dark backgrounds
    return luminance > 0.5 ? '#000000' : '#ffffff';
  }

  /**
   * Extract custom styles from class names
   * Returns { classes: string, styles: string }
   */
  extractCustomStyles(classNames) {
    const classes = [];
    const styles = [];

    classNames.forEach(className => {
      // Check for custom zebra color: zebra-HEXCOLOR
      const colorMatch = className.match(/^zebra-([0-9a-fA-F]{6})$/);
      if (colorMatch) {
        const hexColor = colorMatch[1];
        classes.push('zebra-table'); // Apply zebra-table class

        // Calculate contrast text color
        const textColor = this.getContrastColor(hexColor);

        // Add inline styles for custom background and text color
        styles.push(`--zebra-row-even: #${hexColor};`);
        styles.push(`--zebra-text-color: ${textColor};`);
      } else {
        classes.push(className);
      }
    });

    return {
      classes: classes.join(' '),
      styles: styles.length > 0 ? styles.join(' ') : null
    };
  }

  /**
   * Parse JSPWiki table syntax and convert to HTML
   * Handles both header rows (|| cell ||) and data rows (| cell |)
   *
   * @param {string} content - Table markup
   * @param {string} className - CSS classes to apply (space-separated, can be empty)
   */
  parseTable(content, className) {
    const lines = content.split('\n').filter(line => /^\s*\|/.test(line));

    if (lines.length === 0) {
      return content; // No table found
    }

    // Parse each row
    const rows = lines.map(line => this.parseTableRow(line));

    // Separate header and body rows
    const headerRows = rows.filter(row => row.isHeader);
    const bodyRows = rows.filter(row => !row.isHeader);

    // Extract custom styles from class names
    const classArray = className ? className.split(/\s+/).filter(c => c) : [];
    const { classes: processedClasses, styles } = this.extractCustomStyles(classArray);

    // Build HTML
    const classes = ['table'];
    if (processedClasses) {
      classes.push(processedClasses);
    }

    const classAttr = ` class="${classes.join(' ')}"`;
    const styleAttr = styles ? ` style="${styles}"` : '';

    let html = `<table${classAttr}${styleAttr}>\n`;

    // Add thead if there are header rows
    if (headerRows.length > 0) {
      html += '  <thead>\n';
      headerRows.forEach(row => {
        html += '    <tr>\n';
        row.cells.forEach(cell => {
          html += `      <th>${this.escapeHtml(cell)}</th>\n`;
        });
        html += '    </tr>\n';
      });
      html += '  </thead>\n';
    }

    // Add tbody if there are body rows
    if (bodyRows.length > 0) {
      html += '  <tbody>\n';
      bodyRows.forEach(row => {
        html += '    <tr>\n';
        row.cells.forEach(cell => {
          html += `      <td>${this.escapeHtml(cell)}</td>\n`;
        });
        html += '    </tr>\n';
      });
      html += '  </tbody>\n';
    }

    html += '</table>';

    return html;
  }

  /**
   * Parse a single table row
   * Header row: || cell1 || cell2 ||
   * Data row: | cell1 | cell2 |
   */
  parseTableRow(line) {
    const trimmed = line.trim();

    // Check if it's a header row (starts with ||)
    const isHeader = trimmed.startsWith('||');

    // Split by || for headers or | for data
    const delimiter = isHeader ? '||' : '|';
    const parts = trimmed.split(delimiter);

    // Remove empty first/last elements (from leading/trailing delimiters)
    const cells = parts
      .slice(1, -1) // Remove first and last (empty from delimiters)
      .map(cell => cell.trim());

    return { isHeader, cells };
  }

  /**
   * Escape HTML special characters
   */
  escapeHtml(text) {
    const map = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, m => map[m]);
  }

  /**
   * Get handler metadata
   */
  getMetadata() {
    return {
      handlerId: this.handlerId,
      name: 'JSPWiki Preprocessor',
      description: 'Processes JSPWiki %%.../%% blocks and table syntax before markdown',
      phase: this.phase,
      priority: this.priority,
      version: '1.0.0'
    };
  }
}

module.exports = JSPWikiPreprocessor;
