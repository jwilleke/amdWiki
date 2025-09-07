---
uuid: 7f8e9d6c-5b4a-3921-8fed-cba098765432
category: Documentation
user-keywords:
  - Fixes
  - Bugs
  - Improvements
  - Development
title: Bug Fixes and Improvements
created: 2025-09-07T10:00:00.000Z
lastModified: 2025-09-07T10:30:00.000Z
---

# Bug Fixes and Improvements

## Page Creation Workflow Fix (2025-09-07)

**Problem**: When users navigated to edit a non-existent page (e.g., `/edit/new-page`), the system would immediately create the page file on disk using `createPageFromTemplate()`. If the user clicked "Cancel" instead of saving, the incomplete page file would remain on the file system.

**Root Cause**: The `editPage` method in `WikiRoutes.js` was calling `pageManager.createPageFromTemplate(pageName)` when a page didn't exist, which immediately saved the template to disk.

**Solution**:

1. **Added new method `generateTemplateData()`** in `PageManager.js`:
   - Generates template content and metadata without saving to disk
   - Returns a page object with `exists: false` flag to indicate it's template data
   - Allows the edit form to display template content without file creation

2. **Modified `editPage` method** in `WikiRoutes.js`:
   - Changed from `createPageFromTemplate()` to `generateTemplateData()`
   - File creation is now deferred until actual save action

**Files Modified**:

- `/src/managers/PageManager.js`: Added `generateTemplateData()` method
- `/src/routes/WikiRoutes.js`: Modified `editPage()` to use new method

**Workflow Changes**:

- **Before**: Navigate to `/edit/new-page` → File created immediately → Cancel leaves orphaned file
- **After**: Navigate to `/edit/new-page` → Template data generated in memory → Cancel leaves no trace → Save creates file only when confirmed

**Testing**:

- ✅ Navigate to `/edit/test-new-page` - no file created
- ✅ Cancel by navigating away - no orphaned files
- ✅ Save workflow still works correctly
- ✅ Existing pages continue to work normally

This fix ensures that page files are only created when users actually save content, preventing orphaned template files from cluttering the file system.

## Metadata Documentation Updates (2025-09-07)

**Added metadata to documentation pages**:

- ✅ Password Management.md - Added frontmatter with category "Documentation"
- ✅ FIXES.md - Added frontmatter with category "Documentation"
- ✅ Updated Wiki Documentation page with links to all documentation

**Metadata includes**:

- UUID for unique identification
- Category classification (Documentation, System/Admin)
- User keywords for search and organization
- Creation and modification timestamps
- Proper page titles

This improves page organization, searchability, and enables proper categorization within the wiki system.

## JSPWiki Security Analysis (2025-09-07)

**Evaluated JSPWiki Security Features**: Analyzed [JSPWiki Security Documentation](https://jspwiki-wiki.apache.org/Wiki.jsp?page=Wiki.Admin.Security) for compatibility with amdWiki.

**Key JSPWiki Security Features**:

- **Multi-level Authentication**: Anonymous → Asserted → Authenticated → Admin levels
- **Access Control Lists (ACLs)**: Page-level access using `[{ALLOW action user,role,group}]` syntax  
- **Wiki Groups**: User-created groups for access control
- **Security Policy Framework**: Java 2 policy-based default permissions
- **Container Integration**: LDAP, OAuth, database authentication support

**amdWiki Compatibility Assessment**:

✅ **Already Compatible**:

- Multi-level authentication (Anonymous, Authenticated, Admin roles)
- Role-based permissions system via UserManager
- OAuth/JWT authentication support
- Extensible user database design

🔄 **Enhancement Opportunities**:

- **Page-level ACLs**: Enable `[{ALLOW view admin,editors}]` syntax for fine-grained access
- **Wiki Groups**: User-created groups beyond admin-defined roles
- **Container Auth**: LDAP/Active Directory integration

**Recommendation**: JSPWiki's security model is excellent and largely compatible with our architecture. Consider implementing page-level ACLs as next security enhancement.

## Page-Level Access Control Lists (ACLs) Implementation (2025-09-07)

**Implemented JSPWiki-style page-level access control**: Added comprehensive ACL system with role-based permissions.

**Features Implemented**:

- **JSPWiki Syntax**: `[{ALLOW action role1,role2,user}]` markup in page content
- **Supported Actions**: view, edit, delete, rename, upload
- **Role Integration**: Works with existing admin, editor, contributor roles
- **User Support**: Individual usernames, built-in roles (anonymous, authenticated, all)
- **ACL Manager**: New dedicated manager for parsing and evaluating ACLs
- **Security Integration**: Integrated with existing UserManager permission system

**Files Created/Modified**:

- `/src/managers/ACLManager.js`: New ACL parsing and permission checking
- `/src/WikiEngine.js`: Registered ACLManager in engine initialization
- `/src/routes/WikiRoutes.js`: Added ACL checks to viewPage, editPage, savePage, deletePage
- `/pages/ACL Test Page.md`: Example page demonstrating ACL functionality

**ACL Syntax Examples**:

```markdown
[{ALLOW view admin,editor}]        # Only admin and editor can view
[{ALLOW edit admin}]               # Only admin can edit
[{ALLOW view authenticated}]       # Any logged-in user can view
[{ALLOW view all}]                 # Everyone can view
```

**Security Model**:

- **Deny by Default**: No ACL means fallback to role-based permissions
- **No DENY Rules**: Following JSPWiki philosophy for simpler security
- **Admin Override**: admin:system permission bypasses all ACLs
- **Content Cleaning**: ACL markup removed from rendered content

**Testing**:

- ✅ ACL parsing from page content
- ✅ Permission checking integrated with routes
- ✅ Role-based permission fallback
- ✅ Admin override functionality
- ✅ ACL markup removal for display

This implementation provides fine-grained page-level security while maintaining compatibility with our existing role-based architecture.
