[**amdWiki API v1.5.0**](../../../../../README.md)

***

[amdWiki API](../../../../../README.md) / [src/parsers/filters/ValidationFilter](../README.md) / export=

# Class: export=

Defined in: [src/parsers/filters/ValidationFilter.js:19](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/filters/ValidationFilter.js#L19)

ValidationFilter - Content validation with modular configuration

Provides comprehensive content validation including markup syntax validation,
link checking, image validation, and content quality analysis through complete
modularity via app-default-config.json and app-custom-config.json.

Design Principles:

- Configurable validation rules and thresholds
- Zero hardcoded validation logic
- Deployment-specific validation policies
- Extensible validation rule system

Related Issue: Phase 4 - Security Filter Suite (Content Validation)
Epic: #41 - Implement JSPWikiMarkupParser for Complete Enhancement Support

## Extends

- [`export=`](../../BaseFilter/classes/export=.md)

## Constructors

### Constructor

> **new export=**(): `ValidationFilter`

Defined in: [src/parsers/filters/ValidationFilter.js:20](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/filters/ValidationFilter.js#L20)

#### Returns

`ValidationFilter`

#### Overrides

[`export=`](../../BaseFilter/classes/export=.md).[`constructor`](../../BaseFilter/classes/export=.md#constructor)

## Properties

### category

> **category**: `any`

Defined in: [src/parsers/filters/BaseFilter.js:47](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/filters/BaseFilter.js#L47)

#### Inherited from

[`export=`](../../BaseFilter/classes/export=.md).[`category`](../../BaseFilter/classes/export=.md#category)

***

### config

> **config**: `object`

Defined in: [src/parsers/filters/BaseFilter.js:61](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/filters/BaseFilter.js#L61)

#### cacheResults

> **cacheResults**: `boolean` = `true`

#### cacheTTL

> **cacheTTL**: `number` = `600`

#### enabled

> **enabled**: `boolean` = `true`

#### logLevel

> **logLevel**: `string` = `'warn'`

#### priority

> **priority**: `number`

#### reportErrors

> **reportErrors**: `boolean` = `true`

#### timeout

> **timeout**: `number` = `5000`

#### Inherited from

[`export=`](../../BaseFilter/classes/export=.md).[`config`](../../BaseFilter/classes/export=.md#config)

***

### description

> **description**: `any`

Defined in: [src/parsers/filters/BaseFilter.js:46](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/filters/BaseFilter.js#L46)

#### Inherited from

[`export=`](../../BaseFilter/classes/export=.md).[`description`](../../BaseFilter/classes/export=.md#description)

***

### enabled

> **enabled**: `any`

Defined in: [src/parsers/filters/BaseFilter.js:59](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/filters/BaseFilter.js#L59)

#### Inherited from

[`export=`](../../BaseFilter/classes/export=.md).[`enabled`](../../BaseFilter/classes/export=.md#enabled)

***

### errorReports

> **errorReports**: `any`[]

Defined in: [src/parsers/filters/ValidationFilter.js:34](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/filters/ValidationFilter.js#L34)

***

### filterId

> **filterId**: `string`

Defined in: [src/parsers/filters/ValidationFilter.js:31](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/filters/ValidationFilter.js#L31)

#### Inherited from

[`export=`](../../BaseFilter/classes/export=.md).[`filterId`](../../BaseFilter/classes/export=.md#filterid)

***

### initialized

> **initialized**: `boolean`

Defined in: [src/parsers/filters/BaseFilter.js:60](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/filters/BaseFilter.js#L60)

#### Inherited from

[`export=`](../../BaseFilter/classes/export=.md).[`initialized`](../../BaseFilter/classes/export=.md#initialized)

***

### options

> **options**: `any`

Defined in: [src/parsers/filters/BaseFilter.js:35](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/filters/BaseFilter.js#L35)

#### Inherited from

[`export=`](../../BaseFilter/classes/export=.md).[`options`](../../BaseFilter/classes/export=.md#options)

***

### priority

> **priority**: `number`

Defined in: [src/parsers/filters/BaseFilter.js:34](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/filters/BaseFilter.js#L34)

#### Inherited from

[`export=`](../../BaseFilter/classes/export=.md).[`priority`](../../BaseFilter/classes/export=.md#priority)

***

### stats

> **stats**: `object`

Defined in: [src/parsers/filters/BaseFilter.js:50](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/filters/BaseFilter.js#L50)

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

[`export=`](../../BaseFilter/classes/export=.md).[`stats`](../../BaseFilter/classes/export=.md#stats)

***

### validationConfig

> **validationConfig**: `object`

Defined in: [src/parsers/filters/ValidationFilter.js:32](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/filters/ValidationFilter.js#L32)

#### failOnValidationError

> **failOnValidationError**: `boolean` = `false`

#### logValidationErrors

> **logValidationErrors**: `boolean` = `true`

#### maxContentLength

> **maxContentLength**: `number` = `1048576`

#### maxDuplicateLines

> **maxDuplicateLines**: `number` = `10`

#### maxLineLength

> **maxLineLength**: `number` = `10000`

#### minWordCount

> **minWordCount**: `number` = `5`

#### reportErrors

> **reportErrors**: `boolean` = `true`

#### requireTitle

> **requireTitle**: `boolean` = `false`

#### validateImages

> **validateImages**: `boolean` = `true`

#### validateLinks

> **validateLinks**: `boolean` = `true`

#### validateMarkup

> **validateMarkup**: `boolean` = `true`

#### validateMetadata

> **validateMetadata**: `boolean` = `true`

***

### validationRules

> **validationRules**: `Map`\<`any`, `any`\>

Defined in: [src/parsers/filters/ValidationFilter.js:33](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/filters/ValidationFilter.js#L33)

***

### version

> **version**: `any`

Defined in: [src/parsers/filters/BaseFilter.js:45](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/filters/BaseFilter.js#L45)

#### Inherited from

[`export=`](../../BaseFilter/classes/export=.md).[`version`](../../BaseFilter/classes/export=.md#version)

## Methods

### addValidationComments()

> **addValidationComments**(`content`, `errors`, `warnings`): `string`

Defined in: [src/parsers/filters/ValidationFilter.js:435](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/filters/ValidationFilter.js#L435)

Add validation comments to content (modular error reporting)

#### Parameters

##### content

`string`

Original content

##### errors

`any`[]

Validation errors

##### warnings

`any`[]

Validation warnings

#### Returns

`string`

- Content with validation comments

***

### addValidationRule()

> **addValidationRule**(`ruleName`, `validator`, `errorMessage`, `severity`): `boolean`

Defined in: [src/parsers/filters/ValidationFilter.js:481](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/filters/ValidationFilter.js#L481)

Add custom validation rule (modular extensibility)

#### Parameters

##### ruleName

`string`

Rule identifier

##### validator

`Function`

Validation function

##### errorMessage

`string`

Error message

##### severity

`string` = `'warning'`

Error severity (error/warning)

#### Returns

`boolean`

- True if rule added

***

### clearValidationReports()

> **clearValidationReports**(): `void`

Defined in: [src/parsers/filters/ValidationFilter.js:469](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/filters/ValidationFilter.js#L469)

Clear validation error reports

#### Returns

`void`

***

### createErrorContext()

> **createErrorContext**(`error`, `content`, `context`): `any`

Defined in: [src/parsers/filters/BaseFilter.js:203](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/filters/BaseFilter.js#L203)

Create error context for debugging (modular error handling)

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

[`export=`](../../BaseFilter/classes/export=.md).[`createErrorContext`](../../BaseFilter/classes/export=.md#createerrorcontext)

***

### disable()

> **disable**(): `void`

Defined in: [src/parsers/filters/BaseFilter.js:229](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/filters/BaseFilter.js#L229)

Disable the filter

#### Returns

`void`

#### Inherited from

[`export=`](../../BaseFilter/classes/export=.md).[`disable`](../../BaseFilter/classes/export=.md#disable)

***

### enable()

> **enable**(): `void`

Defined in: [src/parsers/filters/BaseFilter.js:222](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/filters/BaseFilter.js#L222)

Enable the filter

#### Returns

`void`

#### Inherited from

[`export=`](../../BaseFilter/classes/export=.md).[`enable`](../../BaseFilter/classes/export=.md#enable)

***

### execute()

> **execute**(`content`, `context`): `Promise`\<`string`\>

Defined in: [src/parsers/filters/BaseFilter.js:163](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/filters/BaseFilter.js#L163)

Execute filter with performance tracking and error handling

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

[`export=`](../../BaseFilter/classes/export=.md).[`execute`](../../BaseFilter/classes/export=.md#execute)

***

### getConfigurationSummary()

> **getConfigurationSummary**(): `any`

Defined in: [src/parsers/filters/BaseFilter.js:291](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/filters/BaseFilter.js#L291)

Get configuration summary for debugging (modular introspection)

#### Returns

`any`

- Configuration summary

#### Inherited from

[`export=`](../../BaseFilter/classes/export=.md).[`getConfigurationSummary`](../../BaseFilter/classes/export=.md#getconfigurationsummary)

***

### getFilterType()

> **getFilterType**(): `string`

Defined in: [src/parsers/filters/BaseFilter.js:125](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/filters/BaseFilter.js#L125)

Get filter type for configuration lookup (override in subclasses)

#### Returns

`string`

- Filter type for configuration

#### Inherited from

[`export=`](../../BaseFilter/classes/export=.md).[`getFilterType`](../../BaseFilter/classes/export=.md#getfiltertype)

***

### getInfo()

> **getInfo**(): `any`

Defined in: [src/parsers/filters/ValidationFilter.js:543](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/filters/ValidationFilter.js#L543)

Get filter information for debugging and documentation

#### Returns

`any`

- Filter information

***

### getMetadata()

> **getMetadata**(): `any`

Defined in: [src/parsers/filters/BaseFilter.js:273](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/filters/BaseFilter.js#L273)

Get filter metadata

#### Returns

`any`

- Filter metadata

#### Inherited from

[`export=`](../../BaseFilter/classes/export=.md).[`getMetadata`](../../BaseFilter/classes/export=.md#getmetadata)

***

### getStats()

> **getStats**(): `any`

Defined in: [src/parsers/filters/BaseFilter.js:245](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/filters/BaseFilter.js#L245)

Get filter statistics

#### Returns

`any`

- Filter statistics

#### Inherited from

[`export=`](../../BaseFilter/classes/export=.md).[`getStats`](../../BaseFilter/classes/export=.md#getstats)

***

### getValidationConfiguration()

> **getValidationConfiguration**(): `any`

Defined in: [src/parsers/filters/ValidationFilter.js:514](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/filters/ValidationFilter.js#L514)

Get validation configuration summary (modular introspection)

#### Returns

`any`

- Validation configuration summary

***

### getValidationReports()

> **getValidationReports**(`limit`): `any`[]

Defined in: [src/parsers/filters/ValidationFilter.js:462](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/filters/ValidationFilter.js#L462)

Get validation error reports (modular error reporting)

#### Parameters

##### limit

`number` = `50`

Maximum number of reports to return

#### Returns

`any`[]

- Recent validation error reports

***

### handleValidationResults()

> **handleValidationResults**(`content`, `errors`, `warnings`, `context`): `Promise`\<`void`\>

Defined in: [src/parsers/filters/ValidationFilter.js:383](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/filters/ValidationFilter.js#L383)

Handle validation results based on configuration (modular error handling)

#### Parameters

##### content

`string`

Original content

##### errors

`any`[]

Validation errors

##### warnings

`any`[]

Validation warnings

##### context

`ParseContext`

Parse context

#### Returns

`Promise`\<`void`\>

***

### initialize()

> **initialize**(`context`): `Promise`\<`void`\>

Defined in: [src/parsers/filters/BaseFilter.js:69](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/filters/BaseFilter.js#L69)

Initialize filter with modular configuration

#### Parameters

##### context

`any` = `{}`

Initialization context

#### Returns

`Promise`\<`void`\>

#### Inherited from

[`export=`](../../BaseFilter/classes/export=.md).[`initialize`](../../BaseFilter/classes/export=.md#initialize)

***

### initializeValidationRules()

> **initializeValidationRules**(): `void`

Defined in: [src/parsers/filters/ValidationFilter.js:106](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/filters/ValidationFilter.js#L106)

Initialize validation rules based on configuration (modular rule system)

#### Returns

`void`

***

### isEnabled()

> **isEnabled**(): `boolean`

Defined in: [src/parsers/filters/BaseFilter.js:237](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/filters/BaseFilter.js#L237)

Check if filter is enabled

#### Returns

`boolean`

- True if enabled

#### Inherited from

[`export=`](../../BaseFilter/classes/export=.md).[`isEnabled`](../../BaseFilter/classes/export=.md#isenabled)

***

### isTrustedImageDomain()

> **isTrustedImageDomain**(`url`): `boolean`

Defined in: [src/parsers/filters/ValidationFilter.js:359](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/filters/ValidationFilter.js#L359)

Check if image domain is trusted (modular domain validation)

#### Parameters

##### url

`string`

Image URL

#### Returns

`boolean`

- True if from trusted domain

***

### isValidImageURL()

> **isValidImageURL**(`url`): `boolean`

Defined in: [src/parsers/filters/ValidationFilter.js:339](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/filters/ValidationFilter.js#L339)

Validate image URL and format (modular image validation)

#### Parameters

##### url

`string`

Image URL to validate

#### Returns

`boolean`

- True if valid image

***

### isValidURL()

> **isValidURL**(`url`): `boolean`

Defined in: [src/parsers/filters/ValidationFilter.js:312](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/filters/ValidationFilter.js#L312)

Validate URL format and safety (modular URL validation)

#### Parameters

##### url

`string`

URL to validate

#### Returns

`boolean`

- True if valid

***

### loadModularConfiguration()

> **loadModularConfiguration**(`context`): `Promise`\<`void`\>

Defined in: [src/parsers/filters/BaseFilter.js:87](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/filters/BaseFilter.js#L87)

Load configuration from app-default-config.json and app-custom-config.json

#### Parameters

##### context

`any`

Initialization context

#### Returns

`Promise`\<`void`\>

#### Inherited from

[`export=`](../../BaseFilter/classes/export=.md).[`loadModularConfiguration`](../../BaseFilter/classes/export=.md#loadmodularconfiguration)

***

### loadModularValidationConfiguration()

> **loadModularValidationConfiguration**(`context`): `Promise`\<`void`\>

Defined in: [src/parsers/filters/ValidationFilter.js:60](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/filters/ValidationFilter.js#L60)

Load modular validation configuration from app-default/custom-config.json

#### Parameters

##### context

`any`

Initialization context

#### Returns

`Promise`\<`void`\>

***

### onInitialize()

> **onInitialize**(`context`): `Promise`\<`void`\>

Defined in: [src/parsers/filters/ValidationFilter.js:41](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/filters/ValidationFilter.js#L41)

Initialize filter with modular validation configuration

#### Parameters

##### context

`any`

Initialization context

#### Returns

`Promise`\<`void`\>

#### Overrides

[`export=`](../../BaseFilter/classes/export=.md).[`onInitialize`](../../BaseFilter/classes/export=.md#oninitialize)

***

### onShutdown()

> **onShutdown**(): `Promise`\<`void`\>

Defined in: [src/parsers/filters/BaseFilter.js:315](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/filters/BaseFilter.js#L315)

Custom shutdown logic (override in subclasses)

#### Returns

`Promise`\<`void`\>

#### Inherited from

[`export=`](../../BaseFilter/classes/export=.md).[`onShutdown`](../../BaseFilter/classes/export=.md#onshutdown)

***

### process()

> **process**(`content`, `context`): `Promise`\<`string`\>

Defined in: [src/parsers/filters/ValidationFilter.js:176](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/filters/ValidationFilter.js#L176)

Process content through validation filters (modular validation)

#### Parameters

##### content

`string`

Content to validate

##### context

`ParseContext`

Parse context

#### Returns

`Promise`\<`string`\>

- Validated content (with error comments if configured)

#### Overrides

[`export=`](../../BaseFilter/classes/export=.md).[`process`](../../BaseFilter/classes/export=.md#process)

***

### removeValidationRule()

> **removeValidationRule**(`ruleName`): `boolean`

Defined in: [src/parsers/filters/ValidationFilter.js:501](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/filters/ValidationFilter.js#L501)

Remove custom validation rule (modular management)

#### Parameters

##### ruleName

`string`

Rule identifier

#### Returns

`boolean`

- True if rule removed

***

### resetStats()

> **resetStats**(): `void`

Defined in: [src/parsers/filters/BaseFilter.js:259](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/filters/BaseFilter.js#L259)

Reset filter statistics

#### Returns

`void`

#### Inherited from

[`export=`](../../BaseFilter/classes/export=.md).[`resetStats`](../../BaseFilter/classes/export=.md#resetstats)

***

### shutdown()

> **shutdown**(): `Promise`\<`void`\>

Defined in: [src/parsers/filters/BaseFilter.js:306](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/filters/BaseFilter.js#L306)

Clean up filter resources (optional override)

#### Returns

`Promise`\<`void`\>

#### Inherited from

[`export=`](../../BaseFilter/classes/export=.md).[`shutdown`](../../BaseFilter/classes/export=.md#shutdown)

***

### toString()

> **toString**(): `string`

Defined in: [src/parsers/filters/BaseFilter.js:323](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/filters/BaseFilter.js#L323)

String representation of filter

#### Returns

`string`

- String representation

#### Inherited from

[`export=`](../../BaseFilter/classes/export=.md).[`toString`](../../BaseFilter/classes/export=.md#tostring)

***

### validateImages()

> **validateImages**(`content`): `boolean`

Defined in: [src/parsers/filters/ValidationFilter.js:277](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/filters/ValidationFilter.js#L277)

Validate images in content (modular image validation)

#### Parameters

##### content

`string`

Content to validate

#### Returns

`boolean`

- True if all images are valid

***

### validateLinks()

> **validateLinks**(`content`): `boolean`

Defined in: [src/parsers/filters/ValidationFilter.js:242](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/filters/ValidationFilter.js#L242)

Validate links in content (modular link validation)

#### Parameters

##### content

`string`

Content to validate

#### Returns

`boolean`

- True if all links are valid

***

### validateMarkupSyntax()

> **validateMarkupSyntax**(`content`): `boolean`

Defined in: [src/parsers/filters/ValidationFilter.js:225](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/filters/ValidationFilter.js#L225)

Validate markup syntax (modular markup validation)

#### Parameters

##### content

`string`

Content to validate

#### Returns

`boolean`

- True if markup is valid
