---
project_state: "template"
last_updated: "2025-12-21"
agent_priority_level: "medium"
blockers: []
requires_human_review: ["major architectural changes", "security policy modifications", "deployment to production"]
agent_autonomy_level: "high"
---

# Project Context for AI Agents

This file serves as the single source of truth for project context and state. All Experts should read this and update file when working on this project.

## Agent Context Protocol

### Machine-Readable Metadata

See YAML frontmatter above for current project state.

### Update Requirements

- Update `last_updated` field whenever making significant changes to this file
- Update `project_state` to reflect current status: "template", "active", "maintenance", "archived"
- Update `blockers` array with any current blockers preventing progress
- Update `agent_priority_level` based on urgency: "low", "medium", "high", "critical"

## CRITICAL

- Read [GLOBAL-CODE-PREFERENCES.md](./GLOBAL-CODE-PREFERENCES.md) first - This contains overarching principles that govern all work on this project

## Quick Navigation - Single Source of Truth

Each document is the authoritative source for its topic. Other docs reference these sources, never duplicate content.

### Core Documentation (Single Source of Truth)

- [GLOBAL-CODE-PREFERENCES.md](./GLOBAL-CODE-PREFERENCES.md) - **SSoT:** Overarching principles (DRY, secrets management, progressive iteration, project logging)
- [SETUP.md](./SETUP.md) - **SSoT:** Installation, prerequisites, environment setup, verification steps
- [CODE_STANDARDS.md](./CODE_STANDARDS.md) - **SSoT:** Naming conventions, code formatting, linting, testing, commit message format, performance guidelines
- [ARCHITECTURE.md](./ARCHITECTURE.md) - **SSoT:** Project structure, directory conventions, file organization, technology stack
- [SECURITY.md](./SECURITY.md) - **SSoT:** Secret management, dependency security, authentication, encryption, deployment security
- [CONTRIBUTING.md](./CONTRIBUTING.md) - **SSoT:** Development workflow, branching strategy, pull request process, code review
- [DOCUMENTATION.md](./DOCUMENTATION.md) - **SSoT:** Documentation navigation, DRY principles applied to docs, finding the right doc
- [project_log.md](docs/project_log.md) - **SSoT:** Historical record of work done, next steps, session tracking

### Auxiliary Documentation

- [README.md](./README.md) - Project overview and quick start (references above docs)
- [.github/workflows/README.md](.github/workflows/README.md) - CI/CD pipelines and automation

## Context Overview

- Project Name: `$PROJECT_NAME` (from .env.example)
- Description: A brief description of what this project does and its primary purpose.
- Example Project (for reference):
  - Project Name: `user-auth-service`
  - Description: A secure authentication microservice that handles user registration, login, JWT token management, and password reset flows for distributed applications.

## Key Decisions

These may be done initially or as the project progresses. Include "Decision and rationale"

- All configuration MUST use ConfigurationManager - no hardcoded fallbacks (DRY)
- Use Playwright for E2E testing with Chromium browser, integrate into CI/CD
- Schema.org-compliant front matter, PascalCase naming, TypeDoc for automation
- Implement lint-staged to only lint staged files (not all files), allowing incremental improvement
- Move from ES2020 to ES2022
- ecosystem.config.js accepted as infrastructure-level (PM2 runs before app)
- Consolidate all instance-specific data into `./data/` directory

## Architecture & Tech Stack

See [docs/architecture/](./docs/architecture/) for comprehensive documentation.

## Coding Standards

See [CONTRIBUTING.md](./CONTRIBUTING.md) for comprehensive guidelines.

## Project Constraints

These may be done initially or as the project progresses.

## Project Log

See [project_log.md](./project_log.md) for AI agent session tracking. Formated in the method show at top of file.

## Agent Priority Matrix

### Agents CAN Work Autonomously On

