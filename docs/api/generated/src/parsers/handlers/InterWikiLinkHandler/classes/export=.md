[**amdWiki API v1.5.0**](../../../../../README.md)

***

[amdWiki API](../../../../../README.md) / [src/parsers/handlers/InterWikiLinkHandler](../README.md) / export=

# Class: export=

Defined in: [src/parsers/handlers/InterWikiLinkHandler.js:16](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/handlers/InterWikiLinkHandler.js#L16)

InterWikiLinkHandler - External wiki linking support

Supports JSPWiki InterWiki syntax:
- [Wikipedia:Article] - Simple InterWiki link
- [Wikipedia:Article|Custom Display Text] - InterWiki with custom text
- [MeatBall:WikiWikiWeb] - Multiple InterWiki sites

Related Issue: #61 - InterWiki Link Handler
Epic: #41 - Implement JSPWikiMarkupParser for Complete Enhancement Support

## Extends

- [`BaseSyntaxHandler`](../../BaseSyntaxHandler/classes/BaseSyntaxHandler.md)

## Constructors

### Constructor

> **new export=**(`engine`): `InterWikiLinkHandler`

Defined in: [src/parsers/handlers/InterWikiLinkHandler.js:17](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/handlers/InterWikiLinkHandler.js#L17)

#### Parameters

##### engine

`any` = `null`

#### Returns

`InterWikiLinkHandler`

#### Overrides

[`BaseSyntaxHandler`](../../BaseSyntaxHandler/classes/BaseSyntaxHandler.md).[`constructor`](../../BaseSyntaxHandler/classes/BaseSyntaxHandler.md#constructor)

## Properties

### config

> **config**: `any`

Defined in: [src/parsers/handlers/InterWikiLinkHandler.js:31](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/handlers/InterWikiLinkHandler.js#L31)

***

### dependencies

> **dependencies**: `any`

Defined in: [src/parsers/handlers/BaseSyntaxHandler.js:47](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/handlers/BaseSyntaxHandler.js#L47)

#### Inherited from

[`BaseSyntaxHandler`](../../BaseSyntaxHandler/classes/BaseSyntaxHandler.md).[`dependencies`](../../BaseSyntaxHandler/classes/BaseSyntaxHandler.md#dependencies)

***

### dependencyErrors

> **dependencyErrors**: `any`[]

Defined in: [src/parsers/handlers/BaseSyntaxHandler.js:135](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/handlers/BaseSyntaxHandler.js#L135)

#### Inherited from

[`BaseSyntaxHandler`](../../BaseSyntaxHandler/classes/BaseSyntaxHandler.md).[`dependencyErrors`](../../BaseSyntaxHandler/classes/BaseSyntaxHandler.md#dependencyerrors)

***

### description

> **description**: `any`

Defined in: [src/parsers/handlers/BaseSyntaxHandler.js:46](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/handlers/BaseSyntaxHandler.js#L46)

#### Inherited from

[`BaseSyntaxHandler`](../../BaseSyntaxHandler/classes/BaseSyntaxHandler.md).[`description`](../../BaseSyntaxHandler/classes/BaseSyntaxHandler.md#description)

***

### enabled

> **enabled**: `any`

Defined in: [src/parsers/handlers/BaseSyntaxHandler.js:60](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/handlers/BaseSyntaxHandler.js#L60)

#### Inherited from

[`BaseSyntaxHandler`](../../BaseSyntaxHandler/classes/BaseSyntaxHandler.md).[`enabled`](../../BaseSyntaxHandler/classes/BaseSyntaxHandler.md#enabled)

***

### engine

> **engine**: `any`

Defined in: [src/parsers/handlers/InterWikiLinkHandler.js:30](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/handlers/InterWikiLinkHandler.js#L30)

***

### handlerId

> **handlerId**: `string`

Defined in: [src/parsers/handlers/InterWikiLinkHandler.js:29](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/handlers/InterWikiLinkHandler.js#L29)

#### Inherited from

[`BaseSyntaxHandler`](../../BaseSyntaxHandler/classes/BaseSyntaxHandler.md).[`handlerId`](../../BaseSyntaxHandler/classes/BaseSyntaxHandler.md#handlerid)

***

### initContext

> **initContext**: `any`

Defined in: [src/parsers/handlers/BaseSyntaxHandler.js:107](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/handlers/BaseSyntaxHandler.js#L107)

#### Inherited from

[`BaseSyntaxHandler`](../../BaseSyntaxHandler/classes/BaseSyntaxHandler.md).[`initContext`](../../BaseSyntaxHandler/classes/BaseSyntaxHandler.md#initcontext)

***

### initialized

> **initialized**: `boolean`

Defined in: [src/parsers/handlers/BaseSyntaxHandler.js:59](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/handlers/BaseSyntaxHandler.js#L59)

#### Inherited from

[`BaseSyntaxHandler`](../../BaseSyntaxHandler/classes/BaseSyntaxHandler.md).[`initialized`](../../BaseSyntaxHandler/classes/BaseSyntaxHandler.md#initialized)

***

### interWikiConfig

> **interWikiConfig**: `any`

Defined in: [src/parsers/handlers/InterWikiLinkHandler.js:33](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/handlers/InterWikiLinkHandler.js#L33)

***

### interWikiSites

> **interWikiSites**: `Map`\<`any`, `any`\>

Defined in: [src/parsers/handlers/InterWikiLinkHandler.js:32](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/handlers/InterWikiLinkHandler.js#L32)

***

### options

> **options**: `any`

Defined in: [src/parsers/handlers/BaseSyntaxHandler.js:33](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/handlers/BaseSyntaxHandler.js#L33)

#### Inherited from

[`BaseSyntaxHandler`](../../BaseSyntaxHandler/classes/BaseSyntaxHandler.md).[`options`](../../BaseSyntaxHandler/classes/BaseSyntaxHandler.md#options)

***

### pattern

> **pattern**: `RegExp`

Defined in: [src/parsers/handlers/BaseSyntaxHandler.js:41](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/handlers/BaseSyntaxHandler.js#L41)

#### Inherited from

[`BaseSyntaxHandler`](../../BaseSyntaxHandler/classes/BaseSyntaxHandler.md).[`pattern`](../../BaseSyntaxHandler/classes/BaseSyntaxHandler.md#pattern)

***

### priority

> **priority**: `number`

Defined in: [src/parsers/handlers/BaseSyntaxHandler.js:32](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/handlers/BaseSyntaxHandler.js#L32)

#### Inherited from

[`BaseSyntaxHandler`](../../BaseSyntaxHandler/classes/BaseSyntaxHandler.md).[`priority`](../../BaseSyntaxHandler/classes/BaseSyntaxHandler.md#priority)

***

### stats

> **stats**: `object`

Defined in: [src/parsers/handlers/BaseSyntaxHandler.js:50](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/handlers/BaseSyntaxHandler.js#L50)

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

[`BaseSyntaxHandler`](../../BaseSyntaxHandler/classes/BaseSyntaxHandler.md).[`stats`](../../BaseSyntaxHandler/classes/BaseSyntaxHandler.md#stats)

***

### version

> **version**: `any`

Defined in: [src/parsers/handlers/BaseSyntaxHandler.js:45](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/handlers/BaseSyntaxHandler.js#L45)

#### Inherited from

[`BaseSyntaxHandler`](../../BaseSyntaxHandler/classes/BaseSyntaxHandler.md).[`version`](../../BaseSyntaxHandler/classes/BaseSyntaxHandler.md#version)

## Methods

### addInterWikiSite()

> **addInterWikiSite**(`name`, `config`): `boolean`

Defined in: [src/parsers/handlers/InterWikiLinkHandler.js:429](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/handlers/InterWikiLinkHandler.js#L429)

Add new InterWiki site (for dynamic configuration)

#### Parameters

##### name

`string`

Site name

##### config

`any`

Site configuration

#### Returns

`boolean`

- True if added successfully

***

### buildRegexFlags()

> **buildRegexFlags**(): `string`

Defined in: [src/parsers/handlers/BaseSyntaxHandler.js:87](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/handlers/BaseSyntaxHandler.js#L87)

Build regex flags based on options

#### Returns

`string`

- Regex flags string

#### Inherited from

[`BaseSyntaxHandler`](../../BaseSyntaxHandler/classes/BaseSyntaxHandler.md).[`buildRegexFlags`](../../BaseSyntaxHandler/classes/BaseSyntaxHandler.md#buildregexflags)

***

### clone()

> **clone**(`overrides`): `any`

Defined in: [src/parsers/handlers/BaseSyntaxHandler.js:530](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/handlers/BaseSyntaxHandler.js#L530)

Create a clone of this handler with different options

#### Parameters

##### overrides

`any` = `{}`

Option overrides

#### Returns

`any`

- Handler configuration for creating new instance

#### Inherited from

[`BaseSyntaxHandler`](../../BaseSyntaxHandler/classes/BaseSyntaxHandler.md).[`clone`](../../BaseSyntaxHandler/classes/BaseSyntaxHandler.md#clone)

***

### compilePattern()

> **compilePattern**(`pattern`): `RegExp`

Defined in: [src/parsers/handlers/BaseSyntaxHandler.js:68](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/handlers/BaseSyntaxHandler.js#L68)

Compile pattern into RegExp if it's a string

#### Parameters

##### pattern

Pattern to compile

`string` | `RegExp`

#### Returns

`RegExp`

- Compiled regular expression

#### Inherited from

[`BaseSyntaxHandler`](../../BaseSyntaxHandler/classes/BaseSyntaxHandler.md).[`compilePattern`](../../BaseSyntaxHandler/classes/BaseSyntaxHandler.md#compilepattern)

***

### createErrorContext()

> **createErrorContext**(`error`, `content`, `context`): `any`

Defined in: [src/parsers/handlers/BaseSyntaxHandler.js:307](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/handlers/BaseSyntaxHandler.js#L307)

Create error context for debugging

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

[`BaseSyntaxHandler`](../../BaseSyntaxHandler/classes/BaseSyntaxHandler.md).[`createErrorContext`](../../BaseSyntaxHandler/classes/BaseSyntaxHandler.md#createerrorcontext)

***

### createTimeoutPromise()

> **createTimeoutPromise**(): `Promise`\<`any`\>

Defined in: [src/parsers/handlers/BaseSyntaxHandler.js:288](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/handlers/BaseSyntaxHandler.js#L288)

Create timeout promise for handler execution

#### Returns

`Promise`\<`any`\>

- Promise that rejects after timeout

#### Inherited from

[`BaseSyntaxHandler`](../../BaseSyntaxHandler/classes/BaseSyntaxHandler.md).[`createTimeoutPromise`](../../BaseSyntaxHandler/classes/BaseSyntaxHandler.md#createtimeoutpromise)

***

### disable()

> **disable**(): `void`

Defined in: [src/parsers/handlers/BaseSyntaxHandler.js:451](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/handlers/BaseSyntaxHandler.js#L451)

Disable the handler

#### Returns

`void`

#### Inherited from

[`BaseSyntaxHandler`](../../BaseSyntaxHandler/classes/BaseSyntaxHandler.md).[`disable`](../../BaseSyntaxHandler/classes/BaseSyntaxHandler.md#disable)

***

### enable()

> **enable**(): `void`

Defined in: [src/parsers/handlers/BaseSyntaxHandler.js:444](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/handlers/BaseSyntaxHandler.js#L444)

Enable the handler

#### Returns

`void`

#### Inherited from

[`BaseSyntaxHandler`](../../BaseSyntaxHandler/classes/BaseSyntaxHandler.md).[`enable`](../../BaseSyntaxHandler/classes/BaseSyntaxHandler.md#enable)

***

### escapeHtml()

> **escapeHtml**(`text`): `string`

Defined in: [src/parsers/handlers/InterWikiLinkHandler.js:397](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/handlers/InterWikiLinkHandler.js#L397)

Escape HTML characters to prevent XSS

#### Parameters

##### text

`string`

Text to escape

#### Returns

`string`

- Escaped text

***

### execute()

> **execute**(`content`, `context`): `Promise`\<`string`\>

Defined in: [src/parsers/handlers/BaseSyntaxHandler.js:241](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/handlers/BaseSyntaxHandler.js#L241)

Execute the handler with performance tracking and error handling

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

[`BaseSyntaxHandler`](../../BaseSyntaxHandler/classes/BaseSyntaxHandler.md).[`execute`](../../BaseSyntaxHandler/classes/BaseSyntaxHandler.md#execute)

***

### findInterWikiSite()

> **findInterWikiSite**(`wikiName`): `any`

Defined in: [src/parsers/handlers/InterWikiLinkHandler.js:271](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/handlers/InterWikiLinkHandler.js#L271)

Find InterWiki site configuration (case-insensitive)

#### Parameters

##### wikiName

`string`

Wiki site name

#### Returns

`any`

- Site configuration or null

***

### generateContentHash()

> **generateContentHash**(`content`): `string`

Defined in: [src/parsers/handlers/InterWikiLinkHandler.js:370](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/handlers/InterWikiLinkHandler.js#L370)

Generate content hash for caching

#### Parameters

##### content

`string`

Content to hash

#### Returns

`string`

- Content hash

***

### generateContextHash()

> **generateContextHash**(`context`): `string`

Defined in: [src/parsers/handlers/InterWikiLinkHandler.js:380](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/handlers/InterWikiLinkHandler.js#L380)

Generate context hash for caching

#### Parameters

##### context

`ParseContext`

Parse context

#### Returns

`string`

- Context hash

***

### generateInterWikiUrl()

> **generateInterWikiUrl**(`urlTemplate`, `pageName`): `string`

Defined in: [src/parsers/handlers/InterWikiLinkHandler.js:294](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/handlers/InterWikiLinkHandler.js#L294)

Generate InterWiki URL from template

#### Parameters

##### urlTemplate

`string`

URL template with %s placeholder

##### pageName

`string`

Page name to substitute

#### Returns

`string`

- Generated URL

***

### generateLinkHtml()

> **generateLinkHtml**(`url`, `displayText`, `siteConfig`, `wikiName`): `string`

Defined in: [src/parsers/handlers/InterWikiLinkHandler.js:336](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/handlers/InterWikiLinkHandler.js#L336)

Generate link HTML with appropriate attributes

#### Parameters

##### url

`string`

External URL

##### displayText

`string`

Link display text

##### siteConfig

`any`

Site configuration

##### wikiName

`string`

Wiki site name

#### Returns

`string`

- Link HTML

***

### getAvailableSites()

> **getAvailableSites**(): `any`[]

Defined in: [src/parsers/handlers/InterWikiLinkHandler.js:414](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/handlers/InterWikiLinkHandler.js#L414)

Get available InterWiki sites

#### Returns

`any`[]

- Array of available sites

***

### getDependencyErrors()

> **getDependencyErrors**(): `any`[]

Defined in: [src/parsers/handlers/BaseSyntaxHandler.js:203](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/handlers/BaseSyntaxHandler.js#L203)

Get dependency validation errors

#### Returns

`any`[]

- Array of dependency errors

#### Inherited from

[`BaseSyntaxHandler`](../../BaseSyntaxHandler/classes/BaseSyntaxHandler.md).[`getDependencyErrors`](../../BaseSyntaxHandler/classes/BaseSyntaxHandler.md#getdependencyerrors)

***

### getInfo()

> **getInfo**(): `any`

Defined in: [src/parsers/handlers/InterWikiLinkHandler.js:498](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/handlers/InterWikiLinkHandler.js#L498)

Get handler information for debugging and documentation

#### Returns

`any`

- Handler information

***

### getMetadata()

> **getMetadata**(): `any`

Defined in: [src/parsers/handlers/BaseSyntaxHandler.js:494](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/handlers/BaseSyntaxHandler.js#L494)

Get handler metadata

#### Returns

`any`

- Handler metadata

#### Inherited from

[`BaseSyntaxHandler`](../../BaseSyntaxHandler/classes/BaseSyntaxHandler.md).[`getMetadata`](../../BaseSyntaxHandler/classes/BaseSyntaxHandler.md#getmetadata)

***

### getStats()

> **getStats**(): `any`

Defined in: [src/parsers/handlers/BaseSyntaxHandler.js:467](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/handlers/BaseSyntaxHandler.js#L467)

Get handler statistics

#### Returns

`any`

- Handler statistics

#### Inherited from

[`BaseSyntaxHandler`](../../BaseSyntaxHandler/classes/BaseSyntaxHandler.md).[`getStats`](../../BaseSyntaxHandler/classes/BaseSyntaxHandler.md#getstats)

***

### getSupportedPatterns()

> **getSupportedPatterns**(): `string`[]

Defined in: [src/parsers/handlers/InterWikiLinkHandler.js:484](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/handlers/InterWikiLinkHandler.js#L484)

Get supported InterWiki patterns

#### Returns

`string`[]

- Array of supported patterns

***

### handle()

> **handle**(`matchInfo`, `context`): `Promise`\<`string`\>

Defined in: [src/parsers/handlers/InterWikiLinkHandler.js:220](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/handlers/InterWikiLinkHandler.js#L220)

Handle a specific InterWiki link match

#### Parameters

##### matchInfo

`any`

InterWiki link match information

##### context

`ParseContext`

Parse context

#### Returns

`Promise`\<`string`\>

- InterWiki link HTML

#### Overrides

[`BaseSyntaxHandler`](../../BaseSyntaxHandler/classes/BaseSyntaxHandler.md).[`handle`](../../BaseSyntaxHandler/classes/BaseSyntaxHandler.md#handle)

***

### hasDependencyErrors()

> **hasDependencyErrors**(): `boolean`

Defined in: [src/parsers/handlers/BaseSyntaxHandler.js:211](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/handlers/BaseSyntaxHandler.js#L211)

Check if handler has unresolved dependencies

#### Returns

`boolean`

- True if there are dependency errors

#### Inherited from

[`BaseSyntaxHandler`](../../BaseSyntaxHandler/classes/BaseSyntaxHandler.md).[`hasDependencyErrors`](../../BaseSyntaxHandler/classes/BaseSyntaxHandler.md#hasdependencyerrors)

***

### initialize()

> **initialize**(`context`): `Promise`\<`void`\>

Defined in: [src/parsers/handlers/BaseSyntaxHandler.js:101](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/handlers/BaseSyntaxHandler.js#L101)

Initialize the handler (optional override)
Called when handler is registered

#### Parameters

##### context

`any` = `{}`

Initialization context

#### Returns

`Promise`\<`void`\>

#### Inherited from

[`BaseSyntaxHandler`](../../BaseSyntaxHandler/classes/BaseSyntaxHandler.md).[`initialize`](../../BaseSyntaxHandler/classes/BaseSyntaxHandler.md#initialize)

***

### isEnabled()

> **isEnabled**(): `boolean`

Defined in: [src/parsers/handlers/BaseSyntaxHandler.js:459](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/handlers/BaseSyntaxHandler.js#L459)

Check if handler is enabled

#### Returns

`boolean`

- True if enabled

#### Inherited from

[`BaseSyntaxHandler`](../../BaseSyntaxHandler/classes/BaseSyntaxHandler.md).[`isEnabled`](../../BaseSyntaxHandler/classes/BaseSyntaxHandler.md#isenabled)

***

### isUrlSafe()

> **isUrlSafe**(`url`): `boolean`

Defined in: [src/parsers/handlers/InterWikiLinkHandler.js:307](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/handlers/InterWikiLinkHandler.js#L307)

Validate URL safety to prevent injection attacks

#### Parameters

##### url

`string`

URL to validate

#### Returns

`boolean`

- True if URL is safe

***

### loadDefaultSites()

> **loadDefaultSites**(): `void`

Defined in: [src/parsers/handlers/InterWikiLinkHandler.js:128](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/handlers/InterWikiLinkHandler.js#L128)

Load default InterWiki sites

#### Returns

`void`

***

### loadFromMainConfiguration()

> **loadFromMainConfiguration**(): `Promise`\<`void`\>

Defined in: [src/parsers/handlers/InterWikiLinkHandler.js:96](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/handlers/InterWikiLinkHandler.js#L96)

Load InterWiki sites from main configuration

#### Returns

`Promise`\<`void`\>

***

### loadInterWikiSites()

> **loadInterWikiSites**(): `Promise`\<`void`\>

Defined in: [src/parsers/handlers/InterWikiLinkHandler.js:61](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/handlers/InterWikiLinkHandler.js#L61)

Load InterWiki site definitions from configuration

#### Returns

`Promise`\<`void`\>

***

### onInitialize()

> **onInitialize**(`context`): `Promise`\<`void`\>

Defined in: [src/parsers/handlers/InterWikiLinkHandler.js:40](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/handlers/InterWikiLinkHandler.js#L40)

Initialize handler with configuration and InterWiki sites

#### Parameters

##### context

`any`

Initialization context

#### Returns

`Promise`\<`void`\>

#### Overrides

[`BaseSyntaxHandler`](../../BaseSyntaxHandler/classes/BaseSyntaxHandler.md).[`onInitialize`](../../BaseSyntaxHandler/classes/BaseSyntaxHandler.md#oninitialize)

***

### onShutdown()

> **onShutdown**(): `Promise`\<`void`\>

Defined in: [src/parsers/handlers/BaseSyntaxHandler.js:521](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/handlers/BaseSyntaxHandler.js#L521)

Custom shutdown logic (override in subclasses)

#### Returns

`Promise`\<`void`\>

#### Inherited from

[`BaseSyntaxHandler`](../../BaseSyntaxHandler/classes/BaseSyntaxHandler.md).[`onShutdown`](../../BaseSyntaxHandler/classes/BaseSyntaxHandler.md#onshutdown)

***

### parseParameters()

> **parseParameters**(`paramString`): `any`

Defined in: [src/parsers/handlers/BaseSyntaxHandler.js:330](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/handlers/BaseSyntaxHandler.js#L330)

Parse parameters from parameter string
Handles various formats: key=value, key='value', key="value"

#### Parameters

##### paramString

`string`

Parameter string to parse

#### Returns

`any`

- Parsed parameters

#### Inherited from

[`BaseSyntaxHandler`](../../BaseSyntaxHandler/classes/BaseSyntaxHandler.md).[`parseParameters`](../../BaseSyntaxHandler/classes/BaseSyntaxHandler.md#parseparameters)

***

### process()

> **process**(`content`, `context`): `Promise`\<`string`\>

Defined in: [src/parsers/handlers/InterWikiLinkHandler.js:163](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/handlers/InterWikiLinkHandler.js#L163)

Process content by finding and converting InterWiki links

#### Parameters

##### content

`string`

Content to process

##### context

`ParseContext`

Parse context

#### Returns

`Promise`\<`string`\>

- Content with InterWiki links processed

#### Overrides

[`BaseSyntaxHandler`](../../BaseSyntaxHandler/classes/BaseSyntaxHandler.md).[`process`](../../BaseSyntaxHandler/classes/BaseSyntaxHandler.md#process)

***

### reloadConfiguration()

> **reloadConfiguration**(): `Promise`\<`void`\>

Defined in: [src/parsers/handlers/InterWikiLinkHandler.js:475](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/handlers/InterWikiLinkHandler.js#L475)

Reload InterWiki configuration (hot reload support)

#### Returns

`Promise`\<`void`\>

***

### removeInterWikiSite()

> **removeInterWikiSite**(`name`): `boolean`

Defined in: [src/parsers/handlers/InterWikiLinkHandler.js:463](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/handlers/InterWikiLinkHandler.js#L463)

Remove InterWiki site

#### Parameters

##### name

`string`

Site name to remove

#### Returns

`boolean`

- True if removed successfully

***

### resetStats()

> **resetStats**(): `void`

Defined in: [src/parsers/handlers/BaseSyntaxHandler.js:480](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/handlers/BaseSyntaxHandler.js#L480)

Reset handler statistics

#### Returns

`void`

#### Inherited from

[`BaseSyntaxHandler`](../../BaseSyntaxHandler/classes/BaseSyntaxHandler.md).[`resetStats`](../../BaseSyntaxHandler/classes/BaseSyntaxHandler.md#resetstats)

***

### shutdown()

> **shutdown**(): `Promise`\<`void`\>

Defined in: [src/parsers/handlers/BaseSyntaxHandler.js:512](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/handlers/BaseSyntaxHandler.js#L512)

Clean up handler resources (optional override)
Called when handler is unregistered

#### Returns

`Promise`\<`void`\>

#### Inherited from

[`BaseSyntaxHandler`](../../BaseSyntaxHandler/classes/BaseSyntaxHandler.md).[`shutdown`](../../BaseSyntaxHandler/classes/BaseSyntaxHandler.md#shutdown)

***

### toString()

> **toString**(): `string`

Defined in: [src/parsers/handlers/BaseSyntaxHandler.js:547](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/handlers/BaseSyntaxHandler.js#L547)

String representation of handler

#### Returns

`string`

- String representation

#### Inherited from

[`BaseSyntaxHandler`](../../BaseSyntaxHandler/classes/BaseSyntaxHandler.md).[`toString`](../../BaseSyntaxHandler/classes/BaseSyntaxHandler.md#tostring)

***

### validateDependencies()

> **validateDependencies**(`context`): `Promise`\<`void`\>

Defined in: [src/parsers/handlers/BaseSyntaxHandler.js:132](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/handlers/BaseSyntaxHandler.js#L132)

Validate handler dependencies

#### Parameters

##### context

`any`

Initialization context

#### Returns

`Promise`\<`void`\>

#### Inherited from

[`BaseSyntaxHandler`](../../BaseSyntaxHandler/classes/BaseSyntaxHandler.md).[`validateDependencies`](../../BaseSyntaxHandler/classes/BaseSyntaxHandler.md#validatedependencies)

***

### validateParameter()

> **validateParameter**(`key`, `value`, `rule`): `any`

Defined in: [src/parsers/handlers/BaseSyntaxHandler.js:397](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/handlers/BaseSyntaxHandler.js#L397)

Validate a single parameter

#### Parameters

##### key

`string`

Parameter key

##### value

`any`

Parameter value

##### rule

`any`

Validation rule

#### Returns

`any`

- Validation result

#### Inherited from

[`BaseSyntaxHandler`](../../BaseSyntaxHandler/classes/BaseSyntaxHandler.md).[`validateParameter`](../../BaseSyntaxHandler/classes/BaseSyntaxHandler.md#validateparameter)

***

### validateParameters()

> **validateParameters**(`params`, `schema`): `any`

Defined in: [src/parsers/handlers/BaseSyntaxHandler.js:361](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/handlers/BaseSyntaxHandler.js#L361)

Validate parameters against schema

#### Parameters

##### params

`any`

Parameters to validate

##### schema

`any` = `{}`

Validation schema

#### Returns

`any`

- Validation result

#### Inherited from

[`BaseSyntaxHandler`](../../BaseSyntaxHandler/classes/BaseSyntaxHandler.md).[`validateParameters`](../../BaseSyntaxHandler/classes/BaseSyntaxHandler.md#validateparameters)

***

### validateSpecificDependency()

> **validateSpecificDependency**(`dependency`, `context`): `Promise`\<`void`\>

Defined in: [src/parsers/handlers/BaseSyntaxHandler.js:170](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/handlers/BaseSyntaxHandler.js#L170)

Validate specific dependency requirement

#### Parameters

##### dependency

`any`

Dependency specification

##### context

`any`

Initialization context

#### Returns

`Promise`\<`void`\>

#### Inherited from

[`BaseSyntaxHandler`](../../BaseSyntaxHandler/classes/BaseSyntaxHandler.md).[`validateSpecificDependency`](../../BaseSyntaxHandler/classes/BaseSyntaxHandler.md#validatespecificdependency)
