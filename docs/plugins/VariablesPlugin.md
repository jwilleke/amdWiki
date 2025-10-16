# VariablesPlugin

The VariablesPlugin displays system and contextual variables available in the wiki, similar to the admin variables page.

## Usage

### Show All Variables (Default)

```
[{INSERT VariablesPlugin}]
```

This displays both system and contextual variables in tabbed format.

### Show Only System Variables

```
[{INSERT VariablesPlugin type='system'}]
```

Displays only system variables that don't require user or page context.

### Show Only Contextual Variables

```
[{INSERT VariablesPlugin type='contextual'}]
```

Displays only contextual variables that depend on user or page context.

## Parameters

| Parameter | Values | Default | Description |
|-----------|--------|---------|-------------|
| `type` | `all`, `system`, `contextual` | `all` | Which type of variables to display |

## Examples

### Example 1: Display All Variables

```
[{INSERT VariablesPlugin}]
```

Shows a tabbed interface with:
- **System Variables tab**: applicationname, version, baseurl, uptime, totalpages, etc.
- **Contextual Variables tab**: username, pagename, displayname, browser, clientip, etc.

### Example 2: Display System Variables Only

```
[{INSERT VariablesPlugin type='system'}]
```

Shows only system-level variables in a single table.

### Example 3: Display Contextual Variables Only

```
[{INSERT VariablesPlugin type='contextual'}]
```

Shows only context-dependent variables in a single table.

## Variable Categories

### System Variables

Variables that don't require user or page context:
- `applicationname` / `appname` - Application name from configuration
- `version` - amdWiki version number
- `baseurl` - Base URL for the wiki
- `uptime` - Server uptime
- `totalpages` - Total number of pages in wiki
- `date`, `time`, `timestamp` - Current date/time values
- `year`, `month`, `day` - Current date components

### Contextual Variables

Variables that require user or page context:
- `username` - Current user's name
- `displayname` - User's display name
- `loginstatus` - User authentication status
- `userroles` - User's assigned roles
- `pagename` - Current page name
- `useragent` - Browser user agent string
- `browser` - Browser name and version
- `clientip` - Client IP address
- `referer` - HTTP referer
- `sessionid` - Session identifier
- `acceptlanguage` - Accept-Language header

## Output

The plugin generates a responsive table or tabbed interface showing:
- Variable name in code format: `[{$variablename}]`
- Current value in code format
- Description of what the variable represents
- Summary statistics (total, system, contextual counts)

## See Also

- [VariableManager Documentation](../managers/VariableManager.md)
- [Admin Variables Page](/admin/variables)
- [Variable Expansion](../features/variable-expansion.md)

## Version History

- **1.0.0** (2025-10-16) - Initial release
