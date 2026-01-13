[**amdWiki API v1.5.0**](../../../../README.md)

***

[amdWiki API](../../../../README.md) / [src/parsers/MarkupParser](../README.md) / MarkupParserConfig

# Interface: MarkupParserConfig

Defined in: [src/parsers/MarkupParser.ts:31](https://github.com/jwilleke/amdWiki/blob/b6a859c7c9297966de89735ea5e8f953df289ac1/src/parsers/MarkupParser.ts#L31)

Configuration for MarkupParser

## Extends

- `Record`\<`string`, `unknown`\>

## Indexable

\[`key`: `string`\]: `unknown`

## Properties

### cache

> **cache**: [`CacheConfig`](CacheConfig.md)

Defined in: [src/parsers/MarkupParser.ts:45](https://github.com/jwilleke/amdWiki/blob/b6a859c7c9297966de89735ea5e8f953df289ac1/src/parsers/MarkupParser.ts#L45)

Cache configuration

***

### cacheTTL

> **cacheTTL**: `number`

Defined in: [src/parsers/MarkupParser.ts:37](https://github.com/jwilleke/amdWiki/blob/b6a859c7c9297966de89735ea5e8f953df289ac1/src/parsers/MarkupParser.ts#L37)

Cache TTL in seconds

***

### caching

> **caching**: `boolean`

Defined in: [src/parsers/MarkupParser.ts:35](https://github.com/jwilleke/amdWiki/blob/b6a859c7c9297966de89735ea5e8f953df289ac1/src/parsers/MarkupParser.ts#L35)

Whether caching is enabled

***

### enabled

> **enabled**: `boolean`

Defined in: [src/parsers/MarkupParser.ts:33](https://github.com/jwilleke/amdWiki/blob/b6a859c7c9297966de89735ea5e8f953df289ac1/src/parsers/MarkupParser.ts#L33)

Whether MarkupParser is enabled

***

### filters

> **filters**: [`FilterConfig`](FilterConfig.md)

Defined in: [src/parsers/MarkupParser.ts:43](https://github.com/jwilleke/amdWiki/blob/b6a859c7c9297966de89735ea5e8f953df289ac1/src/parsers/MarkupParser.ts#L43)

Filter configuration

***

### handlerRegistry

> **handlerRegistry**: [`HandlerRegistryConfig`](HandlerRegistryConfig.md)

Defined in: [src/parsers/MarkupParser.ts:39](https://github.com/jwilleke/amdWiki/blob/b6a859c7c9297966de89735ea5e8f953df289ac1/src/parsers/MarkupParser.ts#L39)

Handler registry configuration

***

### handlers

> **handlers**: `Record`\<`string`, [`HandlerConfig`](HandlerConfig.md)\>

Defined in: [src/parsers/MarkupParser.ts:41](https://github.com/jwilleke/amdWiki/blob/b6a859c7c9297966de89735ea5e8f953df289ac1/src/parsers/MarkupParser.ts#L41)

Handler configurations

***

### performance

> **performance**: [`PerformanceConfig`](PerformanceConfig.md)

Defined in: [src/parsers/MarkupParser.ts:47](https://github.com/jwilleke/amdWiki/blob/b6a859c7c9297966de89735ea5e8f953df289ac1/src/parsers/MarkupParser.ts#L47)

Performance configuration
