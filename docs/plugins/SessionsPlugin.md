---
name: "SessionsPlugin"
description: "Shows the number of active sessions"
dateModified: "2025-12-18"
category: "plugins"
relatedModules: ["PluginManager", "ConfigurationManager"]
version: "1.0.0"
---

# SessionsPlugin

Displays the number of active user sessions on the wiki server.

## Overview

The SessionsPlugin provides real-time information about how many users are currently connected to the wiki. It can show either total session count or distinct user count.

**Source:** `plugins/SessionsPlugin.js`

## Plugin Metadata

| Property | Value |
|----------|-------|
| Name | SessionsPlugin |
| Author | amdWiki |
| Version | 1.0.0 |
| JSPWiki Compatible | Yes |

## Usage

### Basic Syntax

```wiki
[{SessionsPlugin}]
```

Shows total session count.

### Distinct Users

```wiki
[{SessionsPlugin property='distinctUsers'}]
```

## Parameters

| Parameter | Type | Default | Required | Description |
|-----------|------|---------|----------|-------------|
| property | string | users | No | What to count: "users" or "distinctUsers" |

### Property Values

| Value | Description |
|-------|-------------|
| users | Total number of active sessions (default) |
| distinctUsers | Number of unique logged-in users |

## Examples

### Example 1: Total Sessions

```wiki
Currently [{SessionsPlugin}] active sessions.
```

**Output:** `Currently 5 active sessions.`

### Example 2: Distinct Users

```wiki
[{SessionsPlugin property='distinctUsers'}] users are online.
```

**Output:** `3 users are online.`

### Example 3: Dashboard Display

```wiki
!! System Status

| Metric | Value |
|--------|-------|
| Active Sessions | [{SessionsPlugin}] |
| Unique Users | [{SessionsPlugin property='distinctUsers'}] |
| Server Uptime | [{UptimePlugin}] |
| Total Pages | [{TotalPagesPlugin}] |
```

## Technical Implementation

### Execute Method

```javascript
async execute(context, params = {}) {
  const cfgMgr = context.engine?.getManager?.('ConfigurationManager');
  const host = cfgMgr?.getProperty('amdwiki.server.host', 'localhost');
  const port = cfgMgr?.getProperty('amdwiki.server.port', 3000);

  const resp = await fetch(`http://${host}:${port}/api/session-count`);
  const data = await resp.json();

  if (property === 'distinctusers') {
    return String(data.distinctUsers ?? 0);
  }
  return String(data.sessionCount ?? 0);
}
```

### API Endpoint

The plugin calls `/api/session-count` which returns:

```json
{
  "sessionCount": 5,
  "distinctUsers": 3
}
```

### Configuration

| Property | Default | Description |
|----------|---------|-------------|
| `amdwiki.server.host` | localhost | Server hostname |
| `amdwiki.server.port` | 3000 | Server port |

## JSPWiki Compatibility

| Feature | JSPWiki | amdWiki | Notes |
|---------|---------|---------|-------|
| Basic syntax | Yes | Yes | Same behavior |
| Session count | Yes | Yes | Via API call |
| property parameter | Partial | Yes | Extended options |

## Error Handling

| Error | Cause | Output |
|-------|-------|--------|
| API unavailable | Server not responding | "0" |
| Config error | Invalid configuration | "0" (uses defaults) |
| Network error | Connection failed | "0" |

## Related Plugins

- [UptimePlugin](./UptimePlugin.md) - Server uptime
- [TotalPagesPlugin](./TotalPagesPlugin.md) - Page count

## Related Documentation

- [Plugin System Architecture](../architecture/Plugin-Architecture.md)
- [Session Management](../admin/Session-Management.md)

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2025-10-05 | Initial implementation |
