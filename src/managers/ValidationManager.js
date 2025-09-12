const BaseManager = require('./BaseManager');
const { v4: uuidv4, validate: validateUuid } = require('uuid');
const path = require('path');

/**
 * ValidationManager - Ensures all files follow UUID naming convention and contain required metadata
 * Prevents creation of files that don't conform to the established architecture
 */
class ValidationManager extends BaseManager {
  constructor(engine) {
    super(engine);
    this.requiredMetadataFields = ['title', 'uuid', 'slug', 'system-category', 'user-keywords', 'lastModified'];
    this.validSystemCategories = [
      'System', 'System/Admin', 'Documentation', 'General', 'User', 'Test', 'Developer'
    ];
  }

  async initialize(config = {}) {
    await super.initialize(config);
    this.maxUserKeywords = config.maxUserKeywords || 3;
    this.maxCategories = config.maxCategories || 3;
  }

  /**
   * Validate that a filename follows UUID naming convention
   * @param {string} filename - The filename to validate
   * @returns {Object} Validation result with success and error properties
   */
  validateFilename(filename) {
    const result = { success: false, error: null };
    
    // Extract filename without extension
    const nameWithoutExt = path.parse(filename).name;
    
    // Check if it's a valid UUID
    if (!validateUuid(nameWithoutExt)) {
      result.error = `Filename '${filename}' does not follow UUID naming convention. Expected format: {uuid}.md`;
      return result;
    }
    
    // Check file extension
    if (path.extname(filename) !== '.md') {
      result.error = `File '${filename}' must have .md extension`;
      return result;
    }
    
    result.success = true;
    return result;
  }

  /**
   * Validate page metadata contains all required fields with proper values
   * @param {Object} metadata - The metadata object to validate
   * @returns {Object} Validation result with success, error, and warnings properties
   */
  validateMetadata(metadata) {
    const result = { success: false, error: null, warnings: [] };
    
    if (!metadata || typeof metadata !== 'object') {
      result.error = 'Metadata is required and must be an object';
      return result;
    }
    
    // Check required fields
    for (const field of this.requiredMetadataFields) {
      if (!(field in metadata)) {
        result.error = `Required metadata field '${field}' is missing`;
        return result;
      }
    }
    
    // Validate specific fields
    const validationErrors = [];
    
    // Title validation
    if (!metadata.title || typeof metadata.title !== 'string' || metadata.title.trim().length === 0) {
      validationErrors.push('title must be a non-empty string');
    }
    
    // UUID validation
    if (!metadata.uuid || !validateUuid(metadata.uuid)) {
      validationErrors.push('uuid must be a valid RFC 4122 UUID v4');
    }
    
    // Slug validation
    if (!metadata.slug || typeof metadata.slug !== 'string' || !this.isValidSlug(metadata.slug)) {
      validationErrors.push('slug must be a URL-safe string (lowercase, alphanumeric, hyphens only)');
    }
    
    // System category validation
    if (metadata['system-category']) {
      if (typeof metadata['system-category'] !== 'string') {
        validationErrors.push('system-category must be a string');
      } else if (!this.validSystemCategories.includes(metadata['system-category'])) {
        result.warnings.push(`System category '${metadata['system-category']}' is not in the standard list: ${this.validSystemCategories.join(', ')}`);
      }
    }
    
    // User keywords validation
    if (metadata['user-keywords']) {
      if (!Array.isArray(metadata['user-keywords'])) {
        validationErrors.push('user-keywords must be an array');
      } else if (metadata['user-keywords'].length > this.maxUserKeywords) {
        validationErrors.push(`Maximum ${this.maxUserKeywords} user keywords allowed, found ${metadata['user-keywords'].length}`);
      } else {
        for (const keyword of metadata['user-keywords']) {
          if (typeof keyword !== 'string' || keyword.trim().length === 0) {
            validationErrors.push('All user keywords must be non-empty strings');
            break;
          }
        }
      }
    }
    
    // Last modified validation
    if (metadata.lastModified) {
      const date = new Date(metadata.lastModified);
      if (isNaN(date.getTime())) {
        validationErrors.push('lastModified must be a valid ISO date string');
      }
    }
    
    if (validationErrors.length > 0) {
      result.error = `Metadata validation failed: ${validationErrors.join(', ')}`;
      return result;
    }
    
    result.success = true;
    return result;
  }

