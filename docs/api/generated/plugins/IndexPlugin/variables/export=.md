[**amdWiki API v1.5.0**](../../../README.md)

***

[amdWiki API](../../../README.md) / [plugins/IndexPlugin](../README.md) / export=

# Variable: export=

> `const` **export=**: `object`

Defined in: [plugins/IndexPlugin.js:12](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/plugins/IndexPlugin.js#L12)

IndexPlugin implementation (new-style with .execute method)

## Type Declaration

### author

> **author**: `string` = `'amdWiki'`

### description

> **description**: `string` = `'Generates an alphabetical index of all wiki pages'`

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

> **name**: `string` = `'IndexPlugin'`

### version

> **version**: `string` = `'1.0.0'`
