[**amdWiki API v1.5.0**](../../../README.md)

***

[amdWiki API](../../../README.md) / [plugins/CurrentTimePlugin](../README.md) / export=

# Variable: export=

> `const` **export=**: `object`

Defined in: [plugins/CurrentTimePlugin.js:18](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/plugins/CurrentTimePlugin.js#L18)

CurrentTimePlugin - JSPWiki-style plugin for amdWiki
Displays current date/time with customizable formatting

Respects user preferences for:

- Locale (from profile settings)
- Timezone (from profile settings)
- Date Format (from profile settings)
- Time Format (12h/24h from profile settings)

Syntax examples:
[{CurrentTimePlugin}] - Uses user preferences
[{CurrentTimePlugin format='yyyy-MM-dd HH:mm:ss'}] - Custom format
[{CurrentTimePlugin format='hh:mm a'}] - Custom time format
[{CurrentTimePlugin format='EEEE, MMMM d, yyyy'}] - Custom date format

## Type Declaration

### author

> **author**: `string` = `'amdWiki'`

### description

> **description**: `string` = `'Displays current date and time with user locale/timezone preferences'`

### execute()

> **execute**(`context`, `params`): `string`

Execute the plugin

#### Parameters

##### context

`any`

Wiki context containing user preferences

##### params

`any`

Plugin parameters

#### Returns

`string`

Formatted date/time string

### formatWithPattern()

> **formatWithPattern**(`date`, `pattern`, `locale`, `timezone`, `hour12`): `string`

Format date/time with custom pattern (Java SimpleDateFormat-style)

#### Parameters

##### date

`Date`

Date to format

##### pattern

`string`

Format pattern

##### locale

`string`

Locale for formatting

##### timezone

`string`

Timezone for formatting

##### hour12

`boolean`

Use 12-hour format

#### Returns

`string`

Formatted date/time

### formatWithUserPreferences()

> **formatWithUserPreferences**(`date`, `locale`, `timezone`, `timeFormat`, `dateFormat`): `string`

Format date/time using user preferences

#### Parameters

##### date

`Date`

Date to format

##### locale

`string`

User's locale preference

##### timezone

`string`

User's timezone preference

##### timeFormat

`string`

'12h' or '24h'

##### dateFormat

`string`

User's date format preference

#### Returns

`string`

Formatted date/time

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

> **name**: `string` = `'CurrentTimePlugin'`

### version

> **version**: `string` = `'1.0.0'`
