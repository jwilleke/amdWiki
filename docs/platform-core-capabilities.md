# amdWiki Core Platform Capabilities

This document describes what amdWiki provides **out of the box** to anyone who clones and extends it.
These are things you do **not** need to build — they are fully implemented, tested, and production-ready.

## Content Management

### Pages

- Create, read, update, delete wiki pages
- File-based storage — plain Markdown files, no database required
- YAML frontmatter on every page (title, tags, custom fields)
- Automatic slug generation from page title
- Namespace/folder support — pages can be organized as `Section/SubSection/PageName`
- Page rename and move with redirect support
- "What links here" — backlink tracking across all pages
- Page list, recent changes, undefined pages (linked but not yet created)
- Startup pages (auto-created on first run from templates)
- Scales to 14,000+ pages (fast init via `page-index.json`)

### Versioning

- Full version history for every page
- Diff view between any two versions
- Restore to any previous version
- Automatic version metadata: timestamp, author, change summary

### Attachments & Media

- File upload per page
- Image gallery display
- Caption support (displayed instead of filename)
- Sort by date or caption
- Keyword/year browsing of media
- MIME type filtering
- Thumbnail generation (via `sharp`)

## Markup & Rendering

### Markup Language

- Markdown (CommonMark) — the default and primary format
- JSPWiki-flavored extensions:
  - `[{PluginName param='value'}]` — plugin directives
  - `[[PageName]]` and `[[PageName|Link text]]` — wiki links
  - `[[http://example.com|External link]]` — external links
  - Bold `__text__`, italic `''text''`, monospace `{{text}}`
  - Horizontal rules, numbered and bulleted lists
  - Tables

### Rendering Pipeline

- Extensible handler chain — each markup construct is a registered handler
- Plugin execution during page render (see Plugin System below)
- Variable substitution (`%PAGENAME%`, `%CURRENTUSER%`, etc.)
- Link resolution with broken-link detection
- XSS-safe output — all user content is sanitized

### Plugin System

- `[{PluginName param='value'}]` syntax invokes a plugin during page render
- Server-side — output is HTML, not client-side JavaScript
- Built-in plugins:
  - `CurrentTime` — formatted date/time with locale and timezone support
  - `Location` — embedded map preview from lat/lon coordinates
  - `Search` — full-text search widget
  - `Index` — page index / table of contents generation
  - `Media` — media gallery display
  - `Counter` — page view counter
  - `RecentChanges` — recent edits list
  - `UndefinedPages` — pages linked but not yet created
  - And more — see `plugins/` directory
- Add your own: drop a `.ts` or `.js` file in `plugins/` and it is auto-discovered
- Or register programmatically from an add-on (see Add-on System)

## Search

- Full-text Lunr search across all page content and metadata
- Indexed fields: title, body, tags, frontmatter
- Search results with relevance scoring
- Advanced search (field-specific queries)
- Configurable result count
- Pluggable `SearchProvider` interface — swap Lunr for Elasticsearch or any other backend
- Real-time index update on page save (no rebuild required for individual page changes)

## User Management & Authentication

### Users

- Local user accounts (username + bcrypt-hashed password)
- User profiles
- Session-based authentication with configurable timeout
- Self-registration (enable/disable via config)
- Password change

### Roles & Permissions (ACL)

- Arbitrary named roles (e.g., `Admin`, `Editor`, `unit-04`, `board`)
- Multiple roles per user
- Role assignment via admin panel
- Page-level ACL policies: READ, WRITE, DELETE per role or user
- Namespace-level ACL: policies applied to all pages under a prefix
- Deny rules (explicit deny overrides allow)
- Anonymous access support (public pages)
- Admin-only bypass for maintenance operations

### Security

- CSRF protection on all forms
- XSS-safe rendering
- Rate limiting (configurable)
- Maintenance mode (admin-only access during upgrades)
- Audit trail for all write operations

## Admin Panel

- Dashboard: page count, user count, system health
- User management: create, edit, disable users; assign roles
- Role management: create, rename, delete roles
- System settings: view configuration, change theme
- Maintenance mode toggle
- Export and backup controls

## Theme System

- `themes/core.css` — all structural CSS, shared across all themes
- Per-theme CSS custom property overrides (`themes/<name>/css/variables.css`)
- Per-theme logo and favicon (`themes/<name>/assets/`)
- Light mode, dark mode, and system-preference mode via CSS variables
- Admin UI theme switcher (requires restart to apply)
- Available themes listed automatically from `themes/` directory
- Add a new theme: create a folder with `theme.json` and `css/variables.css` — no code changes

## Export & Import

- Full wiki export (all pages + attachments) as a zip archive
- Per-page export
- Markdown import
- `ImportManager` API usable from scripts (e.g., bulk content migration)

## Backup & Restore

- Full backup via `BackupManager` (triggered from admin panel or API)
- Restore from backup
- Backup coverage: pages, attachments, user data, config, search index, versions
- Add-on managers can hook into the backup lifecycle via `BaseManager.backup()` / `restore()`

## Infrastructure & Operations

### Configuration

- `ConfigurationManager` — layered config (defaults → environment → instance overrides)
- All settings under `amdwiki.*` namespace
- Runtime overrides persist across restarts via `app-custom-config.json`
- `configManager.setProperty(key, value)` — change config at runtime (e.g., from admin UI)
- Type-safe config keys via `src/types/Config.ts`

### Caching

- `CacheManager` — in-memory cache with TTL, available to all managers
- Page render caching (configurable)
- Search result caching (configurable TTL)

### Notifications

- `NotificationManager` — internal event bus
- Managers and add-ons can subscribe to wiki events (page saved, user created, etc.)

### Metrics

- `MetricsManager` — internal counters and timers
- Accessible via admin panel and API

### Audit Logging

- `AuditManager` — records all write operations with user, timestamp, and details
- Pluggable `AuditProvider` interface

### Process Management

- PM2-based via `server.sh` — `./server.sh start|stop|restart`
- Configurable memory ceiling (`PM2_MAX_MEMORY`)
- PID lock file prevents duplicate processes
- Graceful shutdown with manager cleanup in reverse-init order

## Extension Points Summary

These are the four ways to extend amdWiki without modifying core:

| Extension Point | Where | What it enables |
|-----------------|-------|-----------------|
| **Plugins** | `plugins/` or registered from add-on | Custom markup directives — `[{MyPlugin}]` renders HTML during page display |
| **Add-ons** | `addons/<name>/` | Full application modules: custom managers, Express routes, background jobs, lifecycle hooks |
| **Themes** | `themes/<name>/` | Visual customization — CSS variables, logo, favicon |
| **Providers** | Implement interface, swap in config | Replace storage or search backend (PageProvider, SearchProvider, UserProvider, AuditProvider) |

## What You Do NOT Get Out of the Box

These are explicitly **not** in core — they are the things add-on developers build:

- Domain-specific data models (volcano records, unit contacts, product catalog, etc.)
- Domain-specific plugins (infoboxes, maps, faceted search widgets for your data)
- Custom API routes (`/api/your-domain/*`)
- External service integrations (third-party APIs, payment processors, calendars)
- Custom themes beyond the default
- Bulk data importers
- Role seed scripts (you define which roles your app needs)

See also: `docs/amdWiki-as-platform.md` for use-case analysis (Fairways Gen2, Volcano Wiki)
Last updated: 2026-03-22
