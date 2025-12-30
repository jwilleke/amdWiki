# ACLManager Complete Guide

**Module:** `src/managers/ACLManager.js`
**Quick Reference:** [ACLManager.md](ACLManager.md)
**Generated API:** [API Docs](../api/generated/src/managers/ACLManager/README.md)

---

## Table of Contents

1. [Architecture](#architecture)
2. [Initialization](#initialization)
3. [Configuration](#configuration)
4. [ACL Markup Syntax](#acl-markup-syntax)
5. [Permission Checking Methods](#permission-checking-methods)
6. [Context-Aware Restrictions](#context-aware-restrictions)
7. [Audit Logging](#audit-logging)
8. [API Reference](#api-reference)
9. [Integration Examples](#integration-examples)

---

## Architecture

```text
┌─────────────────────────────────────────────────────────┐
│                    ACLManager                            │
│  - parsePageACL(content)                                │
│  - checkPagePermissionWithContext(wikiContext, action)  │
│  - checkContextRestrictions(user, context)              │
└────────────────┬────────────────────────────────────────┘
                 │
         ┌───────┼───────┬───────────────┐
         ▼       ▼       ▼               ▼
┌─────────────┐ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐
│ PolicyEval  │ │ UserManager  │ │ ConfigMgr   │ │ NotifyMgr    │
│ (policies)  │ │ (roles)      │ │ (settings)  │ │ (audit)      │
└─────────────┘ └──────────────┘ └──────────────┘ └──────────────┘
```

### Properties

| Property | Type | Description |
| ---------- | ------ | ------------- |
| `accessPolicies` | `Map<string, Object>` | Global access policies loaded from config |
| `policyEvaluator` | `PolicyEvaluator\|null` | Reference to PolicyEvaluator manager |

---

## Initialization

```javascript
async initialize() {
  const configManager = this.engine.getManager('ConfigurationManager');
  const policies = configManager.getProperty('amdwiki.access.policies', []);
  this.accessPolicies = new Map(policies.map(p => [p.id, p]));

  this.policyEvaluator = this.engine.getManager('PolicyEvaluator');
}
```

ACLManager requires:

- **ConfigurationManager** - For loading policies and settings
- **PolicyEvaluator** - For global policy evaluation (optional but recommended)

---

## Configuration

All settings come from ConfigurationManager:

```json
{
  "amdwiki.access.policies": [
    {
      "id": "admin-full-access",
      "roles": ["admin"],
      "actions": ["*"],
      "effect": "allow"
    }
  ],
  "amdwiki.accessControl.contextAware.enabled": true,
  "amdwiki.accessControl.contextAware.timeZone": "UTC",
  "amdwiki.features.maintenance.enabled": false,
  "amdwiki.features.maintenance.allowAdmins": true,
  "amdwiki.schedules.enabled": true,
  "amdwiki.schedules.businessHours": {
    "enabled": false,
    "days": ["monday", "tuesday", "wednesday", "thursday", "friday"],
    "start": "09:00",
    "end": "17:00"
  },
  "amdwiki.holidays.enabled": false,
  "amdwiki.holidays.dates": {},
  "amdwiki.holidays.recurring": {}
}
```

---

## ACL Markup Syntax

### Format

```
[{ALLOW action1, action2 principal1, principal2}]
```

### Examples

```wiki
[{ALLOW view All}]
[{ALLOW edit Admin, Editor}]
[{ALLOW delete Admin}]
[{ALLOW view, edit Authenticated}]
```

### Parsing Method

```javascript
parsePageACL(content) {
  const acl = new Map();
  // Regex: /\[\{\s*ALLOW\s+([a-z, ]+)\s+([^}]+)\s*\}\]/gi
  // Returns Map<action, Set<principals>>
}
```

**Returns:** `Map<string, Set<string>>` where:

- Key = action (lowercase)
- Value = Set of allowed principals

---

## Permission Checking Methods

### checkPagePermissionWithContext (Recommended)

```javascript
async checkPagePermissionWithContext(wikiContext, action)
```

Uses WikiContext as the single source of truth:

```javascript
const canEdit = await aclManager.checkPagePermissionWithContext(wikiContext, 'edit');
```

**Parameters:**

- `wikiContext` - WikiContext with pageName, userContext, content
- `action` - Action to check: view, edit, delete, create, rename, upload

**Returns:** `Promise<boolean>`

**Evaluation Flow:**

1. Map action to policy action (e.g., `view` → `page:read`)
2. Call PolicyEvaluator.evaluateAccess() if available
3. If policy decides, log and return
4. Parse page content for ACL markup
5. Check if user/roles match ACL principals
6. Default deny if no match

### checkPagePermission (Deprecated)

```javascript
async checkPagePermission(pageName, action, userContext, pageContent)
```

Legacy method - use `checkPagePermissionWithContext` instead.

### performStandardACLCheck

```javascript
async performStandardACLCheck(pageName, action, user, pageContent)
```

Standard ACL check without policy evaluation:

- Checks admin:system permission first
- Parses ACL from content
- Falls back to role-based defaults

---

## Context-Aware Restrictions

### checkContextRestrictions

```javascript
async checkContextRestrictions(user, context)
// Returns: { allowed: boolean, reason: string }
```

Checks all context restrictions:

1. Maintenance mode
2. Business hours
3. Holiday restrictions

### checkMaintenanceMode

```javascript
checkMaintenanceMode(user, maintenanceConfig)
```

```javascript
const result = aclManager.checkMaintenanceMode(user, {
  enabled: true,
  allowedRoles: ['admin']
});
// { allowed: false, reason: 'maintenance_mode', message: '...' }
```

### checkBusinessHours

```javascript
checkBusinessHours(businessHoursConfig, timeZone)
```

Checks if current time is within configured business hours.

### checkEnhancedTimeRestrictions

```javascript
async checkEnhancedTimeRestrictions(user, context)
```

Comprehensive time-based checking:

1. Check holidays first (they override all)
2. Check custom schedules
3. Fall back to business hours

### checkHolidayRestrictions

```javascript
async checkHolidayRestrictions(currentDate, holidaysConfig)
```

Checks both exact dates and recurring holidays:

- Exact: `"2025-12-25": { "name": "Christmas" }`
- Recurring: `"*-12-25": { "name": "Christmas" }`

---

## Audit Logging

### logAccessDecision

```javascript
logAccessDecision(userOrObj, pageName, action, allowed, reason, context)
// Or single object form:
logAccessDecision({
  user: userContext,
  pageName: 'Main',
  action: 'edit',
  allowed: true,
  reason: 'page_acl_role_Admin',
  context: {}
})
```

Logs to:

- Engine logger (info for allowed, warn for denied)
- NotificationManager for UI surfacing

---

## API Reference

### Core Methods

| Method | Parameters | Returns |
| -------- | ------------ | --------- |
| `initialize()` | - | `Promise<void>` |
| `parsePageACL(content)` | string | `Map<string, Set<string>>` |
| `checkPagePermissionWithContext(wikiContext, action)` | WikiContext, string | `Promise<boolean>` |
| `checkPagePermission(pageName, action, userContext, pageContent)` | string, string, Object, string | `Promise<boolean>` |
| `performStandardACLCheck(pageName, action, user, pageContent)` | string, string, Object, string | `Promise<boolean>` |
| `checkDefaultPermission(action, user)` | string, Object | `Promise<boolean>` |

### Context Methods

| Method | Parameters | Returns |
| -------- | ------------ | --------- |
| `checkContextRestrictions(user, context)` | Object, Object | `Promise<Object>` |
| `checkMaintenanceMode(user, config)` | Object, Object | Object |
| `checkBusinessHours(config, timeZone)` | Object, string | Object |
| `checkEnhancedTimeRestrictions(user, context)` | Object, Object | `Promise<Object>` |
| `checkHolidayRestrictions(date, config)` | string, Object | `Promise<Object>` |

### Utility Methods

| Method | Parameters | Returns |
| -------- | ------------ | --------- |
| `removeACLMarkup(content)` | string | string |
| `stripACLMarkup(content)` | string | string |
| `logAccessDecision(...)` | various | void |

---

## Integration Examples

### Route Protection

```javascript
app.get('/wiki/:pageName/edit', async (req, res) => {
  const aclManager = engine.getManager('ACLManager');
  const wikiContext = await engine.createWikiContext(req.params.pageName, req.user);

  const canEdit = await aclManager.checkPagePermissionWithContext(wikiContext, 'edit');
  if (!canEdit) {
    return res.status(403).render('error', { message: 'Access denied' });
  }
  // ... render edit page
});
```

### Stripping ACL from Display

```javascript
const aclManager = engine.getManager('ACLManager');
const cleanContent = aclManager.removeACLMarkup(page.content);
// Renders without [{ALLOW ...}] markers
```

### Checking Admin Access

```javascript
async isAdmin(user) {
  const userManager = this.engine.getManager('UserManager');
  return await userManager.hasPermission(user.username, 'admin:system');
}
```

---

## Notes

- **No backup/restore needed**: Policies come from ConfigurationManager, page ACLs from page content
- **Private method**: `#notify()` sends alerts to NotificationManager
- **Action mapping**: Legacy actions (view, edit) map to policy actions (page:read, page:edit)

---

## Related Documentation

- [ACLManager.md](ACLManager.md) - Quick reference
- [PolicyEvaluator.md](PolicyEvaluator.md) - Global policy evaluation
- [PolicyManager.md](PolicyManager.md) - Policy management
- [UserManager.md](UserManager.md) - User and role management
