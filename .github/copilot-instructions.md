# amdWiki AI Coding Agent Instructions

When running terminal commands, ensure the shell sources ~/.bash_profile or equivalent to include /usr/local/bin in PATH for npm/Node tools.


Read [SERVER.md](/SERVER.md)
Read [SERVER.md](/SERVER.md)
Read [](/docs/managers/ValidationManager-Documentation.md

## Architecture Overview

**amdWiki** is a JSPWiki-inspired file-based wiki built with Node.js/Express following a modular manager pattern. Pages are stored as Markdown files with YAML frontmatter.

Review CONRTRIBUTING.md

All components should be designed with modularity and reusability in mind. Using config/app-default-config.json as a base, and app-custom-config.json to override values.

### RenderPipline

We expect WikiContext to implement methods as in https://github.com/apache/jspwiki/blob/c31d4f284983fd25e37e7ec5682fe2bdfddc439b/jspwiki-main/src/main/java/org/apache/wiki/WikiContext.java#L64


### Core Engine Pattern
- **WikiContext** - WikiContext that 
  - Page Render Request: The client sends a request to view a wiki page. The WikiEngine receives the request and constructs a WikiContext that encapsulates the request type, authentication, page, and rendering parameters.
  - Data Retrieval: WikiEngine uses the context to retrieve the WikiPage object and the raw wiki text (markup) of the page from the repository (filesystem, database, or cache).
  - Rendering Manager: The rendering pipeline begins when WikiEngine calls a method like textToHTML(context, pageContent) on its src/managers/RenderingManager.js. The RenderingManager determines which parser to use based on WikiContext (classic JSPWiki markup, Markdown, etc.) and user preferences.
  - Parser Instantiation and Parsing: The appropriate Parser (for example, src/parsers/MarkupParser.js) is instantiated. It processes the wiki markup, handles macros, plugins, and generates an internal  DOM that represents the structured content of the page.
  - Post-Processing and Plugins: After parsing, plugins or custom handlers embedded in the page are invoked as needed. These may modify the internal  DOM, include dynamic content, or perform security/permission checks.
  - HTML Serialization: The WikiDocument DOM is serialized to HTML. The HTML may be further post-processed to handle links, images, CSS classes, and security filtering for safe output.
  - Final Output: The resulting HTML is sent back as the HTTP response, and the user's browser displays the rendered page
- **WikiEngine** (`src/WikiEngine.js`) - Central orchestrator extending base `Engine` class
- **Manager Registration** - All functionality through manager instances: PageManager, RenderingManager, SearchManager, etc.
- **Plugin System** - Extensible via `/plugins` directory with JSPWiki-style syntax
- **ConfigurationManager** - Configuration via `src/managers/ConfigurationManager.js` (single source of truth) with validation

### Key Architectural Decisions
- **File-based storage** - No database; pages stored as `.md` files in `/pages` or `/required-pages`
- **Manager isolation** - Each manager extends `BaseManager.js` with standard lifecycle
- **Template rendering** - EJS templates with JSPWiki-style navigation and Bootstrap UI
- **Three-tier auth** - Default roles are Anonymous, Authenticated, Admin roles via UserManager (Which are Obtained form ConfigurationManager)

## Essential Development Patterns

### 1. Manager Creation Pattern
```javascript
// All managers follow this pattern in WikiEngine.js
const NewManager = require('./managers/NewManager');
this.registerManager('NewManager', new NewManager(this));
await manager.initialize(config);
```

### 2. Route Handler Pattern
Routes in `src/routes/WikiRoutes.js` use manager dependency injection:
```javascript
async routeHandler(req, res) {
  const pageManager = this.engine.getManager('PageManager');
  const userContext = await this.getCurrentUser(req);
  // Always get common template data
  const templateData = await this.getCommonTemplateData(userContext);
}
```

### 3. Page Frontmatter Structure
All pages require this YAML frontmatter:
```yaml
---
title: Page Name 
category: General
user-keywords: []
uuid: auto-generated-uuid
lastModified: ISO-date-string
---
```

### 4. Plugin Development Pattern
Plugins in `/plugins` follow this structure:
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

### Configuration Access Pattern
- Always access configuration via `ConfigurationManager`:
```js
const cfgMgr = this.engine.getManager('ConfigurationManager');
const value = cfgMgr.getProperty('amdwiki.some.key', 'default');
```
- Do not read configuration files directly in managers/plugins.
- Do not use legacy `config/Config.js` or `ConfigBridge.js` for new code.

### NotificationManager Configuration (must use ConfigurationManager)
- The Notification system reads its settings exclusively through `ConfigurationManager`. See `src/managers/NotificationManager.js`.
- Keys:
  - `amdwiki.notifications.dir` (string) — absolute or relative directory for persisted notifications (default: `./data`)
  - `amdwiki.notifications.file` (string) — filename for persisted notifications (default: `notifications.json`)
  - `amdwiki.notifications.autoSaveInterval` (number, ms) — autosave interval (default: `300000`)
- Example usage inside `NotificationManager`:
```js
const cfgMgr = this.engine.getManager('ConfigurationManager');
const dataDir = cfgMgr.getProperty('amdwiki.notifications.dir', './data');
const fileName = cfgMgr.getProperty('amdwiki.notifications.file', 'notifications.json');
const interval = cfgMgr.getProperty('amdwiki.notifications.autoSaveInterval', 5 * 60 * 1000);
```
- Do not read environment variables or files directly for notifications; rely on `ConfigurationManager`.

## Critical Developer Workflows

### File Structure Navigation
- app.js is in root of project
- **Pages**: `/pages/*.md` - Wiki content files
- **Templates**: `/views/*.ejs` - EJS view templates  
- **Managers**: `/src/managers/` - Business logic modules
- **Routes**: `/src/routes/WikiRoutes.js` - All HTTP endpoints
- **Plugins**: `/plugins/*.js` - Extensible functionality
- **Static**: `/public/` - CSS, JS, images
- **Config**: `/config/Config.js` - Application configuration

## JSPWiki-Specific Conventions

### Link Syntax
- **Internal links**: `[PageName]` or `[Link Text|PageName]`
- **Red links**: Automatically detected for non-existent pages
- **Categories**: YAML frontmatter `category: CategoryName`

### User Variables
Pages support JSPWiki-style user variables:
- `[{$username}]` - Current user's username
- `[{$loginstatus}]` - User authentication status
- `[{$userroles}]` - User's assigned roles

### Plugin Invocation
JSPWiki-style plugin syntax in pages:
- `[{PluginName}]` - Basic plugin call
- `[{PluginName param1='value'}]` - Plugin with parameters

## Integration Points

### Authentication Flow

1. **Session middleware** - Express session with cookie-based auth
2. **UserManager** - Handles login/logout/registration
3. **ACLManager** - Role-based access control
4. **Template context** - User data injected into all views

### Search Integration
- **Lunr.js** - Full-text search indexing in SearchManager
- **Multi-criteria** - Category, keyword, content search
- **Real-time** - Index updates on page save

### Rendering Pipeline
see [amdWiki Rendering Pipeline.md](/docs/planning/amdWiki%20Rendering%20Pipeline.md)

## Common Gotchas

- **Config instance** - WikiEngine constructor requires proper Config validation
- **Manager order** - Managers have initialization dependencies (PageManager before RenderingManager)
- **User context** - Always pass user context to rendering for variable expansion
- **File paths** - Use absolute paths; relative paths can break in different contexts
- **ACL markup** - Content filtering happens before rendering, not after
- **Plugin context** - Plugins receive engine instance via context.engine

## Testing Patterns

Tests use Jest with manager mocking patterns. Key test files:
- `src/managers/__tests__/` - Manager unit tests
- `src/__tests__/` - Integration tests
- Coverage target: `src/**/*.js` excluding `src/tests/**` and `src/legacy/**`
