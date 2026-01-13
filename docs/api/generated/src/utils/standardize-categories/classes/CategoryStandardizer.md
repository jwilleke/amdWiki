[**amdWiki API v1.5.0**](../../../../README.md)

***

[amdWiki API](../../../../README.md) / [src/utils/standardize-categories](../README.md) / CategoryStandardizer

# Class: CategoryStandardizer

Defined in: [src/utils/standardize-categories.ts:115](https://github.com/jwilleke/amdWiki/blob/b6a859c7c9297966de89735ea5e8f953df289ac1/src/utils/standardize-categories.ts#L115)

Standardize categories across all pages

## Constructors

### Constructor

> **new CategoryStandardizer**(): `CategoryStandardizer`

Defined in: [src/utils/standardize-categories.ts:121](https://github.com/jwilleke/amdWiki/blob/b6a859c7c9297966de89735ea5e8f953df289ac1/src/utils/standardize-categories.ts#L121)

#### Returns

`CategoryStandardizer`

## Methods

### getErrors()

> **getErrors**(): `ErrorRecord`[]

Defined in: [src/utils/standardize-categories.ts:131](https://github.com/jwilleke/amdWiki/blob/b6a859c7c9297966de89735ea5e8f953df289ac1/src/utils/standardize-categories.ts#L131)

Get the list of errors encountered during processing

#### Returns

`ErrorRecord`[]

***

### standardizeCategories()

> **standardizeCategories**(`dryRun`): `Promise`\<`void`\>

Defined in: [src/utils/standardize-categories.ts:138](https://github.com/jwilleke/amdWiki/blob/b6a859c7c9297966de89735ea5e8f953df289ac1/src/utils/standardize-categories.ts#L138)

Analyze and fix categories

#### Parameters

##### dryRun

`boolean` = `true`

#### Returns

`Promise`\<`void`\>
