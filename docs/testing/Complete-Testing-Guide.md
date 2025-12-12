# Complete Testing Guide

**Last Updated:** 2025-12-12
**Version:** 1.5.0

This guide consolidates all testing documentation for amdWiki into a single comprehensive reference.

## Table of Contents

1. [Quick Start](#quick-start)
2. [Test Framework](#test-framework)
3. [Running Tests](#running-tests)
4. [Writing Tests](#writing-tests)
5. [Mocking Patterns](#mocking-patterns)
6. [Test Categories](#test-categories)
7. [Debugging Tests](#debugging-tests)
8. [CI/CD Integration](#cicd-integration)
9. [Manual QA Testing](#manual-qa-testing)
10. [Best Practices](#best-practices)

---

## Quick Start

```bash
# Install dependencies
npm install

# Run all tests
npm test

# Run specific test file
npm test -- src/managers/__tests__/UserManager.test.js

# Run tests matching pattern
npm test -- --testPathPattern="Manager"

# Watch mode (re-runs on file changes)
npm run test:watch

# Generate coverage report
npm run test:coverage

# Quick smoke test (30 seconds)
npm run smoke
```

---

## Test Framework

### Stack

- **Jest** - Test runner and assertion library
- **Supertest** - HTTP endpoint testing
- **Mock functions** - Jest built-in mocking

### Configuration

**package.json scripts:**

```json
{
  "test": "NODE_ENV=test jest",
  "test:watch": "NODE_ENV=test jest --watch",
  "test:coverage": "NODE_ENV=test jest --coverage",
  "test:changed": "NODE_ENV=test jest --changedSince=HEAD --bail",
  "smoke": "./scripts/smoke-test.sh"
}
```

**Jest configuration** (in package.json):

```json
{
  "jest": {
    "testEnvironment": "node",
    "testMatch": ["**/__tests__/**/*.js", "**/*.test.js"],
    "setupFilesAfterEnv": ["./jest.setup.js"],
    "testTimeout": 120000
  }
}
```

### Directory Structure

```
src/
├── managers/
│   └── __tests__/           # Manager unit tests
├── providers/
│   └── __tests__/           # Provider tests
├── routes/
│   └── __tests__/           # Route/API tests
├── parsers/
│   └── __tests__/           # Parser tests
├── utils/
│   └── __tests__/           # Utility tests
└── __tests__/               # Integration tests
```

---

## Running Tests

### All Tests

```bash
npm test
```

### Specific Test File

```bash
npm test -- src/managers/__tests__/UserManager.test.js
```

### Tests Matching Pattern

```bash
npm test -- --testPathPattern="Manager"
npm test -- --testNamePattern="should authenticate"
```

### Watch Mode

```bash
npm run test:watch
```

### With Coverage

```bash
npm run test:coverage
# Coverage report generated in ./coverage/
```

### Changed Files Only

```bash
npm run test:changed
```

### Debug Mode

```bash
npm test -- --runInBand --verbose
```

---

## Writing Tests

### Basic Test Structure

```javascript
const { describe, test, expect, beforeEach } = require('@jest/globals');

describe('ComponentName', () => {
  let component;

  beforeEach(() => {
    // Setup before each test
    component = new Component();
  });

  describe('methodName', () => {
    test('should do expected behavior', () => {
      // Arrange
      const input = 'test';

      // Act
      const result = component.method(input);

      // Assert
      expect(result).toBe('expected');
    });

    test('should handle edge case', () => {
      expect(() => component.method(null)).toThrow();
    });
  });
});
```

### Async Tests

```javascript
test('should fetch data asynchronously', async () => {
  const result = await component.fetchData();
  expect(result).toBeDefined();
});
```

### Testing Managers

Managers require engine and ConfigurationManager mocks:

```javascript
const UserManager = require('../managers/UserManager');

describe('UserManager', () => {
  let userManager;
  let mockEngine;
  let mockConfigManager;

  beforeEach(() => {
    mockConfigManager = {
      getProperty: jest.fn((key, defaultValue) => {
        const config = {
          'amdwiki.user.provider': 'fileuserprovider',
          'amdwiki.user.security.passwordsalt': 'test-salt'
        };
        return config[key] !== undefined ? config[key] : defaultValue;
      })
    };

    mockEngine = {
      getManager: jest.fn((name) => {
        if (name === 'ConfigurationManager') return mockConfigManager;
        return null;
      })
    };

    userManager = new UserManager(mockEngine);
  });

  test('should initialize', async () => {
    await userManager.initialize();
    expect(userManager.provider).toBeDefined();
  });
});
```

### Testing Routes

```javascript
const request = require('supertest');
const express = require('express');

describe('WikiRoutes', () => {
  let app;

  beforeEach(() => {
    app = express();
    // Setup routes and middleware
  });

  test('GET /wiki/:page returns page content', async () => {
    const response = await request(app)
      .get('/wiki/TestPage')
      .expect(200);

    expect(response.text).toContain('TestPage');
  });
});
```

---

## Mocking Patterns

### Mock Logger (Global)

Already configured in `jest.setup.js`:

```javascript
jest.mock('./src/utils/logger', () => ({
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
  debug: jest.fn()
}));
```

### Mock ConfigurationManager

```javascript
const mockConfigManager = {
  getProperty: jest.fn((key, defaultValue) => defaultValue),
  setProperty: jest.fn(),
  getAllProperties: jest.fn(() => ({}))
};
```

### Mock Provider

```javascript
jest.mock('../providers/FileUserProvider', () => {
  return jest.fn().mockImplementation(() => ({
    initialize: jest.fn().mockResolvedValue(undefined),
    getProviderInfo: jest.fn().mockReturnValue({
      name: 'FileUserProvider',
      version: '1.0.0'
    }),
    getAllUsers: jest.fn().mockResolvedValue(new Map()),
    getUser: jest.fn().mockResolvedValue(null),
    createUser: jest.fn().mockResolvedValue(undefined),
    updateUser: jest.fn().mockResolvedValue(undefined),
    deleteUser: jest.fn().mockResolvedValue(undefined)
  }));
});
```

### Mock File System

```javascript
jest.mock('fs', () => ({
  promises: {
    readFile: jest.fn().mockResolvedValue('{}'),
    writeFile: jest.fn().mockResolvedValue(undefined),
    mkdir: jest.fn().mockResolvedValue(undefined),
    access: jest.fn().mockResolvedValue(undefined)
  }
}));
```

### Mock WikiEngine

```javascript
const mockEngine = {
  getManager: jest.fn((name) => {
    const managers = {
      'ConfigurationManager': mockConfigManager,
      'PageManager': mockPageManager,
      'UserManager': mockUserManager
    };
    return managers[name] || null;
  }),
  initialize: jest.fn().mockResolvedValue(undefined),
  shutdown: jest.fn().mockResolvedValue(undefined)
};
```

---

## Test Categories

### Unit Tests

Test individual functions/methods in isolation:

```javascript
// src/utils/__tests__/SecurityUtils.test.js
describe('SecurityUtils', () => {
  test('hashPassword creates consistent hash', () => {
    const hash1 = SecurityUtils.hashPassword('test', 'salt');
    const hash2 = SecurityUtils.hashPassword('test', 'salt');
    expect(hash1).toBe(hash2);
  });
});
```

### Integration Tests

Test multiple components working together:

```javascript
// src/__tests__/WikiEngine.integration.test.js
describe('WikiEngine Integration', () => {
  test('managers communicate correctly', async () => {
    const engine = new WikiEngine();
    await engine.initialize();

    const pageManager = engine.getManager('PageManager');
    const searchManager = engine.getManager('SearchManager');

    await pageManager.savePage('Test', 'content');
    const results = await searchManager.search('content');

    expect(results.length).toBeGreaterThan(0);
  });
});
```

### Route/API Tests

Test HTTP endpoints:

```javascript
describe('API Routes', () => {
  test('POST /api/page creates page', async () => {
    const response = await request(app)
      .post('/api/page')
      .send({ name: 'TestPage', content: 'Hello' })
      .expect(201);

    expect(response.body.success).toBe(true);
  });
});
```

---

## Debugging Tests

### Verbose Output

```bash
npm test -- --verbose
```

### Run Single Test

```bash
npm test -- --testNamePattern="should authenticate user"
```

### Run In Band (No Parallel)

```bash
npm test -- --runInBand
```

### Debug with Node Inspector

```bash
node --inspect-brk node_modules/.bin/jest --runInBand <test-file>
```

### Check for Memory Leaks

```bash
npm test -- --detectLeaks
```

### Clear Cache

```bash
npm test -- --clearCache
```

---

## CI/CD Integration

### GitHub Actions

`.github/workflows/ci.yml`:

```yaml
name: CI

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        node-version: [18.x, 20.x]

    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: ${{ matrix.node-version }}
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run tests
        run: npm test

      - name: Run smoke tests
        run: npm run smoke
```

### Pre-Commit Hooks

With Husky:

```bash
npm install --save-dev husky
npx husky install
npx husky add .husky/pre-commit "npm run test:changed"
```

---

## Manual QA Testing

### Test Environment Setup

1. Start server: `npm start` or `./server.sh start`
2. Open browser to `http://localhost:3000`
3. Open browser developer console
4. Monitor server logs: `pm2 logs`

### Core Test Scenarios

#### Page Operations

- [ ] Create new page
- [ ] Edit existing page
- [ ] Delete page
- [ ] View page history
- [ ] Restore previous version

#### User Operations

- [ ] Login with valid credentials
- [ ] Login with invalid credentials
- [ ] Logout
- [ ] View user profile
- [ ] Change password

#### Search

- [ ] Search for existing content
- [ ] Search with no results
- [ ] Search with special characters

#### Rendering

- [ ] Markdown renders correctly
- [ ] JSPWiki variables expand (`[{$username}]`)
- [ ] Plugins execute (`[{TableOfContents}]`)
- [ ] Wiki links work (`[PageName]`)
- [ ] Code blocks preserve syntax

### Performance Checks

- [ ] Page load < 200ms
- [ ] Search results < 500ms
- [ ] No memory leaks (monitor over time)

---

## Best Practices

### DO

- **Write tests first** (TDD) for new features
- **Use descriptive test names** that explain expected behavior
- **Mock external dependencies** (file system, network, database)
- **Clean up after tests** (reset state, remove temp files)
- **Test edge cases** (null, empty, invalid input)
- **Keep tests fast** (< 100ms per test ideally)
- **Use `beforeEach`** for common setup
- **Test both success and failure cases**

### DON'T

- **Don't test implementation details** - test behavior
- **Don't share state between tests** - each test should be isolated
- **Don't use real file system** in unit tests - mock it
- **Don't skip tests** without good reason and TODO
- **Don't write tests that depend on order** - they should run in any order
- **Don't hardcode paths** - use `path.join()` and `__dirname`

### Test Naming Convention

```javascript
// Good: Describes behavior
test('should return null when user does not exist', () => {});
test('should throw error when password is empty', () => {});

// Bad: Vague
test('works', () => {});
test('test1', () => {});
```

### Assertion Guidelines

```javascript
// Be specific
expect(result).toBe('exact value');          // Exact match
expect(result).toEqual({ key: 'value' });    // Deep equality
expect(result).toContain('substring');        // Contains
expect(result).toHaveLength(3);               // Array/string length
expect(result).toBeDefined();                 // Not undefined
expect(result).toBeNull();                    // Is null
expect(fn).toThrow('error message');          // Throws error
```

---

## Troubleshooting

### Common Issues

#### "Cannot find module"

Check import paths - use relative paths from test file location.

#### "Timeout exceeded"

- Increase timeout: `jest.setTimeout(30000)`
- Check for unresolved promises
- Check for infinite loops

#### "Jest worker crashed"

- Run with `--runInBand` to debug
- Check for memory leaks
- Reduce parallel workers: `--maxWorkers=2`

#### Mock not working

- Ensure mock is defined before import
- Use `jest.mock()` at top of file
- Check mock path matches actual module path

---

## Resources

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [Supertest Documentation](https://github.com/ladjs/supertest)
- [Testing Best Practices](https://github.com/goldbergyoni/javascript-testing-best-practices)

---

## Related Documentation

- [Testing-Summary.md](./Testing-Summary.md) - Current test status
- [PREVENTING-REGRESSIONS.md](./PREVENTING-REGRESSIONS.md) - Regression prevention strategy
