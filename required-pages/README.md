# Startup Pages

This directory contains **startup pages** that are copied to the wiki when first initialized.

## What Are Startup Pages?

Startup pages provide a functioning wiki with essential system pages and user documentation out of the box. When you first run amdWiki with an empty `pages/` directory, these files are copied over to give you a working system immediately.

## Page Categories

### system-category: system (15 pages)
Pages required for wiki operation:
- Navigation (leftmenu, footer)
- System utilities (Recent Changes, Page Index, Search)
- Core functionality pages

### system-category: documentation (18 pages)
User-facing documentation and help pages:
- Getting started guides
- Syntax examples
- Feature documentation
- Usage instructions

## Important Notes

### For Users
- These pages are **copied once** at startup to your `pages/` directory
- After copying, they become your wiki content
- You can customize them freely
- They are tracked in your `pages/` directory (gitignored by default)

### For Developers
- Startup pages are **tracked in git** as part of the application
- Located in `required-pages/` directory
- Updated with new releases
- Developer documentation lives in `docs/developer/` (GitHub only)

## Directory Structure

```
amdWiki/
├── required-pages/         # Startup pages (this directory)
│   ├── [system pages]      # Core functionality
│   └── [documentation]     # User help
├── docs/                   # Developer documentation (GitHub)
│   ├── developer/          # Technical docs
│   └── architecture/       # Architecture guides
└── pages/                  # User wiki content (gitignored)
    └── [User pages copied from startup pages on first run]
```

## When Pages Are Updated

When amdWiki releases updates to startup pages:
- You'll be prompted about changes
- System will show a diff of what changed
- You can choose to apply updates or keep your customizations
- Your content is never automatically overwritten

## Page Protection

Pages marked with `system-category: system` should generally not be deleted, as they provide core wiki functionality. However, you can customize them as needed for your deployment.

## More Information

See [Issue #153](https://github.com/jwilleke/amdWiki/issues/153) for the architectural decisions behind this structure.
