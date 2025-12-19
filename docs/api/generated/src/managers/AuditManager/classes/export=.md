[**amdWiki API v1.5.0**](../../../../README.md)

***

[amdWiki API](../../../../README.md) / [src/managers/AuditManager](../README.md) / export=

# Class: export=

Defined in: [src/managers/AuditManager.js:24](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/managers/AuditManager.js#L24)

Base Manager class - All managers should extend this

Following JSPWiki's modular manager pattern, this abstract base class
provides common functionality for all managers including initialization,
lifecycle management, and backup/restore operations.

 BaseManager

## See

WikiEngine for the main engine

## Extends

- [`export=`](../../BaseManager/classes/export=.md)

## Constructors

### Constructor

> **new export=**(`engine`): `AuditManager`

Defined in: [src/managers/AuditManager.js:31](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/managers/AuditManager.js#L31)

Creates a new AuditManager instance

#### Parameters

##### engine

`WikiEngine`

The wiki engine instance

#### Returns

`AuditManager`

#### Overrides

[`export=`](../../BaseManager/classes/export=.md).[`constructor`](../../BaseManager/classes/export=.md#constructor)

## Properties

### auditLogs

> **auditLogs**: `any`

Defined in: [src/managers/AuditManager.js:464](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/managers/AuditManager.js#L464)

***

### auditQueue

> **auditQueue**: `any`[]

Defined in: [src/managers/AuditManager.js:450](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/managers/AuditManager.js#L450)

***

### config

> **config**: `any`

Defined in: [src/managers/BaseManager.js:55](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/managers/BaseManager.js#L55)

Configuration object passed during initialization

#### Inherited from

[`export=`](../../BaseManager/classes/export=.md).[`config`](../../BaseManager/classes/export=.md#config)

***

### engine

> **engine**: `WikiEngine`

Defined in: [src/managers/BaseManager.js:33](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/managers/BaseManager.js#L33)

Reference to the wiki engine

#### Inherited from

[`export=`](../../BaseManager/classes/export=.md).[`engine`](../../BaseManager/classes/export=.md#engine)

***

### initialized

> **initialized**: `boolean`

Defined in: [src/managers/BaseManager.js:34](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/managers/BaseManager.js#L34)

Flag indicating initialization status

#### Inherited from

[`export=`](../../BaseManager/classes/export=.md).[`initialized`](../../BaseManager/classes/export=.md#initialized)

***

### isProcessing

> **isProcessing**: `boolean`

Defined in: [src/managers/AuditManager.js:446](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/managers/AuditManager.js#L446)

***

### provider

> **provider**: `any`

Defined in: [src/managers/AuditManager.js:33](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/managers/AuditManager.js#L33)

***

### providerClass

> **providerClass**: `string`

Defined in: [src/managers/AuditManager.js:34](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/managers/AuditManager.js#L34)

## Methods

### backup()

> **backup**(): `Promise`\<`any`\>

Defined in: [src/managers/BaseManager.js:130](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/managers/BaseManager.js#L130)

Backup manager data

MUST be overridden by all managers that manage persistent data.
Default implementation returns an empty backup object.

#### Returns

`Promise`\<`any`\>

Backup data object containing all manager state

#### Async

#### Throws

If backup operation fails

#### Example

```ts
async backup() {
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

[`export=`](../../BaseManager/classes/export=.md).[`backup`](../../BaseManager/classes/export=.md#backup)

***

### cleanupOldLogs()

> **cleanupOldLogs**(): `Promise`\<`void`\>

Defined in: [src/managers/AuditManager.js:512](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/managers/AuditManager.js#L512)

Clean up old audit logs based on retention policy

#### Returns

`Promise`\<`void`\>

***

### exportAuditLogs()

> **exportAuditLogs**(`filters`, `format`): `Promise`\<`string`\>

Defined in: [src/managers/AuditManager.js:424](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/managers/AuditManager.js#L424)

Export audit logs

#### Parameters

##### filters

`any` = `{}`

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

Defined in: [src/managers/AuditManager.js:432](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/managers/AuditManager.js#L432)

Flush audit queue to disk

#### Returns

`Promise`\<`void`\>

***

### getAuditStats()

> **getAuditStats**(`filters`): `Promise`\<`any`\>

Defined in: [src/managers/AuditManager.js:369](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/managers/AuditManager.js#L369)

Get audit statistics

#### Parameters

##### filters

`any` = `{}`

Optional filters

#### Returns

`Promise`\<`any`\>

Audit statistics

***

### getEngine()

> **getEngine**(): `WikiEngine`

Defined in: [src/managers/BaseManager.js:81](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/managers/BaseManager.js#L81)

Get the wiki engine instance

#### Returns

`WikiEngine`

The wiki engine instance

#### Example

```ts
const config = this.getEngine().getConfig();
```

#### Inherited from

[`export=`](../../BaseManager/classes/export=.md).[`getEngine`](../../BaseManager/classes/export=.md#getengine)

***

### initialize()

> **initialize**(`config?`): `Promise`\<`void`\>

Defined in: [src/managers/AuditManager.js:45](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/managers/AuditManager.js#L45)

Initialize the AuditManager and load the configured provider

#### Parameters

##### config?

`any` = `{}`

Configuration object (unused, reads from ConfigurationManager)

#### Returns

`Promise`\<`void`\>

#### Async

#### Throws

If ConfigurationManager is not available or provider fails to load

#### Overrides

[`export=`](../../BaseManager/classes/export=.md).[`initialize`](../../BaseManager/classes/export=.md#initialize)

***

### isInitialized()

> **isInitialized**(): `boolean`

Defined in: [src/managers/BaseManager.js:69](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/managers/BaseManager.js#L69)

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

[`export=`](../../BaseManager/classes/export=.md).[`isInitialized`](../../BaseManager/classes/export=.md#isinitialized)

***

### loadExistingLogs()

> **loadExistingLogs**(): `Promise`\<`void`\>

Defined in: [src/managers/AuditManager.js:481](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/managers/AuditManager.js#L481)

Load existing audit logs from disk

#### Returns

`Promise`\<`void`\>

***

### logAccessDecision()

> **logAccessDecision**(`context`, `result`, `reason`, `policy`): `Promise`\<`string`\>

Defined in: [src/managers/AuditManager.js:173](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/managers/AuditManager.js#L173)

Log access control decision

#### Parameters

##### context

`any`

Access context

##### result

`string`

'allow', 'deny', 'error'

##### reason

`string`

Reason for the decision

##### policy

`any` = `null`

Policy that made the decision

#### Returns

`Promise`\<`string`\>

***

### logAuditEvent()

> **logAuditEvent**(`auditEvent`): `Promise`\<`string`\>

Defined in: [src/managers/AuditManager.js:162](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/managers/AuditManager.js#L162)

Log an audit event

#### Parameters

##### auditEvent

`any`

Audit event data

#### Returns

`Promise`\<`string`\>

Event ID

***

### logAuthentication()

> **logAuthentication**(`context`, `result`, `reason`): `Promise`\<`string`\>

Defined in: [src/managers/AuditManager.js:234](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/managers/AuditManager.js#L234)

Log authentication event

#### Parameters

##### context

`any`

Authentication context

##### result

`string`

'success', 'failure', 'logout'

##### reason

`string`

Reason for result

#### Returns

`Promise`\<`string`\>

***

### logPolicyEvaluation()

> **logPolicyEvaluation**(`context`, `policies`, `finalResult`, `duration`): `Promise`\<`string`\>

Defined in: [src/managers/AuditManager.js:208](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/managers/AuditManager.js#L208)

Log policy evaluation

#### Parameters

##### context

`any`

Evaluation context

##### policies

`any`[]

Policies evaluated

##### finalResult

`string`

Final result

##### duration

`number`

Evaluation duration in ms

#### Returns

`Promise`\<`string`\>

***

### logSecurityEvent()

> **logSecurityEvent**(`context`, `eventType`, `severity`, `description`): `Promise`\<`string`\>

Defined in: [src/managers/AuditManager.js:259](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/managers/AuditManager.js#L259)

Log security event

#### Parameters

##### context

`any`

Security context

##### eventType

`string`

Type of security event

##### severity

`string`

'low', 'medium', 'high', 'critical'

##### description

`string`

Event description

#### Returns

`Promise`\<`string`\>

***

### restore()

> **restore**(`backupData`): `Promise`\<`void`\>

Defined in: [src/managers/BaseManager.js:163](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/managers/BaseManager.js#L163)

Restore manager data from backup

MUST be overridden by all managers that manage persistent data.
Default implementation only validates that backup data is provided.

#### Parameters

##### backupData

Backup data object from backup() method

###### data

`any`

Manager-specific backup data

###### managerName

`string`

Name of the manager

###### timestamp

`string`

ISO timestamp of backup

#### Returns

`Promise`\<`void`\>

#### Async

#### Throws

If restore operation fails or backup data is missing

#### Example

```ts
async restore(backupData) {
  if (!backupData || !backupData.data) {
    throw new Error('Invalid backup data');
  }
  this.users = new Map(backupData.data.users.map(u => [u.id, u]));
  this.settings = backupData.data.settings;
}
```

#### Inherited from

[`export=`](../../BaseManager/classes/export=.md).[`restore`](../../BaseManager/classes/export=.md#restore)

***

### searchAuditLogs()

> **searchAuditLogs**(`filters`, `options`): `Promise`\<`any`\>

Defined in: [src/managers/AuditManager.js:283](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/managers/AuditManager.js#L283)

Search audit logs

#### Parameters

##### filters

`any` = `{}`

Search filters

##### options

`any` = `{}`

Search options

#### Returns

`Promise`\<`any`\>

Search results

***

### shutdown()

> **shutdown**(): `Promise`\<`void`\>

Defined in: [src/managers/AuditManager.js:546](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/managers/AuditManager.js#L546)

Shutdown the audit manager

#### Returns

`Promise`\<`void`\>

#### Overrides

[`export=`](../../BaseManager/classes/export=.md).[`shutdown`](../../BaseManager/classes/export=.md#shutdown)
