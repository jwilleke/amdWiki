[**amdWiki API v1.5.0**](../../../../README.md)

***

[amdWiki API](../../../../README.md) / [src/managers/ConfigurationManager](../README.md) / export=

# Class: export=

Defined in: [src/managers/ConfigurationManager.js:37](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/managers/ConfigurationManager.js#L37)

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

BaseManager for base functionality

## Example

```ts
const configManager = engine.getManager('ConfigurationManager');
const appName = configManager.getApplicationName();
const port = configManager.getServerPort();
```

## Constructors

### Constructor

> **new export=**(`engine`): `ConfigurationManager`

Defined in: [src/managers/ConfigurationManager.js:44](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/managers/ConfigurationManager.js#L44)

Creates a new ConfigurationManager instance

#### Parameters

##### engine

`WikiEngine`

The wiki engine instance

#### Returns

`ConfigurationManager`

## Properties

### customConfig

> **customConfig**: `any`

Defined in: [src/managers/ConfigurationManager.js:48](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/managers/ConfigurationManager.js#L48)

Custom local overrides (optional)

***

### customConfigPath

> **customConfigPath**: `string`

Defined in: [src/managers/ConfigurationManager.js:55](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/managers/ConfigurationManager.js#L55)

Path to custom config file

***

### defaultConfig

> **defaultConfig**: `any`

Defined in: [src/managers/ConfigurationManager.js:46](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/managers/ConfigurationManager.js#L46)

Default configuration (required)

***

### defaultConfigPath

> **defaultConfigPath**: `string`

Defined in: [src/managers/ConfigurationManager.js:53](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/managers/ConfigurationManager.js#L53)

Path to default config file

***

### engine

> **engine**: `WikiEngine`

Defined in: [src/managers/ConfigurationManager.js:45](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/managers/ConfigurationManager.js#L45)

Reference to the wiki engine

***

### environment

> **environment**: `string`

Defined in: [src/managers/ConfigurationManager.js:50](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/managers/ConfigurationManager.js#L50)

Current environment (from NODE_ENV)

***

### environmentConfig

> **environmentConfig**: `object`

Defined in: [src/managers/ConfigurationManager.js:47](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/managers/ConfigurationManager.js#L47)

Environment-specific configuration (optional)

***

### environmentConfigPath

> **environmentConfigPath**: `string`

Defined in: [src/managers/ConfigurationManager.js:54](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/managers/ConfigurationManager.js#L54)

Path to environment config file

***

### mergedConfig

> **mergedConfig**: `any`

Defined in: [src/managers/ConfigurationManager.js:49](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/managers/ConfigurationManager.js#L49)

Final merged configuration

## Methods

### backup()

> **backup**(): `Promise`\<`any`\>

Defined in: [src/managers/ConfigurationManager.js:536](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/managers/ConfigurationManager.js#L536)

Backup configuration data

Backs up the custom configuration (user overrides) which can be restored
to recreate the user's configuration settings. We don't backup default or
environment configs as those are part of the codebase.

#### Returns

`Promise`\<`any`\>

Backup data containing custom configuration

***

### getAccessControlConfig()

> **getAccessControlConfig**(): `any`

Defined in: [src/managers/ConfigurationManager.js:415](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/managers/ConfigurationManager.js#L415)

Get access control configuration

#### Returns

`any`

Access control configuration

***

### getAllProperties()

> **getAllProperties**(): `any`

Defined in: [src/managers/ConfigurationManager.js:224](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/managers/ConfigurationManager.js#L224)

Get all configuration properties

Returns a copy of the entire merged configuration object.

#### Returns

`any`

All merged configuration properties

#### Example

```ts
const allConfig = configManager.getAllProperties();
console.log(JSON.stringify(allConfig, null, 2));
```

***

### getApplicationName()

> **getApplicationName**(): `string`

Defined in: [src/managers/ConfigurationManager.js:236](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/managers/ConfigurationManager.js#L236)

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

> **getAuditConfig**(): `any`

Defined in: [src/managers/ConfigurationManager.js:435](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/managers/ConfigurationManager.js#L435)

Get audit configuration

#### Returns

`any`

Audit configuration

***

### getBaseURL()

> **getBaseURL**(): `string`

Defined in: [src/managers/ConfigurationManager.js:245](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/managers/ConfigurationManager.js#L245)

Get base URL for the wiki

#### Returns

`string`

Base URL (defaults to 'http://localhost:3000')

***

### getCustomProperties()

> **getCustomProperties**(): `any`

Defined in: [src/managers/ConfigurationManager.js:511](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/managers/ConfigurationManager.js#L511)

Get custom configuration for admin UI

Returns only the custom overrides, useful for displaying
which settings have been customized.

#### Returns

`any`

Custom configuration properties only

#### Example

```ts
const customSettings = configManager.getCustomProperties();
console.log('Customized settings:', Object.keys(customSettings));
```

***

### getDefaultProperties()

> **getDefaultProperties**(): `any`

Defined in: [src/managers/ConfigurationManager.js:523](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/managers/ConfigurationManager.js#L523)

Get default configuration for comparison

Returns the base default configuration, useful for comparison
with current settings or resetting individual properties.

#### Returns

`any`

Default configuration properties

***

### getDirectories()

> **getDirectories**(): `any`

Defined in: [src/managers/ConfigurationManager.js:318](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/managers/ConfigurationManager.js#L318)

Get directory paths

#### Returns

`any`

Directory configuration

***

### getEncoding()

> **getEncoding**(): `string`

Defined in: [src/managers/ConfigurationManager.js:262](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/managers/ConfigurationManager.js#L262)

Get encoding

#### Returns

`string`

Encoding

***

### getFeatureConfig()

> **getFeatureConfig**(`featureName`): `any`

Defined in: [src/managers/ConfigurationManager.js:368](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/managers/ConfigurationManager.js#L368)

Get feature configuration

#### Parameters

##### featureName

`string`

Name of feature

#### Returns

`any`

Feature configuration

***

### getFrontPage()

> **getFrontPage**(): `string`

Defined in: [src/managers/ConfigurationManager.js:254](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/managers/ConfigurationManager.js#L254)

Get front page name

#### Returns

`string`

Front page name (defaults to 'Welcome')

***

### getLoggingConfig()

> **getLoggingConfig**(): `any`

Defined in: [src/managers/ConfigurationManager.js:391](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/managers/ConfigurationManager.js#L391)

Get logging configuration

#### Returns

`any`

Logging configuration

***

### getManagerConfig()

> **getManagerConfig**(`managerName`): `any`

Defined in: [src/managers/ConfigurationManager.js:344](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/managers/ConfigurationManager.js#L344)

Get manager-specific configuration

Retrieves all configuration properties for a specific manager,
including enabled status and manager-specific settings.

#### Parameters

##### managerName

`string`

Name of the manager

#### Returns

`any`

Manager configuration object with enabled flag and settings

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

Defined in: [src/managers/ConfigurationManager.js:152](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/managers/ConfigurationManager.js#L152)

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

> **getRSSConfig**(): `any`

Defined in: [src/managers/ConfigurationManager.js:458](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/managers/ConfigurationManager.js#L458)

Get RSS settings

#### Returns

`any`

RSS configuration

***

### getSearchConfig()

Get search configuration

#### Call Signature

> **getSearchConfig**(): `any`

Defined in: [src/managers/ConfigurationManager.js:404](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/managers/ConfigurationManager.js#L404)

##### Returns

`any`

#### Call Signature

> **getSearchConfig**(): `any`

Defined in: [src/managers/ConfigurationManager.js:472](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/managers/ConfigurationManager.js#L472)

Get search configuration

##### Returns

`any`

Search configuration

***

### getServerHost()

> **getServerHost**(): `string`

Defined in: [src/managers/ConfigurationManager.js:278](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/managers/ConfigurationManager.js#L278)

Get server host

#### Returns

`string`

Server host

***

### getServerPort()

> **getServerPort**(): `number`

Defined in: [src/managers/ConfigurationManager.js:270](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/managers/ConfigurationManager.js#L270)

Get server port

#### Returns

`number`

Server port

***

### getSessionHttpOnly()

> **getSessionHttpOnly**(): `boolean`

Defined in: [src/managers/ConfigurationManager.js:310](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/managers/ConfigurationManager.js#L310)

Get session httpOnly flag

#### Returns

`boolean`

Session httpOnly flag

***

### getSessionMaxAge()

> **getSessionMaxAge**(): `number`

Defined in: [src/managers/ConfigurationManager.js:294](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/managers/ConfigurationManager.js#L294)

Get session max age in milliseconds

#### Returns

`number`

Session max age

***

### getSessionSecret()

> **getSessionSecret**(): `string`

Defined in: [src/managers/ConfigurationManager.js:286](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/managers/ConfigurationManager.js#L286)

Get session secret

#### Returns

`string`

Session secret

***

### getSessionSecure()

> **getSessionSecure**(): `boolean`

Defined in: [src/managers/ConfigurationManager.js:302](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/managers/ConfigurationManager.js#L302)

Get session secure flag

#### Returns

`boolean`

Session secure flag

***

### initialize()

> **initialize**(): `Promise`\<`void`\>

Defined in: [src/managers/ConfigurationManager.js:67](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/managers/ConfigurationManager.js#L67)

Initialize the configuration manager

Loads and merges all configuration files in the correct priority order.

#### Returns

`Promise`\<`void`\>

#### Async

#### Throws

If default configuration file is not found

***

### resetToDefaults()

> **resetToDefaults**(): `Promise`\<`void`\>

Defined in: [src/managers/ConfigurationManager.js:493](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/managers/ConfigurationManager.js#L493)

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

Defined in: [src/managers/ConfigurationManager.js:594](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/managers/ConfigurationManager.js#L594)

Restore configuration from backup data

Restores the custom configuration (user overrides) from backup data.
This will overwrite the current custom configuration file and reload
all configurations to rebuild the merged config.

#### Parameters

##### backupData

`any`

Backup data from backup() method

#### Returns

`Promise`\<`void`\>

***

### setProperty()

> **setProperty**(`key`, `value`): `Promise`\<`void`\>

Defined in: [src/managers/ConfigurationManager.js:183](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/managers/ConfigurationManager.js#L183)

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
