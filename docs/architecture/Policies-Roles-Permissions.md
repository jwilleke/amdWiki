# Policies, Roles, and Permissions Architecture

## Overview

amdWiki uses a **Policy-Based Access Control (PBAC)** system inspired by JSPWiki's security framework. This architecture provides fine-grained control over who can access what resources and perform which actions.

## Terms

- Permissions (same as Actions) are the actions allowed to be performed on a Resource (i.g page) We caterogize permssions as:
  - Page Permissions
  - Attachment Permissions
  - Search Permissions
  - Admin Permissions
- Roles are a specific defined collection of Permissions
- Policy is how roles and permssions come together.
  - Defined in "amdwiki.access.policies"

## Core Components

### 1. PolicyEvaluator (`src/managers/PolicyEvaluator.js`)

The PolicyEvaluator is the central component that evaluates access requests against defined policies.

**Key Method:**

```javascript
async evaluateAccess(context)
```

**Parameters:**

- `context.pageName` - The page being accessed
- `context.action` - The action being performed (e.g., `page:read`, `admin:users`)
- `context.userContext` - User information including username, roles, and authentication status

**Returns:**

```javascript
{
  hasDecision: boolean,  // Whether a policy matched
  allowed: boolean,      // Whether access is granted
  reason: string,        // Human-readable reason
  policyName: string     // ID of the matching policy
}
```

### 2. Policy Structure

Policies are defined in `config/app-default-config.json` under `amdwiki.access.policies`:

```json
{
  "id": "admin-full-access",
  "name": "Administrator Full Access",
  "description": "Full system access for administrators",
  "priority": 100,
  "effect": "allow",
  "subjects": [
    {"type": "role", "value": "admin"}
  ],
  "resources": [
    {"type": "page", "pattern": "*"}
  ],
  "actions": [
    "page:read",
    "page:edit",
    "admin:users",
    ...
  ]
}
```

**Policy Fields:**

- `id` - Unique identifier
- `name` - Human-readable name
- `description` - Purpose of the policy
- `priority` - Higher priority policies are evaluated first (100 = highest)
- `effect` - `"allow"` or `"deny"`
- `subjects` - Who the policy applies to (roles, users)
- `resources` - What resources are covered (pages, patterns)
- `actions` - Which actions are permitted/denied

### 3. Roles

Roles are assigned to users and define their capabilities through policies.

**Built-in Roles:**

- `admin` - Full system access (priority 100)
- `editor` - Can create, edit, and delete pages (priority 80)
- `contributor` - Can create and edit pages (priority 70)
- `reader` - Can read and search content (priority 60)
- `anonymous` - Unauthenticated users (priority 50)

**Special Roles:**

- `Authenticated` - Automatically added to all logged-in users
- `All` - Automatically added to everyone (including anonymous)

### 4. Actions (Permissions)

Actions are namespaced strings representing operations:

**Page Permissions:**

- `page:read` - View pages
- `page:edit` - Modify existing pages
- `page:create` - Create new pages
- `page:delete` - Delete pages
- `page:rename` - Rename pages

**Attachment Permissions:**

- `attachment:upload` - Upload file attachments
- `attachment:delete` - Delete attachments

**Export Permissions:**

- `export:pages` - Export pages to various formats

**Search Permissions:**

- `search:all` - Search all content
- `search:restricted` - Search restricted/private content

**Admin Permissions:**

- `admin:users` - Manage users
- `admin:roles` - Manage roles and permissions
- `admin:config` - Modify system configuration
- `admin:system` - Full system administration

## Default Policies

The system includes 7 default policies defined in `config/app-default-config.json`:

### 1. admin-full-access (Priority 100)

- **Subject:** admin role
- **Actions:** All 14 permissions
- **Effect:** Allow
- Administrators have unrestricted access to all features.

### 2. deny-anonymous-system-pages (Priority 90)

- **Subject:** anonymous role
- **Resources:** Pages matching `*Admin*`, `*System*`, `*Config*`
- **Actions:** All
- **Effect:** Deny
- Prevents anonymous users from accessing system/admin pages.

### 3. editor-permissions (Priority 80)

- **Subject:** editor role
- **Actions:** 9 page permissions (read, edit, create, delete, rename, upload, export, search)
- **Effect:** Allow
- Editors can manage content but not administer the system.

### 4. contributor-permissions (Priority 70)

- **Subject:** contributor role
- **Actions:** 6 permissions (read, edit, create, upload, search all)
- **Effect:** Allow
- Contributors can create and edit but not delete content.

### 5. reader-permissions (Priority 60)

- **Subject:** reader role
- **Actions:** 3 permissions (read, search all, search restricted)
- **Effect:** Allow
- Readers have read-only access to all content.

### 6. anonymous-read-only (Priority 50)

- **Subject:** anonymous role
- **Actions:** page:read only
- **Effect:** Allow
- Anonymous users can view non-system pages.

### 7. default-view-for-all (Priority 1)

- **Subject:** All role
- **Actions:** page:read
- **Effect:** Allow
- Fallback policy - everyone can read pages unless denied by higher-priority policy.

## How Policies Are Evaluated

1. **Policy Loading:**
   - Policies are loaded from configuration at startup
   - ACLManager loads policies into PolicyEvaluator

2. **Access Check Flow:**

   ``` text
   User Request → ACLManager.checkPagePermission()
                ↓
   Action Mapping (view → page:read)
                ↓
   PolicyEvaluator.evaluateAccess()
                ↓
   Check Each Policy (by priority)
                ↓
   First Match Wins → Return Decision
   ```

3. **Matching Logic:**
   - Policies are checked in priority order (highest first)
   - For each policy, three checks are performed:
     - **Subject Match:** Does user have required role?
     - **Resource Match:** Does the page match the pattern?
     - **Action Match:** Is the requested action in the policy?
   - First policy where all three match determines the outcome
   - If no policy matches, access is denied

