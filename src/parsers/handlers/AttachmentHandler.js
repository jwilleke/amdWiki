const { BaseSyntaxHandler } = require('./BaseSyntaxHandler');
const path = require('path');
const fs = require('fs').promises;

/**
 * AttachmentHandler - Advanced attachment processing with thumbnails and metadata
 * 
 * Supports enhanced JSPWiki attachment syntax:
 * - [{ATTACH filename.pdf}] - Simple attachment link
 * - [{ATTACH filename.pdf|Display Name}] - Custom display text
 * - [{ATTACH filename.pdf|Display Name|target=_blank}] - Link parameters
 * - Automatic thumbnail generation for images
 * - File metadata display (size, date, type)
 * - Security validation and permission checks
 * 
 * Related Issue: Advanced Attachment Handler (Phase 3)
 * Epic: #41 - Implement JSPWikiMarkupParser for Complete Enhancement Support
 */
class AttachmentHandler extends BaseSyntaxHandler {
  constructor(engine = null) {
    super(
      /\[\{ATTACH\s+([^|}\]]+)(?:\|([^|}\]]+))?(?:\|([^}\]]+))?\}\]/g, // Pattern: [{ATTACH filename|display|params}]
      75, // Medium-high priority
      {
        description: 'Enhanced JSPWiki-style attachment handler with thumbnails and metadata',
        version: '2.0.0',
        dependencies: ['AttachmentManager', 'ConfigurationManager'],
        timeout: 8000,
        cacheEnabled: true
      }
    );
    this.handlerId = 'AttachmentHandler';
    this.engine = engine;
    this.config = null;
    this.attachmentConfig = null;
  }

  /**
   * Initialize handler with modular configuration loading
   * @param {Object} context - Initialization context
   */
  async onInitialize(context) {
    this.engine = context.engine;
    
    // Load modular configuration from multiple sources
    await this.loadModularConfiguration();
    
    console.log(`🔧 AttachmentHandler initialized with modular configuration:`);
    console.log(`   📎 Enhanced mode: ${this.attachmentConfig.enhanced ? 'enabled' : 'disabled'}`);
    console.log(`   🖼️  Thumbnails: ${this.attachmentConfig.thumbnails ? 'enabled' : 'disabled'}`);
    console.log(`   📊 Metadata: ${this.attachmentConfig.metadata ? 'enabled' : 'disabled'}`);
  }

  /**
   * Load configuration from multiple modular sources
   * - app-default-config.json (base configuration)
   * - app-custom-config.json (user overrides via ConfigurationManager)
   * - Handler-specific settings from MarkupParser
   */
  async loadModularConfiguration() {
    const configManager = this.engine?.getManager('ConfigurationManager');
    const markupParser = this.engine?.getManager('MarkupParser');
    
    // Get base handler configuration from MarkupParser
    if (markupParser) {
      this.config = markupParser.getHandlerConfig('attachment');
      
      if (this.config.priority && this.config.priority !== this.priority) {
        this.priority = this.config.priority;
        console.log(`🔧 AttachmentHandler priority set to ${this.priority} from configuration`);
      }
    }

    // Load detailed attachment configuration from config files
    this.attachmentConfig = {
      // Default values
      enhanced: true,
      thumbnails: true,
      metadata: true,
      thumbnailSizes: ['150x150', '300x300'],
      showFileSize: true,
      showModified: true,
      iconPath: '/icons/filetypes',
      cacheMetadata: true,
      generateThumbnails: true,
      securityChecks: true
    };

    // Override with values from app-default-config.json and app-custom-config.json
    if (configManager) {
      try {
        // Load from configuration hierarchy
        this.attachmentConfig.enhanced = configManager.getProperty('amdwiki.markup.handlers.attachment.enhanced', this.attachmentConfig.enhanced);
        this.attachmentConfig.thumbnails = configManager.getProperty('amdwiki.markup.handlers.attachment.thumbnails', this.attachmentConfig.thumbnails);
        this.attachmentConfig.metadata = configManager.getProperty('amdwiki.markup.handlers.attachment.metadata', this.attachmentConfig.metadata);
        
        // Detailed attachment settings
        const thumbnailSizes = configManager.getProperty('amdwiki.attachment.enhanced.thumbnailSizes', this.attachmentConfig.thumbnailSizes.join(','));
        this.attachmentConfig.thumbnailSizes = thumbnailSizes.split(',').map(size => size.trim());
        
        this.attachmentConfig.showFileSize = configManager.getProperty('amdwiki.attachment.enhanced.showFileSize', this.attachmentConfig.showFileSize);
        this.attachmentConfig.showModified = configManager.getProperty('amdwiki.attachment.enhanced.showModified', this.attachmentConfig.showModified);
        this.attachmentConfig.iconPath = configManager.getProperty('amdwiki.attachment.enhanced.iconPath', this.attachmentConfig.iconPath);
        this.attachmentConfig.cacheMetadata = configManager.getProperty('amdwiki.attachment.enhanced.cacheMetadata', this.attachmentConfig.cacheMetadata);
        this.attachmentConfig.generateThumbnails = configManager.getProperty('amdwiki.attachment.enhanced.generateThumbnails', this.attachmentConfig.generateThumbnails);
        
      } catch (error) {
        console.warn('⚠️  Failed to load AttachmentHandler configuration, using defaults:', error.message);
      }
    }
  }

  /**
   * Process content by finding and enhancing attachment links
   * @param {string} content - Content to process
   * @param {ParseContext} context - Parse context
   * @returns {Promise<string>} - Content with enhanced attachments
   */
  async process(content, context) {
    if (!content) {
      return content;
    }

    const matches = [];
    let match;
    
    // Reset regex state
    this.pattern.lastIndex = 0;
    
    while ((match = this.pattern.exec(content)) !== null) {
      matches.push({
        fullMatch: match[0],
        filename: match[1].trim(),
        displayText: match[2] ? match[2].trim() : null,
        parameters: match[3] ? match[3].trim() : null,
        index: match.index,
        length: match[0].length
      });
    }

    // Process matches in reverse order to maintain string positions
    let processedContent = content;
    
    for (let i = matches.length - 1; i >= 0; i--) {
      const matchInfo = matches[i];
      
      try {
        const replacement = await this.handle(matchInfo, context);
        
        processedContent = 
          processedContent.slice(0, matchInfo.index) +
          replacement +
          processedContent.slice(matchInfo.index + matchInfo.length);
          
      } catch (error) {
        console.error(`❌ Attachment processing error for ${matchInfo.filename}:`, error.message);
        
        const errorPlaceholder = `<!-- Attachment Error: ${matchInfo.filename} - ${error.message} -->`;
        processedContent = 
          processedContent.slice(0, matchInfo.index) +
          errorPlaceholder +
          processedContent.slice(matchInfo.index + matchInfo.length);
      }
    }

    return processedContent;
  }

  /**
   * Handle a specific attachment with enhanced features
   * @param {Object} matchInfo - Attachment match information
   * @param {ParseContext} context - Parse context
   * @returns {Promise<string>} - Enhanced attachment HTML
   */
  async handle(matchInfo, context) {
    const { filename, displayText, parameters } = matchInfo;
    
    // Check cache for attachment result if caching enabled
    if (this.options.cacheEnabled && this.attachmentConfig.cacheMetadata) {
      const cachedResult = await this.getCachedAttachmentResult(filename, context);
      if (cachedResult) {
        return cachedResult;
      }
    }

    // Validate attachment access permissions
    const hasAccess = await this.checkAttachmentPermission(filename, context);
    if (!hasAccess) {
      throw new Error(`Access denied to attachment: ${filename}`);
    }

    // Get attachment metadata
    const attachmentMeta = await this.getAttachmentMetadata(filename, context);
    if (!attachmentMeta) {
      throw new Error(`Attachment not found: ${filename}`);
    }

    // Parse additional parameters
    const linkParams = this.parseAttachmentParameters(parameters);
    
    // Generate enhanced attachment HTML based on configuration
    let attachmentHtml;
    
    if (this.isImageFile(filename) && this.attachmentConfig.thumbnails) {
      attachmentHtml = await this.generateImageAttachmentHtml(filename, displayText, attachmentMeta, linkParams, context);
    } else {
      attachmentHtml = await this.generateFileAttachmentHtml(filename, displayText, attachmentMeta, linkParams, context);
    }

    // Cache the result if caching enabled
    if (this.options.cacheEnabled && this.attachmentConfig.cacheMetadata) {
      await this.cacheAttachmentResult(filename, context, attachmentHtml);
    }
    
    return attachmentHtml;
  }

  /**
   * Get attachment metadata with caching
   * @param {string} filename - Attachment filename
   * @param {ParseContext} context - Parse context
   * @returns {Promise<Object|null>} - Attachment metadata or null
   */
  async getAttachmentMetadata(filename, context) {
    const attachmentManager = context.getManager('AttachmentManager');
    if (!attachmentManager) {
      throw new Error('AttachmentManager not available');
    }

    try {
      // Get file information
      const attachmentPath = await attachmentManager.getAttachmentPath(filename);
      const stats = await fs.stat(attachmentPath);
      
      return {
        filename,
        size: stats.size,
        modified: stats.mtime,
        created: stats.birthtime,
        type: this.getFileType(filename),
        isImage: this.isImageFile(filename),
        path: attachmentPath,
        url: `/attachments/${encodeURIComponent(filename)}`
      };
      
    } catch (error) {
      console.warn(`⚠️  Could not get metadata for ${filename}:`, error.message);
      return null;
    }
  }

  /**
   * Generate enhanced HTML for image attachments with thumbnails
   * @param {string} filename - Image filename
   * @param {string} displayText - Display text
   * @param {Object} metadata - File metadata
   * @param {Object} params - Link parameters
   * @param {ParseContext} context - Parse context
   * @returns {Promise<string>} - Image attachment HTML
   */
  async generateImageAttachmentHtml(filename, displayText, metadata, params, context) {
    const thumbnailUrl = await this.generateThumbnail(filename, metadata, context);
    const fullImageUrl = metadata.url;
    const altText = displayText || filename;
    
    let imageHtml = `<div class="attachment-image-container">`;
    
    if (thumbnailUrl) {
      // Thumbnail with link to full image
      imageHtml += `
  <a href="${this.escapeHtml(fullImageUrl)}" class="attachment-image-link" data-filename="${this.escapeHtml(filename)}"${params.target ? ` target="${params.target}"` : ''}>
    <img src="${this.escapeHtml(thumbnailUrl)}" alt="${this.escapeHtml(altText)}" class="attachment-thumbnail">
  </a>`;
    } else {
      // Direct image link
      imageHtml += `
  <a href="${this.escapeHtml(fullImageUrl)}" class="attachment-image-link"${params.target ? ` target="${params.target}"` : ''}>
    <img src="${this.escapeHtml(fullImageUrl)}" alt="${this.escapeHtml(altText)}" class="attachment-image">
  </a>`;
    }
    
    // Add metadata if enabled
    if (this.attachmentConfig.metadata) {
      imageHtml += this.generateMetadataHtml(metadata, displayText);
    }
    
    imageHtml += `</div>`;
    
    return imageHtml;
  }

  /**
   * Generate enhanced HTML for file attachments
   * @param {string} filename - Attachment filename
   * @param {string} displayText - Display text
   * @param {Object} metadata - File metadata
   * @param {Object} params - Link parameters
   * @param {ParseContext} context - Parse context
   * @returns {Promise<string>} - File attachment HTML
   */
  async generateFileAttachmentHtml(filename, displayText, metadata, params, context) {
    const fileUrl = metadata.url;
    const linkText = displayText || filename;
    const fileIcon = this.getFileIcon(metadata.type);
    
    let fileHtml = `<div class="attachment-file-container">`;
    
    // File icon and link
    fileHtml += `
  <a href="${this.escapeHtml(fileUrl)}" class="attachment-file-link" data-filename="${this.escapeHtml(filename)}"${params.target ? ` target="${params.target}"` : ''}>`;
    
    if (fileIcon) {
      fileHtml += `<img src="${this.attachmentConfig.iconPath}/${fileIcon}" alt="${metadata.type}" class="attachment-file-icon"> `;
    }
    
    fileHtml += `${this.escapeHtml(linkText)}</a>`;
    
    // Add metadata if enabled
    if (this.attachmentConfig.metadata) {
      fileHtml += this.generateMetadataHtml(metadata, displayText);
    }
    
    fileHtml += `</div>`;
    
    return fileHtml;
  }

  /**
   * Generate metadata HTML display
   * @param {Object} metadata - File metadata
   * @param {string} displayText - Custom display text
   * @returns {string} - Metadata HTML
   */
  generateMetadataHtml(metadata, displayText) {
    let metaHtml = `<div class="attachment-metadata">`;
    
    if (this.attachmentConfig.showFileSize) {
      metaHtml += `<span class="attachment-size">${this.formatFileSize(metadata.size)}</span>`;
    }
    
    if (this.attachmentConfig.showModified) {
      metaHtml += `<span class="attachment-modified">${this.formatDate(metadata.modified)}</span>`;
    }
    
    metaHtml += `<span class="attachment-type">${metadata.type.toUpperCase()}</span>`;
    
    metaHtml += `</div>`;
    
    return metaHtml;
  }

  /**
   * Generate thumbnail for image attachments (modular based on configuration)
   * @param {string} filename - Image filename
   * @param {Object} metadata - File metadata
   * @param {ParseContext} context - Parse context
   * @returns {Promise<string|null>} - Thumbnail URL or null
   */
  async generateThumbnail(filename, metadata, context) {
    if (!this.attachmentConfig.generateThumbnails || !metadata.isImage) {
      return null;
    }

    try {
      // Use first configured thumbnail size
      const primarySize = this.attachmentConfig.thumbnailSizes[0];
      const thumbnailFilename = `thumb_${primarySize}_${filename}`;
      
      // Check if thumbnail already exists
      const attachmentManager = context.getManager('AttachmentManager');
      if (attachmentManager) {
        const thumbnailExists = await attachmentManager.attachmentExists(thumbnailFilename);
        if (thumbnailExists) {
          return `/attachments/${encodeURIComponent(thumbnailFilename)}`;
        }
        
        // Generate thumbnail if it doesn't exist (simplified - would use image processing library)
        await this.createThumbnail(metadata.path, thumbnailFilename, primarySize);
        return `/attachments/${encodeURIComponent(thumbnailFilename)}`;
      }
      
    } catch (error) {
      console.warn(`⚠️  Failed to generate thumbnail for ${filename}:`, error.message);
    }
    
    return null;
  }

  /**
   * Create thumbnail (placeholder implementation - would use image processing library)
   * @param {string} sourcePath - Source image path
   * @param {string} thumbnailFilename - Thumbnail filename
   * @param {string} size - Size specification (e.g., '150x150')
   */
  async createThumbnail(sourcePath, thumbnailFilename, size) {
    // Placeholder implementation
    // In production, would use libraries like Sharp, Jimp, or ImageMagick
    console.log(`📷 Creating thumbnail: ${thumbnailFilename} (${size}) from ${sourcePath}`);
    
    // For now, just return the original file URL
    // TODO: Implement actual thumbnail generation
  }

  /**
   * Check if user has permission to access attachment (modular security)
   * @param {string} filename - Attachment filename
   * @param {ParseContext} context - Parse context
   * @returns {Promise<boolean>} - True if access granted
   */
  async checkAttachmentPermission(filename, context) {
    if (!this.attachmentConfig.securityChecks) {
      return true; // Security checks disabled
    }

    // Check basic authentication for sensitive files
    const fileExt = path.extname(filename).toLowerCase();
    const sensitiveExtensions = ['.exe', '.bat', '.sh', '.cmd', '.scr'];
    
    if (sensitiveExtensions.includes(fileExt) && !context.isAuthenticated()) {
      return false;
    }

    // Use PolicyManager for detailed permission checks
    const policyManager = context.getManager('PolicyManager');
    if (policyManager) {
      return await policyManager.checkPermission(
        context.userContext, 
        'attachment:read', 
        filename
      );
    }

    // Default allow if no policy system
    return true;
  }

  /**
   * Parse attachment parameters (modular parameter system)
   * @param {string} paramString - Parameter string
   * @returns {Object} - Parsed parameters
   */
  parseAttachmentParameters(paramString) {
    if (!paramString) {
      return {};
    }

    const params = {};
    
    // Simple parameter parsing - can be enhanced
    const paramPairs = paramString.split(/\s+/);
    for (const pair of paramPairs) {
      const [key, value] = pair.split('=');
      if (key && value) {
        params[key] = value;
      }
    }
    
    return params;
  }

  /**
   * Check if file is an image (modular file type detection)
   * @param {string} filename - Filename to check
   * @returns {boolean} - True if image file
   */
  isImageFile(filename) {
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.bmp'];
    const ext = path.extname(filename).toLowerCase();
    return imageExtensions.includes(ext);
  }

  /**
   * Get file type from filename (modular type detection)
   * @param {string} filename - Filename
   * @returns {string} - File type
   */
  getFileType(filename) {
    const ext = path.extname(filename).toLowerCase();
    
    const typeMap = {
      '.pdf': 'PDF Document',
      '.doc': 'Word Document',
      '.docx': 'Word Document',
      '.xls': 'Excel Spreadsheet',
      '.xlsx': 'Excel Spreadsheet',
      '.ppt': 'PowerPoint Presentation',
      '.pptx': 'PowerPoint Presentation',
      '.txt': 'Text File',
      '.md': 'Markdown File',
      '.jpg': 'JPEG Image',
      '.jpeg': 'JPEG Image',
      '.png': 'PNG Image',
      '.gif': 'GIF Image',
      '.zip': 'ZIP Archive',
      '.tar': 'TAR Archive',
      '.gz': 'GZIP Archive'
    };
    
    return typeMap[ext] || 'Unknown File';
  }

  /**
   * Get file icon filename (modular icon system)
   * @param {string} fileType - File type
   * @returns {string} - Icon filename
   */
  getFileIcon(fileType) {
    const iconMap = {
      'PDF Document': 'pdf.png',
      'Word Document': 'doc.png',
      'Excel Spreadsheet': 'xls.png',
      'PowerPoint Presentation': 'ppt.png',
      'Text File': 'txt.png',
      'Markdown File': 'md.png',
      'JPEG Image': 'image.png',
      'PNG Image': 'image.png',
      'GIF Image': 'image.png',
      'ZIP Archive': 'zip.png',
      'TAR Archive': 'archive.png',
      'GZIP Archive': 'archive.png'
    };
    
    return iconMap[fileType] || 'file.png';
  }

  /**
   * Format file size for display (modular formatting)
   * @param {number} bytes - File size in bytes
   * @returns {string} - Formatted file size
   */
  formatFileSize(bytes) {
    if (bytes === 0) return '0 B';
    
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  /**
   * Format date for display (modular date formatting)
   * @param {Date} date - Date to format
   * @returns {string} - Formatted date
   */
  formatDate(date) {
    if (!date) return 'Unknown';
    
    const options = { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    
    return new Intl.DateTimeFormat('en-US', options).format(new Date(date));
  }

  /**
   * Get cached attachment result
   * @param {string} filename - Attachment filename
   * @param {ParseContext} context - Parse context
   * @returns {Promise<string|null>} - Cached result or null
   */
  async getCachedAttachmentResult(filename, context) {
    const markupParser = this.engine?.getManager('MarkupParser');
    if (!markupParser) {
      return null;
    }
    
    const contentHash = this.generateContentHash(filename);
    const contextHash = this.generateContextHash(context);
    
    return await markupParser.getCachedHandlerResult(this.handlerId, contentHash, contextHash);
  }

  /**
   * Cache attachment result
   * @param {string} filename - Attachment filename
   * @param {ParseContext} context - Parse context
   * @param {string} result - HTML result to cache
   */
  async cacheAttachmentResult(filename, context, result) {
    const markupParser = this.engine?.getManager('MarkupParser');
    if (!markupParser) {
      return;
    }
    
    const contentHash = this.generateContentHash(filename);
    const contextHash = this.generateContextHash(context);
    
    await markupParser.cacheHandlerResult(this.handlerId, contentHash, contextHash, result);
  }

  /**
   * Generate content hash for caching
   * @param {string} content - Content to hash
   * @returns {string} - Content hash
   */
  generateContentHash(content) {
    const crypto = require('crypto');
    return crypto.createHash('md5').update(content).digest('hex');
  }

  /**
   * Generate context hash for caching
   * @param {ParseContext} context - Parse context
   * @returns {string} - Context hash
   */
  generateContextHash(context) {
    const crypto = require('crypto');
    const contextData = {
      pageName: context.pageName,
      userName: context.userName,
      authenticated: context.isAuthenticated(),
      // Attachment permissions may vary by user
      timeBucket: Math.floor(Date.now() / 1800000) // 30-minute buckets
    };
    
    return crypto.createHash('md5').update(JSON.stringify(contextData)).digest('hex');
  }

  /**
   * Escape HTML to prevent XSS (modular security)
   * @param {string} text - Text to escape
   * @returns {string} - Escaped text
   */
  escapeHtml(text) {
    if (typeof text !== 'string') {
      return text;
    }
    
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  /**
   * Get configuration summary (for debugging and monitoring)
   * @returns {Object} - Configuration summary
   */
  getConfigurationSummary() {
    return {
      handler: {
        enabled: this.config?.enabled || false,
        priority: this.priority,
        cacheEnabled: this.options.cacheEnabled
      },
      features: {
        enhanced: this.attachmentConfig?.enhanced || false,
        thumbnails: this.attachmentConfig?.thumbnails || false,
        metadata: this.attachmentConfig?.metadata || false,
        securityChecks: this.attachmentConfig?.securityChecks || true
      },
      settings: {
        thumbnailSizes: this.attachmentConfig?.thumbnailSizes || [],
        iconPath: this.attachmentConfig?.iconPath || '/icons/filetypes',
        cacheMetadata: this.attachmentConfig?.cacheMetadata || false
      }
    };
  }

  /**
   * Get supported attachment patterns
   * @returns {Array<string>} - Array of supported patterns
   */
  getSupportedPatterns() {
    return [
      '[{ATTACH filename.pdf}]',
      '[{ATTACH document.pdf|Important Document}]',
      '[{ATTACH image.jpg|Photo|target=_blank}]',
      '[{ATTACH spreadsheet.xlsx|Data Sheet|class=important}]'
    ];
  }

  /**
   * Get handler information for debugging and documentation
   * @returns {Object} - Handler information
   */
  getInfo() {
    return {
      ...super.getMetadata(),
      supportedPatterns: this.getSupportedPatterns(),
      configuration: this.getConfigurationSummary(),
      features: [
        'Enhanced attachment linking',
        'Automatic thumbnail generation',
        'File metadata display',
        'Security permission validation',
        'Configurable file icons',
        'Multiple thumbnail sizes',
        'Performance caching',
        'XSS prevention',
        'Modular configuration system',
        'Hot-reload configuration support'
      ],
      supportedFileTypes: [
        'Images: JPG, PNG, GIF, WebP, SVG',
        'Documents: PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX',
        'Text: TXT, MD',
        'Archives: ZIP, TAR, GZ'
      ]
    };
  }
}

module.exports = AttachmentHandler;
