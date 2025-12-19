[**amdWiki API v1.5.0**](../../../../README.md)

***

[amdWiki API](../../../../README.md) / [src/parsers/LinkParser](../README.md) / LinkParser

# Class: LinkParser

Defined in: [src/parsers/LinkParser.js:43](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/LinkParser.js#L43)

## Constructors

### Constructor

> **new LinkParser**(`options?`): `LinkParser`

Defined in: [src/parsers/LinkParser.js:53](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/LinkParser.js#L53)

Create a new LinkParser instance

#### Parameters

##### options?

Configuration options

###### allowedAttributes?

`string`[]

Allowed HTML attributes

###### defaultClasses?

`any`

Default CSS classes for link types

###### security?

`any`

Security settings

#### Returns

`LinkParser`

## Properties

### interWikiSites

> **interWikiSites**: `Map`\<`any`, `any`\>

Defined in: [src/parsers/LinkParser.js:98](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/LinkParser.js#L98)

***

### linkPattern

> **linkPattern**: `RegExp`

Defined in: [src/parsers/LinkParser.js:101](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/LinkParser.js#L101)

***

### options

> **options**: `object`

Defined in: [src/parsers/LinkParser.js:54](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/LinkParser.js#L54)

#### allowedAttributes

> **allowedAttributes**: `string`[]

#### defaultClasses

> **defaultClasses**: `any`

#### interWikiPattern

> **interWikiPattern**: `RegExp`

#### security

> **security**: `any`

#### urlPatterns

> **urlPatterns**: `object`

##### urlPatterns.absolute

> **absolute**: `RegExp`

##### urlPatterns.anchor

> **anchor**: `RegExp`

##### urlPatterns.email

> **email**: `RegExp`

##### urlPatterns.external

> **external**: `RegExp`

***

### pageNameMatcher

> **pageNameMatcher**: `any`

Defined in: [src/parsers/LinkParser.js:95](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/LinkParser.js#L95)

***

### pageNames

> **pageNames**: `Set`\<`any`\>

Defined in: [src/parsers/LinkParser.js:92](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/LinkParser.js#L92)

## Methods

### addPageName()

> **addPageName**(`pageName`): `void`

Defined in: [src/parsers/LinkParser.js:118](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/LinkParser.js#L118)

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

Defined in: [src/parsers/LinkParser.js:459](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/LinkParser.js#L459)

Build HTML attribute string

#### Parameters

##### customAttributes

`any` = `{}`

Custom attributes from link

##### defaultAttributes

`any` = `{}`

Default attributes

#### Returns

`string`

HTML attribute string

***

### determineLinkType()

> **determineLinkType**(`link`): `string`

Defined in: [src/parsers/LinkParser.js:285](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/LinkParser.js#L285)

Determine the type of link

#### Parameters

##### link

[`Link`](Link.md)

Link object

#### Returns

`string`

Link type ('internal', 'external', 'interwiki', 'email', 'anchor')

***

### escapeHtml()

> **escapeHtml**(`text`): `string`

Defined in: [src/parsers/LinkParser.js:530](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/LinkParser.js#L530)

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

Defined in: [src/parsers/LinkParser.js:177](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/LinkParser.js#L177)

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

> **generateAnchorLink**(`link`, `context`): `string`

Defined in: [src/parsers/LinkParser.js:442](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/LinkParser.js#L442)

Generate HTML for anchor links

#### Parameters

##### link

[`Link`](Link.md)

Link object

##### context

`any`

Parsing context

#### Returns

`string`

HTML link

***

### generateEmailLink()

> **generateEmailLink**(`link`, `context`): `string`

Defined in: [src/parsers/LinkParser.js:425](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/LinkParser.js#L425)

Generate HTML for email links

#### Parameters

##### link

[`Link`](Link.md)

Link object

##### context

`any`

Parsing context

#### Returns

`string`

HTML link

***

### generateExternalLink()

> **generateExternalLink**(`link`, `context`): `string`

Defined in: [src/parsers/LinkParser.js:366](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/LinkParser.js#L366)

Generate HTML for external links

#### Parameters

##### link

[`Link`](Link.md)

Link object

##### context

`any`

Parsing context

#### Returns

`string`

HTML link

***

### generateInternalLink()

> **generateInternalLink**(`link`, `context`): `string`

Defined in: [src/parsers/LinkParser.js:327](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/LinkParser.js#L327)

Generate HTML for internal wiki links

#### Parameters

##### link

[`Link`](Link.md)

Link object

##### context

`any`

Parsing context

#### Returns

`string`

HTML link

***

### generateInterWikiLink()

> **generateInterWikiLink**(`link`, `context`): `string`

Defined in: [src/parsers/LinkParser.js:390](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/LinkParser.js#L390)

Generate HTML for InterWiki links

#### Parameters

##### link

[`Link`](Link.md)

Link object

##### context

`any`

Parsing context

#### Returns

`string`

HTML link

***

### generateLinkHtml()

> **generateLinkHtml**(`link`, `context`): `string`

Defined in: [src/parsers/LinkParser.js:260](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/LinkParser.js#L260)

Generate HTML for a link

#### Parameters

##### link

[`Link`](Link.md)

Link object to process

##### context

`any`

Parsing context

#### Returns

`string`

HTML link

***

### getStats()

> **getStats**(): `any`

Defined in: [src/parsers/LinkParser.js:547](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/LinkParser.js#L547)

Get parser statistics

#### Returns

`any`

Parser statistics

***

### isUrlSafe()

> **isUrlSafe**(`url`): `boolean`

Defined in: [src/parsers/LinkParser.js:481](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/LinkParser.js#L481)

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

> **parseAttributes**(`attributeString`): `any`

Defined in: [src/parsers/LinkParser.js:210](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/LinkParser.js#L210)

Parse link attributes from attribute string

#### Parameters

##### attributeString

`string`

String containing attributes

#### Returns

`any`

Parsed attributes object

***

### parseLinks()

> **parseLinks**(`content`, `context`): `string`

Defined in: [src/parsers/LinkParser.js:142](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/LinkParser.js#L142)

Parse all links in the given content

#### Parameters

##### content

`string`

Content containing wiki links

##### context

`any` = `{}`

Parsing context (pageName, etc.)

#### Returns

`string`

Content with links converted to HTML

***

### sanitizeAttributeValue()

> **sanitizeAttributeValue**(`value`): `string`

Defined in: [src/parsers/LinkParser.js:519](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/LinkParser.js#L519)

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

Defined in: [src/parsers/LinkParser.js:506](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/LinkParser.js#L506)

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

Defined in: [src/parsers/LinkParser.js:128](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/LinkParser.js#L128)

Set InterWiki sites configuration

#### Parameters

##### sites

`any`

InterWiki sites configuration

#### Returns

`void`

***

### setPageNames()

> **setPageNames**(`pageNames`, `matchEnglishPlurals`): `void`

Defined in: [src/parsers/LinkParser.js:109](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/LinkParser.js#L109)

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
