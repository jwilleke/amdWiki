[**amdWiki API v1.5.0**](../../../../../README.md)

***

[amdWiki API](../../../../../README.md) / [src/parsers/filters/FilterChain](../README.md) / ExtendedFilterChainStats

# Interface: ExtendedFilterChainStats

Defined in: [src/parsers/filters/FilterChain.ts:130](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/parsers/filters/FilterChain.ts#L130)

Extended filter chain statistics

## Properties

### chain

> **chain**: [`ChainStatsSummary`](ChainStatsSummary.md)

Defined in: [src/parsers/filters/FilterChain.ts:131](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/parsers/filters/FilterChain.ts#L131)

***

### configuration

> **configuration**: `object`

Defined in: [src/parsers/filters/FilterChain.ts:133](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/parsers/filters/FilterChain.ts#L133)

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

Defined in: [src/parsers/filters/FilterChain.ts:132](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/parsers/filters/FilterChain.ts#L132)

***

### performance

> **performance**: `object`

Defined in: [src/parsers/filters/FilterChain.ts:140](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/parsers/filters/FilterChain.ts#L140)

#### alertThresholds

> **alertThresholds**: [`AlertThresholds`](AlertThresholds.md)

#### recentExecutionCount

> **recentExecutionCount**: `number`
