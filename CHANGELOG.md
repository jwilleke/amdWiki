# Changelog

All notable changes to amdWiki will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.4.0] - 2024-10-16

### Added - Version History Feature (Epic #124)

Complete page versioning system with JSPWiki-style version management.

#### Phase 1-2: Foundation & Core Provider
- **VersioningFileProvider**: File-based storage with complete version history
  - Delta storage using fast-diff algorithm (80-90% space savings)
  - Gzip compression for old versions
  - Checkpoint system every N versions for fast retrieval
  - LRU cache for recently accessed versions
  - Backward compatible with FileSystemProvider
- **DeltaStorage utility**: Efficient diff creation and application
- **VersionCompression utility**: Gzip compression/decompression

#### Phase 3: Version Retrieval & Restoration
- `getVersionHistory()` - Retrieve all versions for a page
- `getPageVersion()` - Get specific version content
- `compareVersions()` - Compare any two versions with diff
- `restoreVersion()` - Restore page to previous version (creates new version)
- Metadata tracking: author, date, change type, comment, content hash

#### Phase 4: Migration & Initialization
- Automatic migration from FileSystemProvider on first startup
- Creates v1 for all existing pages
- Builds centralized page-index.json
- Zero downtime deployment
- Manual migration script: `npm run migrate:versioning`

#### Phase 5: Maintenance & Optimization
- `purgeOldVersions()` - Clean up old versions with retention policies
- Configurable retention: maxVersions and retentionDays
- Milestone preservation (v1, every 10th version)
- Storage analytics and reporting
- CLI maintenance tool: `npm run maintain:*`
- Compression of old versions
- Integrity verification

#### Phase 6: UI Integration
- **REST API Endpoints**:
  - `GET /api/page/:identifier/versions` - List versions
  - `GET /api/page/:identifier/version/:version` - Get version
  - `GET /api/page/:identifier/compare/:v1/:v2` - Compare versions
  - `POST /api/page/:identifier/restore/:version` - Restore version
- **Page History View** (`/history/:page`):
  - Complete version list with metadata table
  - Visual indicators (current, checkpoints, compression)
  - View, compare, and restore actions
  - AJAX-powered version preview modal
- **Diff Viewer** (`/diff/:page`):
  - Unified and side-by-side comparison modes
  - Syntax highlighting (additions/deletions/unchanged)
  - Diff statistics
- **Page View Integration**:
  - Version info banner on all pages
  - Info dropdown → Page History link
  - Quick access to version features

#### Phase 7: Testing & Documentation
- **Comprehensive Test Suite**:
  - 28 API endpoint tests (100% coverage)
  - Unit tests for VersioningFileProvider
  - Integration tests for UI workflows
  - Edge case and security testing
- **User Documentation**:
  - Complete user guide (45+ pages)
  - Step-by-step instructions
  - FAQ and troubleshooting
- **API Documentation**:
  - Full REST API reference (25+ pages)
  - Request/response examples
  - Integration examples (React, Node.js)
- **Admin Documentation**:
  - Deployment guide
  - Configuration reference
  - Performance tuning
  - Backup and recovery procedures

### Configuration

New versioning configuration options:

```json
{
  "amdwiki.page.provider": "versioningfileprovider",
  "amdwiki.page.provider.versioning.maxversions": 50,
  "amdwiki.page.provider.versioning.retentiondays": 365,
  "amdwiki.page.provider.versioning.compression": "gzip",
  "amdwiki.page.provider.versioning.deltastorage": true,
  "amdwiki.page.provider.versioning.checkpointinterval": 10,
  "amdwiki.page.provider.versioning.cachesize": 50
}
```

### Technical Details

