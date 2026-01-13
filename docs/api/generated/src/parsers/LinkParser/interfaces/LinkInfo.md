[**amdWiki API v1.5.0**](../../../../README.md)

***

[amdWiki API](../../../../README.md) / [src/parsers/LinkParser](../README.md) / LinkInfo

# Interface: LinkInfo

Defined in: [src/parsers/LinkParser.ts:166](https://github.com/jwilleke/amdWiki/blob/b6a859c7c9297966de89735ea5e8f953df289ac1/src/parsers/LinkParser.ts#L166)

Link information object returned by toObject()

## Properties

### attributes

> **attributes**: [`LinkAttributes`](LinkAttributes.md)

Defined in: [src/parsers/LinkParser.ts:174](https://github.com/jwilleke/amdWiki/blob/b6a859c7c9297966de89735ea5e8f953df289ac1/src/parsers/LinkParser.ts#L174)

Parsed attributes

***

### hasAttributes

> **hasAttributes**: `boolean`

Defined in: [src/parsers/LinkParser.ts:178](https://github.com/jwilleke/amdWiki/blob/b6a859c7c9297966de89735ea5e8f953df289ac1/src/parsers/LinkParser.ts#L178)

Whether the link has attributes

***

### isSimple

> **isSimple**: `boolean`

Defined in: [src/parsers/LinkParser.ts:176](https://github.com/jwilleke/amdWiki/blob/b6a859c7c9297966de89735ea5e8f953df289ac1/src/parsers/LinkParser.ts#L176)

Whether this is a simple link

***

### originalText

> **originalText**: `string`

Defined in: [src/parsers/LinkParser.ts:168](https://github.com/jwilleke/amdWiki/blob/b6a859c7c9297966de89735ea5e8f953df289ac1/src/parsers/LinkParser.ts#L168)

Original text from content

***

### target

> **target**: `string` \| `null`

Defined in: [src/parsers/LinkParser.ts:172](https://github.com/jwilleke/amdWiki/blob/b6a859c7c9297966de89735ea5e8f953df289ac1/src/parsers/LinkParser.ts#L172)

Target page or URL

***

### text

> **text**: `string`

Defined in: [src/parsers/LinkParser.ts:170](https://github.com/jwilleke/amdWiki/blob/b6a859c7c9297966de89735ea5e8f953df289ac1/src/parsers/LinkParser.ts#L170)

Display text for the link
