---
alwaysApply: true
---

## Version Management & Documentation
1. Follow Semantic Versioning (Major.Minor.Patch) - this project adheres to [SemVer](https://semver.org/spec/v2.0.0.html)
2. **All notable changes MUST be documented in CHANGELOG.md** following [Keep a Changelog](https://keepachangelog.com/en/1.0.0/) format
3. Use npm scripts for version management (version:patch, version:minor, version:major)
4. Document breaking changes and migration paths in changelog
5. Use structured changelog sections: Added, Changed, Fixed, Security, Removed, Planned
6. Include detailed technical descriptions and user impact for each change

## Code Quality & Linting Standards
1. Use `.markdownlint.json` configuration for markdown linting consistency across all files
2. Disable MD025 rule to allow multiple H1 headings (supports frontmatter title + content heading format)
3. Maintain other markdownlint rules for document structure, formatting, and quality
4. Apply linting to all markdown files including wiki pages, documentation, and system files
5. Follow existing markdown formatting patterns established in the codebase
6. Use consistent heading hierarchy and bullet point formatting

## Documentation Requirements
1. Document all new features and changes in CHANGELOG.md before release
2. Include code examples and usage patterns in documentation
3. Provide migration guides for breaking changes
4. Document configuration options and their effects
5. Maintain up-to-date README.md with current feature set and setup instructions