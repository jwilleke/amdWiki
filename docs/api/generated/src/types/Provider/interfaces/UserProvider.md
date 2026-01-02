[**amdWiki API v1.5.0**](../../../../README.md)

***

[amdWiki API](../../../../README.md) / [src/types/Provider](../README.md) / UserProvider

# Interface: UserProvider

Defined in: [src/types/Provider.ts:176](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/types/Provider.ts#L176)

User provider interface

Defines the contract for user storage backends.

## Extends

- [`BaseProvider`](BaseProvider.md)

## Properties

### engine

> **engine**: [`WikiEngine`](../../WikiEngine/interfaces/WikiEngine.md)

Defined in: [src/types/Provider.ts:21](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/types/Provider.ts#L21)

Reference to WikiEngine

#### Inherited from

[`BaseProvider`](BaseProvider.md).[`engine`](BaseProvider.md#engine)

***

### initialized

> **initialized**: `boolean`

Defined in: [src/types/Provider.ts:24](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/types/Provider.ts#L24)

Whether provider has been initialized

#### Inherited from

[`BaseProvider`](BaseProvider.md).[`initialized`](BaseProvider.md#initialized)

## Methods

### cleanupExpiredSessions()

> **cleanupExpiredSessions**(): `Promise`\<`number`\>

Defined in: [src/types/Provider.ts:253](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/types/Provider.ts#L253)

Clean up expired sessions

#### Returns

`Promise`\<`number`\>

Number of sessions deleted

***

### createSession()

> **createSession**(`sessionId`, `sessionData`): `Promise`\<`void`\>

Defined in: [src/types/Provider.ts:233](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/types/Provider.ts#L233)

Create session

#### Parameters

##### sessionId

`string`

Session ID

##### sessionData

[`UserSession`](../../User/interfaces/UserSession.md)

Session data object

#### Returns

`Promise`\<`void`\>

Promise that resolves when session is created

***

### createUser()

> **createUser**(`userData`): `Promise`\<[`User`](../../User/interfaces/User.md)\>

Defined in: [src/types/Provider.ts:202](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/types/Provider.ts#L202)

Create new user

#### Parameters

##### userData

[`UserCreateData`](../../User/interfaces/UserCreateData.md)

User creation data

#### Returns

`Promise`\<[`User`](../../User/interfaces/User.md)\>

Created user object

***

### deleteSession()

> **deleteSession**(`sessionId`): `Promise`\<`boolean`\>

Defined in: [src/types/Provider.ts:247](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/types/Provider.ts#L247)

Delete session

#### Parameters

##### sessionId

`string`

Session ID

#### Returns

`Promise`\<`boolean`\>

True if deleted, false if not found

***

### deleteUser()

> **deleteUser**(`username`): `Promise`\<`boolean`\>

Defined in: [src/types/Provider.ts:217](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/types/Provider.ts#L217)

Delete user

#### Parameters

##### username

`string`

Username

#### Returns

`Promise`\<`boolean`\>

True if deleted, false if not found

***

### getAllSessions()

> **getAllSessions**(): `Promise`\<`Map`\<`string`, [`UserSession`](../../User/interfaces/UserSession.md)\>\>

Defined in: [src/types/Provider.ts:272](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/types/Provider.ts#L272)

Get all active sessions

#### Returns

`Promise`\<`Map`\<`string`, [`UserSession`](../../User/interfaces/UserSession.md)\>\>

Map of session ID to session data

***

### getAllUsernames()

> **getAllUsernames**(): `Promise`\<`string`[]\>

Defined in: [src/types/Provider.ts:266](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/types/Provider.ts#L266)

Get all usernames

#### Returns

`Promise`\<`string`[]\>

Array of usernames

***

### getAllUsers()

> **getAllUsers**(): `Promise`\<`Map`\<`string`, [`User`](../../User/interfaces/User.md)\>\>

Defined in: [src/types/Provider.ts:195](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/types/Provider.ts#L195)

Get all users

#### Returns

`Promise`\<`Map`\<`string`, [`User`](../../User/interfaces/User.md)\>\>

Map of username to user objects

***

### getSession()

> **getSession**(`sessionId`): `Promise`\<[`UserSession`](../../User/interfaces/UserSession.md)\>

Defined in: [src/types/Provider.ts:240](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/types/Provider.ts#L240)

Get session

#### Parameters

##### sessionId

`string`

Session ID

#### Returns

`Promise`\<[`UserSession`](../../User/interfaces/UserSession.md)\>

Session object or null if not found/expired

***

### getUser()

> **getUser**(`username`): `Promise`\<[`User`](../../User/interfaces/User.md)\>

Defined in: [src/types/Provider.ts:182](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/types/Provider.ts#L182)

Get user by username

#### Parameters

##### username

`string`

Username

#### Returns

`Promise`\<[`User`](../../User/interfaces/User.md)\>

User object or null if not found

***

### getUserByEmail()

> **getUserByEmail**(`email`): `Promise`\<[`User`](../../User/interfaces/User.md)\>

Defined in: [src/types/Provider.ts:189](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/types/Provider.ts#L189)

Get user by email

#### Parameters

##### email

`string`

Email address

#### Returns

`Promise`\<[`User`](../../User/interfaces/User.md)\>

User object or null if not found

***

### initialize()

> **initialize**(): `Promise`\<`void`\>

Defined in: [src/types/Provider.ts:30](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/types/Provider.ts#L30)

Initialize the provider

#### Returns

`Promise`\<`void`\>

Promise that resolves when initialization is complete

#### Inherited from

[`BaseProvider`](BaseProvider.md).[`initialize`](BaseProvider.md#initialize)

***

### shutdown()?

> `optional` **shutdown**(): `Promise`\<`void`\>

Defined in: [src/types/Provider.ts:36](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/types/Provider.ts#L36)

Shutdown the provider (optional)

#### Returns

`Promise`\<`void`\>

Promise that resolves when shutdown is complete

#### Inherited from

[`BaseProvider`](BaseProvider.md).[`shutdown`](BaseProvider.md#shutdown)

***

### updateUser()

> **updateUser**(`username`, `updates`): `Promise`\<[`User`](../../User/interfaces/User.md)\>

Defined in: [src/types/Provider.ts:210](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/types/Provider.ts#L210)

Update user

#### Parameters

##### username

`string`

Username

##### updates

[`UserUpdateData`](../../User/interfaces/UserUpdateData.md)

Partial user data to update

#### Returns

`Promise`\<[`User`](../../User/interfaces/User.md)\>

Updated user object

***

### userExists()

> **userExists**(`username`): `Promise`\<`boolean`\>

Defined in: [src/types/Provider.ts:260](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/types/Provider.ts#L260)

Check if user exists

#### Parameters

##### username

`string`

Username to check

#### Returns

`Promise`\<`boolean`\>

True if user exists

***

### validateCredentials()

> **validateCredentials**(`username`, `password`): `Promise`\<[`User`](../../User/interfaces/User.md)\>

Defined in: [src/types/Provider.ts:225](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/types/Provider.ts#L225)

Validate user credentials

#### Parameters

##### username

`string`

Username

##### password

`string`

Plain text password

#### Returns

`Promise`\<[`User`](../../User/interfaces/User.md)\>

User object if valid, null if invalid
