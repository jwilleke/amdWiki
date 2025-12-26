# amdWiki System Managers Overview

## Overview

amdWiki follows a modular manager pattern where each manager handles a specific aspect of the wiki's functionality. All managers extend the `BaseManager` class and are registered with the `WikiEngine` during initialization.

## Core Managers (18 total)

### Content & Page Management

- **PageManager** - Handles page storage, retrieval, and metadata management
- **AttachmentManager** - Manages file attachments for pages
- **ExportManager** - Handles page export functionality

### User & Authentication

- **UserManager** - Manages user authentication, sessions, and roles
- **ACLManager** - Access Control List system for page permissions

### Content Processing

- **RenderingManager** - Processes Markdown and JSPWiki syntax
- **PluginManager** - Manages and executes wiki plugins
- **TemplateManager** - Handles EJS templates and theming

### Search & Discovery

- **SearchManager** - Full-text search using Lunr.js
- **SchemaManager** - Manages Schema.org structured data

### Policy & Security

- **PolicyManager** - Loads and manages access policies
- **PolicyEvaluator** - Evaluates policy-based access control
- **PolicyValidator** - Validates policy configurations
- **AuditManager** - Logs access decisions and security events

### Configuration & Variables

- **ConfigurationManager** - JSPWiki-compatible configuration management with property merging
- **VariableManager** - System and contextual variable expansion similar to JSPWiki's DefaultVariableManager

### System & Validation

- **ValidationManager** - Validates page metadata and content
- **NotificationManager** - Handles system notifications

## Manager Initialization Order

Managers are initialized in dependency order to ensure proper system startup:

1. **ValidationManager** - First, as other managers may need validation
2. **PageManager** - Core content management
3. **PluginManager** - Plugin system initialization
4. **RenderingManager** - Content processing (depends on PageManager)
5. **SearchManager** - Search indexing (depends on PageManager)
6. **TemplateManager** - UI templates
7. **AttachmentManager** - File attachments
8. **ExportManager** - Export functionality
9. **UserManager** - User authentication and sessions
10. **ACLManager** - Access control (depends on UserManager)
11. **PolicyManager** - Policy loading
12. **PolicyEvaluator** - Policy evaluation
13. **PolicyValidator** - Policy validation
14. **AuditManager** - Security auditing
15. **NotificationManager** - System notifications
16. **SchemaManager** - Structured data management

## Manager Architecture

### BaseManager Pattern

All managers extend `BaseManager.js` which provides:

- Common initialization lifecycle
- Engine reference management
- Error handling patterns
- Configuration access

### Registration Pattern

```javascript
// In WikiEngine.js
this.registerManager('ManagerName', new ManagerName(this));
await manager.initialize(config);
```

### Dependency Injection

Managers access each other through the engine:

```javascript
const userManager = this.engine.getManager('UserManager');
```

## File Structure

```bash
src/managers/
├── ACLManager.js
├── AttachmentManager.js
├── AuditManager.js
├── BaseManager.js          # Abstract base class
├── ExportManager.js
├── NotificationManager.js
├── PageManager.js
├── PluginManager.js
├── PolicyEvaluator.js
├── PolicyManager.js
├── PolicyValidator.js
├── RenderingManager.js
├── SchemaManager.js
├── SearchManager.js
├── TemplateManager.js
├── UserManager.js
└── ValidationManager.js
```

## Key Design Principles

1. **Single Responsibility** - Each manager handles one specific aspect
2. **Dependency Management** - Clear initialization order prevents circular dependencies
3. **Extensibility** - Plugin system allows custom manager extensions
4. **Testability** - Modular design enables isolated unit testing
5. **Configuration-Driven** - Manager behavior controlled by Config.js

## Integration Points

- **WikiEngine** - Central orchestrator that manages all managers
- **Config.js** - Provides configuration to all managers
- **Routes** - HTTP endpoints access managers through WikiEngine
- **Plugins** - Can extend or modify manager behavior
- **Audit System** - Tracks manager operations for security and debugging

This modular architecture ensures maintainability, testability, and extensibility of the amdWiki system.
