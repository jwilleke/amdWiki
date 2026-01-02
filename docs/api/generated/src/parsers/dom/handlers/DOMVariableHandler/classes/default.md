[**amdWiki API v1.5.0**](../../../../../../README.md)

***

[amdWiki API](../../../../../../README.md) / [src/parsers/dom/handlers/DOMVariableHandler](../README.md) / default

# Class: default

Defined in: [src/parsers/dom/handlers/DOMVariableHandler.ts:120](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/parsers/dom/handlers/DOMVariableHandler.ts#L120)

DOMVariableHandler class

## Constructors

### Constructor

> **new default**(`engine`): `DOMVariableHandler`

Defined in: [src/parsers/dom/handlers/DOMVariableHandler.ts:132](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/parsers/dom/handlers/DOMVariableHandler.ts#L132)

Creates a new DOMVariableHandler

#### Parameters

##### engine

`WikiEngine`

WikiEngine instance

#### Returns

`DOMVariableHandler`

## Methods

### createNodeFromExtract()

> **createNodeFromExtract**(`element`, `context`, `wikiDocument`): `Promise`\<[`LinkedomElement`](../../../WikiDocument/interfaces/LinkedomElement.md)\>

Defined in: [src/parsers/dom/handlers/DOMVariableHandler.ts:294](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/parsers/dom/handlers/DOMVariableHandler.ts#L294)

Creates a DOM node from an extracted variable element

This method is part of the Phase 2 extraction-based parsing (Issue #114).
It creates a variable node from a pre-extracted element instead of
parsing it from tokens.

#### Parameters

##### element

[`ExtractedElement`](../interfaces/ExtractedElement.md)

Extracted element from extractJSPWikiSyntax()

##### context

[`VariableContext`](../interfaces/VariableContext.md)

Rendering context

##### wikiDocument

[`default`](../../../WikiDocument/classes/default.md)

WikiDocument to create node in

#### Returns

`Promise`\<[`LinkedomElement`](../../../WikiDocument/interfaces/LinkedomElement.md)\>

DOM node for the variable

#### Example

```ts
const element = { type: 'variable', varName: '$username', id: 0, ... };
const node = await handler.createNodeFromExtract(element, context, wikiDoc);
// Returns: <span class="wiki-variable" data-variable="username">JohnDoe</span>
```

***

### getStatistics()

> **getStatistics**(`wikiDocument`): [`VariableStatistics`](../interfaces/VariableStatistics.md)

Defined in: [src/parsers/dom/handlers/DOMVariableHandler.ts:341](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/parsers/dom/handlers/DOMVariableHandler.ts#L341)

Gets statistics about variable processing

#### Parameters

##### wikiDocument

[`default`](../../../WikiDocument/classes/default.md)

Document to analyze

#### Returns

[`VariableStatistics`](../interfaces/VariableStatistics.md)

Statistics

***

### initialize()

> **initialize**(): `Promise`\<`void`\>

Defined in: [src/parsers/dom/handlers/DOMVariableHandler.ts:141](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/parsers/dom/handlers/DOMVariableHandler.ts#L141)

Initializes the handler

#### Returns

`Promise`\<`void`\>

***

### processVariables()

> **processVariables**(`wikiDocument`, `context`): `Promise`\<[`default`](../../../WikiDocument/classes/default.md)\>

Defined in: [src/parsers/dom/handlers/DOMVariableHandler.ts:157](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/parsers/dom/handlers/DOMVariableHandler.ts#L157)

Processes variables in a WikiDocument

Queries for .wiki-variable elements and resolves their values.
This is the DOM-based equivalent of VariableManager.expandVariables()

#### Parameters

##### wikiDocument

[`default`](../../../WikiDocument/classes/default.md)

The WikiDocument to process

##### context

[`VariableContext`](../interfaces/VariableContext.md)

Rendering context

#### Returns

`Promise`\<[`default`](../../../WikiDocument/classes/default.md)\>

Updated WikiDocument

***

### resolveVariable()

> **resolveVariable**(`varName`, `context`): `string` \| `number`

Defined in: [src/parsers/dom/handlers/DOMVariableHandler.ts:239](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/parsers/dom/handlers/DOMVariableHandler.ts#L239)

Resolves a variable name to its value

#### Parameters

##### varName

`string`

Variable name (without {$ })

##### context

[`VariableContext`](../interfaces/VariableContext.md)

Rendering context

#### Returns

`string` \| `number`

Variable value or null if not found
