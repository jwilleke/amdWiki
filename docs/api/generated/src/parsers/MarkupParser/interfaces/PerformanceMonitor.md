[**amdWiki API v1.5.0**](../../../../README.md)

***

[amdWiki API](../../../../README.md) / [src/parsers/MarkupParser](../README.md) / PerformanceMonitor

# Interface: PerformanceMonitor

Defined in: [src/parsers/MarkupParser.ts:252](https://github.com/jwilleke/amdWiki/blob/b6a859c7c9297966de89735ea5e8f953df289ac1/src/parsers/MarkupParser.ts#L252)

Performance monitor state

## Properties

### alerts

> **alerts**: [`PerformanceAlert`](PerformanceAlert.md)[]

Defined in: [src/parsers/MarkupParser.ts:254](https://github.com/jwilleke/amdWiki/blob/b6a859c7c9297966de89735ea5e8f953df289ac1/src/parsers/MarkupParser.ts#L254)

Performance alerts

***

### checkInterval

> **checkInterval**: `number`

Defined in: [src/parsers/MarkupParser.ts:258](https://github.com/jwilleke/amdWiki/blob/b6a859c7c9297966de89735ea5e8f953df289ac1/src/parsers/MarkupParser.ts#L258)

Check interval in milliseconds

***

### lastCheck

> **lastCheck**: `number`

Defined in: [src/parsers/MarkupParser.ts:256](https://github.com/jwilleke/amdWiki/blob/b6a859c7c9297966de89735ea5e8f953df289ac1/src/parsers/MarkupParser.ts#L256)

Last check timestamp

***

### maxRecentEntries

> **maxRecentEntries**: `number`

Defined in: [src/parsers/MarkupParser.ts:264](https://github.com/jwilleke/amdWiki/blob/b6a859c7c9297966de89735ea5e8f953df289ac1/src/parsers/MarkupParser.ts#L264)

Maximum recent entries to keep

***

### recentErrorRates

> **recentErrorRates**: `number`[]

Defined in: [src/parsers/MarkupParser.ts:262](https://github.com/jwilleke/amdWiki/blob/b6a859c7c9297966de89735ea5e8f953df289ac1/src/parsers/MarkupParser.ts#L262)

Recent error rates

***

### recentParseTimes

> **recentParseTimes**: [`ParseTimeEntry`](ParseTimeEntry.md)[]

Defined in: [src/parsers/MarkupParser.ts:260](https://github.com/jwilleke/amdWiki/blob/b6a859c7c9297966de89735ea5e8f953df289ac1/src/parsers/MarkupParser.ts#L260)

Recent parse times
