const BaseManager = require('./BaseManager');
const showdown = require('showdown');
const { LinkParser } = require('../parsers/LinkParser');

/**
 * RenderingManager - Handles markdown rendering and macro expansion
 * Similar to JSPWiki's RenderingManager
 */
class RenderingManager extends BaseManager {
  constructor(engine) {
    super(engine);
    this.converter = null;
    this.linkGraph = {};
    this.linkParser = new LinkParser();
  }

  async initialize(config = {}) {
    await super.initialize(config);
    
    // Load modular rendering configuration
    await this.loadRenderingConfiguration();
    
    // Initialize Showdown converter with table support
    this.converter = new showdown.Converter({
      tables: true,
      strikethrough: true,
      tasklists: true,
      simpleLineBreaks: true,
      openLinksInNewWindow: false,
      backslashEscapesHTMLTags: true
    });
    
    // Build initial link graph
    await this.buildLinkGraph();

    // Initialize LinkParser with page names
    await this.initializeLinkParser();

    console.log('✅ RenderingManager initialized');
    console.log(`🔧 Advanced parser: ${this.renderingConfig.useAdvancedParser ? 'enabled' : 'disabled'}`);
    console.log(`🔄 Legacy fallback: ${this.renderingConfig.fallbackToLegacy ? 'enabled' : 'disabled'}`);
  }

  /**
   * Load modular rendering configuration from app-default/custom-config.json
   */
  async loadRenderingConfiguration() {
    const configManager = this.engine.getManager('ConfigurationManager');
    
    // Default configuration
    this.renderingConfig = {
      useAdvancedParser: true,
      fallbackToLegacy: true,
      integration: true,
      performanceComparison: false,
      logParsingMethod: true // Enable debug logging to see which parser is used
    };

    // Load from configuration if available
    if (configManager) {
      try {
        this.renderingConfig.useAdvancedParser = configManager.getProperty('amdwiki.markup.useAdvancedParser', this.renderingConfig.useAdvancedParser);
        this.renderingConfig.fallbackToLegacy = configManager.getProperty('amdwiki.markup.fallbackToLegacy', this.renderingConfig.fallbackToLegacy);
        this.renderingConfig.integration = configManager.getProperty('amdwiki.markup.integration.renderingManager', this.renderingConfig.integration);
        this.renderingConfig.performanceComparison = configManager.getProperty('amdwiki.markup.performanceComparison', this.renderingConfig.performanceComparison);
        this.renderingConfig.logParsingMethod = configManager.getProperty('amdwiki.markup.logParsingMethod', this.renderingConfig.logParsingMethod);
      } catch (error) {
        console.warn('⚠️  Failed to load RenderingManager configuration, using defaults:', error.message);
      }
    }
  }

  /**
   * Render markdown content to HTML with MarkupParser integration
   * @param {string} content - Markdown content
   * @param {string} pageName - Current page name
   * @param {object} userContext - User context for authentication variables
   * @param {object} requestInfo - Request information
   * @returns {Promise<string>} Rendered HTML
   */
  async renderMarkdown(content, pageName, userContext = null, requestInfo = null) {
    if (!content) return '';

    // Check if MarkupParser integration is enabled and MarkupParser is available
    const markupParser = this.engine.getManager('MarkupParser');
    const markupParserAvailable = markupParser && typeof markupParser.isInitialized === 'function' && markupParser.isInitialized();
    const useAdvancedParser = this.renderingConfig.useAdvancedParser && markupParserAvailable;

    // Debug logging to identify the issue
    if (this.renderingConfig.logParsingMethod) {
      console.log(`🔍 RenderingManager.renderMarkdown debug for ${pageName}:`);
      console.log(`   useAdvancedParser config: ${this.renderingConfig.useAdvancedParser}`);
      console.log(`   MarkupParser available: ${!!markupParser}`);
      console.log(`   MarkupParser initialized: ${markupParserAvailable}`);
      console.log(`   Final decision: ${useAdvancedParser ? 'AdvancedParser' : 'LegacyParser'}`);
    }

    if (useAdvancedParser) {
      return await this.renderWithAdvancedParser(content, pageName, userContext, requestInfo);
    } else {
      return await this.renderWithLegacyParser(content, pageName, userContext, requestInfo);
    }
  }

  /**
   * Render content using the advanced MarkupParser system
   * @param {string} content - Content to render
   * @param {string} pageName - Page name
   * @param {object} userContext - User context
   * @param {object} requestInfo - Request information
   * @returns {Promise<string>} Rendered HTML
   */
  async renderWithAdvancedParser(content, pageName, userContext, requestInfo) {
    if (this.renderingConfig.logParsingMethod) {
      console.log(`🔧 Rendering ${pageName} with AdvancedParser (MarkupParser)`);
    }

    const startTime = Date.now();
    
    try {
      const markupParser = this.engine.getManager('MarkupParser');
      
      // Create comprehensive context for MarkupParser
      const parseContext = {
        pageName: pageName,
        userName: userContext?.username || userContext?.userName || 'anonymous',
        userContext: userContext,
        requestInfo: requestInfo,
        renderingManager: this // Provide access to legacy methods if needed
      };

      // Use MarkupParser for complete processing
      const result = await markupParser.parse(content, parseContext);
      
      // Performance comparison if enabled
      if (this.renderingConfig.performanceComparison) {
        await this.performPerformanceComparison(content, pageName, userContext, requestInfo, Date.now() - startTime);
      }

      return result;

    } catch (error) {
      console.error('❌ AdvancedParser rendering failed:', error.message);
      
      // Fallback to legacy parser if configured
      if (this.renderingConfig.fallbackToLegacy) {
        console.log('🔄 Falling back to legacy rendering for', pageName);
        return await this.renderWithLegacyParser(content, pageName, userContext, requestInfo);
      }
      
      throw error;
    }
  }

