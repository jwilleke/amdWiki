[**amdWiki API v1.5.0**](../../../../README.md)

***

[amdWiki API](../../../../README.md) / [src/types/Provider](../README.md) / AuditProvider

# Interface: AuditProvider

Defined in: [src/types/Provider.ts:464](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/types/Provider.ts#L464)

Audit provider interface

Defines the contract for audit logging backends.

## Extends

- [`BaseProvider`](BaseProvider.md)

## Properties

### engine

> **engine**: `any`

Defined in: [src/types/Provider.ts:19](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/types/Provider.ts#L19)

Reference to WikiEngine

#### Inherited from

[`BaseProvider`](BaseProvider.md).[`engine`](BaseProvider.md#engine)

***

### initialized

> **initialized**: `boolean`

Defined in: [src/types/Provider.ts:22](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/types/Provider.ts#L22)

Whether provider has been initialized

#### Inherited from

[`BaseProvider`](BaseProvider.md).[`initialized`](BaseProvider.md#initialized)

## Methods

### cleanupOldEvents()

> **cleanupOldEvents**(`olderThanDays`): `Promise`\<`number`\>

Defined in: [src/types/Provider.ts:493](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/types/Provider.ts#L493)

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

Defined in: [src/types/Provider.ts:28](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/types/Provider.ts#L28)

Initialize the provider

#### Returns

`Promise`\<`void`\>

Promise that resolves when initialization is complete

#### Inherited from

[`BaseProvider`](BaseProvider.md).[`initialize`](BaseProvider.md#initialize)

***

### logEvent()

> **logEvent**(`event`): `Promise`\<`void`\>

Defined in: [src/types/Provider.ts:470](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/types/Provider.ts#L470)

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

Defined in: [src/types/Provider.ts:477](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/types/Provider.ts#L477)

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
