/**
 * Import Manager
 *
 * Manages the import of content from external wiki formats into amdWiki.
 * Uses an extensible converter registry pattern to support multiple formats
 * (JSPWiki, MediaWiki, Confluence, etc.).
 *
 * @module ImportManager
 *
 * @example
 * const importManager = engine.getManager('ImportManager');
 *
 * // Register additional converters
 * importManager.registerConverter(new MediaWikiConverter());
 *
 * // Preview import
 * const preview = await importManager.previewImport({
 *   sourceDir: '/path/to/wiki',
 *   format: 'auto'
 * });
 *
 * // Execute import
 * const result = await importManager.importPages({
 *   sourceDir: '/path/to/wiki',
 *   format: 'jspwiki',
 *   dryRun: false
 * });
 */

import path from 'path';
import fs from 'fs-extra';
import { v4 as uuidv4 } from 'uuid';
import BaseManager, { BackupData } from './BaseManager';
import type { WikiEngine } from '../types/WikiEngine';
import { IContentConverter, ConversionResult } from '../converters/IContentConverter';
import JSPWikiConverter from '../converters/JSPWikiConverter';
import type ConfigurationManager from './ConfigurationManager';

/**
 * Options for import operations
 */
export interface ImportOptions {
  /** Source directory containing files to import */
  sourceDir: string;

  /** Target directory for converted files (default: data/pages) */
  targetDir?: string;

  /** Format ID or 'auto' for auto-detection */
  format?: string;

  /** Keep original files after conversion (default: true) */
  preserveOriginals?: boolean;

  /** Preview only, don't write files (default: false) */
  dryRun?: boolean;

  /** Generate UUIDs for pages that don't have them (default: true) */
  generateUUIDs?: boolean;

  /** File extensions to process (default: determined by format) */
  fileExtensions?: string[];

  /** Maximum files to process (for large imports) */
  limit?: number;

  /** Skip first N files (for resuming imports) */
  offset?: number;
}

/**
 * Error information for failed imports
 */
export interface ImportError {
  /** Source file path */
  file: string;

  /** Error message */
  message: string;

  /** Error stack trace (optional) */
  stack?: string;
}

/**
 * Information about an imported file
 */
export interface ImportedFile {
  /** Original source file path */
  sourcePath: string;

  /** Target file path */
  targetPath: string;

  /** Format detected/used */
  format: string;

  /** File size in bytes */
  size: number;

  /** Extracted metadata */
  metadata: Record<string, unknown>;

  /** Conversion warnings */
  warnings: string[];

  /** Whether file was actually written (false for dry runs) */
  written: boolean;
}

/**
 * Result of an import operation
 */
export interface ImportResult {
  /** Overall success status */
  success: boolean;

  /** Number of files converted */
  converted: number;

  /** Number of files skipped */
  skipped: number;

  /** Number of files with errors */
  failed: number;

  /** Total files processed */
  total: number;

  /** Error details */
  errors: ImportError[];

  /** Information about imported files */
  files: ImportedFile[];

  /** Import duration in milliseconds */
  durationMs: number;
}

/**
 * Import Manager class
 *
 * Manages content import with extensible format support via converter registry.
 */
class ImportManager extends BaseManager {
  /** Registry of format converters */
  private converterRegistry: Map<string, IContentConverter>;

  /** Logger instance */
  private logger: Console;

  constructor(engine: WikiEngine) {
    super(engine);
    this.converterRegistry = new Map();
    this.logger = console;
  }

  /**
   * Initialize the manager
   */
  async initialize(config: Record<string, unknown> = {}): Promise<void> {
    await super.initialize(config);

    // Register built-in converters
    this.registerConverter(new JSPWikiConverter());

    this.logger.log('[ImportManager] Initialized with converters:', this.getAvailableFormats());
  }

  /**
   * Register a content converter
   *
   * @param converter - Converter instance implementing IContentConverter
   */
  registerConverter(converter: IContentConverter): void {
    if (this.converterRegistry.has(converter.formatId)) {
      this.logger.warn(`[ImportManager] Overwriting existing converter: ${converter.formatId}`);
    }
    this.converterRegistry.set(converter.formatId, converter);
  }

  /**
   * Get available format IDs
   *
   * @returns Array of registered format identifiers
   */
  getAvailableFormats(): string[] {
    return Array.from(this.converterRegistry.keys());
  }

  /**
   * Get converter by format ID
   *
   * @param formatId - Format identifier
   * @returns Converter instance or undefined
   */
  getConverter(formatId: string): IContentConverter | undefined {
    return this.converterRegistry.get(formatId);
  }

