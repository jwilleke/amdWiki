[**amdWiki API v1.5.0**](../../../../README.md)

***

[amdWiki API](../../../../README.md) / [src/types/Provider](../README.md) / CacheProvider

# Interface: CacheProvider

Defined in: [src/types/Provider.ts:410](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/types/Provider.ts#L410)

Cache provider interface

Defines the contract for caching backends (in-memory, Redis, etc.).

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

### clear()

> **clear**(): `Promise`\<`void`\>

Defined in: [src/types/Provider.ts:438](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/types/Provider.ts#L438)

Clear all cached values

#### Returns

`Promise`\<`void`\>

Promise that resolves when cache is cleared

***

### delete()

> **delete**(`key`): `Promise`\<`boolean`\>

Defined in: [src/types/Provider.ts:432](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/types/Provider.ts#L432)

Delete value from cache

#### Parameters

##### key

`string`

Cache key

#### Returns

`Promise`\<`boolean`\>

True if deleted, false if not found

***

### get()

> **get**\<`T`\>(`key`): `Promise`\<`T`\>

Defined in: [src/types/Provider.ts:416](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/types/Provider.ts#L416)

Get value from cache

#### Type Parameters

##### T

`T` = `any`

#### Parameters

##### key

`string`

Cache key

#### Returns

`Promise`\<`T`\>

Cached value or null if not found/expired

***

### has()

> **has**(`key`): `Promise`\<`boolean`\>

Defined in: [src/types/Provider.ts:445](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/types/Provider.ts#L445)

Check if key exists in cache

#### Parameters

##### key

`string`

Cache key

#### Returns

`Promise`\<`boolean`\>

True if key exists and not expired

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

### set()

> **set**\<`T`\>(`key`, `value`, `ttl?`): `Promise`\<`void`\>

Defined in: [src/types/Provider.ts:425](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/types/Provider.ts#L425)

Set value in cache

#### Type Parameters

##### T

`T` = `any`

#### Parameters

##### key

`string`

Cache key

##### value

`T`

Value to cache

##### ttl?

`number`

Time to live in seconds (optional)

#### Returns

`Promise`\<`void`\>

Promise that resolves when value is cached

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
