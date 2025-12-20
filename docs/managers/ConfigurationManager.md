# ConfigurationManager

**Module:** `src/managers/ConfigurationManager.js`
**Complete Guide:** [ConfigurationManager-Complete-Guide.md](ConfigurationManager-Complete-Guide.md)

---

## Overview

ConfigurationManager provides JSPWiki-compatible configuration management with a hierarchical merge system. Configuration is loaded from multiple sources with later sources overriding earlier ones.

## Key Features

- **Three-Tier Configuration** - Default, environment-specific, and custom overrides
- **Property Merging** - Custom properties override defaults automatically
- **Environment Variables** - Docker/Traefik deployment support
- **Runtime Updates** - Change configuration via admin interface
- **Convenience Methods** - Type-safe getters for common settings
- **Backup/Restore** - Full configuration backup support

## Configuration Merge Order

```
1. app-default-config.json     (base defaults - required)
2. app-{environment}-config.json (environment-specific - optional)
3. app-custom-config.json      (local overrides - optional)
```

## Quick Example

```javascript
const configManager = engine.getManager('ConfigurationManager');

// Convenience methods
const appName = configManager.getApplicationName();
const port = configManager.getServerPort();
const baseURL = configManager.getBaseURL();

// Direct property access with default
const customSetting = configManager.getProperty('amdwiki.myfeature.enabled', true);

// Set custom property (persisted to app-custom-config.json)
await configManager.setProperty('amdwiki.applicationName', 'My Wiki');
```

## Core Methods

| Method | Returns | Description |
|--------|---------|-------------|
| `getProperty(key, default)` | `any` | Get property with optional default |
| `setProperty(key, value)` | `Promise<void>` | Set and persist custom property |
| `getAllProperties()` | `Object` | Get all merged properties |
| `getCustomProperties()` | `Object` | Get only custom overrides |
| `getDefaultProperties()` | `Object` | Get default values |
| `resetToDefaults()` | `Promise<void>` | Clear all custom properties |

## Convenience Methods

| Method | Returns | Config Key |
|--------|---------|------------|
| `getApplicationName()` | `string` | `amdwiki.applicationName` |
| `getBaseURL()` | `string` | `amdwiki.baseURL` |
| `getFrontPage()` | `string` | `amdwiki.frontPage` |
| `getServerPort()` | `number` | `amdwiki.server.port` |
| `getServerHost()` | `string` | `amdwiki.server.host` |
| `getSessionSecret()` | `string` | `amdwiki.session.secret` |
| `getSessionMaxAge()` | `number` | `amdwiki.session.maxAge` |

## Specialized Config Methods

| Method | Returns | Description |
|--------|---------|-------------|
| `getManagerConfig(name)` | `Object` | Manager-specific settings |
| `getFeatureConfig(name)` | `Object` | Feature toggle and settings |
| `getLoggingConfig()` | `Object` | Logging configuration |
| `getSearchConfig()` | `Object` | Search configuration |
| `getAccessControlConfig()` | `Object` | ACL and business hours |
| `getAuditConfig()` | `Object` | Audit logging settings |
| `getRSSConfig()` | `Object` | RSS feed configuration |

## Configuration Files

| File | Purpose | Edit? |
|------|---------|-------|
| `config/app-default-config.json` | Base defaults | No |
| `config/app-{env}-config.json` | Environment-specific | Optional |
| `config/app-custom-config.json` | Local overrides | Yes |

## Environment Variable Overrides

For Docker/Traefik deployments:

| Variable | Config Key |
|----------|------------|
| `AMDWIKI_BASE_URL` | `amdwiki.baseURL` |
| `AMDWIKI_HOSTNAME` | `amdwiki.hostname` |
| `AMDWIKI_HOST` | `amdwiki.server.host` |
| `AMDWIKI_PORT` | `amdwiki.server.port` |

## Admin Interface

Access `/admin/configuration` with admin privileges to:
- View all active configuration
- Edit custom overrides
- Reset properties to defaults
- Add new custom properties

## Testing

```bash
# Test configuration values
node scripts/configurationmanage-get-config.js amdwiki.notifications.dir
node scripts/configurationmanage-get-config.js amdwiki.notifications --prefix --pretty
```

## Related Managers

- [BaseManager](BaseManager.md) - Base manager class
- All managers depend on ConfigurationManager for settings

## Developer Documentation

For complete property reference, admin interface details, and troubleshooting:
- [ConfigurationManager-Complete-Guide.md](ConfigurationManager-Complete-Guide.md)