  /**
   * Get all registered converters with their metadata
   *
   * @returns Array of converter info objects
   */
  getConverterInfo(): Array<{ formatId: string; formatName: string; fileExtensions: string[] }> {
    return Array.from(this.converterRegistry.values()).map(converter => ({
      formatId: converter.formatId,
      formatName: converter.formatName,
      fileExtensions: converter.fileExtensions
    }));
  }

  /**
   * Auto-detect format from file content
   *
   * @param content - File content
   * @param filename - Filename (for extension matching)
   * @returns Format ID or null if no match
   */
  detectFormat(content: string, filename: string): string | null {
    for (const [formatId, converter] of this.converterRegistry.entries()) {
      if (converter.canHandle(content, filename)) {
        return formatId;
      }
    }
    return null;
  }

  /**
   * Preview import without writing files
   *
   * @param options - Import options (dryRun is forced to true)
   * @returns Import result with preview data
   */
  async previewImport(options: ImportOptions): Promise<ImportResult> {
    return this.importPages({ ...options, dryRun: true });
  }

  /**
   * Import pages from source directory
   *
   * @param options - Import options
   * @returns Import result with statistics and file details
   */
  async importPages(options: ImportOptions): Promise<ImportResult> {
    const startTime = Date.now();
    const result: ImportResult = {
      success: true,
      converted: 0,
      skipped: 0,
      failed: 0,
      total: 0,
      errors: [],
      files: [],
      durationMs: 0
    };

    // Validate source directory
    if (!await fs.pathExists(options.sourceDir)) {
      result.success = false;
      result.errors.push({
        file: options.sourceDir,
        message: 'Source directory does not exist'
      });
      result.durationMs = Date.now() - startTime;
      return result;
    }

    // Get target directory (default to data/pages)
    const configManager = this.engine.getManager<ConfigurationManager>('ConfigurationManager');
    const defaultPagesDir = configManager?.getProperty('amdwiki.paths.pages', './data/pages') as string ?? './data/pages';
    const targetDir = options.targetDir ?? path.resolve(defaultPagesDir);

    // Determine file extensions to process
    const fileExtensions = this.getFileExtensions(options);

    // Find all files to process
    const files = await this.findFiles(options.sourceDir, fileExtensions);
    result.total = files.length;

    // Apply limit and offset
    const offset = options.offset ?? 0;
    const limit = options.limit ?? files.length;
    const filesToProcess = files.slice(offset, offset + limit);

    this.logger.log(`[ImportManager] Processing ${filesToProcess.length} of ${files.length} files`);

    // Process each file
    for (const filePath of filesToProcess) {
      try {
        const imported = await this.importSinglePage(filePath, {
          ...options,
          targetDir
        });

        if (imported) {
          result.files.push(imported);
          result.converted++;
        } else {
          result.skipped++;
        }
      } catch (error) {
        result.failed++;
        result.errors.push({
          file: filePath,
          message: error instanceof Error ? error.message : String(error),
          stack: error instanceof Error ? error.stack : undefined
        });
      }
    }

    // Set success based on error rate
    result.success = result.failed === 0 || (result.failed / result.total < 0.1);
    result.durationMs = Date.now() - startTime;

    this.logger.log('[ImportManager] Import complete:', {
      converted: result.converted,
      skipped: result.skipped,
      failed: result.failed,
      durationMs: result.durationMs
    });

    return result;
  }

  /**
   * Import a single page
   *
   * @param filePath - Source file path
   * @param options - Import options
   * @returns Imported file info or null if skipped
   */
  async importSinglePage(
    filePath: string,
    options: ImportOptions
  ): Promise<ImportedFile | null> {
    // Read source file
    const content = await fs.readFile(filePath, 'utf-8');
    const filename = path.basename(filePath);

    // Detect or use specified format
    let formatId: string | undefined = options.format;
    if (!formatId || formatId === 'auto') {
      const detected = this.detectFormat(content, filename);
      if (!detected) {
        // No converter can handle this file
        return null;
      }
      formatId = detected;
    }

    const converter = this.converterRegistry.get(formatId);
    if (!converter) {
      throw new Error(`Unknown format: ${formatId}`);
    }

    // Convert content
    const conversionResult: ConversionResult = converter.convert(content);

    // Generate target path
    const baseName = path.basename(filename, path.extname(filename));
    const targetPath = path.join(options.targetDir ?? './data/pages', `${baseName}.md`);

    // Build frontmatter if we have metadata
    let finalContent = conversionResult.content;
    if (Object.keys(conversionResult.metadata).length > 0 || options.generateUUIDs !== false) {
      finalContent = this.buildFrontmatter(conversionResult, options) + '\n\n' + conversionResult.content;
    }

    // Write file (unless dry run)
    const written = !options.dryRun;
    if (written) {
      await fs.ensureDir(path.dirname(targetPath));
      await fs.writeFile(targetPath, finalContent, 'utf-8');
    }

    return {
      sourcePath: filePath,
      targetPath,
      format: formatId,
      size: Buffer.byteLength(finalContent, 'utf-8'),
      metadata: conversionResult.metadata,
      warnings: conversionResult.warnings,
      written
    };
  }

