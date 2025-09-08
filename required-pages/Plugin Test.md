---
title: Plugin Test
categories: [System, Test]
user-keywords: []
uuid: 225e8400-e29b-41d4-a716-446655440001
lastModified: '2025-09-07T09:16:00.000Z'
---

# JSPWiki-Style Plugin Test

This page demonstrates that JSPWiki-style plugins and system variables work on **ANY** page in amdWiki!

## System Variables (${variable} syntax)

- **Application Name**: [{$applicationname}]
- **Current Page**: [{$pagename}]
- **Base URL**: [{$baseurl}]
- **Total Pages**: [{$totalpages}]
- **Server Uptime**: [{$uptime}]
- **Current Timestamp**: [{$timestamp}]
- **Current Date**: [{$date}]
- **Current Time**: [{$time}]

## Plugin Variables ({PluginName} syntax)

- **Sessions Plugin**: [{SessionsPlugin}]
- **Total Pages Plugin**: [{TotalPagesPlugin}]
- **Uptime Plugin**: [{UptimePlugin}]

## Advanced Plugin Usage

### ReferringPages Plugin with Parameters

Pages that refer to this page:
[{ReferringPagesPlugin page="Plugin Test" max=5}]

## Real-time Information Table

| Plugin Type | Variable/Plugin | Current Value |
|-------------|-----------------|---------------|
| System Variable | `[{$applicationname}]` | [{$applicationname}] |
| System Variable | `[{$totalpages}]` | [{$totalpages}] |
| System Variable | `[{$uptime}]` | [{$uptime}] |
| Plugin | `[{SessionsPlugin}]` | [{SessionsPlugin}] |
| Plugin | `[{TotalPagesPlugin}]` | [{TotalPagesPlugin}] |
| Plugin | `[{UptimePlugin}]` | [{UptimePlugin}] |

## Usage Instructions

To use these plugins on any page:

### System Variables
Use the syntax `[{$variablename}]`:
- `[{$pagename}]` - Current page name
- `[{$totalpages}]` - Total number of pages
- `[{$uptime}]` - Server uptime
- `[{$applicationname}]` - Application name
- `[{$baseurl}]` - Base URL
- `[{$timestamp}]` - Current ISO timestamp
- `[{$date}]` - Current date
- `[{$time}]` - Current time

### Plugins
Use the syntax `[{PluginName param=value}]`:
- `[{SessionsPlugin}]` - Number of active sessions
- `[{TotalPagesPlugin}]` - Total pages (same as $totalpages)
- `[{UptimePlugin}]` - Server uptime (same as $uptime)
- `[{ReferringPagesPlugin page="PageName" max=10}]` - Pages referring to specified page

## Benefits

✅ **Universal**: Works on any page in the wiki  
✅ **Real-time**: Values update automatically when pages are rendered  
✅ **JSPWiki Compatible**: Uses standard JSPWiki plugin syntax  
✅ **Extensible**: New plugins can be easily added to the `/plugins` directory  
✅ **Parameter Support**: Plugins can accept parameters for customization  

This demonstrates that amdWiki now has a complete JSPWiki-compatible plugin system!
