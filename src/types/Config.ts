/**
 * Configuration type definitions for amdWiki
 *
 * This module defines types for wiki configuration used by ConfigurationManager
 * and various components throughout the application.
 */

/**
 * Wiki configuration object
 *
 * Represents the complete wiki configuration loaded from JSON files.
 * Configuration is hierarchical with app-default-config.json, app-custom-config.json,
 * and environment-specific overrides.
 */
export interface WikiConfig {
  /** Application name */
  'amdwiki.applicationName': string;

  /** Favicon path */
  'amdwiki.faviconPath': string;

  /** Application category */
  'amdwiki.application.category': string;

  /** Application version */
  'amdwiki.version': string;

  /** Base URL */
  'amdwiki.baseURL': string;

  /** Character encoding */
  'amdwiki.encoding': string;

  /** Front page name */
  'amdwiki.frontPage': string;

  /** Server port */
  'amdwiki.server.port': number;

  /** Server host */
  'amdwiki.server.host': string;

  /** Session secret */
  'amdwiki.session.secret': string;

  /** Session max age (milliseconds) */
  'amdwiki.session.maxAge': number;

  /** Session secure flag (HTTPS only) */
  'amdwiki.session.secure': boolean;

  /** Session HTTP only flag */
  'amdwiki.session.httpOnly': boolean;

  /** Translator reader - match English plurals */
  'amdwiki.translator-reader.match-english-plurals': boolean;

  /** Translator reader - camel case links */
  'amdwiki.translator-reader.camel-case-links': boolean;

  /** Translator reader - allow HTML */
  'amdwiki.translator-reader.allow-html': boolean;

  /** Translator reader - plain URIs */
  'amdwiki.translator-reader.plain-uris': boolean;

  /** Page provider enabled */
  'amdwiki.page.enabled': boolean;

  /** Default page provider */
  'amdwiki.page.provider.default': string;

  /** Active page provider */
  'amdwiki.page.provider': string;

  /** Page storage directory */
  'amdwiki.page.provider.filesystem.storagedir': string;

  /** Required pages directory */
  'amdwiki.page.provider.filesystem.requiredpagesdir': string;

  /** File encoding for pages */
  'amdwiki.page.provider.filesystem.encoding': string;

  /** Auto-save enabled */
  'amdwiki.page.provider.filesystem.autosave': boolean;

  /** Attachment provider enabled */
  'amdwiki.attachment.enabled': boolean;

  /** Default attachment provider */
  'amdwiki.attachment.provider.default': string;

  /** Active attachment provider */
  'amdwiki.attachment.provider': string;

  /** Maximum attachment size (bytes) */
  'amdwiki.attachment.maxsize': number;

  /** Allowed attachment MIME types */
  'amdwiki.attachment.allowedtypes': string;

  /** Force download for attachments */
  'amdwiki.attachment.forcedownload': boolean;

  /** Attachment metadata file */
  'amdwiki.attachment.metadatafile': string;

  /** Search enabled */
  'amdwiki.search.enabled': boolean;

  /** Default search provider */
  'amdwiki.search.provider.default': string;

  /** Active search provider */
  'amdwiki.search.provider': string;

  /** Maximum search results */
  'amdwiki.search.maxresults': number;

  /** Autocomplete enabled */
  'amdwiki.search.autocomplete.enabled': boolean;

  /** Autocomplete minimum length */
  'amdwiki.search.autocomplete.minlength': number;

  /** Search suggestions enabled */
  'amdwiki.search.suggestions.enabled': boolean;

  /** Maximum suggestion items */
  'amdwiki.search.suggestions.maxitems': number;

  /** User provider */
  'amdwiki.user.provider': string;

  /** User provider default */
  'amdwiki.user.provider.default': string;

  /** User storage directory */
  'amdwiki.user.provider.storagedir': string;

  /** Cache provider */
  'amdwiki.cache.provider': string;

  /** Cache provider default */
  'amdwiki.cache.provider.default': string;

  /** Audit provider */
  'amdwiki.audit.provider': string;

  /** Audit provider default */
  'amdwiki.audit.provider.default': string;

  /** Additional configuration properties */
  [key: string]: any;
}

/**
 * Versioning configuration
 *
 * Configuration specific to VersioningFileProvider.
 */
export interface VersioningConfig {
  /** Page index file location */
  'amdwiki.page.provider.versioning.indexfile': string;

