[**amdWiki API v1.5.0**](../../../../../../README.md)

***

[amdWiki API](../../../../../../README.md) / [src/parsers/dom/handlers/DOMPluginHandler](../README.md) / default

# Class: default

Defined in: [src/parsers/dom/handlers/DOMPluginHandler.ts:155](https://github.com/jwilleke/amdWiki/blob/b6a859c7c9297966de89735ea5e8f953df289ac1/src/parsers/dom/handlers/DOMPluginHandler.ts#L155)

DOMPluginHandler class

## Constructors

### Constructor

> **new default**(`engine`): `DOMPluginHandler`

Defined in: [src/parsers/dom/handlers/DOMPluginHandler.ts:167](https://github.com/jwilleke/amdWiki/blob/b6a859c7c9297966de89735ea5e8f953df289ac1/src/parsers/dom/handlers/DOMPluginHandler.ts#L167)

Creates a new DOMPluginHandler

#### Parameters

##### engine

`WikiEngine`

WikiEngine instance

#### Returns

`DOMPluginHandler`

## Methods

### createNodeFromExtract()

> **createNodeFromExtract**(`element`, `context`, `wikiDocument`): `Promise`\<[`LinkedomElement`](../../../WikiDocument/interfaces/LinkedomElement.md)\>

Defined in: [src/parsers/dom/handlers/DOMPluginHandler.ts:434](https://github.com/jwilleke/amdWiki/blob/b6a859c7c9297966de89735ea5e8f953df289ac1/src/parsers/dom/handlers/DOMPluginHandler.ts#L434)

Creates a DOM node from an extracted plugin element

This method is part of the Phase 2 extraction-based parsing (Issue #114).
It creates a plugin node from a pre-extracted element and executes the plugin.

#### Parameters

##### element

[`ExtractedPluginElement`](../interfaces/ExtractedPluginElement.md)

Extracted element from extractJSPWikiSyntax()

##### context

[`PluginContext`](../interfaces/PluginContext.md)

Rendering context

##### wikiDocument

[`default`](../../../WikiDocument/classes/default.md)

WikiDocument to create node in

#### Returns

`Promise`\<[`LinkedomElement`](../../../WikiDocument/interfaces/LinkedomElement.md)\>

DOM node for the plugin

#### Example

```ts
const element = { type: 'plugin', inner: 'TableOfContents', id: 1, ... };
const node = await handler.createNodeFromExtract(element, context, wikiDoc);
// Returns: <span class="wiki-plugin" data-plugin="TableOfContents">...plugin output...</span>
```

***

### executePlugin()

> **executePlugin**(`pluginName`, `parameters`, `context`, `pluginElement`): `Promise`\<`string` \| `null`\>

Defined in: [src/parsers/dom/handlers/DOMPluginHandler.ts:369](https://github.com/jwilleke/amdWiki/blob/b6a859c7c9297966de89735ea5e8f953df289ac1/src/parsers/dom/handlers/DOMPluginHandler.ts#L369)

Executes a plugin through PluginManager

#### Parameters

##### pluginName

`string`

Name of the plugin

##### parameters

`Record`\<`string`, `string`\>

Plugin parameters

##### context

[`PluginContext`](../interfaces/PluginContext.md)

Rendering context

##### pluginElement

`unknown`

The plugin DOM element

#### Returns

`Promise`\<`string` \| `null`\>

Plugin output HTML or null

***

### getStatistics()

> **getStatistics**(`wikiDocument`): [`PluginStatistics`](../interfaces/PluginStatistics.md)

Defined in: [src/parsers/dom/handlers/DOMPluginHandler.ts:537](https://github.com/jwilleke/amdWiki/blob/b6a859c7c9297966de89735ea5e8f953df289ac1/src/parsers/dom/handlers/DOMPluginHandler.ts#L537)

Gets statistics about plugin processing

#### Parameters

##### wikiDocument

[`default`](../../../WikiDocument/classes/default.md)

Document to analyze

#### Returns

[`PluginStatistics`](../interfaces/PluginStatistics.md)

Statistics

***

### initialize()

> **initialize**(): `Promise`\<`void`\>

Defined in: [src/parsers/dom/handlers/DOMPluginHandler.ts:176](https://github.com/jwilleke/amdWiki/blob/b6a859c7c9297966de89735ea5e8f953df289ac1/src/parsers/dom/handlers/DOMPluginHandler.ts#L176)

Initializes the handler

#### Returns

`Promise`\<`void`\>

***

### parseParameters()

> **parseParameters**(`paramString`): `Record`\<`string`, `string`\>

Defined in: [src/parsers/dom/handlers/DOMPluginHandler.ts:329](https://github.com/jwilleke/amdWiki/blob/b6a859c7c9297966de89735ea5e8f953df289ac1/src/parsers/dom/handlers/DOMPluginHandler.ts#L329)

Parses parameter string into object

#### Parameters

##### paramString

`string`

Parameter string (e.g., "max=3 show=true")

#### Returns

`Record`\<`string`, `string`\>

Parsed parameters

***

### parsePluginContent()

> **parsePluginContent**(`pluginContent`): [`PluginInfo`](../interfaces/PluginInfo.md) \| `null`

Defined in: [src/parsers/dom/handlers/DOMPluginHandler.ts:299](https://github.com/jwilleke/amdWiki/blob/b6a859c7c9297966de89735ea5e8f953df289ac1/src/parsers/dom/handlers/DOMPluginHandler.ts#L299)

Parses plugin content string into name and parameters

#### Parameters

##### pluginContent

`string`

Plugin content (e.g., "TableOfContents max=3")

#### Returns

[`PluginInfo`](../interfaces/PluginInfo.md) \| `null`

{ pluginName, parameters } or null if invalid

***

### processPlugins()

> **processPlugins**(`wikiDocument`, `context`): `Promise`\<[`default`](../../../WikiDocument/classes/default.md)\>

Defined in: [src/parsers/dom/handlers/DOMPluginHandler.ts:191](https://github.com/jwilleke/amdWiki/blob/b6a859c7c9297966de89735ea5e8f953df289ac1/src/parsers/dom/handlers/DOMPluginHandler.ts#L191)

Processes plugins in a WikiDocument

Queries for .wiki-plugin elements and executes them.
This is the DOM-based equivalent of PluginSyntaxHandler.process()

#### Parameters

##### wikiDocument

[`default`](../../../WikiDocument/classes/default.md)

The WikiDocument to process

##### context

[`PluginContext`](../interfaces/PluginContext.md)

Rendering context

#### Returns

`Promise`\<[`default`](../../../WikiDocument/classes/default.md)\>

Updated WikiDocument
