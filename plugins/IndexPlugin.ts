/**
 * IndexPlugin - JSPWiki-style plugin for amdWiki
 * Generates an alphabetical index of all wiki pages
 *
 * Based on JSPWiki's IndexPlugin:
 * https://github.com/apache/jspwiki/blob/master/jspwiki-main/src/main/java/org/apache/wiki/plugin/IndexPlugin.java
 */

import type { SimplePlugin, PluginContext, PluginParams } from './types';
import { escapeHtml } from '../src/utils/pluginFormatters';

interface PageManager {
  getAllPages(): Promise<string[]>;
}

interface IndexParams extends PluginParams {
  include?: string;
  exclude?: string;
}

const IndexPlugin: SimplePlugin = {
  name: 'IndexPlugin',
  description: 'Generates an alphabetical index of all wiki pages',
  author: 'amdWiki',
  version: '1.0.0',

  /**
   * Execute the plugin
   * @param context - Wiki context containing engine reference
   * @param params - Plugin parameters
   * @returns HTML output
   */
  async execute(context: PluginContext, params: PluginParams): Promise<string> {
    const opts = (params || {}) as IndexParams;

    try {
      // Get PageManager from engine
      const pageManager = context?.engine?.getManager?.('PageManager') as PageManager | undefined;
      if (!pageManager) {
        return '<p class="error">PageManager not available</p>';
      }

      // Get all page names
      const allPageNames = await pageManager.getAllPages();

      // Filter pages based on include/exclude patterns
      let filteredPages = allPageNames;

      // Apply include filter (regex)
      if (opts.include) {
        try {
          const includeRegex = new RegExp(String(opts.include));
          filteredPages = filteredPages.filter(name => includeRegex.test(name));
        } catch {
          return `<p class="error">Invalid include pattern: ${opts.include}</p>`;
        }
      }

      // Apply exclude filter (regex)
      if (opts.exclude) {
        try {
          const excludeRegex = new RegExp(String(opts.exclude));
          filteredPages = filteredPages.filter(name => !excludeRegex.test(name));
        } catch {
          return `<p class="error">Invalid exclude pattern: ${opts.exclude}</p>`;
        }
      }

      // Sort pages alphabetically (case-insensitive)
      filteredPages.sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()));

      // Group pages by first letter
      const groupedPages: Record<string, string[]> = {};
      for (const page of filteredPages) {
        const firstLetter = page.charAt(0).toUpperCase();
        const key = /[A-Z]/.test(firstLetter) ? firstLetter : '#'; // Use '#' for non-letters

        if (!groupedPages[key]) {
          groupedPages[key] = [];
        }
        groupedPages[key].push(page);
      }

      // Generate HTML output
      let html = '<div class="index-plugin">\n';

      // Add jump links to sections
      const sections = Object.keys(groupedPages).sort();
      if (sections.length > 1) {
        html += '<div class="index-sections">\n';
        html += '<strong>Jump to:</strong> ';
        html += sections.map(letter =>
          `<a href="#index-${letter}">${letter}</a>`
        ).join(' | ');
        html += '\n</div>\n\n';
      }

      // Generate index content grouped by letter
      for (const letter of sections) {
        html += `<div class="index-section" id="index-${letter}">\n`;
        html += `<h3>${letter}</h3>\n`;
        html += '<ul>\n';

        for (const page of groupedPages[letter]) {
          html += `  <li><a class="wikipage" href="/wiki/${encodeURIComponent(page)}">${escapeHtml(page)}</a></li>\n`;
        }

        html += '</ul>\n';
        html += '</div>\n\n';
      }

      html += '</div>';

      return html;

    } catch (error) {
      const err = error as Error;
      return `<p class="error">Error generating index: ${err.message}</p>`;
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

module.exports = IndexPlugin;
