[**amdWiki API v1.5.0**](../../../../../../README.md)

***

[amdWiki API](../../../../../../README.md) / [src/parsers/dom/handlers/DOMPluginHandler](../README.md) / PluginContext

# Interface: PluginContext

Defined in: [src/parsers/dom/handlers/DOMPluginHandler.ts:22](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/parsers/dom/handlers/DOMPluginHandler.ts#L22)

Plugin execution context

## Indexable

\[`key`: `string`\]: `unknown`

Additional context properties

## Properties

### bodyContent

> **bodyContent**: `string`

Defined in: [src/parsers/dom/handlers/DOMPluginHandler.ts:49](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/parsers/dom/handlers/DOMPluginHandler.ts#L49)

Plugin body content (for body plugins)

***

### engine

> **engine**: `unknown`

Defined in: [src/parsers/dom/handlers/DOMPluginHandler.ts:43](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/parsers/dom/handlers/DOMPluginHandler.ts#L43)

WikiEngine reference

***

### linkGraph?

> `optional` **linkGraph**: `Record`\<`string`, `unknown`\>

Defined in: [src/parsers/dom/handlers/DOMPluginHandler.ts:57](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/parsers/dom/handlers/DOMPluginHandler.ts#L57)

Link graph for plugins like ReferringPagesPlugin

***

### pageContext?

> `optional` **pageContext**: `object`

Defined in: [src/parsers/dom/handlers/DOMPluginHandler.ts:59](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/parsers/dom/handlers/DOMPluginHandler.ts#L59)

Page context (nested structure)

#### Index Signature

\[`key`: `string`\]: `unknown`

#### pageName?

> `optional` **pageName**: `string`

***

### pageName

> **pageName**: `string`

Defined in: [src/parsers/dom/handlers/DOMPluginHandler.ts:24](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/parsers/dom/handlers/DOMPluginHandler.ts#L24)

Page name

***

### parameters

> **parameters**: `Record`\<`string`, `string`\>

Defined in: [src/parsers/dom/handlers/DOMPluginHandler.ts:47](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/parsers/dom/handlers/DOMPluginHandler.ts#L47)

Plugin parameters

***

### pluginElement?

> `optional` **pluginElement**: `Element`

Defined in: [src/parsers/dom/handlers/DOMPluginHandler.ts:55](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/parsers/dom/handlers/DOMPluginHandler.ts#L55)

Plugin DOM element

***

### pluginName

> **pluginName**: `string`

Defined in: [src/parsers/dom/handlers/DOMPluginHandler.ts:51](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/parsers/dom/handlers/DOMPluginHandler.ts#L51)

Plugin name

***

### requestInfo?

> `optional` **requestInfo**: `object`

Defined in: [src/parsers/dom/handlers/DOMPluginHandler.ts:36](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/parsers/dom/handlers/DOMPluginHandler.ts#L36)

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

Defined in: [src/parsers/dom/handlers/DOMPluginHandler.ts:28](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/parsers/dom/handlers/DOMPluginHandler.ts#L28)

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

Defined in: [src/parsers/dom/handlers/DOMPluginHandler.ts:26](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/parsers/dom/handlers/DOMPluginHandler.ts#L26)

User name

***

### wikiContext?

> `optional` **wikiContext**: `unknown`

Defined in: [src/parsers/dom/handlers/DOMPluginHandler.ts:45](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/parsers/dom/handlers/DOMPluginHandler.ts#L45)

WikiContext reference

***

### wikiDocument?

> `optional` **wikiDocument**: [`default`](../../../WikiDocument/classes/default.md)

Defined in: [src/parsers/dom/handlers/DOMPluginHandler.ts:53](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/parsers/dom/handlers/DOMPluginHandler.ts#L53)

WikiDocument reference
