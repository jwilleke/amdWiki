# amdWiki AI Agent Context

Single source of truth for amdWiki project context. Read this first when working on the project.

## ⚠️ CRITICAL - Read Global Preferences First

Read [~/GLOBAL-CODE-PREFERENCES.md](~/GLOBAL-CODE-PREFERENCES.md) for overarching principles:

- Concise, DRY code and documentation
- Iterate progressively, start with core features
- NEVER put unencrypted secrets in Git
- Use project_log.md to track all work
- GitHub CLI primary method for interactions
- Use markdownlint, .editorconfig, .prettierrc.json standards

## Quick Navigation

### ⚠️ CRITICAL - Read Before Making Changes

- **[PREVENTING-REGRESSIONS.md](.docs/testing/PREVENTING-REGRESSIONS.md)** - **Prevents breaking existing services** (automated testing strategy)

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

See [project_log.md](./project_log.md) for AI agent session tracking. Formated in the method show at top of file.

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

#### Active Work (Session 2025-12-07-02)

**Test Suite Improvements - High Priority Manager Tests:**

- ✅ UserManager.test.js - COMPLETE (31/31 tests passing)
- ✅ PageManager.test.js - COMPLETE (26/26 tests passing)
- ✅ WikiContext.test.js - COMPLETE (12/12 tests passing)

**Current Test Status:**

- Test Suites: 40 failed, 27 passed, 67 total (60% pass rate)
- Tests: 547 failed, 1 skipped, 1169 passed, 1717 total (68% pass rate)
- Improvement: +126 passing tests since 2025-12-06

#### Recent Completions (Session 2025-12-07)

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

### CRITICAL: Preventing Regressions**

⚠️ **Changes breaking previously working services is a known issue.**

See [docs/development/PREVENTING-REGRESSIONS.md](./docs/development/PREVENTING-REGRESSIONS.md) for comprehensive prevention strategy including:

- Automated testing requirements
- Pre-commit validation checklist
- Integration testing approach
- Manager contract enforcement

**Before Starting:**

1. Read [~/GLOBAL-CODE-PREFERENCES.md](~/GLOBAL-CODE-PREFERENCES.md) - Overarching principles
2. Read this [AGENTS.md](./AGENTS.md) - Project context and current state
3. Review [CONTRIBUTING.md](./CONTRIBUTING.md) - Development standards
4. Check [docs/planning/TODO.md](./docs/planning/TODO.md) - Current tasks and priorities
5. Review [CHANGELOG.md](./CHANGELOG.md) - Recent changes (v1.3.3)
6. **Run smoke tests:** `npm run smoke` (if available, see PREVENTING-REGRESSIONS.md)
7. **If changing manager APIs:** Read relevant contract in [docs/development/PREVENTING-REGRESSIONS.md](./docs/development/PREVENTING-REGRESSIONS.md)

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

- **[docs/development/PREVENTING-REGRESSIONS.md](./docs/development/PREVENTING-REGRESSIONS.md)** - **⚠️ READ FIRST:** Comprehensive strategy to prevent breaking changes
- [docs/testing/PageManager-Testing-Guide.md](./docs/testing/PageManager-Testing-Guide.md) - Specific testing guide
- Coverage: `npm run test:coverage`
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
