/**
 * SchemaGenerator - Generates Schema.org JSON-LD markup from page metadata
 * Provides SEO and semantic web benefits for amdWiki platform
 */
class SchemaGenerator {
  /**
   * Generate Schema.org markup for a wiki page
   * @param {Object} pageData - Page metadata and content
   * @param {Object} options - Generation options
   * @returns {Object} JSON-LD schema object
   */
  static generatePageSchema(pageData, options = {}) {
    const baseSchema = {
      "@context": "https://schema.org",
      "@type": this.determineSchemaType(pageData),
      "name": pageData.title,
      "headline": pageData.title,
      "url": options.pageUrl || `${options.baseUrl}/wiki/${encodeURIComponent(pageData.title)}`,
      "dateModified": pageData.lastModified,
      "inLanguage": "en-US",
      "isPartOf": {
        "@type": "WebSite",
        "name": "amdWiki Platform",
        "url": options.baseUrl || "/"
      }
    };

    // Add keywords if available
    if (pageData.userKeywords && pageData.userKeywords.length > 0) {
      baseSchema.keywords = pageData.userKeywords.join(', ');
    }

    // Add categories as 'about' subjects
    if (pageData.categories && pageData.categories.length > 0) {
      baseSchema.about = pageData.categories.map(category => ({
        "@type": "Thing",
        "name": category
      }));
    }

    // Add author information
    baseSchema.author = {
      "@type": "Organization",
      "name": "amdWiki Platform"
    };

    // Add specific schema enhancements based on content type
    return this.enhanceSchemaByType(baseSchema, pageData, options);
  }

  /**
   * Determine appropriate Schema.org type based on page metadata
   * @param {Object} pageData - Page metadata
   * @returns {string} Schema.org type
   */
  static determineSchemaType(pageData) {
    const categories = pageData.categories || [];
    const keywords = pageData.userKeywords || [];
    const title = pageData.title || '';

    // Documentation pages
    if (categories.includes('Documentation') || 
        keywords.includes('documentation') ||
        title.toLowerCase().includes('documentation')) {
      return 'TechArticle';
    }

    // Project/vision pages
    if (categories.includes('Project') || 
        keywords.includes('vision') || 
        keywords.includes('roadmap') ||
        title.toLowerCase().includes('project')) {
      return 'CreativeWork';
    }

    // System/reference pages
    if (categories.includes('System') || 
        title.toLowerCase().includes('system') ||
        title.toLowerCase().includes('categories') ||
        title.toLowerCase().includes('keywords')) {
      return 'WebPage';
    }

    // Meeting notes
    if (categories.includes('Meeting Notes') ||
        title.toLowerCase().includes('meeting')) {
      return 'Article';
    }

    // Default to Article for general content
    return 'Article';
  }

