/**
 * DigitalDocumentPermission Configuration
 * 
 * This configuration defines default permission strategies and mappings
 * for Schema.org DigitalDocumentPermission generation in amdWiki.
 */

const DigitalDocumentPermissionConfig = {
  // Global permission defaults by category
  categoryDefaults: {
    'General': {
      'ReadPermission': ['public'],
      'WritePermission': ['editor', 'admin'],
      'CreatePermission': ['editor', 'admin'],
      'DeletePermission': ['admin'],
      'CommentPermission': ['authenticated'],
      'UploadPermission': ['editor', 'admin']
    },
    'System': {
      'ReadPermission': ['public'],
      'AdministerPermission': ['admin']
    },
    'Documentation': {
      'ReadPermission': ['public'],
      'WritePermission': ['editor', 'admin'],
      'CommentPermission': ['authenticated']
    },
    'Developer': {
      'ReadPermission': ['public'],
      'WritePermission': ['developer', 'admin'],
      'CreatePermission': ['developer', 'admin']
    }
  },
  
  // Custom audience type mappings for better semantic description
  audienceTypeMappings: {
    'public': 'general public',
    'anonymous': 'anonymous users',
    'authenticated': 'authenticated users',
    'asserted': 'session users',
    'reader': 'readers',
    'editor': 'content editors',
    'admin': 'administrators',
    'developer': 'developers'
  },
  
  // Permission type descriptions for documentation and validation
  permissionDescriptions: {
    'ReadPermission': 'Permission to view content',
    'WritePermission': 'Permission to edit content',
    'CreatePermission': 'Permission to create new content',
    'DeletePermission': 'Permission to delete content',
    'RenamePermission': 'Permission to rename content',
    'UploadPermission': 'Permission to upload files',
    'CommentPermission': 'Permission to add comments',
    'AdministerPermission': 'Administrative permissions'
  },
  
  // ACL action to permission type mapping
  aclToPermissionMap: {
    'view': 'ReadPermission',
    'edit': 'WritePermission',
    'delete': 'DeletePermission',
    'rename': 'RenamePermission',
    'upload': 'UploadPermission'
  },
  
  // Special ACL principals mapping
  specialPrincipals: {
    'all': { "@type": "Audience", "audienceType": "public" },
    'anonymous': { "@type": "Audience", "audienceType": "anonymous" },
    'authenticated': { "@type": "Audience", "audienceType": "authenticated" },
    'asserted': { "@type": "Audience", "audienceType": "asserted" }
  },
  
  // Performance and caching configuration
  performance: {
    enableCaching: true,
    cacheTimeout: 300000, // 5 minutes in milliseconds
    maxCacheEntries: 1000
  },
  
  // Schema.org validation configuration
  validation: {
    strictMode: true,
    validateGranteeTypes: ['Person', 'Audience'],
    requiredPermissionProperties: ['@type', 'permissionType', 'grantee'],
    permissionTypePattern: /Permission$/
  },
  
  // Feature flags for experimental features
  features: {
    enableTimeBasedPermissions: false,
    enableConditionalPermissions: false,
    enablePermissionInheritance: false,
    enablePermissionAuditLog: false
  }
};

module.exports = DigitalDocumentPermissionConfig;
