# Plan: Private Folders + Attachment Privacy + MediaManager Stub

## Issues: #122, #232 (attachment privacy cross-ref), #273 (MediaManager)

---

## Context

Issue #122 requests per-user private folders where pages tagged with the `private` userKeyword are physically isolated from public pages and access-controlled. Issue comments also require attachments to respect the same privacy rules (#232), and the MediaManager (#273) must understand the private folder concept from the start so it doesn't need to be retrofitted later.

### Key config distinction

| Config key | Purpose | Who sets it |
|---|---|---|
| `amdwiki.system-category` | Admin-defined page categories that drive storage location (`regular`, `required`, `github`). VersioningFileProvider already reads `storageLocation` from these entries. | Admins/config |
| `amdwiki.user-keywords` | User-applied content tags (`private`, `draft`, `review`, etc.). Currently metadata-only with no storage enforcement. | Users |
| `amdwiki.system-keywords` | System-level controlled vocabulary (`general`). | System |

The `private` entry already exists in `amdwiki.user-keywords`. This plan adds `storageLocation: "private"` to that entry — mirroring the `system-category` pattern — and wires up the enforcement that `system-category` already has.

### Current state

- All pages stored flat by UUID: `{pagesDirectory}/{uuid}.md`
- `amdwiki.user-keywords.private` exists in config but has no storage enforcement code
- ACLManager supports page-level ACLs (`[{ALLOW}]` in content) but no metadata-based isolation
- Attachments are content-addressed (SHA-256) in a single shared directory
- MediaManager does not exist yet

---

## Phase 1: Private Wiki Pages (Issue #122)

### 1.1 — Extend PageIndexEntry in `VersioningFileProvider.ts`

Add `'private'` as a third location type and an `owner` field:

```typescript
// src/providers/VersioningFileProvider.ts
interface PageIndexEntry {
  title: string;
  uuid: string;
  slug: string;
  filename: string;        // still `{uuid}.md`
  currentVersion: string;
  location: 'pages' | 'required-pages' | 'private';  // NEW: 'private'
  owner?: string;          // NEW: required when location === 'private'
  lastModified: string;
  editor: string;
  hasVersions: boolean;
}
```

### 1.2 — Extend path-building in `FileSystemProvider.ts`

Add a helper `resolvePageFilePath(entry)` that constructs the path based on location:

```typescript
private resolvePageFilePath(uuid: string, location: string, owner?: string): string {
  if (location === 'private' && owner) {
    return path.join(this.pagesDirectory, 'private', owner, `${uuid}.md`);
  }
  return path.join(this.pagesDirectory, `${uuid}.md`);  // existing default
}
```

Called in `savePage()` and `getPage()` instead of the current hardcoded `path.join(this.pagesDirectory, ...)`.

Create private directory on first use via `fs.mkdir({ recursive: true })`.

### 1.3 — Extend version directory for private pages

Private page versions stored at `versions/private/{uuid}/` (no username in version path since UUID is unique):

```typescript
// VersioningFileProvider.getVersionDirectory()
private getVersionDirectory(uuid: string, location: 'pages' | 'required-pages' | 'private' = 'pages'): string {
  if (location === 'private') return path.join(this.privateVersionsDir, uuid);
  if (location === 'required-pages') return this.requiredPagesVersionsDir;
  return path.join(this.pagesVersionsDir, uuid);
}
```

Add `this.privateVersionsDir = path.join(this.versionsDirectory, 'private')` to constructor.

### 1.4 — Detect "private" keyword in `PageManager.savePageWithContext()`

In `PageManager.savePageWithContext()` (`src/managers/PageManager.ts` lines 274-293), use a **config-driven** check — read `storageLocation` from the keyword definition in `amdwiki.user-keywords`, mirroring how `amdwiki.system-category` drives location today:

```typescript
const configManager = this.engine.getManager<ConfigurationManager>('ConfigurationManager');
const userKeywordDefs = configManager.getProperty<Record<string, { storageLocation?: string }>>('amdwiki.user-keywords', {});
const userKeywords = (metadata['user-keywords'] || []) as string[];

// Check if any applied user-keyword requests private storage
const privateLocation = userKeywords
  .map(kw => userKeywordDefs[kw]?.storageLocation)
  .find(loc => loc === 'private');

const enrichedMetadata = {
  ...metadata,
  author: wikiContext.userContext?.username || 'anonymous',
  'system-location': privateLocation ?? undefined,  // consumed by provider
  'page-owner': privateLocation ? wikiContext.userContext?.username : undefined,
};
```

