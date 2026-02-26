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
 * Format a count with locale-appropriate thousands separators (e.g. 32,227).
 */
export function formatAsCount(n: number): string {
  return n.toLocaleString('en-US');
}

// ---------------------------------------------------------------------------
// Sort utilities
// ---------------------------------------------------------------------------

export type SortOrder = 'asc' | 'desc';

export interface SortOptions {
  key: string;
  order: SortOrder;
}

/**
 * Parse a `sort=` plugin parameter.
 * Accepts "name", "name-asc", "name-desc", "count-asc", "count-desc", etc.
 * validKeys is the list of allowed key names.
 * Falls back to defaultKey/defaultOrder for any unrecognised value.
 */
export function parseSortParam(
  value: string | undefined,
  validKeys: string[],
  defaultKey: string,
  defaultOrder: SortOrder = 'asc'
): SortOptions {
  if (!value) return { key: defaultKey, order: defaultOrder };
  const v = String(value).toLowerCase().trim();
  for (const key of validKeys) {
    if (v === key)            return { key, order: defaultOrder };
    if (v === `${key}-asc`)   return { key, order: 'asc' };
    if (v === `${key}-desc`)  return { key, order: 'desc' };
  }
  return { key: defaultKey, order: defaultOrder };
}

// ---------------------------------------------------------------------------
// Table formatting
// ---------------------------------------------------------------------------

export interface TableOptions {
  /** When true, adds the "sortable" CSS class so tableSort.js activates */
  sortable?: boolean;
  /** 0-indexed column that is the initial sort column */
  defaultSortColumn?: number;
  /** Initial sort direction (default: 'asc') */
  defaultSortOrder?: SortOrder;
  /**
   * Per-column callbacks that return a `data-sort` attribute value for a cell.
   * Keyed by column index.  Needed when a cell contains HTML (e.g. links) but
   * tableSort.js should sort on the underlying numeric/text value.
   * Receives the cell's row data AND the 0-based row index within `rows`.
   */
  cellDataSort?: Record<number, (row: string[], rowIndex: number) => string>;
}

/**
 * Format rows of data as an HTML table.
 * Cell values may contain raw HTML (e.g. anchor tags).
 * Header values are plain text and will be HTML-escaped.
 *
 * @param headers - Column header strings (plain text)
 * @param rows    - Array of row arrays; each element is a cell value (may be raw HTML)
 * @param options - Optional table rendering options (sortable, pagination hints, etc.)
 */
export function formatAsTable(headers: string[], rows: string[][], options?: TableOptions): string {
  if (rows.length === 0) {
    return '<p><em>No pages found.</em></p>';
  }

  const opts = options ?? {};
  const classes = ['plugin-table'];
  if (opts.sortable) classes.push('sortable');

  let tableAttrs = `class="${classes.join(' ')}"`;
  if (opts.sortable && opts.defaultSortColumn !== undefined) {
    tableAttrs += ` data-sort-column="${opts.defaultSortColumn}" data-sort-direction="${opts.defaultSortOrder ?? 'asc'}"`;
  }

  const headerHtml = headers.map(h => `<th>${escapeHtml(h)}</th>`).join('');
  const rowsHtml   = rows.map((row, rowIndex) =>
    `<tr>${row.map((cell, colIdx) => {
      if (opts.cellDataSort?.[colIdx]) {
        const sortVal = opts.cellDataSort[colIdx](row, rowIndex);
        return `<td data-sort="${escapeHtml(sortVal)}">${cell}</td>`;
      }
      return `<td>${cell}</td>`;
    }).join('')}</tr>`
  ).join('\n');

  return [
    `<table ${tableAttrs}>`,
    `<thead><tr>${headerHtml}</tr></thead>`,
    '<tbody>',
    rowsHtml,
    '</tbody>',
    '</table>'
  ].join('\n');
}

// ---------------------------------------------------------------------------
// Pagination utilities
// ---------------------------------------------------------------------------

/**
 * Parse a `page=` plugin parameter to an integer (1-based).
 * Returns `defaultPage` if the value is missing, empty, or non-numeric.
 */
export function parsePageParam(value: string | number | undefined, defaultPage = 1): number {
  if (value === undefined || value === null || value === '') return defaultPage;
  const n = parseInt(String(value), 10);
  return isNaN(n) || n < 1 ? defaultPage : n;
}

/**
 * Parse a `pageSize=` plugin parameter to an integer.
 * Returns `defaultSize` (0 = disabled / use max= behaviour) for missing/invalid values.
 */
export function parsePageSizeParam(value: string | number | undefined, defaultSize = 0): number {
  if (value === undefined || value === null || value === '') return defaultSize;
  const n = parseInt(String(value), 10);
  return isNaN(n) || n < 0 ? defaultSize : n;
}

export interface PaginationResult<T> {
  items: T[];
  totalPages: number;
  /** Clamped to 1..totalPages */
  currentPage: number;
  totalItems: number;
}

/**
 * Slice `items` to the requested page.
 * When `pageSize` is 0 (disabled), returns all items as page 1 of 1.
 */
export function applyPagination<T>(items: T[], page: number, pageSize: number): PaginationResult<T> {
  if (pageSize <= 0) {
    return { items, totalPages: 1, currentPage: 1, totalItems: items.length };
  }
  const totalItems = items.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const currentPage = Math.min(Math.max(1, page), totalPages);
  const start = (currentPage - 1) * pageSize;
  return {
    items: items.slice(start, start + pageSize),
    totalPages,
    currentPage,
    totalItems
  };
}

/**
 * Build prev/next pagination HTML for a plugin result set.
 * Returns '' when there is only one page (nothing to navigate).
 *
 * @param currentPage - The current page number (1-based)
 * @param totalPages  - Total number of pages
 * @param pageName    - Wiki page name used to build `/wiki/{pageName}?page=N`
 * @param queryParam  - Query string parameter name (default: 'page')
 */
export function formatPaginationLinks(
  currentPage: number,
  totalPages: number,
  pageName: string,
  queryParam = 'page'
): string {
  if (totalPages <= 1) return '';

  const base = `/wiki/${encodeURIComponent(pageName)}`;
  const prev = currentPage > 1
    ? `<a href="${base}?${queryParam}=${currentPage - 1}">\u00ab Prev</a>`
    : '<span class="disabled">\u00ab Prev</span>';
  const next = currentPage < totalPages
    ? `<a href="${base}?${queryParam}=${currentPage + 1}">Next \u00bb</a>`
    : '<span class="disabled">Next \u00bb</span>';

  return `<div class="plugin-pagination">${prev}&nbsp;&nbsp;Page ${currentPage} of ${totalPages}&nbsp;&nbsp;${next}</div>`;
}
