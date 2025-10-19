---
title: FileSystemProvider Architecture Design
uuid: filesystem-provider-design
category: documentation
user-keywords: [architecture, provider-pattern, refactoring]
lastModified: 2025-10-08
---

# FileSystemProvider Architecture Design

## Overview

This document outlines the design for abstracting page storage operations into a provider pattern, similar to JSPWiki's approach. The goal is to decouple page retrieval and storage logic from the PageManager, allowing for future extensibility (e.g., database providers, cloud storage, etc.).

## Current Architecture

### PageManager Responsibilities (Current)
The current [PageManager.js](../../src/managers/PageManager.js) directly handles:
- File system access (`fs.readFile`, `fs.writeFile`, `fs.readdir`)
- Directory walking and scanning
- Page caching and indexing
- UUID and title resolution
- Frontmatter parsing with gray-matter
- Storage location determination (pages vs required-pages)

### Components Using PageManager

Based on code analysis, these components make calls to PageManager:

1. **WikiRoutes.js** - Main route handler
   - `pageManager.getPage()`
   - `pageManager.savePage()`
   - `pageManager.getAllPages()`
   - `pageManager.pageExists()`

2. **RenderingManager.js** - Page rendering
   - `pageManager.getPageContent()`
   - `pageManager.pageExists()`

3. **SearchManager.js** - Search indexing
   - `pageManager.getAllPages()`
   - `pageManager.getPageContent()`

4. **ExportManager.js** - Export functionality
   - `pageManager.getPage()`
   - `pageManager.getPageContent()`

5. **LinkParserHandler.js** - Link validation
   - `pageManager.pageExists()`

6. **WikiLinkHandler.js** - Wiki link processing
   - `pageManager.pageExists()`

7. **WikiTagHandler.js** - Tag processing
   - `pageManager.pageExists()`

8. **UserManager.js** - User-related page operations
   - `pageManager.savePage()`
   - `pageManager.getAllPages()`

## Proposed Architecture

### Provider Pattern Implementation

Following JSPWiki's model:

``` javascript
WikiEngine
  └── PageManager
      └── FileSystemProvider (configurable via "amdwiki.pageProvider")
```

### Access Pattern

```javascript
// In any component:
const pageManager = wikiContext.getEngine().getManager('PageManager');
const provider = pageManager.getCurrentPageProvider();

// OR direct access if PageManager proxies provider methods:
const pageManager = wikiContext.getEngine().getManager('PageManager');
const page = await pageManager.getPage(identifier);
```

## Provider Interface Design

### Base Provider Interface

```javascript
/**
 * BasePageProvider - Abstract interface for page storage providers
 */
class BasePageProvider {
  constructor(engine) {
    this.engine = engine;
  }

  /**
   * Initialize the provider
   * Provider MUST access configuration via:
   *   const configManager = this.engine.getManager('ConfigurationManager');
   */
  async initialize() {
    throw new Error('initialize() must be implemented by provider');
  }

  /**
   * Get page content and metadata
   * @param {string} identifier - Page UUID or title
   * @returns {Promise<{content: string, metadata: object, title: string, uuid: string, filePath: string}|null>}
   */
  async getPage(identifier) {
    throw new Error('getPage() must be implemented by provider');
  }

  /**
   * Get only page content (without metadata)
   * @param {string} identifier - Page UUID or title
   * @returns {Promise<string>}
   */
  async getPageContent(identifier) {
    throw new Error('getPageContent() must be implemented by provider');
  }

  /**
   * Get only page metadata
   * @param {string} identifier - Page UUID or title
   * @returns {Promise<object|null>}
   */
  async getPageMetadata(identifier) {
    throw new Error('getPageMetadata() must be implemented by provider');
  }

  /**
   * Save page content and metadata
   * @param {string} pageName - Page title
   * @param {string} content - Page content
   * @param {object} metadata - Page metadata
   * @returns {Promise<void>}
   */
  async savePage(pageName, content, metadata) {
    throw new Error('savePage() must be implemented by provider');
  }

  /**
   * Delete a page
   * @param {string} identifier - Page UUID or title
   * @returns {Promise<boolean>}
   */
  async deletePage(identifier) {
    throw new Error('deletePage() must be implemented by provider');
  }

  /**
   * Check if page exists
   * @param {string} identifier - Page UUID or title
   * @returns {boolean}
   */
  pageExists(identifier) {
    throw new Error('pageExists() must be implemented by provider');
  }

  /**
   * Get all page titles
   * @returns {Promise<string[]>}
   */
  async getAllPages() {
    throw new Error('getAllPages() must be implemented by provider');
  }

  /**
   * Refresh internal cache/index
   * @returns {Promise<void>}
   */
  async refreshPageList() {
    throw new Error('refreshPageList() must be implemented by provider');
  }

  /**
   * Get provider information
   * @returns {object}
   */
  getProviderInfo() {
    return {
      name: 'BasePageProvider',
      version: '1.0.0',
      description: 'Abstract base provider'
    };
  }
}
```

### FileSystemProvider Implementation

