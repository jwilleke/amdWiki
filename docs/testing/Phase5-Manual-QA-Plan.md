# Phase 5 - Manual QA Test Plan

**Related Issue:** #119 - Comprehensive Testing
**Part of:** #114 - WikiDocument DOM Solution
**Date:** 2025-10-13
**Test Phase:** Pre-Production Integration

## Overview

This manual QA plan validates the WikiDocument DOM extraction pipeline (Phases 1-4) before production deployment. All automated tests have passed (150+ tests), and this plan covers real-world usage scenarios.

## Test Environment Setup

### Requirements

- amdWiki server running (`npm start`)
- Test user account with appropriate permissions
- Browser: Chrome/Firefox/Safari (latest versions)
- Developer console open for error monitoring
- Server logs visible (`pm2 logs` or console)

### Test Data

Create the following test pages for manual validation:

1. **TestPage_Markdown** - Pure markdown content
2. **TestPage_JSPWiki** - Pure JSPWiki syntax
3. **TestPage_Mixed** - Combined markdown and JSPWiki
4. **TestPage_Complex** - Real-world page with all features

## Manual QA Checklist

### 1. Homepage Testing

**Page:** HomePage

- [ ] Page loads without errors
- [ ] Check browser console for JavaScript errors
- [ ] Check server logs for parsing warnings
- [ ] Variables render correctly (if any)
- [ ] Links work correctly
- [ ] No placeholder text visible (`<!--JSPWIKI-` or `__JSPWIKI_`)

**Expected:** Clean render, no console errors

---

### 2. LeftMenu Testing

**Page:** LeftMenu

