# Markdown Wiki

A simple, file-based wiki application built with Node.js, Express, and Markdown which mimics [JSPWiki](https://github.com/apache/jspwiki)

📋 **See [docs/planning/ROADMAP.md](docs/planning/ROADMAP.md) for project vision, technical specifications, and feature priorities.**

## Features

- Create, view, and edit wiki pages
- Advanced search with multi-criteria filtering
- JSPWiki-style link syntax with pipe notation
- Category and keyword-based organization
- Red link detection for non-existent pages
- Three-state authentication system
- Professional UI with Bootstrap styling
- Pages are stored as Markdown files
- **Inline image support with upload functionality**
- **Plugin system for extensible functionality**
- **Policy-Based Access Control**: Advanced permission system with JSON configuration
- **Comprehensive Audit Trail**: Complete security monitoring and access logging
- **Time-Based Permissions**: Context-aware permissions with scheduling and maintenance mode
- **Admin Dashboard**: Full administrative interface for user management and system monitoring
- **WikiDocument DOM Architecture**: Robust, JSPWiki-inspired parsing engine with DOM-based processing
- **Conflict-Free Parsing**: JSPWiki syntax and Markdown coexist without interference
- **📚 Page Version History**: Complete version control with diff comparison and restore capabilities
  - View all previous versions of any page
  - Compare versions side-by-side or unified diff
  - Restore to any previous version
  - Automatic delta storage for efficiency
  - Full version metadata tracking

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
- Read [docs/development/CONTRIBUTING.md](docs/development/CONTRIBUTING.md) for coding standards, testing, and contribution guidelines.
- Check [docs/CHANGELOG.md](docs/CHANGELOG.md) for version history and migration notes for breaking changes.

## Configuration
Configuration files are located in `config/` directory. Modify settings like port, directories, or manager options as needed. See detailed configuration guides in [docs/](docs/) if available.

## Project Structure

```bash
amdWiki/
├── src/                    # Source code
│   ├── core/              # Core engine components
│   ├── managers/          # Business logic managers
│   ├── parsers/           # WikiDocument DOM parser
│   │   ├── dom/          # DOM handlers and WikiDocument
│   │   └── __tests__/    # Parser test suites
│   ├── routes/            # HTTP route handlers
│   └── utils/             # Utility functions
├── config/                # Application configuration
├── public/                # Static assets (CSS, JS, images)
├── views/                 # EJS templates
├── docs/                  # Documentation
│   ├── architecture/      # System architecture docs
│   ├── development/       # Development guides
│   ├── planning/          # Project planning docs
│   ├── api/              # API documentation (incl. MarkupParser)
│   ├── migration/        # Migration guides
│   ├── testing/          # Testing documentation
│   └── issues/           # Issue tracking
├── tests/                 # Test files
├── scripts/               # Utility scripts
├── data/                  # Runtime application data
├── logs/                  # Application logs
├── pages/                 # User-generated wiki pages
├── users/                 # User account data
├── attachments/           # User uploaded files
├── exports/               # Exported content
├── reports/               # Test coverage reports
└── archive/               # Legacy files
```

📖 **Detailed project structure documentation available in [docs/architecture/PROJECT-STRUCTURE.md](docs/architecture/PROJECT-STRUCTURE.md)**

## Examples
**Creating a Wiki Page Link (JSPWiki Syntax):**
```markdown
[Link Text|PageName]  # Links to PageName with custom text
[PageName]           # Simple link to PageName
```

**Inserting Images (JSPWiki Plugin Syntax):**
```markdown
[{Image src='image.jpg' alt='Description' width='300'}]  # Basic image
[{Image src='/images/photo.jpg' alt='Photo' height='200'}]  # With height
[{Image src='https://example.com/image.png' class='responsive'}]  # External image
```

**Image Upload:**
- Use the image upload section in the page editor
- Select an image file and click "Upload Image"
- Click "Insert at Cursor" to add the image to your content
- Supported formats: JPEG, PNG, GIF, WebP (max 5MB)

## Parser Architecture

amdWiki uses a **WikiDocument DOM extraction pipeline** that provides robust, conflict-free parsing of JSPWiki syntax and Markdown:

### How It Works

1. **Extract** - JSPWiki syntax (`[{$var}]`, `[{Plugin}]`, `[Link]`) extracted before Markdown parsing
2. **Create DOM Nodes** - WikiDocument DOM nodes created for each JSPWiki element
3. **Parse Markdown** - Showdown processes ALL Markdown without JSPWiki interference
4. **Merge** - DOM nodes merged back into final HTML

### Benefits

- ✅ **No parsing conflicts** - JSPWiki and Markdown processed independently
- ✅ **Correct heading rendering** - All Markdown headings (`##`, `###`) render properly
- ✅ **Natural escaping** - `[[{$var}]]` creates literal text via DOM nodes
- ✅ **Extensible** - Easy to add custom syntax via DOM handlers
- ✅ **Production-ready** - 376+ tests with 100% success rate

### Configuration

The parser is enabled by default. To use the legacy parser:

```json
{
  "jspwiki.parser.useExtractionPipeline": false
}
```

### Documentation

- **API Reference:** [docs/api/MarkupParser-API.md](docs/api/MarkupParser-API.md)
- **Migration Guide:** [docs/migration/WikiDocument-DOM-Migration.md](docs/migration/WikiDocument-DOM-Migration.md)
- **Architecture:** [docs/architecture/WikiDocument-DOM-Architecture.md](docs/architecture/WikiDocument-DOM-Architecture.md)

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
