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
    
    // Generate/update PageIndex on startup
    await this.updatePageIndex();
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
    
    // Check if metadata indicates System category
    if (metadata) {
      // Check singular category field
      if (metadata.category === 'System/Admin' || metadata.category === 'System') {
        return true;
      }
      
      // Check plural categories array
      if (metadata.categories && Array.isArray(metadata.categories)) {
        if (metadata.categories.includes('System') || metadata.categories.includes('System/Admin')) {
          return true;
        }
      }
    }
    
    // If no metadata provided, check existing page
    if (!metadata) {
      try {
        const pageData = await this.getPage(pageName);
        if (pageData && pageData.metadata) {
          // Check singular category field
          if (pageData.metadata.category === 'System/Admin' || pageData.metadata.category === 'System') {
            return true;
          }
          
          // Check plural categories array
          if (pageData.metadata.categories && Array.isArray(pageData.metadata.categories)) {
            if (pageData.metadata.categories.includes('System') || pageData.metadata.categories.includes('System/Admin')) {
              return true;
            }
          }
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

    // Update PageIndex if this isn't the PageIndex itself
    if (pageName !== 'PageIndex') {
      await this.updatePageIndex();
    }

    return { name: pageName, content, metadata, filePath };
  }

  /**
   * Delete a page
   * @param {string} pageName - Name of the page to delete
   */
  async deletePage(pageName) {
    let deleted = false;
    
    // Try deleting from pages directory
    const regularPath = path.join(this.pagesDir, `${pageName}.md`);
    if (await fs.pathExists(regularPath)) {
      await fs.remove(regularPath);
      deleted = true;
    }
    
    // Try deleting from required-pages directory
    const requiredPath = path.join(this.requiredPagesDir, `${pageName}.md`);
    if (await fs.pathExists(requiredPath)) {
      await fs.remove(requiredPath);
      deleted = true;
    }
    
    // Update PageIndex if this isn't the PageIndex itself and something was deleted
    if (deleted && pageName !== 'PageIndex') {
      await this.updatePageIndex();
    }
    
    return deleted;
  }

  /**
   * Update the PageIndex.md file with current page list
   */
  async updatePageIndex() {
    try {
      // Get all pages from both directories
      const regularFiles = await fs.readdir(this.pagesDir);
      const requiredFiles = await fs.readdir(this.requiredPagesDir);
      
      const regularPages = regularFiles
        .filter(file => file.endsWith('.md'))
        .map(file => path.parse(file).name)
        .sort();
        
      const requiredPages = requiredFiles
        .filter(file => file.endsWith('.md') && path.parse(file).name !== 'PageIndex')
        .map(file => path.parse(file).name)
        .sort();

      // Generate the PageIndex content
      const timestamp = new Date().toISOString();
      const content = this.generatePageIndexContent(regularPages, requiredPages);
      
      // Create metadata for PageIndex
      const metadata = {
        title: 'PageIndex',
        category: 'System',
        categories: ['System', 'Navigation', 'Index'],
        'user-keywords': [],
        uuid: 'pageindex-system-generated',
        lastModified: timestamp
      };

      // Write the PageIndex file
      const pageIndexPath = path.join(this.requiredPagesDir, 'PageIndex.md');
      const pageIndexContent = matter.stringify(content, metadata);
      await fs.writeFile(pageIndexPath, pageIndexContent);
      
    } catch (err) {
      console.error('Error updating PageIndex:', err);
    }
  }

  /**
   * Generate the content for PageIndex.md
   * @param {Array<string>} regularPages - Pages from pages directory
   * @param {Array<string>} requiredPages - Pages from required-pages directory
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
        const encodedPage = encodeURIComponent(page);
        content += `- [${page}](../pages/${encodedPage})\n`;
      }
      content += '\n';
    }

    // Add required pages directory section
    if (requiredPages.length > 0) {
      content += `### Required Pages Directory

`;
      for (const page of requiredPages) {
        const encodedPage = encodeURIComponent(page);
        content += `- [${page}](${encodedPage})\n`;
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
