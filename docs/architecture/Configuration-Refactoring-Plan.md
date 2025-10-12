# Configuration & Architecture Refactoring Plan

**Status:** Draft for Team Review
**Created:** 2025-10-11
**Last Updated:** 2025-10-11 - Added lowercase naming convention requirement
**Related Issue:** [#102 - Configuration Reorganization](https://github.com/jwilleke/amdWiki/issues/102)
**Related Docs:** [Policies-Roles-Permissions.md](./Policies-Roles-Permissions.md)

**🚨 IMPORTANT: All configuration keys and provider names MUST be lowercase to prevent typos. See "Naming Conventions" section below.**

---

## Executive Summary

This plan addresses critical architectural issues in amdWiki's configuration and role management system:

1. **Configuration Duplication** - Same settings defined in multiple places (e.g., `attachments.maxSize` appears twice)
2. **Scattered Organization** - Related settings spread across file (attachment config: 33 lines in 4 sections)
3. **Inconsistent Naming** - `attachment` vs `attachments` vs `basicAttachmentProvider`
4. **Hardcoded Roles** - UserManager duplicates role definitions that exist in policies
5. **Missing ConfigurationManager Usage** - Managers don't consistently use ConfigurationManager

**Approach:** Clean break - reorganize configuration with clear migration path. No backward compatibility layer, just logging and clear error messages.

---

## Current Problems

### Problem 1: Configuration Chaos (Issue #102)

#### Example: Attachment Configuration Scattered Across 33 Lines

```json
// Line 20-22: Provider settings
"amdwiki.attachment.provider": "BasicAttachmentProvider",
"amdwiki.attachment.forceDownload": false,
"amdwiki.attachments.maxSize": 10485760,  // ← NOTE: "attachments" (plural)

// Line 66: Storage directory
"amdwiki.basicAttachmentProvider.storageDir": "./data/attachments",

// Lines 132-150: Markup handler settings
"amdwiki.markup.handlers.attachment.enabled": true,
"amdwiki.markup.handlers.attachment.priority": 75,
"amdwiki.markup.handlers.attachment.enhanced": true,
"amdwiki.markup.handlers.attachment.thumbnails": true,
"amdwiki.attachment.enhanced.thumbnailSizes": "150x150,300x300",
"amdwiki.attachment.enhanced.showMetadata": true,

// Lines 249-257: Feature flags (DUPLICATES!)
"amdwiki.features.attachments.enabled": true,
"amdwiki.features.attachments.maxSize": "10MB",  // ← DUPLICATE! Different format!
"amdwiki.features.attachments.allowedTypes": "image/*,text/*,application/pdf",
```

**Issues:**
- Same setting in 2+ places with different formats (bytes vs "10MB")
- Related settings scattered across 150 lines
- Inconsistent naming (singular/plural/provider-specific)
- Hard to find all attachment-related settings

### Problem 2: Role Definition Duplication

**Roles Defined in 2 Places:**

1. **UserManager.js (Hardcoded):**
   ```javascript
   initializeDefaultRoles() {
     const defaultRoles = {
       'editor': {
         name: 'editor',
         displayName: 'Editor',
         description: 'Can create and edit all pages',
         permissions: [
           'page:read', 'page:edit', 'page:create', 'page:delete', 'page:rename',
           'attachment:upload', 'attachment:delete', 'export:pages', 'search:all'
         ],
         isSystem: true
       }
     };
   }
   ```

2. **config/app-default-config.json (Policies):**
   ```json
   {
     "id": "editor-permissions",
     "subjects": [{"type": "role", "value": "editor"}],
     "actions": [
       "page:read", "page:edit", "page:create", "page:delete", "page:rename",
       "attachment:upload", "attachment:delete", "export:pages", "search:all"
     ]
   }
   ```

**Problem:** Must manually keep these in sync!

### Problem 3: UserManager Doesn't Use ConfigurationManager

**Current Code:**
```javascript
async initialize(config = {}) {
  await super.initialize(config);

  this.usersDirectory = config.usersDirectory || './users';  // ← From parameter!

  // Hardcoded file paths
  const usersFile = path.join(this.usersDirectory, 'users.json');
  const rolesFile = path.join(this.usersDirectory, 'roles.json');

  // Hardcoded defaults
  this.passwordSalt = 'amdwiki-salt';
  this.defaultPassword = 'admin123';
}
```

**Should Be:**
```javascript
async initialize(config) {
  const configManager = this.engine.getManager('ConfigurationManager');

  this.usersDirectory = configManager.getProperty('amdwiki.user.provider.storageDir', './users');
  this.usersFile = configManager.getProperty('amdwiki.user.provider.files.users', 'users.json');
  this.rolesFile = configManager.getProperty('amdwiki.user.provider.files.roles', 'roles.json');
  this.passwordSalt = configManager.getProperty('amdwiki.user.security.passwordSalt', 'amdwiki-salt');
}
```

## Proposed Solution

### Architecture Principle: Hierarchical Flat Keys

Use consistent namespace pattern while maintaining flat dot-notation:

```text
amdwiki.{component}.{namespace}.{property}

Where:
  {component}  = attachment | page | user | search | backup | etc.
  {namespace}  = provider | storage | security | ui | markup | feature
  {property}   = specific setting name
```

**Examples:**
- `amdwiki.attachment.provider` → Provider selection
- `amdwiki.attachment.provider.storagedir` → Provider config
- `amdwiki.attachment.security.maxsize` → Security limit
- `amdwiki.attachment.ui.forcedownload` → UI behavior

### Naming Conventions

**IMPORTANT: All configuration keys and values MUST be lowercase to prevent human typo errors.**

1. **All Keys Lowercase** - Prevents typos like "BasicAttachmentProvider" vs "basicAttachmentProvider"
   - ✅ `amdwiki.attachment.provider`
   - ❌ `amdwiki.Attachment.Provider`
   - ❌ `amdwiki.attachment.Provider`

2. **Provider Names Lowercase** - Consistent, predictable
   - ✅ `"basicattachmentprovider"`
   - ❌ `"BasicAttachmentProvider"`
   - ❌ `"basicAttachmentProvider"`

3. **File Names Lowercase** - Match provider names
   - ✅ `src/providers/basicattachmentprovider.js`
   - ❌ `src/providers/BasicAttachmentProvider.js`

4. **Class Names PascalCase** - JavaScript convention (code, not config)
   - ✅ `class BasicAttachmentProvider`
   - ❌ `class basicattachmentprovider`

**Summary:** Config = lowercase, Code = PascalCase

### Provider Configuration Pattern

Every provider follows this standard two-tier pattern for reliability:

```json
{
  "amdwiki.{component}.provider.default": "defaultprovider",  // System fallback, never changes
  "amdwiki.{component}.provider": "activeprovider"            // Current provider, user-configurable
}
```

**Why Two Keys?**

1. **`.provider.default`** - System fallback, built-in, reliable
   - Used if `.provider` is missing, invalid, or fails to load
   - Guarantees system can start even with bad configuration
   - Always a tested, built-in provider

2. **`.provider`** - Active provider, customizable
   - Can be changed via configuration
   - Can be different per environment (dev/test/prod)
   - Falls back gracefully to default if it fails

**Example:**
```json
{
  "amdwiki.user.provider.default": "jsonuserprovider",     // Fallback
  "amdwiki.user.provider": "postgresql"                     // Current: jsonuserprovider|postgresql|ldap|redis
}
```

If PostgreSQL fails to initialize, system automatically falls back to `jsonuserprovider`.

### Provider Loading Logic

```javascript
async loadProvider(componentName) {
  const configManager = this.engine.getManager('ConfigurationManager');

  // Get default (never changes)
  const defaultProvider = configManager.getProperty(
    `amdwiki.${componentName}.provider.default`,
    'filesystemprovider'  // ultimate fallback
  );

  // Get configured provider (can be customized)
  const configuredProvider = configManager.getProperty(
    `amdwiki.${componentName}.provider`,
    defaultProvider  // falls back to default
  );

  try {
    // Try to load configured provider
    return await this.#instantiateProvider(configuredProvider);
  } catch (error) {
    logger.warn(`Failed to load ${configuredProvider}, falling back to ${defaultProvider}`);

    try {
      // Fall back to default provider
      return await this.#instantiateProvider(defaultProvider);
    } catch (fallbackError) {
      throw new Error(`Cannot load ${componentName} provider: both ${configuredProvider} and ${defaultProvider} failed`);
    }
  }
}
```

### Possible suported Providers

| Component | Default | Alternatives | Notes |
|-----------|---------|--------------|-------|
| **attachment** | `basicattachmentprovider` | `s3`, `azure`, `gcs`, `minio` | File storage |
| **page** | `filesystemprovider` | `database`, `git`, `s3`, `mongodb` | Page content |
| **user** | `jsonuserprovider` | `ldap`, `postgresql`, `redis`, `saml`, `oauth` | User accounts |
| **search** | `lucenesearchprovider` | `elasticsearch`, `solr`, `meilisearch` | Search indexing |
| **backup** | `filesystembackupprovider` | `s3`, `azure`, `tape` | Backup storage |

---

## Phase 1: Configuration Reorganization

### 1.1 Attachment Configuration (BEFORE → AFTER)

**BEFORE (Scattered, 33 lines, 4 sections):**
```json
"amdwiki.attachment.provider": "BasicAttachmentProvider",
"amdwiki.attachments.maxSize": 10485760,
"amdwiki.attachment.forceDownload": false,
"amdwiki.basicAttachmentProvider.storageDir": "./data/attachments",
"amdwiki.markup.handlers.attachment.enabled": true,
"amdwiki.markup.handlers.attachment.priority": 75,
"amdwiki.markup.handlers.attachment.enhanced": true,
"amdwiki.markup.handlers.attachment.thumbnails": true,
"amdwiki.attachment.enhanced.thumbnailSizes": "150x150,300x300",
"amdwiki.features.attachments.enabled": true,
"amdwiki.features.attachments.maxSize": "10MB",  // DUPLICATE!
```

**AFTER (Organized, 1 section):**
```json
{
  "_comment_attachment": "Attachment system configuration",
  "amdwiki.attachment.enabled": true,
  "amdwiki.attachment.provider.default": "basicattachmentprovider",
  "amdwiki.attachment.provider": "basicattachmentprovider",

  "amdwiki.attachment.provider.storagedir": "./data/attachments",
  "amdwiki.attachment.provider.metadatafile": "./data/attachments/basicattachmentprovider.json",

  "amdwiki.attachment.security.maxsize": "10mb",
  "amdwiki.attachment.security.allowedtypes": "image/*,text/*,application/pdf",

  "amdwiki.attachment.ui.forcedownload": false,
  "amdwiki.attachment.ui.enhanced.enabled": true,
  "amdwiki.attachment.ui.enhanced.thumbnails": true,
  "amdwiki.attachment.ui.enhanced.thumbnailsizes": "150x150,300x300",
  "amdwiki.attachment.ui.enhanced.showmetadata": true,
  "amdwiki.attachment.ui.enhanced.showfilesize": true,
  "amdwiki.attachment.ui.enhanced.iconpath": "/icons/filetypes",
  "amdwiki.attachment.ui.cachemetadata": true,

  "amdwiki.attachment.markup.priority": 75
}
```

**Note:** All keys and provider names now lowercase. Options for `amdwiki.attachment.provider`:
- `basicattachmentprovider` (default, local filesystem)
- `s3attachmentprovider` (Amazon S3)
- `azureattachmentprovider` (Azure Blob Storage)
- `gcsattachmentprovider` (Google Cloud Storage)

### 1.2 User Storage Configuration

**AFTER:**
```json
{
  "_comment_user": "User storage configuration",
  "amdwiki.user.provider.default": "jsonuserprovider",
  "amdwiki.user.provider": "jsonuserprovider",

  "amdwiki.user.provider.storagedir": "./users",
  "amdwiki.user.provider.file": "users.json",
  "amdwiki.user.provider.files.sessions": "sessions.json",

  "amdwiki.user.security.passwordsalt": "amdwiki-salt",
  "amdwiki.user.security.defaultpassword": "admin123",
  "amdwiki.user.security.sessionexpiration": 86400000,

  "amdwiki.user.defaults.timezone": "utc",
  "amdwiki.user.defaults.locale": "en-us"
}
```

**Note:** Options for `amdwiki.user.provider`:
- `jsonuserprovider` (default, JSON files)
- `ldapuserprovider` (LDAP/Active Directory)
- `postgresqluserprovider` (PostgreSQL database)
- `redisuserprovider` (Redis cache)
- `samluserprovider` (SAML SSO)
- `oauthuserprovider` (OAuth2)

### 1.3 Page Storage Configuration

**AFTER:**
```json
{
  "_comment_page": "Page storage configuration",
  "amdwiki.page.provider.default": "filesystemprovider",
  "amdwiki.page.provider": "filesystemprovider",

  "amdwiki.page.provider.storagedir": "./pages",
  "amdwiki.page.provider.requiredpagesdir": "./required-pages",
  "amdwiki.page.provider.encoding": "utf-8"
}
```

**Note:** Options for `amdwiki.page.provider`:
- `filesystemprovider` (default, local filesystem)
- `databasepageprovider` (relational database)
- `gitpageprovider` (Git repository)
- `s3pageprovider` (Amazon S3)
- `mongodbpageprovider` (MongoDB)

### 1.4 Search Configuration

**AFTER:**
```json
{
  "_comment_search": "Search system configuration",
  "amdwiki.search.enabled": true,
  "amdwiki.search.provider.default": "lucenesearchprovider",
  "amdwiki.search.provider": "lucenesearchprovider",

  "amdwiki.search.provider.indexdir": "./lucene",

  "amdwiki.search.ui.maxresults": 50,
  "amdwiki.search.ui.showscore": true,
  "amdwiki.search.ui.allowadvanced": true,

  "amdwiki.search.cache.enabled": true,
  "amdwiki.search.cache.ttl": 300
}
```

**Note:** Options for `amdwiki.search.provider`:
- `lucenesearchprovider` (default, Lucene full-text search)
- `elasticsearchprovider` (Elasticsearch cluster)
- `solrsearchprovider` (Apache Solr)
- `meilisearchprovider` (MeiliSearch)

### 1.5 Backup Configuration

**AFTER:**
```json
{
  "_comment_backup": "Backup and restore configuration",
  "amdwiki.backup.directory": "./backups",
  "amdwiki.backup.maxBackups": 10,
  "amdwiki.backup.strategy": "auto",
  "amdwiki.backup.inlineThreshold": 100,
  "amdwiki.backup.compressFolder": true,
  "amdwiki.backup.parallelProviders": false,

  "amdwiki.backup.auto.enabled": false,
  "amdwiki.backup.auto.interval": 86400000
}
```

### 1.6 Role Definitions (NEW)

**Add role metadata to config:**
```json
{
  "_comment_roles": "Role definitions - metadata only, permissions via policies",
  "amdwiki.roles.definitions": {
    "admin": {
      "name": "admin",
      "displayName": "Administrator",
      "description": "Full system access to all features",
      "isSystem": true,
      "icon": "shield-alt",
      "color": "#dc3545"
    },
    "editor": {
      "name": "editor",
      "displayName": "Editor",
      "description": "Can create, edit, delete, and rename pages",
      "isSystem": true,
      "icon": "edit",
      "color": "#007bff"
    },
    "contributor": {
      "name": "contributor",
      "displayName": "Contributor",
      "description": "Can create and edit pages",
      "isSystem": true,
      "icon": "user-edit",
      "color": "#28a745"
    },
    "reader": {
      "name": "reader",
      "displayName": "Reader",
      "description": "Read-only access to content",
      "isSystem": true,
      "icon": "book-reader",
      "color": "#6c757d"
    },
    "anonymous": {
      "name": "anonymous",
      "displayName": "Anonymous",
      "description": "Public access without authentication",
      "isSystem": true,
      "icon": "user-secret",
      "color": "#adb5bd"
    }
  }
}
```

**Custom roles can be added in `app-custom-config.json`:**
```json
{
  "amdwiki.roles.definitions": {
    "moderator": {
      "name": "moderator",
      "displayName": "Content Moderator",
      "description": "Reviews and approves community content",
      "isSystem": false,
      "icon": "gavel",
      "color": "#ffc107"
    }
  }
}
```

### 1.7 Policies Stay As-Is

**Policies remain in their current structure:**
```json
{
  "_comment_access_policies": "Role permissions defined via policies",
  "amdwiki.access.policies.enabled": true,
  "amdwiki.access.policies.defaultPolicy": "deny",
  "amdwiki.access.policies": [
    {
      "id": "admin-full-access",
      "name": "Administrator Full Access",
      "priority": 100,
      "effect": "allow",
      "subjects": [{"type": "role", "value": "admin"}],
      "resources": [{"type": "page", "pattern": "*"}],
      "actions": [
        "page:read", "page:edit", "page:create", "page:delete", "page:rename",
        "attachment:upload", "attachment:delete",
        "export:pages", "search:all", "search:restricted",
        "admin:users", "admin:roles", "admin:config", "admin:system"
      ]
    }
    // ... other policies
  ]
}
```

**Custom policies in `app-custom-config.json`:**
```json
{
  "amdwiki.access.policies": [
    {
      "id": "moderator-permissions",
      "name": "Moderator Permissions",
      "priority": 75,
      "effect": "allow",
      "subjects": [{"type": "role", "value": "moderator"}],
      "resources": [{"type": "page", "pattern": "*"}],
      "actions": ["page:read", "page:edit", "page:delete"]
    }
  ]
}
```

---

## Phase 2: Manager Refactoring

### 2.1 UserManager Changes

**REMOVE these methods:**
- `initializeDefaultRoles()` - Now in config
- `initializeDefaultPermissions()` - Now in policies
- `loadRoles()` - Use ConfigurationManager
- `saveRoles()` - Edit config files instead

**UPDATE initialize():**
```javascript
async initialize(config = {}) {
  await super.initialize(config);

  const configManager = this.engine.getManager('ConfigurationManager');
  if (!configManager) {
    throw new Error('UserManager requires ConfigurationManager');
  }

  // Load all settings from config (all keys lowercase)
  this.usersDirectory = configManager.getProperty(
    'amdwiki.user.provider.storagedir',
    './users'
  );
  this.usersFile = configManager.getProperty(
    'amdwiki.user.provider.files.users',
    'users.json'
  );
  this.sessionsFile = configManager.getProperty(
    'amdwiki.user.provider.files.sessions',
    'sessions.json'
  );
  this.passwordSalt = configManager.getProperty(
    'amdwiki.user.security.passwordsalt',
    'amdwiki-salt'
  );
  this.defaultPassword = configManager.getProperty(
    'amdwiki.user.security.defaultpassword',
    'admin123'
  );
  this.sessionExpiration = configManager.getProperty(
    'amdwiki.user.security.sessionexpiration',
    86400000
  );
  this.defaultTimezone = configManager.getProperty(
    'amdwiki.user.defaults.timezone',
    'utc'
  );

  // Load role definitions from config
  const roleDefinitions = configManager.getProperty(
    'amdwiki.roles.definitions',
    {}
  );
  this.roles = new Map(Object.entries(roleDefinitions));

  logger.info(`👤 Loaded ${this.roles.size} role definitions from configuration`);

  // Create users directory
  await fs.mkdir(this.usersDirectory, { recursive: true });

  // Load users and sessions
  await this.loadUsers();
  await this.loadSessions();

  // Create default admin if needed
  if (this.users.size === 0) {
    await this.createDefaultAdmin();
  }

  logger.info(`👤 UserManager initialized with ${this.users.size} users`);
}
```

**UPDATE getUserPermissions():**
```javascript
/**
 * Get user's effective permissions from PolicyManager
 * @param {string} username - Username
 * @returns {Array<string>} Array of permission strings
 */
getUserPermissions(username) {
  const user = this.users.get(username);
  if (!user || !user.isActive) {
    return [];
  }

  // Query PolicyManager for actual permissions
  const policyManager = this.engine.getManager('PolicyManager');
  if (!policyManager) {
    logger.warn('PolicyManager not available, returning empty permissions');
    return [];
  }

  const policies = policyManager.getAllPolicies();
  const permissions = new Set();

  // Get all user's roles (including Authenticated, All)
  const userRoles = [...(user.roles || []), 'Authenticated', 'All'];

  // Collect permissions from all matching allow policies
  for (const policy of policies) {
    if (policy.effect === 'allow') {
      const hasMatchingRole = policy.subjects.some(subject =>
        subject.type === 'role' && userRoles.includes(subject.value)
      );

      if (hasMatchingRole) {
        policy.actions.forEach(action => permissions.add(action));
      }
    }
  }

  return Array.from(permissions);
}
```

**KEEP these methods (metadata access):**
```javascript
getRole(roleName) {
  return this.roles.get(roleName) || null;
}

getRoles() {
  return Array.from(this.roles.values());
}
```

### 2.2 AttachmentManager Changes

**UPDATE initialize():**
```javascript
async initialize(config = {}) {
  await super.initialize(config);

  const configManager = this.engine.getManager('ConfigurationManager');
  if (!configManager) {
    throw new Error('AttachmentManager requires ConfigurationManager');
  }

  // Check if enabled
  const enabled = configManager.getProperty('amdwiki.attachment.enabled', true);
  if (!enabled) {
    logger.info('📎 AttachmentManager: Disabled by configuration');
    return;
  }

  // Get provider with fallback (lowercase names)
  const defaultProvider = configManager.getProperty(
    'amdwiki.attachment.provider.default',
    'basicattachmentprovider'
  );
  const providerName = configManager.getProperty(
    'amdwiki.attachment.provider',
    defaultProvider
  );

  // Map lowercase name to PascalCase class name
  const providerClassName = this.#toPascalCase(providerName);

  try {
    // Initialize provider
    const ProviderClass = require(`../providers/${providerClassName}`);
    this.attachmentProvider = new ProviderClass(this.engine);
    await this.attachmentProvider.initialize();

    logger.info(`📎 AttachmentManager initialized with ${providerName}`);
  } catch (error) {
    logger.error(`Failed to load ${providerName}, trying default ${defaultProvider}`);

    if (providerName !== defaultProvider) {
      const DefaultClass = require(`../providers/${this.#toPascalCase(defaultProvider)}`);
      this.attachmentProvider = new DefaultClass(this.engine);
      await this.attachmentProvider.initialize();
      logger.info(`📎 AttachmentManager fell back to ${defaultProvider}`);
    } else {
      throw error;
    }
  }
}

