# BackupManager

**Comprehensive Documentation for amdWiki BackupManager**

Version: 1.0.0
Last Updated: 2025-10-14
Status: Production Ready

---

## Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Backup Coverage](#backup-coverage)
4. [Configuration Reference](#configuration-reference)
5. [API Reference](#api-reference)
6. [Usage Examples](#usage-examples)
7. [Provider Pattern](#provider-pattern)
8. [Backup File Format](#backup-file-format)
9. [Restore Process](#restore-process)
10. [Best Practices](#best-practices)
11. [Troubleshooting](#troubleshooting)
12. [Integration Guide](#integration-guide)

---

## Overview

The **BackupManager** is responsible for coordinating backup and restore operations across all managers in amdWiki. It provides a centralized system for creating full-system backups and restoring data, ensuring data safety and disaster recovery capabilities.

### Key Responsibilities

- **Backup Coordination**: Orchestrate backup operations across all registered managers
- **Compression**: Compress backup data using gzip for efficient storage
- **Lifecycle Management**: Automatically clean up old backups based on retention policy
- **Restore Coordination**: Restore data from backups across all managers
- **Statistics**: Track backup sizes, compression ratios, and operation timing

### Design Philosophy

The BackupManager follows the **Coordinator Pattern**:
- BackupManager: Orchestrates backup/restore across all managers
- Managers: Implement backup() and restore() methods
- Providers: Handle actual data storage/retrieval (when using provider pattern)

This architecture enables:
- **Centralized Control**: Single point for all backup operations
- **Manager Autonomy**: Each manager controls what data to backup
- **Provider Delegation**: Managers delegate to providers for storage-specific backups
- **Consistency**: Atomic full-system backups

---

## Architecture

### Component Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                       BackupManager                              │
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  Coordination Layer                                         │ │
│  │  - backup()           → Full system backup                  │ │
│  │  - restore()          → Full system restore                 │ │
│  │  - listBackups()      → List available backups              │ │
│  │  - cleanupOldBackups()→ Retention policy                    │ │
│  └──────────────┬───────────────────────────────────────────┬─┘ │
│                 │                                           │   │
│                 ▼                                           │   │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │           Manager Backup Methods                          │  │
│  └──────────────┬───────────────────────────────────────┬───┘  │
│                 │                                       │       │
│      ┌──────────┴──────────┬───────────────────────────┴─────┐ │
│      ▼                     ▼                           ▼      │ │
│  ┌─────────────┐   ┌──────────────┐   ┌──────────────────┐   │ │
│  │ PageManager │   │ UserManager  │   │ Configuration    │   │ │
│  │  ↓          │   │  ↓           │   │ Manager          │   │ │
│  │ FileSystem  │   │ FileUser     │   │  (Direct)        │   │ │
│  │ Provider    │   │ Provider     │   │                  │   │ │
│  └─────────────┘   └──────────────┘   └──────────────────┘   │ │
│                                                                  │
│  Provider Pattern: Managers delegate to providers for storage   │
│  Direct Pattern: Managers handle backup directly                │
└─────────────────────────────────────────────────────────────────┘
```

### Backup Flow

```
┌──────────────────────────────────────────────────────────────────┐
│  1. User/System initiates backup                                  │
│     └─> backupManager.backup()                                   │
└────────────────────┬─────────────────────────────────────────────┘
                     │
┌────────────────────▼─────────────────────────────────────────────┐
│  2. BackupManager coordinates                                     │
│     ├─> Get all registered managers from engine                  │
│     ├─> Call manager.backup() for each manager                   │
│     └─> Aggregate all backup data into single object             │
└────────────────────┬─────────────────────────────────────────────┘
                     │
┌────────────────────▼─────────────────────────────────────────────┐
│  3. Manager backup delegation                                     │
│     PageManager.backup()                                          │
│     ├─> Delegates to FileSystemProvider.backup()                 │
│     │   ├─> Read all page files                                  │
│     │   └─> Return { pages, statistics }                         │
│     └─> Wraps provider data: { providerBackup, timestamp }       │
└────────────────────┬─────────────────────────────────────────────┘
                     │
┌────────────────────▼─────────────────────────────────────────────┐
│  4. Compression and storage                                       │
│     ├─> Calculate backup size                                    │
│     ├─> Compress using gzip                                      │
│     ├─> Calculate compression ratio                              │
│     └─> Write to: backups/amdwiki-backup-{timestamp}.json.gz    │
└────────────────────┬─────────────────────────────────────────────┘
                     │
┌────────────────────▼─────────────────────────────────────────────┐
│  5. Cleanup old backups                                           │
│     ├─> List all backup files                                    │
│     ├─> Sort by timestamp (newest first)                         │
│     └─> Delete backups beyond maxBackups limit                   │
└──────────────────────────────────────────────────────────────────┘
```

### Restore Flow

```
┌──────────────────────────────────────────────────────────────────┐
│  1. User/System initiates restore                                 │
│     └─> backupManager.restore(backupPath)                        │
└────────────────────┬─────────────────────────────────────────────┘
                     │
┌────────────────────▼─────────────────────────────────────────────┐
│  2. Load and decompress backup                                    │
│     ├─> Read gzipped file                                        │
│     ├─> Decompress using gunzip                                  │
│     └─> Parse JSON backup data                                   │
└────────────────────┬─────────────────────────────────────────────┘
                     │
┌────────────────────▼─────────────────────────────────────────────┐
│  3. Restore managers in order                                     │
│     For each manager in backup.managers:                          │
│     ├─> Get manager instance from engine                         │
│     ├─> Call manager.restore(backupData)                         │
│     └─> Log success/failure                                      │
└────────────────────┬─────────────────────────────────────────────┘
                     │
┌────────────────────▼─────────────────────────────────────────────┐
│  4. Manager restore delegation                                    │
│     PageManager.restore(backupData)                               │
│     ├─> Validates provider class matches                         │
│     ├─> Delegates to FileSystemProvider.restore()                │
│     │   ├─> Create directories                                   │
│     │   ├─> Write all page files                                 │
│     │   └─> Rebuild cache and indexes                            │
│     └─> Log completion                                           │
└──────────────────────────────────────────────────────────────────┘
```

---

## Backup Coverage

### Fully Implemented (Production Ready)

| Manager | Provider | Data Backed Up | Status |
|---------|----------|----------------|--------|
| **PageManager** | FileSystemProvider | All pages (regular + required), metadata, indices | ✅ Complete |
| **UserManager** | FileUserProvider | Users, sessions, preferences | ✅ Complete |
| **ConfigurationManager** | Direct | All config layers (default, environment, custom) | ✅ Complete |
| **AttachmentManager** | AttachmentProvider | Attachments and metadata | ✅ Complete |
| **SearchManager** | SearchProvider | Search index | ✅ Complete |

### Manager Backup Statistics (Typical System)

```
Full system backup: 1,190.76 KB → 235.17 KB compressed (19.7%)
├─ PageManager:          1,095.50 KB (120 pages, 349.40 KB uncompressed)
├─ UserManager:             12.30 KB (5 users, 0 sessions)
├─ ConfigurationManager:    45.20 KB (383 properties)
├─ SearchManager:           28.70 KB (search index)
└─ AttachmentManager:        9.06 KB (attachments)
```

### ACLManager Note

ACLManager does **not** implement backup/restore because:
- All policies are loaded from ConfigurationManager (already backed up)
- Per-page ACLs are embedded in page content (backed up by PageManager)
- The accessPolicies Map is just a runtime cache that can be rebuilt from config

---

## Configuration Reference

### Core Configuration

```json
{
  "_comment_backup": "Backup system configuration",
  "amdwiki.backup.enabled": true,
  "amdwiki.backup.directory": "./backups",
  "amdwiki.backup.maxBackups": 10,
  "amdwiki.backup.compression": "gzip",
  "amdwiki.backup.autoBackup.enabled": false,
  "amdwiki.backup.autoBackup.schedule": "0 2 * * *"
}
```

### Configuration Keys

| Key | Type | Default | Description |
|-----|------|---------|-------------|
| `amdwiki.backup.enabled` | boolean | `true` | Enable/disable backup system |
| `amdwiki.backup.directory` | string | `"./backups"` | Directory for backup files |
| `amdwiki.backup.maxBackups` | number | `10` | Maximum backups to retain |
| `amdwiki.backup.compression` | string | `"gzip"` | Compression algorithm |
| `amdwiki.backup.autoBackup.enabled` | boolean | `false` | Enable automatic backups |
| `amdwiki.backup.autoBackup.schedule` | string | `"0 2 * * *"` | Cron schedule (daily at 2 AM) |

---

## API Reference

### BackupManager Methods

#### `initialize(config = {})`

Initialize the BackupManager and create backup directory.

**Parameters:**
- `config` (object, optional): Additional configuration options

**Returns:** `Promise<void>`

**Example:**
```javascript
await backupManager.initialize();
```

---

#### `backup()`

Create a full system backup of all registered managers.

**Returns:** `Promise<string>` - Path to the created backup file

**Throws:** Error if backup fails

**Example:**
```javascript
const backupPath = await backupManager.backup();
console.log(`Backup saved to: ${backupPath}`);
// Output: backups/amdwiki-backup-2025-10-14T11-28-54-626Z.json.gz
```

**Process:**
1. Gets all registered managers from engine
2. Calls `backup()` method on each manager
3. Aggregates all data into single backup object
4. Compresses with gzip
5. Writes to backup directory
6. Cleans up old backups

---

#### `restore(backupPath)`

Restore system state from a backup file.

**Parameters:**
- `backupPath` (string): Path to backup file (relative or absolute)

**Returns:** `Promise<void>`

**Throws:** Error if restore fails or backup file not found

**Example:**
```javascript
await backupManager.restore('backups/amdwiki-backup-2025-10-14T11-28-54-626Z.json.gz');
console.log('System restored successfully');
```

**Process:**
1. Reads and decompresses backup file
2. Parses JSON data
3. Calls `restore()` on each manager with their backup data
4. Logs success/failure for each manager
5. Throws error if critical managers fail

---

#### `listBackups()`

List all available backups in the backup directory.

**Returns:** `Promise<Array>` - Array of backup file information

**Backup Info Structure:**
```javascript
{
  filename: 'amdwiki-backup-2025-10-14T11-28-54-626Z.json.gz',
  path: '/absolute/path/to/backup.json.gz',
  size: 240750,  // bytes
  created: '2025-10-14T11:28:54.626Z',
  timestamp: 1728906534626
}
```

**Example:**
```javascript
const backups = await backupManager.listBackups();
console.log(`Found ${backups.length} backups:`);
backups.forEach(backup => {
  console.log(`  - ${backup.filename} (${(backup.size / 1024).toFixed(2)} KB)`);
});
```

---

#### `deleteBackup(backupPath)`

Delete a specific backup file.

**Parameters:**
- `backupPath` (string): Path to backup file to delete

**Returns:** `Promise<void>`

**Throws:** Error if file doesn't exist or deletion fails

**Example:**
```javascript
await backupManager.deleteBackup('backups/old-backup-2025-09-01.json.gz');
console.log('Backup deleted');
```

---

#### `cleanupOldBackups()`

Remove old backups beyond the retention limit.

**Returns:** `Promise<number>` - Number of backups deleted

**Example:**
```javascript
const deleted = await backupManager.cleanupOldBackups();
console.log(`Deleted ${deleted} old backups`);
```

**Logic:**
- Lists all backup files sorted by timestamp (newest first)
- Keeps `maxBackups` most recent backups
- Deletes all older backups

---

#### `getBackupInfo(backupPath)`

Get information about a backup file without loading full contents.

**Parameters:**
- `backupPath` (string): Path to backup file

**Returns:** `Promise<Object>` - Backup metadata

**Example:**
```javascript
const info = await backupManager.getBackupInfo('backups/backup.json.gz');
console.log(`Backup created: ${info.metadata.timestamp}`);
console.log(`Managers backed up: ${info.metadata.managersCount}`);
console.log(`Original size: ${info.metadata.originalSize} bytes`);
```

---

## Usage Examples

### Basic Backup Operations

#### Create a Backup

```javascript
const backupManager = engine.getManager('BackupManager');

// Create full system backup
const backupPath = await backupManager.backup();

console.log(`Backup saved to: ${backupPath}`);
console.log(`File size: ${(fs.statSync(backupPath).size / 1024).toFixed(2)} KB`);
```

#### List All Backups

```javascript
const backups = await backupManager.listBackups();

console.log('Available backups:');
backups.forEach(backup => {
  const date = new Date(backup.created);
  const size = (backup.size / 1024).toFixed(2);
  console.log(`  ${date.toLocaleString()} - ${backup.filename} (${size} KB)`);
});
```

#### Restore from Backup

```javascript
// Get latest backup
const backups = await backupManager.listBackups();
const latest = backups[0];

console.log(`Restoring from: ${latest.filename}`);
await backupManager.restore(latest.path);
console.log('System restored successfully');
```

#### Delete Old Backups

```javascript
// Clean up backups beyond retention limit
const deleted = await backupManager.cleanupOldBackups();
console.log(`Cleaned up ${deleted} old backups`);

// Or delete specific backup
await backupManager.deleteBackup('backups/old-backup-2025-09-01.json.gz');
```

### Advanced Operations

#### Scheduled Automatic Backups

```javascript
const cron = require('node-cron');

// Run backup daily at 2 AM
cron.schedule('0 2 * * *', async () => {
  const backupManager = engine.getManager('BackupManager');

  try {
    const backupPath = await backupManager.backup();
    logger.info(`Automatic backup created: ${backupPath}`);

    // Clean up old backups
    await backupManager.cleanupOldBackups();
  } catch (error) {
    logger.error('Automatic backup failed:', error);
  }
});
```

#### Backup Before Critical Operations

```javascript
async function dangerousOperation() {
  const backupManager = engine.getManager('BackupManager');

  // Create backup before dangerous operation
  console.log('Creating safety backup...');
  const backupPath = await backupManager.backup();
  console.log(`Backup saved: ${backupPath}`);

  try {
    // Perform dangerous operation
    await performDangerousOperation();

    console.log('Operation successful, keeping backup');
  } catch (error) {
    console.error('Operation failed, restoring from backup...');
    await backupManager.restore(backupPath);
    console.log('System restored to previous state');
    throw error;
  }
}
```

#### Export Backup to External Storage

```javascript
const AWS = require('aws-sdk');
const s3 = new AWS.S3();

async function exportBackupToS3() {
  const backupManager = engine.getManager('BackupManager');

  // Create backup
  const backupPath = await backupManager.backup();

  // Read backup file
  const backupData = fs.readFileSync(backupPath);

  // Upload to S3
  await s3.putObject({
    Bucket: 'my-wiki-backups',
    Key: path.basename(backupPath),
    Body: backupData,
    ServerSideEncryption: 'AES256'
  }).promise();

  console.log('Backup exported to S3');
}
```

### Express.js Integration

#### Backup API Endpoints

```javascript
// Create backup
app.post('/api/admin/backup', requireAdmin, async (req, res) => {
  const backupManager = req.app.get('engine').getManager('BackupManager');

  try {
    const backupPath = await backupManager.backup();
    const stats = fs.statSync(backupPath);

    res.json({
      success: true,
      path: backupPath,
      size: stats.size,
      created: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// List backups
app.get('/api/admin/backups', requireAdmin, async (req, res) => {
  const backupManager = req.app.get('engine').getManager('BackupManager');

  try {
    const backups = await backupManager.listBackups();
    res.json({ success: true, backups });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Restore backup
app.post('/api/admin/restore', requireAdmin, async (req, res) => {
  const backupManager = req.app.get('engine').getManager('BackupManager');
  const { backupPath } = req.body;

  try {
    await backupManager.restore(backupPath);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Download backup
app.get('/api/admin/backup/download/:filename', requireAdmin, async (req, res) => {
  const backupManager = req.app.get('engine').getManager('BackupManager');
  const { filename } = req.params;

  const backupPath = path.join(backupManager.backupDirectory, filename);

  if (!fs.existsSync(backupPath)) {
    return res.status(404).json({ error: 'Backup not found' });
  }

  res.download(backupPath);
});
```

---

## Provider Pattern

### How Managers Implement Backup

Managers can implement backup in two ways:

#### 1. Direct Backup (ConfigurationManager)

Manager handles backup directly without a provider:

```javascript
class ConfigurationManager {
  async backup() {
    return {
      managerName: 'ConfigurationManager',
      timestamp: new Date().toISOString(),
      customConfig: this.customConfig,
      mergedConfig: this.mergedConfig,
      statistics: { ... }
    };
  }

  async restore(backupData) {
    this.customConfig = backupData.customConfig;
    await this.saveCustomConfiguration();
    await this.loadConfigurations();
  }
}
```

#### 2. Provider Delegation (PageManager, UserManager)

Manager delegates to provider:

```javascript
class PageManager {
  async backup() {
    if (!this.provider) {
      return { note: 'No provider initialized' };
    }

    const providerBackup = await this.provider.backup();

    return {
      managerName: 'PageManager',
      providerClass: this.providerClass,
      providerBackup: providerBackup
    };
  }

  async restore(backupData) {
    if (!this.provider) {
      throw new Error('No provider available');
    }

    // Check provider mismatch
    if (backupData.providerClass !== this.providerClass) {
      logger.warn('Provider mismatch');
    }

    await this.provider.restore(backupData.providerBackup);
  }
}
```

### Provider Implementation Example

```javascript
class FileSystemProvider extends BasePageProvider {
  async backup() {
    const pages = [];

    // Read all page files
    for (const [title, info] of this.pageCache) {
      const page = await this.getPage(title);
      pages.push({ ...page });
    }

    return {
      providerName: 'FileSystemProvider',
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      pages: pages,
      statistics: {
        totalPages: pages.length,
        totalSize: this.calculateTotalSize(pages)
      }
    };
  }

  async restore(backupData) {
    // Create directories
    await fs.mkdir(this.storageDirectory, { recursive: true });

    // Restore all pages
    for (const page of backupData.pages) {
      await this.savePage(page.title, page.content, page.metadata);
    }

    // Rebuild cache and indexes
    await this.refreshPageList();
  }
}
```

---

## Backup File Format

### File Structure

```
Filename: amdwiki-backup-{ISO8601-timestamp}.json.gz
Format: Gzipped JSON
Encoding: UTF-8
```

### JSON Structure (Decompressed)

```json
{
  "metadata": {
    "version": "1.0.0",
    "timestamp": "2025-10-14T11:28:54.626Z",
    "engine": "amdWiki",
    "engineVersion": "1.3.2",
    "hostname": "localhost",
    "managersCount": 21
  },
  "managers": {
    "ConfigurationManager": {
      "managerName": "ConfigurationManager",
      "timestamp": "2025-10-14T11:28:54.671Z",
      "environment": "development",
      "customConfig": { ... },
      "mergedConfig": { ... },
      "statistics": {
        "customPropertiesCount": 0,
        "mergedPropertiesCount": 383
      }
    },
    "UserManager": {
      "managerName": "UserManager",
      "timestamp": "2025-10-14T11:28:54.671Z",
      "providerClass": "FileUserProvider",
      "providerBackup": {
        "providerName": "FileUserProvider",
        "version": "1.0.0",
        "users": { "admin": { ... }, ... },
        "sessions": { ... },
        "statistics": {
          "totalUsers": 5,
          "activeSessions": 0
        }
      }
    },
    "PageManager": {
      "managerName": "PageManager",
      "timestamp": "2025-10-14T11:28:54.672Z",
      "providerClass": "FileSystemProvider",
      "providerBackup": {
        "providerName": "FileSystemProvider",
        "version": "1.0.0",
        "pages": [ ... ],
        "requiredPages": [ ... ],
        "statistics": {
          "totalPages": 120,
          "totalSize": 357287
        }
      }
    }
  },
  "statistics": {
    "totalManagers": 21,
    "backupSize": 1219338,
    "compressedSize": 240750,
    "compressionRatio": 0.197,
    "duration": 61
  }
}
```

---

## Restore Process

### Restore Order

Managers are restored in registration order (same order as backup):

1. ConfigurationManager (configuration first)
2. CacheManager
3. UserManager (users before pages)
4. NotificationManager
5. PageManager (pages after config and users)
6. ... (remaining managers)

### Restore Safety

#### Provider Mismatch Detection

```javascript
if (backupData.providerClass !== this.providerClass) {
  logger.warn(`Provider mismatch: backup has ${backupData.providerClass}, current is ${this.providerClass}`);
  // Continue with warning, allowing manual intervention
}
```

#### Error Handling

```javascript
// BackupManager restore method
for (const [managerName, backupData] of Object.entries(backup.managers)) {
  try {
    const manager = this.engine.getManager(managerName);
    if (manager && typeof manager.restore === 'function') {
      await manager.restore(backupData);
      logger.info(`✅ ${managerName} restored successfully`);
    }
  } catch (error) {
    logger.error(`❌ ${managerName} restore failed:`, error);
    // Continue with other managers
  }
}
```

### Partial Restore

To restore only specific managers, modify backup file:

```javascript
// Restore only PageManager and UserManager
const backup = JSON.parse(gunzipSync(fs.readFileSync(backupPath)));

// Keep only desired managers
backup.managers = {
  PageManager: backup.managers.PageManager,
  UserManager: backup.managers.UserManager
};

// Save modified backup
fs.writeFileSync('partial-backup.json.gz', gzipSync(JSON.stringify(backup)));

// Restore
await backupManager.restore('partial-backup.json.gz');
```

---

## Best Practices

### 1. Regular Backups

```javascript
// Schedule daily backups
cron.schedule('0 2 * * *', async () => {
  await backupManager.backup();
});
```

### 2. Verify Backups

```javascript
// Test restore in non-production environment
async function verifyBackup(backupPath) {
  const tempDir = '/tmp/wiki-restore-test';

  // Create temporary wiki instance
  const testEngine = new WikiEngine({ dataDir: tempDir });
  await testEngine.initialize();

  // Attempt restore
  await testEngine.getManager('BackupManager').restore(backupPath);

  // Verify data
  const pageManager = testEngine.getManager('PageManager');
  const pages = await pageManager.getAllPages();
  console.log(`Verified ${pages.length} pages restored`);

  // Cleanup
  await fs.rm(tempDir, { recursive: true });
}
```

### 3. External Storage

```javascript
// Copy backups to external storage
async function exportBackup(backupPath) {
  const filename = path.basename(backupPath);

  // Copy to network drive
  await fs.copyFile(backupPath, `/mnt/backups/${filename}`);

  // Or upload to cloud
  await s3.upload({ Bucket: 'backups', Key: filename, Body: fs.readFileSync(backupPath) });
}
```

### 4. Pre-Upgrade Backups

```javascript
// Before upgrading amdWiki
async function preUpgradeBackup() {
  console.log('Creating pre-upgrade backup...');
  const backupPath = await backupManager.backup();
  console.log(`Backup saved: ${backupPath}`);
  console.log('Safe to proceed with upgrade');
}
```

### 5. Monitor Backup Health

```javascript
// Check backup system health
async function checkBackupHealth() {
  const backups = await backupManager.listBackups();

  if (backups.length === 0) {
    logger.error('No backups found! Backup system may be failing');
  }

  const latest = backups[0];
  const age = Date.now() - new Date(latest.created).getTime();
  const maxAge = 24 * 60 * 60 * 1000; // 24 hours

  if (age > maxAge) {
    logger.warn('Latest backup is older than 24 hours');
  }
}
```

---

## Troubleshooting

### Issue: Backup Fails with "Manager.backup is not a function"

**Cause**: Manager doesn't implement backup() method

**Solution**: Add backup/restore methods to manager or register a BaseManager stub:
```javascript
async backup() {
  return { managerName: this.constructor.name, timestamp: new Date().toISOString(), data: null };
}
```

---

### Issue: Restore Fails with Provider Mismatch

**Cause**: Backup created with different provider than currently configured

**Solution**: Update configuration to match backup provider or implement cross-provider restore

---

### Issue: Backup Directory Permission Denied

**Cause**: No write permissions to backup directory

**Solution**: Check directory permissions:
```bash
chmod 755 backups/
```

---

### Issue: Large Backup Files

**Cause**: Many pages or large attachments

**Solution**:
- Implement incremental backups
- Exclude large binary files
- Increase retention period but reduce frequency

---

## Integration Guide

### Adding Backup Support to a New Manager

1. **Implement backup() method**:
```javascript
async backup() {
  return {
    managerName: 'MyManager',
    timestamp: new Date().toISOString(),
    data: this.getData(),
    statistics: { ... }
  };
}
```

2. **Implement restore() method**:
```javascript
async restore(backupData) {
  if (!backupData || !backupData.data) {
    throw new Error('Invalid backup data');
  }

  this.setData(backupData.data);
  await this.save();
}
```

3. **Register manager in WikiEngine** (automatic if using registerManager())

4. **Test backup/restore**:
```javascript
const backup = await manager.backup();
await manager.restore(backup);
```

---

## Summary

The **BackupManager** provides comprehensive backup and restore capabilities for amdWiki:

- ✅ **Full System Backups**: All managers backed up in single operation
- ✅ **Provider Pattern Support**: Managers delegate to providers when appropriate
- ✅ **Compression**: Gzip compression for efficient storage
- ✅ **Retention Policy**: Automatic cleanup of old backups
- ✅ **Restore Safety**: Provider mismatch detection and error handling
- ✅ **Production Ready**: Successfully backs up 1.2 MB → 235 KB (19.7% compression)

### Current Coverage

| Manager | Status |
|---------|--------|
| PageManager (120 pages) | ✅ Complete |
| UserManager (5 users) | ✅ Complete |
| ConfigurationManager (383 properties) | ✅ Complete |
| AttachmentManager | ✅ Complete |
| SearchManager | ✅ Complete |
| ACLManager | N/A (data in ConfigurationManager + PageManager) |

---

**Document Version**: 1.0.0
**amdWiki Version**: 1.3.2
**Last Updated**: 2025-10-14
