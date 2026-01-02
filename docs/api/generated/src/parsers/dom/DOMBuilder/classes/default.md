[**amdWiki API v1.5.0**](../../../../../README.md)

***

[amdWiki API](../../../../../README.md) / [src/parsers/dom/DOMBuilder](../README.md) / default

# Class: default

Defined in: [src/parsers/dom/DOMBuilder.ts:122](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/parsers/dom/DOMBuilder.ts#L122)

DOMBuilder class

## Constructors

### Constructor

> **new default**(`wikiDocument`): `DOMBuilder`

Defined in: [src/parsers/dom/DOMBuilder.ts:143](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/parsers/dom/DOMBuilder.ts#L143)

Creates a new DOMBuilder

#### Parameters

##### wikiDocument

[`default`](../../WikiDocument/classes/default.md)

Target WikiDocument

#### Returns

`DOMBuilder`

## Methods

### adjustListStack()

> **adjustListStack**(`targetLevel`, `isOrdered`): `void`

Defined in: [src/parsers/dom/DOMBuilder.ts:513](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/parsers/dom/DOMBuilder.ts#L513)

Adjusts the list stack to match the desired level

#### Parameters

##### targetLevel

`number`

##### isOrdered

`boolean`

#### Returns

`void`

***

### buildFromTokens()

> **buildFromTokens**(`tokens`): [`default`](../../WikiDocument/classes/default.md)

Defined in: [src/parsers/dom/DOMBuilder.ts:157](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/parsers/dom/DOMBuilder.ts#L157)

Builds a DOM tree from an array of tokens

#### Parameters

##### tokens

[`Token`](../interfaces/Token.md)[]

Array of tokens from Tokenizer

#### Returns

[`default`](../../WikiDocument/classes/default.md)

The WikiDocument with built DOM

***

### closeAllLists()

> **closeAllLists**(): `void`

Defined in: [src/parsers/dom/DOMBuilder.ts:573](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/parsers/dom/DOMBuilder.ts#L573)

Closes all open lists

#### Returns

`void`

***

### closeCurrentParagraph()

> **closeCurrentParagraph**(): `void`

Defined in: [src/parsers/dom/DOMBuilder.ts:506](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/parsers/dom/DOMBuilder.ts#L506)

Closes the current paragraph context

#### Returns

`void`

***

### closeCurrentTable()

> **closeCurrentTable**(): `void`

Defined in: [src/parsers/dom/DOMBuilder.ts:580](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/parsers/dom/DOMBuilder.ts#L580)

Closes the current table context

#### Returns

`void`

***

### ensureParagraph()

> **ensureParagraph**(): `void`

Defined in: [src/parsers/dom/DOMBuilder.ts:491](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/parsers/dom/DOMBuilder.ts#L491)

Ensures a paragraph context exists for inline content

#### Returns

`void`

***

### handleBold()

> **handleBold**(`token`): `void`

Defined in: [src/parsers/dom/DOMBuilder.ts:418](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/parsers/dom/DOMBuilder.ts#L418)

Handles bold text __text__

#### Parameters

##### token

[`Token`](../interfaces/Token.md)

#### Returns

`void`

***

### handleCodeBlock()

> **handleCodeBlock**(`token`): `void`

Defined in: [src/parsers/dom/DOMBuilder.ts:448](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/parsers/dom/DOMBuilder.ts#L448)

Handles code blocks {{{code}}}

#### Parameters

##### token

[`Token`](../interfaces/Token.md)

#### Returns

`void`

***

### handleCodeInline()

> **handleCodeInline**(`token`): `void`

Defined in: [src/parsers/dom/DOMBuilder.ts:438](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/parsers/dom/DOMBuilder.ts#L438)

Handles inline code {{text}}

#### Parameters

##### token

[`Token`](../interfaces/Token.md)

#### Returns

`void`

***

### handleComment()

> **handleComment**(`token`): `void`

Defined in: [src/parsers/dom/DOMBuilder.ts:460](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/parsers/dom/DOMBuilder.ts#L460)

Handles HTML comments <!-- comment -->

#### Parameters

##### token

[`Token`](../interfaces/Token.md)

#### Returns

`void`

***

### handleEscaped()

> **handleEscaped**(`token`): `void`

Defined in: [src/parsers/dom/DOMBuilder.ts:259](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/parsers/dom/DOMBuilder.ts#L259)

Handles escaped text [[...]]
This is literal text that should not be parsed

#### Parameters

##### token

[`Token`](../interfaces/Token.md)

#### Returns

`void`

***

### handleHeading()

> **handleHeading**(`token`): `void`

Defined in: [src/parsers/dom/DOMBuilder.ts:345](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/parsers/dom/DOMBuilder.ts#L345)

Handles headings !, !!, !!!

#### Parameters

##### token

[`Token`](../interfaces/Token.md)

#### Returns

`void`

***

### handleInterWiki()

> **handleInterWiki**(`token`): `void`

Defined in: [src/parsers/dom/DOMBuilder.ts:331](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/parsers/dom/DOMBuilder.ts#L331)

Handles interwiki links [Wiki:Page]

#### Parameters

##### token

[`Token`](../interfaces/Token.md)

#### Returns

`void`

***

### handleItalic()

> **handleItalic**(`token`): `void`

Defined in: [src/parsers/dom/DOMBuilder.ts:428](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/parsers/dom/DOMBuilder.ts#L428)

Handles italic text ''text''

#### Parameters

##### token

[`Token`](../interfaces/Token.md)

#### Returns

`void`

***

### handleLink()

> **handleLink**(`token`): `void`

Defined in: [src/parsers/dom/DOMBuilder.ts:317](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/parsers/dom/DOMBuilder.ts#L317)

Handles links [link|text]

#### Parameters

##### token

[`Token`](../interfaces/Token.md)

#### Returns

`void`

***

### handleListItem()

> **handleListItem**(`token`): `void`

Defined in: [src/parsers/dom/DOMBuilder.ts:366](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/parsers/dom/DOMBuilder.ts#L366)

Handles list items *, #

#### Parameters

##### token

[`Token`](../interfaces/Token.md)

#### Returns

`void`

***

### handleNewline()

> **handleNewline**(`_token`): `void`

Defined in: [src/parsers/dom/DOMBuilder.ts:473](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/parsers/dom/DOMBuilder.ts#L473)

Handles newlines

#### Parameters

##### \_token

[`Token`](../interfaces/Token.md)

#### Returns

`void`

***

### handlePlugin()

> **handlePlugin**(`token`): `void`

Defined in: [src/parsers/dom/DOMBuilder.ts:282](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/parsers/dom/DOMBuilder.ts#L282)

Handles plugins [{PLUGIN ...}]
Creates inline span element to allow plugins within paragraphs

#### Parameters

##### token

[`Token`](../interfaces/Token.md)

#### Returns

`void`

***

### handleTableCell()

> **handleTableCell**(`token`): `void`

Defined in: [src/parsers/dom/DOMBuilder.ts:390](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/parsers/dom/DOMBuilder.ts#L390)

Handles table cells | cell |

#### Parameters

##### token

[`Token`](../interfaces/Token.md)

#### Returns

`void`

***

### handleText()

> **handleText**(`token`): `void`

Defined in: [src/parsers/dom/DOMBuilder.ts:249](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/parsers/dom/DOMBuilder.ts#L249)

Handles plain text tokens

#### Parameters

##### token

[`Token`](../interfaces/Token.md)

#### Returns

`void`

***

### handleVariable()

> **handleVariable**(`token`): `void`

Defined in: [src/parsers/dom/DOMBuilder.ts:268](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/parsers/dom/DOMBuilder.ts#L268)

Handles variables {$varname}

#### Parameters

##### token

[`Token`](../interfaces/Token.md)

#### Returns

`void`

***

### handleWikiTag()

> **handleWikiTag**(`token`): `void`

Defined in: [src/parsers/dom/DOMBuilder.ts:302](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/parsers/dom/DOMBuilder.ts#L302)

Handles wiki tags [tag]

#### Parameters

##### token

[`Token`](../interfaces/Token.md)

#### Returns

`void`

***

### processToken()

> **processToken**(`token`): `void`

Defined in: [src/parsers/dom/DOMBuilder.ts:186](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/parsers/dom/DOMBuilder.ts#L186)

Processes a single token

#### Parameters

##### token

[`Token`](../interfaces/Token.md)

Token to process

#### Returns

`void`
