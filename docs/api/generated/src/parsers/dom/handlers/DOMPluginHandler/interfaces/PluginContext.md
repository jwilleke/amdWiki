[**amdWiki API v1.5.0**](../../../../../../README.md)

***

[amdWiki API](../../../../../../README.md) / [src/parsers/dom/handlers/DOMPluginHandler](../README.md) / PluginContext

# Interface: PluginContext

Defined in: [src/parsers/dom/handlers/DOMPluginHandler.ts:23](https://github.com/jwilleke/amdWiki/blob/b6a859c7c9297966de89735ea5e8f953df289ac1/src/parsers/dom/handlers/DOMPluginHandler.ts#L23)

Plugin execution context

## Indexable

\[`key`: `string`\]: `unknown`

Additional context properties

## Properties

### bodyContent

> **bodyContent**: `string` \| `null`

Defined in: [src/parsers/dom/handlers/DOMPluginHandler.ts:50](https://github.com/jwilleke/amdWiki/blob/b6a859c7c9297966de89735ea5e8f953df289ac1/src/parsers/dom/handlers/DOMPluginHandler.ts#L50)

Plugin body content (for body plugins)

***

### engine

> **engine**: `unknown`

Defined in: [src/parsers/dom/handlers/DOMPluginHandler.ts:44](https://github.com/jwilleke/amdWiki/blob/b6a859c7c9297966de89735ea5e8f953df289ac1/src/parsers/dom/handlers/DOMPluginHandler.ts#L44)

WikiEngine reference

***

### linkGraph?

> `optional` **linkGraph**: `Record`\<`string`, `unknown`\>

Defined in: [src/parsers/dom/handlers/DOMPluginHandler.ts:58](https://github.com/jwilleke/amdWiki/blob/b6a859c7c9297966de89735ea5e8f953df289ac1/src/parsers/dom/handlers/DOMPluginHandler.ts#L58)

Link graph for plugins like ReferringPagesPlugin

***

### pageContext?

> `optional` **pageContext**: `object`

Defined in: [src/parsers/dom/handlers/DOMPluginHandler.ts:60](https://github.com/jwilleke/amdWiki/blob/b6a859c7c9297966de89735ea5e8f953df289ac1/src/parsers/dom/handlers/DOMPluginHandler.ts#L60)

Page context (nested structure)

#### Index Signature

\[`key`: `string`\]: `unknown`

#### pageName?

> `optional` **pageName**: `string`

***

### pageName

> **pageName**: `string`

Defined in: [src/parsers/dom/handlers/DOMPluginHandler.ts:25](https://github.com/jwilleke/amdWiki/blob/b6a859c7c9297966de89735ea5e8f953df289ac1/src/parsers/dom/handlers/DOMPluginHandler.ts#L25)

Page name

***

### parameters

> **parameters**: `Record`\<`string`, `string`\>

Defined in: [src/parsers/dom/handlers/DOMPluginHandler.ts:48](https://github.com/jwilleke/amdWiki/blob/b6a859c7c9297966de89735ea5e8f953df289ac1/src/parsers/dom/handlers/DOMPluginHandler.ts#L48)

Plugin parameters

***

### pluginElement?

> `optional` **pluginElement**: `Element` \| `null`

Defined in: [src/parsers/dom/handlers/DOMPluginHandler.ts:56](https://github.com/jwilleke/amdWiki/blob/b6a859c7c9297966de89735ea5e8f953df289ac1/src/parsers/dom/handlers/DOMPluginHandler.ts#L56)

Plugin DOM element

***

### pluginName

> **pluginName**: `string`

Defined in: [src/parsers/dom/handlers/DOMPluginHandler.ts:52](https://github.com/jwilleke/amdWiki/blob/b6a859c7c9297966de89735ea5e8f953df289ac1/src/parsers/dom/handlers/DOMPluginHandler.ts#L52)

Plugin name

***

### requestInfo?

> `optional` **requestInfo**: `object`

Defined in: [src/parsers/dom/handlers/DOMPluginHandler.ts:37](https://github.com/jwilleke/amdWiki/blob/b6a859c7c9297966de89735ea5e8f953df289ac1/src/parsers/dom/handlers/DOMPluginHandler.ts#L37)

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

Defined in: [src/parsers/dom/handlers/DOMPluginHandler.ts:29](https://github.com/jwilleke/amdWiki/blob/b6a859c7c9297966de89735ea5e8f953df289ac1/src/parsers/dom/handlers/DOMPluginHandler.ts#L29)

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

***

### userName

> **userName**: `string`

Defined in: [src/parsers/dom/handlers/DOMPluginHandler.ts:27](https://github.com/jwilleke/amdWiki/blob/b6a859c7c9297966de89735ea5e8f953df289ac1/src/parsers/dom/handlers/DOMPluginHandler.ts#L27)

User name

***

### wikiContext?

> `optional` **wikiContext**: `unknown`

Defined in: [src/parsers/dom/handlers/DOMPluginHandler.ts:46](https://github.com/jwilleke/amdWiki/blob/b6a859c7c9297966de89735ea5e8f953df289ac1/src/parsers/dom/handlers/DOMPluginHandler.ts#L46)

WikiContext reference

***

### wikiDocument?

> `optional` **wikiDocument**: [`default`](../../../WikiDocument/classes/default.md)

Defined in: [src/parsers/dom/handlers/DOMPluginHandler.ts:54](https://github.com/jwilleke/amdWiki/blob/b6a859c7c9297966de89735ea5e8f953df289ac1/src/parsers/dom/handlers/DOMPluginHandler.ts#L54)

WikiDocument reference
