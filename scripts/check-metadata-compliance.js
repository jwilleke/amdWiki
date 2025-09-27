#!/usr/bin/env node

const fs = require('fs').promises;
const path = require('path');
const yaml = require('js-yaml');

/**
 * Metadata Compliance Checker
 * Checks all pages for metadata compliance and generates a report
 */
class MetadataComplianceChecker {
  constructor() {
    this.pagesDir = './pages';
    this.requiredPagesDir = './required-pages';
    this.report = {
      totalPages: 0,
      compliantPages: 0,
      nonCompliantPages: 0,
      issues: [],
      recommendations: [],
      summary: {}
    };

    // Define expected metadata structure
    this.requiredFields = ['title', 'uuid', 'system-category'];
    this.optionalFields = ['slug', 'user-keywords', 'lastModified', 'category'];
    this.validSystemCategories = ['general', 'System', 'Admin', 'Documentation', 'Test'];
  }

  /**
   * Parse frontmatter from markdown file
   */
  parseFrontmatter(content) {
    const frontmatterMatch = content.match(/^---\r?\n([\s\S]*?)\r?\n---/);
    if (!frontmatterMatch) {
      return null;
    }

    try {
      return yaml.load(frontmatterMatch[1]);
    } catch (error) {
      return { error: `YAML parsing error: ${error.message}` };
    }
  }

  /**
   * Check a single page for metadata compliance
   */
  async checkPage(filePath, directory) {
    const relativePath = path.relative(process.cwd(), filePath);
    const fileName = path.basename(filePath);

    try {
      const content = await fs.readFile(filePath, 'utf8');
      const metadata = this.parseFrontmatter(content);

      const pageIssues = [];

      if (!metadata) {
        pageIssues.push('No frontmatter found');
        this.report.issues.push({
          file: relativePath,
          directory: directory,
          severity: 'HIGH',
          issue: 'Missing frontmatter',
          description: 'Page has no YAML frontmatter metadata'
        });
        return { compliant: false, issues: pageIssues, metadata: null };
      }

      if (metadata.error) {
        pageIssues.push(metadata.error);
        this.report.issues.push({
          file: relativePath,
          directory: directory,
          severity: 'HIGH',
          issue: 'YAML parsing error',
          description: metadata.error
        });
        return { compliant: false, issues: pageIssues, metadata: null };
      }

      // Check required fields
      for (const field of this.requiredFields) {
        if (!metadata[field]) {
          pageIssues.push(`Missing required field: ${field}`);
          this.report.issues.push({
            file: relativePath,
            directory: directory,
            severity: 'HIGH',
            issue: `Missing required field: ${field}`,
            description: `The ${field} field is required but not present`
          });
        }
      }

      // Check system-category values
      if (metadata['system-category']) {
        if (!this.validSystemCategories.includes(metadata['system-category'])) {
          pageIssues.push(`Invalid system-category: ${metadata['system-category']}`);
          this.report.issues.push({
            file: relativePath,
            directory: directory,
            severity: 'MEDIUM',
            issue: 'Invalid system-category',
            description: `system-category "${metadata['system-category']}" is not in valid list: ${this.validSystemCategories.join(', ')}`
          });
        }

        // Check for uppercase 'General' instead of lowercase 'general'
        if (metadata['system-category'] === 'General') {
          pageIssues.push('system-category should be "general" (lowercase)');
          this.report.issues.push({
            file: relativePath,
            directory: directory,
            severity: 'LOW',
            issue: 'Case mismatch in system-category',
            description: 'system-category should be "general" (lowercase) instead of "General"'
          });
        }
      }

      // Check for deprecated 'category' field
      if (metadata.category && !metadata['system-category']) {
        pageIssues.push('Uses deprecated "category" field instead of "system-category"');
        this.report.issues.push({
          file: relativePath,
          directory: directory,
          severity: 'MEDIUM',
          issue: 'Deprecated field usage',
          description: 'Uses "category" field instead of "system-category"'
        });
      }

      // Check UUID format
      if (metadata.uuid) {
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        if (!uuidRegex.test(metadata.uuid)) {
          pageIssues.push('Invalid UUID format');
          this.report.issues.push({
            file: relativePath,
            directory: directory,
            severity: 'HIGH',
            issue: 'Invalid UUID format',
            description: 'UUID does not match expected format'
          });
        }

        // Check if filename matches UUID
        const expectedFileName = `${metadata.uuid}.md`;
        if (fileName !== expectedFileName) {
          pageIssues.push(`Filename mismatch: expected ${expectedFileName}`);
          this.report.issues.push({
            file: relativePath,
            directory: directory,
            severity: 'MEDIUM',
            issue: 'Filename/UUID mismatch',
            description: `Filename should be ${expectedFileName} based on UUID`
          });
        }
      }

      // Check user-keywords
      if (metadata['user-keywords']) {
        if (!Array.isArray(metadata['user-keywords'])) {
          pageIssues.push('user-keywords should be an array');
          this.report.issues.push({
            file: relativePath,
            directory: directory,
            severity: 'MEDIUM',
            issue: 'Invalid user-keywords format',
            description: 'user-keywords should be an array'
          });
        } else if (metadata['user-keywords'].length > 3) {
          pageIssues.push('Too many user-keywords (max 3)');
          this.report.issues.push({
            file: relativePath,
            directory: directory,
            severity: 'LOW',
            issue: 'Too many user-keywords',
            description: `Has ${metadata['user-keywords'].length} keywords, maximum is 3`
          });
        }
      }

      const isCompliant = pageIssues.length === 0;
      return {
        compliant: isCompliant,
        issues: pageIssues,
        metadata: metadata,
        directory: directory
      };

    } catch (error) {
      this.report.issues.push({
        file: relativePath,
        directory: directory,
        severity: 'HIGH',
        issue: 'File read error',
        description: `Could not read file: ${error.message}`
      });
      return { compliant: false, issues: [`File read error: ${error.message}`], metadata: null };
    }
  }

