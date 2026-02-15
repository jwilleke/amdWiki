/**
 * ReferringPagesPlugin - JSPWiki-style plugin for amdWiki
 * Generates HTML for referring pages macro
 */

import type { SimplePlugin, PluginContext, PluginParams } from './types';

interface ReferringParams extends PluginParams {
  page?: string;
  max?: string | number;
  before?: string;
  after?: string;
  show?: string;
}

type LinkGraph = Record<string, string[]>;

/**
 * Generate the referring pages output
 * @param pageName - Current page name
 * @param params - Plugin parameters
 * @param linkGraph - Link graph data
 * @returns HTML output
 */
function generateOutput(pageName: string, params: ReferringParams, linkGraph: LinkGraph): string {
  const opts = params || {};

  // Use page parameter if provided, otherwise use pageName
  const targetPage = String(opts.page || pageName);

  // Defaults
  // Show all referring pages by default; use max parameter to limit
  const max = opts.max ? parseInt(String(opts.max), 10) : 0;
  const before = String(opts.before || '');
  const after = String(opts.after || '');

  // Find referring pages
  let referring: string[] = [];
  if (linkGraph && targetPage in linkGraph) {
    referring = linkGraph[targetPage] || [];
  }

  if (opts.show === 'count') {
    return String(referring.length);
  }

  // If no referring pages, show an informative message (JSPWiki-compatible behavior)
  if (referring.length === 0) {
    return '<p><em>No pages currently refer to this page.</em></p>';
  }

  // Limit if max is specified
  if (max > 0) {
    referring = referring.slice(0, max);
  }

  // If before/after are provided, format each link with those markers
  if (before || after) {
    // Convert escaped sequences
    let processedBefore = before.replace(/\\n/g, '\n').replace(/\\t/g, '\t');
    let processedAfter = after.replace(/\\n/g, '\n').replace(/\\t/g, '\t');

    // Check for list markers BEFORE escaping
    const isList = processedBefore.includes('*') || processedBefore.includes('-');

    // If before contains * or -, create a proper HTML list
    if (isList) {
      const linksList = referring.map((p: string) =>
        `<li><a class="wikipage" href="/wiki/${encodeURIComponent(p)}">${p}</a></li>`
      ).join('');
      return `<ul>${linksList}</ul>`;
    }

    // Otherwise, use custom before/after markers
    // Escape special markdown characters to prevent markdown processing
    processedBefore = processedBefore.replace(/\*/g, '&#42; ');
    processedAfter = processedAfter.replace(/\*/g, '&#42; ');

    // Create links with before/after markers
    const linksList = referring.map((p: string) =>
      `${processedBefore}<a class="wikipage" href="/wiki/${encodeURIComponent(p)}">${p}</a>${processedAfter}`
    ).join('');

    // Convert newlines to <br> tags for HTML rendering
    return linksList.replace(/\n/g, '<br>');
  }

  // Default: wrap in <ul><li> list
  const linksList = referring.map((p: string) =>
    `<li><a class="wikipage" href="/wiki/${encodeURIComponent(p)}">${p}</a></li>`
  ).join('');

  return `<ul>${linksList}</ul>`;
}

/**
 * ReferringPagesPlugin implementation
 */
const ReferringPagesPlugin: SimplePlugin = {
  name: 'ReferringPagesPlugin',
  description: 'Lists pages that refer to the current page',
  author: 'amdWiki',
  version: '1.0.0',

  /**
   * Execute the plugin (standard plugin interface)
   * @param context - Wiki context
   * @param params - Plugin parameters
   * @returns HTML output
   */
  execute(context: PluginContext, params: PluginParams = {}): string {
    const opts = (params || {}) as ReferringParams;
    const pageName = context?.pageName || '';
    const linkGraph = (context?.linkGraph || {}) as LinkGraph;

    return generateOutput(pageName, opts, linkGraph);
  },

  /**
   * Plugin initialization (JSPWiki-style)
   * @param _engine - Wiki engine instance
   */
  initialize(_engine: unknown): void {
    // Plugin initialized
  }
};

module.exports = ReferringPagesPlugin;
