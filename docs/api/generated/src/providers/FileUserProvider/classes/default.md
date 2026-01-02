[**amdWiki API v1.5.0**](../../../../README.md)

***

[amdWiki API](../../../../README.md) / [src/providers/FileUserProvider](../README.md) / default

# Class: default

Defined in: [src/providers/FileUserProvider.ts:42](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/providers/FileUserProvider.ts#L42)

FileUserProvider - JSON file-based user and session storage

Stores users and sessions in JSON files on the filesystem.
This is the default provider for UserManager.

## Extends

- [`default`](../../BaseUserProvider/classes/default.md)

## Constructors

### Constructor

> **new default**(`engine`): `FileUserProvider`

Defined in: [src/providers/FileUserProvider.ts:49](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/providers/FileUserProvider.ts#L49)

#### Parameters

##### engine

[`WikiEngine`](../../../types/WikiEngine/interfaces/WikiEngine.md)

#### Returns

`FileUserProvider`

#### Overrides

[`default`](../../BaseUserProvider/classes/default.md).[`constructor`](../../BaseUserProvider/classes/default.md#constructor)

## Properties

### engine

> `protected` **engine**: [`WikiEngine`](../../../types/WikiEngine/interfaces/WikiEngine.md)

Defined in: [src/providers/BaseUserProvider.ts:43](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/providers/BaseUserProvider.ts#L43)

Reference to the wiki engine

#### Inherited from

[`default`](../../BaseUserProvider/classes/default.md).[`engine`](../../BaseUserProvider/classes/default.md#engine)

***

### initialized

> **initialized**: `boolean`

Defined in: [src/providers/BaseUserProvider.ts:46](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/providers/BaseUserProvider.ts#L46)

Whether provider has been initialized

#### Inherited from

[`default`](../../BaseUserProvider/classes/default.md).[`initialized`](../../BaseUserProvider/classes/default.md#initialized)

## Methods

### backup()

> **backup**(): `Promise`\<`FileUserProviderBackupData`\>

Defined in: [src/providers/FileUserProvider.ts:317](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/providers/FileUserProvider.ts#L317)

Backup all user and session data

#### Returns

`Promise`\<`FileUserProviderBackupData`\>

#### Overrides

[`default`](../../BaseUserProvider/classes/default.md).[`backup`](../../BaseUserProvider/classes/default.md#backup)

***

### cleanExpiredSessions()

> **cleanExpiredSessions**(): `Promise`\<`number`\>

Defined in: [src/providers/FileUserProvider.ts:295](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/providers/FileUserProvider.ts#L295)

Clean up expired sessions

#### Returns

`Promise`\<`number`\>

#### Overrides

[`default`](../../BaseUserProvider/classes/default.md).[`cleanExpiredSessions`](../../BaseUserProvider/classes/default.md#cleanexpiredsessions)

***

### createSession()

> **createSession**(`sessionId`, `sessionData`): `Promise`\<`void`\>

Defined in: [src/providers/FileUserProvider.ts:258](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/providers/FileUserProvider.ts#L258)

Create a new session

#### Parameters

##### sessionId

`string`

##### sessionData

[`UserSession`](../../../types/User/interfaces/UserSession.md)

#### Returns

`Promise`\<`void`\>

#### Overrides

[`default`](../../BaseUserProvider/classes/default.md).[`createSession`](../../BaseUserProvider/classes/default.md#createsession)

***

### createUser()

> **createUser**(`username`, `userData`): `Promise`\<`void`\>

Defined in: [src/providers/FileUserProvider.ts:211](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/providers/FileUserProvider.ts#L211)

Create a new user

#### Parameters

##### username

`string`

##### userData

[`UserCreateData`](../../../types/User/interfaces/UserCreateData.md)

#### Returns

`Promise`\<`void`\>

#### Overrides

[`default`](../../BaseUserProvider/classes/default.md).[`createUser`](../../BaseUserProvider/classes/default.md#createuser)

***

### deleteSession()

> **deleteSession**(`sessionId`): `Promise`\<`boolean`\>

Defined in: [src/providers/FileUserProvider.ts:281](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/providers/FileUserProvider.ts#L281)

Delete a session

#### Parameters

##### sessionId

`string`

#### Returns

`Promise`\<`boolean`\>

#### Overrides

[`default`](../../BaseUserProvider/classes/default.md).[`deleteSession`](../../BaseUserProvider/classes/default.md#deletesession)

***

### deleteUser()

> **deleteUser**(`username`): `Promise`\<`boolean`\>

Defined in: [src/providers/FileUserProvider.ts:237](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/providers/FileUserProvider.ts#L237)

Delete a user

#### Parameters

##### username

`string`

#### Returns

`Promise`\<`boolean`\>

#### Overrides

[`default`](../../BaseUserProvider/classes/default.md).[`deleteUser`](../../BaseUserProvider/classes/default.md#deleteuser)

***

### getAllSessions()

> **getAllSessions**(): `Promise`\<`Map`\<`string`, [`UserSession`](../../../types/User/interfaces/UserSession.md)\>\>

Defined in: [src/providers/FileUserProvider.ts:274](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/providers/FileUserProvider.ts#L274)

Get all sessions

#### Returns

`Promise`\<`Map`\<`string`, [`UserSession`](../../../types/User/interfaces/UserSession.md)\>\>

#### Overrides

[`default`](../../BaseUserProvider/classes/default.md).[`getAllSessions`](../../BaseUserProvider/classes/default.md#getallsessions)

***

### getAllUsernames()

> **getAllUsernames**(): `Promise`\<`string`[]\>

Defined in: [src/providers/FileUserProvider.ts:197](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/providers/FileUserProvider.ts#L197)

Get all usernames

#### Returns

`Promise`\<`string`[]\>

#### Overrides

[`default`](../../BaseUserProvider/classes/default.md).[`getAllUsernames`](../../BaseUserProvider/classes/default.md#getallusernames)

***

### getAllUsers()

> **getAllUsers**(): `Promise`\<`Map`\<`string`, [`User`](../../../types/User/interfaces/User.md)\>\>

Defined in: [src/providers/FileUserProvider.ts:204](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/providers/FileUserProvider.ts#L204)

Get all users

#### Returns

`Promise`\<`Map`\<`string`, [`User`](../../../types/User/interfaces/User.md)\>\>

#### Overrides

[`default`](../../BaseUserProvider/classes/default.md).[`getAllUsers`](../../BaseUserProvider/classes/default.md#getallusers)

***

### getProviderInfo()

> **getProviderInfo**(): `object`

Defined in: [src/providers/FileUserProvider.ts:386](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/providers/FileUserProvider.ts#L386)

Get provider information

#### Returns

`object`

##### description

> **description**: `string`

##### features

> **features**: `string`[]

##### name

> **name**: `string`

##### version

> **version**: `string`

#### Overrides

[`default`](../../BaseUserProvider/classes/default.md).[`getProviderInfo`](../../BaseUserProvider/classes/default.md#getproviderinfo)

***

### getSession()

> **getSession**(`sessionId`): `Promise`\<[`UserSession`](../../../types/User/interfaces/UserSession.md)\>

Defined in: [src/providers/FileUserProvider.ts:267](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/providers/FileUserProvider.ts#L267)

Get a session by ID

#### Parameters

##### sessionId

`string`

#### Returns

`Promise`\<[`UserSession`](../../../types/User/interfaces/UserSession.md)\>

#### Overrides

[`default`](../../BaseUserProvider/classes/default.md).[`getSession`](../../BaseUserProvider/classes/default.md#getsession)

***

### getUser()

> **getUser**(`username`): `Promise`\<[`User`](../../../types/User/interfaces/User.md)\>

Defined in: [src/providers/FileUserProvider.ts:190](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/providers/FileUserProvider.ts#L190)

Get a user by username

#### Parameters

##### username

`string`

#### Returns

`Promise`\<[`User`](../../../types/User/interfaces/User.md)\>

#### Overrides

[`default`](../../BaseUserProvider/classes/default.md).[`getUser`](../../BaseUserProvider/classes/default.md#getuser)

***

### initialize()

> **initialize**(): `Promise`\<`void`\>

Defined in: [src/providers/FileUserProvider.ts:61](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/providers/FileUserProvider.ts#L61)

Initialize the provider

#### Returns

`Promise`\<`void`\>

#### Overrides

[`default`](../../BaseUserProvider/classes/default.md).[`initialize`](../../BaseUserProvider/classes/default.md#initialize)

***

### restore()

> **restore**(`backupData`): `Promise`\<`void`\>

Defined in: [src/providers/FileUserProvider.ts:346](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/providers/FileUserProvider.ts#L346)

Restore user and session data from backup

#### Parameters

##### backupData

[`BackupData`](../../BaseUserProvider/interfaces/BackupData.md)

#### Returns

`Promise`\<`void`\>

#### Overrides

[`default`](../../BaseUserProvider/classes/default.md).[`restore`](../../BaseUserProvider/classes/default.md#restore)

***

### shutdown()

> **shutdown**(): `void`

Defined in: [src/providers/FileUserProvider.ts:398](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/providers/FileUserProvider.ts#L398)

Shutdown the provider - clean up expired sessions then call parent

#### Returns

`void`

#### Overrides

[`default`](../../BaseUserProvider/classes/default.md).[`shutdown`](../../BaseUserProvider/classes/default.md#shutdown)

***

### updateUser()

> **updateUser**(`username`, `userData`): `Promise`\<`void`\>

Defined in: [src/providers/FileUserProvider.ts:224](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/providers/FileUserProvider.ts#L224)

Update an existing user

#### Parameters

##### username

`string`

##### userData

[`UserUpdateData`](../../../types/User/interfaces/UserUpdateData.md)

#### Returns

`Promise`\<`void`\>

#### Overrides

[`default`](../../BaseUserProvider/classes/default.md).[`updateUser`](../../BaseUserProvider/classes/default.md#updateuser)

***

### userExists()

> **userExists**(`username`): `Promise`\<`boolean`\>

Defined in: [src/providers/FileUserProvider.ts:251](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/providers/FileUserProvider.ts#L251)

Check if user exists

#### Parameters

##### username

`string`

#### Returns

`Promise`\<`boolean`\>

#### Overrides

[`default`](../../BaseUserProvider/classes/default.md).[`userExists`](../../BaseUserProvider/classes/default.md#userexists)
