const BaseManager = require('./BaseManager');
const fs = require('fs-extra');
const path = require('path');
const matter = require('gray-matter');
const { v4: uuidv4 } = require('uuid');

/**
 * Generate URL-safe slug from title
 * @param {string} title - Page title
 * @returns {string} URL-safe slug
 */
function generateSlug(title) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-+/g, '-');
}

/**
 * PageManager - Enhanced with UUID-based file storage
 * Similar to JSPWiki's PageManager but with modern content management features
 */
class PageManager extends BaseManager {
  constructor(engine) {
    super(engine);
    this.pagesDir = null;
    this.requiredPagesDir = null;
    // Cache for page lookups to improve performance
    this.pageCache = new Map();
    this.titleToUuidMap = new Map();
    this.slugToUuidMap = new Map();
    this.uuidToFileMap = new Map();
  }

  async initialize(config = {}) {
    await super.initialize(config);
    this.pagesDir = config.pagesDir || path.join(process.cwd(), 'pages');
    this.requiredPagesDir = config.requiredPagesDir || path.join(process.cwd(), 'required-pages');
    await fs.ensureDir(this.pagesDir);
    await fs.ensureDir(this.requiredPagesDir);
    
    // Build lookup caches
    await this.buildLookupCaches();
    
    // Generate/update PageIndex on startup
    await this.updatePageIndex();
  }

  /**
   * Build lookup caches for efficient page resolution
   */
  async buildLookupCaches() {
    this.pageCache.clear();
    this.titleToUuidMap.clear();
    this.slugToUuidMap.clear();
    this.uuidToFileMap.clear();

    const directories = [
      { path: this.pagesDir, type: 'regular' },
      { path: this.requiredPagesDir, type: 'required' }
    ];

    for (const dir of directories) {
      try {
        const files = await fs.readdir(dir.path);
        
        for (const file of files) {
          if (!file.endsWith('.md')) continue;
          
          const filePath = path.join(dir.path, file);
          const fileName = path.parse(file).name;
          
          try {
            const fileContent = await fs.readFile(filePath, 'utf-8');
            const { data: metadata } = matter(fileContent);
            
            if (metadata.uuid) {
              // UUID-based file
              this.uuidToFileMap.set(metadata.uuid, {
                filePath,
                fileName,
                directory: dir.type
              });
              
              if (metadata.title) {
                this.titleToUuidMap.set(metadata.title, metadata.uuid);
              }
              
              if (metadata.slug) {
                this.slugToUuidMap.set(metadata.slug, metadata.uuid);
              } else if (metadata.title) {
                // Generate slug if missing
                const slug = generateSlug(metadata.title);
                this.slugToUuidMap.set(slug, metadata.uuid);
              }
            } else {
              // Legacy filename-based file
              this.titleToUuidMap.set(fileName, fileName); // Use filename as fallback ID
              this.uuidToFileMap.set(fileName, {
                filePath,
                fileName,
                directory: dir.type
              });
            }
          } catch (err) {
            console.warn(`Error processing file ${file}:`, err.message);
          }
        }
      } catch (err) {
        console.warn(`Error reading directory ${dir.path}:`, err.message);
      }
    }
  }

  /**
   * Resolve page identifier to UUID
   * @param {string} identifier - Page title, slug, UUID, or legacy filename
   * @returns {string|null} UUID if found, null otherwise
   */
  resolvePageIdentifier(identifier) {
    // Direct UUID lookup
    if (this.uuidToFileMap.has(identifier)) {
      return identifier;
    }
    
    // Title lookup
    if (this.titleToUuidMap.has(identifier)) {
      return this.titleToUuidMap.get(identifier);
    }
    
    // Slug lookup
    if (this.slugToUuidMap.has(identifier)) {
      return this.slugToUuidMap.get(identifier);
    }
    
    return null;
  }

  /**
   * Get all page names (titles for display)
   * @returns {Array<string>} Array of page titles
   */
  async getPageNames() {
    return Array.from(this.titleToUuidMap.keys());
  }

  /**
   * Check if page exists by any identifier
   * @param {string} identifier - Page title, slug, UUID, or legacy filename
   * @returns {boolean} True if page exists
   */
  async pageExists(identifier) {
    return this.resolvePageIdentifier(identifier) !== null;
  }

