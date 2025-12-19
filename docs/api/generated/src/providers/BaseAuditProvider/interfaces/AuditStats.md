[**amdWiki API v1.5.0**](../../../../README.md)

***

[amdWiki API](../../../../README.md) / [src/providers/BaseAuditProvider](../README.md) / AuditStats

# Interface: AuditStats

Defined in: [src/providers/BaseAuditProvider.ts:86](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/providers/BaseAuditProvider.ts#L86)

Audit statistics

## Indexable

\[`key`: `string`\]: `any`

Additional statistics

## Properties

### eventsByResult?

> `optional` **eventsByResult**: `Record`\<`string`, `number`\>

Defined in: [src/providers/BaseAuditProvider.ts:94](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/providers/BaseAuditProvider.ts#L94)

Events by result

***

### eventsBySeverity?

> `optional` **eventsBySeverity**: `Record`\<`string`, `number`\>

Defined in: [src/providers/BaseAuditProvider.ts:97](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/providers/BaseAuditProvider.ts#L97)

Events by severity

***

### eventsByType?

> `optional` **eventsByType**: `Record`\<`string`, `number`\>

Defined in: [src/providers/BaseAuditProvider.ts:91](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/providers/BaseAuditProvider.ts#L91)

Events by type

***

### eventsByUser?

> `optional` **eventsByUser**: `Record`\<`string`, `number`\>

Defined in: [src/providers/BaseAuditProvider.ts:100](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/providers/BaseAuditProvider.ts#L100)

Events by user

***

### totalEvents

> **totalEvents**: `number`

Defined in: [src/providers/BaseAuditProvider.ts:88](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/providers/BaseAuditProvider.ts#L88)

Total number of events
