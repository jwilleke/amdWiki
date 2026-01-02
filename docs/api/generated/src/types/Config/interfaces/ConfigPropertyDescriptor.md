[**amdWiki API v1.5.0**](../../../../README.md)

***

[amdWiki API](../../../../README.md) / [src/types/Config](../README.md) / ConfigPropertyDescriptor

# Interface: ConfigPropertyDescriptor

Defined in: [src/types/Config.ts:268](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/types/Config.ts#L268)

Configuration property descriptor

Metadata about a configuration property (for validation and UI).

## Properties

### category?

> `optional` **category**: `string`

Defined in: [src/types/Config.ts:303](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/types/Config.ts#L303)

Property category for grouping

***

### defaultValue

> **defaultValue**: `any`

Defined in: [src/types/Config.ts:273](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/types/Config.ts#L273)

Default value

***

### description

> **description**: `string`

Defined in: [src/types/Config.ts:279](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/types/Config.ts#L279)

Human-readable description

***

### key

> **key**: `string`

Defined in: [src/types/Config.ts:270](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/types/Config.ts#L270)

Property key

***

### required

> **required**: `boolean`

Defined in: [src/types/Config.ts:282](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/types/Config.ts#L282)

Whether this is a required property

***

### requiresRestart?

> `optional` **requiresRestart**: `boolean`

Defined in: [src/types/Config.ts:306](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/types/Config.ts#L306)

Whether property requires restart to take effect

***

### system

> **system**: `boolean`

Defined in: [src/types/Config.ts:285](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/types/Config.ts#L285)

Whether this is a system property (not user-editable)

***

### type

> **type**: `"string"` \| `"number"` \| `"boolean"` \| `"object"` \| `"array"`

Defined in: [src/types/Config.ts:276](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/types/Config.ts#L276)

Value type

***

### validation?

> `optional` **validation**: `object`

Defined in: [src/types/Config.ts:288](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/types/Config.ts#L288)

Validation rules

#### enum?

> `optional` **enum**: `any`[]

Allowed values (enum)

#### max?

> `optional` **max**: `number`

Maximum value (for numbers)

#### min?

> `optional` **min**: `number`

Minimum value (for numbers)

#### pattern?

> `optional` **pattern**: `string`

Regex pattern (for strings)
