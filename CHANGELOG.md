# Changelog

All notable changes to amdWiki are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

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
