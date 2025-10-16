# Project Structure Documentation

## Overview

This document provides a comprehensive guide to the amdWiki project structure, explaining the purpose and organization of each directory and key file.

## Directory Structure

### Core Application Structure

```bash
amdWiki/
├── src/                    # Source code directory
├── config/                 # Application configuration
├── public/                 # Static web assets
├── views/                  # Template files
├── app.js                  # Main application entry point
├── package.json            # NPM configuration and dependencies
└── README.md              # Main project documentation
```

### Documentation Structure

```bash
docs/
├── architecture/          # System architecture and design docs
│   ├── ARCHITECTURE-PAGE-CLASSIFICATION.md
│   └── PROJECT-STRUCTURE.md (this file)
├── development/           # Development guides and standards
│   ├── CONTRIBUTING.md    # Contribution guidelines
│   └── TESTING_PLAN.md    # Testing strategy
├── planning/              # Project planning and roadmap
│   ├── ROADMAP.md         # Project vision and priorities
│   ├── PROJECT_BOARD.md   # Current project status
│   └── todo.md            # Task tracking
├── api/                   # API documentation
│   └── NOTIFICATION_ENHANCEMENT.md
├── issues/                # Issue tracking and known problems
│   ├── ATTACHMENT_PERMISSION_CONFLICTS.md
│   ├── DIGITAL-DOCUMENT-PERMISSION-STATUS.md
│   └── PageInventory.md
├── CHANGELOG.md           # Version history and changes
├── SEMVER.md              # Semantic versioning guide
└── Content Management.md  # Content management docs
```

### Runtime Data Structure

```bash
data/                      # Application runtime data (gitignored)
├── notifications.json     # Notification persistence data
├── page-index.json        # Versioning page index
├── sessions/              # Session storage (file-based sessions)
└── attachments/           # Attachment metadata and storage

logs/                      # Application logs (gitignored)
├── app.log               # Winston application logs (detailed operations)
├── pm2-out.log           # PM2 stdout (console output)
├── pm2-error.log         # PM2 stderr (runtime errors)
├── pm2-combined.log      # PM2 combined logs
└── audit.log             # Security/audit events

pages/                     # User-generated wiki pages (gitignored)
├── *.md                  # Individual wiki pages

users/                     # User account data (gitignored)
├── *.json                # User account files

attachments/               # User uploaded files (gitignored)
├── */                    # Organized by type/subdirectory

exports/                   # Exported content (gitignored)
├── *.pdf, *.html, etc.   # Exported wiki content
```

### Development and Testing

```bash
tests/                     # Test files
├── Temp.md               # Test content

scripts/                   # Utility and maintenance scripts
├── migrate-to-schema.js  # Database migration scripts
├── theme-replace-extended.sh
├── theme-replace.sh
├── validate-pages.js     # Page validation utilities

reports/                   # Test and coverage reports (gitignored)
├── coverage/             # Main test coverage
├── coverage-acl/         # ACL-specific coverage
├── coverage-all/         # Full coverage reports
├── coverage-page/        # Page manager coverage
└── coverage-user/        # User manager coverage
```

### Legacy and Archive

```bash
archive/                   # Legacy files and deprecated content
├── .continue/            # Old continuation data
├── wiki.conf/            # Old configuration files
└── temp_review/          # Temporary review files
```

## Directory Purposes

### Source Code (`src/`)

The `src/` directory contains all application source code, organized by functional responsibility:

- **`core/`**: Core engine components and base classes
- **`managers/`**: Business logic managers (PageManager, UserManager, etc.)
- **`routes/`**: HTTP route handlers and API endpoints
- **`utils/`**: Utility functions and helpers

### Configuration (`config/`)

Contains application configuration files:
- **`Config.js`**: Main application configuration with validation
- Environment-specific overrides
- Manager-specific settings

### Static Assets (`public/`)

Web-accessible static files:
- **`css/`**: Stylesheets
- **`js/`**: Client-side JavaScript
- **`images/`**: Static images and assets

