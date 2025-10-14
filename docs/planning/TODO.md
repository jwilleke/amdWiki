---
title: VersioningFileProvider Implementation Plan
category: System
user-keywords:
  - versioning
  - development
  - planning
uuid: 124f3d52-75a0-4e61-8008-de37d1da4ef6
lastModified: '2025-10-14T00:00:00.000Z'
slug: versioning-implementation-plan
---

# VersioningFileProvider Implementation Plan

Implementation plan for adding page versioning to amdWiki following JSPWiki's versioning model.

**Reference Document**: [Versioning-Implementation.md](./Versioning-Implementation.md)

## Project Overview

**Goal**: Implement VersioningFileProvider to provide git-style page versioning with delta storage.

**Key Features**:
- Per-page version history with delta storage
- Minimal migration (pages stay in current locations)
- Centralized metadata index for fast lookups
- Compression and retention policies
- UI integration with existing Page History functionality

**Status**: Planning Complete → Ready for Implementation

---

## Phase 1: Foundation & Dependencies (Week 1)

**Objective**: Install dependencies and extend BasePageProvider interface

### Tasks

#### 1.1 Install Required Libraries
```bash
npm install fast-diff      # Text diffing (Myers algorithm)
npm install pako           # gzip compression/decompression
```
- [ ] Add to package.json
- [ ] Test imports in Node.js environment
- [ ] Document library choices in CONTRIBUTING.md

#### 1.2 Extend BasePageProvider Interface
**File**: `src/providers/BasePageProvider.js`

Add new abstract methods for versioning:
- [ ] `async getVersionHistory(identifier)` - Returns array of version metadata
- [ ] `async getPageVersion(identifier, version)` - Returns specific version content
- [ ] `async restoreVersion(identifier, version)` - Restores page to version
- [ ] `async compareVersions(identifier, v1, v2)` - Returns diff between versions
- [ ] `async purgeOldVersions(identifier, keepLatest)` - Cleanup old versions

