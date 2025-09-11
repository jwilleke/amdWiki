---
alwaysApply: true
---

When working on the Continue extension project:
1. Use TypeScript throughout the codebase with proper type annotations
2. Follow the messaging architecture: core <-> extension <-> gui
3. Add new protocol messages to the appropriate file in core/protocol when needed
4. Maintain separation of concerns: core for business logic, extension for VS Code integration, gui for UI
5. Use React with Redux Toolkit for GUI state management
6. Ensure any new features work with the configuration system (config.json/config.yaml)
7. Write code that is IDE-agnostic in the core, VS Code-specific in the extension
8. Follow existing patterns for message passing between components
9. Test changes thoroughly across the three-component architecture
10. Maintain backward compatibility with existing configurations when possible