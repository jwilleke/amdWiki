[**amdWiki API v1.5.0**](../../../../README.md)

***

[amdWiki API](../../../../README.md) / [src/utils/SchemaGenerator](../README.md) / default

# Class: default

Defined in: [src/utils/SchemaGenerator.ts:130](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/utils/SchemaGenerator.ts#L130)

SchemaGenerator - Generates Schema.org JSON-LD markup from page metadata
Provides SEO and semantic web benefits for amdWiki platform

## Constructors

### Constructor

> **new default**(): `SchemaGenerator`

#### Returns

`SchemaGenerator`

## Methods

### determineSchemaType()

> `static` **determineSchemaType**(`pageData`): `string`

Defined in: [src/utils/SchemaGenerator.ts:212](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/utils/SchemaGenerator.ts#L212)

Determine appropriate Schema.org type based on page metadata

#### Parameters

##### pageData

`PageData`

Page metadata

#### Returns

`string`

Schema.org type

***

### enhanceCreativeWork()

> `static` **enhanceCreativeWork**(`schema`, `pageData`, `options`): `BaseSchema`

Defined in: [src/utils/SchemaGenerator.ts:286](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/utils/SchemaGenerator.ts#L286)

Enhance CreativeWork schema for project pages

#### Parameters

##### schema

`BaseSchema`

##### pageData

`PageData`

##### options

`SchemaOptions`

#### Returns

`BaseSchema`

***

### enhanceSchemaByType()

> `static` **enhanceSchemaByType**(`baseSchema`, `pageData`, `options`): `BaseSchema`

Defined in: [src/utils/SchemaGenerator.ts:251](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/utils/SchemaGenerator.ts#L251)

Enhance schema based on determined type

#### Parameters

##### baseSchema

`BaseSchema`

Base schema object

##### pageData

`PageData`

Page metadata

##### options

`SchemaOptions`

Generation options

#### Returns

`BaseSchema`

Enhanced schema object

***

### enhanceTechArticle()

> `static` **enhanceTechArticle**(`schema`, `pageData`, `options`): `BaseSchema`

Defined in: [src/utils/SchemaGenerator.ts:270](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/utils/SchemaGenerator.ts#L270)

Enhance TechArticle schema for documentation

#### Parameters

##### schema

`BaseSchema`

##### pageData

`PageData`

##### options

`SchemaOptions`

#### Returns

`BaseSchema`

***

### enhanceWebPage()

> `static` **enhanceWebPage**(`schema`, `pageData`, `options`): `BaseSchema`

Defined in: [src/utils/SchemaGenerator.ts:302](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/utils/SchemaGenerator.ts#L302)

Enhance WebPage schema for wiki pages

#### Parameters

##### schema

`BaseSchema`

##### pageData

`PageData`

##### options

`SchemaOptions`

#### Returns

`BaseSchema`

***

### generateACLBasedPermissions()

> `static` **generateACLBasedPermissions**(`pageACL`, `userManager`, `options`): `any`[]

Defined in: [src/utils/SchemaGenerator.ts:708](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/utils/SchemaGenerator.ts#L708)

Generate permissions based on parsed page ACL

#### Parameters

##### pageACL

`ParsedACL`

Parsed ACL object

##### userManager

`unknown`

UserManager instance

##### options

`SchemaOptions`

Generation options

#### Returns

`any`[]

Array of DigitalDocumentPermission objects

***

### generateComprehensiveSchema()

> `static` **generateComprehensiveSchema**(`siteData`, `options`): `any`[]

Defined in: [src/utils/SchemaGenerator.ts:785](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/utils/SchemaGenerator.ts#L785)

Generate comprehensive site schema using Schema.org compliant data

#### Parameters

##### siteData

`SiteData`

Combined data from SchemaManager

##### options

`SchemaOptions` = `{}`

Generation options

#### Returns

`any`[]

Array of schema objects

***

### generateDeveloperPermissions()

> `static` **generateDeveloperPermissions**(`pageData`, `userManager`, `options`): `any`[]

Defined in: [src/utils/SchemaGenerator.ts:668](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/utils/SchemaGenerator.ts#L668)

Generate permissions for Developer category pages

#### Parameters

##### pageData

`PageData`

Page metadata

##### userManager

`unknown`

UserManager instance

##### options

`SchemaOptions`

Generation options

#### Returns

`any`[]

Array of DigitalDocumentPermission objects

***

### generateDigitalDocumentPermissions()

> `static` **generateDigitalDocumentPermissions**(`pageData`, `user`, `options`): `any`

Defined in: [src/utils/SchemaGenerator.ts:468](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/utils/SchemaGenerator.ts#L468)

Generate DigitalDocumentPermission objects for a page

#### Parameters

##### pageData

`PageData`

Page metadata and content

##### user

`unknown`

Current user context (null for anonymous)

##### options

`SchemaOptions` = `{}`

Generation options (must include engine)

#### Returns

`any`

Array of DigitalDocumentPermission objects

***

### generateDocumentationPermissions()

> `static` **generateDocumentationPermissions**(`pageData`, `userManager`, `options`): `any`[]

Defined in: [src/utils/SchemaGenerator.ts:628](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/utils/SchemaGenerator.ts#L628)

Generate permissions for Documentation category pages

#### Parameters

##### pageData

`PageData`

Page metadata

##### userManager

`unknown`

UserManager instance

##### options

`SchemaOptions`

Generation options

#### Returns

`any`[]

Array of DigitalDocumentPermission objects

***

### generateGeneralPagePermissions()

> `static` **generateGeneralPagePermissions**(`pageData`, `userManager`, `options`): `any`[]

Defined in: [src/utils/SchemaGenerator.ts:528](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/utils/SchemaGenerator.ts#L528)

Generate permissions for General category pages (user content)

#### Parameters

##### pageData

`PageData`

Page metadata

##### userManager

`unknown`

UserManager instance

##### options

`SchemaOptions`

Generation options

#### Returns

`any`[]

Array of DigitalDocumentPermission objects

***

### generateOrganizationSchema()

> `static` **generateOrganizationSchema**(`organizationData`, `options`): `object`

Defined in: [src/utils/SchemaGenerator.ts:395](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/utils/SchemaGenerator.ts#L395)

Generate Organization schema from Schema.org compliant organization data

#### Parameters

##### organizationData

`OrganizationData`

Schema.org Organization data

##### options

`SchemaOptions` = `{}`

Generation options

#### Returns

`object`

Organization schema object

##### url?

> `optional` **url**: `string`

***

### generatePageSchema()

> `static` **generatePageSchema**(`pageData`, `options`): `BaseSchema`

Defined in: [src/utils/SchemaGenerator.ts:137](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/utils/SchemaGenerator.ts#L137)

Generate Schema.org markup for a wiki page

#### Parameters

##### pageData

`PageData`

Page metadata and content

##### options

`SchemaOptions` = `{}`

Generation options (should include engine and user for permissions)

#### Returns

`BaseSchema`

JSON-LD schema object

***

### generatePermissionsByContext()

> `static` **generatePermissionsByContext**(`pageData`, `pageACL`, `userManager`, `aclManager`, `options`): `any`

Defined in: [src/utils/SchemaGenerator.ts:501](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/utils/SchemaGenerator.ts#L501)

Generate permissions based on page category and protection level

#### Parameters

##### pageData

`PageData`

Page metadata

##### pageACL

`ParsedACL`

Parsed ACL from page content

##### userManager

`unknown`

UserManager instance

##### aclManager

`unknown`

ACLManager instance

##### options

`SchemaOptions`

Generation options

#### Returns

`any`

Array of DigitalDocumentPermission objects

***

### generatePersonSchema()

> `static` **generatePersonSchema**(`personData`, `options`): `object`

Defined in: [src/utils/SchemaGenerator.ts:377](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/utils/SchemaGenerator.ts#L377)

Generate Person schema from Schema.org compliant person data

#### Parameters

##### personData

`PersonData`

Schema.org Person data

##### options

`SchemaOptions` = `{}`

Generation options

#### Returns

`object`

Person schema object

##### identifier?

> `optional` **identifier**: `string`

***

### generateScriptTag()

> `static` **generateScriptTag**(`schema`): `string`

Defined in: [src/utils/SchemaGenerator.ts:357](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/utils/SchemaGenerator.ts#L357)

Generate JSON-LD script tag for HTML injection

#### Parameters

##### schema

`BaseSchema`

Schema.org object

#### Returns

`string`

HTML script tag

***

### generateSiteSchema()

> `static` **generateSiteSchema**(`pages`, `options`): `BaseSchema`[]

Defined in: [src/utils/SchemaGenerator.ts:367](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/utils/SchemaGenerator.ts#L367)

Generate schema for multiple pages (site-wide)

#### Parameters

##### pages

`PageData`[]

Array of page data objects

##### options

`SchemaOptions` = `{}`

Generation options

#### Returns

`BaseSchema`[]

Array of schema objects

***

### generateSoftwareSchema()

> `static` **generateSoftwareSchema**(`configData`, `options`): `BaseSchema`

Defined in: [src/utils/SchemaGenerator.ts:413](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/utils/SchemaGenerator.ts#L413)

Generate SoftwareApplication schema from wiki configuration

#### Parameters

##### configData

`ConfigData`

Configuration from wiki.json

##### options

`SchemaOptions` = `{}`

Generation options

#### Returns

`BaseSchema`

SoftwareApplication schema object

***

### generateSystemPagePermissions()

> `static` **generateSystemPagePermissions**(`pageData`, `userManager`, `options`): `any`[]

Defined in: [src/utils/SchemaGenerator.ts:596](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/utils/SchemaGenerator.ts#L596)

Generate permissions for System category pages (app-managed)

#### Parameters

##### pageData

`PageData`

Page metadata

##### userManager

`unknown`

UserManager instance

##### options

`SchemaOptions`

Generation options

#### Returns

`any`[]

Array of DigitalDocumentPermission objects

***

### mapPrincipalToGrantee()

> `static` **mapPrincipalToGrantee**(`principal`, `userManager`): `any`

Defined in: [src/utils/SchemaGenerator.ts:748](https://github.com/jwilleke/amdWiki/blob/bcc115366e1180cb98de40309a75866518be330a/src/utils/SchemaGenerator.ts#L748)

Map ACL principal to Schema.org grantee object

#### Parameters

##### principal

`string`

ACL principal (user, role, or special)

##### userManager

`unknown`

UserManager instance

#### Returns

`any`

Schema.org Person or Audience object
