# Known Test Issues

**Last Updated:** 2025-12-07
**Test Status:** 42 failing suites, 24 passing suites, 66 total

## Overview

This document tracks known test failures and the strategy for fixing them. Tests are fixed incrementally as related code is modified (Option C approach).

## Test Status Summary

**Current Results:**
- Test Suites: 42 failed, 24 passed, 66 total
- Tests: 670 failed, 1 skipped, 1043 passed, 1714 total
- Coverage: Available via `npm run test:coverage`

**Progress:**
- ✅ Systematic blockers removed (import paths, missing deps)
- ✅ Global test setup implemented (logger mocking, provider mocking)
- ✅ 1043 tests passing (61% pass rate)
- ✅ WikiContext.test.js fixed (high-priority core component)
- ✅ FilterChain.test.js fixed (quick win)
- ✅ SchemaManager.test.js fixed (quick win)
- 🔧 42 test suites with individual issues remaining

## Categories of Failures

### 1. Configuration/Mock Issues (Most Common)

**Pattern:** Tests expect certain mocks or configuration that aren't properly set up

**Example:**
```
TypeError: Cannot read properties of null (reading 'getProperty')
```

**Files Affected:**
- ACLManager.test.js
- WikiEngine.test.js
- PageManager.test.js
- UserManager.test.js

**Fix Strategy:** Add proper mocks for ConfigurationManager, engine dependencies

### 2. Provider/Dependency Loading Issues

**Pattern:** Dynamic requires fail in test environment

**Example:**
```
TypeError: NullCacheProvider is not a constructor
```

**Files Affected:**
- WikiEngine.test.js
- CacheManager-related tests

**Fix Strategy:** Mock providers or use test-specific configurations

### 3. File System/Path Issues

**Pattern:** Tests create/read files that don't exist or use wrong paths

**Files Affected:**
- VersioningFileProvider.test.js
- VersioningMigration.test.js
- PageManager-Storage.test.js

**Fix Strategy:** Ensure proper test fixture setup, use temp directories

### 4. Parser/Handler Configuration

**Pattern:** Parsers/handlers expect specific initialization that tests don't provide

**Files Affected:**
- MarkupParser*.test.js (multiple files)
- WikiTagHandler.test.js
- PluginSyntaxHandler.test.js

**Fix Strategy:** Provide minimal valid configurations in test setup

### 5. Worker Process Issues

**Pattern:** Jest worker crashes due to memory or infinite loops

**Example:**
```
Jest worker encountered 4 child process exceptions, exceeding retry limit
```

**Files Affected:**
- MarkupParser.test.js

**Fix Strategy:** Investigate specific test causing crash, add timeouts

## Specific Test Files

### High Priority (Core Functionality)

These tests cover critical system components:

1. **WikiEngine.test.js** - Core engine initialization
   - Issue: Provider loading in test environment
   - Impact: High - core system test
   - Effort: Medium

2. **PageManager.test.js** - Page storage/retrieval
   - Issue: ConfigurationManager mocking
   - Impact: High - critical functionality
   - Effort: Low

3. **UserManager.test.js** - User authentication
   - Issue: Mock configuration
   - Impact: High - security-critical
   - Effort: Low

### Medium Priority (Features)

4. **MarkupParser*.test.js** - Content parsing
   - Issue: Handler configuration
   - Impact: Medium - rendering functionality
   - Effort: Medium

5. **VersioningFileProvider.test.js** - Version control
   - Issue: File system setup
   - Impact: Medium - versioning feature
   - Effort: Low

### Low Priority (Can Wait)

6. **LinkParser.test.js** - Link parsing
   - Impact: Low - specific feature
   - Effort: Low

7. **FilterChain.test.js** - Content filtering
   - Impact: Low - specific feature
   - Effort: Low

## Fix-As-Needed Strategy (Option C)

**Principle:** Fix tests when working on related code, not all at once

**Workflow:**

1. **When adding a new feature:**
   - Write tests for the new feature first
   - Ensure new tests pass
   - If nearby tests are failing, fix them

2. **When fixing a bug:**
   - Check if related tests exist
   - If tests are failing, fix them
   - Add new tests for the bug scenario

3. **When refactoring:**
   - Update tests to match new structure
   - Fix any tests broken by refactor
   - Improve test coverage if time permits

4. **Weekly maintenance:**
   - Pick 1-2 failing test files
   - Fix them completely
   - Track progress in this document

## Quick Wins

Tests that can be fixed quickly (< 10 minutes each):

- [ ] **policy-system.test.js** - Just needs ConfigurationManager mock
- [ ] **routes.test.js** - Already mostly fixed, minor issues remain
- [x] **SchemaManager.test.js** - ✅ FIXED (rewrote to match actual API)
- [x] **FilterChain.test.js** - ✅ FIXED (adjusted assertions)

## Won't Fix (For Now)

Tests intentionally skipped until related features are stable:

- None currently

## How to Fix a Test

### Step 1: Identify the Root Cause

Run the specific test:
```bash
npm test -- path/to/test.js
```

Read the error message carefully. Common patterns:
- "Cannot read properties of null" → Missing mock
- "is not a constructor" → Module loading issue
- "ENOENT" → File not found
- "Timeout" → Async issue or infinite loop

### Step 2: Add Necessary Mocks

Check if test needs:
- Logger mock (already global in jest.setup.js)
- ConfigurationManager mock
- File system mocks
- Provider mocks

### Step 3: Verify the Fix

```bash
# Run the specific test
npm test -- path/to/test.js

# Run all tests to ensure no regression
npm test

# Check coverage
npm run test:coverage
```

### Step 4: Update This Document

Mark the test as fixed and update the statistics.

## Testing Best Practices

Going forward, new tests should:

1. **Use global mocks** - Logger is already mocked globally
2. **Mock external dependencies** - Don't rely on actual file system, network
3. **Use proper paths** - Use `../` not `../src/` for imports
4. **Provide complete mocks** - If mocking ConfigurationManager, implement all used methods
5. **Clean up after themselves** - Remove temp files, reset state
6. **Be isolated** - Don't depend on other tests running first
7. **Be fast** - Use mocks instead of real operations

## Resources

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [jest.setup.js](../../jest.setup.js) - Global test setup
- [AUTOMATED-TESTING-SETUP.md](./AUTOMATED-TESTING-SETUP.md) - Testing pipeline guide

## Progress Tracking

| Date | Failing Suites | Passing Suites | Passing Tests | Notes |
|------|---------------|----------------|---------------|-------|
| 2025-12-07 | 42 | 24 | 1043 | SchemaManager + FilterChain fixed (3 quick wins total) |
| 2025-12-07 | 44 | 22 | 1032 | WikiContext.test.js fixed (rewrote to match actual API) |
| 2025-12-07 | 45 | 21 | 1020 | Global setup + comprehensive provider mocking |
| 2025-12-06 | 46 | 20 | 993 | Import path fixes |

---

**Goal:** Reduce failing suites to < 10 within 1 month through incremental fixes during normal development.
