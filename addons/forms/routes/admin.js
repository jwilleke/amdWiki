'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = adminRoutes;
const express_1 = require("express");
const ApiContext_1 = require("../../../dist/src/context/ApiContext");
function adminRoutes(engine, _addon) {
    const router = (0, express_1.Router)();
    function fdm() {
        return engine.getManager('FormsDataManager');
    }
    // ── GET /admin/forms ───────────────────────────────────────────────────────
    router.get('/', (req, res) => {
        void (async () => {
            try {
                const ctx = ApiContext_1.ApiContext.from(req, engine);
                ctx.requireAuthenticated();
                ctx.requireRole('admin');
                const m = fdm();
                const definitions = m?.getAllDefinitions() ?? [];
                const formsWithCounts = await Promise.all(definitions.map(async (form) => ({
                    ...form,
                    submissionCount: await m.getSubmissionCount(form.id)
                })));
                res.render('forms-admin', {
                    currentUser: req.userContext,
                    forms: formsWithCounts,
                    query: req.query
                });
            }
            catch (err) {
                res.status(500).send(String(err));
            }
        })();
    });
    // ── GET /admin/forms/:formId/submissions ───────────────────────────────────
    router.get('/:formId/submissions', (req, res) => {
        void (async () => {
            try {
                const ctx = ApiContext_1.ApiContext.from(req, engine);
                ctx.requireAuthenticated();
                ctx.requireRole('admin');
                const m = fdm();
                const form = m?.getDefinition(String(req.params['formId']));
                if (!form) {
                    res.status(404).send('Form not found');
                    return;
                }
                const status = typeof req.query['status'] === 'string' ? req.query['status'] : undefined;
                let submissions = await m.getSubmissions(String(req.params['formId']));
                if (status)
                    submissions = submissions.filter(s => s.status === status);
                res.render('forms-submissions', {
                    currentUser: req.userContext,
                    form,
                    submissions,
                    filterStatus: status ?? 'all'
                });
            }
            catch (err) {
                res.status(500).send(String(err));
            }
        })();
    });
    // ── GET /admin/forms/:formId/submissions/:submissionId ─────────────────────
    router.get('/:formId/submissions/:submissionId', (req, res) => {
        void (async () => {
            try {
                const ctx = ApiContext_1.ApiContext.from(req, engine);
                ctx.requireAuthenticated();
                ctx.requireRole('admin');
                const m = fdm();
                const form = m?.getDefinition(String(req.params['formId']));
                if (!form) {
                    res.status(404).send('Form not found');
                    return;
                }
                const submissions = await m.getSubmissions(String(req.params['formId']));
                const submission = submissions.find(s => s.id === String(req.params['submissionId']));
                if (!submission) {
                    res.status(404).send('Submission not found');
                    return;
                }
                res.render('forms-submission-detail', {
                    currentUser: req.userContext,
                    form,
                    submission
                });
            }
            catch (err) {
                res.status(500).send(String(err));
            }
        })();
    });
    // ── POST /admin/forms/:formId/submissions/:submissionId/status ─────────────
    router.post('/:formId/submissions/:submissionId/status', (req, res) => {
        void (async () => {
            try {
                const ctx = ApiContext_1.ApiContext.from(req, engine);
                ctx.requireAuthenticated();
                ctx.requireRole('admin');
                const body = req.body;
                const status = typeof body['status'] === 'string' ? body['status'] : undefined;
                if (!status || !['pending', 'processed', 'rejected'].includes(status)) {
                    res.status(400).json({ ok: false, error: 'Invalid status' });
                    return;
                }
                const notes = typeof body['notes'] === 'string' ? body['notes'] : undefined;
                const m = fdm();
                const updated = await m?.updateStatus(String(req.params['submissionId']), String(req.params['formId']), status, notes);
                if (!updated) {
                    res.status(404).json({ ok: false, error: 'Submission not found' });
                    return;
                }
                res.json({ ok: true });
            }
            catch (err) {
                res.status(500).json({ ok: false, error: String(err) });
            }
        })();
    });
    return router;
}
//# sourceMappingURL=admin.js.map