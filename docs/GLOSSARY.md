# amdWiki Glossary

Canonical definitions for terms used in code, docs, logs, and agent sessions.
When in doubt, use the term in the "Preferred" column.

---

## Server Lifecycle

### Build (Compile)

Preferred: **Build**
Avoid: "compile", "transpile", "recompile"

Runs `tsc` to convert TypeScript source (`src/`) into JavaScript (`dist/`).
Required after any source code change before the server can run the new code.

```sh
./server.sh stop       # always stop before building (build clears dist/)
npm run build          # runs clean (rm -rf dist) then tsc
./server.sh start      # start after build completes
```

Note: `npm run build` runs `rm -rf dist` as a prebuild step, which crashes a
running PM2 process. Always stop the server first.

### Restart

Preferred: **Restart**

Stops and starts the PM2-managed server process. Does NOT recompile source.
Use after a config change, environment change, or to recover a crashed process.

```sh
./server.sh restart
./server.sh stop
./server.sh start
```

Always use `server.sh`. Never use `kill`, `node app.js`, or direct PM2 commands.
`server.sh` sources `.env`, manages PM2, PID locks, and orphan cleanup.

---

## Storage Layout

amdWiki splits data across two volumes for performance. All config keys are **all lowercase**.

| Term | Env Var | Path (dev) | Contents |
|---|---|---|---|
| Fast Storage | `FAST_STORAGE` | `/Volumes/hd2/jimstest-wiki/data` | users, sessions, logs, config, Page Index, Search Index, Media Index, media thumbnails |
| Slow Storage | `SLOW_STORAGE` | `/Volumes/hd2A/jimstest-wiki/data` | pages (`*.md`), attachments, attachment metadata |
| `dist/` | — | `…/amdWiki/dist/` | compiled JS (output of Build) |
| `src/` | — | `…/amdWiki/src/` | TypeScript source |
| `plugins/` | — | `…/amdWiki/plugins/` | wiki plugin source (compiled to `dist/plugins/`) |
| `config/` | — | `…/amdWiki/config/` | default config (`app-default-config.json`) |

Key config paths (resolved via `ConfigurationManager.getResolvedDataPath()`):

| Config Key | Default Value | Description |
|---|---|---|
| `amdwiki.page.provider.filesystem.storagedir` | `${SLOW_STORAGE}/pages` | wiki page `.md` files |
| `amdwiki.attachment.provider.basic.storagedir` | `${SLOW_STORAGE}/attachments` | attachment binary files |
| `amdwiki.attachment.metadatafile` | `${SLOW_STORAGE}/attachments/attachment-metadata.json` | attachment metadata |
| `amdwiki.page.provider.versioning.indexfile` | `${FAST_STORAGE}/page-index.json` | Page Index |
| `amdwiki.search.provider.lunr.indexdir` | `${FAST_STORAGE}/search-index/` | Search Index |
| `amdwiki.media.index.file` | `${FAST_STORAGE}/media-index.json` | Media Index |
| `amdwiki.managers.pluginManager.searchPaths` | `["./dist/plugins"]` | plugin search paths |

---

## Page Data & Initialization

### Page Index (`page-index.json`)

Preferred: **Page Index** or **`page-index.json`**
Avoid: "page cache file", "index file", "page index file"

The on-disk JSON file that stores metadata for every wiki page (title, slug,
UUID, lastModified, author). Located at `$FAST_STORAGE/page-index.json`.

Used at startup to populate the in-memory Page Cache without a full Directory
Scan. Enables Fast Init (~1s vs ~90s for a full scan).

Updated incrementally on every page save, rename, or delete via a serialized
write queue (prevents race conditions from concurrent page saves).

### Page Cache

Preferred: **Page Cache**
Avoid: "pageCache", "in-memory cache", "page list"

The in-memory `Map<title, PageInfo>` maintained by `VersioningFileProvider` at
runtime. The authoritative source for page existence, titles, and slugs while
the server is running. Populated at startup from the Page Index (Fast Init) or
from a Directory Scan.

`getAllPages()` returns `Array.from(pageCache.keys())` — page titles, sorted.

### Directory Scan

Preferred: **Directory Scan**
Avoid: "scan", "full scan", "NAS scan", "page scan", "rebuilding via directory scan"

Reads every `.md` file in `$SLOW_STORAGE/pages/` from disk to build the Page
Cache from scratch. Happens at startup only when the Page Index is missing or
corrupt. Takes ~90s with 14K+ pages on a NAS-mounted volume.

