[**amdWiki API v1.5.0**](../../../../README.md)

***

[amdWiki API](../../../../README.md) / [src/types/Provider](../README.md) / AuditProvider

# Interface: AuditProvider

Defined in: [src/types/Provider.ts:491](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/types/Provider.ts#L491)

Audit provider interface

Defines the contract for audit logging backends.

## Extends

- [`BaseProvider`](BaseProvider.md)

## Properties

### engine

> **engine**: [`WikiEngine`](../../WikiEngine/interfaces/WikiEngine.md)

Defined in: [src/types/Provider.ts:21](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/types/Provider.ts#L21)

Reference to WikiEngine

#### Inherited from

[`BaseProvider`](BaseProvider.md).[`engine`](BaseProvider.md#engine)

***

### initialized

> **initialized**: `boolean`

Defined in: [src/types/Provider.ts:24](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/types/Provider.ts#L24)

Whether provider has been initialized

#### Inherited from

[`BaseProvider`](BaseProvider.md).[`initialized`](BaseProvider.md#initialized)

## Methods

### cleanupOldEvents()

> **cleanupOldEvents**(`olderThanDays`): `Promise`\<`number`\>

Defined in: [src/types/Provider.ts:520](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/types/Provider.ts#L520)

Delete old audit events

#### Parameters

##### olderThanDays

`number`

Delete events older than N days

#### Returns

`Promise`\<`number`\>

Number of events deleted

***

### initialize()

> **initialize**(): `Promise`\<`void`\>

Defined in: [src/types/Provider.ts:30](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/types/Provider.ts#L30)

Initialize the provider

#### Returns

`Promise`\<`void`\>

Promise that resolves when initialization is complete

#### Inherited from

[`BaseProvider`](BaseProvider.md).[`initialize`](BaseProvider.md#initialize)

***

### logEvent()

> **logEvent**(`event`): `Promise`\<`void`\>

Defined in: [src/types/Provider.ts:497](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/types/Provider.ts#L497)

Log audit event

#### Parameters

##### event

`Omit`\<[`AuditEvent`](AuditEvent.md), `"id"` \| `"timestamp"`\>

Audit event

#### Returns

`Promise`\<`void`\>

Promise that resolves when event is logged

***

### queryEvents()

> **queryEvents**(`filters`): `Promise`\<[`AuditEvent`](AuditEvent.md)[]\>

Defined in: [src/types/Provider.ts:504](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/types/Provider.ts#L504)

Query audit events

#### Parameters

##### filters

Filter criteria

###### action?

`string`

###### actor?

`string`

###### endDate?

`string`

###### limit?

`number`

###### offset?

`number`

###### startDate?

`string`

###### target?

`string`

###### type?

`string`

#### Returns

`Promise`\<[`AuditEvent`](AuditEvent.md)[]\>

Array of audit events

***

### shutdown()?

> `optional` **shutdown**(): `Promise`\<`void`\>

Defined in: [src/types/Provider.ts:36](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/types/Provider.ts#L36)

Shutdown the provider (optional)

#### Returns

`Promise`\<`void`\>

Promise that resolves when shutdown is complete

#### Inherited from

[`BaseProvider`](BaseProvider.md).[`shutdown`](BaseProvider.md#shutdown)
