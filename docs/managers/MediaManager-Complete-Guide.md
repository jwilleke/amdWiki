# MediaManager — Complete Guide

**Module:** `src/managers/MediaManager.ts`
**Quick Reference:** [MediaManager.md](MediaManager.md)
**Version:** 1.0.0
**Issue:** #273

---

## Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Configuration](#configuration)
4. [Initialization Sequence](#initialization-sequence)
5. [Scanning](#scanning)
6. [Media Index](#media-index)
7. [Querying](#querying)
8. [Thumbnail Generation](#thumbnail-generation)
9. [Privacy and Access Control](#privacy-and-access-control)
10. [HTTP Routes](#http-routes)
11. [API Reference](#api-reference)
12. [Provider System](#provider-system)
13. [Background Scanning](#background-scanning)
14. [Shutdown](#shutdown)
15. [Troubleshooting](#troubleshooting)
16. [Future Roadmap](#future-roadmap)

---

## Overview

MediaManager is the high-level coordinator for amdWiki's media browsing feature. It:

- Reads config from `ConfigurationManager` (`amdwiki.media.*` keys)
- Creates and owns a `FileSystemMediaProvider` instance
- Exposes query methods (`getItem`, `listByYear`, `search`, `getYears`, `getThumbnailBuffer`) to WikiRoutes
- Applies private-page access control before returning items to callers
- Manages a periodic background rescan timer

The manager is **opt-in**: it is only instantiated by `WikiEngine` when
`amdwiki.media.enabled = true`. All HTTP routes return 503 when the manager
is absent.

---

## Architecture

```text
WikiEngine
  └── MediaManager (conditional on amdwiki.media.enabled)
        ├── FileSystemMediaProvider
        │     ├── ExifTool worker  (exiftool-vendored)
        │     ├── media-index.json (persistent index)
        │     └── thumbnailDir/    (JPEG cache)
        └── setInterval → scanFolders()
```

### Responsibilities

| Component | Responsibility |
|-----------|---------------|
| `MediaManager` | Config, privacy guard, periodic timer, public API |
| `FileSystemMediaProvider` | Filesystem walk, EXIF, index I/O, thumbnail generation |
| `BaseMediaProvider` | Abstract interface; `initialize()`, `getYears()`, `scan()`, `getItem()`, `getItemsByYear()`, `search()`, `getThumbnailBuffer()`, `shutdown()` |

---

## Configuration

All keys are in `amdwiki.media.*`. Set them in your instance
`app-custom-config.json` (or environment-specific config).

| Key | Type | Default | Description |
|-----|------|---------|-------------|
| `amdwiki.media.enabled` | boolean | `false` | Must be `true` to register the manager |
| `amdwiki.media.folders` | string[] | `[]` | Absolute paths to scan |
| `amdwiki.media.maxdepth` | number | `5` | Max recursion depth (0 = unlimited) |
| `amdwiki.media.scaninterval` | number | `3600000` | Background rescan interval in ms; `0` = disabled |
| `amdwiki.media.ignoredirs` | string[] | `[".dtrash", ".ts"]` | Directory names to skip |
| `amdwiki.media.ignorefiles` | string[] | `[".photoviewignore", ".plexignore"]` | Sentinel filenames that exclude a directory |
| `amdwiki.media.index.file` | string | *(FAST_STORAGE/media-index.json)* | Absolute path to index file |
| `amdwiki.media.thumbnail.dir` | string | *(FAST_STORAGE/media/thumbs)* | Absolute path to thumbnail cache |
| `amdwiki.media.thumbnail.sizes` | string | `"300x300,150x150"` | Comma-separated WxH specs |
| `amdwiki.media.metadata.priority` | string[] | `["EXIF","IPTC","XMP"]` | Metadata source priority (reserved) |

### Minimal working configuration

```json
{
  "amdwiki.media.enabled": true,
  "amdwiki.media.folders": ["/Volumes/photos/2020s", "/Volumes/photos/older"]
}
```

---

## Initialization Sequence

`MediaManager.initialize()` runs during engine startup (after `ConfigurationManager`):

1. Reads all `amdwiki.media.*` keys from `ConfigurationManager`
2. Calls `fs.ensureDir(thumbnailDir)` — creates thumbnail directory if absent
3. Creates `new FileSystemMediaProvider({ ... })`
4. Calls `provider.initialize()` — loads existing `media-index.json` into memory
5. If `scanInterval > 0`, starts a `setInterval` timer calling `scanFolders()`;
   calls `.unref()` so the process can exit cleanly

---

## Scanning

### On-demand (admin-triggered)

```
POST /admin/media/rescan
→ MediaManager.scanFolders(true)
→ FileSystemMediaProvider.scan(true)
→ walks folders, processes new/changed files
→ saves index to disk
→ returns ScanResult { scanned, added, updated, errors }
```

### Background (periodic)

The scan timer calls `scanFolders()` (no force flag) at the configured interval.
Incremental scans skip files whose `stat.mtimeMs` matches the cached value.

### ScanResult

```typescript
interface ScanResult {
  scanned: number;   // Total files examined
  added:   number;   // New items added to index
  updated: number;   // Existing items refreshed
  errors:  number;   // Files that could not be processed
}
```

---

## Media Index

The index is a flat JSON object mapping item IDs to `MediaIndexEntry` records.

### ID generation

```
id = SHA-256(absoluteFilePath).slice(0, 32)
```

IDs are stable as long as the file path does not change.

### MediaIndexEntry (internal)

```typescript
interface MediaIndexEntry extends MediaItem {
  mtime: number;  // stat.mtimeMs at index time
}
```

### MediaItem (public interface)

```typescript
interface MediaItem {
  id:             string;           // SHA-256(filePath)[0:32]
  filePath:       string;           // Absolute path on disk
  filename:       string;           // Basename
  mimeType:       string;           // e.g. "image/jpeg"
  year?:          number;           // Four-digit year
  dirPath?:       string;           // Parent directory
  eventName?:     string | null;    // Parsed from filename convention
  linkedPageName?: string;          // Associated wiki page (optional)
  isPrivate?:     boolean;          // Linked to a private page
  creator?:       string;           // Creator of linked page
  metadata?: {
    title:        unknown;
    description:  unknown;
    keywords:     unknown;
    make:         unknown;
    model:        unknown;
    gpsLatitude:  unknown;
    gpsLongitude: unknown;
  };
}
```

### Persistent file format

```json
{
  "version": 1,
  "updatedAt": "2026-03-08T12:00:00.000Z",
  "items": {
    "a3f7c2d1e8b4690f2a1c3d5e7f9b0c12": {
      "id": "a3f7c2d1e8b4690f2a1c3d5e7f9b0c12",
      "filePath": "/Volumes/photos/2023-06-15-Birthday-001.jpg",
      "filename": "2023-06-15-Birthday-001.jpg",
      "mimeType": "image/jpeg",
      "year": 2023,
      "dirPath": "/Volumes/photos",
      "eventName": "Birthday",
      "mtime": 1686825600000,
      "metadata": {
        "title": null,
        "description": "Garden party",
        "keywords": ["family", "summer"],
        "make": "Apple",
        "model": "iPhone 14 Pro",
        "gpsLatitude": 37.7749,
        "gpsLongitude": -122.4194
      }
    }
  }
}
```

---

## Querying

All public query methods apply privacy filtering via `checkPrivatePageAccess()`
before returning items to callers. Passing `undefined` as `wikiContext`
bypasses filtering (for admin / internal use).

### getYears

Returns unique years from the in-memory index, sorted descending.

### listByYear

Returns all items where `item.year === year`, sorted by filename.

### getItem

Returns the single item matching `id`, or `null` if not found or access denied.

### search

Multi-token AND search. All query tokens must match (case-insensitive) somewhere
in the combined haystack of: filename, eventName, year, title, description,
and keywords.

---

## Thumbnail Generation

Thumbnails are generated by `FileSystemMediaProvider.getThumbnailBuffer()` on first
request and cached to disk as:

```
{thumbnailDir}/{id}-{size}.jpg
```

- Format: JPEG, 85% quality
- Resize mode: `cover` (Sharp) — crops to fill exactly `WxH`
- Only image MIME types are supported; video items return `null`

Cache hits are served from disk (a `fs.readFile`) with no Sharp processing.

The HTTP route adds `Cache-Control: public, max-age=86400` (24 hours).

### Supported image extensions

`jpg`, `jpeg`, `png`, `gif`, `heic`, `heif`, `tiff`, `tif`,
`webp`, `raw`, `orf`, `cr2`, `nef`, `arw`, `dng`, `bmp`

### Supported video extensions (index only; no thumbnail)

`mp4`, `mov`, `avi`, `mkv`, `m4v`, `wmv`, `3gp`

---

## Privacy and Access Control

MediaManager mirrors the private-page access logic from `WikiRoutes.checkPrivatePageAccess()`.

```text
item.linkedPageName present?
  No  → allowed (public item)
  Yes → look up page in PageManager index
          entry.location !== 'private'?  → allowed
          user is admin?                 → allowed
          user is entry.creator?         → allowed
          otherwise                      → denied (item hidden)
```

The check is applied in:

- `getItem()` — returns `null` when denied
- `filterPrivateItems()` — called by `listByYear()` and `search()`

Items with no `linkedPageName` are always visible to any user.

---

## HTTP Routes

### Browser UI routes

| Route | View | Variables |
|-------|------|-----------|
| `GET /media` | `media-home.ejs` | `years: number[]` |
| `GET /media/year/:year` | `media-year.ejs` | `year: number`, `items: MediaItem[]` |
| `GET /media/item/:id` | `media-item.ejs` | `item: MediaItem` |
| `GET /media/search?q=` | `media-search.ejs` | `query: string`, `items: MediaItem[]` |

### Thumbnail

```
GET /media/thumb/:id?size=300x300
Response: image/jpeg, Cache-Control: public, max-age=86400
```

### JSON API

```
GET /media/api/item/:id
→ { ...MediaItem }

GET /media/api/year/:year
→ { year: number, items: MediaItem[] }
```

### Admin

```
GET /admin/media
→ admin-media.ejs (mediaEnabled, years)

POST /admin/media/rescan   (admin:system permission required)
→ { success: true, result: ScanResult }
```

---

## API Reference

### `scanFolders(force?: boolean): Promise<ScanResult>`

Delegates to `provider.scan(force)`. Logs before and after. Returns the `ScanResult`.

### `getYears(wikiContext?: WikiContext): Promise<number[]>`

Delegates to `provider.getYears()`. The `wikiContext` parameter is reserved for
future per-year ACL; currently all years are returned without filtering.

### `listByYear(year: number, wikiContext?: WikiContext): Promise<MediaItem[]>`

Calls `provider.getItemsByYear(year)` then `filterPrivateItems(items, wikiContext)`.

### `getItem(id: string, wikiContext?: WikiContext): Promise<MediaItem | null>`

Calls `provider.getItem(id)`. If `item.linkedPageName` is set and `wikiContext`
is provided, runs `checkPrivatePageAccess()` and returns `null` on denial.

### `search(query: string, wikiContext?: WikiContext): Promise<MediaItem[]>`

Calls `provider.search(query)` then `filterPrivateItems(items, wikiContext)`.

### `getThumbnailBuffer(id: string, size: string): Promise<Buffer | null>`

Delegates directly to `provider.getThumbnailBuffer(id, size)`. No privacy check —
only call after confirming the caller can see the item.

### `shutdown(): Promise<void>`

Clears the scan timer, calls `provider.shutdown()` (ends ExifTool worker), then
calls `super.shutdown()`.

---

## Provider System

### BaseMediaProvider (abstract)

```typescript
abstract class BaseMediaProvider {
  initialize(): Promise<void>;           // Default: no-op
  abstract scan(force?: boolean): Promise<ScanResult>;
  abstract getYears(): Promise<number[]>;
  abstract getItem(id: string): Promise<MediaItem | null>;
  abstract getItemsByYear(year: number): Promise<MediaItem[]>;
  abstract search(query: string): Promise<MediaItem[]>;
  abstract getThumbnailBuffer(id: string, size: string): Promise<Buffer | null>;
  abstract shutdown(): Promise<void>;
}
```

### Implementing a custom provider

1. Extend `BaseMediaProvider`
2. Implement all abstract methods
3. Export as CommonJS-compatible default
4. Wire up in `MediaManager.initialize()` (replaces `new FileSystemMediaProvider(...)`)

---

## Background Scanning

```typescript
// In initialize():
this.scanTimer = setInterval(() => {
  void this.scanFolders();
}, scanInterval);
this.scanTimer.unref(); // Won't prevent process exit
```

The `unref()` call ensures the timer does not keep the process alive when
everything else has shut down.

Set `amdwiki.media.scaninterval = 0` to disable background scanning entirely.

---

## Shutdown

`shutdown()` is called by `WikiEngine` during graceful server stop:

1. `clearInterval(this.scanTimer)`
2. `await this.provider.shutdown()` — calls `exiftoolInstance.end()` to close
   the ExifTool worker process
3. `await super.shutdown()`

---

## Troubleshooting

### 503 on all /media/* routes

`amdwiki.media.enabled` is `false` (default). Set it to `true` and restart.

### Index is empty after scan

Check the server log for `[FileSystemMediaProvider]` lines. Common causes:

- Folders listed in `amdwiki.media.folders` do not exist or are not readable
- All files in the folder are excluded by `ignoredirs` or `ignorefiles`
- File extensions are not in the supported set

### Wrong year on items

ExifTool could not read `DateTimeOriginal`. The system falls back to filename
prefix (`YYYY-`), then path component (`\d{4}`), then file mtime. Check whether
the files have valid EXIF data with `exiftool {filename}`.

### Thumbnails not generating

- Verify `amdwiki.media.thumbnail.dir` is writable
- Check Sharp is installed: `node -e "require('sharp')"` — if it errors, run
  `npm install --os=darwin --cpu=arm64 sharp` (macOS ARM)
- Video files never get thumbnails (FFmpeg not installed)

### ExifTool worker hangs

Each `exiftool.read()` call has a 15-second timeout. If files on slow NAS mounts
time out frequently, increase `taskTimeoutMillis` in the `new ExifTool({...})`
constructor inside `FileSystemMediaProvider`.

---

## Future Roadmap

| Feature | Notes |
|---------|-------|
| Video thumbnails | Requires `fluent-ffmpeg` + FFmpeg binary |
| Slideshow / lightbox UI | Client-side JS enhancement |
| Event / album pages | Group items sharing an event name |
| Link items to wiki pages | Associate `linkedPageName` at scan or edit time |
| Bulk EXIF write-back | Out of scope — feature is read-only by design |
| S3 / cloud provider | New `S3MediaProvider` implementing `BaseMediaProvider` |

---

**Last Updated:** 2026-03-08
**Version:** 1.0.0
