# PluginManager

**Module:** `src/managers/PluginManager.js`
**Extends:** [BaseManager](BaseManager.md)
**Complete Guide:** [PluginManager-Complete-Guide.md](PluginManager-Complete-Guide.md)

---

## Overview

PluginManager handles plugin discovery, registration, and execution. Similar to JSPWiki's PluginManager, it provides a plugin system for extending wiki functionality through custom plugins invoked from page content.

## Key Features

- Dynamic plugin discovery from configured search paths
- JSPWiki-style plugin naming (Search or SearchPlugin)
- Secure path validation (plugins only from allowed roots)
- Plugin metadata and information retrieval
- Support for both function-style and class-style plugins

## Quick Example

```javascript
const pluginManager = engine.getManager('PluginManager');

// Execute a plugin
const result = await pluginManager.execute('CurrentTime', 'MainPage', {
  format: 'YYYY-MM-DD'
}, context);

// Check if plugin exists
if (pluginManager.hasPlugin('Search')) {
  // Plugin is available
}

// List all plugins
const pluginNames = pluginManager.getPluginNames();
// ['CurrentTimePlugin', 'SearchPlugin', 'IndexPlugin', ...]
```

## Plugin Invocation Syntax

In wiki pages, plugins are invoked with:

```wiki
[{PluginName param1='value1' param2='value2'}]
```

Examples:

```wiki
[{CurrentTime format='HH:mm:ss'}]
[{Search query='wiki' max=10}]
[{ReferringPages before='* ' after='\n'}]
```

## Configuration

```json
{
  "amdwiki.managers.pluginManager.searchPaths": ["./plugins"]
}
```

## Related Documentation

- [Plugin Development Guide](../plugins/) - How to create plugins
- [DOMPluginHandler](../parsers/DOMPluginHandler.md) - Plugin syntax parsing
- [Generated API Docs](../api/generated/src/managers/PluginManager/README.md)
