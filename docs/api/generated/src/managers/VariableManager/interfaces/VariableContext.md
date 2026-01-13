[**amdWiki API v1.5.0**](../../../../README.md)

***

[amdWiki API](../../../../README.md) / [src/managers/VariableManager](../README.md) / VariableContext

# Interface: VariableContext

Defined in: [src/managers/VariableManager.ts:15](https://github.com/jwilleke/amdWiki/blob/b6a859c7c9297966de89735ea5e8f953df289ac1/src/managers/VariableManager.ts#L15)

Variable context interface - contains contextual information for variable expansion

## Indexable

\[`key`: `string`\]: `unknown`

## Properties

### pageName?

> `optional` **pageName**: `string`

Defined in: [src/managers/VariableManager.ts:16](https://github.com/jwilleke/amdWiki/blob/b6a859c7c9297966de89735ea5e8f953df289ac1/src/managers/VariableManager.ts#L16)

***

### requestInfo?

> `optional` **requestInfo**: `object`

Defined in: [src/managers/VariableManager.ts:24](https://github.com/jwilleke/amdWiki/blob/b6a859c7c9297966de89735ea5e8f953df289ac1/src/managers/VariableManager.ts#L24)

#### acceptLanguage?

> `optional` **acceptLanguage**: `string`

#### clientIp?

> `optional` **clientIp**: `string`

#### referer?

> `optional` **referer**: `string`

#### sessionId?

> `optional` **sessionId**: `string`

#### userAgent?

> `optional` **userAgent**: `string`

***

### userContext?

> `optional` **userContext**: `object`

Defined in: [src/managers/VariableManager.ts:18](https://github.com/jwilleke/amdWiki/blob/b6a859c7c9297966de89735ea5e8f953df289ac1/src/managers/VariableManager.ts#L18)

#### displayName?

> `optional` **displayName**: `string`

#### isAuthenticated?

> `optional` **isAuthenticated**: `boolean`

#### roles?

> `optional` **roles**: `string`[]

#### username?

> `optional` **username**: `string`

***

### userName?

> `optional` **userName**: `string`

Defined in: [src/managers/VariableManager.ts:17](https://github.com/jwilleke/amdWiki/blob/b6a859c7c9297966de89735ea5e8f953df289ac1/src/managers/VariableManager.ts#L17)
