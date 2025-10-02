#!/usr/bin/env node
/**
 * Merge config/schedules.json into config/app-default-config.json
 * - Writes/updates:
 *   - _comment_schedules
 *   - amdwiki.schedules.enabled (default true)
 *   - amdwiki.schedules (object of scheduleName -> { name, description, timeZone, rules, exceptions, enabled })
 */
const fs = require('fs-extra');
const path = require('path');

(async () => {
  const root = path.resolve(__dirname, '..');
  const schedulesPath = path.join(root, 'config', 'schedules.json');
  const appDefaultPath = path.join(root, 'config', 'app-default-config.json');

  try {
    if (!(await fs.pathExists(schedulesPath))) {
      console.error('No config/schedules.json found. Nothing to merge.');
      process.exit(1);
    }

    const schedulesJson = await fs.readJson(schedulesPath);
    const cfg = await fs.readJson(appDefaultPath);

    // Ensure root keys
    cfg['_comment_schedules'] ||= 'Access schedules (role/category/default and named definitions)';
    if (typeof cfg['amdwiki.schedules.enabled'] !== 'boolean') {
      cfg['amdwiki.schedules.enabled'] = true;
    }

    // Normalize schedules: add enabled: true default and ensure arrays
    const normalizeSchedule = (s) => {
      const obj = { ...(s || {}) };
      obj.enabled = obj.enabled !== false;
      obj.rules = Array.isArray(obj.rules) ? obj.rules : [];
      obj.exceptions = Array.isArray(obj.exceptions) ? obj.exceptions : [];
      if (typeof obj.name !== 'string') obj.name = '';
      if (typeof obj.description !== 'string') obj.description = '';
      if (typeof obj.timeZone !== 'string') obj.timeZone = 'UTC';
      return obj;
    };

    const existing = cfg['amdwiki.schedules'] || {};
    const merged = { ...existing };

    for (const [name, sched] of Object.entries(schedulesJson || {})) {
      merged[name] = normalizeSchedule({ ...(existing[name] || {}), ...(sched || {}) });
    }

    cfg['amdwiki.schedules'] = merged;

    await fs.writeJson(appDefaultPath, cfg, { spaces: 2 });
    console.log(`Merged ${Object.keys(merged).length} schedules into app-default-config.json`);
  } catch (err) {
    console.error(`Merge failed: ${err.message}`);
    process.exit(2);
  }
})();