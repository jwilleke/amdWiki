[**amdWiki API v1.5.0**](../../../../README.md)

***

[amdWiki API](../../../../README.md) / [src/core/Engine](../README.md) / default

# Abstract Class: default

Defined in: [src/core/Engine.ts:18](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/core/Engine.ts#L18)

Engine interface - Main wiki engine following JSPWiki architecture

Provides Wiki services to the application. There's basically only a single Engine
for each web application instance. This is the base class that WikiEngine extends.

 Engine

## Extended by

- [`default`](../../../WikiEngine/classes/default.md)

## Constructors

### Constructor

> **new default**(): `Engine`

Defined in: [src/core/Engine.ts:36](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/core/Engine.ts#L36)

Creates a new Engine instance

#### Returns

`Engine`

## Properties

### config?

> `optional` **config**: [`WikiConfig`](../../../types/Config/interfaces/WikiConfig.md)

Defined in: [src/core/Engine.ts:29](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/core/Engine.ts#L29)

Configuration object passed during initialization

***

### initialized

> `protected` **initialized**: `boolean`

Defined in: [src/core/Engine.ts:26](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/core/Engine.ts#L26)

Flag indicating if engine has been initialized

***

### managers

> `protected` **managers**: `Map`\<`string`, [`default`](../../../managers/BaseManager/classes/default.md)\>

Defined in: [src/core/Engine.ts:20](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/core/Engine.ts#L20)

Map of registered manager instances keyed by name

***

### properties

> `protected` **properties**: `Map`\<`string`, `unknown`\>

Defined in: [src/core/Engine.ts:23](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/core/Engine.ts#L23)

Map of configuration properties

## Methods

### getApplicationName()

> **getApplicationName**(): `string`

Defined in: [src/core/Engine.ts:160](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/core/Engine.ts#L160)

Get application name from configuration

#### Returns

`string`

Application name (defaults to 'amdWiki')

***

### getConfig()

> **getConfig**(): [`WikiConfig`](../../../types/Config/interfaces/WikiConfig.md)

Defined in: [src/core/Engine.ts:178](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/core/Engine.ts#L178)

Get configuration object

#### Returns

[`WikiConfig`](../../../types/Config/interfaces/WikiConfig.md)

Configuration object

***

### getManager()

> **getManager**\<`T`\>(`managerName`): `T`

Defined in: [src/core/Engine.ts:91](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/core/Engine.ts#L91)

Get a manager instance by class/name

#### Type Parameters

##### T

`T` = [`default`](../../../managers/BaseManager/classes/default.md)

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

***

### getProperties()

> **getProperties**(): `Map`\<`string`, `unknown`\>

Defined in: [src/core/Engine.ts:142](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/core/Engine.ts#L142)

Get all configuration properties

#### Returns

`Map`\<`string`, `unknown`\>

Map of all configuration properties

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

***

### getWorkDir()

> **getWorkDir**(): `string`

Defined in: [src/core/Engine.ts:169](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/core/Engine.ts#L169)

Get working directory path from configuration

#### Returns

`string`

Working directory path (defaults to './')

***

### initialize()

> **initialize**(`config`): `Promise`\<`void`\>

Defined in: [src/core/Engine.ts:50](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/core/Engine.ts#L50)

Initialize the engine with configuration

#### Parameters

##### config

[`WikiConfig`](../../../types/Config/interfaces/WikiConfig.md) = `...`

Configuration object containing engine settings

#### Returns

`Promise`\<`void`\>

#### Async

#### Throws

If engine is already initialized

***

### initializeManagers()

> `protected` **initializeManagers**(): `Promise`\<`void`\>

Defined in: [src/core/Engine.ts:76](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/core/Engine.ts#L76)

Initialize all managers

To be implemented by subclasses.
Subclasses can make this async if needed.

#### Returns

`Promise`\<`void`\>

***

### isConfigured()

> **isConfigured**(): `boolean`

Defined in: [src/core/Engine.ts:151](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/core/Engine.ts#L151)

Check if engine has been initialized

#### Returns

`boolean`

True if engine is initialized and configured

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

[`default`](../../../managers/BaseManager/classes/default.md)

Manager instance to register

#### Returns

`void`

#### Example

```ts
engine.registerManager('PageManager', new PageManager(engine));
```

***

### shutdown()

> **shutdown**(): `Promise`\<`void`\>

Defined in: [src/core/Engine.ts:188](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/core/Engine.ts#L188)

Shutdown the engine and cleanup all managers

#### Returns

`Promise`\<`void`\>

#### Async
