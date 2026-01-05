import BaseSyntaxHandler, { InitializationContext, ParseContext } from './BaseSyntaxHandler';
import logger from '../../utils/logger';

/**
 * Table cell information
 */
interface TableCell {
  type: 'th' | 'td';
  content: string;
}

/**
 * Parsed table row
 */
interface ParsedRow {
  cells: TableCell[];
  isHeader: boolean;
}

/**
 * Wiki engine interface
 */
interface WikiEngine {
  getManager(name: string): unknown;
}

/**
 * WikiTableHandler - JSPWiki table syntax parser with state-based parsing
 * Inspired by JSPWiki's m_istable state flag approach
 */
class WikiTableHandler extends BaseSyntaxHandler {
  declare handlerId: string;
  private engine: WikiEngine | null;

  constructor(engine: WikiEngine | null = null) {
    super(
      /^\s*\|.+\|\s*$/gm, // Pattern for table rows
      60,   // Priority - after WikiStyleHandler (70)
      {
        description: 'JSPWiki-style table parser with state flags',
        version: '2.0.0',
        dependencies: [],
        timeout: 5000
      }
    );
    this.handlerId = 'WikiTableHandler';
    this.engine = engine;
  }

  // eslint-disable-next-line @typescript-eslint/require-await
  protected async onInitialize(context: InitializationContext): Promise<void> {
    this.engine = context.engine as WikiEngine | undefined ?? null;
    logger.debug('WikiTableHandler initialized');
  }

  // eslint-disable-next-line @typescript-eslint/require-await
  async process(content: string, _context: ParseContext): Promise<string> {
    if (!content || typeof content !== 'string') {
      return content;
    }

    // JSPWiki-style state flags
    let m_istable = false;
    let m_tableClasses = '';
    let m_tableRows: string[] = [];

    const lines = content.split('\n');
    const result: string[] = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const trimmed = line.trim();

      // Check for TABLE_CLASSES marker (set by WikiStyleHandler)
      const markerMatch = trimmed.match(/^%%TABLE_CLASSES\{([^}]+)\}%%$/);
      if (markerMatch) {
        m_tableClasses = markerMatch[1] ?? '';
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
  private parseTableRow(line: string): ParsedRow {
    const trimmed = line.trim();
    const isHeader = trimmed.startsWith('||') && trimmed.endsWith('||');

    let cells: TableCell[];
    if (isHeader) {
      const content = trimmed.slice(2, -2);
      cells = content.split('||').map(cell => ({
        type: 'th' as const,
        content: cell.trim()
      }));
    } else {
      const content = trimmed.slice(1, -1);
      cells = content.split('|').map(cell => ({
        type: 'td' as const,
        content: cell.trim()
      }));
    }

    return { cells, isHeader };
  }

  /**
   * Build HTML table from collected rows
   */
  private buildTable(rows: string[], classes: string = ''): string {
    if (rows.length === 0) return '';

    const parsedRows = rows.map(row => this.parseTableRow(row));
    const headerRows = parsedRows.filter(row => row.isHeader);
    const bodyRows = parsedRows.filter(row => !row.isHeader);

    // Build class attribute
    let classAttr: string;
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

  private escapeHtml(text: string): string {
    if (typeof text !== 'string') return text;
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  getInfo(): Record<string, unknown> {
    return {
      ...super.getMetadata(),
      supportedPatterns: ['|| Header ||', '| Cell |'],
      features: ['State-based parsing', 'JSPWiki compatibility']
    };
  }
}

export default WikiTableHandler;

// CommonJS compatibility
module.exports = WikiTableHandler;
