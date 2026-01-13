[**amdWiki API v1.5.0**](../../../../README.md)

***

[amdWiki API](../../../../README.md) / [src/types/Provider](../README.md) / BaseProvider

# Interface: BaseProvider

Defined in: [src/types/Provider.ts:35](https://github.com/jwilleke/amdWiki/blob/b6a859c7c9297966de89735ea5e8f953df289ac1/src/types/Provider.ts#L35)

Base provider interface

All providers must implement this interface.

## Extended by

- [`PageProvider`](PageProvider.md)
- [`UserProvider`](UserProvider.md)
- [`AttachmentProvider`](AttachmentProvider.md)
- [`SearchProvider`](SearchProvider.md)
- [`CacheProvider`](CacheProvider.md)
- [`AuditProvider`](AuditProvider.md)

## Properties

### engine

> **engine**: [`WikiEngine`](../../WikiEngine/interfaces/WikiEngine.md)

Defined in: [src/types/Provider.ts:37](https://github.com/jwilleke/amdWiki/blob/b6a859c7c9297966de89735ea5e8f953df289ac1/src/types/Provider.ts#L37)

Reference to WikiEngine

***

### initialized

> **initialized**: `boolean`

Defined in: [src/types/Provider.ts:40](https://github.com/jwilleke/amdWiki/blob/b6a859c7c9297966de89735ea5e8f953df289ac1/src/types/Provider.ts#L40)

Whether provider has been initialized

## Methods

### backup()?

> `optional` **backup**(): `Promise`\<`Record`\<`string`, `unknown`\>\>

Defined in: [src/types/Provider.ts:64](https://github.com/jwilleke/amdWiki/blob/b6a859c7c9297966de89735ea5e8f953df289ac1/src/types/Provider.ts#L64)

Backup provider data

#### Returns

`Promise`\<`Record`\<`string`, `unknown`\>\>

Promise resolving to backup data

***

### getProviderInfo()?

> `optional` **getProviderInfo**(): [`ProviderInfo`](ProviderInfo.md)

Defined in: [src/types/Provider.ts:58](https://github.com/jwilleke/amdWiki/blob/b6a859c7c9297966de89735ea5e8f953df289ac1/src/types/Provider.ts#L58)

Get provider information

#### Returns

[`ProviderInfo`](ProviderInfo.md)

Provider metadata

***

### initialize()

> **initialize**(): `Promise`\<`void`\>

Defined in: [src/types/Provider.ts:46](https://github.com/jwilleke/amdWiki/blob/b6a859c7c9297966de89735ea5e8f953df289ac1/src/types/Provider.ts#L46)

Initialize the provider

#### Returns

`Promise`\<`void`\>

Promise that resolves when initialization is complete

***

### restore()?

> `optional` **restore**(`backupData`): `Promise`\<`void`\>

Defined in: [src/types/Provider.ts:71](https://github.com/jwilleke/amdWiki/blob/b6a859c7c9297966de89735ea5e8f953df289ac1/src/types/Provider.ts#L71)

Restore provider data from backup

#### Parameters

##### backupData

`Record`\<`string`, `unknown`\>

Backup data from backup() method

#### Returns

`Promise`\<`void`\>

Promise that resolves when restore is complete

***

### shutdown()?

> `optional` **shutdown**(): `Promise`\<`void`\>

Defined in: [src/types/Provider.ts:52](https://github.com/jwilleke/amdWiki/blob/b6a859c7c9297966de89735ea5e8f953df289ac1/src/types/Provider.ts#L52)

Shutdown the provider (optional)

#### Returns

`Promise`\<`void`\>

Promise that resolves when shutdown is complete
