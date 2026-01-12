/**
 * The VariableManager is an interface responsible for managing variables used in the wiki (for example, constant variables that can be expanded inside pages).
 * The WikiEngine creates and initializes the VariableManager when it is instantiated. It typically instantiates the default implementation called DefaultVariableManager.
 * During the initialization phase of the WikiEngine, it creates instances of its core managers including VariableManager and calls their initialize() method passing context and properties.
 * This setup allows JSPWiki to handle variable substitution and expansion consistently across the wiki pages.
 * The VariableManager is accessible via WikiEngine.getManager('VariableManager') after initialization.
 */

import BaseManager from './BaseManager';
import { v4 as uuidv4, validate as validateUuid } from 'uuid';
import path from 'path';
import logger from '../utils/logger';
import type { WikiEngine } from '../types/WikiEngine';
import type ConfigurationManager from './ConfigurationManager';

/**
 * Validation result interface
 */
export interface ValidationResult {
  success: boolean;
  error: string | null;
}

/**
 * Metadata validation result interface
 */
export interface MetadataValidationResult extends ValidationResult {
  warnings?: string[];
}

/**
 * Page validation result interface
 */
export interface PageValidationResult extends MetadataValidationResult {
  filenameValid: boolean;
  metadataValid: boolean;
  fixes?: FixSuggestions;
}

/**
 * Content validation result interface
 */
export interface ContentValidationResult {
  warnings: string[];
}

/**
 * System category configuration
 */
export interface CategoryConfig {
  label: string;
  description?: string;
  default?: boolean;
  storageLocation?: string;
  enabled?: boolean;
  key?: string;
}

/**
 * System categories configuration map
 */
export type SystemCategoriesConfig = Record<string, CategoryConfig>;

/**
 * Options for generating metadata
 */
export interface GenerateMetadataOptions {
  uuid?: string;
  slug?: string;
  'system-category'?: string;
  userKeywords?: string[];
  'user-keywords'?: string[];
  [key: string]: unknown;
}

/**
 * File data from gray-matter
 */
export interface FileData {
  content: string;
  data: Record<string, unknown>;
}

/**
 * Fix suggestions for validation issues
 */
export interface FixSuggestions {
  filename: string | null;
  metadata: Record<string, unknown>;
}

/**
 * Page metadata interface
 */
export interface PageMetadata {
  title: string;
  uuid: string;
  slug: string;
  'system-category': string;
  'user-keywords': string[];
  lastModified: string;
  [key: string]: unknown;
}

/**
 * ValidationManager - Ensures all files follow UUID naming and metadata conventions
 *
 * Validates page metadata and enforces architectural constraints including UUID-based
 * naming, required metadata fields, valid system categories, and keyword limits.
 *
 * @class ValidationManager
 * @extends BaseManager
 *
 * @property {string[]} requiredMetadataFields - Required metadata fields
 * @property {string[]} validSystemCategories - Valid system category values
 * @property {number} maxUserKeywords - Maximum user keywords allowed
 * @property {number} maxCategories - Maximum categories allowed
 *
 * @see {@link BaseManager} for base functionality
 *
 * @example
 * const validationManager = engine.getManager('ValidationManager');
 * const result = validationManager.validatePage(metadata);
 * if (!result.valid) console.error(result.errors);
 */
class ValidationManager extends BaseManager {
  private requiredMetadataFields: string[];
  private validSystemCategories: string[];
  private systemCategoriesConfig: SystemCategoriesConfig | null;
  private maxUserKeywords!: number;
  private maxCategories!: number;

  /**
   * Creates a new ValidationManager instance
   *
   * @constructor
   * @param {any} engine - The wiki engine instance
   */

  constructor(engine: WikiEngine) {
    super(engine);
    this.requiredMetadataFields = ['title', 'uuid', 'slug', 'system-category', 'user-keywords', 'lastModified'];
    // Legacy hardcoded categories (fallback if config not available)
    this.validSystemCategories = ['system', 'documentation', 'general', 'user', 'test', 'developer'];
    this.systemCategoriesConfig = null;
  }

  /**
   * Initialize the ValidationManager
   *
   * @async
   * @param {Record<string, unknown>} [config={}] - Configuration object
   * @returns {Promise<void>}
   */
  async initialize(config: Record<string, unknown> = {}): Promise<void> {
    await super.initialize(config);
    const configManager = this.engine.getManager<ConfigurationManager>('ConfigurationManager');

    // Load max keywords
    this.maxUserKeywords = configManager
      ? (configManager.getProperty('amdwiki.maximum.user-keywords', 5) as number)
      : (config.maxUserKeywords as number) || 5;
    this.maxCategories = (config.maxCategories as number) || 3;

    // Load system categories from configuration
    this.loadSystemCategories(configManager);

    logger.info('ValidationManager initialized');
    logger.info(`Loaded ${this.validSystemCategories.length} system categories: ${this.validSystemCategories.join(', ')}`);
  }

