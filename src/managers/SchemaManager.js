const BaseManager = require('./BaseManager');
const fs = require('fs-extra');
const path = require('path');
const logger = require('../utils/logger');

/**
 * SchemaManager - Loads and provides access to JSON schemas for validation
 *
 * Manages JSON Schema files used throughout the wiki for validating page metadata,
 * configuration files, and other structured data.
 *
 * @class SchemaManager
 * @extends BaseManager
 *
 * @property {Map<string, Object>} schemas - Loaded JSON schemas by name
 *
 * @see {@link BaseManager} for base functionality
 * @see {@link ValidationManager} for schema usage
 *
 * @example
 * const schemaManager = engine.getManager('SchemaManager');
 * const pageSchema = schemaManager.getSchema('page');
 */
class SchemaManager extends BaseManager {
  /**
   * Creates a new SchemaManager instance
   *
   * @constructor
   * @param {WikiEngine} engine - The wiki engine instance
   */
  constructor(engine) {
    super(engine);
    this.schemas = new Map();
  }

  /**
   * Initializes the SchemaManager by loading all .schema.json files
   *
   * @async
   * @returns {Promise<void>}
   * @throws {Error} If ConfigurationManager is not available
   */
  async initialize() {
    const configManager = this.engine.getManager('ConfigurationManager');
    if (!configManager) {
      throw new Error('SchemaManager requires ConfigurationManager to be initialized.');
    }

    // Fetch the schemas directory from ConfigurationManager (no fallback - defined in app-default-config.json)
    const schemasDir = configManager.getProperty('amdwiki.directories.schemas');

    try {
      const files = await fs.readdir(schemasDir);
      for (const file of files) {
        if (file.endsWith('.schema.json')) {
          const schemaName = path.basename(file, '.schema.json');
          const schemaPath = path.join(schemasDir, file);
          const schema = await fs.readJson(schemaPath);
          this.schemas.set(schemaName, schema);
        }
      }
      logger.info(`📋 Loaded ${this.schemas.size} schemas from ${schemasDir}`);
    } catch (error) {
      // Log a warning if the directory doesn't exist, but don't crash the app
      if (error.code === 'ENOENT') {
        logger.warn(`Schema directory not found at ${schemasDir}. No schemas loaded.`);
      } else {
        logger.error(`Failed to load schemas from ${schemasDir}`, { error });
      }
    }
  }

  /**
   * Retrieves a loaded JSON schema by its name.
   * @param {string} name The name of the schema (without .schema.json).
   * @returns {object|undefined} The loaded schema object, or undefined if not found.
   */
  getSchema(name) {
    return this.schemas.get(name);
  }

  /**
   * Returns a list of all loaded schema names.
   * @returns {string[]} An array of schema names.
   */
  getAllSchemaNames() {
    return Array.from(this.schemas.keys());
  }
}

module.exports = SchemaManager;