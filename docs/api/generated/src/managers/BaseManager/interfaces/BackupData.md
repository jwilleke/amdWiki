[**amdWiki API v1.5.0**](../../../../README.md)

***

[amdWiki API](../../../../README.md) / [src/managers/BaseManager](../README.md) / BackupData

# Interface: BackupData

Defined in: [src/managers/BaseManager.ts:25](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/managers/BaseManager.ts#L25)

Backup data structure returned by backup() method

## Indexable

\[`key`: `string`\]: `any`

Allow additional properties

## Properties

### data?

> `optional` **data**: `any`

Defined in: [src/managers/BaseManager.ts:33](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/managers/BaseManager.ts#L33)

Manager-specific backup data

***

### managerName

> **managerName**: `string`

Defined in: [src/managers/BaseManager.ts:27](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/managers/BaseManager.ts#L27)

Name of the manager that created this backup

***

### note?

> `optional` **note**: `string`

Defined in: [src/managers/BaseManager.ts:42](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/managers/BaseManager.ts#L42)

Optional note about the backup

***

### providerBackup?

> `optional` **providerBackup**: `any`

Defined in: [src/managers/BaseManager.ts:39](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/managers/BaseManager.ts#L39)

Provider-specific backup data

***

### providerClass?

> `optional` **providerClass**: `string`

Defined in: [src/managers/BaseManager.ts:36](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/managers/BaseManager.ts#L36)

Provider class name (for managers with providers)

***

### timestamp

> **timestamp**: `string`

Defined in: [src/managers/BaseManager.ts:30](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/managers/BaseManager.ts#L30)

ISO timestamp when backup was created
