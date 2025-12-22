[**amdWiki API v1.5.0**](../../../../../README.md)

***

[amdWiki API](../../../../../README.md) / [src/parsers/filters/FilterChain](../README.md) / export=

# Class: export=

Defined in: [src/parsers/filters/FilterChain.js:18](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/filters/FilterChain.js#L18)

FilterChain - Modular content filtering pipeline with complete configuration support

Provides a sophisticated, configurable filter system that processes content through
multiple stages with priority-based execution, performance monitoring, and error handling.

Design Principles:

- Complete modularity through app-default-config.json and app-custom-config.json
- Zero hardcoded values - everything configurable
- Reusable architecture for any content filtering needs
- Performance monitoring and caching integration

Related Issue: Phase 4 - Filter Pipeline Core
Epic: #41 - Implement JSPWikiMarkupParser for Complete Enhancement Support

## Constructors

### Constructor

> **new export=**(`engine`): `FilterChain`

Defined in: [src/parsers/filters/FilterChain.js:19](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/filters/FilterChain.js#L19)

#### Parameters

##### engine

`any` = `null`

#### Returns

`FilterChain`

## Properties

### config

> **config**: `object`

Defined in: [src/parsers/filters/FilterChain.js:24](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/filters/FilterChain.js#L24)

#### cacheResults

> **cacheResults**: `boolean` = `true`

#### cacheTTL

> **cacheTTL**: `number` = `600`

#### enabled

> **enabled**: `boolean` = `true`

#### enableParallelExecution

> **enableParallelExecution**: `boolean` = `false`

#### enableProfiling

> **enableProfiling**: `boolean` = `true`

#### failOnError

> **failOnError**: `boolean` = `false`

#### maxConcurrentFilters

> **maxConcurrentFilters**: `number` = `3`

#### maxFilters

> **maxFilters**: `number` = `50`

#### preventXSS

> **preventXSS**: `boolean` = `true`

#### sanitizeHTML

> **sanitizeHTML**: `boolean` = `true`

#### stripDangerousContent

> **stripDangerousContent**: `boolean` = `true`

#### timeout

> **timeout**: `number` = `10000`

***

### engine

> **engine**: `any`

Defined in: [src/parsers/filters/FilterChain.js:20](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/filters/FilterChain.js#L20)

***

### filterMap

> **filterMap**: `Map`\<`any`, `any`\>

Defined in: [src/parsers/filters/FilterChain.js:23](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/filters/FilterChain.js#L23)

***

### filters

> **filters**: `any`[]

Defined in: [src/parsers/filters/FilterChain.js:21](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/filters/FilterChain.js#L21)

***

### filtersByPriority

> **filtersByPriority**: `any`[]

Defined in: [src/parsers/filters/FilterChain.js:22](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/filters/FilterChain.js#L22)

***

### performanceMonitor

> **performanceMonitor**: `object`

Defined in: [src/parsers/filters/FilterChain.js:116](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/filters/FilterChain.js#L116)

#### alertThresholds

> **alertThresholds**: `object`

##### alertThresholds.errorRate

> **errorRate**: `number` = `0.1`

##### alertThresholds.executionTime

> **executionTime**: `number` = `1000`

#### enabled

> **enabled**: `boolean` = `true`

#### maxRecentEntries

> **maxRecentEntries**: `number` = `100`

#### recentExecutions

> **recentExecutions**: `any`[] = `[]`

***

### stats

> **stats**: `object`

Defined in: [src/parsers/filters/FilterChain.js:27](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/filters/FilterChain.js#L27)

#### errorCount

> **errorCount**: `number` = `0`

#### executionCount

> **executionCount**: `number` = `0`

#### filterExecutions

> **filterExecutions**: `Map`\<`any`, `any`\>

#### lastExecution

> **lastExecution**: `any` = `null`

#### totalTime

> **totalTime**: `number` = `0`

## Methods

### addFilter()

> **addFilter**(`filter`, `options`): `boolean`

Defined in: [src/parsers/filters/FilterChain.js:133](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/filters/FilterChain.js#L133)

Add filter to the chain with modular configuration

#### Parameters

##### filter

[`export=`](../../BaseFilter/classes/export=.md)

Filter to add

##### options

`any` = `{}`

Registration options

#### Returns

`boolean`

- True if added successfully

***

### checkPerformanceThresholds()

> **checkPerformanceThresholds**(): `void`

Defined in: [src/parsers/filters/FilterChain.js:409](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/filters/FilterChain.js#L409)

Check performance thresholds and generate alerts (modular alerting)

#### Returns

`void`

***

### clearAll()

> **clearAll**(): `Promise`\<`void`\>

Defined in: [src/parsers/filters/FilterChain.js:606](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/filters/FilterChain.js#L606)

Clear all filters and reset state

#### Returns

`Promise`\<`void`\>

***

### disableFilter()

> **disableFilter**(`filterId`): `boolean`

Defined in: [src/parsers/filters/FilterChain.js:493](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/filters/FilterChain.js#L493)

Disable filter by ID

#### Parameters

##### filterId

`string`

Filter ID

#### Returns

`boolean`

- True if successful

***

### enableFilter()

> **enableFilter**(`filterId`): `boolean`

Defined in: [src/parsers/filters/FilterChain.js:477](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/filters/FilterChain.js#L477)

Enable filter by ID

#### Parameters

##### filterId

`string`

Filter ID

#### Returns

`boolean`

- True if successful

***

### executeFilter()

> **executeFilter**(`filter`, `content`, `context`): `Promise`\<`string`\>

Defined in: [src/parsers/filters/FilterChain.js:354](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/filters/FilterChain.js#L354)

Execute a single filter with error handling

#### Parameters

##### filter

[`export=`](../../BaseFilter/classes/export=.md)

Filter to execute

##### content

`string`

Content to process

##### context

`ParseContext`

Parse context

#### Returns

`Promise`\<`string`\>

- Processed content

***

### executeFiltersParallel()

> **executeFiltersParallel**(`content`, `context`): `Promise`\<`string`\>

Defined in: [src/parsers/filters/FilterChain.js:312](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/filters/FilterChain.js#L312)

Execute filters in parallel (advanced mode - configurable)

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

***

### executeFiltersSequential()

> **executeFiltersSequential**(`content`, `context`): `Promise`\<`string`\>

Defined in: [src/parsers/filters/FilterChain.js:264](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/filters/FilterChain.js#L264)

Execute filters sequentially (default, safe mode)

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

***

### exportState()

> **exportState**(): `any`

Defined in: [src/parsers/filters/FilterChain.js:586](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/filters/FilterChain.js#L586)

Export filter chain state for persistence or debugging

#### Returns

`any`

- Serializable state

***

### generateAlert()

> **generateAlert**(`type`, `message`): `void`

Defined in: [src/parsers/filters/FilterChain.js:435](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/filters/FilterChain.js#L435)

Generate performance alert (modular alerting)

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

### getConfiguration()

> **getConfiguration**(): `any`

Defined in: [src/parsers/filters/FilterChain.js:573](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/filters/FilterChain.js#L573)

Get configuration summary for debugging (modular introspection)

#### Returns

`any`

- Configuration summary

***

### getFilter()

> **getFilter**(`filterId`): [`export=`](../../BaseFilter/classes/export=.md)

Defined in: [src/parsers/filters/FilterChain.js:456](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/filters/FilterChain.js#L456)

Get filter by ID

#### Parameters

##### filterId

`string`

Filter ID

#### Returns

[`export=`](../../BaseFilter/classes/export=.md)

- Filter or null if not found

***

### getFilters()

> **getFilters**(`enabledOnly`): [`export=`](../../BaseFilter/classes/export=.md)[]

Defined in: [src/parsers/filters/FilterChain.js:465](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/filters/FilterChain.js#L465)

Get all filters sorted by priority

#### Parameters

##### enabledOnly

`boolean` = `true`

Only return enabled filters

#### Returns

[`export=`](../../BaseFilter/classes/export=.md)[]

- Filters sorted by priority

***

### getStats()

> **getStats**(): `any`

Defined in: [src/parsers/filters/FilterChain.js:508](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/filters/FilterChain.js#L508)

Get comprehensive filter chain statistics (modular monitoring)

#### Returns

`any`

- Filter chain statistics

***

### initialize()

> **initialize**(`context`): `Promise`\<`void`\>

Defined in: [src/parsers/filters/FilterChain.js:40](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/filters/FilterChain.js#L40)

Initialize FilterChain with complete modular configuration

#### Parameters

##### context

`any` = `{}`

Initialization context

#### Returns

`Promise`\<`void`\>

***

### initializePerformanceMonitoring()

> **initializePerformanceMonitoring**(): `void`

Defined in: [src/parsers/filters/FilterChain.js:110](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/filters/FilterChain.js#L110)

Initialize performance monitoring for filter execution

#### Returns

`void`

***

### loadModularConfiguration()

> **loadModularConfiguration**(): `Promise`\<`void`\>

Defined in: [src/parsers/filters/FilterChain.js:60](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/filters/FilterChain.js#L60)

Load modular configuration from app-default-config.json and app-custom-config.json
Demonstrates complete configuration modularity and reusability

#### Returns

`Promise`\<`void`\>

***

### process()

> **process**(`content`, `context`): `Promise`\<`string`\>

Defined in: [src/parsers/filters/FilterChain.js:212](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/filters/FilterChain.js#L212)

Process content through the filter chain with modular execution

#### Parameters

##### content

`string`

Content to filter

##### context

`ParseContext`

Parse context

#### Returns

`Promise`\<`string`\>

- Filtered content

***

### rebuildPriorityList()

> **rebuildPriorityList**(): `void`

Defined in: [src/parsers/filters/FilterChain.js:194](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/filters/FilterChain.js#L194)

Rebuild priority-sorted filter list (modular ordering)

#### Returns

`void`

***

### removeFilter()

> **removeFilter**(`filterId`): `boolean`

Defined in: [src/parsers/filters/FilterChain.js:173](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/filters/FilterChain.js#L173)

Remove filter from the chain

#### Parameters

##### filterId

`string`

Filter ID to remove

#### Returns

`boolean`

- True if removed successfully

***

### resetStats()

> **resetStats**(): `void`

Defined in: [src/parsers/filters/FilterChain.js:545](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/filters/FilterChain.js#L545)

Reset all filter statistics

#### Returns

`void`

***

### shutdown()

> **shutdown**(): `Promise`\<`void`\>

Defined in: [src/parsers/filters/FilterChain.js:627](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/filters/FilterChain.js#L627)

Shutdown filter chain

#### Returns

`Promise`\<`void`\>

***

### trackFilterExecution()

> **trackFilterExecution**(`executionTime`, `success`): `void`

Defined in: [src/parsers/filters/FilterChain.js:386](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/filters/FilterChain.js#L386)

Track filter execution for performance monitoring (modular monitoring)

#### Parameters

##### executionTime

`number`

Execution time in milliseconds

##### success

`boolean`

Whether execution was successful

#### Returns

`void`
