[**amdWiki API v1.5.0**](../../../../README.md)

***

[amdWiki API](../../../../README.md) / [src/types/User](../README.md) / UserSession

# Interface: UserSession

Defined in: [src/types/User.ts:161](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/types/User.ts#L161)

User session data

Active session information stored by session manager.

## Properties

### createdAt

> **createdAt**: `string`

Defined in: [src/types/User.ts:172](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/types/User.ts#L172)

Session creation timestamp (ISO 8601)

***

### data?

> `optional` **data**: `Record`\<`string`, `any`\>

Defined in: [src/types/User.ts:187](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/types/User.ts#L187)

Additional session data

***

### expiresAt

> **expiresAt**: `string`

Defined in: [src/types/User.ts:175](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/types/User.ts#L175)

Session expiration timestamp (ISO 8601)

***

### ipAddress?

> `optional` **ipAddress**: `string`

Defined in: [src/types/User.ts:181](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/types/User.ts#L181)

Client IP address

***

### lastActivity

> **lastActivity**: `string`

Defined in: [src/types/User.ts:178](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/types/User.ts#L178)

Last activity timestamp (ISO 8601)

***

### sessionId

> **sessionId**: `string`

Defined in: [src/types/User.ts:163](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/types/User.ts#L163)

Session ID (unique)

***

### userAgent?

> `optional` **userAgent**: `string`

Defined in: [src/types/User.ts:184](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/types/User.ts#L184)

User agent string

***

### userId

> **userId**: `string`

Defined in: [src/types/User.ts:169](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/types/User.ts#L169)

User ID (username or external ID)

***

### username

> **username**: `string`

Defined in: [src/types/User.ts:166](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/types/User.ts#L166)

Username
