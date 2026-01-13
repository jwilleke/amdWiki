[**amdWiki API v1.5.0**](../../../../README.md)

***

[amdWiki API](../../../../README.md) / [src/parsers/MarkupParser](../README.md) / ParserMetrics

# Interface: ParserMetrics

Defined in: [src/parsers/MarkupParser.ts:226](https://github.com/jwilleke/amdWiki/blob/b6a859c7c9297966de89735ea5e8f953df289ac1/src/parsers/MarkupParser.ts#L226)

Parser metrics

## Extended by

- [`ExtendedMetrics`](ExtendedMetrics.md)

## Properties

### cacheHits

> **cacheHits**: `number`

Defined in: [src/parsers/MarkupParser.ts:234](https://github.com/jwilleke/amdWiki/blob/b6a859c7c9297966de89735ea5e8f953df289ac1/src/parsers/MarkupParser.ts#L234)

Number of cache hits

***

### cacheMetrics

> **cacheMetrics**: `Map`\<`string`, [`CacheMetrics`](CacheMetrics.md)\>

Defined in: [src/parsers/MarkupParser.ts:238](https://github.com/jwilleke/amdWiki/blob/b6a859c7c9297966de89735ea5e8f953df289ac1/src/parsers/MarkupParser.ts#L238)

Cache metrics by strategy

***

### cacheMisses

> **cacheMisses**: `number`

Defined in: [src/parsers/MarkupParser.ts:236](https://github.com/jwilleke/amdWiki/blob/b6a859c7c9297966de89735ea5e8f953df289ac1/src/parsers/MarkupParser.ts#L236)

Number of cache misses

***

### errorCount

> **errorCount**: `number`

Defined in: [src/parsers/MarkupParser.ts:232](https://github.com/jwilleke/amdWiki/blob/b6a859c7c9297966de89735ea5e8f953df289ac1/src/parsers/MarkupParser.ts#L232)

Number of errors

***

### parseCount

> **parseCount**: `number`

Defined in: [src/parsers/MarkupParser.ts:228](https://github.com/jwilleke/amdWiki/blob/b6a859c7c9297966de89735ea5e8f953df289ac1/src/parsers/MarkupParser.ts#L228)

Number of parses performed

***

### totalParseTime

> **totalParseTime**: `number`

Defined in: [src/parsers/MarkupParser.ts:230](https://github.com/jwilleke/amdWiki/blob/b6a859c7c9297966de89735ea5e8f953df289ac1/src/parsers/MarkupParser.ts#L230)

Total parse time in milliseconds
