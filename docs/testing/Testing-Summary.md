# Testing Summary

**Last Updated:** 2025-12-12
**Current Version:** 1.5.0

## Current Test Status

| Metric | Value |
|--------|-------|
| Test Suites | 21 failed, 46 passed (67 total) |
| Tests | 277 failed, 1409 passed, 6 skipped (1692 total) |
| **Pass Rate** | **83.3%** |

## Quick Commands

```bash
npm test                    # Run all tests
npm test -- <file>.test.js  # Run specific test file
npm run test:coverage       # Generate coverage report
npm run test:watch          # Watch mode for development
npm run smoke               # Quick 30-second validation
```

## Test Categories

### Passing Test Suites (46)

Core functionality is well-tested:

- **WikiEngine** - Core engine lifecycle
- **UserManager** - Authentication, sessions, permissions
- **PageManager** - Page CRUD operations
- **ACLManager** - Access control lists
- **SearchManager** - Full-text search
- **PolicyManager** - Policy-based access control
- **WikiContext** - Request context management
- **FilterChain** - Content filtering
- **SchemaManager** - Schema validation
- **ExportManager** - Page export
- **Most route handlers** - HTTP endpoints

### Failing Test Suites (21)

Primarily in these areas:

1. **CacheManager** (~200 tests) - Logger mocking issues
2. **MarkupParser tests** (11 files) - Handler configuration
3. **VersioningFileProvider** - Mock method issues
4. **WikiDocument** - DOM/parser edge cases

## Test Infrastructure

### Configuration

- **Framework:** Jest with Node.js environment
- **Setup file:** `jest.setup.js` (global mocks)
- **Timeout:** 120000ms for long-running tests
- **Coverage:** Available via `npm run test:coverage`

### Global Mocks

The following are mocked globally in `jest.setup.js`:

- Logger (`src/utils/logger`)
- File system operations (where needed)
- ConfigurationManager (per-test setup)

## Fix Strategy

We use **Option C: Fix-As-Needed** approach:

1. Fix tests when working on related code
2. Prioritize by impact (security > core > features)
3. Track progress in this document

### Priority Order

1. **CRITICAL** - Security tests (ACLManager, UserManager, PolicyManager) - ✅ Done
2. **HIGH** - Core functionality (WikiEngine, PageManager, SearchManager) - ✅ Done
3. **MEDIUM** - Features (Rendering, Plugins, Routes) - Partial
4. **LOW** - Utilities and edge cases - Deferred

## Recent Progress

| Date | Failing Suites | Passing Tests | Notes |
|------|---------------|---------------|-------|
| 2025-12-12 | 21 | 1453+ | Added WikiRoutes-isRequiredPage (14), RenderingManager link graph tests |
| 2025-12-12 | 21 | 1409 | UserManager tests fixed (30 tests) |
| 2025-12-10 | 22 | 1379 | Multiple route tests fixed |
| 2025-12-07 | 37 | 1221 | SearchManager, ACLManager fixed |

### New Tests for Issue #172 and #174 (2025-12-12)

- **WikiRoutes-isRequiredPage.test.js** - 14 tests for system-category protection
- **RenderingManager.test.js** - Added plural link resolution test for Issue #172
- **FileSystemProvider.test.js** - Installation-aware loading tests (blocked by mock issue)

## Known Issues

### CacheManager Logger Mocking

The CacheManager tests fail due to logger mock setup issues. This is a test infrastructure problem, not a code bug.

**Workaround:** Tests are excluded from CI until fixed.

### FileSystemProvider Global Mock Issue

Tests in `FileSystemProvider.test.js` cannot bypass the global mock in `jest.setup.js`. Using `jest.unmock()` or `jest.requireActual()` returns an empty object because the module's dependencies (BasePageProvider) are also affected by the mock resolution.

**Fix Required:** Add Jest projects configuration to run provider tests without global mocks.

### MarkupParser Handler Configuration

Parser tests expect handlers that may not be registered in test environment.

**Fix:** Register required handlers in test setup or mock them.

## Related Documentation

- [Complete-Testing-Guide.md](./Complete-Testing-Guide.md) - Comprehensive testing guide
- [PREVENTING-REGRESSIONS.md](./PREVENTING-REGRESSIONS.md) - Regression prevention strategy

## Contributing

When fixing tests:

1. Run the specific test file first: `npm test -- <file>.test.js`
2. Check error messages for root cause
3. Add proper mocks (ConfigurationManager, providers, etc.)
4. Verify no regressions: `npm test`
5. Update this summary if significant progress made
