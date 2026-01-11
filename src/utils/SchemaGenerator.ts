import logger from './logger';

/**
 * Schema generation options
 */
interface SchemaOptions {
  pageUrl?: string;
  baseUrl?: string;
  engine?: unknown;
  user?: unknown;
  organizationName?: string;
  repository?: string;
}

/**
 * Page data for schema generation
 */
interface PageData {
  title?: string;
  lastModified?: string;
  dateCreated?: string;
  userKeywords?: string[];
  categories?: string[];
  category?: string;
  content?: string;
  [key: string]: unknown;
}

/**
 * Configuration data for software schema
 */
interface ConfigData {
  application?: {
    name?: string;
    version?: string;
    applicationCategory?: string;
  };
  applicationName?: string;
  version?: string;
  server?: {
    port?: number;
  };
  features?: {
    export?: {
      html?: boolean;
      pdf?: boolean;
    };
    attachments?: {
      enabled?: boolean;
    };
    llm?: {
      enabled?: boolean;
    };
  };
  organization?: unknown;
}

/**
 * Person data from Schema.org
 */
interface PersonData {
  identifier?: string;
  authentication?: unknown;
  [key: string]: unknown;
}

/**
 * Organization data from Schema.org
 */
interface OrganizationData {
  url?: string;
  [key: string]: unknown;
}

/**
 * Site data for comprehensive schema generation
 */
interface SiteData {
  organizations?: OrganizationData[];
  config?: ConfigData;
  persons?: Array<PersonData & {
    hasCredential?: Array<{ credentialCategory?: string }>;
    isSystem?: boolean;
  }>;
}

/**
 * Base schema object with optional properties
 */
interface BaseSchema {
  '@context': string;
  '@type': string;
  name?: unknown;
  headline?: unknown;
  url?: unknown;
  dateModified?: unknown;
  dateCreated?: unknown;
  inLanguage?: string;
  isPartOf?: unknown;
  keywords?: string;
  about?: unknown;
  primaryImageOfPage?: unknown;
  relatedLink?: string[];
  author?: unknown;
  hasDigitalDocumentPermission?: unknown[];
  articleSection?: string;
  genre?: string;
  breadcrumb?: unknown;
  mainContentOfPage?: unknown;
  mainEntity?: unknown;
  significantLink?: string[];
  serviceType?: string;
  serverStatus?: string;
  featureList?: string[];
  softwareRequirements?: string;
  [key: string]: unknown;
}

/**
 * ACL parsed from page content
 */
interface ParsedACL {
  [action: string]: string[];
}

/**
 * SchemaGenerator - Generates Schema.org JSON-LD markup from page metadata
 * Provides SEO and semantic web benefits for amdWiki platform
 */
