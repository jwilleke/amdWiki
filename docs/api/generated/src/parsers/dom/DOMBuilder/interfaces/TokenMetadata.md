[**amdWiki API v1.5.0**](../../../../../README.md)

***

[amdWiki API](../../../../../README.md) / [src/parsers/dom/DOMBuilder](../README.md) / TokenMetadata

# Interface: TokenMetadata

Defined in: [src/parsers/dom/DOMBuilder.ts:64](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/parsers/dom/DOMBuilder.ts#L64)

Token metadata interface

## Indexable

\[`key`: `string`\]: `unknown`

Additional metadata properties

## Properties

### level?

> `optional` **level**: `number`

Defined in: [src/parsers/dom/DOMBuilder.ts:66](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/parsers/dom/DOMBuilder.ts#L66)

Heading level (for headings)

***

### link?

> `optional` **link**: `string`

Defined in: [src/parsers/dom/DOMBuilder.ts:70](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/parsers/dom/DOMBuilder.ts#L70)

Link target (for links)

***

### ordered?

> `optional` **ordered**: `boolean`

Defined in: [src/parsers/dom/DOMBuilder.ts:74](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/parsers/dom/DOMBuilder.ts#L74)

Whether list is ordered (for lists)

***

### text?

> `optional` **text**: `string`

Defined in: [src/parsers/dom/DOMBuilder.ts:72](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/parsers/dom/DOMBuilder.ts#L72)

Link text (for links)

***

### varName?

> `optional` **varName**: `string`

Defined in: [src/parsers/dom/DOMBuilder.ts:68](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/parsers/dom/DOMBuilder.ts#L68)

Variable name (for variables)
