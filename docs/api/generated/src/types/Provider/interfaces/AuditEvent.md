[**amdWiki API v1.5.0**](../../../../README.md)

***

[amdWiki API](../../../../README.md) / [src/types/Provider](../README.md) / AuditEvent

# Interface: AuditEvent

Defined in: [src/types/Provider.ts:424](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/types/Provider.ts#L424)

Audit event

## Properties

### action

> **action**: `string`

Defined in: [src/types/Provider.ts:438](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/types/Provider.ts#L438)

Action performed

***

### actor

> **actor**: `string`

Defined in: [src/types/Provider.ts:432](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/types/Provider.ts#L432)

Actor (user ID or 'system')

***

### data?

> `optional` **data**: `Record`\<`string`, `any`\>

Defined in: [src/types/Provider.ts:450](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/types/Provider.ts#L450)

Additional event data

***

### error?

> `optional` **error**: `string`

Defined in: [src/types/Provider.ts:456](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/types/Provider.ts#L456)

Error message if failed

***

### id

> **id**: `string`

Defined in: [src/types/Provider.ts:426](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/types/Provider.ts#L426)

Event ID (UUID)

***

### ipAddress?

> `optional` **ipAddress**: `string`

Defined in: [src/types/Provider.ts:444](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/types/Provider.ts#L444)

IP address

***

### result

> **result**: `"success"` \| `"failure"`

Defined in: [src/types/Provider.ts:453](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/types/Provider.ts#L453)

Event result (success, failure)

***

### target

> **target**: `string`

Defined in: [src/types/Provider.ts:435](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/types/Provider.ts#L435)

Target resource

***

### timestamp

> **timestamp**: `string`

Defined in: [src/types/Provider.ts:441](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/types/Provider.ts#L441)

Event timestamp (ISO 8601)

***

### type

> **type**: `string`

Defined in: [src/types/Provider.ts:429](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/types/Provider.ts#L429)

Event type

***

### userAgent?

> `optional` **userAgent**: `string`

Defined in: [src/types/Provider.ts:447](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/types/Provider.ts#L447)

User agent
