[**amdWiki API v1.5.0**](../../../../README.md)

***

[amdWiki API](../../../../README.md) / [src/parsers/MarkupParser](../README.md) / ExtendedMetrics

# Interface: ExtendedMetrics

Defined in: [src/parsers/MarkupParser.ts:243](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/parsers/MarkupParser.ts#L243)

Extended metrics returned by getMetrics()

## Extends

- [`ParserMetrics`](ParserMetrics.md)

## Properties

### averageParseTime

> **averageParseTime**: `number`

Defined in: [src/parsers/MarkupParser.ts:245](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/parsers/MarkupParser.ts#L245)

Average parse time

***

### cacheHitRatio

> **cacheHitRatio**: `number`

Defined in: [src/parsers/MarkupParser.ts:247](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/parsers/MarkupParser.ts#L247)

Cache hit ratio

***

### cacheHits

> **cacheHits**: `number`

Defined in: [src/parsers/MarkupParser.ts:187](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/parsers/MarkupParser.ts#L187)

Number of cache hits

#### Inherited from

[`ParserMetrics`](ParserMetrics.md).[`cacheHits`](ParserMetrics.md#cachehits)

***

### cacheMetrics

> **cacheMetrics**: `Map`\<`string`, [`CacheMetrics`](CacheMetrics.md)\>

Defined in: [src/parsers/MarkupParser.ts:191](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/parsers/MarkupParser.ts#L191)

Cache metrics by strategy

#### Inherited from

[`ParserMetrics`](ParserMetrics.md).[`cacheMetrics`](ParserMetrics.md#cachemetrics)

***

### cacheMisses

> **cacheMisses**: `number`

Defined in: [src/parsers/MarkupParser.ts:189](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/parsers/MarkupParser.ts#L189)

Number of cache misses

#### Inherited from

[`ParserMetrics`](ParserMetrics.md).[`cacheMisses`](ParserMetrics.md#cachemisses)

***

### cacheStrategies?

> `optional` **cacheStrategies**: `Record`\<`string`, `unknown`\>

Defined in: [src/parsers/MarkupParser.ts:253](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/parsers/MarkupParser.ts#L253)

Cache strategies stats

***

### errorCount

> **errorCount**: `number`

Defined in: [src/parsers/MarkupParser.ts:185](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/parsers/MarkupParser.ts#L185)

Number of errors

#### Inherited from

[`ParserMetrics`](ParserMetrics.md).[`errorCount`](ParserMetrics.md#errorcount)

***

### filterChain?

> `optional` **filterChain**: `unknown`

Defined in: [src/parsers/MarkupParser.ts:251](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/parsers/MarkupParser.ts#L251)

Filter chain stats

***

### handlerRegistry?

> `optional` **handlerRegistry**: `unknown`

Defined in: [src/parsers/MarkupParser.ts:249](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/parsers/MarkupParser.ts#L249)

Handler registry stats

***

### parseCount

> **parseCount**: `number`

Defined in: [src/parsers/MarkupParser.ts:181](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/parsers/MarkupParser.ts#L181)

Number of parses performed

#### Inherited from

[`ParserMetrics`](ParserMetrics.md).[`parseCount`](ParserMetrics.md#parsecount)

***

### performance?

> `optional` **performance**: `unknown`

Defined in: [src/parsers/MarkupParser.ts:255](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/parsers/MarkupParser.ts#L255)

Performance monitoring stats

***

### totalParseTime

> **totalParseTime**: `number`

Defined in: [src/parsers/MarkupParser.ts:183](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/parsers/MarkupParser.ts#L183)

Total parse time in milliseconds

#### Inherited from

[`ParserMetrics`](ParserMetrics.md).[`totalParseTime`](ParserMetrics.md#totalparsetime)
