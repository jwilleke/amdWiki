# ConfigAccessorPlugin

The ConfigAccessorPlugin provides access to system configuration values including roles, features, manager settings, and any configuration property. This plugin is useful for displaying configuration information on wiki pages or embedding config values inline in text.

**Version:** 2.0.0

## Usage

### Get Configuration Value (Inline)

```wiki
[{ConfigAccessor key='amdwiki.server.port' valueonly='true'}]
```

Returns just the value `3000` for inline use in text.

### Display Configuration Value (Formatted)

```wiki
[{ConfigAccessor key='amdwiki.server.port'}]
```

Displays a formatted card showing the key and value.

### Get Multiple Values with Wildcard (Inline)

```wiki
[{ConfigAccessor key='amdwiki.server.*' valueonly='true'}]
```

Returns matching values, one per line.

### Display Multiple Values with Wildcard (Formatted)

```wiki
[{ConfigAccessor key='amdwiki.server.*'}]
```

Displays a formatted table showing all matching keys and values.

### Display All Roles

```wiki
[{ConfigAccessor type='roles'}]
```

Displays all system and custom roles in a formatted table.

### Display Manager Configuration

```wiki
[{ConfigAccessor type='manager' manager='UserManager'}]
```

Shows all configuration properties for a specific manager.

### Display Feature Configuration

```wiki
[{ConfigAccessor type='feature' feature='search'}]
```

Shows all configuration properties for a specific feature.

## Parameters

| Parameter | Values | Default | Required | Description |
|-----------|--------|---------|----------|-------------|
| `key` | Config key with optional wildcards (*) | *(none)* | Yes (if no `type`) | Configuration key in dot-notation, supports wildcards |
| `type` | `roles`, `manager`, `feature` | *(none)* | Yes (if no `key`) | What type of configuration to display |
| `valueonly` | `true`, `false` | `false` | No | Return only value(s) without HTML formatting |
| `manager` | Manager name | *(none)* | Yes (if `type='manager'`) | Manager name |
| `feature` | Feature name | *(none)* | Yes (if `type='feature'`) | Feature name |

**Important:** You must specify either `key` or `type` parameter. The plugin will return an error if neither is provided.

## Examples

### Example 1: Inline Value in Text

```wiki
The server is running on port [{ConfigAccessor key='amdwiki.server.port' valueonly='true'}].
```

**Output:** The server is running on port 3000.

### Example 2: Display Single Config Value (Formatted)

```wiki
[{ConfigAccessor key='amdwiki.server.port'}]
```

**Output:** Formatted card showing:
- **Key:** `amdwiki.server.port`
- **Value:** `3000`

### Example 3: Get All Server Config (Inline)

```wiki
[{ConfigAccessor key='amdwiki.server.*' valueonly='true'}]
```

**Output:** Plain text, one value per line:
```
3000
localhost
```

### Example 4: Display All Server Config (Formatted)

```wiki
[{ConfigAccessor key='amdwiki.server.*'}]
```

**Output:** Formatted table showing all keys matching `amdwiki.server.*`:
- `amdwiki.server.port` → `3000`
- `amdwiki.server.host` → `localhost`

### Example 5: Embed Application Name in Text

```wiki
Welcome to [{ConfigAccessor key='amdwiki.applicationName' valueonly='true'}]!
```

**Output:** Welcome to amdWiki!

### Example 6: Display All Roles

```wiki
[{ConfigAccessor type='roles'}]
```

**Output:** Formatted table with all available roles:
- Role name (code format)
- Display name (colored)
- Description
- Type badge (System/Custom)
- Icon with color

Includes roles like Admin, Editor, Contributor, Reader, and Anonymous.

### Example 7: Display Manager Configuration

```wiki
[{ConfigAccessor type='manager' manager='UserManager'}]
```

**Output:** Formatted table with all UserManager configuration properties such as:
- Session timeout
- Password policies
- Authentication settings
- User profile options

### Example 8: Display Feature Configuration

```wiki
[{ConfigAccessor type='feature' feature='search'}]
```

**Output:** Formatted table with search feature configuration:
- Search index location
- Indexing options
- Search result limits
- Fuzzy search settings

### Example 9: Get Multiple Role Names (Inline)

```wiki
[{ConfigAccessor key='amdwiki.roles.definitions.*.name' valueonly='true'}]
```

**Output:** Plain text, one role name per line:
```
admin
editor
contributor
reader
anonymous
```

## Wildcard Support

The `key` parameter supports wildcards using the `*` character for flexible pattern matching:

