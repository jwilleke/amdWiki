[**amdWiki API v1.5.0**](../../../../../README.md)

***

[amdWiki API](../../../../../README.md) / [src/parsers/handlers/AttachmentHandler](../README.md) / export=

# Class: export=

Defined in: [src/parsers/handlers/AttachmentHandler.js:19](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/handlers/AttachmentHandler.js#L19)

AttachmentHandler - Advanced attachment processing with thumbnails and metadata

Supports enhanced JSPWiki attachment syntax:
- [{ATTACH filename.pdf}] - Simple attachment link
- [{ATTACH filename.pdf|Display Name}] - Custom display text
- [{ATTACH filename.pdf|Display Name|target=_blank}] - Link parameters
- Automatic thumbnail generation for images
- File metadata display (size, date, type)
- Security validation and permission checks

Related Issue: Advanced Attachment Handler (Phase 3)
Epic: #41 - Implement JSPWikiMarkupParser for Complete Enhancement Support

## Extends

- [`BaseSyntaxHandler`](../../BaseSyntaxHandler/classes/BaseSyntaxHandler.md)

## Constructors

### Constructor

> **new export=**(`engine`): `AttachmentHandler`

Defined in: [src/parsers/handlers/AttachmentHandler.js:20](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/handlers/AttachmentHandler.js#L20)

#### Parameters

##### engine

`any` = `null`

#### Returns

`AttachmentHandler`

#### Overrides

[`BaseSyntaxHandler`](../../BaseSyntaxHandler/classes/BaseSyntaxHandler.md).[`constructor`](../../BaseSyntaxHandler/classes/BaseSyntaxHandler.md#constructor)

## Properties

### attachmentConfig

> **attachmentConfig**: `object`

Defined in: [src/parsers/handlers/AttachmentHandler.js:35](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/handlers/AttachmentHandler.js#L35)

#### cacheMetadata

> **cacheMetadata**: `boolean` = `true`

#### enhanced

> **enhanced**: `boolean` = `true`

#### generateThumbnails

> **generateThumbnails**: `boolean` = `true`

#### iconPath

> **iconPath**: `string` = `'/icons/filetypes'`

#### metadata

> **metadata**: `boolean` = `true`

#### securityChecks

> **securityChecks**: `boolean` = `true`

#### showFileSize

> **showFileSize**: `boolean` = `true`

#### showModified

> **showModified**: `boolean` = `true`

#### thumbnails

> **thumbnails**: `boolean` = `true`

#### thumbnailSizes

> **thumbnailSizes**: `string`[]

***

### config

> **config**: `any`

Defined in: [src/parsers/handlers/AttachmentHandler.js:34](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/handlers/AttachmentHandler.js#L34)

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

Defined in: [src/parsers/handlers/AttachmentHandler.js:33](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/handlers/AttachmentHandler.js#L33)

***

### handlerId

> **handlerId**: `string`

Defined in: [src/parsers/handlers/AttachmentHandler.js:32](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/handlers/AttachmentHandler.js#L32)

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

### cacheAttachmentResult()

> **cacheAttachmentResult**(`filename`, `context`, `result`): `Promise`\<`void`\>

Defined in: [src/parsers/handlers/AttachmentHandler.js:584](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/handlers/AttachmentHandler.js#L584)

Cache attachment result

#### Parameters

##### filename

`string`

Attachment filename

##### context

`ParseContext`

Parse context

##### result

`string`

HTML result to cache

#### Returns

`Promise`\<`void`\>

***

### checkAttachmentPermission()

> **checkAttachmentPermission**(`filename`, `context`): `Promise`\<`boolean`\>

Defined in: [src/parsers/handlers/AttachmentHandler.js:410](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/handlers/AttachmentHandler.js#L410)

Check if user has permission to access attachment (modular security)

#### Parameters

##### filename

`string`

Attachment filename

##### context

`ParseContext`

Parse context

#### Returns

`Promise`\<`boolean`\>

- True if access granted

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

### createThumbnail()

> **createThumbnail**(`sourcePath`, `thumbnailFilename`, `size`): `Promise`\<`void`\>

Defined in: [src/parsers/handlers/AttachmentHandler.js:395](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/handlers/AttachmentHandler.js#L395)

Create thumbnail (placeholder implementation - would use image processing library)

#### Parameters

##### sourcePath

`string`

Source image path

##### thumbnailFilename

`string`

Thumbnail filename

##### size

`string`

Size specification (e.g., '150x150')

#### Returns

`Promise`\<`void`\>

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

Defined in: [src/parsers/handlers/AttachmentHandler.js:629](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/handlers/AttachmentHandler.js#L629)

Escape HTML to prevent XSS (modular security)

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

### formatDate()

> **formatDate**(`date`): `string`

Defined in: [src/parsers/handlers/AttachmentHandler.js:546](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/handlers/AttachmentHandler.js#L546)

Format date for display (modular date formatting)

#### Parameters

##### date

`Date`

Date to format

#### Returns

`string`

- Formatted date

***

### formatFileSize()

> **formatFileSize**(`bytes`): `string`

Defined in: [src/parsers/handlers/AttachmentHandler.js:531](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/handlers/AttachmentHandler.js#L531)

Format file size for display (modular formatting)

#### Parameters

##### bytes

`number`

File size in bytes

#### Returns

`string`

- Formatted file size

***

### generateContentHash()

> **generateContentHash**(`content`): `string`

Defined in: [src/parsers/handlers/AttachmentHandler.js:601](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/handlers/AttachmentHandler.js#L601)

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

Defined in: [src/parsers/handlers/AttachmentHandler.js:611](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/handlers/AttachmentHandler.js#L611)

Generate context hash for caching

#### Parameters

##### context

`ParseContext`

Parse context

#### Returns

`string`

- Context hash

***

### generateFileAttachmentHtml()

> **generateFileAttachmentHtml**(`filename`, `displayText`, `metadata`, `params`, `context`): `Promise`\<`string`\>

Defined in: [src/parsers/handlers/AttachmentHandler.js:301](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/handlers/AttachmentHandler.js#L301)

Generate enhanced HTML for file attachments

#### Parameters

##### filename

`string`

Attachment filename

##### displayText

`string`

Display text

##### metadata

`any`

File metadata

##### params

`any`

Link parameters

##### context

`ParseContext`

Parse context

#### Returns

`Promise`\<`string`\>

- File attachment HTML

***

### generateImageAttachmentHtml()

> **generateImageAttachmentHtml**(`filename`, `displayText`, `metadata`, `params`, `context`): `Promise`\<`string`\>

Defined in: [src/parsers/handlers/AttachmentHandler.js:261](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/handlers/AttachmentHandler.js#L261)

Generate enhanced HTML for image attachments with thumbnails

#### Parameters

##### filename

`string`

Image filename

##### displayText

`string`

Display text

##### metadata

`any`

File metadata

##### params

`any`

Link parameters

##### context

`ParseContext`

Parse context

#### Returns

`Promise`\<`string`\>

- Image attachment HTML

***

### generateMetadataHtml()

> **generateMetadataHtml**(`metadata`, `displayText`): `string`

Defined in: [src/parsers/handlers/AttachmentHandler.js:334](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/handlers/AttachmentHandler.js#L334)

Generate metadata HTML display

#### Parameters

##### metadata

`any`

File metadata

##### displayText

`string`

Custom display text

#### Returns

`string`

- Metadata HTML

***

### generateThumbnail()

> **generateThumbnail**(`filename`, `metadata`, `context`): `Promise`\<`string`\>

Defined in: [src/parsers/handlers/AttachmentHandler.js:359](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/handlers/AttachmentHandler.js#L359)

Generate thumbnail for image attachments (modular based on configuration)

#### Parameters

##### filename

`string`

Image filename

##### metadata

`any`

File metadata

##### context

`ParseContext`

Parse context

#### Returns

`Promise`\<`string`\>

- Thumbnail URL or null

***

### getAttachmentMetadata()

> **getAttachmentMetadata**(`filename`, `context`): `Promise`\<`any`\>

Defined in: [src/parsers/handlers/AttachmentHandler.js:224](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/handlers/AttachmentHandler.js#L224)

Get attachment metadata with caching

#### Parameters

##### filename

`string`

Attachment filename

##### context

`ParseContext`

Parse context

#### Returns

`Promise`\<`any`\>

- Attachment metadata or null

***

### getCachedAttachmentResult()

> **getCachedAttachmentResult**(`filename`, `context`): `Promise`\<`string`\>

Defined in: [src/parsers/handlers/AttachmentHandler.js:566](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/handlers/AttachmentHandler.js#L566)

Get cached attachment result

#### Parameters

##### filename

`string`

Attachment filename

##### context

`ParseContext`

Parse context

#### Returns

`Promise`\<`string`\>

- Cached result or null

***

### getConfigurationSummary()

> **getConfigurationSummary**(): `any`

Defined in: [src/parsers/handlers/AttachmentHandler.js:646](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/handlers/AttachmentHandler.js#L646)

Get configuration summary (for debugging and monitoring)

#### Returns

`any`

- Configuration summary

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

### getFileIcon()

> **getFileIcon**(`fileType`): `string`

Defined in: [src/parsers/handlers/AttachmentHandler.js:507](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/handlers/AttachmentHandler.js#L507)

Get file icon filename (modular icon system)

#### Parameters

##### fileType

`string`

File type

#### Returns

`string`

- Icon filename

***

### getFileType()

> **getFileType**(`filename`): `string`

Defined in: [src/parsers/handlers/AttachmentHandler.js:477](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/handlers/AttachmentHandler.js#L477)

Get file type from filename (modular type detection)

#### Parameters

##### filename

`string`

Filename

#### Returns

`string`

- File type

***

### getInfo()

> **getInfo**(): `any`

Defined in: [src/parsers/handlers/AttachmentHandler.js:684](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/handlers/AttachmentHandler.js#L684)

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

Defined in: [src/parsers/handlers/AttachmentHandler.js:671](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/handlers/AttachmentHandler.js#L671)

Get supported attachment patterns

#### Returns

`string`[]

- Array of supported patterns

***

### handle()

> **handle**(`matchInfo`, `context`): `Promise`\<`string`\>

Defined in: [src/parsers/handlers/AttachmentHandler.js:175](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/handlers/AttachmentHandler.js#L175)

Handle a specific attachment with enhanced features

#### Parameters

##### matchInfo

`any`

Attachment match information

##### context

`ParseContext`

Parse context

#### Returns

`Promise`\<`string`\>

- Enhanced attachment HTML

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

### isImageFile()

> **isImageFile**(`filename`): `boolean`

Defined in: [src/parsers/handlers/AttachmentHandler.js:466](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/handlers/AttachmentHandler.js#L466)

Check if file is an image (modular file type detection)

#### Parameters

##### filename

`string`

Filename to check

#### Returns

`boolean`

- True if image file

***

### loadModularConfiguration()

> **loadModularConfiguration**(): `Promise`\<`void`\>

Defined in: [src/parsers/handlers/AttachmentHandler.js:60](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/handlers/AttachmentHandler.js#L60)

Load configuration from multiple modular sources
- app-default-config.json (base configuration)
- app-custom-config.json (user overrides via ConfigurationManager)
- Handler-specific settings from MarkupParser

#### Returns

`Promise`\<`void`\>

***

### onInitialize()

> **onInitialize**(`context`): `Promise`\<`void`\>

Defined in: [src/parsers/handlers/AttachmentHandler.js:42](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/handlers/AttachmentHandler.js#L42)

Initialize handler with modular configuration loading

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

### parseAttachmentParameters()

> **parseAttachmentParameters**(`paramString`): `any`

Defined in: [src/parsers/handlers/AttachmentHandler.js:442](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/handlers/AttachmentHandler.js#L442)

Parse attachment parameters (modular parameter system)

#### Parameters

##### paramString

`string`

Parameter string

#### Returns

`any`

- Parsed parameters

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

Defined in: [src/parsers/handlers/AttachmentHandler.js:119](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/handlers/AttachmentHandler.js#L119)

Process content by finding and enhancing attachment links

#### Parameters

##### content

`string`

Content to process

##### context

`ParseContext`

Parse context

#### Returns

`Promise`\<`string`\>

- Content with enhanced attachments

#### Overrides

[`BaseSyntaxHandler`](../../BaseSyntaxHandler/classes/BaseSyntaxHandler.md).[`process`](../../BaseSyntaxHandler/classes/BaseSyntaxHandler.md#process)

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
