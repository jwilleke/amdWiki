# amdWiki Project Log

AI agent session tracking. See [docs/planning/TODO.md](./docs/planning/TODO.md) for task planning, [CHANGELOG.md](./CHANGELOG.md) for version history.

## Format

```
## yyyy-MM-dd-##
Agent: [Claude/Gemini/Other]
Subject: [Brief description]
- Key Decision: [decision]
- Current Issue: [issue]
- Work Done: [task 1], [task 2]
- Commits: [hash]
- Files Modified: [file1.js, file2.md]
```

---

## 2025-12-02-02

**Agent:** Claude

**Subject:** Docker build automation and configuration implementation

- **Key Decision:** Implement comprehensive Docker build tooling with GitHub Actions CI/CD, local build helper, and enhanced .env configuration
- **Current Issue:** None
- **Work Done:** Added Docker build variables to .env.example (build config, Compose config, runtime config variables), created GitHub Actions workflow for automated multi-platform Docker builds (amd64/arm64) with Trivy vulnerability scanning, created docker/build-image.sh helper script for local builds
- **Commits:** cbc4877
- **Files Modified:** docker/.env.example, .github/workflows/docker-build.yml (new), docker/build-image.sh (new)

---

## 2025-12-02-01

**Agent:** Claude

**Subject:** AGENTS.md implementation and project_log.md creation

- **Key Decision:** Comprehensive AI coordination doc referencing existing docs (DRY), delete CLAUDE.md
- **Current Issue:** None
- **Work Done:** Created project_log.md, rewrote AGENTS.md sections (Overview, Status, Architecture, Standards, Guidelines, Sprint/Focus, Notes, Doc Map), deleted CLAUDE.md, updated copilot-instructions.md
- **Commits:** 4776df3
- **Files Modified:** AGENTS.md, project_log.md, .github/copilot-instructions.md