  /**
   * Check all pages in a directory
   */
  async checkDirectory(dirPath, directoryName) {
    try {
      const files = await fs.readdir(dirPath);
      const mdFiles = files.filter(file => file.endsWith('.md'));

      console.log(`\n📂 Checking ${directoryName} directory: ${mdFiles.length} files`);

      const results = [];
      for (const file of mdFiles) {
        const filePath = path.join(dirPath, file);
        const result = await this.checkPage(filePath, directoryName);
        result.fileName = file;
        results.push(result);

        this.report.totalPages++;
        if (result.compliant) {
          this.report.compliantPages++;
          console.log(`  ✅ ${file}`);
        } else {
          this.report.nonCompliantPages++;
          console.log(`  ❌ ${file} (${result.issues.length} issues)`);
        }
      }

      return results;
    } catch (error) {
      console.error(`Error reading directory ${dirPath}:`, error.message);
      return [];
    }
  }

  /**
   * Generate recommendations based on findings
   */
  generateRecommendations() {
    const recommendations = [];

    // Count issue types
    const issueCounts = {};
    this.report.issues.forEach(issue => {
      issueCounts[issue.issue] = (issueCounts[issue.issue] || 0) + 1;
    });

    // Generate specific recommendations
    if (issueCounts['Missing required field: system-category']) {
      recommendations.push({
        priority: 'HIGH',
        action: 'Add system-category field',
        description: `${issueCounts['Missing required field: system-category']} pages missing system-category. Add with default value "general".`
      });
    }

    if (issueCounts['Case mismatch in system-category']) {
      recommendations.push({
        priority: 'LOW',
        action: 'Normalize system-category values',
        description: `${issueCounts['Case mismatch in system-category']} pages use "General" instead of "general". Update to lowercase.`
      });
    }

    if (issueCounts['Deprecated field usage']) {
      recommendations.push({
        priority: 'MEDIUM',
        action: 'Migrate deprecated fields',
        description: `${issueCounts['Deprecated field usage']} pages use deprecated "category" field. Rename to "system-category".`
      });
    }

    if (issueCounts['Filename/UUID mismatch']) {
      recommendations.push({
        priority: 'MEDIUM',
        action: 'Fix filename/UUID mismatches',
        description: `${issueCounts['Filename/UUID mismatch']} pages have filenames that don't match their UUIDs.`
      });
    }

    if (issueCounts['Missing frontmatter']) {
      recommendations.push({
        priority: 'HIGH',
        action: 'Add missing frontmatter',
        description: `${issueCounts['Missing frontmatter']} pages have no metadata frontmatter.`
      });
    }

    this.report.recommendations = recommendations;
  }

