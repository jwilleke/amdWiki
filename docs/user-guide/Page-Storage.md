# Page Storage in amdWiki

User Guide: Understanding Where and How Wiki Pages are Stored**

Version: 1.3.2
Last Updated: 2025-10-16
Audience: Wiki Users, Administrators, Content Managers

---

## Table of Contents

1. [Overview](#overview)
2. [Storage Directories](#storage-directories)
3. [How Storage Location is Determined](#how-storage-location-is-determined)
4. [System Categories](#system-categories)
5. [Page Metadata](#page-metadata)
6. [Why Two Directories?](#why-two-directories)
7. [Best Practices](#best-practices)
8. [Examples](#examples)
9. [Frequently Asked Questions](#frequently-asked-questions)
10. [Troubleshooting](#troubleshooting)

---

## Overview

amdWiki uses a **two-tier storage system** for wiki pages, separating system/documentation pages from regular user content. This design provides clear organization, better security, and easier management of different types of content.

### Key Concepts

- **Pages Directory** (`./pages/`) - Regular user-created content
- **Required Pages Directory** (`./required-pages/`) - System, documentation, and administrative pages
- **System Category** - Metadata field that determines storage location
- **UUID-based Filenames** - All pages stored with UUID filenames (e.g., `443c95f1-0b21-494a-b712-08ce0dc933e1.md`)

---

## Storage Directories

### Directory Structure

```
amdWiki/
├── pages/                      # Regular user content
│   ├── 1a2b3c4d-5e6f-7890.md  # General articles
│   ├── 2b3c4d5e-6f78-9012.md  # User-created pages
│   └── 3c4d5e6f-7890-1234.md  # Test pages
│
└── required-pages/             # System & documentation
    ├── 110fc9ee-90ca-4e6d.md  # System pages
    ├── 208fecc6-fde1-4463.md  # Documentation
    └── 443c95f1-0b21-494a.md  # Admin pages
```

### Regular Pages Directory (`./pages/`)

**Purpose:** Stores everyday wiki content created by users

**Characteristics:**

- User-editable content
- Regular backup schedule
- Can be moved, renamed, or deleted by editors
- Standard access permissions apply

**Typical Content:**

- General articles and knowledge base entries
- User-contributed content
- Draft pages and work-in-progress
- Test pages and experiments
- Developer notes and technical documentation

### Required Pages Directory (`./required-pages/`)

**Purpose:** Stores critical system pages and official documentation

**Characteristics:**

- System-critical content
- Higher backup priority
- Restricted editing (admin-only by default)
- Protected from accidental deletion
- Often referenced by system components

**Typical Content:**

- System configuration pages
- Official documentation
- Administrative pages
- Navigation pages (LeftMenu, Footer, PageIndex)
- Help pages and user guides

---

## How Storage Location is Determined

Storage location is **automatically determined** by the `system-category` field in the page's frontmatter metadata.

### Decision Flow

```
┌─────────────────────────────────────────┐
│  User creates/edits page                │
│  Sets system-category in metadata       │
└───────────────┬─────────────────────────┘
                │
                ▼
┌─────────────────────────────────────────┐
│  System checks category configuration   │
│  (app-default-config.json)              │
└───────────────┬─────────────────────────┘
                │
        ┌───────┴────────┐
        │                │
        ▼                ▼
┌──────────────┐  ┌──────────────┐
│ storageLocation │  storageLocation │
│ = "required"    │  = "regular"    │
└───────┬────────┘  └───────┬────────┘
        │                   │
        ▼                   ▼
┌──────────────┐  ┌──────────────┐
│ required-pages/ │  pages/      │
└──────────────┘  └──────────────┘
```

### Automatic Routing

When you save a page, amdWiki:

1. **Reads** the `system-category` from page frontmatter
2. **Looks up** the category in configuration
3. **Checks** the `storageLocation` property
4. **Routes** the page to the correct directory
5. **Saves** with UUID-based filename

**Example:**

```yaml
---
title: My Page
system-category: documentation  # ← This determines storage
---
```

The system sees `documentation` has `"storageLocation": "required"`, so the page goes to `required-pages/`.

---

## System Categories

System categories are predefined in `config/app-default-config.json` and control where pages are stored.

### Categories → Required Pages

These categories route pages to the `required-pages/` directory:

| Category | Label | Description | Access Level |
| ---------- | ------- | ------------- | -------------- |
| **system** | system | System configuration and infrastructure | Admin only |
| **documentation** | documentation | Official user and technical documentation | Editor+ |
| **developer** | developer | Developer documentation and technical notes | Developer+ |

**Configuration Example:**

```json
"documentation": {
  "label": "documentation",
  "description": "User and technical documentation",
  "default": false,
  "storageLocation": "required",  // ← Routes to required-pages/
  "enabled": true
}
```

### Categories → Regular Pages

These categories route pages to the `pages/` directory:

| Category | Label | Description | Access Level |
| ---------- | ------- | ------------- | -------------- |
| **general** | general | General wiki pages (default) | All users |
| **user** | user | User-generated content | All users |
| **test** | test | Testing and development pages | Editor+ |

**Configuration Example:**

```json
"general": {
  "label": "general",
  "description": "General wiki pages",
  "default": true,              // ← Default category
  "storageLocation": "regular", // ← Routes to pages/
  "enabled": true
}
```

### Default Category

If no `system-category` is specified, pages use the **default category** (typically `general`), which routes to `pages/`.

---

## Page Metadata

### Required Metadata Fields

Every page should have these metadata fields in YAML frontmatter:

```yaml
---
title: PageTitle                           # Display name
uuid: 443c95f1-0b21-494a-b712-08ce0dc933e1 # Unique identifier
system-category: documentation             # Determines storage location
user-keywords:                             # Searchable tags
  - keyword1
  - keyword2
slug: pagetitle                            # URL-friendly name
author: Username                           # Page creator
lastModified: '2025-10-16T19:56:00.000Z'  # ISO 8601 timestamp
---

# Page Content Starts Here
```

### Understanding Each Field

#### `title` (Required)

- **Purpose:** Human-readable page name
- **Display:** Used in navigation, search results, page header
- **Example:** `"Footnote Example"`, `"User Guide"`

#### `uuid` (Required)

- **Purpose:** Unique identifier for the page
- **Format:** UUID v4 (lowercase, hyphenated)
- **Used for:** Filename, internal references, versioning
- **Example:** `443c95f1-0b21-494a-b712-08ce0dc933e1`
- **Generation:** Automatic when page is created

#### `system-category` (Required)

- **Purpose:** Determines storage location and access control
- **Values:** Must match a defined category in configuration
- **Default:** `general` if not specified
- **Example:** `documentation`, `system`, `general`, `user`

#### `user-keywords` (Optional)

- **Purpose:** Searchable tags for content discovery
- **Format:** YAML list
- **Best Practice:** 3-5 relevant keywords
- **Example:** `["documentation", "examples", "markdown"]`

#### `slug` (Optional)

- **Purpose:** URL-friendly version of title
- **Format:** Lowercase, hyphenated
- **Auto-generated:** From title if not provided
- **Example:** `footnote-example`, `user-guide`

#### `author` (Optional)

- **Purpose:** Track page creator
- **Format:** Username or "amdWiki Team"
- **Display:** In page metadata sidebar

#### `lastModified` (Automatic)

- **Purpose:** Track last edit timestamp
- **Format:** ISO 8601 timestamp
- **Managed by:** System automatically updates on save

### Metadata Example: Documentation Page

```yaml
---
title: Markdown Footnotes Guide
uuid: 443c95f1-0b21-494a-b712-08ce0dc933e1
author: amdWiki Team
system-category: documentation  # ← Routes to required-pages/
user-keywords:
  - documentation
  - markdown
  - footnotes
  - examples
slug: markdown-footnotes-guide
lastModified: '2025-10-16T19:56:00.000Z'
---

# Markdown Footnotes Guide

This guide explains how to use footnotes in amdWiki...
```

**Storage Result:** `required-pages/443c95f1-0b21-494a-b712-08ce0dc933e1.md`

### Metadata Example: Regular User Page

```yaml
---
title: My Project Notes
uuid: 7a8b9c0d-1e2f-3g4h-5i6j-7k8l9m0n1o2p
author: john.doe
system-category: user  # ← Routes to pages/
user-keywords:
  - project
  - notes
  - development
slug: my-project-notes
lastModified: '2025-10-16T14:30:00.000Z'
---

# My Project Notes

These are my notes for the current project...
```

**Storage Result:** `pages/7a8b9c0d-1e2f-3g4h-5i6j-7k8l9m0n1o2p.md`

---

## Why Two Directories?

The two-directory system provides several important benefits:

### 1. **Clear Separation of Concerns**

**Problem:** Mixing system pages with user content makes it hard to:

- Find critical system pages
- Protect important documentation
- Apply different backup strategies
- Manage permissions appropriately

**Solution:** Separate directories with clear purposes:

- `required-pages/` = System-critical, protected, high-priority
- `pages/` = User content, editable, standard-priority

### 2. **Security and Access Control**

**Different Protection Levels:**

```
required-pages/
├── System pages      → Admin-only access
├── Documentation     → Editor+ can edit
└── Navigation        → Protected from deletion

pages/
├── User content      → All users can create/edit
├── Drafts           → Owner + editors can edit
└── Test pages       → Can be deleted freely
```

**Benefits:**

- Prevent accidental deletion of critical pages
- Apply stricter permissions to system content
- Allow users to freely experiment in `pages/`

### 3. **Backup and Recovery**

**Different Backup Strategies:**

| Directory | Priority | Frequency | Retention |
| ----------- | ---------- | ----------- | ----------- |
| `required-pages/` | High | Every hour | 90 days |
| `pages/` | Standard | Every 6 hours | 30 days |

**Benefits:**

- Ensure critical documentation is never lost
- Optimize backup storage and performance
- Faster recovery of system pages

### 4. **Performance Optimization**

**Cache Strategy:**

```javascript
// High cache priority for system pages
required-pages/: {
  cacheTTL: 3600,      // 1 hour
  preload: true,       // Load at startup
  priority: 'high'
}

// Standard cache for user pages
pages/: {
  cacheTTL: 300,       // 5 minutes
  preload: false,      // Load on demand
  priority: 'normal'
}
```

**Benefits:**

- Faster loading of frequently accessed documentation
- Better memory management
- Reduced server load

### 5. **Easier Administration**

**Clear Organization:**

- Administrators know exactly where to find system pages
- Easier to audit and review critical content
- Simpler to apply bulk operations (permissions, backups, etc.)
- Clean separation for migrations and exports

### 6. **Disaster Recovery**

**Prioritized Recovery:**

If disaster strikes:

1. **First:** Restore `required-pages/` (system can function)
2. **Then:** Restore `pages/` (user content recovered)

**Benefits:**

- Wiki can be operational quickly with just system pages
- Users can continue viewing documentation while user content is restored
- Clear recovery checklist and priorities

---

## Best Practices

### For Content Creators

#### Choose the Right Category

**Use `documentation` for:**

- ✅ Official user guides and tutorials
- ✅ API documentation and references
- ✅ Policy and procedure documents
- ✅ Help pages and FAQs

**Use `general` or `user` for:**

- ✅ Personal notes and drafts
- ✅ Project-specific documentation
- ✅ Meeting notes and brainstorming
- ✅ Temporary or experimental content

#### Always Include Proper Metadata

```yaml
# ✅ GOOD: Complete metadata
---
title: Clear Descriptive Title
system-category: documentation
user-keywords:
  - relevant
  - searchable
  - tags
author: Your Name
---

# ❌ BAD: Minimal or missing metadata
---
title: Page
---
```

#### Follow Naming Conventions

**Titles:**

- ✅ Use clear, descriptive titles: "Markdown Footnotes Guide"
- ❌ Avoid vague titles: "Guide", "Notes", "Untitled"

**Keywords:**

- ✅ Use specific, searchable terms: "markdown", "footnotes", "syntax"
- ❌ Avoid generic terms: "stuff", "things", "page"

### For Administrators

#### Regular Audits

**Check category assignments:**

```bash
# Find pages in wrong directory
cd amdWiki
grep -r "system-category: documentation" pages/
# Should return no results - all documentation should be in required-pages/
```

#### Monitor Storage Usage

```bash
# Check directory sizes
du -sh pages/ required-pages/

# Count pages per directory
find pages/ -name "*.md" | wc -l
find required-pages/ -name "*.md" | wc -l
```

#### Backup Strategy

**Automated Backups:**

```json
{
  "amdwiki.backup.required-pages": {
    "enabled": true,
    "frequency": "hourly",
    "retention": "90d",
    "priority": "high"
  },
  "amdwiki.backup.pages": {
    "enabled": true,
    "frequency": "6h",
    "retention": "30d",
    "priority": "normal"
  }
}
```

#### Migration Checklist

When moving a page between directories:

1. ✅ Update `system-category` in frontmatter
2. ✅ Save page (system will auto-route)
3. ✅ Verify page appears in correct directory
4. ✅ Check all links to page still work
5. ✅ Update any bookmarks or references
6. ✅ Delete old file from wrong directory (if needed)

---

## Examples

### Example 1: Creating a Documentation Page

**Scenario:** You want to create an official guide for using footnotes.

**Steps:**

1. **Create new page** in wiki interface
2. **Set metadata:**

```yaml
---
title: Markdown Footnotes Guide
system-category: documentation  # ← Important!
user-keywords:
  - documentation
  - markdown
  - footnotes
author: Technical Writer Team
---
```

1. **Write content**
2. **Save** → System automatically:
   - Generates UUID: `443c95f1-0b21-494a-b712-08ce0dc933e1`
   - Routes to: `required-pages/443c95f1-0b21-494a-b712-08ce0dc933e1.md`
   - Sets permissions: Editor+ can edit, all can view

**Result:** Page appears at `/wiki/FootnoteExample` and is stored in `required-pages/`.

### Example 2: Creating a Personal Note

**Scenario:** You want to keep project notes.

**Steps:**

1. **Create new page**
2. **Set metadata:**

```yaml
---
title: Q4 Project Planning
system-category: user  # ← Routes to pages/
user-keywords:
  - project
  - planning
  - Q4
author: jane.smith
---
```

1. **Write content**
2. **Save** → System automatically:
   - Generates UUID: `7a8b9c0d-1e2f-3g4h-5i6j-7k8l9m0n1o2p`
   - Routes to: `pages/7a8b9c0d-1e2f-3g4h-5i6j-7k8l9m0n1o2p.md`
   - Sets permissions: Standard user access

**Result:** Page appears at `/wiki/Q4%20Project%20Planning` and is stored in `pages/`.

### Example 3: Moving a Page Between Directories

**Scenario:** A draft page became official documentation.

**Original Metadata (in `pages/`):**

```yaml
---
title: API Reference Draft
system-category: user  # Draft in pages/
---
```

**Updated Metadata:**

```yaml
---
title: API Reference
system-category: documentation  # Now official
---
```

**System Behavior:**

1. User edits page and changes `system-category` to `documentation`
2. User clicks Save
3. System detects category change
4. System routes page to `required-pages/`
5. Old file in `pages/` remains (should be deleted by admin)
6. Page now appears from `required-pages/` with higher protection

### Example 4: System Page Categories

**Navigation Menu (System Page):**

```yaml
---
title: LeftMenu
uuid: 110fc9ee-90ca-4e6d-b6fa-334ce3074205
system-category: system  # ← System infrastructure
---
```

**Stored in:** `required-pages/110fc9ee-90ca-4e6d-b6fa-334ce3074205.md`

**Admin Dashboard (System Page):**

```yaml
---
title: Admin Dashboard
system-category: system  # ← Admin-only
---
```

**Stored in:** `required-pages/[uuid].md` with admin-only access

---

## Frequently Asked Questions

### Q: Can I manually move a page between directories?

**A:** Not recommended. Always use the metadata approach:

❌ **Don't do this:**

```bash
mv pages/file.md required-pages/file.md
```

✅ **Do this instead:**

1. Edit page in wiki interface
2. Change `system-category` in frontmatter
3. Save page
4. System automatically routes to correct directory

**Why?** Manual moves can break:

- Internal links and references
- Cache entries
- Search index
- Page history

### Q: What happens if I use a non-existent category?

**A:** The system will use the default category (`general`), routing the page to `pages/`.

**Example:**

```yaml
system-category: nonexistent-category
```

**Result:** Page saved to `pages/` directory with `general` category.

**Recommendation:** Always use defined categories. Check configuration for available options.

### Q: Can I add custom categories?

**A:** Yes! Add them to `data/config/app-custom-config.json`:

```json
{
  "amdwiki.system-category": {
    "my-custom-category": {
      "label": "my-custom-category",
      "description": "My custom content type",
      "default": false,
      "storageLocation": "regular",  // or "required"
      "enabled": true
    }
  }
}
```

**Restart required:** Server must restart to load new categories.

### Q: Why are filenames UUIDs instead of page titles?

**A:** UUID filenames provide:

- **Uniqueness:** No conflicts even with identical titles
- **Stability:** Renaming page doesn't break file references
- **Security:** Harder to guess filenames
- **Internationalization:** Works with any character set in titles
- **URL Safety:** No encoding issues

### Q: How do I find a page file on disk?

#### Method 1: Via Web Interface

1. View page in wiki
2. Scroll to "More Information" section
3. Note the UUID
4. Look for `[uuid].md` in appropriate directory

#### Method 2: Via Search**

```bash
cd amdWiki
grep -r "title: Your Page Title" pages/ required-pages/
```

#### Method 3: Via Filename Pattern**

```bash
# Search by title in frontmatter
find pages/ required-pages/ -name "*.md" -exec grep -l "title: Footnote" {} \;
```

### Q: Can pages be in both directories?

#### A:** No. Each page exists in exactly one directory based on its category. Duplicate pages should be avoided

### Q: What if a page has no frontmatter?

#### A:** The system will

1. Add default frontmatter on save
2. Assign default category (`general`)
3. Route to `pages/` directory
4. Generate UUID
5. Create slug from first heading

#### Better practice:** Always include complete frontmatter

### Q: How are permissions different between directories?

| Action | `pages/` | `required-pages/` |
| -------- | ---------- | ------------------- |
| View | All users | All users |
| Create | Contributor+ | Editor+ |
| Edit | Contributor+ | Editor+ |
| Delete | Editor+ | Admin only |
| Rename | Editor+ | Admin only |

**Note:** Specific permissions may vary based on your configuration.

---

## Troubleshooting

### Issue: Page not appearing after save

**Symptoms:**

- Page saved successfully
- Can't find page in wiki
- File exists on disk

**Diagnosis:**

```bash
# Check if file exists
ls -la pages/ required-pages/ | grep [uuid]

# Check frontmatter
cat pages/[uuid].md | head -15
```

**Solutions:**

1. **Check category spelling:**

   ```yaml
   # ❌ Typo
   system-category: documentaton

   # ✅ Correct
   system-category: documentation
   ```

2. **Verify category is enabled:**

   ```bash
   grep "documentation" config/app-default-config.json
   ```

3. **Restart server to reload:**

   ```bash
   ./server.sh restart
   ```

### Issue: Page in wrong directory

**Symptoms:**

- Documentation page in `pages/` instead of `required-pages/`
- Or vice versa

**Cause:** Category doesn't match storage location configuration

**Solution:**

1. **Check category configuration:**

   ```bash
   grep -A5 '"documentation"' config/app-default-config.json
   ```

2. **Verify `storageLocation` is correct:**

   ```json
   "documentation": {
     "storageLocation": "required"  // Should be "required" not "regular"
   }
   ```

3. **If configuration is correct, re-save page:**
   - Edit page
   - Don't change anything
   - Click Save
   - System will re-route to correct directory

### Issue: Cannot delete page

**Symptoms:**

- "Permission denied" when trying to delete
- Delete button disabled

**Cause:** Page is in `required-pages/` and user doesn't have admin rights

**Solutions:**

**Option 1:** Change category to move it out:

```yaml
# Change from:
system-category: documentation

# To:
system-category: user
```

Then admins can safely delete from `pages/`.

**Option 2:** Request admin assistance for deletion

**Option 3:** Archive instead of delete (recommended):

```yaml
# Add archived keyword
user-keywords:
  - archived
  - obsolete
```

### Issue: Links broken after page move

**Symptoms:**

- Internal wiki links return 404
- Page moved between directories

**Cause:** Wiki uses page name/slug for links, not UUID

**Solution:** Links should continue working if:

- Page title unchanged
- Page slug unchanged
- Only storage location changed

If links are broken:

1. Search for references to old page name
2. Update link syntax if needed
3. Consider using `[{TableOfContents}]` plugin for dynamic navigation

---

## Configuration Reference

### Storage Location Configuration

Located in: `config/app-default-config.json`

```json
{
  "_comment_system_category": "System category definitions with storage location mapping",
  "amdwiki.system-category": {
    "general": {
      "label": "general",
      "description": "General wiki pages",
      "default": true,
      "storageLocation": "regular",  // ← Routes to pages/
      "enabled": true
    },
    "system": {
      "label": "system",
      "description": "System configuration and infrastructure pages",
      "default": false,
      "storageLocation": "required",  // ← Routes to required-pages/
      "enabled": true
    },
    "documentation": {
      "label": "documentation",
      "description": "User and technical documentation",
      "default": false,
      "storageLocation": "required",  // ← Routes to required-pages/
      "enabled": true
    }
    // ... more categories
  }
}
```

### Directory Path Configuration

```json
{
  "amdwiki.page.provider.filesystem.storagedir": "./pages",
  "amdwiki.page.provider.filesystem.requiredpagesdir": "./required-pages"
}
```

### Access Control Configuration

```json
{
  "amdwiki.access.policies": [
    {
      "id": "admin-full-access",
      "subjects": [{"type": "role", "value": "admin"}],
      "resources": [{"type": "page", "pattern": "*"}],
      "actions": ["page:read", "page:edit", "page:create", "page:delete"]
    }
  ]
}
```

---

## Related Documentation

- [PageManager Documentation](../managers/PageManager.md) - Technical details on page storage
- [Configuration Guide](./Configuration-Guide.md) - How to configure categories
- [Access Control Guide](./Access-Control-Guide.md) - Permission management
- [Backup and Recovery](./Backup-Recovery.md) - Backup strategies

---

## Version History

| Version | Date | Changes |
| --------- | ------ | --------- |
| 1.0.0 | 2025-10-16 | Initial documentation |

---

**Questions or Issues?**

- Check the [Troubleshooting](#troubleshooting) section
- Visit the [Forum](http://localhost:3000/wiki/Forum)
- Contact support: <support@amdwiki.com>

---

**Last Updated:** 2025-10-16
**Maintained By:** amdWiki Documentation Team
**Status:** Current ✅