class SchemaGenerator {
  /**
   * Generate Schema.org markup for a wiki page
   * @param pageData - Page metadata and content
   * @param options - Generation options (should include engine and user for permissions)
   * @returns JSON-LD schema object
   */
  static generatePageSchema(pageData: PageData, options: SchemaOptions = {}): BaseSchema {
    const schemaType = this.determineSchemaType(pageData);
    const baseSchema: BaseSchema = {
      '@context': 'https://schema.org',
      '@type': schemaType,
      'name': pageData.title,
      'headline': pageData.title,
      'url': options.pageUrl || `${options.baseUrl}/view/${encodeURIComponent(pageData.title || '')}`,
      'dateModified': pageData.lastModified,
      'inLanguage': 'en-US',
      'isPartOf': {
        '@type': 'WebSite',
        'name': 'amdWiki Platform',
        'url': options.baseUrl || '/'
      }
    };

    // Add creation date if available
    if (pageData.dateCreated) {
      baseSchema.dateCreated = pageData.dateCreated;
    }

    // Add keywords if available
    if (pageData.userKeywords && pageData.userKeywords.length > 0) {
      baseSchema.keywords = pageData.userKeywords.join(', ');
    }

    // Add categories as 'about' subjects for WebPage
    if (pageData.categories && pageData.categories.length > 0) {
      if (schemaType === 'WebPage') {
        baseSchema.about = pageData.categories.map(category => ({
          '@type': 'DefinedTerm',
          'name': category,
          'inDefinedTermSet': {
            '@type': 'DefinedTermSet',
            'name': 'amdWiki Categories'
          }
        }));
      } else {
        baseSchema.about = pageData.categories.map(category => ({
          '@type': 'Thing',
          'name': category
        }));
      }
    }

    // Add primary category as subject for WebPage
    if (pageData.category && schemaType === 'WebPage') {
      baseSchema.primaryImageOfPage = null; // Can be enhanced later
      baseSchema.relatedLink = [`${options.baseUrl}/category/${encodeURIComponent(pageData.category)}`];
    }

    // Add author information
    baseSchema.author = {
      '@type': 'Organization',
      'name': 'amdWiki Platform'
    };

    // Add DigitalDocumentPermission objects if engine is available
    if (options.engine) {
      const permissions = this.generateDigitalDocumentPermissions(pageData, options.user, options);
      if (permissions.length > 0) {
        baseSchema.hasDigitalDocumentPermission = permissions;
      }
    }

    // Add specific schema enhancements based on content type
    return this.enhanceSchemaByType(baseSchema, pageData, options);
  }

  /**
   * Determine appropriate Schema.org type based on page metadata
   * @param pageData - Page metadata
   * @returns Schema.org type
   */
  static determineSchemaType(pageData: PageData): string {
    const categories = pageData.categories || [];
    const keywords = pageData.userKeywords || [];
    const title = pageData.title || '';

    // Documentation pages - specialized technical content
    if (categories.includes('Documentation') || 
        keywords.includes('documentation') ||
        title.toLowerCase().includes('documentation')) {
      return 'TechArticle';
    }

    // Project/vision pages - creative planning content
    if (categories.includes('Project') || 
        keywords.includes('vision') || 
        keywords.includes('roadmap') ||
        title.toLowerCase().includes('project')) {
      return 'CreativeWork';
    }

    // Meeting notes - time-based collaborative content
    if (categories.includes('Meeting Notes') ||
        title.toLowerCase().includes('meeting')) {
      return 'Article';
    }

    // Default to WebPage for all wiki content
    // WebPage is most appropriate for interconnected wiki pages with navigation
    return 'WebPage';
    return 'Article';
  }

  /**
   * Enhance schema based on determined type
   * @param baseSchema - Base schema object
   * @param pageData - Page metadata
   * @param options - Generation options
   * @returns Enhanced schema object
   */
  static enhanceSchemaByType(baseSchema: BaseSchema, pageData: PageData, options: SchemaOptions): BaseSchema {
    switch (baseSchema['@type']) {
    case 'TechArticle':
      return this.enhanceTechArticle(baseSchema, pageData, options);
      
    case 'CreativeWork':
      return this.enhanceCreativeWork(baseSchema, pageData, options);
      
    case 'WebPage':
      return this.enhanceWebPage(baseSchema, pageData, options);
      
    default:
      return baseSchema;
    }
  }

  /**
   * Enhance TechArticle schema for documentation
   */
  static enhanceTechArticle(schema: BaseSchema, pageData: PageData, _options: SchemaOptions): BaseSchema {
    schema.articleSection = pageData.categories?.join(', ') || 'Documentation';
    
    if (pageData.userKeywords?.includes('plugins')) {
      schema.about = [{
        '@type': 'SoftwareApplication',
        'name': 'amdWiki Plugin System'
      }];
    }

    return schema;
  }

  /**
   * Enhance CreativeWork schema for project pages
   */
  static enhanceCreativeWork(schema: BaseSchema, pageData: PageData, _options: SchemaOptions): BaseSchema {
    if (pageData.userKeywords?.includes('vision') || 
        pageData.userKeywords?.includes('roadmap')) {
      schema.genre = 'Project Planning';
      schema.about = {
        '@type': 'SoftwareProject',
        'name': 'amdWiki Platform Development'
      };
    }

    return schema;
  }

