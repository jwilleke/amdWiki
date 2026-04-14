---
title: UptimePlugin
uuid: E2BC4BF9-4DDB-40DD-8CE5-C418EE7FCC08
system-category: documentation
user-keywords:
  - Plugins
  - Uptime
  - Server
slug: uptimeplugin
lastModified: '2026-04-14T00:00:00.000Z'
author: system
---
# UptimePlugin

The **UptimePlugin** displays how long the server has been running since its last restart, formatted as days, hours, and minutes. See [Plugins] for a complete list of available plugins.

## Syntax

```
[{UptimePlugin}]
```

## Parameters

This plugin has no parameters.

## Examples

### Basic Display

```
Server uptime: [{UptimePlugin}]
```

**Output Examples:**

- `Server uptime: 3d 12h 45m`
- `Server uptime: 5h 30m`
- `Server uptime: 15m`

### Status Dashboard

```
| Metric | Value |
| -------- | ------- |
| Server Uptime | [{UptimePlugin}] |
| Total Pages | [{TotalPagesPlugin}] |
| Active Sessions | [{SessionsPlugin}] |
```

## Output Format

| Duration | Format |
| ---------- | -------- |
| Days or more | `3d 12h 45m` |
| Hours only | `5h 30m` |
| Minutes only | `15m` |

## More Information

There might be more information for this subject on one of the following:
[{ReferringPagesPlugin before='*' after='\n' }]
