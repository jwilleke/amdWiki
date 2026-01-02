[**amdWiki API v1.5.0**](../../../../../README.md)

***

[amdWiki API](../../../../../README.md) / [src/parsers/filters/SecurityFilter](../README.md) / default

# Class: default

Defined in: [src/parsers/filters/SecurityFilter.ts:82](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/parsers/filters/SecurityFilter.ts#L82)

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

- [`default`](../../BaseFilter/classes/default.md)

## Constructors

### Constructor

> **new default**(): `SecurityFilter`

Defined in: [src/parsers/filters/SecurityFilter.ts:89](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/parsers/filters/SecurityFilter.ts#L89)

#### Returns

`SecurityFilter`

#### Overrides

[`default`](../../BaseFilter/classes/default.md).[`constructor`](../../BaseFilter/classes/default.md#constructor)

## Properties

### allowedAttributes

> **allowedAttributes**: `Set`\<`string`\>

Defined in: [src/parsers/filters/SecurityFilter.ts:86](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/parsers/filters/SecurityFilter.ts#L86)

***

### allowedTags

> **allowedTags**: `Set`\<`string`\>

Defined in: [src/parsers/filters/SecurityFilter.ts:85](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/parsers/filters/SecurityFilter.ts#L85)

***

### category

> `readonly` **category**: `string`

Defined in: [src/parsers/filters/BaseFilter.ts:138](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/parsers/filters/BaseFilter.ts#L138)

#### Inherited from

[`default`](../../BaseFilter/classes/default.md).[`category`](../../BaseFilter/classes/default.md#category)

***

### config

> `protected` **config**: [`FilterConfig`](../../BaseFilter/interfaces/FilterConfig.md)

Defined in: [src/parsers/filters/BaseFilter.ts:144](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/parsers/filters/BaseFilter.ts#L144)

#### Inherited from

[`default`](../../BaseFilter/classes/default.md).[`config`](../../BaseFilter/classes/default.md#config)

***

### dangerousPatterns

> **dangerousPatterns**: `RegExp`[]

Defined in: [src/parsers/filters/SecurityFilter.ts:87](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/parsers/filters/SecurityFilter.ts#L87)

***

### description

> `readonly` **description**: `string`

Defined in: [src/parsers/filters/BaseFilter.ts:137](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/parsers/filters/BaseFilter.ts#L137)

#### Inherited from

[`default`](../../BaseFilter/classes/default.md).[`description`](../../BaseFilter/classes/default.md#description)

***

### enabled

> `protected` **enabled**: `boolean`

Defined in: [src/parsers/filters/BaseFilter.ts:142](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/parsers/filters/BaseFilter.ts#L142)

#### Inherited from

[`default`](../../BaseFilter/classes/default.md).[`enabled`](../../BaseFilter/classes/default.md#enabled)

***

### filterId

> **filterId**: `string`

Defined in: [src/parsers/filters/SecurityFilter.ts:83](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/parsers/filters/SecurityFilter.ts#L83)

#### Overrides

[`default`](../../BaseFilter/classes/default.md).[`filterId`](../../BaseFilter/classes/default.md#filterid)

***

### initialized

> `protected` **initialized**: `boolean`

Defined in: [src/parsers/filters/BaseFilter.ts:143](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/parsers/filters/BaseFilter.ts#L143)

#### Inherited from

[`default`](../../BaseFilter/classes/default.md).[`initialized`](../../BaseFilter/classes/default.md#initialized)

***

### options

> `protected` **options**: `Required`\<[`FilterOptions`](../../BaseFilter/interfaces/FilterOptions.md)\>

Defined in: [src/parsers/filters/BaseFilter.ts:140](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/parsers/filters/BaseFilter.ts#L140)

#### Inherited from

[`default`](../../BaseFilter/classes/default.md).[`options`](../../BaseFilter/classes/default.md#options)

***

### priority

> **priority**: `number`

Defined in: [src/parsers/filters/BaseFilter.ts:134](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/parsers/filters/BaseFilter.ts#L134)

#### Inherited from

[`default`](../../BaseFilter/classes/default.md).[`priority`](../../BaseFilter/classes/default.md#priority)

***

### securityConfig

> **securityConfig**: `SecurityConfig`

Defined in: [src/parsers/filters/SecurityFilter.ts:84](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/parsers/filters/SecurityFilter.ts#L84)

***

### stats

> `protected` **stats**: [`FilterStats`](../../BaseFilter/interfaces/FilterStats.md)

Defined in: [src/parsers/filters/BaseFilter.ts:141](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/parsers/filters/BaseFilter.ts#L141)

#### Inherited from

[`default`](../../BaseFilter/classes/default.md).[`stats`](../../BaseFilter/classes/default.md#stats)

***

### version

> `readonly` **version**: `string`

Defined in: [src/parsers/filters/BaseFilter.ts:136](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/parsers/filters/BaseFilter.ts#L136)

#### Inherited from

[`default`](../../BaseFilter/classes/default.md).[`version`](../../BaseFilter/classes/default.md#version)

## Methods

### createErrorContext()

> `protected` **createErrorContext**(`error`, `content`, `context`): [`FilterErrorContext`](../../BaseFilter/interfaces/FilterErrorContext.md)

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

Defined in: [src/parsers/filters/BaseFilter.ts:367](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/parsers/filters/BaseFilter.ts#L367)

Disable the filter

#### Returns

`void`

#### Inherited from

[`default`](../../BaseFilter/classes/default.md).[`disable`](../../BaseFilter/classes/default.md#disable)

***

### enable()

> **enable**(): `void`

Defined in: [src/parsers/filters/BaseFilter.ts:360](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/parsers/filters/BaseFilter.ts#L360)

Enable the filter

#### Returns

`void`

#### Inherited from

[`default`](../../BaseFilter/classes/default.md).[`enable`](../../BaseFilter/classes/default.md#enable)

***

### escapeAttributeValue()

> **escapeAttributeValue**(`value`): `string`

Defined in: [src/parsers/filters/SecurityFilter.ts:430](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/parsers/filters/SecurityFilter.ts#L430)

Escape attribute values to prevent injection (modular escaping)

#### Parameters

##### value

`string`

Attribute value to escape

#### Returns

`string`

Escaped value

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

Defined in: [src/parsers/filters/BaseFilter.ts:435](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/parsers/filters/BaseFilter.ts#L435)

Get configuration summary for debugging (modular introspection)

#### Returns

[`ConfigurationSummary`](../../BaseFilter/interfaces/ConfigurationSummary.md)

Configuration summary

#### Inherited from

[`default`](../../BaseFilter/classes/default.md).[`getConfigurationSummary`](../../BaseFilter/classes/default.md#getconfigurationsummary)

***

### getFilterType()

> `protected` **getFilterType**(): `string`

Defined in: [src/parsers/filters/BaseFilter.ts:265](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/parsers/filters/BaseFilter.ts#L265)

Get filter type for configuration lookup (override in subclasses)

#### Returns

`string`

Filter type for configuration

#### Inherited from

[`default`](../../BaseFilter/classes/default.md).[`getFilterType`](../../BaseFilter/classes/default.md#getfiltertype)

***

### getInfo()

> **getInfo**(): `Record`\<`string`, `unknown`\>

Defined in: [src/parsers/filters/SecurityFilter.ts:499](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/parsers/filters/SecurityFilter.ts#L499)

Get filter information for debugging and documentation

#### Returns

`Record`\<`string`, `unknown`\>

Filter information

***

### getMetadata()

> **getMetadata**(): [`FilterMetadata`](../../BaseFilter/interfaces/FilterMetadata.md)

Defined in: [src/parsers/filters/BaseFilter.ts:417](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/parsers/filters/BaseFilter.ts#L417)

Get filter metadata

#### Returns

[`FilterMetadata`](../../BaseFilter/interfaces/FilterMetadata.md)

Filter metadata

#### Inherited from

[`default`](../../BaseFilter/classes/default.md).[`getMetadata`](../../BaseFilter/classes/default.md#getmetadata)

***

### getSecurityConfiguration()

> **getSecurityConfiguration**(): `Record`\<`string`, `unknown`\>

Defined in: [src/parsers/filters/SecurityFilter.ts:470](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/parsers/filters/SecurityFilter.ts#L470)

Get security configuration summary (modular introspection)

#### Returns

`Record`\<`string`, `unknown`\>

Security configuration summary

***

### getStats()

> **getStats**(): [`FilterStats`](../../BaseFilter/interfaces/FilterStats.md) & `object`

Defined in: [src/parsers/filters/BaseFilter.ts:383](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/parsers/filters/BaseFilter.ts#L383)

Get filter statistics

#### Returns

[`FilterStats`](../../BaseFilter/interfaces/FilterStats.md) & `object`

Filter statistics

#### Inherited from

[`default`](../../BaseFilter/classes/default.md).[`getStats`](../../BaseFilter/classes/default.md#getstats)

***

### initialize()

> **initialize**(`context`): `Promise`\<`void`\>

Defined in: [src/parsers/filters/BaseFilter.ts:199](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/parsers/filters/BaseFilter.ts#L199)

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

### initializeDangerousPatterns()

> **initializeDangerousPatterns**(): `void`

Defined in: [src/parsers/filters/SecurityFilter.ts:213](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/parsers/filters/SecurityFilter.ts#L213)

Initialize dangerous patterns based on configuration (modular security patterns)

#### Returns

`void`

***

### isEnabled()

> **isEnabled**(): `boolean`

Defined in: [src/parsers/filters/BaseFilter.ts:375](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/parsers/filters/BaseFilter.ts#L375)

Check if filter is enabled

#### Returns

`boolean`

True if enabled

#### Inherited from

[`default`](../../BaseFilter/classes/default.md).[`isEnabled`](../../BaseFilter/classes/default.md#isenabled)

***

### isValidURL()

> **isValidURL**(`url`): `boolean`

Defined in: [src/parsers/filters/SecurityFilter.ts:397](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/parsers/filters/SecurityFilter.ts#L397)

Validate URL for href and src attributes (modular URL validation)

#### Parameters

##### url

`string`

URL to validate

#### Returns

`boolean`

True if valid and safe

***

### loadModularConfiguration()

> `protected` **loadModularConfiguration**(`context`): `void`

Defined in: [src/parsers/filters/BaseFilter.ts:217](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/parsers/filters/BaseFilter.ts#L217)

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

### loadModularSecurityConfiguration()

> **loadModularSecurityConfiguration**(`context`): `void`

Defined in: [src/parsers/filters/SecurityFilter.ts:134](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/parsers/filters/SecurityFilter.ts#L134)

Load modular security configuration from configuration hierarchy

#### Parameters

##### context

`InitContext`

Initialization context

#### Returns

`void`

***

### loadSecureDefaults()

> **loadSecureDefaults**(): `void`

Defined in: [src/parsers/filters/SecurityFilter.ts:200](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/parsers/filters/SecurityFilter.ts#L200)

Load secure default configuration when configuration files unavailable

#### Returns

`void`

***

### logSecurityViolation()

> **logSecurityViolation**(`originalContent`, `filteredContent`, `context`): `void`

Defined in: [src/parsers/filters/SecurityFilter.ts:445](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/parsers/filters/SecurityFilter.ts#L445)

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

Defined in: [src/parsers/filters/SecurityFilter.ts:112](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/parsers/filters/SecurityFilter.ts#L112)

Initialize filter with modular security configuration

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

Defined in: [src/parsers/filters/BaseFilter.ts:457](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/parsers/filters/BaseFilter.ts#L457)

Custom shutdown logic (override in subclasses)

#### Returns

`Promise`\<`void`\>

#### Inherited from

[`default`](../../BaseFilter/classes/default.md).[`onShutdown`](../../BaseFilter/classes/default.md#onshutdown)

***

### preventXSS()

> **preventXSS**(`content`): `string`

Defined in: [src/parsers/filters/SecurityFilter.ts:313](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/parsers/filters/SecurityFilter.ts#L313)

Prevent XSS attacks (modular XSS prevention)

#### Parameters

##### content

`string`

Content to protect

#### Returns

`string`

XSS-safe content

***

### process()

> **process**(`content`, `context`): `Promise`\<`string`\>

Defined in: [src/parsers/filters/SecurityFilter.ts:249](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/parsers/filters/SecurityFilter.ts#L249)

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

Securely filtered content

#### Overrides

[`default`](../../BaseFilter/classes/default.md).[`process`](../../BaseFilter/classes/default.md#process)

***

### resetStats()

> **resetStats**(): `void`

Defined in: [src/parsers/filters/BaseFilter.ts:403](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/parsers/filters/BaseFilter.ts#L403)

Reset filter statistics

#### Returns

`void`

#### Inherited from

[`default`](../../BaseFilter/classes/default.md).[`resetStats`](../../BaseFilter/classes/default.md#resetstats)

***

### sanitizeAttributes()

> **sanitizeAttributes**(`attributeString`): `string`

Defined in: [src/parsers/filters/SecurityFilter.ts:363](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/parsers/filters/SecurityFilter.ts#L363)

Sanitize HTML attributes based on allowed attributes (modular attribute sanitization)

#### Parameters

##### attributeString

`string`

Attributes to sanitize

#### Returns

`string`

Sanitized attributes

***

### sanitizeHTML()

> **sanitizeHTML**(`content`): `string`

Defined in: [src/parsers/filters/SecurityFilter.ts:328](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/parsers/filters/SecurityFilter.ts#L328)

Sanitize HTML based on allowed tags and attributes (modular HTML sanitization)

#### Parameters

##### content

`string`

Content to sanitize

#### Returns

`string`

Sanitized content

***

### shutdown()

> **shutdown**(): `Promise`\<`void`\>

Defined in: [src/parsers/filters/BaseFilter.ts:449](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/parsers/filters/BaseFilter.ts#L449)

Clean up filter resources (optional override)

#### Returns

`Promise`\<`void`\>

#### Inherited from

[`default`](../../BaseFilter/classes/default.md).[`shutdown`](../../BaseFilter/classes/default.md#shutdown)

***

### stripDangerousContent()

> **stripDangerousContent**(`content`): `string`

Defined in: [src/parsers/filters/SecurityFilter.ts:298](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/parsers/filters/SecurityFilter.ts#L298)

Strip dangerous content based on configured patterns (modular security)

#### Parameters

##### content

`string`

Content to clean

#### Returns

`string`

Cleaned content

***

### toString()

> **toString**(): `string`

Defined in: [src/parsers/filters/BaseFilter.ts:465](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/parsers/filters/BaseFilter.ts#L465)

String representation of filter

#### Returns

`string`

String representation

#### Inherited from

[`default`](../../BaseFilter/classes/default.md).[`toString`](../../BaseFilter/classes/default.md#tostring)