  /**
   * Get file extensions to process based on options
   */
  private getFileExtensions(options: ImportOptions): string[] {
    if (options.fileExtensions && options.fileExtensions.length > 0) {
      return options.fileExtensions;
    }

    if (options.format && options.format !== 'auto') {
      const converter = this.converterRegistry.get(options.format);
      if (converter) {
        return converter.fileExtensions;
      }
    }

    // Default: collect all extensions from all converters
    const extensions = new Set<string>();
    for (const converter of this.converterRegistry.values()) {
      converter.fileExtensions.forEach(ext => extensions.add(ext));
    }
    return Array.from(extensions);
  }

  /**
   * Find all files with matching extensions in directory
   */
  private async findFiles(dir: string, extensions: string[]): Promise<string[]> {
    const files: string[] = [];
    const entries = await fs.readdir(dir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);

      if (entry.isDirectory()) {
        // Recursively search subdirectories
        const subFiles = await this.findFiles(fullPath, extensions);
        files.push(...subFiles);
      } else if (entry.isFile()) {
        // Check if file matches any extension
        const ext = path.extname(entry.name).toLowerCase();
        if (extensions.includes(ext)) {
          files.push(fullPath);
        }
      }
    }

    return files;
  }

  /**
   * Build YAML frontmatter from conversion result
   */
  private buildFrontmatter(
    result: ConversionResult,
    options: ImportOptions
  ): string {
    const frontmatter: Record<string, unknown> = {};

    // Add extracted metadata
    if (result.metadata['title']) {
      frontmatter['title'] = result.metadata['title'];
    }

    // Generate UUID if requested
    if (options.generateUUIDs !== false && !result.metadata['uuid']) {
      frontmatter['uuid'] = uuidv4();
    } else if (result.metadata['uuid']) {
      frontmatter['uuid'] = result.metadata['uuid'];
    }

    // Add other metadata
    for (const [key, value] of Object.entries(result.metadata)) {
      if (key !== 'title' && key !== 'uuid' && key !== 'jspwiki') {
        frontmatter[key] = value;
      }
    }

    // Add import metadata
    frontmatter['importedFrom'] = 'jspwiki';
    frontmatter['importedAt'] = new Date().toISOString();

    // Build YAML
    const lines = ['---'];
    for (const [key, value] of Object.entries(frontmatter)) {
      if (typeof value === 'string') {
        // Quote strings that might cause YAML issues
        if (value.includes(':') || value.includes('#') || value.includes("'")) {
          lines.push(`${key}: "${value.replace(/"/g, '\\"')}"`);
        } else {
          lines.push(`${key}: ${value}`);
        }
      } else if (Array.isArray(value)) {
        lines.push(`${key}:`);
        for (const item of value) {
          lines.push(`  - ${item}`);
        }
      } else {
        lines.push(`${key}: ${JSON.stringify(value)}`);
      }
    }
    lines.push('---');

    return lines.join('\n');
  }

  /**
   * Backup manager data (no persistent data to backup)
   */
  // eslint-disable-next-line @typescript-eslint/require-await -- Implements BaseManager async interface
  async backup(): Promise<BackupData> {
    return {
      managerName: 'ImportManager',
      timestamp: new Date().toISOString(),
      data: {
        registeredFormats: this.getAvailableFormats()
      }
    };
  }

  /**
   * Restore manager data (no persistent data to restore)
   */
  async restore(backupData: BackupData): Promise<void> {
    await super.restore(backupData);
    // ImportManager doesn't have persistent state to restore
  }

  /**
   * Shutdown the manager
   */
  async shutdown(): Promise<void> {
    this.converterRegistry.clear();
    await super.shutdown();
  }
}

export default ImportManager;

// CommonJS compatibility
module.exports = ImportManager;
