/**
 * Shared plugin formatting utilities for amdWiki plugins.
 * Implements the common output formats defined in issue #238 (Code Consolidation).
 *
 * All plugins should use these helpers to ensure consistent behaviour for
 * `max`, `format`, `before`, and `after` parameters across the platform.
 */

/** A renderable page link with href, display text, and optional styling */
export interface PageLink {
  href: string;
  text: string;
  cssClass?: string;
  style?: string;
  title?: string;
}

/** Options for list/item formatting */
export interface FormatOptions {
  before?: string;
  after?: string;
}

/**
 * Parse a `max` plugin parameter to an integer.
 * Returns `defaultMax` if the value is missing, empty, or non-numeric.
 * A value of 0 means unlimited.
 */
export function parseMaxParam(value: string | number | undefined, defaultMax = 0): number {
  if (value === undefined || value === null || value === '') return defaultMax;
  const n = parseInt(String(value), 10);
  return isNaN(n) || n < 0 ? defaultMax : n;
}

/**
 * Apply a max limit to an array.
 * max=0 means unlimited (returns all items unchanged).
 */
export function applyMax<T>(items: T[], max: number): T[] {
  return max > 0 ? items.slice(0, max) : items;
}

/**
 * Escape HTML special characters.
 * Accepts any primitive value; null/undefined return an empty string.
 */
export function escapeHtml(text: string | number | boolean | null | undefined): string {
  if (text === null || text === undefined) return '';
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return String(text).replace(/[&<>"']/g, m => map[m]);
}

/**
 * Format a list of page links as an HTML bullet list.
 * Supports optional `before`/`after` markers around each item (JSPWiki-style).
 * Returns an informational message when the list is empty.
 */
export function formatAsList(links: PageLink[], options: FormatOptions = {}): string {
  if (links.length === 0) {
    return '<p><em>No pages found.</em></p>';
  }

  const before = options.before ?? '';
  const after  = options.after  ?? '';

  const processedBefore = before.replace(/\\n/g, '\n').replace(/\\t/g, '\t');
  const processedAfter  = after.replace(/\\n/g,  '\n').replace(/\\t/g, '\t');

  const buildAnchor = (link: PageLink): string => {
    const cls   = link.cssClass ? ` class="${link.cssClass}"` : '';
    const style = link.style    ? ` style="${link.style}"`    : '';
    const title = link.title    ? ` title="${escapeHtml(link.title)}"` : '';
    return `<a href="${link.href}"${cls}${style}${title}>${escapeHtml(link.text)}</a>`;
  };

  if (processedBefore || processedAfter) {
    const isList = processedBefore.includes('*') || processedBefore.includes('-');
    if (isList) {
      const items = links.map(l => `<li>${buildAnchor(l)}</li>`).join('\n');
      return `<ul>\n${items}\n</ul>`;
    }
    const safeBefore = processedBefore.replace(/\*/g, '&#42; ');
    const safeAfter  = processedAfter.replace(/\*/g,  '&#42; ');
    return links
      .map(l => `${safeBefore}${buildAnchor(l)}${safeAfter}`)
      .join('\n')
      .replace(/\n/g, '<br>');
  }

  // Default: <ul><li> list
  const items = links.map(l => `<li>${buildAnchor(l)}</li>`).join('\n');
  return `<ul>\n${items}\n</ul>`;
}

/**
 * Format a count as a plain numeric string.
 */
export function formatAsCount(n: number): string {
  return String(n);
}

/**
 * Format rows of data as an HTML table.
 * Cell values may contain raw HTML (e.g. anchor tags).
 * Header values are plain text and will be HTML-escaped.
 *
 * @param headers - Column header strings (plain text)
 * @param rows    - Array of row arrays; each element is a cell value (may be raw HTML)
 */
export function formatAsTable(headers: string[], rows: string[][]): string {
  if (rows.length === 0) {
    return '<p><em>No pages found.</em></p>';
  }

  const headerHtml = headers.map(h => `<th>${escapeHtml(h)}</th>`).join('');
  const rowsHtml   = rows.map(row =>
    `<tr>${row.map(cell => `<td>${cell}</td>`).join('')}</tr>`
  ).join('\n');

  return [
    '<table class="plugin-table">',
    `<thead><tr>${headerHtml}</tr></thead>`,
    '<tbody>',
    rowsHtml,
    '</tbody>',
    '</table>'
  ].join('\n');
}
