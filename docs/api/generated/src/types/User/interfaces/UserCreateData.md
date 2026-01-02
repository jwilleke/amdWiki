[**amdWiki API v1.5.0**](../../../../README.md)

***

[amdWiki API](../../../../README.md) / [src/types/User](../README.md) / UserCreateData

# Interface: UserCreateData

Defined in: [src/types/User.ts:102](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/types/User.ts#L102)

User creation data

Data required to create a new user (no password hash yet).

## Properties

### displayName

> **displayName**: `string`

Defined in: [src/types/User.ts:110](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/types/User.ts#L110)

Display name

***

### email

> **email**: `string`

Defined in: [src/types/User.ts:107](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/types/User.ts#L107)

Email address

***

### isActive?

> `optional` **isActive**: `boolean`

Defined in: [src/types/User.ts:119](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/types/User.ts#L119)

Whether account starts active

***

### password

> **password**: `string`

Defined in: [src/types/User.ts:113](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/types/User.ts#L113)

Plain text password (will be hashed)

***

### preferences?

> `optional` **preferences**: `Partial`\<[`UserPreferences`](UserPreferences.md)\>

Defined in: [src/types/User.ts:122](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/types/User.ts#L122)

User preferences

***

### roles?

> `optional` **roles**: `string`[]

Defined in: [src/types/User.ts:116](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/types/User.ts#L116)

Initial roles

***

### username

> **username**: `string`

Defined in: [src/types/User.ts:104](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/types/User.ts#L104)

Username (unique)
