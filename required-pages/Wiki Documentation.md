---
title: Wiki Documentation
categories: [System, Documentation]
user-keywords: []
uuid: 9e4cc61d-be63-41b2-b0e8-982fff52dc15
lastModified: '2025-09-09T09:30:00.000Z'
---
# Wiki Documentation Summary

[{$pagename}] - Comprehensive guide to all documentation and resources in amdWiki

This page serves as the central hub for all documentation, tutorials, guides, examples, and test pages in the amdWiki system.

---

## 📚 Core System Documentation

### Authentication & Security
* **[Authentication States Implementation]** - Technical documentation for user authentication states (Anonymous, Asserted, Authenticated)
* **[Access Control Lists]** - Page-level access control using JSPWiki-style ACLs  
* **[Password Management]** - User account and password management system
* **[Roles]** - Complete documentation of user roles and permissions

### Plugin System & Variables
* **[Plugin System Documentation]** - Complete guide to JSPWiki-compatible plugin system
* **[System Variables]** - Documentation of system variables and their usage
* **[Plugin Test]** - Live demonstration of all plugins and system variables

### Search & Navigation
* **[Search Documentation]** - Comprehensive guide to search functionality with advanced filtering
* **[PageIndex]** - Complete alphabetical listing of all wiki pages

### System Information
* **[SystemInfo]** - System status, configuration, and diagnostic information
* **[Project Overview and Vision]** - High-level project goals and architecture
* **[Project Tasks and TODO]** - Current development tasks and future plans

---

## 🎨 Table System Documentation

### Table Functionality
* **[JSPWiki Table Functionality]** - Complete documentation of JSPWiki-style table features
* **[Table Examples]** - Comprehensive examples of different table formatting options

### Table Testing Pages
* **[Simple Table Test]** - Basic table functionality tests
* **[Simple Row Test]** - Row styling and numbering tests  
* **[Row Styling Test]** - Advanced row styling and formatting tests

---

## 🧪 Test & Example Pages

### System Tests
* **[System Variables Test]** - Live testing of system variables
* **[User Variables Test]** - User-related variable testing
* **[ACL Test Page]** - Access control testing page

### Feature Tests
* **[Plugin Escaping Test]** - Plugin syntax escaping tests
* **[Red Link Test]** - Wiki link functionality tests
* **[Extended Link Test]** - Advanced linking features
* **[Pipe Link Test]** - Pipe syntax link tests
* **[Pipe Test Simple]** - Basic pipe syntax tests
* **[Target Blank Test]** - External link behavior tests

### Template Tests
* **[Test-No Template]** - Testing pages without templates
* **[Test-new-page]** - New page creation testing

---

## 📝 Content Management

### Categories & Keywords
* **[Categories]** - Category system documentation
* **[System Keywords]** - System-level keyword management
* **[User Keywords]** - User keyword management
* **[Metadata Cleanup Progress]** - Metadata standardization progress

### Templates & Styling
* **[Footer]** - Wiki footer configuration
* **[LeftMenu]** - Navigation menu configuration
* **[Welcome]** - Default welcome page content

---

## 🔧 User Testing Pages

### Live Examples in Pages Directory
* **[User States Test]** *(in pages/)* - Live demonstration of authentication states
* **[JSPWiki Row Styling Implementation]** *(in pages/)* - Implementation examples
* **[Fourth Test Page]**, **[Test-5]**, **[Test-6]**, **[Test-8]** *(in pages/)* - Various functionality tests
* **[Third Page]**, **[Jims]**, **[Jims2]** *(in pages/)* - User-created content examples

---

## 💡 Quick Reference

### Essential Syntax

```markdown
# System Variables
[{$pagename}]       - Current page name
[{$totalpages}]     - Total pages count
[{$uptime}]         - Server uptime
[{$timestamp}]      - Current timestamp

# Wiki Links
[Page Name]         - Link to another page
[Link Text|Page Name] - Link with custom text

# Plugins
[{ReferringPagesPlugin page="PageName"}] - Pages that reference given page
[{SessionsPlugin}]  - Active sessions count
[{TotalPagesPlugin}] - Total pages (plugin version)

# Table Styling
%%table-striped     - Striped table styling
%%                  - (table content)
/%                  - End table

[{Table style:'...' headerStyle:'...' evenRowStyle:'...'}]
|| Header ||        - Table header row
| Data |            - Table data row
|# |                - Auto-numbered row
```

### Navigation Tips
* **Browse by Category**: Use [Categories] page to find related content
* **Search Everything**: Use [Search Documentation] for advanced search features
* **Find All Pages**: Check [PageIndex] for complete page listing
* **System Status**: Visit [SystemInfo] for system diagnostics

---

## 📊 Statistics

* **Total Pages**: [{$totalpages}]
* **Documentation Pages**: 15+ comprehensive guides
* **Test Pages**: 20+ functional tests and examples
* **System Uptime**: [{$uptime}]
* **Last Updated**: [{$timestamp}]

---

## 🔗 Related Resources

For more information, see:
[{ReferringPagesPlugin before='* ' after='\n' }]

---

*This documentation index is maintained to provide easy access to all wiki resources. For the most current information, visit individual pages directly.*
