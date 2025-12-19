[**amdWiki API v1.5.0**](../../../../../README.md)

***

[amdWiki API](../../../../../README.md) / [src/parsers/dom/DOMParser](../README.md) / ParseError

# Class: ParseError

Defined in: [src/parsers/dom/DOMParser.js:358](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/dom/DOMParser.js#L358)

Custom error class for parse errors

## Extends

- `Error`

## Constructors

### Constructor

> **new ParseError**(`type`, `position`, `line`, `column`, `message`, `cause`): `ParseError`

Defined in: [src/parsers/dom/DOMParser.js:369](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/dom/DOMParser.js#L369)

Creates a parse error with position information

#### Parameters

##### type

`string`

Error type

##### position

`number`

Character position

##### line

`number`

Line number

##### column

`number`

Column number

##### message

`string`

Error message

##### cause

`Error` = `null`

Underlying error

#### Returns

`ParseError`

#### Overrides

`Error.constructor`

## Properties

### cause

> **cause**: `Error`

Defined in: [src/parsers/dom/DOMParser.js:376](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/dom/DOMParser.js#L376)

***

### column

> **column**: `number`

Defined in: [src/parsers/dom/DOMParser.js:375](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/dom/DOMParser.js#L375)

***

### line

> **line**: `number`

Defined in: [src/parsers/dom/DOMParser.js:374](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/dom/DOMParser.js#L374)

***

### message

> **message**: `string`

Defined in: [src/parsers/dom/DOMParser.js:380](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/dom/DOMParser.js#L380)

#### Inherited from

`Error.message`

***

### name

> **name**: `string`

Defined in: [src/parsers/dom/DOMParser.js:371](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/dom/DOMParser.js#L371)

#### Inherited from

`Error.name`

***

### position

> **position**: `number`

Defined in: [src/parsers/dom/DOMParser.js:373](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/dom/DOMParser.js#L373)

***

### type

> **type**: `string`

Defined in: [src/parsers/dom/DOMParser.js:372](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/dom/DOMParser.js#L372)