  /**
   * Enhance WebPage schema for wiki pages
   */
  static enhanceWebPage(schema: BaseSchema, pageData: PageData, options: SchemaOptions): BaseSchema {
    // Add breadcrumb for category hierarchy
    if (pageData.category && pageData.category.includes('/')) {
      const categoryParts = pageData.category.split('/');
      schema.breadcrumb = {
        '@type': 'BreadcrumbList',
        'itemListElement': categoryParts.map((part, index) => ({
          '@type': 'ListItem',
          'position': index + 1,
          'name': part,
          'item': `${options.baseUrl}/category/${part}`
        }))
      };
    }

    // Add main content designation
    schema.mainContentOfPage = {
      '@type': 'WebPageElement',
      'cssSelector': '.wiki-content'
    };

    // Add specific enhancements based on page type
    if (pageData.title?.toLowerCase().includes('categories')) {
      schema.mainEntity = {
        '@type': 'DefinedTermSet', 
        'name': 'amdWiki Content Categories',
        'description': 'Available categories for organizing wiki content'
      };
    }

    if (pageData.title?.toLowerCase().includes('keywords')) {
      schema.mainEntity = {
        '@type': 'DefinedTermSet',
        'name': 'amdWiki User Keywords', 
        'description': 'Available user-defined keywords for content tagging'
      };
    }

    // Add significant links for wiki navigation
    if (pageData.categories?.includes('System')) {
      schema.significantLink = [
        `${options.baseUrl}/view/Categories`,
        `${options.baseUrl}/view/User-Keywords`,
        `${options.baseUrl}/view/Welcome`
      ];
    }

    return schema;
  }

  /**
   * Generate JSON-LD script tag for HTML injection
   * @param schema - Schema.org object
   * @returns HTML script tag
   */
  static generateScriptTag(schema: BaseSchema | Record<string, unknown>): string {
    return `<script type="application/ld+json">\n${JSON.stringify(schema, null, 2)}\n</script>`;
  }

  /**
   * Generate schema for multiple pages (site-wide)
   * @param pages - Array of page data objects
   * @param options - Generation options
   * @returns Array of schema objects
   */
  static generateSiteSchema(pages: PageData[], options: SchemaOptions = {}): BaseSchema[] {
    return pages.map(page => this.generatePageSchema(page, options));
  }

  /**
   * Generate Person schema from Schema.org compliant person data
   * @param personData - Schema.org Person data
   * @param options - Generation options
   * @returns Person schema object
   */
  static generatePersonSchema(personData: PersonData, options: SchemaOptions = {}): Record<string, unknown> {
    // Person data is already Schema.org compliant, just clean for public use
    const { authentication: _authentication, ...publicPerson } = personData;
    
    // Enhance with additional properties if needed
    if (!publicPerson.url && options.baseUrl) {
      publicPerson.url = `${options.baseUrl}/person/${personData.identifier}`;
    }
    
    return publicPerson;
  }

  /**
   * Generate Organization schema from Schema.org compliant organization data
   * @param organizationData - Schema.org Organization data
   * @param options - Generation options
   * @returns Organization schema object
   */
  static generateOrganizationSchema(organizationData: OrganizationData, options: SchemaOptions = {}): Record<string, unknown> {
    // Organization data is already Schema.org compliant
    const organization = { ...organizationData };
    
    // Enhance with additional properties if needed
    if (!organization.url && options.baseUrl) {
      organization.url = options.baseUrl;
    }
    
    return organization;
  }

