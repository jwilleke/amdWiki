/**
 * FootnotesPlugin — collects footnote definitions ([^id]: text) from the
 * current page's raw markdown and renders them as a reference list.
 *
 * Syntax:
 *   [{FootnotesPlugin}]
 *   [{FootnotesPlugin noheader='true'}]
 *
 * Parameters:
 *   noheader — suppress the "Footnotes" heading (default: false)
 *
 * Footnote format recognised in raw markdown:
 *   [^1]: Some text or https://example.com
 *   [^my-note]: Multi-word identifier with optional URL
 */

import type { SimplePlugin, PluginContext, PluginParams } from './types';
import { parseBoolParam, escapeHtml } from '../utils/pluginFormatters';

interface PageManagerLike {
  getPage(name: string): Promise<{ content?: string; rawContent?: string } | null>;
}

/** Regex matching single-line footnote definitions: [^id]: text */
const FOOTNOTE_DEF_RE = /^\[\^([\d\w-]+)\]:\s*(.+)$/mg;

/** Auto-link bare https?:// URLs — mirrors showdown-footnotes-fixed behaviour */
function autoLink(text: string): string {
  return escapeHtml(text).replace(
    /(https?:\/\/[^\s<&]+)/g,
    '<a href="$1" target="_blank" rel="noopener noreferrer">$1</a>'
  );
}

const FootnotesPlugin: SimplePlugin = {
  name: 'FootnotesPlugin',
  description: 'Lists footnote definitions ([^id]: text) from the current page as a reference list',
  author: 'ngdpbase',
  version: '1.0.0',

  async execute(context: PluginContext, params: PluginParams): Promise<string> {
    const pageName = context.pageName;
    if (!pageName) return '';

    const pageManager = context.engine?.getManager('PageManager') as PageManagerLike | undefined;
    if (!pageManager) return '';

    const page = await pageManager.getPage(pageName);
    if (!page) return '';

    const raw = String(page.rawContent ?? page.content ?? '');

    const footnotes: Array<{ id: string; text: string }> = [];
    FOOTNOTE_DEF_RE.lastIndex = 0;
    let m: RegExpExecArray | null;
    while ((m = FOOTNOTE_DEF_RE.exec(raw)) !== null) {
      footnotes.push({ id: m[1], text: m[2].trim() });
    }

    const noheader = parseBoolParam(params?.['noheader'], false);

    const parts: string[] = ['<section class="page-footnotes">'];
    if (!noheader) parts.push('<h2>Footnotes</h2>');

    if (footnotes.length === 0) {
      parts.push('<p class="no-footnotes"><em>No footnotes on this page.</em></p>');
    } else {
      parts.push('<ol class="footnote-list">');
      for (const fn of footnotes) {
        parts.push(
          `<li id="footnote-${escapeHtml(fn.id)}" class="footnote-item">` +
          `<sup><a href="#footnote-ref-${escapeHtml(fn.id)}">[${escapeHtml(fn.id)}]</a></sup> ` +
          autoLink(fn.text) +
          '</li>'
        );
      }
      parts.push('</ol>');
    }

    parts.push('</section>');
    return parts.join('\n');
  }
};

export default FootnotesPlugin;
