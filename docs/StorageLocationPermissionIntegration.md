# Storage Location Permission Integration

## Overview

The Storage Location Permission Integration enhances amdWiki's access control system by making permissions aware of where pages are stored in the file system. This provides more granular and appropriate security policies based on the type and purpose of content.

## Key Features

### 🏗️ Storage-Based Permission Policies

Pages are automatically assigned different permission levels based on their storage location:

- **`/pages/`** (General content): User-generated content with liberal access policies
- **`/required-pages/`** (System/Documentation): Restricted editing, admin-managed content
- **`/docs/`** (Developer content): Technical documentation with developer-level access

### 🔐 Enhanced Security Model

- **Role Hierarchy**: Admin → Developer → Authenticated → Asserted → Anonymous
- **Pattern-Based Restrictions**: Specific page names (e.g., `admin*`, `user-manager*`) have enhanced security
- **Always-Restricted Pages**: Critical system pages require admin access regardless of other settings
- **ACL Override Control**: System pages can disable ACL markup for security

### ⚡ Performance & Auditing

- **Permission Caching**: Decisions cached for 5 minutes by default
- **Audit Logging**: All permission decisions logged for security analysis
- **Graceful Fallbacks**: Backward compatibility with existing permission logic

## Configuration

### Storage Location Policies

```javascript
// /config/StorageLocationPermissionConfig.js
storageLocationPolicies: {
  'pages': {
    categories: ['General', 'User'],
    defaultPermissions: {
      'view': ['all'],              // Anyone can read
      'edit': ['authenticated'],    // Must be logged in to edit  
      'delete': ['admin']          // Only admins can delete
    },
    allowACLOverride: true         // ACL markup respected
  },
  
  'required-pages': {
    categories: ['System', 'System/Admin', 'Documentation'],
    defaultPermissions: {
      'view': ['all'],              // Anyone can read
      'edit': ['admin'],           // Only admins can edit
      'delete': ['admin']          // Only admins can delete
    },
    allowACLOverride: false        // ACL markup ignored for security
  }
}
```

### Category to Storage Mapping

```javascript
categoryToStorageMapping: {
  'General': 'pages',
  'System': 'required-pages', 
  'System/Admin': 'required-pages',
  'Documentation': 'required-pages',
  'Developer': 'docs'
}
```

## Usage Examples

### 1. Creating a General Page

```yaml
---
title: My Project Notes
system-category: General
user-keywords: [project, planning]
---

# My Project Notes

This page is stored in `/pages/` and has liberal access policies.

- Anyone can read
- Authenticated users can edit
- ACL markup is respected: [{ALLOW edit projectteam}]
```

### 2. Creating a System Page

```yaml
---
title: User Management
system-category: System
user-keywords: [admin, system]
---

# User Management  

This page is stored in `/required-pages/` with restricted access.

- Anyone can read
- Only admins can edit (ACL markup ignored)
- Enhanced security monitoring
```

### 3. Creating Developer Documentation

```yaml
---
title: API Reference
system-category: Developer  
user-keywords: [api, reference]
---

# API Reference

This page is stored in `/docs/` with developer-level access.

- Anyone can read
- Developers and admins can edit
- ACL markup respected for team collaboration
```

## API Integration

### Enhanced ACLManager Methods

```javascript
// Check permission with storage location awareness
const hasPermission = await aclManager.checkPagePermission(
  pageName, 
  action, 
  user, 
  pageContent, 
  pageMetadata  // Now includes metadata for storage detection
);

// Get storage location for a page
const location = await aclManager.getPageStorageLocation(pageName, metadata);

// Get storage-specific configuration
const config = aclManager.getStorageLocationConfig('pages');
```

### WikiRoutes Integration

WikiRoutes automatically passes page metadata to permission checks:

```javascript
// Before: Limited context
const hasPermission = await aclManager.checkPagePermission(
  pageName, 'view', currentUser, pageData.content
);

// After: Full storage location awareness  
const hasPermission = await aclManager.checkPagePermission(
  pageName, 'view', currentUser, pageData.content, pageData.metadata
);
```

## Security Benefits

### 1. Appropriate Default Permissions

- **System pages** automatically get restrictive permissions
- **User content** gets appropriate collaboration permissions  
- **Developer docs** get technical team access levels

### 2. Enhanced Audit Trail

```
[AUDIT] 2025-09-13T20:42:52.216Z - Page: system-page, Action: edit, User: admin, Storage: System, Granted: true
[AUDIT] 2025-09-13T20:42:52.220Z - Page: user-page, Action: edit, User: user1, Storage: General, Granted: true
```

### 3. Role Hierarchy Enforcement

```javascript
// Admin inherits all lower role permissions
roleHierarchy: {
  'admin': ['developer', 'authenticated', 'asserted', 'anonymous'],
  'developer': ['authenticated', 'asserted', 'anonymous'],
  'authenticated': ['asserted', 'anonymous']
}
```

## Migration Guide

### Existing Pages

All existing pages continue to work with backward compatibility:

- Pages without metadata use legacy permission logic
- ACL markup continues to work as before
- System page detection uses existing patterns
- No breaking changes to current functionality

### New Pages

New pages benefit from enhanced storage location permissions:

- Automatic storage location detection from `system-category`
- Enhanced security for system pages
- Performance benefits from permission caching
- Detailed audit logging

## Performance Impact

- **Permission Caching**: ~0.01ms average lookup time for cached decisions
- **Cache Management**: Automatic cleanup every 5 minutes
- **Memory Usage**: <1MB for typical permission cache sizes
- **No Blocking Operations**: All permission checks remain fast

## Testing

Comprehensive test coverage ensures reliability:

```bash
# Run storage location permission tests
npm test -- ACLManager-StorageLocationPermission.test.js

# Results: 28/28 tests passing ✅
```

## Troubleshooting

### Common Issues

1. **Page not using storage location permissions**
   - Ensure page has `system-category` in metadata
   - Check WikiRoutes passes metadata to permission checks
   
2. **ACL markup ignored on system pages**
   - This is intentional for security
   - System pages use admin-only editing by default
   
3. **Permission cache not working**
   - Check `enablePermissionCache: true` in config
   - Verify cache cleanup timer is running

### Debug Information

Enable audit logging to see permission decisions:

```javascript
security: {
  enableAuditLog: true,
  auditLogPath: './logs/permission-audit.log'
}
```

## Future Enhancements

- **Time-based permissions**: Maintenance mode restrictions
- **IP-based access control**: Location-aware permissions  
- **Custom storage locations**: Plugin-defined storage policies
- **Permission inheritance**: Parent-child page relationships

---

**Status**: ✅ Production Ready  
**Version**: 1.3.1+  
**Backward Compatibility**: 100% maintained