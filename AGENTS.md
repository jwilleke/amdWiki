---
project_state: "active"
lastModified: '2026-01-27T00:00:00.000Z'
agent_priority_level: "medium"
blockers: []
requires_human_review: ["major architectural changes", "security policy modifications", "deployment to production"]
agent_autonomy_level: "high"
---

# Agent Context & Protocols

This file is the **Context Map** for AI agents. It directs you to the Single Source of Truth (SSoT) for specific domains and defines your operational parameters.

## 🤖 Operational Protocol

- Look at the app and architecture.
- Understand deeply how it works inside and out.
- Do not guess. Be sure you understand the issue and as any clarifying questions before proceeding.
- Check top of docs/project_log.md and GitHub commits for recent work performed.
- After completing a task that involves tool use, provide a quick summary of the work you've done
- This will be the basis for the rest of our conversation.

Do not guess. Be sure you understand the issue and as any clarifying questions before proceeding.

1. **Be Precise:** Do not speculate. Read the code/docs first.
2. **Parallel Execution:** Use parallel tool calls for independent reads/searches.
3. **Safety First:** Explain modifying commands before execution.
4. **No Regressions:** Run tests before and after changes.

## GitHub Issue

Always use the appriate .github/ISSUE_TEMPLATE

## 🗺️ Knowledge Map (Single Source of Truth)

**Start Here:**

- **Project Overview:** [README.md](./README.md)
- **Current Tasks:** [docs/TODO.md](docs/TODO.md) (What we are working on NOW)
- **Work History:** [docs/project_log.md](docs/project_log.md) (Check this to avoid repeating work)

**Technical Standards:**

- **Architecture:** [ARCHITECTURE.md](./ARCHITECTURE.md) (Patterns, stack, file organization)
- **Code Style:** [CODE_STANDARDS.md](./CODE_STANDARDS.md) (Naming, formatting, linting, **Markdown Rules: No bold headings/list items**)
- **Security:** [SECURITY.md](./SECURITY.md) (Secrets, auth, dependencies)
- **Testing:** [docs/testing/PREVENTING-REGRESSIONS.md](docs/testing/PREVENTING-REGRESSIONS.md) (CRITICAL: Read before modifying code)
- **Glossary:** [docs/GLOSSARY.md](docs/GLOSSARY.md) (Canonical terms: Build vs Restart vs Directory Scan vs Page Index vs Search Index Rebuild)

**Process:**

- **Setup:** [SETUP.md](./SETUP.md)
- **Contributing:** [CONTRIBUTING.md](./CONTRIBUTING.md) (Workflow, PRs)

## ⚠️ Critical Technical Mandates

1. **TypeScript Migration:** "One File Done Right" strategy. Enable strict mode, fix all lint errors, and ensure tests pass before deleting the `.js` file. Atomic commits per file.
2. **Configuration:** NEVER hardcode. Use `ConfigurationManager.getInstance()`. See [config/app-default-config.json](config/app-default-config.json).
3. **Testing:**
    - Unit: `npm test` (Jest) - Mock file I/O.
    - E2E: Playwright (Chromium).
    - **Requirement:** >80% coverage for managers.
4. **WikiContext:** Always use `WikiContext` for request/user state.
5. **WikiDocument:** Use the DOM-based pipeline for parsing.

## 🚦 Agent Autonomy Matrix

### ✅ Autonomous Tasks

- Refactoring (following `CODE_STANDARDS.md`)
- Bug fixes (non-critical)
- Documentation updates
- Writing/fixing tests
- Explicitly assigned features in `docs/TODO.md`

### 🛑 Require Human Review

- Major architectural changes
- Security policy modifications
- Breaking API changes
- New 3rd party integrations
- Database/Schema changes

## Always use

- server.sh to stop and start server
- src/utils/version.ts to perform SEMVER updates.

## Local Environment

This instance is configured via a gitignored `.env` at the project root:

```
FAST_STORAGE=/Volumes/hd2/jimstest-wiki/data
SLOW_STORAGE=/Volumes/hd2A/jimstest-wiki/data
```

- `FAST_STORAGE` — operational data: sessions, users, logs, config, search index, `page-index.json`
- `SLOW_STORAGE` — bulk content: pages, attachments

`server.sh` sources this file automatically on start. Without it the server falls back to `./data` and shows the install screen. Do not commit `.env`.