  /**
   * Generate SoftwareApplication schema from wiki configuration
   * @param configData - Configuration from wiki.json
   * @param options - Generation options
   * @returns SoftwareApplication schema object
   */
  static generateSoftwareSchema(configData: ConfigData, options: SchemaOptions = {}): BaseSchema {
    const schema: BaseSchema = {
      '@context': 'https://schema.org',
      '@type': 'SoftwareApplication',
      'name': configData.application?.name || configData.applicationName || 'amdWiki',
      'version': configData.application?.version || configData.version,
      'applicationCategory': configData.application?.applicationCategory || 'Wiki Software',
      'operatingSystem': 'Cross-platform'
    };

    // Add server configuration
    if (configData.server) {
      schema.serviceType = 'Web Application';
      if (configData.server.port) {
        schema.serverStatus = `Running on port ${configData.server.port}`;
      }
    }

    // Add feature capabilities
    if (configData.features) {
      const capabilities = [];
      
      if (configData.features.export?.html) capabilities.push('HTML Export');
      if (configData.features.export?.pdf) capabilities.push('PDF Export');
      if (configData.features.attachments?.enabled) capabilities.push('File Attachments');
      if (configData.features.llm?.enabled) capabilities.push('AI Integration');
      
      if (capabilities.length > 0) {
        schema.featureList = capabilities;
      }
    }

    // Add requirements
    schema.softwareRequirements = 'Node.js';
    
    // Add organization reference
    if (configData.organization) {
      schema.author = configData.organization;
    } else {
      schema.author = {
        '@type': 'Organization',
        'name': options.organizationName || 'amdWiki Platform'
      };
    }

    return schema;
  }

  /**
   * Generate DigitalDocumentPermission objects for a page
   * @param pageData - Page metadata and content
   * @param user - Current user context (null for anonymous)
   * @param options - Generation options (must include engine)
   * @returns Array of DigitalDocumentPermission objects
   */
  static generateDigitalDocumentPermissions(pageData: PageData, user: unknown, options: SchemaOptions = {}): unknown[] {
    const permissions: unknown[] = [];
    const engine = options.engine;
    
    if (!engine) {
      logger.warn('Engine not provided to generateDigitalDocumentPermissions');
      return permissions;
    }

    const userManager = (engine as { getManager: (name: string) => unknown }).getManager('UserManager');
    const aclManager = (engine as { getManager: (name: string) => unknown }).getManager('ACLManager');
    
    if (!userManager || !aclManager) {
      logger.warn('UserManager or ACLManager not available for permission generation');
      return permissions;
    }
    
    // Parse page-level ACL if present
    const pageACL = (aclManager as { parseACL?: (content: string) => ParsedACL | null })?.parseACL?.(pageData.content || '') || null;
    
    // Generate permissions based on page type and ACL
    return this.generatePermissionsByContext(pageData, pageACL, userManager, aclManager, options);
  }

  /**
   * Generate permissions based on page category and protection level
   * @param pageData - Page metadata
   * @param pageACL - Parsed ACL from page content
   * @param userManager - UserManager instance
   * @param aclManager - ACLManager instance
   * @param options - Generation options
   * @returns Array of DigitalDocumentPermission objects
   */
  static generatePermissionsByContext(pageData: PageData, pageACL: ParsedACL | null, userManager: unknown, _aclManager: unknown, options: SchemaOptions): unknown[] {
    const category = pageData.category || 'General';
    
    // If page has specific ACL, use ACL-based permissions
    if (pageACL) {
      return this.generateACLBasedPermissions(pageACL, userManager, options);
    }
    
    // Base permission strategy by category
    const categoryStrategies: Record<string, () => unknown[]> = {
      'General': () => this.generateGeneralPagePermissions(pageData, userManager, options),
      'System': () => this.generateSystemPagePermissions(pageData, userManager, options),
      'Documentation': () => this.generateDocumentationPermissions(pageData, userManager, options),
      'Developer': () => this.generateDeveloperPermissions(pageData, userManager, options)
    };

    const strategy = categoryStrategies[category] || categoryStrategies['General'];
    return strategy();
  }