  /**
   * Render content using the legacy rendering system (backward compatibility)
   * @param {string} content - Content to render
   * @param {string} pageName - Page name
   * @param {object} userContext - User context
   * @param {object} requestInfo - Request information
   * @returns {Promise<string>} Rendered HTML
   */
  async renderWithLegacyParser(content, pageName, userContext, requestInfo) {
    if (this.renderingConfig.logParsingMethod) {
      console.log(`🔧 Rendering ${pageName} with LegacyParser (Original RenderingManager)`);
    }

    // Original rendering pipeline (preserved for backward compatibility)
    
    // Step 1: Expand macros
    let expandedContent = await this.expandMacros(content, pageName, userContext, requestInfo);

    // Step 2: Process JSPWiki-style tables
    expandedContent = this.processJSPWikiTables(expandedContent);

    // Step 3: Process wiki-style links
    expandedContent = await this.processWikiLinks(expandedContent);

    // Step 4: Convert to HTML
    const html = this.converter.makeHtml(expandedContent);

    // Step 5: Post-process tables with styling
    const finalHtml = this.postProcessTables(html);

    return finalHtml;
  }

  /**
   * Perform performance comparison between advanced and legacy parsers (modular benchmarking)
   * @param {string} content - Content that was parsed
   * @param {string} pageName - Page name
   * @param {object} userContext - User context
   * @param {object} requestInfo - Request information
   * @param {number} advancedTime - Time taken by advanced parser
   */
  async performPerformanceComparison(content, pageName, userContext, requestInfo, advancedTime) {
    try {
      const legacyStartTime = Date.now();
      await this.renderWithLegacyParser(content, pageName, userContext, requestInfo);
      const legacyTime = Date.now() - legacyStartTime;

      const comparison = {
        pageName,
        contentLength: content.length,
        advancedTime,
        legacyTime,
        improvement: legacyTime - advancedTime,
        percentImprovement: legacyTime > 0 ? ((legacyTime - advancedTime) / legacyTime * 100).toFixed(1) : 0,
        timestamp: new Date().toISOString()
      };

      console.log(`📊 Performance comparison for ${pageName}:`, comparison);

      // Send to performance monitoring if available
      const notificationManager = this.engine.getManager('NotificationManager');
      if (notificationManager && Math.abs(comparison.improvement) > 50) { // Significant difference
        notificationManager.addNotification({
          type: 'performance',
          title: `Rendering Performance: ${pageName}`,
          message: `AdvancedParser vs Legacy: ${comparison.improvement}ms difference (${comparison.percentImprovement}% improvement)`,
          priority: 'low',
          source: 'RenderingManager'
        });
      }

    } catch (error) {
      console.warn('⚠️  Performance comparison failed:', error.message);
    }
  }

  /**
   * Process JSPWiki-style table syntax with styling parameters
   * @param {string} content - Content with JSPWiki table syntax
   * @returns {string} Content with processed tables
   */
  processJSPWikiTables(content) {
    // First, process %%table-striped syntax
    content = this.processTableStripedSyntax(content);
    
    // Then process [{Table}] plugin syntax
    const tablePluginRegex = /\[\{Table\s+([^}]+)\}\]\s*\n((?:(?:\|\|?[^|\n]*)+\|?\s*\n?)+)/gi;
    