**New Files**:
- `src/providers/VersioningFileProvider.js` - Main provider implementation
- `src/utils/DeltaStorage.js` - Diff algorithm wrapper
- `src/utils/VersionCompression.js` - Compression utilities
- `src/utils/VersioningMigration.js` - Migration utilities
- `scripts/migrate-to-versioning.js` - Migration CLI
- `scripts/maintain-versions.js` - Maintenance CLI
- `views/page-history.ejs` - History view template
- `views/page-diff.ejs` - Diff viewer template

**Modified Files**:
- `src/routes/WikiRoutes.js` - Added 4 API + 2 view routes
- `views/view.ejs` - Added version info banner
- `views/header.ejs` - Updated Page History link

**Tests**:
- `src/providers/__tests__/VersioningFileProvider.test.js`
- `src/providers/__tests__/VersioningFileProvider-Maintenance.test.js`
- `src/utils/__tests__/DeltaStorage.test.js`
- `src/utils/__tests__/VersionCompression.test.js`
- `src/routes/__tests__/WikiRoutes.versioning.test.js`

**Documentation**:
- `docs/user-guide/Using-Version-History.md`
- `docs/api/Versioning-API.md`
- `docs/admin/Versioning-Deployment-Guide.md`
- `docs/Versioning-Maintenance-Guide.md`
- `docs/Phase-6-Implementation-Summary.md`
- `docs/planning/Versioning-Implementation.md`

### Performance

- Version retrieval: <100ms for <50 versions
- Diff generation: <500ms for typical pages
- Storage overhead: 10-20% with delta storage + compression
- Memory overhead: ~2MB for 100-entry cache (average 20KB/page)

### Breaking Changes

None. VersioningFileProvider is opt-in and fully backward compatible.

### Migration

To enable versioning:
1. Update config: `"amdwiki.page.provider": "versioningfileprovider"`
2. Restart application
3. Version history created automatically for all pages

To disable versioning:
1. Update config: `"amdwiki.page.provider": "filesystemprovider"`
2. Restart application
3. Version data preserved for future re-enabling

### Dependencies

No new dependencies required. Uses existing:
- `fast-diff@1.3.0` (already installed in Phase 1)
- `pako@2.1.0` (already installed in Phase 1)
- `fs-extra@11.3.0` (existing)
- `uuid@9.0.0` (existing)

### Known Limitations

- No pagination for >100 versions per page (acceptable for most use cases)
- No version filtering by author/date in UI
- No bulk operations (restore multiple pages)
- No conflict resolution for concurrent edits during restore

### Future Enhancements

See issue #124 for planned Phase 7+ features.

---

## [1.3.2] - 2024-10-14

### Fixed
- Various bug fixes and improvements

### Documentation
- Enhanced project documentation structure
- Added comprehensive architecture guides

---

## [1.3.1] - 2024-10-10

### Added
- WikiDocument DOM parser
- Enhanced JSPWiki compatibility
- Improved test coverage

---

## [1.3.0] - 2024-10-01

### Added
- Policy-based access control
- Audit trail system
- Admin dashboard
- Time-based permissions

---

## [1.2.0] - 2024-09-15

### Added
- Advanced search functionality
- Multi-criteria filtering
- Category organization
- Plugin system

---

## [1.1.0] - 2024-09-01

### Added
- Image upload functionality
- Inline image support
- Attachment management

---

## [1.0.0] - 2024-08-15

### Added
- Initial release
- Basic wiki functionality
- Markdown support
- File-based storage
- JSPWiki-style links
- Bootstrap UI
- Three-state authentication

---

## Version Numbering

- **Major** (X.0.0): Breaking changes, major features
- **Minor** (1.X.0): New features, backward compatible
- **Patch** (1.0.X): Bug fixes, minor improvements

---

## Links

- [GitHub Repository](https://github.com/jwilleke/amdWiki)
- [Documentation](./docs/)
- [Issue Tracker](https://github.com/jwilleke/amdWiki/issues)

---

**Note**: This changelog was formalized starting with version 1.4.0. Previous version entries are abbreviated. For detailed git history, see commit logs.
