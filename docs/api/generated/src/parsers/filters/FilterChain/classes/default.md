[**amdWiki API v1.5.0**](../../../../../README.md)

***

[amdWiki API](../../../../../README.md) / [src/parsers/filters/FilterChain](../README.md) / default

# Class: default

Defined in: [src/parsers/filters/FilterChain.ts:179](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/parsers/filters/FilterChain.ts#L179)

FilterChain - Modular content filtering pipeline

## Constructors

### Constructor

> **new default**(`engine`): `FilterChain`

Defined in: [src/parsers/filters/FilterChain.ts:188](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/parsers/filters/FilterChain.ts#L188)

#### Parameters

##### engine

[`WikiEngine`](../interfaces/WikiEngine.md) = `null`

#### Returns

`FilterChain`

## Methods

### addFilter()

> **addFilter**(`filter`, `_options`): `boolean`

Defined in: [src/parsers/filters/FilterChain.ts:309](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/parsers/filters/FilterChain.ts#L309)

Add filter to the chain with modular configuration

#### Parameters

##### filter

[`default`](../../BaseFilter/classes/default.md)

Filter to add

##### \_options

`Record`\<`string`, `unknown`\> = `{}`

Registration options

#### Returns

`boolean`

True if added successfully

***

### clearAll()

> **clearAll**(): `Promise`\<`void`\>

Defined in: [src/parsers/filters/FilterChain.ts:796](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/parsers/filters/FilterChain.ts#L796)

Clear all filters and reset state

#### Returns

`Promise`\<`void`\>

***

### disableFilter()

> **disableFilter**(`filterId`): `boolean`

Defined in: [src/parsers/filters/FilterChain.ts:680](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/parsers/filters/FilterChain.ts#L680)

Disable filter by ID

#### Parameters

##### filterId

`string`

Filter ID

#### Returns

`boolean`

True if successful

***

### enableFilter()

> **enableFilter**(`filterId`): `boolean`

Defined in: [src/parsers/filters/FilterChain.ts:663](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/parsers/filters/FilterChain.ts#L663)

Enable filter by ID

#### Parameters

##### filterId

`string`

Filter ID

#### Returns

`boolean`

True if successful

***

### exportState()

> **exportState**(): [`ExportedChainState`](../interfaces/ExportedChainState.md)

Defined in: [src/parsers/filters/FilterChain.ts:774](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/parsers/filters/FilterChain.ts#L774)

Export filter chain state for persistence or debugging

#### Returns

[`ExportedChainState`](../interfaces/ExportedChainState.md)

Serializable state

***

### getConfiguration()

> **getConfiguration**(): [`ConfigurationSummary`](../interfaces/ConfigurationSummary.md)

Defined in: [src/parsers/filters/FilterChain.ts:761](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/parsers/filters/FilterChain.ts#L761)

Get configuration summary for debugging (modular introspection)

#### Returns

[`ConfigurationSummary`](../interfaces/ConfigurationSummary.md)

Configuration summary

***

### getFilter()

> **getFilter**(`filterId`): [`default`](../../BaseFilter/classes/default.md)

Defined in: [src/parsers/filters/FilterChain.ts:642](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/parsers/filters/FilterChain.ts#L642)

Get filter by ID

#### Parameters

##### filterId

`string`

Filter ID

#### Returns

[`default`](../../BaseFilter/classes/default.md)

Filter or null if not found

***

### getFilters()

> **getFilters**(`enabledOnly`): [`default`](../../BaseFilter/classes/default.md)[]

Defined in: [src/parsers/filters/FilterChain.ts:651](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/parsers/filters/FilterChain.ts#L651)

Get all filters sorted by priority

#### Parameters

##### enabledOnly

`boolean` = `true`

Only return enabled filters

#### Returns

[`default`](../../BaseFilter/classes/default.md)[]

Filters sorted by priority

***

### getStats()

> **getStats**(): [`ExtendedFilterChainStats`](../interfaces/ExtendedFilterChainStats.md)

Defined in: [src/parsers/filters/FilterChain.ts:696](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/parsers/filters/FilterChain.ts#L696)

Get comprehensive filter chain statistics (modular monitoring)

#### Returns

[`ExtendedFilterChainStats`](../interfaces/ExtendedFilterChainStats.md)

Filter chain statistics

***

### initialize()

> **initialize**(`context`): `Promise`\<`void`\>

Defined in: [src/parsers/filters/FilterChain.ts:210](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/parsers/filters/FilterChain.ts#L210)

Initialize FilterChain with complete modular configuration

#### Parameters

##### context

[`FilterChainInitContext`](../interfaces/FilterChainInitContext.md) = `{}`

Initialization context

#### Returns

`Promise`\<`void`\>

***

### loadModularConfiguration()

> **loadModularConfiguration**(): `void`

Defined in: [src/parsers/filters/FilterChain.ts:235](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/parsers/filters/FilterChain.ts#L235)

Load modular configuration from app-default-config.json and app-custom-config.json
Demonstrates complete configuration modularity and reusability

#### Returns

`void`

***

### process()

> **process**(`content`, `context`): `Promise`\<`string`\>

Defined in: [src/parsers/filters/FilterChain.ts:390](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/parsers/filters/FilterChain.ts#L390)

Process content through the filter chain with modular execution

#### Parameters

##### content

`string`

Content to filter

##### context

[`ParseContext`](../../../context/ParseContext/classes/ParseContext.md)

Parse context

#### Returns

`Promise`\<`string`\>

Filtered content

***

### removeFilter()

> **removeFilter**(`filterId`): `boolean`

Defined in: [src/parsers/filters/FilterChain.ts:350](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/parsers/filters/FilterChain.ts#L350)

Remove filter from the chain

#### Parameters

##### filterId

`string`

Filter ID to remove

#### Returns

`boolean`

True if removed successfully

***

### resetStats()

> **resetStats**(): `void`

Defined in: [src/parsers/filters/FilterChain.ts:733](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/parsers/filters/FilterChain.ts#L733)

Reset all filter statistics

#### Returns

`void`

***

### shutdown()

> **shutdown**(): `Promise`\<`void`\>

Defined in: [src/parsers/filters/FilterChain.ts:818](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/parsers/filters/FilterChain.ts#L818)

Shutdown filter chain

#### Returns

`Promise`\<`void`\>