  /**
   * Get page content and metadata by any identifier
   * @param {string} identifier - Page title, slug, UUID, or legacy filename
   * @returns {Object} Page object with content and metadata
   */
  async getPage(identifier) {
    const uuid = this.resolvePageIdentifier(identifier);
    if (!uuid) {
      return null;
    }

    // Check cache first
    if (this.pageCache.has(uuid)) {
      return this.pageCache.get(uuid);
    }

    const fileInfo = this.uuidToFileMap.get(uuid);
    if (!fileInfo) {
      return null;
    }

    try {
      const fileContent = await fs.readFile(fileInfo.filePath, 'utf-8');
      const { data, content } = matter(fileContent);
      
      const pageData = {
        name: data.title || fileInfo.fileName,
        title: data.title || fileInfo.fileName,
        slug: data.slug || generateSlug(data.title || fileInfo.fileName),
        uuid: data.uuid || uuid,
        content: content,
        // Flatten common metadata properties to top level for easier access
        categories: data.categories || (data.category ? [data.category] : ['General']),
        'user-keywords': data['user-keywords'] || [],
        category: data.category || 'General',
        'system-category': data['system-category'] || (this.engine.getManager('ConfigurationManager')?.getProperty('amdwiki.default.system-category', 'general') || 'general'),
        lastModified: data.lastModified,
        metadata: data,
        filePath: fileInfo.filePath,
        isUuidBased: data.uuid === uuid
      };

      // Cache the result
      this.pageCache.set(uuid, pageData);
      
      return pageData;
    } catch (err) {
      console.error(`Error reading page ${identifier}:`, err);
      return null;
    }
  }

  /**
   * Check if a page is a required page
   * @param {string} identifier - Page identifier
   * @param {Object} metadata - Page metadata (optional, for checking category)
   * @returns {boolean} True if it's a required page
   */
  async isRequiredPage(identifier, metadata = null, user = null, content = '') {
    // Hardcoded required pages
    const hardcodedRequiredPages = ['Categories', 'Wiki Documentation'];
    
    // Check by title first
    if (hardcodedRequiredPages.includes(identifier)) {
      return true;
    }

    // Check if metadata indicates System category
    if (metadata) {
      // Check categories array (new format)
      if (metadata.categories && Array.isArray(metadata.categories)) {
        if (metadata.categories.includes('System')) {
          return true;
        }
      }
      // Check legacy single category format
      if (metadata.category === 'System') {
        return true;
      }
      // Check legacy system-category format
      if (metadata['system-category'] === 'System/Admin' || metadata['system-category'] === 'System') {
        return true;
      }
    }
    
    // Check ACL-based storage location if ACLManager is available
    try {
      const aclManager = this.engine.getManager('ACLManager');
      if (aclManager) {
        const storageDecision = await aclManager.checkStorageLocation(identifier, user, metadata, content);
        if (storageDecision.location === 'required') {
          return true;
        }
      }
    } catch (error) {
      // If ACL check fails, log but don't fail the operation
      console.warn('ACL storage location check failed:', error.message);
    }
    
    // If no metadata provided, check existing page
    if (!metadata) {
      try {
        const pageData = await this.getPage(identifier);
        if (pageData && pageData.metadata) {
          return await this.isRequiredPage(identifier, pageData.metadata, user, pageData.content);
        }
      } catch (err) {
        // If page doesn't exist yet, not a required page
        return false;
      }
    }
    
    return false;
  }