  /**
   * Load system categories from ConfigurationManager
   * @param {ConfigurationManager | undefined} configManager - Configuration manager instance
   * @returns {void}
   */
  loadSystemCategories(configManager: ConfigurationManager | undefined): void {
    if (!configManager) {
      logger.warn('ConfigurationManager not available, using hardcoded system categories');
      return;
    }

    try {
      // Get system categories configuration
      const systemCategoriesConfig = configManager.getProperty('amdwiki.system-category', null) as SystemCategoriesConfig | null;

      if (systemCategoriesConfig && typeof systemCategoriesConfig === 'object') {
        this.systemCategoriesConfig = systemCategoriesConfig;

        // Build valid categories list from enabled categories
        const categories: string[] = [];
        for (const [_key, categoryConfig] of Object.entries(systemCategoriesConfig)) {
          if (categoryConfig.enabled !== false) {
            // Use the label as the valid category value
            categories.push(categoryConfig.label);
          }
        }

        if (categories.length > 0) {
          this.validSystemCategories = categories;
          logger.info(`Loaded ${categories.length} system categories from configuration`);
        } else {
          logger.warn('No enabled system categories found in configuration, using defaults');
        }
      } else {
        logger.warn('System categories configuration not found, using hardcoded defaults');
      }
    } catch (error) {
      logger.error('Error loading system categories from configuration:', (error as Error).message);
      logger.warn('Falling back to hardcoded system categories');
    }
  }

  /**
   * Get system category configuration by label
   * @param {string} label - Category label (e.g., "General", "System")
   * @returns {CategoryConfig | null} Category configuration or null if not found
   */
  getCategoryConfig(label: string): CategoryConfig | null {
    if (!this.systemCategoriesConfig) {
      return null;
    }

    // Find category by label (case-insensitive)
    for (const [key, config] of Object.entries(this.systemCategoriesConfig)) {
      if (config.label.toLowerCase() === label.toLowerCase()) {
        return { key, ...config };
      }
    }

    return null;
  }

  /**
   * Get storage location for a category
   * @param {string} category - Category label
   * @returns {string} Storage location ('regular' or 'required')
   */
  getCategoryStorageLocation(category: string): string {
    const config = this.getCategoryConfig(category);
    return config?.storageLocation || 'regular';
  }

  /**
   * Get all enabled system categories
   * @returns {CategoryConfig[]} Array of category configurations
   */
  getAllSystemCategories(): CategoryConfig[] {
    if (!this.systemCategoriesConfig) {
      // Return legacy format
      return this.validSystemCategories.map((label) => ({
        label,
        description: '',
        default: label === 'general',
        storageLocation: 'regular',
        enabled: true
      }));
    }

    return Object.entries(this.systemCategoriesConfig)
      .filter(([_key, config]) => config.enabled !== false)
      .map(([key, config]) => ({ key, ...config }));
  }

  /**
   * Get the default system category
   * @returns {string} Default category label
   */
  getDefaultSystemCategory(): string {
    if (!this.systemCategoriesConfig) {
      return 'general';
    }

    for (const [_key, config] of Object.entries(this.systemCategoriesConfig)) {
      if (config.default === true && config.enabled !== false) {
        return config.label;
      }
    }

    // Fallback to first enabled category
    for (const [_key, config] of Object.entries(this.systemCategoriesConfig)) {
      if (config.enabled !== false) {
        return config.label;
      }
    }

    return 'general';
  }

