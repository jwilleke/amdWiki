# MediaManager

**Module:** `src/managers/MediaManager.ts`
**Extends:** [BaseManager](BaseManager.md)
**Complete Guide:** [MediaManager-Complete-Guide.md](MediaManager-Complete-Guide.md)

---

## Overview

MediaManager browses, searches, and serves thumbnails for pre-existing media files
(photos, videos) stored on external drives or local folders. It is strictly
**read-only** with respect to source files. A persistent JSON index and on-demand
Sharp thumbnails are maintained in the configured data directory.

## Key Features

- **Filesystem scanning** — recursive walk of configured folders via `exiftool-vendored`
- **EXIF / IPTC / XMP metadata** — date, title, description, keywords, camera, GPS
- **Persistent JSON index** — loaded at startup; incrementally updated on each scan
- **Thumbnail generation** — Sharp, cached to disk; images only (videos show placeholder)
- **Year-based browse** — items grouped by year (from EXIF or filename/path fallback)
- **Keyword browsing** — `listByKeyword()` returns items whose EXIF/XMP keywords contain a given value; powers `/media/keyword/:keyword` album pages
- **Full-text search** — multi-token AND search across all metadata fields
- **Private-page awareness** — items linked to private pages hidden from non-owners
- **MediaPlugin integration** — `[{MediaPlugin}]` wiki plugin embeds counts, lists, and thumbnail albums in wiki pages
- **Opt-in** — disabled by default (`amdwiki.media.enabled = false`)
- **Background rescan** — configurable periodic timer

## Quick Example

```typescript
const mediaManager = engine.getManager('MediaManager');

// Trigger a rescan
const result = await mediaManager.scanFolders(true);
// { scanned: 12400, added: 43, updated: 7, errors: 0 }

// List years
const years = await mediaManager.getYears();
// [2025, 2024, 2023, ...]

// Items for a year (private-filtered)
const items = await mediaManager.listByYear(2024, wikiContext);

// Items for a keyword (private-filtered)
const kwItems = await mediaManager.listByKeyword("Molly's Cooking", wikiContext);

// Single item
const item = await mediaManager.getItem(id, wikiContext);

// Thumbnail buffer
const buffer = await mediaManager.getThumbnailBuffer(id, '300x300');

// Search
const results = await mediaManager.search('birthday 2023', wikiContext);
```

## Core Methods

| Method | Returns | Description |
|--------|---------|-------------|
| `scanFolders(force?)` | `Promise<ScanResult>` | Walk configured folders and update index |
| `getYears(wikiContext?)` | `Promise<number[]>` | Sorted-descending list of years with items |
| `listByYear(year, wikiContext?)` | `Promise<MediaItem[]>` | All items for a year, privacy-filtered |
| `listByKeyword(keyword, wikiContext?)` | `Promise<MediaItem[]>` | Items whose EXIF/XMP keywords contain `keyword`, privacy-filtered |
| `listByPage(pageName, wikiContext?)` | `Promise<MediaItem[]>` | Items linked to a wiki page by `linkedPageName`, privacy-filtered |
| `getItem(id, wikiContext?)` | `Promise<MediaItem\|null>` | Single item by ID, privacy-filtered |
| `search(query, wikiContext?)` | `Promise<MediaItem[]>` | Keyword search, privacy-filtered |
| `getThumbnailBuffer(id, size)` | `Promise<Buffer\|null>` | JPEG thumbnail (cached) |
| `shutdown()` | `Promise<void>` | Clear timer, release ExifTool worker |

## HTTP Routes

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/media` | Year-grid browse page |
| `GET` | `/media/year/:year` | Thumbnail grid for a year |
| `GET` | `/media/keyword/:keyword` | Thumbnail album for a keyword |
| `GET` | `/media/item/:id` | Item detail page (image preview or video player) |
| `GET` | `/media/file/:id` | Raw file stream with HTTP Range support (for video seeking) |
| `GET` | `/media/search` | Search form + results |
| `GET` | `/media/thumb/:id?size=WxH` | Thumbnail image |
| `GET` | `/media/api/item/:id` | JSON: single item metadata |
| `GET` | `/media/api/year/:year` | JSON: all items for a year |
| `GET` | `/admin/media` | Admin: stats + rescan |
| `POST` | `/admin/media/rescan` | Trigger full rescan (admin only) |

All routes return **503** when `amdwiki.media.enabled = false`.

## Configuration

```json
{
  "amdwiki.media.enabled": false,
  "amdwiki.media.folders": [],
  "amdwiki.media.maxdepth": 5,
  "amdwiki.media.scaninterval": 3600000,
  "amdwiki.media.ignoredirs": [".dtrash", ".ts"],
  "amdwiki.media.ignorefiles": [".photoviewignore", ".plexignore"],
  "amdwiki.media.extensions": [],
  "amdwiki.media.index.file": "",
  "amdwiki.media.thumbnail.dir": "",
  "amdwiki.media.thumbnail.sizes": "300x300,150x150",
  "amdwiki.media.metadata.priority": ["EXIF", "IPTC", "XMP"]
}
```

Leave `amdwiki.media.extensions` empty (or omit it) to use the built-in default extension list. Provide a non-empty array to override it entirely.

## Provider

| Provider | Status | Notes |
|----------|--------|-------|
| `FileSystemMediaProvider` | Production | Recursive walk, ExifTool, Sharp thumbnails |

## Related

- [FileSystemMediaProvider](../providers/FileSystemMediaProvider.md)
- [BaseMediaProvider](../providers/BaseMediaProvider.md)
- [ConfigurationManager](ConfigurationManager.md)
- [MediaPlugin](../../plugins/MediaPlugin.ts)
- [MediaManager-Complete-Guide.md](MediaManager-Complete-Guide.md)

## User Documentation

See the wiki page [Media Management](/wiki/media-management) for end-user documentation.
