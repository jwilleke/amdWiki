const BaseManager = require('./BaseManager');
const fs = require('fs').promises;
const path = require('path');

/**
 * TemplateManager - Handles page templates and themes
 * Similar to JSPWiki's TemplateManager
 */
class TemplateManager extends BaseManager {
  constructor(engine) {
    super(engine);
    this.templates = {};
    this.themes = {};
    this.templatesDirectory = './templates';
    this.themesDirectory = './themes';
  }

  async initialize(config = {}) {
    await super.initialize(config);
    
    // Set directories from config
    this.templatesDirectory = config.templatesDirectory || './templates';
    this.themesDirectory = config.themesDirectory || './themes';
    
    // Load templates and themes
    await this.loadTemplates();
    await this.loadThemes();
    
    console.log('✅ TemplateManager initialized');
  }

  /**
   * Load all page templates
   */
  async loadTemplates() {
    try {
      // Create templates directory if it doesn't exist
      await fs.mkdir(this.templatesDirectory, { recursive: true });
      
      // Create default templates if none exist
      await this.createDefaultTemplates();
      
      const templateFiles = await fs.readdir(this.templatesDirectory);
      
      for (const file of templateFiles) {
        if (file.endsWith('.md')) {
          const templateName = path.basename(file, '.md');
          const templatePath = path.join(this.templatesDirectory, file);
          const content = await fs.readFile(templatePath, 'utf8');
          
          this.templates[templateName] = {
            name: templateName,
            content: content,
            path: templatePath
          };
        }
      }
      
      console.log(`📋 Loaded ${Object.keys(this.templates).length} page templates`);
    } catch (err) {
      console.error('Failed to load templates:', err);
    }
  }

  /**
   * Load all themes
   */
  async loadThemes() {
    try {
      // Create themes directory if it doesn't exist
      await fs.mkdir(this.themesDirectory, { recursive: true });
      
      // Create default theme if none exist
      await this.createDefaultTheme();
      
      const themeFiles = await fs.readdir(this.themesDirectory);
      
      for (const file of themeFiles) {
        if (file.endsWith('.css')) {
          const themeName = path.basename(file, '.css');
          const themePath = path.join(this.themesDirectory, file);
          const content = await fs.readFile(themePath, 'utf8');
          
          this.themes[themeName] = {
            name: themeName,
            content: content,
            path: themePath
          };
        }
      }
      
      console.log(`🎨 Loaded ${Object.keys(this.themes).length} themes`);
    } catch (err) {
      console.error('Failed to load themes:', err);
    }
  }

