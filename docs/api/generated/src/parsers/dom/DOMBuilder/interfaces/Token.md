[**amdWiki API v1.5.0**](../../../../../README.md)

***

[amdWiki API](../../../../../README.md) / [src/parsers/dom/DOMBuilder](../README.md) / Token

# Interface: Token

Defined in: [src/parsers/dom/DOMBuilder.ts:81](https://github.com/jwilleke/amdWiki/blob/b6a859c7c9297966de89735ea5e8f953df289ac1/src/parsers/dom/DOMBuilder.ts#L81)

Token interface

## Indexable

\[`key`: `string`\]: `unknown`

Additional properties

## Properties

### column?

> `optional` **column**: `number`

Defined in: [src/parsers/dom/DOMBuilder.ts:91](https://github.com/jwilleke/amdWiki/blob/b6a859c7c9297966de89735ea5e8f953df289ac1/src/parsers/dom/DOMBuilder.ts#L91)

Column number

***

### line?

> `optional` **line**: `number`

Defined in: [src/parsers/dom/DOMBuilder.ts:89](https://github.com/jwilleke/amdWiki/blob/b6a859c7c9297966de89735ea5e8f953df289ac1/src/parsers/dom/DOMBuilder.ts#L89)

Line number

***

### metadata?

> `optional` **metadata**: [`TokenMetadata`](TokenMetadata.md)

Defined in: [src/parsers/dom/DOMBuilder.ts:87](https://github.com/jwilleke/amdWiki/blob/b6a859c7c9297966de89735ea5e8f953df289ac1/src/parsers/dom/DOMBuilder.ts#L87)

Token metadata

***

### type

> **type**: `string`

Defined in: [src/parsers/dom/DOMBuilder.ts:83](https://github.com/jwilleke/amdWiki/blob/b6a859c7c9297966de89735ea5e8f953df289ac1/src/parsers/dom/DOMBuilder.ts#L83)

Token type - can be TokenType enum or string for extensibility

***

### value

> **value**: `string`

Defined in: [src/parsers/dom/DOMBuilder.ts:85](https://github.com/jwilleke/amdWiki/blob/b6a859c7c9297966de89735ea5e8f953df289ac1/src/parsers/dom/DOMBuilder.ts#L85)

Token value
