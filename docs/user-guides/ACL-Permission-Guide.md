# ACL Guide: How Page-Level ACLs Affect Generated Permissions

## Overview

amdWiki's Access Control Lists (ACLs) provide fine-grained control over who can perform what actions on wiki pages. When DigitalDocumentPermission functionality is enabled, these ACLs are automatically converted into machine-readable Schema.org permission objects, enhancing SEO and enabling external systems to understand your content access controls.

## ACL Syntax Reference

### Basic ACL Format

```
[{ALLOW action principal1,principal2,principal3}]
```

**Components:**
- `ALLOW` - Permission grant directive (DENY support planned for future)
- `action` - The action being permitted (view, edit, delete, rename, upload)
- `principal` - Who is granted permission (users, roles, or special groups)

### Supported Actions

| ACL Action | Description | Maps to Permission Type |
|------------|-------------|------------------------|
| `view` | View/read page content | `ReadPermission` |
| `edit` | Modify page content | `WritePermission` |
| `delete` | Delete the page | `DeletePermission` |
| `rename` | Rename/move the page | `RenamePermission` |
| `upload` | Upload attachments to page | `UploadPermission` |

### Principal Types

| Principal | Description | Schema.org Mapping |
|-----------|-------------|-------------------|
| `all` | Everyone (including anonymous) | Audience: "public" |
| `anonymous` | Non-logged-in users | Audience: "anonymous" |
| `authenticated` | Any logged-in user | Audience: "authenticated" |
| `asserted` | Users with session assertions | Audience: "asserted" |
| `admin` | Administrator role | Audience: "admin" |
| `editor` | Editor role | Audience: "editor" |
| `reader` | Reader role | Audience: "reader" |
| `developer` | Developer role | Audience: "developer" |
| `username` | Specific user | Person: "username" |

## ACL Examples and Generated Permissions

### Example 1: Public Read, Editor Write

**ACL Markup:**
```
[{ALLOW view all}] [{ALLOW edit editor,admin}]

This is a publicly readable page that only editors and admins can modify.
```

**Generated DigitalDocumentPermissions:**
```json
[
  {
    "@type": "DigitalDocumentPermission",
    "permissionType": "ReadPermission",
    "grantee": {
      "@type": "Audience",
      "audienceType": "public"
    }
  },
  {
    "@type": "DigitalDocumentPermission",
    "permissionType": "WritePermission",
    "grantee": {
      "@type": "Audience",
      "audienceType": "editor"
    }
  },
  {
    "@type": "DigitalDocumentPermission",
    "permissionType": "WritePermission",
    "grantee": {
      "@type": "Audience",
      "audienceType": "admin"
    }
  }
]
```

### Example 2: Restricted Admin Page

**ACL Markup:**
```
[{ALLOW view admin}] [{ALLOW edit admin}] [{ALLOW delete admin}]

# System Configuration
This page contains sensitive system configuration information.
```

**Generated DigitalDocumentPermissions:**
```json
[
  {
    "@type": "DigitalDocumentPermission",
    "permissionType": "ReadPermission",
    "grantee": {
      "@type": "Audience",
      "audienceType": "admin"
    }
  },
  {
    "@type": "DigitalDocumentPermission",
    "permissionType": "WritePermission",
    "grantee": {
      "@type": "Audience",
      "audienceType": "admin"
    }
  },
  {
    "@type": "DigitalDocumentPermission",
    "permissionType": "DeletePermission",
    "grantee": {
      "@type": "Audience",
      "audienceType": "admin"
    }
  }
]
```

### Example 3: User-Specific Permissions

**ACL Markup:**
```
[{ALLOW view all}] [{ALLOW edit john.doe,jane.smith}] [{ALLOW upload john.doe}]

# Project Documentation
This project documentation can be edited by specific team members.
```

**Generated DigitalDocumentPermissions:**
```json
[
  {
    "@type": "DigitalDocumentPermission",
    "permissionType": "ReadPermission",
    "grantee": {
      "@type": "Audience",
      "audienceType": "public"
    }
  },
  {
    "@type": "DigitalDocumentPermission",
    "permissionType": "WritePermission",
    "grantee": {
      "@type": "Person",
      "name": "john.doe"
    }
  },
  {
    "@type": "DigitalDocumentPermission",
    "permissionType": "WritePermission",
    "grantee": {
      "@type": "Person",
      "name": "jane.smith"
    }
  },
  {
    "@type": "DigitalDocumentPermission",
    "permissionType": "UploadPermission",
    "grantee": {
      "@type": "Person",
      "name": "john.doe"
    }
  }
]
```

### Example 4: Mixed Roles and Users

**ACL Markup:**
```
[{ALLOW view authenticated}] [{ALLOW edit developer,alice.admin}] [{ALLOW delete admin}]

# API Documentation
Authenticated users can read, developers and Alice can edit, only admins can delete.
```

