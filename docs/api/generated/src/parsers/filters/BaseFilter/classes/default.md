[**amdWiki API v1.5.0**](../../../../../README.md)

***

[amdWiki API](../../../../../README.md) / [src/parsers/filters/BaseFilter](../README.md) / default

# Abstract Class: default

Defined in: [src/parsers/filters/BaseFilter.ts:133](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/parsers/filters/BaseFilter.ts#L133)

BaseFilter - Abstract base class for all content filters

## Extended by

- [`default`](../../SecurityFilter/classes/default.md)
- [`default`](../../SpamFilter/classes/default.md)
- [`default`](../../ValidationFilter/classes/default.md)

## Constructors

### Constructor

> **new default**(`priority`, `options`): `BaseFilter`

Defined in: [src/parsers/filters/BaseFilter.ts:151](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/parsers/filters/BaseFilter.ts#L151)

Create a content filter

#### Parameters

##### priority

`number` = `100`

Filter priority (0-1000, higher = executed first)

##### options

[`FilterOptions`](../interfaces/FilterOptions.md) = `{}`

Filter configuration options

#### Returns

`BaseFilter`

## Properties

### category

> `readonly` **category**: `string`

Defined in: [src/parsers/filters/BaseFilter.ts:138](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/parsers/filters/BaseFilter.ts#L138)

***

### config

> `protected` **config**: [`FilterConfig`](../interfaces/FilterConfig.md)

Defined in: [src/parsers/filters/BaseFilter.ts:144](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/parsers/filters/BaseFilter.ts#L144)

***

### description

> `readonly` **description**: `string`

Defined in: [src/parsers/filters/BaseFilter.ts:137](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/parsers/filters/BaseFilter.ts#L137)

***

### enabled

> `protected` **enabled**: `boolean`

Defined in: [src/parsers/filters/BaseFilter.ts:142](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/parsers/filters/BaseFilter.ts#L142)

***

### filterId

> `readonly` **filterId**: `string`

Defined in: [src/parsers/filters/BaseFilter.ts:135](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/parsers/filters/BaseFilter.ts#L135)

***

### initialized

> `protected` **initialized**: `boolean`

Defined in: [src/parsers/filters/BaseFilter.ts:143](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/parsers/filters/BaseFilter.ts#L143)

***

### options

> `protected` **options**: `Required`\<[`FilterOptions`](../interfaces/FilterOptions.md)\>

Defined in: [src/parsers/filters/BaseFilter.ts:140](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/parsers/filters/BaseFilter.ts#L140)

***

### priority

> **priority**: `number`

Defined in: [src/parsers/filters/BaseFilter.ts:134](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/parsers/filters/BaseFilter.ts#L134)

***

### stats

> `protected` **stats**: [`FilterStats`](../interfaces/FilterStats.md)

Defined in: [src/parsers/filters/BaseFilter.ts:141](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/parsers/filters/BaseFilter.ts#L141)

***

### version

> `readonly` **version**: `string`

Defined in: [src/parsers/filters/BaseFilter.ts:136](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/parsers/filters/BaseFilter.ts#L136)

## Methods

### createErrorContext()

> `protected` **createErrorContext**(`error`, `content`, `context`): [`FilterErrorContext`](../interfaces/FilterErrorContext.md)

Defined in: [src/parsers/filters/BaseFilter.ts:341](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/parsers/filters/BaseFilter.ts#L341)

Create error context for debugging (modular error handling)

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

[`FilterErrorContext`](../interfaces/FilterErrorContext.md)

Error context

***

### disable()

> **disable**(): `void`

Defined in: [src/parsers/filters/BaseFilter.ts:367](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/parsers/filters/BaseFilter.ts#L367)

Disable the filter

#### Returns

`void`

***

### enable()

> **enable**(): `void`

Defined in: [src/parsers/filters/BaseFilter.ts:360](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/parsers/filters/BaseFilter.ts#L360)

Enable the filter

#### Returns

`void`

***

### execute()

> **execute**(`content`, `context`): `Promise`\<`string`\>

Defined in: [src/parsers/filters/BaseFilter.ts:300](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/parsers/filters/BaseFilter.ts#L300)

Execute filter with performance tracking and error handling

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

### getConfigurationSummary()

> **getConfigurationSummary**(): [`ConfigurationSummary`](../interfaces/ConfigurationSummary.md)

Defined in: [src/parsers/filters/BaseFilter.ts:435](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/parsers/filters/BaseFilter.ts#L435)

Get configuration summary for debugging (modular introspection)

#### Returns

[`ConfigurationSummary`](../interfaces/ConfigurationSummary.md)

Configuration summary

***

### getFilterType()

> `protected` **getFilterType**(): `string`

Defined in: [src/parsers/filters/BaseFilter.ts:265](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/parsers/filters/BaseFilter.ts#L265)

Get filter type for configuration lookup (override in subclasses)

#### Returns

`string`

Filter type for configuration

***

### getMetadata()

> **getMetadata**(): [`FilterMetadata`](../interfaces/FilterMetadata.md)

Defined in: [src/parsers/filters/BaseFilter.ts:417](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/parsers/filters/BaseFilter.ts#L417)

Get filter metadata

#### Returns

[`FilterMetadata`](../interfaces/FilterMetadata.md)

Filter metadata

***

### getStats()

> **getStats**(): [`FilterStats`](../interfaces/FilterStats.md) & `object`

Defined in: [src/parsers/filters/BaseFilter.ts:383](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/parsers/filters/BaseFilter.ts#L383)

Get filter statistics

#### Returns

[`FilterStats`](../interfaces/FilterStats.md) & `object`

Filter statistics

***

### initialize()

> **initialize**(`context`): `Promise`\<`void`\>

Defined in: [src/parsers/filters/BaseFilter.ts:199](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/parsers/filters/BaseFilter.ts#L199)

Initialize filter with modular configuration

#### Parameters

##### context

[`FilterInitializationContext`](../interfaces/FilterInitializationContext.md) = `{}`

Initialization context

#### Returns

`Promise`\<`void`\>

***

### isEnabled()

> **isEnabled**(): `boolean`

Defined in: [src/parsers/filters/BaseFilter.ts:375](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/parsers/filters/BaseFilter.ts#L375)

Check if filter is enabled

#### Returns

`boolean`

True if enabled

***

### loadModularConfiguration()

> `protected` **loadModularConfiguration**(`context`): `void`

Defined in: [src/parsers/filters/BaseFilter.ts:217](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/parsers/filters/BaseFilter.ts#L217)

Load configuration from app-default-config.json and app-custom-config.json

#### Parameters

##### context

[`FilterInitializationContext`](../interfaces/FilterInitializationContext.md)

Initialization context

#### Returns

`void`

***

### onInitialize()

> `protected` **onInitialize**(`_context`): `Promise`\<`void`\>

Defined in: [src/parsers/filters/BaseFilter.ts:282](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/parsers/filters/BaseFilter.ts#L282)

Custom initialization logic (override in subclasses)

#### Parameters

##### \_context

[`FilterInitializationContext`](../interfaces/FilterInitializationContext.md)

Initialization context

#### Returns

`Promise`\<`void`\>

***

### onShutdown()

> `protected` **onShutdown**(): `Promise`\<`void`\>

Defined in: [src/parsers/filters/BaseFilter.ts:457](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/parsers/filters/BaseFilter.ts#L457)

Custom shutdown logic (override in subclasses)

#### Returns

`Promise`\<`void`\>

***

### process()

> `abstract` **process**(`content`, `context`): `Promise`\<`string`\>

Defined in: [src/parsers/filters/BaseFilter.ts:292](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/parsers/filters/BaseFilter.ts#L292)

Main filter processing method - MUST be implemented by subclasses

#### Parameters

##### content

`string`

Content to filter

##### context

[`ParseContext`](../interfaces/ParseContext.md)

Parse context

#### Returns

`Promise`\<`string`\>

Filtered content

***

### resetStats()

> **resetStats**(): `void`

Defined in: [src/parsers/filters/BaseFilter.ts:403](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/parsers/filters/BaseFilter.ts#L403)

Reset filter statistics

#### Returns

`void`

***

### shutdown()

> **shutdown**(): `Promise`\<`void`\>

Defined in: [src/parsers/filters/BaseFilter.ts:449](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/parsers/filters/BaseFilter.ts#L449)

Clean up filter resources (optional override)

#### Returns

`Promise`\<`void`\>

***

### toString()

> **toString**(): `string`

Defined in: [src/parsers/filters/BaseFilter.ts:465](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/parsers/filters/BaseFilter.ts#L465)

String representation of filter

#### Returns

`string`

String representation
