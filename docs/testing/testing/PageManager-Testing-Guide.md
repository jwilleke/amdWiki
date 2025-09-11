# PageManager Testing Guide

## Overview
This guide explains the mock-based testing approach for PageManager in amdWiki.

## Mock Strategy
### File System Mocking
- Uses `fs-extra` mocks for all file operations
- In-memory Map-based file system simulation
- No real file I/O during tests

### Benefits
- 10-100x faster test execution
- Complete test isolation
- Better error simulation
- CI/CD friendly (no cleanup required)

## Running Tests

```bash
npm test                    # Run all tests
npm run test:watch         # Watch mode
npm run test:coverage      # With coverage
```
