[**amdWiki API v1.5.0**](../../../../README.md)

***

[amdWiki API](../../../../README.md) / [src/core/Engine](../README.md) / export=

# Abstract Class: export=

Defined in: [src/core/Engine.js:15](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/core/Engine.js#L15)

Engine interface - Main wiki engine following JSPWiki architecture

Provides Wiki services to the application. There's basically only a single Engine
for each web application instance. This is the base class that WikiEngine extends.

 Engine

## Extended by

- [`export=`](../../../WikiEngine/classes/export=.md)

## Constructors

### Constructor

> **new export=**(): `Engine`

Defined in: [src/core/Engine.js:21](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/core/Engine.js#L21)

Creates a new Engine instance

#### Returns

`Engine`

## Properties

### config

> **config**: `any`

Defined in: [src/core/Engine.js:42](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/core/Engine.js#L42)

Configuration object passed during initialization

***

### initialized

> **initialized**: `boolean`

Defined in: [src/core/Engine.js:24](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/core/Engine.js#L24)

Flag indicating if engine has been initialized

***

### managers

> **managers**: `Map`\<`any`, `any`\>

Defined in: [src/core/Engine.js:22](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/core/Engine.js#L22)

Map of registered manager instances keyed by name

***

### properties

> **properties**: `Map`\<`any`, `any`\>

Defined in: [src/core/Engine.js:23](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/core/Engine.js#L23)

Map of configuration properties

## Methods

### getApplicationName()

> **getApplicationName**(): `string`

Defined in: [src/core/Engine.js:141](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/core/Engine.js#L141)

Get application name from configuration

#### Returns

`string`

Application name (defaults to 'amdWiki')

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

***

### getProperties()

> **getProperties**(): `Map`\<`string`, `any`\>

Defined in: [src/core/Engine.js:123](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/core/Engine.js#L123)

Get all configuration properties

#### Returns

`Map`\<`string`, `any`\>

Map of all configuration properties

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

***

### getWorkDir()

> **getWorkDir**(): `string`

Defined in: [src/core/Engine.js:150](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/core/Engine.js#L150)

Get working directory path from configuration

#### Returns

`string`

Working directory path (defaults to './')

***

### initialize()

> **initialize**(`config`): `Promise`\<`void`\>

Defined in: [src/core/Engine.js:35](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/core/Engine.js#L35)

Initialize the engine with configuration

#### Parameters

##### config

`any` = `{}`

Configuration object containing engine settings

#### Returns

`Promise`\<`void`\>

#### Async

#### Throws

If engine is already initialized

***

### initializeManagers()

> `protected` **initializeManagers**(): `Promise`\<`void`\>

Defined in: [src/core/Engine.js:59](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/core/Engine.js#L59)

Initialize all managers

#### Returns

`Promise`\<`void`\>

#### Async

***

### isConfigured()

> **isConfigured**(): `boolean`

Defined in: [src/core/Engine.js:132](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/core/Engine.js#L132)

Check if engine has been initialized

#### Returns

`boolean`

True if engine is initialized and configured

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

***

### shutdown()

> **shutdown**(): `Promise`\<`void`\>

Defined in: [src/core/Engine.js:160](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/core/Engine.js#L160)

Shutdown the engine and cleanup all managers

#### Returns

`Promise`\<`void`\>

#### Async
