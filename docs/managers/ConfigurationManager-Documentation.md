# ConfigurationManager Documentation

## Overview

The ConfigurationManager provides JSPWiki-compatible configuration management for amdWiki. It implements a two-tier configuration system with default values and custom overrides, similar to JSPWiki's property management system.

## Architecture

The ConfigurationManager follows JSPWiki's configuration patterns:

- **Default Configuration**: `app-default-config.json` contains all default settings
- **Custom Overrides**: `app-custom-config.json` contains user customizations
- **Property Merging**: Custom properties override defaults with precedence handling
- **Runtime Access**: Provides getter methods for commonly used configuration values
- **Admin Interface**: Web-based configuration management with validation

## Configuration Files

### app-default-config.json

Contains all default configuration properties. This file should not be modified directly.

**Key sections:**

```json
{
  "amdwiki.applicationName": "amdWiki",
  "amdwiki.version": "1.3.2",
  "amdwiki.baseURL": "http://localhost:3000",
  "amdwiki.server.port": 3000,
  "amdwiki.server.host": "localhost",
  "amdwiki.session.secret": "amdwiki-session-secret-change-in-production",
  "amdwiki.session.maxAge": 86400000,
  "amdwiki.frontPage": "Welcome",
  "amdwiki.pageProvider": "FileSystemProvider",
  "amdwiki.searchProvider": "LuceneSearchProvider"
}
```

### app-custom-config.json

Contains custom overrides for default properties. This is the file to modify for customization.

**Example:**

```json
{
  "_comment": "This file overrides values from app-default-config.json",
  "amdwiki.applicationName": "My Custom Wiki",
  "amdwiki.baseURL": "https://wiki.mycompany.com",
  "amdwiki.server.port": 8080,
  "amdwiki.frontPage": "CustomHomePage"
}
```

## Property Naming Convention

All properties follow JSPWiki's naming convention:

- **Namespace prefix**: `amdwiki.` or `log4j.`
- **Hierarchical structure**: Use dots to separate levels
- **Descriptive names**: Clear, self-documenting property names

**Examples:**
- `amdwiki.server.port` - Server configuration
- `amdwiki.session.maxAge` - Session settings
- `amdwiki.rss.generate` - RSS feed settings
- `amdwiki.translatorReader.allowHTML` - Content processing

## API Reference

### ConfigurationManager Class

#### Core Methods

##### `initialize()`
Initializes the ConfigurationManager by loading and merging configuration files.

##### `getProperty(key, defaultValue = null)`
Gets a configuration property value with optional default.

**Parameters:**
- `key` (string): Property key (e.g., 'amdwiki.applicationName')
- `defaultValue` (any): Default value if property not found

**Returns:** any - Property value or default

##### `setProperty(key, value)`
Sets a custom configuration property (saves to app-custom-config.json).

**Parameters:**
- `key` (string): Property key
- `value` (any): Property value

##### `getAllProperties()`
Gets merged configuration properties (defaults + custom overrides).

**Returns:** object - Complete merged configuration

##### `getDefaultProperties()`
Gets default properties from app-default-config.json.

**Returns:** object - Default configuration properties

##### `getCustomProperties()`
Gets custom override properties from app-custom-config.json.

**Returns:** object - Custom configuration overrides

#### Convenience Methods

##### Application Settings

```javascript
getApplicationName()    // amdwiki.applicationName
getBaseURL()           // amdwiki.baseURL
getFrontPage()         // amdwiki.frontPage
getEncoding()          // amdwiki.encoding
```

##### Server Settings

```javascript
getServerPort()        // amdwiki.server.port (as number)
getServerHost()        // amdwiki.server.host
```

##### Session Settings

```javascript
getSessionSecret()     // amdwiki.session.secret
getSessionMaxAge()     // amdwiki.session.maxAge (as number)
getSessionSecure()     // amdwiki.session.secure (as boolean)
getSessionHttpOnly()   // amdwiki.session.httpOnly (as boolean)
```

##### RSS Settings

```javascript
getRSSConfig()         // Complete RSS configuration object
```

## Configuration Categories

### Application Configuration

**Core application settings:**

```json
{
  "amdwiki.applicationName": "amdWiki",
  "amdwiki.version": "1.3.2",
  "amdwiki.baseURL": "http://localhost:3000",
  "amdwiki.encoding": "UTF-8",
  "amdwiki.frontPage": "Welcome",
  "amdwiki.templateDir": "default"
}
```

### Server Configuration

**Server and network settings:**

```json
{
  "amdwiki.server.port": 3000,
  "amdwiki.server.host": "localhost",
  "amdwiki.session.secret": "amdwiki-session-secret-change-in-production",
  "amdwiki.session.maxAge": 86400000,
  "amdwiki.session.secure": false,
  "amdwiki.session.httpOnly": true
}
```

### Provider Configuration

**Data and service providers:**

```json
{
  "amdwiki.pageProvider": "FileSystemProvider",
  "amdwiki.attachment.provider": "BasicAttachmentProvider",
  "amdwiki.searchProvider": "LuceneSearchProvider",
  "amdwiki.diffProvider": "TraditionalDiffProvider",
  "amdwiki.userdatabase": "JSONUserDatabase",
  "amdwiki.groupdatabase": "JSONGroupDatabase"
}
```

### Feature Configuration

**Feature toggles and settings:**

