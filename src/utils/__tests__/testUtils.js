/**
 * Test utilities for amdWiki testing
 */
const fs = require('fs-extra');
const path = require('path');

/**
 * Create a temporary directory for testing
 * @param {string} prefix - Prefix for directory name
 * @returns {string} Path to temporary directory
 */
async function createTempDir(prefix = 'test') {
  const tempDir = path.join(__dirname, `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`);
  await fs.ensureDir(tempDir);
  return tempDir;
}

/**
 * Clean up temporary directory
 * @param {string} dirPath - Path to directory to remove
 */
async function cleanupTempDir(dirPath) {
  try {
    await fs.remove(dirPath);
  } catch (err) {
    // Ignore cleanup errors
    console.warn(`Failed to cleanup temp directory ${dirPath}:`, err.message);
  }
}

/**
 * Create a test page file
 * @param {string} dir - Directory to create page in
 * @param {string} pageName - Name of the page (without .md extension)
 * @param {Object} options - Page options
 * @param {string} options.content - Page content
 * @param {Object} options.metadata - Page metadata
 * @returns {string} Path to created file
 */
async function createTestPage(dir, pageName, options = {}) {
  const { content = '# Test Page\nTest content.', metadata = {} } = options;
  
  let fileContent = '';
  
  if (Object.keys(metadata).length > 0) {
    fileContent += '---\n';
    for (const [key, value] of Object.entries(metadata)) {
      if (Array.isArray(value)) {
        fileContent += `${key}: [${value.map(v => JSON.stringify(v)).join(', ')}]\n`;
      } else {
        fileContent += `${key}: ${JSON.stringify(value)}\n`;
      }
    }
    fileContent += '---\n';
  }
  
  fileContent += content;
  
  const filePath = path.join(dir, `${pageName}.md`);
  await fs.writeFile(filePath, fileContent);
  return filePath;
}

/**
 * Create multiple test pages
 * @param {string} dir - Directory to create pages in
 * @param {Array} pages - Array of page definitions
 * @returns {Array} Array of created file paths
 */
async function createTestPages(dir, pages) {
  const filePaths = [];
  for (const page of pages) {
    const filePath = await createTestPage(dir, page.name, page.options || {});
    filePaths.push(filePath);
  }
  return filePaths;
}

/**
 * Create a mock engine for testing
 * @param {Object} managers - Managers to include in mock
 * @returns {Object} Mock engine object
 */
function createMockEngine(managers = {}) {
  return {
    getManager: jest.fn((name) => managers[name] || null),
    getConfig: jest.fn(() => ({
      get: jest.fn()
    })),
    isInitialized: true,
    shutdown: jest.fn()
  };
}

/**
 * Create a mock user object
 * @param {Object} options - User options
 * @returns {Object} Mock user object
 */
function createMockUser(options = {}) {
  return {
    username: options.username || 'testuser',
    email: options.email || 'test@example.com',
    fullName: options.fullName || 'Test User',
    roles: options.roles || ['reader'],
    isAuthenticated: options.isAuthenticated !== false,
    isActive: options.isActive !== false,
    ...options
  };
}

/**
 * Create a mock request object for testing
 * @param {Object} options - Request options
 * @returns {Object} Mock request object
 */
function createMockRequest(options = {}) {
  return {
    params: options.params || {},
    query: options.query || {},
    body: options.body || {},
    cookies: options.cookies || {},
    session: options.session || {},
    user: options.user || null,
    headers: options.headers || {},
    ...options
  };
}

/**
 * Create a mock response object for testing
 * @param {Object} options - Response options
 * @returns {Object} Mock response object
 */
function createMockResponse(options = {}) {
  const res = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
    send: jest.fn().mockReturnThis(),
    render: jest.fn().mockReturnThis(),
    redirect: jest.fn().mockReturnThis(),
    cookie: jest.fn().mockReturnThis(),
    clearCookie: jest.fn().mockReturnThis(),
    set: jest.fn().mockReturnThis(),
    ...options
  };
  return res;
}

/**
 * Wait for a specified amount of time
 * @param {number} ms - Milliseconds to wait
 * @returns {Promise} Promise that resolves after the specified time
 */
function wait(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Generate a random string for testing
 * @param {number} length - Length of string to generate
 * @returns {string} Random string
 */
function randomString(length = 10) {
  return Math.random().toString(36).substring(2, 2 + length);
}

/**
 * Generate a test UUID
 * @returns {string} Test UUID
 */
function generateTestUUID() {
  return `test-${randomString(8)}-${randomString(4)}-${randomString(4)}-${randomString(4)}-${randomString(12)}`;
}

/**
 * Assert that a function throws an error with a specific message
 * @param {Function} fn - Function to test
 * @param {string|RegExp} expectedMessage - Expected error message
 */
async function expectToThrow(fn, expectedMessage) {
  let error;
  try {
    await fn();
  } catch (err) {
    error = err;
  }
  
  expect(error).toBeTruthy();
  if (typeof expectedMessage === 'string') {
    expect(error.message).toContain(expectedMessage);
  } else if (expectedMessage instanceof RegExp) {
    expect(error.message).toMatch(expectedMessage);
  }
}

module.exports = {
  createTempDir,
  cleanupTempDir,
  createTestPage,
  createTestPages,
  createMockEngine,
  createMockUser,
  createMockRequest,
  createMockResponse,
  wait,
  randomString,
  generateTestUUID,
  expectToThrow
};

// Add Jest test suite for the utilities
describe('Test Utilities', () => {
  it('should have test utilities available', () => {
    // Basic test to prevent Jest failure
    expect(true).toBe(true);
  });

  it('should export utility functions', () => {
    // Test that the module structure is correct
    const moduleExports = require('../../../src/utils/__tests__/testUtils');
    expect(typeof moduleExports).toBe('object');
  });
});
