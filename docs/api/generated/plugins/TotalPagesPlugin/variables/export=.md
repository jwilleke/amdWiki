[**amdWiki API v1.5.0**](../../../README.md)

***

[amdWiki API](../../../README.md) / [plugins/TotalPagesPlugin](../README.md) / export=

# Variable: export=

> `const` **export=**: `object`

Defined in: [plugins/TotalPagesPlugin.js:6](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/plugins/TotalPagesPlugin.js#L6)

TotalPagesPlugin - JSPWiki-style total pages plugin
Returns the total number of pages in the wiki

## Type Declaration

### author

> **author**: `string` = `'amdWiki'`

### description

> **description**: `string` = `'Shows the total number of pages'`

### execute()

> **execute**(`context`, `params`): `Promise`\<`string`\>

Execute the plugin

#### Parameters

##### context

`any`

Wiki context

##### params

`any`

Plugin parameters

#### Returns

`Promise`\<`string`\>

HTML output

### name

> **name**: `string` = `'TotalPagesPlugin'`

### version

> **version**: `string` = `'1.0.0'`
