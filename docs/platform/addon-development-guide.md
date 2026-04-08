# ngdpbase Add-on Development Guide

> See also: [`docs/ngdp-as-platform.md`](./ngdp-as-platform.md) for platform overview and roadmap.

---

## Prerequisites

- ngdpbase instance running locally (`./server.sh start`)
- Node.js 18+
- A separate Git repository for your add-on (recommended)

---

## 1. Repository Setup

Create a new repo (e.g. `github.com/you/my-addon`) with this layout:

```
my-addon-repo/
└── addons/
    └── my-addon/
        ├── index.js          ← required entry point
        ├── managers/
        ├── routes/
        ├── plugins/
        ├── pages/            ← wiki pages seeded into the instance on startup
        ├── public/           ← static assets (CSS, JS, images)
        └── README.md
```

The `addons/` subdirectory is what gets wired into ngdpbase via config.
You can host multiple add-ons in one repo under the same `addons/` directory.

Use [`addons/calendar/`](../../addons/calendar/) in the ngdpbase repo as a reference implementation.

---

## 2. Wire into Your Running Instance

Add to `$FAST_STORAGE/config/app-custom-config.json`:

```json
{
  "ngdpbase.managers.addons-manager.addons-path": "/absolute/path/to/my-addon-repo/addons",
  "ngdpbase.addons.my-addon.enabled": true
}
```

Restart the server: `./server.sh restart`

The `AddonsManager` scans the path, finds all subdirectories with `index.js`, and loads the enabled ones in dependency order.

### Multiple Addon Paths

`addons-path` accepts either a single string **or an array of strings**. This lets you mix generic
add-ons (kept in `fairways-base/addons/`) with non-generic ones hosted in separate repositories:

```json
{
  "ngdpbase.managers.addons-manager.addons-path": [
    "./addons",
    "/absolute/path/to/external-addon-repo/addons"
  ],
  "ngdpbase.addons.my-addon.enabled": true,
  "ngdpbase.addons.external-addon.enabled": true
}
```

Each path is scanned in order. If the same addon `name` appears in more than one path, the first
occurrence wins and subsequent duplicates are skipped with a warning in the logs.

**Convention:** keep generic/reusable add-ons in `fairways-base/addons/`; keep site-specific or
private add-ons in their own external repo and reference that path in the array.

---

## 3. The AddonModule Interface

Your `index.js` must export an object (or `module.exports =` in CommonJS):

```javascript
/** @type {import('../src/managers/AddonsManager').AddonModule} */
module.exports = {
  name: 'my-addon',          // must match folder name and config key
  version: '1.0.0',
  description: 'What this add-on does',
  author: 'Your Name',
  dependencies: [],           // names of other add-ons that must load first

  async register(engine, config) {
    // Called at startup if enabled. Mount routes, init data, register plugins.
  },

  async status() {
    // Optional. Called by /admin/addons for health display.
    return { healthy: true, message: 'OK' };
  },

  async shutdown() {
    // Optional. Called on graceful server shutdown.
  }
};
```

### The `config` parameter

`config` contains everything under `ngdpbase.addons.my-addon.*` in the instance config:

```json
{
  "ngdpbase.addons.my-addon.enabled": true,
  "ngdpbase.addons.my-addon.dataPath": "./data/my-addon",
  "ngdpbase.addons.my-addon.apiKey": "..."
}
```

```javascript
async register(engine, config) {
  const dataPath = config.dataPath || './data/my-addon';
}
```

---

## 4. Using the Engine

### Access a Manager

```javascript
const pageManager = engine.getManager('PageManager');
const pages = await pageManager.getAllPages();
```

Core manager names: `PageManager`, `UserManager`, `ACLManager`, `AttachmentManager`,
`SearchManager`, `RenderingManager`, `PluginManager`, `ConfigurationManager`,
`AuditManager`, `CacheManager`, `BackgroundJobManager`, `NotificationManager`,
`MediaManager` *(may be null if not enabled)*.

### Mount Express Routes

```javascript
const path = require('path');

async register(engine, config) {
  const app = engine.app;

  // Serve static assets (add-on public/ folder)
  app.use('/addons/my-addon', require('express').static(
    path.join(__dirname, 'public')
  ));

  // API routes
  const apiRouter = require('./routes/api');
  app.use('/api/my-addon', apiRouter(engine, config));
}
```