- Code refactoring following established patterns
- Bug fixes for non-critical issues
- Documentation updates and corrections
- Writing tests for existing functionality
- Adding features explicitly described in project_log.md
- Code quality improvements (linting, formatting, type safety)
- Dependency updates (patch and minor versions)
- Performance optimizations with measurable impact

### Agents MUST Request Human Review For

- Major architectural changes or new patterns
- Security policy modifications or authentication changes
- Database schema migrations
- Deployment to production environments
- Breaking API changes
- Major dependency updates (major versions)
- Changes affecting user data or privacy
- Modifications to CI/CD pipelines
- Adding new third-party services or integrations

## Known Limitations & Constraints

### Technical Constraints

- Node.js v18+ required
- TypeScript strict mode must remain enabled
- All code must pass linting and tests before commit
- No unencrypted secrets in Git (per GLOBAL-CODE-PREFERENCES.md)

### Process Constraints

- All work must be done in feature branches
- Pull requests required for main branch
- Update project_log.md after each session
- Update this file's `last_updated` timestamp when making changes

### Agent-Specific Guidelines

- Always read this file before starting work
- Check blockers array before proceeding
- Respect the priority matrix above
- When uncertain, ask for human guidance
- Document all assumptions and decisions

## Notes & Context

## GitHub Workflow

See [CONTRIBUTING.md](./CONTRIBUTING.md) for branching strategy, commit guidelines, pull request process, and testing requirements.

**Important:** Keep this file synchronized and updated. This is the bridge between different experts working on the same project.

## amdWiki AI Agent Context

Single source of truth for amdWiki project context. Read this first when working on the project.

## ⚠️ CRITICAL - Read Global Preferences First

Follow for overarching principles:

