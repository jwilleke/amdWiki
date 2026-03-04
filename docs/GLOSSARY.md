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
npm run build          # also runs clean (rm -rf dist) first
./server.sh stop       # always stop before building (build clears dist/)
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
write queue (prevents race conditions).

### Page Cache

Preferred: **Page Cache**
Avoid: "pageCache", "in-memory cache", "page list"

The in-memory `Map<title, PageInfo>` maintained by `FileSystemProvider` at
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

The in-memory Lunr full-text index used to power wiki search. Stored on disk
in `$FAST_STORAGE/search-index/`. Separate from the Page Index.

### Search Index Rebuild

Preferred: **Search Index Rebuild**
Avoid: "reindex", "rebuild search", "rebuild Lunr", "build search index"

Rebuilds the Lunr full-text index from all page documents. Triggered
automatically during a full startup Directory Scan, or via an admin action.
With 14K+ documents this causes a ~3GB RAM spike; `max_memory_restart` in
`ecosystem.config.js` must be ≥ 4GB.

---

## Storage Layout

| Term | Path | Contents |
|---|---|---|
| `FAST_STORAGE` | `/Volumes/hd2/jimstest-wiki/data` | users, sessions, logs, config, Page Index, Search Index |
| `SLOW_STORAGE` | `/Volumes/hd2A/jimstest-wiki/data` | pages (`*.md`), attachments |
| `dist/` | `/Volumes/hd2A/workspaces/github/amdWiki/dist/` | compiled JS (output of Build) |
| `src/` | `/Volumes/hd2A/workspaces/github/amdWiki/src/` | TypeScript source |

---

## Quick Reference

| You want to... | Term | Command |
|---|---|---|
| Compile source after a code change | Build | `npm run build` (stop server first) |
| Reload the server process | Restart | `./server.sh restart` |
| See what pages exist at runtime | Page Cache | `FileSystemProvider.getAllPages()` |
| Speed up server startup | Fast Init | ensure `page-index.json` exists |
| Force rebuild of page metadata file | Page Index Rebuild | automatic on page save; or delete `page-index.json` and restart |
| Rebuild full-text search | Search Index Rebuild | admin action or restart after deleting search-index/ |
