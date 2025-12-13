# Contributing to amdWiki

Welcome! We appreciate your interest in contributing to amdWiki, a JSPWiki-inspired file-based wiki built with Node.js.

📖 **First time here?** Read [README.md](README.md) for project overview, features, and structure.

## 🚀 Quick Start

1. **Fork** the repository
2. **Clone** your fork: `git clone https://github.com/your-username/amdWiki.git`
3. **Install** dependencies: `npm install`
4. **Start** development server: `./server.sh start dev`
5. **Test** your changes: `npm test`

## Server Management

amdWiki uses `server.sh` for all server operations. See [SERVER.md](SERVER.md) for detailed documentation.

**Common Commands:**

```bash
./server.sh start [dev|prod]   # Start server (default: production)
./server.sh stop               # Stop server
./server.sh restart [dev|prod] # Restart server
./server.sh status             # Show server status
./server.sh logs [50]          # Show logs (default: 50 lines)
./server.sh env                # Show environment config
./server.sh unlock             # Remove PID lock (if server crashed)
```

**Note:** Always use `./server.sh` instead of direct `npm start` or `pm2` commands for proper environment configuration and PID lock management.

### Log Locations Summary

  | Type        | Location                      | Purpose                             |
  |-------------|-------------------------------|-------------------------------------|
  | PM2 Output  | ~/.pm2/logs/amdWiki-out.log   | Real-time stdout, startup messages  |
  | PM2 Errors  | ~/.pm2/logs/amdWiki-error.log | Real-time stderr, plugin errors     |
  | Application | ./data/logs/app.log           | Winston logger, detailed operations |
  | Audit       | ./data/logs/audit.log         | Security/audit events               |

## ⚙️ Configuration System

amdWiki uses a **hierarchical configuration system** with three layers that merge in priority order:

1. `config/app-default-config.json` - Base defaults (required, ~1150 properties)
2. `config/app-{environment}-config.json` - Environment-specific settings (optional)
   - Environment determined by `NODE_ENV` (development, production, test)
   - Loaded via `./server.sh start [dev|prod]`
3. `config/app-custom-config.json` - Local overrides (optional, persisted by admin UI)

### Configuration Workflow for Contributors

**During Development:**

- Edit `config/app-custom-config.json` for local testing
- Never commit `app-custom-config.json` (in .gitignore)
- Test with both dev and prod configs

**Adding New Configuration Properties:**

1. Add to `config/app-default-config.json` with sensible defaults
2. Document in manager's JSDoc comments
3. Add getter method in ConfigurationManager (if needed)
4. Update relevant documentation

**Applying Configuration Changes:**

```bash
# After editing any config file
./server.sh restart [dev|prod]
```

**Via Admin UI:**

- Navigate to `/admin/configuration`
- Changes automatically saved to `app-custom-config.json`
- Restart required: `/admin/restart` or `./server.sh restart`

### Configuration Property Naming

Follow JSPWiki-style naming conventions:

```javascript
"amdwiki.{category}.{property}": value
"amdwiki.page.provider": "filesystemprovider"
"amdwiki.backup.autoBackup": true
"jspwiki.parser.useExtractionPipeline": true
```

**Note:** Properties starting with `_` are treated as comments and ignored during loading (see ConfigurationManager.js:105-109, 118-121).

## 🏗️ Architecture Overview

amdWiki follows a **manager-based architecture** inspired by JSPWiki:

- **WikiEngine** - Central orchestrator (`src/WikiEngine.js`)
- **Managers** - Modular functionality (`src/managers/`)
- **MarkupParser** - WikiDocument DOM extraction pipeline (`src/parsers/MarkupParser.js`)
- **WikiDocument** - DOM-based JSPWiki element representation (`src/parsers/dom/WikiDocument.js`)
- **DOM Handlers** - Variable, plugin, and link processing (`src/parsers/dom/handlers/`)
- **Plugins** - Extensible features (`plugins/`)
- **File-based storage** - Pages as Markdown files (`pages/`)
- **Additional technical guides in [docs/](docs/) folder**, such as testing and manager development.

