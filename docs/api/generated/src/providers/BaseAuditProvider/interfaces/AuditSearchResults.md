[**amdWiki API v1.5.0**](../../../../README.md)

***

[amdWiki API](../../../../README.md) / [src/providers/BaseAuditProvider](../README.md) / AuditSearchResults

# Interface: AuditSearchResults

Defined in: [src/providers/BaseAuditProvider.ts:66](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/providers/BaseAuditProvider.ts#L66)

Audit search results

## Properties

### hasMore

> **hasMore**: `boolean`

Defined in: [src/providers/BaseAuditProvider.ts:80](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/providers/BaseAuditProvider.ts#L80)

Whether more results are available

***

### limit

> **limit**: `number`

Defined in: [src/providers/BaseAuditProvider.ts:74](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/providers/BaseAuditProvider.ts#L74)

Result limit

***

### offset

> **offset**: `number`

Defined in: [src/providers/BaseAuditProvider.ts:77](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/providers/BaseAuditProvider.ts#L77)

Result offset

***

### results

> **results**: [`AuditEvent`](../../../types/Provider/interfaces/AuditEvent.md)[]

Defined in: [src/providers/BaseAuditProvider.ts:68](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/providers/BaseAuditProvider.ts#L68)

Array of audit events

***

### total

> **total**: `number`

Defined in: [src/providers/BaseAuditProvider.ts:71](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/providers/BaseAuditProvider.ts#L71)

Total matching events
