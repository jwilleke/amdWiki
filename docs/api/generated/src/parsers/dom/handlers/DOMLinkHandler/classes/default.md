[**amdWiki API v1.5.0**](../../../../../../README.md)

***

[amdWiki API](../../../../../../README.md) / [src/parsers/dom/handlers/DOMLinkHandler](../README.md) / default

# Class: default

Defined in: [src/parsers/dom/handlers/DOMLinkHandler.ts:161](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/parsers/dom/handlers/DOMLinkHandler.ts#L161)

DOMLinkHandler class

## Constructors

### Constructor

> **new default**(`engine`): `DOMLinkHandler`

Defined in: [src/parsers/dom/handlers/DOMLinkHandler.ts:182](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/parsers/dom/handlers/DOMLinkHandler.ts#L182)

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

Defined in: [src/parsers/dom/handlers/DOMLinkHandler.ts:599](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/parsers/dom/handlers/DOMLinkHandler.ts#L599)

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

Defined in: [src/parsers/dom/handlers/DOMLinkHandler.ts:760](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/parsers/dom/handlers/DOMLinkHandler.ts#L760)

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

Defined in: [src/parsers/dom/handlers/DOMLinkHandler.ts:193](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/parsers/dom/handlers/DOMLinkHandler.ts#L193)

Initializes the handler

#### Returns

`Promise`\<`void`\>

***

### loadInterWikiConfiguration()

> **loadInterWikiConfiguration**(): `Promise`\<`void`\>

Defined in: [src/parsers/dom/handlers/DOMLinkHandler.ts:249](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/parsers/dom/handlers/DOMLinkHandler.ts#L249)

Load InterWiki site configuration

#### Returns

`Promise`\<`void`\>

***

### loadPageNames()

> **loadPageNames**(): `Promise`\<`void`\>

Defined in: [src/parsers/dom/handlers/DOMLinkHandler.ts:218](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/parsers/dom/handlers/DOMLinkHandler.ts#L218)

Load page names from PageManager

#### Returns

`Promise`\<`void`\>

***

### processAnchorLink()

> **processAnchorLink**(`linkElement`, `linkInfo`, `_context`): `void`

Defined in: [src/parsers/dom/handlers/DOMLinkHandler.ts:565](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/parsers/dom/handlers/DOMLinkHandler.ts#L565)

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

Defined in: [src/parsers/dom/handlers/DOMLinkHandler.ts:546](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/parsers/dom/handlers/DOMLinkHandler.ts#L546)

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

Defined in: [src/parsers/dom/handlers/DOMLinkHandler.ts:466](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/parsers/dom/handlers/DOMLinkHandler.ts#L466)

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

Defined in: [src/parsers/dom/handlers/DOMLinkHandler.ts:422](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/parsers/dom/handlers/DOMLinkHandler.ts#L422)

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

Defined in: [src/parsers/dom/handlers/DOMLinkHandler.ts:491](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/parsers/dom/handlers/DOMLinkHandler.ts#L491)

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

Defined in: [src/parsers/dom/handlers/DOMLinkHandler.ts:393](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/parsers/dom/handlers/DOMLinkHandler.ts#L393)

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

Defined in: [src/parsers/dom/handlers/DOMLinkHandler.ts:309](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/parsers/dom/handlers/DOMLinkHandler.ts#L309)

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

Defined in: [src/parsers/dom/handlers/DOMLinkHandler.ts:806](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/parsers/dom/handlers/DOMLinkHandler.ts#L806)

Refresh page names cache (called when pages are added/removed)

#### Returns

`Promise`\<`void`\>
