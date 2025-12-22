[**amdWiki API v1.5.0**](../../../../README.md)

***

[amdWiki API](../../../../README.md) / [src/services/InstallService](../README.md) / export=

# Class: export=

Defined in: [src/services/InstallService.js:16](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/services/InstallService.js#L16)

InstallService - Handles first-run installation and configuration

Manages the initial setup process including:

- Writing app-custom-config.json with user-provided settings
- Creating users/organizations.json with Schema.org organization data
- Copying startup pages from required-pages/ to pages/
- Creating the initial admin user

 InstallService

## Constructors

### Constructor

> **new export=**(`engine`): `InstallService`

Defined in: [src/services/InstallService.js:23](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/services/InstallService.js#L23)

Creates a new InstallService instance

#### Parameters

##### engine

`WikiEngine`

The wiki engine instance

#### Returns

`InstallService`

## Properties

### configManager

> **configManager**: `any`

Defined in: [src/services/InstallService.js:25](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/services/InstallService.js#L25)

***

### engine

> **engine**: `WikiEngine`

Defined in: [src/services/InstallService.js:24](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/services/InstallService.js#L24)

## Methods

### createPagesFolder()

> **createPagesFolder**(): `Promise`\<`any`\>

Defined in: [src/services/InstallService.js:130](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/services/InstallService.js#L130)

Create pages folder and copy required pages

Copies pages from required-pages directory to the pages directory

#### Returns

`Promise`\<`any`\>

Result with success status and number of pages copied

#### Async

***

### detectMissingPagesOnly()

> **detectMissingPagesOnly**(): `Promise`\<`any`\>

Defined in: [src/services/InstallService.js:95](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/services/InstallService.js#L95)

Detect if only pages folder is missing

Returns true if installation is otherwise complete but pages folder is missing/empty

#### Returns

`Promise`\<`any`\>

Result with missingPagesOnly flag and details

***

### detectPartialInstallation()

> **detectPartialInstallation**(): `Promise`\<`any`\>

Defined in: [src/services/InstallService.js:56](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/services/InstallService.js#L56)

Detect partial installation state

#### Returns

`Promise`\<`any`\>

Partial installation status

***

### generateSessionSecret()

> **generateSessionSecret**(): `string`

Defined in: [src/services/InstallService.js:666](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/services/InstallService.js#L666)

Generate a random session secret

#### Returns

`string`

Random hex string

***

### isInstallRequired()

> **isInstallRequired**(): `Promise`\<`boolean`\>

Defined in: [src/services/InstallService.js:33](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/services/InstallService.js#L33)

Check if installation is required

#### Returns

`Promise`\<`boolean`\>

True if install is needed

***

### processInstallation()

> **processInstallation**(`installData`): `Promise`\<`any`\>

Defined in: [src/services/InstallService.js:214](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/services/InstallService.js#L214)

Process installation with provided data

Supports retrying partial installations. If some steps are already complete,
skips them and continues with remaining steps. This allows users to recover
from partial installation states without needing to reset.

#### Parameters

##### installData

`any`

Installation form data

#### Returns

`Promise`\<`any`\>

Result with success status, completed steps, and any errors

#### Async

***

### resetInstallation()

> **resetInstallation**(): `Promise`\<`any`\>

Defined in: [src/services/InstallService.js:299](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/services/InstallService.js#L299)

Reset partial installation to allow retry

#### Returns

`Promise`\<`any`\>

Result with success status

#### Async
