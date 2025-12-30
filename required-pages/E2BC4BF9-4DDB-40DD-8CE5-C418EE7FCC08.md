---
title: UptimePlugin
uuid: E2BC4BF9-4DDB-40DD-8CE5-C418EE7FCC08
system-category: documentation
user-keywords:
  - Plugins
  - Uptime
  - Server
slug: uptimeplugin
lastModified: '2025-12-18T12:00:00.000Z'
author: admin
---
# UptimePlugin

The **UptimePlugin** displays server uptime in a human-readable format.

## Description

This plugin shows how long the wiki server has been running since its last restart. The time is formatted as days, hours, and minutes.

## Syntax

```wiki
[{UptimePlugin}]
```

## Parameters

This plugin has no parameters.

## Examples

### Basic Display

```wiki
Server uptime: [{UptimePlugin}]
```

**Output Examples:**

- `Server uptime: 3d 12h 45m` (running for 3 days)
- `Server uptime: 5h 30m` (less than a day)
- `Server uptime: 15m` (just started)

### Footer Information

```wiki
----
Wiki powered by amdWiki | Uptime: [{UptimePlugin}]
```

### Status Dashboard

```wiki
| Metric | Value |
| -------- | ------- |
| Server Uptime | [{UptimePlugin}] |
| Total Pages | [{TotalPagesPlugin}] |
| Active Sessions | [{SessionsPlugin}] |
```

## Output Format

The uptime adapts to show relevant units:

| Duration | Format |
| ---------- | -------- |
| Days or more | `3d 12h 45m` |
| Hours only | `5h 30m` |
| Minutes only | `15m` |

## See Also

- [Plugins] - All available plugins
- [SessionsPlugin] - Active sessions
- [TotalPagesPlugin] - Page count

## More Information

There might be more information for this subject on one of the following:
[{ReferringPagesPlugin before='*' after='\n' }]
