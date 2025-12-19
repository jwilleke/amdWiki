[**amdWiki API v1.5.0**](../../../../../../README.md)

***

[amdWiki API](../../../../../../README.md) / [src/parsers/dom/handlers/DOMPluginHandler](../README.md) / export=

# Class: export=

Defined in: [src/parsers/dom/handlers/DOMPluginHandler.js:15](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/dom/handlers/DOMPluginHandler.js#L15)

DOMPluginHandler - DOM-based plugin execution handler

Replaces string-based regex plugin processing with DOM queries.
Processes wiki plugins by querying WikiDocument for .wiki-plugin elements
and executing them through PluginManager.

Part of Phase 4 of WikiDocument DOM Migration (GitHub Issue #107)

Usage:
  In wiki markup: [{PluginName param=value}]
  These are tokenized as PLUGIN tokens and become .wiki-plugin elements
  This handler executes them and replaces with rendered output

## Constructors

### Constructor

> **new export=**(`engine`): `DOMPluginHandler`

Defined in: [src/parsers/dom/handlers/DOMPluginHandler.js:21](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/dom/handlers/DOMPluginHandler.js#L21)

Creates a new DOMPluginHandler

#### Parameters

##### engine

`any`

WikiEngine instance

#### Returns

`DOMPluginHandler`

## Properties

### engine

> **engine**: `any`

Defined in: [src/parsers/dom/handlers/DOMPluginHandler.js:22](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/dom/handlers/DOMPluginHandler.js#L22)

***

### pluginManager

> **pluginManager**: `any`

Defined in: [src/parsers/dom/handlers/DOMPluginHandler.js:23](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/dom/handlers/DOMPluginHandler.js#L23)

## Methods

### createNodeFromExtract()

> **createNodeFromExtract**(`element`, `context`, `wikiDocument`): `Promise`\<`Element`\>

Defined in: [src/parsers/dom/handlers/DOMPluginHandler.js:275](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/dom/handlers/DOMPluginHandler.js#L275)

Creates a DOM node from an extracted plugin element

This method is part of the Phase 2 extraction-based parsing (Issue #114).
It creates a plugin node from a pre-extracted element and executes the plugin.

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

Defined in: [src/parsers/dom/handlers/DOMPluginHandler.js:210](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/dom/handlers/DOMPluginHandler.js#L210)

Executes a plugin through PluginManager

#### Parameters

##### pluginName

`string`

Name of the plugin

##### parameters

`any`

Plugin parameters

##### context

`any`

Rendering context

##### pluginElement

`Element`

The plugin DOM element

#### Returns

`Promise`\<`string`\>

Plugin output HTML or null

***

### getStatistics()

> **getStatistics**(`wikiDocument`): `any`

Defined in: [src/parsers/dom/handlers/DOMPluginHandler.js:373](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/dom/handlers/DOMPluginHandler.js#L373)

Gets statistics about plugin processing

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

Defined in: [src/parsers/dom/handlers/DOMPluginHandler.js:29](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/dom/handlers/DOMPluginHandler.js#L29)

Initializes the handler

#### Returns

`Promise`\<`void`\>

***

### parseParameters()

> **parseParameters**(`paramString`): `any`

Defined in: [src/parsers/dom/handlers/DOMPluginHandler.js:170](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/dom/handlers/DOMPluginHandler.js#L170)

Parses parameter string into object

#### Parameters

##### paramString

`string`

Parameter string (e.g., "max=3 show=true")

#### Returns

`any`

Parsed parameters

***

### parsePluginContent()

> **parsePluginContent**(`pluginContent`): `any`

Defined in: [src/parsers/dom/handlers/DOMPluginHandler.js:140](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/dom/handlers/DOMPluginHandler.js#L140)

Parses plugin content string into name and parameters

#### Parameters

##### pluginContent

`string`

Plugin content (e.g., "TableOfContents max=3")

#### Returns

`any`

{ pluginName, parameters } or null if invalid

***

### processPlugins()

> **processPlugins**(`wikiDocument`, `context`): `Promise`\<`WikiDocument`\>

Defined in: [src/parsers/dom/handlers/DOMPluginHandler.js:44](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/dom/handlers/DOMPluginHandler.js#L44)

Processes plugins in a WikiDocument

Queries for .wiki-plugin elements and executes them.
This is the DOM-based equivalent of PluginSyntaxHandler.process()

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