### Single Wildcard
```wiki
[{ConfigAccessor key='amdwiki.server.*'}]
```
Matches: `amdwiki.server.port`, `amdwiki.server.host`, etc.

### Multiple Levels
```wiki
[{ConfigAccessor key='amdwiki.*.port'}]
```
Matches: `amdwiki.server.port`, `amdwiki.database.port`, etc.

### Nested Wildcards
```wiki
[{ConfigAccessor key='amdwiki.roles.definitions.*.name'}]
```
Matches all role names in the role definitions.

### Full Wildcard
```wiki
[{ConfigAccessor key='amdwiki.*'}]
```
Matches all configuration keys starting with `amdwiki.`

## Value-Only Mode

When `valueonly='true'` is specified:

### Behavior
- Returns **plain text only** (no HTML formatting)
- Single value: returns the value as-is
- Multiple values (wildcard): returns values separated by newlines
- Objects: returns JSON string representation
- Empty/not found: returns empty string

### Use Cases
- Embedding config values inline in sentences
- Creating dynamic lists or tables
- Using config values in calculations or comparisons
- Building dynamic URLs or paths

### Example Usage in Text
```wiki
## Server Information

- **Application:** [{ConfigAccessor key='amdwiki.applicationName' valueonly='true'}]
- **Port:** [{ConfigAccessor key='amdwiki.server.port' valueonly='true'}]
- **Environment:** [{ConfigAccessor key='amdwiki.environment' valueonly='true'}]

The system is running version [{ConfigAccessor key='amdwiki.version' valueonly='true'}]
and has been up for [{$uptime}].
```

## Configuration Access Methods

The plugin uses these ConfigurationManager methods internally:

### getAllProperties()
Gets all configuration properties as an object. Used for wildcard matching.

```javascript
returns: { 'amdwiki.server.port': 3000, 'amdwiki.server.host': 'localhost', ... }
```

### getProperty(key, defaultValue)
Gets a single configuration property by dot-notation key.

```javascript
key: 'amdwiki.server.port'
returns: 3000
```

### getManagerConfig(managerName)
Gets all configuration for a specific manager.

```javascript
managerName: 'UserManager'
returns: { sessionTimeout: 3600, ... }
```

### getFeatureConfig(featureName)
Gets all configuration for a specific feature.

```javascript
featureName: 'search'
returns: { indexPath: './index', ... }
```

## Common Configuration Keys

### Server Configuration
- `amdwiki.server.port` - Server port number
- `amdwiki.server.host` - Server hostname
- `amdwiki.baseURL` - Base URL for the wiki

### Application Configuration
- `amdwiki.applicationName` - Application display name
- `amdwiki.version` - Current version
- `amdwiki.environment` - Environment (development/production)

### Roles Configuration
- `amdwiki.roles.definitions` - All role definitions
- `amdwiki.access.policies` - Access control policies

### Feature Flags
- `amdwiki.features.search` - Search feature config
- `amdwiki.features.versioning` - Version control config
- `amdwiki.features.attachments` - Attachment handling config

### Manager Configuration
- `amdwiki.managers.pluginManager.searchPaths` - Plugin directories
- `amdwiki.managers.userManager.*` - User management settings
- `amdwiki.managers.pageManager.*` - Page management settings

## Role Information

When displaying roles (`type='roles'`), each role includes:

| Field | Description |
|-------|-------------|
| `name` | Internal role identifier (e.g., `admin`, `editor`) |
| `displayname` | Human-readable name (e.g., "Administrator") |
| `description` | Role purpose and permissions |
| `issystem` | Boolean - true for built-in roles |
| `icon` | FontAwesome icon name |
| `color` | HTML color code for visual identification |

### System Roles

Built-in roles defined in configuration:

1. **admin** - Full system access to all features
2. **editor** - Can edit and manage content
3. **contributor** - Can create and edit own content
4. **reader** - Read-only access to content
5. **anonymous** - Unauthenticated user access

## Output Format

### Roles Display
- Responsive table with sorting (system roles first)
- Color-coded role names
- Type badges (System/Custom)
- Icons with role colors
- Footer with statistics

### Config Value Display
- Card layout with key-value display
- JSON formatting for objects/arrays
- Simple value display for primitives
- Code formatting for readability

### Manager/Feature Config Display
- Table format with property-value pairs
- Automatic JSON formatting for complex values
- Alphabetical property ordering
- Clear section headers

## Case-Insensitive Usage

Plugin names are case-insensitive in amdWiki:

