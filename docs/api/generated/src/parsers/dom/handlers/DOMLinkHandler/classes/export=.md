[**amdWiki API v1.5.0**](../../../../../../README.md)

***

[amdWiki API](../../../../../../README.md) / [src/parsers/dom/handlers/DOMLinkHandler](../README.md) / export=

# Class: export=

Defined in: [src/parsers/dom/handlers/DOMLinkHandler.js:26](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/dom/handlers/DOMLinkHandler.js#L26)

## Constructors

### Constructor

> **new export=**(`engine`): `DOMLinkHandler`

Defined in: [src/parsers/dom/handlers/DOMLinkHandler.js:32](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/dom/handlers/DOMLinkHandler.js#L32)

Creates a new DOMLinkHandler

#### Parameters

##### engine

`any`

WikiEngine instance

#### Returns

`DOMLinkHandler`

## Properties

### engine

> **engine**: `any`

Defined in: [src/parsers/dom/handlers/DOMLinkHandler.js:33](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/dom/handlers/DOMLinkHandler.js#L33)

***

### linkParser

> **linkParser**: [`LinkParser`](../../../../LinkParser/classes/LinkParser.md)

Defined in: [src/parsers/dom/handlers/DOMLinkHandler.js:34](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/dom/handlers/DOMLinkHandler.js#L34)

***

### pageManager

> **pageManager**: `any`

Defined in: [src/parsers/dom/handlers/DOMLinkHandler.js:35](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/dom/handlers/DOMLinkHandler.js#L35)

***

### pageNameMatcher

> **pageNameMatcher**: `any`

Defined in: [src/parsers/dom/handlers/DOMLinkHandler.js:37](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/dom/handlers/DOMLinkHandler.js#L37)

***

### pageNames

> **pageNames**: `Set`\<`any`\>

Defined in: [src/parsers/dom/handlers/DOMLinkHandler.js:36](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/dom/handlers/DOMLinkHandler.js#L36)

## Methods

### createNodeFromExtract()

> **createNodeFromExtract**(`element`, `context`, `wikiDocument`): `Promise`\<`Element`\>

Defined in: [src/parsers/dom/handlers/DOMLinkHandler.js:400](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/dom/handlers/DOMLinkHandler.js#L400)

Creates a DOM node from an extracted link element

This method is part of the Phase 2 extraction-based parsing (Issue #114).
It creates a link node from a pre-extracted element instead of parsing tokens.

#### Parameters

##### element

`any`

Extracted element from extractJSPWikiSyntax()

##### context

`any`

Rendering context

##### wikiDocument

`WikiDocument`

WikiDocument to create node in

#### Returns

`Promise`\<`Element`\>

DOM node for the link

#### Examples

```ts
const element = { type: 'link', target: 'PageName', id: 0, ... };
const node = await handler.createNodeFromExtract(element, context, wikiDoc);
// Returns: <a class="wiki-link wikipage" href="/wiki/PageName" data-jspwiki-id="0">PageName</a>
```

```ts
const element = { type: 'link', target: 'Click Here|PageName', id: 1, ... };
const node = await handler.createNodeFromExtract(element, context, wikiDoc);
// Returns: <a class="wiki-link wikipage" href="/wiki/PageName" data-jspwiki-id="1">Click Here</a>
```

***

### getStatistics()

> **getStatistics**(`wikiDocument`): `any`

Defined in: [src/parsers/dom/handlers/DOMLinkHandler.js:561](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/dom/handlers/DOMLinkHandler.js#L561)

Gets statistics about link processing

#### Parameters

##### wikiDocument

`WikiDocument`

Document to analyze

#### Returns

`any`

Statistics

***

### initialize()

> **initialize**(): `Promise`\<`void`\>

Defined in: [src/parsers/dom/handlers/DOMLinkHandler.js:43](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/dom/handlers/DOMLinkHandler.js#L43)

Initializes the handler

#### Returns

`Promise`\<`void`\>

***

### loadInterWikiConfiguration()

> **loadInterWikiConfiguration**(): `Promise`\<`void`\>

Defined in: [src/parsers/dom/handlers/DOMLinkHandler.js:89](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/dom/handlers/DOMLinkHandler.js#L89)

Load InterWiki site configuration

#### Returns

`Promise`\<`void`\>

***

### loadPageNames()

> **loadPageNames**(): `Promise`\<`void`\>

Defined in: [src/parsers/dom/handlers/DOMLinkHandler.js:66](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/dom/handlers/DOMLinkHandler.js#L66)

Load page names from PageManager

#### Returns

`Promise`\<`void`\>

***

### processAnchorLink()

> **processAnchorLink**(`linkElement`, `linkInfo`, `context`): `void`

Defined in: [src/parsers/dom/handlers/DOMLinkHandler.js:369](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/dom/handlers/DOMLinkHandler.js#L369)

Process anchor link

#### Parameters

##### linkElement

`Element`

The link DOM element

##### linkInfo

`any`

Link information

##### context

`any`

Rendering context

#### Returns

`void`

***

### processEmailLink()

> **processEmailLink**(`linkElement`, `linkInfo`, `context`): `void`

Defined in: [src/parsers/dom/handlers/DOMLinkHandler.js:352](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/dom/handlers/DOMLinkHandler.js#L352)

Process email link

#### Parameters

##### linkElement

`Element`

The link DOM element

##### linkInfo

`any`

Link information

##### context

`any`

Rendering context

#### Returns

`void`

***

### processExternalLink()

> **processExternalLink**(`linkElement`, `linkInfo`, `context`): `void`

Defined in: [src/parsers/dom/handlers/DOMLinkHandler.js:283](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/dom/handlers/DOMLinkHandler.js#L283)

Process external link

#### Parameters

##### linkElement

`Element`

The link DOM element

##### linkInfo

`any`

Link information

##### context

`any`

Rendering context

#### Returns

`void`

***

### processInternalLink()

> **processInternalLink**(`linkElement`, `linkInfo`, `context`): `void`

Defined in: [src/parsers/dom/handlers/DOMLinkHandler.js:243](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/dom/handlers/DOMLinkHandler.js#L243)

Process internal wiki link

#### Parameters

##### linkElement

`Element`

The link DOM element

##### linkInfo

`any`

Link information

##### context

`any`

Rendering context

#### Returns

`void`

***

### processInterWikiLink()

> **processInterWikiLink**(`linkElement`, `linkInfo`, `context`): `void`

Defined in: [src/parsers/dom/handlers/DOMLinkHandler.js:304](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/dom/handlers/DOMLinkHandler.js#L304)

Process InterWiki link

#### Parameters

##### linkElement

`Element`

The link DOM element

##### linkInfo

`any`

Link information

##### context

`any`

Rendering context

#### Returns

`void`

***

### processLinkByType()

> **processLinkByType**(`linkElement`, `linkInfo`, `linkType`, `context`): `Promise`\<`void`\>

Defined in: [src/parsers/dom/handlers/DOMLinkHandler.js:214](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/dom/handlers/DOMLinkHandler.js#L214)

Process a link element based on its type

#### Parameters

##### linkElement

`Element`

The link DOM element

##### linkInfo

`any`

Link information

##### linkType

`string`

Link type (internal, external, interwiki, etc.)

##### context

`any`

Rendering context

#### Returns

`Promise`\<`void`\>

***

### processLinks()

> **processLinks**(`wikiDocument`, `context`): `Promise`\<`WikiDocument`\>

Defined in: [src/parsers/dom/handlers/DOMLinkHandler.js:146](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/dom/handlers/DOMLinkHandler.js#L146)

Processes links in a WikiDocument

Queries for .wiki-link elements and updates them with proper href and attributes.
This is the DOM-based equivalent of LinkParserHandler.process()

#### Parameters

##### wikiDocument

`WikiDocument`

The WikiDocument to process

##### context

`any`

Rendering context

#### Returns

`Promise`\<`WikiDocument`\>

Updated WikiDocument

***

### refreshPageNames()

> **refreshPageNames**(): `Promise`\<`void`\>

Defined in: [src/parsers/dom/handlers/DOMLinkHandler.js:604](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/dom/handlers/DOMLinkHandler.js#L604)

Refresh page names cache (called when pages are added/removed)

#### Returns

`Promise`\<`void`\>
