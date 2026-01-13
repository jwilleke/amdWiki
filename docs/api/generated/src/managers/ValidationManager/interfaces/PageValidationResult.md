[**amdWiki API v1.5.0**](../../../../README.md)

***

[amdWiki API](../../../../README.md) / [src/managers/ValidationManager](../README.md) / PageValidationResult

# Interface: PageValidationResult

Defined in: [src/managers/ValidationManager.ts:34](https://github.com/jwilleke/amdWiki/blob/b6a859c7c9297966de89735ea5e8f953df289ac1/src/managers/ValidationManager.ts#L34)

Page validation result interface

## Extends

- [`MetadataValidationResult`](MetadataValidationResult.md)

## Properties

### error

> **error**: `string` \| `null`

Defined in: [src/managers/ValidationManager.ts:21](https://github.com/jwilleke/amdWiki/blob/b6a859c7c9297966de89735ea5e8f953df289ac1/src/managers/ValidationManager.ts#L21)

#### Inherited from

[`MetadataValidationResult`](MetadataValidationResult.md).[`error`](MetadataValidationResult.md#error)

***

### filenameValid

> **filenameValid**: `boolean`

Defined in: [src/managers/ValidationManager.ts:35](https://github.com/jwilleke/amdWiki/blob/b6a859c7c9297966de89735ea5e8f953df289ac1/src/managers/ValidationManager.ts#L35)

***

### fixes?

> `optional` **fixes**: [`FixSuggestions`](FixSuggestions.md)

Defined in: [src/managers/ValidationManager.ts:37](https://github.com/jwilleke/amdWiki/blob/b6a859c7c9297966de89735ea5e8f953df289ac1/src/managers/ValidationManager.ts#L37)

***

### metadataValid

> **metadataValid**: `boolean`

Defined in: [src/managers/ValidationManager.ts:36](https://github.com/jwilleke/amdWiki/blob/b6a859c7c9297966de89735ea5e8f953df289ac1/src/managers/ValidationManager.ts#L36)

***

### success

> **success**: `boolean`

Defined in: [src/managers/ValidationManager.ts:20](https://github.com/jwilleke/amdWiki/blob/b6a859c7c9297966de89735ea5e8f953df289ac1/src/managers/ValidationManager.ts#L20)

#### Inherited from

[`MetadataValidationResult`](MetadataValidationResult.md).[`success`](MetadataValidationResult.md#success)

***

### warnings?

> `optional` **warnings**: `string`[]

Defined in: [src/managers/ValidationManager.ts:28](https://github.com/jwilleke/amdWiki/blob/b6a859c7c9297966de89735ea5e8f953df289ac1/src/managers/ValidationManager.ts#L28)

#### Inherited from

[`MetadataValidationResult`](MetadataValidationResult.md).[`warnings`](MetadataValidationResult.md#warnings)
