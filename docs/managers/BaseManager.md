# BaseManager

**Module:** `src/managers/BaseManager.js`
**Complete Guide:** [BaseManager-Complete-Guide.md](BaseManager-Complete-Guide.md)

---

## Overview

BaseManager is the abstract base class that all amdWiki managers extend. It provides common functionality for initialization, lifecycle management, and backup/restore operations following JSPWiki's modular manager pattern.

## Key Features

- Standard lifecycle: `initialize()` → use → `shutdown()`
- WikiEngine reference for accessing other managers
- Backup/restore interface for disaster recovery
- Initialization state tracking

## Quick Example

```javascript
const BaseManager = require('./BaseManager');

class MyManager extends BaseManager {
  constructor(engine) {
    super(engine);
    this.myData = new Map();
  }

  async initialize(config = {}) {
    await super.initialize(config);
    // Custom initialization
  }

  async shutdown() {
    this.myData.clear();
    await super.shutdown();
  }
}
```

## Core Methods

| Method | Description |
|--------|-------------|
| `constructor(engine)` | Receive WikiEngine reference |
| `initialize(config)` | Initialize the manager |
| `isInitialized()` | Check initialization state |
| `getEngine()` | Get WikiEngine reference |
| `shutdown()` | Clean shutdown |
| `backup()` | Backup manager data |
| `restore(backupData)` | Restore from backup |

## Properties

| Property | Type | Description |
|----------|------|-------------|
| `engine` | WikiEngine | Reference to wiki engine |
| `initialized` | boolean | True after initialize() |
| `config` | Object | Config passed to initialize() |

## Managers Extending BaseManager

All managers in `src/managers/` extend BaseManager:
- [ACLManager](ACLManager.md)
- [AttachmentManager](AttachmentManager.md)
- [AuditManager](AuditManager.md)
- [CacheManager](CacheManager.md)
- [ConfigurationManager](ConfigurationManager.md)
- [ExportManager](ExportManager.md)
- [NotificationManager](NotificationManager.md)
- [PageManager](PageManager.md)
- [PluginManager](PluginManager.md)
- [PolicyManager](PolicyManager.md)
- [RenderingManager](RenderingManager.md)
- [SchemaManager](SchemaManager.md)
- [SearchManager](SearchManager.md)
- [TemplateManager](TemplateManager.md)
- [UserManager](UserManager.md)
- [ValidationManager](ValidationManager.md)
- [VariableManager](VariableManager.md)

## Developer Documentation

For complete API reference and implementation patterns, see:
- [BaseManager-Complete-Guide.md](BaseManager-Complete-Guide.md)
- [Generated API Docs](../api/generated/src/managers/BaseManager/README.md)