  /** Maximum versions to keep per page */
  'amdwiki.page.provider.versioning.maxversions': number;

  /** Retention period in days */
  'amdwiki.page.provider.versioning.retentiondays': number;

  /** Compression method (none, gzip) */
  'amdwiki.page.provider.versioning.compression': string;

  /** Delta storage enabled */
  'amdwiki.page.provider.versioning.deltastorage': boolean;

  /** Checkpoint interval for full snapshots */
  'amdwiki.page.provider.versioning.checkpointinterval': number;

  /** Version cache size */
  'amdwiki.page.provider.versioning.cachesize': number;
}

/**
 * Search provider configuration
 *
 * Configuration for Lunr search provider.
 */
export interface SearchProviderConfig {
  /** Index directory */
  'amdwiki.search.provider.lunr.indexdir': string;

  /** Enable stemming */
  'amdwiki.search.provider.lunr.stemming': boolean;

  /** Title boost factor */
  'amdwiki.search.provider.lunr.boost.title': number;

  /** System category boost factor */
  'amdwiki.search.provider.lunr.boost.systemcategory': number;

  /** User keywords boost factor */
  'amdwiki.search.provider.lunr.boost.userkeywords': number;

  /** Tags boost factor */
  'amdwiki.search.provider.lunr.boost.tags': number;

  /** Keywords boost factor */
  'amdwiki.search.provider.lunr.boost.keywords': number;

  /** Maximum results */
  'amdwiki.search.provider.lunr.maxresults': number;

  /** Snippet length */
  'amdwiki.search.provider.lunr.snippetlength': number;
}

/**
 * Installation configuration
 *
 * Configuration for first-run installation wizard.
 */
export interface InstallConfig {
  /** Installation completed flag */
  'amdwiki.install.completed': boolean;

  /** Require setup on first run */
  'amdwiki.install.requireSetup': boolean;

  /** Copy startup pages */
  'amdwiki.install.copyStartupPages': boolean;

  /** Create admin user */
  'amdwiki.install.createAdminUser': boolean;

  /** Organization name */
  'amdwiki.install.organization.name': string;

  /** Organization legal name */
  'amdwiki.install.organization.legalName': string;

  /** Organization description */
  'amdwiki.install.organization.description': string;

  /** Founding date */
  'amdwiki.install.organization.foundingDate': string;

  /** Contact email */
  'amdwiki.install.organization.contactEmail': string;

  /** Address locality (city) */
  'amdwiki.install.organization.addressLocality': string;

  /** Address region (state/province) */
  'amdwiki.install.organization.addressRegion': string;

  /** Address country */
  'amdwiki.install.organization.addressCountry': string;
}

/**
 * Configuration property descriptor
 *
 * Metadata about a configuration property (for validation and UI).
 */
export interface ConfigPropertyDescriptor {
  /** Property key */
  key: string;

  /** Default value */
  defaultValue: any;

  /** Value type */
  type: 'string' | 'number' | 'boolean' | 'array' | 'object';

  /** Human-readable description */
  description: string;

  /** Whether this is a required property */
  required: boolean;

  /** Whether this is a system property (not user-editable) */
  system: boolean;

  /** Validation rules */
  validation?: {
    /** Minimum value (for numbers) */
    min?: number;

    /** Maximum value (for numbers) */
    max?: number;

    /** Regex pattern (for strings) */
    pattern?: string;

    /** Allowed values (enum) */
    enum?: any[];
  };

  /** Property category for grouping */
  category?: string;

  /** Whether property requires restart to take effect */
  requiresRestart?: boolean;
}

/**
 * Configuration change event
 *
 * Event emitted when configuration changes.
 */
export interface ConfigChangeEvent {
  /** Property key that changed */
  key: string;

  /** Old value */
  oldValue: any;

  /** New value */
  newValue: any;

  /** Timestamp of change */
  timestamp: string;

  /** User who made the change */
  changedBy?: string;

  /** Source of change (file, api, ui) */
  source: string;
}

/**
 * Configuration validation result
 *
 * Result of validating configuration.
 */
export interface ConfigValidationResult {
  /** Whether configuration is valid */
  valid: boolean;

  /** Validation errors */
  errors: Array<{
    key: string;
    message: string;
    value?: any;
  }>;

  /** Validation warnings */
  warnings: Array<{
    key: string;
    message: string;
    value?: any;
  }>;
}
