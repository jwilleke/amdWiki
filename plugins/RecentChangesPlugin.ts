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

import fs from 'fs-extra';
import path from 'path';
import type { SimplePlugin, PluginContext, PluginParams } from './types';

interface RecentChangesParams extends PluginParams {
  since?: string | number;
  format?: string;
}

interface PageMetadata {
  editor?: string;
  author?: string;
  [key: string]: unknown;
}

interface Page {
  title: string;
  uuid: string;
  filePath?: string;
  metadata: PageMetadata;
}

interface PageWithDate {
  title: string;
  uuid: string;
  mtime: Date;
  metadata: PageMetadata;
  filePath: string;
  currentVersion: number;
  hasVersions: boolean;
  editor: string;
}

interface PageIndexEntry {
  currentVersion?: number;
  hasVersions?: boolean;
  editor?: string;
}

interface PageIndex {
  pages?: Record<string, PageIndexEntry>;
}

interface PageManager {
  getAllPages(): Promise<string[]>;
  getPage(name: string): Promise<Page | null>;
}

/**
 * Escape HTML special characters
 * @param text - Text to escape
 * @returns Escaped text
 */
function escapeHtml(text: unknown): string {
  if (text === null || text === undefined) return '';
  if (typeof text !== 'string' && typeof text !== 'number') {
    return '[Object]';
  }
  const str = String(text);
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    '\'': '&#039;'
  };
  return str.replace(/[&<>"']/g, m => map[m] || m);
}

/**
 * Load page-index.json for version information
 * @param indexPath - Path to page-index.json (optional, uses default if not provided)
 * @returns Page index data or null if not available
 */
async function loadPageIndex(indexPath?: string): Promise<PageIndex | null> {
  try {
    const pageIndexPath = indexPath || path.join(process.cwd(), 'data', 'page-index.json');
    if (await fs.pathExists(pageIndexPath)) {
      const data = await fs.readFile(pageIndexPath, 'utf8');
      return JSON.parse(data) as PageIndex;
    }
  } catch {
    // Silently ignore errors loading page index
  }
  return null;
}

/**
 * Format date for full format (e.g., "Jan 15, 2025 3:45 PM")
 * @param date - Date to format
 * @returns Formatted date string
 */
function formatDate(date: Date): string {
  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  };
  return date.toLocaleString('en-US', options);
}

/**
 * Format date for compact format (e.g., "2 hours ago", "3 days ago")
 * @param date - Date to format
 * @returns Formatted date string
 */
function formatDateCompact(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
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
    const options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric', year: 'numeric' };
    return date.toLocaleDateString('en-US', options);
  }
}

/**
 * Generate full format output
 * @param pages - Array of page objects with dates
 * @param since - Number of days
 * @returns HTML output
 */
function generateFullFormat(pages: PageWithDate[], since: number): string {
  let html = '<div class="recent-changes-plugin recent-changes-full">\n';
  html += `<h4>Recent Changes (Last ${since} day${since !== 1 ? 's' : ''})</h4>\n`;
  html += '<div class="table-responsive">\n';
  html += '<table class="table table-hover">\n';
  html += '  <thead>\n';
  html += '    <tr>\n';
  html += '      <th style="width: 40%;">Page</th>\n';
  html += '      <th style="width: 25%;">Last Modified</th>\n';
  html += '      <th style="width: 20%;">Editor</th>\n';
  html += '      <th style="width: 15%;">Version</th>\n';
  html += '    </tr>\n';
  html += '  </thead>\n';
  html += '  <tbody>\n';

  for (const page of pages) {
    const editor = page.editor || 'Unknown';
    const version = page.currentVersion || 1;
    const formattedDateStr = formatDate(page.mtime);

    html += '    <tr>\n';
    html += `      <td><a class="wikipage" href="/wiki/${encodeURIComponent(page.title)}">${escapeHtml(page.title)}</a></td>\n`;
    html += `      <td><span class="text-muted">${formattedDateStr}</span></td>\n`;
    html += `      <td><small>${escapeHtml(editor)}</small></td>\n`;
    html += `      <td><span class="badge bg-secondary">v${escapeHtml(String(version))}</span></td>\n`;
    html += '    </tr>\n';
  }

  html += '  </tbody>\n';
  html += '</table>\n';
  html += '</div>\n';
  html += `<p class="text-muted text-center mt-2"><small>Total: ${pages.length} page${pages.length !== 1 ? 's' : ''} changed</small></p>\n`;
  html += '</div>\n';

  return html;
}