`VersioningFileProvider.savePage()` reads `metadata['system-location']` and `metadata['page-owner']` to determine storage path, exactly as it currently reads `system-category` → `storageLocation`.

### 1.5 — Enforce access via `WikiContext` in `WikiRoutes.ts`

All access checks use `WikiContext` — the single object that carries both page and user data, consistent with `ACLManager.checkPagePermissionWithContext()`. Build a `WikiContext` once per request and reuse it everywhere.

Add a `checkPrivatePageAccess(wikiContext: WikiContext)` helper:

```typescript
function checkPrivatePageAccess(wikiContext: WikiContext): boolean {
  // WikiContext.pageObject carries the loaded page (added via engine.buildWikiContext)
  const index = wikiContext.pageObject?.metadata?.['index-entry'] as PageIndexEntry;
  if (index?.location !== 'private') return true;            // public page — allow
  if (!wikiContext.userContext?.authenticated) return false;   // anonymous — deny
  if (wikiContext.userContext.roles?.includes('admin')) return true; // admin — allow
  return wikiContext.userContext.username === index.owner;    // owner — allow
}
```

Routes build `WikiContext` once via the existing `WikiRoutes.createWikiContext()` (`src/routes/WikiRoutes.ts:132`), then pass it through:

```typescript
// In WikiRoutes handler — createWikiContext() already exists:
const wikiContext = this.createWikiContext(req, { pageName });
if (!checkPrivatePageAccess(wikiContext)) return res.status(403).render('error', { code: 403 });
```

Apply in:

- `GET /wiki/:pageName` (view)
- `GET /wiki/:pageName/edit` (edit)
- `GET /wiki/:pageName/history` (history)
- `GET /wiki/:pageName/delete` (delete)

Return **403** (not 404) so the user knows the page exists but is restricted.

### 1.6 — Exclude private pages from search

In `SearchManager.updatePageInIndex()` / `LunrSearchProvider`: store `isPrivate: true` and `owner: username` in the index document.

Pass `WikiContext` through `SearchManager.search(query, options)` — add optional `wikiContext?: WikiContext` to `SearchOptions` (replaces any raw userContext). Filter private results in the search provider:

```typescript
// In LunrSearchProvider.search():
results = results.filter(doc => {
  if (!doc.isPrivate) return true;
  const uc = options.wikiContext?.userContext;
  return uc?.roles?.includes('admin') || uc?.username === doc.owner;
});
```

### 1.7 — Config: add `storageLocation` to the existing `amdwiki.user-keywords.private` entry

The `private` entry already exists in `config/app-default-config.json` under `amdwiki.user-keywords`. Add `storageLocation: "private"` to it — the same field used by `amdwiki.system-category` entries to signal where pages should be stored:

```json
// config/app-default-config.json → amdwiki.user-keywords → private
"private": {
  "label": "private",
  "description": "Private content editable only by author and admins",
  "category": "access",
  "enabled": true,
  "restrictEditing": true,
  "storageLocation": "private",    // NEW — triggers private subdirectory storage
  "allowedRoles": ["admin", "author"]
}
```

This is the only config change needed for Phase 1. The enforcement logic in 1.4 reads this field at runtime, so adding new keyword storage behaviors in future requires only a config change.

### 1.8 — Privacy status change on save (removing the "private" keyword)

When a user edits a private page and removes the `private` user-keyword, `PageManager.savePageWithContext()` detects the transition: current `index.location === 'private'` but new metadata has no private `storageLocation`. The provider must **move the file**:

```typescript
// In VersioningFileProvider.savePage() — detect location change
const currentEntry = this.pageIndex.get(uuid);
const newLocation = resolveLocationFromMetadata(enrichedMetadata);  // 'pages' | 'private'
if (currentEntry?.location !== newLocation) {
  await this.movePageFile(uuid, currentEntry.location, currentEntry.owner, newLocation, newOwner);
  await this.moveVersionDirectory(uuid, currentEntry.location, newLocation);
}
```

Same logic applies in reverse: making a public page private moves it from `pages/` to `pages/private/{owner}/`.

### 1.9 — URL scheme stays unchanged

Private pages remain at `/wiki/PageName` — no URL change. Privacy is enforced at the route handler level (1.5), not in the URL structure. A private page's existence can be acknowledged with a 403, but the URL does not leak the ownership path.

### 1.10 — `WikiContext` construction uses existing `WikiRoutes.createWikiContext()`

`WikiContext` is already the central orchestrator per `docs/WikiContext-Complete-Guide.md`. The existing factory in `WikiRoutes` is `this.createWikiContext(req, options)` (`src/routes/WikiRoutes.ts:132`). All access checks throughout this plan use it:

