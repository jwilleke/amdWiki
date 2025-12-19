[**amdWiki API v1.5.0**](../../../../README.md)

***

[amdWiki API](../../../../README.md) / [src/managers/PageManagerUuid](../README.md) / export=

# Class: export=

Defined in: [src/managers/PageManagerUuid.js:24](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/managers/PageManagerUuid.js#L24)

PageManager - Enhanced with UUID-based file storage
Similar to JSPWiki's PageManager but with modern content management features

## Extends

- [`export=`](../../BaseManager/classes/export=.md)

## Constructors

### Constructor

> **new export=**(`engine`): `PageManager`

Defined in: [src/managers/PageManagerUuid.js:25](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/managers/PageManagerUuid.js#L25)

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

### pageCache

> **pageCache**: `Map`\<`any`, `any`\>

Defined in: [src/managers/PageManagerUuid.js:30](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/managers/PageManagerUuid.js#L30)

***

### pagesDir

> **pagesDir**: `any`

Defined in: [src/managers/PageManagerUuid.js:27](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/managers/PageManagerUuid.js#L27)

***

### requiredPagesDir

> **requiredPagesDir**: `any`

Defined in: [src/managers/PageManagerUuid.js:28](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/managers/PageManagerUuid.js#L28)

***

### slugToUuidMap

> **slugToUuidMap**: `Map`\<`any`, `any`\>

Defined in: [src/managers/PageManagerUuid.js:32](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/managers/PageManagerUuid.js#L32)

***

### titleToUuidMap

> **titleToUuidMap**: `Map`\<`any`, `any`\>

Defined in: [src/managers/PageManagerUuid.js:31](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/managers/PageManagerUuid.js#L31)

***

### uuidToFileMap

> **uuidToFileMap**: `Map`\<`any`, `any`\>

Defined in: [src/managers/PageManagerUuid.js:33](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/managers/PageManagerUuid.js#L33)

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

### buildLookupCaches()

> **buildLookupCaches**(): `Promise`\<`void`\>

Defined in: [src/managers/PageManagerUuid.js:53](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/managers/PageManagerUuid.js#L53)

Build lookup caches for efficient page resolution

#### Returns

`Promise`\<`void`\>

***

### createPageFromTemplate()

> **createPageFromTemplate**(`pageName`, `templateName`): `any`

Defined in: [src/managers/PageManagerUuid.js:521](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/managers/PageManagerUuid.js#L521)

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

> **deletePage**(`identifier`): `boolean`

Defined in: [src/managers/PageManagerUuid.js:322](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/managers/PageManagerUuid.js#L322)

Delete a page by any identifier

#### Parameters

##### identifier

`string`

Page identifier

#### Returns

`boolean`

True if page was deleted

***

### generatePageIndexContent()

> **generatePageIndexContent**(`regularPages`, `requiredPages`): `string`

Defined in: [src/managers/PageManagerUuid.js:413](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/managers/PageManagerUuid.js#L413)

Generate the content for PageIndex.md

#### Parameters

##### regularPages

`any`[]

Pages from pages directory

##### requiredPages

`any`[]

Pages from required-pages directory

#### Returns

`string`

Generated content

***

### generateTemplateData()

> **generateTemplateData**(`pageName`, `templateName`): `any`

Defined in: [src/managers/PageManagerUuid.js:491](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/managers/PageManagerUuid.js#L491)

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

Defined in: [src/managers/PageManagerUuid.js:472](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/managers/PageManagerUuid.js#L472)

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

> **getPage**(`identifier`): `any`

Defined in: [src/managers/PageManagerUuid.js:162](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/managers/PageManagerUuid.js#L162)

Get page content and metadata by any identifier

#### Parameters

##### identifier

`string`

Page title, slug, UUID, or legacy filename

#### Returns

`any`

Page object with content and metadata

***

### getPageBySlug()

> **getPageBySlug**(`slug`): `any`

Defined in: [src/managers/PageManagerUuid.js:545](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/managers/PageManagerUuid.js#L545)

Get page by slug (for clean URL routing)

#### Parameters

##### slug

`string`

URL slug

#### Returns

`any`

Page object or null

***

### getPageByUuid()

> **getPageByUuid**(`uuid`): `any`

Defined in: [src/managers/PageManagerUuid.js:558](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/managers/PageManagerUuid.js#L558)

Get page by UUID (for permanent links)

#### Parameters

##### uuid

`string`

Page UUID

#### Returns

`any`

Page object or null

***

### getPageNames()

> **getPageNames**(): `string`[]

Defined in: [src/managers/PageManagerUuid.js:144](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/managers/PageManagerUuid.js#L144)

Get all page names (titles for display)

#### Returns

`string`[]

Array of page titles

***

### initialize()

> **initialize**(`config`): `Promise`\<`void`\>

Defined in: [src/managers/PageManagerUuid.js:36](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/managers/PageManagerUuid.js#L36)

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

> **isRequiredPage**(`identifier`, `metadata`): `boolean`

Defined in: [src/managers/PageManagerUuid.js:209](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/managers/PageManagerUuid.js#L209)

Check if a page is a required page

#### Parameters

##### identifier

`string`

Page identifier

##### metadata

`any` = `null`

Page metadata (optional, for checking category)

#### Returns

`boolean`

True if it's a required page

***

### pageExists()

> **pageExists**(`identifier`): `boolean`

Defined in: [src/managers/PageManagerUuid.js:153](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/managers/PageManagerUuid.js#L153)

Check if page exists by any identifier

#### Parameters

##### identifier

`string`

Page title, slug, UUID, or legacy filename

#### Returns

`boolean`

True if page exists

***

### resolvePageIdentifier()

> **resolvePageIdentifier**(`identifier`): `string`

Defined in: [src/managers/PageManagerUuid.js:121](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/managers/PageManagerUuid.js#L121)

Resolve page identifier to UUID

#### Parameters

##### identifier

`string`

Page title, slug, UUID, or legacy filename

#### Returns

`string`

UUID if found, null otherwise

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

> **savePage**(`identifier`, `content`, `metadata`): `any`

Defined in: [src/managers/PageManagerUuid.js:256](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/managers/PageManagerUuid.js#L256)

Save page with content and metadata

#### Parameters

##### identifier

`string`

Page identifier (title, slug, or UUID)

##### content

`string`

Page content

##### metadata

`any` = `{}`

Page metadata

#### Returns

`any`

Saved page information

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

Defined in: [src/managers/PageManagerUuid.js:355](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/managers/PageManagerUuid.js#L355)

Update the PageIndex.md file with current page list

#### Returns

`Promise`\<`void`\>
