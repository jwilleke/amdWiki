'use strict';

import { Router, type Request, type Response } from 'express';
import { ApiContext } from '../../../dist/src/context/ApiContext';
import type { WikiEngine } from '../../../dist/src/types/WikiEngine';
import type FormsAddon from '../index';
import type FormsDataManager from '../managers/FormsDataManager';
import type { SubmissionStatus } from '../managers/FormsDataManager';

export default function adminRoutes(engine: WikiEngine, _addon: FormsAddon): Router {
  const router = Router();

  function fdm(): FormsDataManager | undefined {
    return engine.getManager<FormsDataManager>('FormsDataManager');
  }

  // ── GET /admin/forms ───────────────────────────────────────────────────────
  router.get('/', (req: Request, res: Response) => {
    void (async () => {
      try {
        const ctx = ApiContext.from(req, engine);
        ctx.requireAuthenticated();
        ctx.requireRole('admin');

        const m = fdm();
        const definitions = m?.getAllDefinitions() ?? [];

        const formsWithCounts = await Promise.all(
          definitions.map(async (form) => ({
            ...form,
            submissionCount: await m!.getSubmissionCount(form.id),
          }))
        );

        res.render('forms-admin', {
          currentUser: req.userContext,
          forms: formsWithCounts,
        });
      } catch (err) {
        res.status(500).send(String(err));
      }
    })();
  });

  // ── GET /admin/forms/:formId/submissions ───────────────────────────────────
  router.get('/:formId/submissions', (req: Request, res: Response) => {
    void (async () => {
      try {
        const ctx = ApiContext.from(req, engine);
        ctx.requireAuthenticated();
        ctx.requireRole('admin');

        const m = fdm();
        const form = m?.getDefinition(req.params.formId);
        if (!form) { res.status(404).send('Form not found'); return; }

        const status = typeof req.query['status'] === 'string' ? req.query['status'] : undefined;
        let submissions = await m!.getSubmissions(req.params.formId);
        if (status) submissions = submissions.filter(s => s.status === status);

        res.render('forms-submissions', {
          currentUser: req.userContext,
          form,
          submissions,
          filterStatus: status ?? 'all',
        });
      } catch (err) {
        res.status(500).send(String(err));
      }
    })();
  });

  // ── GET /admin/forms/:formId/submissions/:submissionId ─────────────────────
  router.get('/:formId/submissions/:submissionId', (req: Request, res: Response) => {
    void (async () => {
      try {
        const ctx = ApiContext.from(req, engine);
        ctx.requireAuthenticated();
        ctx.requireRole('admin');

        const m = fdm();
        const form = m?.getDefinition(req.params.formId);
        if (!form) { res.status(404).send('Form not found'); return; }

        const submissions = await m!.getSubmissions(req.params.formId);
        const submission = submissions.find(s => s.id === req.params.submissionId);
        if (!submission) { res.status(404).send('Submission not found'); return; }

        res.render('forms-submission-detail', {
          currentUser: req.userContext,
          form,
          submission,
        });
      } catch (err) {
        res.status(500).send(String(err));
      }
    })();
  });

  // ── POST /admin/forms/:formId/submissions/:submissionId/status ─────────────
  router.post('/:formId/submissions/:submissionId/status', (req: Request, res: Response) => {
    void (async () => {
      try {
        const ctx = ApiContext.from(req, engine);
        ctx.requireAuthenticated();
        ctx.requireRole('admin');

        const body = req.body as Record<string, unknown>;
        const status = typeof body['status'] === 'string' ? body['status'] as SubmissionStatus : undefined;
        if (!status || !['pending', 'processed', 'rejected'].includes(status)) {
          res.status(400).json({ ok: false, error: 'Invalid status' });
          return;
        }

        const notes = typeof body['notes'] === 'string' ? body['notes'] : undefined;
        const m = fdm();
        const updated = await m?.updateStatus(req.params.submissionId, req.params.formId, status, notes);

        if (!updated) { res.status(404).json({ ok: false, error: 'Submission not found' }); return; }
        res.json({ ok: true });
      } catch (err) {
        res.status(500).json({ ok: false, error: String(err) });
      }
    })();
  });

  return router;
}
