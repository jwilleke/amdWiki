[**amdWiki API v1.5.0**](../../../README.md)

***

[amdWiki API](../../../README.md) / [plugins/SessionsPlugin](../README.md) / export=

# Variable: export=

> `const` **export=**: `object`

Defined in: [plugins/SessionsPlugin.js:6](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/plugins/SessionsPlugin.js#L6)

SessionsPlugin - JSPWiki-style sessions plugin
Returns the number of active sessions

## Type Declaration

### author

> **author**: `string` = `'amdWiki'`

### description

> **description**: `string` = `'Shows the number of active sessions'`

### execute()

> **execute**(`context`, `params`): `string`

Execute the plugin

#### Parameters

##### context

`any`

Wiki context

##### params

`any` = `{}`

Plugin parameters (property='users' or 'distinctUsers')

#### Returns

`string`

HTML output

### name

> **name**: `string` = `'SessionsPlugin'`

### version

> **version**: `string` = `'1.0.0'`
