[**amdWiki API v1.5.0**](../../../../README.md)

***

[amdWiki API](../../../../README.md) / [src/context/WikiContext](../README.md) / WikiContextOptions

# Interface: WikiContextOptions

Defined in: [src/context/WikiContext.ts:80](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/context/WikiContext.ts#L80)

Options for WikiContext constructor

## Properties

### content?

> `optional` **content**: `string`

Defined in: [src/context/WikiContext.ts:86](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/context/WikiContext.ts#L86)

Page content (markdown)

***

### context?

> `optional` **context**: `string`

Defined in: [src/context/WikiContext.ts:82](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/context/WikiContext.ts#L82)

Context type (VIEW, EDIT, PREVIEW, etc.)

***

### pageName?

> `optional` **pageName**: `string`

Defined in: [src/context/WikiContext.ts:84](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/context/WikiContext.ts#L84)

Name of the page

***

### request?

> `optional` **request**: `Request`

Defined in: [src/context/WikiContext.ts:90](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/context/WikiContext.ts#L90)

Express request object

***

### response?

> `optional` **response**: `Response`

Defined in: [src/context/WikiContext.ts:92](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/context/WikiContext.ts#L92)

Express response object

***

### userContext?

> `optional` **userContext**: [`UserContext`](UserContext.md)

Defined in: [src/context/WikiContext.ts:88](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/context/WikiContext.ts#L88)

User context/session
