[**amdWiki API v1.5.0**](../../../../README.md)

***

[amdWiki API](../../../../README.md) / [src/managers/PageManager](../README.md) / export=

# Class: export=

Defined in: [src/managers/PageManager.js:31](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/managers/PageManager.js#L31)

PageManager - Manages wiki page operations through a pluggable provider system

Follows JSPWiki's provider pattern where the actual storage implementation
is abstracted behind a provider interface. This allows for different storage
backends (filesystem, database, cloud, etc.) to be swapped via configuration.

The PageManager acts as a thin coordinator that:

- Loads the configured provider (via "amdwiki.page.provider")
- Proxies all page operations to the provider
- Maintains the public API for backward compatibility

 PageManager

## See

- [BaseManager](../../BaseManager/classes/export=.md) for base functionality
- [FileSystemProvider](../../../providers/FileSystemProvider/README.md) for default provider implementation

## Example

```ts
const pageManager = engine.getManager('PageManager');
const page = await pageManager.getPage('Main');
console.log(page.content);
```

## Extends

- [`export=`](../../BaseManager/classes/export=.md)

## Constructors

### Constructor

> **new export=**(`engine`): `PageManager`

Defined in: [src/managers/PageManager.js:38](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/managers/PageManager.js#L38)

Creates a new PageManager instance

#### Parameters

##### engine

`WikiEngine`

The wiki engine instance

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

### provider

> **provider**: `any`

Defined in: [src/managers/PageManager.js:40](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/managers/PageManager.js#L40)

The active page storage provider

***

### providerClass

> **providerClass**: `string`

Defined in: [src/managers/PageManager.js:84](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/managers/PageManager.js#L84)

The class name of the loaded provider

## Methods

### backup()

> **backup**(): `Promise`\<`any`\>

Defined in: [src/managers/PageManager.js:391](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/managers/PageManager.js#L391)

Backup all pages through the provider

Delegates to the provider's backup() method to serialize all page data.
The backup includes all page content, metadata, and directory structure.

#### Returns

`Promise`\<`any`\>

Backup data from provider

#### Overrides

[`export=`](../../BaseManager/classes/export=.md).[`backup`](../../BaseManager/classes/export=.md#backup)

***

### ~~deletePage()~~

> **deletePage**(`identifier`): `Promise`\<`boolean`\>

Defined in: [src/managers/PageManager.js:314](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/managers/PageManager.js#L314)

Delete a page

Removes a page from storage. The page can be identified by UUID, title, or slug.

#### Parameters

##### identifier

`string`

Page UUID, title, or slug

#### Returns

`Promise`\<`boolean`\>

True if deleted, false if not found

#### Async

#### Deprecated

Use deletePageWithContext() with WikiContext instead

#### Example

```ts
const deleted = await pageManager.deletePage('Old Page');
if (deleted) console.log('Page removed');
```

***

### deletePageWithContext()

> **deletePageWithContext**(`wikiContext`): `Promise`\<`boolean`\>

Defined in: [src/managers/PageManager.js:287](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/managers/PageManager.js#L287)

Delete a page using WikiContext

Removes a page from storage using WikiContext as the single source of truth.
Extracts the page name from the context.

#### Parameters

##### wikiContext

`WikiContext`

The wiki context containing page info

#### Returns

`Promise`\<`boolean`\>

True if deleted, false if not found

#### Async

#### Example

```ts
const deleted = await pageManager.deletePageWithContext(wikiContext);
if (deleted) console.log('Page removed');
```

***

### getAllPages()

> **getAllPages**(): `Promise`\<`string`[]\>

Defined in: [src/managers/PageManager.js:347](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/managers/PageManager.js#L347)

Get all page titles

Returns a sorted list of all page titles in the wiki.

#### Returns

`Promise`\<`string`[]\>

Sorted array of page titles

#### Async

#### Example

```ts
const pages = await pageManager.getAllPages();
console.log('Total pages:', pages.length);
```

***

### getCurrentPageProvider()

> **getCurrentPageProvider**(): `BasePageProvider`

Defined in: [src/managers/PageManager.js:152](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/managers/PageManager.js#L152)

Get the current page provider instance

#### Returns

`BasePageProvider`

The active provider instance

#### Example

```ts
const provider = pageManager.getCurrentPageProvider();
const info = provider.getProviderInfo();
console.log('Using:', info.name);
```

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

> **getPage**(`identifier`): `Promise`\<`any`\>

Defined in: [src/managers/PageManager.js:179](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/managers/PageManager.js#L179)

Get complete page with content and metadata

Retrieves a page by UUID, title, or slug. Returns the full page object
including content, metadata, and file path information.

#### Parameters

##### identifier

`string`

Page UUID, title, or slug

#### Returns

`Promise`\<`any`\>

Page object or null if not found

#### Async

#### Example

```ts
const page = await pageManager.getPage('Main');
console.log(page.title, page.metadata.author);
```

***

### getPageContent()

> **getPageContent**(`identifier`): `Promise`\<`string`\>

Defined in: [src/managers/PageManager.js:196](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/managers/PageManager.js#L196)

Get only page content (without metadata)

More efficient than getPage() when only content is needed.

#### Parameters

##### identifier

`string`

Page UUID, title, or slug

#### Returns

`Promise`\<`string`\>

Markdown content

#### Async

#### Example

```ts
const content = await pageManager.getPageContent('Main');
console.log(content);
```

***

### getPageMetadata()

> **getPageMetadata**(`identifier`): `Promise`\<`any`\>

Defined in: [src/managers/PageManager.js:213](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/managers/PageManager.js#L213)

Get only page metadata (without content)

More efficient than getPage() when only metadata is needed.

#### Parameters

##### identifier

`string`

Page UUID, title, or slug

#### Returns

`Promise`\<`any`\>

Metadata object or null if not found

#### Async

#### Example

```ts
const meta = await pageManager.getPageMetadata('Main');
console.log('Author:', meta.author);
```

***

### initialize()

> **initialize**(`config?`): `Promise`\<`void`\>

Defined in: [src/managers/PageManager.js:58](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/managers/PageManager.js#L58)

Initialize the PageManager by loading and initializing the configured provider

Reads the page provider configuration and dynamically loads the provider class.
The provider name is normalized from lowercase (config) to PascalCase (class name).

#### Parameters

##### config?

`any` = `{}`

Configuration object (unused, reads from ConfigurationManager)

#### Returns

`Promise`\<`void`\>

#### Async

#### Throws

If ConfigurationManager is not available or provider fails to load

#### Example

```ts
await pageManager.initialize();
// Loads FileSystemProvider by default
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

### pageExists()

> **pageExists**(`identifier`): `boolean`

Defined in: [src/managers/PageManager.js:331](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/managers/PageManager.js#L331)

Check if page exists

Fast existence check without loading page content.

#### Parameters

##### identifier

`string`

Page UUID, title, or slug

#### Returns

`boolean`

True if page exists

#### Example

```ts
if (pageManager.pageExists('Main')) {
  console.log('Main page exists');
}
```

***

### refreshPageList()

> **refreshPageList**(): `Promise`\<`void`\>

Defined in: [src/managers/PageManager.js:364](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/managers/PageManager.js#L364)

Refresh internal cache/index

Forces the provider to rebuild its internal caches and indices.
Useful after external file system changes.

#### Returns

`Promise`\<`void`\>

#### Async

#### Example

```ts
await pageManager.refreshPageList();
console.log('Page list refreshed');
```

***

### restore()

> **restore**(`backupData`): `Promise`\<`void`\>

Defined in: [src/managers/PageManager.js:429](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/managers/PageManager.js#L429)

Restore pages from backup data

Delegates to the provider's restore() method to recreate all pages
from the backup data.

#### Parameters

##### backupData

`any`

Backup data from backup() method

#### Returns

`Promise`\<`void`\>

#### Overrides

[`export=`](../../BaseManager/classes/export=.md).[`restore`](../../BaseManager/classes/export=.md#restore)

***

### ~~savePage()~~

> **savePage**(`pageName`, `content`, `metadata?`): `Promise`\<`void`\>

Defined in: [src/managers/PageManager.js:269](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/managers/PageManager.js#L269)

Save page content and metadata

Creates a new page or updates an existing one. Handles UUID generation
for new pages and version management automatically.

#### Parameters

##### pageName

`string`

Page title

##### content

`string`

Markdown content

##### metadata?

`any` = `{}`

Frontmatter metadata

#### Returns

`Promise`\<`void`\>

#### Async

#### Deprecated

Use savePageWithContext() with WikiContext instead

#### Example

```ts
await pageManager.savePage('New Page', '# Hello World', {
  author: 'admin',
  tags: ['tutorial']
});
```

***

### savePageWithContext()

> **savePageWithContext**(`wikiContext`, `metadata?`): `Promise`\<`void`\>

Defined in: [src/managers/PageManager.js:233](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/managers/PageManager.js#L233)

Save page content and metadata using WikiContext

Creates a new page or updates an existing one using WikiContext as the
single source of truth. Extracts page name, content, and author from context.

#### Parameters

##### wikiContext

`WikiContext`

The wiki context containing page and user info

##### metadata?

`any` = `{}`

Additional frontmatter metadata

#### Returns

`Promise`\<`void`\>

#### Async

#### Example

```ts
await pageManager.savePageWithContext(wikiContext, {
  tags: ['tutorial']
});
```

***

### shutdown()

> **shutdown**(): `Promise`\<`void`\>

Defined in: [src/managers/PageManager.js:376](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/managers/PageManager.js#L376)

Shutdown the PageManager and its provider

Cleanly shuts down the provider, closing connections and flushing caches.

#### Returns

`Promise`\<`void`\>

#### Async

#### Overrides

[`export=`](../../BaseManager/classes/export=.md).[`shutdown`](../../BaseManager/classes/export=.md#shutdown)
