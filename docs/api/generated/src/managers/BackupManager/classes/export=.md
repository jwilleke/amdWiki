[**amdWiki API v1.5.0**](../../../../README.md)

***

[amdWiki API](../../../../README.md) / [src/managers/BackupManager](../README.md) / export=

# Class: export=

Defined in: [src/managers/BackupManager.js:42](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/managers/BackupManager.js#L42)

BackupManager - Coordinates backup and restore operations across all managers

Orchestrates system-wide backup and restore by calling backup()/restore()
on all registered managers and aggregating their data into compressed archives.

Responsibilities:

- Call backup() on all registered managers
- Aggregate backup data into a single .gz file
- Restore from .gz backup file
- Call restore() on all registered managers

Architecture:

- Each manager implements backup() to return its state
- BackupManager collects all states into one object
- Serializes to JSON and compresses with gzip
- Stores as single .gz file

 BackupManager

## See

[BaseManager](../../BaseManager/classes/export=.md) for base functionality and backup() pattern

## Example

```ts
const backupManager = engine.getManager('BackupManager');
const backupPath = await backupManager.createBackup();
console.log('Backup created:', backupPath);
```

## Extends

- [`export=`](../../BaseManager/classes/export=.md)

## Constructors

### Constructor

> **new export=**(`engine`): `BackupManager`

Defined in: [src/managers/BackupManager.js:49](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/managers/BackupManager.js#L49)

Creates a new BackupManager instance

#### Parameters

##### engine

`WikiEngine`

The wiki engine instance

#### Returns

`BackupManager`

#### Overrides

[`export=`](../../BaseManager/classes/export=.md).[`constructor`](../../BaseManager/classes/export=.md#constructor)

## Properties

### backupDirectory

> **backupDirectory**: `any`

Defined in: [src/managers/BackupManager.js:51](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/managers/BackupManager.js#L51)

Directory for backup files

***

### config

> **config**: `any`

Defined in: [src/managers/BaseManager.js:55](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/managers/BaseManager.js#L55)

Configuration object passed during initialization

#### Inherited from

[`export=`](../../BaseManager/classes/export=.md).[`config`](../../BaseManager/classes/export=.md#config)

***

### engine

> **engine**: `WikiEngine`

Defined in: [src/managers/BaseManager.js:33](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/managers/BaseManager.js#L33)

Reference to the wiki engine

#### Inherited from

[`export=`](../../BaseManager/classes/export=.md).[`engine`](../../BaseManager/classes/export=.md#engine)

***

### initialized

> **initialized**: `boolean`

Defined in: [src/managers/BaseManager.js:34](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/managers/BaseManager.js#L34)

Flag indicating initialization status

#### Inherited from

[`export=`](../../BaseManager/classes/export=.md).[`initialized`](../../BaseManager/classes/export=.md#initialized)

***

### maxBackups

> **maxBackups**: `number`

Defined in: [src/managers/BackupManager.js:52](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/managers/BackupManager.js#L52)

Maximum number of backups to retain

## Methods

### backup()

> **backup**(`options`): `Promise`\<`string`\>

Defined in: [src/managers/BackupManager.js:101](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/managers/BackupManager.js#L101)

Perform a complete backup of all managers

Process:

1. Get all registered managers from engine
2. Call backup() on each manager
3. Aggregate all backup data
4. Compress to .gz file
5. Save with timestamp
6. Clean up old backups

#### Parameters

##### options

Backup options

###### compress

`boolean`

Whether to compress (default: true)

###### filename

`string`

Custom filename (optional)

#### Returns

`Promise`\<`string`\>

Path to created backup file

#### Overrides

[`export=`](../../BaseManager/classes/export=.md).[`backup`](../../BaseManager/classes/export=.md#backup)

***

### getEngine()

> **getEngine**(): `WikiEngine`

Defined in: [src/managers/BaseManager.js:81](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/managers/BaseManager.js#L81)

Get the wiki engine instance

#### Returns

`WikiEngine`

The wiki engine instance

#### Example

```ts
const config = this.getEngine().getConfig();
```

#### Inherited from

[`export=`](../../BaseManager/classes/export=.md).[`getEngine`](../../BaseManager/classes/export=.md#getengine)

***

### getLatestBackup()

> **getLatestBackup**(): `Promise`\<`string`\>

Defined in: [src/managers/BackupManager.js:377](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/managers/BackupManager.js#L377)

Get the most recent backup file path

#### Returns

`Promise`\<`string`\>

Path to most recent backup, or null if none exist

***

### initialize()

> **initialize**(`config?`): `Promise`\<`void`\>

Defined in: [src/managers/BackupManager.js:63](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/managers/BackupManager.js#L63)

Initialize BackupManager

#### Parameters

##### config?

`any` = `{}`

Configuration object (unused, reads from ConfigurationManager)

#### Returns

`Promise`\<`void`\>

#### Async

#### Throws

If ConfigurationManager is not available

#### Overrides

[`export=`](../../BaseManager/classes/export=.md).[`initialize`](../../BaseManager/classes/export=.md#initialize)

***

### isInitialized()

> **isInitialized**(): `boolean`

Defined in: [src/managers/BaseManager.js:69](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/managers/BaseManager.js#L69)

Check if manager has been initialized

#### Returns

`boolean`

True if manager is initialized

#### Example

```ts
if (manager.isInitialized()) {
  // Safe to use manager
}
```

#### Inherited from

[`export=`](../../BaseManager/classes/export=.md).[`isInitialized`](../../BaseManager/classes/export=.md#isinitialized)

***

### listBackups()

> **listBackups**(): `Promise`\<`any`[]\>

Defined in: [src/managers/BackupManager.js:316](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/managers/BackupManager.js#L316)

List all available backups

#### Returns

`Promise`\<`any`[]\>

List of backup files with metadata

***

### restore()

> **restore**(`backupPath`, `options`): `Promise`\<`any`\>

Defined in: [src/managers/BackupManager.js:198](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/managers/BackupManager.js#L198)

Restore from a backup file

Process:

1. Read and decompress backup file
2. Parse JSON data
3. Validate backup structure
4. Call restore() on each manager with its data

#### Parameters

##### backupPath

`string`

Path to backup file

##### options

Restore options

###### managerFilter

`string`[]

Only restore specific managers

###### skipValidation

`boolean`

Skip validation (default: false)

#### Returns

`Promise`\<`any`\>

Restore results

#### Overrides

[`export=`](../../BaseManager/classes/export=.md).[`restore`](../../BaseManager/classes/export=.md#restore)

***

### shutdown()

> **shutdown**(): `Promise`\<`void`\>

Defined in: [src/managers/BaseManager.js:101](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/managers/BaseManager.js#L101)

Shutdown the manager and cleanup resources

Override this method in subclasses to perform cleanup logic.
Always call super.shutdown() at the end of overridden implementations.

#### Returns

`Promise`\<`void`\>

#### Async

#### Example

```ts
async shutdown() {
  // Your cleanup logic here
  await this.closeConnections();
  await super.shutdown();
}
```

#### Inherited from

[`export=`](../../BaseManager/classes/export=.md).[`shutdown`](../../BaseManager/classes/export=.md#shutdown)
