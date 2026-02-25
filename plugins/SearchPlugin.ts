/**
 * SearchPlugin - JSPWiki-style search plugin for amdWiki
 * Embeds search results directly in wiki pages
 *
 * Based on JSPWiki's SearchPlugin:
 * https://jspwiki-wiki.apache.org/Wiki.jsp?page=SearchPlugin
 *
 * Usage examples:
 * [{Search query='plugin' max=10}]
 * [{Search system-category='documentation'}]
 * [{Search user-keywords='economics'}]
 * [{Search query='manager' system-category='system' max=5}]
 * [{Search system-category='system' format='count'}]
 * [{Search system-category='documentation' format='titles'}]
 * [{Search user-keywords='test' format='list'}]
 *
 * Parameters:
 * - query: Search text query (default: '*' for all pages)
 * - system-category: Filter by system category
 * - user-keywords: Filter by user keywords (OR logic for multiple values)
 * - max: Maximum number of results (default: 50)
 * - format: Output format (default: 'table')
 *   - 'table': Full table with page names and scores (default)
 *   - 'count': Just the count of matching pages (e.g., "13")
 *   - 'titles': Bullet list of page titles with links
 *   - 'list': Simple list of page names (no links)
 *
 * Related: GitHub Issue #111
 */

import type { SimplePlugin, PluginContext, PluginParams } from './types';
import { escapeHtml } from '../src/utils/pluginFormatters';

interface SearchParams extends PluginParams {
  query?: string;
  'system-category'?: string;
  'user-keywords'?: string;
  max?: string | number;
  format?: string;
}

interface SearchResult {
  name?: string;
  title?: string;
  score?: number;
  metadata?: {
    systemCategory?: string;
    [key: string]: unknown;
  };
}

interface SearchOptions {
  query: string;
  maxResults: number;
  categories?: string[];
  userKeywords?: string[];
}

interface SearchManager {
  search(query: string, options: { maxResults: number }): Promise<SearchResult[]>;
  advancedSearch(options: SearchOptions): Promise<SearchResult[]>;
}

interface FormatOptions {
  query: string;
  systemCategory?: string;
  userKeywords?: string;
  maxResults: number;
  format: string;
}

/**
 * Parse multi-value parameter (supports pipe-separated OR logic)
 * Examples:
 * - 'economics' -> ['economics']
 * - 'economics|geology' -> ['economics', 'geology']
 * @param value - Parameter value
 * @returns Array of values
 */
function parseMultiValue(value: string | undefined): string[] {
  if (!value) return [];

  // Split on pipe for OR logic
  return value.split('|')
    .map(v => v.trim())
    .filter(v => v.length > 0);
}

/**
 * Format search results as a simple count
 * @param results - Search results
 * @returns Count as text
 */
function formatCount(results: SearchResult[]): string {
  const count = results ? results.length : 0;
  return `<span class="search-count">${count}</span>`;
}

/**
 * Format search results as a bullet list of titles with links
 * @param results - Search results
 * @param options - Search options for display
 * @returns HTML bullet list
 */
function formatTitles(results: SearchResult[], options: FormatOptions): string {
  if (!results || results.length === 0) {
    return `<div class="search-plugin">
  <p class="info">No results found${options.query !== '*' ? ` for query: "${escapeHtml(options.query)}"` : ''}</p>
</div>`;
  }

  let html = '<div class="search-plugin search-titles">\n';
  html += '<ul>\n';

  for (const result of results) {
    const pageName = result.name || result.title || 'Unknown';
    const title = result.title || result.name || 'Unknown';

    html += `  <li><a class="wikipage" href="/wiki/${encodeURIComponent(pageName)}">${escapeHtml(title)}</a>`;

    // Add metadata badges if available
    if (result.metadata && result.metadata.systemCategory) {
      html += ` <span class="badge badge-secondary">${escapeHtml(result.metadata.systemCategory)}</span>`;
    }

    html += '</li>\n';
  }

  html += '</ul>\n';
  html += '</div>\n';

  return html;
}

/**
 * Format search results as a simple list of page names (no links)
 * @param results - Search results
 * @param options - Search options for display
 * @returns HTML list
 */
function formatList(results: SearchResult[], options: FormatOptions): string {
  if (!results || results.length === 0) {
    return `<div class="search-plugin">
  <p class="info">No results found${options.query !== '*' ? ` for query: "${escapeHtml(options.query)}"` : ''}</p>
</div>`;
  }

  let html = '<div class="search-plugin search-list">\n';
  html += '<ul>\n';

  for (const result of results) {
    const title = result.title || result.name || 'Unknown';
    html += `  <li>${escapeHtml(title)}</li>\n`;
  }

  html += '</ul>\n';
  html += '</div>\n';

  return html;
}

/**
 * Format search results as JSPWiki-style table
 * @param results - Search results
 * @param options - Search options for display
 * @returns HTML table
 */
