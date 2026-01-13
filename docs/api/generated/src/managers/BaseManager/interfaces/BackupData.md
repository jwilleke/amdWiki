[**amdWiki API v1.5.0**](../../../../README.md)

***

[amdWiki API](../../../../README.md) / [src/managers/BaseManager](../README.md) / BackupData

# Interface: BackupData

Defined in: [src/managers/BaseManager.ts:23](https://github.com/jwilleke/amdWiki/blob/b6a859c7c9297966de89735ea5e8f953df289ac1/src/managers/BaseManager.ts#L23)

Backup data structure returned by backup() method

## Extended by

- [`AttachmentBackupData`](../../AttachmentManager/interfaces/AttachmentBackupData.md)

## Indexable

\[`key`: `string`\]: `unknown`

Allow additional properties

## Properties

### data?

> `optional` **data**: `unknown`

Defined in: [src/managers/BaseManager.ts:31](https://github.com/jwilleke/amdWiki/blob/b6a859c7c9297966de89735ea5e8f953df289ac1/src/managers/BaseManager.ts#L31)

Manager-specific backup data

***

### managerName

> **managerName**: `string`

Defined in: [src/managers/BaseManager.ts:25](https://github.com/jwilleke/amdWiki/blob/b6a859c7c9297966de89735ea5e8f953df289ac1/src/managers/BaseManager.ts#L25)

Name of the manager that created this backup

***

### note?

> `optional` **note**: `string`

Defined in: [src/managers/BaseManager.ts:40](https://github.com/jwilleke/amdWiki/blob/b6a859c7c9297966de89735ea5e8f953df289ac1/src/managers/BaseManager.ts#L40)

Optional note about the backup

***

### providerBackup?

> `optional` **providerBackup**: `unknown`

Defined in: [src/managers/BaseManager.ts:37](https://github.com/jwilleke/amdWiki/blob/b6a859c7c9297966de89735ea5e8f953df289ac1/src/managers/BaseManager.ts#L37)

Provider-specific backup data

***

### providerClass?

> `optional` **providerClass**: `string` \| `null`

Defined in: [src/managers/BaseManager.ts:34](https://github.com/jwilleke/amdWiki/blob/b6a859c7c9297966de89735ea5e8f953df289ac1/src/managers/BaseManager.ts#L34)

Provider class name (for managers with providers)

***

### timestamp

> **timestamp**: `string`

Defined in: [src/managers/BaseManager.ts:28](https://github.com/jwilleke/amdWiki/blob/b6a859c7c9297966de89735ea5e8f953df289ac1/src/managers/BaseManager.ts#L28)

ISO timestamp when backup was created
