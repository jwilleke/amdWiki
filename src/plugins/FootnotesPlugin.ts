/**
 * FootnotesPlugin — renders footnote definitions from sidecar storage (FootnoteManager)
 * with a CRUD UI for authorised users. Falls back to reading the page body for legacy
 * pages not yet migrated to sidecar storage.
 *
 * Sidecar format: ${SLOW_STORAGE}/footnotes/{pageUuid}.json
 * Migration script: scripts/migrate-footnotes-to-sidecar.mjs
 * Tracking issue: #553 / #557
 *
 * Syntax:
 *   [{FootnotesPlugin}]
 *   [{FootnotesPlugin noheader='true'}]
 *
 * Parameters:
 *   noheader — suppress the "Footnotes" heading (default: false)
 */

import type { SimplePlugin, PluginContext, PluginParams } from './types.js';
import type FootnoteManager from '../managers/FootnoteManager.js';
import type { PageFootnote } from '../managers/FootnoteManager.js';
import { parseBoolParam, escapeHtml } from '../utils/pluginFormatters.js';

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

// ── Legacy body-parsing (fallback for unmigrated pages) ──────────────────────

const MD_FOOTNOTE_DEF_RE = /^\[\^([\d\w-]+)\]:\s*(.+)$/mg;
const MD_FOOTNOTE_BULLET_RE = /^\* \[\^(\d+)\] - (.+)$/mg;
const JSPWIKI_FOOTNOTE_RE = /^\* \[#(\d+)\] - (.+)$/mg;

function autoLink(text: string): string {
  return escapeHtml(text).replace(
    /(https?:\/\/[^\s<&]+)/g,
    '<a href="$1" target="_blank" rel="noopener noreferrer">$1</a>'
  );
}

function renderWikiLink(raw: string, interWikiSites: Map<string, InterWikiSiteConfig>): string {
  const mdLinkRe = /(?<!!)\[([^\]]+)\]\((https?:\/\/[^)]+)\)/g;
  const result = raw.replace(mdLinkRe, (_m: string, display: string, url: string) =>
    `<a href="${escapeHtml(url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(display)}</a>`
  );
  const linkRe = /\[([^|]+)\|([^|\]]+)(?:\|[^\]]+)?\]/g;
  return result.replace(linkRe, (_m: string, display: string, target: string) => {
    const colonIdx = target.indexOf(':');
    if (colonIdx > 0) {
      const prefix = target.slice(0, colonIdx);
      const pagePart = target.slice(colonIdx + 1).replace(/\/+$/, '');
      const site = interWikiSites.get(prefix) ?? interWikiSites.get(prefix.toLowerCase());
      if (site?.enabled !== false && site?.url) {
        const resolvedUrl = site.url.replace(/%s/g, encodeURIComponent(pagePart));
        const newWindow = site.openInNewWindow !== false;
        return `<a href="${escapeHtml(resolvedUrl)}"${newWindow ? ' target="_blank" rel="noopener noreferrer"' : ''}>${escapeHtml(display)}</a>`;
      }
    }
    return `<a href="${escapeHtml(target)}" target="_blank" rel="noopener noreferrer">${escapeHtml(display)}</a>`;
  });
}

async function readLegacyFootnotes(
  pageName: string,
  pageManager: PageManagerLike,
  interWikiSites: Map<string, InterWikiSiteConfig>
): Promise<Array<{ id: string; html: string }>> {
  const page = await pageManager.getPage(pageName);
  if (!page) return [];
  const raw = String(page.rawContent ?? page.content ?? '').replace(/\r\n/g, '\n');
  const footnotes: Array<{ id: string; html: string }> = [];

  MD_FOOTNOTE_DEF_RE.lastIndex = 0;
  let m: RegExpExecArray | null;
  while ((m = MD_FOOTNOTE_DEF_RE.exec(raw)) !== null) {
    footnotes.push({ id: m[1], html: autoLink(m[2].trim()) });
  }
  MD_FOOTNOTE_BULLET_RE.lastIndex = 0;
  while ((m = MD_FOOTNOTE_BULLET_RE.exec(raw)) !== null) {
    footnotes.push({ id: m[1], html: renderWikiLink(m[2].trim(), interWikiSites) });
  }
  JSPWIKI_FOOTNOTE_RE.lastIndex = 0;
  while ((m = JSPWIKI_FOOTNOTE_RE.exec(raw)) !== null) {
    if (!footnotes.find(f => f.id === m![1])) {
      footnotes.push({ id: m[1], html: renderWikiLink(m[2].trim(), interWikiSites) });
    }
  }
  footnotes.sort((a, b) => {
    const na = parseInt(a.id, 10), nb = parseInt(b.id, 10);
    if (!isNaN(na) && !isNaN(nb)) return na - nb;
    return a.id.localeCompare(b.id);
  });
  return footnotes;
}

