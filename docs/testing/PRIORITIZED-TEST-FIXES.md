# Prioritized Test Fixes

**Created:** 2025-12-07
**Status:** Active Work Plan
**Current:** 41 failing suites, 26 passing suites, 545 failed tests, 1171 passed tests

## Overview

This document provides a prioritized action plan for fixing failing test suites, following the methodology in [TEST-TRACKING-BEST-PRACTICES.md](./TEST-TRACKING-BEST-PRACTICES.md).

**Priority Criteria:**
1. **Impact** - How critical is the functionality to core system operation?
2. **Effort** - Estimated time to fix (Low < 30min, Medium < 2hrs, High > 2hrs)
3. **Blockers** - Does it unblock other tests or work?

---

## HIGH PRIORITY - Core System Components

These tests cover critical system infrastructure. **Fix these first.**

### 1. WikiEngine.test.js ⚡ CRITICAL
- **Component:** Core engine orchestrator
- **Failures:** 2/5 tests failing
- **Issue:** `engine.initialized` flag not set to true after initialization
- **Impact:** CRITICAL - Core system initialization
- **Effort:** LOW (< 10 min)
- **Fix:** WikiEngine.initialize() needs to call `super.initialize()` or set `this.initialized = true`
- **Blocker:** Yes - blocks understanding of engine lifecycle
- **Status:** 🔧 Ready to fix

### 2. policy-system.test.js ⚡ CRITICAL
- **Component:** Policy-based access control (security)
- **Failures:** 11/11 tests failing
- **Issue:** SearchManager mock missing `buildIndex()` and `getDocumentCount()` methods
- **Impact:** CRITICAL - Security/authorization system
- **Effort:** LOW (< 10 min) - **ALREADY FIXED in jest.setup.js**
- **Fix:** SearchManager mock updated with missing methods
- **Status:** ✅ FIXED - Needs verification

### 3. ACLManager.test.js ⚡ CRITICAL
- **Component:** Access Control Lists (security)
- **Failures:** Unknown count
- **Issue:** Likely configuration/mock issues
- **Impact:** CRITICAL - Security/authorization
- **Effort:** MEDIUM (30-60 min)
- **Fix:** Add proper ConfigurationManager mocks, verify PolicyEvaluator integration
- **Status:** 🔧 Pending

### 4. UserManager.test.js
- **Component:** User authentication/authorization
- **Failures:** Unknown count (may be duplicate in list)
- **Issue:** Check if this is the same as already-fixed UserManager.test.js
- **Impact:** HIGH - Security critical
- **Effort:** VERIFY FIRST
- **Status:** ⚠️ Verify if already fixed (project_log shows it was fixed)

### 5. PageManager-Storage.test.js
- **Component:** Page storage and retrieval
- **Failures:** Unknown count
- **Issue:** File system/path issues, provider mocking
- **Impact:** HIGH - Core functionality
- **Effort:** MEDIUM (30-60 min)
- **Fix:** Ensure proper test fixture setup, provider mocks
- **Status:** 🔧 Pending

### 6. SearchManager.test.js
- **Component:** Full-text search
- **Failures:** Unknown count
- **Issue:** Provider mock issues (likely buildIndex/getDocumentCount)
- **Impact:** HIGH - Core feature
- **Effort:** LOW (< 15 min) - **Should be fixed by jest.setup.js update**
- **Status:** ✅ Likely fixed - Needs verification

### 7. RenderingManager.test.js
- **Component:** Content rendering
- **Failures:** Unknown count
- **Issue:** MarkupParser dependency issues
- **Impact:** HIGH - Core feature
- **Effort:** MEDIUM (30-60 min)
- **Status:** 🔧 Pending

---

## MEDIUM PRIORITY - Feature Components

These tests cover important features but not core infrastructure.

### 8. PluginManager.test.js + PluginManager.registerPlugins.test.js
- **Component:** Plugin system
- **Failures:** Unknown count (2 files)
- **Issue:** Handler configuration, plugin loading
- **Impact:** MEDIUM - Plugin functionality
- **Effort:** MEDIUM (1-2 hrs for both)
- **Status:** 🔧 Pending

