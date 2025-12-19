[**amdWiki API v1.5.0**](../../../../README.md)

***

[amdWiki API](../../../../README.md) / [src/managers/ACLManager](../README.md) / export=

# Class: export=

Defined in: [src/managers/ACLManager.js:36](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/managers/ACLManager.js#L36)

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

 - [BaseManager](../../BaseManager/classes/export=.md) for base functionality
 - PolicyEvaluator for policy evaluation
 - AuditManager for audit logging

## Example

```ts
const aclManager = engine.getManager('ACLManager');
const canView = await aclManager.checkPermission('Main', 'view', userContext);
if (canView) console.log('User can view page');
```

## Extends

- [`export=`](../../BaseManager/classes/export=.md)

## Constructors

### Constructor

> **new export=**(`engine`): `ACLManager`

Defined in: [src/managers/ACLManager.js:43](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/managers/ACLManager.js#L43)

Creates a new ACLManager instance

#### Parameters

##### engine

`WikiEngine`

The wiki engine instance

#### Returns

`ACLManager`

#### Overrides

[`export=`](../../BaseManager/classes/export=.md).[`constructor`](../../BaseManager/classes/export=.md#constructor)

## Properties

### accessPolicies

> **accessPolicies**: `Map`\<`any`, `any`\>

Defined in: [src/managers/ACLManager.js:45](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/managers/ACLManager.js#L45)

Global access policies

***

### config

> **config**: `any`

Defined in: [src/managers/BaseManager.js:55](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/managers/BaseManager.js#L55)

Configuration object passed during initialization

#### Inherited from

[`export=`](../../BaseManager/classes/export=.md).[`config`](../../BaseManager/classes/export=.md#config)

***

### engine

> **engine**: `WikiEngine`

Defined in: [src/managers/BaseManager.js:33](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/managers/BaseManager.js#L33)

Reference to the wiki engine

#### Inherited from

[`export=`](../../BaseManager/classes/export=.md).[`engine`](../../BaseManager/classes/export=.md#engine)

***

### initialized

> **initialized**: `boolean`

Defined in: [src/managers/BaseManager.js:34](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/managers/BaseManager.js#L34)

Flag indicating initialization status

#### Inherited from

[`export=`](../../BaseManager/classes/export=.md).[`initialized`](../../BaseManager/classes/export=.md#initialized)

***

### policyEvaluator

> **policyEvaluator**: `any`

Defined in: [src/managers/ACLManager.js:46](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/managers/ACLManager.js#L46)

Policy evaluation engine

## Methods

### backup()

> **backup**(): `Promise`\<`any`\>

Defined in: [src/managers/BaseManager.js:130](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/managers/BaseManager.js#L130)

Backup manager data

MUST be overridden by all managers that manage persistent data.
Default implementation returns an empty backup object.

#### Returns

`Promise`\<`any`\>

Backup data object containing all manager state

#### Async

#### Throws

If backup operation fails

#### Example

```ts
async backup() {
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

[`export=`](../../BaseManager/classes/export=.md).[`backup`](../../BaseManager/classes/export=.md#backup)

***

### checkBusinessHours()

> **checkBusinessHours**(`businessHoursConfig`, `timeZone`): `any`

Defined in: [src/managers/ACLManager.js:486](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/managers/ACLManager.js#L486)

Check business hours restrictions

#### Parameters

##### businessHoursConfig

`any` = `{}`

Business hours configuration

##### timeZone

`string` = `'UTC'`

Time zone for business hours

#### Returns

`any`

{ allowed: boolean, reason: string }

***

### checkContextRestrictions()

> **checkContextRestrictions**(`user`, `context`): `any`

Defined in: [src/managers/ACLManager.js:414](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/managers/ACLManager.js#L414)

Check context-aware restrictions (time-based, maintenance mode)

#### Parameters

##### user

`any`

User object

##### context

`any`

Request context

#### Returns

`any`

{ allowed: boolean, reason: string }

***

### checkDefaultPermission()

> **checkDefaultPermission**(`action`, `user`): `Promise`\<`boolean`\>

Defined in: [src/managers/ACLManager.js:385](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/managers/ACLManager.js#L385)

Check default permissions for actions using UserManager

#### Parameters

##### action

`string`

Action to check (view, edit, delete, etc.)

##### user

`any`

User object or null for anonymous

#### Returns

`Promise`\<`boolean`\>

True if user has permission, false otherwise

***

### checkEnhancedTimeRestrictions()

> **checkEnhancedTimeRestrictions**(`user`, `context`): `any`

Defined in: [src/managers/ACLManager.js:540](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/managers/ACLManager.js#L540)

Enhanced time-based permission checking with custom schedules and holidays

#### Parameters

##### user

`any`

User object

##### context

`any`

Access context

#### Returns

`any`

{ allowed: boolean, reason: string, message: string }

***

### checkHolidayRestrictions()

> **checkHolidayRestrictions**(`currentDate`, `holidaysConfig`): `any`

Defined in: [src/managers/ACLManager.js:594](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/managers/ACLManager.js#L594)

Check holiday restrictions

#### Parameters

##### currentDate

`string`

Current date in YYYY-MM-DD format

##### holidaysConfig

`any`

Holiday configuration

#### Returns

`any`

{ allowed: boolean, reason: string, message: string }

***

### checkMaintenanceMode()

> **checkMaintenanceMode**(`user`, `maintenanceConfig`): `any`

Defined in: [src/managers/ACLManager.js:458](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/managers/ACLManager.js#L458)

Check maintenance mode restrictions

#### Parameters

##### user

`any`

User object

##### maintenanceConfig

`any` = `{}`

Maintenance mode configuration

#### Returns

`any`

{ allowed: boolean, reason: string }

***

### ~~checkPagePermission()~~

> **checkPagePermission**(`pageName`, `action`, `userContext`, `pageContent`): `boolean`

Defined in: [src/managers/ACLManager.js:277](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/managers/ACLManager.js#L277)

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

`any`

User context object (null for anonymous)

##### pageContent

`string`

Page content to parse ACL from

#### Returns

`boolean`

True if permission granted

#### Deprecated

Use checkPagePermissionWithContext() with WikiContext instead

***

### checkPagePermissionWithContext()

> **checkPagePermissionWithContext**(`wikiContext`, `action`): `Promise`\<`boolean`\>

Defined in: [src/managers/ACLManager.js:162](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/managers/ACLManager.js#L162)

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

> **getEngine**(): `WikiEngine`

Defined in: [src/managers/BaseManager.js:81](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/managers/BaseManager.js#L81)

Get the wiki engine instance

#### Returns

`WikiEngine`

The wiki engine instance

#### Example

```ts
const config = this.getEngine().getConfig();
```

#### Inherited from

[`export=`](../../BaseManager/classes/export=.md).[`getEngine`](../../BaseManager/classes/export=.md#getengine)

***

### initialize()

> **initialize**(): `Promise`\<`void`\>

Defined in: [src/managers/ACLManager.js:62](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/managers/ACLManager.js#L62)

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

[`export=`](../../BaseManager/classes/export=.md).[`initialize`](../../BaseManager/classes/export=.md#initialize)

***

### initializeAuditLogging()

> **initializeAuditLogging**(): `Promise`\<`void`\>

Defined in: [src/managers/ACLManager.js:78](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/managers/ACLManager.js#L78)

Initialize audit logging system based on configuration.

#### Returns

`Promise`\<`void`\>

***

### isInitialized()

> **isInitialized**(): `boolean`

Defined in: [src/managers/BaseManager.js:69](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/managers/BaseManager.js#L69)

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

[`export=`](../../BaseManager/classes/export=.md).[`isInitialized`](../../BaseManager/classes/export=.md#isinitialized)

***

### loadAccessPolicies()

> **loadAccessPolicies**(): `Promise`\<`void`\>

Defined in: [src/managers/ACLManager.js:96](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/managers/ACLManager.js#L96)

Load access policies from ConfigurationManager.

#### Returns

`Promise`\<`void`\>

***

### logAccessDecision()

> **logAccessDecision**(`userOrObj`, `pageName`, `action`, `allowed`, `reason`, `context`, ...`args`): `void`

Defined in: [src/managers/ACLManager.js:662](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/managers/ACLManager.js#L662)

Record/audit an access decision.
Accepts either a single object or positional args for backward compatibility.

#### Parameters

##### userOrObj

`any`

##### pageName

`any`

##### action

`any`

##### allowed

`any`

##### reason

`any`

##### context

##### args

...`any`[] = `{}`

#### Returns

`void`

***

### parsePageACL()

> **parsePageACL**(`content`): `Map`\<`string`, `Set`\<`string`\>\>

Defined in: [src/managers/ACLManager.js:123](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/managers/ACLManager.js#L123)

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

> **performStandardACLCheck**(`pageName`, `action`, `user`, `pageContent`): `boolean`

Defined in: [src/managers/ACLManager.js:335](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/managers/ACLManager.js#L335)

Perform standard ACL check (original logic)

#### Parameters

##### pageName

`string`

Name of the page

##### action

`string`

Action to check

##### user

`any`

User object

##### pageContent

`string`

Page content

#### Returns

`boolean`

True if permission granted

***

### removeACLMarkup()

> **removeACLMarkup**(`content`): `any`

Defined in: [src/managers/ACLManager.js:696](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/managers/ACLManager.js#L696)

Strip ACL markup from page content before rendering menus/partials.
Supports common patterns: [{ALLOW ...}], [{DENY ...}], %%acl ... %%, (:acl ... :)

#### Parameters

##### content

`any`

#### Returns

`any`

***

### restore()

> **restore**(`backupData`): `Promise`\<`void`\>

Defined in: [src/managers/BaseManager.js:163](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/managers/BaseManager.js#L163)

Restore manager data from backup

MUST be overridden by all managers that manage persistent data.
Default implementation only validates that backup data is provided.

#### Parameters

##### backupData

Backup data object from backup() method

###### data

`any`

Manager-specific backup data

###### managerName

`string`

Name of the manager

###### timestamp

`string`

ISO timestamp of backup

#### Returns

`Promise`\<`void`\>

#### Async

#### Throws

If restore operation fails or backup data is missing

#### Example

```ts
async restore(backupData) {
  if (!backupData || !backupData.data) {
    throw new Error('Invalid backup data');
  }
  this.users = new Map(backupData.data.users.map(u => [u.id, u]));
  this.settings = backupData.data.settings;
}
```

#### Inherited from

[`export=`](../../BaseManager/classes/export=.md).[`restore`](../../BaseManager/classes/export=.md#restore)

***

### shutdown()

> **shutdown**(): `Promise`\<`void`\>

Defined in: [src/managers/BaseManager.js:101](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/managers/BaseManager.js#L101)

Shutdown the manager and cleanup resources

Override this method in subclasses to perform cleanup logic.
Always call super.shutdown() at the end of overridden implementations.

#### Returns

`Promise`\<`void`\>

#### Async

#### Example

```ts
async shutdown() {
  // Your cleanup logic here
  await this.closeConnections();
  await super.shutdown();
}
```

#### Inherited from

[`export=`](../../BaseManager/classes/export=.md).[`shutdown`](../../BaseManager/classes/export=.md#shutdown)

***

### stripACLMarkup()

> **stripACLMarkup**(`content`): `any`

Defined in: [src/managers/ACLManager.js:708](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/managers/ACLManager.js#L708)

#### Parameters

##### content

`any`

#### Returns

`any`