// ── Render helpers ───────────────────────────────────────────────────────────

function renderFootnoteRow(fn: PageFootnote, canEdit: boolean, canDelete: boolean, pageUuid: string): string {
  const urlHtml = fn.url
    ? `<a href="${escapeHtml(fn.url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(fn.display || fn.url)}</a>`
    : escapeHtml(fn.display);
  const noteHtml = fn.note ? ` <span class="footnote-note text-muted small">— ${escapeHtml(fn.note)}</span>` : '';
  const actions: string[] = [];
  if (canEdit) {
    actions.push(
      '<button class="btn btn-sm btn-outline-secondary ms-2 footnote-edit-btn" ' +
      `data-id="${escapeHtml(fn.id)}" data-display="${escapeHtml(fn.display)}" ` +
      `data-url="${escapeHtml(fn.url)}" data-note="${escapeHtml(fn.note)}">Edit</button>`
    );
  }
  if (canDelete) {
    actions.push(
      '<button class="btn btn-sm btn-outline-danger ms-1 footnote-delete-btn" ' +
      `data-id="${escapeHtml(fn.id)}" data-uuid="${escapeHtml(pageUuid)}">Delete</button>`
    );
  }
  return (
    `<li id="footnote-${escapeHtml(fn.id)}" class="footnote-item">` +
    `<sup><a href="#footnote-ref-${escapeHtml(fn.id)}">[${escapeHtml(fn.id)}]</a></sup> ` +
    urlHtml + noteHtml +
    (actions.length ? `<span class="footnote-actions">${actions.join('')}</span>` : '') +
    '</li>'
  );
}

function renderCrudScript(pageUuid: string): string {
  return `<script>
(function() {
  const _uuid = ${JSON.stringify(pageUuid)};

  // Add
  document.getElementById('footnote-add-form')?.addEventListener('submit', function(e) {
    e.preventDefault();
    const display = this.querySelector('[name=display]').value.trim();
    const url = this.querySelector('[name=url]').value.trim();
    const note = this.querySelector('[name=note]').value.trim();
    fetch('/api/footnotes/' + _uuid, {
      method: 'POST', headers: {'Content-Type':'application/json'},
      body: JSON.stringify({ display, url, note })
    }).then(r => r.json()).then(d => { if (d.success) { sessionStorage.setItem('ngdp-restore-tab','footnotes'); location.reload(); } else alert(d.error || 'Failed'); })
      .catch(() => alert('Failed to add footnote.'));
  });

  // Delete
  document.querySelectorAll('.footnote-delete-btn').forEach(btn => {
    btn.addEventListener('click', function() {
      if (!confirm('Delete footnote [' + this.dataset.id + ']?')) return;
      fetch('/api/footnotes/' + _uuid + '/' + this.dataset.id, { method: 'DELETE' })
        .then(r => r.json()).then(d => { if (d.success) { sessionStorage.setItem('ngdp-restore-tab','footnotes'); location.reload(); } else alert(d.error || 'Failed'); })
        .catch(() => alert('Failed to delete footnote.'));
    });
  });

  // Edit — populate the add form as an edit form
  document.querySelectorAll('.footnote-edit-btn').forEach(btn => {
    btn.addEventListener('click', function() {
      const form = document.getElementById('footnote-add-form');
      if (!form) return;
      form.querySelector('[name=display]').value = this.dataset.display || '';
      form.querySelector('[name=url]').value = this.dataset.url || '';
      form.querySelector('[name=note]').value = this.dataset.note || '';
      form.dataset.editId = this.dataset.id;
      form.querySelector('button[type=submit]').textContent = 'Save Changes';
      form.scrollIntoView({ behavior: 'smooth' });
    });
  });

  // Override submit to PUT when editing
  document.getElementById('footnote-add-form')?.addEventListener('submit', function(e) {
    const editId = this.dataset.editId;
    if (!editId) return; // handled by add listener above
    e.preventDefault();
    e.stopImmediatePropagation();
    const display = this.querySelector('[name=display]').value.trim();
    const url = this.querySelector('[name=url]').value.trim();
    const note = this.querySelector('[name=note]').value.trim();
    fetch('/api/footnotes/' + _uuid + '/' + editId, {
      method: 'PUT', headers: {'Content-Type':'application/json'},
      body: JSON.stringify({ display, url, note })
    }).then(r => r.json()).then(d => { if (d.success) { sessionStorage.setItem('ngdp-restore-tab','footnotes'); location.reload(); } else alert(d.error || 'Failed'); })
      .catch(() => alert('Failed to update footnote.'));
  }, true);
})();
</script>`;
}

