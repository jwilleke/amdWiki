[**amdWiki API v1.5.0**](../../../../README.md)

***

[amdWiki API](../../../../README.md) / [src/types/Provider](../README.md) / UserProvider

# Interface: UserProvider

Defined in: [src/types/Provider.ts:168](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/types/Provider.ts#L168)

User provider interface

Defines the contract for user storage backends.

## Extends

- [`BaseProvider`](BaseProvider.md)

## Properties

### engine

> **engine**: `any`

Defined in: [src/types/Provider.ts:19](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/types/Provider.ts#L19)

Reference to WikiEngine

#### Inherited from

[`BaseProvider`](BaseProvider.md).[`engine`](BaseProvider.md#engine)

***

### initialized

> **initialized**: `boolean`

Defined in: [src/types/Provider.ts:22](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/types/Provider.ts#L22)

Whether provider has been initialized

#### Inherited from

[`BaseProvider`](BaseProvider.md).[`initialized`](BaseProvider.md#initialized)

## Methods

### cleanupExpiredSessions()

> **cleanupExpiredSessions**(): `Promise`\<`number`\>

Defined in: [src/types/Provider.ts:245](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/types/Provider.ts#L245)

Clean up expired sessions

#### Returns

`Promise`\<`number`\>

Number of sessions deleted

***

### createSession()

> **createSession**(`username`, `expiresIn`): `Promise`\<[`UserSession`](../../User/interfaces/UserSession.md)\>

Defined in: [src/types/Provider.ts:225](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/types/Provider.ts#L225)

Create session

#### Parameters

##### username

`string`

Username

##### expiresIn

`number`

Session duration in milliseconds

#### Returns

`Promise`\<[`UserSession`](../../User/interfaces/UserSession.md)\>

Session object

***

### createUser()

> **createUser**(`userData`): `Promise`\<[`User`](../../User/interfaces/User.md)\>

Defined in: [src/types/Provider.ts:194](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/types/Provider.ts#L194)

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

Defined in: [src/types/Provider.ts:239](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/types/Provider.ts#L239)

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

Defined in: [src/types/Provider.ts:209](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/types/Provider.ts#L209)

Delete user

#### Parameters

##### username

`string`

Username

#### Returns

`Promise`\<`boolean`\>

True if deleted, false if not found

***

### getAllUsers()

> **getAllUsers**(): `Promise`\<[`User`](../../User/interfaces/User.md)[]\>

Defined in: [src/types/Provider.ts:187](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/types/Provider.ts#L187)

Get all users

#### Returns

`Promise`\<[`User`](../../User/interfaces/User.md)[]\>

Array of user objects

***

### getSession()

> **getSession**(`sessionId`): `Promise`\<[`UserSession`](../../User/interfaces/UserSession.md)\>

Defined in: [src/types/Provider.ts:232](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/types/Provider.ts#L232)

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

Defined in: [src/types/Provider.ts:174](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/types/Provider.ts#L174)

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

Defined in: [src/types/Provider.ts:181](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/types/Provider.ts#L181)

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

Defined in: [src/types/Provider.ts:28](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/types/Provider.ts#L28)

Initialize the provider

#### Returns

`Promise`\<`void`\>

Promise that resolves when initialization is complete

#### Inherited from

[`BaseProvider`](BaseProvider.md).[`initialize`](BaseProvider.md#initialize)

***

### updateUser()

> **updateUser**(`username`, `updates`): `Promise`\<[`User`](../../User/interfaces/User.md)\>

Defined in: [src/types/Provider.ts:202](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/types/Provider.ts#L202)

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

### validateCredentials()

> **validateCredentials**(`username`, `password`): `Promise`\<[`User`](../../User/interfaces/User.md)\>

Defined in: [src/types/Provider.ts:217](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/types/Provider.ts#L217)

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
