[**amdWiki API v1.5.0**](../../../../README.md)

***

[amdWiki API](../../../../README.md) / [src/types/Config](../README.md) / ConfigValidationResult

# Interface: ConfigValidationResult

Defined in: [src/types/Config.ts:339](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/types/Config.ts#L339)

Configuration validation result

Result of validating configuration.

## Properties

### errors

> **errors**: `object`[]

Defined in: [src/types/Config.ts:344](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/types/Config.ts#L344)

Validation errors

#### key

> **key**: `string`

#### message

> **message**: `string`

#### value?

> `optional` **value**: `any`

***

### valid

> **valid**: `boolean`

Defined in: [src/types/Config.ts:341](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/types/Config.ts#L341)

Whether configuration is valid

***

### warnings

> **warnings**: `object`[]

Defined in: [src/types/Config.ts:351](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/types/Config.ts#L351)

Validation warnings

#### key

> **key**: `string`

#### message

> **message**: `string`

#### value?

> `optional` **value**: `any`
