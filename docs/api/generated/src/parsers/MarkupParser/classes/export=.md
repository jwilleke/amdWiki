[**amdWiki API v1.5.0**](../../../../README.md)

***

[amdWiki API](../../../../README.md) / [src/parsers/MarkupParser](../README.md) / export=

# Class: export=

Defined in: [src/parsers/MarkupParser.js:80](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/MarkupParser.js#L80)

MarkupParser - Comprehensive markup parsing engine for JSPWiki compatibility

============================================================================
RENDERING PIPELINE (Phase 6, Issue #120)
============================================================================

**PRIMARY PIPELINE (Default):** WikiDocument DOM Extraction (Issues #115-#120)

1. Extract JSPWiki syntax before markdown parsing (extractJSPWikiSyntax())
2. Create WikiDocument DOM nodes (createDOMNode())
3. Parse markdown with Showdown (makeHtml())
4. Merge DOM nodes into HTML (mergeDOMNodes())

This pipeline fixes the markdown heading bug (#110, #93) and provides
robust JSPWiki syntax processing without order dependencies.

**Configuration:** Set `jspwiki.parser.useExtractionPipeline = true` (default)

============================================================================
LEGACY PIPELINE (Deprecated, Fallback Only)
============================================================================

**@deprecated** The 7-phase string-based pipeline below is DEPRECATED and
kept only for backward compatibility and emergency fallback. It suffers from:

- Order dependency issues
- Markdown/JSPWiki conflicts (heading bug)
- Fragile string manipulation

Legacy 7-phase processing pipeline:

1. Preprocessing - Escape handling, code block protection
2. Syntax Recognition - Pattern detection and tokenization
3. Context Resolution - Variable expansion, parameter resolution
4. Content Transformation - Handler execution
5. Filter Pipeline - Content filtering and validation
6. Markdown Conversion - Showdown processing
7. Post-processing - Cleanup and validation

**Configuration:** Set `jspwiki.parser.useExtractionPipeline = false` to use legacy

============================================================================

 MarkupParser

## See

- [BaseManager](../../../managers/BaseManager/classes/export=.md) for base functionality
- RenderingManager for integration

## Example

```ts
const markupParser = engine.getManager('MarkupParser');
const html = await markupParser.parse(content, { pageName: 'Main' });

Related Issues:
- #114 - WikiDocument DOM Solution (Epic)
- #115-#120 - Implementation Phases
- #110, #93 - Markdown heading bug fixes
- #55 - Core Infrastructure and Phase System (original)
- #41 - JSPWikiMarkupParser Enhancement (original epic)
```

## Extends

- [`export=`](../../../managers/BaseManager/classes/export=.md)

## Constructors

### Constructor

> **new export=**(`engine`): `MarkupParser`

Defined in: [src/parsers/MarkupParser.js:87](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/MarkupParser.js#L87)

Creates a new MarkupParser instance

#### Parameters

##### engine

`WikiEngine`

The wiki engine instance

#### Returns

`MarkupParser`

#### Overrides

[`export=`](../../../managers/BaseManager/classes/export=.md).[`constructor`](../../../managers/BaseManager/classes/export=.md#constructor)

## Properties

### cache

> **cache**: `any`

Defined in: [src/parsers/MarkupParser.js:92](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/MarkupParser.js#L92)

Parse result cache

***

### cacheStrategies

> **cacheStrategies**: `object`

Defined in: [src/parsers/MarkupParser.js:93](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/MarkupParser.js#L93)

Caching strategies by content type

***

### config

> **config**: `any`

Defined in: [src/managers/BaseManager.js:55](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/managers/BaseManager.js#L55)

Configuration object passed during initialization

#### Inherited from

[`export=`](../../../managers/BaseManager/classes/export=.md).[`config`](../../../managers/BaseManager/classes/export=.md#config)

***

### domLinkHandler

> **domLinkHandler**: [`export=`](../../dom/handlers/DOMLinkHandler/classes/export=.md)

Defined in: [src/parsers/MarkupParser.js:118](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/MarkupParser.js#L118)

Link resolution handler

***

### domParser

> **domParser**: [`DOMParser`](../../dom/DOMParser/classes/DOMParser.md)

Defined in: [src/parsers/MarkupParser.js:106](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/MarkupParser.js#L106)

DOM-based parser for JSPWiki syntax

***

### domPluginHandler

> **domPluginHandler**: [`export=`](../../dom/handlers/DOMPluginHandler/classes/export=.md)

Defined in: [src/parsers/MarkupParser.js:115](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/MarkupParser.js#L115)

Plugin execution handler

***

### domVariableHandler

> **domVariableHandler**: [`export=`](../../dom/handlers/DOMVariableHandler/classes/export=.md)

Defined in: [src/parsers/MarkupParser.js:112](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/MarkupParser.js#L112)

Variable expansion handler

***

### engine

> **engine**: `WikiEngine`

Defined in: [src/managers/BaseManager.js:33](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/managers/BaseManager.js#L33)

Reference to the wiki engine

#### Inherited from

[`export=`](../../../managers/BaseManager/classes/export=.md).[`engine`](../../../managers/BaseManager/classes/export=.md#engine)

***

### filterChain

> **filterChain**: [`export=`](../../filters/FilterChain/classes/export=.md)

Defined in: [src/parsers/MarkupParser.js:91](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/MarkupParser.js#L91)

Content filter chain

***

### handlerRegistry

> **handlerRegistry**: [`HandlerRegistry`](../../handlers/HandlerRegistry/classes/HandlerRegistry.md)

Defined in: [src/parsers/MarkupParser.js:90](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/MarkupParser.js#L90)

Registry for syntax handlers

***

### initialized

> **initialized**: `boolean`

Defined in: [src/managers/BaseManager.js:34](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/managers/BaseManager.js#L34)

Flag indicating initialization status

#### Inherited from

[`export=`](../../../managers/BaseManager/classes/export=.md).[`initialized`](../../../managers/BaseManager/classes/export=.md#initialized)

***

### metrics

> **metrics**: `object`

Defined in: [src/parsers/MarkupParser.js:95](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/MarkupParser.js#L95)

Parser performance metrics

#### cacheHits

> **cacheHits**: `number` = `0`

#### cacheMetrics

> **cacheMetrics**: `Map`\<`any`, `any`\>

#### cacheMisses

> **cacheMisses**: `number` = `0`

#### errorCount

> **errorCount**: `number` = `0`

#### parseCount

> **parseCount**: `number` = `0`

#### phaseMetrics

> **phaseMetrics**: `Map`\<`any`, `any`\>

#### totalParseTime

> **totalParseTime**: `number` = `0`

***

### performanceMonitor

> **performanceMonitor**: `object`

Defined in: [src/parsers/MarkupParser.js:94](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/MarkupParser.js#L94)

Performance monitoring

#### alerts

> **alerts**: `any`[] = `[]`

#### checkInterval

> **checkInterval**: `number` = `60000`

#### lastCheck

> **lastCheck**: `number`

#### maxRecentEntries

> **maxRecentEntries**: `number` = `100`

#### recentErrorRates

> **recentErrorRates**: `any`[] = `[]`

#### recentParseTimes

> **recentParseTimes**: `any`[] = `[]`

***

### phases

> **phases**: `any`[]

Defined in: [src/parsers/MarkupParser.js:89](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/MarkupParser.js#L89)

Processing phase definitions

## Methods

### applyTableClasses()

> **applyTableClasses**(`content`): `string`

Defined in: [src/parsers/MarkupParser.js:1219](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/MarkupParser.js#L1219)

Apply table classes from WikiStyleHandler %%TABLE_CLASSES{...}%% markers
Handles multiple consecutive markers by merging all classes

#### Parameters

##### content

`string`

HTML content to process

#### Returns

`string`

Content with classes applied to table elements

***

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

[`export=`](../../../managers/BaseManager/classes/export=.md).[`backup`](../../../managers/BaseManager/classes/export=.md#backup)

***

### cacheHandlerResult()

> **cacheHandlerResult**(`handlerId`, `contentHash`, `contextHash`, `result`): `Promise`\<`void`\>

Defined in: [src/parsers/MarkupParser.js:1995](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/MarkupParser.js#L1995)

Cache handler result

#### Parameters

##### handlerId

`string`

Handler ID

##### contentHash

`string`

Content hash

##### contextHash

`string`

Context hash

##### result

`string`

Result to cache

#### Returns

`Promise`\<`void`\>

***

### cacheParseResult()

> **cacheParseResult**(`cacheKey`, `content`): `Promise`\<`void`\>

Defined in: [src/parsers/MarkupParser.js:1944](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/MarkupParser.js#L1944)

Cache parse result

#### Parameters

##### cacheKey

`string`

Cache key

##### content

`string`

Content to cache

#### Returns

`Promise`\<`void`\>

***

### checkPerformanceThresholds()

> **checkPerformanceThresholds**(): `void`

Defined in: [src/parsers/MarkupParser.js:2056](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/MarkupParser.js#L2056)

Check performance thresholds and generate alerts

#### Returns

`void`

***

### cleanupHtml()

> **cleanupHtml**(`html`): `string`

Defined in: [src/parsers/MarkupParser.js:1808](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/MarkupParser.js#L1808)

Clean up generated HTML

#### Parameters

##### html

`string`

HTML content to clean

#### Returns

`string`

- Cleaned HTML

***

### clearPerformanceAlerts()

> **clearPerformanceAlerts**(): `void`

Defined in: [src/parsers/MarkupParser.js:2151](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/MarkupParser.js#L2151)

Clear performance alerts

#### Returns

`void`

***

### configureHandlerRegistry()

> **configureHandlerRegistry**(): `void`

Defined in: [src/parsers/MarkupParser.js:470](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/MarkupParser.js#L470)

Configure handler registry with loaded configuration

#### Returns

`void`

***

### createDOMNode()

> **createDOMNode**(`element`, `context`, `wikiDocument`): `Promise`\<`Element`\>

Defined in: [src/parsers/MarkupParser.js:1582](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/MarkupParser.js#L1582)

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

`WikiDocument`

WikiDocument to create node in

#### Returns

`Promise`\<`Element`\>

DOM node for the element

#### Example

```ts
const element = { type: 'variable', varName: '$username', id: 0 };
const node = await createDOMNode(element, context, wikiDoc);
// Returns: <span class="wiki-variable">JohnDoe</span>
```

***

### createTextNodeForEscaped()

> **createTextNodeForEscaped**(`element`, `wikiDocument`): `Element`

Defined in: [src/parsers/MarkupParser.js:1552](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/MarkupParser.js#L1552)

Creates a text node for escaped JSPWiki syntax

This is a helper method for Phase 2 DOM node creation (Issue #116).
Escaped syntax like [[{$var}]] should render as literal text [{$var}].

#### Parameters

##### element

`any`

Extracted escaped element

##### wikiDocument

`WikiDocument`

WikiDocument to create node in

#### Returns

`Element`

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

Defined in: [src/parsers/MarkupParser.js:1384](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/MarkupParser.js#L1384)

Disable handler by ID

#### Parameters

##### handlerId

`string`

Handler identifier

#### Returns

`boolean`

- True if successful

***

### enableHandler()

> **enableHandler**(`handlerId`): `boolean`

Defined in: [src/parsers/MarkupParser.js:1375](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/MarkupParser.js#L1375)

Enable handler by ID

#### Parameters

##### handlerId

`string`

Handler identifier

#### Returns

`boolean`

- True if successful

***

### executePhase()

> **executePhase**(`phase`, `content`, `context`): `Promise`\<`string`\>

Defined in: [src/parsers/MarkupParser.js:874](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/MarkupParser.js#L874)

Execute a specific processing phase

#### Parameters

##### phase

`any`

Phase configuration

##### content

`string`

Content to process

##### context

[`export=`](../../context/ParseContext/classes/export=.md)

Parse context

#### Returns

`Promise`\<`string`\>

- Processed content

***

### extractJSPWikiSyntax()

> **extractJSPWikiSyntax**(`content`, `context`): `any`

Defined in: [src/parsers/MarkupParser.js:1437](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/MarkupParser.js#L1437)

Extract JSPWiki-specific syntax from content for DOM-based processing

This method implements the pre-extraction strategy from Issue #114.
Instead of tokenizing both markdown and JSPWiki syntax (which causes conflicts),
we extract ONLY JSPWiki syntax and let Showdown handle all markdown.

Extraction order:

1. Variables: [{$username}] → **JSPWIKI_uuid_0**
2. Plugins: [{TableOfContents}] → **JSPWIKI_uuid_1**
3. Escaped: [[{$var}] → __JSPWIKI_uuid_2__ (stores literal [{$var}])
4. Wiki links: [PageName] → **JSPWIKI_uuid_3** (but not markdown [text](url))

Code blocks are already protected by Phase 1 preprocessing, so JSPWiki syntax
inside code blocks won't be extracted.

#### Parameters

##### content

`string`

Raw wiki content

##### context

[`export=`](../../context/ParseContext/classes/export=.md) = `{}`

Parse context (for code block protection)

#### Returns

`any`

- { sanitized, jspwikiElements, uuid }

Related: #114 (WikiDocument DOM Solution), #115 (Phase 1 Implementation)

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

Defined in: [src/parsers/MarkupParser.js:1394](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/MarkupParser.js#L1394)

Generate cache key for content and context

#### Parameters

##### content

`string`

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

Defined in: [src/parsers/MarkupParser.js:2110](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/MarkupParser.js#L2110)

Generate performance alert

#### Parameters

##### type

`string`

Alert type

##### message

`string`

Alert message

#### Returns

`void`

***

### getCachedHandlerResult()

> **getCachedHandlerResult**(`handlerId`, `contentHash`, `contextHash`): `Promise`\<`string`\>

Defined in: [src/parsers/MarkupParser.js:1966](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/MarkupParser.js#L1966)

Get cached handler result

#### Parameters

##### handlerId

`string`

Handler ID

##### contentHash

`string`

Content hash

##### contextHash

`string`

Context hash

#### Returns

`Promise`\<`string`\>

- Cached result or null

***

### getCachedParseResult()

> **getCachedParseResult**(`cacheKey`): `Promise`\<`string`\>

Defined in: [src/parsers/MarkupParser.js:1926](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/MarkupParser.js#L1926)

Get cached parse result

#### Parameters

##### cacheKey

`string`

Cache key

#### Returns

`Promise`\<`string`\>

- Cached result or null

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

[`export=`](../../../managers/BaseManager/classes/export=.md).[`getEngine`](../../../managers/BaseManager/classes/export=.md#getengine)

***

### getHandler()

> **getHandler**(`handlerId`): `any`

Defined in: [src/parsers/MarkupParser.js:1357](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/MarkupParser.js#L1357)

Get handler by ID

#### Parameters

##### handlerId

`string`

Handler identifier

#### Returns

`any`

- Handler or null if not found

***

### getHandlerConfig()

> **getHandlerConfig**(`handlerType`): `any`

Defined in: [src/parsers/MarkupParser.js:1339](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/MarkupParser.js#L1339)

Get configuration for a specific handler type

#### Parameters

##### handlerType

`string`

Handler type (plugin, wikitag, etc.)

#### Returns

`any`

- Handler configuration

***

### getHandlers()

> **getHandlers**(`enabledOnly`): `BaseSyntaxHandler`[]

Defined in: [src/parsers/MarkupParser.js:1366](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/MarkupParser.js#L1366)

Get all handlers sorted by priority

#### Parameters

##### enabledOnly

`boolean` = `true`

Only return enabled handlers

#### Returns

`BaseSyntaxHandler`[]

- Handlers sorted by priority

***

### getHandlerTypeFromId()

> **getHandlerTypeFromId**(`handlerId`): `string`

Defined in: [src/parsers/MarkupParser.js:1311](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/MarkupParser.js#L1311)

Get handler type from handler ID for configuration lookup (modular mapping)

#### Parameters

##### handlerId

`string`

Handler ID

#### Returns

`string`

- Handler type or null

***

### getMetrics()

> **getMetrics**(): `any`

Defined in: [src/parsers/MarkupParser.js:1839](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/MarkupParser.js#L1839)

Get performance metrics

#### Returns

`any`

- Performance metrics

***

### getPerformanceAlerts()

> **getPerformanceAlerts**(): `any`[]

Defined in: [src/parsers/MarkupParser.js:2144](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/MarkupParser.js#L2144)

Get performance alerts

#### Returns

`any`[]

- Array of performance alerts

***

### initialize()

> **initialize**(`config?`): `Promise`\<`void`\>

Defined in: [src/parsers/MarkupParser.js:128](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/MarkupParser.js#L128)

Initialize the MarkupParser

#### Parameters

##### config?

`any` = `{}`

Configuration object

#### Returns

`Promise`\<`void`\>

#### Async

#### Overrides

[`export=`](../../../managers/BaseManager/classes/export=.md).[`initialize`](../../../managers/BaseManager/classes/export=.md#initialize)

***

### initializeAdvancedCaching()

> **initializeAdvancedCaching**(): `Promise`\<`void`\>

Defined in: [src/parsers/MarkupParser.js:558](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/MarkupParser.js#L558)

Initialize advanced caching integration with multiple cache strategies

#### Returns

`Promise`\<`void`\>

***

### initializeFilterChain()

> **initializeFilterChain**(): `Promise`\<`void`\>

Defined in: [src/parsers/MarkupParser.js:177](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/MarkupParser.js#L177)

Initialize filter chain with modular configuration

#### Returns

`Promise`\<`void`\>

***

### initializeMetrics()

> **initializeMetrics**(): `void`

Defined in: [src/parsers/MarkupParser.js:703](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/MarkupParser.js#L703)

Initialize metrics collection

#### Returns

`void`

***

### initializePerformanceMonitoring()

> **initializePerformanceMonitoring**(): `void`

Defined in: [src/parsers/MarkupParser.js:613](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/MarkupParser.js#L613)

Initialize performance monitoring system

#### Returns

`void`

***

### ~~initializePhases()~~

> **initializePhases**(): `void`

Defined in: [src/parsers/MarkupParser.js:499](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/MarkupParser.js#L499)

Initialize the 8 processing phases (LEGACY/DEPRECATED)

#### Returns

`void`

#### Deprecated

This method initializes the LEGACY 7-phase string-based parser.
The legacy parser is kept only for backward compatibility and emergency fallback.

**NEW PRIMARY PIPELINE:** Use `parseWithDOMExtraction()` instead (Issues #115-#120)

- Extraction-based approach
- No order dependencies
- Fixes markdown heading bug (#110, #93)
- Active by default (jspwiki.parser.useExtractionPipeline = true)

**This legacy pipeline is used only when:**

- Configuration sets `jspwiki.parser.useExtractionPipeline = false`
- New pipeline encounters an error (automatic fallback)

Phase 0 (DOM Parsing) replaces string-based tokenization
Each phase has a specific responsibility in the parsing pipeline

Related: GitHub Issues #93, #114-#120

***

### isInitialized()

> **isInitialized**(): `boolean`

Defined in: [src/parsers/MarkupParser.js:170](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/MarkupParser.js#L170)

Check if MarkupParser is initialized (required for RenderingManager integration)

#### Returns

`boolean`

- True if initialized

#### Overrides

[`export=`](../../../managers/BaseManager/classes/export=.md).[`isInitialized`](../../../managers/BaseManager/classes/export=.md#isinitialized)

***

### loadConfiguration()

> **loadConfiguration**(): `Promise`\<`void`\>

Defined in: [src/parsers/MarkupParser.js:355](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/MarkupParser.js#L355)

Load configuration from ConfigurationManager

#### Returns

`Promise`\<`void`\>

***

### mergeDOMNodes()

> **mergeDOMNodes**(`html`, `nodes`, `uuid`): `string`

Defined in: [src/parsers/MarkupParser.js:1631](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/MarkupParser.js#L1631)

Merges DOM nodes back into Showdown-generated HTML (Phase 3)

Replaces HTML comment placeholders (<!--JSPWIKI-uuid-id-->) in the HTML with
the rendered DOM nodes. Processes nodes in reverse ID order to
handle nested JSPWiki syntax correctly.

Uses HTML comments as placeholders to avoid Showdown interpreting them as markdown.

#### Parameters

##### html

`string`

HTML from Showdown with placeholders

##### nodes

`Element`[]

Array of DOM nodes with data-jspwiki-id

##### uuid

`string`

UUID from extraction phase

#### Returns

`string`

Final HTML with nodes merged in

#### Example

```ts
// Input HTML: "<p>User: <!--JSPWIKI-abc123-0--></p>"
// Node 0: <span data-jspwiki-id="0">JohnDoe</span>
// Output: "<p>User: <span>JohnDoe</span></p>"
```

***

### parse()

> **parse**(`content`, `context`): `Promise`\<`string`\>

Defined in: [src/parsers/MarkupParser.js:720](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/MarkupParser.js#L720)

Main parsing method - processes content through all phases

#### Parameters

##### content

`string`

Raw content to parse

##### context

`any` = `{}`

Parsing context (page, user, etc.)

#### Returns

`Promise`\<`string`\>

- Processed HTML content

***

### parseWithDOMExtraction()

> **parseWithDOMExtraction**(`content`, `context`): `Promise`\<`string`\>

Defined in: [src/parsers/MarkupParser.js:1691](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/MarkupParser.js#L1691)

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

`string`

Wiki markup content

##### context

`any`

Rendering context

#### Returns

`Promise`\<`string`\>

Rendered HTML

#### Example

```ts
const html = await parser.parseWithDOMExtraction('## Hello\nUser: [{$username}]', context);
// Returns: "<h2>Hello</h2>\n<p>User: <span>JohnDoe</span></p>"
```

***

### performCacheWarmup()

> **performCacheWarmup**(): `Promise`\<`void`\>

Defined in: [src/parsers/MarkupParser.js:635](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/MarkupParser.js#L635)

Perform cache warmup for frequently accessed content

#### Returns

`Promise`\<`void`\>

***

### phaseContentTransformation()

> **phaseContentTransformation**(`content`, `context`): `Promise`\<`any`\>

Defined in: [src/parsers/MarkupParser.js:1098](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/MarkupParser.js#L1098)

Phase 4: Content Transformation
Execute syntax handlers in priority order

Uses DOM-based handlers if WikiDocument is available (Phase 4 migration)
Falls back to string-based handlers for backward compatibility

#### Parameters

##### content

`any`

##### context

`any`

#### Returns

`Promise`\<`any`\>

***

### phaseContextResolution()

> **phaseContextResolution**(`content`, `context`): `Promise`\<`any`\>

Defined in: [src/parsers/MarkupParser.js:1069](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/MarkupParser.js#L1069)

Phase 3: Context Resolution
Expand variables, resolve parameters

Uses DOM-based variable resolution if WikiDocument is available (Phase 3 migration)
Falls back to string-based expansion for backward compatibility

#### Parameters

##### content

`any`

##### context

`any`

#### Returns

`Promise`\<`any`\>

***

### phaseDOMParsing()

> **phaseDOMParsing**(`content`, `context`): `Promise`\<`any`\>

Defined in: [src/parsers/MarkupParser.js:987](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/MarkupParser.js#L987)

Phase 0: DOM Parsing (DISABLED - causes markdown heading issues)

The DOM parser converts markdown headings to list items. Instead, we handle
JSPWiki syntax (variables, plugins, escaping) in later phases while preserving
markdown syntax for the markdown converter.

Related: GitHub Issue #93 - DOM-Based Parsing Architecture
Related: GitHub Issue #110 - JSPWiki Variable Syntax

#### Parameters

##### content

`any`

##### context

`any`

#### Returns

`Promise`\<`any`\>

***

### phaseFilterPipeline()

> **phaseFilterPipeline**(`content`, `context`): `Promise`\<`any`\>

Defined in: [src/parsers/MarkupParser.js:1152](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/MarkupParser.js#L1152)

Phase 5: Filter Pipeline
Apply content filters for security, validation, etc. with modular configuration

#### Parameters

##### content

`any`

##### context

`any`

#### Returns

`Promise`\<`any`\>

***

### phaseMarkdownConversion()

> **phaseMarkdownConversion**(`content`, `context`): `Promise`\<`any`\>

Defined in: [src/parsers/MarkupParser.js:1172](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/MarkupParser.js#L1172)

Phase 6: Markdown Conversion
Convert markdown to HTML using Showdown
All standard markdown (code blocks, links, lists, etc.) is handled by Showdown natively

#### Parameters

##### content

`any`

##### context

`any`

#### Returns

`Promise`\<`any`\>

***

### phasePostProcessing()

> **phasePostProcessing**(`content`, `context`): `Promise`\<`any`\>

Defined in: [src/parsers/MarkupParser.js:1195](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/MarkupParser.js#L1195)

Phase 7: Post-processing
Final cleanup and validation

#### Parameters

##### content

`any`

##### context

`any`

#### Returns

`Promise`\<`any`\>

***

### phasePreprocessing()

> **phasePreprocessing**(`content`, `context`): `Promise`\<`any`\>

Defined in: [src/parsers/MarkupParser.js:999](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/MarkupParser.js#L999)

Phase 1: Preprocessing
Handle JSPWiki-specific escaping and normalize content
Protect code blocks from WikiStyleHandler and other Phase 3 handlers
Process variables and escaped syntax without interfering with markdown

#### Parameters

##### content

`any`

##### context

`any`

#### Returns

`Promise`\<`any`\>

***

### phaseSyntaxRecognition()

> **phaseSyntaxRecognition**(`content`, `context`): `Promise`\<`any`\>

Defined in: [src/parsers/MarkupParser.js:1055](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/MarkupParser.js#L1055)

Phase 2: Syntax Recognition
Identify and tokenize markup patterns

#### Parameters

##### content

`any`

##### context

`any`

#### Returns

`Promise`\<`any`\>

***

### processJSPWikiSyntax()

> **processJSPWikiSyntax**(`content`, `context`): `Promise`\<`any`\>

Defined in: [src/parsers/MarkupParser.js:884](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/MarkupParser.js#L884)

Process JSPWiki-specific syntax (variables, plugins, escaping)
This handles [{$var}], [{Plugin}], and [[escaped]] without breaking markdown

Related: GitHub Issue #110 - JSPWiki Variable Syntax

#### Parameters

##### content

`any`

##### context

`any`

#### Returns

`Promise`\<`any`\>

***

### protectGeneratedHtml()

> **protectGeneratedHtml**(`content`, `context`): `string`

Defined in: [src/parsers/MarkupParser.js:1756](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/MarkupParser.js#L1756)

Protect HTML links and other generated HTML from markdown encoding

#### Parameters

##### content

`string`

Content with generated HTML

##### context

[`export=`](../../context/ParseContext/classes/export=.md)

Parse context to store protected content

#### Returns

`string`

- Content with HTML protected using placeholders

***

### registerDefaultFilters()

> **registerDefaultFilters**(): `Promise`\<`void`\>

Defined in: [src/parsers/MarkupParser.js:196](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/MarkupParser.js#L196)

Register default filters based on modular configuration

#### Returns

`Promise`\<`void`\>

***

### registerDefaultHandlers()

> **registerDefaultHandlers**(): `Promise`\<`void`\>

Defined in: [src/parsers/MarkupParser.js:243](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/MarkupParser.js#L243)

Register default syntax handlers based on configuration

#### Returns

`Promise`\<`void`\>

***

### registerHandler()

> **registerHandler**(`handler`, `options`): `Promise`\<`boolean`\>

Defined in: [src/parsers/MarkupParser.js:1295](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/MarkupParser.js#L1295)

Register a syntax handler

#### Parameters

##### handler

`BaseSyntaxHandler`

Handler instance

##### options

`any` = `{}`

Registration options

#### Returns

`Promise`\<`boolean`\>

- True if registration successful

***

### resetMetrics()

> **resetMetrics**(): `void`

Defined in: [src/parsers/MarkupParser.js:1908](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/MarkupParser.js#L1908)

Reset performance metrics

#### Returns

`void`

***

### resolveSystemVariable()

> **resolveSystemVariable**(`varName`, `context`): `Promise`\<`string`\>

Defined in: [src/parsers/MarkupParser.js:684](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/MarkupParser.js#L684)

Resolve system variable for cache warmup

#### Parameters

##### varName

`string`

Variable name

##### context

`any`

Context object

#### Returns

`Promise`\<`string`\>

- Variable value

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

[`export=`](../../../managers/BaseManager/classes/export=.md).[`restore`](../../../managers/BaseManager/classes/export=.md#restore)

***

### shutdown()

> **shutdown**(): `Promise`\<`void`\>

Defined in: [src/parsers/MarkupParser.js:2157](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/MarkupParser.js#L2157)

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

#### Overrides

[`export=`](../../../managers/BaseManager/classes/export=.md).[`shutdown`](../../../managers/BaseManager/classes/export=.md#shutdown)

***

### unregisterHandler()

> **unregisterHandler**(`handlerId`): `Promise`\<`boolean`\>

Defined in: [src/parsers/MarkupParser.js:1348](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/MarkupParser.js#L1348)

Unregister a syntax handler

#### Parameters

##### handlerId

`string`

Handler identifier

#### Returns

`Promise`\<`boolean`\>

- True if unregistration successful

***

### updateCacheMetrics()

> **updateCacheMetrics**(`strategy`, `operation`): `void`

Defined in: [src/parsers/MarkupParser.js:2016](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/MarkupParser.js#L2016)

Update cache metrics for specific strategy

#### Parameters

##### strategy

`string`

Cache strategy name

##### operation

`string`

Operation type (hit, miss, set)

#### Returns

`void`

***

### updatePerformanceMetrics()

> **updatePerformanceMetrics**(`processingTime`, `cacheHit`): `void`

Defined in: [src/parsers/MarkupParser.js:2032](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/MarkupParser.js#L2032)

Update performance metrics and check thresholds

#### Parameters

##### processingTime

`number`

Processing time in milliseconds

##### cacheHit

`boolean`

Whether this was a cache hit

#### Returns

`void`
