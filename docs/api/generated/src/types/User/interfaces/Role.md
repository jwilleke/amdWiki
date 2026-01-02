[**amdWiki API v1.5.0**](../../../../README.md)

***

[amdWiki API](../../../../README.md) / [src/types/User](../README.md) / Role

# Interface: Role

Defined in: [src/types/User.ts:217](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/types/User.ts#L217)

User role definition

Defines a role and its permissions.

## Properties

### description?

> `optional` **description**: `string`

Defined in: [src/types/User.ts:225](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/types/User.ts#L225)

Role description

***

### displayName

> **displayName**: `string`

Defined in: [src/types/User.ts:222](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/types/User.ts#L222)

Display name

***

### inherits?

> `optional` **inherits**: `string`[]

Defined in: [src/types/User.ts:234](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/types/User.ts#L234)

Parent roles (inheritance)

***

### isSystem

> **isSystem**: `boolean`

Defined in: [src/types/User.ts:231](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/types/User.ts#L231)

Whether this is a system role (cannot be deleted)

***

### name

> **name**: `string`

Defined in: [src/types/User.ts:219](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/types/User.ts#L219)

Role name (unique identifier)

***

### permissions

> **permissions**: `string`[]

Defined in: [src/types/User.ts:228](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/types/User.ts#L228)

Permissions granted by this role
