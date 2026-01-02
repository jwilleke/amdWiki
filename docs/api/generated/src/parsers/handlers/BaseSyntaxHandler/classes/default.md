[**amdWiki API v1.5.0**](../../../../../README.md)

***

[amdWiki API](../../../../../README.md) / [src/parsers/handlers/BaseSyntaxHandler](../README.md) / default

# Abstract Class: default

Defined in: [src/parsers/handlers/BaseSyntaxHandler.ts:163](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/parsers/handlers/BaseSyntaxHandler.ts#L163)

BaseSyntaxHandler - Abstract base class for all markup syntax handlers

## Extended by

- [`default`](../../AttachmentHandler/classes/default.md)
- [`default`](../../EscapedSyntaxHandler/classes/default.md)
- [`default`](../../InterWikiLinkHandler/classes/default.md)
- [`default`](../../JSPWikiPreprocessor/classes/default.md)
- [`default`](../../LinkParserHandler/classes/default.md)
- [`default`](../../PluginSyntaxHandler/classes/default.md)
- [`default`](../../VariableSyntaxHandler/classes/default.md)
- [`default`](../../WikiFormHandler/classes/default.md)
- [`default`](../../WikiLinkHandler/classes/default.md)
- [`default`](../../WikiStyleHandler/classes/default.md)
- [`default`](../../WikiTableHandler/classes/default.md)
- [`default`](../../WikiTagHandler/classes/default.md)

## Constructors

### Constructor

> **new default**(`pattern`, `priority`, `options`): `BaseSyntaxHandler`

Defined in: [src/parsers/handlers/BaseSyntaxHandler.ts:184](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/parsers/handlers/BaseSyntaxHandler.ts#L184)

Create a syntax handler

#### Parameters

##### pattern

Pattern to match (regex or string)

`string` | `RegExp`

##### priority

`number` = `100`

Handler priority (0-1000, higher = executed first)

##### options

[`HandlerOptions`](../interfaces/HandlerOptions.md) = `{}`

Handler configuration options

#### Returns

`BaseSyntaxHandler`

## Properties

### dependencies

> `readonly` **dependencies**: (`string` \| [`DependencySpec`](../interfaces/DependencySpec.md))[]

Defined in: [src/parsers/handlers/BaseSyntaxHandler.ts:169](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/parsers/handlers/BaseSyntaxHandler.ts#L169)

***

### dependencyErrors?

> `protected` `optional` **dependencyErrors**: [`DependencyError`](../interfaces/DependencyError.md)[]

Defined in: [src/parsers/handlers/BaseSyntaxHandler.ts:176](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/parsers/handlers/BaseSyntaxHandler.ts#L176)

***

### description

> `readonly` **description**: `string`

Defined in: [src/parsers/handlers/BaseSyntaxHandler.ts:168](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/parsers/handlers/BaseSyntaxHandler.ts#L168)

***

### enabled

> `protected` **enabled**: `boolean`

Defined in: [src/parsers/handlers/BaseSyntaxHandler.ts:174](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/parsers/handlers/BaseSyntaxHandler.ts#L174)

***

### handlerId

> `readonly` **handlerId**: `string`

Defined in: [src/parsers/handlers/BaseSyntaxHandler.ts:166](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/parsers/handlers/BaseSyntaxHandler.ts#L166)

***

### initContext?

> `protected` `optional` **initContext**: [`InitializationContext`](../interfaces/InitializationContext.md)

Defined in: [src/parsers/handlers/BaseSyntaxHandler.ts:175](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/parsers/handlers/BaseSyntaxHandler.ts#L175)

***

### initialized

> `protected` **initialized**: `boolean`

Defined in: [src/parsers/handlers/BaseSyntaxHandler.ts:173](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/parsers/handlers/BaseSyntaxHandler.ts#L173)

***

### options

> `protected` **options**: `Required`\<[`HandlerOptions`](../interfaces/HandlerOptions.md)\>

Defined in: [src/parsers/handlers/BaseSyntaxHandler.ts:171](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/parsers/handlers/BaseSyntaxHandler.ts#L171)

***

### pattern

> `readonly` **pattern**: `RegExp`

Defined in: [src/parsers/handlers/BaseSyntaxHandler.ts:165](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/parsers/handlers/BaseSyntaxHandler.ts#L165)

***

### priority

> `readonly` **priority**: `number`

Defined in: [src/parsers/handlers/BaseSyntaxHandler.ts:164](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/parsers/handlers/BaseSyntaxHandler.ts#L164)

***

### stats

> `protected` **stats**: [`HandlerStats`](../interfaces/HandlerStats.md)

Defined in: [src/parsers/handlers/BaseSyntaxHandler.ts:172](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/parsers/handlers/BaseSyntaxHandler.ts#L172)

***

### version

> `readonly` **version**: `string`

Defined in: [src/parsers/handlers/BaseSyntaxHandler.ts:167](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/parsers/handlers/BaseSyntaxHandler.ts#L167)

## Methods

### buildRegexFlags()

> `protected` **buildRegexFlags**(): `string`

Defined in: [src/parsers/handlers/BaseSyntaxHandler.ts:259](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/parsers/handlers/BaseSyntaxHandler.ts#L259)

Build regex flags based on options

#### Returns

`string`

Regex flags string

***

### clone()

> **clone**(`overrides`): [`HandlerCloneConfig`](../interfaces/HandlerCloneConfig.md)

Defined in: [src/parsers/handlers/BaseSyntaxHandler.ts:711](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/parsers/handlers/BaseSyntaxHandler.ts#L711)

Create a clone of this handler with different options

#### Parameters

##### overrides

`Partial`\<[`HandlerOptions`](../interfaces/HandlerOptions.md)\> & `object` = `{}`

Option overrides

#### Returns

[`HandlerCloneConfig`](../interfaces/HandlerCloneConfig.md)

Handler configuration for creating new instance

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

***

### createErrorContext()

> `protected` **createErrorContext**(`error`, `content`, `context`): [`ErrorContext`](../interfaces/ErrorContext.md)

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

[`ParseContext`](../interfaces/ParseContext.md)

Parse context

#### Returns

[`ErrorContext`](../interfaces/ErrorContext.md)

Error context

***

### createTimeoutPromise()

> `protected` **createTimeoutPromise**(): `Promise`\<`string`\>

Defined in: [src/parsers/handlers/BaseSyntaxHandler.ts:460](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/parsers/handlers/BaseSyntaxHandler.ts#L460)

Create timeout promise for handler execution

#### Returns

`Promise`\<`string`\>

Promise that rejects after timeout

***

### disable()

> **disable**(): `void`

Defined in: [src/parsers/handlers/BaseSyntaxHandler.ts:629](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/parsers/handlers/BaseSyntaxHandler.ts#L629)

Disable the handler

#### Returns

`void`

***

### enable()

> **enable**(): `void`

Defined in: [src/parsers/handlers/BaseSyntaxHandler.ts:622](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/parsers/handlers/BaseSyntaxHandler.ts#L622)

Enable the handler

#### Returns

`void`

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

[`ParseContext`](../interfaces/ParseContext.md)

Parse context

#### Returns

`Promise`\<`string`\>

Processed content

***

### getDependencyErrors()

> **getDependencyErrors**(): [`DependencyError`](../interfaces/DependencyError.md)[]

Defined in: [src/parsers/handlers/BaseSyntaxHandler.ts:376](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/parsers/handlers/BaseSyntaxHandler.ts#L376)

Get dependency validation errors

#### Returns

[`DependencyError`](../interfaces/DependencyError.md)[]

Array of dependency errors

***

### getMetadata()

> **getMetadata**(): [`HandlerMetadata`](../interfaces/HandlerMetadata.md)

Defined in: [src/parsers/handlers/BaseSyntaxHandler.ts:677](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/parsers/handlers/BaseSyntaxHandler.ts#L677)

Get handler metadata

#### Returns

[`HandlerMetadata`](../interfaces/HandlerMetadata.md)

Handler metadata

***

### getStats()

> **getStats**(): [`HandlerStats`](../interfaces/HandlerStats.md) & `object`

Defined in: [src/parsers/handlers/BaseSyntaxHandler.ts:645](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/parsers/handlers/BaseSyntaxHandler.ts#L645)

Get handler statistics

#### Returns

[`HandlerStats`](../interfaces/HandlerStats.md) & `object`

Handler statistics

***

### handle()

> **handle**(`_match`, `_context`): `Promise`\<`string`\>

Defined in: [src/parsers/handlers/BaseSyntaxHandler.ts:402](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/parsers/handlers/BaseSyntaxHandler.ts#L402)

Handle a specific match - called for each pattern match

#### Parameters

##### \_match

`RegExpMatchArray`

##### \_context

[`ParseContext`](../interfaces/ParseContext.md)

#### Returns

`Promise`\<`string`\>

Replacement content

***

### hasDependencyErrors()

> **hasDependencyErrors**(): `boolean`

Defined in: [src/parsers/handlers/BaseSyntaxHandler.ts:384](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/parsers/handlers/BaseSyntaxHandler.ts#L384)

Check if handler has unresolved dependencies

#### Returns

`boolean`

True if there are dependency errors

***

### initialize()

> **initialize**(`context`): `Promise`\<`void`\>

Defined in: [src/parsers/handlers/BaseSyntaxHandler.ts:272](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/parsers/handlers/BaseSyntaxHandler.ts#L272)

Initialize the handler (optional override)
Called when handler is registered

#### Parameters

##### context

[`InitializationContext`](../interfaces/InitializationContext.md) = `{}`

Initialization context

#### Returns

`Promise`\<`void`\>

***

### isEnabled()

> **isEnabled**(): `boolean`

Defined in: [src/parsers/handlers/BaseSyntaxHandler.ts:637](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/parsers/handlers/BaseSyntaxHandler.ts#L637)

Check if handler is enabled

#### Returns

`boolean`

True if enabled

***

### onInitialize()

> `protected` **onInitialize**(`_context`): `Promise`\<`void`\>

Defined in: [src/parsers/handlers/BaseSyntaxHandler.ts:293](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/parsers/handlers/BaseSyntaxHandler.ts#L293)

Custom initialization logic (override in subclasses)

#### Parameters

##### \_context

[`InitializationContext`](../interfaces/InitializationContext.md)

Initialization context

#### Returns

`Promise`\<`void`\>

***

### onShutdown()

> `protected` **onShutdown**(): `Promise`\<`void`\>

Defined in: [src/parsers/handlers/BaseSyntaxHandler.ts:702](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/parsers/handlers/BaseSyntaxHandler.ts#L702)

Custom shutdown logic (override in subclasses)

#### Returns

`Promise`\<`void`\>

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

***

### process()

> `abstract` **process**(`content`, `context`): `Promise`\<`string`\>

Defined in: [src/parsers/handlers/BaseSyntaxHandler.ts:394](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/parsers/handlers/BaseSyntaxHandler.ts#L394)

Main processing method - MUST be implemented by subclasses

#### Parameters

##### content

`string`

Content to process

##### context

[`ParseContext`](../interfaces/ParseContext.md)

Parse context

#### Returns

`Promise`\<`string`\>

Processed content

***

### resetStats()

> **resetStats**(): `void`

Defined in: [src/parsers/handlers/BaseSyntaxHandler.ts:663](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/parsers/handlers/BaseSyntaxHandler.ts#L663)

Reset handler statistics

#### Returns

`void`

***

### shutdown()

> **shutdown**(): `Promise`\<`void`\>

Defined in: [src/parsers/handlers/BaseSyntaxHandler.ts:694](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/parsers/handlers/BaseSyntaxHandler.ts#L694)

Clean up handler resources (optional override)
Called when handler is unregistered

#### Returns

`Promise`\<`void`\>

***

### toString()

> **toString**(): `string`

Defined in: [src/parsers/handlers/BaseSyntaxHandler.ts:729](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/parsers/handlers/BaseSyntaxHandler.ts#L729)

String representation of handler

#### Returns

`string`

String representation

***

### validateDependencies()

> `protected` **validateDependencies**(`context`): `void`

Defined in: [src/parsers/handlers/BaseSyntaxHandler.ts:301](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/parsers/handlers/BaseSyntaxHandler.ts#L301)

Validate handler dependencies

#### Parameters

##### context

[`InitializationContext`](../interfaces/InitializationContext.md)

Initialization context

#### Returns

`void`

***

### validateParameter()

> `protected` **validateParameter**(`key`, `value`, `rule`): [`ParameterValidationResult`](../interfaces/ParameterValidationResult.md)

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

[`ValidationRule`](../interfaces/ValidationRule.md)

Validation rule

#### Returns

[`ParameterValidationResult`](../interfaces/ParameterValidationResult.md)

Validation result

***

### validateParameters()

> **validateParameters**(`params`, `schema`): [`ValidationResult`](../interfaces/ValidationResult.md)

Defined in: [src/parsers/handlers/BaseSyntaxHandler.ts:535](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/parsers/handlers/BaseSyntaxHandler.ts#L535)

Validate parameters against schema

#### Parameters

##### params

`Record`\<`string`, `unknown`\>

Parameters to validate

##### schema

`Record`\<`string`, [`ValidationRule`](../interfaces/ValidationRule.md)\> = `{}`

Validation schema

#### Returns

[`ValidationResult`](../interfaces/ValidationResult.md)

Validation result

***

### validateSpecificDependency()

> `protected` **validateSpecificDependency**(`dependency`, `context`): `void`

Defined in: [src/parsers/handlers/BaseSyntaxHandler.ts:338](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/parsers/handlers/BaseSyntaxHandler.ts#L338)

Validate specific dependency requirement

#### Parameters

##### dependency

[`DependencySpec`](../interfaces/DependencySpec.md)

Dependency specification

##### context

[`InitializationContext`](../interfaces/InitializationContext.md)

Initialization context

#### Returns

`void`