```wiki
[{ConfigAccessor}]           ✓ Works
[{configaccessor}]           ✓ Works
[{CONFIGACCESSOR}]           ✓ Works
[{ConfigAccessor}]           ✓ Works (recommended)
```

All variations invoke the same plugin.

## Error Handling

### Missing Required Parameters (No key or type)

```wiki
[{ConfigAccessor}]
```

Returns: `Missing required parameter: must specify either 'key' or 'type'`

### Missing Key Parameter

```wiki
[{ConfigAccessor valueonly='true'}]
```

Returns: `Missing required parameter: must specify either 'key' or 'type'`

### Invalid Configuration Key (Formatted Mode)

```wiki
[{ConfigAccessor key='invalid.key'}]
```

Returns: `Config key 'invalid.key' not found`

### Invalid Configuration Key (Value-Only Mode)

```wiki
[{ConfigAccessor key='invalid.key' valueonly='true'}]
```

Returns: Empty string (nothing displayed)

### No Wildcard Matches (Formatted Mode)

```wiki
[{ConfigAccessor key='nonexistent.*'}]
```

Returns: `No config keys match pattern: nonexistent.*`

### No Wildcard Matches (Value-Only Mode)

```wiki
[{ConfigAccessor key='nonexistent.*' valueonly='true'}]
```

Returns: Empty string (nothing displayed)

### Manager Not Found

```wiki
[{ConfigAccessor type='manager' manager='NonexistentManager'}]
```

Returns: `No configuration found for manager: NonexistentManager`

### Feature Not Found

```wiki
[{ConfigAccessor type='feature' feature='nonexistent'}]
```

Returns: `No configuration found for feature: nonexistent`

## Security Considerations

- Configuration values are displayed as-is
- Sensitive values (passwords, API keys) in config will be visible
- Consider access control on pages using this plugin
- Use with caution in public-facing pages

## Use Cases

### 1. Inline Value Embedding
Embed configuration values directly in page text:

```wiki
## Welcome

Welcome to [{ConfigAccessor key='amdwiki.applicationName' valueonly='true'}]!

The server is running on port [{ConfigAccessor key='amdwiki.server.port' valueonly='true'}]
and currently has [{$totalpages}] pages.

System version: [{ConfigAccessor key='amdwiki.version' valueonly='true'}]
```

### 2. System Information Pages
Display current configuration on admin/status pages:

```wiki
## Server Configuration

**Port:** [{ConfigAccessor key='amdwiki.server.port' valueonly='true'}]
**Host:** [{ConfigAccessor key='amdwiki.server.host' valueonly='true'}]
**Environment:** [{ConfigAccessor key='amdwiki.environment' valueonly='true'}]

### All Server Settings

[{ConfigAccessor key='amdwiki.server.*'}]
```

### 3. Role Documentation
Document available roles for users:

```wiki
## Available User Roles

[{ConfigAccessor type='roles'}]
```

### 4. Dynamic Lists
Create dynamic lists from configuration:

```wiki
## System Roles

Available roles in the system:
- Admin
- Editor
- Contributor
- Reader
- Anonymous

Role count: [{ConfigAccessor key='amdwiki.roles.definitions.*' valueonly='true'}] (returns count via wildcard)
```

### 5. Feature Documentation
Show current feature configuration:

```wiki
## Search Configuration

[{ConfigAccessor type='feature' feature='search'}]
```

### 6. Manager Settings
Display manager configuration for troubleshooting:

```wiki
## PageManager Settings

[{ConfigAccessor type='manager' manager='PageManager'}]
```

### 7. Wildcard Pattern Matching
Find all related configuration values:

```wiki
## Database Configuration

All database settings:

[{ConfigAccessor key='amdwiki.database.*'}]
```

## See Also

- [ConfigurationManager Documentation](../managers/ConfigurationManager.md)
- [UserManager Documentation](../managers/UserManager.md)
- [VariablesPlugin](VariablesPlugin.md) - For system variables
- [System Variables Page](/wiki/System%20Variables)

## Version History

- **2.0.0** (2025-10-17) - Major enhancement release
  - **BREAKING:** Now requires either `key` or `type` parameter (no default behavior)
  - Added `valueonly` parameter for inline value embedding
  - Added wildcard support for `key` parameter (e.g., `amdwiki.server.*`)
  - Multiple value display when wildcards match multiple keys
  - Plain text output mode for easy inline usage
  - Enhanced error handling for edge cases

- **1.0.0** (2025-10-17) - Initial release
  - Roles display
  - Configuration property access
  - Manager configuration display
  - Feature configuration display
  - Case-insensitive plugin invocation
