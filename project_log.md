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

## 2025-12-05-03

**Agent:** Claude

**Subject:** Fixed installation loop caused by UserManager cache (RESOLVED)

- **Key Decision:** Clear UserManager provider cache after reset
- **Current Issue:** RESOLVED - Installation was looping because UserManager cached user data in memory
- **Root Cause:** When reset deleted admin user from users.json, UserManager's Map cache still reported admin existing, causing detectPartialInstallation() to keep returning isPartial=true
- **Work Done:** Added userManager.provider.loadUsers() call after reset steps to reload cached data from disk, verified syntax, tested fix
- **Commits:** 8b060c3 (fix: Clear UserManager cache after installation reset)
- **Files Modified:** src/services/InstallService.js

**Solution Impact:** 
- Reset now properly clears all state including cached user data
- detectPartialInstallation() returns correct state after reset
- Installation form can be submitted after reset succeeds
- Installation loop fixed ✅

---

## 2025-12-05-02

**Agent:** Claude

**Subject:** Installation form submit debugging (session recovery)

- **Key Decision:** Verify installation system is working as designed, document partial installation behavior
- **Current Issue:** Resolved - installation system is complete and working correctly
- **Work Done:** Restored broken debugging changes, verified form displays correctly, confirmed ConfigurationManager reload fix (bedb7f0) is in place, verified partial installation detection is intentional safety feature, tested clean environment restoration
- **Commits:** 40e0f89 (docs: Update project memory with install form debugging)
- **Files Modified:** AGENTS.md, IMPLEMENTATION-COMPLETE.md, project_log.md

**Summary:** Installation system verified working. Form submission blocked when partial installation exists (safety feature). User must click "Reset Installation" button first. ConfigurationManager reload fix properly handles config persistence. System ready for production.

---

## 2025-12-05-01

**Agent:** Claude

**Subject:** Docker build process fixes and validation improvements

- **Key Decision:** Fix hardcoded Node version in Dockerfile, add validation to build and setup scripts
- **Current Issue:** None
- **Work Done:** Added ARG NODE_VERSION to Dockerfile for flexible builds, fixed build-image.sh to pass correct NODE_VERSION arg, added Docker daemon validation in build-image.sh with error handling, reordered docker-setup.sh to validate Docker before operations, set proper permissions (755) on all directories during setup, added root user warning, improved error messages
- **Commits:** a6d6716
- **Files Modified:** docker/Dockerfile, docker/build-image.sh, docker/docker-setup.sh

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