  /**
   * Generate permissions for General category pages (user content)
   * @param pageData - Page metadata
   * @param userManager - UserManager instance
   * @param options - Generation options
   * @returns Array of DigitalDocumentPermission objects
   */
  static generateGeneralPagePermissions(_pageData: PageData, _userManager: unknown, _options: SchemaOptions): unknown[] {
    const permissions = [];
    
    // Default General page permissions
    permissions.push({
      '@type': 'DigitalDocumentPermission',
      'permissionType': 'ReadPermission',
      'grantee': {
        '@type': 'Audience',
        'audienceType': 'public'
      }
    });
    
    permissions.push({
      '@type': 'DigitalDocumentPermission', 
      'permissionType': 'WritePermission',
      'grantee': {
        '@type': 'Audience',
        'audienceType': 'editor'
      }
    });
    
    permissions.push({
      '@type': 'DigitalDocumentPermission',
      'permissionType': 'CreatePermission',
      'grantee': {
        '@type': 'Audience', 
        'audienceType': 'editor'
      }
    });
    
    permissions.push({
      '@type': 'DigitalDocumentPermission',
      'permissionType': 'DeletePermission',
      'grantee': {
        '@type': 'Person',
        'name': 'admin'
      }
    });
    
    permissions.push({
      '@type': 'DigitalDocumentPermission',
      'permissionType': 'CommentPermission',
      'grantee': {
        '@type': 'Audience',
        'audienceType': 'authenticated'
      }
    });
    
    permissions.push({
      '@type': 'DigitalDocumentPermission',
      'permissionType': 'UploadPermission', 
      'grantee': {
        '@type': 'Audience',
        'audienceType': 'editor'
      }
    });
    
    return permissions;
  }

  /**
   * Generate permissions for System category pages (app-managed)
   * @param pageData - Page metadata
   * @param userManager - UserManager instance
   * @param options - Generation options
   * @returns Array of DigitalDocumentPermission objects
   */
  static generateSystemPagePermissions(_pageData: PageData, _userManager: unknown, _options: SchemaOptions): unknown[] {
    const permissions = [];
    
    // System pages: Read for all, admin-only for modifications
    permissions.push({
      '@type': 'DigitalDocumentPermission',
      'permissionType': 'ReadPermission',
      'grantee': {
        '@type': 'Audience',
        'audienceType': 'public'
      }
    });
    
    permissions.push({
      '@type': 'DigitalDocumentPermission',
      'permissionType': 'AdministerPermission',
      'grantee': {
        '@type': 'Person', 
        'name': 'admin'
      }
    });
    
    return permissions;
  }

  /**
   * Generate permissions for Documentation category pages
   * @param pageData - Page metadata
   * @param userManager - UserManager instance
   * @param options - Generation options
   * @returns Array of DigitalDocumentPermission objects
   */
  static generateDocumentationPermissions(_pageData: PageData, _userManager: unknown, _options: SchemaOptions): unknown[] {
    const permissions = [];
    
    permissions.push({
      '@type': 'DigitalDocumentPermission',
      'permissionType': 'ReadPermission',
      'grantee': {
        '@type': 'Audience',
        'audienceType': 'public' 
      }
    });
    
    permissions.push({
      '@type': 'DigitalDocumentPermission',
      'permissionType': 'WritePermission',
      'grantee': {
        '@type': 'Audience',
        'audienceType': 'editor'
      }
    });
    
    permissions.push({
      '@type': 'DigitalDocumentPermission',
      'permissionType': 'CommentPermission',
      'grantee': {
        '@type': 'Audience',
        'audienceType': 'authenticated'
      }
    });
    
    return permissions;
  }

  /**
   * Generate permissions for Developer category pages
   * @param pageData - Page metadata
   * @param userManager - UserManager instance
   * @param options - Generation options
   * @returns Array of DigitalDocumentPermission objects
   */
  static generateDeveloperPermissions(_pageData: PageData, _userManager: unknown, _options: SchemaOptions): unknown[] {
    const permissions = [];
    
    permissions.push({
      '@type': 'DigitalDocumentPermission',
      'permissionType': 'ReadPermission', 
      'grantee': {
        '@type': 'Audience',
        'audienceType': 'public'
      }
    });
    
    permissions.push({
      '@type': 'DigitalDocumentPermission',
      'permissionType': 'WritePermission',
      'grantee': {
        '@type': 'Audience',
        'audienceType': 'developer'
      }
    });
    
    permissions.push({
      '@type': 'DigitalDocumentPermission',
      'permissionType': 'CreatePermission',
      'grantee': {
        '@type': 'Audience',
        'audienceType': 'developer'
      }
    });
    
    return permissions;
  }

