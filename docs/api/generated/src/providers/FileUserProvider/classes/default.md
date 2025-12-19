[**amdWiki API v1.5.0**](../../../../README.md)

***

[amdWiki API](../../../../README.md) / [src/providers/FileUserProvider](../README.md) / default

# Class: default

Defined in: [src/providers/FileUserProvider.ts:41](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/providers/FileUserProvider.ts#L41)

FileUserProvider - JSON file-based user and session storage

Stores users and sessions in JSON files on the filesystem.
This is the default provider for UserManager.

## Extends

- [`default`](../../BaseUserProvider/classes/default.md)

## Constructors

### Constructor

> **new default**(`engine`): `FileUserProvider`

Defined in: [src/providers/FileUserProvider.ts:48](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/providers/FileUserProvider.ts#L48)

#### Parameters

##### engine

[`WikiEngine`](../../BasePageProvider/interfaces/WikiEngine.md)

#### Returns

`FileUserProvider`

#### Overrides

[`default`](../../BaseUserProvider/classes/default.md).[`constructor`](../../BaseUserProvider/classes/default.md#constructor)

## Properties

### engine

> `protected` **engine**: [`WikiEngine`](../../BasePageProvider/interfaces/WikiEngine.md)

Defined in: [src/providers/BaseUserProvider.ts:43](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/providers/BaseUserProvider.ts#L43)

Reference to the wiki engine

#### Inherited from

[`default`](../../BaseUserProvider/classes/default.md).[`engine`](../../BaseUserProvider/classes/default.md#engine)

***

### initialized

> **initialized**: `boolean`

Defined in: [src/providers/BaseUserProvider.ts:46](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/providers/BaseUserProvider.ts#L46)

Whether provider has been initialized

#### Inherited from

[`default`](../../BaseUserProvider/classes/default.md).[`initialized`](../../BaseUserProvider/classes/default.md#initialized)

## Methods

### backup()

> **backup**(): `Promise`\<`FileUserProviderBackupData`\>

Defined in: [src/providers/FileUserProvider.ts:316](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/providers/FileUserProvider.ts#L316)

Backup all user and session data

#### Returns

`Promise`\<`FileUserProviderBackupData`\>

#### Overrides

[`default`](../../BaseUserProvider/classes/default.md).[`backup`](../../BaseUserProvider/classes/default.md#backup)

***

### cleanExpiredSessions()

> **cleanExpiredSessions**(): `Promise`\<`number`\>

Defined in: [src/providers/FileUserProvider.ts:294](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/providers/FileUserProvider.ts#L294)

Clean up expired sessions

#### Returns

`Promise`\<`number`\>

#### Overrides

[`default`](../../BaseUserProvider/classes/default.md).[`cleanExpiredSessions`](../../BaseUserProvider/classes/default.md#cleanexpiredsessions)

***

### createSession()

> **createSession**(`sessionId`, `sessionData`): `Promise`\<`void`\>

Defined in: [src/providers/FileUserProvider.ts:257](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/providers/FileUserProvider.ts#L257)

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

Defined in: [src/providers/FileUserProvider.ts:210](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/providers/FileUserProvider.ts#L210)

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

Defined in: [src/providers/FileUserProvider.ts:280](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/providers/FileUserProvider.ts#L280)

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

Defined in: [src/providers/FileUserProvider.ts:236](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/providers/FileUserProvider.ts#L236)

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

Defined in: [src/providers/FileUserProvider.ts:273](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/providers/FileUserProvider.ts#L273)

Get all sessions

#### Returns

`Promise`\<`Map`\<`string`, [`UserSession`](../../../types/User/interfaces/UserSession.md)\>\>

#### Overrides

[`default`](../../BaseUserProvider/classes/default.md).[`getAllSessions`](../../BaseUserProvider/classes/default.md#getallsessions)

***

### getAllUsernames()

> **getAllUsernames**(): `Promise`\<`string`[]\>

Defined in: [src/providers/FileUserProvider.ts:196](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/providers/FileUserProvider.ts#L196)

Get all usernames

#### Returns

`Promise`\<`string`[]\>

#### Overrides

[`default`](../../BaseUserProvider/classes/default.md).[`getAllUsernames`](../../BaseUserProvider/classes/default.md#getallusernames)

***

### getAllUsers()

> **getAllUsers**(): `Promise`\<`Map`\<`string`, [`User`](../../../types/User/interfaces/User.md)\>\>

Defined in: [src/providers/FileUserProvider.ts:203](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/providers/FileUserProvider.ts#L203)

Get all users

#### Returns

`Promise`\<`Map`\<`string`, [`User`](../../../types/User/interfaces/User.md)\>\>

#### Overrides

[`default`](../../BaseUserProvider/classes/default.md).[`getAllUsers`](../../BaseUserProvider/classes/default.md#getallusers)

***

### getProviderInfo()

> **getProviderInfo**(): `object`

Defined in: [src/providers/FileUserProvider.ts:390](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/providers/FileUserProvider.ts#L390)

Get provider information

#### Returns

`object`

##### description

> **description**: `string` = `'JSON file-based user and session storage'`

##### features

> **features**: `string`[]

##### name

> **name**: `string` = `'FileUserProvider'`

##### version

> **version**: `string` = `'1.0.0'`

#### Overrides

[`default`](../../BaseUserProvider/classes/default.md).[`getProviderInfo`](../../BaseUserProvider/classes/default.md#getproviderinfo)

***

### getSession()

> **getSession**(`sessionId`): `Promise`\<[`UserSession`](../../../types/User/interfaces/UserSession.md)\>

Defined in: [src/providers/FileUserProvider.ts:266](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/providers/FileUserProvider.ts#L266)

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

Defined in: [src/providers/FileUserProvider.ts:189](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/providers/FileUserProvider.ts#L189)

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

Defined in: [src/providers/FileUserProvider.ts:60](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/providers/FileUserProvider.ts#L60)

Initialize the provider

#### Returns

`Promise`\<`void`\>

#### Overrides

[`default`](../../BaseUserProvider/classes/default.md).[`initialize`](../../BaseUserProvider/classes/default.md#initialize)

***

### restore()

> **restore**(`backupData`): `Promise`\<`void`\>

Defined in: [src/providers/FileUserProvider.ts:350](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/providers/FileUserProvider.ts#L350)

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

> **shutdown**(): `Promise`\<`void`\>

Defined in: [src/providers/FileUserProvider.ts:402](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/providers/FileUserProvider.ts#L402)

Shutdown the provider

#### Returns

`Promise`\<`void`\>

#### Overrides

[`default`](../../BaseUserProvider/classes/default.md).[`shutdown`](../../BaseUserProvider/classes/default.md#shutdown)

***

### updateUser()

> **updateUser**(`username`, `userData`): `Promise`\<`void`\>

Defined in: [src/providers/FileUserProvider.ts:223](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/providers/FileUserProvider.ts#L223)

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

Defined in: [src/providers/FileUserProvider.ts:250](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/providers/FileUserProvider.ts#L250)

Check if user exists

#### Parameters

##### username

`string`

#### Returns

`Promise`\<`boolean`\>

#### Overrides

[`default`](../../BaseUserProvider/classes/default.md).[`userExists`](../../BaseUserProvider/classes/default.md#userexists)
