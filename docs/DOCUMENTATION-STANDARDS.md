---
name: Documentation Standards
description: Standards and conventions for amdWiki documentation
dateModified: 2025-12-18
category: standards
---

# Documentation Standards

This document defines the standards and conventions for all amdWiki documentation.

## Front Matter Schema

All documentation files must include YAML front matter with schema.org-compliant field names:

```yaml
---
name: "ModuleName"
description: "Brief one-line description of the module"
dateModified: "YYYY-MM-DD"
category: "managers|providers|plugins|architecture|user-guide|admin|testing"
relatedModules: ["Module1", "Module2"]
---
```

### Required Fields

| Field | Type | Description |
|-------|------|-------------|
| name | string | Module or document name (PascalCase for modules) |
| description | string | Brief description (< 160 characters) |
| dateModified | string | Last modification date (ISO 8601: YYYY-MM-DD) |
| category | string | Document category (see categories below) |

### Optional Fields

| Field | Type | Description |
|-------|------|-------------|
| relatedModules | array | Related modules for cross-referencing |
| version | string | Module version if applicable |
| author | string | Original author |
| status | string | draft, review, stable, deprecated |

### Categories

- `managers` - Manager class documentation
- `providers` - Provider implementation documentation
- `plugins` - Plugin documentation (developer-facing)
- `architecture` - System design and architecture docs
- `user-guide` - End-user documentation
- `admin` - Administration and deployment guides
- `testing` - Test documentation and guides
- `standards` - Standards and conventions

## Naming Conventions

### File Names

Use PascalCase for module documentation:

```
ModuleName.md              # Quick summary (overview)
ModuleName-Complete-Guide.md  # Deep dive (comprehensive)
```

Examples:
- `PageManager.md` + `PageManager-Complete-Guide.md`
- `WikiContext.md` + `WikiContext-Complete-Guide.md`
- `FileSystemProvider.md` + `FileSystemProvider-Complete-Guide.md`

### Folder Structure

```
docs/
├── DOCUMENTATION-STANDARDS.md   # This file
├── README.md                    # Documentation index
├── project_log.md               # AI session log
├── templates/                   # Documentation templates
├── architecture/                # System design docs
├── managers/                    # Manager documentation
├── providers/                   # Provider documentation
├── plugins/                     # Plugin developer docs
├── user-guide/                  # End-user documentation
├── admin/                       # Administration guides
├── api/                         # API reference (auto-generated)
├── testing/                     # Test documentation
├── planning/                    # Active roadmaps only
└── archive/                     # Deprecated/completed docs
```

## Document Types

### 1. Quick Summary (ModuleName.md)

Short overview document (200-500 lines):

- Overview and purpose
- Key features
- Basic usage examples
- Quick reference
- Links to complete guide

### 2. Complete Guide (ModuleName-Complete-Guide.md)

Comprehensive documentation (500+ lines):

- Detailed overview
- Architecture and design
- All API methods with examples
- Configuration options
- Integration patterns
- Troubleshooting
- Version history

### 3. Plugin Documentation

Plugin docs require both developer and user-facing versions:

**Developer doc** (`docs/plugins/PluginName.md`):
- Technical implementation
- API reference
- Extension points

**User doc** (`required-pages/PluginName.md`):
- Usage syntax
- Parameter reference
- Examples
- Common use cases

## Required Sections by Document Type

### Manager Documentation

1. Overview
2. Initialization
3. Dependencies (what it uses)
4. Dependents (what uses it)
5. Configuration options
6. API Methods
7. Usage examples
8. Error handling

### Provider Documentation

1. Overview
2. Provider pattern context
3. Interface implementation
4. Configuration
5. Storage/persistence details
6. API Methods
7. Usage examples

### Plugin Documentation (Developer)

1. Plugin metadata
2. Parameters table
3. Execute method
4. Examples (basic to advanced)
5. JSPWiki compatibility
6. Related plugins

### Plugin Documentation (User)

1. What it does
2. Usage syntax
3. Parameters (simple table)
4. Examples
5. Tips and common patterns

## Style Guide

### Headers

- H1: Document title only (one per document)
- H2: Major sections
- H3: Subsections
- H4: Minor details (use sparingly)

### Code Examples

Use fenced code blocks with language hints:

```javascript
// JavaScript/Node.js code
const manager = engine.getManager('PageManager');
```

```wiki
[{PluginName param='value'}]
```

```bash
npm run test
```

### Tables

Use for parameter references and comparisons:

```markdown
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| name | string | required | The parameter name |
```

### Links

- Use relative links within docs/
- Use absolute paths for code references
- Include line numbers where helpful: `src/managers/PageManager.js:42`

## Maintenance

### Keeping Docs Current

1. Update `dateModified` when editing
2. Review related docs when changing module APIs
3. Run `npm run docs:generate` after code changes
4. Archive completed planning documents

### Version Alignment

- Document version should match module version when applicable
- Note breaking changes in document
- Keep version history section updated

## Templates

See `docs/templates/` for starter templates:

- [Manager-Template.md](./templates/Manager-Template.md)
- [Provider-Template.md](./templates/Provider-Template.md)
- [Plugin-Template.md](./templates/Plugin-Template.md)
- [Plugin-User-Template.md](./templates/Plugin-User-Template.md)
