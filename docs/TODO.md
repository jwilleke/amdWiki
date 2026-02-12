---
title: amdWiki Development TODO
category: System
user-keywords:
- todo
- planning
- roadmap
uuid: 124f3d52-75a0-4e61-8008-de37d1da4ef6
lastModified: '2026-02-10T00:00:00.000Z'
slug: amdwiki-todo
---

# Project Development TODO

No active tasks. See [GitHub Issues](https://github.com/jwilleke/amdWiki/issues) for open items.

<https://github.com/jwilleke/amdWiki/issues/250>

Also I want backups names as with conical dates first.
amdwiki-backup-2025-10-14T12-34-37-814Z.json.gz becomes
2025-10-14T12-34-37-814Z-amdwiki-backup.json.gz

How can we transform this instance:
My fast disk: /Volumes/hd1/jimstest-wiki/
My NAS file path: /Volumes/jims/data/systems/wikis/jimstest-wiki
My Backup file path: /Volumes/jims/data/systems/wikis/backup-wikis

How do we make this transition?

## Storage Migration Plan: Hybrid SSD + NAS Setup

## Goal

Migrate amdWiki data to use:

- **Fast SSD** (`/Volumes/hd1/jimstest-wiki/`) for high-I/O files
- **NAS** (`/Volumes/jims/data/systems/wikis/jimstest-wiki/`) for main data
- **Backup location** (`/Volumes/jims/data/systems/wikis/backup-wikis/`) for backups

## Current Data Analysis

| Directory | Size | Target | Notes |
| ---- | ---- | ---- | ---- |
| pages/ | 118M (14,366 files) | NAS | Main content |
| attachments/ | 103M | NAS | Binary files |
| logs/ | 123M | NAS | Audit logs |
| users/ | 32K | NAS | User data |
| notifications/ | 752K | NAS | Notification data |
| config/ | 48K | NAS | Config files |
| sessions/ | 104K | **SSD** | High I/O |
| page-index.json | 104K | **SSD** | High I/O |
| search-index/ | rebuilds | **SSD** | High I/O |
| backups/ | 73M | Backup path | Separate location |

## Migration Steps

### Step 1: Create Full Backup

Before any changes, create a complete backup of the current state.

```bash
# Create timestamped backup
./server.sh stop
BACKUP_DATE=$(date +%Y-%m-%dT%H-%M-%S)
tar -czf "/Volumes/jims/data/systems/wikis/backup-wikis/${BACKUP_DATE}-pre-migration-backup.tar.gz" \
  ./data ./config
```

### Step 2: Create Target Directory Structure

```bash
# SSD directories (high I/O)
mkdir -p /Volumes/hd1/jimstest-wiki/sessions
mkdir -p /Volumes/hd1/jimstest-wiki/search-index

# NAS directories (main data)
mkdir -p /Volumes/jims/data/systems/wikis/jimstest-wiki/pages
mkdir -p /Volumes/jims/data/systems/wikis/jimstest-wiki/attachments
mkdir -p /Volumes/jims/data/systems/wikis/jimstest-wiki/users
mkdir -p /Volumes/jims/data/systems/wikis/jimstest-wiki/logs
mkdir -p /Volumes/jims/data/systems/wikis/jimstest-wiki/notifications
mkdir -p /Volumes/jims/data/systems/wikis/jimstest-wiki/config
mkdir -p /Volumes/jims/data/systems/wikis/jimstest-wiki/schemas
mkdir -p /Volumes/jims/data/systems/wikis/jimstest-wiki/versions

# Backup directory
mkdir -p /Volumes/jims/data/systems/wikis/backup-wikis
```

### Step 3: Copy Data (NOT move)

Copy all data to new locations, keeping originals intact.

```bash
# Copy to SSD (high I/O files)
cp -R ./data/sessions/* /Volumes/hd1/jimstest-wiki/sessions/
cp ./data/page-index.json /Volumes/hd1/jimstest-wiki/page-index.json

# Copy to NAS (main data)
cp -R ./data/pages/* /Volumes/jims/data/systems/wikis/jimstest-wiki/pages/
cp -R ./data/attachments/* /Volumes/jims/data/systems/wikis/jimstest-wiki/attachments/
cp -R ./data/users/* /Volumes/jims/data/systems/wikis/jimstest-wiki/users/
cp -R ./data/logs/* /Volumes/jims/data/systems/wikis/jimstest-wiki/logs/
cp -R ./data/notifications/* /Volumes/jims/data/systems/wikis/jimstest-wiki/notifications/
cp ./data/notifications.json /Volumes/jims/data/systems/wikis/jimstest-wiki/notifications.json
cp -R ./data/config/* /Volumes/jims/data/systems/wikis/jimstest-wiki/config/
cp -R ./data/schemas/* /Volumes/jims/data/systems/wikis/jimstest-wiki/schemas/ 2>/dev/null || true
cp -R ./data/versions/* /Volumes/jims/data/systems/wikis/jimstest-wiki/versions/ 2>/dev/null || true

# Copy existing backups to backup location
cp -R ./data/backups/* /Volumes/jims/data/systems/wikis/backup-wikis/
```

### Step 4: Verify Copy Integrity

```bash
# Count files in source and destination
echo "=== Verification ==="
echo "Pages: $(ls ./data/pages | wc -l) -> $(ls /Volumes/jims/data/systems/wikis/jimstest-wiki/pages | wc -l)"
echo "Attachments: $(ls ./data/attachments | wc -l) -> $(ls /Volumes/jims/data/systems/wikis/jimstest-wiki/attachments | wc -l)"
echo "Users: $(ls ./data/users | wc -l) -> $(ls /Volumes/jims/data/systems/wikis/jimstest-wiki/users | wc -l)"
```

### Step 5: Update Production Config

Create/update `config/app-production-config.json`:

```json
{
  "_comment_hybrid_storage": "Hybrid SSD + NAS storage configuration",

  "_comment_ssd_high_io": "High I/O files on fast SSD",
  "amdwiki.session.storagedir": "/Volumes/hd1/jimstest-wiki/sessions",
  "amdwiki.page.provider.versioning.indexfile": "/Volumes/hd1/jimstest-wiki/page-index.json",
  "amdwiki.search.provider.lunr.indexdir": "/Volumes/hd1/jimstest-wiki/search-index",

  "_comment_nas_main_data": "Main data on NAS",
  "amdwiki.page.provider.filesystem.storagedir": "/Volumes/jims/data/systems/wikis/jimstest-wiki/pages",
  "amdwiki.attachment.provider.basic.storagedir": "/Volumes/jims/data/systems/wikis/jimstest-wiki/attachments",
  "amdwiki.attachment.metadatafile": "/Volumes/jims/data/systems/wikis/jimstest-wiki/attachments/attachment-metadata.json",
  "amdwiki.user.provider.storagedir": "/Volumes/jims/data/systems/wikis/jimstest-wiki/users",
  "amdwiki.audit.provider.file.logdirectory": "/Volumes/jims/data/systems/wikis/jimstest-wiki/logs",
  "amdwiki.logging.dir": "/Volumes/jims/data/systems/wikis/jimstest-wiki/logs",
  "amdwiki.notifications.dir": "/Volumes/jims/data/systems/wikis/jimstest-wiki/notifications",
  "amdwiki.directories.schemas": "/Volumes/jims/data/systems/wikis/jimstest-wiki/schemas",

  "_comment_backups": "Backups on NAS backup location",
  "amdwiki.backup.directory": "/Volumes/jims/data/systems/wikis/backup-wikis"
}
```

### Step 6: Start Server and Test

```bash
./server.sh start
# Wait for startup, then test:
curl -s http://localhost:3000 | head -5
```

### Step 7: Verify All Systems

- Browse wiki pages
- Check search works (index rebuilds on SSD)
- Verify attachments load
- Test login/logout (sessions on SSD)
- Create a test backup (goes to backup location)

### Step 8: Cleanup (ONLY after verification)

Only after confirming everything works, optionally clean up old data:

```bash
# ONLY run after full verification!
# Keep ./data as empty structure or remove
```

## Files to Create/Modify

- `scripts/migrate-storage.sh` - Interactive migration script
- `config/app-production-config.json` - Updated config paths

## Migration Script Design

Interactive script that:

- Prompts for confirmation at each major step
- Shows what will happen before doing it
- Validates paths exist and are writable
- Displays progress with file counts
- Can be re-run safely (skips already-copied files)

```bash
#!/bin/bash
# migrate-storage.sh - Interactive storage migration

# Configuration
SSD_PATH="/Volumes/hd1/jimstest-wiki"
NAS_PATH="/Volumes/jims/data/systems/wikis/jimstest-wiki"
BACKUP_PATH="/Volumes/jims/data/systems/wikis/backup-wikis"
SOURCE_DATA="./data"

confirm() {
    read -p "$1 [y/N] " response
    [[ "$response" =~ ^[Yy]$ ]]
}

# Step 1: Validate paths
# Step 2: Create backup
# Step 3: Create directories
# Step 4: Copy files with progress
# Step 5: Verify counts
# Step 6: Update config
# Step 7: Test server
```

## Verification Checklist

- [ ] Pre-migration backup created
- [ ] All directories created on SSD and NAS
- [ ] Files copied (not moved)
- [ ] File counts match source/destination
- [ ] Config updated with new paths
- [ ] Server starts without errors
- [ ] Pages load correctly
- [ ] Search works
- [ ] Attachments accessible
- [ ] Login/sessions work
- [ ] New backup creates file in backup location

##

Read porject-Log and gather performance and optiomization data.
read Performance Optimization documentation page (#250)
Update Optimization Documnetation page with relevent information

Pass all tests
Stop, Build code and restart server
Update related issues
Update
Make commit
Update project_log

Update SEMVER PATCH (using src/utils/version.ts to perform SEMVER updates)
Run E2E Tests

If you have not already done these do it
Pass all tests
Stop, Build code and restart server
Update related issues
Update
Make commit
Update project_log
