# Developer Documentation

**Complete index of amdWiki developer documentation**

Last Updated: 2025-12-21

---

## Quick Navigation

| Category | Count | Description |
|----------|-------|-------------|
| [Managers](#managers) | 21 | Core system managers (quick reference + complete guides) |
| [Plugins](#plugins) | 12 | Plugin documentation (developer + user guides) |
| [Providers](#providers) | 5 | Storage and service providers |
| [Architecture](#architecture) | 15+ | System design and patterns |
| [Testing](#testing) | 3 | Testing guides and strategies |
| [API](#api) | Auto-gen | TypeDoc generated API reference |

---

## Managers

### Quick Reference Guides

Concise API reference for each manager (~100-200 lines):

| Manager | Description |
|---------|-------------|
| [ACLManager](managers/ACLManager.md) | Access Control Lists and page permissions |
| [AttachmentManager](managers/AttachmentManager.md) | File attachment handling |
| [AuditManager](managers/AuditManager.md) | Audit logging and compliance |
| [BackupManager](managers/BackupManager.md) | System-wide backup and restore |
| [BaseManager](managers/BaseManager.md) | Base class for all managers |
| [CacheManager](managers/CacheManager.md) | Centralized cache management |
| [ConfigurationManager](managers/ConfigurationManager.md) | Configuration management |
| [ExportManager](managers/ExportManager.md) | Page export to HTML/Markdown |
| [NotificationManager](managers/NotificationManager.md) | System notifications |
| [PageManager](managers/PageManager.md) | Page CRUD and storage |
| [PluginManager](managers/PluginManager.md) | Plugin discovery and execution |
| [PolicyEvaluator](managers/PolicyEvaluator.md) | Policy evaluation logic |
| [PolicyManager](managers/PolicyManager.md) | Policy-based access control |
| [PolicyValidator](managers/PolicyValidator.md) | Policy validation |
| [RenderingManager](managers/RenderingManager.md) | Markdown and wiki markup rendering |
| [SchemaManager](managers/SchemaManager.md) | JSON Schema management |
| [SearchManager](managers/SearchManager.md) | Full-text search and indexing |
| [TemplateManager](managers/TemplateManager.md) | Page templates and themes |
| [UserManager](managers/UserManager.md) | User authentication and management |
| [ValidationManager](managers/ValidationManager.md) | Input validation |
| [VariableManager](managers/VariableManager.md) | Variable expansion |

### Complete Guides

In-depth documentation for each manager (500-1000+ lines):

| Manager | Guide |
|---------|-------|
| ACLManager | [ACLManager-Complete-Guide.md](managers/ACLManager-Complete-Guide.md) |
| AttachmentManager | [AttachmentManager-Complete-Guide.md](managers/AttachmentManager-Complete-Guide.md) |
| BaseManager | [BaseManager-Complete-Guide.md](managers/BaseManager-Complete-Guide.md) |
| BackupManager | [BackupManager-Complete-Guide.md](managers/BackupManager-Complete-Guide.md) |
| CacheManager | [CacheManager-Complete-Guide.md](managers/CacheManager-Complete-Guide.md) |
| ConfigurationManager | [ConfigurationManager-Complete-Guide.md](managers/ConfigurationManager-Complete-Guide.md) |
| ExportManager | [ExportManager-Complete-Guide.md](managers/ExportManager-Complete-Guide.md) |
| NotificationManager | [NotificationManager-Complete-Guide.md](managers/NotificationManager-Complete-Guide.md) |
| PageManager | [PageManager-Complete-Guide.md](managers/PageManager-Complete-Guide.md) |
| PluginManager | [PluginManager-Complete-Guide.md](managers/PluginManager-Complete-Guide.md) |
| RenderingManager | [RenderingManager-Complete-Guide.md](managers/RenderingManager-Complete-Guide.md) |
| SchemaManager | [SchemaManager-Complete-Guide.md](managers/SchemaManager-Complete-Guide.md) |
| TemplateManager | [TemplateManager-Complete-Guide.md](managers/TemplateManager-Complete-Guide.md) |

---

## Plugins

### Developer Documentation

Plugin implementation guides for developers:

| Plugin | Description |
|--------|-------------|
| [CurrentTimePlugin](plugins/CurrentTimePlugin.md) | Display current date/time with formatting |
| [ImagePlugin](plugins/ImagePlugin.md) | Inline images with options |
| [IndexPlugin](plugins/IndexPlugin.md) | Alphabetical page listing |
| [ReferringPagesPlugin](plugins/ReferringPagesPlugin.md) | Show backlinks to current page |
| [SearchPlugin](plugins/SearchPlugin.md) | Embedded search functionality |
| [SessionsPlugin](plugins/SessionsPlugin.md) | Active session count |
| [TotalPagesPlugin](plugins/TotalPagesPlugin.md) | Total page count |
| [UptimePlugin](plugins/UptimePlugin.md) | Server uptime display |

### User Documentation

End-user plugin guides (in required-pages/):

- ReferringPagesPlugin user guide
- SearchPlugin user guide
- SessionsPlugin user guide
- TotalPagesPlugin user guide
- UptimePlugin user guide
- Plugin index page

---

## Providers

Storage and service provider documentation:

| Provider | Description |
|----------|-------------|
| [BasicAttachmentProvider](providers/BasicAttachmentProvider.md) | File-based attachment storage |
| FileSystemProvider | File-based page storage (see PageManager docs) |
| FileUserProvider | File-based user storage (see UserManager docs) |
| VersioningFileProvider | Versioned page storage (see pageproviders/) |

### Page Providers

- [Versioning-Migration-Guide](pageproviders/Versioning-Migration-Guide.md)
- [Versioning-Deployment-Guide](admin/Versioning-Deployment-Guide.md)

---

## Architecture

System design and architectural patterns:

| Document | Description |
|----------|-------------|
| [MANAGERS-OVERVIEW](architecture/MANAGERS-OVERVIEW.md) | Manager-based architecture |
| [PROJECT-STRUCTURE](architecture/PROJECT-STRUCTURE.md) | Directory structure and organization |
| [WikiDocument-DOM-Architecture](architecture/WikiDocument-DOM-Architecture.md) | DOM-based parsing pipeline |
| [Policies-Roles-Permissions](architecture/Policies-Roles-Permissions.md) | Access control architecture |
| [Cache-System](architecture/Cache-System.md) | Caching strategy |
| [Page-Metadata](architecture/Page-Metadata.md) | Page frontmatter structure |

### Core Concepts

| Document | Description |
|----------|-------------|
| [WikiContext](WikiContext.md) | Request context pattern (quick reference) |
| [WikiContext-Complete-Guide](WikiContext-Complete-Guide.md) | In-depth WikiContext documentation |
| [WikiDocument-Complete-Guide](WikiDocument-Complete-Guide.md) | WikiDocument DOM documentation |
| [rendering-pipeline](rendering-pipeline.md) | End-to-end rendering flow |

---

## Testing

Testing documentation and strategies:

| Document | Description |
|----------|-------------|
| [Testing-Summary](testing/Testing-Summary.md) | Current test status and quick reference |
| [Complete-Testing-Guide](testing/Complete-Testing-Guide.md) | Comprehensive testing documentation |
| [PREVENTING-REGRESSIONS](testing/PREVENTING-REGRESSIONS.md) | Regression prevention strategy |

---

## API Reference

Auto-generated TypeDoc API documentation:

- **Location:** `docs/api/generated/`
- **Generate:** `npm run docs`
- **View:** `npm run docs:watch` (live preview)
- **Format:** Markdown (for GitHub) or HTML

To generate fresh API docs:

```bash
npm run docs        # Generate markdown
npm run docs:html   # Generate HTML
```

---

## Developer Guides

### Installation & Setup

- [INSTALLATION-SYSTEM](INSTALLATION-SYSTEM.md) - Installation wizard details
- [INSTALLATION-TESTING-RESULTS](INSTALLATION-TESTING-RESULTS.md) - Installation testing

### Development Workflow

- [DOCUMENTATION-STANDARDS](DOCUMENTATION-STANDARDS.md) - Documentation conventions
- [SERVER-MANAGEMENT](SERVER-MANAGEMENT.md) - Server management best practices
- [MCP-SERVER](MCP-SERVER.md) - Model Context Protocol server

### Planning

- [TODO](planning/TODO.md) - Current tasks and priorities
- [ROADMAP](planning/ROADMAP.md) - Long-term platform vision

---

## Templates

Documentation templates for creating new documentation:

| Template | Use For |
|----------|---------|
| [Manager-Template](templates/Manager-Template.md) | New manager documentation |
| [Provider-Template](templates/Provider-Template.md) | New provider documentation |
| [Plugin-Template](templates/Plugin-Template.md) | Plugin developer docs |
| [Plugin-User-Template](templates/Plugin-User-Template.md) | Plugin user guides |

---

## Project Status

- **Project Log:** [project_log.md](project_log.md) - AI agent session history
- **Version History:** [CHANGELOG.md](CHANGELOG.md) - Release notes
- **Semantic Versioning:** [SEMVER.md](SEMVER.md) - Versioning policy

---

## Contributing

Before contributing, please review:

1. **[../CONTRIBUTING.md](../CONTRIBUTING.md)** - Development guidelines
2. **[../CODE_STANDARDS.md](../CODE_STANDARDS.md)** - Coding standards
3. **[../ARCHITECTURE.md](../ARCHITECTURE.md)** - System architecture
4. **[DOCUMENTATION-STANDARDS.md](DOCUMENTATION-STANDARDS.md)** - Documentation conventions

---

## Documentation Status

All manager documentation is now complete! Each manager has:
- ✅ Quick Reference guide (~100-200 lines)
- ✅ Complete Guide (~500-1000+ lines)

See [Issue #178](https://github.com/jwilleke/amdWiki/issues/178) for documentation improvement tracking.
