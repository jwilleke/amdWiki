[**amdWiki API v1.5.0**](../../../../../README.md)

***

[amdWiki API](../../../../../README.md) / [src/parsers/filters/FilterChain](../README.md) / ExportedChainState

# Interface: ExportedChainState

Defined in: [src/parsers/filters/FilterChain.ts:159](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/parsers/filters/FilterChain.ts#L159)

Exported chain state

## Properties

### config

> **config**: [`FilterChainConfig`](FilterChainConfig.md)

Defined in: [src/parsers/filters/FilterChain.ts:160](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/parsers/filters/FilterChain.ts#L160)

***

### filters

> **filters**: [`ExportedFilterInfo`](ExportedFilterInfo.md)[]

Defined in: [src/parsers/filters/FilterChain.ts:164](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/parsers/filters/FilterChain.ts#L164)

***

### stats

> **stats**: `Omit`\<[`FilterChainStats`](FilterChainStats.md), `"filterExecutions"`\> & `object`

Defined in: [src/parsers/filters/FilterChain.ts:161](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/parsers/filters/FilterChain.ts#L161)

#### Type Declaration

##### filterExecutions

> **filterExecutions**: `Record`\<`string`, [`FilterExecutionStats`](FilterExecutionStats.md)\>
