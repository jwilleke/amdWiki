[**amdWiki API v1.5.0**](../../../../README.md)

***

[amdWiki API](../../../../README.md) / [src/routes/WikiRoutes](../README.md) / default

# Class: default

Defined in: [src/routes/WikiRoutes.ts:150](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/routes/WikiRoutes.ts#L150)

## Constructors

### Constructor

> **new default**(`engine`): `WikiRoutes`

Defined in: [src/routes/WikiRoutes.ts:153](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/routes/WikiRoutes.ts#L153)

#### Parameters

##### engine

[`WikiEngine`](../../../types/WikiEngine/interfaces/WikiEngine.md)

#### Returns

`WikiRoutes`

## Methods

### adminAuditExport()

> **adminAuditExport**(`req`, `res`): `Promise`\<`any`\>

Defined in: [src/routes/WikiRoutes.ts:4871](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/routes/WikiRoutes.ts#L4871)

Export audit logs

#### Parameters

##### req

`any`

##### res

`any`

#### Returns

`Promise`\<`any`\>

***

### adminAuditLogDetails()

> **adminAuditLogDetails**(`req`, `res`): `Promise`\<`any`\>

Defined in: [src/routes/WikiRoutes.ts:4838](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/routes/WikiRoutes.ts#L4838)

API endpoint for individual audit log details

#### Parameters

##### req

`any`

##### res

`any`

#### Returns

`Promise`\<`any`\>

***

### adminAuditLogs()

> **adminAuditLogs**(`req`, `res`): `Promise`\<`any`\>

Defined in: [src/routes/WikiRoutes.ts:4753](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/routes/WikiRoutes.ts#L4753)

Admin audit logs page

#### Parameters

##### req

`any`

##### res

`any`

#### Returns

`Promise`\<`any`\>

***

### adminAuditLogsApi()

> **adminAuditLogsApi**(`req`, `res`): `Promise`\<`any`\>

Defined in: [src/routes/WikiRoutes.ts:4790](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/routes/WikiRoutes.ts#L4790)

API endpoint for audit logs data

#### Parameters

##### req

`any`

##### res

`any`

#### Returns

`Promise`\<`any`\>

***

### adminBackup()

> **adminBackup**(`req`, `res`): `Promise`\<`any`\>

Defined in: [src/routes/WikiRoutes.ts:3434](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/routes/WikiRoutes.ts#L3434)

Admin backup - Create and download full system backup

#### Parameters

##### req

`any`

##### res

`any`

#### Returns

`Promise`\<`any`\>

***

### adminCacheStats()

> **adminCacheStats**(`req`, `res`): `Promise`\<`any`\>

Defined in: [src/routes/WikiRoutes.ts:4643](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/routes/WikiRoutes.ts#L4643)

Admin cache statistics API endpoint

#### Parameters

##### req

`any`

##### res

`any`

#### Returns

`Promise`\<`any`\>

***

### adminClearAllNotifications()

> **adminClearAllNotifications**(`req`, `res`): `Promise`\<`any`\>

Defined in: [src/routes/WikiRoutes.ts:4558](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/routes/WikiRoutes.ts#L4558)

Clear all notifications (admin only)

#### Parameters

##### req

`any`

##### res

`any`

#### Returns

`Promise`\<`any`\>

***

### adminClearCache()

> **adminClearCache**(`req`, `res`): `Promise`\<`any`\>

Defined in: [src/routes/WikiRoutes.ts:4671](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/routes/WikiRoutes.ts#L4671)

Admin clear all cache API endpoint

#### Parameters

##### req

`any`

##### res

`any`

#### Returns

`Promise`\<`any`\>

***

### adminClearCacheRegion()

> **adminClearCacheRegion**(`req`, `res`): `Promise`\<`any`\>

Defined in: [src/routes/WikiRoutes.ts:4706](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/routes/WikiRoutes.ts#L4706)

Admin clear cache region API endpoint

#### Parameters

##### req

`any`

##### res

`any`

#### Returns

`Promise`\<`any`\>

***

### adminConfiguration()

> **adminConfiguration**(`req`, `res`): `Promise`\<`any`\>

Defined in: [src/routes/WikiRoutes.ts:3494](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/routes/WikiRoutes.ts#L3494)

Admin configuration management page

#### Parameters

##### req

`any`

##### res

`any`

#### Returns

`Promise`\<`any`\>

***

### adminCreateOrganization()

> **adminCreateOrganization**(`req`, `res`): `Promise`\<`any`\>

Defined in: [src/routes/WikiRoutes.ts:4022](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/routes/WikiRoutes.ts#L4022)

Create New Organization

#### Parameters

##### req

`any`

##### res

`any`

#### Returns

`Promise`\<`any`\>

***

### adminCreatePolicy()

> **adminCreatePolicy**(`req`, `res`): `Promise`\<`any`\>

Defined in: [src/routes/WikiRoutes.ts:2944](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/routes/WikiRoutes.ts#L2944)

Create a new policy

#### Parameters

##### req

`any`

##### res

`any`

#### Returns

`Promise`\<`any`\>

***

### adminCreateRole()

> **adminCreateRole**(`req`, `res`): `Promise`\<`any`\>

Defined in: [src/routes/WikiRoutes.ts:3335](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/routes/WikiRoutes.ts#L3335)

Create new role (admin only)

#### Parameters

##### req

`any`

##### res

`any`

#### Returns

`Promise`\<`any`\>

***

### adminCreateUser()

> **adminCreateUser**(`req`, `res`): `Promise`\<`any`\>

Defined in: [src/routes/WikiRoutes.ts:3145](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/routes/WikiRoutes.ts#L3145)

Create new user (admin)

#### Parameters

##### req

`any`

##### res

`any`

#### Returns

`Promise`\<`any`\>

***

### adminDashboard()

> **adminDashboard**(`req`, `res`): `Promise`\<`any`\>

Defined in: [src/routes/WikiRoutes.ts:2709](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/routes/WikiRoutes.ts#L2709)

Admin dashboard

#### Parameters

##### req

`any`

##### res

`any`

#### Returns

`Promise`\<`any`\>

***

### adminDeleteOrganization()

> **adminDeleteOrganization**(`req`, `res`): `Promise`\<`any`\>

Defined in: [src/routes/WikiRoutes.ts:4100](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/routes/WikiRoutes.ts#L4100)

Delete Organization

#### Parameters

##### req

`any`

##### res

`any`

#### Returns

`Promise`\<`any`\>

***

### adminDeletePolicy()

> **adminDeletePolicy**(`req`, `res`): `Promise`\<`any`\>

Defined in: [src/routes/WikiRoutes.ts:3064](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/routes/WikiRoutes.ts#L3064)

Delete a policy

#### Parameters

##### req

`any`

##### res

`any`

#### Returns

`Promise`\<`any`\>

***

### adminDeleteRole()

> **adminDeleteRole**(`req`, `res`): `Promise`\<`any`\>

Defined in: [src/routes/WikiRoutes.ts:3390](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/routes/WikiRoutes.ts#L3390)

Delete role (admin only)

#### Parameters

##### req

`any`

##### res

`any`

#### Returns

`Promise`\<`any`\>

***

### adminDeleteUser()

> **adminDeleteUser**(`req`, `res`): `Promise`\<`any`\>

Defined in: [src/routes/WikiRoutes.ts:3220](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/routes/WikiRoutes.ts#L3220)

Delete user (admin)

#### Parameters

##### req

`any`

##### res

`any`

#### Returns

`Promise`\<`any`\>

***

### adminDismissNotification()

> **adminDismissNotification**(`req`, `res`): `Promise`\<`any`\>

Defined in: [src/routes/WikiRoutes.ts:4522](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/routes/WikiRoutes.ts#L4522)

Dismiss a notification (admin only)

#### Parameters

##### req

`any`

##### res

`any`

#### Returns

`Promise`\<`any`\>

***

### adminFixFiles()

> **adminFixFiles**(`req`, `res`): `Promise`\<`any`\>

Defined in: [src/routes/WikiRoutes.ts:4199](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/routes/WikiRoutes.ts#L4199)

Admin API route to fix all non-compliant files

#### Parameters

##### req

`any`

##### res

`any`

#### Returns

`Promise`\<`any`\>

***

### adminGetOrganization()

> **adminGetOrganization**(`req`, `res`): `Promise`\<`any`\>

Defined in: [src/routes/WikiRoutes.ts:4136](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/routes/WikiRoutes.ts#L4136)

Get Single Organization (API endpoint)

#### Parameters

##### req

`any`

##### res

`any`

#### Returns

`Promise`\<`any`\>

***

### adminGetOrganizationSchema()

> **adminGetOrganizationSchema**(`req`, `res`): `Promise`\<`any`\>

Defined in: [src/routes/WikiRoutes.ts:4232](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/routes/WikiRoutes.ts#L4232)

Get Organization Schema.org JSON-LD (API endpoint)

#### Parameters

##### req

`any`

##### res

`any`

#### Returns

`Promise`\<`any`\>

***

### adminGetPersonSchema()

> **adminGetPersonSchema**(`req`, `res`): `Promise`\<`any`\>

Defined in: [src/routes/WikiRoutes.ts:4266](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/routes/WikiRoutes.ts#L4266)

Get Schema.org Person schema for a user

#### Parameters

##### req

`any`

##### res

`any`

#### Returns

`Promise`\<`any`\>

***

### adminGetPolicy()

> **adminGetPolicy**(`req`, `res`): `Promise`\<`any`\>

Defined in: [src/routes/WikiRoutes.ts:2985](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/routes/WikiRoutes.ts#L2985)

Get a specific policy

#### Parameters

##### req

`any`

##### res

`any`

#### Returns

`Promise`\<`any`\>

***

### adminLogs()

> **adminLogs**(`req`, `res`): `Promise`\<`any`\>

Defined in: [src/routes/WikiRoutes.ts:3872](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/routes/WikiRoutes.ts#L3872)

Admin logs page

#### Parameters

##### req

`any`

##### res

`any`

#### Returns

`Promise`\<`any`\>

***

### adminNotifications()

> **adminNotifications**(`req`, `res`): `Promise`\<`any`\>

Defined in: [src/routes/WikiRoutes.ts:4587](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/routes/WikiRoutes.ts#L4587)

Notification management page (admin only)

#### Parameters

##### req

`any`

##### res

`any`

#### Returns

`Promise`\<`any`\>

***

### adminOrganizations()

> **adminOrganizations**(`req`, `res`): `Promise`\<`any`\>

Defined in: [src/routes/WikiRoutes.ts:3960](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/routes/WikiRoutes.ts#L3960)

Admin Organizations Management Page

#### Parameters

##### req

`any`

##### res

`any`

#### Returns

`Promise`\<`any`\>

***

### adminPolicies()

> **adminPolicies**(`req`, `res`): `Promise`\<`any`\>

Defined in: [src/routes/WikiRoutes.ts:2893](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/routes/WikiRoutes.ts#L2893)

Admin policy management dashboard

#### Parameters

##### req

`any`

##### res

`any`

#### Returns

`Promise`\<`any`\>

***

### adminReindex()

> **adminReindex**(`req`, `res`): `Promise`\<`any`\>

Defined in: [src/routes/WikiRoutes.ts:3812](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/routes/WikiRoutes.ts#L3812)

Admin reindex - Refresh page cache and rebuild search index

#### Parameters

##### req

`any`

##### res

`any`

#### Returns

`Promise`\<`any`\>

***

### adminResetConfiguration()

> **adminResetConfiguration**(`req`, `res`): `Promise`\<`any`\>

Defined in: [src/routes/WikiRoutes.ts:3577](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/routes/WikiRoutes.ts#L3577)

Reset configuration to defaults

#### Parameters

##### req

`any`

##### res

`any`

#### Returns

`Promise`\<`any`\>

***

### adminRestart()

> **adminRestart**(`req`, `res`): `Promise`\<`any`\>

Defined in: [src/routes/WikiRoutes.ts:3763](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/routes/WikiRoutes.ts#L3763)

Restart the system (PM2)

#### Parameters

##### req

`any`

##### res

`any`

#### Returns

`Promise`\<`any`\>

***

### adminRoles()

> **adminRoles**(`req`, `res`): `Promise`\<`any`\>

Defined in: [src/routes/WikiRoutes.ts:3251](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/routes/WikiRoutes.ts#L3251)

Admin roles management

#### Parameters

##### req

`any`

##### res

`any`

#### Returns

`Promise`\<`any`\>

***

### adminSettings()

> **adminSettings**(`req`, `res`): `Promise`\<`any`\>

Defined in: [src/routes/WikiRoutes.ts:3717](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/routes/WikiRoutes.ts#L3717)

Admin settings page

#### Parameters

##### req

`any`

##### res

`any`

#### Returns

`Promise`\<`any`\>

***

### adminTestVariables()

> **adminTestVariables**(`req`, `res`): `Promise`\<`any`\>

Defined in: [src/routes/WikiRoutes.ts:3663](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/routes/WikiRoutes.ts#L3663)

Test variable expansion

#### Parameters

##### req

`any`

##### res

`any`

#### Returns

`Promise`\<`any`\>

***

### adminToggleMaintenance()

> **adminToggleMaintenance**(`req`, `res`): `Promise`\<`any`\>

Defined in: [src/routes/WikiRoutes.ts:2809](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/routes/WikiRoutes.ts#L2809)

Toggle maintenance mode (admin only)

#### Parameters

##### req

`any`

##### res

`any`

#### Returns

`Promise`\<`any`\>

***

### adminUpdateConfiguration()

> **adminUpdateConfiguration**(`req`, `res`): `Promise`\<`any`\>

Defined in: [src/routes/WikiRoutes.ts:3538](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/routes/WikiRoutes.ts#L3538)

Update configuration property

#### Parameters

##### req

`any`

##### res

`any`

#### Returns

`Promise`\<`any`\>

***

### adminUpdateOrganization()

> **adminUpdateOrganization**(`req`, `res`): `Promise`\<`any`\>

Defined in: [src/routes/WikiRoutes.ts:4060](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/routes/WikiRoutes.ts#L4060)

Update Existing Organization

#### Parameters

##### req

`any`

##### res

`any`

#### Returns

`Promise`\<`any`\>

***

### adminUpdatePolicy()

> **adminUpdatePolicy**(`req`, `res`): `Promise`\<`any`\>

Defined in: [src/routes/WikiRoutes.ts:3023](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/routes/WikiRoutes.ts#L3023)

Update an existing policy

#### Parameters

##### req

`any`

##### res

`any`

#### Returns

`Promise`\<`any`\>

***

### adminUpdateRole()

> **adminUpdateRole**(`req`, `res`): `Promise`\<`any`\>

Defined in: [src/routes/WikiRoutes.ts:3291](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/routes/WikiRoutes.ts#L3291)

Update role permissions (admin only)

#### Parameters

##### req

`any`

##### res

`any`

#### Returns

`Promise`\<`any`\>

***

### adminUpdateUser()

> **adminUpdateUser**(`req`, `res`): `Promise`\<`any`\>

Defined in: [src/routes/WikiRoutes.ts:3185](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/routes/WikiRoutes.ts#L3185)

Update user (admin)

#### Parameters

##### req

`any`

##### res

`any`

#### Returns

`Promise`\<`any`\>

***

### adminUsers()

> **adminUsers**(`req`, `res`): `Promise`\<`any`\>

Defined in: [src/routes/WikiRoutes.ts:3105](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/routes/WikiRoutes.ts#L3105)

Admin users management

#### Parameters

##### req

`any`

##### res

`any`

#### Returns

`Promise`\<`any`\>

***

### adminValidateFiles()

> **adminValidateFiles**(`req`, `res`): `Promise`\<`any`\>

Defined in: [src/routes/WikiRoutes.ts:4162](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/routes/WikiRoutes.ts#L4162)

Admin route to validate all files and check for naming convention compliance

#### Parameters

##### req

`any`

##### res

`any`

#### Returns

`Promise`\<`any`\>

***

### adminVariables()

> **adminVariables**(`req`, `res`): `Promise`\<`any`\>

Defined in: [src/routes/WikiRoutes.ts:3603](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/routes/WikiRoutes.ts#L3603)

Admin variable management page

#### Parameters

##### req

`any`

##### res

`any`

#### Returns

`Promise`\<`any`\>

***

### comparePageVersions()

> **comparePageVersions**(`req`, `res`): `Promise`\<`any`\>

Defined in: [src/routes/WikiRoutes.ts:5314](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/routes/WikiRoutes.ts#L5314)

GET /api/page/:identifier/compare/:v1/:v2
Compare two versions of a page

#### Parameters

##### req

`any`

##### res

`any`

#### Returns

`Promise`\<`any`\>

***

### createPage()

> **createPage**(`req`, `res`): `Promise`\<`any`\>

Defined in: [src/routes/WikiRoutes.ts:990](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/routes/WikiRoutes.ts#L990)

Display create new page form with template selection

#### Parameters

##### req

`any`

##### res

`any`

#### Returns

`Promise`\<`any`\>

***

### createPageFromTemplate()

> **createPageFromTemplate**(`req`, `res`): `Promise`\<`any`\>

Defined in: [src/routes/WikiRoutes.ts:1129](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/routes/WikiRoutes.ts#L1129)

Create a new page from template

#### Parameters

##### req

`any`

##### res

`any`

#### Returns

`Promise`\<`any`\>

***

### createWikiContext()

> **createWikiContext**(`req`, `options`): [`default`](../../../context/WikiContext/classes/default.md)

Defined in: [src/routes/WikiRoutes.ts:164](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/routes/WikiRoutes.ts#L164)

Create a WikiContext for the given request and page
This should be the single source of truth for all context information

#### Parameters

##### req

`any`

Express request object

##### options

`WikiContextOptions` = `{}`

Additional context options (pageName, content, context type)

#### Returns

[`default`](../../../context/WikiContext/classes/default.md)

WikiContext instance

***

### createWikiPage()

> **createWikiPage**(`req`, `res`): `Promise`\<`any`\>

Defined in: [src/routes/WikiRoutes.ts:1429](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/routes/WikiRoutes.ts#L1429)

Create a new wiki page via POST /wiki/:page

#### Parameters

##### req

`any`

Express request object

##### res

`any`

Express response object

#### Returns

`Promise`\<`any`\>

***

### deleteAttachment()

> **deleteAttachment**(`req`, `res`): `Promise`\<`any`\>

Defined in: [src/routes/WikiRoutes.ts:2123](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/routes/WikiRoutes.ts#L2123)

Delete attachment

#### Parameters

##### req

`any`

##### res

`any`

#### Returns

`Promise`\<`any`\>

***

### deleteExport()

> **deleteExport**(`req`, `res`): `Promise`\<`void`\>

Defined in: [src/routes/WikiRoutes.ts:2265](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/routes/WikiRoutes.ts#L2265)

Delete export file

#### Parameters

##### req

`any`

##### res

`any`

#### Returns

`Promise`\<`void`\>

***

### deletePage()

> **deletePage**(`req`, `res`): `Promise`\<`any`\>

Defined in: [src/routes/WikiRoutes.ts:1719](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/routes/WikiRoutes.ts#L1719)

Delete a page

#### Parameters

##### req

`any`

##### res

`any`

#### Returns

`Promise`\<`any`\>

***

### downloadExport()

> **downloadExport**(`req`, `res`): `Promise`\<`any`\>

Defined in: [src/routes/WikiRoutes.ts:2244](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/routes/WikiRoutes.ts#L2244)

Download export file

#### Parameters

##### req

`any`

##### res

`any`

#### Returns

`Promise`\<`any`\>

***

### editPage()

> **editPage**(`req`, `res`): `Promise`\<`any`\>

Defined in: [src/routes/WikiRoutes.ts:1273](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/routes/WikiRoutes.ts#L1273)

#### Parameters

##### req

`any`

##### res

`any`

#### Returns

`Promise`\<`any`\>

***

### editPageIndex()

> **editPageIndex**(`req`, `res`): `Promise`\<`any`\>

Defined in: [src/routes/WikiRoutes.ts:1082](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/routes/WikiRoutes.ts#L1082)

Handle /edit route without page parameter

#### Parameters

##### req

`any`

##### res

`any`

#### Returns

`Promise`\<`any`\>

***

### exportPage()

> **exportPage**(`req`, `res`): `Promise`\<`void`\>

Defined in: [src/routes/WikiRoutes.ts:2167](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/routes/WikiRoutes.ts#L2167)

Export page selection form

#### Parameters

##### req

`any`

##### res

`any`

#### Returns

`Promise`\<`void`\>

***

### exportPageHtml()

> **exportPageHtml**(`req`, `res`): `Promise`\<`void`\>

Defined in: [src/routes/WikiRoutes.ts:2187](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/routes/WikiRoutes.ts#L2187)

Export page to HTML

#### Parameters

##### req

`any`

##### res

`any`

#### Returns

`Promise`\<`void`\>

***

### exportPageMarkdown()

> **exportPageMarkdown**(`req`, `res`): `Promise`\<`void`\>

Defined in: [src/routes/WikiRoutes.ts:2205](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/routes/WikiRoutes.ts#L2205)

Export page to Markdown

#### Parameters

##### req

`any`

##### res

`any`

#### Returns

`Promise`\<`void`\>

***

### formatLeftMenuContent()

> **formatLeftMenuContent**(`content`): `any`

Defined in: [src/routes/WikiRoutes.ts:811](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/routes/WikiRoutes.ts#L811)

Format left menu content for Bootstrap navigation

#### Parameters

##### content

`any`

#### Returns

`any`

***

### generatePageSchema()

> **generatePageSchema**(`pageData`, `req`): `Promise`\<`string`\>

Defined in: [src/routes/WikiRoutes.ts:620](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/routes/WikiRoutes.ts#L620)

Generate Schema.org JSON-LD markup for a page

#### Parameters

##### pageData

`any`

Page metadata and content

##### req

`any`

Express request object for URL generation

#### Returns

`Promise`\<`string`\>

HTML script tag with JSON-LD

***

### generateSiteSchema()

> **generateSiteSchema**(`req`): `Promise`\<`string`\>

Defined in: [src/routes/WikiRoutes.ts:648](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/routes/WikiRoutes.ts#L648)

Generate site-wide Schema.org markup (Organization, SoftwareApplication)

#### Parameters

##### req

`any`

Express request object

#### Returns

`Promise`\<`string`\>

HTML script tags with JSON-LD

***

### getActiveSesssionCount()

> **getActiveSesssionCount**(`req`, `res`): `any`

Defined in: [src/routes/WikiRoutes.ts:373](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/routes/WikiRoutes.ts#L373)

Session count (uses app.js sessionStore)

#### Parameters

##### req

`any`

##### res

`any`

#### Returns

`any`

***

### getAllCategories()

> **getAllCategories**(): `Promise`\<`any`[]\>

Defined in: [src/routes/WikiRoutes.ts:476](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/routes/WikiRoutes.ts#L476)

Get all categories including admin-only categories

#### Returns

`Promise`\<`any`[]\>

***

### getCategories()

> **getCategories**(): `Promise`\<`any`[]\>

Defined in: [src/routes/WikiRoutes.ts:440](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/routes/WikiRoutes.ts#L440)

Extract categories from System Categories page

#### Returns

`Promise`\<`any`[]\>

***

### getCommonTemplateData()

> **getCommonTemplateData**(`req`): `Promise`\<`any`\>

Defined in: [src/routes/WikiRoutes.ts:247](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/routes/WikiRoutes.ts#L247)

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

> **getLeftMenu**(`userContext`): `Promise`\<`any`\>

Defined in: [src/routes/WikiRoutes.ts:780](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/routes/WikiRoutes.ts#L780)

Get and format left menu content from LeftMenu page

#### Parameters

##### userContext

`any` = `null`

#### Returns

`Promise`\<`any`\>

***

### getPageMetadata()

> **getPageMetadata**(`req`, `res`): `Promise`\<`any`\>

Defined in: [src/routes/WikiRoutes.ts:4953](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/routes/WikiRoutes.ts#L4953)

Get page metadata in a user-friendly format

#### Parameters

##### req

`any`

##### res

`any`

#### Returns

`Promise`\<`any`\>

***

### getPageNames()

> **getPageNames**(`req`, `res`): `Promise`\<`void`\>

Defined in: [src/routes/WikiRoutes.ts:1934](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/routes/WikiRoutes.ts#L1934)

API endpoint for getting all page names

#### Parameters

##### req

`any`

##### res

`any`

#### Returns

`Promise`\<`void`\>

***

### getPageSource()

> **getPageSource**(`req`, `res`): `Promise`\<`any`\>

Defined in: [src/routes/WikiRoutes.ts:3934](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/routes/WikiRoutes.ts#L3934)

Get raw page source (markdown content) for viewing/copying

#### Parameters

##### req

`any`

##### res

`any`

#### Returns

`Promise`\<`any`\>

***

### getPageSuggestions()

> **getPageSuggestions**(`req`, `res`): `Promise`\<`any`\>

Defined in: [src/routes/WikiRoutes.ts:5109](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/routes/WikiRoutes.ts#L5109)

API endpoint for page name autocomplete suggestions
GET /api/page-suggestions?q=partial

Used for:
- Autocomplete when typing [page name] in editor
- Autocomplete in search dialogs

Related: GitHub Issue #90 - TypeDown for Internal Page Links

#### Parameters

##### req

`any`

##### res

`any`

#### Returns

`Promise`\<`any`\>

***

### getPageVersion()

> **getPageVersion**(`req`, `res`): `Promise`\<`any`\>

Defined in: [src/routes/WikiRoutes.ts:5247](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/routes/WikiRoutes.ts#L5247)

GET /api/page/:identifier/version/:version
Get specific version content

#### Parameters

##### req

`any`

##### res

`any`

#### Returns

`Promise`\<`any`\>

***

### getPageVersions()

> **getPageVersions**(`req`, `res`): `Promise`\<`any`\>

Defined in: [src/routes/WikiRoutes.ts:5197](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/routes/WikiRoutes.ts#L5197)

GET /api/page/:identifier/versions
Get version history for a page

#### Parameters

##### req

`any`

##### res

`any`

#### Returns

`Promise`\<`any`\>

***

### getRequestContext()

> **getRequestContext**(`req`): `object`

Defined in: [src/routes/WikiRoutes.ts:361](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/routes/WikiRoutes.ts#L361)

Extract request context for access control

#### Parameters

##### req

`any`

Express request object

#### Returns

`object`

Context information

##### ip

> **ip**: `any`

##### referer

> **referer**: `any`

##### timestamp

> **timestamp**: `string`

##### userAgent

> **userAgent**: `any`

***

### getRequestInfo()

> **getRequestInfo**(`req`): `object`

Defined in: [src/routes/WikiRoutes.ts:228](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/routes/WikiRoutes.ts#L228)

Extract request information for variable expansion

#### Parameters

##### req

`any`

Express request object

#### Returns

`object`

Request information object

##### acceptLanguage

> **acceptLanguage**: `any`

##### clientIp

> **clientIp**: `any`

##### referer

> **referer**: `any`

##### sessionId

> **sessionId**: `any`

##### userAgent

> **userAgent**: `any`

***

### getSystemCategories()

> **getSystemCategories**(): `Promise`\<`any`[]\>

Defined in: [src/routes/WikiRoutes.ts:513](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/routes/WikiRoutes.ts#L513)

Get system categories from configuration (admin-only)

#### Returns

`Promise`\<`any`[]\>

***

### getTemplateDataFromContext()

> **getTemplateDataFromContext**(`wikiContext`): `object`

Defined in: [src/routes/WikiRoutes.ts:181](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/routes/WikiRoutes.ts#L181)

Extract template data from WikiContext
This ensures all templates get consistent data structure

#### Parameters

##### wikiContext

`any`

The wiki context

#### Returns

`object`

Template data object

##### currentUser

> **currentUser**: `any` = `wikiContext.userContext`

##### engine

> **engine**: `any` = `wikiContext.engine`

##### pageName

> **pageName**: `any` = `wikiContext.pageName`

##### user

> **user**: `any` = `wikiContext.userContext`

##### userContext

> **userContext**: `any` = `wikiContext.userContext`

##### wikiContext

> **wikiContext**: `any`

***

### getUserKeywords()

> **getUserKeywords**(): `Promise`\<`any`[]\>

Defined in: [src/routes/WikiRoutes.ts:548](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/routes/WikiRoutes.ts#L548)

Extract user keywords from User-Keywords page

#### Returns

`Promise`\<`any`[]\>

***

### homePage()

> **homePage**(`req`, `res`): `Promise`\<`void`\>

Defined in: [src/routes/WikiRoutes.ts:1949](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/routes/WikiRoutes.ts#L1949)

Home page - show main index

#### Parameters

##### req

`any`

##### res

`any`

#### Returns

`Promise`\<`void`\>

***

### isRequiredPage()

> **isRequiredPage**(`pageName`): `Promise`\<`boolean`\>

Defined in: [src/routes/WikiRoutes.ts:747](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/routes/WikiRoutes.ts#L747)

Check if a page is a protected page (admin-only edit)

Protected pages include:
- Hardcoded required pages (backward compatibility)
- Pages with system-category: system or documentation

These pages are considered core system pages that may be overwritten
by future updates to the application.

#### Parameters

##### pageName

`any`

The page name to check

#### Returns

`Promise`\<`boolean`\>

True if page requires admin permission to edit

***

### listExports()

> **listExports**(`req`, `res`): `Promise`\<`void`\>

Defined in: [src/routes/WikiRoutes.ts:2224](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/routes/WikiRoutes.ts#L2224)

List available exports

#### Parameters

##### req

`any`

##### res

`any`

#### Returns

`Promise`\<`void`\>

***

### loginPage()

> **loginPage**(`req`, `res`): `Promise`\<`any`\>

Defined in: [src/routes/WikiRoutes.ts:2282](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/routes/WikiRoutes.ts#L2282)

Login page

#### Parameters

##### req

`any`

##### res

`any`

#### Returns

`Promise`\<`any`\>

***

### pageDiff()

> **pageDiff**(`req`, `res`): `Promise`\<`any`\>

Defined in: [src/routes/WikiRoutes.ts:5526](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/routes/WikiRoutes.ts#L5526)

GET /diff/:page?v1=X&v2=Y
Show version comparison view

#### Parameters

##### req

`any`

##### res

`any`

#### Returns

`Promise`\<`any`\>

***

### pageHistory()

> **pageHistory**(`req`, `res`): `Promise`\<`any`\>

Defined in: [src/routes/WikiRoutes.ts:5449](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/routes/WikiRoutes.ts#L5449)

GET /history/:page
Show page history view

#### Parameters

##### req

`any`

##### res

`any`

#### Returns

`Promise`\<`any`\>

***

### parseFileSize()

> **parseFileSize**(`sizeStr`): `number`

Defined in: [src/routes/WikiRoutes.ts:204](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/routes/WikiRoutes.ts#L204)

Parse file size string (e.g., '5MB', '1GB') to bytes

#### Parameters

##### sizeStr

`any`

Size string

#### Returns

`number`

Size in bytes

***

### previewPage()

> **previewPage**(`req`, `res`): `Promise`\<`void`\>

Defined in: [src/routes/WikiRoutes.ts:1957](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/routes/WikiRoutes.ts#L1957)

API endpoint to get page preview

#### Parameters

##### req

`any`

##### res

`any`

#### Returns

`Promise`\<`void`\>

***

### processLogin()

> **processLogin**(`req`, `res`): `Promise`\<`any`\>

Defined in: [src/routes/WikiRoutes.ts:2311](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/routes/WikiRoutes.ts#L2311)

Process login

#### Parameters

##### req

`any`

##### res

`any`

#### Returns

`Promise`\<`any`\>

***

### processLogout()

> **processLogout**(`req`, `res`): `Promise`\<`void`\>

Defined in: [src/routes/WikiRoutes.ts:2367](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/routes/WikiRoutes.ts#L2367)

Process logout

#### Parameters

##### req

`any`

##### res

`any`

#### Returns

`Promise`\<`void`\>

***

### processRegister()

> **processRegister**(`req`, `res`): `Promise`\<`any`\>

Defined in: [src/routes/WikiRoutes.ts:2443](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/routes/WikiRoutes.ts#L2443)

Process registration

#### Parameters

##### req

`any`

##### res

`any`

#### Returns

`Promise`\<`any`\>

***

### profilePage()

> **profilePage**(`req`, `res`): `Promise`\<`any`\>

Defined in: [src/routes/WikiRoutes.ts:2486](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/routes/WikiRoutes.ts#L2486)

User profile page

#### Parameters

##### req

`any`

##### res

`any`

#### Returns

`Promise`\<`any`\>

***

### registerPage()

> **registerPage**(`req`, `res`): `Promise`\<`void`\>

Defined in: [src/routes/WikiRoutes.ts:2424](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/routes/WikiRoutes.ts#L2424)

Registration page

#### Parameters

##### req

`any`

##### res

`any`

#### Returns

`Promise`\<`void`\>

***

### registerRoutes()

> **registerRoutes**(`app`): `void`

Defined in: [src/routes/WikiRoutes.ts:4301](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/routes/WikiRoutes.ts#L4301)

Register all routes with the Express app

#### Parameters

##### app

`any`

Express application instance

#### Returns

`void`

***

### renderError()

> **renderError**(`req`, `res`, `status`, `title`, `message`): `Promise`\<`any`\>

Defined in: [src/routes/WikiRoutes.ts:716](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/routes/WikiRoutes.ts#L716)

Render error page with consistent template data

#### Parameters

##### req

`any`

##### res

`any`

##### status

`any`

##### title

`any`

##### message

`any`

#### Returns

`Promise`\<`any`\>

***

### restorePageVersion()

> **restorePageVersion**(`req`, `res`): `Promise`\<`any`\>

Defined in: [src/routes/WikiRoutes.ts:5373](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/routes/WikiRoutes.ts#L5373)

POST /api/page/:identifier/restore/:version
Restore page to a specific version

#### Parameters

##### req

`any`

##### res

`any`

#### Returns

`Promise`\<`any`\>

***

### savePage()

> **savePage**(`req`, `res`): `Promise`\<`any`\>

Defined in: [src/routes/WikiRoutes.ts:1576](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/routes/WikiRoutes.ts#L1576)

Save a page

#### Parameters

##### req

`any`

##### res

`any`

#### Returns

`Promise`\<`any`\>

***

### searchPages()

> **searchPages**(`req`, `res`): `Promise`\<`void`\>

Defined in: [src/routes/WikiRoutes.ts:1818](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/routes/WikiRoutes.ts#L1818)

Search pages with advanced options

#### Parameters

##### req

`any`

##### res

`any`

#### Returns

`Promise`\<`void`\>

***

### searchSuggestions()

> **searchSuggestions**(`req`, `res`): `Promise`\<`void`\>

Defined in: [src/routes/WikiRoutes.ts:1917](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/routes/WikiRoutes.ts#L1917)

API endpoint for search suggestions

#### Parameters

##### req

`any`

##### res

`any`

#### Returns

`Promise`\<`void`\>

***

### serveAttachment()

> **serveAttachment**(`req`, `res`): `Promise`\<`any`\>

Defined in: [src/routes/WikiRoutes.ts:2091](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/routes/WikiRoutes.ts#L2091)

Serve attachment file

#### Parameters

##### req

`any`

##### res

`any`

#### Returns

`Promise`\<`any`\>

***

### updatePreferences()

> **updatePreferences**(`req`, `res`): `Promise`\<`any`\>

Defined in: [src/routes/WikiRoutes.ts:2610](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/routes/WikiRoutes.ts#L2610)

Update user preferences

#### Parameters

##### req

`any`

##### res

`any`

#### Returns

`Promise`\<`any`\>

***

### updateProfile()

> **updateProfile**(`req`, `res`): `Promise`\<`any`\>

Defined in: [src/routes/WikiRoutes.ts:2543](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/routes/WikiRoutes.ts#L2543)

Update user profile

#### Parameters

##### req

`any`

##### res

`any`

#### Returns

`Promise`\<`any`\>

***

### uploadAttachment()

> **uploadAttachment**(`req`, `res`): `Promise`\<`any`\>

Defined in: [src/routes/WikiRoutes.ts:2003](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/routes/WikiRoutes.ts#L2003)

Upload attachment for a page

#### Parameters

##### req

`any`

##### res

`any`

#### Returns

`Promise`\<`any`\>

***

### uploadImage()

> **uploadImage**(`req`, `res`): `Promise`\<`any`\>

Defined in: [src/routes/WikiRoutes.ts:2062](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/routes/WikiRoutes.ts#L2062)

Upload image file

#### Parameters

##### req

`any`

##### res

`any`

#### Returns

`Promise`\<`any`\>

***

### userInfo()

> **userInfo**(`req`, `res`): `Promise`\<`void`\>

Defined in: [src/routes/WikiRoutes.ts:2385](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/routes/WikiRoutes.ts#L2385)

User info debug page (shows current user state)

#### Parameters

##### req

`any`

##### res

`any`

#### Returns

`Promise`\<`void`\>

***

### viewPage()

> **viewPage**(`req`, `res`): `Promise`\<`any`\>

Defined in: [src/routes/WikiRoutes.ts:860](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/routes/WikiRoutes.ts#L860)

Display a wiki page

#### Parameters

##### req

`any`

##### res

`any`

#### Returns

`Promise`\<`any`\>
