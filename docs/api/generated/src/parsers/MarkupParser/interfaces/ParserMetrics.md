[**amdWiki API v1.5.0**](../../../../README.md)

***

[amdWiki API](../../../../README.md) / [src/parsers/MarkupParser](../README.md) / ParserMetrics

# Interface: ParserMetrics

Defined in: [src/parsers/MarkupParser.ts:179](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/parsers/MarkupParser.ts#L179)

Parser metrics

## Extended by

- [`ExtendedMetrics`](ExtendedMetrics.md)

## Properties

### cacheHits

> **cacheHits**: `number`

Defined in: [src/parsers/MarkupParser.ts:187](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/parsers/MarkupParser.ts#L187)

Number of cache hits

***

### cacheMetrics

> **cacheMetrics**: `Map`\<`string`, [`CacheMetrics`](CacheMetrics.md)\>

Defined in: [src/parsers/MarkupParser.ts:191](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/parsers/MarkupParser.ts#L191)

Cache metrics by strategy

***

### cacheMisses

> **cacheMisses**: `number`

Defined in: [src/parsers/MarkupParser.ts:189](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/parsers/MarkupParser.ts#L189)

Number of cache misses

***

### errorCount

> **errorCount**: `number`

Defined in: [src/parsers/MarkupParser.ts:185](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/parsers/MarkupParser.ts#L185)

Number of errors

***

### parseCount

> **parseCount**: `number`

Defined in: [src/parsers/MarkupParser.ts:181](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/parsers/MarkupParser.ts#L181)

Number of parses performed

***

### totalParseTime

> **totalParseTime**: `number`

Defined in: [src/parsers/MarkupParser.ts:183](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/parsers/MarkupParser.ts#L183)

Total parse time in milliseconds
