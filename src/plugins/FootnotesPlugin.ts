/**
 * FootnotesPlugin — collects footnote definitions from the current page's
 * raw markdown and renders them as a reference list.
 *
 * Recognises three formats:
 *   Markdown def:   [^id]: Some text or https://example.com
 *   Bullet (new):   * [^1] - [Link text|Wikipedia:Page] - context note
 *   Bullet (legacy): * [#1] - [Link text|Wikipedia:Page] - context note
 *
 * Wiki link syntax [Text|Wikipedia:Page] in bullet lines is resolved through
 * the interwiki site configuration (ngdpbase.interwiki.sites).
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

interface InterWikiSiteConfig {
  url: string;
  enabled?: boolean;
  openInNewWindow?: boolean;
}

interface ConfigManagerLike {
  getProperty<T>(key: string, defaultValue?: T): T;
}

/** [^id]: text — standard markdown footnote definition */
const MD_FOOTNOTE_DEF_RE = /^\[\^([\d\w-]+)\]:\s*(.+)$/mg;

/** * [^N] - content — preferred bullet format */
const MD_FOOTNOTE_BULLET_RE = /^\* \[\^(\d+)\] - (.+)$/mg;

/** * [#N] - content — legacy JSPWiki bullet format */
const JSPWIKI_FOOTNOTE_RE = /^\* \[#(\d+)\] - (.+)$/mg;

/** Auto-link bare https?:// URLs */
function autoLink(text: string): string {
  return escapeHtml(text).replace(
    /(https?:\/\/[^\s<&]+)/g,
    '<a href="$1" target="_blank" rel="noopener noreferrer">$1</a>'
  );
}

/**
 * Resolve [Display|Target|options] wiki link syntax and markdown [text](url)
 * links to HTML anchors. Handles interwiki prefixes via the site map.
 */
function renderWikiLink(
  raw: string,
  interWikiSites: Map<string, InterWikiSiteConfig>
): string {
  // First convert markdown [text](url) links to HTML anchors
  const mdLinkRe = /(?<!!)\[([^\]]+)\]\((https?:\/\/[^)]+)\)/g;
  const result = raw.replace(mdLinkRe, (_m: string, display: string, url: string) =>
    `<a href="${escapeHtml(url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(display)}</a>`
  );

  // Then resolve [Display|Target|options] ngdpbase wiki link syntax
  const linkRe = /\[([^|]+)\|([^|\]]+)(?:\|[^\]]+)?\]/g;
  return result.replace(linkRe, (_m: string, display: string, target: string) => {
    // Check for interwiki prefix: "Wikipedia:Page_Name"
    const colonIdx = target.indexOf(':');
    if (colonIdx > 0) {
      const prefix = target.slice(0, colonIdx);
      const pagePart = target.slice(colonIdx + 1).replace(/\/+$/, ''); // strip trailing slashes
      const site = interWikiSites.get(prefix) ?? interWikiSites.get(prefix.toLowerCase());
      if (site?.enabled !== false && site?.url) {
        const resolvedUrl = site.url.replace(/%s/g, encodeURIComponent(pagePart));
        const newWindow = site.openInNewWindow !== false;
        return `<a href="${escapeHtml(resolvedUrl)}"${newWindow ? ' target="_blank" rel="noopener noreferrer"' : ''}>${escapeHtml(display)}</a>`;
      }
    }
    // Bare URL or unknown prefix — use target literally
    return `<a href="${escapeHtml(target)}" target="_blank" rel="noopener noreferrer">${escapeHtml(display)}</a>`;
  });
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

    // Load interwiki sites from config
    const configManager = context.engine?.getManager('ConfigurationManager') as ConfigManagerLike | undefined;
    const sitesConfig = configManager?.getProperty<Record<string, InterWikiSiteConfig>>(
      'ngdpbase.interwiki.sites', {}
    ) ?? {};
    const interWikiSites = new Map(Object.entries(sitesConfig));

    // Normalise CRLF so regexes work uniformly
    const raw = String(page.rawContent ?? page.content ?? '').replace(/\r\n/g, '\n');

    const footnotes: Array<{ id: string; html: string }> = [];

    // [^id]: text — markdown definition format
    MD_FOOTNOTE_DEF_RE.lastIndex = 0;
    let m: RegExpExecArray | null;
    while ((m = MD_FOOTNOTE_DEF_RE.exec(raw)) !== null) {
      footnotes.push({ id: m[1], html: autoLink(m[2].trim()) });
    }

    // * [^N] - text — preferred bullet format
    MD_FOOTNOTE_BULLET_RE.lastIndex = 0;
    while ((m = MD_FOOTNOTE_BULLET_RE.exec(raw)) !== null) {
      footnotes.push({ id: m[1], html: renderWikiLink(m[2].trim(), interWikiSites) });
    }

    // * [#N] - text — legacy JSPWiki bullet format (backward compatible)
    JSPWIKI_FOOTNOTE_RE.lastIndex = 0;
    while ((m = JSPWIKI_FOOTNOTE_RE.exec(raw)) !== null) {
      // Only add if not already captured by [^N] format
      if (!footnotes.find(f => f.id === m![1])) {
        footnotes.push({ id: m[1], html: renderWikiLink(m[2].trim(), interWikiSites) });
      }
    }

    // Sort numerically, then lexically for named ids
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