> **Note:** When your add-on lives in an external repo, the core's automatic static
> serving at `/addons/...` only covers the ngdpbase `addons/` directory. You must
> mount your own static middleware in `register()` as shown above.

### Register Plugins

```javascript
async register(engine, config) {
  const pluginManager = engine.getManager('PluginManager');
  const MyPlugin = require('./plugins/MyPlugin');
  await pluginManager.registerPlugin('MyPlugin', MyPlugin);
}
```

Registered plugins are then available in wiki page markup as `[{MyPlugin param='value'}]`.

### Register Stylesheets

```javascript
async register(engine, config) {
  const addonsManager = engine.getManager('AddonsManager');
  addonsManager.registerStylesheet('/addons/my-addon/css/style.css', 'my-addon');
}
```

The URL is injected into every page's `<head>` via `res.locals.addonStylesheets`.
Make sure the path is served (see static middleware above or `addons/` core serving).

### Seed Wiki Pages

Place `.md` files in your add-on's `pages/` directory. `AddonsManager` will copy them into the instance's pages directory automatically on startup.

#### When does seeding run?

Seeding runs once per addon per server startup, inside `AddonsManager.loadAddon()`, immediately after the addon's `register()` function completes. It is **not** triggered by install events or file-system watchers — a server restart is required to seed new pages.

#### UUID requirements

Each seed page **must** have a valid UUID v4 in its frontmatter `uuid` field. The destination filename in the instance pages directory is always `{uuid}.md` — the source filename is ignored.

```markdown
---
title: My Addon Home
uuid: 4a266851-f3cd-4ba6-bbbe-5a408f3adf72
slug: my-addon-home
system-category: addon
addon: my-addon
author: my-addon
---

Welcome to my add-on.
```

Generate a UUID: `node -e "console.log(require('crypto').randomUUID())"`

If the `uuid` field is missing or does not match the UUID v4 format, the file is **skipped with a warning** and not seeded. Pages with invalid UUIDs are never written to disk.

#### Idempotency — existing pages are never overwritten

If `{uuid}.md` already exists in the instance pages directory, the seed file is silently skipped. This means:

- User edits to seeded pages survive restarts.
- Re-running the server never clobbers existing content.
- To force a re-seed of a page, delete `{uuid}.md` from the instance pages directory and restart.

#### Auto-set frontmatter fields

`AddonsManager` adds two frontmatter fields to every seeded page:

| Field | Value | Notes |
|-------|-------|-------|
| `addon` | the addon's name | Always set to the loading addon's name |
| `system-category` | `addon` | Only set if not already present in the source file |

#### Cross-addon UUID conflicts

If `{uuid}.md` exists and its `addon` frontmatter field names a **different** addon, `AddonsManager` logs a warning and skips the incoming page. The existing file is never overwritten. This protects against two addons accidentally shipping pages with the same UUID.

```
[AddonsManager] Page conflict: my-addon/pages/home.md skipped — already seeded by addon 'other-addon' (…/pages/{uuid}.md)
```

Use a freshly generated UUID for every seed page to avoid conflicts.

#### Admin reseed

