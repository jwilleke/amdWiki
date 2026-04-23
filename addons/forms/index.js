'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
/**
 * Forms Add-on for ngdpbase
 *
 * Schema-driven forms: define forms as JSON files, render on any wiki page
 * via [{Form id='my-form'}], store submissions, and trigger handler hooks.
 *
 * Configuration keys (in app-custom-config.json):
 *   ngdpbase.addons.forms.enabled     — true/false
 *   ngdpbase.addons.forms.dataPath    — path to forms data directory
 *   ngdpbase.addons.forms.notifyRole  — role to notify on submission (default: admin)
 *
 * Routes:
 *   POST /api/forms/submit/:formId        — submit a form
 *   GET  /api/forms/schema/:formId        — get form definition JSON
 *   GET  /admin/forms                     — list all forms + submission counts
 *   GET  /admin/forms/:formId/submissions — list submissions for a form
 *   GET  /admin/forms/:formId/submissions/:id — view a submission
 *   POST /admin/forms/:formId/submissions/:id/status — update submission status
 *
 * Handler hook:
 *   const formsAddon = engine.getManager('FormsAddon');
 *   formsAddon.registerHandler('my-form', async (submission, context) => {
 *     // ... do work ...
 *     return { ok: true };
 *   });
 */
const path = tslib_1.__importStar(require("path"));
const express = tslib_1.__importStar(require("express"));
const FormsDataManager_1 = tslib_1.__importDefault(require("./managers/FormsDataManager"));
const FormsPlugin_1 = tslib_1.__importDefault(require("./plugins/FormsPlugin"));
const api_1 = tslib_1.__importDefault(require("./routes/api"));
const admin_1 = tslib_1.__importDefault(require("./routes/admin"));
const builder_1 = tslib_1.__importDefault(require("./routes/builder"));
let dataManager = null;
const formsAddon = {
    name: 'forms',
    version: '1.0.0',
    description: 'Generic schema-driven forms — define JSON forms, render on wiki pages, store submissions, trigger hooks',
    author: '',
    dependencies: [],
    _handlers: new Map(),
    registerHandler(formId, handler) {
        this._handlers.set(formId, handler);
        console.info(`[FormsAddon] Handler registered for form: ${formId}`);
    },
    async callHandler(formId, submission, context) {
        const handler = this._handlers.get(formId);
        if (!handler)
            return { ok: true };
        try {
            return await handler(submission, context);
        }
        catch (err) {
            console.error(`[FormsAddon] Handler error for form ${formId}:`, err);
            return { ok: false, error: 'Handler threw an unexpected error' };
        }
    },
    async register(engine, config) {
        const cm = engine.getManager('ConfigurationManager');
        const dataPath = typeof config['dataPath'] === 'string' && config['dataPath'] !== ''
            ? config['dataPath']
            : (cm?.resolveDataPath?.('forms') ?? './data/forms');
        // ── 1. FormsDataManager ──────────────────────────────────────────────────
        dataManager = new FormsDataManager_1.default(engine, dataPath);
        await dataManager.initialize();
        engine.registerManager('FormsDataManager', dataManager);
        // ── 2. Register self as FormsAddon so other addons can call registerHandler
        engine.registerManager('FormsAddon', formsAddon);
        // ── 3. Register markup plugin ────────────────────────────────────────────
        const pluginManager = engine.getManager('PluginManager');
        if (pluginManager) {
            await pluginManager.registerPlugin('Form', FormsPlugin_1.default);
        }
        // ── 4. Serve static assets ───────────────────────────────────────────────
        engine.app?.use('/addons/forms', express.static(path.join(__dirname, 'public')));
        // ── 5. Register stylesheet ───────────────────────────────────────────────
        const addonsManager = engine.getManager('AddonsManager');
        if (addonsManager) {
            addonsManager.registerStylesheet('/addons/forms/css/forms.css', 'forms');
        }
        // ── 6. Register views directory ──────────────────────────────────────────
        const existing = engine.app?.get('views') ?? [];
        engine.app?.set('views', [...[existing].flat(), path.join(__dirname, 'views')]);
        // ── 7. Mount routes ──────────────────────────────────────────────────────
        engine.app?.use('/api/forms',           (0, api_1.default)(engine, formsAddon));
        engine.app?.use('/admin/forms/builder', (0, builder_1.default)(engine));
        engine.app?.use('/admin/forms',         (0, admin_1.default)(engine, formsAddon));
        // ── 8. Announce capability ───────────────────────────────────────────────
        engine.setCapability('forms', true);
    },
    async status() {
        const count = dataManager?.getAllDefinitions().length ?? 0;
        return {
            healthy: true,
            records: count,
            message: `Forms addon active — ${count} form definition${count === 1 ? '' : 's'} loaded`,
        };
    },
    async shutdown() {
        dataManager = null;
        this._handlers.clear();
    },
};
exports.default = formsAddon;
module.exports = formsAddon;
//# sourceMappingURL=index.js.map