/**
 * Generate compact format output
 * @param pages - Array of page objects with dates
 * @param since - Number of days
 * @returns HTML output
 */
function generateCompactFormat(pages: PageWithDate[], since: number): string {
  let html = '<div class="recent-changes-plugin recent-changes-compact">\n';
  html += `<h5>Recent Changes (Last ${since} day${since !== 1 ? 's' : ''})</h5>\n`;
  html += '<ul class="list-unstyled">\n';

  for (const page of pages) {
    const formattedDateStr = formatDateCompact(page.mtime);

    html += '  <li class="mb-1">\n';
    html += `    <a class="wikipage" href="/wiki/${encodeURIComponent(page.title)}">${escapeHtml(page.title)}</a> `;
    html += `<small class="text-muted">(${formattedDateStr})</small>\n`;
    html += '  </li>\n';
  }

  html += '</ul>\n';
  html += `<p class="text-muted text-end"><small>${pages.length} change${pages.length !== 1 ? 's' : ''}</small></p>\n`;
  html += '</div>\n';

  return html;
}

/**
 * RecentChangesPlugin implementation
 */
const RecentChangesPlugin: SimplePlugin = {
  name: 'RecentChangesPlugin',
  description: 'Displays recent page changes in chronological order',
  author: 'amdWiki',
  version: '1.0.0',

  /**
   * Execute the plugin
   * @param context - Wiki context containing engine reference
   * @param params - Plugin parameters
   * @returns HTML output
   */
  async execute(context: PluginContext, params: PluginParams): Promise<string> {
    const opts = (params || {}) as RecentChangesParams;

    try {
      // Get PageManager from engine
      const pageManager = context?.engine?.getManager?.('PageManager') as PageManager | undefined;
      if (!pageManager) {
        return '<p class="error">PageManager not available</p>';
      }

      // Parse parameters
      const since = parseInt(String(opts.since || '7'), 10); // Default: 7 days
      const format = String(opts.format || 'compact').toLowerCase(); // Default: compact

      if (isNaN(since) || since < 0) {
        return '<p class="error">Invalid "since" parameter: must be a positive number</p>';
      }

      if (format !== 'full' && format !== 'compact') {
        return '<p class="error">Invalid "format" parameter: must be "full" or "compact"</p>';
      }

      // Get page index path from config
      const configManager = context?.engine?.getManager?.('ConfigurationManager') as { getResolvedDataPath?: (key: string, fallback: string) => string } | undefined;
      const pageIndexPath = configManager?.getResolvedDataPath?.('amdwiki.page.provider.versioning.indexfile', './data/page-index.json');

      // Load page-index.json for version information
      const pageIndex = await loadPageIndex(pageIndexPath);

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
      const pagesWithDates: PageWithDate[] = [];

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
            // Get version info from page-index.json
            const indexEntry = pageIndex?.pages?.[page.uuid];
            const currentVersion = indexEntry?.currentVersion || 1;
            const hasVersions = indexEntry?.hasVersions || false;
            const editor = indexEntry?.editor || page.metadata.editor || page.metadata.author || 'Unknown';

            pagesWithDates.push({
              title: page.title,
              uuid: page.uuid,
              mtime: mtime,
              metadata: page.metadata || {},
              filePath: page.filePath,
              currentVersion: currentVersion,
              hasVersions: hasVersions,
              editor: editor
            });
          }
        } catch {
          // Skip pages that can't be read
        }
      }

      // Sort by modification time (newest first)
      pagesWithDates.sort((a, b) => b.mtime.getTime() - a.mtime.getTime());

      if (pagesWithDates.length === 0) {
        return `<p class="text-muted">No changes in the last ${since} day${since !== 1 ? 's' : ''}.</p>`;
      }

      // Generate HTML output based on format
      if (format === 'full') {
        return generateFullFormat(pagesWithDates, since);
      } else {
        return generateCompactFormat(pagesWithDates, since);
      }

    } catch (error) {
      const err = error as Error;
      return `<p class="error">Error displaying recent changes: ${escapeHtml(err.message)}</p>`;
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

module.exports = RecentChangesPlugin;
