[**amdWiki API v1.5.0**](../../../../README.md)

***

[amdWiki API](../../../../README.md) / [src/managers/PageManager](../README.md) / export=

# Class: export=

Defined in: [src/managers/PageManager.ts:69](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/managers/PageManager.ts#L69)

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

 - [BaseManager](../../BaseManager/classes/default.md) for base functionality
 - FileSystemProvider for default provider implementation

## Example

```ts
const pageManager = engine.getManager('PageManager');
const page = await pageManager.getPage('Main');
console.log(page.content);
```

## Extends

- [`default`](../../BaseManager/classes/default.md)

## Constructors

### Constructor

> **new export=**(`engine`): `PageManager`

Defined in: [src/managers/PageManager.ts:79](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/managers/PageManager.ts#L79)

Creates a new PageManager instance

#### Parameters

##### engine

[`WikiEngine`](../../../types/WikiEngine/interfaces/WikiEngine.md)

The wiki engine instance

#### Returns

`PageManager`

#### Overrides

[`default`](../../BaseManager/classes/default.md).[`constructor`](../../BaseManager/classes/default.md#constructor)

## Properties

### config?

> `protected` `optional` **config**: `Record`\<`string`, `any`\>

Defined in: [src/managers/BaseManager.ts:63](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/managers/BaseManager.ts#L63)

Configuration passed during initialization

#### Inherited from

[`default`](../../BaseManager/classes/default.md).[`config`](../../BaseManager/classes/default.md#config)

***

### engine

> `protected` **engine**: [`WikiEngine`](../../../types/WikiEngine/interfaces/WikiEngine.md)

Defined in: [src/managers/BaseManager.ts:56](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/managers/BaseManager.ts#L56)

Reference to the wiki engine

#### Inherited from

[`default`](../../BaseManager/classes/default.md).[`engine`](../../BaseManager/classes/default.md#engine)

***

### initialized

> `protected` **initialized**: `boolean`

Defined in: [src/managers/BaseManager.ts:59](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/managers/BaseManager.ts#L59)

Initialization status flag

#### Inherited from

[`default`](../../BaseManager/classes/default.md).[`initialized`](../../BaseManager/classes/default.md#initialized)

## Methods

### backup()

> **backup**(): `Promise`\<[`BackupData`](../../BaseManager/interfaces/BackupData.md)\>

Defined in: [src/managers/PageManager.ts:474](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/managers/PageManager.ts#L474)

Backup all pages through the provider

Delegates to the provider's backup() method to serialize all page data.
The backup includes all page content, metadata, and directory structure.

#### Returns

`Promise`\<[`BackupData`](../../BaseManager/interfaces/BackupData.md)\>

Backup data from provider

#### Overrides

[`default`](../../BaseManager/classes/default.md).[`backup`](../../BaseManager/classes/default.md#backup)

***

### ~~deletePage()~~

> **deletePage**(`identifier`): `Promise`\<`boolean`\>

Defined in: [src/managers/PageManager.ts:384](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/managers/PageManager.ts#L384)

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

Defined in: [src/managers/PageManager.ts:353](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/managers/PageManager.ts#L353)

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

Defined in: [src/managers/PageManager.ts:423](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/managers/PageManager.ts#L423)

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

> **getCurrentPageProvider**(): [`PageProvider`](../../../types/Provider/interfaces/PageProvider.md)

Defined in: [src/managers/PageManager.ts:207](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/managers/PageManager.ts#L207)

Get the current page provider instance

#### Returns

[`PageProvider`](../../../types/Provider/interfaces/PageProvider.md)

The active provider instance

#### Example

```ts
const provider = pageManager.getCurrentPageProvider();
const info = provider.getProviderInfo();
console.log('Using:', info.name);
```

***

### getEngine()

> **getEngine**(): [`WikiEngine`](../../../types/WikiEngine/interfaces/WikiEngine.md)

Defined in: [src/managers/BaseManager.ts:126](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/managers/BaseManager.ts#L126)

Get the wiki engine instance

#### Returns

[`WikiEngine`](../../../types/WikiEngine/interfaces/WikiEngine.md)

The wiki engine instance

#### Example

```ts
const config = this.getEngine().getConfig();
```

#### Inherited from

[`default`](../../BaseManager/classes/default.md).[`getEngine`](../../BaseManager/classes/default.md#getengine)

***

### getPage()

> **getPage**(`identifier`): `Promise`\<[`WikiPage`](../../../types/Page/interfaces/WikiPage.md)\>

Defined in: [src/managers/PageManager.ts:229](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/managers/PageManager.ts#L229)

Get complete page with content and metadata

Retrieves a page by UUID, title, or slug. Returns the full page object
including content, metadata, and file path information.

#### Parameters

##### identifier

`string`

Page UUID, title, or slug

#### Returns

`Promise`\<[`WikiPage`](../../../types/Page/interfaces/WikiPage.md)\>

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

Defined in: [src/managers/PageManager.ts:249](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/managers/PageManager.ts#L249)

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

> **getPageMetadata**(`identifier`): `Promise`\<[`PageFrontmatter`](../../../types/Page/interfaces/PageFrontmatter.md)\>

Defined in: [src/managers/PageManager.ts:269](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/managers/PageManager.ts#L269)

Get only page metadata (without content)

More efficient than getPage() when only metadata is needed.

#### Parameters

##### identifier

`string`

Page UUID, title, or slug

#### Returns

`Promise`\<[`PageFrontmatter`](../../../types/Page/interfaces/PageFrontmatter.md)\>

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

Defined in: [src/managers/PageManager.ts:98](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/managers/PageManager.ts#L98)

Initialize the PageManager by loading and initializing the configured provider

Reads the page provider configuration and dynamically loads the provider class.
The provider name is normalized from lowercase (config) to PascalCase (class name).

#### Parameters

##### config?

`Record`\<`string`, `unknown`\> = `{}`

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

[`default`](../../BaseManager/classes/default.md).[`initialize`](../../BaseManager/classes/default.md#initialize)

***

### isInitialized()

> **isInitialized**(): `boolean`

Defined in: [src/managers/BaseManager.ts:114](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/managers/BaseManager.ts#L114)

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

[`default`](../../BaseManager/classes/default.md).[`isInitialized`](../../BaseManager/classes/default.md#isinitialized)

***

### pageExists()

> **pageExists**(`identifier`): `boolean`

Defined in: [src/managers/PageManager.ts:404](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/managers/PageManager.ts#L404)

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

Defined in: [src/managers/PageManager.ts:443](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/managers/PageManager.ts#L443)

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

Defined in: [src/managers/PageManager.ts:514](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/managers/PageManager.ts#L514)

Restore pages from backup data

Delegates to the provider's restore() method to recreate all pages
from the backup data.

#### Parameters

##### backupData

[`BackupData`](../../BaseManager/interfaces/BackupData.md)

Backup data from backup() method

#### Returns

`Promise`\<`void`\>

#### Overrides

[`default`](../../BaseManager/classes/default.md).[`restore`](../../BaseManager/classes/default.md#restore)

***

### ~~savePage()~~

> **savePage**(`pageName`, `content`, `metadata?`): `Promise`\<`void`\>

Defined in: [src/managers/PageManager.ts:332](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/managers/PageManager.ts#L332)

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

`Partial`\<[`PageFrontmatter`](../../../types/Page/interfaces/PageFrontmatter.md)\> = `{}`

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

Defined in: [src/managers/PageManager.ts:292](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/managers/PageManager.ts#L292)

Save page content and metadata using WikiContext

Creates a new page or updates an existing one using WikiContext as the
single source of truth. Extracts page name, content, and author from context.

#### Parameters

##### wikiContext

`WikiContext`

The wiki context containing page and user info

##### metadata?

`Partial`\<[`PageFrontmatter`](../../../types/Page/interfaces/PageFrontmatter.md)\> = `{}`

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

Defined in: [src/managers/PageManager.ts:458](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/managers/PageManager.ts#L458)

Shutdown the PageManager and its provider

Cleanly shuts down the provider, closing connections and flushing caches.

#### Returns

`Promise`\<`void`\>

#### Async

#### Overrides

[`default`](../../BaseManager/classes/default.md).[`shutdown`](../../BaseManager/classes/default.md#shutdown)