// Helper to convert lowercase config names to PascalCase class names
#toPascalCase(str) {
  return str.replace(/(^\w|provider$)/g, m => m.charAt(0).toUpperCase() + m.slice(1));
  // Examples: 'basicattachmentprovider' → 'BasicAttachmentProvider'
  //           's3attachmentprovider' → 'S3AttachmentProvider'
}
}
```

### 2.3 BasicAttachmentProvider Changes

**UPDATE initialize():**
```javascript
async initialize() {
  const configManager = this.engine.getManager('ConfigurationManager');
  if (!configManager) {
    throw new Error('BasicAttachmentProvider requires ConfigurationManager');
  }

  // Get storage configuration (lowercase keys)
  this.storageDirectory = configManager.getProperty(
    'amdwiki.attachment.provider.storagedir',
    './data/attachments'
  );
  this.metadataFile = configManager.getProperty(
    'amdwiki.attachment.provider.metadatafile',
    './data/attachments/basicattachmentprovider.json'
  );

  // Get security limits (lowercase keys)
  const maxSizeStr = configManager.getProperty(
    'amdwiki.attachment.security.maxsize',
    '10mb'
  );
  this.maxFileSize = this.#parseSize(maxSizeStr);

  const allowedTypesStr = configManager.getProperty(
    'amdwiki.attachment.security.allowedtypes',
    ''
  );
  this.allowedMimeTypes = allowedTypesStr
    ? allowedTypesStr.split(',').map(t => t.trim())
    : [];

  // Ensure directories exist
  await fs.ensureDir(this.storageDirectory);
  await fs.ensureDir(path.dirname(this.metadataFile));

  logger.info(`[BasicAttachmentProvider] Storage: ${this.storageDirectory}`);
  logger.info(`[BasicAttachmentProvider] Max size: ${this.#formatSize(this.maxFileSize)}`);

  // Load metadata
  await this.#loadMetadata();

  this.initialized = true;
}
```

### 2.4 PageManager Changes

**UPDATE initialize():**
```javascript
async initialize() {
  const configManager = this.engine.getManager('ConfigurationManager');
  if (!configManager) {
    throw new Error('PageManager requires ConfigurationManager');
  }

  // Get provider with fallback (lowercase)
  const defaultProvider = configManager.getProperty(
    'amdwiki.page.provider.default',
    'filesystemprovider'
  );
  const providerName = configManager.getProperty(
    'amdwiki.page.provider',
    defaultProvider
  );

  // Load provider (convert lowercase to PascalCase)
  this.provider = this.#loadProvider(providerName);
  await this.provider.initialize();

  const info = this.provider.getProviderInfo();
  logger.info(`📄 PageManager initialized with ${info.name} v${info.version}`);
}

