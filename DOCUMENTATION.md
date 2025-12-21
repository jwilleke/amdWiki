# Documentation

Complete documentation for amdWiki is organized in the `docs/` directory. This file provides high-level reference to all available documentation.

## Project Documentation Structure

### Root Level Files (This Directory)

- **[README.md](./README.md)** - Project overview and quick start
- **[AGENTS.md](./AGENTS.md)** - AI agent context and project status
- **[ARCHITECTURE.md](./ARCHITECTURE.md)** - System architecture and design patterns
- **[CODE_STANDARDS.md](./CODE_STANDARDS.md)** - Coding standards and best practices
- **[CONTRIBUTING.md](./CONTRIBUTING.md)** - Development workflow and guidelines
- **[SECURITY.md](./SECURITY.md)** - Security practices and policies
- **[CHANGELOG.md](./CHANGELOG.md)** - Version history and release notes
- **[CODE_OF_CONDUCT.md](./CODE_OF_CONDUCT.md)** - Community guidelines

## Detailed Documentation

See [docs/](./docs/) directory for comprehensive documentation on:

### Developer Documentation Index

**[docs/Developer-Documentation.md](./docs/Developer-Documentation.md)** - Complete index of all developer documentation:
- 18 Managers (quick reference + complete guides)
- 12 Plugins (developer + user guides)
- 5 Providers (storage and services)
- Architecture patterns and design documents
- Testing guides and strategies
- API reference (auto-generated)

### Documentation by Category

- **[docs/managers/](./docs/managers/)** - Manager documentation (18 managers)
  - Quick reference guides (~100-200 lines each)
  - Complete guides (~500-1000+ lines each)
  - PageManager, RenderingManager, UserManager, ConfigurationManager, etc.

- **[docs/plugins/](./docs/plugins/)** - Plugin documentation (12 plugins)
  - Developer implementation guides
  - User-facing documentation
  - CurrentTimePlugin, ImagePlugin, SearchPlugin, etc.

- **[docs/architecture/](./docs/architecture/)** - Architecture patterns (15+ documents)
  - Manager-based architecture overview
  - WikiDocument DOM pipeline
  - Policies, roles, and permissions
  - Storage providers
  - Rendering pipeline

- **[docs/planning/](./docs/planning/)** - Project planning
  - TODO.md - Current tasks and priorities
  - ROADMAP.md - Long-term vision and milestones

- **[docs/testing/](./docs/testing/)** - Testing documentation
  - Testing-Summary.md - Current test status
  - Complete-Testing-Guide.md - Comprehensive guide
  - PREVENTING-REGRESSIONS.md - Regression prevention

- **[docs/migration/](./docs/migration/)** - Migration guides
  - Upgrade instructions
  - Breaking changes
  - Data migration procedures

- **[docs/api/](./docs/api/)** - API documentation
  - Auto-generated TypeDoc reference
  - REST API reference
  - Configuration API

## Installation & Setup

For first-time installation:

1. Read [README.md](./README.md) for overview
2. See [docs/INSTALLATION-SYSTEM.md](./docs/INSTALLATION-SYSTEM.md) for installation wizard
3. Check [docs/SETUP.md](./docs/SETUP.md) for environment setup

## Development

For developers contributing to amdWiki:

1. Start with [CONTRIBUTING.md](./CONTRIBUTING.md)
2. Review [ARCHITECTURE.md](./ARCHITECTURE.md) for system design
3. Study [CODE_STANDARDS.md](./CODE_STANDARDS.md) for coding practices
4. Read [docs/developer/](./docs/developer/) for specific guides

## Deployment

For operations and deployment:

1. See [docs/SERVER.md](./docs/SERVER.md) for server management
2. Review [docs/SERVER-MANAGEMENT.md](./docs/SERVER-MANAGEMENT.md) for best practices
3. Check [SECURITY.md](./SECURITY.md) for security configuration

## Project Status & History

- **Current Status**: See [AGENTS.md](./AGENTS.md) - "Current Status" section
- **Release History**: See [CHANGELOG.md](./CHANGELOG.md)
- **Work History**: See [docs/project_log.md](./docs/project_log.md)
- **Tasks & Priorities**: See [docs/planning/TODO.md](./docs/planning/TODO.md)
- **Roadmap**: See [docs/planning/ROADMAP.md](./docs/planning/ROADMAP.md)

