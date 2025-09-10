---
uuid: acl-test-01-abcd-efgh-ijkl-mnop
category: Testing
user-keywords: [acl, access, control, test]
title: ACL Test Page
slug: acl-test-page
created: 2025-09-07T10:45:00.000Z
lastModified: 2025-09-10T12:00:00.000Z
---
[{ALLOW view admin,editor}]
[{ALLOW edit admin}]

# ACL Test Page

This page demonstrates Access Control Lists (ACLs) in amdWiki.

## Access Controls

- **View**: Only admin and editor roles can view this page
- **Edit**: Only admin role can edit this page

## JSPWiki-Style ACL Syntax

This page uses JSPWiki-style ACL syntax:

```
[{ALLOW view admin,editor}]
[{ALLOW edit admin}]
```

## Testing

If you can see this page, you have view permission. Try editing to test edit permissions.

## Role-Based Access

Our ACL system integrates with the existing role-based permission system:

- **admin**: Full access to everything
- **editor**: Can view and edit most pages
- **contributor**: Limited access
- **anonymous**: Public access where allowed

This provides fine-grained control while maintaining compatibility with our existing architecture.
