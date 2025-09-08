---
uuid: sys-keywords-001
categories: [System]
user-keywords: []
title: System Keywords
lastModified: '2025-09-08T15:35:00.000Z'
---
# System Keywords

This page defines the controlled vocabulary for system-level categorization.

## Current System Keywords

### System
- **[System]** - Pages (md files) that are required for System Operation
- **[System, Documentation]** - Documentation files readable by anyone
- **[System, Documentation, Test]** - Documentation files readable by anyone that show all is working well

## Usage Rules

- Can only be added by Admin role or AI (System) in future
- No duplicates regardless of case (all lowercase)
- Must be applied through proper metadata: `categories: [System, Documentation]`

## Implementation Notes

These keywords replace the old single `category` field with the new array-based `categories` field for better organization and multi-classification support.
