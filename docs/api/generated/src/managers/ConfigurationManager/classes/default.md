[**amdWiki API v1.5.0**](../../../../README.md)

***

[amdWiki API](../../../../README.md) / [src/managers/ConfigurationManager](../README.md) / default

# Class: default

Defined in: [src/managers/ConfigurationManager.ts:47](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/managers/ConfigurationManager.ts#L47)

ConfigurationManager - Handles JSPWiki-compatible configuration management

Implements a hierarchical configuration system that merges multiple configuration
sources in priority order. This allows for flexible deployment configurations while
maintaining sensible defaults.

Configuration merge order (later overrides earlier):
1. app-default-config.json (base defaults - required)
2. app-{environment}-config.json (environment-specific - optional)
3. app-custom-config.json (local overrides - optional)

Environment is determined by NODE_ENV environment variable (default: 'development')

 ConfigurationManager

## See

[BaseManager](../../BaseManager/classes/default.md) for base functionality

## Example

```ts
const configManager = engine.getManager('ConfigurationManager');
const appName = configManager.getApplicationName();
const port = configManager.getServerPort();
```

## Extends

- [`default`](../../BaseManager/classes/default.md)

## Constructors

### Constructor

> **new default**(`engine`): `ConfigurationManager`

Defined in: [src/managers/ConfigurationManager.ts:64](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/managers/ConfigurationManager.ts#L64)

Creates a new ConfigurationManager instance

#### Parameters

##### engine

[`WikiEngine`](../../../types/WikiEngine/interfaces/WikiEngine.md)

The wiki engine instance

#### Returns

`ConfigurationManager`

#### Overrides

[`default`](../../BaseManager/classes/default.md).[`constructor`](../../BaseManager/classes/default.md#constructor)

## Properties

### config?

> `protected` `optional` **config**: `Record`\<`string`, `any`\>

Defined in: [src/managers/BaseManager.ts:63](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/managers/BaseManager.ts#L63)

Configuration passed during initialization

#### Inherited from

[`default`](../../BaseManager/classes/default.md).[`config`](../../BaseManager/classes/default.md#config)

***

### engine

> `protected` **engine**: [`WikiEngine`](../../../types/WikiEngine/interfaces/WikiEngine.md)

Defined in: [src/managers/BaseManager.ts:56](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/managers/BaseManager.ts#L56)

Reference to the wiki engine

#### Inherited from

[`default`](../../BaseManager/classes/default.md).[`engine`](../../BaseManager/classes/default.md#engine)

***

### initialized

> `protected` **initialized**: `boolean`

Defined in: [src/managers/BaseManager.ts:59](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/managers/BaseManager.ts#L59)

Initialization status flag

#### Inherited from

[`default`](../../BaseManager/classes/default.md).[`initialized`](../../BaseManager/classes/default.md#initialized)

## Methods

### backup()

> **backup**(): `Promise`\<[`BackupData`](../../BaseManager/interfaces/BackupData.md)\>

Defined in: [src/managers/ConfigurationManager.ts:604](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/managers/ConfigurationManager.ts#L604)

Backup configuration data

Backs up the custom configuration (user overrides) which can be restored
to recreate the user's configuration settings. We don't backup default or
environment configs as those are part of the codebase.

#### Returns

`Promise`\<[`BackupData`](../../BaseManager/interfaces/BackupData.md)\>

Backup data containing custom configuration

#### Overrides

[`default`](../../BaseManager/classes/default.md).[`backup`](../../BaseManager/classes/default.md#backup)

***

### getAccessControlConfig()

> **getAccessControlConfig**(): `object`

Defined in: [src/managers/ConfigurationManager.ts:463](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/managers/ConfigurationManager.ts#L463)

Get access control configuration

#### Returns

`object`

Access control configuration

##### businessHours

> **businessHours**: `object`

###### businessHours.days

> **days**: `any`

###### businessHours.enabled

> **enabled**: `boolean`

###### businessHours.end

> **end**: `any`

###### businessHours.start

> **start**: `any`

##### contextAware

> **contextAware**: `object`

###### contextAware.enabled

> **enabled**: `boolean`

###### contextAware.timeZone

> **timeZone**: `any`

***

### getAllProperties()

> **getAllProperties**(): [`WikiConfig`](../../../types/Config/interfaces/WikiConfig.md)

Defined in: [src/managers/ConfigurationManager.ts:258](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/managers/ConfigurationManager.ts#L258)

Get all configuration properties

Returns a copy of the entire merged configuration object.

#### Returns

[`WikiConfig`](../../../types/Config/interfaces/WikiConfig.md)

All merged configuration properties

#### Example

```ts
const allConfig = configManager.getAllProperties();
console.log(JSON.stringify(allConfig, null, 2));
```

***

### getApplicationName()

> **getApplicationName**(): `string`

Defined in: [src/managers/ConfigurationManager.ts:270](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/managers/ConfigurationManager.ts#L270)

Get application name

#### Returns

`string`

Application name (defaults to 'amdWiki')

#### Example

```ts
const name = configManager.getApplicationName(); // 'amdWiki'
```

***

### getAuditConfig()

> **getAuditConfig**(): `object`

Defined in: [src/managers/ConfigurationManager.ts:494](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/managers/ConfigurationManager.ts#L494)

Get audit configuration

#### Returns

`object`

Audit configuration

##### enabled

> **enabled**: `boolean`

##### includeContext

> **includeContext**: `object`

###### includeContext.decision

> **decision**: `boolean`

###### includeContext.ip

> **ip**: `boolean`

###### includeContext.reason

> **reason**: `boolean`

###### includeContext.timestamp

> **timestamp**: `boolean`

###### includeContext.userAgent

> **userAgent**: `boolean`

##### logDirectory

> **logDirectory**: `any`

##### logFile

> **logFile**: `any`

##### retention

> **retention**: `object`

###### retention.maxAge

> **maxAge**: `any`

###### retention.maxFiles

> **maxFiles**: `number`

***

### getBaseURL()

> **getBaseURL**(): `string`

Defined in: [src/managers/ConfigurationManager.ts:279](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/managers/ConfigurationManager.ts#L279)

Get base URL for the wiki

#### Returns

`string`

Base URL (defaults to 'http://localhost:3000')

***

### getCustomProperties()

> **getCustomProperties**(): `Partial`\<[`WikiConfig`](../../../types/Config/interfaces/WikiConfig.md)\>

Defined in: [src/managers/ConfigurationManager.ts:579](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/managers/ConfigurationManager.ts#L579)

Get custom configuration for admin UI

Returns only the custom overrides, useful for displaying
which settings have been customized.

#### Returns

`Partial`\<[`WikiConfig`](../../../types/Config/interfaces/WikiConfig.md)\>

Custom configuration properties only

#### Example

```ts
const customSettings = configManager.getCustomProperties();
console.log('Customized settings:', Object.keys(customSettings));
```

***

### getDefaultProperties()

> **getDefaultProperties**(): [`WikiConfig`](../../../types/Config/interfaces/WikiConfig.md)

Defined in: [src/managers/ConfigurationManager.ts:591](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/managers/ConfigurationManager.ts#L591)

Get default configuration for comparison

Returns the base default configuration, useful for comparison
with current settings or resetting individual properties.

#### Returns

[`WikiConfig`](../../../types/Config/interfaces/WikiConfig.md)

Default configuration properties

***

### getDirectories()

> **getDirectories**(): `object`

Defined in: [src/managers/ConfigurationManager.ts:352](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/managers/ConfigurationManager.ts#L352)

Get directory paths

#### Returns

`object`

Directory configuration

##### data

> **data**: `any`

##### pages

> **pages**: `any`

##### resources

> **resources**: `any`

##### templates

> **templates**: `any`

##### work

> **work**: `any`

***

### getEncoding()

> **getEncoding**(): `string`

Defined in: [src/managers/ConfigurationManager.ts:296](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/managers/ConfigurationManager.ts#L296)

Get encoding

#### Returns

`string`

Encoding

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

[`default`](../../BaseManager/classes/default.md).[`getEngine`](../../BaseManager/classes/default.md#getengine)

***

### getFeatureConfig()

> **getFeatureConfig**(`featureName`): `object`

Defined in: [src/managers/ConfigurationManager.ts:408](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/managers/ConfigurationManager.ts#L408)

Get feature configuration

#### Parameters

##### featureName

`string`

Name of feature

#### Returns

`object`

Feature configuration

##### enabled

> **enabled**: `boolean`

***

### getFrontPage()

> **getFrontPage**(): `string`

Defined in: [src/managers/ConfigurationManager.ts:288](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/managers/ConfigurationManager.ts#L288)

Get front page name

#### Returns

`string`

Front page name (defaults to 'Welcome')

***

### getLoggingConfig()

> **getLoggingConfig**(): `object`

Defined in: [src/managers/ConfigurationManager.ts:431](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/managers/ConfigurationManager.ts#L431)

Get logging configuration

#### Returns

`object`

Logging configuration

##### dir

> **dir**: `any`

##### level

> **level**: `any`

##### maxFiles

> **maxFiles**: `number`

##### maxSize

> **maxSize**: `any`

***

### getManagerConfig()

> **getManagerConfig**(`managerName`): `object`

Defined in: [src/managers/ConfigurationManager.ts:384](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/managers/ConfigurationManager.ts#L384)

Get manager-specific configuration

Retrieves all configuration properties for a specific manager,
including enabled status and manager-specific settings.

#### Parameters

##### managerName

`string`

Name of the manager

#### Returns

`object`

Manager configuration object with enabled flag and settings

##### enabled

> **enabled**: `boolean`

#### Example

```ts
const searchConfig = configManager.getManagerConfig('SearchManager');
if (searchConfig.enabled) {
  // Use search manager
}
```

***

### getProperty()

> **getProperty**(`key`, `defaultValue?`): `any`

Defined in: [src/managers/ConfigurationManager.ts:184](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/managers/ConfigurationManager.ts#L184)

Get a configuration property value

Retrieves a property from the merged configuration with optional default value.
Checks environment variables first for specific keys (Docker/Traefik support).

Priority order:
1. Environment variables (for Docker/Traefik deployments)
2. Merged configuration (from config files)
3. Default value parameter

#### Parameters

##### key

`string`

Configuration property key

##### defaultValue?

`any` = `null`

Default value if property not found

#### Returns

`any`

Configuration value or default

#### Example

```ts
const appName = configManager.getProperty('amdwiki.applicationName', 'MyWiki');
```

***

### getRSSConfig()

> **getRSSConfig**(): `object`

Defined in: [src/managers/ConfigurationManager.ts:532](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/managers/ConfigurationManager.ts#L532)

Get RSS settings

#### Returns

`object`

RSS configuration

##### channelDescription

> **channelDescription**: `any`

##### channelTitle

> **channelTitle**: `any`

##### fileName

> **fileName**: `any`

##### generate

> **generate**: `any`

##### interval

> **interval**: `any`

***

### getSearchConfig()

> **getSearchConfig**(): `object`

Defined in: [src/managers/ConfigurationManager.ts:449](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/managers/ConfigurationManager.ts#L449)

Get search configuration

#### Returns

`object`

Search configuration

##### enabled

> **enabled**: `boolean`

##### indexDir

> **indexDir**: `any`

***

### getServerHost()

> **getServerHost**(): `string`

Defined in: [src/managers/ConfigurationManager.ts:312](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/managers/ConfigurationManager.ts#L312)

Get server host

#### Returns

`string`

Server host

***

### getServerPort()

> **getServerPort**(): `number`

Defined in: [src/managers/ConfigurationManager.ts:304](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/managers/ConfigurationManager.ts#L304)

Get server port

#### Returns

`number`

Server port

***

### getSessionHttpOnly()

> **getSessionHttpOnly**(): `boolean`

Defined in: [src/managers/ConfigurationManager.ts:344](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/managers/ConfigurationManager.ts#L344)

Get session httpOnly flag

#### Returns

`boolean`

Session httpOnly flag

***

### getSessionMaxAge()

> **getSessionMaxAge**(): `number`

Defined in: [src/managers/ConfigurationManager.ts:328](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/managers/ConfigurationManager.ts#L328)

Get session max age in milliseconds

#### Returns

`number`

Session max age

***

### getSessionSecret()

> **getSessionSecret**(): `string`

Defined in: [src/managers/ConfigurationManager.ts:320](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/managers/ConfigurationManager.ts#L320)

Get session secret

#### Returns

`string`

Session secret

***

### getSessionSecure()

> **getSessionSecure**(): `boolean`

Defined in: [src/managers/ConfigurationManager.ts:336](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/managers/ConfigurationManager.ts#L336)

Get session secure flag

#### Returns

`boolean`

Session secure flag

***

### initialize()

> **initialize**(`config`): `Promise`\<`void`\>

Defined in: [src/managers/ConfigurationManager.ts:88](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/managers/ConfigurationManager.ts#L88)

Initialize the configuration manager

Loads and merges all configuration files in the correct priority order.

#### Parameters

##### config

`Record`\<`string`, `unknown`\> = `{}`

#### Returns

`Promise`\<`void`\>

#### Async

#### Throws

If default configuration file is not found

#### Overrides

[`default`](../../BaseManager/classes/default.md).[`initialize`](../../BaseManager/classes/default.md#initialize)

***

### isInitialized()

> **isInitialized**(): `boolean`

Defined in: [src/managers/BaseManager.ts:114](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/managers/BaseManager.ts#L114)

Check if manager has been initialized

#### Returns

`boolean`

True if manager is initialized

#### Example

```ts
if (manager.isInitialized()) {
  // Safe to use manager
}
```

#### Inherited from

[`default`](../../BaseManager/classes/default.md).[`isInitialized`](../../BaseManager/classes/default.md#isinitialized)

***

### reload()

> **reload**(): `Promise`\<`void`\>

Defined in: [src/managers/ConfigurationManager.ts:105](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/managers/ConfigurationManager.ts#L105)

Reload configuration from disk

#### Returns

`Promise`\<`void`\>

***

### resetToDefaults()

> **resetToDefaults**(): `Promise`\<`void`\>

Defined in: [src/managers/ConfigurationManager.ts:561](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/managers/ConfigurationManager.ts#L561)

Reset configuration to defaults (admin only)

Clears all custom configuration and resets to default values.
This operation persists the empty custom configuration to disk.

#### Returns

`Promise`\<`void`\>

#### Async

#### Example

```ts
await configManager.resetToDefaults();
console.log('Configuration reset to defaults');
```

***

### restore()

> **restore**(`backupData`): `Promise`\<`void`\>

Defined in: [src/managers/ConfigurationManager.ts:661](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/managers/ConfigurationManager.ts#L661)

Restore configuration from backup data

Restores the custom configuration (user overrides) from backup data.
This will overwrite the current custom configuration file and reload
all configurations to rebuild the merged config.

#### Parameters

##### backupData

[`BackupData`](../../BaseManager/interfaces/BackupData.md)

Backup data from backup() method

#### Returns

`Promise`\<`void`\>

#### Overrides

[`default`](../../BaseManager/classes/default.md).[`restore`](../../BaseManager/classes/default.md#restore)

***

### setProperty()

> **setProperty**(`key`, `value`): `Promise`\<`void`\>

Defined in: [src/managers/ConfigurationManager.ts:215](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/managers/ConfigurationManager.ts#L215)

Set a configuration property (updates custom config)

Sets a property value and persists it to the custom configuration file.
This allows runtime configuration changes that survive restarts.

#### Parameters

##### key

`string`

Configuration property key

##### value

`any`

Configuration value to set

#### Returns

`Promise`\<`void`\>

#### Async

#### Example

```ts
await configManager.setProperty('amdwiki.applicationName', 'My Custom Wiki');
```

***

### shutdown()

> **shutdown**(): `Promise`\<`void`\>

Defined in: [src/managers/BaseManager.ts:143](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/managers/BaseManager.ts#L143)

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

#### Inherited from

[`default`](../../BaseManager/classes/default.md).[`shutdown`](../../BaseManager/classes/default.md#shutdown)
