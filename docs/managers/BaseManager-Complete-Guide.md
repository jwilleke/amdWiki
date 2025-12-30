# BaseManager Complete Guide

**Module:** `src/managers/BaseManager.js`
**Quick Reference:** [BaseManager.md](BaseManager.md)
**Generated API:** [API Docs](../api/generated/src/managers/BaseManager/README.md)

---

## Table of Contents

1. [Architecture](#architecture)
2. [Constructor](#constructor)
3. [Lifecycle Methods](#lifecycle-methods)
4. [State Methods](#state-methods)
5. [Backup and Restore](#backup-and-restore)
6. [API Reference](#api-reference)
7. [Creating a New Manager](#creating-a-new-manager)

---

## Architecture

```text
┌───────────────────────────────────────────────────────────┐
│                     WikiEngine                             │
│  - Creates and manages all managers                        │
│  - Calls initialize() on each manager                      │
└────────────────────────┬──────────────────────────────────┘
                         │
        ┌────────────────┼────────────────┐
        ▼                ▼                ▼
┌───────────────┐ ┌───────────────┐ ┌───────────────┐
│  BaseManager  │ │  BaseManager  │ │  BaseManager  │
│  (ACLManager) │ │ (PageManager) │ │ (UserManager) │
└───────────────┘ └───────────────┘ └───────────────┘
```

BaseManager provides:

- Standardized initialization pattern
- Engine reference management
- Lifecycle hooks for startup/shutdown
- Backup/restore interface for data persistence

---

## Constructor

```javascript
constructor(engine) {
  this.engine = engine;
  this.initialized = false;
}
```

**Parameters:**

- `engine` - WikiEngine instance that creates this manager

**Usage:**

```javascript
class MyManager extends BaseManager {
  constructor(engine) {
    super(engine);
    // Initialize instance variables
    this.myData = new Map();
    this.settings = {};
  }
}
```

---

## Lifecycle Methods

### initialize(config)

Called by WikiEngine during startup to initialize the manager.

```javascript
async initialize(config = {}) {
  this.config = config;
  this.initialized = true;
}
```

**Parameters:**

- `config` - Configuration object (optional)

**Returns:** `Promise<void>`

**Usage in subclass:**

```javascript
async initialize(config = {}) {
  await super.initialize(config);

  // Access other managers
  const configManager = this.engine.getManager('ConfigurationManager');

  // Load your configuration
  this.setting = configManager.getProperty('amdwiki.mymanager.setting', 'default');

  console.log('MyManager initialized');
}
```

**Important:** Always call `super.initialize(config)` first in overridden implementations.

---

### shutdown()

Called during graceful shutdown to cleanup resources.

```javascript
async shutdown() {
  this.initialized = false;
}
```

**Returns:** `Promise<void>`

**Usage in subclass:**

```javascript
async shutdown() {
  // Cleanup resources
  await this.saveState();
  await this.closeConnections();

  // Call super last
  await super.shutdown();
}
```

**Important:** Always call `super.shutdown()` at the end of overridden implementations.

---

## State Methods

### isInitialized()

Check if manager has been initialized.

```javascript
isInitialized() {
  return this.initialized;
}
```

**Returns:** `boolean`

**Usage:**

```javascript
const pageManager = engine.getManager('PageManager');
if (pageManager.isInitialized()) {
  const page = await pageManager.getPage('Main');
}
```

---

### getEngine()

Get the WikiEngine instance.

```javascript
getEngine() {
  return this.engine;
}
```

**Returns:** `WikiEngine`

**Usage:**

```javascript
// Access other managers from within a manager
const userManager = this.getEngine().getManager('UserManager');
const configManager = this.getEngine().getManager('ConfigurationManager');
```

---

## Backup and Restore

BaseManager provides backup/restore methods that MUST be overridden by managers with persistent data.

### backup()

Create a backup of manager state.

```javascript
async backup() {
  return {
    managerName: this.constructor.name,
    timestamp: new Date().toISOString(),
    data: null
  };
}
```

**Returns:** `Promise<Object>` with structure:

- `managerName` - Name of the manager class
- `timestamp` - ISO timestamp of backup
- `data` - Manager-specific backup data

**Override example:**

```javascript
async backup() {
  return {
    managerName: this.constructor.name,
    timestamp: new Date().toISOString(),
    data: {
      users: Array.from(this.users.values()),
      settings: this.settings
    }
  };
}
```

---

### restore(backupData)

Restore manager state from backup.

```javascript
async restore(backupData) {
  if (!backupData) {
    throw new Error(`${this.constructor.name}: No backup data provided for restore`);
  }
}
```

**Parameters:**

- `backupData` - Backup object from `backup()` method

**Returns:** `Promise<void>`

**Throws:** `Error` if backupData is missing

**Override example:**

```javascript
async restore(backupData) {
  if (!backupData || !backupData.data) {
    throw new Error('Invalid backup data');
  }

  this.users = new Map(backupData.data.users.map(u => [u.id, u]));
  this.settings = backupData.data.settings;
}
```

---

## API Reference

### Constructor

| Method | Parameters | Description |
| -------- | ------------ | ------------- |
| `constructor(engine)` | WikiEngine | Create manager with engine reference |

### Lifecycle Methods

| Method | Parameters | Returns | Description |
| -------- | ------------ | --------- | ------------- |
| `initialize(config)` | Object (optional) | `Promise<void>` | Initialize manager |
| `shutdown()` | - | `Promise<void>` | Shutdown manager |

### State Methods

| Method | Parameters | Returns | Description |
| -------- | ------------ | --------- | ------------- |
| `isInitialized()` | - | `boolean` | Check initialization state |
| `getEngine()` | - | `WikiEngine` | Get engine reference |

### Backup/Restore Methods

| Method | Parameters | Returns | Description |
| -------- | ------------ | --------- | ------------- |
| `backup()` | - | `Promise<Object>` | Create backup of manager data |
| `restore(backupData)` | Object | `Promise<void>` | Restore from backup |

---

## Creating a New Manager

### Step 1: Create the Manager Class

```javascript
const BaseManager = require('./BaseManager');

class MyManager extends BaseManager {
  constructor(engine) {
    super(engine);
    this.myData = new Map();
  }

  async initialize(config = {}) {
    await super.initialize(config);

    // Get configuration
    const configManager = this.engine.getManager('ConfigurationManager');
    this.setting = configManager.getProperty('amdwiki.mymanager.setting', 'default');

    console.log('MyManager initialized');
  }

  async shutdown() {
    await this.saveData();
    await super.shutdown();
  }

  // Your manager methods
  async doSomething(input) {
    // Implementation
  }
}

module.exports = MyManager;
```

### Step 2: Register in WikiEngine

Add the manager to `WikiEngine.js`:

```javascript
// In WikiEngine constructor or initialization
this.managers.set('MyManager', new MyManager(this));
```

### Step 3: Initialize Order

Ensure proper initialization order in WikiEngine if your manager depends on others:

```javascript
// ConfigurationManager must initialize first
await this.getManager('ConfigurationManager').initialize();

// Then other managers that depend on it
await this.getManager('MyManager').initialize();
```

---

## Notes

- **Abstract class:** BaseManager is meant to be extended, not used directly
- **Engine reference:** Always available via `this.engine` or `this.getEngine()`
- **Configuration:** Use ConfigurationManager for all configuration access
- **23 managers:** amdWiki has 23 specialized managers extending BaseManager

---

## Related Documentation

- [BaseManager.md](BaseManager.md) - Quick reference
- [MANAGERS-OVERVIEW.md](../architecture/MANAGERS-OVERVIEW.md) - All managers
- [WikiEngine](../WikiEngine.md) - Engine that creates managers
- [ConfigurationManager](ConfigurationManager.md) - Configuration access
