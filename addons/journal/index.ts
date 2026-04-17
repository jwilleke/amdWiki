'use strict';

/**
 * Journal Add-on for ngdpbase
 *
 * Journal entries are standard wiki pages with system-category: journal.
 * The add-on contributes only what the core wiki cannot:
 *   - [{Journal}] plugin (timeline, streak, on-this-day rendering)
 *   - /api/journal/new — bootstrap a new entry and redirect to /edit/:slug
 *   - /api/journal/entries, /on-this-day, /streak — JSON query endpoints
 *   - /admin/journal — addon configuration panel
 *
 * Configuration keys (in app-custom-config.json):
 *   ngdpbase.addons.journal.enabled               — true/false
 *   ngdpbase.addons.journal.defaultPrivate         — true  (entries private by default)
 *   ngdpbase.addons.journal.defaultAuthorLock      — true  (only author/admin may edit)
 *   ngdpbase.addons.journal.defaultMoodOptions     — ["happy","content",...]
 *   ngdpbase.addons.journal.streakEnabled          — true
 *   ngdpbase.addons.journal.dailyReminderEnabled   — false
 *   ngdpbase.addons.journal.dailyReminderTime      — "20:00"
 *   ngdpbase.addons.journal.dailyReminderUsers     — []
 *
 * API routes:
 *   GET  /api/journal/new          — create blank entry, redirect to /edit/:slug
 *   GET  /api/journal/entries      — JSON list of own entries
 *   GET  /api/journal/on-this-day  — JSON: same MM-DD in prior years
 *   GET  /api/journal/streak       — JSON: { streak, total }
 *
 * Admin:
 *   GET  /admin/journal            — config panel (admin only)
 *   POST /admin/journal/settings   — placeholder save
 *
 * Markup:
 *   [{Journal}]
 *   [{Journal view='timeline' limit='10'}]
 *   [{Journal view='streak'}]
 *   [{Journal view='on-this-day'}]
 */

import * as path from 'path';
import * as express from 'express';
import type { WikiEngine } from '../../dist/src/types/WikiEngine';
import type { AddonStatusDetails } from '../../dist/src/managers/AddonsManager';
import type PluginManager from '../../dist/src/managers/PluginManager';
import type AddonsManager from '../../dist/src/managers/AddonsManager';
import JournalPlugin from './plugins/JournalPlugin';
import apiRoutes from './routes/api';
import adminRoutes from './routes/admin';

const journalAddon = {
  name: 'journal',
  version: '1.0.0',
  description: 'Personal journal — entries are wiki pages with timeline rendering',
  author: '',
  dependencies: [] as string[],

  async register(engine: WikiEngine, config: Record<string, unknown>): Promise<void> {
    // ── 1. Register markup plugin ─────────────────────────────────────────
    const pluginManager = engine.getManager<PluginManager>('PluginManager');
    if (pluginManager) {
      await pluginManager.registerPlugin('Journal', JournalPlugin);
    }

    // ── 2. Serve static assets ─────────────────────────────────────────────
    engine.app?.use(
      '/addons/journal',
      express.static(path.join(__dirname, 'public'))
    );

    // ── 3. Register stylesheet ─────────────────────────────────────────────
    const addonsManager = engine.getManager<AddonsManager>('AddonsManager');
    if (addonsManager) {
      addonsManager.registerStylesheet('/addons/journal/css/journal.css', 'journal');
    }

    // ── 4. Mount routes ────────────────────────────────────────────────────
    engine.app?.use('/api/journal',   apiRoutes(engine, config));
    engine.app?.use('/admin/journal', adminRoutes(engine, config));

    // ── 5. Announce capability ─────────────────────────────────────────────
    engine.setCapability('journal', true);
  },

  // eslint-disable-next-line @typescript-eslint/require-await
  async status(): Promise<AddonStatusDetails> {
    return {
      healthy: true,
      message: 'Journal addon active'
    };
  },

  async shutdown(): Promise<void> {}
};

export default journalAddon;
module.exports = journalAddon;
