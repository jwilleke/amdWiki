[**amdWiki API v1.5.0**](../../../../README.md)

***

[amdWiki API](../../../../README.md) / [src/parsers/MarkupParser](../README.md) / ExtractedElement

# Interface: ExtractedElement

Defined in: [src/parsers/MarkupParser.ts:149](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/parsers/MarkupParser.ts#L149)

Extracted JSPWiki element

## Properties

### id

> **id**: `number`

Defined in: [src/parsers/MarkupParser.ts:155](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/parsers/MarkupParser.ts#L155)

Unique ID

***

### inner?

> `optional` **inner**: `string`

Defined in: [src/parsers/MarkupParser.ts:161](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/parsers/MarkupParser.ts#L161)

Plugin/tag inner content (for plugins)

***

### literal?

> `optional` **literal**: `string`

Defined in: [src/parsers/MarkupParser.ts:165](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/parsers/MarkupParser.ts#L165)

Escaped literal content (for escaped)

***

### position?

> `optional` **position**: `number`

Defined in: [src/parsers/MarkupParser.ts:157](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/parsers/MarkupParser.ts#L157)

Position in content

***

### syntax

> **syntax**: `string`

Defined in: [src/parsers/MarkupParser.ts:153](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/parsers/MarkupParser.ts#L153)

Original syntax

***

### target?

> `optional` **target**: `string`

Defined in: [src/parsers/MarkupParser.ts:163](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/parsers/MarkupParser.ts#L163)

Link target (for links)

***

### type

> **type**: `"link"` \| `"plugin"` \| `"variable"` \| `"escaped"`

Defined in: [src/parsers/MarkupParser.ts:151](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/parsers/MarkupParser.ts#L151)

Element type

***

### varName?

> `optional` **varName**: `string`

Defined in: [src/parsers/MarkupParser.ts:159](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/parsers/MarkupParser.ts#L159)

Variable name (for variables)