- Be concise and sacrifice grammar for consistion
- DRY (Don't Repeat Yourself) principle in Documentation and Code. Refer to other Documents.
- Iterate Progressively. Start with Core features only: Gather feedback.
- Present a list of unresolved questions to answer, if any.
- Questions, Comments and Suggestions are always encouraged!
- Your primary method for interacting with GitHub should be the CLI.
- On larger objectives present phased implementation plan
- NEVER put unencrypted "Secrets" in Git.
- Always create project_log.md file as aa log of work done on the project in format
  - yyyy-MM-dd-## - Created new file - "Commit"
- Use the following
  - .editorconfig
  - .prettierrc.json
  - .prettierignore

## Quick Navigation

### ⚠️ CRITICAL - Read Before Making Changes

**[PREVENTING-REGRESSIONS.md](docs/testing/PREVENTING-REGRESSIONS.md)** - **Prevents breaking existing services** (automated testing strategy)

### Root-Level Documentation (Start Here)

- [README.md](./README.md) - Project overview and quick start
- [SETUP.md](./SETUP.md) - Installation and setup instructions
- [ARCHITECTURE.md](./ARCHITECTURE.md) - System architecture and design patterns
- [CODE_STANDARDS.md](./CODE_STANDARDS.md) - Coding standards and best practices
- [CONTRIBUTING.md](./CONTRIBUTING.md) - Development workflow and guidelines
- [SECURITY.md](./SECURITY.md) - Security practices and threat model
- [CHANGELOG.md](./CHANGELOG.md) - Release history and version tracking
- [CODE_OF_CONDUCT.md](./CODE_OF_CONDUCT.md) - Community guidelines
- [DOCUMENTATION.md](./DOCUMENTATION.md) - Complete documentation index

### Detailed Documentation (In docs/ directory)

- [docs/INSTALLATION-SYSTEM.md](./docs/INSTALLATION-SYSTEM.md) - Installation wizard details
- [docs/INSTALLATION-TESTING-RESULTS.md](./docs/INSTALLATION-TESTING-RESULTS.md) - Testing verification
- [docs/SERVER.md](./docs/SERVER.md) - Server management and deployment
- [docs/SERVER-MANAGEMENT.md](./docs/SERVER-MANAGEMENT.md) - Best practices (Issue #167 fix)
- [docs/project_log.md](./docs/project_log.md) - AI agent work history
- [docs/architecture/](./docs/architecture/) - Architecture patterns (15+ documents)
- [docs/planning/TODO.md](./docs/planning/TODO.md) - Current tasks and priorities
- [docs/planning/ROADMAP.md](./docs/planning/ROADMAP.md) - Long-term platform vision

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
- **Current Version:** 1.5.0
- **Last Updated:** 2025-12-16
- **Phase:** Mature development transitioning to platform expansion
- **Next Milestone:** Fix remaining E2E test selectors, Attachment UI Enhancement, TypeScript migration

### Key Architecture Patterns

#### Manager-Based Architecture

- 23 specialized managers extending BaseManager
- Central WikiEngine orchestrator
- Manager access via `engine.getManager('ManagerName')`
- Key managers: PageManager, UserManager, ACLManager, RenderingManager, PluginManager

#### WikiContext Pattern

WikiContext should always be used.

- Single source of truth for request/user context
- Created per request with: context type, page name, user context, engine reference
- Passed to managers, plugins, parsers, handlers
- See: `docs/WikiContext-Complete-Guide.md`

#### WikiDocument DOM Pipeline

WikiDocument should always be used.

- Three-phase extraction: Extract JSPWiki → Create DOM Nodes → Merge with Markdown
- Handler-based: DOMVariableHandler, DOMPluginHandler, DOMLinkHandler
- No parsing conflicts between JSPWiki and Markdown syntax
- See: `docs/WikiDocument-Complete-Guide.md`

#### Provider Pattern

- Abstract provider interfaces (BasePageProvider, BaseUserProvider, etc.)
- Concrete implementations (FileSystemPageProvider, FileUserProvider)
- Enables storage backend swapping without manager changes

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
- [markdownlint](.vscode/settings.json), .editorconfig, Prettier

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

## TODO & Next Steps

See [docs/planning/TODO.md](/docs/planning/TODO.md) for comprehensive task list.

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

See [docs/planning/ROADMAP.md](/docs/planning/ROADMAP.md)

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

#### Completed (Session 2025-12-15) - Issue #176 CLOSED

**ConfigurationManager Enforcement (DRY Principle):**

- ✅ Removed legacy Config.js system entirely
- ✅ All configuration now uses ConfigurationManager.getProperty()
- ✅ Removed all hardcoded path fallbacks from source files
- ✅ getConfig() method deprecated (throws error pointing to ConfigurationManager)
- ✅ Deleted: config/Config.js, ConfigBridge.js, DigitalDocumentPermissionConfig.js, legacy/
- ✅ Fixed #173: Jest --testPathPattern → --testPathPatterns (deprecation)
- ✅ Deleted obsolete parser integration tests (mock-based, not real integration)

**Files Modified:**

- WikiEngine.js, WikiRoutes.js, ACLManager.js, ConfigurationManager.js
- NotificationManager.js, SchemaManager.js, BackupManager.js, InstallService.js

**Key Decisions:

**Test Status (2025-12-15):**

- Test Suites: 21 failed, 48 passed (69 total)
- Pass Rate: ~86%

---

#### Completed (Session 2025-12-12) - v1.5.0 MERGED

**Docker Data Consolidation - PR #171 (MERGED):**

- ✅ Consolidated all instance data into `./data/` directory
- ✅ Updated 6 provider-specific paths in `app-default-config.json`
- ✅ Created migration script `scripts/migrate-to-data-dir.sh`
- ✅ Fixed InstallService.js hardcoded paths (use ConfigurationManager)
- ✅ Fixed TotalPagesPlugin async/await bug
- ✅ Updated Dockerfile and docker-compose.yml for single data volume
- ✅ Bumped version to 1.5.0 (BREAKING CHANGE)
- ✅ Squash-merged PR #171 to master

**New Data Structure (v1.5.0):**

```
data/
├── pages/        - Wiki content
├── users/        - User accounts
├── attachments/  - File attachments
├── logs/         - Application logs
├── search-index/ - Search index
├── backups/      - Backup files
├── sessions/     - Session files
└── versions/     - Page versions
```

**Test Status (2025-12-12):**

- Test Suites: 21 failed, 46 passed (67 total)
- Tests: 277 failed, 1409 passed (1692 total)
- **Pass Rate: 83.3%**

#### Issues Created (Session 2025-12-12)

- #169 - LoggingProvider pattern (future enhancement)
- #170 - BackupProvider pattern (future enhancement)

#### Bug Fixes (Session 2025-12-12)

- ✅ InstallService.js - 4 hardcoded `../../users/` paths now use ConfigurationManager
- ✅ TotalPagesPlugin - Missing async/await on getAllPages() call
- ✅ UserManager.test.js - Fixed with proper engine/provider mocking (30 tests)

#### Documentation Consolidation (Session 2025-12-12)

- ✅ Consolidated testing docs into 3 files:
  - `docs/testing/Testing-Summary.md` - Current test status
  - `docs/testing/Complete-Testing-Guide.md` - Comprehensive guide
  - `docs/testing/PREVENTING-REGRESSIONS.md` - Regression prevention
- ✅ Deleted 10 obsolete testing docs

#### Previous Completions (Session 2025-12-07)

**Test Suite Fixes:**

- ✅ Fixed UserManager.test.js (31 tests) - Complete rewrite to match actual implementation
  - Fixed authentication flow (getUser → verifyPassword)
  - Added PolicyManager mocking for permission tests
  - Corrected all method names (authenticateUser, getUsers, getRoles)
  - Password security testing (hash/verify)
- ✅ Fixed PageManager.test.js (26 tests) - Proxy behavior testing
- ✅ Fixed PageNameMatcher.test.js (43 tests) - Pure unit tests
- ✅ Fixed WikiContext.test.js (12 tests) - Core component
- ✅ Fixed FilterChain.test.js (28 tests) - Quick win
- ✅ Fixed SchemaManager.test.js (9 tests) - Quick win

**Infrastructure:**

- ✅ Global test setup (jest.setup.js) with provider mocking
- ✅ Comprehensive KNOWN-TEST-ISSUES.md documentation
- ✅ Fix-as-needed strategy (Option C) implementation

#### Previous Completions (Session 2025-12-12)

- ✅ Fixed GitHub Issue #174 - Required pages no longer show in operating wiki
  - FileSystemProvider only loads required-pages during installation
  - Pages with system-category: system/documentation require Admin to edit
- ✅ Fixed GitHub Issue #172 - ReferringPagesPlugin now shows plural-linked pages
  - buildLinkGraph() now uses pageNameMatcher for plural resolution

#### Previous Completions (Session 2025-12-06)

- ✅ Installation system fully working - users can complete setup wizard and login
- ✅ Fixed GitHub Issue #167 - Server process management (PM2 coordination)
- ✅ Fixed installation loop issue (partial installation retry)
- ✅ Email validation fixed (admin@localhost accepted)
- ✅ ConfigurationManager method call fixed

#### Next Milestones

**Testing:**

1. ✅ **DONE:** Fix high-priority manager tests (WikiContext, PageManager, UserManager)
2. **NEXT:** Continue incremental test fixes during feature work (40 suites remaining)
3. Target: < 10 failing suites within 1 month

**Installation:**

1. ✅ **DONE:** Fix GitHub issue #167 (PID lock mechanism)
2. Manual browser testing of install form (now #167 is fixed)
3. Test partial installation recovery scenario
4. Attachment UI Enhancement completion
5. WikiDocument comprehensive testing

### Project Maturity

- **Phase 1** (Core Wiki): 95% complete
- **Current Version:** 1.5.0 (Semantic Versioning)
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

### CRITICAL: Preventing Regressions**

⚠️ **Changes breaking previously working services is a known issue.**

See [docs/development/PREVENTING-REGRESSIONS.md](/docs/development/PREVENTING-REGRESSIONS.md) for comprehensive prevention strategy including:

- Automated testing requirements
- Pre-commit validation checklist
- Integration testing approach
- Manager contract enforcement

**Before Starting:**

- Read this [AGENTS.md](./AGENTS.md) - Project context and current state
- Review [CONTRIBUTING.md](./CONTRIBUTING.md) - Development standards
- Check [docs/planning/TODO.md](./docs/planning/TODO.md) - Current tasks and priorities
- Review [CHANGELOG.md](./CHANGELOG.md) - Recent changes (v1.5.0)
- **Run smoke tests:** `npm run smoke` (if available, see PREVENTING-REGRESSIONS.md)
- **If changing manager APIs:** Read relevant contract in [docs/development/PREVENTING-REGRESSIONS.md](/docs/development/PREVENTING-REGRESSIONS.md)

**During Work:**

- Follow manager-based architecture patterns (extend BaseManager)
- Use WikiContext for request/user context (single source of truth)
- Write comprehensive JSDoc documentation (95% coverage standard)
- **Write tests BEFORE changing code** (TDD approach prevents regressions)
- Create tests in `__tests__/` directories (mock all file I/O)
- **Run tests after each significant change:** `npm test -- <relevant-file>.test.js`
- Reference docs, don't duplicate (DRY principle)
- Use GitHub CLI for issues/PRs

**After Completing Work:**

- **Run full test suite:** `npm test` (MUST PASS before committing)
- **Run integration tests:** `npm run test:integration` (if available)
- **Verify coverage didn't drop:** `npm test -- --coverage`
- Update [project_log.md](./docs/project_log.md) with session details
- Update [docs/planning/TODO.md](./docs/planning/TODO.md) if tasks completed
- Update [CHANGELOG.md](./CHANGELOG.md) for version releases
- Restart server if config changes: `./server.sh restart`
- **If ANY test fails, do NOT commit. Fix first.**

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

### Testing & Quality Assurance

- **[docs/testing/Testing-Summary.md](./docs/testing/Testing-Summary.md)** - Current test status and quick reference
- **[docs/testing/Complete-Testing-Guide.md](./docs/testing/Complete-Testing-Guide.md)** - Comprehensive testing documentation
- **[docs/testing/PREVENTING-REGRESSIONS.md](./docs/testing/PREVENTING-REGRESSIONS.md)** - Regression prevention strategy
- **Test Commands:**
  - Unit tests: `npm test` (Jest)
  - Coverage: `npm run test:coverage`
  - E2E tests: `npm run test:e2e` (Playwright)
  - E2E with UI: `npm run test:e2e:ui`
- **E2E Test Credentials:** admin / admin123 (or set E2E_ADMIN_USER, E2E_ADMIN_PASS)
- **Test Requirements:**
  - Write tests BEFORE changing code (TDD)
  - All tests must pass before committing
  - Coverage must not decrease
  - Integration tests for manager interactions

### Configuration

- `config/app-default-config.json` - Base defaults (1150+ properties)
- `config/app-development-config.json` - Dev overrides
- `config/app-production-config.json` - Prod overrides
- `config/app-custom-config.json` - Local overrides (gitignored)

### API & Development

- **[docs/development/PREVENTING-REGRESSIONS.md](./docs/development/PREVENTING-REGRESSIONS.md)** - Regression prevention strategy (CI/CD, testing)
- [docs/api/](./docs/api/) - API documentation
- [docs/developer/](./docs/developer/) - Developer guides
- [docs/migration/](./docs/migration/) - Migration guides

---

**Important:** Keep AGENTS.md and project_log.md synchronized. They are the bridge between different agents working on the same project.
