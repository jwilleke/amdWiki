#!/usr/bin/env ts-node

/**
 * Smart Template Merge Utility
 *
 * Intelligently merges template files with existing project files,
 * preserving custom content while adding new template sections.
 *
 * Usage:
 *   npx ts-node tools/merge-template.ts --template-dir /path/to/template --project-dir /path/to/project
 *   npx ts-node tools/merge-template.ts --file AGENTS.md --template-dir /tmp/template
 */

import * as fs from 'fs';
import * as path from 'path';

interface MergeOptions {
  templateDir: string;
  projectDir: string;
  file?: string;
  dryRun?: boolean;
}

interface MarkdownSection {
  heading: string;
  level: number;
  content: string;
  startLine: number;
  endLine: number;
}

/**
 * Parse markdown into sections based on headings
 */
function parseMarkdownSections(content: string): MarkdownSection[] {
  const lines = content.split('\n');
  const sections: MarkdownSection[] = [];
  let currentSection: MarkdownSection | null = null;
  let yamlFrontmatter = '';
  let inFrontmatter = false;
  let frontmatterStart = -1;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Handle YAML frontmatter
    if (i === 0 && line === '---') {
      inFrontmatter = true;
      frontmatterStart = i;
      continue;
    }

    if (inFrontmatter) {
      if (line === '---') {
        inFrontmatter = false;
        sections.push({
          heading: 'YAML_FRONTMATTER',
          level: 0,
          content: yamlFrontmatter,
          startLine: frontmatterStart,
          endLine: i
        });
        yamlFrontmatter = '';
        continue;
      }
      yamlFrontmatter += line + '\n';
      continue;
    }

    // Match markdown headings
    const headingMatch = line.match(/^(#{1,6})\s+(.+)$/);

    if (headingMatch) {
      // Save previous section if exists
      if (currentSection) {
        currentSection.endLine = i - 1;
        sections.push(currentSection);
      }

      // Start new section
      currentSection = {
        heading: headingMatch[2].trim(),
        level: headingMatch[1].length,
        content: '',
        startLine: i,
        endLine: i
      };
    } else if (currentSection) {
      currentSection.content += line + '\n';
    }
  }

  // Push last section
  if (currentSection) {
    currentSection.endLine = lines.length - 1;
    sections.push(currentSection);
  }

  return sections;
}

/**
 * Merge AGENTS.md intelligently
 */
function mergeAgentsMd(templatePath: string, projectPath: string): string {
  const templateContent = fs.readFileSync(templatePath, 'utf-8');
  const projectContent = fs.readFileSync(projectPath, 'utf-8');

  const templateSections = parseMarkdownSections(templateContent);
  const projectSections = parseMarkdownSections(projectContent);

  // Create map of existing sections
  const projectSectionMap = new Map<string, MarkdownSection>();
  for (const section of projectSections) {
    projectSectionMap.set(section.heading, section);
  }

  const merged: string[] = [];

  // Always use template's YAML frontmatter structure, but preserve some values if they exist
  const templateYaml = templateSections.find(s => s.heading === 'YAML_FRONTMATTER');
  const projectYaml = projectSections.find(s => s.heading === 'YAML_FRONTMATTER');

  if (templateYaml) {
    merged.push('---');
    if (projectYaml) {
      // Merge YAML: keep project's values where they exist, use template structure
      const projectYamlObj = parseYaml(projectYaml.content);
      const templateYamlObj = parseYaml(templateYaml.content);

      // Prefer project values for these fields
      const merged_yaml = {
        ...templateYamlObj,
        project_state: projectYamlObj.project_state || templateYamlObj.project_state,
        last_updated: new Date().toISOString().split('T')[0],
        blockers: projectYamlObj.blockers || templateYamlObj.blockers,
        agent_priority_level: projectYamlObj.agent_priority_level || templateYamlObj.agent_priority_level
      };

      for (const [key, value] of Object.entries(merged_yaml)) {
        if (Array.isArray(value)) {
          merged.push(`${key}: ${JSON.stringify(value)}`);
        } else {
          merged.push(`${key}: "${value}"`);
        }
      }
    } else {
      merged.push(templateYaml.content.trim());
    }
    merged.push('---');
    merged.push('');
  }

  // Process template sections
  for (const templateSection of templateSections) {
    if (templateSection.heading === 'YAML_FRONTMATTER') continue;

    const existingSection = projectSectionMap.get(templateSection.heading);

    // Add heading
    merged.push('#'.repeat(templateSection.level) + ' ' + templateSection.heading);
    merged.push('');

    // Sections to ALWAYS use from template (new structure)
    const alwaysUseTemplate = [
      'Agent Context Protocol',
      'Machine-Readable Metadata',
      'Update Requirements',
      'Quick Navigation - Single Source of Truth',
      'Core Documentation (Single Source of Truth)',
      'Auxiliary Documentation',
      'Agent Priority Matrix',
      'Agents CAN Work Autonomously On',
      'Agents MUST Request Human Review For',
      'Known Limitations & Constraints',
      'Technical Constraints',
      'Process Constraints',
      'Agent-Specific Guidelines'
    ];

    // Sections to PREFER from project (custom content)
    const preferProject = [
      'Context Overview',
      'Key Decisions',
      'Project Constraints',
      'Notes & Context',
      'CRITICAL'
    ];

    if (alwaysUseTemplate.includes(templateSection.heading)) {
      // Use template version (new sections)
      merged.push(templateSection.content.trim());
    } else if (existingSection && preferProject.includes(templateSection.heading)) {
      // Use project version (custom content)
      merged.push(existingSection.content.trim());
    } else if (existingSection) {
      // Section exists in both - use project version but warn
      console.log(`  ℹ️  Keeping existing content for: ${templateSection.heading}`);
      merged.push(existingSection.content.trim());
    } else {
      // New section from template
      console.log(`  ✨ Adding new section: ${templateSection.heading}`);
      merged.push(templateSection.content.trim());
    }

    merged.push('');
  }

  // Add any custom sections from project that aren't in template
  for (const projectSection of projectSections) {
    if (projectSection.heading === 'YAML_FRONTMATTER') continue;

    const inTemplate = templateSections.some(s => s.heading === projectSection.heading);
    if (!inTemplate) {
      console.log(`  📝 Preserving custom section: ${projectSection.heading}`);
      merged.push('#'.repeat(projectSection.level) + ' ' + projectSection.heading);
      merged.push('');
      merged.push(projectSection.content.trim());
      merged.push('');
    }
  }

  return merged.join('\n').trim() + '\n';
}

/**
 * Simple YAML parser for frontmatter
 */
function parseYaml(content: string): Record<string, any> {
  const result: Record<string, any> = {};
  const lines = content.split('\n');

  for (const line of lines) {
    const match = line.match(/^(\w+):\s*(.+)$/);
    if (match) {
      const key = match[1];
      let value: any = match[2].trim();

      // Remove quotes
      if (value.startsWith('"') && value.endsWith('"')) {
        value = value.slice(1, -1);
      }

      // Parse arrays
      if (value.startsWith('[') && value.endsWith(']')) {
        try {
          value = JSON.parse(value);
        } catch (e) {
          // Keep as string if parse fails
        }
      }

      result[key] = value;
    }
  }

  return result;
}

/**
 * Merge package.json intelligently
 */
function mergePackageJson(templatePath: string, projectPath: string): string {
  const template = JSON.parse(fs.readFileSync(templatePath, 'utf-8'));
  const project = JSON.parse(fs.readFileSync(projectPath, 'utf-8'));

  const merged = {
    // Keep project metadata
    name: project.name || template.name,
    version: project.version || template.version,
    description: project.description || template.description,
    author: project.author || template.author,
    license: project.license || template.license,

    // Use template structure for scripts (but preserve custom scripts)
    scripts: {
      ...project.scripts,
      ...template.scripts
    },

    // Merge dependencies (template + project)
    dependencies: {
      ...template.dependencies,
      ...project.dependencies
    },

    // Merge devDependencies (template + project)
    devDependencies: {
      ...template.devDependencies,
      ...project.devDependencies
    },

    // Keep other fields from project
    ...project,

    // But ensure engines from template
    engines: template.engines
  };

  return JSON.stringify(merged, null, 2) + '\n';
}

/**
 * Main merge function
 */
async function mergeTemplate(options: MergeOptions): Promise<void> {
  const { templateDir, projectDir, file, dryRun = false } = options;

  console.log('🔀 Smart Template Merge');
  console.log('═══════════════════════════════════════\n');
  console.log(`Template: ${templateDir}`);
  console.log(`Project:  ${projectDir}`);
  console.log(`Mode:     ${dryRun ? 'DRY RUN (no changes)' : 'LIVE'}\n`);

  const filesToMerge = file ? [file] : ['AGENTS.md', 'package.json'];

  for (const fileName of filesToMerge) {
    const templateFilePath = path.join(templateDir, fileName);
    const projectFilePath = path.join(projectDir, fileName);

    // Skip if template file doesn't exist
    if (!fs.existsSync(templateFilePath)) {
      console.log(`⏭️  Skipping ${fileName} (not in template)\n`);
      continue;
    }

    // If project file doesn't exist, just copy template
    if (!fs.existsSync(projectFilePath)) {
      console.log(`📄 ${fileName}: NEW FILE (copying from template)`);
      if (!dryRun) {
        fs.copyFileSync(templateFilePath, projectFilePath);
      }
      console.log(`   ✅ Copied\n`);
      continue;
    }

    console.log(`🔄 ${fileName}: MERGING`);

    let mergedContent: string;

    try {
      if (fileName === 'AGENTS.md') {
        mergedContent = mergeAgentsMd(templateFilePath, projectFilePath);
      } else if (fileName === 'package.json') {
        mergedContent = mergePackageJson(templateFilePath, projectFilePath);
      } else {
        console.log(`   ⚠️  No merge logic for ${fileName}, skipping\n`);
        continue;
      }

      if (dryRun) {
        console.log(`   📋 Would update ${fileName}`);
        console.log(`   Preview (first 200 chars):\n${mergedContent.substring(0, 200)}...\n`);
      } else {
        // Backup original
        const backupPath = projectFilePath + '.backup';
        fs.copyFileSync(projectFilePath, backupPath);
        console.log(`   💾 Backup created: ${backupPath}`);

        // Write merged content
        fs.writeFileSync(projectFilePath, mergedContent);
        console.log(`   ✅ Merged successfully\n`);
      }
    } catch (error) {
      console.error(`   ❌ Error merging ${fileName}:`, error);
      console.log('');
    }
  }

  console.log('═══════════════════════════════════════');
  console.log('✨ Merge complete!');

  if (dryRun) {
    console.log('\n💡 Run without --dry-run to apply changes');
  } else {
    console.log('\n💡 Backup files created with .backup extension');
    console.log('💡 Review changes and remove backups when satisfied');
  }
}

// CLI interface
if (require.main === module) {
  const args = process.argv.slice(2);
  const options: MergeOptions = {
    templateDir: '',
    projectDir: process.cwd(),
    dryRun: args.includes('--dry-run')
  };

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--template-dir' && args[i + 1]) {
      options.templateDir = args[i + 1];
    }
    if (args[i] === '--project-dir' && args[i + 1]) {
      options.projectDir = args[i + 1];
    }
    if (args[i] === '--file' && args[i + 1]) {
      options.file = args[i + 1];
    }
  }

  if (!options.templateDir) {
    console.error('Error: --template-dir required');
    console.log('\nUsage:');
    console.log('  npx ts-node tools/merge-template.ts --template-dir /path/to/template [--project-dir /path/to/project] [--file AGENTS.md] [--dry-run]');
    process.exit(1);
  }

  mergeTemplate(options).catch(console.error);
}

export { mergeTemplate, MergeOptions };
