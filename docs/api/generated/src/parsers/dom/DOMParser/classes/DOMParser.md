[**amdWiki API v1.5.0**](../../../../../README.md)

***

[amdWiki API](../../../../../README.md) / [src/parsers/dom/DOMParser](../README.md) / DOMParser

# Class: DOMParser

Defined in: [src/parsers/dom/DOMParser.ts:169](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/parsers/dom/DOMParser.ts#L169)

DOMParser class

## Constructors

### Constructor

> **new DOMParser**(`options`): `DOMParser`

Defined in: [src/parsers/dom/DOMParser.ts:181](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/parsers/dom/DOMParser.ts#L181)

Creates a new DOMParser

#### Parameters

##### options

[`DOMParserOptions`](../interfaces/DOMParserOptions.md) = `{}`

Parser options

#### Returns

`DOMParser`

## Methods

### checkForWarnings()

> **checkForWarnings**(`tokens`, `result`): `void`

Defined in: [src/parsers/dom/DOMParser.ts:407](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/parsers/dom/DOMParser.ts#L407)

Checks tokens for common warnings

#### Parameters

##### tokens

[`Token`](../interfaces/Token.md)[]

Tokens to check

##### result

[`ValidationResult`](../interfaces/ValidationResult.md)

Result object to add warnings to

#### Returns

`void`

***

### createErrorDocument()

> **createErrorDocument**(`content`, `context`, `error`): [`default`](../../WikiDocument/classes/default.md)

Defined in: [src/parsers/dom/DOMParser.ts:316](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/parsers/dom/DOMParser.ts#L316)

Creates an error document when parsing fails

This allows graceful degradation - the page will still render
but show the error to the user.

#### Parameters

##### content

`string`

Original content

##### context

[`RenderContext`](../interfaces/RenderContext.md)

Rendering context

##### error

`Error`

The error that occurred

#### Returns

[`default`](../../WikiDocument/classes/default.md)

Error document

***

### getStatistics()

> **getStatistics**(): [`ExtendedStatistics`](../interfaces/ExtendedStatistics.md)

Defined in: [src/parsers/dom/DOMParser.ts:433](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/parsers/dom/DOMParser.ts#L433)

Gets parser statistics

#### Returns

[`ExtendedStatistics`](../interfaces/ExtendedStatistics.md)

Parser statistics

***

### log()

> **log**(`message`): `void`

Defined in: [src/parsers/dom/DOMParser.ts:463](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/parsers/dom/DOMParser.ts#L463)

Logs debug message if debug mode enabled

#### Parameters

##### message

`string`

Message to log

#### Returns

`void`

***

### parse()

> **parse**(`content`, `context`): [`default`](../../WikiDocument/classes/default.md)

Defined in: [src/parsers/dom/DOMParser.ts:209](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/parsers/dom/DOMParser.ts#L209)

Parses wiki markup content into a WikiDocument

Main entry point for DOM-based parsing. This is equivalent to
JSPWiki's MarkupParser.parse() method.

#### Parameters

##### content

`string`

Wiki markup content to parse

##### context

[`RenderContext`](../interfaces/RenderContext.md) = `null`

Rendering context (page info, user, etc.)

#### Returns

[`default`](../../WikiDocument/classes/default.md)

Parsed WikiDocument with DOM tree

#### Throws

ParseError if throwOnError is true and parsing fails

***

### resetStatistics()

> **resetStatistics**(): `void`

Defined in: [src/parsers/dom/DOMParser.ts:448](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/parsers/dom/DOMParser.ts#L448)

Resets parser statistics

#### Returns

`void`

***

### validate()

> **validate**(`content`): [`ValidationResult`](../interfaces/ValidationResult.md)

Defined in: [src/parsers/dom/DOMParser.ts:371](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/parsers/dom/DOMParser.ts#L371)

Validates wiki markup without building full DOM

Useful for syntax checking before saving.

#### Parameters

##### content

`string`

Wiki markup to validate

#### Returns

[`ValidationResult`](../interfaces/ValidationResult.md)

Validation result { valid: boolean, errors: [], warnings: [] }
