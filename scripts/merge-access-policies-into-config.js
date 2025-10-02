#!/usr/bin/env node
/**
 * Merge config/access-policies.json into config/app-default-config.json
 * - Keys created/updated:
 *   - _comment_access_policies
 *   - amdwiki.access.policies.enabled (default: true)
 *   - amdwiki.access.policies (array of policy objects)
 */
const fs = require('fs-extra');
const path = require('path');

(async () => {
  const root = path.resolve(__dirname, '..');
  const policiesPath = path.join(root, 'config', 'access-policies.json');
  const appDefaultPath = path.join(root, 'config', 'app-default-config.json');

  try {
    if (!(await fs.pathExists(policiesPath))) {
      console.error('No config/access-policies.json found. Nothing to merge.');
      process.exit(1);
    }

    const src = await fs.readJson(policiesPath);
    const cfg = await fs.readJson(appDefaultPath);

    const incoming = Array.isArray(src?.policies) ? src.policies : null;
    if (!incoming) {
      console.error('Invalid access-policies.json: missing "policies" array.');
      process.exit(2);
    }

    // Ensure root keys
    cfg['_comment_access_policies'] ||= 'Access control policies';
    if (typeof cfg['amdwiki.access.policies.enabled'] !== 'boolean') {
      cfg['amdwiki.access.policies.enabled'] = true;
    }

    // Merge by policy id (incoming overrides existing)
    const existingArr = Array.isArray(cfg['amdwiki.access.policies']) ? cfg['amdwiki.access.policies'] : [];
    const byId = new Map(existingArr.filter(p => p && p.id).map(p => [p.id, p]));

    for (const p of incoming) {
      if (!p || typeof p !== 'object' || !p.id) continue;
      byId.set(p.id, p);
    }

    // Optional: stable order by priority desc, then id
    const merged = Array.from(byId.values()).sort((a, b) => {
      const pa = Number.isFinite(+a.priority) ? +a.priority : 0;
      const pb = Number.isFinite(+b.priority) ? +b.priority : 0;
      if (pb !== pa) return pb - pa;
      return String(a.id).localeCompare(String(b.id));
    });

    cfg['amdwiki.access.policies'] = merged;

    await fs.writeJson(appDefaultPath, cfg, { spaces: 2 });
    console.log(`Merged ${incoming.length} policies into app-default-config.json (total: ${merged.length}).`);
  } catch (err) {
    console.error(`Merge failed: ${err.message}`);
    process.exit(3);
  }
})();