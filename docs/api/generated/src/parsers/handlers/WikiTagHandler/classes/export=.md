[**amdWiki API v1.5.0**](../../../../../README.md)

***

[amdWiki API](../../../../../README.md) / [src/parsers/handlers/WikiTagHandler](../README.md) / export=

# Class: export=

Defined in: [src/parsers/handlers/WikiTagHandler.js:14](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/handlers/WikiTagHandler.js#L14)

WikiTagHandler - JSP-like tag processing for conditional content and page inclusion

Supports JSPWiki WikiTags:
- <wiki:If test="condition">content</wiki:If> - Conditional display
- <wiki:Include page="PageName" /> - Page inclusion
- <wiki:UserCheck status="authenticated">content</wiki:UserCheck> - User validation

Related Issue: #59 - WikiTag Handler (If, Include, UserCheck)
Epic: #41 - Implement JSPWikiMarkupParser for Complete Enhancement Support

## Extends

- [`BaseSyntaxHandler`](../../BaseSyntaxHandler/classes/BaseSyntaxHandler.md)

## Constructors

### Constructor

> **new export=**(`engine`): `WikiTagHandler`

Defined in: [src/parsers/handlers/WikiTagHandler.js:15](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/handlers/WikiTagHandler.js#L15)

#### Parameters

##### engine

`any` = `null`

#### Returns

`WikiTagHandler`

#### Overrides

[`BaseSyntaxHandler`](../../BaseSyntaxHandler/classes/BaseSyntaxHandler.md).[`constructor`](../../BaseSyntaxHandler/classes/BaseSyntaxHandler.md#constructor)

## Properties

### config

> **config**: `any`

Defined in: [src/parsers/handlers/WikiTagHandler.js:29](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/handlers/WikiTagHandler.js#L29)

***

### dependencies

> **dependencies**: `any`

Defined in: [src/parsers/handlers/BaseSyntaxHandler.js:47](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/handlers/BaseSyntaxHandler.js#L47)

#### Inherited from

[`BaseSyntaxHandler`](../../BaseSyntaxHandler/classes/BaseSyntaxHandler.md).[`dependencies`](../../BaseSyntaxHandler/classes/BaseSyntaxHandler.md#dependencies)

***

### dependencyErrors

> **dependencyErrors**: `any`[]

Defined in: [src/parsers/handlers/BaseSyntaxHandler.js:135](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/handlers/BaseSyntaxHandler.js#L135)

#### Inherited from

[`BaseSyntaxHandler`](../../BaseSyntaxHandler/classes/BaseSyntaxHandler.md).[`dependencyErrors`](../../BaseSyntaxHandler/classes/BaseSyntaxHandler.md#dependencyerrors)

***

### description

> **description**: `any`

Defined in: [src/parsers/handlers/BaseSyntaxHandler.js:46](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/handlers/BaseSyntaxHandler.js#L46)

#### Inherited from

[`BaseSyntaxHandler`](../../BaseSyntaxHandler/classes/BaseSyntaxHandler.md).[`description`](../../BaseSyntaxHandler/classes/BaseSyntaxHandler.md#description)

***

### enabled

> **enabled**: `any`

Defined in: [src/parsers/handlers/BaseSyntaxHandler.js:60](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/handlers/BaseSyntaxHandler.js#L60)

#### Inherited from

[`BaseSyntaxHandler`](../../BaseSyntaxHandler/classes/BaseSyntaxHandler.md).[`enabled`](../../BaseSyntaxHandler/classes/BaseSyntaxHandler.md#enabled)

***

### engine

> **engine**: `any`

Defined in: [src/parsers/handlers/WikiTagHandler.js:28](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/handlers/WikiTagHandler.js#L28)

***

### handlerId

> **handlerId**: `string`

Defined in: [src/parsers/handlers/WikiTagHandler.js:27](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/handlers/WikiTagHandler.js#L27)

#### Inherited from

[`BaseSyntaxHandler`](../../BaseSyntaxHandler/classes/BaseSyntaxHandler.md).[`handlerId`](../../BaseSyntaxHandler/classes/BaseSyntaxHandler.md#handlerid)

***

### initContext

> **initContext**: `any`

Defined in: [src/parsers/handlers/BaseSyntaxHandler.js:107](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/handlers/BaseSyntaxHandler.js#L107)

#### Inherited from

[`BaseSyntaxHandler`](../../BaseSyntaxHandler/classes/BaseSyntaxHandler.md).[`initContext`](../../BaseSyntaxHandler/classes/BaseSyntaxHandler.md#initcontext)

***

### initialized

> **initialized**: `boolean`

Defined in: [src/parsers/handlers/BaseSyntaxHandler.js:59](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/handlers/BaseSyntaxHandler.js#L59)

#### Inherited from

[`BaseSyntaxHandler`](../../BaseSyntaxHandler/classes/BaseSyntaxHandler.md).[`initialized`](../../BaseSyntaxHandler/classes/BaseSyntaxHandler.md#initialized)

***

### options

> **options**: `any`

Defined in: [src/parsers/handlers/BaseSyntaxHandler.js:33](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/handlers/BaseSyntaxHandler.js#L33)

#### Inherited from

[`BaseSyntaxHandler`](../../BaseSyntaxHandler/classes/BaseSyntaxHandler.md).[`options`](../../BaseSyntaxHandler/classes/BaseSyntaxHandler.md#options)

***

### pattern

> **pattern**: `RegExp`

Defined in: [src/parsers/handlers/BaseSyntaxHandler.js:41](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/handlers/BaseSyntaxHandler.js#L41)

#### Inherited from

[`BaseSyntaxHandler`](../../BaseSyntaxHandler/classes/BaseSyntaxHandler.md).[`pattern`](../../BaseSyntaxHandler/classes/BaseSyntaxHandler.md#pattern)

***

### priority

> **priority**: `number`

Defined in: [src/parsers/handlers/BaseSyntaxHandler.js:32](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/handlers/BaseSyntaxHandler.js#L32)

#### Inherited from

[`BaseSyntaxHandler`](../../BaseSyntaxHandler/classes/BaseSyntaxHandler.md).[`priority`](../../BaseSyntaxHandler/classes/BaseSyntaxHandler.md#priority)

***

### stats

> **stats**: `object`

Defined in: [src/parsers/handlers/BaseSyntaxHandler.js:50](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/handlers/BaseSyntaxHandler.js#L50)

#### averageTime

> **averageTime**: `number` = `0`

#### errorCount

> **errorCount**: `number` = `0`

#### executionCount

> **executionCount**: `number` = `0`

#### lastExecuted

> **lastExecuted**: `any` = `null`

#### totalTime

> **totalTime**: `number` = `0`

#### Inherited from

[`BaseSyntaxHandler`](../../BaseSyntaxHandler/classes/BaseSyntaxHandler.md).[`stats`](../../BaseSyntaxHandler/classes/BaseSyntaxHandler.md#stats)

***

### supportedTags

> **supportedTags**: `Set`\<`string`\>

Defined in: [src/parsers/handlers/WikiTagHandler.js:32](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/handlers/WikiTagHandler.js#L32)

***

### version

> **version**: `any`

Defined in: [src/parsers/handlers/BaseSyntaxHandler.js:45](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/handlers/BaseSyntaxHandler.js#L45)

#### Inherited from

[`BaseSyntaxHandler`](../../BaseSyntaxHandler/classes/BaseSyntaxHandler.md).[`version`](../../BaseSyntaxHandler/classes/BaseSyntaxHandler.md#version)

## Methods

### buildRegexFlags()

> **buildRegexFlags**(): `string`

Defined in: [src/parsers/handlers/BaseSyntaxHandler.js:87](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/handlers/BaseSyntaxHandler.js#L87)

Build regex flags based on options

#### Returns

`string`

- Regex flags string

#### Inherited from

[`BaseSyntaxHandler`](../../BaseSyntaxHandler/classes/BaseSyntaxHandler.md).[`buildRegexFlags`](../../BaseSyntaxHandler/classes/BaseSyntaxHandler.md#buildregexflags)

***

### checkIncludePermission()

> **checkIncludePermission**(`pageName`, `context`): `Promise`\<`boolean`\>

Defined in: [src/parsers/handlers/WikiTagHandler.js:466](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/handlers/WikiTagHandler.js#L466)

Check if user has permission to include specified page

#### Parameters

##### pageName

`string`

Page to include

##### context

`ParseContext`

Parse context

#### Returns

`Promise`\<`boolean`\>

- True if permission granted

***

### clone()

> **clone**(`overrides`): `any`

Defined in: [src/parsers/handlers/BaseSyntaxHandler.js:530](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/handlers/BaseSyntaxHandler.js#L530)

Create a clone of this handler with different options

#### Parameters

##### overrides

`any` = `{}`

Option overrides

#### Returns

`any`

- Handler configuration for creating new instance

#### Inherited from

[`BaseSyntaxHandler`](../../BaseSyntaxHandler/classes/BaseSyntaxHandler.md).[`clone`](../../BaseSyntaxHandler/classes/BaseSyntaxHandler.md#clone)

***

### compilePattern()

> **compilePattern**(`pattern`): `RegExp`

Defined in: [src/parsers/handlers/BaseSyntaxHandler.js:68](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/handlers/BaseSyntaxHandler.js#L68)

Compile pattern into RegExp if it's a string

#### Parameters

##### pattern

Pattern to compile

`string` | `RegExp`

#### Returns

`RegExp`

- Compiled regular expression

#### Inherited from

[`BaseSyntaxHandler`](../../BaseSyntaxHandler/classes/BaseSyntaxHandler.md).[`compilePattern`](../../BaseSyntaxHandler/classes/BaseSyntaxHandler.md#compilepattern)

***

### createErrorContext()

> **createErrorContext**(`error`, `content`, `context`): `any`

Defined in: [src/parsers/handlers/BaseSyntaxHandler.js:307](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/handlers/BaseSyntaxHandler.js#L307)

Create error context for debugging

#### Parameters

##### error

`Error`

The error that occurred

##### content

`string`

Content being processed

##### context

`ParseContext`

Parse context

#### Returns

`any`

- Error context

#### Inherited from

[`BaseSyntaxHandler`](../../BaseSyntaxHandler/classes/BaseSyntaxHandler.md).[`createErrorContext`](../../BaseSyntaxHandler/classes/BaseSyntaxHandler.md#createerrorcontext)

***

### createTimeoutPromise()

> **createTimeoutPromise**(): `Promise`\<`any`\>

Defined in: [src/parsers/handlers/BaseSyntaxHandler.js:288](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/handlers/BaseSyntaxHandler.js#L288)

Create timeout promise for handler execution

#### Returns

`Promise`\<`any`\>

- Promise that rejects after timeout

#### Inherited from

[`BaseSyntaxHandler`](../../BaseSyntaxHandler/classes/BaseSyntaxHandler.md).[`createTimeoutPromise`](../../BaseSyntaxHandler/classes/BaseSyntaxHandler.md#createtimeoutpromise)

***

### disable()

> **disable**(): `void`

Defined in: [src/parsers/handlers/BaseSyntaxHandler.js:451](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/handlers/BaseSyntaxHandler.js#L451)

Disable the handler

#### Returns

`void`

#### Inherited from

[`BaseSyntaxHandler`](../../BaseSyntaxHandler/classes/BaseSyntaxHandler.md).[`disable`](../../BaseSyntaxHandler/classes/BaseSyntaxHandler.md#disable)

***

### enable()

> **enable**(): `void`

Defined in: [src/parsers/handlers/BaseSyntaxHandler.js:444](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/handlers/BaseSyntaxHandler.js#L444)

Enable the handler

#### Returns

`void`

#### Inherited from

[`BaseSyntaxHandler`](../../BaseSyntaxHandler/classes/BaseSyntaxHandler.md).[`enable`](../../BaseSyntaxHandler/classes/BaseSyntaxHandler.md#enable)

***

### evaluateComplexCondition()

> **evaluateComplexCondition**(`condition`, `context`): `Promise`\<`boolean`\>

Defined in: [src/parsers/handlers/WikiTagHandler.js:400](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/handlers/WikiTagHandler.js#L400)

Evaluate complex boolean conditions with && and || operators

#### Parameters

##### condition

`string`

Complex condition expression

##### context

`ParseContext`

Parse context

#### Returns

`Promise`\<`boolean`\>

- Evaluation result

***

### evaluateCondition()

> **evaluateCondition**(`condition`, `context`): `Promise`\<`boolean`\>

Defined in: [src/parsers/handlers/WikiTagHandler.js:333](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/handlers/WikiTagHandler.js#L333)

Evaluate conditional expression for wiki:If tags

#### Parameters

##### condition

`string`

Condition expression to evaluate

##### context

`ParseContext`

Parse context

#### Returns

`Promise`\<`boolean`\>

- True if condition passes

***

### execute()

> **execute**(`content`, `context`): `Promise`\<`string`\>

Defined in: [src/parsers/handlers/BaseSyntaxHandler.js:241](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/handlers/BaseSyntaxHandler.js#L241)

Execute the handler with performance tracking and error handling

#### Parameters

##### content

`string`

Content to process

##### context

`ParseContext`

Parse context

#### Returns

`Promise`\<`string`\>

- Processed content

#### Inherited from

[`BaseSyntaxHandler`](../../BaseSyntaxHandler/classes/BaseSyntaxHandler.md).[`execute`](../../BaseSyntaxHandler/classes/BaseSyntaxHandler.md#execute)

***

### extractSection()

> **extractSection**(`content`, `sectionName`): `string`

Defined in: [src/parsers/handlers/WikiTagHandler.js:497](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/handlers/WikiTagHandler.js#L497)

Extract specific section from page content

#### Parameters

##### content

`string`

Full page content

##### sectionName

`string`

Section name to extract

#### Returns

`string`

- Section content or full content if section not found

***

### generateContentHash()

> **generateContentHash**(`content`): `string`

Defined in: [src/parsers/handlers/WikiTagHandler.js:566](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/handlers/WikiTagHandler.js#L566)

Generate content hash for caching

#### Parameters

##### content

`string`

Content to hash

#### Returns

`string`

- Content hash

***

### generateContextHash()

> **generateContextHash**(`context`): `string`

Defined in: [src/parsers/handlers/WikiTagHandler.js:576](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/handlers/WikiTagHandler.js#L576)

Generate context hash for caching

#### Parameters

##### context

`ParseContext`

Parse context

#### Returns

`string`

- Context hash

***

### getDependencyErrors()

> **getDependencyErrors**(): `any`[]

Defined in: [src/parsers/handlers/BaseSyntaxHandler.js:203](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/handlers/BaseSyntaxHandler.js#L203)

Get dependency validation errors

#### Returns

`any`[]

- Array of dependency errors

#### Inherited from

[`BaseSyntaxHandler`](../../BaseSyntaxHandler/classes/BaseSyntaxHandler.md).[`getDependencyErrors`](../../BaseSyntaxHandler/classes/BaseSyntaxHandler.md#getdependencyerrors)

***

### getInfo()

> **getInfo**(): `any`

Defined in: [src/parsers/handlers/WikiTagHandler.js:629](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/handlers/WikiTagHandler.js#L629)

Get handler information for debugging and documentation

#### Returns

`any`

- Handler information

***

### getMetadata()

> **getMetadata**(): `any`

Defined in: [src/parsers/handlers/BaseSyntaxHandler.js:494](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/handlers/BaseSyntaxHandler.js#L494)

Get handler metadata

#### Returns

`any`

- Handler metadata

#### Inherited from

[`BaseSyntaxHandler`](../../BaseSyntaxHandler/classes/BaseSyntaxHandler.md).[`getMetadata`](../../BaseSyntaxHandler/classes/BaseSyntaxHandler.md#getmetadata)

***

### getStats()

> **getStats**(): `any`

Defined in: [src/parsers/handlers/BaseSyntaxHandler.js:467](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/handlers/BaseSyntaxHandler.js#L467)

Get handler statistics

#### Returns

`any`

- Handler statistics

#### Inherited from

[`BaseSyntaxHandler`](../../BaseSyntaxHandler/classes/BaseSyntaxHandler.md).[`getStats`](../../BaseSyntaxHandler/classes/BaseSyntaxHandler.md#getstats)

***

### getSupportedConditions()

> **getSupportedConditions**(): `string`[]

Defined in: [src/parsers/handlers/WikiTagHandler.js:611](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/handlers/WikiTagHandler.js#L611)

Get supported conditions for wiki:If tags

#### Returns

`string`[]

- Array of supported conditions

***

### getSupportedPatterns()

> **getSupportedPatterns**(): `string`[]

Defined in: [src/parsers/handlers/WikiTagHandler.js:595](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/handlers/WikiTagHandler.js#L595)

Get supported WikiTag patterns

#### Returns

`string`[]

- Array of supported patterns

***

### handle()

> **handle**(`matchInfo`, `context`): `Promise`\<`string`\>

Defined in: [src/parsers/handlers/WikiTagHandler.js:118](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/handlers/WikiTagHandler.js#L118)

Handle a specific WikiTag match

#### Parameters

##### matchInfo

`any`

WikiTag match information

##### context

`ParseContext`

Parse context

#### Returns

`Promise`\<`string`\>

- Tag output HTML

#### Overrides

[`BaseSyntaxHandler`](../../BaseSyntaxHandler/classes/BaseSyntaxHandler.md).[`handle`](../../BaseSyntaxHandler/classes/BaseSyntaxHandler.md#handle)

***

### handleIfTag()

> **handleIfTag**(`attributes`, `content`, `context`): `Promise`\<`string`\>

Defined in: [src/parsers/handlers/WikiTagHandler.js:178](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/handlers/WikiTagHandler.js#L178)

Handle wiki:If tag - conditional content display

#### Parameters

##### attributes

`any`

Tag attributes

##### content

`string`

Tag content

##### context

`ParseContext`

Parse context

#### Returns

`Promise`\<`string`\>

- Conditional content or empty string

***

### handleIncludeTag()

> **handleIncludeTag**(`attributes`, `context`): `Promise`\<`string`\>

Defined in: [src/parsers/handlers/WikiTagHandler.js:213](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/handlers/WikiTagHandler.js#L213)

Handle wiki:Include tag - page inclusion

#### Parameters

##### attributes

`any`

Tag attributes

##### context

`ParseContext`

Parse context

#### Returns

`Promise`\<`string`\>

- Included page content

***

### handleUserCheckTag()

> **handleUserCheckTag**(`attributes`, `content`, `context`): `Promise`\<`string`\>

Defined in: [src/parsers/handlers/WikiTagHandler.js:277](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/handlers/WikiTagHandler.js#L277)

Handle wiki:UserCheck tag - user authentication and authorization checks

#### Parameters

##### attributes

`any`

Tag attributes

##### content

`string`

Tag content

##### context

`ParseContext`

Parse context

#### Returns

`Promise`\<`string`\>

- Content if user check passes, empty otherwise

***

### hasDependencyErrors()

> **hasDependencyErrors**(): `boolean`

Defined in: [src/parsers/handlers/BaseSyntaxHandler.js:211](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/handlers/BaseSyntaxHandler.js#L211)

Check if handler has unresolved dependencies

#### Returns

`boolean`

- True if there are dependency errors

#### Inherited from

[`BaseSyntaxHandler`](../../BaseSyntaxHandler/classes/BaseSyntaxHandler.md).[`hasDependencyErrors`](../../BaseSyntaxHandler/classes/BaseSyntaxHandler.md#hasdependencyerrors)

***

### initialize()

> **initialize**(`context`): `Promise`\<`void`\>

Defined in: [src/parsers/handlers/BaseSyntaxHandler.js:101](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/handlers/BaseSyntaxHandler.js#L101)

Initialize the handler (optional override)
Called when handler is registered

#### Parameters

##### context

`any` = `{}`

Initialization context

#### Returns

`Promise`\<`void`\>

#### Inherited from

[`BaseSyntaxHandler`](../../BaseSyntaxHandler/classes/BaseSyntaxHandler.md).[`initialize`](../../BaseSyntaxHandler/classes/BaseSyntaxHandler.md#initialize)

***

### isEnabled()

> **isEnabled**(): `boolean`

Defined in: [src/parsers/handlers/BaseSyntaxHandler.js:459](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/handlers/BaseSyntaxHandler.js#L459)

Check if handler is enabled

#### Returns

`boolean`

- True if enabled

#### Inherited from

[`BaseSyntaxHandler`](../../BaseSyntaxHandler/classes/BaseSyntaxHandler.md).[`isEnabled`](../../BaseSyntaxHandler/classes/BaseSyntaxHandler.md#isenabled)

***

### isRecursiveInclusion()

> **isRecursiveInclusion**(`pageName`, `context`): `boolean`

Defined in: [src/parsers/handlers/WikiTagHandler.js:486](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/handlers/WikiTagHandler.js#L486)

Check for recursive inclusion to prevent infinite loops

#### Parameters

##### pageName

`string`

Page being included

##### context

`ParseContext`

Parse context

#### Returns

`boolean`

- True if recursive inclusion detected

***

### onInitialize()

> **onInitialize**(`context`): `Promise`\<`void`\>

Defined in: [src/parsers/handlers/WikiTagHandler.js:39](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/handlers/WikiTagHandler.js#L39)

Initialize handler with configuration

#### Parameters

##### context

`any`

Initialization context

#### Returns

`Promise`\<`void`\>

#### Overrides

[`BaseSyntaxHandler`](../../BaseSyntaxHandler/classes/BaseSyntaxHandler.md).[`onInitialize`](../../BaseSyntaxHandler/classes/BaseSyntaxHandler.md#oninitialize)

***

### onShutdown()

> **onShutdown**(): `Promise`\<`void`\>

Defined in: [src/parsers/handlers/BaseSyntaxHandler.js:521](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/handlers/BaseSyntaxHandler.js#L521)

Custom shutdown logic (override in subclasses)

#### Returns

`Promise`\<`void`\>

#### Inherited from

[`BaseSyntaxHandler`](../../BaseSyntaxHandler/classes/BaseSyntaxHandler.md).[`onShutdown`](../../BaseSyntaxHandler/classes/BaseSyntaxHandler.md#onshutdown)

***

### parseParameters()

> **parseParameters**(`paramString`): `any`

Defined in: [src/parsers/handlers/BaseSyntaxHandler.js:330](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/handlers/BaseSyntaxHandler.js#L330)

Parse parameters from parameter string
Handles various formats: key=value, key='value', key="value"

#### Parameters

##### paramString

`string`

Parameter string to parse

#### Returns

`any`

- Parsed parameters

#### Inherited from

[`BaseSyntaxHandler`](../../BaseSyntaxHandler/classes/BaseSyntaxHandler.md).[`parseParameters`](../../BaseSyntaxHandler/classes/BaseSyntaxHandler.md#parseparameters)

***

### parseTagAttributes()

> **parseTagAttributes**(`attributeString`): `any`

Defined in: [src/parsers/handlers/WikiTagHandler.js:542](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/handlers/WikiTagHandler.js#L542)

Parse tag attributes from attribute string

#### Parameters

##### attributeString

`string`

Attribute string to parse

#### Returns

`any`

- Parsed attributes

***

### process()

> **process**(`content`, `context`): `Promise`\<`string`\>

Defined in: [src/parsers/handlers/WikiTagHandler.js:60](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/handlers/WikiTagHandler.js#L60)

Process content by finding and executing all WikiTag instances

#### Parameters

##### content

`string`

Content to process

##### context

`ParseContext`

Parse context

#### Returns

`Promise`\<`string`\>

- Content with WikiTags processed

#### Overrides

[`BaseSyntaxHandler`](../../BaseSyntaxHandler/classes/BaseSyntaxHandler.md).[`process`](../../BaseSyntaxHandler/classes/BaseSyntaxHandler.md#process)

***

### resetStats()

> **resetStats**(): `void`

Defined in: [src/parsers/handlers/BaseSyntaxHandler.js:480](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/handlers/BaseSyntaxHandler.js#L480)

Reset handler statistics

#### Returns

`void`

#### Inherited from

[`BaseSyntaxHandler`](../../BaseSyntaxHandler/classes/BaseSyntaxHandler.md).[`resetStats`](../../BaseSyntaxHandler/classes/BaseSyntaxHandler.md#resetstats)

***

### resolveContextVariable()

> **resolveContextVariable**(`varName`, `context`): `Promise`\<`string`\>

Defined in: [src/parsers/handlers/WikiTagHandler.js:436](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/handlers/WikiTagHandler.js#L436)

Resolve context variable for conditions

#### Parameters

##### varName

`string`

Variable name

##### context

`ParseContext`

Parse context

#### Returns

`Promise`\<`string`\>

- Variable value

***

### shutdown()

> **shutdown**(): `Promise`\<`void`\>

Defined in: [src/parsers/handlers/BaseSyntaxHandler.js:512](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/handlers/BaseSyntaxHandler.js#L512)

Clean up handler resources (optional override)
Called when handler is unregistered

#### Returns

`Promise`\<`void`\>

#### Inherited from

[`BaseSyntaxHandler`](../../BaseSyntaxHandler/classes/BaseSyntaxHandler.md).[`shutdown`](../../BaseSyntaxHandler/classes/BaseSyntaxHandler.md#shutdown)

***

### toString()

> **toString**(): `string`

Defined in: [src/parsers/handlers/BaseSyntaxHandler.js:547](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/handlers/BaseSyntaxHandler.js#L547)

String representation of handler

#### Returns

`string`

- String representation

#### Inherited from

[`BaseSyntaxHandler`](../../BaseSyntaxHandler/classes/BaseSyntaxHandler.md).[`toString`](../../BaseSyntaxHandler/classes/BaseSyntaxHandler.md#tostring)

***

### validateDependencies()

> **validateDependencies**(`context`): `Promise`\<`void`\>

Defined in: [src/parsers/handlers/BaseSyntaxHandler.js:132](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/handlers/BaseSyntaxHandler.js#L132)

Validate handler dependencies

#### Parameters

##### context

`any`

Initialization context

#### Returns

`Promise`\<`void`\>

#### Inherited from

[`BaseSyntaxHandler`](../../BaseSyntaxHandler/classes/BaseSyntaxHandler.md).[`validateDependencies`](../../BaseSyntaxHandler/classes/BaseSyntaxHandler.md#validatedependencies)

***

### validateParameter()

> **validateParameter**(`key`, `value`, `rule`): `any`

Defined in: [src/parsers/handlers/BaseSyntaxHandler.js:397](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/handlers/BaseSyntaxHandler.js#L397)

Validate a single parameter

#### Parameters

##### key

`string`

Parameter key

##### value

`any`

Parameter value

##### rule

`any`

Validation rule

#### Returns

`any`

- Validation result

#### Inherited from

[`BaseSyntaxHandler`](../../BaseSyntaxHandler/classes/BaseSyntaxHandler.md).[`validateParameter`](../../BaseSyntaxHandler/classes/BaseSyntaxHandler.md#validateparameter)

***

### validateParameters()

> **validateParameters**(`params`, `schema`): `any`

Defined in: [src/parsers/handlers/BaseSyntaxHandler.js:361](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/handlers/BaseSyntaxHandler.js#L361)

Validate parameters against schema

#### Parameters

##### params

`any`

Parameters to validate

##### schema

`any` = `{}`

Validation schema

#### Returns

`any`

- Validation result

#### Inherited from

[`BaseSyntaxHandler`](../../BaseSyntaxHandler/classes/BaseSyntaxHandler.md).[`validateParameters`](../../BaseSyntaxHandler/classes/BaseSyntaxHandler.md#validateparameters)

***

### validateSpecificDependency()

> **validateSpecificDependency**(`dependency`, `context`): `Promise`\<`void`\>

Defined in: [src/parsers/handlers/BaseSyntaxHandler.js:170](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/handlers/BaseSyntaxHandler.js#L170)

Validate specific dependency requirement

#### Parameters

##### dependency

`any`

Dependency specification

##### context

`any`

Initialization context

#### Returns

`Promise`\<`void`\>

#### Inherited from

[`BaseSyntaxHandler`](../../BaseSyntaxHandler/classes/BaseSyntaxHandler.md).[`validateSpecificDependency`](../../BaseSyntaxHandler/classes/BaseSyntaxHandler.md#validatespecificdependency)
