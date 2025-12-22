[**amdWiki API v1.5.0**](../../../../../README.md)

***

[amdWiki API](../../../../../README.md) / [src/parsers/filters/BaseFilter](../README.md) / export=

# Class: export=

Defined in: [src/parsers/filters/BaseFilter.js:17](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/filters/BaseFilter.js#L17)

BaseFilter - Abstract base class for all content filters with modular configuration

Provides the foundation for content filtering with complete modularity through
app-default-config.json and app-custom-config.json configuration support.

Design Principles:

- Complete configuration modularity and reusability
- Zero hardcoded values - everything configurable
- Consistent interface across all filter types
- Performance monitoring and error handling
- Security-first design with configurable validation

Related Issue: Phase 4 - Filter Pipeline Core
Epic: #41 - Implement JSPWikiMarkupParser for Complete Enhancement Support

## Extended by

- [`export=`](../../SecurityFilter/classes/export=.md)
- [`export=`](../../SpamFilter/classes/export=.md)
- [`export=`](../../ValidationFilter/classes/export=.md)

## Constructors

### Constructor

> **new export=**(`priority`, `options`): `BaseFilter`

Defined in: [src/parsers/filters/BaseFilter.js:23](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/filters/BaseFilter.js#L23)

Create a content filter

#### Parameters

##### priority

`number` = `100`

Filter priority (0-1000, higher = executed first)

##### options

`any` = `{}`

Filter configuration options

#### Returns

`BaseFilter`

## Properties

### category

> **category**: `any`

Defined in: [src/parsers/filters/BaseFilter.js:47](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/filters/BaseFilter.js#L47)

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

***

### description

> **description**: `any`

Defined in: [src/parsers/filters/BaseFilter.js:46](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/filters/BaseFilter.js#L46)

***

### enabled

> **enabled**: `any`

Defined in: [src/parsers/filters/BaseFilter.js:59](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/filters/BaseFilter.js#L59)

***

### filterId

> **filterId**: `string`

Defined in: [src/parsers/filters/BaseFilter.js:44](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/filters/BaseFilter.js#L44)

***

### initialized

> **initialized**: `boolean`

Defined in: [src/parsers/filters/BaseFilter.js:60](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/filters/BaseFilter.js#L60)

***

### options

> **options**: `any`

Defined in: [src/parsers/filters/BaseFilter.js:35](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/filters/BaseFilter.js#L35)

***

### priority

> **priority**: `number`

Defined in: [src/parsers/filters/BaseFilter.js:34](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/filters/BaseFilter.js#L34)

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

***

### version

> **version**: `any`

Defined in: [src/parsers/filters/BaseFilter.js:45](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/filters/BaseFilter.js#L45)

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

***

### disable()

> **disable**(): `void`

Defined in: [src/parsers/filters/BaseFilter.js:229](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/filters/BaseFilter.js#L229)

Disable the filter

#### Returns

`void`

***

### enable()

> **enable**(): `void`

Defined in: [src/parsers/filters/BaseFilter.js:222](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/filters/BaseFilter.js#L222)

Enable the filter

#### Returns

`void`

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

***

### getConfigurationSummary()

> **getConfigurationSummary**(): `any`

Defined in: [src/parsers/filters/BaseFilter.js:291](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/filters/BaseFilter.js#L291)

Get configuration summary for debugging (modular introspection)

#### Returns

`any`

- Configuration summary

***

### getFilterType()

> **getFilterType**(): `string`

Defined in: [src/parsers/filters/BaseFilter.js:125](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/filters/BaseFilter.js#L125)

Get filter type for configuration lookup (override in subclasses)

#### Returns

`string`

- Filter type for configuration

***

### getMetadata()

> **getMetadata**(): `any`

Defined in: [src/parsers/filters/BaseFilter.js:273](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/filters/BaseFilter.js#L273)

Get filter metadata

#### Returns

`any`

- Filter metadata

***

### getStats()

> **getStats**(): `any`

Defined in: [src/parsers/filters/BaseFilter.js:245](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/filters/BaseFilter.js#L245)

Get filter statistics

#### Returns

`any`

- Filter statistics

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

***

### isEnabled()

> **isEnabled**(): `boolean`

Defined in: [src/parsers/filters/BaseFilter.js:237](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/filters/BaseFilter.js#L237)

Check if filter is enabled

#### Returns

`boolean`

- True if enabled

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

***

### onInitialize()

> **onInitialize**(`context`): `Promise`\<`void`\>

Defined in: [src/parsers/filters/BaseFilter.js:143](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/filters/BaseFilter.js#L143)

Custom initialization logic (override in subclasses)

#### Parameters

##### context

`any`

Initialization context

#### Returns

`Promise`\<`void`\>

***

### onShutdown()

> **onShutdown**(): `Promise`\<`void`\>

Defined in: [src/parsers/filters/BaseFilter.js:315](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/filters/BaseFilter.js#L315)

Custom shutdown logic (override in subclasses)

#### Returns

`Promise`\<`void`\>

***

### process()

> **process**(`content`, `context`): `Promise`\<`string`\>

Defined in: [src/parsers/filters/BaseFilter.js:153](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/filters/BaseFilter.js#L153)

Main filter processing method - MUST be implemented by subclasses

#### Parameters

##### content

`string`

Content to filter

##### context

`ParseContext`

Parse context

#### Returns

`Promise`\<`string`\>

- Filtered content

***

### resetStats()

> **resetStats**(): `void`

Defined in: [src/parsers/filters/BaseFilter.js:259](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/filters/BaseFilter.js#L259)

Reset filter statistics

#### Returns

`void`

***

### shutdown()

> **shutdown**(): `Promise`\<`void`\>

Defined in: [src/parsers/filters/BaseFilter.js:306](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/filters/BaseFilter.js#L306)

Clean up filter resources (optional override)

#### Returns

`Promise`\<`void`\>

***

### toString()

> **toString**(): `string`

Defined in: [src/parsers/filters/BaseFilter.js:323](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/filters/BaseFilter.js#L323)

String representation of filter

#### Returns

`string`

- String representation
