# WikiContext - Centralized Rendering Context

WikiContext is the central orchestrator for wiki content rendering in amdWiki, following JSPWiki's architecture patterns. It replaces inline regex processing with a modular, manager-based approach.

## Overview

WikiContext encapsulates the rendering pipeline and provides access to various managers (VariableManager, PluginManager, RenderingManager) through a unified interface. It follows the JSPWiki TranslatorReader pattern: **variables → plugins → links → HTML**.

## Architecture

```plaintext
┌─────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Content   │───▶│   WikiContext    │───▶│  Rendered HTML  │
│ (Markdown)  │    │   Orchestrator   │    │    (Output)     │
└─────────────┘    └──────────────────┘    └─────────────────┘
                            │
                  ┌─────────┴─────────┐
                  │   Manager Layer   │
                  └─────────┬─────────┘
        ┌─────────┬─────────┼─────────┬─────────┐
        │         │         │         │         │
   ┌────▼───┐┌───▼────┐┌───▼────┐┌───▼────┐┌───▼────┐
   │Variable││Plugin  ││Rendering││Page    ││Other   │
   │Manager ││Manager ││Manager  ││Manager ││Managers│
   └────────┘└────────┘└────────┘└────────┘└────────┘
```

## Key Features

### 1. Request-Scoped Context Container
- Encapsulates all request information (page, user, HTTP details)
- Provides unified access to all engine managers
- Created once per HTTP request

### 2. Rendering Orchestration
WikiContext delegates rendering to the appropriate pipeline:
- **Primary**: Uses MarkupParser when available (advanced parsing with DOM)
- **Fallback**: Uses Showdown with VariableManager when parser unavailable
- **Automatic**: Chooses best available method transparently

### 3. Manager Access
Provides direct access to managers:
- **RenderingManager** - Parsing and rendering
- **VariableManager** - Variable expansion
- **PluginManager** - Plugin execution
- **PageManager** - Page operations
- **ACLManager** - Access control

### 4. Fallback Handling
- Graceful degradation when managers are unavailable
- Fallback to basic rendering for essential functionality
- Error handling with detailed logging

## Usage

### Basic Usage

```javascript
const WikiContext = require('./src/context/WikiContext');

// Create context
const context = new WikiContext(engine, {
  context: WikiContext.CONTEXT.VIEW,
  pageName: 'MyPage',
  content: 'Welcome to [{$pagename}]!',
  userContext: { isAuthenticated: true, username: 'john' },
  request: req,
  response: res
});

// Render content
const html = await context.renderMarkdown();
```

### With Custom Content

```javascript
// Render different content than stored in context
const html = await context.renderMarkdown('# Custom Content\n\nHello [{$username}]!');
```

### Checking Context Type

```javascript
const contextType = context.getContext();

if (contextType === WikiContext.CONTEXT.EDIT) {
  // User is editing
} else if (contextType === WikiContext.CONTEXT.VIEW) {
  // User is viewing
}
```

### Getting Parse Options

```javascript
// Get options for manual parsing
const options = context.toParseOptions();
// Returns: { pageContext: {...}, engine: WikiEngine }

// Use with parser
const parser = engine.getManager('MarkupParser');
const html = await parser.parse(content, options);
```

## Migration from Inline Regex

WikiContext replaces the previous inline regex approach in `app.js`:

### Before (Inline Regex)
```javascript
// Old approach - inline regex processing
function renderMarkdown(content, pageName) {
  let expandedContent = content.replace(/\[\{\$pagename\}\]/g, pageName);
  expandedContent = expandedContent.replace(/\[\{ReferringPagesPlugin([^}]*)\}\]/g, (match, params) => {
    return referringPagesPlugin(pageName, params, linkGraph);
  });
  // ... more inline regex
  return converter.makeHtml(expandedContent);
}
```

### After (WikiContext)
```javascript
// New approach - manager-based processing
async function renderMarkdown(content, pageName, userContext = null, request = null) {
  const context = new WikiContext(engine, {
    context: WikiContext.CONTEXT.VIEW,
    pageName: pageName,
    content: content,
    userContext: userContext,
    request: request
  });

  return await context.renderMarkdown();
}
```

## Integration Points

### With RenderingManager
WikiContext accesses the parser through RenderingManager:
```javascript
// Get parser from RenderingManager
const parser = context.renderingManager?.getParser?.();

if (parser) {
  const html = await parser.parse(content, context.toParseOptions());
}
```

### With VariableManager
WikiContext provides access to VariableManager:
```javascript
// Access VariableManager directly
const variableManager = context.variableManager;

if (variableManager) {
  // Manager handles [{$pagename}], [{$username}], [{$totalpages}], etc.
  const expanded = variableManager.expandVariables(
    content,
    context.toParseOptions().pageContext
  );
}
```

### With PluginManager
WikiContext provides access to PluginManager:
```javascript
// Access PluginManager directly
const pluginManager = context.pluginManager;

if (pluginManager) {
  // Check if plugin exists
  const hasPlugin = pluginManager.hasPlugin('TableOfContents');
}
```

### With PageManager
WikiContext provides access to PageManager:
```javascript
// Access PageManager directly
const pageManager = context.pageManager;

if (pageManager) {
  const metadata = await pageManager.getPageMetadata(context.pageName);
}
```

