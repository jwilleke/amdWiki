[**amdWiki API v1.5.0**](../../../../README.md)

***

[amdWiki API](../../../../README.md) / [src/context/WikiContext](../README.md) / export=

# Class: export=

Defined in: [src/context/WikiContext.js:30](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/context/WikiContext.js#L30)

WikiContext - Encapsulates the context of a single request or rendering operation

Inspired by JSPWiki's WikiContext, this class provides a request-scoped container
for all contextual information needed during page rendering, including the engine,
current page, user, request/response objects, and manager references.

 WikiContext

## See

- WikiEngine for the main engine
- RenderingManager for rendering operations

## Constructors

### Constructor

> **new export=**(`engine`, `options?`): `WikiContext`

Defined in: [src/context/WikiContext.js:76](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/context/WikiContext.js#L76)

Creates a new WikiContext instance

#### Parameters

##### engine

`WikiEngine`

The wiki engine instance

##### options?

Context options

###### content?

`string`

Page content

###### context?

`string`

Context type (VIEW, EDIT, etc.)

###### pageName?

`string`

Name of the page

###### request?

`any`

Express request object

###### response?

`any`

Express response object

###### userContext?

`any`

User context/session

#### Returns

`WikiContext`

#### Throws

If engine is not provided

#### Example

```ts
const context = new WikiContext(engine, {
  context: WikiContext.CONTEXT.VIEW,
  pageName: 'Main',
  userContext: req.session.user,
  request: req,
  response: res
});
```

## Properties

### \_fallbackConverter

> **\_fallbackConverter**: `any`

Defined in: [src/context/WikiContext.js:96](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/context/WikiContext.js#L96)

Fallback markdown converter

***

### aclManager

> **aclManager**: `any`

Defined in: [src/context/WikiContext.js:94](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/context/WikiContext.js#L94)

Reference to ACLManager

***

### content

> **content**: `string`

Defined in: [src/context/WikiContext.js:84](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/context/WikiContext.js#L84)

Page content (markdown)

***

### context

> **context**: `string`

Defined in: [src/context/WikiContext.js:82](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/context/WikiContext.js#L82)

The rendering context (VIEW, EDIT, PREVIEW, etc.)

***

### CONTEXT

> `readonly` `static` **CONTEXT**: `object`

Defined in: [src/context/WikiContext.js:38](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/context/WikiContext.js#L38)

Context type constants for different rendering modes

#### DIFF

> **DIFF**: `string` = `'diff'`

Viewing page diff

#### EDIT

> **EDIT**: `string` = `'edit'`

Editing a page

#### INFO

> **INFO**: `string` = `'info'`

Viewing page information/metadata

#### NONE

> **NONE**: `string` = `'none'`

No specific page context

#### PREVIEW

> **PREVIEW**: `string` = `'preview'`

Previewing page changes

#### VIEW

> **VIEW**: `string` = `'view'`

Viewing a page

#### Static

***

### engine

> **engine**: `WikiEngine`

Defined in: [src/context/WikiContext.js:81](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/context/WikiContext.js#L81)

The wiki engine instance

***

### pageManager

> **pageManager**: `any`

Defined in: [src/context/WikiContext.js:90](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/context/WikiContext.js#L90)

Reference to PageManager

***

### pageName

> **pageName**: `string`

Defined in: [src/context/WikiContext.js:83](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/context/WikiContext.js#L83)

Name of the current page

***

### pluginManager

> **pluginManager**: `any`

Defined in: [src/context/WikiContext.js:92](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/context/WikiContext.js#L92)

Reference to PluginManager

***

### renderingManager

> **renderingManager**: `any`

Defined in: [src/context/WikiContext.js:91](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/context/WikiContext.js#L91)

Reference to RenderingManager

***

### request

> **request**: `any`

Defined in: [src/context/WikiContext.js:86](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/context/WikiContext.js#L86)

Express request object

***

### response

> **response**: `any`

Defined in: [src/context/WikiContext.js:87](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/context/WikiContext.js#L87)

Express response object

***

### userContext

> **userContext**: `any`

Defined in: [src/context/WikiContext.js:85](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/context/WikiContext.js#L85)

Current user context/session

***

### variableManager

> **variableManager**: `any`

Defined in: [src/context/WikiContext.js:93](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/context/WikiContext.js#L93)

Reference to VariableManager

## Methods

### getContext()

> **getContext**(): `string`

Defined in: [src/context/WikiContext.js:109](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/context/WikiContext.js#L109)

Returns the current rendering context type

#### Returns

`string`

The context type (VIEW, EDIT, PREVIEW, etc.)

#### Example

```ts
if (context.getContext() === WikiContext.CONTEXT.EDIT) {
  // Show edit-specific UI
}
```

***

### renderMarkdown()

> **renderMarkdown**(`content?`): `Promise`\<`string`\>

Defined in: [src/context/WikiContext.js:133](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/context/WikiContext.js#L133)

Renders the provided markdown content through the full rendering pipeline

This method uses the MarkupParser for advanced parsing with plugin support,
variable expansion, and multi-phase processing. Falls back to simple Showdown
conversion if the parser is unavailable.

#### Parameters

##### content?

`string` = `...`

The markdown content to render

#### Returns

`Promise`\<`string`\>

The rendered HTML

#### Async

#### Examples

```ts
const html = await context.renderMarkdown('# Hello World');
// Returns: '<h1>Hello World</h1>'
```

```ts
// With plugins and variables
const html = await context.renderMarkdown('[{CurrentTimePlugin}]');
// Returns expanded plugin output
```

***

### toParseOptions()

> **toParseOptions**(): `any`

Defined in: [src/context/WikiContext.js:174](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/context/WikiContext.js#L174)

Creates the options object needed for the MarkupParser

Builds a comprehensive options object containing page context, user context,
request information, and engine reference for use during parsing.

#### Returns

`any`

Parse options object

#### Example

```ts
const options = context.toParseOptions();
const html = await parser.parse(content, options);
```