/**
 * Helper to convert lowercase provider name to PascalCase class name
 * @private
 */
#toPascalCase(str) {
  return str.replace(/(^\w|provider$)/g, m => m.charAt(0).toUpperCase() + m.slice(1));
  // Examples:
  // 'filesystemprovider' → 'FileSystemProvider'
  // 'basicpageprovider' → 'BasicPageProvider'
}
```

### 2.5 BackupManager Changes

**UPDATE initialize():**
```javascript
async initialize(config = {}) {
  await super.initialize(config);

  const configManager = this.engine.getManager('ConfigurationManager');
  if (!configManager) {
    throw new Error('BackupManager requires ConfigurationManager');
  }

  // All keys lowercase
  this.backupDirectory = configManager.getProperty(
    'amdwiki.backup.directory',
    './backups'
  );
  this.maxBackups = configManager.getProperty(
    'amdwiki.backup.maxbackups',
    10
  );
  this.strategy = configManager.getProperty(
    'amdwiki.backup.strategy',
    'auto'
  );
  this.inlineThreshold = configManager.getProperty(
    'amdwiki.backup.inlinethreshold',
    100
  );
  this.compressFolder = configManager.getProperty(
    'amdwiki.backup.compressfolder',
    true
  );
  this.autoEnabled = configManager.getProperty(
    'amdwiki.backup.auto.enabled',
    false
  );
  this.autoInterval = configManager.getProperty(
    'amdwiki.backup.auto.interval',
    86400000
  );

  // Ensure backup directory exists
  await fs.ensureDir(this.backupDirectory);

  logger.info(`✅ BackupManager initialized`);
  logger.info(`📁 Backup directory: ${this.backupDirectory}`);
  logger.info(`📊 Max backups: ${this.maxBackups}`);
  logger.info(`🔧 Strategy: ${this.strategy}`);
}
```

---

## Phase 3: Configuration File Updates

### 3.1 Create New app-default-config.json Structure

**File Organization (order matters):**

1. **Application Settings** (lines 1-60)
   - Application info, version, encoding
   - Server settings
   - Session configuration
   - Front page, URLs

2. **Storage Providers** (lines 61-150)
   - Page provider configuration
   - User provider configuration
   - Attachment provider configuration
   - Search provider configuration

3. **Role Definitions** (lines 151-250)
   - Role metadata (NEW)
   - Built-in roles

4. **Access Control Policies** (lines 251-500)
   - Policy definitions
   - Existing structure maintained

5. **Feature Configuration** (lines 501-700)
   - Markup system
   - Cache configuration
   - Export features
   - LLM features

6. **System Configuration** (lines 701-900)
   - Backup settings
   - Logging configuration
   - Notification settings
   - Audit settings

7. **UI Configuration** (lines 901-1000)
   - Display settings
   - Timezones
   - Keywords
   - Categories

### 3.2 Migration Documentation

**Create `docs/migration/config-v1-to-v2.md`:**

```markdown
# Configuration Migration Guide: v1 → v2

