'use strict';

/**
 * API routes for the journal add-on.
 * Mounted at /api/journal in register().
 *
 * Endpoints:
 *   GET  /api/journal/new          — bootstrap a new entry page + redirect to /journal/:slug/edit
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
import type JournalDataManager from '../managers/JournalDataManager';
import type { JournalIndexEntry } from '../managers/JournalDataManager';

export default function apiRoutes(engine: WikiEngine, config: Record<string, unknown>): Router {
  const router = Router();

  function pm(): PageManager | undefined {
    return engine.getManager<PageManager>('PageManager');
  }

  function jdm(): JournalDataManager | undefined {
    return engine.getManager<JournalDataManager>('JournalDataManager');
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
          res.redirect(`/journal/${encodeURIComponent(slug)}/edit`);
          return;
        }

        const defaultPrivate    = config['defaultPrivate']    !== false;
        const defaultAuthorLock = config['defaultAuthorLock'] !== false;
        const uuid = uuidv4();
        const title = `Journal — ${date}`;
        const now = new Date().toISOString();

        const metadata: Record<string, unknown> = {
          title,
          uuid,
          slug,
          'system-category': 'journal',
          'journal-date':    date,
          author:            username,
          lastModified:      now,
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

        // Index in sidecar
        const indexEntry: JournalIndexEntry = {
          uuid,
          slug,
          title,
          author: username,
          journalDate: date,
          mood: undefined,
          tags: [],
          isPrivate: defaultPrivate,
          lastModified: now
        };
        await jdm()?.indexEntry(indexEntry);

        res.redirect(`/journal/${encodeURIComponent(slug)}/edit`);
      } catch (err) {
        handleError(err, res);
      }
    })();
  });

  // ── GET /api/journal/entries ───────────────────────────────────────────────
  router.get('/entries', (req: Request, res: Response) => {
    try {
      const ctx = ApiContext.from(req, engine);
      ctx.requireAuthenticated();

      const limit  = parseInt(qs(req.query['limit'])  ?? '50', 10) || 50;
      const offset = parseInt(qs(req.query['offset']) ?? '0',  10) || 0;

      const m       = jdm();
      const total   = m ? m.countByAuthor(ctx.username!) : 0;
      const entries = m ? m.listByAuthor(ctx.username!, { limit, offset }) : [];

      res.json({ entries, total, offset, limit });
    } catch (err) {
      handleError(err, res);
    }
  });

  // ── GET /api/journal/on-this-day ──────────────────────────────────────────
  router.get('/on-this-day', (req: Request, res: Response) => {
    try {
      const ctx = ApiContext.from(req, engine);
      ctx.requireAuthenticated();

      const today   = new Date().toISOString().slice(0, 10);
      const m       = jdm();
      const entries = m ? m.getOnThisDay(ctx.username!) : [];

      res.json({ entries, today });
    } catch (err) {
      handleError(err, res);
    }
  });

  // ── GET /api/journal/streak ───────────────────────────────────────────────
  router.get('/streak', (req: Request, res: Response) => {
    try {
      const ctx = ApiContext.from(req, engine);
      ctx.requireAuthenticated();

      const m      = jdm();
      const streak = m ? m.computeStreak(ctx.username!) : 0;
      const total  = m ? m.countByAuthor(ctx.username!) : 0;

      res.json({ streak, total });
    } catch (err) {
      handleError(err, res);
    }
  });

  return router;
}

module.exports = apiRoutes;
