---
title: "Authentication States Implementation"
description: "Technical documentation for user authentication states: Anonymous, Asserted, and Authenticated"
categories: [System, Documentation]
user-keywords: []
author: "System"
created: "2025-09-07"
---

# Authentication States Implementation

## Overview

The amdWiki system now supports three distinct user authentication states, providing more granular access control than traditional anonymous/authenticated systems.

## User State Definitions

### 1. Anonymous User
- **Condition**: No session cookie present
- **Username**: `anonymous`
- **Assigned Role**: `anonymous`
- **Typical Permissions**: Very limited (public read-only access)
- **Use Case**: First-time visitors, public browsing

### 2. Asserted User  
- **Condition**: Has session cookie but session is expired or invalid
- **Username**: `asserted`
- **Assigned Role**: `reader`
- **Typical Permissions**: More than anonymous (can read most content)
- **Use Case**: Previous users whose sessions expired, returning visitors

### 3. Authenticated User
- **Condition**: Valid session cookie with active session
- **Username**: Actual username from session
- **Assigned Roles**: User's assigned roles (admin, editor, contributor, reader)
- **Typical Permissions**: Full permissions based on user roles
- **Use Case**: Logged-in users

## Implementation Details

### UserManager.getCurrentUser()

The `getCurrentUser()` method now returns different user objects:

```javascript
// Anonymous user (no cookie)
{
  username: 'anonymous',
  displayName: 'Anonymous User', 
  roles: ['anonymous'],
  isAuthenticated: false
}

// Asserted user (has cookie, invalid session)
const assertedUser = {
  username: 'asserted',
  displayName: 'Asserted User',

// Authenticated user (valid session)
{
  username: 'actualUsername',
  displayName: 'User Display Name',
  roles: ['admin', 'editor'], // User's actual roles
  isAuthenticated: true
}
```

### Permission Checking

The `hasPermission()` method handles special cases:

- `null` or `'anonymous'` username → checks `anonymous` role permissions
- `'asserted'` username → checks `reader` role permissions  
- Regular username → checks user's assigned role permissions

### ACL Integration

The ACLManager supports all three states in ACL syntax:

```
[{ALLOW view anonymous}]        // Only anonymous users
[{ALLOW view asserted}]  // Users with expired sessions
[{ALLOW view authenticated}]    // Only valid authenticated users
[{ALLOW view reader}]           // Both asserted and reader role users
```

## Testing and Debugging

### User Info Endpoint

Visit `/user-info` to see current user state:

```json
{
  "currentUser": {...},
  "sessionId": "abc123...",
  "sessionExists": true/false,
  "sessionExpired": true/false,
  "userType": "Anonymous|Asserted|Authenticated",
  "hasSessionCookie": true/false,
  "permissions": [...]
}
```

### Test Scenarios

1. **Anonymous Access**: Clear all cookies, visit any page
2. **Asserted Access**: Login, then logout (cookie remains but session deleted)
3. **Session Expiry**: Login, wait 24 hours, revisit (session expired but cookie remains)
4. **Authenticated Access**: Login with valid credentials

## Benefits

### Enhanced User Experience
- Returning users get better permissions even with expired sessions
- Smoother transition from anonymous to authenticated states
- More intuitive access patterns

### Improved Security
- Granular control over different user states
- Better tracking of user engagement
- Flexible permission assignment

### Administrative Control
- Clear distinction between never-visited and returning users
- Better analytics on user behavior
- Customizable permissions per state

## Configuration

### Default Role Permissions

- **Anonymous**: `['page:read']` (very limited)
- **Reader**: `['page:read', 'search:all', 'export:pages']` (broader access)
- **Contributor**: Add create/edit permissions
- **Editor**: Add delete/rename permissions  
- **Admin**: Full system access

### Customization

Administrators can modify role permissions through `/admin/roles` to adjust the access levels for each user state.

## Technical Notes

- Session cookies persist after logout to maintain asserted state
- Sessions expire after 24 hours by default
- ACL parsing recognizes all three user types as valid principals
- Backward compatibility maintained with existing ACL syntax
