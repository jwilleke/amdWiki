/**
 * Storage Location Permission Configuration
 * 
 * This configuration defines permission policies based on where pages are stored.
 * It integrates with the existing category-based storage system to provide
 * appropriate default permissions for each storage location.
 */

const StorageLocationPermissionConfig = {
  // Storage location-based permission policies
  storageLocationPolicies: {
    // /pages/ directory - User-generated content
    'pages': {
      description: 'User-generated content directory',
      categories: ['General', 'User'],
      defaultPermissions: {
        'view': ['all'],                    // Anyone can read user content
        'edit': ['authenticated'],          // Must be logged in to edit
        'delete': ['admin'],               // Only admins can delete
        'rename': ['admin'],               // Only admins can rename
        'upload': ['authenticated']        // Must be logged in to upload
      },
      restrictedPatterns: [],              // No special restrictions
      allowACLOverride: true               // ACL markup can override defaults
    },
    
    // /required-pages/ directory - System and documentation content
    'required-pages': {
      description: 'System and documentation content directory',
      categories: ['System', 'System/Admin', 'Documentation'],
      defaultPermissions: {
        'view': ['all'],                    // Anyone can read system/docs
        'edit': ['admin'],                  // Only admins can edit system pages
        'delete': ['admin'],               // Only admins can delete
        'rename': ['admin'],               // Only admins can rename
        'upload': ['admin']                // Only admins can upload
      },
      restrictedPatterns: [               // System pages with extra restrictions
        'admin*', 'user-manager*', 'acl-manager*', 'system*'
      ],
      allowACLOverride: false              // ACL markup ignored for security
    },
    
    // /docs/ directory - Developer documentation (future)
    'docs': {
      description: 'Developer documentation directory',
      categories: ['Developer'],
      defaultPermissions: {
        'view': ['all'],                    // Anyone can read dev docs
        'edit': ['developer', 'admin'],     // Developers and admins can edit
        'delete': ['admin'],               // Only admins can delete
        'rename': ['developer', 'admin'],   // Developers can rename
        'upload': ['developer', 'admin']    // Developers can upload
      },
      restrictedPatterns: [],              // No special restrictions
      allowACLOverride: true               // ACL markup can override defaults
    }
  },
  
  // Mapping from system-category to storage location
  categoryToStorageMapping: {
    'General': 'pages',
    'User': 'pages',
    'System': 'required-pages',
    'System/Admin': 'required-pages',
    'Documentation': 'required-pages',
    'Developer': 'docs'
  },
  
  // Role hierarchy for inheritance (higher roles inherit lower role permissions)
  roleHierarchy: {
    'admin': ['developer', 'authenticated', 'asserted', 'anonymous'],
    'developer': ['authenticated', 'asserted', 'anonymous'],
    'authenticated': ['asserted', 'anonymous'],
    'asserted': ['anonymous'],
    'anonymous': []
  },
  
  // Security configuration
  security: {
    // Pages that always require admin access regardless of ACL
    alwaysRestrictedPages: [
      'user-manager', 'acl-manager', 'system-config', 'admin-panel'
    ],
    // Actions that are never allowed via ACL for system pages
    systemPageRestrictedActions: ['delete', 'rename'],
    // Enable audit logging for permission decisions
    enableAuditLog: true,
    // Path for audit log (relative to application root)
    auditLogPath: './logs/permission-audit.log'
  },
  
  // Performance and caching configuration
  performance: {
    // Cache permission decisions for better performance
    enablePermissionCache: true,
    // Cache TTL in milliseconds (5 minutes)
    permissionCacheTTL: 300000,
    // Maximum cache entries
    maxCacheEntries: 1000
  }
};

module.exports = StorageLocationPermissionConfig;