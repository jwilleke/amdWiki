[**amdWiki API v1.5.0**](../../../../README.md)

***

[amdWiki API](../../../../README.md) / [src/providers/CloudAuditProvider](../README.md) / default

# Class: default

Defined in: [src/providers/CloudAuditProvider.ts:34](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/providers/CloudAuditProvider.ts#L34)

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

Defined in: [src/providers/CloudAuditProvider.ts:38](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/providers/CloudAuditProvider.ts#L38)

#### Parameters

##### engine

[`WikiEngine`](../../BaseAuditProvider/interfaces/WikiEngine.md)

#### Returns

`CloudAuditProvider`

#### Overrides

[`default`](../../BaseAuditProvider/classes/default.md).[`constructor`](../../BaseAuditProvider/classes/default.md#constructor)

## Properties

### engine

> `protected` **engine**: [`WikiEngine`](../../BaseAuditProvider/interfaces/WikiEngine.md)

Defined in: [src/providers/BaseAuditProvider.ts:157](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/providers/BaseAuditProvider.ts#L157)

Reference to the wiki engine

#### Inherited from

[`default`](../../BaseAuditProvider/classes/default.md).[`engine`](../../BaseAuditProvider/classes/default.md#engine)

***

### initialized

> **initialized**: `boolean`

Defined in: [src/providers/BaseAuditProvider.ts:160](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/providers/BaseAuditProvider.ts#L160)

Whether provider has been initialized

#### Inherited from

[`default`](../../BaseAuditProvider/classes/default.md).[`initialized`](../../BaseAuditProvider/classes/default.md#initialized)

## Methods

### backup()

> **backup**(): `Promise`\<[`AuditBackupData`](../../BaseAuditProvider/interfaces/AuditBackupData.md)\>

Defined in: [src/providers/BaseAuditProvider.ts:308](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/providers/BaseAuditProvider.ts#L308)

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

Defined in: [src/providers/CloudAuditProvider.ts:170](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/providers/CloudAuditProvider.ts#L170)

Clean up old audit logs (cloud services often handle retention automatically)

#### Returns

`Promise`\<`void`\>

#### Overrides

[`default`](../../BaseAuditProvider/classes/default.md).[`cleanup`](../../BaseAuditProvider/classes/default.md#cleanup)

***

### close()

> **close**(): `Promise`\<`void`\>

Defined in: [src/providers/CloudAuditProvider.ts:197](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/providers/CloudAuditProvider.ts#L197)

Close/cleanup the audit provider

#### Returns

`Promise`\<`void`\>

#### Overrides

[`default`](../../BaseAuditProvider/classes/default.md).[`close`](../../BaseAuditProvider/classes/default.md#close)

***

### exportAuditLogs()

> **exportAuditLogs**(`filters`, `format`): `Promise`\<`string`\>

Defined in: [src/providers/CloudAuditProvider.ts:151](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/providers/CloudAuditProvider.ts#L151)

Export audit logs

#### Parameters

##### filters

[`AuditFilters`](../../BaseAuditProvider/interfaces/AuditFilters.md) = `{}`

Export filters

##### format

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

Defined in: [src/providers/CloudAuditProvider.ts:161](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/providers/CloudAuditProvider.ts#L161)

Flush pending audit events

#### Returns

`Promise`\<`void`\>

#### Overrides

[`default`](../../BaseAuditProvider/classes/default.md).[`flush`](../../BaseAuditProvider/classes/default.md#flush)

***

### getAuditStats()

> **getAuditStats**(`filters`): `Promise`\<[`AuditStats`](../../BaseAuditProvider/interfaces/AuditStats.md)\>

Defined in: [src/providers/CloudAuditProvider.ts:140](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/providers/CloudAuditProvider.ts#L140)

Get audit statistics

#### Parameters

##### filters

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

Defined in: [src/providers/CloudAuditProvider.ts:88](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/providers/CloudAuditProvider.ts#L88)

Get provider information

#### Returns

`object`

Provider metadata

##### description

> **description**: `string` = `'Cloud logging service integration (not yet implemented)'`

##### features

> **features**: `string`[]

##### name

> **name**: `string` = `'CloudAuditProvider'`

##### version

> **version**: `string` = `'0.1.0'`

#### Overrides

[`default`](../../BaseAuditProvider/classes/default.md).[`getProviderInfo`](../../BaseAuditProvider/classes/default.md#getproviderinfo)

***

### initialize()

> **initialize**(): `Promise`\<`void`\>

Defined in: [src/providers/CloudAuditProvider.ts:48](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/providers/CloudAuditProvider.ts#L48)

Initialize the cloud audit provider

#### Returns

`Promise`\<`void`\>

#### Overrides

[`default`](../../BaseAuditProvider/classes/default.md).[`initialize`](../../BaseAuditProvider/classes/default.md#initialize)

***

### isHealthy()

> **isHealthy**(): `Promise`\<`boolean`\>

Defined in: [src/providers/CloudAuditProvider.ts:179](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/providers/CloudAuditProvider.ts#L179)

Check if the audit provider is healthy

#### Returns

`Promise`\<`boolean`\>

True if healthy

#### Overrides

[`default`](../../BaseAuditProvider/classes/default.md).[`isHealthy`](../../BaseAuditProvider/classes/default.md#ishealthy)

***

### logAuditEvent()

> **logAuditEvent**(`auditEvent`): `Promise`\<`string`\>

Defined in: [src/providers/CloudAuditProvider.ts:102](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/providers/CloudAuditProvider.ts#L102)

Log an audit event

#### Parameters

##### auditEvent

[`AuditEvent`](../../../types/Provider/interfaces/AuditEvent.md)

Audit event data

#### Returns

`Promise`\<`string`\>

Event ID

#### Overrides

[`default`](../../BaseAuditProvider/classes/default.md).[`logAuditEvent`](../../BaseAuditProvider/classes/default.md#logauditevent)

***

### restore()

> **restore**(`backupData`): `Promise`\<`void`\>

Defined in: [src/providers/BaseAuditProvider.ts:326](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/providers/BaseAuditProvider.ts#L326)

Restore audit from backup (optional)

Default implementation does nothing.
Subclasses can override if they support restore functionality.

#### Parameters

##### backupData

[`AuditBackupData`](../../BaseAuditProvider/interfaces/AuditBackupData.md)

Backup data

#### Returns

`Promise`\<`void`\>

#### Async

#### Inherited from

[`default`](../../BaseAuditProvider/classes/default.md).[`restore`](../../BaseAuditProvider/classes/default.md#restore)

***

### searchAuditLogs()

> **searchAuditLogs**(`filters`, `options`): `Promise`\<[`AuditSearchResults`](../../BaseAuditProvider/interfaces/AuditSearchResults.md)\>

Defined in: [src/providers/CloudAuditProvider.ts:122](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/providers/CloudAuditProvider.ts#L122)

Search audit logs

#### Parameters

##### filters

[`AuditFilters`](../../BaseAuditProvider/interfaces/AuditFilters.md) = `{}`

Search filters

##### options

`Record`\<`string`, `any`\> = `{}`

Search options

#### Returns

`Promise`\<[`AuditSearchResults`](../../BaseAuditProvider/interfaces/AuditSearchResults.md)\>

Search results

#### Overrides

[`default`](../../BaseAuditProvider/classes/default.md).[`searchAuditLogs`](../../BaseAuditProvider/classes/default.md#searchauditlogs)
