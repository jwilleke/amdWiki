[**amdWiki API v1.5.0**](../../../README.md)

***

[amdWiki API](../../../README.md) / [src/WikiEngine](../README.md) / default

# Class: default

Defined in: [src/WikiEngine.ts:51](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/WikiEngine.ts#L51)

WikiEngine - The core orchestrator for the wiki application

Follows JSPWiki's architecture patterns by coordinating all managers
and providing a central access point for wiki functionality. This is the
main entry point for the application and initializes all 24+ managers
in the correct dependency order.

 WikiEngine

## Implements

IWikiEngine

## See

 - [Engine](../../core/Engine/classes/default.md) for base functionality
 - [WikiContext](../../context/WikiContext/classes/default.md) for request-scoped context

## Extends

- [`default`](../../core/Engine/classes/default.md)

## Constructors

### Constructor

> **new default**(`config?`, `context?`): `WikiEngine`

Defined in: [src/WikiEngine.ts:65](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/WikiEngine.ts#L65)

Creates a new WikiEngine instance

#### Parameters

##### config?

[`WikiConfig`](../../types/Config/interfaces/WikiConfig.md) = `...`

Initial configuration object (not used in constructor)

##### context?

[`default`](../../context/WikiContext/classes/default.md) = `null`

Initial WikiContext (optional)

#### Returns

`WikiEngine`

#### Overrides

[`default`](../../core/Engine/classes/default.md).[`constructor`](../../core/Engine/classes/default.md#constructor)

## Properties

### config?

> `optional` **config**: [`WikiConfig`](../../types/Config/interfaces/WikiConfig.md)

Defined in: [src/core/Engine.ts:29](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/core/Engine.ts#L29)

Configuration object (inherited from Engine)

#### Inherited from

[`default`](../../core/Engine/classes/default.md).[`config`](../../core/Engine/classes/default.md#config)

***

### context

> **context**: [`default`](../../context/WikiContext/classes/default.md)

Defined in: [src/WikiEngine.ts:53](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/WikiEngine.ts#L53)

Currently active WikiContext for request scope

***

### initialized

> `protected` **initialized**: `boolean`

Defined in: [src/core/Engine.ts:26](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/core/Engine.ts#L26)

Flag indicating if engine has been initialized

#### Inherited from

[`default`](../../core/Engine/classes/default.md).[`initialized`](../../core/Engine/classes/default.md#initialized)

***

### managers

> `protected` **managers**: `Map`\<`string`, [`default`](../../managers/BaseManager/classes/default.md)\>

Defined in: [src/core/Engine.ts:20](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/core/Engine.ts#L20)

Map of registered manager instances

#### Inherited from

[`default`](../../core/Engine/classes/default.md).[`managers`](../../core/Engine/classes/default.md#managers)

***

### properties

> `protected` **properties**: `Map`\<`string`, `unknown`\>

Defined in: [src/core/Engine.ts:23](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/core/Engine.ts#L23)

Map of configuration properties

#### Inherited from

[`default`](../../core/Engine/classes/default.md).[`properties`](../../core/Engine/classes/default.md#properties)

***

### startTime

> `readonly` **startTime**: `number`

Defined in: [src/WikiEngine.ts:56](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/WikiEngine.ts#L56)

Timestamp when the engine was started

## Methods

### createDefault()

> `static` **createDefault**(`overrides?`): `Promise`\<`WikiEngine`\>

Defined in: [src/WikiEngine.ts:261](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/WikiEngine.ts#L261)

Create a new WikiEngine with default configuration

Factory method for creating and initializing a WikiEngine in one step.

#### Parameters

##### overrides?

[`WikiConfig`](../../types/Config/interfaces/WikiConfig.md) = `...`

Configuration overrides to apply

#### Returns

`Promise`\<`WikiEngine`\>

Fully initialized WikiEngine instance

#### Static

#### Async

#### Example

```ts
const engine = await WikiEngine.createDefault({
  applicationName: 'MyWiki',
  port: 3000
});
```

***

### getApplicationName()

> **getApplicationName**(): `string`

Defined in: [src/WikiEngine.ts:277](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/WikiEngine.ts#L277)

Get application name from configuration

Uses ConfigurationManager to retrieve the application name.

#### Returns

`string`

Application name (defaults to 'amdWiki')

#### Example

```ts
const name = engine.getApplicationName(); // 'amdWiki'
```

#### Overrides

[`default`](../../core/Engine/classes/default.md).[`getApplicationName`](../../core/Engine/classes/default.md#getapplicationname)

***

### ~~getConfig()~~

> **getConfig**(): `never`

Defined in: [src/WikiEngine.ts:306](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/WikiEngine.ts#L306)

Get configuration instance

#### Returns

`never`

#### Deprecated

Use engine.getManager('ConfigurationManager').getProperty() instead

#### Throws

Always throws - use ConfigurationManager instead

#### Example

```ts
// OLD (deprecated):
// const config = engine.getConfig();
// const value = config.get('key');

// NEW (use this instead):
const configManager = engine.getManager('ConfigurationManager');
const value = configManager.getProperty('amdwiki.key', 'default');
```

#### Overrides

[`default`](../../core/Engine/classes/default.md).[`getConfig`](../../core/Engine/classes/default.md#getconfig)

***

### getContext()

> **getContext**(): [`default`](../../context/WikiContext/classes/default.md)

Defined in: [src/WikiEngine.ts:101](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/WikiEngine.ts#L101)

Gets the currently active WikiContext

#### Returns

[`default`](../../context/WikiContext/classes/default.md)

The active context or null if none set

#### Example

```ts
const context = engine.getContext();
if (context) {
  console.log('Current page:', context.pageName);
}
```

***

### getManager()

> **getManager**\<`T`\>(`managerName`): `T`

Defined in: [src/core/Engine.ts:91](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/core/Engine.ts#L91)

Get a manager instance by class/name

#### Type Parameters

##### T

`T` = [`default`](../../managers/BaseManager/classes/default.md)

#### Parameters

##### managerName

`string`

Name of the manager to retrieve

#### Returns

`T`

Manager instance or undefined if not found

#### Example

```ts
const pageManager = engine.getManager<PageManager>('PageManager');
```

#### Inherited from

[`default`](../../core/Engine/classes/default.md).[`getManager`](../../core/Engine/classes/default.md#getmanager)

***

### getPageManager()

> **getPageManager**(): [`export=`](../../managers/PageManager/classes/export=.md)

Defined in: [src/WikiEngine.ts:321](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/WikiEngine.ts#L321)

Convenience method to get PageManager

#### Returns

[`export=`](../../managers/PageManager/classes/export=.md)

PageManager instance or undefined if not initialized

#### Example

```ts
const page = await engine.getPageManager()?.getPage('Main');
```

***

### getPluginManager()

> **getPluginManager**(): [`default`](../../managers/PluginManager/classes/default.md)

Defined in: [src/WikiEngine.ts:333](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/WikiEngine.ts#L333)

Convenience method to get PluginManager

#### Returns

[`default`](../../managers/PluginManager/classes/default.md)

PluginManager instance or undefined if not initialized

#### Example

```ts
const plugins = engine.getPluginManager()?.getAllPlugins();
```

***

### getProperties()

> **getProperties**(): `Map`\<`string`, `unknown`\>

Defined in: [src/core/Engine.ts:142](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/core/Engine.ts#L142)

Get all configuration properties

#### Returns

`Map`\<`string`, `unknown`\>

Map of all configuration properties

#### Inherited from

[`default`](../../core/Engine/classes/default.md).[`getProperties`](../../core/Engine/classes/default.md#getproperties)

***

### getProperty()

> **getProperty**\<`T`\>(`key`, `defaultValue?`): `T`

Defined in: [src/core/Engine.ts:132](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/core/Engine.ts#L132)

Get configuration property value

#### Type Parameters

##### T

`T` = `unknown`

#### Parameters

##### key

`string`

Configuration property key

##### defaultValue?

`T` = `null`

Default value if property not found

#### Returns

`T`

Property value or default value

#### Example

```ts
const appName = engine.getProperty('applicationName', 'MyWiki');
```

#### Inherited from

[`default`](../../core/Engine/classes/default.md).[`getProperty`](../../core/Engine/classes/default.md#getproperty)

***

### getRegisteredManagers()

> **getRegisteredManagers**(): `string`[]

Defined in: [src/core/Engine.ts:118](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/core/Engine.ts#L118)

Get all registered manager names

#### Returns

`string`[]

Array of registered manager names

#### Example

```ts
const managers = engine.getRegisteredManagers();
// ['ConfigurationManager', 'PageManager', 'UserManager', ...]
```

#### Inherited from

[`default`](../../core/Engine/classes/default.md).[`getRegisteredManagers`](../../core/Engine/classes/default.md#getregisteredmanagers)

***

### getWorkDir()

> **getWorkDir**(): `string`

Defined in: [src/core/Engine.ts:169](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/core/Engine.ts#L169)

Get working directory path from configuration

#### Returns

`string`

Working directory path (defaults to './')

#### Inherited from

[`default`](../../core/Engine/classes/default.md).[`getWorkDir`](../../core/Engine/classes/default.md#getworkdir)

***

### initialize()

> **initialize**(`config?`): `Promise`\<`void`\>

Defined in: [src/WikiEngine.ts:139](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/WikiEngine.ts#L139)

Initialize the wiki engine with configuration

This method initializes all 24+ managers in the correct dependency order:
1. ConfigurationManager - Core configuration (no dependencies)
2. CacheManager - Caching support (used by many managers)
3. UserManager - User authentication/authorization (critical for security)
4. NotificationManager - Notification system
5. PageManager - Page storage and retrieval
6. TemplateManager - Template rendering
7. PolicyManager/PolicyValidator/PolicyEvaluator - Policy system
8. ACLManager - Access control (depends on PolicyEvaluator)
9. PluginManager - Plugin system
10. MarkupParser - Markup parsing
11. RenderingManager - Content rendering (depends on MarkupParser)
12. SearchManager - Full-text search
13. ValidationManager - Schema validation
14. VariableManager - Variable expansion
15. SchemaManager - Schema management
16. ExportManager - Page export
17. AttachmentManager - File attachments
18. AuditManager - Audit logging
19. BackupManager - Backup/restore (must be last)

#### Parameters

##### config?

[`WikiConfig`](../../types/Config/interfaces/WikiConfig.md) = `...`

Configuration object (passed to ConfigurationManager)

#### Returns

`Promise`\<`void`\>

The initialized engine instance

#### Async

#### Throws

If any manager fails to initialize

#### Example

```ts
const engine = new WikiEngine();
await engine.initialize();
console.log('Engine ready with', engine.getRegisteredManagers().length, 'managers');
```

#### Overrides

[`default`](../../core/Engine/classes/default.md).[`initialize`](../../core/Engine/classes/default.md#initialize)

***

### initializeManagers()

> `protected` **initializeManagers**(): `Promise`\<`void`\>

Defined in: [src/core/Engine.ts:76](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/core/Engine.ts#L76)

Initialize all managers

To be implemented by subclasses.
Subclasses can make this async if needed.

#### Returns

`Promise`\<`void`\>

#### Inherited from

[`default`](../../core/Engine/classes/default.md).[`initializeManagers`](../../core/Engine/classes/default.md#initializemanagers)

***

### isConfigured()

> **isConfigured**(): `boolean`

Defined in: [src/core/Engine.ts:151](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/core/Engine.ts#L151)

Check if engine has been initialized

#### Returns

`boolean`

True if engine is initialized and configured

#### Inherited from

[`default`](../../core/Engine/classes/default.md).[`isConfigured`](../../core/Engine/classes/default.md#isconfigured)

***

### registerManager()

> **registerManager**(`name`, `manager`): `void`

Defined in: [src/core/Engine.ts:105](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/core/Engine.ts#L105)

Register a manager with the engine

#### Parameters

##### name

`string`

Unique name for the manager

##### manager

[`default`](../../managers/BaseManager/classes/default.md)

Manager instance to register

#### Returns

`void`

#### Example

```ts
engine.registerManager('PageManager', new PageManager(engine));
```

#### Inherited from

[`default`](../../core/Engine/classes/default.md).[`registerManager`](../../core/Engine/classes/default.md#registermanager)

***

### setContext()

> **setContext**(`context`): `WikiEngine`

Defined in: [src/WikiEngine.ts:85](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/WikiEngine.ts#L85)

Sets the currently active WikiContext for the engine

The WikiContext encapsulates request-specific information including
the current user, page, and rendering context.

#### Parameters

##### context

[`default`](../../context/WikiContext/classes/default.md)

The WikiContext to set as active

#### Returns

`WikiEngine`

The engine instance for method chaining

#### Example

```ts
const context = new WikiContext(engine, { pageName: 'Main' });
engine.setContext(context).getPageManager().getPage('Main');
```

***

### shutdown()

> **shutdown**(): `Promise`\<`void`\>

Defined in: [src/core/Engine.ts:188](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/core/Engine.ts#L188)

Shutdown the engine and cleanup all managers

#### Returns

`Promise`\<`void`\>

#### Async

#### Inherited from

[`default`](../../core/Engine/classes/default.md).[`shutdown`](../../core/Engine/classes/default.md#shutdown)
