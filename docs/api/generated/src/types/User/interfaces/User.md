[**amdWiki API v1.5.0**](../../../../README.md)

***

[amdWiki API](../../../../README.md) / [src/types/User](../README.md) / User

# Interface: User

Defined in: [src/types/User.ts:53](https://github.com/jwilleke/amdWiki/blob/b6a859c7c9297966de89735ea5e8f953df289ac1/src/types/User.ts#L53)

User object

Complete user record stored in the user provider.

## Properties

### avatar?

> `optional` **avatar**: `string`

Defined in: [src/types/User.ts:91](https://github.com/jwilleke/amdWiki/blob/b6a859c7c9297966de89735ea5e8f953df289ac1/src/types/User.ts#L91)

Profile picture URL or data

***

### createdAt

> **createdAt**: `string`

Defined in: [src/types/User.ts:79](https://github.com/jwilleke/amdWiki/blob/b6a859c7c9297966de89735ea5e8f953df289ac1/src/types/User.ts#L79)

Account creation timestamp (ISO 8601)

***

### displayName

> **displayName**: `string`

Defined in: [src/types/User.ts:61](https://github.com/jwilleke/amdWiki/blob/b6a859c7c9297966de89735ea5e8f953df289ac1/src/types/User.ts#L61)

Display name (full name)

***

### email

> **email**: `string`

Defined in: [src/types/User.ts:58](https://github.com/jwilleke/amdWiki/blob/b6a859c7c9297966de89735ea5e8f953df289ac1/src/types/User.ts#L58)

Email address

***

### isActive

> **isActive**: `boolean`

Defined in: [src/types/User.ts:70](https://github.com/jwilleke/amdWiki/blob/b6a859c7c9297966de89735ea5e8f953df289ac1/src/types/User.ts#L70)

Whether user account is active

***

### isExternal

> **isExternal**: `boolean`

Defined in: [src/types/User.ts:76](https://github.com/jwilleke/amdWiki/blob/b6a859c7c9297966de89735ea5e8f953df289ac1/src/types/User.ts#L76)

Whether user is external (LDAP, OAuth)

***

### isSystem

> **isSystem**: `boolean`

Defined in: [src/types/User.ts:73](https://github.com/jwilleke/amdWiki/blob/b6a859c7c9297966de89735ea5e8f953df289ac1/src/types/User.ts#L73)

Whether user is system user

***

### lastLogin?

> `optional` **lastLogin**: `string`

Defined in: [src/types/User.ts:82](https://github.com/jwilleke/amdWiki/blob/b6a859c7c9297966de89735ea5e8f953df289ac1/src/types/User.ts#L82)

Last login timestamp (ISO 8601)

***

### loginCount

> **loginCount**: `number`

Defined in: [src/types/User.ts:85](https://github.com/jwilleke/amdWiki/blob/b6a859c7c9297966de89735ea5e8f953df289ac1/src/types/User.ts#L85)

Total login count

***

### metadata?

> `optional` **metadata**: `Record`\<`string`, `unknown`\>

Defined in: [src/types/User.ts:94](https://github.com/jwilleke/amdWiki/blob/b6a859c7c9297966de89735ea5e8f953df289ac1/src/types/User.ts#L94)

Additional metadata

***

### password

> **password**: `string`

Defined in: [src/types/User.ts:64](https://github.com/jwilleke/amdWiki/blob/b6a859c7c9297966de89735ea5e8f953df289ac1/src/types/User.ts#L64)

Hashed password (SHA-256 or bcrypt)

***

### preferences

> **preferences**: [`UserPreferences`](UserPreferences.md)

Defined in: [src/types/User.ts:88](https://github.com/jwilleke/amdWiki/blob/b6a859c7c9297966de89735ea5e8f953df289ac1/src/types/User.ts#L88)

User preferences

***

### roles

> **roles**: `string`[]

Defined in: [src/types/User.ts:67](https://github.com/jwilleke/amdWiki/blob/b6a859c7c9297966de89735ea5e8f953df289ac1/src/types/User.ts#L67)

User roles (admin, editor, viewer, etc.)

***

### username

> **username**: `string`

Defined in: [src/types/User.ts:55](https://github.com/jwilleke/amdWiki/blob/b6a859c7c9297966de89735ea5e8f953df289ac1/src/types/User.ts#L55)

Username (unique identifier for login)
