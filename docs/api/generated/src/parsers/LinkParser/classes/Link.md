[**amdWiki API v1.5.0**](../../../../README.md)

***

[amdWiki API](../../../../README.md) / [src/parsers/LinkParser](../README.md) / Link

# Class: Link

Defined in: [src/parsers/LinkParser.ts:721](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/parsers/LinkParser.ts#L721)

Link class representing a parsed link

## Constructors

### Constructor

> **new Link**(`data`): `Link`

Defined in: [src/parsers/LinkParser.ts:747](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/parsers/LinkParser.ts#L747)

Create a new Link instance

#### Parameters

##### data

[`LinkData`](../interfaces/LinkData.md) = `{}`

Link data

#### Returns

`Link`

## Properties

### attributes

> **attributes**: [`LinkAttributes`](../interfaces/LinkAttributes.md)

Defined in: [src/parsers/LinkParser.ts:735](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/parsers/LinkParser.ts#L735)

Parsed attributes object

***

### attributesString

> **attributesString**: `string`

Defined in: [src/parsers/LinkParser.ts:732](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/parsers/LinkParser.ts#L732)

Raw attributes string

***

### endIndex

> **endIndex**: `number`

Defined in: [src/parsers/LinkParser.ts:741](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/parsers/LinkParser.ts#L741)

End index in content

***

### originalText

> **originalText**: `string`

Defined in: [src/parsers/LinkParser.ts:723](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/parsers/LinkParser.ts#L723)

Original text from content

***

### startIndex

> **startIndex**: `number`

Defined in: [src/parsers/LinkParser.ts:738](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/parsers/LinkParser.ts#L738)

Start index in content

***

### target

> **target**: `string`

Defined in: [src/parsers/LinkParser.ts:729](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/parsers/LinkParser.ts#L729)

Target page or URL

***

### text

> **text**: `string`

Defined in: [src/parsers/LinkParser.ts:726](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/parsers/LinkParser.ts#L726)

Display text for the link

## Methods

### getAttribute()

> **getAttribute**(`name`): `string`

Defined in: [src/parsers/LinkParser.ts:786](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/parsers/LinkParser.ts#L786)

Get attribute value by name

#### Parameters

##### name

`string`

Attribute name

#### Returns

`string`

Attribute value

***

### getEffectiveTarget()

> **getEffectiveTarget**(): `string`

Defined in: [src/parsers/LinkParser.ts:769](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/parsers/LinkParser.ts#L769)

Get the effective target (target or text if no target)

#### Returns

`string`

Effective target

***

### hasAttributes()

> **hasAttributes**(): `boolean`

Defined in: [src/parsers/LinkParser.ts:777](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/parsers/LinkParser.ts#L777)

Check if link has attributes

#### Returns

`boolean`

True if has attributes

***

### isSimple()

> **isSimple**(): `boolean`

Defined in: [src/parsers/LinkParser.ts:761](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/parsers/LinkParser.ts#L761)

Check if this is a simple link (no target specified)

#### Returns

`boolean`

True if simple link

***

### setAttribute()

> **setAttribute**(`name`, `value`): `void`

Defined in: [src/parsers/LinkParser.ts:795](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/parsers/LinkParser.ts#L795)

Set attribute value

#### Parameters

##### name

`string`

Attribute name

##### value

`string`

Attribute value

#### Returns

`void`

***

### toObject()

> **toObject**(): [`LinkInfo`](../interfaces/LinkInfo.md)

Defined in: [src/parsers/LinkParser.ts:805](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/parsers/LinkParser.ts#L805)

Get link information as object

#### Returns

[`LinkInfo`](../interfaces/LinkInfo.md)

Link information
