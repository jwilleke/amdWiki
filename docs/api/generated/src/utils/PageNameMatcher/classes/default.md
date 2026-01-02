[**amdWiki API v1.5.0**](../../../../README.md)

***

[amdWiki API](../../../../README.md) / [src/utils/PageNameMatcher](../README.md) / default

# Class: default

Defined in: [src/utils/PageNameMatcher.ts:12](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/utils/PageNameMatcher.ts#L12)

PageNameMatcher - Utility for matching page names with plural and case variations

Implements JSPWiki-style plural matching to allow flexible page name resolution.
For example, linking to "Page" will match both "Page" and "Pages".

## Example

```ts
const matcher = new PageNameMatcher(true);
matcher.findMatch('Page', ['Pages', 'Main']); // Returns 'Pages'
matcher.findMatch('Categories', ['Category']); // Returns 'Category'
```

## Constructors

### Constructor

> **new default**(`matchEnglishPlurals`): `PageNameMatcher`

Defined in: [src/utils/PageNameMatcher.ts:20](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/utils/PageNameMatcher.ts#L20)

Creates a new PageNameMatcher instance

#### Parameters

##### matchEnglishPlurals

`boolean` = `true`

Enable plural matching (default: true)

#### Returns

`PageNameMatcher`

## Methods

### findConflict()

> **findConflict**(`newPageName`, `existingNames`): `string`

Defined in: [src/utils/PageNameMatcher.ts:159](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/utils/PageNameMatcher.ts#L159)

Check if a page name conflicts with any existing pages (considering plurals)
Used when creating new pages to prevent creating "Click" when "Clicks" exists

#### Parameters

##### newPageName

`string`

The new page name to check

##### existingNames

`string`[]

Array of existing page names

#### Returns

`string`

The conflicting page name, or null if no conflict

***

### findMatch()

> **findMatch**(`searchName`, `existingNames`): `string`

Defined in: [src/utils/PageNameMatcher.ts:116](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/utils/PageNameMatcher.ts#L116)

Find a matching page name from a list of existing page names

#### Parameters

##### searchName

`string`

The page name to search for

##### existingNames

`string`[]

Array of existing page names

#### Returns

`string`

The matching page name, or null if not found

***

### getVariations()

> **getVariations**(`pageName`): `string`[]

Defined in: [src/utils/PageNameMatcher.ts:41](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/utils/PageNameMatcher.ts#L41)

Get all possible plural/singular variations of a page name

#### Parameters

##### pageName

`string`

The base page name

#### Returns

`string`[]

Array of possible variations (all lowercase)

***

### matches()

> **matches**(`name1`, `name2`): `boolean`

Defined in: [src/utils/PageNameMatcher.ts:99](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/utils/PageNameMatcher.ts#L99)

Check if two page names match (considering plurals and case)

#### Parameters

##### name1

`string`

First page name

##### name2

`string`

Second page name

#### Returns

`boolean`

True if the names match

***

### normalize()

> **normalize**(`pageName`): `string`

Defined in: [src/utils/PageNameMatcher.ts:30](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/utils/PageNameMatcher.ts#L30)

Normalize a page name for comparison (lowercase)

#### Parameters

##### pageName

`string`

The page name to normalize

#### Returns

`string`

Normalized page name
