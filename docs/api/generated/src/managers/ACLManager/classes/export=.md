[**amdWiki API v1.5.0**](../../../../README.md)

***

[amdWiki API](../../../../README.md) / [src/managers/ACLManager](../README.md) / export=

# Class: export=

Defined in: [src/managers/ACLManager.ts:148](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/managers/ACLManager.ts#L148)

ACLManager - Handles Access Control Lists and context-aware permissions

Implements JSPWiki-style access control with extensions for context-aware
permissions (time-based, location-based, etc.). Supports both page-level
ACLs embedded in page content and global policy-based access control.

Key features:
- JSPWiki-style ACL markup parsing ([{ALLOW view Admin}])
- Context-aware permission evaluation
- Global policy-based access control
- Audit logging of access decisions
- Role-based permission checking
- Category-based access control

 ACLManager

## See

 - [BaseManager](../../BaseManager/classes/default.md) for base functionality
 - PolicyEvaluator for policy evaluation
 - AuditManager for audit logging

## Example

```ts
const aclManager = engine.getManager('ACLManager');
const canView = await aclManager.checkPermission('Main', 'view', userContext);
if (canView) console.log('User can view page');
```

## Extends

- [`default`](../../BaseManager/classes/default.md)

## Constructors

### Constructor

> **new export=**(`engine`): `ACLManager`

Defined in: [src/managers/ACLManager.ts:159](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/managers/ACLManager.ts#L159)

Creates a new ACLManager instance

#### Parameters

##### engine

[`WikiEngine`](../../../types/WikiEngine/interfaces/WikiEngine.md)

The wiki engine instance

#### Returns

`ACLManager`

#### Overrides

[`default`](../../BaseManager/classes/default.md).[`constructor`](../../BaseManager/classes/default.md#constructor)

## Properties

### config?

> `protected` `optional` **config**: `Record`\<`string`, `any`\>

Defined in: [src/managers/BaseManager.ts:63](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/managers/BaseManager.ts#L63)

Configuration passed during initialization

#### Inherited from

[`default`](../../BaseManager/classes/default.md).[`config`](../../BaseManager/classes/default.md#config)

***

### engine

> `protected` **engine**: [`WikiEngine`](../../../types/WikiEngine/interfaces/WikiEngine.md)

Defined in: [src/managers/BaseManager.ts:56](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/managers/BaseManager.ts#L56)

Reference to the wiki engine

#### Inherited from

[`default`](../../BaseManager/classes/default.md).[`engine`](../../BaseManager/classes/default.md#engine)

***

### initialized

> `protected` **initialized**: `boolean`

Defined in: [src/managers/BaseManager.ts:59](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/managers/BaseManager.ts#L59)

Initialization status flag

#### Inherited from

[`default`](../../BaseManager/classes/default.md).[`initialized`](../../BaseManager/classes/default.md#initialized)

## Methods

### backup()

> **backup**(): `Promise`\<[`BackupData`](../../BaseManager/interfaces/BackupData.md)\>

Defined in: [src/managers/BaseManager.ts:168](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/managers/BaseManager.ts#L168)

Backup manager data

MUST be overridden by all managers that manage persistent data.
Default implementation returns an empty backup object.

#### Returns

`Promise`\<[`BackupData`](../../BaseManager/interfaces/BackupData.md)\>

Backup data object containing all manager state

#### Throws

If backup operation fails

#### Example

```ts
async backup(): Promise<BackupData> {
  return {
    managerName: this.constructor.name,
    timestamp: new Date().toISOString(),
    data: {
      users: Array.from(this.users.values()),
      settings: this.settings
    }
  };
}
```

#### Inherited from

[`default`](../../BaseManager/classes/default.md).[`backup`](../../BaseManager/classes/default.md#backup)

***

### checkBusinessHours()

> **checkBusinessHours**(`businessHoursConfig`, `timeZone`): `PermissionResult`

Defined in: [src/managers/ACLManager.ts:678](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/managers/ACLManager.ts#L678)

Check business hours restrictions

#### Parameters

##### businessHoursConfig

`BusinessHoursConfig` = `{}`

Business hours configuration

##### timeZone

`string` = `'UTC'`

Time zone for business hours

#### Returns

`PermissionResult`

Permission result

***

### checkContextRestrictions()

> **checkContextRestrictions**(`user`, `context`): `Promise`\<`PermissionResult`\>

Defined in: [src/managers/ACLManager.ts:602](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/managers/ACLManager.ts#L602)

Check context-aware restrictions (time-based, maintenance mode)

#### Parameters

##### user

`UserContext`

User object

##### context

`Record`\<`string`, `unknown`\>

Request context

#### Returns

`Promise`\<`PermissionResult`\>

Permission result with reason

***

### checkDefaultPermission()

> **checkDefaultPermission**(`action`, `user`): `Promise`\<`boolean`\>

Defined in: [src/managers/ACLManager.ts:570](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/managers/ACLManager.ts#L570)

Check default permissions for actions using UserManager

#### Parameters

##### action

`string`

Action to check (view, edit, delete, etc.)

##### user

`UserContext`

User object or null for anonymous

#### Returns

`Promise`\<`boolean`\>

True if user has permission, false otherwise

***

### checkEnhancedTimeRestrictions()

> **checkEnhancedTimeRestrictions**(`user`, `context`): `Promise`\<`PermissionResult`\>

Defined in: [src/managers/ACLManager.ts:732](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/managers/ACLManager.ts#L732)

Enhanced time-based permission checking with custom schedules and holidays

#### Parameters

##### user

`UserContext`

User object

##### context

`Record`\<`string`, `unknown`\>

Access context

#### Returns

`Promise`\<`PermissionResult`\>

Permission result

***

### checkHolidayRestrictions()

> **checkHolidayRestrictions**(`currentDate`, `holidaysConfig`): `Promise`\<`PermissionResult`\>

Defined in: [src/managers/ACLManager.ts:805](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/managers/ACLManager.ts#L805)

Check holiday restrictions

#### Parameters

##### currentDate

`string`

Current date in YYYY-MM-DD format

##### holidaysConfig

`HolidayConfig`

Holiday configuration

#### Returns

`Promise`\<`PermissionResult`\>

Permission result

***

### checkMaintenanceMode()

> **checkMaintenanceMode**(`user`, `maintenanceConfig`): `PermissionResult`

Defined in: [src/managers/ACLManager.ts:650](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/managers/ACLManager.ts#L650)

Check maintenance mode restrictions

#### Parameters

##### user

`UserContext`

User object

##### maintenanceConfig

`MaintenanceConfig` = `{}`

Maintenance mode configuration

#### Returns

`PermissionResult`

Permission result

***

### ~~checkPagePermission()~~

> **checkPagePermission**(`pageName`, `action`, `userContext`, `pageContent`): `Promise`\<`boolean`\>

Defined in: [src/managers/ACLManager.ts:412](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/managers/ACLManager.ts#L412)

Check page permission with context-aware and audit logging
Now includes policy-based access control integration

#### Parameters

##### pageName

`string`

Name of the page

##### action

`string`

Action to check (view, edit, delete, rename, upload)

##### userContext

`UserContext`

User context object (null for anonymous)

##### pageContent

`string`

Page content to parse ACL from

#### Returns

`Promise`\<`boolean`\>

True if permission granted

#### Deprecated

Use checkPagePermissionWithContext() with WikiContext instead

***

### checkPagePermissionWithContext()

> **checkPagePermissionWithContext**(`wikiContext`, `action`): `Promise`\<`boolean`\>

Defined in: [src/managers/ACLManager.ts:291](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/managers/ACLManager.ts#L291)

Check page permission using WikiContext

Checks if the user in WikiContext has permission to perform an action on a page.
Uses WikiContext as the single source of truth for page name, content, and user info.
Includes policy-based and page-level ACL evaluation with audit logging.

#### Parameters

##### wikiContext

`WikiContext`

The wiki context containing page and user info

##### action

`string`

Action to check (view, edit, delete, rename, upload)

#### Returns

`Promise`\<`boolean`\>

True if permission granted

#### Async

#### Example

```ts
const canEdit = await aclManager.checkPagePermissionWithContext(wikiContext, 'edit');
if (canEdit) console.log('User can edit page');
```

***

### getEngine()

> **getEngine**(): [`WikiEngine`](../../../types/WikiEngine/interfaces/WikiEngine.md)

Defined in: [src/managers/BaseManager.ts:126](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/managers/BaseManager.ts#L126)

Get the wiki engine instance

#### Returns

[`WikiEngine`](../../../types/WikiEngine/interfaces/WikiEngine.md)

The wiki engine instance

#### Example

```ts
const config = this.getEngine().getConfig();
```

#### Inherited from

[`default`](../../BaseManager/classes/default.md).[`getEngine`](../../BaseManager/classes/default.md#getengine)

***

### initialize()

> **initialize**(): `Promise`\<`void`\>

Defined in: [src/managers/ACLManager.ts:176](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/managers/ACLManager.ts#L176)

Initializes the ACLManager by loading policies and configurations

Loads access policies from configuration and initializes the policy
evaluator for context-aware permission evaluation.

#### Returns

`Promise`\<`void`\>

#### Async

#### Example

```ts
await aclManager.initialize();
console.log('ACL system ready');
```

#### Overrides

[`default`](../../BaseManager/classes/default.md).[`initialize`](../../BaseManager/classes/default.md#initialize)

***

### initializeAuditLogging()

> **initializeAuditLogging**(): `Promise`\<`void`\>

Defined in: [src/managers/ACLManager.ts:197](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/managers/ACLManager.ts#L197)

Initialize audit logging system based on configuration.

#### Returns

`Promise`\<`void`\>

***

### isInitialized()

> **isInitialized**(): `boolean`

Defined in: [src/managers/BaseManager.ts:114](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/managers/BaseManager.ts#L114)

Check if manager has been initialized

#### Returns

`boolean`

True if manager is initialized

#### Example

```ts
if (manager.isInitialized()) {
  // Safe to use manager
}
```

#### Inherited from

[`default`](../../BaseManager/classes/default.md).[`isInitialized`](../../BaseManager/classes/default.md#isinitialized)

***

### loadAccessPolicies()

> **loadAccessPolicies**(): `Promise`\<`void`\>

Defined in: [src/managers/ACLManager.ts:219](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/managers/ACLManager.ts#L219)

Load access policies from ConfigurationManager.

#### Returns

`Promise`\<`void`\>

***

### logAccessDecision()

> **logAccessDecision**(`userOrObj`, `pageName?`, `action?`, `allowed?`, `reason?`, `context?`): `void`

Defined in: [src/managers/ACLManager.ts:895](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/managers/ACLManager.ts#L895)

Record/audit an access decision.
Accepts either a single object or positional args for backward compatibility.

#### Parameters

##### userOrObj

`UserContext` | `AccessDecisionLog`

##### pageName?

`string`

##### action?

`string`

##### allowed?

`boolean`

##### reason?

`string`

##### context?

`Record`\<`string`, `unknown`\> = `{}`

#### Returns

`void`

***

### parsePageACL()

> **parsePageACL**(`content`): `Map`\<`string`, `Set`\<`string`\>\>

Defined in: [src/managers/ACLManager.ts:250](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/managers/ACLManager.ts#L250)

Parses JSPWiki-style ACL markup from page content

Extracts ACL directives from page content in the format [{ALLOW action principals}].
Multiple actions and principals can be comma-separated.

#### Parameters

##### content

`string`

The page's raw markdown content

#### Returns

`Map`\<`string`, `Set`\<`string`\>\>

Map of actions to sets of allowed principals

#### Example

```ts
const acl = aclManager.parsePageACL('[{ALLOW view All}] [{ALLOW edit Admin}]');
// acl.get('view') => Set(['All'])
// acl.get('edit') => Set(['Admin'])
```

***

### performStandardACLCheck()

> **performStandardACLCheck**(`pageName`, `action`, `user`, `pageContent`): `Promise`\<`boolean`\>

Defined in: [src/managers/ACLManager.ts:474](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/managers/ACLManager.ts#L474)

Perform standard ACL check (original logic)

#### Parameters

##### pageName

`string`

Name of the page

##### action

`string`

Action to check

##### user

`UserContext`

User object

##### pageContent

`string`

Page content

#### Returns

`Promise`\<`boolean`\>

True if permission granted

***

### removeACLMarkup()

> **removeACLMarkup**(`content`): `string`

Defined in: [src/managers/ACLManager.ts:937](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/managers/ACLManager.ts#L937)

Strip ACL markup from page content before rendering menus/partials.
Supports common patterns: [{ALLOW ...}], [{DENY ...}], %%acl ... %%, (:acl ... :)

#### Parameters

##### content

`string`

#### Returns

`string`

***

### restore()

> **restore**(`backupData`): `Promise`\<`void`\>

Defined in: [src/managers/BaseManager.ts:196](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/managers/BaseManager.ts#L196)

Restore manager data from backup

MUST be overridden by all managers that manage persistent data.
Default implementation only validates that backup data is provided.

#### Parameters

##### backupData

[`BackupData`](../../BaseManager/interfaces/BackupData.md)

Backup data object from backup() method

#### Returns

`Promise`\<`void`\>

#### Throws

If restore operation fails or backup data is missing

#### Example

```ts
async restore(backupData: BackupData): Promise<void> {
  if (!backupData || !backupData.data) {
    throw new Error('Invalid backup data');
  }
  this.users = new Map(backupData.data.users.map(u => [u.id, u]));
  this.settings = backupData.data.settings;
}
```

#### Inherited from

[`default`](../../BaseManager/classes/default.md).[`restore`](../../BaseManager/classes/default.md#restore)

***

### shutdown()

> **shutdown**(): `Promise`\<`void`\>

Defined in: [src/managers/BaseManager.ts:143](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/managers/BaseManager.ts#L143)

Shutdown the manager and cleanup resources

Override this method in subclasses to perform cleanup logic.
Always call super.shutdown() at the end of overridden implementations.

#### Returns

`Promise`\<`void`\>

#### Example

```ts
async shutdown(): Promise<void> {
  // Your cleanup logic here
  await this.closeConnections();
  await super.shutdown();
}
```

#### Inherited from

[`default`](../../BaseManager/classes/default.md).[`shutdown`](../../BaseManager/classes/default.md#shutdown)

***

### stripACLMarkup()

> **stripACLMarkup**(`content`): `string`

Defined in: [src/managers/ACLManager.ts:949](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/managers/ACLManager.ts#L949)

#### Parameters

##### content

`string`

#### Returns

`string`
