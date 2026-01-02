[**amdWiki API v1.5.0**](../../../../../README.md)

***

[amdWiki API](../../../../../README.md) / [src/parsers/dom/WikiDocument](../README.md) / default

# Class: default

Defined in: [src/parsers/dom/WikiDocument.ts:127](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/parsers/dom/WikiDocument.ts#L127)

WikiDocument - DOM-based representation of a wiki page

## Constructors

### Constructor

> **new default**(`pageData`, `context?`): `WikiDocument`

Defined in: [src/parsers/dom/WikiDocument.ts:140](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/parsers/dom/WikiDocument.ts#L140)

Creates a new WikiDocument

#### Parameters

##### pageData

`string`

Original wiki markup content

##### context?

[`WikiContext`](../interfaces/WikiContext.md)

Rendering context (stored as WeakRef)

#### Returns

`WikiDocument`

## Methods

### appendChild()

> **appendChild**(`node`): [`LinkedomNode`](../type-aliases/LinkedomNode.md)

Defined in: [src/parsers/dom/WikiDocument.ts:290](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/parsers/dom/WikiDocument.ts#L290)

Appends a child to the root element

#### Parameters

##### node

[`LinkedomNode`](../type-aliases/LinkedomNode.md)

Node to append

#### Returns

[`LinkedomNode`](../type-aliases/LinkedomNode.md)

Appended node

***

### clear()

> **clear**(): `void`

Defined in: [src/parsers/dom/WikiDocument.ts:449](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/parsers/dom/WikiDocument.ts#L449)

Clears all content from the document

#### Returns

`void`

***

### createCommentNode()

> **createCommentNode**(`text`): [`LinkedomComment`](../interfaces/LinkedomComment.md)

Defined in: [src/parsers/dom/WikiDocument.ts:276](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/parsers/dom/WikiDocument.ts#L276)

Creates a comment node

#### Parameters

##### text

`string`

Comment text

#### Returns

[`LinkedomComment`](../interfaces/LinkedomComment.md)

New comment node

***

### createElement()

> **createElement**(`tag`, `attributes`): [`LinkedomElement`](../interfaces/LinkedomElement.md)

Defined in: [src/parsers/dom/WikiDocument.ts:249](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/parsers/dom/WikiDocument.ts#L249)

Creates a new element

#### Parameters

##### tag

`string`

Element tag name

##### attributes

`Record`\<`string`, `string`\> = `{}`

Element attributes

#### Returns

[`LinkedomElement`](../interfaces/LinkedomElement.md)

New element

***

### createTextNode()

> **createTextNode**(`text`): [`LinkedomText`](../interfaces/LinkedomText.md)

Defined in: [src/parsers/dom/WikiDocument.ts:266](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/parsers/dom/WikiDocument.ts#L266)

Creates a text node

#### Parameters

##### text

`string`

Text content

#### Returns

[`LinkedomText`](../interfaces/LinkedomText.md)

New text node

***

### fromJSON()

> `static` **fromJSON**(`json`, `context`): `WikiDocument`

Defined in: [src/parsers/dom/WikiDocument.ts:426](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/parsers/dom/WikiDocument.ts#L426)

Deserializes from JSON (for cache restore)

#### Parameters

##### json

[`WikiDocumentJSON`](../interfaces/WikiDocumentJSON.md)

JSON data

##### context

[`WikiContext`](../interfaces/WikiContext.md) = `null`

Rendering context

#### Returns

`WikiDocument`

Restored WikiDocument

***

### getChildCount()

> **getChildCount**(): `number`

Defined in: [src/parsers/dom/WikiDocument.ts:458](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/parsers/dom/WikiDocument.ts#L458)

Gets the number of child nodes in root

#### Returns

`number`

Number of children

***

### getContext()

> **getContext**(): [`WikiContext`](../interfaces/WikiContext.md)

Defined in: [src/parsers/dom/WikiDocument.ts:193](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/parsers/dom/WikiDocument.ts#L193)

Gets the rendering context (if still alive)

JSPWiki equivalent: getContext()

#### Returns

[`WikiContext`](../interfaces/WikiContext.md)

Context object or null if garbage collected

***

### getElementById()

> **getElementById**(`id`): [`LinkedomElement`](../interfaces/LinkedomElement.md)

Defined in: [src/parsers/dom/WikiDocument.ts:356](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/parsers/dom/WikiDocument.ts#L356)

Gets element by ID

#### Parameters

##### id

`string`

Element ID

#### Returns

[`LinkedomElement`](../interfaces/LinkedomElement.md)

Element or null

***

### getElementsByClassName()

> **getElementsByClassName**(`className`): [`LinkedomHTMLCollection`](../interfaces/LinkedomHTMLCollection.md)

Defined in: [src/parsers/dom/WikiDocument.ts:366](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/parsers/dom/WikiDocument.ts#L366)

Gets elements by class name

#### Parameters

##### className

`string`

Class name

#### Returns

[`LinkedomHTMLCollection`](../interfaces/LinkedomHTMLCollection.md)

Elements with class

***

### getElementsByTagName()

> **getElementsByTagName**(`tagName`): [`LinkedomHTMLCollection`](../interfaces/LinkedomHTMLCollection.md)

Defined in: [src/parsers/dom/WikiDocument.ts:376](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/parsers/dom/WikiDocument.ts#L376)

Gets elements by tag name

#### Parameters

##### tagName

`string`

Tag name

#### Returns

[`LinkedomHTMLCollection`](../interfaces/LinkedomHTMLCollection.md)

Elements with tag

***

### getMetadata()

> **getMetadata**(): [`WikiDocumentMetadata`](../interfaces/WikiDocumentMetadata.md)

Defined in: [src/parsers/dom/WikiDocument.ts:213](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/parsers/dom/WikiDocument.ts#L213)

Gets all metadata

#### Returns

[`WikiDocumentMetadata`](../interfaces/WikiDocumentMetadata.md)

Metadata object

***

### getMetadataValue()

> **getMetadataValue**(`key`, `defaultValue`): `unknown`

Defined in: [src/parsers/dom/WikiDocument.ts:234](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/parsers/dom/WikiDocument.ts#L234)

Gets a metadata value

#### Parameters

##### key

`string`

Metadata key

##### defaultValue

`unknown` = `null`

Default value if not found

#### Returns

`unknown`

Metadata value or default

***

### getPageData()

> **getPageData**(): `string`

Defined in: [src/parsers/dom/WikiDocument.ts:171](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/parsers/dom/WikiDocument.ts#L171)

Gets the original wiki markup

JSPWiki equivalent: getPageData()

#### Returns

`string`

Original page data

***

### getRootElement()

> **getRootElement**(): [`LinkedomElement`](../interfaces/LinkedomElement.md)

Defined in: [src/parsers/dom/WikiDocument.ts:160](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/parsers/dom/WikiDocument.ts#L160)

Gets the root element of the document

#### Returns

[`LinkedomElement`](../interfaces/LinkedomElement.md)

Root element (body)

***

### getStatistics()

> **getStatistics**(): [`WikiDocumentStatistics`](../interfaces/WikiDocumentStatistics.md)

Defined in: [src/parsers/dom/WikiDocument.ts:476](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/parsers/dom/WikiDocument.ts#L476)

Gets document statistics

#### Returns

[`WikiDocumentStatistics`](../interfaces/WikiDocumentStatistics.md)

Statistics

***

### insertBefore()

> **insertBefore**(`newNode`, `referenceNode`): [`LinkedomNode`](../type-aliases/LinkedomNode.md)

Defined in: [src/parsers/dom/WikiDocument.ts:301](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/parsers/dom/WikiDocument.ts#L301)

Inserts a node before a reference node in root

#### Parameters

##### newNode

[`LinkedomNode`](../type-aliases/LinkedomNode.md)

Node to insert

##### referenceNode

[`LinkedomNode`](../type-aliases/LinkedomNode.md)

Reference node

#### Returns

[`LinkedomNode`](../type-aliases/LinkedomNode.md)

Inserted node

***

### isEmpty()

> **isEmpty**(): `boolean`

Defined in: [src/parsers/dom/WikiDocument.ts:467](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/parsers/dom/WikiDocument.ts#L467)

Checks if the document is empty

#### Returns

`boolean`

True if empty

***

### querySelector()

> **querySelector**(`selector`): [`LinkedomElement`](../interfaces/LinkedomElement.md)

Defined in: [src/parsers/dom/WikiDocument.ts:336](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/parsers/dom/WikiDocument.ts#L336)

Queries for a single element

#### Parameters

##### selector

`string`

CSS selector

#### Returns

[`LinkedomElement`](../interfaces/LinkedomElement.md)

First matching element or null

***

### querySelectorAll()

> **querySelectorAll**(`selector`): [`LinkedomNodeList`](../interfaces/LinkedomNodeList.md)

Defined in: [src/parsers/dom/WikiDocument.ts:346](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/parsers/dom/WikiDocument.ts#L346)

Queries for all matching elements

#### Parameters

##### selector

`string`

CSS selector

#### Returns

[`LinkedomNodeList`](../interfaces/LinkedomNodeList.md)

Matching elements

***

### removeChild()

> **removeChild**(`node`): [`LinkedomNode`](../type-aliases/LinkedomNode.md)

Defined in: [src/parsers/dom/WikiDocument.ts:311](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/parsers/dom/WikiDocument.ts#L311)

Removes a child from the root element

#### Parameters

##### node

[`LinkedomNode`](../type-aliases/LinkedomNode.md)

Node to remove

#### Returns

[`LinkedomNode`](../type-aliases/LinkedomNode.md)

Removed node

***

### replaceChild()

> **replaceChild**(`newNode`, `oldNode`): [`LinkedomNode`](../type-aliases/LinkedomNode.md)

Defined in: [src/parsers/dom/WikiDocument.ts:322](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/parsers/dom/WikiDocument.ts#L322)

Replaces a child in the root element

#### Parameters

##### newNode

[`LinkedomNode`](../type-aliases/LinkedomNode.md)

New node

##### oldNode

[`LinkedomNode`](../type-aliases/LinkedomNode.md)

Old node to replace

#### Returns

[`LinkedomNode`](../type-aliases/LinkedomNode.md)

Replaced node

***

### setContext()

> **setContext**(`context`): `void`

Defined in: [src/parsers/dom/WikiDocument.ts:204](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/parsers/dom/WikiDocument.ts#L204)

Sets the rendering context

JSPWiki equivalent: setContext(Context ctx)

#### Parameters

##### context

[`WikiContext`](../interfaces/WikiContext.md)

Rendering context

#### Returns

`void`

***

### setMetadata()

> **setMetadata**(`key`, `value`): `void`

Defined in: [src/parsers/dom/WikiDocument.ts:223](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/parsers/dom/WikiDocument.ts#L223)

Sets a metadata value

#### Parameters

##### key

`string`

Metadata key

##### value

`unknown`

Metadata value

#### Returns

`void`

***

### setPageData()

> **setPageData**(`data`): `void`

Defined in: [src/parsers/dom/WikiDocument.ts:182](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/parsers/dom/WikiDocument.ts#L182)

Sets the original wiki markup

JSPWiki equivalent: setPageData(String data)

#### Parameters

##### data

`string`

Wiki markup

#### Returns

`void`

***

### toHTML()

> **toHTML**(): `string`

Defined in: [src/parsers/dom/WikiDocument.ts:391](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/parsers/dom/WikiDocument.ts#L391)

Serializes the document to HTML string

JSPWiki equivalent: XHTMLRenderer.render()

#### Returns

`string`

HTML string

***

### toJSON()

> **toJSON**(): [`WikiDocumentJSON`](../interfaces/WikiDocumentJSON.md)

Defined in: [src/parsers/dom/WikiDocument.ts:409](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/parsers/dom/WikiDocument.ts#L409)

Serializes to JSON (for caching)

#### Returns

[`WikiDocumentJSON`](../interfaces/WikiDocumentJSON.md)

JSON representation

***

### toString()

> **toString**(): `string`

Defined in: [src/parsers/dom/WikiDocument.ts:400](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/parsers/dom/WikiDocument.ts#L400)

Serializes to string (for debugging)

#### Returns

`string`

String representation
