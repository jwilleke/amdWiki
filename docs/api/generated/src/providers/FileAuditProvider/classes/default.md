[**amdWiki API v1.5.0**](../../../../README.md)

***

[amdWiki API](../../../../README.md) / [src/providers/FileAuditProvider](../README.md) / default

# Class: default

Defined in: [src/providers/FileAuditProvider.ts:62](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/providers/FileAuditProvider.ts#L62)

FileAuditProvider - File-based audit log storage

Stores audit logs in local filesystem files with JSON line format.
Suitable for single-instance deployments and development.

Configuration keys (all lowercase):
- amdwiki.audit.provider.file.logdirectory - Directory for audit log files
- amdwiki.audit.provider.file.auditfilename - Main audit log filename
- amdwiki.audit.provider.file.archivefilename - Archive log filename
- amdwiki.audit.provider.file.maxfilesize - Maximum file size
- amdwiki.audit.provider.file.maxfiles - Maximum number of archived files

## Extends

- [`default`](../../BaseAuditProvider/classes/default.md)

## Constructors

### Constructor

> **new default**(`engine`): `FileAuditProvider`

Defined in: [src/providers/FileAuditProvider.ts:69](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/providers/FileAuditProvider.ts#L69)

#### Parameters

##### engine

[`WikiEngine`](../../BaseAuditProvider/interfaces/WikiEngine.md)

#### Returns

`FileAuditProvider`

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

Defined in: [src/providers/FileAuditProvider.ts:504](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/providers/FileAuditProvider.ts#L504)

Backup audit configuration and statistics

#### Returns

`Promise`\<[`AuditBackupData`](../../BaseAuditProvider/interfaces/AuditBackupData.md)\>

Backup data

#### Overrides

[`default`](../../BaseAuditProvider/classes/default.md).[`backup`](../../BaseAuditProvider/classes/default.md#backup)

***

### cleanup()

> **cleanup**(): `Promise`\<`void`\>

Defined in: [src/providers/FileAuditProvider.ts:440](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/providers/FileAuditProvider.ts#L440)

Clean up old audit logs based on retention policy

#### Returns

`Promise`\<`void`\>

#### Overrides

[`default`](../../BaseAuditProvider/classes/default.md).[`cleanup`](../../BaseAuditProvider/classes/default.md#cleanup)

***

### close()

> **close**(): `Promise`\<`void`\>

Defined in: [src/providers/FileAuditProvider.ts:486](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/providers/FileAuditProvider.ts#L486)

Close/cleanup the audit provider

#### Returns

`Promise`\<`void`\>

#### Overrides

[`default`](../../BaseAuditProvider/classes/default.md).[`close`](../../BaseAuditProvider/classes/default.md#close)

***

### exportAuditLogs()

> **exportAuditLogs**(`filters`, `format`): `Promise`\<`string`\>

Defined in: [src/providers/FileAuditProvider.ts:346](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/providers/FileAuditProvider.ts#L346)

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

Defined in: [src/providers/FileAuditProvider.ts:365](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/providers/FileAuditProvider.ts#L365)

Flush pending audit events to storage

#### Returns

`Promise`\<`void`\>

#### Overrides

[`default`](../../BaseAuditProvider/classes/default.md).[`flush`](../../BaseAuditProvider/classes/default.md#flush)

***

### getAuditStats()

> **getAuditStats**(`filters`): `Promise`\<[`AuditStats`](../../BaseAuditProvider/interfaces/AuditStats.md)\>

Defined in: [src/providers/FileAuditProvider.ts:293](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/providers/FileAuditProvider.ts#L293)

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

Defined in: [src/providers/FileAuditProvider.ts:155](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/providers/FileAuditProvider.ts#L155)

Get provider information

#### Returns

`object`

Provider metadata

##### description

> **description**: `string` = `'File-based audit log storage'`

##### features

> **features**: `string`[]

##### name

> **name**: `string` = `'FileAuditProvider'`

##### version

> **version**: `string` = `'1.0.0'`

#### Overrides

[`default`](../../BaseAuditProvider/classes/default.md).[`getProviderInfo`](../../BaseAuditProvider/classes/default.md#getproviderinfo)

***

### initialize()

> **initialize**(): `Promise`\<`void`\>

Defined in: [src/providers/FileAuditProvider.ts:82](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/providers/FileAuditProvider.ts#L82)

Initialize the file audit provider

#### Returns

`Promise`\<`void`\>

#### Overrides

[`default`](../../BaseAuditProvider/classes/default.md).[`initialize`](../../BaseAuditProvider/classes/default.md#initialize)

***

### isHealthy()

> **isHealthy**(): `Promise`\<`boolean`\>

Defined in: [src/providers/FileAuditProvider.ts:467](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/providers/FileAuditProvider.ts#L467)

Check if the audit provider is healthy

#### Returns

`Promise`\<`boolean`\>

True if healthy

#### Overrides

[`default`](../../BaseAuditProvider/classes/default.md).[`isHealthy`](../../BaseAuditProvider/classes/default.md#ishealthy)

***

### logAuditEvent()

> **logAuditEvent**(`auditEvent`): `Promise`\<`string`\>

Defined in: [src/providers/FileAuditProvider.ts:169](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/providers/FileAuditProvider.ts#L169)

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

Defined in: [src/providers/FileAuditProvider.ts:219](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/providers/FileAuditProvider.ts#L219)

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
