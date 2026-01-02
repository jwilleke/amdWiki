[**amdWiki API v1.5.0**](../../../../../README.md)

***

[amdWiki API](../../../../../README.md) / [src/parsers/handlers/BaseSyntaxHandler](../README.md) / HandlerExecutionError

# Class: HandlerExecutionError

Defined in: [src/parsers/handlers/BaseSyntaxHandler.ts:737](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/parsers/handlers/BaseSyntaxHandler.ts#L737)

Custom error class for handler execution errors

## Extends

- `Error`

## Constructors

### Constructor

> **new HandlerExecutionError**(`message`, `handlerId`, `context`): `HandlerExecutionError`

Defined in: [src/parsers/handlers/BaseSyntaxHandler.ts:741](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/parsers/handlers/BaseSyntaxHandler.ts#L741)

#### Parameters

##### message

`string`

##### handlerId

`string`

##### context

[`ErrorContext`](../interfaces/ErrorContext.md)

#### Returns

`HandlerExecutionError`

#### Overrides

`Error.constructor`

## Properties

### context

> `readonly` **context**: [`ErrorContext`](../interfaces/ErrorContext.md)

Defined in: [src/parsers/handlers/BaseSyntaxHandler.ts:739](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/parsers/handlers/BaseSyntaxHandler.ts#L739)

***

### handlerId

> `readonly` **handlerId**: `string`

Defined in: [src/parsers/handlers/BaseSyntaxHandler.ts:738](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/parsers/handlers/BaseSyntaxHandler.ts#L738)
