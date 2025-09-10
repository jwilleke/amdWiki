# SchemaGenerator API Documentation - DigitalDocumentPermission

## Overview

The SchemaGenerator's DigitalDocumentPermission functionality provides machine-readable access control information for amdWiki pages through Schema.org compliant markup. This enhances SEO and enables external systems to understand page permissions automatically.

## Core Methods

### `generateDigitalDocumentPermissions(pageData, user, options)`

Generates an array of DigitalDocumentPermission objects for a page based on its category, content ACLs, and user context.

**Parameters:**
- `pageData` (Object) - Page metadata and content
  - `title` (string) - Page title
  - `category` (string) - Page category ('General', 'System', 'Documentation', 'Developer')
  - `content` (string) - Page content (may contain ACL markup)
  - `uuid` (string) - Page UUID
  - `lastModified` (string) - ISO date string
- `user` (Object|null) - Current user context (null for anonymous)
- `options` (Object) - Generation options
  - `engine` (WikiEngine) - **Required** - WikiEngine instance for manager access
  - `baseUrl` (string) - Base URL for the wiki
  - `pageUrl` (string) - Full URL for the specific page

**Returns:** Array of DigitalDocumentPermission objects

**Example:**

```javascript
const pageData = {
  title: 'My Wiki Page',
  category: 'General',
  content: 'Page content here',
  uuid: 'abc-123-def',
  lastModified: '2025-09-10T12:00:00.000Z'
};

const options = {
  engine: wikiEngine,
  baseUrl: 'https://wiki.example.com',
  user: currentUser
};

const permissions = SchemaGenerator.generateDigitalDocumentPermissions(pageData, currentUser, options);
```

### `generatePermissionsByContext(pageData, pageACL, userManager, aclManager, options)`

Internal method that determines permission generation strategy based on page category and ACL presence.

**Parameters:**
- `pageData` (Object) - Page metadata
- `pageACL` (Object|null) - Parsed ACL object from page content
- `userManager` (UserManager) - UserManager instance
- `aclManager` (ACLManager) - ACLManager instance  
- `options` (Object) - Generation options

**Returns:** Array of DigitalDocumentPermission objects

### Category-Specific Permission Methods

#### `generateGeneralPagePermissions(pageData, userManager, options)`

Generates permissions for General category pages (user-created content).

**Default Permissions:**
- ReadPermission: public
- WritePermission: editor, admin
- CreatePermission: editor, admin
- DeletePermission: admin
- CommentPermission: authenticated users
- UploadPermission: editor, admin

#### `generateSystemPagePermissions(pageData, userManager, options)`

Generates permissions for System category pages (application-managed content).

**Default Permissions:**
- ReadPermission: public
- AdministerPermission: admin

#### `generateDocumentationPermissions(pageData, userManager, options)`

Generates permissions for Documentation category pages.

**Default Permissions:**
- ReadPermission: public
- WritePermission: editor, admin
- CommentPermission: authenticated users

#### `generateDeveloperPermissions(pageData, userManager, options)`

Generates permissions for Developer category pages.

**Default Permissions:**
- ReadPermission: public
- WritePermission: developer, admin
- CreatePermission: developer, admin

### ACL Integration Methods

#### `generateACLBasedPermissions(pageACL, userManager, options)`

Generates permissions based on parsed ACL markup from page content.

**ACL Action Mapping:**
- `view` → ReadPermission
- `edit` → WritePermission
- `delete` → DeletePermission
- `rename` → RenamePermission
- `upload` → UploadPermission

#### `mapPrincipalToGrantee(principal, userManager)`

Maps ACL principals to Schema.org grantee objects.

**Principal Mappings:**
- `all` → Audience with audienceType "public"
- `anonymous` → Audience with audienceType "anonymous"
- `authenticated` → Audience with audienceType "authenticated"
- `asserted` → Audience with audienceType "asserted"
- Role names → Audience with audienceType matching role
- Usernames → Person with name property

## Integration with Existing Methods

### Enhanced `generatePageSchema(pageData, options)`

The main schema generation method automatically includes DigitalDocumentPermission objects when the engine is provided in options.

**Updated Options:**
- `engine` (WikiEngine) - When provided, enables permission generation
- `user` (Object|null) - User context for permission calculation

**Example Schema Output:**

```json
{
  "@context": "https://schema.org",
  "@type": "WebPage",
  "name": "My Wiki Page",
  "hasDigitalDocumentPermission": [
    {
      "@type": "DigitalDocumentPermission",
      "permissionType": "ReadPermission",
      "grantee": {
        "@type": "Audience",
        "audienceType": "public"
      }
    },
    {
      "@type": "DigitalDocumentPermission",
      "permissionType": "WritePermission",
      "grantee": {
        "@type": "Audience",
        "audienceType": "editor"
      }
    }
  ]
}
```

## Configuration

Permission defaults and mappings are configurable via `config/DigitalDocumentPermissionConfig.js`.

**Key Configuration Sections:**
- `categoryDefaults` - Default permissions by page category
- `audienceTypeMappings` - Human-readable audience descriptions
- `aclToPermissionMap` - ACL action to permission type mapping
- `specialPrincipals` - Special ACL principal mappings
- `validation` - Schema.org validation rules

## Error Handling

The implementation includes graceful error handling:

- **Missing Engine**: Returns empty permissions array with warning
- **Missing Managers**: Returns empty permissions array with warning
- **Invalid ACL**: Skips invalid ACL entries, continues with valid ones
- **Unknown Principals**: Treats as username, creates Person grantee
- **Performance**: Average generation time <0.01ms per page

## Performance Considerations

- **Lightweight**: Minimal overhead (<0.01ms per page)
- **Caching Ready**: Results can be cached using page UUID + user context
- **Lazy Loading**: Only generates permissions when engine is available
- **Non-Blocking**: Does not affect page rendering if generation fails

## Testing

Comprehensive test suite covers:
- Unit tests for all permission generation methods
- Category-specific permission validation
- ACL-based permission generation
- Schema.org structure validation
- Performance benchmarking
- Integration testing with real managers

**Test Files:**
- `src/utils/__tests__/SchemaGenerator-DigitalDocumentPermission.test.js`

## Security Notes

- **Informational Only**: Generated permissions are metadata, not authoritative
- **No Sensitive Data**: Only exposes permission types and audience categories
- **ACL Compliance**: Generated permissions reflect actual ACL restrictions
- **User Context**: Permissions can vary based on current user (future enhancement)
