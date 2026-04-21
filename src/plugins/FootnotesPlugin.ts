/**
 * FootnotesPlugin — collects footnote definitions from the current page's
 * raw markdown and renders them as a reference list.
 *
 * Recognises two formats:
 *   Markdown:  [^id]: Some text or https://example.com
 *   JSPWiki:   * [#1] - [Link text|URL|target='_blank'] - context note
 *
 * Syntax:
 *   [{FootnotesPlugin}]
 *   [{FootnotesPlugin noheader='true'}]
 *
 * Parameters:
 *   noheader — suppress the "Footnotes" heading (default: false)
 */

import type { SimplePlugin, PluginContext, PluginParams } from './types';
import { parseBoolParam, escapeHtml } from '../utils/pluginFormatters';

interface PageManagerLike {
  getPage(name: string): Promise<{ content?: string; rawContent?: string } | null>;
}

/** [^id]: text — standard markdown footnote definition */
const MD_FOOTNOTE_RE = /^\[\^([\d\w-]+)\]:\s*(.+)$/mg;

/** * [#N] - content — JSPWiki-style footnote bullet */
const JSPWIKI_FOOTNOTE_RE = /^\* \[#(\d+)\] - (.+)$/mg;

/** Auto-link bare https?:// URLs */
function autoLink(text: string): string {
  return escapeHtml(text).replace(
    /(https?:\/\/[^\s<&]+)/g,
    '<a href="$1" target="_blank" rel="noopener noreferrer">$1</a>'
  );
}

/**
 * Convert JSPWiki link syntax [Display|URL|target='_blank'] to an HTML anchor.
 * Falls back to plain escaped text if the pattern doesn't match.
 */
function renderJspwikiLink(raw: string): string {
  // [Display Text|URL|target='_blank'] or [Display Text|URL]
  const linkRe = /\[([^|]+)\|([^|\]]+)(?:\|[^\]]+)?\]/g;
  return raw.replace(
    linkRe,
    (_m: string, display: string, url: string) =>
      `<a href="${escapeHtml(url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(display)}</a>`
  );
}

const FootnotesPlugin: SimplePlugin = {
  name: 'FootnotesPlugin',
  description: 'Lists footnote definitions from the current page as a reference list',
  author: 'ngdpbase',
  version: '1.0.0',

  async execute(context: PluginContext, params: PluginParams): Promise<string> {
    const pageName = context.pageName;
    if (!pageName) return '';

    const pageManager = context.engine?.getManager('PageManager') as PageManagerLike | undefined;
    if (!pageManager) return '';

    const page = await pageManager.getPage(pageName);
    if (!page) return '';

    // Normalise CRLF so regexes work uniformly
    const raw = String(page.rawContent ?? page.content ?? '').replace(/\r\n/g, '\n');

    const footnotes: Array<{ id: string; html: string }> = [];

    // Markdown [^id]: text
    MD_FOOTNOTE_RE.lastIndex = 0;
    let m: RegExpExecArray | null;
    while ((m = MD_FOOTNOTE_RE.exec(raw)) !== null) {
      footnotes.push({ id: m[1], html: autoLink(m[2].trim()) });
    }

    // JSPWiki * [#N] - content
    JSPWIKI_FOOTNOTE_RE.lastIndex = 0;
    while ((m = JSPWIKI_FOOTNOTE_RE.exec(raw)) !== null) {
      footnotes.push({ id: m[1], html: renderJspwikiLink(m[2].trim()) });
    }

    // Sort by id so markdown and JSPWiki entries appear in order
    footnotes.sort((a, b) => {
      const na = parseInt(a.id, 10), nb = parseInt(b.id, 10);
      if (!isNaN(na) && !isNaN(nb)) return na - nb;
      return a.id.localeCompare(b.id);
    });

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
          fn.html +
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