  /**
   * Create default page templates
   */
  async createDefaultTemplates() {
    const defaultTemplates = {
      'default':
        '---\n' +
        'uuid: {{uuid}}\n' +
        'system-category: {{systemCategory}}\n' +
        'user-keywords: {{userKeywords}}\n' +
        '---\n' +
        '# [{$pagename}]\n\n' +
        '## Overview\n\n' +
        '[{$pagename}] is...\n\n' +
        '## Content\n\n' +
        'Add your content here.\n\n' +
        '## More Information\n\n' +
        'There might be more information for this subject on one of the following:\n' +
        '[{ReferringPagesPlugin before="*" after="\\n" }]\n',
      'documentation':
        '---\n' +
        'uuid: {{uuid}}\n' +
        'system-category: Wiki Documentation (Documentation and Hints for this Wiki)\n' +
        'user-keywords: []\n' +
        '---\n' +
        '# [{$pagename}]\n\n' +
        '## Purpose\n\n' +
        'This document describes...\n\n' +
        '## Instructions\n\n' +
        '1. Step one\n' +
        '2. Step two\n' +
        '3. Step three\n\n' +
        '## Examples\n\n' +
        '### Example 1\n\n' +
        '    Example code or content here\n\n' +
        '## See Also\n\n' +
        '- [Related Page]\n' +
        '- [Another Related Page]\n\n' +
        '## More Information\n\n' +
        'There might be more information for this subject on one of the following:\n' +
        '[{ReferringPagesPlugin before="*" after="\\n" }]\n',
      'category':
        '---\n' +
        'uuid: {{uuid}}\n' +
        'system-category: Wiki Documentation (Documentation and Hints for this Wiki)\n' +
        'user-keywords: []\n' +
        '---\n' +
        '# [{$pagename}]\n\n' +
        '## Overview\n\n' +
        '[{$pagename}] contains pages related to...\n\n' +
        '## Subcategories\n\n' +
        '* Subcategory 1 (Description of subcategory)\n' +
        '* Subcategory 2 (Description of subcategory)\n' +
        '* Subcategory 3 (Description of subcategory)\n\n' +
        '## Pages in this Category\n\n' +
        'This section will automatically show pages that use this category.\n\n' +
        '## More Information\n\n' +
        'There might be more information for this subject on one of the following:\n' +
        '[{ReferringPagesPlugin before="*" after="\\n" }]\n',
      'meeting-notes':
        '---\n' +
        'uuid: {{uuid}}\n' +
        'system-category: {{systemCategory}}\n' +
        'user-keywords: [{{userKeywords}}]\n' +
        '---\n' +
        '# [{$pagename}]\n\n' +
        '**Date:** {{date}}  \n' +
        '**Attendees:** \n' +
        '**Location:** \n\n' +
        '## Agenda\n\n' +
        '1. Item 1\n' +
        '2. Item 2\n' +
        '3. Item 3\n\n' +
        '### Topic 1\n\n' +
        '### Topic 2\n\n' +
        '### Topic 3\n\n' +
        '## Action Items\n\n' +
        '- [ ] Action item 1 - Assigned to: [Person]\n' +
        '- [ ] Action item 2 - Assigned to: [Person]\n' +
        '- [ ] Action item 3 - Assigned to: [Person]\n' +
        '## Next Meeting\n\n' +
        '**Date:** TBD  \n' +
        '**Location:** TBD\n\n' +
        '## More Information\n\n' +
        'There might be more information for this subject on one of the following:\n' +
        '[{ReferringPagesPlugin before="*" after="\\n" }]\n'
    };

    for (const [templateName, content] of Object.entries(defaultTemplates)) {
      const templatePath = path.join(this.templatesDirectory, `${templateName}.md`);
      
      try {
        await fs.access(templatePath);
        // Template exists, skip
      } catch (err) {
        // Template doesn't exist, create it
        await fs.writeFile(templatePath, content, 'utf8');
        console.log(`📋 Created default template: ${templateName}`);
      }
    }
  }

  /**
   * Create default theme
   */
  async createDefaultTheme() {
    const defaultThemeCSS = `/* amdWiki Default Theme */

:root {
  --primary-color: #007bff;
  --secondary-color: #6c757d;
  --success-color: #28a745;
  --warning-color: #ffc107;
  --danger-color: #dc3545;
  --info-color: #17a2b8;
  --light-color: #f8f9fa;
  --dark-color: #343a40;
  
  --wiki-link-color: #0066cc;
  --wiki-link-hover: #004499;
  --wiki-missing-link: #cc0000;
}

.wikipage {
  color: var(--wiki-link-color);
  text-decoration: none;
  border-bottom: 1px dotted var(--wiki-link-color);
}

.wikipage:hover {
  color: var(--wiki-link-hover);
  text-decoration: none;
  border-bottom: 1px solid var(--wiki-link-hover);
}

.wiki-missing {
  color: var(--wiki-missing-link);
  text-decoration: none;
  border-bottom: 1px dotted var(--wiki-missing-link);
}

.search-highlight mark {
  background-color: #fff3cd;
  color: #856404;
  padding: 0.1em 0.2em;
  border-radius: 0.2em;
}

.page-metadata {
  background: var(--light-color);
  border: 1px solid #dee2e6;
  border-radius: 0.25rem;
  padding: 1rem;
  margin-bottom: 1rem;
}

.page-metadata .badge {
  margin-right: 0.5rem;
  margin-bottom: 0.25rem;
}

.referring-pages {
  margin-top: 2rem;
  padding-top: 1rem;
  border-top: 1px solid #dee2e6;
}

.category-badge {
  background-color: var(--info-color);
}

.keyword-badge {
  background-color: var(--secondary-color);
}

/* Template selector styling */
.template-selector {
  background: var(--light-color);
  border: 1px solid #dee2e6;
  border-radius: 0.25rem;
  padding: 1rem;
  margin-bottom: 1rem;
}

.template-option {
  margin-bottom: 0.5rem;
}

.template-option input[type="radio"] {
  margin-right: 0.5rem;
}

.template-preview {
  background: #ffffff;
  border: 1px solid #dee2e6;
  border-radius: 0.25rem;
  padding: 1rem;
  margin-top: 1rem;
  max-height: 200px;
  overflow-y: auto;
}
`;

    const themePath = path.join(this.themesDirectory, 'default.css');
    
    try {
      await fs.access(themePath);
      // Theme exists, skip
    } catch (err) {
      // Theme doesn't exist, create it
      await fs.writeFile(themePath, defaultThemeCSS, 'utf8');
      console.log(`🎨 Created default theme`);
    }
  }

