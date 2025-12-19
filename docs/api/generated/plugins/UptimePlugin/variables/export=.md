[**amdWiki API v1.5.0**](../../../README.md)

***

[amdWiki API](../../../README.md) / [plugins/UptimePlugin](../README.md) / export=

# Variable: export=

> `const` **export=**: `object`

Defined in: [plugins/UptimePlugin.js:6](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/plugins/UptimePlugin.js#L6)

UptimePlugin - JSPWiki-style uptime plugin
Returns the server uptime in human-readable format

## Type Declaration

### author

> **author**: `string` = `'amdWiki'`

### description

> **description**: `string` = `'Shows the server uptime'`

### execute()

> **execute**(`context`, `params`): `string`

Execute the plugin

#### Parameters

##### context

`any`

Wiki context

##### params

`any`

Plugin parameters

#### Returns

`string`

HTML output

### formatUptime()

> **formatUptime**(`seconds`): `string`

Format uptime in human-readable format

#### Parameters

##### seconds

`number`

Uptime in seconds

#### Returns

`string`

Formatted uptime

### name

> **name**: `string` = `'UptimePlugin'`

### version

> **version**: `string` = `'1.0.0'`
