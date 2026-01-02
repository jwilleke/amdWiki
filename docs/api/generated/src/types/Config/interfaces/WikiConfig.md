[**amdWiki API v1.5.0**](../../../../README.md)

***

[amdWiki API](../../../../README.md) / [src/types/Config](../README.md) / WikiConfig

# Interface: WikiConfig

Defined in: [src/types/Config.ts:15](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/types/Config.ts#L15)

Wiki configuration object

Represents the complete wiki configuration loaded from JSON files.
Configuration is hierarchical with app-default-config.json, app-custom-config.json,
and environment-specific overrides.

## Indexable

\[`key`: `string`\]: `any`

Additional configuration properties

## Properties

### amdwiki.application.category

> **amdwiki.application.category**: `string`

Defined in: [src/types/Config.ts:23](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/types/Config.ts#L23)

Application category

***

### amdwiki.applicationName

> **amdwiki.applicationName**: `string`

Defined in: [src/types/Config.ts:17](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/types/Config.ts#L17)

Application name

***

### amdwiki.attachment.allowedtypes

> **amdwiki.attachment.allowedtypes**: `string`

Defined in: [src/types/Config.ts:101](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/types/Config.ts#L101)

Allowed attachment MIME types

***

### amdwiki.attachment.enabled

> **amdwiki.attachment.enabled**: `boolean`

Defined in: [src/types/Config.ts:89](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/types/Config.ts#L89)

Attachment provider enabled

***

### amdwiki.attachment.forcedownload

> **amdwiki.attachment.forcedownload**: `boolean`

Defined in: [src/types/Config.ts:104](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/types/Config.ts#L104)

Force download for attachments

***

### amdwiki.attachment.maxsize

> **amdwiki.attachment.maxsize**: `number`

Defined in: [src/types/Config.ts:98](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/types/Config.ts#L98)

Maximum attachment size (bytes)

***

### amdwiki.attachment.metadatafile

> **amdwiki.attachment.metadatafile**: `string`

Defined in: [src/types/Config.ts:107](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/types/Config.ts#L107)

Attachment metadata file

***

### amdwiki.attachment.provider

> **amdwiki.attachment.provider**: `string`

Defined in: [src/types/Config.ts:95](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/types/Config.ts#L95)

Active attachment provider

***

### amdwiki.attachment.provider.default

> **amdwiki.attachment.provider.default**: `string`

Defined in: [src/types/Config.ts:92](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/types/Config.ts#L92)

Default attachment provider

***

### amdwiki.audit.provider

> **amdwiki.audit.provider**: `string`

Defined in: [src/types/Config.ts:149](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/types/Config.ts#L149)

Audit provider

***

### amdwiki.audit.provider.default

> **amdwiki.audit.provider.default**: `string`

Defined in: [src/types/Config.ts:152](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/types/Config.ts#L152)

Audit provider default

***

### amdwiki.baseURL

> **amdwiki.baseURL**: `string`

Defined in: [src/types/Config.ts:29](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/types/Config.ts#L29)

Base URL

***

### amdwiki.cache.provider

> **amdwiki.cache.provider**: `string`

Defined in: [src/types/Config.ts:143](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/types/Config.ts#L143)

Cache provider

***

### amdwiki.cache.provider.default

> **amdwiki.cache.provider.default**: `string`

Defined in: [src/types/Config.ts:146](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/types/Config.ts#L146)

Cache provider default

***

### amdwiki.encoding

> **amdwiki.encoding**: `string`

Defined in: [src/types/Config.ts:32](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/types/Config.ts#L32)

Character encoding

***

### amdwiki.faviconPath

> **amdwiki.faviconPath**: `string`

Defined in: [src/types/Config.ts:20](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/types/Config.ts#L20)

Favicon path

***

### amdwiki.frontPage

> **amdwiki.frontPage**: `string`

Defined in: [src/types/Config.ts:35](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/types/Config.ts#L35)

Front page name

***

### amdwiki.page.enabled

> **amdwiki.page.enabled**: `boolean`

Defined in: [src/types/Config.ts:68](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/types/Config.ts#L68)

Page provider enabled

***

### amdwiki.page.provider

> **amdwiki.page.provider**: `string`

Defined in: [src/types/Config.ts:74](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/types/Config.ts#L74)

Active page provider

***

### amdwiki.page.provider.default

> **amdwiki.page.provider.default**: `string`

Defined in: [src/types/Config.ts:71](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/types/Config.ts#L71)

Default page provider

***

### amdwiki.page.provider.filesystem.autosave

> **amdwiki.page.provider.filesystem.autosave**: `boolean`

Defined in: [src/types/Config.ts:86](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/types/Config.ts#L86)

Auto-save enabled

***

### amdwiki.page.provider.filesystem.encoding

> **amdwiki.page.provider.filesystem.encoding**: `string`

Defined in: [src/types/Config.ts:83](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/types/Config.ts#L83)

File encoding for pages

***

### amdwiki.page.provider.filesystem.requiredpagesdir

> **amdwiki.page.provider.filesystem.requiredpagesdir**: `string`

Defined in: [src/types/Config.ts:80](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/types/Config.ts#L80)

Required pages directory

***

### amdwiki.page.provider.filesystem.storagedir

> **amdwiki.page.provider.filesystem.storagedir**: `string`

Defined in: [src/types/Config.ts:77](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/types/Config.ts#L77)

Page storage directory

***

### amdwiki.search.autocomplete.enabled

> **amdwiki.search.autocomplete.enabled**: `boolean`

Defined in: [src/types/Config.ts:122](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/types/Config.ts#L122)

Autocomplete enabled

***

### amdwiki.search.autocomplete.minlength

> **amdwiki.search.autocomplete.minlength**: `number`

Defined in: [src/types/Config.ts:125](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/types/Config.ts#L125)

Autocomplete minimum length

***

### amdwiki.search.enabled

> **amdwiki.search.enabled**: `boolean`

Defined in: [src/types/Config.ts:110](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/types/Config.ts#L110)

Search enabled

***

### amdwiki.search.maxresults

> **amdwiki.search.maxresults**: `number`

Defined in: [src/types/Config.ts:119](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/types/Config.ts#L119)

Maximum search results

***

### amdwiki.search.provider

> **amdwiki.search.provider**: `string`

Defined in: [src/types/Config.ts:116](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/types/Config.ts#L116)

Active search provider

***

### amdwiki.search.provider.default

> **amdwiki.search.provider.default**: `string`

Defined in: [src/types/Config.ts:113](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/types/Config.ts#L113)

Default search provider

***

### amdwiki.search.suggestions.enabled

> **amdwiki.search.suggestions.enabled**: `boolean`

Defined in: [src/types/Config.ts:128](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/types/Config.ts#L128)

Search suggestions enabled

***

### amdwiki.search.suggestions.maxitems

> **amdwiki.search.suggestions.maxitems**: `number`

Defined in: [src/types/Config.ts:131](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/types/Config.ts#L131)

Maximum suggestion items

***

### amdwiki.server.host

> **amdwiki.server.host**: `string`

Defined in: [src/types/Config.ts:41](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/types/Config.ts#L41)

Server host

***

### amdwiki.server.port

> **amdwiki.server.port**: `number`

Defined in: [src/types/Config.ts:38](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/types/Config.ts#L38)

Server port

***

### amdwiki.session.httpOnly

> **amdwiki.session.httpOnly**: `boolean`

Defined in: [src/types/Config.ts:53](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/types/Config.ts#L53)

Session HTTP only flag

***

### amdwiki.session.maxAge

> **amdwiki.session.maxAge**: `number`

Defined in: [src/types/Config.ts:47](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/types/Config.ts#L47)

Session max age (milliseconds)

***

### amdwiki.session.secret

> **amdwiki.session.secret**: `string`

Defined in: [src/types/Config.ts:44](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/types/Config.ts#L44)

Session secret

***

### amdwiki.session.secure

> **amdwiki.session.secure**: `boolean`

Defined in: [src/types/Config.ts:50](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/types/Config.ts#L50)

Session secure flag (HTTPS only)

***

### amdwiki.translator-reader.allow-html

> **amdwiki.translator-reader.allow-html**: `boolean`

Defined in: [src/types/Config.ts:62](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/types/Config.ts#L62)

Translator reader - allow HTML

***

### amdwiki.translator-reader.camel-case-links

> **amdwiki.translator-reader.camel-case-links**: `boolean`

Defined in: [src/types/Config.ts:59](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/types/Config.ts#L59)

Translator reader - camel case links

***

### amdwiki.translator-reader.match-english-plurals

> **amdwiki.translator-reader.match-english-plurals**: `boolean`

Defined in: [src/types/Config.ts:56](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/types/Config.ts#L56)

Translator reader - match English plurals

***

### amdwiki.translator-reader.plain-uris

> **amdwiki.translator-reader.plain-uris**: `boolean`

Defined in: [src/types/Config.ts:65](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/types/Config.ts#L65)

Translator reader - plain URIs

***

### amdwiki.user.provider

> **amdwiki.user.provider**: `string`

Defined in: [src/types/Config.ts:134](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/types/Config.ts#L134)

User provider

***

### amdwiki.user.provider.default

> **amdwiki.user.provider.default**: `string`

Defined in: [src/types/Config.ts:137](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/types/Config.ts#L137)

User provider default

***

### amdwiki.user.provider.storagedir

> **amdwiki.user.provider.storagedir**: `string`

Defined in: [src/types/Config.ts:140](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/types/Config.ts#L140)

User storage directory

***

### amdwiki.version

> **amdwiki.version**: `string`

Defined in: [src/types/Config.ts:26](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/types/Config.ts#L26)

Application version
