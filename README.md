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
    ./server.sh start          # Production mode (default)
    # or
    ./server.sh start dev      # Development mode
    ```
3. Open your browser and navigate to `http://localhost:3000`

**Server Management:**
```bash
./server.sh start [dev|prod]   # Start server (default: production)
./server.sh stop               # Stop server
./server.sh restart [dev|prod] # Restart server
./server.sh status             # Show server status
./server.sh logs [50]          # Show logs (default: 50 lines)
./server.sh env                # Show environment config
./server.sh unlock             # Remove PID lock (if server crashed)
```

### For Developers
- Follow the setup steps above.
- Read [docs/development/CONTRIBUTING.md](docs/development/CONTRIBUTING.md) for coding standards, testing, and contribution guidelines.
- Check [docs/CHANGELOG.md](docs/CHANGELOG.md) for version history and migration notes for breaking changes.

## Configuration

amdWiki uses a **hierarchical configuration system** with three layers (later overrides earlier):

1. `config/app-default-config.json` - Base defaults (required, ~1150 properties)
2. `config/app-{environment}-config.json` - Environment-specific settings (optional)
   - Environment determined by `NODE_ENV` (development, production, test)
3. `config/app-custom-config.json` - Local overrides (optional, persisted by admin UI)

### Making Configuration Changes

**Via Admin UI:**
- Navigate to [/admin/configuration](/admin/configuration)
- Changes saved to `app-custom-config.json`
- Restart required: [/admin/restart](/admin/restart)

**Manual Editing:**
- Edit `config/app-custom-config.json` directly
- Restart server to apply changes:
  ```bash
  ./server.sh restart
  ```

### Key Configuration Properties

```json
{
  "amdwiki.applicationName": "amdWiki",
  "amdwiki.server.port": 3000,
  "amdwiki.baseURL": "http://localhost:3000",
  "amdwiki.frontPage": "Welcome",
  "amdwiki.page.provider": "filesystemprovider",
  "amdwiki.backup.autoBackup": true
}
```

**Note:** Properties starting with `_` are treated as comments and ignored.

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
│   │   └── __tests__/    # Route test suites
│   └── utils/             # Utility functions
├── config/                # Application configuration
│   ├── app-default-config.json        # Base defaults (~1150 properties)
│   ├── app-{env}-config.json          # Environment-specific
│   └── app-custom-config.json         # Local overrides
├── public/                # Static assets (CSS, JS, images)
├── views/                 # EJS templates
├── docs/                  # Documentation
│   ├── architecture/      # System architecture docs
│   ├── development/       # Development guides
│   ├── planning/          # Project planning docs
│   ├── api/              # API documentation
│   ├── migration/        # Migration guides
│   ├── testing/          # Testing documentation
│   ├── managers/         # Manager documentation
│   └── issues/           # Issue tracking
├── scripts/               # Utility scripts
├── templates/             # Wiki page templates
├── plugins/               # Plugin system
├── themes/                # UI themes
├── data/                  # Runtime application data
│   ├── attachments/      # Uploaded file storage
│   └── sessions/         # Express session store
├── pages/                 # User-generated wiki pages
├── required-pages/        # System required pages
├── users/                 # User account data (users, roles, sessions)
├── backups/               # System backups (BackupManager)
├── exports/               # Exported content
├── logs/                  # Application logs
├── reports/               # Test coverage reports
├── coverage/              # Istanbul coverage data
└── jsdocs/                # JSDoc generated API docs
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

### Parser Configuration

The WikiDocument DOM parser is enabled by default. To use the legacy parser, add to `config/app-custom-config.json`:

```json
{
  "jspwiki.parser.useExtractionPipeline": false
}
```

Then restart the server (see [Configuration](#configuration) section above).

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
