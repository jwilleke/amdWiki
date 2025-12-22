[**amdWiki API v1.5.0**](../../../../../README.md)

***

[amdWiki API](../../../../../README.md) / [src/parsers/dom/WikiDocument](../README.md) / export=

# Class: export=

Defined in: [src/parsers/dom/WikiDocument.js:22](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/dom/WikiDocument.js#L22)

WikiDocument - Internal DOM representation of a wiki page

Similar to JSPWiki's WikiDocument (org.apache.wiki.parser.WikiDocument)
which extends JDOM2 Document. This provides a DOM-based alternative to
string-based parsing, eliminating order-dependency issues.

Key Features:

- DOM-based structure (using linkedom for performance)
- Cacheable representation
- Metadata storage
- WeakRef context for garbage collection
- Standard W3C DOM API

JSPWiki Reference:
<https://jspwiki.apache.org/apidocs/2.12.1/org/apache/wiki/parser/WikiDocument.html>

Related: GitHub Issue #93 - Migrate to WikiDocument DOM-Based Parsing

## Constructors

### Constructor

> **new export=**(`pageData`, `context`): `WikiDocument`

Defined in: [src/parsers/dom/WikiDocument.js:29](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/dom/WikiDocument.js#L29)

Creates a new WikiDocument

#### Parameters

##### pageData

`string`

Original wiki markup content

##### context

`any`

Rendering context (stored as WeakRef)

#### Returns

`WikiDocument`

## Methods

### appendChild()

> **appendChild**(`node`): `Node`

Defined in: [src/parsers/dom/WikiDocument.js:203](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/dom/WikiDocument.js#L203)

Appends a child to the root element

#### Parameters

##### node

`Node`

Node to append

#### Returns

`Node`

Appended node

***

### clear()

> **clear**(): `void`

Defined in: [src/parsers/dom/WikiDocument.js:362](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/dom/WikiDocument.js#L362)

Clears all content from the document

#### Returns

`void`

***

### createCommentNode()

> **createCommentNode**(`text`): `Comment`

Defined in: [src/parsers/dom/WikiDocument.js:189](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/dom/WikiDocument.js#L189)

Creates a comment node

#### Parameters

##### text

`string`

Comment text

#### Returns

`Comment`

New comment node

***

### createElement()

> **createElement**(`tag`, `attributes`): `Element`

Defined in: [src/parsers/dom/WikiDocument.js:162](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/dom/WikiDocument.js#L162)

Creates a new element

#### Parameters

##### tag

`string`

Element tag name

##### attributes

`any` = `{}`

Element attributes

#### Returns

`Element`

New element

***

### createTextNode()

> **createTextNode**(`text`): `Text`

Defined in: [src/parsers/dom/WikiDocument.js:179](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/dom/WikiDocument.js#L179)

Creates a text node

#### Parameters

##### text

`string`

Text content

#### Returns

`Text`

New text node

***

### fromJSON()

> `static` **fromJSON**(`json`, `context`): `WikiDocument`

Defined in: [src/parsers/dom/WikiDocument.js:339](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/dom/WikiDocument.js#L339)

Deserializes from JSON (for cache restore)

#### Parameters

##### json

`any`

JSON data

##### context

`any` = `null`

Rendering context

#### Returns

`WikiDocument`

Restored WikiDocument

***

### getChildCount()

> **getChildCount**(): `number`

Defined in: [src/parsers/dom/WikiDocument.js:371](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/dom/WikiDocument.js#L371)

Gets the number of child nodes in root

#### Returns

`number`

Number of children

***

### getContext()

> **getContext**(): `any`

Defined in: [src/parsers/dom/WikiDocument.js:106](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/dom/WikiDocument.js#L106)

Gets the rendering context (if still alive)

JSPWiki equivalent: getContext()

#### Returns

`any`

Context object or null if garbage collected

***

### getElementById()

> **getElementById**(`id`): `Element`

Defined in: [src/parsers/dom/WikiDocument.js:269](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/dom/WikiDocument.js#L269)

Gets element by ID

#### Parameters

##### id

`string`

Element ID

#### Returns

`Element`

Element or null

***

### getElementsByClassName()

> **getElementsByClassName**(`className`): `HTMLCollection`

Defined in: [src/parsers/dom/WikiDocument.js:279](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/dom/WikiDocument.js#L279)

Gets elements by class name

#### Parameters

##### className

`string`

Class name

#### Returns

`HTMLCollection`

Elements with class

***

### getElementsByTagName()

> **getElementsByTagName**(`tagName`): `HTMLCollection`

Defined in: [src/parsers/dom/WikiDocument.js:289](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/dom/WikiDocument.js#L289)

Gets elements by tag name

#### Parameters

##### tagName

`string`

Tag name

#### Returns

`HTMLCollection`

Elements with tag

***

### getMetadata()

> **getMetadata**(): `any`

Defined in: [src/parsers/dom/WikiDocument.js:126](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/dom/WikiDocument.js#L126)

Gets all metadata

#### Returns

`any`

Metadata object

***

### getMetadataValue()

> **getMetadataValue**(`key`, `defaultValue`): `any`

Defined in: [src/parsers/dom/WikiDocument.js:147](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/dom/WikiDocument.js#L147)

Gets a metadata value

#### Parameters

##### key

`string`

Metadata key

##### defaultValue

`any` = `null`

Default value if not found

#### Returns

`any`

Metadata value or default

***

### getPageData()

> **getPageData**(): `string`

Defined in: [src/parsers/dom/WikiDocument.js:84](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/dom/WikiDocument.js#L84)

Gets the original wiki markup

JSPWiki equivalent: getPageData()

#### Returns

`string`

Original page data

***

### getRootElement()

> **getRootElement**(): `Element`

Defined in: [src/parsers/dom/WikiDocument.js:73](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/dom/WikiDocument.js#L73)

Gets the root element of the document

#### Returns

`Element`

Root element (body)

***

### getStatistics()

> **getStatistics**(): `any`

Defined in: [src/parsers/dom/WikiDocument.js:389](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/dom/WikiDocument.js#L389)

Gets document statistics

#### Returns

`any`

Statistics

***

### insertBefore()

> **insertBefore**(`newNode`, `referenceNode`): `Node`

Defined in: [src/parsers/dom/WikiDocument.js:214](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/dom/WikiDocument.js#L214)

Inserts a node before a reference node in root

#### Parameters

##### newNode

`Node`

Node to insert

##### referenceNode

`Node`

Reference node

#### Returns

`Node`

Inserted node

***

### isEmpty()

> **isEmpty**(): `boolean`

Defined in: [src/parsers/dom/WikiDocument.js:380](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/dom/WikiDocument.js#L380)

Checks if the document is empty

#### Returns

`boolean`

True if empty

***

### querySelector()

> **querySelector**(`selector`): `Element`

Defined in: [src/parsers/dom/WikiDocument.js:249](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/dom/WikiDocument.js#L249)

Queries for a single element

#### Parameters

##### selector

`string`

CSS selector

#### Returns

`Element`

First matching element or null

***

### querySelectorAll()

> **querySelectorAll**(`selector`): `NodeList`

Defined in: [src/parsers/dom/WikiDocument.js:259](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/dom/WikiDocument.js#L259)

Queries for all matching elements

#### Parameters

##### selector

`string`

CSS selector

#### Returns

`NodeList`

Matching elements

***

### removeChild()

> **removeChild**(`node`): `Node`

Defined in: [src/parsers/dom/WikiDocument.js:224](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/dom/WikiDocument.js#L224)

Removes a child from the root element

#### Parameters

##### node

`Node`

Node to remove

#### Returns

`Node`

Removed node

***

### replaceChild()

> **replaceChild**(`newNode`, `oldNode`): `Node`

Defined in: [src/parsers/dom/WikiDocument.js:235](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/dom/WikiDocument.js#L235)

Replaces a child in the root element

#### Parameters

##### newNode

`Node`

New node

##### oldNode

`Node`

Old node to replace

#### Returns

`Node`

Replaced node

***

### setContext()

> **setContext**(`context`): `void`

Defined in: [src/parsers/dom/WikiDocument.js:117](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/dom/WikiDocument.js#L117)

Sets the rendering context

JSPWiki equivalent: setContext(Context ctx)

#### Parameters

##### context

`any`

Rendering context

#### Returns

`void`

***

### setMetadata()

> **setMetadata**(`key`, `value`): `void`

Defined in: [src/parsers/dom/WikiDocument.js:136](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/dom/WikiDocument.js#L136)

Sets a metadata value

#### Parameters

##### key

`string`

Metadata key

##### value

`any`

Metadata value

#### Returns

`void`

***

### setPageData()

> **setPageData**(`data`): `void`

Defined in: [src/parsers/dom/WikiDocument.js:95](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/dom/WikiDocument.js#L95)

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

Defined in: [src/parsers/dom/WikiDocument.js:304](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/dom/WikiDocument.js#L304)

Serializes the document to HTML string

JSPWiki equivalent: XHTMLRenderer.render()

#### Returns

`string`

HTML string

***

### toJSON()

> **toJSON**(): `any`

Defined in: [src/parsers/dom/WikiDocument.js:322](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/dom/WikiDocument.js#L322)

Serializes to JSON (for caching)

#### Returns

`any`

JSON representation

***

### toString()

> **toString**(): `string`

Defined in: [src/parsers/dom/WikiDocument.js:313](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/dom/WikiDocument.js#L313)

Serializes to string (for debugging)

#### Returns

`string`

String representation