## Quick Links

### For New Users

- [README.md](./README.md) - What is amdWiki?
- [docs/INSTALLATION-SYSTEM.md](./docs/INSTALLATION-SYSTEM.md) - Getting started
- Help & Support - See README.md

### For Developers

- **[docs/Developer-Documentation.md](./docs/Developer-Documentation.md)** - Complete developer doc index
- [CONTRIBUTING.md](./CONTRIBUTING.md) - How to contribute
- [ARCHITECTURE.md](./ARCHITECTURE.md) - How it's built
- [CODE_STANDARDS.md](./CODE_STANDARDS.md) - How to code
- [docs/managers/](./docs/managers/) - Manager documentation
- [docs/plugins/](./docs/plugins/) - Plugin documentation

### For Operations

- [docs/SERVER.md](./docs/SERVER.md) - Running amdWiki
- [docs/SERVER-MANAGEMENT.md](./docs/SERVER-MANAGEMENT.md) - Best practices
- [SECURITY.md](./SECURITY.md) - Security setup

### For Maintainers

- [AGENTS.md](./AGENTS.md) - Project context
- [CHANGELOG.md](./CHANGELOG.md) - Version management
- [docs/project_log.md](./docs/project_log.md) - Work history
- [docs/planning/TODO.md](./docs/planning/TODO.md) - Current tasks

## Key Technologies & References

### Core Stack

- **Node.js v18+** - JavaScript runtime
- **Express.js 5.x** - Web framework
- **PM2** - Process manager
- **EJS** - Template engine
- **Bootstrap 5** - UI framework

### Storage & Processing

- **Markdown** - Content format
- **YAML Frontmatter** - Metadata
- **Showdown** - Markdown parser
- **JSPWiki Syntax** - Wiki syntax compatibility
- **linkedom** - DOM implementation

### Development Tools

- **Jest** - Testing framework
- **TypeScript** - Type system (progressive migration)
- **Prettier** - Code formatter
- **markdownlint** - Documentation linter

## Documentation Standards

All documentation in this project follows these standards:

- **Markdown format** - Using CommonMark specification
- **Clear hierarchy** - H1 title, H2 major sections
- **Links** - Relative links between documents
- **Code examples** - Syntax highlighted with language tags
- **Tables** - For structured information
- **Lists** - For sequential and grouped information

## File Organization

```
amdWiki/
├── README.md                           # Project overview
├── AGENTS.md                           # AI context
├── ARCHITECTURE.md                     # System design
├── CODE_STANDARDS.md                   # Coding standards
├── CONTRIBUTING.md                     # Development workflow
├── SECURITY.md                         # Security policies
├── CHANGELOG.md                        # Release history
├── CODE_OF_CONDUCT.md                  # Community guidelines
│
├── docs/                               # Detailed documentation
│   ├── project_log.md                  # Work history
│   ├── INSTALLATION-SYSTEM.md          # Setup wizard docs
│   ├── INSTALLATION-TESTING-RESULTS.md # Test results
│   ├── SERVER.md                       # Server management
│   ├── SERVER-MANAGEMENT.md            # Best practices
│   ├── architecture/                   # Architecture docs (15+)
│   ├── developer/                      # Developer guides
│   ├── planning/                       # Planning & roadmap
│   ├── testing/                        # Testing guides
│   ├── api/                            # API documentation
│   ├── migration/                      # Migration guides
│   └── ...                             # Other detailed docs
│
└── src/                                # Source code
    └── ...                             # Implementation
```

## Getting Help

- **Questions?** Check the relevant documentation above
- **Found a bug?** See [CONTRIBUTING.md](./CONTRIBUTING.md) for issue reporting
- **Want to contribute?** See [CONTRIBUTING.md](./CONTRIBUTING.md) for guidelines
- **Security concern?** See [SECURITY.md](./SECURITY.md)

## Related Files

- [.github/](./github/) - GitHub templates and workflows
- [config/](./config/) - Configuration file examples
- [scripts/](./scripts/) - Utility scripts