  /**
   * Save page with content and metadata
   * @param {string} identifier - Page identifier (title, slug, or UUID)
   * @param {string} content - Page content
   * @param {Object} metadata - Page metadata
   * @param {Object} user - User object (optional, for ACL-based storage decisions)
   * @returns {Object} Saved page information
   */
  async savePage(identifier, content, metadata = {}, user = null) {
    console.log('🔧 PageManager.savePage called:', { identifier, contentLength: content?.length, metadata: JSON.stringify(metadata), user: user?.username });
    try {
      const validationManager = this.engine.getManager('ValidationManager');
      
      // Ensure required metadata
      if (!metadata.uuid) {
        metadata.uuid = uuidv4();
      }
      
      if (!metadata.title) {
        // If identifier looks like a UUID, we need a proper title
        if (identifier.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
          throw new Error('Title is required when saving by UUID');
        }
        metadata.title = identifier;
      }
      
      if (!metadata.slug) {
        metadata.slug = generateSlug(metadata.title);
      }
      
      // Ensure required metadata fields with defaults
      if (!metadata['system-category']) {
        metadata['system-category'] = 'General';
      }
      if (!metadata['user-keywords']) {
        metadata['user-keywords'] = [];
      }

      // Add/update timestamp
      metadata.lastModified = new Date().toISOString();
      console.log('📅 Updated lastModified:', metadata.lastModified);

      // Generate the target filename using UUID
      const targetFilename = validationManager.generateFilename(metadata);
      console.log('📁 Generated filename:', targetFilename);

      // Validate the complete page before saving
      console.log('🔍 Starting page validation...');
      const validation = validationManager.validatePage(targetFilename, metadata, content);
      console.log('🔍 Validation result:', { success: validation.success, error: validation.error, warnings: validation.warnings?.length || 0 });
      if (!validation.success) {
        console.error('❌ Validation failed:', validation.error);
        throw new Error(`Page validation failed: ${validation.error}`);
      }
      console.log('✅ Validation passed');
      
      // Log warnings if any
      if (validation.warnings.length > 0) {
        console.warn('Page validation warnings:', validation.warnings);
      }

      // Determine the correct directory based on page type and metadata
      const isRequired = await this.isRequiredPage(identifier, metadata, user, content);
      const targetDir = isRequired ? this.requiredPagesDir : this.pagesDir;
      
      // Use validated UUID-based filename
      const filePath = path.join(targetDir, targetFilename);
      
      // Remove old file if page is moving between directories or filename changed
      const existingUuid = this.resolvePageIdentifier(identifier);
      if (existingUuid) {
        const oldFileInfo = this.uuidToFileMap.get(existingUuid);
        if (oldFileInfo && oldFileInfo.filePath !== filePath) {
          await fs.remove(oldFileInfo.filePath);
        }
      }

      // Save the file
      const newContent = matter.stringify(content, metadata);
      console.log('💾 About to write file:', { filePath, contentLength: newContent.length });
      await fs.writeFile(filePath, newContent);
      console.log('✅ File written successfully:', filePath);
      
      // Rebuild caches to include new/updated page
      await this.buildLookupCaches();
      
      // Update PageIndex if this isn't the PageIndex itself
      if (metadata.title !== 'PageIndex') {
        await this.updatePageIndex();
      }

      return { 
        success: true,
        name: metadata.title, 
        title: metadata.title,
        slug: metadata.slug,
        uuid: metadata.uuid,
        content, 
        metadata, 
        filePath 
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Delete a page by any identifier
   * @param {string} identifier - Page identifier
   * @returns {boolean} True if page was deleted
   */
  async deletePage(identifier) {
    const uuid = this.resolvePageIdentifier(identifier);
    if (!uuid) {
      return false;
    }

    const fileInfo = this.uuidToFileMap.get(uuid);
    if (!fileInfo) {
      return false;
    }

    try {
      await fs.remove(fileInfo.filePath);
      
      // Rebuild caches
      await this.buildLookupCaches();
      
      // Update PageIndex if this isn't the PageIndex itself
      const page = await this.getPage(identifier);
      if (page && page.title !== 'PageIndex') {
        await this.updatePageIndex();
      }
      
      return true;
    } catch (err) {
      console.error(`Error deleting page ${identifier}:`, err);
      return false;
    }
  }

  /**
   * Update the PageIndex.md file with current page list
   */
  async updatePageIndex() {
    try {
      // Check if PageIndex already exists
      let existingPageIndex = null;
      let existingUuid = null;
      
      for (const [title, uuid] of this.titleToUuidMap.entries()) {
        if (title === 'PageIndex') {
          existingPageIndex = this.uuidToFileMap.get(uuid);
          existingUuid = uuid;
          break;
        }
      }

      // Get all pages from both directories
      const allPages = [];
      
      for (const [title, uuid] of this.titleToUuidMap.entries()) {
        if (title !== 'PageIndex') {
          const fileInfo = this.uuidToFileMap.get(uuid);
          if (fileInfo) {
            allPages.push({
              title,
              uuid,
              directory: fileInfo.directory
            });
          }
        }
      }

      // Sort by title
      allPages.sort((a, b) => a.title.localeCompare(b.title));
      
      // Separate by directory
      const regularPages = allPages.filter(p => p.directory === 'regular');
      const requiredPages = allPages.filter(p => p.directory === 'required');

      // Generate the PageIndex content
      const timestamp = new Date().toISOString();
      const content = this.generatePageIndexContent(regularPages, requiredPages);
      
      // Create metadata for PageIndex
      const metadata = {
  title: 'PageIndex',
  slug: 'page-index',
  'system-category': 'System',
  'user-keywords': ['Navigation', 'Index'],
  uuid: existingUuid || uuidv4(), // Use existing UUID or generate new one
  lastModified: timestamp
      };

      // Write the PageIndex file (update existing or create new)
      const pageIndexPath = existingPageIndex 
        ? path.join(existingPageIndex.directory === 'required' ? this.requiredPagesDir : this.pagesDir, `${metadata.uuid}.md`)
        : path.join(this.requiredPagesDir, `${metadata.uuid}.md`);
      const pageIndexContent = matter.stringify(content, metadata);
      await fs.writeFile(pageIndexPath, pageIndexContent);
      
      // Rebuild caches to include updated PageIndex
      await this.buildLookupCaches();
      
    } catch (err) {
      console.error('Error updating PageIndex:', err);
    }
  }

  /**
   * Generate the content for PageIndex.md
   * @param {Array<Object>} regularPages - Pages from pages directory
   * @param {Array<Object>} requiredPages - Pages from required-pages directory
   * @returns {string} Generated content
   */
  generatePageIndexContent(regularPages, requiredPages) {
    const totalPages = regularPages.length + requiredPages.length + 1; // +1 for PageIndex itself
    
    let content = `# Page Index

This page contains an alphabetical listing of all pages in this wiki.

*This page is automatically updated when pages are created, modified, or deleted.*

---

## All Pages ([{$totalpages}] total)

`;

    // Add pages directory section
    if (regularPages.length > 0) {
      content += `### Pages Directory

`;
      for (const page of regularPages) {
        content += `- [${page.title}](../pages/${page.uuid})\n`;
      }
      content += '\n';
    }

    // Add required pages directory section
    if (requiredPages.length > 0) {
      content += `### Required Pages Directory

`;
      for (const page of requiredPages) {
        content += `- [${page.title}](${page.uuid})\n`;
      }
      // Add PageIndex reference
      content += `- [PageIndex](PageIndex) *(this page)*\n`;
      content += '\n';
    }

    content += `---

## Statistics

- **Total Pages**: [{$totalpages}]
- **Last Updated**: [{$timestamp}]
- **Categories Available**: See [Categories](Categories) page
- **System Variables**: [{$uptime}] uptime

---

*Note: This index is automatically maintained and reflects the current state of the wiki.*`;

    return content;
  }

  /**
   * Get all pages with metadata
   * @returns {Array<Object>} Array of page objects
   */
  async getAllPages() {
    const pages = [];
    
    for (const [title, uuid] of this.titleToUuidMap.entries()) {
      const page = await this.getPage(title);
      if (page) {
        pages.push(page);
      }
    }
    
    return pages;
  }

  /**
   * Generate template data without saving to disk
   * @param {string} pageName - Name of the new page
   * @param {string} templateName - Name of the template to use
   * @returns {Object} Template page object (not saved)
   */
  async generateTemplateData(pageName, templateName = 'default') {
    const templateManager = this.engine.getManager('TemplateManager');
    if (!templateManager) {
      throw new Error('TemplateManager not available');
    }

    const templateContent = await templateManager.getTemplate(templateName);
      const configManager = this.engine.getManager('ConfigurationManager');
      const defaultSystemCategory = configManager ?
        configManager.getProperty('amdwiki.default.system-category', 'general') :
        'general';

      const metadata = {
        title: pageName,
        slug: generateSlug(pageName),
        uuid: uuidv4(),
        created: new Date().toISOString(),
        'system-category': defaultSystemCategory,
        'user-keywords': []
      };

    return {
      title: pageName,
      content: templateContent,
      metadata: metadata,
      exists: false // Flag to indicate this is template data, not a saved page
    };
  }

  /**
   * Validate and fix all existing files to ensure UUID naming compliance
   * @param {Object} options - Validation options
   * @returns {Object} Validation summary report
   */
  async validateAndFixAllFiles(options = {}) {
    const validationManager = this.engine.getManager('ValidationManager');
    const dryRun = options.dryRun || false;
    const report = {
      totalFiles: 0,
      validFiles: 0,
      invalidFiles: 0,
      fixedFiles: 0,
      errors: [],
      warnings: [],
      fixes: []
    };

    const directories = [
      { path: this.pagesDir, type: 'regular' },
      { path: this.requiredPagesDir, type: 'required' }
    ];

    for (const dir of directories) {
      try {
        const files = await fs.readdir(dir.path);
        
        for (const file of files) {
          if (!file.endsWith('.md')) continue;
          
          report.totalFiles++;
          const filePath = path.join(dir.path, file);
          
          try {
            const fileContent = await fs.readFile(filePath, 'utf-8');
            const fileData = matter(fileContent);
            
            // Validate the file
            const validation = validationManager.validateExistingFile(filePath, fileData);
            
            if (validation.success) {
              report.validFiles++;
              if (validation.warnings.length > 0) {
                report.warnings.push(`${file}: ${validation.warnings.join(', ')}`);
              }
            } else {
              report.invalidFiles++;
              report.errors.push(`${file}: ${validation.error}`);
              
              if (validation.fixes) {
                const fixInfo = {
                  originalFile: file,
                  originalPath: filePath,
                  suggestedFilename: validation.fixes.filename,
                  suggestedMetadata: validation.fixes.metadata
                };
                
                report.fixes.push(fixInfo);
                
                if (!dryRun) {
                  try {
                    // Apply the fix
                    const newFilePath = path.join(dir.path, validation.fixes.filename);
                    const newContent = matter.stringify(fileData.content, validation.fixes.metadata);
                    
                    // Write new file
                    await fs.writeFile(newFilePath, newContent);
                    
                    // Remove old file if different
                    if (filePath !== newFilePath) {
                      await fs.remove(filePath);
                    }
                    
                    report.fixedFiles++;
                  } catch (fixError) {
                    report.errors.push(`Failed to fix ${file}: ${fixError.message}`);
                  }
                }
              }
            }
          } catch (err) {
            report.errors.push(`Error reading ${file}: ${err.message}`);
          }
        }
      } catch (err) {
        report.errors.push(`Error reading directory ${dir.path}: ${err.message}`);
      }
    }
    
    if (!dryRun && report.fixedFiles > 0) {
      // Rebuild caches after fixes
      await this.buildLookupCaches();
    }
    
    return report;
  }

  /**
   * Create page from template
   * @param {string} pageName - Name of the new page
   * @param {string} templateName - Name of the template to use
   * @returns {Object} Created page object
   */
  async createPageFromTemplate(pageName, templateName = 'default') {
    try {
      const templateManager = this.engine.getManager('TemplateManager');
      if (!templateManager) {
        throw new Error('TemplateManager not available');
      }

      const templateContent = await templateManager.getTemplate(templateName);
      const populatedContent = await templateManager.populateTemplate(templateContent, { pageName });
      const validationManager = this.engine.getManager('ValidationManager');
        const metadata = validationManager.generateValidMetadata(pageName, {
          'user-keywords': [],
          created: new Date().toISOString()
        });

      return await this.savePage(pageName, populatedContent, metadata);
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Get page by slug (for clean URL routing)
   * @param {string} slug - URL slug
   * @returns {Object|null} Page object or null
   */
  async getPageBySlug(slug) {
    const uuid = this.slugToUuidMap.get(slug);
    if (uuid) {
      return await this.getPage(uuid);
    }
    return null;
  }

  /**
   * Get page by UUID (for permanent links)
   * @param {string} uuid - Page UUID
   * @returns {Object|null} Page object or null
   */
  async getPageByUuid(uuid) {
    if (this.uuidToFileMap.has(uuid)) {
      return await this.getPage(uuid);
    }
    return null;
  }
}

module.exports = PageManager;
