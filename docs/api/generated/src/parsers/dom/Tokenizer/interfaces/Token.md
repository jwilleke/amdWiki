[**amdWiki API v1.5.0**](../../../../../README.md)

***

[amdWiki API](../../../../../README.md) / [src/parsers/dom/Tokenizer](../README.md) / Token

# Interface: Token

Defined in: [src/parsers/dom/Tokenizer.ts:138](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/parsers/dom/Tokenizer.ts#L138)

Token structure

## Extends

- [`PositionInfo`](PositionInfo.md)

## Indexable

\[`key`: `string`\]: `unknown`

Index signature for additional properties

## Properties

### column

> **column**: `number`

Defined in: [src/parsers/dom/Tokenizer.ts:132](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/parsers/dom/Tokenizer.ts#L132)

Column number

#### Inherited from

[`PositionInfo`](PositionInfo.md).[`column`](PositionInfo.md#column)

***

### line

> **line**: `number`

Defined in: [src/parsers/dom/Tokenizer.ts:130](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/parsers/dom/Tokenizer.ts#L130)

Line number

#### Inherited from

[`PositionInfo`](PositionInfo.md).[`line`](PositionInfo.md#line)

***

### metadata?

> `optional` **metadata**: [`TokenMetadata`](TokenMetadata.md)

Defined in: [src/parsers/dom/Tokenizer.ts:144](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/parsers/dom/Tokenizer.ts#L144)

Additional token-specific data

***

### position

> **position**: `number`

Defined in: [src/parsers/dom/Tokenizer.ts:128](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/parsers/dom/Tokenizer.ts#L128)

Character position in input

#### Inherited from

[`PositionInfo`](PositionInfo.md).[`position`](PositionInfo.md#position)

***

### type

> **type**: `string`

Defined in: [src/parsers/dom/Tokenizer.ts:140](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/parsers/dom/Tokenizer.ts#L140)

Token type from TokenType enum

***

### value

> **value**: `string`

Defined in: [src/parsers/dom/Tokenizer.ts:142](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/parsers/dom/Tokenizer.ts#L142)

Token value/content
