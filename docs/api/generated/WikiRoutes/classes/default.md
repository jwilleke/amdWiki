[**amdWiki API v1.5.0**](../../README.md)

***

[amdWiki API](../../README.md) / [WikiRoutes](../README.md) / default

# Class: default

Defined in: [src/routes/WikiRoutes.ts:118](https://github.com/jwilleke/amdWiki/blob/b6a859c7c9297966de89735ea5e8f953df289ac1/src/routes/WikiRoutes.ts#L118)

## Constructors

### Constructor

> **new default**(`engine`): `WikiRoutes`

Defined in: [src/routes/WikiRoutes.ts:121](https://github.com/jwilleke/amdWiki/blob/b6a859c7c9297966de89735ea5e8f953df289ac1/src/routes/WikiRoutes.ts#L121)

#### Parameters

##### engine

`WikiEngine`

#### Returns

`WikiRoutes`

## Methods

### adminAuditExport()

> **adminAuditExport**(`req`, `res`): `Promise`\<`Response`\<`any`, `Record`\<`string`, `any`\>\>\>

Defined in: [src/routes/WikiRoutes.ts:4853](https://github.com/jwilleke/amdWiki/blob/b6a859c7c9297966de89735ea5e8f953df289ac1/src/routes/WikiRoutes.ts#L4853)

Export audit logs

#### Parameters

##### req

`Request`

##### res

`Response`

#### Returns

`Promise`\<`Response`\<`any`, `Record`\<`string`, `any`\>\>\>

***

### adminAuditLogDetails()

> **adminAuditLogDetails**(`req`, `res`): `Promise`\<`Response`\<`any`, `Record`\<`string`, `any`\>\>\>

Defined in: [src/routes/WikiRoutes.ts:4820](https://github.com/jwilleke/amdWiki/blob/b6a859c7c9297966de89735ea5e8f953df289ac1/src/routes/WikiRoutes.ts#L4820)

API endpoint for individual audit log details

#### Parameters

##### req

`Request`

##### res

`Response`

#### Returns

`Promise`\<`Response`\<`any`, `Record`\<`string`, `any`\>\>\>

***

### adminAuditLogs()

> **adminAuditLogs**(`req`, `res`): `Promise`\<`void` \| `Response`\<`any`, `Record`\<`string`, `any`\>\>\>

Defined in: [src/routes/WikiRoutes.ts:4735](https://github.com/jwilleke/amdWiki/blob/b6a859c7c9297966de89735ea5e8f953df289ac1/src/routes/WikiRoutes.ts#L4735)

Admin audit logs page

#### Parameters

##### req

`Request`

##### res

`Response`

#### Returns

`Promise`\<`void` \| `Response`\<`any`, `Record`\<`string`, `any`\>\>\>

***

### adminAuditLogsApi()

> **adminAuditLogsApi**(`req`, `res`): `Promise`\<`Response`\<`any`, `Record`\<`string`, `any`\>\>\>

Defined in: [src/routes/WikiRoutes.ts:4772](https://github.com/jwilleke/amdWiki/blob/b6a859c7c9297966de89735ea5e8f953df289ac1/src/routes/WikiRoutes.ts#L4772)

API endpoint for audit logs data

#### Parameters

##### req

`Request`

##### res

`Response`

#### Returns

`Promise`\<`Response`\<`any`, `Record`\<`string`, `any`\>\>\>

***

### adminBackup()

> **adminBackup**(`req`, `res`): `Promise`\<`void` \| `Response`\<`any`, `Record`\<`string`, `any`\>\>\>

Defined in: [src/routes/WikiRoutes.ts:3417](https://github.com/jwilleke/amdWiki/blob/b6a859c7c9297966de89735ea5e8f953df289ac1/src/routes/WikiRoutes.ts#L3417)

Admin backup - Create and download full system backup

#### Parameters

##### req

`Request`

##### res

`Response`

#### Returns

`Promise`\<`void` \| `Response`\<`any`, `Record`\<`string`, `any`\>\>\>

***

### adminCacheStats()

> **adminCacheStats**(`req`, `res`): `Promise`\<`Response`\<`any`, `Record`\<`string`, `any`\>\>\>

Defined in: [src/routes/WikiRoutes.ts:4625](https://github.com/jwilleke/amdWiki/blob/b6a859c7c9297966de89735ea5e8f953df289ac1/src/routes/WikiRoutes.ts#L4625)

Admin cache statistics API endpoint

#### Parameters

##### req

`Request`

##### res

`Response`

#### Returns

`Promise`\<`Response`\<`any`, `Record`\<`string`, `any`\>\>\>

***

### adminClearAllNotifications()

> **adminClearAllNotifications**(`req`, `res`): `Promise`\<`void` \| `Response`\<`any`, `Record`\<`string`, `any`\>\>\>

Defined in: [src/routes/WikiRoutes.ts:4540](https://github.com/jwilleke/amdWiki/blob/b6a859c7c9297966de89735ea5e8f953df289ac1/src/routes/WikiRoutes.ts#L4540)

Clear all notifications (admin only)

#### Parameters

##### req

`Request`

##### res

`Response`

#### Returns

`Promise`\<`void` \| `Response`\<`any`, `Record`\<`string`, `any`\>\>\>

***

### adminClearCache()

> **adminClearCache**(`req`, `res`): `Promise`\<`Response`\<`any`, `Record`\<`string`, `any`\>\>\>

Defined in: [src/routes/WikiRoutes.ts:4653](https://github.com/jwilleke/amdWiki/blob/b6a859c7c9297966de89735ea5e8f953df289ac1/src/routes/WikiRoutes.ts#L4653)

Admin clear all cache API endpoint

#### Parameters

##### req

`Request`

##### res

`Response`

#### Returns

`Promise`\<`Response`\<`any`, `Record`\<`string`, `any`\>\>\>

***

### adminClearCacheRegion()

> **adminClearCacheRegion**(`req`, `res`): `Promise`\<`Response`\<`any`, `Record`\<`string`, `any`\>\>\>

Defined in: [src/routes/WikiRoutes.ts:4688](https://github.com/jwilleke/amdWiki/blob/b6a859c7c9297966de89735ea5e8f953df289ac1/src/routes/WikiRoutes.ts#L4688)

Admin clear cache region API endpoint

#### Parameters

##### req

`Request`

##### res

`Response`

#### Returns

`Promise`\<`Response`\<`any`, `Record`\<`string`, `any`\>\>\>

***

### adminConfiguration()

> **adminConfiguration**(`req`, `res`): `Promise`\<`void` \| `Response`\<`any`, `Record`\<`string`, `any`\>\>\>

Defined in: [src/routes/WikiRoutes.ts:3475](https://github.com/jwilleke/amdWiki/blob/b6a859c7c9297966de89735ea5e8f953df289ac1/src/routes/WikiRoutes.ts#L3475)

Admin configuration management page

#### Parameters

##### req

`Request`

##### res

`Response`

#### Returns

`Promise`\<`void` \| `Response`\<`any`, `Record`\<`string`, `any`\>\>\>

***

### adminCreateOrganization()

> **adminCreateOrganization**(`req`, `res`): `Promise`\<`void` \| `Response`\<`any`, `Record`\<`string`, `any`\>\>\>

Defined in: [src/routes/WikiRoutes.ts:4008](https://github.com/jwilleke/amdWiki/blob/b6a859c7c9297966de89735ea5e8f953df289ac1/src/routes/WikiRoutes.ts#L4008)

Create New Organization

#### Parameters

##### req

`Request`

##### res

`Response`

#### Returns

`Promise`\<`void` \| `Response`\<`any`, `Record`\<`string`, `any`\>\>\>

***

### adminCreatePolicy()

> **adminCreatePolicy**(`req`, `res`): `Promise`\<`Response`\<`any`, `Record`\<`string`, `any`\>\>\>

Defined in: [src/routes/WikiRoutes.ts:2927](https://github.com/jwilleke/amdWiki/blob/b6a859c7c9297966de89735ea5e8f953df289ac1/src/routes/WikiRoutes.ts#L2927)

Create a new policy

#### Parameters

##### req

`Request`

##### res

`Response`

#### Returns

`Promise`\<`Response`\<`any`, `Record`\<`string`, `any`\>\>\>

***

### adminCreateRole()

> **adminCreateRole**(`req`, `res`): `Promise`\<`Response`\<`any`, `Record`\<`string`, `any`\>\>\>

Defined in: [src/routes/WikiRoutes.ts:3318](https://github.com/jwilleke/amdWiki/blob/b6a859c7c9297966de89735ea5e8f953df289ac1/src/routes/WikiRoutes.ts#L3318)

Create new role (admin only)

#### Parameters

##### req

`Request`

##### res

`Response`

#### Returns

`Promise`\<`Response`\<`any`, `Record`\<`string`, `any`\>\>\>

***

### adminCreateUser()

> **adminCreateUser**(`req`, `res`): `Promise`\<`void` \| `Response`\<`any`, `Record`\<`string`, `any`\>\>\>

Defined in: [src/routes/WikiRoutes.ts:3128](https://github.com/jwilleke/amdWiki/blob/b6a859c7c9297966de89735ea5e8f953df289ac1/src/routes/WikiRoutes.ts#L3128)

Create new user (admin)

#### Parameters

##### req

`Request`

##### res

`Response`

#### Returns

`Promise`\<`void` \| `Response`\<`any`, `Record`\<`string`, `any`\>\>\>

***

### adminDashboard()

> **adminDashboard**(`req`, `res`): `Promise`\<`void` \| `Response`\<`any`, `Record`\<`string`, `any`\>\>\>

Defined in: [src/routes/WikiRoutes.ts:2692](https://github.com/jwilleke/amdWiki/blob/b6a859c7c9297966de89735ea5e8f953df289ac1/src/routes/WikiRoutes.ts#L2692)

Admin dashboard

#### Parameters

##### req

`Request`

##### res

`Response`

#### Returns

`Promise`\<`void` \| `Response`\<`any`, `Record`\<`string`, `any`\>\>\>

***

### adminDeleteOrganization()

> **adminDeleteOrganization**(`req`, `res`): `Promise`\<`void` \| `Response`\<`any`, `Record`\<`string`, `any`\>\>\>

Defined in: [src/routes/WikiRoutes.ts:4084](https://github.com/jwilleke/amdWiki/blob/b6a859c7c9297966de89735ea5e8f953df289ac1/src/routes/WikiRoutes.ts#L4084)

Delete Organization

#### Parameters

##### req

`Request`

##### res

`Response`

#### Returns

`Promise`\<`void` \| `Response`\<`any`, `Record`\<`string`, `any`\>\>\>

***

### adminDeletePolicy()

> **adminDeletePolicy**(`req`, `res`): `Promise`\<`Response`\<`any`, `Record`\<`string`, `any`\>\>\>

Defined in: [src/routes/WikiRoutes.ts:3047](https://github.com/jwilleke/amdWiki/blob/b6a859c7c9297966de89735ea5e8f953df289ac1/src/routes/WikiRoutes.ts#L3047)

Delete a policy

#### Parameters

##### req

`Request`

##### res

`Response`

#### Returns

`Promise`\<`Response`\<`any`, `Record`\<`string`, `any`\>\>\>

***

### adminDeleteRole()

> **adminDeleteRole**(`req`, `res`): `Promise`\<`Response`\<`any`, `Record`\<`string`, `any`\>\>\>

Defined in: [src/routes/WikiRoutes.ts:3373](https://github.com/jwilleke/amdWiki/blob/b6a859c7c9297966de89735ea5e8f953df289ac1/src/routes/WikiRoutes.ts#L3373)

Delete role (admin only)

#### Parameters

##### req

`Request`

##### res

`Response`

#### Returns

`Promise`\<`Response`\<`any`, `Record`\<`string`, `any`\>\>\>

***

### adminDeleteUser()

> **adminDeleteUser**(`req`, `res`): `Promise`\<`Response`\<`any`, `Record`\<`string`, `any`\>\>\>

Defined in: [src/routes/WikiRoutes.ts:3203](https://github.com/jwilleke/amdWiki/blob/b6a859c7c9297966de89735ea5e8f953df289ac1/src/routes/WikiRoutes.ts#L3203)

Delete user (admin)

#### Parameters

##### req

`Request`

##### res

`Response`

#### Returns

`Promise`\<`Response`\<`any`, `Record`\<`string`, `any`\>\>\>

***

### adminDismissNotification()

> **adminDismissNotification**(`req`, `res`): `Promise`\<`void` \| `Response`\<`any`, `Record`\<`string`, `any`\>\>\>

Defined in: [src/routes/WikiRoutes.ts:4504](https://github.com/jwilleke/amdWiki/blob/b6a859c7c9297966de89735ea5e8f953df289ac1/src/routes/WikiRoutes.ts#L4504)

Dismiss a notification (admin only)

#### Parameters

##### req

`Request`

##### res

`Response`

#### Returns

`Promise`\<`void` \| `Response`\<`any`, `Record`\<`string`, `any`\>\>\>

***

### adminFixFiles()

> **adminFixFiles**(`req`, `res`): `Promise`\<`Response`\<`any`, `Record`\<`string`, `any`\>\>\>

Defined in: [src/routes/WikiRoutes.ts:4181](https://github.com/jwilleke/amdWiki/blob/b6a859c7c9297966de89735ea5e8f953df289ac1/src/routes/WikiRoutes.ts#L4181)

Admin API route to fix all non-compliant files

#### Parameters

##### req

`Request`

##### res

`Response`

#### Returns

`Promise`\<`Response`\<`any`, `Record`\<`string`, `any`\>\>\>

***

### adminGetOrganization()

> **adminGetOrganization**(`req`, `res`): `Promise`\<`Response`\<`any`, `Record`\<`string`, `any`\>\>\>

Defined in: [src/routes/WikiRoutes.ts:4119](https://github.com/jwilleke/amdWiki/blob/b6a859c7c9297966de89735ea5e8f953df289ac1/src/routes/WikiRoutes.ts#L4119)

Get Single Organization (API endpoint)

#### Parameters

##### req

`Request`

##### res

`Response`

#### Returns

`Promise`\<`Response`\<`any`, `Record`\<`string`, `any`\>\>\>

***

### adminGetOrganizationSchema()

> **adminGetOrganizationSchema**(`req`, `res`): `Promise`\<`Response`\<`any`, `Record`\<`string`, `any`\>\>\>

Defined in: [src/routes/WikiRoutes.ts:4214](https://github.com/jwilleke/amdWiki/blob/b6a859c7c9297966de89735ea5e8f953df289ac1/src/routes/WikiRoutes.ts#L4214)

Get Organization Schema.org JSON-LD (API endpoint)

#### Parameters

##### req

`Request`

##### res

`Response`

#### Returns

`Promise`\<`Response`\<`any`, `Record`\<`string`, `any`\>\>\>

***

### adminGetPersonSchema()

> **adminGetPersonSchema**(`req`, `res`): `Promise`\<`Response`\<`any`, `Record`\<`string`, `any`\>\>\>

Defined in: [src/routes/WikiRoutes.ts:4248](https://github.com/jwilleke/amdWiki/blob/b6a859c7c9297966de89735ea5e8f953df289ac1/src/routes/WikiRoutes.ts#L4248)

Get Schema.org Person schema for a user

#### Parameters

##### req

`Request`

##### res

`Response`

#### Returns

`Promise`\<`Response`\<`any`, `Record`\<`string`, `any`\>\>\>

***

### adminGetPolicy()

> **adminGetPolicy**(`req`, `res`): `Promise`\<`Response`\<`any`, `Record`\<`string`, `any`\>\>\>

Defined in: [src/routes/WikiRoutes.ts:2968](https://github.com/jwilleke/amdWiki/blob/b6a859c7c9297966de89735ea5e8f953df289ac1/src/routes/WikiRoutes.ts#L2968)

Get a specific policy

#### Parameters

##### req

`Request`

##### res

`Response`

#### Returns

`Promise`\<`Response`\<`any`, `Record`\<`string`, `any`\>\>\>

***

### adminLogs()

> **adminLogs**(`req`, `res`): `Promise`\<`void` \| `Response`\<`any`, `Record`\<`string`, `any`\>\>\>

Defined in: [src/routes/WikiRoutes.ts:3856](https://github.com/jwilleke/amdWiki/blob/b6a859c7c9297966de89735ea5e8f953df289ac1/src/routes/WikiRoutes.ts#L3856)

Admin logs page

#### Parameters

##### req

`Request`

##### res

`Response`

#### Returns

`Promise`\<`void` \| `Response`\<`any`, `Record`\<`string`, `any`\>\>\>

***

### adminNotifications()

> **adminNotifications**(`req`, `res`): `Promise`\<`void` \| `Response`\<`any`, `Record`\<`string`, `any`\>\>\>

Defined in: [src/routes/WikiRoutes.ts:4569](https://github.com/jwilleke/amdWiki/blob/b6a859c7c9297966de89735ea5e8f953df289ac1/src/routes/WikiRoutes.ts#L4569)

Notification management page (admin only)

#### Parameters

##### req

`Request`

##### res

`Response`

#### Returns

`Promise`\<`void` \| `Response`\<`any`, `Record`\<`string`, `any`\>\>\>

***

### adminOrganizations()

> **adminOrganizations**(`req`, `res`): `Promise`\<`void` \| `Response`\<`any`, `Record`\<`string`, `any`\>\>\>

Defined in: [src/routes/WikiRoutes.ts:3946](https://github.com/jwilleke/amdWiki/blob/b6a859c7c9297966de89735ea5e8f953df289ac1/src/routes/WikiRoutes.ts#L3946)

Admin Organizations Management Page

#### Parameters

##### req

`Request`

##### res

`Response`

#### Returns

`Promise`\<`void` \| `Response`\<`any`, `Record`\<`string`, `any`\>\>\>

***

### adminPolicies()

> **adminPolicies**(`req`, `res`): `Promise`\<`void` \| `Response`\<`any`, `Record`\<`string`, `any`\>\>\>

Defined in: [src/routes/WikiRoutes.ts:2876](https://github.com/jwilleke/amdWiki/blob/b6a859c7c9297966de89735ea5e8f953df289ac1/src/routes/WikiRoutes.ts#L2876)

Admin policy management dashboard

#### Parameters

##### req

`Request`

##### res

`Response`

#### Returns

`Promise`\<`void` \| `Response`\<`any`, `Record`\<`string`, `any`\>\>\>

***

### adminReindex()

> **adminReindex**(`req`, `res`): `Promise`\<`Response`\<`any`, `Record`\<`string`, `any`\>\>\>

Defined in: [src/routes/WikiRoutes.ts:3795](https://github.com/jwilleke/amdWiki/blob/b6a859c7c9297966de89735ea5e8f953df289ac1/src/routes/WikiRoutes.ts#L3795)

Admin reindex - Refresh page cache and rebuild search index

#### Parameters

##### req

`Request`

##### res

`Response`

#### Returns

`Promise`\<`Response`\<`any`, `Record`\<`string`, `any`\>\>\>

***

### adminResetConfiguration()

> **adminResetConfiguration**(`req`, `res`): `Promise`\<`void` \| `Response`\<`any`, `Record`\<`string`, `any`\>\>\>

Defined in: [src/routes/WikiRoutes.ts:3558](https://github.com/jwilleke/amdWiki/blob/b6a859c7c9297966de89735ea5e8f953df289ac1/src/routes/WikiRoutes.ts#L3558)

Reset configuration to defaults

#### Parameters

##### req

`Request`

##### res

`Response`

#### Returns

`Promise`\<`void` \| `Response`\<`any`, `Record`\<`string`, `any`\>\>\>

***

### adminRestart()

> **adminRestart**(`req`, `res`): `Promise`\<`Response`\<`any`, `Record`\<`string`, `any`\>\>\>

Defined in: [src/routes/WikiRoutes.ts:3744](https://github.com/jwilleke/amdWiki/blob/b6a859c7c9297966de89735ea5e8f953df289ac1/src/routes/WikiRoutes.ts#L3744)

Restart the system (PM2)

#### Parameters

##### req

`Request`

##### res

`Response`

#### Returns

`Promise`\<`Response`\<`any`, `Record`\<`string`, `any`\>\>\>

***

### adminRoles()

> **adminRoles**(`req`, `res`): `Promise`\<`void` \| `Response`\<`any`, `Record`\<`string`, `any`\>\>\>

Defined in: [src/routes/WikiRoutes.ts:3234](https://github.com/jwilleke/amdWiki/blob/b6a859c7c9297966de89735ea5e8f953df289ac1/src/routes/WikiRoutes.ts#L3234)

Admin roles management

#### Parameters

##### req

`Request`

##### res

`Response`

#### Returns

`Promise`\<`void` \| `Response`\<`any`, `Record`\<`string`, `any`\>\>\>

***

### adminSettings()

> **adminSettings**(`req`, `res`): `Promise`\<`void` \| `Response`\<`any`, `Record`\<`string`, `any`\>\>\>

Defined in: [src/routes/WikiRoutes.ts:3698](https://github.com/jwilleke/amdWiki/blob/b6a859c7c9297966de89735ea5e8f953df289ac1/src/routes/WikiRoutes.ts#L3698)

Admin settings page

#### Parameters

##### req

`Request`

##### res

`Response`

#### Returns

`Promise`\<`void` \| `Response`\<`any`, `Record`\<`string`, `any`\>\>\>

***

### adminTestVariables()

> **adminTestVariables**(`req`, `res`): `Promise`\<`void` \| `Response`\<`any`, `Record`\<`string`, `any`\>\>\>

Defined in: [src/routes/WikiRoutes.ts:3644](https://github.com/jwilleke/amdWiki/blob/b6a859c7c9297966de89735ea5e8f953df289ac1/src/routes/WikiRoutes.ts#L3644)

Test variable expansion

#### Parameters

##### req

`Request`

##### res

`Response`

#### Returns

`Promise`\<`void` \| `Response`\<`any`, `Record`\<`string`, `any`\>\>\>

***

### adminToggleMaintenance()

> **adminToggleMaintenance**(`req`, `res`): `Promise`\<`void` \| `Response`\<`any`, `Record`\<`string`, `any`\>\>\>

Defined in: [src/routes/WikiRoutes.ts:2792](https://github.com/jwilleke/amdWiki/blob/b6a859c7c9297966de89735ea5e8f953df289ac1/src/routes/WikiRoutes.ts#L2792)

Toggle maintenance mode (admin only)

#### Parameters

##### req

`Request`

##### res

`Response`

#### Returns

`Promise`\<`void` \| `Response`\<`any`, `Record`\<`string`, `any`\>\>\>

***

### adminUpdateConfiguration()

> **adminUpdateConfiguration**(`req`, `res`): `Promise`\<`void` \| `Response`\<`any`, `Record`\<`string`, `any`\>\>\>

Defined in: [src/routes/WikiRoutes.ts:3519](https://github.com/jwilleke/amdWiki/blob/b6a859c7c9297966de89735ea5e8f953df289ac1/src/routes/WikiRoutes.ts#L3519)

Update configuration property

#### Parameters

##### req

`Request`

##### res

`Response`

#### Returns

`Promise`\<`void` \| `Response`\<`any`, `Record`\<`string`, `any`\>\>\>

***

### adminUpdateOrganization()

> **adminUpdateOrganization**(`req`, `res`): `Promise`\<`void` \| `Response`\<`any`, `Record`\<`string`, `any`\>\>\>

Defined in: [src/routes/WikiRoutes.ts:4045](https://github.com/jwilleke/amdWiki/blob/b6a859c7c9297966de89735ea5e8f953df289ac1/src/routes/WikiRoutes.ts#L4045)

Update Existing Organization

#### Parameters

##### req

`Request`

##### res

`Response`

#### Returns

`Promise`\<`void` \| `Response`\<`any`, `Record`\<`string`, `any`\>\>\>

***

### adminUpdatePolicy()

> **adminUpdatePolicy**(`req`, `res`): `Promise`\<`Response`\<`any`, `Record`\<`string`, `any`\>\>\>

Defined in: [src/routes/WikiRoutes.ts:3006](https://github.com/jwilleke/amdWiki/blob/b6a859c7c9297966de89735ea5e8f953df289ac1/src/routes/WikiRoutes.ts#L3006)

Update an existing policy

#### Parameters

##### req

`Request`

##### res

`Response`

#### Returns

`Promise`\<`Response`\<`any`, `Record`\<`string`, `any`\>\>\>

***

### adminUpdateRole()

> **adminUpdateRole**(`req`, `res`): `Promise`\<`Response`\<`any`, `Record`\<`string`, `any`\>\>\>

Defined in: [src/routes/WikiRoutes.ts:3274](https://github.com/jwilleke/amdWiki/blob/b6a859c7c9297966de89735ea5e8f953df289ac1/src/routes/WikiRoutes.ts#L3274)

Update role permissions (admin only)

#### Parameters

##### req

`Request`

##### res

`Response`

#### Returns

`Promise`\<`Response`\<`any`, `Record`\<`string`, `any`\>\>\>

***

### adminUpdateUser()

> **adminUpdateUser**(`req`, `res`): `Promise`\<`Response`\<`any`, `Record`\<`string`, `any`\>\>\>

Defined in: [src/routes/WikiRoutes.ts:3168](https://github.com/jwilleke/amdWiki/blob/b6a859c7c9297966de89735ea5e8f953df289ac1/src/routes/WikiRoutes.ts#L3168)

Update user (admin)

#### Parameters

##### req

`Request`

##### res

`Response`

#### Returns

`Promise`\<`Response`\<`any`, `Record`\<`string`, `any`\>\>\>

***

### adminUsers()

> **adminUsers**(`req`, `res`): `Promise`\<`void` \| `Response`\<`any`, `Record`\<`string`, `any`\>\>\>

Defined in: [src/routes/WikiRoutes.ts:3088](https://github.com/jwilleke/amdWiki/blob/b6a859c7c9297966de89735ea5e8f953df289ac1/src/routes/WikiRoutes.ts#L3088)

Admin users management

#### Parameters

##### req

`Request`

##### res

`Response`

#### Returns

`Promise`\<`void` \| `Response`\<`any`, `Record`\<`string`, `any`\>\>\>

***

### adminValidateFiles()

> **adminValidateFiles**(`req`, `res`): `Promise`\<`void` \| `Response`\<`any`, `Record`\<`string`, `any`\>\>\>

Defined in: [src/routes/WikiRoutes.ts:4144](https://github.com/jwilleke/amdWiki/blob/b6a859c7c9297966de89735ea5e8f953df289ac1/src/routes/WikiRoutes.ts#L4144)

Admin route to validate all files and check for naming convention compliance

#### Parameters

##### req

`Request`

##### res

`Response`

#### Returns

`Promise`\<`void` \| `Response`\<`any`, `Record`\<`string`, `any`\>\>\>

***

### adminVariables()

> **adminVariables**(`req`, `res`): `Promise`\<`void` \| `Response`\<`any`, `Record`\<`string`, `any`\>\>\>

Defined in: [src/routes/WikiRoutes.ts:3584](https://github.com/jwilleke/amdWiki/blob/b6a859c7c9297966de89735ea5e8f953df289ac1/src/routes/WikiRoutes.ts#L3584)

Admin variable management page

#### Parameters

##### req

`Request`

##### res

`Response`

#### Returns

`Promise`\<`void` \| `Response`\<`any`, `Record`\<`string`, `any`\>\>\>

***

### comparePageVersions()

> **comparePageVersions**(`req`, `res`): `Promise`\<`Response`\<`any`, `Record`\<`string`, `any`\>\>\>

Defined in: [src/routes/WikiRoutes.ts:5298](https://github.com/jwilleke/amdWiki/blob/b6a859c7c9297966de89735ea5e8f953df289ac1/src/routes/WikiRoutes.ts#L5298)

GET /api/page/:identifier/compare/:v1/:v2
Compare two versions of a page

#### Parameters

##### req

`Request`

##### res

`Response`

#### Returns

`Promise`\<`Response`\<`any`, `Record`\<`string`, `any`\>\>\>

***

### createPage()

> **createPage**(`req`, `res`): `Promise`\<`void` \| `Response`\<`any`, `Record`\<`string`, `any`\>\>\>

Defined in: [src/routes/WikiRoutes.ts:972](https://github.com/jwilleke/amdWiki/blob/b6a859c7c9297966de89735ea5e8f953df289ac1/src/routes/WikiRoutes.ts#L972)

Display create new page form with template selection

#### Parameters

##### req

`Request`

##### res

`Response`

#### Returns

`Promise`\<`void` \| `Response`\<`any`, `Record`\<`string`, `any`\>\>\>

***

### createPageFromTemplate()

> **createPageFromTemplate**(`req`, `res`): `Promise`\<`void` \| `Response`\<`any`, `Record`\<`string`, `any`\>\>\>

Defined in: [src/routes/WikiRoutes.ts:1111](https://github.com/jwilleke/amdWiki/blob/b6a859c7c9297966de89735ea5e8f953df289ac1/src/routes/WikiRoutes.ts#L1111)

Create a new page from template

#### Parameters

##### req

`Request`

##### res

`Response`

#### Returns

`Promise`\<`void` \| `Response`\<`any`, `Record`\<`string`, `any`\>\>\>

***

### createWikiContext()

> **createWikiContext**(`req`, `options`): [`default`](../../src/context/WikiContext/classes/default.md)

Defined in: [src/routes/WikiRoutes.ts:132](https://github.com/jwilleke/amdWiki/blob/b6a859c7c9297966de89735ea5e8f953df289ac1/src/routes/WikiRoutes.ts#L132)

Create a WikiContext for the given request and page
This should be the single source of truth for all context information

#### Parameters

##### req

`Request`

Express request object

##### options

`WikiContextOptions` = `{}`

Additional context options (pageName, content, context type)

#### Returns

[`default`](../../src/context/WikiContext/classes/default.md)

WikiContext instance

***

### createWikiPage()

> **createWikiPage**(`req`, `res`): `Promise`\<`void` \| `Response`\<`any`, `Record`\<`string`, `any`\>\>\>

Defined in: [src/routes/WikiRoutes.ts:1403](https://github.com/jwilleke/amdWiki/blob/b6a859c7c9297966de89735ea5e8f953df289ac1/src/routes/WikiRoutes.ts#L1403)

Create a new wiki page via POST /wiki/:page

#### Parameters

##### req

`Request`

Express request object

##### res

`Response`

Express response object

#### Returns

`Promise`\<`void` \| `Response`\<`any`, `Record`\<`string`, `any`\>\>\>

***

### deleteAttachment()

> **deleteAttachment**(`req`, `res`): `Promise`\<`Response`\<`any`, `Record`\<`string`, `any`\>\>\>

Defined in: [src/routes/WikiRoutes.ts:2104](https://github.com/jwilleke/amdWiki/blob/b6a859c7c9297966de89735ea5e8f953df289ac1/src/routes/WikiRoutes.ts#L2104)

Delete attachment

#### Parameters

##### req

`Request`

##### res

`Response`

#### Returns

`Promise`\<`Response`\<`any`, `Record`\<`string`, `any`\>\>\>

***

### deleteExport()

> **deleteExport**(`req`, `res`): `Promise`\<`void`\>

Defined in: [src/routes/WikiRoutes.ts:2246](https://github.com/jwilleke/amdWiki/blob/b6a859c7c9297966de89735ea5e8f953df289ac1/src/routes/WikiRoutes.ts#L2246)

Delete export file

#### Parameters

##### req

`Request`

##### res

`Response`

#### Returns

`Promise`\<`void`\>

***

### deletePage()

> **deletePage**(`req`, `res`): `Promise`\<`void` \| `Response`\<`any`, `Record`\<`string`, `any`\>\>\>

Defined in: [src/routes/WikiRoutes.ts:1698](https://github.com/jwilleke/amdWiki/blob/b6a859c7c9297966de89735ea5e8f953df289ac1/src/routes/WikiRoutes.ts#L1698)

Delete a page

#### Parameters

##### req

`Request`

##### res

`Response`

#### Returns

`Promise`\<`void` \| `Response`\<`any`, `Record`\<`string`, `any`\>\>\>

***

### downloadExport()

> **downloadExport**(`req`, `res`): `Promise`\<`void` \| `Response`\<`any`, `Record`\<`string`, `any`\>\>\>

Defined in: [src/routes/WikiRoutes.ts:2225](https://github.com/jwilleke/amdWiki/blob/b6a859c7c9297966de89735ea5e8f953df289ac1/src/routes/WikiRoutes.ts#L2225)

Download export file

#### Parameters

##### req

`Request`

##### res

`Response`

#### Returns

`Promise`\<`void` \| `Response`\<`any`, `Record`\<`string`, `any`\>\>\>

***

### editPage()

> **editPage**(`req`, `res`): `Promise`\<`void` \| `Response`\<`any`, `Record`\<`string`, `any`\>\>\>

Defined in: [src/routes/WikiRoutes.ts:1255](https://github.com/jwilleke/amdWiki/blob/b6a859c7c9297966de89735ea5e8f953df289ac1/src/routes/WikiRoutes.ts#L1255)

#### Parameters

##### req

`Request`

##### res

`Response`

#### Returns

`Promise`\<`void` \| `Response`\<`any`, `Record`\<`string`, `any`\>\>\>

***

### editPageIndex()

> **editPageIndex**(`req`, `res`): `Promise`\<`void` \| `Response`\<`any`, `Record`\<`string`, `any`\>\>\>

Defined in: [src/routes/WikiRoutes.ts:1064](https://github.com/jwilleke/amdWiki/blob/b6a859c7c9297966de89735ea5e8f953df289ac1/src/routes/WikiRoutes.ts#L1064)

Handle /edit route without page parameter

#### Parameters

##### req

`Request`

##### res

`Response`

#### Returns

`Promise`\<`void` \| `Response`\<`any`, `Record`\<`string`, `any`\>\>\>

***

### exportPage()

> **exportPage**(`req`, `res`): `Promise`\<`void` \| `Response`\<`any`, `Record`\<`string`, `any`\>\>\>

Defined in: [src/routes/WikiRoutes.ts:2148](https://github.com/jwilleke/amdWiki/blob/b6a859c7c9297966de89735ea5e8f953df289ac1/src/routes/WikiRoutes.ts#L2148)

Export page selection form

#### Parameters

##### req

`Request`

##### res

`Response`

#### Returns

`Promise`\<`void` \| `Response`\<`any`, `Record`\<`string`, `any`\>\>\>

***

### exportPageHtml()

> **exportPageHtml**(`req`, `res`): `Promise`\<`Response`\<`any`, `Record`\<`string`, `any`\>\>\>

Defined in: [src/routes/WikiRoutes.ts:2168](https://github.com/jwilleke/amdWiki/blob/b6a859c7c9297966de89735ea5e8f953df289ac1/src/routes/WikiRoutes.ts#L2168)

Export page to HTML

#### Parameters

##### req

`Request`

##### res

`Response`

#### Returns

`Promise`\<`Response`\<`any`, `Record`\<`string`, `any`\>\>\>

***

### exportPageMarkdown()

> **exportPageMarkdown**(`req`, `res`): `Promise`\<`void`\>

Defined in: [src/routes/WikiRoutes.ts:2186](https://github.com/jwilleke/amdWiki/blob/b6a859c7c9297966de89735ea5e8f953df289ac1/src/routes/WikiRoutes.ts#L2186)

Export page to Markdown

#### Parameters

##### req

`Request`

##### res

`Response`

#### Returns

`Promise`\<`void`\>

***

### formatLeftMenuContent()

> **formatLeftMenuContent**(`content`): `string`

Defined in: [src/routes/WikiRoutes.ts:798](https://github.com/jwilleke/amdWiki/blob/b6a859c7c9297966de89735ea5e8f953df289ac1/src/routes/WikiRoutes.ts#L798)

Format left menu content for Bootstrap navigation

#### Parameters

##### content

`string`

#### Returns

`string`

***

### generatePageSchema()

> **generatePageSchema**(`pageData`, `req`): `string`

Defined in: [src/routes/WikiRoutes.ts:608](https://github.com/jwilleke/amdWiki/blob/b6a859c7c9297966de89735ea5e8f953df289ac1/src/routes/WikiRoutes.ts#L608)

Generate Schema.org JSON-LD markup for a page

#### Parameters

##### pageData

`Record`\<`string`, `unknown`\>

Page metadata and content

##### req

`Request`

Express request object for URL generation

#### Returns

`string`

HTML script tag with JSON-LD

***

### generateSiteSchema()

> **generateSiteSchema**(`req`): `Promise`\<`string`\>

Defined in: [src/routes/WikiRoutes.ts:635](https://github.com/jwilleke/amdWiki/blob/b6a859c7c9297966de89735ea5e8f953df289ac1/src/routes/WikiRoutes.ts#L635)

Generate site-wide Schema.org markup (Organization, SoftwareApplication)

#### Parameters

##### req

`Request`

Express request object

#### Returns

`Promise`\<`string`\>

HTML script tags with JSON-LD

***

### getActiveSesssionCount()

> **getActiveSesssionCount**(`req`, `res`): `void`

Defined in: [src/routes/WikiRoutes.ts:352](https://github.com/jwilleke/amdWiki/blob/b6a859c7c9297966de89735ea5e8f953df289ac1/src/routes/WikiRoutes.ts#L352)

Session count (uses app.js sessionStore)

#### Parameters

##### req

`Request`

##### res

`Response`

#### Returns

`void`

***

### getAllCategories()

> **getAllCategories**(): `Promise`\<`any`[]\>

Defined in: [src/routes/WikiRoutes.ts:462](https://github.com/jwilleke/amdWiki/blob/b6a859c7c9297966de89735ea5e8f953df289ac1/src/routes/WikiRoutes.ts#L462)

Get all categories including admin-only categories

#### Returns

`Promise`\<`any`[]\>

***

### getCategories()

> **getCategories**(): `Promise`\<`any`[]\>

Defined in: [src/routes/WikiRoutes.ts:426](https://github.com/jwilleke/amdWiki/blob/b6a859c7c9297966de89735ea5e8f953df289ac1/src/routes/WikiRoutes.ts#L426)

Extract categories from System Categories page

#### Returns

`Promise`\<`any`[]\>

***

### getCommonTemplateData()

> **getCommonTemplateData**(`req`): `Promise`\<`any`\>

Defined in: [src/routes/WikiRoutes.ts:218](https://github.com/jwilleke/amdWiki/blob/b6a859c7c9297966de89735ea5e8f953df289ac1/src/routes/WikiRoutes.ts#L218)

Get common template data that all pages need.
This is now the single source of truth for common data.

#### Parameters

##### req

`Request`

Express request object.

#### Returns

`Promise`\<`any`\>

***

### getLeftMenu()

> **getLeftMenu**(`userContext`): `Promise`\<`string` \| `null`\>

Defined in: [src/routes/WikiRoutes.ts:767](https://github.com/jwilleke/amdWiki/blob/b6a859c7c9297966de89735ea5e8f953df289ac1/src/routes/WikiRoutes.ts#L767)

Get and format left menu content from LeftMenu page

#### Parameters

##### userContext

`UserContext` | `null`

#### Returns

`Promise`\<`string` \| `null`\>

***

### getPageMetadata()

> **getPageMetadata**(`req`, `res`): `Promise`\<`Response`\<`any`, `Record`\<`string`, `any`\>\>\>

Defined in: [src/routes/WikiRoutes.ts:4935](https://github.com/jwilleke/amdWiki/blob/b6a859c7c9297966de89735ea5e8f953df289ac1/src/routes/WikiRoutes.ts#L4935)

Get page metadata in a user-friendly format

#### Parameters

##### req

`Request`

##### res

`Response`

#### Returns

`Promise`\<`Response`\<`any`, `Record`\<`string`, `any`\>\>\>

***

### getPageNames()

> **getPageNames**(`_req`, `res`): `Promise`\<`void`\>

Defined in: [src/routes/WikiRoutes.ts:1915](https://github.com/jwilleke/amdWiki/blob/b6a859c7c9297966de89735ea5e8f953df289ac1/src/routes/WikiRoutes.ts#L1915)

API endpoint for getting all page names

#### Parameters

##### \_req

`Request`

##### res

`Response`

#### Returns

`Promise`\<`void`\>

***

### getPageSource()

> **getPageSource**(`req`, `res`): `Promise`\<`Response`\<`any`, `Record`\<`string`, `any`\>\>\>

Defined in: [src/routes/WikiRoutes.ts:3920](https://github.com/jwilleke/amdWiki/blob/b6a859c7c9297966de89735ea5e8f953df289ac1/src/routes/WikiRoutes.ts#L3920)

Get raw page source (markdown content) for viewing/copying

#### Parameters

##### req

`Request`

##### res

`Response`

#### Returns

`Promise`\<`Response`\<`any`, `Record`\<`string`, `any`\>\>\>

***

### getPageSuggestions()

> **getPageSuggestions**(`req`, `res`): `Promise`\<`Response`\<`any`, `Record`\<`string`, `any`\>\>\>

Defined in: [src/routes/WikiRoutes.ts:5093](https://github.com/jwilleke/amdWiki/blob/b6a859c7c9297966de89735ea5e8f953df289ac1/src/routes/WikiRoutes.ts#L5093)

API endpoint for page name autocomplete suggestions
GET /api/page-suggestions?q=partial

Used for:
- Autocomplete when typing [page name] in editor
- Autocomplete in search dialogs

Related: GitHub Issue #90 - TypeDown for Internal Page Links

#### Parameters

##### req

`Request`

##### res

`Response`

#### Returns

`Promise`\<`Response`\<`any`, `Record`\<`string`, `any`\>\>\>

***

### getPageVersion()

> **getPageVersion**(`req`, `res`): `Promise`\<`Response`\<`any`, `Record`\<`string`, `any`\>\>\>

Defined in: [src/routes/WikiRoutes.ts:5231](https://github.com/jwilleke/amdWiki/blob/b6a859c7c9297966de89735ea5e8f953df289ac1/src/routes/WikiRoutes.ts#L5231)

GET /api/page/:identifier/version/:version
Get specific version content

#### Parameters

##### req

`Request`

##### res

`Response`

#### Returns

`Promise`\<`Response`\<`any`, `Record`\<`string`, `any`\>\>\>

***

### getPageVersions()

> **getPageVersions**(`req`, `res`): `Promise`\<`Response`\<`any`, `Record`\<`string`, `any`\>\>\>

Defined in: [src/routes/WikiRoutes.ts:5181](https://github.com/jwilleke/amdWiki/blob/b6a859c7c9297966de89735ea5e8f953df289ac1/src/routes/WikiRoutes.ts#L5181)

GET /api/page/:identifier/versions
Get version history for a page

#### Parameters

##### req

`Request`

##### res

`Response`

#### Returns

`Promise`\<`Response`\<`any`, `Record`\<`string`, `any`\>\>\>

***

### getRequestContext()

> **getRequestContext**(`req`): `object`

Defined in: [src/routes/WikiRoutes.ts:339](https://github.com/jwilleke/amdWiki/blob/b6a859c7c9297966de89735ea5e8f953df289ac1/src/routes/WikiRoutes.ts#L339)

Extract request context for access control

#### Parameters

##### req

`Request`

Express request object

#### Returns

`object`

Context information

##### ip

> **ip**: `string`

##### referer

> **referer**: `string` \| `undefined`

##### timestamp

> **timestamp**: `string`

##### userAgent

> **userAgent**: `string` \| `undefined`

***

### getRequestInfo()

> **getRequestInfo**(`req`): `RequestInfo`

Defined in: [src/routes/WikiRoutes.ts:196](https://github.com/jwilleke/amdWiki/blob/b6a859c7c9297966de89735ea5e8f953df289ac1/src/routes/WikiRoutes.ts#L196)

Extract request information for variable expansion

#### Parameters

##### req

`Request`

Express request object

#### Returns

`RequestInfo`

Request information object

***

### getSystemCategories()

> **getSystemCategories**(): `string`[]

Defined in: [src/routes/WikiRoutes.ts:499](https://github.com/jwilleke/amdWiki/blob/b6a859c7c9297966de89735ea5e8f953df289ac1/src/routes/WikiRoutes.ts#L499)

Get system categories from configuration (admin-only)

#### Returns

`string`[]

***

### getTemplateDataFromContext()

> **getTemplateDataFromContext**(`wikiContext`): `TemplateData`

Defined in: [src/routes/WikiRoutes.ts:149](https://github.com/jwilleke/amdWiki/blob/b6a859c7c9297966de89735ea5e8f953df289ac1/src/routes/WikiRoutes.ts#L149)

Extract template data from WikiContext
This ensures all templates get consistent data structure

#### Parameters

##### wikiContext

[`default`](../../src/context/WikiContext/classes/default.md)

The wiki context

#### Returns

`TemplateData`

Template data object

***

### getUserKeywords()

> **getUserKeywords**(): `Promise`\<`string`[]\>

Defined in: [src/routes/WikiRoutes.ts:535](https://github.com/jwilleke/amdWiki/blob/b6a859c7c9297966de89735ea5e8f953df289ac1/src/routes/WikiRoutes.ts#L535)

Extract user keywords from User-Keywords page

#### Returns

`Promise`\<`string`[]\>

***

### homePage()

> **homePage**(`_req`, `res`): `void`

Defined in: [src/routes/WikiRoutes.ts:1930](https://github.com/jwilleke/amdWiki/blob/b6a859c7c9297966de89735ea5e8f953df289ac1/src/routes/WikiRoutes.ts#L1930)

Home page - show main index

#### Parameters

##### \_req

`Request`

##### res

`Response`

#### Returns

`void`

***

### isRequiredPage()

> **isRequiredPage**(`pageName`): `Promise`\<`boolean`\>

Defined in: [src/routes/WikiRoutes.ts:734](https://github.com/jwilleke/amdWiki/blob/b6a859c7c9297966de89735ea5e8f953df289ac1/src/routes/WikiRoutes.ts#L734)

Check if a page is a protected page (admin-only edit)

Protected pages include:
- Hardcoded required pages (backward compatibility)
- Pages with system-category: system or documentation

These pages are considered core system pages that may be overwritten
by future updates to the application.

#### Parameters

##### pageName

`string`

The page name to check

#### Returns

`Promise`\<`boolean`\>

True if page requires admin permission to edit

***

### listExports()

> **listExports**(`req`, `res`): `Promise`\<`void`\>

Defined in: [src/routes/WikiRoutes.ts:2205](https://github.com/jwilleke/amdWiki/blob/b6a859c7c9297966de89735ea5e8f953df289ac1/src/routes/WikiRoutes.ts#L2205)

List available exports

#### Parameters

##### req

`Request`

##### res

`Response`

#### Returns

`Promise`\<`void`\>

***

### loginPage()

> **loginPage**(`req`, `res`): `Promise`\<`void`\>

Defined in: [src/routes/WikiRoutes.ts:2263](https://github.com/jwilleke/amdWiki/blob/b6a859c7c9297966de89735ea5e8f953df289ac1/src/routes/WikiRoutes.ts#L2263)

Login page

#### Parameters

##### req

`Request`

##### res

`Response`

#### Returns

`Promise`\<`void`\>

***

### pageDiff()

> **pageDiff**(`req`, `res`): `Promise`\<`void`\>

Defined in: [src/routes/WikiRoutes.ts:5510](https://github.com/jwilleke/amdWiki/blob/b6a859c7c9297966de89735ea5e8f953df289ac1/src/routes/WikiRoutes.ts#L5510)

GET /diff/:page?v1=X&v2=Y
Show version comparison view

#### Parameters

##### req

`Request`

##### res

`Response`

#### Returns

`Promise`\<`void`\>

***

### pageHistory()

> **pageHistory**(`req`, `res`): `Promise`\<`void`\>

Defined in: [src/routes/WikiRoutes.ts:5433](https://github.com/jwilleke/amdWiki/blob/b6a859c7c9297966de89735ea5e8f953df289ac1/src/routes/WikiRoutes.ts#L5433)

GET /history/:page
Show page history view

#### Parameters

##### req

`Request`

##### res

`Response`

#### Returns

`Promise`\<`void`\>

***

### parseFileSize()

> **parseFileSize**(`sizeStr`): `number`

Defined in: [src/routes/WikiRoutes.ts:172](https://github.com/jwilleke/amdWiki/blob/b6a859c7c9297966de89735ea5e8f953df289ac1/src/routes/WikiRoutes.ts#L172)

Parse file size string (e.g., '5MB', '1GB') to bytes

#### Parameters

##### sizeStr

`string`

Size string

#### Returns

`number`

Size in bytes

***

### previewPage()

> **previewPage**(`req`, `res`): `Promise`\<`void`\>

Defined in: [src/routes/WikiRoutes.ts:1938](https://github.com/jwilleke/amdWiki/blob/b6a859c7c9297966de89735ea5e8f953df289ac1/src/routes/WikiRoutes.ts#L1938)

API endpoint to get page preview

#### Parameters

##### req

`Request`

##### res

`Response`

#### Returns

`Promise`\<`void`\>

***

### processLogin()

> **processLogin**(`req`, `res`): `Promise`\<`void`\>

Defined in: [src/routes/WikiRoutes.ts:2291](https://github.com/jwilleke/amdWiki/blob/b6a859c7c9297966de89735ea5e8f953df289ac1/src/routes/WikiRoutes.ts#L2291)

Process login

#### Parameters

##### req

`Request`

##### res

`Response`

#### Returns

`Promise`\<`void`\>

***

### processLogout()

> **processLogout**(`req`, `res`): `void`

Defined in: [src/routes/WikiRoutes.ts:2347](https://github.com/jwilleke/amdWiki/blob/b6a859c7c9297966de89735ea5e8f953df289ac1/src/routes/WikiRoutes.ts#L2347)

Process logout

#### Parameters

##### req

`Request`

##### res

`Response`

#### Returns

`void`

***

### processRegister()

> **processRegister**(`req`, `res`): `Promise`\<`void`\>

Defined in: [src/routes/WikiRoutes.ts:2423](https://github.com/jwilleke/amdWiki/blob/b6a859c7c9297966de89735ea5e8f953df289ac1/src/routes/WikiRoutes.ts#L2423)

Process registration

#### Parameters

##### req

`Request`

##### res

`Response`

#### Returns

`Promise`\<`void`\>

***

### profilePage()

> **profilePage**(`req`, `res`): `Promise`\<`void`\>

Defined in: [src/routes/WikiRoutes.ts:2466](https://github.com/jwilleke/amdWiki/blob/b6a859c7c9297966de89735ea5e8f953df289ac1/src/routes/WikiRoutes.ts#L2466)

User profile page

#### Parameters

##### req

`Request`

##### res

`Response`

#### Returns

`Promise`\<`void`\>

***

### registerPage()

> **registerPage**(`req`, `res`): `Promise`\<`void`\>

Defined in: [src/routes/WikiRoutes.ts:2404](https://github.com/jwilleke/amdWiki/blob/b6a859c7c9297966de89735ea5e8f953df289ac1/src/routes/WikiRoutes.ts#L2404)

Registration page

#### Parameters

##### req

`Request`

##### res

`Response`

#### Returns

`Promise`\<`void`\>

***

### registerRoutes()

> **registerRoutes**(`app`): `void`

Defined in: [src/routes/WikiRoutes.ts:4283](https://github.com/jwilleke/amdWiki/blob/b6a859c7c9297966de89735ea5e8f953df289ac1/src/routes/WikiRoutes.ts#L4283)

Register all routes with the Express app

#### Parameters

##### app

`Application`

Express application instance

#### Returns

`void`

***

### renderError()

> **renderError**(`req`, `res`, `status`, `title`, `message`): `Promise`\<`void` \| `Response`\<`any`, `Record`\<`string`, `any`\>\>\>

Defined in: [src/routes/WikiRoutes.ts:703](https://github.com/jwilleke/amdWiki/blob/b6a859c7c9297966de89735ea5e8f953df289ac1/src/routes/WikiRoutes.ts#L703)

Render error page with consistent template data

#### Parameters

##### req

`Request`

##### res

`Response`

##### status

`number`

##### title

`string`

##### message

`string`

#### Returns

`Promise`\<`void` \| `Response`\<`any`, `Record`\<`string`, `any`\>\>\>

***

### restorePageVersion()

> **restorePageVersion**(`req`, `res`): `Promise`\<`Response`\<`any`, `Record`\<`string`, `any`\>\>\>

Defined in: [src/routes/WikiRoutes.ts:5357](https://github.com/jwilleke/amdWiki/blob/b6a859c7c9297966de89735ea5e8f953df289ac1/src/routes/WikiRoutes.ts#L5357)

POST /api/page/:identifier/restore/:version
Restore page to a specific version

#### Parameters

##### req

`Request`

##### res

`Response`

#### Returns

`Promise`\<`Response`\<`any`, `Record`\<`string`, `any`\>\>\>

***

### savePage()

> **savePage**(`req`, `res`): `Promise`\<`void` \| `Response`\<`any`, `Record`\<`string`, `any`\>\>\>

Defined in: [src/routes/WikiRoutes.ts:1550](https://github.com/jwilleke/amdWiki/blob/b6a859c7c9297966de89735ea5e8f953df289ac1/src/routes/WikiRoutes.ts#L1550)

Save a page

#### Parameters

##### req

`Request`

##### res

`Response`

#### Returns

`Promise`\<`void` \| `Response`\<`any`, `Record`\<`string`, `any`\>\>\>

***

### searchPages()

> **searchPages**(`req`, `res`): `Promise`\<`void`\>

Defined in: [src/routes/WikiRoutes.ts:1792](https://github.com/jwilleke/amdWiki/blob/b6a859c7c9297966de89735ea5e8f953df289ac1/src/routes/WikiRoutes.ts#L1792)

Search pages with advanced options

#### Parameters

##### req

`Request`

##### res

`Response`

#### Returns

`Promise`\<`void`\>

***

### searchSuggestions()

> **searchSuggestions**(`req`, `res`): `void`

Defined in: [src/routes/WikiRoutes.ts:1898](https://github.com/jwilleke/amdWiki/blob/b6a859c7c9297966de89735ea5e8f953df289ac1/src/routes/WikiRoutes.ts#L1898)

API endpoint for search suggestions

#### Parameters

##### req

`Request`

##### res

`Response`

#### Returns

`void`

***

### serveAttachment()

> **serveAttachment**(`req`, `res`): `Promise`\<`Response`\<`any`, `Record`\<`string`, `any`\>\>\>

Defined in: [src/routes/WikiRoutes.ts:2072](https://github.com/jwilleke/amdWiki/blob/b6a859c7c9297966de89735ea5e8f953df289ac1/src/routes/WikiRoutes.ts#L2072)

Serve attachment file

#### Parameters

##### req

`Request`

##### res

`Response`

#### Returns

`Promise`\<`Response`\<`any`, `Record`\<`string`, `any`\>\>\>

***

### updatePreferences()

> **updatePreferences**(`req`, `res`): `Promise`\<`void`\>

Defined in: [src/routes/WikiRoutes.ts:2591](https://github.com/jwilleke/amdWiki/blob/b6a859c7c9297966de89735ea5e8f953df289ac1/src/routes/WikiRoutes.ts#L2591)

Update user preferences

#### Parameters

##### req

`Request`

##### res

`Response`

#### Returns

`Promise`\<`void`\>

***

### updateProfile()

> **updateProfile**(`req`, `res`): `Promise`\<`void`\>

Defined in: [src/routes/WikiRoutes.ts:2524](https://github.com/jwilleke/amdWiki/blob/b6a859c7c9297966de89735ea5e8f953df289ac1/src/routes/WikiRoutes.ts#L2524)

Update user profile

#### Parameters

##### req

`Request`

##### res

`Response`

#### Returns

`Promise`\<`void`\>

***

### uploadAttachment()

> **uploadAttachment**(`req`, `res`): `Promise`\<`Response`\<`any`, `Record`\<`string`, `any`\>\>\>

Defined in: [src/routes/WikiRoutes.ts:1984](https://github.com/jwilleke/amdWiki/blob/b6a859c7c9297966de89735ea5e8f953df289ac1/src/routes/WikiRoutes.ts#L1984)

Upload attachment for a page

#### Parameters

##### req

`Request`

##### res

`Response`

#### Returns

`Promise`\<`Response`\<`any`, `Record`\<`string`, `any`\>\>\>

***

### uploadImage()

> **uploadImage**(`req`, `res`): `Response`\<`any`, `Record`\<`string`, `any`\>\>

Defined in: [src/routes/WikiRoutes.ts:2043](https://github.com/jwilleke/amdWiki/blob/b6a859c7c9297966de89735ea5e8f953df289ac1/src/routes/WikiRoutes.ts#L2043)

Upload image file

#### Parameters

##### req

`Request`

##### res

`Response`

#### Returns

`Response`\<`any`, `Record`\<`string`, `any`\>\>

***

### userInfo()

> **userInfo**(`req`, `res`): `Promise`\<`void`\>

Defined in: [src/routes/WikiRoutes.ts:2365](https://github.com/jwilleke/amdWiki/blob/b6a859c7c9297966de89735ea5e8f953df289ac1/src/routes/WikiRoutes.ts#L2365)

User info debug page (shows current user state)

#### Parameters

##### req

`Request`

##### res

`Response`

#### Returns

`Promise`\<`void`\>

***

### viewPage()

> **viewPage**(`req`, `res`): `Promise`\<`void` \| `Response`\<`any`, `Record`\<`string`, `any`\>\>\>

Defined in: [src/routes/WikiRoutes.ts:847](https://github.com/jwilleke/amdWiki/blob/b6a859c7c9297966de89735ea5e8f953df289ac1/src/routes/WikiRoutes.ts#L847)

Display a wiki page

#### Parameters

##### req

`Request`

##### res

`Response`

#### Returns

`Promise`\<`void` \| `Response`\<`any`, `Record`\<`string`, `any`\>\>\>