### Fast Init

Preferred: **Fast Init**
Avoid: "fast-path", "fast startup", "index-based startup"

The normal startup path: loads the Page Index (`page-index.json`) from disk
to populate the Page Cache in ~1s, skipping a Directory Scan.

### Page Index Rebuild

Preferred: **Page Index Rebuild**
Avoid: "reindex pages", "rebuild page index", "refresh index"

Rewrites `page-index.json` from the current Page Cache. Happens automatically
on page save/delete/rename. Not the same as a Search Index Rebuild.

---

## Search

### Search Index

Preferred: **Search Index**
Avoid: "Lunr index", "search-index", "full-text index"

The in-memory Lunr.js full-text index used to power wiki search. Persisted to
disk at `$FAST_STORAGE/search-index/`. Separate from the Page Index.
Provided by `LunrSearchProvider`.

### Search Index Rebuild

Preferred: **Search Index Rebuild**
Avoid: "reindex", "rebuild search", "rebuild Lunr", "build search index"

Rebuilds the Lunr full-text index from all page documents. Triggered
automatically during a full startup Directory Scan, or via an admin action.
With 14K+ documents this causes a ~3GB RAM spike; `max_memory_restart` in
`ecosystem.config.js` must be ≥ 4GB (`PM2_MAX_MEMORY` env var).

---

## Attachments

### Attachment

Preferred: **Attachment**
Avoid: "upload", "file", "asset"

A file uploaded to the wiki and associated with one or more pages. Stored as
`{sha256-hash}{extension}` in `$SLOW_STORAGE/attachments/`. Metadata is in
`attachment-metadata.json` (Schema.org `CreativeWork` format). Served via
`GET /attachments/:attachmentId`.

Private-page attachments are stored in a per-creator subdirectory:
`$SLOW_STORAGE/attachments/private/{creator}/`

Key metadata fields:

- `identifier` — SHA-256 content hash (used as the serving ID)
- `name` — original filename (e.g., `iran-provinces.png`)
- `encodingFormat` — MIME type (e.g., `image/png`)
- `storageLocation` — full filesystem path at time of upload (**may be stale** after data migration; `getAttachment()` derives the actual path from the configured `storageDirectory` instead)
- `mentions` — array of page UUIDs that reference this attachment
- `isPrivate` / `creator` — set when linked to a private page

### Attachment Metadata (`attachment-metadata.json`)

Preferred: **Attachment Metadata** or **`attachment-metadata.json`**

Single JSON file at `$SLOW_STORAGE/attachments/attachment-metadata.json`
containing Schema.org `CreativeWork` records for every attachment. Loaded into
memory at startup by `BasicAttachmentProvider`. The `storageLocation` field
records the path at upload time — after a data migration this may be stale;
`getAttachment()` re-derives the path from the configured storage directory.

### `resolveAttachmentSrc(src, pageName)`

Preferred: **resolveAttachmentSrc** or **attachment resolution**

The canonical method (`AttachmentManager.resolveAttachmentSrc()`) used by all
plugins (ImagePlugin, AttachPlugin, MediaPlugin) to convert a raw `src` value
into a `{ url, mimeType }` pair. Resolution order:

1. **External URL** — `http://` or `https://` → returned as-is, `mimeType: ''`
2. **Absolute path** — starts with `/` → returned as-is, `mimeType: ''`
3. **Current-page lookup** — searches attachments whose `mentions` include `pageName` for an exact filename match
4. **Global filename search** — searches all attachments by exact `name` match

Returns `null` if unresolvable (caller decides how to render the error).

---

## Media

### Media Index (`media-index.json`)

Preferred: **Media Index** or **`media-index.json`**
Avoid: "image index", "photo index"

Persistent JSON index of external media items (photos, videos stored in
configured media folders outside the wiki). Located at
`$FAST_STORAGE/media-index.json`. Used by `MediaManager` and
`FileSystemMediaProvider` for fast lookups without rescanning the filesystem.

Each `MediaItem` record includes: `id` (SHA-256 of file path), `filePath`,
`filename`, `mimeType`, `year` (from EXIF or filename), `eventName` (parsed
from catalog-export filenames in `YYYY-MM-DD-EventName` format),
`linkedPageName`, `isPrivate`, `creator`.

### Media Index Rebuild

Preferred: **Media Index Rebuild** or **media rescan**
Avoid: "rebuild image index", "rescan photos"