  /**
   * Validate that a filename follows UUID naming convention
   * @param {string} filename - The filename to validate
   * @returns {ValidationResult} Validation result with success and error properties
   */
  validateFilename(filename: string): ValidationResult {
    const result: ValidationResult = { success: false, error: null };

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
   * @param {Record<string, unknown>} metadata - The metadata object to validate
   * @returns {MetadataValidationResult} Validation result with success, error, and warnings properties
   */
  validateMetadata(metadata: Record<string, unknown>): MetadataValidationResult {
    const result: MetadataValidationResult = { success: false, error: null, warnings: [] };

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
    const validationErrors: string[] = [];

    // Title validation
    if (!metadata.title || typeof metadata.title !== 'string' || metadata.title.trim().length === 0) {
      validationErrors.push('title must be a non-empty string');
    }

    // UUID validation

    if (!metadata.uuid || !validateUuid(metadata.uuid as string)) {
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
      } else if (!this.validSystemCategories.map((cat) => cat.toLowerCase()).includes(metadata['system-category'].toLowerCase())) {
        if (result.warnings) {
          result.warnings.push(`System category '${metadata['system-category']}' is not in the standard list: ${this.validSystemCategories.join(', ')}`);
        }
      }
    }

    // User keywords validation
    if (metadata['user-keywords']) {
      if (!Array.isArray(metadata['user-keywords'])) {
        validationErrors.push('user-keywords must be an array');
      } else {
        if ((metadata['user-keywords'] as unknown[]).length > this.maxUserKeywords) {
          validationErrors.push(`Maximum ${this.maxUserKeywords} user keywords are allowed, found ${(metadata['user-keywords'] as unknown[]).length}`);
        }
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
      const date = new Date(metadata.lastModified as string);
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
  isValidSlug(slug: string): boolean {
    // Must be lowercase, alphanumeric, and hyphens only
    return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug);
  }

  /**
   * Validate a complete page before saving
   * @param {string} filename - The target filename
   * @param {Record<string, unknown>} metadata - The page metadata
   * @param {string | null} content - The page content (optional validation)
   * @returns {PageValidationResult} Comprehensive validation result
   */
  validatePage(filename: string, metadata: Record<string, unknown>, content: string | null = null): PageValidationResult {
    const result: PageValidationResult = {
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
    if (result.warnings) {
      result.warnings.push(...(metadataValidation.warnings || []));
    }

    if (!metadataValidation.success) {
      result.error = metadataValidation.error;
      return result;
    }

    // Validate UUID consistency between filename and metadata
    const filenameUuid = path.parse(filename).name;
    if (metadata.uuid !== filenameUuid) {
      // eslint-disable-next-line @typescript-eslint/restrict-template-expressions -- Safe coercion
      result.error = `UUID mismatch: filename uses '${filenameUuid}' but metadata contains '${metadata.uuid}'`;
      return result;
    }

    // Optional content validation
    if (content !== null) {
      const contentValidation = this.validateContent(content);
      if (result.warnings) {
        result.warnings.push(...(contentValidation.warnings || []));
      }
    }

    result.success = true;
    return result;
  }

  /**
   * Validate page content (optional checks)
   * @param {string} content - The page content
   * @returns {ContentValidationResult} Content validation result
   */
  validateContent(content: string): ContentValidationResult {
    const result: ContentValidationResult = { warnings: [] };

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
   * @param {GenerateMetadataOptions} options - Additional metadata options
   * @returns {PageMetadata} Complete metadata object with all required fields
   */
  generateValidMetadata(title: string, options: GenerateMetadataOptions = {}): PageMetadata {
    const uuid = options.uuid || uuidv4();
    const slug = options.slug || this.generateSlug(title);

    // Use the default category from configuration
    const defaultSystemCategory = this.getDefaultSystemCategory();

    return {
      title: title.trim(),
      'system-category': options['system-category'] || defaultSystemCategory,

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
  generateSlug(title: string): string {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .replace(/-+/g, '-');
  }

  /**
   * Generate UUID-based filename from metadata
   * @param {PageMetadata} metadata - Page metadata containing UUID
   * @returns {string} Filename in UUID.md format
   */
  generateFilename(metadata: PageMetadata): string {
    if (!metadata.uuid) {
      throw new Error('UUID is required to generate filename');
    }
    return `${metadata.uuid}.md`;
  }

  /**
   * Validate and fix an existing page file
   * @param {string} filePath - Path to the existing file
   * @param {FileData} fileData - Object with content and metadata from gray-matter
   * @returns {PageValidationResult} Validation result with fix suggestions
   */
  validateExistingFile(filePath: string, fileData: FileData): PageValidationResult {
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
   * @param {Record<string, unknown>} metadata - Current metadata
   * @returns {FixSuggestions} Fix suggestions
   */
  generateFixSuggestions(filename: string, metadata: Record<string, unknown>): FixSuggestions {
    const fixes: FixSuggestions = {
      filename: null,
      metadata: { ...metadata }
    };

    // Fix UUID if missing or invalid

    if (!metadata.uuid || !validateUuid(metadata.uuid as string)) {
      fixes.metadata.uuid = uuidv4();
    }

    // Fix filename to match UUID
    // eslint-disable-next-line @typescript-eslint/restrict-template-expressions -- Safe coercion
    const targetFilename = `${fixes.metadata.uuid}.md`;
    if (filename !== targetFilename) {
      fixes.filename = targetFilename;
    }

    // Fix missing required fields
    if (!metadata.title) {
      fixes.metadata.title = path.parse(filename).name; // Use filename as fallback
    }

    if (!metadata.slug) {
      fixes.metadata.slug = this.generateSlug(fixes.metadata.title as string);
    }

    if (!metadata['system-category']) {
      fixes.metadata['system-category'] = this.getDefaultSystemCategory();
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

export default ValidationManager;

// CommonJS compatibility
module.exports = ValidationManager;
