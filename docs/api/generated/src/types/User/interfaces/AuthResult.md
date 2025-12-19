[**amdWiki API v1.5.0**](../../../../README.md)

***

[amdWiki API](../../../../README.md) / [src/types/User](../README.md) / AuthResult

# Interface: AuthResult

Defined in: [src/types/User.ts:195](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/types/User.ts#L195)

User authentication result

Result of authentication attempt.

## Properties

### error?

> `optional` **error**: `string`

Defined in: [src/types/User.ts:206](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/types/User.ts#L206)

Error message if failed

***

### errorCode?

> `optional` **errorCode**: `string`

Defined in: [src/types/User.ts:209](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/types/User.ts#L209)

Error code (invalid_credentials, account_disabled, etc.)

***

### sessionId?

> `optional` **sessionId**: `string`

Defined in: [src/types/User.ts:203](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/types/User.ts#L203)

Session ID if successful

***

### success

> **success**: `boolean`

Defined in: [src/types/User.ts:197](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/types/User.ts#L197)

Whether authentication succeeded

***

### user?

> `optional` **user**: [`User`](User.md)

Defined in: [src/types/User.ts:200](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/types/User.ts#L200)

User object if successful
