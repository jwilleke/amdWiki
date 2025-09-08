---
uuid: acl-docs-2025-0907-wiki-security
categories: [System, Documentation]
user-keywords: [acl, security, permissions, authentication]
title: Access Control Lists (ACLs)
lastModified: '2025-09-08T17:35:00.000Z'
---

# Access Control Lists (ACLs)

amdWiki supports JSPWiki-style page-level access control using Access Control Lists (ACLs).

## Syntax

ACLs use the following syntax at the top of your page:

```markdown
[{ALLOW action principal1,principal2,principal3}]
```

### Actions

- **view** - Who can view the page
- **edit** - Who can edit the page  
- **delete** - Who can delete the page
- **rename** - Who can rename the page
- **upload** - Who can upload attachments to the page

### Principals

- **Roles**: admin, editor, contributor
- **Built-in**: anonymous, authenticated, all
- **Usernames**: Individual user names

## Examples

### Admin-Only Page
```markdown
[{ALLOW view admin}]
[{ALLOW edit admin}]
```

### Team Collaboration Page
```markdown
[{ALLOW view admin,editor,contributor}]
[{ALLOW edit admin,editor}]
[{ALLOW delete admin}]
```

### Public Read, Limited Edit
```markdown
[{ALLOW view all}]
[{ALLOW edit admin,editor}]
```

### Authenticated Users Only
```markdown
[{ALLOW view authenticated}]
[{ALLOW edit authenticated}]
```

## Security Model

- **Deny by Default**: If no ACL is specified, default role-based permissions apply
- **Admin Override**: Users with `admin:system` permission bypass all ACLs
- **No DENY Rules**: Following JSPWiki philosophy for simpler security
- **Role Integration**: ACLs work with existing role-based permission system

## Default Permissions

When no ACL is specified, these default permissions apply:

- **admin**: Full access to all actions
- **editor**: Can view, edit, create, delete, rename pages
- **contributor**: Can view, edit, create pages
- **anonymous**: Can view pages (if enabled)

## Implementation Notes

- ACL markup is automatically removed from page display
- ACLs are parsed when pages are accessed
- Permissions are checked on every page operation
- Compatible with existing authentication system

For more information, see the [Bug Fixes and Improvements] page.
