[**amdWiki API v1.5.0**](../../../README.md)

***

[amdWiki API](../../../README.md) / [plugins/types](../README.md) / CallablePlugin

# Type Alias: CallablePlugin

> **CallablePlugin** = (`pageName`, `params`, `linkGraph`) => `string` \| `Promise`\<`string`\> & `object`

Defined in: [plugins/types.ts:54](https://github.com/jwilleke/amdWiki/blob/b6a859c7c9297966de89735ea5e8f953df289ac1/plugins/types.ts#L54)

Callable plugin type for plugins that can be called directly
(like referringPagesPlugin)

## Type Declaration

### author

> **author**: `string`

### description

> **description**: `string`

### initialize()?

> `optional` **initialize**: (`engine`) => `void`

#### Parameters

##### engine

`unknown`

#### Returns

`void`

### name

> **name**: `string`

### version

> **version**: `string`
