[**amdWiki API v1.5.0**](../../../../README.md)

***

[amdWiki API](../../../../README.md) / [src/providers/BaseAuditProvider](../README.md) / AuditStats

# Interface: AuditStats

Defined in: [src/providers/BaseAuditProvider.ts:78](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/providers/BaseAuditProvider.ts#L78)

Audit statistics

## Indexable

\[`key`: `string`\]: `unknown`

Additional statistics

## Properties

### eventsByResult?

> `optional` **eventsByResult**: `Record`\<`string`, `number`\>

Defined in: [src/providers/BaseAuditProvider.ts:86](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/providers/BaseAuditProvider.ts#L86)

Events by result

***

### eventsBySeverity?

> `optional` **eventsBySeverity**: `Record`\<`string`, `number`\>

Defined in: [src/providers/BaseAuditProvider.ts:89](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/providers/BaseAuditProvider.ts#L89)

Events by severity

***

### eventsByType?

> `optional` **eventsByType**: `Record`\<`string`, `number`\>

Defined in: [src/providers/BaseAuditProvider.ts:83](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/providers/BaseAuditProvider.ts#L83)

Events by type

***

### eventsByUser?

> `optional` **eventsByUser**: `Record`\<`string`, `number`\>

Defined in: [src/providers/BaseAuditProvider.ts:92](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/providers/BaseAuditProvider.ts#L92)

Events by user

***

### recentActivity?

> `optional` **recentActivity**: `any`[]

Defined in: [src/providers/BaseAuditProvider.ts:96](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/providers/BaseAuditProvider.ts#L96)

Recent activity entries

***

### securityIncidents?

> `optional` **securityIncidents**: `number`

Defined in: [src/providers/BaseAuditProvider.ts:99](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/providers/BaseAuditProvider.ts#L99)

Number of security incidents (high/critical severity)

***

### totalEvents

> **totalEvents**: `number`

Defined in: [src/providers/BaseAuditProvider.ts:80](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/providers/BaseAuditProvider.ts#L80)

Total number of events