The FileSystemProvider would encapsulate all current file system operations:

```javascript
/**
 * FileSystemProvider - Markdown file-based storage provider
 * Implements page storage using filesystem with YAML frontmatter
 */
class FileSystemProvider extends BasePageProvider {
  constructor(engine) {
    super(engine);
    this.pagesDirectory = null;
    this.requiredPagesDirectory = null;
    this.encoding = 'UTF-8';
    this.pageCache = new Map();
    this.titleIndex = new Map();
    this.uuidIndex = new Map();
    this.pageNameMatcher = null;
  }

  async initialize() {
    // Get all configuration via ConfigurationManager
    const configManager = this.engine.getManager('ConfigurationManager');

    // Setup directories
    const cfgPath = configManager.getProperty('amdwiki.directories.pages', './pages');
    this.pagesDirectory = path.isAbsolute(cfgPath) ? cfgPath : path.join(process.cwd(), cfgPath);

    const reqCfgPath = configManager.getProperty('amdwiki.directories.required-pages', './required-pages');
    this.requiredPagesDirectory = path.isAbsolute(reqCfgPath) ? reqCfgPath : path.join(process.cwd(), reqCfgPath);

    this.encoding = configManager.getProperty('amdwiki.encoding', 'UTF-8');

    // Initialize PageNameMatcher with config
    const matchEnglishPlurals = configManager.getProperty('amdwiki.translatorReader.matchEnglishPlurals', true);
    this.pageNameMatcher = new PageNameMatcher(matchEnglishPlurals);

    // Ensure directories exist and load pages
    await fs.ensureDir(this.pagesDirectory);
    await fs.ensureDir(this.requiredPagesDirectory);
    await this.refreshPageList();
  }

  async getPage(identifier) {
    // Current PageManager.getPage() logic
  }

  async getPageContent(identifier) {
    // Current PageManager.getPageContent() logic
  }

  async getPageMetadata(identifier) {
    // Current PageManager.getPageMetadata() logic
  }

  async savePage(pageName, content, metadata) {
    // Current PageManager.savePage() logic
    // - Determine storage location
    // - Handle file operations
    // - Update cache
  }

  async deletePage(identifier) {
    // New implementation for deletion
  }

  pageExists(identifier) {
    // Current PageManager.pageExists() logic
  }

  async getAllPages() {
    // Current PageManager.getAllPages() logic
  }

  async refreshPageList() {
    // Current PageManager.refreshPageList() logic
    // - Walk directories
    // - Parse frontmatter
    // - Build indexes
  }

  getProviderInfo() {
    return {
      name: 'FileSystemProvider',
      version: '1.0.0',
      description: 'Markdown file storage with YAML frontmatter',
      features: ['uuid-indexing', 'title-indexing', 'plural-matching', 'dual-storage']
    };
  }

  // Private helper methods
  #walkDir(dir) { /* ... */ }
  #resolvePageInfo(identifier) { /* ... */ }
}
```

## Refactored PageManager

The PageManager becomes a thin wrapper/coordinator:

```javascript
class PageManager extends BaseManager {
  constructor(engine) {
    super(engine);
    this.provider = null;
  }

  async initialize() {
    // MUST get configuration via ConfigurationManager
    const configManager = this.engine.getManager('ConfigurationManager');
    if (!configManager) {
      throw new Error('PageManager requires ConfigurationManager to be initialized.');
    }

    const providerName = configManager.getProperty('amdwiki.pageProvider', 'FileSystemProvider');

    // Load provider based on configuration
    this.provider = this.#loadProvider(providerName);

    // Provider gets engine instance, will access ConfigurationManager internally
    await this.provider.initialize();

    logger.info(`PageManager initialized with ${providerName}`);
  }

  #loadProvider(providerName) {
    switch (providerName) {
      case 'FileSystemProvider':
        return new FileSystemProvider(this.engine);
      // Future: case 'DatabaseProvider': return new DatabaseProvider(this.engine);
      // Future: case 'CloudStorageProvider': return new CloudStorageProvider(this.engine);
      default:
        throw new Error(`Unknown page provider: ${providerName}`);
    }
  }

  getCurrentPageProvider() {
    return this.provider;
  }

  // Proxy methods to provider
  async getPage(identifier) {
    return this.provider.getPage(identifier);
  }

  async getPageContent(identifier) {
    return this.provider.getPageContent(identifier);
  }

  async getPageMetadata(identifier) {
    return this.provider.getPageMetadata(identifier);
  }

  async savePage(pageName, content, metadata) {
    return this.provider.savePage(pageName, content, metadata);
  }

  async deletePage(identifier) {
    return this.provider.deletePage(identifier);
  }

  pageExists(identifier) {
    return this.provider.pageExists(identifier);
  }

  async getAllPages() {
    return this.provider.getAllPages();
  }

  async refreshPageList() {
    return this.provider.refreshPageList();
  }
}
```

## Configuration

### IMPORTANT: Configuration Access Pattern

**ALL configuration access MUST use [ConfigurationManager.js](../../src/managers/ConfigurationManager.js)**