```typescript
// Pattern already used in WikiRoutes — reference this everywhere:
const wikiContext = this.createWikiContext(req, { pageName });
if (!checkPrivatePageAccess(wikiContext)) return res.status(403).render('error', { code: 403 });
```

No new factory method needed on WikiEngine.

### 1.11 — Admin visibility of private pages

Admins can read any private page (enforced in 1.5). Add a `/admin/pages?filter=private` view listing all private pages across all owners — queries the page index filtered by `location === 'private'`. Deferred to a follow-up issue, but the `owner` field in `PageIndexEntry` is required from the start to support this query.

---

## Phase 2: Private Attachments (Issue #232 cross-ref)

### 2.1 — Private attachment storage subdirectory

Extend `BasicAttachmentProvider` (`src/providers/BasicAttachmentProvider.ts`):

```typescript
// Resolve private storage dir
this.privateStorageDir = path.join(this.storageDirectory, 'private');
```

In `storeAttachmentInternal()`, check if the associated page is private:

```typescript
const isPrivatePage = options?.isPrivatePage ?? false;
const pageOwner = options?.pageOwner;
const targetDir = isPrivatePage && pageOwner
  ? path.join(this.privateStorageDir, pageOwner)
  : this.storageDirectory;
```

File path: `{targetDir}/{sha256hash}{ext}` — same content-addressing, different directory.

Add `isPrivate: boolean` and `owner?: string` to `SchemaCreativeWork` metadata.

### 2.2 — Propagate privacy to AttachmentManager via `WikiContext`

Replace the separate `isPrivatePage`/`pageOwner` flags in `UploadOptions` with a `WikiContext`. The manager derives all page and user data from it — DRY, consistent with the rest of the engine.

```typescript
interface UploadOptions {
  description?: string;
  wikiContext: WikiContext;   // carries pageName AND userContext — replaces old context/isPrivatePage/pageOwner
}
```

`AttachmentManager.uploadAttachment()` resolves page privacy from the WikiContext's pageName:

```typescript
const pageName = options.wikiContext.pageName;
const page = pageName ? await pageManager.getPage(pageName) : null;
const index = page?.metadata?.['index-entry'] as PageIndexEntry | undefined;
const isPrivate = index?.location === 'private';
const pageOwner = index?.owner;
```

### 2.3 — Guard attachment serving route via `WikiContext`

In `WikiRoutes.serveAttachment()` (`GET /attachments/:attachmentId`), build a `WikiContext` for the attachment's linked page and run the same `checkPrivatePageAccess()` used by page routes:

```typescript
const meta = await attachmentManager.getAttachmentMetadata(attachmentId);
if (meta?.isPrivate) {
  // Re-use the page access helper — build WikiContext from the attachment's linked page
  const linkedPageName = meta.mentions?.[0]?.name;
  const wikiContext = this.createWikiContext(req, { pageName: linkedPageName ?? '' });
  if (!checkPrivatePageAccess(wikiContext)) return res.status(403).render('error', { code: 403 });
}
```

This ensures attachment access control goes through the same `WikiContext`-based path as page access — one check function, not duplicate logic.

---

## Phase 3: MediaManager Stub (Issue #273)

### 3.1 — Design decision: AttachmentManager vs MediaManager boundary

These two managers are **kept separate** with no handoff between them:

| | AttachmentManager | MediaManager |
|---|---|---|
| Source | User uploads via wiki UI | Pre-existing files on external disk |
| Write model | Writes files into `attachments/` | Read-only — never writes to source |
| Lifecycle | Bound to a wiki page | Independent of wiki pages |
| Metadata | Schema.org CreativeWork | EXIF/IPTC/XMP via `exiftool-vendored` |

AttachmentProvider does **not** delegate to MediaManager for image/video uploads. The clean architectural separation is preserved.

**Bridge without coupling**: if uploaded attachments should also appear in the media browser, add `${SLOW_STORAGE}/attachments` to `amdwiki.media.folders` in config. MediaManager will scan and index the directory with zero code coupling.

---

### 3.2 — New files

| File | Purpose |
|------|---------|
| `src/managers/MediaManager.ts` | Manager: initialize, scan, year browsing, search, index management |
| `src/providers/BaseMediaProvider.ts` | Abstract interface: scan(), getItem(), getItemsByYear(), etc. |
| `src/providers/FileSystemMediaProvider.ts` | Filesystem implementation with exiftool-vendored + Sharp |

### 3.3 — MediaManager extends BaseManager

