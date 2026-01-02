[**amdWiki API v1.5.0**](../../../../README.md)

***

[amdWiki API](../../../../README.md) / [src/types/WikiEngine](../README.md) / WikiEngine

# Interface: WikiEngine

Defined in: [src/types/WikiEngine.ts:24](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/types/WikiEngine.ts#L24)

WikiEngine interface

The core engine that orchestrates all wiki functionality.
Manages initialization, configuration, and provides access to all managers.

## Indexable

\[`key`: `string`\]: `any`

Allow additional properties for extensibility

## Properties

### config?

> `optional` **config**: [`WikiConfig`](../../Config/interfaces/WikiConfig.md)

Defined in: [src/types/WikiEngine.ts:26](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/types/WikiEngine.ts#L26)

Wiki configuration

***

### context?

> `optional` **context**: `any`

Defined in: [src/types/WikiEngine.ts:38](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/types/WikiEngine.ts#L38)

Current context (request-scoped)

***

### logger?

> `optional` **logger**: `any`

Defined in: [src/types/WikiEngine.ts:32](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/types/WikiEngine.ts#L32)

Logger instance

***

### startTime?

> `optional` **startTime**: `number`

Defined in: [src/types/WikiEngine.ts:35](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/types/WikiEngine.ts#L35)

Engine start time

## Methods

### getConfig()

> **getConfig**(): [`WikiConfig`](../../Config/interfaces/WikiConfig.md)

Defined in: [src/types/WikiEngine.ts:65](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/types/WikiEngine.ts#L65)

Get wiki configuration

#### Returns

[`WikiConfig`](../../Config/interfaces/WikiConfig.md)

Wiki configuration object

***

### getManager()

> **getManager**\<`T`\>(`managerName`): `T`

Defined in: [src/types/WikiEngine.ts:52](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/types/WikiEngine.ts#L52)

Get a manager by name

#### Type Parameters

##### T

`T` = `any`

#### Parameters

##### managerName

`string`

Name of the manager

#### Returns

`T`

Manager instance or undefined

***

### initialize()

> **initialize**(`config?`): `Promise`\<`any`\>

Defined in: [src/types/WikiEngine.ts:45](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/types/WikiEngine.ts#L45)

Initialize the wiki engine

#### Parameters

##### config?

[`WikiConfig`](../../Config/interfaces/WikiConfig.md)

Wiki configuration

#### Returns

`Promise`\<`any`\>

The initialized engine or void

***

### registerManager()

> **registerManager**(`managerName`, `manager`): `void`

Defined in: [src/types/WikiEngine.ts:59](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/types/WikiEngine.ts#L59)

Register a manager

#### Parameters

##### managerName

`string`

Name of the manager

##### manager

`any`

Manager instance

#### Returns

`void`

***

### shutdown()

> **shutdown**(): `Promise`\<`void`\>

Defined in: [src/types/WikiEngine.ts:70](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/types/WikiEngine.ts#L70)

Shutdown the wiki engine

#### Returns

`Promise`\<`void`\>
