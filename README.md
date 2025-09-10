
# Markdown Wiki

A simple, file-based wiki application built with Node.js, Express, and Markdown which mimics [JSPWiki](https://github.com/apache/jspwiki)

📋 **See [ROADMAP.md](ROADMAP.md) for project vision, technical specifications, and feature priorities.**

## Features

* Create, view, and edit wiki pages
* Advanced search with multi-criteria filtering
* JSPWiki-style link syntax with pipe notation
* Category and keyword-based organization
* Red link detection for non-existent pages
* Three-state authentication system
* Professional UI with Bootstrap styling
* Pages are stored as Markdown files

## Running the Application

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

* Updates `package.json` version
* Updates `CHANGELOG.md` with release information
* Validates version format
* Provides semantic versioning guidance
