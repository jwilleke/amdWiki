[**amdWiki API v1.5.0**](../../../../../README.md)

***

[amdWiki API](../../../../../README.md) / [src/parsers/filters/ValidationFilter](../README.md) / default

# Class: default

Defined in: [src/parsers/filters/ValidationFilter.ts:107](https://github.com/jwilleke/amdWiki/blob/b6a859c7c9297966de89735ea5e8f953df289ac1/src/parsers/filters/ValidationFilter.ts#L107)

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

- [`default`](../../BaseFilter/classes/default.md)

## Constructors

### Constructor

> **new default**(): `ValidationFilter`

Defined in: [src/parsers/filters/ValidationFilter.ts:113](https://github.com/jwilleke/amdWiki/blob/b6a859c7c9297966de89735ea5e8f953df289ac1/src/parsers/filters/ValidationFilter.ts#L113)

#### Returns

`ValidationFilter`

#### Overrides

[`default`](../../BaseFilter/classes/default.md).[`constructor`](../../BaseFilter/classes/default.md#constructor)

## Properties

### category

> `readonly` **category**: `string`

Defined in: [src/parsers/filters/BaseFilter.ts:140](https://github.com/jwilleke/amdWiki/blob/b6a859c7c9297966de89735ea5e8f953df289ac1/src/parsers/filters/BaseFilter.ts#L140)

#### Inherited from

[`default`](../../BaseFilter/classes/default.md).[`category`](../../BaseFilter/classes/default.md#category)

***

### config

> `protected` **config**: [`FilterConfig`](../../BaseFilter/interfaces/FilterConfig.md) \| `null`

Defined in: [src/parsers/filters/BaseFilter.ts:146](https://github.com/jwilleke/amdWiki/blob/b6a859c7c9297966de89735ea5e8f953df289ac1/src/parsers/filters/BaseFilter.ts#L146)

#### Inherited from

[`default`](../../BaseFilter/classes/default.md).[`config`](../../BaseFilter/classes/default.md#config)

***

### description

> `readonly` **description**: `string`

Defined in: [src/parsers/filters/BaseFilter.ts:139](https://github.com/jwilleke/amdWiki/blob/b6a859c7c9297966de89735ea5e8f953df289ac1/src/parsers/filters/BaseFilter.ts#L139)

#### Inherited from

[`default`](../../BaseFilter/classes/default.md).[`description`](../../BaseFilter/classes/default.md#description)

***

### enabled

> `protected` **enabled**: `boolean`

Defined in: [src/parsers/filters/BaseFilter.ts:144](https://github.com/jwilleke/amdWiki/blob/b6a859c7c9297966de89735ea5e8f953df289ac1/src/parsers/filters/BaseFilter.ts#L144)

#### Inherited from

[`default`](../../BaseFilter/classes/default.md).[`enabled`](../../BaseFilter/classes/default.md#enabled)

***

### errorReports

> **errorReports**: `ValidationReport`[]

Defined in: [src/parsers/filters/ValidationFilter.ts:111](https://github.com/jwilleke/amdWiki/blob/b6a859c7c9297966de89735ea5e8f953df289ac1/src/parsers/filters/ValidationFilter.ts#L111)

***

### filterId

> **filterId**: `string`

Defined in: [src/parsers/filters/ValidationFilter.ts:108](https://github.com/jwilleke/amdWiki/blob/b6a859c7c9297966de89735ea5e8f953df289ac1/src/parsers/filters/ValidationFilter.ts#L108)

#### Overrides

[`default`](../../BaseFilter/classes/default.md).[`filterId`](../../BaseFilter/classes/default.md#filterid)

***

### initialized

> `protected` **initialized**: `boolean`

Defined in: [src/parsers/filters/BaseFilter.ts:145](https://github.com/jwilleke/amdWiki/blob/b6a859c7c9297966de89735ea5e8f953df289ac1/src/parsers/filters/BaseFilter.ts#L145)

#### Inherited from

[`default`](../../BaseFilter/classes/default.md).[`initialized`](../../BaseFilter/classes/default.md#initialized)

***

### options

> `protected` **options**: `Required`\<[`FilterOptions`](../../BaseFilter/interfaces/FilterOptions.md)\>

Defined in: [src/parsers/filters/BaseFilter.ts:142](https://github.com/jwilleke/amdWiki/blob/b6a859c7c9297966de89735ea5e8f953df289ac1/src/parsers/filters/BaseFilter.ts#L142)

#### Inherited from

[`default`](../../BaseFilter/classes/default.md).[`options`](../../BaseFilter/classes/default.md#options)

***

### priority

> **priority**: `number`

Defined in: [src/parsers/filters/BaseFilter.ts:136](https://github.com/jwilleke/amdWiki/blob/b6a859c7c9297966de89735ea5e8f953df289ac1/src/parsers/filters/BaseFilter.ts#L136)

#### Inherited from

[`default`](../../BaseFilter/classes/default.md).[`priority`](../../BaseFilter/classes/default.md#priority)

***

### stats

> `protected` **stats**: [`FilterStats`](../../BaseFilter/interfaces/FilterStats.md)

Defined in: [src/parsers/filters/BaseFilter.ts:143](https://github.com/jwilleke/amdWiki/blob/b6a859c7c9297966de89735ea5e8f953df289ac1/src/parsers/filters/BaseFilter.ts#L143)

#### Inherited from

[`default`](../../BaseFilter/classes/default.md).[`stats`](../../BaseFilter/classes/default.md#stats)

***

### validationConfig

> **validationConfig**: `ValidationConfig` \| `null`

Defined in: [src/parsers/filters/ValidationFilter.ts:109](https://github.com/jwilleke/amdWiki/blob/b6a859c7c9297966de89735ea5e8f953df289ac1/src/parsers/filters/ValidationFilter.ts#L109)

***

### validationRules

> **validationRules**: `Map`\<`string`, `ValidationRule`\>

Defined in: [src/parsers/filters/ValidationFilter.ts:110](https://github.com/jwilleke/amdWiki/blob/b6a859c7c9297966de89735ea5e8f953df289ac1/src/parsers/filters/ValidationFilter.ts#L110)

***

### version

> `readonly` **version**: `string`

Defined in: [src/parsers/filters/BaseFilter.ts:138](https://github.com/jwilleke/amdWiki/blob/b6a859c7c9297966de89735ea5e8f953df289ac1/src/parsers/filters/BaseFilter.ts#L138)

#### Inherited from

[`default`](../../BaseFilter/classes/default.md).[`version`](../../BaseFilter/classes/default.md#version)

## Methods

### addValidationComments()

> **addValidationComments**(`content`, `errors`, `warnings`): `string`

Defined in: [src/parsers/filters/ValidationFilter.ts:532](https://github.com/jwilleke/amdWiki/blob/b6a859c7c9297966de89735ea5e8f953df289ac1/src/parsers/filters/ValidationFilter.ts#L532)

Add validation comments to content (modular error reporting)

#### Parameters

##### content

`string`

Original content

##### errors

`ValidationError`[]

Validation errors

##### warnings

`ValidationError`[]

Validation warnings

#### Returns

`string`

Content with validation comments

***

### addValidationRule()

> **addValidationRule**(`ruleName`, `validator`, `errorMessage`, `severity`): `boolean`

Defined in: [src/parsers/filters/ValidationFilter.ts:578](https://github.com/jwilleke/amdWiki/blob/b6a859c7c9297966de89735ea5e8f953df289ac1/src/parsers/filters/ValidationFilter.ts#L578)

Add custom validation rule (modular extensibility)

#### Parameters

##### ruleName

`string`

Rule identifier

##### validator

(`content`, `context?`) => `boolean` \| `Promise`\<`boolean`\>

Validation function

##### errorMessage

`string`

Error message

##### severity

Error severity (error/warning)

`"error"` | `"warning"`

#### Returns

`boolean`

True if rule added

***

### clearValidationReports()

> **clearValidationReports**(): `void`

Defined in: [src/parsers/filters/ValidationFilter.ts:566](https://github.com/jwilleke/amdWiki/blob/b6a859c7c9297966de89735ea5e8f953df289ac1/src/parsers/filters/ValidationFilter.ts#L566)

Clear validation error reports

#### Returns

`void`

***

### createErrorContext()

> `protected` **createErrorContext**(`error`, `content`, `context`): [`FilterErrorContext`](../../BaseFilter/interfaces/FilterErrorContext.md)

Defined in: [src/parsers/filters/BaseFilter.ts:340](https://github.com/jwilleke/amdWiki/blob/b6a859c7c9297966de89735ea5e8f953df289ac1/src/parsers/filters/BaseFilter.ts#L340)

Create error context for debugging (modular error handling)

#### Parameters

##### error

`Error`

The error that occurred

##### content

`string`

Content being processed

##### context

[`ParseContext`](../../BaseFilter/interfaces/ParseContext.md)

Parse context

#### Returns

[`FilterErrorContext`](../../BaseFilter/interfaces/FilterErrorContext.md)

Error context

#### Inherited from

[`default`](../../BaseFilter/classes/default.md).[`createErrorContext`](../../BaseFilter/classes/default.md#createerrorcontext)

***

### disable()

> **disable**(): `void`

Defined in: [src/parsers/filters/BaseFilter.ts:366](https://github.com/jwilleke/amdWiki/blob/b6a859c7c9297966de89735ea5e8f953df289ac1/src/parsers/filters/BaseFilter.ts#L366)

Disable the filter

#### Returns

`void`

#### Inherited from

[`default`](../../BaseFilter/classes/default.md).[`disable`](../../BaseFilter/classes/default.md#disable)

***

### enable()

> **enable**(): `void`

Defined in: [src/parsers/filters/BaseFilter.ts:359](https://github.com/jwilleke/amdWiki/blob/b6a859c7c9297966de89735ea5e8f953df289ac1/src/parsers/filters/BaseFilter.ts#L359)

Enable the filter

#### Returns

`void`

#### Inherited from

[`default`](../../BaseFilter/classes/default.md).[`enable`](../../BaseFilter/classes/default.md#enable)

***

### execute()

> **execute**(`content`, `context`): `Promise`\<`string`\>

Defined in: [src/parsers/filters/BaseFilter.ts:300](https://github.com/jwilleke/amdWiki/blob/b6a859c7c9297966de89735ea5e8f953df289ac1/src/parsers/filters/BaseFilter.ts#L300)

Execute filter with performance tracking and error handling

#### Parameters

##### content

`string`

Content to process

##### context

[`ParseContext`](../../BaseFilter/interfaces/ParseContext.md)

Parse context

#### Returns

`Promise`\<`string`\>

Processed content

#### Inherited from

[`default`](../../BaseFilter/classes/default.md).[`execute`](../../BaseFilter/classes/default.md#execute)

***

### getConfigurationSummary()

> **getConfigurationSummary**(): [`ConfigurationSummary`](../../BaseFilter/interfaces/ConfigurationSummary.md)

Defined in: [src/parsers/filters/BaseFilter.ts:434](https://github.com/jwilleke/amdWiki/blob/b6a859c7c9297966de89735ea5e8f953df289ac1/src/parsers/filters/BaseFilter.ts#L434)

Get configuration summary for debugging (modular introspection)

#### Returns

[`ConfigurationSummary`](../../BaseFilter/interfaces/ConfigurationSummary.md)

Configuration summary

#### Inherited from

[`default`](../../BaseFilter/classes/default.md).[`getConfigurationSummary`](../../BaseFilter/classes/default.md#getconfigurationsummary)

***

### getFilterType()

> `protected` **getFilterType**(): `string` \| `null`

Defined in: [src/parsers/filters/BaseFilter.ts:265](https://github.com/jwilleke/amdWiki/blob/b6a859c7c9297966de89735ea5e8f953df289ac1/src/parsers/filters/BaseFilter.ts#L265)

Get filter type for configuration lookup (override in subclasses)

#### Returns

`string` \| `null`

Filter type for configuration

#### Inherited from

[`default`](../../BaseFilter/classes/default.md).[`getFilterType`](../../BaseFilter/classes/default.md#getfiltertype)

***

### getInfo()

> **getInfo**(): `Record`\<`string`, `unknown`\>

Defined in: [src/parsers/filters/ValidationFilter.ts:640](https://github.com/jwilleke/amdWiki/blob/b6a859c7c9297966de89735ea5e8f953df289ac1/src/parsers/filters/ValidationFilter.ts#L640)

Get filter information for debugging and documentation

#### Returns

`Record`\<`string`, `unknown`\>

Filter information

***

### getMetadata()

> **getMetadata**(): [`FilterMetadata`](../../BaseFilter/interfaces/FilterMetadata.md)

Defined in: [src/parsers/filters/BaseFilter.ts:416](https://github.com/jwilleke/amdWiki/blob/b6a859c7c9297966de89735ea5e8f953df289ac1/src/parsers/filters/BaseFilter.ts#L416)

Get filter metadata

#### Returns

[`FilterMetadata`](../../BaseFilter/interfaces/FilterMetadata.md)

Filter metadata

#### Inherited from

[`default`](../../BaseFilter/classes/default.md).[`getMetadata`](../../BaseFilter/classes/default.md#getmetadata)

***

### getStats()

> **getStats**(): [`FilterStats`](../../BaseFilter/interfaces/FilterStats.md) & `object`

Defined in: [src/parsers/filters/BaseFilter.ts:382](https://github.com/jwilleke/amdWiki/blob/b6a859c7c9297966de89735ea5e8f953df289ac1/src/parsers/filters/BaseFilter.ts#L382)

Get filter statistics

#### Returns

[`FilterStats`](../../BaseFilter/interfaces/FilterStats.md) & `object`

Filter statistics

#### Inherited from

[`default`](../../BaseFilter/classes/default.md).[`getStats`](../../BaseFilter/classes/default.md#getstats)

***

### getValidationConfiguration()

> **getValidationConfiguration**(): `Record`\<`string`, `unknown`\>

Defined in: [src/parsers/filters/ValidationFilter.ts:611](https://github.com/jwilleke/amdWiki/blob/b6a859c7c9297966de89735ea5e8f953df289ac1/src/parsers/filters/ValidationFilter.ts#L611)

Get validation configuration summary (modular introspection)

#### Returns

`Record`\<`string`, `unknown`\>

Validation configuration summary

***

### getValidationReports()

> **getValidationReports**(`limit`): `ValidationReport`[]

Defined in: [src/parsers/filters/ValidationFilter.ts:559](https://github.com/jwilleke/amdWiki/blob/b6a859c7c9297966de89735ea5e8f953df289ac1/src/parsers/filters/ValidationFilter.ts#L559)

Get validation error reports (modular error reporting)

#### Parameters

##### limit

`number` = `50`

Maximum number of reports to return

#### Returns

`ValidationReport`[]

Recent validation error reports

***

### handleValidationResults()

> **handleValidationResults**(`_content`, `errors`, `warnings`, `context`): `Promise`\<`void`\>

Defined in: [src/parsers/filters/ValidationFilter.ts:480](https://github.com/jwilleke/amdWiki/blob/b6a859c7c9297966de89735ea5e8f953df289ac1/src/parsers/filters/ValidationFilter.ts#L480)

Handle validation results based on configuration (modular error handling)

#### Parameters

##### \_content

`string`

Original content

##### errors

`ValidationError`[]

Validation errors

##### warnings

`ValidationError`[]

Validation warnings

##### context

`ParseContext`

Parse context

#### Returns

`Promise`\<`void`\>

***

### initialize()

> **initialize**(`context`): `Promise`\<`void`\>

Defined in: [src/parsers/filters/BaseFilter.ts:201](https://github.com/jwilleke/amdWiki/blob/b6a859c7c9297966de89735ea5e8f953df289ac1/src/parsers/filters/BaseFilter.ts#L201)

Initialize filter with modular configuration

#### Parameters

##### context

[`FilterInitializationContext`](../../BaseFilter/interfaces/FilterInitializationContext.md) = `{}`

Initialization context

#### Returns

`Promise`\<`void`\>

#### Inherited from

[`default`](../../BaseFilter/classes/default.md).[`initialize`](../../BaseFilter/classes/default.md#initialize)

***

### initializeValidationRules()

> **initializeValidationRules**(): `void`

Defined in: [src/parsers/filters/ValidationFilter.ts:201](https://github.com/jwilleke/amdWiki/blob/b6a859c7c9297966de89735ea5e8f953df289ac1/src/parsers/filters/ValidationFilter.ts#L201)

Initialize validation rules based on configuration (modular rule system)

#### Returns

`void`

***

### isEnabled()

> **isEnabled**(): `boolean`

Defined in: [src/parsers/filters/BaseFilter.ts:374](https://github.com/jwilleke/amdWiki/blob/b6a859c7c9297966de89735ea5e8f953df289ac1/src/parsers/filters/BaseFilter.ts#L374)

Check if filter is enabled

#### Returns

`boolean`

True if enabled

#### Inherited from

[`default`](../../BaseFilter/classes/default.md).[`isEnabled`](../../BaseFilter/classes/default.md#isenabled)

***

### isTrustedImageDomain()

> **isTrustedImageDomain**(`url`): `boolean`

Defined in: [src/parsers/filters/ValidationFilter.ts:455](https://github.com/jwilleke/amdWiki/blob/b6a859c7c9297966de89735ea5e8f953df289ac1/src/parsers/filters/ValidationFilter.ts#L455)

Check if image domain is trusted (modular domain validation)

#### Parameters

##### url

`string`

Image URL

#### Returns

`boolean`

True if from trusted domain

***

### isValidImageURL()

> **isValidImageURL**(`url`): `boolean`

Defined in: [src/parsers/filters/ValidationFilter.ts:435](https://github.com/jwilleke/amdWiki/blob/b6a859c7c9297966de89735ea5e8f953df289ac1/src/parsers/filters/ValidationFilter.ts#L435)

Validate image URL and format (modular image validation)

#### Parameters

##### url

`string`

Image URL to validate

#### Returns

`boolean`

True if valid image

***

### isValidURL()

> **isValidURL**(`url`): `boolean`

Defined in: [src/parsers/filters/ValidationFilter.ts:408](https://github.com/jwilleke/amdWiki/blob/b6a859c7c9297966de89735ea5e8f953df289ac1/src/parsers/filters/ValidationFilter.ts#L408)

Validate URL format and safety (modular URL validation)

#### Parameters

##### url

`string`

URL to validate

#### Returns

`boolean`

True if valid

***

### loadModularConfiguration()

> `protected` **loadModularConfiguration**(`context`): `void`

Defined in: [src/parsers/filters/BaseFilter.ts:219](https://github.com/jwilleke/amdWiki/blob/b6a859c7c9297966de89735ea5e8f953df289ac1/src/parsers/filters/BaseFilter.ts#L219)

Load configuration from app-default-config.json and app-custom-config.json

#### Parameters

##### context

[`FilterInitializationContext`](../../BaseFilter/interfaces/FilterInitializationContext.md)

Initialization context

#### Returns

`void`

#### Inherited from

[`default`](../../BaseFilter/classes/default.md).[`loadModularConfiguration`](../../BaseFilter/classes/default.md#loadmodularconfiguration)

***

### loadModularValidationConfiguration()

> **loadModularValidationConfiguration**(`context`): `void`

Defined in: [src/parsers/filters/ValidationFilter.ts:154](https://github.com/jwilleke/amdWiki/blob/b6a859c7c9297966de89735ea5e8f953df289ac1/src/parsers/filters/ValidationFilter.ts#L154)

Load modular validation configuration from app-default/custom-config.json

#### Parameters

##### context

`InitContext`

Initialization context

#### Returns

`void`

***

### onInitialize()

> **onInitialize**(`context`): `Promise`\<`void`\>

Defined in: [src/parsers/filters/ValidationFilter.ts:135](https://github.com/jwilleke/amdWiki/blob/b6a859c7c9297966de89735ea5e8f953df289ac1/src/parsers/filters/ValidationFilter.ts#L135)

Initialize filter with modular validation configuration

#### Parameters

##### context

`InitContext`

Initialization context

#### Returns

`Promise`\<`void`\>

#### Overrides

[`default`](../../BaseFilter/classes/default.md).[`onInitialize`](../../BaseFilter/classes/default.md#oninitialize)

***

### onShutdown()

> `protected` **onShutdown**(): `Promise`\<`void`\>

Defined in: [src/parsers/filters/BaseFilter.ts:456](https://github.com/jwilleke/amdWiki/blob/b6a859c7c9297966de89735ea5e8f953df289ac1/src/parsers/filters/BaseFilter.ts#L456)

Custom shutdown logic (override in subclasses)

#### Returns

`Promise`\<`void`\>

#### Inherited from

[`default`](../../BaseFilter/classes/default.md).[`onShutdown`](../../BaseFilter/classes/default.md#onshutdown)

***

### process()

> **process**(`content`, `context`): `Promise`\<`string`\>

Defined in: [src/parsers/filters/ValidationFilter.ts:271](https://github.com/jwilleke/amdWiki/blob/b6a859c7c9297966de89735ea5e8f953df289ac1/src/parsers/filters/ValidationFilter.ts#L271)

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

Validated content (with error comments if configured)

#### Overrides

[`default`](../../BaseFilter/classes/default.md).[`process`](../../BaseFilter/classes/default.md#process)

***

### removeValidationRule()

> **removeValidationRule**(`ruleName`): `boolean`

Defined in: [src/parsers/filters/ValidationFilter.ts:598](https://github.com/jwilleke/amdWiki/blob/b6a859c7c9297966de89735ea5e8f953df289ac1/src/parsers/filters/ValidationFilter.ts#L598)

Remove custom validation rule (modular management)

#### Parameters

##### ruleName

`string`

Rule identifier

#### Returns

`boolean`

True if rule removed

***

### resetStats()

> **resetStats**(): `void`

Defined in: [src/parsers/filters/BaseFilter.ts:402](https://github.com/jwilleke/amdWiki/blob/b6a859c7c9297966de89735ea5e8f953df289ac1/src/parsers/filters/BaseFilter.ts#L402)

Reset filter statistics

#### Returns

`void`

#### Inherited from

[`default`](../../BaseFilter/classes/default.md).[`resetStats`](../../BaseFilter/classes/default.md#resetstats)

***

### shutdown()

> **shutdown**(): `Promise`\<`void`\>

Defined in: [src/parsers/filters/BaseFilter.ts:448](https://github.com/jwilleke/amdWiki/blob/b6a859c7c9297966de89735ea5e8f953df289ac1/src/parsers/filters/BaseFilter.ts#L448)

Clean up filter resources (optional override)

#### Returns

`Promise`\<`void`\>

#### Inherited from

[`default`](../../BaseFilter/classes/default.md).[`shutdown`](../../BaseFilter/classes/default.md#shutdown)

***

### toString()

> **toString**(): `string`

Defined in: [src/parsers/filters/BaseFilter.ts:464](https://github.com/jwilleke/amdWiki/blob/b6a859c7c9297966de89735ea5e8f953df289ac1/src/parsers/filters/BaseFilter.ts#L464)

String representation of filter

#### Returns

`string`

String representation

#### Inherited from

[`default`](../../BaseFilter/classes/default.md).[`toString`](../../BaseFilter/classes/default.md#tostring)

***

### validateImages()

> **validateImages**(`content`): `boolean`

Defined in: [src/parsers/filters/ValidationFilter.ts:373](https://github.com/jwilleke/amdWiki/blob/b6a859c7c9297966de89735ea5e8f953df289ac1/src/parsers/filters/ValidationFilter.ts#L373)

Validate images in content (modular image validation)

#### Parameters

##### content

`string`

Content to validate

#### Returns

`boolean`

True if all images are valid

***

### validateLinks()

> **validateLinks**(`content`): `boolean`

Defined in: [src/parsers/filters/ValidationFilter.ts:338](https://github.com/jwilleke/amdWiki/blob/b6a859c7c9297966de89735ea5e8f953df289ac1/src/parsers/filters/ValidationFilter.ts#L338)

Validate links in content (modular link validation)

#### Parameters

##### content

`string`

Content to validate

#### Returns

`boolean`

True if all links are valid

***

### validateMarkupSyntax()

> **validateMarkupSyntax**(`content`): `boolean`

Defined in: [src/parsers/filters/ValidationFilter.ts:321](https://github.com/jwilleke/amdWiki/blob/b6a859c7c9297966de89735ea5e8f953df289ac1/src/parsers/filters/ValidationFilter.ts#L321)

Validate markup syntax (modular markup validation)

#### Parameters

##### content

`string`

Content to validate

#### Returns

`boolean`

True if markup is valid