  /**
   * Generate summary statistics
   */
  generateSummary() {
    const severityCounts = { HIGH: 0, MEDIUM: 0, LOW: 0 };
    this.report.issues.forEach(issue => {
      severityCounts[issue.severity]++;
    });

    this.report.summary = {
      complianceRate: Math.round((this.report.compliantPages / this.report.totalPages) * 100),
      severityCounts,
      topIssues: this.getTopIssues(5)
    };
  }

  /**
   * Get top N most common issues
   */
  getTopIssues(limit) {
    const issueCounts = {};
    this.report.issues.forEach(issue => {
      issueCounts[issue.issue] = (issueCounts[issue.issue] || 0) + 1;
    });

    return Object.entries(issueCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, limit)
      .map(([issue, count]) => ({ issue, count }));
  }

  /**
   * Print detailed report
   */
  printReport() {
    console.log('\n' + '='.repeat(60));
    console.log('📋 METADATA COMPLIANCE REPORT');
    console.log('='.repeat(60));

    console.log(`\n📊 SUMMARY:`);
    console.log(`Total Pages: ${this.report.totalPages}`);
    console.log(`Compliant: ${this.report.compliantPages} (${this.report.summary.complianceRate}%)`);
    console.log(`Non-Compliant: ${this.report.nonCompliantPages} (${100 - this.report.summary.complianceRate}%)`);

    console.log(`\n🚨 ISSUES BY SEVERITY:`);
    console.log(`HIGH: ${this.report.summary.severityCounts.HIGH}`);
    console.log(`MEDIUM: ${this.report.summary.severityCounts.MEDIUM}`);
    console.log(`LOW: ${this.report.summary.severityCounts.LOW}`);

    console.log(`\n🔝 TOP ISSUES:`);
    this.report.summary.topIssues.forEach((item, index) => {
      console.log(`${index + 1}. ${item.issue} (${item.count} occurrences)`);
    });

    if (this.report.recommendations.length > 0) {
      console.log(`\n💡 RECOMMENDATIONS:`);
      this.report.recommendations.forEach((rec, index) => {
        console.log(`${index + 1}. [${rec.priority}] ${rec.action}`);
        console.log(`   ${rec.description}`);
      });
    }

    if (this.report.issues.length > 0) {
      console.log(`\n📝 DETAILED ISSUES:`);
      const issuesByFile = {};
      this.report.issues.forEach(issue => {
        if (!issuesByFile[issue.file]) {
          issuesByFile[issue.file] = [];
        }
        issuesByFile[issue.file].push(issue);
      });

      Object.entries(issuesByFile).forEach(([file, issues]) => {
        console.log(`\n📄 ${file}:`);
        issues.forEach(issue => {
          console.log(`   [${issue.severity}] ${issue.issue}: ${issue.description}`);
        });
      });
    }
  }

  /**
   * Save report to JSON file
   */
  async saveReport() {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const reportFile = `metadata-compliance-report-${timestamp}.json`;

    const reportData = {
      generatedAt: new Date().toISOString(),
      ...this.report
    };

    await fs.writeFile(reportFile, JSON.stringify(reportData, null, 2));
    console.log(`\n💾 Full report saved to: ${reportFile}`);
    return reportFile;
  }

  /**
   * Run the complete compliance check
   */
  async run() {
    console.log('🔍 Starting Metadata Compliance Check...');

    // Check both directories
    await this.checkDirectory(this.pagesDir, 'pages');
    await this.checkDirectory(this.requiredPagesDir, 'required-pages');

    // Generate analysis
    this.generateRecommendations();
    this.generateSummary();

    // Print and save report
    this.printReport();
    await this.saveReport();

    console.log('\n✨ Compliance check complete!');

    // Return exit code based on compliance
    process.exit(this.report.summary.complianceRate === 100 ? 0 : 1);
  }
}

// Run the checker
if (require.main === module) {
  const checker = new MetadataComplianceChecker();
  checker.run().catch(console.error);
}

module.exports = MetadataComplianceChecker;