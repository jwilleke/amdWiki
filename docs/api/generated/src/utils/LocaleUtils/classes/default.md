[**amdWiki API v1.5.0**](../../../../README.md)

***

[amdWiki API](../../../../README.md) / [src/utils/LocaleUtils](../README.md) / default

# Class: default

Defined in: [src/utils/LocaleUtils.ts:35](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/utils/LocaleUtils.ts#L35)

Locale utilities for handling browser locale and internationalization

## Constructors

### Constructor

> **new default**(): `LocaleUtils`

#### Returns

`LocaleUtils`

## Methods

### formatDate()

> `static` **formatDate**(`date`, `locale`): `string`

Defined in: [src/utils/LocaleUtils.ts:160](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/utils/LocaleUtils.ts#L160)

Format date using specified locale

#### Parameters

##### date

`Date`

Date to format

##### locale

`string` = `'en-US'`

Locale string

#### Returns

`string`

Formatted date string

***

### formatTime()

> `static` **formatTime**(`date`, `locale`): `string`

Defined in: [src/utils/LocaleUtils.ts:182](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/utils/LocaleUtils.ts#L182)

Format time using specified locale

#### Parameters

##### date

`Date`

Date to format

##### locale

`string` = `'en-US'`

Locale string

#### Returns

`string`

Formatted time string

***

### getDateFormatFromLocale()

> `static` **getDateFormatFromLocale**(`locale`): `string`

Defined in: [src/utils/LocaleUtils.ts:110](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/utils/LocaleUtils.ts#L110)

Get date format pattern based on locale

#### Parameters

##### locale

`string`

Locale string (e.g., 'en-US')

#### Returns

`string`

Date format pattern for user preferences

***

### getDateFormatOptions()

> `static` **getDateFormatOptions**(): `DateFormatOption`[]

Defined in: [src/utils/LocaleUtils.ts:202](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/utils/LocaleUtils.ts#L202)

Get available date format options

#### Returns

`DateFormatOption`[]

Array of date format options

***

### getSupportedLocales()

> `static` **getSupportedLocales**(): `SupportedLocale`[]

Defined in: [src/utils/LocaleUtils.ts:218](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/utils/LocaleUtils.ts#L218)

Get supported locales list

#### Returns

`SupportedLocale`[]

Array of supported locale objects

***

### getTimeFormatFromLocale()

> `static` **getTimeFormatFromLocale**(`locale`): `"12h"` \| `"24h"`

Defined in: [src/utils/LocaleUtils.ts:139](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/utils/LocaleUtils.ts#L139)

Get time format preference based on locale

#### Parameters

##### locale

`string`

Locale string (e.g., 'en-US')

#### Returns

`"12h"` \| `"24h"`

Time format preference ('12h' or '24h')

***

### getTimezoneDisplayName()

> `static` **getTimezoneDisplayName**(`timezone`, `locale`): `string`

Defined in: [src/utils/LocaleUtils.ts:257](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/utils/LocaleUtils.ts#L257)

Get timezone display name

#### Parameters

##### timezone

`string`

Timezone identifier (e.g., 'America/New_York')

##### locale

`string` = `'en-US'`

Locale for display name (default: 'en-US')

#### Returns

`string`

Human-readable timezone name

***

### isValidTimezone()

> `static` **isValidTimezone**(`timezone`): `boolean`

Defined in: [src/utils/LocaleUtils.ts:241](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/utils/LocaleUtils.ts#L241)

Validate timezone string

#### Parameters

##### timezone

`string`

Timezone to validate

#### Returns

`boolean`

True if timezone is valid

***

### normalizeLocale()

> `static` **normalizeLocale**(`locale`): `string`

Defined in: [src/utils/LocaleUtils.ts:69](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/utils/LocaleUtils.ts#L69)

Normalize locale string to standard format

#### Parameters

##### locale

`string`

Raw locale string

#### Returns

`string`

Normalized locale (e.g., 'en-US', 'fr-FR')

***

### parseAcceptLanguage()

> `static` **parseAcceptLanguage**(`acceptLanguage`): `string`

Defined in: [src/utils/LocaleUtils.ts:41](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/utils/LocaleUtils.ts#L41)

Parse Accept-Language header to get preferred locale

#### Parameters

##### acceptLanguage

`string`

Accept-Language header value

#### Returns

`string`

Best matching locale (e.g., 'en-US', 'fr-FR', 'de-DE')
