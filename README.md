# Markdown Wiki

A simple, file-based wiki application built with Node.js, Express, and Markdown which mimics [JSPWiki](https://github.com/apache/jspwiki)

📋 **See [ROADMAP.md](ROADMAP.md) for project vision, technical specifications, and feature priorities.**

## Features

- Create, view, and edit wiki pages
- Advanced search with multi-criteria filtering
- JSPWiki-style link syntax with pipe notation
- Category and keyword-based organization
- Red link detection for non-existent pages
- Three-state authentication system
- Professional UI with Bootstrap styling
- Pages are stored as Markdown files

📖 **Detailed technical documentation available in [docs/](docs/) folder.**

## Getting Started

### For Users
1. Install dependencies:
    ```bash
    npm install
    ```
2. Start the server:
    ```bash
    npm start
    # or
    node app.js
    ```
3. Open your browser and navigate to `http://localhost:3000`.

### For Developers
- Follow the setup steps above.
- Read [CONTRIBUTING.md](CONTRIBUTING.md) for coding standards, testing, and contribution guidelines.
- Check [CHANGELOG.md](CHANGELOG.md) for version history and migration notes for breaking changes.

## Configuration
Configuration files are located in `config/` or `wiki.conf/` directories. Modify settings like port, directories, or manager options as needed. See detailed configuration guides in [docs/](docs/) if available.

## Examples
**Creating a Wiki Page Link (JSPWiki Syntax):**
```markdown
[Link Text|PageName]  # Links to PageName with custom text
[PageName]           # Simple link to PageName
```

## Documentation
- [CHANGELOG.md](CHANGELOG.md) - Version history and detailed change notes.
- [CONTRIBUTING.md](CONTRIBUTING.md) - How to contribute to the project.
- [ROADMAP.md](ROADMAP.md) - Project vision and feature priorities.
- [docs/](docs/) - In-depth technical guides on architecture, plugins, and more.

## Version Management

This project follows [Semantic Versioning](https://semver.org/) (SemVer). Use the built-in version management tools:

### Check Current Version
```bash
npm run version:show
# or
node version.js
```

### Increment Version
```bash
npm run version:patch    # Bug fixes (1.2.0 → 1.2.1)
npm run version:minor    # New features (1.2.0 → 1.3.0)
npm run version:major    # Breaking changes (1.2.0 → 2.0.0)
```

### Set Specific Version
```bash
node version.js set 1.2.3
```

### Version Help
```bash
npm run version:help
```

The version management script automatically:
- Updates `package.json` version
- Updates `CHANGELOG.md` with release information
- Validates version format
- Provides semantic versioning guidance

## License
See [LICENSE](LICENSE) for details on usage and distribution.
