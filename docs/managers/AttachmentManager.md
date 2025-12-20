# AttachmentManager

**Module:** `src/managers/AttachmentManager.js`
**Extends:** [BaseManager](BaseManager.md)
**Complete Guide:** [AttachmentManager-Complete-Guide.md](AttachmentManager-Complete-Guide.md)

---

## Overview

AttachmentManager handles file attachments for wiki pages. Following JSPWiki's pattern, it delegates storage to pluggable providers while enforcing permissions and tracking attachment-page relationships.

## Key Features

- **Pluggable Storage Providers** - Filesystem, database, or cloud storage backends
- **Schema.org Metadata** - Rich metadata using CreativeWork format
- **Content Deduplication** - SHA-256 hash-based storage prevents duplicates
- **Page Mentions Tracking** - Track which pages reference attachments
- **Permission Enforcement** - Integration with authenticated user context
- **Backup/Restore Support** - Full backup via BackupManager

## Quick Example

```javascript
const attachmentManager = engine.getManager('AttachmentManager');

// Upload attachment
const attachment = await attachmentManager.uploadAttachment(
  fileBuffer,
  { originalName: 'doc.pdf', mimeType: 'application/pdf', size: 1024 },
  { pageName: 'ProjectDocs', context: wikiContext }
);

// Get attachment
const result = await attachmentManager.getAttachment(attachment.identifier);

// List attachments for a page
const pageAttachments = await attachmentManager.getAttachmentsForPage('ProjectDocs');

// Delete attachment
await attachmentManager.deleteAttachment(attachment.identifier, wikiContext);
```

## Core Methods

| Method | Returns | Description |
|--------|---------|-------------|
| `uploadAttachment(buffer, fileInfo, options)` | `Promise<Object>` | Upload new attachment |
| `getAttachment(id)` | `Promise<{buffer, metadata}>` | Get attachment data and metadata |
| `getAttachmentMetadata(id)` | `Promise<Object>` | Get metadata only |
| `getAttachmentsForPage(pageName)` | `Promise<Array>` | List page attachments |
| `getAllAttachments()` | `Promise<Array>` | List all attachments |
| `deleteAttachment(id, context)` | `Promise<boolean>` | Delete attachment |
| `attachmentExists(id)` | `Promise<boolean>` | Check existence |
| `attachToPage(id, pageName)` | `Promise<boolean>` | Link attachment to page |
| `detachFromPage(id, pageName)` | `Promise<boolean>` | Unlink from page |
| `refreshAttachmentList()` | `Promise<void>` | Rescan storage |
| `getAttachmentUrl(id)` | `string` | Get attachment URL path |

## Configuration

```json
{
  "amdwiki.attachment.enabled": true,
  "amdwiki.attachment.provider": "basicattachmentprovider",
  "amdwiki.attachment.maxsize": 10485760,
  "amdwiki.attachment.allowedtypes": "image/*,text/*,application/pdf",
  "amdwiki.attachment.provider.basic.storagedir": "./data/attachments",
  "amdwiki.attachment.provider.basic.hashcontent": true
}
```

## Available Providers

| Provider | Status | Storage |
|----------|--------|---------|
| `BasicAttachmentProvider` | Production | Filesystem with hash-based deduplication |
| `DatabaseAttachmentProvider` | Planned | SQL database |
| `S3AttachmentProvider` | Planned | AWS S3 |
| `AzureBlobAttachmentProvider` | Planned | Azure Blob Storage |

## Related Managers

- [PolicyManager](PolicyManager.md) - Access control policies
- [BackupManager](BackupManager.md) - Backup/restore operations
- [ConfigurationManager](ConfigurationManager.md) - Configuration settings

## Developer Documentation

For complete API reference, configuration options, provider implementation, and troubleshooting:
- [AttachmentManager-Complete-Guide.md](AttachmentManager-Complete-Guide.md)
