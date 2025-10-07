const { BaseSyntaxHandler } = require('./BaseSyntaxHandler');

/**
 * WikiTableHandler - JSPWiki table syntax parser with state-based parsing
 * Inspired by JSPWiki's m_istable state flag approach
 */
class WikiTableHandler extends BaseSyntaxHandler {
  constructor(engine = null) {
    super(
      /^\s*\|.+\|\s*$/gm, // Pattern for table rows
      60,   // Priority - after WikiStyleHandler (70)
      {
        description: 'JSPWiki-style table parser with state flags',
        version: '2.0.0',
        dependencies: [],
        timeout: 5000,
        cacheEnabled: true
      }
    );
    this.handlerId = 'WikiTableHandler';
    this.engine = engine;
  }

  async onInitialize(context) {
    this.engine = context.engine;
    console.log(`📊 WikiTableHandler initialized`);
  }

  async process(content, context) {
    if (!content || typeof content !== 'string') {
      return content;
    }

    // JSPWiki-style state flags
    let m_istable = false;
    let m_tableClasses = '';
    let m_tableRows = [];

    const lines = content.split('\n');
    const result = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const trimmed = line.trim();

      // Check for TABLE_CLASSES marker (set by WikiStyleHandler)
      const markerMatch = trimmed.match(/^%%TABLE_CLASSES\{([^}]+)\}%%$/);
      if (markerMatch) {
        m_tableClasses = markerMatch[1];
        continue; // Don't output the marker itself
      }

      // Check if line is a table row
      const isTableRow = /^\s*\|.+\|\s*$/.test(trimmed);

      if (isTableRow) {
        if (!m_istable) {
          // Start a new table
          m_istable = true;
          m_tableRows = [];
        }
        m_tableRows.push(trimmed);
      } else {
        // Not a table row
        if (m_istable) {
          // Close the current table
          const tableHtml = this.buildTable(m_tableRows, m_tableClasses);
          result.push(tableHtml);

          // Reset state
          m_istable = false;
          m_tableRows = [];
          m_tableClasses = '';
        }
        // Output the non-table line
        result.push(line);
      }
    }

    // Handle table at end of content
    if (m_istable && m_tableRows.length > 0) {
      const tableHtml = this.buildTable(m_tableRows, m_tableClasses);
      result.push(tableHtml);
    }

    return result.join('\n');
  }

  /**
   * Parse a single table row
   */
  parseTableRow(line) {
    const trimmed = line.trim();
    const isHeader = trimmed.startsWith('||') && trimmed.endsWith('||');

    let cells;
    if (isHeader) {
      const content = trimmed.slice(2, -2);
      cells = content.split('||').map(cell => ({
        type: 'th',
        content: cell.trim()
      }));
    } else {
      const content = trimmed.slice(1, -1);
      cells = content.split('|').map(cell => ({
        type: 'td',
        content: cell.trim()
      }));
    }

    return { cells, isHeader };
  }

  /**
   * Build HTML table from collected rows
   */
  buildTable(rows, classes = '') {
    if (rows.length === 0) return '';

    const parsedRows = rows.map(row => this.parseTableRow(row));
    const headerRows = parsedRows.filter(row => row.isHeader);
    const bodyRows = parsedRows.filter(row => !row.isHeader);

    // Build class attribute
    let classAttr = '';
    if (classes) {
      const classSet = new Set(classes.split(/\s+/).filter(c => c));
      if (!classSet.has('table')) {
        classSet.add('table');
      }
      classAttr = ` class="${Array.from(classSet).join(' ')}"`;
    } else {
      classAttr = ' class="table"';
    }

    let html = `<table${classAttr}>\n`;

    // Add thead
    if (headerRows.length > 0) {
      html += '  <thead>\n';
      headerRows.forEach(row => {
        html += '    <tr>\n';
        row.cells.forEach(cell => {
          html += `      <${cell.type}>${this.escapeHtml(cell.content)}</${cell.type}>\n`;
        });
        html += '    </tr>\n';
      });
      html += '  </thead>\n';
    }

    // Add tbody
    if (bodyRows.length > 0) {
      html += '  <tbody>\n';
      bodyRows.forEach(row => {
        html += '    <tr>\n';
        row.cells.forEach(cell => {
          html += `      <${cell.type}>${this.escapeHtml(cell.content)}</${cell.type}>\n`;
        });
        html += '    </tr>\n';
      });
      html += '  </tbody>\n';
    }

    html += '</table>\n';
    return html;
  }

  escapeHtml(text) {
    if (typeof text !== 'string') return text;
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  getInfo() {
    return {
      ...super.getMetadata(),
      supportedPatterns: ['|| Header ||', '| Cell |'],
      features: ['State-based parsing', 'JSPWiki compatibility']
    };
  }
}

module.exports = WikiTableHandler;
