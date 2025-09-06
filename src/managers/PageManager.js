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
    await fs.ensureDir(this.pagesDir);
  }

  /**
   * Get all page names
   * @returns {Array<string>} Array of page names
   */
  async getPageNames() {
    try {
      const files = await fs.readdir(this.pagesDir);
      return files
        .filter(file => file.endsWith('.md'))
        .map(file => path.parse(file).name);
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
    const filePath = path.join(this.pagesDir, `${pageName}.md`);
    return await fs.pathExists(filePath);
  }

  /**
   * Get page content and metadata
   * @param {string} pageName - Name of the page
   * @returns {Object} Page object with content and metadata
   */
  async getPage(pageName) {
    const filePath = path.join(this.pagesDir, `${pageName}.md`);
    
    if (!(await fs.pathExists(filePath))) {
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
   * Save page with content and metadata
   * @param {string} pageName - Name of the page
   * @param {string} content - Page content
   * @param {Object} metadata - Page metadata
   */
  async savePage(pageName, content, metadata = {}) {
    const filePath = path.join(this.pagesDir, `${pageName}.md`);
    
    // Ensure UUID exists
    if (!metadata.uuid) {
      metadata.uuid = uuidv4();
    }

    // Add/update timestamp
    metadata.lastModified = new Date().toISOString();

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
