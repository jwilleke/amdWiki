[**amdWiki API v1.5.0**](../../../../README.md)

***

[amdWiki API](../../../../README.md) / [src/parsers/LinkParser](../README.md) / LinkParser

# Class: LinkParser

Defined in: [src/parsers/LinkParser.ts:188](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/parsers/LinkParser.ts#L188)

Main LinkParser class

## Constructors

### Constructor

> **new LinkParser**(`options?`): `LinkParser`

Defined in: [src/parsers/LinkParser.ts:210](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/parsers/LinkParser.ts#L210)

Create a new LinkParser instance

#### Parameters

##### options?

`Partial`\<[`LinkParserOptions`](../interfaces/LinkParserOptions.md)\> = `{}`

Configuration options

#### Returns

`LinkParser`

## Properties

### interWikiSites

> **interWikiSites**: `Map`\<`string`, [`InterWikiSiteConfig`](../interfaces/InterWikiSiteConfig.md)\>

Defined in: [src/parsers/LinkParser.ts:199](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/parsers/LinkParser.ts#L199)

InterWiki sites configuration

***

### linkPattern

> **linkPattern**: `RegExp`

Defined in: [src/parsers/LinkParser.ts:202](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/parsers/LinkParser.ts#L202)

Link pattern regex

***

### options

> **options**: [`LinkParserOptions`](../interfaces/LinkParserOptions.md)

Defined in: [src/parsers/LinkParser.ts:190](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/parsers/LinkParser.ts#L190)

Parser configuration options

***

### pageNameMatcher

> **pageNameMatcher**: [`default`](../../../utils/PageNameMatcher/classes/default.md)

Defined in: [src/parsers/LinkParser.ts:196](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/parsers/LinkParser.ts#L196)

Page name matcher for fuzzy matching

***

### pageNames

> **pageNames**: `Set`\<`string`\>

Defined in: [src/parsers/LinkParser.ts:193](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/parsers/LinkParser.ts#L193)

Cache of available page names

## Methods

### addPageName()

> **addPageName**(`pageName`): `void`

Defined in: [src/parsers/LinkParser.ts:276](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/parsers/LinkParser.ts#L276)

Add a page name to the known pages

#### Parameters

##### pageName

`string`

Page name to add

#### Returns

`void`

***

### buildAttributeString()

> **buildAttributeString**(`customAttributes`, `defaultAttributes`): `string`

Defined in: [src/parsers/LinkParser.ts:620](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/parsers/LinkParser.ts#L620)

Build HTML attribute string

#### Parameters

##### customAttributes

[`LinkAttributes`](../interfaces/LinkAttributes.md) = `{}`

Custom attributes from link

##### defaultAttributes

`Record`\<`string`, `string` \| `undefined`\> = `{}`

Default attributes

#### Returns

`string`

HTML attribute string

***

### determineLinkType()

> **determineLinkType**(`link`): [`LinkType`](../type-aliases/LinkType.md)

Defined in: [src/parsers/LinkParser.ts:446](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/parsers/LinkParser.ts#L446)

Determine the type of link

#### Parameters

##### link

[`Link`](Link.md)

Link object

#### Returns

[`LinkType`](../type-aliases/LinkType.md)

Link type

***

### escapeHtml()

> **escapeHtml**(`text`): `string`

Defined in: [src/parsers/LinkParser.ts:691](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/parsers/LinkParser.ts#L691)

Escape HTML characters

#### Parameters

##### text

`string`

Text to escape

#### Returns

`string`

Escaped text

***

### findLinks()

> **findLinks**(`content`): [`Link`](Link.md)[]

Defined in: [src/parsers/LinkParser.ts:337](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/parsers/LinkParser.ts#L337)

Find all links in the content

#### Parameters

##### content

`string`

Content to search

#### Returns

[`Link`](Link.md)[]

Array of Link objects

***

### generateAnchorLink()

> **generateAnchorLink**(`link`, `_context`): `string`

Defined in: [src/parsers/LinkParser.ts:603](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/parsers/LinkParser.ts#L603)

Generate HTML for anchor links

#### Parameters

##### link

[`Link`](Link.md)

Link object

##### \_context

[`ParserContext`](../interfaces/ParserContext.md)

Parsing context (unused)

#### Returns

`string`

HTML link

***

### generateEmailLink()

> **generateEmailLink**(`link`, `_context`): `string`

Defined in: [src/parsers/LinkParser.ts:586](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/parsers/LinkParser.ts#L586)

Generate HTML for email links

#### Parameters

##### link

[`Link`](Link.md)

Link object

##### \_context

[`ParserContext`](../interfaces/ParserContext.md)

Parsing context (unused)

#### Returns

`string`

HTML link

***

### generateExternalLink()

> **generateExternalLink**(`link`, `_context`): `string`

Defined in: [src/parsers/LinkParser.ts:527](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/parsers/LinkParser.ts#L527)

Generate HTML for external links

#### Parameters

##### link

[`Link`](Link.md)

Link object

##### \_context

[`ParserContext`](../interfaces/ParserContext.md)

Parsing context (unused)

#### Returns

`string`

HTML link

***

### generateInternalLink()

> **generateInternalLink**(`link`, `_context`): `string`

Defined in: [src/parsers/LinkParser.ts:488](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/parsers/LinkParser.ts#L488)

Generate HTML for internal wiki links

#### Parameters

##### link

[`Link`](Link.md)

Link object

##### \_context

[`ParserContext`](../interfaces/ParserContext.md)

Parsing context (unused)

#### Returns

`string`

HTML link

***

### generateInterWikiLink()

> **generateInterWikiLink**(`link`, `_context`): `string`

Defined in: [src/parsers/LinkParser.ts:551](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/parsers/LinkParser.ts#L551)

Generate HTML for InterWiki links

#### Parameters

##### link

[`Link`](Link.md)

Link object

##### \_context

[`ParserContext`](../interfaces/ParserContext.md)

Parsing context (unused)

#### Returns

`string`

HTML link

***

### generateLinkHtml()

> **generateLinkHtml**(`link`, `context`): `string`

Defined in: [src/parsers/LinkParser.ts:421](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/parsers/LinkParser.ts#L421)

Generate HTML for a link

#### Parameters

##### link

[`Link`](Link.md)

Link object to process

##### context

[`ParserContext`](../interfaces/ParserContext.md)

Parsing context

#### Returns

`string`

HTML link

***

### getStats()

> **getStats**(): [`ParserStats`](../interfaces/ParserStats.md)

Defined in: [src/parsers/LinkParser.ts:708](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/parsers/LinkParser.ts#L708)

Get parser statistics

#### Returns

[`ParserStats`](../interfaces/ParserStats.md)

Parser statistics

***

### isUrlSafe()

> **isUrlSafe**(`url`): `boolean`

Defined in: [src/parsers/LinkParser.ts:642](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/parsers/LinkParser.ts#L642)

Validate URL safety

#### Parameters

##### url

`string`

URL to validate

#### Returns

`boolean`

True if URL is safe

***

### parseAttributes()

> **parseAttributes**(`attributeString`): [`LinkAttributes`](../interfaces/LinkAttributes.md)

Defined in: [src/parsers/LinkParser.ts:370](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/parsers/LinkParser.ts#L370)

Parse link attributes from attribute string

#### Parameters

##### attributeString

`string`

String containing attributes

#### Returns

[`LinkAttributes`](../interfaces/LinkAttributes.md)

Parsed attributes object

***

### parseLinks()

> **parseLinks**(`content`, `context`): `string`

Defined in: [src/parsers/LinkParser.ts:300](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/parsers/LinkParser.ts#L300)

Parse all links in the given content

#### Parameters

##### content

`string`

Content containing wiki links

##### context

[`ParserContext`](../interfaces/ParserContext.md) = `{}`

Parsing context (pageName, etc.)

#### Returns

`string`

Content with links converted to HTML

***

### sanitizeAttributeValue()

> **sanitizeAttributeValue**(`value`): `string`

Defined in: [src/parsers/LinkParser.ts:680](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/parsers/LinkParser.ts#L680)

Sanitize attribute value to prevent XSS

#### Parameters

##### value

`string`

Attribute value

#### Returns

`string`

Sanitized value

***

### sanitizeStyleAttribute()

> **sanitizeStyleAttribute**(`style`): `string`

Defined in: [src/parsers/LinkParser.ts:667](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/parsers/LinkParser.ts#L667)

Sanitize style attribute value

#### Parameters

##### style

`string`

Style value

#### Returns

`string`

Sanitized style

***

### setInterWikiSites()

> **setInterWikiSites**(`sites`): `void`

Defined in: [src/parsers/LinkParser.ts:286](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/parsers/LinkParser.ts#L286)

Set InterWiki sites configuration

#### Parameters

##### sites

InterWiki sites configuration

`Map`\<`string`, [`InterWikiSiteConfig`](../interfaces/InterWikiSiteConfig.md)\> | `Record`\<`string`, [`InterWikiSiteConfig`](../interfaces/InterWikiSiteConfig.md)\>

#### Returns

`void`

***

### setPageNames()

> **setPageNames**(`pageNames`, `matchEnglishPlurals`): `void`

Defined in: [src/parsers/LinkParser.ts:267](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/parsers/LinkParser.ts#L267)

Set the list of existing wiki page names for link validation

#### Parameters

##### pageNames

`string`[]

Array of page names

##### matchEnglishPlurals

`boolean` = `true`

Enable plural matching (default: true)

#### Returns

`void`
