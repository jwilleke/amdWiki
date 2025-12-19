[**amdWiki API v1.5.0**](../../../../README.md)

***

[amdWiki API](../../../../README.md) / [src/managers/ValidationManager](../README.md) / export=

# Class: export=

Defined in: [src/managers/ValidationManager.js:34](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/managers/ValidationManager.js#L34)

ValidationManager - Ensures all files follow UUID naming and metadata conventions

Validates page metadata and enforces architectural constraints including UUID-based
naming, required metadata fields, valid system categories, and keyword limits.

 ValidationManager

## See

[BaseManager](../../BaseManager/classes/export=.md) for base functionality

## Example

```ts
const validationManager = engine.getManager('ValidationManager');
const result = validationManager.validatePage(metadata);
if (!result.valid) console.error(result.errors);
```

## Extends

- [`export=`](../../BaseManager/classes/export=.md)

## Constructors

### Constructor

> **new export=**(`engine`): `ValidationManager`

Defined in: [src/managers/ValidationManager.js:41](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/managers/ValidationManager.js#L41)

Creates a new ValidationManager instance

#### Parameters

##### engine

`WikiEngine`

The wiki engine instance

#### Returns

`ValidationManager`

#### Overrides

[`export=`](../../BaseManager/classes/export=.md).[`constructor`](../../BaseManager/classes/export=.md#constructor)

## Properties

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

### maxCategories

> **maxCategories**: `any`

Defined in: [src/managers/ValidationManager.js:66](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/managers/ValidationManager.js#L66)

Maximum categories allowed

***

### maxUserKeywords

> **maxUserKeywords**: `any`

Defined in: [src/managers/ValidationManager.js:63](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/managers/ValidationManager.js#L63)

Maximum user keywords allowed

***

### requiredMetadataFields

> **requiredMetadataFields**: `string`[]

Defined in: [src/managers/ValidationManager.js:43](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/managers/ValidationManager.js#L43)

Required metadata fields

***

### systemCategoriesConfig

> **systemCategoriesConfig**: `any`

Defined in: [src/managers/ValidationManager.js:48](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/managers/ValidationManager.js#L48)

***

### validSystemCategories

> **validSystemCategories**: `string`[]

Defined in: [src/managers/ValidationManager.js:45](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/managers/ValidationManager.js#L45)

Valid system category values

## Methods

### backup()

> **backup**(): `Promise`\<`any`\>

Defined in: [src/managers/BaseManager.js:130](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/managers/BaseManager.js#L130)

Backup manager data

MUST be overridden by all managers that manage persistent data.
Default implementation returns an empty backup object.

#### Returns

`Promise`\<`any`\>

Backup data object containing all manager state

#### Async

#### Throws

If backup operation fails

#### Example

```ts
async backup() {
  return {
    managerName: this.constructor.name,
    timestamp: new Date().toISOString(),
    data: {
      users: Array.from(this.users.values()),
      settings: this.settings
    }
  };
}
```

#### Inherited from

[`export=`](../../BaseManager/classes/export=.md).[`backup`](../../BaseManager/classes/export=.md#backup)

***

### generateFilename()

> **generateFilename**(`metadata`): `string`

Defined in: [src/managers/ValidationManager.js:430](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/managers/ValidationManager.js#L430)

Generate UUID-based filename from metadata

#### Parameters

##### metadata

`any`

Page metadata containing UUID

#### Returns

`string`

Filename in UUID.md format

***

### generateFixSuggestions()

> **generateFixSuggestions**(`filename`, `metadata`): `any`

Defined in: [src/managers/ValidationManager.js:461](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/managers/ValidationManager.js#L461)

Generate suggestions to fix validation issues

#### Parameters

##### filename

`string`

Current filename

##### metadata

`any`

Current metadata

#### Returns

`any`

Fix suggestions

***

### generateSlug()

> **generateSlug**(`title`): `string`

Defined in: [src/managers/ValidationManager.js:417](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/managers/ValidationManager.js#L417)

Generate URL-safe slug from title

#### Parameters

##### title

`string`

Page title

#### Returns

`string`

URL-safe slug

***

### generateValidMetadata()

> **generateValidMetadata**(`title`, `options`): `any`

Defined in: [src/managers/ValidationManager.js:394](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/managers/ValidationManager.js#L394)

Generate properly formatted metadata for a new page

#### Parameters

##### title

`string`

Page title

##### options

`any` = `{}`

Additional metadata options

#### Returns

`any`

Complete metadata object with all required fields

***

### getAllSystemCategories()

> **getAllSystemCategories**(): `any`[]

Defined in: [src/managers/ValidationManager.js:150](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/managers/ValidationManager.js#L150)

Get all enabled system categories

#### Returns

`any`[]

Array of category configurations

***

### getCategoryConfig()

> **getCategoryConfig**(`label`): `any`

Defined in: [src/managers/ValidationManager.js:121](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/managers/ValidationManager.js#L121)

Get system category configuration by label

#### Parameters

##### label

`string`

Category label (e.g., "General", "System")

#### Returns

`any`

Category configuration or null if not found

***

### getCategoryStorageLocation()

> **getCategoryStorageLocation**(`category`): `string`

Defined in: [src/managers/ValidationManager.js:141](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/managers/ValidationManager.js#L141)

Get storage location for a category

#### Parameters

##### category

`string`

Category label

#### Returns

`string`

Storage location ('regular' or 'required')

***

### getDefaultSystemCategory()

> **getDefaultSystemCategory**(): `string`

Defined in: [src/managers/ValidationManager.js:171](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/managers/ValidationManager.js#L171)

Get the default system category

#### Returns

`string`

Default category label

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

### initialize()

> **initialize**(`config?`): `Promise`\<`void`\>

Defined in: [src/managers/ValidationManager.js:58](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/managers/ValidationManager.js#L58)

Initialize the ValidationManager

#### Parameters

##### config?

`any` = `{}`

Configuration object

#### Returns

`Promise`\<`void`\>

#### Async

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

### isValidSlug()

> **isValidSlug**(`slug`): `boolean`

Defined in: [src/managers/ValidationManager.js:306](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/managers/ValidationManager.js#L306)

Validate slug format (URL-safe)

#### Parameters

##### slug

`string`

The slug to validate

#### Returns

`boolean`

True if valid

***

### loadSystemCategories()

> **loadSystemCategories**(`configManager`): `void`

Defined in: [src/managers/ValidationManager.js:79](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/managers/ValidationManager.js#L79)

Load system categories from ConfigurationManager

#### Parameters

##### configManager

`ConfigurationManager`

Configuration manager instance

#### Returns

`void`

***

### restore()

> **restore**(`backupData`): `Promise`\<`void`\>

Defined in: [src/managers/BaseManager.js:163](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/managers/BaseManager.js#L163)

Restore manager data from backup

MUST be overridden by all managers that manage persistent data.
Default implementation only validates that backup data is provided.

#### Parameters

##### backupData

Backup data object from backup() method

###### data

`any`

Manager-specific backup data

###### managerName

`string`

Name of the manager

###### timestamp

`string`

ISO timestamp of backup

#### Returns

`Promise`\<`void`\>

#### Async

#### Throws

If restore operation fails or backup data is missing

#### Example

```ts
async restore(backupData) {
  if (!backupData || !backupData.data) {
    throw new Error('Invalid backup data');
  }
  this.users = new Map(backupData.data.users.map(u => [u.id, u]));
  this.settings = backupData.data.settings;
}
```

#### Inherited from

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

***

### validateContent()

> **validateContent**(`content`): `any`

Defined in: [src/managers/ValidationManager.js:367](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/managers/ValidationManager.js#L367)

Validate page content (optional checks)

#### Parameters

##### content

`string`

The page content

#### Returns

`any`

Content validation result

***

### validateExistingFile()

> **validateExistingFile**(`filePath`, `fileData`): `any`

Defined in: [src/managers/ValidationManager.js:443](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/managers/ValidationManager.js#L443)

Validate and fix an existing page file

#### Parameters

##### filePath

`string`

Path to the existing file

##### fileData

`any`

Object with content and metadata from gray-matter

#### Returns

`any`

Validation result with fix suggestions

***

### validateFilename()

> **validateFilename**(`filename`): `any`

Defined in: [src/managers/ValidationManager.js:197](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/managers/ValidationManager.js#L197)

Validate that a filename follows UUID naming convention

#### Parameters

##### filename

`string`

The filename to validate

#### Returns

`any`

Validation result with success and error properties

***

### validateMetadata()

> **validateMetadata**(`metadata`): `any`

Defined in: [src/managers/ValidationManager.js:224](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/managers/ValidationManager.js#L224)

Validate page metadata contains all required fields with proper values

#### Parameters

##### metadata

`any`

The metadata object to validate

#### Returns

`any`

Validation result with success, error, and warnings properties

***

### validatePage()

> **validatePage**(`filename`, `metadata`, `content`): `any`

Defined in: [src/managers/ValidationManager.js:318](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/managers/ValidationManager.js#L318)

Validate a complete page before saving

#### Parameters

##### filename

`string`

The target filename

##### metadata

`any`

The page metadata

##### content

`string` = `null`

The page content (optional validation)

#### Returns

`any`

Comprehensive validation result
