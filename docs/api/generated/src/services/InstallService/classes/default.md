[**amdWiki API v1.5.0**](../../../../README.md)

***

[amdWiki API](../../../../README.md) / [src/services/InstallService](../README.md) / default

# Class: default

Defined in: [src/services/InstallService.ts:120](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/services/InstallService.ts#L120)

InstallService - Handles first-run installation and configuration

Manages the initial setup process including:
- Writing app-custom-config.json with user-provided settings
- Creating users/organizations.json with Schema.org organization data
- Copying startup pages from required-pages/ to pages/
- Creating the initial admin user

 InstallService

## Constructors

### Constructor

> **new default**(`engine`): `InstallService`

Defined in: [src/services/InstallService.ts:130](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/services/InstallService.ts#L130)

Creates a new InstallService instance

#### Parameters

##### engine

`WikiEngine`

The wiki engine instance

#### Returns

`InstallService`

## Methods

### createPagesFolder()

> **createPagesFolder**(): `Promise`\<`PagesFolderResult`\>

Defined in: [src/services/InstallService.ts:237](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/services/InstallService.ts#L237)

Create pages folder and copy required pages

Copies pages from required-pages directory to the pages directory

#### Returns

`Promise`\<`PagesFolderResult`\>

Result with success status and number of pages copied

#### Async

***

### detectMissingPagesOnly()

> **detectMissingPagesOnly**(): `Promise`\<`MissingPagesResult`\>

Defined in: [src/services/InstallService.ts:202](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/services/InstallService.ts#L202)

Detect if only pages folder is missing

Returns true if installation is otherwise complete but pages folder is missing/empty

#### Returns

`Promise`\<`MissingPagesResult`\>

Result with missingPagesOnly flag and details

***

### detectPartialInstallation()

> **detectPartialInstallation**(): `Promise`\<`PartialInstallationState`\>

Defined in: [src/services/InstallService.ts:163](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/services/InstallService.ts#L163)

Detect partial installation state

#### Returns

`Promise`\<`PartialInstallationState`\>

Partial installation status

***

### generateSessionSecret()

> **generateSessionSecret**(): `string`

Defined in: [src/services/InstallService.ts:766](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/services/InstallService.ts#L766)

Generate a random session secret

#### Returns

`string`

Random hex string

***

### isInstallRequired()

> **isInstallRequired**(): `Promise`\<`boolean`\>

Defined in: [src/services/InstallService.ts:140](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/services/InstallService.ts#L140)

Check if installation is required

#### Returns

`Promise`\<`boolean`\>

True if install is needed

***

### processInstallation()

> **processInstallation**(`installData`): `Promise`\<`InstallationResult`\>

Defined in: [src/services/InstallService.ts:322](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/services/InstallService.ts#L322)

Process installation with provided data

Supports retrying partial installations. If some steps are already complete,
skips them and continues with remaining steps. This allows users to recover
from partial installation states without needing to reset.

#### Parameters

##### installData

`InstallData`

Installation form data

#### Returns

`Promise`\<`InstallationResult`\>

Result with success status, completed steps, and any errors

#### Async

***

### resetInstallation()

> **resetInstallation**(): `Promise`\<`ResetResult`\>

Defined in: [src/services/InstallService.ts:409](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/services/InstallService.ts#L409)

Reset partial installation to allow retry

#### Returns

`Promise`\<`ResetResult`\>

Result with success status

#### Async
