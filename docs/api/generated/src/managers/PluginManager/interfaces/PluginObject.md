[**amdWiki API v1.5.0**](../../../../README.md)

***

[amdWiki API](../../../../README.md) / [src/managers/PluginManager](../README.md) / PluginObject

# Interface: PluginObject

Defined in: [src/managers/PluginManager.ts:20](https://github.com/jwilleke/amdWiki/blob/b6a859c7c9297966de89735ea5e8f953df289ac1/src/managers/PluginManager.ts#L20)

Plugin object interface - new-style plugin with execute method

## Properties

### author?

> `optional` **author**: `string`

Defined in: [src/managers/PluginManager.ts:23](https://github.com/jwilleke/amdWiki/blob/b6a859c7c9297966de89735ea5e8f953df289ac1/src/managers/PluginManager.ts#L23)

***

### description?

> `optional` **description**: `string`

Defined in: [src/managers/PluginManager.ts:22](https://github.com/jwilleke/amdWiki/blob/b6a859c7c9297966de89735ea5e8f953df289ac1/src/managers/PluginManager.ts#L22)

***

### execute()

> **execute**: (`context`, `params`) => `string` \| `Promise`\<`string`\>

Defined in: [src/managers/PluginManager.ts:26](https://github.com/jwilleke/amdWiki/blob/b6a859c7c9297966de89735ea5e8f953df289ac1/src/managers/PluginManager.ts#L26)

#### Parameters

##### context

[`PluginContext`](PluginContext.md)

##### params

[`PluginParams`](PluginParams.md)

#### Returns

`string` \| `Promise`\<`string`\>

***

### initialize()?

> `optional` **initialize**: (`engine`) => `void` \| `Promise`\<`void`\>

Defined in: [src/managers/PluginManager.ts:25](https://github.com/jwilleke/amdWiki/blob/b6a859c7c9297966de89735ea5e8f953df289ac1/src/managers/PluginManager.ts#L25)

#### Parameters

##### engine

[`WikiEngine`](../../../types/WikiEngine/interfaces/WikiEngine.md)

#### Returns

`void` \| `Promise`\<`void`\>

***

### name?

> `optional` **name**: `string`

Defined in: [src/managers/PluginManager.ts:21](https://github.com/jwilleke/amdWiki/blob/b6a859c7c9297966de89735ea5e8f953df289ac1/src/managers/PluginManager.ts#L21)

***

### version?

> `optional` **version**: `string`

Defined in: [src/managers/PluginManager.ts:24](https://github.com/jwilleke/amdWiki/blob/b6a859c7c9297966de89735ea5e8f953df289ac1/src/managers/PluginManager.ts#L24)
