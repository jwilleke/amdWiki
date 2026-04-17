'use strict';

/**
 * API routes for the journal add-on.
 * Mounted at /api/journal in register().
 *
 * Endpoints:
 *   GET  /api/journal/new          — bootstrap a new entry page + redirect to /edit/:slug
 *   GET  /api/journal/entries      — JSON list of own entries (paginated)
 *   GET  /api/journal/on-this-day  — JSON: same MM-DD entries from prior years
 *   GET  /api/journal/streak       — JSON: { streak: N, total: N }
 */

import { Router, type Request, type Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { ApiContext, ApiError } from '../../../dist/src/context/ApiContext';
import WikiContext from '../../../dist/src/context/WikiContext';
import type { WikiEngine } from '../../../dist/src/types/WikiEngine';
import type PageManager from '../../../dist/src/managers/PageManager';
import type SearchManager from '../../../dist/src/managers/SearchManager';

export default function apiRoutes(engine: WikiEngine, config: Record<string, unknown>): Router {
  const router = Router();

  function pm(): PageManager | undefined {
    return engine.getManager<PageManager>('PageManager');
  }

  function sm(): SearchManager | undefined {
    return engine.getManager<SearchManager>('SearchManager');
  }

  function qs(v: unknown): string | undefined {
    return typeof v === 'string' ? v : undefined;
  }

  function handleError(err: unknown, res: Response): void {
    if (err instanceof ApiError) {
      res.status(err.status).json({ error: err.message });
      return;
    }
    const msg = err instanceof Error ? err.message : String(err);
    res.status(500).json({ error: msg });
  }

  /** Collect own journal entries from SearchManager + PageManager. */
  async function getOwnEntries(username: string): Promise<Array<Record<string, unknown>>> {
    const s = sm();
    const p = pm();
    if (!s || !p) return [];

    const results = await s.searchByCategory('journal');
    const pages = await Promise.all(results.map(r => p.getPage(r.name)));

    return pages
      .filter(page => page && (page.metadata as Record<string, unknown>)?.['author'] === username)
      .map(page => {
        const m = page!.metadata as Record<string, unknown>;
        return {
          slug:        ((m['slug'] as string | undefined) ?? page!.title) ?? '',
          title:       ((m['title'] as string | undefined) ?? page!.title) ?? '',
          journalDate: (m['journal-date'] as string | undefined) ?? '',
          mood:        m['mood'] ?? null,
          tags:        Array.isArray(m['journal-tags']) ? m['journal-tags'] : [],
          lastModified: (m['lastModified'] as string | undefined) ?? ''
        };
      })
      .filter(e => e.journalDate)
      .sort((a, b) => String(b.journalDate).localeCompare(String(a.journalDate)));
  }

  // ── GET /api/journal/new ───────────────────────────────────────────────────
  router.get('/new', (req: Request, res: Response) => {
    void (async () => {
      try {
        const ctx = ApiContext.from(req, engine);
        ctx.requireAuthenticated();

        const username = ctx.username!;
        const date = qs(req.query['date']) ?? new Date().toISOString().slice(0, 10);
        const slug = `journal-${username}-${date}`;

        const p = pm();
        if (!p) { res.status(503).json({ error: 'PageManager not available' }); return; }

        // Redirect to existing entry if one already exists for this date
        const existing = await p.getPageBySlug(slug);
        if (existing) {
          const existingTitle = (existing.metadata as Record<string, unknown>)['title'] as string | undefined;
          res.redirect(`/edit/${encodeURIComponent(existingTitle ?? slug)}`);
          return;
        }

        const defaultPrivate    = config['defaultPrivate']    !== false;
        const defaultAuthorLock = config['defaultAuthorLock'] !== false;

        const metadata: Record<string, unknown> = {
          title:             `Journal — ${date}`,
          uuid:              uuidv4(),
          slug,
          'system-category': 'journal',
          'journal-date':    date,
          author:            username,
          ...(defaultAuthorLock ? { 'author-lock': true } : {}),
          ...(defaultPrivate ? {
            'system-location': 'private',
            'page-creator':    username
          } : {})
        };

        const wikiContext = new WikiContext(engine, {
          context:     WikiContext.CONTEXT.EDIT,
          pageName:    slug,
          content:     '',
          userContext: req.userContext ?? { username }
        });

        // WikiContext imported in addon and the one PageManager was compiled against are structurally
        // identical but treated as different module instances by TypeScript's type checker.
        // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-argument
        await p.savePageWithContext(wikiContext as any, metadata);
        res.redirect(`/edit/${encodeURIComponent(slug)}`);
      } catch (err) {
        handleError(err, res);
      }
    })();
  });

  // ── GET /api/journal/entries ───────────────────────────────────────────────
  router.get('/entries', (req: Request, res: Response) => {
    void (async () => {
      try {
        const ctx = ApiContext.from(req, engine);
        ctx.requireAuthenticated();

        const limit  = parseInt(qs(req.query['limit'])  ?? '50',  10) || 50;
        const offset = parseInt(qs(req.query['offset']) ?? '0',   10) || 0;

        const entries = await getOwnEntries(ctx.username!);
        const page    = entries.slice(offset, offset + limit);

        res.json({ entries: page, total: entries.length, offset, limit });
      } catch (err) {
        handleError(err, res);
      }
    })();
  });

  // ── GET /api/journal/on-this-day ──────────────────────────────────────────
  router.get('/on-this-day', (req: Request, res: Response) => {
    void (async () => {
      try {
        const ctx = ApiContext.from(req, engine);
        ctx.requireAuthenticated();

        const today     = new Date().toISOString().slice(0, 10);
        const todayMMDD = today.slice(5);
        const thisYear  = today.slice(0, 4);

        const entries = await getOwnEntries(ctx.username!);
        const matches = entries.filter(e =>
          String(e.journalDate).slice(5)    === todayMMDD &&
          String(e.journalDate).slice(0, 4) !== thisYear
        );

        res.json({ entries: matches, today });
      } catch (err) {
        handleError(err, res);
      }
    })();
  });

  // ── GET /api/journal/streak ───────────────────────────────────────────────
  router.get('/streak', (req: Request, res: Response) => {
    void (async () => {
      try {
        const ctx = ApiContext.from(req, engine);
        ctx.requireAuthenticated();

        const entries = await getOwnEntries(ctx.username!);
        const dates   = [...new Set(entries.map(e => String(e.journalDate)))].sort().reverse();

        let streak  = 0;
        let current = new Date().toISOString().slice(0, 10);
        for (const d of dates) {
          if (d === current) {
            streak++;
            const prev = new Date(`${current}T12:00:00`);
            prev.setDate(prev.getDate() - 1);
            current = prev.toISOString().slice(0, 10);
          } else if (d < current) {
            break;
          }
        }

        res.json({ streak, total: entries.length });
      } catch (err) {
        handleError(err, res);
      }
    })();
  });

  return router;
}

module.exports = apiRoutes;
