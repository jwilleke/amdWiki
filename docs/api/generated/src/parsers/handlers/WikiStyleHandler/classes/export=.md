[**amdWiki API v1.5.0**](../../../../../README.md)

***

[amdWiki API](../../../../../README.md) / [src/parsers/handlers/WikiStyleHandler](../README.md) / export=

# Class: export=

Defined in: [src/parsers/handlers/WikiStyleHandler.js:15](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/handlers/WikiStyleHandler.js#L15)

WikiStyleHandler - CSS class assignment and inline styling for wiki content

Supports JSPWiki WikiStyle syntax:

- %%class-name text content /% - CSS class assignment
- %%class1 class2 text content /% - Multiple CSS classes
- %%(color:red) inline styled text/% - Inline CSS (configurable security)
- %%text-center centered content /% - Bootstrap integration

Related Issue: WikiStyle Handler (Phase 3)
Epic: #41 - Implement JSPWikiMarkupParser for Complete Enhancement Support

## Extends

- [`BaseSyntaxHandler`](../../BaseSyntaxHandler/classes/BaseSyntaxHandler.md)

## Constructors

### Constructor

> **new export=**(`engine`): `WikiStyleHandler`

Defined in: [src/parsers/handlers/WikiStyleHandler.js:16](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/handlers/WikiStyleHandler.js#L16)

#### Parameters

##### engine

`any` = `null`

#### Returns

`WikiStyleHandler`

#### Overrides

[`BaseSyntaxHandler`](../../BaseSyntaxHandler/classes/BaseSyntaxHandler.md).[`constructor`](../../BaseSyntaxHandler/classes/BaseSyntaxHandler.md#constructor)

## Properties

### allowedCSSProperties

> **allowedCSSProperties**: `Set`\<`any`\>

Defined in: [src/parsers/handlers/WikiStyleHandler.js:33](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/handlers/WikiStyleHandler.js#L33)

***

### config

> **config**: `any`

Defined in: [src/parsers/handlers/WikiStyleHandler.js:30](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/handlers/WikiStyleHandler.js#L30)

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

Defined in: [src/parsers/handlers/WikiStyleHandler.js:29](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/handlers/WikiStyleHandler.js#L29)

***

### handlerId

> **handlerId**: `string`

Defined in: [src/parsers/handlers/WikiStyleHandler.js:28](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/handlers/WikiStyleHandler.js#L28)

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

### predefinedClasses

> **predefinedClasses**: `Set`\<`any`\>

Defined in: [src/parsers/handlers/WikiStyleHandler.js:32](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/handlers/WikiStyleHandler.js#L32)

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

### styleConfig

> **styleConfig**: `object`

Defined in: [src/parsers/handlers/WikiStyleHandler.js:31](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/handlers/WikiStyleHandler.js#L31)

#### allowInlineCSS

> **allowInlineCSS**: `boolean` = `false`

#### bootstrap

> **bootstrap**: `boolean` = `true`

#### cacheStyles

> **cacheStyles**: `boolean` = `true`

#### customClasses

> **customClasses**: `boolean` = `true`

#### securityValidation

> **securityValidation**: `boolean` = `true`

***

### version

> **version**: `any`

Defined in: [src/parsers/handlers/BaseSyntaxHandler.js:45](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/handlers/BaseSyntaxHandler.js#L45)

#### Inherited from

[`BaseSyntaxHandler`](../../BaseSyntaxHandler/classes/BaseSyntaxHandler.md).[`version`](../../BaseSyntaxHandler/classes/BaseSyntaxHandler.md#version)

## Methods

### addCustomClass()

> **addCustomClass**(`className`): `boolean`

Defined in: [src/parsers/handlers/WikiStyleHandler.js:690](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/handlers/WikiStyleHandler.js#L690)

Add custom CSS class (modular extensibility)

#### Parameters

##### className

`string`

Class name to add

#### Returns

`boolean`

- True if added successfully

***

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

### cacheStyleResult()

> **cacheStyleResult**(`matchInfo`, `context`, `result`): `Promise`\<`void`\>

Defined in: [src/parsers/handlers/WikiStyleHandler.js:556](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/handlers/WikiStyleHandler.js#L556)

Cache style result

#### Parameters

##### matchInfo

`any`

Style match information

##### context

`ParseContext`

Parse context

##### result

`string`

HTML result to cache

#### Returns

`Promise`\<`void`\>

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

### containsDangerousContent()

> **containsDangerousContent**(`content`): `boolean`

Defined in: [src/parsers/handlers/WikiStyleHandler.js:520](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/handlers/WikiStyleHandler.js#L520)

Check for dangerous content in class names (modular security)

#### Parameters

##### content

`string`

Content to check

#### Returns

`boolean`

- True if dangerous content found

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

Defined in: [src/parsers/handlers/WikiStyleHandler.js:599](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/handlers/WikiStyleHandler.js#L599)

Escape HTML to prevent XSS (modular security)

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

### generateContentHash()

> **generateContentHash**(`content`): `string`

Defined in: [src/parsers/handlers/WikiStyleHandler.js:573](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/handlers/WikiStyleHandler.js#L573)

Generate content hash for caching (modular caching)

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

Defined in: [src/parsers/handlers/WikiStyleHandler.js:583](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/handlers/WikiStyleHandler.js#L583)

Generate context hash for caching (modular caching)

#### Parameters

##### context

`ParseContext`

Parse context

#### Returns

`string`

- Context hash

***

### getCachedStyleResult()

> **getCachedStyleResult**(`matchInfo`, `context`): `Promise`\<`string`\>

Defined in: [src/parsers/handlers/WikiStyleHandler.js:538](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/handlers/WikiStyleHandler.js#L538)

Get cached style result

#### Parameters

##### matchInfo

`any`

Style match information

##### context

`ParseContext`

Parse context

#### Returns

`Promise`\<`string`\>

- Cached result or null

***

### getConfigurationSummary()

> **getConfigurationSummary**(): `any`

Defined in: [src/parsers/handlers/WikiStyleHandler.js:616](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/handlers/WikiStyleHandler.js#L616)

Get configuration summary for debugging (modular introspection)

#### Returns

`any`

- Configuration summary

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

Defined in: [src/parsers/handlers/WikiStyleHandler.js:717](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/handlers/WikiStyleHandler.js#L717)

Get handler information for debugging and documentation (modular introspection)

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

### getPredefinedClassesByCategory()

> **getPredefinedClassesByCategory**(): `any`

Defined in: [src/parsers/handlers/WikiStyleHandler.js:659](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/handlers/WikiStyleHandler.js#L659)

Get predefined CSS classes organized by category (modular organization)

#### Returns

`any`

- Categorized predefined classes

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

### getSupportedPatterns()

> **getSupportedPatterns**(): `string`[]

Defined in: [src/parsers/handlers/WikiStyleHandler.js:645](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/handlers/WikiStyleHandler.js#L645)

Get supported style patterns (modular documentation)

#### Returns

`string`[]

- Array of supported patterns

***

### handle()

> **handle**(`matchInfo`, `context`): `Promise`\<`string`\>

Defined in: [src/parsers/handlers/WikiStyleHandler.js:274](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/handlers/WikiStyleHandler.js#L274)

Handle a specific WikiStyle match with modular processing

#### Parameters

##### matchInfo

`any`

Style match information

##### context

`ParseContext`

Parse context

#### Returns

`Promise`\<`string`\>

- Styled content HTML

#### Overrides

[`BaseSyntaxHandler`](../../BaseSyntaxHandler/classes/BaseSyntaxHandler.md).[`handle`](../../BaseSyntaxHandler/classes/BaseSyntaxHandler.md#handle)

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

### isAllowedCSSProperty()

> **isAllowedCSSProperty**(`property`): `boolean`

Defined in: [src/parsers/handlers/WikiStyleHandler.js:492](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/handlers/WikiStyleHandler.js#L492)

Check if CSS property is allowed (modular security configuration)

#### Parameters

##### property

`string`

CSS property name

#### Returns

`boolean`

- True if allowed

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

### isValidCSSClass()

> **isValidCSSClass**(`className`): `boolean`

Defined in: [src/parsers/handlers/WikiStyleHandler.js:432](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/handlers/WikiStyleHandler.js#L432)

Validate CSS class name (modular validation system)

#### Parameters

##### className

`string`

CSS class name to validate

#### Returns

`boolean`

- True if valid and safe

***

### isValidCSSValue()

> **isValidCSSValue**(`value`): `boolean`

Defined in: [src/parsers/handlers/WikiStyleHandler.js:501](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/handlers/WikiStyleHandler.js#L501)

Validate CSS value for security (modular security validation)

#### Parameters

##### value

`string`

CSS value to validate

#### Returns

`boolean`

- True if safe

***

### loadAllowedCSSProperties()

> **loadAllowedCSSProperties**(`configManager`): `Promise`\<`void`\>

Defined in: [src/parsers/handlers/WikiStyleHandler.js:130](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/handlers/WikiStyleHandler.js#L130)

Load allowed CSS properties for security (modular security configuration)

#### Parameters

##### configManager

`any`

Configuration manager

#### Returns

`Promise`\<`void`\>

***

### loadDefaultConfiguration()

> **loadDefaultConfiguration**(): `void`

Defined in: [src/parsers/handlers/WikiStyleHandler.js:145](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/handlers/WikiStyleHandler.js#L145)

Load default configuration when ConfigurationManager unavailable (modular fallback)

#### Returns

`void`

***

### loadModularStyleConfiguration()

> **loadModularStyleConfiguration**(): `Promise`\<`void`\>

Defined in: [src/parsers/handlers/WikiStyleHandler.js:57](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/handlers/WikiStyleHandler.js#L57)

Load modular style configuration from app-default-config.json and app-custom-config.json
Demonstrates complete configuration modularity and reusability

#### Returns

`Promise`\<`void`\>

***

### loadPredefinedClasses()

> **loadPredefinedClasses**(`configManager`): `Promise`\<`void`\>

Defined in: [src/parsers/handlers/WikiStyleHandler.js:108](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/handlers/WikiStyleHandler.js#L108)

Load predefined CSS classes from configuration (modular class system)

#### Parameters

##### configManager

`any`

Configuration manager

#### Returns

`Promise`\<`void`\>

***

### onInitialize()

> **onInitialize**(`context`): `Promise`\<`void`\>

Defined in: [src/parsers/handlers/WikiStyleHandler.js:40](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/handlers/WikiStyleHandler.js#L40)

Initialize handler with modular configuration system

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

Defined in: [src/parsers/handlers/WikiStyleHandler.js:188](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/handlers/WikiStyleHandler.js#L188)

Process content by finding and applying WikiStyle syntax
Handles nested blocks by processing them recursively from innermost to outermost

#### Parameters

##### content

`string`

Content to process

##### context

`ParseContext`

Parse context

#### Returns

`Promise`\<`string`\>

- Content with styles applied

#### Overrides

[`BaseSyntaxHandler`](../../BaseSyntaxHandler/classes/BaseSyntaxHandler.md).[`process`](../../BaseSyntaxHandler/classes/BaseSyntaxHandler.md#process)

***

### processCSSClasses()

> **processCSSClasses**(`classInfo`, `content`, `context`): `Promise`\<`string`\>

Defined in: [src/parsers/handlers/WikiStyleHandler.js:311](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/handlers/WikiStyleHandler.js#L311)

Process CSS class assignment (modular class handling)

#### Parameters

##### classInfo

`string`

CSS class information

##### content

`string`

Content to style

##### context

`ParseContext`

Parse context

#### Returns

`Promise`\<`string`\>

- Styled HTML

***

### processInlineStyle()

> **processInlineStyle**(`styleInfo`, `content`, `context`): `Promise`\<`string`\>

Defined in: [src/parsers/handlers/WikiStyleHandler.js:403](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/handlers/WikiStyleHandler.js#L403)

Process inline CSS styles (modular security validation)

#### Parameters

##### styleInfo

`string`

Inline style information

##### content

`string`

Content to style

##### context

`ParseContext`

Parse context

#### Returns

`Promise`\<`string`\>

- Styled HTML

***

### removeCustomClass()

> **removeCustomClass**(`className`): `boolean`

Defined in: [src/parsers/handlers/WikiStyleHandler.js:704](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/handlers/WikiStyleHandler.js#L704)

Remove custom CSS class (modular management)

#### Parameters

##### className

`string`

Class name to remove

#### Returns

`boolean`

- True if removed successfully

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

### validateInlineCSS()

> **validateInlineCSS**(`cssDeclarations`): `string`[]

Defined in: [src/parsers/handlers/WikiStyleHandler.js:458](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/handlers/WikiStyleHandler.js#L458)

Validate inline CSS declarations (modular security system)

#### Parameters

##### cssDeclarations

`string`

CSS declarations string

#### Returns

`string`[]

- Array of valid CSS declarations

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
