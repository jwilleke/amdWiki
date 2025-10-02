#!/usr/bin/env node
/**
 * Merge config/holidays.json into config/app-default-config.json
 * - Writes/updates:
 *   - _comment_holidays
 *   - amdwiki.holidays.enabled (default true)
 *   - amdwiki.holidays.dates (object of YYYY-MM-DD -> {name, message, enabled})
 *   - amdwiki.holidays.recurring (object of *-MM-DD -> {name, message, enabled})
 */
const fs = require('fs-extra');
const path = require('path');

(async () => {
  const root = path.resolve(__dirname, '..');
  const holidaysPath = path.join(root, 'config', 'holidays.json');
  const appDefaultPath = path.join(root, 'config', 'app-default-config.json');

  try {
    if (!(await fs.pathExists(holidaysPath))) {
      console.error('No config/holidays.json found. Nothing to merge.');
      process.exit(1);
    }

    const holidays = await fs.readJson(holidaysPath);
    const cfg = await fs.readJson(appDefaultPath);

    const datesIn = holidays?.dates || {};
    const recurringIn = holidays?.recurring || {};

    // Ensure root keys
    cfg['_comment_holidays'] ||= 'Holiday access restrictions and messages';
    cfg['amdwiki.holidays.enabled'] = cfg['amdwiki.holidays.enabled'] !== false;

    const normalizeEntry = (v) => {
      if (!v || typeof v !== 'object') return null;
      return {
        name: typeof v.name === 'string' ? v.name : '',
        message: typeof v.message === 'string' ? v.message : '',
        enabled: v.enabled !== false
      };
    };

    // Merge dates
    const existingDates = cfg['amdwiki.holidays.dates'] || {};
    const mergedDates = { ...existingDates };
    for (const [k, v] of Object.entries(datesIn)) {
      const n = normalizeEntry(v);
      if (n) mergedDates[k] = { ...(existingDates[k] || {}), ...n };
    }
    cfg['amdwiki.holidays.dates'] = mergedDates;

    // Merge recurring
    const existingRecurring = cfg['amdwiki.holidays.recurring'] || {};
    const mergedRecurring = { ...existingRecurring };
    for (const [k, v] of Object.entries(recurringIn)) {
      const n = normalizeEntry(v);
      if (n) mergedRecurring[k] = { ...(existingRecurring[k] || {}), ...n };
    }
    cfg['amdwiki.holidays.recurring'] = mergedRecurring;

    await fs.writeJson(appDefaultPath, cfg, { spaces: 2 });
    console.log(
      `Merged holidays: dates=${Object.keys(mergedDates).length}, recurring=${Object.keys(mergedRecurring).length}`
    );
  } catch (err) {
    console.error(`Merge failed: ${err.message}`);
    process.exit(2);
  }
})();