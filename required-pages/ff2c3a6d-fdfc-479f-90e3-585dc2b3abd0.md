---
title: CounterPlugin
system-category: documentation
user-keywords:
  - default
uuid: ff2c3a6d-fdfc-479f-90e3-585dc2b3abd0
slug: counterplugin
lastModified: '2026-01-13T09:17:49.921Z'
author: admin
---
# CounterPlugin

[{$pagename}] is a [Plugin] that maintains page-specific counters that increment each time they render.

[{$pagename}] is useful for numbering items, tracking plugin invocations, or implementing sequential numbering within a page.

## Important: Counter Behavior

**Counters reset on every page render/reload.** This is the correct JSPWiki-compatible behavior:

- ✅ Counters are per-render, not persistent across page reloads
- ✅ Each page view starts fresh from 0
- ✅ Different users see independent counters
- ✅ Refreshing the page resets all counters to 0

**Intended Use:** Counters are for numbering items within a single page view (like figures, sections, or list items), NOT for tracking page views across multiple visits.

## Quick Examples

### Basic Counter

```
[{Counter}]
[{Counter}]
[{Counter}]
```

**Output:** 1, 2, 3

### Named Counter

```
[{Counter name='chapter'}]
[{Counter name='chapter'}]
```

**Output:** 1, 2 (separate from default counter)

### Custom Increment

```
[{Counter increment='5'}]
[{Counter increment='5'}]
```

**Output:** 5, 10

## Parameters

| Parameter | Type | Default | Description |
| ----------- | ------ | --------- | ------------- |
| `name` | string | `counter` | Distinguishes multiple counters on one page |
| `increment` | number | `1` | Amount to add to counter (can be negative) |
| `start` | number | (none) | Resets counter to specified value |
| `showResult` | boolean | `true` | Controls whether counter value is displayed |

## Use Cases

### Numbered Lists with Custom Formatting

```
[{Counter start='1'}]. Introduction
[{Counter}]. Background
[{Counter}]. Methodology
[{Counter}]. Results
```

### Multiple Counter Hierarchies

```
# Section [{Counter name='section'}]
## Subsection [{Counter name='subsection'}].1
## Subsection [{Counter name='subsection'}].2

# Section [{Counter name='section'}]
[{Counter name='subsection' start='1'}]
## Subsection [{Counter name='subsection'}].1
```

### Countdown with Negative Increment

```
[{Counter name='countdown' start='10'}]
[{Counter name='countdown' increment='-1'}]
[{Counter name='countdown' increment='-1'}]
```

**Output:** 10, 9, 8

## Accessing Counter Values as Variables

Counter values can be accessed without incrementing them:

```
[{Counter}]
[{Counter}]
Current counter value: [{$counter}]
```

For named counters, use `[{$counter-name}]`:

```
[{Counter name='chapter'}]
Chapter: [{$counter-chapter}]
```

## More Information

There might be more information for this subject on one of the following:
[{ReferringPagesPlugin before='* ' after='\n'}]
