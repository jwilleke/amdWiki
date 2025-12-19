[**amdWiki API v1.5.0**](../../../../../README.md)

***

[amdWiki API](../../../../../README.md) / [src/parsers/handlers/WikiFormHandler](../README.md) / export=

# Class: export=

Defined in: [src/parsers/handlers/WikiFormHandler.js:17](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/handlers/WikiFormHandler.js#L17)

WikiFormHandler - Interactive form generation within wiki pages

Supports JSPWiki form syntax:
- [{FormOpen action='SaveData' method='POST'}] - Form opening
- [{FormInput name='field' type='text' value='default'}] - Input fields
- [{FormSelect name='choice' options='A,B,C'}] - Select boxes
- [{FormTextarea name='comment' rows='5'}] - Text areas
- [{FormButton type='submit' value='Save'}] - Form buttons
- [{FormClose}] - Form closing

Related Issue: #60 - WikiForm Handler (FormOpen, FormInput, FormClose)
Epic: #41 - Implement JSPWikiMarkupParser for Complete Enhancement Support

## Extends

- [`BaseSyntaxHandler`](../../BaseSyntaxHandler/classes/BaseSyntaxHandler.md)

## Constructors

### Constructor

> **new export=**(`engine`): `WikiFormHandler`

Defined in: [src/parsers/handlers/WikiFormHandler.js:18](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/handlers/WikiFormHandler.js#L18)

#### Parameters

##### engine

`any` = `null`

#### Returns

`WikiFormHandler`

#### Overrides

[`BaseSyntaxHandler`](../../BaseSyntaxHandler/classes/BaseSyntaxHandler.md).[`constructor`](../../BaseSyntaxHandler/classes/BaseSyntaxHandler.md#constructor)

## Properties

### activeForms

> **activeForms**: `Map`\<`any`, `any`\>

Defined in: [src/parsers/handlers/WikiFormHandler.js:35](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/handlers/WikiFormHandler.js#L35)

***

### config

> **config**: `any`

Defined in: [src/parsers/handlers/WikiFormHandler.js:32](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/handlers/WikiFormHandler.js#L32)

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

Defined in: [src/parsers/handlers/WikiFormHandler.js:31](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/handlers/WikiFormHandler.js#L31)

***

### formCounter

> **formCounter**: `number`

Defined in: [src/parsers/handlers/WikiFormHandler.js:36](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/handlers/WikiFormHandler.js#L36)

***

### handlerId

> **handlerId**: `string`

Defined in: [src/parsers/handlers/WikiFormHandler.js:30](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/handlers/WikiFormHandler.js#L30)

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

### capitalize()

> **capitalize**(`str`): `string`

Defined in: [src/parsers/handlers/WikiFormHandler.js:521](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/handlers/WikiFormHandler.js#L521)

Capitalize first letter of string

#### Parameters

##### str

`string`

String to capitalize

#### Returns

`string`

- Capitalized string

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

### escapeHtml()

> **escapeHtml**(`text`): `string`

Defined in: [src/parsers/handlers/WikiFormHandler.js:503](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/handlers/WikiFormHandler.js#L503)

Escape HTML characters to prevent XSS

#### Parameters

##### text

`string`

Text to escape

#### Returns

`string`

- Escaped text

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

### generateCSRFToken()

> **generateCSRFToken**(`context`): `Promise`\<`string`\>

Defined in: [src/parsers/handlers/WikiFormHandler.js:416](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/handlers/WikiFormHandler.js#L416)

Generate CSRF token for form security

#### Parameters

##### context

`ParseContext`

Parse context

#### Returns

`Promise`\<`string`\>

- CSRF token

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

Defined in: [src/parsers/handlers/WikiFormHandler.js:559](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/handlers/WikiFormHandler.js#L559)

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

### getSupportedInputTypes()

> **getSupportedInputTypes**(): `string`[]

Defined in: [src/parsers/handlers/WikiFormHandler.js:548](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/handlers/WikiFormHandler.js#L548)

Get supported input types

#### Returns

`string`[]

- Array of supported input types

***

### getSupportedPatterns()

> **getSupportedPatterns**(): `string`[]

Defined in: [src/parsers/handlers/WikiFormHandler.js:532](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/handlers/WikiFormHandler.js#L532)

Get supported form patterns

#### Returns

`string`[]

- Array of supported patterns

***

### handle()

> **handle**(`matchInfo`, `context`): `Promise`\<`string`\>

Defined in: [src/parsers/handlers/WikiFormHandler.js:129](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/handlers/WikiFormHandler.js#L129)

Handle a specific form element

#### Parameters

##### matchInfo

`any`

Form element match information

##### context

`ParseContext`

Parse context

#### Returns

`Promise`\<`string`\>

- Form element HTML

#### Overrides

[`BaseSyntaxHandler`](../../BaseSyntaxHandler/classes/BaseSyntaxHandler.md).[`handle`](../../BaseSyntaxHandler/classes/BaseSyntaxHandler.md#handle)

***

### handleFormButton()

> **handleFormButton**(`params`, `context`): `Promise`\<`string`\>

Defined in: [src/parsers/handlers/WikiFormHandler.js:358](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/handlers/WikiFormHandler.js#L358)

Handle FormButton element

#### Parameters

##### params

`any`

Button parameters

##### context

`ParseContext`

Parse context

#### Returns

`Promise`\<`string`\>

- Button HTML

***

### handleFormClose()

> **handleFormClose**(`params`, `context`): `Promise`\<`string`\>

Defined in: [src/parsers/handlers/WikiFormHandler.js:382](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/handlers/WikiFormHandler.js#L382)

Handle FormClose element

#### Parameters

##### params

`any`

Close parameters (usually empty)

##### context

`ParseContext`

Parse context

#### Returns

`Promise`\<`string`\>

- Form closing HTML

***

### handleFormInput()

> **handleFormInput**(`params`, `context`): `Promise`\<`string`\>

Defined in: [src/parsers/handlers/WikiFormHandler.js:196](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/handlers/WikiFormHandler.js#L196)

Handle FormInput element

#### Parameters

##### params

`any`

Input parameters

##### context

`ParseContext`

Parse context

#### Returns

`Promise`\<`string`\>

- Input field HTML

***

### handleFormOpen()

> **handleFormOpen**(`params`, `context`): `Promise`\<`string`\>

Defined in: [src/parsers/handlers/WikiFormHandler.js:160](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/handlers/WikiFormHandler.js#L160)

Handle FormOpen element

#### Parameters

##### params

`any`

Form parameters

##### context

`ParseContext`

Parse context

#### Returns

`Promise`\<`string`\>

- Form opening HTML

***

### handleFormSelect()

> **handleFormSelect**(`params`, `context`): `Promise`\<`string`\>

Defined in: [src/parsers/handlers/WikiFormHandler.js:269](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/handlers/WikiFormHandler.js#L269)

Handle FormSelect element

#### Parameters

##### params

`any`

Select parameters

##### context

`ParseContext`

Parse context

#### Returns

`Promise`\<`string`\>

- Select field HTML

***

### handleFormTextarea()

> **handleFormTextarea**(`params`, `context`): `Promise`\<`string`\>

Defined in: [src/parsers/handlers/WikiFormHandler.js:313](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/handlers/WikiFormHandler.js#L313)

Handle FormTextarea element

#### Parameters

##### params

`any`

Textarea parameters

##### context

`ParseContext`

Parse context

#### Returns

`Promise`\<`string`\>

- Textarea HTML

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

### onInitialize()

> **onInitialize**(`context`): `Promise`\<`void`\>

Defined in: [src/parsers/handlers/WikiFormHandler.js:43](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/handlers/WikiFormHandler.js#L43)

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

### process()

> **process**(`content`, `context`): `Promise`\<`string`\>

Defined in: [src/parsers/handlers/WikiFormHandler.js:64](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/handlers/WikiFormHandler.js#L64)

Process content by finding and executing all form elements

#### Parameters

##### content

`string`

Content to process

##### context

`ParseContext`

Parse context

#### Returns

`Promise`\<`string`\>

- Content with forms processed

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

### sanitizeFormData()

> **sanitizeFormData**(`formData`): `any`

Defined in: [src/parsers/handlers/WikiFormHandler.js:483](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/handlers/WikiFormHandler.js#L483)

Sanitize form data to prevent XSS

#### Parameters

##### formData

`any`

Raw form data

#### Returns

`any`

- Sanitized form data

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

### validateFormSubmission()

> **validateFormSubmission**(`formData`, `csrfToken`, `context`): `any`

Defined in: [src/parsers/handlers/WikiFormHandler.js:448](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/handlers/WikiFormHandler.js#L448)

Validate form submission (for future form processing endpoint)

#### Parameters

##### formData

`any`

Submitted form data

##### csrfToken

`string`

CSRF token from form

##### context

`ParseContext`

Parse context

#### Returns

`any`

- Validation result

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
