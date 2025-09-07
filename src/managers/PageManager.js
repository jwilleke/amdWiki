const BaseManager = require('./BaseManager');
const fs = require('fs-extra');
const path = require('path');
const matter = require('gray-matter');
const { v4: uuidv4 } = require('uuid');

/**
 * PageManager - Handles all page operations
 * Similar to JSPWiki's PageManager
 */
class PageManager extends BaseManager {
  constructor(engine) {
    super(engine);
    this.pagesDir = null;
  }

  async initialize(config = {}) {
    await super.initialize(config);
    this.pagesDir = config.pagesDir || path.join(process.cwd(), 'pages');
    this.requiredPagesDir = config.requiredPagesDir || path.join(process.cwd(), 'required-pages');
    await fs.ensureDir(this.pagesDir);
    await fs.ensureDir(this.requiredPagesDir);
  }

  /**
   * Get all page names
   * @returns {Array<string>} Array of page names
   */
  async getPageNames() {
    try {
      const regularFiles = await fs.readdir(this.pagesDir);
      const requiredFiles = await fs.readdir(this.requiredPagesDir);
      
      const regularPages = regularFiles
        .filter(file => file.endsWith('.md'))
        .map(file => path.parse(file).name);
        
      const requiredPages = requiredFiles
        .filter(file => file.endsWith('.md'))
        .map(file => path.parse(file).name);
      
      return [...regularPages, ...requiredPages];
    } catch (err) {
      return [];
    }
  }

  /**
   * Check if page exists
   * @param {string} pageName - Name of the page
   * @returns {boolean} True if page exists
   */
  async pageExists(pageName) {
    const regularPath = path.join(this.pagesDir, `${pageName}.md`);
    const requiredPath = path.join(this.requiredPagesDir, `${pageName}.md`);
    return (await fs.pathExists(regularPath)) || (await fs.pathExists(requiredPath));
  }

  /**
   * Get page content and metadata
   * @param {string} pageName - Name of the page
   * @returns {Object} Page object with content and metadata
   */
  async getPage(pageName) {
    const regularPath = path.join(this.pagesDir, `${pageName}.md`);
    const requiredPath = path.join(this.requiredPagesDir, `${pageName}.md`);
    
    let filePath = regularPath;
    if (await fs.pathExists(regularPath)) {
      filePath = regularPath;
    } else if (await fs.pathExists(requiredPath)) {
      filePath = requiredPath;
    } else {
      return null;
    }

    const fileContent = await fs.readFile(filePath, 'utf-8');
    const { data, content } = matter(fileContent);
    
    return {
      name: pageName,
      content: content,
      metadata: data,
      filePath: filePath
    };
  }

  /**
   * Check if a page is a required page
   * @param {string} pageName - Name of the page
   * @param {Object} metadata - Page metadata (optional, for checking category)
   * @returns {boolean} True if it's a required page
   */
  async isRequiredPage(pageName, metadata = null) {
    // Hardcoded required pages
    const hardcodedRequiredPages = ['Categories', 'Wiki Documentation'];
    if (hardcodedRequiredPages.includes(pageName)) {
      return true;
    }
    
    // Check if metadata indicates System/Admin category
    if (metadata && metadata.category === 'System/Admin') {
      return true;
    }
    
    // If no metadata provided, check existing page
    if (!metadata) {
      try {
        const pageData = await this.getPage(pageName);
        if (pageData && pageData.metadata && pageData.metadata.category === 'System/Admin') {
          return true;
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
   * @param {string} pageName - Name of the page
   * @param {string} content - Page content
   * @param {Object} metadata - Page metadata
   */
  async savePage(pageName, content, metadata = {}) {
    // Ensure UUID exists
    if (!metadata.uuid) {
      metadata.uuid = uuidv4();
    }

    // Add/update timestamp
    metadata.lastModified = new Date().toISOString();

    // Determine the correct directory based on page type and metadata
    const isRequired = await this.isRequiredPage(pageName, metadata);
    const targetDir = isRequired ? this.requiredPagesDir : this.pagesDir;
    const filePath = path.join(targetDir, `${pageName}.md`);
    
    // If page is moving between directories, remove from old location
    const oldRegularPath = path.join(this.pagesDir, `${pageName}.md`);
    const oldRequiredPath = path.join(this.requiredPagesDir, `${pageName}.md`);
    
    if (isRequired && await fs.pathExists(oldRegularPath)) {
      // Moving from regular to required
      await fs.remove(oldRegularPath);
    } else if (!isRequired && await fs.pathExists(oldRequiredPath)) {
      // Moving from required to regular
      await fs.remove(oldRequiredPath);
    }

    const newContent = matter.stringify(content, metadata);
    await fs.writeFile(filePath, newContent);

    return { name: pageName, content, metadata, filePath };
  }

  /**
   * Delete a page
   * @param {string} pageName - Name of the page to delete
   */
  async deletePage(pageName) {
    const filePath = path.join(this.pagesDir, `${pageName}.md`);
    if (await fs.pathExists(filePath)) {
      await fs.remove(filePath);
      return true;
    }
    return false;
  }

  /**
   * Get all pages with metadata
   * @returns {Array<Object>} Array of page objects
   */
  async getAllPages() {
    const pageNames = await this.getPageNames();
    const pages = [];
    
    for (const pageName of pageNames) {
      const page = await this.getPage(pageName);
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
    const metadata = {
      uuid: uuidv4(),
      created: new Date().toISOString(),
      category: 'Uncategorized'
    };

    return {
      title: pageName,
      content: templateContent,
      metadata: metadata,
      exists: false // Flag to indicate this is template data, not a saved page
    };
  }

  /**
   * Create page from template
   * @param {string} pageName - Name of the new page
   * @param {string} templateName - Name of the template to use
   * @returns {Object} Created page object
   */
  async createPageFromTemplate(pageName, templateName = 'default') {
    const templateManager = this.engine.getManager('TemplateManager');
    if (!templateManager) {
      throw new Error('TemplateManager not available');
    }

    const templateContent = await templateManager.getTemplate(templateName);
    const metadata = {
      uuid: uuidv4(),
      created: new Date().toISOString(),
      category: 'Uncategorized'
    };

    return await this.savePage(pageName, templateContent, metadata);
  }
}

module.exports = PageManager;
