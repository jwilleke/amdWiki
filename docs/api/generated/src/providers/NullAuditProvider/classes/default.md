[**amdWiki API v1.5.0**](../../../../README.md)

***

[amdWiki API](../../../../README.md) / [src/providers/NullAuditProvider](../README.md) / default

# Class: default

Defined in: [src/providers/NullAuditProvider.ts:10](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/providers/NullAuditProvider.ts#L10)

NullAuditProvider - No-op audit provider

Used when auditing is disabled or for testing.
All audit operations are no-ops that return immediately.

## Extends

- [`default`](../../BaseAuditProvider/classes/default.md)

## Constructors

### Constructor

> **new default**(`engine`): `NullAuditProvider`

Defined in: [src/providers/NullAuditProvider.ts:11](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/providers/NullAuditProvider.ts#L11)

#### Parameters

##### engine

[`WikiEngine`](../../BaseAuditProvider/interfaces/WikiEngine.md)

#### Returns

`NullAuditProvider`

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

Defined in: [src/providers/NullAuditProvider.ts:103](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/providers/NullAuditProvider.ts#L103)

Clean up old audit logs (no-op)

#### Returns

`Promise`\<`void`\>

#### Overrides

[`default`](../../BaseAuditProvider/classes/default.md).[`cleanup`](../../BaseAuditProvider/classes/default.md#cleanup)

***

### close()

> **close**(): `Promise`\<`void`\>

Defined in: [src/providers/NullAuditProvider.ts:119](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/providers/NullAuditProvider.ts#L119)

Close/cleanup the audit provider (no-op)

#### Returns

`Promise`\<`void`\>

#### Overrides

[`default`](../../BaseAuditProvider/classes/default.md).[`close`](../../BaseAuditProvider/classes/default.md#close)

***

### exportAuditLogs()

> **exportAuditLogs**(`filters`, `format`): `Promise`\<`string`\>

Defined in: [src/providers/NullAuditProvider.ts:84](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/providers/NullAuditProvider.ts#L84)

Export audit logs (returns empty data)

#### Parameters

##### filters

[`AuditFilters`](../../BaseAuditProvider/interfaces/AuditFilters.md) = `{}`

Export filters

##### format

Export format ('json', 'csv')

`"json"` | `"csv"`

#### Returns

`Promise`\<`string`\>

Empty export data

#### Overrides

[`default`](../../BaseAuditProvider/classes/default.md).[`exportAuditLogs`](../../BaseAuditProvider/classes/default.md#exportauditlogs)

***

### flush()

> **flush**(): `Promise`\<`void`\>

Defined in: [src/providers/NullAuditProvider.ts:95](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/providers/NullAuditProvider.ts#L95)

Flush pending audit events (no-op)

#### Returns

`Promise`\<`void`\>

#### Overrides

[`default`](../../BaseAuditProvider/classes/default.md).[`flush`](../../BaseAuditProvider/classes/default.md#flush)

***

### getAuditStats()

> **getAuditStats**(`filters`): `Promise`\<[`AuditStats`](../../BaseAuditProvider/interfaces/AuditStats.md)\>

Defined in: [src/providers/NullAuditProvider.ts:66](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/providers/NullAuditProvider.ts#L66)

Get audit statistics (returns zeros)

#### Parameters

##### filters

[`AuditFilters`](../../BaseAuditProvider/interfaces/AuditFilters.md) = `{}`

Optional filters

#### Returns

`Promise`\<[`AuditStats`](../../BaseAuditProvider/interfaces/AuditStats.md)\>

Empty statistics

#### Overrides

[`default`](../../BaseAuditProvider/classes/default.md).[`getAuditStats`](../../BaseAuditProvider/classes/default.md#getauditstats)

***

### getProviderInfo()

> **getProviderInfo**(): `object`

Defined in: [src/providers/NullAuditProvider.ts:27](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/providers/NullAuditProvider.ts#L27)

Get provider information

#### Returns

`object`

Provider metadata

##### description

> **description**: `string` = `'No-op audit provider (auditing disabled)'`

##### features

> **features**: `any`[] = `[]`

##### name

> **name**: `string` = `'NullAuditProvider'`

##### version

> **version**: `string` = `'1.0.0'`

#### Overrides

[`default`](../../BaseAuditProvider/classes/default.md).[`getProviderInfo`](../../BaseAuditProvider/classes/default.md#getproviderinfo)

***

### initialize()

> **initialize**(): `Promise`\<`void`\>

Defined in: [src/providers/NullAuditProvider.ts:19](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/providers/NullAuditProvider.ts#L19)

Initialize the null audit provider (no-op)

#### Returns

`Promise`\<`void`\>

#### Overrides

[`default`](../../BaseAuditProvider/classes/default.md).[`initialize`](../../BaseAuditProvider/classes/default.md#initialize)

***

### isHealthy()

> **isHealthy**(): `Promise`\<`boolean`\>

Defined in: [src/providers/NullAuditProvider.ts:111](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/providers/NullAuditProvider.ts#L111)

Check if the audit provider is healthy (always true)

#### Returns

`Promise`\<`boolean`\>

Always true

#### Overrides

[`default`](../../BaseAuditProvider/classes/default.md).[`isHealthy`](../../BaseAuditProvider/classes/default.md#ishealthy)

***

### logAuditEvent()

> **logAuditEvent**(`auditEvent`): `Promise`\<`string`\>

Defined in: [src/providers/NullAuditProvider.ts:41](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/providers/NullAuditProvider.ts#L41)

Log an audit event (no-op)

#### Parameters

##### auditEvent

[`AuditEvent`](../../../types/Provider/interfaces/AuditEvent.md)

Audit event data

#### Returns

`Promise`\<`string`\>

Dummy event ID

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

Defined in: [src/providers/NullAuditProvider.ts:51](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/providers/NullAuditProvider.ts#L51)

Search audit logs (returns empty results)

#### Parameters

##### filters

[`AuditFilters`](../../BaseAuditProvider/interfaces/AuditFilters.md) = `{}`

Search filters

##### options

`Record`\<`string`, `any`\> = `{}`

Search options

#### Returns

`Promise`\<[`AuditSearchResults`](../../BaseAuditProvider/interfaces/AuditSearchResults.md)\>

Empty search results

#### Overrides

[`default`](../../BaseAuditProvider/classes/default.md).[`searchAuditLogs`](../../BaseAuditProvider/classes/default.md#searchauditlogs)
