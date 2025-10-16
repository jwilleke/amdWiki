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
 *
 * Parameters:
 * - query: Search text query (default: '*' for all pages)
 * - system-category: Filter by system category
 * - user-keywords: Filter by user keywords (OR logic for multiple values)
 * - max: Maximum number of results (default: 50)
 *
 * Related: GitHub Issue #111
 */

/**
 * SearchPlugin implementation
 */
const SearchPlugin = {
  name: 'SearchPlugin',
  description: 'JSPWiki-style search plugin for embedding search results in pages',
  author: 'amdWiki',
  version: '1.0.0',

  /**
   * Execute the search plugin
   * @param {Object} context - Wiki context containing engine reference
   * @param {Object} params - Plugin parameters
   * @returns {Promise<string>} HTML output
   */
  async execute(context, params) {
    const opts = params || {};

    try {
      // Get SearchManager from engine
      const searchManager = context?.engine?.getManager?.('SearchManager');
      if (!searchManager) {
        return '<p class="error">SearchManager not available</p>';
      }

      // Parse parameters
      const query = opts.query || '*';
      const systemCategory = opts['system-category'];
      const userKeywords = opts['user-keywords'];
      const maxResults = parseInt(opts.max || '50', 10);

      console.log('[SearchPlugin] Parameters:', { query, systemCategory, userKeywords, maxResults });

      // Validate max parameter
      if (isNaN(maxResults) || maxResults < 1) {
        return '<p class="error">Invalid max parameter: must be a positive number</p>';
      }

      // Build search options
      const searchOptions = {
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

      console.log('[SearchPlugin] Search options:', JSON.stringify(searchOptions, null, 2));

      // Execute search
      let results;
      if (systemCategory || userKeywords) {
        // Use advanced search for filtering
        console.log('[SearchPlugin] Calling advancedSearch with filters');
        results = await searchManager.advancedSearch(searchOptions);
        console.log('[SearchPlugin] advancedSearch returned', results.length, 'results');
      } else {
        // Use basic search if no filters
        if (query === '*') {
          // Get all pages for wildcard search
          results = await searchManager.advancedSearch(searchOptions);
        } else {
          results = await searchManager.search(query, { maxResults });
        }
      }

      // Format results as JSPWiki-style table
      return formatResultsTable(results, {
        query,
        systemCategory,
        userKeywords,
        maxResults
      });

    } catch (error) {
      console.error('[SearchPlugin] Error:', error);
      return `<p class="error">Search failed: ${escapeHtml(error.message)}</p>`;
    }
  },

  /**
   * Plugin initialization (JSPWiki-style)
   * @param {Object} engine - Wiki engine instance
   */
  initialize(engine) {
    console.log(`Initializing ${this.name} v${this.version}`);
  }
};

/**
 * Parse multi-value parameter (supports pipe-separated OR logic)
 * Examples:
 * - 'economics' -> ['economics']
 * - 'economics|geology' -> ['economics', 'geology']
 * @param {string} value - Parameter value
 * @returns {Array<string>} Array of values
 */
function parseMultiValue(value) {
  if (!value) return [];

  // Split on pipe for OR logic
  return value.split('|')
    .map(v => v.trim())
    .filter(v => v.length > 0);
}

/**
 * Format search results as JSPWiki-style table
 * @param {Array<Object>} results - Search results
 * @param {Object} options - Search options for display
 * @returns {string} HTML table
 */
function formatResultsTable(results, options) {
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
  html += `<div class="search-summary">\n`;
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
 * Escape HTML special characters
 * @param {string} text - Text to escape
 * @returns {string} Escaped text
 */
function escapeHtml(text) {
  if (!text) return '';
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return String(text).replace(/[&<>"']/g, m => map[m]);
}

// Export plugin
module.exports = SearchPlugin;
