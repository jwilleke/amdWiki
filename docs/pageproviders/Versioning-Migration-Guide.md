# Versioning Migration Guide

Complete guide for migrating existing amdWiki installations from FileSystemProvider to VersioningFileProvider.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Overview](#overview)
- [Before You Begin](#before-you-begin)
- [Migration Steps](#migration-steps)
- [Post-Migration](#post-migration)
- [Troubleshooting](#troubleshooting)
- [Rollback](#rollback)
- [FAQ](#faq)

## Prerequisites

- **amdWiki version**: 1.3.2 or higher
- **Node.js version**: 14.x or higher
- **Disk space**: At least 2x your current pages directory size (for safety margin)
- **Backup**: Complete backup of your wiki data (mandatory)

## Overview

The migration process converts your existing pages to versioned format without modifying the original page files. The migration:

1. **Discovers** all existing pages in `./pages/` and `./required-pages/`
2. **Creates** version directories alongside existing pages
3. **Generates** v1 (initial version) for each page
4. **Builds** centralized page index for fast lookups
5. **Validates** migration integrity

**Time Estimate**:

- Small wiki (< 100 pages): 1-2 minutes
- Medium wiki (100-1000 pages): 5-10 minutes
- Large wiki (> 1000 pages): 15-30 minutes

**Data Safety**:

- ✅ Original page files are **NOT** modified
- ✅ Version directories are created separately
- ✅ Migration can be rolled back
- ✅ Content integrity verified with SHA-256 hashes

## Before You Begin

### 1. Backup Your Data

**CRITICAL**: Create a complete backup before proceeding.

```bash
# Example backup command (adjust paths as needed)
tar -czf amdwiki-backup-$(date +%Y%m%d-%H%M%S).tar.gz \
  ./pages \
  ./required-pages \
  ./app-custom-config.json \
  ./app-default-config.json
```

Verify your backup:

```bash
# Check backup file size is reasonable
ls -lh amdwiki-backup-*.tar.gz

# Test extraction (in a temp directory)
mkdir /tmp/backup-test
tar -xzf amdwiki-backup-*.tar.gz -C /tmp/backup-test
rm -rf /tmp/backup-test
```

### 2. Check Disk Space

```bash
# Check current pages size
du -sh ./pages ./required-pages

# Check available disk space
df -h .
```

Ensure you have at least 2x the size of your pages directories.

### 3. Review Current Configuration

Check your `app-custom-config.json` or `app-default-config.json`:

```json
{
  "amdwiki.page.provider.filesystem.storagedir": "./pages",
  "amdwiki.page.provider.filesystem.requiredpagesdir": "./required-pages"
}
```

Note these paths - they will be used during migration.

### 4. Test Environment (Optional but Recommended)

If you have a test/staging environment, run the migration there first:

1. Copy your production data to test environment
2. Run migration with `--dry-run` flag
3. Run full migration
4. Verify everything works
5. Apply to production

## Migration Steps

### Step 1: Dry Run (Recommended)

Preview the migration without making changes:

```bash
npm run migrate:versioning:dry
```

Or with verbose output:

```bash
node scripts/migrate-to-versioning.js --dry-run --verbose
```

**Review the dry run output**:

- Number of pages discovered
- Any warnings about duplicate UUIDs
- Any warnings about existing version directories

### Step 2: Stop Your Wiki

**IMPORTANT**: Stop your amdWiki application before migration.

```bash
# If using PM2
pm2 stop amdWiki

# If running directly
# Press Ctrl+C in the terminal where amdWiki is running

# Verify it's stopped
ps aux | grep node
```

### Step 3: Run Migration

```bash
npm run migrate:versioning
```

**Follow the interactive prompts**:

1. **Confirmation**: Review the summary and type `yes` to proceed
2. **Progress**: Watch the progress bar as pages are migrated
3. **Report**: Review the migration report when complete

**Example Output**:

```
═══════════════════════════════════════════════════════════════════
  amdWiki Migration Tool
═══════════════════════════════════════════════════════════════════

ℹ Loading configuration...
ℹ Validating directories...
ℹ Scanning for pages...

Migration Summary:
──────────────────────────────────────────────────────────────────
  Pages directory:          /path/to/pages
  Required-pages directory: /path/to/required-pages
  Data directory:           /path/to/data
  Pages to migrate:         127
  Mode:                     LIVE
  Verbose logging:          No
──────────────────────────────────────────────────────────────────

⚠ IMPORTANT: Backup your data before proceeding!
ℹ Migration creates new directories but does not modify existing page files

Do you want to proceed with migration? (yes/no): yes

ℹ Starting migration...

  Progress: [████████████████████████████████████████] 100% (127/127)

═══════════════════════════════════════════════════════════════════
  Migration Report
═══════════════════════════════════════════════════════════════════

✓ Migration completed successfully!

Statistics:
──────────────────────────────────────────────────────────────────
  Duration:          8.45s
  Pages discovered:  127
  Pages migrated:    127
  Pages failed:      0
  Warnings:          0
  Errors:            0
──────────────────────────────────────────────────────────────────

ℹ Report saved to: ./data/migration-reports/migration-report-2025-01-15.json

Next Steps:
──────────────────────────────────────────────────────────────────
  1. Update app-custom-config.json:
     "amdwiki.page.provider": "VersioningFileProvider"
  2. Restart your amdWiki application
  3. Test page editing and version history
  4. Verify all pages are accessible
──────────────────────────────────────────────────────────────────

✓ Migration completed successfully!
```

### Step 4: Update Configuration

Edit your `app-custom-config.json`:

```json
{
  "amdwiki.page.provider": "VersioningFileProvider",
  "amdwiki.page.provider.versioning.deltastorage": true,
  "amdwiki.page.provider.versioning.compression": "gzip",
  "amdwiki.page.provider.versioning.maxversions": 50,
  "amdwiki.page.provider.versioning.retentiondays": 365,
  "amdwiki.page.provider.versioning.indexfile": "./data/page-index.json"
}
```

**Configuration Options**:

| Option | Default | Description |
|--------|---------|-------------|
| `amdwiki.page.provider` | `FileSystemProvider` | Set to `VersioningFileProvider` to enable versioning |
| `amdwiki.page.provider.versioning.deltastorage` | `true` | Enable delta storage (v1=full, v2+=diffs) |
| `amdwiki.page.provider.versioning.compression` | `gzip` | Compression algorithm for old versions |
| `amdwiki.page.provider.versioning.maxversions` | `50` | Maximum versions to keep per page |
| `amdwiki.page.provider.versioning.retentiondays` | `365` | Days to retain old versions |
| `amdwiki.page.provider.versioning.indexfile` | `./data/page-index.json` | Path to centralized page index |

### Step 5: Restart Your Wiki

```bash
# If using PM2
pm2 start amdWiki

# If running directly
npm start
```

Watch the logs for any errors:

```bash
# If using PM2
pm2 logs amdWiki

# Check application log
tail -f logs/app.log
```

You should see:

```
[VersioningFileProvider] Initialized with versioning enabled
[VersioningFileProvider] Delta storage: enabled
[VersioningFileProvider] Compression: enabled
[VersioningFileProvider] Max versions: 50, Retention: 365 days
[VersioningFileProvider] Loaded page index: 127 pages
```

## Post-Migration

### Verification Steps

#### 1. Verify All Pages Are Accessible

```bash
# Check if page index was created
ls -l ./data/page-index.json

# Check number of pages in index
cat ./data/page-index.json | grep -o '"uuid"' | wc -l
```

#### 2. Test Page Editing

1. Open your wiki in a browser
2. Edit an existing page
3. Save the changes
4. Verify version 2 was created:

```bash
# Replace {uuid} with actual page UUID
ls -l ./pages/versions/{uuid}/
# Should show: v1/ v2/ manifest.json
```

#### 3. Check Version History

Edit a page a few times, then check the manifest:

```bash
# Replace {uuid} with actual page UUID
cat ./pages/versions/{uuid}/manifest.json
```

Expected structure:

```json
{
  "pageId": "page-uuid",
  "pageName": "Page Title",
  "currentVersion": 3,
  "versions": [
    {
      "version": 1,
      "dateCreated": "2025-01-15T10:00:00.000Z",
      "author": "admin",
      "changeType": "created",
      "comment": "Initial version (migrated from FileSystemProvider)",
      "contentHash": "a1b2c3...",
      "contentSize": 1234,
      "compressed": false,
      "isDelta": false
    },
    {
      "version": 2,
      "dateCreated": "2025-01-15T11:00:00.000Z",
      "author": "john",
      "changeType": "updated",
      "comment": "Updated content",
      "contentHash": "d4e5f6...",
      "contentSize": 234,
      "compressed": false,
      "isDelta": true
    }
  ]
}
```

#### 4. Verify Storage Efficiency

Check space savings from delta storage:

```bash
# Original pages size
du -sh ./pages/*.md | awk '{sum+=$1} END {print sum}'

# Version directories size
du -sh ./pages/versions/

# Calculate savings
# Versions directory should be much smaller due to delta storage
```

### Monitor for Issues

#### Check Logs

```bash
# Watch for errors in application log
tail -f logs/app.log | grep -i error

# Check PM2 error log
pm2 logs amdWiki --err
```

#### Common Post-Migration Issues

**Issue**: Pages not found after migration

**Solution**:

```bash
# Verify page index exists and is valid
cat ./data/page-index.json | jq .
```

**Issue**: Version history not showing

**Solution**:

```bash
# Check manifest files exist
find ./pages/versions -name "manifest.json" | wc -l
# Should match number of pages
```

## Troubleshooting

### Migration Errors

#### Duplicate UUID Error

```
Error: Duplicate UUID found: abc-123
```

**Cause**: Two or more pages have the same UUID.

**Solution**:

1. Find the duplicate pages:

   ```bash
   grep -r "uuid: abc-123" ./pages
   ```

2. Assign a new UUID to one of the pages
3. Re-run migration

#### Permission Denied

```
Error: EACCES: permission denied, mkdir './pages/versions'
```

**Cause**: Insufficient permissions to create directories.

**Solution**:

```bash
# Fix permissions
chmod -R u+w ./pages ./required-pages ./data

# Re-run migration
```

#### Disk Space Error

```
Error: ENOSPC: no space left on device
```

**Cause**: Insufficient disk space.

**Solution**:

1. Free up disk space
2. Remove old backups or logs
3. Re-run migration

### Validation Errors

Run validation manually:

```javascript
const VersioningMigration = require('./src/utils/VersioningMigration');

const migration = new VersioningMigration({
  pagesDir: './pages',
  requiredPagesDir: './required-pages',
  dataDir: './data',
  dryRun: false,
  verbose: true
});

async function validate() {
  const result = await migration.validateMigration();
  console.log(result);
}

validate();
```

#### Content Hash Mismatch

```
Error: Content hash mismatch for uuid-123
```

**Cause**: Content was modified during migration or file corruption.

**Solution**:

1. Check if files were modified during migration
2. Re-run migration
3. If persists, restore from backup and try again

## Rollback

If you need to revert the migration:

### Automated Rollback

```javascript
const VersioningMigration = require('./src/utils/VersioningMigration');

const migration = new VersioningMigration({
  pagesDir: './pages',
  requiredPagesDir: './required-pages',
  dataDir: './data',
  dryRun: false,
  verbose: true
});

async function rollback() {
  const result = await migration.rollbackMigration();
  console.log(`Removed ${result.versionDirectories} version directories`);
  console.log(`Removed page index: ${result.pageIndex}`);
}

rollback();
```

### Manual Rollback

```bash
# Stop wiki
pm2 stop amdWiki

# Remove version directories
rm -rf ./pages/versions
rm -rf ./required-pages/versions

# Remove page index
rm -f ./data/page-index.json

# Revert configuration
# Edit app-custom-config.json and remove:
# - "amdwiki.page.provider": "VersioningFileProvider"
# Or change back to:
# - "amdwiki.page.provider": "FileSystemProvider"

# Restart wiki
pm2 start amdWiki
```

**Note**: Rollback removes version history but preserves all original page files.

## FAQ

### Q: Will my existing pages be modified?

**A**: No. The migration creates new version directories alongside your existing pages. Original page files are not modified.

### Q: How much disk space will versioning use?

**A**: With delta storage enabled:

- v1: Same size as original page
- v2+: Only stores differences (typically 5-20% of original size)
- Overall: ~20-40% increase in storage for first few versions
- Long term: Depends on edit frequency and compression

### Q: Can I rollback after editing pages?

**A**: Yes, but versions created after migration will be lost. Original pages remain unchanged.

### Q: What happens if migration fails mid-way?

**A**: The migration is designed to be safe:

- Atomic writes prevent corruption
- Original pages are never modified
- You can re-run migration or rollback

### Q: Can I migrate in batches?

**A**: Not directly, but you can:

1. Move some pages to a temporary directory
2. Run migration on remaining pages
3. Move pages back and run migration again
   (Migration detects already-migrated pages and warns)

### Q: How do I migrate from versioning back to non-versioning?

**A**: Use the rollback process above. Original pages remain functional.

### Q: Will search and page lookups still work?

**A**: Yes. VersioningFileProvider is fully backward compatible with FileSystemProvider's lookup mechanisms.

### Q: What if I have custom modifications to FileSystemProvider?

**A**: Review your modifications. VersioningFileProvider extends FileSystemProvider, so most custom changes should still work. Test in a staging environment first.

### Q: Can I disable delta storage after migration?

**A**: Yes. Set `amdwiki.page.provider.versioning.deltastorage: false` in config. New versions will store full content, but existing diffs remain.

### Q: How do I access old versions?

**A**: Version retrieval methods are available in VersioningFileProvider:

```javascript
// Get version history
const history = await provider.getVersionHistory('PageName');

// Get specific version
const { content, metadata } = await provider.getPageVersion('PageName', 2);

// Restore old version
await provider.restoreVersion('PageName', 2, {
  author: 'admin',
  comment: 'Restored from v2'
});

// Compare versions
const diff = await provider.compareVersions('PageName', 1, 3);
```

### Q: Are version directories backed up?

**A**: Include `./pages/versions/` and `./required-pages/versions/` in your backup strategy. The page index `./data/page-index.json` should also be backed up.

## Additional Resources

- [VersioningFileProvider API Documentation](../architecture/VersioningFileProvider-API.md)
- [Phase 4 Implementation Details](https://github.com/jwilleke/amdWiki/issues/128)
- [Epic: VersioningFileProvider Implementation](https://github.com/jwilleke/amdWiki/issues/124)
- [CONTRIBUTING.md - Versioning Section](../../CONTRIBUTING.md#versioning-implementation)

## Support

If you encounter issues not covered in this guide:

1. Check the GitHub issues: <https://github.com/jwilleke/amdWiki/issues>
2. Review application logs: `./data/logs/app.log`
3. Enable verbose logging: `--verbose` flag
4. Create a new issue with:
   - Migration report output
   - Error messages
   - Configuration file
   - amdWiki version

---

**Last Updated**: January 2025
**amdWiki Version**: 1.3.2+
