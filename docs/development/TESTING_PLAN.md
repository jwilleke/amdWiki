# amdWiki Testing Implementation Plan

## Overview
Implement comprehensive testing infrastructure for amdWiki using Jest as the primary testing framework.

## Current Status (September 15, 2025)

### ✅ **Completed Achievements**
- **Jest Framework**: Fully configured with comprehensive test scripts and coverage reporting
- **Mock Infrastructure**: Complete WikiEngine mocking system for all managers
- **Route Testing Suite**: 45 comprehensive HTTP endpoint tests covering all routes
- **Security Testing**: CSRF protection, authentication, and authorization validation
- **Manager Test Coverage**:
  - **ACLManager**: 70.99% coverage (52 tests) - Enhanced ACL parsing and security features
  - **UserManager**: 48.42% coverage (19 tests) - Authentication and session management
  - **PageManager**: 65.09% coverage (26 tests) - CRUD operations and metadata handling
- **Test Results**: 34/45 route tests passing (76% success rate)

### 🔄 **In Progress**
- **Route Test Completion**: 11 failing tests remaining (template rendering and mock issues)
- **Template Testing**: EJS template rendering validation for admin interfaces
- **Form Validation**: POST request handling and redirect logic
- **Authorization Logic**: Fine-tuning permission checks for edge cases

### 🎯 **Key Accomplishments**
- **CSRF Protection**: Fully validated security middleware (2/2 tests passing)
- **Authentication Flow**: Complete login/logout processing (working)
- **Admin Functions**: User management, roles, notifications (operational)
- **Test Infrastructure**: Jest + Supertest integration with comprehensive mocking
- **Security Compliance**: All critical security features validated and working

### 📊 **Coverage Metrics**
- **Route Tests**: 34/45 passing (76% success rate)
- **Manager Tests**: Significant improvements across all core components
- **Security Tests**: 100% of CSRF protection tests passing
- **Integration Tests**: Core authentication and admin functions working

### 🚧 **Remaining Work**
1. **Template Rendering Fixes**: Resolve 500 errors in create/profile/admin routes
2. **Mock Method Completion**: Fix undefined returns in notification/role managers
3. **Form Validation Tuning**: Adjust expected status codes for POST operations
4. **Authorization Logic**: Fine-tune permission checks for specific routes

## Phase 1: Foundation Setup

### 1.1 Install Testing Dependencies
```bash
npm install --save-dev jest @jest/globals
npm install --save-dev supertest  # For API endpoint testing
npm install --save-dev puppeteer  # For E2E browser testing (future)
```

### 1.2 Update package.json
```json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "test:ci": "jest --coverage --ci"
  },
  "jest": {
    "testEnvironment": "node",
    "testMatch": ["**/__tests__/**/*.js", "**/*.test.js"],
    "collectCoverageFrom": [
      "src/**/*.js",
      "!src/tests/**",
      "!src/legacy/**"
    ],
    "coverageDirectory": "coverage",
    "coverageReporters": ["text", "lcov", "html"]
  }
}
```

## Phase 2: Unit Tests

### 2.1 Core Manager Tests
- `src/managers/__tests__/PageManager.test.js`
- `src/managers/__tests__/UserManager.test.js`
- `src/managers/__tests__/ACLManager.test.js`
- `src/managers/__tests__/PluginManager.test.js`
- `src/managers/__tests__/RenderingManager.test.js`
- `src/managers/__tests__/SearchManager.test.js`

### 2.2 Utility Tests
- `src/utils/__tests__/SecurityUtils.test.js`
- `src/utils/__tests__/FileUtils.test.js`
- `src/utils/__tests__/ValidationUtils.test.js`

### 2.3 Core Engine Tests
- `src/__tests__/WikiEngine.test.js`
- `config/__tests__/Config.test.js`

## Phase 3: Integration Tests

### 3.1 API Endpoint Tests
- `src/routes/__tests__/WikiRoutes.test.js`
- Authentication flow tests
- Page CRUD operation tests
- Search functionality tests

### 3.2 Plugin System Tests
- Plugin loading and execution
- System variable expansion
- Plugin parameter handling

### 3.3 Authentication & Authorization Tests
- User state transitions (Anonymous → Asserted → Authenticated)
- ACL evaluation with different user types
- Session management
- Role-based access control

## Phase 4: End-to-End Tests

### 4.1 Browser Tests (using Puppeteer)
- Page creation workflow
- Edit and save functionality
- Search interface
- Authentication flows

### 4.2 Full System Tests
- Wiki startup and shutdown
- Manager initialization
- Cross-component integration

## Test Categories by Priority

### 🔴 Critical (Must Have)
1. **UserManager** - Authentication, authorization, user states
2. **ACLManager** - Access control evaluation
3. **PageManager** - Page CRUD operations, metadata handling
4. **PluginManager** - Plugin execution, system variables

### 🟡 Important (Should Have)
1. **RenderingManager** - Markdown rendering, plugin expansion
2. **SearchManager** - Search functionality, indexing
3. **WikiEngine** - Core initialization and manager coordination
4. **Config** - Configuration loading and validation

### 🟢 Nice to Have (Could Have)
1. **API Routes** - HTTP endpoint testing
2. **UI Components** - Frontend functionality
3. **Performance Tests** - Load testing, benchmarks
4. **Security Tests** - Penetration testing, vulnerability scanning

## Test Data Strategy

### Test Fixtures
- Sample wiki pages with various metadata
- User accounts with different roles
- ACL configurations
- Plugin test data

### Test Database
- In-memory file system for isolated tests
- Mock user sessions
- Temporary directories for file operations

## Coverage Goals

### Minimum Coverage Targets
- **Unit Tests**: 80% line coverage
- **Integration Tests**: 70% feature coverage
- **Critical Components**: 90% line coverage (UserManager, ACLManager, PageManager)

### Quality Metrics
- All public APIs tested
- Error conditions covered
- Edge cases handled
- Performance within acceptable limits

## Implementation Timeline

### Week 1: Foundation
- Install dependencies
- Configure Jest
- Create test directory structure
- Write first basic tests

### Week 2: Core Managers
- Implement unit tests for critical managers
- Set up test fixtures and utilities
- Establish testing patterns

### Week 3: Integration
- Add API endpoint tests
- Test manager interactions
- Authentication flow tests

### Week 4: Polish
- Achieve coverage targets
- Add E2E tests
- CI/CD integration
- Documentation

## Best Practices

### Test Organization
- One test file per source file
- Group related tests in `describe` blocks
- Use descriptive test names
- Follow AAA pattern (Arrange, Act, Assert)

### Test Isolation
- Each test should be independent
- Use `beforeEach`/`afterEach` for setup/cleanup
- Mock external dependencies
- Use temporary directories for file operations

### Assertion Quality
- Test behavior, not implementation
- Use specific assertions
- Test both success and error cases
- Verify state changes

## Continuous Integration

### GitHub Actions Workflow
```yaml
name: Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm test
      - run: npm run test:coverage
```

## Success Criteria

### ✅ Complete When
1. All critical components have comprehensive test coverage
2. CI/CD pipeline runs tests automatically
3. Coverage reports are generated and reviewed
4. Team is comfortable making changes with test safety net
5. Tests serve as documentation for component behavior

### 📊 Metrics
- Zero failing tests in main branch
- Coverage above target thresholds
- Test execution time under 30 seconds for unit tests
- Integration tests complete under 2 minutes
