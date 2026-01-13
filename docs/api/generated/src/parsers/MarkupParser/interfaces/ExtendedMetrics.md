[**amdWiki API v1.5.0**](../../../../README.md)

***

[amdWiki API](../../../../README.md) / [src/parsers/MarkupParser](../README.md) / ExtendedMetrics

# Interface: ExtendedMetrics

Defined in: [src/parsers/MarkupParser.ts:290](https://github.com/jwilleke/amdWiki/blob/b6a859c7c9297966de89735ea5e8f953df289ac1/src/parsers/MarkupParser.ts#L290)

Extended metrics returned by getMetrics()

## Extends

- [`ParserMetrics`](ParserMetrics.md)

## Properties

### averageParseTime

> **averageParseTime**: `number`

Defined in: [src/parsers/MarkupParser.ts:292](https://github.com/jwilleke/amdWiki/blob/b6a859c7c9297966de89735ea5e8f953df289ac1/src/parsers/MarkupParser.ts#L292)

Average parse time

***

### cacheHitRatio

> **cacheHitRatio**: `number`

Defined in: [src/parsers/MarkupParser.ts:294](https://github.com/jwilleke/amdWiki/blob/b6a859c7c9297966de89735ea5e8f953df289ac1/src/parsers/MarkupParser.ts#L294)

Cache hit ratio

***

### cacheHits

> **cacheHits**: `number`

Defined in: [src/parsers/MarkupParser.ts:234](https://github.com/jwilleke/amdWiki/blob/b6a859c7c9297966de89735ea5e8f953df289ac1/src/parsers/MarkupParser.ts#L234)

Number of cache hits

#### Inherited from

[`ParserMetrics`](ParserMetrics.md).[`cacheHits`](ParserMetrics.md#cachehits)

***

### cacheMetrics

> **cacheMetrics**: `Map`\<`string`, [`CacheMetrics`](CacheMetrics.md)\>

Defined in: [src/parsers/MarkupParser.ts:238](https://github.com/jwilleke/amdWiki/blob/b6a859c7c9297966de89735ea5e8f953df289ac1/src/parsers/MarkupParser.ts#L238)

Cache metrics by strategy

#### Inherited from

[`ParserMetrics`](ParserMetrics.md).[`cacheMetrics`](ParserMetrics.md#cachemetrics)

***

### cacheMisses

> **cacheMisses**: `number`

Defined in: [src/parsers/MarkupParser.ts:236](https://github.com/jwilleke/amdWiki/blob/b6a859c7c9297966de89735ea5e8f953df289ac1/src/parsers/MarkupParser.ts#L236)

Number of cache misses

#### Inherited from

[`ParserMetrics`](ParserMetrics.md).[`cacheMisses`](ParserMetrics.md#cachemisses)

***

### cacheStrategies?

> `optional` **cacheStrategies**: `Record`\<`string`, `unknown`\>

Defined in: [src/parsers/MarkupParser.ts:300](https://github.com/jwilleke/amdWiki/blob/b6a859c7c9297966de89735ea5e8f953df289ac1/src/parsers/MarkupParser.ts#L300)

Cache strategies stats

***

### errorCount

> **errorCount**: `number`

Defined in: [src/parsers/MarkupParser.ts:232](https://github.com/jwilleke/amdWiki/blob/b6a859c7c9297966de89735ea5e8f953df289ac1/src/parsers/MarkupParser.ts#L232)

Number of errors

#### Inherited from

[`ParserMetrics`](ParserMetrics.md).[`errorCount`](ParserMetrics.md#errorcount)

***

### filterChain?

> `optional` **filterChain**: `unknown`

Defined in: [src/parsers/MarkupParser.ts:298](https://github.com/jwilleke/amdWiki/blob/b6a859c7c9297966de89735ea5e8f953df289ac1/src/parsers/MarkupParser.ts#L298)

Filter chain stats

***

### handlerRegistry?

> `optional` **handlerRegistry**: `unknown`

Defined in: [src/parsers/MarkupParser.ts:296](https://github.com/jwilleke/amdWiki/blob/b6a859c7c9297966de89735ea5e8f953df289ac1/src/parsers/MarkupParser.ts#L296)

Handler registry stats

***

### parseCount

> **parseCount**: `number`

Defined in: [src/parsers/MarkupParser.ts:228](https://github.com/jwilleke/amdWiki/blob/b6a859c7c9297966de89735ea5e8f953df289ac1/src/parsers/MarkupParser.ts#L228)

Number of parses performed

#### Inherited from

[`ParserMetrics`](ParserMetrics.md).[`parseCount`](ParserMetrics.md#parsecount)

***

### performance?

> `optional` **performance**: `unknown`

Defined in: [src/parsers/MarkupParser.ts:302](https://github.com/jwilleke/amdWiki/blob/b6a859c7c9297966de89735ea5e8f953df289ac1/src/parsers/MarkupParser.ts#L302)

Performance monitoring stats

***

### totalParseTime

> **totalParseTime**: `number`

Defined in: [src/parsers/MarkupParser.ts:230](https://github.com/jwilleke/amdWiki/blob/b6a859c7c9297966de89735ea5e8f953df289ac1/src/parsers/MarkupParser.ts#L230)

Total parse time in milliseconds

#### Inherited from

[`ParserMetrics`](ParserMetrics.md).[`totalParseTime`](ParserMetrics.md#totalparsetime)
