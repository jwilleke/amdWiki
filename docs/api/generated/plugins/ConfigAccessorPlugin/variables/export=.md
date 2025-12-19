[**amdWiki API v1.5.0**](../../../README.md)

***

[amdWiki API](../../../README.md) / [plugins/ConfigAccessorPlugin](../README.md) / export=

# Variable: export=

> `const` **export=**: `object`

Defined in: [plugins/ConfigAccessorPlugin.js:31](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/plugins/ConfigAccessorPlugin.js#L31)

ConfigAccessorPlugin implementation

## Type Declaration

### author

> **author**: `string` = `'amdWiki'`

### description

> **description**: `string` = `'Access configuration values including roles, features, and system settings'`

### displayActions()

> **displayActions**(`configManager`, `valueonly`, `before`, `after`): `string`

Display all unique actions from access policies

#### Parameters

##### configManager

`any`

ConfigurationManager instance

##### valueonly

`boolean` = `false`

If true, return only the action values

##### before

`string` = `''`

String to prepend before each action

##### after

`string` = `undefined`

String to append after each action

#### Returns

`string`

HTML output or plain text

### displayConfigValue()

> **displayConfigValue**(`configManager`, `key`, `valueonly`, `before`, `after`): `string`

Display config value(s) with optional wildcard support

#### Parameters

##### configManager

`any`

ConfigurationManager instance

##### key

`string`

Config key (dot-notation, supports wildcards with *)

##### valueonly

`boolean` = `false`

If true, return only the value(s) without HTML formatting

##### before

`string` = `''`

String to prepend before each value (default: '')

##### after

`string` = `undefined`

String to append after each value (default: '' for single, '\n' for multiple)

#### Returns

`string`

HTML output or plain text

### displayFeatureConfig()

> **displayFeatureConfig**(`configManager`, `featureName`): `string`

Display feature-specific configuration

#### Parameters

##### configManager

`any`

ConfigurationManager instance

##### featureName

`string`

Name of the feature

#### Returns

`string`

HTML output

### displayManagerConfig()

> **displayManagerConfig**(`configManager`, `managerName`): `string`

Display manager-specific configuration

#### Parameters

##### configManager

`any`

ConfigurationManager instance

##### managerName

`string`

Name of the manager

#### Returns

`string`

HTML output

### displayPermissions()

> **displayPermissions**(`userManager`): `string`

Display Security Policy Summary - permissions matrix showing which roles have which permissions

#### Parameters

##### userManager

`any`

UserManager instance

#### Returns

`string`

HTML output

### displayRoles()

> **displayRoles**(`userManager`): `string`

Display all roles

#### Parameters

##### userManager

`any`

UserManager instance

#### Returns

`string`

HTML output

### displaySystemCategories()

> **displaySystemCategories**(`configManager`, `opts`, `valueonly`, `before`, `after`): `string`

Display system categories with optional filtering

#### Parameters

##### configManager

`any`

ConfigurationManager instance

##### opts

`any` = `{}`

Filter options (label, enabled, default, storageLocation, etc.)

##### valueonly

`boolean` = `false`

If true, return only the label values

##### before

`string` = `''`

String to prepend before each value

##### after

`string` = `undefined`

String to append after each value

#### Returns

`string`

HTML output or plain text

### displaySystemKeywords()

> **displaySystemKeywords**(`configManager`, `opts`, `valueonly`, `before`, `after`): `string`

Display system keywords with optional filtering

#### Parameters

##### configManager

`any`

ConfigurationManager instance

##### opts

`any` = `{}`

Filter options (label, enabled, category, etc.)

##### valueonly

`boolean` = `false`

If true, return only the label values

##### before

`string` = `''`

String to prepend before each value

##### after

`string` = `undefined`

String to append after each value

#### Returns

`string`

HTML output or plain text

### displayUserKeywords()

> **displayUserKeywords**(`configManager`, `opts`, `valueonly`, `before`, `after`): `string`

Display user keywords with optional filtering

#### Parameters

##### configManager

`any`

ConfigurationManager instance

##### opts

`any` = `{}`

Filter options (label, enabled, category, restrictEditing, etc.)

##### valueonly

`boolean` = `false`

If true, return only the label values

##### before

`string` = `''`

String to prepend before each value

##### after

`string` = `undefined`

String to append after each value

#### Returns

`string`

HTML output or plain text

### displayUserSummary()

> **displayUserSummary**(`context`, `userManager`): `string`

Display current user summary - roles and permissions from WikiContext

#### Parameters

##### context

`any`

Wiki context containing user information

##### userManager

`any`

UserManager instance

#### Returns

`string`

HTML output

### execute()

> **execute**(`context`, `params`): `Promise`\<`string`\>

Execute the plugin

#### Parameters

##### context

`any`

Wiki context containing engine reference

##### params

`any`

Plugin parameters

#### Returns

`Promise`\<`string`\>

HTML output or plain text

### initialize()

> **initialize**(`engine`): `void`

Plugin initialization (JSPWiki-style)

#### Parameters

##### engine

`any`

Wiki engine instance

#### Returns

`void`

### name

> **name**: `string` = `'ConfigAccessorPlugin'`

### processEscapeSequences()

> **processEscapeSequences**(`str`): `string`

Process escape sequences in strings (e.g., \n, \t, \\)

#### Parameters

##### str

`string`

String to process

#### Returns

`string`

Processed string with escape sequences converted

### version

> **version**: `string` = `'2.7.0'`
