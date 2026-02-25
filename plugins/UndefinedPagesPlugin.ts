/**
 * UndefinedPagesPlugin - JSPWiki-style plugin for amdWiki
 *
 * Lists pages that are linked to (RED-LINKs) but do not exist in the wiki.
 * Each entry is rendered as a create link (/edit/PageName) styled like a red link.
 *
 * Syntax:
 *   [{UndefinedPagesPlugin}]
 *   [{UndefinedPagesPlugin max='25'}]
 *   [{UndefinedPagesPlugin format='count'}]
 *   [{UndefinedPagesPlugin format='table'}]
 *   [{UndefinedPagesPlugin include='pattern' exclude='pattern'}]
 *
 * Parameters:
 *   max     - Maximum number of results (default: 0 = unlimited)
 *   format  - Output format: 'list' (default), 'count', 'table'
 *   before  - Text/markup before each item (list format only)
 *   after   - Text/markup after each item (list format only)
 *   include - Regex: only include pages matching this pattern
 *   exclude - Regex: exclude pages matching this pattern
 *
 * JSPWiki reference:
 *   https://jspwiki-wiki.apache.org/Wiki.jsp?page=UndefinedPagesPlugin
 */

import type { SimplePlugin, PluginContext, PluginParams } from './types';
import {
  parseMaxParam,
  applyMax,
  formatAsList,
  formatAsCount,
  formatAsTable,
  escapeHtml,
  type PageLink
} from '../src/utils/pluginFormatters';

interface UndefinedPagesParams extends PluginParams {
  max?:     string | number;
  format?:  string;
  before?:  string;
  after?:   string;
  include?: string;
  exclude?: string;
}

interface PageManager {
  getAllPages(): Promise<string[]>;
}

type LinkGraph = Record<string, string[]>;

const UndefinedPagesPlugin: SimplePlugin = {
  name: 'UndefinedPagesPlugin',
  description: 'Lists pages that are linked to (RED-LINKs) but do not exist',
  author: 'amdWiki',
  version: '1.0.0',

  async execute(context: PluginContext, params: PluginParams): Promise<string> {
    const opts = (params ?? {}) as UndefinedPagesParams;

    try {
      const pageManager = context.engine?.getManager?.('PageManager') as PageManager | undefined;
      if (!pageManager) {
        return '<p class="error">PageManager not available</p>';
      }

      // Build a lowercase set of all existing page names for fast membership test
      const allPages  = await pageManager.getAllPages();
      const pageSet   = new Set(allPages.map(p => p.toLowerCase()));

      // The link graph keys are every page title that is linked to;
      // those absent from the page set are "undefined" (red-link) pages.
      const linkGraph = (context.linkGraph ?? {}) as LinkGraph;
      let undefinedPages = Object.keys(linkGraph).filter(
        p => !pageSet.has(p.toLowerCase())
      );

      // Optional regex filters
      if (opts.include) {
        try {
          const re = new RegExp(String(opts.include));
          undefinedPages = undefinedPages.filter(p => re.test(p));
        } catch {
          return `<p class="error">Invalid include pattern: ${escapeHtml(String(opts.include))}</p>`;
        }
      }

      if (opts.exclude) {
        try {
          const re = new RegExp(String(opts.exclude));
          undefinedPages = undefinedPages.filter(p => !re.test(p));
        } catch {
          return `<p class="error">Invalid exclude pattern: ${escapeHtml(String(opts.exclude))}</p>`;
        }
      }

      // Always sort alphabetically
      undefinedPages.sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()));

      const format = String(opts.format ?? 'list').toLowerCase();

      // count: return total before applying max (matches JSPWiki behaviour)
      if (format === 'count') {
        return formatAsCount(undefinedPages.length);
      }

      // Apply max limit for list/table formats
      const max     = parseMaxParam(opts.max);
      const limited = applyMax(undefinedPages, max);

      if (limited.length === 0) {
        return '<p><em>No undefined pages found.</em></p>';
      }

      // Build red-link style PageLink objects
      const links: PageLink[] = limited.map(page => ({
        href:     `/edit/${encodeURIComponent(page)}`,
        text:     page,
        cssClass: 'redlink',
        style:    'color: red;',
        title:    `Create page: ${page}`
      }));

      if (format === 'table') {
        const rows = links.map(link => {
          const referrerCount = (linkGraph[link.text] ?? []).length;
          const anchor = `<a class="${link.cssClass}" href="${link.href}" style="${link.style ?? ''}" title="${escapeHtml(link.title ?? '')}">${escapeHtml(link.text)}</a>`;
          return [anchor, String(referrerCount)];
        });
        return formatAsTable(['Undefined Page', 'Referenced By'], rows);
      }

      // Default: list format
      return formatAsList(links, {
        before: opts.before ? String(opts.before) : '',
        after:  opts.after  ? String(opts.after)  : ''
      });

    } catch (error) {
      const err = error as Error;
      return `<p class="error">UndefinedPagesPlugin error: ${escapeHtml(err.message)}</p>`;
    }
  },

  initialize(_engine: unknown): void {
    // No initialisation required
  }
};

module.exports = UndefinedPagesPlugin;
