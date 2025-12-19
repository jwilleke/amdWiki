[**amdWiki API v1.5.0**](../../../README.md)

***

[amdWiki API](../../../README.md) / [plugins/VariablesPlugin](../README.md) / export=

# Variable: export=

> `const` **export=**: `object`

Defined in: [plugins/VariablesPlugin.js:16](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/plugins/VariablesPlugin.js#L16)

VariablesPlugin implementation

## Type Declaration

### author

> **author**: `string` = `'amdWiki'`

### description

> **description**: `string` = `'Displays system and contextual variables available in the wiki'`

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

HTML output

### getVariableDescription()

> **getVariableDescription**(`varName`): `string`

Get description for a variable

#### Parameters

##### varName

`string`

Variable name

#### Returns

`string`

Description

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

> **name**: `string` = `'VariablesPlugin'`

### version

> **version**: `string` = `'1.0.0'`
