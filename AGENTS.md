---
project_state: "template"
lastModified: '2025-10-26T00:00:00.000Z'
agent_priority_level: "medium"
blockers: []
requires_human_review: ["major architectural changes", "security policy modifications", "deployment to production"]
agent_autonomy_level: "high"
---

# Project Context for AI Agents

This file serves as the single source of truth for project context and state. All Experts should read this and update file when working on this project.

## Agent Context Protocol

### Eagerness

Do not jump into implementation or change files unless clearly instructed to make changed. When the user's intent is ambiguous, default to providing information, doing research, and providing recommendations rather than taking action. Only proceed with edits, modifications, or implementations when the user explicitly requests them.

### Use parallel tool calls

If you intend to call multiple tools and there are no dependencies between the tool calls, make all of the independent tool calls in parallel. Prioritize calling tools simultaneously whenever the actions can be done in parallel rather than sequentially. For example, when reading 3 files, run 3 tool calls in parallel to read all 3 files into context at the same time. Maximize use of parallel tool calls where possible to increase speed and efficiency.
However, if some tool calls depend on previous calls to inform dependent values like the parameters, do not call these tools in parallel and instead call them sequentially.
Never use placeholders or guess missing parameters in tool calls.

### DO not speculate

Never speculate about code you have not opened. If the user references a specific file, you MUST read the file before answering.
Make sure to investigate and read relevant files BEFORE answering questions about the codebase.
Never make any claims about code before investigating unless you are certain of the correct answer - give grounded and hallucination-free answers.

### Machine-Readable Metadata

See YAML frontmatter above for current project state.

### Update Requirements

- Update `last_updated` field whenever making significant changes to this file
- Update `project_state` to reflect current status: "template", "active", "maintenance", "archived"
- Update `blockers` array with any current blockers preventing progress
- Update `agent_priority_level` based on urgency: "low", "medium", "high", "critical"
- After completing a task that involves tool use, provide a quick summary of the work you've done

## ⚠️ CRITICAL Core Documentation (Single Source of Truth)

- [GLOBAL-CODE-PREFERENCES.md](./GLOBAL-CODE-PREFERENCES.md) - **Single Source of Truth:** Overarching principles (DRY, secrets management, progressive iteration, project logging)
- [SETUP.md](./SETUP.md) - **Single Source of Truth:** Installation, prerequisites, environment setup, verification steps
- [CODE_STANDARDS.md](./CODE_STANDARDS.md) - **Single Source of Truth:** Naming conventions, code formatting, linting, testing, commit message format, performance guidelines
- [ARCHITECTURE.md](./ARCHITECTURE.md) - **Single Source of Truth:** Project structure, directory conventions, file organization, technology stack
- [SECURITY.md](./SECURITY.md) - **Single Source of Truth:** Secret management, dependency security, authentication, encryption, deployment security
- [CONTRIBUTING.md](./CONTRIBUTING.md) - **Single Source of Truth:** Development workflow, branching strategy, pull request process, code review
- [DOCUMENTATION.md](./DOCUMENTATION.md) - **Single Source of Truth:** Documentation navigation, DRY principles applied to docs, finding the right doc
- [project_log.md](docs/project_log.md) - **Single Source of Truth:** Historical record of work done, next steps, session tracking
- [TODOs](docs/TODO.md) - WHat we are working on NOW.
- Use PROJECT_REPOSITORY as defined in [.env](.env)

### ⚠️ CRITICAL Preventing Regressions**

⚠️ **Changes breaking previously working services is a known issue.**

See [docs/testing/PREVENTING-REGRESSIONS.md](/docs/testing/PREVENTING-REGRESSIONS.md) for comprehensive prevention strategy.

### Auxiliary Documentation

- [README.md](./README.md) - Project overview and quick start (references above docs)
- [.github/workflows](.github/workflows) - CI/CD pipelines and automation

## Context Overview

- Project Name: `$PROJECT_NAME` (from .env)
- Description: A brief description of what this project does and its primary purpose.
- Example Project (for reference):
  - Project Name: `user-auth-service`
  - Description: A secure authentication microservice that handles user registration, login, JWT token management, and password reset flows for distributed applications.

## Key Decisions

Key Decisions may be done initially or decided the project progresses. Include "Decision and rationale"

### "One File Done Right" TypeScript Migration Process**

- ALWAYS Enable Strict Mode for TypeScript
- Fix ALL ESLint errors in .ts files
- Install missing `@types/*` packages if needed
- Update test imports to use .ts file (remove `.js` extension, adjust `.default`)
- Delete the .js file only after ESLint passes
- Run full test suite - all tests must pass
- Commit complete migration (one atomic commit per file)

  Key type fixes:
  - Use `getManager<ManagerType>('Name')` for typed manager access
  - Add explicit type assertions: `as string`, `as Type`
  - Use `Promise.resolve()` for sync methods with Promise signatures
  - Create local interfaces for untyped managers

## Project Specifics

- All configuration MUST use ConfigurationManager - no hardcoded fallbacks (DRY)
- Use Playwright for E2E testing with Chromium browser, integrate into CI/CD
- Schema.org-compliant front matter, PascalCase naming, TypeDoc for automation
- Implement lint-staged to only lint staged files (not all files), allowing incremental improvement
- Move from ES2020 to ES2022
- ecosystem.config.js accepted as infrastructure-level (PM2 runs before app)
- Consolidate all instance-specific data into `./data/` directory

## Architecture & Tech Stack

See [ARCHITECTURE.md](./ARCHITECTURE.md) for project structure, technology stack, and architectural decisions.

## Coding Standards

See [CODE_STANDARDS.md](./CODE_STANDARDS.md) for naming conventions, formatting, linting, testing, and commit message format.

## Project Constraints

These may be done initially or as the project progresses.

- Node.js v18+ required
- TypeScript strict mode must remain enabled
- All code must pass linting and tests before commit
- No unencrypted secrets in Git (per GLOBAL-CODE-PREFERENCES.md)

### Update Requirements

- Update `last_updated` field whenever making significant changes to this file
- Update `project_state` to reflect current status: "template", "active", "maintenance", "archived"
- Update `blockers` array with any current blockers preventing progress
- Update `agent_priority_level` based on urgency: "low", "medium", "high", "critical"

### Auxiliary Documentation

- [README.md](./README.md) - Project overview and quick start (references above docs)
- [.github/workflows/README.md](.github/workflows/README.md) - CI/CD pipelines and automation

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

- Node.js v20+ required
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

## Quick Navigation

### ⚠️ CRITICAL - Read Before Making Changes

**[PREVENTING-REGRESSIONS.md](/docs/testing/PREVENTING-REGRESSIONS.md)** - **Prevents breaking existing services** (automated testing strategy)

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

Keep [docs/planning/TODO.md](/docs/planning/TODO.md) as the current tasks that need to be addressed.

Once completed and documentes in project_log.md they should be removed from this list.

### Current High Priority

From TODO.md (Last Updated: October 19, 2025):

### Platform Roadmap

See [docs/planning/ROADMAP.md](/docs/planning/ROADMAP.md)

Should contain only High-level targets for enhancments.

Once selsected for work they should be added to [docs/planning/TODO.md](/docs/planning/TODO.md) and they should be removed from this list.
