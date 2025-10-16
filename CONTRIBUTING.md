# Contributing to amdWiki

Welcome! We appreciate your interest in contributing to amdWiki, a JSPWiki-inspired file-based wiki built with Node.js.

## 🚀 Quick Start

1. **Fork** the repository
2. **Clone** your fork: `git clone https://github.com/your-username/amdWiki.git`
3. **Install** dependencies: `npm install`
4. **Start** development server: `npm start`
5. **Test** your changes: `npm test`

## How to start the server

see [SERVER](../../SERVER.md)

### Log Locations Summary

  | Type        | Location                      | Purpose                             |
  |-------------|-------------------------------|-------------------------------------|
  | PM2 Output  | ~/.pm2/logs/amdWiki-out.log   | Real-time stdout, startup messages  |
  | PM2 Errors  | ~/.pm2/logs/amdWiki-error.log | Real-time stderr, plugin errors     |
  | Application | ./logs/app.log                | Winston logger, detailed operations |
  | Audit       | ./logs/audit.log              | Security/audit events               |

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

### Manager Development Pattern
```javascript
// All managers extend BaseManager
class NewManager extends BaseManager {
  constructor(engine) {
    super(engine);
  }

  async initialize(config = {}) {
    await super.initialize(config);
    // Manager-specific initialization
  }

  // Managers can receive WikiContext for user-aware operations
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

```
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
