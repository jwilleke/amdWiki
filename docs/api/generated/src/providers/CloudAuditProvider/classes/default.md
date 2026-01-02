[**amdWiki API v1.5.0**](../../../../README.md)

***

[amdWiki API](../../../../README.md) / [src/providers/CloudAuditProvider](../README.md) / default

# Class: default

Defined in: [src/providers/CloudAuditProvider.ts:36](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/providers/CloudAuditProvider.ts#L36)

CloudAuditProvider - Cloud logging service integration (FUTURE IMPLEMENTATION)

Stores audit logs in cloud logging services for enterprise cloud deployments.
Suitable for AWS CloudWatch, Azure Monitor, Google Cloud Logging.

Configuration keys (all lowercase):
- amdwiki.audit.provider.cloud.service - Cloud service (cloudwatch, azuremonitor, stackdriver)
- amdwiki.audit.provider.cloud.region - Cloud region
- amdwiki.audit.provider.cloud.loggroup - Log group/namespace
- amdwiki.audit.provider.cloud.logstream - Log stream name

TODO: Implement AWS CloudWatch Logs integration
TODO: Implement Azure Monitor Logs integration
TODO: Implement Google Cloud Logging integration
TODO: Add automatic credential detection (IAM roles, service principals)
TODO: Implement batching for cost optimization
TODO: Add retry logic with exponential backoff

## Extends

- [`default`](../../BaseAuditProvider/classes/default.md)

## Constructors

### Constructor

> **new default**(`engine`): `CloudAuditProvider`

Defined in: [src/providers/CloudAuditProvider.ts:41](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/providers/CloudAuditProvider.ts#L41)

#### Parameters

##### engine

[`WikiEngine`](../../../types/WikiEngine/interfaces/WikiEngine.md)

#### Returns

`CloudAuditProvider`

#### Overrides

[`default`](../../BaseAuditProvider/classes/default.md).[`constructor`](../../BaseAuditProvider/classes/default.md#constructor)

## Properties

### engine

> `protected` **engine**: [`WikiEngine`](../../../types/WikiEngine/interfaces/WikiEngine.md)

Defined in: [src/providers/BaseAuditProvider.ts:156](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/providers/BaseAuditProvider.ts#L156)

Reference to the wiki engine

#### Inherited from

[`default`](../../BaseAuditProvider/classes/default.md).[`engine`](../../BaseAuditProvider/classes/default.md#engine)

***

### initialized

> **initialized**: `boolean`

Defined in: [src/providers/BaseAuditProvider.ts:159](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/providers/BaseAuditProvider.ts#L159)

Whether provider has been initialized

#### Inherited from

[`default`](../../BaseAuditProvider/classes/default.md).[`initialized`](../../BaseAuditProvider/classes/default.md#initialized)

## Methods

### backup()

> **backup**(): `Promise`\<[`AuditBackupData`](../../BaseAuditProvider/interfaces/AuditBackupData.md)\>

Defined in: [src/providers/BaseAuditProvider.ts:307](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/providers/BaseAuditProvider.ts#L307)

Backup audit configuration and state (optional)

Default implementation provides basic backup data.
Subclasses can override to include provider-specific data.

#### Returns

`Promise`\<[`AuditBackupData`](../../BaseAuditProvider/interfaces/AuditBackupData.md)\>

Backup data

#### Async

#### Inherited from

[`default`](../../BaseAuditProvider/classes/default.md).[`backup`](../../BaseAuditProvider/classes/default.md#backup)

***

### cleanup()

> **cleanup**(): `Promise`\<`void`\>

Defined in: [src/providers/CloudAuditProvider.ts:174](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/providers/CloudAuditProvider.ts#L174)

Clean up old audit logs (cloud services often handle retention automatically)

#### Returns

`Promise`\<`void`\>

#### Overrides

[`default`](../../BaseAuditProvider/classes/default.md).[`cleanup`](../../BaseAuditProvider/classes/default.md#cleanup)

***

### close()

> **close**(): `Promise`\<`void`\>

Defined in: [src/providers/CloudAuditProvider.ts:194](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/providers/CloudAuditProvider.ts#L194)

Close/cleanup the audit provider

#### Returns

`Promise`\<`void`\>

#### Overrides

[`default`](../../BaseAuditProvider/classes/default.md).[`close`](../../BaseAuditProvider/classes/default.md#close)

***

### exportAuditLogs()

> **exportAuditLogs**(`_filters`, `_format`): `Promise`\<`string`\>

Defined in: [src/providers/CloudAuditProvider.ts:154](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/providers/CloudAuditProvider.ts#L154)

Export audit logs

#### Parameters

##### \_filters

[`AuditFilters`](../../BaseAuditProvider/interfaces/AuditFilters.md) = `{}`

Export filters

##### \_format

Export format ('json', 'csv')

`"json"` | `"csv"`

#### Returns

`Promise`\<`string`\>

Exported data

#### Overrides

[`default`](../../BaseAuditProvider/classes/default.md).[`exportAuditLogs`](../../BaseAuditProvider/classes/default.md#exportauditlogs)

***

### flush()

> **flush**(): `Promise`\<`void`\>

Defined in: [src/providers/CloudAuditProvider.ts:164](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/providers/CloudAuditProvider.ts#L164)

Flush pending audit events

#### Returns

`Promise`\<`void`\>

#### Overrides

[`default`](../../BaseAuditProvider/classes/default.md).[`flush`](../../BaseAuditProvider/classes/default.md#flush)

***

### getAuditStats()

> **getAuditStats**(`_filters`): `Promise`\<[`AuditStats`](../../BaseAuditProvider/interfaces/AuditStats.md)\>

Defined in: [src/providers/CloudAuditProvider.ts:143](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/providers/CloudAuditProvider.ts#L143)

Get audit statistics

#### Parameters

##### \_filters

[`AuditFilters`](../../BaseAuditProvider/interfaces/AuditFilters.md) = `{}`

Optional filters

#### Returns

`Promise`\<[`AuditStats`](../../BaseAuditProvider/interfaces/AuditStats.md)\>

Audit statistics

#### Overrides

[`default`](../../BaseAuditProvider/classes/default.md).[`getAuditStats`](../../BaseAuditProvider/classes/default.md#getauditstats)

***

### getProviderInfo()

> **getProviderInfo**(): `object`

Defined in: [src/providers/CloudAuditProvider.ts:91](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/providers/CloudAuditProvider.ts#L91)

Get provider information

#### Returns

`object`

Provider metadata

##### description

> **description**: `string`

##### features

> **features**: `string`[]

##### name

> **name**: `string`

##### version

> **version**: `string`

#### Overrides

[`default`](../../BaseAuditProvider/classes/default.md).[`getProviderInfo`](../../BaseAuditProvider/classes/default.md#getproviderinfo)

***

### initialize()

> **initialize**(): `Promise`\<`void`\>

Defined in: [src/providers/CloudAuditProvider.ts:51](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/providers/CloudAuditProvider.ts#L51)

Initialize the cloud audit provider

#### Returns

`Promise`\<`void`\>

#### Overrides

[`default`](../../BaseAuditProvider/classes/default.md).[`initialize`](../../BaseAuditProvider/classes/default.md#initialize)

***

### isHealthy()

> **isHealthy**(): `Promise`\<`boolean`\>

Defined in: [src/providers/CloudAuditProvider.ts:184](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/providers/CloudAuditProvider.ts#L184)

Check if the audit provider is healthy

#### Returns

`Promise`\<`boolean`\>

True if healthy

#### Overrides

[`default`](../../BaseAuditProvider/classes/default.md).[`isHealthy`](../../BaseAuditProvider/classes/default.md#ishealthy)

***

### logAuditEvent()

> **logAuditEvent**(`_auditEvent`): `Promise`\<`string`\>

Defined in: [src/providers/CloudAuditProvider.ts:105](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/providers/CloudAuditProvider.ts#L105)

Log an audit event

#### Parameters

##### \_auditEvent

[`AuditEvent`](../../../types/Provider/interfaces/AuditEvent.md)

Audit event data

#### Returns

`Promise`\<`string`\>

Event ID

#### Overrides

[`default`](../../BaseAuditProvider/classes/default.md).[`logAuditEvent`](../../BaseAuditProvider/classes/default.md#logauditevent)

***

### restore()

> **restore**(`_backupData`): `Promise`\<`void`\>

Defined in: [src/providers/BaseAuditProvider.ts:325](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/providers/BaseAuditProvider.ts#L325)

Restore audit from backup (optional)

Default implementation does nothing.
Subclasses can override if they support restore functionality.

#### Parameters

##### \_backupData

[`AuditBackupData`](../../BaseAuditProvider/interfaces/AuditBackupData.md)

Backup data

#### Returns

`Promise`\<`void`\>

#### Async

#### Inherited from

[`default`](../../BaseAuditProvider/classes/default.md).[`restore`](../../BaseAuditProvider/classes/default.md#restore)

***

### searchAuditLogs()

> **searchAuditLogs**(`_filters`, `_options`): `Promise`\<[`AuditSearchResults`](../../BaseAuditProvider/interfaces/AuditSearchResults.md)\>

Defined in: [src/providers/CloudAuditProvider.ts:125](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/providers/CloudAuditProvider.ts#L125)

Search audit logs

#### Parameters

##### \_filters

[`AuditFilters`](../../BaseAuditProvider/interfaces/AuditFilters.md) = `{}`

Search filters

##### \_options

`Record`\<`string`, `any`\> = `{}`

Search options

#### Returns

`Promise`\<[`AuditSearchResults`](../../BaseAuditProvider/interfaces/AuditSearchResults.md)\>

Search results

#### Overrides

[`default`](../../BaseAuditProvider/classes/default.md).[`searchAuditLogs`](../../BaseAuditProvider/classes/default.md#searchauditlogs)
