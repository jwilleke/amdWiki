[**amdWiki API v1.5.0**](../../../README.md)

***

[amdWiki API](../../../README.md) / [src/WikiEngine](../README.md) / export=

# Class: export=

Defined in: [src/WikiEngine.js:46](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/WikiEngine.js#L46)

WikiEngine - The core orchestrator for the wiki application

Follows JSPWiki's architecture patterns by coordinating all managers
and providing a central access point for wiki functionality. This is the
main entry point for the application and initializes all 24+ managers
in the correct dependency order.

 WikiEngine

## See

 - [Engine](../../core/Engine/classes/export=.md) for base functionality
 - WikiContext for request-scoped context

## Extends

- [`export=`](../../core/Engine/classes/export=.md)

## Constructors

### Constructor

> **new export=**(`config?`, `context?`): `WikiEngine`

Defined in: [src/WikiEngine.js:54](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/WikiEngine.js#L54)

Creates a new WikiEngine instance

#### Parameters

##### config?

`any` = `{}`

Initial configuration object (not used in constructor)

##### context?

`any` = `null`

Initial WikiContext (optional)

#### Returns

`WikiEngine`

#### Overrides

[`export=`](../../core/Engine/classes/export=.md).[`constructor`](../../core/Engine/classes/export=.md#constructor)

## Properties

### config

> **config**: `any`

Defined in: [src/core/Engine.js:42](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/core/Engine.js#L42)

Legacy configuration object (deprecated, use ConfigurationManager)

#### Inherited from

[`export=`](../../core/Engine/classes/export=.md).[`config`](../../core/Engine/classes/export=.md#config)

***

### context

> **context**: `any`

Defined in: [src/WikiEngine.js:56](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/WikiEngine.js#L56)

Currently active WikiContext for request scope

***

### initialized

> **initialized**: `boolean`

Defined in: [src/core/Engine.js:24](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/core/Engine.js#L24)

Flag indicating if engine has been initialized

#### Inherited from

[`export=`](../../core/Engine/classes/export=.md).[`initialized`](../../core/Engine/classes/export=.md#initialized)

***

### managers

> **managers**: `Map`\<`any`, `any`\>

Defined in: [src/core/Engine.js:22](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/core/Engine.js#L22)

Map of registered manager instances keyed by name

#### Inherited from

[`export=`](../../core/Engine/classes/export=.md).[`managers`](../../core/Engine/classes/export=.md#managers)

***

### properties

> **properties**: `Map`\<`any`, `any`\>

Defined in: [src/core/Engine.js:23](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/core/Engine.js#L23)

Map of configuration properties

#### Inherited from

[`export=`](../../core/Engine/classes/export=.md).[`properties`](../../core/Engine/classes/export=.md#properties)

***

### startTime

> **startTime**: `number`

Defined in: [src/WikiEngine.js:57](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/WikiEngine.js#L57)

Timestamp when the engine was started

## Methods

### createDefault()

> `static` **createDefault**(`overrides?`): `Promise`\<`WikiEngine`\>

Defined in: [src/WikiEngine.js:229](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/WikiEngine.js#L229)

Create a new WikiEngine with default configuration

Factory method for creating and initializing a WikiEngine in one step.

#### Parameters

##### overrides?

`any` = `{}`

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

Defined in: [src/WikiEngine.js:245](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/WikiEngine.js#L245)

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

[`export=`](../../core/Engine/classes/export=.md).[`getApplicationName`](../../core/Engine/classes/export=.md#getapplicationname)

***

### ~~getConfig()~~

> **getConfig**(): `void`

Defined in: [src/WikiEngine.js:270](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/WikiEngine.js#L270)

Get configuration instance

#### Returns

`void`

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

***

### getContext()

> **getContext**(): `any`

Defined in: [src/WikiEngine.js:89](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/WikiEngine.js#L89)

Gets the currently active WikiContext

#### Returns

`any`

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

> **getManager**(`managerName`): `any`

Defined in: [src/core/Engine.js:73](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/core/Engine.js#L73)

Get a manager instance by class/name

#### Parameters

##### managerName

`string`

Name of the manager to retrieve

#### Returns

`any`

Manager instance or null if not found

#### Example

```ts
const pageManager = engine.getManager('PageManager');
```

#### Inherited from

[`export=`](../../core/Engine/classes/export=.md).[`getManager`](../../core/Engine/classes/export=.md#getmanager)

***

### getPageManager()

> **getPageManager**(): [`export=`](../../managers/PageManager/classes/export=.md)

Defined in: [src/WikiEngine.js:285](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/WikiEngine.js#L285)

Convenience method to get PageManager

#### Returns

[`export=`](../../managers/PageManager/classes/export=.md)

PageManager instance

#### Example

```ts
const page = await engine.getPageManager().getPage('Main');
```

***

### getPluginManager()

> **getPluginManager**(): [`export=`](../../managers/PluginManager/classes/export=.md)

Defined in: [src/WikiEngine.js:297](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/WikiEngine.js#L297)

Convenience method to get PluginManager

#### Returns

[`export=`](../../managers/PluginManager/classes/export=.md)

PluginManager instance

#### Example

```ts
const plugins = engine.getPluginManager().getAllPlugins();
```

***

### getProperties()

> **getProperties**(): `Map`\<`string`, `any`\>

Defined in: [src/core/Engine.js:123](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/core/Engine.js#L123)

Get all configuration properties

#### Returns

`Map`\<`string`, `any`\>

Map of all configuration properties

#### Inherited from

[`export=`](../../core/Engine/classes/export=.md).[`getProperties`](../../core/Engine/classes/export=.md#getproperties)

***

### getProperty()

> **getProperty**(`key`, `defaultValue?`): `any`

Defined in: [src/core/Engine.js:114](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/core/Engine.js#L114)

Get configuration property value

#### Parameters

##### key

`string`

Configuration property key

##### defaultValue?

`any` = `null`

Default value if property not found

#### Returns

`any`

Property value or default value

#### Example

```ts
const appName = engine.getProperty('applicationName', 'MyWiki');
```

#### Inherited from

[`export=`](../../core/Engine/classes/export=.md).[`getProperty`](../../core/Engine/classes/export=.md#getproperty)

***

### getRegisteredManagers()

> **getRegisteredManagers**(): `string`[]

Defined in: [src/core/Engine.js:100](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/core/Engine.js#L100)

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

[`export=`](../../core/Engine/classes/export=.md).[`getRegisteredManagers`](../../core/Engine/classes/export=.md#getregisteredmanagers)

***

### getWorkDir()

> **getWorkDir**(): `string`

Defined in: [src/core/Engine.js:150](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/core/Engine.js#L150)

Get working directory path from configuration

#### Returns

`string`

Working directory path (defaults to './')

#### Inherited from

[`export=`](../../core/Engine/classes/export=.md).[`getWorkDir`](../../core/Engine/classes/export=.md#getworkdir)

***

### initialize()

> **initialize**(`config?`): `Promise`\<`WikiEngine`\>

Defined in: [src/WikiEngine.js:127](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/WikiEngine.js#L127)

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

`any` = `{}`

Configuration object (passed to ConfigurationManager)

#### Returns

`Promise`\<`WikiEngine`\>

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

[`export=`](../../core/Engine/classes/export=.md).[`initialize`](../../core/Engine/classes/export=.md#initialize)

***

### initializeManagers()

> `protected` **initializeManagers**(): `Promise`\<`void`\>

Defined in: [src/core/Engine.js:59](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/core/Engine.js#L59)

Initialize all managers

#### Returns

`Promise`\<`void`\>

#### Async

#### Inherited from

[`export=`](../../core/Engine/classes/export=.md).[`initializeManagers`](../../core/Engine/classes/export=.md#initializemanagers)

***

### isConfigured()

> **isConfigured**(): `boolean`

Defined in: [src/core/Engine.js:132](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/core/Engine.js#L132)

Check if engine has been initialized

#### Returns

`boolean`

True if engine is initialized and configured

#### Inherited from

[`export=`](../../core/Engine/classes/export=.md).[`isConfigured`](../../core/Engine/classes/export=.md#isconfigured)

***

### registerManager()

> **registerManager**(`name`, `manager`): `void`

Defined in: [src/core/Engine.js:87](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/core/Engine.js#L87)

Register a manager with the engine

#### Parameters

##### name

`string`

Unique name for the manager

##### manager

`BaseManager`

Manager instance to register

#### Returns

`void`

#### Example

```ts
engine.registerManager('PageManager', new PageManager(engine));
```

#### Inherited from

[`export=`](../../core/Engine/classes/export=.md).[`registerManager`](../../core/Engine/classes/export=.md#registermanager)

***

### setContext()

> **setContext**(`context`): `WikiEngine`

Defined in: [src/WikiEngine.js:73](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/WikiEngine.js#L73)

Sets the currently active WikiContext for the engine

The WikiContext encapsulates request-specific information including
the current user, page, and rendering context.

#### Parameters

##### context

`WikiContext`

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

Defined in: [src/core/Engine.js:160](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/core/Engine.js#L160)

Shutdown the engine and cleanup all managers

#### Returns

`Promise`\<`void`\>

#### Async

#### Inherited from

[`export=`](../../core/Engine/classes/export=.md).[`shutdown`](../../core/Engine/classes/export=.md#shutdown)
