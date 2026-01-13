[**amdWiki API v1.5.0**](../../../../../../README.md)

***

[amdWiki API](../../../../../../README.md) / [src/parsers/dom/handlers/DOMLinkHandler](../README.md) / default

# Class: default

Defined in: [src/parsers/dom/handlers/DOMLinkHandler.ts:162](https://github.com/jwilleke/amdWiki/blob/b6a859c7c9297966de89735ea5e8f953df289ac1/src/parsers/dom/handlers/DOMLinkHandler.ts#L162)

DOMLinkHandler class

## Constructors

### Constructor

> **new default**(`engine`): `DOMLinkHandler`

Defined in: [src/parsers/dom/handlers/DOMLinkHandler.ts:183](https://github.com/jwilleke/amdWiki/blob/b6a859c7c9297966de89735ea5e8f953df289ac1/src/parsers/dom/handlers/DOMLinkHandler.ts#L183)

Creates a new DOMLinkHandler

#### Parameters

##### engine

`WikiEngine`

WikiEngine instance

#### Returns

`DOMLinkHandler`

## Methods

### createNodeFromExtract()

> **createNodeFromExtract**(`element`, `_context`, `wikiDocument`): `Promise`\<[`LinkedomElement`](../../../WikiDocument/interfaces/LinkedomElement.md)\>

Defined in: [src/parsers/dom/handlers/DOMLinkHandler.ts:595](https://github.com/jwilleke/amdWiki/blob/b6a859c7c9297966de89735ea5e8f953df289ac1/src/parsers/dom/handlers/DOMLinkHandler.ts#L595)

Creates a DOM node from an extracted link element

This method is part of the Phase 2 extraction-based parsing (Issue #114).
It creates a link node from a pre-extracted element instead of parsing tokens.

#### Parameters

##### element

[`ExtractedLinkElement`](../interfaces/ExtractedLinkElement.md)

Extracted element from extractJSPWikiSyntax()

##### \_context

[`RenderContext`](../interfaces/RenderContext.md)

Rendering context (unused)

##### wikiDocument

[`default`](../../../WikiDocument/classes/default.md)

WikiDocument to create node in

#### Returns

`Promise`\<[`LinkedomElement`](../../../WikiDocument/interfaces/LinkedomElement.md)\>

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

> **getStatistics**(`wikiDocument`): [`LinkStatistics`](../interfaces/LinkStatistics.md)

Defined in: [src/parsers/dom/handlers/DOMLinkHandler.ts:755](https://github.com/jwilleke/amdWiki/blob/b6a859c7c9297966de89735ea5e8f953df289ac1/src/parsers/dom/handlers/DOMLinkHandler.ts#L755)

Gets statistics about link processing

#### Parameters

##### wikiDocument

[`default`](../../../WikiDocument/classes/default.md)

Document to analyze

#### Returns

[`LinkStatistics`](../interfaces/LinkStatistics.md)

Statistics

***

### initialize()

> **initialize**(): `Promise`\<`void`\>

Defined in: [src/parsers/dom/handlers/DOMLinkHandler.ts:194](https://github.com/jwilleke/amdWiki/blob/b6a859c7c9297966de89735ea5e8f953df289ac1/src/parsers/dom/handlers/DOMLinkHandler.ts#L194)

Initializes the handler

#### Returns

`Promise`\<`void`\>

***

### loadInterWikiConfiguration()

> **loadInterWikiConfiguration**(): `void`

Defined in: [src/parsers/dom/handlers/DOMLinkHandler.ts:247](https://github.com/jwilleke/amdWiki/blob/b6a859c7c9297966de89735ea5e8f953df289ac1/src/parsers/dom/handlers/DOMLinkHandler.ts#L247)

Load InterWiki site configuration

#### Returns

`void`

***

### loadPageNames()

> **loadPageNames**(): `Promise`\<`void`\>

Defined in: [src/parsers/dom/handlers/DOMLinkHandler.ts:217](https://github.com/jwilleke/amdWiki/blob/b6a859c7c9297966de89735ea5e8f953df289ac1/src/parsers/dom/handlers/DOMLinkHandler.ts#L217)

Load page names from PageManager

#### Returns

`Promise`\<`void`\>

***

### processAnchorLink()

> **processAnchorLink**(`linkElement`, `linkInfo`, `_context`): `void`

Defined in: [src/parsers/dom/handlers/DOMLinkHandler.ts:561](https://github.com/jwilleke/amdWiki/blob/b6a859c7c9297966de89735ea5e8f953df289ac1/src/parsers/dom/handlers/DOMLinkHandler.ts#L561)

Process anchor link

#### Parameters

##### linkElement

[`LinkedomElement`](../../../WikiDocument/interfaces/LinkedomElement.md)

The link DOM element

##### linkInfo

[`LinkInfo`](../interfaces/LinkInfo.md)

Link information

##### \_context

[`RenderContext`](../interfaces/RenderContext.md)

Rendering context (unused)

#### Returns

`void`

***

### processEmailLink()

> **processEmailLink**(`linkElement`, `linkInfo`, `_context`): `void`

Defined in: [src/parsers/dom/handlers/DOMLinkHandler.ts:542](https://github.com/jwilleke/amdWiki/blob/b6a859c7c9297966de89735ea5e8f953df289ac1/src/parsers/dom/handlers/DOMLinkHandler.ts#L542)

Process email link

#### Parameters

##### linkElement

[`LinkedomElement`](../../../WikiDocument/interfaces/LinkedomElement.md)

The link DOM element

##### linkInfo

[`LinkInfo`](../interfaces/LinkInfo.md)

Link information

##### \_context

[`RenderContext`](../interfaces/RenderContext.md)

Rendering context (unused)

#### Returns

`void`

***

### processExternalLink()

> **processExternalLink**(`linkElement`, `linkInfo`, `_context`): `void`

Defined in: [src/parsers/dom/handlers/DOMLinkHandler.ts:461](https://github.com/jwilleke/amdWiki/blob/b6a859c7c9297966de89735ea5e8f953df289ac1/src/parsers/dom/handlers/DOMLinkHandler.ts#L461)

Process external link

#### Parameters

##### linkElement

[`LinkedomElement`](../../../WikiDocument/interfaces/LinkedomElement.md)

The link DOM element

##### linkInfo

[`LinkInfo`](../interfaces/LinkInfo.md)

Link information

##### \_context

[`RenderContext`](../interfaces/RenderContext.md)

Rendering context (unused)

#### Returns

`void`

***

### processInternalLink()

> **processInternalLink**(`linkElement`, `linkInfo`, `_context`): `void`

Defined in: [src/parsers/dom/handlers/DOMLinkHandler.ts:417](https://github.com/jwilleke/amdWiki/blob/b6a859c7c9297966de89735ea5e8f953df289ac1/src/parsers/dom/handlers/DOMLinkHandler.ts#L417)

Process internal wiki link

#### Parameters

##### linkElement

[`LinkedomElement`](../../../WikiDocument/interfaces/LinkedomElement.md)

The link DOM element

##### linkInfo

[`LinkInfo`](../interfaces/LinkInfo.md)

Link information

##### \_context

[`RenderContext`](../interfaces/RenderContext.md)

Rendering context (unused)

#### Returns

`void`

***

### processInterWikiLink()

> **processInterWikiLink**(`linkElement`, `linkInfo`, `_context`): `void`

Defined in: [src/parsers/dom/handlers/DOMLinkHandler.ts:486](https://github.com/jwilleke/amdWiki/blob/b6a859c7c9297966de89735ea5e8f953df289ac1/src/parsers/dom/handlers/DOMLinkHandler.ts#L486)

Process InterWiki link

#### Parameters

##### linkElement

[`LinkedomElement`](../../../WikiDocument/interfaces/LinkedomElement.md)

The link DOM element

##### linkInfo

[`LinkInfo`](../interfaces/LinkInfo.md)

Link information

##### \_context

[`RenderContext`](../interfaces/RenderContext.md)

Rendering context (unused)

#### Returns

`void`

***

### processLinkByType()

> **processLinkByType**(`linkElement`, `linkInfo`, `linkType`, `context`): `Promise`\<`void`\>

Defined in: [src/parsers/dom/handlers/DOMLinkHandler.ts:388](https://github.com/jwilleke/amdWiki/blob/b6a859c7c9297966de89735ea5e8f953df289ac1/src/parsers/dom/handlers/DOMLinkHandler.ts#L388)

Process a link element based on its type

#### Parameters

##### linkElement

[`LinkedomElement`](../../../WikiDocument/interfaces/LinkedomElement.md)

The link DOM element

##### linkInfo

[`LinkInfo`](../interfaces/LinkInfo.md)

Link information

##### linkType

[`LinkType`](../type-aliases/LinkType.md)

Link type

##### context

[`RenderContext`](../interfaces/RenderContext.md)

Rendering context

#### Returns

`Promise`\<`void`\>

***

### processLinks()

> **processLinks**(`wikiDocument`, `context`): `Promise`\<[`default`](../../../WikiDocument/classes/default.md)\>

Defined in: [src/parsers/dom/handlers/DOMLinkHandler.ts:309](https://github.com/jwilleke/amdWiki/blob/b6a859c7c9297966de89735ea5e8f953df289ac1/src/parsers/dom/handlers/DOMLinkHandler.ts#L309)

Processes links in a WikiDocument

Queries for .wiki-link elements and updates them with proper href and attributes.
This is the DOM-based equivalent of LinkParserHandler.process()

#### Parameters

##### wikiDocument

[`default`](../../../WikiDocument/classes/default.md)

The WikiDocument to process

##### context

[`RenderContext`](../interfaces/RenderContext.md)

Rendering context

#### Returns

`Promise`\<[`default`](../../../WikiDocument/classes/default.md)\>

Updated WikiDocument

***

### refreshPageNames()

> **refreshPageNames**(): `Promise`\<`void`\>

Defined in: [src/parsers/dom/handlers/DOMLinkHandler.ts:801](https://github.com/jwilleke/amdWiki/blob/b6a859c7c9297966de89735ea5e8f953df289ac1/src/parsers/dom/handlers/DOMLinkHandler.ts#L801)

Refresh page names cache (called when pages are added/removed)

#### Returns

`Promise`\<`void`\>
