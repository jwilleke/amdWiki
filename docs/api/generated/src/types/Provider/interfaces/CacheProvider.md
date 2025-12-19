[**amdWiki API v1.5.0**](../../../../README.md)

***

[amdWiki API](../../../../README.md) / [src/types/Provider](../README.md) / CacheProvider

# Interface: CacheProvider

Defined in: [src/types/Provider.ts:383](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/types/Provider.ts#L383)

Cache provider interface

Defines the contract for caching backends (in-memory, Redis, etc.).

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

### clear()

> **clear**(): `Promise`\<`void`\>

Defined in: [src/types/Provider.ts:411](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/types/Provider.ts#L411)

Clear all cached values

#### Returns

`Promise`\<`void`\>

Promise that resolves when cache is cleared

***

### delete()

> **delete**(`key`): `Promise`\<`boolean`\>

Defined in: [src/types/Provider.ts:405](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/types/Provider.ts#L405)

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

Defined in: [src/types/Provider.ts:389](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/types/Provider.ts#L389)

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

Defined in: [src/types/Provider.ts:418](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/types/Provider.ts#L418)

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

Defined in: [src/types/Provider.ts:28](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/types/Provider.ts#L28)

Initialize the provider

#### Returns

`Promise`\<`void`\>

Promise that resolves when initialization is complete

#### Inherited from

[`BaseProvider`](BaseProvider.md).[`initialize`](BaseProvider.md#initialize)

***

### set()

> **set**\<`T`\>(`key`, `value`, `ttl?`): `Promise`\<`void`\>

Defined in: [src/types/Provider.ts:398](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/types/Provider.ts#L398)

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
