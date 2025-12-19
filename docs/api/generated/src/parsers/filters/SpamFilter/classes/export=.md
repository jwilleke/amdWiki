[**amdWiki API v1.5.0**](../../../../../README.md)

***

[amdWiki API](../../../../../README.md) / [src/parsers/filters/SpamFilter](../README.md) / export=

# Class: export=

Defined in: [src/parsers/filters/SpamFilter.js:19](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/filters/SpamFilter.js#L19)

SpamFilter - Intelligent spam detection with modular configuration

Provides configurable spam detection based on link count, blacklisted words,
domain whitelisting, and content quality analysis through complete modularity
via app-default-config.json and app-custom-config.json.

Design Principles:
- Configurable spam detection rules
- Whitelist/blacklist modularity
- Zero hardcoded detection rules
- Deployment-specific spam policies

Related Issue: Phase 4 - Security Filter Suite (Spam Detection)
Epic: #41 - Implement JSPWikiMarkupParser for Complete Enhancement Support

## Extends

- [`export=`](../../BaseFilter/classes/export=.md)

## Constructors

### Constructor

> **new export=**(): `SpamFilter`

Defined in: [src/parsers/filters/SpamFilter.js:20](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/filters/SpamFilter.js#L20)

#### Returns

`SpamFilter`

#### Overrides

[`export=`](../../BaseFilter/classes/export=.md).[`constructor`](../../BaseFilter/classes/export=.md#constructor)

## Properties

### blacklistedWords

> **blacklistedWords**: `Set`\<`any`\>

Defined in: [src/parsers/filters/SpamFilter.js:33](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/filters/SpamFilter.js#L33)

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

Defined in: [src/parsers/filters/SpamFilter.js:31](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/filters/SpamFilter.js#L31)

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

### spamConfig

> **spamConfig**: `object`

Defined in: [src/parsers/filters/SpamFilter.js:32](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/filters/SpamFilter.js#L32)

#### autoBlock

> **autoBlock**: `boolean` = `false`

#### cacheBlacklist

> **cacheBlacklist**: `boolean` = `true`

#### logSpamAttempts

> **logSpamAttempts**: `boolean` = `true`

#### maxDuplicateContent

> **maxDuplicateContent**: `number` = `0.8`

#### maxImages

> **maxImages**: `number` = `5`

#### maxLinks

> **maxLinks**: `number` = `10`

#### minContentLength

> **minContentLength**: `number` = `10`

#### whitelistMode

> **whitelistMode**: `boolean` = `false`

***

### spamPatterns

> **spamPatterns**: `any`[]

Defined in: [src/parsers/filters/SpamFilter.js:35](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/filters/SpamFilter.js#L35)

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

***

### whitelistedDomains

> **whitelistedDomains**: `Set`\<`any`\>

Defined in: [src/parsers/filters/SpamFilter.js:34](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/filters/SpamFilter.js#L34)

## Methods

### addBlacklistedWord()

> **addBlacklistedWord**(`word`): `boolean`

Defined in: [src/parsers/filters/SpamFilter.js:339](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/filters/SpamFilter.js#L339)

Add word to blacklist (modular blacklist management)

#### Parameters

##### word

`string`

Word to blacklist

#### Returns

`boolean`

- True if added

***

### addWhitelistedDomain()

> **addWhitelistedDomain**(`domain`): `boolean`

Defined in: [src/parsers/filters/SpamFilter.js:369](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/filters/SpamFilter.js#L369)

Add domain to whitelist (modular whitelist management)

#### Parameters

##### domain

`string`

Domain to whitelist

#### Returns

`boolean`

- True if added

***

### analyzeSpam()

> **analyzeSpam**(`content`, `context`): `Promise`\<`any`\>

Defined in: [src/parsers/filters/SpamFilter.js:165](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/filters/SpamFilter.js#L165)

Analyze content for spam characteristics (modular spam analysis)

#### Parameters

##### content

`string`

Content to analyze

##### context

`ParseContext`

Parse context

#### Returns

`Promise`\<`any`\>

- Spam analysis result

***

### countImages()

> **countImages**(`content`): `number`

Defined in: [src/parsers/filters/SpamFilter.js:249](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/filters/SpamFilter.js#L249)

Count images in content (modular image detection)

#### Parameters

##### content

`string`

Content to analyze

#### Returns

`number`

- Number of images found

***

### countLinks()

> **countLinks**(`content`): `number`

Defined in: [src/parsers/filters/SpamFilter.js:227](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/filters/SpamFilter.js#L227)

Count links in content (modular link detection)

#### Parameters

##### content

`string`

Content to analyze

#### Returns

`number`

- Number of links found

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

### findBlacklistedWords()

> **findBlacklistedWords**(`content`): `string`[]

Defined in: [src/parsers/filters/SpamFilter.js:270](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/filters/SpamFilter.js#L270)

Find blacklisted words in content (modular blacklist checking)

#### Parameters

##### content

`string`

Content to check

#### Returns

`string`[]

- Found blacklisted words

***

### findSuspiciousDomains()

> **findSuspiciousDomains**(`content`): `Promise`\<`string`[]\>

Defined in: [src/parsers/filters/SpamFilter.js:288](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/filters/SpamFilter.js#L288)

Find suspicious domains not in whitelist (modular domain checking)

#### Parameters

##### content

`string`

Content to analyze

#### Returns

`Promise`\<`string`[]\>

- Suspicious domains found

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

Defined in: [src/parsers/filters/SpamFilter.js:420](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/filters/SpamFilter.js#L420)

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

### getSpamConfiguration()

> **getSpamConfiguration**(): `any`

Defined in: [src/parsers/filters/SpamFilter.js:398](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/filters/SpamFilter.js#L398)

Get spam configuration summary (modular introspection)

#### Returns

`any`

- Spam configuration summary

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

### loadDefaultSpamConfiguration()

> **loadDefaultSpamConfiguration**(): `void`

Defined in: [src/parsers/filters/SpamFilter.js:116](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/filters/SpamFilter.js#L116)

Load default spam configuration when configuration unavailable

#### Returns

`void`

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

### loadModularSpamConfiguration()

> **loadModularSpamConfiguration**(`context`): `Promise`\<`void`\>

Defined in: [src/parsers/filters/SpamFilter.js:58](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/filters/SpamFilter.js#L58)

Load modular spam configuration from app-default/custom-config.json

#### Parameters

##### context

`any`

Initialization context

#### Returns

`Promise`\<`void`\>

***

### logSpamAttempt()

> **logSpamAttempt**(`content`, `analysis`, `context`): `void`

Defined in: [src/parsers/filters/SpamFilter.js:313](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/filters/SpamFilter.js#L313)

Log spam attempt for monitoring (modular logging)

#### Parameters

##### content

`string`

Original content

##### analysis

`any`

Spam analysis result

##### context

`ParseContext`

Parse context

#### Returns

`void`

***

### onInitialize()

> **onInitialize**(`context`): `Promise`\<`void`\>

Defined in: [src/parsers/filters/SpamFilter.js:42](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/filters/SpamFilter.js#L42)

Initialize filter with modular spam detection configuration

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

Defined in: [src/parsers/filters/SpamFilter.js:132](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/filters/SpamFilter.js#L132)

Process content through spam detection filters (modular spam detection)

#### Parameters

##### content

`string`

Content to analyze

##### context

`ParseContext`

Parse context

#### Returns

`Promise`\<`string`\>

- Content (unchanged if not spam, or flagged if spam)

#### Overrides

[`export=`](../../BaseFilter/classes/export=.md).[`process`](../../BaseFilter/classes/export=.md#process)

***

### removeBlacklistedWord()

> **removeBlacklistedWord**(`word`): `boolean`

Defined in: [src/parsers/filters/SpamFilter.js:354](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/filters/SpamFilter.js#L354)

Remove word from blacklist (modular blacklist management)

#### Parameters

##### word

`string`

Word to remove

#### Returns

`boolean`

- True if removed

***

### removeWhitelistedDomain()

> **removeWhitelistedDomain**(`domain`): `boolean`

Defined in: [src/parsers/filters/SpamFilter.js:384](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/filters/SpamFilter.js#L384)

Remove domain from whitelist (modular whitelist management)

#### Parameters

##### domain

`string`

Domain to remove

#### Returns

`boolean`

- True if removed

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
