[**amdWiki API v1.5.0**](../../../../README.md)

***

[amdWiki API](../../../../README.md) / [src/utils/LocaleUtils](../README.md) / export=

# Class: export=

Defined in: [src/utils/LocaleUtils.js:5](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/utils/LocaleUtils.js#L5)

LocaleUtils - Utility functions for handling browser locale and internationalization

## Constructors

### Constructor

> **new export=**(): `LocaleUtils`

#### Returns

`LocaleUtils`

## Methods

### formatDate()

> `static` **formatDate**(`date`, `locale`): `string`

Defined in: [src/utils/LocaleUtils.js:130](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/utils/LocaleUtils.js#L130)

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

Defined in: [src/utils/LocaleUtils.js:151](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/utils/LocaleUtils.js#L151)

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

Defined in: [src/utils/LocaleUtils.js:80](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/utils/LocaleUtils.js#L80)

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

> `static` **getDateFormatOptions**(): `any`[]

Defined in: [src/utils/LocaleUtils.js:170](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/utils/LocaleUtils.js#L170)

Get available date format options

#### Returns

`any`[]

Array of date format options

***

### getSupportedLocales()

> `static` **getSupportedLocales**(): `any`[]

Defined in: [src/utils/LocaleUtils.js:186](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/utils/LocaleUtils.js#L186)

Get supported locales list

#### Returns

`any`[]

Array of supported locale objects

***

### getTimeFormatFromLocale()

> `static` **getTimeFormatFromLocale**(`locale`): `string`

Defined in: [src/utils/LocaleUtils.js:109](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/utils/LocaleUtils.js#L109)

Get time format preference based on locale

#### Parameters

##### locale

`string`

Locale string (e.g., 'en-US')

#### Returns

`string`

Time format preference ('12h' or '24h')

***

### getTimezoneDisplayName()

> `static` **getTimezoneDisplayName**(`timezone`, `locale`): `string`

Defined in: [src/utils/LocaleUtils.js:225](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/utils/LocaleUtils.js#L225)

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

Defined in: [src/utils/LocaleUtils.js:209](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/utils/LocaleUtils.js#L209)

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

Defined in: [src/utils/LocaleUtils.js:39](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/utils/LocaleUtils.js#L39)

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

Defined in: [src/utils/LocaleUtils.js:11](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/utils/LocaleUtils.js#L11)

Parse Accept-Language header to get preferred locale

#### Parameters

##### acceptLanguage

`string`

Accept-Language header value

#### Returns

`string`

Best matching locale (e.g., 'en-US', 'fr-FR', 'de-DE')
