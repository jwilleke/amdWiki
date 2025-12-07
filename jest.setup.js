/**
 * Jest Global Setup
 *
 * Common mocks and configuration applied to all test suites.
 * Prevents repetitive mocking in individual test files.
 *
 * This setup file is automatically loaded before all tests via jest.config.js
 */

// Mock the logger globally to prevent console spam and initialization errors
jest.mock('./src/utils/logger', () => {
  const mockLogger = {
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
    child: jest.fn(() => ({
      info: jest.fn(),
      warn: jest.fn(),
      error: jest.fn(),
      debug: jest.fn()
    }))
  };
  return mockLogger;
});

// Suppress console output during tests unless explicitly needed
global.console = {
  ...console,
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn()
};

// Set test environment variables
process.env.NODE_ENV = 'test';
process.env.LOG_LEVEL = 'error';
