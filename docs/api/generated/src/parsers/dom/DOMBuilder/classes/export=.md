[**amdWiki API v1.5.0**](../../../../../README.md)

***

[amdWiki API](../../../../../README.md) / [src/parsers/dom/DOMBuilder](../README.md) / export=

# Class: export=

Defined in: [src/parsers/dom/DOMBuilder.js:57](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/dom/DOMBuilder.js#L57)

DOMBuilder - Converts tokens into a WikiDocument DOM tree

============================================================================
ARCHITECTURE NOTE (Phase 4, Issue #118)
============================================================================

**This DOMBuilder is a REFERENCE IMPLEMENTATION and is NOT actively used
in the current rendering pipeline.**

This builder converts tokens from the Tokenizer into a WikiDocument DOM.
It was part of the Phase 0 tokenization-based parsing approach, which has
been superseded by the extraction-based approach in Phases 1-3.

CURRENT ACTIVE APPROACH
------------------------

DOM nodes are now created directly from extracted elements using:

- DOMVariableHandler.createNodeFromExtract()
- DOMPluginHandler.createNodeFromExtract()
- DOMLinkHandler.createNodeFromExtract()
- MarkupParser.createTextNodeForEscaped()

These methods create DOM nodes directly without going through tokenization.

WHY THIS DOMBUILDER IS KEPT
----------------------------

- Reference for token-to-DOM conversion patterns
- Understanding of DOM tree construction
- May be useful for future enhancements
- Educational value

SEE ALSO:

- Tokenizer.js - Detailed architecture notes
- DOMParser.js - Pipeline documentation
- MarkupParser.parseWithDOMExtraction() - Current active pipeline
- Issue #114 - WikiDocument DOM Solution
- Issue #118 - Architecture documentation (this change)

============================================================================

ORIGINAL DESCRIPTION:
Takes an array of tokens from the Tokenizer and builds a structured
DOM tree in a WikiDocument. Handles nesting, formatting, and all
JSPWiki-compatible markup elements.

Key Features:

- Converts tokens to DOM nodes
- Handles nested structures (lists, tables)
- Manages formatting contexts (bold, italic)
- Creates semantic HTML elements

Part of Phase 2.4 of WikiDocument DOM Migration (GitHub Issue #93)

## Constructors

### Constructor

> **new export=**(`wikiDocument`): `DOMBuilder`

Defined in: [src/parsers/dom/DOMBuilder.js:63](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/dom/DOMBuilder.js#L63)

Creates a new DOMBuilder

#### Parameters

##### wikiDocument

[`export=`](../../WikiDocument/classes/export=.md)

Target WikiDocument

#### Returns

`DOMBuilder`

## Properties

### currentParent

> **currentParent**: `Element`

Defined in: [src/parsers/dom/DOMBuilder.js:65](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/dom/DOMBuilder.js#L65)

***

### listStack

> **listStack**: `any`[]

Defined in: [src/parsers/dom/DOMBuilder.js:66](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/dom/DOMBuilder.js#L66)

***

### paragraphContext

> **paragraphContext**: `Element`

Defined in: [src/parsers/dom/DOMBuilder.js:68](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/dom/DOMBuilder.js#L68)

***

### tableContext

> **tableContext**: `object`

Defined in: [src/parsers/dom/DOMBuilder.js:67](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/dom/DOMBuilder.js#L67)

#### currentRow

> **currentRow**: `any` = `null`

#### table

> **table**: `Element`

***

### wikiDocument

> **wikiDocument**: [`export=`](../../WikiDocument/classes/export=.md)

Defined in: [src/parsers/dom/DOMBuilder.js:64](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/dom/DOMBuilder.js#L64)

## Methods

### adjustListStack()

> **adjustListStack**(`targetLevel`, `isOrdered`): `void`

Defined in: [src/parsers/dom/DOMBuilder.js:433](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/dom/DOMBuilder.js#L433)

Adjusts the list stack to match the desired level

#### Parameters

##### targetLevel

`any`

##### isOrdered

`any`

#### Returns

`void`

***

### buildFromTokens()

> **buildFromTokens**(`tokens`): [`export=`](../../WikiDocument/classes/export=.md)

Defined in: [src/parsers/dom/DOMBuilder.js:77](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/dom/DOMBuilder.js#L77)

Builds a DOM tree from an array of tokens

#### Parameters

##### tokens

`Token`[]

Array of tokens from Tokenizer

#### Returns

[`export=`](../../WikiDocument/classes/export=.md)

The WikiDocument with built DOM

***

### closeAllLists()

> **closeAllLists**(): `void`

Defined in: [src/parsers/dom/DOMBuilder.js:493](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/dom/DOMBuilder.js#L493)

Closes all open lists

#### Returns

`void`

***

### closeCurrentParagraph()

> **closeCurrentParagraph**(): `void`

Defined in: [src/parsers/dom/DOMBuilder.js:426](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/dom/DOMBuilder.js#L426)

Closes the current paragraph context

#### Returns

`void`

***

### closeCurrentTable()

> **closeCurrentTable**(): `void`

Defined in: [src/parsers/dom/DOMBuilder.js:500](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/dom/DOMBuilder.js#L500)

Closes the current table context

#### Returns

`void`

***

### ensureParagraph()

> **ensureParagraph**(): `void`

Defined in: [src/parsers/dom/DOMBuilder.js:411](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/dom/DOMBuilder.js#L411)

Ensures a paragraph context exists for inline content

#### Returns

`void`

***

### handleBold()

> **handleBold**(`token`): `void`

Defined in: [src/parsers/dom/DOMBuilder.js:338](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/dom/DOMBuilder.js#L338)

Handles bold text **text**

#### Parameters

##### token

`any`

#### Returns

`void`

***

### handleCodeBlock()

> **handleCodeBlock**(`token`): `void`

Defined in: [src/parsers/dom/DOMBuilder.js:368](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/dom/DOMBuilder.js#L368)

Handles code blocks {{{code}}}

#### Parameters

##### token

`any`

#### Returns

`void`

***

### handleCodeInline()

> **handleCodeInline**(`token`): `void`

Defined in: [src/parsers/dom/DOMBuilder.js:358](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/dom/DOMBuilder.js#L358)

Handles inline code {{text}}

#### Parameters

##### token

`any`

#### Returns

`void`

***

### handleComment()

> **handleComment**(`token`): `void`

Defined in: [src/parsers/dom/DOMBuilder.js:380](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/dom/DOMBuilder.js#L380)

Handles HTML comments <!-- comment -->

#### Parameters

##### token

`any`

#### Returns

`void`

***

### handleEscaped()

> **handleEscaped**(`token`): `void`

Defined in: [src/parsers/dom/DOMBuilder.js:179](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/dom/DOMBuilder.js#L179)

Handles escaped text [[...]]
This is literal text that should not be parsed

#### Parameters

##### token

`any`

#### Returns

`void`

***

### handleHeading()

> **handleHeading**(`token`): `void`

Defined in: [src/parsers/dom/DOMBuilder.js:265](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/dom/DOMBuilder.js#L265)

Handles headings !, !!, !!!

#### Parameters

##### token

`any`

#### Returns

`void`

***

### handleInterWiki()

> **handleInterWiki**(`token`): `void`

Defined in: [src/parsers/dom/DOMBuilder.js:251](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/dom/DOMBuilder.js#L251)

Handles interwiki links [Wiki:Page]

#### Parameters

##### token

`any`

#### Returns

`void`

***

### handleItalic()

> **handleItalic**(`token`): `void`

Defined in: [src/parsers/dom/DOMBuilder.js:348](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/dom/DOMBuilder.js#L348)

Handles italic text ''text''

#### Parameters

##### token

`any`

#### Returns

`void`

***

### handleLink()

> **handleLink**(`token`): `void`

Defined in: [src/parsers/dom/DOMBuilder.js:237](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/dom/DOMBuilder.js#L237)

Handles links [link|text]

#### Parameters

##### token

`any`

#### Returns

`void`

***

### handleListItem()

> **handleListItem**(`token`): `void`

Defined in: [src/parsers/dom/DOMBuilder.js:286](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/dom/DOMBuilder.js#L286)

Handles list items *, #

#### Parameters

##### token

`any`

#### Returns

`void`

***

### handleNewline()

> **handleNewline**(`token`): `void`

Defined in: [src/parsers/dom/DOMBuilder.js:393](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/dom/DOMBuilder.js#L393)

Handles newlines

#### Parameters

##### token

`any`

#### Returns

`void`

***

### handlePlugin()

> **handlePlugin**(`token`): `void`

Defined in: [src/parsers/dom/DOMBuilder.js:202](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/dom/DOMBuilder.js#L202)

Handles plugins [{PLUGIN ...}]
Creates inline span element to allow plugins within paragraphs

#### Parameters

##### token

`any`

#### Returns

`void`

***

### handleTableCell()

> **handleTableCell**(`token`): `void`

Defined in: [src/parsers/dom/DOMBuilder.js:310](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/dom/DOMBuilder.js#L310)

Handles table cells | cell |

#### Parameters

##### token

`any`

#### Returns

`void`

***

### handleText()

> **handleText**(`token`): `void`

Defined in: [src/parsers/dom/DOMBuilder.js:169](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/dom/DOMBuilder.js#L169)

Handles plain text tokens

#### Parameters

##### token

`any`

#### Returns

`void`

***

### handleVariable()

> **handleVariable**(`token`): `void`

Defined in: [src/parsers/dom/DOMBuilder.js:188](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/dom/DOMBuilder.js#L188)

Handles variables {$varname}

#### Parameters

##### token

`any`

#### Returns

`void`

***

### handleWikiTag()

> **handleWikiTag**(`token`): `void`

Defined in: [src/parsers/dom/DOMBuilder.js:222](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/dom/DOMBuilder.js#L222)

Handles wiki tags [tag]

#### Parameters

##### token

`any`

#### Returns

`void`

***

### processToken()

> **processToken**(`token`): `void`

Defined in: [src/parsers/dom/DOMBuilder.js:106](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/dom/DOMBuilder.js#L106)

Processes a single token

#### Parameters

##### token

`Token`

Token to process

#### Returns

`void`
