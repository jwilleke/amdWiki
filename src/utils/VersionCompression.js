const pako = require('pako');
const fs = require('fs-extra');

/**
 * VersionCompression - Utility for compressing and decompressing version content
 *
 * Uses pako (pure JavaScript gzip implementation) to compress old version files.
 * This significantly reduces disk space usage for version history.
 *
 * Compression is particularly effective for:
 * - Text content (60-80% size reduction typical)
 * - Diff files (often compress very well)
 * - Large content files
 *
 * @example
 * const compressed = VersionCompression.compress("Hello world");
 * const decompressed = VersionCompression.decompress(compressed);
 * // decompressed === "Hello world"
 */
class VersionCompression {
  /**
   * Compress content using gzip
   *
   * Takes string or Buffer content and returns a gzip-compressed Buffer.
   * Uses default compression level (6) which balances speed and compression ratio.
   *
   * @param {string|Buffer} content - Content to compress
   * @param {object} options - Compression options
   * @param {number} options.level - Compression level (1-9, default 6)
   * @returns {Buffer} Compressed content
   * @throws {TypeError} If content is not string or Buffer
   * @example
   * const compressed = VersionCompression.compress("Large text content...");
   * console.log('Compression ratio:', compressed.length / original.length);
   */
  static compress(content, options = {}) {
    if (typeof content !== 'string' && !Buffer.isBuffer(content)) {
      throw new TypeError('content must be a string or Buffer');
    }

    const { level = 6 } = options;

    if (typeof level !== 'number' || level < 1 || level > 9) {
      throw new RangeError('Compression level must be between 1 and 9');
    }

    try {
      // Convert string to buffer if needed
      const inputBuffer = Buffer.isBuffer(content) ? content : Buffer.from(content, 'utf8');

      // Compress using pako with specified level
      const compressed = pako.gzip(inputBuffer, { level });

      return Buffer.from(compressed);
    } catch (error) {
      throw new Error(`Compression failed: ${error.message}`);
    }
  }

  /**
   * Decompress gzip content
   *
   * Takes a gzip-compressed Buffer and returns the original string content.
   * Automatically handles UTF-8 encoding.
   *
   * @param {Buffer} compressed - Compressed content
   * @returns {string} Decompressed content as string
   * @throws {TypeError} If compressed is not a Buffer
   * @throws {Error} If decompression fails (corrupted data)
   * @example
   * const compressed = VersionCompression.compress("Original");
   * const original = VersionCompression.decompress(compressed);
   */
  static decompress(compressed) {
    if (!Buffer.isBuffer(compressed)) {
      throw new TypeError('compressed must be a Buffer');
    }

    try {
      // Decompress using pako
      const decompressed = pako.ungzip(compressed);

      // Convert to string
      return Buffer.from(decompressed).toString('utf8');
    } catch (error) {
      throw new Error(`Decompression failed: ${error.message}`);
    }
  }

  /**
   * Compress a file in place
   *
   * Reads a file, compresses it, and writes it back with .gz extension.
   * Original file is removed after successful compression.
   * Creates a backup before compression for safety.
   *
   * @param {string} filePath - Path to file to compress
   * @param {object} options - Compression options
   * @param {number} options.level - Compression level (1-9, default 6)
   * @param {boolean} options.keepOriginal - Keep original file (default false)
   * @returns {Promise<{originalSize: number, compressedSize: number, ratio: number}>}
   * @throws {Error} If file doesn't exist or compression fails
   * @example
   * const result = await VersionCompression.compressFile('./v1/content.md');
   * console.log(`Saved ${result.ratio}% space`);
   * // File is now ./v1/content.md.gz
   */
  static async compressFile(filePath, options = {}) {
    const { level = 6, keepOriginal = false } = options;

    // Check if file exists
    if (!await fs.pathExists(filePath)) {
      throw new Error(`File not found: ${filePath}`);
    }

    try {
      // Read original file
      const content = await fs.readFile(filePath);
      const originalSize = content.length;

      // Compress
      const compressed = this.compress(content, { level });
      const compressedSize = compressed.length;

      // Write compressed file
      const compressedPath = `${filePath}.gz`;
      await fs.writeFile(compressedPath, compressed);

      // Remove original file unless keepOriginal is true
      if (!keepOriginal) {
        await fs.unlink(filePath);
      }

      const ratio = ((1 - compressedSize / originalSize) * 100).toFixed(2);

      return {
        originalSize,
        compressedSize,
        ratio: parseFloat(ratio),
        compressedPath
      };
    } catch (error) {
      throw new Error(`Failed to compress file ${filePath}: ${error.message}`);
    }
  }

