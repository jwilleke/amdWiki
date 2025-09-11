# Contributing to amdWiki

Welcome! We appreciate your interest in contributing to amdWiki, a JSPWiki-inspired file-based wiki built with Node.js.

## 🚀 Quick Start

1. **Fork** the repository
2. **Clone** your fork: `git clone https://github.com/your-username/amdWiki.git`
3. **Install** dependencies: `npm install`
4. **Start** development server: `npm start`
5. **Test** your changes: `npm test`

## 🏗️ Architecture Overview

amdWiki follows a **manager-based architecture** inspired by JSPWiki:

- **WikiEngine** - Central orchestrator (`src/WikiEngine.js`)
- **Managers** - Modular functionality (`src/managers/`)
- **Plugins** - Extensible features (`plugins/`)
- **File-based storage** - Pages as Markdown files (`pages/`)

📖 **Read `.github/copilot-instructions.md`** for detailed architecture patterns.

## 🔧 Development Guidelines

### Code Style
- Use **CommonJS** modules (`require/module.exports`)
- Follow **existing patterns** in manager creation and route handling
- **ESLint** and **Prettier** compliance (if configured)
- Use **meaningful variable names** and JSDoc comments

### Manager Development Pattern
```javascript
// All managers extend BaseManager
class NewManager extends BaseManager {
  constructor(engine) {
    super(engine);
  }
  
  async initialize(config = {}) {
    await super.initialize(config);
    // Manager-specific initialization
  }
}
```

### Plugin Development Pattern
```javascript
const PluginName = {
  name: 'PluginName',
  execute(context, params) {
    const engine = context.engine;
    const manager = engine.getManager('ManagerName');
    return 'HTML output';
  }
};
```

## 🧪 Testing

- **Run tests**: `npm test`
- **Coverage**: `npm run test:coverage`
- **Watch mode**: `npm run test:watch`
- **Test location**: `src/managers/__tests__/`

### Test Requirements
- **Unit tests for new managers** (extending BaseManager pattern)
- **Integration tests** for route handlers and cross-component functionality
- **Plugin functionality tests** for JSPWiki-style plugin syntax
- **Use mocks instead of real file operations** - critical requirement (see CHANGELOG.md)
- **Mock fs-extra completely** using in-memory Map-based file systems
- **Mock gray-matter** for YAML frontmatter parsing
- **Maintain >80% coverage** for critical managers (>90% for PageManager, UserManager, ACLManager)
- **Use testUtils.js** for common mock objects and test utilities

## 📝 Page Development

### Frontmatter Structure
All pages require YAML frontmatter:
```yaml
---
title: Page Name
category: General
user-keywords: []
uuid: auto-generated-uuid
lastModified: ISO-date-string
---
```

### JSPWiki Syntax Support
- **Links**: `[PageName]` or `[Link Text|PageName]`
- **User variables**: `[{$username}]`, `[{$loginstatus}]`
- **Plugins**: `[{PluginName param='value'}]`

## 🔀 Pull Request Process

### Before Submitting
1. **Create feature branch**: `git checkout -b feature/your-feature-name`
2. **Follow coding patterns** from existing codebase
3. **Add tests** for new functionality
4. **Update documentation** if needed
5. **Run full test suite**: `npm test`

### PR Requirements
- **Descriptive title** and detailed description
- **Reference issues** using `#issue-number`
- **Include tests** for new features
- **Update CHANGELOG.md** for user-facing changes
- **Follow semantic commit messages**: `feat:`, `fix:`, `chore:`

### Review Criteria
- Follows manager-based architecture patterns
- Includes appropriate tests
- Maintains backward compatibility
- Follows JSPWiki conventions where applicable

## 🏷️ Version Management

We use **Semantic Versioning** (SemVer):

```bash
npm run version:patch    # Bug fixes (1.2.0 → 1.2.1)
npm run version:minor    # New features (1.2.0 → 1.3.0)  
npm run version:major    # Breaking changes (1.2.0 → 2.0.0)
```

## 🐛 Issue Reporting

### Bug Reports
- Use clear, descriptive titles
- Include steps to reproduce
- Specify Node.js version and OS
- Include error messages and logs

### Feature Requests
- Explain the use case and benefit
- Consider JSPWiki compatibility
- Discuss impact on existing functionality

## 🎯 Areas for Contribution

### High Priority
- **User Authentication** improvements
- **Page History & Versioning** features
- **Advanced Search** enhancements
- **Plugin Development**

### Good First Issues
- Documentation improvements
- New wiki plugins
- UI/UX enhancements
- Test coverage expansion

## 💬 Getting Help

- **GitHub Issues** - Bug reports and feature requests
- **GitHub Discussions** - Questions and general discussion
- **Code Review** - Submit draft PRs for early feedback

## 📜 License

By contributing, you agree that your contributions will be licensed under the same license as the project.

---

Thank you for contributing to amdWiki! 🚀
