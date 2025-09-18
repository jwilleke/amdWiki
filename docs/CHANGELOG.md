# Changelog

All notable changes to amdWiki are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/) [CHANGELOG.md]
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- **JSPWiki-Compatible VariableManager System**: Complete variable management system similar to JSPWiki's DefaultVariableManager
  - **VariableManager**: New manager with 18 system variables and 4 contextual variables
  - **Variable Registry**: Function-based registry system for dynamic value generation
  - **Admin Variables Interface**: Complete variable browser, testing, and debugging interface
  - **System Variables**: Application info, configuration, runtime data, and plugin variables
  - **Contextual Variables**: User authentication state and page context variables
  - **Variable Protection**: Safeguards for escaped variables and code blocks during expansion
  - **Live Testing**: Real-time variable expansion testing in admin interface
  - **Custom Registration**: Plugin API for registering custom variables
  - **JSPWiki Compatibility**: Maintains JSPWiki variable patterns and naming conventions

- **JSPWiki-Compatible Configuration Management System**: Complete configuration system with property merging
  - **ConfigurationManager**: New manager handling app-default-config.json and app-custom-config.json
  - **Property Merging**: Two-tier configuration with defaults and custom overrides
  - **Admin Configuration Interface**: Full web-based configuration management with validation
  - **Server Configuration**: Configurable port, host, session settings, and base URLs
  - **Runtime Updates**: Live configuration updates without server restart via admin interface
  - **Property Validation**: Ensures proper amdwiki.* and log4j.* property naming
  - **Configuration Export**: View and manage all configuration properties
  - **JSPWiki Compatibility**: Property naming and structure matches JSPWiki patterns
  - **Security Integration**: Proper session and security configuration management
- **Comprehensive Audit Trail System**: Complete security monitoring and access logging implementation
  - **AuditManager**: New manager for comprehensive audit logging with configurable retention policies
  - **Admin Audit Interface**: Full-featured audit log viewer with filtering, pagination, and export capabilities
  - **Security Monitoring**: Real-time access control decision logging with detailed context information
  - **Audit Configuration**: JSON-based configuration system for audit policies and monitoring settings
  - **Export Functionality**: JSON and CSV export options for audit logs with date range filtering
  - **API Endpoints**: RESTful API for audit log retrieval and management
  - **Policy Integration**: Seamless integration with PolicyEvaluator for access decision logging
  - **Performance Optimized**: Efficient in-memory caching with periodic file flushing
  - **Admin Dashboard**: Statistics and monitoring dashboard for security oversight

### Security
- **Enhanced Security Monitoring**: Comprehensive access control decision logging
- **Audit Trail Compliance**: Full audit trail for security compliance and monitoring
- **Access Pattern Analysis**: Detailed logging of user actions and system access patterns
- **Security Incident Detection**: Framework for detecting and logging security incidents

### Testing
- **Comprehensive Route Testing Framework**: Major advancement in test coverage and reliability
  - **45-route test suite**: Complete coverage of all amdWiki HTTP endpoints with authentication and security testing
  - **CSRF Protection Validation**: Full CSRF token validation testing with security middleware verification
  - **Mock Engine Architecture**: Comprehensive mocking system for all WikiEngine managers and dependencies
  - **Security Testing**: Authentication, authorization, and access control validation across all routes
  - **Admin Route Coverage**: Complete testing of administrative functions (user management, roles, notifications)
  - **Template Rendering Tests**: EJS template rendering validation with proper data injection
  - **Form Validation Testing**: POST request validation with proper error handling and redirects
  - **Test Infrastructure**: Jest + Supertest integration with comprehensive mock setup and cleanup
  - **Current Status**: 34/45 tests passing (76% success rate) with core functionality fully operational
  - **Security Compliance**: All critical security features (CSRF, authentication, authorization) validated
  - **ACLManager**: Improved test coverage from 55.84% to 70.99% (52 comprehensive tests)
    - Enhanced ACL parsing and user permissions validation
    - Maintenance mode and audit logging test coverage
    - Category-based access control testing
    - Issue #22 security features validation
  - **UserManager**: Expanded test suite from 10 to 19 tests, coverage from 24.82% to 48.42%
    - Authentication and authorization flow testing
    - User CRUD operations validation
    - Session management and role-based permissions
    - Password handling and external user integration
  - **PageManager**: Improved test coverage from 61.63% to 65.09% (26/26 tests passing)
    - Fixed metadata flattening for categories and user-keywords
    - Enhanced savePage method with proper success status returns
    - Improved isRequiredPage method for category-based detection
    - Template creation and error handling validation
    - UUID generation and timestamp updating tests
