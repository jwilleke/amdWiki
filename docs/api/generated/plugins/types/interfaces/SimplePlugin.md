[**amdWiki API v1.5.0**](../../../README.md)

***

[amdWiki API](../../../README.md) / [plugins/types](../README.md) / SimplePlugin

# Interface: SimplePlugin

Defined in: [plugins/types.ts:41](https://github.com/jwilleke/amdWiki/blob/b6a859c7c9297966de89735ea5e8f953df289ac1/plugins/types.ts#L41)

Simple plugin interface for plugins that use the execute method pattern
(does not require the callable function signature)

## Properties

### author?

> `optional` **author**: `string`

Defined in: [plugins/types.ts:44](https://github.com/jwilleke/amdWiki/blob/b6a859c7c9297966de89735ea5e8f953df289ac1/plugins/types.ts#L44)

***

### description?

> `optional` **description**: `string`

Defined in: [plugins/types.ts:43](https://github.com/jwilleke/amdWiki/blob/b6a859c7c9297966de89735ea5e8f953df289ac1/plugins/types.ts#L43)

***

### execute()?

> `optional` **execute**: (`context`, `params`) => `string` \| `Promise`\<`string`\>

Defined in: [plugins/types.ts:47](https://github.com/jwilleke/amdWiki/blob/b6a859c7c9297966de89735ea5e8f953df289ac1/plugins/types.ts#L47)

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

Defined in: [plugins/types.ts:46](https://github.com/jwilleke/amdWiki/blob/b6a859c7c9297966de89735ea5e8f953df289ac1/plugins/types.ts#L46)

#### Parameters

##### engine

`unknown`

#### Returns

`void` \| `Promise`\<`void`\>

***

### name?

> `optional` **name**: `string`

Defined in: [plugins/types.ts:42](https://github.com/jwilleke/amdWiki/blob/b6a859c7c9297966de89735ea5e8f953df289ac1/plugins/types.ts#L42)

***

### version?

> `optional` **version**: `string`

Defined in: [plugins/types.ts:45](https://github.com/jwilleke/amdWiki/blob/b6a859c7c9297966de89735ea5e8f953df289ac1/plugins/types.ts#L45)
