# Semantic Versioning Implementation

This document outlines the semantic versioning implementation for amdWiki.

## Overview

The project now follows [Semantic Versioning 2.0.0](https://semver.org/) specification:

**Format**: MAJOR.MINOR.PATCH

- **MAJOR**: Incompatible API changes
- **MINOR**: Backward-compatible functionality additions
- **PATCH**: Backward-compatible bug fixes

## Current Version

**Version**: 1.2.0 (as of September 7, 2025)

This represents a MINOR version increment from the baseline due to significant new features:

- Advanced search system
- Enhanced authentication
- UI/UX improvements
- JSPWiki-style functionality

## Tools Implemented

### 1. Version Management Script (`version.js`)

**Usage**:

```bash
node version.js                    # Show current version
node version.js patch              # Increment patch version
node version.js minor              # Increment minor version  
node version.js major              # Increment major version
node version.js set <version>      # Set specific version
node version.js help               # Show help
```

### 2. NPM Scripts

Added to `package.json`:

```json
{
  "scripts": {
    "version:show": "node version.js",
    "version:patch": "node version.js patch",
    "version:minor": "node version.js minor", 
    "version:major": "node version.js major",
    "version:help": "node version.js help"
  }
}
```

### 3. Enhanced Package.json

Updated with:

- Proper semantic version (1.2.0)
- Descriptive project description
- Correct main entry point
- Version management scripts

### 4. Semantic Versioning in Changelog

The `CHANGELOG.md` now follows [Keep a Changelog](https://keepachangelog.com/) format with:

- Proper version headers with dates
- Version type indicators (MAJOR/MINOR/PATCH)
- Semantic versioning guide
- [Unreleased] section for future changes

## Version History

- **1.2.0** (2025-09-07): MINOR - Advanced search system, enhanced authentication, UI improvements
- **1.1.0** (2025-08-01): MINOR - Basic feature set with authentication and templates  
- **1.0.0** (2025-07-01): MAJOR - Initial release

## Automation Features

The version management script automatically:

1. **Updates package.json** with new version
2. **Updates CHANGELOG.md** with release information
3. **Validates version format** to ensure SemVer compliance
4. **Provides guidance** on version type selection
5. **Shows warnings** for major version bumps

## Usage Guidelines

### When to increment versions

**PATCH (1.2.0 → 1.2.1)**:

- Bug fixes
- Documentation updates
- Performance improvements (no API changes)
- Internal refactoring

**MINOR (1.2.0 → 1.3.0)**:

- New features
- New API methods/endpoints
- Enhanced functionality
- Backward-compatible changes

**MAJOR (1.2.0 → 2.0.0)**:

- Breaking API changes
- Removed functionality
- Incompatible changes
- Architecture overhauls

## Best Practices

1. **Always update CHANGELOG.md** before releasing
2. **Test thoroughly** before version increments
3. **Document breaking changes** for major versions
4. **Use descriptive commit messages** referencing version changes
5. **Tag releases** in Git with version numbers

## Examples

```bash
# After fixing a bug
npm run version:patch

# After adding search filters feature  
npm run version:minor

# After changing authentication API
npm run version:major

# Set specific version for hotfix
node version.js set 1.2.1
```

## Integration with Development Workflow

1. **Feature Development**: Work on features in branches
2. **Testing**: Ensure all features work before versioning
3. **Documentation**: Update changelog with changes
4. **Version Increment**: Use appropriate version bump
5. **Release**: Tag and deploy the new version

This semantic versioning implementation provides clear version management and helps users understand the impact of updates.
