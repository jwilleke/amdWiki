# ngdpbase as a Base Platform

This document explores using ngdpbase as a foundation for building next-generation digital sites — beyond a simple wiki — using its Manager, Plugin, and Add-on extension model.

## What ngdpbase Provides Out of the Box

### Content & Storage

- File-based wiki pages (Markdown + YAML frontmatter)
- Full page versioning with diff support
- 14K+ page scale tested (fast-init via `page-index.json`)
- Attachment / media management

### Identity & Access

- User authentication (local accounts, sessions)
- Role-based access control (ACL)
- Admin panel for user + role management
- Configurable self-registration

### Search

- Full-text Lunr search (client-side index)
- Page metadata indexing (title, tags, frontmatter)
- Pluggable `SearchProvider` interface for external engines

### Rendering

- Markdown + JSPWiki-flavored markup parser
- Plugin system for custom markup directives (`[{PluginName param='value'}]`)
- Media gallery, infobox-style plugins already present

### Theming (new in #350)

- `themes/core.css` — structural CSS
- Per-theme CSS variable files
- Logo / favicon per theme
- Admin UI theme switcher

### Infrastructure

- Node.js / Express / TypeScript
- PM2 process management
- Config management with live overrides (`ConfigurationManager`)
- Audit logging
- Export / Import
- Backup / Restore

---

## Extension Architecture

ngdpbase has four extension points, ranging from lightweight to full application-level:

```
┌────────────────────────────────────────────────────────┐
│  THEMES        Visual: colors, logo, favicon            │
│  (themes/)     One CSS variable file per theme          │
├────────────────────────────────────────────────────────┤
│  PLUGINS       Markup-level: [{PluginName}] directives  │
│  (plugins/)    Renders HTML fragment during page load   │
├────────────────────────────────────────────────────────┤
│  ADD-ONS       Application-level: routes, managers,     │
│  (addons/)     databases, lifecycle hooks               │
├────────────────────────────────────────────────────────┤
│  PROVIDERS     Swappable implementations                │
│  (src/providers/) PageProvider, SearchProvider, etc.   │
└────────────────────────────────────────────────────────┘
```

### Plugins — Markup Rendering

**When to use:** Structured data display within a wiki page body (infoboxes, maps, search widgets, lists).

**How they work:**

```typescript
// plugins/MyPlugin.ts
export default {
  name: 'MyPlugin',
  execute(context: PluginContext, params: PluginParams): string {
    const engine = context.engine;
    const myManager = engine.getManager('MyDataManager');
    return `<div class="my-widget">${myManager.getData(params.id)}</div>`;
  }
};
```

**Invoked in page markup:**

```
[{MyPlugin id='42' style='compact'}]
```

**Config key:** `ngdpbase.managers.pluginManager.searchPaths`

### Add-ons — Application Modules

**When to use:** Full business modules needing routes, persistent data, scheduled jobs, or cross-page state.

**Interface:**

```typescript
export const myAddon: AddonModule = {
  name: 'my-addon',
  version: '1.0.0',
  dependencies: [],           // other add-ons required first
  async register(engine, config) {
    const app = engine.expressApp;  // mount Express routes
    const pageManager = engine.getManager('PageManager');
    // initialize database, register routes, etc.
  },
  async shutdown() { /* cleanup */ }
};
```

**Config (app-custom-config.json):**

```json
"ngdpbase.addons.my-addon.enabled": true,
"ngdpbase.addons.my-addon.dataPath": "./data/my-addon"
```

### Providers — Swappable Implementations

**When to use:** Replace core storage or search with a different backend (PostgreSQL pages, Elasticsearch, LDAP users).

Defined interfaces: `PageProvider`, `SearchProvider`, `UserProvider`, `AuditProvider`.

---

## Use Case Analysis

### Use Case 1: Fairways Gen2 — Condo Association Website