- **Test Suite Reliability**: Enhanced test infrastructure and mocking patterns
  - Consistent mock engine setup across all manager tests
  - Improved error handling and filesystem operation testing
  - Better cache consistency and lookup validation
  - Comprehensive validation of manager integration points

### Removed
- In-memory mock file system using Map for predictable test behavior
- gray-matter mocking for YAML frontmatter parsing
- **Testing documentation**: New PageManager Testing Guide (`docs/testing/PageManager-Testing-Guide.md`)
- **Updated contributing guidelines**: Enhanced testing best practices and mock-based testing approach

### Technical
- All PageManager tests now use mocks instead of real file operations
- Improved test reliability and CI/CD compatibility
- Enhanced error handling test coverage
- Better cache consistency testing
- **Documentation Updates**: Updated CHANGELOG.md and TESTING_PLAN.md with comprehensive route testing status and achievements

### Planned
- Unit test implementation
- Performance optimization for large page sets
- Mobile UI enhancements
- Export/import functionality
- See [ROADMAP.md](ROADMAP.md) for detailed future plans

## [1.3.1] - 2025-09-10

### Added

- **Dark Mode Theme System**: Comprehensive dark mode implementation with system preference detection
  - **CSS Variables**: Complete theming system with light/dark color schemes for all components
  - **System preference detection**: Automatically follows OS dark mode setting via media queries
  - **Theme toggle button**: Floating button for instant theme switching (light/dark/system)
  - **User preference integration**: Theme choice saved in user profile preferences
  - **Bootstrap compatibility**: All Bootstrap components styled for dark mode support
  - **Smooth transitions**: CSS transitions for seamless theme switching experience
  - **Theme manager**: JavaScript class for programmatic theme control and state management
- **JSPWiki WikiVariables System**: Comprehensive variable expansion support for dynamic content
  - **User context variables**: [{$username}] and [{$loginstatus}] display current user state
  - **System variables**: [{$totalpages}] shows total page count dynamically
  - **Authentication awareness**: Variables reflect logged-in vs anonymous user states
  - **RenderingManager integration**: Seamless variable expansion in page content
- **User Preferences System**: Complete JSPWiki-style user preference management
  - **Profile page**: Comprehensive user profile with account info, permissions, and preferences
  - **Editor preferences**: Smart typing pairs, auto-indent, line numbers, and theme selection
  - **Display preferences**: Page size, tooltips, reader mode, date format, and site theme options
  - **Smart typing pairs**: Auto-pairing of brackets, quotes, and other characters
  - **Real-time application**: Preferences applied immediately via client-side library
  - **Persistent storage**: All settings saved to user profile and loaded correctly
  - **Form state management**: Fixed checkbox and dropdown state persistence after saves
- **User Keywords Dropdown Interface**: Enhanced Create New Page form with professional dropdown
  - **Checkbox dropdown**: Replaced individual checkboxes with clean Bootstrap dropdown interface
  - **3-keyword limit enforcement**: Auto-disable functionality when maximum selections reached
  - **Visual feedback**: Button color changes, disabled states, and smooth transitions
  - **Dynamic loading**: Keywords populated from User Keywords.md file content
  - **Responsive design**: Works seamlessly on desktop and mobile devices
- **Edit Page Authentication & Interface**: Comprehensive security and UX improvements for editing
  - **Authentication protection**: `/edit` route now requires login and proper permissions
  - **Permission enforcement**: Users must have `page:edit` permission to access
  - **Page selection interface**: Professional page browser with search functionality
  - **Live search filtering**: Real-time page list filtering with visual feedback
  - **Proper redirects**: Seamless login flow with return-to-page functionality