## Breaking Changes

This is a breaking change release. Old configuration keys will NOT work.

## Migration Steps

### Step 1: Backup Current Configuration
```bash
cp config/app-custom-config.json config/app-custom-config.json.backup
```

### Step 2: Use Migration Tool
```bash
node scripts/migrate-config.js
```

### Step 3: Review Changes
The tool will create `app-custom-config.json.new` with migrated keys.
Review changes and test before replacing.

### Step 4: Update Custom Config
```bash
mv config/app-custom-config.json.new config/app-custom-config.json
```

## Key Mappings (ALL LOWERCASE)

### Attachment Configuration

| Old Key | New Key |
|---------|---------|
| `amdwiki.attachments.maxSize` | `amdwiki.attachment.security.maxsize` |
| `amdwiki.basicAttachmentProvider.storageDir` | `amdwiki.attachment.provider.storagedir` |
| `amdwiki.features.attachments.enabled` | `amdwiki.attachment.enabled` |
| `amdwiki.features.attachments.allowedTypes` | `amdwiki.attachment.security.allowedtypes` |

### User Configuration

| Old Key | New Key |
|---------|---------|
| `amdwiki.directories.users` | `amdwiki.user.provider.storagedir` |
| `amdwiki.session.store` | `amdwiki.user.provider.files.sessions` |
| `amdwiki.jsonuserdatabase` | `amdwiki.user.provider.files.users` |

