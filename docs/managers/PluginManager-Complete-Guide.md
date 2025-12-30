# PluginManager Complete Guide

**Module:** `src/managers/PluginManager.js`
**Quick Reference:** [PluginManager.md](PluginManager.md)
**Generated API:** [API Docs](../api/generated/src/managers/PluginManager/README.md)

---

## Table of Contents

1. [Architecture](#architecture)
2. [Initialization](#initialization)
3. [Configuration](#configuration)
4. [Plugin Discovery](#plugin-discovery)
5. [Plugin Execution](#plugin-execution)
6. [Plugin Lookup](#plugin-lookup)
7. [Security](#security)
8. [API Reference](#api-reference)
9. [Creating Plugins](#creating-plugins)

---

## Architecture

```text
┌─────────────────────────────────────────────────────────┐
│                    PluginManager                         │
│  - registerPlugins()                                     │
│  - loadPlugin(path)                                      │
│  - execute(name, pageName, params, context)             │
│  - findPlugin(name)                                      │
└────────────────┬────────────────────────────────────────┘
                 │
         ┌───────┼───────┐
         ▼       ▼       ▼
┌─────────────┐ ┌──────────────┐ ┌──────────────┐
│ ConfigMgr   │ │ plugins/     │ │ WikiContext  │
│ (paths)     │ │ (files)      │ │ (execution)  │
└─────────────┘ └──────────────┘ └──────────────┘
```

### Properties

| Property | Type | Description |
| ---------- | ------ | ------------- |
| `plugins` | `Map<string, Object>` | Registered plugins by name |
| `searchPaths` | `string[]` | Directories to search for plugins |
| `allowedRoots` | `string[]` | Validated root paths for security |

---

## Initialization

```javascript
async initialize(config = {}) {
  await super.initialize(config);
  await this.registerPlugins();
}
```

During initialization:

1. Gets search paths from ConfigurationManager
2. Validates each path exists and is a directory
3. Scans for `.js` files (excluding `.test.js`)
4. Loads and registers each valid plugin

---

## Configuration

Plugin search paths come from ConfigurationManager:

```json
{
  "amdwiki.managers.pluginManager.searchPaths": ["./plugins"]
}
```

| Property | Type | Description |
| ---------- | ------ | --------- |
| `amdwiki.managers.pluginManager.searchPaths` | string[] \| string | Directories to search for plugins |

**Note:** No hardcoded fallbacks. If not configured, no plugins are loaded.

---

## Plugin Discovery

### registerPlugins()

Discover and register all plugins from configured paths.

```javascript
async registerPlugins()
```

**Process:**

1. Get search paths from ConfigurationManager
2. Accept array or comma-separated string
3. Resolve and validate each path
4. Use `fs.realpath()` for symlink resolution
5. Enumerate `.js` files (excluding `.test.js`)
6. Call `loadPlugin()` for each file

---

### loadPlugin(pluginPath)

Load a single plugin from a validated path.

```javascript
async loadPlugin(pluginPath)
```

**Parameters:**

- `pluginPath` - Path to the plugin file

**Security checks:**

- Resolves canonical path via `fs.realpath()`
- Verifies path is within allowed roots
- Blocks plugins outside allowed directories

**Plugin loading:**

- Uses `require()` to load the module
- Supports both default exports and named exports
- Calls `plugin.initialize(engine)` if available
- Stores in `plugins` Map by name

---

## Plugin Execution

### execute(pluginName, pageName, params, context)

Execute a plugin and return its output.

```javascript
async execute(pluginName, pageName, params, context = {})
```

**Parameters:**

| Parameter | Type | Description |
| ----------- | ------ | ------------- |
| `pluginName` | string | Name of the plugin |
| `pageName` | string | Current page name |
| `params` | Object | Parsed plugin parameters |
| `context` | Object | Additional context (WikiContext) |

**Returns:** `string` - Plugin output (HTML or text)

**Execution flow:**

1. Find plugin using `findPlugin()`
2. Build context with engine, pageName, linkGraph
3. If plugin has `execute()` method, call it
4. If plugin is a function, call it directly
5. Return result or error message

**Example:**

```javascript
const result = await pluginManager.execute(
  'CurrentTime',
  'MainPage',
  { format: 'YYYY-MM-DD HH:mm' },
  wikiContext
);
```

---

## Plugin Lookup

### findPlugin(pluginName)

Find a plugin by name with JSPWiki-style name resolution.

```javascript
findPlugin(pluginName)
```

**Parameters:**

- `pluginName` - Name to search for

**Returns:** `Object|null` - Plugin object or null

**Resolution order:**

1. Exact match (case-sensitive)
2. Case-insensitive match
3. With "Plugin" suffix added (e.g., "Search" → "SearchPlugin")
4. Without "Plugin" suffix (e.g., "SearchPlugin" → "Search")

**Examples:**

```javascript
// All of these find SearchPlugin:
pluginManager.findPlugin('SearchPlugin');    // Exact
pluginManager.findPlugin('searchplugin');    // Case-insensitive
pluginManager.findPlugin('Search');          // Without suffix
pluginManager.findPlugin('search');          // Case-insensitive without suffix
```

---

### hasPlugin(pluginName)

Check if a plugin exists.

```javascript
hasPlugin(pluginName)
```

**Returns:** `boolean`

---

### getPluginNames()

Get all registered plugin names.

```javascript
getPluginNames()
```

**Returns:** `Array<string>`

---

### getPluginInfo(pluginName)

Get plugin metadata.

```javascript
getPluginInfo(pluginName)
```

**Returns:**

```javascript
{
  name: 'SearchPlugin',
  description: 'Search wiki pages',
  author: 'amdWiki',
  version: '1.0.0'
}
```

---

## Security

### Path Validation

PluginManager implements strict path validation:

1. **Allowed roots only:** Only paths from config are allowed
2. **Canonical paths:** Uses `fs.realpath()` to resolve symlinks
3. **Prefix checking:** File path must start with allowed root + separator
4. **No traversal:** Prevents `../` attacks via canonical resolution

**Example attack prevention:**

```javascript
// This would be blocked:
await pluginManager.loadPlugin('../../../etc/malicious.js');
// Error: blocked plugin outside allowed roots
```

### Plugin Sandboxing

- Plugins run in same Node.js process (no VM isolation)
- Trust plugins from your configured paths
- Review third-party plugins before installation

---

## API Reference

### Discovery Methods

| Method | Parameters | Returns |
| -------- | ------------ | --------- |
| `registerPlugins()` | - | `Promise<void>` |
| `loadPlugin(pluginPath)` | string | `Promise<void>` |

### Execution Methods

| Method | Parameters | Returns |
| -------- | ------------ | --------- |
| `execute(name, page, params, ctx)` | string, string, Object, Object | `Promise<string>` |

### Query Methods

| Method | Parameters | Returns |
| -------- | ------------ | --------- |
| `findPlugin(name)` | string | `Object\|null` |
| `hasPlugin(name)` | string | `boolean` |
| `getPluginNames()` | - | `string[]` |
| `getPluginInfo(name)` | string | `Object\|null` |

---

## Creating Plugins

### Class-Style Plugin (Recommended)

```javascript
// plugins/MyPlugin.js
class MyPlugin {
  static name = 'MyPlugin';
  static description = 'Does something useful';
  static author = 'Your Name';
  static version = '1.0.0';

  static async initialize(engine) {
    // Optional: access engine during init
  }

  static async execute(context, params) {
    const { engine, pageName, linkGraph } = context;
    const { param1, param2 } = params;

    // Your plugin logic here
    return `<div>Plugin output for ${pageName}</div>`;
  }
}

module.exports = MyPlugin;
```

### Function-Style Plugin (Legacy)

```javascript
// plugins/SimplePlugin.js
async function SimplePlugin(pageName, params, linkGraph) {
  return `Hello from ${pageName}!`;
}

SimplePlugin.name = 'SimplePlugin';
SimplePlugin.description = 'A simple plugin';

module.exports = SimplePlugin;
```

### Plugin Parameters

Parameters are parsed from wiki syntax and passed as an object:

**Wiki syntax:**

```wiki
[{MyPlugin foo='bar' count=5 enabled=true}]
```

**Received params:**

```javascript
{
  foo: 'bar',
  count: 5,
  enabled: true
}
```

### Plugin Context

The `context` object contains:

| Property | Type | Description |
| ---------- | ------ | ------------- |
| `engine` | WikiEngine | Wiki engine instance |
| `pageName` | string | Current page name |
| `linkGraph` | Object | Page link graph |
| (spread) | various | All WikiContext properties |

---

## Notes

- **No hardcoded paths:** All search paths must be configured
- **Case-insensitive:** Plugin names resolved case-insensitively
- **JSPWiki compatible:** Supports `Search` or `SearchPlugin` naming
- **Async execution:** All plugin execution is async

---

## Related Documentation

- [PluginManager.md](PluginManager.md) - Quick reference
- [Plugin Development](../plugins/) - Plugin guides
- [DOMPluginHandler](../parsers/DOMPluginHandler.md) - Syntax parsing
- [Built-in Plugins](../plugins/) - Available plugins
