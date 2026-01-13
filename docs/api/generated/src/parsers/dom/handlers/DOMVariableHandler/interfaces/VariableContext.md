[**amdWiki API v1.5.0**](../../../../../../README.md)

***

[amdWiki API](../../../../../../README.md) / [src/parsers/dom/handlers/DOMVariableHandler](../README.md) / VariableContext

# Interface: VariableContext

Defined in: [src/parsers/dom/handlers/DOMVariableHandler.ts:23](https://github.com/jwilleke/amdWiki/blob/b6a859c7c9297966de89735ea5e8f953df289ac1/src/parsers/dom/handlers/DOMVariableHandler.ts#L23)

Context for variable resolution

## Indexable

\[`key`: `string`\]: `unknown`

Additional context properties

## Properties

### engine?

> `optional` **engine**: `unknown`

Defined in: [src/parsers/dom/handlers/DOMVariableHandler.ts:44](https://github.com/jwilleke/amdWiki/blob/b6a859c7c9297966de89735ea5e8f953df289ac1/src/parsers/dom/handlers/DOMVariableHandler.ts#L44)

WikiEngine reference

***

### pageContext?

> `optional` **pageContext**: `VariableContext`

Defined in: [src/parsers/dom/handlers/DOMVariableHandler.ts:42](https://github.com/jwilleke/amdWiki/blob/b6a859c7c9297966de89735ea5e8f953df289ac1/src/parsers/dom/handlers/DOMVariableHandler.ts#L42)

Page context (nested structure from WikiContext)

***

### pageName?

> `optional` **pageName**: `string`

Defined in: [src/parsers/dom/handlers/DOMVariableHandler.ts:25](https://github.com/jwilleke/amdWiki/blob/b6a859c7c9297966de89735ea5e8f953df289ac1/src/parsers/dom/handlers/DOMVariableHandler.ts#L25)

Page name

***

### requestInfo?

> `optional` **requestInfo**: `object`

Defined in: [src/parsers/dom/handlers/DOMVariableHandler.ts:35](https://github.com/jwilleke/amdWiki/blob/b6a859c7c9297966de89735ea5e8f953df289ac1/src/parsers/dom/handlers/DOMVariableHandler.ts#L35)

Request information

#### Index Signature

\[`key`: `string`\]: `unknown`

#### headers?

> `optional` **headers**: `Record`\<`string`, `string`\>

#### method?

> `optional` **method**: `string`

#### path?

> `optional` **path**: `string`

***

### userContext?

> `optional` **userContext**: `object`

Defined in: [src/parsers/dom/handlers/DOMVariableHandler.ts:27](https://github.com/jwilleke/amdWiki/blob/b6a859c7c9297966de89735ea5e8f953df289ac1/src/parsers/dom/handlers/DOMVariableHandler.ts#L27)

User context information

#### Index Signature

\[`key`: `string`\]: `unknown`

#### email?

> `optional` **email**: `string`

#### fullName?

> `optional` **fullName**: `string`

#### roles?

> `optional` **roles**: `string`[]

#### username?

> `optional` **username**: `string`
