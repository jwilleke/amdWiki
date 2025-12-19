[**amdWiki API v1.5.0**](../../../../README.md)

***

[amdWiki API](../../../../README.md) / [src/parsers/LinkParser](../README.md) / Link

# Class: Link

Defined in: [src/parsers/LinkParser.js:560](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/LinkParser.js#L560)

Link class representing a parsed link

## Constructors

### Constructor

> **new Link**(`data`): `Link`

Defined in: [src/parsers/LinkParser.js:561](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/LinkParser.js#L561)

#### Parameters

##### data

#### Returns

`Link`

## Properties

### attributes

> **attributes**: `any`

Defined in: [src/parsers/LinkParser.js:566](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/LinkParser.js#L566)

***

### attributesString

> **attributesString**: `any`

Defined in: [src/parsers/LinkParser.js:565](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/LinkParser.js#L565)

***

### endIndex

> **endIndex**: `any`

Defined in: [src/parsers/LinkParser.js:568](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/LinkParser.js#L568)

***

### originalText

> **originalText**: `any`

Defined in: [src/parsers/LinkParser.js:562](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/LinkParser.js#L562)

***

### startIndex

> **startIndex**: `any`

Defined in: [src/parsers/LinkParser.js:567](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/LinkParser.js#L567)

***

### target

> **target**: `any`

Defined in: [src/parsers/LinkParser.js:564](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/LinkParser.js#L564)

***

### text

> **text**: `any`

Defined in: [src/parsers/LinkParser.js:563](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/LinkParser.js#L563)

## Methods

### getAttribute()

> **getAttribute**(`name`): `string`

Defined in: [src/parsers/LinkParser.js:600](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/LinkParser.js#L600)

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

Defined in: [src/parsers/LinkParser.js:583](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/LinkParser.js#L583)

Get the effective target (target or text if no target)

#### Returns

`string`

Effective target

***

### hasAttributes()

> **hasAttributes**(): `boolean`

Defined in: [src/parsers/LinkParser.js:591](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/LinkParser.js#L591)

Check if link has attributes

#### Returns

`boolean`

True if has attributes

***

### isSimple()

> **isSimple**(): `boolean`

Defined in: [src/parsers/LinkParser.js:575](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/LinkParser.js#L575)

Check if this is a simple link (no target specified)

#### Returns

`boolean`

True if simple link

***

### setAttribute()

> **setAttribute**(`name`, `value`): `void`

Defined in: [src/parsers/LinkParser.js:609](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/LinkParser.js#L609)

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

> **toObject**(): `any`

Defined in: [src/parsers/LinkParser.js:619](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/LinkParser.js#L619)

Get link information as object

#### Returns

`any`

Link information
