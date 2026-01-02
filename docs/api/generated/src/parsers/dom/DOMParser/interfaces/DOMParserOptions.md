[**amdWiki API v1.5.0**](../../../../../README.md)

***

[amdWiki API](../../../../../README.md) / [src/parsers/dom/DOMParser](../README.md) / DOMParserOptions

# Interface: DOMParserOptions

Defined in: [src/parsers/dom/DOMParser.ts:67](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/parsers/dom/DOMParser.ts#L67)

DOMParser options

## Properties

### debug?

> `optional` **debug**: `boolean`

Defined in: [src/parsers/dom/DOMParser.ts:69](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/parsers/dom/DOMParser.ts#L69)

Enable debug logging

***

### onError()?

> `optional` **onError**: (`error`) => `void`

Defined in: [src/parsers/dom/DOMParser.ts:73](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/parsers/dom/DOMParser.ts#L73)

Error callback

#### Parameters

##### error

[`ParseError`](../classes/ParseError.md)

#### Returns

`void`

***

### onWarning()?

> `optional` **onWarning**: (`warning`) => `void`

Defined in: [src/parsers/dom/DOMParser.ts:75](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/parsers/dom/DOMParser.ts#L75)

Warning callback

#### Parameters

##### warning

[`WarningInfo`](WarningInfo.md)

#### Returns

`void`

***

### throwOnError?

> `optional` **throwOnError**: `boolean`

Defined in: [src/parsers/dom/DOMParser.ts:71](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/parsers/dom/DOMParser.ts#L71)

Throw on parse errors instead of creating error document
