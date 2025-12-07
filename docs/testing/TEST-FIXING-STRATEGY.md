# Test Fixing Strategy

**Status:** 46 failing test suites, 594 failed tests (as of 2025-12-06)

## Current Situation

### Test Suite Summary
- **Total test suites:** 66
- **Passing suites:** 20 (30%)
- **Failing suites:** 46 (70%)
- **Total tests:** 1,589
- **Passing tests:** 994 (63%)
- **Failing tests:** 594 (37%)
- **Skipped tests:** 1

### Common Failure Patterns

#### 1. **Handler Dependency Resolution Errors** (Most Common)
```
HandlerRegistrationError: Failed to register handler DependentHandler:
Handler DependentHandler requires TestHandler handler
```

**Affected Files:**
- `src/parsers/handlers/__tests__/HandlerRegistry.test.js`
- `src/parsers/__tests__/MarkupParser-*.test.js` (multiple files)
- `src/parsers/handlers/__tests__/PluginSyntaxHandler.test.js`
- `src/parsers/dom/handlers/__tests__/DOMLinkHandler.test.js`

**Root Cause:** HandlerRegistry now throws errors immediately when dependencies aren't met, but tests expect lazy validation.

**Fix Strategy:** Modify HandlerRegistry to allow registration with missing dependencies and provide a `validateDependencies()` method for checking.

#### 2. **Module Path Errors**
```
Cannot find module '../src/WikiEngine' from 'src/routes/__tests__/maintenance-mode.test.js'
```

**Affected Files:**
- `src/routes/__tests__/maintenance-mode.test.js` - ✅ FIXED

**Root Cause:** Incorrect relative paths in require statements.

**Fix Strategy:** ✅ Fixed by correcting path from `'../src/WikiEngine'` to `'../../WikiEngine'`

#### 3. **WikiEngine Initialization Failures**
```
TypeError: Cannot read properties of undefined (reading 'info')
at CacheManager.initialize
```

**Affected Files:**
- Multiple test files trying to instantiate WikiEngine
- `src/routes/__tests__/maintenance-mode.test.js`
- `src/__tests__/WikiEngine.test.js`

**Root Cause:** Test environment setup incomplete or configuration issues.

**Fix Strategy:** Improve test fixtures and mocking for WikiEngine initialization.

#### 4. **Jest Worker Exceptions**
```
Jest worker encountered 4 child process exceptions, exceeding retry limit
```

**Affected Files:**
- `src/parsers/__tests__/MarkupParser.test.js`

**Root Cause:** Test file causing worker crashes, possibly due to memory leaks or infinite loops.

**Fix Strategy:** Investigate specific test causing crashes, possibly add `--runInBand` for debugging.

## Prioritized Fixing Strategy

### Phase 1: Quick Wins (Fix Simple Issues First)
**Time:** 30-60 minutes
**Impact:** ~5-10 test suites

1. ✅ **Fix Path Issues**
   - maintenance-mode.test.js - FIXED
   - Check for similar path issues in other files

2. **Fix TypeScript/JS Import Issues**
   - Check for .ts/.js extension mismatches
   - Ensure all imports are correctly resolved

3. **Fix Test Isolation Issues**
   - Tests that fail due to shared state
   - Add proper beforeEach/afterEach cleanup

### Phase 2: Core Infrastructure (Handler Registry)
**Time:** 2-4 hours
**Impact:** ~20-30 test suites

**The Big Fix: HandlerRegistry Dependency Resolution**

This is affecting the majority of failing tests. Options:

**Option A: Fix HandlerRegistry to Match Test Expectations** (Recommended)
- Allow registration with missing dependencies
- Throw only during `validateDependencies()` call
- Update `resolveExecutionOrder()` to handle missing deps gracefully

**Option B: Update Tests to Match Current Behavior**
- Wrap registrations in try/catch
- Pre-register all dependencies before dependents
- Update test expectations

**Recommendation:** Option A - The tests represent the intended behavior (lazy validation)

### Phase 3: WikiEngine Test Fixtures
**Time:** 1-2 hours
**Impact:** ~10-15 test suites

