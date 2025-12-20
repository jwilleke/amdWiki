# AttachmentManager Complete Guide

**Module:** `src/managers/AttachmentManager.js`
**Quick Reference:** [AttachmentManager.md](AttachmentManager.md)
**Version:** 1.0.0
**Based on:** JSPWiki AttachmentManager pattern

---

## Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Configuration](#configuration)
4. [Provider System](#provider-system)
5. [Usage Examples](#usage-examples)
6. [API Reference](#api-reference)
7. [Backup and Restore](#backup-and-restore)
8. [Future Providers](#future-providers)
9. [Best Practices](#best-practices)
10. [Troubleshooting](#troubleshooting)

---

## Overview

The AttachmentManager is responsible for managing file attachments in amdWiki. It provides a high-level interface for uploading, downloading, deleting, and managing attachments while delegating actual storage to pluggable attachment providers.

### Key Features

- **Pluggable Storage Providers**: Support for multiple storage backends (filesystem, database, cloud storage)
- **Schema.org Metadata**: Rich metadata using Schema.org CreativeWork format
- **Content Deduplication**: Hash-based storage prevents duplicate file storage
- **Page Mentions Tracking**: Track which pages reference which attachments
- **Permission Enforcement**: Integration with PolicyManager for access control
- **Backup/Restore Support**: Full backup and restore capabilities via BackupManager
- **Provider Fallback**: Configurable default provider with fallback pattern

### Design Principles

Following JSPWiki's attachment management pattern, AttachmentManager:

1. Delegates storage to pluggable providers
2. Enforces permissions via PolicyManager
3. Tracks attachment-page relationships
4. Provides high-level attachment operations
5. Uses all lowercase configuration keys

---

## Architecture

```text
┌─────────────────────────────────────────────────────────┐
│                   AttachmentManager                      │
│  (High-level API, permissions, coordination)            │
└────────────────┬────────────────────────────────────────┘
                 │
                 │ delegates storage to
                 ▼
┌─────────────────────────────────────────────────────────┐
│              BaseAttachmentProvider                      │
│           (Abstract provider interface)                  │
└─────────────────┬───────────────────────────────────────┘
                  │
          ┌───────┴───────┬──────────────┬───────────────┐
          ▼               ▼              ▼               ▼
  ┌───────────────┐ ┌──────────┐ ┌──────────┐ ┌─────────────┐
  │   Basic       │ │ Database │ │   S3     │ │ Azure Blob  │
  │  Attachment   │ │Attachment│ │Attachment│ │ Attachment  │
  │   Provider    │ │ Provider │ │ Provider │ │  Provider   │
  │  (Filesystem) │ │  (SQL)   │ │  (AWS)   │ │  (Azure)    │
  └───────────────┘ └──────────┘ └──────────┘ └─────────────┘
        ✅              🔮           🔮             🔮
    Implemented      Future       Future         Future
```

### Component Responsibilities

**AttachmentManager:**

- Permission checking via PolicyManager
- Provider initialization and management
- High-level attachment operations (upload, download, delete)
- Provider name normalization (lowercase → PascalCase)
- Backup/restore coordination

**BaseAttachmentProvider:**

- Abstract interface all providers must implement
- Defines standard methods (storeAttachment, getAttachment, etc.)
- Enforces ConfigurationManager usage

**Concrete Providers:**

- Implement actual storage logic (filesystem, database, cloud)
- Handle metadata persistence
- Provide backup/restore support
- Report provider features and capabilities

---

## Configuration

### Configuration Structure (ALL LOWERCASE)

AttachmentManager uses a hierarchical configuration structure with all lowercase keys:

```json
{
  "_comment_attachment_storage": "Attachment storage configuration",
  "amdwiki.attachment.enabled": true,

  "_comment_attachment_provider": "Provider fallback pattern",
  "amdwiki.attachment.provider.default": "basicattachmentprovider",
  "amdwiki.attachment.provider": "basicattachmentprovider",

  "_comment_attachment_shared": "Shared settings (all providers)",
  "amdwiki.attachment.maxsize": 10485760,
  "amdwiki.attachment.allowedtypes": "image/*,text/*,application/pdf",
  "amdwiki.attachment.forcedownload": false,
  "amdwiki.attachment.metadatafile": "./data/attachments/metadata.json",

  "_comment_attachment_provider_basic": "BasicAttachmentProvider settings",
  "amdwiki.attachment.provider.basic.storagedir": "./data/attachments",
  "amdwiki.attachment.provider.basic.hashcontent": true,
  "amdwiki.attachment.provider.basic.hashmethod": "sha256",

  "_comment_attachment_enhanced": "Enhanced attachment features",
  "amdwiki.attachment.enhanced.enabled": true,
  "amdwiki.attachment.enhanced.thumbnails": true,
  "amdwiki.attachment.enhanced.thumbnailsizes": "150x150,300x300",
  "amdwiki.attachment.enhanced.metadata": true,
  "amdwiki.attachment.enhanced.cachemetadata": true
}
```

### Configuration Keys Reference

#### Core Settings

| Key | Type | Default | Description |
|-----|------|---------|-------------|
| `amdwiki.attachment.enabled` | boolean | `true` | Enable/disable attachment system |
| `amdwiki.attachment.provider.default` | string | `"basicattachmentprovider"` | Default provider fallback |
| `amdwiki.attachment.provider` | string | `"basicattachmentprovider"` | Current active provider |
| `amdwiki.attachment.maxsize` | number | `10485760` | Max file size in bytes (10MB) |
| `amdwiki.attachment.allowedtypes` | string | `"image/*,text/*,application/pdf"` | Allowed MIME types |
| `amdwiki.attachment.forcedownload` | boolean | `false` | Force download vs inline display |
| `amdwiki.attachment.metadatafile` | string | `"./data/attachments/metadata.json"` | Metadata file location |

#### BasicAttachmentProvider Settings

| Key | Type | Default | Description |
|-----|------|---------|-------------|
| `amdwiki.attachment.provider.basic.storagedir` | string | `"./data/attachments"` | Filesystem storage directory |
| `amdwiki.attachment.provider.basic.hashcontent` | boolean | `true` | Enable content-based hashing |
| `amdwiki.attachment.provider.basic.hashmethod` | string | `"sha256"` | Hash algorithm (sha256, md5) |

#### Enhanced Features

| Key | Type | Default | Description |
|-----|------|---------|-------------|
| `amdwiki.attachment.enhanced.enabled` | boolean | `true` | Enable enhanced features |
| `amdwiki.attachment.enhanced.thumbnails` | boolean | `true` | Generate thumbnails for images |
| `amdwiki.attachment.enhanced.thumbnailsizes` | string | `"150x150,300x300"` | Thumbnail sizes |
| `amdwiki.attachment.enhanced.metadata` | boolean | `true` | Extract file metadata |
| `amdwiki.attachment.enhanced.cachemetadata` | boolean | `true` | Cache metadata in memory |

### Provider Fallback Pattern

The provider fallback pattern ensures reliability:

1. **Check active provider**: `amdwiki.attachment.provider`
2. **Fallback to default**: `amdwiki.attachment.provider.default`
3. **Hardcoded fallback**: `"basicattachmentprovider"`

This allows administrators to change providers without breaking the system.

### Provider Name Normalization

Provider names follow lowercase convention in configuration but are normalized to PascalCase for class loading:

| Config Value | Normalized Class Name |
|--------------|----------------------|
| `basicattachmentprovider` | `BasicAttachmentProvider` |
| `databaseattachmentprovider` | `DatabaseAttachmentProvider` |
| `s3attachmentprovider` | `S3AttachmentProvider` |
| `azureblobattachmentprovider` | `AzureBlobAttachmentProvider` |

---

## Provider System

### Available Providers

#### 1. BasicAttachmentProvider ✅ (Implemented)

**Status:** Production Ready
**Storage:** Filesystem
**Features:**

- Content deduplication via SHA-256 hashing
- Schema.org CreativeWork metadata
- Shared storage model with page mentions tracking
- Automatic metadata persistence
- Backup/restore support

**Configuration:**

```json
{
  "amdwiki.attachment.provider": "basicattachmentprovider",
  "amdwiki.attachment.provider.basic.storagedir": "./data/attachments",
  "amdwiki.attachment.provider.basic.hashcontent": true,
  "amdwiki.attachment.provider.basic.hashmethod": "sha256"
}
```

**Storage Structure:**

```text
data/attachments/
├── metadata.json                    # All attachment metadata
├── a8/                             # First 2 chars of hash
│   └── a87ff679a2f3e71d9181...    # Full hash filename
├── 5f/
│   └── 5feceb66ffc86f38d952...
└── ...
```

**Use Cases:**

- Small to medium-sized wikis (< 1000 attachments)
- Single-server deployments
- Local development
- Simple backup requirements

#### 2. DatabaseAttachmentProvider 🔮 (Future)

**Status:** Planned
**Storage:** SQL Database (PostgreSQL, MySQL, SQLite)
**Benefits:**

- Transactional integrity
- Built-in replication
- Advanced querying capabilities
- Better for large deployments

**Planned Configuration:**

```json
{
  "amdwiki.attachment.provider": "databaseattachmentprovider",
  "amdwiki.attachment.provider.database.connectionstring": "postgresql://user:pass@localhost/amdwiki",
  "amdwiki.attachment.provider.database.tablename": "attachments",
  "amdwiki.attachment.provider.database.poolsize": 10,
  "amdwiki.attachment.provider.database.timeout": 30000
}
```

**Use Cases:**

- Large wikis (> 1000 attachments)
- Multi-server deployments
- Need for transactional guarantees
- Integration with existing databases

#### 3. S3AttachmentProvider 🔮 (Future)

**Status:** Planned
**Storage:** AWS S3 (Simple Storage Service)
**Benefits:**

- Unlimited scalability
- Built-in redundancy (11 9's durability)
- CDN integration via CloudFront
- Pay-per-use pricing

**Planned Configuration:**

```json
{
  "amdwiki.attachment.provider": "s3attachmentprovider",
  "amdwiki.attachment.provider.s3.bucket": "my-amdwiki-attachments",
  "amdwiki.attachment.provider.s3.region": "us-east-1",
  "amdwiki.attachment.provider.s3.accesskey": "${AWS_ACCESS_KEY}",
  "amdwiki.attachment.provider.s3.secretkey": "${AWS_SECRET_KEY}",
  "amdwiki.attachment.provider.s3.encryption": "AES256",
  "amdwiki.attachment.provider.s3.storageclass": "STANDARD"
}
```

**Use Cases:**

- Enterprise wikis with high availability requirements
- Global wikis needing CDN support
- Compliance requirements (S3 supports encryption at rest)
- Need for automatic backups and versioning

#### 4. AzureBlobAttachmentProvider 🔮 (Future)

**Status:** Planned
**Storage:** Azure Blob Storage
**Benefits:**

- Integration with Microsoft ecosystem
- Geo-redundant storage options
- Azure CDN support
- Competitive pricing

**Planned Configuration:**

```json
{
  "amdwiki.attachment.provider": "azureblobattachmentprovider",
  "amdwiki.attachment.provider.azure.accountname": "myamdwiki",
  "amdwiki.attachment.provider.azure.accountkey": "${AZURE_STORAGE_KEY}",
  "amdwiki.attachment.provider.azure.containername": "attachments",
  "amdwiki.attachment.provider.azure.redundancy": "GRS",
  "amdwiki.attachment.provider.azure.tier": "Hot"
}
```

**Use Cases:**

- Organizations using Azure infrastructure
- Need for geo-redundant storage
- Integration with Azure services
- Compliance with Azure certifications

---

## Usage Examples

### Basic Attachment Upload

```javascript
const attachmentManager = engine.getManager('AttachmentManager');

// Prepare file data
const fileBuffer = fs.readFileSync('./document.pdf');
const fileInfo = {
  originalName: 'document.pdf',
  mimeType: 'application/pdf',
  size: fileBuffer.length
};

// Upload options
const options = {
  pageName: 'ProjectDocs',
  description: 'Project requirements document',
  context: {
    username: 'john.doe',
    isAuthenticated: true,
    roles: ['editor']
  }
};

// Upload attachment
try {
  const attachment = await attachmentManager.uploadAttachment(
    fileBuffer,
    fileInfo,
    options
  );

  console.log(`Attachment uploaded: ${attachment.id}`);
  console.log(`URL: ${attachment.url}`);
} catch (error) {
  console.error('Upload failed:', error.message);
}
```

### Download Attachment

```javascript
// Get attachment by ID
const attachmentId = 'a87ff679a2f3e71d9181a67b7542122c';

try {
  const result = await attachmentManager.getAttachment(attachmentId);

  if (result) {
    console.log(`Downloaded: ${result.metadata.name}`);
    console.log(`Size: ${result.metadata.contentSize} bytes`);

    // Save to disk
    fs.writeFileSync(`./downloads/${result.metadata.name}`, result.buffer);
  } else {
    console.log('Attachment not found');
  }
} catch (error) {
  console.error('Download failed:', error.message);
}
```

### List Attachments for a Page

```javascript
const pageName = 'ProjectDocs';

try {
  const attachments = await attachmentManager.getAttachmentsForPage(pageName);

  console.log(`${attachments.length} attachments found:`);
  attachments.forEach(att => {
    console.log(`- ${att.name} (${att.contentSize} bytes)`);
  });
} catch (error) {
  console.error('List failed:', error.message);
}
```

### Delete Attachment

```javascript
const attachmentId = 'a87ff679a2f3e71d9181a67b7542122c';

// User context for permission checking
const userContext = {
  username: 'john.doe',
  isAuthenticated: true,
  roles: ['editor']
};

try {
  const deleted = await attachmentManager.deleteAttachment(
    attachmentId,
    userContext
  );

  if (deleted) {
    console.log('Attachment deleted successfully');
  } else {
    console.log('Attachment not found');
  }
} catch (error) {
  console.error('Delete failed:', error.message);
}
```

### Check Attachment Exists

```javascript
const attachmentId = 'a87ff679a2f3e71d9181a67b7542122c';

try {
  const exists = await attachmentManager.attachmentExists(attachmentId);
  console.log(`Attachment exists: ${exists}`);
} catch (error) {
  console.error('Check failed:', error.message);
}
```

### Refresh Attachment List

```javascript
// Re-scan storage and rebuild indexes
try {
  await attachmentManager.refreshAttachmentList();
  console.log('Attachment list refreshed');
} catch (error) {
  console.error('Refresh failed:', error.message);
}
```

---

## API Reference

### AttachmentManager

#### `async initialize(config = {})`

Initialize AttachmentManager with configuration.

**Parameters:**

- `config` (Object): Configuration object (usually empty, loaded from ConfigurationManager)

**Returns:** ```Promise<void>```

**Example:**

```javascript
await attachmentManager.initialize();
```

---

#### `getCurrentAttachmentProvider()`

Get the current attachment provider instance.

**Returns:** BaseAttachmentProvider

**Example:**

```javascript
const provider = attachmentManager.getCurrentAttachmentProvider();
console.log(provider.getProviderInfo());
```

---

#### `async uploadAttachment(fileBuffer, fileInfo, options = {})`

Upload an attachment.

**Parameters:**

- `fileBuffer` (Buffer): File data
- `fileInfo` (Object): `{ originalName, mimeType, size }`
- `options` (Object): Upload options
  - `pageName` (string): Page to attach to (optional)
  - `description` (string): File description
  - `context` (Object): WikiContext with user information

**Returns:** ```Promise<Object>``` - Attachment metadata

**Throws:** Error if permission denied or upload fails

**Example:**

```javascript
const attachment = await attachmentManager.uploadAttachment(
  fileBuffer,
  { originalName: 'doc.pdf', mimeType: 'application/pdf', size: 1024 },
  { pageName: 'MyPage', context: { username: 'user', isAuthenticated: true } }
);
```

---

#### `async getAttachment(attachmentId)`

Get attachment file data and metadata.

**Parameters:**

- `attachmentId` (string): Attachment identifier

**Returns:** Promise<Object|null> - `{ buffer, metadata }` or null if not found

**Example:**

```javascript
const result = await attachmentManager.getAttachment('abc123');
if (result) {
  console.log(`File: ${result.metadata.name}`);
  fs.writeFileSync('download.pdf', result.buffer);
}
```

---

#### `async getAttachmentMetadata(attachmentId)`

Get attachment metadata only (no file data).

**Parameters:**

- `attachmentId` (string): Attachment identifier

**Returns:** Promise<Object|null> - Schema.org CreativeWork metadata

**Example:**

```javascript
const metadata = await attachmentManager.getAttachmentMetadata('abc123');
if (metadata) {
  console.log(`Size: ${metadata.contentSize} bytes`);
  console.log(`Type: ${metadata.encodingFormat}`);
}
```

---

#### `async deleteAttachment(attachmentId, userContext)`

Delete an attachment.

**Parameters:**

- `attachmentId` (string): Attachment identifier
- `userContext` (Object): User context for permission checking

**Returns:** ```Promise<boolean>``` - True if deleted, false if not found

**Throws:** Error if permission denied

**Example:**

```javascript
const deleted = await attachmentManager.deleteAttachment(
  'abc123',
  { username: 'user', isAuthenticated: true, roles: ['editor'] }
);
```

---

#### `async attachmentExists(attachmentId)`

Check if attachment exists.

**Parameters:**

- `attachmentId` (string): Attachment identifier

**Returns:** ```Promise<boolean>```

**Example:**

```javascript
if (await attachmentManager.attachmentExists('abc123')) {
  console.log('Attachment found');
}
```

---

#### `async getAllAttachments()`

Get all attachments metadata (without file data).

**Returns:** ```Promise<Array<Object>>``` - Array of attachment metadata

**Example:**

```javascript
const attachments = await attachmentManager.getAllAttachments();
console.log(`Total attachments: ${attachments.length}`);
```

---

#### `async getAttachmentsForPage(pageName)`

Get attachments used by a specific page.

**Parameters:**

- `pageName` (string): Page name/title

**Returns:** ```Promise<Array<Object>>``` - Array of attachment metadata

**Example:**

```javascript
const attachments = await attachmentManager.getAttachmentsForPage('ProjectDocs');
```

---

#### `async refreshAttachmentList()`

Refresh internal cache/index by re-scanning storage.

**Returns:** ```Promise<void>```

**Example:**

```javascript
await attachmentManager.refreshAttachmentList();
```

---

#### `async backup()`

Create backup of all attachment data.

**Returns:** ```Promise<Object>``` - Backup data

**Example:**

```javascript
const backupData = await attachmentManager.backup();
fs.writeFileSync('attachments-backup.json', JSON.stringify(backupData));
```

---

#### `async restore(backupData)`

Restore attachments from backup data.

**Parameters:**

- `backupData` (Object): Backup data from backup()

**Returns:** ```Promise<void>```

**Example:**

```javascript
const backupData = JSON.parse(fs.readFileSync('attachments-backup.json'));
await attachmentManager.restore(backupData);
```

---

#### `async shutdown()`

Shutdown AttachmentManager and cleanup resources.

**Returns:** ```Promise<void>```

**Example:**

```javascript
await attachmentManager.shutdown();
```

---

### Schema.org CreativeWork Metadata Format

Attachments use Schema.org CreativeWork format for metadata:

```javascript
{
  "@context": "https://schema.org",
  "@type": "CreativeWork",
  "@id": "urn:uuid:550e8400-e29b-41d4-a716-446655440000",
  "identifier": "a87ff679a2f3e71d9181a67b7542122c",
  "name": "document.pdf",
  "encodingFormat": "application/pdf",
  "contentSize": 1048576,
  "dateCreated": "2025-10-12T07:00:00.000Z",
  "dateModified": "2025-10-12T07:00:00.000Z",
  "creator": {
    "@type": "Person",
    "name": "John Doe"
  },
  "description": "Project requirements document",
  "url": "/attachments/a87ff679a2f3e71d9181a67b7542122c",
  "mentions": [
    {
      "@type": "WebPage",
      "name": "ProjectDocs"
    }
  ]
}
```

---

## Backup and Restore

### How BackupManager Integration Works

AttachmentManager integrates seamlessly with BackupManager:

1. **BackupManager** calls `backup()` on all registered managers
2. **AttachmentManager** delegates to current provider's `backup()`
3. **Provider** returns all metadata and references to files
4. **BackupManager** aggregates data into compressed backup file

### Backup Data Structure

```json
{
  "AttachmentManager": {
    "provider": "BasicAttachmentProvider",
    "version": "1.0.0",
    "timestamp": "2025-10-12T07:00:00.000Z",
    "attachments": [
      {
        "@context": "https://schema.org",
        "@type": "CreativeWork",
        "identifier": "a87ff679...",
        "name": "document.pdf",
        ...
      }
    ],
    "providerData": {
      "storageDirectory": "./data/attachments",
      "fileCount": 42,
      "totalSize": 10485760
    }
  }
}
```

### Backup Best Practices

1. **Regular Backups**: Schedule daily backups via BackupManager
2. **Include Files**: Ensure backup includes actual attachment files, not just metadata
3. **Test Restores**: Periodically test restore procedures
4. **Off-site Storage**: Store backups in different location from attachments
5. **Version Control**: Keep multiple backup versions

### Manual Backup Example

```javascript
// Create backup
const backupManager = engine.getManager('BackupManager');
const backupPath = await backupManager.backup();
console.log(`Backup created: ${backupPath}`);

// Restore from backup
await backupManager.restore(backupPath);
console.log('Restore completed');
```

---

## Future Providers

### Creating a Custom Provider

To create a custom attachment provider:

1. **Extend BaseAttachmentProvider**
2. **Implement all required methods**
3. **Use ConfigurationManager for all configuration**
4. **Follow lowercase configuration pattern**
5. **Add provider to normalization map in AttachmentManager**

### Example: CustomAttachmentProvider

```javascript
const BaseAttachmentProvider = require('./BaseAttachmentProvider');
const logger = require('../utils/logger');

class CustomAttachmentProvider extends BaseAttachmentProvider {
  constructor(engine) {
    super(engine);
    this.storageBackend = null;
  }

  async initialize() {
    const configManager = this.engine.getManager('ConfigurationManager');

    // Load configuration (ALL LOWERCASE)
    const endpoint = configManager.getProperty(
      'amdwiki.attachment.provider.custom.endpoint',
      'http://localhost:8080'
    );
    const apiKey = configManager.getProperty(
      'amdwiki.attachment.provider.custom.apikey',
      ''
    );

    // Initialize storage backend
    this.storageBackend = new StorageClient({ endpoint, apiKey });
    await this.storageBackend.connect();

    this.initialized = true;
    logger.info('[CustomAttachmentProvider] Initialized');
  }

  async storeAttachment(fileBuffer, fileInfo, metadata, user) {
    // Implementation
  }

  async getAttachment(attachmentId) {
    // Implementation
  }

  // Implement all other required methods...

  getProviderInfo() {
    return {
      name: 'CustomAttachmentProvider',
      version: '1.0.0',
      description: 'Custom storage provider',
      features: ['custom-feature-1', 'custom-feature-2']
    };
  }
}

module.exports = CustomAttachmentProvider;
```

### Configuration for Custom Provider

```json
{
  "amdwiki.attachment.provider": "customattachmentprovider",
  "amdwiki.attachment.provider.custom.endpoint": "http://storage.example.com",
  "amdwiki.attachment.provider.custom.apikey": "${STORAGE_API_KEY}",
  "amdwiki.attachment.provider.custom.timeout": 30000,
  "amdwiki.attachment.provider.custom.retries": 3
}
```

### Update AttachmentManager Normalization

Add your provider to the normalization map:

```javascript
#normalizeProviderName(providerName) {
  const knownProviders = {
    'basicattachmentprovider': 'BasicAttachmentProvider',
    'databaseattachmentprovider': 'DatabaseAttachmentProvider',
    's3attachmentprovider': 'S3AttachmentProvider',
    'azureblobattachmentprovider': 'AzureBlobAttachmentProvider',
    'customattachmentprovider': 'CustomAttachmentProvider' // Add here
  };

  if (knownProviders[lower]) {
    return knownProviders[lower];
  }

  // Fallback logic...
}
```

---

## Best Practices

### Configuration

1. **Always Use Lowercase Keys**: All configuration keys must be lowercase
2. **Use Provider Fallback**: Always set both `.provider.default` and `.provider`
3. **Environment Variables**: Use environment variables for sensitive values (API keys)
4. **Custom Config**: Put custom settings in `app-custom-config.json`, not defaults

### Security

1. **Permission Checking**: Always pass user context for uploads/deletes
2. **File Type Validation**: Configure `allowedtypes` to restrict dangerous files
3. **Size Limits**: Set appropriate `maxsize` based on server capacity
4. **Access Control**: Use PolicyManager to define attachment permissions

### Performance

1. **Content Deduplication**: Enable hash-based deduplication to save space
2. **Metadata Caching**: Enable `cachemetadata` for faster lookups
3. **Thumbnail Generation**: Enable thumbnails for image-heavy wikis
4. **Provider Selection**: Choose provider based on scale and requirements

### Maintenance

1. **Regular Backups**: Schedule automated backups via BackupManager
2. **Monitor Storage**: Track attachment count and total size
3. **Cleanup Orphans**: Periodically remove attachments not referenced by any page
4. **Test Providers**: Test provider functionality after configuration changes

---

## Troubleshooting

### AttachmentManager Won't Initialize

**Symptom:** AttachmentManager fails to initialize with error

**Possible Causes:**

1. ConfigurationManager not available
2. Invalid provider name
3. Provider file not found
4. Configuration keys have uppercase characters

**Solution:**

```javascript
// Check ConfigurationManager
const configManager = engine.getManager('ConfigurationManager');
if (!configManager) {
  throw new Error('ConfigurationManager required');
}

// Verify provider name is lowercase
const providerName = configManager.getProperty('amdwiki.attachment.provider');
console.log(`Provider: ${providerName}`); // Should be lowercase

// Check if provider file exists
const providerPath = `./src/providers/${normalizedName}.js`;
console.log(`Looking for: ${providerPath}`);
```

### Provider Name Not Normalized

**Symptom:** Error "Cannot find module '../providers/basicattachmentprovider'"

**Cause:** Provider name not in normalization map

**Solution:** Add provider to `#normalizeProviderName()` method in AttachmentManager

### Uploads Failing with Permission Error

**Symptom:** "Permission denied for attachment:upload"

**Cause:** User lacks upload permissions in PolicyManager

**Solution:** Check policies and user roles:

```javascript
// Verify user has upload permission
const policyManager = engine.getManager('PolicyManager');
const hasPermission = await policyManager.evaluate({
  subject: { type: 'user', value: 'username' },
  action: 'attachment:upload',
  resource: { type: 'attachment' }
});
```

### Attachment Not Found

**Symptom:** `getAttachment()` returns null

**Possible Causes:**

1. Attachment ID incorrect
2. Attachment deleted
3. Provider storage corrupted
4. Metadata out of sync

**Solution:**

```javascript
// Check if attachment exists
const exists = await attachmentManager.attachmentExists(attachmentId);

// Refresh attachment list to resync
if (!exists) {
  await attachmentManager.refreshAttachmentList();
  const existsNow = await attachmentManager.attachmentExists(attachmentId);
  console.log(`After refresh: ${existsNow}`);
}
```

### Large Files Won't Upload

**Symptom:** Upload fails for files over certain size

**Cause:** `maxsize` configuration too small

**Solution:** Increase max size in configuration:

```json
{
  "amdwiki.attachment.maxsize": 52428800  // 50MB
}
```

### Storage Directory Not Created

**Symptom:** Error "ENOENT: no such file or directory"

**Cause:** Storage directory doesn't exist and can't be created

**Solution:** Check permissions and create manually:

```bash
mkdir -p ./data/attachments
chmod 755 ./data/attachments
```

---

## Related Documentation

- [Configuration Refactoring Plan](../architecture/Configuration-Refactoring-Plan.md)
- [UserManager Documentation](./UserManager-Documentation.md)
- [PolicyManager Documentation](./PolicyManager-Documentation.md)
- [BackupManager Documentation](./BackupManager-Documentation.md)
- [BaseAttachmentProvider API](../../src/providers/BaseAttachmentProvider.js)
- [BasicAttachmentProvider Implementation](../../src/providers/BasicAttachmentProvider.js)

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2025-10-12 | Initial documentation with refactored configuration |

---

**Last Updated:** 2025-12-20
**Maintainer:** amdWiki Team
**Issues:** <https://github.com/jwilleke/amdWiki/issues>
