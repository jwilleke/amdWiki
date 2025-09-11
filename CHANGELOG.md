# Changelog

All notable changes to amdWiki are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]
# Changelog

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Removed
- **PageManager.legacy.js**: Removed legacy PageManager implementation to eliminate conflicting page management systems

### Improved
- **Test isolation**: Implemented comprehensive mock-based testing for PageManager
  - Complete fs-extra mocking for better test isolation
  - In-memory mock file system using Map for predictable test behavior
  - gray-matter mocking for YAML frontmatter parsing
  - 10-100x faster test execution with no real file I/O operations
  - Better error simulation and edge case testing

### Added
- **Testing documentation**: New PageManager Testing Guide (`docs/testing/PageManager-Testing-Guide.md`)
- **Updated contributing guidelines**: Enhanced testing best practices and mock-based testing approach

### Technical
- All PageManager tests now use mocks instead of real file operations
- Improved test reliability and CI/CD compatibility
- Enhanced error handling test coverage
- Better cache consistency testing

## [1.3.1] - Previous Release
...
### Planned
- Future enhancements

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

### Planned

- Future enhancements

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

## [Unreleased]

### Planned

- Unit test implementation
- Performance optimization for large page sets
- Mobile UI enhancements
- Export/import functionality

### Added (Since 1.2.0)

- **JSPWiki-Style Action Buttons**: Implemented authentic JSPWiki navigation with Info, Edit, and More dropdowns
  - **Info Dropdown**: Page Information modal, Page History, Page Statistics, Recent Changes
  - **Edit Button**: Direct edit access with permission checking
  - **More Dropdown**: View Page Source, Show Reader View, Export, System Variables, Search Help
- **Page Source Dialog**: Professional modal for viewing and copying raw markdown content
  - One-click copy to clipboard with visual feedback
  - Syntax highlighting and scrollable content
  - Responsive design for mobile devices
- **Reader View**: Distraction-free reading experience
  - Clean typography-focused design
  - Floating action buttons (Exit, Print, Copy Content)
  - Keyboard shortcuts (Escape to exit, Ctrl/Cmd+P to print)
  - Mobile-responsive layout
- **Create User Modal**: Professional user creation interface for admin panel
  - Complete form validation (password matching, role selection)
  - Bootstrap 5 modal with responsive design
  - Success/error message handling
- **Edit User Modal**: Complete user editing functionality for admin panel
  - Pre-populated form with current user data
  - Role management with checkbox interface
  - Optional password updating (leave blank to keep current)
  - User status toggle (active/inactive)
  - Form validation and AJAX submission
- **Improved Access Control System**: Enhanced page access control with sensible defaults
  - Default read access for all regular pages (including anonymous users)
  - Restricted access only for system/admin pages
  - Edit button visibility based on actual user permissions
  - Proper role-based permission checking for all actions
- **JSPWiki-Style Table Support**: Complete table rendering system with advanced styling
  - Enhanced Showdown markdown converter with table support
  - JSPWiki Table plugin syntax: `[{Table param:value}]`
  - Advanced styling parameters: style, dataStyle, headerStyle, evenRowStyle, oddRowStyle
  - Row numbering support with configurable start value
  - Automatic conversion of JSPWiki table syntax to styled HTML tables
- **Dynamic Markdown Footer**: Footer content now loaded from editable `Footer.md` page
- **Version System Variables**: Added `[{$version}]` and `[{$year}]` system variables
- **Footer Styling**: Professional footer styling with responsive design
- **Version Management**: Automatic version display in footer from package.json

### Changed (Since 1.2.0)

- **Bootstrap 5 Migration**: Complete migration from Bootstrap 4 to Bootstrap 5
  - Updated all dropdown toggles (`data-toggle` → `data-bs-toggle`)
  - Migrated badge classes (`badge-*` → `bg-*`)
  - Updated margin/padding classes (`ml-*` → `ms-*`)
  - Modernized modal and form components
- **Navigation Structure**: Simplified and cleaned navigation
  - Removed redundant navigation pills (News, WikiEtiquette, Find pages, About this Wiki, Create)
  - Context-aware action buttons (only show on relevant pages)
  - Minimalist design focusing on page-specific actions

### Fixed

- **Bootstrap 5 Migration Issues**: Resolved all compatibility problems from Bootstrap 4 to 5 upgrade
  - Fixed admin dropdown menu not working (data-toggle → data-bs-toggle)
  - Updated badge classes (badge-secondary → badge-secondary bg-secondary)
  - Corrected margin classes (mr-2 → me-2)
  - Fixed modal initialization and event handling
- **Admin Panel Functionality**: Restored complete admin user management
  - Fixed non-functional "Create User" button
  - Restored modal form validation and submission
  - Fixed success/error message display system
  - Fixed async/await bug in adminCreateUser method causing "Access denied" errors
  - Fixed user creation parameter mismatch causing users to be created with undefined usernames
  - Fixed async/await bug in adminUpdateUser method for proper permission checking
  - Fixed invalid "user" role in user creation forms - replaced with proper system roles (reader, contributor, editor, admin)
- **Access Control System**: Fixed overly restrictive page access
  - Regular pages now readable by all users (including anonymous) by default
  - System/admin pages properly restricted to authorized users only
  - Edit button visibility now based on actual user permissions instead of hardcoded values
- **Navigation Dropdown Issues**: Resolved all dropdown menu problems
  - Fixed Info, Edit, and More dropdown menus not opening
  - Corrected Bootstrap 5 dropdown toggle attributes
  - Ensured proper JavaScript event binding

### Changed

- **JSPWiki-Style Navigation**: Completely redesigned navbar to match Apache JSPWiki layout
  - Two-tier navigation with header bar and tab navigation
  - Prominent search bar in header center
  - Cleaner tab-based navigation (Home, Find, Create, Tools)
  - Improved sidebar with page icons and better organization
- **Simplified Page Headers**: Removed complex flexbox wrapper divs for cleaner, simpler page layouts
- **Footer Content**: Cleaned up footer to show only essential information without explanatory text
- **Documentation**: Streamlined System Variables documentation
- **Page Layout**: Removed "Page Information" metadata section from page view for cleaner appearance

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

- **1.2.0** (Current): Major feature additions (JSPWiki-style search, enhanced authentication, UI improvements)
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

*This changelog covers the major enhancements implemented on September 7, 2025. For detailed technical documentation, see the Search Documentation page within the wiki.*