// ── Plugin ───────────────────────────────────────────────────────────────────

const FootnotesPlugin: SimplePlugin = {
  name: 'FootnotesPlugin',
  description: 'Lists footnote definitions from sidecar storage with editor CRUD UI',
  author: 'ngdpbase',
  version: '2.0.0',

  async execute(context: PluginContext, params: PluginParams): Promise<string> {
    const engine = context.engine;
    if (!engine) return '';

    const pageName = context.pageName;
    const pageMetadata = context.pageMetadata as { uuid?: string } | undefined;
    const pageUuid = pageMetadata?.uuid;

    const noheader = parseBoolParam(params?.['noheader'], false);

    const userContext = context.userContext as {
      isAuthenticated?: boolean;
      username?: string;
      roles?: string[];
    } | undefined;
    const isAuthenticated = userContext?.isAuthenticated === true;
    const isEditor = isAuthenticated && (
      (userContext?.roles ?? []).some(r => ['editor', 'contributor', 'admin'].includes(r))
    );
    const isAdmin = (userContext?.roles ?? []).includes('admin');

    const parts: string[] = ['<section class="page-footnotes">'];
    if (!noheader) parts.push('<h2>Footnotes</h2>');

    // ── Try sidecar first ────────────────────────────────────────────────────
    const footnoteManager = engine.getManager('FootnoteManager') as FootnoteManager | undefined;

    if (footnoteManager?.isEnabled() && pageUuid) {
      const footnotes: PageFootnote[] = await footnoteManager.getFootnotes(pageUuid);

      if (footnotes.length === 0) {
        parts.push('<p class="no-footnotes"><em>No footnotes on this page.</em></p>');
      } else {
        parts.push('<ol class="footnote-list">');
        for (const fn of footnotes) {
          const canDelete = isAdmin || (isAuthenticated && fn.createdBy === userContext?.username);
          parts.push(renderFootnoteRow(fn, isEditor, canDelete, pageUuid));
        }
        parts.push('</ol>');
      }

      if (isEditor) {
        parts.push(`
<form id="footnote-add-form" class="footnote-add-form mt-3">
  <div class="row g-2 align-items-end">
    <div class="col-md-4">
      <label class="form-label form-label-sm">Display text</label>
      <input type="text" name="display" class="form-control form-control-sm" placeholder="Source title" required>
    </div>
    <div class="col-md-5">
      <label class="form-label form-label-sm">URL</label>
      <input type="url" name="url" class="form-control form-control-sm" placeholder="https://…" required>
    </div>
    <div class="col-md-3">
      <label class="form-label form-label-sm">Note <span class="text-muted">(optional)</span></label>
      <input type="text" name="note" class="form-control form-control-sm" placeholder="e.g. accessed 2024-01">
    </div>
  </div>
  <button type="submit" class="btn btn-sm btn-primary mt-2">Add Footnote</button>
</form>`);
        parts.push(renderCrudScript(pageUuid));
      }

      parts.push('</section>');
      return parts.join('\n');
    }

    // ── Legacy fallback: read from page body ─────────────────────────────────
    if (!pageName) {
      parts.push('<p class="no-footnotes"><em>No footnotes on this page.</em></p>');
      parts.push('</section>');
      return parts.join('\n');
    }

    const pageManager = engine.getManager('PageManager') as PageManagerLike | undefined;
    if (!pageManager) {
      parts.push('</section>');
      return parts.join('\n');
    }

    const configManager = engine.getManager('ConfigurationManager') as ConfigManagerLike | undefined;
    const sitesConfig = configManager?.getProperty<Record<string, InterWikiSiteConfig>>(
      'ngdpbase.interwiki.sites', {}
    ) ?? {};
    const interWikiSites = new Map(Object.entries(sitesConfig));

    const footnotes = await readLegacyFootnotes(pageName, pageManager, interWikiSites);

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