```typescript
class MediaManager extends BaseManager {
  private provider: BaseMediaProvider | null = null;
  private scanInterval: NodeJS.Timeout | null = null;

  async initialize(): Promise<void>
  async scanFolders(force?: boolean): Promise<void>
  async getItem(id: string, wikiContext?: WikiContext): Promise<MediaItem | null>
  async listByYear(year: number, wikiContext?: WikiContext): Promise<MediaItem[]>
  async search(query: string, wikiContext?: WikiContext): Promise<MediaItem[]>
  async shutdown(): Promise<void>
}
```

All public methods accept `WikiContext` (optional — admin/internal calls pass `undefined`). `WikiContext` is built once per request in the route handler and passed through.

Register in `WikiEngine.ts` after `AttachmentManager` (line ~147), only when `amdwiki.media.enabled` is true.

### 3.4 — BaseMediaProvider interface

```typescript
abstract class BaseMediaProvider {
  abstract scan(force?: boolean): Promise<ScanResult>;
  abstract getItem(id: string): Promise<MediaItem | null>;
  abstract getItemsByYear(year: number): Promise<MediaItem[]>;
  abstract getThumbnailBuffer(id: string, size: string): Promise<Buffer | null>;
  abstract search(query: string): Promise<MediaItem[]>;
  abstract shutdown(): Promise<void>;
}
```

### 3.5 — FileSystemMediaProvider key behavior

- **Dependencies**: `exiftool-vendored` (metadata), `sharp` (already installed, thumbnails)
- **Index file**: `${FAST_STORAGE}/media-index.json` — same atomic write + rename pattern as `page-index.json`
- **Incremental scan**: on startup, load index; scan only dirs whose `mtime` changed since last scan
- **Batch processing**: process N files per event-loop tick to avoid blocking (like VersioningFileProvider write queue)
- **Ignore config**:

  ```json
  "amdwiki.media.ignoredirs": [".dtrash", ".ts"],
  "amdwiki.media.ignorefiles": [".photoviewignore", ".plexignore"]
  ```

- **Thumbnail generation**: lazy, on first request; stored in `${FAST_STORAGE}/media/thumbs/{sha256}.jpg`, **never** in source tree
- **Read-only**: `amdwiki.media.readonly: true` — refuse to write to source media folders

### 3.6 — Metadata extraction strategy (MWG priority model)

Use `exiftool-vendored` with the MWG composite tag model, priority configurable via:

```json
"amdwiki.media.metadata.priority": ["EXIF", "IPTC", "XMP"]
```

Date resolution priority (per item):

1. EXIF `DateTimeOriginal` — most reliable (log warning if absent)
2. XMP sidecar (`.xmp` adjacent file) — covers historical scans
3. Path-parsed `YYYY-MM` from containing directory name
4. Filename date prefix (`YYYY-MM-DD-...`)
5. File `mtime` — last resort

### 3.7 — Grouping via metadata (no pre-built albums)

Path/date/event information is stored as metadata fields on each item in `media-index.json`. No separate album structures are built or maintained. Grouping is done at query time against the index.

Required metadata fields per item:

- `year` — extracted from EXIF `DateTimeOriginal` or path/filename fallback (primary grouping key)
- `dirPath` — source directory path (available for display; not used as an album ID)
- `eventName` — parsed from catalog-export filenames (`YYYY-MM-DD-EventName-...`) when present; `null` otherwise

The `/media` browse UI groups items **by year** using the index. Finer groupings (month, event) are filters on the same index query, not separate data structures.

User-defined named collections are out of scope for this iteration.

### 3.8 — Private awareness in MediaManager

When a media item is linked to a wiki page (`mentions` field), `MediaManager.getItem()` uses `WikiContext` and the shared `checkPrivatePageAccess()` helper — same function used by page and attachment routes:

```typescript
// MediaManager.getItem(id, wikiContext?)
// wikiContext is created in WikiRoutes via this.createWikiContext(req, { pageName })
// and passed through to the manager — MediaManager never holds a req reference directly
if (item.linkedPageName && wikiContext) {
  // WikiContext is immutable (all readonly fields) — create a new one with the
  // linked page name, preserving userContext and request from the caller's context
  const pageWikiContext = new WikiContext(this.engine, {
    context: WikiContext.CONTEXT.VIEW,
    pageName: item.linkedPageName,
    userContext: wikiContext.userContext ?? undefined,
    request: wikiContext.request ?? undefined,
  });
  if (!checkPrivatePageAccess(pageWikiContext)) return null;  // treat as not found
}
```

`WikiContext` has no clone/withPageName helper — all properties are `readonly`. Construct a new instance directly. One access-check function used consistently across pages, attachments, and media items.

### 3.9 — Config keys (`config/app-default-config.json`)

