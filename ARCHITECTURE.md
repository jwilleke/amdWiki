# Architecture

amdWiki is built on a manager-based architecture designed for modularity, extensibility, and separation of concerns.
This document outlines the project structure and architectural decisions. All architectural decisions follow the principles in [GLOBAL-CODE-PREFERENCES.md](GLOBAL-CODE-PREFERENCES.md)

Related documents:

- [CODE_STANDARDS.md](./CODE_STANDARDS.md) - Coding standards and conventions
- [SECURITY.md](./SECURITY.md) - Security guidelines and best practices
- [CONTRIBUTING.md](./CONTRIBUTING.md) - Development workflow
- [AGENTS.md](./AGENTS.md) - Project context and goals

## High-Level Overview

amdWiki uses a **central WikiEngine** that orchestrates 23+ specialized managers, each responsible for specific domains.

### Key Componets

- [WikiContext-Complete-Guide.md](docs/WikiContext-Complete-Guide.md) - WikiContext is the central orchestrator for wiki content rendering in amdWiki and replaces inline regex processing with a modular, manager-based approach.
- [WikiDocument-Complete-Guide](docs/WikiDocument-Complete-Guide.md) -  WikiDocument is a DOM-based representation of a wiki page.

## Key Architecture Patterns

### Manager-Based Architecture

- 23 specialized managers extending BaseManager
- Central WikiEngine orchestrator
- Manager access via `engine.getManager('ManagerName')`
- Uniform initialization and lifecycle management

### WikiContext Pattern

Single source of truth for request/user context:

- Created per request with context type, page name, user context, engine reference
- Passed to managers, plugins, parsers, handlers
- Ensures consistent state across components

### Provider Pattern

- Abstract provider interfaces (BasePageProvider, BaseUserProvider, etc.)
- Concrete implementations (FileSystemPageProvider, FileUserProvider)
- Enables storage backend swapping without manager changes

### WikiDocument DOM Pipeline

Three-phase extraction for parsing JSPWiki syntax:

1. Extract JSPWiki syntax elements
2. Create DOM nodes
3. Merge with Markdown content

- Handler-based: DOMVariableHandler, DOMPluginHandler, DOMLinkHandler
- No parsing conflicts between JSPWiki and Markdown syntax

### Configuration System

- Hierarchical: default → environment → custom configs
- 1150+ properties in `config/app-default-config.json`
- JSPWiki-style naming: `amdwiki.{category}.{property}`
- ConfigurationManager for centralized access
- Server restart required for configuration changes

## Tech Stack

### Runtime

- Node.js (CommonJS, progressive TypeScript migration)
- Express.js 5.x for routing and middleware
- PM2 for process management and clustering
- EJS templates with Bootstrap 5 UI

### Storage

- **File-based** (Markdown files with YAML frontmatter)
- **Delta storage** for versions (fast-diff + pako compression)
- **No database required** - fully file-based architecture
- Supports local-first deployment with cloud-deployment option

### Content Processing

- **Showdown** for Markdown parsing
- **Custom JSPWiki handlers** for compatibility
- **WikiDocument DOM** (linkedom-based) for content manipulation
- **Delta-based versioning** (80-95% space savings)

### Testing & Quality

- **Jest** (376+ parser tests, >80% coverage target)
- **Co-located** `__tests__/` pattern
- **Mocked file operations** (no real I/O in tests)
- **JSDoc** (95% coverage requirement)

### Development Standards

- **TypeScript** (progressive migration, strict mode enabled)
- **CommonJS** modules with TypeScript imports
- **Semantic Versioning** for releases
- **markdownlint, .editorconfig, Prettier** for code formatting

## Project Structure

```
amdWiki/
├── src/
│   ├── managers/           # 23+ domain-specific managers
│   ├── providers/          # Storage providers (Page, User, Search, etc.)
│   ├── routes/             # Express route handlers
│   ├── services/           # Business logic services
│   ├── plugins/            # Plugin system
│   ├── parsers/            # Content parsing
│   ├── context/            # WikiContext implementation
│   └── utils/              # Utility functions
├── config/                 # Configuration files
├── data/                   # All instance-specific data (v1.5.0+)
│   ├── pages/              # User-created wiki pages
│   ├── users/              # User accounts and profiles
│   ├── attachments/        # File attachments
│   ├── logs/               # Application logs
│   ├── search-index/       # Search index files
│   ├── backups/            # Backup files
│   ├── sessions/           # Session files
│   └── versions/           # Page version history
├── required-pages/         # System pages (only used during installation, then copied to data/pages)
├── docs/                   # Developer documentation
├── docker/                 # Docker deployment files
├── views/                  # EJS templates
├── scripts/                # Utility scripts (migration, maintenance)
└── public/                 # Static assets
```

## For More Details

See [docs/architecture/](./docs/architecture/) for comprehensive documentation on:

- Manager patterns and responsibilities
- Plugin architecture and hooks
- WikiDocument DOM pipeline
- Storage provider implementation
- Configuration system details
- ACL and permission system
- Rendering pipeline

## Related Documentation

- [CONTRIBUTING.md](./CONTRIBUTING.md) - Development workflow and coding standards
- [docs/INSTALLATION-SYSTEM.md](./docs/INSTALLATION-SYSTEM.md) - First-run setup wizard
- [docs/SERVER.md](./docs/SERVER.md) - Server management and deployment
- [docker/DOCKER.md](./docker/DOCKER.md) - Docker deployment guide
- [SECURITY.md](./SECURITY.md) - Security practices and threat model
