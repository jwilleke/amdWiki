[**amdWiki API v1.5.0**](../../../../README.md)

***

[amdWiki API](../../../../README.md) / [src/managers/VariableManager](../README.md) / VariableContext

# Interface: VariableContext

Defined in: [src/managers/VariableManager.ts:13](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/managers/VariableManager.ts#L13)

Variable context interface - contains contextual information for variable expansion

## Indexable

\[`key`: `string`\]: `unknown`

## Properties

### pageName?

> `optional` **pageName**: `string`

Defined in: [src/managers/VariableManager.ts:14](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/managers/VariableManager.ts#L14)

***

### requestInfo?

> `optional` **requestInfo**: `object`

Defined in: [src/managers/VariableManager.ts:22](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/managers/VariableManager.ts#L22)

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

Defined in: [src/managers/VariableManager.ts:16](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/managers/VariableManager.ts#L16)

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

Defined in: [src/managers/VariableManager.ts:15](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/managers/VariableManager.ts#L15)