Triggers a full re-scan of configured media folders and rewrites
`media-index.json`. Config keys: `amdwiki.media.folders` (paths to scan),
`amdwiki.media.maxdepth` (default 5), `amdwiki.media.ignoredirs`,
`amdwiki.media.ignorefiles`.

**Manual:** `POST /admin/media/rescan` (admin UI: `/admin/media`)
**Automatic:** background timer every `amdwiki.media.scaninterval` ms (default 3600000 = 1 hour)

Internally calls `mediaManager.scanFolders(true)` → `FileSystemMediaProvider.scan(force=true)`.

---

## Plugins

### Plugin

Preferred: **Plugin**
Avoid: "macro", "widget", "extension"

A module that extends wiki rendering via JSPWiki-style syntax:
`[{PluginName param='value'}]`

Plugins are loaded from directories listed in
`amdwiki.managers.pluginManager.searchPaths` (default `["./dist/plugins"]`)
and compiled from `plugins/*.ts` source. Plugin discovery is case-insensitive;
`[{Image}]` and `[{ImagePlugin}]` both resolve to `ImagePlugin`.

**Two plugin shapes:**

- **Object plugin** (preferred): `{ name, execute(context, params), initialize?(engine) }`
- **Function plugin** (legacy): `(pageName, params, linkGraph) => string`

**Built-in plugins:**

| Plugin | Syntax | Description |
|---|---|---|
| `ATTACH` | `[{ATTACH src='file.pdf'}]` | Render attachment inline; images show as clickable thumbnails, other files as download links |
| `Image` | `[{Image src='img.jpg' align='left'}]` | Render image with layout/styling options |
| `AttachmentsPlugin` | `[{AttachmentsPlugin}]` | List all attachments for the current page |
| `MediaPlugin` | `[{MediaPlugin id='...'}]` | Render a media item inline |
| `MediaGallery` | `[{MediaGallery}]` | Display a media gallery |
| `MediaSearch` | `[{MediaSearch}]` | Search media items |
| `CurrentTimePlugin` | `[{CurrentTimePlugin}]` | Display current date/time |
| `CounterPlugin` | `[{CounterPlugin}]` | Increment and display a counter |
| `IndexPlugin` | `[{IndexPlugin}]` | Generate a page index/TOC |
| `LocationPlugin` | `[{LocationPlugin lat='...' lon='...'}]` | Store/display location with GPS map link |
| `RecentChangesPlugin` | `[{RecentChangesPlugin}]` | List recently changed pages |
| `referringPagesPlugin` | `[{referringPagesPlugin}]` | List pages linking to current page |
| `SearchPlugin` | `[{SearchPlugin}]` | Full-text search interface |
| `TotalPagesPlugin` | `[{TotalPagesPlugin}]` | Count total wiki pages |
| `UndefinedPagesPlugin` | `[{UndefinedPagesPlugin}]` | List broken/undefined links |
| `VariablesPlugin` | `[{VariablesPlugin}]` | Expand wiki variables |
| `SessionsPlugin` | `[{SessionsPlugin}]` | Display session information |
| `UptimePlugin` | `[{UptimePlugin}]` | Display wiki uptime |
| `ConfigAccessorPlugin` | `[{ConfigAccessorPlugin}]` | Read configuration values |

---

## Rendering

### WikiContext

Preferred: **WikiContext**
Avoid: "context", "wiki context object", "page context"

Request-scoped object created per HTTP request, providing a single source of
truth for the current operation. Holds `pageName`, `userContext`, `request`,
`response`, engine managers, and the rendering context type.

Context types (static constants on `WikiContext`):
`VIEW`, `EDIT`, `PREVIEW`, `DIFF`, `INFO`, `NONE`

Key methods:

- `renderMarkdown(content)` — render wiki markup to HTML
- `toParseOptions()` — build `ParseContext` options for MarkupParser
- `createWikiContext(req, options)` — factory in `WikiRoutes`

### ParseContext

Preferred: **ParseContext**
Avoid: "parse context", "rendering context"

Immutable-ish object passed through the markup processing pipeline carrying:
`pageName`, `userName`, `userContext`, `requestInfo`, engine reference.
Used by handlers and plugins to access the engine managers (`getManager()`)
and check authentication/permissions during rendering.

### MarkupParser (Advanced Renderer)

Preferred: **MarkupParser** or **advanced renderer**
Avoid: "new parser", "advanced parser", "JSPWiki parser"