- [ ] Menu renders correctly
- [ ] All navigation links work
- [ ] No markdown heading bugs (## should be <h2>, not list items)
- [ ] Wiki links styled correctly
- [ ] Red links (non-existent pages) styled in red

**Expected:** Proper navigation menu with correct styling

---

### 3. TableOfContents Plugin

**Test Page:** TestPage_TOC

**Content:**
```markdown
# Welcome

[{TableOfContents}]

## Section 1

Content here

### Subsection 1.1

More content

## Section 2

More sections
```

**Test Steps:**
- [ ] Create page with above content
- [ ] Save and view
- [ ] TOC plugin executes and shows sections
- [ ] TOC links work (click to jump)
- [ ] Markdown headings render as proper HTML headings

**Expected:** Working table of contents with clickable navigation

---

### 4. Variables Testing

**Test Page:** TestPage_Variables

**Content:**
```markdown
## User Info

- Username: [{$username}]
- Application: [{$applicationname}]
- Current Page: [{$pagename}]

## Escaped Example

This shows literal syntax: [[{$username}]
```

**Test Steps:**
- [ ] Create page with above content
- [ ] Save and view
- [ ] Variables expand to correct values
- [ ] Username shows logged-in user
- [ ] Application name shows "amdWiki"
- [ ] Page name shows "TestPage_Variables"
- [ ] Escaped syntax shows literal text `[{$username}]`

**Expected:** All variables resolved, escaped syntax remains literal

---

### 5. Plugins Testing

**Test Page:** TestPage_Plugins

**Content:**
```markdown
## Current Time

[{CurrentTime}]

## Table of Contents

[{TOC}]

## Custom Plugins

[{YourPlugin param1="value"}]
```

**Test Steps:**
- [ ] Create page with available plugins
- [ ] Save and view
- [ ] Plugins execute correctly
- [ ] Plugin output renders as HTML
- [ ] No raw plugin syntax visible

**Expected:** All plugins execute and render output

---

### 6. Wiki Links Testing

**Test Page:** TestPage_Links

**Content:**
```markdown
## Internal Links

- [HomePage]
- [Features]
- [NonExistentPage]

## Link with Text

- [HomePage|Go to home]
- [About|Learn more]

## Mixed with Lists

1. Visit [HomePage]
2. Read [Features]
3. Check [NonExistentPage]
```

**Test Steps:**
- [ ] Create page with above content
- [ ] Save and view
- [ ] Existing pages link correctly (no red styling)
- [ ] Non-existent pages show as red links
- [ ] Click links navigate correctly
- [ ] Link text displays correctly (not the target)

**Expected:** Working wiki links with proper red link detection

---

### 7. Markdown Tables Testing

**Test Page:** TestPage_Tables

**Content:**
```markdown
## Feature Comparison

| Feature | Status | Notes |
|---------|--------|-------|
| Variables | ✅ | [{$username}] works |
| Plugins | ✅ | All tested |
| Links | ✅ | [HomePage] works |

## With Wiki Links

| Page | Description |
|------|-------------|
| [HomePage] | Main page |
| [Features] | Feature list |
```

**Test Steps:**
- [ ] Create page with markdown tables
- [ ] Save and view
- [ ] Tables render correctly with proper styling
- [ ] Headers styled differently from body
- [ ] Wiki links work inside tables
- [ ] Variables expand inside tables

**Expected:** Proper table rendering with working wiki syntax inside cells

---

### 8. Code Blocks Testing

**Test Page:** TestPage_Code

**Content:**
````markdown
## Code Examples

### JavaScript

```javascript
const user = [{$username}];
const link = [HomePage];
const plugin = [{TOC}];
```

### Inline Code

Use `[{$var}]` for variables and `[Link]` for links.

## Mixed Content

User: [{$username}]

```bash
echo "Hello [{$username}]"
```

Page: [{$pagename}]
````

**Test Steps:**
- [ ] Create page with code blocks
- [ ] Save and view
- [ ] Code blocks preserve JSPWiki syntax literally (not expanded)
- [ ] Inline code preserves syntax literally
- [ ] JSPWiki syntax OUTSIDE code blocks expands correctly

**Expected:** Code blocks show literal syntax, surrounding content processes normally

---

### 9. Escaped Syntax Testing

**Test Page:** TestPage_Escaped

**Content:**
```markdown
## Escaped Variables

- Literal: [[{$username}]
- Expanded: [{$username}]

## Escaped Plugins

- Literal: [[{TOC}]
- Expanded: [{TOC}]

## Escaped Links

- Literal: [[[HomePage]]
- Expanded: [HomePage]

## Issue #110 Regression

This was the original bug: [[{$applicationname}] : [{$applicationname}]

Expected: [{$applicationname}] : amdWiki
```

**Test Steps:**
- [ ] Create page with escaped syntax
- [ ] Save and view
- [ ] Escaped syntax shows literally (with one `[` removed)
- [ ] Non-escaped syntax expands correctly
- [ ] Issue #110 renders correctly (literal, colon, expanded)

**Expected:** Escaped syntax preserved, non-escaped expanded

---

### 10. Mixed Complex Page

**Test Page:** TestPage_Complex

**Content:**
```markdown
# Welcome to [{$applicationname}]

Current user: [{$username}]

## Table of Contents

[{TOC}]

## Features

- **Variables**: [{$username}] is logged in
- **Plugins**: See table below
- **Links**: Visit [HomePage] or [Features]

### Feature Table

| Feature | Example | Status |
|---------|---------|--------|
| Variables | [{$pagename}] | ✅ |
| Links | [HomePage] | ✅ |
| Plugins | [{CurrentTime}] | ✅ |

## Code Examples

```javascript
// JSPWiki syntax in code (should not process)
const user = [{$username}];
const page = [HomePage];
```

## External Links

- [Google](https://google.com)
- [GitHub](https://github.com)

## Special Cases

- Escaped: [[{$var}]
- Normal: [{$username}]
- Red link: [NonExistent]

## Lists with Links

1. Go to [HomePage]
2. Read [Features]
3. Check [[escaped link]]
```

**Test Steps:**
- [ ] Create page with all features combined
- [ ] Save and view
- [ ] All markdown renders correctly (headings, lists, tables, code)
- [ ] All JSPWiki syntax works (variables, plugins, links)
- [ ] Code blocks preserve syntax literally
- [ ] Escaped syntax remains literal
- [ ] External markdown links work
- [ ] Red links styled correctly
- [ ] No placeholders visible
- [ ] No console errors

**Expected:** Everything works together without conflicts

---

### 11. Edit/Preview Workflow

**Test Steps:**
- [ ] Create new page
- [ ] Enter test content (mix of markdown and JSPWiki)
- [ ] Click "Preview" (if available)
- [ ] Preview renders correctly
- [ ] Edit again
- [ ] Save page
- [ ] View saved page
- [ ] Rendering matches preview

**Expected:** Consistent rendering in preview and view modes

---

### 12. Cache Behavior

**Test Steps:**
- [ ] View a page (first load)
- [ ] Note page load time
- [ ] Refresh page (cached load)
- [ ] Note page load time (should be faster)
- [ ] Edit page and save
- [ ] View page (cache should be invalidated)
- [ ] Content reflects changes immediately

**Expected:** Cache improves performance, invalidates on edit

---

### 13. Browser Console Check

**Test Steps:**
- [ ] Open browser developer console
- [ ] Navigate to various test pages
- [ ] Check for JavaScript errors
- [ ] Check for warnings
- [ ] Check network tab for failed requests

**Expected:** No errors or warnings in console

---

### 14. Server Logs Check

**Test Steps:**
- [ ] View server logs (`pm2 logs` or console)
- [ ] Navigate to various test pages
- [ ] Check for parsing errors
- [ ] Check for warnings
- [ ] Check for stack traces

**Expected:** Clean logs with only info messages

---

### 15. Performance Testing

**Test Pages:** Create pages of various sizes

**Test Steps:**
- [ ] Small page (<1KB): Load time <100ms
- [ ] Medium page (~5KB): Load time <200ms
- [ ] Large page (>10KB): Load time <500ms
- [ ] Page with 50+ links: Renders quickly
- [ ] Page with 10+ plugins: Executes in <1s

**Expected:** Fast rendering even for large/complex pages

---

## Issue-Specific Regression Tests

### Issue #110: Escaping Bug

**Content:**
```markdown
[[{$applicationname}] : [{$applicationname}]
```

**Expected:** `[{$applicationname}] : amdWiki`

**Test:**
- [ ] Renders correctly (escaped, colon, expanded)
- [ ] No parsing errors
- [ ] No double-escaping

---

### Issue #93/#114: Heading Bug

**Content:**
```markdown
## Features
### Subheading
```

**Expected:** `<h2>Features</h2>` and `<h3>Subheading</h3>`

**Test:**
- [ ] Headings render as proper HTML tags
- [ ] NOT rendered as list items (that was the bug)
- [ ] Heading IDs generated by Showdown

---

## Test Results Template

### Test Session Info

- **Date:** ___________
- **Tester:** ___________
- **Environment:** ___________
- **Browser:** ___________
- **Server Version:** ___________

### Results Summary

| Test Section | Status | Notes |
|--------------|--------|-------|
| HomePage | ☐ Pass ☐ Fail | |
| LeftMenu | ☐ Pass ☐ Fail | |
| TOC Plugin | ☐ Pass ☐ Fail | |
| Variables | ☐ Pass ☐ Fail | |
| Plugins | ☐ Pass ☐ Fail | |
| Wiki Links | ☐ Pass ☐ Fail | |
| Markdown Tables | ☐ Pass ☐ Fail | |
| Code Blocks | ☐ Pass ☐ Fail | |
| Escaped Syntax | ☐ Pass ☐ Fail | |
| Mixed Complex | ☐ Pass ☐ Fail | |
| Edit/Preview | ☐ Pass ☐ Fail | |
| Cache Behavior | ☐ Pass ☐ Fail | |
| Console Errors | ☐ Pass ☐ Fail | |
| Server Logs | ☐ Pass ☐ Fail | |
| Performance | ☐ Pass ☐ Fail | |
| Issue #110 | ☐ Pass ☐ Fail | |
| Issue #93/114 | ☐ Pass ☐ Fail | |

### Issues Found

| Issue | Severity | Description | Steps to Reproduce |
|-------|----------|-------------|-------------------|
| | | | |

### Sign-Off

All tests passing: ☐ Yes ☐ No

**Tester Signature:** ___________
**Date:** ___________

---

## Acceptance Criteria

✅ **For Phase 5 to be considered complete:**

- [ ] All manual QA tests pass
- [ ] No console errors during testing
- [ ] No server errors during testing
- [ ] All 150+ automated tests passing
- [ ] Performance targets met (<50ms per page)
- [ ] No regressions from issues #110, #93, #114
- [ ] Documentation updated
- [ ] QA sign-off received

## Next Steps After QA

Once all tests pass:

1. **Phase 6: Production Integration**
   - Update RenderingManager to use `parseWithDOMExtraction()` by default
   - Add feature flag for gradual rollout
   - Monitor production metrics

2. **Phase 7: Cleanup & Documentation**
   - Remove old 7-phase parser code
   - Update API documentation
   - Close related issues

## References

- Issue #119: Phase 5 - Comprehensive Testing
- Issue #114: WikiDocument DOM Solution (Epic)
- Issue #110: Markdown heading bug
- Issue #93: Original DOM migration
- [WikiDocument DOM Architecture](../architecture/WikiDocument-DOM-Architecture.md)
- [Automated Test Results](../../src/parsers/__tests__/)