📖 **Read [ARCHITECTURE-PAGE-CLASSIFICATION.md](ARCHITECTURE-PAGE-CLASSIFICATION.md)** for detailed architecture patterns.

### WikiDocument DOM Parsing Architecture

amdWiki uses a **three-phase extraction pipeline** that separates JSPWiki syntax processing from Markdown parsing:

```text
Content → Extract JSPWiki → Create DOM Nodes → Showdown → Merge → HTML
```

**Key Components:**

- **MarkupParser** - Main parser orchestrator
- **extractJSPWikiSyntax()** - Phase 1: Extract JSPWiki syntax with placeholders
- **createDOMNode()** - Phase 2: Create WikiDocument DOM nodes via handlers
- **mergeDOMNodes()** - Phase 3: Replace placeholders with rendered nodes
- **DOMVariableHandler** - Handles `[{$variable}]` syntax
- **DOMPluginHandler** - Handles `[{Plugin param="value"}]` syntax
- **DOMLinkHandler** - Handles `[PageName]` and `[Text|Target]` syntax

**Benefits:**

- No parsing conflicts between JSPWiki and Markdown
- Correct heading rendering (fixes #110, #93)
- Natural escaping via DOM text nodes
- 376+ tests with 100% success rate

📖 **Read [docs/architecture/WikiDocument-DOM-Architecture.md](docs/architecture/WikiDocument-DOM-Architecture.md)** for complete architecture details.

### Session Management Architecture

amdWiki uses **express-session** for session management (standard Express middleware):

**Session Setup (app.js):**

```javascript
const session = require('express-session');

app.use(session({
  secret: configManager.getProperty('amdwiki.session.secret', 'change-in-production'),
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false,        // Set to true in production with HTTPS
    httpOnly: true,       // Prevent XSS
    maxAge: 24 * 60 * 60 * 1000  // 24 hours
  }
}));
```

**User Context Middleware (app.js):**

```javascript
app.use(async (req, res, next) => {
  const userManager = engine.getManager('UserManager');

  if (req.session && req.session.username && req.session.isAuthenticated) {
    // Load full user from UserManager (via provider)
    const user = await userManager.getUser(req.session.username);

    if (user && user.isActive) {
      req.userContext = {
        ...user,
        roles: [...user.roles, 'Authenticated', 'All'],
        isAuthenticated: true
      };
    } else {
      req.userContext = userManager.getAnonymousUser();
    }
  } else {
    req.userContext = userManager.getAnonymousUser();
  }

  next();
});
```

**Key Points:**

- ✅ **Standard express-session** - No custom session middleware
- ✅ **UserManager Provider Pattern** - Session loads user via FileUserProvider
- ✅ **req.userContext** - Available on all routes with full user data
- ✅ **Async User Loading** - Always `await userManager.getUser()`
- ❌ **No src/middleware/session.js** - Removed (legacy)

**Login Flow:**

1. User submits credentials to `/login`
2. `userManager.authenticateUser()` validates credentials
3. `req.session.username` and `req.session.isAuthenticated` set
4. On next request, middleware loads full user via `userManager.getUser()`
5. `req.userContext` populated for route handlers

**UserManager Methods (Async):**

```javascript
// All these methods are async and require await
await userManager.getUser(username)
await userManager.authenticateUser(username, password)
await userManager.hasRole(username, roleName)
await userManager.getSession(sessionId)
```

### WikiContext - Single Source of Truth

**WikiContext** (`src/context/WikiContext.js`) is the central context object that holds all request/user context in one place. Inspired by JSPWiki's WikiContext, it provides access to the engine, page, user, and other contextual information.

**Creating WikiContext in Route Handlers:**

```javascript
// Use the helper method in WikiRoutes
const wikiContext = this.createWikiContext(req, {
  context: WikiContext.CONTEXT.VIEW,  // or EDIT, PREVIEW, DIFF, INFO
  pageName: pageName,
  content: content,  // optional
  response: res
});

// Extract template data from context
const templateData = this.getTemplateDataFromContext(wikiContext);

// Render template with consistent data structure
res.render('template-name', {
  ...templateData,
  // additional template-specific properties
});
```

**WikiContext Properties:**

- `context` - The rendering context (VIEW, EDIT, PREVIEW, DIFF, INFO, NONE)
- `pageName` - Current page name
- `content` - Page content (if applicable)
- `userContext` - Complete user context with roles and authentication status
- `request` - Express request object
- `response` - Express response object
- `engine` - WikiEngine instance
- Manager references: `pageManager`, `renderingManager`, `pluginManager`, `variableManager`, `aclManager`

**Key Benefits:**

- ✅ **Single Source of Truth** - All context data in one place
- ✅ **Consistent Template Data** - All templates receive the same structure
- ✅ **Easy Maintenance** - Add new properties in one location
- ✅ **Type Safety** - Clear contract for available data
- ✅ **Rendering Context** - Used by parsers, plugins, and handlers

**Template Data Structure:**

```javascript
{
  currentUser: userContext,    // For header template compatibility
  userContext: userContext,    // For ACL and other logic
  user: userContext,           // Alias for convenience
  pageName: pageName,          // Current page
  wikiContext: wikiContext,    // Full context for advanced usage
  engine: engine               // WikiEngine reference
}
```

**DO NOT:**

- ❌ Pass individual `req.userContext` directly to templates
- ❌ Create separate user context objects in route handlers
- ❌ Manually construct template data objects

**DO:**

- ✅ Always use `createWikiContext()` helper in route handlers
- ✅ Use `getTemplateDataFromContext()` to extract template data
- ✅ Pass WikiContext to plugins, parsers, and handlers
- ✅ Use appropriate context type for the operation

**Migration Strategy:**

The codebase is gradually being refactored to use WikiContext everywhere:

1. **Route Handlers** (In Progress) - Create WikiContext at the start of each handler
2. **Template Rendering** (Done) - Extract template data from WikiContext
3. **Manager Methods** (Future) - Update manager signatures to accept WikiContext
4. **Provider Methods** (Future) - Update provider signatures to accept WikiContext

Example of current hybrid approach:

```javascript
async savePage(req, res) {
  // Create WikiContext (single source of truth)
  const wikiContext = this.createWikiContext(req, {
    context: WikiContext.CONTEXT.EDIT,
    pageName: pageName,
    content: content
  });

  // Extract user info from context
  const currentUser = wikiContext.userContext;

  // Prepare metadata with author from context
  const metadata = {
    ...otherMetadata,
    author: currentUser?.username || 'anonymous'
  };

  // TODO: Eventually this should be: pageManager.savePage(wikiContext, metadata)
  await pageManager.savePage(pageName, content, metadata);
}
```

When refactoring existing code, add TODO comments indicating where WikiContext should be used.

## 📦 Key Dependencies

### Versioning & Storage Libraries

**fast-diff** - Text diffing for delta storage

- **Purpose**: Efficiently store page versions as diffs instead of full copies
- **Algorithm**: Myers diff algorithm (similar to git)
- **Usage**: `src/utils/DeltaStorage.js`
- **Why chosen**: Lightweight (no dependencies), fast, battle-tested algorithm
- **Space savings**: 80-95% reduction for text-heavy content
- **Documentation**: [fast-diff on npm](https://www.npmjs.com/package/fast-diff)

**pako** - gzip compression/decompression

- **Purpose**: Compress old version files to save disk space
- **Implementation**: Pure JavaScript gzip (RFC 1952)
- **Usage**: `src/utils/VersionCompression.js`
- **Why chosen**: Pure JavaScript (no native bindings), works in Node.js and browsers
- **Compression**: 60-80% size reduction typical for text
- **Documentation**: [pako on npm](https://www.npmjs.com/package/pako)

### Versioning Implementation

The VersioningFileProvider uses delta storage + compression for efficient version management:

```text
v1: full_content.md                    (100 KB)
v2: diff_from_v1.diff.gz               (2 KB)
v3: diff_from_v2.diff.gz               (1.5 KB)
v4: diff_from_v3.diff.gz               (2.2 KB)
```

**Storage efficiency**:

- Without versioning: 400 KB (4 versions × 100 KB each)
- With delta storage: 105.7 KB (74% space savings)
- Reconstruction: Load v1, apply diffs sequentially

**See also**:

- `src/utils/DeltaStorage.js` - Diff creation and application
- `src/utils/VersionCompression.js` - Compression utilities
- `src/providers/BasePageProvider.js` - Versioning methods interface
- [Phase 1 Implementation](https://github.com/jwilleke/amdWiki/issues/125)

## 🔧 Development Guidelines

### Critical requirements

- [CHANGELOG.md](./CHANGELOG.md) ALL notable changes to are documented in this file. The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/) [CHANGELOG.md]
- [Semantic Versioning](https://semver.org/spec/v2.0.0.html)
- Markdownlint Configuration using (.markdownlint.json)
- Use of Open Standards
  - [Schema.org](https://schema.org/) when possible.
- 📖 **Read [ARCHITECTURE-PAGE-CLASSIFICATION.md](ARCHITECTURE-PAGE-CLASSIFICATION.md)** for detailed architecture patterns.

### Code Style

- Use **CommonJS** modules (`require/module.exports`)
- Follow **existing patterns** in manager creation and route handling
- **ESLint** and **Prettier** compliance (if configured)
- Use **meaningful variable names** and JSDoc comments
- **Required**: Comprehensive JSDoc documentation for all classes, methods, and functions (see below)

## 📚 JSDoc Documentation Standards

**All code MUST include comprehensive JSDoc documentation.** The entire codebase (~95% of core architecture) is fully documented with JSDoc, and all new contributions must maintain this standard.

### JSDoc Requirements

#### 1. **Class Documentation**

Every class must have a JSDoc block with:

- Class description explaining purpose and functionality
- `@class` tag
- `@extends` tag (if applicable)
- `@abstract` tag (for abstract classes)
- `@property` tags documenting all class properties
- `@see` references to related classes
- `@example` showing real-world usage

```javascript
/**
 * ExampleManager - Brief description of manager purpose
 *
 * Detailed description explaining what this manager does, its role in the
 * architecture, and any important implementation details or patterns used.
 *
 * Key features:
 * - Feature 1 description
 * - Feature 2 description
 * - Feature 3 description
 *
 * @class ExampleManager
 * @extends BaseManager
 *
 * @property {WikiEngine} engine - Reference to the wiki engine
 * @property {boolean} initialized - Whether manager has been initialized
 * @property {Map<string, Object>} dataCache - Cache of processed data
 *
 * @see {@link BaseManager} for base functionality
 * @see {@link RelatedManager} for related operations
 *
 * @example
 * const exampleManager = engine.getManager('ExampleManager');
 * const result = await exampleManager.performOperation('input');
 */
class ExampleManager extends BaseManager {
  // ...
}
```

#### 2. **Constructor Documentation**

```javascript
/**
 * Creates a new ExampleManager instance
 *
 * @constructor
 * @param {WikiEngine} engine - The wiki engine instance
 * @throws {Error} If engine is not provided
 */
constructor(engine) {
  super(engine);
  this.dataCache = new Map();
}
```

#### 3. **Method Documentation**

Every method must document:

- Purpose and behavior
- All parameters with types
- Return value with type
- Exceptions/errors thrown
- Async/promise handling
- Examples for complex methods

```javascript
/**
 * Process data with optional filtering
 *
 * Performs data processing with configurable options and returns
 * the processed result. Supports filtering by various criteria.
 *
 * @async
 * @param {string} input - Input data to process
 * @param {Object} [options={}] - Processing options
 * @param {boolean} [options.filter=false] - Enable filtering
 * @param {string[]} [options.categories] - Filter by categories
 * @returns {Promise<Object>} Processed data
 * @returns {string} result.output - Processed output
 * @returns {Object} result.metadata - Processing metadata
 * @throws {Error} If input is invalid
 * @throws {ValidationError} If options fail validation
 *
 * @example
 * const result = await manager.processData('input', {
 *   filter: true,
 *   categories: ['General']
 * });
 * console.log(result.output);
 */
async processData(input, options = {}) {
  // Implementation
}
```

#### 4. **Private/Protected Methods**

```javascript
/**
 * Internal helper method for data validation
 *
 * @private
 * @param {Object} data - Data to validate
 * @returns {boolean} True if valid
 */
#validateData(data) {
  // Implementation
}
```

#### 5. **Type Definitions**

For complex data structures:

```javascript
/**
 * Search result structure
 * @typedef {Object} SearchResult
 * @property {string} name - Page name/identifier
 * @property {string} title - Page title
 * @property {number} score - Relevance score (0-1)
 * @property {string} snippet - Content snippet with highlights
 * @property {Object} metadata - Additional metadata
 */
```

#### 6. **Provider Interface Documentation**

```javascript
/**
 * BaseExampleProvider - Abstract interface for example providers
 *
 * All example providers must extend this class and implement its methods.
 * Providers handle storage/retrieval from different backends.
 *
 * @class BaseExampleProvider
 * @abstract
 *
 * @property {WikiEngine} engine - Reference to the wiki engine
 * @property {boolean} initialized - Whether provider has been initialized
 *
 * @see {@link ConcreteProvider} for filesystem implementation
 * @see {@link ExampleManager} for usage
 */
```

### JSDoc Best Practices

#### DO

- ✅ Document ALL public classes, methods, and functions
- ✅ Include detailed descriptions explaining "why" not just "what"
- ✅ Provide type information for all parameters and returns
- ✅ Add examples for complex APIs
- ✅ Cross-reference related classes with `@see`
- ✅ Document exceptions with `@throws`
- ✅ Use `@async` for async methods
- ✅ Include configuration keys in comments
- ✅ Document JSPWiki patterns and architecture

#### DON'T

- ❌ Skip documentation for "simple" methods
- ❌ Use vague descriptions like "does something"
- ❌ Omit parameter types or return types
- ❌ Leave complex methods without examples
- ❌ Document implementation details that change frequently
- ❌ Use inconsistent formatting

### Generating Documentation

Generate HTML documentation from JSDoc comments:

```bash
# Install JSDoc globally (if needed)
npm install -g jsdoc

# Generate documentation
npx jsdoc -c jsdoc.json

# View generated docs
open ./jsdocs/index.html
```

The `jsdoc.json` configuration is already set up in the project root.

### IDE Integration

JSDoc provides excellent IDE support:

**VS Code / IntelliSense:**

- Hover over classes/methods to see documentation
- Autocomplete with parameter hints
- Type checking in JavaScript files
- Click to navigate to definitions

**Enable type checking in VS Code:**
Add to your file or workspace settings:

```javascript
// @ts-check
```

Or enable globally in `.vscode/settings.json`:

```json
{
  "js/ts.implicitProjectConfig.checkJs": true
}
```

### Documentation Coverage

Current documentation coverage:

- **Core Engine**: 100% ✅
- **Managers** (23 files): 100% ✅
- **Providers** (18 files): 100% ✅
- **Parsers** (2 files): 100% ✅
- **Utilities**: ~85% ✅
- **Overall**: ~95% ✅

**All new code must maintain 100% JSDoc coverage.**

### Manager Development Pattern

```javascript
/**
 * NewManager - Brief description of manager purpose
 *
 * Detailed description of what this manager does and its role
 * in the amdWiki architecture.
 *
 * @class NewManager
 * @extends BaseManager
 *
 * @property {WikiEngine} engine - Reference to the wiki engine
 * @property {boolean} initialized - Whether manager has been initialized
 *
 * @see {@link BaseManager} for base functionality
 *
 * @example
 * const newManager = engine.getManager('NewManager');
 * await newManager.performOperation();
 */
class NewManager extends BaseManager {
  /**
   * Creates a new NewManager instance
   *
   * @constructor
   * @param {WikiEngine} engine - The wiki engine instance
   */
  constructor(engine) {
    super(engine);
  }

  /**
   * Initialize the manager with configuration
   *
   * @async
   * @param {Object} [config={}] - Configuration object
   * @returns {Promise<void>}
   */
  async initialize(config = {}) {
    await super.initialize(config);
    // Manager-specific initialization
  }

  /**
   * Perform a context-aware operation
   *
   * Managers can receive WikiContext for user-aware operations.
   *
   * @async
   * @param {WikiContext} wikiContext - The wiki context
   * @param {...*} params - Additional parameters
   * @returns {Promise<*>} Operation result
   * @throws {Error} If authentication is required but user is not authenticated
   *
   * @example
   * const context = new WikiContext(engine, { pageName: 'Main' });
   * const result = await manager.performOperation(context, 'param1');
   */
  async performOperation(wikiContext, ...params) {
    const userContext = wikiContext.userContext;
    const pageName = wikiContext.pageName;

    // Access other managers via engine
    const aclManager = this.engine.getManager('ACLManager');

    // Perform operation with context awareness
    if (!userContext.isAuthenticated) {
      throw new Error('Authentication required');
    }

    // ... operation logic
  }
}
```

### Plugin Development Pattern

```javascript
const PluginName = {
  name: 'PluginName',
  execute(context, params) {
    const engine = context.engine;
    const manager = engine.getManager('ManagerName');
    return 'HTML output';
  }
};
```

### Parser Development Pattern

**Adding Custom JSPWiki Syntax:**

#### 1. **Add extraction pattern** in `MarkupParser.extractJSPWikiSyntax()`

```javascript
// Extract custom syntax
sanitized = sanitized.replace(/\[\{CUSTOM:(.*?)\}\]/g, (match, content) => {
  jspwikiElements.push({
    type: 'custom',
    content: content.trim(),
    id: id++,
    syntax: match
  });
  return `<!--JSPWIKI-${uuid}-${id - 1}-->`;
});
```

#### 2. **Create DOM handler** in `src/parsers/dom/handlers/`

```javascript
class CustomHandler {
  async createNodeFromExtract(element, context, wikiDocument) {
    const node = wikiDocument.createElement('div', {
      'class': 'custom-element',
      'data-jspwiki-id': element.id.toString()
    });
    node.textContent = element.content;
    return node;
  }
}
```

#### 3. **Integrate handler** in `MarkupParser.createDOMNode()`

```javascript
case 'custom':
  return await this.customHandler.createNodeFromExtract(element, context, wikiDocument);
```

#### 4. **Add tests** in `src/parsers/__tests__/`

```javascript
test('custom syntax extraction', () => {
  const { jspwikiElements } = parser.extractJSPWikiSyntax('[{CUSTOM:test}]');
  expect(jspwikiElements[0].type).toBe('custom');
  expect(jspwikiElements[0].content).toBe('test');
});
```

📖 **Read [docs/migration/WikiDocument-DOM-Migration.md](docs/migration/WikiDocument-DOM-Migration.md)** for detailed migration patterns and integration guide.

### Security Guidelines

Use **ACLManager** for content filtering based on user permissions.
See [Policies-Roles-Permissions](docs/architecture/Policies-Roles-Permissions.md)

### UI/UX Standards

- Use **Bootstrap 5** components and styling for consistency.
- Follow **JSPWiki-style navigation and layout patterns** as seen in existing templates.
- Ensure **responsive design** for mobile compatibility.
- Implement professional styling with cards, shadows, and hover effects.

### Performance & Reliability

- Implement **caching** for page lookups where applicable (e.g., titleToUuidMap, slugToUuidMap).
- Ensure **cache rebuilding** after page modifications.
- Handle **file system errors** gracefully to prevent crashes.
- Use proper **cleanup** in finally blocks for resource management.

## 🧪 Testing

📖 **See [docs/testing/PageManager-Testing-Guide.md](docs/testing/PageManager-Testing-Guide.md) for detailed mocking strategies.**

### Running Tests

- **Run all tests**: `npm test`
- **Coverage report**: `npm run test:coverage`
- **Watch mode**: `npm run test:watch`
- **Run specific test**: `npm test -- path/to/test.test.js`
- **CI mode**: `npm run test:ci`

### Test Organization

All tests follow the **Jest `__tests__` pattern** co-located with source code:

```text
src/
├── managers/
│   ├── PageManager.js
│   └── __tests__/
│       ├── PageManager.test.js
│       └── PageManager-Storage.test.js
├── parsers/
│   ├── MarkupParser.js
│   └── __tests__/
│       ├── MarkupParser.test.js
│       └── MarkupParser-Integration.test.js
├── routes/
│   ├── WikiRoutes.js
│   └── __tests__/
│       ├── routes.test.js
│       └── maintenance-mode.test.js
└── utils/
    ├── SchemaGenerator.js
    └── __tests__/
        └── SchemaGenerator.test.js
```

**Why this pattern:**

- ✅ Tests co-located with code they test
- ✅ Easy to find and maintain
- ✅ Jest automatically discovers all tests
- ✅ Follows Jest best practices
- ✅ Clear separation from source code

### Test Requirements

- **Unit tests for new managers** (extending BaseManager pattern)
- **Integration tests** for route handlers and cross-component functionality
- **Plugin functionality tests** for JSPWiki-style plugin syntax
- **Parser tests** for extraction, DOM creation, and merge pipeline
- **Use mocks instead of real file operations** - critical requirement (see CHANGELOG.md)
- **Mock fs-extra completely** using in-memory Map-based file systems
- **Mock gray-matter** for YAML frontmatter parsing
- **Maintain >80% coverage** for critical managers (>90% for PageManager, UserManager, ACLManager)
- **Maintain >90% coverage** for parser components
- **Use testUtils.js** for common mock objects and test utilities

### Writing Tests

**1. Create test file in `__tests__` directory:**

```bash
# For a new manager
touch src/managers/__tests__/NewManager.test.js

# For a new utility
touch src/utils/__tests__/NewUtil.test.js
```

**2. Use Jest testing framework:**

```javascript
const NewManager = require('../NewManager');

describe('NewManager', () => {
  let manager;
  let mockEngine;

  beforeEach(() => {
    mockEngine = { /* mock setup */ };
    manager = new NewManager(mockEngine);
  });

  test('should initialize correctly', async () => {
    await manager.initialize();
    expect(manager.initialized).toBe(true);
  });
});
```

**3. Mock file operations:**

```javascript
jest.mock('fs-extra');
const fs = require('fs-extra');

// Setup mocks
fs.readFile.mockResolvedValue('file content');
fs.writeFile.mockResolvedValue();
```

### Test Types

**Unit Tests** - Test individual functions/methods

- Located: `src/**/__tests__/*.test.js`
- Focus: Single component in isolation
- Example: `PageManager.test.js`

**Integration Tests** - Test multiple components together

- Located: `src/**/__tests__/*-Integration.test.js`
- Focus: Component interactions
- Example: `MarkupParser-Integration.test.js`

**Route Tests** - Test HTTP endpoints

- Located: `src/routes/__tests__/*.test.js`
- Use: supertest for HTTP testing
- Example: `routes.test.js`

### Test Coverage

Jest configuration excludes test files from coverage:

```json
{
  "collectCoverageFrom": [
    "src/**/*.js",
    "!src/**/__tests__/**",
    "!src/legacy/**"
  ]
}
```

View coverage report:

```bash
npm run test:coverage
# Open: coverage/lcov-report/index.html
```

### Parser Test Suites

The WikiDocument DOM parser has comprehensive test coverage:

- **MarkupParser-Extraction.test.js** (41 tests) - Phase 1: JSPWiki syntax extraction
- **MarkupParser-MergePipeline.test.js** (31 tests) - Phase 3: DOM merge pipeline
- **MarkupParser-Comprehensive.test.js** (55 tests) - Integration tests covering:
  - Markdown preservation
  - JSPWiki syntax processing
  - Mixed content scenarios
  - Edge cases and error handling
  - Performance validation
  - Regression tests for #110, #93

**Handler Tests:**

- `DOMVariableHandler.test.js` - Variable node creation
- `DOMPluginHandler.test.js` - Plugin node creation
- `DOMLinkHandler.test.js` - Link node creation

Total: 376+ tests with 100% success rate

## 📝 Page Development

### Frontmatter Structure

All pages require YAML frontmatter:

```yaml
---
title: Page Name
category: General
user-keywords: []
uuid: auto-generated-uuid
lastModified: ISO-date-string
---
```

### JSPWiki Syntax Support

- **Links**: `[PageName]` or `[Link Text|PageName]`
- **User variables**: `[{$username}]`, `[{$loginstatus}]`
- **Plugins**: `[{PluginName param='value'}]`

## 🔀 Pull Request Process

### Before Submitting

1. **Create feature branch**: `git checkout -b feature/your-feature-name`
2. **Follow coding patterns** from existing codebase
3. **Add tests** for new functionality
4. **Update documentation** if needed
5. **Run full test suite**: `npm test`
6. **Test with server**: Test your changes in both development and production modes

   ```bash
   ./server.sh start dev    # Test in development
   ./server.sh restart prod # Test in production
   ```

### PR Requirements

- **Descriptive title** and detailed description
- **Reference issues** using `#issue-number`
- **Include tests** for new features
- **Update CHANGELOG.md** for user-facing changes
- **Follow semantic commit messages**: `feat:`, `fix:`, `chore:`

### Review Criteria

- Follows manager-based architecture patterns
- Includes appropriate tests
- Maintains backward compatibility
- Follows JSPWiki conventions where applicable

## 🏷️ Version Management

We use **Semantic Versioning** (SemVer):

```bash
npm run version:patch    # Bug fixes (1.2.0 → 1.2.1)
npm run version:minor    # New features (1.2.0 → 1.3.0)  
npm run version:major    # Breaking changes (1.2.0 → 2.0.0)
```

## 🐛 Issue Reporting

### Bug Reports

- Use clear, descriptive titles
- Include steps to reproduce
- Specify Node.js version and OS
- Include error messages and logs

### Feature Requests

- Explain the use case and benefit
- Consider JSPWiki compatibility
- Discuss impact on existing functionality

## 🎯 Areas for Contribution

### High Priority

- **User Authentication** improvements
- **Page History & Versioning** features
- **Advanced Search** enhancements
- **Plugin Development**
- **Parser Extensions** - Custom JSPWiki syntax handlers

### Good First Issues

- Documentation improvements
- New wiki plugins
- UI/UX enhancements
- Test coverage expansion
- Parser handler improvements

### Parser-Specific Contributions

- **Custom Syntax Handlers** - Add new JSPWiki-style syntax
- **Performance Optimizations** - Improve extraction/merge speed
- **Handler Enhancements** - Improve existing DOM handlers
- **Test Coverage** - Add edge case tests
- **Documentation** - Improve API docs and examples

## 💬 Getting Help

- **GitHub Issues** - Bug reports and feature requests
- **GitHub Discussions** - Questions and general discussion
- **Code Review** - Submit draft PRs for early feedback

## 📜 License

By contributing, you agree that your contributions will be licensed under the same license as the project.

---

Thank you for contributing to amdWiki! 🚀
