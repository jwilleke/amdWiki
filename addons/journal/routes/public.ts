'use strict';

/**
 * Public read-only journal routes.
 * Mounted at /journal in register().
 *
 * Endpoints:
 *   GET /journal                — timeline (own entries)
 *   GET /journal/tag/:tag       — filter by tag
 *   GET /journal/mood/:mood     — filter by mood
 *   GET /journal/:slug          — view single entry
 */

import { Router, type Request, type Response } from 'express';
import { ApiContext, ApiError } from '../../../dist/src/context/ApiContext';
import type { WikiEngine } from '../../../dist/src/types/WikiEngine';
import type JournalDataManager from '../managers/JournalDataManager';
import type RenderingManager from '../../../dist/src/managers/RenderingManager';
import type AttachmentManager from '../../../dist/src/managers/AttachmentManager';
import type PageManager from '../../../dist/src/managers/PageManager';
import type UserManager from '../../../dist/src/managers/UserManager';
import { getLeftMenu } from './helpers';

export default function publicRoutes(engine: WikiEngine, _config: Record<string, unknown>): Router {
  const router = Router();

  function jdm(): JournalDataManager | undefined {
    return engine.getManager<JournalDataManager>('JournalDataManager');
  }

  function um(): UserManager | undefined {
    return engine.getManager<UserManager>('UserManager');
  }

  async function getUserPref<T>(username: string, key: string, defaultValue: T): Promise<T> {
    const user = await um()?.getUser(username);
    const prefs = (user?.preferences ?? {}) as Record<string, unknown>;
    return key in prefs ? (prefs[key] as T) : defaultValue;
  }

  function sp(v: string | string[] | undefined): string {
    return Array.isArray(v) ? (v[0] ?? '') : (v ?? '');
  }

  function handleError(err: unknown, res: Response): void {
    if (err instanceof ApiError) {
      res.status(err.status).send(err.message);
      return;
    }
    res.status(500).send(err instanceof Error ? err.message : String(err));
  }

  function buildSidebarData(username: string, streakVisible = true): { moodFacets: Array<{mood: string; count: number}>; tagFacets: Array<{tag: string; count: number}>; streak: number; total: number; streakVisible: boolean } {
    const m = jdm();
    if (!m) return { moodFacets: [], tagFacets: [], streak: 0, total: 0, streakVisible };
    return {
      moodFacets:    m.getMoodFacets(username),
      tagFacets:     m.getTagFacets(username),
      streak:        m.computeStreak(username),
      total:         m.countByAuthor(username),
      streakVisible
    };
  }

  // ── GET /journal ─────────────────────────────────────────────────────────────
  router.get('/', (req: Request, res: Response) => {
    void (async () => {
      try {
        const ctx = ApiContext.from(req, engine);
        ctx.requireAuthenticated();

        const m        = jdm();
        const username = ctx.username!;
        const limit    = parseInt((req.query['limit']  as string | undefined) ?? '20', 10) || 20;
        const offset   = parseInt((req.query['offset'] as string | undefined) ?? '0',  10) || 0;
        const total    = m ? m.countByAuthor(username) : 0;
        const entries  = m ? m.listByAuthor(username, { limit, offset }) : [];
        const streakVisible = await getUserPref<boolean>(username, 'journal.streakVisible', true);
        const leftMenu = await getLeftMenu(engine, req.userContext ?? null);

        res.render('journal-home', {
          currentUser: req.userContext,
          entries,
          total,
          limit,
          offset,
          prevOffset:  Math.max(0, offset - limit),
          nextOffset:  offset + limit < total ? offset + limit : null,
          sidebar:     buildSidebarData(username, streakVisible),
          activeFilter: null,
          activeValue:  null,
          onThisDay:   m ? m.getOnThisDay(username) : [],
          leftMenu
        });
      } catch (err) {
        handleError(err, res);
      }
    })();
  });

  // ── GET /journal/tag/:tag ─────────────────────────────────────────────────────
  router.get('/tag/:tag', (req: Request, res: Response) => {
    void (async () => {
      try {
        const ctx = ApiContext.from(req, engine);
        ctx.requireAuthenticated();

        const m        = jdm();
        const username = ctx.username!;
        const tag      = sp(req.params['tag']);
        const entries  = m ? m.listByAuthor(username, { tag }) : [];
        const streakVisible = await getUserPref<boolean>(username, 'journal.streakVisible', true);
        const leftMenu = await getLeftMenu(engine, req.userContext ?? null);

        res.render('journal-by-tag', {
          currentUser:  req.userContext,
          entries,
          tag,
          total:        entries.length,
          sidebar:      buildSidebarData(username, streakVisible),
          leftMenu
        });
      } catch (err) {
        handleError(err, res);
      }
    })();
  });

  // ── GET /journal/mood/:mood ───────────────────────────────────────────────────
  router.get('/mood/:mood', (req: Request, res: Response) => {
    void (async () => {
      try {
        const ctx = ApiContext.from(req, engine);
        ctx.requireAuthenticated();

        const m        = jdm();
        const username = ctx.username!;
        const mood     = sp(req.params['mood']);
        const entries  = m ? m.listByAuthor(username, { mood }) : [];
        const streakVisible = await getUserPref<boolean>(username, 'journal.streakVisible', true);
        const leftMenu = await getLeftMenu(engine, req.userContext ?? null);

        res.render('journal-by-mood', {
          currentUser: req.userContext,
          entries,
          mood,
          total:       entries.length,
          sidebar:     buildSidebarData(username, streakVisible),
          leftMenu
        });
      } catch (err) {
        handleError(err, res);
      }
    })();
  });

  // ── GET /journal/:slug ───────────────────────────────────────────────────────
  router.get('/:slug', (req: Request, res: Response) => {
    void (async () => {
      try {
        const ctx = ApiContext.from(req, engine);
        ctx.requireAuthenticated();

        const slug = sp(req.params['slug']);
        const m    = jdm();
        const entry = m?.getBySlug(slug);

        if (!entry) {
          res.status(404).send('Journal entry not found.');
          return;
        }

        // Ownership check — only author or admin may view
        const isOwner = entry.author === ctx.username;
        const isAdmin = (ctx.roles ?? []).includes('admin');
        if (!isOwner && !isAdmin) {
          res.status(403).send('Access denied.');
          return;
        }

        const pm = engine.getManager<PageManager>('PageManager');
        const page = pm ? await pm.getPage(entry.slug) : null;
        if (!page) {
          res.status(404).send('Journal entry page not found.');
          return;
        }

        // Render markdown content
        const rm = engine.getManager<RenderingManager>('RenderingManager');
        const renderedContent = rm
          ? await rm.renderMarkdown(page.content ?? '', entry.slug, req.userContext ?? null)
          : `<pre>${page.content ?? ''}</pre>`;

        // Attachments
        const am = engine.getManager<AttachmentManager>('AttachmentManager');
        const attachments = am ? await am.getAttachmentsForPage(entry.slug) : [];

        const streakVisible = await getUserPref<boolean>(entry.author, 'journal.streakVisible', true);
        const leftMenu = await getLeftMenu(engine, req.userContext ?? null);

        res.render('journal-entry', {
          currentUser:     req.userContext,
          entry,
          renderedContent,
          attachments,
          sidebar:         buildSidebarData(entry.author, streakVisible),
          canEdit:         isOwner || isAdmin,
          csrfToken:       req.session?.csrfToken,
          leftMenu
        });
      } catch (err) {
        handleError(err, res);
      }
    })();
  });

  return router;
}

module.exports = publicRoutes;
