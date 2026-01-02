[**amdWiki API v1.5.0**](../../../../../README.md)

***

[amdWiki API](../../../../../README.md) / [src/parsers/handlers/LinkParserHandler](../README.md) / default

# Class: default

Defined in: [src/parsers/handlers/LinkParserHandler.ts:65](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/parsers/handlers/LinkParserHandler.ts#L65)

LinkParserHandler - Unified link processing handler using LinkParser

This handler integrates the comprehensive LinkParser into the MarkupParser
handler architecture, providing centralized processing for all link types:
- Internal wiki links: [PageName], [Display|Target]
- External links: [Display|http://example.com]
- InterWiki links: [Display|Wikipedia:Article]
- Email links: [Display|mailto:user@example.com]
- Anchor links: [Display|#section]
- Links with attributes: [Display|Target|class="custom" target="_blank"]

Replaces the fragmented WikiLinkHandler and InterWikiLinkHandler approach
with a unified, security-focused, and comprehensive solution.

Related Issue: #75 - Create LinkParser.js for centralized link parsing
Epic: #41 - Implement JSPWikiMarkupParser for Complete Enhancement Support

## Extends

- [`default`](../../BaseSyntaxHandler/classes/default.md)

## Constructors

### Constructor

> **new default**(`engine`): `LinkParserHandler`

Defined in: [src/parsers/handlers/LinkParserHandler.ts:72](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/parsers/handlers/LinkParserHandler.ts#L72)

#### Parameters

##### engine

`WikiEngine` = `null`

#### Returns

`LinkParserHandler`

#### Overrides

[`default`](../../BaseSyntaxHandler/classes/default.md).[`constructor`](../../BaseSyntaxHandler/classes/default.md#constructor)

## Properties

### dependencies

> `readonly` **dependencies**: (`string` \| [`DependencySpec`](../../BaseSyntaxHandler/interfaces/DependencySpec.md))[]

Defined in: [src/parsers/handlers/BaseSyntaxHandler.ts:169](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/parsers/handlers/BaseSyntaxHandler.ts#L169)

#### Inherited from

[`default`](../../BaseSyntaxHandler/classes/default.md).[`dependencies`](../../BaseSyntaxHandler/classes/default.md#dependencies)

***

### dependencyErrors?

> `protected` `optional` **dependencyErrors**: [`DependencyError`](../../BaseSyntaxHandler/interfaces/DependencyError.md)[]

Defined in: [src/parsers/handlers/BaseSyntaxHandler.ts:176](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/parsers/handlers/BaseSyntaxHandler.ts#L176)

#### Inherited from

[`default`](../../BaseSyntaxHandler/classes/default.md).[`dependencyErrors`](../../BaseSyntaxHandler/classes/default.md#dependencyerrors)

***

### description

> `readonly` **description**: `string`

Defined in: [src/parsers/handlers/BaseSyntaxHandler.ts:168](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/parsers/handlers/BaseSyntaxHandler.ts#L168)

#### Inherited from

[`default`](../../BaseSyntaxHandler/classes/default.md).[`description`](../../BaseSyntaxHandler/classes/default.md#description)

***

### enabled

> `protected` **enabled**: `boolean`

Defined in: [src/parsers/handlers/BaseSyntaxHandler.ts:174](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/parsers/handlers/BaseSyntaxHandler.ts#L174)

#### Inherited from

[`default`](../../BaseSyntaxHandler/classes/default.md).[`enabled`](../../BaseSyntaxHandler/classes/default.md#enabled)

***

### handlerId

> **handlerId**: `string`

Defined in: [src/parsers/handlers/LinkParserHandler.ts:66](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/parsers/handlers/LinkParserHandler.ts#L66)

#### Overrides

[`default`](../../BaseSyntaxHandler/classes/default.md).[`handlerId`](../../BaseSyntaxHandler/classes/default.md#handlerid)

***

### initContext?

> `protected` `optional` **initContext**: [`InitializationContext`](../../BaseSyntaxHandler/interfaces/InitializationContext.md)

Defined in: [src/parsers/handlers/BaseSyntaxHandler.ts:175](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/parsers/handlers/BaseSyntaxHandler.ts#L175)

#### Inherited from

[`default`](../../BaseSyntaxHandler/classes/default.md).[`initContext`](../../BaseSyntaxHandler/classes/default.md#initcontext)

***

### initialized

> **initialized**: `boolean`

Defined in: [src/parsers/handlers/LinkParserHandler.ts:69](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/parsers/handlers/LinkParserHandler.ts#L69)

#### Overrides

[`default`](../../BaseSyntaxHandler/classes/default.md).[`initialized`](../../BaseSyntaxHandler/classes/default.md#initialized)

***

### options

> `protected` **options**: `Required`\<[`HandlerOptions`](../../BaseSyntaxHandler/interfaces/HandlerOptions.md)\>

Defined in: [src/parsers/handlers/BaseSyntaxHandler.ts:171](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/parsers/handlers/BaseSyntaxHandler.ts#L171)

#### Inherited from

[`default`](../../BaseSyntaxHandler/classes/default.md).[`options`](../../BaseSyntaxHandler/classes/default.md#options)

***

### pattern

> `readonly` **pattern**: `RegExp`

Defined in: [src/parsers/handlers/BaseSyntaxHandler.ts:165](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/parsers/handlers/BaseSyntaxHandler.ts#L165)

#### Inherited from

[`default`](../../BaseSyntaxHandler/classes/default.md).[`pattern`](../../BaseSyntaxHandler/classes/default.md#pattern)

***

### priority

> `readonly` **priority**: `number`

Defined in: [src/parsers/handlers/BaseSyntaxHandler.ts:164](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/parsers/handlers/BaseSyntaxHandler.ts#L164)

#### Inherited from

[`default`](../../BaseSyntaxHandler/classes/default.md).[`priority`](../../BaseSyntaxHandler/classes/default.md#priority)

***

### stats

> `protected` **stats**: [`HandlerStats`](../../BaseSyntaxHandler/interfaces/HandlerStats.md)

Defined in: [src/parsers/handlers/BaseSyntaxHandler.ts:172](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/parsers/handlers/BaseSyntaxHandler.ts#L172)

#### Inherited from

[`default`](../../BaseSyntaxHandler/classes/default.md).[`stats`](../../BaseSyntaxHandler/classes/default.md#stats)

***

### version

> `readonly` **version**: `string`

Defined in: [src/parsers/handlers/BaseSyntaxHandler.ts:167](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/parsers/handlers/BaseSyntaxHandler.ts#L167)

#### Inherited from

[`default`](../../BaseSyntaxHandler/classes/default.md).[`version`](../../BaseSyntaxHandler/classes/default.md#version)

## Methods

### buildRegexFlags()

> `protected` **buildRegexFlags**(): `string`

Defined in: [src/parsers/handlers/BaseSyntaxHandler.ts:259](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/parsers/handlers/BaseSyntaxHandler.ts#L259)

Build regex flags based on options

#### Returns

`string`

Regex flags string

#### Inherited from

[`default`](../../BaseSyntaxHandler/classes/default.md).[`buildRegexFlags`](../../BaseSyntaxHandler/classes/default.md#buildregexflags)

***

### clone()

> **clone**(`overrides`): [`HandlerCloneConfig`](../../BaseSyntaxHandler/interfaces/HandlerCloneConfig.md)

Defined in: [src/parsers/handlers/BaseSyntaxHandler.ts:711](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/parsers/handlers/BaseSyntaxHandler.ts#L711)

Create a clone of this handler with different options

#### Parameters

##### overrides

`Partial`\<[`HandlerOptions`](../../BaseSyntaxHandler/interfaces/HandlerOptions.md)\> & `object` = `{}`

Option overrides

#### Returns

[`HandlerCloneConfig`](../../BaseSyntaxHandler/interfaces/HandlerCloneConfig.md)

Handler configuration for creating new instance

#### Inherited from

[`default`](../../BaseSyntaxHandler/classes/default.md).[`clone`](../../BaseSyntaxHandler/classes/default.md#clone)

***

### compilePattern()

> `protected` **compilePattern**(`pattern`): `RegExp`

Defined in: [src/parsers/handlers/BaseSyntaxHandler.ts:240](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/parsers/handlers/BaseSyntaxHandler.ts#L240)

Compile pattern into RegExp if it's a string

#### Parameters

##### pattern

Pattern to compile

`string` | `RegExp`

#### Returns

`RegExp`

Compiled regular expression

#### Inherited from

[`default`](../../BaseSyntaxHandler/classes/default.md).[`compilePattern`](../../BaseSyntaxHandler/classes/default.md#compilepattern)

***

### createErrorContext()

> `protected` **createErrorContext**(`error`, `content`, `context`): [`ErrorContext`](../../BaseSyntaxHandler/interfaces/ErrorContext.md)

Defined in: [src/parsers/handlers/BaseSyntaxHandler.ts:479](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/parsers/handlers/BaseSyntaxHandler.ts#L479)

Create error context for debugging

#### Parameters

##### error

`Error`

The error that occurred

##### content

`string`

Content being processed

##### context

[`ParseContext`](../../BaseSyntaxHandler/interfaces/ParseContext.md)

Parse context

#### Returns

[`ErrorContext`](../../BaseSyntaxHandler/interfaces/ErrorContext.md)

Error context

#### Inherited from

[`default`](../../BaseSyntaxHandler/classes/default.md).[`createErrorContext`](../../BaseSyntaxHandler/classes/default.md#createerrorcontext)

***

### createTimeoutPromise()

> `protected` **createTimeoutPromise**(): `Promise`\<`string`\>

Defined in: [src/parsers/handlers/BaseSyntaxHandler.ts:460](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/parsers/handlers/BaseSyntaxHandler.ts#L460)

Create timeout promise for handler execution

#### Returns

`Promise`\<`string`\>

Promise that rejects after timeout

#### Inherited from

[`default`](../../BaseSyntaxHandler/classes/default.md).[`createTimeoutPromise`](../../BaseSyntaxHandler/classes/default.md#createtimeoutpromise)

***

### disable()

> **disable**(): `void`

Defined in: [src/parsers/handlers/BaseSyntaxHandler.ts:629](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/parsers/handlers/BaseSyntaxHandler.ts#L629)

Disable the handler

#### Returns

`void`

#### Inherited from

[`default`](../../BaseSyntaxHandler/classes/default.md).[`disable`](../../BaseSyntaxHandler/classes/default.md#disable)

***

### enable()

> **enable**(): `void`

Defined in: [src/parsers/handlers/BaseSyntaxHandler.ts:622](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/parsers/handlers/BaseSyntaxHandler.ts#L622)

Enable the handler

#### Returns

`void`

#### Inherited from

[`default`](../../BaseSyntaxHandler/classes/default.md).[`enable`](../../BaseSyntaxHandler/classes/default.md#enable)

***

### execute()

> **execute**(`content`, `context`): `Promise`\<`string`\>

Defined in: [src/parsers/handlers/BaseSyntaxHandler.ts:412](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/parsers/handlers/BaseSyntaxHandler.ts#L412)

Execute the handler with performance tracking and error handling

#### Parameters

##### content

`string`

Content to process

##### context

[`ParseContext`](../../BaseSyntaxHandler/interfaces/ParseContext.md)

Parse context

#### Returns

`Promise`\<`string`\>

Processed content

#### Inherited from

[`default`](../../BaseSyntaxHandler/classes/default.md).[`execute`](../../BaseSyntaxHandler/classes/default.md#execute)

***

### getDependencyErrors()

> **getDependencyErrors**(): [`DependencyError`](../../BaseSyntaxHandler/interfaces/DependencyError.md)[]

Defined in: [src/parsers/handlers/BaseSyntaxHandler.ts:376](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/parsers/handlers/BaseSyntaxHandler.ts#L376)

Get dependency validation errors

#### Returns

[`DependencyError`](../../BaseSyntaxHandler/interfaces/DependencyError.md)[]

Array of dependency errors

#### Inherited from

[`default`](../../BaseSyntaxHandler/classes/default.md).[`getDependencyErrors`](../../BaseSyntaxHandler/classes/default.md#getdependencyerrors)

***

### getInfo()

> **getInfo**(): `Record`\<`string`, `unknown`\>

Defined in: [src/parsers/handlers/LinkParserHandler.ts:351](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/parsers/handlers/LinkParserHandler.ts#L351)

Get handler information including LinkParser statistics

#### Returns

`Record`\<`string`, `unknown`\>

Handler information

***

### getMetadata()

> **getMetadata**(): [`HandlerMetadata`](../../BaseSyntaxHandler/interfaces/HandlerMetadata.md)

Defined in: [src/parsers/handlers/BaseSyntaxHandler.ts:677](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/parsers/handlers/BaseSyntaxHandler.ts#L677)

Get handler metadata

#### Returns

[`HandlerMetadata`](../../BaseSyntaxHandler/interfaces/HandlerMetadata.md)

Handler metadata

#### Inherited from

[`default`](../../BaseSyntaxHandler/classes/default.md).[`getMetadata`](../../BaseSyntaxHandler/classes/default.md#getmetadata)

***

### getStats()

> **getStats**(): [`HandlerStats`](../../BaseSyntaxHandler/interfaces/HandlerStats.md) & `object`

Defined in: [src/parsers/handlers/BaseSyntaxHandler.ts:645](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/parsers/handlers/BaseSyntaxHandler.ts#L645)

Get handler statistics

#### Returns

[`HandlerStats`](../../BaseSyntaxHandler/interfaces/HandlerStats.md) & `object`

Handler statistics

#### Inherited from

[`default`](../../BaseSyntaxHandler/classes/default.md).[`getStats`](../../BaseSyntaxHandler/classes/default.md#getstats)

***

### handle()

> **handle**(`_match`, `_context`): `Promise`\<`string`\>

Defined in: [src/parsers/handlers/LinkParserHandler.ts:304](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/parsers/handlers/LinkParserHandler.ts#L304)

Handle method - not used since we override process() entirely

#### Parameters

##### \_match

`RegExpMatchArray`

Match information

##### \_context

[`ParseContext`](../../BaseSyntaxHandler/interfaces/ParseContext.md)

Parse context

#### Returns

`Promise`\<`string`\>

Processed match

#### Overrides

[`default`](../../BaseSyntaxHandler/classes/default.md).[`handle`](../../BaseSyntaxHandler/classes/default.md#handle)

***

### hasDependencyErrors()

> **hasDependencyErrors**(): `boolean`

Defined in: [src/parsers/handlers/BaseSyntaxHandler.ts:384](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/parsers/handlers/BaseSyntaxHandler.ts#L384)

Check if handler has unresolved dependencies

#### Returns

`boolean`

True if there are dependency errors

#### Inherited from

[`default`](../../BaseSyntaxHandler/classes/default.md).[`hasDependencyErrors`](../../BaseSyntaxHandler/classes/default.md#hasdependencyerrors)

***

### initialize()

> **initialize**(`context`): `Promise`\<`void`\>

Defined in: [src/parsers/handlers/BaseSyntaxHandler.ts:272](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/parsers/handlers/BaseSyntaxHandler.ts#L272)

Initialize the handler (optional override)
Called when handler is registered

#### Parameters

##### context

[`InitializationContext`](../../BaseSyntaxHandler/interfaces/InitializationContext.md) = `{}`

Initialization context

#### Returns

`Promise`\<`void`\>

#### Inherited from

[`default`](../../BaseSyntaxHandler/classes/default.md).[`initialize`](../../BaseSyntaxHandler/classes/default.md#initialize)

***

### isEnabled()

> **isEnabled**(): `boolean`

Defined in: [src/parsers/handlers/BaseSyntaxHandler.ts:637](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/parsers/handlers/BaseSyntaxHandler.ts#L637)

Check if handler is enabled

#### Returns

`boolean`

True if enabled

#### Inherited from

[`default`](../../BaseSyntaxHandler/classes/default.md).[`isEnabled`](../../BaseSyntaxHandler/classes/default.md#isenabled)

***

### onInitialize()

> `protected` **onInitialize**(`context`): `Promise`\<`void`\>

Defined in: [src/parsers/handlers/LinkParserHandler.ts:101](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/parsers/handlers/LinkParserHandler.ts#L101)

Initialize handler with LinkParser configuration

#### Parameters

##### context

[`InitializationContext`](../../BaseSyntaxHandler/interfaces/InitializationContext.md)

Initialization context

#### Returns

`Promise`\<`void`\>

#### Overrides

[`default`](../../BaseSyntaxHandler/classes/default.md).[`onInitialize`](../../BaseSyntaxHandler/classes/default.md#oninitialize)

***

### onShutdown()

> `protected` **onShutdown**(): `Promise`\<`void`\>

Defined in: [src/parsers/handlers/LinkParserHandler.ts:385](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/parsers/handlers/LinkParserHandler.ts#L385)

Handler-specific shutdown cleanup

#### Returns

`Promise`\<`void`\>

#### Overrides

[`default`](../../BaseSyntaxHandler/classes/default.md).[`onShutdown`](../../BaseSyntaxHandler/classes/default.md#onshutdown)

***

### parseParameters()

> **parseParameters**(`paramString`): `Record`\<`string`, `unknown`\>

Defined in: [src/parsers/handlers/BaseSyntaxHandler.ts:502](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/parsers/handlers/BaseSyntaxHandler.ts#L502)

Parse parameters from parameter string
Handles various formats: key=value, key='value', key="value"

#### Parameters

##### paramString

`string`

Parameter string to parse

#### Returns

`Record`\<`string`, `unknown`\>

Parsed parameters

#### Inherited from

[`default`](../../BaseSyntaxHandler/classes/default.md).[`parseParameters`](../../BaseSyntaxHandler/classes/default.md#parseparameters)

***

### process()

> **process**(`content`, `context`): `Promise`\<`string`\>

Defined in: [src/parsers/handlers/LinkParserHandler.ts:258](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/parsers/handlers/LinkParserHandler.ts#L258)

Process content using LinkParser

#### Parameters

##### content

`string`

Content to process

##### context

[`ParseContext`](../../BaseSyntaxHandler/interfaces/ParseContext.md)

Parse context

#### Returns

`Promise`\<`string`\>

Content with links processed

#### Overrides

[`default`](../../BaseSyntaxHandler/classes/default.md).[`process`](../../BaseSyntaxHandler/classes/default.md#process)

***

### refreshPageNames()

> **refreshPageNames**(): `Promise`\<`void`\>

Defined in: [src/parsers/handlers/LinkParserHandler.ts:313](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/parsers/handlers/LinkParserHandler.ts#L313)

Refresh page names cache (called when pages are added/removed)

#### Returns

`Promise`\<`void`\>

***

### resetStats()

> **resetStats**(): `void`

Defined in: [src/parsers/handlers/BaseSyntaxHandler.ts:663](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/parsers/handlers/BaseSyntaxHandler.ts#L663)

Reset handler statistics

#### Returns

`void`

#### Inherited from

[`default`](../../BaseSyntaxHandler/classes/default.md).[`resetStats`](../../BaseSyntaxHandler/classes/default.md#resetstats)

***

### shutdown()

> **shutdown**(): `Promise`\<`void`\>

Defined in: [src/parsers/handlers/BaseSyntaxHandler.ts:694](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/parsers/handlers/BaseSyntaxHandler.ts#L694)

Clean up handler resources (optional override)
Called when handler is unregistered

#### Returns

`Promise`\<`void`\>

#### Inherited from

[`default`](../../BaseSyntaxHandler/classes/default.md).[`shutdown`](../../BaseSyntaxHandler/classes/default.md#shutdown)

***

### toString()

> **toString**(): `string`

Defined in: [src/parsers/handlers/BaseSyntaxHandler.ts:729](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/parsers/handlers/BaseSyntaxHandler.ts#L729)

String representation of handler

#### Returns

`string`

String representation

#### Inherited from

[`default`](../../BaseSyntaxHandler/classes/default.md).[`toString`](../../BaseSyntaxHandler/classes/default.md#tostring)

***

### validateDependencies()

> `protected` **validateDependencies**(`context`): `void`

Defined in: [src/parsers/handlers/BaseSyntaxHandler.ts:301](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/parsers/handlers/BaseSyntaxHandler.ts#L301)

Validate handler dependencies

#### Parameters

##### context

[`InitializationContext`](../../BaseSyntaxHandler/interfaces/InitializationContext.md)

Initialization context

#### Returns

`void`

#### Inherited from

[`default`](../../BaseSyntaxHandler/classes/default.md).[`validateDependencies`](../../BaseSyntaxHandler/classes/default.md#validatedependencies)

***

### validateParameter()

> `protected` **validateParameter**(`key`, `value`, `rule`): [`ParameterValidationResult`](../../BaseSyntaxHandler/interfaces/ParameterValidationResult.md)

Defined in: [src/parsers/handlers/BaseSyntaxHandler.ts:574](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/parsers/handlers/BaseSyntaxHandler.ts#L574)

Validate a single parameter

#### Parameters

##### key

`string`

Parameter key

##### value

`unknown`

Parameter value

##### rule

[`ValidationRule`](../../BaseSyntaxHandler/interfaces/ValidationRule.md)

Validation rule

#### Returns

[`ParameterValidationResult`](../../BaseSyntaxHandler/interfaces/ParameterValidationResult.md)

Validation result

#### Inherited from

[`default`](../../BaseSyntaxHandler/classes/default.md).[`validateParameter`](../../BaseSyntaxHandler/classes/default.md#validateparameter)

***

### validateParameters()

> **validateParameters**(`params`, `schema`): [`ValidationResult`](../../BaseSyntaxHandler/interfaces/ValidationResult.md)

Defined in: [src/parsers/handlers/BaseSyntaxHandler.ts:535](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/parsers/handlers/BaseSyntaxHandler.ts#L535)

Validate parameters against schema

#### Parameters

##### params

`Record`\<`string`, `unknown`\>

Parameters to validate

##### schema

`Record`\<`string`, [`ValidationRule`](../../BaseSyntaxHandler/interfaces/ValidationRule.md)\> = `{}`

Validation schema

#### Returns

[`ValidationResult`](../../BaseSyntaxHandler/interfaces/ValidationResult.md)

Validation result

#### Inherited from

[`default`](../../BaseSyntaxHandler/classes/default.md).[`validateParameters`](../../BaseSyntaxHandler/classes/default.md#validateparameters)

***

### validateSpecificDependency()

> `protected` **validateSpecificDependency**(`dependency`, `context`): `void`

Defined in: [src/parsers/handlers/BaseSyntaxHandler.ts:338](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/parsers/handlers/BaseSyntaxHandler.ts#L338)

Validate specific dependency requirement

#### Parameters

##### dependency

[`DependencySpec`](../../BaseSyntaxHandler/interfaces/DependencySpec.md)

Dependency specification

##### context

[`InitializationContext`](../../BaseSyntaxHandler/interfaces/InitializationContext.md)

Initialization context

#### Returns

`void`

#### Inherited from

[`default`](../../BaseSyntaxHandler/classes/default.md).[`validateSpecificDependency`](../../BaseSyntaxHandler/classes/default.md#validatespecificdependency)