**Acceptance Criteria**:
- All methods documented with JSDoc
- Throw "must be implemented" errors (abstract pattern)
- FileSystemProvider still works (doesn't implement versioning methods)

#### 1.3 Create Utility Modules
**File**: `src/utils/DeltaStorage.js`

Implement delta storage utilities:
- [ ] `createDiff(oldContent, newContent)` - Generate diff using fast-diff
- [ ] `applyDiff(baseContent, diff)` - Reconstruct content from diff
- [ ] `applyDiffChain(v1Content, diffArray)` - Apply multiple diffs sequentially
- [ ] Unit tests for diff operations

**File**: `src/utils/VersionCompression.js`

Implement compression utilities:
- [ ] `compress(content)` - gzip compression using pako
- [ ] `decompress(compressed)` - gzip decompression
- [ ] `compressFile(filePath)` - Compress file in place
- [ ] Unit tests for compression

**Deliverables**:
- Dependencies installed
- BasePageProvider extended
- Utility modules with 90%+ test coverage

---

## Phase 2: VersioningFileProvider Core (Week 2-3)

**Objective**: Create VersioningFileProvider extending FileSystemProvider

### Tasks

#### 2.1 Create VersioningFileProvider Class
**File**: `src/providers/VersioningFileProvider.js`

Basic structure:
- [ ] Extend FileSystemProvider
- [ ] Add constructor with versioning-specific properties
- [ ] Override `initialize()` to setup version directories
- [ ] Load versioning configuration from ConfigurationManager

```javascript
class VersioningFileProvider extends FileSystemProvider {
  constructor(engine) {
    super(engine);
    this.pageIndexPath = null;
    this.maxVersions = 50;
    this.retentionDays = 365;
    this.compressionEnabled = true;
    this.deltaStorageEnabled = true;
  }
  // ... implementation
}
```

#### 2.2 Implement Configuration Loading
- [ ] Read `amdwiki.page.provider.versioning.*` config
- [ ] Setup paths: `./data/page-index.json`
- [ ] Create `./pages/versions/` directory
- [ ] Create `./required-pages/versions/` directory
- [ ] Validate configuration values

#### 2.3 Implement Version Creation
Override `savePage()` to create versions:
- [ ] Check if page exists (determine if create or update)
- [ ] Load current version content
- [ ] Create diff using DeltaStorage utility
- [ ] Create version directory structure
- [ ] Write version files (content.md or content.diff + meta.json)
- [ ] Update manifest.json
- [ ] Call parent `savePage()` for current content
- [ ] Update page-index.json

**Version Directory Structure**:
```text
./pages/versions/{uuid}/
  ├── manifest.json
  ├── v1/
  │   ├── content.md      (full content)
  │   └── meta.json
  ├── v2/
  │   ├── content.diff    (delta from v1)
  │   └── meta.json
  └── v3/
      ├── content.diff    (delta from v2)
      └── meta.json
```

#### 2.4 Implement manifest.json Management
**Format**:
```json
{
  "pageId": "uuid",
  "pageName": "Page Title",
  "currentVersion": 3,
  "versions": [
    {
      "version": 1,
      "dateCreated": "2025-01-01T00:00:00.000Z",
      "author": "user@example.com",
      "changeType": "created",
      "comment": "Initial version",
      "contentHash": "sha256...",
      "contentSize": 1234,
      "compressed": false
    },
    {
      "version": 2,
      "dateCreated": "2025-01-02T10:30:00.000Z",
      "author": "editor@example.com",
      "changeType": "updated",
      "comment": "Added section",
      "contentHash": "sha256...",
      "contentSize": 567,
      "compressed": false,
      "isDelta": true
    }
  ]
}
```

Tasks:
- [ ] `loadManifest(uuid)` - Load manifest.json
- [ ] `saveManifest(uuid, manifest)` - Save manifest.json
- [ ] `addVersionToManifest(uuid, versionData)` - Append version entry
- [ ] Handle missing/corrupted manifests gracefully

#### 2.5 Implement page-index.json
**Format**:
```json
{
  "version": "1.0.0",
  "lastUpdated": "2025-01-01T00:00:00.000Z",
  "pageCount": 150,
  "pages": {
    "uuid-1": {
      "title": "Welcome",
      "uuid": "uuid-1",
      "currentVersion": 5,
      "location": "pages",
      "lastModified": "2025-01-01T00:00:00.000Z",
      "author": "admin",
      "hasVersions": true
    },
    "uuid-2": {
      "title": "LeftMenu",
      "uuid": "uuid-2",
      "currentVersion": 2,
      "location": "required-pages",
      "lastModified": "2025-01-01T00:00:00.000Z",
      "author": "system",
      "hasVersions": true
    }
  }
}
```

Tasks:
- [ ] `loadPageIndex()` - Load entire index
- [ ] `savePageIndex()` - Save entire index
- [ ] `updatePageInIndex(uuid, data)` - Update single page entry
- [ ] `buildPageIndex()` - Scan filesystem and build index from scratch
- [ ] Atomic writes (write to temp, then rename)

**Deliverables**:
- VersioningFileProvider class created
- Version creation working on page saves
- manifest.json and page-index.json functional

---

## Phase 3: Version Retrieval & Restoration (Week 4)

**Objective**: Implement methods to retrieve and restore versions

### Tasks

#### 3.1 Implement getVersionHistory()
```javascript
async getVersionHistory(identifier) {
  // 1. Resolve page UUID from identifier
  // 2. Load manifest.json
  // 3. Return versions array
}
```
- [ ] Handle missing version directory (return empty array)
- [ ] Sort versions by version number
- [ ] Include metadata from manifest

#### 3.2 Implement getPageVersion()
```javascript
async getPageVersion(identifier, version) {
  // 1. Load manifest for this page
  // 2. If version 1: read content.md directly
  // 3. If version > 1:
  //    - Load v1 content
  //    - Load all diffs from v2 to target version
  //    - Apply diffs sequentially
  // 4. Decompress if needed
  // 5. Return {content, metadata}
}
```
- [ ] Handle missing versions
- [ ] Validate version numbers
- [ ] Apply diff chain correctly
- [ ] Cache reconstructed versions (optional optimization)

#### 3.3 Implement restoreVersion()
```javascript
async restoreVersion(identifier, version) {
  // 1. Get version content using getPageVersion()
  // 2. Save as new version with changeType: "restored"
  // 3. Update page-index.json
  // 4. Log restoration action
}
```
- [ ] Add "restored from v{X}" in version comment
- [ ] Preserve original metadata where appropriate
- [ ] Trigger backup before restore (safety)

#### 3.4 Implement compareVersions()
```javascript
async compareVersions(identifier, v1, v2) {
  // 1. Load both versions
  // 2. Generate diff using fast-diff
  // 3. Format diff for display
  // 4. Return structured diff data
}
```
- [ ] Support line-by-line diff
- [ ] Support unified diff format
- [ ] Include metadata changes

**Deliverables**:
- All retrieval methods working
- Version reconstruction tested with 10+ version chains
- Restore functionality tested

---

## Phase 4: Migration & Initialization (Week 5)

**Objective**: Implement migration from FileSystemProvider to VersioningFileProvider

### Tasks

#### 4.1 Implement Migration Detection
In `initialize()`:
```javascript
async initialize() {
  await super.initialize(); // FileSystemProvider init

  // Check if page-index.json exists
  const indexExists = await fs.pathExists(this.pageIndexPath);

  if (!indexExists) {
    logger.info('[VersioningFileProvider] First run - initiating migration...');
    await this.runMigration();
  } else {
    logger.info('[VersioningFileProvider] Loading existing version data...');
    await this.loadPageIndex();
  }
}
```

#### 4.2 Implement Migration Process
```javascript
async runMigration() {
  // 1. Trigger BackupManager
  // 2. Scan existing pages
  // 3. Create v1 for each page
  // 4. Build page-index.json
  // 5. Create .migration-complete marker
  // 6. Log migration summary
}
```

Tasks:
- [ ] Integrate with BackupManager
- [ ] Scan `./pages/` and `./required-pages/`
- [ ] For each .md file:
  - [ ] Read content and frontmatter
  - [ ] Extract UUID (or use filename)
  - [ ] Create `versions/{uuid}/` directory
  - [ ] Create `v1/content.md` (full content)
  - [ ] Create `v1/meta.json` with file timestamps
  - [ ] Create initial `manifest.json`
- [ ] Build complete page-index.json
- [ ] Verify all pages migrated
- [ ] Create `./data/.migration-complete` marker file

#### 4.3 Handle Migration Errors
- [ ] Rollback capability if migration fails
- [ ] Detailed error logging
- [ ] Migration progress reporting
- [ ] Skip already-migrated pages (idempotent)

#### 4.4 Create Migration Report
Generate `./data/migration-report.json`:
```json
{
  "migrationDate": "2025-01-01T00:00:00.000Z",
  "success": true,
  "pagesProcessed": 150,
  "requiredPagesProcessed": 25,
  "errors": [],
  "duration": "12.5s",
  "backupCreated": "./backups/backup-2025-01-01.tar.gz"
}
```

**Deliverables**:
- Migration process tested with sample data
- Rollback tested
- Migration documentation written

---

## Phase 5: Maintenance & Optimization (Week 6)

**Objective**: Implement version retention, compression, and cleanup

### Tasks

#### 5.1 Implement Version Purging
```javascript
async purgeOldVersions(identifier, keepLatest) {
  // 1. Load manifest
  // 2. Determine versions to delete based on:
  //    - maxVersions config
  //    - retentionDays config
  //    - keepLatest parameter
  // 3. Delete old version directories
  // 4. Update manifest.json
}
```
- [ ] Respect `maxversions` config
- [ ] Respect `retentiondays` config
- [ ] Always keep v1 (needed for delta reconstruction)
- [ ] Always keep latest N versions
- [ ] Log deleted versions

#### 5.2 Implement Compression
Background task to compress old versions:
- [ ] Scan versions older than 30 days
- [ ] Compress content.md / content.diff files
- [ ] Update manifest with `compressed: true`
- [ ] Add `compressOldVersions()` method

#### 5.3 Implement Integrity Checks
```javascript
async verifyPageIntegrity(identifier) {
  // 1. Load manifest
  // 2. Verify all version files exist
  // 3. Verify content hashes
  // 4. Attempt to reconstruct each version
  // 5. Report any corruption
}
```
- [ ] SHA-256 hash verification
- [ ] Reconstruct all versions to verify diff chain
- [ ] Report missing files
- [ ] Auto-repair if possible

#### 5.4 Create Maintenance CLI Commands
Add to server or create maintenance script:
- [ ] `npm run maintenance:purge-old-versions` - Run purge on all pages
- [ ] `npm run maintenance:compress-versions` - Compress old versions
- [ ] `npm run maintenance:verify-integrity` - Check all pages
- [ ] `npm run maintenance:rebuild-index` - Rebuild page-index.json

**Deliverables**:
- Purging functionality tested
- Compression working
- Integrity checks passing
- Maintenance commands functional

---

## Phase 6: UI Integration (Week 7)

**Objective**: Connect versioning to existing UI (Page History)

### Tasks

#### 6.1 Add REST API Endpoints
**File**: `src/routes/WikiRoutes.js`

Add endpoints:
- [ ] `GET /api/pages/:page/versions` → getVersionHistory()
- [ ] `GET /api/pages/:page/versions/:version` → getPageVersion()
- [ ] `POST /api/pages/:page/versions/:version/restore` → restoreVersion()
- [ ] `GET /api/pages/:page/diff?v1=X&v2=Y` → compareVersions()
- [ ] `DELETE /api/pages/:page/versions/:version` → purgeVersions()

Add permission checks:
- [ ] Viewing versions: `page:read` permission
- [ ] Restoring versions: `page:edit` permission
- [ ] Purging versions: `admin` role only

#### 6.2 Update Page History UI
Currently exists at "Info" → "Page History" dropdown.

Tasks:
- [ ] Modify PageInfo endpoint to call `getVersionHistory()`
- [ ] Display version list with timestamps and authors
- [ ] Add "View" button for each version
- [ ] Add "Restore" button for each version
- [ ] Add "Compare" button to compare versions

#### 6.3 Update Diff Viewer
Currently exists at `Diff.jsp?page=X&r1=Y&r2=Z`

Tasks:
- [ ] Modify diff endpoint to use `compareVersions()`
- [ ] Display side-by-side or unified diff
- [ ] Highlight changes (additions/deletions)
- [ ] Show metadata changes

#### 6.4 Add Version Info to Page View
- [ ] Display current version number in page info
- [ ] Add "Version X of Y" indicator
- [ ] Link to version history

**Deliverables**:
- REST API endpoints tested
- UI integrated with versioning backend
- User can view, compare, and restore versions

---

## Phase 7: Testing & Documentation (Week 8)

**Objective**: Comprehensive testing and documentation

### Tasks

#### 7.1 Unit Tests
- [ ] `src/providers/VersioningFileProvider.test.js` - All provider methods
- [ ] `src/utils/DeltaStorage.test.js` - Diff creation/application
- [ ] `src/utils/VersionCompression.test.js` - Compression
- [ ] Coverage target: 90%+

#### 7.2 Integration Tests
- [ ] Full migration test with sample wiki
- [ ] Version creation on page edits
- [ ] Version retrieval and restoration
- [ ] Concurrent edit handling
- [ ] Corruption recovery

#### 7.3 Performance Tests
- [ ] Test with 1000+ pages
- [ ] Test with 100+ versions per page
- [ ] Measure reconstruction time for v50, v100
- [ ] Measure disk space savings with delta storage
- [ ] Benchmark page-index.json lookup performance

#### 7.4 Documentation
- [ ] **User Guide**: How to view/restore versions (add to main docs)
- [ ] **Admin Guide**: Migration process, maintenance tasks
- [ ] **API Documentation**: REST endpoints (OpenAPI spec)
- [ ] **Developer Guide**: Extending VersioningFileProvider
- [ ] Update CONTRIBUTING.md with versioning architecture

**Deliverables**:
- All tests passing
- Performance benchmarks documented
- User and admin documentation complete

---

## Configuration Summary

### app-default-config.json (NO CHANGES)
```json
{
  "amdwiki.page.provider": "filesystemprovider",
  "amdwiki.page.provider.filesystem.storagedir": "./pages",
  "amdwiki.page.provider.filesystem.requiredpagesdir": "./required-pages"
}
```

### app-custom-config.json (ENABLE VERSIONING)
```json
{
  "amdwiki.page.provider": "versioningfileprovider",
  "amdwiki.page.provider.versioning.storagedir": "./pages",
  "amdwiki.page.provider.versioning.requiredpagesdir": "./required-pages",
  "amdwiki.page.provider.versioning.indexfile": "./data/page-index.json",
  "amdwiki.page.provider.versioning.maxversions": 50,
  "amdwiki.page.provider.versioning.retentiondays": 365,
  "amdwiki.page.provider.versioning.compression": "gzip",
  "amdwiki.page.provider.versioning.deltastorage": true
}
```

---

## Risk Assessment

| Risk | Mitigation |
|------|------------|
| **Migration data loss** | Mandatory BackupManager integration, rollback capability |
| **Version reconstruction failure** | Integrity checks, keep v1 always, comprehensive tests |
| **Disk space growth** | Delta storage, compression, retention policies |
| **Performance degradation** | Lazy loading, caching, page-index for fast lookups |
| **Concurrent edit conflicts** | Page locking (future phase), optimistic locking with hashes |

---

## Success Criteria

- [ ] All existing functionality (FileSystemProvider) still works
- [ ] Users can view version history for any page
- [ ] Users can compare any two versions
- [ ] Users can restore to any previous version
- [ ] Versions are stored efficiently with delta storage
- [ ] Migration completes successfully on test wiki
- [ ] Performance impact < 10% on page saves
- [ ] Disk space usage < 150% of current (with 50 versions/page)
- [ ] All tests pass with 90%+ coverage
- [ ] Documentation complete

---

## Timeline

**Total Duration**: 8 weeks

| Phase | Duration | Dependencies |
|-------|----------|--------------|
| Phase 1: Foundation | Week 1 | None |
| Phase 2: Core Provider | Weeks 2-3 | Phase 1 |
| Phase 3: Retrieval | Week 4 | Phase 2 |
| Phase 4: Migration | Week 5 | Phase 3 |
| Phase 5: Maintenance | Week 6 | Phase 4 |
| Phase 6: UI Integration | Week 7 | Phase 5 |
| Phase 7: Testing & Docs | Week 8 | All phases |

---

## References

- [JSPWiki VersioningFileProvider](https://jspwiki-wiki.apache.org/Wiki.jsp?page=VersioningFileProvider)
- [Versioning-Implementation.md](./Versioning-Implementation.md)
- [FileSystemProvider.js](../../src/providers/FileSystemProvider.js)
- [BasePageProvider.js](../../src/providers/BasePageProvider.js)

---

**Last Updated**: October 14, 2025
**Status**: Ready for Implementation
**Next Step**: Phase 1 - Install dependencies and extend BasePageProvider
