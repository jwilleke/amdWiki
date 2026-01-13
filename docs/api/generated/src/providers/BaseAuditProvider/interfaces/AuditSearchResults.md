[**amdWiki API v1.5.0**](../../../../README.md)

***

[amdWiki API](../../../../README.md) / [src/providers/BaseAuditProvider](../README.md) / AuditSearchResults

# Interface: AuditSearchResults

Defined in: [src/providers/BaseAuditProvider.ts:58](https://github.com/jwilleke/amdWiki/blob/b6a859c7c9297966de89735ea5e8f953df289ac1/src/providers/BaseAuditProvider.ts#L58)

Audit search results

## Properties

### hasMore

> **hasMore**: `boolean`

Defined in: [src/providers/BaseAuditProvider.ts:72](https://github.com/jwilleke/amdWiki/blob/b6a859c7c9297966de89735ea5e8f953df289ac1/src/providers/BaseAuditProvider.ts#L72)

Whether more results are available

***

### limit

> **limit**: `number`

Defined in: [src/providers/BaseAuditProvider.ts:66](https://github.com/jwilleke/amdWiki/blob/b6a859c7c9297966de89735ea5e8f953df289ac1/src/providers/BaseAuditProvider.ts#L66)

Result limit

***

### offset

> **offset**: `number`

Defined in: [src/providers/BaseAuditProvider.ts:69](https://github.com/jwilleke/amdWiki/blob/b6a859c7c9297966de89735ea5e8f953df289ac1/src/providers/BaseAuditProvider.ts#L69)

Result offset

***

### results

> **results**: [`AuditEvent`](../../../types/Provider/interfaces/AuditEvent.md)[]

Defined in: [src/providers/BaseAuditProvider.ts:60](https://github.com/jwilleke/amdWiki/blob/b6a859c7c9297966de89735ea5e8f953df289ac1/src/providers/BaseAuditProvider.ts#L60)

Array of audit events

***

### total

> **total**: `number`

Defined in: [src/providers/BaseAuditProvider.ts:63](https://github.com/jwilleke/amdWiki/blob/b6a859c7c9297966de89735ea5e8f953df289ac1/src/providers/BaseAuditProvider.ts#L63)

Total matching events
