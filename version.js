#!/usr/bin/env node

/**
 * Version Management Script for amdWiki
 *
 * Helps manage semantic versioning for the project.
 *
 * Usage:
 *   node version.js                    - Show current version
 *   node version.js patch              - Increment patch version (bug fixes)
 *   node version.js minor              - Increment minor version (new features)
 *   node version.js major              - Increment major version (breaking changes)
 *   node version.js set <version>      - Set specific version
 */

const fs = require('fs');
const path = require('path');

const PACKAGE_JSON_PATH = path.join(__dirname, 'package.json');
const CHANGELOG_PATH = path.join(__dirname, 'CHANGELOG.md');

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
  node version.js                    - Show current version and info
  node version.js patch              - Increment patch (bug fixes: 1.2.0 → 1.2.1)
  node version.js minor              - Increment minor (new features: 1.2.0 → 1.3.0)
  node version.js major              - Increment major (breaking changes: 1.2.0 → 2.0.0)
  node version.js set <version>      - Set specific version (e.g., 1.2.3)
  node version.js help               - Show this help

Semantic Versioning:
  MAJOR.MINOR.PATCH
  - MAJOR: Incompatible API changes
  - MINOR: Backward-compatible functionality additions
  - PATCH: Backward-compatible bug fixes
`);
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
            console.log('\nRun "node version.js help" for usage information.');
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
                console.log('Run "node version.js help" for usage information.');
                process.exit(1);
        }

        // Update package.json
        packageData.version = newVersion;
        writePackageJson(packageData);

        // Update changelog if incrementing
        if (['patch', 'minor', 'major'].includes(command)) {
            updateChangelogForRelease(newVersion);
        }

        console.log(`Version updated: ${currentVersion} → ${newVersion}`);
        console.log(`Type: ${command.toUpperCase()}`);

        if (command === 'major') {
            console.log('\n⚠️  MAJOR version bump - ensure breaking changes are documented!');
        } else if (command === 'minor') {
            console.log('\n✨ MINOR version bump - new features added');
        } else if (command === 'patch') {
            console.log('\n🐛 PATCH version bump - bug fixes');
        }

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