### Page Configuration

| Old Key | New Key |
|---------|---------|
| `amdwiki.pageProvider` | `amdwiki.page.provider` |
| `amdwiki.directories.pages` | `amdwiki.page.provider.storagedir` |

### Search Configuration

| Old Key | New Key |
|---------|---------|
| `amdwiki.searchProvider` | `amdwiki.search.provider` |
| `amdwiki.luceneSearchProvider.luceneDirectory` | `amdwiki.search.provider.indexdir` |

[... complete mapping table ...]

### 3.3 Create Migration Script

**Create `scripts/migrate-config.js`:**

```javascript
#!/usr/bin/env node
const fs = require('fs-extra');
const path = require('path');

const KEY_MAPPINGS = {
  // Attachment (ALL LOWERCASE)
  'amdwiki.attachments.maxSize': 'amdwiki.attachment.security.maxsize',
  'amdwiki.attachment.forceDownload': 'amdwiki.attachment.ui.forcedownload',
  'amdwiki.basicAttachmentProvider.storageDir': 'amdwiki.attachment.provider.storagedir',
  'amdwiki.basicAttachmentProvider.metadataFile': 'amdwiki.attachment.provider.metadatafile',
  'amdwiki.features.attachments.enabled': 'amdwiki.attachment.enabled',
  'amdwiki.features.attachments.allowedTypes': 'amdwiki.attachment.security.allowedtypes',
  'amdwiki.features.attachments.maxSize': null,  // DUPLICATE - REMOVED

  // User (ALL LOWERCASE)
  'amdwiki.directories.users': 'amdwiki.user.provider.storagedir',
  'amdwiki.session.store': 'amdwiki.user.provider.files.sessions',
  'amdwiki.jsonuserdatabase': 'amdwiki.user.provider.files.users',
  'amdwiki.user.passwordSalt': 'amdwiki.user.security.passwordsalt',
  'amdwiki.user.defaultPassword': 'amdwiki.user.security.defaultpassword',
  'amdwiki.session.expiration': 'amdwiki.user.security.sessionexpiration',
  'amdwiki.user.defaults.timezone': 'amdwiki.user.defaults.timezone',

  // Page (ALL LOWERCASE)
  'amdwiki.pageProvider': 'amdwiki.page.provider',
  'amdwiki.directories.pages': 'amdwiki.page.provider.storagedir',

  // Search (ALL LOWERCASE)
  'amdwiki.searchProvider': 'amdwiki.search.provider',
  'amdwiki.luceneSearchProvider.luceneDirectory': 'amdwiki.search.provider.indexdir',

  // Backup (ALL LOWERCASE)
  'amdwiki.backup.maxBackups': 'amdwiki.backup.maxbackups',
  'amdwiki.backup.inlineThreshold': 'amdwiki.backup.inlinethreshold',
  'amdwiki.backup.compressFolder': 'amdwiki.backup.compressfolder',

  // ... complete mappings
};

const DELETED_KEYS = [
  'amdwiki.features.attachments.maxSize',  // Duplicate
  'amdwiki.markup.handlers.attachment.enabled',  // Use amdwiki.attachment.enabled
  // ... complete list
];

async function migrateConfig(inputFile, outputFile) {
  console.log(`\n🔄 Migrating: ${inputFile}`);

  const oldConfig = await fs.readJson(inputFile);
  const newConfig = {};
  const warnings = [];

  for (const [oldKey, value] of Object.entries(oldConfig)) {
    // Skip comment keys
    if (oldKey.startsWith('_')) {
      newConfig[oldKey] = value;
      continue;
    }

    // Check if deleted
    if (DELETED_KEYS.includes(oldKey)) {
      warnings.push(`⚠️  Skipping deleted key: ${oldKey}`);
      continue;
    }

    // Map to new key
    let newKey = KEY_MAPPINGS[oldKey] || oldKey;

    // Skip if mapped to null (deleted duplicate)
    if (newKey === null) {
      warnings.push(`⚠️  Skipping duplicate key: ${oldKey}`);
      continue;
    }

    // Convert to lowercase (prevent typos)
    newKey = newKey.toLowerCase();

    // Convert provider class names to lowercase
    if (typeof value === 'string' && value.includes('Provider')) {
      value = value.toLowerCase();
    }

    newConfig[newKey] = value;

    if (newKey !== oldKey.toLowerCase()) {
      console.log(`  ✓ ${oldKey} → ${newKey}`);
    }
  }

  // Write new config
  await fs.writeJson(outputFile, newConfig, { spaces: 2 });

  console.log(`\n✅ Migration complete: ${outputFile}`);

  if (warnings.length > 0) {
    console.log('\n⚠️  Warnings:');
    warnings.forEach(w => console.log(`  ${w}`));
  }
}

async function main() {
  const customConfig = path.join(__dirname, '../config/app-custom-config.json');
  const outputConfig = path.join(__dirname, '../config/app-custom-config.json.new');

  if (!await fs.pathExists(customConfig)) {
    console.log('No app-custom-config.json found - nothing to migrate');
    return;
  }

  await migrateConfig(customConfig, outputConfig);

  console.log('\n📝 Next steps:');
  console.log('  1. Review: config/app-custom-config.json.new');
  console.log('  2. Test with new config');
  console.log('  3. Replace: mv config/app-custom-config.json.new config/app-custom-config.json');
}

main().catch(console.error);
```

