[**amdWiki API v1.5.0**](../../../README.md)

***

[amdWiki API](../../../README.md) / [plugins/SearchPlugin](../README.md) / export=

# Variable: export=

> `const` **export=**: `object`

Defined in: [plugins/SearchPlugin.js:34](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/plugins/SearchPlugin.js#L34)

SearchPlugin implementation

## Type Declaration

### author

> **author**: `string` = `'amdWiki'`

### description

> **description**: `string` = `'JSPWiki-style search plugin for embedding search results in pages'`

### execute()

> **execute**(`context`, `params`): `Promise`\<`string`\>

Execute the search plugin

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

> **name**: `string` = `'SearchPlugin'`

### version

> **version**: `string` = `'2.0.0'`
