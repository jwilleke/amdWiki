---
title: "User States Test"
description: "Testing different user authentication states"
category: "Testing"
tags: ["authentication", "users", "testing"]
author: "System"
created: "2025-09-07"
---

# User States Test

This page demonstrates the different user authentication states in the wiki system.

## User State Definitions

### 1. Anonymous User
- **No session cookie** present
- Assigned role: `anonymous`
- Limited permissions (typically read-only for public pages)

### 2. Asserted User
- **Has session cookie** but session is expired or invalid
- Assigned role: `reader` 
- More permissions than anonymous (can read most content)
- Has attempted authentication before

### 3. Authenticated User
- **Valid session cookie** with active session
- Assigned roles based on user account (admin, editor, contributor, reader)
- Full permissions based on assigned roles

## ACL Examples

Test different ACL configurations:

[{ALLOW view anonymous}]
This text is visible to anonymous users.

[{ALLOW view reader}]
This text is visible to asserted users with session cookies.

[{ALLOW view authenticated}]
This text is only visible to authenticated users.

[{ALLOW view admin}]
This text is only visible to admin users.

## Testing Instructions

1. **Test Anonymous Access:**
   - Clear all cookies and visit this page
   - Should see first ACL section only

2. **Test Asserted Access:**
   - Login to get a session cookie
   - Logout or wait for session to expire
   - Visit this page with expired cookie
   - Should see first two ACL sections

3. **Test Authenticated Access:**
   - Login with valid credentials
   - Should see sections based on user role

## Implementation Details

The system now distinguishes between three user states:

- `getCurrentUser()` returns `null` for anonymous users (no cookie)
- `getCurrentUser()` returns asserted user object for expired sessions
- `getCurrentUser()` returns full user object for valid sessions

This allows for more granular access control and better user experience.
