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

Copy [`addons/template/`](../addons/template/) from the ngdpbase repo as your starting point.

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

Place `.md` files in your add-on's `pages/` directory. `AddonsManager` seeds them into the instance's `pages/` directory at startup (skipping any page whose slug already exists).

Each page file must use a real UUID v4 as both its filename (`{uuid}.md`) and its `uuid` frontmatter field:

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

```javascript
// routes/api.js
const express = require('express');

/**
 * @param {import('../../../src/types/WikiEngine').WikiEngine} engine
 * @param {Record<string, unknown>} config
 */
module.exports = function apiRoutes(engine, config) {
  const router = express.Router();

  router.get('/search', async (req, res) => {
    try {
      const mgr = engine.getManager('MyDataManager');
      const q = String(req.query.q || '');
      const results = await mgr.search(q);
      res.json({ results });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  return router;
};
```

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
- [ ] `addons-path` in instance config points to the repo's `addons/` directory
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
| [`addons/template/`](../addons/template/) | Starter scaffold — copy and rename |
| [`docs/platform/ngdp-as-platform.md`](./ngdp-as-platform.md) | Platform overview, use-case analysis, roadmap |
| [`docs/platform/platform-core-capabilities.md`](./platform-core-capabilities.md) | All built-in managers and APIs |
| [AddonsManager source](../src/managers/AddonsManager.ts) | Discovery, loading, lifecycle implementation |

---

Last updated: 2026-03-29
