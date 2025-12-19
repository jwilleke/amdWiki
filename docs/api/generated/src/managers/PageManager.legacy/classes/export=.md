[**amdWiki API v1.5.0**](../../../../README.md)

***

[amdWiki API](../../../../README.md) / [src/managers/PageManager.legacy](../README.md) / export=

# Class: export=

Defined in: [src/managers/PageManager.legacy.js:11](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/managers/PageManager.legacy.js#L11)

PageManager - Handles all page operations
Similar to JSPWiki's PageManager

## Extends

- [`export=`](../../BaseManager/classes/export=.md)

## Constructors

### Constructor

> **new export=**(`engine`): `PageManager`

Defined in: [src/managers/PageManager.legacy.js:12](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/managers/PageManager.legacy.js#L12)

#### Parameters

##### engine

`any`

#### Returns

`PageManager`

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

### pagesDir

> **pagesDir**: `any`

Defined in: [src/managers/PageManager.legacy.js:14](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/managers/PageManager.legacy.js#L14)

***

### requiredPagesDir

> **requiredPagesDir**: `any`

Defined in: [src/managers/PageManager.legacy.js:20](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/managers/PageManager.legacy.js#L20)

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

### createPageFromTemplate()

> **createPageFromTemplate**(`pageName`, `templateName`): `any`

Defined in: [src/managers/PageManager.legacy.js:374](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/managers/PageManager.legacy.js#L374)

Create page from template

#### Parameters

##### pageName

`string`

Name of the new page

##### templateName

`string` = `'default'`

Name of the template to use

#### Returns

`any`

Created page object

***

### deletePage()

> **deletePage**(`pageName`): `Promise`\<`boolean`\>

Defined in: [src/managers/PageManager.legacy.js:192](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/managers/PageManager.legacy.js#L192)

Delete a page

#### Parameters

##### pageName

`string`

Name of the page to delete

#### Returns

`Promise`\<`boolean`\>

***

### generatePageIndexContent()

> **generatePageIndexContent**(`regularPages`, `requiredPages`): `string`

Defined in: [src/managers/PageManager.legacy.js:266](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/managers/PageManager.legacy.js#L266)

Generate the content for PageIndex.md

#### Parameters

##### regularPages

`string`[]

Pages from pages directory

##### requiredPages

`string`[]

Pages from required-pages directory

#### Returns

`string`

Generated content

***

### generateTemplateData()

> **generateTemplateData**(`pageName`, `templateName`): `any`

Defined in: [src/managers/PageManager.legacy.js:347](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/managers/PageManager.legacy.js#L347)

Generate template data without saving to disk

#### Parameters

##### pageName

`string`

Name of the new page

##### templateName

`string` = `'default'`

Name of the template to use

#### Returns

`any`

Template page object (not saved)

***

### getAllPages()

> **getAllPages**(): `any`[]

Defined in: [src/managers/PageManager.legacy.js:327](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/managers/PageManager.legacy.js#L327)

Get all pages with metadata

#### Returns

`any`[]

Array of page objects

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

### getPage()

> **getPage**(`pageName`): `any`

Defined in: [src/managers/PageManager.legacy.js:67](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/managers/PageManager.legacy.js#L67)

Get page content and metadata

#### Parameters

##### pageName

`string`

Name of the page

#### Returns

`any`

Page object with content and metadata

***

### getPageNames()

> **getPageNames**(): `string`[]

Defined in: [src/managers/PageManager.legacy.js:32](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/managers/PageManager.legacy.js#L32)

Get all page names

#### Returns

`string`[]

Array of page names

***

### initialize()

> **initialize**(`config`): `Promise`\<`void`\>

Defined in: [src/managers/PageManager.legacy.js:17](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/managers/PageManager.legacy.js#L17)

Initialize the manager with configuration

Override this method in subclasses to perform initialization logic.
Always call super.initialize() first in overridden implementations.

#### Parameters

##### config

Configuration object

#### Returns

`Promise`\<`void`\>

#### Async

#### Example

```ts
async initialize(config = {}) {
  await super.initialize(config);
  // Your initialization logic here
  console.log('MyManager initialized');
}
```

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

### isRequiredPage()

> **isRequiredPage**(`pageName`, `metadata`): `boolean`

Defined in: [src/managers/PageManager.legacy.js:97](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/managers/PageManager.legacy.js#L97)

Check if a page is a required page

#### Parameters

##### pageName

`string`

Name of the page

##### metadata

`any` = `null`

Page metadata (optional, for checking category)

#### Returns

`boolean`

True if it's a required page

***

### pageExists()

> **pageExists**(`pageName`): `boolean`

Defined in: [src/managers/PageManager.legacy.js:56](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/managers/PageManager.legacy.js#L56)

Check if page exists

#### Parameters

##### pageName

`string`

Name of the page

#### Returns

`boolean`

True if page exists

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

### savePage()

> **savePage**(`pageName`, `content`, `metadata`): `Promise`\<\{ `content`: `string`; `filePath`: `string`; `metadata`: `any`; `name`: `string`; \}\>

Defined in: [src/managers/PageManager.legacy.js:151](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/managers/PageManager.legacy.js#L151)

Save page with content and metadata

#### Parameters

##### pageName

`string`

Name of the page

##### content

`string`

Page content

##### metadata

`any` = `{}`

Page metadata

#### Returns

`Promise`\<\{ `content`: `string`; `filePath`: `string`; `metadata`: `any`; `name`: `string`; \}\>

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

### updatePageIndex()

> **updatePageIndex**(): `Promise`\<`void`\>

Defined in: [src/managers/PageManager.legacy.js:220](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/managers/PageManager.legacy.js#L220)

Update the PageIndex.md file with current page list

#### Returns

`Promise`\<`void`\>
