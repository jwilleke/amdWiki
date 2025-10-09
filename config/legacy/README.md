# Legacy Configuration Files

**Archived Date**: 2025-10-08

## Overview

These files are **DEPRECATED** and have been archived. They are kept for historical reference only and should **NOT** be used in production code.

## Archived Files

### 1. access-policies.json (DEPRECATED)
**Replaced by**: `config/app-default-config.json` (key: `amdwiki.access.policies`)

**Migration**: Policies were successfully migrated using `scripts/merge-access-policies-into-config.js`

**Status**: ✅ Fully migrated, safe to delete
- All policies now in app-default-config.json (lines 816-1005)
- PolicyManager loads from ConfigurationManager
- No code references this file anymore

### 2. Config.js (DEPRECATED)
**Replaced by**: `src/managers/ConfigurationManager.js`

**Issues with old approach**:
- Direct file system access
- No validation
- Hard-coded paths
- Separate policy file loading
- Violates architecture patterns

**Status**: ✅ No longer used in src/ directory
- All managers use ConfigurationManager
- Mandatory pattern: `configManager.getProperty('key', 'default')`

### 3. ConfigBridge.js (DEPRECATED)
**Purpose**: Temporary compatibility shim during migration

**Status**: ✅ No longer needed
- No code in src/ uses this bridge
- Migration to ConfigurationManager complete

### 4. Config.js.backup
**Purpose**: Backup from previous refactoring

**Status**: Historical archive only

## Current Configuration Pattern

### ✅ Correct Pattern

```javascript
// In any manager or component
const configManager = this.engine.getManager('ConfigurationManager');

// Get configuration values
const policies = configManager.getProperty('amdwiki.access.policies', []);
const pagesDir = configManager.getProperty('amdwiki.directories.pages', './pages');
const provider = configManager.getProperty('amdwiki.pageProvider', 'FileSystemProvider');
```

### ❌ Old Pattern (DON'T USE)

```javascript
// DEPRECATED - Don't do this anymore!
const Config = require('./config/Config');
const config = new Config();

// DEPRECATED - Don't do this anymore!
const policies = require('./config/access-policies.json');
```

## Configuration Files (Current)

### Active Configuration Files

1. **config/app-default-config.json** - Master configuration with all defaults
2. **config/app-production-config.json** - Production overrides
3. **config/app-development-config.json** - Development overrides
4. **config/app-test-config.json** - Test environment overrides
5. **config/app-custom-config.json** - User customizations (not in git)

### Configuration Loading Order

```
app-default-config.json
  ↓ (overridden by)
app-{environment}-config.json
  ↓ (overridden by)
app-custom-config.json
```

## Benefits of New System

1. **Single Source of Truth**: All config in one place
2. **Validation**: ConfigurationManager validates all values
3. **Type Safety**: Strong typing for configuration values
4. **Merging**: Automatic environment + custom overrides
5. **Testing**: Easy to mock ConfigurationManager
6. **Documentation**: All config documented in one file

## Migration History

- **2024-09-14**: Policies migrated from access-policies.json to app-default-config.json
- **2024-09-18**: Config.js replaced by ConfigurationManager
- **2025-10-08**: FileSystemProvider pattern enforces ConfigurationManager usage
- **2025-10-08**: Legacy files archived to config/legacy/

## Related Documentation

- [docs/architecture/Legacy-Config-Files-Cleanup.md](../../docs/architecture/Legacy-Config-Files-Cleanup.md)
- [docs/architecture/FileSystemProvider-Design.md](../../docs/architecture/FileSystemProvider-Design.md)
- [.github/copilot-instructions.md](../../.github/copilot-instructions.md) - Configuration access pattern

## Safe to Delete?

**Yes**, these files can be safely deleted if you:

1. ✅ Have verified no custom scripts reference them
2. ✅ Have backed up to version control
3. ✅ Are confident in the migration

**However**, keeping them archived is recommended for:
- Historical reference
- Understanding migration path
- Emergency rollback (if needed)

## Questions?

See the [Configuration Management Documentation](../../docs/architecture/Legacy-Config-Files-Cleanup.md) for more details.
