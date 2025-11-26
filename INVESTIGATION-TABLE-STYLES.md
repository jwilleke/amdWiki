# Investigation: Table Styles Not Working

**Date**: 2025-11-26
**Issue**: JSPWiki-style table directives (`%%table-striped`, etc.) are not rendering correctly
**Files**:
- `pages/a8b9c0d1-e2f3-4a5b-6c7d-8e9f0a1b2c3d.md` (Table Styles Demo - KEEP)
- `pages/8dbcbdd3-453d-43d4-bd53-f85d9eb17a32.md` (Table Examples - DUPLICATE, can delete)

## What Should Work

JSPWiki-style table syntax:
```
%%table-striped
|| Name || Age || City ||
| John | 30 | NYC |
| Jane | 25 | LA |
/%
```

Should render as:
```html
<table class="table table-striped">
  <thead>
    <tr><th>Name</th><th>Age</th><th>City</th></tr>
  </thead>
  <tbody>
    <tr><td>John</td><td>30</td><td>NYC</td></tr>
    <tr><td>Jane</td><td>25</td><td>LA</td></tr>
  </tbody>
</table>
```

## Code Analysis

### JSPWikiPreprocessor (src/parsers/handlers/JSPWikiPreprocessor.js)

**Status**: ✅ Code looks correct

The preprocessor:
1. **Runs in Phase 1** (priority 95) - Before markdown processing
2. **Parses `%%.../%` blocks** with proper nesting support (lines 61-127)
3. **Detects table classes** (lines 34-39, 173-185):
   - sortable, table-sort, table-filter
   - zebra-table, table-striped, table-hover
   - table-fit, table-bordered, table-sm, table-responsive
   - table-condensed

4. **Processes JSPWiki tables** (lines 106-119, 246-310):
   - Detects `||` for headers
   - Detects `|` for body rows
   - Applies accumulated classes from nested `%%` blocks
   - Generates proper HTML `<table>` with classes

5. **Registered properly** in MarkupParser.js (line 253)

## Possible Causes

### 1. **Handler Not Running**
- Check if JSPWikiPreprocessor is actually being invoked
- Verify handler registration in MarkupParser initialization
- Check console logs for "📋 JSPWikiPreprocessor registered successfully"

### 2. **Content Processing Order**
- WikiDocument DOM system might be intercepting before JSPWikiPreprocessor runs
- Check if content is being passed through MarkupParser at all
- Verify Phase 1 handlers are being called

### 3. **Regex Pattern Not Matching**
- The pattern `/^\s*%%([a-zA-Z0-9_-]+)\s*$/` might not match the input
- Extra whitespace or characters could break matching
- Check raw markdown content format

### 4. **CSS Classes Missing**
- Even if HTML is correct, CSS might not be loaded
- Check if Bootstrap table classes are available
- Verify `table-striped`, `table-hover`, etc. have CSS definitions

### 5. **WikiDocument DOM Taking Over**
- WikiDocument system might be converting tables before JSPWiki syntax is processed
- Check rendering pipeline order
- Verify DOM parser isn't transforming content prematurely

## Debugging Steps

### Step 1: Check if Preprocessor is Running
```javascript
// In JSPWikiPreprocessor.process()
console.log('[JSPWikiPreprocessor] Processing content:', content.substring(0, 100));
```

### Step 2: Test Pattern Matching
```javascript
// Test if %%table-striped is being detected
const testLine = "%%table-striped";
const match = /^\s*%%([a-zA-Z0-9_-]+)\s*$/.test(testLine);
console.log('[JSPWikiPreprocessor] Pattern match:', match);
```

### Step 3: Check HTML Output
View page source to see if:
- Tables have `class="table table-striped"`
- Or still have raw `%%table-striped` in output

### Step 4: Verify CSS
Check browser dev tools:
- Are table classes defined?
- Are they being applied?
- Check for CSS conflicts

### Step 5: Check Rendering Pipeline
```bash
# Search for where tables are being processed
grep -r "parseTable\|table-striped" src/
```

## Recommended Fix

1. **Add debug logging** to JSPWikiPreprocessor.process()
2. **Test with simple example**:
   ```
   %%table-striped
   || A || B ||
   | 1 | 2 |
   /%
   ```
3. **Check browser console** for any JavaScript errors
4. **Verify CSS is loaded** (check Network tab for CSS files)
5. **Test on a fresh page** to rule out caching issues

## Quick Test

Create a new page with just:
```markdown
---
title: Table Style Test
---

%%table-striped
|| Name || Value ||
| Test | 123 |
/%
```

If this doesn't work, the issue is in:
- MarkupParser not calling JSPWikiPreprocessor
- Or JSPWikiPreprocessor not detecting the syntax
- Or CSS not being applied

## Related Files

- `src/parsers/handlers/JSPWikiPreprocessor.js` - Main processor
- `src/parsers/MarkupParser.js` - Registration (line 253)
- `docs/planning/JSPWiki-Docs/JSPWiki-Table-Styles.md` - Documentation
- `docs/planning/JSPWiki-Docs/jspwiki-styling-guide.md` - Style guide

## Next Actions

1. [ ] Add console.log to JSPWikiPreprocessor.process()
2. [ ] Test with minimal example page
3. [ ] Check browser dev tools for HTML output
4. [ ] Verify CSS classes are defined
5. [ ] Check if WikiDocument DOM is interfering
6. [ ] Review rendering pipeline order

## Status

**Current**: 🔴 Not working - table styles not being applied
**Expected**: 🟢 Should apply Bootstrap classes and custom table styles
**Priority**: High - core JSPWiki compatibility feature
