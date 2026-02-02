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
import HtmlConverter from '../converters/HtmlConverter';
import type ConfigurationManager from './ConfigurationManager';
import logger from '../utils/logger';

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

  /** Whether file was actually written (false for dry runs or duplicates) */
  written: boolean;

  /** Reason the file was skipped (e.g. 'duplicate') */
  skippedReason?: string;

  /** UUID of existing page if duplicate */
  existingPageUuid?: string;
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

  constructor(engine: WikiEngine) {
    super(engine);
    this.converterRegistry = new Map();
  }

  /**
   * Initialize the manager
   */
  async initialize(config: Record<string, unknown> = {}): Promise<void> {
    await super.initialize(config);

    // Register built-in converters
    this.registerConverter(new JSPWikiConverter());
    this.registerConverter(new HtmlConverter());

    logger.info('[ImportManager] Initialized with converters:', this.getAvailableFormats());
  }

  /**
   * Register a content converter
   *
   * @param converter - Converter instance implementing IContentConverter
   */
  registerConverter(converter: IContentConverter): void {
    if (this.converterRegistry.has(converter.formatId)) {
      logger.warn(`[ImportManager] Overwriting existing converter: ${converter.formatId}`);
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

    // Validate source path exists
    if (!await fs.pathExists(options.sourceDir)) {
      result.success = false;
      result.errors.push({
        file: options.sourceDir,
        message: 'Source path does not exist'
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

    // Support both single file and directory imports
    const sourceStat = await fs.stat(options.sourceDir);
    let files: string[];

    if (sourceStat.isFile()) {
      // Single file import — use it directly
      files = [options.sourceDir];
    } else if (sourceStat.isDirectory()) {
      // Directory import — find matching files
      files = await this.findFiles(options.sourceDir, fileExtensions);
    } else {
      result.success = false;
      result.errors.push({
        file: options.sourceDir,
        message: 'Source path is neither a file nor a directory'
      });
      result.durationMs = Date.now() - startTime;
      return result;
    }
    result.total = files.length;

    // Apply limit and offset
    const offset = options.offset ?? 0;
    const limit = options.limit ?? files.length;
    const filesToProcess = files.slice(offset, offset + limit);

    logger.info(`[ImportManager] Processing ${filesToProcess.length} of ${files.length} files`);

    // Process each file
    for (const filePath of filesToProcess) {
      try {
        const imported = await this.importSinglePage(filePath, {
          ...options,
          targetDir
        });

        if (imported) {
          result.files.push(imported);
          if (imported.skippedReason) {
            result.skipped++;
          } else {
            result.converted++;
          }
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

    // Refresh page index so imported pages are immediately visible
    if (!options.dryRun && result.converted > 0) {
      try {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment -- getManager returns any
        const pageManager = this.engine.getManager('PageManager');
        await pageManager.refreshPageList(); // eslint-disable-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call -- getManager returns any
        logger.info(`[ImportManager] Page index refreshed after importing ${result.converted} pages`);
      } catch (refreshErr) {
        logger.warn('[ImportManager] Failed to refresh page index after import:', refreshErr);
      }
    }

    logger.info('[ImportManager] Import complete:', {
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

    // Determine UUID for filename
    const baseName = path.basename(filename, path.extname(filename));
    let pageUuid: string | undefined;
    if (options.generateUUIDs !== false) {
      pageUuid = (conversionResult.metadata['uuid'] as string) || uuidv4();
    }

    // Use UUID as filename when available, otherwise fall back to baseName
    const targetFilename = pageUuid ? `${pageUuid}.md` : `${baseName}.md`;
    const targetPath = path.join(options.targetDir ?? './data/pages', targetFilename);

    // Store the original page name as title if not already set
    if (!conversionResult.metadata['title']) {
      conversionResult.metadata['title'] = baseName.replace(/\+/g, ' ');
    }

    // Check for duplicate page by title
    const pageTitle = conversionResult.metadata['title'] as string;
    try {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment -- getManager returns any
      const pageManager = this.engine.getManager('PageManager');
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call -- getManager returns any
      const existingPage = await pageManager.getPage(pageTitle);
      if (existingPage) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access -- page object
        const existingUuid = (existingPage.uuid || existingPage.metadata?.uuid || '') as string;
        logger.info(`[ImportManager] Duplicate detected: "${pageTitle}" already exists as ${existingUuid}`);
        return {
          sourcePath: filePath,
          targetPath,
          format: formatId,
          size: 0,
          metadata: conversionResult.metadata,
          warnings: [`Page "${pageTitle}" already exists (${existingUuid})`],
          written: false,
          skippedReason: 'duplicate',
          existingPageUuid: existingUuid
        };
      }
    } catch {
      // PageManager lookup failed — proceed with import
    }

    // Build frontmatter if we have metadata
    let finalContent = conversionResult.content;
    if (Object.keys(conversionResult.metadata).length > 0 || options.generateUUIDs !== false) {
      finalContent = this.buildFrontmatter(conversionResult, pageUuid) + '\n\n' + conversionResult.content;
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
   * Import a page from a URL
   *
   * Fetches the URL, converts HTML to Markdown using the html converter,
   * and writes the page file with schema.org metadata in frontmatter.
   *
   * @param url - URL to fetch and import
   * @param options - Optional overrides (title, dryRun)
   * @returns Imported file info
   */
  async importFromUrl(
    url: string,
    options: { title?: string; dryRun?: boolean } = {}
  ): Promise<ImportedFile> {
    // Validate URL
    let parsedUrl: URL;
    try {
      parsedUrl = new URL(url);
    } catch {
      throw new Error(`Invalid URL: ${url}`);
    }

    if (!parsedUrl.protocol.startsWith('http')) {
      throw new Error('Only HTTP and HTTPS URLs are supported');
    }

    // Fetch the page
    logger.info(`[ImportManager] Fetching URL: ${url}`);
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'amdWiki/1.0 (URL Import)',
        'Accept': 'text/html,application/xhtml+xml'
      },
      redirect: 'follow',
      signal: AbortSignal.timeout(30000)
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch URL: HTTP ${response.status} ${response.statusText}`);
    }

    const contentType = response.headers.get('content-type') || '';
    if (!contentType.includes('text/html') && !contentType.includes('application/xhtml')) {
      throw new Error(`URL did not return HTML content (got ${contentType})`);
    }

    const html = await response.text();

    // Get the HTML converter
    const converter = this.converterRegistry.get('html');
    if (!converter) {
      throw new Error('HTML converter not registered');
    }

    // Convert HTML to Markdown
    const conversionResult = converter.convert(html);

    // Override title if provided
    if (options.title) {
      conversionResult.metadata['title'] = options.title;
    }

    // Ensure title exists
    if (!conversionResult.metadata['title']) {
      // Derive from URL path
      const pathSegments = parsedUrl.pathname.split('/').filter(Boolean);
      conversionResult.metadata['title'] = pathSegments.length > 0
        ? decodeURIComponent(pathSegments[pathSegments.length - 1]).replace(/[-_]/g, ' ')
        : parsedUrl.hostname;
    }

    // Add URL import metadata
    conversionResult.metadata['sourceUrl'] = url;
    conversionResult.metadata['importedAt'] = new Date().toISOString();

    // Set system-category
    if (!conversionResult.metadata['system-category']) {
      conversionResult.metadata['system-category'] = 'general';
    }

    // Generate UUID
    const pageUuid = uuidv4();

    // Check for duplicate page by title
    const pageTitle = conversionResult.metadata['title'] as string;
    try {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment -- getManager returns any
      const pageManager = this.engine.getManager('PageManager');
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call -- getManager returns any
      const existingPage = await pageManager.getPage(pageTitle);
      if (existingPage) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access -- page object
        const existingUuid = (existingPage.uuid || existingPage.metadata?.uuid || '') as string;
        return {
          sourcePath: url,
          targetPath: '',
          format: 'html',
          size: 0,
          metadata: conversionResult.metadata,
          warnings: [`Page "${pageTitle}" already exists (${existingUuid})`],
          written: false,
          skippedReason: 'duplicate',
          existingPageUuid: existingUuid
        };
      }
    } catch {
      // PageManager lookup failed — proceed with import
    }

    // Build frontmatter and content with source citation
    const importDate = (conversionResult.metadata['importedAt'] as string).split('T')[0];
    const sourceCitation = `\n\n----\n* [#1] - [${pageTitle}|${url}|target='_blank'] - based on information obtained ${importDate}\n`;
    const finalContent = this.buildUrlFrontmatter(conversionResult, pageUuid)
      + '\n\n' + conversionResult.content + sourceCitation;

    // Determine target path
    const configManager = this.engine.getManager<ConfigurationManager>('ConfigurationManager');
    const defaultPagesDir = configManager?.getProperty('amdwiki.paths.pages', './data/pages') as string ?? './data/pages';
    const targetPath = path.join(path.resolve(defaultPagesDir), `${pageUuid}.md`);

    // Write file (unless dry run)
    const written = !options.dryRun;
    if (written) {
      await fs.ensureDir(path.dirname(targetPath));
      await fs.writeFile(targetPath, finalContent, 'utf-8');

      // Refresh page index
      try {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment -- getManager returns any
        const pageManager = this.engine.getManager('PageManager');
        await pageManager.refreshPageList(); // eslint-disable-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call -- getManager returns any
        logger.info('[ImportManager] Page index refreshed after URL import');
      } catch (refreshErr) {
        logger.warn('[ImportManager] Failed to refresh page index after URL import:', refreshErr);
      }
    }

    logger.info(`[ImportManager] URL import ${options.dryRun ? 'preview' : 'complete'}: "${pageTitle}" from ${url}`);

    return {
      sourcePath: url,
      targetPath,
      format: 'html',
      size: Buffer.byteLength(finalContent, 'utf-8'),
      metadata: conversionResult.metadata,
      warnings: conversionResult.warnings,
      written
    };
  }

  /**
   * Build YAML frontmatter for URL imports with schema.org namespace
   */
  private buildUrlFrontmatter(
    result: ConversionResult,
    pageUuid: string
  ): string {
    const lines = ['---'];

    // Title
    if (result.metadata['title']) {
      lines.push(`title: ${this.yamlValue(result.metadata['title'] as string)}`);
    }

    // UUID
    lines.push(`uuid: ${pageUuid}`);

    // Source URL
    if (result.metadata['sourceUrl']) {
      lines.push(`sourceUrl: "${result.metadata['sourceUrl'] as string}"`);
    }

    // Import timestamp
    if (result.metadata['importedAt']) {
      lines.push(`importedAt: "${result.metadata['importedAt'] as string}"`);
    }

    // System category
    lines.push(`system-category: ${(result.metadata['system-category'] as string) || 'general'}`);

    // Schema.org metadata (nested under schema key)
    const schema = result.metadata['schema'] as Record<string, unknown> | undefined;
    if (schema && Object.keys(schema).length > 0) {
      lines.push('schema:');
      for (const [key, value] of Object.entries(schema)) {
        if (value === undefined || value === null || value === '') continue;
        if (Array.isArray(value)) {
          lines.push(`  ${key}:`);
          for (const item of value) {
            lines.push(`    - ${this.yamlValue(String(item))}`);
          }
        } else {
          const strValue = typeof value === 'string' ? value : JSON.stringify(value);
          lines.push(`  ${key}: ${this.yamlValue(strValue)}`);
        }
      }
    }

    lines.push('---');
    return lines.join('\n');
  }

  /**
   * Quote a YAML string value if needed
   */
  private yamlValue(value: string): string {
    if (
      value.includes(':') ||
      value.includes('#') ||
      value.includes("'") ||
      value.includes('"') ||
      value.includes('\n') ||
      value.startsWith(' ') ||
      value.startsWith('[') ||
      value.startsWith('{')
    ) {
      return `"${value.replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"`;
    }
    return value;
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
    pageUuid?: string
  ): string {
    const frontmatter: Record<string, unknown> = {};

    // Add extracted metadata
    if (result.metadata['title']) {
      frontmatter['title'] = result.metadata['title'];
    }

    // Use pre-generated UUID
    if (pageUuid) {
      frontmatter['uuid'] = pageUuid;
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
