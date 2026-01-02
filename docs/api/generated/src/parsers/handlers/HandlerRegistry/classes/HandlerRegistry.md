[**amdWiki API v1.5.0**](../../../../../README.md)

***

[amdWiki API](../../../../../README.md) / [src/parsers/handlers/HandlerRegistry](../README.md) / HandlerRegistry

# Class: HandlerRegistry

Defined in: [src/parsers/handlers/HandlerRegistry.ts:110](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/parsers/handlers/HandlerRegistry.ts#L110)

HandlerRegistry - Advanced handler registration and management system

## Constructors

### Constructor

> **new HandlerRegistry**(`engine`): `HandlerRegistry`

Defined in: [src/parsers/handlers/HandlerRegistry.ts:119](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/parsers/handlers/HandlerRegistry.ts#L119)

#### Parameters

##### engine

[`WikiEngine`](../interfaces/WikiEngine.md) = `null`

#### Returns

`HandlerRegistry`

## Methods

### clearAll()

> **clearAll**(): `Promise`\<`void`\>

Defined in: [src/parsers/handlers/HandlerRegistry.ts:625](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/parsers/handlers/HandlerRegistry.ts#L625)

Clear all handlers

#### Returns

`Promise`\<`void`\>

***

### disableHandler()

> **disableHandler**(`handlerId`): `boolean`

Defined in: [src/parsers/handlers/HandlerRegistry.ts:485](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/parsers/handlers/HandlerRegistry.ts#L485)

Disable handler by ID

#### Parameters

##### handlerId

`string`

Handler ID

#### Returns

`boolean`

True if successful

***

### enableHandler()

> **enableHandler**(`handlerId`): `boolean`

Defined in: [src/parsers/handlers/HandlerRegistry.ts:470](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/parsers/handlers/HandlerRegistry.ts#L470)

Enable handler by ID

#### Parameters

##### handlerId

`string`

Handler ID

#### Returns

`boolean`

True if successful

***

### exportState()

> **exportState**(): [`ExportedRegistryState`](../interfaces/ExportedRegistryState.md)

Defined in: [src/parsers/handlers/HandlerRegistry.ts:650](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/parsers/handlers/HandlerRegistry.ts#L650)

Export registry state for persistence

#### Returns

[`ExportedRegistryState`](../interfaces/ExportedRegistryState.md)

Serializable registry state

***

### getHandler()

> **getHandler**(`handlerId`): [`default`](../../BaseSyntaxHandler/classes/default.md)

Defined in: [src/parsers/handlers/HandlerRegistry.ts:429](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/parsers/handlers/HandlerRegistry.ts#L429)

Get handler by ID

#### Parameters

##### handlerId

`string`

Handler ID

#### Returns

[`default`](../../BaseSyntaxHandler/classes/default.md)

Handler or null if not found

***

### getHandlersByPattern()

> **getHandlersByPattern**(`pattern`): [`default`](../../BaseSyntaxHandler/classes/default.md)[]

Defined in: [src/parsers/handlers/HandlerRegistry.ts:452](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/parsers/handlers/HandlerRegistry.ts#L452)

Get handlers by pattern

#### Parameters

##### pattern

Pattern to match

`string` | `RegExp`

#### Returns

[`default`](../../BaseSyntaxHandler/classes/default.md)[]

Matching handlers

***

### getHandlersByPriority()

> **getHandlersByPriority**(`enabledOnly`): [`default`](../../BaseSyntaxHandler/classes/default.md)[]

Defined in: [src/parsers/handlers/HandlerRegistry.ts:438](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/parsers/handlers/HandlerRegistry.ts#L438)

Get all handlers sorted by priority

#### Parameters

##### enabledOnly

`boolean` = `true`

Only return enabled handlers

#### Returns

[`default`](../../BaseSyntaxHandler/classes/default.md)[]

Handlers sorted by priority

***

### getInfo()

> **getInfo**(): [`RegistryInfo`](../interfaces/RegistryInfo.md)

Defined in: [src/parsers/handlers/HandlerRegistry.ts:663](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/parsers/handlers/HandlerRegistry.ts#L663)

Get registry information

#### Returns

[`RegistryInfo`](../interfaces/RegistryInfo.md)

Registry information

***

### getStats()

> **getStats**(): [`ExtendedRegistryStats`](../interfaces/ExtendedRegistryStats.md)

Defined in: [src/parsers/handlers/HandlerRegistry.ts:499](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/parsers/handlers/HandlerRegistry.ts#L499)

Get registry statistics

#### Returns

[`ExtendedRegistryStats`](../interfaces/ExtendedRegistryStats.md)

Registry statistics

***

### registerHandler()

> **registerHandler**(`handler`, `options`): `Promise`\<`boolean`\>

Defined in: [src/parsers/handlers/HandlerRegistry.ts:152](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/parsers/handlers/HandlerRegistry.ts#L152)

Register a syntax handler with full validation and conflict detection

#### Parameters

##### handler

[`default`](../../BaseSyntaxHandler/classes/default.md)

Handler to register

##### options

[`RegistrationOptions`](../interfaces/RegistrationOptions.md) = `{}`

Registration options

#### Returns

`Promise`\<`boolean`\>

True if registration successful

***

### resetStats()

> **resetStats**(): `void`

Defined in: [src/parsers/handlers/HandlerRegistry.ts:523](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/parsers/handlers/HandlerRegistry.ts#L523)

Reset all handler statistics

#### Returns

`void`

***

### resolveExecutionOrder()

> **resolveExecutionOrder**(): [`default`](../../BaseSyntaxHandler/classes/default.md)[]

Defined in: [src/parsers/handlers/HandlerRegistry.ts:543](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/parsers/handlers/HandlerRegistry.ts#L543)

Resolve handler execution order considering dependencies

#### Returns

[`default`](../../BaseSyntaxHandler/classes/default.md)[]

Handlers in dependency-resolved order

***

### unregisterHandler()

> **unregisterHandler**(`handlerId`): `Promise`\<`boolean`\>

Defined in: [src/parsers/handlers/HandlerRegistry.ts:225](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/parsers/handlers/HandlerRegistry.ts#L225)

Unregister a syntax handler

#### Parameters

##### handlerId

`string`

ID of handler to unregister

#### Returns

`Promise`\<`boolean`\>

True if unregistration successful

***

### validateDependencies()

> **validateDependencies**(): [`DependencyValidationError`](../interfaces/DependencyValidationError.md)[]

Defined in: [src/parsers/handlers/HandlerRegistry.ts:599](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/parsers/handlers/HandlerRegistry.ts#L599)

Validate all handler dependencies

#### Returns

[`DependencyValidationError`](../interfaces/DependencyValidationError.md)[]

Array of dependency validation errors