4. **Action Name Mapping:**
   Legacy action names are mapped to policy actions in ACLManager:

   ```javascript
   const actionMap = {
     'view': 'page:read',
     'edit': 'page:edit',
     'delete': 'page:delete',
     'create': 'page:create',
     'rename': 'page:rename',
     'upload': 'attachment:upload'
   };
   ```

## Integration Points

### UserManager.hasPermission()

Used for generic permission checks (admin routes, features):

```javascript
async hasPermission(username, action) {
  // Builds user context with roles
  const userContext = {
    username: user.username,
    roles: [...user.roles, 'Authenticated', 'All'],
    isAuthenticated: true
  };

  // Evaluates using PolicyEvaluator with generic page '*'
  const result = await policyEvaluator.evaluateAccess({
    pageName: '*',
    action: action,
    userContext: userContext
  });

  return result.allowed;
}
```

### ACLManager.checkPagePermission()

Used for page-specific access control:

```javascript
async checkPagePermission(pageName, action, userContext, pageContent) {
  // 1. Map legacy action names to policy actions
  const policyAction = actionMap[action.toLowerCase()] || action;

  // 2. Evaluate global policies first
  const policyResult = await policyEvaluator.evaluateAccess({
    pageName,
    action: policyAction,
    userContext
  });

  if (policyResult.hasDecision) {
    return policyResult.allowed;
  }

  // 3. Check page-level ACLs if no policy matched
  // 4. Default deny if nothing matched
}
```

## User Context Construction

User contexts are built consistently across the system:

**Anonymous Users:**

```javascript
{
  username: 'Anonymous',
  roles: ['anonymous', 'All'],
  isAuthenticated: false
}
```

**Authenticated Users:**

```javascript
{
  username: 'jim',
  roles: ['reader', 'editor', 'admin', 'Authenticated', 'All'],
  isAuthenticated: true
}
```

Note: `Authenticated` and `All` roles are automatically added.

## Example Access Checks

### Example 1: Anonymous User Views Welcome Page

``` text
Request: GET /wiki/Welcome
User: Anonymous
Action: view → page:read

Policy Evaluation:
1. admin-full-access: NO (not admin role)
2. deny-anonymous-system-pages: NO (Welcome doesn't match *Admin*)
3. editor-permissions: NO (not editor role)
4. contributor-permissions: NO (not contributor role)
5. reader-permissions: NO (not reader role)
6. anonymous-read-only: NO (anonymous role but needs resource match)
7. default-view-for-all: YES (All role, page:read, * pattern)

Result: ALLOWED (policy: default-view-for-all)
```

### Example 2: Admin User Accesses Admin Roles

``` text
Request: GET /admin/roles
User: jim (roles: admin)
Action: admin:roles

Policy Evaluation:
1. admin-full-access: YES (admin role, admin:roles action, * pattern)

Result: ALLOWED (policy: admin-full-access)
```

### Example 3: Anonymous User Tries Admin Page

``` text
Request: GET /admin/users
User: Anonymous
Action: admin:users

Policy Evaluation:
1. admin-full-access: NO (not admin role)
2. deny-anonymous-system-pages: YES (anonymous, page matches *Admin*, deny)

Result: DENIED (policy: deny-anonymous-system-pages)
```

### Example 4: Editor Creates Page

``` text
Request: POST /create
User: editor_user (roles: editor)
Action: page:create

Policy Evaluation:
1. admin-full-access: NO (not admin role)
2. deny-anonymous-system-pages: N/A (not anonymous)
3. editor-permissions: YES (editor role, page:create in actions, * pattern)

Result: ALLOWED (policy: editor-permissions)
```

## Logging and Debugging

The system provides extensive logging for troubleshooting:

``` text
[POLICY] Evaluate page=Welcome action=page:read user=Anonymous roles=Anonymous|All
[POLICY] Check policy=admin-full-access effect=allow match=false
[POLICY] Check policy=default-view-for-all effect=allow match=true
[ACL] PolicyEvaluator decision hasDecision=true allowed=true policy=default-view-for-all
```

## Adding Custom Policies

To add a new policy, edit `config/app-default-config.json`:

```json
{
  "id": "moderator-access",
  "name": "Moderator Permissions",
  "description": "Moderators can edit and delete but not create",
  "priority": 75,
  "effect": "allow",
  "subjects": [
    {"type": "role", "value": "moderator"}
  ],
  "resources": [
    {"type": "page", "pattern": "*"}
  ],
  "actions": [
    "page:read",
    "page:edit",
    "page:delete"
  ]
}
```

## Security Considerations

1. **Priority Matters:** Higher priority policies override lower ones. Place deny policies before allow policies.
2. **Default Deny:** If no policy matches, access is denied by default.
3. **Role Accumulation:** Users accumulate roles (`Authenticated`, `All`) automatically. Be careful with `All` role policies.
4. **Resource Patterns:** Use specific patterns for sensitive resources to avoid unintended access.

5. **Action Granularity:** Separate admin actions (`admin:*`) from page actions (`page:*`) to prevent privilege escalation.

## Files Typically Affected

- `src/managers/ACLManager.js` - Action name mapping, policy evaluation integration
- `src/managers/UserManager.js` - Policy-based hasPermission() implementation
- `src/managers/PolicyEvaluator.js` - Core policy evaluation logic
- `src/routes/WikiRoutes.js` - Async permission checks with await
- `config/app-default-config.json` - Policy definitions

## Related Documentation

- [JSPWiki Rendering](./JSPWiki-rendering.md)
- [Page Metadata](./page-metadata.md)
