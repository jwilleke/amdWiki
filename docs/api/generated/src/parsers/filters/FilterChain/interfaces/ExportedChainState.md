[**amdWiki API v1.5.0**](../../../../../README.md)

***

[amdWiki API](../../../../../README.md) / [src/parsers/filters/FilterChain](../README.md) / ExportedChainState

# Interface: ExportedChainState

Defined in: [src/parsers/filters/FilterChain.ts:160](https://github.com/jwilleke/amdWiki/blob/b6a859c7c9297966de89735ea5e8f953df289ac1/src/parsers/filters/FilterChain.ts#L160)

Exported chain state

## Properties

### config

> **config**: [`FilterChainConfig`](FilterChainConfig.md)

Defined in: [src/parsers/filters/FilterChain.ts:161](https://github.com/jwilleke/amdWiki/blob/b6a859c7c9297966de89735ea5e8f953df289ac1/src/parsers/filters/FilterChain.ts#L161)

***

### filters

> **filters**: [`ExportedFilterInfo`](ExportedFilterInfo.md)[]

Defined in: [src/parsers/filters/FilterChain.ts:165](https://github.com/jwilleke/amdWiki/blob/b6a859c7c9297966de89735ea5e8f953df289ac1/src/parsers/filters/FilterChain.ts#L165)

***

### stats

> **stats**: `Omit`\<[`FilterChainStats`](FilterChainStats.md), `"filterExecutions"`\> & `object`

Defined in: [src/parsers/filters/FilterChain.ts:162](https://github.com/jwilleke/amdWiki/blob/b6a859c7c9297966de89735ea5e8f953df289ac1/src/parsers/filters/FilterChain.ts#L162)

#### Type Declaration

##### filterExecutions

> **filterExecutions**: `Record`\<`string`, [`FilterExecutionStats`](FilterExecutionStats.md)\>
