id   : call_53438865__vscode-1757578633931
tool : create_file
args : {
  "content": "# PageManager: Enhanced UUID-Based File Storage

## Overview

The PageManager is a sophisticated content management system that implements UUID-based file storage for amdWiki. This modern approach provides robust file organization, efficient lookups, and seamless content management while maintaining backward compatibility with legacy filename-based systems.

## Core Architecture

### UUID-Based File Storage

**Primary Benefits:**
- **Permanent Identifiers**: UUIDs provide stable, collision-resistant identifiers
- **Clean URLs**: Enables permanent links using UUIDs
- **Flexible Naming**: Pages can be renamed without breaking references
- **Scalability**: Supports large numbers of pages without naming conflicts

**File Naming Convention:**

``` bash
{uuid}.md
```

Example: `2db43b31-8316-417e-8cc5-d3306996512a.md`

### Multi-Resolution Identifier System

The PageManager supports multiple ways to identify and access pages:

1. **UUID (Primary)**: `2db43b31-8316-417e-8cc5-d3306996512a`
2. **Title**: `PageIndex`, `Wiki Documentation`
3. **Slug**: `page-index`, `wiki-documentation`
4. **Legacy Filename**: `old-page-name` (for backward compatibility)

## Key Components

### 1. Caching System--

**Performance Optimization:**

```javascript
this.pageCache = new Map();           // Full page content cache
this.titleToUuidMap = new Map();      // Title → UUID mapping
this.slugToUuidMap = new Map();       // Slug → UUID mapping
this.uuidToFileMap = new Map();       // UUID → File info mapping
```

**Benefits:**
- Fast page lookups without disk I/O
- Efficient identifier resolution
- Automatic cache rebuilding on changes

### 2. Page Resolution Logic

**Resolution Priority:**
1. Direct UUID lookup (fastest)
2. Title lookup
3. Slug lookup
4. Legacy filename fallback

**Example Usage:**

```javascript
// All these resolve to the same page:
await pageManager.getPage('2db43b31-8316-417e-8cc5-d3306996512a'); // UUID
await pageManager.getPage('PageIndex');                           // Title
await pageManager.getPage('page-index');                          // Slug
```

### 3. Validation & Compliance

**Integrated Validation:**
- UUID filename validation (RFC 4122 v4 format)
- Complete metadata validation
- Category and keyword limits enforcement
- Automatic fix suggestions

**Validation Flow:**

```javascript
const validation = validationManager.validatePage(filename, metadata, content);
if (!validation.success) {
  throw new Error(`Page validation failed: ${validation.error}`);
}
```

### 4. Dual Directory Structure

**Directory Organization:**

``` bash
pages/           # User-created content
├── {uuid}.md   # Regular pages
└── ...

required-pages/  # System and required content
├── {uuid}.md   # System pages (Categories, PageIndex, etc.)
└── ...
```

**Automatic Classification:**
- System → `required-pages/`
- User content → `pages/`
- Configurable via metadata

## API Reference

### Core Methods

#### `getPage(identifier)`
Retrieves a page by any supported identifier.

**Parameters:**
- `identifier` (string): UUID, title, slug, or legacy filename

**Returns:** Page object with content, metadata, and file information

#### `savePage(identifier, content, metadata)`
Saves or updates a page with validation.

**Parameters:**
- `identifier` (string): Page identifier
- `content` (string): Markdown content
- `metadata` (object): Page metadata

**Features:**
- Automatic UUID generation if missing
- Slug generation from title
- Validation before saving
- Cache rebuilding

#### `deletePage(identifier)`
Deletes a page and updates related systems.

**Parameters:**
- `identifier` (string): Page identifier

**Side Effects:**
- Removes file from disk
- Rebuilds lookup caches
- Updates PageIndex

### Advanced Methods

#### `validateAndFixAllFiles(options)`
Comprehensive validation and fixing of all files.

**Parameters:**
- `options.dryRun` (boolean): Preview changes without applying

**Returns:** Detailed validation report

#### `updatePageIndex()`
Automatically generates/updates the PageIndex page.

**Features:**
- Alphabetical page listing
- Directory separation
- Statistics inclusion
- Automatic UUID reuse

#### `createPageFromTemplate(pageName, templateName)`
Creates a new page from a template.

**Parameters:**
- `pageName` (string): New page title
- `templateName` (string): Template to use (default: 'default')

## Metadata Structure

### Required Fields

```yaml
---
title: Page Title
slug: page-slug
uuid: 2db43b31-8316-417e-8cc5-d3306996512a
category: General
user-keywords: []
lastModified: '2025-09-11T10:00:00.000Z'
---
```

### Optional Fields

```yaml
---
categories: [General, Documentation]
created: '2025-09-11T09:00:00.000Z'
author: System
version: '1.0'
---
```

## Integration Points

### ValidationManager
- Filename validation
- Metadata compliance checking
- Automatic fix generation

### TemplateManager
- Template-based page creation
- Content scaffolding

### WikiEngine
- Manager registration and initialization
- Cross-manager communication

## Performance Characteristics

### Caching Strategy
- **Memory Usage**: Proportional to number of pages
- **Lookup Speed**: O(1) for UUIDs, O(1) for cached titles/slugs
- **Cache Invalidation**: Automatic on file changes

### File Operations
- **Read Performance**: Cached for frequently accessed pages
- **Write Performance**: Validation overhead minimal
- **Directory Scanning**: Optimized with file type filtering

## Migration & Compatibility

### Legacy Support
- Automatic detection of filename-based files
- Graceful fallback for old identifiers
- Migration path for existing content

### Upgrade Path
1. Existing files remain accessible
2. New files use UUID naming
3. Gradual migration supported
4. Validation tools available

## Error Handling

### Validation Errors
- Clear error messages for invalid metadata
- Fix suggestions provided
- Non-blocking warnings for minor issues

### File System Errors
- Graceful handling of missing files
- Directory creation as needed
- Permission error reporting

## Best Practices

### Page Creation

```javascript
const metadata = {
  title: 'My New Page',
  category: 'Documentation',
  'user-keywords': ['tutorial', 'guide']
};

await pageManager.savePage('My New Page', '# Content', metadata);
```

### Bulk Operations

```javascript
const report = await pageManager.validateAndFixAllFiles({ dryRun: true });
console.log(`Found ${report.invalidFiles} issues`);
```

### Custom Identifiers

```javascript
// Use slugs for clean URLs
const page = await pageManager.getPageBySlug('my-clean-url');

// Use UUIDs for permanent links
const page = await pageManager.getPageByUuid('2db43b31-8316-417e-8cc5-d3306996512a');
```

## Troubleshooting

### Common Issues

**Page Not Found:**
- Check identifier spelling
- Verify UUID format
- Ensure file exists in correct directory

**Validation Failures:**
- Review metadata requirements
- Check category values
- Validate keyword format

**Performance Issues:**
- Monitor cache size
- Check for memory leaks
- Review file system permissions

## Future Enhancements

### Planned Features
- Full-text search integration
- Version history support
- Collaborative editing
- Advanced permission system

### Extensibility
- Plugin architecture support
- Custom validation rules
- Template engine integration

---

*This documentation covers the UUID-based file storage system as implemented in PageManager.js. For the latest updates, refer to the source code comments and commit history.*",
  "filePath": "/Volumes/hd3/GitHub/amdWiki/docs/PageManager-UUID-Storage.md"
}
Response
The following files were successfully edited:
/Volumes/hd3/GitHub/amdWiki/docs/PageManager-UUID-Storage.md