  /**
   * Enhance schema based on determined type
   * @param {Object} baseSchema - Base schema object
   * @param {Object} pageData - Page metadata
   * @param {Object} options - Generation options
   * @returns {Object} Enhanced schema object
   */
  static enhanceSchemaByType(baseSchema, pageData, options) {
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
  static enhanceTechArticle(schema, pageData, options) {
    schema.articleSection = pageData.categories?.join(', ') || 'Documentation';
    
    if (pageData.userKeywords?.includes('plugins')) {
      schema.about = [{
        "@type": "SoftwareApplication",
        "name": "amdWiki Plugin System"
      }];
    }

    return schema;
  }

  /**
   * Enhance CreativeWork schema for project pages
   */
  static enhanceCreativeWork(schema, pageData, options) {
    if (pageData.userKeywords?.includes('vision') || 
        pageData.userKeywords?.includes('roadmap')) {
      schema.genre = 'Project Planning';
      schema.about = {
        "@type": "SoftwareProject",
        "name": "amdWiki Platform Development"
      };
    }

    return schema;
  }

  /**
   * Enhance WebPage schema for system pages
   */
  static enhanceWebPage(schema, pageData, options) {
    if (pageData.title?.toLowerCase().includes('categories')) {
      schema.mainEntity = {
        "@type": "DefinedTermSet",
        "name": "amdWiki Content Categories",
        "description": "Available categories for organizing wiki content"
      };
    }

    return schema;
  }

  /**
   * Generate JSON-LD script tag for HTML injection
   * @param {Object} schema - Schema.org object
   * @returns {string} HTML script tag
   */
  static generateScriptTag(schema) {
    return `<script type="application/ld+json">\n${JSON.stringify(schema, null, 2)}\n</script>`;
  }

  /**
   * Generate schema for multiple pages (site-wide)
   * @param {Array} pages - Array of page data objects
   * @param {Object} options - Generation options
   * @returns {Array} Array of schema objects
   */
  static generateSiteSchema(pages, options = {}) {
    return pages.map(page => this.generatePageSchema(page, options));
  }

  /**
   * Generate Person schema from user JSON data
   * @param {Object} userData - User data from users.json
   * @param {Object} options - Generation options
   * @returns {Object} Person schema object
   */
  static generatePersonSchema(userData, options = {}) {
    const schema = {
      "@context": "https://schema.org",
      "@type": "Person",
      "name": userData.displayName || userData.username,
      "identifier": userData.username
    };

    // Add email if available and not sensitive
    if (userData.email && !userData.isSystem) {
      schema.email = userData.email;
    }

    // Add organization membership
    schema.memberOf = {
      "@type": "Organization",
      "name": options.organizationName || "amdWiki Platform"
    };

    // Add role information
    if (userData.roles && userData.roles.length > 0) {
      schema.roleName = userData.roles;
      
      // Enhanced role descriptions
      if (userData.roles.includes('admin')) {
        schema.jobTitle = 'Administrator';
      } else if (userData.roles.includes('editor')) {
        schema.jobTitle = 'Content Editor';
      } else if (userData.roles.includes('reader')) {
        schema.jobTitle = 'Reader';
      }
    }

    // Add temporal information
    if (userData.createdAt) {
      schema.memberOfStartDate = userData.createdAt;
    }

    if (userData.lastLogin) {
      schema.lastReviewed = userData.lastLogin;
    }

    return schema;
  }

  /**
   * Generate SoftwareApplication schema from wiki configuration
   * @param {Object} configData - Configuration from wiki.json
   * @param {Object} options - Generation options
   * @returns {Object} SoftwareApplication schema object
   */
  static generateSoftwareSchema(configData, options = {}) {
    const schema = {
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      "name": configData.applicationName || "amdWiki",
      "version": configData.version,
      "applicationCategory": "Wiki Software",
      "operatingSystem": "Cross-platform"
    };

    // Add server configuration
    if (configData.server) {
      schema.serviceType = "Web Application";
      if (configData.server.port) {
        schema.serverStatus = `Running on port ${configData.server.port}`;
      }
    }

    // Add feature capabilities
    if (configData.features) {
      const capabilities = [];
      
      if (configData.features.export?.html) capabilities.push("HTML Export");
      if (configData.features.export?.pdf) capabilities.push("PDF Export");
      if (configData.features.attachments?.enabled) capabilities.push("File Attachments");
      if (configData.features.llm?.enabled) capabilities.push("AI Integration");
      
      if (capabilities.length > 0) {
        schema.featureList = capabilities;
      }
    }

    // Add requirements
    schema.softwareRequirements = "Node.js";
    
    // Add organization
    schema.author = {
      "@type": "Organization",
      "name": options.organizationName || "amdWiki Platform"
    };

    return schema;
  }

  /**
   * Generate Organization schema for the platform
   * @param {Object} options - Generation options
   * @returns {Object} Organization schema object
   */
  static generateOrganizationSchema(options = {}) {
    return {
      "@context": "https://schema.org",
      "@type": "Organization",
      "name": options.organizationName || "amdWiki Platform",
      "description": "Digital platform for wiki, document management, and modular content systems",
      "foundingDate": options.foundingDate || "2025",
      "sameAs": options.website || options.repository,
      "makesOffer": {
        "@type": "Offer",
        "itemOffered": {
          "@type": "SoftwareApplication",
          "name": "amdWiki Platform"
        }
      }
    };
  }

  /**
   * Generate comprehensive site schema combining all data sources
   * @param {Object} siteData - Combined data from all JSON sources
   * @param {Object} options - Generation options
   * @returns {Object} Complete site schema
   */
  static generateComprehensiveSchema(siteData, options = {}) {
    const schemas = [];

    // Add main organization
    schemas.push(this.generateOrganizationSchema(options));

    // Add software application
    if (siteData.config) {
      schemas.push(this.generateSoftwareSchema(siteData.config, options));
    }

    // Add key user profiles (admins only for privacy)
    if (siteData.users) {
      Object.values(siteData.users)
        .filter(user => user.roles?.includes('admin') && !user.isSystem)
        .forEach(user => {
          schemas.push(this.generatePersonSchema(user, options));
        });
    }

    return schemas;
  }
}

module.exports = SchemaGenerator;
