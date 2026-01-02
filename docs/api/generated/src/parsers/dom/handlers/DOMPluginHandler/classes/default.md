[**amdWiki API v1.5.0**](../../../../../../README.md)

***

[amdWiki API](../../../../../../README.md) / [src/parsers/dom/handlers/DOMPluginHandler](../README.md) / default

# Class: default

Defined in: [src/parsers/dom/handlers/DOMPluginHandler.ts:154](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/parsers/dom/handlers/DOMPluginHandler.ts#L154)

DOMPluginHandler class

## Constructors

### Constructor

> **new default**(`engine`): `DOMPluginHandler`

Defined in: [src/parsers/dom/handlers/DOMPluginHandler.ts:166](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/parsers/dom/handlers/DOMPluginHandler.ts#L166)

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

Defined in: [src/parsers/dom/handlers/DOMPluginHandler.ts:442](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/parsers/dom/handlers/DOMPluginHandler.ts#L442)

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

> **executePlugin**(`pluginName`, `parameters`, `context`, `pluginElement`): `Promise`\<`string`\>

Defined in: [src/parsers/dom/handlers/DOMPluginHandler.ts:376](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/parsers/dom/handlers/DOMPluginHandler.ts#L376)

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

`Promise`\<`string`\>

Plugin output HTML or null

***

### getStatistics()

> **getStatistics**(`wikiDocument`): [`PluginStatistics`](../interfaces/PluginStatistics.md)

Defined in: [src/parsers/dom/handlers/DOMPluginHandler.ts:547](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/parsers/dom/handlers/DOMPluginHandler.ts#L547)

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

Defined in: [src/parsers/dom/handlers/DOMPluginHandler.ts:175](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/parsers/dom/handlers/DOMPluginHandler.ts#L175)

Initializes the handler

#### Returns

`Promise`\<`void`\>

***

### parseParameters()

> **parseParameters**(`paramString`): `Record`\<`string`, `string`\>

Defined in: [src/parsers/dom/handlers/DOMPluginHandler.ts:336](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/parsers/dom/handlers/DOMPluginHandler.ts#L336)

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

> **parsePluginContent**(`pluginContent`): [`PluginInfo`](../interfaces/PluginInfo.md)

Defined in: [src/parsers/dom/handlers/DOMPluginHandler.ts:306](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/parsers/dom/handlers/DOMPluginHandler.ts#L306)

Parses plugin content string into name and parameters

#### Parameters

##### pluginContent

`string`

Plugin content (e.g., "TableOfContents max=3")

#### Returns

[`PluginInfo`](../interfaces/PluginInfo.md)

{ pluginName, parameters } or null if invalid

***

### processPlugins()

> **processPlugins**(`wikiDocument`, `context`): `Promise`\<[`default`](../../../WikiDocument/classes/default.md)\>

Defined in: [src/parsers/dom/handlers/DOMPluginHandler.ts:190](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/parsers/dom/handlers/DOMPluginHandler.ts#L190)

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
