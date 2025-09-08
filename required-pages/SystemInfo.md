---
uuid: 550e8400-e29b-41d4-a716-446655440000
categories: [System, Documentation]
user-keywords: [system, info, variables]
title: SystemInfo
lastModified: '2025-09-08T15:35:00.000Z'
---

# System Information

This page demonstrates JSPWiki-style system variables that work on any page!

## Basic System Variables

- **Application Name**: [{$applicationname}]
- **Current Page**: [{$pagename}]
- **Base URL**: [{$baseurl}]
- **Total Pages**: [{$totalpages}]
- **Server Uptime**: [{$uptime}]

## Date and Time Variables

- **Current Timestamp**: [{$timestamp}]
- **Current Date**: [{$date}]
- **Current Time**: [{$time}]

## Plugin Variables

- **Active Sessions**: [{SessionsPlugin}]

## Information Table

| Variable | Value |
|----------|-------|
| Application | [{$applicationname}] |
| Total Pages | [{$totalpages}] |
| Uptime | [{$uptime}] |
| Date | [{$date}] |
| Time | [{$time}] |

These system variables are processed by the RenderingManager and can be used on **any page** in the wiki, not just the LeftMenu!

## Usage

Simply use the syntax `[{$variablename}]` anywhere in your markdown content. The system will automatically replace these with the current values when the page is rendered.

Available system variables:
- `[{$applicationname}]` - The name of the wiki application
- `[{$pagename}]` - The current page name
- `[{$baseurl}]` - The base URL of the wiki
- `[{$totalpages}]` - Total number of pages in the wiki
- `[{$uptime}]` - Server uptime in human-readable format
- `[{$timestamp}]` - Current ISO timestamp
- `[{$date}]` - Current date
- `[{$time}]` - Current time
- `[{SessionsPlugin}]` - Number of active sessions
