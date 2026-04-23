'use strict';

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

import * as path from 'path';
import * as express from 'express';
import type { WikiEngine } from '../../dist/src/types/WikiEngine';
import type { AddonStatusDetails } from '../../dist/src/managers/AddonsManager';
import type PluginManager from '../../dist/src/managers/PluginManager';
import type AddonsManager from '../../dist/src/managers/AddonsManager';
import type ConfigurationManager from '../../dist/src/managers/ConfigurationManager';
import FormsDataManager from './managers/FormsDataManager';
import type { FormSubmission } from './managers/FormsDataManager';
import FormsPlugin from './plugins/FormsPlugin';
import apiRoutes from './routes/api';
import adminRoutes from './routes/admin';
import builderRoutes from './routes/builder';

export interface HandlerResult {
  ok: boolean;
  error?: string;
  [key: string]: unknown;
}

export type FormHandler = (
  submission: FormSubmission,
  context: { engine: WikiEngine; req: unknown }
) => Promise<HandlerResult>;

let dataManager: FormsDataManager | null = null;

const formsAddon = {
  name: 'forms',
  version: '1.0.0',
  description: 'Generic schema-driven forms — define JSON forms, render on wiki pages, store submissions, trigger hooks',
  author: '',
  dependencies: [] as string[],

  _handlers: new Map<string, FormHandler>(),

  registerHandler(formId: string, handler: FormHandler): void {
    this._handlers.set(formId, handler);
    console.info(`[FormsAddon] Handler registered for form: ${formId}`);
  },

  async callHandler(
    formId: string,
    submission: FormSubmission,
    context: { engine: WikiEngine; req: unknown }
  ): Promise<HandlerResult> {
    const handler = this._handlers.get(formId);
    if (!handler) return { ok: true };
    try {
      return await handler(submission, context);
    } catch (err) {
      console.error(`[FormsAddon] Handler error for form ${formId}:`, err);
      return { ok: false, error: 'Handler threw an unexpected error' };
    }
  },

  async register(engine: WikiEngine, config: Record<string, unknown>): Promise<void> {
    const cm = engine.getManager<ConfigurationManager>('ConfigurationManager');
    const dataPath = typeof config['dataPath'] === 'string' && config['dataPath'] !== ''
      ? config['dataPath']
      : (cm?.resolveDataPath?.('forms') ?? './data/forms');

    // ── 1. FormsDataManager ──────────────────────────────────────────────────
    dataManager = new FormsDataManager(engine, dataPath);
    await dataManager.initialize();
    engine.registerManager('FormsDataManager', dataManager);

    // ── 2. Register self as FormsAddon so other addons can call registerHandler
    engine.registerManager('FormsAddon', formsAddon);

    // ── 3. Register markup plugin ────────────────────────────────────────────
    const pluginManager = engine.getManager<PluginManager>('PluginManager');
    if (pluginManager) {
      await pluginManager.registerPlugin('Form', FormsPlugin);
    }

    // ── 4. Serve static assets ───────────────────────────────────────────────
    engine.app?.use('/addons/forms', express.static(path.join(__dirname, 'public')));

    // ── 5. Register stylesheet ───────────────────────────────────────────────
    const addonsManager = engine.getManager<AddonsManager>('AddonsManager');
    if (addonsManager) {
      addonsManager.registerStylesheet('/addons/forms/css/forms.css', 'forms');
    }

    // ── 6. Register views directory ──────────────────────────────────────────
    const existing = (engine.app?.get('views') as string | string[]) ?? [];
    engine.app?.set('views', [...[existing].flat(), path.join(__dirname, 'views')]);

    // ── 7. Mount routes ──────────────────────────────────────────────────────
    engine.app?.use('/api/forms',           apiRoutes(engine, formsAddon));
    engine.app?.use('/admin/forms/builder', builderRoutes(engine));
    engine.app?.use('/admin/forms',         adminRoutes(engine, formsAddon));

    // ── 8. Announce capability ───────────────────────────────────────────────
    engine.setCapability('forms', true);
  },

  async status(): Promise<AddonStatusDetails> {
    const count = dataManager?.getAllDefinitions().length ?? 0;
    return {
      healthy: true,
      records: count,
      message: `Forms addon active — ${count} form definition${count === 1 ? '' : 's'} loaded`
    };
  },

  async shutdown(): Promise<void> {
    dataManager = null;
    this._handlers.clear();
  }
};

export default formsAddon;
module.exports = formsAddon;