    return content.replace(tablePluginRegex, (match, params, tableContent) => {
      // Parse parameters
      const tableParams = this.parseTableParameters(params);
      
      // Generate unique ID for this table
      const tableId = `table_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // Add table metadata as HTML comment for post-processing
      const tableMetadata = `<!-- TABLE_METADATA:${JSON.stringify({...tableParams, id: tableId})} -->`;
      
      // Convert JSPWiki table syntax to markdown
      const markdownTable = this.convertJSPWikiTableToMarkdown(tableContent, tableParams);
      
      return tableMetadata + '\n' + markdownTable;
    });
  }

  /**
   * Process %%table-striped syntax for theme-based alternating rows
   * @param {string} content - Content with %%table-striped syntax
   * @returns {string} Content with processed tables
   */
  processTableStripedSyntax(content) {
    // Match %%table-striped ... /% syntax
    const stripedTableRegex = /%%table-striped\s*\n((?:(?:\|\|?[^|\n]*)+\|?\s*\n?)+)\s*\/%/gi;
    
    return content.replace(stripedTableRegex, (match, tableContent) => {
      // Generate unique ID for this table
      const tableId = `table_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // Create parameters for striped table
      const tableParams = {
        id: tableId,
        style: '',
        dataStyle: '',
        headerStyle: '',
        evenRowStyle: 'background-color: var(--bs-table-striped-bg, rgba(0,0,0,.05));',
        oddRowStyle: '',
        rowNumber: 0,
        isStriped: true
      };
      
      // Add table metadata as HTML comment for post-processing
      const tableMetadata = `<!-- TABLE_METADATA:${JSON.stringify(tableParams)} -->`;
      
      // Convert to markdown table
      const markdownTable = this.convertJSPWikiTableToMarkdown(tableContent, tableParams);
      
      return tableMetadata + '\n' + markdownTable;
    });
  }

  /**
   * Parse table parameters from JSPWiki Table plugin syntax
   * @param {string} paramString - Parameter string
   * @returns {Object} Parsed parameters
   */
  parseTableParameters(paramString) {
    const params = {
      rowNumber: 0,
      style: '',
      dataStyle: '',
      headerStyle: '',
      evenRowStyle: '',
      oddRowStyle: ''
    };
    
    // Parse param:value pairs
    const paramRegex = /(\w+)\s*:\s*['"](.*?)['"]|(\w+)\s*:\s*([^,\s]+)/g;
    let match;
    
    while ((match = paramRegex.exec(paramString)) !== null) {
      const key = match[1] || match[3];
      const value = match[2] || match[4];
      
      if (params.hasOwnProperty(key)) {
        params[key] = value;
      }
    }
    
    return params;
  }

  /**
   * Convert JSPWiki table syntax to markdown table syntax
   * @param {string} tableContent - JSPWiki table content
   * @param {Object} params - Table parameters
   * @returns {string} Markdown table
   */
  convertJSPWikiTableToMarkdown(tableContent, params) {
    const lines = tableContent.trim().split('\n');
    const markdownLines = [];
    let isFirstRow = true;
    let currentRowNumber = parseInt(params.rowNumber) || 0;
    
    for (const line of lines) {
      const trimmedLine = line.trim();
      if (!trimmedLine) continue;
      
      // Convert JSPWiki table row to markdown
      let markdownLine = trimmedLine;
      
      // Handle row numbering syntax |# -> convert to current row number
      if (markdownLine.includes('|#')) {
        // For data rows, increment and use the row number
        if (!trimmedLine.startsWith('||')) {
          currentRowNumber++;
          markdownLine = markdownLine.replace(/\|#/g, `|${currentRowNumber}`);
        } else {
          // For header rows, replace with "Nr" or similar
          markdownLine = markdownLine.replace(/\|\|#/g, '||Nr');
        }
      }
      
      // Handle double pipes (headers) - convert to single pipes for markdown
      if (trimmedLine.startsWith('||')) {
        markdownLine = markdownLine.replace(/\|\|/g, '|');
        // Ensure proper markdown header format
        if (!markdownLine.endsWith('|')) {
          markdownLine += '|';
        }
        markdownLines.push(markdownLine);
        
        // Add markdown table separator after header
        const headerCount = (markdownLine.match(/\|/g) || []).length - 1;
        const separator = '|' + '---|'.repeat(headerCount);
        markdownLines.push(separator);
        
        isFirstRow = false;
      } else if (trimmedLine.startsWith('|')) {
        // Regular data row
        if (!markdownLine.endsWith('|')) {
          markdownLine += '|';
        }
        markdownLines.push(markdownLine);
      }
    }
    
    return markdownLines.join('\n');
  }

  /**
   * Post-process rendered HTML tables to apply JSPWiki styling
   * @param {string} html - Rendered HTML
   * @returns {string} HTML with styled tables
   */
  postProcessTables(html) {
    // Find table metadata comments and apply styling
    const metadataRegex = /<!--\s*TABLE_METADATA:(.*?)\s*-->\s*<table>/g;
    
    return html.replace(metadataRegex, (match, metadataJson) => {
      try {
        const metadata = JSON.parse(metadataJson);
        return this.generateStyledTable(metadata);
      } catch (e) {
        console.error('Error parsing table metadata:', e);
        return '<table>';
      }
    });
  }

  /**
   * Generate styled table HTML with CSS
   * @param {Object} metadata - Table styling metadata
   * @returns {string} Styled table opening tag with CSS
   */
  generateStyledTable(metadata) {
    const { id, style, dataStyle, headerStyle, evenRowStyle, oddRowStyle, rowNumber, isStriped } = metadata;
    
    let css = '';
    let tableStyle = style || '';
    let tableClasses = 'table';
    
    // Add Bootstrap striped class if this is a striped table
    if (isStriped) {
      tableClasses += ' table-striped';
    }
    
    // Generate CSS for the table
    if (dataStyle || headerStyle || evenRowStyle || oddRowStyle) {
      css += `<style>`;
      
      if (headerStyle) {
        css += `#${id} th { ${headerStyle} }`;
      }
      
      if (dataStyle) {
        css += `#${id} td { ${dataStyle} }`;
      }
      
      if (evenRowStyle) {
        // For striped tables, we need to target the right rows
        // Bootstrap striped tables style odd rows (1st, 3rd, 5th...)
        if (isStriped) {
          css += `#${id} tbody tr:nth-child(odd) { ${evenRowStyle} }`;
        } else {
          css += `#${id} tr:nth-child(even) { ${evenRowStyle} }`;
        }
      }
      
      if (oddRowStyle) {
        if (isStriped) {
          css += `#${id} tbody tr:nth-child(even) { ${oddRowStyle} }`;
        } else {
          css += `#${id} tr:nth-child(odd) { ${oddRowStyle} }`;
        }
      }
      
      css += `</style>`;
    }
    
    return `${css}<table id="${id}" class="${tableClasses}"${tableStyle ? ` style="${tableStyle}"` : ''}>`;
  }

  /**
   * Expand macros in content
   * @param {string} content - Content with macros
   * @param {string} pageName - Current page name
   * @param {object} userContext - User context for authentication variables
   * @returns {string} Content with expanded macros
   */
  async expandMacros(content, pageName, userContext = null, requestInfo = null) {
    console.log('DEBUG: expandMacros called with content:', content, 'pageName:', pageName);
    let expandedContent = content;

    // Step 1: Protect code blocks and escaped syntax
    const protectedAreas = [];
    let protectionIndex = 0;

    // Protect code blocks (```code```)
    expandedContent = expandedContent.replace(/```[\s\S]*?```/g, (match) => {
      const placeholder = `PROTECTED${protectionIndex++}PROTECTED`;
      protectedAreas[placeholder] = match;
      return placeholder;
    });

    // Protect JSPWiki-style code blocks (''')
    expandedContent = expandedContent.replace(/'''[\s\S]*?'''/g, (match) => {
      const placeholder = `PROTECTED${protectionIndex++}PROTECTED`;
      // Convert JSPWiki style to markdown style for proper rendering
      const content = match.replace(/^'''\s*\n?/, '```\n').replace(/\n?\s*'''$/, '\n```');
      protectedAreas[placeholder] = content;
      return placeholder;
    });

    // Protect inline code (`code`)
    expandedContent = expandedContent.replace(/`[^`]*`/g, (match) => {
      const placeholder = `PROTECTED${protectionIndex++}PROTECTED`;
      protectedAreas[placeholder] = match;
      return placeholder;
    });

    // Protect escaped plugins/variables ([[{...}])
    expandedContent = expandedContent.replace(/\[\[\{([^}]+)\}\]/g, (match, content) => {
      const placeholder = `PROTECTED${protectionIndex++}PROTECTED`;
      protectedAreas[placeholder] = `[{${content}}]`; // Remove one set of brackets
      return placeholder;
    });

    // Step 2: Expand JSPWiki-style plugins and system variables using PluginManager
    const pluginManager = this.engine.getManager('PluginManager');
    if (pluginManager) {
      // Handle system variables (${variable}) and plugins ({PluginName params})
      const macroRegex = /\[\{([^}]+)\}\]/g;
      const matches = [];
      let match;

      // Collect all matches first
      while ((match = macroRegex.exec(expandedContent)) !== null) {
        matches.push({
          fullMatch: match[0],
          content: match[1],
          index: match.index
        });
      }

      // Process matches in reverse order to maintain string positions
      for (let i = matches.length - 1; i >= 0; i--) {
        const matchInfo = matches[i];
        try {
          console.log('DEBUG: RenderingManager found macro:', matchInfo.fullMatch, 'content:', matchInfo.content);

          let replacement;
          // Check if it's a system variable (starts with $)
          if (matchInfo.content.startsWith('$')) {
            console.log('DEBUG: RenderingManager detected system variable, calling expandAllVariables with pageName:', pageName);
            replacement = this.expandAllVariables(`[{${matchInfo.content}}]`, userContext, pageName, requestInfo);
          } else {
            // Parse plugin call: PluginName param1=value1 param2=value2
            const parts = matchInfo.content.trim().split(/\s+/);
            const pluginName = parts[0];
            const params = {};

            // Parse parameters - improved to handle quoted values and spaced syntax
            for (let j = 1; j < parts.length; j++) {
              let param = parts[j];

              // Handle case where key and value are separate, like "align = 'left'"
              if (!param.includes('=') && j + 1 < parts.length && parts[j + 1].startsWith('=')) {
                const key = param;
                let value = parts[j + 1].substring(1); // Remove the =
                j++; // Skip the =value part

                // Handle quoted values
                if ((value.startsWith("'") && !value.endsWith("'")) ||
                    (value.startsWith('"') && !value.endsWith('"'))) {
                  const quoteChar = value.charAt(0);
                  while (j + 1 < parts.length && !value.endsWith(quoteChar)) {
                    j++;
                    value += ' ' + parts[j];
                  }
                  if (value.startsWith(quoteChar) && value.endsWith(quoteChar)) {
                    value = value.slice(1, -1);
                  }
                } else if (value.startsWith("'") && value.endsWith("'")) {
                  value = value.slice(1, -1);
                } else if (value.startsWith('"') && value.endsWith('"')) {
                  value = value.slice(1, -1);
                }

                params[key] = value;
              } else if (param.includes('=')) {
                // Handle normal key=value syntax
                const equalIndex = param.indexOf('=');
                const key = param.substring(0, equalIndex);
                let value = param.substring(equalIndex + 1);

                // Handle quoted values that might span multiple parts
                if ((value.startsWith("'") && !value.endsWith("'")) ||
                    (value.startsWith('"') && !value.endsWith('"'))) {
                  const quoteChar = value.charAt(0);
                  while (j + 1 < parts.length && !value.endsWith(quoteChar)) {
                    j++;
                    value += ' ' + parts[j];
                  }
                  if (value.startsWith(quoteChar) && value.endsWith(quoteChar)) {
                    value = value.slice(1, -1);
                  }
                } else if (value.startsWith("'") && value.endsWith("'")) {
                  value = value.slice(1, -1);
                } else if (value.startsWith('"') && value.endsWith('"')) {
                  value = value.slice(1, -1);
                }

                params[key] = value;
              }
            }

            // Execute plugin
            replacement = await pluginManager.execute(pluginName, pageName, params, {
              linkGraph: this.linkGraph,
              engine: this.engine,
              pageName: pageName
            });
          }

          // Replace the match in the content
          expandedContent = expandedContent.substring(0, matchInfo.index) +
                           replacement +
                           expandedContent.substring(matchInfo.index + matchInfo.fullMatch.length);
        } catch (err) {
          console.error(`Macro expansion failed for ${matchInfo.content}:`, err);
          const errorReplacement = `[Error: ${matchInfo.content}]`;
          expandedContent = expandedContent.substring(0, matchInfo.index) +
                           errorReplacement +
                           expandedContent.substring(matchInfo.index + matchInfo.fullMatch.length);
        }
      }
    } else {
      // Fallback: just handle variables directly with unified system
      expandedContent = this.expandAllVariables(expandedContent, userContext, pageName, requestInfo);
    }

    // Step 3: Restore protected areas
    for (const [placeholder, originalContent] of Object.entries(protectedAreas)) {
      expandedContent = expandedContent.replace(placeholder, originalContent);
    }

    return expandedContent;
  }

  /**
   * Expand a single JSPWiki-style system variable
   * @param {string} variable - The variable name (including $)
   * @param {string} pageName - Current page name
   * @param {object} userContext - User context for authentication variables
   * @returns {string} Expanded value
   */
  expandSystemVariable(variable, pageName, userContext = null) {
    try {
      switch (variable) {
        case '$pagename':
          return pageName;
        case '$totalpages':
          return this.getTotalPagesCount().toString();
        case '$uptime':
          return this.formatUptime(this.getUptime());
        case '$applicationname':
          return 'amdWiki';
        case '$version':
          return this.getApplicationVersion();
        case '$baseurl':
          return this.getBaseUrl();
        case '$timestamp':
          return new Date().toISOString();
        case '$date':
          return new Date().toLocaleDateString();
        case '$time':
          return new Date().toLocaleTimeString();
        case '$year':
          return new Date().getFullYear().toString();
        case '$username':
          return this.getUserName(userContext);
        case '$loginstatus':
          return this.getLoginStatus(userContext);
        default:
          console.warn(`Unknown system variable: ${variable}`);
          return `[{${variable}}]`; // Return unchanged if unknown
      }
    } catch (err) {
      console.error(`Error expanding system variable ${variable}:`, err);
      return `[Error: ${variable}]`;
    }
  }

  /**
   * Get total pages count
   * @returns {number} Number of pages
   */
  getTotalPagesCount() {
    try {
      const pageManager = this.engine.getManager('PageManager');
      if (pageManager && pageManager.pagesDir && pageManager.requiredPagesDir) {
        const fs = require('fs-extra');
        const path = require('path');
        
        // Count .md files in both directories synchronously
        let count = 0;
        
        try {
          const regularFiles = fs.readdirSync(pageManager.pagesDir)
            .filter(file => file.endsWith('.md'));
          count += regularFiles.length;
        } catch (err) {
          // Pages directory might not exist
        }
        
        try {
          const requiredFiles = fs.readdirSync(pageManager.requiredPagesDir)
            .filter(file => file.endsWith('.md'));
          count += requiredFiles.length;
        } catch (err) {
          // Required pages directory might not exist
        }
        
        return count;
      }
      return 0;
    } catch (err) {
      console.warn('Could not get total pages count:', err);
      return 0;
    }
  }

  /**
  /**
   * Get server uptime in seconds
   * @returns {number} Uptime in seconds
   */
  getUptime() {
    const startTime = this.engine.startTime || Date.now();
    return Math.floor((Date.now() - startTime) / 1000);
  }

  /**
   * Get application version from package.json
   * @returns {string} Application version
   */
  getApplicationVersion() {
    try {
      const fs = require('fs');
      const path = require('path');
      const packageJsonPath = path.join(process.cwd(), 'package.json');
      
      if (fs.existsSync(packageJsonPath)) {
        const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
        return packageJson.version || '1.0.0';
      }
      
      return '1.0.0';
    } catch (err) {
      console.warn('Could not read version from package.json:', err);
      return '1.0.0';
    }
  }

  /**
   * Expand JSPWiki-style system variables (legacy method for compatibility)
   * @param {string} content - Content with system variables
   * @returns {string} Content with expanded system variables
   */
  expandSystemVariables(content) {
    try {
      const pageManager = this.engine.getManager('PageManager');
      
      // Get system information
      const startTime = this.engine.startTime || Date.now();
      const uptime = Math.floor((Date.now() - startTime) / 1000);
      const uptimeFormatted = this.formatUptime(uptime);
      
      // Get total pages count
      let totalPages = 0;
      if (pageManager) {
        try {
          const pages = pageManager.getAllPages ? pageManager.getAllPages() : [];
          totalPages = Array.isArray(pages) ? pages.length : 0;
        } catch (err) {
          console.warn('Could not get total pages count:', err);
        }
      }
      
      // Replace system variables
      let expandedContent = content;
      expandedContent = expandedContent.replace(/\[\{\$totalpages\}\]/g, totalPages.toString());
      expandedContent = expandedContent.replace(/\[\{\$uptime\}\]/g, uptimeFormatted);
      expandedContent = expandedContent.replace(/\[\{\$applicationname\}\]/g, 'amdWiki');
      expandedContent = expandedContent.replace(/\[\{\$baseurl\}\]/g, this.getBaseUrl());
      expandedContent = expandedContent.replace(/\[\{\$timestamp\}\]/g, new Date().toISOString());
      expandedContent = expandedContent.replace(/\[\{\$date\}\]/g, new Date().toLocaleDateString());
      expandedContent = expandedContent.replace(/\[\{\$time\}\]/g, new Date().toLocaleTimeString());
      
      // Sessions plugin (simplified)
      expandedContent = expandedContent.replace(/\[\{SessionsPlugin\}\]/g, '1');
      
      return expandedContent;
      
    } catch (err) {
      console.error('System variable expansion failed:', err);
      return content;
    }
  }

  /**
   * Format uptime in human-readable format
   * @param {number} seconds - Uptime in seconds
   * @returns {string} Formatted uptime
   */
  formatUptime(seconds) {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (days > 0) {
      return `${days}d ${hours}h ${minutes}m`;
    } else if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else {
      return `${minutes}m`;
    }
  }

  /**
   * Get the base URL for the application
   * @returns {string} Base URL
   */
  getBaseUrl() {
    // Use configured baseURL from ConfigurationManager
    const configManager = this.engine.getManager('ConfigurationManager');
    return configManager ? configManager.getBaseURL() : 'http://localhost:3000';
  }

  /**
   * Process wiki-style links [PageName]
   * @param {string} content - Content with wiki links
   * @returns {Promise<string>} Content with processed links
   */
  async processWikiLinks(content) {
    try {
      const pageManager = this.engine.getManager('PageManager');
      if (!pageManager) {
        return content;
      }

      // Get all existing page names (use cached if available, otherwise get fresh)
      let pageNames = this.cachedPageNames || [];

      // If no cached page names, try to get them fresh
      if (pageNames.length === 0 && pageManager) {
        try {
          const pages = await pageManager.getAllPages();
          pageNames = pages.map(page => page.name);
          this.cachedPageNames = pageNames; // Update cache
        } catch (err) {
          console.warn('Could not get page names for link processing:', err);
          pageNames = [];
        }
      }
      
      // Process wiki links with extended pipe syntax [DisplayText|Target|Parameters] and simple links [PageName]
      return content.replace(/\[([a-zA-Z0-9_\- ]+)(?:\|([a-zA-Z0-9_\-\/ .:?=&]+))?(?:\|([^|\]]+))?\]/g, (match, displayText, target, params) => {
        // Parse parameters if provided
        let linkAttributes = '';
        if (params) {
          // Parse target='_blank' and other attributes
          const targetMatch = params.match(/target=['"]([^'"]+)['"]/);
          if (targetMatch) {
            linkAttributes += ` target="${targetMatch[1]}"`;
            // Add rel="noopener noreferrer" for security when opening in new tab
            if (targetMatch[1] === '_blank') {
              linkAttributes += ' rel="noopener noreferrer"';
            }
          }
          
          // Parse other potential attributes (class, title, etc.)
          const classMatch = params.match(/class=['"]([^'"]+)['"]/);
          if (classMatch) {
            linkAttributes += ` class="${classMatch[1]}"`;
          }
          
          const titleMatch = params.match(/title=['"]([^'"]+)['"]/);
          if (titleMatch) {
            linkAttributes += ` title="${titleMatch[1]}"`;
          }
        }
        
        // If no target specified, it's a simple wiki link
        if (!target) {
          const pageName = displayText;
          if (pageNames.includes(pageName)) {
            return `<a href="/wiki/${encodeURIComponent(pageName)}" class="wikipage"${linkAttributes}>${pageName}</a>`;
          }
          // Red link for non-existent pages
          return `<a href="/edit/${encodeURIComponent(pageName)}" style="color: red;" class="redlink"${linkAttributes}>${pageName}</a>`;
        }
        
        // Handle pipe syntax [DisplayText|Target|Parameters]
        // Check if target is a URL (contains :// or starts with /)
        if (target.includes('://') || target.startsWith('/')) {
          // External URL or absolute path
          const baseClass = linkAttributes.includes('class=') ? '' : ' class="external-link"';
          return `<a href="${target}"${baseClass}${linkAttributes}>${displayText}</a>`;
        } else if (target.toLowerCase() === 'search') {
          // Special case for Search functionality
          return `<a href="/search" class="nav-link"${linkAttributes}>${displayText}</a>`;
        } else {
          // Wiki page target
          if (pageNames.includes(target)) {
            return `<a href="/wiki/${encodeURIComponent(target)}" class="wikipage"${linkAttributes}>${displayText}</a>`;
          }
          // Red link for non-existent page target
          return `<a href="/edit/${encodeURIComponent(target)}" style="color: red;" class="redlink"${linkAttributes}>${displayText}</a>`;
        }
      });
    } catch (err) {
      console.error('Wiki link processing failed:', err);
      return content;
    }
  }

  /**
   * Build link graph for referring pages
   */
  async buildLinkGraph() {
    const pageManager = this.engine.getManager('PageManager');
    if (!pageManager) {
      console.warn('PageManager not available for link graph building');
      return;
    }

    try {
      const pages = await pageManager.getAllPages();
      const newLinkGraph = {};
      
      // Cache page names for wiki link processing
      this.cachedPageNames = pages.map(page => page.name);

      for (const page of pages) {
        const pageName = page.name;
        const content = page.content;

        if (!newLinkGraph[pageName]) {
          newLinkGraph[pageName] = [];
        }

        // Find markdown links
        const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
        let match;
        while ((match = linkRegex.exec(content)) !== null) {
          const linkedPage = match[2];
          if (!newLinkGraph[linkedPage]) {
            newLinkGraph[linkedPage] = [];
          }
          if (!newLinkGraph[linkedPage].includes(pageName)) {
            newLinkGraph[linkedPage].push(pageName);
          }
        }

        // Find wiki-style links including extended pipe syntax
        const simpleLinkRegex = /\[([a-zA-Z0-9\s_-]+)(?:\|([a-zA-Z0-9\s_\-\/ .:?=&]+))?(?:\|([^|\]]+))?\]/g;
        while ((match = simpleLinkRegex.exec(content)) !== null) {
          // For pipe syntax [DisplayText|Target|Parameters], use the target; otherwise use the display text
          const linkedPage = match[2] || match[1];
          
          // Only add to link graph if it's a wiki page (not external URLs or special pages)
          if (!linkedPage.includes('://') && !linkedPage.startsWith('/') && linkedPage.toLowerCase() !== 'search') {
            if (!newLinkGraph[linkedPage]) {
              newLinkGraph[linkedPage] = [];
            }
            if (!newLinkGraph[linkedPage].includes(pageName)) {
              newLinkGraph[linkedPage].push(pageName);
            }
          }
        }
      }

      this.linkGraph = newLinkGraph;
      console.log(`📊 Link graph built with ${Object.keys(this.linkGraph).length} entries`);

    // Notify LinkParserHandler to refresh its page names if it exists
    const markupParser = this.engine.getManager('MarkupParser');
    if (markupParser && markupParser.getHandler) {
      const linkParserHandler = markupParser.getHandler('LinkParserHandler');
      if (linkParserHandler && linkParserHandler.refreshPageNames) {
        await linkParserHandler.refreshPageNames();
        console.log('🔄 Notified LinkParserHandler to refresh page names');
      }
    }
    } catch (err) {
      console.error('Failed to build link graph:', err);
    }
  }

  /**
   * Initialize LinkParser with page names and configuration
   */
  async initializeLinkParser() {
    try {
      // Set page names for link validation (existing pages)
      if (this.cachedPageNames && Array.isArray(this.cachedPageNames)) {
        this.linkParser.setPageNames(this.cachedPageNames);
      }

      // TODO: Add InterWiki sites configuration from config
      // For now, add some common InterWiki sites
      const interWikiSites = {
        'Wikipedia': {
          url: 'https://en.wikipedia.org/wiki/%s',
          description: 'Wikipedia English',
          openInNewWindow: true
        },
        'JSPWiki': {
          url: 'https://jspwiki-wiki.apache.org/Wiki.jsp?page=%s',
          description: 'JSPWiki Documentation',
          openInNewWindow: true
        }
      };
      this.linkParser.setInterWikiSites(interWikiSites);

      console.log(`🔗 LinkParser initialized with ${this.cachedPageNames ? this.cachedPageNames.length : 0} pages and ${Object.keys(interWikiSites).length} InterWiki sites`);
    } catch (error) {
      console.error('Failed to initialize LinkParser:', error);
    }
  }

  /**
   * Get link graph
   * @returns {Object} Link graph object
   */
  getLinkGraph() {
    return this.linkGraph;
  }

  /**
   * Rebuild link graph (called after page changes)
   */
  async rebuildLinkGraph() {
    await this.buildLinkGraph();
    await this.initializeLinkParser();
  }

  /**
   * Get pages that refer to a specific page
   * @param {string} pageName - Target page name
   * @returns {Array<string>} Array of referring page names
   */
  getReferringPages(pageName) {
    return this.linkGraph[pageName] || [];
  }

  /**
   * Render page preview
   * @param {string} content - Markdown content
   * @param {string} pageName - Page name for context
   * @param {object} userContext - User context for authentication variables
   * @returns {Promise<string>} Rendered HTML preview
   */
  async renderPreview(content, pageName, userContext = null) {
    return await this.renderMarkdown(content, pageName, userContext);
  }

  /**
   * Get current username from user context
   * @param {object} userContext - User context object
   * @returns {string} Username or "Anonymous"
   */
  getUserName(userContext) {
    if (!userContext || !userContext.username) {
      return 'Anonymous';
    }
    
    // Handle special authentication states
    switch (userContext.username) {
      case 'anonymous':
        return 'Anonymous';
      case 'asserted':
        return userContext.displayName || 'Asserted User';
      default:
        return userContext.displayName || userContext.username;
    }
  }

  /**
   * Get current login status from user context
   * @param {object} userContext - User context object
   * @returns {string} Login status description
   */
  getLoginStatus(userContext) {
    if (!userContext || !userContext.username) {
      return 'Anonymous';
    }

    // Handle authentication states as defined in Authentication States Implementation
    switch (userContext.username) {
      case 'anonymous':
        return 'Anonymous';
      case 'asserted':
        return 'Asserted';
      default:
        return 'Authenticated';
    }
  }

  /**
   * Render wiki links (JSPWiki-style links) using LinkParser
   * @param {string} content - Content with wiki links
   * @returns {string} Content with rendered links
   */
  renderWikiLinks(content) {
    if (!content) return '';

    try {
      // Use the centralized LinkParser for comprehensive link processing
      return this.linkParser.parseLinks(content, {
        pageName: 'current', // Could be passed in if needed
        engine: this.engine
      });
    } catch (error) {
      console.error('LinkParser failed, falling back to original content:', error);
      return content;
    }
  }

  /**
   * Render plugins (JSPWiki-style plugins)
   * @param {string} content - Content with plugin syntax
   * @param {string} pageName - Page name for plugin context
   * @returns {string} Content with rendered plugins
   */
  async renderPlugins(content, pageName) {
    if (!content) return '';

    // Process plugin syntax [{PluginName param1=value1}]
    const pluginManager = this.engine.getManager('PluginManager');
    if (!pluginManager) return content;

    const macroRegex = /\[\{([^}]+)\}\]/g;
    const matches = [];
    let match;

    // Collect all matches first
    while ((match = macroRegex.exec(content)) !== null) {
      matches.push({
        fullMatch: match[0],
        content: match[1],
        index: match.index
      });
    }

    // Process matches in reverse order to maintain string positions
    let processedContent = content;
    for (let i = matches.length - 1; i >= 0; i--) {
      const matchInfo = matches[i];
      try {
        const parts = matchInfo.content.trim().split(/\s+/);
        const pluginName = parts[0];

        if (pluginManager.hasPlugin && pluginManager.hasPlugin(pluginName)) {
          // Parse parameters
          const params = {};
          for (let j = 1; j < parts.length; j++) {
            const paramParts = parts[j].split('=');
            if (paramParts.length === 2) {
              params[paramParts[0]] = paramParts[1];
            }
          }

          const result = await pluginManager.execute(pluginName, pageName, params, { engine: this.engine });

          // Replace the match in the content
          processedContent = processedContent.substring(0, matchInfo.index) +
                            result +
                            processedContent.substring(matchInfo.index + matchInfo.fullMatch.length);
        }
      } catch (error) {
        const parts = matchInfo.content.trim().split(/\s+/);
        const errorReplacement = `<span class="error">Plugin ${parts[0]} error</span>`;
        processedContent = processedContent.substring(0, matchInfo.index) +
                          errorReplacement +
                          processedContent.substring(matchInfo.index + matchInfo.fullMatch.length);
      }
    }

    return processedContent;
  }

  /**
   * Variable expansion - delegates to VariableManager
   * @param {string} content - Content with variables
   * @param {object} userContext - User context
   * @param {string} pageName - Current page name
   * @returns {string} Content with expanded variables
   */
  expandAllVariables(content, userContext, pageName, requestInfo = null) {
    if (!content) return '';

    const variableManager = this.engine.getManager('VariableManager');
    if (!variableManager) {
      console.warn('VariableManager not available, skipping variable expansion');
      return content;
    }

    const context = {
      userContext: userContext,
      pageName: pageName,
      requestInfo: requestInfo
    };

    return variableManager.expandVariables(content, context);
  }

  /**
   * Legacy function - now calls unified expansion
   * @deprecated Use expandAllVariables instead
   */
  expandUserVariables(content, userContext, pageName) {
    return this.expandAllVariables(content, userContext, pageName);
  }

  /**
   * Render a complete page
   * @param {string} content - Raw page content
   * @param {string} pageName - Page name
   * @param {object} userContext - User context
   * @returns {Promise<string>} Fully rendered HTML
   */
  async renderPage(content, pageName, userContext = null) {
    if (!content) return '';

    // Use renderMarkdown which already handles all processing steps correctly
    return await this.renderMarkdown(content, pageName, userContext);
  }
}

module.exports = RenderingManager;
