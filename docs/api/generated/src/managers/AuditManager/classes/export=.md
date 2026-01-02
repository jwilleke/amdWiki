[**amdWiki API v1.5.0**](../../../../README.md)

***

[amdWiki API](../../../../README.md) / [src/managers/AuditManager](../README.md) / export=

# Class: export=

Defined in: [src/managers/AuditManager.ts:186](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/managers/AuditManager.ts#L186)

Base class for all managers

Provides common functionality for initialization, lifecycle management,
and backup/restore operations.

## Extends

- [`default`](../../BaseManager/classes/default.md)

## Constructors

### Constructor

> **new export=**(`engine`): `AuditManager`

Defined in: [src/managers/AuditManager.ts:196](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/managers/AuditManager.ts#L196)

Creates a new AuditManager instance

#### Parameters

##### engine

[`WikiEngine`](../../../types/WikiEngine/interfaces/WikiEngine.md)

The wiki engine instance

#### Returns

`AuditManager`

#### Overrides

[`default`](../../BaseManager/classes/default.md).[`constructor`](../../BaseManager/classes/default.md#constructor)

## Properties

### config?

> `protected` `optional` **config**: `Record`\<`string`, `any`\>

Defined in: [src/managers/BaseManager.ts:63](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/managers/BaseManager.ts#L63)

Configuration passed during initialization

#### Inherited from

[`default`](../../BaseManager/classes/default.md).[`config`](../../BaseManager/classes/default.md#config)

***

### engine

> `protected` **engine**: [`WikiEngine`](../../../types/WikiEngine/interfaces/WikiEngine.md)

Defined in: [src/managers/BaseManager.ts:56](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/managers/BaseManager.ts#L56)

Reference to the wiki engine

#### Inherited from

[`default`](../../BaseManager/classes/default.md).[`engine`](../../BaseManager/classes/default.md#engine)

***

### initialized

> `protected` **initialized**: `boolean`

Defined in: [src/managers/BaseManager.ts:59](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/managers/BaseManager.ts#L59)

Initialization status flag

#### Inherited from

[`default`](../../BaseManager/classes/default.md).[`initialized`](../../BaseManager/classes/default.md#initialized)

## Methods

### backup()

> **backup**(): `Promise`\<[`BackupData`](../../BaseManager/interfaces/BackupData.md)\>

Defined in: [src/managers/BaseManager.ts:168](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/managers/BaseManager.ts#L168)

Backup manager data

MUST be overridden by all managers that manage persistent data.
Default implementation returns an empty backup object.

#### Returns

`Promise`\<[`BackupData`](../../BaseManager/interfaces/BackupData.md)\>

Backup data object containing all manager state

#### Throws

If backup operation fails

#### Example

```ts
async backup(): Promise<BackupData> {
  return {
    managerName: this.constructor.name,
    timestamp: new Date().toISOString(),
    data: {
      users: Array.from(this.users.values()),
      settings: this.settings
    }
  };
}
```

#### Inherited from

[`default`](../../BaseManager/classes/default.md).[`backup`](../../BaseManager/classes/default.md#backup)

***

### cleanupOldLogs()

> **cleanupOldLogs**(): `Promise`\<`void`\>

Defined in: [src/managers/AuditManager.ts:531](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/managers/AuditManager.ts#L531)

Clean up old audit logs based on retention policy

#### Returns

`Promise`\<`void`\>

***

### exportAuditLogs()

> **exportAuditLogs**(`filters`, `format`): `Promise`\<`string`\>

Defined in: [src/managers/AuditManager.ts:513](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/managers/AuditManager.ts#L513)

Export audit logs

#### Parameters

##### filters

`AuditFilters` = `{}`

Export filters

##### format

`string` = `'json'`

Export format ('json', 'csv')

#### Returns

`Promise`\<`string`\>

Exported data

***

### flushAuditQueue()

> **flushAuditQueue**(): `Promise`\<`void`\>

Defined in: [src/managers/AuditManager.ts:522](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/managers/AuditManager.ts#L522)

Flush audit queue to disk

#### Returns

`Promise`\<`void`\>

***

### getAuditStats()

> **getAuditStats**(`filters`): `Promise`\<`AuditStats`\>

Defined in: [src/managers/AuditManager.ts:502](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/managers/AuditManager.ts#L502)

Get audit statistics

#### Parameters

##### filters

`AuditFilters` = `{}`

Optional filters

#### Returns

`Promise`\<`AuditStats`\>

Audit statistics

***

### getEngine()

> **getEngine**(): [`WikiEngine`](../../../types/WikiEngine/interfaces/WikiEngine.md)

Defined in: [src/managers/BaseManager.ts:126](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/managers/BaseManager.ts#L126)

Get the wiki engine instance

#### Returns

[`WikiEngine`](../../../types/WikiEngine/interfaces/WikiEngine.md)

The wiki engine instance

#### Example

```ts
const config = this.getEngine().getConfig();
```

#### Inherited from

[`default`](../../BaseManager/classes/default.md).[`getEngine`](../../BaseManager/classes/default.md#getengine)

***

### initialize()

> **initialize**(`config?`): `Promise`\<`void`\>

Defined in: [src/managers/AuditManager.ts:210](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/managers/AuditManager.ts#L210)

Initialize the AuditManager and load the configured provider

#### Parameters

##### config?

`Record`\<`string`, `unknown`\> = `{}`

Configuration object (unused, reads from ConfigurationManager)

#### Returns

`Promise`\<`void`\>

#### Async

#### Throws

If ConfigurationManager is not available or provider fails to load

#### Overrides

[`default`](../../BaseManager/classes/default.md).[`initialize`](../../BaseManager/classes/default.md#initialize)

***

### isInitialized()

> **isInitialized**(): `boolean`

Defined in: [src/managers/BaseManager.ts:114](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/managers/BaseManager.ts#L114)

Check if manager has been initialized

#### Returns

`boolean`

True if manager is initialized

#### Example

```ts
if (manager.isInitialized()) {
  // Safe to use manager
}
```

#### Inherited from

[`default`](../../BaseManager/classes/default.md).[`isInitialized`](../../BaseManager/classes/default.md#isinitialized)

***

### logAccessDecision()

> **logAccessDecision**(`context`, `result`, `reason`, `policy`): `Promise`\<`string`\>

Defined in: [src/managers/AuditManager.ts:353](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/managers/AuditManager.ts#L353)

Log access control decision

#### Parameters

##### context

`AccessContext`

Access context

##### result

`string`

'allow', 'deny', 'error'

##### reason

`string`

Reason for the decision

##### policy

`PolicyInfo` = `null`

Policy that made the decision

#### Returns

`Promise`\<`string`\>

Event ID

***

### logAuditEvent()

> **logAuditEvent**(`auditEvent`): `Promise`\<`string`\>

Defined in: [src/managers/AuditManager.ts:340](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/managers/AuditManager.ts#L340)

Log an audit event

#### Parameters

##### auditEvent

`AuditEvent`

Audit event data

#### Returns

`Promise`\<`string`\>

Event ID

***

### logAuthentication()

> **logAuthentication**(`context`, `result`, `reason`): `Promise`\<`string`\>

Defined in: [src/managers/AuditManager.ts:428](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/managers/AuditManager.ts#L428)

Log authentication event

#### Parameters

##### context

`AuthenticationContext`

Authentication context

##### result

`string`

'success', 'failure', 'logout'

##### reason

`string`

Reason for result

#### Returns

`Promise`\<`string`\>

Event ID

***

### logPolicyEvaluation()

> **logPolicyEvaluation**(`context`, `policies`, `finalResult`, `duration`): `Promise`\<`string`\>

Defined in: [src/managers/AuditManager.ts:395](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/managers/AuditManager.ts#L395)

Log policy evaluation

#### Parameters

##### context

`AccessContext`

Evaluation context

##### policies

`PolicyInfo`[]

Policies evaluated

##### finalResult

`string`

Final result

##### duration

`number`

Evaluation duration in ms

#### Returns

`Promise`\<`string`\>

Event ID

***

### logSecurityEvent()

> **logSecurityEvent**(`context`, `eventType`, `severity`, `description`): `Promise`\<`string`\>

Defined in: [src/managers/AuditManager.ts:459](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/managers/AuditManager.ts#L459)

Log security event

#### Parameters

##### context

`SecurityContext`

Security context

##### eventType

`string`

Type of security event

##### severity

'low', 'medium', 'high', 'critical'

`"low"` | `"medium"` | `"high"` | `"critical"`

##### description

`string`

Event description

#### Returns

`Promise`\<`string`\>

Event ID

***

### restore()

> **restore**(`backupData`): `Promise`\<`void`\>

Defined in: [src/managers/BaseManager.ts:196](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/managers/BaseManager.ts#L196)

Restore manager data from backup

MUST be overridden by all managers that manage persistent data.
Default implementation only validates that backup data is provided.

#### Parameters

##### backupData

[`BackupData`](../../BaseManager/interfaces/BackupData.md)

Backup data object from backup() method

#### Returns

`Promise`\<`void`\>

#### Throws

If restore operation fails or backup data is missing

#### Example

```ts
async restore(backupData: BackupData): Promise<void> {
  if (!backupData || !backupData.data) {
    throw new Error('Invalid backup data');
  }
  this.users = new Map(backupData.data.users.map(u => [u.id, u]));
  this.settings = backupData.data.settings;
}
```

#### Inherited from

[`default`](../../BaseManager/classes/default.md).[`restore`](../../BaseManager/classes/default.md#restore)

***

### searchAuditLogs()

> **searchAuditLogs**(`filters`, `options`): `Promise`\<`AuditSearchResults`\>

Defined in: [src/managers/AuditManager.ts:489](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/managers/AuditManager.ts#L489)

Search audit logs

#### Parameters

##### filters

`AuditFilters` = `{}`

Search filters

##### options

`AuditSearchOptions` = `{}`

Search options

#### Returns

`Promise`\<`AuditSearchResults`\>

Search results

***

### shutdown()

> **shutdown**(): `Promise`\<`void`\>

Defined in: [src/managers/AuditManager.ts:540](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/managers/AuditManager.ts#L540)

Shutdown the audit manager

#### Returns

`Promise`\<`void`\>

#### Overrides

[`default`](../../BaseManager/classes/default.md).[`shutdown`](../../BaseManager/classes/default.md#shutdown)
