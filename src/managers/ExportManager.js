const BaseManager = require('./BaseManager');
const fs = require('fs').promises;
const path = require('path');
const LocaleUtils = require('../utils/LocaleUtils');

/**
 * ExportManager - Handles page exports (HTML, PDF, etc.)
 * Similar to JSPWiki's export functionality
 */
class ExportManager extends BaseManager {
  constructor(engine) {
    super(engine);
    this.exportDirectory = './exports';
    this.supportedFormats = ['html', 'pdf', 'markdown'];
  }

  async initialize(config = {}) {
    await super.initialize(config);
    
    this.exportDirectory = config.exportDirectory || './exports';
    
    // Create exports directory
    await fs.mkdir(this.exportDirectory, { recursive: true });
    
    console.log('📦 ExportManager initialized');
  }

  /**
   * Export a single page to HTML
   * @param {string} pageName - Page name to export
   * @returns {string} HTML content
   */
  async exportPageToHtml(pageName, user = null) {
    const pageManager = this.engine.getManager('PageManager');
    const renderingManager = this.engine.getManager('RenderingManager');
    
    const page = await pageManager.getPage(pageName);
    if (!page) {
      throw new Error(`Page '${pageName}' not found`);
    }
    
    // Render the page content (without user context for exports)
    const renderedContent = renderingManager.renderMarkdown(page.content, pageName, null);
    
    // Create full HTML document
    const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${pageName} - amdWiki Export</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
            max-width: 800px;
            margin: 0 auto;
            padding: 2rem;
            line-height: 1.6;
        }
        h1, h2, h3, h4, h5, h6 {
            color: #333;
            margin-top: 2rem;
            margin-bottom: 1rem;
        }
        pre {
            background: #f8f9fa;
            padding: 1rem;
            border-radius: 4px;
            overflow-x: auto;
        }
        code {
            background: #f8f9fa;
            padding: 0.2rem 0.4rem;
            border-radius: 3px;
            font-size: 0.9em;
        }
        blockquote {
            border-left: 4px solid #ddd;
            padding-left: 1rem;
            margin-left: 0;
            color: #666;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin: 1rem 0;
        }
        th, td {
            border: 1px solid #ddd;
            padding: 0.75rem;
            text-align: left;
        }
        th {
            background: #f8f9fa;
            font-weight: 600;
        }
        .export-meta {
            border-top: 1px solid #eee;
            margin-top: 3rem;
            padding-top: 1rem;
            color: #666;
            font-size: 0.9em;
        }
    </style>
</head>
<body>
    <h1>${pageName}</h1>
    ${renderedContent}
    
    <div class="export-meta">
        <p>Exported from amdWiki on ${this.getFormattedTimestamp(user)}</p>
        <p>Last modified: ${page.lastModified || 'Unknown'}</p>
    ${page['system-category'] ? `<p>System Category: ${page['system-category']}</p>` : ''}
    ${page['user-keywords'] && page['user-keywords'].length > 0 ? `<p>User Keywords: ${page['user-keywords'].join(', ')}</p>` : ''}
    </div>
</body>
</html>`;
    
    return html;
  }

  /**
   * Export multiple pages to a single HTML file
   * @param {Array} pageNames - Array of page names
   * @returns {string} Combined HTML content
   */
  async exportPagesToHtml(pageNames, user = null) {
    const pageManager = this.engine.getManager('PageManager');
    const renderingManager = this.engine.getManager('RenderingManager');
    
    let combinedContent = '';
    const validPages = [];
    
    for (const pageName of pageNames) {
      const page = await pageManager.getPage(pageName);
      if (page) {
        const renderedContent = renderingManager.renderMarkdown(page.content, pageName, null);
        combinedContent += `
          <div class="page-section" id="page-${pageName.replace(/[^a-zA-Z0-9]/g, '-')}">
            <h1>${pageName}</h1>
            ${renderedContent}
            <hr style="margin: 3rem 0; border: none; border-top: 1px solid #eee;">
          </div>
        `;
        validPages.push({ name: pageName, ...page });
      }
    }
    
    // Create table of contents
    const toc = validPages.map(page => 
      `<li><a href="#page-${page.name.replace(/[^a-zA-Z0-9]/g, '-')}">${page.name}</a></li>`
    ).join('\n');
    
    const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>amdWiki Export - ${validPages.length} Pages</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
            max-width: 900px;
            margin: 0 auto;
            padding: 2rem;
            line-height: 1.6;
        }
        .toc {
            background: #f8f9fa;
            padding: 2rem;
            border-radius: 8px;
            margin-bottom: 3rem;
        }
        .toc h2 {
            margin-top: 0;
        }
        .toc ul {
            columns: 2;
            column-gap: 2rem;
        }
        .page-section {
            margin-bottom: 4rem;
        }
        h1, h2, h3, h4, h5, h6 {
            color: #333;
            margin-top: 2rem;
            margin-bottom: 1rem;
        }
        pre {
            background: #f8f9fa;
            padding: 1rem;
            border-radius: 4px;
            overflow-x: auto;
        }
        code {
            background: #f8f9fa;
            padding: 0.2rem 0.4rem;
            border-radius: 3px;
            font-size: 0.9em;
        }
        blockquote {
            border-left: 4px solid #ddd;
            padding-left: 1rem;
            margin-left: 0;
            color: #666;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin: 1rem 0;
        }
        th, td {
            border: 1px solid #ddd;
            padding: 0.75rem;
            text-align: left;
        }
        th {
            background: #f8f9fa;
            font-weight: 600;
        }
        .export-meta {
            border-top: 1px solid #eee;
            margin-top: 3rem;
            padding-top: 1rem;
            color: #666;
            font-size: 0.9em;
        }
        @media print {
            .page-section {
                break-inside: avoid;
            }
        }
    </style>
</head>
<body>
    <div class="toc">
        <h2>Table of Contents</h2>
        <ul>
            ${toc}
        </ul>
        <p><strong>${validPages.length}</strong> pages exported on ${this.getFormattedTimestamp(user)}</p>
    </div>
    
    ${combinedContent}
    
    <div class="export-meta">
        <p>Exported from amdWiki on ${this.getFormattedTimestamp(user)}</p>
        <p>Total pages: ${validPages.length}</p>
    </div>
</body>
</html>`;
    
