---
title: Legacy Configuration Files Cleanup
uuid: legacy-config-cleanup
category: documentation
user-keywords: [cleanup, legacy, configuration]
lastModified: 2025-10-08
---

# Legacy Configuration Files Cleanup

## Overview

During the migration to the unified ConfigurationManager pattern, several legacy configuration files and loaders have been identified that are no longer needed.

## Files to Review for Removal

### 1. config/access-policies.json (LEGACY)

**Status**: Policies migrated to `config/app-default-config.json`

**Migration Details**:
- Policies now live in `config/app-default-config.json` starting at line 816
- Key: `amdwiki.access.policies` (array of policy objects)
- PolicyManager loads policies via ConfigurationManager
- Migration script: `scripts/merge-access-policies-into-config.js`

**References to Update/Remove**:
- `config/Config.js:148` - Still references `./config/access-policies.json`
- `config/ConfigBridge.js` - May have references
- `docs/admin/policy-management-guide.md` - Documentation may reference old file

**Action Required**:
- ✅ Policies are already in app-default-config.json
- ⚠️ Legacy file can be safely removed after verification
- 📝 Update documentation to reference ConfigurationManager pattern

### 2. config/Config.js (LEGACY LOADER)

**Status**: Being replaced by ConfigurationManager

**Issues**:
- Direct file system access (violates ConfigurationManager pattern)
- Hard-coded paths
- Separate loading of policies file
- Not following the architecture mandate

**Current Usage**:
- `config/ConfigBridge.js` - Provides backward compatibility
- Some legacy code may still use it

**Migration Path**:
- All new code must use ConfigurationManager
- Pattern: `configManager.getProperty('key', 'default')`
- No direct require of Config.js or config files

**Action Required**:
- 🔍 Audit codebase for direct Config.js usage
- 🔄 Replace with ConfigurationManager calls
- 🗑️ Eventually remove after all code migrated

### 3. config/ConfigBridge.js (COMPATIBILITY LAYER)

**Status**: Temporary bridge during migration

**Purpose**:
- Provides compatibility during transition
- Wraps legacy Config.js

**Action Required**:
- ⏰ Remove after all code uses ConfigurationManager directly
- Should not be used in new code

## Verification Steps

### Check if access-policies.json is still needed:

```bash
# Search for direct reads of access-policies.json
grep -r "access-policies.json" src/

# Verify policies are in app-default-config.json
grep -A5 "amdwiki.access.policies" config/app-default-config.json

# Check PolicyManager loads from ConfigurationManager
grep -A10 "initialize" src/managers/PolicyManager.js
```

### Check if Config.js is still used:

```bash
# Find direct Config.js imports
grep -r "require.*Config.js" src/

# Find direct config file reads
grep -r "readJson.*config/" src/
```

## Correct Pattern (Current Architecture)

### ✅ DO THIS - Use ConfigurationManager

```javascript
const configManager = this.engine.getManager('ConfigurationManager');

// Get any configuration value
const policies = configManager.getProperty('amdwiki.access.policies', []);
const pagesDir = configManager.getProperty('amdwiki.directories.pages', './pages');
const providerName = configManager.getProperty('amdwiki.pageProvider', 'FileSystemProvider');
```

### ❌ DON'T DO THIS - Direct Config Access

```javascript
// WRONG - Don't do this
const Config = require('../config/Config');
const config = new Config();

// WRONG - Don't do this
const policies = require('../config/access-policies.json');

// WRONG - Don't do this
const defaultConfig = require('../config/app-default-config.json');
```

## Benefits of Cleanup

1. **Single Source of Truth**: All config in app-default-config.json
2. **ConfigurationManager Pattern**: Enforced throughout codebase
3. **Validation**: ConfigurationManager validates all values
4. **Merging**: Automatic merge of default + environment + custom
5. **Testing**: Easy to mock ConfigurationManager
6. **Maintainability**: One place to manage configuration

## Current Status (2025-10-08)

### ✅ Completed
- PolicyManager uses ConfigurationManager
- PageManager uses ConfigurationManager (via FileSystemProvider)
- VariableManager uses ConfigurationManager
- All managers follow ConfigurationManager pattern

### ⚠️ Pending Review
- `config/access-policies.json` - Can likely be removed
- `config/Config.js` - Legacy, needs usage audit
- `config/ConfigBridge.js` - Compatibility shim, remove after migration

### 📋 TODO
- [ ] Audit all remaining Config.js usage in src/
- [ ] Update documentation to remove access-policies.json references
- [ ] Archive or delete legacy config files
- [ ] Remove ConfigBridge.js after migration complete

## Related Documentation

- [FileSystemProvider-Design.md](FileSystemProvider-Design.md) - Provider pattern with mandatory ConfigurationManager
- [.github/copilot-instructions.md](../../.github/copilot-instructions.md#L90-L96) - Configuration access pattern
- [docs/admin/policy-management-guide.md](../admin/policy-management-guide.md) - Policy management (may need update)

## Recommendations

1. **Keep app-default-config.json as master** - All configuration should live here
2. **Remove access-policies.json** - After verifying no production dependencies
3. **Deprecate Config.js** - Add deprecation warning, migrate remaining usage
4. **Remove ConfigBridge.js** - After all code uses ConfigurationManager directly
5. **Update Documentation** - Remove all references to legacy config files

## Migration Command

If you need to re-merge policies (not recommended, they're already merged):

```bash
node scripts/merge-access-policies-into-config.js
```

**Note**: This script is kept for historical reference. The policies have already been successfully migrated.