```json
{
  "amdwiki.rss.generate": true,
  "amdwiki.rss.fileName": "rss.xml",
  "amdwiki.rss.interval": 3600,
  "amdwiki.translatorReader.allowHTML": false,
  "amdwiki.plugin.searchresult.showScore": true,
  "amdwiki.plugin.versioning.use": true
}
```

## Admin Interface

### Configuration Management Dashboard

Access at `/admin/configuration` with admin privileges.

**Features:**

#### Current Configuration Tab
- View all active configuration (merged defaults + custom)
- See source of each property (Default or Custom)
- Real-time configuration state

#### Custom Overrides Tab
- Edit existing custom properties
- Remove custom overrides
- Reset individual properties to defaults
- Bulk reset all properties

#### Default Values Tab
- Browse all default configuration values
- Read-only view of app-default-config.json
- Reference for available properties

#### Add Property Tab
- Add new custom configuration properties
- Property name validation
- Supports amdwiki.* and log4j.* prefixes

### Property Validation

The admin interface validates:
- **Property names** must start with `amdwiki.` or `log4j.`
- **Property values** are properly formatted
- **Duplicate properties** are handled correctly

## Integration Examples

### Using Configuration in Managers

```javascript
class MyManager extends BaseManager {
  async initialize() {
    const configManager = this.engine.getManager('ConfigurationManager');

    // Use convenience methods
    const appName = configManager.getApplicationName();
    const port = configManager.getServerPort();

    // Use direct property access
    const customSetting = configManager.getProperty('amdwiki.mymanager.enabled', true);
  }
}
```

### Runtime Configuration Updates

```javascript
// Update server configuration
const configManager = engine.getManager('ConfigurationManager');
await configManager.setProperty('amdwiki.server.port', 8080);

// Configuration is automatically saved to app-custom-config.json
```

### Application Startup

```javascript
// app.js integration
async function initializeWikiEngine() {
  const engine = new WikiEngine();
  await engine.initialize();

  // Get configured values
  const configManager = engine.getManager('ConfigurationManager');
  const port = configManager.getServerPort();
  const baseURL = configManager.getBaseURL();

  console.log(`🔧 Using configured port: ${port}`);
  console.log(`🔧 Using configured baseURL: ${baseURL}`);
}
```

## Environment-Specific Configuration

### Development

```json
{
  "amdwiki.server.port": 3000,
  "amdwiki.baseURL": "http://localhost:3000",
  "amdwiki.session.secure": false
}
```

### Production

```json
{
  "amdwiki.server.port": 80,
  "amdwiki.baseURL": "https://wiki.mycompany.com",
  "amdwiki.session.secure": true,
  "amdwiki.session.secret": "production-secret-key-change-this"
}
```

## Property Migration

When adding new configuration properties:

1. **Add to app-default-config.json** with sensible defaults
2. **Update ConfigurationManager** with getter method if commonly used
3. **Document the property** in this documentation
4. **Update admin interface** if UI changes needed

## Security Considerations

### Session Security

**Important session-related properties:**

```json
{
  "amdwiki.session.secret": "change-in-production",
  "amdwiki.session.secure": true,    // HTTPS only
  "amdwiki.session.httpOnly": true,  // No JavaScript access
  "amdwiki.session.maxAge": 86400000 // 24 hours
}
```

### Access Control

- Configuration management requires admin privileges
- Property validation prevents unauthorized settings
- Sensitive properties should be documented as security-critical

## Performance

### Configuration Loading

- Configuration loaded once at startup
- Changes require restart (except via admin interface)
- Merged configuration cached in memory
- File I/O only on property changes

### Property Access

- Getter methods are fast (direct object access)
- No database queries or network calls
- Type conversion handled automatically

## JSPWiki Compatibility

The ConfigurationManager maintains compatibility with JSPWiki patterns:

| Feature | JSPWiki | amdWiki |
|---------|---------|----------|
| Property Format | `jspwiki.property` | `amdwiki.property` |
| Two-tier Config | Yes | Yes ✓ |
| Property Merging | Yes | Yes ✓ |
| Admin Interface | Basic | Enhanced ✓ |
| Runtime Updates | Limited | Full ✓ |

## Troubleshooting

### Common Issues

**Configuration not loading:**
- Check JSON syntax in configuration files
- Verify file permissions
- Review startup logs for errors

**Properties not taking effect:**
- Restart server after manual file changes
- Use admin interface for immediate updates
- Check property name spelling

**Admin interface errors:**
- Verify admin privileges
- Check CSRF token issues
- Review property validation rules

### Debug Information

```javascript
const configManager = engine.getManager('ConfigurationManager');

// Check property sources
const allProps = configManager.getAllProperties();
const customProps = configManager.getCustomProperties();
const defaultProps = configManager.getDefaultProperties();

console.log('Custom overrides:', Object.keys(customProps));
console.log('Total properties:', Object.keys(allProps).length);
```

## Best Practices

### Property Naming
- Use descriptive, hierarchical names
- Follow `amdwiki.category.subcategory.property` pattern
- Avoid abbreviations in property names

### Default Values
- Always provide sensible defaults
- Document expected property types
- Use consistent value formats

### Custom Overrides
- Only override what's necessary
- Document custom configurations
- Use version control for app-custom-config.json

### Security
- Change default secrets in production
- Use environment-appropriate security settings
- Regularly audit configuration for sensitive data