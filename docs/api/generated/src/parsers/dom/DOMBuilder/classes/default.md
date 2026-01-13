[**amdWiki API v1.5.0**](../../../../../README.md)

***

[amdWiki API](../../../../../README.md) / [src/parsers/dom/DOMBuilder](../README.md) / default

# Class: default

Defined in: [src/parsers/dom/DOMBuilder.ts:121](https://github.com/jwilleke/amdWiki/blob/b6a859c7c9297966de89735ea5e8f953df289ac1/src/parsers/dom/DOMBuilder.ts#L121)

DOMBuilder class

## Constructors

### Constructor

> **new default**(`wikiDocument`): `DOMBuilder`

Defined in: [src/parsers/dom/DOMBuilder.ts:142](https://github.com/jwilleke/amdWiki/blob/b6a859c7c9297966de89735ea5e8f953df289ac1/src/parsers/dom/DOMBuilder.ts#L142)

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

Defined in: [src/parsers/dom/DOMBuilder.ts:522](https://github.com/jwilleke/amdWiki/blob/b6a859c7c9297966de89735ea5e8f953df289ac1/src/parsers/dom/DOMBuilder.ts#L522)

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

Defined in: [src/parsers/dom/DOMBuilder.ts:156](https://github.com/jwilleke/amdWiki/blob/b6a859c7c9297966de89735ea5e8f953df289ac1/src/parsers/dom/DOMBuilder.ts#L156)

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

Defined in: [src/parsers/dom/DOMBuilder.ts:582](https://github.com/jwilleke/amdWiki/blob/b6a859c7c9297966de89735ea5e8f953df289ac1/src/parsers/dom/DOMBuilder.ts#L582)

Closes all open lists

#### Returns

`void`

***

### closeCurrentParagraph()

> **closeCurrentParagraph**(): `void`

Defined in: [src/parsers/dom/DOMBuilder.ts:515](https://github.com/jwilleke/amdWiki/blob/b6a859c7c9297966de89735ea5e8f953df289ac1/src/parsers/dom/DOMBuilder.ts#L515)

Closes the current paragraph context

#### Returns

`void`

***

### closeCurrentTable()

> **closeCurrentTable**(): `void`

Defined in: [src/parsers/dom/DOMBuilder.ts:589](https://github.com/jwilleke/amdWiki/blob/b6a859c7c9297966de89735ea5e8f953df289ac1/src/parsers/dom/DOMBuilder.ts#L589)

Closes the current table context

#### Returns

`void`

***

### ensureParagraph()

> **ensureParagraph**(): `void`

Defined in: [src/parsers/dom/DOMBuilder.ts:498](https://github.com/jwilleke/amdWiki/blob/b6a859c7c9297966de89735ea5e8f953df289ac1/src/parsers/dom/DOMBuilder.ts#L498)

Ensures a paragraph context exists for inline content

#### Returns

`void`

***

### handleBold()

> **handleBold**(`token`): `void`

Defined in: [src/parsers/dom/DOMBuilder.ts:423](https://github.com/jwilleke/amdWiki/blob/b6a859c7c9297966de89735ea5e8f953df289ac1/src/parsers/dom/DOMBuilder.ts#L423)

Handles bold text __text__

#### Parameters

##### token

[`Token`](../interfaces/Token.md)

#### Returns

`void`

***

### handleCodeBlock()

> **handleCodeBlock**(`token`): `void`

Defined in: [src/parsers/dom/DOMBuilder.ts:453](https://github.com/jwilleke/amdWiki/blob/b6a859c7c9297966de89735ea5e8f953df289ac1/src/parsers/dom/DOMBuilder.ts#L453)

Handles code blocks {{{code}}}

#### Parameters

##### token

[`Token`](../interfaces/Token.md)

#### Returns

`void`

***

### handleCodeInline()

> **handleCodeInline**(`token`): `void`

Defined in: [src/parsers/dom/DOMBuilder.ts:443](https://github.com/jwilleke/amdWiki/blob/b6a859c7c9297966de89735ea5e8f953df289ac1/src/parsers/dom/DOMBuilder.ts#L443)

Handles inline code {{text}}

#### Parameters

##### token

[`Token`](../interfaces/Token.md)

#### Returns

`void`

***

### handleComment()

> **handleComment**(`token`): `void`

Defined in: [src/parsers/dom/DOMBuilder.ts:467](https://github.com/jwilleke/amdWiki/blob/b6a859c7c9297966de89735ea5e8f953df289ac1/src/parsers/dom/DOMBuilder.ts#L467)

Handles HTML comments <!-- comment -->

#### Parameters

##### token

[`Token`](../interfaces/Token.md)

#### Returns

`void`

***

### handleEscaped()

> **handleEscaped**(`token`): `void`

Defined in: [src/parsers/dom/DOMBuilder.ts:260](https://github.com/jwilleke/amdWiki/blob/b6a859c7c9297966de89735ea5e8f953df289ac1/src/parsers/dom/DOMBuilder.ts#L260)

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

Defined in: [src/parsers/dom/DOMBuilder.ts:346](https://github.com/jwilleke/amdWiki/blob/b6a859c7c9297966de89735ea5e8f953df289ac1/src/parsers/dom/DOMBuilder.ts#L346)

Handles headings !, !!, !!!

#### Parameters

##### token

[`Token`](../interfaces/Token.md)

#### Returns

`void`

***

### handleInterWiki()

> **handleInterWiki**(`token`): `void`

Defined in: [src/parsers/dom/DOMBuilder.ts:332](https://github.com/jwilleke/amdWiki/blob/b6a859c7c9297966de89735ea5e8f953df289ac1/src/parsers/dom/DOMBuilder.ts#L332)

Handles interwiki links [Wiki:Page]

#### Parameters

##### token

[`Token`](../interfaces/Token.md)

#### Returns

`void`

***

### handleItalic()

> **handleItalic**(`token`): `void`

Defined in: [src/parsers/dom/DOMBuilder.ts:433](https://github.com/jwilleke/amdWiki/blob/b6a859c7c9297966de89735ea5e8f953df289ac1/src/parsers/dom/DOMBuilder.ts#L433)

Handles italic text ''text''

#### Parameters

##### token

[`Token`](../interfaces/Token.md)

#### Returns

`void`

***

### handleLink()

> **handleLink**(`token`): `void`

Defined in: [src/parsers/dom/DOMBuilder.ts:318](https://github.com/jwilleke/amdWiki/blob/b6a859c7c9297966de89735ea5e8f953df289ac1/src/parsers/dom/DOMBuilder.ts#L318)

Handles links [link|text]

#### Parameters

##### token

[`Token`](../interfaces/Token.md)

#### Returns

`void`

***

### handleListItem()

> **handleListItem**(`token`): `void`

Defined in: [src/parsers/dom/DOMBuilder.ts:369](https://github.com/jwilleke/amdWiki/blob/b6a859c7c9297966de89735ea5e8f953df289ac1/src/parsers/dom/DOMBuilder.ts#L369)

Handles list items *, #

#### Parameters

##### token

[`Token`](../interfaces/Token.md)

#### Returns

`void`

***

### handleNewline()

> **handleNewline**(`_token`): `void`

Defined in: [src/parsers/dom/DOMBuilder.ts:480](https://github.com/jwilleke/amdWiki/blob/b6a859c7c9297966de89735ea5e8f953df289ac1/src/parsers/dom/DOMBuilder.ts#L480)

Handles newlines

#### Parameters

##### \_token

[`Token`](../interfaces/Token.md)

#### Returns

`void`

***

### handlePlugin()

> **handlePlugin**(`token`): `void`

Defined in: [src/parsers/dom/DOMBuilder.ts:283](https://github.com/jwilleke/amdWiki/blob/b6a859c7c9297966de89735ea5e8f953df289ac1/src/parsers/dom/DOMBuilder.ts#L283)

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

Defined in: [src/parsers/dom/DOMBuilder.ts:393](https://github.com/jwilleke/amdWiki/blob/b6a859c7c9297966de89735ea5e8f953df289ac1/src/parsers/dom/DOMBuilder.ts#L393)

Handles table cells | cell |

#### Parameters

##### token

[`Token`](../interfaces/Token.md)

#### Returns

`void`

***

### handleText()

> **handleText**(`token`): `void`

Defined in: [src/parsers/dom/DOMBuilder.ts:250](https://github.com/jwilleke/amdWiki/blob/b6a859c7c9297966de89735ea5e8f953df289ac1/src/parsers/dom/DOMBuilder.ts#L250)

Handles plain text tokens

#### Parameters

##### token

[`Token`](../interfaces/Token.md)

#### Returns

`void`

***

### handleVariable()

> **handleVariable**(`token`): `void`

Defined in: [src/parsers/dom/DOMBuilder.ts:269](https://github.com/jwilleke/amdWiki/blob/b6a859c7c9297966de89735ea5e8f953df289ac1/src/parsers/dom/DOMBuilder.ts#L269)

Handles variables {$varname}

#### Parameters

##### token

[`Token`](../interfaces/Token.md)

#### Returns

`void`

***

### handleWikiTag()

> **handleWikiTag**(`token`): `void`

Defined in: [src/parsers/dom/DOMBuilder.ts:303](https://github.com/jwilleke/amdWiki/blob/b6a859c7c9297966de89735ea5e8f953df289ac1/src/parsers/dom/DOMBuilder.ts#L303)

Handles wiki tags [tag]

#### Parameters

##### token

[`Token`](../interfaces/Token.md)

#### Returns

`void`

***

### processToken()

> **processToken**(`token`): `void`

Defined in: [src/parsers/dom/DOMBuilder.ts:185](https://github.com/jwilleke/amdWiki/blob/b6a859c7c9297966de89735ea5e8f953df289ac1/src/parsers/dom/DOMBuilder.ts#L185)

Processes a single token

#### Parameters

##### token

[`Token`](../interfaces/Token.md)

Token to process

#### Returns

`void`