- **Authentication System Fixes**: Resolved redirect loop issues and improved session handling
  - **Session consistency**: Fixed mismatch between session creation and validation methods
  - **Cookie configuration**: Enhanced cookie settings with proper path and SameSite attributes
  - **Permission updates**: Updated user roles to ensure proper page creation access
  - **Debug logging**: Added comprehensive debugging for authentication troubleshooting
- **Markdownlint Configuration**: Added `.markdownlint.json` to disable MD025 rule
  - **Multiple H1 headings support**: Allows frontmatter `title` and `# Overview` in same document
  - **Document structure flexibility**: Maintains other linting rules while accommodating wiki page format
- **Create New Page Menu Item**: Added "Create New Page" option to More dropdown
  - **Role-based visibility**: Only visible to Admin, Editor, and Contributor roles
  - **Quick access**: Provides easy access to page creation from any page
  - **Proper permissions**: Links to existing `/create` route with permission checks
- **Metadata Standardization**: Comprehensive cleanup of page metadata
  - **System foundation files**: Created System Keywords.md and User Keywords.md in required-pages
  - **Missing metadata fixed**: Added proper metadata to all table test files and system pages
  - **Consistent format**: Standardized all pages to use `categories: []` and `user-keywords: []` format
  - **Duplicate resolution**: Consolidated User-Keywords.md into required-pages structure

### Fixed

- **User preference form state**: Fixed issue where saved preferences weren't reflected in form controls
  - **Cached user data**: Profile page now fetches fresh user data from database instead of session cache
  - **Checkbox persistence**: Form checkboxes correctly show checked/unchecked state after saves
  - **Select persistence**: Dropdown selections properly reflect saved preference values
  - **Form reload accuracy**: All preference form fields now accurately display current user settings
- **Route ordering issue**: Fixed critical bug preventing Create New Page form from loading dynamic content
  - **Wildcard route conflict**: Moved `/create` before `/wiki/:page` to prevent interception
  - **Dynamic form population**: Categories and keywords now properly load from required-pages files
  - **Authentication redirects**: Resolved infinite redirect loops on login
- **Anonymous access vulnerability**: Secured Create New Page functionality
  - **Authentication required**: Anonymous users redirected to login page
  - **Permission validation**: Users without `page:create` permission get proper error messages
  - **Security enforcement**: Both GET and POST routes for page creation now protected
- **Edit route accessibility**: Fixed "Cannot GET /edit" error
  - **Missing route handler**: Added `/edit` route with authentication protection
  - **User experience**: Anonymous users get proper redirect instead of 404 error
  - **Permission checks**: Same security model as create page functionality
- **App startup issue**: Fixed broken require path for logger after project reorganization
  - **Updated path**: Changed `require('./logger')` to `require('./src/utils/logger')`
  - **Clean startup**: App now starts without module not found errors

### Security

- **Authentication system hardening**: Multiple security improvements across the application
  - **Route protection**: All page creation and editing routes now require authentication
  - **Permission enforcement**: Role-based access control properly implemented
  - **Session security**: Enhanced cookie configuration and session management
  - **Redirect safety**: Proper redirect parameter handling to prevent attacks

## [1.3.0] - 2025-09-08

### Added
- **JSPWiki Table Functionality**: Complete implementation of JSPWiki-style table rendering
  - **`%%table-striped` syntax**: Bootstrap-compatible striped tables with theme-aware styling
  - **`[{Table}]` plugin syntax**: Advanced table styling with comprehensive parameter support
  - **Row styling parameters**: `evenRowStyle`, `oddRowStyle`, `headerStyle`, `dataStyle`, `style`
  - **Automatic row numbering**: `|#` syntax with customizable starting numbers via `rowNumber` parameter
  - **Theme integration**: Seamless Bootstrap 5 compatibility with CSS custom properties
- **Project Structure Reorganization**: Complete restructuring for better maintainability
  - **Cleaned root directory**: Only essential files (app.js, README.md, package.json, etc.)
  - **Organized code structure**: Moved JS files to `src/` subdirectories (legacy/, tests/, utils/)
  - **System documentation**: Consolidated development docs in `required-pages/`
  - **Category system**: Implemented `categories: [System, Documentation, Test]` metadata structure
- **Enhanced .gitignore**: Improved user content exclusion patterns
  - **VS Code compatibility**: Fixed patterns for proper IDE integration
  - **User content isolation**: Pages, users, attachments, logs properly excluded from git
