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
  // Export both default and named exports
  (mockLogger as any).default = mockLogger;
  (mockLogger as any).reconfigureLogger = jest.fn(() => mockLogger);
  (mockLogger as any).createLoggerWithConfig = jest.fn(() => mockLogger);
  return mockLogger;
});

// Mock all providers to avoid logger dependency issues in tests
// The provider pattern allows swapping implementations (filesystem/database/cloud)
// For tests, we use lightweight mock providers that don't touch the filesystem

// Base mock provider factory
function createMockProvider(name: string, extraMethods: Record<string, unknown> = {}) {
  class MockProvider {
    engine: unknown;
    initialized: boolean;
    constructor(engine: unknown) {
      this.engine = engine;
      this.initialized = false;
      Object.assign(this, extraMethods);
    }
    async initialize() { this.initialized = true; }
    async isHealthy() { return true; }
    async close() { this.initialized = false; }
    async shutdown() { this.initialized = false; }
    getProviderInfo() {
      return { name, version: '1.0.0', description: 'Mock for testing', features: [] };
    }
  }
  Object.assign(MockProvider.prototype, extraMethods);
  return MockProvider;
}

// Cache Providers
const MockCacheProvider = createMockProvider('MockCacheProvider', {
  async get() { return undefined; },
  async set() { },
  async del() { },
  async clear() { },
  async keys() { return []; },
  async stats() {
    return { hits: 0, misses: 0, keys: 0, ksize: 0, vsize: 0, sets: 0, deletes: 0, hitRate: 0 };
  }
});

jest.mock('./src/providers/NodeCacheProvider', () => MockCacheProvider);
jest.mock('./src/providers/NullCacheProvider', () => MockCacheProvider);

// User Providers
const MockUserProvider = createMockProvider('MockUserProvider', {
  async getUser() { return null; },
  async createUser(userData: any) { return { username: userData.username }; },
  async updateUser() { return true; },
  async deleteUser() { return true; },
  async getAllUsers() { return []; },
  async validateCredentials() { return false; },
  async getUserPermissions() { return []; },
  async getUserRoles() { return []; }
});

jest.mock('./src/providers/FileUserProvider', () => MockUserProvider);

// Page Providers
const MockPageProvider = createMockProvider('MockPageProvider', {
  async getPage() { return null; },
  async savePage() { return true; },
  async deletePage() { return true; },
  async getAllPages() { return []; },
  async pageExists() { return false; },
  async listPages() { return []; }
});

// Skip mocking FileSystemProvider when SKIP_PROVIDER_MOCK env var is set
// This allows integration tests of actual provider implementations
if (!process.env.SKIP_PROVIDER_MOCK) {
  jest.mock('./src/providers/FileSystemProvider', () => MockPageProvider);
}
jest.mock('./src/providers/VersioningFileProvider', () => MockPageProvider);

// Search Providers
const MockSearchProvider = createMockProvider('MockSearchProvider', {
  async search() { return { results: [], totalHits: 0 }; },
  async indexPage() { },
  async removePage() { },
  async clearIndex() { },
  async buildIndex() { },
  async getDocumentCount() { return 0; }
});

jest.mock('./src/providers/LunrSearchProvider', () => MockSearchProvider);

// Audit Providers
const MockAuditProvider = createMockProvider('MockAuditProvider', {
  async logEvent() { },
  async queryEvents() { return []; },
  async getEventCount() { return 0; }
});

jest.mock('./src/providers/FileAuditProvider', () => MockAuditProvider);
jest.mock('./src/providers/NullAuditProvider', () => MockAuditProvider);

// Attachment Providers
const MockAttachmentProvider = createMockProvider('MockAttachmentProvider', {
  async saveAttachment() { return { filename: 'test.txt', path: '/test' }; },
  async getAttachment() { return null; },
  async deleteAttachment() { return true; },
  async listAttachments() { return []; }
});

jest.mock('./src/providers/BasicAttachmentProvider', () => MockAttachmentProvider);

// Mock PageNameMatcher for RenderingManager tests
// Note: This mock is bypassed in PageNameMatcher's own tests using jest.unmock()
jest.mock('./src/utils/PageNameMatcher', () => {
  return class MockPageNameMatcher {
    matchEnglishPlurals: boolean;
    variationIndex: Map<string, string> | null;
    constructor(matchEnglishPlurals: boolean) {
      this.matchEnglishPlurals = matchEnglishPlurals;
      this.variationIndex = null;
    }
    buildIndex(pageNames: string[]) {
      this.variationIndex = new Map();
      for (const name of pageNames) {
        const lower = name.toLowerCase();
        if (!this.variationIndex.has(lower)) this.variationIndex.set(lower, name);
        if (lower.endsWith('s')) {
          const singular = lower.slice(0, -1);
          if (!this.variationIndex.has(singular)) this.variationIndex.set(singular, name);
        } else {
          const plural = lower + 's';
          if (!this.variationIndex.has(plural)) this.variationIndex.set(plural, name);
        }
      }
    }
    clearIndex() { this.variationIndex = null; }
    findBestMatch(pageName: string, allPages: string[]) {
      if (allPages.includes(pageName)) return pageName;
      const lower = pageName.toLowerCase();
      return allPages.find(p => p.toLowerCase() === lower) ?? null;
    }
    findMatch(pageName: string, allPages: string[]) {
      if (this.variationIndex) return this.variationIndex.get(pageName.toLowerCase()) ?? null;
      return this.findBestMatch(pageName, allPages);
    }
    matchesPage(linkText: string, pageName: string) {
      return linkText === pageName || linkText.toLowerCase() === pageName.toLowerCase();
    }
  };
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

// Redirect all data storage to /tmp during tests.
// Prevents tests from touching live data/sessions, data/logs, data/search-index.
// JEST_WORKER_ID gives each parallel worker its own isolated directory.
process.env.FAST_STORAGE = `/tmp/ngdpbase-test-${process.env.JEST_WORKER_ID ?? '0'}`;
process.env.SLOW_STORAGE = process.env.FAST_STORAGE;
