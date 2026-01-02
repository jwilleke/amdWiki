[**amdWiki API v1.5.0**](../../../../../README.md)

***

[amdWiki API](../../../../../README.md) / [src/parsers/handlers/HandlerRegistry](../README.md) / HandlerRegistrationError

# Class: HandlerRegistrationError

Defined in: [src/parsers/handlers/HandlerRegistry.ts:676](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/parsers/handlers/HandlerRegistry.ts#L676)

Custom error class for handler registration errors

## Extends

- `Error`

## Constructors

### Constructor

> **new HandlerRegistrationError**(`message`, `code`, `context`): `HandlerRegistrationError`

Defined in: [src/parsers/handlers/HandlerRegistry.ts:680](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/parsers/handlers/HandlerRegistry.ts#L680)

#### Parameters

##### message

`string`

##### code

`string`

##### context

`Record`\<`string`, `unknown`\> = `{}`

#### Returns

`HandlerRegistrationError`

#### Overrides

`Error.constructor`

## Properties

### code

> `readonly` **code**: `string`

Defined in: [src/parsers/handlers/HandlerRegistry.ts:677](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/parsers/handlers/HandlerRegistry.ts#L677)

***

### context

> `readonly` **context**: `Record`\<`string`, `unknown`\>

Defined in: [src/parsers/handlers/HandlerRegistry.ts:678](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/parsers/handlers/HandlerRegistry.ts#L678)
