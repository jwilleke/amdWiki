[**amdWiki API v1.5.0**](../../../../README.md)

***

[amdWiki API](../../../../README.md) / [src/types/User](../README.md) / UserUpdateData

# Interface: UserUpdateData

Defined in: [src/types/User.ts:130](https://github.com/jwilleke/amdWiki/blob/b6a859c7c9297966de89735ea5e8f953df289ac1/src/types/User.ts#L130)

User update data

Partial user data for updates (all fields optional).

## Properties

### avatar?

> `optional` **avatar**: `string`

Defined in: [src/types/User.ts:150](https://github.com/jwilleke/amdWiki/blob/b6a859c7c9297966de89735ea5e8f953df289ac1/src/types/User.ts#L150)

Avatar

***

### displayName?

> `optional` **displayName**: `string`

Defined in: [src/types/User.ts:135](https://github.com/jwilleke/amdWiki/blob/b6a859c7c9297966de89735ea5e8f953df289ac1/src/types/User.ts#L135)

Display name

***

### email?

> `optional` **email**: `string`

Defined in: [src/types/User.ts:132](https://github.com/jwilleke/amdWiki/blob/b6a859c7c9297966de89735ea5e8f953df289ac1/src/types/User.ts#L132)

Email address

***

### isActive?

> `optional` **isActive**: `boolean`

Defined in: [src/types/User.ts:144](https://github.com/jwilleke/amdWiki/blob/b6a859c7c9297966de89735ea5e8f953df289ac1/src/types/User.ts#L144)

Active status

***

### metadata?

> `optional` **metadata**: `Record`\<`string`, `unknown`\>

Defined in: [src/types/User.ts:153](https://github.com/jwilleke/amdWiki/blob/b6a859c7c9297966de89735ea5e8f953df289ac1/src/types/User.ts#L153)

Metadata

***

### password?

> `optional` **password**: `string`

Defined in: [src/types/User.ts:138](https://github.com/jwilleke/amdWiki/blob/b6a859c7c9297966de89735ea5e8f953df289ac1/src/types/User.ts#L138)

New plain text password (will be hashed)

***

### preferences?

> `optional` **preferences**: `Partial`\<[`UserPreferences`](UserPreferences.md)\>

Defined in: [src/types/User.ts:147](https://github.com/jwilleke/amdWiki/blob/b6a859c7c9297966de89735ea5e8f953df289ac1/src/types/User.ts#L147)

Updated preferences

***

### roles?

> `optional` **roles**: `string`[]

Defined in: [src/types/User.ts:141](https://github.com/jwilleke/amdWiki/blob/b6a859c7c9297966de89735ea5e8f953df289ac1/src/types/User.ts#L141)

Updated roles
