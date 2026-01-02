[**amdWiki API v1.5.0**](../../../../README.md)

***

[amdWiki API](../../../../README.md) / [src/routes/InstallRoutes](../README.md) / default

# Class: default

Defined in: [src/routes/InstallRoutes.ts:81](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/routes/InstallRoutes.ts#L81)

InstallRoutes - Handles first-run installation routes

Provides routes for:
- GET /install - Display installation form
- POST /install - Process installation

Routes are only accessible when installation is required.

 InstallRoutes

## Constructors

### Constructor

> **new default**(`engine`): `InstallRoutes`

Defined in: [src/routes/InstallRoutes.ts:92](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/routes/InstallRoutes.ts#L92)

Creates a new InstallRoutes instance

#### Parameters

##### engine

[`WikiEngine`](../../../types/WikiEngine/interfaces/WikiEngine.md)

The wiki engine instance

#### Returns

`InstallRoutes`

## Methods

### getRouter()

> **getRouter**(): `Router`

Defined in: [src/routes/InstallRoutes.ts:277](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/routes/InstallRoutes.ts#L277)

Get the router instance

#### Returns

`Router`