function formatResultsTable(results: SearchResult[], options: FormatOptions): string {
  if (!results || results.length === 0) {
    return `<div class="search-plugin">
  <p class="info">No results found${options.query !== '*' ? ` for query: "${escapeHtml(options.query)}"` : ''}</p>
</div>`;
  }

  // Build filter description
  let filterDesc = '';
  if (options.systemCategory) {
    filterDesc += ` in category: ${escapeHtml(options.systemCategory)}`;
  }
  if (options.userKeywords) {
    filterDesc += ` with keywords: ${escapeHtml(options.userKeywords)}`;
  }

  // Start building HTML table (JSPWiki style: 2 columns - page name and score)
  let html = '<div class="search-plugin">\n';

  // Add search summary
  html += '<div class="search-summary">\n';
  html += `  <p>Found <strong>${results.length}</strong> result${results.length !== 1 ? 's' : ''}`;
  if (options.query && options.query !== '*') {
    html += ` for <strong>"${escapeHtml(options.query)}"</strong>`;
  }
  if (filterDesc) {
    html += filterDesc;
  }
  html += '</p>\n';
  html += '</div>\n\n';

  // Build results table
  html += '<table class="search-results" border="1">\n';
  html += '  <thead>\n';
  html += '    <tr>\n';
  html += '      <th>Page</th>\n';
  html += '      <th>Score</th>\n';
  html += '    </tr>\n';
  html += '  </thead>\n';
  html += '  <tbody>\n';

  // Add each result row
  for (const result of results) {
    const pageName = result.name || result.title || 'Unknown';
    const title = result.title || result.name || 'Unknown';
    const score = result.score ? result.score.toFixed(3) : '1.000';

    html += '    <tr>\n';
    html += `      <td><a class="wikipage" href="/wiki/${encodeURIComponent(pageName)}">${escapeHtml(title)}</a>`;

    // Add metadata badges if available
    if (result.metadata) {
      if (result.metadata.systemCategory) {
        html += ` <span class="badge badge-secondary">${escapeHtml(result.metadata.systemCategory)}</span>`;
      }
    }

    html += '</td>\n';
    html += `      <td class="text-right">${score}</td>\n`;
    html += '    </tr>\n';
  }

  html += '  </tbody>\n';
  html += '</table>\n';
  html += '</div>\n';

  return html;
}

/**
 * Format search results based on format type
 * @param results - Search results
 * @param options - Search options for display
 * @returns Formatted output
 */
function formatResults(results: SearchResult[], options: FormatOptions): string {
  switch (options.format) {
  case 'count':
    return formatCount(results);
  case 'titles':
    return formatTitles(results, options);
  case 'list':
    return formatList(results, options);
  case 'table':
  default:
    return formatResultsTable(results, options);
  }
}

/**
 * SearchPlugin implementation
 */
const SearchPlugin: SimplePlugin = {
  name: 'SearchPlugin',
  description: 'JSPWiki-style search plugin for embedding search results in pages',
  author: 'amdWiki',
  version: '2.0.0',

  /**
   * Execute the search plugin
   * @param context - Wiki context containing engine reference
   * @param params - Plugin parameters
   * @returns HTML output
   */
  async execute(context: PluginContext, params: PluginParams): Promise<string> {
    const opts = (params || {}) as SearchParams;

    try {
      // Get SearchManager from engine
      const searchManager = context?.engine?.getManager?.('SearchManager') as SearchManager | undefined;
      if (!searchManager) {
        return '<p class="error">SearchManager not available</p>';
      }

      // Parse parameters
      const query = String(opts.query || '*');
      const systemCategory = opts['system-category'];
      const userKeywords = opts['user-keywords'];
      const maxResults = parseInt(String(opts.max || '50'), 10);
      const format = String(opts.format || 'table').toLowerCase();

      // Validate max parameter
      if (isNaN(maxResults) || maxResults < 1) {
        return '<p class="error">Invalid max parameter: must be a positive number</p>';
      }

      // Validate format parameter
      const validFormats = ['table', 'count', 'titles', 'list'];
      if (!validFormats.includes(format)) {
        return `<p class="error">Invalid format parameter: must be one of ${validFormats.join(', ')}</p>`;
      }

      // Build search options
      const searchOptions: SearchOptions = {
        query: query === '*' ? '' : query,  // Empty query for wildcard
        maxResults: maxResults
      };

      // Add category filter if specified
      if (systemCategory) {
        searchOptions.categories = parseMultiValue(systemCategory);
      }

      // Add keyword filter if specified
      if (userKeywords) {
        searchOptions.userKeywords = parseMultiValue(userKeywords);
      }

      // Execute search
      let results: SearchResult[];
      if (systemCategory || userKeywords) {
        // Use advanced search for filtering
        results = await searchManager.advancedSearch(searchOptions);
      } else {
        // Use basic search if no filters
        if (query === '*') {
          // Get all pages for wildcard search
          results = await searchManager.advancedSearch(searchOptions);
        } else {
          results = await searchManager.search(query, { maxResults });
        }
      }

      // Format results based on format parameter
      return formatResults(results, {
        query,
        systemCategory,
        userKeywords,
        maxResults,
        format
      });

    } catch (error) {
      const err = error as Error;
      return `<p class="error">Search failed: ${escapeHtml(err.message)}</p>`;
    }
  },

  /**
   * Plugin initialization (JSPWiki-style)
   * @param _engine - Wiki engine instance
   */
  initialize(_engine: unknown): void {
    // Plugin initialized
  }
};

module.exports = SearchPlugin;