### 9. ExportManager.test.js
- **Component:** Page export functionality
- **Failures:** Unknown count
- **Issue:** Unknown
- **Impact:** MEDIUM - Export feature
- **Effort:** MEDIUM (30-60 min)
- **Status:** 🔧 Pending

### 10. Routes Tests (3 files)
- **Files:**
  - routes.test.js
  - maintenance-mode.test.js
  - WikiRoutes.attachments.test.js
  - WikiRoutes.schema.test.js
- **Component:** HTTP route handlers
- **Failures:** Unknown count
- **Issue:** Import paths (some already fixed), mock issues
- **Impact:** MEDIUM - API endpoints
- **Effort:** LOW-MEDIUM (15-30 min per file)
- **Status:** 🔧 Some fixes applied, verify and complete

### 11. MarkupParser Tests (11 files) 📦 BULK WORK
- **Files:**
  - MarkupParser.test.js
  - MarkupParser-Comprehensive.test.js
  - MarkupParser-Config.test.js
  - MarkupParser-DOM-Integration.test.js
  - MarkupParser-DOMNodeCreation.test.js
  - MarkupParser-EndToEnd.test.js
  - MarkupParser-Extraction.test.js
  - MarkupParser-Integration.test.js
  - MarkupParser-MergePipeline.test.js
  - MarkupParser-ModularConfig.test.js
  - MarkupParser-Performance.test.js
- **Component:** Wiki markup parsing
- **Failures:** Massive - most handler-related tests
- **Issue:** Missing handlers (InterWikiLinkHandler, WikiStyleHandler, etc.), handler configuration
- **Impact:** MEDIUM - Rendering functionality
- **Effort:** HIGH (4-8 hrs total) - **FIX INCREMENTALLY**
- **Strategy:** Fix one at a time as related code is modified
- **Status:** 🔧 Deferred - Fix during markup/rendering work

### 12. Parser Handler Tests (5 files)
- **Files:**
  - BaseSyntaxHandler.test.js
  - HandlerRegistry.test.js
  - PluginSyntaxHandler.test.js
  - WikiTagHandler.test.js
  - DOMLinkHandler.test.js
  - DOMPluginHandler.test.js
  - DOMVariableHandler.test.js
- **Component:** Parser handler infrastructure
- **Failures:** Handler dependency issues
- **Impact:** MEDIUM - Rendering infrastructure
- **Effort:** MEDIUM (2-3 hrs total)
- **Status:** 🔧 Pending - depends on MarkupParser fixes

### 13. LinkParser.test.js
- **Component:** Link parsing
- **Failures:** Unknown count
- **Issue:** Handler configuration
- **Impact:** MEDIUM - Link functionality
- **Effort:** LOW (15-30 min)
- **Status:** 🔧 Pending

---

## LOW PRIORITY - Specialized Features

These tests cover edge features that can wait.

### 14. VersioningFileProvider Tests (2 files)
- **Files:**
  - VersioningFileProvider.test.js
  - VersioningFileProvider-Maintenance.test.js
- **Component:** Page versioning system
- **Failures:** Many - provider method mocking issues
- **Issue:** Mock provider missing methods (getPageVersion, _resolveIdentifier, page index)
- **Impact:** LOW - Versioning is optional feature
- **Effort:** HIGH (2-4 hrs) - Complex provider mocking
- **Status:** ⏸️ Deferred - Fix when working on versioning

### 15. Versioning Utility Tests (3 files)
- **Files:**
  - DeltaStorage.test.js
  - VersionCompression.test.js
  - VersioningMigration.test.js
- **Component:** Versioning utilities
- **Failures:** Provider-related
- **Impact:** LOW - Versioning utilities
- **Effort:** MEDIUM (1-2 hrs)
- **Status:** ⏸️ Deferred

### 16. Plugin Tests (2 files)
- **Files:**
  - AllPlugins.test.js
  - SessionsPlugin.test.js
