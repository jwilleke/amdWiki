[**amdWiki API v1.5.0**](../../../../README.md)

***

[amdWiki API](../../../../README.md) / [src/managers/RenderingManager](../README.md) / export=

# Class: export=

Defined in: [src/managers/RenderingManager.js:39](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/managers/RenderingManager.js#L39)

RenderingManager - Handles markdown rendering and macro expansion

Similar to JSPWiki's RenderingManager, this manager orchestrates the conversion
of markdown/wiki markup to HTML. It supports both legacy Showdown-based rendering
and the advanced MarkupParser with multi-phase processing.

Key features:

- Pluggable parser system (Showdown vs MarkupParser)
- Wiki link parsing and resolution
- Link graph building for backlinks/orphaned pages
- Plugin and variable expansion integration
- Page name matching with plural support

 RenderingManager

## See

- [BaseManager](../../BaseManager/classes/export=.md) for base functionality
- MarkupParser for advanced parsing

## Example

```ts
const renderingManager = engine.getManager('RenderingManager');
const html = await renderingManager.renderPage('# Hello World', { pageName: 'Main' });
```

## Extends

- [`export=`](../../BaseManager/classes/export=.md)

## Constructors

### Constructor

> **new export=**(`engine`): `RenderingManager`

Defined in: [src/managers/RenderingManager.js:46](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/managers/RenderingManager.js#L46)

Creates a new RenderingManager instance

#### Parameters

##### engine

`WikiEngine`

The wiki engine instance

#### Returns

`RenderingManager`

#### Overrides

[`export=`](../../BaseManager/classes/export=.md).[`constructor`](../../BaseManager/classes/export=.md#constructor)

## Properties

### cachedPageNames

> **cachedPageNames**: `any`

Defined in: [src/managers/RenderingManager.js:911](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/managers/RenderingManager.js#L911)

***

### config

> **config**: `any`

Defined in: [src/managers/BaseManager.js:55](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/managers/BaseManager.js#L55)

Configuration object passed during initialization

#### Inherited from

[`export=`](../../BaseManager/classes/export=.md).[`config`](../../BaseManager/classes/export=.md#config)

***

### converter

> **converter**: `any`

Defined in: [src/managers/RenderingManager.js:48](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/managers/RenderingManager.js#L48)

Showdown markdown converter (legacy)

***

### engine

> **engine**: `WikiEngine`

Defined in: [src/managers/BaseManager.js:33](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/managers/BaseManager.js#L33)

Reference to the wiki engine

#### Inherited from

[`export=`](../../BaseManager/classes/export=.md).[`engine`](../../BaseManager/classes/export=.md#engine)

***

### initialized

> **initialized**: `boolean`

Defined in: [src/managers/BaseManager.js:34](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/managers/BaseManager.js#L34)

Flag indicating initialization status

#### Inherited from

[`export=`](../../BaseManager/classes/export=.md).[`initialized`](../../BaseManager/classes/export=.md#initialized)

***

### linkGraph

> **linkGraph**: `object`

Defined in: [src/managers/RenderingManager.js:49](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/managers/RenderingManager.js#L49)

Graph of page links for backlink analysis

***

### linkParser

> **linkParser**: [`LinkParser`](../../../parsers/LinkParser/classes/LinkParser.md)

Defined in: [src/managers/RenderingManager.js:50](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/managers/RenderingManager.js#L50)

Parser for wiki-style links

***

### pageNameMatcher

> **pageNameMatcher**: `any`

Defined in: [src/managers/RenderingManager.js:51](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/managers/RenderingManager.js#L51)

Matcher for page name resolution

***

### renderingConfig

> **renderingConfig**: `object`

Defined in: [src/managers/RenderingManager.js:147](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/managers/RenderingManager.js#L147)

Rendering configuration (parser selection, fallback, etc.)

#### fallbackToLegacy

> **fallbackToLegacy**: `boolean` = `true`

#### integration

> **integration**: `boolean` = `true`

#### logParsingMethod

> **logParsingMethod**: `boolean` = `true`

#### performanceComparison

> **performanceComparison**: `boolean` = `false`

#### useAdvancedParser

> **useAdvancedParser**: `boolean` = `true`

## Methods

### backup()

> **backup**(): `Promise`\<`any`\>

Defined in: [src/managers/BaseManager.js:130](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/managers/BaseManager.js#L130)

Backup manager data

MUST be overridden by all managers that manage persistent data.
Default implementation returns an empty backup object.

#### Returns

`Promise`\<`any`\>

Backup data object containing all manager state

#### Async

#### Throws

If backup operation fails

#### Example

```ts
async backup() {
  return {
    managerName: this.constructor.name,
    timestamp: new Date().toISOString(),
    data: {
      users: Array.from(this.users.values()),
      settings: this.settings
    }
  };
}
```

#### Inherited from

[`export=`](../../BaseManager/classes/export=.md).[`backup`](../../BaseManager/classes/export=.md#backup)

***

### buildLinkGraph()

> **buildLinkGraph**(): `Promise`\<`void`\>

Defined in: [src/managers/RenderingManager.js:993](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/managers/RenderingManager.js#L993)

Build link graph for referring pages

#### Returns

`Promise`\<`void`\>

***

### convertJSPWikiTableToMarkdown()

> **convertJSPWikiTableToMarkdown**(`tableContent`, `params`): `string`

Defined in: [src/managers/RenderingManager.js:428](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/managers/RenderingManager.js#L428)

Convert JSPWiki table syntax to markdown table syntax

#### Parameters

##### tableContent

`string`

JSPWiki table content

##### params

`any`

Table parameters

#### Returns

`string`

Markdown table

***

### expandMacros()

> **expandMacros**(`content`, `pageName`, `userContext`, `requestInfo`): `string`

Defined in: [src/managers/RenderingManager.js:560](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/managers/RenderingManager.js#L560)

Expand macros in content

#### Parameters

##### content

`string`

Content with macros

##### pageName

`string`

Current page name

##### userContext

`any` = `null`

User context for authentication variables

##### requestInfo

`any` = `null`

#### Returns

`string`

Content with expanded macros

***

### expandSystemVariable()

> **expandSystemVariable**(`variable`, `pageName`, `userContext`): `string`

Defined in: [src/managers/RenderingManager.js:727](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/managers/RenderingManager.js#L727)

Expand a single JSPWiki-style system variable

#### Parameters

##### variable

`string`

The variable name (including $)

##### pageName

`string`

Current page name

##### userContext

`any` = `null`

User context for authentication variables

#### Returns

`string`

Expanded value

***

### expandSystemVariables()

> **expandSystemVariables**(`content`): `string`

Defined in: [src/managers/RenderingManager.js:821](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/managers/RenderingManager.js#L821)

Expand JSPWiki-style system variables (legacy method for compatibility)

#### Parameters

##### content

`string`

Content with system variables

#### Returns

`string`

Content with expanded system variables

***

### formatUptime()

> **formatUptime**(`seconds`): `string`

Defined in: [src/managers/RenderingManager.js:867](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/managers/RenderingManager.js#L867)

Format uptime in human-readable format

#### Parameters

##### seconds

`number`

Uptime in seconds

#### Returns

`string`

Formatted uptime

***

### generateStyledTable()

> **generateStyledTable**(`metadata`): `string`

Defined in: [src/managers/RenderingManager.js:505](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/managers/RenderingManager.js#L505)

Generate styled table HTML with CSS

#### Parameters

##### metadata

`any`

Table styling metadata

#### Returns

`string`

Styled table opening tag with CSS

***

### getApplicationVersion()

> **getApplicationVersion**(): `string`

Defined in: [src/managers/RenderingManager.js:798](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/managers/RenderingManager.js#L798)

Get application version from package.json

#### Returns

`string`

Application version

***

### getBaseUrl()

> **getBaseUrl**(): `string`

Defined in: [src/managers/RenderingManager.js:885](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/managers/RenderingManager.js#L885)

Get the base URL for the application

#### Returns

`string`

Base URL

***

### getEngine()

> **getEngine**(): `WikiEngine`

Defined in: [src/managers/BaseManager.js:81](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/managers/BaseManager.js#L81)

Get the wiki engine instance

#### Returns

`WikiEngine`

The wiki engine instance

#### Example

```ts
const config = this.getEngine().getConfig();
```

#### Inherited from

[`export=`](../../BaseManager/classes/export=.md).[`getEngine`](../../BaseManager/classes/export=.md#getengine)

***

### getLinkGraph()

> **getLinkGraph**(): `any`

Defined in: [src/managers/RenderingManager.js:1120](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/managers/RenderingManager.js#L1120)

Get link graph

#### Returns

`any`

Link graph object

***

### getLoginStatus()

> **getLoginStatus**(`userContext`): `string`

Defined in: [src/managers/RenderingManager.js:1180](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/managers/RenderingManager.js#L1180)

Get current login status from user context

#### Parameters

##### userContext

`any`

User context object

#### Returns

`string`

Login status description

***

### getParser()

> **getParser**(): `any`

Defined in: [src/managers/RenderingManager.js:120](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/managers/RenderingManager.js#L120)

Get the MarkupParser instance (for WikiContext integration)

Returns the advanced MarkupParser if enabled and initialized, or null
if using legacy Showdown rendering.

#### Returns

`any`

MarkupParser instance if available and enabled

#### Example

```ts
const parser = renderingManager.getParser();
if (parser) {
  const html = await parser.parse(content, options);
}
```

***

### getReferringPages()

> **getReferringPages**(`pageName`): `string`[]

Defined in: [src/managers/RenderingManager.js:1139](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/managers/RenderingManager.js#L1139)

Get pages that refer to a specific page

#### Parameters

##### pageName

`string`

Target page name

#### Returns

`string`[]

Array of referring page names

#### Todo

SHOULD BE using plugins/referringPagesPlugin.js

***

### getTotalPagesCount()

> **getTotalPagesCount**(): `number`

Defined in: [src/managers/RenderingManager.js:770](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/managers/RenderingManager.js#L770)

Get total pages count
Uses the provider's page cache for an accurate count.
After installation, only counts pages from the main pages directory.

#### Returns

`number`

Number of pages

***

### getUptime()

> **getUptime**(): `number`

Defined in: [src/managers/RenderingManager.js:789](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/managers/RenderingManager.js#L789)

/**

- Get server uptime in seconds
-

#### Returns

`number`

Uptime in seconds

***

### getUserName()

> **getUserName**(`userContext`): `string`

Defined in: [src/managers/RenderingManager.js:1159](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/managers/RenderingManager.js#L1159)

Get current username from user context

#### Parameters

##### userContext

`any`

User context object

#### Returns

`string`

Username or "Anonymous"

***

### initialize()

> **initialize**(`config?`): `Promise`\<`void`\>

Defined in: [src/managers/RenderingManager.js:68](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/managers/RenderingManager.js#L68)

Initialize the RenderingManager

Sets up the markdown converter, link parser, and rendering configuration.
Determines whether to use the advanced MarkupParser or legacy Showdown converter.

#### Parameters

##### config?

`any` = `{}`

Configuration object (unused, reads from ConfigurationManager)

#### Returns

`Promise`\<`void`\>

#### Async

#### Example

```ts
await renderingManager.initialize();
console.log('RenderingManager ready');
```

#### Overrides

[`export=`](../../BaseManager/classes/export=.md).[`initialize`](../../BaseManager/classes/export=.md#initialize)

***

### initializeLinkParser()

> **initializeLinkParser**(): `Promise`\<`void`\>

Defined in: [src/managers/RenderingManager.js:1087](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/managers/RenderingManager.js#L1087)

Initialize LinkParser with page names and configuration

#### Returns

`Promise`\<`void`\>

***

### isInitialized()

> **isInitialized**(): `boolean`

Defined in: [src/managers/BaseManager.js:69](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/managers/BaseManager.js#L69)

Check if manager has been initialized

#### Returns

`boolean`

True if manager is initialized

#### Example

```ts
if (manager.isInitialized()) {
  // Safe to use manager
}
```

#### Inherited from

[`export=`](../../BaseManager/classes/export=.md).[`isInitialized`](../../BaseManager/classes/export=.md#isinitialized)

***

### parseTableParameters()

> **parseTableParameters**(`paramString`): `any`

Defined in: [src/managers/RenderingManager.js:396](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/managers/RenderingManager.js#L396)

Parse table parameters from JSPWiki Table plugin syntax

#### Parameters

##### paramString

`string`

Parameter string

#### Returns

`any`

Parsed parameters

***

### performPerformanceComparison()

> **performPerformanceComparison**(`content`, `pageName`, `userContext`, `requestInfo`, `advancedTime`): `Promise`\<`void`\>

Defined in: [src/managers/RenderingManager.js:292](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/managers/RenderingManager.js#L292)

Perform performance comparison between advanced and legacy parsers (modular benchmarking)

#### Parameters

##### content

`string`

Content that was parsed

##### pageName

`string`

Page name

##### userContext

`any`

User context

##### requestInfo

`any`

Request information

##### advancedTime

`number`

Time taken by advanced parser

#### Returns

`Promise`\<`void`\>

***

### postProcessTables()

> **postProcessTables**(`html`): `string`

Defined in: [src/managers/RenderingManager.js:485](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/managers/RenderingManager.js#L485)

Post-process rendered HTML tables to apply JSPWiki styling

#### Parameters

##### html

`string`

Rendered HTML

#### Returns

`string`

HTML with styled tables

***

### processJSPWikiTables()

> **processJSPWikiTables**(`content`): `string`

Defined in: [src/managers/RenderingManager.js:332](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/managers/RenderingManager.js#L332)

Process JSPWiki-style table syntax with styling parameters

#### Parameters

##### content

`string`

Content with JSPWiki table syntax

#### Returns

`string`

Content with processed tables

***

### processTableStripedSyntax()

> **processTableStripedSyntax**(`content`): `string`

Defined in: [src/managers/RenderingManager.js:361](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/managers/RenderingManager.js#L361)

Process %%table-striped syntax for theme-based alternating rows

#### Parameters

##### content

`string`

Content with %%table-striped syntax

#### Returns

`string`

Content with processed tables

***

### processWikiLinks()

> **processWikiLinks**(`content`): `Promise`\<`string`\>

Defined in: [src/managers/RenderingManager.js:896](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/managers/RenderingManager.js#L896)

Process wiki-style links [PageName]

#### Parameters

##### content

`string`

Content with wiki links

#### Returns

`Promise`\<`string`\>

Content with processed links

***

### rebuildLinkGraph()

> **rebuildLinkGraph**(): `Promise`\<`void`\>

Defined in: [src/managers/RenderingManager.js:1127](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/managers/RenderingManager.js#L1127)

Rebuild link graph (called after page changes)

#### Returns

`Promise`\<`void`\>

***

### renderMarkdown()

> **renderMarkdown**(`content`, `pageName`, `userContext`, `requestInfo`): `Promise`\<`string`\>

Defined in: [src/managers/RenderingManager.js:177](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/managers/RenderingManager.js#L177)

Render markdown content to HTML with MarkupParser integration

#### Parameters

##### content

`string`

Markdown content

##### pageName

`string`

Current page name

##### userContext

`any` = `null`

User context for authentication variables

##### requestInfo

`any` = `null`

Request information

#### Returns

`Promise`\<`string`\>

Rendered HTML

***

### renderPlugins()

> **renderPlugins**(`content`, `pageName`): `string`

Defined in: [src/managers/RenderingManager.js:1222](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/managers/RenderingManager.js#L1222)

Render plugins (JSPWiki-style plugins)

#### Parameters

##### content

`string`

Content with plugin syntax

##### pageName

`string`

Page name for plugin context

#### Returns

`string`

Content with rendered plugins

***

### renderPreview()

> **renderPreview**(`content`, `pageName`, `userContext`): `Promise`\<`string`\>

Defined in: [src/managers/RenderingManager.js:1150](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/managers/RenderingManager.js#L1150)

Render page preview

#### Parameters

##### content

`string`

Markdown content

##### pageName

`string`

Page name for context

##### userContext

`any` = `null`

User context for authentication variables

#### Returns

`Promise`\<`string`\>

Rendered HTML preview

***

### renderWikiLinks()

> **renderWikiLinks**(`content`): `string`

Defined in: [src/managers/RenderingManager.js:1201](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/managers/RenderingManager.js#L1201)

Render wiki links (JSPWiki-style links) using LinkParser

#### Parameters

##### content

`string`

Content with wiki links

#### Returns

`string`

Content with rendered links

***

### renderWithAdvancedParser()

> **renderWithAdvancedParser**(`content`, `pageName`, `userContext`, `requestInfo`): `Promise`\<`string`\>

Defined in: [src/managers/RenderingManager.js:209](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/managers/RenderingManager.js#L209)

Render content using the advanced MarkupParser system

#### Parameters

##### content

`string`

Content to render

##### pageName

`string`

Page name

##### userContext

`any`

User context

##### requestInfo

`any`

Request information

#### Returns

`Promise`\<`string`\>

Rendered HTML

***

### renderWithLegacyParser()

> **renderWithLegacyParser**(`content`, `pageName`, `userContext`, `requestInfo`): `Promise`\<`string`\>

Defined in: [src/managers/RenderingManager.js:259](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/managers/RenderingManager.js#L259)

Render content using the legacy rendering system (backward compatibility)

#### Parameters

##### content

`string`

Content to render

##### pageName

`string`

Page name

##### userContext

`any`

User context

##### requestInfo

`any`

Request information

#### Returns

`Promise`\<`string`\>

Rendered HTML

***

### restore()

> **restore**(`backupData`): `Promise`\<`void`\>

Defined in: [src/managers/BaseManager.js:163](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/managers/BaseManager.js#L163)

Restore manager data from backup

MUST be overridden by all managers that manage persistent data.
Default implementation only validates that backup data is provided.

#### Parameters

##### backupData

Backup data object from backup() method

###### data

`any`

Manager-specific backup data

###### managerName

`string`

Name of the manager

###### timestamp

`string`

ISO timestamp of backup

#### Returns

`Promise`\<`void`\>

#### Async

#### Throws

If restore operation fails or backup data is missing

#### Example

```ts
async restore(backupData) {
  if (!backupData || !backupData.data) {
    throw new Error('Invalid backup data');
  }
  this.users = new Map(backupData.data.users.map(u => [u.id, u]));
  this.settings = backupData.data.settings;
}
```

#### Inherited from

[`export=`](../../BaseManager/classes/export=.md).[`restore`](../../BaseManager/classes/export=.md#restore)

***

### shutdown()

> **shutdown**(): `Promise`\<`void`\>

Defined in: [src/managers/BaseManager.js:101](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/managers/BaseManager.js#L101)

Shutdown the manager and cleanup resources

Override this method in subclasses to perform cleanup logic.
Always call super.shutdown() at the end of overridden implementations.

#### Returns

`Promise`\<`void`\>

#### Async

#### Example

```ts
async shutdown() {
  // Your cleanup logic here
  await this.closeConnections();
  await super.shutdown();
}
```

#### Inherited from

[`export=`](../../BaseManager/classes/export=.md).[`shutdown`](../../BaseManager/classes/export=.md#shutdown)

***

### textToHTML()

> **textToHTML**(`context`, `content`): `Promise`\<`string`\>

Defined in: [src/managers/RenderingManager.js:1286](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/managers/RenderingManager.js#L1286)

Converts wiki markup to HTML using the provided WikiContext.
This is the main entry point for the rendering pipeline.

#### Parameters

##### context

`WikiContext`

The context for the rendering operation.

##### content

`string`

The raw wiki markup to render.

#### Returns

`Promise`\<`string`\>

The rendered HTML.
