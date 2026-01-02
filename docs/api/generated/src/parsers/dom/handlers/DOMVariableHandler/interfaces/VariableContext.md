[**amdWiki API v1.5.0**](../../../../../../README.md)

***

[amdWiki API](../../../../../../README.md) / [src/parsers/dom/handlers/DOMVariableHandler](../README.md) / VariableContext

# Interface: VariableContext

Defined in: [src/parsers/dom/handlers/DOMVariableHandler.ts:22](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/parsers/dom/handlers/DOMVariableHandler.ts#L22)

Context for variable resolution

## Indexable

\[`key`: `string`\]: `unknown`

Additional context properties

## Properties

### engine?

> `optional` **engine**: `unknown`

Defined in: [src/parsers/dom/handlers/DOMVariableHandler.ts:43](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/parsers/dom/handlers/DOMVariableHandler.ts#L43)

WikiEngine reference

***

### pageContext?

> `optional` **pageContext**: `VariableContext`

Defined in: [src/parsers/dom/handlers/DOMVariableHandler.ts:41](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/parsers/dom/handlers/DOMVariableHandler.ts#L41)

Page context (nested structure from WikiContext)

***

### pageName?

> `optional` **pageName**: `string`

Defined in: [src/parsers/dom/handlers/DOMVariableHandler.ts:24](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/parsers/dom/handlers/DOMVariableHandler.ts#L24)

Page name

***

### requestInfo?

> `optional` **requestInfo**: `object`

Defined in: [src/parsers/dom/handlers/DOMVariableHandler.ts:34](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/parsers/dom/handlers/DOMVariableHandler.ts#L34)

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

Defined in: [src/parsers/dom/handlers/DOMVariableHandler.ts:26](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/parsers/dom/handlers/DOMVariableHandler.ts#L26)

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
