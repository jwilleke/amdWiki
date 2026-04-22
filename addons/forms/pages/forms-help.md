---
uuid: "f0rm5-he1p-0000-0000-000000000001"
slug: "forms-help"
title: "Forms Addon Help"
system-category: "documentation"
author: "system"
---

# Forms Addon

The **Forms addon** lets operators define, render, and process forms entirely within ngdpbase.

## Embedding a form on a page

Use the `[{Form}]` markup directive on any wiki page:

```
[{Form id='clubhouse-reservation'}]
```

## Defining a form

Forms are JSON files in `${FAST_STORAGE}/forms/definitions/<formId>.json`.

### Supported field types

| Type | Description |
|---|---|
| `text` | Single-line text |
| `email` | Email address (validated) |
| `tel` | Phone number |
| `textarea` | Multi-line text |
| `date` | Date picker |
| `time` | Time picker |
| `dropdown` | Select from a list |
| `checkbox` | Single checkbox (agree/disagree) |
| `hidden` | Hidden value |

### Dynamic dropdown options

Set `"optionsSource": "config:my.config.key"` and define the list in `app-custom-config.json`:

```json
"my.config.key": ["Option A", "Option B", "Option C"]
```

## Admin

View submissions at `/admin/forms`.
