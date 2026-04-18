'use strict';

/**
 * Editor routes for the journal add-on.
 * Mounted at /journal in register() (after public routes).
 *
 * Endpoints:
 *   GET  /journal/settings      — user preferences form
 *   POST /journal/settings      — save user preferences
 *   GET  /journal/new           — new entry form
 *   POST /journal/new           — save new entry
 *   GET  /journal/:slug/edit    — edit form
 *   POST /journal/:slug/edit    — save updated entry
 *   POST /journal/:slug/delete  — delete entry
 */

import { Router, type Request, type Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { ApiContext, ApiError } from '../../../dist/src/context/ApiContext';
import WikiContext from '../../../dist/src/context/WikiContext';
import type { WikiEngine } from '../../../dist/src/types/WikiEngine';
import type PageManager from '../../../dist/src/managers/PageManager';
import type UserManager from '../../../dist/src/managers/UserManager';
import type JournalDataManager from '../managers/JournalDataManager';
import type { JournalIndexEntry } from '../managers/JournalDataManager';
import type JournalTemplateManager from '../managers/JournalTemplateManager';
import { getLeftMenu } from './helpers';

export default function editorRoutes(engine: WikiEngine, config: Record<string, unknown>): Router {
  const router = Router();

  function jdm(): JournalDataManager | undefined {
    return engine.getManager<JournalDataManager>('JournalDataManager');
  }

  function jtm(): JournalTemplateManager | undefined {
    return engine.getManager<JournalTemplateManager>('JournalTemplateManager');
  }

  function enableVoiceToText(): boolean {
    return config['enableVoiceToText'] !== false;
  }

  function pm(): PageManager | undefined {
    return engine.getManager<PageManager>('PageManager');
  }

  function um(): UserManager | undefined {
    return engine.getManager<UserManager>('UserManager');
  }

  function sp(v: string | string[] | undefined): string {
    return Array.isArray(v) ? (v[0] ?? '') : (v ?? '');
  }

  async function resolveUserContext(req: Request): Promise<import('../../../dist/src/context/WikiContext').UserContext> {
    const um = engine.getManager<UserManager>('UserManager');
    const uc = req.userContext || (um ? await um.getCurrentUser(req) : null);
    return uc as import('../../../dist/src/context/WikiContext').UserContext;
  }

  function handleError(err: unknown, res: Response): void {
    if (err instanceof ApiError) {
      res.status(err.status).send(err.message);
      return;
    }
    res.status(500).send(err instanceof Error ? err.message : String(err));
  }

  function parseTags(raw: unknown): string[] {
    if (typeof raw === 'string') {
      return raw.split(',').map(t => t.trim()).filter(Boolean);
    }
    if (Array.isArray(raw)) {
      return (raw as unknown[]).map(String).map(t => t.trim()).filter(Boolean);
    }
    return [];
  }

  function moodOptions(): string[] {
    const raw = config['defaultMoodOptions'];
    if (Array.isArray(raw)) return raw.map(String);
    return ['happy', 'content', 'neutral', 'anxious', 'sad', 'grateful', 'energized', 'tired'];
  }

  // ── GET /journal/settings ────────────────────────────────────────────────────
  router.get('/settings', (req: Request, res: Response) => {
    void (async () => {
      try {
        const ctx = ApiContext.from(req, engine);
        ctx.requireAuthenticated();

        const userManager = um();
        const freshUser = userManager ? await userManager.getUser(ctx.username!) : null;
        const prefs = (freshUser?.preferences ?? {}) as Record<string, unknown>;
        const leftMenu = await getLeftMenu(engine, req.userContext ?? null);

        res.render('journal-settings', {
          currentUser:      req.userContext,
          templates:        jtm()?.listTemplates() ?? [],
          prefs: {
            defaultTemplate:  (prefs['journal.defaultTemplate'] as string | undefined)  ?? 'free-write',
            voiceToText:      prefs['journal.voiceToText']      !== false,
            reminderEnabled:  Boolean(prefs['journal.reminderEnabled']),
            reminderTime:     (prefs['journal.reminderTime'] as string | undefined)     ?? '20:00',
            streakVisible:    prefs['journal.streakVisible']    !== false
          },
          adminVoiceEnabled: enableVoiceToText(),
          csrfToken:         req.session?.csrfToken,
          successMessage:    req.query['success'] ?? null,
          errorMessage:      req.query['error']   ?? null,
          leftMenu
        });
      } catch (err) {
        handleError(err, res);
      }
    })();
  });

  // ── POST /journal/settings ───────────────────────────────────────────────────
  router.post('/settings', (req: Request, res: Response) => {
    void (async () => {
      try {
        const ctx = ApiContext.from(req, engine);
        ctx.requireAuthenticated();

        const userManager = um();
        if (!userManager) { res.status(503).send('UserManager not available'); return; }

        const freshUser = await userManager.getUser(ctx.username!);
        const existing = (freshUser?.preferences ?? {}) as Record<string, unknown>;

        const body = req.body as Record<string, unknown>;
        const updated: Record<string, unknown> = {
          ...existing,
          'journal.defaultTemplate': typeof body['defaultTemplate'] === 'string'
            ? body['defaultTemplate']
            : 'free-write',
          'journal.voiceToText':    body['voiceToText']    === 'on',
          'journal.reminderEnabled': body['reminderEnabled'] === 'on',
          'journal.reminderTime':   typeof body['reminderTime'] === 'string' && body['reminderTime'].trim()
            ? body['reminderTime'].trim()
            : '20:00',
          'journal.streakVisible':  body['streakVisible']  === 'on'
        };

        await userManager.updateUser(ctx.username!, { preferences: updated });
        res.redirect('/journal/settings?success=Settings+saved');
      } catch (err) {
        handleError(err, res);
      }
    })();
  });

  // ── GET /journal/new ─────────────────────────────────────────────────────────
  router.get('/new', (req: Request, res: Response) => {
    void (async () => {
      try {
        const ctx = ApiContext.from(req, engine);
        ctx.requireAuthenticated();

        const date = typeof req.query['date'] === 'string'
          ? req.query['date']
          : new Date().toISOString().slice(0, 10);

        const userManager = um();
        const freshUser = userManager ? await userManager.getUser(ctx.username!) : null;
        const prefs = (freshUser?.preferences ?? {}) as Record<string, unknown>;
        const defaultTemplate = (prefs['journal.defaultTemplate'] as string | undefined) ?? 'free-write';
        const userVoice = prefs['journal.voiceToText'] !== false;
        const leftMenu = await getLeftMenu(engine, req.userContext ?? null);

        res.render('journal-editor', {
          currentUser:       req.userContext,
          entry:             null,
          defaultDate:       date,
          moodOptions:       moodOptions(),
          templates:         jtm()?.listTemplates() ?? [],
          defaultTemplate,
          enableVoiceToText: enableVoiceToText() && userVoice,
          csrfToken:         req.session?.csrfToken,
          errorMessage:      null,
          leftMenu
        });
      } catch (err) {
        handleError(err, res);
      }
    })();
  });

  // ── POST /journal/new ────────────────────────────────────────────────────────
  router.post('/new', (req: Request, res: Response) => {
    void (async () => {
      try {
        const ctx = ApiContext.from(req, engine);
        ctx.requireAuthenticated();

        const username = ctx.username!;
        const body = req.body as Record<string, unknown>;
        const date  = typeof body['journal-date'] === 'string'
          ? body['journal-date']
          : new Date().toISOString().slice(0, 10);
        const title   = typeof body['title'] === 'string' && body['title'].trim()
          ? body['title'].trim()
          : `Journal — ${date}`;
        const content = (typeof body['content'] === 'string' ? body['content'] : '') || ' ';
        const mood    = typeof body['mood'] === 'string' && body['mood'].trim()
          ? body['mood'].trim()
          : undefined;
        const tags    = parseTags(body['journal-tags']);

        const slug = `journal-${username}-${date}`;
        const uuid = uuidv4();

        const p = pm();
        if (!p) { res.status(503).send('PageManager not available'); return; }

        // If entry already exists for this date, redirect to edit it
        const existing = await p.getPageBySlug(slug);
        if (existing) {
          res.redirect(`/journal/${encodeURIComponent(slug)}/edit`);
          return;
        }

        const defaultPrivate    = config['defaultPrivate']    !== false;
        const defaultAuthorLock = config['defaultAuthorLock'] !== false;

        const metadata: Record<string, unknown> = {
          title,
          uuid,
          slug,
          'system-category': 'journal',
          'journal-date':    date,
          author:            username,
          lastModified:      new Date().toISOString(),
          ...(mood              ? { mood }                                     : {}),
          ...(tags.length       ? { 'journal-tags': tags }                    : {}),
          ...(defaultAuthorLock ? { 'author-lock': true }                     : {}),
          ...(defaultPrivate    ? { 'system-location': 'private', 'page-creator': username } : {})
        };

        const wikiCtx = new WikiContext(engine, {
          context:     WikiContext.CONTEXT.EDIT,
          pageName:    slug,
          content,
          userContext: await resolveUserContext(req)
        });

        // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-argument
        await p.savePageWithContext(wikiCtx as any, metadata);

        // Update sidecar index
        const indexEntry: JournalIndexEntry = {
          uuid,
          slug,
          title,
          author: username,
          journalDate: date,
          mood,
          tags,
          isPrivate: defaultPrivate,
          lastModified: new Date().toISOString()
        };
        await jdm()?.indexEntry(indexEntry);

        res.redirect(`/journal/${encodeURIComponent(slug)}`);
      } catch (err) {
        handleError(err, res);
      }
    })();
  });

  // ── GET /journal/:slug/edit ──────────────────────────────────────────────────
  router.get('/:slug/edit', (req: Request, res: Response) => {
    void (async () => {
      try {
        const ctx  = ApiContext.from(req, engine);
        ctx.requireAuthenticated();

        const slug  = sp(req.params['slug']);
        const entry = jdm()?.getBySlug(slug);
        if (!entry) { res.status(404).send('Journal entry not found.'); return; }

        const isOwner = entry.author === ctx.username;
        const isAdmin = (ctx.roles ?? []).includes('admin');
        if (!isOwner && !isAdmin) { res.status(403).send('Access denied.'); return; }

        const page = await pm()?.getPage(slug);
        if (!page) { res.status(404).send('Journal entry page not found.'); return; }

        const leftMenu = await getLeftMenu(engine, req.userContext ?? null);

        res.render('journal-editor', {
          currentUser:      req.userContext,
          entry:            { ...entry, content: page.content ?? '' },
          defaultDate:      entry.journalDate,
          moodOptions:      moodOptions(),
          templates:        [],
          enableVoiceToText: enableVoiceToText(),
          csrfToken:        req.session?.csrfToken,
          errorMessage:     null,
          leftMenu
        });
      } catch (err) {
        handleError(err, res);
      }
    })();
  });

  // ── POST /journal/:slug/edit ─────────────────────────────────────────────────
  router.post('/:slug/edit', (req: Request, res: Response) => {
    void (async () => {
      try {
        const ctx = ApiContext.from(req, engine);
        ctx.requireAuthenticated();

        const slug  = sp(req.params['slug']);
        const entry = jdm()?.getBySlug(slug);
        if (!entry) { res.status(404).send('Journal entry not found.'); return; }

        const isOwner = entry.author === ctx.username;
        const isAdmin = (ctx.roles ?? []).includes('admin');
        if (!isOwner && !isAdmin) { res.status(403).send('Access denied.'); return; }

        const body    = req.body as Record<string, unknown>;
        const title   = typeof body['title'] === 'string' && body['title'].trim()
          ? body['title'].trim()
          : entry.title;
        const content = (typeof body['content'] === 'string' ? body['content'] : '') || ' ';
        const mood    = typeof body['mood'] === 'string' && body['mood'].trim()
          ? body['mood'].trim()
          : undefined;
        const tags    = parseTags(body['journal-tags']);
        const now     = new Date().toISOString();

        const p = pm();
        if (!p) { res.status(503).send('PageManager not available'); return; }

        const page = await p.getPage(slug);
        const existingMeta = (page?.metadata ?? {}) as Record<string, unknown>;

        const metadata: Record<string, unknown> = {
          ...existingMeta,
          title,
          lastModified: now,
          ...(mood        ? { mood }                  : {}),
          ...(tags.length ? { 'journal-tags': tags }  : {})
        };

        const wikiCtx = new WikiContext(engine, {
          context:     WikiContext.CONTEXT.EDIT,
          pageName:    slug,
          content,
          userContext: await resolveUserContext(req)
        });

        // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-argument
        await p.savePageWithContext(wikiCtx as any, metadata);

        // Update sidecar index
        const updated: JournalIndexEntry = {
          ...entry,
          title,
          mood,
          tags,
          lastModified: now
        };
        await jdm()?.indexEntry(updated);

        res.redirect(`/journal/${encodeURIComponent(slug)}`);
      } catch (err) {
        handleError(err, res);
      }
    })();
  });

  // ── POST /journal/:slug/delete ───────────────────────────────────────────────
  router.post('/:slug/delete', (req: Request, res: Response) => {
    void (async () => {
      try {
        const ctx = ApiContext.from(req, engine);
        ctx.requireAuthenticated();

        const slug  = sp(req.params['slug']);
        const entry = jdm()?.getBySlug(slug);
        if (!entry) { res.status(404).send('Journal entry not found.'); return; }

        const isOwner = entry.author === ctx.username;
        const isAdmin = (ctx.roles ?? []).includes('admin');
        if (!isOwner && !isAdmin) { res.status(403).send('Access denied.'); return; }

        const p = pm();
        if (!p) { res.status(503).send('PageManager not available'); return; }

        const wikiCtx = new WikiContext(engine, {
          context:     WikiContext.CONTEXT.EDIT,
          pageName:    slug,
          content:     ' ',
          userContext: await resolveUserContext(req)
        });

        // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-argument
        await p.deletePageWithContext(wikiCtx as any);
        await jdm()?.removeEntry(entry.uuid);

        res.redirect('/journal');
      } catch (err) {
        handleError(err, res);
      }
    })();
  });

  return router;
}

module.exports = editorRoutes;
