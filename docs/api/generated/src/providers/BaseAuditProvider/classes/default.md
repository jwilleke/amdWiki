[**amdWiki API v1.5.0**](../../../../README.md)

***

[amdWiki API](../../../../README.md) / [src/providers/BaseAuditProvider](../README.md) / default

# Abstract Class: default

Defined in: [src/providers/BaseAuditProvider.ts:155](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/providers/BaseAuditProvider.ts#L155)

BaseAuditProvider - Abstract base class for audit providers

Provides the interface that all audit providers must implement.
Follows the provider pattern established in CacheManager, AttachmentManager, and PageManager.

Audit providers implement different storage backends (file, database, cloud logging)

 BaseAuditProvider

## See

 - FileAuditProvider for file-based implementation
 - DatabaseAuditProvider for database implementation
 - AuditManager for usage

## Example

```ts
class MyAuditProvider extends BaseAuditProvider {
  async initialize(): Promise<void> {
    const config = this.engine.getManager('ConfigurationManager');
    this.auditPath = config.getProperty('audit.path');
    this.initialized = true;
  }

  async logAuditEvent(event: AuditEvent): Promise<string> {
    // Implementation
    return event.id;
  }
}
```

## Extended by

- [`default`](../../CloudAuditProvider/classes/default.md)
- [`default`](../../DatabaseAuditProvider/classes/default.md)
- [`default`](../../FileAuditProvider/classes/default.md)
- [`default`](../../NullAuditProvider/classes/default.md)

## Constructors

### Constructor

> **new default**(`engine`): `BaseAuditProvider`

Defined in: [src/providers/BaseAuditProvider.ts:169](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/providers/BaseAuditProvider.ts#L169)

Create a new audit provider

#### Parameters

##### engine

[`WikiEngine`](../interfaces/WikiEngine.md)

The WikiEngine instance

#### Returns

`BaseAuditProvider`

#### Throws

If engine is not provided

## Properties

### engine

> `protected` **engine**: [`WikiEngine`](../interfaces/WikiEngine.md)

Defined in: [src/providers/BaseAuditProvider.ts:157](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/providers/BaseAuditProvider.ts#L157)

Reference to the wiki engine

***

### initialized

> **initialized**: `boolean`

Defined in: [src/providers/BaseAuditProvider.ts:160](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/providers/BaseAuditProvider.ts#L160)

Whether provider has been initialized

## Methods

### backup()

> **backup**(): `Promise`\<[`AuditBackupData`](../interfaces/AuditBackupData.md)\>

Defined in: [src/providers/BaseAuditProvider.ts:308](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/providers/BaseAuditProvider.ts#L308)

Backup audit configuration and state (optional)

Default implementation provides basic backup data.
Subclasses can override to include provider-specific data.

#### Returns

`Promise`\<[`AuditBackupData`](../interfaces/AuditBackupData.md)\>

Backup data

#### Async

***

### cleanup()

> `abstract` **cleanup**(): `Promise`\<`void`\>

Defined in: [src/providers/BaseAuditProvider.ts:277](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/providers/BaseAuditProvider.ts#L277)

Clean up old audit logs based on retention policy

#### Returns

`Promise`\<`void`\>

#### Async

#### Throws

Always throws - must be implemented by subclass

***

### close()

> `abstract` **close**(): `Promise`\<`void`\>

Defined in: [src/providers/BaseAuditProvider.ts:297](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/providers/BaseAuditProvider.ts#L297)

Close/cleanup the audit provider

#### Returns

`Promise`\<`void`\>

#### Async

#### Throws

Always throws - must be implemented by subclass

***

### exportAuditLogs()

> `abstract` **exportAuditLogs**(`filters?`, `format?`): `Promise`\<`string`\>

Defined in: [src/providers/BaseAuditProvider.ts:254](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/providers/BaseAuditProvider.ts#L254)

Export audit logs

#### Parameters

##### filters?

[`AuditFilters`](../interfaces/AuditFilters.md)

Export filters

##### format?

Export format ('json', 'csv')

`"json"` | `"csv"`

#### Returns

`Promise`\<`string`\>

Exported data

#### Async

#### Throws

Always throws - must be implemented by subclass

***

### flush()

> `abstract` **flush**(): `Promise`\<`void`\>

Defined in: [src/providers/BaseAuditProvider.ts:267](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/providers/BaseAuditProvider.ts#L267)

Flush pending audit events to storage

#### Returns

`Promise`\<`void`\>

#### Async

#### Throws

Always throws - must be implemented by subclass

***

### getAuditStats()

> `abstract` **getAuditStats**(`filters?`): `Promise`\<[`AuditStats`](../interfaces/AuditStats.md)\>

Defined in: [src/providers/BaseAuditProvider.ts:242](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/providers/BaseAuditProvider.ts#L242)

Get audit statistics

#### Parameters

##### filters?

[`AuditFilters`](../interfaces/AuditFilters.md)

Optional filters

#### Returns

`Promise`\<[`AuditStats`](../interfaces/AuditStats.md)\>

Audit statistics

#### Async

#### Throws

Always throws - must be implemented by subclass

***

### getProviderInfo()

> **getProviderInfo**(): [`ProviderInfo`](../interfaces/ProviderInfo.md)

Defined in: [src/providers/BaseAuditProvider.ts:198](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/providers/BaseAuditProvider.ts#L198)

Get provider information

#### Returns

[`ProviderInfo`](../interfaces/ProviderInfo.md)

Provider metadata

***

### initialize()

> `abstract` **initialize**(): `Promise`\<`void`\>

Defined in: [src/providers/BaseAuditProvider.ts:191](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/providers/BaseAuditProvider.ts#L191)

Initialize the audit provider

Implementations should load configuration from ConfigurationManager:
  const configManager = this.engine.getManager('ConfigurationManager');
  const value = configManager.getProperty('key', 'default');

Do NOT read configuration files directly.

#### Returns

`Promise`\<`void`\>

#### Async

#### Throws

Always throws - must be implemented by subclass

***

### isHealthy()

> `abstract` **isHealthy**(): `Promise`\<`boolean`\>

Defined in: [src/providers/BaseAuditProvider.ts:287](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/providers/BaseAuditProvider.ts#L287)

Check if the audit provider is healthy

#### Returns

`Promise`\<`boolean`\>

True if healthy

#### Async

#### Throws

Always throws - must be implemented by subclass

***

### logAuditEvent()

> `abstract` **logAuditEvent**(`auditEvent`): `Promise`\<`string`\>

Defined in: [src/providers/BaseAuditProvider.ts:216](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/providers/BaseAuditProvider.ts#L216)

Log an audit event

#### Parameters

##### auditEvent

[`AuditEvent`](../../../types/Provider/interfaces/AuditEvent.md)

Audit event data

#### Returns

`Promise`\<`string`\>

Event ID

#### Async

#### Throws

Always throws - must be implemented by subclass

***

### restore()

> **restore**(`backupData`): `Promise`\<`void`\>

Defined in: [src/providers/BaseAuditProvider.ts:326](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/providers/BaseAuditProvider.ts#L326)

Restore audit from backup (optional)

Default implementation does nothing.
Subclasses can override if they support restore functionality.

#### Parameters

##### backupData

[`AuditBackupData`](../interfaces/AuditBackupData.md)

Backup data

#### Returns

`Promise`\<`void`\>

#### Async

***

### searchAuditLogs()

> `abstract` **searchAuditLogs**(`filters?`, `options?`): `Promise`\<[`AuditSearchResults`](../interfaces/AuditSearchResults.md)\>

Defined in: [src/providers/BaseAuditProvider.ts:228](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/providers/BaseAuditProvider.ts#L228)

Search audit logs

#### Parameters

##### filters?

[`AuditFilters`](../interfaces/AuditFilters.md)

Search filters

##### options?

`Record`\<`string`, `any`\>

Search options

#### Returns

`Promise`\<[`AuditSearchResults`](../interfaces/AuditSearchResults.md)\>

Search results

#### Async

#### Throws

Always throws - must be implemented by subclass
