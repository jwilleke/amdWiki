[**amdWiki API v1.5.0**](../../../../../README.md)

***

[amdWiki API](../../../../../README.md) / [src/parsers/handlers/HandlerRegistry](../README.md) / HandlerRegistrationError

# Class: HandlerRegistrationError

Defined in: [src/parsers/handlers/HandlerRegistry.ts:673](https://github.com/jwilleke/amdWiki/blob/b6a859c7c9297966de89735ea5e8f953df289ac1/src/parsers/handlers/HandlerRegistry.ts#L673)

Custom error class for handler registration errors

## Extends

- `Error`

## Constructors

### Constructor

> **new HandlerRegistrationError**(`message`, `code`, `context`): `HandlerRegistrationError`

Defined in: [src/parsers/handlers/HandlerRegistry.ts:677](https://github.com/jwilleke/amdWiki/blob/b6a859c7c9297966de89735ea5e8f953df289ac1/src/parsers/handlers/HandlerRegistry.ts#L677)

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

Defined in: [src/parsers/handlers/HandlerRegistry.ts:674](https://github.com/jwilleke/amdWiki/blob/b6a859c7c9297966de89735ea5e8f953df289ac1/src/parsers/handlers/HandlerRegistry.ts#L674)

***

### context

> `readonly` **context**: `Record`\<`string`, `unknown`\>

Defined in: [src/parsers/handlers/HandlerRegistry.ts:675](https://github.com/jwilleke/amdWiki/blob/b6a859c7c9297966de89735ea5e8f953df289ac1/src/parsers/handlers/HandlerRegistry.ts#L675)
