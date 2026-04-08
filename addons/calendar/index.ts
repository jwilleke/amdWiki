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
 * Markup directives:
 *   [{Calendar}]
 *   [{Calendar view='timeGridWeek'}]
 *   [{Calendar calendarId='events' height='500'}]
 *   [{MarqueePlugin fetch='CalendarDataManager.toMarqueeText(calendarId=events,days=30)'}]
 */

import * as path from 'path';
import * as express from 'express';
import type { WikiEngine } from '../../src/types/WikiEngine';
import type { AddonStatusDetails } from '../../src/managers/AddonsManager';
import type PluginManager from '../../src/managers/PluginManager';
import type AddonsManager from '../../src/managers/AddonsManager';
import CalendarDataManager from './managers/CalendarDataManager';
import CalendarPlugin from './plugins/CalendarPlugin';
import apiRoutes from './routes/api';

let dataManager: CalendarDataManager | null = null;

const calendarAddon = {
  name: 'calendar',
  version: '2.0.0',
  description: 'Event calendar with FullCalendar UI and RFC 5545 support',
  author: '',
  dependencies: [] as string[],

  /**
   * Called at startup when the add-on is enabled.
   */
  async register(engine: WikiEngine, config: Record<string, unknown>): Promise<void> {
    // ── 1. Initialize data manager ───────────────────────────────────────────
    const dataPath = typeof config['dataPath'] === 'string'
      ? config['dataPath']
      : './data/calendar';
    dataManager = new CalendarDataManager(dataPath);
    await dataManager.load();
    engine.registerManager('CalendarDataManager', dataManager);

    // ── 2. Register markup plugin ────────────────────────────────────────────
    const pluginManager = engine.getManager<PluginManager>('PluginManager');
    if (pluginManager) {
      await pluginManager.registerPlugin('Calendar', CalendarPlugin);
    }

    // ── 3. Serve static assets ───────────────────────────────────────────────
    engine.app?.use(
      '/addons/calendar',
      express.static(path.join(__dirname, 'public'))
    );

    // ── 4. Register stylesheet ───────────────────────────────────────────────
    const addonsManager = engine.getManager<AddonsManager>('AddonsManager');
    if (addonsManager) {
      addonsManager.registerStylesheet('/addons/calendar/css/calendar.css', 'calendar');
    }

    // ── 5. Mount API routes ──────────────────────────────────────────────────
    engine.app?.use('/api/calendar', apiRoutes(engine, config));

    // ── 6. Announce capability ───────────────────────────────────────────────
    engine.setCapability('calendar', true);
  },

  /** Health check — shown in /admin add-ons panel. */
  // eslint-disable-next-line @typescript-eslint/require-await
  async status(): Promise<AddonStatusDetails> {
    const count = dataManager ? dataManager.count() : 0;
    return {
      healthy: true,
      records: count,
      message: `${count} event(s) loaded`
    };
  },

  /** Cleanup on graceful shutdown. */
  // eslint-disable-next-line @typescript-eslint/require-await
  async shutdown(): Promise<void> {
    dataManager = null;
  }
};

export default calendarAddon;
module.exports = calendarAddon;
