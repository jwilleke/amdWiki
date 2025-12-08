# amdWiki Documentation

Welcome to the comprehensive documentation for amdWiki, a file-based wiki application built with Node.js.

## 📚 Documentation Overview

This documentation is organized into several key areas to help you understand, develop, and maintain amdWiki.

## 🏗️ Architecture & Design

### [Project Structure](architecture/PROJECT-STRUCTURE.md)

- Complete directory structure explanation
- File organization guidelines
- Development workflow documentation
- Gitignore strategy and maintenance

### [WikiDocument DOM Architecture](architecture/WikiDocument-DOM-Architecture.md)

- JSPWiki-inspired parsing architecture
- Three-phase extraction pipeline
- DOM-based JSPWiki element processing
- Production deployment and testing
- Fixes markdown heading bug (#110, #93)

### [Page Classification Architecture](architecture/ARCHITECTURE-PAGE-CLASSIFICATION.md)

- Content classification system
- File system organization strategy
- Metadata structure for pages
- Operational safety considerations

## 🚀 Development

### [Contributing Guidelines](development/CONTRIBUTING.md)

- Coding standards and best practices
- Development environment setup
- Pull request process
- Code review guidelines

### [Testing Plan](development/TESTING_PLAN.md)

- Testing strategy and approach
- Test coverage requirements
- Automated testing setup
- Quality assurance processes

## 📋 Planning & Roadmap

### [Project Roadmap](planning/ROADMAP.md)

- Long-term vision and goals
- Technical specifications
- Feature priorities and timeline
- Future development plans

### [Project Board](planning/PROJECT_BOARD.md)

- Current project status
- Active development tasks
- Sprint planning and tracking
- Issue management

### [Task Tracking](planning/todo.md)

- Detailed task breakdown
- Progress tracking
- Priority management
- Completion status

## 🔌 API Documentation

### [MarkupParser API](api/MarkupParser-API.md)

- Complete parser API reference
- Method signatures and examples
- Configuration properties
- Error handling and troubleshooting
- Performance characteristics
- Migration from legacy parser

### [Notification Enhancement](api/NOTIFICATION_ENHANCEMENT.md)

- Notification system architecture
- API endpoints and usage
- Configuration options
- Implementation details

## 🐛 Issues & Troubleshooting

### [Attachment Permission Conflicts](issues/ATTACHMENT_PERMISSION_CONFLICTS.md)

- Known permission issues
- Workarounds and solutions
- Prevention strategies

### [Digital Document Permission Status](issues/DIGITAL-DOCUMENT-PERMISSION-STATUS.md)

- Document permission tracking
- Access control issues
- Resolution procedures

### [Page Inventory](issues/PageInventory.md)

- Page management issues
- Inventory tracking problems
- Maintenance procedures

## ✨ Features

### [Page Link Autocomplete](features/PageLinkAutocomplete.md)

- Smart page suggestions in editor and search
- Keyboard navigation and shortcuts
- API endpoint documentation
- Customization and performance guide
- **Quick Reference:** [One-page cheat sheet](features/PageLinkAutocomplete-QuickReference.md)
- **Related Issue:** [#90 - TypeDown for Internal Page Links](https://github.com/jwilleke/amdWiki/issues/90)

### [Table Styles](features/TableStyles.md)

- JSPWiki-compatible table formatting
- Interactive features (sortable, filterable)
- Custom colors and themes
- Dark mode support

## 📝 Additional Resources

### [Changelog](CHANGELOG.md)

- Version history and changes
- Migration notes
- Breaking changes documentation

### [Semantic Versioning](SEMVER.md)

- Version numbering guidelines
- Release management
- Compatibility considerations

### [Content Management](Content%20Management.md)

- Content organization strategies
- Management best practices
- User content handling

## 🔄 Migration Guides

### [WikiDocument DOM Migration](migration/WikiDocument-DOM-Migration.md)

- Migration patterns for custom handlers
- Integration guide for adding custom syntax
- Common pitfalls and solutions
- Rollback plan and FAQ
- Testing your migration

## 🧪 Testing Documentation

### [Phase 5 Manual QA Plan](testing/Phase5-Manual-QA-Plan.md)

- Comprehensive manual QA test plan
- WikiDocument DOM pipeline validation
- Production readiness testing
- Acceptance criteria

### [PageManager Testing Guide](testing/testing/PageManager-Testing-Guide.md)

- PageManager testing procedures
- Test case documentation
- Validation methods

### [Test and Example Pages](testing/testing/Test%20and%20Example%20Pages.md)

- Test page examples
- Sample content for testing
- Validation scenarios

## 🔍 Quick Navigation

| Area | Purpose | Key Documents |
|------|---------|---------------|
| **Getting Started** | Basic usage and setup | [README.md](../README.md) |
| **Features** | User features and guides | [Page Link Autocomplete](features/PageLinkAutocomplete.md) |
| **Architecture** | System design and structure | [WikiDocument DOM](architecture/WikiDocument-DOM-Architecture.md), [Project Structure](architecture/PROJECT-STRUCTURE.md) |
| **Development** | Coding and contribution | [Contributing](development/CONTRIBUTING.md) |
| **Planning** | Project vision and tasks | [Roadmap](planning/ROADMAP.md) |
| **API** | Technical interfaces | [MarkupParser API](api/MarkupParser-API.md), [Notification Enhancement](api/NOTIFICATION_ENHANCEMENT.md) |
| **Migration** | Upgrading and custom handlers | [WikiDocument DOM Migration](migration/WikiDocument-DOM-Migration.md) |
| **Testing** | Test plans and procedures | [Phase 5 QA Plan](testing/Phase5-Manual-QA-Plan.md) |
| **Issues** | Problems and solutions | [Attachment Conflicts](issues/ATTACHMENT_PERMISSION_CONFLICTS.md) |

## 📖 Reading Guide

### For New Contributors

1. Start with [Contributing Guidelines](development/CONTRIBUTING.md)
2. Review [Project Structure](architecture/PROJECT-STRUCTURE.md)
3. Check [Testing Plan](development/TESTING_PLAN.md)
4. Look at current [Project Board](planning/PROJECT_BOARD.md)

### For End Users

1. Check [Features documentation](features/) for user guides
2. Start with [Page Link Autocomplete](features/PageLinkAutocomplete.md)
3. See [Table Styles](features/TableStyles.md) for formatting

### For System Administrators

1. Review [Project Structure](architecture/PROJECT-STRUCTURE.md)
2. Check [Attachment Permission Conflicts](issues/ATTACHMENT_PERMISSION_CONFLICTS.md)
3. Review [Changelog](CHANGELOG.md) for updates
4. See [Features](features/) for user-facing functionality

### For Developers

1. Study [WikiDocument DOM Architecture](architecture/WikiDocument-DOM-Architecture.md)
2. Review [MarkupParser API](api/MarkupParser-API.md)
3. Check [WikiDocument DOM Migration Guide](migration/WikiDocument-DOM-Migration.md) for custom syntax
4. Study [Architecture docs](architecture/)
5. Review [Testing documentation](testing/)
6. Review current [Issues](issues/)

### For Parser Contributors

1. Start with [WikiDocument DOM Architecture](architecture/WikiDocument-DOM-Architecture.md)
2. Review [MarkupParser API Documentation](api/MarkupParser-API.md)
3. Read [Migration Guide](migration/WikiDocument-DOM-Migration.md) for handler patterns
4. Check [Phase 5 QA Plan](testing/Phase5-Manual-QA-Plan.md) for testing approach
5. Review parser test suites in `src/parsers/__tests__/`

## 🤝 Contributing to Documentation

When adding new documentation:

1. **Choose the right location**: Use the appropriate subdirectory based on content type
2. **Follow naming conventions**: Use clear, descriptive filenames
3. **Update this index**: Add new documents to the appropriate section
4. **Use consistent formatting**: Follow existing markdown style and structure
5. **Include navigation**: Add links to related documents

## 📞 Support

- **Issues**: Report bugs and request features via GitHub Issues
- **Discussions**: Join community discussions for questions and ideas
- **Documentation**: Help improve docs by submitting pull requests

---

*This documentation is maintained alongside the codebase. Last updated: October 13, 2025*</content>
