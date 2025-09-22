# WikiContext - Centralized Rendering Context

WikiContext is the central orchestrator for wiki content rendering in amdWiki, following JSPWiki's architecture patterns. It replaces inline regex processing with a modular, manager-based approach.

## Overview

WikiContext encapsulates the rendering pipeline and provides access to various managers (VariableManager, PluginManager, RenderingManager) through a unified interface. It follows the JSPWiki TranslatorReader pattern: **variables → plugins → links → HTML**.

## Architecture

```
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

### 1. Modular Processing Pipeline
- **Phase 1**: Variable expansion (`[{$pagename}]` → actual page name)
- **Phase 2**: Plugin execution (`[{ReferringPagesPlugin}]` → plugin output)
- **Phase 3**: Wiki link processing (`[PageName]` → HTML links)
- **Phase 4**: Markdown to HTML conversion

### 2. Performance Tracking
WikiContext tracks timing for each phase:
```javascript
const performance = context.getPerformanceSummary();
// Returns: { totalTime, variableTime, pluginTime, linkTime, markdownTime }
```

### 3. Fallback Handling
- Graceful degradation when managers are unavailable
- Fallback to basic rendering for essential functionality
- Error handling with detailed logging

## Usage

### Basic Usage

```javascript
const WikiContext = require('./src/context/WikiContext');

// Create context
const context = new WikiContext(engine, {
  pageName: 'MyPage',
  userContext: { isAuthenticated: true, roles: ['user'] },
  requestInfo: { userAgent: 'browser' }
});

// Render content
const html = await context.renderMarkdown(
  'Welcome to [{$pagename}]! See [{ReferringPagesPlugin}] and [MainPage].',
  'MyPage',
  userContext,
  requestInfo
);
```

### Advanced Usage

```javascript
// Clone context for sub-processing
const subContext = context.clone({ pageName: 'SubPage' });

// Set custom variables
context.setVariable('customVar', 'customValue');

// Set metadata
context.setMetadata('processingMode', 'advanced');

// Get performance metrics
const metrics = context.getPerformanceSummary();
console.log(`Rendering took ${metrics.totalTime}ms`);
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
async function renderMarkdown(content, pageName, userContext = null, requestInfo = null) {
  const context = new WikiContext(wikiEngine, {
    pageName: pageName,
    userContext: userContext,
    requestInfo: requestInfo,
    linkGraph: linkGraph
  });
  
  return await context.renderMarkdown(content, pageName, userContext, requestInfo);
}
```

## Integration Points

### With VariableManager
WikiContext delegates variable expansion to VariableManager:
```javascript
// Handles [{$pagename}], [{$username}], [{$totalpages}], etc.
const expandedContent = await context.expandVariables(content);
```

### With PluginManager  
WikiContext delegates plugin execution to PluginManager:
```javascript
// Handles [{ReferringPagesPlugin}], [{TotalPagesPlugin}], etc.
const pluginProcessedContent = await context.expandPlugins(content);
```

### With RenderingManager
WikiContext delegates link processing to RenderingManager:
```javascript
// Handles [PageName], [Display|Target], [External|http://example.com], etc.
const linkedContent = await context.expandWikiLinks(content);
```

## Error Handling

WikiContext implements comprehensive error handling:

1. **Manager Unavailability**: Graceful fallback when managers aren't available
2. **Plugin Errors**: Isolated error handling for individual plugin failures
3. **Processing Errors**: Fallback to basic markdown conversion on pipeline failures
4. **Logging**: Detailed error logging for debugging and monitoring

## Performance Considerations

### Timing Tracking
Each phase is timed separately:
- Variable expansion time
- Plugin execution time  
- Link processing time
- Markdown conversion time
- Total processing time

### Caching Integration
WikiContext integrates with the existing caching infrastructure through the managers it delegates to.

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