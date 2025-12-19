[**amdWiki API v1.5.0**](../../../../../README.md)

***

[amdWiki API](../../../../../README.md) / [src/parsers/handlers/BaseSyntaxHandler](../README.md) / HandlerExecutionError

# Class: HandlerExecutionError

Defined in: [src/parsers/handlers/BaseSyntaxHandler.js:555](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/handlers/BaseSyntaxHandler.js#L555)

Custom error class for handler execution errors

## Extends

- `Error`

## Constructors

### Constructor

> **new HandlerExecutionError**(`message`, `handlerId`, `context`): `HandlerExecutionError`

Defined in: [src/parsers/handlers/BaseSyntaxHandler.js:556](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/handlers/BaseSyntaxHandler.js#L556)

#### Parameters

##### message

`any`

##### handlerId

`any`

##### context

`any`

#### Returns

`HandlerExecutionError`

#### Overrides

`Error.constructor`

## Properties

### context

> **context**: `any`

Defined in: [src/parsers/handlers/BaseSyntaxHandler.js:560](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/handlers/BaseSyntaxHandler.js#L560)

***

### handlerId

> **handlerId**: `any`

Defined in: [src/parsers/handlers/BaseSyntaxHandler.js:559](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/handlers/BaseSyntaxHandler.js#L559)

***

### name

> **name**: `string`

Defined in: [src/parsers/handlers/BaseSyntaxHandler.js:558](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/handlers/BaseSyntaxHandler.js#L558)

#### Inherited from

`Error.name`
