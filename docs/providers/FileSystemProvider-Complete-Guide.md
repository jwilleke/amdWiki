# FileSystemProvider Complete Guide

[Quick Reference](FileSystemProvider.md) | **Complete Guide**

**Module:** `src/providers/FileSystemProvider.js`
**Type:** Page Storage Provider
**Extends:** BasePageProvider
**Status:** Production Ready
**Version:** 1.5.0
**Last Updated:** 2025-12-22

---

## Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Configuration](#configuration)
- [Initialization](#initialization)
- [Page Storage](#page-storage)
- [Page Retrieval](#page-retrieval)
- [Caching System](#caching-system)
- [Page Resolution](#page-resolution)
- [Installation-Aware Loading](#installation-aware-loading)
- [Methods Reference](#methods-reference)
- [Error Handling](#error-handling)
- [Performance](#performance)
- [Migration Guide](#migration-guide)
- [Troubleshooting](#troubleshooting)

---

## Overview

FileSystemProvider is the default page storage provider for amdWiki, implementing file-based storage using Markdown files with YAML frontmatter metadata. It provides a robust, performant, and extensible foundation for page management.

### Design Philosophy

Based on JSPWiki's provider pattern, FileSystemProvider separates storage concerns from business logic:

- **Single Responsibility**: Handles only storage/retrieval operations
- **Provider Pattern**: Pluggable interface allows swapping storage backends
- **Performance First**: In-memory caching with multiple indexes
- **Reliability**: UUID-based file naming prevents conflicts
- **Flexibility**: Title-based access with case-insensitive matching

### Key Features

**Storage:**

- UUID-based file naming (e.g., `550e8400-e29b-41d4-a716-446655440000.md`)
- YAML frontmatter for metadata (gray-matter parsing)
- Configurable encoding support (default: UTF-8)
- Dual storage locations (pages/ and required-pages/)

**Retrieval:**

- Title-based lookup (case-insensitive)
- UUID lookup (exact match)
- Slug lookup (URL-friendly names)
- Plural name matching (e.g., "Page" matches "Pages")

**Performance:**

- In-memory caching (all pages loaded at startup)
- Multiple lookup indexes (UUID, title, slug)
- O(1) page retrieval via Map structures
- Lazy frontmatter parsing

**Installation Support:**

- Installation-aware loading (required-pages only during install)
- System page protection (admin-only editing for system-category pages)
- Automatic directory creation

---

## Architecture

### Class Hierarchy

```
BasePageProvider (abstract)
  └── FileSystemProvider (concrete)
        └── VersioningFileProvider (adds versioning)
```

### Component Relationships

```
WikiEngine
  └── PageManager
        └── FileSystemProvider
              ├── Uses: ConfigurationManager (config access)
              ├── Uses: PageNameMatcher (plural matching)
              ├── Uses: fs-extra (filesystem operations)
              ├── Uses: gray-matter (frontmatter parsing)
              └── Uses: uuid (UUID generation)
```

### Data Flow

**Page Retrieval:**

```
User requests "Home"
  → PageManager.getPage('Home')
    → FileSystemProvider.getPage('Home')
      → Lookup in titleIndex['home']
        → Found canonical identifier: 'Home'
          → Retrieve from pageCache['Home']
            → Load full content from disk
              → Parse frontmatter with gray-matter
                → Return page object { title, uuid, content, metadata }
```

**Page Save:**

```
User saves "MyPage"
  → PageManager.savePage('MyPage', data)
    → FileSystemProvider.savePage('MyPage', data)
      → Generate UUID (if new page)
        → Construct file path: pages/{uuid}.md
          → Write YAML frontmatter + content
            → Update pageCache
              → Update titleIndex, uuidIndex, slugIndex
                → Return success
```

### Directory Structure

```
project-root/
  └── data/
        ├── pages/                           # Main pages directory
        │   ├── 550e8400-....md              # Page files (UUID names)
        │   ├── 9f3a4b2c-....md
        │   └── ...
        └── required-pages/                  # System pages (install only)
              ├── 0a3d3111-....md            # Required for wiki operation
              ├── 86ca6fb2-....md
              └── ...
```

---

## Configuration

All configuration accessed via ConfigurationManager (lowercase keys):

### Storage Directories

```javascript
// Main pages directory
'amdwiki.page.provider.filesystem.storagedir'
  Default: './data/pages'
  Type: String (absolute or relative path)
  Purpose: Primary wiki content storage

// Required pages directory (installation only)
'amdwiki.page.provider.filesystem.requiredpagesdir'
  Default: './required-pages'
  Type: String (absolute or relative path)
  Purpose: System pages copied during installation
```

### Encoding

```javascript
'amdwiki.page.provider.filesystem.encoding'
  Default: 'utf-8'
  Type: String
  Values: 'utf-8', 'utf-16', 'ascii', etc.
  Purpose: File encoding for reading/writing
```

### Plural Matching

```javascript
'amdwiki.translator-reader.match-english-plurals'
  Default: true
  Type: Boolean
  Purpose: Enable fuzzy matching (e.g., "Page" matches "Pages")
```

### Installation State

Installation completion is determined by the presence of the `.install-complete` marker file
in the `INSTANCE_DATA_FOLDER` directory (not a config property). This controls whether
required-pages are loaded (incomplete = load, complete = skip).

### Configuration Example

```json
{
  "amdwiki": {
    "page": {
      "provider": {
        "filesystem": {
          "storagedir": "./data/pages",
          "requiredpagesdir": "./required-pages",
          "encoding": "utf-8"
        }
      }
    },
    "translator-reader": {
      "match-english-plurals": true
    },
    "install": {
      "completed": true
    }
  }
}
```

---

## Initialization

### Initialization Sequence

FileSystemProvider initialization follows this sequence:

1. **Validate ConfigurationManager**
   - Ensures ConfigurationManager is available
   - Throws error if missing

2. **Load Configuration**
   - Reads storage directories
   - Loads encoding setting
   - Checks installation state

3. **Initialize PageNameMatcher**
   - Creates matcher with plural matching config
   - Enables fuzzy page name resolution

4. **Create Directories**
   - Ensures pagesDirectory exists
   - Creates requiredPagesDirectory (if installation incomplete)

5. **Load Page Cache**
   - Scans all .md files from directories
   - Parses frontmatter
   - Builds lookup indexes

6. **Mark Initialized**
   - Sets `initialized = true`
   - Logs page count

### Initialization Code Flow

```javascript
async initialize() {
  // 1. Get ConfigurationManager
  const configManager = this.engine.getManager('ConfigurationManager');
  if (!configManager) {
    throw new Error('FileSystemProvider requires ConfigurationManager');
  }

  // 2. Load storage directories
  const cfgPath = configManager.getProperty(
    'amdwiki.page.provider.filesystem.storagedir',
    './pages'
  );
  this.pagesDirectory = path.isAbsolute(cfgPath)
    ? cfgPath
    : path.join(process.cwd(), cfgPath);

  // 3. Check installation state (from .install-complete marker file)
  this.installationComplete = await this.checkInstallationComplete();

  // 4. Initialize PageNameMatcher
  const matchPlurals = configManager.getProperty(
    'amdwiki.translator-reader.match-english-plurals',
    true
  );
  this.pageNameMatcher = new PageNameMatcher(matchPlurals);

  // 5. Create directories
  await fs.ensureDir(this.pagesDirectory);
  if (!this.installationComplete) {
    await fs.ensureDir(this.requiredPagesDirectory);
  }

  // 6. Load page cache
  await this.refreshPageList();

  this.initialized = true;
  logger.info(`Initialized with ${this.pageCache.size} pages`);
}
```

---

## Page Storage

### File Format

Pages are stored as Markdown files with YAML frontmatter:

```markdown
---
title: My Page Title
uuid: 550e8400-e29b-41d4-a716-446655440000
author: admin
created: 2025-01-22T10:00:00.000Z
modified: 2025-01-22T14:30:00.000Z
system-category: documentation
tags:
  - guide
  - tutorial
slug: my-page-title
---

# Page Content

Markdown content goes here with [WikiLinks] and [{Plugins}].
```

### UUID File Naming

**Why UUIDs?**

- **Unique**: Globally unique identifiers prevent conflicts
- **Stable**: Survives page renames (title changes don't break links)
- **Portable**: Can merge wikis without filename conflicts

**UUID Generation:**

```javascript
const { v4: uuidv4 } = require('uuid');

// New page creation
const uuid = uuidv4(); // e.g., '550e8400-e29b-41d4-a716-446655440000'
const filePath = path.join(pagesDirectory, `${uuid}.md`);
```

### Frontmatter Structure

**Required Fields:**

- `title` - Page title (used for display and lookups)
- `uuid` - Unique identifier (auto-generated if missing)

**Common Fields:**

- `author` - Page creator
- `created` - Creation timestamp
- `modified` - Last modification timestamp
- `system-category` - Category (e.g., 'documentation', 'system')
- `tags` - Array of keywords
- `slug` - URL-friendly name

**Custom Fields:**
Frontmatter supports any Schema.org properties or custom metadata.

---

## Page Retrieval

### Lookup Strategy

FileSystemProvider uses a multi-step lookup strategy:

1. **Try UUID Index** (if identifier looks like UUID)
   - O(1) lookup in `uuidIndex`
   - Exact match on UUID format

2. **Try Title Index**
   - O(1) lookup in `titleIndex`
   - Case-insensitive match

3. **Try Plural Matching** (if enabled)
   - PageNameMatcher fuzzy match
   - Handles "Page" vs "Pages"

4. **Try Slug Index**
   - O(1) lookup in `slugIndex`
   - URL-friendly name match

5. **Return null** (if no matches)

### getPage() Implementation

```javascript
async getPage(identifier) {
  if (!identifier) return null;

  // 1. Resolve identifier to canonical title
  const canonicalKey = await this._resolveIdentifier(identifier);
  if (!canonicalKey) return null;

  // 2. Get page info from cache
  const pageInfo = this.pageCache.get(canonicalKey);
  if (!pageInfo) return null;

  // 3. Read file content
  try {
    const fileContent = await fs.readFile(pageInfo.filePath, this.encoding);
    const { data: metadata, content } = matter(fileContent, {
      engines: { yaml: yamlEngine }
    });

    // 4. Return complete page object
    return {
      title: metadata.title,
      uuid: metadata.uuid || pageInfo.uuid,
      content: content.trim(),
      metadata: metadata,
      filePath: pageInfo.filePath
    };
  } catch (error) {
    logger.error(`Error reading page file: ${pageInfo.filePath}`, error);
    return null;
  }
}
```

### _resolveIdentifier() Logic

```javascript
async _resolveIdentifier(identifier) {
  const id = identifier.trim();

  // 1. Try UUID index (exact match)
  if (this.uuidIndex.has(id)) {
    return this.uuidIndex.get(id);
  }

  // 2. Try title index (case-insensitive)
  const lowerTitle = id.toLowerCase();
  if (this.titleIndex.has(lowerTitle)) {
    return this.titleIndex.get(lowerTitle);
  }

  // 3. Try plural matching (fuzzy)
  if (this.pageNameMatcher) {
    const match = this.pageNameMatcher.findMatch(
      id,
      Array.from(this.titleIndex.keys())
    );
    if (match) {
      return this.titleIndex.get(match.toLowerCase());
    }
  }

  // 4. Try slug index
  if (this.slugIndex.has(lowerTitle)) {
    return this.slugIndex.get(lowerTitle);
  }

  // 5. No match found
  return null;
}
```

---

## Caching System

### Cache Structure

FileSystemProvider uses four Map structures for O(1) lookups:

```javascript
{
  // Main cache (canonical title → page info)
  pageCache: Map {
    'Home' => {
      title: 'Home',
      uuid: '550e8400-e29b-41d4-a716-446655440000',
      filePath: '/path/to/pages/550e8400-....md',
      metadata: { ... }
    },
    'MyPage' => {
      title: 'MyPage',
      uuid: '9f3a4b2c-5d1e-4a8f-b2c9-8e7f6d5c4a3b',
      filePath: '/path/to/pages/9f3a4b2c-....md',
      metadata: { ... }
    }
  },

  // Title index (lowercase title → canonical title)
  titleIndex: Map {
    'home' => 'Home',
    'mypage' => 'MyPage'
  },

  // UUID index (UUID → canonical title)
  uuidIndex: Map {
    '550e8400-e29b-41d4-a716-446655440000' => 'Home',
    '9f3a4b2c-5d1e-4a8f-b2c9-8e7f6d5c4a3b' => 'MyPage'
  },

  // Slug index (slug → canonical title)
  slugIndex: Map {
    'home-page' => 'Home',
    'my-custom-page' => 'MyPage'
  }
}
```

### Cache Population

```javascript
async refreshPageList() {
  // 1. Clear all caches
  this.pageCache.clear();
  this.titleIndex.clear();
  this.uuidIndex.clear();
  this.slugIndex.clear();

  // 2. Scan directories
  const pagesFiles = await this.#walkDir(this.pagesDirectory);
  let allFiles = [...pagesFiles];

  if (!this.installationComplete) {
    const requiredFiles = await this.#walkDir(this.requiredPagesDirectory);
    allFiles = [...pagesFiles, ...requiredFiles];
  }

  // 3. Filter .md files
  const mdFiles = allFiles.filter(f => f.toLowerCase().endsWith('.md'));

  // 4. Parse each file
  for (const filePath of mdFiles) {
    const fileContent = await fs.readFile(filePath, this.encoding);
    const { data: metadata } = matter(fileContent, {
      engines: { yaml: yamlEngine }
    });

    const title = metadata.title;
    const uuid = metadata.uuid || path.basename(filePath, '.md');

    if (!title) {
      logger.warn(`Skipping file with no title: ${filePath}`);
      continue;
    }

    // 5. Build page info
    const pageInfo = {
      title: title,
      uuid: uuid,
      filePath: filePath,
      metadata: metadata
    };

    // 6. Add to caches
    const canonicalKey = title;
    this.pageCache.set(canonicalKey, pageInfo);
    this.titleIndex.set(title.toLowerCase(), canonicalKey);
    this.uuidIndex.set(uuid, canonicalKey);

    if (metadata.slug) {
      this.slugIndex.set(metadata.slug.toLowerCase(), canonicalKey);
    }
  }
}
```

### Cache Invalidation

**When to refresh cache:**

- After `savePage()` - Single page update
- After `deletePage()` - Single page removal
- After `renamePage()` - Title change affects indexes
- Manual refresh via `refreshPageCache()`

**Refresh strategies:**

- **Full refresh**: `await refreshPageList()` - Reloads all pages
- **Incremental**: Update single entry in caches (used by savePage)

---

## Page Resolution

### PageNameMatcher Integration

FileSystemProvider integrates with PageNameMatcher for fuzzy matching:

```javascript
// Initialize with configuration
const matchPlurals = configManager.getProperty(
  'amdwiki.translator-reader.match-english-plurals',
  true
);
this.pageNameMatcher = new PageNameMatcher(matchPlurals);

// Use during resolution
const match = this.pageNameMatcher.findMatch(
  'Pages',  // Search term
  ['Home', 'Page', 'Plugin', 'Plugins']  // Available pages
);
// Returns: 'Page' (matches plural 'Pages')
```

### Plural Matching Examples

| Requested | Available | Match | Reason |
| ----------- | ----------- | ------- | -------- |
| `Page` | `Pages` | ✓ | Singular → Plural |
| `Pages` | `Page` | ✓ | Plural → Singular |
| `Plugin` | `Plugins` | ✓ | Singular → Plural |
| `Box` | `Boxes` | ✓ | Irregular plural |
| `Child` | `Children` | ✗ | Not implemented |

---

## Installation-Aware Loading

### Installation State

FileSystemProvider adapts behavior based on installation state:

**During Installation** (`installationComplete = false`):

- Loads pages from **both** directories:
  - `pagesDirectory` (./data/pages)
  - `requiredPagesDirectory` (./required-pages)
- Allows required pages to be accessible for copying

**After Installation** (`installationComplete = true`):

- Loads pages from **only** `pagesDirectory`
- Skips `requiredPagesDirectory` entirely
- Required pages already copied to pagesDirectory

### Why This Design?

**Problem**: Required pages (system docs, templates) should:

1. Be available during installation (for copying)
2. NOT appear in production wiki (avoid duplicates)

**Solution**: Installation-aware loading

- Installation copies required-pages → pagesDirectory
- After install, only pagesDirectory is scanned
- Required-pages folder remains for future installs

### Implementation

```javascript
async refreshPageList() {
  const pagesFiles = await this.#walkDir(this.pagesDirectory);
  let allFiles = [...pagesFiles];

  if (!this.installationComplete) {
    // During installation: include required-pages
    const requiredFiles = await this.#walkDir(this.requiredPagesDirectory);
    allFiles = [...pagesFiles, ...requiredFiles];
    logger.info(`Install mode: including ${requiredFiles.length} required pages`);
  }

  // Process all files...
}
```

---

## Methods Reference

### Initialization Methods

#### `async initialize()`

Initialize the provider with configuration.

**Returns:** `Promise<void>`

**Throws:** Error if ConfigurationManager unavailable

**Example:**

```javascript
await provider.initialize();
```

---

### Page Retrieval Methods

#### `async getPage(identifier)`

Get complete page by title/UUID/slug.

**Parameters:**

- `identifier` (String) - Page title, UUID, or slug

**Returns:** `Promise<Object|null>` - Page object or null if not found

**Page Object Structure:**

```javascript
{
  title: 'Home',
  uuid: '550e8400-e29b-41d4-a716-446655440000',
  content: '# Home\n\nWelcome to the wiki!',
  metadata: {
    title: 'Home',
    uuid: '550e8400-...',
    author: 'admin',
    created: '2025-01-22T10:00:00.000Z',
    ...
  },
  filePath: '/path/to/pages/550e8400-....md'
}
```

**Example:**

```javascript
const page = await provider.getPage('Home');
if (page) {
  console.log(page.title);   // 'Home'
  console.log(page.content); // Markdown content
}
```

---

#### `async getAllPages()`

Get all pages (titles and UUIDs only, no content).

**Returns:** `Promise<Array>` - Array of page info objects

**Example:**

```javascript
const pages = await provider.getAllPages();
// [
//   { title: 'Home', uuid: '550e8400-...', metadata: {...} },
//   { title: 'MyPage', uuid: '9f3a4b2c-...', metadata: {...} }
// ]
```

---

#### `async pageExists(identifier)`

Check if page exists.

**Parameters:**

- `identifier` (String) - Page title, UUID, or slug

**Returns:** `Promise<Boolean>`

**Example:**

```javascript
if (await provider.pageExists('Home')) {
  console.log('Home page exists');
}
```

---

### Page Storage Methods

#### `async savePage(identifier, pageData)`

Create or update a page.

**Parameters:**

- `identifier` (String) - Page title (for new pages) or title/UUID (for updates)
- `pageData` (Object) - Page data:
  - `title` (String, required) - Page title
  - `content` (String, required) - Markdown content
  - `author` (String, optional) - Author name
  - `metadata` (Object, optional) - Additional frontmatter

**Returns:** `Promise<void>`

**Example:**

```javascript
await provider.savePage('NewPage', {
  title: 'New Page',
  content: '# New Content\n\nWelcome!',
  author: 'admin',
  metadata: {
    tags: ['new', 'guide'],
    'system-category': 'documentation'
  }
});
```

---

#### `async deletePage(identifier)`

Delete a page.

**Parameters:**

- `identifier` (String) - Page title or UUID

**Returns:** `Promise<Boolean>` - true if deleted, false if not found

**Example:**

```javascript
const deleted = await provider.deletePage('OldPage');
if (deleted) {
  console.log('Page deleted');
}
```

---

#### `async renamePage(oldIdentifier, newTitle)`

Rename a page (preserves UUID, updates title).

**Parameters:**

- `oldIdentifier` (String) - Current page title or UUID
- `newTitle` (String) - New page title

**Returns:** `Promise<Boolean>` - true if renamed, false if not found

**Example:**

```javascript
await provider.renamePage('OldTitle', 'NewTitle');
// UUID preserved, filename unchanged, title in frontmatter updated
```

---

### Cache Methods

#### `async refreshPageCache()`

Reload all pages from disk into cache (alias for refreshPageList).

**Returns:** `Promise<void>`

**Example:**

```javascript
await provider.refreshPageCache();
console.log(`Refreshed ${provider.pageCache.size} pages`);
```

---

### Utility Methods

#### `async backup()`

Create backup of all pages.

**Returns:** `Promise<Object>` - Backup data

**Backup Structure:**

```javascript
{
  pages: [
    {
      title: 'Home',
      uuid: '550e8400-...',
      content: '# Home\n...',
      metadata: { ... }
    },
    ...
  ],
  metadata: {
    timestamp: '2025-01-22T10:00:00.000Z',
    pageCount: 42,
    provider: 'FileSystemProvider'
  }
}
```

---

#### `async restore(backupData)`

Restore pages from backup.

**Parameters:**

- `backupData` (Object) - Backup data from `backup()`

**Returns:** `Promise<void>`

**Example:**

```javascript
const backup = await provider.backup();
// ... disaster occurs ...
await provider.restore(backup);
```

---

## Error Handling

### Common Errors

**Missing ConfigurationManager:**

```javascript
Error: FileSystemProvider requires ConfigurationManager
```

**Solution:** Ensure WikiEngine initializes ConfigurationManager before FileSystemProvider

**File Read Errors:**

```javascript
Error reading page file: /path/to/page.md
ENOENT: no such file or directory
```

**Solution:** Check file exists, verify permissions, ensure UUID matches filename

**Invalid Frontmatter:**

```javascript
Failed to process page file: invalid YAML
```

**Solution:** Validate YAML syntax in frontmatter, ensure `---` delimiters present

### Error Handling Patterns

```javascript
try {
  const page = await provider.getPage('MyPage');
} catch (error) {
  logger.error('Failed to get page:', error);
  // Returns null on errors (no exception thrown)
}

// Check before operations
if (await provider.pageExists('MyPage')) {
  await provider.savePage('MyPage', { ... });
} else {
  console.log('Page does not exist');
}
```

---

## Performance

### Performance Characteristics

**Initialization:**

- **Time:** O(n) where n = number of pages
- **Typical:** 100 pages in ~200ms
- **Large wiki:** 10,000 pages in ~3 seconds

**Page Retrieval:**

- **Time:** O(1) lookup + file read
- **Cache hit:** ~1ms (Map lookup)
- **File read:** ~5-10ms (depends on disk)

**Page Save:**

- **Time:** File write + cache update
- **Typical:** ~10-20ms
- **Large page:** ~50ms

**Cache Refresh:**

- **Full refresh:** Same as initialization
- **Incremental:** ~1ms per page

### Optimization Tips

1. **Avoid refreshPageCache() in loops**

   ```javascript
   // Bad
   for (const page of pages) {
     await provider.refreshPageCache(); // O(n²)
   }

   // Good
   for (const page of pages) {
     await provider.savePage(page.title, page); // Incremental update
   }
   await provider.refreshPageCache(); // Single refresh at end
   ```

2. **Use getAllPages() for listings**

   ```javascript
   // getAllPages() returns cached data (fast)
   const pages = await provider.getAllPages();

   // Don't call getPage() for every page (slow)
   for (const page of pages) {
     const fullPage = await provider.getPage(page.title); // Avoid
   }
   ```

3. **Batch operations**

   ```javascript
   // Batch saves with single refresh
   for (const page of pages) {
     await provider.savePage(page.title, page);
   }
   await provider.refreshPageCache(); // Single refresh
   ```

---

## Migration Guide

### From Legacy Storage

If migrating from older storage systems:

1. **Convert filenames to UUID format**
2. **Add UUID to frontmatter**
3. **Run refreshPageCache()**

### To Database Storage

To migrate to database provider:

1. Implement BasePageProvider interface
2. Export data via `backup()`
3. Import to database
4. Switch provider in config

---

## Troubleshooting

### Pages Not Found

**Symptom:** `getPage('MyPage')` returns null

**Checks:**

1. Verify title case matches (try different cases)
2. Check UUID exists in file
3. Run `refreshPageCache()`
4. Check file has `title` in frontmatter
5. Verify file is .md extension

### Required Pages Showing in Production

**Symptom:** System pages appear in page listings

**Solution:** Ensure the `.install-complete` marker file exists in `INSTANCE_DATA_FOLDER`

### Cache Out of Sync

**Symptom:** Recent changes not reflected

**Solution:** Call `await provider.refreshPageCache()`

### Plural Matching Not Working

**Symptom:** "Page" doesn't match "Pages"

**Solution:** Verify `amdwiki.translator-reader.match-english-plurals: true`

---

## Related Documentation

- **Quick Reference:** [FileSystemProvider.md](FileSystemProvider.md)
- **Base Class:** [BasePageProvider.md](BasePageProvider.md)
- **Manager:** [PageManager.md](../managers/PageManager.md)
- **Architecture:** [FileSystemProvider-Design.md](../architecture/FileSystemProvider-Design.md)
- **Extended Version:** [VersioningFileProvider.md](VersioningFileProvider.md)

---

**Last Updated:** 2025-12-22
**Version:** 1.5.0
