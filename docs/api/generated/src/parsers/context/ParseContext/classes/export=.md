[**amdWiki API v1.5.0**](../../../../../README.md)

***

[amdWiki API](../../../../../README.md) / [src/parsers/context/ParseContext](../README.md) / export=

# Class: export=

Defined in: [src/parsers/context/ParseContext.js:9](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/context/ParseContext.js#L9)

ParseContext - Context object for markup parsing operations

Provides access to page context, user information, engine managers,
and parsing state throughout the processing pipeline.

Related Issue: #55 - Core Infrastructure and Phase System

## Constructors

### Constructor

> **new export=**(`content`, `context`, `engine`): `ParseContext`

Defined in: [src/parsers/context/ParseContext.js:10](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/context/ParseContext.js#L10)

#### Parameters

##### content

`any`

##### context

`any`

##### engine

`any`

#### Returns

`ParseContext`

## Properties

### engine

> **engine**: `any`

Defined in: [src/parsers/context/ParseContext.js:19](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/context/ParseContext.js#L19)

***

### handlerResults

> **handlerResults**: `Map`\<`any`, `any`\>

Defined in: [src/parsers/context/ParseContext.js:51](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/context/ParseContext.js#L51)

***

### metadata

> **metadata**: `object`

Defined in: [src/parsers/context/ParseContext.js:52](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/context/ParseContext.js#L52)

***

### originalContent

> **originalContent**: `any`

Defined in: [src/parsers/context/ParseContext.js:12](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/context/ParseContext.js#L12)

***

### pageContext

> **pageContext**: `any`

Defined in: [src/parsers/context/ParseContext.js:18](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/context/ParseContext.js#L18)

***

### pageName

> **pageName**: `any`

Defined in: [src/parsers/context/ParseContext.js:22](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/context/ParseContext.js#L22)

***

### phaseTimings

> **phaseTimings**: `Map`\<`any`, `any`\>

Defined in: [src/parsers/context/ParseContext.js:56](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/context/ParseContext.js#L56)

***

### protectedBlocks

> **protectedBlocks**: `any`[]

Defined in: [src/parsers/context/ParseContext.js:48](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/context/ParseContext.js#L48)

***

### requestInfo

> **requestInfo**: `any`

Defined in: [src/parsers/context/ParseContext.js:24](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/context/ParseContext.js#L24)

***

### startTime

> **startTime**: `number`

Defined in: [src/parsers/context/ParseContext.js:55](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/context/ParseContext.js#L55)

***

### syntaxTokens

> **syntaxTokens**: `any`[]

Defined in: [src/parsers/context/ParseContext.js:49](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/context/ParseContext.js#L49)

***

### userContext

> **userContext**: `any`

Defined in: [src/parsers/context/ParseContext.js:23](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/context/ParseContext.js#L23)

***

### userName

> **userName**: `any`

Defined in: [src/parsers/context/ParseContext.js:27](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/context/ParseContext.js#L27)

***

### variables

> **variables**: `Map`\<`any`, `any`\>

Defined in: [src/parsers/context/ParseContext.js:50](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/context/ParseContext.js#L50)

## Methods

### clone()

> **clone**(`overrides`): `ParseContext`

Defined in: [src/parsers/context/ParseContext.js:204](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/context/ParseContext.js#L204)

Clone context for sub-processing

#### Parameters

##### overrides

`any` = `{}`

Properties to override

#### Returns

`ParseContext`

- New context instance

***

### createErrorContext()

> **createErrorContext**(`error`, `phase`): `any`

Defined in: [src/parsers/context/ParseContext.js:226](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/context/ParseContext.js#L226)

Create error context for debugging

#### Parameters

##### error

`Error`

Error that occurred

##### phase

`string`

Phase where error occurred

#### Returns

`any`

- Error context

***

### exportForCache()

> **exportForCache**(): `any`

Defined in: [src/parsers/context/ParseContext.js:260](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/context/ParseContext.js#L260)

Export context data for caching

#### Returns

`any`

- Serializable context data

***

### getHandlerResult()

> **getHandlerResult**(`handlerId`): `any`

Defined in: [src/parsers/context/ParseContext.js:150](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/context/ParseContext.js#L150)

Get handler result

#### Parameters

##### handlerId

`string`

Handler identifier

#### Returns

`any`

- Handler result or null

***

### getManager()

> **getManager**(`managerName`): `any`

Defined in: [src/parsers/context/ParseContext.js:64](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/context/ParseContext.js#L64)

Get manager instance from engine

#### Parameters

##### managerName

`string`

Name of manager to retrieve

#### Returns

`any`

- Manager instance or null

***

### getMetadata()

> **getMetadata**(`key`, `defaultValue`): `any`

Defined in: [src/parsers/context/ParseContext.js:169](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/context/ParseContext.js#L169)

Get metadata value

#### Parameters

##### key

`string`

Metadata key

##### defaultValue

`any` = `null`

Default value if not found

#### Returns

`any`

- Metadata value

***

### getPhaseTiming()

> **getPhaseTiming**(`phaseName`): `number`

Defined in: [src/parsers/context/ParseContext.js:187](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/context/ParseContext.js#L187)

Get phase timing

#### Parameters

##### phaseName

`string`

Name of phase

#### Returns

`number`

- Duration in milliseconds or 0

***

### getSummary()

> **getSummary**(): `any`

Defined in: [src/parsers/context/ParseContext.js:242](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/context/ParseContext.js#L242)

Get context summary for logging

#### Returns

`any`

- Context summary

***

### getTotalTime()

> **getTotalTime**(): `number`

Defined in: [src/parsers/context/ParseContext.js:195](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/context/ParseContext.js#L195)

Get total processing time

#### Returns

`number`

- Total time in milliseconds

***

### getUserRoles()

> **getUserRoles**(): `string`[]

Defined in: [src/parsers/context/ParseContext.js:101](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/context/ParseContext.js#L101)

Get user roles

#### Returns

`string`[]

- Array of user roles

***

### getVariable()

> **getVariable**(`name`, `defaultValue`): `any`

Defined in: [src/parsers/context/ParseContext.js:132](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/context/ParseContext.js#L132)

Get variable value

#### Parameters

##### name

`string`

Variable name

##### defaultValue

`any` = `null`

Default value if not found

#### Returns

`any`

- Variable value

***

### hasPermission()

> **hasPermission**(`permission`, `resource`): `boolean`

Defined in: [src/parsers/context/ParseContext.js:82](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/context/ParseContext.js#L82)

Check if user has specific permission

#### Parameters

##### permission

`string`

Permission to check

##### resource

`string` = `null`

Resource context (optional)

#### Returns

`boolean`

- True if user has permission

***

### hasRole()

> **hasRole**(`role`): `boolean`

Defined in: [src/parsers/context/ParseContext.js:113](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/context/ParseContext.js#L113)

Check if user has specific role

#### Parameters

##### role

`string`

Role to check

#### Returns

`boolean`

- True if user has role

***

### importFromCache()

> **importFromCache**(`data`): `void`

Defined in: [src/parsers/context/ParseContext.js:279](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/context/ParseContext.js#L279)

Import context data from cache

#### Parameters

##### data

`any`

Cached context data

#### Returns

`void`

***

### isAuthenticated()

> **isAuthenticated**(): `boolean`

Defined in: [src/parsers/context/ParseContext.js:72](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/context/ParseContext.js#L72)

Check if user is authenticated

#### Returns

`boolean`

- True if user is authenticated

***

### recordPhaseTiming()

> **recordPhaseTiming**(`phaseName`, `duration`): `void`

Defined in: [src/parsers/context/ParseContext.js:178](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/context/ParseContext.js#L178)

Record phase timing

#### Parameters

##### phaseName

`string`

Name of phase

##### duration

`number`

Duration in milliseconds

#### Returns

`void`

***

### setHandlerResult()

> **setHandlerResult**(`handlerId`, `result`): `void`

Defined in: [src/parsers/context/ParseContext.js:141](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/context/ParseContext.js#L141)

Store handler result

#### Parameters

##### handlerId

`string`

Handler identifier

##### result

`any`

Handler result

#### Returns

`void`

***

### setMetadata()

> **setMetadata**(`key`, `value`): `void`

Defined in: [src/parsers/context/ParseContext.js:159](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/context/ParseContext.js#L159)

Set metadata value

#### Parameters

##### key

`string`

Metadata key

##### value

`any`

Metadata value

#### Returns

`void`

***

### setVariable()

> **setVariable**(`name`, `value`): `void`

Defined in: [src/parsers/context/ParseContext.js:122](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/context/ParseContext.js#L122)

Set variable value

#### Parameters

##### name

`string`

Variable name

##### value

`any`

Variable value

#### Returns

`void`
