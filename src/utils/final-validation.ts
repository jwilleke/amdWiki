import fs from 'fs';
import path from 'path';
import yaml from 'js-yaml';
import logger from './logger';

/**
 * Page metadata structure
 */
interface PageMetadata {
  title: string;
  category: string;
  'user-keywords': string[];
  uuid: string;
  lastModified: string;
  [key: string]: any;
}

/**
 * Validation result for a single page
 */
interface ValidationResult {
  valid: boolean;
  error?: string;
  metadata?: PageMetadata;
}

/**
 * Error info for invalid page
 */
interface ErrorInfo {
  file: string;
  error: string;
}

/**
 * Scan results for a directory
 */
interface ScanResults {
  valid: number;
  invalid: number;
  errors: ErrorInfo[];
  categories: Record<string, number>;
}

/**
 * Validate a single page file
 *
 * @param filePath - Path to the markdown file
 * @returns Validation result
 */
function validatePage(filePath: string): ValidationResult {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');

    if (lines[0] !== '---') {
      return { valid: false, error: 'Missing frontmatter start' };
    }

    const frontmatterEnd = lines.indexOf('---', 1);
    if (frontmatterEnd === -1) {
      return { valid: false, error: 'Missing frontmatter end' };
    }

    const frontmatterContent = lines.slice(1, frontmatterEnd).join('\n');
    const metadata = yaml.load(frontmatterContent) as PageMetadata;

    const required = ['title', 'category', 'user-keywords', 'uuid', 'lastModified'];
    const missing = required.filter(field => !Object.prototype.hasOwnProperty.call(metadata, field));

    if (missing.length > 0) {
      return { valid: false, error: 'Missing fields: ' + missing.join(', ') };
    }

    const validCategories = ['General', 'System', 'Documentation', 'Developer'];
    if (!validCategories.includes(metadata.category)) {
      return { valid: false, error: 'Invalid category: ' + metadata.category };
    }

    return { valid: true, metadata };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return { valid: false, error: errorMessage };
  }
}

/**
 * Scan a directory and validate all markdown files
 *
 * @param dir - Directory path to scan
 * @returns Scan results
 */
function scanDirectory(dir: string): ScanResults {
  const files = fs.readdirSync(dir, { withFileTypes: true });
  const results: ScanResults = { valid: 0, invalid: 0, errors: [], categories: {} };

  files.forEach(file => {
    if (file.isFile() && file.name.endsWith('.md')) {
      const filePath = path.join(dir, file.name);
      const result = validatePage(filePath);

      if (result.valid && result.metadata) {
        results.valid++;
        const category = result.metadata.category;
        results.categories[category] = (results.categories[category] || 0) + 1;
        logger.info(`✅ ${file.name} - Category: ${category}`);
      } else {
        results.invalid++;
        results.errors.push({ file: file.name, error: result.error || 'Unknown error' });
        logger.warn(`❌ ${file.name} - ERROR: ${result.error}`);
      }
    }
  });

  return results;
}

// Main execution
logger.info('=== FINAL METADATA VALIDATION ===\n');

logger.info('📁 pages directory:');
const pagesResults = scanDirectory('pages');

logger.info('\n📁 required-pages directory:');
const requiredResults = scanDirectory('required-pages');

const totalValid = pagesResults.valid + requiredResults.valid;
const totalInvalid = pagesResults.invalid + requiredResults.invalid;
const totalFiles = totalValid + totalInvalid;

// Combine categories
const allCategories: Record<string, number> = { ...pagesResults.categories };
Object.keys(requiredResults.categories).forEach(cat => {
  allCategories[cat] = (allCategories[cat] || 0) + requiredResults.categories[cat];
});

logger.info('\n============================================================');
logger.info('📊 FINAL METADATA VALIDATION REPORT');
logger.info('============================================================');
logger.info(`✅ Valid files: ${totalValid}/${totalFiles}`);
logger.info(`❌ Invalid files: ${totalInvalid}`);
logger.info(`📈 Success rate: ${Math.round((totalValid / totalFiles) * 100)}%`);

logger.info('\n📋 Category Distribution:');
Object.entries(allCategories).sort().forEach(([cat, count]) => {
  logger.info(`   ${cat}: ${count} files`);
});

if (totalInvalid > 0) {
  logger.warn('\n🚨 Errors found:');
  [...pagesResults.errors, ...requiredResults.errors].forEach(error => {
    logger.warn(`   • ${error.file}: ${error.error}`);
  });
} else {
  logger.info('\n🎉 ALL FILES PASS VALIDATION!');
  logger.info('🏆 Perfect metadata compliance achieved!');
}

export { validatePage, scanDirectory };
export type { ValidationResult, ScanResults, PageMetadata };
