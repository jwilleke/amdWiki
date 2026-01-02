[**amdWiki API v1.5.0**](../../../../../README.md)

***

[amdWiki API](../../../../../README.md) / [src/parsers/handlers/BaseSyntaxHandler](../README.md) / InitializationContext

# Interface: InitializationContext

Defined in: [src/parsers/handlers/BaseSyntaxHandler.ts:141](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/parsers/handlers/BaseSyntaxHandler.ts#L141)

Initialization context (minimal interface for unconverted dependencies)

## Properties

### engine?

> `optional` **engine**: `object`

Defined in: [src/parsers/handlers/BaseSyntaxHandler.ts:142](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/parsers/handlers/BaseSyntaxHandler.ts#L142)

#### getManager()

> **getManager**(`name`): `unknown`

##### Parameters

###### name

`string`

##### Returns

`unknown`

***

### handlerRegistry?

> `optional` **handlerRegistry**: `object`

Defined in: [src/parsers/handlers/BaseSyntaxHandler.ts:145](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/parsers/handlers/BaseSyntaxHandler.ts#L145)

#### getHandler()

> **getHandler**(`name`): `unknown`

##### Parameters

###### name

`string`

##### Returns

`unknown`
