[**amdWiki API v1.5.0**](../../../../README.md)

***

[amdWiki API](../../../../README.md) / [src/parsers/MarkupParser](../README.md) / PerformanceMonitor

# Interface: PerformanceMonitor

Defined in: [src/parsers/MarkupParser.ts:205](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/parsers/MarkupParser.ts#L205)

Performance monitor state

## Properties

### alerts

> **alerts**: [`PerformanceAlert`](PerformanceAlert.md)[]

Defined in: [src/parsers/MarkupParser.ts:207](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/parsers/MarkupParser.ts#L207)

Performance alerts

***

### checkInterval

> **checkInterval**: `number`

Defined in: [src/parsers/MarkupParser.ts:211](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/parsers/MarkupParser.ts#L211)

Check interval in milliseconds

***

### lastCheck

> **lastCheck**: `number`

Defined in: [src/parsers/MarkupParser.ts:209](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/parsers/MarkupParser.ts#L209)

Last check timestamp

***

### maxRecentEntries

> **maxRecentEntries**: `number`

Defined in: [src/parsers/MarkupParser.ts:217](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/parsers/MarkupParser.ts#L217)

Maximum recent entries to keep

***

### recentErrorRates

> **recentErrorRates**: `number`[]

Defined in: [src/parsers/MarkupParser.ts:215](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/parsers/MarkupParser.ts#L215)

Recent error rates

***

### recentParseTimes

> **recentParseTimes**: [`ParseTimeEntry`](ParseTimeEntry.md)[]

Defined in: [src/parsers/MarkupParser.ts:213](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/parsers/MarkupParser.ts#L213)

Recent parse times
