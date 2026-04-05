'use strict';

/**
 * Calendar Add-on for ngdpbase
 *
 * Provides event/calendar management with a FullCalendar UI.
 *
 * Configuration keys (in app-custom-config.json):
 *   ngdpbase.addons.calendar.enabled      — true/false
 *   ngdpbase.addons.calendar.dataPath     — path to JSON event store (default: ./data/calendar)
 *
 * Markup directive:
 *   [{Calendar}]
 *   [{Calendar view='timeGridWeek'}]
 *   [{Calendar calendarId='project-x' height='500'}]
 *
 * @type {import('../../src/managers/AddonsManager').AddonModule}
 */

const path = require('path');
const express = require('express');

const CalendarDataManager = require('./managers/CalendarDataManager');
const CalendarPlugin = require('./plugins/CalendarPlugin');

/** @type {CalendarDataManager | null} */
let dataManager = null;

module.exports = {
  name: 'calendar',
  version: '1.0.0',
  description: 'Event calendar with FullCalendar UI',
  author: '',
  dependencies: [],

  /**
   * Called at startup when the add-on is enabled.
   *
   * @param {import('../../src/types/WikiEngine').WikiEngine} engine
   * @param {Record<string, unknown>} config  — keys from ngdpbase.addons.calendar.*
   */
  async register(engine, config) {
    // ── 1. Initialize data manager ───────────────────────────────────────────
    const dataPath = String(config.dataPath || './data/calendar');
    dataManager = new CalendarDataManager(dataPath);
    await dataManager.load();
    engine.registerManager('CalendarDataManager', dataManager);

    // ── 2. Register markup plugin ────────────────────────────────────────────
    const pluginManager = engine.getManager('PluginManager');
    if (pluginManager) {
      await pluginManager.registerPlugin('Calendar', CalendarPlugin);
    }

    // ── 3. Serve static assets ───────────────────────────────────────────────
    //  Files in public/ are served at /addons/calendar/...
    engine.app.use(
      '/addons/calendar',
      express.static(path.join(__dirname, 'public'))
    );

    // ── 4. Register stylesheet ───────────────────────────────────────────────
    const addonsManager = engine.getManager('AddonsManager');
    if (addonsManager) {
      addonsManager.registerStylesheet(
        '/addons/calendar/css/calendar.css',
        'calendar'
      );
    }

    // ── 5. Mount API routes ──────────────────────────────────────────────────
    const apiRouter = require('./routes/api')(engine, config);
    engine.app.use('/api/calendar', apiRouter);

    // ── 6. Announce capability ───────────────────────────────────────────────
    engine.setCapability('calendar', true);
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
      message: `${count} event(s) loaded`
    };
  },

  /**
   * Cleanup on graceful shutdown.
   */
  async shutdown() {
    dataManager = null;
  }
};
