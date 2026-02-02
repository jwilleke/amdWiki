#!/usr/bin/env node

/**
 * Version Management Script for amdWiki
 *
 * Helps manage semantic versioning for the project.
 *
 * Updates: package.json, package-lock.json (via npm), app-default-config.json,
 *          CHANGELOG.md, and creates a git tag (v<version>).
 *
 * Usage:
 *   node scripts/version.js                    - Show current version
 *   node scripts/version.js patch              - Increment patch version (bug fixes)
 *   node scripts/version.js minor              - Increment minor version (new features)
 *   node scripts/version.js major              - Increment major version (breaking changes)
 *   node scripts/version.js set <version>      - Set specific version
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const PROJECT_ROOT = path.join(__dirname, '..');
const PACKAGE_JSON_PATH = path.join(PROJECT_ROOT, 'package.json');
const CHANGELOG_PATH = path.join(PROJECT_ROOT, 'CHANGELOG.md');
const DEFAULT_CONFIG_PATH = path.join(PROJECT_ROOT, 'config', 'app-default-config.json');

function readPackageJson() {
    try {
        const content = fs.readFileSync(PACKAGE_JSON_PATH, 'utf8');
        return JSON.parse(content);
    } catch (error) {
        console.error('Error reading package.json:', error.message);
        process.exit(1);
    }
}

function writePackageJson(packageData) {
    try {
        const content = JSON.stringify(packageData, null, 2) + '\n';
        fs.writeFileSync(PACKAGE_JSON_PATH, content);
    } catch (error) {
        console.error('Error writing package.json:', error.message);
        process.exit(1);
    }
}

function parseVersion(version) {
    const match = version.match(/^(\d+)\.(\d+)\.(\d+)$/);
    if (!match) {
        throw new Error(`Invalid version format: ${version}`);
    }
    return {
        major: parseInt(match[1], 10),
        minor: parseInt(match[2], 10),
        patch: parseInt(match[3], 10)
    };
}

function formatVersion(major, minor, patch) {
    return `${major}.${minor}.${patch}`;
}

function incrementVersion(currentVersion, type) {
    const { major, minor, patch } = parseVersion(currentVersion);

    switch (type) {
        case 'patch':
            return formatVersion(major, minor, patch + 1);
        case 'minor':
            return formatVersion(major, minor + 1, 0);
        case 'major':
            return formatVersion(major + 1, 0, 0);
        default:
            throw new Error(`Invalid increment type: ${type}`);
    }
}

function getCurrentDate() {
    return new Date().toISOString().split('T')[0];
}

function updateChangelogForRelease(newVersion) {
    try {
        let changelog = fs.readFileSync(CHANGELOG_PATH, 'utf8');

        // Find the [Unreleased] section and replace with new version
        const unreleasedPattern = /## \[Unreleased\]/;
        if (changelog.match(unreleasedPattern)) {
            const newVersionHeader = `## [Unreleased]\n\n### Planned\n- Future enhancements\n\n## [${newVersion}] - ${getCurrentDate()}`;
            changelog = changelog.replace(/## \[Unreleased\]/, newVersionHeader);
            fs.writeFileSync(CHANGELOG_PATH, changelog);
            console.log(`Updated CHANGELOG.md with version ${newVersion}`);
        }
    } catch (error) {
        console.warn('Warning: Could not update CHANGELOG.md:', error.message);
    }
}

function showHelp() {
    console.log(`
amdWiki Version Management

Usage:
  node scripts/version.js                    - Show current version and info
  node scripts/version.js patch              - Increment patch (bug fixes: 1.2.0 → 1.2.1)
  node scripts/version.js minor              - Increment minor (new features: 1.2.0 → 1.3.0)
  node scripts/version.js major              - Increment major (breaking changes: 1.2.0 → 2.0.0)
  node scripts/version.js set <version>      - Set specific version (e.g., 1.2.3)
  node scripts/version.js help               - Show this help

Semantic Versioning:
  MAJOR.MINOR.PATCH
  - MAJOR: Incompatible API changes
  - MINOR: Backward-compatible functionality additions
  - PATCH: Backward-compatible bug fixes

Files updated:
  - package.json
  - config/app-default-config.json (amdwiki.version)
  - CHANGELOG.md (Unreleased → version header)
  - Git tag v<version> created locally

To publish Docker image after bumping:
  git push origin v<version>
`);
}

function createGitTag(version) {
    const tag = `v${version}`;
    try {
        // Check if tag already exists
        const existing = execSync(`git tag -l "${tag}"`, { encoding: 'utf8' }).trim();
        if (existing === tag) {
            console.warn(`Warning: Git tag ${tag} already exists, skipping tag creation.`);
            return;
        }

        execSync(`git tag "${tag}"`, { stdio: 'pipe' });
        console.log(`Created git tag: ${tag}`);
    } catch (error) {
        // git not available or other error, skip tagging
        console.warn(`Warning: Could not create git tag ${tag}:`, error.message);
    }
}

function main() {
    const args = process.argv.slice(2);
    const command = args[0];

    const packageData = readPackageJson();
    const currentVersion = packageData.version;

    if (!command || command === 'help') {
        if (!command) {
            console.log(`Current version: ${currentVersion}`);
            console.log(`Project: ${packageData.name}`);
            console.log(`Description: ${packageData.description || 'No description'}`);
            console.log('\nRun "node scripts/version.js help" for usage information.');
        } else {
            showHelp();
        }
        return;
    }

    try {
        let newVersion;

        switch (command) {
            case 'patch':
            case 'minor':
            case 'major':
                newVersion = incrementVersion(currentVersion, command);
                break;

            case 'set':
                newVersion = args[1];
                if (!newVersion) {
                    console.error('Error: Please specify a version to set');
                    process.exit(1);
                }
                // Validate version format
                parseVersion(newVersion);
                break;

            default:
                console.error(`Error: Unknown command "${command}"`);
                console.log('Run "node scripts/version.js help" for usage information.');
                process.exit(1);
        }

        // Update package.json
        packageData.version = newVersion;
        writePackageJson(packageData);

        // Update app-default-config.json
        try {
            const configContent = fs.readFileSync(DEFAULT_CONFIG_PATH, 'utf8');
            const config = JSON.parse(configContent);
            config['amdwiki.version'] = newVersion;
            fs.writeFileSync(DEFAULT_CONFIG_PATH, JSON.stringify(config, null, 2) + '\n');
            console.log(`Updated config/app-default-config.json with version ${newVersion}`);
        } catch (error) {
            console.warn('Warning: Could not update app-default-config.json:', error.message);
        }

        // Update changelog if incrementing
        if (['patch', 'minor', 'major'].includes(command)) {
            updateChangelogForRelease(newVersion);
        }

        // Create git tag
        createGitTag(newVersion);

        console.log(`Version updated: ${currentVersion} → ${newVersion}`);
        console.log(`Type: ${command.toUpperCase()}`);

        if (command === 'major') {
            console.log('\n⚠️  MAJOR version bump - ensure breaking changes are documented!');
        } else if (command === 'minor') {
            console.log('\n✨ MINOR version bump - new features added');
        } else if (command === 'patch') {
            console.log('\n🐛 PATCH version bump - bug fixes');
        }

        console.log(`\n🏷️  Git tag v${newVersion} created locally.`);
        console.log(`   To trigger Docker build: git push origin v${newVersion}`);

    } catch (error) {
        console.error('Error:', error.message);
        process.exit(1);
    }
}

if (require.main === module) {
    main();
}

module.exports = {
    parseVersion,
    incrementVersion,
    formatVersion
};
