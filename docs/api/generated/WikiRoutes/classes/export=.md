[**amdWiki API v1.5.0**](../../README.md)

***

[amdWiki API](../../README.md) / [WikiRoutes](../README.md) / export=

# Class: export=

Defined in: [src/routes/WikiRoutes.js:54](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/routes/WikiRoutes.js#L54)

## Constructors

### Constructor

> **new export=**(`engine`): `WikiRoutes`

Defined in: [src/routes/WikiRoutes.js:55](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/routes/WikiRoutes.js#L55)

#### Parameters

##### engine

`any`

#### Returns

`WikiRoutes`

## Properties

### engine

> **engine**: `any`

Defined in: [src/routes/WikiRoutes.js:56](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/routes/WikiRoutes.js#L56)

## Methods

### adminAuditExport()

> **adminAuditExport**(`req`, `res`): `Promise`\<`any`\>

Defined in: [src/routes/WikiRoutes.js:4756](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/routes/WikiRoutes.js#L4756)

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

Defined in: [src/routes/WikiRoutes.js:4723](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/routes/WikiRoutes.js#L4723)

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

Defined in: [src/routes/WikiRoutes.js:4638](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/routes/WikiRoutes.js#L4638)

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

Defined in: [src/routes/WikiRoutes.js:4675](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/routes/WikiRoutes.js#L4675)

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

Defined in: [src/routes/WikiRoutes.js:3319](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/routes/WikiRoutes.js#L3319)

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

Defined in: [src/routes/WikiRoutes.js:4528](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/routes/WikiRoutes.js#L4528)

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

Defined in: [src/routes/WikiRoutes.js:4443](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/routes/WikiRoutes.js#L4443)

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

Defined in: [src/routes/WikiRoutes.js:4556](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/routes/WikiRoutes.js#L4556)

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

Defined in: [src/routes/WikiRoutes.js:4591](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/routes/WikiRoutes.js#L4591)

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

Defined in: [src/routes/WikiRoutes.js:3379](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/routes/WikiRoutes.js#L3379)

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

Defined in: [src/routes/WikiRoutes.js:3907](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/routes/WikiRoutes.js#L3907)

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

Defined in: [src/routes/WikiRoutes.js:2829](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/routes/WikiRoutes.js#L2829)

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

Defined in: [src/routes/WikiRoutes.js:3220](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/routes/WikiRoutes.js#L3220)

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

Defined in: [src/routes/WikiRoutes.js:3030](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/routes/WikiRoutes.js#L3030)

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

Defined in: [src/routes/WikiRoutes.js:2594](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/routes/WikiRoutes.js#L2594)

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

Defined in: [src/routes/WikiRoutes.js:3985](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/routes/WikiRoutes.js#L3985)

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

Defined in: [src/routes/WikiRoutes.js:2949](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/routes/WikiRoutes.js#L2949)

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

Defined in: [src/routes/WikiRoutes.js:3275](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/routes/WikiRoutes.js#L3275)

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

Defined in: [src/routes/WikiRoutes.js:3105](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/routes/WikiRoutes.js#L3105)

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

Defined in: [src/routes/WikiRoutes.js:4407](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/routes/WikiRoutes.js#L4407)

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

Defined in: [src/routes/WikiRoutes.js:4084](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/routes/WikiRoutes.js#L4084)

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

Defined in: [src/routes/WikiRoutes.js:4021](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/routes/WikiRoutes.js#L4021)

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

Defined in: [src/routes/WikiRoutes.js:4117](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/routes/WikiRoutes.js#L4117)

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

Defined in: [src/routes/WikiRoutes.js:4151](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/routes/WikiRoutes.js#L4151)

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

Defined in: [src/routes/WikiRoutes.js:2870](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/routes/WikiRoutes.js#L2870)

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

Defined in: [src/routes/WikiRoutes.js:3757](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/routes/WikiRoutes.js#L3757)

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

Defined in: [src/routes/WikiRoutes.js:4472](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/routes/WikiRoutes.js#L4472)

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

Defined in: [src/routes/WikiRoutes.js:3845](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/routes/WikiRoutes.js#L3845)

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

Defined in: [src/routes/WikiRoutes.js:2778](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/routes/WikiRoutes.js#L2778)

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

Defined in: [src/routes/WikiRoutes.js:3697](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/routes/WikiRoutes.js#L3697)

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

Defined in: [src/routes/WikiRoutes.js:3462](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/routes/WikiRoutes.js#L3462)

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

Defined in: [src/routes/WikiRoutes.js:3648](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/routes/WikiRoutes.js#L3648)

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

Defined in: [src/routes/WikiRoutes.js:3136](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/routes/WikiRoutes.js#L3136)

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

Defined in: [src/routes/WikiRoutes.js:3602](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/routes/WikiRoutes.js#L3602)

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

Defined in: [src/routes/WikiRoutes.js:3548](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/routes/WikiRoutes.js#L3548)

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

Defined in: [src/routes/WikiRoutes.js:2694](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/routes/WikiRoutes.js#L2694)

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

Defined in: [src/routes/WikiRoutes.js:3423](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/routes/WikiRoutes.js#L3423)

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

Defined in: [src/routes/WikiRoutes.js:3945](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/routes/WikiRoutes.js#L3945)

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

Defined in: [src/routes/WikiRoutes.js:2908](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/routes/WikiRoutes.js#L2908)

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

Defined in: [src/routes/WikiRoutes.js:3176](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/routes/WikiRoutes.js#L3176)

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

Defined in: [src/routes/WikiRoutes.js:3070](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/routes/WikiRoutes.js#L3070)

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

Defined in: [src/routes/WikiRoutes.js:2990](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/routes/WikiRoutes.js#L2990)

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

Defined in: [src/routes/WikiRoutes.js:4047](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/routes/WikiRoutes.js#L4047)

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

Defined in: [src/routes/WikiRoutes.js:3488](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/routes/WikiRoutes.js#L3488)

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

Defined in: [src/routes/WikiRoutes.js:5199](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/routes/WikiRoutes.js#L5199)

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

Defined in: [src/routes/WikiRoutes.js:885](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/routes/WikiRoutes.js#L885)

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

Defined in: [src/routes/WikiRoutes.js:1024](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/routes/WikiRoutes.js#L1024)

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

> **createWikiContext**(`req`, `options`): [`export=`](../../src/context/WikiContext/classes/export=.md)

Defined in: [src/routes/WikiRoutes.js:66](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/routes/WikiRoutes.js#L66)

Create a WikiContext for the given request and page
This should be the single source of truth for all context information

#### Parameters

##### req

`any`

Express request object

##### options

`any` = `{}`

Additional context options (pageName, content, context type)

#### Returns

[`export=`](../../src/context/WikiContext/classes/export=.md)

WikiContext instance

***

### createWikiPage()

> **createWikiPage**(`req`, `res`): `Promise`\<`any`\>

Defined in: [src/routes/WikiRoutes.js:1319](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/routes/WikiRoutes.js#L1319)

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

Defined in: [src/routes/WikiRoutes.js:2008](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/routes/WikiRoutes.js#L2008)

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

Defined in: [src/routes/WikiRoutes.js:2150](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/routes/WikiRoutes.js#L2150)

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

Defined in: [src/routes/WikiRoutes.js:1609](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/routes/WikiRoutes.js#L1609)

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

Defined in: [src/routes/WikiRoutes.js:2129](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/routes/WikiRoutes.js#L2129)

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

Defined in: [src/routes/WikiRoutes.js:1168](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/routes/WikiRoutes.js#L1168)

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

Defined in: [src/routes/WikiRoutes.js:977](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/routes/WikiRoutes.js#L977)

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

Defined in: [src/routes/WikiRoutes.js:2052](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/routes/WikiRoutes.js#L2052)

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

Defined in: [src/routes/WikiRoutes.js:2072](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/routes/WikiRoutes.js#L2072)

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

Defined in: [src/routes/WikiRoutes.js:2090](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/routes/WikiRoutes.js#L2090)

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

Defined in: [src/routes/WikiRoutes.js:711](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/routes/WikiRoutes.js#L711)

Format left menu content for Bootstrap navigation

#### Parameters

##### content

`any`

#### Returns

`any`

***

### generatePageSchema()

> **generatePageSchema**(`pageData`, `req`): `string`

Defined in: [src/routes/WikiRoutes.js:520](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/routes/WikiRoutes.js#L520)

Generate Schema.org JSON-LD markup for a page

#### Parameters

##### pageData

`any`

Page metadata and content

##### req

`any`

Express request object for URL generation

#### Returns

`string`

HTML script tag with JSON-LD

***

### generateSiteSchema()

> **generateSiteSchema**(`req`): `string`

Defined in: [src/routes/WikiRoutes.js:548](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/routes/WikiRoutes.js#L548)

Generate site-wide Schema.org markup (Organization, SoftwareApplication)

#### Parameters

##### req

`any`

Express request object

#### Returns

`string`

HTML script tags with JSON-LD

***

### getActiveSesssionCount()

> **getActiveSesssionCount**(`req`, `res`): `any`

Defined in: [src/routes/WikiRoutes.js:273](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/routes/WikiRoutes.js#L273)

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

Defined in: [src/routes/WikiRoutes.js:376](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/routes/WikiRoutes.js#L376)

Get all categories including admin-only categories

#### Returns

`Promise`\<`any`[]\>

***

### getCategories()

> **getCategories**(): `Promise`\<`any`[]\>

Defined in: [src/routes/WikiRoutes.js:340](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/routes/WikiRoutes.js#L340)

Extract categories from System Categories page

#### Returns

`Promise`\<`any`[]\>

***

### getCommonTemplateData()

> **getCommonTemplateData**(`req`): `Promise`\<\{ `applicationName`: `any`; `appName`: `any`; `currentUser`: `any`; `faviconPath`: `any`; `pages`: `any`; `user`: `any`; \}\>

Defined in: [src/routes/WikiRoutes.js:149](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/routes/WikiRoutes.js#L149)

Get common template data that all pages need.
This is now the single source of truth for common data.

#### Parameters

##### req

`any`

Express request object.

#### Returns

`Promise`\<\{ `applicationName`: `any`; `appName`: `any`; `currentUser`: `any`; `faviconPath`: `any`; `pages`: `any`; `user`: `any`; \}\>

***

### getLeftMenu()

> **getLeftMenu**(`userContext`): `Promise`\<`any`\>

Defined in: [src/routes/WikiRoutes.js:680](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/routes/WikiRoutes.js#L680)

Get and format left menu content from LeftMenu page

#### Parameters

##### userContext

`any` = `null`

#### Returns

`Promise`\<`any`\>

***

### getPageMetadata()

> **getPageMetadata**(`req`, `res`): `Promise`\<`any`\>

Defined in: [src/routes/WikiRoutes.js:4838](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/routes/WikiRoutes.js#L4838)

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

Defined in: [src/routes/WikiRoutes.js:1819](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/routes/WikiRoutes.js#L1819)

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

Defined in: [src/routes/WikiRoutes.js:3819](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/routes/WikiRoutes.js#L3819)

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

Defined in: [src/routes/WikiRoutes.js:4994](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/routes/WikiRoutes.js#L4994)

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

Defined in: [src/routes/WikiRoutes.js:5132](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/routes/WikiRoutes.js#L5132)

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

Defined in: [src/routes/WikiRoutes.js:5082](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/routes/WikiRoutes.js#L5082)

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

> **getRequestContext**(`req`): `any`

Defined in: [src/routes/WikiRoutes.js:261](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/routes/WikiRoutes.js#L261)

Extract request context for access control

#### Parameters

##### req

`any`

Express request object

#### Returns

`any`

Context information

***

### getRequestInfo()

> **getRequestInfo**(`req`): `any`

Defined in: [src/routes/WikiRoutes.js:130](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/routes/WikiRoutes.js#L130)

Extract request information for variable expansion

#### Parameters

##### req

`any`

Express request object

#### Returns

`any`

Request information object

***

### getSystemCategories()

> **getSystemCategories**(): `Promise`\<`any`[]\>

Defined in: [src/routes/WikiRoutes.js:413](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/routes/WikiRoutes.js#L413)

Get system categories from configuration (admin-only)

#### Returns

`Promise`\<`any`[]\>

***

### getTemplateDataFromContext()

> **getTemplateDataFromContext**(`wikiContext`): `any`

Defined in: [src/routes/WikiRoutes.js:83](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/routes/WikiRoutes.js#L83)

Extract template data from WikiContext
This ensures all templates get consistent data structure

#### Parameters

##### wikiContext

[`export=`](../../src/context/WikiContext/classes/export=.md)

The wiki context

#### Returns

`any`

Template data object

***

### getUserKeywords()

> **getUserKeywords**(): `Promise`\<`any`[]\>

Defined in: [src/routes/WikiRoutes.js:448](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/routes/WikiRoutes.js#L448)

Extract user keywords from User-Keywords page

#### Returns

`Promise`\<`any`[]\>

***

### homePage()

> **homePage**(`req`, `res`): `Promise`\<`void`\>

Defined in: [src/routes/WikiRoutes.js:1834](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/routes/WikiRoutes.js#L1834)

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

Defined in: [src/routes/WikiRoutes.js:647](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/routes/WikiRoutes.js#L647)

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

Defined in: [src/routes/WikiRoutes.js:2109](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/routes/WikiRoutes.js#L2109)

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

Defined in: [src/routes/WikiRoutes.js:2167](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/routes/WikiRoutes.js#L2167)

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

Defined in: [src/routes/WikiRoutes.js:5411](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/routes/WikiRoutes.js#L5411)

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

Defined in: [src/routes/WikiRoutes.js:5334](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/routes/WikiRoutes.js#L5334)

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

Defined in: [src/routes/WikiRoutes.js:106](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/routes/WikiRoutes.js#L106)

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

Defined in: [src/routes/WikiRoutes.js:1842](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/routes/WikiRoutes.js#L1842)

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

Defined in: [src/routes/WikiRoutes.js:2196](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/routes/WikiRoutes.js#L2196)

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

Defined in: [src/routes/WikiRoutes.js:2252](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/routes/WikiRoutes.js#L2252)

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

Defined in: [src/routes/WikiRoutes.js:2328](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/routes/WikiRoutes.js#L2328)

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

Defined in: [src/routes/WikiRoutes.js:2371](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/routes/WikiRoutes.js#L2371)

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

Defined in: [src/routes/WikiRoutes.js:2309](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/routes/WikiRoutes.js#L2309)

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

Defined in: [src/routes/WikiRoutes.js:4186](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/routes/WikiRoutes.js#L4186)

Register all routes with the Express app

#### Parameters

##### app

`Express`

Express application instance

#### Returns

`void`

***

### renderError()

> **renderError**(`req`, `res`, `status`, `title`, `message`): `Promise`\<`any`\>

Defined in: [src/routes/WikiRoutes.js:616](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/routes/WikiRoutes.js#L616)

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

Defined in: [src/routes/WikiRoutes.js:5258](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/routes/WikiRoutes.js#L5258)

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

Defined in: [src/routes/WikiRoutes.js:1466](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/routes/WikiRoutes.js#L1466)

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

Defined in: [src/routes/WikiRoutes.js:1703](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/routes/WikiRoutes.js#L1703)

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

Defined in: [src/routes/WikiRoutes.js:1802](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/routes/WikiRoutes.js#L1802)

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

Defined in: [src/routes/WikiRoutes.js:1976](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/routes/WikiRoutes.js#L1976)

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

Defined in: [src/routes/WikiRoutes.js:2495](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/routes/WikiRoutes.js#L2495)

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

Defined in: [src/routes/WikiRoutes.js:2428](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/routes/WikiRoutes.js#L2428)

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

Defined in: [src/routes/WikiRoutes.js:1888](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/routes/WikiRoutes.js#L1888)

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

Defined in: [src/routes/WikiRoutes.js:1947](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/routes/WikiRoutes.js#L1947)

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

Defined in: [src/routes/WikiRoutes.js:2270](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/routes/WikiRoutes.js#L2270)

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

Defined in: [src/routes/WikiRoutes.js:760](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/routes/WikiRoutes.js#L760)

Display a wiki page

#### Parameters

##### req

`any`

##### res

`any`

#### Returns

`Promise`\<`any`\>
