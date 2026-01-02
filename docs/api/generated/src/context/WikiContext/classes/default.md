[**amdWiki API v1.5.0**](../../../../README.md)

***

[amdWiki API](../../../../README.md) / [src/context/WikiContext](../README.md) / default

# Class: default

Defined in: [src/context/WikiContext.ts:139](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/context/WikiContext.ts#L139)

WikiContext - Encapsulates the context of a single request or rendering operation

Inspired by JSPWiki's WikiContext, this class provides a request-scoped container
for all contextual information needed during page rendering, including the engine,
current page, user, request/response objects, and manager references.

 WikiContext

## See

 - [WikiEngine](../../../types/WikiEngine/interfaces/WikiEngine.md) for the main engine
 - [RenderingManager](../../../managers/RenderingManager/classes/export=.md) for rendering operations

## Constructors

### Constructor

> **new default**(`engine`, `options?`): `WikiContext`

Defined in: [src/context/WikiContext.ts:217](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/context/WikiContext.ts#L217)

Creates a new WikiContext instance

#### Parameters

##### engine

[`WikiEngine`](../../../types/WikiEngine/interfaces/WikiEngine.md)

The wiki engine instance

##### options?

[`WikiContextOptions`](../interfaces/WikiContextOptions.md) = `{}`

Context options

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

### aclManager

> `readonly` **aclManager**: [`export=`](../../../managers/ACLManager/classes/export=.md)

Defined in: [src/context/WikiContext.ts:195](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/context/WikiContext.ts#L195)

Reference to ACLManager

***

### content

> `readonly` **content**: `string`

Defined in: [src/context/WikiContext.ts:171](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/context/WikiContext.ts#L171)

Page content (markdown)

***

### context

> `readonly` **context**: `string`

Defined in: [src/context/WikiContext.ts:165](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/context/WikiContext.ts#L165)

The rendering context (VIEW, EDIT, PREVIEW, etc.)

***

### CONTEXT

> `readonly` `static` **CONTEXT**: [`ContextTypes`](../interfaces/ContextTypes.md)

Defined in: [src/context/WikiContext.ts:146](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/context/WikiContext.ts#L146)

Context type constants for different rendering modes

#### Static

***

### engine

> `readonly` **engine**: [`WikiEngine`](../../../types/WikiEngine/interfaces/WikiEngine.md)

Defined in: [src/context/WikiContext.ts:162](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/context/WikiContext.ts#L162)

The wiki engine instance

***

### pageManager

> `readonly` **pageManager**: [`export=`](../../../managers/PageManager/classes/export=.md)

Defined in: [src/context/WikiContext.ts:183](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/context/WikiContext.ts#L183)

Reference to PageManager

***

### pageName

> `readonly` **pageName**: `string`

Defined in: [src/context/WikiContext.ts:168](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/context/WikiContext.ts#L168)

Name of the current page

***

### pluginManager

> `readonly` **pluginManager**: [`default`](../../../managers/PluginManager/classes/default.md)

Defined in: [src/context/WikiContext.ts:189](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/context/WikiContext.ts#L189)

Reference to PluginManager

***

### renderingManager

> `readonly` **renderingManager**: [`export=`](../../../managers/RenderingManager/classes/export=.md)

Defined in: [src/context/WikiContext.ts:186](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/context/WikiContext.ts#L186)

Reference to RenderingManager

***

### request

> `readonly` **request**: `Request`\<`ParamsDictionary`, `any`, `any`, `ParsedQs`, `Record`\<`string`, `any`\>\>

Defined in: [src/context/WikiContext.ts:177](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/context/WikiContext.ts#L177)

Express request object

***

### response

> `readonly` **response**: `Response`\<`any`, `Record`\<`string`, `any`\>\>

Defined in: [src/context/WikiContext.ts:180](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/context/WikiContext.ts#L180)

Express response object

***

### userContext

> `readonly` **userContext**: [`UserContext`](../interfaces/UserContext.md)

Defined in: [src/context/WikiContext.ts:174](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/context/WikiContext.ts#L174)

Current user context/session

***

### variableManager

> `readonly` **variableManager**: [`default`](../../../managers/VariableManager/classes/default.md)

Defined in: [src/context/WikiContext.ts:192](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/context/WikiContext.ts#L192)

Reference to VariableManager

## Methods

### getContext()

> **getContext**(): `string`

Defined in: [src/context/WikiContext.ts:250](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/context/WikiContext.ts#L250)

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

Defined in: [src/context/WikiContext.ts:274](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/context/WikiContext.ts#L274)

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

> **toParseOptions**(): [`ParseOptions`](../interfaces/ParseOptions.md)

Defined in: [src/context/WikiContext.ts:314](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/context/WikiContext.ts#L314)

Creates the options object needed for the MarkupParser

Builds a comprehensive options object containing page context, user context,
request information, and engine reference for use during parsing.

#### Returns

[`ParseOptions`](../interfaces/ParseOptions.md)

Parse options object

#### Example

```ts
const options = context.toParseOptions();
const html = await parser.parse(content, options);
```
