# Plan: Media Manager — Phase 4 (Real Implementation)

Issue: #273

## Background

Phase 3 (commit a284673) delivered the MediaManager stub: all infrastructure is in
place (routes, config defaults, manager/provider class hierarchy) but scanning and
thumbnail generation return empty results.

Phase 4 wires in real filesystem scanning, EXIF metadata extraction, thumbnail
generation, and the EJS views.

---

## Goals

- Read-only — never modify source media files
- Scale to 500k+ images across multiple folders with deep structures
- Extract EXIF / IPTC / XMP metadata (date, title, description, keywords, GPS, camera)
- Generate cached thumbnails via Sharp (already installed)
- Full-text search across metadata fields
- Browse by year; single-item detail page
- Private-page awareness (inherited from Phase 3 MediaManager)
- Admin: trigger rescan, view index statistics

---

## New dependency

| Package | Purpose |
|---------|---------|
| `exiftool-vendored` | EXIF/IPTC/XMP extraction — spawns a persistent ExifTool process |

Sharp is already installed.

---

## Architecture

```
MediaManager
  └── FileSystemMediaProvider
        ├── ExifTool (exiftool-vendored) — metadata extraction
        ├── Sharp — thumbnail generation / caching
        └── media-index.json — persistent JSON index
```

### Media index

```json
{
  "version": 1,
  "updatedAt": "2026-03-08T00:00:00.000Z",
  "items": {
    "<id32>": {
      "id": "...", "filePath": "...", "filename": "...", "mimeType": "...",
      "year": 2023, "dirPath": "...", "eventName": "BirthdayParty",
      "mtime": 1234567890000,
      "metadata": { "title": null, "description": null, "keywords": null, "make": "...", "model": "..." }
    }
  }
}
```

### ID

`SHA-256(filePath).slice(0, 32)` — stable, path-based, no content read needed.

---

## Supported media

### Image extensions

jpg, jpeg, png, gif, heic, heif, tiff, tif, webp, raw, orf, cr2, nef, arw, dng, bmp

### Video extensions

mp4, mov, avi, mkv, m4v, wmv, 3gp

Thumbnail generation: images only (Sharp). Videos return `null` thumbnail.

---

## Scan algorithm

```
for each folder in config.folders:
  walkDir(folder, depth=0)
    read entries
    if any entry name is in config.ignoreFiles → skip entire dir
    for each dir entry:
      skip if name in config.ignoreDirs
      if depth < maxDepth (or maxDepth === 0): recurse
    for each file entry:
      skip if extension not in MEDIA_EXTENSIONS
      scanned++
      id = sha256(filePath)[0:32]
      stat = fs.stat
      if !force && index[id] && index[id].mtime === stat.mtimeMs: skip
      tags = exiftool.read(filePath)
      year = extractYear(tags, filePath, stat.mtime)
      eventName = parseEventName(basename)
      update index[id] → added++ or updated++

save index to disk
return { scanned, added, updated, errors }
```

### Year extraction priority

1. EXIF `DateTimeOriginal` / `CreateDate` / `MediaCreateDate`
2. Filename prefix `YYYY-` or `YYYY_`
3. Path component matching `/^\d{4}$/`
4. File mtime year

### Event name parsing

Filename pattern: `YYYY-MM-DD-EventName-NNN.ext`

```
/^\d{4}-\d{2}-\d{2}-(.+?)(?:-\d+)?$/
```

Returns the middle section (e.g. `BirthdayParty`), or `null`.

---

## Thumbnail cache

Path: `{thumbnailDir}/{id}-{size}.jpg`

On request:

1. Return cached file if it exists
2. Generate via `sharp(filePath).resize(w, h, { fit: 'cover' }).jpeg({ quality: 85 })`
3. Save to cache
4. Return buffer

---

## New / changed files

| File | Change |
|------|--------|
| `src/providers/BaseMediaProvider.ts` | Add `initialize()` (default no-op) and abstract `getYears()` |
| `src/providers/FileSystemMediaProvider.ts` | Full implementation replacing stub |
| `src/managers/MediaManager.ts` | Call `provider.initialize()`; add `getYears()` |
| `src/routes/WikiRoutes.ts` | `mediaHome`: get real years list |
| `views/media-home.ejs` | Year-based browse page |
| `views/media-year.ejs` | Grid of items for a year |
| `views/media-item.ejs` | Single item detail with metadata |
| `views/media-search.ejs` | Search form + results |
| `views/admin-media.ejs` | Admin: index stats, rescan button |

---

## Testing

- Unit tests: FileSystemMediaProvider (mock fs + exiftool)
- Manual: enable `amdwiki.media.enabled: true`, configure `amdwiki.media.folders`, trigger `/admin/media/rescan`

---

## Non-goals (Phase 4)

- Video thumbnail generation (requires ffmpeg — future phase)
- Slideshow / lightbox UI (future phase)
- Album / event grouping UI beyond year (future phase)
- Write-back to EXIF metadata
