'use strict';

import { Router, type Request, type Response } from 'express';
import { ApiContext } from '../../../dist/src/context/ApiContext';
import type { WikiEngine } from '../../../dist/src/types/WikiEngine';
import type EmailManager from '../../../dist/src/managers/EmailManager';
import type NotificationManager from '../../../dist/src/managers/NotificationManager';
import type ConfigurationManager from '../../../dist/src/managers/ConfigurationManager';
import type FormsAddon from '../index';
import { buildSubmissionValidator } from '../managers/FormsDataManager';
import type FormsDataManager from '../managers/FormsDataManager';

export default function apiRoutes(engine: WikiEngine, addon: FormsAddon): Router {
  const router = Router();

  function fdm(): FormsDataManager | undefined {
    return engine.getManager<FormsDataManager>('FormsDataManager');
  }

  // ── POST /api/forms/submit/:formId ────────────────────────────────────────
  router.post('/submit/:formId', (req: Request, res: Response) => {
    void (async () => {
      try {
        const { formId } = req.params;
        const m = fdm();
        if (!m) { res.status(503).json({ ok: false, error: 'FormsDataManager not available' }); return; }

        const form = m.getDefinition(formId);
        if (!form) { res.status(404).json({ ok: false, error: `Form '${formId}' not found` }); return; }

        // ── 1. Validate submission fields ──────────────────────────────────
        const validator = buildSubmissionValidator(form);
        const body = req.body as Record<string, unknown>;
        const validationResult = validator.safeParse(body);
        if (!validationResult.success) {
          res.status(400).json({ ok: false, error: 'Validation failed', fields: validationResult.error.format() });
          return;
        }

        // ── 2. Time range check ────────────────────────────────────────────
        const startTime = typeof body['startTime'] === 'string' ? body['startTime'] : undefined;
        const endTime   = typeof body['endTime']   === 'string' ? body['endTime']   : undefined;
        if (startTime && endTime && endTime <= startTime) {
          res.status(400).json({ ok: false, error: 'End time must be later than start time' });
          return;
        }

        // ── 3. Build submission ────────────────────────────────────────────
        const ctx = ApiContext.from(req, engine);
        const submittedBy = ctx.username ?? 'anonymous';

        let onBehalfOf: Record<string, string | undefined> | undefined;
        if (form.proxySubmission && body['onBehalfOf'] && typeof body['onBehalfOf'] === 'object') {
          const obo = body['onBehalfOf'] as Record<string, unknown>;
          onBehalfOf = {
            name:    typeof obo['name']    === 'string' ? obo['name']    : undefined,
            email:   typeof obo['email']   === 'string' ? obo['email']   : undefined,
            phone:   typeof obo['phone']   === 'string' ? obo['phone']   : undefined,
            address: typeof obo['address'] === 'string' ? obo['address'] : undefined,
          };
        }

        // ── 4. Save submission ─────────────────────────────────────────────
        const submission = await m.saveSubmission({
          formId,
          submittedAt: new Date().toISOString(),
          submittedBy,
          onBehalfOf,
          data: validationResult.data as Record<string, unknown>,
          status: 'pending',
        });

        // ── 5. Call handler ────────────────────────────────────────────────
        const handlerResult = await addon.callHandler(formId, submission, { engine, req });
        if (!handlerResult.ok) {
          res.status(409).json({ ok: false, error: handlerResult.error ?? 'Handler rejected submission' });
          return;
        }

        // ── 6. Email confirmation (fire-and-forget) ────────────────────────
        const emailManager = engine.getManager<EmailManager>('EmailManager');
        const submitterEmail = typeof body['email'] === 'string'
          ? body['email']
          : onBehalfOf?.email;

        if (emailManager?.isEnabled() && submitterEmail) {
          const subject = `[Submitted] ${form.title}`;
          const text = `Your submission for "${form.title}" was received.\n\nSubmission ID: ${submission.id}`;
          emailManager.sendTo(submitterEmail, subject, text).catch(() => {});
        }

        // ── 7. In-app notification (fire-and-forget) ───────────────────────
        const nm = engine.getManager<NotificationManager>('NotificationManager');
        const notifyRole = form.notifyRole || (
          engine.getManager<ConfigurationManager>('ConfigurationManager')
            ?.getProperty('ngdpbase.addons.forms.notifyRole', 'admin') as string
        );
        if (nm) {
          nm.createNotification({
            type:    'system',
            title:   `New form submission: ${form.title}`,
            message: `Submitted by ${submittedBy}${onBehalfOf?.name ? ` on behalf of ${onBehalfOf.name}` : ''}`,
            level:   'info',
          }).catch(() => {});
        }

        res.status(201).json({ ok: true, submissionId: submission.id });
      } catch (err) {
        console.error('[forms] submit error:', err);
        res.status(500).json({ ok: false, error: 'Internal server error' });
      }
    })();
  });

  // ── GET /api/forms/schema/:formId ─────────────────────────────────────────
  router.get('/schema/:formId', (req: Request, res: Response) => {
    const m = fdm();
    if (!m) { res.status(503).json({ error: 'FormsDataManager not available' }); return; }
    const form = m.getDefinition(req.params.formId);
    if (!form) { res.status(404).json({ error: 'Form not found' }); return; }
    // Strip optionsSource from response; resolved options are server-side only
    res.json(form);
  });

  return router;
}