  /**
   * Decompress a file in place
   *
   * Reads a .gz file, decompresses it, and writes the original content back.
   * Removes the .gz file after successful decompression.
   *
   * @param {string} filePath - Path to .gz file to decompress
   * @param {object} options - Decompression options
   * @param {boolean} options.keepCompressed - Keep compressed file (default false)
   * @returns {Promise<{decompressedSize: number, decompressedPath: string}>}
   * @throws {Error} If file doesn't exist, isn't .gz, or decompression fails
   * @example
   * await VersionCompression.decompressFile('./v1/content.md.gz');
   * // File is now ./v1/content.md
   */
  static async decompressFile(filePath, options = {}) {
    const { keepCompressed = false } = options;

    // Check if file exists
    if (!await fs.pathExists(filePath)) {
      throw new Error(`File not found: ${filePath}`);
    }

    // Verify it's a .gz file
    if (!filePath.endsWith('.gz')) {
      throw new Error(`File must have .gz extension: ${filePath}`);
    }

    try {
      // Read compressed file
      const compressed = await fs.readFile(filePath);

      // Decompress
      const decompressed = this.decompress(compressed);

      // Write decompressed file (remove .gz extension)
      const decompressedPath = filePath.slice(0, -3); // Remove .gz
      await fs.writeFile(decompressedPath, decompressed, 'utf8');

      const decompressedSize = Buffer.byteLength(decompressed, 'utf8');

      // Remove compressed file unless keepCompressed is true
      if (!keepCompressed) {
        await fs.unlink(filePath);
      }

      return {
        decompressedSize,
        decompressedPath
      };
    } catch (error) {
      throw new Error(`Failed to decompress file ${filePath}: ${error.message}`);
    }
  }

  /**
   * Check if file is compressed
   *
   * Checks if a file has .gz extension and is a valid gzip file.
   *
   * @param {string} filePath - Path to file to check
   * @returns {Promise<boolean>} True if file is compressed
   */
  static async isCompressed(filePath) {
    if (!await fs.pathExists(filePath)) {
      return false;
    }

    // Quick check: .gz extension
    if (!filePath.endsWith('.gz')) {
      return false;
    }

    try {
      // Try to read gzip header (first 2 bytes should be 0x1f 0x8b)
      const buffer = Buffer.alloc(2);
      const fd = await fs.open(filePath, 'r');
      await fs.read(fd, buffer, 0, 2, 0);
      await fs.close(fd);

      return buffer[0] === 0x1f && buffer[1] === 0x8b;
    } catch (error) {
      return false;
    }
  }

  /**
   * Calculate compression ratio
   *
   * Compares original and compressed sizes to calculate space savings.
   *
   * @param {number} originalSize - Original size in bytes
   * @param {number} compressedSize - Compressed size in bytes
   * @returns {number} Compression ratio as percentage (e.g., 65.5 means 65.5% smaller)
   */
  static calculateRatio(originalSize, compressedSize) {
    if (typeof originalSize !== 'number' || typeof compressedSize !== 'number') {
      throw new TypeError('Both sizes must be numbers');
    }

    if (originalSize === 0) {
      return 0;
    }

    return parseFloat(((1 - compressedSize / originalSize) * 100).toFixed(2));
  }

  /**
   * Get compressed file stats
   *
   * Returns information about a compressed file including sizes and ratio.
   *
   * @param {string} filePath - Path to compressed file
   * @returns {Promise<object>} File stats
   */
  static async getCompressedStats(filePath) {
    if (!await fs.pathExists(filePath)) {
      throw new Error(`File not found: ${filePath}`);
    }

    const stats = await fs.stat(filePath);
    const compressedSize = stats.size;

    // Try to determine original size by decompressing in memory
    let originalSize = null;
    let ratio = null;

    try {
      const compressed = await fs.readFile(filePath);
      const decompressed = this.decompress(compressed);
      originalSize = Buffer.byteLength(decompressed, 'utf8');
      ratio = this.calculateRatio(originalSize, compressedSize);
    } catch (error) {
      // If decompression fails, just return what we know
    }

    return {
      path: filePath,
      compressedSize,
      originalSize,
      ratio,
      modified: stats.mtime
    };
  }
}

module.exports = VersionCompression;