### With ACLManager
WikiContext provides access to ACLManager:
```javascript
// Access ACLManager directly
const aclManager = context.aclManager;

if (aclManager) {
  const canView = await aclManager.checkPermission(
    context.userContext,
    context.pageName,
    'view'
  );
}
```

## Error Handling

WikiContext implements comprehensive error handling:

1. **Manager Unavailability**: Graceful fallback when managers aren't available
2. **Plugin Errors**: Isolated error handling for individual plugin failures
3. **Processing Errors**: Fallback to basic markdown conversion on pipeline failures
4. **Logging**: Detailed error logging for debugging and monitoring

## API Reference

### Constructor

```javascript
new WikiContext(engine, options)
```

**Parameters:**
- `engine` (WikiEngine) - Required. The wiki engine instance
- `options` (Object) - Configuration options
  - `context` (string) - Context type: 'view', 'edit', 'preview', 'diff', 'info', 'none'
  - `pageName` (string) - Name of the page
  - `content` (string) - Page content (markdown)
  - `userContext` (Object) - User session/authentication info
  - `request` (Object) - Express request object
  - `response` (Object) - Express response object

**Throws:**
- `Error` if engine is not provided

### Context Constants

```javascript
WikiContext.CONTEXT = {
  VIEW: 'view',
  EDIT: 'edit',
  PREVIEW: 'preview',
  DIFF: 'diff',
  INFO: 'info',
  NONE: 'none'
};
```

### Methods

#### getContext()

Returns the current rendering context type.

```javascript
const contextType = context.getContext();
// Returns: 'view', 'edit', 'preview', 'diff', 'info', or 'none'
```

#### renderMarkdown(content)

Renders markdown content through the rendering pipeline.

```javascript
async renderMarkdown(content = this.content): Promise<string>
```

**Parameters:**
- `content` (string, optional) - Content to render. Defaults to `this.content`

**Returns:**
- `Promise<string>` - Rendered HTML

**Behavior:**
1. Tries to use MarkupParser from RenderingManager (primary)
2. Falls back to Showdown with VariableManager if parser unavailable
3. Logs rendering process and result

#### toParseOptions()

Creates options object for MarkupParser.

```javascript
toParseOptions(): Object
```

**Returns:**
```javascript
{
  pageContext: {
    pageName: string,
    userContext: Object,
    requestInfo: {
      acceptLanguage: string,
      userAgent: string,
      clientIp: string,
      referer: string,
      sessionId: string
    }
  },
  engine: WikiEngine
}
```

### Properties

#### Manager References

```javascript
context.pageManager        // PageManager instance
context.renderingManager   // RenderingManager instance
context.pluginManager      // PluginManager instance
context.variableManager    // VariableManager instance
context.aclManager         // ACLManager instance
```

#### Context Properties

```javascript
context.engine       // WikiEngine instance
context.context      // Context type ('view', 'edit', etc.)
context.pageName     // Page name
context.content      // Page content
context.userContext  // User session info
context.request      // Express request
context.response     // Express response
```

## Performance Considerations

### Creation Overhead
WikiContext creation is very fast (~0.5ms) and designed for per-request instantiation.

### Memory Footprint
- Small memory footprint (~2KB per instance)
- Stores references to managers, not copies
- No caching of rendered content

### Caching Integration
WikiContext integrates with the existing caching infrastructure through the managers it provides access to.

### Memory Management
WikiContext is designed to be lightweight and can be created per-request without significant overhead.

## Testing

WikiContext includes comprehensive test coverage:
- Unit tests for all public methods
- Integration tests with mock managers
- Performance metric validation
- Error handling verification

Run WikiContext tests:
```bash
npm test src/context/__tests__/WikiContext.test.js
```

## JSPWiki Compatibility

WikiContext maintains compatibility with JSPWiki patterns:

1. **TranslatorReader Pattern**: Sequential processing phases
2. **Manager Architecture**: Delegation to specialized managers  
3. **Context Encapsulation**: All request/page context in one object
4. **Variable Syntax**: `[{$variable}]` format
5. **Plugin Syntax**: `[{PluginName param='value'}]` format
6. **Link Syntax**: `[PageName]` and `[Display|Target]` formats

## Future Extensions

WikiContext is designed to support future enhancements:

- **Session Variables**: `[{$username}]` based on user sessions
- **InterWiki Links**: Links to external wiki systems  
- **Content Filters**: Pre/post-processing filters
- **Custom Variables**: User-defined variable types
- **Plugin Parameters**: Enhanced parameter parsing
- **Caching Strategies**: Context-aware caching

## Related Classes

- **ParseContext**: Lower-level parsing context for MarkupParser
- **BaseManager**: Base class for all managers
- **RenderingManager**: Handles markdown rendering and link processing
- **VariableManager**: Manages system and user variables
- **PluginManager**: Handles plugin registration and execution

## Configuration

WikiContext behavior can be configured through the WikiEngine configuration:

```javascript
const engine = new WikiEngine();
await engine.initialize({
  // Manager configurations affect WikiContext behavior
  managers: {
    VariableManager: { enabled: true },
    PluginManager: { enabled: true },
    RenderingManager: { enabled: true }
  }
});
```

WikiContext automatically adapts based on which managers are available and enabled.