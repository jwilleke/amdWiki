[**amdWiki API v1.5.0**](../../../../../README.md)

***

[amdWiki API](../../../../../README.md) / [src/parsers/filters/SpamFilter](../README.md) / default

# Class: default

Defined in: [src/parsers/filters/SpamFilter.ts:99](https://github.com/jwilleke/amdWiki/blob/b6a859c7c9297966de89735ea5e8f953df289ac1/src/parsers/filters/SpamFilter.ts#L99)

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

- [`default`](../../BaseFilter/classes/default.md)

## Constructors

### Constructor

> **new default**(): `SpamFilter`

Defined in: [src/parsers/filters/SpamFilter.ts:106](https://github.com/jwilleke/amdWiki/blob/b6a859c7c9297966de89735ea5e8f953df289ac1/src/parsers/filters/SpamFilter.ts#L106)

#### Returns

`SpamFilter`

#### Overrides

[`default`](../../BaseFilter/classes/default.md).[`constructor`](../../BaseFilter/classes/default.md#constructor)

## Properties

### blacklistedWords

> **blacklistedWords**: `Set`\<`string`\>

Defined in: [src/parsers/filters/SpamFilter.ts:102](https://github.com/jwilleke/amdWiki/blob/b6a859c7c9297966de89735ea5e8f953df289ac1/src/parsers/filters/SpamFilter.ts#L102)

***

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

### filterId

> **filterId**: `string`

Defined in: [src/parsers/filters/SpamFilter.ts:100](https://github.com/jwilleke/amdWiki/blob/b6a859c7c9297966de89735ea5e8f953df289ac1/src/parsers/filters/SpamFilter.ts#L100)

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

### spamConfig

> **spamConfig**: `SpamConfig` \| `null`

Defined in: [src/parsers/filters/SpamFilter.ts:101](https://github.com/jwilleke/amdWiki/blob/b6a859c7c9297966de89735ea5e8f953df289ac1/src/parsers/filters/SpamFilter.ts#L101)

***

### spamPatterns

> **spamPatterns**: `RegExp`[]

Defined in: [src/parsers/filters/SpamFilter.ts:104](https://github.com/jwilleke/amdWiki/blob/b6a859c7c9297966de89735ea5e8f953df289ac1/src/parsers/filters/SpamFilter.ts#L104)

***

### stats

> `protected` **stats**: [`FilterStats`](../../BaseFilter/interfaces/FilterStats.md)

Defined in: [src/parsers/filters/BaseFilter.ts:143](https://github.com/jwilleke/amdWiki/blob/b6a859c7c9297966de89735ea5e8f953df289ac1/src/parsers/filters/BaseFilter.ts#L143)

#### Inherited from

[`default`](../../BaseFilter/classes/default.md).[`stats`](../../BaseFilter/classes/default.md#stats)

***

### version

> `readonly` **version**: `string`

Defined in: [src/parsers/filters/BaseFilter.ts:138](https://github.com/jwilleke/amdWiki/blob/b6a859c7c9297966de89735ea5e8f953df289ac1/src/parsers/filters/BaseFilter.ts#L138)

#### Inherited from

[`default`](../../BaseFilter/classes/default.md).[`version`](../../BaseFilter/classes/default.md#version)

***

### whitelistedDomains

> **whitelistedDomains**: `Set`\<`string`\>

Defined in: [src/parsers/filters/SpamFilter.ts:103](https://github.com/jwilleke/amdWiki/blob/b6a859c7c9297966de89735ea5e8f953df289ac1/src/parsers/filters/SpamFilter.ts#L103)

## Methods

### addBlacklistedWord()

> **addBlacklistedWord**(`word`): `boolean`

Defined in: [src/parsers/filters/SpamFilter.ts:428](https://github.com/jwilleke/amdWiki/blob/b6a859c7c9297966de89735ea5e8f953df289ac1/src/parsers/filters/SpamFilter.ts#L428)

Add word to blacklist (modular blacklist management)

#### Parameters

##### word

`string`

Word to blacklist

#### Returns

`boolean`

True if added

***

### addWhitelistedDomain()

> **addWhitelistedDomain**(`domain`): `boolean`

Defined in: [src/parsers/filters/SpamFilter.ts:458](https://github.com/jwilleke/amdWiki/blob/b6a859c7c9297966de89735ea5e8f953df289ac1/src/parsers/filters/SpamFilter.ts#L458)

Add domain to whitelist (modular whitelist management)

#### Parameters

##### domain

`string`

Domain to whitelist

#### Returns

`boolean`

True if added

***

### analyzeSpam()

> **analyzeSpam**(`content`, `_context`): `Promise`\<`SpamAnalysis`\>

Defined in: [src/parsers/filters/SpamFilter.ts:253](https://github.com/jwilleke/amdWiki/blob/b6a859c7c9297966de89735ea5e8f953df289ac1/src/parsers/filters/SpamFilter.ts#L253)

Analyze content for spam characteristics (modular spam analysis)

#### Parameters

##### content

`string`

Content to analyze

##### \_context

`ParseContext`

Parse context

#### Returns

`Promise`\<`SpamAnalysis`\>

Spam analysis result

***

### countImages()

> **countImages**(`content`): `number`

Defined in: [src/parsers/filters/SpamFilter.ts:337](https://github.com/jwilleke/amdWiki/blob/b6a859c7c9297966de89735ea5e8f953df289ac1/src/parsers/filters/SpamFilter.ts#L337)

Count images in content (modular image detection)

#### Parameters

##### content

`string`

Content to analyze

#### Returns

`number`

Number of images found

***

### countLinks()

> **countLinks**(`content`): `number`

Defined in: [src/parsers/filters/SpamFilter.ts:315](https://github.com/jwilleke/amdWiki/blob/b6a859c7c9297966de89735ea5e8f953df289ac1/src/parsers/filters/SpamFilter.ts#L315)

Count links in content (modular link detection)

#### Parameters

##### content

`string`

Content to analyze

#### Returns

`number`

Number of links found

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

### findBlacklistedWords()

> **findBlacklistedWords**(`content`): `string`[]

Defined in: [src/parsers/filters/SpamFilter.ts:358](https://github.com/jwilleke/amdWiki/blob/b6a859c7c9297966de89735ea5e8f953df289ac1/src/parsers/filters/SpamFilter.ts#L358)

Find blacklisted words in content (modular blacklist checking)

#### Parameters

##### content

`string`

Content to check

#### Returns

`string`[]

Found blacklisted words

***

### findSuspiciousDomains()

> **findSuspiciousDomains**(`content`): `Promise`\<`string`[]\>

Defined in: [src/parsers/filters/SpamFilter.ts:377](https://github.com/jwilleke/amdWiki/blob/b6a859c7c9297966de89735ea5e8f953df289ac1/src/parsers/filters/SpamFilter.ts#L377)

Find suspicious domains not in whitelist (modular domain checking)

#### Parameters

##### content

`string`

Content to analyze

#### Returns

`Promise`\<`string`[]\>

Suspicious domains found

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

Defined in: [src/parsers/filters/SpamFilter.ts:509](https://github.com/jwilleke/amdWiki/blob/b6a859c7c9297966de89735ea5e8f953df289ac1/src/parsers/filters/SpamFilter.ts#L509)

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

### getSpamConfiguration()

> **getSpamConfiguration**(): `Record`\<`string`, `unknown`\>

Defined in: [src/parsers/filters/SpamFilter.ts:487](https://github.com/jwilleke/amdWiki/blob/b6a859c7c9297966de89735ea5e8f953df289ac1/src/parsers/filters/SpamFilter.ts#L487)

Get spam configuration summary (modular introspection)

#### Returns

`Record`\<`string`, `unknown`\>

Spam configuration summary

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

### loadDefaultSpamConfiguration()

> **loadDefaultSpamConfiguration**(): `void`

Defined in: [src/parsers/filters/SpamFilter.ts:204](https://github.com/jwilleke/amdWiki/blob/b6a859c7c9297966de89735ea5e8f953df289ac1/src/parsers/filters/SpamFilter.ts#L204)

Load default spam configuration when configuration unavailable

#### Returns

`void`

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

### loadModularSpamConfiguration()

> **loadModularSpamConfiguration**(`context`): `void`

Defined in: [src/parsers/filters/SpamFilter.ts:145](https://github.com/jwilleke/amdWiki/blob/b6a859c7c9297966de89735ea5e8f953df289ac1/src/parsers/filters/SpamFilter.ts#L145)

Load modular spam configuration from app-default/custom-config.json

#### Parameters

##### context

`InitContext`

Initialization context

#### Returns

`void`

***

### logSpamAttempt()

> **logSpamAttempt**(`_content`, `analysis`, `context`): `void`

Defined in: [src/parsers/filters/SpamFilter.ts:402](https://github.com/jwilleke/amdWiki/blob/b6a859c7c9297966de89735ea5e8f953df289ac1/src/parsers/filters/SpamFilter.ts#L402)

Log spam attempt for monitoring (modular logging)

#### Parameters

##### \_content

`string`

Original content

##### analysis

`SpamAnalysis`

Spam analysis result

##### context

`ParseContext`

Parse context

#### Returns

`void`

***

### onInitialize()

> **onInitialize**(`context`): `Promise`\<`void`\>

Defined in: [src/parsers/filters/SpamFilter.ts:129](https://github.com/jwilleke/amdWiki/blob/b6a859c7c9297966de89735ea5e8f953df289ac1/src/parsers/filters/SpamFilter.ts#L129)

Initialize filter with modular spam detection configuration

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

Defined in: [src/parsers/filters/SpamFilter.ts:220](https://github.com/jwilleke/amdWiki/blob/b6a859c7c9297966de89735ea5e8f953df289ac1/src/parsers/filters/SpamFilter.ts#L220)

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

Content (unchanged if not spam, or flagged if spam)

#### Overrides

[`default`](../../BaseFilter/classes/default.md).[`process`](../../BaseFilter/classes/default.md#process)

***

### removeBlacklistedWord()

> **removeBlacklistedWord**(`word`): `boolean`

Defined in: [src/parsers/filters/SpamFilter.ts:443](https://github.com/jwilleke/amdWiki/blob/b6a859c7c9297966de89735ea5e8f953df289ac1/src/parsers/filters/SpamFilter.ts#L443)

Remove word from blacklist (modular blacklist management)

#### Parameters

##### word

`string`

Word to remove

#### Returns

`boolean`

True if removed

***

### removeWhitelistedDomain()

> **removeWhitelistedDomain**(`domain`): `boolean`

Defined in: [src/parsers/filters/SpamFilter.ts:473](https://github.com/jwilleke/amdWiki/blob/b6a859c7c9297966de89735ea5e8f953df289ac1/src/parsers/filters/SpamFilter.ts#L473)

Remove domain from whitelist (modular whitelist management)

#### Parameters

##### domain

`string`

Domain to remove

#### Returns

`boolean`

True if removed

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