  /**
   * Generate permissions based on parsed page ACL
   * @param pageACL - Parsed ACL object
   * @param userManager - UserManager instance
   * @param options - Generation options
   * @returns Array of DigitalDocumentPermission objects
   */
  static generateACLBasedPermissions(pageACL: ParsedACL, userManager: unknown, _options: SchemaOptions): unknown[] {
    const permissions = [];
    
    // Map ACL actions to permission types
    const aclToPermissionMap = {
      'view': 'ReadPermission',
      'edit': 'WritePermission', 
      'delete': 'DeletePermission',
      'rename': 'RenamePermission',
      'upload': 'UploadPermission'
    } as Record<string, string>;

    for (const [action, principals] of Object.entries(pageACL)) {
      const permissionType = aclToPermissionMap[action];
      if (!permissionType || !principals || principals.length === 0) {
        continue;
      }
      
      // Generate permission for each principal
      for (const principal of principals) {
        const grantee = this.mapPrincipalToGrantee(principal, userManager);
        if (grantee) {
          permissions.push({
            '@type': 'DigitalDocumentPermission',
            'permissionType': permissionType,
            'grantee': grantee
          });
        }
      }
    }
    
    return permissions;
  }

  /**
   * Map ACL principal to Schema.org grantee object
   * @param principal - ACL principal (user, role, or special)
   * @param userManager - UserManager instance
   * @returns Schema.org Person or Audience object
   */
  static mapPrincipalToGrantee(principal: string, userManager: unknown): { '@type': string; name?: string; audienceType?: string } | null {
    const p = principal.toLowerCase();
    
    // Handle special principals
    const specialMappings: Record<string, { '@type': string; audienceType: string }> = {
      'all': { '@type': 'Audience', 'audienceType': 'public' },
      'anonymous': { '@type': 'Audience', 'audienceType': 'anonymous' },
      'authenticated': { '@type': 'Audience', 'audienceType': 'authenticated' },
      'asserted': { '@type': 'Audience', 'audienceType': 'asserted' }
    };

    if (specialMappings[p]) {
      return specialMappings[p];
    }
    
    // Check if it's a role
    const role = (userManager as { getRole?: (name: string) => unknown } | null)?.getRole?.(principal);
    if (role) {
      return {
        '@type': 'Audience',
        'audienceType': principal
      };
    }
    
    // Assume it's a specific user
    return {
      '@type': 'Person',
      'name': principal
    };
  }

  /**
   * Generate comprehensive site schema using Schema.org compliant data
   * @param siteData - Combined data from SchemaManager
   * @param options - Generation options
   * @returns Array of schema objects
   */
  static generateComprehensiveSchema(siteData: SiteData, options: SchemaOptions = {}): (BaseSchema | Record<string, unknown>)[] {
    const schemas: (BaseSchema | Record<string, unknown>)[] = [];

    // Add organizations (already Schema.org compliant)
    if (siteData.organizations) {
      siteData.organizations.forEach(org => {
        schemas.push(this.generateOrganizationSchema(org, options));
      });
    }

    // Add software application
    if (siteData.config) {
      schemas.push(this.generateSoftwareSchema(siteData.config, options));
    }

    // Add public persons (admins only for privacy, already Schema.org compliant)
    if (siteData.persons) {
      siteData.persons
        .filter(person => person.hasCredential?.some(cred => cred.credentialCategory === 'admin') && !person.isSystem)
        .forEach(person => {
          schemas.push(this.generatePersonSchema(person, options));
        });
    }

    return schemas;
  }
}

export default SchemaGenerator;

// CommonJS compatibility
module.exports = SchemaGenerator;
