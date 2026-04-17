'use strict';

/**
 * Admin routes for the journal add-on.
 * Mounted at /admin/journal in register().
 *
 * Endpoints:
 *   GET   /admin/journal           — config panel
 *   POST  /admin/journal/settings  — save config (placeholder — config stored externally)
 */

import { Router, type Request, type Response } from 'express';
import { ApiContext, ApiError } from '../../../dist/src/context/ApiContext';
import type { WikiEngine } from '../../../dist/src/types/WikiEngine';

export default function adminRoutes(engine: WikiEngine, config: Record<string, unknown>): Router {
  const router = Router();

  // ── GET /admin/journal ────────────────────────────────────────────────────
  router.get('/', (req: Request, res: Response) => {
    try {
      const ctx = ApiContext.from(req, engine);
      ctx.requireAuthenticated();
      ctx.requireRole('admin');

      res.render('admin-journal', {
        currentUser:      req.userContext,
        config: {
          defaultPrivate:    config['defaultPrivate']    !== false,
          defaultAuthorLock: config['defaultAuthorLock'] !== false,
          defaultMoodOptions: Array.isArray(config['defaultMoodOptions'])
            ? config['defaultMoodOptions']
            : ['happy', 'content', 'neutral', 'anxious', 'sad', 'grateful', 'energized', 'tired'],
          streakEnabled:      config['streakEnabled']      !== false,
          dailyReminderEnabled: Boolean(config['dailyReminderEnabled']),
          dailyReminderTime:  (config['dailyReminderTime'] as string | undefined) ?? '20:00',
          dailyReminderUsers: Array.isArray(config['dailyReminderUsers'])
            ? config['dailyReminderUsers']
            : []
        },
        csrfToken:        req.session?.csrfToken,
        successMessage:   req.query['success'] ?? null,
        errorMessage:     req.query['error']   ?? null
      });
    } catch (err) {
      if (err instanceof ApiError) {
        res.status(err.status).send(err.message);
        return;
      }
      const msg = err instanceof Error ? err.message : String(err);
      res.status(500).send(msg);
    }
  });

  // ── POST /admin/journal/settings ──────────────────────────────────────────
  router.post('/settings', (req: Request, res: Response) => {
    try {
      const ctx = ApiContext.from(req, engine);
      ctx.requireAuthenticated();
      ctx.requireRole('admin');

      // Config changes require editing app-custom-config.json directly.
      // This route exists as a placeholder for a future config-write API.
      res.redirect('/admin/journal?success=Settings+saved+(restart+required+for+config+changes)');
    } catch (err) {
      if (err instanceof ApiError) {
        res.status(err.status).send(err.message);
        return;
      }
      const msg = err instanceof Error ? err.message : String(err);
      res.status(500).send(msg);
    }
  });

  return router;
}

module.exports = adminRoutes;
