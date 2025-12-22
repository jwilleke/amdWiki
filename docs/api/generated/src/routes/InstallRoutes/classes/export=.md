[**amdWiki API v1.5.0**](../../../../README.md)

***

[amdWiki API](../../../../README.md) / [src/routes/InstallRoutes](../README.md) / export=

# Class: export=

Defined in: [src/routes/InstallRoutes.js:15](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/routes/InstallRoutes.js#L15)

InstallRoutes - Handles first-run installation routes

Provides routes for:

- GET /install - Display installation form
- POST /install - Process installation

Routes are only accessible when installation is required.

 InstallRoutes

## Constructors

### Constructor

> **new export=**(`engine`): `InstallRoutes`

Defined in: [src/routes/InstallRoutes.js:22](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/routes/InstallRoutes.js#L22)

Creates a new InstallRoutes instance

#### Parameters

##### engine

`WikiEngine`

The wiki engine instance

#### Returns

`InstallRoutes`

## Properties

### engine

> **engine**: `WikiEngine`

Defined in: [src/routes/InstallRoutes.js:23](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/routes/InstallRoutes.js#L23)

***

### installService

> **installService**: [`export=`](../../../services/InstallService/classes/export=.md)

Defined in: [src/routes/InstallRoutes.js:25](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/routes/InstallRoutes.js#L25)

***

### router

> **router**: `Router`

Defined in: [src/routes/InstallRoutes.js:24](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/routes/InstallRoutes.js#L24)

## Methods

### getRouter()

> **getRouter**(): `Router`

Defined in: [src/routes/InstallRoutes.js:202](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/routes/InstallRoutes.js#L202)

Get the router instance

#### Returns

`Router`