- **Documentation Consolidation**: Combined and organized project documentation
  - **Project Tasks and TODO**: Merged Tasks.md and todo.md with prioritization
  - **Project Overview and Vision**: Consolidated project goals and technical architecture
  - **JSPWiki Table Documentation**: Comprehensive usage examples and implementation details

### Changed
- **Category system**: Replaced single `category` with array-based `categories` for better organization
- **File organization**: Moved utility files (logger.js, version.js) to `src/utils/`
- **Test organization**: Moved test files to `src/tests/`
- **Legacy code**: Moved old app versions to `src/legacy/`

### Fixed
- **Git ignore patterns**: Resolved VS Code showing user content as untracked files
- **Table rendering**: Complete JSPWiki TablePlugin compatibility with all styling parameters
- **Project structure**: Clean separation between system files and user content

## [1.2.0] - 2025-09-07

**Version Type**: MINOR - New features with backward compatibility

This release transforms the basic wiki into a JSPWiki-style system with advanced search capabilities, enhanced authentication, and modern UI components while maintaining full backward compatibility.

### Added

#### Advanced Search System

- **JSPWiki-style Search Interface**: Complete overhaul of search functionality with professional UI
- **Multi-Select Search Filters**: Checkbox-based interface for categories, keywords, and search fields
- **Advanced Search Methods**: New SearchManager methods for complex multi-criteria searches
  - `searchByCategories()` - Search across multiple categories simultaneously
  - `searchByUserKeywordsList()` - Filter by multiple user keywords
  - Enhanced `advancedSearch()` with array support for all parameters
- **Enhanced Search Indexing**: Improved Lunr.js index with metadata field boosting
  - Categories: 8x boost (highest priority)
  - User Keywords: 6x boost
  - Tags: 5x boost
  - Keywords: 4x boost
  - Content: 1x boost (baseline)

#### Search Interface Improvements

- **Professional Search Page Layout**: Cards, shadows, and hover effects for modern appearance
- **Expandable Browse Sections**: "Show more" functionality for categories and keywords
- **Search Statistics Sidebar**: Real-time statistics and search tips
- **Multi-Criteria Result Display**: Enhanced result presentation with metadata badges
- **Search Documentation Integration**: Direct link to comprehensive search help

#### Search Page Features

- **Empty Search State**: Attractive landing page with category/keyword browsing
- **Search Options Panel**: Collapsible advanced search controls
- **Real-time Search**: Auto-submit on filter changes
- **Result Snippets**: Content previews with relevance scoring
- **Search Tips**: Built-in help for advanced search syntax

### Enhanced

#### Authentication & User Management

- **Three-State Authentication System**: Proper distinction between user states
  - Anonymous: No session cookie present
  - Asserted: Has session cookie but expired/invalid
  - Authenticated: Valid session with active authentication
- **Improved User State Handling**: Better user context management throughout the system

#### Link System Improvements

- **Red Link Implementation**: Visual indication of non-existent pages
  - Red styling for links to pages that don't exist
  - Blue styling for existing page links
  - Automatic detection and styling updates
- **Pipe Link Syntax**: JSPWiki-style link syntax with target attributes
  - `[Link Text|Page Name]` syntax support
  - `[Link Text|Page Name|_blank]` for new window/tab opening
  - Backward compatibility with simple `[Page Name]` syntax

#### Navigation & UI

- **Home Page Redirect**: Automatic redirect from root to Welcome page
- **Search Navigation**: Prominent search link in main navigation
- **Improved Header**: Better organization of navigation elements

#### Template System

- **Search Results Template**: Complete redesign with modern Bootstrap components
- **Enhanced Form Controls**: Better visual hierarchy and user experience
- **Responsive Design**: Mobile-friendly search interface

### Fixed

#### Critical Bug Fixes

- **ACL Manager Type Safety**: Fixed `TypeError: content.replace is not a function`
  - Enhanced `removeACLMarkup()` method with proper null/type checking
  - Added safety checks in edit route for non-existent pages
  - Graceful handling of undefined/null content
- **Search Route Robustness**: Improved error handling in search functionality
- **Page Creation**: Fixed issues with editing non-existent pages

#### Security & Stability

