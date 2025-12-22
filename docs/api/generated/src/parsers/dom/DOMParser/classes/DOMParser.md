[**amdWiki API v1.5.0**](../../../../../README.md)

***

[amdWiki API](../../../../../README.md) / [src/parsers/dom/DOMParser](../README.md) / DOMParser

# Class: DOMParser

Defined in: [src/parsers/dom/DOMParser.js:63](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/dom/DOMParser.js#L63)

DOMParser - Complete DOM-based parsing pipeline for wiki markup

============================================================================
ARCHITECTURE NOTE (Phase 4, Issue #118)
============================================================================

**This DOMParser is a REFERENCE IMPLEMENTATION and is NOT actively used
in the current rendering pipeline.**

This parser uses the Tokenizer → DOMBuilder pipeline, which was the Phase 0
approach to WikiDocument DOM parsing. However, it has been superseded by
the extraction-based approach in Phases 1-3.

CURRENT ACTIVE PIPELINE
------------------------

Use `MarkupParser.parseWithDOMExtraction()` instead of this DOMParser.

The new pipeline:

1. MarkupParser.extractJSPWikiSyntax() - Extract JSPWiki syntax
2. MarkupParser.createDOMNode() - Create DOM nodes
3. Showdown.makeHtml() - Process markdown
4. MarkupParser.mergeDOMNodes() - Merge nodes into HTML

WHY THIS DOMPARSER IS KEPT
---------------------------

- Reference implementation for token-based parsing
- Useful for understanding the tokenization approach
- May be enhanced for specific use cases in the future
- Educational value for understanding different parsing strategies

SEE ALSO:

- Tokenizer.js - For detailed architecture notes
- MarkupParser.parseWithDOMExtraction() - Current active pipeline
- Issue #114 - WikiDocument DOM Solution
- Issue #118 - Architecture documentation (this change)

============================================================================

ORIGINAL DESCRIPTION:
Integrates Tokenizer and DOMBuilder to convert wiki markup into
a structured WikiDocument DOM tree. Provides error handling, recovery,
and detailed error messages with position information.

This follows JSPWiki's MarkupParser architecture.

Key Features:

- Complete parsing pipeline (Tokenizer → DOMBuilder)
- Error handling with position tracking
- Helpful error messages
- Parse statistics and metadata
- Graceful degradation on errors

Part of Phase 2.5 of WikiDocument DOM Migration (GitHub Issue #93)

JSPWiki Reference:
<https://github.com/apache/jspwiki/blob/master/jspwiki-main/src/main/java/org/apache/wiki/parser/MarkupParser.java>

## Constructors

### Constructor

> **new DOMParser**(`options`): `DOMParser`

Defined in: [src/parsers/dom/DOMParser.js:73](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/dom/DOMParser.js#L73)

Creates a new DOMParser

#### Parameters

##### options

Parser options

###### debug

`boolean`

Enable debug mode

###### onError

`Function`

Error callback

###### onWarning

`Function`

Warning callback

###### throwOnError

`boolean`

Throw on parse errors (vs. recovery)

#### Returns

`DOMParser`

## Properties

### options

> **options**: `object`

Defined in: [src/parsers/dom/DOMParser.js:74](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/dom/DOMParser.js#L74)

#### debug

> **debug**: `boolean`

#### onError

> **onError**: `Function`

#### onWarning

> **onWarning**: `Function`

#### throwOnError

> **throwOnError**: `boolean`

***

### parseStats

> **parseStats**: `object`

Defined in: [src/parsers/dom/DOMParser.js:81](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/dom/DOMParser.js#L81)

#### failedParses

> **failedParses**: `number` = `0`

#### lastParseTime

> **lastParseTime**: `number` = `0`

#### successfulParses

> **successfulParses**: `number` = `0`

#### totalParses

> **totalParses**: `number` = `0`

#### totalParseTime

> **totalParseTime**: `number` = `0`

## Methods

### checkForWarnings()

> **checkForWarnings**(`tokens`, `result`): `void`

Defined in: [src/parsers/dom/DOMParser.js:290](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/dom/DOMParser.js#L290)

Checks tokens for common warnings

#### Parameters

##### tokens

`Token`[]

Tokens to check

##### result

`any`

Result object to add warnings to

#### Returns

`void`

***

### createErrorDocument()

> **createErrorDocument**(`content`, `context`, `error`): [`export=`](../../WikiDocument/classes/export=.md)

Defined in: [src/parsers/dom/DOMParser.js:202](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/dom/DOMParser.js#L202)

Creates an error document when parsing fails

This allows graceful degradation - the page will still render
but show the error to the user.

#### Parameters

##### content

`string`

Original content

##### context

`any`

Rendering context

##### error

`Error`

The error that occurred

#### Returns

[`export=`](../../WikiDocument/classes/export=.md)

Error document

***

### getStatistics()

> **getStatistics**(): `any`

Defined in: [src/parsers/dom/DOMParser.js:318](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/dom/DOMParser.js#L318)

Gets parser statistics

#### Returns

`any`

Parser statistics

***

### log()

> **log**(`message`): `void`

Defined in: [src/parsers/dom/DOMParser.js:348](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/dom/DOMParser.js#L348)

Logs debug message if debug mode enabled

#### Parameters

##### message

`string`

Message to log

#### Returns

`void`

***

### parse()

> **parse**(`content`, `context`): [`export=`](../../WikiDocument/classes/export=.md)

Defined in: [src/parsers/dom/DOMParser.js:101](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/dom/DOMParser.js#L101)

Parses wiki markup content into a WikiDocument

Main entry point for DOM-based parsing. This is equivalent to
JSPWiki's MarkupParser.parse() method.

#### Parameters

##### content

`string`

Wiki markup content to parse

##### context

`any` = `null`

Rendering context (page info, user, etc.)

#### Returns

[`export=`](../../WikiDocument/classes/export=.md)

Parsed WikiDocument with DOM tree

#### Throws

If throwOnError is true and parsing fails

***

### resetStatistics()

> **resetStatistics**(): `void`

Defined in: [src/parsers/dom/DOMParser.js:333](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/dom/DOMParser.js#L333)

Resets parser statistics

#### Returns

`void`

***

### validate()

> **validate**(`content`): `any`

Defined in: [src/parsers/dom/DOMParser.js:256](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/dom/DOMParser.js#L256)

Validates wiki markup without building full DOM

Useful for syntax checking before saving.

#### Parameters

##### content

`string`

Wiki markup to validate

#### Returns

`any`

Validation result { valid: boolean, errors: [], warnings: [] }
