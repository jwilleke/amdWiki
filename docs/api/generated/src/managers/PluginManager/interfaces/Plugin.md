[**amdWiki API v1.5.0**](../../../../README.md)

***

[amdWiki API](../../../../README.md) / [src/managers/PluginManager](../README.md) / Plugin

# Interface: Plugin()

Defined in: [src/managers/PluginManager.ts:9](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/managers/PluginManager.ts#L9)

Plugin object interface

> **Plugin**(`pageName`, `params`, `linkGraph`): `string` \| `Promise`\<`string`\>

Defined in: [src/managers/PluginManager.ts:17](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/managers/PluginManager.ts#L17)

Plugin object interface

## Parameters

### pageName

`string`

### params

[`PluginParams`](PluginParams.md)

### linkGraph

`Record`\<`string`, `unknown`\>

## Returns

`string` \| `Promise`\<`string`\>

## Properties

### author?

> `optional` **author**: `string`

Defined in: [src/managers/PluginManager.ts:12](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/managers/PluginManager.ts#L12)

***

### description?

> `optional` **description**: `string`

Defined in: [src/managers/PluginManager.ts:11](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/managers/PluginManager.ts#L11)

***

### execute()?

> `optional` **execute**: (`context`, `params`) => `string` \| `Promise`\<`string`\>

Defined in: [src/managers/PluginManager.ts:16](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/managers/PluginManager.ts#L16)

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

Defined in: [src/managers/PluginManager.ts:15](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/managers/PluginManager.ts#L15)

#### Parameters

##### engine

`any`

#### Returns

`void` \| `Promise`\<`void`\>

***

### name?

> `optional` **name**: `string`

Defined in: [src/managers/PluginManager.ts:10](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/managers/PluginManager.ts#L10)

***

### version?

> `optional` **version**: `string`

Defined in: [src/managers/PluginManager.ts:13](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/managers/PluginManager.ts#L13)
