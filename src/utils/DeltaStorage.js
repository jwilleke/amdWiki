const Diff = require('fast-diff');
const crypto = require('crypto');

/**
 * DeltaStorage - Utility for creating and applying content diffs
 *
 * Uses the fast-diff library (Myers diff algorithm) to efficiently store
 * page versions as deltas. Version 1 stores full content, subsequent versions
 * store only the differences from the previous version.
 *
 * fast-diff returns an array of tuples: [operation, text]
 * - operation: -1 (delete), 0 (equal), 1 (insert)
 * - text: the text content
 *
 * @example
 * const diff = DeltaStorage.createDiff("Hello world", "Hello amdWiki");
 * // Returns: [[0, "Hello "], [-1, "world"], [1, "amdWiki"]]
 *
 * const reconstructed = DeltaStorage.applyDiff("Hello world", diff);
 * // Returns: "Hello amdWiki"
 */
class DeltaStorage {
  /**
   * Generate diff between old and new content
   *
   * Creates a diff using the Myers algorithm (similar to git).
   * Returns an array of operations that transform oldContent into newContent.
   *
   * @param {string} oldContent - Original content
   * @param {string} newContent - New content
   * @returns {Array<Array>} Diff array from fast-diff
   * @example
   * const diff = DeltaStorage.createDiff("foo", "bar");
   * // Returns: [[-1, "foo"], [1, "bar"]]
   */
  static createDiff(oldContent, newContent) {
    if (typeof oldContent !== 'string' || typeof newContent !== 'string') {
      throw new TypeError('Both oldContent and newContent must be strings');
    }

    return Diff(oldContent, newContent);
  }

  /**
   * Apply a diff to base content to reconstruct a version
   *
   * Takes the base content and applies a diff array to reconstruct the target content.
   * Used to reconstruct versions from delta storage.
   *
   * @param {string} baseContent - Base content to apply diff to
   * @param {Array<Array>} diff - Diff array from fast-diff
   * @returns {string} Reconstructed content
   * @throws {TypeError} If inputs are invalid
   * @example
   * const base = "Hello world";
   * const diff = [[0, "Hello "], [-1, "world"], [1, "amdWiki"]];
   * const result = DeltaStorage.applyDiff(base, diff);
   * // Returns: "Hello amdWiki"
   */
  static applyDiff(baseContent, diff) {
    if (typeof baseContent !== 'string') {
      throw new TypeError('baseContent must be a string');
    }

    if (!Array.isArray(diff)) {
      throw new TypeError('diff must be an array');
    }

    let result = '';
    let baseIndex = 0;

    for (const [operation, text] of diff) {
      switch (operation) {
        case Diff.DELETE: // -1: delete
          // Skip over the deleted text in the base
          baseIndex += text.length;
          break;

        case Diff.EQUAL: // 0: equal (keep)
          // Verify the text matches what we expect in the base
          const expectedText = baseContent.substring(baseIndex, baseIndex + text.length);
          if (expectedText !== text) {
            throw new Error(
              `Diff application failed: expected "${text}" at position ${baseIndex}, ` +
              `but found "${expectedText}"`
            );
          }
          result += text;
          baseIndex += text.length;
          break;

        case Diff.INSERT: // 1: insert
          // Add the new text
          result += text;
          break;

        default:
          throw new Error(`Invalid diff operation: ${operation}`);
      }
    }

    // Verify we consumed the entire base content
    if (baseIndex !== baseContent.length) {
      throw new Error(
        `Diff application incomplete: processed ${baseIndex} of ${baseContent.length} characters`
      );
    }

    return result;
  }

  /**
   * Apply multiple diffs sequentially
   *
   * Applies a chain of diffs to reconstruct a version from v1.
   * Used when retrieving versions > 2 in delta storage.
   *
   * @param {string} v1Content - Version 1 (base) content
   * @param {Array<Array<Array>>} diffArray - Array of diffs to apply sequentially
   * @returns {string} Final reconstructed content
   * @throws {Error} If any diff application fails
   * @example
   * const v1 = "Version 1";
   * const diffs = [
   *   [[0, "Version "], [-1, "1"], [1, "2"]],  // v1 → v2
   *   [[0, "Version "], [-1, "2"], [1, "3"]]   // v2 → v3
   * ];
   * const v3 = DeltaStorage.applyDiffChain(v1, diffs);
   * // Returns: "Version 3"
   */
  static applyDiffChain(v1Content, diffArray) {
    if (typeof v1Content !== 'string') {
      throw new TypeError('v1Content must be a string');
    }

    if (!Array.isArray(diffArray)) {
      throw new TypeError('diffArray must be an array');
    }

    let currentContent = v1Content;

    for (let i = 0; i < diffArray.length; i++) {
      try {
        currentContent = this.applyDiff(currentContent, diffArray[i]);
      } catch (error) {
        throw new Error(
          `Failed to apply diff ${i + 1} of ${diffArray.length}: ${error.message}`
        );
      }
    }

    return currentContent;
  }

  /**
   * Calculate SHA-256 hash of content
   *
   * Used for content integrity verification and deduplication.
   * Stored in version metadata for verification.
   *
   * @param {string} content - Content to hash
   * @returns {string} SHA-256 hash in hexadecimal format
   */
  static calculateHash(content) {
    if (typeof content !== 'string') {
      throw new TypeError('content must be a string');
    }

    return crypto.createHash('sha256').update(content, 'utf8').digest('hex');
  }

  /**
   * Verify content integrity using hash
   *
   * Checks if the content hash matches the expected hash.
   * Used to detect corruption in version storage.
   *
   * @param {string} content - Content to verify
   * @param {string} expectedHash - Expected SHA-256 hash
   * @returns {boolean} True if hash matches, false otherwise
   */
  static verifyHash(content, expectedHash) {
    if (typeof content !== 'string' || typeof expectedHash !== 'string') {
      throw new TypeError('Both content and expectedHash must be strings');
    }

    const actualHash = this.calculateHash(content);
    return actualHash === expectedHash;
  }

  /**
   * Calculate diff statistics
   *
   * Analyzes a diff to provide statistics about the changes.
   * Useful for UI display and analytics.
   *
   * @param {Array<Array>} diff - Diff array from fast-diff
   * @returns {object} Statistics object
   * @example
   * const stats = DeltaStorage.getDiffStats(diff);
   * // Returns: { additions: 10, deletions: 5, unchanged: 100 }
   */
  static getDiffStats(diff) {
    if (!Array.isArray(diff)) {
      throw new TypeError('diff must be an array');
    }

    const stats = {
      additions: 0,
      deletions: 0,
      unchanged: 0
    };

    for (const [operation, text] of diff) {
      const length = text.length;

      switch (operation) {
        case Diff.DELETE: // -1
          stats.deletions += length;
          break;
        case Diff.EQUAL: // 0
          stats.unchanged += length;
          break;
        case Diff.INSERT: // 1
          stats.additions += length;
          break;
      }
    }

    return stats;
  }
}

module.exports = DeltaStorage;