- **Component:** Individual plugins
- **Failures:** Plugin initialization
- **Impact:** LOW - Specific plugin features
- **Effort:** LOW-MEDIUM (30-60 min)
- **Status:** 🔧 Pending

---

## Quick Wins 🎯

Tests that can be fixed in < 15 minutes with high impact:

### Verified Quick Wins

1. **✅ SearchManager mock (jest.setup.js)** - COMPLETED
   - Added `buildIndex()` and `getDocumentCount()` methods
   - Should fix: policy-system.test.js, SearchManager.test.js
   - Time: 5 minutes

2. **WikiEngine.test.js** - READY
   - Add `this.initialized = true` to WikiEngine.initialize()
   - Time: 5 minutes
   - Impact: Core system test

3. **routes.test.js** - PARTIALLY FIXED
   - Import path fixes already applied
   - Verify and complete any remaining issues
   - Time: 10 minutes

### Potential Quick Wins (Need Investigation)

4. **UserManager.test.js** - VERIFY
   - Check if this is duplicate of already-fixed test
   - Time: 5 minutes verification

5. **maintenance-mode.test.js** - CHECK
   - Import path may already be fixed
   - Time: 10 minutes

---

## Recommended Fix Order

### Week 1 - Core Infrastructure (Target: 8-10 fixed suites)

**Day 1:**
1. ✅ Fix WikiEngine.test.js (5 min)
2. ✅ Verify policy-system.test.js fix (5 min)
3. ✅ Verify SearchManager.test.js fix (5 min)
4. Fix ACLManager.test.js (30-60 min)

**Day 2:**
5. Verify/fix UserManager.test.js (15 min)
6. Fix PageManager-Storage.test.js (45 min)
7. Fix RenderingManager.test.js (60 min)

**Day 3:**
8. Fix routes.test.js (15 min)
9. Fix maintenance-mode.test.js (15 min)
10. Fix WikiRoutes.attachments.test.js (30 min)
11. Fix WikiRoutes.schema.test.js (30 min)

### Week 2 - Feature Components (Target: 5-7 fixed suites)

12. Fix PluginManager tests (2 hrs)
13. Fix ExportManager.test.js (1 hr)
14. Fix LinkParser.test.js (30 min)
15. Fix AllPlugins.test.js (30 min)
16. Fix SessionsPlugin.test.js (30 min)

### Week 3+ - Parser Tests (Incremental, as needed)

- Fix MarkupParser tests incrementally during markup/rendering work
- Fix Handler tests as related handlers are updated
- Defer Versioning tests until versioning feature work

---

## Success Metrics

**Current State:**
- Test Suites: 41 failed, 26 passed (61% failure rate)
- Individual Tests: 545 failed, 1171 passed (32% failure rate)

**Week 1 Target:**
- Test Suites: < 33 failed, > 34 passed (< 50% failure rate)
- Individual Tests: < 450 failed, > 1250 passed (< 27% failure rate)

**Week 2 Target:**
- Test Suites: < 26 failed, > 41 passed (< 39% failure rate)
- Individual Tests: < 350 failed, > 1350 passed (< 21% failure rate)

**Month 1 Goal:**
- Test Suites: < 10 failed, > 57 passed (< 15% failure rate)
- Individual Tests: < 200 failed, > 1500 passed (< 12% failure rate)

---

## Tracking Progress

Update [KNOWN-TEST-ISSUES.md](./KNOWN-TEST-ISSUES.md) after each fix session:

```markdown
| Date | Failing Suites | Passing Suites | Passing Tests | Notes |
|------|---------------|----------------|---------------|-------|
| 2025-12-07 | 41 | 26 | 1171 | Created prioritized fix plan |
```

---

## Notes

- Follow TEST-TRACKING-BEST-PRACTICES.md for documentation
- Update project_log.md after each session
- Mark quick wins with ✅ as completed
- Add ⏸️ to deferred items
- Use 🔧 for pending work
- Use ⚡ for critical/blocker items

**Last Updated:** 2025-12-07
**Next Review:** After Week 1 fixes completed
