[**amdWiki API v1.5.0**](../../../../README.md)

***

[amdWiki API](../../../../README.md) / [src/utils/SchemaGenerator](../README.md) / export=

# Class: export=

Defined in: [src/utils/SchemaGenerator.js:5](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/utils/SchemaGenerator.js#L5)

SchemaGenerator - Generates Schema.org JSON-LD markup from page metadata
Provides SEO and semantic web benefits for amdWiki platform

## Constructors

### Constructor

> **new export=**(): `SchemaGenerator`

#### Returns

`SchemaGenerator`

## Methods

### determineSchemaType()

> `static` **determineSchemaType**(`pageData`): `string`

Defined in: [src/utils/SchemaGenerator.js:87](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/utils/SchemaGenerator.js#L87)

Determine appropriate Schema.org type based on page metadata

#### Parameters

##### pageData

`any`

Page metadata

#### Returns

`string`

Schema.org type

***

### enhanceCreativeWork()

> `static` **enhanceCreativeWork**(`schema`, `pageData`, `options`): `any`

Defined in: [src/utils/SchemaGenerator.js:161](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/utils/SchemaGenerator.js#L161)

Enhance CreativeWork schema for project pages

#### Parameters

##### schema

`any`

##### pageData

`any`

##### options

`any`

#### Returns

`any`

***

### enhanceSchemaByType()

> `static` **enhanceSchemaByType**(`baseSchema`, `pageData`, `options`): `any`

Defined in: [src/utils/SchemaGenerator.js:126](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/utils/SchemaGenerator.js#L126)

Enhance schema based on determined type

#### Parameters

##### baseSchema

`any`

Base schema object

##### pageData

`any`

Page metadata

##### options

`any`

Generation options

#### Returns

`any`

Enhanced schema object

***

### enhanceTechArticle()

> `static` **enhanceTechArticle**(`schema`, `pageData`, `options`): `any`

Defined in: [src/utils/SchemaGenerator.js:145](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/utils/SchemaGenerator.js#L145)

Enhance TechArticle schema for documentation

#### Parameters

##### schema

`any`

##### pageData

`any`

##### options

`any`

#### Returns

`any`

***

### enhanceWebPage()

> `static` **enhanceWebPage**(`schema`, `pageData`, `options`): `any`

Defined in: [src/utils/SchemaGenerator.js:177](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/utils/SchemaGenerator.js#L177)

Enhance WebPage schema for wiki pages

#### Parameters

##### schema

`any`

##### pageData

`any`

##### options

`any`

#### Returns

`any`

***

### generateACLBasedPermissions()

> `static` **generateACLBasedPermissions**(`pageACL`, `userManager`, `options`): `any`[]

Defined in: [src/utils/SchemaGenerator.js:583](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/utils/SchemaGenerator.js#L583)

Generate permissions based on parsed page ACL

#### Parameters

##### pageACL

`any`

Parsed ACL object

##### userManager

`any`

UserManager instance

##### options

`any`

Generation options

#### Returns

`any`[]

Array of DigitalDocumentPermission objects

***

### generateComprehensiveSchema()

> `static` **generateComprehensiveSchema**(`siteData`, `options`): `any`[]

Defined in: [src/utils/SchemaGenerator.js:660](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/utils/SchemaGenerator.js#L660)

Generate comprehensive site schema using Schema.org compliant data

#### Parameters

##### siteData

`any`

Combined data from SchemaManager

##### options

`any` = `{}`

Generation options

#### Returns

`any`[]

Array of schema objects

***

### generateDeveloperPermissions()

> `static` **generateDeveloperPermissions**(`pageData`, `userManager`, `options`): `any`[]

Defined in: [src/utils/SchemaGenerator.js:543](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/utils/SchemaGenerator.js#L543)

Generate permissions for Developer category pages

#### Parameters

##### pageData

`any`

Page metadata

##### userManager

`any`

UserManager instance

##### options

`any`

Generation options

#### Returns

`any`[]

Array of DigitalDocumentPermission objects

***

### generateDigitalDocumentPermissions()

> `static` **generateDigitalDocumentPermissions**(`pageData`, `user`, `options`): `any`[]

Defined in: [src/utils/SchemaGenerator.js:343](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/utils/SchemaGenerator.js#L343)

Generate DigitalDocumentPermission objects for a page

#### Parameters

##### pageData

`any`

Page metadata and content

##### user

`any`

Current user context (null for anonymous)

##### options

`any` = `{}`

Generation options (must include engine)

#### Returns

`any`[]

Array of DigitalDocumentPermission objects

***

### generateDocumentationPermissions()

> `static` **generateDocumentationPermissions**(`pageData`, `userManager`, `options`): `any`[]

Defined in: [src/utils/SchemaGenerator.js:503](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/utils/SchemaGenerator.js#L503)

Generate permissions for Documentation category pages

#### Parameters

##### pageData

`any`

Page metadata

##### userManager

`any`

UserManager instance

##### options

`any`

Generation options

#### Returns

`any`[]

Array of DigitalDocumentPermission objects

***

### generateGeneralPagePermissions()

> `static` **generateGeneralPagePermissions**(`pageData`, `userManager`, `options`): `any`[]

Defined in: [src/utils/SchemaGenerator.js:403](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/utils/SchemaGenerator.js#L403)

Generate permissions for General category pages (user content)

#### Parameters

##### pageData

`any`

Page metadata

##### userManager

`any`

UserManager instance

##### options

`any`

Generation options

#### Returns

`any`[]

Array of DigitalDocumentPermission objects

***

### generateOrganizationSchema()

> `static` **generateOrganizationSchema**(`organizationData`, `options`): `any`

Defined in: [src/utils/SchemaGenerator.js:270](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/utils/SchemaGenerator.js#L270)

Generate Organization schema from Schema.org compliant organization data

#### Parameters

##### organizationData

`any`

Schema.org Organization data

##### options

`any` = `{}`

Generation options

#### Returns

`any`

Organization schema object

***

### generatePageSchema()

> `static` **generatePageSchema**(`pageData`, `options`): `any`

Defined in: [src/utils/SchemaGenerator.js:12](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/utils/SchemaGenerator.js#L12)

Generate Schema.org markup for a wiki page

#### Parameters

##### pageData

`any`

Page metadata and content

##### options

`any` = `{}`

Generation options (should include engine and user for permissions)

#### Returns

`any`

JSON-LD schema object

***

### generatePermissionsByContext()

> `static` **generatePermissionsByContext**(`pageData`, `pageACL`, `userManager`, `aclManager`, `options`): `any`[]

Defined in: [src/utils/SchemaGenerator.js:376](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/utils/SchemaGenerator.js#L376)

Generate permissions based on page category and protection level

#### Parameters

##### pageData

`any`

Page metadata

##### pageACL

`any`

Parsed ACL from page content

##### userManager

`any`

UserManager instance

##### aclManager

`any`

ACLManager instance

##### options

`any`

Generation options

#### Returns

`any`[]

Array of DigitalDocumentPermission objects

***

### generatePersonSchema()

> `static` **generatePersonSchema**(`personData`, `options`): `any`

Defined in: [src/utils/SchemaGenerator.js:252](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/utils/SchemaGenerator.js#L252)

Generate Person schema from Schema.org compliant person data

#### Parameters

##### personData

`any`

Schema.org Person data

##### options

`any` = `{}`

Generation options

#### Returns

`any`

Person schema object

***

### generateScriptTag()

> `static` **generateScriptTag**(`schema`): `string`

Defined in: [src/utils/SchemaGenerator.js:232](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/utils/SchemaGenerator.js#L232)

Generate JSON-LD script tag for HTML injection

#### Parameters

##### schema

`any`

Schema.org object

#### Returns

`string`

HTML script tag

***

### generateSiteSchema()

> `static` **generateSiteSchema**(`pages`, `options`): `any`[]

Defined in: [src/utils/SchemaGenerator.js:242](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/utils/SchemaGenerator.js#L242)

Generate schema for multiple pages (site-wide)

#### Parameters

##### pages

`any`[]

Array of page data objects

##### options

`any` = `{}`

Generation options

#### Returns

`any`[]

Array of schema objects

***

### generateSoftwareSchema()

> `static` **generateSoftwareSchema**(`configData`, `options`): `any`

Defined in: [src/utils/SchemaGenerator.js:288](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/utils/SchemaGenerator.js#L288)

Generate SoftwareApplication schema from wiki configuration

#### Parameters

##### configData

`any`

Configuration from wiki.json

##### options

`any` = `{}`

Generation options

#### Returns

`any`

SoftwareApplication schema object

***

### generateSystemPagePermissions()

> `static` **generateSystemPagePermissions**(`pageData`, `userManager`, `options`): `any`[]

Defined in: [src/utils/SchemaGenerator.js:471](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/utils/SchemaGenerator.js#L471)

Generate permissions for System category pages (app-managed)

#### Parameters

##### pageData

`any`

Page metadata

##### userManager

`any`

UserManager instance

##### options

`any`

Generation options

#### Returns

`any`[]

Array of DigitalDocumentPermission objects

***

### mapPrincipalToGrantee()

> `static` **mapPrincipalToGrantee**(`principal`, `userManager`): `any`

Defined in: [src/utils/SchemaGenerator.js:623](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/utils/SchemaGenerator.js#L623)

Map ACL principal to Schema.org grantee object

#### Parameters

##### principal

`string`

ACL principal (user, role, or special)

##### userManager

`any`

UserManager instance

#### Returns

`any`

Schema.org Person or Audience object