```javascript
// ✅ CORRECT - Always use ConfigurationManager
const configManager = this.engine.getManager('ConfigurationManager');
const providerName = configManager.getProperty('amdwiki.pageProvider', 'FileSystemProvider');
const pagesDir = configManager.getProperty('amdwiki.directories.pages', './pages');
const requiredPagesDir = configManager.getProperty('amdwiki.directories.required-pages', './required-pages');

// ❌ WRONG - Never access config files directly
const config = require('../../config/app-default-config.json'); // DON'T DO THIS
const fs = require('fs');
const configData = JSON.parse(fs.readFileSync('config/app-default-config.json')); // DON'T DO THIS
```

### Configuration Keys

The provider pattern uses these existing configuration keys from ConfigurationManager:

- `amdwiki.pageProvider` - Provider class name (default: "FileSystemProvider")
- `amdwiki.directories.pages` - Regular pages directory (default: "./pages")
- `amdwiki.directories.required-pages` - System pages directory (default: "./required-pages")
- `amdwiki.encoding` - File encoding (default: "UTF-8")
- `amdwiki.translatorReader.matchEnglishPlurals` - Enable plural matching (default: true)
- `amdwiki.system-category` - Category-to-storage mapping

## Migration Strategy

### Phase 1: Create Provider Infrastructure (Non-Breaking)
1. Create `src/providers/` directory
2. Implement `BasePageProvider.js` abstract class
3. Implement `FileSystemProvider.js` with current logic
4. Add provider loading mechanism to PageManager
5. **No changes to existing API** - all existing code continues working

### Phase 2: Internal Migration (Non-Breaking)
1. Update PageManager to proxy calls to provider
2. Move caching logic to provider
3. Run comprehensive tests to ensure compatibility
4. **No external API changes**

### Phase 3: Future Extensibility (Future Work)
1. Implement additional providers (DatabaseProvider, etc.)
2. Add provider lifecycle events
3. Support provider chaining/fallback

## Benefits

1. **Separation of Concerns**: Storage logic separate from page management logic
2. **Testability**: Providers can be mocked/tested independently
3. **Extensibility**: Easy to add new storage backends
4. **JSPWiki Compatibility**: Follows familiar pattern from JSPWiki
5. **Configuration-Driven**: Provider selection via config
6. **Non-Breaking**: Existing code continues to work unchanged

## File Structure

``` javascript
src/
├── managers/
│   └── PageManager.js (refactored, thin wrapper)
├── providers/
│   ├── BasePageProvider.js (abstract interface)
│   ├── FileSystemProvider.js (current logic moved here)
│   └── (future: DatabaseProvider.js, CloudStorageProvider.js)
└── utils/
    └── PageNameMatcher.js (existing, used by providers)
```

## Backward Compatibility

All existing code calling PageManager methods continues to work:
- `pageManager.getPage()` → proxied to `provider.getPage()`
- `pageManager.savePage()` → proxied to `provider.savePage()`
- No changes required to routes, handlers, or other managers

## Testing Strategy

1. **Provider Tests**: Test FileSystemProvider in isolation
2. **Integration Tests**: Test PageManager with provider
3. **Compatibility Tests**: Ensure all existing tests still pass
4. **Migration Tests**: Verify page data survives refactoring

## Next Steps

1. Review and approve this design
2. Implement BasePageProvider interface
3. Extract current logic into FileSystemProvider
4. Refactor PageManager to use provider pattern
5. Update tests
6. Update documentation

## Critical Rules

### 1. Configuration Access (MANDATORY)

ALL providers and managers MUST access configuration exclusively through ConfigurationManager

✅ **DO THIS:**
```javascript
const configManager = this.engine.getManager('ConfigurationManager');
const value = configManager.getProperty('amdwiki.some.key', 'defaultValue');
```

❌ **NEVER DO THIS:**
```javascript
const config = require('../../config/app-default-config.json');
const fs = require('fs');
const data = JSON.parse(fs.readFileSync('config/app-default-config.json'));
process.env.SOME_CONFIG; // Don't read env vars directly for app config
```

**Why?** ConfigurationManager provides:
- Merge of default + custom configs
- Validation
- Runtime updates
- Single source of truth
- Testing/mocking capabilities

### 2. Provider Instantiation

- Providers receive **engine instance** in constructor
- Engine provides access to all managers including ConfigurationManager
- Providers are completely isolated from direct file system configuration access

### 3. Backward Compatibility

All existing PageManager API calls continue to work unchanged - no breaking changes to existing code

## References

- JSPWiki PageProvider: <https://github.com/apache/jspwiki/blob/master/jspwiki-main/src/main/java/org/apache/wiki/providers/WikiPageProvider.java>
- Current PageManager: [src/managers/PageManager.js](../../src/managers/PageManager.js)
- ConfigurationManager: [src/managers/ConfigurationManager.js](../../src/managers/ConfigurationManager.js)
- Configuration Pattern: [.github/copilot-instructions.md](../../.github/copilot-instructions.md#L90-L96)
