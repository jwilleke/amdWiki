[**amdWiki API v1.5.0**](../../../../../README.md)

***

[amdWiki API](../../../../../README.md) / [src/parsers/handlers/HandlerRegistry](../README.md) / HandlerRegistry

# Class: HandlerRegistry

Defined in: [src/parsers/handlers/HandlerRegistry.js:12](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/handlers/HandlerRegistry.js#L12)

HandlerRegistry - Advanced handler registration and management system

Provides sophisticated handler registration with priority management,
conflict detection, dependency resolution, and dynamic loading capabilities.

Related Issue: #56 - Handler Registration and Priority System
Epic: #41 - Implement JSPWikiMarkupParser for Complete Enhancement Support

## Constructors

### Constructor

> **new HandlerRegistry**(`engine`): `HandlerRegistry`

Defined in: [src/parsers/handlers/HandlerRegistry.js:13](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/handlers/HandlerRegistry.js#L13)

#### Parameters

##### engine

`any` = `null`

#### Returns

`HandlerRegistry`

## Properties

### config

> **config**: `object`

Defined in: [src/parsers/handlers/HandlerRegistry.js:21](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/handlers/HandlerRegistry.js#L21)

#### allowDuplicatePriorities

> **allowDuplicatePriorities**: `boolean` = `true`

#### defaultTimeout

> **defaultTimeout**: `number` = `5000`

#### enableConflictDetection

> **enableConflictDetection**: `boolean` = `true`

#### enableDependencyResolution

> **enableDependencyResolution**: `boolean` = `true`

#### maxHandlers

> **maxHandlers**: `number` = `100`

***

### dependencyGraph

> **dependencyGraph**: `Map`\<`any`, `any`\>

Defined in: [src/parsers/handlers/HandlerRegistry.js:18](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/handlers/HandlerRegistry.js#L18)

***

### engine

> **engine**: `any`

Defined in: [src/parsers/handlers/HandlerRegistry.js:14](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/handlers/HandlerRegistry.js#L14)

***

### handlers

> **handlers**: `Map`\<`any`, `any`\>

Defined in: [src/parsers/handlers/HandlerRegistry.js:15](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/handlers/HandlerRegistry.js#L15)

***

### handlersByPattern

> **handlersByPattern**: `Map`\<`any`, `any`\>

Defined in: [src/parsers/handlers/HandlerRegistry.js:17](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/handlers/HandlerRegistry.js#L17)

***

### handlersByPriority

> **handlersByPriority**: `any`[]

Defined in: [src/parsers/handlers/HandlerRegistry.js:16](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/handlers/HandlerRegistry.js#L16)

***

### stats

> **stats**: `object`

Defined in: [src/parsers/handlers/HandlerRegistry.js:30](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/handlers/HandlerRegistry.js#L30)

#### activeHandlers

> **activeHandlers**: `number` = `0`

#### lastRegistration

> **lastRegistration**: `any` = `null`

#### lastUnregistration

> **lastUnregistration**: `any` = `null`

#### registeredHandlers

> **registeredHandlers**: `number` = `0`

#### totalErrors

> **totalErrors**: `number` = `0`

#### totalExecutions

> **totalExecutions**: `number` = `0`

## Methods

### clearAll()

> **clearAll**(): `Promise`\<`void`\>

Defined in: [src/parsers/handlers/HandlerRegistry.js:512](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/handlers/HandlerRegistry.js#L512)

Clear all handlers

#### Returns

`Promise`\<`void`\>

***

### detectConflicts()

> **detectConflicts**(`newHandler`): [`BaseSyntaxHandler`](../../BaseSyntaxHandler/classes/BaseSyntaxHandler.md)[]

Defined in: [src/parsers/handlers/HandlerRegistry.js:231](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/handlers/HandlerRegistry.js#L231)

Detect conflicts with existing handlers

#### Parameters

##### newHandler

[`BaseSyntaxHandler`](../../BaseSyntaxHandler/classes/BaseSyntaxHandler.md)

New handler to check

#### Returns

[`BaseSyntaxHandler`](../../BaseSyntaxHandler/classes/BaseSyntaxHandler.md)[]

- Array of conflicting handlers

***

### disableHandler()

> **disableHandler**(`handlerId`): `boolean`

Defined in: [src/parsers/handlers/HandlerRegistry.js:374](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/handlers/HandlerRegistry.js#L374)

Disable handler by ID

#### Parameters

##### handlerId

`string`

Handler ID

#### Returns

`boolean`

- True if successful

***

### enableHandler()

> **enableHandler**(`handlerId`): `boolean`

Defined in: [src/parsers/handlers/HandlerRegistry.js:359](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/handlers/HandlerRegistry.js#L359)

Enable handler by ID

#### Parameters

##### handlerId

`string`

Handler ID

#### Returns

`boolean`

- True if successful

***

### exportState()

> **exportState**(): `any`

Defined in: [src/parsers/handlers/HandlerRegistry.js:536](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/handlers/HandlerRegistry.js#L536)

Export registry state for persistence

#### Returns

`any`

- Serializable registry state

***

### getDependentHandlers()

> **getDependentHandlers**(`handlerId`): [`BaseSyntaxHandler`](../../BaseSyntaxHandler/classes/BaseSyntaxHandler.md)[]

Defined in: [src/parsers/handlers/HandlerRegistry.js:306](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/handlers/HandlerRegistry.js#L306)

Get handlers that depend on the specified handler

#### Parameters

##### handlerId

`string`

Handler ID

#### Returns

[`BaseSyntaxHandler`](../../BaseSyntaxHandler/classes/BaseSyntaxHandler.md)[]

- Dependent handlers

***

### getHandler()

> **getHandler**(`handlerId`): [`BaseSyntaxHandler`](../../BaseSyntaxHandler/classes/BaseSyntaxHandler.md)

Defined in: [src/parsers/handlers/HandlerRegistry.js:318](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/handlers/HandlerRegistry.js#L318)

Get handler by ID

#### Parameters

##### handlerId

`string`

Handler ID

#### Returns

[`BaseSyntaxHandler`](../../BaseSyntaxHandler/classes/BaseSyntaxHandler.md)

- Handler or null if not found

***

### getHandlersByPattern()

> **getHandlersByPattern**(`pattern`): [`BaseSyntaxHandler`](../../BaseSyntaxHandler/classes/BaseSyntaxHandler.md)[]

Defined in: [src/parsers/handlers/HandlerRegistry.js:341](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/handlers/HandlerRegistry.js#L341)

Get handlers by pattern

#### Parameters

##### pattern

Pattern to match

`string` | `RegExp`

#### Returns

[`BaseSyntaxHandler`](../../BaseSyntaxHandler/classes/BaseSyntaxHandler.md)[]

- Matching handlers

***

### getHandlersByPriority()

> **getHandlersByPriority**(`enabledOnly`): [`BaseSyntaxHandler`](../../BaseSyntaxHandler/classes/BaseSyntaxHandler.md)[]

Defined in: [src/parsers/handlers/HandlerRegistry.js:327](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/handlers/HandlerRegistry.js#L327)

Get all handlers sorted by priority

#### Parameters

##### enabledOnly

`boolean` = `true`

Only return enabled handlers

#### Returns

[`BaseSyntaxHandler`](../../BaseSyntaxHandler/classes/BaseSyntaxHandler.md)[]

- Handlers sorted by priority

***

### getInfo()

> **getInfo**(): `any`

Defined in: [src/parsers/handlers/HandlerRegistry.js:549](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/handlers/HandlerRegistry.js#L549)

Get registry information

#### Returns

`any`

- Registry information

***

### getStats()

> **getStats**(): `any`

Defined in: [src/parsers/handlers/HandlerRegistry.js:388](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/handlers/HandlerRegistry.js#L388)

Get registry statistics

#### Returns

`any`

- Registry statistics

***

### handlersConflict()

> **handlersConflict**(`handler1`, `handler2`): `boolean`

Defined in: [src/parsers/handlers/HandlerRegistry.js:249](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/handlers/HandlerRegistry.js#L249)

Check if two handlers conflict

#### Parameters

##### handler1

[`BaseSyntaxHandler`](../../BaseSyntaxHandler/classes/BaseSyntaxHandler.md)

First handler

##### handler2

[`BaseSyntaxHandler`](../../BaseSyntaxHandler/classes/BaseSyntaxHandler.md)

Second handler

#### Returns

`boolean`

- True if handlers conflict

***

### rebuildPriorityList()

> **rebuildPriorityList**(): `void`

Defined in: [src/parsers/handlers/HandlerRegistry.js:262](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/handlers/HandlerRegistry.js#L262)

Rebuild the priority-sorted handler list

#### Returns

`void`

***

### registerHandler()

> **registerHandler**(`handler`, `options`): `Promise`\<`boolean`\>

Defined in: [src/parsers/handlers/HandlerRegistry.js:46](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/handlers/HandlerRegistry.js#L46)

Register a syntax handler with full validation and conflict detection

#### Parameters

##### handler

[`BaseSyntaxHandler`](../../BaseSyntaxHandler/classes/BaseSyntaxHandler.md)

Handler to register

##### options

`any` = `{}`

Registration options

#### Returns

`Promise`\<`boolean`\>

- True if registration successful

***

### resetStats()

> **resetStats**(): `void`

Defined in: [src/parsers/handlers/HandlerRegistry.js:411](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/handlers/HandlerRegistry.js#L411)

Reset all handler statistics

#### Returns

`void`

***

### resolveExecutionOrder()

> **resolveExecutionOrder**(): [`BaseSyntaxHandler`](../../BaseSyntaxHandler/classes/BaseSyntaxHandler.md)[]

Defined in: [src/parsers/handlers/HandlerRegistry.js:431](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/handlers/HandlerRegistry.js#L431)

Resolve handler execution order considering dependencies

#### Returns

[`BaseSyntaxHandler`](../../BaseSyntaxHandler/classes/BaseSyntaxHandler.md)[]

- Handlers in dependency-resolved order

***

### unregisterHandler()

> **unregisterHandler**(`handlerId`): `Promise`\<`boolean`\>

Defined in: [src/parsers/handlers/HandlerRegistry.js:118](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/handlers/HandlerRegistry.js#L118)

Unregister a syntax handler

#### Parameters

##### handlerId

`string`

ID of handler to unregister

#### Returns

`Promise`\<`boolean`\>

- True if unregistration successful

***

### updateDependencyGraph()

> **updateDependencyGraph**(`handler`): `void`

Defined in: [src/parsers/handlers/HandlerRegistry.js:279](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/handlers/HandlerRegistry.js#L279)

Update dependency graph when handler is registered

#### Parameters

##### handler

[`BaseSyntaxHandler`](../../BaseSyntaxHandler/classes/BaseSyntaxHandler.md)

Handler being registered

#### Returns

`void`

***

### validateDependencies()

> **validateDependencies**(): `any`[]

Defined in: [src/parsers/handlers/HandlerRegistry.js:486](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/handlers/HandlerRegistry.js#L486)

Validate all handler dependencies

#### Returns

`any`[]

- Array of dependency validation errors

***

### validateHandler()

> **validateHandler**(`handler`): `void`

Defined in: [src/parsers/handlers/HandlerRegistry.js:168](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/handlers/HandlerRegistry.js#L168)

Validate handler before registration

#### Parameters

##### handler

[`BaseSyntaxHandler`](../../BaseSyntaxHandler/classes/BaseSyntaxHandler.md)

Handler to validate

#### Returns

`void`
