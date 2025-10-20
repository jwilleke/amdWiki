/**
 * RecentChangesPlugin - JSPWiki-style plugin for amdWiki
 * Displays recent page changes in order
 *
 * Based on JSPWiki's RecentChangesPlugin:
 * https://github.com/apache/jspwiki/blob/master/jspwiki-main/src/main/java/org/apache/wiki/plugin/RecentChangesPlugin.java
 * https://jspwiki-wiki.apache.org/Wiki.jsp?page=RecentChangesPlugin
 *
 * Usage:
 *   [{RecentChangesPlugin}]                                - Shows all recent changes (default: 7 days, compact format)
 *   [{RecentChangesPlugin since='2'}]                      - Show changes from the last 2 days (compact format)
 *   [{RecentChangesPlugin since='7' format='full'}]        - Show changes from the last 7 days (full format)
 *   [{RecentChangesPlugin format='compact'}]               - Show changes (compact format)
 */

const fs = require('fs-extra');
const path = require('path');

/**
 * RecentChangesPlugin implementation
 */
const RecentChangesPlugin = {
  name: 'RecentChangesPlugin',
  description: 'Displays recent page changes in chronological order',
  author: 'amdWiki',
  version: '1.0.0',

  /**
   * Execute the plugin
   * @param {Object} context - Wiki context containing engine reference
   * @param {Object} params - Plugin parameters
   * @returns {Promise<string>} HTML output
   */
  async execute(context, params) {
    const opts = params || {};

    try {
      // Get PageManager from engine
      const pageManager = context?.engine?.getManager?.('PageManager');
      if (!pageManager) {
        return '<p class="error">PageManager not available</p>';
      }

      // Parse parameters
      const since = parseInt(opts.since || '7', 10); // Default: 7 days
      const format = (opts.format || 'compact').toLowerCase(); // Default: compact

      if (isNaN(since) || since < 0) {
        return '<p class="error">Invalid "since" parameter: must be a positive number</p>';
      }

      if (format !== 'full' && format !== 'compact') {
        return '<p class="error">Invalid "format" parameter: must be "full" or "compact"</p>';
      }

      // Get all pages
      const allPageNames = await pageManager.getAllPages();
      if (!allPageNames || allPageNames.length === 0) {
        return '<p class="text-muted">No pages found.</p>';
      }

      // Calculate the cutoff date
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - since);
      cutoffDate.setHours(0, 0, 0, 0); // Start of day

      // Collect page information with modification times
      const pagesWithDates = [];

      for (const pageName of allPageNames) {
        try {
          const page = await pageManager.getPage(pageName);
          if (!page || !page.filePath) {
            continue;
          }

          // Get file stats to retrieve modification time
          const stats = await fs.stat(page.filePath);
          const mtime = stats.mtime;

          // Filter by cutoff date
          if (mtime >= cutoffDate) {
            pagesWithDates.push({
              title: page.title,
              uuid: page.uuid,
              mtime: mtime,
              metadata: page.metadata || {},
              filePath: page.filePath
            });
          }
        } catch (error) {
          // Skip pages that can't be read
          console.error(`[RecentChangesPlugin] Error reading page ${pageName}:`, error.message);
        }
      }

      // Sort by modification time (newest first)
      pagesWithDates.sort((a, b) => b.mtime - a.mtime);

      if (pagesWithDates.length === 0) {
        return `<p class="text-muted">No changes in the last ${since} day${since !== 1 ? 's' : ''}.</p>`;
      }

      // Generate HTML output based on format
      if (format === 'full') {
        return this.generateFullFormat(pagesWithDates, since);
      } else {
        return this.generateCompactFormat(pagesWithDates, since);
      }

    } catch (error) {
      console.error('[RecentChangesPlugin] Error:', error);
      return `<p class="error">Error displaying recent changes: ${escapeHtml(error.message)}</p>`;
    }
  },

  /**
   * Generate full format output
   * @param {Array} pages - Array of page objects with dates
   * @param {number} since - Number of days
   * @returns {string} HTML output
   */
  generateFullFormat(pages, since) {
    let html = '<div class="recent-changes-plugin recent-changes-full">\n';
    html += `<h4>Recent Changes (Last ${since} day${since !== 1 ? 's' : ''})</h4>\n`;
    html += '<div class="table-responsive">\n';
    html += '<table class="table table-hover">\n';
    html += '  <thead>\n';
    html += '    <tr>\n';
    html += '      <th style="width: 40%;">Page</th>\n';
    html += '      <th style="width: 25%;">Last Modified</th>\n';
    html += '      <th style="width: 20%;">Author</th>\n';
    html += '      <th style="width: 15%;">Version</th>\n';
    html += '    </tr>\n';
    html += '  </thead>\n';
    html += '  <tbody>\n';

    for (const page of pages) {
      const author = page.metadata.author || 'Unknown';
      const version = page.metadata.version || '1';
      const formattedDate = this.formatDate(page.mtime);

      html += '    <tr>\n';
      html += `      <td><a class="wikipage" href="/wiki/${encodeURIComponent(page.title)}">${escapeHtml(page.title)}</a></td>\n`;
      html += `      <td><span class="text-muted">${formattedDate}</span></td>\n`;
      html += `      <td><small>${escapeHtml(author)}</small></td>\n`;
      html += `      <td><span class="badge bg-secondary">${escapeHtml(version)}</span></td>\n`;
      html += '    </tr>\n';
    }

    html += '  </tbody>\n';
    html += '</table>\n';
    html += '</div>\n';
    html += `<p class="text-muted text-center mt-2"><small>Total: ${pages.length} page${pages.length !== 1 ? 's' : ''} changed</small></p>\n`;
    html += '</div>\n';

    return html;
  },

  /**
   * Generate compact format output
   * @param {Array} pages - Array of page objects with dates
   * @param {number} since - Number of days
   * @returns {string} HTML output
   */
  generateCompactFormat(pages, since) {
    let html = '<div class="recent-changes-plugin recent-changes-compact">\n';
    html += `<h5>Recent Changes (Last ${since} day${since !== 1 ? 's' : ''})</h5>\n`;
    html += '<ul class="list-unstyled">\n';

    for (const page of pages) {
      const formattedDate = this.formatDateCompact(page.mtime);

      html += '  <li class="mb-1">\n';
      html += `    <a class="wikipage" href="/wiki/${encodeURIComponent(page.title)}">${escapeHtml(page.title)}</a> `;
      html += `<small class="text-muted">(${formattedDate})</small>\n`;
      html += '  </li>\n';
    }

    html += '</ul>\n';
    html += `<p class="text-muted text-end"><small>${pages.length} change${pages.length !== 1 ? 's' : ''}</small></p>\n`;
    html += '</div>\n';

    return html;
  },

  /**
   * Format date for full format (e.g., "Jan 15, 2025 3:45 PM")
   * @param {Date} date - Date to format
   * @returns {string} Formatted date string
   */
  formatDate(date) {
    const options = {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    };
    return date.toLocaleString('en-US', options);
  },

  /**
   * Format date for compact format (e.g., "2 hours ago", "3 days ago")
   * @param {Date} date - Date to format
   * @returns {string} Formatted date string
   */
  formatDateCompact(date) {
    const now = new Date();
    const diffMs = now - date;
    const diffSeconds = Math.floor(diffMs / 1000);
    const diffMinutes = Math.floor(diffSeconds / 60);
    const diffHours = Math.floor(diffMinutes / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffSeconds < 60) {
      return 'just now';
    } else if (diffMinutes < 60) {
      return `${diffMinutes} minute${diffMinutes !== 1 ? 's' : ''} ago`;
    } else if (diffHours < 24) {
      return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
    } else if (diffDays < 7) {
      return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
    } else {
      // For older dates, show the actual date
      const options = { month: 'short', day: 'numeric', year: 'numeric' };
      return date.toLocaleDateString('en-US', options);
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
 * Escape HTML special characters
 * @param {string} text - Text to escape
 * @returns {string} Escaped text
 */
function escapeHtml(text) {
  if (text === null || text === undefined) return '';
  const str = String(text);
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return str.replace(/[&<>"']/g, m => map[m]);
}

// Export plugin
module.exports = RecentChangesPlugin;
