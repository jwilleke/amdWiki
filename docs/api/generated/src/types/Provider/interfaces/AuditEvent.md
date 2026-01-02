[**amdWiki API v1.5.0**](../../../../README.md)

***

[amdWiki API](../../../../README.md) / [src/types/Provider](../README.md) / AuditEvent

# Interface: AuditEvent

Defined in: [src/types/Provider.ts:451](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/types/Provider.ts#L451)

Audit event

## Properties

### action

> **action**: `string`

Defined in: [src/types/Provider.ts:465](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/types/Provider.ts#L465)

Action performed

***

### actor

> **actor**: `string`

Defined in: [src/types/Provider.ts:459](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/types/Provider.ts#L459)

Actor (user ID or 'system')

***

### data?

> `optional` **data**: `Record`\<`string`, `any`\>

Defined in: [src/types/Provider.ts:477](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/types/Provider.ts#L477)

Additional event data

***

### error?

> `optional` **error**: `string`

Defined in: [src/types/Provider.ts:483](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/types/Provider.ts#L483)

Error message if failed

***

### id

> **id**: `string`

Defined in: [src/types/Provider.ts:453](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/types/Provider.ts#L453)

Event ID (UUID)

***

### ipAddress?

> `optional` **ipAddress**: `string`

Defined in: [src/types/Provider.ts:471](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/types/Provider.ts#L471)

IP address

***

### result

> **result**: `"success"` \| `"failure"`

Defined in: [src/types/Provider.ts:480](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/types/Provider.ts#L480)

Event result (success, failure)

***

### target

> **target**: `string`

Defined in: [src/types/Provider.ts:462](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/types/Provider.ts#L462)

Target resource

***

### timestamp

> **timestamp**: `string`

Defined in: [src/types/Provider.ts:468](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/types/Provider.ts#L468)

Event timestamp (ISO 8601)

***

### type

> **type**: `string`

Defined in: [src/types/Provider.ts:456](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/types/Provider.ts#L456)

Event type

***

### userAgent?

> `optional` **userAgent**: `string`

Defined in: [src/types/Provider.ts:474](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/types/Provider.ts#L474)

User agent
