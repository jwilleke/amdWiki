[**amdWiki API v1.5.0**](../../../../README.md)

***

[amdWiki API](../../../../README.md) / [src/managers/UserManager](../README.md) / export=

# Class: export=

Defined in: [src/managers/UserManager.js:47](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/managers/UserManager.js#L47)

UserManager - Handles user authentication, authorization, and roles

Similar to JSPWiki's UserManager with role-based permissions. This manager
orchestrates user operations through a pluggable provider system, allowing
different storage backends (file, database, LDAP, etc.) to be used.

Key responsibilities:
- User authentication (login/logout)
- Password management with hashing
- Role and permission management
- Session management
- User profile management
- Provider abstraction for storage

Follows JSPWiki's provider pattern where the actual storage implementation
is abstracted behind a provider interface. This allows for different storage
backends (file, database, LDAP, etc.) to be swapped via configuration.

 UserManager

## See

 - [BaseManager](../../BaseManager/classes/export=.md) for base functionality
 - FileUserProvider for default provider implementation

## Example

```ts
const userManager = engine.getManager('UserManager');
const user = await userManager.authenticate('admin', 'password');
if (user) console.log('Logged in:', user.username);
```

## Extends

- [`export=`](../../BaseManager/classes/export=.md)

## Constructors

### Constructor

> **new export=**(`engine`): `UserManager`

Defined in: [src/managers/UserManager.js:54](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/managers/UserManager.js#L54)

Creates a new UserManager instance

#### Parameters

##### engine

`WikiEngine`

The wiki engine instance

#### Returns

`UserManager`

#### Overrides

[`export=`](../../BaseManager/classes/export=.md).[`constructor`](../../BaseManager/classes/export=.md#constructor)

## Properties

### config

> **config**: `any`

Defined in: [src/managers/BaseManager.js:55](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/managers/BaseManager.js#L55)

Configuration object passed during initialization

#### Inherited from

[`export=`](../../BaseManager/classes/export=.md).[`config`](../../BaseManager/classes/export=.md#config)

***

### defaultPassword

> **defaultPassword**: `any`

Defined in: [src/managers/UserManager.js:120](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/managers/UserManager.js#L120)

Default password for new admin user

***

### defaultTimezone

> **defaultTimezone**: `any`

Defined in: [src/managers/UserManager.js:128](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/managers/UserManager.js#L128)

Default timezone for users

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

### passwordSalt

> **passwordSalt**: `any`

Defined in: [src/managers/UserManager.js:116](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/managers/UserManager.js#L116)

Salt for password hashing

***

### permissions

> **permissions**: `Map`\<`any`, `any`\>

Defined in: [src/managers/UserManager.js:58](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/managers/UserManager.js#L58)

Permission definitions

***

### provider

> **provider**: `any`

Defined in: [src/managers/UserManager.js:56](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/managers/UserManager.js#L56)

The active user storage provider

***

### providerClass

> **providerClass**: `string`

Defined in: [src/managers/UserManager.js:95](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/managers/UserManager.js#L95)

The class name of the loaded provider

***

### roles

> **roles**: `Map`\<`any`, `any`\>

Defined in: [src/managers/UserManager.js:57](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/managers/UserManager.js#L57)

Role definitions

***

### sessionExpiration

> **sessionExpiration**: `any`

Defined in: [src/managers/UserManager.js:124](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/managers/UserManager.js#L124)

Session expiration time in milliseconds

## Methods

### assignRole()

> **assignRole**(`username`, `roleName`): `boolean`

Defined in: [src/managers/UserManager.js:1081](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/managers/UserManager.js#L1081)

Assign a role to a user

#### Parameters

##### username

`string`

Username

##### roleName

`string`

Role name to assign

#### Returns

`boolean`

True if successful

***

### authenticateUser()

> **authenticateUser**(`username`, `password`): `any`

Defined in: [src/managers/UserManager.js:399](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/managers/UserManager.js#L399)

Authenticate user with username/password

#### Parameters

##### username

`string`

Username

##### password

`string`

Password

#### Returns

`any`

User object if authenticated, including the isAuthenticated flag.

***

### backup()

> **backup**(): `Promise`\<`any`\>

Defined in: [src/managers/UserManager.js:1213](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/managers/UserManager.js#L1213)

Backup all user data

Delegates to the provider's backup() method to serialize all user and session data.
The backup includes all user accounts, sessions, and provider-specific data.

#### Returns

`Promise`\<`any`\>

Backup data from provider

#### Overrides

[`export=`](../../BaseManager/classes/export=.md).[`backup`](../../BaseManager/classes/export=.md#backup)

***

### checkDisplayNamePageConflict()

> **checkDisplayNamePageConflict**(`displayName`, `excludeUsername`): `boolean`

Defined in: [src/managers/UserManager.js:541](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/managers/UserManager.js#L541)

Check if a display name conflicts with existing page names or other users

#### Parameters

##### displayName

`string`

Display name to check

##### excludeUsername

`string` = `null`

Username to exclude from the check (for updates)

#### Returns

`boolean`

True if conflict exists

***

### createDefaultAdmin()

> **createDefaultAdmin**(): `Promise`\<`void`\>

Defined in: [src/managers/UserManager.js:270](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/managers/UserManager.js#L270)

Create default admin user

#### Returns

`Promise`\<`void`\>

***

### createOrUpdateExternalUser()

> **createOrUpdateExternalUser**(`externalUserData`): `any`

Defined in: [src/managers/UserManager.js:351](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/managers/UserManager.js#L351)

Create or update external user from OAuth/JWT token

#### Parameters

##### externalUserData

`any`

User data from external provider

#### Returns

`any`

User object

***

### ~~createRole()~~

> **createRole**(`roleData`): `Promise`\<`void`\>

Defined in: [src/managers/UserManager.js:919](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/managers/UserManager.js#L919)

Create custom role
NOTE: Roles are now defined in config files (app-custom-config.json)
This method is deprecated and will be removed in a future version.

#### Parameters

##### roleData

`any`

Role data

#### Returns

`Promise`\<`void`\>

#### Deprecated

Use config files to define roles instead

***

### createSession()

> **createSession**(`username`, `additionalData?`): `string`

Defined in: [src/managers/UserManager.js:1159](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/managers/UserManager.js#L1159)

Create a new session

#### Parameters

##### username

`string`

The username for the session

##### additionalData?

`any` = `{}`

Any additional data to store in the session

#### Returns

`string`

The ID of the created session

***

### createUser()

> **createUser**(`userData`): `any`

Defined in: [src/managers/UserManager.js:632](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/managers/UserManager.js#L632)

Create new user

#### Parameters

##### userData

`any`

User data

#### Returns

`any`

Created user (without password)

***

### createUserPage()

> **createUserPage**(`user`): `boolean`

Defined in: [src/managers/UserManager.js:570](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/managers/UserManager.js#L570)

Create a user page for a new user

#### Parameters

##### user

`any`

User object

#### Returns

`boolean`

True if user page was created successfully

***

### ~~deleteRole()~~

> **deleteRole**(`roleName`): `Promise`\<`void`\>

Defined in: [src/managers/UserManager.js:935](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/managers/UserManager.js#L935)

Delete a role
NOTE: Roles are now defined in config files
This method is deprecated and will be removed in a future version.

#### Parameters

##### roleName

`string`

Name of the role to delete

#### Returns

`Promise`\<`void`\>

#### Deprecated

Use config files to manage roles instead

***

### deleteSession()

> **deleteSession**(`sessionId`): `Promise`\<`void`\>

Defined in: [src/managers/UserManager.js:1188](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/managers/UserManager.js#L1188)

Delete a session by ID

#### Parameters

##### sessionId

`string`

The ID of the session

#### Returns

`Promise`\<`void`\>

***

### deleteUser()

> **deleteUser**(`username`): `Promise`\<`boolean`\>

Defined in: [src/managers/UserManager.js:828](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/managers/UserManager.js#L828)

Delete user

#### Parameters

##### username

`string`

Username

#### Returns

`Promise`\<`boolean`\>

***

### deleteUserSessions()

> **deleteUserSessions**(`username`): `Promise`\<`void`\>

Defined in: [src/managers/UserManager.js:1196](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/managers/UserManager.js#L1196)

Delete all sessions for a user

#### Parameters

##### username

`string`

The username of the user

#### Returns

`Promise`\<`void`\>

***

### ensureAuthenticated()

> **ensureAuthenticated**(`req`, `res`, `next`): `any`

Defined in: [src/managers/UserManager.js:1002](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/managers/UserManager.js#L1002)

Middleware to ensure user is authenticated.

#### Parameters

##### req

`any`

The request object.

##### res

`any`

The response object.

##### next

`Function`

The next middleware function.

#### Returns

`any`

***

### getAnonymousUser()

> **getAnonymousUser**(): `any`

Defined in: [src/managers/UserManager.js:1037](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/managers/UserManager.js#L1037)

Anonymous user access (no login required)

#### Returns

`any`

Anonymous user object with built-in roles.

***

### getAssertedUser()

> **getAssertedUser**(): `any`

Defined in: [src/managers/UserManager.js:1051](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/managers/UserManager.js#L1051)

Asserted user with session cookie (expired or invalid session)
Different from anonymous - they've attempted to authenticate before

#### Returns

`any`

Asserted user object

***

### getCurrentUser()

> **getCurrentUser**(`req`): `Promise`\<`any`\>

Defined in: [src/managers/UserManager.js:964](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/managers/UserManager.js#L964)

Gets the current user context from the request session.
This method is the single source of truth for user context during a request.
It dynamically adds built-in roles (All, Authenticated, Anonymous) every time.

#### Parameters

##### req

`any`

The Express request object.

#### Returns

`Promise`\<`any`\>

The user context object.

***

### getCurrentUserProvider()

> **getCurrentUserProvider**(): `BaseUserProvider`

Defined in: [src/managers/UserManager.js:216](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/managers/UserManager.js#L216)

Get the current user provider instance

#### Returns

`BaseUserProvider`

The active provider

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

### getJobTitleFromRoles()

> **getJobTitleFromRoles**(`roles`): `string`

Defined in: [src/managers/UserManager.js:1142](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/managers/UserManager.js#L1142)

Get job title from user roles (for Schema.org sync)

#### Parameters

##### roles

`any`[]

Array of role names

#### Returns

`string`

Job title string

***

### getPermissions()

> **getPermissions**(): `Map`\<`any`, `any`\>

Defined in: [src/managers/UserManager.js:899](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/managers/UserManager.js#L899)

Get all permissions

#### Returns

`Map`\<`any`, `any`\>

Map of permissions

***

### getRole()

> **getRole**(`roleName`): `any`

Defined in: [src/managers/UserManager.js:908](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/managers/UserManager.js#L908)

Get role by name

#### Parameters

##### roleName

`string`

Role name

#### Returns

`any`

Role object

***

### getRoleCompetencies()

> **getRoleCompetencies**(`role`): `any`[]

Defined in: [src/managers/UserManager.js:1127](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/managers/UserManager.js#L1127)

Get competencies required for a given role (for Schema.org sync)

#### Parameters

##### role

`string`

Role name

#### Returns

`any`[]

Array of competency strings

***

### getRoles()

> **getRoles**(): `any`[]

Defined in: [src/managers/UserManager.js:891](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/managers/UserManager.js#L891)

Get all roles

#### Returns

`any`[]

Array of roles

***

### getSession()

> **getSession**(`sessionId`): `any`

Defined in: [src/managers/UserManager.js:1180](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/managers/UserManager.js#L1180)

Get session data by ID

#### Parameters

##### sessionId

`string`

The ID of the session

#### Returns

`any`

The session data, or null if not found

***

### getUser()

> **getUser**(`username`): `any`

Defined in: [src/managers/UserManager.js:877](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/managers/UserManager.js#L877)

Get user by username

#### Parameters

##### username

`string`

Username

#### Returns

`any`

User object (without password)

***

### getUserPermissions()

> **getUserPermissions**(`username`): `Promise`\<`string`[]\>

Defined in: [src/managers/UserManager.js:478](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/managers/UserManager.js#L478)

Get user's effective permissions from PolicyManager

#### Parameters

##### username

`string`

Username (null for anonymous)

#### Returns

`Promise`\<`string`[]\>

Array of permission strings

***

### getUsers()

> **getUsers**(): `any`[]

Defined in: [src/managers/UserManager.js:864](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/managers/UserManager.js#L864)

Get all users

#### Returns

`any`[]

Array of users (without passwords)

***

### hashPassword()

> **hashPassword**(`password`): `string`

Defined in: [src/managers/UserManager.js:234](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/managers/UserManager.js#L234)

Simple password hashing using crypto

#### Parameters

##### password

`string`

Plain text password

#### Returns

`string`

Hashed password

***

### hasPermission()

> **hasPermission**(`username`, `action`): `Promise`\<`boolean`\>

Defined in: [src/managers/UserManager.js:430](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/managers/UserManager.js#L430)

Check if user has permission using policy-based access control

#### Parameters

##### username

`string`

Username (null for anonymous)

##### action

`string`

Action/permission to check (e.g., 'page:create', 'admin:users')

#### Returns

`Promise`\<`boolean`\>

True if user has permission via policies

***

### hasRole()

> **hasRole**(`username`, `roleName`): `boolean`

Defined in: [src/managers/UserManager.js:1067](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/managers/UserManager.js#L1067)

Check if a user has a specific role

#### Parameters

##### username

`string`

Username to check

##### roleName

`string`

Role name to check for

#### Returns

`boolean`

True if user has the role

***

### initialize()

> **initialize**(`config?`): `Promise`\<`void`\>

Defined in: [src/managers/UserManager.js:76](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/managers/UserManager.js#L76)

Initialize the UserManager and load the configured provider

Loads the user provider, role definitions, and creates a default admin
user if no users exist.

#### Parameters

##### config?

`any` = `{}`

Configuration object (unused, reads from ConfigurationManager)

#### Returns

`Promise`\<`void`\>

#### Async

#### Throws

If ConfigurationManager is not available or provider fails to load

#### Example

```ts
await userManager.initialize();
// Creates default admin if no users exist
```

#### Overrides

[`export=`](../../BaseManager/classes/export=.md).[`initialize`](../../BaseManager/classes/export=.md#initialize)

***

### isAdminUsingDefaultPassword()

> **isAdminUsingDefaultPassword**(): `Promise`\<`boolean`\>

Defined in: [src/managers/UserManager.js:253](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/managers/UserManager.js#L253)

Check if admin user still has the default password

#### Returns

`Promise`\<`boolean`\>

True if admin has default password

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

### removeRole()

> **removeRole**(`username`, `roleName`): `boolean`

Defined in: [src/managers/UserManager.js:1106](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/managers/UserManager.js#L1106)

Remove a role from a user

#### Parameters

##### username

`string`

Username

##### roleName

`string`

Role name to remove

#### Returns

`boolean`

True if successful

***

### requirePermissions()

> **requirePermissions**(`requiredPermissions`): `Function`

Defined in: [src/managers/UserManager.js:1015](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/managers/UserManager.js#L1015)

Middleware to ensure user has specific permissions.

#### Parameters

##### requiredPermissions

`string`[] = `[]`

The permissions required.

#### Returns

`Function`

Middleware function.

***

### restore()

> **restore**(`backupData`): `Promise`\<`void`\>

Defined in: [src/managers/UserManager.js:1251](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/managers/UserManager.js#L1251)

Restore user data from backup

Delegates to the provider's restore() method to recreate all users and sessions
from the backup data.

#### Parameters

##### backupData

`any`

Backup data from backup() method

#### Returns

`Promise`\<`void`\>

#### Overrides

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

### ~~updateRolePermissions()~~

> **updateRolePermissions**(`_roleName`, `_updates`): `Promise`\<`void`\>

Defined in: [src/managers/UserManager.js:949](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/managers/UserManager.js#L949)

Update role permissions
NOTE: Role permissions are now defined via policies in config files
This method is deprecated and will be removed in a future version.

#### Parameters

##### \_roleName

`string`

Role name to update (unused)

##### \_updates

`any`

Updates to apply (unused)

#### Returns

`Promise`\<`void`\>

#### Deprecated

Use policies in config to manage permissions instead

***

### updateUser()

> **updateUser**(`username`, `updates`): `Promise`\<`any`\>

Defined in: [src/managers/UserManager.js:761](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/managers/UserManager.js#L761)

Update user

#### Parameters

##### username

`string`

Username

##### updates

`any`

Updates to apply

#### Returns

`Promise`\<`any`\>

***

### verifyPassword()

> **verifyPassword**(`password`, `hash`): `boolean`

Defined in: [src/managers/UserManager.js:245](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/managers/UserManager.js#L245)

Verify password against hash

#### Parameters

##### password

`string`

Plain text password

##### hash

`string`

Stored hash

#### Returns

`boolean`

True if password matches