  /**
   * Get available templates
   * @returns {Array<Object>} Available templates
   */
  getTemplates() {
    return Object.values(this.templates);
  }

  /**
   * Get a specific template
   * @param {string} templateName - Template name
   * @returns {Object|null} Template object or null
   */
  getTemplate(templateName) {
    return this.templates[templateName] || null;
  }

  /**
   * Apply template to create page content
   * @param {string} templateName - Template to use
   * @param {Object} variables - Variables to substitute
   * @returns {string} Generated content
   */
  applyTemplate(templateName, variables = {}) {
    const template = this.getTemplate(templateName);
    if (!template) {
      throw new Error(`Template '${templateName}' not found`);
    }

    let content = template.content;
    
    // Default variables
    const defaultVars = {
      uuid: this.generateUUID(),
      date: new Date().toISOString().split('T')[0],
      timestamp: new Date().toISOString(),
      pageName: variables.pageName || 'New Page',
      category: variables.category || '',
      userKeywords: Array.isArray(variables.userKeywords) 
        ? variables.userKeywords.join(', ') 
        : (variables.userKeywords || '')
    };

    // Merge with provided variables
    const allVars = { ...defaultVars, ...variables };

    // Replace template variables
    for (const [key, value] of Object.entries(allVars)) {
      const regex = new RegExp(`{{${key}}}`, 'g');
      content = content.replace(regex, value);
    }

    return content;
  }

  /**
   * Generate UUID for pages
   * @returns {string} UUID
   */
  generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c == 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

  /**
   * Get available themes
   * @returns {Array<Object>} Available themes
   */
  getThemes() {
    return Object.values(this.themes);
  }

  /**
   * Get a specific theme
   * @param {string} themeName - Theme name
   * @returns {Object|null} Theme object or null
   */
  getTheme(themeName) {
    return this.themes[themeName] || null;
  }

  /**
   * Create a new template
   * @param {string} templateName - Template name
   * @param {string} content - Template content
   */
  async createTemplate(templateName, content) {
    const templatePath = path.join(this.templatesDirectory, `${templateName}.md`);
    await fs.writeFile(templatePath, content, 'utf8');
    
    this.templates[templateName] = {
      name: templateName,
      content: content,
      path: templatePath
    };
    
    console.log(`📋 Created template: ${templateName}`);
  }

  /**
   * Create a new theme
   * @param {string} themeName - Theme name
   * @param {string} content - CSS content
   */
  async createTheme(themeName, content) {
    const themePath = path.join(this.themesDirectory, `${themeName}.css`);
    await fs.writeFile(themePath, content, 'utf8');
    
    this.themes[themeName] = {
      name: themeName,
      content: content,
      path: themePath
    };
    
    console.log(`🎨 Created theme: ${themeName}`);
  }

  /**
   * Get template suggestions based on page name or category
   * @param {string} pageName - Page name
   * @param {string} category - Page category
   * @returns {Array<string>} Suggested template names
   */
  suggestTemplates(pageName, category) {
    const suggestions = [];
    
    // Category-based suggestions
    if (category) {
      if (category.toLowerCase().includes('documentation')) {
        suggestions.push('documentation');
      }
      if (category.toLowerCase().includes('category')) {
        suggestions.push('category');
      }
    }
    
    // Name-based suggestions
    if (pageName) {
      const name = pageName.toLowerCase();
      if (name.includes('meeting') || name.includes('notes')) {
        suggestions.push('meeting-notes');
      }
      if (name.includes('category') || name.includes('categories')) {
        suggestions.push('category');
      }
      if (name.includes('doc') || name.includes('help') || name.includes('guide')) {
        suggestions.push('documentation');
      }
    }
    
    // Always include default
    if (!suggestions.includes('default')) {
      suggestions.push('default');
    }
    
    return suggestions;
  }
}

module.exports = TemplateManager;