```json
"amdwiki.media.enabled": false,
"amdwiki.media.folders": [],
"amdwiki.media.maxdepth": 5,
"amdwiki.media.scaninterval": 3600000,
"amdwiki.media.readonly": true,
"amdwiki.media.index.file": "${FAST_STORAGE}/media-index.json",
"amdwiki.media.thumbnail.dir": "${FAST_STORAGE}/media/thumbs",
"amdwiki.media.thumbnail.sizes": "300x300,150x150",
"amdwiki.media.metadata.priority": ["EXIF", "IPTC", "XMP"],
"amdwiki.media.ignoredirs": [".dtrash", ".ts"],
"amdwiki.media.ignorefiles": [".photoviewignore", ".plexignore"]
```

### 3.10 — Routes (add to `WikiRoutes.ts`)

```
GET  /media                        → Media home / browse (grouped by year)
GET  /media/year/:year             → All items for a given year
GET  /media/item/:id               → Item detail + metadata panel
GET  /media/search                 → Search results
GET  /media/api/item/:id           → JSON item metadata
GET  /media/api/year/:year         → JSON item list for a year
GET  /media/thumb/:id              → Lazy-generated thumbnail (size query param)
GET  /admin/media                  → Admin: scan status, index stats, force rescan
POST /admin/media/rescan           → Trigger full rescan
```

### 3.11 — Plugin macros (iteration 2 placeholder)

Register plugin stubs in `dist/plugins/` following PluginObject pattern from issue #238:

- `MediaGallery` — `[{MediaGallery year=2024 output=grid max=20}]`
- `MediaSearch` — `[{MediaSearch keyword="Nassau" output=grid max=20}]`
- `MediaItem` — `[{MediaItem id="uuid" caption="text"}]`

Parameter names follow #238 conventions: `max` not `limit`, `output` for mode. Slideshow deferred — iteration 2.

---

## Critical Files to Modify

| File | Change |
|------|--------|
| `src/providers/VersioningFileProvider.ts` | Add `'private'` location type, `owner` to PageIndexEntry, version dir for private |
| `src/providers/FileSystemProvider.ts` | `resolvePageFilePath()` helper for location-aware path building |
| `src/managers/PageManager.ts` | Detect "private" keyword in `savePageWithContext()`, pass location metadata |
| `src/managers/SearchManager.ts` | Add optional userContext to SearchOptions; filter private docs for non-owners |
| `src/providers/BasicAttachmentProvider.ts` | Private subdirectory, `isPrivate` + `owner` in SchemaCreativeWork metadata |
| `src/managers/AttachmentManager.ts` | Resolve page privacy from PageManager, pass flags to provider |
| `src/routes/WikiRoutes.ts` | `checkPrivatePageAccess()` guard on page/attachment routes; add `/media/*` routes |
| `src/WikiEngine.ts` | Register MediaManager after AttachmentManager (conditional on config) |
| `config/app-default-config.json` | Add `storageLocation: "private"` to existing `amdwiki.user-keywords.private` entry; add all `amdwiki.media.*` defaults |
| `src/managers/MediaManager.ts` | **NEW** |
| `src/providers/BaseMediaProvider.ts` | **NEW** |
| `src/providers/FileSystemMediaProvider.ts` | **NEW** |

---

## New npm Dependency

- **`exiftool-vendored`** — MWG-compliant EXIF/IPTC/XMP metadata for MediaManager. ExifTool binary is bundled by this package (no system Perl required). `sharp` (already a dependency) remains for thumbnail generation only.

---

## Verification

1. **Private page storage**: create a page with "private" keyword as user `alice` → verify file appears at `pages/private/alice/{uuid}.md`, NOT at `pages/{uuid}.md`
2. **Access control**: view alice's private page as user `bob` → 403; as `admin` → 200; as `alice` → 200
3. **Anonymous access**: unauthenticated request to a private page → 403
4. **Search exclusion**: search for content from alice's private page as `bob` → no results; as `alice` → result appears
5. **Private attachments**: upload file to a private page → verify stored in `attachments/private/alice/{hash}.ext`; direct `GET /attachments/{id}` as `bob` → 403
6. **MediaManager startup**: set `amdwiki.media.enabled: true`, configure a folder → verify `media-index.json` created at `FAST_STORAGE`, no files written to source folder
7. **Thumbnail route**: `GET /media/thumb/{id}?size=300` → 200 JPEG, thumbnail appears in `data/media/thumbs/`, source folder unchanged
8. **E2E tests**: Playwright tests for private page create/view/403 denial — serial mode, separate test project to avoid toggling shared server state
