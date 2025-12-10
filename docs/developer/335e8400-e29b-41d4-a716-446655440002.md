---
title: Plugin Escaping Test
system-category: developer
user-keywords:
  - plugins
  - escaping
  - code
uuid: 335e8400-e29b-41d4-a716-446655440002
lastModified: '2025-09-07T09:20:00.000Z'
slug: plugin-escaping-test
---

# Plugin and System Variable Escaping Test

This page tests that plugins and system variables are properly handled in different contexts.

## Normal Plugin Expansion

These should be expanded normally:

- Current page: [{$pagename}]
- Total pages: [{$totalpages}]
- Server uptime: [{$uptime}]
- Sessions: [{SessionsPlugin}]

## Code Blocks (Should NOT be expanded)

In code blocks, plugins should not be expanded:

```markdown
# Example markdown with plugins
Current page: [{$pagename}]
Total pages: [{$totalpages}]
Sessions: [{SessionsPlugin}]
```

```javascript
// JavaScript code example
const pageName = '[{$pagename}]';
const totalPages = [{$totalpages}];
const uptime = '[{$uptime}]';
```

## Inline Code (Should NOT be expanded)

When using inline code, plugins should not expand:

- Use `[{$pagename}]` to get the current page name
- Use `[{$totalpages}]` for total page count
- Use `[{SessionsPlugin}]` for active sessions

## Escaped Syntax (Should be displayed literally)

Using double brackets escapes the plugin syntax:

- Escaped page name: [[{$pagename}]
- Escaped total pages: [[{$totalpages}]
- Escaped uptime: [[{$uptime}]
- Escaped sessions: [[{SessionsPlugin}]

## Mixed Content Test

Here's a mix of normal and protected content:

Normal expansion: [{$applicationname}] has [{$totalpages}] pages.

Code example:

```
To show the application name, use [{$applicationname}]
To show page count, use [{$totalpages}]
```

Escaped example: Use [[{$applicationname}] to display the application name literally.

Inline code example: The variable `[{$applicationname}]` shows the app name.

## Verification

✅ **Normal plugins**: Should show actual values  
✅ **Code blocks**: Should show literal plugin syntax  
✅ **Inline code**: Should show literal plugin syntax  
✅ **Escaped syntax**: Should show literal plugin syntax without double brackets  

This ensures JSPWiki-compatible behavior for plugin escaping!