  /**
   * Validate slug format (URL-safe)
   * @param {string} slug - The slug to validate
   * @returns {boolean} True if valid
   */
  isValidSlug(slug) {
    // Must be lowercase, alphanumeric, and hyphens only
    return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug);
  }

  /**
   * Validate a complete page before saving
   * @param {string} filename - The target filename
   * @param {Object} metadata - The page metadata
   * @param {string} content - The page content (optional validation)
   * @returns {Object} Comprehensive validation result
   */
  validatePage(filename, metadata, content = null) {
    const result = { 
      success: false, 
      error: null, 
      warnings: [],
      filenameValid: false,
      metadataValid: false
    };
    
    // Validate filename
    const filenameValidation = this.validateFilename(filename);
    result.filenameValid = filenameValidation.success;
    if (!filenameValidation.success) {
      result.error = filenameValidation.error;
      return result;
    }
    
    // Validate metadata
    const metadataValidation = this.validateMetadata(metadata);
    result.metadataValid = metadataValidation.success;
    result.warnings.push(...(metadataValidation.warnings || []));
    
    if (!metadataValidation.success) {
      result.error = metadataValidation.error;
      return result;
    }
    
    // Validate UUID consistency between filename and metadata
    const filenameUuid = path.parse(filename).name;
    if (metadata.uuid !== filenameUuid) {
      result.error = `UUID mismatch: filename uses '${filenameUuid}' but metadata contains '${metadata.uuid}'`;
      return result;
    }
    
    // Optional content validation
    if (content !== null) {
      const contentValidation = this.validateContent(content);
      result.warnings.push(...(contentValidation.warnings || []));
    }
    
    result.success = true;
    return result;
  }

  /**
   * Validate page content (optional checks)
   * @param {string} content - The page content
   * @returns {Object} Content validation result
   */
  validateContent(content) {
    const result = { warnings: [] };
    
    if (!content || typeof content !== 'string') {
      result.warnings.push('Content is empty or not a string');
      return result;
    }
    
    // Check for basic markdown structure
    if (!content.includes('#')) {
      result.warnings.push('Content appears to lack markdown headers');
    }
    
    // Check for very short content
    if (content.trim().length < 10) {
      result.warnings.push('Content is very short (less than 10 characters)');
    }
    
    return result;
  }

  /**
   * Generate properly formatted metadata for a new page
   * @param {string} title - Page title
   * @param {Object} options - Additional metadata options
   * @returns {Object} Complete metadata object with all required fields
   */
  generateValidMetadata(title, options = {}) {
    const uuid = options.uuid || uuidv4();
    const slug = options.slug || this.generateSlug(title);
    
    return {
      title: title.trim(),
      category: options.category || 'General',
      categories: options.categories || [options.category || 'General'],
      'user-keywords': options.userKeywords || options['user-keywords'] || [],
      uuid: uuid,
      slug: slug,
      lastModified: new Date().toISOString(),
      ...options // Allow override of any fields
    };
  }

  /**
   * Generate URL-safe slug from title
   * @param {string} title - Page title
   * @returns {string} URL-safe slug
   */
  generateSlug(title) {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .replace(/-+/g, '-');
  }

  /**
   * Generate UUID-based filename from metadata
   * @param {Object} metadata - Page metadata containing UUID
   * @returns {string} Filename in UUID.md format
   */
  generateFilename(metadata) {
    if (!metadata.uuid) {
      throw new Error('UUID is required to generate filename');
    }
    return `${metadata.uuid}.md`;
  }

  /**
   * Validate and fix an existing page file
   * @param {string} filePath - Path to the existing file
   * @param {Object} fileData - Object with content and metadata from gray-matter
   * @returns {Object} Validation result with fix suggestions
   */
  validateExistingFile(filePath, fileData) {
    const filename = path.basename(filePath);
    const result = this.validatePage(filename, fileData.data, fileData.content);
    
    // Add fix suggestions if validation failed
    if (!result.success) {
      result.fixes = this.generateFixSuggestions(filename, fileData.data);
    }
    
    return result;
  }

  /**
   * Generate suggestions to fix validation issues
   * @param {string} filename - Current filename
   * @param {Object} metadata - Current metadata
   * @returns {Object} Fix suggestions
   */
  generateFixSuggestions(filename, metadata) {
    const fixes = {
      filename: null,
      metadata: { ...metadata }
    };
    
    // Fix UUID if missing or invalid
    if (!metadata.uuid || !validateUuid(metadata.uuid)) {
      fixes.metadata.uuid = uuidv4();
    }
    
    // Fix filename to match UUID
    const targetFilename = `${fixes.metadata.uuid}.md`;
    if (filename !== targetFilename) {
      fixes.filename = targetFilename;
    }
    
    // Fix missing required fields
    if (!metadata.title) {
      fixes.metadata.title = path.parse(filename).name; // Use filename as fallback
    }
    
    if (!metadata.slug) {
      fixes.metadata.slug = this.generateSlug(fixes.metadata.title);
    }
    
    if (!metadata.category) {
      fixes.metadata.category = 'General';
    }
    
    if (!metadata['user-keywords']) {
      fixes.metadata['user-keywords'] = [];
    }
    
    if (!metadata.lastModified) {
      fixes.metadata.lastModified = new Date().toISOString();
    }
    
    return fixes;
  }
}

module.exports = ValidationManager;
