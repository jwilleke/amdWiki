[**amdWiki API v1.5.0**](../../../../README.md)

***

[amdWiki API](../../../../README.md) / [src/providers/BaseAuditProvider](../README.md) / default

# Abstract Class: default

Defined in: [src/providers/BaseAuditProvider.ts:154](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/providers/BaseAuditProvider.ts#L154)

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

Defined in: [src/providers/BaseAuditProvider.ts:168](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/providers/BaseAuditProvider.ts#L168)

Create a new audit provider

#### Parameters

##### engine

[`WikiEngine`](../../../types/WikiEngine/interfaces/WikiEngine.md)

The WikiEngine instance

#### Returns

`BaseAuditProvider`

#### Throws

If engine is not provided

## Properties

### engine

> `protected` **engine**: [`WikiEngine`](../../../types/WikiEngine/interfaces/WikiEngine.md)

Defined in: [src/providers/BaseAuditProvider.ts:156](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/providers/BaseAuditProvider.ts#L156)

Reference to the wiki engine

***

### initialized

> **initialized**: `boolean`

Defined in: [src/providers/BaseAuditProvider.ts:159](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/providers/BaseAuditProvider.ts#L159)

Whether provider has been initialized

## Methods

### backup()

> **backup**(): `Promise`\<[`AuditBackupData`](../interfaces/AuditBackupData.md)\>

Defined in: [src/providers/BaseAuditProvider.ts:307](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/providers/BaseAuditProvider.ts#L307)

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

Defined in: [src/providers/BaseAuditProvider.ts:276](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/providers/BaseAuditProvider.ts#L276)

Clean up old audit logs based on retention policy

#### Returns

`Promise`\<`void`\>

#### Async

#### Throws

Always throws - must be implemented by subclass

***

### close()

> `abstract` **close**(): `Promise`\<`void`\>

Defined in: [src/providers/BaseAuditProvider.ts:296](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/providers/BaseAuditProvider.ts#L296)

Close/cleanup the audit provider

#### Returns

`Promise`\<`void`\>

#### Async

#### Throws

Always throws - must be implemented by subclass

***

### exportAuditLogs()

> `abstract` **exportAuditLogs**(`filters?`, `format?`): `Promise`\<`string`\>

Defined in: [src/providers/BaseAuditProvider.ts:253](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/providers/BaseAuditProvider.ts#L253)

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

Defined in: [src/providers/BaseAuditProvider.ts:266](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/providers/BaseAuditProvider.ts#L266)

Flush pending audit events to storage

#### Returns

`Promise`\<`void`\>

#### Async

#### Throws

Always throws - must be implemented by subclass

***

### getAuditStats()

> `abstract` **getAuditStats**(`filters?`): `Promise`\<[`AuditStats`](../interfaces/AuditStats.md)\>

Defined in: [src/providers/BaseAuditProvider.ts:241](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/providers/BaseAuditProvider.ts#L241)

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

Defined in: [src/providers/BaseAuditProvider.ts:197](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/providers/BaseAuditProvider.ts#L197)

Get provider information

#### Returns

[`ProviderInfo`](../interfaces/ProviderInfo.md)

Provider metadata

***

### initialize()

> `abstract` **initialize**(): `Promise`\<`void`\>

Defined in: [src/providers/BaseAuditProvider.ts:190](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/providers/BaseAuditProvider.ts#L190)

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

Defined in: [src/providers/BaseAuditProvider.ts:286](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/providers/BaseAuditProvider.ts#L286)

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

Defined in: [src/providers/BaseAuditProvider.ts:215](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/providers/BaseAuditProvider.ts#L215)

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

> **restore**(`_backupData`): `Promise`\<`void`\>

Defined in: [src/providers/BaseAuditProvider.ts:325](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/providers/BaseAuditProvider.ts#L325)

Restore audit from backup (optional)

Default implementation does nothing.
Subclasses can override if they support restore functionality.

#### Parameters

##### \_backupData

[`AuditBackupData`](../interfaces/AuditBackupData.md)

Backup data

#### Returns

`Promise`\<`void`\>

#### Async

***

### searchAuditLogs()

> `abstract` **searchAuditLogs**(`filters?`, `options?`): `Promise`\<[`AuditSearchResults`](../interfaces/AuditSearchResults.md)\>

Defined in: [src/providers/BaseAuditProvider.ts:227](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/providers/BaseAuditProvider.ts#L227)

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