- **Input Validation**: Enhanced parameter validation in search routes
- **Type Checking**: Robust type validation throughout ACL processing
- **Error Prevention**: Multiple layers of protection against runtime errors

### Changed

#### Search System Overhaul

- **Search Interface**: Complete redesign from dropdown-based to checkbox-based filters
- **Search Logic**: Enhanced multi-criteria search with improved relevance scoring
- **Search Routes**: Updated to handle array parameters for multi-select functionality
- **Search Templates**: Professional redesign with modern UI components

#### User Experience Improvements

- **Form Labels**: Changed from "Category" to "Include Categories", "User Keywords" to "Include User Keywords"
- **Layout Organization**: Better use of grid system for responsive design
- **Visual Hierarchy**: Improved contrast, spacing, and typography
- **Interactive Elements**: Hover effects, animations, and smooth transitions

#### Documentation

- **Search Documentation Page**: Comprehensive guide to search functionality
  - Basic and advanced search instructions
  - Search syntax examples and best practices
  - Troubleshooting guide and tips
  - Page organization guidelines

### Technical Improvements

#### Backend Enhancements

- **SearchManager**: Significant expansion with new methods and capabilities
- **WikiRoutes**: Enhanced search route with multi-parameter support
- **ACLManager**: Improved robustness and error handling
- **Type Safety**: Enhanced validation throughout the system

#### Frontend Enhancements

- **CSS Improvements**: New styling for search components and interactions
- **JavaScript Functionality**: Enhanced form handling and UI interactions
- **Template System**: Modernized EJS templates with better organization

#### Performance

- **Search Indexing**: Optimized document indexing with metadata extraction
- **Result Processing**: Efficient handling of multi-criteria searches
- **Memory Management**: Better handling of search results and filtering

## [1.1.0] - 2025-08-01

**Version Type**: MINOR - Feature additions

### Features Added

- Basic wiki functionality with markdown support
- User authentication system
- Page management and editing
- Basic search functionality
- Template system
- Plugin architecture

## [1.0.0] - 2025-07-01

**Version Type**: MAJOR - Initial release

### Initial Implementation

- Initial wiki implementation
- File-based page storage
- Basic navigation
- User management foundation

---

## Semantic Versioning Guide

This project follows [Semantic Versioning](https://semver.org/) (SemVer):

### Version Format: MAJOR.MINOR.PATCH

- **MAJOR** version increments for incompatible API changes
- **MINOR** version increments for backward-compatible functionality additions  
- **PATCH** version increments for backward-compatible bug fixes

### Version History Summary

- **1.3.1** (Latest): Dark mode, user preferences, authentication fixes, and UI enhancements
- **1.3.0**: JSPWiki table functionality, project reorganization, and documentation consolidation
- **1.2.0**: Advanced search system, JSPWiki-style UI, and authentication improvements
- **1.1.0**: Basic feature set with authentication and templates
- **1.0.0**: Initial release with core wiki functionality

---

## Development Notes

### Search System Architecture

The search system now provides JSPWiki-level functionality with:

- Full-text search across content, titles, and metadata
- Category-based organization and filtering
- User keyword tagging system
- Advanced multi-criteria search capabilities
- Professional user interface with modern design patterns

### Authentication System

Enhanced three-state authentication provides:

- Better user experience with proper state management
- Improved security with clear permission boundaries
- Flexible access control based on authentication state

### Link System

JSPWiki-compatible link system with:

- Visual distinction between existing and non-existent pages
- Advanced link syntax with target control
- Backward compatibility with existing content

### Technical Debt Addressed

- Fixed critical type safety issues in ACL processing
- Improved error handling throughout the application
- Enhanced input validation and parameter processing
- Better separation of concerns in search functionality

---

## Migration Notes

### For Existing Users

- All existing search URLs continue to work (backward compatibility maintained)
- Page links are automatically enhanced with red/blue styling
- Search functionality is significantly improved without breaking changes

### For Developers

- New SearchManager methods are available for custom implementations
- Enhanced ACL processing with better error handling
- Improved template system for custom UI development

---

*This changelog covers the major enhancements implemented on September 7, 2025. For detailed technical documentation, see the Search Documentation page within the wiki or check [docs/](docs/) folder.*
