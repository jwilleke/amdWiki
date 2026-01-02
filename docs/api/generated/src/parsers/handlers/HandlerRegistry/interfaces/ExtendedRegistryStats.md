[**amdWiki API v1.5.0**](../../../../../README.md)

***

[amdWiki API](../../../../../README.md) / [src/parsers/handlers/HandlerRegistry](../README.md) / ExtendedRegistryStats

# Interface: ExtendedRegistryStats

Defined in: [src/parsers/handlers/HandlerRegistry.ts:97](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/parsers/handlers/HandlerRegistry.ts#L97)

Extended registry statistics with handler details

## Properties

### config

> **config**: [`RegistryConfig`](RegistryConfig.md)

Defined in: [src/parsers/handlers/HandlerRegistry.ts:104](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/parsers/handlers/HandlerRegistry.ts#L104)

***

### handlers

> **handlers**: `Record`\<`string`, `unknown`\>

Defined in: [src/parsers/handlers/HandlerRegistry.ts:103](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/parsers/handlers/HandlerRegistry.ts#L103)

***

### registry

> **registry**: [`RegistryStats`](RegistryStats.md) & `object`

Defined in: [src/parsers/handlers/HandlerRegistry.ts:98](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/parsers/handlers/HandlerRegistry.ts#L98)

#### Type Declaration

##### disabledHandlers

> **disabledHandlers**: `number`

##### enabledHandlers

> **enabledHandlers**: `number`

##### totalHandlers

> **totalHandlers**: `number`
