[**amdWiki API v1.5.0**](../../../../../README.md)

***

[amdWiki API](../../../../../README.md) / [src/parsers/filters/SecurityFilter](../README.md) / export=

# Class: export=

Defined in: [src/parsers/filters/SecurityFilter.js:19](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/filters/SecurityFilter.js#L19)

SecurityFilter - Comprehensive security validation with modular configuration

Provides XSS prevention, CSRF protection, HTML sanitization, and dangerous content
detection with complete configurability through app-default-config.json and
app-custom-config.json override system.

Design Principles:

- Security-by-default with configurable relaxation
- Complete modularity through JSON configuration
- Zero hardcoded security rules - everything configurable
- Deployment-specific security levels

Related Issue: Phase 4 - Security Filter Suite
Epic: #41 - Implement JSPWikiMarkupParser for Complete Enhancement Support

## Extends

- [`export=`](../../BaseFilter/classes/export=.md)

## Constructors

### Constructor

> **new export=**(): `SecurityFilter`

Defined in: [src/parsers/filters/SecurityFilter.js:20](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/filters/SecurityFilter.js#L20)

#### Returns

`SecurityFilter`

#### Overrides

[`export=`](../../BaseFilter/classes/export=.md).[`constructor`](../../BaseFilter/classes/export=.md#constructor)

## Properties

### allowedAttributes

> **allowedAttributes**: `Set`\<`any`\>

Defined in: [src/parsers/filters/SecurityFilter.js:34](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/filters/SecurityFilter.js#L34)

***

### allowedTags

> **allowedTags**: `Set`\<`any`\>

Defined in: [src/parsers/filters/SecurityFilter.js:33](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/filters/SecurityFilter.js#L33)

***

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

### dangerousPatterns

> **dangerousPatterns**: `any`[]

Defined in: [src/parsers/filters/SecurityFilter.js:35](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/filters/SecurityFilter.js#L35)

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

### filterId

> **filterId**: `string`

Defined in: [src/parsers/filters/SecurityFilter.js:31](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/filters/SecurityFilter.js#L31)

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

### securityConfig

> **securityConfig**: `object`

Defined in: [src/parsers/filters/SecurityFilter.js:32](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/filters/SecurityFilter.js#L32)

#### allowDataURIs

> **allowDataURIs**: `boolean` = `false`

#### allowExternalLinks

> **allowExternalLinks**: `boolean` = `true`

#### allowInlineEvents

> **allowInlineEvents**: `boolean` = `false`

#### allowJavaScript

> **allowJavaScript**: `boolean` = `false`

#### logSecurityViolations

> **logSecurityViolations**: `boolean` = `true`

#### maxContentLength

> **maxContentLength**: `number` = `1048576`

#### preventCSRF

> **preventCSRF**: `boolean` = `true`

#### preventXSS

> **preventXSS**: `boolean` = `true`

#### sanitizeHTML

> **sanitizeHTML**: `boolean` = `true`

#### stripDangerousContent

> **stripDangerousContent**: `boolean` = `true`

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

### version

> **version**: `any`

Defined in: [src/parsers/filters/BaseFilter.js:45](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/filters/BaseFilter.js#L45)

#### Inherited from

[`export=`](../../BaseFilter/classes/export=.md).[`version`](../../BaseFilter/classes/export=.md#version)

## Methods

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

### escapeAttributeValue()

> **escapeAttributeValue**(`value`): `string`

Defined in: [src/parsers/filters/SecurityFilter.js:351](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/filters/SecurityFilter.js#L351)

Escape attribute values to prevent injection (modular escaping)

#### Parameters

##### value

`string`

Attribute value to escape

#### Returns

`string`

- Escaped value

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

Defined in: [src/parsers/filters/SecurityFilter.js:419](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/filters/SecurityFilter.js#L419)

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

### getSecurityConfiguration()

> **getSecurityConfiguration**(): `any`

Defined in: [src/parsers/filters/SecurityFilter.js:390](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/filters/SecurityFilter.js#L390)

Get security configuration summary (modular introspection)

#### Returns

`any`

- Security configuration summary

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

### initializeDangerousPatterns()

> **initializeDangerousPatterns**(): `void`

Defined in: [src/parsers/filters/SecurityFilter.js:135](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/filters/SecurityFilter.js#L135)

Initialize dangerous patterns based on configuration (modular security patterns)

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

### isValidURL()

> **isValidURL**(`url`): `boolean`

Defined in: [src/parsers/filters/SecurityFilter.js:318](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/filters/SecurityFilter.js#L318)

Validate URL for href and src attributes (modular URL validation)

#### Parameters

##### url

`string`

URL to validate

#### Returns

`boolean`

- True if valid and safe

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

### loadModularSecurityConfiguration()

> **loadModularSecurityConfiguration**(`context`): `Promise`\<`void`\>

Defined in: [src/parsers/filters/SecurityFilter.js:58](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/filters/SecurityFilter.js#L58)

Load modular security configuration from configuration hierarchy

#### Parameters

##### context

`any`

Initialization context

#### Returns

`Promise`\<`void`\>

***

### loadSecureDefaults()

> **loadSecureDefaults**(): `void`

Defined in: [src/parsers/filters/SecurityFilter.js:122](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/filters/SecurityFilter.js#L122)

Load secure default configuration when configuration files unavailable

#### Returns

`void`

***

### logSecurityViolation()

> **logSecurityViolation**(`originalContent`, `filteredContent`, `context`): `void`

Defined in: [src/parsers/filters/SecurityFilter.js:366](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/filters/SecurityFilter.js#L366)

Log security violation for monitoring (modular logging)

#### Parameters

##### originalContent

`string`

Original content

##### filteredContent

`string`

Filtered content

##### context

`ParseContext`

Parse context

#### Returns

`void`

***

### onInitialize()

> **onInitialize**(`context`): `Promise`\<`void`\>

Defined in: [src/parsers/filters/SecurityFilter.js:42](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/filters/SecurityFilter.js#L42)

Initialize filter with modular security configuration

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

### preventXSS()

> **preventXSS**(`content`): `string`

Defined in: [src/parsers/filters/SecurityFilter.js:234](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/filters/SecurityFilter.js#L234)

Prevent XSS attacks (modular XSS prevention)

#### Parameters

##### content

`string`

Content to protect

#### Returns

`string`

- XSS-safe content

***

### process()

> **process**(`content`, `context`): `Promise`\<`string`\>

Defined in: [src/parsers/filters/SecurityFilter.js:170](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/filters/SecurityFilter.js#L170)

Process content through security filters with modular validation

#### Parameters

##### content

`string`

Content to filter

##### context

`ParseContext`

Parse context

#### Returns

`Promise`\<`string`\>

- Securely filtered content

#### Overrides

[`export=`](../../BaseFilter/classes/export=.md).[`process`](../../BaseFilter/classes/export=.md#process)

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

### sanitizeAttributes()

> **sanitizeAttributes**(`attributeString`): `string`

Defined in: [src/parsers/filters/SecurityFilter.js:284](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/filters/SecurityFilter.js#L284)

Sanitize HTML attributes based on allowed attributes (modular attribute sanitization)

#### Parameters

##### attributeString

`string`

Attributes to sanitize

#### Returns

`string`

- Sanitized attributes

***

### sanitizeHTML()

> **sanitizeHTML**(`content`): `string`

Defined in: [src/parsers/filters/SecurityFilter.js:249](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/filters/SecurityFilter.js#L249)

Sanitize HTML based on allowed tags and attributes (modular HTML sanitization)

#### Parameters

##### content

`string`

Content to sanitize

#### Returns

`string`

- Sanitized content

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

### stripDangerousContent()

> **stripDangerousContent**(`content`): `string`

Defined in: [src/parsers/filters/SecurityFilter.js:219](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/filters/SecurityFilter.js#L219)

Strip dangerous content based on configured patterns (modular security)

#### Parameters

##### content

`string`

Content to clean

#### Returns

`string`

- Cleaned content

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
