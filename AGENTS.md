# amdWiki AI Agent Context

Single source of truth for amdWiki project context. Read this first when working on the project.

## Critical: Read Global Preferences First

Read [~/GLOBAL-CODE-PREFERENCES.md](~/GLOBAL-CODE-PREFERENCES.md) for overarching principles:

- Concise, DRY code and documentation
- Iterate progressively, start with core features
- NEVER put unencrypted secrets in Git
- Use project_log.md to track all work
- GitHub CLI primary method for interactions
- Use markdownlint, .editorconfig, .prettierrc.json standards

## Quick Navigation

- [CONTRIBUTING.md](./CONTRIBUTING.md) - Development workflow, coding standards, JSDoc requirements
- [INSTALLATION-SYSTEM.md](./INSTALLATION-SYSTEM.md) - Installation wizard system (NEW)
- [SERVER.md](./SERVER.md) - Server management and configuration
- [SERVER-MANAGEMENT.md](./SERVER-MANAGEMENT.md) - Ideal server management practices (Issue #167)
- [docs/architecture/](./docs/architecture/) - Architecture patterns and system design (15 docs)
- [SECURITY.md](./SECURITY.md) - Security practices and guidelines
- [docs/planning/TODO.md](./docs/planning/TODO.md) - Task tracking and priorities
- [docs/planning/ROADMAP.md](./docs/planning/ROADMAP.md) - Long-term platform vision
- [CHANGELOG.md](./CHANGELOG.md) - Version history (Keep a Changelog format)

## Project Overview

**Project Name:** amdWiki

**Description:** JSPWiki-inspired file-based wiki platform evolving into a comprehensive digital platform for personal and organizational use. Manager-based architecture with modular plugin system, file-based storage, and standards-first approach.

### Goals

- Provide robust wiki functionality with JSPWiki-compatible syntax
- Support modular content modules (blog, documents, photos, assets)
- Maintain local-first capability with cloud deployment option
- Deliver comprehensive digital workspace ("Jack of all trades")
- Progressive TypeScript migration while maintaining CommonJS compatibility

## Current Status

- **Overall Progress:** Phase 1 (Core Wiki) 95% complete, Phase 2 (Content Modules) planning
- **Current Version:** 1.3.3
- **Last Updated:** 2025-12-02
- **Phase:** Mature development transitioning to platform expansion
- **Next Milestone:** Attachment UI Enhancement, TypeScript migration, WikiDocument testing

## Architecture & Tech Stack

See [docs/architecture/](./docs/architecture/) for comprehensive documentation.

### Key Architecture Patterns

#### Manager-Based Architecture

- 23 specialized managers extending BaseManager
- Central WikiEngine orchestrator
- Manager access via `engine.getManager('ManagerName')`
- Key managers: PageManager, UserManager, ACLManager, RenderingManager, PluginManager

#### WikiContext Pattern

- Single source of truth for request/user context
- Created per request with: context type, page name, user context, engine reference
- Passed to managers, plugins, parsers, handlers
- See: `src/context/WikiContext.js`

#### Provider Pattern

- Abstract provider interfaces (BasePageProvider, BaseUserProvider, etc.)
- Concrete implementations (FileSystemPageProvider, FileUserProvider)
- Enables storage backend swapping without manager changes

#### WikiDocument DOM Pipeline

- Three-phase extraction: Extract JSPWiki → Create DOM Nodes → Merge with Markdown
- Handler-based: DOMVariableHandler, DOMPluginHandler, DOMLinkHandler
- No parsing conflicts between JSPWiki and Markdown syntax
- See: `docs/architecture/WikiDocument-DOM-Architecture.md`

#### Configuration System

- Hierarchical: default → environment → custom configs
- 1150+ properties in `config/app-default-config.json`
- JSPWiki-style naming: `amdwiki.{category}.{property}`
- ConfigurationManager centralized access
- Server restart required for changes

### Tech Stack

#### Runtime

- Node.js (CommonJS, progressive TypeScript migration)
- Express.js 5.x for routing
- PM2 for process management
- EJS templates with Bootstrap 5 UI

#### Storage

- File-based (Markdown files with YAML frontmatter)
- Delta storage for versions (fast-diff + pako compression)
- No database required

#### Parsing

- Showdown for Markdown
- Custom JSPWiki syntax handlers
- WikiDocument DOM (linkedom-based)

#### Testing

- Jest (376+ parser tests, >80% coverage target)
- Co-located `__tests__/` pattern
- Mocked file operations (no real I/O in tests)

#### Development

- TypeScript (progressive migration, strict mode enabled)
- JSDoc (95% coverage requirement)
- Semantic Versioning
- markdownlint, .editorconfig, Prettier

## Coding Standards

See [CONTRIBUTING.md](./CONTRIBUTING.md) for comprehensive guidelines.

### Key Standards

#### Documentation

- JSDoc required for all classes, methods, functions (95% coverage)
- Include `@param`, `@returns`, `@throws`, `@example`
- Document "why" not just "what"
- See: CONTRIBUTING.md section "JSDoc Documentation Standards"

#### Code Style

- CommonJS modules (`require/module.exports`)
- TypeScript for new code (progressive migration)
- DRY principle (reference, don't duplicate)
- Manager-based patterns for new features
- WikiContext pattern for request handling
- Avoid over-engineering (implement only what's needed)

#### Testing

- Jest `__tests__/` co-located with source
- Mock fs-extra, gray-matter (no real file I/O)
- >80% coverage for managers (>90% for critical managers)
- Integration tests for cross-component features
- See: `docs/testing/`

#### Version Control

- Semantic commit messages: `feat:`, `fix:`, `chore:`
- Keep a Changelog format in CHANGELOG.md
- GitHub CLI for issues/PRs
- Server restart required after config changes

## Project Log

See [project_log.md](./project_log.md) for AI agent session tracking. Format: yyyy-MM-dd-## with Agent, Subject, Key Decisions, Work Done, Commits, and Files Modified.

## TODO & Next Steps

See [docs/planning/TODO.md](./docs/planning/TODO.md) for comprehensive task list.

### Current High Priority

From TODO.md (Last Updated: October 19, 2025):

1. **Attachment UI Enhancement** (2-3 weeks)
   - Upload widget with drag-drop
   - Inline attachment management panel
   - Image/video preview and optimization
   - Attachment search functionality
   - Status: 📋 Not Started

2. **TypeScript Migration** (Ongoing)
   - Progressive migration strategy
   - Strict mode enabled
   - CommonJS compatibility maintained
   - Status: 🔄 In Progress

3. **WikiDocument DOM Testing** (High Priority)
   - Comprehensive WikiDocument.test.js
   - 90%+ coverage target
   - WeakRef garbage collection tests
   - Status: 📋 Not Started

### Platform Roadmap

See [docs/planning/ROADMAP.md](./docs/planning/ROADMAP.md)

#### Phase 2 (Next): Content Modules

- Blog module with RSS/Atom feeds
- Document management with versioning
- Photo management with EXIF metadata
- Asset management tracking

#### Phase 3: Business Modules

- E-Commerce store
- Event management
- Project management
- Client portal

#### Phase 4: Advanced Features

- Real-time collaboration
- Mobile apps
- API expansion

## Current Sprint/Focus

### Status Overview

#### Active Work

- Installation system looping issue - FIXED ✅
- Form partial installation retry logic - IMPLEMENTED ✅
- Server process management - CRITICAL ISSUE IDENTIFIED 🚨

#### Blockers

✅ **FIXED: GitHub Issue #167** - Multiple server instances running
- Implemented Option A: Keep PM2, fix coordination in server.sh
- Process validation before startup (check existing PID, port availability)
- Orphaned process cleanup on start (pkill -9 node.*app.js)
- Single PID file enforcement (.amdwiki.pid only, no legacy files)
- Graceful stop with force-kill fallback
- Comprehensive status command showing server state

#### Recent Completions (Session 2025-12-06)

- Fixed installation loop issue (allow retrying partial installations)
- Verified backend security (admin credentials hardcoded at backend)
- Identified root cause of form template caching issue
- Created comprehensive INSTALLATION-SYSTEM.md documentation
- Created GitHub issue #167 for server process management
- Modified InstallService.processInstallation() to support partial installation recovery
- Consolidated 4 installation docs into single INSTALLATION-SYSTEM.md file
- Analyzed Docker/Kubernetes compatibility for process management options
- Implemented Issue #167 fix in server.sh (Option A: Keep PM2, fix coordination)
- Enhanced server.sh with 7-step validation and cleanup process
- Verified single instance enforcement (one .amdwiki.pid, one Node process)
- Tested restart/stop/start/unlock commands - all working correctly

#### Next Milestones

1. ✅ **DONE:** Fix GitHub issue #167 (PID lock mechanism)
2. **NEXT:** Manual browser testing of install form (now #167 is fixed)
3. Test partial installation recovery scenario
4. Verify admin account creation flow end-to-end
5. Test installation reset functionality
6. Attachment UI Enhancement completion
7. WikiDocument comprehensive testing

## Notes & Context

### Project Maturity

- **Phase 1** (Core Wiki): 95% complete
- **Current Version:** 1.3.3 (Semantic Versioning)
- **Architecture:** Mature, manager-based, well-documented
- **Documentation:** 100+ files, 95% JSDoc coverage
- **Testing:** 376+ tests, Jest framework

### Key Technologies

- **Storage:** File-based Markdown with YAML frontmatter
- **Versioning:** Delta storage (fast-diff) + compression (pako)
- **Parsing:** Showdown + custom JSPWiki handlers
- **Sessions:** express-session with FileStore
- **Process Management:** PM2 with custom server.sh wrapper

### External Dependencies

- Node.js v18+ required
- PM2 for production
- ~/GLOBAL-CODE-PREFERENCES.md for global standards
- No database required (file-based)

### Communication

- **GitHub Issues:** Bug reports and feature requests
- **GitHub Discussions:** Questions and general discussion
- **GitHub CLI:** Primary interaction method
- **Draft PRs:** Early feedback on complex changes

### Performance Notes

- Delta storage saves 80-95% space for versions
- Page caching via NodeCache
- Bootstrap 5 for responsive UI
- No CDN dependencies (all assets local)

## Agent Guidelines

### For All Agents

**Before Starting:**

1. Read [~/GLOBAL-CODE-PREFERENCES.md](~/GLOBAL-CODE-PREFERENCES.md) - Overarching principles
2. Read this [AGENTS.md](./AGENTS.md) - Project context and current state
3. Review [CONTRIBUTING.md](./CONTRIBUTING.md) - Development standards
4. Check [docs/planning/TODO.md](./docs/planning/TODO.md) - Current tasks and priorities
5. Review [CHANGELOG.md](./CHANGELOG.md) - Recent changes (v1.3.3)

**During Work:**

- Follow manager-based architecture patterns (extend BaseManager)
- Use WikiContext for request/user context (single source of truth)
- Write comprehensive JSDoc documentation (95% coverage standard)
- Create tests in `__tests__/` directories (mock all file I/O)
- Reference docs, don't duplicate (DRY principle)
- Use GitHub CLI for issues/PRs

**After Completing Work:**

- Update [project_log.md](./project_log.md) with session details
- Update [docs/planning/TODO.md](./docs/planning/TODO.md) if tasks completed
- Update [CHANGELOG.md](./CHANGELOG.md) for version releases
- Restart server if config changes: `./server.sh restart`
- Run tests: `npm test`

### amdWiki-Specific Patterns

**Creating New Managers:**

```javascript
// Extend BaseManager, add JSDoc, implement initialize()
class NewManager extends BaseManager {
  constructor(engine) {
    super(engine);
  }

  async initialize(config = {}) {
    await super.initialize(config);
    // Manager initialization
  }
}
```

**Using WikiContext:**

```javascript
// In route handlers
const wikiContext = this.createWikiContext(req, {
  context: WikiContext.CONTEXT.VIEW,
  pageName: pageName,
  content: content
});

// Extract template data
const templateData = this.getTemplateDataFromContext(wikiContext);
```

**Configuration Access:**

```javascript
const configManager = engine.getManager('ConfigurationManager');
const value = configManager.getProperty('amdwiki.category.property', 'default');
```

**Server Management:**

```bash
./server.sh start dev    # Development mode
./server.sh restart prod # Production restart
./server.sh logs         # View logs
./server.sh status       # Check status
```

## Documentation Map

### Getting Started

- [README.md](./README.md) - Comprehensive project overview
- [CONTRIBUTING.md](./CONTRIBUTING.md) - Development guide (31KB)
- [SERVER.md](./SERVER.md) - Server management

### Planning & Status

- [docs/planning/TODO.md](./docs/planning/TODO.md) - Task tracking (32KB)
- [docs/planning/ROADMAP.md](./docs/planning/ROADMAP.md) - Platform vision
- [CHANGELOG.md](./CHANGELOG.md) - Version history
- [project_log.md](./project_log.md) - AI session log

### Architecture

- [docs/architecture/PROJECT-STRUCTURE.md](./docs/architecture/PROJECT-STRUCTURE.md)
- [docs/architecture/MANAGERS-OVERVIEW.md](./docs/architecture/MANAGERS-OVERVIEW.md)
- [docs/architecture/WikiDocument-DOM-Architecture.md](./docs/architecture/WikiDocument-DOM-Architecture.md)
- [docs/architecture/Policies-Roles-Permissions.md](./docs/architecture/Policies-Roles-Permissions.md)

### Testing

- [docs/testing/PageManager-Testing-Guide.md](./docs/testing/PageManager-Testing-Guide.md)
- Coverage: `npm run test:coverage`

### Configuration

- `config/app-default-config.json` - Base defaults (1150+ properties)
- `config/app-development-config.json` - Dev overrides
- `config/app-production-config.json` - Prod overrides
- `config/app-custom-config.json` - Local overrides (gitignored)

### API & Development

- [docs/api/](./docs/api/) - API documentation
- [docs/developer/](./docs/developer/) - Developer guides
- [docs/migration/](./docs/migration/) - Migration guides

---

**Important:** Keep AGENTS.md and project_log.md synchronized. They are the bridge between different agents working on the same project.