**Generated DigitalDocumentPermissions:**
```json
[
  {
    "@type": "DigitalDocumentPermission",
    "permissionType": "ReadPermission",
    "grantee": {
      "@type": "Audience",
      "audienceType": "authenticated"
    }
  },
  {
    "@type": "DigitalDocumentPermission",
    "permissionType": "WritePermission",
    "grantee": {
      "@type": "Audience",
      "audienceType": "developer"
    }
  },
  {
    "@type": "DigitalDocumentPermission",
    "permissionType": "WritePermission",
    "grantee": {
      "@type": "Person",
      "name": "alice.admin"
    }
  },
  {
    "@type": "DigitalDocumentPermission",
    "permissionType": "DeletePermission",
    "grantee": {
      "@type": "Audience",
      "audienceType": "admin"
    }
  }
]
```

## Default Category Permissions vs ACL Overrides

### Without ACL (Category Defaults)

When a page has no ACL markup, permissions are generated based on the page category:

**General Category (Default):**
- ReadPermission: public
- WritePermission: editor, admin
- CreatePermission: editor, admin
- DeletePermission: admin
- CommentPermission: authenticated
- UploadPermission: editor, admin

**System Category (Default):**
- ReadPermission: public
- AdministerPermission: admin

### With ACL (Override Behavior)

When ACL markup is present on a page, it **completely overrides** the category defaults. Only the permissions explicitly defined in the ACL are generated.

**Example - General page with restrictive ACL:**
```
[{ALLOW view authenticated}] [{ALLOW edit admin}]

This general page is more restrictive than the category default.
```

**Result:** Only authenticated users can view, only admins can edit (no create, delete, comment, or upload permissions are generated).

## Best Practices for ACL Usage

### 1. Start with Category Defaults

For most pages, the category defaults provide appropriate permissions. Only add ACL markup when you need to deviate from these defaults.

### 2. Be Explicit About View Permissions

Always specify view permissions in your ACL if you're restricting access:

```
[{ALLOW view authenticated}] [{ALLOW edit editor}]
```

### 3. Consider Permission Hierarchy

Remember that higher-level roles typically include lower-level permissions:

```
[{ALLOW view all}] [{ALLOW edit reader,editor,admin}] [{ALLOW delete admin}]
```

### 4. Use Meaningful Principal Names

When specifying user-specific permissions, use clear usernames:

```
[{ALLOW edit project.manager}] [{ALLOW upload team.lead}]
```

### 5. Document Complex ACLs

For complex permission structures, add explanatory comments:

```
[{ALLOW view authenticated}] [{ALLOW edit developer}] [{ALLOW delete admin}]

# Development Documentation
# - All authenticated users can read
# - Only developers can edit code examples
# - Only admins can delete obsolete documentation
```

## ACL Validation and Error Handling

### Valid ACL Formats

✅ **Correct:**
```
[{ALLOW view all}]
[{ALLOW edit admin,editor}]
[{ALLOW upload john.doe}]
```

❌ **Invalid (will be ignored):**
```
[ALLOW view all]          // Missing braces
[{ALLOW view}]            // Missing principals
[{ALLOW invalidaction admin}]  // Invalid action
```

### Error Handling

When invalid ACL markup is encountered:

1. **Invalid actions** are skipped
2. **Empty principal lists** are ignored  
3. **Malformed syntax** falls back to category defaults
4. **Unknown principals** are treated as usernames

### Debugging ACL Issues

To troubleshoot ACL permission generation:

1. **Check the generated schema** in page source
2. **Verify ACL syntax** using the format examples
3. **Test with different user contexts**
4. **Review console warnings** for parsing errors

## Advanced ACL Patterns

### 1. Temporary Access

```
[{ALLOW view all}] [{ALLOW edit temp.editor}] 

# Project Review (Temporary Access)
# temp.editor account has editing access for review period
```

### 2. Team-Based Permissions

```
[{ALLOW view all}] 
[{ALLOW edit frontend.dev,backend.dev}] 
[{ALLOW upload design.lead}]
[{ALLOW delete project.manager}]

# Technical Specification
# Role-based access for different team functions
```

### 3. Staged Access Control

```
[{ALLOW view authenticated}] 
[{ALLOW edit editor}] 
[{ALLOW rename admin}] 
[{ALLOW delete admin}]

# Draft Policy Document
# Staged permissions for document lifecycle
```

## Testing Your ACLs

### Using the DigitalDocumentPermission Plugin

Add this to any page to see generated permissions:

```
[{AccessControlPlugin details='true'}]
```

### Manual Testing

1. **View page source** and examine JSON-LD schema
2. **Check Schema.org validator** for compliance
3. **Test with different user roles** to verify behavior
4. **Use browser developer tools** to inspect generated markup

## Troubleshooting Common Issues

### Issue: No Permissions Generated

**Cause:** Missing engine context or invalid ACL syntax

**Solution:** 
- Ensure WikiEngine is properly initialized
- Verify ACL syntax matches examples
- Check console for warning messages

### Issue: Wrong Permission Types

**Cause:** Unsupported ACL actions

**Solution:**
- Use only supported actions: view, edit, delete, rename, upload
- Check spelling and case sensitivity

### Issue: User Not Recognized

**Cause:** Username doesn't exist or role not found

**Solution:**
- Verify username exists in user management
- Check role names match UserManager configuration
- Use special principals (all, authenticated, etc.) for broader access

## Conclusion

ACL markup provides powerful fine-grained control over page permissions while automatically generating Schema.org compliant permission metadata. By understanding how ACLs map to DigitalDocumentPermission objects, you can create sophisticated access control policies that enhance both security and SEO for your amdWiki installation.