---

## Phase 4: Error Handling (No Backward Compatibility)

### 4.1 ConfigurationManager Validation

**Add validation to ConfigurationManager:**

```javascript
async loadConfigurations() {
  // Load configs as before
  this.mergedConfig = {
    ...this.defaultConfig,
    ...this.environmentConfig,
    ...this.customConfig
  };

  // Validate - check for deprecated keys
  this.validateConfiguration();
}

validateConfiguration() {
  const DEPRECATED_KEYS = [
    'amdwiki.attachments.maxSize',
    'amdwiki.basicAttachmentProvider.storageDir',
    'amdwiki.features.attachments.maxSize',
    'amdwiki.directories.users',
    'amdwiki.session.store',
    'amdwiki.jsonuserdatabase',
    'amdwiki.pageProvider',
    'amdwiki.searchProvider',
    // ... all old keys
  ];

  const foundDeprecated = [];
  const foundUppercase = [];

  // Check for deprecated keys
  for (const oldKey of DEPRECATED_KEYS) {
    if (this.mergedConfig[oldKey] !== undefined) {
      foundDeprecated.push(oldKey);
    }
  }

  // Check for uppercase in keys (typos)
  for (const key of Object.keys(this.mergedConfig)) {
    if (key.startsWith('amdwiki.') && key !== key.toLowerCase()) {
      foundUppercase.push(key);
    }
  }

  if (foundDeprecated.length > 0 || foundUppercase.length > 0) {
    let error = `
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
❌ CONFIGURATION ERROR
`;

    if (foundDeprecated.length > 0) {
      error += `