### Templates (`views/`)

Server-side templates using EJS:
- **`*.ejs`**: Page templates
- **`admin-*.ejs`**: Admin interface templates
- **`edit.ejs`**: Page editing interface

### Documentation (`docs/`)

Comprehensive documentation organized by purpose:
- **`architecture/`**: System design and technical architecture
- **`development/`**: Development processes and coding standards
- **`planning/`**: Project planning and feature roadmaps
- **`api/`**: API documentation and specifications
- **`issues/`**: Known issues and troubleshooting guides

### Runtime Data (Gitignored)

These directories contain runtime-generated data that should not be version controlled:

- **`data/`**: Application state data (notifications, cache, etc.)
- **`logs/`**: Application logs and debugging information
- **`pages/`**: User-generated wiki content
- **`users/`**: User account and session data
- **`attachments/`**: User-uploaded files
- **`exports/`**: Generated export files
- **`reports/`**: Test coverage and analysis reports

## File Naming Conventions

### Source Files
- **PascalCase** for classes: `WikiEngine.js`, `PageManager.js`
- **camelCase** for utilities: `logger.js`, `version.js`
- **kebab-case** for config: `Config.js`

### Documentation Files
- **SCREAMING_SNAKE_CASE** for major docs: `README.md`, `CHANGELOG.md`
- **Title Case** for feature docs: `Notification Enhancement.md`
- **Descriptive names** with clear purpose

### Directory Names
- **lowercase** for technical directories: `src/`, `config/`, `public/`
- **hyphen-separated** for complex names: `test-coverage/`
- **Purpose-driven** naming: `user-management/`, `content-validation/`

## Gitignore Strategy

The `.gitignore` file is strategically organized to exclude:

1. **Runtime Data**: Files generated during application execution
2. **User Content**: User-generated wiki pages and uploads
3. **Development Artifacts**: Coverage reports, logs, temporary files
4. **Environment-Specific**: Files that differ between environments

### Key Ignore Patterns

```gitignore
# Runtime data (never commit)
pages/
users/
attachments/
exports/
data/
logs/
reports/

# Development artifacts
coverage/
*.log
node_modules/

# Environment files
.env
.env.*
```

## Development Workflow

### Adding New Features

1. **Source Code**: Add to appropriate `src/` subdirectory
2. **Configuration**: Update `config/Config.js` if needed
3. **Documentation**: Add to relevant `docs/` subdirectory
4. **Tests**: Add to `tests/` directory
5. **Scripts**: Add utilities to `scripts/` directory

### File Organization Guidelines

1. **Keep related files together**: Group by feature or responsibility
2. **Use consistent naming**: Follow established conventions
3. **Document new directories**: Update this document when adding new directories
4. **Maintain separation**: Keep runtime data separate from source code

## Maintenance

### Regular Cleanup Tasks

1. **Archive old files**: Move deprecated files to `archive/`
2. **Review gitignore**: Ensure new file types are properly ignored
3. **Update documentation**: Keep this document current with structure changes
4. **Consolidate similar directories**: Merge related directories when appropriate

### Directory Size Monitoring

- **`logs/`**: Monitor log file sizes, implement rotation
- **`data/`**: Monitor application data growth
- **`attachments/`**: Monitor upload storage usage
- **`reports/`**: Clean up old coverage reports

## Related Documentation

- [CONTRIBUTING.md](../development/CONTRIBUTING.md) - Development guidelines
- [ARCHITECTURE-PAGE-CLASSIFICATION.md](ARCHITECTURE-PAGE-CLASSIFICATION.md) - Page classification system
- [ROADMAP.md](../planning/ROADMAP.md) - Project planning and vision
- [CHANGELOG.md](../CHANGELOG.md) - Version history and changes```</content>
<parameter name="filePath">```/Volumes/hd3/GitHub/amdWiki/docs/architecture/PROJECT-STRUCTURE.md
