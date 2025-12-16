# Testing Summary

**Last Updated:** 2025-12-16
**Current Version:** 1.5.0

## Current Test Status

### Unit/Integration Tests (Jest)

| Metric | Value |
|--------|-------|
| Test Suites | 19 failed, 50 passed (69 total) |
| Tests | 222 failed, 1492 passed, 6 skipped (1720 total) |
| **Pass Rate** | **86.7%** |

### End-to-End Tests (Playwright)

| Test File | Description |
|-----------|-------------|
| auth.spec.js | Login, logout, session management |
| pages.spec.js | Page viewing, editing, creation |
| search.spec.js | Search functionality |
| admin.spec.js | Admin dashboard access |

## Quick Commands

```bash
# Unit Tests (Jest)
npm test                    # Run all tests
npm test -- <file>.test.js  # Run specific test file
npm run test:coverage       # Generate coverage report
npm run test:watch          # Watch mode for development
npm run smoke               # Quick 30-second validation

# E2E Tests (Playwright)
npm run test:e2e            # Run all E2E tests
npm run test:e2e:ui         # Run with Playwright UI
npm run test:e2e:headed     # Run in headed browser mode
```

## Test Categories

### Passing Test Suites (50)

Core functionality is well-tested:

- **WikiEngine** - Core engine lifecycle
- **UserManager** - Authentication, sessions, permissions
- **PageManager** - Page CRUD operations
- **FileSystemProvider** - File-based page storage (12 tests)
- **ACLManager** - Access control lists
- **SearchManager** - Full-text search
- **PolicyManager** - Policy-based access control
- **WikiContext** - Request context management
- **FilterChain** - Content filtering
- **SchemaManager** - Schema validation
- **ExportManager** - Page export
- **Most route handlers** - HTTP endpoints

### Failing Test Suites (19)

Primarily in these areas:

1. **CacheManager** (~200 tests) - Logger mocking issues
2. **MarkupParser tests** (11 files) - Handler configuration
3. **VersioningFileProvider-Maintenance** - Page index availability issues
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
| 2025-12-14 | 19 | 1492 | Fixed FileSystemProvider tests (12), gray-matter/js-yaml 4.x compatibility |
| 2025-12-13 | 22 | 1413 | Security fixes (js-yaml, cookie), logs path consolidation |
| 2025-12-12 | 21 | 1453+ | Added WikiRoutes-isRequiredPage (14), RenderingManager link graph tests |
| 2025-12-12 | 21 | 1409 | UserManager tests fixed (30 tests) |
| 2025-12-10 | 22 | 1379 | Multiple route tests fixed |
| 2025-12-07 | 37 | 1221 | SearchManager, ACLManager fixed |

### New Tests for Issue #172 and #174 (2025-12-12)

- **WikiRoutes-isRequiredPage.test.js** - 14 tests for system-category protection
- **RenderingManager.test.js** - Added plural link resolution test for Issue #172
- **FileSystemProvider.test.js** - 12 tests for installation-aware loading ✅ Fixed 2025-12-14

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

## E2E Test Infrastructure

### Setup

E2E tests use Playwright with the following configuration:

- **Test Directory:** `tests/e2e/`
- **Config:** `playwright.config.js`
- **Browser:** Chromium (default)
- **Port:** 3099 (test server)

### Test Files

| File | Tests | Description |
|------|-------|-------------|
| `auth.setup.js` | 1 | Authentication setup (saves session state) |
| `auth.spec.js` | 7 | Login form, invalid credentials, session management, logout, protected routes |
| `pages.spec.js` | 12 | Homepage, page navigation, editing, creation, categories |
| `search.spec.js` | 7 | Search interface, text search, special characters, filters |
| `admin.spec.js` | 8 | Admin dashboard access, user management, configuration, security |

### Fixtures

- `fixtures/auth.js` - Authentication helpers
- `fixtures/helpers.js` - Common test utilities

### Running E2E Tests Locally

```bash
# Run all E2E tests (starts server automatically)
npm run test:e2e

# Run with Playwright UI (for debugging)
npm run test:e2e:ui

# Run in headed mode (see browser)
npm run test:e2e:headed

# Run specific test file
npx playwright test auth.spec.js
```

### CI Integration

E2E tests run automatically in GitHub Actions CI pipeline:

1. Installs Playwright browsers
2. Creates test user and directories
3. Runs all E2E tests
4. Uploads test report as artifact

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