**Repo:** [jwilleke/fairways-gen2-website](https://github.com/jwilleke/fairways-gen2-website)
**Goal:** Replace a static site with a dynamic wiki — role-based access per condo unit, private unit folders, contact tracking, Google embeds.

| Need | ngdpbase Mechanism | Notes |
|------|------------------|-------|
| Dynamic wiki pages | Core (PageManager) | Markdown + versioning included |
| Role per unit (unit-01..unit-99) | Core (UserManager + ACL roles) | Roles already support per-page ACL |
| Multiple logins per unit | Core (UserManager) | Multiple users can share a role |
| Private unit folders | Core ACL | Namespace pages under `unit-01/...` |
| Unit contact/address data | Add-on (UnitDataManager) | Lightweight add-on: JSON or SQLite store |
| Google Forms/Sheets embeds | Plugin (`[{Embed url='...'}]`) | ~20-line plugin, already a common pattern |
| Content migration | Import scripts (ImportManager) | Markdown conversion from static HTML |
| Low-cost hosting | No changes needed | Render/Fly.io with pm2 + file storage |

**Verdict:** ngdpbase is a near-perfect fit. Only the unit contact/address tracking requires a small custom add-on. Everything else uses existing core features.

**Minimal custom code needed:**

- `addons/fairways/` — UnitDataManager (address, phone per unit)
- `plugins/EmbedPlugin.ts` — renders an iframe for Google Forms/Sheets URLs
- Custom `themes/fairways/` — site branding

---

### Use Case 2: Volcano Wiki — Scientific Data + Community Wiki

**Issue:** [ngdpbase #357](https://github.com/jwilleke/ngdpbase/issues/357)
**Data source:** [volcano-lists](https://github.com/jwilleke/volcano-lists) — GVP API importer, 2,661 volcanoes, eruptions, activity data
**Goal:** Volcano data platform comparable to volcano.si.edu

| Need | ngdpbase Mechanism | Notes |
|------|------------------|-------|
| 2,661 structured volcano pages | Core (PageManager) | YAML frontmatter links to GVP ID |
| Structured data queries | Add-on (VolcanoDataManager) | Loads `volcanoes.json` into memory |
| Infobox display | Plugin (VolcanoInfoboxPlugin) | Renders structured fields from frontmatter |
| Map view (single volcano) | Plugin (VolcanoMapPlugin) | Extends existing LocationPlugin |
| World map with markers | Plugin (VolcanoMapPlugin) | Leaflet, marker data from VolcanoDataManager |
| Faceted search UI | Plugin (VolcanoSearchPlugin) | Calls `/api/volcano/search` |
| Listings by country/region | Plugin (VolcanoListPlugin) | Dynamic from VolcanoDataManager |
| API routes (/api/volcano/*) | Add-on routes | Registered via `engine.expressApp` |
| Bulk importer (2,661 pages) | Add-on import script | One-time run: `npm run import:volcano` |
| Data refresh | Add-on import script | Updates `volcanoes.json` only; pages unchanged |
| Current eruptions dashboard | Plugin + Add-on | USGS HANS API polling via add-on |
| Community editing | Core (UserManager + ACL) | Standard wiki page editing |
| Photo/gallery | Core (AttachmentManager + MediaPlugin) | Already functional |

**Reuse from volcano-lists:**

- `src/types.ts` → `addons/volcano-wiki/src/types.ts`
- `src/search.ts` → filter/query logic in VolcanoDataManager
- `src/import-api.ts` → `addons/volcano-wiki/import/import-api.ts`

**Add-on structure:**

```
addons/volcano-wiki/
├── index.ts                  ← AddonModule: registers routes + VolcanoDataManager
├── managers/
│   └── VolcanoDataManager.ts ← in-memory volcano queries + eruption lookups
├── routes/
│   └── api.ts                ← GET /api/volcano/search, /facets, /stats, /:id
├── import/
│   └── import-api.ts         ← GVP API → volcanoes.json + page generation
├── data/
│   ├── volcanoes.json        ← 2,661 Holocene/Pleistocene records
│   └── eruptions.json        ← 11,079 eruption records
└── plugins/                  ← registered with PluginManager on init
    ├── VolcanoInfoboxPlugin.ts
    ├── VolcanoSearchPlugin.ts
    ├── VolcanoListPlugin.ts
    └── VolcanoMapPlugin.ts
```

**Verdict:** ngdpbase handles all structural concerns (page storage, search, auth, rendering). The volcano domain logic is fully encapsulated in the add-on. No core modifications required.

---

## What "Base Platform" Means in Practice

The key insight: **ngdpbase provides the horizontal infrastructure; add-ons provide vertical domain logic.**

```
┌──────────────────────────────────────────────────────┐
│  Domain Layer (Add-ons)                               │
│  volcano-wiki/   fairways/   future-addon/            │
├──────────────────────────────────────────────────────┤
│  Presentation Layer (Plugins + Themes)                │
│  VolcanoInfobox   EmbedPlugin   fairways-theme        │
├──────────────────────────────────────────────────────┤
│  Platform Layer (ngdpbase Core)                        │
│  Pages · Users · ACL · Search · Versioning · Admin   │
└──────────────────────────────────────────────────────┘
```

**What you get for free when building on ngdpbase:**

- Page storage and versioning
- User auth + role-based permissions
- Full-text search (Lunr)
- Admin panel
- Markup rendering pipeline (extend with plugins)
- Theme system
- Audit trail
- Backup/restore
- Export/Import

**What you build per-domain:**

- Domain data manager (if structured data beyond pages is needed)
- Domain-specific plugins (infobox, maps, search widgets)
- Domain API routes (if clients need structured data)
- Optional custom theme

---

## Addon Development Model

### Recommended: Separate Repos, External `addonsPath`

Each addon lives in its own GitHub repository, independent of the ngdpbase core. The core repo stays clean; domain-specific code never enters it.

```
jwilleke/ngdpbase          ← core platform (this repo)
jwilleke/volcano-wiki      ← addon repo (separate)
jwilleke/fairways-gen2     ← addon repo (separate, already exists)
```

**Local development layout:**

```
/workspaces/github/
├── ngdpbase/              ← core, always running
├── volcano-wiki/          ← addon under active development
│   └── addons/
│       └── volcano-wiki/  ← the actual addon directory
└── fairways-gen2/
    └── addons/
        └── fairways/
```

**Wire the addon into your running core instance** by pointing `addonsPath` at the external repo in your instance config (`$FAST_STORAGE/config/app-custom-config.json`):

```json
{
  "ngdpbase.managers.addonsManager.addonsPath": "/path/to/volcano-wiki/addons"
}
```

Restart the server. `AddonsManager` discovers and loads any enabled addon found in that directory. No changes to the core repo required.

**Enable the addon:**

```json
{
  "ngdpbase.addons.volcano-wiki.enabled": true
}
```

---

### Contributing Core Improvements Upstream

During addon development you may discover gaps in the core platform — missing APIs, needed hooks, or bugs. The workflow is:

1. Fix the core issue in the `ngdpbase` repo
2. Merge / commit to `ngdpbase`
3. Continue addon development against the improved core

Core PRs should be self-contained — no addon-specific code in the core repo. The addon repo declares its minimum required ngdpbase version (or commit) in its own `README.md`.

---

### Addon Store / Registry — Future

Once two or more addons exist, a lightweight registry makes sense. The simplest first version:

- A `docs/addon-registry.md` in this repo listing known addons with their repo URLs
- Each addon repo uses the GitHub topic tag `ngdpbase-addon` so they are discoverable

A full marketplace (install-from-UI, version pinning, dependency resolution) is out of scope until the addon ecosystem has real traffic.

---

## Practical Considerations

### What Works Well

- **Self-contained add-ons**: all domain code under `addons/<name>/`, no core pollution
- **Plugin registration from add-on**: an add-on can register its own plugins at startup (`PluginManager.registerPlugin(...)`)
- **Config isolation**: `ngdpbase.addons.<name>.*` namespace prevents key collisions
- **Dependency resolution**: add-ons declare `dependencies[]`; engine loads in correct order

### Current Gaps / Future Work

| Gap | Severity | Notes |
|-----|----------|-------|
| Add-on can register plugins, but no documented pattern for this | Medium | Should be documented and tested |
| No add-on marketplace or registry | Low | Out of scope for now |
| No sandboxing — add-ons run in-process | Low | Trusted-source install only |
| Restart required for theme switch | Low | Already noted in #356 |
| `public/css/style.css` and `public/css/plugins/location.css` still exist as orphaned files | Low | Cleanup follow-up after #353 |
| SearchProvider only supports Lunr at scale | Medium | 3GB memory spike for 14K docs |
| No add-on hot-reload | Low | Restart required to enable/disable |

### Recommended Next Steps

1. **Fairways Gen2** — Low complexity, high value proof-of-concept. Build `addons/fairways/` first.
2. **EmbedPlugin** — Generic, reusable across both use cases. Simple 20-line plugin.
3. **Volcano Wiki Phase 1** — Scaffold `addons/volcano-wiki/`, VolcanoDataManager, bulk importer, VolcanoInfoboxPlugin.
4. **Document add-on → plugin registration pattern** — needed before either project gets far.
5. **Close #350 epic** — all sub-issues (#352–#356) are done.

---

Last updated: 2026-03-26 | Related: #350 (Theming), #357 (Volcano Wiki), fairways-gen2-website