    return html;
  }

  /**
   * Export page(s) to markdown
   * @param {string|Array} pageNames - Single page name or array of page names
   * @returns {string} Markdown content
   */
  async exportToMarkdown(pageNames, user = null) {
    const pageManager = this.engine.getManager('PageManager');
    const names = Array.isArray(pageNames) ? pageNames : [pageNames];
    
    let markdown = '';
    
    if (names.length > 1) {
      markdown += `# amdWiki Export\n\n`;
      markdown += `*Exported on ${this.getFormattedTimestamp(user)}*\n\n`;
      markdown += `## Table of Contents\n\n`;
      
      for (const pageName of names) {
        markdown += `- [${pageName}](#${pageName.toLowerCase().replace(/[^a-z0-9]/g, '-')})\n`;
      }
      markdown += '\n---\n\n';
    }
    
    for (const pageName of names) {
      const page = await pageManager.getPage(pageName);
      if (page) {
        if (names.length > 1) {
          markdown += `# ${pageName}\n\n`;
        }
        markdown += page.content;
        if (names.length > 1) {
          markdown += '\n\n---\n\n';
        }
      }
    }
    
    return markdown;
  }

  /**
   * Save export to file
   * @param {string} content - Content to save
   * @param {string} filename - Filename
   * @param {string} format - File format
   * @returns {string} File path
   */
  async saveExport(content, filename, format) {
    const sanitizedFilename = filename.replace(/[^a-zA-Z0-9\-_]/g, '-');
    const timestamp = new Date().toISOString().slice(0, 10);
    const fullFilename = `${sanitizedFilename}_${timestamp}.${format}`;
    const filePath = path.join(this.exportDirectory, fullFilename);
    
    await fs.writeFile(filePath, content, 'utf8');
    
    console.log(`📦 Exported to: ${fullFilename}`);
    return filePath;
  }

  /**
   * Get list of available exports
   * @returns {Array} List of export files
   */
  async getExports() {
    try {
      const files = await fs.readdir(this.exportDirectory);
      const exports = [];
      
      for (const file of files) {
        const filePath = path.join(this.exportDirectory, file);
        const stats = await fs.stat(filePath);
        
        exports.push({
          filename: file,
          path: filePath,
          size: stats.size,
          created: stats.birthtime,
          modified: stats.mtime
        });
      }
      
      return exports.sort((a, b) => b.created - a.created);
    } catch (err) {
      console.error('Error getting exports:', err);
      return [];
    }
  }

  /**
   * Delete an export file
   * @param {string} filename - Export filename
   */
  async deleteExport(filename) {
    const filePath = path.join(this.exportDirectory, filename);
    await fs.unlink(filePath);
    console.log(`📦 Deleted export: ${filename}`);
  }

  /**
   * Get formatted timestamp using user's locale
   * @param {object} user - User object (optional)
   * @returns {string} Formatted timestamp
   */
  getFormattedTimestamp(user = null) {
    const date = new Date();

    if (user && user.preferences && user.preferences.locale) {
      return LocaleUtils.formatDate(date, user.preferences.locale) + ' ' +
             LocaleUtils.formatTime(date, user.preferences.locale);
    }

    // Fallback to system default
    return date.toLocaleString();
  }
}

module.exports = ExportManager;
