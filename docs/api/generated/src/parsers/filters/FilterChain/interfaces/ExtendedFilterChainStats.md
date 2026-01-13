[**amdWiki API v1.5.0**](../../../../../README.md)

***

[amdWiki API](../../../../../README.md) / [src/parsers/filters/FilterChain](../README.md) / ExtendedFilterChainStats

# Interface: ExtendedFilterChainStats

Defined in: [src/parsers/filters/FilterChain.ts:131](https://github.com/jwilleke/amdWiki/blob/b6a859c7c9297966de89735ea5e8f953df289ac1/src/parsers/filters/FilterChain.ts#L131)

Extended filter chain statistics

## Properties

### chain

> **chain**: [`ChainStatsSummary`](ChainStatsSummary.md)

Defined in: [src/parsers/filters/FilterChain.ts:132](https://github.com/jwilleke/amdWiki/blob/b6a859c7c9297966de89735ea5e8f953df289ac1/src/parsers/filters/FilterChain.ts#L132)

***

### configuration

> **configuration**: `object`

Defined in: [src/parsers/filters/FilterChain.ts:134](https://github.com/jwilleke/amdWiki/blob/b6a859c7c9297966de89735ea5e8f953df289ac1/src/parsers/filters/FilterChain.ts#L134)

#### enabled

> **enabled**: `boolean`

#### enableProfiling

> **enableProfiling**: `boolean`

#### failOnError

> **failOnError**: `boolean`

#### maxFilters

> **maxFilters**: `number`

#### timeout

> **timeout**: `number`

***

### filters

> **filters**: `Record`\<`string`, [`FilterExecutionStats`](FilterExecutionStats.md) & `object`\>

Defined in: [src/parsers/filters/FilterChain.ts:133](https://github.com/jwilleke/amdWiki/blob/b6a859c7c9297966de89735ea5e8f953df289ac1/src/parsers/filters/FilterChain.ts#L133)

***

### performance

> **performance**: \{ `alertThresholds`: [`AlertThresholds`](AlertThresholds.md); `recentExecutionCount`: `number`; \} \| `null`

Defined in: [src/parsers/filters/FilterChain.ts:141](https://github.com/jwilleke/amdWiki/blob/b6a859c7c9297966de89735ea5e8f953df289ac1/src/parsers/filters/FilterChain.ts#L141)
