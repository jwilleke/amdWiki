'use strict';

/**
 * ngdpbase Add-on Template
 *
 * Copy this folder to your add-on repo and rename it:
 *   cp -r addons/template /path/to/my-addon-repo/addons/my-addon
 *
 * Then:
 *   1. Rename every occurrence of 'template' / 'Template' to your add-on name
 *   2. Wire into instance config (see README.md)
 *   3. ./server.sh restart
 *
 * @type {import('../../src/managers/AddonsManager').AddonModule}
 */

const path = require('path');
const express = require('express');

const TemplateDataManager = require('./managers/TemplateDataManager');
const TemplatePlugin = require('./plugins/TemplatePlugin');

/** @type {TemplateDataManager | null} */
let dataManager = null;

module.exports = {
  name: 'template',
  version: '1.0.0',
  description: 'Starter template for ngdpbase add-ons',
  author: '',
  dependencies: [],

  /**
   * Called at startup when the add-on is enabled.
   *
   * @param {import('../../src/types/WikiEngine').WikiEngine} engine
   * @param {Record<string, unknown>} config  — keys from ngdpbase.addons.template.*
   */
  async register(engine, config) {
    // ── 1. Initialize domain manager ────────────────────────────────────────
    const dataPath = String(config.dataPath || './data/template');
    dataManager = new TemplateDataManager(dataPath);
    await dataManager.load();
    engine.registerManager('TemplateDataManager', dataManager);

    // ── 2. Register markup plugin ────────────────────────────────────────────
    const pluginManager = engine.getManager('PluginManager');
    if (pluginManager) {
      await pluginManager.registerPlugin('Template', TemplatePlugin);
    }

    // ── 3. Serve static assets ───────────────────────────────────────────────
    //  Files in public/ are served at /addons/template/...
    //  (needed when this add-on lives in an external repo)
    engine.app.use(
      '/addons/template',
      express.static(path.join(__dirname, 'public'))
    );

    // ── 4. Register stylesheet ───────────────────────────────────────────────
    const addonsManager = engine.getManager('AddonsManager');
    if (addonsManager) {
      addonsManager.registerStylesheet(
        '/addons/template/css/template.css',
        'template'
      );
    }

    // ── 5. Mount API routes ──────────────────────────────────────────────────
    const apiRouter = require('./routes/api')(engine, config);
    engine.app.use('/api/template', apiRouter);

    // ── 6. Announce optional capability (gates admin panel sections) ─────────
    engine.setCapability('template', true);
  },

  /**
   * Health check — shown in /admin add-ons panel.
   * @returns {import('../../src/managers/AddonsManager').AddonStatusDetails}
   */
  async status() {
    const count = dataManager ? dataManager.count() : 0;
    return {
      healthy: true,
      records: count,
      message: `${count} record(s) loaded`
    };
  },

  /**
   * Cleanup on graceful shutdown.
   */
  async shutdown() {
    // Close any open handles, flush writes, etc.
    dataManager = null;
  }
};