⚠️  Deprecated Keys Found:
${foundDeprecated.map(k => `  • ${k}`).join('\n')}
`;
    }

    if (foundUppercase.length > 0) {
      error += `
⚠️  Uppercase Characters Found (ALL KEYS MUST BE LOWERCASE):
${foundUppercase.map(k => `  • ${k} → ${k.toLowerCase()}`).join('\n')}
`;
    }

    error += `
These keys are no longer supported in this version.

📖 Migration Guide:
   docs/migration/config-v1-to-v2.md

🔧 Migration Tool:
   node scripts/migrate-config.js

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    `.trim();

    console.error(error);
    throw new Error('Configuration contains deprecated or invalid keys - migration required');
  }
}
```

### 4.2 Manager Error Messages

**If managers don't get expected config:**

```javascript
async initialize(config) {
  const configManager = this.engine.getManager('ConfigurationManager');

  const storageDir = configManager.getProperty('amdwiki.user.provider.storagedir');

  if (!storageDir) {
    const error = `
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
❌ UserManager Configuration Missing

Required configuration key not found:
  amdwiki.user.provider.storagedir (lowercase)

This key was previously: amdwiki.directories.users

📖 See: docs/migration/config-v1-to-v2.md
🔧 Run: node scripts/migrate-config.js

⚠️  IMPORTANT: All configuration keys MUST be lowercase
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    `.trim();

    throw new Error(error);
  }
}
```

---

## Phase 5: Testing Strategy

### 5.1 Unit Tests

**Test ConfigurationManager:**
```javascript
describe('ConfigurationManager', () => {
  it('should reject deprecated keys', async () => {
    const config = {
      'amdwiki.attachments.maxSize': 10485760  // Old key
    };

    await expect(
      configManager.loadConfigurations(config)
    ).rejects.toThrow('Configuration contains deprecated or invalid keys');
  });

  it('should reject uppercase keys', async () => {
    const config = {
      'amdwiki.attachment.security.maxSize': '10MB'  // Wrong: uppercase S
    };

    await expect(
      configManager.loadConfigurations(config)
    ).rejects.toThrow('Configuration contains deprecated or invalid keys');
  });

  it('should load lowercase keys correctly', async () => {
    const config = {
      'amdwiki.attachment.security.maxsize': '10mb'  // Correct: all lowercase
    };

    await configManager.loadConfigurations(config);
    expect(
      configManager.getProperty('amdwiki.attachment.security.maxsize')
    ).toBe('10mb');
  });

  it('should load provider with fallback', () => {
    const defaultProvider = configManager.getProperty(
      'amdwiki.attachment.provider.default',
      'basicattachmentprovider'
    );
    const provider = configManager.getProperty(
      'amdwiki.attachment.provider',
      defaultProvider
    );

    expect(provider).toBe('basicattachmentprovider');
  });
});
```

**Test UserManager:**
```javascript
describe('UserManager', () => {
  it('should load roles from config', async () => {
    const roles = userManager.getRoles();
    expect(roles).toHaveLength(5);
    expect(roles.find(r => r.name === 'admin')).toBeDefined();
  });

  it('should get permissions from PolicyManager', () => {
    const permissions = userManager.getUserPermissions('admin');
    expect(permissions).toContain('page:read');
    expect(permissions).toContain('admin:users');
  });
});
```

### 5.2 Integration Tests

**Test full flow:**
```javascript
describe('Configuration Integration', () => {
  it('should initialize all managers with new config', async () => {
    const engine = new WikiEngine();
    await engine.initialize(newConfig);

    const userManager = engine.getManager('UserManager');
    expect(userManager.isInitialized()).toBe(true);

    const attachmentManager = engine.getManager('AttachmentManager');
    expect(attachmentManager.isInitialized()).toBe(true);
  });
});
```

### 5.3 Migration Test

**Test migration script:**
```javascript
describe('Config Migration', () => {
  it('should migrate all keys correctly to lowercase', async () => {
    const oldConfig = {
      'amdwiki.attachments.maxSize': 10485760,
      'amdwiki.basicAttachmentProvider.storageDir': './data/attachments',
      'amdwiki.pageProvider': 'FileSystemProvider'
    };

    const newConfig = await migrateConfig(oldConfig);

    // All new keys must be lowercase
    expect(newConfig['amdwiki.attachment.security.maxsize']).toBe('10mb');
    expect(newConfig['amdwiki.attachment.provider.storagedir']).toBe('./data/attachments');
    expect(newConfig['amdwiki.page.provider']).toBe('filesystemprovider');

    // Old keys should be removed
    expect(newConfig['amdwiki.attachments.maxSize']).toBeUndefined();
    expect(newConfig['amdwiki.basicAttachmentProvider.storageDir']).toBeUndefined();
    expect(newConfig['amdwiki.pageProvider']).toBeUndefined();
  });

  it('should convert provider names to lowercase', async () => {
    const oldConfig = {
      'amdwiki.pageProvider': 'FileSystemProvider',
      'amdwiki.searchProvider': 'LuceneSearchProvider'
    };

    const newConfig = await migrateConfig(oldConfig);

    expect(newConfig['amdwiki.page.provider']).toBe('filesystemprovider');
    expect(newConfig['amdwiki.search.provider']).toBe('lucenesearchprovider');
  });
});
```

