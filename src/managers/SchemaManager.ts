import BaseManager from './BaseManager';
import fs from 'fs-extra';
import path from 'path';
import logger from '../utils/logger';
import type { WikiEngine } from '../types/WikiEngine';

/**
 * JSON Schema type - represents a JSON Schema object
 */
export type JSONSchema = Record<string, unknown>;

/**
 * SchemaManager - Loads and provides access to JSON schemas for validation
 *
 * Manages JSON Schema files used throughout the wiki for validating page metadata,
 * configuration files, and other structured data.
 *
 * @class SchemaManager
 * @extends BaseManager
 *
 * @property {Map<string, JSONSchema>} schemas - Loaded JSON schemas by name
 *
 * @see {@link BaseManager} for base functionality
 * @see {@link ValidationManager} for schema usage
 *
 * @example
 * const schemaManager = engine.getManager('SchemaManager');
 * const pageSchema = schemaManager.getSchema('page');
 */
class SchemaManager extends BaseManager {
  private schemas: Map<string, JSONSchema>;

  /**
   * Creates a new SchemaManager instance
   *
   * @constructor
   * @param {any} engine - The wiki engine instance
   */

  constructor(engine: WikiEngine) {
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
  async initialize(): Promise<void> {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const configManager = this.engine.getManager('ConfigurationManager');
    if (!configManager) {
      throw new Error('SchemaManager requires ConfigurationManager to be initialized.');
    }

    // Fetch the schemas directory from ConfigurationManager (no fallback - defined in app-default-config.json)
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    const schemasDir = configManager.getProperty('amdwiki.directories.schemas') as string;

    try {
      const files = await fs.readdir(schemasDir);

      for (const file of files) {
        if (file.endsWith('.schema.json')) {
          const schemaName = path.basename(file, '.schema.json');

          const schemaPath = path.join(schemasDir, file);

          const schema = (await fs.readJson(schemaPath)) as JSONSchema;
          this.schemas.set(schemaName, schema);
        }
      }
      logger.info(`📋 Loaded ${this.schemas.size} schemas from ${schemasDir}`);
    } catch (error) {
      // Log a warning if the directory doesn't exist, but don't crash the app
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
        logger.warn(`Schema directory not found at ${schemasDir}. No schemas loaded.`);
      } else {
        logger.error(`Failed to load schemas from ${schemasDir}`, { error });
      }
    }
  }

  /**
   * Retrieves a loaded JSON schema by its name.
   * @param {string} name The name of the schema (without .schema.json).
   * @returns {JSONSchema | undefined} The loaded schema object, or undefined if not found.
   */
  getSchema(name: string): JSONSchema | undefined {
    return this.schemas.get(name);
  }

  /**
   * Returns a list of all loaded schema names.
   * @returns {string[]} An array of schema names.
   */
  getAllSchemaNames(): string[] {
    return Array.from(this.schemas.keys());
  }
}

export default SchemaManager;

// CommonJS compatibility
module.exports = SchemaManager;