Multi-phase markup processing engine (`src/parsers/MarkupParser.ts`).
The primary renderer when available. Handles plugins, variables, wiki links,
tables, attachments, and forms via a priority-ordered set of syntax handlers.

Key handlers (from `src/parsers/handlers/`):

| Handler | Priority | Handles |
|---|---|---|
| `PluginSyntaxHandler` | 90 | `[{PluginName param=value}]` |
| `AttachmentHandler` | 75 | `[{ATTACH ...}]` (legacy handler) |
| `WikiLinkHandler` | — | `[PageName]` and `[text\|PageName]` |
| `WikiTableHandler` | — | `\|\|col\|\|col\|\|` table syntax |
| `WikiStyleHandler` | — | `__bold__`, `''italic''` |
| `VariableSyntaxHandler` | — | `${VARIABLE}` |
| `WikiFormHandler` | — | wiki form syntax |
| `InterWikiLinkHandler` | — | cross-wiki links |

### Legacy Renderer (Showdown)

Preferred: **legacy renderer** or **Showdown fallback**
Avoid: "old parser", "markdown parser"

Fallback renderer used when `MarkupParser` is unavailable. Runs Showdown
(Markdown → HTML) + `VariableManager` variable expansion. No plugin support.
Triggered when `RenderingManager.getParser()` returns null.

---

## Private Pages

### Private Page

Preferred: **private page**

A wiki page accessible only to its creator and admin users. Marked by the
metadata field `system-location: 'private'`; the page creator is stored in
`page-creator` metadata. The page index entry records `location: 'private'`.

Access is enforced in `WikiRoutes.checkPrivatePageAccess()` before rendering,
and in `ACLManager` permission checks. Search results and media items linked
to private pages are filtered by user identity.

Private attachments are stored separately in
`$SLOW_STORAGE/attachments/private/{creator}/` with `isPrivate: true` and
`creator` set in metadata.

---

## Managers & Providers

### Manager

Preferred: **Manager** (e.g., `AttachmentManager`, `PageManager`)
Avoid: "service", "controller", "handler"

Singleton engine components accessed via `engine.getManager('ManagerName')`.
Manage a domain of wiki functionality and delegate storage operations to Providers.

Key managers: `ACLManager`, `AttachmentManager`, `BackupManager`,
`ConfigurationManager`, `MediaManager`, `PageManager`, `PluginManager`,
`RenderingManager`, `SearchManager`, `UserManager`.

### Provider

Preferred: **Provider** (e.g., `BasicAttachmentProvider`, `LunrSearchProvider`)
Avoid: "backend", "driver", "adapter"

Pluggable storage/service implementations selected by Managers. Abstract base
classes (e.g., `BaseAttachmentProvider`, `BasePageProvider`) define the
interface; concrete classes implement it for a specific storage backend.

Key providers: `BasicAttachmentProvider` (attachments), `VersioningFileProvider`
(pages with version history), `LunrSearchProvider` (full-text search),
`FileSystemMediaProvider` (external media scan), `FileUserProvider` (users),
`NodeCacheProvider` / `RedisCacheProvider` (caching).

---

## Quick Reference

| You want to… | Term | Command / Location |
|---|---|---|
| Compile source after a code change | Build | `./server.sh stop && npm run build && ./server.sh start` |
| Reload the server process | Restart | `./server.sh restart` |
| See what pages exist at runtime | Page Cache | `VersioningFileProvider.getAllPages()` |
| Speed up server startup | Fast Init | ensure `$FAST_STORAGE/page-index.json` exists |
| Force rebuild of page metadata file | Page Index Rebuild | automatic on page save; delete `page-index.json` and restart to force |
| Rebuild full-text search | Search Index Rebuild | admin action or restart after deleting `$FAST_STORAGE/search-index/` |
| Rebuild the media/image index | Media Index Rebuild | `POST /admin/media/rescan` or via `/admin/media` UI |
| Render a wiki attachment inline | Plugin: ATTACH | `[{ATTACH src='file.png'}]` |
| Render an image with layout control | Plugin: Image | `[{Image src='img.jpg' align='left' display='float'}]` |
| Resolve an attachment src to a URL | resolveAttachmentSrc | `AttachmentManager.resolveAttachmentSrc(src, pageName)` |
| Add a new wiki plugin | Plugin | add `*.ts` to `plugins/`, build, configure search path |
| Check configured storage paths | ConfigurationManager | `amdwiki.attachment.provider.basic.storagedir`, etc. |