---

## Phase 6: Documentation Updates

### 6.1 Update Architecture Docs

**Update `docs/architecture/Policies-Roles-Permissions.md`:**
- Document role definitions in config
- Update UserManager responsibilities
- Clarify PolicyManager as source of truth for permissions

### 6.2 Create Configuration Reference

**Create `docs/configuration/README.md`:**
- Complete list of all config keys
- Organized by component
- Examples for each section

### 6.3 Update Developer Guide

**Update onboarding docs:**
- How to add new config keys (ALL LOWERCASE)
- Naming conventions:
  - Config keys: lowercase (`amdwiki.attachment.provider`)
  - Config values: lowercase (`basicattachmentprovider`)
  - Class names: PascalCase (`BasicAttachmentProvider`)
  - File names: lowercase (`basicattachmentprovider.js`)
- ConfigurationManager usage patterns
- Provider fallback pattern (`.provider.default` and `.provider`)

---

## Implementation Timeline

### Week 1: Configuration Reorganization
- [ ] Day 1-2: Create new config structure in app-default-config.json
- [ ] Day 3: Create migration script
- [ ] Day 4: Update app-{env}-config.json files
- [ ] Day 5: Update app-custom-config.json.example

### Week 2: Manager Refactoring
- [ ] Day 1-2: Update UserManager
- [ ] Day 3: Update AttachmentManager + BasicAttachmentProvider
- [ ] Day 4: Update PageManager, BackupManager, SearchManager
- [ ] Day 5: Code review and adjustments

### Week 3: Testing & Documentation
- [ ] Day 1-2: Unit tests
- [ ] Day 3: Integration tests
- [ ] Day 4: Migration testing
- [ ] Day 5: Documentation updates

### Week 4: Deployment
- [ ] Day 1: Final review
- [ ] Day 2: Deploy to test environment
- [ ] Day 3: Team testing
- [ ] Day 4-5: Bug fixes and adjustments

**Total Estimated Effort:** 15-20 days

---

## Success Criteria

- [ ] Zero duplicate configuration keys in app-default-config.json
- [ ] ALL configuration keys are lowercase (no typos)
- [ ] ALL provider names in config are lowercase
- [ ] Provider fallback pattern (`.provider.default` + `.provider`) implemented for all providers
- [ ] All managers use ConfigurationManager for ALL settings
- [ ] UserManager has no hardcoded roles or permissions
- [ ] Role metadata in config, permissions via policies
- [ ] Clear error messages for deprecated keys AND uppercase keys
- [ ] Migration script successfully converts old configs to lowercase
- [ ] All unit tests pass
- [ ] All integration tests pass
- [ ] Documentation complete and accurate
- [ ] Team trained on new structure and lowercase convention

---

## Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| **Breaking existing installations** | HIGH | Clear migration guide, automated migration tool, prominent release notes |
| **Migration script bugs** | MEDIUM | Extensive testing, manual review checklist, rollback procedure |
| **Team confusion** | MEDIUM | Training session, documentation, examples, code review |
| **Developers using uppercase in config** | MEDIUM | Validation in ConfigurationManager catches uppercase keys, clear error messages, lint rules, code review checklist |
| **Missed deprecated keys** | LOW | Comprehensive validation in ConfigurationManager, runtime checks |
| **Config files too large** | LOW | Organized sections with clear comments, reference documentation |

---

## Rollback Plan

If critical issues are discovered post-deployment:

1. **Immediate:** Revert to previous version
2. **Short-term:** Fix issues, re-test
3. **Document:** What went wrong, lessons learned
4. **Re-deploy:** With fixes and additional testing

**Rollback Checklist:**
- [ ] Tag current version: `git tag v1.3.2-config-refactor`
- [ ] Document rollback procedure in release notes
- [ ] Test rollback in staging environment
- [ ] Keep old config format documentation available

---

## Team Review Checklist

### Architecture Review
- [ ] Configuration structure makes sense
- [ ] Namespace conventions are clear and consistent
- [ ] Role/Policy separation is correct
- [ ] Manager responsibilities are well-defined

### Implementation Review
- [ ] Code changes are minimal and focused
- [ ] All config keys converted to lowercase
- [ ] Provider fallback pattern implemented everywhere
- [ ] Error messages are clear and actionable
- [ ] Migration script handles all cases and converts to lowercase
- [ ] Tests cover critical paths including uppercase validation

### Documentation Review
- [ ] Migration guide is complete and clear
- [ ] Configuration reference is accurate
- [ ] Examples are helpful
- [ ] Breaking changes are prominently documented

### Process Review
- [ ] Timeline is realistic
- [ ] Success criteria are measurable
- [ ] Risks are identified and mitigated
- [ ] Rollback plan is tested

---

## Open Questions for Team

1. **Timeline:** Is 4 weeks realistic for this scope?
2. **Breaking Changes:** Acceptable for next major version (v2.0)?
3. **Migration Support:** How long should we support old config format in migration tool?
4. **Custom Roles:** Should we support role creation via UI or config-only?
5. **Testing:** What additional test scenarios should we cover?
6. **Lowercase Enforcement:** Should we add ESLint rules or pre-commit hooks to enforce lowercase in config files?
7. **Provider Defaults:** Should `.provider.default` always match what's in app-default-config.json, or allow different defaults per environment?

---

## Next Steps

1. **Team Review:** Review this document, provide feedback
2. **Approval:** Get sign-off from tech lead and stakeholders
3. **Create Tickets:** Break down into discrete tasks
4. **Assign Work:** Distribute tasks across team
5. **Start Development:** Begin with configuration reorganization

---

**Document Maintained By:** Development Team
**Last Updated:** 2025-10-11
**Status:** Draft - Awaiting Team Review
