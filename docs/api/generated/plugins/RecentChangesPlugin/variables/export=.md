[**amdWiki API v1.5.0**](../../../README.md)

***

[amdWiki API](../../../README.md) / [plugins/RecentChangesPlugin](../README.md) / export=

# Variable: export=

> `const` **export=**: `object`

Defined in: [plugins/RecentChangesPlugin.js:22](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/plugins/RecentChangesPlugin.js#L22)

RecentChangesPlugin implementation

## Type Declaration

### author

> **author**: `string` = `'amdWiki'`

### description

> **description**: `string` = `'Displays recent page changes in chronological order'`

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

### formatDate()

> **formatDate**(`date`): `string`

Format date for full format (e.g., "Jan 15, 2025 3:45 PM")

#### Parameters

##### date

`Date`

Date to format

#### Returns

`string`

Formatted date string

### formatDateCompact()

> **formatDateCompact**(`date`): `string`

Format date for compact format (e.g., "2 hours ago", "3 days ago")

#### Parameters

##### date

`Date`

Date to format

#### Returns

`string`

Formatted date string

### generateCompactFormat()

> **generateCompactFormat**(`pages`, `since`): `string`

Generate compact format output

#### Parameters

##### pages

`any`[]

Array of page objects with dates

##### since

`number`

Number of days

#### Returns

`string`

HTML output

### generateFullFormat()

> **generateFullFormat**(`pages`, `since`): `string`

Generate full format output

#### Parameters

##### pages

`any`[]

Array of page objects with dates

##### since

`number`

Number of days

#### Returns

`string`

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

### loadPageIndex()

> **loadPageIndex**(): `Promise`\<`any`\>

Load page-index.json for version information

#### Returns

`Promise`\<`any`\>

Page index data or null if not available

### name

> **name**: `string` = `'RecentChangesPlugin'`

### version

> **version**: `string` = `'1.0.0'`
