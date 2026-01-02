[**amdWiki API v1.5.0**](../../../../README.md)

***

[amdWiki API](../../../../README.md) / [src/managers/RenderingManager](../README.md) / export=

# Class: export=

Defined in: [src/managers/RenderingManager.ts:145](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/managers/RenderingManager.ts#L145)

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

 - [BaseManager](../../BaseManager/classes/default.md) for base functionality
 - MarkupParser for advanced parsing

## Example

```ts
const renderingManager = engine.getManager('RenderingManager');
const html = await renderingManager.renderPage('# Hello World', { pageName: 'Main' });
```

## Extends

- [`default`](../../BaseManager/classes/default.md)

## Constructors

### Constructor

> **new export=**(`engine`): `RenderingManager`

Defined in: [src/managers/RenderingManager.ts:160](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/managers/RenderingManager.ts#L160)

Creates a new RenderingManager instance

#### Parameters

##### engine

[`WikiEngine`](../../../types/WikiEngine/interfaces/WikiEngine.md)

The wiki engine instance

#### Returns

`RenderingManager`

#### Overrides

[`default`](../../BaseManager/classes/default.md).[`constructor`](../../BaseManager/classes/default.md#constructor)

## Properties

### config?

> `protected` `optional` **config**: `Record`\<`string`, `any`\>

Defined in: [src/managers/BaseManager.ts:63](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/managers/BaseManager.ts#L63)

Configuration passed during initialization

#### Inherited from

[`default`](../../BaseManager/classes/default.md).[`config`](../../BaseManager/classes/default.md#config)

***

### engine

> `protected` **engine**: [`WikiEngine`](../../../types/WikiEngine/interfaces/WikiEngine.md)

Defined in: [src/managers/BaseManager.ts:56](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/managers/BaseManager.ts#L56)

Reference to the wiki engine

#### Inherited from

[`default`](../../BaseManager/classes/default.md).[`engine`](../../BaseManager/classes/default.md#engine)

***

### initialized

> `protected` **initialized**: `boolean`

Defined in: [src/managers/BaseManager.ts:59](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/managers/BaseManager.ts#L59)

Initialization status flag

#### Inherited from

[`default`](../../BaseManager/classes/default.md).[`initialized`](../../BaseManager/classes/default.md#initialized)

## Methods

### backup()

> **backup**(): `Promise`\<[`BackupData`](../../BaseManager/interfaces/BackupData.md)\>

Defined in: [src/managers/BaseManager.ts:168](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/managers/BaseManager.ts#L168)

Backup manager data

MUST be overridden by all managers that manage persistent data.
Default implementation returns an empty backup object.

#### Returns

`Promise`\<[`BackupData`](../../BaseManager/interfaces/BackupData.md)\>

Backup data object containing all manager state

#### Throws

If backup operation fails

#### Example

```ts
async backup(): Promise<BackupData> {
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

[`default`](../../BaseManager/classes/default.md).[`backup`](../../BaseManager/classes/default.md#backup)

***

### buildLinkGraph()

> **buildLinkGraph**(): `Promise`\<`void`\>

Defined in: [src/managers/RenderingManager.ts:1138](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/managers/RenderingManager.ts#L1138)

Build link graph for referring pages

#### Returns

`Promise`\<`void`\>

***

### convertJSPWikiTableToMarkdown()

> **convertJSPWikiTableToMarkdown**(`tableContent`, `params`): `string`

Defined in: [src/managers/RenderingManager.ts:565](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/managers/RenderingManager.ts#L565)

Convert JSPWiki table syntax to markdown table syntax

#### Parameters

##### tableContent

`string`

JSPWiki table content

##### params

`TableParams`

Table parameters

#### Returns

`string`

Markdown table

***

### expandMacros()

> **expandMacros**(`content`, `pageName`, `userContext`, `requestInfo`): `Promise`\<`string`\>

Defined in: [src/managers/RenderingManager.ts:697](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/managers/RenderingManager.ts#L697)

Expand macros in content

#### Parameters

##### content

`string`

Content with macros

##### pageName

`string`

Current page name

##### userContext

`UserContext` = `null`

User context for authentication variables

##### requestInfo

`RequestInfo` = `null`

#### Returns

`Promise`\<`string`\>

Content with expanded macros

***

### expandSystemVariable()

> **expandSystemVariable**(`variable`, `pageName`, `userContext`): `string`

Defined in: [src/managers/RenderingManager.ts:864](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/managers/RenderingManager.ts#L864)

Expand a single JSPWiki-style system variable

#### Parameters

##### variable

`string`

The variable name (including $)

##### pageName

`string`

Current page name

##### userContext

`UserContext` = `null`

User context for authentication variables

#### Returns

`string`

Expanded value

***

### expandSystemVariables()

> **expandSystemVariables**(`content`): `string`

Defined in: [src/managers/RenderingManager.ts:964](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/managers/RenderingManager.ts#L964)

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

Defined in: [src/managers/RenderingManager.ts:1010](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/managers/RenderingManager.ts#L1010)

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

Defined in: [src/managers/RenderingManager.ts:642](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/managers/RenderingManager.ts#L642)

Generate styled table HTML with CSS

#### Parameters

##### metadata

`TableParams` & `object`

Table styling metadata

#### Returns

`string`

Styled table opening tag with CSS

***

### getApplicationVersion()

> **getApplicationVersion**(): `string`

Defined in: [src/managers/RenderingManager.ts:935](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/managers/RenderingManager.ts#L935)

Get application version from package.json

#### Returns

`string`

Application version

***

### getBaseUrl()

> **getBaseUrl**(): `string`

Defined in: [src/managers/RenderingManager.ts:1028](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/managers/RenderingManager.ts#L1028)

Get the base URL for the application

#### Returns

`string`

Base URL

***

### getEngine()

> **getEngine**(): [`WikiEngine`](../../../types/WikiEngine/interfaces/WikiEngine.md)

Defined in: [src/managers/BaseManager.ts:126](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/managers/BaseManager.ts#L126)

Get the wiki engine instance

#### Returns

[`WikiEngine`](../../../types/WikiEngine/interfaces/WikiEngine.md)

The wiki engine instance

#### Example

```ts
const config = this.getEngine().getConfig();
```

#### Inherited from

[`default`](../../BaseManager/classes/default.md).[`getEngine`](../../BaseManager/classes/default.md#getengine)

***

### getLinkGraph()

> **getLinkGraph**(): `LinkGraph`

Defined in: [src/managers/RenderingManager.ts:1265](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/managers/RenderingManager.ts#L1265)

Get link graph

#### Returns

`LinkGraph`

Link graph object

***

### getLoginStatus()

> **getLoginStatus**(`userContext`): `string`

Defined in: [src/managers/RenderingManager.ts:1325](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/managers/RenderingManager.ts#L1325)

Get current login status from user context

#### Parameters

##### userContext

`UserContext`

User context object

#### Returns

`string`

Login status description

***

### getParser()

> **getParser**(): `any`

Defined in: [src/managers/RenderingManager.ts:241](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/managers/RenderingManager.ts#L241)

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

Defined in: [src/managers/RenderingManager.ts:1284](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/managers/RenderingManager.ts#L1284)

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

Defined in: [src/managers/RenderingManager.ts:907](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/managers/RenderingManager.ts#L907)

Get total pages count
Uses the provider's page cache for an accurate count.
After installation, only counts pages from the main pages directory.

#### Returns

`number`

Number of pages

***

### getUptime()

> **getUptime**(): `number`

Defined in: [src/managers/RenderingManager.ts:925](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/managers/RenderingManager.ts#L925)

Get server uptime in seconds

#### Returns

`number`

Uptime in seconds

***

### getUserName()

> **getUserName**(`userContext`): `string`

Defined in: [src/managers/RenderingManager.ts:1304](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/managers/RenderingManager.ts#L1304)

Get current username from user context

#### Parameters

##### userContext

`UserContext`

User context object

#### Returns

`string`

Username or "Anonymous"

***

### initialize()

> **initialize**(`config?`): `Promise`\<`void`\>

Defined in: [src/managers/RenderingManager.ts:182](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/managers/RenderingManager.ts#L182)

Initialize the RenderingManager

Sets up the markdown converter, link parser, and rendering configuration.
Determines whether to use the advanced MarkupParser or legacy Showdown converter.

#### Parameters

##### config?

`Record`\<`string`, `unknown`\> = `{}`

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

[`default`](../../BaseManager/classes/default.md).[`initialize`](../../BaseManager/classes/default.md#initialize)

***

### initializeLinkParser()

> **initializeLinkParser**(): `void`

Defined in: [src/managers/RenderingManager.ts:1232](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/managers/RenderingManager.ts#L1232)

Initialize LinkParser with page names and configuration

#### Returns

`void`

***

### isInitialized()

> **isInitialized**(): `boolean`

Defined in: [src/managers/BaseManager.ts:114](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/managers/BaseManager.ts#L114)

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

[`default`](../../BaseManager/classes/default.md).[`isInitialized`](../../BaseManager/classes/default.md#isinitialized)

***

### parseTableParameters()

> **parseTableParameters**(`paramString`): `TableParams`

Defined in: [src/managers/RenderingManager.ts:533](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/managers/RenderingManager.ts#L533)

Parse table parameters from JSPWiki Table plugin syntax

#### Parameters

##### paramString

`string`

Parameter string

#### Returns

`TableParams`

Parsed parameters

***

### performPerformanceComparison()

> **performPerformanceComparison**(`content`, `pageName`, `userContext`, `requestInfo`, `advancedTime`): `Promise`\<`void`\>

Defined in: [src/managers/RenderingManager.ts:429](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/managers/RenderingManager.ts#L429)

Perform performance comparison between advanced and legacy parsers (modular benchmarking)

#### Parameters

##### content

`string`

Content that was parsed

##### pageName

`string`

Page name

##### userContext

`UserContext`

User context

##### requestInfo

`RequestInfo`

Request information

##### advancedTime

`number`

Time taken by advanced parser

#### Returns

`Promise`\<`void`\>

***

### postProcessTables()

> **postProcessTables**(`html`): `string`

Defined in: [src/managers/RenderingManager.ts:622](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/managers/RenderingManager.ts#L622)

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

Defined in: [src/managers/RenderingManager.ts:469](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/managers/RenderingManager.ts#L469)

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

Defined in: [src/managers/RenderingManager.ts:498](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/managers/RenderingManager.ts#L498)

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

Defined in: [src/managers/RenderingManager.ts:1041](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/managers/RenderingManager.ts#L1041)

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

Defined in: [src/managers/RenderingManager.ts:1272](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/managers/RenderingManager.ts#L1272)

Rebuild link graph (called after page changes)

#### Returns

`Promise`\<`void`\>

***

### renderMarkdown()

> **renderMarkdown**(`content`, `pageName`, `userContext`, `requestInfo`): `Promise`\<`string`\>

Defined in: [src/managers/RenderingManager.ts:307](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/managers/RenderingManager.ts#L307)

Render markdown content to HTML with MarkupParser integration

#### Parameters

##### content

`string`

Markdown content

##### pageName

`string`

Current page name

##### userContext

`UserContext` = `null`

User context for authentication variables

##### requestInfo

`RequestInfo` = `null`

Request information

#### Returns

`Promise`\<`string`\>

Rendered HTML

***

### renderPlugins()

> **renderPlugins**(`content`, `pageName`): `Promise`\<`string`\>

Defined in: [src/managers/RenderingManager.ts:1367](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/managers/RenderingManager.ts#L1367)

Render plugins (JSPWiki-style plugins)

#### Parameters

##### content

`string`

Content with plugin syntax

##### pageName

`string`

Page name for plugin context

#### Returns

`Promise`\<`string`\>

Content with rendered plugins

***

### renderPreview()

> **renderPreview**(`content`, `pageName`, `userContext`): `Promise`\<`string`\>

Defined in: [src/managers/RenderingManager.ts:1295](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/managers/RenderingManager.ts#L1295)

Render page preview

#### Parameters

##### content

`string`

Markdown content

##### pageName

`string`

Page name for context

##### userContext

`UserContext` = `null`

User context for authentication variables

#### Returns

`Promise`\<`string`\>

Rendered HTML preview

***

### renderWikiLinks()

> **renderWikiLinks**(`content`): `string`

Defined in: [src/managers/RenderingManager.ts:1346](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/managers/RenderingManager.ts#L1346)

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

Defined in: [src/managers/RenderingManager.ts:346](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/managers/RenderingManager.ts#L346)

Render content using the advanced MarkupParser system

#### Parameters

##### content

`string`

Content to render

##### pageName

`string`

Page name

##### userContext

`UserContext`

User context

##### requestInfo

`RequestInfo`

Request information

#### Returns

`Promise`\<`string`\>

Rendered HTML

***

### renderWithLegacyParser()

> **renderWithLegacyParser**(`content`, `pageName`, `userContext`, `requestInfo`): `Promise`\<`string`\>

Defined in: [src/managers/RenderingManager.ts:396](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/managers/RenderingManager.ts#L396)

Render content using the legacy rendering system (backward compatibility)

#### Parameters

##### content

`string`

Content to render

##### pageName

`string`

Page name

##### userContext

`UserContext`

User context

##### requestInfo

`RequestInfo`

Request information

#### Returns

`Promise`\<`string`\>

Rendered HTML

***

### restore()

> **restore**(`backupData`): `Promise`\<`void`\>

Defined in: [src/managers/BaseManager.ts:196](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/managers/BaseManager.ts#L196)

Restore manager data from backup

MUST be overridden by all managers that manage persistent data.
Default implementation only validates that backup data is provided.

#### Parameters

##### backupData

[`BackupData`](../../BaseManager/interfaces/BackupData.md)

Backup data object from backup() method

#### Returns

`Promise`\<`void`\>

#### Throws

If restore operation fails or backup data is missing

#### Example

```ts
async restore(backupData: BackupData): Promise<void> {
  if (!backupData || !backupData.data) {
    throw new Error('Invalid backup data');
  }
  this.users = new Map(backupData.data.users.map(u => [u.id, u]));
  this.settings = backupData.data.settings;
}
```

#### Inherited from

[`default`](../../BaseManager/classes/default.md).[`restore`](../../BaseManager/classes/default.md#restore)

***

### shutdown()

> **shutdown**(): `Promise`\<`void`\>

Defined in: [src/managers/BaseManager.ts:143](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/managers/BaseManager.ts#L143)

Shutdown the manager and cleanup resources

Override this method in subclasses to perform cleanup logic.
Always call super.shutdown() at the end of overridden implementations.

#### Returns

`Promise`\<`void`\>

#### Example

```ts
async shutdown(): Promise<void> {
  // Your cleanup logic here
  await this.closeConnections();
  await super.shutdown();
}
```

#### Inherited from

[`default`](../../BaseManager/classes/default.md).[`shutdown`](../../BaseManager/classes/default.md#shutdown)

***

### textToHTML()

> **textToHTML**(`context`, `content`): `Promise`\<`string`\>

Defined in: [src/managers/RenderingManager.ts:1432](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/managers/RenderingManager.ts#L1432)

Converts wiki markup to HTML using the provided WikiContext.
This is the main entry point for the rendering pipeline.

#### Parameters

##### context

`any`

The context for the rendering operation.

##### content

`string`

The raw wiki markup to render.

#### Returns

`Promise`\<`string`\>

The rendered HTML.
