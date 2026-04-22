---
uuid: "f0rm5-he1p-0000-0000-000000000001"
slug: "forms-help"
title: "Using Forms Addon"
slug: "using-forms-addon"
system-category: "documentation"
user-keywords:
  - Forms
  - Submission
  - Form Builder
  - Addon
author: "system"
lastModified: '2026-04-22T00:00:00.000Z'
---
# Using Forms Addon

The **Forms addon** lets administrators define, render, and process forms on any page using JSON definition files.

## Embedding a form

Use the `[{Form}]` plugin on any page:

```
[{Form id='clubhouse-reservation'}]
```

The `id` must match the filename (without `.json`) of a form definition file. See [FormPlugin] for full plugin documentation.

## Defining a form

Forms are JSON files placed in the forms data directory under `definitions/`:

```
${dataPath}/definitions/<formId>.json
```

### Required fields

%%table-striped
|| Field || Type || Description ||
| `id` | string | Matches the filename. Lowercase letters, digits, and hyphens only. |
| `title` | string | Displayed as the form heading. |
| `fields` | array | One or more field objects (see below). |
/%

### Optional fields

%%table-striped
|| Field || Type || Default || Description ||
| `description` | string | *(none)* | Subtitle shown below the title. |
| `handler` | string | *(none)* | Handler key registered by another addon (e.g. `"calendar:clubhouse-reservation"`). Called on each submission. |
| `proxySubmission` | boolean | `false` | When `true`, shows an extra fieldset so staff can submit on behalf of another person. |
| `notifyRole` | string | `"admin"` | Role that receives an in-app notification on each submission. |
/%

### Field types

%%table-striped
|| Type || Description ||
| `text` | Single-line text |
| `email` | Email address — validated on the server |
| `tel` | Phone number |
| `textarea` | Multi-line text |
| `date` | Date picker |
| `time` | Time picker |
| `dropdown` | Select from a list |
| `checkbox` | Single checkbox (agree / disagree) |
| `hidden` | Hidden value passed on every submission |
/%

### Field definition

Each entry in `fields` supports:

%%table-striped
|| Property || Required || Description ||
| `name` | Yes | Field name used in the submission data. |
| `type` | Yes | One of the types above. |
| `label` | Yes | Label shown to the user. |
| `required` | No | `true` to block submission if empty. Default: `false`. |
| `description` | No | Helper text shown below the field. |
| `placeholder` | No | Placeholder text inside the input. |
| `optionsSource` | No | For `dropdown` only — see Dynamic options below. |
/%

### Dynamic dropdown options

Set `"optionsSource": "config:my.config.key"` on a dropdown field and define the list in `app-custom-config.json`:

```json
"my.config.key": ["Option A", "Option B", "Option C"]
```

The options are resolved at render time from the live configuration — no page restart needed after updating the list.

## Administration

View and manage submissions at `/admin/forms`. Each form shows a submission count. Submissions can be filtered by status (`pending`, `processed`, `rejected`) and marked as processed from the detail view.
