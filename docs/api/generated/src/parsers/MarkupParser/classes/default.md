[**amdWiki API v1.5.0**](../../../../README.md)

***

[amdWiki API](../../../../README.md) / [src/parsers/MarkupParser](../README.md) / default

# Class: default

Defined in: [src/parsers/MarkupParser.ts:284](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/parsers/MarkupParser.ts#L284)

MarkupParser - Comprehensive markup parsing engine for JSPWiki compatibility

============================================================================
RENDERING PIPELINE (Issue #120, Issue #185):
============================================================================

**WikiDocument DOM Extraction Pipeline** (Issues #115-#120):
1. Extract JSPWiki syntax before markdown parsing (extractJSPWikiSyntax())
2. Create WikiDocument DOM nodes (createDOMNode())
3. Parse markdown with Showdown (makeHtml())
4. Merge DOM nodes into HTML (mergeDOMNodes())

This pipeline fixes the markdown heading bug (#110, #93) and provides
robust JSPWiki syntax processing without order dependencies.

The legacy 7-phase string-based pipeline was removed in Issue #185.

============================================================================

Related Issues:
- #185 - Remove deprecated 7-phase legacy parser pipeline
- #114 - WikiDocument DOM Solution (Epic)
- #115-#120 - Implementation Phases
- #110, #93 - Markdown heading bug fixes

## Extends

- [`default`](../../../managers/BaseManager/classes/default.md)

## Constructors

### Constructor

> **new default**(`engine`): `MarkupParser`

Defined in: [src/parsers/MarkupParser.ts:318](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/parsers/MarkupParser.ts#L318)

Creates a new MarkupParser instance

#### Parameters

##### engine

`any`

#### Returns

`MarkupParser`

#### Overrides

[`default`](../../../managers/BaseManager/classes/default.md).[`constructor`](../../../managers/BaseManager/classes/default.md#constructor)

## Properties

### cache

> **cache**: [`default`](../../../cache/RegionCache/classes/default.md)

Defined in: [src/parsers/MarkupParser.ts:292](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/parsers/MarkupParser.ts#L292)

Parse result cache

***

### cacheStrategies

> **cacheStrategies**: `Record`\<`string`, [`default`](../../../cache/RegionCache/classes/default.md)\>

Defined in: [src/parsers/MarkupParser.ts:295](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/parsers/MarkupParser.ts#L295)

Caching strategies by content type

***

### config?

> `protected` `optional` **config**: `Record`\<`string`, `any`\>

Defined in: [src/managers/BaseManager.ts:63](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/managers/BaseManager.ts#L63)

Configuration passed during initialization

#### Inherited from

[`default`](../../../managers/BaseManager/classes/default.md).[`config`](../../../managers/BaseManager/classes/default.md#config)

***

### domLinkHandler

> **domLinkHandler**: [`default`](../../dom/handlers/DOMLinkHandler/classes/default.md)

Defined in: [src/parsers/MarkupParser.ts:313](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/parsers/MarkupParser.ts#L313)

Link resolution handler

***

### domParser

> **domParser**: [`DOMParser`](../../dom/DOMParser/classes/DOMParser.md)

Defined in: [src/parsers/MarkupParser.ts:304](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/parsers/MarkupParser.ts#L304)

DOM-based parser for JSPWiki syntax

***

### domPluginHandler

> **domPluginHandler**: [`default`](../../dom/handlers/DOMPluginHandler/classes/default.md)

Defined in: [src/parsers/MarkupParser.ts:310](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/parsers/MarkupParser.ts#L310)

Plugin execution handler

***

### domVariableHandler

> **domVariableHandler**: [`default`](../../dom/handlers/DOMVariableHandler/classes/default.md)

Defined in: [src/parsers/MarkupParser.ts:307](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/parsers/MarkupParser.ts#L307)

Variable expansion handler

***

### engine

> `protected` **engine**: [`WikiEngine`](../../../types/WikiEngine/interfaces/WikiEngine.md)

Defined in: [src/managers/BaseManager.ts:56](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/managers/BaseManager.ts#L56)

Reference to the wiki engine

#### Inherited from

[`default`](../../../managers/BaseManager/classes/default.md).[`engine`](../../../managers/BaseManager/classes/default.md#engine)

***

### filterChain

> **filterChain**: [`default`](../../filters/FilterChain/classes/default.md)

Defined in: [src/parsers/MarkupParser.ts:289](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/parsers/MarkupParser.ts#L289)

Content filter chain

***

### handlerRegistry

> **handlerRegistry**: [`HandlerRegistry`](../../handlers/HandlerRegistry/classes/HandlerRegistry.md)

Defined in: [src/parsers/MarkupParser.ts:286](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/parsers/MarkupParser.ts#L286)

Handler registry for syntax handlers

***

### initialized

> `protected` **initialized**: `boolean`

Defined in: [src/managers/BaseManager.ts:59](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/managers/BaseManager.ts#L59)

Initialization status flag

#### Inherited from

[`default`](../../../managers/BaseManager/classes/default.md).[`initialized`](../../../managers/BaseManager/classes/default.md#initialized)

***

### metrics

> **metrics**: [`ParserMetrics`](../interfaces/ParserMetrics.md)

Defined in: [src/parsers/MarkupParser.ts:301](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/parsers/MarkupParser.ts#L301)

Parser performance metrics

***

### performanceMonitor

> **performanceMonitor**: [`PerformanceMonitor`](../interfaces/PerformanceMonitor.md)

Defined in: [src/parsers/MarkupParser.ts:298](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/parsers/MarkupParser.ts#L298)

Performance monitoring state

## Methods

### backup()

> **backup**(): `Promise`\<[`BackupData`](../../../managers/BaseManager/interfaces/BackupData.md)\>

Defined in: [src/managers/BaseManager.ts:168](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/managers/BaseManager.ts#L168)

Backup manager data

MUST be overridden by all managers that manage persistent data.
Default implementation returns an empty backup object.

#### Returns

`Promise`\<[`BackupData`](../../../managers/BaseManager/interfaces/BackupData.md)\>

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

[`default`](../../../managers/BaseManager/classes/default.md).[`backup`](../../../managers/BaseManager/classes/default.md#backup)

***

### cacheHandlerResult()

> **cacheHandlerResult**(`handlerId`, `contentHash`, `contextHash`, `result`): `Promise`\<`void`\>

Defined in: [src/parsers/MarkupParser.ts:1531](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/parsers/MarkupParser.ts#L1531)

Cache handler result

#### Parameters

##### handlerId

`any`

Handler ID

##### contentHash

`any`

Content hash

##### contextHash

`any`

Context hash

##### result

`any`

Result to cache

#### Returns

`Promise`\<`void`\>

***

### cacheParseResult()

> **cacheParseResult**(`cacheKey`, `content`): `Promise`\<`void`\>

Defined in: [src/parsers/MarkupParser.ts:1480](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/parsers/MarkupParser.ts#L1480)

Cache parse result

#### Parameters

##### cacheKey

`any`

Cache key

##### content

`any`

Content to cache

#### Returns

`Promise`\<`void`\>

***

### checkPerformanceThresholds()

> **checkPerformanceThresholds**(): `void`

Defined in: [src/parsers/MarkupParser.ts:1592](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/parsers/MarkupParser.ts#L1592)

Check performance thresholds and generate alerts

#### Returns

`void`

***

### clearPerformanceAlerts()

> **clearPerformanceAlerts**(): `void`

Defined in: [src/parsers/MarkupParser.ts:1687](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/parsers/MarkupParser.ts#L1687)

Clear performance alerts

#### Returns

`void`

***

### createDOMNode()

> **createDOMNode**(`element`, `context`, `wikiDocument`): `Promise`\<`any`\>

Defined in: [src/parsers/MarkupParser.ts:1212](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/parsers/MarkupParser.ts#L1212)

Creates a DOM node from an extracted element (Phase 2 dispatcher)

This is the dispatcher method for Phase 2 that routes extracted elements
to the appropriate handler based on element type.

#### Parameters

##### element

`any`

Extracted element from extractJSPWikiSyntax()

##### context

`any`

Rendering context

##### wikiDocument

`any`

WikiDocument to create node in

#### Returns

`Promise`\<`any`\>

DOM node for the element

#### Example

```ts
const element = { type: 'variable', varName: '$username', id: 0 };
const node = await createDOMNode(element, context, wikiDoc);
// Returns: <span class="wiki-variable">JohnDoe</span>
```

***

### createTextNodeForEscaped()

> **createTextNodeForEscaped**(`element`, `wikiDocument`): `any`

Defined in: [src/parsers/MarkupParser.ts:1182](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/parsers/MarkupParser.ts#L1182)

Creates a text node for escaped JSPWiki syntax

This is a helper method for Phase 2 DOM node creation (Issue #116).
Escaped syntax like [[{$var}]] should render as literal text [{$var}].

#### Parameters

##### element

`any`

Extracted escaped element

##### wikiDocument

`any`

WikiDocument to create node in

#### Returns

`any`

DOM node containing the escaped literal text

#### Example

```ts
const element = { type: 'escaped', literal: '[{$username}]', id: 0, ... };
const node = createTextNodeForEscaped(element, wikiDoc);
// Returns: <span class="wiki-escaped" data-jspwiki-id="0">[{$username}]</span>
```

***

### disableHandler()

> **disableHandler**(`handlerId`): `boolean`

Defined in: [src/parsers/MarkupParser.ts:1014](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/parsers/MarkupParser.ts#L1014)

Disable handler by ID

#### Parameters

##### handlerId

`any`

Handler identifier

#### Returns

`boolean`

- True if successful

***

### enableHandler()

> **enableHandler**(`handlerId`): `boolean`

Defined in: [src/parsers/MarkupParser.ts:1005](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/parsers/MarkupParser.ts#L1005)

Enable handler by ID

#### Parameters

##### handlerId

`any`

Handler identifier

#### Returns

`boolean`

- True if successful

***

### extractJSPWikiSyntax()

> **extractJSPWikiSyntax**(`content`, `_context`): `object`

Defined in: [src/parsers/MarkupParser.ts:1067](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/parsers/MarkupParser.ts#L1067)

Extract JSPWiki-specific syntax from content for DOM-based processing

This method implements the pre-extraction strategy from Issue #114.
Instead of tokenizing both markdown and JSPWiki syntax (which causes conflicts),
we extract ONLY JSPWiki syntax and let Showdown handle all markdown.

Extraction order:
1. Variables: [{$username}] → __JSPWIKI_uuid_0__
2. Plugins: [{TableOfContents}] → __JSPWIKI_uuid_1__
3. Escaped: [[{$var}] → __JSPWIKI_uuid_2__ (stores literal [{$var}])
4. Wiki links: [PageName] → __JSPWIKI_uuid_3__ (but not markdown [text](url))

Code blocks are already protected by Phase 1 preprocessing, so JSPWiki syntax
inside code blocks won't be extracted.

#### Parameters

##### content

`any`

Raw wiki content

##### \_context

#### Returns

`object`

- { sanitized, jspwikiElements, uuid }

Related: #114 (WikiDocument DOM Solution), #115 (Phase 1 Implementation)

##### jspwikiElements

> **jspwikiElements**: `any`[]

##### sanitized

> **sanitized**: `any`

##### uuid

> **uuid**: `any`

#### Example

```ts
const input = "## Heading\n\nUser: [{$username}]";
const { sanitized, jspwikiElements, uuid } = parser.extractJSPWikiSyntax(input);
// sanitized: "## Heading\n\nUser: <span data-jspwiki-placeholder="abc123-0"></span>"
// jspwikiElements: [{ type: 'variable', varName: '$username', id: 0, ... }]
// uuid: "abc123"
```

***

### generateCacheKey()

> **generateCacheKey**(`content`, `context`): `string`

Defined in: [src/parsers/MarkupParser.ts:1024](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/parsers/MarkupParser.ts#L1024)

Generate cache key for content and context

#### Parameters

##### content

`any`

Content to cache

##### context

`any`

Parse context

#### Returns

`string`

- Cache key

***

### generatePerformanceAlert()

> **generatePerformanceAlert**(`type`, `message`): `void`

Defined in: [src/parsers/MarkupParser.ts:1646](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/parsers/MarkupParser.ts#L1646)

Generate performance alert

#### Parameters

##### type

`any`

Alert type

##### message

`any`

Alert message

#### Returns

`void`

***

### getCachedHandlerResult()

> **getCachedHandlerResult**(`handlerId`, `contentHash`, `contextHash`): `Promise`\<`unknown`\>

Defined in: [src/parsers/MarkupParser.ts:1502](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/parsers/MarkupParser.ts#L1502)

Get cached handler result

#### Parameters

##### handlerId

`any`

Handler ID

##### contentHash

`any`

Content hash

##### contextHash

`any`

Context hash

#### Returns

`Promise`\<`unknown`\>

- Cached result or null

***

### getCachedParseResult()

> **getCachedParseResult**(`cacheKey`): `Promise`\<`unknown`\>

Defined in: [src/parsers/MarkupParser.ts:1462](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/parsers/MarkupParser.ts#L1462)

Get cached parse result

#### Parameters

##### cacheKey

`any`

Cache key

#### Returns

`Promise`\<`unknown`\>

- Cached result or null

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

[`default`](../../../managers/BaseManager/classes/default.md).[`getEngine`](../../../managers/BaseManager/classes/default.md#getengine)

***

### getHandler()

> **getHandler**(`handlerId`): [`default`](../../handlers/BaseSyntaxHandler/classes/default.md)

Defined in: [src/parsers/MarkupParser.ts:987](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/parsers/MarkupParser.ts#L987)

Get handler by ID

#### Parameters

##### handlerId

`any`

Handler identifier

#### Returns

[`default`](../../handlers/BaseSyntaxHandler/classes/default.md)

- Handler or null if not found

***

### getHandlerConfig()

> **getHandlerConfig**(`handlerType`): `any`

Defined in: [src/parsers/MarkupParser.ts:969](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/parsers/MarkupParser.ts#L969)

Get configuration for a specific handler type

#### Parameters

##### handlerType

`any`

Handler type (plugin, wikitag, etc.)

#### Returns

`any`

- Handler configuration

***

### getHandlers()

> **getHandlers**(`enabledOnly`): [`default`](../../handlers/BaseSyntaxHandler/classes/default.md)[]

Defined in: [src/parsers/MarkupParser.ts:996](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/parsers/MarkupParser.ts#L996)

Get all handlers sorted by priority

#### Parameters

##### enabledOnly

`boolean` = `true`

Only return enabled handlers

#### Returns

[`default`](../../handlers/BaseSyntaxHandler/classes/default.md)[]

- Handlers sorted by priority

***

### getHandlerTypeFromId()

> **getHandlerTypeFromId**(`handlerId`): `any`

Defined in: [src/parsers/MarkupParser.ts:941](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/parsers/MarkupParser.ts#L941)

Get handler type from handler ID for configuration lookup (modular mapping)

#### Parameters

##### handlerId

`any`

Handler ID

#### Returns

`any`

- Handler type or null

***

### getMetrics()

> **getMetrics**(): [`ExtendedMetrics`](../interfaces/ExtendedMetrics.md)

Defined in: [src/parsers/MarkupParser.ts:1386](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/parsers/MarkupParser.ts#L1386)

Get performance metrics

#### Returns

[`ExtendedMetrics`](../interfaces/ExtendedMetrics.md)

***

### getPerformanceAlerts()

> **getPerformanceAlerts**(): [`PerformanceAlert`](../interfaces/PerformanceAlert.md)[]

Defined in: [src/parsers/MarkupParser.ts:1680](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/parsers/MarkupParser.ts#L1680)

Get performance alerts

#### Returns

[`PerformanceAlert`](../interfaces/PerformanceAlert.md)[]

- Array of performance alerts

***

### initialize()

> **initialize**(`config`): `Promise`\<`void`\>

Defined in: [src/parsers/MarkupParser.ts:356](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/parsers/MarkupParser.ts#L356)

Initialize the MarkupParser

#### Parameters

##### config

`Partial`\<[`MarkupParserConfig`](../interfaces/MarkupParserConfig.md)\> = `{}`

#### Returns

`Promise`\<`void`\>

#### Overrides

[`default`](../../../managers/BaseManager/classes/default.md).[`initialize`](../../../managers/BaseManager/classes/default.md#initialize)

***

### initializeAdvancedCaching()

> **initializeAdvancedCaching**(): `Promise`\<`void`\>

Defined in: [src/parsers/MarkupParser.ts:704](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/parsers/MarkupParser.ts#L704)

Initialize advanced caching integration with multiple cache strategies

#### Returns

`Promise`\<`void`\>

***

### initializeFilterChain()

> **initializeFilterChain**(): `Promise`\<`void`\>

Defined in: [src/parsers/MarkupParser.ts:398](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/parsers/MarkupParser.ts#L398)

Initialize filter chain with modular configuration

#### Returns

`Promise`\<`void`\>

***

### initializePerformanceMonitoring()

> **initializePerformanceMonitoring**(): `void`

Defined in: [src/parsers/MarkupParser.ts:759](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/parsers/MarkupParser.ts#L759)

Initialize performance monitoring system

#### Returns

`void`

***

### isInitialized()

> **isInitialized**(): `boolean`

Defined in: [src/parsers/MarkupParser.ts:391](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/parsers/MarkupParser.ts#L391)

Check if MarkupParser is initialized (required for RenderingManager integration)

#### Returns

`boolean`

- True if initialized

#### Overrides

[`default`](../../../managers/BaseManager/classes/default.md).[`isInitialized`](../../../managers/BaseManager/classes/default.md#isinitialized)

***

### loadConfiguration()

> **loadConfiguration**(): `Promise`\<`void`\>

Defined in: [src/parsers/MarkupParser.ts:576](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/parsers/MarkupParser.ts#L576)

Load configuration from ConfigurationManager

#### Returns

`Promise`\<`void`\>

***

### mergeDOMNodes()

> **mergeDOMNodes**(`html`, `nodes`, `uuid`): `any`

Defined in: [src/parsers/MarkupParser.ts:1261](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/parsers/MarkupParser.ts#L1261)

Merges DOM nodes back into Showdown-generated HTML (Phase 3)

Replaces HTML comment placeholders (<!--JSPWIKI-uuid-id-->) in the HTML with
the rendered DOM nodes. Processes nodes in reverse ID order to
handle nested JSPWiki syntax correctly.

Uses HTML comments as placeholders to avoid Showdown interpreting them as markdown.

#### Parameters

##### html

`any`

HTML from Showdown with placeholders

##### nodes

`any`

Array of DOM nodes with data-jspwiki-id

##### uuid

`any`

UUID from extraction phase

#### Returns

`any`

Final HTML with nodes merged in

#### Example

```ts
// Input HTML: "<p>User: <!--JSPWIKI-abc123-0--></p>"
// Node 0: <span data-jspwiki-id="0">JohnDoe</span>
// Output: "<p>User: <span>JohnDoe</span></p>"
```

***

### parse()

> **parse**(`content`, `context`): `Promise`\<`any`\>

Defined in: [src/parsers/MarkupParser.ts:852](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/parsers/MarkupParser.ts#L852)

Main parsing method - uses WikiDocument DOM extraction pipeline

#### Parameters

##### content

`any`

Raw content to parse

##### context

Parsing context (page, user, etc.)

#### Returns

`Promise`\<`any`\>

- Processed HTML content

***

### parseWithDOMExtraction()

> **parseWithDOMExtraction**(`content`, `context`): `Promise`\<`any`\>

Defined in: [src/parsers/MarkupParser.ts:1324](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/parsers/MarkupParser.ts#L1324)

Parses wiki markup using DOM extraction strategy (Phase 1-3)

This is the new parsing method that implements the WikiDocument DOM solution:
1. Extract JSPWiki syntax (variables, plugins, links, escaped)
2. Create DOM nodes from extracted elements
3. Let Showdown parse the sanitized markdown
4. Merge DOM nodes back into the HTML

This approach fixes the markdown heading bug by letting Showdown handle
ALL markdown parsing while WikiDocument handles ONLY JSPWiki syntax.

#### Parameters

##### content

`any`

Wiki markup content

##### context

`any`

Rendering context

#### Returns

`Promise`\<`any`\>

Rendered HTML

#### Example

```ts
const html = await parser.parseWithDOMExtraction('## Hello\nUser: [{$username}]', context);
// Returns: "<h2>Hello</h2>\n<p>User: <span>JohnDoe</span></p>"
```

***

### performCacheWarmup()

> **performCacheWarmup**(): `Promise`\<`void`\>

Defined in: [src/parsers/MarkupParser.ts:781](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/parsers/MarkupParser.ts#L781)

Perform cache warmup for frequently accessed content

#### Returns

`Promise`\<`void`\>

***

### registerDefaultFilters()

> **registerDefaultFilters**(): `Promise`\<`void`\>

Defined in: [src/parsers/MarkupParser.ts:417](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/parsers/MarkupParser.ts#L417)

Register default filters based on modular configuration

#### Returns

`Promise`\<`void`\>

***

### registerDefaultHandlers()

> **registerDefaultHandlers**(): `Promise`\<`void`\>

Defined in: [src/parsers/MarkupParser.ts:464](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/parsers/MarkupParser.ts#L464)

Register default syntax handlers based on configuration

#### Returns

`Promise`\<`void`\>

***

### registerHandler()

> **registerHandler**(`handler`, `options`): `Promise`\<`boolean`\>

Defined in: [src/parsers/MarkupParser.ts:925](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/parsers/MarkupParser.ts#L925)

Register a syntax handler

#### Parameters

##### handler

`any`

Handler instance

##### options

Registration options

#### Returns

`Promise`\<`boolean`\>

- True if registration successful

***

### resetMetrics()

> **resetMetrics**(): `void`

Defined in: [src/parsers/MarkupParser.ts:1446](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/parsers/MarkupParser.ts#L1446)

Reset performance metrics

#### Returns

`void`

***

### resolveSystemVariable()

> **resolveSystemVariable**(`varName`, `context`): `Promise`\<`any`\>

Defined in: [src/parsers/MarkupParser.ts:830](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/parsers/MarkupParser.ts#L830)

Resolve system variable for cache warmup

#### Parameters

##### varName

`any`

Variable name

##### context

`any`

Context object

#### Returns

`Promise`\<`any`\>

- Variable value

***

### restore()

> **restore**(`backupData`): `Promise`\<`void`\>

Defined in: [src/managers/BaseManager.ts:196](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/managers/BaseManager.ts#L196)

Restore manager data from backup

MUST be overridden by all managers that manage persistent data.
Default implementation only validates that backup data is provided.

#### Parameters

##### backupData

[`BackupData`](../../../managers/BaseManager/interfaces/BackupData.md)

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

[`default`](../../../managers/BaseManager/classes/default.md).[`restore`](../../../managers/BaseManager/classes/default.md#restore)

***

### shutdown()

> **shutdown**(): `Promise`\<`void`\>

Defined in: [src/parsers/MarkupParser.ts:1693](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/parsers/MarkupParser.ts#L1693)

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

#### Overrides

[`default`](../../../managers/BaseManager/classes/default.md).[`shutdown`](../../../managers/BaseManager/classes/default.md#shutdown)

***

### unregisterHandler()

> **unregisterHandler**(`handlerId`): `Promise`\<`boolean`\>

Defined in: [src/parsers/MarkupParser.ts:978](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/parsers/MarkupParser.ts#L978)

Unregister a syntax handler

#### Parameters

##### handlerId

`any`

Handler identifier

#### Returns

`Promise`\<`boolean`\>

- True if unregistration successful

***

### updateCacheMetrics()

> **updateCacheMetrics**(`strategy`, `operation`): `void`

Defined in: [src/parsers/MarkupParser.ts:1552](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/parsers/MarkupParser.ts#L1552)

Update cache metrics for specific strategy

#### Parameters

##### strategy

`any`

Cache strategy name

##### operation

`any`

Operation type (hit, miss, set)

#### Returns

`void`

***

### updatePerformanceMetrics()

> **updatePerformanceMetrics**(`processingTime`, `cacheHit`): `void`

Defined in: [src/parsers/MarkupParser.ts:1568](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/parsers/MarkupParser.ts#L1568)

Update performance metrics and check thresholds

#### Parameters

##### processingTime

`any`

Processing time in milliseconds

##### cacheHit

`any`

Whether this was a cache hit

#### Returns

`void`
