[**amdWiki API v1.5.0**](../../../../../../README.md)

***

[amdWiki API](../../../../../../README.md) / [src/parsers/dom/handlers/DOMVariableHandler](../README.md) / export=

# Class: export=

Defined in: [src/parsers/dom/handlers/DOMVariableHandler.js:15](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/dom/handlers/DOMVariableHandler.js#L15)

DOMVariableHandler - DOM-based variable expansion handler

Replaces string-based regex variable expansion with DOM queries.
Processes wiki variables by querying WikiDocument for .wiki-variable elements
and resolving their values through VariableManager.

Part of Phase 3 of WikiDocument DOM Migration (GitHub Issue #93)

Usage:
  In wiki markup: {$username}, {$pagename}, {$date}, etc.
  These are tokenized as VARIABLE tokens and become .wiki-variable elements
  This handler resolves them to actual values

## Constructors

### Constructor

> **new export=**(`engine`): `DOMVariableHandler`

Defined in: [src/parsers/dom/handlers/DOMVariableHandler.js:21](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/dom/handlers/DOMVariableHandler.js#L21)

Creates a new DOMVariableHandler

#### Parameters

##### engine

`any`

WikiEngine instance

#### Returns

`DOMVariableHandler`

## Properties

### engine

> **engine**: `any`

Defined in: [src/parsers/dom/handlers/DOMVariableHandler.js:22](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/dom/handlers/DOMVariableHandler.js#L22)

***

### variableManager

> **variableManager**: `any`

Defined in: [src/parsers/dom/handlers/DOMVariableHandler.js:23](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/dom/handlers/DOMVariableHandler.js#L23)

## Methods

### createNodeFromExtract()

> **createNodeFromExtract**(`element`, `context`, `wikiDocument`): `Element`

Defined in: [src/parsers/dom/handlers/DOMVariableHandler.js:163](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/dom/handlers/DOMVariableHandler.js#L163)

Creates a DOM node from an extracted variable element

This method is part of the Phase 2 extraction-based parsing (Issue #114).
It creates a variable node from a pre-extracted element instead of
parsing it from tokens.

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

`Element`

DOM node for the variable

#### Example

```ts
const element = { type: 'variable', varName: '$username', id: 0, ... };
const node = handler.createNodeFromExtract(element, context, wikiDoc);
// Returns: <span class="wiki-variable" data-variable="username">JohnDoe</span>
```

***

### getStatistics()

> **getStatistics**(`wikiDocument`): `any`

Defined in: [src/parsers/dom/handlers/DOMVariableHandler.js:206](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/dom/handlers/DOMVariableHandler.js#L206)

Gets statistics about variable processing

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

Defined in: [src/parsers/dom/handlers/DOMVariableHandler.js:29](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/dom/handlers/DOMVariableHandler.js#L29)

Initializes the handler

#### Returns

`Promise`\<`void`\>

***

### processVariables()

> **processVariables**(`wikiDocument`, `context`): `WikiDocument`

Defined in: [src/parsers/dom/handlers/DOMVariableHandler.js:44](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/dom/handlers/DOMVariableHandler.js#L44)

Processes variables in a WikiDocument

Queries for .wiki-variable elements and resolves their values.
This is the DOM-based equivalent of VariableManager.expandVariables()

#### Parameters

##### wikiDocument

`WikiDocument`

The WikiDocument to process

##### context

`any`

Rendering context

#### Returns

`WikiDocument`

Updated WikiDocument

***

### resolveVariable()

> **resolveVariable**(`varName`, `context`): `string`

Defined in: [src/parsers/dom/handlers/DOMVariableHandler.js:111](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/dom/handlers/DOMVariableHandler.js#L111)

Resolves a variable name to its value

#### Parameters

##### varName

`string`

Variable name (without {$ })

##### context

`any`

Rendering context

#### Returns

`string`

Variable value or null if not found