1. Create mock WikiEngine for tests
2. Create test configuration files
3. Add proper setup/teardown helpers

### Phase 4: Individual Test Fixes
**Time:** Ongoing
**Impact:** Remaining failures

Fix remaining tests one by one as needed.

## Implementation Plan

### Immediate Actions (Today)

1. **Document Current State** ✅ (This file)
2. **Fix HandlerRegistry** (Option A)
   - Modify `registerHandler()` to not throw on missing dependencies
   - Store dependency errors for later validation
   - Implement proper `validateDependencies()` method
3. **Run Tests After Fix**
   - Expect ~30 test suites to start passing
   - Document which tests still fail

### Short-term (This Week)

1. **Create Test Helpers**
   - Mock WikiEngine factory
   - Test configuration builder
   - Common setup/teardown utilities

2. **Fix Remaining Path Issues**
   - Search for similar import problems
   - Standardize import paths

3. **Fix WikiEngine Initialization Tests**
   - Improve test environment setup
   - Add proper mocking

### Long-term (Ongoing)

1. **Add to CI/CD**
   - Currently CI will fail due to test failures
   - As tests are fixed, require them to pass in CI

2. **Prevent Regressions**
   - Fixed tests must stay fixed
   - Add to required CI checks gradually

3. **Document Test Patterns**
   - Create testing guide
   - Standard mocking patterns
   - Common pitfalls

## Quick Reference Commands

```bash
# Run all tests
npm test

# Run specific test file
npm test -- src/parsers/handlers/__tests__/HandlerRegistry.test.js

# Run tests matching pattern
npm test -- --testPathPattern="Handler"

# Run with verbose output
npm test -- --verbose

# Run in band (no parallel workers, easier debugging)
npm test -- --runInBand

# Run only failed tests
npm test -- --onlyFailures

# Update snapshots
npm test -- -u

# Watch mode for development
npm run test:watch

# Coverage
npm run test:coverage
```

## Success Metrics

### Current State
- ✅ 20 test suites passing (30%)
- ❌ 46 test suites failing (70%)
- ✅ 994 tests passing (63%)
- ❌ 594 tests failing (37%)

### Phase 1 Goal (Quick Wins)
- ✅ 25-30 test suites passing (40-45%)
- ✅ 1,100+ tests passing (69%+)

### Phase 2 Goal (After HandlerRegistry Fix)
- ✅ 45-50 test suites passing (70-75%)
- ✅ 1,400+ tests passing (88%+)

### Phase 3 Goal (After WikiEngine Fixtures)
- ✅ 55-60 test suites passing (85-90%)
- ✅ 1,500+ tests passing (95%+)

### Final Goal
- ✅ All 66 test suites passing (100%)
- ✅ All 1,589 tests passing (100%)

## Notes

### Why So Many Failures?

These failures were **pre-existing** - not caused by today's work:
- WikiDocument tests added today: ✅ 49/49 passing (100%)
- Automated testing pipeline: ✅ Working correctly
- Smoke tests: ✅ All passing

The failures indicate:
1. Tests haven't been run regularly (no CI enforcement until today)
2. Code changes weren't validated against tests
3. This is exactly why we implemented the automated testing pipeline!

### Moving Forward

**The CI/CD pipeline we implemented today will prevent this in the future.**

Once tests are fixed:
1. CI will enforce test passage
2. Future breaks caught immediately
3. Regression prevention active

This is a **one-time cleanup** to get to a good baseline.

## Quick Decision: What to Fix First?

### If you have 1 hour:
Fix HandlerRegistry (Phase 2) - Biggest impact

### If you have 30 minutes:
Fix remaining path issues (Phase 1) - Quick wins

### If you have 4+ hours:
Complete Phases 1-3 - Get to 90%+ passing

### If you want to move on:
- CI/CD is working (catching failures)
- Smoke tests passing (system works)
- Fix tests gradually as you work on related code
- This is a valid strategy!

---

**Bottom Line:** The test failures are manageable and pre-existing. The automated testing pipeline we built today is working correctly and will prevent future issues. Fixing tests is important but can be done incrementally.