There is currently no admin UI or API endpoint to trigger a reseed. To re-seed a deleted or missing page, delete the corresponding `{uuid}.md` file from the instance pages directory and restart the server. A dedicated admin reseed endpoint (`POST /admin/addons/:addonName/reseed`) is a planned future enhancement (see GitHub issue #442).

#### Overriding the Left Menu and Footer

Two special slugs let an add-on replace the instance-wide navigation and footer without editing system pages:

| File | Slug | Replaces |
|------|------|----------|
| `pages/left-menu-content.md` | `left-menu-content` | `LeftMenu` required page |
| `pages/footer-content.md` | `footer-content` | `Footer` required page |

When the server renders any page it checks for `left-menu-content` first; if found, it is used instead of `LeftMenu`. Same for `footer-content` vs `Footer`. This means an add-on can ship its own navigation without touching the core system pages.

Example `left-menu-content.md`:

```markdown
---
title: Left Menu Content
uuid: 0c0cb715-a46c-4a91-9189-9e05b7f9e95f
slug: left-menu-content
system-category: addon
addon: my-addon
author: my-addon
---
- <a href="/"><i class="fas fa-home"></i> Home</a>
- <a href="/search"><i class="fas fa-search"></i> Search</a>
- [My Feature One]
- [My Feature Two]
- [Recent Changes]
```

Example `footer-content.md`:

```markdown
---
title: Footer Content
uuid: 2b04424b-5541-41e5-b85c-dee161f66945
slug: footer-content
system-category: addon
addon: my-addon
author: my-addon
---
<small>**[{$applicationname}]** v[{$version}] | Powered by my-addon</small>
```

---

### Register an Optional Capability

Capability flags gate admin panel sections so disabled features are invisible, not broken.

```javascript
async register(engine, config) {
  engine.setCapability('my-addon', true);
}
```

Guard admin panel EJS sections:

```ejs
<% if (capabilities && capabilities['my-addon']) { %>
  <!-- my-addon admin section -->
<% } %>
```

---

## 5. Writing a Plugin

Plugins execute server-side during page render and return an HTML string.

```javascript
// plugins/MyPlugin.js
module.exports = {
  name: 'MyPlugin',

  /**
   * @param {object} context  - { engine, pageName, wikiContext }
   * @param {object} params   - key/value pairs from [{MyPlugin key='value'}]
   * @returns {string}        - HTML fragment
   */
  execute(context, params) {
    const myManager = context.engine.getManager('MyDataManager');
    const id = params.id || '';
    const record = myManager?.getById(id);
    if (!record) return `<span class="error">Not found: ${id}</span>`;
    return `<div class="my-widget">${record.name}</div>`;
  }
};
```

Invoked in wiki markup: `[{MyPlugin id='42' style='compact'}]`

---

## 6. Writing a Manager

Managers hold domain data and business logic. For an add-on a manager is just a plain
class — it does not need to extend `BaseManager` unless you want lifecycle hooks
(`initialize`, `shutdown`, `backup`, `restore`).

```javascript
// managers/MyDataManager.js
class MyDataManager {
  constructor(dataPath) {
    this.dataPath = dataPath;
    this.records = new Map();
  }

  async load() {
    // load from JSON file, SQLite, etc.
  }

  getById(id) {
    return this.records.get(id);
  }
}

module.exports = MyDataManager;
```

Register it in `register()` so plugins and routes can retrieve it:

```javascript
async register(engine, config) {
  const MyDataManager = require('./managers/MyDataManager');
  const mgr = new MyDataManager(config.dataPath || './data/my-addon');
  await mgr.load();
  engine.registerManager('MyDataManager', mgr);
}
```

---

## 7. Writing Routes

### ApiContext — authentication and authorisation

All addon API routes **MUST** use `ApiContext` for any route that restricts access.
All addon API routes **SHOULD** use `ApiContext` even for public routes — it gives you
caller identity for free and establishes a consistent pattern.

Do **not** access `req.userContext`, `req.session`, or `req.session.isAuthenticated` directly
in route handlers. `ApiContext` wraps these correctly and handles TypeScript typing.

**`ApiContext.from()` always succeeds — it never throws for anonymous callers.**
On an unauthenticated request it returns a context with `isAuthenticated: false`,
`username: 'Anonymous'`, and `roles: ['Anonymous', 'All']`. The guard methods
(`requireAuthenticated`, `requireRole`) are opt-in — a public route simply does not call them:

```typescript
// Fully public route — no guards, but ApiContext still used for consistency
// and in case you need ctx.isAuthenticated for conditional behaviour
router.get('/feed.ics', async (req, res) => {
  const ctx = ApiContext.from(req, engine); // safe for anonymous callers
  // ctx.isAuthenticated, ctx.username etc. available if needed
  const events = await mgr.query({ calendarId: 'events' });
  res.type('text/calendar').send(generateIcs(events));
});
```

```typescript
// routes/api.ts
import express from 'express';
import { ApiContext, ApiError } from '../../../src/context/ApiContext';
import type { WikiEngine } from '../../../src/types/WikiEngine';

export default function apiRoutes(engine: WikiEngine, _config: Record<string, unknown>) {
  const router = express.Router();

  // Public route — SHOULD use ApiContext for consistent caller identity
  router.get('/search', async (req, res) => {
    try {
      const ctx = ApiContext.from(req, engine);
      const mgr = engine.getManager('MyDataManager');
      const q = String(req.query.q || '');
      const results = await mgr.search(q);
      // Optionally filter results based on ctx.isAuthenticated or ctx.roles
      res.json({ results });
    } catch (err) {
      if (err instanceof ApiError) return res.status(err.status).json({ error: err.message });
      res.status(500).json({ error: String(err) });
    }
  });

  // Protected route — MUST use ApiContext
  router.post('/items', async (req, res) => {
    try {
      const ctx = ApiContext.from(req, engine);
      ctx.requireAuthenticated();            // → 401 if not logged in
      ctx.requireRole('admin', 'editor');    // → 403 if neither role

      const mgr = engine.getManager('MyDataManager');
      const item = await mgr.create(req.body);
      res.status(201).json(item);
    } catch (err) {
      if (err instanceof ApiError) return res.status(err.status).json({ error: err.message });
      res.status(500).json({ error: String(err) });
    }
  });

  return router;
}
```

### ApiContext reference

| Method / Property | Description |
|---|---|
| `ApiContext.from(req, engine)` | Build from an Express request — always succeeds |
| `ctx.isAuthenticated` | `true` if caller has an active session |
| `ctx.username` | Caller's username, or `null` for anonymous |
| `ctx.roles` | Caller's role array — always an array, never undefined |
| `ctx.email` | Caller's email, or `null` |
| `ctx.hasRole(...roles)` | Returns `true` if caller has at least one of the given roles |
| `ctx.requireAuthenticated()` | Throws `ApiError(401)` if not authenticated |
| `ctx.requireRole(...roles)` | Throws `ApiError(403)` if no matching role |
| `ctx.engine` | Reference to the wiki engine |

`ApiError` carries a `status` number — catch it and forward to `res.status(err.status)`.

---

## 8. Background Jobs

Register a job so the admin panel can trigger and monitor it:

```javascript
async register(engine, config) {
  const jobManager = engine.getManager('BackgroundJobManager');
  if (jobManager) {
    jobManager.registerJob({
      id: 'my-addon-reindex',
      displayName: 'My Addon — Reindex',
      async run(reportProgress) {
        reportProgress({ percent: 0, message: 'Starting...' });
        // ... do work ...
        reportProgress({ percent: 100, message: 'Done' });
      }
    });
  }
}
```

---

## 9. Dependency Example

If your add-on requires another to be loaded first:

```javascript
module.exports = {
  name: 'volcano-maps',
  dependencies: ['volcano-wiki'],   // volcano-wiki loads before volcano-maps
  async register(engine, config) {
    const volcanoMgr = engine.getManager('VolcanoDataManager');
    // ...
  }
};
```

`AddonsManager` resolves load order via topological sort. It will error at startup if a
declared dependency is not installed or not enabled.

---

## 10. Development Workflow

1. Edit files in your add-on repo (plain JS — no compile step needed)
2. `./server.sh restart` to pick up changes
3. Check logs: `pm2 logs` or `./server.sh logs`
4. Visit `/admin` → Add-ons section to verify load status and `status()` output

For faster iteration on routes/logic without full restart, you can temporarily
`require()` your module inside a route handler and `delete require.cache[...]` —
but a restart is the reliable path.

### Contributing Core Improvements Upstream

If you discover a missing API or bug in the core during add-on development:

1. Fix it in the `ngdpbase` repo
2. Commit and restart
3. Continue add-on development

Keep core PRs self-contained — no add-on-specific code in the core repo.

---

## 11. Add-on Checklist

- [ ] `name` in `index.js` matches the folder name and config key
- [ ] `"ngdpbase.addons.my-addon.enabled": true` in instance config
- [ ] `addons-path` in instance config points to the repo's `addons/` directory (string or array of strings)
- [ ] Static assets mounted via `engine.app.use()` in `register()`
- [ ] `engine.setCapability('my-addon', true)` called if you have admin UI sections
- [ ] `status()` returns `{ healthy: bool }` for admin health display
- [ ] `shutdown()` closes any open connections or file handles
- [ ] Dependencies declared in `dependencies[]` if your add-on relies on another
- [ ] Seed pages in `pages/` use real UUID v4 filenames and matching `uuid` frontmatter
- [ ] `pages/left-menu-content.md` and `pages/footer-content.md` present if the add-on owns the UI chrome

---

## Related

| Resource | Contents |
|----------|----------|
| [`addons/calendar/`](../../addons/calendar/) | Event calendar with FullCalendar UI — reference implementation |
| [`docs/platform/ngdp-as-platform.md`](./ngdp-as-platform.md) | Platform overview, use-case analysis, roadmap |
| [`docs/platform/platform-core-capabilities.md`](./platform-core-capabilities.md) | All built-in managers and APIs |
| [AddonsManager source](../src/managers/AddonsManager.ts) | Discovery, loading, lifecycle implementation |

---

Last updated: 2026-04-05
