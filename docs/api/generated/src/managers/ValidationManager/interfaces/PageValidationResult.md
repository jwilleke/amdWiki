[**amdWiki API v1.5.0**](../../../../README.md)

***

[amdWiki API](../../../../README.md) / [src/managers/ValidationManager](../README.md) / PageValidationResult

# Interface: PageValidationResult

Defined in: [src/managers/ValidationManager.ts:32](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/managers/ValidationManager.ts#L32)

Page validation result interface

## Extends

- [`MetadataValidationResult`](MetadataValidationResult.md)

## Properties

### error

> **error**: `string`

Defined in: [src/managers/ValidationManager.ts:19](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/managers/ValidationManager.ts#L19)

#### Inherited from

[`MetadataValidationResult`](MetadataValidationResult.md).[`error`](MetadataValidationResult.md#error)

***

### filenameValid

> **filenameValid**: `boolean`

Defined in: [src/managers/ValidationManager.ts:33](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/managers/ValidationManager.ts#L33)

***

### fixes?

> `optional` **fixes**: [`FixSuggestions`](FixSuggestions.md)

Defined in: [src/managers/ValidationManager.ts:35](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/managers/ValidationManager.ts#L35)

***

### metadataValid

> **metadataValid**: `boolean`

Defined in: [src/managers/ValidationManager.ts:34](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/managers/ValidationManager.ts#L34)

***

### success

> **success**: `boolean`

Defined in: [src/managers/ValidationManager.ts:18](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/managers/ValidationManager.ts#L18)

#### Inherited from

[`MetadataValidationResult`](MetadataValidationResult.md).[`success`](MetadataValidationResult.md#success)

***

### warnings?

> `optional` **warnings**: `string`[]

Defined in: [src/managers/ValidationManager.ts:26](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/managers/ValidationManager.ts#L26)

#### Inherited from

[`MetadataValidationResult`](MetadataValidationResult.md).[`warnings`](MetadataValidationResult.md#warnings)
